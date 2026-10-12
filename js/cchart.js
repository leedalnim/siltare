// ---------- 코바늘 기호 도안 (무늬 상세 > 기호 도안) ----------
// 각 무늬의 '단별 방법'(js/recipe.js)에 적힌 코 순서를 기호로 옮긴 그림이에요.
// 겉면에서 본 모양이고, 왕복으로 뜨면 단마다 읽는 방향이 바뀌는 건 생략했어요.
// 칸 단위: 가로 1칸 = 코 1개. 아래 단이 1단이에요.

const CGLYPH_EXTRA = {
  o3: `<ellipse cx="24" cy="10" rx="12" ry="6"/><ellipse cx="24" cy="28" rx="12" ry="6"/><ellipse cx="24" cy="46" rx="12" ry="6"/>`,
  fan7: [-48, -32, -16, 0, 16, 32, 48].map(a => `<g transform="rotate(${a} 24 52)">${tee(1)}</g>`).join(""),
  fan4: [-24, -8, 8, 24].map(a => `<g transform="rotate(${a} 24 52)">${tee(1)}</g>`).join("")
};
const cg = k => GLYPH[k] || CGLYPH_EXTRA[k] || "";

// 한 단: it = [글자, 시작 칸, 차지하는 칸 수(선택), 색 번호(선택)]
const CCHART = {
  sc: () => ({ C: 8, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: Array.from({ length: 8 }, (_, c) => ["sc", c]) })) }),
  dc: () => ({ C: 8, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: [["o3", 0], ...Array.from({ length: 7 }, (_, c) => ["dc", c + 1])] })) }),
  moss: () => ({ C: 9, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: Array.from({ length: 9 }, (_, c) => [(c + i) % 2 ? "ch" : "sc", c]) })) }),
  stripe: (cols) => {
    const n = Math.max(1, Math.min(4, cols.length)), s = []; for (let c = 0; c < n; c++) s.push(c, c);
    return { C: 8, cw: 30, rows: [0, ...s].map((c, i) => ({ l: `${i + 1}단`, bg: c, it: Array.from({ length: 8 }, (_, k) => ["sc", k, 1, c]) })) };
  },
  mesh: () => ({ C: 10, cw: 30, rows: [
    { l: "1단", it: [["sc", 0], ["arc", 0, 5], ["sc", 5], ["arc", 5, 5], ["sc", 10]] },
    { l: "2단", it: [["sc", 2.5], ["arc", 2.5, 5], ["sc", 7.5]] },
    { l: "3단", it: [["sc", 0], ["arc", 0, 5], ["sc", 5], ["arc", 5, 5], ["sc", 10]] },
    { l: "4단", it: [["sc", 2.5], ["arc", 2.5, 5], ["sc", 7.5]] }], x0: 0, C2: 11 }),
  shell: () => {
    const A = [["sc", 0], ["shell5", 3, 3], ["sc", 6], ["shell5", 9, 3], ["sc", 12]];
    const B = [["cl3", 0, 2], ["sc", 3], ["shell5", 6, 3], ["sc", 9], ["cl3", 12, 2]];
    return { C: 14, cw: 24, rows: [A, B, A, B].map((it, i) => ({ l: `${i + 1}단`, it })) };
  },
  popcorn: () => {
    const row = pc => Array.from({ length: 12 }, (_, c) => [pc.includes(c) ? "pop" : "sc", c, pc.includes(c) ? 1.6 : 1]);
    const rest = Array.from({ length: 12 }, (_, c) => ["sc", c]);
    return { C: 12, cw: 28, rows: [row([2, 6, 10]), rest, row([4, 8]), rest].map((it, i) => ({ l: `${i + 1}단`, it })) };
  },
  waffle: () => {
    const e = Array.from({ length: 9 }, (_, c) => [c % 3 === 0 ? "fp" : "dc", c]);
    const o = Array.from({ length: 9 }, (_, c) => [c % 3 === 0 ? "dc" : "fp", c]);
    return { C: 9, cw: 30, rows: [e, o, e, o].map((it, i) => ({ l: `${i + 1}단`, it })) };
  },
  lace: () => ({ C: 19, cw: 22, rows: [
    { l: "1단", it: [["sc", 0], ["arc", 0, 4], ["sc", 4], ["arc", 4, 4], ["sc", 8], ["arc", 8, 4], ["sc", 12], ["arc", 12, 4], ["sc", 16]] },
    { l: "2단", it: [["sc", 2], ["fan7", 6, 3], ["sc", 10], ["fan7", 14, 3]] },
    { l: "3단", it: [["sc", 6], ["arc", 6, 4], ["sc", 10], ["arc", 10, 4], ["sc", 14]] },
    { l: "4단", it: [["sc", 6], ["fan7", 10, 3], ["sc", 14]] }] })
};

function cchartGridSVG(spec, hexes) {
  const { C, cw, rows } = spec, ch = Math.round(cw * 1.3), pad = 8, lab = 34;
  const W = (spec.C2 || C) * cw + pad * 2 + lab, H = rows.length * ch + pad * 2;
  let s = `<svg class="cchart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="기호 도안, 아래에서 위로 1단부터" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">`;
  rows.forEach((row, ri) => {
    const y = pad + (rows.length - 1 - ri) * ch;
    if (row.bg != null && hexes[row.bg]) s += `<rect x="${pad}" y="${y}" width="${C * cw}" height="${ch}" fill="${hexes[row.bg]}" stroke="none" opacity=".92"/>`;
    const ink = row.bg != null && hexes[row.bg] ? inkOn(hexes[row.bg]) : null;
    s += `<g${ink ? ` style="color:${ink}"` : ""}>`;
    row.it.forEach(([g, x, span = 1]) => {
      if (g === "arc") {
        const x1 = pad + (x + .5) * cw + cw * .42, x2 = pad + (x + span + .5) * cw - cw * .42, yb = y + ch * .78, mid = (x1 + x2) / 2, top = y + ch * .18;
        s += `<path d="M${x1} ${yb}Q${mid} ${top - ch * .1} ${x2} ${yb}" stroke-width="1.2" opacity=".35"/>`;
        for (let k = 0; k < 5; k++) { const t = (k + .5) / 5, px = x1 + (x2 - x1) * t, py = (1 - t) * (1 - t) * yb + 2 * t * (1 - t) * (top - ch * .1) + t * t * yb; s += `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(cw * .13).toFixed(1)}" ry="${(cw * .08).toFixed(1)}" stroke-width="1.6"/>`; }
        return;
      }
      const gw = span * cw, gx = pad + x * cw + (span > 1 ? 0 : 0);
      s += `<svg x="${gx.toFixed(1)}" y="${(y + 2).toFixed(1)}" width="${gw.toFixed(1)}" height="${ch - 4}" viewBox="0 0 48 56" preserveAspectRatio="xMidYMid meet" overflow="visible" stroke-width="${(2.6 * 48 / Math.max(gw, 20)).toFixed(2)}">${cg(g)}</svg>`;
    });
    s += `</g><text x="${W - lab + 4}" y="${y + ch / 2 + 4}" class="cc-n" stroke="none" fill="currentColor">${row.l}</text>`;
  });
  return s + `</svg>`;
}

// 둥근 무늬: 꽃 · 아미구루미 · 그래니 스퀘어
function cchartRadialSVG(pid) {
  const W = 300, c = W / 2;
  let body = "", cap = "";
  const glyphAt = (g, x, y, ang, sz = 30) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(sz / 56).toFixed(3)}) translate(-24 -52)" stroke-width="${(2.4 * 56 / sz).toFixed(2)}" overflow="visible">${cg(g)}</g>`;
  const oval = (x, y, ang, rx = 7, ry = 3.4) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${ang.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" stroke-width="1.6"/>`;
  const ring = `<g transform="translate(${c} ${c}) scale(.5) translate(-24 -28)" stroke-width="3.4">${GLYPH.ring}</g>`;
  if (pid === "flower") {
    for (let i = 0; i < 10; i++) { const a = i / 10 * 360 - 90, r = a * Math.PI / 180; body += glyphAt("sc", c + Math.cos(r) * 34, c + Math.sin(r) * 34, 0, 16); }
    for (let i = 0; i < 5; i++) { const a = i * 72 - 90, r = a * Math.PI / 180; body += glyphAt("fan4", c + Math.cos(r) * 52, c + Math.sin(r) * 52, a + 90, 54); }
    for (let i = 0; i < 5; i++) { const a = (i * 72 - 54) * Math.PI / 180; body += `<circle cx="${(c + Math.cos(a) * 50).toFixed(1)}" cy="${(c + Math.sin(a) * 50).toFixed(1)}" r="2.8" fill="currentColor" stroke="none"/>`; }
    cap = "안쪽 고리: 1단 짧은뜨기 10코 · 바깥 꽃잎 5장(한 코에 4코씩) · 점(●)은 빼뜨기";
  } else if (pid === "amigu") {
    [6, 12, 18, 24, 30].forEach((n, k) => { const R = 20 + k * 22; for (let i = 0; i < n; i++) { const r = (i / n * 360 - 90) * Math.PI / 180; body += glyphAt("sc", c + Math.cos(r) * R, c + Math.sin(r) * R, 0, k > 2 ? 11 : 14); } body += `<text x="${c + 4}" y="${c - R - 4}" class="cc-n" stroke="none" fill="currentColor" font-size="9">${n}</text>`; });
    cap = "안쪽부터 1단 6코 → 2단 12코 → 3단 18코 → 4단 24코 → 5단 30코 (6~10단은 30코 그대로)";
  } else if (pid === "granny") {
    const fan3 = (x, y, dx, dy) => glyphAt("cl3", x, y, Math.atan2(dy, dx) * 180 / Math.PI + 90, 34);
    const ch = (x, y, horiz) => oval(x, y, horiz ? 0 : 90, 6, 3);
    const half = [34, 62, 90];
    // 1단: 변마다 묶음, 모서리마다 사슬 2
    const h1 = half[0];
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => { body += fan3(c + dx * h1 * .78, c + dy * h1 * .78, dx, dy); });
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => { body += ch(c + sx * h1, c + sy * h1, true); });
    // 2단: 모서리마다 (묶음, 사슬 2, 묶음), 변 가운데는 사슬 1
    const h2 = half[1];
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
      body += fan3(c + sx * (h2 - 15), c + sy * h2, 0, sy) + fan3(c + sx * h2, c + sy * (h2 - 15), sx, 0) + ch(c + sx * (h2 + 2), c + sy * (h2 + 2), true);
    });
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => { body += ch(c + dx * h2, c + dy * h2, dy !== 0); });
    // 3단: 모서리 (묶음, 사슬 2, 묶음), 변 가운데 묶음
    const h3 = half[2];
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sy]) => {
      body += fan3(c + sx * (h3 - 15), c + sy * h3, 0, sy) + fan3(c + sx * h3, c + sy * (h3 - 15), sx, 0) + ch(c + sx * (h3 + 2), c + sy * (h3 + 2), true);
    });
    [[0, -1], [1, 0], [0, 1], [-1, 0]].forEach(([dx, dy]) => { body += fan3(c + dx * h3, c + dy * h3, dx, dy); });
    cap = "고리에서 시작해 단마다 한 겹씩 커져요. 부채꼴 = 한 코에 한길긴뜨기 3코, 작은 타원 = 사슬 · 모서리는 사슬 2코";
  }
  return { svg: `<svg class="cchart-svg radial" viewBox="0 0 ${W} ${W}" role="img" aria-label="${pid} 기호 도안" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${ring}${body}</svg>`, cap };
}

// 무늬 상세 '기호 도안' 보기. 그릴 수 있는 도안이 없으면 null.
function crochetChartHTML(pid, cols) {
  const hexes = chartHexes(cols);
  if (["flower", "amigu", "granny"].includes(pid)) {
    const r = cchartRadialSVG(pid);
    return `<div class="cchart"><div class="cchart-card">${r.svg}</div><p class="cc-cap">${r.cap}</p></div>`;
  }
  if (CCHART[pid]) {
    const spec = CCHART[pid](cols);
    return `<div class="cchart"><div class="cchart-card scroll">${cchartGridSVG(spec, hexes)}</div><p class="cc-cap">겉면에서 본 모양, 아래에서 위로 읽어요. 왕복으로 뜨면 단마다 읽는 방향이 바뀌어요.</p></div>`;
  }
  return null;
}
