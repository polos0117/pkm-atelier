/* 장면 랜덤 — 액션은 연출 갈래·예시, 일상컷은 트리 차례(시대 → 장소 → 하는 일 → 의상 → 옷 → 프레이밍·렌즈 → 자세·방향 → 표정). node tests/prompt-random.cjs */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const f of ['prompt-spec','casual-tree','prompt-random'])vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const R=ctx.window.AtelierSceneRandom,S=ctx.window.AtelierSpec,CT=ctx.window.AtelierCasualTree;
const tree=JSON.parse(fs.readFileSync('data/casual-tree.json','utf8')),rctx={tree,card:{gen:1}};
assert(R,'scene randomizer is missing');
/* 액션 — 갈래를 먼저, 잠근 예시는 갈래를 막는다 */
{
 const original={pose:'walking',camera:'CUSTOM',custom:'KEEP',action:{category:'ranged',example:'aimed_release'},axes:{},randomLocks:{pose:true}};
 const snapshot=JSON.stringify(original);
 const one=R.randomize(original,'action','lens',()=>0);
 assert(one.lens&&one.pose==='walking');assert.equal(one.camera,'CUSTOM');
 assert.equal(JSON.stringify(original),snapshot,'input mutated');
 const all=R.randomize(original,'action',null,()=>0);
 assert.equal(all.pose,'walking');assert.equal(all.custom,'KEEP');assert(all.lens&&all.frame);
 const locked={...original,randomLocks:{'action.example':true}};
 const kept=R.randomize(locked,'action',null,()=>0.9);
 assert.equal(kept.action.example,'aimed_release');assert.equal(kept.action.category,'ranged');
 assert(!R.canRandomize(locked,'action','action.category'));
 const fields=R.fields(all,'action'),everything={...all,randomLocks:Object.fromEntries(Object.keys(fields).map(k=>[k,true]))};
 assert.equal(JSON.stringify(R.randomize(everything,'action',null,()=>0.2)),JSON.stringify(everything));
}
/* 일상컷 — 트리 안에서만, 잠근 칸은 그대로, 앞 칸을 바꾸면 맞지 않게 된 뒤 칸을 고친다 */
{
 const original={era:'in_pokemon',place:'partner_garden',act:'care_feeding',ofam:'everyday',pose:'offering_food',frame:'three_quarter',camera:'CUSTOM',custom:'KEEP',axes:{},randomLocks:{pose:true}};
 const snapshot=JSON.stringify(original);
 const one=R.randomize(original,'casual','lens',()=>0,rctx);
 assert(one.lens&&one.pose==='offering_food'&&one.place==='partner_garden');assert.equal(one.camera,'CUSTOM');
 assert.equal(JSON.stringify(original),snapshot,'input mutated');
 assert.equal(Object.keys(R.fields(original,'casual')).length,0,'casual needs the tree');
 const locked={...original,randomLocks:{era:true,place:true,act:true}};
 const kept=R.randomize(locked,'casual',null,()=>0.9,rctx);
 assert.equal(kept.place,'partner_garden');assert.equal(kept.act,'care_feeding');
 const fields=R.fields(kept,'casual',rctx),everything={...kept,randomLocks:Object.fromEntries(Object.keys(fields).map(k=>[k,true]))};
 assert.equal(JSON.stringify(R.randomize(everything,'casual',null,()=>0.2,rctx)),JSON.stringify(everything));
 for(let i=0;i<60;i++){
  const next=R.randomize({...original,randomLocks:{}},'casual',null,()=>((i*7919)%997)/997,rctx);
  const options=R.fields(next,'casual',rctx);
  for(const [key,values] of Object.entries(options))if(R.value(next,key))assert(values.includes(R.value(next,key)),'casual invalid '+key+'='+R.value(next,key));
  assert(!CT.banned(tree,'orients').includes(next.orient)&&!CT.banned(tree,'frames').includes(next.frame),'banned value '+next.orient+' '+next.frame);
  if(next.frame==='face_close')assert(!CT.isRequired(tree,next),'face close-up on a required cut');
  assert(!next.preset,'random path clears the preset mark');
 }
}
{const x={a:1};assert.equal(R.randomize(x,'portrait',null),x,'other modes untouched');}
console.log('PASS scene randomization: action locks · casual tree order · locks · banned values · face close-up rule · immutability');
