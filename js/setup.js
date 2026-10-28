// ---------- 뜨기 전 설정: 폭→콧수, 길이→목표 단수 ----------
const GAUGE = { knit: { thin: [28, 36], mid: [18, 24], thick: [12, 16] }, crochet: { thin: [24, 26], mid: [16, 18], thick: [10, 11] } };
const ROWMUL = { knit: { garter: 1.4, brioche: 1.9 }, crochet: { filetcat: 0.5, hdc: 0.7, tr: 0.38, blohdc: 0.7, blodc: 0.5, vst: 0.5, cluster: 0.7, grannyst: 0.5, puff: 0.8, dc: 0.5, shell: 0.5, waffle: 0.5, lace: 0.5, mesh: 0.6, popcorn: 0.9 } };
const ROWPX = { knit: 10, crochet: { filetcat: 14, hdc: 13, tr: 24, blohdc: 13, blodc: 18, vst: 18, cluster: 13, grannyst: 18, puff: 12, sc: 9, moss: 9, stripe: 9, popcorn: 11, dc: 18, shell: 15, waffle: 20, lace: 20, mesh: 13, cat: 9, blackcat: 9 } };
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
  const dims = projDims(proj);
  const mode = edit ? (edit.mode || "flat") : (probe.rr && (dims[2] || probe.roundFirst) ? "round" : "flat");
  const et = edit && triOk(edit.tri) ? edit.tri : null;
  state.setup = { shape: et || (!edit && proj === "shawl" && mode !== "round") ? "tri" : "rect", tri: { ...(et || TRI_DEF), n0: et ? et.n0 : craft === "crochet" ? 2 : 3 },
    pid, craft, proj, mode, editId: edit ? edit.id : null, w: edit && edit.w ? edit.w : dims[0], l: edit && edit.l ? edit.l : dims[1], n: edit ? edit.n : null, r: edit ? edit.target : null };
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
  if (isTri(su)) { if (fromMeasures) su.n = Math.round(su.w / 10 * su.g[0]); triSync(su); }
}
const isTri = su => su.shape === "tri" && su.mode !== "round" && su.kind === "measured";
function triSync(su) { su.n = triFit(su.tri, su.n); su.r = triRows(su.tri, su.n); su.w = wFromN(su, su.n); su.l = lFromR(su, su.r); }
function setupSummary() {
  const su = state.setup;
  if (su.kind !== "measured") return "";
  const W = wFromN(su, su.n), Lc = lFromR(su, su.r), tri = isTri(su);
  const gpa = GPA[su.use] * (su.craft === "crochet" ? 1.3 : 1) * su.f;
  const need = Math.max(5, Math.round(W * Lc * (tri ? .5 : 1) * gpa / 100 / 5) * 5);
  const enough = su.have == null ? "" : su.have >= need ? `<span class="okc">가진 실 ${su.have}g으로 충분해요</span>` : `<span class="warnc">가진 실 ${su.have}g보다 약 ${need - su.have}g 더 필요해요</span>`;
  if (tri) { const t = su.tri, how = `${t.k === 1 ? "매 단" : "2단마다"} ${t.a === 2 ? "양 끝 1코씩" : "4코씩"}`;
    return (t.dir === "inc" ? `<b>${t.n0}코</b>로 시작해 ${how} 늘려 <b>${su.n}코</b>까지` : `<b>${su.n}코</b>로 시작해 ${how} 줄여 <b>${t.n0}코</b>까지`)
      + `, <b>${su.r}단</b> · 넓은 쪽 약 ${Math.round(W)}cm, 높이 약 ${Math.round(Lc)}cm · 실 약 ${need}g ${enough}`; }
  return `<b>${su.n}코</b>로 <b>${su.r}단</b> 뜨면 약 ${Math.round(W)}cm × ${Math.round(Lc)}cm${su.mode === "round" ? " (원통 둘레 × 길이)" : ""} · 실 약 ${need}g ${enough}`;
}
function renderSetup() {
  const su = state.setup, b = setupBase(su.pid, su.craft, su.mode, su.proj);
  const projs = PROJECTS[su.craft].filter(pr => b.p.suits.some(t => pr.tags.includes(t)));
  let h = `<div class="su-head"><canvas data-sw="${su.pid}" aria-hidden="true"></canvas><div><b>${b.p.name}</b><span>${craftName(su.craft)} · ${WEIGHTS[su.use].name} 기준</span></div></div>`;
  const mine = state.myProj.filter(m => m.craft === su.craft), isMine = mine.some(m => m.id === su.proj);
  h += `<div class="field"><label class="label" for="su-proj">무엇을 뜰까요</label>
    <div class="su-proj bsel"><select id="su-proj" class="my-in">
      <option value=""${!su.proj && !su.newProj ? " selected" : ""}>정하지 않음</option>
      <optgroup label="이 무늬로 뜰 수 있는 것">${projs.map(pr => `<option value="${pr.id}"${su.proj === pr.id ? " selected" : ""}>${pr.name}</option>`).join("")}</optgroup>
      ${mine.length ? `<optgroup label="내가 등록한 작품">${mine.map(m => `<option value="${m.id}"${su.proj === m.id ? " selected" : ""}>${esc(m.name)}</option>`).join("")}</optgroup>` : ""}
      <option value="__new"${su.newProj ? " selected" : ""}>＋ 새 작품 등록…</option>
    </select></div>
    ${su.newProj ? `<div class="su-new"><input id="su-pname" class="my-in" type="text" maxlength="30" placeholder="예: 고양이 담요, 조카 목도리" autocomplete="off"><button type="button" class="primary" data-su-add>등록</button>
      <p class="hint">이름만 정하면 돼요. 크기는 아래 폭·길이에 적으면 이 작품에 같이 저장돼요.</p></div>` : ""}
    ${isMine ? `<button type="button" class="link danger su-delp" data-su-delproj="${su.proj}">이 작품 내 목록에서 지우기</button>` : ""}</div>`;
  if (b.rx.rr || su.mode === "round") h += `<div class="field"><span class="label">뜨는 방식</span><div class="seg2" role="group" aria-label="뜨는 방식">
    <button type="button" data-su-mode="flat" aria-pressed="${su.mode === "flat"}">왕복으로 (평면)</button><button type="button" data-su-mode="round" aria-pressed="${su.mode === "round"}">원통으로 (둘레)</button></div></div>`;
  const tri = isTri(su), t = su.tri;
  if (su.kind === "measured" && su.mode !== "round") {
    const o = (key, v, label) => `<button type="button" data-su-tri="${key}:${v}" aria-pressed="${t[key] === v}">${label}</button>`;
    h += `<div class="field"><span class="label">모양</span><div class="seg2" role="group" aria-label="모양">
      <button type="button" data-su-shape="rect" aria-pressed="${!tri}">네모</button><button type="button" data-su-shape="tri" aria-pressed="${tri}">삼각형</button></div>
      ${tri ? `<div class="tri-opts">
        <div class="seg2" role="group" aria-label="어디서 시작">${o("dir", "inc", "꼭짓점부터 늘리기")}${o("dir", "dec", "넓은 쪽부터 줄이기")}</div>
        <div class="seg2" role="group" aria-label="얼마나 자주">${o("k", 2, "2단마다")}${o("k", 1, "매 단")}</div>
        <div class="seg2" role="group" aria-label="한 번에 몇 코">${o("a", 2, "양 끝 1코씩 (2코)")}${o("a", 4, "가운데까지 4코")}</div></div>` : ""}</div>`;
  }
  if (tri) {
    h += `<div class="su-grid">
        <label class="su-f" for="su-w"><span class="label">넓은 쪽 폭</span><span class="inp"><input id="su-w" type="number" inputmode="decimal" min="1" max="400" value="${Math.round(su.w)}"><em>cm</em></span></label>
        <span class="arr" aria-hidden="true">→</span>
        <label class="su-f" for="su-n"><span class="label">가장 넓을 때</span><span class="inp"><input id="su-n" type="number" inputmode="numeric" min="1" max="2000" value="${su.n}"><em>코</em></span></label>
        <label class="su-f" for="su-n0"><span class="label">꼭짓점</span><span class="inp"><input id="su-n0" type="number" inputmode="numeric" min="1" max="50" value="${t.n0}"><em>코</em></span></label>
        <span class="arr" aria-hidden="true">→</span>
        <label class="su-f" for="su-r"><span class="label">목표</span><span class="inp"><input id="su-r" type="number" inputmode="numeric" min="1" max="5000" value="${su.r}"><em>단</em></span></label>
      </div>
      <p class="hint">삼각형은 단마다 콧수가 바뀌어요. 카운터가 <b>이번 단에 늘릴지(줄일지)</b>와 <b>몇 코가 되는지</b> 단마다 알려 줘요. 무늬는 늘어난 코까지 이어서 떠요. 게이지(10cm에 ${su.g[0]}코 ${Math.round(su.g[1])}단)는 어림값이에요.</p>
      <div class="su-sum" id="su-sum">${setupSummary()}</div>`;
  } else if (su.kind === "measured") {
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
  if (isTri(su)) {
    const t = su.tri;
    if (id === "su-w") su.n = Math.round(v / 10 * su.g[0]);
    if (id === "su-n") su.n = Math.round(v);
    if (id === "su-n0") { t.n0 = Math.max(1, Math.min(50, Math.round(v))); if (su.n <= t.n0) su.n = t.n0 + t.a; }
    if (id === "su-r") su.n = t.n0 + t.a * Math.ceil(Math.round(v) / t.k);
    triSync(su);
    if (id !== "su-n" && $("su-n")) $("su-n").value = su.n;
    if (id !== "su-r" && $("su-r")) $("su-r").value = su.r;
    if (id !== "su-w" && $("su-w")) $("su-w").value = Math.round(su.w);
    const sm = $("su-sum"); if (sm) sm.innerHTML = setupSummary(); return;
  }
  if (id === "su-w") { su.w = v; su.n = nFromW(su, v); $("su-n").value = su.n; }
  if (id === "su-n") { su.n = Math.round(v); su.w = wFromN(su, su.n); }
  if (id === "su-l") { su.l = v; su.r = rFromL(su, v); $("su-r").value = su.r; }
  if (id === "su-r") { su.r = Math.round(v); if (su.kind === "measured") su.l = lFromR(su, su.r); }
  const sum = $("su-sum"); if (sum && su.kind === "measured") sum.innerHTML = setupSummary();
}
// 무엇을 뜰까요: 목록에 없는 작품을 직접 이름 지어 등록
function addMyProj() {
  const su = state.setup, i = $("su-pname"), name = i ? i.value.trim() : "";
  if (!su) return; if (!name) { toast("작품 이름을 적어 주세요"); if (i) i.focus(); return; }
  const dup = state.myProj.find(m => m.craft === su.craft && m.name === name) || PROJECTS[su.craft].find(p => p.name === name);
  if (dup) { su.proj = dup.id; su.newProj = false; renderSetup(); toast("이미 있는 작품이라 그걸 골랐어요"); return; }
  const m = { id: "u" + Date.now().toString(36), name, craft: su.craft, w: Math.round(su.w) || 20, l: Math.round(su.l) || 20, round: su.mode === "round" };
  state.myProj.push(m); su.proj = m.id; su.newProj = false; save(); renderSetup(); toast(`'${name}'을(를) 내 작품으로 등록했어요`);
}
function commitSetup() {
  const su = state.setup; if (!su) return;
  const mine = state.myProj.find(m => m.id === su.proj);   // 내 작품이면 지금 정한 크기를 같이 기억
  if (mine && su.kind === "measured") { mine.w = Math.round(su.w); mine.l = Math.round(su.l); mine.round = su.mode === "round"; }
  const W = su.kind === "measured" ? wFromN(su, su.n) : null, Lc = su.kind === "measured" ? lFromR(su, su.r) : null;
  const fields = { mode: su.mode, proj: su.proj || null, n: su.n, target: su.r, w: W, l: Lc, use: su.use, tri: isTri(su) ? { ...su.tri } : null };
  if (su.editId) {
    const s = state.sessions.find(x => x.id === su.editId);
    if (s) Object.assign(s, fields, { at: Date.now() });
    state.setup = null; save(); closeSheets(); render(); toast("뜨는 방법을 바꿨어요"); return;
  }
  const s = Object.assign({ id: "s" + Date.now().toString(36), craft: su.craft, pid: su.pid, cols: su.cols, row: 0, st: 0, stAuto: true, at: Date.now() }, fields);
  state.sessions.unshift(s); state.sess = s.id; state.tab = "counter"; state.setup = null;
  save(); closeSheets(); render(); scroller().scrollTo(0, 0); toast("단수 카운터를 만들었어요");
}
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.id === "su-pname") { e.preventDefault(); addMyProj(); } });
// 무엇을 뜰까요: 목록에서 고르거나 '＋ 새 작품 등록…'
document.addEventListener("change", e => {
  if (e.target.id !== "su-proj") return;
  const su = state.setup; if (!su) return;
  if (e.target.value === "__new") { su.newProj = true; renderSetup(); const i = $("su-pname"); if (i) i.focus(); return; }
  su.newProj = false; su.proj = e.target.value || null;
  const dm = projDims(su.proj); su.w = dm[0]; su.l = dm[1];
  const probe = recipe(su.craft, su.pid, [], "flat"); if (!su.editId) su.mode = probe.rr && (dm[2] || probe.roundFirst) ? "round" : "flat";
  if (su.proj === "shawl" && su.mode !== "round") su.shape = "tri";
  su.n = null; su.r = null; recalcSetup(true); renderSetup();
});
// 모양: 네모 / 삼각형, 삼각형 늘림 방식
document.addEventListener("click", e => {
  const b = e.target.closest && e.target.closest("[data-su-shape],[data-su-tri]"), su = state.setup; if (!b || !su) return;
  if (b.dataset.suShape) { su.shape = b.dataset.suShape; recalcSetup(true); }
  else { const [k, v] = b.dataset.suTri.split(":"); su.tri[k] = k === "dir" ? v : +v; if (isTri(su)) triSync(su); }
  renderSetup();
});
