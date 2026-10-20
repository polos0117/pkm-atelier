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
  await p.waitForFunction(()=>document.querySelector('#prompt-output')?.value.includes('ANATOMY:'));
  const text=()=>p.locator('#prompt-output').inputValue();
  const settled=()=>p.waitForTimeout(90);
  assert.equal(await p.locator('#source').inputValue(),'피카츄','dex deep link');
  assert.deepEqual(await p.locator('#group option').evaluateAll(es=>es.slice(1).map(e=>e.textContent)),
   groups.order.map(k=>groups.name[k]));
  assert.equal(await p.locator('#style option').count(),14);
  assert.equal(await p.locator('#mode-portrait').count(),0,'the sheet mode is gone');
  assert((await text()).startsWith('INPUT: text only'));
  assert((await text()).includes('lightning-shaped tail becomes'),'source data is worn as costume');
  /* 종별 얼굴 설계 — 새 인물에만 FACE 줄, 끄면 빠지고, 무작위 변경은 얼굴 항목을 건드리지 않는다 */
  await p.waitForSelector('#face-design-list');
  assert.equal(await p.locator('#face-design-list li').count(),11,'얼굴 항목 열하나');
  assert((await text()).includes("FACE (her own structure"),'새 인물 프롬프트에 FACE 줄');
  /* 피카츄는 확정 그림에 머리 기록이 없어(모델 기본) 표가 머리를 정하지 않는다 — HAIR 줄 없음 */
  assert(!(await text()).includes('\n\nHAIR: ')&&await p.locator('#hair-design-list').count()===0,'기록 없는 확정 종에 HAIR 줄');
  await p.locator('#face-design-on').click();await settled();
  assert(!(await text()).includes('FACE ('),'끄면 FACE 줄이 빠진다');
  assert.equal(await p.locator('#face-design-list').count(),0);
  await p.locator('#face-design-on').click();await settled();
  assert((await text()).includes('FACE ('),'다시 켜면 돌아온다');
  await p.locator('#randomize').click();await settled();
  assert((await text()).includes('FACE (')&&!/\n(face shape|jaw & chin|eyebrows|lips): /.test(await text()),'무작위 변경이 얼굴 항목을 채우지 않았다');
  await p.locator('#appearance-settings button:has-text("'+await p.evaluate(()=>window.W('prompt.reset'))+'")').click();await settled();
  // The normal copy action includes the creation call instructions without a manual prefix.
  await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{
   writeText:async t=>{window.__copied=t}}}));
  await p.locator('#copy-prompt').click();
  const creationCopy=await p.evaluate(()=>window.__copied);
  assert.equal(creationCopy,await text());
  assert(creationCopy.split('\n\n')[0].includes('omit referenced_image_paths and num_last_images_to_include'));
  assert((await p.locator('#identity-note').innerText()).includes('첨부 없이'));
  assert((await p.locator('#output-mode-note').innerText()).includes('2:3'));
  assert((await p.locator('#source-wear').innerText()).includes('Bulbapedia'),'source and license are shown');
  await p.locator('#appearance-settings details').nth(1).locator('summary').click();
  await p.locator('#param-body-type').selectOption('athletic');
  await p.locator('#param-apparent-age').selectOption('30s');
  await settled();
  assert((await text()).includes('body type: athletic'));
  assert.equal(await p.locator('[data-figure-picker="body type"] [data-value="athletic"][aria-pressed="true"]').count(),1);
  // 손가락 자리 — 장면 칸의 무작위·잠금, 외형 잠금, 그림 고르기 머리 단추는 44px 이상
  await p.locator('#appearance-settings details').evaluateAll(es=>es.forEach(e=>e.open=true));
  const small=await p.locator('.scene-choice-actions button, .param-lock, .figure-picker-head button').evaluateAll(es=>
   es.filter(e=>e.offsetParent).map(e=>[e.className||e.textContent,Math.round(e.getBoundingClientRect().height),Math.round(e.getBoundingClientRect().width)]).filter(([,hh,ww])=>hh<44||ww<44));
  assert(await p.locator('.param-lock').count()>0,'외형 잠금 단추가 있다');
  assert.deepEqual(small,[],'44px 보다 작은 단추');
  // A locked field must survive randomization.
  await p.getByRole('button',{name:'무작위 변경 잠금 · 체형',exact:true}).click();
  await p.locator('#randomize').click();await settled();
  assert.equal(await p.locator('#param-body-type').inputValue(),'athletic');
  await p.locator('#identity-mode').selectOption('reference');await settled();
  assert.equal(await p.locator('#appearance-settings').count(),0);
  assert.equal(await p.locator('#source-wear').count(),0);
  assert(!(await text()).includes('FACE ('),'이어가기에는 FACE 줄이 없다');
  assert(!(await text()).includes('body type: athletic'),'reference must not emit creation parameters');
  assert((await text()).startsWith('INPUT: the attached image is the approved character'));
  assert(!(await text()).includes('omit referenced_image_paths'));
  await p.locator('#form').selectOption('heavy');await settled();
  assert((await text()).includes('the HEAVY form of the woman in the attached image'));
  await p.locator('#camera').fill('LOW_CAMERA_MARKER');
  await p.locator('#scene').fill('ACTION_SCENE_MARKER');await settled();
  assert((await text()).includes('LOW_CAMERA_MARKER'));
  await p.locator('#form').selectOption('overdrive');await settled();
  assert.equal(await p.locator('#identity-mode').count(),0,'overdrive always attaches the form image');
  assert.equal(await p.locator('#camera').count(),0);
  assert.equal(await p.locator('#base-form').inputValue(),'light');
  await p.locator('#base-form').selectOption('heavy');await settled();
  assert((await text()).includes('stacked outer plates swing away'));
  assert(!(await text()).includes('LOW_CAMERA_MARKER')&&!(await text()).includes('ACTION_SCENE_MARKER'),'overdrive keeps the attached camera');
  await p.locator('#form-override').fill('ONLY_LEFT_PANEL');await settled();
  assert((await text()).includes('FORM NOTE: ONLY_LEFT_PANEL'));
  await p.locator('#form').selectOption('heavy');await settled();
  assert.equal(await p.locator('#camera').inputValue(),'LOW_CAMERA_MARKER');
  await p.locator('#mode-casual').click();await settled();
  assert.equal(await p.locator('#form').count(),0);
  assert.equal(await p.locator('#identity-mode').count(),0);
  assert(!(await text()).includes('FORM —'));
  assert(!(await text()).includes('ONLY_LEFT_PANEL'));
  assert(!(await text()).includes('LOW_CAMERA_MARKER'));
  await p.locator('#category').selectOption('everyday_basic');
  await p.locator('#scene').fill('CASUAL_SCENE_MARKER');await settled();
  const styleKeys=await p.locator('#style option').evaluateAll(es=>es.map(e=>e.value));
  for(const key of styleKeys){
   await p.locator('#style').selectOption(key);await settled();
   assert((await text()).includes(await p.evaluate(k=>window.AtelierSpec.CASUAL_STYLE_CORES[k],key)),key);
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
  assert((await text()).includes('dorsal plant bulb becomes'));
  assert(!(await text()).includes('CASUAL_SCENE_MARKER'));
  await p.locator('#source').selectOption('피카츄');await settled();
  assert((await text()).includes('CASUAL_SCENE_MARKER'));
  assert.equal(await p.locator('#style').inputValue(),'bright_catalog');
  await p.reload();
  await p.waitForFunction(()=>document.querySelector('#prompt-output')?.value.includes('CASUAL_SCENE_MARKER'));
  assert.equal(await p.locator('#style').inputValue(),'bright_catalog');
  await p.locator('#mode-action').click();await settled();
  assert((await text()).includes('LOW_CAMERA_MARKER'));
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
  /* 종별 머리 설계 — 새로 고른 종(꼬링크)은 FACE 뒤에 HAIR 줄. 무작위 변경은 설계된 머리를 채우지 않고,
     헤어스타일을 직접 고르면 HAIR 줄이 빠지며, 이어가기에는 싣지 않는다 */
  const shinx=JSON.parse(fs.readFileSync('data/face-design.json','utf8')).faces[403];
  const hairText='HAIR: '+shinx.hair['hair length']+' '+shinx.hair.hairstyle+', '+shinx.hair.bangs+'.';
  const b=await harness.open('prompt.html?mech='+encodeURIComponent('꼬링크'),{viewport:FOLD.inner,mobile:true});
  const q=b.page,qtext=()=>q.locator('#prompt-output').inputValue();
  await q.waitForFunction(()=>document.querySelector('#prompt-output')?.value.includes('ANATOMY:'));
  await q.waitForSelector('#hair-design-list');
  assert.equal(await q.locator('#hair-design-list li').count(),3,'머리 항목 셋');
  assert((await qtext()).includes('\n\n'+hairText+'\n\n'),'새 인물 프롬프트에 HAIR 줄');
  assert((await qtext()).indexOf('FACE (')<(await qtext()).indexOf(hairText),'HAIR 는 FACE 뒤');
  await q.locator('#randomize').click();await q.waitForTimeout(90);
  assert((await qtext()).includes(hairText)&&!/\n(hairstyle|hair length|bangs): /.test(await qtext()),'무작위 변경이 설계된 머리를 채웠다');
  await q.locator('#appearance-settings details').evaluateAll(es=>es.forEach(e=>e.open=true));
  await q.locator('#param-hairstyle').selectOption('locs');await q.waitForTimeout(90);
  assert(!(await qtext()).includes('\n\nHAIR: ')&&(await qtext()).includes('hairstyle: locs'),'고른 헤어스타일이 이긴다');
  assert.equal(await q.locator('#hair-design-list li.overridden').count(),3,'설계 머리가 다 직접 고른 값에 밀린다');
  await q.locator('#identity-mode').selectOption('reference');await q.waitForTimeout(90);
  assert(!(await qtext()).includes('HAIR: '),'이어가기에 HAIR 줄');
  assert.deepEqual(b.errors,[]);
  await b.close();
  const corrupt=await harness.open('prompt.html',{store:['pkm_prompt_v2','not json']});
  await corrupt.page.waitForSelector('#prompt-output');
  assert.deepEqual(corrupt.errors,[]);
  await corrupt.close();
  console.log('PASS prompt screen: action/casual, wear from data, reference identity, overdrive, forms, 14 styles, copy, saved settings, figures, 44px controls and 3 viewport sizes');
 }finally{await harness.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
