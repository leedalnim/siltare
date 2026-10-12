// ---------- Finished-piece preview ----------
function shadeBox(ctx, w, h, type) {
  let g;
  if (type === "cyl") { g = ctx.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(0,0,0,.32)"); g.addColorStop(.35, "rgba(255,255,255,.08)"); g.addColorStop(.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.34)"); }
  else if (type === "dome") { g = ctx.createRadialGradient(w * .38, h * .3, w * .05, w * .5, h * .55, w * .78); g.addColorStop(0, "rgba(255,255,255,.14)"); g.addColorStop(.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.4)"); }
  else { g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, "rgba(255,255,255,.1)"); g.addColorStop(1, "rgba(0,0,0,.22)"); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}
const rrp = (p, x, y, w, h, r) => { p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); };

function drawProduct(ctx, W, H, proj, pid, C, fluffy) {
  const craft = state.craft;
  const s = Math.min(W * 0.62, H * 0.86), cx = W / 2, cy = H / 2;
  const k = Math.max(0.42, Math.min(1, s / 300));
  const fillId = (pid === "amigu" || pid === "flower") ? "sc" : pid;
  const paint = (c, w, h, fn, cols) => {
    c.save(); c.scale(k, k); const ww = w / k, hh = h / k;
    c.fillStyle = css(cols[0], -0.5); c.fillRect(0, 0, ww, hh);
    try { fn(c, ww, hh, cols); } catch (e) {}
    if (fluffy) fuzz(c, ww, hh, cols[0]);
    c.restore();
  };
  const tex = (c, w, h) => paint(c, w, h, DRAW[craft][fillId], C);
  const band = (c, w, h) => paint(c, w, h, craft === "knit" ? DRAW.knit.rib : DRAW.crochet.sc, [C[0]]);
  const shadow = (y, rx) => { ctx.fillStyle = "rgba(0,0,0,.13)"; ctx.beginPath(); ctx.ellipse(cx, cy + y * s, rx * s, s * 0.045, 0, 0, Math.PI * 2); ctx.fill(); };
  function part(o) {
    const w = o.w * s, h = o.h * s;
    ctx.save(); ctx.translate(cx + o.x * s, cy + o.y * s); if (o.rot) ctx.rotate(o.rot); if (o.flip) ctx.scale(-1, 1); ctx.translate(-w / 2, -h / 2);
    const p = new Path2D(); o.path(p, w, h);
    ctx.save(); ctx.clip(p, o.rule || "nonzero");
    (o.fill === "band" ? band : tex)(ctx, w, h);
    (o.bands || []).forEach(([a, b]) => { ctx.save(); ctx.beginPath(); ctx.rect(0, a * h, w, (b - a) * h); ctx.clip(); band(ctx, w, h); ctx.fillStyle = "rgba(0,0,0,.08)"; ctx.fillRect(0, a * h, w, 1.2); ctx.restore(); });
    shadeBox(ctx, w, h, o.shade || "flat");
    ctx.restore();
    ctx.strokeStyle = "rgba(0,0,0,.22)"; ctx.lineWidth = 1; ctx.stroke(p);
    if (o.after) o.after(ctx, w, h);
    ctx.restore();
  }
  const pom = (x, y, r) => {
    const px = cx + x * s, py = cy + y * s, R = r * s, col = C[1] || C[0];
    const g = ctx.createRadialGradient(px - R * .3, py - R * .35, R * .1, px, py, R);
    g.addColorStop(0, css(col, .25)); g.addColorStop(1, css(col, -.35));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2); ctx.fill();
    const rand = rng(3); ctx.strokeStyle = css(col, .12); ctx.lineWidth = Math.max(.6, R * .05);
    for (let i = 0; i < Math.round(R * 3); i++) { const a = rand() * Math.PI * 2, d = R * (.75 + rand() * .35); ctx.beginPath(); ctx.moveTo(px + Math.cos(a) * d * .7, py + Math.sin(a) * d * .7); ctx.lineTo(px + Math.cos(a) * d * 1.08, py + Math.sin(a) * d * 1.08); ctx.stroke(); }
  };
  const fringe = (c, x0, x1, y, len, n) => { c.strokeStyle = css(C[0], -0.05); c.lineWidth = Math.max(1, s * 0.008); for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (i % 2 ? 1 : -1) * len * 0.08, y + len); c.stroke(); } };
  const hat = (sc, withPom) => {
    shadow(0.38 * sc, 0.42 * sc);
    part({ x: 0, y: -0.06 * sc, w: 0.74 * sc, h: 0.5 * sc, shade: "dome", path: (p, w, h) => { p.moveTo(0, h); p.lineTo(0, h * .5); p.bezierCurveTo(0, -h * .15, w, -h * .15, w, h * .5); p.lineTo(w, h); p.closePath(); } });
    part({ x: 0, y: 0.25 * sc, w: 0.8 * sc, h: 0.2 * sc, fill: "band", shade: "cyl", path: (p, w, h) => rrp(p, 0, 0, w, h, h * .25) });
    if (withPom) pom(0, -0.33 * sc, 0.12 * sc);
  };
  const bear = (sc, y0) => {
    part({ x: 0, y: y0, w: 0.62 * sc, h: 0.62 * sc, shade: "dome", path: (p, w, h) => { p.arc(w * .18, h * .2, w * .15, 0, Math.PI * 2); p.moveTo(w * .97, h * .2); p.arc(w * .82, h * .2, w * .15, 0, Math.PI * 2); p.moveTo(w * .92, h * .58); p.arc(w / 2, h * .58, w * .42, 0, Math.PI * 2); },
      after: (c, w, h) => {
        for (const sd of [-1, 1]) {
          c.fillStyle = "#1D1A24"; c.beginPath(); c.arc(w / 2 + sd * w * .15, h * .55, Math.max(1.4, w * .035), 0, Math.PI * 2); c.fill();
        }
        c.fillStyle = css(C[1] || mix(C[0], 0.45)); c.beginPath(); c.ellipse(w / 2, h * .7, w * .11, w * .08, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = "#1D1A24"; c.beginPath(); c.ellipse(w / 2, h * .67, w * .03, w * .02, 0, 0, Math.PI * 2); c.fill();
      } });
  };
  const P = {
    beanie: () => hat(1, true),
    babyhat: () => hat(0.82, true),
    bucket: () => {
      shadow(.3, .45);
      part({ x: 0, y: -.1, w: .56, h: .36, shade: "dome", path: (p, w, h) => { p.moveTo(0, h); p.lineTo(w * .04, h * .3); p.quadraticCurveTo(w * .08, 0, w * .3, 0); p.lineTo(w * .7, 0); p.quadraticCurveTo(w * .92, 0, w * .96, h * .3); p.lineTo(w, h); p.closePath(); } });
      part({ x: 0, y: .16, w: .92, h: .2, shade: "cyl", path: (p, w, h) => { p.moveTo(w * .2, 0); p.lineTo(w * .8, 0); p.quadraticCurveTo(w * .95, h * .5, w, h * .8); p.quadraticCurveTo(w * .5, h * 1.15, 0, h * .8); p.quadraticCurveTo(w * .05, h * .5, w * .2, 0); p.closePath(); } });
    },
    cowl: () => {
      shadow(.3, .4);
      part({ x: 0, y: 0, w: .72, h: .54, shade: "cyl",
        path: (p, w, h) => { const e = h * .17; p.moveTo(0, e); p.lineTo(0, h - e); p.ellipse(w / 2, h - e, w / 2, e, 0, Math.PI, 0, true); p.lineTo(w, e); p.ellipse(w / 2, e, w / 2, e, 0, 0, Math.PI, true); p.closePath(); },
        after: (c, w, h) => { const e = h * .17; c.fillStyle = css(C[0], -.55); c.beginPath(); c.ellipse(w / 2, e, w / 2 * .88, e * .7, 0, 0, Math.PI * 2); c.fill(); } });
    },
    headband: () => {
      shadow(.24, .38);
      part({ x: 0, y: .02, w: .8, h: .4, shade: "flat", path: (p, w, h) => { const R = w / 2, t = w * .22; p.moveTo(0, h); p.arc(w / 2, h, R, Math.PI, 0, false); p.lineTo(w - t, h); p.arc(w / 2, h, R - t, 0, Math.PI, true); p.closePath(); } });
      part({ x: 0, y: -.16, w: .12, h: .16, fill: "band", shade: "cyl", path: (p, w, h) => rrp(p, 0, 0, w, h, w * .3) });
    },
    wrist: () => {
      shadow(.34, .42);
      for (const [x, r] of [[-.17, -.08], [.17, .08]]) part({ x, y: 0, w: .26, h: .62, rot: r, shade: "cyl", bands: [[0, .13], [.85, 1]], path: (p, w, h) => rrp(p, 0, 0, w, h, w * .18),
        after: (c, w, h) => { c.fillStyle = css(C[0], -.6); c.beginPath(); c.ellipse(w * .2, h * .4, w * .07, h * .07, 0, 0, Math.PI * 2); c.fill(); } });
    },
    mitten: () => {
      shadow(.38, .45);
      for (const [x, fl] of [[-.2, false], [.2, true]]) part({ x, y: 0, w: .36, h: .7, flip: fl, shade: "dome", bands: [[.76, 1]],
        path: (p, w, h) => { p.moveTo(w * .28, h); p.lineTo(w * .28, h * .3); p.bezierCurveTo(w * .28, -h * .05, w * .98, -h * .05, w * .98, h * .3); p.lineTo(w * .98, h); p.closePath(); p.moveTo(w * .3, h * .62); p.bezierCurveTo(w * .02, h * .6, 0, h * .38, w * .14, h * .32); p.bezierCurveTo(w * .22, h * .3, w * .3, h * .36, w * .3, h * .42); p.closePath(); } });
    },
    socks: () => {
      shadow(.4, .45);
      for (const [x, y, r] of [[-.13, -.03, -.06], [.13, .03, .06]]) part({ x, y, w: .42, h: .74, rot: r, shade: "cyl", bands: [[0, .15]],
        path: (p, w, h) => { p.moveTo(w * .12, 0); p.lineTo(w * .6, 0); p.lineTo(w * .6, h * .55); p.quadraticCurveTo(w * .62, h * .63, w * .74, h * .65); p.lineTo(w * .86, h * .67); p.quadraticCurveTo(w * 1.0, h * .71, w * .98, h * .85); p.quadraticCurveTo(w * .96, h * .98, w * .8, h * .98); p.lineTo(w * .3, h * .98); p.quadraticCurveTo(w * .08, h * .97, w * .11, h * .74); p.closePath(); } });
    },
    sweater: () => {
      shadow(.42, .5);
      part({ x: 0, y: 0, w: 1.0, h: .8, shade: "flat", bands: [[.9, 1]],
        path: (p, w, h) => { p.moveTo(w * .36, 0); p.quadraticCurveTo(w * .5, h * .12, w * .64, 0); p.lineTo(w * .82, h * .05); p.lineTo(w, h * .62); p.lineTo(w * .87, h * .67); p.lineTo(w * .76, h * .36); p.lineTo(w * .76, h); p.lineTo(w * .24, h); p.lineTo(w * .24, h * .36); p.lineTo(w * .13, h * .67); p.lineTo(0, h * .62); p.lineTo(w * .18, h * .05); p.closePath(); },
        after: (c, w, h) => {
          for (const poly of [[[w * .965, h * .55], [w, h * .62], [w * .87, h * .67], [w * .845, h * .6]], [[w * .035, h * .55], [0, h * .62], [w * .13, h * .67], [w * .155, h * .6]]]) {
            c.save(); c.beginPath(); poly.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); c.clip(); band(c, w, h); shadeBox(c, w, h, "flat"); c.restore();
          }
          c.strokeStyle = css(C[0], -0.12); c.lineWidth = h * .035; c.beginPath(); c.moveTo(w * .36, 0); c.quadraticCurveTo(w * .5, h * .12, w * .64, 0); c.stroke();
        } });
    },
    vest: () => {
      shadow(.42, .4);
      part({ x: 0, y: 0, w: .7, h: .82, shade: "flat", bands: [[.9, 1]],
        path: (p, w, h) => { p.moveTo(w * .3, 0); p.lineTo(w * .5, h * .38); p.lineTo(w * .7, 0); p.lineTo(w * .86, h * .04); p.quadraticCurveTo(w * .78, h * .26, w * .97, h * .4); p.lineTo(w * .97, h); p.lineTo(w * .03, h); p.lineTo(w * .03, h * .4); p.quadraticCurveTo(w * .22, h * .26, w * .14, h * .04); p.closePath(); },
        after: (c, w, h) => { c.strokeStyle = css(C[0], -0.12); c.lineWidth = h * .03; c.beginPath(); c.moveTo(w * .3, 0); c.lineTo(w * .5, h * .38); c.lineTo(w * .7, 0); c.stroke(); } });
    },
    shawl: () => {
      shadow(.36, .3);
      part({ x: 0, y: -.04, w: 1.05, h: .64, shade: "flat", path: (p, w, h) => { p.moveTo(0, 0); p.lineTo(w, 0); p.quadraticCurveTo(w * .72, h * .55, w * .5, h); p.quadraticCurveTo(w * .28, h * .55, 0, 0); p.closePath(); },
        after: (c, w, h) => { c.strokeStyle = css(C[0], -0.05); c.lineWidth = Math.max(1, s * .01); for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(w * .5, h); c.lineTo(w * .5 + (i - 2) * s * .012, h + s * .08); c.stroke(); } } });
    },
    scarf: () => {
      shadow(.4, .48);
      part({ x: 0, y: 0, w: .24, h: 1.2, rot: -1.15, shade: "flat", path: (p, w, h) => rrp(p, 0, 0, w, h, 2),
        after: (c, w, h) => { fringe(c, w * .05, w * .95, h, s * .09, 9); c.save(); c.translate(w, 0); c.scale(-1, -1); fringe(c, w * .05, w * .95, 0, s * .09, 9); c.restore(); } });
    },
    blanket: () => {
      shadow(.4, .5);
      part({ x: 0, y: 0, w: 1.0, h: .68, rot: -.05, shade: "flat", path: (p, w, h) => rrp(p, 0, 0, w, h, 4),
        after: (c, w, h) => {
          c.save(); const ring = new Path2D(); ring.rect(0, 0, w, h); ring.rect(w * .05, h * .07, w * .9, h * .86); c.clip(ring, "evenodd"); band(c, w, h); shadeBox(c, w, h, "flat"); c.restore();
          c.fillStyle = css(C[0], -0.35); c.beginPath(); c.moveTo(w, h * .72); c.lineTo(w, h); c.lineTo(w * .82, h); c.closePath(); c.fill();
        } });
    },
    catbag: () => {
      shadow(.3, .38);
      ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = css(C[0], -0.2); ctx.lineWidth = s * .035; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-.2 * s, -.17 * s); ctx.bezierCurveTo(-.22 * s, -.62 * s, .22 * s, -.62 * s, .2 * s, -.17 * s); ctx.stroke(); ctx.restore();
      part({ x: 0, y: .07, w: .54, h: .5, shade: "flat", path: (p, w, h) => rrp(p, 0, 0, w, h, w * .05) });
    },
    catround: () => {
      shadow(.3, .38);
      ctx.save(); ctx.translate(cx, cy); ctx.strokeStyle = css(C[0], -0.2); ctx.lineWidth = s * .035; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(-.22 * s, -.12 * s); ctx.bezierCurveTo(-.26 * s, -.62 * s, .26 * s, -.62 * s, .22 * s, -.12 * s); ctx.stroke(); ctx.restore();
      part({ x: 0, y: .07, w: .54, h: .54, shade: "dome", path: (p, w, h) => p.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2) });
    },
    catcoaster: () => { shadow(.32, .42); part({ x: 0, y: 0, w: .5, h: .5, shade: "flat", path: (p, w, h) => p.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2) }); },
    coaster: () => {
      shadow(.32, .42);
      const round = craft === "crochet";
      for (const [x, y, r] of [[-.13, -.06, -.12], [.15, .08, .1]]) part({ x, y, w: .46, h: .46, rot: r, shade: "flat", path: (p, w, h) => round ? p.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2) : rrp(p, 0, 0, w, h, w * .06) });
    },
    scrubby: () => {
      shadow(.32, .42);
      for (const [x, y] of [[-.14, -.04], [.15, .08]]) part({ x, y, w: .44, h: .44, shade: "dome", path: (p, w, h) => { for (let i = 0; i <= 72; i++) { const a = i / 72 * Math.PI * 2, r = w / 2 * (0.92 + 0.08 * Math.cos(a * 12)); const X = w / 2 + Math.cos(a) * r, Y = h / 2 + Math.sin(a) * r; i ? p.lineTo(X, Y) : p.moveTo(X, Y); } p.closePath(); } });
    },
    granny1: () => { shadow(.34, .4); part({ x: 0, y: 0, w: .62, h: .62, rot: .06, shade: "flat", path: (p, w, h) => rrp(p, 0, 0, w, h, 3) }); },
    scrunchie: () => {
      shadow(.3, .38);
      part({ x: 0, y: 0, w: .62, h: .62, rule: "evenodd", shade: "dome",
        path: (p, w, h) => { for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2, r = w / 2 * (0.9 + 0.08 * Math.sin(a * 14)); const X = w / 2 + Math.cos(a) * r, Y = h / 2 + Math.sin(a) * r; i ? p.lineTo(X, Y) : p.moveTo(X, Y); } p.closePath(); p.moveTo(w / 2 + w * .17, h / 2); p.arc(w / 2, h / 2, w * .17, 0, Math.PI * 2); } });
    },
    sleeve: () => {
      shadow(.36, .3);
      const tw = .46, bw = .34, ch = .7, top = -.35;
      ctx.save(); ctx.translate(cx, cy);
      const cup = new Path2D(); cup.moveTo(-tw / 2 * s, top * s); cup.lineTo(tw / 2 * s, top * s); cup.lineTo(bw / 2 * s, (top + ch) * s); cup.lineTo(-bw / 2 * s, (top + ch) * s); cup.closePath();
      const cg = ctx.createLinearGradient(-tw / 2 * s, 0, tw / 2 * s, 0); cg.addColorStop(0, "#CFC8BC"); cg.addColorStop(.4, "#F4F0E8"); cg.addColorStop(1, "#BDB5A8");
      ctx.fillStyle = cg; ctx.fill(cup);
      ctx.fillStyle = "#E7E1D6"; ctx.beginPath(); ctx.ellipse(0, top * s, tw / 2 * s * 1.04, s * .03, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      const y0 = -.06, y1 = .22, wAt = y => tw - (tw - bw) * ((y - top) / ch);
      const w0 = wAt(y0) + .02, w1 = wAt(y1) + .02;
      part({ x: 0, y: (y0 + y1) / 2, w: w0, h: y1 - y0, shade: "cyl", path: (p, w, h) => { const d = (w0 - w1) / 2 * s; p.moveTo(0, 0); p.lineTo(w, 0); p.lineTo(w - d, h); p.lineTo(d, h); p.closePath(); } });
    },
    pouch: () => {
      shadow(.3, .38);
      part({ x: 0, y: 0, w: .66, h: .48, shade: "flat", path: (p, w, h) => rrp(p, 0, 0, w, h, w * .07),
        after: (c, w, h) => {
          c.fillStyle = "#4A4554"; c.fillRect(w * .04, h * .06, w * .92, Math.max(2, h * .05));
          c.fillStyle = "#B9B4C2"; rr(c, w * .8, h * .02, w * .07, h * .2, 2); c.fill();
        } });
    },
    netbag: () => {
      shadow(.4, .38);
      ctx.save(); ctx.strokeStyle = css(C[0], -0.08); ctx.lineWidth = s * .035; ctx.lineCap = "round";
      for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(cx + sd * s * .1, cy - s * .2, s * .1, s * .2, 0, Math.PI, 0); ctx.stroke(); }
      ctx.restore();
      part({ x: 0, y: .1, w: .64, h: .56, shade: "flat", path: (p, w, h) => { p.moveTo(w * .05, 0); p.lineTo(w * .95, 0); p.quadraticCurveTo(w, h * .7, w * .82, h); p.lineTo(w * .18, h); p.quadraticCurveTo(0, h * .7, w * .05, 0); p.closePath(); }, bands: [[0, .1]] });
    },
    flower: () => {
      shadow(.3, .3);
      part({ x: 0, y: 0, w: .6, h: .6, shade: "dome", path: (p, w, h) => { for (let q = 0; q < 5; q++) { const a = q * Math.PI * 2 / 5 - Math.PI / 2, px = w / 2 + Math.cos(a) * w * .25, py = h / 2 + Math.sin(a) * h * .25; p.moveTo(px + w * .2, py); p.ellipse(px, py, w * .2, w * .2, 0, 0, Math.PI * 2); } } });
      const col = C[1] || mix(C[0], -0.4);
      const g = ctx.createRadialGradient(cx - s * .03, cy - s * .03, 1, cx, cy, s * .1); g.addColorStop(0, css(col, .2)); g.addColorStop(1, css(col, -.3));
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, s * .1, 0, Math.PI * 2); ctx.fill();
    },
    amigurumi: () => { shadow(.34, .3); bear(1, 0); },
    keyring: () => {
      shadow(.34, .22);
      ctx.strokeStyle = "#A9A4B4"; ctx.lineWidth = Math.max(1.5, s * .02);
      ctx.beginPath(); ctx.arc(cx, cy - s * .36, s * .09, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - s * .27); ctx.lineTo(cx, cy - s * .16); ctx.stroke();
      bear(.7, .08);
    }
  };
  (P[proj] || P.granny1)();
}

function paintProduct(cv, pid, proj, C, fluffy) {
  const rect = cv.getBoundingClientRect(); if (!rect.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(rect.width * dpr); cv.height = Math.round(rect.height * dpr);
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  try { drawProduct(ctx, rect.width, rect.height, proj, pid, C, fluffy); } catch (e) {}
}

function paintAll(root, g) {
  if (!g) return;
  root.querySelectorAll("canvas[data-sw]").forEach(cv => {
    const p = PATTERNS[state.craft].find(x => x.id === cv.dataset.sw); if (!p) return;
    const r = evalPattern(p, g);
    const C = colorsFor(r.ys || g.yarns, r.mainKey);
    const cols = r.multi ? C : [C[0]];
    if (cv.dataset.prod) paintProduct(cv, p.id, cv.dataset.prod, cols, !!r.fluffy);
    else paintSwatch(cv, p.id, cols, !!r.fluffy);
  });
}
