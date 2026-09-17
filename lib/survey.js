/* Survey operations: deterministic assignment puzzle, independent of battle/run.
   Rules live here. UI consumes previews and reducer results; no rules in the view. */
(function (root) {
  'use strict';
  const VERSION=1, DAYS=6, ENERGY=6, GOAL=30;
  const SKILLS=['research','salvage','rescue'];
  const FORMS={
    light:{cost:2,mul:[1.08,.92,.92]},
    heavy:{cost:3,mul:[.9,1.3,.7]},
    mobility:{cost:3,mul:[.85,.85,1.3]}
  };
  const BIOMES={
    forest:['grass','bug','poison'], coast:['water','ice','flying'],
    volcano:['fire','ground','rock'], ruins:['psychic','ghost','dragon'],
    city:['electric','steel','normal'], canyon:['fighting','ground','flying'],
    night:['dark','ghost','poison'], meadow:['fairy','normal','grass']
  };
  const REWARDS=['restock',...SKILLS];
  const clone=x=>JSON.parse(JSON.stringify(x));
  const cap=(n,lo,hi)=>Math.max(lo,Math.min(hi,n));
  const types=c=>[c.element,c.element2].filter(Boolean);
  const seeded=seed=>{
    let v=(Number(seed)>>>0)||1;
    return ()=>{v+=0x6D2B79F5;let t=v;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  };
  function shuffled(a,rng){
    a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
  }
  function index(input){
    const cards=Array.isArray(input)?input:Object.values(input.cards||{}).flat();
    return Object.fromEntries(cards.filter(c=>c.name&&Array.isArray(c.stats)&&c.stats.length===6&&
      c.stats.every(x=>Number.isFinite(x)&&x>0)).map(c=>[c.name,c]));
  }
  function skills(card){
    const [hp,atk,def,spa,spd,spe]=card.stats;
    const raw=[spa*.65+spd*.35,atk*.5+def*.3+hp*.2,spe*.75+hp*.25];
    const sum=raw.reduce((a,b)=>a+b,0);
    return raw.map(x=>Math.round((2+24*x/sum)*10)/10);
  }
  function missions(seed,day){
    const rng=seeded((seed+day*104729)>>>0);
    const habitats=shuffled(Object.keys(BIOMES),rng).slice(0,3);
    return shuffled(SKILLS,rng).map((skill,i)=>({
      id:i,skill,biome:habitats[i],types:BIOMES[habitats[i]],
      demand:19+day+Math.floor(rng()*5)-2
    }));
  }
  function create(input,seed){
    const by=index(input), pool=Object.values(by), rng=seeded(seed);
    if(pool.length<6)throw new Error('survey.error.data');
    const picked=[], rest=shuffled(pool,rng);
    for(let i=0;i<6;i++){
      const axis=i%3;
      const options=rest.filter(c=>!picked.includes(c)&&skills(c)[axis]===Math.max(...skills(c)));
      const c=options[0]||rest.find(c=>!picked.includes(c));picked.push(c);
    }
    return {version:VERSION,seed:(Number(seed)>>>0)||1,day:0,phase:'plan',
      crew:picked.map(c=>({name:c.name,energy:ENERGY,form:'light',mission:null})),
      kits:3,upgrades:[0,0,0],score:0,history:[]};
  }
  function grade(power,demand){return power*10>=demand*13?3:power>=demand?2:power*10>=demand*6?1:0;}
  function preview(state,input){
    const by=index(input);
    return missions(state.seed,state.day).map(m=>{
      const axis=SKILLS.indexOf(m.skill);
      const team=state.crew.filter(c=>c.mission===m.id);
      const members=team.map(c=>{
        const card=by[c.name],base=skills(card)[axis]+state.upgrades[axis];
        const affinity=types(card).some(t=>m.types.includes(t))?3:0;
        const power=Math.round((base*FORMS[c.form].mul[axis]+affinity)*10)/10;
        return {name:c.name,form:c.form,base:Math.round(base*10)/10,affinity,power,cost:FORMS[c.form].cost};
      });
      const pair=team.length===2&&
        (by[team[0].name].egg||[]).some(e=>e!=='no-eggs'&&e!=='ditto'&&(by[team[1].name].egg||[]).includes(e));
      const synergy=pair?2:0,power=Math.round((members.reduce((n,c)=>n+c.power,0)+synergy)*10)/10;
      return {...m,members,synergy,power,grade:members.length?grade(power,m.demand):0,
        valid:team.length<=2&&team.every(c=>c.energy>=FORMS[c.form].cost)};
    });
  }
  function check(state,action,input){
    if(!state||!action)return 'action';
    if(action.type==='reward')return state.phase==='report'&&REWARDS.includes(action.reward)?null:'phase';
    if(state.phase!=='plan')return 'phase';
    if(action.type==='launch')return preview(state,input).some(m=>!m.valid)?'tired':null;
    const c=state.crew.find(c=>c.name===action.name);
    if(!c)return 'member';
    if(action.type==='assign'){
      if(action.mission!==null&&![0,1,2].includes(action.mission))return 'mission';
      if(action.mission!==null){
        if(state.crew.filter(x=>x.name!==c.name&&x.mission===action.mission).length>=2)return 'full';
        if(c.energy<FORMS[c.form].cost)return 'tired';
      }
    }else if(action.type==='form'){
      if(!Object.hasOwn(FORMS,action.form)||!index(input)[c.name]?.forms.includes(action.form))return 'form';
      if(c.mission!==null&&c.energy<FORMS[action.form].cost)return 'tired';
    }else if(action.type==='repair'){
      if(!state.kits)return 'kits';
      if(c.energy===ENERGY)return 'fullEnergy';
    }else return 'action';
    return null;
  }
  function options(state,name,input){
    return {
      forms:Object.fromEntries(Object.keys(FORMS).map(form=>[form,!check(state,{type:'form',name,form},input)])),
      assignments:[null,0,1,2].map(mission=>!check(state,{type:'assign',name,mission},input)),
      repair:!check(state,{type:'repair',name},input)
    };
  }
  function apply(state,action,input){
    const error=check(state,action,input);
    if(error)return {ok:false,state,error};
    if(action.type==='reward'){
      const next=clone(state);
      if(action.reward==='restock')next.kits=Math.min(9,next.kits+2);
      else next.upgrades[SKILLS.indexOf(action.reward)]++;
      next.history[next.history.length-1].reward=action.reward;
      next.day++;next.phase='plan';
      return {ok:true,state:next};
    }
    if(action.type==='launch'){
      const report=preview(state,input);
      const next=clone(state),earned=report.reduce((n,m)=>n+m.grade,0);
      for(const c of next.crew){
        c.energy=c.mission===null?Math.min(ENERGY,c.energy+3):c.energy-FORMS[c.form].cost;
        c.mission=null;
      }
      next.score+=earned;
      next.history.push({day:state.day,missions:report,earned,reward:null});
      next.phase=next.day===DAYS-1?'finished':'report';
      return {ok:true,state:next};
    }
    const pos=state.crew.findIndex(c=>c.name===action.name);
    const next=clone(state),c=next.crew[pos];
    if(action.type==='assign'){
      c.mission=action.mission;
    }else if(action.type==='form'){
      c.form=action.form;
    }else if(action.type==='repair'){
      c.energy=Math.min(ENERGY,c.energy+3);next.kits--;
    }
    return {ok:true,state:next};
  }
  /* Accept only a bounded, coherent save. Bad/old saves are discarded without breaking the page. */
  function restore(raw,input){
    try{
      const s=typeof raw==='string'?JSON.parse(raw):clone(raw),by=index(input);
      const integer=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;
      if(!s||s.version!==VERSION||!integer(s.seed,1,4294967295)||!integer(s.day,0,DAYS-1)||
         !['plan','report','finished'].includes(s.phase)||!integer(s.kits,0,9)||
         !integer(s.score,0,DAYS*9)||!Array.isArray(s.crew)||s.crew.length!==6||
         new Set(s.crew.map(c=>c.name)).size!==6||!Array.isArray(s.upgrades)||s.upgrades.length!==3||
         !s.upgrades.every(n=>integer(n,0,DAYS-1))||!Array.isArray(s.history))return null;
      if(!s.crew.every(c=>by[c.name]&&integer(c.energy,0,ENERGY)&&Object.hasOwn(FORMS,c.form)&&
         (c.mission===null||integer(c.mission,0,2))&&by[c.name].forms.includes(c.form)))return null;
      if([0,1,2].some(i=>s.crew.filter(c=>c.mission===i).length>2))return null;
      if(s.crew.some(c=>c.mission!==null&&c.energy<FORMS[c.form].cost))return null;
      if(s.phase!=='plan'&&s.crew.some(c=>c.mission!==null))return null;
      if(s.phase==='finished'&&s.day!==DAYS-1||s.phase==='report'&&s.day===DAYS-1)return null;
      if(s.history.length!==s.day+(s.phase==='plan'?0:1))return null;
      let total=0;
      for(let i=0;i<s.history.length;i++){
        const h=s.history[i];
        if(!h||h.day!==i||!integer(h.earned,0,9)||!Array.isArray(h.missions)||h.missions.length!==3)return null;
        const expected=missions(s.seed,i);
        let sum=0;const used=new Set();
        for(let j=0;j<3;j++){
          const m=h.missions[j];
          if(m.id!==j||m.skill!==expected[j].skill||m.biome!==expected[j].biome||m.demand!==expected[j].demand||
            !integer(m.grade,0,3)||!Number.isFinite(m.power)||m.power<0||m.power>200||
            !Array.isArray(m.members)||m.members.length>2||![0,2].includes(m.synergy))return null;
          if(!Array.isArray(m.types)||m.types.join(',')!==expected[j].types.join(','))return null;
          if(!m.members.every(c=>by[c.name]&&s.crew.some(x=>x.name===c.name)&&Object.hasOwn(FORMS,c.form)&&
            Number.isFinite(c.power)&&c.power>=0&&Number.isFinite(c.base)&&[0,3].includes(c.affinity)&&c.cost===FORMS[c.form].cost))return null;
          for(const c of m.members){if(used.has(c.name))return null;used.add(c.name);}
          if(m.power!==Math.round((m.members.reduce((n,c)=>n+c.power,0)+m.synergy)*10)/10)return null;
          if(m.grade!==(m.members.length?grade(m.power,m.demand):0))return null;
          sum+=m.grade;
        }
        if(sum!==h.earned)return null;total+=sum;
        if(i<s.day&&!REWARDS.includes(h.reward))return null;
      }
      if(s.score!==total)return null;
      return s;
    }catch(e){return null;}
  }
  function rank(s){return s.score>=42?'S':s.score>=GOAL?'A':s.score>=20?'B':'C';}
  const api={VERSION,DAYS,ENERGY,GOAL,SKILLS,FORMS,BIOMES,REWARDS,index,skills,missions,create,preview,check,options,apply,restore,rank,types};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(root)root.AtelierSurvey=api;
})(typeof window!=='undefined'?window:null);
