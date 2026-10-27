const CACHE = "nutritrack-shell-v19";
const READER_CACHE = "nutritrack-readers-v1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./interface.css",
  "./food-catalog.js",
  "./nutrition-utils.js",
  "./app.js",
  "./capture.css",
  "./label-parser.js",
  "./capture.js",
  "./capture-ui.js",
  "./vendor/zxing-browser.min.js",
  "./vendor/tesseract.min.js",
  "./vendor/tesseract-worker.min.js",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./exercise-estimates.js",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(SHELL.map((url) => new Request(url, { cache: "reload" }))),
      )
      .then(async () => {
        const clients = await self.clients.matchAll({ type: "window" });
        if (!clients.length) await self.skipWaiting();
      }),
  );
});
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("nutritrack-shell-") && key !== CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (
    request.method !== "GET" ||
    new URL(request.url).origin !== self.location.origin
  )
    return;
  const isDocument =
    request.mode === "navigate" ||
    new URL(request.url).pathname.endsWith("/index.html") ||
    new URL(request.url).pathname.endsWith("/");
  if (isDocument) {
    // A complete shell version is installed before the user accepts the update.
    event.respondWith(
      caches
        .open(CACHE)
        .then(
          async (cache) =>
            (await cache.match("./index.html")) || fetch(request),
        ),
    );
    return;
  }
  const assetCache = /\/vendor\/(?:core|lang)\//.test(
    new URL(request.url).pathname,
  )
    ? READER_CACHE
    : CACHE;
  event.respondWith(
    caches
      .open(assetCache)
      .then((cache) => cache.match(request))
      .then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              event.waitUntil(
                caches
                  .open(assetCache)
                  .then((cache) => cache.put(request, copy)),
              );
            }
            return response;
          }),
      ),
  );
});
