/* NODE_PATH=<jsdom and preact node_modules> node tests/prompt-random-dom.cjs */
const assert=require('node:assert/strict');
const {open,pause,storeKey}=require('./prompt-dom-harness.cjs');
const fixture=JSON.stringify({last:'피카츄',cards:{
 '피카츄':{mode:'casual',identityMode:'reference',form:'heavy',scenes:{
  casual:{cat:'partner_care',ex:'care_feeding',pose:'walking',camera:'KEEP_CAMERA',custom:'KEEP_TEXT'},
  action:{action:{category:'ranged',example:'aimed_release'}}}},
 '이상해씨':{mode:'casual',identityMode:'reference'}
}});
(async()=>{
 let a=await open(fixture);
 try{
  const {get,set,click,w}=a;w.Math.random=()=>0.3;
  const style=get('style').value;
  assert(get('random-scene')&&get('random-lens')&&get('lock-lens'));
  await set('lens','natural50');await click('random-lens');
  const lens=get('lens').value;assert(lens&&lens!=='natural50');
  await click('lock-lens');assert.equal(get('lock-lens').getAttribute('aria-pressed'),'true');
  assert(get('random-lens').disabled);await click('random-lens');assert.equal(get('lens').value,lens);
  await click('lock-example');assert(get('random-category').disabled);
  await click('random-scene');assert.equal(get('category').value,'partner_care');assert.equal(get('example').value,'care_feeding');
  assert.equal(get('lens').value,lens);assert.equal(get('camera').value,'KEEP_CAMERA');assert.equal(get('custom').value,'KEEP_TEXT');
  assert.equal(get('style').value,style);
  await click('lock-example');await click('random-category');assert.notEqual(get('category').value,'partner_care');
  assert.equal(get('example').value,'');await click('random-example');assert(get('example').value);
  await click('lock-pose');const pose=get('pose').value;
  await click('random-pose');assert.equal(get('pose').value,pose);
  await click('mode-action');assert.equal(get('lock-lens').getAttribute('aria-pressed'),'false');
  await click('lock-action-example');assert(get('random-action-category').disabled);
  await set('action-effects','none');await click('lock-action-effects');
  await click('random-scene');assert.equal(get('action-category').value,'ranged');assert.equal(get('action-example').value,'aimed_release');
  assert.equal(get('action-effects').value,'none');assert.equal(get('form').value,'heavy');
  // Lock all exposed fields: both per-field and whole-scene randomization must disable.
  for(const button of Array.from(w.document.querySelectorAll('button[id^="lock-"]')))
   if(button.getAttribute('aria-pressed')!=='true')await click(button.id);
  assert(get('random-scene').disabled);
  await click('mode-portrait');assert(!get('random-scene')&&!get('lock-pose'));
  await click('mode-casual');assert.equal(get('lens').value,lens);assert.equal(get('lock-lens').getAttribute('aria-pressed'),'true');
  await set('source','이상해씨');assert.equal(get('lock-lens').getAttribute('aria-pressed'),'false');
  await set('source','피카츄');assert.equal(get('lock-lens').getAttribute('aria-pressed'),'true');
  for(let n=0;n<40&&JSON.parse(w.localStorage.getItem(storeKey)).last!=='피카츄';n++)await pause();
  const saved=w.localStorage.getItem(storeKey);
  assert.deepEqual(a.errors,[]);assert.deepEqual(Array.from(w.AtelierWords.missing()),[]);
  a.dom.window.close();a=await open(saved);
  assert.equal(a.get('lock-lens').getAttribute('aria-pressed'),'true');assert.equal(a.get('lens').value,lens);
  await a.click('mode-action');assert(a.get('random-scene').disabled);assert.equal(a.get('action-effects').value,'none');
  assert.deepEqual(a.errors,[]);
  console.log('PASS random DOM: per-field/all controls, locks, dependent examples, manual text, mode/card separation and restore');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
