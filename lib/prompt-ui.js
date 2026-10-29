import {h,render} from 'https://esm.sh/preact@10.24.3';
import {useState,useEffect,useLayoutEffect,useMemo,useRef} from 'https://esm.sh/preact@10.24.3/hooks';
import {WorkspaceHeader} from './workspace-ui.js?v=status1';
const S=window.AtelierSpec,P=window.AtelierPrompt,L=window.AtelierLifestyle,
 A=window.AtelierImg,F=window.AtelierFigures,W=window.W,R=window.AtelierSceneRandom,CP=window.AtelierCasualPlan,CT=window.AtelierCasualTree;
const STORE='pkm_prompt_v2',MODES=['action','casual'],FORMS=['light','heavy','mobility','overdrive'];
const defs=S.PARAM_DEFS.filter(d=>S.IDENTITY_GROUPS.includes(d.group)&&!S.IDENTITY_EXCLUDED.includes(d.key));
const blankScene=()=>({expr:'',pose:'',orient:'',scene:'',outfit:'',frame:'',lens:'',camera:'',custom:'',aspect:'2:3',
 cat:'everyday_basic',catCustom:'',ex:'',exCustom:'',axes:{},action:{},randomLocks:{}});
/* 일상컷 고정값 — IMAGE_RULES 3절(전체 강도 가장 강함 · 피부 노출 많이 · 화면 비율 2:3). 처음부터 잠근다(game 생성기와 같게, 2026-10-29).
   잠금은 장면 랜덤만 막고 손으로 바꾸는 것은 막지 않는다. 저장된 상태를 불러올 때도 비었으면 다시 채우고 잠근다 */
const CASUAL_FIXED={axes:{overall_intensity:'strong',skin_exposure:'bold'},aspect:'2:3'};
const CASUAL_FIXED_LOCKS=['axes.overall_intensity','axes.skin_exposure','aspect'];
const fixCasual=sc=>{
 const axes={...sc.axes};for(const [k,v] of Object.entries(CASUAL_FIXED.axes))if(!axes[k]||axes[k]==='AUTO')axes[k]=v;
 const randomLocks={...sc.randomLocks};for(const k of CASUAL_FIXED_LOCKS)randomLocks[k]=true;
 return {...sc,axes,aspect:sc.aspect||CASUAL_FIXED.aspect,randomLocks};
};
const defaults=()=>({style:S.DEFAULT_STYLE,identityMode:'create',form:'light',baseForm:'light',
 motifs:'',formOverride:'',headFeature:'',faceDesignOn:true,params:{},locks:{},mode:'action',
 scenes:{action:blankScene(),casual:fixCasual(blankScene())}});
const object=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
function normalizeAction(raw){
 const x=object(raw),category=S.ACTION_CATEGORIES.find(r=>r.key===x.category);
 return {category:category?.key||'',
  example:category?.examples.some(r=>r.key===x.example)?x.example:'',
  ...Object.fromEntries(S.ACTION_CONTROLS.map(control=>[control.key,
   control.options.some(r=>r.key===x[control.key])?x[control.key]:'']))};
}
function readStore(){
 try{return object(JSON.parse(localStorage.getItem(STORE)||'{}'))}catch{return {}}
}
let saved=readStore();
function normalize(input,tree){
 const d=defaults(),x=object(input);
 const out={...d,...x,params:object(x.params),locks:object(x.locks),scenes:{}};
 delete out.featureInsets;
 if(!S.ACTION_STYLE_CORES[out.style])out.style=d.style;
 /* 폼 초상(기준 시트)은 없어졌다 — 옛 저장값은 액션으로 */
 if(!MODES.includes(out.mode))out.mode=d.mode;
 if(!FORMS.includes(out.form))out.form=d.form;
 if(!['create','reference'].includes(out.identityMode))out.identityMode='create';
 if(!['reference','light','heavy','mobility'].includes(out.baseForm))out.baseForm='light';
 for(const k of ['motifs','formOverride','headFeature'])if(typeof out[k]!=='string')out[k]='';
 if(typeof out.faceDesignOn!=='boolean')out.faceDesignOn=true;
 for(const mode of MODES){
  out.scenes[mode]={...blankScene(),...object(object(x.scenes)[mode])};
  out.scenes[mode].axes=object(out.scenes[mode].axes);
  out.scenes[mode].action=normalizeAction(out.scenes[mode].action);
  out.scenes[mode].randomLocks=Object.fromEntries(Object.entries(object(out.scenes[mode].randomLocks)).filter(([,v])=>v===true));
 }
 /* 일상컷은 트리 길 — 예전 저장값의 갈래·예시는 변환표로 옮긴다(lib/casual-tree.js). 카드마다 맞추기(첫 등장 해 등)는 Editor 가 */
 out.scenes.casual=fixCasual(CT.fromLegacy(tree,out.scenes.casual));
 return out;
}
const note=(text,props={})=>h('p',{class:'studio-note',...props},text);
function Select({id,label,value,options,onChange,description,disabled=false}){
 return h('label',{class:'studio-field'},h('span',{id:id+'-label'},label),
  h('select',{id,value,disabled,'aria-labelledby':id+'-label',
   'aria-describedby':description?id+'-description':undefined,onChange:e=>onChange(e.target.value)},
   options.map(o=>Array.isArray(o)?h('option',{key:o[0],value:o[0]},o[1]):
    h('optgroup',{key:o.group,label:o.group},o.options.map(([v,t])=>h('option',{key:v,value:v},t))))),
  description&&h('small',{class:'studio-field-help',id:id+'-description'},description));
}
function Text({id,label,value,onChange,multiline=false,placeholder='',description}){
 return h('label',{class:'studio-field'},h('span',{id:id+'-label'},label),
  h(multiline?'textarea':'input',{id,type:multiline?undefined:'text',value:value||'',placeholder,
   'aria-labelledby':id+'-label','aria-describedby':description?id+'-description':undefined,
   onInput:e=>onChange(e.target.value)}),
  description&&h('small',{class:'studio-field-help',id:id+'-description'},description));
}
function Figure({param,value}){
 const ref=useRef(),[failed,setFailed]=useState(false),png=F.pngURL(param,value);
 useEffect(()=>{
  if(png&&!failed)return;
  const draw=()=>{if(ref.current&&F.has(param,value))F.drawForKey(param,value,'female',ref.current)};
  draw();addEventListener('atelier-appearance',draw);
  return()=>removeEventListener('atelier-appearance',draw);
 },[param,value,png,failed]);
 if(png&&!failed)return h('img',{class:'figure-png',src:png,alt:'','aria-hidden':'true',
  loading:'lazy',decoding:'async',draggable:false,onError:()=>setFailed(true)});
 if(!F.has(param,value))return null;
 const [width,height]=F.dimensions(param);
 return h('canvas',{ref,width,height,'aria-hidden':'true'});
}
function FigurePicker({d,value,onValue}){
 const row=useRef(),choices=d.options.filter(([v])=>F.has(d.key,v));
 useEffect(()=>{
  const active=row.current?.querySelector('[aria-pressed="true"]');
  if(active)row.current.scrollTo({left:Math.max(0,active.offsetLeft-(row.current.clientWidth-active.offsetWidth)/2)});
 },[value]);
 if(!choices.length)return null;
 return h('div',{class:'figure-picker','data-figure-picker':d.key},
  h('div',{class:'figure-picker-head'},h('span',null,W('prompt.figure.pick',{label:d.ko})),
   h('button',{type:'button','data-value':'','aria-pressed':!value,onClick:()=>onValue('')},W('prompt.auto'))),
  h('div',{class:'figure-row',ref:row,role:'group','aria-label':W('prompt.figure.pick',{label:d.ko})},
   choices.map(([v,t])=>h('button',{key:v,type:'button',class:'figure-choice','data-value':v,
    'aria-pressed':value===v,'aria-label':t,title:t,onClick:()=>onValue(v)},
    h('span',{class:'figure-image'},h(Figure,{param:d.key,value:v})),h('b',null,t.split(' — ')[0])))));
}
function ColorPicker({d,selected,options,onValue}){
 return h('div',{class:'color-picker','data-color-picker':d.key,role:'group',
  'aria-label':W('prompt.color.pick',{label:d.ko})},options.map(([v,t])=>
  h('button',{key:v,type:'button',class:'color-choice'+(!v?' color-auto':v==='__custom__'?' color-custom':''),
   'data-value':v,'aria-label':t,title:t,'aria-pressed':selected===v,onClick:()=>onValue(v)},
   h('i',{'aria-hidden':'true',style:S.COLOR_HEX[v]?{backgroundColor:S.COLOR_HEX[v]}:undefined}),
   h('span',null,v==='__custom__'?W('prompt.custom'):t.split(' — ').pop()))));
}
function Param({d,value,params,locked,onValue,onLock}){
 const options=d.options.map(([v,t])=>[v,v===''?W(d.key==='second eye color'?'prompt.eye.same':'prompt.auto'):t]);
 const custom=value&&!options.some(([v])=>v===value),selected=custom?'__custom__':value||'';
 const visual=d.key==='body type'||d.key==='hairstyle',color=!!S.COLOR_KEYS[d.key];
 const guide=S.PARAM_GUIDES[d.key]?.[value]?.[0];
 const help=d.key==='facial ethnicity'?S.PARAM_HELP.ethnicity:
  d.key==='body measurements (B/W/H)'?S.PARAM_HELP.measurement:
  ['eye color','second eye color'].includes(d.key)?S.PARAM_HELP.eye:
  color?S.PARAM_HELP.color:S.PARAM_GROUP_HELP[d.group];
 const description=[selected==='__custom__'?S.PARAM_HELP.custom:!selected?S.PARAM_HELP.auto:guide,
  help,d.key==='hair length'&&value?S.HAIR_LENGTH_LIMITS[params.hairstyle]?.[0]:null].filter(Boolean).join(' ');
 return h('div',{class:'studio-param'+(visual||color?' studio-param-visual':'')},
  h('button',{type:'button',class:'param-lock','aria-label':W(locked?'prompt.unlock':'prompt.lock')+' · '+d.ko,
   'aria-pressed':!!locked,onClick:onLock},locked?'●':'○'),
  h(Select,{id:'param-'+d.key.replace(/\W/g,'-'),label:d.ko,value:selected,options,description,onChange:onValue}),
  color&&h(ColorPicker,{d,selected,options,onValue}),
  selected==='__custom__'&&h('div',{class:'custom-value'},h(Text,{label:W('prompt.custom'),
   value:custom?value:'',onChange:v=>onValue(v||'__custom__')})),
  visual&&h(FigurePicker,{d,value,onValue}));
}
function Gallery({entry,style,form,mode}){
 const b=A.styleMap(entry)[style]||{},fb=A.formOf(b,form);
 const files=mode==='casual'?A.cuts(b,'casual','f'):[...(fb&&fb.f?[fb.f]:[]),...A.formActs(b,form,'f')];
 return h('details',{class:'studio-gallery'},
  h('summary',null,W('prompt.gallery')+' · '+W('art.count',{n:files.length})),
  note(W('prompt.gallery.note')),
  files.length?h('div',{class:'studio-preview'},files.map(file=>h('a',{key:file,href:A.imgURL(file),target:'_blank',rel:'noopener'},
   h('img',{src:A.thumbURL(file),alt:W('prompt.gallery'),loading:'lazy',onError:e=>{
    const img=e.currentTarget;
    if(!img.dataset.fallback){img.dataset.fallback='1';img.src=A.imgURL(file)}
    else img.classList.add('failed');
   }})))):h('div',{class:'studio-empty studio-note'},W('art.none')));
}
function StyleSample({style}){
 const [status,setStatus]=useState('loading');
 const title=P.styleRow(style)[1],file='style-pikachu-youthful-20260919-'+style+'.webp';
 const url=A.imgURL(file)+(['anime_illust','ink_wash'].includes(style)?'?v=complete2':'');
 return h('figure',{class:'studio-style-sample',id:'style-sample','aria-labelledby':'style-sample-caption'},
  h('figcaption',{id:'style-sample-caption'},W('prompt.style.sample.title',{style:title})),
  h('a',{href:url,target:'_blank',rel:'noopener','aria-label':W('prompt.style.sample.open',{style:title})},
   h('img',{src:url,alt:W('prompt.style.sample.alt',{style:title}),
    width:1086,height:1448,decoding:'async',hidden:status==='error',
    onLoad:()=>setStatus('loaded'),onError:()=>setStatus('error')})),
  status!=='loaded'&&note(W(status==='error'?'prompt.style.sample.error':'prompt.style.sample.loading'),{role:'status'}),
  note(W('prompt.style.sample.settings')),
  note(W('prompt.style.sample.note')));
}
/* 종별 얼굴 설계 — data/face-design.json 의 이 종. 새 인물에만 FACE·HAIR 줄로 실린다. 직접 고른 얼굴·머리 항목은 그 항목이 이긴다
   (헤어스타일을 고르면 설계 머리는 앞머리까지 다 빠진다 — lib/prompt-anthro.js hairItems) */
function FaceDesign({face,on,params,onToggle}){
 const label=k=>S.PARAM_DEFS.find(d=>d.key===k),ko=(k,v)=>{const o=label(k)?.options.find(o=>o[0]===v);return o?o[1].split('— ').pop():v};
 const hairMine=k=>!!(params.hairstyle||params[k]||(k==='hairstyle'&&params['hair length']));
 return h('div',{id:'face-design'},
  h('h3',{class:'studio-label'},W('prompt.face.title')),
  h('label',{class:'studio-check'},h('input',{type:'checkbox',id:'face-design-on',checked:on,onChange:onToggle}),' ',W('prompt.face.use')),
  note(W(face.registered?'prompt.face.registered':'prompt.face.note')),
  on&&h('ul',{class:'studio-note',id:'face-design-list'},S.FACE_KEYS.map(k=>h('li',{key:k,'data-key':k,class:params[k]?'overridden':''},
   label(k).ko+' · '+ko(k,face.face[k])+(params[k]?' — '+W('prompt.face.overridden'):'')))),
  on&&face.hair&&Object.keys(face.hair).length>0&&h('ul',{class:'studio-note',id:'hair-design-list'},S.HAIR_KEYS.filter(k=>face.hair[k]).map(k=>h('li',{key:k,'data-key':k,class:hairMine(k)?'overridden':''},
   label(k).ko+' · '+ko(k,face.hair[k])+(hairMine(k)?' — '+W('prompt.face.overridden'):'')))),
  on&&face.hair_why&&note(W('prompt.face.hair')+' '+face.hair_why,{id:'hair-design-why'}),
  on&&face.why&&note(W('prompt.face.why')+' '+face.why),
  on&&face.cues&&face.cues.length>0&&note(W('prompt.face.cues')+' '+face.cues.join(' · ')),
  on&&face.adjusted&&note(W('prompt.face.adjusted')+' '+face.adjusted));
}
/* 일상컷 트리 — 추천 조합, 시대 → 장소 → 하는 일 → 의상 계열 → 옷, 필수 갈래 표시(lib/casual-tree.js, game 생성기에서 옮김) */
function CasualTree({tree,card,scene,randomSelect,setTree,usePreset}){
 const subj={gen:card.gen};
 const presetOptions=[['',W('prompt.tree.preset.none')],...tree.preset_groups.map(g=>({group:g.ko,
  options:tree.presets.filter(p=>p.group===g.key).map(p=>[p.key,p.ko])})).filter(g=>g.options.length)];
 const eraOptions=CT.eras(tree).map(e=>[e.key,e.key==='release'?W('prompt.era.release',{year:CT.year(tree,subj)||'?',gen:card.gen||'?'}):e.ko]);
 const ps=CT.places(tree,scene.era,subj);
 const placeOptions=tree.groups.map(g=>({group:g.ko,options:ps.filter(p=>p.group===g.key).map(p=>[p.key,p.ko])})).filter(g=>g.options.length);
 const actOptions=CT.acts(tree,scene.era,scene.place).map(a=>[a.key,a.ko+' · '+tree.families[a.family].ko]);
 const req=new Set((tree.required||{}).outfits||[]);
 const famOptions=CT.outfitFamilies(tree,scene.era,scene.place,scene.act).map(o=>[o.key,o.ko+(req.has(o.key)?' ★':'')]);
 const itemOptions=[['',W('prompt.tree.item.auto')],...CT.items(tree,scene.ofam,scene.frame).map(i=>[i.key,i.ko])];
 const pl=CT.place(tree,scene.place),it=CT.item(tree,scene.ofam,scene.item);
 return h('div',{id:'casual-tree'},
  h('h3',{class:'studio-label'},W('prompt.tree.title')),note(W('prompt.tree.note')),
  h(Select,{id:'preset',label:W('prompt.tree.preset'),value:scene.preset||'',options:presetOptions,description:W('prompt.help.tree.preset'),onChange:usePreset}),
  h('div',{class:'studio-grid-fields'},
   randomSelect({id:'era',label:W('prompt.era'),value:scene.era,options:eraOptions,description:W('prompt.help.tree.era'),onChange:v=>setTree('era',v)},'era'),
   randomSelect({id:'place',label:W('prompt.tree.place'),value:scene.place,options:placeOptions,description:pl?pl.en:W('prompt.help.tree.place'),onChange:v=>setTree('place',v)},'place'),
   randomSelect({id:'act',label:W('prompt.tree.act'),value:scene.act,options:actOptions,description:CT.act(tree,scene.act)?.en||W('prompt.help.tree.act'),onChange:v=>setTree('act',v)},'act'),
   randomSelect({id:'ofam',label:W('prompt.tree.ofam'),value:scene.ofam,options:famOptions,description:W('prompt.help.tree.ofam'),onChange:v=>setTree('ofam',v)},'ofam'),
   randomSelect({id:'item',label:W('prompt.tree.item'),value:scene.item||'',options:itemOptions,description:[it?it.en:W('prompt.help.tree.item'),CT.frameRule(tree,scene.frame).low===false&&W('prompt.tree.item.close')].filter(Boolean).join('\n'),onChange:v=>setTree('item',v)},'item')),
  CT.companion(tree,scene.place)&&note(W('prompt.tree.companion'),{id:'companion-note'}),
  note(W(CT.isRequired(tree,scene)?'prompt.tree.required.yes':'prompt.tree.required.no'),{id:'required-note'}));
}
/* 일상컷 자세·방향 — 하는 일의 자세 계열 안에서만. 안 쓰는 방향(뒤돌림·멀어지기)은 트리가 뺀다 */
function casualPose(tree,scene,randomSelect,setTree){
 const fam=CT.poseFamily(tree,scene.act),famKo=fam?fam.ko:'';
 const allowP=new Set(CT.poses(tree,scene.act,scene.frame)),allowO=new Set(CT.orients(tree,scene.act,scene.frame,S.CLOSE_FRAMES,scene.pose));
 return [randomSelect({key:'pose',id:'pose',label:W('prompt.pose'),value:scene.pose||'',options:S.POSE_OPTIONS.filter(r=>!r[0]||allowP.has(r[0])),
   description:S.POSE_GUIDES[scene.pose]?.[0]||W('prompt.tree.pose.help',{family:famKo}),onChange:v=>setTree('pose',v)},'pose'),
  randomSelect({key:'orient',id:'orientation',label:W('prompt.orientation'),value:scene.orient||'',options:S.ORIENTATION_OPTIONS.filter(r=>!r[0]||allowO.has(r[0])),
   description:S.ORIENTATION_GUIDES[scene.orient]?.[0]||W('prompt.tree.orient.help',{family:famKo}),onChange:v=>setTree('orient',v)},'orient')];
}
/* 일상컷 계획기(tools/casual-plan.cjs)의 주소 — ?mech=<카드>&casual=<선택값>. 값을 채우고 모두 잠근다.
   장면·의상 칸은 새 컷이라 비운다(작업자가 계획의 옷 종류·드러내는 방식대로 쓴다). 한 번 받으면 주소에서 지운다 — 새로고침이 손본 값을 덮지 않게 */
function planned(st,raw,tree){
 const got=raw&&CP?CP.fromQuery(S,raw,tree):null;
 if(!got)return {st,notice:''};
 const prev=st.scenes.casual;
 const scene={...prev,...got.scene,scene:'',outfit:'',camera:'',custom:'',preset:'',action:prev.action,
  axes:{...got.scene.axes},randomLocks:got.locks};
 const n=Object.keys(got.locks).length;
 return {st:{...st,mode:'casual',scenes:{...st.scenes,casual:scene}},
  notice:[W('prompt.plan.applied',{n}),got.bad.length?W('prompt.plan.bad',{keys:got.bad.join(', ')}):''].filter(Boolean).join(' ')};
}
function Editor({card,images,appearance,face,tree,plan,onPlanUsed}){
 const subj={gen:card.gen},rctx={tree,card:subj};
 const [first]=useState(()=>{const s=normalize(object(saved.cards)[card.name],tree);
  return planned({...s,scenes:{...s.scenes,casual:CT.repair(tree,s.scenes.casual,subj,S.CLOSE_FRAMES)}},plan,tree);});
 const [st,set]=useState(first.st);
 const [notice,setNotice]=useState(first.notice),[storageError,setStorageError]=useState(false);
 useEffect(()=>{
  if(!plan)return;
  const q=new URLSearchParams(location.search);q.delete('casual');
  try{history.replaceState(null,'',location.pathname+(q.toString()?'?'+q:'')+location.hash)}catch{}
  onPlanUsed&&onPlanUsed();   /* 다른 카드로 갔다 돌아와도 다시 채우지 않게 */
 },[]);
 const outputRef=useRef();
 const mode=st.mode,scene=st.scenes[mode],overdrive=mode==='action'&&st.form==='overdrive';
 /* 개방은 늘 그 폼 그림을 첨부한다 — 새 인물 외형을 쓰지 않는다 */
 const reference=mode==='casual'||overdrive||st.identityMode==='reference';
 const wear=P.wearClauses({sourceAppearance:appearance,headFeature:st.headFeature});
 const headOptions=S.HEAD_FEATURE_OPTIONS.map(r=>[r[0],r[1]]),headCustom=!!st.headFeature&&!headOptions.some(([v])=>v===st.headFeature);
 const update=(key,value)=>{set(s=>({...s,[key]:value}));setNotice('')};
 const setScene=(key,value)=>set(s=>({...s,scenes:{...s.scenes,[mode]:{...s.scenes[mode],[key]:value}}}));
 const setAction=(key,value)=>set(s=>{
  const current=s.scenes.action;
  return {...s,scenes:{...s.scenes,action:{...current,action:{...current.action,[key]:value,
   ...(key==='category'?{example:''}:{})}}}};
 });
 const setParam=(key,value)=>set(s=>({...s,params:{...s.params,[key]:value}}));
 /* 일상컷 트리 — 한 칸을 바꾸면 그 뒤에서 맞지 않게 된 칸을 고친다. 장소·하는 일·옷을 손으로 바꾸면 추천 조합 표시는 지운다 */
 const setTree=(key,value)=>set(s=>{const c={...s.scenes.casual,[key]:value};
  if(R.CASUAL.indexOf(key)>=0&&R.CASUAL.indexOf(key)<R.CASUAL.indexOf('frame'))c.preset='';
  return {...s,scenes:{...s.scenes,casual:CT.repair(tree,c,subj,S.CLOSE_FRAMES)}};});
 const usePreset=k=>set(s=>({...s,scenes:{...s.scenes,casual:CT.repair(tree,k?CT.applyPreset(tree,s.scenes.casual,k):{...s.scenes.casual,preset:''},subj,S.CLOSE_FRAMES)}}));
 useLayoutEffect(()=>{
  saved={...saved,last:card.name,cards:{...object(saved.cards),[card.name]:st}};
  try{localStorage.setItem(STORE,JSON.stringify(saved));setStorageError(false)}catch{setStorageError(true)}
 },[st,card.name]);
 const result=useMemo(()=>{
  try{
   const input={...st,...scene,mech:card.name,sourceName:card.en,sourceAppearance:appearance,faceDesign:face,tree,gen:card.gen,
    series:[card.element,card.element2].filter(Boolean).join(' / '),
    outputMode:mode,identityMode:reference?'reference':'create',params:Object.entries(st.params)};
   return {text:mode==='casual'?L.buildSingle(input):P.buildPrompt(input)};
  }catch(e){return {text:'',error:W('prompt.output.error',{message:e.message})}}
 },[st,card,mode,reference,scene,appearance,face]);
 async function copy(){
  try{await navigator.clipboard.writeText(result.text);setNotice(W('prompt.copied'))}
  catch{outputRef.current?.focus();outputRef.current?.select();setNotice(W('prompt.copy.failed'))}
 }
 function randomize(){
  /* 종별 얼굴 설계가 켜져 있으면 얼굴 골격·이목구비와 설계된 머리(헤어스타일·길이·앞머리)는 무작위로 바꾸지 않는다 — 비워 두어 설계가 채운다 */
  const designed=(s,k)=>face&&s.faceDesignOn&&(S.FACE_KEYS.includes(k)||(S.HAIR_KEYS.includes(k)&&!!face.hair?.[k]));
  set(s=>({...s,params:{...s.params,...Object.fromEntries(defs.filter(d=>!s.locks[d.key]&&!designed(s,d.key)).map(d=>{
   const choices=d.options.filter(([v])=>v&&v!=='__custom__');
   return [d.key,choices.length?choices[Math.floor(Math.random()*choices.length)][0]:''];
  }))}}));
 }
 const stage=value=>update('identityMode',value);
 const randomScene=key=>set(s=>({...s,scenes:{...s.scenes,[mode]:R.randomize(s.scenes[mode],mode,key,Math.random,rctx)}}));
 const toggleSceneLock=key=>set(s=>{
  const current=s.scenes[mode];
  return {...s,scenes:{...s.scenes,[mode]:{...current,randomLocks:{...current.randomLocks,[key]:!current.randomLocks[key]}}}};
 });
 const randomSelect=(props,key)=>h('div',{class:'scene-choice',key:props.key||key},
  h(Select,props),h('div',{class:'scene-choice-actions'},
   h('button',{type:'button',id:'random-'+props.id,disabled:!R.canRandomize(scene,mode,key,rctx),
    'aria-label':W('prompt.scene.random.field',{label:props.label}),onClick:()=>randomScene(key)},W('prompt.scene.random.short')),
   h('button',{type:'button',id:'lock-'+props.id,'aria-pressed':!!scene.randomLocks[key],
    'aria-label':W(scene.randomLocks[key]?'prompt.scene.unlock.field':'prompt.scene.lock.field',{label:props.label}),
    onClick:()=>toggleSceneLock(key)},W(scene.randomLocks[key]?'prompt.scene.locked':'prompt.scene.lock'))));
 const sceneSelect=(id,key,options,label,description)=>randomSelect({id,label:W('prompt.'+(label||key)),value:scene[key],
  description:description||W('prompt.help.'+(label||key)),options,onChange:v=>setScene(key,v)},key);
 const sceneText=key=>h(Text,{key,id:key,label:W(key==='custom'?'prompt.extra':'prompt.'+key),
  description:W('prompt.help.'+key),value:scene[key],multiline:true,onChange:v=>setScene(key,v)});
 const action=scene.action,actionCategory=S.ACTION_CATEGORIES.find(r=>r.key===action.category);
 const actionExample=actionCategory?.examples.find(r=>r.key===action.example);
 const actionOptions=rows=>[['',W('prompt.auto')],...rows.map(r=>[r.key,r.label])];
 const poses=mode==='action'?actionOptions(S.ACTION_POSES):S.POSE_OPTIONS;
 if(mode==='action'&&scene.pose&&!poses.some(r=>r[0]===scene.pose)){
  const legacy=S.POSE_OPTIONS.find(r=>r[0]===scene.pose);
  if(legacy)poses.push(legacy);
 }
 const poseDescription=(mode==='action'&&S.ACTION_POSES.find(r=>r.key===scene.pose)?.description)||S.POSE_GUIDES[scene.pose]?.[0]||W(mode==='action'?'prompt.action.pose.help':'prompt.help.pose');
 return h('div',{class:'studio-editor'},
  h('div',{class:'studio-tabs',role:'group','aria-label':W('prompt.output')},MODES.map(m=>h('button',{
   id:'mode-'+m,key:m,'aria-pressed':mode===m,onClick:()=>update('mode',m)},W('prompt.'+m)))),
  h('section',{class:'studio-card'},
   h(Select,{id:'style',label:W('prompt.style'),value:st.style,options:S.ART_STYLES.map(r=>[r[0],r[1]]),
    onChange:v=>update('style',v)}),
   note(P.styleRow(st.style)[2],{id:'style-description'}),
   h(StyleSample,{key:st.style,style:st.style}),
   mode!=='casual'&&!overdrive&&h(Select,{id:'identity-mode',label:W('prompt.stage'),value:st.identityMode,
    options:[['create',W('prompt.create')],['reference',W('prompt.reference')]],onChange:stage}),
   !overdrive&&note(W(reference?'prompt.reference.note':'prompt.create.note'),{id:'identity-note'}),
   reference&&!overdrive&&note(W('prompt.anchor.note')),
   note(W('prompt.'+mode+'.note'),{id:'output-mode-note'}),
   mode!=='casual'&&h('div',null,
    h('div',{class:'studio-row'},h(Select,{id:'form',label:W('prompt.form'),value:st.form,
     options:FORMS.map(f=>[f,W('form.'+f)]),onChange:v=>update('form',v)}),
     st.form==='overdrive'&&h(Select,{id:'base-form',label:W('prompt.base'),value:st.baseForm,
      options:[...FORMS.filter(f=>f!=='overdrive').map(f=>[f,W('form.'+f)]),['reference',W('prompt.base.reference')]],
      onChange:v=>update('baseForm',v)})),
    note(W('prompt.'+st.form+'.note')),
    h(Text,{id:'form-override',label:W('prompt.override'),value:st.formOverride,
     placeholder:W('prompt.override.ph'),onChange:v=>update('formOverride',v)})),
   h(Text,{id:'motifs',label:W('prompt.motifs'),value:st.motifs,
    description:W(mode==='casual'?'prompt.help.motifs':'prompt.help.motifs.auto'),
    placeholder:W('prompt.motifs.ph'),onChange:v=>update('motifs',v)})),
  mode==='action'&&!reference&&h('section',{class:'studio-card',id:'source-wear'},
   h('h2',{class:'studio-title'},W('prompt.wear.title')),
   appearance&&h('p',{id:'source-appearance-summary',class:'studio-note'},
    P.sourceFeatures({sourceAppearance:appearance}).join(' · '),' ',
    h('a',{href:appearance.source,target:'_blank',rel:'noreferrer'},W('prompt.appearance.source')),' · ',
    h('a',{href:'https://creativecommons.org/licenses/by-nc-sa/2.5/',target:'_blank',rel:'noreferrer'},W('prompt.appearance.license'))),
   !st.motifs.trim()&&wear.length>0&&h('div',{id:'wear-preview'},note(W('prompt.wear.note')),
    h('ul',{class:'studio-note'},wear.map((t,i)=>h('li',{key:i,lang:'en'},t)))),
   h(Select,{id:'head-feature',label:W('prompt.head'),description:W('prompt.head.help'),
    value:headCustom?'__custom__':st.headFeature,options:headOptions,onChange:v=>update('headFeature',v)}),
   headCustom||st.headFeature==='__custom__'?h('div',{class:'custom-value'},h(Text,{id:'head-feature-custom',label:W('prompt.custom'),
    value:headCustom?st.headFeature:'',onChange:v=>update('headFeature',v||'__custom__')})):null,
   face&&h(FaceDesign,{face,on:st.faceDesignOn,params:st.params,onToggle:()=>update('faceDesignOn',!st.faceDesignOn)})),
  !reference&&h('section',{class:'studio-card',id:'appearance-settings'},
   h('div',{class:'studio-actions'},h('h2',{class:'studio-title'},W('prompt.appearance')),
    h('div',{class:'studio-row'},h('button',{id:'randomize',onClick:randomize},W('prompt.random')),
     h('button',{onClick:()=>update('params',{})},W('prompt.reset')))),
   note(W('prompt.appearance.note')),
   S.IDENTITY_GROUPS.map(group=>h('details',{class:'grp',key:group,open:group==='base'},
    h('summary',null,h('span',null,W('prompt.group.'+group))),
    h('div',{class:'grp-in'},defs.filter(d=>d.group===group).map(d=>h(Param,{key:d.key,d,
     value:st.params[d.key]||'',params:st.params,locked:st.locks[d.key],onValue:v=>setParam(d.key,v),
     onLock:()=>update('locks',{...st.locks,[d.key]:!st.locks[d.key]})})))))),
  overdrive?h('section',{class:'studio-card'},h('h2',{class:'studio-title'},W('prompt.scene.settings')),sceneText('custom')):
  h('section',{class:'studio-card'},h('h2',{class:'studio-title'},W('prompt.scene.settings')),
   h('div',null,
    h('button',{type:'button',id:'random-scene',disabled:!Object.keys(R.fields(scene,mode,rctx)).some(k=>R.canRandomize(scene,mode,k,rctx)),
     onClick:()=>randomScene(null)},W('prompt.scene.random.all')),note(W('prompt.scene.random.help'))),
   mode!=='casual'&&sceneSelect('expression','expr',S.EXPRESSION_OPTIONS,'expression'),
   h('div',null,
    mode==='casual'&&h(CasualTree,{tree,card,scene,randomSelect,setTree,usePreset}),
    mode==='action'&&h('div',{id:'action-settings'},
     h('h3',{class:'studio-label'},W('prompt.action.settings')),
     h('div',{class:'studio-grid-fields'},
      randomSelect({id:'action-category',label:W('prompt.action.category'),value:action.category,
       options:actionOptions(S.ACTION_CATEGORIES),description:actionCategory?.description||W('prompt.action.category.help'),
       onChange:v=>setAction('category',v)},'action.category'),
      randomSelect({id:'action-example',label:W('prompt.action.example'),value:action.example,
       options:actionOptions(actionCategory?.examples||[]),disabled:!actionCategory,
       description:actionExample?.description||W(actionCategory?'prompt.action.example.help':'prompt.action.example.empty'),
       onChange:v=>setAction('example',v)},'action.example'),
      S.ACTION_CONTROLS.map(control=>randomSelect({key:control.key,id:'action-'+control.key,
       label:control.label,value:action[control.key],options:actionOptions(control.options),
       description:control.options.find(r=>r.key===action[control.key])?.description||control.description,
       onChange:v=>setAction(control.key,v)},'action.'+control.key)))),
    h('div',{class:'studio-grid-fields'},
     mode==='casual'?casualPose(tree,scene,randomSelect,setTree):[sceneSelect('pose','pose',poses,'pose',poseDescription),
      sceneSelect('orientation','orient',S.ORIENTATION_OPTIONS,'orientation',S.ORIENTATION_GUIDES[scene.orient]?.[0])],
     randomSelect({id:'frame',label:W('prompt.frame'),value:scene.frame,options:mode==='casual'?S.FRAME_OPTIONS.filter(r=>CT.frameOk(tree,scene.act,r[0],scene)):S.FRAME_OPTIONS,
      description:[W('prompt.help.frame'),S.FRAME_GUIDES[scene.frame]?.[0],mode==='casual'&&CT.isRequired(tree,scene)&&W('prompt.tree.frame.required')].filter(Boolean).join('\n'),
      onChange:v=>mode==='casual'?setTree('frame',v):setScene('frame',v)},'frame'),
     sceneSelect('lens','lens',mode==='casual'?S.LENS_OPTIONS.filter(r=>CT.lensOk(tree,scene.frame,r[0])):S.LENS_OPTIONS,'lens',
      [W('prompt.help.lens'),S.LENS_GUIDES[scene.lens]?.[0],mode==='casual'&&CT.frameRule(tree,scene.frame).wide===false&&W('prompt.tree.lens.nowide')].filter(Boolean).join('\n')),
     sceneSelect('aspect','aspect',['2:3','3:2','1:1','9:16','16:9'].map(v=>[v,v])),
     h(Text,{id:'camera',label:W('prompt.camera'),value:scene.camera,
      description:W('prompt.help.camera'),onChange:v=>setScene('camera',v)})),
    mode==='casual'?[h(Text,{key:'outfit',id:'outfit',label:W('prompt.tree.outfit'),description:W('prompt.help.tree.outfit'),value:scene.outfit,multiline:true,onChange:v=>setScene('outfit',v)}),
     sceneText('scene'),sceneText('custom')]:['scene','outfit','custom'].map(sceneText),
    /* 일상컷은 표정·세부 축이 맨 끝(분위기) — 길·구도를 먼저 고른다 */
    mode==='casual'&&(CT.exprOk(tree,scene)?sceneSelect('expression','expr',S.EXPRESSION_OPTIONS,'expression'):
     randomSelect({id:'expression',label:W('prompt.expression'),value:'',options:S.EXPRESSION_OPTIONS.slice(0,1),disabled:true,description:W('prompt.tree.expr.off'),onChange:()=>{}},'expr')),
    mode==='casual'&&h('details',{class:'grp'},h('summary',null,h('span',null,W('prompt.axes'))),
     h('div',{class:'grp-in'},S.LOCAL_AXES.map(k=>randomSelect({key:k,id:'axis-'+k,
      label:S.ADVANCED_LABELS[k][1],value:scene.axes[k]||'AUTO',
      description:S.SCENE_AXIS_GUIDES[k]?.[scene.axes[k]]?.[0]||S.ADV_AXIS[k],
      options:S.ADVANCED_OPTIONS[k].map(v=>[v,v==='AUTO'?W('prompt.auto'):(S.ADV_VAL[k]?.[v]||v)]),
      onChange:v=>setScene('axes',{...scene.axes,[k]:v})},'axes.'+k)))))),
  h('section',{class:'studio-card'},
   h('div',{class:'studio-actions'},h('strong',null,W('prompt.output')+' ',h('small',null,W('prompt.count',{n:result.text.length}))),
    h('button',{id:'copy-prompt',class:'studio-copy',disabled:!result.text,onClick:copy},W('prompt.copy'))),
   h('p',{role:'status',class:'studio-status'},result.error||notice),
   h('textarea',{id:'prompt-output',class:'studio-output','aria-label':W('prompt.output'),readOnly:true,
    value:result.text,ref:outputRef}),
   note(W(storageError?'prompt.storage.failed':'prompt.local.note'))),
  h('section',{class:'studio-card'},h(Gallery,{entry:images[card.name],style:st.style,form:st.form,mode})));
}
function App(){
 const [data,setData]=useState(null),[error,setError]=useState(''),[name,setName]=useState(''),
  [query,setQuery]=useState(''),[group,setGroup]=useState(''),[plan,setPlan]=useState(null);
 useEffect(()=>{
  let live=true;
  Promise.all(['card','group','img','source-appearance','face-design','casual-tree'].map(f=>fetch('data/'+f+'.json',{cache:'no-cache'}).then(r=>{
   if(!r.ok)throw new Error(f+': '+r.status);return r.json();
  }).catch(e=>{if(f==='source-appearance'||f==='face-design')return null;throw e}))).then(([cards,groups,images,appearance,faces,tree])=>{
   if(!live)return;
   A.setShards(images);   /* 새 그림이 다음 그림 저장소에 있으면 그쪽 주소로 — img.json 의 where */
   const q=new URLSearchParams(location.search),all=cards.cards.character,requested=q.get('mech')||saved.last;
   setName(all.some(c=>c.name===requested)?requested:all[0].name);
   if(q.get('mech')&&q.get('casual'))setPlan({card:q.get('mech'),raw:q.get('casual')});
   setData({cards:all,groups,images:images.img||{},appearance:appearance?.entries||{},appearanceFailed:!appearance,faces:faces?.faces||{},tree});
  }).catch(e=>{if(live)setError(W('ui.error',{message:e.message}))});
  return()=>{live=false};
 },[]);
 const filtered=data?data.cards.filter(c=>(!group||c.element===group||c.element2===group)&&
  (!query||(c.name+' '+c.en+' '+c.no).toLowerCase().includes(query.trim().toLowerCase()))):[];
 const card=data?.cards.find(c=>c.name===name);
 // Filtering never silently switches the selected character.
 const choices=card&&!filtered.includes(card)?[card,...filtered]:filtered;
 return h('div',null,
  h(WorkspaceHeader,{page:'prompt'}),
  error?h('div',null,h('p',{role:'alert'},error),h('button',{onClick:()=>location.reload()},W('prompt.retry'))):
  !data?h('p',{role:'status'},W('ui.loading')):
  h('div',{class:'studio-grid'},h('aside',{class:'studio-source'},
   h('h2',{class:'studio-title'},W('prompt.source')),
   h('div',{class:'source-fields'},h(Text,{id:'search',label:W('ui.search'),value:query,onChange:setQuery}),
    h(Select,{id:'group',label:W('prompt.type'),value:group,
     options:[['',W('group.all')],...data.groups.order.map(k=>[k,data.groups.name[k]])],onChange:setGroup})),
   h(Select,{id:'source',label:W('prompt.source'),value:name,
    options:choices.map(c=>[c.name,String(c.no).padStart(4,'0')+' · '+c.name]),onChange:setName}),
   note(W('prompt.source.count',{n:filtered.length})),
   card&&note([card.en,[card.element,card.element2].filter(Boolean).map(k=>data.groups.name[k]).join(' / '),card.text].join(' · '))),
   h('main',{class:'studio-main'},data.appearanceFailed&&note(W('prompt.appearance.data.failed')),
    card&&h(Editor,{key:card.name,card,images:data.images,appearance:data.appearance[String(card.no)],face:data.faces[String(card.no)]||null,tree:data.tree,
     plan:plan&&plan.card===card.name?plan.raw:null,onPlanUsed:()=>setPlan(null)}))));
}
render(h(App),document.getElementById('app'));
