const assert=require('node:assert/strict');
const {open,storeKey}=require('./prompt-dom-harness.cjs');
const data=require('../data/source-appearance.json').entries;
(async()=>{
 let a=await open(JSON.stringify({last:'꼬부기',cards:{}}));
 try{
  assert.equal(a.get('motifs').value,'','automatic data must not become stored manual text');
  assert(a.output().includes('the '+data['7'].features[0].detail+' becomes'),'source data reaches the wear line');
  assert(a.get('source-appearance-summary').textContent.includes(data['7'].features[0].detail),'data and its license are shown');
  assert(a.get('source-appearance-summary').querySelector('a[href*="creativecommons.org/licenses/by-nc-sa/2.5"]'));
  await a.set('source','리자몽');
  assert(a.output().includes(data['6'].features[0].detail));
  assert(!a.output().includes(data['7'].features[0].detail));
  await a.set('motifs','CUSTOM_PURPLE_SURFACE');
  assert(a.output().includes('WEAR (user choice): CUSTOM_PURPLE_SURFACE.'));
  const state=a.w.localStorage.getItem(storeKey);a.dom.window.close();a=await open(state);
  assert(a.output().includes('CUSTOM_PURPLE_SURFACE'));
  await a.set('motifs','');
  assert(a.output().includes(data['6'].features[0].detail+' become'),'clearing returns to automatic wear');
  await a.set('identity-mode','reference');
  assert(!a.output().includes('WEAR')&&!a.output().includes('PALETTE'));
  assert(!a.get('source-wear'));
  assert.deepEqual(a.errors,[]);
  console.log('PASS actual Preact UI: blank input, source switch, override/reset, persistence and reference isolation');
 }finally{a.dom.window.close()}
 a=await open(JSON.stringify({last:'꼬부기',cards:{}}),{failFetch:'data/source-appearance.json'});
 try{
  assert(a.output().includes('SOURCE: Squirtle (꼬부기)'));
  assert(a.w.document.body.textContent.includes('외형 데이터를 불러오지 못했습니다'));
  assert(!a.output().includes('WEAR:'));
  assert.deepEqual(a.errors,[]);
  console.log('PASS missing data degrades to named-source generation without blocking editor');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
