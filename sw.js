var CACHE = 'zeirojuegos-v2';
var SHELL = [
  './', './index.html', './theme.css', './manifest.webmanifest', './assets/logo-mark-v2.png',
  './app/config.js', './app/utils.js', './app/icons.js', './app/voz.js', './app/seed.js',
  './app/db.js', './app/engine.js',
  './app/games/test.js', './app/games/froggy.js', './app/games/sopa.js', './app/games/crucigrama.js',
  './app/games/columnas.js', './app/games/memory.js', './app/games/completar.js', './app/games/ordenar-palabras.js',
  './app/games/si-o-no.js', './app/games/ordenar-letras.js', './app/games/ruleta.js', './app/games/grupos.js',
  './app/games/filas.js', './app/games/mapa.js',
  './app/editor.js', './app/views.js', './app/app.js'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.map(function (k) { return k === CACHE ? null : caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var url = e.request.url;
  if (e.request.method !== 'GET' || /supabase|pooler|auth/.test(url)) return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      return fetch(e.request).then(function (res) {
        if (res && res.ok) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, cp); }); }
        return res;
      }).catch(function () { return hit; });
    })
  );
});
