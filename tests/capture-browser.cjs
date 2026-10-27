/* Real ZXing and Tesseract engines; generated fixtures, no private photos or physical camera. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const http = require("node:http"),
  path = require("node:path"),
  fs = require("node:fs"),
  assert = require("node:assert/strict");
const root = path.resolve(__dirname, ".."),
  mime = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".gz": "application/gzip",
    ".html": "text/html",
    ".svg": "image/svg+xml",
    ".webmanifest": "application/manifest+json",
  };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost"),
    file = path.resolve(
      root,
      "." + (url.pathname === "/" ? "/index.html" : url.pathname),
    );
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] || "application/octet-stream",
    );
    res.end(fs.readFileSync(file));
  } catch {
    res.writeHead(404).end();
  }
});
const read = (page, store) =>
  page.evaluate(
    (store) =>
      new Promise((resolve) => {
        const req = indexedDB.open("nutritrack_local_v1", 2);
        req.onsuccess = () => {
          const db = req.result,
            q = db.transaction(store).objectStore(store).getAll();
          q.onsuccess = () => {
            resolve(q.result);
            db.close();
          };
        };
      }),
    store,
  );
let count = 0;
const pass = (message) => {
  count++;
  console.log("PASS", message);
};
function fixtureInPage() {
  const barcode = document.createElement("canvas");
  barcode.width = 720;
  barcode.height = 380;
  const context = barcode.getContext("2d");
  context.fillStyle = "white";
  context.fillRect(0, 0, 720, 380);
  const code = "3017620422003",
    L = [
      "0001101",
      "0011001",
      "0010011",
      "0111101",
      "0100011",
      "0110001",
      "0101111",
      "0111011",
      "0110111",
      "0001011",
    ],
    G = [
      "0100111",
      "0110011",
      "0011011",
      "0100001",
      "0011101",
      "0111001",
      "0000101",
      "0010001",
      "0001001",
      "0010111",
    ],
    parity = [
      "LLLLLL",
      "LLGLGG",
      "LLGGLG",
      "LLGGGL",
      "LGLLGG",
      "LGGLLG",
      "LGGGLL",
      "LGLGLG",
      "LGLGGL",
      "LGGLGL",
    ];
  let bits = "101";
  for (let i = 1; i <= 6; i++)
    bits += (parity[Number(code[0])][i - 1] === "L" ? L : G)[Number(code[i])];
  bits += "01010";
  for (let i = 7; i <= 12; i++)
    bits += L[Number(code[i])].replace(/[01]/g, (x) => (x === "0" ? "1" : "0"));
  bits += "101";
  context.fillStyle = "black";
  for (let i = 0; i < bits.length; i++)
    if (bits[i] === "1") context.fillRect(75 + i * 6, 30, 6, 275);
  context.font = "28px Arial";
  context.fillText(code, 230, 350);
  const label = document.createElement("canvas");
  label.width = 1450;
  label.height = 650;
  const ctx = label.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, label.width, label.height);
  ctx.fillStyle = "black";
  ctx.font = "bold 40px Arial";
  ctx.fillText("INFORMAÇÃO NUTRICIONAL", 35, 60);
  ctx.font = "32px Arial";
  ctx.fillText("Porção: 30 g", 35, 115);
  ctx.fillText("100 g", 900, 175);
  ctx.fillText("30 g", 1100, 175);
  ctx.fillText("%VD", 1290, 175);
  [
    ["Valor energético (kcal)", "400", "120", "6%"],
    ["Carboidratos (g)", "60", "18", "6%"],
    ["Proteínas (g)", "20", "6", "12%"],
    ["Gorduras totais (g)", "10", "3", "5%"],
  ].forEach((row, i) => {
    const y = 245 + i * 85;
    ctx.fillText(row[0], 35, y);
    ctx.fillText(row[1], 900, y);
    ctx.fillText(row[2], 1100, y);
    ctx.fillText(row[3], 1290, y);
  });
  window.__barcodeCanvas = barcode;
  return {
    barcode: barcode.toDataURL("image/png").split(",")[1],
    label: label.toDataURL("image/png").split(",")[1],
  };
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
  let page;
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    page = await context.newPage();
    const errors = [],
      external = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (!r.url().startsWith(base) && !r.url().startsWith("blob:"))
        external.push(r.url());
    });
    await page.goto(base);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    await page.waitForSelector("#jumpDate");
    const environmentScriptOrigins = await page.evaluate(() =>
      [...document.scripts]
        .map((s) => s.src)
        .filter(Boolean)
        .map((url) => new URL(url).origin)
        .filter((origin) => origin !== location.origin),
    );
    const fixtures = await page.evaluate(fixtureInPage);
    const barcodeFile = {
        name: "barcode.png",
        mimeType: "image/png",
        buffer: Buffer.from(fixtures.barcode, "base64"),
      },
      labelFile = {
        name: "nutrition.png",
        mimeType: "image/png",
        buffer: Buffer.from(fixtures.label, "base64"),
      };
    await page.route("https://world.openfoodfacts.org/api/v2/**", (route) =>
      route.fulfill({ json: { status: 0 } }),
    );
    await page.locator("#addFab").click();
    await page.locator("#scanFoodBarcode").click();
    await page.waitForSelector("#scanStatus");
    // Use the actual image decoder, regardless of the test machine's camera availability.
    await page.locator("#barcodeFile").setInputFiles(barcodeFile);
    await page.waitForSelector("#onlineQuery");
    assert.equal(
      await page.locator("#onlineQuery").inputValue(),
      "3017620422003",
    );
    await page.waitForSelector("#photoMissingProduct");
    pass("real barcode image decodes and missing product offers label photo");
    await page.locator("#photoMissingProduct").click();
    await page.locator("#labelPhotoFile").setInputFiles(labelFile);
    await page.waitForSelector("#labelPhotoArea:not(.hidden)");
    await page.locator("#readLabel").click();
    await page.waitForSelector("#labelColumn", { timeout: 90000 });
    assert.equal(
      (await read(page, "foods")).filter(
        (f) => f.source === "Tabela nutricional fotografada",
      ).length,
      0,
    );
    pass("real local OCR opens review without saving any food");
    await page.locator("#confirmLabel").click();
    assert.match(
      await page.locator("#reviewLabelStatus").innerText(),
      /Escolha a coluna/,
    );
    pass("OCR requires explicit column and serving basis");
    await page.locator("#labelFoodName").fill("Produto fotografado de teste");
    await page.locator("#labelColumn").selectOption("1");
    await page.locator("#labelBaseMode").selectOption("portion");
    await page.locator("#labelServing").fill("30");
    await page.locator("#confirmLabel").click();
    assert.equal(await page.locator("#nfBase").inputValue(), "30");
    assert.equal(await page.locator("#nfkcal").inputValue(), "120");
    assert.equal(await page.locator("#nfp").inputValue(), "6");
    assert.equal(await page.locator("#nfc").inputValue(), "18");
    assert.equal(await page.locator("#nff").inputValue(), "3");
    await page.locator("#saveFood").click();
    await page.waitForSelector("#pickedId", { state: "attached" });
    const food = (await read(page, "foods")).find(
      (f) => f.name === "Produto fotografado de teste",
    );
    assert.equal(food.serving, 30);
    assert.equal(food.kcal, 120);
    assert.equal(food.barcode, "3017620422003");
    assert.equal(food.source, "Tabela nutricional fotografada");
    pass(
      "OCR portion and barcode provenance persist after explicit confirmation",
    );
    await page.locator("#closeModal").click();
    await page.locator("#addFab").click();
    await page.evaluate(() => {
      window.__originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(
        navigator.mediaDevices,
      );
      navigator.mediaDevices.getUserMedia = async () => {
        throw new DOMException("denied", "NotAllowedError");
      };
    });
    await page.locator("#scanFoodBarcode").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#scanStatus")
        ?.textContent.includes("não foi permitida"),
    );
    await page.locator("#barcodeManual").click();
    assert.equal(await page.locator("#onlineMode").inputValue(), "barcode");
    pass("camera permission denial keeps typed-code fallback");
    await page.locator("#closeModal").click();
    // An actual video stream containing barcode frames exercises the live scanner.
    await page.evaluate(fixtureInPage);
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        window.__stream = window.__barcodeCanvas.captureStream(15);
        clearInterval(window.__cameraTicker);
        window.__cameraTicker = setInterval(() => {
          window.__barcodeCanvas.getContext("2d").fillRect(0, 0, 1, 1);
          window.__stream.getVideoTracks()[0].requestFrame?.();
        }, 60);
        return window.__stream;
      };
    });
    await page.locator("#addFab").click();
    await page.locator("#scanFoodBarcode").click();
    await page.waitForSelector("#pickedId", {
      state: "attached",
      timeout: 15000,
    });
    assert.ok(
      await page.evaluate(() =>
        window.__stream.getTracks().every((t) => t.readyState === "ended"),
      ),
    );
    assert.match(
      await page.locator("#picked").innerText(),
      /Produto fotografado de teste/,
    );
    pass(
      "real live decoder finds saved product offline-first and releases camera",
    );
    await page.locator("#closeModal").click();
    // Late permission resolution must not restart a camera after its dialog closes.
    await page.evaluate(() => {
      navigator.mediaDevices.getUserMedia = () =>
        new Promise((resolve) => (window.__resolveCamera = resolve));
    });
    await page.locator("#addFab").click();
    await page.locator("#scanFoodBarcode").click();
    await page.waitForFunction(() => !!window.__resolveCamera);
    await page.keyboard.press("Escape");
    await page.evaluate(() => {
      window.__lateStream = window.__barcodeCanvas.captureStream(10);
      window.__resolveCamera(window.__lateStream);
    });
    await page.waitForFunction(() =>
      window.__lateStream.getTracks().every((t) => t.readyState === "ended"),
    );
    assert.equal(await page.locator("#modal.show").count(), 0);
    pass("closing scanner during permission request stops a late stream");
    await page.evaluate(
      () =>
        (navigator.mediaDevices.getUserMedia = window.__originalGetUserMedia),
    );
    await page.locator("#addFab").click();
    await page.locator("#photoFoodLabel").click();
    await page.locator("#labelPhotoFile").setInputFiles(labelFile);
    await page.waitForSelector("#labelPhotoArea:not(.hidden)");
    const dimensions = await page
      .locator("#labelCanvas")
      .evaluate((c) => [c.width, c.height]);
    await page.locator("#rotateLabel").click();
    assert.deepEqual(
      await page.locator("#labelCanvas").evaluate((c) => [c.width, c.height]),
      dimensions.reverse(),
    );
    await page.locator("#rotateLabel").click();
    await page.locator("#rotateLabel").click();
    await page.locator("#rotateLabel").click();
    const bounds = await page.locator("#photoStage").boundingBox();
    await page.mouse.move(
      bounds.x + bounds.width * 0.1,
      bounds.y + bounds.height * 0.15,
    );
    await page.mouse.down();
    await page.mouse.move(
      bounds.x + bounds.width * 0.9,
      bounds.y + bounds.height * 0.85,
    );
    await page.mouse.up();
    assert.equal(await page.locator("#cropBox.hidden").count(), 0);
    await page.locator("#resetCrop").click();
    assert.equal(await page.locator("#cropBox.hidden").count(), 1);
    pass("photo rotation and crop selection are reversible");
    await page.evaluate(() => {
      document.querySelector("#readLabel").click();
      document.querySelector("#cancelLabel").click();
    });
    await page.waitForFunction(() =>
      document.querySelector("#labelStatus")?.textContent.includes("cancelada"),
    );
    assert.equal(await page.locator("#modal.show").count(), 1);
    pass("OCR can be cancelled without losing the photo");
    await page.locator("#closeModal").click();
    // Antivirus software on this host may inject its own main.js in pages/workers.
    // Exclude only that known host script and pre-existing page scripts from this assertion.
    const externalPhotoRequests = external.filter(
      (url) =>
        !url.startsWith("https://world.openfoodfacts.org/api/v2/") &&
        !environmentScriptOrigins.includes(new URL(url).origin) &&
        !(
          new URL(url).hostname === "gc.kis.v2.scr.kaspersky-labs.com" &&
          new URL(url).pathname.endsWith("/main.js")
        ),
    );
    assert.deepEqual(externalPhotoRequests, []);
    pass("photos and OCR assets cause no third-party network requests");
    await context.setOffline(true);
    await page.reload();
    await page.waitForSelector("#jumpDate");
    await page.locator("#addFab").click();
    await page.locator("#photoFoodLabel").click();
    await page.locator("#labelPhotoFile").setInputFiles(labelFile);
    await page.waitForSelector("#labelPhotoArea:not(.hidden)");
    await page.locator("#readLabel").click();
    await page.waitForSelector("#labelColumn", { timeout: 90000 });
    assert.match(await page.locator("#parsedLabelTable").innerText(), /120/);
    pass("real OCR works after offline reload once reader has been prepared");
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      assert.ok(
        await page
          .locator("#sheet")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      );
    }
    pass("label review fits narrow and desktop screens");
    if (process.env.SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SCREENSHOT_DIR, { recursive: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator("#labelColumn").selectOption("1");
      await page.locator("#labelBaseMode").selectOption("portion");
      await page.locator("#labelServing").fill("30");
      await page.locator("#sheet").evaluate((el) => {
        document.activeElement?.blur();
        el.scrollTop = 0;
      });
      await page.screenshot({
        path: path.join(
          process.env.SCREENSHOT_DIR,
          "nutritrack-leitura-tabela.png",
        ),
      });
    }
    assert.deepEqual(errors, []);
    pass("no uncaught reader errors");
    await context.close();
    // A fresh install has the shell but has not downloaded the larger OCR engines.
    const freshContext = await browser.newContext({
        viewport: { width: 390, height: 844 },
      }),
      freshPage = await freshContext.newPage();
    const freshErrors = [];
    freshPage.on("pageerror", (error) => freshErrors.push(error.message));
    await freshPage.goto(base);
    await freshPage.evaluate(() => navigator.serviceWorker.ready);
    await freshPage.waitForFunction(() => navigator.serviceWorker.controller);
    await freshPage.waitForSelector("#jumpDate");
    await freshContext.setOffline(true);
    await freshPage.reload();
    await freshPage.waitForSelector("#jumpDate");
    await freshPage.locator("#addFab").click();
    await freshPage.locator("#photoFoodLabel").click();
    await freshPage.locator("#labelPhotoFile").setInputFiles(labelFile);
    await freshPage.waitForSelector("#labelPhotoArea:not(.hidden)");
    await freshPage.locator("#readLabel").click();
    await freshPage.waitForFunction(() =>
      document
        .querySelector("#labelStatus")
        ?.textContent.includes("Conecte-se à internet"),
    );
    assert.deepEqual(freshErrors, []);
    pass(
      "first offline OCR attempt fails clearly without an uncaught worker error",
    );
    await freshPage.locator("summary").click();
    await freshPage
      .locator("#pasteLabelText")
      .fill(
        "Valor energético (kcal) 100\nProteínas (g) 4\nCarboidratos (g) 15\nGorduras totais (g) 2",
      );
    await freshPage.locator("#useLabelText").click();
    await freshPage.waitForSelector("#labelColumn");
    assert.match(
      await freshPage.locator("#parsedLabelTable").innerText(),
      /100/,
    );
    pass("text fallback remains available offline without the OCR engines");
    await freshContext.close();
    console.log(count + " capture browser checks passed");
  } catch (error) {
    if (page && process.env.SCREENSHOT_DIR) {
      fs.writeFileSync(
        path.join(root, "../capture-test-diagnostic.txt"),
        await page.locator("body").innerText(),
      );
      await page.screenshot({
        path: path.join(root, "../capture-test-diagnostic.png"),
      });
    }
    throw error;
  } finally {
    await browser.close();
    server.close();
  }
})().catch((error) => {
  console.error(error);
  server.close();
  process.exitCode = 1;
});
