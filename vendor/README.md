# Self-hosted readers

These third-party assets are copied from the packages pinned in `pnpm-lock.yaml` by `node scripts/vendor-readers.cjs`. Exact versions, byte lengths and SHA-256 hashes are recorded in `manifest.json`. Commit regenerated assets and their updated manifest together. Do not format or edit the generated bundles.

- `@zxing/browser` 0.1.5, MIT, including `@zxing/library` 0.21.3, Apache-2.0: product barcode decoding.
- `tesseract.js` 6.0.1 and `tesseract.js-core` 6.1.2, Apache-2.0: in-browser OCR.
- `@tesseract.js-data/por` 1.0.0, Apache-2.0: Portuguese model, `4.0.0_best_int/por.traineddata.gz`.
- Full package licenses and bundled dependency notices are retained under `licenses/`.

The four core `.wasm.js` files contain their WebAssembly binary as embedded data. Separate `.wasm` files are not required for this distribution. The app requests LSTM-only OCR; both LSTM CPU variants and the language data are prepared on demand. The service worker caches those requests for later offline operation. The larger core files are not part of the initial shell installation.

All processing assets are served from the app's own origin. No image is sent to a remote OCR service. Barcode lookup sends the decoded identifier to Open Food Facts only when the product is not found in the local catalog.

Upstream documentation: [ZXing Browser](https://github.com/zxing-js/browser), [Tesseract.js API](https://github.com/naptha/tesseract.js/blob/v6.0.1/docs/api.md), [Tesseract local installation](https://github.com/naptha/tesseract.js/blob/v6.0.1/docs/local-installation.md).
