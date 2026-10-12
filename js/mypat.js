// ---------- 내 도안 (직접 등록한 이미지·PDF 도안) ----------
// 파일은 이 기기 브라우저의 IndexedDB에, 이름·메모·진행 상황은 localStorage(MY_STORE)에 저장해요.
// 기존 실 데이터(leftover-yarn-v1)와는 따로 저장돼서 서로 영향이 없어요.

const MY_STORE = "leftover-yarn-my-v1";
let myPats = [];
try { const s = JSON.parse(localStorage.getItem(MY_STORE) || "[]"); if (Array.isArray(s)) myPats = s; } catch (e) {}
function mySave() { try { localStorage.setItem(MY_STORE, JSON.stringify(myPats)); return true; } catch (e) { toast("저장 공간이 부족해요. 안 쓰는 도안을 지워 주세요"); return false; } }

// ----- IndexedDB (파일 보관) -----
let myDB = null;
function myOpen() {
  if (myDB) return Promise.resolve(myDB);
  return new Promise((res, rej) => {
    const rq = indexedDB.open("siltare-my", 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore("files");
    rq.onsuccess = () => { myDB = rq.result; res(myDB); };
    rq.onerror = () => rej(rq.error);
  });
}
const myTx = (mode, fn) => myOpen().then(db => new Promise((res, rej) => {
  const t = db.transaction("files", mode), st = t.objectStore("files"), rq = fn(st);
  t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error);
}));
const myPut = (id, blob) => myTx("readwrite", st => st.put(blob, id));
const myGet = id => myTx("readonly", st => st.get(id));
const myDel = id => myTx("readwrite", st => st.delete(id));

// ----- 이미지 처리: 너무 큰 사진은 줄이고, 목록용 작은 그림을 만들어요 -----
const MY_MAX = 2400;
function myLoadImg(blob) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(blob), im = new Image();
    im.onload = () => { res({ im, url }); }; im.onerror = () => { URL.revokeObjectURL(url); rej(new Error("img")); };
    im.src = url;
  });
}
function myCanvasBlob(cv, type, q) { return new Promise(r => cv.toBlob(r, type, q)); }
async function myProcess(file) {
  if (file.type === "application/pdf" || /\.pdf$/i.test(file.name || "")) {
    if (file.size > 25 * 1024 * 1024) throw new Error("PDF는 25MB 이하만 등록할 수 있어요");
    return { kind: "pdf", blob: file, name: file.name || "도안.pdf", thumb: null, w: 0, h: 0 };
  }
  const { im, url } = await myLoadImg(file);
  try {
    const w0 = im.naturalWidth, h0 = im.naturalHeight, k = Math.min(1, MY_MAX / Math.max(w0, h0));
    let blob = file, w = w0, h = h0;
    if (k < 1 || file.size > 4 * 1024 * 1024 || !/^image\/(png|jpeg|webp)$/.test(file.type)) {
      w = Math.round(w0 * k); h = Math.round(h0 * k);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
      const cx = cv.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, w, h); cx.drawImage(im, 0, 0, w, h);
      blob = await myCanvasBlob(cv, "image/jpeg", 0.9);
    }
    const tk = 200 / Math.max(w0, h0), tc = document.createElement("canvas");
    tc.width = Math.max(1, Math.round(w0 * Math.min(1, tk))); tc.height = Math.max(1, Math.round(h0 * Math.min(1, tk)));
    const tx = tc.getContext("2d"); tx.fillStyle = "#fff"; tx.fillRect(0, 0, tc.width, tc.height); tx.drawImage(im, 0, 0, tc.width, tc.height);
    return { kind: "img", blob, name: file.name || "도안", thumb: tc.toDataURL("image/jpeg", 0.7), w, h };
  } finally { URL.revokeObjectURL(url); }
}

// ----- 무늬 탭의 '내 도안' 목록 -----
const MY_CRAFT = { crochet: "코바늘", knit: "대바늘", any: "공통" };
function myListHTML() {
  const add = `<div class="my-add-row"><button type="button" class="primary my-add-btn" data-my-add>+ 이미지·PDF 도안</button><button type="button" class="primary my-add-btn" data-dot-new>+ 도트 도안 그리기</button></div>
    <p class="note my-note">인터넷에서 받은 도안 이미지·PDF를 등록하거나, 칸에 색을 칠해 도트 도안을 직접 그릴 수 있어요. 이 기기에만 저장돼요.</p>`;
  if (!myPats.length) return `<div class="empty">아직 등록한 도안이 없어요.<br>도안 이미지를 올리거나 도트 도안을 그려 보세요.</div>${add}`;
  const items = myPats.slice().sort((a, b) => b.created - a.created).map(p => {
    const pct = p.target ? Math.min(100, Math.round(p.row / p.target * 100)) : 0;
    return `<li><button type="button" class="my-card" data-my-open="${p.id}">
      <span class="my-th${p.type === "dot" ? " dot" : ""}">${p.thumb ? `<img src="${p.thumb}" alt="">` : `<span class="my-pdf">PDF</span>`}${(p.pages || []).length > 1 ? `<i>${p.pages.length}장</i>` : ""}</span>
      <span class="my-tx"><b>${esc(p.name)}</b><span class="s">${p.type === "dot" ? `도트 도안 · ${p.w}×${p.h}` : MY_CRAFT[p.craft] || ""}${p.row ? ` · ${p.row}단${p.target ? ` / ${p.target}단` : ""}` : ""}</span>
      ${p.target ? `<span class="pbar sm"><i style="width:${pct}%"></i></span>` : ""}</span></button></li>`;
  }).join("");
  return `${add}<ul class="my-list">${items}</ul>`;
}

// ----- 등록 시트 -----
let myDraft = { files: [] };
function myPrevHTML() {
  if (!myDraft.files.length) return `<p class="my-hint">아직 고른 파일이 없어요.</p>`;
  return `<ul class="my-prev">${myDraft.files.map((f, i) => `<li><span class="my-th">${f.thumb ? `<img src="${f.thumb}" alt="">` : `<span class="my-pdf">PDF</span>`}</span><button type="button" class="my-x" data-my-rm="${i}" aria-label="빼기">×</button></li>`).join("")}</ul>`;
}
function myOpenAdd(files) {
  myDraft = { files: [] };
  $("myadd-body").innerHTML = `<form id="my-form" class="my-form" autocomplete="off">
    <div class="my-pick">
      <label class="ghost-btn">사진·파일 고르기<input type="file" id="my-file" accept="image/*,application/pdf" multiple hidden></label>
      <label class="ghost-btn">카메라로 찍기<input type="file" id="my-cam" accept="image/*" capture="environment" hidden></label>
      <button type="button" class="ghost-btn" data-my-paste>붙여넣기</button>
    </div>
    <div id="my-prev">${myPrevHTML()}</div>
    <p class="my-hint">이미지를 복사한 뒤 '붙여넣기'를 누르거나 이 창에서 붙여넣어도 돼요. 안드로이드는 크롬에서 이미지를 길게 눌러 공유하면 이 앱으로 바로 보낼 수 있어요.</p>
    <div class="field"><span class="label">이름</span><input id="my-name" class="my-in" type="text" maxlength="60" placeholder="예: 고양이 모티브 담요"></div>
    <div class="field"><span class="label">뜨개 종류</span>
      <div class="seg my-craft" role="group"><button type="button" data-my-craft="crochet" aria-pressed="${state.craft === "crochet"}">코바늘</button><button type="button" data-my-craft="knit" aria-pressed="${state.craft === "knit"}">대바늘</button><button type="button" data-my-craft="any" aria-pressed="false">공통</button></div></div>
    <div class="field"><span class="label">목표 단수 (선택)</span><input id="my-target" class="my-in" type="number" inputmode="numeric" min="1" max="999" placeholder="모르면 비워 두세요"></div>
    <div class="field"><span class="label">출처 링크 (선택)</span><input id="my-url" class="my-in" type="url" inputmode="url" placeholder="https://"></div>
    <div class="field"><span class="label">메모 (선택)</span><textarea id="my-memo" class="my-in" rows="3" maxlength="500" placeholder="바늘 호수, 실 굵기, 주의할 점 등"></textarea></div>
    <button class="primary" type="submit" id="my-save">도안 저장</button></form>`;
  myDraft.craft = state.craft;
  openSheet("sheet-myadd");
  if (files && files.length) myAddFiles(files);
}
async function myAddFiles(list) {
  for (const f of Array.from(list)) {
    try {
      const r = await myProcess(f); myDraft.files.push(r);
      const nm = $("my-name"); if (nm && !nm.value) nm.value = String(r.name).replace(/\.[^.]+$/, "").slice(0, 60);
    } catch (e) { toast(e && e.message && /25MB/.test(e.message) ? e.message : "이 파일은 열 수 없어요 (이미지나 PDF만 가능해요)"); }
  }
  const p2 = $("my-prev"); if (p2) p2.innerHTML = myPrevHTML();
}
async function myPasteFromClipboard() {
  try {
    const items = await navigator.clipboard.read(), files = [];
    for (const it of items) for (const t of it.types) if (t.startsWith("image/")) { const b = await it.getType(t); files.push(new File([b], "붙여넣은 도안.png", { type: t })); }
    if (files.length) myAddFiles(files); else toast("복사된 이미지가 없어요");
  } catch (e) { toast("붙여넣기를 쓸 수 없어요. 이 창을 누른 뒤 붙여넣기(길게 눌러 붙여넣기)를 해 보세요"); }
}
async function mySubmit() {
  if (!myDraft.files.length) { toast("도안 이미지나 PDF를 먼저 골라 주세요"); return; }
  const btn = $("my-save"); btn.disabled = true; btn.textContent = "저장 중…";
  try {
    const id = "m" + Date.now().toString(36), pages = [];
    for (let i = 0; i < myDraft.files.length; i++) {
      const f = myDraft.files[i], pid = `${id}-${i}`;
      await myPut(pid, { blob: f.blob, type: f.blob.type || (f.kind === "pdf" ? "application/pdf" : "image/jpeg") });
      pages.push({ id: pid, kind: f.kind, w: f.w, h: f.h });
    }
    const tg = parseInt($("my-target").value, 10);
    myPats.push({ id, name: $("my-name").value.trim() || "이름 없는 도안", craft: myDraft.craft || "crochet", url: $("my-url").value.trim(), memo: $("my-memo").value.trim(),
      target: tg > 0 ? tg : 0, row: 0, pages, thumb: (myDraft.files.find(f => f.thumb) || {}).thumb || null, mark: { y: .1, h: .08, on: true }, created: Date.now() });
    mySave(); try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
    closeSheets(); state.tab = "patterns"; state.mode = "mine"; saveLocal(); render(); toast("도안을 저장했어요");
  } catch (e) { btn.disabled = false; btn.textContent = "도안 저장"; toast("저장하지 못했어요. 저장 공간을 확인해 주세요"); }
}

// ----- 보기 시트 (확대 · 읽는 줄 표시 · 단수 카운터) -----
const myView = { id: null, page: 0, zoom: 1, urls: [] };
const MY_ZOOMS = [1, 1.6, 2.4, 3.4];
function myClean() { myView.urls.forEach(u => URL.revokeObjectURL(u)); myView.urls = []; }
async function myOpenView(id, keepPage) {
  const p = myPats.find(x => x.id === id); if (!p) return;
  if (p.type === "dot") return dotOpenView(p);
  if (myView.id !== id) { myView.page = 0; myView.zoom = 1; } else if (!keepPage) myView.page = 0;
  myView.id = id; myClean();
  $("mypat-h").textContent = p.name;
  const pg = p.pages[Math.min(myView.page, p.pages.length - 1)];
  const rec = await myGet(pg.id).catch(() => null);
  let src = null;
  if (rec && rec.blob) { src = URL.createObjectURL(rec.blob); myView.urls.push(src); }
  const m = p.mark || { y: .1, h: .08, on: true };
  const body = !src ? `<div class="empty">이 도안 파일을 찾을 수 없어요. 브라우저가 저장 공간을 비웠을 수 있어요.</div>`
    : pg.kind === "pdf" ? `<div class="my-pdfbox"><span class="my-pdf big">PDF</span><a class="primary wide" href="${src}" target="_blank" rel="noopener">PDF 열기</a><p class="my-hint">PDF는 새 창에서 열려요.</p></div>`
    : `<div class="my-viewer"><div class="my-scroll" id="my-scroll"><div class="my-stage" id="my-stage" style="width:${myView.zoom * 100}%"><img src="${src}" alt="${esc(p.name)} 도안" draggable="false">${m.on ? `<div class="my-band" id="my-band" style="top:${m.y * 100}%;height:${m.h * 100}%"></div>` : ""}</div></div>
      <div class="my-tools"><button type="button" data-my-z="-1" aria-label="작게">−</button><span>${Math.round(myView.zoom * 100)}%</span><button type="button" data-my-z="1" aria-label="크게">＋</button>
        <span class="sp"></span><button type="button" data-my-band="toggle" aria-pressed="${!!m.on}">읽는 줄 띠</button>
        ${m.on ? `<button type="button" data-my-band="up" aria-label="띠 위로">▲</button><button type="button" data-my-band="down" aria-label="띠 아래로">▼</button><button type="button" data-my-band="thin" aria-label="띠 얇게">－</button><button type="button" data-my-band="thick" aria-label="띠 두껍게">＋</button>` : ""}</div>
      ${m.on ? `<p class="my-hint">도안을 톡 누르면 그 줄로 띠가 옮겨가요. 띠 밖은 흐리게 보여서 지금 줄만 보여요.</p>` : ""}</div>`;
  const tabs = p.pages.length > 1 ? `<div class="seg my-pages" role="group" aria-label="쪽">${p.pages.map((_, i) => `<button type="button" data-my-page="${i}" aria-pressed="${i === myView.page}">${i + 1}</button>`).join("")}</div>` : "";
  const pct = p.target ? Math.min(100, Math.round(p.row / p.target * 100)) : 0;
  $("mypat-body").innerHTML = `${tabs}${body}
    <div class="my-ctr"><span class="label">단수 세기</span><div class="my-ctr-row"><button type="button" data-my-row="-1" aria-label="한 단 빼기"${p.row ? "" : " disabled"}>−</button>
      <output aria-live="polite"><b>${p.row}</b>단${p.target ? ` <small>/ ${p.target}단</small>` : ""}</output><button type="button" data-my-row="1" class="plus" aria-label="한 단 더하기">+1</button></div>
      ${p.target ? `<div class="pbar"><i style="width:${pct}%"></i></div>` : ""}</div>
    <div class="my-meta"><span class="chip-s">${MY_CRAFT[p.craft] || ""}</span>${p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">출처 열기 ↗</a>` : ""}</div>
    ${p.memo ? `<p class="my-memo">${esc(p.memo).replace(/\n/g, "<br>")}</p>` : ""}
    <div class="my-acts"><button type="button" class="ghost-btn" data-my-edit="${p.id}">이름·메모 고치기</button><button type="button" class="ghost-btn danger" data-my-del="${p.id}">삭제</button></div>`;
  if ($("sheet-mypat").hidden) openSheet("sheet-mypat");
}
function myBandSet(y) {
  const p = myPats.find(x => x.id === myView.id); if (!p) return;
  p.mark = p.mark || { y: .1, h: .08, on: true };
  p.mark.y = Math.max(0, Math.min(1 - p.mark.h, y)); mySave();
  const b = $("my-band"); if (b) b.style.top = p.mark.y * 100 + "%";
}

// ----- 이벤트 -----
document.addEventListener("click", e => {
  const t = e.target;
  const open = t.closest("[data-my-open]"); if (open) { myOpenView(open.dataset.myOpen); return; }
  if (t.closest("[data-my-add]")) { myOpenAdd(); return; }
  if (t.closest("[data-my-paste]")) { myPasteFromClipboard(); return; }
  const rm = t.closest("[data-my-rm]"); if (rm) { myDraft.files.splice(+rm.dataset.myRm, 1); $("my-prev").innerHTML = myPrevHTML(); return; }
  const cr = t.closest("[data-my-craft]"); if (cr) { myDraft.craft = cr.dataset.myCraft; document.querySelectorAll("[data-my-craft]").forEach(b => b.setAttribute("aria-pressed", String(b === cr))); return; }
  const p = myPats.find(x => x.id === myView.id);
  const z = t.closest("[data-my-z]"); if (z && p) { const i = MY_ZOOMS.indexOf(myView.zoom); myView.zoom = MY_ZOOMS[Math.max(0, Math.min(MY_ZOOMS.length - 1, i + (+z.dataset.myZ)))]; myOpenView(p.id, true); return; }
  const pg = t.closest("[data-my-page]"); if (pg && p) { myView.page = +pg.dataset.myPage; myOpenView(p.id, true); return; }
  const bd = t.closest("[data-my-band]");
  if (bd && p) {
    p.mark = p.mark || { y: .1, h: .08, on: true }; const m = p.mark, a = bd.dataset.myBand;
    if (a === "toggle") m.on = !m.on;
    if (a === "up") m.y = Math.max(0, m.y - m.h * .6);
    if (a === "down") m.y = Math.min(1 - m.h, m.y + m.h * .6);
    if (a === "thin") m.h = Math.max(.02, m.h * .75);
    if (a === "thick") { m.h = Math.min(.3, m.h * 1.33); m.y = Math.min(m.y, 1 - m.h); }
    mySave(); const sc = $("my-scroll"), top = sc ? sc.scrollTop : 0; myOpenView(p.id, true).then(() => { const s2 = $("my-scroll"); if (s2) s2.scrollTop = top; }); return;
  }
  const rw = t.closest("[data-my-row]"); if (rw && p) { p.row = Math.max(0, p.row + (+rw.dataset.myRow)); mySave(); const o = document.querySelector(".my-ctr output"); if (o) o.innerHTML = `<b>${p.row}</b>단${p.target ? ` <small>/ ${p.target}단</small>` : ""}`; const bar = document.querySelector(".my-ctr .pbar i"); if (bar && p.target) bar.style.width = Math.min(100, Math.round(p.row / p.target * 100)) + "%"; const mn = document.querySelector('[data-my-row="-1"]'); if (mn) mn.disabled = !p.row; return; }
  const ed = t.closest("[data-my-edit]"); if (ed && p) {
    const nm = prompt("도안 이름", p.name); if (nm === null) return;
    const mm = prompt("메모", p.memo || ""); const tg = prompt("목표 단수 (비우면 없음)", p.target || "");
    p.name = nm.trim() || p.name; if (mm !== null) p.memo = mm.trim(); if (tg !== null) p.target = Math.max(0, parseInt(tg, 10) || 0);
    mySave(); myOpenView(p.id, true); if (state.tab === "patterns" && state.mode === "mine") renderPatterns(); return;
  }
  const dl = t.closest("[data-my-del]"); if (dl && p) {
    if (!confirm(`'${p.name}' 도안을 삭제할까요? 파일도 함께 지워져요.`)) return;
    (p.pages || []).forEach(pgx => myDel(pgx.id).catch(() => {}));
    myPats = myPats.filter(x => x.id !== p.id); mySave(); myClean(); myView.id = null; closeSheets(); render(); toast("도안을 지웠어요");
  }
});
document.addEventListener("click", e => {   // 도안을 톡 누르면 띠가 그 줄로
  const st = e.target.closest("#my-stage"); if (!st || e.target.closest(".my-band")) return;
  const r = st.getBoundingClientRect(), p = myPats.find(x => x.id === myView.id); if (!p || !(p.mark && p.mark.on)) return;
  myBandSet((e.clientY - r.top) / r.height - p.mark.h / 2);
});
document.addEventListener("change", e => {
  if (e.target.id === "my-file" || e.target.id === "my-cam") { myAddFiles(e.target.files); e.target.value = ""; }
});
document.addEventListener("submit", e => { if (e.target.id === "my-form") { e.preventDefault(); mySubmit(); } });
document.addEventListener("paste", e => {
  if ($("sheet-myadd").hidden) return;
  const fs = Array.from(e.clipboardData ? e.clipboardData.files : []).filter(f => f.type.startsWith("image/"));
  if (fs.length) { e.preventDefault(); myAddFiles(fs); }
});
["dragover", "drop"].forEach(ev => document.addEventListener(ev, e => {
  if ($("sheet-myadd").hidden) return; e.preventDefault();
  if (ev === "drop" && e.dataTransfer) myAddFiles(e.dataTransfer.files);
}));
// 띠를 끌어서 옮기기
(function () {
  let drag = null;
  document.addEventListener("pointerdown", e => { const b = e.target.closest("#my-band"); if (!b) return; const st = $("my-stage").getBoundingClientRect(); drag = { top: st.top, h: st.height }; b.setPointerCapture(e.pointerId); e.preventDefault(); });
  document.addEventListener("pointermove", e => { if (!drag) return; const p = myPats.find(x => x.id === myView.id); if (p) myBandSet((e.clientY - drag.top) / drag.h - p.mark.h / 2); });
  document.addEventListener("pointerup", () => { drag = null; });
})();

// ----- 다른 앱에서 공유해 온 도안 받기 (안드로이드 설치형 앱) -----
async function myReceiveShared() {
  if (!/[?&]share=1/.test(location.search) || !("caches" in window)) return;
  try {
    const c = await caches.open("share-inbox"), keys = await c.keys(), files = [];
    for (const k of keys) {
      const r = await c.match(k); if (!r) continue;
      const b = await r.blob(), nm = decodeURIComponent(r.headers.get("x-name") || "공유한 도안");
      if (b.type.startsWith("image/") || b.type === "application/pdf") files.push(new File([b], nm, { type: b.type }));
      await c.delete(k);
    }
    history.replaceState(null, "", location.pathname);
    state.tab = "patterns"; state.mode = "mine"; saveLocal(); render();
    if (files.length) myOpenAdd(files); else toast("공유된 이미지를 받지 못했어요");
  } catch (e) {}
}
window.addEventListener("load", myReceiveShared);
