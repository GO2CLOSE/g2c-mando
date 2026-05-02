// G2C Mando · Service Worker
// v1.1 · Push notifications profesionales · sin emojis · prioridad + monto

const SW_VERSION = 'g2c-mando-sw-v1.1';
const CACHE_NAME = 'g2c-mando-cache-v1';

const CACHE_URLS = [
  '/',
  '/index.html',
  '/shared.js',
  '/shared.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install', SW_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_URLS).catch(err => console.warn('[SW] Cache addAll failed:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate', SW_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    fetch(event.request).then((res) => {
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
});

// ============================================================
// FORMATO PROFESIONAL DE NOTIFICACIONES (reglas Alan)
// SIN emojis · prioridad explícita · monto cuando aplica
// ============================================================

const PRIORITY_LABELS = {
  alta: 'PRIORIDAD ALTA',
  media: 'PRIORIDAD MEDIA',
  baja: 'INFO',
  critica: 'CRÍTICO · ACCIÓN INMEDIATA'
};

function formatTitle(data) {
  const prioLabel = PRIORITY_LABELS[data.priority] || PRIORITY_LABELS.media;
  if (data.amount) {
    const amount = Number(data.amount).toLocaleString('es-MX');
    return `${prioLabel} · $${amount}`;
  }
  if (data.subject) {
    return `${prioLabel} · ${data.subject}`;
  }
  return prioLabel + ' · Mando';
}

function formatBody(data) {
  let body = data.body || '';
  if (data.amount && !body.includes('$')) {
    const amount = Number(data.amount).toLocaleString('es-MX');
    body = `${body}\nMonto: $${amount} MXN`;
  }
  if (data.deadline && !body.toLowerCase().includes('vence')) {
    body = `${body}\nVence: ${data.deadline}`;
  }
  return body || 'Sin detalles adicionales';
}

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Mando', body: event.data ? event.data.text() : 'Nueva notificación', priority: 'media' };
  }

  const isCritical = data.priority === 'alta' || data.priority === 'critica';

  const options = {
    body: formatBody(data),
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/icon-192x192.png',
    image: data.image,
    vibrate: isCritical ? [300, 100, 300, 100, 300] : [200, 100, 200],
    tag: data.tag || 'g2c-' + (data.type || 'notif') + '-' + Date.now(),
    requireInteraction: isCritical || data.requireInteraction || false,
    silent: false,
    timestamp: data.timestamp || Date.now(),
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
      type: data.type || 'general',
      priority: data.priority || 'media',
      amount: data.amount || null,
      subject: data.subject || null,
      payload: data.payload || {}
    },
    actions: data.actions || defaultActions(data.type)
  };

  event.waitUntil(self.registration.showNotification(formatTitle(data), options));
});

function defaultActions(type) {
  switch (type) {
    case 'cobro_vencido':
    case 'cobro_proximo':
      return [{ action: 'view', title: 'Ver cliente' }, { action: 'dismiss', title: 'Después' }];
    case 'tocada':
      return [{ action: 'view', title: 'Ver tocada' }, { action: 'dismiss', title: 'Visto' }];
    case 'pendiente':
      return [{ action: 'view', title: 'Ver pendiente' }, { action: 'snooze', title: 'Posponer 1h' }];
    case 'fiscal':
      return [{ action: 'view', title: 'Ver SAT' }, { action: 'dismiss', title: 'Después' }];
    default:
      return [];
  }
}

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click', event.action, event.notification.data);
  event.notification.close();
  const data = event.notification.data || {};
  let url = data.url || '/';

  if (event.action === 'dismiss') return;
  if (event.action === 'snooze') {
    setTimeout(() => {
      self.registration.showNotification(event.notification.title, {
        body: event.notification.body,
        icon: event.notification.icon,
        data: data,
        tag: 'snoozed-' + Date.now()
      });
    }, 60 * 60 * 1000);
    return;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.postMessage({ type: 'notification-clicked', data: data });
          return client.focus().then(() => {
            if ('navigate' in client) return client.navigate(url);
          });
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'TEST_NOTIFICATION') {
    const payload = event.data.payload || {};
    const testData = {
      title: payload.title,
      body: payload.body || 'Sistema de notificaciones operativo. Si ves esto, Mando puede alertarte de cobros, tocadas y deadlines fiscales.',
      priority: payload.priority || 'media',
      amount: payload.amount,
      subject: payload.subject || 'Test del sistema',
      url: payload.url || '/',
      type: 'test',
      timestamp: Date.now()
    };

    const isCritical = testData.priority === 'alta' || testData.priority === 'critica';

    self.registration.showNotification(formatTitle(testData), {
      body: formatBody(testData),
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: isCritical ? [300, 100, 300, 100, 300] : [200, 100, 200],
      tag: 'test-notif',
      requireInteraction: isCritical,
      data: { url: testData.url, type: 'test', priority: testData.priority }
    });
  }
});
