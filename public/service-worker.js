const CACHE_NAME = "budget-tracker-cache";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/index.js",
  "/service-worker.js",
  "/manifest.webmanifest",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  '/db.js',
  "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
];

// install
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Your files were Cached successfully!");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", function (evt) {
  // cache all get requests to /api routes
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches.open(DATA_CACHE_NAME).then(async cache => {
        try {
          const response = await fetch(evt.request);
          // sucessfull response will clone and store in the cache
          if (response.status === 200) {
            cache.put(evt.request.url, response.clone());
          }
          return response;
        } catch (err) {
          return await cache.match(evt.request);
        }
      }).catch(err => console.log(err))
    );

    return;
  }

  evt.respondWith(
    fetch(evt.request).catch(async function () {
      const response = await caches.match(evt.request);
      if (response) {
        return response;
      } else if (evt.request.headers.get("accept").includes("text/html")) {
        return caches.match("/");
      }
    })
  );
});
