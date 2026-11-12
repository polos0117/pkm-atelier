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
    assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'hoenn',tag+'호연으로');
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
    /* 셋 다 한 길 — travel 이 생기면(Task 7) 그것을 부른다 */
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
  console.log('PASS region-map');
 }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exit(1)});
