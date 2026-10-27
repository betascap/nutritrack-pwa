/* Pure helpers shared by the app and regression tests. No network or storage. */
(function (root) {
  "use strict";
  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  const legacyNegativeCarbs = {
    288: -0.03,
    322: -0.05,
    337: -0.01,
    400: -0.02,
  };
  function normalizeLegacyFood(food) {
    // Four original analytical values round below zero. Preserve the raw value
    // for traceability, but do not subtract carbohydrates from a food diary.
    if (food?.seed && Number(food.c) === legacyNegativeCarbs[food.tacoItemId]) {
      return { ...food, c: 0, sourceCarbohydrate: Number(food.c) };
    }
    return food;
  }
  function searchFoods(
    foods,
    query,
    { favorite = false, category = "", ready = false } = {},
  ) {
    const q = normalizeText(query),
      terms = q.split(" ").filter(Boolean);
    return foods
      .filter(
        (food) =>
          (!favorite || food.favorite) &&
          (!category || food.category === category) &&
          (!ready || (!food.pendingLabel && !food.unusable)),
      )
      .map((food) => {
        const name = normalizeText(food.name),
          text = normalizeText(
            [food.name, food.legacyName, ...(food.aliases || [])].join(" "),
          );
        return {
          food,
          match: terms.every((term) => text.includes(term)),
          score:
            (name === q ? 100 : name.startsWith(q) && q ? 50 : 0) +
            (food.favorite ? 5 : 0) -
            (food.pendingLabel || food.unusable ? 20 : 0),
        };
      })
      .filter((x) => x.match)
      .sort(
        (a, b) =>
          b.score - a.score || a.food.name.localeCompare(b.food.name, "pt-BR"),
      )
      .map((x) => x.food);
  }
  function validNutrition(values) {
    const base = Number(values.serving);
    if (!Number.isFinite(base) || base <= 0)
      throw Error("Informe uma quantidade base maior que zero.");
    const result = { serving: base, unknownMacros: [] };
    for (const key of ["kcal", "p", "c", "f"]) {
      const raw = String(values[key] ?? "")
        .trim()
        .replace(",", ".");
      if (!raw) {
        if (key === "kcal")
          throw Error(
            "Informe as calorias. Use 0 somente se o rótulo indicar zero.",
          );
        result[key] = 0;
        result.unknownMacros.push(key);
        continue;
      }
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0)
        throw Error(
          "Os valores nutricionais devem ser iguais ou maiores que zero.",
        );
      result[key] = n;
    }
    return result;
  }
  function offProduct(product) {
    if (
      !product ||
      !/^\d{8,14}$/.test(String(product.code)) ||
      !String(product.product_name || product.product_name_pt || "").trim()
    )
      return null;
    const n = product.nutriments || {},
      number = (key) => {
        const raw = n[key];
        return raw !== "" &&
          raw !== null &&
          raw !== undefined &&
          Number.isFinite(Number(raw)) &&
          Number(raw) >= 0
          ? Number(raw)
          : null;
      };
    let kcal = number("energy-kcal_100g");
    if (kcal === null && number("energy-kj_100g") !== null)
      kcal = number("energy-kj_100g") / 4.184;
    if (kcal === null) return null;
    const unit =
      /100\s*ml/i.test(product.nutrition_data_per || "") ||
      product.product_quantity_unit === "ml"
        ? "ml"
        : "g";
    const values = {
      kcal,
      p: number("proteins_100g"),
      c: number("carbohydrates_100g"),
      f: number("fat_100g"),
    };
    if (
      kcal > 1000 ||
      Object.values(values).some((v) => v !== null && v < 0) ||
      ["p", "c", "f"].some((k) => values[k] > 100)
    )
      return null;
    return {
      id: "off-" + product.code,
      name:
        String(product.product_name_pt || product.product_name).trim() +
        (product.brands ? " · " + product.brands : ""),
      category: "Produtos por marca",
      unit,
      serving: 100,
      ...Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v ?? 0]),
      ),
      unknownMacros: Object.keys(values).filter((k) => values[k] === null),
      source: "Open Food Facts",
      sourceUrl: "https://world.openfoodfacts.org/product/" + product.code,
      barcode: String(product.code),
      note: "Open Food Facts (ODbL) · confira o rótulo e a base de 100 g/ml",
      favorite: false,
    };
  }
  function adaptiveEstimate(logs, plans, weights, endDate) {
    const MIN_COVERAGE = 0.7;
    const MIN_COMPLETE_DAYS = 10;
    const sorted = weights
      .filter((w) => w.date <= endDate)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted.at(-1);
    if (!last) return null;
    const start = new Date(last.date + "T12:00:00Z");
    start.setUTCDate(start.getUTCDate() - 28);
    const sample = sorted.filter(
      (w) => w.date >= start.toISOString().slice(0, 10),
    );
    if (sample.length < 10) return null;
    const first = sample[0],
      days = Math.round(
        (new Date(last.date + "T12:00:00Z") -
          new Date(first.date + "T12:00:00Z")) /
          864e5,
      );
    if (days < 14) return null;
    const completed = new Set(
      plans.filter((p) => p.dayComplete).map((p) => p.date),
    );
    let energy = 0,
      completeDays = 0;
    for (let i = 1; i <= days; i++) {
      const date = new Date(first.date + "T12:00:00Z");
      date.setUTCDate(date.getUTCDate() + i);
      const key = date.toISOString().slice(0, 10),
        entries = logs.filter((l) => l.date === key && l.kind === "food");
      if (
        !completed.has(key) ||
        !entries.length ||
        entries.some((l) => l.unknownMacros?.includes("kcal"))
      )
        continue;
      energy += entries.reduce((sum, l) => sum + Number(l.kcal), 0);
      completeDays++;
    }
    const coverage = completeDays / days;
    if (coverage < MIN_COVERAGE || completeDays < MIN_COMPLETE_DAYS)
      return null;
    // Linear regression uses all weigh-ins in the same interval as food intake.
    const points = sample.map((w) => ({
      x:
        (new Date(w.date + "T12:00:00Z") -
          new Date(first.date + "T12:00:00Z")) /
        864e5,
      y: Number(w.kg),
    }));
    const mx = points.reduce((s, p) => s + p.x, 0) / points.length,
      my = points.reduce((s, p) => s + p.y, 0) / points.length;
    const slope =
      points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) /
      points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
    const kcal = Math.round(energy / completeDays - slope * 7700);
    return Number.isFinite(kcal) && kcal > 0
      ? {
          kcal,
          days,
          start: first.date,
          end: last.date,
          completeDays,
          coverage: Number(coverage.toFixed(2)),
        }
      : null;
  }
  const api = {
    normalizeText,
    searchFoods,
    validNutrition,
    offProduct,
    adaptiveEstimate,
    normalizeLegacyFood,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NutriTools = api;
})(typeof window === "undefined" ? globalThis : window);
