/* Conservative label extraction: selecting a column and its base is always explicit. */
(function (root) {
  "use strict";
  const plain = (s) =>
    String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  function barcodeValue(raw, format = "") {
    let value = String(raw || "").replace(/\s/g, "");
    if (!/^\d+$/.test(value)) return null;
    if ((format === "upc_e" || format === 15) && value.length === 8) {
      const [system, a, b, c, d, e, last, check] = value;
      if (!["0", "1"].includes(system)) return null;
      const body =
        Number(last) <= 2
          ? system + a + b + last + "0000" + c + d + e
          : last === "3"
            ? system + a + b + c + "00000" + d + e
            : last === "4"
              ? system + a + b + c + d + "00000" + e
              : system + a + b + c + d + e + "0000" + last;
      value = body + check;
    }
    if (![8, 12, 13, 14].includes(value.length)) return null;
    const body = value.slice(0, -1).split("").reverse();
    const sum = body.reduce(
      (total, digit, i) => total + Number(digit) * (i % 2 === 0 ? 3 : 1),
      0,
    );
    return (10 - (sum % 10)) % 10 === Number(value.at(-1)) ? value : null;
  }
  function sameBarcode(a, b) {
    const x = barcodeValue(a),
      y = barcodeValue(b);
    return !!x && !!y && x.padStart(14, "0") === y.padStart(14, "0");
  }
  const labels = {
    kcal: /^(?:valor\s+energetico|energia|energy)(?:\b|\s)/,
    p: /^proteinas?\b/,
    c: /^carboidratos?\b/,
    f: /^(?:gorduras?\s+totais|lipidios?\s+totais|total\s+fat)\b/,
  };
  function numericValue(raw) {
    const value = raw.replace(/\s/g, "");
    if (value.includes(","))
      return Number(value.replace(/\./g, "").replace(",", "."));
    if (/^\d{1,3}(?:\.\d{3})+$/.test(value))
      return Number(value.replace(/\./g, ""));
    return Number(value);
  }
  function parseLabelText(text) {
    const rows = { kcal: [], p: [], c: [], f: [] },
      warnings = [],
      sourceLines = {};
    const header = String(text || "")
      .split(/\r?\n/)
      .map(plain)
      .find((line) => /%\s*vd\b/.test(line) && /\d\s*(?:g|ml)\b/.test(line));
    const nutrientColumns = header
      ? [...header.matchAll(/\b\d+(?:[.,]\d+)?\s*(?:g|ml)\b/g)].length
      : null;
    for (const line of String(text || "").split(/\r?\n/)) {
      const normalized = plain(line)
        .trim()
        .replace(/^[|!\s]+/, "");
      const key = Object.keys(labels).find((k) => labels[k].test(normalized));
      if (!key) continue;
      if (sourceLines[key]) {
        warnings.push(
          "Mais de uma linha de " + key + " foi identificada. Confira o texto.",
        );
        rows[key] = [];
        continue;
      }
      sourceLines[key] = line.trim();
      const tail = normalized
        .replace(labels[key], "")
        .replace(/\([^)]*\)/g, " ");
      const defaultUnit =
        key === "kcal"
          ? /\(\s*kj\s*\)/.test(normalized)
            ? "kj"
            : "kcal"
          : /\(\s*mg\s*\)/.test(normalized)
            ? "mg"
            : "g";
      const tokens = [
        ...tail.matchAll(
          /(<\s*)?(-?\d+(?:[.,]\d+)*|—|--|\bna\b)(?:\s*)(kcal|kj|mg|g|%)?/g,
        ),
      ];
      if (
        key === "kcal" &&
        /\([^)]*kj[^)]*kcal|\([^)]*kcal[^)]*kj/.test(normalized) &&
        !tokens.some((t) => t[3] === "kcal" || t[3] === "kj")
      ) {
        rows[key] = tokens.filter((t) => t[3] !== "%").map(() => null);
        warnings.push(
          "A linha de energia mistura kJ e kcal. Confira as calorias manualmente.",
        );
        continue;
      }
      for (const token of tokens) {
        if (token[3] === "%") continue;
        const unknown = !!token[1] || ["—", "--", "na"].includes(token[2]);
        let value = unknown ? null : numericValue(token[2]),
          unit = token[3] || defaultUnit;
        if (key === "kcal" && unit === "kj") {
          // A row that also has explicit kcal is using both units for one value.
          if (tokens.some((t) => t[3] === "kcal")) continue;
          value = value === null ? null : value / 4.184;
        } else if (key !== "kcal" && unit === "mg")
          value = value === null ? null : value / 1000;
        if (value !== null && (!Number.isFinite(value) || value < 0))
          value = null;
        rows[key].push(value === null ? null : Math.round(value * 100) / 100);
      }
    }
    if (nutrientColumns)
      for (const key of Object.keys(rows))
        rows[key] = rows[key].slice(0, nutrientColumns);
    if (!Object.values(rows).some((values) => values.length))
      warnings.push(
        "Não consegui identificar nutrientes. Tente uma foto mais nítida ou corrija o texto.",
      );
    if (Object.values(rows).some((values) => values.includes(null)))
      warnings.push(
        "Valores ausentes ou com sinal “menor que” precisam de conferência.",
      );
    return { rows, warnings, sourceLines, text: String(text || "") };
  }
  function labelFood(
    parsed,
    { column, serving, unit, name = "", barcode } = {},
  ) {
    if (!Number.isInteger(column) || column < 0 || column > 3)
      throw Error(
        "Escolha a coluna de valores da tabela. Não use a coluna %VD.",
      );
    if (
      !["g", "ml"].includes(unit) ||
      !Number.isFinite(Number(serving)) ||
      Number(serving) <= 0
    )
      throw Error("Confirme a quantidade e a unidade da base do rótulo.");
    const values = {},
      unknownMacros = [];
    for (const key of ["kcal", "p", "c", "f"]) {
      const value = parsed.rows[key]?.[column];
      if (value === null || value === undefined) {
        values[key] = 0;
        unknownMacros.push(key);
      } else values[key] = value;
    }
    if (unknownMacros.length === 4)
      throw Error(
        "A coluna escolhida não tem nutrientes reconhecidos. Confira a tabela ou corrija o texto.",
      );
    return {
      name,
      category: "Rótulos fotografados",
      serving: Number(serving),
      unit,
      ...values,
      unknownMacros,
      source: "Tabela nutricional fotografada",
      note:
        "Tabela nutricional fotografada · coluna " +
        (column + 1) +
        " · base " +
        serving +
        " " +
        unit +
        " · confira com a embalagem",
      ...(barcodeValue(barcode) ? { barcode: barcodeValue(barcode) } : {}),
    };
  }
  const api = { barcodeValue, sameBarcode, parseLabelText, labelFood };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NutriLabel = api;
})(typeof window === "undefined" ? globalThis : window);
