/* Browser contracts for the three image modes and approved-reference workflow.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/prompt-screen.cjs */
const fs=require('node:fs'),assert=require('node:assert/strict');
const {start,FOLD}=require('./browser-harness.cjs');
const groups=JSON.parse(fs.readFileSync('data/group.json','utf8'));
(async()=>{
 const harness=await start();
 try{
  const a=await harness.open('prompt.html?mech='+encodeURIComponent('피카츄'),{viewport:FOLD.inner,mobile:true});
  const p=a.page;
  await p.waitForFunction(()=>document.querySelector('#prompt-output')?.value.includes('[FINAL CHECK]'));
  const text=()=>p.locator('#prompt-output').inputValue();
  const settled=()=>p.waitForTimeout(90);
  assert.equal(await p.locator('#source').inputValue(),'피카츄','dex deep link');
  assert.deepEqual(await p.locator('#group option').evaluateAll(es=>es.slice(1).map(e=>e.textContent)),
   groups.order.map(k=>groups.name[k]));
  assert.equal(await p.locator('#style option').count(),12);
  assert((await text()).includes('INITIAL CHARACTER REFERENCE SHEET'));
  assert((await text()).startsWith('[GENERATION INPUT]'));
  assert((await text()).includes('No input image is required'));
  assert((await p.locator('#identity-note').innerText()).includes('첨부 없이'));
  assert((await p.locator('#output-mode-note').innerText()).includes('확대컷'));
  await p.locator('#appearance-settings details').nth(1).locator('summary').click();
  await p.locator('#param-body-type').selectOption('athletic');
  await p.locator('#param-apparent-age').selectOption('30s');
  await settled();
  assert((await text()).includes('body type: athletic'));
  assert.equal(await p.locator('[data-figure-picker="body type"] [data-value="athletic"][aria-pressed="true"]').count(),1);
  // A locked field must survive randomization.
  await p.getByRole('button',{name:'무작위 변경 잠금 · 체형',exact:true}).click();
  await p.locator('#randomize').click();await settled();
  assert.equal(await p.locator('#param-body-type').inputValue(),'athletic');
  await p.locator('#identity-mode').selectOption('reference');await settled();
  assert.equal(await p.locator('#appearance-settings').count(),0);
  assert(!(await text()).includes('body type: athletic'),'reference must not emit creation parameters');
  assert((await text()).includes('user-approved'));
  assert((await text()).includes('IMAGE-GUIDED CONTINUATION'));
  assert(!(await text()).includes('No input image is required'));
  assert(!(await text()).includes('INITIAL CHARACTER REFERENCE SHEET'));
  assert((await text()).includes('SINGLE-FIGURE COMPARISON PORTRAIT'));
  assert(!(await p.locator('#output-mode-note').innerText()).includes('확대컷'));
  await p.locator('#form').selectOption('overdrive');await settled();
  assert.equal(await p.locator('#base-form').inputValue(),'reference');
  assert((await text()).includes('armor actually worn in the attached reference'));
  await p.locator('#base-form').selectOption('heavy');await settled();
  assert((await text()).includes('multiple overlapping'));
  await p.locator('#form-override').fill('ONLY_LEFT_PANEL');await settled();
  await p.locator('#mode-action').click();
  await p.locator('#camera').fill('LOW_CAMERA_MARKER');
  await p.locator('#scene').fill('ACTION_SCENE_MARKER');await settled();
  assert((await text()).includes('LOW_CAMERA_MARKER'));
  await p.locator('#mode-portrait').click();await settled();
  assert.equal(await p.locator('#camera').count(),0);
  assert(!(await text()).includes('LOW_CAMERA_MARKER'));
  assert(!(await text()).includes('ACTION_SCENE_MARKER'));
  await p.locator('#mode-action').click();await settled();
  assert.equal(await p.locator('#camera').inputValue(),'LOW_CAMERA_MARKER');
  await p.locator('#mode-casual').click();await settled();
  assert.equal(await p.locator('#form').count(),0);
  assert.equal(await p.locator('#identity-mode').count(),0);
  assert(!(await text()).includes('[FORM DEFINITION]'));
  assert(!(await text()).includes('ONLY_LEFT_PANEL'));
  assert(!(await text()).includes('LOW_CAMERA_MARKER'));
  await p.locator('#category').selectOption('everyday_basic');
  await p.locator('#scene').fill('CASUAL_SCENE_MARKER');await settled();
  const styleKeys=await p.locator('#style option').evaluateAll(es=>es.map(e=>e.value));
  for(const key of styleKeys){
   await p.locator('#style').selectOption(key);await settled();
   assert((await text()).includes(await p.evaluate(k=>window.AtelierSpec.STYLE_PROFILES[k].core,key)),key);
   assert(!(await text()).includes('undefined'),key);
  }
  await p.locator('#style').selectOption('bright_catalog');await settled();
  const want=await text();
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
   writeText:async t=>{window.__copied=t}}}));
  await p.locator('#copy-prompt').click();
  assert.equal(await p.evaluate(()=>window.__copied),want);
  // Denied clipboard access selects the output for manual copying.
  await p.evaluate(()=>navigator.clipboard.writeText=async()=>{throw Error('denied')});
  await p.locator('#copy-prompt').click();
  assert(await p.locator('#prompt-output').evaluate(e=>e.selectionEnd-e.selectionStart===e.value.length));
  await p.locator('#source').selectOption('이상해씨');await settled();
  assert((await text()).includes('INITIAL CHARACTER REFERENCE SHEET'));
  assert(!(await text()).includes('CASUAL_SCENE_MARKER'));
  await p.locator('#source').selectOption('피카츄');await settled();
  assert((await text()).includes('CASUAL_SCENE_MARKER'));
  assert.equal(await p.locator('#style').inputValue(),'bright_catalog');
  await p.reload();
  await p.waitForFunction(()=>document.querySelector('#prompt-output')?.value.includes('CASUAL_SCENE_MARKER'));
  assert.equal(await p.locator('#style').inputValue(),'bright_catalog');
  await p.locator('#mode-portrait').click();await settled();
  assert((await text()).includes('ONLY_LEFT_PANEL'));
  // The wrap owns scrolling on small and large viewports.
  for(const viewport of [FOLD.cover,FOLD.inner,{width:1280,height:900}]){
   await p.setViewportSize(viewport);
   const dims=await p.evaluate(()=>{
    const w=document.querySelector('.wrap');
    w.scrollTop=w.scrollHeight;
    return {width:innerWidth,body:document.body.scrollWidth,wrap:w.clientHeight,
     scroll:w.scrollTop,bodyScroll:document.scrollingElement.scrollTop};
   });
   assert(dims.body<=dims.width+1,JSON.stringify(dims));
   assert(dims.wrap>100&&dims.scroll>100,JSON.stringify(dims));
   assert.equal(dims.bodyScroll,0);
  }
  assert.deepEqual(a.errors,[]);
  assert.deepEqual(await p.evaluate(()=>window.AtelierWords.missing()),[]);
  await a.close();
  const corrupt=await harness.open('prompt.html',{store:['pkm_prompt_v2','not json']});
  await corrupt.page.waitForSelector('#prompt-output');
  assert.deepEqual(corrupt.errors,[]);
  await corrupt.close();
  console.log('PASS prompt screen: modes, reference identity, forms, 12 styles, copy, saved settings, figures and 3 viewport sizes');
 }finally{await harness.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
