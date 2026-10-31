// ---------- 코바늘 기호 도안 (무늬 상세 > 기호 도안) ----------
// 각 무늬의 '단별 방법'(js/recipe.js)에 적힌 코 순서를 기호로 옮긴 그림이에요.
// 겉면에서 본 모양이고, 왕복으로 뜨면 단마다 읽는 방향이 바뀌는 건 생략했어요.
// 칸 단위: 가로 1칸 = 코 1개. 아래 단이 1단이에요.

const CGLYPH_EXTRA = {
  o3: `<ellipse cx="24" cy="10" rx="12" ry="6"/><ellipse cx="24" cy="28" rx="12" ry="6"/><ellipse cx="24" cy="46" rx="12" ry="6"/>`,
  fan7: [-48, -32, -16, 0, 16, 32, 48].map(a => `<g transform="rotate(${a} 24 52)">${tee(1)}</g>`).join(""),
  o4: `<ellipse cx="24" cy="6" rx="11" ry="5"/><ellipse cx="24" cy="20" rx="11" ry="5"/><ellipse cx="24" cy="34" rx="11" ry="5"/><ellipse cx="24" cy="48" rx="11" ry="5"/>`,
  blohdc: tee(0) + `<path d="M14 55H34"/>`,
  blodc: tee(1) + `<path d="M14 55H34"/>`,
  vst: `<g transform="rotate(-18 24 52)">${tee(1)}</g><g transform="rotate(18 24 52)">${tee(1)}</g><ellipse cx="24" cy="12" rx="5" ry="3"/>`,
  dc3tog: `<path d="M8 52L24 10M24 52V10M40 52L24 10M16 10H32M10 34l10-3M19 32h10M28 31l10 3"/>`,
  puff: `<path d="M24 52C10 40 12 10 24 8C36 10 38 40 24 52Z"/><path d="M24 50V12"/>`,
  fan4: [-24, -8, 8, 24].map(a => `<g transform="rotate(${a} 24 52)">${tee(1)}</g>`).join("")
};
const cg = k => GLYPH[k] || CGLYPH_EXTRA[k] || "";

// 한 단: it = [글자, 시작 칸, 차지하는 칸 수(선택), 색 번호(선택)]
const CCHART = {
  sc: () => ({ C: 8, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: Array.from({ length: 8 }, (_, c) => ["sc", c]) })) }),
  dc: () => ({ C: 8, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: [["o3", 0], ...Array.from({ length: 7 }, (_, c) => ["dc", c + 1])] })) }),
  hdc: () => ({ C: 8, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: Array.from({ length: 8 }, (_, c) => ["hdc", c]) })) }),
  tr: () => ({ C: 8, cw: 30, rows: [1, 2, 3].map(i => ({ l: `${i}단`, it: [["o4", 0], ...Array.from({ length: 7 }, (_, c) => ["tr", c + 1])] })) }),
  blohdc: () => ({ C: 8, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: Array.from({ length: 8 }, (_, c) => [i === 1 ? "hdc" : "blohdc", c]) })) }),
  blodc: () => ({ C: 8, cw: 30, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: [["o3", 0], ...Array.from({ length: 7 }, (_, c) => [i === 1 ? "dc" : "blodc", c + 1])] })) }),
  vst: () => ({ C: 14, cw: 24, rows: [1, 2, 3, 4].map(i => ({ l: `${i}단`, it: [["dc", 0], ...[0, 1, 2, 3].map(k => ["vst", 1.5 + k * 3, 2]), ["dc", 13]] })) }),
  cluster: () => {
    const A = [["o3", 0], ...[0, 1, 2].map(k => ["dc3tog", 1 + k * 3, 3]), ["dc", 10]], B = Array.from({ length: 11 }, (_, c) => ["sc", c]);
    return { C: 11, cw: 26, rows: [B, A, B, A].map((it, i) => ({ l: `${i + 1}단`, it })) };
  },
  grannyst: (cols) => {
    const n = Math.max(1, Math.min(4, cols.length));
    const A = [["cl3", 0, 2], ...[0, 1, 2].map(k => ["cl3", 3 + k * 3, 2]), ["dc", 12]], B = [["dc", 0], ...[0, 1, 2, 3].map(k => ["cl3", 1.5 + k * 3, 2]), ["dc", 13]];
    return { C: 14, cw: 24, rows: [A, B, A, B].map((it, i) => ({ l: `${i + 1}단`, bg: n > 1 ? i % n : null, it })) };
  },
  puff: () => {
    const P = [["sc", 0], ...[0, 1, 2, 3, 4].map(k => ["puff", 1 + k * 2]), ...[0, 1, 2, 3, 4].map(k => ["ch", 2 + k * 2]), ["sc", 11]], S = Array.from({ length: 12 }, (_, c) => ["sc", c]);
    return { C: 12, cw: 26, rows: [S, P, S, P].map((it, i) => ({ l: `${i + 1}단`, it })) };
  },
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

function cchartGridSVG(spec, hexes, hi = -1) {
  const { C, cw, rows } = spec, ch = Math.round(cw * 1.3), pad = 8, lab = 34;
  const W = (spec.C2 || C) * cw + pad * 2 + lab, H = rows.length * ch + pad * 2;
  let s = `<svg class="cchart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="기호 도안, 아래에서 위로 1단부터" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">`;
  rows.forEach((row, ri) => {
    const y = pad + (rows.length - 1 - ri) * ch;
    if (row.bg != null && hexes[row.bg]) s += `<rect x="${pad}" y="${y}" width="${C * cw}" height="${ch}" fill="${hexes[row.bg]}" stroke="none" opacity=".92"/>`;
    const ink = row.bg != null && hexes[row.bg] ? inkOn(hexes[row.bg]) : null;
    const cur = ri === hi, upc = hi >= 0 && ri > hi, dn = hi >= 0 && ri < hi;
    if (dn) s += `<rect x="${pad - 4}" y="${y}" width="${C * cw + 8}" height="${ch}" rx="6" fill="#2FA36E" fill-opacity=".24"/>`;
    if (cur) s += `<rect x="${pad - 4}" y="${y}" width="${C * cw + 8}" height="${ch}" rx="6" fill="#B9A0FF" fill-opacity=".38" stroke="#7B5CE0" stroke-width="1.6"/>`;
    s += `<g${ink ? ` style="color:${ink}"` : ""}${upc ? ' opacity=".3"' : ""}>`;
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
    s += `</g><text x="${W - lab + 4}" y="${y + ch / 2 + 4}" class="cc-n" stroke="none" fill="${dn ? "#1B7F52" : "currentColor"}"${upc ? ' opacity=".3"' : ""}>${dn ? "✓" : row.l}</text>`;
  });
  return s + `</svg>`;
}

// 둥근 무늬: 꽃 · 아미구루미 · 그래니 스퀘어
// 둥근 무늬: 꽃 · 아미구루미 · 그래니 스퀘어 — 가운데부터 단(고리)별로 묶어 그려요.
// cur: 지금 뜨는 단의 고리 번호(0부터). -1이면 진행 표시 없이 그려요.
function cchartRadialSVG(pid, cur = -1) {
  const W = 300, c = W / 2;
  const R = [], bands = [];   // R[i]: i번째 단의 기호들, bands[i]: 그 단을 감싸는 띠 모양
  let cap = "";
  const glyphAt = (g, x, y, ang, sz = 30) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${(sz / 56).toFixed(3)}) translate(-24 -52)" stroke-width="${(2.4 * 56 / sz).toFixed(2)}" overflow="visible">${cg(g)}</g>`;
  const oval = (x, y, ang, rx = 7, ry = 3.4) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${ang.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" stroke-width="1.6"/>`;
  const ring = `<g transform="translate(${c} ${c}) scale(.5) translate(-24 -28)" stroke-width="3.4">${GLYPH.ring}</g>`;
  const circ = (r, w) => `<circle cx="${c}" cy="${c}" r="${r}" stroke-width="${w}"/>`;
  const sq = (h, w) => `<rect x="${c - h}" y="${c - h}" width="${2 * h}" height="${2 * h}" rx="6" stroke-width="${w}"/>`;
  if (pid === "flower") {
    let s = ring;
    for (let i = 0; i < 10; i++) { const a = i / 10 * 360 - 90, r = a * Math.PI / 180; s += glyphAt("sc", c + Math.cos(r) * 34, c + Math.sin(r) * 34, 0, 16); }
    R.push(s); bands.push(circ(31, 24));
    s = "";
    for (let i = 0; i < 5; i++) { const a = i * 72 - 90, r = a * Math.PI / 180; s += glyphAt("fan4", c + Math.cos(r) * 52, c + Math.sin(r) * 52, a + 90, 54); }
    for (let i = 0; i < 5; i++) { const a = (i * 72 - 54) * Math.PI / 180; s += `<circle cx="${(c + Math.cos(a) * 50).toFixed(1)}" cy="${(c + Math.sin(a) * 50).toFixed(1)}" r="2.8" fill="currentColor" stroke="none"/>`; }
    R.push(s); bands.push(circ(80, 52));
    cap = "안쪽 고리: 1단 짧은뜨기 10코 · 바깥 꽃잎 5장(한 코에 4코씩) · 점(●)은 빼뜨기";
  } else if (pid === "amigu") {
    [6, 12, 18, 24, 30].forEach((n, k) => {
      const Rr = 20 + k * 22; let s = k === 0 ? ring : "";
      for (let i = 0; i < n; i++) { const r = (i / n * 360 - 90) * Math.PI / 180; s += glyphAt("sc", c + Math.cos(r) * Rr, c + Math.sin(r) * Rr, 0, k > 2 ? 11 : 14); }
      s += `<text x="${c + 4}" y="${c - Rr - 4}" class="cc-n" stroke="none" fill="currentColor" font-size="9">${n}</text>`;
      R.push(s); bands.push(circ(Rr - 3, 18));
    });
    cap = "안쪽부터 1단 6코 → 2단 12코 → 3단 18코 → 4단 24코 → 5단 30코 (6~10단은 30코 그대로)";
  } else if (pid === "granny") {
    const fan3 = (x, y, dx, dy) => glyphAt("cl3", x, y, Math.atan2(dy, dx) * 180 / Math.PI + 90, 34);
    const ch = (x, y, horiz) => oval(x, y, horiz ? 0 : 90, 6, 3);
    const SIDES = [[0, -1], [1, 0], [0, 1], [-1, 0]], CORN = [[1, 1], [-1, 1], [1, -1], [-1, -1]];
    // 1단: 변마다 묶음, 모서리마다 사슬 2
    let s = ring; const h1 = 34;
    SIDES.forEach(([dx, dy]) => { s += fan3(c + dx * h1 * .78, c + dy * h1 * .78, dx, dy); });
    CORN.forEach(([sx, sy]) => { s += ch(c + sx * h1, c + sy * h1, true); });
    R.push(s); bands.push(sq(24, 30));
    // 2단: 모서리마다 (묶음, 사슬 2, 묶음), 변 가운데는 사슬 1
    s = ""; const h2 = 62;
    CORN.forEach(([sx, sy]) => { s += fan3(c + sx * (h2 - 15), c + sy * h2, 0, sy) + fan3(c + sx * h2, c + sy * (h2 - 15), sx, 0) + ch(c + sx * (h2 + 2), c + sy * (h2 + 2), true); });
    SIDES.forEach(([dx, dy]) => { s += ch(c + dx * h2, c + dy * h2, dy !== 0); });
    R.push(s); bands.push(sq(55, 32));
    // 3단: 모서리 (묶음, 사슬 2, 묶음), 변 가운데 묶음
    s = ""; const h3 = 90;
    CORN.forEach(([sx, sy]) => { s += fan3(c + sx * (h3 - 15), c + sy * h3, 0, sy) + fan3(c + sx * h3, c + sy * (h3 - 15), sx, 0) + ch(c + sx * (h3 + 2), c + sy * (h3 + 2), true); });
    SIDES.forEach(([dx, dy]) => { s += fan3(c + dx * h3, c + dy * h3, dx, dy); });
    R.push(s); bands.push(sq(80, 26));
    cap = "고리에서 시작해 단마다 한 겹씩 커져요. 부채꼴 = 한 코에 한길긴뜨기 3코, 작은 타원 = 사슬 · 모서리는 사슬 2코";
  }
  // 단별 색: 다 뜬 단 = 초록, 지금 단 = 보라 띠, 아직 = 흐리게
  let body = "";
  if (cur >= 0 && cur < R.length) body += `<g fill="none" stroke="#B9A0FF" stroke-opacity=".45">${bands[cur]}</g>`;
  R.forEach((s, i) => {
    const st = cur < 0 ? "" : i < cur ? ' style="color:#1F8A5A"' : i === cur ? ' style="color:#4B2FB0"' : ' opacity=".28"';
    body += `<g${st}>${s}</g>`;
  });
  return { svg: `<svg class="cchart-svg radial" viewBox="0 0 ${W} ${W}" role="img" aria-label="${pid} 기호 도안" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`, cap, n: R.length };
}
// 지금 뜨는 단(0부터) → 둥근 도안의 몇 번째 고리인지. 그림에 없는 단이면 note로 알려요.
function radialRound(pid, row) {
  if (pid === "flower") return { i: Math.min(row, 2) };
  if (pid === "granny") return row >= 2 ? { i: 2, note: row > 2 ? `${row + 1}단은 3단과 같은 방법으로 한 겹 더 커져요. 그림은 3단까지 있어요.` : "" } : { i: row };
  if (pid === "amigu") {
    if (row < 5) return { i: row };
    if (row < 10) return { i: 4, note: `${row + 1}단은 5단과 같은 30코 그대로예요. 바깥 고리를 한 번 더 둘러 떠요.` };
    return { i: 5, note: `${row + 1}단은 코를 줄이는 단이라 그림에는 없어요. 아래 '이번 단에 할 일'을 따라 주세요.` };
  }
  return { i: -1 };
}

// 무늬 상세 '기호 도안' 보기. 그릴 수 있는 도안이 없으면 null.
// 필레 커튼: 받은 모눈 도안을 칸 단위로 옮긴 도트 도안 + 원본 이미지
// grid는 위쪽 줄부터. # 채운 칸 · . 빈 칸 · v 레이스(2칸) · = 넓은 빈 칸(2칸)
// (원본 이미지에서 칸 위치를 맞춰 읽고, 겹쳐 그려 진한 칸 1,240개가 모두 맞는지 확인했어요)
const FILETCAT = { src: "images/ref/catfiletblanket.png", x0: 33.33, x1: 326.36, y0: 22.92, y1: 450.0, cols: 55, rows: 82,
  grid: [
    ".......................................................",
    ".##########################.##########################.",
    ".#========================#.#========================#.",
    ".#vvvvvvvvvvvvvvvvvvvvvvvv#.#vvvvvvvvvvvvvvvvvvvvvvvv#.",
    ".#==....................==#.#==....................==#.",
    ".#vv....................vv#.#vv....................vv#.",
    ".#==..#.................==#.#==....................==#.",
    ".#vv...#................vv#.#vv...#...#............vv#.",
    ".#==....#........#...#..==#.#==...#####.######.....==#.",
    ".#vv....#........#####..vv#.#vv...#############....vv#.",
    ".#==....#........#####..==#.#==...#.#.#########....==#.",
    ".#vv....#........#.#.#..vv#.#vv...##############...vv#.",
    ".#==....##.......#####..==#.#==....#############...==#.",
    ".#vv.....###......###...vv#.#vv...##############...vv#.",
    ".#==......###########...==#.#==...##.##.########...==#.",
    ".#vv......###########...vv#.#vv...............##...vv#.",
    ".#==......###########...==#.#==...............##...==#.",
    ".#vv......###########...vv#.#vv...............##...vv#.",
    ".#==......#########.##..==#.#==..............##....==#.",
    ".#vv......#.#....##..#..vv#.#vv.............##.....vv#.",
    ".#==......#.#.....#.##..==#.#==............##......==#.",
    ".#vv......#.##....#.....vv#.#vv....................vv#.",
    ".#==......##.##...##....==#.#==....................==#.",
    ".#vv....................vv#.#vv....................vv#.",
    ".#========================#.#========================#.",
    ".#vvvvvvvvvvvvvvvvvvvvvvvv#.#vvvvvvvvvvvvvvvvvvvvvvvv#.",
    ".##########################.##########################.",
    ".......................................................",
    ".##########################.##########################.",
    ".#========================#.#========================#.",
    ".#vvvvvvvvvvvvvvvvvvvvvvvv#.#vvvvvvvvvvvvvvvvvvvvvvvv#.",
    ".#==....................==#.#==....................==#.",
    ".#vv....#...............vv#.#vv....................vv#.",
    ".#==...#................==#.#==.................#..==#.",
    ".#vv...#................vv#.#vv................#...vv#.",
    ".#==...#.........#...#..==#.#==..#...#........#....==#.",
    ".#vv...#.........#####..vv#.#vv..#####........#....vv#.",
    ".#==...#...#####.#####..==#.#==..#####........#....==#.",
    ".#vv...#..########.#.#..vv#.#vv..#.#.#........#....vv#.",
    ".#==...#.#############..==#.#==..#####.......##....==#.",
    ".#vv....#############...vv#.#vv...###......###.....vv#.",
    ".#==....#############...==#.#==...###########......==#.",
    ".#vv....#####.######....vv#.#vv...###########......vv#.",
    ".#==....####...####.....==#.#==...###########......==#.",
    ".#vv.....###...####.....vv#.#vv...###########......vv#.",
    ".#==.....##.....###.....==#.#==..##.#########......==#.",
    ".#vv.....##.....##......vv#.#vv..#..##....#.#......vv#.",
    ".#==.....##.....##......==#.#==..##.#.....#.#......==#.",
    ".#vv.....##.....##......vv#.#vv.....#....##.#......vv#.",
    ".#==......##.....##.....==#.#==....##...##.##......==#.",
    ".#vv....................vv#.#vv....................vv#.",
    ".#========================#.#========================#.",
    ".#vvvvvvvvvvvvvvvvvvvvvvvv#.#vvvvvvvvvvvvvvvvvvvvvvvv#.",
    ".##########################.##########################.",
    ".......................................................",
    ".##########################.##########################.",
    ".#========================#.#========================#.",
    ".#vvvvvvvvvvvvvvvvvvvvvvvv#.#vvvvvvvvvvvvvvvvvvvvvvvv#.",
    ".#==....................==#.#==....................==#.",
    ".#vv....................vv#.#vv....................vv#.",
    ".#==....................==#.#==....................==#.",
    ".#vv............#...#...vv#.#vv....#...#...........vv#.",
    ".#==.....######.#####...==#.#==....#####......#....==#.",
    ".#vv....#############...vv#.#vv....#####.....#.....vv#.",
    ".#==....#########.#.#...==#.#==....#.#.#....#......==#.",
    ".#vv...##############...vv#.#vv....#####....#......vv#.",
    ".#==...#############....==#.#==.....###.....#......==#.",
    ".#vv...##############...vv#.#vv.....####....#......vv#.",
    ".#==...########.##.##...==#.#==.....#######..#.....==#.",
    ".#vv...##...............vv#.#vv.....########..#....vv#.",
    ".#==...##...............==#.#==.....#########.#....==#.",
    ".#vv...##...............vv#.#vv.....#########.#....vv#.",
    ".#==....##..............==#.#==.....###########....==#.",
    ".#vv.....##.............vv#.#vv.....##..#####......vv#.",
    ".#==......##............==#.#==....###.######......==#.",
    ".#vv....................vv#.#vv....................vv#.",
    ".#==....................==#.#==....................==#.",
    ".#vv....................vv#.#vv....................vv#.",
    ".#========================#.#========================#.",
    ".#vvvvvvvvvvvvvvvvvvvvvvvv#.#vvvvvvvvvvvvvvvvvvvvvvvv#.",
    ".##########################.##########################.",
    "......................................................."
  ] };
// v: 보기, scale: 확대 배율(두 손가락으로 조절), flip: 뒤집어 뜨는(짝수) 단은 도안도 좌우로 뒤집어 보기
const filetUI = { v: "dot", scale: 1, flip: (() => { try { return localStorage.getItem("siltare-filet-flip") !== "off"; } catch (e) { return true; } })() };
const filetMirror = cur => filetUI.flip && cur >= 0 && cur < FILETCAT.rows && (cur + 1) % 2 === 0;
const FILET_NAME = { "#": "채움", ".": "빈칸", v: "레이스", "=": "넓은 빈칸" }, FILET_MARK = { "#": "■", ".": "□", v: "V", "=": "═" };
// k단(1부터, 아래에서)의 칸을 뜨는 순서대로 묶어요. 레이스·넓은 빈 칸은 2칸이 한 묶음이에요.
function filetUnits(k) {
  const s = FILETCAT.grid[FILETCAT.rows - k], u = [];
  for (let c = 0; c < s.length; c++) { const ch = s[c]; if (ch === "v" || ch === "=") { u.push(ch); c++; } else u.push(ch); }
  return k % 2 ? u.reverse() : u;   // 홀수 단은 오른쪽부터
}
// k단: 뜨는 방향과 [칸 종류, 몇 묶음] 목록
function filetRowParts(k) {
  const u = filetUnits(k), runs = []; let i = 0;
  while (i < u.length) { let j = i; while (u[j] === u[i]) j++; runs.push([u[i], j - i]); i = j; }
  return { dir: k % 2 ? "← 오른쪽부터" : filetUI.flip ? "← 오른쪽부터 (뒤집은 면)" : "왼쪽부터 →", runs };
}
function filetRowText(k) {
  const { runs } = filetRowParts(k), out = runs.map(([m, n]) => `${FILET_MARK[m]}${n}`);
  const dir = k % 2 ? "← 오른쪽부터" : filetUI.flip ? "← 오른쪽부터 (뒤집은 면 · 도안도 뒤집어 보여요)" : "왼쪽부터 →";
  return `${dir}  ${out.join(" · ")}  (■ 채움 · □ 빈칸 · ═ 넓은 빈칸 · V 레이스, 2칸짜리는 1묶음으로 셈)`;
}
function filetDotSVG(cur) {
  const F = FILETCAT, cs = 10, L = 22, T = 4, Rm = 30, W = L + F.cols * cs + Rm, H = T + F.rows * cs + 6;
  const mir = filetMirror(cur);
  let s = `<g${mir ? ` transform="translate(${2 * L + F.cols * cs} 0) scale(-1 1)"` : ""}><rect x="${L}" y="${T}" width="${F.cols * cs}" height="${F.rows * cs}" fill="#fff"/>`;
  F.grid.forEach((row, r) => {
    const y = T + r * cs;
    for (let c = 0; c < row.length; c++) {
      const ch = row[c], x = L + c * cs;
      if (ch === "#") s += `<rect x="${x}" y="${y}" width="${cs}" height="${cs}" fill="#3A3346"/>`;
      else if (ch === "v") { s += `<path d="M${x + 1} ${y + 1.5}L${x + cs} ${y + cs - 1.5}L${x + 2 * cs - 1} ${y + 1.5}" fill="none" stroke="#C0563B" stroke-width="1.4"/>`; c++; }
      else if (ch === "=") { s += `<rect x="${x + .6}" y="${y + .6}" width="${2 * cs - 1.2}" height="${cs - 1.2}" fill="#EFE7D6"/><path d="M${x + 3} ${y + cs / 2}H${x + 2 * cs - 3}" stroke="#8C7A5B" stroke-width="1"/>`; c++; }
    }
  });
  for (let c = 0; c <= F.cols; c++) s += `<path d="M${L + c * cs} ${T}V${T + F.rows * cs}" stroke="#000" stroke-opacity="${c % 5 ? .14 : .4}" stroke-width="${c % 5 ? .5 : .9}"/>`;
  for (let r = 0; r <= F.rows; r++) s += `<path d="M${L} ${T + r * cs}H${L + F.cols * cs}" stroke="#000" stroke-opacity="${(F.rows - r) % 5 ? .14 : .4}" stroke-width="${(F.rows - r) % 5 ? .5 : .9}"/>`;
  const yTop = k => T + (F.rows - k) * cs;   // k단 칸의 위쪽 선
  if (cur >= 0) {
    if (cur > 0) s += `<rect x="${L}" y="${yTop(cur)}" width="${F.cols * cs}" height="${cur * cs}" fill="#2FA36E" fill-opacity=".3"/>`;
    if (cur < F.rows) {
      s += `<rect x="${L}" y="${T}" width="${F.cols * cs}" height="${yTop(cur + 1) - T}" fill="#fff" fill-opacity=".55"/>`;
      s += `<rect class="filet-band" x="${L - 2}" y="${yTop(cur + 1) - 1}" width="${F.cols * cs + 4}" height="${cs + 2}" fill="#B9A0FF" fill-opacity=".3" stroke="#7B5CE0" stroke-width="2"/>`;
    }
  }
  s += `</g>`;
  if (cur >= 0 && cur < F.rows) s += `<text x="${L + F.cols * cs + 4}" y="${yTop(cur + 1) + cs - 1.5}" font-size="9" font-weight="700" fill="#7B5CE0">${(cur + 1) % 2 || mir ? "◀" : "▶"}${cur + 1}</text>`;
  for (let k = 1; k <= F.rows; k++) if (k === 1 || k % 5 === 0) s += `<text x="${L - 3}" y="${yTop(k) + cs - 2}" font-size="7.5" text-anchor="end" fill="${cur >= 0 && k <= cur ? "#1F8A5A" : "#6F6A7E"}">${k}</text>`;
  return `<svg class="filet-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="고양이 필레 커튼 도트 도안 ${F.cols}칸 × ${F.rows}단">${s}</svg>`;
}
function filetImgSVG(cur) {
  const F = FILETCAT, ph = (F.y1 - F.y0) / F.rows, yOf = k => F.y1 - k * ph;
  let ov = "";
  if (cur >= 0) {
    if (cur > 0) ov += `<rect x="${F.x0}" y="${yOf(cur)}" width="${F.x1 - F.x0}" height="${cur * ph}" fill="#2FA36E" fill-opacity=".28"/>`;
    if (cur < F.rows) {
      ov += `<rect x="${F.x0}" y="${F.y0}" width="${F.x1 - F.x0}" height="${yOf(cur + 1) - F.y0}" fill="#17141F" fill-opacity=".4"/>`;
      ov += `<rect class="filet-band" x="${F.x0 - 2}" y="${yOf(cur + 1)}" width="${F.x1 - F.x0 + 4}" height="${ph}" fill="#B9A0FF" fill-opacity=".35" stroke="#7B5CE0" stroke-width="1.2"/>`;
    }
  }
  let num = "";
  for (let k = 5; k <= F.rows; k += 5) num += `<text x="${F.x0 - 3}" y="${yOf(k) + ph * .8}" font-size="5.5" text-anchor="end" fill="#6F6A7E">${k}</text>`;
  const mir = filetMirror(cur);
  return `<svg class="filet-svg" viewBox="14 14 340 445" role="img" aria-label="고양이 필레 커튼 원본 모눈 도안${mir ? " (좌우로 뒤집어 보기)" : ""}"><g${mir ? ` transform="translate(${F.x0 + F.x1} 0) scale(-1 1)"` : ""}><image href="${F.src}" x="0" y="0" width="367" height="617"/>${ov}</g>${num}</svg>`;
}
function filetChartHTML(hiRow, opt = {}) {
  const F = FILETCAT, cur = hiRow >= 0 ? Math.min(hiRow, F.rows) : -1, photo = filetUI.v === "photo", dot = !photo && filetUI.v !== "img";
  const tools = `<div class="filet-tools">${opt.noSeg ? "" : `<div class="seg" role="group" aria-label="도안 보기"><button type="button" data-filet-v="dot" aria-pressed="${dot}">도트 도안</button><button type="button" data-filet-v="img" aria-pressed="${!dot && !photo}">원본 이미지</button><button type="button" data-filet-v="photo" aria-pressed="${photo}">완성 사진</button></div>`}
    <button type="button" class="ghost-btn" data-filet-z aria-pressed="${filetUI.scale > 1.05}">${filetUI.scale > 1.05 ? "− 화면에 맞추기" : "＋ 크게 보기"}</button>
    ${cur >= 0 ? `<button type="button" class="ghost-btn" data-filet-flip aria-pressed="${filetUI.flip}">뒤집은 단 좌우 반전 ${filetUI.flip ? "켜짐" : "꺼짐"}</button>` : ""}</div>`;
  const now = cur >= 0 && cur < F.rows ? `<div class="filet-now"><b>${cur + 1}단</b> <span>${filetRowText(cur + 1)}</span></div>` : "";
  const legend = dot ? `<p class="cc-cap">■ 채운 칸 · □ 빈 칸 · <b style="color:#C0563B">V</b> 레이스(2칸) · ═ 넓은 빈 칸(2칸). 맨 아래 줄이 1단이고, 홀수 단은 오른쪽부터 읽어요.</p>` : `<p class="cc-cap">받은 원본 모눈 도안이에요. 맨 아래 줄이 1단이에요.</p>`;
  const cap = cur < 0 ? "" : cur >= F.rows ? `<p class="cc-cap">모든 단을 다 떴어요!</p>` : `<p class="cc-cap">초록 = 다 뜬 단 · 보라 띠 = 지금 단 · 흐림 = 아직이에요.</p>`;
  if (photo) return `<div class="cchart filet">${tools.replace(/<button type="button" class="ghost-btn" data-filet-z[^]*?<\/button>/, "")}${now}
    ${photoFigure("images/ref/catfiletcurtain.webp", "고양이 필레 커튼", "같은 고양이 칸을 3×3(9칸)으로 늘리고 아래에 레이스 단을 단 커튼이에요.")}</div>`;
  return `<div class="cchart filet">${tools}${now}<div class="cchart-card filet-scroll" data-filet-scroll style="--fz:${filetUI.scale}">${dot ? filetDotSVG(cur) : filetImgSVG(cur)}</div>${filetMirror(cur) ? `<p class="cc-cap flip-note">↔ ${cur + 1}단은 편물을 뒤집어 뜨는 단이라, 내 쪽에서 보이는 대로 도안을 좌우로 뒤집어 보여 줘요.</p>` : ""}${cap}${legend}</div>`;
}
document.addEventListener("click", e => {
  const v = e.target.closest("[data-filet-v]"), z = e.target.closest("[data-filet-z]"), fl = e.target.closest("[data-filet-flip]");
  if (!v && !z && !fl) return;
  if (v) filetUI.v = v.dataset.filetV;
  else if (z) filetUI.scale = filetUI.scale > 1.05 ? 1 : 2.6;
  else { filetUI.flip = !filetUI.flip; try { localStorage.setItem("siltare-filet-flip", filetUI.flip ? "on" : "off"); } catch (err) {} }
  const y = scroller().scrollTop, inSheet = !$("sheet-pat").hidden, panel = inSheet && $("sheet-pat").querySelector(".sheet-panel"), py = panel ? panel.scrollTop : 0;
  if (inSheet) { renderDetail(); panel.scrollTop = py; } else { renderCounter(); scroller().scrollTop = y; }
  requestAnimationFrame(() => { const box = document.querySelector(".cchart.filet"); if (box) box.scrollIntoView({ block: "nearest" }); });
});
function crochetChartHTML(pid, cols, hiRow = -1) {
  if (pid === "filetcat") return filetChartHTML(hiRow);
  const hexes = chartHexes(cols);
  if (["flower", "amigu", "granny"].includes(pid)) {
    const rr = hiRow >= 0 ? radialRound(pid, hiRow) : { i: -1 }, r = cchartRadialSVG(pid, rr.i);
    const prog = hiRow < 0 ? "" : rr.i >= r.n ? "모든 고리를 다 떴어요. " : `지금은 안쪽에서 ${rr.i + 1}번째 고리예요. 초록 = 다 뜬 단, 보라 띠 = 지금 단, 흐림 = 아직이에요. `;
    return `<div class="cchart"><div class="cchart-card">${r.svg}</div><p class="cc-cap">${prog}${rr.note ? rr.note + " " : ""}${r.cap}</p></div>`;
  }
  if (CCHART[pid]) {
    const spec = CCHART[pid](cols), hi = hiRow >= 0 ? hiRow % spec.rows.length : -1;
    return `<div class="cchart"><div class="cchart-card scroll">${cchartGridSVG(spec, hexes, hi)}</div><p class="cc-cap">${hi >= 0 ? `지금은 ${hi + 1}번 줄이에요. 초록 ✓ = 다 뜬 줄, 보라 띠 = 지금 줄, 흐림 = 아직이에요. ` : ""}겉면에서 본 모양, 아래에서 위로 읽어요. 왕복으로 뜨면 단마다 읽는 방향이 바뀌어요.</p></div>`;
  }
  return null;
}

// 도안 상자 안에서 두 손가락으로 확대·축소 (화면 전체는 커지지 않아요). 트랙패드는 ctrl+스크롤.
(function () {
  let pz = null;
  const box = e => e.target.closest && e.target.closest("[data-filet-scroll]");
  const apply = (sc, scale, fx, fy) => {   // (fx, fy): 상자 안 손가락 위치. 그 지점이 그대로 머물게 스크롤을 맞춰요
    const old = filetUI.scale, k = scale / old; filetUI.scale = scale; sc.style.setProperty("--fz", scale);
    sc.scrollLeft = (sc.scrollLeft + fx) * k - fx; sc.scrollTop = (sc.scrollTop + fy) * k - fy;
    const zb = sc.closest(".cchart").querySelector("[data-filet-z]"); if (zb) { zb.textContent = scale > 1.05 ? "− 화면에 맞추기" : "＋ 크게 보기"; zb.setAttribute("aria-pressed", scale > 1.05); }
  };
  const clamp = x => Math.max(1, Math.min(6, x));
  const mid = (t, r) => [(t[0].clientX + t[1].clientX) / 2 - r.left, (t[0].clientY + t[1].clientY) / 2 - r.top];
  const dist = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  document.addEventListener("touchstart", e => { const sc = box(e); if (!sc || e.touches.length !== 2) return; pz = { sc, d0: dist(e.touches), s0: filetUI.scale }; }, { passive: true });
  document.addEventListener("touchmove", e => {
    if (!pz || e.touches.length !== 2) return; e.preventDefault();
    const r = pz.sc.getBoundingClientRect(), [fx, fy] = mid(e.touches, r);
    apply(pz.sc, clamp(pz.s0 * dist(e.touches) / pz.d0), fx, fy);
  }, { passive: false });
  document.addEventListener("touchend", e => { if (pz && e.touches.length < 2) pz = null; });
  document.addEventListener("gesturestart", e => { if (box(e)) e.preventDefault(); });   // 아이폰: 페이지 전체 확대 막기
  document.addEventListener("gesturechange", e => { if (box(e)) e.preventDefault(); });
  document.addEventListener("wheel", e => {
    const sc = box(e); if (!sc || !e.ctrlKey) return; e.preventDefault();
    const r = sc.getBoundingClientRect(); apply(sc, clamp(filetUI.scale * Math.exp(-e.deltaY / 200)), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
})();

// 단별 읽기: 다 뜬 단은 접고, 지금 단과 다음 3단을 칸 순서로 보여 줘요
function filetRowsHTML(cur) {
  const F = FILETCAT, row = k => { const { dir, runs } = filetRowParts(k);
    return `<span class="fr-k">${k}단</span><span class="fr-dir">${dir}</span><span class="fr-runs">${runs.map(([m, n]) => `<span class="fr-run m${m === "#" ? "f" : m === "." ? "e" : m === "v" ? "v" : "w"}"><i>${FILET_MARK[m]}</i>${n}</span>`).join("")}</span>`; };
  if (cur >= F.rows) return `<div class="frows"><p class="fr-all">✓ ${F.rows}단을 모두 떴어요!</p></div>`;
  const now = cur + 1, next = [now + 1, now + 2, now + 3].filter(k => k <= F.rows), restFrom = now + 4;
  let h = `<div class="frows">`;
  if (cur > 0) h += `<details class="fr-fold"><summary>✓ 1~${cur}단 다 떴어요</summary><ol class="fr-list done">${Array.from({ length: cur }, (_, i) => `<li>${row(i + 1)}</li>`).join("")}</ol></details>`;
  h += `<div class="fr-now"><span class="label">지금 뜰 단</span>${row(now)}</div>`;
  if (next.length) h += `<ol class="fr-list">${next.map(k => `<li>${row(k)}</li>`).join("")}</ol>`;
  if (restFrom <= F.rows) h += `<details class="fr-fold"><summary>나머지 ${restFrom}~${F.rows}단 보기</summary><ol class="fr-list">${Array.from({ length: F.rows - restFrom + 1 }, (_, i) => `<li>${row(restFrom + i)}</li>`).join("")}</ol></details>`;
  return h + `<p class="cc-cap">■ 채움 · □ 빈칸 · ═ 넓은 빈칸 · V 레이스 (2칸짜리는 1묶음으로 셈). 숫자는 이어지는 묶음 수예요.</p></div>`;
}
