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
const base={style:'glossy_promo',form:'light',outputMode:'portrait',identityMode:'create',params:[]};
for(const c of cards){
 const st={...base,mech:c.name,sourceName:c.en,sourceAppearance:data.entries[c.no],motifs:''};
 const text=P.buildPrompt(st),targets=P.featureInsetSuggestions(st);
 assert(text.includes('Source appearance cues:'));
 assert(text.includes(data.entries[c.no].features[0].detail),c.en);
 assert.equal(new Set([targets.front,targets.rear,targets.function]).size,3,c.en+' duplicate insets');
 for(const v of [targets.front,targets.rear,targets.function])assert(text.includes(v));
 assert(!text.includes('REAR MOUNTING SYSTEM —'),'backpack category forced');
 for(const outputMode of ['portrait','action','casual']){
  const ref=P.buildPrompt({...st,outputMode,identityMode:'reference'});
  assert(!ref.includes('Source appearance cues:'),'source data must not overwrite approved design');
  assert(!ref.includes('[FEATURE INSET LIST — FIXED]'));
 }
}
const st={...base,mech:'꼬부기',sourceAppearance:data.entries['7']};
const overridden=P.buildPrompt({...st,motifs:'USER_MOTIFS',featureInsets:{rear:'USER_TARGET'}});
assert(overridden.includes('USER_MOTIFS')&&overridden.includes('USER_TARGET'));
assert(!overridden.includes('Source appearance cues:'));
assert(!overridden.includes(data.entries['7'].features[0].detail));
assert(P.buildPrompt({...st,sourceAppearance:null}).includes('[OUTPUT MODE]'));
assert(!/jet|nozzle|reactor/i.test(data.entries['7'].features.map(f=>f.detail).join(' ')));
assert.equal(data.entries['964'].formScope,'Zero Form');
assert.equal(data.entries['718'].formScope,'50% Forme');
console.log('PASS 1025 source records; 4100 create/reference prompts; overrides, distinct insets, provenance and corruption checks');
