// 모든 탭, 모든 무늬 상세, 무늬마다 카운터 보기를 열어 보며 JS 오류가 없는지 확인해요. 실행: node tools/smoke.mjs
import { chromium } from "/opt/node-tools/node_modules/playwright/index.mjs";
import http from "http"; import fs from "fs"; import path from "path";
const root=new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const srv=http.createServer((q,r)=>{let p=path.join(root,decodeURIComponent(q.url.split("?")[0])); if(p.endsWith("/"))p+="index.html"; fs.readFile(p,(e,d)=>{if(e){r.writeHead(404);r.end();return;} r.writeHead(200,{"content-type":{".js":"text/javascript",".css":"text/css",".html":"text/html",".webp":"image/webp",".png":"image/png",".svg":"image/svg+xml"}[path.extname(p)]||"x"});r.end(d);});}).listen(8840);
const b=await chromium.launch({executablePath:"/opt/pw-browsers/chromium"}); const errs=[]; let n=0;
const p=await (await b.newContext({viewport:{width:390,height:844},serviceWorkers:"block"})).newPage(); p.on("pageerror",e=>errs.push(e.message)); p.on("dialog",d=>d.accept());
await p.goto("http://localhost:8840/"); await p.waitForTimeout(500);
for (const t of ["basket","patterns","projects","counter","guide"]) { await p.click("#tab-"+t); await p.waitForTimeout(150); n++; }
for (const craft of ["knit","crochet"]) {
  await p.evaluate(c=>{state.craft=c; state.tab="patterns"; state.mode="all"; render();}, craft); await p.waitForTimeout(200);
  const ids=await p.evaluate(c=>PATTERNS[c].map(x=>x.id), craft);
  for (const id of ids) {
    await p.evaluate(id=>{state.detail=id; state.pv=null; $("sheet-pat").hidden=false; renderDetail(); openSheet("sheet-pat");}, id); await p.waitForTimeout(120);
    for (const v of await p.$$eval("#sheet-pat [data-dv]", bs=>bs.map(b=>b.dataset.dv))) { await p.click(`#sheet-pat [data-dv="${v}"]`); await p.waitForTimeout(80); }
    await p.evaluate(()=>closeSheets()); n++;
    // 카운터 하나 만들어서 모든 보기 열기
    await p.evaluate(([c,id])=>{state.sessions=[{id:"t",craft:c,pid:id,cols:[],row:2,st:0,stAuto:true,at:Date.now(),mode:"flat",target:20,n:22,w:20,l:20}]; state.sess="t"; state.tab="counter"; ctrUI.view=null; render();}, [craft,id]); await p.waitForTimeout(120);
    for (const v of await p.$$eval("[data-cv]", bs=>bs.map(b=>b.dataset.cv))) { await p.click(`[data-cv="${v}"]`); await p.waitForTimeout(120);
      const blank = await p.evaluate(()=>[...document.querySelectorAll("#v-counter canvas[data-pw], #v-counter canvas[data-prog]")].filter(cv=>{ const d=cv.getContext("2d").getImageData(0,0,cv.width,cv.height).data; for(let i=3;i<d.length;i+=40) if(d[i]) return false; return true; }).length);
      if (blank) errs.push(`빈 그림: ${craft}/${id} 카운터 '${v}' 보기`); }
    if (await p.locator(".ctr-dock").count()) { await p.click(".ctr-dock .done-btn"); await p.click(".ctr-dock .dock-undo"); } n++;
  }
}
console.log("checked", n, errs.length?errs:"no errors"); await b.close(); srv.close();
