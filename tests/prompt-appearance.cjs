/* Appearance semantics and generated prompts, including saved-key compatibility. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['prompt-spec','prompt-anthro'])vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const {AtelierSpec:S,AtelierPrompt:P}=ctx.window;
const params=require('./fixtures/appearance-bulbasaur.json');
const base={mech:'이상해씨',sourceName:'Bulbasaur',series:'grass / poison',style:'glossy_promo',form:'light',outputMode:'portrait',identityMode:'create',params,expr:'smirk'};
const build=override=>P.buildPrompt({...base,...override});
const identity=t=>t.split('[CHARACTER IDENTITY]')[1].split('[FORM DEFINITION]')[0];
const original=JSON.stringify(params);
const full=build();
assert(full.includes('U-shaped lower-face outline'),'rounded jaw must specify actual outline');
assert(full.includes('no pointed apex, V taper'),'rounded jaw must exclude the observed failure');
assert(full.includes('no added cheek fullness'),'round jaw must not mean fuller cheeks');
assert(!full.includes('hair length: medium'),'fixed pixie cut cannot output shoulder-length hair');
assert(full.includes('short pixie range'));
assert(full.includes('both eyes are red'));
assert(!full.includes('second eye color:'),'duplicate same-eye entry');
assert(!full.includes('parameter precedence:'),'old global parent precedence must not affect unrelated groups');
assert(!full.includes('must clearly read as Korean'),'ancestry must not override explicit geometry');
assert(identity(full).includes('actual outline in every view and inset'));
assert(full.length<12000,'detailed fixture exceeds compacted budget');
assert.equal(JSON.stringify(params),original,'assembly mutated stored settings');
const sharp=build({params:[['jaw & chin','narrow tapered chin']]});
assert(!sharp.includes('U-shaped lower-face outline'),'round lock leaked into another jaw');
const eyes=build({params:[['eye shape','sharp'],['eye tilt','downturned outer corners'],['eye color','amber']]});
assert(eyes.includes('outer eye corners lower than inner corners'));
assert(!identity(eyes).includes('upward corners'),'conflicting eye-shape tilt survives');
assert(eyes.includes('both eyes are amber'),'blank left must inherit right');
const odd=build({params:[['eye color','amber'],['second eye color','blue']]});
assert(odd.includes('right eye is amber')&&odd.includes('left eye is blue'));
assert(build({params:[['second eye color','blue']]}).includes('different from blue'));
assert(build({params:[['hairstyle','pixie cut'],['hair length','CUSTOM_LENGTH']]}).includes('hair length: CUSTOM_LENGTH'));
assert(!identity(build({params:[['eye shape','large'],['eye size','small']]})).includes('eye shape: large'));
assert(build({params:[['hairstyle','CUSTOM_CUT'],['hair length','CUSTOM_LENGTH']]}).includes('hair length: CUSTOM_LENGTH'));
assert(build({params:[['body measurements (B/W/H)','94 / 61 / 95']]}).includes('circumferences in cm'));
let options=0;
for(const d of S.PARAM_DEFS.filter(d=>S.IDENTITY_GROUPS.includes(d.group)&&!S.IDENTITY_EXCLUDED.includes(d.key))) {
 for(const [v] of d.options.filter(([v])=>v&&v!=='__custom__')) {
  const t=build({params:[[d.key,v]]});
  assert(!/undefined|\[object Object\]/.test(t),d.key+'/'+v);
  if(!['facial ethnicity','eye color','second eye color','hair color'].includes(d.key)) {
   assert(S.PARAM_GUIDES[d.key]?.[v]?.every(Boolean),'missing option explanation '+d.key+'/'+v);
  }
  options++;
 }
}
for(const k of S.LOCAL_AXES)for(const v of S.ADVANCED_OPTIONS[k].filter(v=>v!=='AUTO')) {
 const t=build({outputMode:'casual',axes:{[k]:v}});
 assert(S.SCENE_AXIS_GUIDES[k][v].every(Boolean));
 assert(t.includes(S.SCENE_AXIS_GUIDES[k][v][1]));
 assert(!build({axes:{[k]:v}}).includes(k+':'),'scene axis leaked into portrait');
}
for(const [v] of S.ORIENTATION_OPTIONS.filter(([v])=>v)) {
 assert(S.ORIENTATION_GUIDES[v].every(Boolean));
 assert(build({outputMode:'action',orient:v}).includes(S.ORIENTATION_GUIDES[v][1]));
 assert(!build({orient:v}).includes('orient:'),'scene orientation leaked into sheet');
}
let matrix=0;
for(const [style] of S.ART_STYLES)for(const outputMode of ['portrait','action','casual'])
 for(const identityMode of ['create','reference'])for(const form of ['light','heavy','mobility','overdrive']) {
  const t=build({style,outputMode,identityMode,form,baseForm:'heavy'});
  assert(!/undefined|\[object Object\]/.test(t));
  const fresh=identityMode==='create'&&outputMode!=='casual';
  assert.equal(t.includes('U-shaped lower-face outline'),fresh,'identity controls leaked');
  assert.equal(t.includes('PARAM_GUIDES'),false);
  matrix++;
 }
console.log(`PASS appearance: ${options} saved options, ${matrix} output combinations; detailed sheet ${full.length} characters`);
