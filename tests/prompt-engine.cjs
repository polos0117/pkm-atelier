/* 프롬프트 계약 (2026-10-02 간결화). 화면 없이 node 로 돈다.
   - 새 인물: 첨부 없이 한 장. 원작 특징은 "어떻게 입나"(WEAR) 로만 — 장착점·가림·FAIL 법조문은 없다.
   - 이어가기: 확정한 그림을 첨부하고 장갑 겹만 바꾼다. 외형 값·색·입는 법을 다시 싣지 않는다.
   - 개방: 그 폼 그림을 첨부하고 같은 그림에서 판만 연다.
   - 일상: 평상복. 장갑·폼 말이 새지 않는다. */
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const ctx={window:{},console}; vm.createContext(ctx);
for(const f of ['prompt-spec','figures','toolkit','prompt-anthro','prompt-lifestyle'])
  vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const {AtelierSpec:S,AtelierPrompt:P,AtelierLifestyle:L}=ctx.window;
const app=JSON.parse(fs.readFileSync('data/source-appearance.json','utf8')).entries;
const cards=JSON.parse(fs.readFileSync('data/card.json','utf8')).cards.character;
const words=t=>(t.match(/\S+/g)||[]).length;
function input(name,extra){
 const c=cards.find(x=>x.name===name||x.en===name);
 return {mech:c.name,sourceName:c.en,series:[c.element,c.element2].filter(Boolean).join(' / '),
  sourceAppearance:app[String(c.no)],style:'glossy_promo',params:[],outputMode:'action',identityMode:'create',form:'light',...extra};
}
const build=(name,extra)=>P.buildPrompt(input(name,extra));
assert(Object.values(S).every(x=>typeof x!=='function'),'spec stays data');
assert.equal(S.ART_STYLES.length,14);
for(const [k] of S.ART_STYLES) assert(S.ACTION_STYLE_CORES[k]&&S.CASUAL_STYLE_CORES[k],'style lines: '+k);

/* 옛 법조문이 돌아오면 실패 — 이 문단들이 "보여 주려고 옮기는" 그림을 만들었다 */
const LAW=['MOUNT','OCCLUSION','FAIL','REFERENCE ROLES','PLATE DISCIPLINE','INSET','reference sheet','sacral','spinal','hardpoint',
 'equipment readable','show every core component','rear view','three-quarter rear','[GENERATION INPUT]','[CHARACTER IDENTITY]'];
const law=t=>LAW.filter(w=>t.includes(w));

/* 꼬부기 — 보고된 실패(등딱지가 어깨에, 꼬리가 엉덩이 옆 원판)의 종 */
const sq=build('꼬부기');
assert.deepEqual(law(sq),[],'law block came back');
assert(sq.startsWith('INPUT: text only'),'new character needs no image');
assert(sq.includes('omit referenced_image_paths and num_last_images_to_include'));
assert(sq.includes('SOURCE: Squirtle (꼬부기), water type.'));
assert(sq.includes('PALETTE: brown, white, light blue, pale yellow.'),'colors from the data, body color first');
assert(sq.includes('the brown dorsal shell with white rim becomes a dome-backed mantle'),'shell is worn, not mounted');
assert(sq.includes('the pale-yellow belly shell becomes her breastplate'));
assert(sq.includes('the inward-curled long tail becomes a long sash hanging from the back of her belt'));
assert(!sq.includes('light-blue skin'),'a skin color must not reach the prompt as a noun');
assert(sq.includes('Her skin is human skin.'));
assert(sq.includes('nothing is carried, mounted or put on display'));
assert(sq.includes(S.FORM_LINES.light)&&sq.includes(S.ACTION_STYLE_CORES.glossy_promo));
assert(sq.includes('face toward the camera')&&sq.includes('never a back view'));
assert(!sq.includes('IDENTITY'),'no identity block without chosen values');
/* 손 줄 — 개수·모양·자세·장갑·효과. 옛 "drawn correctly as hands" 한 줄로는 손가락이 늘고 뭉쳤다 */
assert(sq.includes(S.PROMPT_LINES.hands)&&sq.includes(S.PROMPT_LINES.handsArmor),'action carries the hand line');
assert(sq.includes('one thumb and four fingers')&&sq.includes('never fingerless')&&sq.includes('no hand thrust at the camera'));
assert(!sq.includes('drawn correctly as hands'),'the weak hand line came back');
assert(words(sq)<=400,'anchor budget: '+words(sq));

/* 머리 특징 표현을 고르면 자동 머리 문장(귀·볼주머니)을 대신한다 */
const pk=build('피카츄'), pkHead=build('피카츄',{headFeature:'accessory'});
assert(pk.includes('long black-tipped ears become a headpiece')&&pk.includes('cheek pouches become two small round ornaments'));
assert(pkHead.includes('HEAD: her species head features are echoed by small jewelry'));
assert(!pkHead.includes('ears become')&&!pkHead.includes('pouches become'),'head option replaces automatic head wear');
assert(pkHead.includes('lightning-shaped tail becomes'),'non-head wear stays');
assert(build('피카츄',{headFeature:'MY_HEAD_TEXT'}).includes('HEAD: MY_HEAD_TEXT.'));
/* 직접 쓴 입는 법이 자동을 대신한다 */
const mine=build('꼬부기',{motifs:'MY_WEAR_TEXT'});
assert(mine.includes('WEAR (user choice): MY_WEAR_TEXT.')&&!mine.includes('dome-backed mantle'));

/* 폼 셋은 겹으로 갈린다 */
const forms={light:'one close-fitting armor layer',heavy:'plates over plates',mobility:'split and fan outward and back'};
for(const [form,mark] of Object.entries(forms)) for(const identityMode of ['create','reference']){
 const t=build('꼬부기',{form,identityMode});
 assert(t.includes(mark),form);
 for(const [other,m] of Object.entries(forms)) if(other!==form) assert(!t.includes(m),form+' carries '+other);
 assert.deepEqual(law(t),[],form+' law');
}
/* 이어가기 — 첨부가 인물을 정한다. 외형 값·색·입는 법을 다시 싣지 않는다 */
const params=[['hair color','mint'],['eye color','red'],['jaw & chin','soft rounded jaw']];
const ref=build('꼬부기',{identityMode:'reference',form:'heavy',params});
assert(ref.startsWith('INPUT: the attached image is the approved character'));
assert(ref.includes('the HEAVY form of the woman in the attached image'));
assert(ref.includes('change only her armor'));
assert(ref.includes('the species features she wears as costume'));
for(const s of ['PALETTE','WEAR','IDENTITY','mint','U-shaped','omit referenced_image_paths']) assert(!ref.includes(s),'continuation re-sends '+s);
assert(ref.includes(S.PROMPT_LINES.hands)&&ref.includes(S.PROMPT_LINES.handsArmor));
assert(words(ref)<=310,'continuation budget: '+words(ref));
assert(build('꼬부기',{identityMode:'reference',motifs:'KEEP_THIS'}).includes('MOTIFS to keep: KEEP_THIS.'));
/* 새 인물은 고른 외형만 */
const chosen=build('꼬부기',{params});
assert(chosen.includes(S.PROMPT_LINES.identity)&&chosen.includes('hair color: mint')&&chosen.includes('both eyes are red'));
assert(build('꼬부기',{params:[['body measurements (B/W/H)','94 / 61 / 95']]}).includes('circumferences in cm'));

/* 개방 — 첨부한 그 폼 그림에서 판만. 기준 폼마다 여는 법, 타입마다 빛 */
for(const base of ['light','heavy','mobility','reference']){
 const t=build('꼬부기',{form:'overdrive',baseForm:base,params,frame:'waist_up',pose:'low_guard',custom:'OPEN_NOTE'});
 assert(t.includes(S.OPEN_LINES[base]),base);
 assert(t.includes(S.TYPE_ENERGY.water));
 assert(t.includes('same picture before and after')&&t.includes("Keep its camera, pose, framing, subject scale"));
 assert(t.includes('No new armor, no new helmet, no weapon'));
 assert(!t.includes('FORM —')&&!t.includes('IDENTITY')&&!t.includes('WEAR')&&!t.includes('PALETTE'),base+' overdrive re-designs');
 assert(!t.includes(S.FRAME_GUIDES.waist_up[1]),'overdrive keeps the attached camera');
 assert(t.includes('NOTE: OPEN_NOTE'));
 assert.deepEqual(law(t),[]);
 assert(t.includes(S.PROMPT_LINES.handsKeep),base+' overdrive keeps the hands');
 assert(!/hands and expression tighten/.test(t)&&t.includes('eyes keep their color'),base+' overdrive moves hands or eye color');
 assert(!t.includes('never fingerless'),'overdrive must not re-glove the attached hands');
 assert(words(t)<=240,'overdrive budget: '+words(t));
}
assert(build('꼬부기',{form:'overdrive',baseForm:'heavy'}).includes("attach this character's heavy-form card image"));
assert(build('파이리',{form:'overdrive',baseForm:'light'}).includes(S.TYPE_ENERGY.fire));
for(const type of new Set(cards.map(c=>c.element))) assert(S.TYPE_ENERGY[type],'energy for '+type);

/* 일상 — 평상복. 장갑·폼·입는 법이 새지 않는다 */
const cas=L.buildSingle(input('꼬부기',{cat:'everyday_basic',form:'heavy',params}));
assert(cas.startsWith('CHARACTER: the same woman as the attached image'));
assert(cas.includes('STYLE: '+S.CASUAL_STYLE_CORES.glossy_promo));
assert(cas.includes('never armor, never a creature costume'));
for(const s of ['FORM —','WEAR','PALETTE','IDENTITY','mint','plates']) assert(!cas.includes(s),'casual carries '+s);
for(const [k] of S.ART_STYLES) assert(!/armor|mecha|hard-surface|mechanical/i.test(S.CASUAL_STYLE_CORES[k]),'casual style speaks armor: '+k);
assert(cas.includes(S.PROMPT_LINES.hands)&&!cas.includes('Gloves'),'casual: hand line without armor gloves');
assert(words(cas)<=360,'casual budget: '+words(cas));

/* 1025종 전부 — 입는 법은 표에 있는 부위만, 몸 부위 소음 없음, 예산 안 */
/* 몸 부위(코·입·눈·다리·몸통·털·피부…)로 적힌 특징은 입는 법 문장이 되지 않는다 — 색만 PALETTE 로 */
const BODY=/^(nose|mouth|lip|toe|finger|eye|pupil|iris|snout|tooth|beak|neck|leg|arm|paw|foot|hand|head|face|body|fur|skin|limb|muzzle|jaw|belly|chest|torso|abdomen|back|waist|digit|tongue|eyebrow|eyelash|brow|sclera|hoof|hair|underside|coat)$/;
let most=[0,''], none=0;
for(const c of cards){
 const s=input(c.name,{}), w=P.wearClauses(s), t=P.buildPrompt(s);
 assert(w.length<=5,c.en);
 w.forEach(x=>assert(/ becomes? /.test(x),c.en+': '+x));
 for(const f of s.sourceAppearance.features) if(BODY.test(String(f.part).toLowerCase()))
  assert(!w.some(x=>x.startsWith('the '+f.detail+' ')),c.en+' body part as wear: '+f.detail);
 assert(!/undefined|\[object Object\]|\{\w+\}/.test(t),c.en);
 assert.deepEqual(law(t),[],c.en);
 if(!w.length) none++;
 if(words(t)>most[0]) most=[words(t),c.en];
 const pal=P.palette(s); assert(pal.length<=5,c.en);
}
assert(most[0]<=400,'anchor budget over 1025: '+most.join(' '));
assert(none<120,'too many species get no wear line: '+none);

/* 스타일·모드 행렬 */
let matrix=0;
for(const [style] of S.ART_STYLES) for(const identityMode of ['create','reference'])
 for(const form of ['light','heavy','mobility','overdrive']) for(const baseForm of ['light','reference']){
  const t=build('이상해씨',{style,identityMode,form,baseForm});
  assert(t.includes(S.ACTION_STYLE_CORES[style]),style);
  assert(!/undefined|\{\w+\}/.test(t));
  matrix++;
 }
/* 옛 저장값의 폼 초상은 액션으로 */
assert.equal(build('꼬부기',{outputMode:'portrait'}),sq);
for(const bad of [{style:'nope'},{form:'nope'},{form:'overdrive',baseForm:'nope'},{outputMode:'nope'},{identityMode:'nope'}])
 assert.throws(()=>build('꼬부기',bad),JSON.stringify(bad));
assert.throws(()=>P.buildPrompt({style:'glossy_promo'}),/Source creature/);
console.log(`PASS 프롬프트: 꼬부기 앵커 ${words(sq)}낱말 · 이어가기 ${words(ref)} · 일상 ${words(cas)} · 1025종 최대 ${most[0]}(${most[1]}) · 입는 법 없는 종 ${none} · 행렬 ${matrix}`);
