// ---------- 뜨기 전 설정: 폭→콧수, 길이→목표 단수 ----------
const GAUGE = { knit: { thin: [28, 36], mid: [18, 24], thick: [12, 16] }, crochet: { thin: [24, 26], mid: [16, 18], thick: [10, 11] } };
const ROWMUL = { knit: { garter: 1.4, brioche: 1.9 }, crochet: { hdc: 0.7, tr: 0.38, blohdc: 0.7, blodc: 0.5, vst: 0.5, cluster: 0.7, grannyst: 0.5, puff: 0.8, dc: 0.5, shell: 0.5, waffle: 0.5, lace: 0.5, mesh: 0.6, popcorn: 0.9 } };
const ROWPX = { knit: 10, crochet: { hdc: 13, tr: 24, blohdc: 13, blodc: 18, vst: 18, cluster: 13, grannyst: 18, puff: 12, sc: 9, moss: 9, stripe: 9, popcorn: 11, dc: 18, shell: 15, waffle: 20, lace: 20, mesh: 13, cat: 9, blackcat: 9 } };
const DIMS = { coaster: [10, 10], scrunchie: [40, 8], sleeve: [24, 8, 1], pouch: [20, 30], headband: [45, 10], wrist: [18, 18, 1], babyhat: [40, 16, 1],
  cowl: [56, 25, 1], mitten: [20, 22, 1], beanie: [50, 22, 1], socks: [20, 45, 1], scarf: [20, 150], shawl: [120, 55], vest: [90, 55, 1],
  sweater: [100, 60, 1], blanket: [80, 100], scrubby: [12, 12], bucket: [55, 20], netbag: [35, 70], catbag: [24, 24], catround: [22, 22], catcoaster: [11, 11], cardwallet: [11, 24], cakewallet: [11, 16], catpurse: [13, 18], tomatowallet: [11, 16], breadcat: [11, 16], calicowallet: [12, 17], catfiletblanket: [92, 63] };
const TAIL_TARGET = { granny: 6, c2c: 20 };
function gaugeOf(craft, use, pid) { const g = GAUGE[craft][use] || GAUGE[craft].mid; return [g[0], g[1] * ((ROWMUL[craft] || {})[pid] || 1)]; }
const toMult = (x, m) => Math.max(m[0] + m[1], Math.round((x - m[1]) / m[0]) * m[0] + m[1]);
function multText(m, craft) {
  const base = m[0] === 1 ? "아무 수" : `${m[0]}의 배수`;
  if (craft === "crochet") return `기초 사슬 ${base}${m[1] ? ` + ${m[1]}코` : ""}`;
  return m[0] === 1 && !m[1] ? "아무 콧수" : `${base}${m[1] ? ` + ${m[1]}코` : ""}`;
}
// stitches ↔ width (crochet counts the foundation chain, which carries the turning chain)
function nFromW(su, w) { const sts = w / 10 * su.g[0]; return toMult(su.craft === "crochet" ? sts + su.mult[1] : sts, su.mult); }
function wFromN(su, n) { return (su.craft === "crochet" ? n - su.mult[1] : n) / su.g[0] * 10; }
function rFromL(su, l) { const r = Math.max(1, Math.round(l / 10 * su.g[1])); const L = su.L; return su.setupLen + (L > 1 ? Math.max(L, Math.round(r / L) * L) : r); }
function lFromR(su, r) { return Math.max(0, r - su.setupLen) / su.g[1] * 10; }

function setupBase(pid, craft, mode, proj) {
  const g = currentGroup().g || PH, p = PATTERNS[craft].find(x => x.id === pid);
  const r = craft === state.craft ? evalPattern(p, g) : { skip: true };
  const use = g.ph ? "mid" : g.use;
  const cols = colsFor(p, r, g);
  const rx = recipe(craft, pid, cols, mode);
  return { p, r, g, use, cols, rx };
}
function openSetup(opts) {
  const edit = opts.editId ? state.sessions.find(s => s.id === opts.editId) : null;
  const pid = edit ? edit.pid : opts.pid, craft = edit ? edit.craft : opts.craft;
  const proj = edit ? edit.proj : (opts.proj || null);
  const probe = recipe(craft, pid, [], "flat");
  const dims = DIMS[proj] || [20, 20];
  const mode = edit ? (edit.mode || "flat") : (probe.rr && (dims[2] || probe.roundFirst) ? "round" : "flat");
  state.setup = { pid, craft, proj, mode, editId: edit ? edit.id : null, w: edit && edit.w ? edit.w : dims[0], l: edit && edit.l ? edit.l : dims[1], n: edit ? edit.n : null, r: edit ? edit.target : null };
  if (!edit && $("sheet-pat").hidden === false) { $("sheet-pat").hidden = true; }
  recalcSetup(!edit);
  renderSetup();
  openSheet("sheet-start");
  $("sheet-start").querySelector(".sheet-panel").scrollTop = 0;
}
function recalcSetup(fromMeasures) {
  const su = state.setup, b = setupBase(su.pid, su.craft, su.mode, su.proj);
  su.g = gaugeOf(su.craft, b.use, su.pid); su.mult = b.rx.mult; su.L = b.rx.rows.length; su.setupLen = (b.rx.setup || []).length;
  su.kind = b.rx.once ? "once" : b.rx.tail ? "tail" : "measured";
  su.use = b.use; su.cols = b.cols; su.have = b.r.skip ? null : b.r.have; su.f = b.p.f;
  if (su.kind === "once") { su.r = su.setupLen + su.L; su.n = null; return; }
  if (su.kind === "tail") { su.r = su.r || TAIL_TARGET[su.pid] || 10; su.n = null; return; }
  if (fromMeasures || !su.n) su.n = nFromW(su, su.w);
  if (fromMeasures || !su.r) su.r = rFromL(su, su.l);
}
function setupSummary() {
  const su = state.setup;
  if (su.kind !== "measured") return "";
  const W = wFromN(su, su.n), Lc = lFromR(su, su.r);
  const gpa = GPA[su.use] * (su.craft === "crochet" ? 1.3 : 1) * su.f;
  const need = Math.max(5, Math.round(W * Lc * gpa / 100 / 5) * 5);
  const enough = su.have == null ? "" : su.have >= need ? `<span class="okc">가진 실 ${su.have}g으로 충분해요</span>` : `<span class="warnc">가진 실 ${su.have}g보다 약 ${need - su.have}g 더 필요해요</span>`;
  return `<b>${su.n}코</b>로 <b>${su.r}단</b> 뜨면 약 ${Math.round(W)}cm × ${Math.round(Lc)}cm${su.mode === "round" ? " (원통 둘레 × 길이)" : ""} · 실 약 ${need}g ${enough}`;
}
function renderSetup() {
  const su = state.setup, b = setupBase(su.pid, su.craft, su.mode, su.proj);
  const projs = PROJECTS[su.craft].filter(pr => b.p.suits.some(t => pr.tags.includes(t)));
  let h = `<div class="su-head"><canvas data-sw="${su.pid}" aria-hidden="true"></canvas><div><b>${b.p.name}</b><span>${craftName(su.craft)} · ${WEIGHTS[su.use].name} 기준</span></div></div>`;
  h += `<div class="field"><span class="label">무엇을 뜰까요</span><div class="chiprow wrap" role="group" aria-label="작품">
    <button type="button" class="gchip" data-su-proj="" aria-pressed="${!su.proj}">정하지 않음</button>
    ${projs.map(pr => `<button type="button" class="gchip" data-su-proj="${pr.id}" aria-pressed="${su.proj === pr.id}">${pr.name}</button>`).join("")}</div></div>`;
  if (b.rx.rr || su.mode === "round") h += `<div class="field"><span class="label">뜨는 방식</span><div class="seg2" role="group" aria-label="뜨는 방식">
    <button type="button" data-su-mode="flat" aria-pressed="${su.mode === "flat"}">왕복으로 (평면)</button><button type="button" data-su-mode="round" aria-pressed="${su.mode === "round"}">원통으로 (둘레)</button></div></div>`;
  if (su.kind === "measured") {
    h += `<div class="su-grid">
        <label class="su-f" for="su-w"><span class="label">${su.mode === "round" ? "둘레" : "폭"}</span><span class="inp"><input id="su-w" type="number" inputmode="decimal" min="1" max="400" value="${Math.round(su.w)}"><em>cm</em></span></label>
        <span class="arr" aria-hidden="true">→</span>
        <label class="su-f" for="su-n"><span class="label">${su.craft === "crochet" ? "기초 사슬" : "코 잡기"}</span><span class="inp"><input id="su-n" type="number" inputmode="numeric" min="1" max="2000" value="${su.n}"><em>코</em></span></label>
        <label class="su-f" for="su-l"><span class="label">길이</span><span class="inp"><input id="su-l" type="number" inputmode="decimal" min="1" max="400" value="${Math.round(su.l)}"><em>cm</em></span></label>
        <span class="arr" aria-hidden="true">→</span>
        <label class="su-f" for="su-r"><span class="label">목표</span><span class="inp"><input id="su-r" type="number" inputmode="numeric" min="1" max="5000" value="${su.r}"><em>단</em></span></label>
      </div>
      <p class="hint">콧수는 이 무늬에 맞게 <b>${multText(su.mult, su.craft)}</b>로 맞췄어요${su.L > 1 ? `, 목표 단수는 무늬 한 번(${su.L}단)이 끝나는 단으로 맞췄어요` : ""}. 게이지(10cm에 ${su.g[0]}코 ${Math.round(su.g[1])}단)는 어림값이라 시험 조각을 떠 보고 숫자를 고쳐도 돼요.</p>
      <div class="su-sum" id="su-sum">${setupSummary()}</div>`;
  } else if (su.kind === "once") {
    h += `<div class="su-sum">이 도안은 순서대로 <b>${su.r}단</b>을 뜨면 완성돼요.</div>`;
  } else {
    h += `<label class="su-f one" for="su-r"><span class="label">몇 단까지 뜰까요</span><span class="inp"><input id="su-r" type="number" inputmode="numeric" min="1" max="500" value="${su.r}"><em>단</em></span></label>
      <p class="hint">${su.pid === "granny" ? "보통 6단이면 손바닥만 한 한 장이 돼요." : "단수만큼 블록이 대각선으로 늘어나요. 원하는 폭이 되면 줄이기 시작해요."}</p>`;
  }
  h += `<button type="button" class="primary wide" data-su-go>${su.editId ? "바꾼 대로 저장" : "이렇게 뜨기 시작"}</button>`;
  $("su-body").innerHTML = h;
  requestAnimationFrame(() => { const C = (su.cols.length ? su.cols : [{ hex: FALLBACK[0] }]).map(c => liftDark(c.hex)); $("su-body").querySelectorAll("canvas[data-sw]").forEach(cv => paintSwatch(cv, su.pid, C, false, su.craft)); });
}
function setupInput(id, v) {
  const su = state.setup; if (!su || !(v > 0)) return;
  if (id === "su-w") { su.w = v; su.n = nFromW(su, v); $("su-n").value = su.n; }
  if (id === "su-n") { su.n = Math.round(v); su.w = wFromN(su, su.n); }
  if (id === "su-l") { su.l = v; su.r = rFromL(su, v); $("su-r").value = su.r; }
  if (id === "su-r") { su.r = Math.round(v); if (su.kind === "measured") su.l = lFromR(su, su.r); }
  const sum = $("su-sum"); if (sum && su.kind === "measured") sum.innerHTML = setupSummary();
}
function commitSetup() {
  const su = state.setup; if (!su) return;
  const W = su.kind === "measured" ? wFromN(su, su.n) : null, Lc = su.kind === "measured" ? lFromR(su, su.r) : null;
  const fields = { mode: su.mode, proj: su.proj || null, n: su.n, target: su.r, w: W, l: Lc, use: su.use };
  if (su.editId) {
    const s = state.sessions.find(x => x.id === su.editId);
    if (s) Object.assign(s, fields, { at: Date.now() });
    state.setup = null; save(); closeSheets(); render(); toast("뜨는 방법을 바꿨어요"); return;
  }
  const s = Object.assign({ id: "s" + Date.now().toString(36), craft: su.craft, pid: su.pid, cols: su.cols, row: 0, st: 0, stAuto: true, at: Date.now() }, fields);
  state.sessions.unshift(s); state.sess = s.id; state.tab = "counter"; state.setup = null;
  save(); closeSheets(); render(); window.scrollTo(0, 0); toast("단수 카운터를 만들었어요");
}
