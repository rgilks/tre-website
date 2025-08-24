const CACHE_NAME = 'tre-website-v1'
const STATIC_CACHE_NAME = 'tre-static-v1'
const DYNAMIC_CACHE_NAME = 'tre-dynamic-v1'

// Files to precache
const PRECACHE_URLS = ['/', '/offline', '/manifest.webmanifest']

// Static assets to cache
const STATIC_ASSETS = ['/logo192.png', '/logo512.png', '/logo144.png']

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then(cache => {
        return cache.addAll(STATIC_ASSETS)
      }),
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(PRECACHE_URLS)
      }),
    ])
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DYNAMIC_CACHE_NAME
          ) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          // Return cached response and update in background
          fetch(request).then(freshResponse => {
            if (freshResponse.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, freshResponse)
              })
            }
          })
          return response
        }
        return fetch(request)
          .then(response => {
            if (response.ok) {
              const responseClone = response.clone()
              caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
          .catch(() => {
            // Return offline page if fetch fails
            return caches.match('/offline')
          })
      })
    )
    return
  }

  // Handle static assets (CSS, JS, images)
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request).then(response => {
        if (response) {
          return response
        }
        return fetch(request).then(response => {
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME).then(cache => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
      })
    )
    return
  }

  // Handle other requests with network-first strategy
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(request)
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  // For now, just log that sync occurred
  console.log('Background sync triggered')
}
