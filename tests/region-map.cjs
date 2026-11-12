/* 여행 지도 — 머리 표지판 → 엽서 아홉 판. 344×882 · 690×829 · 1280×900.
   엽서 · ⚙ select · 집 화면 테마 진열 셋이 같은 길(travel 이 있으면 travel, 없으면 set('theme'))로 지역을 바꾼다 */
const assert=require('node:assert/strict'),{start,FOLD}=require('./browser-harness.cjs');
const ORDER=['kanto','johto','hoenn','sinnoh','unova','kalos','alola','galar','paldea'];
const HALL=JSON.stringify({kanto:['a'],hoenn:['b','c','d']});
const noOverflow=()=>document.documentElement.scrollWidth<=innerWidth&&document.body.scrollWidth<=innerWidth;
(async()=>{
 const h=await start();
 try{
  for(const [viewport,mobile] of [[FOLD.cover,true],[FOLD.inner,true],[{width:1280,height:900},false]]){
   const tag=viewport.width+' ';
   const a=await h.open('index.html',{viewport,mobile,store:['pkm_hall_v1',HALL]}),p=a.page;
   try{
    await p.waitForSelector('.theme-card');
    const sign=p.locator('.workspace-header button.region-sign'),map=p.locator('.region-map');
    assert.equal(await map.count(),0,tag+'처음엔 판이 없다');
    await sign.click();await map.waitFor();
    await p.waitForSelector('.region-map.in');await p.waitForTimeout(350);   /* 올라오는 움직임이 끝난 뒤 */
    assert.equal(await map.getAttribute('role'),'dialog');
    assert.equal(await map.getAttribute('aria-label'),'여행 지도');
    const cards=p.locator('.region-map button.region-card');
    assert.deepEqual(await cards.evaluateAll(es=>es.map(e=>e.dataset.region)),ORDER,tag+'엽서 아홉 · 세대 차례');
    assert.deepEqual(await cards.evaluateAll(es=>es.filter(e=>e.getAttribute('aria-current')==='true').map(e=>e.dataset.region)),['kanto'],tag+'지금 지역');
    assert.match(await p.locator('.region-card[data-region=kanto]').textContent(),/관동.*1세대|1세대.*관동/,tag+'관동 엽서 글');
    assert.match(await p.locator('.region-card[data-region=kanto]').textContent(),/지금 여기/,tag+'도장');
    assert.doesNotMatch(await p.locator('.region-card[data-region=johto]').textContent(),/지금 여기/,tag+'도장은 하나');
    assert.match(await p.locator('.region-card[data-region=paldea]').textContent(),/팔데아.*9세대|9세대.*팔데아/,tag+'팔데아 엽서 글');
    for(const b of await cards.all())assert((await b.boundingBox()).height>=44,tag+'엽서 44px');
    /* 아홉이 다 보이거나, 판이 세로로 굴러 마지막 엽서에 닿는다 */
    const fit=await p.evaluate(()=>{
     const cs=[...document.querySelectorAll('.region-card')],last=cs[cs.length-1];
     let sc=last.parentElement;while(sc&&sc!==document.body&&!/(auto|scroll)/.test(getComputedStyle(sc).overflowY))sc=sc.parentElement;
     const inView=e=>{const r=e.getBoundingClientRect(),v=sc&&sc!==document.body?sc.getBoundingClientRect():{top:0,bottom:innerHeight};return r.top>=v.top-1&&r.bottom<=v.bottom+1&&r.bottom<=innerHeight+1;};
     if(cs.every(inView))return true;
     if(!sc||sc===document.body)return 'no scroller';
     sc.scrollTop=sc.scrollHeight;return inView(last)||'last not reached';
    });
    assert.equal(fit,true,tag+'아홉 다 보임 또는 굴러서 닿음');
    assert(await p.evaluate(noOverflow),tag+'가로 넘침');
    assert(await map.evaluate(e=>[e,...e.querySelectorAll('*')].every(x=>x.scrollWidth<=x.clientWidth+1||getComputedStyle(x).overflowX==='visible'||x.tagName==='IMG')),tag+'판 안 가로 넘침');
    /* 호연 엽서 → 지역 · 표지판 · 진열 현황이 호연 것, 판은 닫힌다 */
    const url=p.url();
    await p.locator('.region-card[data-region=hoenn]').click();
    await map.waitFor({state:'detached'});
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='hoenn',null,{timeout:3000});   /* travel 은 그림을 받고 전환 안에서 바꾼다 */
    assert.equal((await sign.textContent()).trim(),'호연 지방',tag+'표지판 글');
    await p.waitForFunction(()=>{const d=document.querySelector('.lab-status [data-status=hall] dd');return d&&d.textContent==='3 / 12';},null,{timeout:3000});
    await p.waitForTimeout(150);assert.equal(p.url(),url,tag+'엽서 뒤 주소 그대로');
    assert.equal(await p.evaluate(()=>history.state&&history.state.regionMap||0),0,tag+'엽서 뒤 기록에 지도 없음');
    /* Esc · 판 바깥 → 닫히고 초점은 표지판 */
    await sign.click();await map.waitFor();
    assert.equal(await p.locator('.region-card[aria-current=true]').getAttribute('data-region'),'hoenn',tag+'다시 열면 호연이 지금');
    await p.keyboard.press('Escape');await map.waitFor({state:'detached'});
    await p.waitForFunction(()=>document.activeElement&&document.activeElement.classList.contains('region-sign'),null,{timeout:2000});
    await sign.click();await map.waitFor();
    const out=await p.evaluate(()=>{for(let y=2;y<innerHeight;y+=8)for(let x=2;x<innerWidth;x+=8){const e=document.elementFromPoint(x,y);if(e&&e.classList.contains('region-map'))return [x,y];}return null;});
    assert(out,tag+'판 바깥 자리가 있다');
    await p.mouse.click(...out);await map.waitFor({state:'detached'});
    await p.waitForFunction(()=>document.activeElement&&document.activeElement.classList.contains('region-sign'),null,{timeout:2000});
    /* 뒤로 가기 — 판만 닫는다 */
    await sign.click();await map.waitFor();
    await p.goBack();await map.waitFor({state:'detached'});
    assert.equal(p.url(),url,tag+'뒤로 가도 주소 그대로');
    /* ⚙ select — 지역 아홉, 고르면 같은 결과 */
    await p.locator('.appearance-toggle').click();
    const sel=p.locator('.appearance-panel select[aria-label="테마"], .appearance-panel select').first();
    assert.deepEqual(await sel.locator('option').evaluateAll(es=>es.map(e=>e.value)),ORDER,tag+'⚙ 지역 아홉');
    await sel.selectOption('kanto');
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='kanto');
    assert.equal((await sign.textContent()).trim(),'관동 지방',tag+'⚙ 뒤 표지판');
    await p.waitForFunction(()=>document.querySelector('.lab-status [data-status=hall] dd').textContent==='1 / 12');
    await p.keyboard.press('Escape');
    /* 집 화면 진열 — 지역 아홉, 누르면 같은 결과 */
    assert.deepEqual(await p.locator('.theme-card').evaluateAll(es=>es.map(e=>e.dataset.themePreview)),ORDER,tag+'진열 아홉');
    await p.locator('.theme-card[data-theme-preview=hoenn]').click();
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='hoenn');
    assert.equal((await sign.textContent()).trim(),'호연 지방',tag+'진열 뒤 표지판');
    await p.waitForFunction(()=>document.querySelector('.lab-status [data-status=hall] dd').textContent==='3 / 12');
    assert(await p.evaluate(noOverflow),tag+'진열 가로 넘침');
    /* 셋 다 한 길 — 진짜 travel 이 있고, 셋이 그것을 부른다(가짜로 바꿔 끼워 부른 차례를 본다) */
    assert.equal(await p.evaluate(()=>typeof window.AtelierAppearance.travel),'function',tag+'travel 이 있다');
    await p.evaluate(()=>{window.__went=[];const A=window.AtelierAppearance;A.travel=k=>{window.__went.push(k);A.set('theme',k);};});
    await sign.click();await map.waitFor();await p.locator('.region-card[data-region=galar]').click();await map.waitFor({state:'detached'});
    await p.locator('.appearance-toggle').click();await p.locator('.appearance-panel select').first().selectOption('alola');await p.keyboard.press('Escape');
    await p.locator('.theme-card[data-theme-preview=paldea]').click();
    assert.deepEqual(await p.evaluate(()=>window.__went),['galar','alola','paldea'],tag+'세 고르개가 travel 을 부른다');
    assert.deepEqual(a.errors,[]);
   }finally{await a.close()}
   /* 작은 그림을 못 받아도 엽서는 이름 · 세대가 읽히고 멀쩡하다 */
   const b=await h.open('index.html',{viewport,mobile,regionArt:false}),q=b.page;
   try{
    await q.waitForSelector('.theme-card');
    await q.locator('.region-sign').click();await q.locator('.region-map').waitFor();
    await q.waitForTimeout(300);
    for(const [i,key] of ORDER.entries()){
     const c=q.locator('.region-card[data-region='+key+']');
     assert.match(await c.textContent(),new RegExp((i+1)+'세대'),tag+key+' 세대 글');
     assert((await c.boundingBox()).height>=44,tag+key+' 44px');
    }
    assert.equal(await q.evaluate(()=>[...document.querySelectorAll('.region-map img,.theme-gallery img')].filter(i=>i.complete&&!i.naturalWidth).length),0,tag+'깨진 그림 없음');
    assert(await q.evaluate(noOverflow),tag+'그림 없음 가로 넘침');
   }finally{await b.close()}
  }
  /* 구름 전환(travel) — startViewTransition 을 감싸 부른 수와 전환 움직임 길이를 센다. 344×882 만 */
  /* ready 에는 손대지 않는다 — 처리기를 달면 건너뛴 전환의 AbortError 를 삼켜, travel 이 안 받아도 검사가 못 본다.
     길이는 전환이 끝날 때까지 프레임마다 모은다. 처리 안 된 거절은 __rej 에 적고 검사가 비었는지 본다 */
  const COUNT=()=>{window.__rej=[];addEventListener('unhandledrejection',e=>window.__rej.push(String(e.reason&&e.reason.name||e.reason)));
   const o=document.startViewTransition;window.__vt=0;window.__dur=[];if(!o)return;
   document.startViewTransition=function(){window.__vt++;const t=o.apply(this,arguments);let live=true;t.finished.then(()=>live=false,()=>live=false);
    (function tick(){for(const x of document.getAnimations())if(x.effect&&String(x.effect.pseudoElement).startsWith('::view-transition'))window.__dur.push(x.effect.getComputedTiming().endTime);if(live)requestAnimationFrame(tick);})();return t;};};
  const NOVT=()=>{delete Document.prototype.startViewTransition;window.__vt=0;};
  const vt=async opt=>{const c=await h.open('index.html',{viewport:FOLD.cover,mobile:true,...opt});await c.page.waitForSelector('.theme-card');return c;};
  const still=p=>p.waitForFunction(()=>!document.documentElement.classList.contains('travelling'),null,{timeout:3000});
  const pick=async(p,key)=>{await p.locator('.region-sign').click();await p.waitForSelector('.region-map.in');await p.waitForTimeout(350);
   await p.locator('.region-card[data-region='+key+']').click();await p.locator('.region-map').waitFor({state:'detached'});};
  {
   const c=await vt({init:COUNT}),p=c.page;
   try{
    await pick(p,'alola');
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='alola');await still(p);
    assert.equal(await p.evaluate(()=>window.__vt),1,'엽서 하나 → 전환 한 번');
    const dur=await p.evaluate(()=>window.__dur);
    assert(dur.length&&Math.max(...dur)<=800&&Math.max(...dur)>=400,'구름 전환 0.4~0.8초(기본 0.25초 페이드가 아님) — '+dur);
    /* 지금 지역을 다시 → 전환 없이 판만 닫힌다 */
    await pick(p,'alola');await p.waitForTimeout(400);
    assert.equal(await p.evaluate(()=>window.__vt),1,'같은 지역 → 전환 없음');
    assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'alola');
    /* 다른 엽서 둘을 50ms 사이로 → 마지막 지역, 오류 없음, travelling 남지 않음 */
    await p.locator('.region-sign').click();await p.waitForSelector('.region-map.in');await p.waitForTimeout(350);
    await p.evaluate(()=>new Promise(r=>{const a=document.querySelector('.region-card[data-region=kanto]'),b=document.querySelector('.region-card[data-region=galar]');a.click();setTimeout(()=>{b.click();r();},50);}));
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='galar',null,{timeout:3000});await still(p);await p.waitForTimeout(800);
    assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'galar','빠른 두 번 → 마지막');
    assert(!await p.evaluate(()=>document.documentElement.classList.contains('travelling')),'travelling 남지 않음');
    assert.equal(await p.locator('.region-map').count(),0,'판 닫힘');
    /* 첫 전환이 막 시작한 순간(ready 전)에 다음 travel — 건너뛴 전환의 ready 거절(AbortError)을 travel 이 받아야 한다.
       50ms 사이로는 대개 ready 뒤라 거절이 안 생긴다. 다음 그림을 미리 풀어 두고 travelling 이 붙는 순간 부른다 */
    assert.deepEqual(await p.evaluate(async()=>{const A=window.AtelierAppearance,root=document.documentElement,im=new Image();
     im.src=A.regions.kalos.art;await im.decode();
     const mo=new MutationObserver(()=>{if(root.classList.contains('travelling')){mo.disconnect();A.travel('kalos');}});mo.observe(root,{attributes:true,attributeFilter:['class']});
     await A.travel('johto');await new Promise(r=>setTimeout(r,1200));return [root.dataset.theme,root.classList.contains('travelling')];}),['kalos',false],'시작 순간 두 번째 → 마지막 지역');
    /* 다른 탭에서 바꿈(storage) → 전환 없이 */
    const before=await p.evaluate(()=>window.__vt),q=await c.ctx.newPage();
    await q.goto(p.url());await q.waitForFunction(()=>window.AtelierAppearance);await q.evaluate(()=>window.AtelierAppearance.set('theme','paldea'));
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='paldea',null,{timeout:3000});await p.waitForTimeout(300);
    assert.equal(await p.evaluate(()=>window.__vt),before,'storage 사건 → 전환 없음');
    assert.deepEqual(await p.evaluate(()=>window.__rej),[],'처리 안 된 거절 없음(건너뛴 전환의 AbortError)');
    assert.deepEqual(c.errors,[]);
   }finally{await c.close()}
  }
  for(const [name,opt] of [['움직임 줄이기',{init:COUNT,reducedMotion:'reduce'}],['startViewTransition 없음',{init:NOVT}]]){
   const c=await vt(opt),p=c.page;
   try{
    await pick(p,'hoenn');
    await p.waitForFunction(()=>document.documentElement.dataset.theme==='hoenn',null,{timeout:2000});
    assert.equal(await p.evaluate(()=>window.__vt),0,name+' → 전환 없음');
    assert(!await p.evaluate(()=>document.documentElement.classList.contains('travelling')),name+' travelling 없음');
    assert.deepEqual(c.errors,[],name);
   }finally{await c.close()}
  }
  console.log('PASS region-map');
 }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exit(1)});
