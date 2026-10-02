/* Use the actual Preact editor controls; capture, do not reconstruct its prompt.
   NODE_PATH=/path/to/node_modules node tools/capture-appearance-example.cjs */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {open,storeKey}=require('../tests/prompt-dom-harness.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
 const a=await open(JSON.stringify({last:'꼬부기',cards:{}}));
 try{
  await a.set('source','꼬부기');
  await a.click('mode-action');
  await a.set('identity-mode','create');
  await a.set('form','light');
  await a.set('style','glossy_promo');
  const params={'apparent age':'20s','hair color':'blue','hairstyle':'wolf cut',
   'hair length':'medium','eye color':'pink','jaw & chin':'soft rounded jaw'};
  for(const [k,v]of Object.entries(params))await a.set('param-'+k.replace(/\W/g,'-'),v);
  assert.equal(a.get('motifs').value,'');
  assert.deepEqual(a.errors,[]);
  const prompt=a.output();
  assert(prompt.includes('brown dorsal shell with white rim becomes'));
  assert(prompt.includes('pale-yellow belly shell becomes'));
  assert(prompt.includes('inward-curled long tail becomes'));
  const data=JSON.parse(fs.readFileSync(path.join(root,'data/source-appearance.json'))).entries['7'];
  const dir=path.join(root,'docs/examples');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'squirtle-auto-generator.txt'),prompt+'\n');
  /* 2026-10-02 부터 제출문은 생성기 출력 그대로다 — 설계 기록(design record)을 덧붙이지 않는다 */
  fs.writeFileSync(path.join(dir,'squirtle-auto-submitted.txt'),prompt+'\n');
  fs.writeFileSync(path.join(dir,'squirtle-auto-settings.json'),JSON.stringify({
   note:'Actual Preact UI capture: Squirtle, new character, light form, glossy_promo, automatic wear. The submitted prompt is the generator output unchanged; it is not an approved identity anchor.',
   sourceNo:7,sourceRevision:data.revision,settings:JSON.parse(a.w.localStorage.getItem(storeKey)),
   generatorWords:prompt.split(/\s+/).length,generatorCharacters:prompt.length
  },null,2)+'\n');
  console.log('Captured actual editor output:',prompt.length,'characters;',prompt.split(/\s+/).length,'words.');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
