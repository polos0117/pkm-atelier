/* 화면 머리(시안 A) — 지역 그림 층 · 나무 표지판 · 반투명 제목판. 여덟 화면 · 세 크기.
   그림은 껍데기가 작은 PNG 로 채운다(regionArt:false 면 404 — 오프라인 · 저장소 지연). */
const assert=require('node:assert/strict'),{start,FOLD}=require('./browser-harness.cjs');
const PAGES=[['index.html','.theme-card'],['dex.html','.grid .cell'],['prompt.html','#prompt-output'],['battle.html','.bt-setup'],
 ['run.html','.run-draft'],['lane.html','.ln-screen'],['gwent.html','.gw-screen'],['survey.html','.sv-start']];
/* 글자색과 판 바탕의 대비 — 판은 반투명이라 뒤가 흰 그림이든 검은 그림이든 둘 다 본다(낮은 쪽) */
function worstContrast(sel){
 const el=document.querySelector(sel),c=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
 const px=(under,color)=>{c.clearRect(0,0,1,1);c.fillStyle=under;c.fillRect(0,0,1,1);c.fillStyle=color;c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data].slice(0,3);};
 const lum=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 let plate=el;while(plate&&getComputedStyle(plate).backgroundColor.match(/^rgba\(0, 0, 0, 0\)$|transparent/))plate=plate.parentElement;
 const bg=getComputedStyle(plate).backgroundColor,fg=getComputedStyle(el).color;
 return Math.min(...['#fff','#000'].map(u=>{const a=lum(px(u,fg)),b=lum(px(u,bg));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}));
}
/* 그림 겹(두 번째 배경)이 그림 층을 다 덮나 — 그림은 1536×1024(3:2). cover 거나, 높이 n% 로 키웠으면 그 크기가 층보다 넓고 높아야 한다
   (접힌 머리 · 낮은 화면에서 층이 낮아지면 auto 125% 는 가운데 작은 조각이 된다) */
function artCovers(){
 const e=document.querySelector('.region-hero'),r=e.getBoundingClientRect(),size=getComputedStyle(e).backgroundSize.split(', ').pop();
 if(size==='cover')return true;
 const m=/^auto (\d+(?:\.\d+)?)%$/.exec(size);if(!m)return size;
 const ht=r.height*m[1]/100;return ht>=r.height-.5&&ht*1.5>=r.width-.5||size+' '+r.width+'×'+r.height;
}
(async()=>{
 const h=await start();
 try{
  for(const [viewport,mobile] of [[FOLD.cover,true],[FOLD.inner,true],[{width:1280,height:900},false]]){
   const a=await h.open('index.html',{viewport,mobile}),p=a.page,tag=viewport.width+' ';
   try{
    for(const [file,ready] of PAGES){
     await p.goto(h.base+'/'+file);await p.waitForSelector(ready);
     const hero=p.locator('.workspace-header > .region-hero');
     assert.equal(await hero.count(),1,tag+file+' 그림 층');
     assert.equal(await hero.getAttribute('data-region'),'kanto',tag+file+' data-region');
     assert.match(await hero.evaluate(e=>getComputedStyle(e).backgroundImage),/regions\/kanto\.webp/,tag+file+' 관동 그림');
     const sign=p.locator('.workspace-header button.region-sign');
     assert.equal((await sign.textContent()).trim(),'관동 지방',tag+file+' 표지판 글');
     assert((await sign.boundingBox()).height>=44,tag+file+' 표지판 44px');
     assert(await p.locator('.workspace-header button.scenery-toggle').isVisible(),tag+file+' 풍경 단추');
     assert(await p.evaluate(()=>document.body.scrollWidth<=innerWidth&&document.documentElement.scrollWidth<=innerWidth),tag+file+' 가로 넘침');
     if(viewport.width===344){
      const nav=await p.locator('.workspace-nav').boundingBox();
      assert(nav.y+nav.height<=300,tag+file+' 메뉴 줄 아래끝 ≤ 300: '+(nav.y+nav.height));
     }
     for(const sel of ['.workspace-heading h1','.workspace-heading p','.region-sign>span'])
      assert(await p.evaluate(worstContrast,sel)>=4.5,tag+file+' '+sel+' 대비');
    }
    /* 지역을 바꾸면 그림도 — 아홉 지역 모두 제목판 · 표지판 대비 */
    await p.goto(h.base+'/dex.html');await p.waitForSelector('.grid .cell');
    for(const key of await p.evaluate(()=>window.AtelierAppearance.themes)){
     await p.evaluate(k=>window.AtelierAppearance.set('theme',k),key);
     await p.waitForFunction(k=>document.querySelector('.region-hero').dataset.region===k,key);
     assert.match(await p.locator('.region-hero').evaluate(e=>getComputedStyle(e).backgroundImage),new RegExp('regions/'+key+'\\.webp'),tag+key+' 그림');
     for(const sel of ['.workspace-heading h1','.workspace-heading p','.region-sign>span'])
      assert(await p.evaluate(worstContrast,sel)>=4.5,tag+key+' '+sel+' 대비');
    }
    await p.evaluate(()=>window.AtelierAppearance.set('theme','kanto'));
    /* 도감을 굴려 머리가 접히면 그림 층도 접힌 머리 높이 안으로 */
    const scroll=p.locator('.collection-scroll');
    await scroll.evaluate(e=>{e.scrollTop=300});await p.waitForSelector('main.dex-scrolled');
    const [heroH,headH]=await p.evaluate(()=>[document.querySelector('.region-hero').getBoundingClientRect().height,document.querySelector('.workspace-header').getBoundingClientRect().height]);
    assert(heroH<=headH+.5,tag+' 접힌 머리의 그림 층: '+heroH+' > '+headH);
    assert.equal(await p.evaluate(artCovers),true,tag+' 접힌 머리에서도 그림이 층을 다 덮는다');
    assert.deepEqual(a.errors,[]);
   }finally{await a.close()}
   /* 그림을 못 받는다 — 지역 색 바탕만, 풍경 단추는 숨고, 글자는 그대로 읽힌다 */
   const b=await h.open('dex.html',{viewport,mobile,regionArt:false}),q=b.page;
   try{
    await q.waitForSelector('.region-hero.no-art');
    assert(!await q.locator('.scenery-toggle').isVisible(),tag+' 그림이 없으면 풍경 단추를 숨긴다');
    assert(await q.locator('.region-sign').isVisible(),tag+' 표지판은 남는다');
    for(const sel of ['.workspace-heading h1','.workspace-heading p','.region-sign>span'])
     assert(await q.evaluate(worstContrast,sel)>=4.5,tag+' no-art '+sel+' 대비');
   }finally{await b.close()}
  }
  /* 풍경만 보기 — 344×882 터치. 그림은 진짜 관동 그림(1536×1024)으로 바꿔 끼워 가로로 굴릴 수 있다 */
  for(const reduced of [false,true]){
   const d=await h.open('index.html',{viewport:FOLD.cover,mobile:true,...(reduced?{reducedMotion:'reduce'}:{})}),s=d.page,tag='풍경'+(reduced?'(줄임) ':' ');
   try{
    await s.route('https://polos0117.github.io/pkm-atelier-img-4/regions/kanto.webp',r=>r.fulfill({status:200,contentType:'image/webp',headers:{'Access-Control-Allow-Origin':'*'},body:require('fs').readFileSync('C:/Users/jjshs/pkm-region-art/kanto.webp')}));
    await s.goto(h.base+'/dex.html');await s.waitForSelector('.grid .cell');
    const dexUrl=s.url();
    assert.equal(await s.locator('div.scenery').count(),0,tag+'처음엔 없다');
    /* 빈 곳(그림 층)을 눌러도 열린다 — 표지판 · 단추가 아닌 노출된 그림 자리 */
    const tap=await s.evaluate(()=>{const hh=document.querySelector('.workspace-header').getBoundingClientRect();
     for(let y=hh.top+2;y<hh.bottom;y+=6)for(let x=2;x<innerWidth;x+=6){const e=document.elementFromPoint(x,y);if(e&&e.classList.contains('workspace-header'))return [x,y];}return null;});
    assert(tap,tag+'머리에 노출된 그림 자리가 있다');
    await s.mouse.click(...tap);
    await s.waitForSelector('div.scenery');
    await s.locator('.scenery-close').click();await s.waitForSelector('div.scenery',{state:'detached'});
    await s.locator('.scenery-toggle').click();await s.waitForSelector('div.scenery');
    await s.waitForFunction(()=>document.documentElement.classList.contains('scenery'),null,{timeout:2000});
    assert.equal(await s.locator('div.scenery').getAttribute('role'),'dialog');
    assert.equal(await s.locator('div.scenery').getAttribute('aria-label'),'풍경만 보기');
    assert.equal(await s.locator('.scenery-close').getAttribute('aria-label'),'풍경 닫기');
    assert((await s.locator('.scenery-close').boundingBox()).height>=44,tag+'닫기 44px');
    await s.waitForFunction(()=>{const i=document.querySelector('div.scenery img');return i&&i.complete&&i.naturalWidth>2});
    await s.waitForTimeout(500);
    for(const sel of ['.workspace-nav','.collection-scroll'])
     assert.equal(await s.locator(sel).evaluate(e=>{const c=getComputedStyle(e);return c.visibility==='hidden'||+c.opacity===0}),true,tag+sel+' 사라진다');
    const g=await s.evaluate(()=>{const sc=document.querySelector('div.scenery'),i=sc.querySelector('img');return {iw:i.getBoundingClientRect().width,vw:innerWidth,ih:i.getBoundingClientRect().height,vh:innerHeight,o:document.documentElement.scrollWidth<=innerWidth}});
    assert(g.iw>g.vw,tag+'그림 폭 > 화면 폭 '+JSON.stringify(g));
    assert(Math.abs(g.ih-g.vh)<=1,tag+'그림 높이 = 화면 높이 '+JSON.stringify(g));assert(g.o,tag+'가로 넘침');
    const moved=await s.evaluate(()=>{const sc=document.querySelector('div.scenery'),a=sc.scrollLeft;sc.scrollLeft=a>50?a-40:a+40;return Math.abs(sc.scrollLeft-a)>=1});
    assert(moved,tag+'가로로 굴린다');
    if(reduced)assert.equal(await s.evaluate(()=>[getComputedStyle(document.querySelector('div.scenery')).transitionDuration,getComputedStyle(document.querySelector('.workspace-nav')).transitionDuration].join()),'0s,0s',tag+'전환 0');
    /* 뒤로 가기 — 풍경만 닫는다 */
    await s.goBack();await s.waitForSelector('div.scenery',{state:'detached'});
    assert.equal(s.url(),dexUrl,tag+'뒤로 가도 주소 그대로');
    await s.waitForFunction(()=>!document.documentElement.classList.contains('scenery'),null,{timeout:2000});
    /* Esc · 닫기 단추 — 기록을 남기지 않는다 */
    await s.locator('.scenery-toggle').click();await s.waitForSelector('div.scenery');
    await s.keyboard.press('Escape');await s.waitForSelector('div.scenery',{state:'detached'});
    await s.waitForTimeout(100);assert.equal(s.url(),dexUrl,tag+'Esc 뒤 주소');
    assert.equal(await s.evaluate(()=>history.state&&history.state.scenery||0),0,tag+'Esc 뒤 기록에 풍경 없음');
    await s.locator('.scenery-toggle').click();await s.waitForSelector('div.scenery');
    await s.locator('.scenery-close').click();await s.waitForSelector('div.scenery',{state:'detached'});
    await s.waitForTimeout(100);assert.equal(await s.evaluate(()=>history.state&&history.state.scenery||0),0,tag+'닫기 뒤 기록');
    /* 접힌 상태(dex-scrolled)에서도 — 표지판 줄은 접혀 숨으니 ⚙ 안의 단추로 */
    await s.locator('.collection-scroll').evaluate(e=>{e.scrollTop=300});await s.waitForSelector('main.dex-scrolled');
    assert(!await s.locator('.scenery-toggle').isVisible(),tag+'접히면 머리 단추는 숨는다');
    await s.locator('.appearance-toggle').click();
    const inPanel=s.locator('.appearance-panel .scenery-open');
    assert((await inPanel.boundingBox()).height>=44,tag+'설정 안 단추 44px');
    await inPanel.click();await s.waitForSelector('div.scenery');
    await s.keyboard.press('Escape');await s.waitForSelector('div.scenery',{state:'detached'});
    assert.deepEqual(d.errors,[]);
   }finally{await d.close()}
  }
  /* 그림을 못 받으면 설정 안 단추도 숨는다 */
  {const e=await h.open('dex.html',{viewport:FOLD.cover,mobile:true,regionArt:false}),t=e.page;
   try{await t.waitForSelector('.region-hero.no-art');await t.locator('.appearance-toggle').click();
    assert.equal(await t.locator('.appearance-panel .scenery-open').count(),0,'no-art 설정 안 풍경 단추');}finally{await e.close()}}
  /* 낮은 화면(max-height:550) — 머리는 메뉴 줄뿐. 좁은 분할 화면(560×400)과 가로 폰(844×390), 굴려 접혀도 그림이 층을 다 덮는다 */
  for(const viewport of [{width:560,height:400},{width:844,height:390}]){
   const c=await h.open('dex.html',{viewport,mobile:true}),r=c.page;
   try{
    await r.waitForSelector('.grid .cell');
    assert.equal(await r.evaluate(artCovers),true,viewport.width+'×'+viewport.height+' 낮은 화면의 그림 층');
    await r.locator('.collection-scroll').evaluate(e=>{e.scrollTop=300});await r.waitForSelector('main.dex-scrolled');
    assert.equal(await r.evaluate(artCovers),true,viewport.width+'×'+viewport.height+' 낮은 화면 · 접힘의 그림 층');
    assert.deepEqual(c.errors,[]);
   }finally{await c.close()}
  }
  console.log('PASS region header: 8 pages × 3 sizes — region art layer, wooden sign 44px, translucent plate contrast in 9 regions, nav ≤ 300px on cover, no-art fallback, folds with dex scroll, art covers the folded and short-screen hero');
 }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
