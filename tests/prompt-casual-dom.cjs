/* Real Preact casual controls, without a browser/network dependency.
   일상컷 트리(2026-10-29) — 추천 조합 → 시대 → 장소 → 하는 일 → 의상 계열 → 옷, 자세·방향은 하는 일 안에서, 표정은 맨 끝.
   NODE_PATH=<node_modules with jsdom and preact> node tests/prompt-casual-dom.cjs */
const assert=require('node:assert/strict');
const {open,pause,storeKey}=require('./prompt-dom-harness.cjs');
/* 예전 저장값(갈래·예시)은 변환표로 같은 길이 된다 — 포켓몬 여행 물품점 직업컷 */
const fixture=JSON.stringify({last:'피카츄',cards:{
 '피카츄':{mode:'casual',identityMode:'reference',scenes:{casual:{cat:'occupation_basic',ex:'orbital_logistics',camera:'SAVED_CAMERA'}}},
 '이상해씨':{mode:'casual',identityMode:'reference'}
}});
(async()=>{
 let a=await open(fixture);
 try{
  const {get,set,click,output,w}=a,S=w.AtelierSpec;
  assert.equal(get('camera').value,'SAVED_CAMERA','legacy camera text was lost');
  assert.equal(get('place').value,'work_shop','saved job selection moved onto its tree path');
  assert.equal(get('act').value,'job_supply_pack');
  assert(output().includes('travel-supply shopkeeper'),'job activity reaches the prompt');
  assert(!get('category')&&!get('example'),'old category/example menus are gone');
  for(const id of ['motifs','preset','era','place','act','ofam','item','pose','orientation','frame','lens','aspect','camera','outfit','scene','custom','expression']){
   assert(get(id+'-description')?.textContent.trim(),id+' needs a description');
   assert.equal(get(id).getAttribute('aria-describedby'),id+'-description');
   assert.equal(get(id).getAttribute('aria-labelledby'),id+'-label');
  }
  /* 고정값 — 전체 강도·피부 노출·2:3 은 처음부터 채워지고 잠긴다 */
  assert.equal(get('axis-overall_intensity').value,'strong');assert.equal(get('axis-skin_exposure').value,'bold');
  assert.equal(get('lock-axis-skin_exposure').getAttribute('aria-pressed'),'true');
  /* 시대 → 장소: 첫 등장 무렵은 그 세대의 해(피카츄 1세대 1996) */
  assert.match(Array.from(get('era').options).find(o=>o.value==='release').textContent,/1996/);
  await set('era','in_pokemon');
  const groups=Array.from(get('place').querySelectorAll('optgroup')).map(g=>g.label);
  assert(groups.includes('동료 포켓몬과 함께')&&groups.includes('포켓몬 세계')&&groups.includes('나무열매·요리'),groups.join());
  /* 동료 묶음 — 동료 줄, 가슴 위·클로즈업 없음 */
  await set('place','partner_garden');
  assert(get('companion-note'),'companion note');
  assert(output().includes('exactly one Pokémon companion'),'companion line');
  assert(!Array.from(get('frame').options).some(o=>o.value==='face_close'||o.value==='chest_up'),'companion acts drop close crops');
  await set('act','care_feeding');
  assert(Array.from(get('pose').options).some(o=>o.value==='offering_food'),'companion pose offered');
  await set('pose','offering_food');
  assert(output().includes(S.POSE_GUIDES.offering_food[1]));
  /* 안 쓰는 값 — 등 돌린 방향·손 디테일은 메뉴에 없다 */
  await set('era','now');await set('place','street_park');await set('act','stroll');
  assert(!Array.from(get('orientation').options).some(o=>['back','back_to_camera','walking_away'].includes(o.value)),'banned orients hidden');
  assert(!Array.from(get('frame').options).some(o=>o.value==='detail'),'detail hidden');
  assert(!get('companion-note')&&output().includes('no creature beside her'),'one figure again');
  /* 필수 갈래(수영복 등) 컷엔 얼굴 클로즈업이 없다 */
  await set('era','now');await set('place','water_pool');
  const fams=Array.from(get('ofam').options).map(o=>o.value);
  assert(fams.includes('swimwear'));await set('ofam','swimwear');
  assert(get('required-note').textContent.includes('★'));
  assert(!Array.from(get('frame').options).some(o=>o.value==='face_close'),'no face close-up on a required cut');
  await set('place','street_park');await set('act','stroll');await set('ofam','everyday');
  assert(Array.from(get('frame').options).some(o=>o.value==='face_close'),'face close-up off the required cuts');
  /* 프레이밍·렌즈 — 가까운 컷엔 CROP 줄, 광각 없음 */
  await set('frame','chest_up');
  assert(output().includes('CROP: a chest-up shot'));
  assert(!Array.from(get('lens').options).some(o=>o.value==='wide24'),'no wide lens on close cuts');
  assert(get('frame-description').textContent.includes(w.W('prompt.help.frame')));
  assert(get('lens-description').textContent.includes(w.W('prompt.tree.lens.nowide')));
  await set('frame','full_body');await set('lens','wide24');
  assert(output().includes(S.LENS_GUIDES.wide24[1]));
  /* 추천 조합 — 고르면 한 번에 채워지고, 칸을 손으로 바꾸면 표시가 지워진다 */
  await set('preset','food_poffin');
  assert.equal(get('place').value,'berry_kitchen');assert.equal(get('act').value,'food_poffin');
  assert(output().includes('Poffin'));
  await set('act',Array.from(get('act').options).map(o=>o.value).find(v=>v!=='food_poffin'));
  assert.equal(get('preset').value,'','manual change clears the preset');
  /* 옷 직접 쓰기 */
  await set('outfit','MY_OUTFIT');assert(output().includes('Outfit: MY_OUTFIT'));
  for(const axis of S.LOCAL_AXES)assert(get('axis-'+axis+'-description').textContent.trim());
  // 개방은 첨부한 그림의 구도를 쓴다 — 카메라 메뉴가 없고 일상 선택이 새지 않는다
  await click('mode-action');const form0=get('form').value;await set('form','overdrive');assert(!get('frame')&&!get('lens'));
  assert(!output().includes('MY_OUTFIT')&&!output().includes(S.LENS_GUIDES.wide24[1]),'casual choice leaked to overdrive');
  await set('form',form0);
  await click('mode-action');assert.equal(get('frame').value,'');assert.equal(get('camera').value,'');
  await click('mode-casual');assert.equal(get('frame').value,'full_body');
  await set('source','이상해씨');assert.equal(get('frame').value,'');
  await set('source','피카츄');assert.equal(get('lens').value,'wide24');
  for(let n=0;n<40&&JSON.parse(w.localStorage.getItem(storeKey)).last!=='피카츄';n++)await pause();
  const saved=w.localStorage.getItem(storeKey),ids=['era','place','act','ofam','item','pose','orientation','frame','lens','camera','outfit'];
  const before=Object.fromEntries(ids.map(id=>[id,get(id).value]));
  assert.deepEqual(Array.from(w.AtelierWords.missing()),[]);assert.deepEqual(a.errors,[]);
  a.dom.window.close();a=await open(saved);
  for(const id of ids)assert.equal(a.get(id).value,before[id],'restore '+id);
  assert.equal(a.get('place').value,'berry_kitchen');assert.equal(a.get('lens').value,'wide24');assert.equal(a.get('outfit').value,'MY_OUTFIT');assert.equal(a.get('camera').value,'SAVED_CAMERA');
  assert.deepEqual(a.errors,[]);
  console.log('PASS casual DOM: tree steps, descriptions, old saved jobs, companion, banned values, face close-up rule, crop, preset, mode/card isolation and restore');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
