// Incrementa este número cada vez que subas cambios al servidor
const VERSION = '2';
const CACHE = 'vaca-v' + VERSION;
const FILES = ['./inventario-app.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  // Activar inmediatamente sin esperar a que se cierren pestañas
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Eliminar cachés viejos
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  // Tomar control de todas las pestañas abiertas
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Siempre intentar red primero, caché como respaldo
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // Actualizar caché con la versión más reciente
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
