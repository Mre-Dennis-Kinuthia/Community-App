/**
 * Impact Hub PWA service worker.
 * - Precaches offline shell + icons
 * - Network-first for full page navigations; offline shell only on network failure
 * - Stale-while-revalidate for static assets
 */
const CACHE_VERSION = "ihn-pwa-v2"
const PRECACHE = [
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/apple-touch-icon.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  )
})

function isDocumentNavigation(request) {
  return request.mode === "navigate"
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|webp|svg|ico)$/)
  )
}

function isApiOrAuth(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")
}

function isNetworkFailure(error) {
  return error instanceof TypeError
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isApiOrAuth(url)) return

  if (isDocumentNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(async (error) => {
          if (!isNetworkFailure(error)) {
            throw error
          }
          const cached = await caches.match("/offline.html")
          return cached ?? Response.error()
        })
    )
    return
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request)
        const network = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
          .catch(() => cached)
        return cached ?? network
      })
    )
  }
})
