let rz = null, lastW = window.innerWidth;
window.addEventListener("resize", () => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(rz); rz = setTimeout(render, 150); });

// 기기의 밝게/어둡게 설정이 바뀌면 무늬 그림도 다시 그려요
if (window.matchMedia) { const mq = matchMedia("(prefers-color-scheme: dark)"); (mq.addEventListener ? mq.addEventListener("change", () => { applyTheme(); render(); }) : mq.addListener(() => { applyTheme(); render(); })); }
// 화면 밝기: 자동(기기 설정) → 밝게 → 어둡게
const THEME_ICON = {
  auto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
  light: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>',
  dark: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>'
};
const THEME_NAME = { auto: "자동 (기기 설정)", light: "밝게", dark: "어둡게" };
function applyTheme() {
  const t = themePref(), root = document.documentElement;
  if (t === "auto") delete root.dataset.theme; else root.dataset.theme = t;
  const b = $("theme-btn"); if (b) { b.innerHTML = THEME_ICON[t]; b.setAttribute("aria-label", "화면 밝기: " + THEME_NAME[t]); b.title = "화면 밝기: " + THEME_NAME[t]; }
  // 홈 화면 앱에서는 iOS가 화면 아래 그릴 수 없는 띠를 이 색으로 칠해요 → 탭바 색과 맞춰요
  const standalone = navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
  const bg = getComputedStyle(root).getPropertyValue(standalone ? "--surface" : "--bg").trim();
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute("content", bg));
}
document.addEventListener("click", e => {
  if (!e.target.closest("[data-theme-cycle]")) return;
  const next = { auto: "light", light: "dark", dark: "auto" }[themePref()];
  try { localStorage.setItem("siltare-theme", next); } catch (err) {}
  applyTheme(); render(); toast("화면 밝기: " + THEME_NAME[next]);
});
applyTheme();
render();
if (state.wake && state.tab === "counter") setWake(true);
initSync();
