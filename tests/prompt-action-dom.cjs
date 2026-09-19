/* NODE_PATH=<node_modules with jsdom and preact> node tests/prompt-action-dom.cjs */
const assert=require('node:assert/strict');
const {open,pause,storeKey}=require('./prompt-dom-harness.cjs');
const fixture=JSON.stringify({last:'피카츄',cards:{
 '피카츄':{mode:'action',identityMode:'reference',form:'heavy',scenes:{action:{pose:'walking',camera:'SAVED_ACTION_CAMERA'}}},
 '이상해씨':{mode:'action',identityMode:'reference'}
}});
(async()=>{
 let a=await open(fixture);
 try{
  const {get,set,click,output,w}=a,S=w.AtelierSpec;
  assert(get('action-category')&&get('action-example'),'action selection menus are missing');
  assert(get('action-example').disabled,'no category yet');
  assert.equal(get('camera').value,'SAVED_ACTION_CAMERA');
  assert.equal(get('pose').value,'walking','saved legacy pose must stay selectable');
  assert(output().includes(S.POSE_GUIDES.walking[1]));
  assert(!output().includes('[ACTION DIRECTION]'),'automatic choices add no instructions');
  for(const id of ['action-category','action-example',...S.ACTION_CONTROLS.map(r=>'action-'+r.key)]){
   assert(get(id+'-description')?.textContent.trim(),id+' description');
   assert.equal(get(id).getAttribute('aria-describedby'),id+'-description');
  }
  for(const category of S.ACTION_CATEGORIES){
   await set('action-category',category.key);
   assert(!get('action-example').disabled);
   assert.equal(get('action-example').value,'');
   assert.equal(get('action-category-description').textContent,category.description);
   const ex=category.examples[0];await set('action-example',ex.key);
   assert.equal(get('action-example-description').textContent,ex.description);
   assert(output().includes(ex.prompt));
  }
  await set('action-category','ranged');await set('action-example','aimed_release');
  const picks={timing:'impact',equipment:'unarmed',power:'none',effects:'none',speed:'still',environment:'forest'};
  for(const control of S.ACTION_CONTROLS){
   await set('action-'+control.key,picks[control.key]);
   const option=control.options.find(r=>r.key===picks[control.key]);
   assert.equal(get('action-'+control.key+'-description').textContent,option.description);
   assert(output().includes(option.prompt));
  }
  await set('pose','low_guard');assert(output().includes(S.ACTION_POSES.find(r=>r.key==='low_guard').prompt));
  await set('frame','full_body');await set('lens','documentary35');
  await set('custom','CUSTOM_ACTION_REQUEST');assert(output().includes('CUSTOM_ACTION_REQUEST'));
  assert.equal(get('form').value,'heavy','effects must not change form');
  await set('action-category','defense');assert.equal(get('action-example').value,'');
  assert.equal(get('action-effects').value,'none','category switch must retain detailed settings');
  assert(!output().includes(S.ACTION_CATEGORIES.find(r=>r.key==='ranged').examples[0].prompt));
  await set('action-example','defense_brace');
  await click('mode-casual');assert(!get('action-category'));assert(!output().includes('[ACTION DIRECTION]'));
  assert(!Array.from(get('pose').options).some(o=>o.value==='low_guard'),'action poses leaked to casual menu');
  await click('mode-portrait');assert(!get('action-category'));assert(!output().includes('[ACTION DIRECTION]'));
  await click('mode-action');assert.equal(get('action-effects').value,'none');
  assert.equal(get('pose').value,'low_guard');assert.equal(get('action-example').value,'defense_brace');
  await set('source','이상해씨');assert.equal(get('action-category').value,'');
  await set('source','피카츄');assert.equal(get('action-category').value,'defense');
  for(let n=0;n<40&&JSON.parse(w.localStorage.getItem(storeKey)).last!=='피카츄';n++)await pause();
  const saved=w.localStorage.getItem(storeKey);
  assert.deepEqual(Array.from(w.AtelierWords.missing()),[]);assert.deepEqual(a.errors,[]);
  a.dom.window.close();a=await open(saved);
  for(const [id,value] of [['action-category','defense'],['action-example','defense_brace'],['action-effects','none'],['pose','low_guard'],['frame','full_body'],['camera','SAVED_ACTION_CAMERA']])
   assert.equal(a.get(id).value,value,'restore '+id);
  // Invalid stored choices must fall back to automatic without stale example instructions.
  const stale=JSON.parse(saved);stale.cards['피카츄'].scenes.action.action={category:'UNKNOWN',example:'defense_brace',effects:'BROKEN'};
  a.dom.window.close();a=await open(JSON.stringify(stale));
  for(const id of ['action-category','action-example','action-effects'])assert.equal(a.get(id).value,'');
  assert(!a.output().includes('[ACTION DIRECTION]'));
  assert.deepEqual(a.errors,[]);
  console.log('PASS action DOM: menus, descriptions, old pose/camera values, dependent examples, form/mode/card isolation and restore');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
