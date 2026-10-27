// ---------- 단수 세기 ----------
let confirmState = null;
const isConfirming = (kind, id) => confirmState && confirmState.kind === kind && confirmState.id === id && Date.now() < confirmState.until;
function confirmed(kind, id) {
  if (isConfirming(kind, id)) { confirmState = null; return true; }
  confirmState = { kind, id, until: Date.now() + 3000 };
  setTimeout(() => { if (confirmState && Date.now() >= confirmState.until) { confirmState = null; renderCounter(); } }, 3100);
  renderCounter();
  return false;
}
function paintSess(root) {
  root.querySelectorAll("canvas[data-ss]").forEach(cv => {
    const s = state.sessions.find(x => x.id === cv.dataset.ss); if (!s) return;
    const C = (s.cols.length ? s.cols : [{ hex: FALLBACK[0] }]).map(c => liftDark(c.hex || FALLBACK[0]));
    paintSwatch(cv, s.pid, C, false, s.craft);
  });
}
// 삼각형: 이번 단에 늘리는지(줄이는지), 다 뜨면 몇 코가 되는지
function triLine(s) {
  if (!triOk(s.tri) || !s.n) return "";
  const t = s.tri, r = triRow(t, s.n, s.row), nx = triRow(t, s.n, s.row + 1), word = t.dir === "inc" ? "늘림" : "줄임";
  const when = r.chg ? "" : nx.chg && s.row + 1 < s.target ? ` · 다음 단에서 ${word}` : "";
  return `<div class="tri-now${r.chg ? " chg" : ""}"><span class="tri-ic" aria-hidden="true">${t.dir === "inc" ? "◢◣" : "◥◤"}</span>
    <div>${r.chg ? `<b>${word} 단</b> · ${esc(triHow(t, s.craft))}<br><span>${r.from}코 → <b>${r.to}코</b>가 돼요</span>`
      : `<b>${word} 없이</b> 떠요<br><span><b>${r.from}코</b> 그대로${when}</span>`}</div></div>`;
}
// 카운터 상세에서는 맨 위 막대가 '목록으로 · 삭제' 막대로 바뀌어요
const BAR_ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  del: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'
};
function barDetail() {
  const s = state.tab === "counter" && state.sessions.find(x => x.id === state.sess), bd = $("bar-detail");
  document.querySelector(".topbar").classList.toggle("detail", !!s); bd.hidden = !s;
  if (!s) { bd.innerHTML = ""; return; }
  const delC = isConfirming("del", s.id);
  bd.innerHTML = `<button type="button" class="bar-btn" data-sess-back aria-label="단수 세기 목록으로">${BAR_ICON.back}<span>단수 세기</span></button>
    <button type="button" class="bar-btn del${delC ? " warn" : ""}" data-sess-del="${s.id}" aria-label="${delC ? "한 번 더 누르면 삭제돼요" : "이 카운터 삭제"}">${BAR_ICON.del}${delC ? "<span>한 번 더 누르면 삭제</span>" : ""}</button>`;
}
function renderCounter() {
  const box = $("v-counter");
  const s = state.sessions.find(x => x.id === state.sess);
  if (!s) {
    state.sess = null;
    let html = `<div class="view-title"><h2 id="h-counter">단수 세기</h2><span class="meta">${state.sessions.length ? `${state.sessions.length}개 뜨는 중` : ""}</span></div>`;
    if (!state.sessions.length) {
      html += `<div class="empty">아직 뜨는 중인 작품이 없어요. 무늬를 열고 '이 무늬로 뜨기 시작'을 누르면 여기에 단수 카운터가 생겨요.<button type="button" class="primary" data-tab="patterns">무늬 보러 가기</button></div>`;
    } else {
      html += `<ul class="sess-list">${state.sessions.map(x => {
        const p = PATTERNS[x.craft].find(q => q.id === x.pid), pr = projFind(x.craft, x.proj);
        const rx = recipe(x.craft, x.pid, x.cols, x.mode), info = rowInfo(rx, x.row);
        return `<li><button type="button" class="sess" data-sess="${x.id}"><canvas data-ss="${x.id}" aria-hidden="true"></canvas>
          <span><b>${p ? p.name : ""}${pr ? ` · ${pr.name}` : ""}</b><span class="s">${craftName(x.craft)} · ${info.done ? "완성!" : `${x.row}단 완료${x.target ? ` / 목표 ${x.target}단` : ""}`}</span>${x.target ? `<span class="pbar sm"><i style="width:${Math.min(100, Math.round(x.row / x.target * 100))}%"></i></span>` : ""}</span><span class="go" aria-hidden="true">›</span></button></li>`;
      }).join("")}</ul>`;
    }
    html += syncLine();
    box.innerHTML = html; barDetail();
    requestAnimationFrame(() => paintSess(box));
    return;
  }
  const p = PATTERNS[s.craft].find(q => q.id === s.pid), pr = projFind(s.craft, s.proj);
  const rx = recipe(s.craft, s.pid, s.cols, s.mode), info = rowInfo(rx, s.row), next = rowInfo(rx, s.row + 1);
  const reached = s.target && s.row >= s.target && !info.done;
  const kP = starKey("p", s.pid, s.craft);
  const delC = isConfirming("del", s.id), resetC = isConfirming("reset", s.id);
  let html = `<div class="ctr-head"><canvas data-ss="${s.id}" aria-hidden="true"></canvas><div><h2 id="h-counter">${p ? p.name : ""}</h2><span>${pr ? pr.name + " · " : ""}${craftName(s.craft)}</span></div>${starBtn(kP, p ? p.name : "", true)}</div>
    ${progressHTML(s, rx, info)}`;
  if (info.done) {
    html += `<div class="ctr-card done" aria-live="polite"><span class="label">${s.row}단 완료</span><div class="big">완성!</div><p class="inst">도안의 마지막 단까지 다 떴어요. 마무리하고 실 끝을 정리해 주세요.</p></div>
      <div class="ctr-sub"><button type="button" data-row="-1">− 1단 되돌리기</button><button type="button" data-reset class="${resetC ? "warn" : ""}">${resetC ? "한 번 더 누르면 0단으로" : "처음부터 다시"}</button></div>`;
  } else {
    html += `<div class="ctr-card" aria-live="polite">
        <span class="label">지금 뜰 단</span>
        <div class="big">${s.row + 1}<small>단째</small></div>
        <span class="phase">${info.phase}${reached ? " · 목표 단수를 다 떴어요!" : ""}</span>
        ${triLine(s)}
        <p class="inst"><b>${esc(info.row.t)}</b>${esc(info.row.d)}</p>
        ${next.done ? `<p class="next">이 단이 마지막이에요</p>` : `<p class="next">다음 단: ${esc(next.row.t)} · ${esc(next.row.d)}</p>`}
      </div>
      <button type="button" class="done-btn" data-row="1">${s.row + 1}단 다 떴어요 <span aria-hidden="true">+1</span></button>
      <div class="ctr-sub"><button type="button" data-row="-1"${s.row ? "" : " disabled"}>− 1단 되돌리기</button><button type="button" data-reset class="${resetC ? "warn" : ""}"${s.row ? "" : " disabled"}>${resetC ? "한 번 더 누르면 0단으로" : "처음부터"}</button></div>`;
  }
  html += `<div class="stitch"><div class="st-hd"><span class="label">코 세기</span><span class="hint">한 단 안에서 몇 코 떴는지 세요</span></div>
      <div class="st-row"><button type="button" data-st="-1" aria-label="코 하나 빼기">−</button><output aria-live="polite">${s.st}<small>코</small></output><button type="button" data-st="1" aria-label="코 하나 더하기">+</button></div>
      <label class="toggle"><input type="checkbox" id="st-auto" ${s.stAuto ? "checked" : ""}> 다음 단으로 넘어가면 0으로 돌리기</label></div>
    <label class="toggle"><input type="checkbox" id="wake" ${state.wake ? "checked" : ""}> 뜨는 동안 화면이 꺼지지 않게</label>`;
  html += `<details class="rx-fold"><summary>도안 전체 보기</summary>${recipeHTML(rx, s.cols, { noChart: true, hi: info.done ? -1 : info.hi })}</details>` + syncLine();
  box.innerHTML = html; barDetail();
  requestAnimationFrame(() => { paintSess(box); box.querySelectorAll("canvas[data-prog]").forEach(cv => drawProgress(cv, s)); box.querySelectorAll("canvas[data-pw]").forEach(cv => drawPatWindow(cv, s));
    const fs = box.querySelector("[data-filet-scroll]"), fb = fs && fs.querySelector(".filet-band");   // 필레 도안: 지금 단이 보이게 스크롤
    if (fb) { fs.scrollTop = Math.max(0, fb.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop - fs.clientHeight / 2);
      if (fs.scrollWidth > fs.clientWidth) fs.scrollLeft = (s.row + 1) % 2 ? fs.scrollWidth : 0; } });   // 크게 볼 땐 그 단을 시작하는 쪽으로
}

let wakeLock = null;
async function setWake(on) {
  state.wake = on; saveLocal();
  try {
    if (on && navigator.wakeLock) wakeLock = await navigator.wakeLock.request("screen");
    else if (on) throw new Error("x");
    else if (wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch (e) {
    state.wake = false; saveLocal(); toast("이 화면에서는 꺼짐 방지를 쓸 수 없어요"); if (state.tab === "counter") renderCounter();
  }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && state.wake && state.tab === "counter") setWake(true); });

const mixMode = () => form.color === "multi" || isMix(form.color);
// 색 고르기: 평소엔 하나만, '여러 색' 칩을 켜면 2~4가지를 차례로 골라 섞인 실로 담아요
function pickColor(k) {
  const parts = mixParts(form.color);
  if (k === "multi") {
    if (mixMode()) form.color = parts[0] || "unknown";
    else form.color = form.color && form.color !== "unknown" && cinfo(form.color).hex ? mixKey([form.color]) : "multi";
  } else if (k === "unknown") form.color = "unknown";
  else if (mixMode()) {
    const i = parts.indexOf(k);
    if (i >= 0) parts.splice(i, 1);
    else if (parts.length >= MIX_MAX) { toast(`섞인 색은 ${MIX_MAX}가지까지 고를 수 있어요`); return; }
    else parts.push(k);
    form.color = mixKey(parts);
  } else form.color = k;
  renderForm();
}
// 담을 때 정리: 섞인 색이 한 가지뿐이면 그냥 그 색으로
const finalColor = c => { const ps = mixParts(c); return isMix(c) && ps.length < 2 ? (ps[0] || "multi") : c; };
function renderForm() {
  $("opt-weight").innerHTML = WKEYS.map(k => `<button type="button" class="opt" id="w-${k}" data-w="${k}" aria-pressed="${form.weight === k}"><span class="strand" style="height:${WEIGHTS[k].line}px"></span><span>${WEIGHTS[k].name}</span><small>${WEIGHTS[k].needle}</small></button>`).join("");
  $("opt-size").innerHTML = Object.entries(SIZES).map(([k, s]) => `<button type="button" class="opt" id="s-${k}" data-s="${k}" aria-pressed="${form.size === k}"><span class="size-slot"><span class="size-ball" style="width:${s.px}px;height:${s.px}px"></span></span><span>${s.name}</span><small>${s.sub}</small></button>`).join("");
  $("opt-texture").innerHTML = Object.entries(TEXTURES).map(([k, t]) => `<button type="button" class="opt" id="t-${k}" data-t="${k}" aria-pressed="${form.texture === k}"><span>${t.name}</span><small>${t.sub}</small></button>`).join("");
  const mixing = mixMode(), parts = mixParts(form.color);
  const isCustom = !mixing && /^#/.test(form.color || "");
  const hexParts = parts.filter(p => p[0] === "#");
  $("opt-color").innerHTML = COLORS.map(([k, n, h]) => {
    const on = k === "multi" ? mixing : mixing ? parts.includes(k) : form.color === k, no = mixing && on && k !== "multi" ? parts.indexOf(k) + 1 : 0;
    const nm = k === "multi" ? "여러 색 섞인 실" : n;
    return `<button type="button" class="sw ${h ? "" : "unknown-sw"}${no ? " num" : ""}" id="c-${k}" data-c="${k}" style="${swStyle(k)}" aria-pressed="${on}" aria-label="${nm}${no ? ` (${no}번째)` : ""}" title="${nm}">${h ? (no ? `<b>${no}</b>` : "") : "?"}</button>`;
  }).join("")
    + hexParts.map(p => `<button type="button" class="sw num" data-c="${p}" style="background:${p}" aria-pressed="true" aria-label="${nearestName(p)} 계열 (${parts.indexOf(p) + 1}번째) 빼기" title="눌러서 빼기"><b>${parts.indexOf(p) + 1}</b></button>`).join("")
    + `<label class="sw-custom ${isCustom ? "on" : ""}" id="c-custom-wrap"><i id="c-custom-dot" style="background:${isCustom ? form.color : "transparent"}"></i>${mixing ? "+ 색 더하기" : isCustom ? "고른 색" : "+ 직접 고르기"}<input type="color" id="c-custom" aria-label="${mixing ? "섞인 색 하나 더 고르기" : "색 직접 고르기"}" value="${isCustom ? form.color.toLowerCase() : "#9e2a6b"}"></label>`;
  $("color-name").textContent = form.color && form.color !== "unknown" ? (mixing && parts.length < 2 ? "여러 색 섞임" : cinfo(form.color).name) : "선택 안 함";
  const mh = $("mix-hint");
  mh.hidden = !mixing;
  if (mixing) mh.innerHTML = `<span class="mix-ball" style="${swStyle(parts.length > 1 ? form.color : "multi")}"></span><span>섞여 있는 색을 <b>${MIX_MAX}가지까지</b> 차례로 눌러 주세요. ${parts.length ? `<b>${parts.length}가지</b> 골랐어요 · 1번이 대표색이에요.` : "먼저 누른 색이 대표색이 돼요."}</span>`;
  $("cnt-out").textContent = form.count + "개";
}

const TABS = ["basket", "patterns", "projects", "counter", "guide"];
function renderNav() {
  TABS.forEach(t => {
    $("v-" + t).hidden = state.tab !== t;
    const b = $("tab-" + t); if (state.tab === t) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  ["knit", "crochet"].forEach(k => $("craft-" + k).setAttribute("aria-pressed", String(state.craft === k)));
  const { g } = currentGroup();
  const bb = $("badge-basket"); bb.hidden = !state.yarns.length; bb.textContent = state.yarns.length;
  const bp = $("badge-patterns"); const n = g ? analyse(g).ok.length : 0; bp.hidden = !n; bp.textContent = n;
  barDetail();
  const bc = $("badge-counter"); bc.hidden = !state.sessions.length; bc.textContent = state.sessions.length;
}
function render() {
  renderNav();
  if (state.tab === "basket") renderBasket();
  if (state.tab === "patterns") renderPatterns();
  if (state.tab === "projects") renderProjects();
  if (state.tab === "counter") renderCounter();
  if (state.tab === "guide") renderGuide();
  if (!$("sheet-pat").hidden) renderDetail();
}
