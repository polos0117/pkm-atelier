/* Coverage, bounded source text, identity isolation and no-input generation. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const data=require('../data/source-appearance.json');
const cards=require('../data/card.json').cards.character;
function validate(d){
 assert.equal(Object.keys(d.entries).length,1025);
 for(const c of cards){
  const e=d.entries[c.no];assert(e,'missing '+c.no);assert.equal(e.name,c.name);assert.equal(e.en,c.en);
  assert(e.features.length>=3&&e.features.length<=6,'sparse '+c.no);
  assert(e.features.every(f=>typeof f.part==='string'&&typeof f.detail==='string'&&f.detail.trim()));
  assert.equal(new Set(e.features.map(f=>f.part)).size,e.features.length,'duplicate part '+c.no);
  assert(e.features.map(f=>f.detail).join(' ').split(/\s+/).length<=24,'source word budget '+c.no);
  assert(/^https:\/\/bulbapedia\.bulbagarden\.net\/wiki\//.test(e.source));
  assert(Number.isInteger(e.revision)&&e.revision>0);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(e.retrieved));
  assert(!/undefined|\[object Object\]|\{\{|\[\[|<script/i.test(e.features.map(f=>f.detail).join(' ')));
 }
}
// Deliberate corruptions must fail before accepting the dataset.
const missing=structuredClone(data);delete missing.entries['1025'];assert.throws(()=>validate(missing));
const empty=structuredClone(data);empty.entries['7'].features=[];assert.throws(()=>validate(empty));
validate(data);
assert.equal(data.sources.license,'CC-BY-NC-SA-2.5');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['prompt-spec','casual-tree','prompt-anthro'])vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const P=ctx.window.AtelierPrompt;
const base={style:'glossy_promo',form:'light',outputMode:'action',identityMode:'create',params:[],tree:JSON.parse(require('node:fs').readFileSync('data/casual-tree.json','utf8'))};
// 자료는 새 인물에만 — 색(PALETTE)과 입는 법(WEAR)으로. 이어가기·개방·일상은 첨부가 정하므로 다시 싣지 않는다.
// 메카 지시문은 칸 꼴(2026-11-11) — PALETTE 는 3칸 「Colours:」, WEAR 는 3칸 「Wear:」, SOURCE 는 머리말 「Source:」(줄 꼴 이름은 일상컷 · 스위치 끈 판)
const CF=ctx.window.AtelierSpec.CORE_FRAME, sec3=t=>(t.split('\n\n').find(b=>b.startsWith('3. '))||'');
const REDO=/(?:^|\n)(?:WEAR|Wear|PALETTE|Colours)[ :(]/;
let worn=0,prompts=0;
for(const c of cards){
 const st={...base,mech:c.name,sourceName:c.en,series:c.element,sourceAppearance:data.entries[c.no],motifs:''};
 const text=P.buildPrompt(st),wear=P.wearClauses(st),pal=P.palette(st);prompts++;
 assert(text.startsWith('Input: text only')&&text.includes('\n\n'+CF.s1+'\n'),c.en+' 칸 꼴');
 if(wear.length){worn++;assert(sec3(text).includes('\nWear: '+wear.join('; ')+'.'),c.en);}
 if(pal.length)assert(sec3(text).includes('\nColours: '+pal.join(', ')+'.'),c.en);
 assert(!/\b(?:light|pale|dark)?[- ]?\w+[- ]skin\b/.test(text.replace('Her skin is human skin.','')),c.en+': a skin color reached the prompt');
 for(const extra of [{identityMode:'reference'},{form:'overdrive',baseForm:'light'},{outputMode:'casual'}]){
  const ref=P.buildPrompt({...st,...extra});prompts++;
  assert(!REDO.test(ref)&&!(wear.length&&ref.includes(wear[0]))&&!(pal.length>1&&ref.includes(pal.join(', '))),c.en+' source data overwrote the approved image');
 }
}
assert(worn>=900,'species with a wear line: '+worn);
const st={...base,mech:'꼬부기',sourceName:'Squirtle',series:'water',sourceAppearance:data.entries['7']};
const overridden=P.buildPrompt({...st,motifs:'USER_MOTIFS'});
assert(sec3(overridden).includes('\nWear (user choice): USER_MOTIFS.'));
assert(!overridden.includes(data.entries['7'].features[0].detail+' becomes'));
assert(P.buildPrompt({...st,sourceAppearance:null}).includes('\nSource: Squirtle (꼬부기), water type.\n'),'missing data still builds');
assert(!/jet|nozzle|reactor/i.test(data.entries['7'].features.map(f=>f.detail).join(' ')));
assert.equal(data.entries['964'].formScope,'Zero Form');
assert.equal(data.entries['718'].formScope,'50% Forme');
console.log('PASS 1025 source records; '+prompts+' create/continuation prompts; wear lines for '+worn+' species, overrides, provenance and corruption checks');
