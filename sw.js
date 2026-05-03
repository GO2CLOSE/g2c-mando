// G2C Mando · Service Worker
// v1.9 · Push notifications + cache versionado

const SW_VERSION = 'g2c-mando-sw-v1.9';
const CACHE_NAME = 'g2c-mando-cache-v1.9';

// Archivos críticos para cache offline
const CACHE_URLS = [
  '/',
  '/index.html',
  '/shared.js',
  '/shared.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// === INSTALL ===
self.addEventListener('install', (event) => {
  console.log('[SW] Install', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS).catch(err => {
        console.warn('[SW] Cache addAll failed:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// === ACTIVATE · borra TODOS los caches viejos ===
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => {
          console.log('[SW] Borrando cache viejo:', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// === FETCH · network-FIRST agresivo para HTML/JS ===
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isCriticalAsset = url.pathname.endsWith('.html') ||
                          url.pathname.endsWith('.js') ||
                          url.pathname.endsWith('.css') ||
                          url.pathname === '/';

  // Para HTML/JS/CSS · SIEMPRE network-first sin caché stale
  if (isCriticalAsset) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return res;
      }).catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
    );
    return;
  }

  // Para otros assets (imágenes, manifest) · cache-first OK
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((res) => {
        if (res && res.status === 200) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        }
        return res;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});

// === PUSH · recepción de notificación push ===
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'G2C Mando', body: event.data ? event.data.text() : 'Nueva notificación' };
  }

  const options = {
    body: data.body || 'Tienes una notificación nueva',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    image: data.image,
    vibrate: [200, 100, 200],
    tag: data.tag || 'g2c-notif-' + Date.now(),
    requireInteraction: data.requireInteraction || false,
    silent: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      type: data.type || 'general',
      payload: data.payload || {}
    },
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '★ G2C Mando', options)
  );
});

// === NOTIFICATIONCLICK · al tocar la notificación ===
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click', event.notification.data);
  event.notification.close();

  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/';

  // Si una acción específica fue tocada
  if (event.action) {
    const actionMap = {
      'view': url,
      'dismiss': null,
      'snooze': '/?snooze=1'
    };
    const target = actionMap[event.action];
    if (!target) return; // dismiss · no hacer nada
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'notification-clicked', data: event.notification.data });
          return client.focus().then(() => {
            if ('navigate' in client) return client.navigate(url);
          });
        }
      }
      // Si no, abrir ventana nueva
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// === MESSAGE · comunicación con la app ===
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    self.registration.showNotification('★ G2C Mando · Test', {
      body: 'Las notificaciones funcionan correctamente',
      icon: '/icon-192x192.png',
      vibrate: [200, 100, 200]
    });
  }
});
