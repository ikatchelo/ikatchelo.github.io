const cacheName = "DefaultCompany-ball head-0.6.9";
const contentToCache = [
    "Build/Goal Rush.loader.js",
    "Build/722cae3580ac3d7774446201ecdf3786.js.unityweb",
    "Build/2307db4634339bd098e5fcd791ea87eb.data.unityweb",
    "Build/231301c0b3c0319133c1fb8c7035c37f.wasm.unityweb",
    "TemplateData/style.css"

];

self.addEventListener('install', function (e) {
    console.log('[Service Worker] Install');
    
    e.waitUntil((async function () {
      const cache = await caches.open(cacheName);
      console.log('[Service Worker] Caching all: app shell and content');
      await cache.addAll(contentToCache);
    })());
});

self.addEventListener('fetch', function (e) {
    e.respondWith((async function () {
      let response = await caches.match(e.request);
      console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
      if (response) { return response; }

      response = await fetch(e.request);
      const cache = await caches.open(cacheName);
      console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
      cache.put(e.request, response.clone());
      return response;
    })());
});
