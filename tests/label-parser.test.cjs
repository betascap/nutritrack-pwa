const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  barcodeValue,
  sameBarcode,
  parseLabelText,
  labelFood,
} = require("../label-parser.js");
test("validates product checksums and rejects arbitrary codes", () => {
  for (const code of [
    "3017620422003",
    "96385074",
    "036000291452",
    "00012345600012",
  ])
    assert.equal(barcodeValue(code), code);
  for (const code of [
    "7891234567890",
    "123",
    "https://example.com",
    "3017620422004",
  ])
    assert.equal(barcodeValue(code), null);
});
test("UPC-A and EAN-13 with a leading zero match the same saved product", () =>
  assert.ok(sameBarcode("036000291452", "0036000291452")));
test("UPC-E expands to a valid UPC-A identifier", () =>
  assert.equal(barcodeValue("04252614", "upc_e"), "042100005264"));
const modern =
  "INFORMAÇÃO NUTRICIONAL\nPorção: 30 g\n100 g   30 g    %VD\nValor energético (kcal) 400 120 6%\nCarboidratos (g) 60 18 6%\nProteínas (g) 20 6 12%\nGorduras totais (g) 10 3 5%\nGorduras saturadas (g) 4 1,2 6%\nAçúcares totais (g) 10 3\nAçúcares adicionados (g) 8 2,4";
test("extracts only energy, protein, carbohydrates and total fat", () => {
  const x = parseLabelText(modern);
  assert.deepEqual(x.rows, {
    kcal: [400, 120],
    p: [20, 6],
    c: [60, 18],
    f: [10, 3],
  });
});
test("known %VD header excludes daily percentages even when row percent signs are missing", () => {
  const rows = parseLabelText(
    "100 g   30 g   %VD\nValor energético (kcal) 400 120 6\nProteínas (g) 20 6 12",
  ).rows;
  assert.deepEqual(rows.kcal, [400, 120]);
  assert.deepEqual(rows.p, [20, 6]);
  assert.deepEqual(parseLabelText("30 g  %VD\nProteínas (g) 6 12").rows.p, [6]);
});
test("portion column keeps its stated base and is never silently treated as 100g", () => {
  const f = labelFood(parseLabelText(modern), {
    column: 1,
    serving: 30,
    unit: "g",
  });
  assert.equal(f.kcal, 120);
  assert.equal(f.p, 6);
  assert.equal(f.serving, 30);
  assert.equal(f.unit, "g");
});
test("base and column must be explicit", () => {
  assert.throws(() =>
    labelFood(parseLabelText(modern), { serving: 100, unit: "g" }),
  );
  assert.throws(() =>
    labelFood(parseLabelText(modern), { column: 0, serving: 0, unit: "g" }),
  );
  assert.throws(() =>
    labelFood(parseLabelText(modern), {
      column: 0,
      serving: 100,
      unit: "unidade",
    }),
  );
});
test("comma decimals and thousands do not lose their magnitude", () => {
  const x = parseLabelText("Valor energético (kcal) 1.050\nProteínas (g) 2,5");
  assert.equal(x.rows.kcal[0], 1050);
  assert.equal(x.rows.p[0], 2.5);
});
test("explicit kJ is converted once; kcal/kJ duplicates are not separate columns", () => {
  assert.equal(parseLabelText("Valor energético 418,4 kJ").rows.kcal[0], 100);
  assert.deepEqual(
    parseLabelText("Valor energético 120 kcal = 502 kJ").rows.kcal,
    [120],
  );
});
test("ambiguous energy units require correction", () => {
  const x = parseLabelText("Valor energético (kJ/kcal) 502 120");
  assert.deepEqual(x.rows.kcal, [null, null]);
  assert.ok(x.warnings.length);
});
test("unknown and lower-than values remain unknown, while zero is known", () => {
  const x = parseLabelText(
    "Valor energético (kcal) 50\nProteínas (g) —\nCarboidratos (g) <0,5\nGorduras totais (g) 0",
  );
  const f = labelFood(x, { column: 0, serving: 100, unit: "g" });
  assert.deepEqual(f.unknownMacros, ["p", "c"]);
  assert.equal(f.f, 0);
});
test("missing cells are not shifted into a different column", () => {
  assert.deepEqual(parseLabelText("Proteínas (g) -- 4").rows.p, [null, 4]);
});
test("negative OCR values are not made positive", () =>
  assert.deepEqual(parseLabelText("Proteínas (g) -5").rows.p, [null]));
test("mg macro values are converted to grams and liquids retain ml", () => {
  const x = parseLabelText("Valor energético (kcal) 10\nProteínas (mg) 500");
  const f = labelFood(x, { column: 0, serving: 100, unit: "ml" });
  assert.equal(f.p, 0.5);
  assert.equal(f.unit, "ml");
});
test("duplicate rows require correction instead of selecting one silently", () => {
  const x = parseLabelText("Proteínas (g) 10\nProteínas (g) 2");
  assert.deepEqual(x.rows.p, []);
  assert.ok(x.warnings.length);
});
test("blank photos and empty selected columns cannot create a food", () => {
  assert.throws(() =>
    labelFood(parseLabelText(""), { column: 0, serving: 100, unit: "g" }),
  );
  assert.throws(() =>
    labelFood(parseLabelText(modern), { column: 3, serving: 100, unit: "g" }),
  );
});
