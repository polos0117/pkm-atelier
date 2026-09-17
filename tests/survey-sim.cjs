/* Independent operation rules, save integrity, and a bounded playability sample. */
const assert=require('node:assert/strict');
const S=require('../lib/survey.js'),cards=require('../data/card.json'),by=S.index(cards);
const copy=x=>JSON.parse(JSON.stringify(x));
const act=(s,a,input=cards)=>{const r=S.apply(s,a,input);assert(r.ok,JSON.stringify(a)+' / '+r.error);return r.state;};

/* Look at today's displayed outcomes, preferring medals then energy economy.
   This deliberately has no knowledge of tomorrow's missions. */
function plan(s){
  const pool=s.crew.map(c=>by[c.name]),available=S.missions(s.seed,s.day);
  let frontier=new Map([[0,{value:0,actions:[]}]]);
  for(const mission of available){
    const choices=[{mask:0,value:0,actions:[]}];
    for(let mask=1;mask<64;mask++){
      const team=s.crew.map((c,i)=>({...c,i})).filter(c=>mask&(1<<c.i));
      if(team.length>2)continue;
      const forms=team.map(c=>Object.keys(S.FORMS).filter(f=>S.FORMS[f].cost<=c.energy));
      for(const f of forms[0])for(const g of (forms[1]||[null])){
        const picked=team.map((c,i)=>({...c,form:i?g:f,mission:mission.id}));
        const temp={...s,crew:s.crew.map(c=>({...c,mission:null,...picked.find(p=>p.name===c.name)}))};
        const p=S.preview(temp,pool)[mission.id],cost=p.members.reduce((n,c)=>n+c.cost,0);
        if(!p.grade)continue;
        choices.push({mask,value:p.grade*1000-cost*20+p.power/100,actions:picked.flatMap(c=>[
          {type:'form',name:c.name,form:c.form},{type:'assign',name:c.name,mission:mission.id}])});
      }
    }
    const next=new Map();
    for(const [mask,p] of frontier)for(const q of choices){
      if(mask&q.mask)continue;
      const m=mask|q.mask,value=p.value+q.value;
      if(!next.has(m)||value>next.get(m).value)next.set(m,{value,actions:[...p.actions,...q.actions]});
    }
    frontier=next;
  }
  return [...frontier.values()].sort((a,b)=>b.value-a.value)[0].actions;
}

function run(seed){
  let s=S.create(cards,seed);
  for(let day=0;day<S.DAYS;day++){
    // Spend kits on tired crew, then plan against the same preview the player sees.
    for(const c of s.crew)if(c.energy<=2&&s.kits)s=act(s,{type:'repair',name:c.name});
    for(const a of plan(s))s=act(s,a);
    const before=copy(s),expected=S.preview(s,cards).reduce((n,m)=>n+m.grade,0);
    s=act(s,{type:'launch'});
    assert.equal(s.score-before.score,expected,'preview equals actual result');
    assert.deepEqual(S.restore(JSON.stringify(s),cards),s,'report/finished survives a reload');
    if(s.phase==='report'){
      const reward=s.kits<=1?'restock':S.SKILLS[day%3];
      s=act(s,{type:'reward',reward});
      assert.deepEqual(S.restore(s,cards),s,'next-day save survives a reload');
    }
  }
  assert.equal(s.phase,'finished');assert.equal(s.history.length,6);
  return s;
}

function test(){
  assert.equal(Object.keys(by).length,1025,'uses the existing full dex');
  const original=S.create(cards,20260917),snapshot=copy(original);
  assert.deepEqual(S.create(cards,20260917),original,'same seed, same crew');
  assert.notDeepEqual(S.create(cards,20260918).crew,original.crew,'other seed changes crew');
  assert.equal(new Set(original.crew.map(c=>c.name)).size,6);
  assert(original.crew.every(c=>c.energy===6),'initial energy is six');
  assert.deepEqual(S.skills({stats:[100,100,100,100,100,100]}),[10,10,10]);
  assert.deepEqual(S.skills({stats:[50,50,50,50,50,50]}),[10,10,10],'stat total alone is not an advantage');
  assert.equal(new Set(S.missions(original.seed,0).map(m=>m.skill)).size,3);
  let s=act(original,{type:'assign',name:original.crew[0].name,mission:0});
  assert.deepEqual(original,snapshot,'actions never mutate previous state');
  s=act(s,{type:'assign',name:s.crew[1].name,mission:0});
  const rejected=S.apply(s,{type:'assign',name:s.crew[2].name,mission:0},cards);
  assert.equal(rejected.error,'full');assert.equal(rejected.state,s);
  assert.equal(S.options(s,s.crew[2].name,cards).assignments[1],false);
  s=act(s,{type:'assign',name:s.crew[0].name,mission:1});
  assert.equal(S.preview(s,cards)[0].members.length,1,'moving never duplicates crew');
  assert.equal(S.preview(s,cards)[1].members.length,1);
  assert.equal(S.apply(s,{type:'reward',reward:'restock'},cards).ok,false);
  const full=copy(original);full.kits=0;
  assert.equal(S.apply(full,{type:'repair',name:full.crew[0].name},cards).error,'kits');
  assert.equal(S.apply(original,{type:'repair',name:original.crew[0].name},cards).error,'fullEnergy');
  const tired=copy(original);tired.crew[0].energy=1;
  assert.equal(S.apply(tired,{type:'assign',name:tired.crew[0].name,mission:0},cards).error,'tired');
  const fixed=act(tired,{type:'repair',name:tired.crew[0].name});
  assert.equal(fixed.crew[0].energy,4);assert.equal(fixed.kits,2);
  const deployed=copy(original);deployed.crew[0].energy=2;deployed.crew[0].mission=0;
  assert.equal(S.apply(deployed,{type:'form',name:deployed.crew[0].name,form:'heavy'},cards).error,'tired');
  const report=act(deployed,{type:'launch'});
  assert.equal(report.crew[0].energy,0);assert.equal(report.crew[1].energy,6);
  assert.equal(S.apply(report,{type:'launch'},cards).error,'phase','double launch cannot score twice');
  const upgraded=act(report,{type:'reward',reward:'research'});
  assert.deepEqual(upgraded.upgrades,[1,0,0]);assert.equal(upgraded.day,1);
  assert.equal(S.apply(upgraded,{type:'reward',reward:'research'},cards).ok,false,'reward cannot be claimed twice');
  const rested=act(upgraded,{type:'launch'});
  assert.equal(rested.crew[0].energy,3,'unassigned crew recovers');

  const fixture=Array.from({length:6},(_,i)=>({name:'unit'+i,forms:['light','heavy','mobility'],stats:[100,100,100,100,100,100],element:'grass',egg:['plant']}));
  const f=S.create(fixture,1),m=S.missions(f.seed,0)[0];
  fixture.forEach(c=>c.element=m.types[0]);f.crew[0].mission=0;f.crew[1].mission=0;
  const together=S.preview(f,fixture)[0];
  assert(together.members.every(c=>c.affinity===3));assert.equal(together.synergy,2);
  fixture.forEach(c=>c.egg=['no-eggs']);
  assert.equal(S.preview(f,fixture)[0].synergy,0,'undiscovered group gives no free synergy');
  fixture.forEach(c=>c.egg=['ditto']);assert.equal(S.preview(f,fixture)[0].synergy,0);

  for(const broken of ['{bad',{},null,{...original,version:0},{...original,score:9},
    {...original,crew:[original.crew[0],...original.crew.slice(1,5)]}])assert.equal(S.restore(broken,cards),null);
  const badReport=copy(report);delete badReport.history[0].missions[0].types;
  assert.equal(S.restore(badReport,cards),null,'malformed history cannot break report rendering');
  const finished=run(20260917);
  assert.equal(S.apply(finished,{type:'launch'},cards).ok,false);
  assert.equal(S.apply(finished,{type:'reward',reward:'restock'},cards).ok,false);
  assert.equal(S.rank({score:42}),'S');assert.equal(S.rank({score:30}),'A');
  assert.equal(S.rank({score:20}),'B');assert.equal(S.rank({score:19}),'C');
  const scores=Array.from({length:12},(_,i)=>run(20260917+i).score);
  console.log('Survey sample (today-only planner): '+scores.join(', '));
  assert(scores.some(n=>n>=30),'target must be reachable in sample operations');
  console.log('PASS survey rules: assignment, forms, energy, previews, rewards, saves and six-day finish');
}
module.exports={plan,run};
if(require.main===module)test();
