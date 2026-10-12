// ---------- 기호 사전 화면 ----------
const guideUI = { q: "", cat: "all" };

// 기호 그림 (48×56 칸, 선 색은 글자색을 따라가요)
const tee = (slashes, x = 24) => {
  let s = `<path d="M${x - 10} 8H${x + 10}M${x} 8V50"/>`;
  for (let i = 0; i < slashes; i++) { const y = 20 + i * 8; s += `<path d="M${x - 6} ${y + 4}L${x + 6} ${y - 4}"/>`; }
  return s;
};
const fan = (angles, slashes) => angles.map(a => `<g transform="rotate(${a} 24 52)">${tee(slashes)}</g>`).join("");
const leg = a => `<g transform="rotate(${a} 24 50)"><path d="M24 50V8M19 22l10 10M29 22l-10 10"/></g>`;
const GLYPH = {
  ch: `<ellipse cx="24" cy="28" rx="16" ry="8"/>`,
  sl: `<circle cx="24" cy="28" r="6.5" fill="currentColor"/>`,
  sc: `<path d="M12 16l24 24M36 16L12 40"/>`,
  hdc: tee(0), dc: tee(1), tr: tee(2), dtr: tee(3),
  inc: leg(-22) + leg(22),
  dec: `<g transform="rotate(180 24 28)">${leg(-22) + leg(22)}</g>`,
  dc2: fan([-14, 14], 1),
  cl3: fan([-26, 0, 26], 1),
  shell5: fan([-40, -20, 0, 20, 40], 1),
  dc2tog: `<path d="M12 52L24 8M36 52L24 8M24 8H34M16 36l9-4M31 36l-9-4"/>`,
  bobble: `<path d="M24 52C8 40 10 8 24 6C38 8 40 40 24 52Z"/><path d="M24 50V14M19 30l10-4M16 44L18 18M32 44L30 18"/>`,
  pop: fan([-34, -17, 0, 17, 34], 1) + `<path d="M8 38Q24 52 40 38"/>`,
  ring: `<path d="M24 28a2.5 2.5 0 0 1 5 0a6 6 0 0 1-12 0a10 10 0 0 1 20 0a14 14 0 0 1-28 0"/>`,
  fp: tee(1) + `<path d="M24 50q0 5 8 4"/>`,
  bp: tee(1) + `<path d="M24 50q0 5 -8 4"/>`,
  blo: `<path d="M12 12l24 24M36 12L12 36M10 46H38"/>`,
  picot: `<path d="M24 52V40"/><ellipse cx="24" cy="28" rx="8" ry="11"/>`,
  cross: `<g transform="rotate(-16 24 50)">${tee(1)}</g><g transform="rotate(16 24 50)">${tee(1)}</g>`,
  k: `<path d="M24 8V48"/>`,
  p: `<path d="M8 28H40"/>`,
  slip: `<path d="M10 14L24 44L38 14"/>`,
  yo: `<circle cx="24" cy="28" r="11"/>`,
  k2tog: `<path d="M12 44L36 12"/>`,
  ssk: `<path d="M12 12L36 44"/>`,
  cable: `<path d="M6 46L42 10M6 10L42 46"/>`
};
const glyphSVG = (k, cls = "") => `<svg class="glyph ${cls}" viewBox="0 0 48 56" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPH[k] || ""}</svg>`;

const symList = () => state.craft === "crochet" ? CROCHET_SYMS : KNIT_SYMS;
const symCatName = id => (SYM_CATS[state.craft].find(c => c[0] === id) || [id, id])[1];

// 높이 비교 그림: 같은 바닥선에 기호를 키 순서대로 세워 놓아요
function heightChartHTML() {
  const base = 124, step = 19, W = 300;
  let s = "";
  HEIGHT_ROWS.forEach((r, i) => {
    const x = 30 + i * 60, h = r.chain * step, top = base - h;
    if (r.id === "sc") s += `<path d="M${x - 8} ${base - 18}l16 16M${x + 8} ${base - 18}l-16 16"/>`;
    else {
      s += `<path d="M${x - 9} ${top}H${x + 9}M${x} ${top}V${base}"/>`;
      for (let k = 0; k < r.wrap && r.id !== "hdc"; k++) { const y = top + 12 + k * 9; s += `<path d="M${x - 6} ${y + 4}L${x + 6} ${y - 4}"/>`; }
    }
    s += `<text x="${x}" y="${base + 16}" text-anchor="middle" class="ht-n">${r.name}</text><text x="${x}" y="${base + 31}" text-anchor="middle" class="ht-s">사슬 ${r.chain}</text>`;
  });
  return `<div class="hchart" role="img" aria-label="기호 높이 비교: 짧은뜨기 사슬 1코, 중간뜨기 2코, 한길 3코, 두길 4코, 세길 5코 높이">
    <p class="label">높이 한눈에 비교 · 세우는 사슬 수</p>
    <svg viewBox="0 0 ${W} 172" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="8" y1="${base}" x2="${W - 8}" y2="${base}" stroke-width="1" class="ht-base"/>${s}</svg>
    <p class="ht-note">사선이 한 줄 늘 때마다 실을 한 번 더 감아요. 중간뜨기는 사선이 없지만 실을 한 번 감아요.</p></div>`;
}

function tileHTML(sym) {
  return `<button type="button" class="sym-tile" data-sym="${sym.id}"><span class="tile-fig">${glyphSVG(sym.glyph)}</span><b>${esc(sym.name)}</b><small>${esc(sym.en)}</small></button>`;
}
function filteredSyms() {
  const q = guideUI.q.trim().toLowerCase();
  return symList().filter(s => (guideUI.cat === "all" || s.cat === guideUI.cat) &&
    (!q || [s.name, s.en, s.mean, s.look].some(t => String(t || "").toLowerCase().includes(q))));
}
function renderSymGrid() {
  const list = filteredSyms();
  $("sym-grid").innerHTML = list.length ? list.map(tileHTML).join("") : `<p class="sym-empty">찾는 기호가 없어요. 다른 말로 검색해 보세요.</p>`;
  $("sym-count").textContent = `${list.length}개`;
}

function renderGuide() {
  const crochet = state.craft === "crochet", cats = SYM_CATS[state.craft];
  if (!cats.some(c => c[0] === guideUI.cat)) guideUI.cat = "all";
  let h = `<div class="view-title"><h2 id="h-guide">기호 사전</h2><span class="meta">${craftName()} 기준 · <span id="sym-count"></span></span></div>`;
  if (crochet) h += heightChartHTML();
  h += `<label class="sym-search"><span class="sr">기호 검색</span><input id="sym-q" type="search" placeholder="이름·약어로 찾기 (예: 한길, dc, 늘림)" value="${esc(guideUI.q)}" autocomplete="off"></label>
    <div class="g-chips" role="group" aria-label="종류">${cats.map(([id, nm]) => `<button type="button" class="g-chip" data-gcat="${id}" aria-pressed="${guideUI.cat === id}">${nm}</button>`).join("")}</div>
    <div class="sym-grid" id="sym-grid"></div>`;
  if (crochet) h += `<details class="rules"><summary>도안 읽는 법</summary><dl>${CHART_RULES.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl></details>`;
  $("v-guide").innerHTML = h;
  renderSymGrid();
}

function symDetailHTML(sym) {
  const vs = (sym.vs || []).map(id => symList().find(s => s.id === id)).filter(Boolean);
  return `<div class="sd-fig">${glyphSVG(sym.glyph, "xl")}</div>
    <div class="sd-hd"><b>${esc(sym.name)}</b><small>${esc(sym.en)}</small><span class="chip-s">${symCatName(sym.cat)}</span></div>
    <div class="sym-block"><h4>이 기호의 뜻</h4><p>${sym.mean}</p></div>
    <div class="sym-block"><h4>뜨는 방법</h4><ol>${sym.steps.map(t => `<li>${t}</li>`).join("")}</ol></div>
    <div class="sym-block use"><h4>도안에서는 이렇게 보여요</h4><p>${sym.look}</p></div>
    ${vs.length ? `<div class="sym-block vs"><h4>헷갈리는 기호</h4>${sym.vsNote ? `<p>${sym.vsNote}</p>` : ""}<div class="vs-row">${vs.map(v => `<button type="button" class="vs-chip" data-sym="${v.id}"><span class="vs-fig">${glyphSVG(v.glyph)}</span>${esc(v.name)}</button>`).join("")}</div></div>` : ""}
    ${sym.note ? `<p class="sym-note">※ ${sym.note}</p>` : ""}`;
}
function openSymbol(id) {
  const sym = symList().find(s => s.id === id); if (!sym) return;
  $("sym-h").textContent = sym.name;
  $("sym-body").innerHTML = symDetailHTML(sym);
  if ($("sheet-sym").hidden) openSheet("sheet-sym");
  $("sheet-sym").querySelector(".sheet-panel").scrollTop = 0;
}

document.addEventListener("click", e => {
  const t = e.target.closest("[data-sym]"); if (t) { openSymbol(t.dataset.sym); return; }
  const c = e.target.closest("[data-gcat]");
  if (c) {
    guideUI.cat = c.dataset.gcat;
    document.querySelectorAll("[data-gcat]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.gcat === guideUI.cat)));
    renderSymGrid();
  }
});
document.addEventListener("input", e => {
  if (e.target.id !== "sym-q") return;
  guideUI.q = e.target.value; renderSymGrid();
});
