/* Casual options must reach the prompt, remain documented and respect mode boundaries.
   2026-10-29 일상컷 트리(B안) — 장면은 트리 길(시대 → 장소 → 하는 일 → 의상 → 구도). 예전 갈래·예시 531개는 트리 변환표로 같은 장면에 닿는다. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const name of ['prompt-spec','casual-tree','prompt-anthro','prompt-lifestyle'])
 vm.runInContext(fs.readFileSync('lib/'+name+'.js','utf8'),ctx);
const {AtelierSpec:S,AtelierPrompt:P,AtelierLifestyle:L,AtelierCasualTree:CT}=ctx.window;
const tree=JSON.parse(fs.readFileSync('data/casual-tree.json','utf8'));
const base={mech:'Pikachu',style:S.DEFAULT_STYLE,identityMode:'reference',form:'heavy',tree,gen:1};
const scene=(era,place,act,ofam,more={})=>({...base,era,place,act,ofam,...more});
const sceneBlock=t=>(t.split('SCENE (chosen):\n')[1]||'').split('\n\n')[0];
/* 예전 갈래·예시 표는 생성기에서 빠졌다 — 트리 표와 변환표가 쥔다 */
for(const k of ['CATS','EXAMPLE_MAP','EXAMPLE_DETAIL','EX_NOTE','CAT_KO'])assert(!(k in S),k+' should be gone (data/casual-tree.json)');
/* 예전 기록(갈래/예시)은 다 트리 위의 길로 — 고칠 것 없이 그 장소·하는 일이 SCENE 에 실린다 */
let legacy=0;
for(const [k,v] of Object.entries(tree.legacy)){
 if(k.endsWith('/'))continue;
 const [cat,ex]=k.split('/'),sc=CT.fromLegacy(tree,{cat,ex}),fixed=CT.repair(tree,sc,null,S.CLOSE_FRAMES);
 for(const f of ['era','place','act','ofam','item'])assert.equal(fixed[f]||'',sc[f]||'',k+' '+f);
 const t=L.buildSingle({...base,cat,ex});
 assert(sceneBlock(t).includes('Place: '+CT.place(tree,sc.place).en)&&sceneBlock(t).includes('Activity: '+CT.act(tree,sc.act).en),k);
 legacy++;
}
assert(legacy>=470,'예전 예시 변환 '+legacy);
/* pkm 몫 — 포켓몬 세계·직업 현장·동료 포켓몬·나무열매, 직업 예시 예순다섯은 추천 조합 하나씩 */
for(const g of ['pokeworld','work','partner','berry'])assert(tree.groups.some(x=>x.key===g),'group '+g);
assert(CT.group(tree,'partner').companion,'partner group carries the companion line');
const jobs=tree.presets.filter(p=>p.group==='occupation_basic'||p.group==='occupation_sensual');
assert(jobs.length>=60,'jobs '+jobs.length);
for(const p of jobs){
 const t=L.buildSingle(CT.applyPreset(tree,{...base},p.key));
 assert(sceneBlock(t).includes('Activity: working as'),p.key);
 if(p.outfit==='work')assert(t.includes('Outfit note: her own original workwear'),p.key+' original workwear');
 assert(!/orbital logistics|test pilot|avionics|heavy crane|Gundam/i.test(t),p.key);
 assert(t.includes('WORLD: this scene happens inside the Pokémon world'),p.key+' Pokémon world');
}
/* 동료 포켓몬 묶음만 동료 한 마리를 허락한다 — 다른 장소는 그대로 한 명만 */
{
 const care=L.buildSingle({...base,cat:'partner_care',ex:'care_brushing'});
 assert(care.includes('exactly one Pokémon companion'),'partner_care allows one companion');
 assert(!care.includes('no creature beside her'),'partner_care must not forbid its own companion');
 const other=L.buildSingle({...base,cat:'hobbies_leisure',ex:'hobby_music'});
 assert(other.includes('no creature beside her')&&!other.includes('Pokémon companion as the scene'),'other places stay one figure');
 for(const a of tree.activities.filter(a=>a.companion))for(const f of ['face_close','chest_up'])assert(!CT.frameOk(tree,a.key,f),a.key+' '+f+' crops the companion out');
}
/* 시대 줄 — 첫 등장 무렵은 세대의 해(1세대 1996 · 9세대 2022), 포켓몬 세계 안은 WORLD, 무대·환상은 SETTING */
{
 const r1=L.buildSingle(scene('release','home_living','read_book','everyday'));
 assert(r1.includes('ERA: set this scene in the real world around 1996, when her Pokémon first appeared'),'gen 1 → 1996');
 const r9=L.buildSingle(scene('release','home_living','read_book','everyday',{gen:9}));
 assert(r9.includes('around 2022'),'gen 9 → 2022');
 assert(!L.buildSingle(scene('now','home_living','read_book','everyday')).includes('ERA:'),'now has no ERA line');
 const pw=L.buildSingle(scene('in_pokemon','pw_center','center_wait','everyday'));
 assert(pw.includes('WORLD: this scene happens inside the Pokémon world')&&pw.includes('No Pokémon unless SCENE names her companion'),'Pokémon world');
 assert(L.buildSingle(scene('fantasy','fx_studio','editorial_pose','editorial')).includes('SETTING: a stylised stage'),'fantasy');
 /* 첫 등장 해 전의 장소는 그 시대에 없다 — 인피니티 풀(2000)은 1세대 무렵엔 없다 */
 assert(!CT.places(tree,'release',{gen:1}).some(p=>p.key==='water_infinity')&&CT.places(tree,'release',{gen:9}).some(p=>p.key==='water_infinity'),'infinity pool after 2000');
}
/* 차례 — FRAME 바로 밑에 CROP·시대 줄·SCENE, 그 뒤에 옷·각도 줄(game 과 같다) */
{
 const t=L.buildSingle(scene('release','home_living','read_book','everyday',{frame:'chest_up'}));
 const at=k=>t.indexOf(k);
 assert(at('FRAME:')<at('CROP:')&&at('CROP:')<at('ERA:')&&at('ERA:')<at('SCENE (chosen):\n')&&at('SCENE (chosen):\n')<at('WARDROBE:')&&at('WARDROBE:')<at('ANGLE:'),'line order');
 assert(t.includes('CROP: a chest-up shot')&&t.includes('the part of that outfit inside the crop must read at first glance'),'close crop + close wardrobe');
 const far=L.buildSingle(scene('now','home_living','read_book','everyday',{frame:'full_body'}));
 assert(!far.includes('CROP:')&&far.includes('that outfit must read at first glance, keeping its own recognisable colours'),'far cut keeps the full wardrobe line');
}
/* 안 쓰는 값·얼굴 클로즈업 조건 — 트리 표가 거르고, 조립부는 고친 길로 짓는다 */
{
 const back=L.buildSingle(scene('now','street_park','stroll','everyday',{orient:'back_to_camera',frame:'detail'}));
 assert(!back.includes(S.ORIENTATION_GUIDES.back_to_camera[1])&&!back.includes(S.FRAME_GUIDES.detail[1]),'banned orient/frame dropped');
 const lin=L.buildSingle(scene('now','home_bedroom','dress_up','lingerie',{frame:'face_close'}));
 assert(!lin.includes('CROP: a close-up'),'no face close-up on a required cut');
 assert(CT.frameOk(tree,'dress_up','face_close',{era:'now',place:'home_bedroom',act:'dress_up',ofam:'homewear'}),'face close-up allowed off the required cuts');
 assert(!CT.orients(tree,'stroll','face_close',S.CLOSE_FRAMES).includes('rear_3q')&&CT.orients(tree,'stroll','face_close',S.CLOSE_FRAMES).includes('front'),'face close-up faces the camera');
}
/* 자세·프레이밍·렌즈 — 표마다 풀이가 있고, 트리가 허락하는 자리에서 고르면 프롬프트에 실린다 */
const paths=[];
for(const e of tree.eras)for(const p of CT.places(tree,e.key,null))for(const a of CT.acts(tree,e.key,p.key)){const f=CT.outfitFamilies(tree,e.key,p.key,a.key)[0];if(f)paths.push({era:e.key,place:p.key,act:a.key,ofam:f.key});}
assert(S.POSE_OPTIONS.length>=35);
for(const [key] of S.POSE_OPTIONS.filter(r=>r[0])){
 assert(S.POSE_GUIDES[key]?.[0],key+' description');
 const at=paths.map(p=>({...p,frame:'full_body'})).find(p=>CT.poses(tree,p.act,'full_body').includes(key)&&CT.frameOk(tree,p.act,'full_body',p))||
  paths.map(p=>({...p,frame:'waist_up'})).find(p=>CT.poses(tree,p.act,'waist_up').includes(key)&&CT.frameOk(tree,p.act,'waist_up',p));
 assert(at,key+' has a place in the tree');
 assert(L.buildSingle({...base,...at,pose:key}).includes(S.POSE_GUIDES[key][1]),key);
}
for(const [options,guides,key] of [[S.FRAME_OPTIONS,S.FRAME_GUIDES,'frame'],[S.LENS_OPTIONS,S.LENS_GUIDES,'lens']]){
 assert(options.length>=6);
 for(const [value] of options.filter(r=>r[0])){
  assert(guides[value]?.[0],value+' description');
  if(key==='frame'&&CT.banned(tree,'frames').includes(value))continue;
  const sc=scene('now','street_park','stroll','everyday',{[key]:value});
  assert(L.buildSingle(sc).includes(guides[value][1]),value);
 }
}
const camera={frame:'three_quarter',lens:'portrait85',camera:'KEEP_CUSTOM_CAMERA',pose:'offering_food'};
const casual=L.buildSingle({...base,...camera,cat:'partner_care',ex:'care_feeding'});
assert(casual.includes('KEEP_CUSTOM_CAMERA')&&casual.includes(S.POSE_GUIDES.offering_food[1]),'companion pose on a companion act');
assert(!L.buildSingle(scene('now','street_park','stroll','everyday',{pose:'offering_food'})).includes(S.POSE_GUIDES.offering_food[1]),'companion pose needs a companion');
assert(casual.includes('SCENE (chosen):'));
assert(!casual.includes('FORM —'));
assert(P.buildPrompt({...base,outputMode:'action',frame:'CUSTOM_CROP'}).includes('CUSTOM_CROP'));
// 개방은 첨부한 그림의 카메라를 그대로 — 일상 카메라·자세가 새지 않는다
const open=P.buildPrompt({...base,...camera,outputMode:'action',form:'overdrive',baseForm:'heavy'});
for(const s of ['KEEP_CUSTOM_CAMERA',S.FRAME_GUIDES.three_quarter[1],S.LENS_GUIDES.portrait85[1],S.POSE_GUIDES.offering_food[1]])
 assert(!open.includes(s),'casual camera/pose leaked to overdrive');
// 일상컷 화면비 — 기본 2:3 도 늘 FRAME 줄로 싣는다. 고르면 그 비율 하나만(SCENE 에 겹쳐 싣지 않는다) (2026-10-28)
{
 const plain=L.buildSingle({...base,cat:'hobbies_leisure',ex:'hobby_music'});
 assert(plain.includes('FRAME: a vertical 2:3 (1024×1536) image.')&&!plain.includes('Aspect ratio'),'casual FRAME default 2:3');
 for(const [a,w] of [['3:2','a horizontal 3:2 (1536×1024)'],['1:1','a square 1:1'],['9:16','a tall vertical 9:16'],['16:9','a wide horizontal 16:9']]){
  const t=L.buildSingle({...base,cat:'hobbies_leisure',ex:'hobby_music',aspect:a});
  assert(t.includes('FRAME: '+w)&&!t.includes('2:3')&&!t.includes('Aspect ratio'),'casual FRAME '+a);
 }
 assert(P.buildPrompt({...base,outputMode:'action',aspect:'3:2'}).includes('Aspect ratio: 3:2')&&!P.buildPrompt({...base,outputMode:'action'}).includes('FRAME:'),'action keeps its own aspect rule');
}
// 일상컷 옷은 장면의 옷 그대로 — 포켓몬의 특징은 장신구·주변 사물로만(2026-10-29, game 에서 먼저)
{
 assert(!/color echo|motif on the clothing|source palette and motifs in clothing|integrated into everyday clothing/.test(JSON.stringify(S.PROMPT_LINES)+JSON.stringify(S.SCENE_AXIS_GUIDES)),'old clothing-motif wording remains');
 const t=L.buildSingle({...base,cat:'hobbies_leisure',ex:'hobby_music'});
 assert(t.includes("Do not carry the attached image's palette, patterns or trim into the outfit")&&t.includes("never in the outfit's colours, patterns or cut"),'outfit ignores the attached palette');
 for(const v of ['subtle','balanced','strong']){
  const s=L.buildSingle({...base,cat:'hobbies_leisure',ex:'hobby_music',axes:{source_influence:v}});
  assert(/accessor|props|object in the scene/.test((s.match(/source_influence: [^\n]*/)||[''])[0]),'source_influence '+v+' uses accessories and props');
 }
 /* 가까운 컷의 노출 풀이 — 크롭 안에서만 */
 const c=L.buildSingle(scene('now','street_park','stroll','everyday',{frame:'chest_up',axes:{skin_exposure:'bold'}}));
 assert(c.includes('skin_exposure: bold — '+S.CLOSE_AXIS_GUIDES.skin_exposure.bold),'close exposure guide');
}
/* 옷 직접 쓰기는 고른 옷을 이긴다 · 전통 의상 안내 줄 */
{
 const t=L.buildSingle(scene('now','street_park','stroll','everyday',{item:'jeans_tee',outfit:'MY_OUTFIT'}));
 assert(sceneBlock(t).includes('Outfit: MY_OUTFIT')&&!sceneBlock(t).includes(CT.item(tree,'everyday','jeans_tee').en),'typed outfit wins');
 const tr=L.buildSingle({...base,cat:'traditional',ex:'aodai_daily'});
 assert(/ao dai|mandarin collar/i.test(tr),'ao dai item');
 assert(tr.includes("Outfit note: the traditional dress named in Outfit wins over her apparent ethnicity"),'traditional guide');
}
console.log('PASS casual tree: 예전 예시 '+legacy+'개 변환 · 포켓몬 묶음·직업 '+jobs.length+' · 동료 줄 · 시대 줄(세대의 해) · 줄 차례 · 안 쓰는 값·클로즈업 조건 · 자세·프레이밍·렌즈 · 카메라·개방 분리 · 화면비 · 옷');
