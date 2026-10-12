// ---------- Swatch drawing ----------
const toArr = h => Array.isArray(h) ? h : (n => [n >> 16 & 255, n >> 8 & 255, n & 255])(parseInt(h.slice(1), 16));
const mix = (c, a) => toArr(c).map(v => Math.round(a < 0 ? v * (1 + a) : v + (255 - v) * a));
const css = (c, a = 0) => `rgb(${mix(c, a).join(",")})`;
const md = (a, n) => ((a % n) + n) % n;
function liftDark(c) { const a = toArr(c); const l = .3 * a[0] + .59 * a[1] + .11 * a[2]; return l < 70 ? mix(a, .22) : a; }

// stable display colour per colour key (unknown colours get a fixed stand-in by yarn order)
function hexFor(key) {
  const c = cinfo(key); if (c.hex) return c.hex;
  const unknowns = state.yarns.filter(y => !cinfo(y.color).hex).map(colorKey);
  return FALLBACK[Math.max(0, unknowns.indexOf(key)) % 4];
}
function colorsFor(ys, mainKey) {
  const by = {};
  ys.forEach(y => { const k = colorKey(y); by[k] = (by[k] || 0) + y.grams; });
  const keys = Object.keys(by).sort((a, b) => (b === mainKey) - (a === mainKey) || by[b] - by[a]);
  const out = [];
  keys.forEach(k => { const c = hexFor(k); if (!out.includes(c)) out.push(c); });
  if (!out.length) out.push(FALLBACK[0]);
  return out.slice(0, 4).map(liftDark);
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function drawV(ctx, x, y, w, h, c) {
  const cx = x + w / 2, by = y + h * 1.1, ty = y - h * 0.15;
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(cx, by);
    ctx.bezierCurveTo(cx + s * w * 0.52, y + h * 0.75, cx + s * w * 0.5, y + h * 0.2, cx + s * w * 0.38, ty);
    ctx.bezierCurveTo(cx + s * w * 0.1, y + h * 0.12, cx + s * w * 0.03, y + h * 0.55, cx, by);
    ctx.closePath();
    const g = ctx.createLinearGradient(cx + s * w * 0.5, y, cx, y + h);
    g.addColorStop(0, css(c, s < 0 ? 0.14 : -0.04)); g.addColorStop(1, css(c, s < 0 ? -0.12 : -0.24));
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = css(c, -0.4); ctx.lineWidth = 0.6; ctx.stroke();
  }
}
function drawBump(ctx, x, y, w, h, c) {
  const cx = x + w / 2, cy = y + h / 2;
  const g = ctx.createRadialGradient(cx - w * 0.1, cy - h * 0.25, 0.5, cx, cy, w * 0.6);
  g.addColorStop(0, css(c, 0.14)); g.addColorStop(1, css(c, -0.32));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.54, h * 0.44, 0, 0, Math.PI * 2); ctx.fill();
}
function scSt(ctx, x, y, w, h, c) {
  const cx = x + w / 2;
  ctx.save(); ctx.translate(cx, y + h * 0.6); ctx.rotate(-0.35);
  const g = ctx.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, css(c, 0.1)); g.addColorStop(1, css(c, -0.28));
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.36, h * 0.42, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.strokeStyle = css(c, 0.16); ctx.lineWidth = Math.max(1.1, h * 0.15);
  ctx.beginPath(); ctx.ellipse(cx, y + h * 0.15, w * 0.42, h * 0.1, 0, 0, Math.PI * 2); ctx.stroke();
}
function dcSt(ctx, x, y, w, h, c, ang = 0) {
  ctx.save(); ctx.translate(x + w / 2, y + h); ctx.rotate(ang);
  const pw = w * 0.5;
  const g = ctx.createLinearGradient(-pw / 2, 0, pw / 2, 0); g.addColorStop(0, css(c, 0.14)); g.addColorStop(1, css(c, -0.3));
  ctx.fillStyle = g; rr(ctx, -pw / 2, -h * 0.86, pw, h * 0.86, pw / 2); ctx.fill();
  ctx.strokeStyle = css(c, -0.42); ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-pw / 2, -h * 0.4); ctx.lineTo(pw / 2, -h * 0.56); ctx.stroke();
  ctx.strokeStyle = css(c, 0.2); ctx.lineWidth = Math.max(1, w * 0.13);
  ctx.beginPath(); ctx.ellipse(0, -h * 0.92, w * 0.42, Math.max(1, w * 0.12), 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}
function chain(ctx, cx, cy, len, ang, c) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
  ctx.strokeStyle = css(c, 0.08); ctx.lineWidth = Math.max(1.2, len * 0.45);
  ctx.beginPath(); ctx.ellipse(0, 0, len, len * 0.42, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}

const SW = 11, SH = 10;
function grid(ctx, W, H, cell) {
  const cols = Math.ceil(W / SW) + 1, rows = Math.ceil(H / SH) + 2;
  for (let j = rows; j >= -1; j--) for (let i = -1; i <= cols; i++) {
    const k = cell(i, j); if (!k) continue;
    const x = i * SW + (k.dx || 0), y = j * SH;
    if (k.t === "v") { const th = k.tall || 1; drawV(ctx, x, y - (th - 1) * SH, SW, SH * th, k.c); }
    else { const bh = SH * (k.hs || 0.9); drawBump(ctx, x, y + (SH - bh) / 2, SW, bh, k.c); }
  }
}
const V = c => ({ t: "v", c }), B = (c, o) => Object.assign({ t: "b", c }, o || {});
function stripeSeq(n) { if (n < 2) return [0]; const s = []; for (let k = 0; k < Math.min(n, 4); k++) for (let r = 0; r < (k === 0 ? 3 : 2); r++) s.push(k); return s; }
const CW = 9, CH = 9;
function cgrid(W, H, h, fn) { for (let j = Math.ceil(H / h) + 1; j >= -1; j--) for (let i = -1; i * CW < W + CW; i++) fn(i, j, i * CW, j * h); }
const HEART = ["000000000", "001101100", "011111110", "011111110", "001111100", "000111000", "000010000", "000000000"];

const DRAW = {
  knit: {
    stock: (x, W, H, C) => grid(x, W, H, () => V(C[0])),
    garter: (x, W, H, C) => grid(x, W, H, (i, j) => md(j, 2) ? B(C[0], { hs: 1.3, dx: md(j, 4) === 1 ? SW / 2 : 0 }) : V(mix(C[0], -0.15))),
    rib: (x, W, H, C) => grid(x, W, H, i => md(i, 4) < 2 ? V(C[0]) : B(mix(C[0], -0.3), { hs: 0.75 })),
    seed: (x, W, H, C) => grid(x, W, H, (i, j) => md(i + j, 2) ? V(C[0]) : B(C[0], { hs: 1 })),
    basket: (x, W, H, C) => grid(x, W, H, (i, j) => md(Math.floor(i / 4) + Math.floor(j / 4), 2) ? V(C[0]) : B(mix(C[0], -0.06), { hs: 1 })),
    waffle: (x, W, H, C) => grid(x, W, H, (i, j) => md(j, 4) === 0 ? B(C[0], { hs: 1.2 }) : md(i, 3) === 2 ? B(mix(C[0], -0.32), { hs: 0.7 }) : V(C[0])),
    cable: (ctx, W, H, C) => {
      const c = C[0];
      grid(ctx, W, H, () => B(mix(c, -0.22), { hs: 0.85 }));
      const half = SW * 2, seg = SH * 7, unit = SW * 6;
      for (let x0 = SW; x0 < W + unit; x0 += unit) {
        ctx.fillStyle = "rgba(0,0,0,.2)"; ctx.fillRect(x0 - 2, 0, half * 2 + 4, H);
        const back = [], front = [];
        for (let y = -SH * 2; y < H + SH; y += SH * 0.85) {
          const s = Math.floor(y / seg), t = (y - s * seg) / seg;
          let k = Math.min(1, Math.max(0, (t - 0.3) / 0.45)); k = k * k * (3 - 2 * k);
          back.push([x0 + k * half, y]); front.push([x0 + half - k * half, y]);
        }
        for (const arr of [back, front]) for (let n = arr.length - 1; n >= 0; n--) { const [px, py] = arr[n]; drawV(ctx, px, py, SW, SH, c); drawV(ctx, px + SW, py, SW, SH, c); }
      }
    },
    lace: (ctx, W, H, C) => {
      grid(ctx, W, H, () => V(C[0]));
      ctx.fillStyle = css(C[0], -0.62);
      for (let j = 0; j * SH < H + SH; j++) for (let i = 0; i * SW < W + SW; i++) {
        if ((md(j, 4) === 1 && md(i, 4) === 1) || (md(j, 4) === 3 && md(i, 4) === 3)) {
          ctx.beginPath(); ctx.ellipse(i * SW + SW / 2, j * SH + SH * 0.55, SW * 0.32, SH * 0.36, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
    },
    brioche: (ctx, W, H, C) => {
      const c = C[0], cw = 9, rh = 12, rows = Math.ceil(H / rh) + 1;
      for (let j = rows; j >= -1; j--) for (let i = -1; i * cw < W + cw; i++) if (md(i, 2)) drawBump(ctx, i * cw, j * rh + 3, cw, rh * 0.5, mix(c, -0.45));
      for (let j = rows; j >= -1; j--) for (let i = -1; i * cw < W + cw; i++) if (!md(i, 2)) drawV(ctx, i * cw - 3, j * rh, cw + 6, rh * 1.05, c);
    },
    stripe: (x, W, H, C) => { const s = stripeSeq(C.length); grid(x, W, H, (i, j) => V(C[s[md(j, s.length)]])); },
    slip: (x, W, H, C) => {
      const a = C[0], b = C[1] || mix(a, 0.45);
      grid(x, W, H, (i, j) => {
        const band = md(j, 4), shift = md(Math.floor(j / 4), 2) * 2, hit = md(i + shift, 4) === 1;
        if (band >= 2) { if (hit) return band === 3 ? { t: "v", c: a, tall: 2.1 } : null; return V(b); }
        return V(a);
      });
    },
    fairisle: (x, W, H, C) => {
      const a = C[0], b = C[1] || mix(a, 0.5), c = C[2] || b;
      grid(x, W, H, (i, j) => {
        const r = md(j, 11);
        if (r === 0 || r === 10 || r === 2 || r === 8) return V(a);
        if (r === 1 || r === 9) return V(md(i + (r === 9 ? 1 : 0), 2) ? b : a);
        const d = Math.abs(md(i, 8) - 4) + Math.abs(r - 5);
        return V(d <= 1 ? c : d === 3 ? b : a);
      });
    }
  },
  crochet: {
    sc: (ctx, W, H, C) => cgrid(W, H, CH, (i, j, px, py) => scSt(ctx, px, py, CW, CH, C[0])),
    dc: (ctx, W, H, C) => cgrid(W, H, 18, (i, j, px, py) => dcSt(ctx, px, py, CW, 18, C[0], md(j, 2) ? 0.06 : -0.06)),
    moss: (ctx, W, H, C) => cgrid(W, H, CH, (i, j, px, py) => { if (md(i + j, 2)) scSt(ctx, px, py, CW, CH, C[0]); else chain(ctx, px + CW / 2, py + CH * 0.45, CW * 0.42, 0, mix(C[0], -0.1)); }),
    granny: (ctx, W, H, C) => {
      const T = 92, ox = (W - T * Math.ceil(W / T)) / 2, oy = (H - T * Math.ceil(H / T)) / 2;
      for (let a = -1; ox + a * T < W; a++) for (let b = -1; oy + b * T < H; b++) {
        const cx = ox + a * T + T / 2, cy = oy + b * T + T / 2;
        ctx.save(); ctx.translate(cx, cy);
        for (let q = 0; q < 8; q++) { ctx.save(); ctx.rotate(q * Math.PI / 4); dcSt(ctx, -2, -10, 4, 8, C[0]); ctx.restore(); }
        for (let r = 1; r <= 3; r++) {
          const half = 6 + r * 11, col = C[r % C.length];
          for (let s = 0; s < 4; s++) {
            ctx.save(); ctx.rotate(s * Math.PI / 2);
            const n = r + 1;
            for (let k = 0; k < n; k++) {
              const xk = -half * 0.86 + k * (1.72 * half) / (n - 1);
              for (const o of [-3.4, 0, 3.4]) dcSt(ctx, xk + o - 2, -half - 2, 4, 11, col);
            }
            ctx.restore();
          }
        }
        ctx.restore();
      }
    },
    shell: (ctx, W, H, C) => {
      const sw = 26, sh = 15;
      for (let j = Math.ceil(H / sh) + 1; j >= -1; j--) {
        const off = md(j, 2) ? sw / 2 : 0;
        for (let i = -1; i * sw < W + sw; i++) {
          const bx = i * sw + off + sw / 2, by = j * sh + sh;
          for (let q = -2; q <= 2; q++) { ctx.save(); ctx.translate(bx, by); ctx.rotate(q * 0.36); dcSt(ctx, -2.5, -sh - 2, 5, sh + 2, C[0]); ctx.restore(); }
        }
      }
    },
    mesh: (ctx, W, H, C) => {
      const s = 18;
      for (const dir of [1, -1]) for (let k = -H - s; k < W + H + s; k += s)
        for (let t = 0; t < (H + s) / 0.7; t += 6.4) chain(ctx, k + dir * t * 0.7, t * 0.7, 3.4, Math.atan2(1, dir), C[0]);
    },
    popcorn: (ctx, W, H, C) => {
      DRAW.crochet.sc(ctx, W, H, C);
      const s = 22;
      for (let j = -1; j * s < H + s; j++) for (let i = -1; i * s < W + s; i++) {
        const cx = i * s + (md(j, 2) ? s / 2 : 0) + s / 2, cy = j * s + s / 2;
        ctx.fillStyle = "rgba(0,0,0,.3)"; ctx.beginPath(); ctx.ellipse(cx + 1.5, cy + 2.5, 8, 7, 0, 0, Math.PI * 2); ctx.fill();
        const g = ctx.createRadialGradient(cx - 2.5, cy - 3, 1, cx, cy, 8.5);
        g.addColorStop(0, css(C[0], 0.3)); g.addColorStop(0.6, css(C[0], 0)); g.addColorStop(1, css(C[0], -0.4));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fill();
      }
    },
    waffle: (ctx, W, H, C) => {
      const s = 20, gp = 4;
      for (let j = -1; j * s < H + s; j++) for (let i = -1; i * s < W + s; i++) {
        const x0 = i * s + gp / 2, y0 = j * s + gp / 2, z = s - gp;
        const g = ctx.createLinearGradient(x0, y0, x0 + z, y0 + z); g.addColorStop(0, css(C[0], 0.16)); g.addColorStop(1, css(C[0], -0.3));
        ctx.fillStyle = g; rr(ctx, x0, y0, z, z, 3); ctx.fill();
        ctx.strokeStyle = css(C[0], -0.36); ctx.lineWidth = 1;
        for (const f of [0.34, 0.66]) { ctx.beginPath(); ctx.moveTo(x0 + z * f, y0 + 2); ctx.lineTo(x0 + z * f, y0 + z - 2); ctx.stroke(); }
      }
    },
    c2c: (ctx, W, H, C) => {
      const s = 10;
      for (let j = -1; j * s < H + s; j++) for (let i = -1; i * s < W + s; i++) {
        const on = HEART[md(j, 8)][md(i, 9)] === "1", col = on ? (C[1] || mix(C[0], 0.5)) : C[0];
        ctx.save(); ctx.translate(i * s + s / 2, j * s + s / 2); ctx.rotate(-Math.PI / 4);
        for (const q of [-3.2, 0, 3.2]) dcSt(ctx, q - 1.7, -6, 3.4, 11, col);
        ctx.restore();
      }
    },
    stripe: (ctx, W, H, C) => { const s = stripeSeq(C.length); cgrid(W, H, CH, (i, j, px, py) => scSt(ctx, px, py, CW, CH, C[s[md(j, s.length)]])); },
    flower: (ctx, W, H, C) => {
      const a = C[0], b = C[1] || mix(a, -0.35);
      const spots = [[.22, .32, 25], [.7, .4, 29], [.42, .86, 23], [.96, .9, 21], [-.02, .92, 19], [1.02, .02, 18]];
      for (const [fx, fy, r] of spots) {
        const cx = fx * W, cy = fy * H;
        for (let q = 0; q < 5; q++) {
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(q * Math.PI * 2 / 5);
          const g = ctx.createLinearGradient(0, 0, 0, -r); g.addColorStop(0, css(a, -0.22)); g.addColorStop(1, css(a, 0.12));
          ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, -r * 0.55, r * 0.34, r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = css(a, -0.3); ctx.lineWidth = 0.8;
          for (const t of [-0.15, 0, 0.15]) { ctx.beginPath(); ctx.moveTo(0, -r * 0.2); ctx.lineTo(t * r, -r * 0.95); ctx.stroke(); }
          ctx.restore();
        }
        ctx.fillStyle = css(b, 0.05); ctx.beginPath(); ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2); ctx.fill();
      }
    },
    cat: (ctx, W, H, C) => {
      // 원본 도안의 기호 방향(도): 위 3, 아래 2, 왼쪽 3, 오른쪽 3
      const ANG = [-119, -90, -57, -15, 0, 22, 58, 122, 158, 179, -164];
      const a = C[0], b = C[1] || mix(a, -0.3), T = 84;
      const ox = (W - T * Math.ceil(W / T)) / 2, oy = (H - T * Math.ceil(H / T)) / 2;
      for (let i = -1; ox + i * T < W; i++) for (let j = -1; oy + j * T < H; j++) {
        const cx = ox + i * T + T / 2, cy = oy + j * T + T / 2 + 5;
        ctx.save(); ctx.translate(cx, cy);
        const head = new Path2D();
        head.moveTo(-31, -4); head.bezierCurveTo(-33, -16, -30, -26, -24, -29); head.lineTo(-10, -20); head.lineTo(10, -20); head.lineTo(24, -29);
        head.bezierCurveTo(30, -26, 33, -16, 31, -4); head.bezierCurveTo(33, 12, 18, 25, 0, 25); head.bezierCurveTo(-18, 25, -33, 12, -31, -4); head.closePath();
        const g = ctx.createRadialGradient(-6, -8, 4, 0, 0, 36); g.addColorStop(0, css(a, 0.15)); g.addColorStop(1, css(a, -0.25));
        ctx.fillStyle = g; ctx.fill(head);
        ctx.strokeStyle = css(a, -0.45); ctx.lineWidth = 1; ctx.stroke(head);
        ctx.strokeStyle = css(b, -0.2); ctx.lineWidth = 1.1;
        for (const d of ANG) { const r = d * Math.PI / 180; ctx.beginPath(); ctx.moveTo(Math.cos(r) * 4, Math.sin(r) * 3); ctx.lineTo(Math.cos(r) * 26, Math.sin(r) * 19); ctx.stroke(); }
        ctx.strokeStyle = css(a, -0.5); ctx.lineWidth = 1;
        for (const s of [-1, 1]) for (const k of [0, 1]) { ctx.beginPath(); ctx.ellipse(s * (22 + k * 4), -16 - k * 3, 2.2, 4.4, s * 0.4, 0, Math.PI * 2); ctx.stroke(); }
        ctx.restore();
      }
    },
    pt_cardwallet: (ctx, W, H, C) => cgrid(W, H, CH, (i, j, px, py) => scSt(ctx, px, py, CW, CH, C[0])),
    pt_calico: (ctx, W, H, C) => {
      const col = [C[0], C[1] || mix(C[0], 0.75)];
      const k = Math.min(W / (20 * CW), H / (14 * CH)), ox = (W - 20 * CW * k) / 2, oy = (H - 14 * CH * k) / 2;
      ctx.fillStyle = css(col[0], -0.15); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k);
      CALICO.forEach((row, j) => { for (let i = 0; i < 20; i++) scSt(ctx, i * CW, j * CH, CW, CH, col[+row[i]]); });
      ctx.fillStyle = "#1d1a24";   // 인형 눈 자리
      for (const ex of [9, 14]) { ctx.beginPath(); ctx.arc(ex * CW + CW / 2, 7 * CH + CH / 2, CW * 0.38, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    },
    blackcat: (ctx, W, H, C) => {
      const col = [C[0], C[1] || mix(C[0], -0.7), C[2] || mix(C[0], -0.35)];
      const k = Math.min(W / (20 * CW), H / (18 * CH)), ox = (W - 20 * CW * k) / 2, oy = (H - 18 * CH * k) / 2;
      ctx.fillStyle = css(col[0], -0.1); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(ox, oy); ctx.scale(k, k);
      BLACKCAT.forEach((row, j) => { for (let i = 0; i < 20; i++) scSt(ctx, i * CW, j * CH, CW, CH, col[+row[i]]); });
      ctx.restore();
    },
    amigu: (ctx, W, H, C) => {
      const c = C[0], cx = W / 2, cy = H * 0.56, r = Math.min(W, H) * 0.4;
      ctx.save(); ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.12, r, 0, 0, Math.PI * 2); ctx.clip();
      cgrid(W, H, CH, (i, j, px, py) => scSt(ctx, px, py, CW, CH, c));
      const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r * 1.15);
      g.addColorStop(0, "rgba(255,255,255,.2)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.45)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
      for (const s of [-1, 1]) {
        ctx.fillStyle = "#1D1A24"; ctx.beginPath(); ctx.arc(cx + s * r * 0.32, cy - r * 0.05, Math.max(1.5, r * 0.08), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#FFFFFF"; ctx.beginPath(); ctx.arc(cx + s * r * 0.32 - r * 0.025, cy - r * 0.08, Math.max(0.6, r * 0.025), 0, Math.PI * 2); ctx.fill();
      }
    },
    lace: (ctx, W, H, C) => {
      const c = C[0], ox = W / 2, oy = H + 8, max = Math.hypot(W, H) + 20;
      for (let R = 18; R < max; R += 20) {
        const n = Math.max(6, Math.round(R / 6));
        for (let q = 0; q <= n; q++) { const ang = Math.PI + q * Math.PI / n; chain(ctx, ox + Math.cos(ang) * R, oy + Math.sin(ang) * R, 3, ang + Math.PI / 2, c); }
        const np = Math.max(4, Math.round(R / 14));
        for (let q = 0; q < np; q++) {
          const ang = Math.PI + (q + 0.5) * Math.PI / np;
          ctx.save(); ctx.translate(ox + Math.cos(ang) * (R + 1), oy + Math.sin(ang) * (R + 1)); ctx.rotate(ang + Math.PI / 2);
          dcSt(ctx, -1.8, -17, 3.6, 17, c); ctx.restore();
        }
      }
    }
  }
};

function rng(seed) { return () => { seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function fuzz(ctx, W, H, c) {   // 보송한 실: 잔털 없이 살짝 부드러운 기운만
  ctx.save(); ctx.globalAlpha = 0.1; ctx.fillStyle = css(c, 0.35); ctx.fillRect(0, 0, W, H); ctx.restore();
}

function paintSwatch(cv, pid, C, fluffy, craft) {
  const fn = DRAW[craft || state.craft][pid]; if (!fn) return;
  const rect = cv.getBoundingClientRect(); if (!rect.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(rect.width * dpr); cv.height = Math.round(rect.height * dpr);
  const ctx = cv.getContext("2d");
  const k = cv.dataset.zoom ? +cv.dataset.zoom : (rect.width < 60 ? 0.6 : 1);
  ctx.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
  const W = rect.width / k, H = rect.height / k;
  ctx.fillStyle = css(C[0], -0.58); ctx.fillRect(0, 0, W, H);
  try { fn(ctx, W, H, C); } catch (e) {}
  if (fluffy) fuzz(ctx, W, H, C[0]);
}
