// ---------- State ----------
const EXAMPLE = [
  { id: "e1", weight: "mid", grams: 100, color: "gray", texture: "smooth", label: "주먹 ×2" },
  { id: "e2", weight: "mid", grams: 30, color: "navy", texture: "smooth", label: "귤 ×1" },
  { id: "e3", weight: "mid", grams: 15, color: "mustard", texture: "smooth", label: "탁구공 ×1" },
  { id: "e4", weight: "thin", grams: 60, color: "pink", texture: "fluffy", label: "귤 ×2" }
];
let state = { craft: "knit", tab: "patterns", yarns: EXAMPLE.slice(), example: true, doubled: false, group: null, detail: null, pv: null, main: {}, openProj: new Set(),
  stars: {}, sessions: [], sess: null, mode: "rec", cat: "all", wake: false, updatedAt: 0, openMaybe: false };
const form = { weight: "mid", size: "fist", count: 1, color: "unknown", texture: "smooth" };

try {
  const saved = JSON.parse(localStorage.getItem(STORE) || "null");
  if (saved && Array.isArray(saved.yarns)) {
    state.craft = saved.craft === "crochet" ? "crochet" : "knit";
    state.yarns = saved.yarns; state.example = !!saved.example; state.doubled = !!saved.doubled;
    if (["basket", "patterns", "projects", "counter", "guide"].includes(saved.tab)) state.tab = saved.tab;
    state.stars = saved.stars && typeof saved.stars === "object" ? saved.stars : {};
    state.sessions = Array.isArray(saved.sessions) ? saved.sessions : [];
    state.sess = saved.sess || null; state.mode = ["all", "mine"].includes(saved.mode) ? saved.mode : "rec"; state.cat = saved.cat || "all";
    state.wake = !!saved.wake; state.updatedAt = saved.updatedAt || 0;
  }
} catch (e) {}
// 한 번만: 잠깐 배포됐던 버전이 예시 실을 비운 채 저장했을 수 있어서, 바구니가 비어 있으면 예시 실을 되살려요.
try {
  if (!localStorage.getItem("leftover-yarn-exfix1")) {
    if (!state.yarns.length) { state.yarns = EXAMPLE.slice(); state.example = true; }
    localStorage.setItem("leftover-yarn-exfix1", "1");
    setTimeout(saveLocal, 0);
  }
} catch (e) {}
function saveLocal() {
  try { localStorage.setItem(STORE, JSON.stringify({ craft: state.craft, tab: state.tab, sess: state.sess, mode: state.mode, cat: state.cat, wake: state.wake,
    yarns: state.yarns, example: state.example, doubled: state.doubled, stars: state.stars, sessions: state.sessions, updatedAt: state.updatedAt })); } catch (e) {}
}
// synced data changed: stamp, keep locally, send to the account store
function save() { state.updatedAt = Date.now(); saveLocal(); schedulePush(); }

// ---------- Logic ----------
const r5 = x => Math.max(5, Math.round(x / 5) * 5);
const sum = ys => ys.reduce((a, y) => a + y.grams, 0);
const colorKey = y => (y.color && y.color !== "unknown") ? y.color : "u-" + y.id;

function groups() {
  const out = [];
  WKEYS.forEach(w => {
    const ys = state.yarns.filter(y => y.weight === w);
    if (ys.length) out.push({ key: w, w, use: w, yarns: ys, title: WEIGHTS[w].name, mpg: WEIGHTS[w].mpg });
  });
  if (state.doubled) {
    const ys = state.yarns.filter(y => y.weight === "thin");
    if (ys.length) out.push({ key: "thin2", w: "thin", use: "mid", yarns: ys, title: "가는 실 두 가닥", mpg: WEIGHTS.thin.mpg / 2, doubled: true });
  }
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
