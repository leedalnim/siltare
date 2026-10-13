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
        const p = PATTERNS[x.craft].find(q => q.id === x.pid), pr = x.proj ? PROJECTS[x.craft].find(q => q.id === x.proj) : null;
        const rx = recipe(x.craft, x.pid, x.cols, x.mode), info = rowInfo(rx, x.row);
        return `<li><button type="button" class="sess" data-sess="${x.id}"><canvas data-ss="${x.id}" aria-hidden="true"></canvas>
          <span><b>${p ? p.name : ""}${pr ? ` · ${pr.name}` : ""}</b><span class="s">${craftName(x.craft)} · ${info.done ? "완성!" : `${x.row}단 완료${x.target ? ` / 목표 ${x.target}단` : ""}`}</span>${x.target ? `<span class="pbar sm"><i style="width:${Math.min(100, Math.round(x.row / x.target * 100))}%"></i></span>` : ""}</span><span class="go" aria-hidden="true">›</span></button></li>`;
      }).join("")}</ul>`;
    }
    html += syncLine();
    box.innerHTML = html;
    requestAnimationFrame(() => paintSess(box));
    return;
  }
  const p = PATTERNS[s.craft].find(q => q.id === s.pid), pr = s.proj ? PROJECTS[s.craft].find(q => q.id === s.proj) : null;
  const rx = recipe(s.craft, s.pid, s.cols, s.mode), info = rowInfo(rx, s.row), next = rowInfo(rx, s.row + 1);
  const reached = s.target && s.row >= s.target && !info.done;
  const kP = starKey("p", s.pid, s.craft);
  const delC = isConfirming("del", s.id), resetC = isConfirming("reset", s.id);
  let html = `<div class="ctr-top"><button type="button" class="link" data-sess-back>‹ 단수 세기 목록</button>
    <button type="button" class="link danger" data-sess-del="${s.id}">${delC ? "한 번 더 누르면 삭제" : "카운터 삭제"}</button></div>
    <div class="ctr-head"><canvas data-ss="${s.id}" aria-hidden="true"></canvas><div><h2 id="h-counter">${p ? p.name : ""}</h2><span>${pr ? pr.name + " · " : ""}${craftName(s.craft)}</span></div>${starBtn(kP, p ? p.name : "", true)}</div>
    ${progressHTML(s, rx, info)}`;
  if (info.done) {
    html += `<div class="ctr-card done" aria-live="polite"><span class="label">${s.row}단 완료</span><div class="big">완성!</div><p class="inst">도안의 마지막 단까지 다 떴어요. 마무리하고 실 끝을 정리해 주세요.</p></div>
      <div class="ctr-sub"><button type="button" data-row="-1">− 1단 되돌리기</button><button type="button" data-reset class="${resetC ? "warn" : ""}">${resetC ? "한 번 더 누르면 0단으로" : "처음부터 다시"}</button></div>`;
  } else {
    html += `<div class="ctr-card" aria-live="polite">
        <span class="label">지금 뜰 단</span>
        <div class="big">${s.row + 1}<small>단째</small></div>
        <span class="phase">${info.phase}${reached ? " · 목표 단수를 다 떴어요!" : ""}</span>
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
  box.innerHTML = html;
  requestAnimationFrame(() => { paintSess(box); box.querySelectorAll("canvas[data-prog]").forEach(cv => drawProgress(cv, s)); box.querySelectorAll("canvas[data-pw]").forEach(cv => drawPatWindow(cv, s));
    const fs = box.querySelector("[data-filet-scroll]"), fb = fs && fs.querySelector(".filet-band");   // 필레 도안: 지금 단이 보이게 스크롤
    if (fb) fs.scrollTop = Math.max(0, fb.getBoundingClientRect().top - fs.getBoundingClientRect().top + fs.scrollTop - fs.clientHeight / 2); });
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

function renderForm() {
  $("opt-weight").innerHTML = WKEYS.map(k => `<button type="button" class="opt" id="w-${k}" data-w="${k}" aria-pressed="${form.weight === k}"><span class="strand" style="height:${WEIGHTS[k].line}px"></span><span>${WEIGHTS[k].name}</span><small>${WEIGHTS[k].needle}</small></button>`).join("");
  $("opt-size").innerHTML = Object.entries(SIZES).map(([k, s]) => `<button type="button" class="opt" id="s-${k}" data-s="${k}" aria-pressed="${form.size === k}"><span class="size-slot"><span class="size-ball" style="width:${s.px}px;height:${s.px}px"></span></span><span>${s.name}</span><small>${s.sub}</small></button>`).join("");
  $("opt-texture").innerHTML = Object.entries(TEXTURES).map(([k, t]) => `<button type="button" class="opt" id="t-${k}" data-t="${k}" aria-pressed="${form.texture === k}"><span>${t.name}</span><small>${t.sub}</small></button>`).join("");
  const isCustom = /^#/.test(form.color || "");
  $("opt-color").innerHTML = COLORS.map(([k, n, h]) => `<button type="button" class="sw ${h ? "" : "unknown-sw"}" id="c-${k}" data-c="${k}" style="${swStyle(k)}" aria-pressed="${form.color === k}" aria-label="${n}" title="${n}">${h ? "" : "?"}</button>`).join("")
    + `<label class="sw-custom ${isCustom ? "on" : ""}" id="c-custom-wrap"><i id="c-custom-dot" style="background:${isCustom ? form.color : "transparent"}"></i>${isCustom ? "고른 색" : "+ 직접 고르기"}<input type="color" id="c-custom" aria-label="색 직접 고르기" value="${isCustom ? form.color.toLowerCase() : "#9e2a6b"}"></label>`;
  $("color-name").textContent = form.color && form.color !== "unknown" ? cinfo(form.color).name : "선택 안 함";
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
