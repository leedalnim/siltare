let rz = null, lastW = window.innerWidth;
window.addEventListener("resize", () => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(rz); rz = setTimeout(render, 150); });

// 기기의 밝게/어둡게 설정이 바뀌면 무늬 그림도 다시 그려요
if (window.matchMedia) { const mq = matchMedia("(prefers-color-scheme: dark)"); (mq.addEventListener ? mq.addEventListener("change", render) : mq.addListener(render)); }
render();
if (state.wake && state.tab === "counter") setWake(true);
initSync();
