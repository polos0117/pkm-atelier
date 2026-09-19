const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('lib/prompt-spec.js','utf8'),ctx);
if(fs.existsSync('lib/prompt-random.js'))vm.runInContext(fs.readFileSync('lib/prompt-random.js','utf8'),ctx);
const R=ctx.window.AtelierSceneRandom,S=ctx.window.AtelierSpec;
assert(R,'scene randomizer is missing');
for(const mode of ['action','casual']){
 const original={pose:'walking',camera:'CUSTOM',custom:'KEEP',action:{category:'ranged',example:'aimed_release'},cat:'partner_care',ex:'care_feeding',axes:{},randomLocks:{pose:true}};
 const snapshot=JSON.stringify(original);
 const one=R.randomize(original,mode,'lens',()=>0);
 assert(one.lens&&one.pose==='walking');assert.equal(one.camera,'CUSTOM');
 assert.equal(JSON.stringify(original),snapshot,'input mutated');
 const all=R.randomize(original,mode,null,()=>0);
 assert.equal(all.pose,'walking');assert.equal(all.custom,'KEEP');assert(all.lens&&all.frame);
 const category=mode==='action'?'action.category':'cat',example=mode==='action'?'action.example':'ex';
 const locked={...original,randomLocks:{[example]:true}};
 const protectedScene=R.randomize(locked,mode,null,()=>0.9);
 assert.equal(R.value(protectedScene,example),R.value(original,example));
 assert.equal(R.value(protectedScene,category),R.value(original,category));
 assert(!R.canRandomize(locked,mode,category));
 const fields=R.fields(all,mode),everything={...all,randomLocks:Object.fromEntries(Object.keys(fields).map(k=>[k,true]))};
 assert.equal(JSON.stringify(R.randomize(everything,mode,null,()=>0.2)),JSON.stringify(everything));
 for(let i=0;i<30;i++){
  const next=R.randomize(original,mode,null,()=>i/30);
  const options=R.fields(next,mode);
  for(const [key,values] of Object.entries(options))if(!next.randomLocks[key])
   assert(values.includes(R.value(next,key)),mode+' invalid '+key);
 }
}
const custom={cat:'__custom__',ex:'__custom__',exCustom:'TEXT',randomLocks:{ex:true}};
assert.equal(R.randomize(custom,'casual',null,()=>0).cat,'__custom__');
assert.equal(R.randomize(custom,'casual',null,()=>0).exCustom,'TEXT');
assert.equal(R.randomize(custom,'portrait',null),custom);
console.log('PASS scene randomization: field/all, locks, dependent categories, custom text, valid options and immutability');
