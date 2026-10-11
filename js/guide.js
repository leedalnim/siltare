// ---------- 기호 도안 화면 ----------
const guideUI = { seg: "sym" };

// 기호 그림 (48×56 칸, 선 색은 글자색을 따라가요)
const tee = (slashes, x = 24) => {
  let s = `<path d="M${x - 10} 8H${x + 10}M${x} 8V50"/>`;
  for (let i = 0; i < slashes; i++) { const y = 20 + i * 8; s += `<path d="M${x - 6} ${y + 4}L${x + 6} ${y - 4}"/>`; }
  return s;
};
const fan = (angles, slashes) => angles.map(a => `<g transform="rotate(${a} 24 52)">${tee(slashes)}</g>`).join("");
const leg = a => `<g transform="rotate(${a} 24 50)"><path d="M24 50V8M19 22l10 10M29 22l-10 10"/></g>`;
const GLYPH = {
  ch: `<ellipse cx="24" cy="28" rx="15" ry="8"/>`,
  sl: `<circle cx="24" cy="28" r="6.5" fill="currentColor"/>`,
  sc: `<path d="M12 16l24 24M36 16L12 40"/>`,
  hdc: tee(0),
  dc: tee(1),
  tr: tee(2),
  inc: leg(-22) + leg(22),
  dec: `<g transform="rotate(180 24 28)">${leg(-22) + leg(22)}</g>`,
  cl3: fan([-26, 0, 26], 1),
  pop: fan([-34, -17, 0, 17, 34], 1) + `<path d="M8 38Q24 52 40 38"/>`,
  ring: `<path d="M24 28a2.5 2.5 0 0 1 5 0a6 6 0 0 1-12 0a10 10 0 0 1 20 0a14 14 0 0 1-28 0"/>`,
  fp: tee(1) + `<path d="M24 50q0 5 8 4"/>`,
  k: `<path d="M24 8V48"/>`,
  p: `<path d="M8 28H40"/>`,
  yo: `<circle cx="24" cy="28" r="11"/>`,
  k2tog: `<path d="M12 44L36 12"/>`,
  ssk: `<path d="M12 12L36 44"/>`
};
const glyphSVG = (k, cls = "") => `<svg class="glyph ${cls}" viewBox="0 0 48 56" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${GLYPH[k] || ""}</svg>`;

// 고양이 얼굴 모티브 하나 (cx, cy가 중심, 가로 56 · 세로 44 타원)
function catMotif(cx, cy, labels) {
  let s = `<g transform="translate(${cx} ${cy})">`;
  s += `<ellipse rx="56" ry="44" fill="none" stroke="var(--line)" stroke-width="1.2"/>`;
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, x = Math.cos(a) * 52, y = Math.sin(a) * 40;
    const nx = -Math.sin(a), ny = Math.cos(a);
    s += `<path d="M${(Math.cos(a) * 6).toFixed(1)} ${(Math.sin(a) * 5).toFixed(1)}L${x.toFixed(1)} ${y.toFixed(1)}M${(x + nx * 5).toFixed(1)} ${(y + ny * 4).toFixed(1)}L${(x - nx * 5).toFixed(1)} ${(y - ny * 4).toFixed(1)}" stroke="currentColor" stroke-width="1.3" fill="none"/>`;
  }
  s += `<path d="M0 0a2 2 0 0 1 4 0a4.5 4.5 0 0 1-9 0a7 7 0 0 1 14 0" fill="none" stroke="currentColor" stroke-width="1.3"/>`;
  [-24, 0, 24].forEach(x => { s += `<path d="M${x - 5} -62H${x + 5}M${x} -62V-46M${x - 4} -56L${x + 4} -60" stroke="currentColor" stroke-width="1.3" fill="none"/>`; });
  s += `<ellipse cx="-38" cy="-52" rx="5" ry="8" transform="rotate(-25 -38 -52)" fill="none" stroke="currentColor" stroke-width="1.3"/>`;
  s += `<ellipse cx="38" cy="-52" rx="5" ry="8" transform="rotate(25 38 -52)" fill="none" stroke="currentColor" stroke-width="1.3"/>`;
  s += `<circle cx="0" cy="52" r="2.6" fill="currentColor"/>`;
  if (labels) [["1", 0, 8], ["2", 30, 16], ["3", 0, -70], ["4", 46, -60], ["5", 12, 54]].forEach(([n, x, y]) => {
    s += `<g transform="translate(${x} ${y})"><circle r="8" fill="var(--accent)"/><text y="4" text-anchor="middle" font-size="11" font-weight="700" fill="var(--accent-ink)">${n}</text></g>`;
  });
  return s + `</g>`;
}

function catChartSVG() {
  const W = 450, H = 410, cols = [105, 225, 345], rows = [100, 206, 312];
  let s = `<svg class="cat-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="고양이 얼굴 모티브 9장을 3×3으로 이은 도안" fill="none" stroke="currentColor">`;
  for (let y = 14; y < H - 8; y += 15) for (let x = 24; x < W - 12; x += 15) {
    if (cols.some(cx => Math.abs(x - cx) < 66) && rows.some(cy => Math.abs(y - cy) < 56)) continue;
    s += `<path d="M${x - 3} ${y - 3}l6 6M${x + 3} ${y - 3}l-6 6" stroke-width="1.2" opacity=".75"/>`;
  }
  rows.forEach(cy => cols.forEach(cx => { s += `<g transform="translate(${cx} ${cy}) scale(.9) translate(${-cx} ${-cy})">${catMotif(cx, cy)}</g>`; }));
  return s + `</svg>`;
}

function symCard(sym) {
  return `<details class="sym">
    <summary><span class="sym-fig">${glyphSVG(sym.glyph)}</span><span class="sym-hd"><b>${esc(sym.name)}</b><small>${esc(sym.en)}</small></span></summary>
    <div class="sym-body">
      <div class="sym-block"><h4>이 기호의 뜻</h4><p>${sym.mean}</p></div>
      <div class="sym-block"><h4>뜨는 방법</h4><ol>${sym.steps.map(t => `<li>${t}</li>`).join("")}</ol></div>
      <div class="sym-block use"><h4>도안에서는</h4><p>${sym.use}</p></div>
    </div>
  </details>`;
}

function renderGuide() {
  const crochet = state.craft === "crochet";
  const syms = crochet ? CROCHET_SYMS : KNIT_SYMS;
  const seg = guideUI.seg === "cat" && crochet ? "cat" : "sym";
  let h = `<div class="view-title"><h2 id="h-guide">기호 도안</h2></div>
    <div class="seg guide-seg" role="group" aria-label="보기">
      <button type="button" data-gseg="sym" aria-pressed="${seg === "sym"}">${crochet ? "코바늘" : "대바늘"} 기호 사전</button>
      ${crochet ? `<button type="button" data-gseg="cat" aria-pressed="${seg === "cat"}">고양이 얼굴 도안</button>` : ""}
    </div>`;
  if (seg === "sym") {
    h += `<p class="lead">기호를 누르면 <b>뜻</b>, <b>뜨는 방법</b>, <b>도안에서 보이는 모양</b>이 따로 나와요.${crochet ? "" : " 위의 '코바늘'로 바꾸면 코바늘 기호와 고양이 도안이 나와요."}</p>
      <div class="sym-list">${syms.map(symCard).join("")}</div>`;
    if (crochet) h += `<details class="rules"><summary>도안 읽는 법</summary><dl>${CHART_RULES.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl></details>`;
  } else {
    h += `<div class="notice">${CAT.notice}</div>
      <figure class="cat-fig"><div class="cat-scroll">${catChartSVG()}</div><figcaption>9장을 3×3으로 배치하고, 사이와 둘레를 짧은뜨기(X)로 채워 이은 모습이에요.</figcaption></figure>
      <h3 class="sub">모티브 한 장 보기</h3>
      <figure class="cat-fig one"><svg viewBox="-80 -90 160 170" fill="none" stroke="currentColor" role="img" aria-label="고양이 얼굴 모티브 한 장">${catMotif(0, 0, true)}</svg></figure>
      <h3 class="sub">기호 뜻</h3>
      <ul class="legend">${CAT.legend.map(([n, nm, where, g]) => `<li><span class="lg-n">${n}</span><span class="lg-g">${glyphSVG(g)}</span><span><b>${nm}</b><small>${where}</small></span></li>`).join("")}</ul>
      <h3 class="sub">모티브 뜨는 순서</h3>
      <ol class="steps">${CAT.motif.map(([t, d]) => `<li><b>${t}</b><p>${d}</p></li>`).join("")}</ol>
      <h3 class="sub">이어서 완성하기</h3>
      <ol class="steps">${CAT.join.map(([t, d]) => `<li><b>${t}</b><p>${d}</p></li>`).join("")}</ol>`;
  }
  $("v-guide").innerHTML = h;
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-gseg]"); if (!b) return;
  guideUI.seg = b.dataset.gseg; renderGuide(); window.scrollTo(0, 0);
});
