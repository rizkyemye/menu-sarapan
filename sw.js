/* Service worker: simpan halaman + menu.json biar tetap jalan walau Wi-Fi lift jelek */
const CACHE = "menu-sarapan-v1";
const BERKAS = ["./", "./index.html", "./layar.html", "./menu.css", "./menu-app.js", "./menu.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BERKAS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);

  // menu.json: ambil dari jaringan dulu (biar menu harian selalu baru), kalau gagal pakai cache
  if (url.pathname.endsWith("menu.json")) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const salinan = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, salinan)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const salinan = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, salinan)).catch(() => {});
      return res;
    }).catch(() => caches.match("./index.html")))
  );
});
