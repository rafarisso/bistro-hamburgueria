const CACHE = 'bistro-v12'
const APP_SHELL = ['/Bistro_Moda_do_Chef.jpeg', '/Cheese_Salada_Duplo_Bacon.jpeg', '/', '/manifest.webmanifest', '/app-icon-192.png', '/app-icon-512.png', '/Destaque.jpeg', '/Promocao_Barao_Vermelho.jpeg', '/Abacaxi_ao_mel.jpeg', '/Combo_Cheese_Tudo.jfif', '/Combo_Big_Tasty_3_Pessoas.jpeg', '/Combo_Duplo_Cheddar_Chelsea.jpeg', '/Doritos_Burger.jpeg', '/Combo_Super_4_Familia.jpeg']

self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())))
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())))
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).pathname.startsWith('/api/')) return
  event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response }).catch(() => caches.match(event.request).then(cached => cached || caches.match('/'))))
})
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'Novo pedido na Bistrô! 🍔', body: 'Abra o painel para visualizar.' }
  event.waitUntil(Promise.all([
    self.registration.showNotification(data.title, { body: data.body, icon: '/app-icon-192.png', badge: '/app-icon-192.png', tag: data.tag || 'new-order', renotify: true, data: { url: data.url || '/painel' } }),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(openClients => Promise.all(openClients.map(client => client.postMessage({ type: data.type || 'NEW_ORDER', orderId: data.orderId, status: data.status })))),
  ]))
})
self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data?.url || '/painel')) })
