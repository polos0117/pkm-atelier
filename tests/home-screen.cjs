/* Six viewports, persistence, image failures, family sampling and entry/exit paths. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {start}=require('./browser-harness.cjs');
const cards=Object.values(require('../data/card.json').cards).flat();
const species=['피카츄','이상해씨','파이리','꼬부기'];
const fixtures={img:{
 [species[0]]:{byStyle:{glossy_promo:{byForm:{light:{f:'__home_light.png'},light_overdrive:{f:'__home_light_overdrive.png'}}}}},
 [species[1]]:{byStyle:{glossy_promo:{byForm:{heavy:{f:'__home_heavy.png'}}}}},
 [species[2]]:{byStyle:{other:{byForm:{mobility:{f:'__home_broken.png'}}}}}
}};
function seed({picks,images}){
 localStorage.setItem('atelier_theme_v1','daylight');
 if(picks)localStorage.setItem('pkm_hall_v1',JSON.stringify(picks));
 if(images){const original=window.fetch;window.fetch=function(url,...args){return String(url).includes('data/img.json')?Promise.resolve(new Response(JSON.stringify(images),{headers:{'Content-Type':'application/json'}})):original.call(this,url,...args);};}
}
const sizes=[[344,882],[390,844],[844,390],[882,344],[690,829],[1280,900]];
const overflow=p=>p.evaluate(()=>document.body.scrollWidth>innerWidth||document.documentElement.scrollWidth>innerWidth);
const ready=p=>p.waitForSelector('.capsule',{timeout:6000});
(async()=>{
 const h=await start(),temp=[];
 try{
  // Only the original exists for light: its absent thumbnail must fall back once.
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aEioAAAAASUVORK5CYII=','base64');
  for(const file of ['__home_light.png','__home_light_overdrive.png','__home_heavy.png']){
   const out=path.resolve(__dirname,'../img',file);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,png);temp.push(out);
  }
  for(const [width,height] of sizes){
   const a=await h.open('index.html',{viewport:{width,height},mobile:width<1000,init:[seed,{picks:{daylight:species},images:fixtures}]}),p=a.page;
   try{
    await ready(p);
    assert.deepEqual(await p.locator('.capsule').evaluateAll(es=>es.map(e=>e.dataset.name)),species,'saved order');
    assert.equal(await overflow(p),false,width+' page overflow');
    const visible=await p.locator('.capsule').evaluateAll(es=>{const row=es[0].parentElement.getBoundingClientRect();return es.filter(e=>{const r=e.getBoundingClientRect();return r.right>row.left&&r.left<row.right;}).length;});
    assert(visible>=3,width+' at least three capsules visible: '+visible);
    if(height<550){const r=await p.locator('.capsule').first().boundingBox();assert(r.y>=0&&r.y+r.height<=height,width+' capsule fully within viewport '+JSON.stringify(r));}
    const first=p.locator('.capsule').first();
    await p.waitForFunction(()=>{const i=document.querySelector('.capsule img');return i&&i.complete&&i.naturalWidth>0;});
    assert.equal(await first.locator('.capsule-normal').getAttribute('data-fallback'),'1','thumbnail falls back');
    assert(!(await first.locator('.capsule-normal').getAttribute('src')).includes('/thumb/'));
    await p.waitForFunction(()=>!document.querySelectorAll('.capsule')[2].querySelector('img'));
    assert.equal(await p.locator('.capsule').nth(3).locator('img').count(),0,'no art leaves nameplate');
    const src=await p.locator('.capsule img').evaluateAll(es=>es.map(e=>e.src));
    await p.locator('.bay-overdrive').click();
    await p.waitForFunction(()=>getComputedStyle(document.querySelector('.capsule-overdrive')).opacity==='1');
    assert((await first.locator('.capsule-overdrive').getAttribute('src')).includes('_overdrive'));
    assert.equal(await p.locator('.capsule').nth(1).locator('.capsule-overdrive').count(),0,'missing overdrive stays normal');
    assert.deepEqual(await p.locator('.capsule img').evaluateAll(es=>es.map(e=>e.src)),src,'toggle reuses loaded elements and URLs');
    await p.locator('.bay-overdrive').click();
    await first.click();await p.waitForSelector('.capsule-info');
    assert.equal(await first.getAttribute('aria-expanded'),'true');
    assert.equal(await p.locator('#capsule-title').innerText(),species[0]);
    assert((await p.locator('.capsule-info').innerText()).includes('No.0025'));
    assert((await p.locator('.capsule-info .capsule-types').innerText()).includes('전기'));
    assert.equal(await p.locator('.bay-doors a').first().getAttribute('href'),'dex.html?mech='+encodeURIComponent(species[0]));
    assert.equal(await p.locator('.bay-doors a').nth(1).getAttribute('href'),'prompt.html?mech='+encodeURIComponent(species[0]));
    assert.equal(await overflow(p),false,width+' opened overflow');
    if(height<550){const row=await p.locator('.bay-wall').boundingBox(),info=await p.locator('.capsule-info').boundingBox();assert(info.x>=row.x+row.width,'landscape info on right');}
    await p.keyboard.press('Escape');assert.equal(await p.locator('.capsule-info').count(),0);
    assert.equal(await first.evaluate(e=>e===document.activeElement),true,'Esc returns focus');
    await first.click();await p.locator('.bay-doors button').click();assert.equal(await p.locator('.capsule-info').count(),0,'close button');
    await first.click();await p.locator('.lab-intro h2').click();assert.equal(await p.locator('.capsule-info').count(),0,'outside click');
    assert(!p.url().includes('?'),'home opening is ephemeral');
    assert.deepEqual(await p.locator('.lab-links a').evaluateAll(es=>es.map(e=>e.getAttribute('href'))),['dex','prompt','battle','run','lane','gwent','survey'].map(k=>k+'.html'));
    await p.emulateMedia({reducedMotion:'reduce'});
    assert.equal(await p.locator('.capsule-bubbles i').first().evaluate(e=>getComputedStyle(e).animationName),'none');
    assert.deepEqual(a.errors,[]);assert.deepEqual(await p.evaluate(()=>window.AtelierWords.missing()),[]);
    console.log('PASS home viewport '+width+'x'+height);
   }finally{await a.close();}
  }
  const a=await h.open('index.html'),p=a.page;
  try{
   await ready(p);const names=await p.locator('.capsule').evaluateAll(es=>es.map(e=>e.dataset.name));
   assert(names.length>=1&&names.length<=12);
   const family=n=>{const c=cards.find(c=>c.name===n);return c.from?family(c.from):n;};
   assert.equal(new Set(names.map(family)).size,names.length,'random selection has one per evolution family');
   await p.evaluate(()=>{window.AtelierImg.setHallPicks(['피카츄'],'daylight');window.AtelierImg.setHallPicks(['파이리'],'midnight');});
   await p.waitForFunction(()=>document.querySelector('.capsule')?.dataset.name==='피카츄');
   await p.evaluate(()=>window.AtelierAppearance.set('theme','midnight'));
   await p.waitForFunction(()=>document.querySelector('.capsule')?.dataset.name==='파이리');
   await p.reload();await ready(p);assert.equal(await p.locator('.capsule').first().getAttribute('data-name'),'파이리','theme picks survive reload');
   const results=await p.evaluate(names=>{const I=window.AtelierImg;I.setHallPicks(names);return [I.toggleHall('additional'),I.hallPicks().length,I.toggleHall(names[0]),I.hallPicks().length];},cards.slice(0,12).map(c=>c.name));
   assert.equal(results[0].why,'full');assert.equal(results[1],12);assert.equal(results[2].on,false);assert.equal(results[3],11);
  }finally{await a.close();}
  const d=await h.open('dex.html?mech='+encodeURIComponent(species[0]),{init:[seed,{picks:{daylight:[]}}]}),q=d.page;
  try{
   await q.waitForSelector('#detail-title');assert.equal(await q.locator('#detail-title').innerText(),species[0]);
   await q.locator('#dex-hall').click();assert.equal(await q.locator('#dex-hall').getAttribute('aria-pressed'),'true');
   await q.locator('#dex-hall').click();assert.equal(await q.locator('#dex-hall').getAttribute('aria-pressed'),'false');
   await q.evaluate(names=>window.AtelierImg.setHallPicks(names),cards.filter(c=>c.name!==species[0]).slice(0,12).map(c=>c.name));
   assert(await q.locator('#dex-hall').isDisabled(),'full display disables addition');
   await q.evaluate(()=>window.AtelierAppearance.set('theme','midnight'));assert(!await q.locator('#dex-hall').isDisabled(),'new theme has room');
   await q.locator('.back').click();await q.waitForSelector('.grid .cell');assert(!q.url().includes('mech='),'back reaches clean list URL');
   await q.goto(h.base+'/dex.html?mech=not-a-species');await q.waitForSelector('.grid .cell');assert.equal(await q.locator('#detail-title').count(),0);
   assert.deepEqual(d.errors,[]);
  }finally{await d.close();}
  console.log('PASS home state: family sampling, theme persistence, capacity, dex deep links and display button');
 }finally{await h.stop();for(const file of temp)fs.unlinkSync(file);}
})().catch(e=>{console.error(e);process.exitCode=1;});
