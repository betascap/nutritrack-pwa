const CACHE = "nutritrack-shell-v18";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./interface.css",
  "./food-catalog.js",
  "./nutrition-utils.js",
  "./app.js",
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
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
