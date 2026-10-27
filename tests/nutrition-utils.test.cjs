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
function sample(days = 14) {
  const logs = [],
    plans = [],
    weights = [];
  for (let i = 0; i <= days; i++) {
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
// Replaces the old "adaptive estimate stays hidden with gaps and unknown energy"
// expectation: missing/incomplete days now reduce coverage instead of aborting.
test("adaptive estimate tolerates one missing complete day", () => {
  const x = sample();
  const result = adaptiveEstimate(
    x.logs,
    x.plans.slice(1),
    x.weights,
    "2026-10-15",
  );
  assert.equal(result.kcal, 2200);
  assert.equal(result.completeDays, result.days - 1);
  assert.equal(result.coverage, 0.93);
});
test("adaptive estimate excludes an entire day with unknown energy from the mean", () => {
  const x = sample();
  x.logs[0].kcal = 9000;
  x.logs[0].unknownMacros = ["kcal"];
  x.logs.push({ date: x.logs[0].date, kind: "food", kcal: 4000 });
  const result = adaptiveEstimate(x.logs, x.plans, x.weights, "2026-10-15");
  assert.equal(result.kcal, 2200);
  assert.equal(result.completeDays, result.days - 1);
  assert.equal(result.coverage, 0.93);
});
test("adaptive estimate stays hidden below 70 percent coverage", () => {
  const x = sample(20);
  // 13 eligible days out of 20 = 65%; there are still at least 10 complete days.
  assert.equal(
    adaptiveEstimate(x.logs, x.plans.slice(7), x.weights, "2026-10-21"),
    null,
  );
});
test("adaptive estimate stays hidden below ten eligible days despite 75 percent coverage", () => {
  const x = sample(12),
    plans = x.plans.slice(3);
  assert.equal(plans.length, 9);
  assert.equal(plans.length / 12, 0.75);
  // With an interval >=14 days, >=70% coverage already implies >=10 eligible
  // days. This 9/12 fixture meets coverage but is rejected by the minimum
  // interval; it cannot isolate MIN_COMPLETE_DAYS under the other constraints.
  assert.equal(adaptiveEstimate(x.logs, plans, x.weights, "2026-10-13"), null);
});
test("adaptive estimate accepts exactly 70 percent coverage", () => {
  const x = sample(20);
  const result = adaptiveEstimate(
    x.logs,
    x.plans.slice(6),
    x.weights,
    "2026-10-21",
  );
  assert.equal(result.kcal, 2200);
  assert.equal(result.completeDays, 14);
  assert.equal(result.coverage, 0.7);
});
test("adaptive estimate averages only eligible days in a hand-calculated interval", () => {
  const x = sample();
  x.logs.forEach((log) => (log.kcal = 2100));
  x.logs[0].kcal = 99999; // This day's completion mark is removed below.
  x.logs[1].kcal = 6000;
  // Flat weight -> slope 0. One of 14 days is missing. The 13 eligible days
  // supply 12*2100 + 6000 = 31200 kcal; 31200/13 - 0*7700 = 2400 kcal/day.
  const result = adaptiveEstimate(
    x.logs,
    x.plans.slice(1),
    x.weights,
    "2026-10-15",
  );
  assert.equal(result.kcal, 2400);
  assert.equal(result.days, 14);
  assert.equal(result.completeDays, 13);
});
test("adaptive estimate accounts for weight slope within the same period", () => {
  const x = sample();
  x.weights.forEach((w, i) => (w.kg = 80 - i * 0.1));
  assert.equal(
    adaptiveEstimate(x.logs, x.plans, x.weights, "2026-10-15").kcal,
    2970,
  );
});
