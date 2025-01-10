var CACHE_NAME = 'finance-offline-cache';
var urlsToCache = [
  './sw.js',
  './index.html', 
  '../js/default.js',
  '../js/financeApp.js',
  '../css/default.css',
  '../ico.webp'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function(cache) {
          return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
      fetch(event.request)
          .catch(function() {
              return caches.match(event.request);
          })
  );
});