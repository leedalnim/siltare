// ---------- 떴을 때 모습: 도트 도안을 실제 겉뜨기 편물처럼 그려요 ----------
// 칸 하나 = 겉뜨기 V 코 하나. 코 한 다리를 둥근 실 가닥이 꼬인 합사로 그리고(가닥 음영·섬유 결·잔털),
// 색마다 코 그림을 몇 개 미리 만들어 두고(스프라이트) 찍어 붙여서, 칠하는 대로 바로 다시 그려도 빨라요.
const knitHex = h => { const n = parseInt(String(h).slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const knitShade = (c, a) => c.map(v => Math.max(0, Math.min(255, Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a))));
const knitRgb = (c, al = 1) => `rgba(${c[0]},${c[1]},${c[2]},${al})`;
function knitRand(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }

function knitLeg(ctx, cx, y, cw, ch, side, col, rand, o = {}) {
  ctx.save();
  ctx.translate(cx + side * cw * 0.05, y + ch * (o.by || 0.74)); ctx.rotate(side * (o.ang || 0.45) + (rand() - .5) * 0.06);
  const lw = cw * (o.lw || 0.47), lh = ch * (o.lh || 1.38);
  const path = () => { ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-lw * 0.62, -lh * 0.10, -lw * 0.66, -lh * 1.02, 0, -lh); ctx.bezierCurveTo(lw * 0.66, -lh * 1.02, lw * 0.62, -lh * 0.10, 0, 0); ctx.closePath(); };
  ctx.shadowColor = "rgba(0,0,0,.45)"; ctx.shadowBlur = cw * 0.18; ctx.shadowOffsetY = cw * 0.06; ctx.shadowOffsetX = side * cw * 0.03;
  const lit = side < 0, a = knitShade(col, 0.26), m = knitShade(col, 0.06), d = knitShade(col, -0.34);
  const g = ctx.createLinearGradient(-lw / 2, 0, lw / 2, 0);
  g.addColorStop(0, knitRgb(lit ? a : d)); g.addColorStop(0.5, knitRgb(m)); g.addColorStop(1, knitRgb(lit ? d : a));
  ctx.fillStyle = g; path(); ctx.fill(); ctx.shadowColor = "transparent";
  const v = ctx.createLinearGradient(0, -lh, 0, 0);
  v.addColorStop(0, knitRgb(knitShade(col, -0.4), .55)); v.addColorStop(0.22, knitRgb(col, 0)); v.addColorStop(0.85, knitRgb(col, 0)); v.addColorStop(1, knitRgb(knitShade(col, -0.3), .4));
  ctx.fillStyle = v; path(); ctx.fill();
  if (cw >= 7) {   // 작게 볼 땐 결이 뭉개지니까 생략
    ctx.save(); path(); ctx.clip();
    const plies = 7, step = lh / plies * 1.05, tilt = lw * 0.55;
    for (let k = -1; k <= plies; k++) {
      const y0 = -lh + k * step + (rand() - .5) * step * 0.15, tone = knitShade(col, (rand() - .5) * 0.08);
      const pg = ctx.createLinearGradient(0, y0 - step * 0.5, 0, y0 + step * 0.5);
      pg.addColorStop(0, knitRgb(knitShade(tone, -0.24), .92)); pg.addColorStop(0.38, knitRgb(knitShade(tone, 0.12), .9)); pg.addColorStop(0.55, knitRgb(knitShade(tone, 0.2), .88)); pg.addColorStop(1, knitRgb(knitShade(tone, -0.28), .92));
      ctx.fillStyle = pg; ctx.beginPath();
      ctx.moveTo(-lw, y0 + tilt - step * 0.5); ctx.quadraticCurveTo(0, y0 + tilt * 0.35 - step * 0.62, lw, y0 - tilt * 0.2 - step * 0.5);
      ctx.lineTo(lw, y0 - tilt * 0.2 + step * 0.5); ctx.quadraticCurveTo(0, y0 + tilt * 0.35 + step * 0.38, -lw, y0 + tilt + step * 0.5);
      ctx.closePath(); ctx.fill();
    }
    for (let i = 0; i < 26; i++) {
      const y0 = -lh + rand() * lh * 1.1, len = lw * (0.5 + rand() * 0.7), x0 = -lw * 0.6 + rand() * lw * 0.5;
      ctx.strokeStyle = rand() < .55 ? knitRgb(knitShade(col, 0.5), 0.18 + rand() * 0.15) : knitRgb(knitShade(col, -0.5), 0.15 + rand() * 0.12);
      ctx.lineWidth = 0.25 + rand() * 0.35; ctx.beginPath(); ctx.moveTo(x0, y0 + tilt * 0.5); ctx.lineTo(x0 + len, y0 + tilt * 0.5 - len * 0.55); ctx.stroke();
    }
    const eg = ctx.createRadialGradient(-lw * 0.12 * side, -lh * 0.55, lw * 0.15, 0, -lh * 0.5, lw * 0.95);
    eg.addColorStop(0, "rgba(255,255,255,0.06)"); eg.addColorStop(0.7, "rgba(0,0,0,0)"); eg.addColorStop(1, "rgba(0,0,0,0.2)");
    ctx.fillStyle = eg; ctx.fillRect(-lw, -lh * 1.1, lw * 2, lh * 1.2);
    ctx.restore();
    for (let k = 0; k < 7; k++) {
      const tt = rand(), yy = -lh * (0.08 + tt * 0.84), sgn = rand() < .5 ? -1 : 1, xx = sgn * lw * 0.47 * Math.sin(Math.PI * (0.1 + tt * 0.8));
      ctx.strokeStyle = knitRgb(knitShade(col, 0.3 + rand() * 0.2), 0.18 + rand() * 0.2); ctx.lineWidth = 0.25 + rand() * 0.2;
      ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + sgn * (1.5 + rand() * 2), yy - rand() * 2, xx + sgn * (2.5 + rand() * 3), yy - (1 + rand() * 3)); ctx.stroke();
    }
  }
  ctx.restore();
}
// 코 그림 미리 만들기: 색 · 크기마다 4가지(코마다 살짝 다르게 보이도록)
const knitSprites = new Map();
// 짧은뜨기 코: 짧고 통통한 두 다리 + 위에 가로로 누운 고리(코 머리)
function scTop(ctx, cx, y, cw, ch, col, rand) {
  const rx = cw * 0.47, ry = ch * 0.13, cy = y, lwid = Math.max(0.8, ch * 0.15);
  for (const [a0, a1, k] of [[Math.PI, Math.PI * 2, -0.3], [0, Math.PI, 0.12]]) {   // 뒤쪽 가닥(어둡게) → 앞쪽 가닥(밝게)
    const g = ctx.createLinearGradient(0, cy - ry - lwid, 0, cy + ry + lwid);
    g.addColorStop(0, knitRgb(knitShade(col, k + 0.15))); g.addColorStop(0.5, knitRgb(knitShade(col, k))); g.addColorStop(1, knitRgb(knitShade(col, k - 0.25)));
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = cw * 0.12; ctx.shadowOffsetY = cw * 0.04;
    ctx.strokeStyle = g; ctx.lineWidth = lwid; ctx.lineCap = "round";
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, (rand() - .5) * 0.08, a0, a1); ctx.stroke(); ctx.restore();
    if (cw >= 7) {   // 꼬임 결
      ctx.strokeStyle = knitRgb(knitShade(col, -0.35), 0.45); ctx.lineWidth = 0.4;
      for (let t = a0 + 0.15; t < a1; t += 0.32) { const x = cx + Math.cos(t) * rx, yy = cy + Math.sin(t) * ry; ctx.beginPath(); ctx.moveTo(x - lwid * 0.35, yy - lwid * 0.4); ctx.lineTo(x + lwid * 0.35, yy + lwid * 0.4); ctx.stroke(); }
    }
  }
}
function knitSprite(hex, cw, ch, dpr, n, st = "knit") {
  const key = `${hex}|${cw}|${dpr}|${n}|${st}`; let s = knitSprites.get(key); if (s) return s;
  if (knitSprites.size > 400) knitSprites.clear();
  const off = ch * 0.9, W = cw * 1.6, H = ch * 2.6, cv = document.createElement("canvas");
  cv.width = Math.ceil(W * dpr); cv.height = Math.ceil(H * dpr);
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const rand = knitRand(97 + n * 131 + parseInt(String(hex).slice(1), 16) % 997), col = knitShade(knitHex(hex), (rand() - .5) * 0.07);
  const wob = (rand() - .5) * cw * 0.04;
  if (st === "sc") {
    for (const side of [-1, 1]) knitLeg(ctx, cw * 0.8 + wob, off + ch * 0.5, cw, ch, side, col, rand, { ang: 0.52, lw: 0.42, lh: 1.08, by: 0.92 });
    scTop(ctx, cw * 0.8 + wob, off + ch * 0.5 - ch * 0.2, cw, ch, col, rand);
  } else for (const side of [-1, 1]) knitLeg(ctx, cw * 0.8 + wob, off + ch * 0.5, cw, ch, side, col, rand);
  s = { cv, ox: cw * 0.3, oy: off }; knitSprites.set(key, s); return s;
}
// d = { w, h, cells(위쪽 줄부터, 팔레트 번호), pal(hex) }, opt = { rx, ry, maxW, maxH, row(지금 단 · 아래에서 0부터) }
function knitDraw(cv, d, opt = {}) {
  if (!cv || !d || !d.w) return;
  const rx = opt.rx || 1, ry = opt.ry || 1, cols = d.w * rx, rows = d.h * ry;
  const maxW = opt.maxW || (cv.parentElement ? cv.parentElement.clientWidth : 340), maxH = opt.maxH || 9999;
  const st = opt.stitch === "sc" ? "sc" : "knit", ratio = st === "sc" ? 0.92 : 0.86;
  const cw = Math.max(3, Math.min(26, maxW / cols, maxH / ((rows + 0.5) * ratio))), ch = cw * ratio;
  const W = cols * cw, H = rows * ch + ch * 0.5, dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + "px"; cv.style.height = H + "px";
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const at = (r, c) => d.pal[d.cells[(r % d.h) * d.w + (c % d.w)]] || d.pal[0] || "#FFFFFF";
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { ctx.fillStyle = knitRgb(knitShade(knitHex(at(r, c)), -0.78)); ctx.fillRect(c * cw, r * ch, cw + .5, ch * 1.5 + .5); }
  const cwq = Math.round(cw * 4) / 4;   // 크기를 조금 묶어서 코 그림을 다시 쓰게
  for (let r = rows - 1; r >= 0; r--) for (let c = 0; c < cols; c++) {
    const s = knitSprite(at(r, c), cwq, cwq * ratio, dpr, (r * 7 + c * 13) % 4, st);
    ctx.drawImage(s.cv, c * cw - s.ox, r * ch - s.oy, s.cv.width / dpr, s.cv.height / dpr);
  }
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "rgba(255,255,255,.05)"); g.addColorStop(1, "rgba(0,0,0,.07)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (opt.row != null && opt.row < d.h && ry === 1) {   // 아직 안 뜬 단은 흐리게
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || "#fff";
    ctx.globalAlpha = .62; ctx.fillRect(0, 0, W, Math.max(0, (d.h - 1 - opt.row) * ch + ch * 0.5)); ctx.globalAlpha = 1;
  }
}
// 그리는 동안 실시간으로: 한 프레임에 한 번만 다시 그려요
let knitLiveQ = false;
function knitLive() {
  if (knitLiveQ) return; knitLiveQ = true;
  requestAnimationFrame(() => { knitLiveQ = false; const cv = $("dot-knit"); if (cv && !cv.closest("[hidden]")) knitDraw(cv, dotEd, { maxH: 190 }); });
}
