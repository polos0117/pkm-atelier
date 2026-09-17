/* Normal armor above its matching overdrive, including missing and legacy art. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {start,FOLD}=require('./browser-harness.cjs');
const data=JSON.parse(fs.readFileSync('data/img.json','utf8'));
const name=Object.keys(data.img)[0],style=Object.keys(data.img[name].byStyle)[0];
const forms=['light','heavy','mobility'];
const slots=[...forms,...forms.map(f=>f+'_overdrive')];
const bucket=data.img[name].byStyle[style];
const files=forms.map(f=>bucket.byForm[f].f);
const action=bucket.casual.f[0];
forms.forEach((f,i)=>bucket.byForm[f+'_overdrive']={f:files[(i+1)%3]});
bucket.byForm.heavy_overdrive.action={f:[action]};
const swap=doc=>[function(doc){
 const real=window.fetch;
 window.fetch=(url,opt)=>String(url).includes('data/img.json')?
  Promise.resolve(new Response(JSON.stringify(doc))):real(url,opt);
},doc];
async function openCard(p){
 await p.locator('.search-row input').fill(name);
 await p.locator('.grid .cell').first().click();
 await p.waitForSelector('.fstrip .fcell');
}
(async()=>{
 const h=await start();
 try{
  const a=await h.open('dex.html',{init:swap(data)}),p=a.page;
  await openCard(p);
  assert.deepEqual(await p.locator('.fstrip .fcell').evaluateAll(es=>es.map(e=>e.dataset.form)),slots);
  assert.equal(await p.getByText(/^없는 폼도/).count(),0);
  assert.equal(await p.locator('.bar .n').textContent(),'폼 6 / 6');
  assert.equal(await p.locator('.fcell:disabled').count(),0);
  for(const viewport of [FOLD.cover,FOLD.inner,{width:1280,height:900}]){
   await p.setViewportSize(viewport);
   const rects=await p.locator('.fcell').evaluateAll(es=>es.map(e=>{
    const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};
   }));
   assert(rects.slice(0,3).every(r=>Math.abs(r.y-rects[0].y)<1));
   assert(rects.slice(3).every((r,i)=>Math.abs(r.y-rects[3].y)<1&&Math.abs(r.x-rects[i].x)<1));
   assert(rects[3].y>=rects[0].bottom);
   assert(rects.every(r=>r.x>=0&&r.right<=viewport.width));
   assert(await p.locator('.collection-scroll').evaluate(e=>e.clientHeight>150&&e.scrollHeight>e.clientHeight));
  }
  for(const [i,f] of slots.entries()){
   await p.locator('.fcell[data-form="'+f+'"]').click();
   const expected=i<3?files[i]:files[(i-3+1)%3];
   await p.waitForFunction(file=>decodeURIComponent(document.querySelector('.big img').src).endsWith(file),expected);
   assert.equal(await p.locator('.fcell[aria-pressed="true"]').getAttribute('data-form'),f);
   assert.equal(await p.locator('.form-actions').count(),f==='heavy_overdrive'?1:0);
  }
  assert.deepEqual(a.errors,[]);
  assert.deepEqual(await p.evaluate(()=>window.AtelierWords.missing()),[]);
  await a.close();
  const legacy=await h.open('dex.html'),q=legacy.page;
  await openCard(q);
  assert.equal(await q.locator('.fcell:disabled').count(),3);
  assert.equal(await q.locator('.bar .n').textContent(),'폼 3 / 6');
  assert.equal(await q.locator('.legacy-overdrive img').count(),1);
  await q.locator('.legacy-overdrive summary').click();
  await q.locator('.legacy-overdrive img').scrollIntoViewIfNeeded();
  assert(await q.locator('.legacy-overdrive img').evaluate(i=>decodeURIComponent(i.src).includes('_overdrive_')));
  assert.deepEqual(legacy.errors,[]);
  await legacy.close();
  console.log('PASS dex layout: six matched slots, state-specific images/actions, legacy art and 3 viewport sizes');
 }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
