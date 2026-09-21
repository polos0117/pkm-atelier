const assert=require('node:assert/strict');
const {open,storeKey}=require('./prompt-dom-harness.cjs');
const data=require('../data/source-appearance.json').entries;
(async()=>{
 let a=await open(JSON.stringify({last:'꼬부기',cards:{}}));
 try{
  assert.equal(a.get('motifs').value,'','automatic data must not become stored manual text');
  assert(a.output().includes(data['7'].features[0].detail));
  assert(!a.get('feature-insets-advanced').open,'manual fields should be collapsed by default');
  await a.set('source','메타몽');
  assert(a.output().includes(data['132'].features[0].detail));
  assert(!a.output().includes(data['7'].features[0].detail));
  await a.set('motifs','CUSTOM_PURPLE_SURFACE');
  assert(a.output().includes('CUSTOM_PURPLE_SURFACE')&&!a.output().includes('Source appearance cues:'));
  await a.set('feature-inset-mount','CUSTOM_INSET');
  assert(a.output().includes('CUSTOM_INSET'));
  const state=a.w.localStorage.getItem(storeKey);a.dom.window.close();a=await open(state);
  assert(a.output().includes('CUSTOM_INSET')&&a.output().includes('CUSTOM_PURPLE_SURFACE'));
  await a.set('motifs','');await a.click('feature-insets-reset');
  assert(a.output().includes(data['132'].features[0].detail)&&!a.output().includes('CUSTOM_INSET'));
  await a.set('identity-mode','reference');
  assert(!a.output().includes('Source appearance cues:'));
  assert(!a.get('feature-insets'));
  assert.deepEqual(a.errors,[]);
  console.log('PASS actual Preact UI: blank input, source switch, override/reset, persistence and reference isolation');
 }finally{a.dom.window.close()}
 a=await open(JSON.stringify({last:'꼬부기',cards:{}}),{failFetch:'data/source-appearance.json'});
 try{
  assert(a.output().includes('[OUTPUT MODE]'));
  assert(a.w.document.body.textContent.includes('외형 데이터를 불러오지 못했습니다'));
  assert(!a.output().includes('Source appearance cues:'));
  assert.deepEqual(a.errors,[]);
  console.log('PASS missing data degrades to named-source generation without blocking editor');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
