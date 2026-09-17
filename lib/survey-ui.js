import {h,render} from 'https://esm.sh/preact@10.24.3';
import {useState,useEffect,useRef} from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import {WorkspaceHeader} from './workspace-ui.js?v=header1';
const html=htm.bind(h),W=window.W,S=window.AtelierSurvey,IMG=window.AtelierImg;
const KEY='pkm_survey_v1',BEST='pkm_survey_best_v1';
const signs={research:'◎',salvage:'⬡',rescue:'↗'};
const nowCode=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
function Types({types,group}){
  return html`<div class="sv-types">${types.map(t=>html`<span key=${t} style=${{'--tc':group.color[t]}}><i></i>${group.name[t]||t}</span>`)}</div>`;
}
function Portrait({card,form,images,group}){
  const src=images[card.name]&&IMG.coverOf(images[card.name],'f',null,form);
  const [stage,setStage]=useState(0);
  useEffect(()=>setStage(0),[src]);
  return html`<div class="sv-portrait" style=${{'--tc':group.color[card.element]}}>
    ${src&&stage<2?html`<img src=${stage?IMG.imgURL(src):IMG.thumbURL(src)} alt="" onError=${()=>setStage(n=>n+1)}/>`:
    html`<span class="sv-emblem" aria-hidden="true">◈</span><small>#${String(card.no).padStart(3,'0')}</small>`}
  </div>`;
}
function Rules(){
  return html`<details class="sv-rules"><summary>${W('survey.rules')}</summary><ol>${[1,2,3,4,5].map(n=>html`<li key=${n}>${W('survey.rule.'+n)}</li>`)}</ol></details>`;
}
function Mission({m,data,report=false}){
  return html`<article class=${'sv-mission grade-'+m.grade} data-mission=${m.id}>
    <div class=${'sv-terrain terrain-'+m.biome} aria-hidden="true"><span>${signs[m.skill]}</span><b>${String(m.id+1).padStart(2,'0')}</b></div>
    <div class="sv-mission-body">
      <div class="sv-kicker"><span>${W('survey.skill.'+m.skill)}</span><span>${W('survey.slot',{n:m.members.length})}</span></div>
      <h3>${W('survey.biome.'+m.biome)}</h3>
      <${Types} types=${m.types} group=${data.group}/>
      <div class="sv-power"><span>${W('survey.power')} <strong>${m.power}</strong><small> / ${m.demand}</small></span>
        <b class="sv-medals" aria-label=${W('survey.grade.'+m.grade)}>${'★'.repeat(m.grade)}<i>${'☆'.repeat(3-m.grade)}</i></b></div>
      <div class="sv-meter"><i style=${{width:Math.min(100,m.power/(m.demand*1.3)*100)+'%'}}></i><span style="left:46.15%"></span><span style="left:76.92%"></span></div>
      <div class="sv-threshold">${W('survey.threshold',{one:m.demand*6/10,two:m.demand,three:m.demand*13/10})}</div>
      <div class="sv-assignees">${m.members.length?m.members.map(c=>html`<div key=${c.name}><span>${c.name}<small>${W('form.'+c.form)}</small></span><strong>+${c.power}</strong></div>`):html`<p>${W('survey.empty')}</p>`}</div>
      ${m.synergy?html`<p class="sv-bonus">${W('survey.synergy')}</p>`:html`<p class="sv-bonus">${W('survey.affinity')}</p>`}
      ${report&&html`<b class="sv-result-tag">${W('survey.grade.'+m.grade)}</b>`}
    </div>
  </article>`;
}
function Member({c,data,state,dispatch,missions}){
  const card=data.by[c.name],locked=state.phase!=='plan',base=S.skills(card),allowed=S.options(state,c.name,data.cards);
  return html`<article class=${'sv-member'+(c.mission===null?' resting':' assigned')} data-name=${c.name}>
    <div class="sv-member-head"><${Portrait} card=${card} form=${c.form} images=${data.images} group=${data.group}/>
      <div><h3>${card.name}</h3><${Types} types=${S.types(card)} group=${data.group}/></div>
      <div class="sv-energy"><b>${c.energy}<small> / ${S.ENERGY}</small></b><span>${W('survey.energy')}</span>
        <div aria-hidden="true">${Array.from({length:6},(_,i)=>html`<i class=${i<c.energy?'on':''}></i>`)}</div></div>
    </div>
    <div class="sv-stats" aria-label=${W('survey.base')}>${S.SKILLS.map((k,i)=>html`<span key=${k}>${signs[k]} ${W('survey.skill.'+k)}<b>${base[i]}</b>${state.upgrades[i]>0&&html`<em>+${state.upgrades[i]}</em>`}</span>`)}</div>
    <div class="sv-form-row">${Object.keys(S.FORMS).filter(f=>card.forms.includes(f)).map(f=>html`<button type="button" key=${f}
      aria-label=${W('survey.form.label',{name:c.name,form:W('form.'+f),n:S.FORMS[f].cost})} title=${W('survey.form.'+f)}
      data-form=${f} aria-pressed=${c.form===f} disabled=${!allowed.forms[f]}
      onClick=${()=>dispatch({type:'form',name:c.name,form:f})}>${W('form.'+f)}<small>${S.FORMS[f].cost}</small></button>`)}</div>
    <p class="sv-form-note">${W('survey.form.'+c.form)}</p>
    <div class="sv-member-actions"><label><span>${W('survey.assignment')}</span><select data-assignment=${c.name} aria-label=${W('survey.assignment.label',{name:c.name})}
      value=${c.mission===null?'rest':String(c.mission)} disabled=${locked}
      onChange=${e=>{const v=e.currentTarget.value;e.currentTarget.value=c.mission===null?'rest':String(c.mission);dispatch({type:'assign',name:c.name,mission:v==='rest'?null:Number(v)});}}>
      <option value="rest">${W('survey.rest')}</option>${missions.map(m=>html`<option key=${m.id} value=${m.id}
        disabled=${!allowed.assignments[m.id+1]}>
        ${W('survey.biome.'+m.biome)} · ${W('survey.skill.'+m.skill)}</option>`)}</select></label>
      <button class="sv-repair" type="button" aria-label=${W('survey.repair.label',{name:c.name})}
        disabled=${!allowed.repair} onClick=${()=>dispatch({type:'repair',name:c.name})}>${W('survey.repair')}</button></div>
  </article>`;
}
function App(){
  const [data,setData]=useState(null),[error,setError]=useState(''),[state,setState]=useState(null),[best,setBest]=useState(0);
  const [notice,setNotice]=useState(''),[storage,setStorage]=useState(true),[confirm,setConfirm]=useState(false);
  const live=useRef(null);
  const scrollTop=()=>document.querySelector('.wrap')?.scrollTo({top:0,behavior:'auto'});
  function save(s){
    live.current=s;setState(s);
    try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){setStorage(false);}
  }
  useEffect(()=>{
    let alive=true;
    Promise.all(['card','group'].map(n=>fetch('data/'+n+'.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error(n);return r.json();}))
      .concat([IMG.load().catch(()=>({}))])).then(([card,group,images])=>{
        if(!alive)return;
        const by=S.index(card);if(Object.keys(by).length<6)throw Error('cards');
        setData({by,cards:Object.values(by),group,images});
        try{
          const raw=localStorage.getItem(KEY),saved=raw&&S.restore(raw,Object.values(by));
          if(saved){live.current=saved;setState(saved);}else if(raw){setNotice(W('survey.corrupt'));localStorage.removeItem(KEY);}
          const b=Number(localStorage.getItem(BEST));if(Number.isInteger(b)&&b>=0&&b<=54)setBest(b);
        }catch(e){setStorage(false);}
      }).catch(()=>{if(alive)setError(W('survey.error.data'));});
    return ()=>{alive=false;};
  },[]);
  useEffect(()=>{
    if(state?.phase==='finished'&&state.score>best){setBest(state.score);try{localStorage.setItem(BEST,String(state.score));}catch(e){setStorage(false);}}
  },[state?.phase,state?.score,best]);
  function begin(seed){save(S.create(data.cards,seed));setNotice('');setConfirm(false);scrollTop();}
  function dispatch(action){
    const result=S.apply(live.current,action,data.cards);
    if(result.ok){save(result.state);setNotice('');}else setNotice(W('survey.error.'+result.error));
  }
  function launch(){
    if(live.current?.phase!=='plan')return;
    dispatch({type:'launch'});scrollTop();
  }
  const previews=state&&S.preview(state,data.cards);
  const report=state&&state.phase!=='plan'?state.history[state.history.length-1]:null;
  const shown=report?report.missions:previews;
  const assigned=state?state.crew.filter(c=>c.mission!==null).length:0;
  return html`<${WorkspaceHeader} page="survey"/>
    ${error?html`<div class="sv-load" role="alert"><p>${error}</p><button onClick=${()=>location.reload()}>${W('survey.retry')}</button></div>`:
      !data?html`<div class="sv-load" role="status">${W('survey.load')}</div>`:
      html`<main class="sv-game" data-phase=${state?.phase||'start'}>
        <section class="sv-hero"><div><p class="sv-eyebrow">${W('survey.eyebrow')}</p>
          <h2>${state?W('survey.day',{n:state.day+1,total:S.DAYS}):W('survey.headline')}</h2>
          <p>${state?W('survey.seed',{seed:state.seed}):W('survey.intro')}</p></div>
          <div class="sv-orbit" aria-hidden="true"><i></i><b>◎</b><span>06</span></div>
          ${state&&html`<div class="sv-dashboard"><div><span>${W('survey.score')}</span><strong>${state.score}<small> / ${S.GOAL}</small></strong></div>
            <div><span>${W('survey.kits')}</span><strong>${state.kits}</strong></div><div class="sv-phase">${W('survey.phase.'+state.phase)}</div></div>`}
        </section>
        ${notice&&html`<p class="sv-notice" role="status">${notice}</p>`}
        ${!state?html`<section class="sv-welcome"><div class="sv-welcome-main"><p class="sv-eyebrow">${W('survey.goal',{n:S.GOAL})}</p>
          <h3>${W('survey.daily')}</h3><p>${W('survey.daily.note')}</p>
          <div class="sv-start-actions"><button class="sv-primary sv-start" onClick=${()=>begin(nowCode())}>${W('survey.start')} ↗</button>
          <button class="sv-random" onClick=${()=>begin(1+Math.floor(Math.random()*99999999))}>${W('survey.random')}</button></div>
          <p class="sv-small">${W('survey.best',{n:best})}</p></div><${Rules}/></section>`:
        html`<div class="sv-days" aria-label=${W('survey.day',{n:state.day+1,total:S.DAYS})}>${Array.from({length:S.DAYS},(_,i)=>html`<div class=${i<state.history.length?'done':i===state.day?'now':''}>
          <b>${String(i+1).padStart(2,'0')}</b><span>${i<state.history.length?'+'+state.history[i].earned:i===state.day?'◎':'·'}</span></div>`)}</div>
          ${state.phase==='finished'&&html`<section class="sv-finish"><div class="sv-rank"><small>${W('survey.rank')}</small><strong>${S.rank(state)}</strong></div><div>
            <p class="sv-eyebrow">${W('survey.rank.'+S.rank(state))}</p><h2>${W(state.score>=S.GOAL?'survey.finish.win':'survey.finish.loss')}</h2>
            <p>${W('survey.finish.note',{score:state.score,goal:S.GOAL})}</p><div class="sv-start-actions">
            <button class="sv-primary sv-replay" onClick=${()=>begin(state.seed)}>${W('survey.replay')}</button>
            <button onClick=${()=>begin(1+Math.floor(Math.random()*99999999))}>${W('survey.random')}</button></div></div></section>`}
          <div class="sv-section-heading"><div><p class="sv-eyebrow">${report?W('survey.review'):W('survey.routes')}</p><h2>${report?W('survey.earned',{n:report.earned}):W('survey.routes.note')}</h2></div>
            <span class="sv-tiny">${W('survey.goal',{n:S.GOAL})}</span></div>
          <section class="sv-missions">${shown.map(m=>html`<${Mission} key=${state.day+'-'+m.id} m=${m} data=${data} report=${!!report}/>`)}</section>
          ${state.phase==='report'&&html`<section class="sv-rewards"><h2>${W('survey.next')}</h2><p>${W('survey.reward.note')}</p><div>${S.REWARDS.map(r=>html`<button class="sv-reward" data-reward=${r}
            onClick=${()=>{dispatch({type:'reward',reward:r});scrollTop();}}><b>${r==='restock'?'+2':'+1'}</b><strong>${W('survey.reward.'+r)}</strong><span>${W('survey.reward.'+r+'.note')}</span></button>`)}</div></section>`}
          ${state.phase==='plan'&&html`<div class="sv-section-heading sv-roster-heading"><div><p class="sv-eyebrow">${W('survey.crew')}</p><h2>${W('survey.crew.note')}</h2></div>
            <button class="sv-clear" onClick=${()=>{for(const c of live.current.crew)if(c.mission!==null)dispatch({type:'assign',name:c.name,mission:null});}}>${W('survey.clear')}</button></div>
          <section class="sv-roster">${state.crew.map(c=>html`<${Member} key=${c.name} c=${c} data=${data} state=${state} dispatch=${dispatch} missions=${previews}/>`)}</section>`}
          <${Rules}/>
          ${state.history.length>0&&html`<details class="sv-history"><summary>${W('survey.history')}</summary>${state.history.map(h=>html`<div><strong>${W('survey.history.day',{n:h.day+1,score:h.earned})}</strong><span>${h.missions.map(m=>W('survey.biome.'+m.biome)+' '+'★'.repeat(m.grade)).join(' / ')}</span></div>`)}</details>`}
          <div class="sv-footer"><span>${W(storage?'survey.saved':'survey.storage.failed')}</span><button onClick=${()=>setConfirm(!confirm)}>${W('survey.new')}</button></div>
          ${confirm&&html`<div class="sv-confirm" role="group" aria-label=${W('survey.confirm')}><p>${W('survey.confirm')}</p><button onClick=${()=>setConfirm(false)}>${W('survey.cancel')}</button>
            <button onClick=${()=>begin(1+Math.floor(Math.random()*99999999))}>${W('survey.random')}</button></div>`}
          ${state.phase==='plan'&&html`<div class="sv-dock"><div><strong>${W('survey.forecast',{n:previews.reduce((n,m)=>n+m.grade,0)})}</strong><small>${W('survey.assigned',{n:assigned,rest:6-assigned})}</small></div>
            <button class="sv-primary sv-launch" onClick=${launch}>${W(assigned?'survey.launch':'survey.allrest')}<span aria-hidden="true"> ↗</span></button></div>`}
        `}
      </main>`}`;
}
render(html`<${App}/>`,document.getElementById('app'));
