/* Tab changes must preserve the shared header's geometry, including native scrollbars. */
const assert=require('node:assert/strict'),{start,FOLD}=require('./browser-harness.cjs');
const selectors=['.workspace-heading','.workspace-heading h1','.workspace-nav',
 '.workspace-nav a:nth-child(1)','.workspace-nav a:nth-child(2)','.workspace-nav a:nth-child(3)',
 '.appearance-controls','.appearance-controls label:first-child select','.appearance-controls label:last-child select'];
async function geometry(p){
 return p.evaluate(ss=>Object.fromEntries(ss.map(s=>{
  const e=document.querySelector(s),r=e.getBoundingClientRect();
  return [s,{x:r.x,y:r.y,width:r.width,height:r.height,visible:getComputedStyle(e).display!=='none'}];
 })),selectors);
}
function same(actual,expected,label){
 for(const s of selectors){
  assert.equal(actual[s].visible,expected[s].visible,label+' '+s+' visibility');
  if(!expected[s].visible)continue;
  // Titles have different text lengths; their starting point and line height still agree.
  for(const k of s.endsWith('h1')?['x','y','height']:['x','y','width','height'])
   assert(Math.abs(actual[s][k]-expected[s][k])<=1,`${label} ${s} ${k}: ${actual[s][k]} vs ${expected[s][k]}`);
 }
}
(async()=>{
 const h=await start();
 try{
  for(const [viewport,mobile] of [[FOLD.cover,true],[FOLD.inner,true],
   [{width:1280,height:900},false],[{width:1920,height:1080},false],[{width:882,height:344},true]]){
   const a=await h.open('index.html',{viewport,mobile}),p=a.page;
   try{
    for(const density of ['compact','relaxed']){
     await p.goto(h.base+'/index.html');await p.waitForSelector('.workspace-nav');
     await p.evaluate(d=>window.AtelierAppearance.set('density',d),density);
     const reference=await geometry(p);
     for(const [file,ready] of [['dex.html','.grid .cell'],['prompt.html','#prompt-output'],['battle.html','.bt-setup'],['index.html','.theme-card']]){
      await p.locator(`.workspace-nav a[href="${file}"]`).click();
      await p.waitForSelector(ready);
      same(await geometry(p),reference,`${viewport.width} ${density} ${file}`);
      assert(await p.evaluate(()=>document.body.scrollWidth<=innerWidth),'horizontal overflow');
      const scroll=p.locator(file==='dex.html'||file==='battle.html'?'.collection-scroll':'.wrap');
      assert((await scroll.boundingBox()).height>100,file+' usable scroll viewport');
      if(file==='dex.html'){
       await scroll.evaluate(e=>{e.scrollTop=300});
       await p.waitForSelector('main.dex-scrolled');
       same(await geometry(p),reference,'dex scroll keeps navigation in place');
      }
     }
    }
    assert.deepEqual(a.errors,[]);
   }finally{await a.close()}
  }
  console.log('PASS header layout: 4 pages, 5 viewport sizes, both densities, stable navigation while scrolling');
 }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
