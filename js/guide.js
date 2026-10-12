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
  const seg = guideUI.seg === "cat" ? "cat" : "sym";
  let h = `<div class="view-title"><h2 id="h-guide">기호 도안</h2></div>
    <div class="seg guide-seg" role="group" aria-label="보기">
      <button type="button" data-gseg="sym" aria-pressed="${seg === "sym"}">${crochet ? "코바늘" : "대바늘"} 기호 사전</button>
      <button type="button" data-gseg="cat" aria-pressed="${seg === "cat"}">고양이 얼굴 도안</button>
    </div>`;
  if (seg === "sym") {
    h += `<p class="lead">기호를 누르면 <b>뜻</b>, <b>뜨는 방법</b>, <b>도안에서 보이는 모양</b>이 따로 나와요.${crochet ? "" : " 위의 '코바늘'로 바꾸면 코바늘 기호와 고양이 도안이 나와요."}</p>
      <div class="sym-list">${syms.map(symCard).join("")}</div>`;
    if (crochet) h += `<details class="rules"><summary>도안 읽는 법</summary><dl>${CHART_RULES.map(([t, d]) => `<dt>${t}</dt><dd>${d}</dd>`).join("")}</dl></details>`;
  } else {
    h += `<div class="notice">${CAT.notice}</div>
      <figure class="cat-fig"><div class="cat-scroll" id="cat-scroll"><img id="cat-img" src="${CAT.img}" alt="고양이 얼굴 모티브 9장을 3×3으로 이은 원본 도안"></div>
        <figcaption><button type="button" class="ghost-btn" data-cat-zoom>크게 보기</button> 원본 이미지 그대로예요. 크게 보면 옆으로 밀어서 볼 수 있어요.</figcaption></figure>
      <h3 class="sub">도안 속 기호 읽기</h3>
      <ul class="cat-legend">${CAT.legend.map(x => `<li><img class="lg-img" src="images/sym-${x.img}.png" alt="${esc(x.name)} 기호"><span><b>${x.name}</b>${x.sure ? "" : '<em class="unsure">불확실</em>'}<small>${x.look}</small><span class="lg-mean">${x.mean}</span></span></li>`).join("")}</ul>
      <h3 class="sub">도안에서 확인한 구조</h3>
      <ul class="cat-read">${CAT.read.map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join("")}</ul>
      <h3 class="sub">뜨는 순서 (단수 세기에서 쓰는 순서)</h3>
      <ol class="g-steps">${CAT.rows.map(([k, v]) => `<li><b>${k}</b><p>${v}</p></li>`).join("")}</ol>`;
  }
  $("v-guide").innerHTML = h;
}

document.addEventListener("click", e => {
  const zb = e.target.closest("[data-cat-zoom]");
  if (zb) { const img = $("cat-img"); const big = img.classList.toggle("big"); zb.textContent = big ? "작게 보기" : "크게 보기"; return; }
  const o = e.target.closest("[data-cat-open]");
  if (o) { guideUI.seg = "cat"; state.tab = "guide"; saveLocal(); closeSheets(); render(); window.scrollTo(0, 0); return; }
  const b = e.target.closest("[data-gseg]"); if (!b) return;
  guideUI.seg = b.dataset.gseg; renderGuide(); window.scrollTo(0, 0);
});
