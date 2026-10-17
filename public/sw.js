// Pamięć podręczna Tajemnic Magii: po pierwszej wizycie strona i karty działają także bez internetu.
// Strona: najpierw sieć (zawsze najnowsza wersja), a bez sieci kopia. Obrazy, skrypty, czcionki: najpierw kopia.
const CACHE = 'tm-v2'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['./', 'aylena.webp', 'aylena-small.webp', 'manifest.webmanifest'])))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // AI (Gemini) zawsze z sieci
  if (url.hostname.includes('googleapis.com') && !url.hostname.startsWith('fonts')) return

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copy))
          return res
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  const cacheable = url.origin === location.origin || url.hostname.endsWith('gstatic.com') || url.hostname === 'fonts.googleapis.com'
  if (!cacheable) return
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok || res.type === 'opaque') {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
