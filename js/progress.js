// ---------- 진행 그림 ----------
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888888";
function progressHTML(s, rx) {
  if (!s.target) return `<div class="prog prog-empty"><p>콧수와 목표 단수를 정하면 지금까지 뜬 편물이 그림으로 보여요.</p><button type="button" class="ghost-btn" data-su-edit="${s.id}">어떻게 뜰지 정하기</button></div>`;
  const pct = Math.min(100, Math.round(s.row / s.target * 100));
  const meta = `<div class="prog-meta"><span>${s.n ? `${s.n}코 · ` : ""}${s.mode === "round" ? "원통" : "왕복"} · 목표 ${s.target}단</span><button type="button" class="link" data-su-edit="${s.id}">뜨는 방법 바꾸기</button></div>`;
  const bar = `<div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="${s.target}" aria-valuenow="${Math.min(s.row, s.target)}" aria-label="진행률"><i style="width:${pct}%"></i></div>`;
  if (rx.once || rx.tail || !s.w) {
    const total = rx.once ? (rx.setup || []).length + rx.rows.length : s.target;
    const steps = Array.from({ length: Math.min(total, 60) }, (_, i) => `<span class="${i < s.row ? "done" : i === s.row ? "now" : ""}">${i + 1}</span>`).join("");
    return `<div class="prog">${meta}<div class="steps" aria-label="단 진행 상황">${steps}</div><div class="prog-stats"><b>${Math.min(s.row, total)} / ${total}단</b><span>${pct}%</span></div>${bar}</div>`;
  }
  const cm = Math.round(s.row / s.target * s.l), left = Math.max(0, Math.round(s.l - cm));
  return `<div class="prog">${meta}<canvas class="prog-cv" data-prog="${s.id}" style="height:${Math.round(Math.min(280, Math.max(150, 200 * s.l / s.w + 70)))}px" role="img" aria-label="편물 진행 그림: ${s.target}단 중 ${s.row}단, 약 ${cm}cm"></canvas>
    <div class="prog-stats"><b>${Math.min(s.row, s.target)} / ${s.target}단</b><span>${pct}%</span><span>약 ${cm}cm 떴어요 · ${left ? `남은 길이 약 ${left}cm` : "목표 길이 완성!"}</span></div>${bar}</div>`;
}
function drawProgress(cv, s) {
  const rect = cv.getBoundingClientRect(); if (!rect.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(rect.width * dpr); cv.height = Math.round(rect.height * dpr);
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = rect.width, H = rect.height, padT = 16, padB = 30;
  ctx.clearRect(0, 0, W, H);
  ctx.font = "600 11px 'IBM Plex Sans KR', system-ui, sans-serif";
  const tag = s.row >= s.target ? "목표 완료" : `지금 ${s.row + 1}단`, tw = ctx.measureText(tag).width + 14;
  const left = 58, right = tw + 34;
  const aspect = s.l / s.w, maxH = H - padT - padB, maxW = W - left - right;
  let fw = maxW, fh = fw * aspect; if (fh > maxH) { fh = maxH; fw = fh / aspect; }
  fw = Math.max(fw, 30); fh = Math.max(fh, 30);
  const x0 = Math.round(left + (maxW - fw) / 2), y0 = Math.round(padT + (maxH - fh) / 2), yB = y0 + fh;
  const C = (s.cols.length ? s.cols : [{ hex: FALLBACK[0] }]).map(c => liftDark(c.hex || FALLBACK[0]));
  const muted = cssVar("--muted"), accent = cssVar("--accent"), ink = cssVar("--ink");
  // what is still to knit: a dashed outline of the finished size
  ctx.fillStyle = cssVar("--surface-2"); ctx.fillRect(x0, y0, fw, fh);
  ctx.setLineDash([5, 4]); ctx.strokeStyle = muted; ctx.lineWidth = 1.2; ctx.strokeRect(x0 + .5, y0 + .5, fw - 1, fh - 1); ctx.setLineDash([]);
  // what is knitted: the pattern, grown from the cast-on edge
  const frac = Math.min(1, s.row / s.target), dh = fh * frac;
  if (dh > 0.5) {
    const rowPx = fh / s.target, base = s.craft === "knit" ? ROWPX.knit : (ROWPX.crochet[s.pid] || 10);
    const k = Math.max(0.28, Math.min(2.4, rowPx / base));
    ctx.save(); ctx.beginPath(); ctx.rect(x0, yB - dh, fw, dh); ctx.clip();
    ctx.translate(x0, yB - dh); ctx.scale(k, k);
    ctx.fillStyle = css(C[0], -0.5); ctx.fillRect(0, 0, fw / k + 2, dh / k + 2);
    try { DRAW[s.craft][s.pid](ctx, fw / k, dh / k + base, C); } catch (e) {}
    ctx.restore();
    const g = ctx.createLinearGradient(x0, 0, x0 + fw, 0);
    g.addColorStop(0, "rgba(0,0,0,.18)"); g.addColorStop(.5, "rgba(255,255,255,.04)"); g.addColorStop(1, "rgba(0,0,0,.2)");
    ctx.fillStyle = g; ctx.fillRect(x0, yB - dh, fw, dh);
  }
  // needle (knit) or hook (crochet) on the working row
  const yc = yB - dh;
  ctx.lineCap = "round"; ctx.strokeStyle = accent; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x0 - 16, yc); ctx.lineTo(x0 + fw + 16, yc); ctx.stroke();
  ctx.fillStyle = accent;
  if (s.craft === "knit") { ctx.beginPath(); ctx.arc(x0 - 18, yc, 5, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x0 + fw + 16, yc - 4, 4, Math.PI * 0.5, Math.PI * 1.6, true); ctx.stroke(); }
  // labels
  ctx.font = "600 11px 'IBM Plex Sans KR', system-ui, sans-serif"; ctx.textBaseline = "middle";
  ctx.fillStyle = muted; ctx.textAlign = "right";
  ctx.fillText("1단", x0 - 28, yB - 6);
  ctx.fillText(`${s.target}단`, x0 - 28, y0 + 6);
  ctx.textAlign = "left"; ctx.fillStyle = ink;
  const tx = Math.min(x0 + fw + 26, W - tw - 2), ty = Math.min(Math.max(yc, y0 + 10), yB - 4);
  ctx.fillStyle = accent; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(tx, ty - 10, tw, 20, 10) : ctx.rect(tx, ty - 10, tw, 20); ctx.fill();
  ctx.fillStyle = cssVar("--accent-ink"); ctx.fillText(tag, tx + 7, ty + 1);
  ctx.fillStyle = muted; ctx.textAlign = "center";
  ctx.fillText(`${s.n ? s.n + "코 · " : ""}${s.mode === "round" ? "둘레" : "폭"} 약 ${Math.round(s.w)}cm`, x0 + fw / 2, yB + 16);
}
