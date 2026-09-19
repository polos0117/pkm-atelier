/* Casual options must reach the prompt, remain documented and respect mode boundaries. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const name of ['prompt-spec','prompt-anthro','prompt-lifestyle'])
 vm.runInContext(fs.readFileSync('lib/'+name+'.js','utf8'),ctx);
const {AtelierSpec:S,AtelierPrompt:P,AtelierLifestyle:L}=ctx.window;
const base={mech:'Pikachu',style:S.DEFAULT_STYLE,identityMode:'reference',form:'heavy'};
for(const cat of ['partner_care','travel_exploration','food_berries','festivals_contests','hobbies_leisure']){
 assert(S.CATS.some(r=>r[0]===cat),'missing category: '+cat);
 const rows=S.EXAMPLE_MAP[cat].filter(r=>r[0]&&r[0]!=='__custom__');
 assert(rows.length>=6,cat);
 for(const row of rows){
  assert(row[5]?.length>40,'scene needs an action: '+row[0]);
  assert(L.buildSingle({...base,cat,ex:row[0]}).includes(row[5]),row[0]);
 }
}
for(const [cat] of S.CATS){
 assert(S.CAT_KO[cat],cat+' description');
 const rows=S.EXAMPLE_MAP[cat]||[];
 assert.equal(new Set(rows.map(r=>r[0])).size,rows.length,cat+' duplicate keys');
 for(const row of rows.filter(r=>r[0]&&r[0]!=='__custom__'))
  assert(S.EX_NOTE[row[0]],'missing example description: '+row[0]);
}
// Keep existing saved job keys working, with the new setting and task instructions.
for(const cat of ['occupation_basic','occupation_sensual']){
 for(const row of S.EXAMPLE_MAP[cat].filter(r=>r[0]&&r[0]!=='__custom__')){
  const prompt=L.buildSingle({...base,cat,ex:row[0]});
  assert(row[5]?.length>40,'job needs tools and action: '+row[0]);
  assert(prompt.includes(row[5]));
  assert(!/orbital logistics|test pilot|avionics|heavy crane|Gundam/i.test(prompt));
 }
}
assert.match(L.exampleText('occupation_basic','orbital_logistics'),/Pokémon/);
assert.equal(L.exampleText('__custom__','__custom__','Custom scene'),'Custom scene');
assert(S.POSE_OPTIONS.length>=35);
for(const [key] of S.POSE_OPTIONS.filter(r=>r[0])){
 assert(S.POSE_GUIDES[key]?.[0],key+' description');
 assert(L.buildSingle({...base,pose:key}).includes(S.POSE_GUIDES[key][1]),key);
}
for(const [options,guides,key] of [[S.FRAME_OPTIONS,S.FRAME_GUIDES,'frame'],[S.LENS_OPTIONS,S.LENS_GUIDES,'lens']]){
 assert(options.length>=6);
 for(const [value] of options.filter(r=>r[0])){
  assert(guides[value]?.[0],value+' description');
  assert(L.buildSingle({...base,[key]:value}).includes(guides[value][1]),value);
 }
}
const camera={frame:'waist_up',lens:'wide24',camera:'KEEP_CUSTOM_CAMERA',pose:'offering_food'};
const casual=L.buildSingle({...base,...camera,cat:'partner_care',ex:'care_feeding'});
assert(casual.includes('KEEP_CUSTOM_CAMERA'));
assert(casual.includes('SELECTED SCENE PRIORITY:'));
assert(!casual.includes('[FORM DEFINITION]'));
assert(P.buildPrompt({...base,outputMode:'action',frame:'CUSTOM_CROP'}).includes('CUSTOM_CROP'));
for(const identityMode of ['create','reference']){
 const portrait=P.buildPrompt({...base,...camera,identityMode,outputMode:'portrait'});
 for(const s of ['KEEP_CUSTOM_CAMERA',S.FRAME_GUIDES.waist_up[1],S.LENS_GUIDES.wide24[1],S.POSE_GUIDES.offering_food[1]])
  assert(!portrait.includes(s),'casual camera/pose leaked to portrait');
}
console.log('PASS casual options: categories, descriptions, Pokémon jobs, poses, camera and mode isolation');
