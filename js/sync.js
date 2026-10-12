// ---------- 계정 저장 (기기 간 동기화) ----------
const sync = { ref: null, status: "local" };
let pushT = null, pushing = false, pushAgain = false;
const payload = () => ({ v: 2, updatedAt: state.updatedAt || Date.now(), yarns: state.yarns, example: state.example, doubled: state.doubled, stars: state.stars, sessions: state.sessions });
function schedulePush() { if (!sync.ref) return; clearTimeout(pushT); pushT = setTimeout(pushNow, 700); }
async function pushNow() {
  if (!sync.ref) return;
  if (pushing) { pushAgain = true; return; }
  pushing = true; pushT = null;
  try { await sync.ref.set(payload()); if (sync.status !== "synced") { sync.status = "synced"; refreshSyncLines(); } }
  catch (e) {
    if (e && e.code === "unavailable") setTimeout(pushNow, 1200 + Math.random() * 1200);
    else { sync.status = "offline"; refreshSyncLines(); }
  }
  pushing = false;
  if (pushAgain) { pushAgain = false; pushNow(); }
}
function refreshSyncLines() { if (state.tab === "basket" || state.tab === "counter") render(); }
function applyRemote(d) {
  if (!d || !Array.isArray(d.yarns)) return;
  state.yarns = d.example ? [] : d.yarns; state.example = false; state.doubled = !!d.doubled;
  state.stars = d.stars && typeof d.stars === "object" ? { ...d.stars } : {};
  state.sessions = Array.isArray(d.sessions) ? d.sessions.map(s => ({ ...s, cols: Array.isArray(s.cols) ? s.cols : [] })) : [];
  state.updatedAt = d.updatedAt || 0;
  saveLocal(); render();
}
async function initSync() {
  if (!window.claude || typeof window.claude.use !== "function") { sync.status = "offline"; refreshSyncLines(); return; }
  try {
    const [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]);
    const uid = user ? await user.id() : null;
    if (!db || !uid) { sync.status = "offline"; refreshSyncLines(); return; }
    const ref = db.doc("data/users/" + uid + "/state");
    const snap = await ref.get();
    sync.ref = ref;
    const remote = snap.exists ? snap.data() : null;
    if (remote && (remote.updatedAt || 0) >= (state.updatedAt || 0)) { applyRemote(remote); sync.status = "synced"; }
    else { if (!state.updatedAt) state.updatedAt = Date.now(); await pushNow(); }
    refreshSyncLines();
    ref.onSnapshot(s => {
      if (!s.exists || s.metadata.hasPendingWrites || pushT || pushing) return;
      const d = s.data();
      if ((d.updatedAt || 0) > (state.updatedAt || 0)) applyRemote(d);
    }, () => { sync.status = "offline"; refreshSyncLines(); });
  } catch (e) { sync.status = "offline"; refreshSyncLines(); }
}
