/* Action selections are optional direction, never a new form or identity. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['prompt-spec','prompt-anthro'])vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const {AtelierSpec:S,AtelierPrompt:P}=ctx.window;
const base={mech:'Pikachu',style:S.DEFAULT_STYLE,identityMode:'reference',outputMode:'action',form:'light'};
assert(S.ACTION_CATEGORIES?.length>=8,'missing action categories');
assert(S.ACTION_CONTROLS?.length>=6,'missing detailed action controls');
let count=0;
for(const cat of S.ACTION_CATEGORIES){
 assert(cat.description&&cat.prompt,cat.key);
 assert(cat.examples.length>=3,cat.key);
 assert.equal(new Set(cat.examples.map(r=>r.key)).size,cat.examples.length);
 for(const ex of cat.examples){
  assert(ex.description&&ex.prompt,ex.key);
  const result=P.buildPrompt({...base,action:{category:cat.key,example:ex.key}});
  assert(result.includes(cat.prompt)&&result.includes(ex.prompt),ex.key);count++;
 }
}
for(const control of S.ACTION_CONTROLS){
 assert(control.description&&control.label&&control.promptLabel,control.key);
 assert.equal(new Set(control.options.map(r=>r.key)).size,control.options.length);
 for(const option of control.options){
  assert(option.description&&option.prompt,option.key);
  assert(P.buildPrompt({...base,action:{[control.key]:option.key}}).includes(option.prompt),option.key);
 }
}
for(const pose of S.ACTION_POSES){
 assert(pose.description&&pose.prompt,pose.key);
 assert(P.buildPrompt({...base,pose:pose.key}).includes(pose.prompt),pose.key);
 assert(!P.buildPrompt({...base,outputMode:'casual',pose:pose.key}).includes(pose.prompt));
}
const action={category:'ranged',example:'aimed_release',equipment:'unarmed',power:'none',effects:'none',speed:'still',environment:'forest',timing:'impact'};
for(const form of ['light','heavy','mobility','overdrive'])for(const identityMode of ['create','reference']){
 const input={...base,form,identityMode,baseForm:'heavy',action};
 const t=P.buildPrompt(input);
 const plain=P.buildPrompt({...input,action:{}});
 const block=x=>x.split('[FORM DEFINITION]')[1].split('\n\n[')[0];
 assert.equal(block(t),block(plain),'action changes selected armor');
 assert(t.includes('ACTION DIRECTION PRIORITY:'));
 assert(t.includes('Do not add equipment'));
 for(const mode of ['portrait','casual']){
  const isolated=P.buildPrompt({...input,outputMode:mode});
  assert(!isolated.includes('[ACTION DIRECTION]'));
  assert(!isolated.includes('ACTION DIRECTION PRIORITY:'));
 }
}
// Form images for the game come from action mode: whole figure, face to camera, unless the user picks otherwise.
for(const form of ['light','heavy','mobility','overdrive']){
 const t=P.buildPrompt({...base,form,baseForm:'heavy'});
 assert(t.includes('CARD-READY DEFAULT:')&&t.includes('never a back view'),'action must stay usable as card art');
 assert(t.includes('OVERDRIVE IN ACTION:'),'overdrive action keeps the base image composition');
 for(const outputMode of ['portrait','casual'])
  assert(!P.buildPrompt({...base,form,baseForm:'heavy',outputMode}).includes('CARD-READY DEFAULT:'),'card default leaked into '+outputMode);
}
assert(P.buildPrompt({...base,orient:'rear_3q'}).includes(S.ORIENTATION_GUIDES.rear_3q[1]),'an explicit orientation still wins');
assert.equal(P.buildPrompt({...base,action:{}}),P.buildPrompt(base),'automatic choices add prompt noise');
assert.equal(P.buildPrompt({...base,action:{category:'UNKNOWN',example:'INVALID',effects:'UNKNOWN'}}),P.buildPrompt(base));
assert.equal(P.buildPrompt({...base,action:[]}),P.buildPrompt(base));
const wrong=P.buildPrompt({...base,action:{category:'defense',example:'aimed_release'}});
assert(!wrong.includes(S.ACTION_CATEGORIES.find(r=>r.key==='ranged').examples.find(r=>r.key==='aimed_release').prompt),'stale example leaked');
const explicit=P.buildPrompt({...base,action,pose:'low_guard',frame:'waist_up',lens:'wide24',camera:'CUSTOM_CAMERA',custom:'CUSTOM_ACTION'});
assert(explicit.includes('CUSTOM_CAMERA')&&explicit.includes('CUSTOM_ACTION'));
assert(explicit.includes(S.FRAME_GUIDES.waist_up[1])&&explicit.includes(S.LENS_GUIDES.wide24[1]));
assert(P.buildPrompt({...base,pose:'walking'}).includes(S.POSE_GUIDES.walking[1]),'legacy pose lost');
console.log('PASS action: '+count+' examples, all controls/poses, automatic choices, invalid values, form and mode isolation');
