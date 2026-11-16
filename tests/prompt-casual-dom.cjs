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
  a.dom.window.close();
  /* 게임 코스프레(2026-11-15) — 의상 계열이 게임 코스프레일 때만 게임 고르개(열아홉), 재단은 옷 칸, 등장인물 많은 게임은 캐릭터 칸(비우면 그리는 쪽이 고르는 「…」 자리) */
  a=await open(JSON.stringify({last:'피카츄',cards:{'피카츄':{mode:'casual',identityMode:'reference',scenes:{casual:{era:'now',place:'arcade_hall',act:'play_cabinet',ofam:'game_cosplay',item:'gc_bikini'}}}}}));
  {
   const g=a.get;
   assert(g('cosplay-game'),'게임 고르개');assert.equal(g('cosplay-game').options.length,20,'고르지 않음 + 열아홉');
   assert(a.output().includes('Outfit: a daring adult cosplay of a video-game character, cut as a bikini'),'게임 없음 — 옷 칸 글');
   assert(a.output().includes(a.w.AtelierSpec.PROMPT_LINES.casualOutputCosplay),'코스프레 OUTPUT');
   assert(g('ocolor').disabled&&g('situ').disabled,'옷 색 · 상황은 막힌다');
   await a.set('cosplay-game','legend_of_zelda');
   assert(!g('cosplay-character'),'주인공 하나 게임은 캐릭터 칸 없음');
   assert(a.output().includes("Outfit: a daring adult cosplay of Link from The Legend of Zelda — Link's outfit")&&a.output().includes('cut as a bikini with a sheer sarong'),'주인공 하나 글');
   await a.set('item','gc_leotard');assert(a.output().includes('from The Legend of Zelda')&&a.output().includes('cut as a gymnastic leotard'),'재단은 옷 칸');
   await a.set('cosplay-game','overwatch');assert(g('cosplay-character')&&g('cosplay-character').tagName==='SELECT'&&g('cosplay-character').options.length===39,'등장인물 많은 게임은 캐릭터 고르개(비움 + 목록 서른여덟 — 2026-11-16)');
   assert(/Outfit: … \(a daring adult cosplay of one character of your choice from Overwatch — not any of these already used: none yet;/.test(a.output()),'비우면 그리는 쪽이 고르는 자리');
   await a.set('cosplay-character','Mercy');assert(a.output().includes('Outfit: a daring adult cosplay of Mercy from Overwatch — the costume'),'캐릭터를 고르면 그 캐릭터(assigned 글)');
   assert(g('cosplay-text').textContent.includes('Mercy'),'Outfit 줄 미리보기');
   await a.set('ofam',Array.from(g('ofam').options).map(o=>o.value).find(v=>v&&v!=='game_cosplay'));assert(!g('cosplay-game'),'다른 계열이면 고르개가 없다');
   assert.deepEqual(Array.from(a.w.AtelierWords.missing()),[]);assert.deepEqual(a.errors,[]);
  }
  a.dom.window.close();
  /* 옷 색 구체 색(2026-11-16) — 묶음을 고르면 그 아래 「색」 고르개(자동 + 그 묶음 shade), 지시문 줄은 shade 하나. 묶음을 바꾸면 그 묶음에 없는 shade 는 자동으로 */
  a=await open(JSON.stringify({last:'피카츄',cards:{'피카츄':{mode:'casual',identityMode:'reference',scenes:{casual:{era:'now',place:'street_park',act:'stroll',ofam:'everyday'}}}}}));
  {
   const g=a.get,S2=a.w.AtelierSpec,line=()=>(/Outfit colours: (.*?) — /.exec(a.output())||[])[1];
   assert(!g('shade'),'묶음이 없으면 색 고르개 없음');
   await a.set('ocolor','blue');const blue=S2.OUTFIT_COLORS.find(x=>x.key==='blue');
   assert(g('shade')&&g('shade').options.length===blue.shades.length+1,'자동 + 그 묶음 shade');
   assert.equal(g('shade').value,'');assert(g('shade-description').textContent.trim());
   const auto=line();assert(blue.shades.some(x=>x.en===auto)&&auto!==blue.en,'자동 — 그 묶음의 shade 하나: '+auto);
   await a.set('shade','navy');assert.equal(line(),'deep navy blue','고른 shade');
   await a.set('ocolor','red');assert.equal(g('shade').value,'','다른 묶음이면 자동으로');
   assert(S2.OUTFIT_COLORS.find(x=>x.key==='red').shades.some(x=>x.en===line()),'바꾼 묶음의 shade');
   await a.set('ocolor','');assert(!g('shade')&&!line(),'정하지 않음 — 줄 없음');
   assert.deepEqual(Array.from(a.w.AtelierWords.missing()),[]);assert.deepEqual(a.errors,[]);
  }
  console.log('PASS casual DOM: tree steps, descriptions, old saved jobs, companion, banned values, face close-up rule, crop, preset, mode/card isolation and restore, game cosplay picker, outfit shade picker');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
