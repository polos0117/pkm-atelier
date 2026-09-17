/* Visual choices must load real PNGs and use the same saved prompt parameters. */
const assert=require('node:assert/strict'),{start,FOLD}=require('./browser-harness.cjs');
(async()=>{
 const h=await start();
 try{
  const a=await h.open('prompt.html?mech='+encodeURIComponent('피카츄'));
  const p=a.page;
  await p.waitForSelector('#appearance-settings');
  await p.locator('#appearance-settings details').evaluateAll(es=>es.forEach(e=>e.open=true));
  const body=p.locator('[data-figure-picker="body type"]');
  const hair=p.locator('[data-figure-picker="hairstyle"]');
  assert.equal(await body.locator('img.figure-png').count(),17);
  assert.equal(await hair.locator('img.figure-png').count(),33);
  const choose=(key,value)=>p.locator('[data-figure-picker="'+key+'"] button[data-value="'+value+'"]').click();
  await choose('body type','curvy');
  assert.equal(await p.locator('#param-body-type').inputValue(),'curvy');
  await p.waitForFunction(()=>document.querySelector('[data-figure-picker="body type"] [data-value="curvy"] img')?.naturalWidth>0);
  await choose('hairstyle','bob');
  assert.equal(await p.locator('#param-hairstyle').inputValue(),'bob');
  await p.waitForFunction(()=>document.querySelector('[data-figure-picker="hairstyle"] [data-value="bob"] img')?.naturalWidth>0);
  for(const [key,value] of [['hair color','navy'],['eye color','amber'],['second eye color','blue']]){
   const swatch=p.locator('[data-color-picker="'+key+'"] button[data-value="'+value+'"]');
   await swatch.click();
   assert.equal(await swatch.getAttribute('aria-pressed'),'true');
   assert.notEqual(await swatch.locator('i').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  }
  let output=await p.locator('#prompt-output').inputValue();
  for(const value of ['body type: curvy','hairstyle: bob','hair color: navy','right eye is amber','left eye is blue'])assert(output.includes(value),value);
  await p.getByRole('button',{name:'무작위 변경 잠금 · 머리색',exact:true}).click();
  await p.locator('#randomize').click();
  assert.equal(await p.locator('#param-hair-color').inputValue(),'navy');
  assert.equal(await p.locator('[data-color-picker="hair color"] [aria-pressed="true"]').getAttribute('data-value'),'navy');
  await choose('hairstyle','bob');
  await choose('body type','curvy');
  await p.locator('#param-body-type').selectOption('athletic');
  assert.equal(await body.locator('[aria-pressed="true"]').getAttribute('data-value'),'athletic');
  await p.locator('[data-color-picker="hair color"] [data-value="__custom__"]').click();
  const custom=p.locator('#param-hair-color').locator('xpath=../..').locator('.custom-value input');
  await custom.fill('smoky violet');
  assert((await p.locator('#prompt-output').inputValue()).includes('hair color: smoky violet'));
  await p.reload();
  await p.waitForSelector('#appearance-settings');
  await p.locator('#appearance-settings details').evaluateAll(es=>es.forEach(e=>e.open=true));
  assert.equal(await custom.inputValue(),'smoky violet');
  assert.equal(await p.locator('[data-color-picker="hair color"] [aria-pressed="true"]').getAttribute('data-value'),'__custom__');
  for(const viewport of [FOLD.cover,FOLD.inner,{width:1280,height:900}]){
   await p.setViewportSize(viewport);
   const layout=await body.locator('.figure-choice').evaluateAll(es=>es.map(e=>{
    const r=e.getBoundingClientRect(),label=e.querySelector('b').getBoundingClientRect();
    return {height:r.height,labelY:label.y};
   }));
   assert(layout.every(r=>Math.abs(r.height-layout[0].height)<1&&Math.abs(r.labelY-layout[0].labelY)<1));
   assert(await p.evaluate(()=>document.body.scrollWidth<=innerWidth+1));
   const colors=await p.locator('.color-picker').evaluateAll(es=>es.map(e=>({w:e.clientWidth,s:e.scrollWidth})));
   assert(colors.every(x=>x.s<=x.w+1));
  }
  await p.locator('#identity-mode').selectOption('reference');
  assert.equal(await p.locator('#appearance-settings').count(),0);
  assert(!(await p.locator('#prompt-output').inputValue()).includes('hair color: smoky violet'));
  await p.locator('#identity-mode').selectOption('create');
  assert((await p.locator('#prompt-output').inputValue()).includes('hair color: smoky violet'));
  assert.deepEqual(a.errors,[]);
  assert.deepEqual(await p.evaluate(()=>window.AtelierWords.missing()),[]);
  await a.close();
  const fallback=await h.open('prompt.html');
  await fallback.ctx.route('**/atelier/assets/figures/**',route=>route.abort());
  await fallback.page.reload();
  await fallback.page.waitForSelector('#appearance-settings');
  await fallback.page.locator('#appearance-settings details').nth(1).locator('summary').click();
  const choice=fallback.page.locator('[data-figure-picker="body type"] [data-value="athletic"]');
  await choice.scrollIntoViewIfNeeded();
  await fallback.page.waitForFunction(()=>document.querySelector('[data-figure-picker="body type"] [data-value="athletic"] canvas')?.dataset.figureReady==='body');
  await choice.click();
  assert.equal(await fallback.page.locator('#param-body-type').inputValue(),'athletic');
  assert.deepEqual(fallback.errors,[]);
  await fallback.close();
  console.log('PASS prompt controls: 50 PNG choices, three palettes, prompt values, locks, custom input, reload, reference isolation, fallback and 3 viewport sizes');
 }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
