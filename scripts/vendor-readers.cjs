/* Reproduce the self-hosted reader assets from the locked development packages. */
const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const root = path.resolve(__dirname, ".."),
  out = path.join(root, "vendor");
const pkg = (name) =>
  path.dirname(require.resolve(name + "/package.json", { paths: [root] }));
const tess = pkg("tesseract.js"),
  zxing = pkg("@zxing/browser"),
  language = pkg("@tesseract.js-data/por");
const core = path.dirname(
  require.resolve("tesseract.js-core", { paths: [tess] }),
);
const library = path.dirname(
  require.resolve("@zxing/library/package.json", { paths: [zxing] }),
);
const files = [
  [path.join(zxing, "umd/zxing-browser.min.js"), "zxing-browser.min.js"],
  [path.join(tess, "dist/tesseract.min.js"), "tesseract.min.js"],
  [path.join(tess, "dist/worker.min.js"), "tesseract-worker.min.js"],
  [
    path.join(tess, "dist/tesseract.min.js.LICENSE.txt"),
    "licenses/tesseract-bundle.txt",
  ],
  [
    path.join(tess, "dist/worker.min.js.LICENSE.txt"),
    "licenses/worker-bundle.txt",
  ],
  [path.join(tess, "LICENSE.md"), "licenses/tesseract.txt"],
  [path.join(zxing, "LICENSE"), "licenses/zxing-browser.txt"],
  [path.join(library, "LICENSE"), "licenses/zxing-library.txt"],
  [path.join(core, "LICENSE"), "licenses/tesseract-core.txt"],
  [
    path.join(language, "4.0.0_best_int/por.traineddata.gz"),
    "lang/por.traineddata.gz",
  ],
  ...[
    "tesseract-core.wasm.js",
    "tesseract-core-simd.wasm.js",
    "tesseract-core-lstm.wasm.js",
    "tesseract-core-simd-lstm.wasm.js",
  ].map((name) => [path.join(core, name), "core/" + name]),
];
const manifest = [];
for (const [source, target] of files) {
  const destination = path.join(out, target);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const data = fs.readFileSync(source);
  fs.writeFileSync(destination, data);
  manifest.push({
    file: target,
    bytes: data.length,
    sha256: crypto.createHash("sha256").update(data).digest("hex"),
  });
}
fs.writeFileSync(
  path.join(out, "manifest.json"),
  JSON.stringify(
    {
      packages: Object.fromEntries(
        [tess, zxing, core, language, library].map((dir) => {
          const x = JSON.parse(
            fs.readFileSync(path.join(dir, "package.json"), "utf8"),
          );
          return [x.name, x.version];
        }),
      ),
      files: manifest,
    },
    null,
    2,
  ) + "\n",
);
console.log("Reader assets prepared: " + manifest.length + " files.");
