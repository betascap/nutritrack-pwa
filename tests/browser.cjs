/* Real browser regression flows. Uses an isolated browser profile and synthetic data. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  http = require("node:http");
const root = path.resolve(__dirname, ".."),
  types = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".html": "text/html",
  };
const server = http.createServer((req, res) => {
  const p = new URL(req.url, "http://localhost").pathname;
  const file = path.resolve(root, "." + (p === "/" ? "/index.html" : p));
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader("Content-Type", types[path.extname(file)] || "text/plain");
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
const dbRead = (page, store) =>
  page.evaluate(
    (name) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("nutritrack_local_v1", 2);
        open.onsuccess = () => {
          const db = open.result,
            q = db.transaction(name).objectStore(name).getAll();
          q.onsuccess = () => {
            resolve(q.result);
            db.close();
          };
          q.onerror = () => reject(q.error);
        };
      }),
    store,
  );
const dbWrite = (page, store, value) =>
  page.evaluate(
    ({ store, value }) =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("nutritrack_local_v1", 2);
        open.onsuccess = () => {
          const db = open.result,
            tx = db.transaction(store, "readwrite");
          tx.objectStore(store).put(value);
          tx.oncomplete = () => {
            resolve();
            db.close();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { store, value },
  );
let checks = 0;
function pass(name) {
  checks++;
  console.log("PASS", name);
}
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  });
  const errors = [];
  try {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        serviceWorkers: "block",
      }),
      page = await context.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => {
      console.log("DIALOG", d.message());
      return d.accept();
    });
    await page.goto(base);
    await page.waitForSelector("#jumpDate");
    const catalog = await dbRead(page, "foods");
    assert.equal(
      new Set(catalog.filter((f) => f.tacoItemId).map((f) => f.tacoItemId))
        .size,
      597,
    );
    pass("existing TACO catalog preserved");
    await page.locator("#addFab").click();
    await page.locator("#foodSearch").fill("pao");
    assert.ok((await page.locator("[data-pick]").count()) > 9);
    pass("accent-free search displays more than nine results");
    await page.locator("#foodSearch").fill("frango grelhado");
    assert.ok(await page.locator("[data-pick]").count());
    await page.locator("[data-pick]").first().click();
    await page.locator("#qty").fill("150");
    await page.locator("#saveLog").evaluate((button) => {
      button.click();
      button.click();
    });
    await page.waitForSelector("#foodSearch:focus");
    assert.equal((await dbRead(page, "logs")).length, 1);
    pass("double click cannot duplicate a food entry");
    await page.locator("#closeModal").click();
    const entry = (await dbRead(page, "logs"))[0],
      food = (await dbRead(page, "foods")).find((f) => f.id === entry.foodId);
    await dbWrite(page, "foods", { ...food, kcal: 9999, customized: true });
    await page.reload();
    await page.waitForSelector("[data-edit]");
    await page.locator("[data-edit]").first().click();
    await page.locator("#qty").fill("300");
    await page.locator("#saveLog").click();
    await page.waitForSelector("#modal:not(.show)", { state: "attached" });
    assert.equal(
      (await dbRead(page, "logs"))[0].kcal,
      Math.round(entry.kcal * 2 * 10) / 10,
    );
    pass("editing scales the saved nutrition snapshot");
    await page.locator("[data-del-log]").first().click();
    await page.waitForSelector(".toast-action");
    assert.equal((await dbRead(page, "logs")).length, 0);
    await page.locator(".toast-action").click();
    await page.waitForSelector("[data-edit]");
    assert.equal((await dbRead(page, "logs")).length, 1);
    pass("remove and undo restore the exact entry");
    await page.locator('[data-page="settings"]').click();
    await page.locator('[data-setting="height"]').fill("177");
    await page.locator('[data-setting="targetWeight"]').fill("76");
    await page.locator('[data-setting="initialWeight"]').fill("82");
    await page.locator("#saveProfile").click();
    await page.waitForFunction(
      () => document.querySelector('[data-setting="height"]')?.value === "177",
    );
    let settings = (await dbRead(page, "settings"))[0];
    assert.equal(settings.height, 177);
    assert.equal(settings.targetWeight, 76);
    pass("profile persists height, target and starting weight");
    await page.locator("#manageFoods").click();
    await page.locator("#addFoodManage").click();
    await page.locator("#nfName").fill("Alimento de teste");
    await page.locator("#nfNote").fill("Rótulo de teste");
    await page.locator("#saveFood").click();
    assert.match(await page.locator("#toast").innerText(), /calorias/i);
    assert.ok(
      !(await dbRead(page, "foods")).some(
        (f) => f.name === "Alimento de teste",
      ),
    );
    await page.locator("#nfkcal").fill("100");
    await page.locator("#nfp").fill("0");
    await page.locator("#saveFood").click();
    await page.waitForSelector("#pickedId", { state: "attached" });
    let custom = (await dbRead(page, "foods")).find(
      (f) => f.name === "Alimento de teste",
    );
    assert.deepEqual(custom.unknownMacros, ["c", "f"]);
    pass("food validation distinguishes unknown macros from zero");
    await page.locator("#qty").fill("50");
    await page.locator("#saveLog").click();
    await page.waitForSelector("#foodSearch:focus");
    await page.locator("#closeModal").click();
    await page.locator('[data-page="today"]').click();
    assert.match(await page.locator(".macros").innerText(), /≥/);
    pass("incomplete totals are visible");
    await page.locator("#addFab").click();
    await page.locator("summary").click();
    await page.locator("#manualEntry").click();
    await page.locator("#manualKcal").fill("400");
    await page.locator("#saveManual").click();
    await page.waitForSelector("#modal:not(.show)", { state: "attached" });
    assert.deepEqual(
      (await dbRead(page, "logs")).find((l) => l.manualEntry).unknownMacros,
      ["p", "c", "f"],
    );
    pass("manual calories preserve unknown macros");
    await page.locator("#addFab").click();
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#modal.show").count(), 0);
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      "addFab",
    );
    pass("dialog Escape restores keyboard focus");
    // API responses are intercepted: no user data or test writes go to the external service.
    let calls = 0;
    await page.route("https://world.openfoodfacts.org/api/v2/**", (route) => {
      calls++;
      return route.fulfill({
        json: {
          count: 1,
          products: [
            {
              code: "7891234567890",
              product_name: "Iogurte de teste",
              brands: "Teste",
              nutriments: {
                "energy-kcal_100g": 60,
                proteins_100g: 4,
                carbohydrates_100g: 8,
                fat_100g: 1,
              },
            },
          ],
        },
      });
    });
    await page.locator('[data-page="settings"]').click();
    await page.locator("#productsSettings").click();
    await page.locator("#onlineQuery").fill("Teste");
    await page.locator("#onlineSearch").click();
    await page.waitForSelector("[data-online-pick]");
    await page.locator("[data-online-pick]").click();
    assert.match(await page.locator("#nfName").inputValue(), /Iogurte/);
    await page.locator("#saveFood").click();
    await page.waitForSelector("#pickedId", { state: "attached" });
    assert.ok(
      (await dbRead(page, "foods")).some((f) => f.id === "off-7891234567890"),
    );
    assert.equal(calls, 1);
    pass("brand lookup, label review and local product import");
    await page.locator("#closeModal").click();
    // Verify a plan round-trip keeps unknown macro metadata.
    const date = (await page.locator("#jumpDate").count())
      ? await page.locator("#jumpDate").inputValue()
      : new Date().toLocaleDateString("sv-SE");
    await dbWrite(page, "meals", {
      id: "unknown-meal",
      name: "Modelo incompleto",
      items: [{ foodId: custom.id, name: custom.name, qty: 100, unit: "g" }],
    });
    await page.reload();
    await page.waitForSelector("#jumpDate");
    await page.locator('[data-page="plan"]').click();
    await page.locator("#addPlannedMeal").click();
    await page.locator('[data-plan-template="unknown-meal"]').click();
    await page.waitForSelector("[data-plan-log]");
    assert.match(await page.locator("#app").innerText(), /totais incompletos/);
    await page.locator("[data-plan-log]").click();
    await page.waitForSelector("[data-plan-log]:disabled");
    assert.deepEqual(
      (await dbRead(page, "logs")).find((l) => l.sourcePlanItemId)
        .unknownMacros,
      ["c", "f"],
    );
    pass("planner preserves unknown macros in both plan and diary");
    // Backups retain imported source metadata and all legacy stores.
    await page.locator('[data-page="settings"]').click();
    const downloadPromise = page.waitForEvent("download");
    await page.locator("#exportJson").click();
    const download = await downloadPromise;
    const backup = JSON.parse(fs.readFileSync(await download.path(), "utf8"));
    assert.ok(backup.foods.find((f) => f.source === "Open Food Facts"));
    const before = await dbRead(page, "logs");
    await page
      .locator("#importFile")
      .setInputFiles({
        name: "backup.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(backup)),
      });
    await page.waitForFunction(
      () =>
        document.querySelector("#toast").textContent === "Backup restaurado",
    );
    assert.deepEqual(await dbRead(page, "logs"), before);
    pass("JSON export and restore retain records and product provenance");
    const invalid = { ...backup, foods: [{ ...backup.foods[0], serving: 0 }] };
    await page
      .locator("#importFile")
      .setInputFiles({
        name: "invalid.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify(invalid)),
      });
    await page.waitForTimeout(100);
    assert.deepEqual(await dbRead(page, "logs"), before);
    pass("invalid restore leaves existing records unchanged");
    // Every major screen is checked at narrow and wide widths, in both themes.
    for (const width of [320, 390, 1440])
      for (const dark of [false, true]) {
        await page.setViewportSize({ width, height: 900 });
        const current = (await dbRead(page, "settings"))[0];
        await dbWrite(page, "settings", { ...current, dark });
        await page.reload();
        await page.waitForSelector("#jumpDate");
        for (const tab of [
          "today",
          "plan",
          "calendar",
          "progress",
          "settings",
        ]) {
          await page.locator('[data-page="' + tab + '"]').click();
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            "overflow " + width + " " + tab + " " + dark,
          );
        }
      }
    pass("all five screens fit 320, 390 and 1440px in light and dark");
    // Screenshots are optional and stay outside the repository when a path is supplied.
    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      await page.setViewportSize({ width: 390, height: 844 });
      const current = (await dbRead(page, "settings"))[0];
      await dbWrite(page, "settings", { ...current, dark: false });
      await page.reload();
      await page.waitForSelector("#jumpDate");
      await page.screenshot({
        path: path.join(process.env.SCREENSHOT_DIR, "nutritrack-mobile.png"),
      });
      await page.locator("#addFab").click();
      await page.locator("#foodSearch").fill("pao");
      await page.screenshot({
        path: path.join(process.env.SCREENSHOT_DIR, "nutritrack-busca.png"),
      });
      await page.locator("#closeModal").click();
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.screenshot({
        path: path.join(process.env.SCREENSHOT_DIR, "nutritrack-desktop.png"),
      });
    }
    assert.deepEqual(errors, []);
    pass("no uncaught browser errors");
    await context.close();
    const offlineContext = await browser.newContext(),
      offlinePage = await offlineContext.newPage();
    await offlinePage.goto(base);
    await offlinePage.waitForSelector("#jumpDate");
    await offlinePage.evaluate(() => navigator.serviceWorker.ready);
    await offlinePage.waitForFunction(() => navigator.serviceWorker.controller);
    await offlineContext.setOffline(true);
    await offlinePage.reload();
    await offlinePage.waitForSelector("#jumpDate");
    await offlinePage.locator("#addFab").click();
    await offlinePage.locator("#foodSearch").fill("banana");
    assert.ok(await offlinePage.locator("[data-pick]").count());
    pass("installed shell, catalog and diary work after offline reload");
    await offlineContext.close();
    console.log(checks + " browser checks passed");
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  server.close();
  process.exitCode = 1;
});
