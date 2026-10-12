// 오프라인에서도 열리도록 앱 파일을 저장해 두는 서비스 워커.
// 같은 주소의 파일은 "인터넷 먼저, 안 되면 저장본" 방식이라 업데이트하면 바로 새 버전이 떠요.
const CACHE = "yarn-rx-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 다른 앱에서 '공유 → 남은 실'로 보낸 이미지·PDF를 임시 보관함에 넣고 앱으로 넘겨요.
async function receiveShare(req) {
  try {
    const fd = await req.formData(), cache = await caches.open("share-inbox");
    for (const k of await cache.keys()) await cache.delete(k);
    let i = 0;
    for (const f of fd.getAll("files")) {
      if (!(f instanceof File)) continue;
      await cache.put(new Request("shared/" + Date.now() + "-" + i++), new Response(f, { headers: { "content-type": f.type || "application/octet-stream", "x-name": encodeURIComponent(f.name || "공유한 도안") } }));
    }
  } catch (err) {}
  return Response.redirect("./?share=1", 303);
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method === "POST" && new URL(req.url).pathname.endsWith("/share-target")) { e.respondWith(receiveShare(req)); return; }
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!sameOrigin && !isFont) return;

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (isFont) {
      const hit = await cache.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === "opaque") cache.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }
    try {
      const r = await fetch(req);
      if (r.ok) cache.put(req, r.clone());
      return r;
    } catch (err) {
      return (await cache.match(req)) || (req.mode === "navigate" ? await cache.match("index.html") : Response.error());
    }
  })());
});
