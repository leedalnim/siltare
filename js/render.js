// ---------- Render ----------
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const swStyle = key => { if (key === "multi") return `background:${RAINBOW}`; const c = cinfo(key); return c.hex ? `background:${c.hex}` : ""; };
const dotsFor = ys => `<span class="dots">${[...new Set(ys.map(y => y.color))].slice(0, 4).map(k => `<i class="${cinfo(k).hex ? "" : "unknown-sw"}" style="${swStyle(k)}"></i>`).join("")}</span>`;
const stLabel = { ok: "충분해요", tight: "빠듯해요", risk: "조금 모자랄 수도" };
const ro = w => { const c = String(w).charCodeAt(String(w).length - 1) - 0xAC00; const j = c >= 0 && c <= 11171 ? c % 28 : 0; return w + (j && j !== 8 ? "으로" : "로"); };   // 받침에 따라 '으로/로'
const tool = () => state.craft === "knit" ? "바늘" : "코바늘";
const craftName = c => (c || state.craft) === "knit" ? "대바늘" : "코바늘";
const PH = { key: "ph", w: "mid", use: "mid", yarns: [], title: "", mpg: 2, ph: true };

const CATS = [["all", "전체"], ["small", "소품"], ["wear", "모자·워머"], ["big", "목도리·담요"], ["garment", "옷"], ["bag", "가방"], ["toy", "인형"]];
const CAT_OF = { calicowallet: "small", breadcat: "small", cardwallet: "small", cakewallet: "small", catpurse: "small", tomatowallet: "small", catcoaster: "small", catround: "small", catbag: "small", coaster: "small", scrunchie: "small", sleeve: "small", flower: "small", scrubby: "small", granny1: "small",
  beanie: "wear", babyhat: "wear", bucket: "wear", headband: "wear", wrist: "wear", mitten: "wear", socks: "wear", cowl: "wear",
  scarf: "big", shawl: "big", blanket: "big", sweater: "garment", vest: "garment", pouch: "bag", netbag: "bag", keyring: "toy", amigurumi: "toy" };

// stars & "뜨는 중"
const starKey = (kind, id, craft) => `${craft || state.craft}:${kind}:${id}`;
const isStar = k => !!state.stars[k];
function activeSet() { const s = new Set(); state.sessions.forEach(x => { s.add(`${x.craft}:p:${x.pid}`); if (x.proj) s.add(`${x.craft}:j:${x.proj}`); }); return s; }
const pinRank = (k, act) => act.has(k) ? 0 : isStar(k) ? 1 : 2;
function pinSort(arr, keyOf, act) { return arr.map((x, i) => [x, i]).sort((a, b) => pinRank(keyOf(a[0]), act) - pinRank(keyOf(b[0]), act) || a[1] - b[1]).map(x => x[0]); }
const STAR_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z"/></svg>`;
const starBtn = (k, name, inline) => `<button type="button" class="star${inline ? " inline" : ""}" data-star="${k}" aria-pressed="${isStar(k)}" aria-label="${esc(name)} ${isStar(k) ? "별표 빼기" : "별표하기"}">${STAR_SVG}</button>`;

function colsFor(p, r, g) {
  const ys = r.ys || g.yarns, by = {};
  ys.forEach(y => { const k = colorKey(y); by[k] = (by[k] || 0) + y.grams; });
  let keys = Object.keys(by).sort((a, b) => (b === r.mainKey) - (a === r.mainKey) || by[b] - by[a]);
  if (!(r.multi || p.c >= 2 || p.mc)) keys = keys.slice(0, 1);
  return keys.slice(0, 4).map(k => ({ name: cinfo(k).name, hex: hexFor(k) }));
}

// 굵기는 색이 아니라 실 두께 모양으로 보여줘요
const strandFor = x => x.doubled
  ? `<span class="gstrand" aria-hidden="true"><i style="height:${WEIGHTS.thin.line}px"></i><i style="height:${WEIGHTS.thin.line}px"></i></span>`
  : `<span class="gstrand" aria-hidden="true"><i style="height:${WEIGHTS[x.w].line}px"></i></span>`;
function groupBar(gs, g) {
  return `<div class="chiprow" role="group" aria-label="어떤 실로 뜰까요">${gs.map(x =>
    `<button type="button" class="gchip" id="g-${x.key}" data-g="${x.key}" aria-pressed="${x.key === g.key}">${strandFor(x)}${x.title}<span class="n">${sum(x.yarns)}g</span></button>`).join("")}</div>`;
}
const emptyBox = msg => `<div class="empty">${msg}<button type="button" class="primary" data-open-add>+ 실 담기</button></div>`;
function syncLine() {
  if (sync.status === "synced") return `<p class="sync on"><i></i>계정에 저장돼요. 폰이나 다른 PC에서 같은 링크를 열면 그대로 보여요.</p>`;
  if (sync.status === "offline") return `<p class="sync"><i></i>계정 저장에 연결하지 못해서 지금은 이 브라우저에만 저장돼요.</p>`;
  return `<p class="sync"><i></i>이 브라우저에 저장돼요. 계정 저장에 연결하는 중이에요.</p>`;
}

function renderBasket() {
  const ys = state.yarns, total = sum(ys);
  let html = `<div class="view-title"><h2 id="h-basket">내 실 바구니</h2><span class="meta">${ys.length ? `${ys.length}뭉치 · 약 ${total}g` : ""}</span></div>`;
  html += `<button type="button" class="primary wide" data-open-add>+ 실 담기</button>`;
  if (!ys.length) html += `<div class="empty">바구니가 비었어요. 남은 실을 하나씩 담아 주세요.</div>`;
  else html += `<ul class="basket">${ys.map(y => {
    const c = cinfo(y.color), nm = `${WEIGHTS[y.weight].name} · ${c.name}`;
    return `<li class="yarn"><span class="ball ${c.hex ? "" : "unknown-sw"}" style="${swStyle(y.color)}"></span>
      <div><div class="t">${nm}</div>
      <div class="s">${esc(y.label)} · 약 ${y.grams}g · ${y.texture === "fluffy" ? "보송" : "매끈"}</div></div>
      <span class="acts"><button type="button" class="edit" data-edit="${esc(y.id)}" aria-label="${nm} 수정"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg><span class="bt">수정</span></button><button type="button" class="del" data-del="${esc(y.id)}" aria-label="${nm} 삭제"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg><span class="bt">삭제</span></button></span></li>`;
  }).join("")}</ul>`;
  html += `<p class="note">한 뭉치 크기로 고른 양은 대략값이에요. 주방 저울이 있으면 g으로 적어 주면 더 정확해요.</p>` + syncLine();
  $("v-basket").innerHTML = html;
}

function patCard(p, r, g, act) {
  const k = starKey("p", p.id), ing = act.has(k);
  const off = !!r.skip || !r.doable.length;
  const pill = r.skip ? `<span class="st-pill none">안 맞음</span>` : !r.doable.length ? `<span class="st-pill none">양이 적어요</span>`
    : `<span class="st-pill ${r.sure ? "ok" : "risk"}">${r.sure ? r.sure + "가지" : "작게 뜨면"}</span>`;
  let size = "";
  if (!r.skip) { const z = sizeOf(p, g, r.have); size = `<span class="size">이 실로 약 ${z.side}×${z.side}cm</span>`; }
  return `<div class="pcard${off ? " off" : ""}"><button type="button" class="pmain" data-p="${p.id}"><canvas data-sw="${p.id}" aria-hidden="true"></canvas>
    <span class="nm">${p.name}</span>${size}
    <span class="mt"><span>${off ? esc(r.skip || "가장 작은 작품도 뜨기엔 적어요") : p.note}</span>${pill}</span></button>
    ${starBtn(k, p.name)}${ing ? `<span class="ing">뜨는 중</span>` : ""}</div>`;
}

function renderPatterns() {
  const { gs, g } = currentGroup();
  const G = g || PH, A = analyse(G), act = activeSet(), mode = ["all", "mine"].includes(state.mode) ? state.mode : "rec";
  let html = `<div class="view-title"><h2 id="h-patterns">무늬</h2><span class="meta">${craftName()} 기준</span></div>`;
  if (g) html += groupBar(gs, g);
  html += `<div class="seg2" role="group" aria-label="무늬 보기"><button type="button" data-mode="rec" aria-pressed="${mode === "rec"}">추천 무늬<span class="n">${g ? A.ok.length : 0}</span></button><button type="button" data-mode="all" aria-pressed="${mode === "all"}">전체 무늬<span class="n">${A.pats.length}</span></button><button type="button" data-mode="mine" aria-pressed="${mode === "mine"}">내 도안<span class="n">${myPats.length}</span></button></div>`;
  if (mode === "mine") { $("v-patterns").innerHTML = html + myListHTML(); return; }
  const keyOf = x => starKey("p", x.p.id);
  if (mode === "rec") {
    if (!g) html += emptyBox("실을 담으면 뜰 수 있는 무늬를 골라 드려요. 실 없이 둘러보려면 '전체 무늬'를 눌러 보세요.");
    else {
      if (A.best) {
        html += `<button type="button" class="pick" data-p="${A.best.p.id}" data-pv="${A.best.x.pr.id}"><canvas data-sw="${A.best.p.id}" aria-hidden="true" style="background:var(--surface)"></canvas>
          <span><span class="label">가장 알뜰한 조합</span><strong>${ro(A.best.p.name)} 뜬 ${A.best.x.pr.name}</strong>
          <span class="s">필요 약 ${A.best.x.need}g · 가진 실 ${A.best.r.have}g · ${tool()} ${g.doubled ? WEIGHTS.mid.needle : WEIGHTS[g.w].needle}</span></span></button>`;
      }
      if (A.ok.length) html += `<div class="pgrid">${pinSort(A.ok, keyOf, act).map(({ p, r }) => patCard(p, r, G, act)).join("")}</div>`;
      else html += `<div class="empty">이 실로 바로 뜰 만한 무늬가 아직 없어요. '전체 무늬'에서 다른 무늬도 둘러보세요.</div>`;
      if (A.skipped.length) html += `<p class="note">이 실과 안 맞는 무늬 ${A.skipped.length}개는 '전체 무늬'에서 이유와 함께 볼 수 있어요.</p>`;
    }
  } else {
    if (!g) html += `<p class="note">실을 담으면 무늬마다 뜰 수 있는 크기와 작품이 함께 나와요.</p>`;
    html += `<div class="pgrid">${pinSort([...A.ok, ...A.skipped], keyOf, act).map(({ p, r }) => patCard(p, r, G, act)).join("")}</div>`;
  }
  $("v-patterns").innerHTML = html;
  requestAnimationFrame(() => paintAll($("v-patterns"), G));
}

function projectRows(g) {
  const A = analyse(g), map = {};
  A.pats.forEach(({ p, r }) => { if (r.skip) return; [...r.doable, ...r.later].forEach(x => { (map[x.pr.id] = map[x.pr.id] || { pr: x.pr, items: [] }).items.push({ p, x, have: r.have }); }); });
  const rank = { ok: 0, tight: 1, risk: 2, no: 3 };
  const rows = Object.values(map).map(o => {
    const good = o.items.filter(it => it.x.st !== "no").sort((a, b) => b.x.ratio - a.x.ratio || a.p.d - b.p.d);
    const best = good[0] || o.items.slice().sort((a, b) => b.x.ratio - a.x.ratio)[0];
    return { pr: o.pr, good, best, minNeed: Math.min(...o.items.map(i => i.x.need)), cat: CAT_OF[o.pr.id] || "small" };
  });
  const doable = rows.filter(r => r.good.length).sort((a, b) => rank[a.best.x.st] - rank[b.best.x.st] || b.best.x.need - a.best.x.need);
  const later = rows.filter(r => !r.good.length).sort((a, b) => a.minNeed - b.minNeed);
  return { doable, later };
}
function projRow(row, act) {
  const b = row.best, needs = row.good.map(i => i.x.need), lo = Math.min(...needs), hi = Math.max(...needs);
  const left = b.have - b.x.need, openP = state.openProj.has(row.pr.id);
  const k = starKey("j", row.pr.id), ing = act.has(k);
  const thumb = row.pr.photo
    ? `<button type="button" class="thumb photo" data-photo="${row.pr.photo}" data-photo-name="${esc(row.pr.name)}" aria-label="${row.pr.name} 참고 사진 크게 보기"><img src="${row.pr.photo}" alt="" loading="lazy"></button>`
    : `<button type="button" class="thumb" data-p="${b.p.id}" data-pv="${row.pr.id}" aria-label="${row.pr.name} 완성 미리보기"><canvas data-sw="${b.p.id}" data-prod="${row.pr.id}"></canvas></button>`;
  return `<li class="prow">${thumb}
    <div class="hd"><span class="nm">${row.pr.name}</span>${ing ? `<span class="ing inline">뜨는 중</span>` : ""}<span class="sp"></span><span class="st-pill ${b.x.st}">${stLabel[b.x.st]}</span>${starBtn(k, row.pr.name, true)}</div>
    <span class="sub">${lo === hi ? lo : lo + "~" + hi}g ·${left >= 0 ? `${ro(b.p.name)} 뜨면 ${left}g 남아요` : `${ro(b.p.name)}도 ${-left}g 모자라요`}</span>
    ${row.pr.how ? `<p class="howto">${row.pr.how}</p>` : ""}
    <button type="button" class="fold" data-tp="${row.pr.id}" aria-expanded="${openP}" aria-controls="mini-${row.pr.id}">
      <span class="stack" aria-hidden="true">${row.good.slice(0, 4).map(it => `<canvas data-sw="${it.p.id}"></canvas>`).join("")}</span>
      <span class="fl">어울리는 무늬 ${row.good.length}개</span>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
    </button>
    ${openP ? `<div class="mini" id="mini-${row.pr.id}">${row.good.map(it => `<button type="button" class="mchip" data-p="${it.p.id}" data-pv="${row.pr.id}"><canvas data-sw="${it.p.id}" aria-hidden="true"></canvas>${it.p.name}<span class="x">${it.x.need}g</span></button>`).join("")}</div>` : ""}</li>`;
}

function renderProjects() {
  const { gs, g } = currentGroup();
  let html = `<div class="view-title"><h2 id="h-projects">만들 수 있는 것</h2><span class="meta">${craftName()} 기준</span></div>`;
  if (!g) { $("v-projects").innerHTML = html + emptyBox("실을 담으면 만들 수 있는 작품이 나와요."); return; }
  const { doable, later } = projectRows(g), act = activeSet();
  const counts = {}; doable.forEach(r => { counts[r.cat] = (counts[r.cat] || 0) + 1; });
  if (state.cat !== "all" && !counts[state.cat]) state.cat = "all";
  html += groupBar(gs, g);
  html += `<div class="chiprow cats" role="group" aria-label="작품 종류">${CATS.filter(([k]) => k === "all" || counts[k]).map(([k, nm]) =>
    `<button type="button" class="gchip" data-cat="${k}" aria-pressed="${state.cat === k}">${nm}<span class="n">${k === "all" ? doable.length : counts[k]}</span></button>`).join("")}</div>`;
  const shown = pinSort(doable.filter(r => state.cat === "all" || r.cat === state.cat), r => starKey("j", r.pr.id), act);
  const sure = shown.filter(r => r.best.x.st !== "risk" || act.has(starKey("j", r.pr.id)) || isStar(starKey("j", r.pr.id)));
  const maybe = shown.filter(r => !sure.includes(r));
  if (sure.length) html += `<ul class="plist">${sure.map(r => projRow(r, act)).join("")}</ul>`;
  else html += `<div class="empty">이 종류에서 지금 실로 넉넉히 뜰 수 있는 작품은 없어요.</div>`;
  if (maybe.length) html += `<details class="skipped"${state.openMaybe ? " open" : ""} data-maybe><summary>작게 뜨면 될 수도 있는 것 ${maybe.length}개</summary><ul class="plist">${maybe.map(r => projRow(r, act)).join("")}</ul></details>`;
  const laterF = later.filter(r => state.cat === "all" || r.cat === state.cat);
  if (laterF.length) html += `<details class="skipped"><summary>실이 더 있으면 뜰 수 있는 것 ${laterF.length}개</summary><ul>${laterF.map(r => `<li><b>${r.pr.name}</b>: 최소 ${r.minNeed}g</li>`).join("")}</ul></details>`;
  $("v-projects").innerHTML = html;
  requestAnimationFrame(() => paintAll($("v-projects"), g));
}

// ---------- 무늬 상세: 무늬 크게 / 기호 도안 / 완성품 ----------
const detailUI = { view: "swatch", zoom: 1, pid: null };
function detailChartHTML(p, rx, cols) {
  if (p.id === "cat") return catBlockHTML();
  if (rx.chart) return `<div class="kchart"><div class="chart-scroll">${chartHTML(rx.chart, chartHexes(cols), -1, labelsFor(cols))}</div><p class="cc-cap">겉면에서 본 모양, 아래에서 위로 읽어요.</p></div>`;
  if (state.craft === "crochet") { const h = crochetChartHTML(p.id, cols); if (h) return h; }
  return `<div class="empty-chart">이 무늬는 기호 도안이 없어요. 아래 '도안'의 단별 설명을 따라 떠 주세요.</div>`;
}
function stageHTML(p, sel, cols, rx) {
  if (detailUI.pid !== p.id) { detailUI.pid = p.id; detailUI.view = p.id === "cat" ? "chart" : "swatch"; detailUI.zoom = 1; }
  const views = [["swatch", "무늬 크게"], ["chart", "기호 도안"]];
  if (!views.some(v => v[0] === detailUI.view)) detailUI.view = "swatch";
  const seg = `<div class="seg dv-seg" role="group" aria-label="무늬 보기 방식">${views.map(([k, n]) => `<button type="button" data-dv="${k}" aria-pressed="${detailUI.view === k}">${n}</button>`).join("")}</div>`;
  let body;
  if (detailUI.view === "chart") body = detailChartHTML(p, rx, cols);
  else body = `<div class="stage"><canvas class="big swbig" data-sw="${p.id}" data-zoom="${detailUI.zoom}" role="img" aria-label="${p.name} 무늬 크게 보기"></canvas>
      <span class="zoomer"><button type="button" data-dz="-1" aria-label="작게">−</button><button type="button" data-dz="1" aria-label="크게">＋</button></span></div>`;
  return seg + body;
}
document.addEventListener("click", e => {
  const v = e.target.closest("[data-dv]"), z = e.target.closest("[data-dz]");
  if (!v && !z) return;
  if (v) detailUI.view = v.dataset.dv; else detailUI.zoom = Math.max(.8, Math.min(2.8, +(detailUI.zoom + (+z.dataset.dz) * 0.4).toFixed(1)));
  renderDetail();
});

function renderDetail() {
  const g = currentGroup().g || PH;
  const p = PATTERNS[state.craft].find(x => x.id === state.detail);
  if (!p) return;
  const r = evalPattern(p, g);
  $("pat-h").innerHTML = `${p.name}<small>${p.en}</small>`;
  $("pat-star-slot").innerHTML = starBtn(starKey("p", p.id), p.name, true);
  const cols = colsFor(p, r, g), rx = recipe(state.craft, p.id, cols);
  const sess = state.sessions.find(s => s.craft === state.craft && s.pid === p.id);
  const startBtns = `<div class="start-row">${sess
    ? `<button type="button" class="primary wide" data-sess="${sess.id}">이어서 뜨기 · ${sess.row + 1}단째부터</button><button type="button" class="ghost-btn" data-start>새 카운터 만들기</button>`
    : `<button type="button" class="primary wide" data-start>이 무늬로 뜨기 시작 · 단수 세기</button>`}</div>`;
  if (r.skip || !r.doable.length) {
    $("pat-body").innerHTML = `${stageHTML(p, null, cols, rx)}
      <div class="size-line">${esc(r.skip || "지금 가진 실로는 가장 작은 작품도 뜨기엔 양이 적어요. 다른 실을 더 담으면 다시 계산해요.")}</div>
      <p class="how">${p.how}</p>${startBtns}${recipeHTML(rx, cols)}`;
    requestAnimationFrame(() => paintAll($("pat-body"), g));
    return;
  }
  const chips = [];
  chips.push(p.f > 1.05 ? `실 ${Math.round((p.f - 1) * 100)}% 더 듦` : p.f < 0.95 ? `실 ${Math.round((1 - p.f) * 100)}% 덜 듦` : "실 소모 보통");
  chips.push(["", "쉬움", "보통 난이도", "도전"][p.d]);
  chips.push(`${tool()} ${g.doubled ? WEIGHTS.mid.needle : WEIGHTS[g.w].needle}`);
  if (r.multi) chips.push(`${r.nColors}가지 색 사용`);
  if (r.fluffy) chips.push("보송한 실 OK");
  let sel = r.doable.find(x => x.pr.id === state.pv);
  if (!sel) sel = r.doable.find(x => x.st !== "risk") || r.doable[0];
  if (sel) state.pv = sel.pr.id;
  const ckeys = Object.keys(r.byColor).sort((a, b) => r.byColor[b] - r.byColor[a]);
  const cchips = ckeys.length > 1 ? `<div class="field"><span class="label">${r.multi ? "메인 색 고르기 · 나머지 색은 배색으로 들어가요" : "어떤 색으로 뜰까요"}</span>
    <div class="cchips">${ckeys.map(k => `<button type="button" class="cchip" data-main="${esc(k)}" aria-pressed="${k === r.mainKey}"><i style="background:${hexFor(k)}"></i>${cinfo(k).name}<span class="x">${r.byColor[k]}g</span></button>`).join("")}</div></div>` : "";
  const z = sizeOf(p, g, r.have);
  $("pat-body").innerHTML = `${stageHTML(p, sel, cols, rx)}
    ${cchips}
    <div class="size-line">쓸 수 있는 실 <b>${r.have}g</b>으로 이 무늬를 <b>약 ${z.side}cm × ${z.side}cm</b>만큼 뜰 수 있어요. 폭 20cm로 뜨면 길이 약 ${z.len}cm예요.</div>
    <div class="chips">${chips.map(c => `<span class="chip">${c}</span>`).join("")}</div>
    <p class="how">${p.how}</p>
    ${startBtns}
    <p class="sub-h">이 무늬로 뜰 수 있는 것</p>
    <ul class="pgrid3">${r.doable.map(x => {
      const nt = x.st === "ok" ? `약 ${r.have - x.need}g 남아요` : r.have >= x.need ? "거의 딱 맞아요" : `약 ${x.need - r.have}g 부족`;
      return `<li class="pc3 ${x.st}"><span class="st">${stLabel[x.st]}</span><b class="nm">${x.pr.name}</b><span class="g">${x.need}g 필요</span><span class="nt">${nt}</span></li>`;
    }).join("")}</ul>
    ${r.later.length ? `<p class="more">실이 더 있으면: ${r.later.slice(0, 4).map(x => `${x.pr.name} ${x.need}g`).join(" · ")}</p>` : ""}
    ${recipeHTML(rx, cols)}
    <p class="note">소요량과 크기는 일반적인 굵기와 손땀으로 잡은 대략값이에요. 실이나 손땀에 따라 10~20% 차이가 날 수 있어요.</p>`;
  requestAnimationFrame(() => paintAll($("pat-body"), g));
}

// 참고 사진 크게 보기
document.addEventListener("click", e => {
  const ph = e.target.closest("[data-photo]");
  if (ph) {
    const box = document.createElement("div"); box.className = "lightbox"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "참고 사진");
    box.innerHTML = `<figure><img src="${ph.dataset.photo}" alt="${ph.dataset.photoName} 참고 사진"><figcaption>${ph.dataset.photoName} · 참고 사진 <span>눌러서 닫기</span></figcaption></figure>`;
    document.body.appendChild(box); return;
  }
  const lb = e.target.closest(".lightbox"); if (lb) lb.remove();
});
