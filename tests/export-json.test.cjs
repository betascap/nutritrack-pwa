const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Execute the actual app function in isolation; do not duplicate its implementation.
const source = fs.readFileSync(path.join(__dirname, "../app.js"), "utf8");
const start = source.indexOf("  async function exportJson() {");
const end = source.indexOf("  function exportCsv(", start);
assert.ok(start >= 0 && end > start);
const functionSource = source.slice(start, end);
const previousBackup = "2026-10-01T12:00:00.000Z";

function setup(navigator = {}) {
  const events = [],
    downloads = [],
    writes = [],
    messages = [];
  const state = {
    foods: [{ id: "food-1", name: "Arroz" }],
    logs: [],
    weights: [],
    training: [],
    meals: [],
    plans: [],
    settings: { id: "main", lastBackupAt: previousBackup, dark: true },
  };
  const context = vm.createContext({
    navigator,
    state,
    Blob,
    File,
    today: () => "2026-10-27",
    download(name, blob) {
      events.push("download");
      downloads.push({ name, blob });
    },
    async put(store, value) {
      events.push("put");
      writes.push({ store, value });
    },
    toast(message) {
      messages.push(message);
    },
  });
  const run = vm.runInContext("(" + functionSource.trim() + ")", context);
  return { run, state, events, downloads, writes, messages, context };
}

test("backup shares synchronously from the click and stamps settings only after resolution", async () => {
  let resolveShare, payload;
  const pending = new Promise((resolve) => {
    resolveShare = resolve;
  });
  const x = setup({
    canShare({ files }) {
      x.events.push("canShare");
      assert.equal(files.length, 1);
      assert.equal(files[0].type, "application/json");
      return true;
    },
    share(value) {
      x.events.push("share");
      payload = value;
      return pending;
    },
  });
  const result = x.run();
  // No await/IndexedDB write precedes the call to share: user activation is retained.
  assert.deepEqual(x.events, ["canShare", "share"]);
  assert.equal(x.state.settings.lastBackupAt, previousBackup);
  assert.equal(x.writes.length, 0);
  assert.equal(payload.title, "Backup NutriTrack");
  assert.equal(payload.files[0].name, "nutritrack-backup-2026-10-27.json");
  const json = JSON.parse(await payload.files[0].text());
  assert.equal(json.app, "NutriTrack");
  assert.equal(json.version, 2);
  assert.deepEqual(Object.keys(json), [
    "app",
    "version",
    "exportedAt",
    "foods",
    "logs",
    "weights",
    "training",
    "meals",
    "plans",
    "settings",
  ]);
  assert.deepEqual(json.foods, x.state.foods);
  assert.equal(json.settings.dark, true);
  assert.equal(json.settings.lastBackupAt, json.exportedAt);
  resolveShare();
  await result;
  assert.deepEqual(x.events, ["canShare", "share", "put"]);
  assert.equal(x.state.settings.lastBackupAt, json.exportedAt);
  assert.equal(x.writes[0].store, "settings");
  assert.equal(x.writes[0].value.lastBackupAt, json.exportedAt);
  assert.equal(x.downloads.length, 0);
  assert.deepEqual(x.messages, ["Backup compartilhado"]);
});

test("backup cancellation keeps both memory and persisted timestamp unchanged", async () => {
  const x = setup({
    canShare: () => true,
    share: async () => {
      throw Object.assign(new Error("cancelled"), { name: "AbortError" });
    },
  });
  await x.run();
  assert.equal(x.state.settings.lastBackupAt, previousBackup);
  assert.equal(x.writes.length, 0);
  assert.equal(x.downloads.length, 0);
  assert.deepEqual(x.messages, ["Backup cancelado"]);
});

test("backup downloads v2 and stamps settings when file sharing is unavailable", async () => {
  for (const navigator of [{}, { canShare: () => false }]) {
    const x = setup(navigator);
    await x.run();
    assert.deepEqual(x.events, ["download", "put"]);
    assert.equal(x.downloads[0].name, "nutritrack-backup-2026-10-27.json");
    assert.equal(x.downloads[0].blob.type, "application/json");
    const json = JSON.parse(await x.downloads[0].blob.text());
    assert.equal(json.version, 2);
    assert.equal(x.state.settings.lastBackupAt, json.exportedAt);
    assert.deepEqual(x.messages, ["Backup JSON exportado"]);
  }
});

for (const name of ["NotAllowedError", "Error"]) {
  test("backup falls back to download after share " + name, async () => {
    const x = setup({
      canShare: () => true,
      share: async () => {
        x.events.push("share");
        throw Object.assign(new Error("failed"), { name });
      },
    });
    await x.run();
    assert.deepEqual(x.events, ["share", "download", "put"]);
    assert.equal(x.downloads.length, 1);
    assert.notEqual(x.state.settings.lastBackupAt, previousBackup);
    assert.deepEqual(x.messages, ["Backup JSON exportado"]);
  });
}

test("backup does not stamp settings if the fallback download cannot be triggered", async () => {
  const x = setup();
  x.context.download = () => {
    throw new Error("download failed");
  };
  await assert.rejects(x.run(), /download failed/);
  assert.equal(x.state.settings.lastBackupAt, previousBackup);
  assert.equal(x.writes.length, 0);
});
