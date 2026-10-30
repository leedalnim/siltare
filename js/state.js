// 앱 화면을 스크롤하는 상자 (문서 대신 #root가 스크롤해요)
const scroller = () => document.getElementById("root") || document.scrollingElement;
// ---------- State ----------
const EXAMPLE = [
  { id: "e1", weight: "mid", grams: 100, color: "gray", texture: "smooth", label: "주먹 ×2" },
  { id: "e2", weight: "mid", grams: 30, color: "navy", texture: "smooth", label: "귤 ×1" },
  { id: "e3", weight: "mid", grams: 15, color: "mustard", texture: "smooth", label: "탁구공 ×1" },
  { id: "e4", weight: "thin", grams: 60, color: "ivory", texture: "smooth", label: "귤 ×2" }
];
let state = { craft: "knit", tab: "patterns", yarns: EXAMPLE.slice(), example: true, doubled: false, group: null, detail: null, pv: null, main: {}, openProj: new Set(),
  stars: {}, sessions: [], myProj: [], sess: null, mode: "rec", cat: "all", wake: false, updatedAt: 0, openMaybe: false };
const form = { weight: "mid", size: "fist", count: 1, color: "unknown", texture: "smooth" };

try {
  const saved = JSON.parse(localStorage.getItem(STORE) || "null");
  if (saved && Array.isArray(saved.yarns)) {
    state.craft = saved.craft === "crochet" ? "crochet" : "knit";
    state.yarns = saved.yarns; state.example = !!saved.example; state.doubled = false;
    if (["basket", "patterns", "projects", "counter", "guide"].includes(saved.tab)) state.tab = saved.tab;
    state.stars = saved.stars && typeof saved.stars === "object" ? saved.stars : {};
    state.sessions = Array.isArray(saved.sessions) ? saved.sessions : [];
    state.myProj = Array.isArray(saved.myProj) ? saved.myProj : [];
    state.sess = saved.sess || null; state.mode = ["all", "mine", "star"].includes(saved.mode) ? saved.mode : "rec"; state.cat = saved.cat || "all";
    state.wake = !!saved.wake; state.updatedAt = saved.updatedAt || 0;
  }
} catch (e) {}
// 저장된 데이터가 오래됐거나 일부 깨져 있어도 앱이 멈추지 않게 정리해요 (멀쩡한 항목은 그대로 둬요)
function cleanData() {
  state.yarns = (Array.isArray(state.yarns) ? state.yarns : []).filter(y => y && typeof y === "object" && +y.grams > 0).map(y => ({ ...y,
    id: String(y.id || "y" + Math.random().toString(36).slice(2, 8)), weight: WEIGHTS[y.weight] ? y.weight : y.weight === "thin2" ? "thin" : "mid",
    grams: Math.round(+y.grams), color: y.color || "unknown", texture: y.texture === "fluffy" ? "fluffy" : "smooth", label: String(y.label || "") }));
  state.sessions = (Array.isArray(state.sessions) ? state.sessions : []).filter(s => s && s.id && PATTERNS[s.craft] && PATTERNS[s.craft].some(p => p.id === s.pid))
    .map(s => ({ ...s, cols: Array.isArray(s.cols) ? s.cols : [], row: Math.max(0, parseInt(s.row, 10) || 0), st: Math.max(0, parseInt(s.st, 10) || 0) }));
  if (state.sess && !state.sessions.some(s => s.id === state.sess)) state.sess = null;
  if (!state.stars || typeof state.stars !== "object") state.stars = {};
  state.myProj = (Array.isArray(state.myProj) ? state.myProj : []).filter(x => x && x.id && x.name && (x.craft === "knit" || x.craft === "crochet"))
    .map(x => ({ id: String(x.id), name: String(x.name).slice(0, 30), craft: x.craft, w: +x.w > 0 ? +x.w : 20, l: +x.l > 0 ? +x.l : 20, round: !!x.round }));
}
cleanData();
// 한 번만: 잠깐 배포됐던 버전이 예시 실을 비운 채 저장했을 수 있어서, 바구니가 비어 있으면 예시 실을 되살려요.
try {
  if (!localStorage.getItem("leftover-yarn-exfix1")) {
    if (!state.yarns.length) { state.yarns = EXAMPLE.slice(); state.example = true; }
    localStorage.setItem("leftover-yarn-exfix1", "1");
    setTimeout(saveLocal, 0);
  }
} catch (e) {}
// 예시 실만 들어 있으면 항상 최신 예시로 바꿔요 (예전 예시의 분홍 보송한 가는 실 → 아이보리 매끈한 실)
if (state.example && state.yarns.some(y => /^e\d$/.test(y.id) && y.color === "pink")) { state.yarns = EXAMPLE.slice(); setTimeout(saveLocal, 0); }
// 처음 그대로인 예시 실인지 (고쳐 쓴 예시 실은 내 실로 봐요)
const isPristineExample = y => EXAMPLE.some(e => e.id === y.id && e.weight === y.weight && e.grams === y.grams && e.color === y.color && e.texture === y.texture);
function saveLocal() {
  try { localStorage.setItem(STORE, JSON.stringify({ craft: state.craft, tab: state.tab, sess: state.sess, mode: state.mode, cat: state.cat, wake: state.wake,
    yarns: state.yarns, example: state.example, doubled: state.doubled, stars: state.stars, sessions: state.sessions, myProj: state.myProj, updatedAt: state.updatedAt })); } catch (e) {}
}
// synced data changed: stamp, keep locally, send to the account store
function save() { state.updatedAt = Date.now(); saveLocal(); schedulePush(); }

// ---------- Logic ----------
const r5 = x => Math.max(5, Math.round(x / 5) * 5);
const sum = ys => ys.reduce((a, y) => a + y.grams, 0);
const colorKey = y => (y.color && y.color !== "unknown") ? y.color : "u-" + y.id;

// 작품 찾기: 기본 작품 + 내가 등록한 작품
const projFind = (craft, id) => id ? (PROJECTS[craft].find(q => q.id === id) || state.myProj.find(q => q.id === id && q.craft === craft) || null) : null;
const projDims = id => DIMS[id] || (() => { const m = state.myProj.find(q => q.id === id); return m ? [m.w, m.l, m.round ? 1 : 0] : [20, 20]; })();
function groups() {
  const out = [];
  WKEYS.forEach(w => {
    const ys = state.yarns.filter(y => y.weight === w);
    if (ys.length) out.push({ key: w, w, use: w, yarns: ys, title: WEIGHTS[w].name, mpg: WEIGHTS[w].mpg });
  });
  return out;
}
function currentGroup() {
  const gs = groups();
  if (!gs.length) return { gs, g: null };
  if (!gs.find(g => g.key === state.group)) state.group = gs.slice().sort((a, b) => sum(b.yarns) - sum(a.yarns))[0].key;
  return { gs, g: gs.find(x => x.key === state.group) };
}

function evalPattern(p, g) {
  if (g.ph) return { skip: "실을 담으면 이 무늬로 뜰 수 있는 양을 계산해요" };
  if (!p.w.includes(g.use)) return { skip: (g.doubled ? "두 가닥 합사 굵기" : WEIGHTS[g.use].name) + "에는 잘 안 맞아요" };
  const ys = g.yarns.filter(y => p.tex.includes(y.texture));
  if (!ys.length) return { skip: "보송한 실은 무늬가 털에 묻혀요" };
  const byColor = {};
  ys.forEach(y => { const k = colorKey(y); byColor[k] = (byColor[k] || 0) + y.grams; });
  const nColors = Object.keys(byColor).length;
  if (p.c >= 2 && nColors < 2) return { skip: "색이 2가지 이상 있어야 해요" };
  const mk0 = state.main[g.key];
  const mainKey = (mk0 && byColor[mk0] != null) ? mk0 : Object.keys(byColor).sort((a, b) => byColor[b] - byColor[a])[0];
  const multi = p.c >= 2 || (p.mc && nColors >= 2);
  const have = multi ? sum(ys) : byColor[mainKey];
  const wi = WKEYS.indexOf(g.use);
  const projs = PROJECTS[state.craft]
    .filter(pr => pr.g[wi] != null && pr.tags.some(t => p.suits.includes(t)))
    .map(pr => {
      const need = r5(pr.g[wi] * p.f);
      const ratio = have / need;
      const st = ratio >= 1.15 ? "ok" : ratio >= 0.95 ? "tight" : ratio >= 0.75 ? "risk" : "no";
      return { pr, need, ratio, st };
    });
  const doable = projs.filter(x => x.st !== "no").sort((a, b) => (a.st === "risk") - (b.st === "risk") || b.need - a.need);
  const later = projs.filter(x => x.st === "no").sort((a, b) => a.need - b.need);
  const sure = doable.filter(x => x.st !== "risk").length;
  const usedYs = multi ? ys : ys.filter(y => colorKey(y) === mainKey);
  return { have, nColors, doable, later, sure, fluffy: usedYs.some(y => y.texture === "fluffy"), ys, byColor, mainKey, multi };
}

function analyse(g) {
  const pats = PATTERNS[state.craft].map(p => ({ p, r: evalPattern(p, g) }));
  const ok = pats.filter(x => !x.r.skip && x.r.doable.length)
    .sort((a, b) => b.r.sure - a.r.sure || a.p.d - b.p.d || (b.r.doable[0]?.need || 0) - (a.r.doable[0]?.need || 0));
  const skipped = pats.filter(x => x.r.skip || !x.r.doable.length);
  let best = null;
  ok.forEach(({ p, r }) => r.doable.forEach(x => {
    if (x.st === "risk") return;
    if (!best || x.need > best.x.need || (x.need === best.x.need && p.d < best.p.d)) best = { p, r, x };
  }));
  return { pats, ok, skipped, best };
}
