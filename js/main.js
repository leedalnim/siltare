let rz = null, lastW = window.innerWidth;
window.addEventListener("resize", () => { if (window.innerWidth === lastW) return; lastW = window.innerWidth; clearTimeout(rz); rz = setTimeout(render, 150); });

render();
if (state.wake && state.tab === "counter") setWake(true);
initSync();
