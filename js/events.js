// ---------- Events ----------
const curSess = () => state.sessions.find(x => x.id === state.sess);
document.addEventListener("click", e => {
  if (e.target.closest("[data-close]")) { closeSheets(); return; }
  const t = e.target.closest("button"); if (!t) return;
  const d = t.dataset;
  if (d.tab) { confirmState = null; state.tab = d.tab; if (d.tab !== "counter") state.sess = state.sess; saveLocal(); if (anySheetOpen()) closeSheets(); render(); scroller().scrollTo(0, 0); return; }
  if (d.craft) { state.craft = d.craft; saveLocal(); render(); return; }
  if (d.star) {
    if (state.stars[d.star]) delete state.stars[d.star]; else state.stars[d.star] = Date.now();
    const on = !!state.stars[d.star];
    save(); render(); toast(on ? "즐겨찾기에 넣었어요. ★ 즐겨찾기에서 모아 볼 수 있어요" : "즐겨찾기에서 뺐어요"); return;
  }
  if (d.cv) { ctrUI.view = d.cv; renderCounter(); return; }
  if (d.mode) { state.mode = d.mode; saveLocal(); renderPatterns(); return; }
  if (d.cat) { state.cat = d.cat; saveLocal(); renderProjects(); return; }
  if ("openAdd" in d) { state.editId = null; $("add-h").textContent = "실 담기"; $("add-btn").textContent = "바구니에 담기"; $("gram-input").value = ""; renderForm(); openSheet("sheet-add"); return; }
  if (d.edit) {
    const y = state.yarns.find(v => v.id === d.edit); if (!y) return;
    state.editId = y.id; form.weight = y.weight; form.texture = y.texture; form.color = y.color || "unknown"; form.count = 1;
    $("add-h").textContent = "실 수정"; $("add-btn").textContent = "저장"; renderForm(); $("gram-input").value = y.grams;
    openSheet("sheet-add"); return;
  }
  if (d.p) { state.detail = d.p; state.pv = d.pv || null; $("sheet-pat").hidden = false; renderDetail(); openSheet("sheet-pat"); $("sheet-pat").querySelector(".sheet-panel").scrollTop = 0; return; }
  if (d.tp) { if (state.openProj.has(d.tp)) state.openProj.delete(d.tp); else state.openProj.add(d.tp); renderProjects(); const f = document.querySelector(`.fold[data-tp="${d.tp}"]`); if (f) f.focus({ preventScroll: true }); return; }
  if ("start" in d) {
    const p = PATTERNS[state.craft].find(x => x.id === state.detail); if (!p) return;
    const g = currentGroup().g || PH, r = evalPattern(p, g);
    openSetup({ pid: p.id, craft: state.craft, proj: (!r.skip && state.pv) || null }); return;
  }
  if (d.suEdit) { openSetup({ editId: d.suEdit }); return; }
  if (d.suProj !== undefined) { const su = state.setup; if (!su) return; su.proj = d.suProj || null; su.newProj = false; const dm = projDims(su.proj); su.w = dm[0]; su.l = dm[1];
    const probe = recipe(su.craft, su.pid, [], "flat"); if (!su.editId) su.mode = probe.rr && (dm[2] || probe.roundFirst) ? "round" : "flat";
    su.n = null; su.r = null; recalcSetup(true); renderSetup(); return; }
  if (d.suMode) { const su = state.setup; if (!su) return; su.mode = d.suMode; su.n = null; recalcSetup(true); renderSetup(); return; }
  if ("suGo" in d) { commitSetup(); return; }
  if ("suNew" in d) { const su = state.setup; if (!su) return; su.newProj = !su.newProj; renderSetup(); if (su.newProj) { const i = $("su-pname"); if (i) i.focus(); } return; }
  if ("suAdd" in d) { addMyProj(); return; }
  if (d.suDelproj) { const su = state.setup, m = state.myProj.find(q => q.id === d.suDelproj); if (!su || !m) return;
    if (!confirm(`'${m.name}'을(를) 내 작품 목록에서 지울까요? 이미 만든 카운터는 그대로예요.`)) return;
    state.myProj = state.myProj.filter(q => q.id !== m.id); if (su.proj === m.id) su.proj = null; save(); renderSetup(); toast("내 작품에서 지웠어요"); return; }
  if (d.sess) { confirmState = null; state.sess = d.sess; state.tab = "counter"; saveLocal(); if (!$("sheet-pat").hidden) closeSheets(); render(); scroller().scrollTo(0, 0); return; }
  if ("sessBack" in d) { confirmState = null; state.sess = null; saveLocal(); renderCounter(); scroller().scrollTo(0, 0); return; }
  if (d.sessDel) {
    if (!confirmed("del", d.sessDel)) return;
    state.sessions = state.sessions.filter(x => x.id !== d.sessDel); state.sess = null;
    save(); render(); toast("카운터를 삭제했어요"); return;
  }
  if (d.row) {
    const s = curSess(); if (!s) return;
    const before = rowInfo(recipe(s.craft, s.pid, s.cols, s.mode), s.row);
    s.row = Math.max(0, s.row + (+d.row));
    if (+d.row > 0 && s.stAuto) s.st = 0;
    s.at = Date.now(); save(); renderCounter(); renderNav();
    if (+d.row > 0 && !before.done && rowInfo(recipe(s.craft, s.pid, s.cols, s.mode), s.row).done) toast("마지막 단까지 다 떴어요!");
    else if (+d.row > 0 && s.target && s.row === s.target) toast("목표 단수를 다 떴어요!");
    return;
  }
  if ("reset" in d) {
    const s = curSess(); if (!s) return;
    if (!confirmed("reset", s.id)) return;
    s.row = 0; s.st = 0; s.at = Date.now(); save(); renderCounter(); toast("0단으로 돌렸어요"); return;
  }
  if (d.st) { const s = curSess(); if (!s) return; s.st = Math.max(0, s.st + (+d.st)); s.at = Date.now(); save(); renderCounter(); return; }
  if (d.pv) { state.pv = d.pv; renderDetail(); return; }
  if (d.main) { const { g } = currentGroup(); if (g) state.main[g.key] = d.main; renderDetail(); renderNav(); if (state.tab === "patterns") renderPatterns(); if (state.tab === "projects") renderProjects(); return; }
  if (d.g) { state.group = d.g; render(); return; }
  if (d.del) {
    const idx = state.yarns.findIndex(y => y.id === d.del); if (idx < 0) return;
    const y = state.yarns[idx];
    undoData = { yarns: state.yarns.slice(), example: state.example };
    state.yarns.splice(idx, 1);
    if (!state.yarns.length) state.example = false;
    save(); render();
    const c = cinfo(y.color);
    toast(`${WEIGHTS[y.weight].name}${c.hex ? " · " + c.name : ""} ${y.grams}g을 삭제했어요`, true);
    return;
  }
  if ("clearExample" in d) {
    undoData = { yarns: state.yarns.slice(), example: state.example };
    state.yarns = []; state.example = false; save(); render();
    toast("예시 실을 모두 지웠어요", true);
    return;
  }
  if ("undo" in d) {
    if (undoData) { state.yarns = undoData.yarns; state.example = undoData.example; undoData = null; save(); render(); }
    $("toast").hidden = true;
    return;
  }
  if (d.w) { form.weight = d.w; renderForm(); return; }
  if (d.s) { form.size = d.s; $("gram-input").value = ""; renderForm(); return; }
  if (d.t) { form.texture = d.t; renderForm(); return; }
  if (d.c) { pickColor(d.c); return; }
  if (t.id === "cnt-minus") { form.count = Math.max(1, form.count - 1); renderForm(); return; }
  if (t.id === "cnt-plus") { form.count = Math.min(20, form.count + 1); renderForm(); return; }
});
document.addEventListener("toggle", e => { if (e.target.matches && e.target.matches("[data-maybe]")) state.openMaybe = e.target.open; }, true);
document.addEventListener("change", e => {
  if (e.target.classList.contains("dbl")) { state.doubled = e.target.checked; if (state.doubled) state.group = "thin2"; save(); render(); }
  if (e.target.id === "st-auto") { const s = curSess(); if (s) { s.stAuto = e.target.checked; save(); } }
  if (e.target.id === "wake") setWake(e.target.checked);
  if (e.target.id === "c-custom" && mixMode()) {
    const hx = e.target.value.toUpperCase(), ps = mixParts(form.color);
    if (ps.includes(hx)) return;
    if (ps.length >= MIX_MAX) { toast(`섞인 색은 ${MIX_MAX}가지까지 고를 수 있어요`); return; }
    form.color = mixKey([...ps, hx]); renderForm();
  }
});
document.addEventListener("input", e => {
  if (/^su-(w|n|l|r|n0)$/.test(e.target.id)) { setupInput(e.target.id, parseFloat(e.target.value)); return; }
  if (e.target.id !== "c-custom" || mixMode()) return;   // 섞인 색 고를 때는 다 고른 뒤(change)에 더해요
  form.color = e.target.value.toUpperCase();
  const w = $("c-custom-wrap"); w.classList.add("on"); $("c-custom-dot").style.background = form.color;
  [...w.childNodes].forEach(nd => { if (nd.nodeType === 3) nd.textContent = "고른 색"; });
  document.querySelectorAll("#opt-color .sw[data-c]").forEach(b => b.setAttribute("aria-pressed", "false"));
  $("color-name").textContent = cinfo(form.color).name;
});
document.addEventListener("keydown", e => { if (e.key === "Escape" && anySheetOpen()) closeSheets(); });
$("add-form").addEventListener("submit", e => {
  e.preventDefault();
  const gIn = parseFloat($("gram-input").value), s = SIZES[form.size];
  const grams = gIn > 0 ? Math.round(gIn) : s.g * form.count;
  if (state.editId) {
    const y = state.yarns.find(v => v.id === state.editId);
    if (y) {
      const label = gIn > 0 ? (Math.round(gIn) === y.grams ? y.label : "저울로 잼") : `${s.name} ×${form.count}`;
      Object.assign(y, { weight: form.weight, grams, color: finalColor(form.color), texture: form.texture, label });
      state.group = form.weight;
    }
    state.editId = null; form.count = 1; $("gram-input").value = "";
    save(); closeSheets(); render(); toast("수정했어요"); return;
  }
  const label = gIn > 0 ? "저울로 잼" : `${s.name} ×${form.count}`;
  const wasExample = state.example;
  if (state.example) { state.yarns = []; state.example = false; }
  state.yarns.push({ id: "y" + Date.now().toString(36), weight: form.weight, grams, color: finalColor(form.color), texture: form.texture, label });
  state.group = form.weight;
  form.count = 1; $("gram-input").value = "";
  save(); closeSheets(); render();
  const ci = cinfo(finalColor(form.color)), cn = ci.hex ? ci.name + " " : "";
  toast(`${cn}${WEIGHTS[form.weight].name} ${grams}g을 담았어요${wasExample ? " · 예시는 지웠어요" : ""}`);
});
