/* Exercise the actual generator screen and its output, not a hand-built prompt. */
const assert=require('node:assert/strict');
const {open,pause,storeKey}=require('./prompt-dom-harness.cjs');
const params=require('./fixtures/appearance-bulbasaur.json');
(async()=>{
 let a=await open(JSON.stringify({last:'이상해씨',cards:{'이상해씨':{style:'glossy_promo',identityMode:'create',form:'light',params:Object.fromEntries(params),mode:'portrait',scenes:{portrait:{expr:'smirk'}}}}}));
 try{
  const id=k=>'param-'+k.replace(/\W/g,'-');
  const {AtelierSpec:S}=a.w;
  assert(a.output().includes('U-shaped lower-face outline'));
  assert(a.get('mode-action').getAttribute('aria-pressed')==='true','an old saved portrait opens as action');
  assert(!a.get('mode-portrait'),'the sheet mode is gone');
  assert(a.get('source-wear'),'a new character shows how the source is worn');
  assert(a.get('wear-preview').textContent.includes('dorsal plant bulb becomes'),'automatic wear preview');
  await a.set('motifs','a leaf-trimmed cape and a bud brooch');
  assert(a.output().includes('WEAR (user choice): a leaf-trimmed cape and a bud brooch.'));
  assert(!a.get('wear-preview'),'typed wear replaces the automatic preview');
  await a.set('head-feature','accessory');
  assert(a.output().includes('earrings, ear cuffs or a choker'),'head feature choice reaches the prompt');
  await a.set('head-feature','__custom__');await a.set('head-feature-custom','tiny leaf clips');
  assert(a.output().includes('HEAD: tiny leaf clips.'));
  await a.set('head-feature','accessory');
  assert(!a.output().includes('hair length: medium'));
  assert(a.get(id('hair length')+'-description').textContent.includes('픽시컷'));
  assert.equal(a.get(id('hair length')).value,'medium','saved value must not be silently changed');
  let n=0;
  for(const d of S.PARAM_DEFS.filter(d=>S.IDENTITY_GROUPS.includes(d.group)&&!S.IDENTITY_EXCLUDED.includes(d.key))) {
   const key=id(d.key),original=a.get(key).value;
   for(const [value] of d.options.filter(([v])=>v!=='__custom__')) {
    await a.set(key,value);
    assert(a.get(key+'-description').textContent.trim(),key+' needs help');
    assert.equal(a.get(key).getAttribute('aria-describedby'),key+'-description');
    assert(!/undefined|\[object Object\]/.test(a.output()));
    n++;
   }
   await a.set(key,original);
  }
  await a.set(id('jaw & chin'),'square broad jaw');
  assert(!a.output().includes('U-shaped lower-face outline'));
  assert(a.output().includes('squared corners'));
  await a.set(id('jaw & chin'),'soft rounded jaw');
  await a.set(id('hairstyle'),'layered');
  assert(a.output().includes('neck-to-shoulder'));
  await a.set(id('hairstyle'),'pixie cut');
  await a.set('identity-mode','reference');
  assert(!a.output().includes('U-shaped lower-face outline'));
  assert(!a.get(id('jaw & chin')));
  assert(!a.get('source-wear'));
  assert(!a.output().includes('WEAR'));
  await a.click('mode-casual');
  await a.set('axis-action_level','balanced');
  assert(a.output().includes('gentle movement, not a ratio of multiple images'));
  await a.set('orientation','front_3q');
  assert(a.output().includes('rotate torso and pelvis together'));
  assert(!a.output().includes('orient: front_3q'));
  await a.click('mode-action');
  await a.set('orientation','looking_down');
  assert(a.output().includes('gaze directed downward; camera height unchanged'));
  await a.set('identity-mode','create');
  assert(a.output().includes('U-shaped lower-face outline'));
  assert(a.get('source-wear'));
  assert.equal(a.get('head-feature').value,'accessory');
  await a.set('form','overdrive');
  assert(!a.get('identity-mode')&&!a.get(id('jaw & chin')),'overdrive attaches the form image; no new identity');
  assert(a.output().includes('OPENED (overdrive) state'));
  await a.set('form','light');
  await pause();
  const state=a.w.localStorage.getItem(storeKey);
  assert.equal(JSON.parse(state).cards['이상해씨'].params['hair length'],'medium');
  assert.equal(JSON.parse(state).cards['이상해씨'].featureInsets,undefined,'old inset storage is dropped');
  assert.equal(JSON.parse(state).cards['이상해씨'].headFeature,'accessory');
  const final=a.output();
  assert.deepEqual(a.errors,[]);assert.deepEqual(Array.from(a.w.AtelierWords.missing()),[]);
  a.dom.window.close();a=await open(state);
  assert.equal(a.output(),final,'restored screen must generate identical prompt');
  assert.deepEqual(a.errors,[]);
  console.log(`PASS appearance DOM: ${n} menu selections, scoped descriptions, generated output, modes and restore`);
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
