// 임시 측정: 홈 화면 앱(iOS)에서만 화면 크기 값을 보여 줘요. 문제를 고친 뒤 지울 파일이에요.
(function () {
  const sa = window.navigator.standalone === true || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
  if (!sa && !/[?&]diag=1/.test(location.search)) return;
  const probe = css => { const d = document.createElement("div"); d.style.cssText = "position:fixed;left:-9px;top:0;width:1px;visibility:hidden;" + css; document.body.appendChild(d); const h = d.getBoundingClientRect().height; d.remove(); return Math.round(h); };
  const show = () => {
    const tb = document.querySelector(".tabbar").getBoundingClientRect(), rt = $("root").getBoundingClientRect(), vv = window.visualViewport;
    const rows = [
      ["버전", ((document.querySelector('link[href*="base.css"]') || {}).href || "").split("v=")[1] || "-"],
      ["화면(screen)", `${screen.width}×${screen.height}`],
      ["창(inner)", `${innerWidth}×${innerHeight}`],
      ["보이는 영역(vv)", vv ? `${Math.round(vv.width)}×${Math.round(vv.height)} @${Math.round(vv.offsetTop)}` : "-"],
      ["문서(client)", document.documentElement.clientHeight],
      ["100lvh / dvh / svh", `${probe("height:100lvh")} / ${probe("height:100dvh")} / ${probe("height:100svh")}`],
      ["100vh / 100%", `${probe("height:100vh")} / ${probe("top:0;bottom:0")}`],
      ["안전 영역 위/아래", `${probe("height:env(safe-area-inset-top,0px)")} / ${probe("height:env(safe-area-inset-bottom,0px)")}`],
      ["스크롤 상자 위/아래", `${Math.round(rt.top)} / ${Math.round(rt.bottom)}`],
      ["탭바 위/아래", `${Math.round(tb.top)} / ${Math.round(tb.bottom)}`],
      ["아래 빈 띠(--gap)", probe("height:var(--gap)")],
      ["상단 띠 아래", Math.round(document.querySelector(".sb-cover").getBoundingClientRect().bottom)],
      ["standalone", `${window.navigator.standalone} · ${matchMedia("(display-mode: standalone)").matches}`]
    ];
    let box = $("diag-box");
    if (!box) { box = document.createElement("div"); box.id = "diag-box"; document.body.appendChild(box); box.addEventListener("click", () => box.remove()); }
    box.style.cssText = "position:fixed;left:12px;right:12px;top:38%;z-index:99;background:rgba(20,18,26,.92);color:#fff;font:12.5px/1.55 ui-monospace,monospace;padding:12px 14px;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.35)";
    box.innerHTML = `<b style="font-family:system-ui">화면 측정 (캡처해서 보내 주세요 · 누르면 닫혀요)</b><br>` + rows.map(([k, v]) => `${k}: <b>${v}</b>`).join("<br>");
  };
  window.addEventListener("load", () => setTimeout(show, 600));
  window.addEventListener("resize", () => { if ($("diag-box")) show(); });
})();
