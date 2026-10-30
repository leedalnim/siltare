// ---------- 백업 · 옮기기 ----------
// 실·카운터·내 도안을 파일이나 복사한 글로 내보내고, 다시 불러와요.
// 홈 화면 앱을 지우거나(아이폰은 앱과 함께 저장 내용도 지워요) 사파리↔홈 화면 앱, 다른 기기로 옮길 때 써요.
const BK_KEYS = [STORE, MY_STORE];
function bkMake() {
  const data = {}; BK_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v != null) data[k] = v; });
  return JSON.stringify({ app: "siltare", v: 1, at: new Date().toISOString(), data });
}
function bkName() { const d = new Date(), p = n => String(n).padStart(2, "0"); return `siltare-backup-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}.json`; }
function bkRestore(text) {
  let b; try { b = JSON.parse(String(text || "").trim()); } catch (e) { b = null; }
  if (!b || b.app !== "siltare" || !b.data || typeof b.data[STORE] !== "string") { toast("백업 내용이 아니에요. 백업 파일이나 복사한 글 전체를 넣어 주세요"); return; }
  let y = 0; try { y = (JSON.parse(b.data[STORE]).yarns || []).length; } catch (e) {}
  if (!confirm(`${b.at ? b.at.slice(0, 10) + " 백업 · " : ""}실 ${y}뭉치\n지금 앱의 실·카운터·내 도안을 이 백업으로 바꿀까요?`)) return;
  try { BK_KEYS.forEach(k => { if (typeof b.data[k] === "string") localStorage.setItem(k, b.data[k]); }); }
  catch (e) { toast("저장 공간이 부족해서 불러오지 못했어요"); return; }
  location.reload();
}
async function bkSaveFile() {
  const text = bkMake(), file = new File([text], bkName(), { type: "application/json" });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "남은 실 처방전 백업" }); return; } }
  catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(file); a.download = file.name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast("백업 파일을 저장했어요");
}
async function bkCopy() {
  try { await navigator.clipboard.writeText(bkMake()); toast("백업을 복사했어요. 옮길 곳에서 '붙여넣기'를 눌러 주세요"); }
  catch (e) { toast("복사하지 못했어요. '파일로 저장'을 써 주세요"); }
}
async function bkPaste() {
  let t = "";
  try { t = await navigator.clipboard.readText(); } catch (e) {}
  if (!t) t = prompt("복사한 백업 글을 여기에 붙여 넣어 주세요") || "";
  if (t) bkRestore(t);
}
document.addEventListener("click", e => {
  const t = e.target.closest && e.target.closest("[data-bk]"); if (!t) return;
  const k = t.dataset.bk;
  if (k === "save") bkSaveFile(); else if (k === "copy") bkCopy(); else if (k === "paste") bkPaste();
});
document.addEventListener("change", e => {
  if (e.target.id !== "bk-file" || !e.target.files[0]) return;
  const f = e.target.files[0]; e.target.value = ""; f.text().then(bkRestore);
});
const backupHTML = () => `<details class="backup"><summary>백업 · 옮기기</summary>
  <p class="hint">실, 단수 카운터, 내 도안이 모두 들어가요. 홈 화면 앱을 지우거나 다른 기기·사파리로 옮기기 전에 꼭 백업해 두세요. (아이폰은 홈 화면 앱을 지우면 저장 내용도 함께 지워요)</p>
  <div class="bk-row"><button type="button" class="ghost-btn" data-bk="save">파일로 저장</button><button type="button" class="ghost-btn" data-bk="copy">복사하기</button></div>
  <div class="bk-row"><label class="ghost-btn bk-file">파일 불러오기<input type="file" id="bk-file" accept=".json,application/json,text/plain"></label><button type="button" class="ghost-btn" data-bk="paste">붙여넣기</button></div>
</details>`;
// 브라우저가 저장 공간이 모자랄 때 이 앱 내용을 먼저 지우지 않게 부탁해 둬요
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => { if (!p) navigator.storage.persist(); }); } catch (e) {}
