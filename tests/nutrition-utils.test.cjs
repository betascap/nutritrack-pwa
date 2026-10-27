const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  normalizeText,
  searchFoods,
  validNutrition,
  offProduct,
  adaptiveEstimate,
  normalizeLegacyFood,
} = require("../nutrition-utils.js");
test("normalizes known negative legacy source carbs without altering user foods", () => {
  assert.deepEqual(
    normalizeLegacyFood({ seed: true, tacoItemId: 288, c: -0.03 }),
    { seed: true, tacoItemId: 288, c: 0, sourceCarbohydrate: -0.03 },
  );
  assert.equal(normalizeLegacyFood({ id: "custom", c: -2 }).c, -2);
});
test("search ignores accents, punctuation and case", () =>
  assert.equal(normalizeText("PÃO, de Queijo!"), "pao de queijo"));
const foods = [
  { id: 1, name: "Frango, peito, grelhado", category: "Carnes" },
  {
    id: 2,
    name: "Pão francês",
    aliases: ["Pão, trigo, francês"],
    favorite: true,
    category: "Pães",
  },
  { id: 3, name: "Pão sem rótulo", category: "Pães", pendingLabel: true },
];
test("search matches terms in any order", () =>
  assert.deepEqual(
    searchFoods(foods, "grelhado frango").map((x) => x.id),
    [1],
  ));
test("ready, category and favorite filters compose", () =>
  assert.deepEqual(
    searchFoods(foods, "pao", {
      ready: true,
      category: "Pães",
      favorite: true,
    }).map((x) => x.id),
    [2],
  ));
test("unknown is distinct from zero", () =>
  assert.deepEqual(
    validNutrition({ serving: 100, kcal: 0, p: "", c: 0, f: 0 }),
    { serving: 100, kcal: 0, p: 0, c: 0, f: 0, unknownMacros: ["p"] },
  ));
test("requires calories and a positive base, rejects negative and infinite", () => {
  for (const v of [
    { serving: 0, kcal: 10 },
    { serving: 100, kcal: "" },
    { serving: 100, kcal: -1 },
    { serving: 100, kcal: Infinity },
    { serving: 100, kcal: 20, p: -1 },
  ])
    assert.throws(() => validNutrition(v));
});
test("supports decimal commas", () =>
  assert.equal(validNutrition({ serving: 100, kcal: "12,5" }).kcal, 12.5));
const product = {
  code: "7891234567890",
  product_name: "Iogurte",
  brands: "Marca",
  nutriments: {
    "energy-kcal_100g": 60,
    proteins_100g: 4,
    carbohydrates_100g: 8,
    fat_100g: 1,
  },
};
test("imports normalized 100g values, never serving values", () => {
  const food = offProduct({
    ...product,
    nutriments: { ...product.nutriments, "energy-kcal_serving": 120 },
  });
  assert.equal(food.kcal, 60);
  assert.equal(food.serving, 100);
  assert.equal(food.id, "off-7891234567890");
  assert.equal(food.unit, "g");
});
test("liquids retain ml base", () =>
  assert.equal(
    offProduct({ ...product, product_quantity_unit: "ml" }).unit,
    "ml",
  ));
test("kJ conversion and missing protein metadata", () => {
  const food = offProduct({
    ...product,
    nutriments: { "energy-kj_100g": 418.4, fat_100g: 0 },
  });
  assert.ok(Math.abs(food.kcal - 100) < 1e-9);
  assert.deepEqual(food.unknownMacros, ["p", "c"]);
});
test("incomplete and implausible products cannot import", () => {
  for (const p of [
    { ...product, nutriments: {} },
    { ...product, code: "bad" },
    { ...product, nutriments: { "energy-kcal_100g": 2000 } },
    { ...product, nutriments: { "energy-kcal_100g": 100, proteins_100g: 101 } },
  ])
    assert.equal(offProduct(p), null);
});
function sample() {
  const logs = [],
    plans = [],
    weights = [];
  for (let i = 0; i <= 14; i++) {
    const date = "2026-10-" + String(i + 1).padStart(2, "0");
    weights.push({ id: String(i), date, kg: 80 });
    if (i) {
      plans.push({ date, dayComplete: true });
      logs.push({ date, kind: "food", kcal: 2200 });
    }
  }
  return { logs, plans, weights };
}
test("adaptive estimate aligns intake and weigh-ins and excludes future records", () => {
  const x = sample();
  x.weights.push({ date: "2026-12-01", kg: 100 });
  assert.equal(
    adaptiveEstimate(x.logs, x.plans, x.weights, "2026-10-15").kcal,
    2200,
  );
});
test("adaptive estimate stays hidden with gaps and unknown energy", () => {
  const x = sample();
  assert.equal(
    adaptiveEstimate(x.logs, x.plans.slice(1), x.weights, "2026-10-15"),
    null,
  );
  x.logs[0].unknownMacros = ["kcal"];
  assert.equal(
    adaptiveEstimate(x.logs, x.plans, x.weights, "2026-10-15"),
    null,
  );
});
test("adaptive estimate accounts for weight slope within the same period", () => {
  const x = sample();
  x.weights.forEach((w, i) => (w.kg = 80 - i * 0.1));
  assert.equal(
    adaptiveEstimate(x.logs, x.plans, x.weights, "2026-10-15").kcal,
    2970,
  );
});
