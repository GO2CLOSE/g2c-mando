// G2C Mando · Service Worker
// v1.0 · Push notifications + cache básico

const SW_VERSION = 'g2c-mando-sw-v1.0';
const CACHE_NAME = 'g2c-mando-cache-v1';

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
    })
  );
  self.skipWaiting();
});

// === ACTIVATE ===
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    })
  );
  return self.clients.claim();
});

// === FETCH · network-first con fallback a cache ===
self.addEventListener('fetch', (event) => {
  // Solo cachear GET de mismo origen
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request).then((res) => {
      // Cachear las respuestas exitosas
      if (res && res.status === 200) {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
      }
      return res;
    }).catch(() => {
      // Si falla la red, fallback a cache
      return caches.match(event.request).then((cached) => {
        return cached || new Response('Offline', { status: 503 });
      });
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
