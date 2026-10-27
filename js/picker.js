// ---------- 하단 선택 시트 ----------
// .bsel 안의 <select>를 누르면 기본 드롭다운 대신 화면 아래에서 올라오는 목록을 띄워요.
// 고르면 select 값을 바꾸고 change 이벤트를 보내서, 기존 처리 코드는 그대로 동작해요.
// pickShow(제목, 항목들, 고른 뒤 할 일)로 select 없이도 쓸 수 있어요.
let pickSel = null, pickCb = null;
function pickTitle(sel) {
  const lb = sel.id && document.querySelector(`label[for="${sel.id}"]`);
  return (lb && lb.textContent.trim()) || sel.getAttribute("aria-label") || "골라 주세요";
}
// items: { grp: "묶음 제목" } 또는 { v, label, sw(배경 style), on, sub, cls }
function pickShow(title, items, cb, focusSel) {
  pickSel = focusSel || null; pickCb = cb;
  $("pick-h").textContent = title;
  $("pick-list").innerHTML = items.map(o => o.grp ? `<div class="pick-grp">${esc(o.grp)}</div>`
    : `<button type="button" class="pick-opt${o.cls ? " " + o.cls : ""}" data-pick-v="${esc(o.v)}" aria-pressed="${!!o.on}">`
      + (o.sw != null ? `<i class="pick-sw" style="${esc(o.sw)}"></i>` : "")
      + `<span>${esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ""}</span></button>`).join("");
  $("picker").hidden = false;
  const on = $("pick-list").querySelector('[aria-pressed="true"]') || $("pick-list").querySelector(".pick-opt");
  if (on) { on.focus({ preventScroll: true }); on.scrollIntoView({ block: "nearest" }); }
}
function pickOpen(sel) {
  const items = [], opt = o => ({ v: o.value, label: o.textContent, on: o.selected, sw: o.dataset.sw, cls: o.value === "__new" ? "new" : "" });
  [...sel.children].forEach(c => {
    if (c.tagName === "OPTGROUP") { items.push({ grp: c.label }); [...c.children].forEach(o => items.push(opt(o))); }
    else items.push(opt(c));
  });
  pickShow(pickTitle(sel), items, v => {
    if (document.contains(sel) && sel.value !== v) { sel.value = v; sel.dispatchEvent(new Event("change", { bubbles: true })); }
  }, sel);
}
function pickClose() {
  $("picker").hidden = true;
  if (pickSel && document.contains(pickSel)) pickSel.focus({ preventScroll: true });
  pickSel = null; pickCb = null;
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
  const cb = pickCb; pickClose();
  if (cb) cb(b.dataset.pickV);
}, true);
document.addEventListener("keydown", e => {
  if (!$("picker").hidden) { if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); pickClose(); } return; }
  if ((e.key === "Enter" || e.key === " " || e.key === "ArrowDown") && e.target.tagName === "SELECT" && e.target.closest(".bsel")) {
    e.preventDefault(); pickOpen(e.target);
  }
}, true);
