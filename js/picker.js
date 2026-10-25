// ---------- 하단 선택 시트 ----------
// .bsel 안의 <select>를 누르면 기본 드롭다운 대신 화면 아래에서 올라오는 목록을 띄워요.
// 고르면 select 값을 바꾸고 change 이벤트를 보내서, 기존 처리 코드는 그대로 동작해요.
let pickSel = null;
function pickTitle(sel) {
  const lb = sel.id && document.querySelector(`label[for="${sel.id}"]`);
  return (lb && lb.textContent.trim()) || sel.getAttribute("aria-label") || "골라 주세요";
}
function pickOpen(sel) {
  pickSel = sel;
  const opt = o => `<button type="button" class="pick-opt" data-pick-v="${esc(o.value)}" aria-pressed="${o.selected}"${o.value === "__new" ? ' data-new' : ""}>`
    + (o.dataset.sw != null ? `<i class="pick-sw" style="${esc(o.dataset.sw)}"></i>` : "")
    + `<span>${esc(o.textContent)}</span></button>`;
  let h = "";
  [...sel.children].forEach(c => {
    if (c.tagName === "OPTGROUP") h += `<div class="pick-grp">${esc(c.label)}</div>` + [...c.children].map(opt).join("");
    else h += opt(c);
  });
  $("pick-h").textContent = pickTitle(sel);
  $("pick-list").innerHTML = h;
  $("picker").hidden = false;
  const on = $("pick-list").querySelector('[aria-pressed="true"]') || $("pick-list").querySelector(".pick-opt");
  if (on) { on.focus({ preventScroll: true }); on.scrollIntoView({ block: "nearest" }); }
}
function pickClose() {
  $("picker").hidden = true;
  if (pickSel && document.contains(pickSel)) pickSel.focus({ preventScroll: true });
  pickSel = null;
}
document.addEventListener("click", e => {
  if ($("picker").hidden) {
    const w = e.target.closest && e.target.closest(".bsel");
    if (!w) return;
    const sel = w.querySelector("select"); if (!sel || sel.disabled) return;
    e.preventDefault(); e.stopPropagation(); pickOpen(sel); return;
  }
  if (!e.target.closest("#picker")) return;
  e.stopPropagation();
  if (e.target.closest("[data-pick-x]")) { pickClose(); return; }
  const b = e.target.closest("[data-pick-v]"); if (!b) return;
  const sel = pickSel; pickClose();
  if (sel && document.contains(sel) && sel.value !== b.dataset.pickV) {
    sel.value = b.dataset.pickV; sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
}, true);
document.addEventListener("keydown", e => {
  if (!$("picker").hidden) { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); pickClose(); } return; }
  if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && e.target.tagName === "SELECT" && e.target.closest(".bsel")) {
    e.preventDefault(); pickOpen(e.target);
  }
}, true);
