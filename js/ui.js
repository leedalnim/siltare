// ---------- Sheets & toast ----------
const SHEETS = ["sheet-add", "sheet-pat", "sheet-start", "sheet-sym", "sheet-myadd", "sheet-mypat", "sheet-dot"];
const anySheetOpen = () => SHEETS.some(id => !$(id).hidden);
let lastFocus = null;
function openSheet(id) {
  lastFocus = document.activeElement;
  $(id).hidden = false; document.documentElement.classList.add("lock");
  const close = $(id).querySelector(".close"); if (close) close.focus({ preventScroll: true });
}
function closeSheets() {
  SHEETS.forEach(id => $(id).hidden = true);
  if (typeof myClean === "function") myClean();
  document.documentElement.classList.remove("lock"); state.detail = null; state.pv = null;
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}
let toastT = null;
let undoData = null;
function toast(msg, withUndo) {
  const t = $("toast");
  t.innerHTML = esc(msg) + (withUndo ? ` <button type="button" class="undo" data-undo>되돌리기</button>` : "");
  t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; undoData = null; }, withUndo ? 5000 : 2400);
}
