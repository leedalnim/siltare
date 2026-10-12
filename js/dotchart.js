// ---------- 도트 도안: 칸에 색을 칠해 직접 그리는 도안 ----------
// 내 도안(myPats)에 type: "dot"으로 저장돼요. cells는 위쪽 줄부터, 칸마다 팔레트 번호 한 글자(0-9a-z).
// 맨 아래 줄이 1단이에요.
const DOT_PAL = ["#FFFFFF", "#1D1A24", "#E07A2F", "#9A9AA2"];
const DOT_SYM = ["♡", "●", "@", "Σ", "▲", "★", "◆", "✕", "○", "■", "♣", "♠"];   // 색마다 붙는 기호 (출력하거나 비슷한 색일 때 구분용)
const dotView = { sym: true };
const dotEd = { id: null, w: 20, h: 16, cells: [], pal: DOT_PAL.slice(), cur: 1, tool: "pen", hist: [], name: "", sym: true };
const enc = a => a.map(v => v.toString(36)).join(""), dec = s => s.split("").map(ch => parseInt(ch, 36));

function dotCellSize(w, h, maxW) { return Math.max(8, Math.min(30, Math.floor(maxW / w), Math.floor(560 / h))); }
function dotDraw(cv, d, opt = {}) {
  const wrap = cv.parentElement, maxW = Math.max(200, (wrap ? wrap.clientWidth : 340) - 60);
  const cs = dotCellSize(d.w, d.h, maxW), L = 26, T = 2, RM = 20, BM = 16, W = L + d.w * cs + RM, H = T + d.h * cs + BM;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
  const cur = opt.row == null ? -1 : opt.row;   // 지금 뜨는 단(0부터, 아래에서)
  const sym = opt.sym && cs >= 11;
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.font = `600 ${Math.round(cs * .62)}px system-ui, sans-serif`;
  for (let r = 0; r < d.h; r++) for (let c = 0; c < d.w; c++) {
    const v = d.cells[r * d.w + c], hex = d.pal[v] || "#FFFFFF", x = L + c * cs, y = T + r * cs;
    ctx.fillStyle = hex; ctx.fillRect(x, y, cs, cs);
    if (sym) { ctx.fillStyle = inkOn(hex); ctx.globalAlpha = .55; ctx.fillText(DOT_SYM[v] || "", x + cs / 2, y + cs / 2 + 1); ctx.globalAlpha = 1; }
  }
  if (cur >= 0) for (let r = 0; r < d.h; r++) {
    const fromBottom = d.h - 1 - r, y = T + r * cs;
    if (fromBottom < cur) { ctx.fillStyle = "rgba(108,203,156,.35)"; ctx.fillRect(L, y, d.w * cs, cs); }
    else if (fromBottom > cur) { ctx.fillStyle = "rgba(23,20,31,.62)"; ctx.fillRect(L, y, d.w * cs, cs); }
  }
  // 칸 선: 5칸마다 굵게
  for (let c = 0; c <= d.w; c++) { const bold = c % 5 === 0 || c === d.w; ctx.strokeStyle = bold ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.18)"; ctx.lineWidth = bold ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(L + c * cs + .5, T); ctx.lineTo(L + c * cs + .5, T + d.h * cs); ctx.stroke(); }
  for (let r = 0; r <= d.h; r++) { const fb = d.h - r, bold = fb % 5 === 0 || r === 0; ctx.strokeStyle = bold ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.18)"; ctx.lineWidth = bold ? 1.4 : 1; ctx.beginPath(); ctx.moveTo(L, T + r * cs + .5); ctx.lineTo(L + d.w * cs, T + r * cs + .5); ctx.stroke(); }
  if (cur >= 0 && cur < d.h) { const y = T + (d.h - 1 - cur) * cs; ctx.strokeStyle = "#7B5CE0"; ctx.lineWidth = 3; ctx.strokeRect(L - 1, y - 1, d.w * cs + 2, cs + 2); }
  // 왼쪽: 단 번호 · 오른쪽: 뜨는 방향(왕복 기준, 1단은 오른쪽에서 시작) · 아래: 코 번호
  ctx.font = "600 10px 'IBM Plex Mono', monospace"; ctx.textBaseline = "middle";
  for (let fb = 1; fb <= d.h; fb++) {
    const y = T + (d.h - fb) * cs + cs / 2;
    if (fb === 1 || fb % 5 === 0 || fb === cur + 1) { ctx.textAlign = "right"; ctx.fillStyle = fb === cur + 1 ? "#7B5CE0" : fb <= cur ? "#2F9E6B" : "#6F6A7E"; ctx.fillText(fb <= cur ? "✓" : fb, L - 5, y); }
    if (cs >= 9) { ctx.textAlign = "left"; ctx.fillStyle = fb === cur + 1 ? "#7B5CE0" : "rgba(111,106,126,.75)"; ctx.fillText(fb % 2 ? "◀" : "▶", L + d.w * cs + 5, y); }
  }
  ctx.textAlign = "center"; ctx.fillStyle = "#6F6A7E";
  for (let c = 1; c <= d.w; c++) if (c === 1 || c % 5 === 0) ctx.fillText(c, L + (c - .5) * cs, T + d.h * cs + 9);
  return { cs, L, T };
}

// ----- 그리기 -----
function dotOpenEditor(p) {
  if (p) Object.assign(dotEd, { id: p.id, w: p.w, h: p.h, cells: dec(p.cells), pal: p.pal.slice(), name: p.name, cur: Math.min(1, p.pal.length - 1) });
  else Object.assign(dotEd, { id: null, w: 20, h: 16, cells: new Array(320).fill(0), pal: DOT_PAL.slice(), name: "", cur: 1 });
  dotEd.tool = "pen"; dotEd.hist = []; dotEd.sym = true;
  $("dot-title").textContent = p ? "도트 도안 고치기" : "도트 도안 그리기";
  dotRenderEditor(); openSheet("sheet-dot");
}
function dotRenderEditor() {
  const d = dotEd;
  $("dot-body").innerHTML = `<div class="dot-ed">
    <div class="field"><span class="label">이름</span><input id="dot-name" class="my-in" type="text" maxlength="40" placeholder="예: 고양이 얼굴" value="${esc(d.name)}"></div>
    <div class="dot-size"><label>가로 <input id="dot-w" class="my-in" type="number" inputmode="numeric" min="4" max="80" value="${d.w}"> 코</label><span>×</span><label>세로 <input id="dot-h" class="my-in" type="number" inputmode="numeric" min="4" max="80" value="${d.h}"> 단</label><button type="button" class="ghost-btn" data-dot-resize>적용</button></div>
    <div class="dot-pal" role="group" aria-label="색">${d.pal.map((c, i) => `<button type="button" class="dot-sw" data-dot-c="${i}" style="background:${c}" aria-pressed="${d.cur === i && d.tool !== "erase"}" aria-label="${i === 0 ? "바탕색" : `${i + 1}번 색`}"><span style="color:${inkOn(c)}">${DOT_SYM[i]}</span>${i === 0 ? "<small>바탕</small>" : ""}</button>`).join("")}
      ${d.pal.length < 12 ? `<label class="dot-sw dot-add" aria-label="색 추가">＋<input type="color" id="dot-addc" value="#7DA9D8"></label>` : ""}
      <button type="button" class="dot-cedit-btn" data-dot-pop aria-haspopup="dialog">✎ 색 편집</button></div>
    <div class="dot-tools">${[["pen", "칠하기"], ["fill", "채우기"], ["erase", "지우개"]].map(([k, n]) => `<button type="button" data-dot-tool="${k}" aria-pressed="${d.tool === k}">${n}</button>`).join("")}
      <button type="button" data-dot-undo${d.hist.length ? "" : " disabled"}>되돌리기</button><button type="button" data-dot-clear>모두 지우기</button><button type="button" data-dot-sym aria-pressed="${d.sym}">기호 ${d.sym ? "켜짐" : "꺼짐"}</button></div>
    <div class="dot-wrap"><canvas id="dot-cv" aria-label="도트 도안 그리기 판"></canvas></div>
    <p class="my-hint">칸을 누르거나 끌어서 칠해요. 지우개는 바탕색으로 칠하고, 채우기는 같은 색으로 이어진 칸을 한 번에 칠해요. 맨 아래 줄이 1단이에요.</p>
    <button type="button" class="primary wide" data-dot-save>저장</button></div>`;
  requestAnimationFrame(() => { dotDraw.last = dotDraw($("dot-cv"), d, { sym: d.sym }); });
}
function dotCellAt(e) {
  const cv = $("dot-cv"), r = cv.getBoundingClientRect(), { cs, L, T } = dotDraw.last || { cs: 20, L: 26, T: 2 };
  const c = Math.floor((e.clientX - r.left - L) / cs), row = Math.floor((e.clientY - r.top - T) / cs);
  return c >= 0 && c < dotEd.w && row >= 0 && row < dotEd.h ? row * dotEd.w + c : -1;
}
function dotPaint(i) {
  const d = dotEd, col = d.tool === "erase" ? 0 : d.cur;
  if (i < 0) return;
  if (d.tool === "fill") {
    const from = d.cells[i]; if (from === col) return;
    const st = [i]; while (st.length) { const k = st.pop(); if (d.cells[k] !== from) continue; d.cells[k] = col; const r = Math.floor(k / d.w), c = k % d.w;
      if (c > 0) st.push(k - 1); if (c < d.w - 1) st.push(k + 1); if (r > 0) st.push(k - d.w); if (r < d.h - 1) st.push(k + d.w); }
  } else d.cells[i] = col;
  dotDraw.last = dotDraw($("dot-cv"), d, { sym: d.sym });
}
function dotResize(w, h) {
  const d = dotEd, n = new Array(w * h).fill(0);
  for (let fb = 0; fb < Math.min(h, d.h); fb++) for (let c = 0; c < Math.min(w, d.w); c++) n[(h - 1 - fb) * w + c] = d.cells[(d.h - 1 - fb) * d.w + c];   // 아래·왼쪽 기준으로 유지
  Object.assign(d, { w, h, cells: n });
}
function dotThumb(d) {
  const k = Math.max(1, Math.floor(160 / Math.max(d.w, d.h))), cv = document.createElement("canvas"); cv.width = d.w * k; cv.height = d.h * k;
  const ctx = cv.getContext("2d"); d.cells.forEach((v, i) => { ctx.fillStyle = d.pal[v] || "#fff"; ctx.fillRect((i % d.w) * k, Math.floor(i / d.w) * k, k, k); });
  return cv.toDataURL("image/png");
}
function dotSave() {
  const d = dotEd; d.name = ($("dot-name").value || "").trim() || "이름 없는 도트 도안";
  const data = { type: "dot", name: d.name, w: d.w, h: d.h, cells: enc(d.cells), pal: d.pal.slice(), thumb: dotThumb(d), target: d.h, craft: "any", pages: [] };
  const old = d.id && myPats.find(x => x.id === d.id);
  if (old) Object.assign(old, data, { row: Math.min(old.row || 0, d.h) });
  else myPats.push(Object.assign({ id: "d" + Date.now().toString(36), row: 0, created: Date.now() }, data));
  mySave(); closeSheets(); state.tab = "patterns"; state.mode = "mine"; saveLocal(); render(); toast(old ? "도트 도안을 고쳤어요" : "도트 도안을 저장했어요");
}

// ----- 보면서 뜨기 -----
function dotRuns(p, row) {
  const cells = dec(p.cells), r = p.h - 1 - row, line = cells.slice(r * p.w, r * p.w + p.w), rtl = (row + 1) % 2 === 1;
  const seq = rtl ? line.slice().reverse() : line, out = [];
  let i = 0; while (i < seq.length) { let j = i; while (seq[j] === seq[i]) j++; out.push([seq[i], j - i]); i = j; }
  return { rtl, html: out.map(([c, n]) => `<span class="run"><i style="background:${p.pal[c]};color:${inkOn(p.pal[c])}">${DOT_SYM[c] || ""}</i>${n}</span>`).join("") };
}
function dotOpenView(p) {
  myView.id = p.id; $("mypat-h").textContent = p.name;
  const row = Math.min(p.row || 0, p.h), done = row >= p.h, pct = Math.round(row / p.h * 100);
  const now = done ? `<div class="dot-now done"><b>다 떴어요!</b><span>${p.h}단 완성</span></div>`
    : (() => { const r = dotRuns(p, row); return `<div class="dot-now"><div class="dn-hd"><b>지금 ${row + 1}단</b><span>${r.rtl ? "← 오른쪽부터" : "왼쪽부터 →"}</span></div><div class="runs">${r.html}</div></div>`; })();
  $("mypat-body").innerHTML = `<div class="dot-wrap view"><canvas id="dot-vcv" aria-label="도트 도안 ${p.w}코 × ${p.h}단"></canvas></div>
    <div class="dot-vtools"><button type="button" data-dot-vsym aria-pressed="${dotView.sym}">기호 ${dotView.sym ? "켜짐" : "꺼짐"}</button><span class="my-hint">초록 ✓ 다 뜬 단 · 보라 테두리 지금 단 · ◀▶ 뜨는 방향(왕복 기준)</span></div>
    ${now}
    <div class="my-ctr"><span class="label">단수 세기 · ${p.w}코 × ${p.h}단</span><div class="my-ctr-row"><button type="button" data-dot-row="-1" aria-label="한 단 빼기"${row ? "" : " disabled"}>−</button>
      <output aria-live="polite"><b>${row}</b>단 <small>/ ${p.h}단</small></output><button type="button" data-dot-row="1" class="plus" aria-label="한 단 더하기"${done ? " disabled" : ""}>+1</button></div>
      <div class="pbar"><i style="width:${pct}%"></i></div></div>
    <div class="my-acts"><button type="button" class="ghost-btn" data-dot-edit="${p.id}">그림 고치기</button><button type="button" class="ghost-btn danger" data-my-del="${p.id}">삭제</button></div>`;
  if ($("sheet-mypat").hidden) openSheet("sheet-mypat");
  requestAnimationFrame(() => dotDraw($("dot-vcv"), { w: p.w, h: p.h, cells: dec(p.cells), pal: p.pal }, { row, sym: dotView.sym }));
}

// ----- 색 편집 팝업 -----
function dotPop(open) {
  let el = $("dot-pop");
  if (!open) { if (el) el.remove(); return; }
  if (!el) { el = document.createElement("div"); el.id = "dot-pop"; el.className = "dot-pop-bg"; document.body.appendChild(el); }
  const d = dotEd, c = d.pal[d.cur];
  el.innerHTML = `<div class="dot-pop" role="dialog" aria-modal="true" aria-labelledby="dot-pop-h">
    <div class="dot-pop-hd"><h4 id="dot-pop-h">색 편집</h4><button type="button" class="dot-pop-x" data-dot-popx aria-label="닫기">✕</button></div>
    <p class="dot-pop-sub">바꿀 색을 고르세요</p>
    <div class="dot-pal">${d.pal.map((x, i) => `<button type="button" class="dot-sw" data-dot-pc="${i}" style="background:${x}" aria-pressed="${d.cur === i}" aria-label="${i === 0 ? "바탕색" : `${i + 1}번 색`}"><span style="color:${inkOn(x)}">${DOT_SYM[i]}</span>${i === 0 ? "<small>바탕</small>" : ""}</button>`).join("")}</div>
    <label class="dot-cpick" style="background:${c}"><span style="color:${inkOn(c)}">${DOT_SYM[d.cur]}</span><b style="color:${inkOn(c)}">눌러서 색 바꾸기</b><input type="color" id="dot-editc" value="${c}"></label>
    <p class="dot-pop-sub">${d.cur === 0 ? "바탕색은 지울 수 없고 색만 바꿀 수 있어요." : `이 색으로 칠한 칸: ${d.cells.filter(v => v === d.cur).length}개`}</p>
    <div class="dot-pop-ft">${d.cur > 0 ? `<button type="button" class="ghost-btn danger" data-dot-cdel>이 색 삭제</button>` : ""}<button type="button" class="primary" data-dot-popx>완료</button></div></div>`;
}

// ----- 이벤트 -----
document.addEventListener("click", e => {
  const t = e.target;
  if (t.closest("[data-dot-new]")) { dotOpenEditor(); return; }
  if (t.closest("[data-dot-pop]")) { if (dotEd.tool === "erase") dotEd.tool = "pen"; dotPop(true); return; }
  if (t.closest("[data-dot-popx]") || t.id === "dot-pop") { dotPop(false); dotRenderEditor(); return; }
  const pc = t.closest("[data-dot-pc]"); if (pc) { dotEd.cur = +pc.dataset.dotPc; dotPop(true); return; }
  const c = t.closest("[data-dot-c]"); if (c) { if (dotEd.cur === +c.dataset.dotC && dotEd.tool !== "erase") { dotPop(true); return; } dotEd.cur = +c.dataset.dotC; if (dotEd.tool === "erase") dotEd.tool = "pen"; dotRenderEditor(); return; }
  const tl = t.closest("[data-dot-tool]"); if (tl) { dotEd.tool = tl.dataset.dotTool; dotRenderEditor(); return; }
  if (t.closest("[data-dot-undo]")) { const h = dotEd.hist.pop(); if (h) dotEd.cells = h; dotRenderEditor(); return; }
  if (t.closest("[data-dot-clear]")) { if (!confirm("그린 칸을 모두 지울까요?")) return; dotEd.hist.push(dotEd.cells.slice()); dotEd.cells.fill(0); dotRenderEditor(); return; }
  if (t.closest("[data-dot-resize]")) {
    const w = Math.max(4, Math.min(80, parseInt($("dot-w").value, 10) || dotEd.w)), h = Math.max(4, Math.min(80, parseInt($("dot-h").value, 10) || dotEd.h));
    dotEd.name = $("dot-name").value; dotEd.hist.push(dotEd.cells.slice()); dotResize(w, h); dotRenderEditor(); return;
  }
  if (t.closest("[data-dot-save]")) { dotSave(); return; }
  if (t.closest("[data-dot-cdel]")) {   // 색 삭제: 그 색 칸은 바탕색으로, 뒤 번호는 한 칸씩 당김
    const d = dotEd, k = d.cur, used = d.cells.filter(v => v === k).length;
    if (k === 0 || (used && !confirm(`이 색으로 칠한 칸 ${used}개는 바탕색이 돼요. 삭제할까요?`))) return;
    d.name = $("dot-name").value; d.hist.push(d.cells.slice());
    d.cells = d.cells.map(v => v === k ? 0 : v > k ? v - 1 : v); d.pal.splice(k, 1); d.cur = Math.min(k, d.pal.length - 1);
    dotRenderEditor(); dotPop(true); return;
  }
  if (t.closest("[data-dot-sym]")) { dotEd.name = $("dot-name").value; dotEd.sym = !dotEd.sym; dotRenderEditor(); return; }
  if (t.closest("[data-dot-vsym]")) { dotView.sym = !dotView.sym; const p = myPats.find(x => x.id === myView.id); if (p) dotOpenView(p); return; }
  const ed = t.closest("[data-dot-edit]"); if (ed) { const p = myPats.find(x => x.id === ed.dataset.dotEdit); if (p) { closeSheets(); dotOpenEditor(p); } return; }
  const rw = t.closest("[data-dot-row]"); if (rw) { const p = myPats.find(x => x.id === myView.id); if (p) { p.row = Math.max(0, Math.min(p.h, (p.row || 0) + (+rw.dataset.dotRow))); mySave(); dotOpenView(p); } return; }
});
document.addEventListener("input", e => {
  if (e.target.id === "dot-name") dotEd.name = e.target.value;
  if (e.target.id === "dot-editc") {   // 색 바꾸기: 고르는 동안 바로 반영
    const c = e.target.value.toUpperCase(); dotEd.pal[dotEd.cur] = c;
    const pick = e.target.closest(".dot-cpick"); if (pick) pick.style.background = c;
    document.querySelectorAll(`[data-dot-c="${dotEd.cur}"],[data-dot-pc="${dotEd.cur}"]`).forEach(sw => sw.style.background = c);
    dotDraw.last = dotDraw($("dot-cv"), dotEd, { sym: dotEd.sym });
  }
});
document.addEventListener("change", e => {
  if (e.target.id === "dot-editc") { dotEd.name = $("dot-name").value; dotRenderEditor(); dotPop(true); return; }
  if (e.target.id !== "dot-addc") return;
  dotEd.name = $("dot-name").value; dotEd.pal.push(e.target.value.toUpperCase()); dotEd.cur = dotEd.pal.length - 1; dotEd.tool = "pen"; dotRenderEditor();
});
(function () {   // 칸 칠하기 (누르고 끌기)
  let painting = false;
  document.addEventListener("pointerdown", e => {
    if (e.target.id !== "dot-cv") return;
    painting = true; e.target.setPointerCapture(e.pointerId); e.preventDefault();
    dotEd.hist.push(dotEd.cells.slice()); if (dotEd.hist.length > 40) dotEd.hist.shift();
    dotDraw.last = dotDraw.last || { cs: 20, L: 26 };
    dotPaint(dotCellAt(e)); const u = document.querySelector("[data-dot-undo]"); if (u) u.disabled = false;
  });
  document.addEventListener("pointermove", e => { if (painting && dotEd.tool !== "fill") dotPaint(dotCellAt(e)); });
  document.addEventListener("pointerup", () => { painting = false; });
})();
document.addEventListener("keydown", e => {   // Esc는 색 편집 팝업부터 닫기
  if (e.key === "Escape" && $("dot-pop")) { e.stopImmediatePropagation(); dotPop(false); dotRenderEditor(); }
}, true);
