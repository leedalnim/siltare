// ---------- 진행 그림 ----------
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim() || "#888888";
// 단수 세기 맨 위 '뜨는 모습': 무늬 확대 / 기호 도안 / 전체 편물(또는 단계)
const ctrUI = { view: null };
function ctrViews(s, rx) {
  const kind = rx.once ? "once" : (rx.tail || !s.w) ? "tail" : "meas";
  if (s.pid === "cat") return { kind, list: [["chart", "도안"], ["steps", "단계"]] };
  return { kind, list: [["pat", "무늬 확대"], ["chart", "기호 도안"], kind === "meas" ? ["all", "전체 편물"] : ["steps", "단계"]] };
}
function ctrChartBody(s, rx, info) {
  const done = info.done, hi = done ? -1 : info.hi;
  if (s.pid === "cat") return `<div class="cchart"><div class="cchart-card"><img class="cat-mini" src="${CAT.redraw}" alt="고양이 얼굴 도안 (다시 그린 도안)"></div><p class="cc-cap">단계 목록은 '단계' 보기에서, 기호 뜻은 무늬 상세의 도안에서 볼 수 있어요.</p></div>`;
  if (rx.chart) return `<div class="kchart"><div class="chart-scroll">${chartHTML(rx.chart, chartHexes(s.cols), hi, labelsFor(s.cols))}</div><p class="cc-cap">${hi >= 0 ? `지금은 ${hi + 1}번 줄이에요. 초록 ✓ = 다 뜬 줄, 보라 = 지금 줄, 흐림 = 아직이에요.` : "겉면에서 본 모양, 아래에서 위로 읽어요."}</p></div>`;
  if (s.craft === "crochet") { const h = crochetChartHTML(s.pid, s.cols, done ? -1 : s.row); if (h) return h; }
  return `<div class="empty-chart">이 무늬는 기호 도안이 없어요. 아래 '도안 전체 보기'를 따라 떠 주세요.</div>`;
}
function progressHTML(s, rx, info) {
  if (!s.target) return `<div class="prog prog-empty"><p>콧수와 목표 단수를 정하면 지금까지 뜬 편물이 그림으로 보여요.</p><button type="button" class="ghost-btn" data-su-edit="${s.id}">어떻게 뜰지 정하기</button></div>`;
  const pct = Math.min(100, Math.round(s.row / s.target * 100));
  const meta = `<div class="prog-meta"><span>${s.n ? `${s.n}코 · ` : ""}${s.mode === "round" ? "원통" : "왕복"} · 목표 ${s.target}단</span><button type="button" class="link" data-su-edit="${s.id}">뜨는 방법 바꾸기</button></div>`;
  const bar = `<div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="${s.target}" aria-valuenow="${Math.min(s.row, s.target)}" aria-label="진행률"><i style="width:${pct}%"></i></div>`;
  const { kind, list } = ctrViews(s, rx);
  const defView = s.pid === "cat" || s.pid === "filetcat" ? "chart" : "pat";
  const view = list.some(v => v[0] === ctrUI.view) ? ctrUI.view : defView;
  const seg = `<div class="seg cv-seg" role="group" aria-label="보기 방식">${list.map(([k, n]) => `<button type="button" data-cv="${k}" aria-pressed="${view === k}">${n}</button>`).join("")}</div>`;
  const total = kind === "once" ? (rx.setup || []).length + rx.rows.length : s.target;
  let body = "", stats = `<div class="prog-stats"><b>${Math.min(s.row, total)} / ${total}단</b><span>${pct}%</span></div>`;
  if (view === "pat") body = `<canvas class="prog-cv pw" data-pw="${s.id}" style="height:280px" role="img" aria-label="무늬 확대: ${s.row}단까지 떴어요"></canvas><p class="cc-cap">초록 = 다 뜬 단, 밝은 줄 = 지금 단, 흐림 = 아직이에요. +1을 누르면 지금 단이 한 줄 올라가요.</p>`;
  else if (view === "chart") body = ctrChartBody(s, rx, info);
  else if (view === "all") {
    const cm = Math.round(s.row / s.target * s.l), left = Math.max(0, Math.round(s.l - cm));
    body = `<canvas class="prog-cv" data-prog="${s.id}" style="height:220px" role="img" aria-label="편물 진행 그림: ${s.target}단 중 ${s.row}단, 약 ${cm}cm"></canvas>`;
    stats = `<div class="prog-stats"><b>${Math.min(s.row, s.target)} / ${s.target}단</b><span>${pct}%</span><span>약 ${cm}cm 떴어요 · ${left ? `남은 길이 약 ${left}cm` : "목표 길이 완성!"}</span></div>`;
  } else if (kind === "once") {
    const all = [...(rx.setup || []), ...rx.rows];
    body = `<ol class="rowlist" aria-label="단 진행 상황">${all.map((r, i) => `<li class="${i < s.row ? "done" : i === s.row ? "now" : "todo"}"><span class="sn">${i < s.row ? "✓" : i + 1}</span><span class="st-t">${esc(r.t)}</span></li>`).join("")}</ol>`;
  } else body = `<div class="steps" aria-label="단 진행 상황">${Array.from({ length: Math.min(s.target, 60) }, (_, i) => `<span class="${i < s.row ? "done" : i === s.row ? "now" : "todo"}">${i + 1}</span>`).join("")}</div>`;
  return `<div class="prog">${meta}${seg}${body}${stats}${bar}</div>`;
}
// 무늬를 크게 확대한 창: 지금 단까지는 선명하게, 그 위(남은 단)는 흐리게
function drawPatWindow(cv, s) {
  const fn = DRAW[s.craft] && DRAW[s.craft][s.pid]; if (!fn) return;
  const rect = cv.getBoundingClientRect(); if (!rect.width) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(rect.width * dpr); cv.height = Math.round(rect.height * dpr);
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = rect.width, H = rect.height, padX = 40, padY = 12;
  const accent = cssVar("--accent"), muted = cssVar("--muted"), bg = cssVar("--bg");
  const C = (s.cols.length ? s.cols : [{ hex: FALLBACK[0] }]).map(c => liftDark(c.hex || FALLBACK[0]));
  const base = s.craft === "knit" ? ROWPX.knit : (ROWPX.crochet[s.pid] || 10), zoom = 1.8, rowH = base * zoom;
  const N = Math.max(4, Math.floor((H - padY * 2) / rowH)), winH = N * rowH, fw = W - padX - 12, x0 = padX, y0 = Math.round((H - winH) / 2);
  const finished = s.row >= s.target, rx = recipe(s.craft, s.pid, s.cols, s.mode);
  const once = !!rx.once, tot = (rx.setup || []).length + rx.rows.length;
  const done = finished ? N : once ? Math.round(N * Math.min(1, s.row / Math.max(1, tot))) : s.row % N;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = cssVar("--surface-2"); ctx.fillRect(x0, y0, fw, winH);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, fw, winH); ctx.clip(); ctx.translate(x0, y0); ctx.scale(zoom, zoom);
  ctx.fillStyle = css(C[0], -0.5); ctx.fillRect(0, 0, fw / zoom + 2, winH / zoom + 2);
  try { fn(ctx, fw / zoom, winH / zoom + base, C); } catch (e) {}
  ctx.restore();
  const yl = y0 + winH - done * rowH;
  if (yl > y0 + 0.5) { ctx.globalAlpha = .74; ctx.fillStyle = bg; ctx.fillRect(x0, y0, fw, yl - y0); ctx.globalAlpha = 1; }
  if (done > 0) {   // 다 뜬 부분: 초록 기운 + 왼쪽 완료 막대
    const dh = Math.min(winH, done * rowH);
    ctx.fillStyle = "rgba(108, 203, 156, .18)"; ctx.fillRect(x0, y0 + winH - dh, fw, dh);
    ctx.fillStyle = cssVar("--ok"); ctx.fillRect(x0 - 6, y0 + winH - dh, 4, dh);
  }
  ctx.strokeStyle = muted; ctx.lineWidth = 1; ctx.setLineDash([4, 3]); ctx.strokeRect(x0 + .5, y0 + .5, fw - 1, winH - 1); ctx.setLineDash([]);
  if (!finished) {
    ctx.shadowColor = accent; ctx.shadowBlur = 8; ctx.strokeStyle = accent; ctx.lineWidth = 3; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x0 - 8, yl); ctx.lineTo(x0 + fw + 4, yl); ctx.stroke(); ctx.shadowBlur = 0;
    ctx.font = "600 11px 'IBM Plex Sans KR', system-ui, sans-serif"; ctx.textBaseline = "middle";
    const tag = `지금 ${s.row + 1}단`, tw = ctx.measureText(tag).width + 14, ty = Math.min(Math.max(yl - 15, y0 + 12), y0 + winH - 12);
    ctx.fillStyle = accent; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0 + fw - tw - 6, ty - 10, tw, 20, 10) : ctx.rect(x0 + fw - tw - 6, ty - 10, tw, 20); ctx.fill();
    ctx.fillStyle = cssVar("--accent-ink"); ctx.textAlign = "left"; ctx.fillText(tag, x0 + fw - tw + 1, ty + 1);
  }
  // 이 화면이 보여 주는 단 범위
  const start = once ? 1 : s.row - done + 1;
  ctx.font = "600 10.5px 'IBM Plex Sans KR', system-ui, sans-serif"; ctx.fillStyle = muted; ctx.textAlign = "right"; ctx.textBaseline = "middle";
  if (!once) { ctx.fillText(`${start}단`, x0 - 8, y0 + winH - 6); ctx.fillText(`${start + N - 1}단`, x0 - 8, y0 + 6); }
}
function drawProgress(cv, s) {
  let rect = cv.getBoundingClientRect(); if (!rect.width) return;
  cv.style.height = Math.round(Math.min(360, Math.max(170, (rect.width - 62) * s.l / s.w + 54))) + "px";
  rect = cv.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(rect.width * dpr); cv.height = Math.round(rect.height * dpr);
  const ctx = cv.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = rect.width, H = rect.height, padT = 16, padB = 30;
  ctx.clearRect(0, 0, W, H);
  ctx.font = "600 11px 'IBM Plex Sans KR', system-ui, sans-serif";
  const tag = s.row >= s.target ? "목표 완료" : `지금 ${s.row + 1}단`, tw = ctx.measureText(tag).width + 14;
  const left = 44, right = 14;
  const aspect = s.l / s.w, maxH = H - padT - padB, maxW = W - left - right;
  let fw = maxW, fh = fw * aspect; if (fh > maxH) { fh = maxH; fw = fh / aspect; }
  fw = Math.max(fw, 30); fh = Math.max(fh, 30);
  const x0 = Math.round(left + (maxW - fw) / 2), y0 = Math.round(padT + (maxH - fh) / 2), yB = y0 + fh;
  const C = (s.cols.length ? s.cols : [{ hex: FALLBACK[0] }]).map(c => liftDark(c.hex || FALLBACK[0]));
  const muted = cssVar("--muted"), accent = cssVar("--accent"), ink = cssVar("--ink");
  // what is still to knit: a dashed outline of the finished size
  ctx.fillStyle = cssVar("--surface-2"); ctx.fillRect(x0, y0, fw, fh);
  ctx.setLineDash([5, 4]); ctx.strokeStyle = muted; ctx.lineWidth = 1.2; ctx.strokeRect(x0 + .5, y0 + .5, fw - 1, fh - 1); ctx.setLineDash([]);
  // 도안 전체를 그리고, 아직 안 뜬 윗부분은 흐리게 덮어요 (아래가 1단)
  const frac = Math.min(1, s.row / s.target), dh = fh * frac;
  const rowPx = fh / s.target, base = s.craft === "knit" ? ROWPX.knit : (ROWPX.crochet[s.pid] || 10);
  const k = Math.max(0.28, Math.min(2.4, rowPx / base));
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, fw, fh); ctx.clip();
  ctx.translate(x0, y0); ctx.scale(k, k);
  ctx.fillStyle = css(C[0], -0.5); ctx.fillRect(0, 0, fw / k + 2, fh / k + 2);
  try { DRAW[s.craft][s.pid](ctx, fw / k, fh / k + base, C); } catch (e) {}
  ctx.restore();
  const g = ctx.createLinearGradient(x0, 0, x0 + fw, 0);
  g.addColorStop(0, "rgba(0,0,0,.18)"); g.addColorStop(.5, "rgba(255,255,255,.04)"); g.addColorStop(1, "rgba(0,0,0,.2)");
  ctx.fillStyle = g; ctx.fillRect(x0, y0, fw, fh);
  if (dh < fh - 0.5) { ctx.globalAlpha = .7; ctx.fillStyle = cssVar("--bg"); ctx.fillRect(x0, y0, fw, fh - dh); ctx.globalAlpha = 1; }
  ctx.setLineDash([5, 4]); ctx.strokeStyle = muted; ctx.lineWidth = 1.2; ctx.strokeRect(x0 + .5, y0 + .5, fw - 1, fh - 1); ctx.setLineDash([]);
  // 10단마다 눈금
  ctx.strokeStyle = muted; ctx.lineWidth = 1;
  for (let r = 10; r < s.target; r += 10) { const y = Math.round(yB - fh * r / s.target) + .5; ctx.beginPath(); ctx.moveTo(x0 - 6, y); ctx.lineTo(x0, y); ctx.stroke(); }
  // needle (knit) or hook (crochet) on the working row
  const yc = yB - dh;
  ctx.shadowColor = accent; ctx.shadowBlur = 8;
  ctx.lineCap = "round"; ctx.strokeStyle = accent; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x0 - 16, yc); ctx.lineTo(x0 + fw + 16, yc); ctx.stroke();
  ctx.shadowBlur = 0; ctx.fillStyle = accent;
  if (s.craft === "knit") { ctx.beginPath(); ctx.arc(x0 - 18, yc, 5, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x0 + fw + 16, yc - 4, 4, Math.PI * 0.5, Math.PI * 1.6, true); ctx.stroke(); }
  // labels
  ctx.font = "600 11px 'IBM Plex Sans KR', system-ui, sans-serif"; ctx.textBaseline = "middle";
  ctx.fillStyle = muted; ctx.textAlign = "right";
  ctx.fillText("1단", x0 - 10, yB - 6);
  ctx.fillText(`${s.target}단`, x0 - 10, y0 + 6);
  ctx.textAlign = "left"; ctx.fillStyle = ink;
  const tx = x0 + fw - tw - 6, ty = Math.min(Math.max(yc - 16, y0 + 12), yB - 12);
  ctx.fillStyle = accent; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(tx, ty - 10, tw, 20, 10) : ctx.rect(tx, ty - 10, tw, 20); ctx.fill();
  ctx.fillStyle = cssVar("--accent-ink"); ctx.fillText(tag, tx + 7, ty + 1);
  ctx.fillStyle = muted; ctx.textAlign = "center";
  ctx.fillText(`${s.n ? s.n + "코 · " : ""}${s.mode === "round" ? "둘레" : "폭"} 약 ${Math.round(s.w)}cm`, x0 + fw / 2, yB + 16);
}
