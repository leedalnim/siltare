// ---------- 앱 설치·오프라인 (서비스 워커) ----------
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then(r => r.update()).catch(() => {}); });
}
