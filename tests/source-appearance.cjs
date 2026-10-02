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
for(const f of ['prompt-spec','prompt-anthro'])vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const P=ctx.window.AtelierPrompt;
const base={style:'glossy_promo',form:'light',outputMode:'action',identityMode:'create',params:[]};
// 자료는 새 인물에만 — 색(PALETTE)과 입는 법(WEAR)으로. 이어가기·개방·일상은 첨부가 정하므로 다시 싣지 않는다.
let worn=0,prompts=0;
for(const c of cards){
 const st={...base,mech:c.name,sourceName:c.en,series:c.element,sourceAppearance:data.entries[c.no],motifs:''};
 const text=P.buildPrompt(st),wear=P.wearClauses(st),pal=P.palette(st);prompts++;
 if(wear.length){worn++;assert(text.includes('WEAR: '+wear.join('; ')+'.'),c.en);}
 if(pal.length)assert(text.includes('PALETTE: '+pal.join(', ')+'.'),c.en);
 assert(!/\b(?:light|pale|dark)?[- ]?\w+[- ]skin\b/.test(text.replace('Her skin is human skin.','')),c.en+': a skin color reached the prompt');
 for(const extra of [{identityMode:'reference'},{form:'overdrive',baseForm:'light'},{outputMode:'casual'}]){
  const ref=P.buildPrompt({...st,...extra});prompts++;
  assert(!ref.includes('WEAR:')&&!ref.includes('PALETTE:'),c.en+' source data overwrote the approved image');
 }
}
assert(worn>=900,'species with a wear line: '+worn);
const st={...base,mech:'꼬부기',sourceName:'Squirtle',series:'water',sourceAppearance:data.entries['7']};
const overridden=P.buildPrompt({...st,motifs:'USER_MOTIFS'});
assert(overridden.includes('WEAR (user choice): USER_MOTIFS.'));
assert(!overridden.includes(data.entries['7'].features[0].detail+' becomes'));
assert(P.buildPrompt({...st,sourceAppearance:null}).includes('SOURCE: Squirtle (꼬부기), water type.'),'missing data still builds');
assert(!/jet|nozzle|reactor/i.test(data.entries['7'].features.map(f=>f.detail).join(' ')));
assert.equal(data.entries['964'].formScope,'Zero Form');
assert.equal(data.entries['718'].formScope,'50% Forme');
console.log('PASS 1025 source records; '+prompts+' create/continuation prompts; wear lines for '+worn+' species, overrides, provenance and corruption checks');
