/* Shared themes across the laboratory, collection, and prompt studio. */
const assert=require('node:assert/strict'),{start,FOLD}=require('./browser-harness.cjs');
const luminance=hex=>{
 const c=hex.trim().slice(1).match(/../g).map(x=>parseInt(x,16)/255)
  .map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
 return c[0]*.2126+c[1]*.7152+c[2]*.0722;
};
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
(async()=>{
 const harness=await start();
 try{
  const a=await harness.open('index.html',{viewport:{width:1280,height:900}});
  const p=a.page;
  await p.waitForSelector('.theme-card');
  assert.equal(await p.locator('.theme-card').count(),8);
  assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'daylight');
  const keys=await p.evaluate(()=>window.AtelierAppearance.themes);
  const marks=new Set(),backgrounds=new Set();
  for(const key of keys){
   await p.locator('[data-theme-preview="'+key+'"]').click();
   await p.waitForFunction(k=>document.documentElement.dataset.theme===k,key);
   assert.equal(await p.locator('.theme-card[aria-pressed="true"]').getAttribute('data-theme-preview'),key);
   const colors=await p.evaluate(()=>{
    const s=getComputedStyle(document.documentElement),out={};
    for(const k of ['bg','card','card2','text','muted','accent','accent-soft','on-accent','deck'])out[k]=s.getPropertyValue('--'+k).trim();
    return out;
   });
   for(const [fg,bg] of [['text','bg'],['text','card'],['muted','bg'],['muted','card2'],['accent','accent-soft'],['on-accent','accent']])
    assert(contrast(colors[fg],colors[bg])>=4.5,key+' '+fg+'/'+bg+': '+contrast(colors[fg],colors[bg]));
   assert.equal(await p.locator('meta[name="theme-color"]').getAttribute('content'),colors.deck);
   /* 캡슐 벽은 어느 테마에서나 어두운 흑연색 */
   const wall=await p.locator('.bay-wall').evaluate(e=>getComputedStyle(e).backgroundColor);
   const rgb=wall.match(/\d+/g).slice(0,3).map(Number);
   assert(luminance('#'+rgb.map(n=>n.toString(16).padStart(2,'0')).join(''))<.03,key+' capsule wall stays dark: '+wall);
   backgrounds.add(colors.bg);
   marks.add(await p.locator('.workspace-title svg').innerHTML());
  }
  assert.equal(backgrounds.size,8);assert.equal(marks.size,8);
  /* 머리말 오른쪽 상태줄 — 장식이 아니라 실제 수치(등록 종·그림 수·진열·마지막 패치일) */
  const fs=require('node:fs'),img=JSON.parse(fs.readFileSync('data/img.json','utf8')).img;
  const files=JSON.stringify(img).match(/\.webp"/gi).length,patch=fs.readFileSync('docs/PATCH.md','utf8').match(/\n## (\d{4})-(\d{2})-(\d{2})/);
  await p.waitForSelector('.lab-status [data-status="patch"]');
  const status=await p.locator('.lab-status div').evaluateAll(es=>Object.fromEntries(es.map(e=>[e.dataset.status,e.querySelector('dd').textContent])));
  assert.equal(status.species,Object.keys(img).length.toLocaleString('ko-KR')+'종');
  assert.equal(status.images,files.toLocaleString('ko-KR')+'장');
  assert.equal(status.hall,(await p.evaluate(()=>window.AtelierImg.hallPicks().length))+' / 12');
  assert.equal(status.patch,patch[2]+'.'+patch[3]);
  assert.equal(await p.locator('.workspace-heading .eyebrow, .crest-signature').count(),0,'no decorative header layers');
  for(const [page,selector] of [['dex.html','.grid .cell'],['prompt.html','#prompt-output'],['battle.html','.bt-setup'],['run.html','.run-draft'],['lane.html','.ln-screen'],['gwent.html','.gw-screen'],['survey.html','.sv-start'],['index.html','.theme-card']]){
   await p.goto(harness.base+'/'+page);await p.waitForSelector(selector);
   const nav=await p.locator('.workspace-nav a').evaluateAll(es=>es.map(e=>({
    href:e.getAttribute('href'),current:e.getAttribute('aria-current'),decoration:getComputedStyle(e).textDecorationLine
   })));
   assert.deepEqual(nav.map(x=>x.href),['index.html','dex.html','prompt.html','battle.html','run.html','lane.html','gwent.html','survey.html'],page+' common navigation');
   assert.deepEqual(nav.filter(x=>x.current==='page').map(x=>x.href),[page],page+' selected tab');
   assert(nav.every(x=>x.decoration==='none'),page+' navigation underlines');
   assert(await p.evaluate(()=>{
    const heading=document.querySelector('.workspace-heading'),nav=document.querySelector('.workspace-nav'),
     controls=document.querySelector('.appearance-controls');
    return !!(heading.compareDocumentPosition(nav)&Node.DOCUMENT_POSITION_FOLLOWING)&&
     !!(nav.compareDocumentPosition(controls)&Node.DOCUMENT_POSITION_FOLLOWING);
   }),page+' heading, navigation, appearance order');
   assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),'ember','theme follows navigation');
   const before=page==='prompt.html'?await p.locator('#prompt-output').inputValue():null;
   for(const key of keys){
    /* 테마는 ⚙ 패널 안에 있다. 머리가 다시 그려지면 패널이 닫힐 수 있어 매번 본다 */
    if(!await p.locator('.appearance-panel').count())await p.locator('.appearance-toggle').click();
    await p.getByLabel('테마',{exact:true}).selectOption(key);
    assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),key);
    if(before)assert.equal(await p.locator('#prompt-output').inputValue(),before,'appearance never changes the prompt');
   }
   for(const viewport of [FOLD.cover,FOLD.inner,{width:1280,height:900}]){
    await p.setViewportSize(viewport);
    const size=await p.evaluate(()=>({
     body:document.body.scrollWidth,width:innerWidth,
     scroll:(document.querySelector('.collection-scroll')||document.querySelector('.wrap')).clientHeight
    }));
    assert(size.body<=size.width+1,page+' horizontal overflow: '+JSON.stringify(size));
    assert(size.scroll>100,page+' scroll area collapsed');
    if(!await p.locator('.appearance-panel').count())await p.locator('.appearance-toggle').click();
    const theme=await p.getByLabel('테마',{exact:true}).boundingBox();
    assert(theme.x>=0&&theme.x+theme.width<=viewport.width+1,page+' theme selector clipped');
   }
  }
  assert.deepEqual(a.errors,[]);
  assert.deepEqual(await p.evaluate(()=>window.AtelierWords.missing()),[]);
  await a.close();
  console.log('PASS theme screens: 8 palettes and motifs, dark capsule wall, lab status line, AA text contrast, persisted navigation, unchanged prompts, 3 viewports');
 }finally{await harness.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
