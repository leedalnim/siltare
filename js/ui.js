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
  // 도트 도안을 그리다 닫을 때는 한 번 묻기 (임시 보관본은 남아 있어 다음에 이어 그릴 수 있어요)
  if (!$("sheet-dot").hidden && typeof dotDirty === "function" && dotDirty() && !confirm("저장하지 않은 그림이 있어요. 닫을까요?\n(다음에 열면 이어서 그릴 수 있어요)")) return;
  if (typeof dotPop === "function") dotPop(false);
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
