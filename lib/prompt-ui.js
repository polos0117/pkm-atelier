import {h,render} from 'https://esm.sh/preact@10.24.3';
import {useState,useEffect,useMemo,useRef} from 'https://esm.sh/preact@10.24.3/hooks';
import {WorkspaceHeader} from './workspace-ui.js?v=header1';
const S=window.AtelierSpec,P=window.AtelierPrompt,L=window.AtelierLifestyle,
 A=window.AtelierImg,F=window.AtelierFigures,W=window.W;
const STORE='pkm_prompt_v2',MODES=['portrait','action','casual'],FORMS=['light','heavy','mobility','overdrive'];
const defs=S.PARAM_DEFS.filter(d=>S.IDENTITY_GROUPS.includes(d.group)&&!S.IDENTITY_EXCLUDED.includes(d.key));
const blankScene=()=>({expr:'',pose:'',orient:'',scene:'',outfit:'',frame:'',lens:'',camera:'',custom:'',aspect:'2:3',
 cat:'everyday_basic',catCustom:'',ex:'',exCustom:'',axes:{},action:{}});
const defaults=()=>({style:S.DEFAULT_STYLE,identityMode:'create',form:'light',baseForm:'light',
 motifs:'',formOverride:'',params:{},locks:{},mode:'portrait',
 scenes:{portrait:blankScene(),action:blankScene(),casual:blankScene()}});
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
function normalize(input){
 const d=defaults(),x=object(input);
 const out={...d,...x,params:object(x.params),locks:object(x.locks),scenes:{}};
 if(!S.STYLE_PROFILES[out.style])out.style=d.style;
 if(!MODES.includes(out.mode))out.mode=d.mode;
 if(!FORMS.includes(out.form))out.form=d.form;
 if(!['create','reference'].includes(out.identityMode))out.identityMode='create';
 if(!['reference','light','heavy','mobility'].includes(out.baseForm))out.baseForm='light';
 if(out.identityMode==='create'&&out.baseForm==='reference')out.baseForm='light';
 for(const k of ['motifs','formOverride'])if(typeof out[k]!=='string')out[k]='';
 for(const mode of MODES){
  out.scenes[mode]={...blankScene(),...object(object(x.scenes)[mode])};
  out.scenes[mode].axes=object(out.scenes[mode].axes);
  out.scenes[mode].action=normalizeAction(out.scenes[mode].action);
 }
 return out;
}
const note=(text,props={})=>h('p',{class:'studio-note',...props},text);
function Select({id,label,value,options,onChange,description,disabled=false}){
 return h('label',{class:'studio-field'},h('span',{id:id+'-label'},label),
  h('select',{id,value,disabled,'aria-labelledby':id+'-label',
   'aria-describedby':description?id+'-description':undefined,onChange:e=>onChange(e.target.value)},
   options.map(([v,t])=>h('option',{key:v,value:v},t))),
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
function Param({d,value,locked,onValue,onLock}){
 const options=d.options.map(([v,t])=>[v,v===''?W(d.key==='second eye color'?'prompt.eye.same':'prompt.auto'):t]);
 const custom=value&&!options.some(([v])=>v===value),selected=custom?'__custom__':value||'';
 const visual=d.key==='body type'||d.key==='hairstyle',color=!!S.COLOR_KEYS[d.key];
 return h('div',{class:'studio-param'+(visual||color?' studio-param-visual':'')},
  h('button',{type:'button',class:'param-lock','aria-label':W(locked?'prompt.unlock':'prompt.lock')+' · '+d.ko,
   'aria-pressed':!!locked,onClick:onLock},locked?'●':'○'),
  h(Select,{id:'param-'+d.key.replace(/\W/g,'-'),label:d.ko,value:selected,options,onChange:onValue}),
  color&&h(ColorPicker,{d,selected,options,onValue}),
  selected==='__custom__'&&h('div',{class:'custom-value'},h(Text,{label:W('prompt.custom'),
   value:custom?value:'',onChange:v=>onValue(v||'__custom__')})),
  visual&&h(FigurePicker,{d,value,onValue}));
}
function Gallery({entry,style,form,mode}){
 const b=A.styleMap(entry)[style]||{},fb=A.formOf(b,form);
 const files=mode==='casual'?A.cuts(b,'casual','f'):mode==='action'?A.formActs(b,form,'f'):
  (fb&&fb.f?[fb.f]:b.f?[b.f]:[]);
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
function Editor({card,images}){
 const [st,set]=useState(()=>normalize(object(saved.cards)[card.name]));
 const [notice,setNotice]=useState(''),[storageError,setStorageError]=useState(false);
 const outputRef=useRef();
 const mode=st.mode,scene=st.scenes[mode],reference=mode==='casual'||st.identityMode==='reference';
 const update=(key,value)=>{set(s=>({...s,[key]:value}));setNotice('')};
 const setScene=(key,value)=>set(s=>({...s,scenes:{...s.scenes,[mode]:{...s.scenes[mode],[key]:value}}}));
 const setAction=(key,value)=>set(s=>{
  const current=s.scenes.action;
  return {...s,scenes:{...s.scenes,action:{...current,action:{...current.action,[key]:value,
   ...(key==='category'?{example:''}:{})}}}};
 });
 const setParam=(key,value)=>set(s=>({...s,params:{...s.params,[key]:value}}));
 useEffect(()=>{
  saved={...saved,last:card.name,cards:{...object(saved.cards),[card.name]:st}};
  try{localStorage.setItem(STORE,JSON.stringify(saved));setStorageError(false)}catch{setStorageError(true)}
 },[st,card.name]);
 const result=useMemo(()=>{
  try{
   const input={...st,...scene,mech:card.name,sourceName:card.en,
    series:[card.element,card.element2].filter(Boolean).join(' / '),
    outputMode:mode,identityMode:reference?'reference':'create',params:Object.entries(st.params)};
   return {text:mode==='casual'?L.buildSingle(input):P.buildPrompt(input)};
  }catch(e){return {text:'',error:W('prompt.output.error',{message:e.message})}}
 },[st,card,mode,reference,scene]);
 async function copy(){
  try{await navigator.clipboard.writeText(result.text);setNotice(W('prompt.copied'))}
  catch{outputRef.current?.focus();outputRef.current?.select();setNotice(W('prompt.copy.failed'))}
 }
 function randomize(){
  set(s=>({...s,params:{...s.params,...Object.fromEntries(defs.filter(d=>!s.locks[d.key]).map(d=>{
   const choices=d.options.filter(([v])=>v&&v!=='__custom__');
   return [d.key,choices.length?choices[Math.floor(Math.random()*choices.length)][0]:''];
  }))}}));
 }
 function stage(value){
  set(s=>({...s,identityMode:value,baseForm:value==='reference'?'reference':s.baseForm==='reference'?'light':s.baseForm}));
 }
 const sceneSelect=(id,key,options,label,description)=>h(Select,{id,label:W('prompt.'+(label||key)),value:scene[key],
  description:description||W('prompt.help.'+(label||key)),options,onChange:v=>setScene(key,v)});
 const sceneText=key=>h(Text,{key,id:key,label:W(key==='custom'?'prompt.extra':'prompt.'+key),
  description:W('prompt.help.'+key),value:scene[key],multiline:true,onChange:v=>setScene(key,v)});
 const categoryOptions=S.CATS.filter(r=>r[4]!=='m').map(r=>[r[0],r[2]]);
 const examples=(S.EXAMPLE_MAP[scene.cat]||[['','',W('prompt.auto')]]).filter(r=>r[4]!=='m').map(r=>[r[0],r[2]]);
 if(!examples.some(r=>r[0]==='__custom__'))examples.push(['__custom__',W('prompt.custom')]);
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
   mode!=='casual'&&h(Select,{id:'identity-mode',label:W('prompt.stage'),value:st.identityMode,
    options:[['create',W('prompt.create')],['reference',W('prompt.reference')]],onChange:stage}),
   note(W(reference?'prompt.reference.note':'prompt.create.note'),{id:'identity-note'}),
   reference&&note(W('prompt.anchor.note')),
   note(W(mode==='portrait'&&!reference?'prompt.portrait.create.note':'prompt.'+mode+'.note'),{id:'output-mode-note'}),
   mode!=='casual'&&h('div',null,
    h('div',{class:'studio-row'},h(Select,{id:'form',label:W('prompt.form'),value:st.form,
     options:FORMS.map(f=>[f,W('form.'+f)]),onChange:v=>update('form',v)}),
     st.form==='overdrive'&&h(Select,{id:'base-form',label:W('prompt.base'),value:st.baseForm,
      options:[...(reference?[['reference',W('prompt.base.reference')]]:[]),
       ...FORMS.filter(f=>f!=='overdrive').map(f=>[f,W('form.'+f)])],onChange:v=>update('baseForm',v)})),
    note(W('prompt.'+st.form+'.note')),
    h(Text,{id:'form-override',label:W('prompt.override'),value:st.formOverride,
     placeholder:W('prompt.override.ph'),onChange:v=>update('formOverride',v)})),
   h(Text,{id:'motifs',label:W('prompt.motifs'),value:st.motifs,
    description:mode==='casual'?W('prompt.help.motifs'):undefined,
    placeholder:W('prompt.motifs.ph'),onChange:v=>update('motifs',v)})),
  !reference&&h('section',{class:'studio-card',id:'appearance-settings'},
   h('div',{class:'studio-actions'},h('h2',{class:'studio-title'},W('prompt.appearance')),
    h('div',{class:'studio-row'},h('button',{id:'randomize',onClick:randomize},W('prompt.random')),
     h('button',{onClick:()=>update('params',{})},W('prompt.reset')))),
   note(W('prompt.appearance.note')),
   S.IDENTITY_GROUPS.map(group=>h('details',{class:'grp',key:group,open:group==='base'},
    h('summary',null,h('span',null,W('prompt.group.'+group))),
    h('div',{class:'grp-in'},defs.filter(d=>d.group===group).map(d=>h(Param,{key:d.key,d,
     value:st.params[d.key]||'',locked:st.locks[d.key],onValue:v=>setParam(d.key,v),
     onLock:()=>update('locks',{...st.locks,[d.key]:!st.locks[d.key]})})))))),
  h('section',{class:'studio-card'},h('h2',{class:'studio-title'},W('prompt.scene.settings')),
   sceneSelect('expression','expr',S.EXPRESSION_OPTIONS,'expression'),
   mode!=='portrait'&&h('div',null,
    mode==='casual'&&h('div',{class:'studio-grid-fields'},
     h(Select,{id:'category',label:W('prompt.category'),value:scene.cat,options:categoryOptions,
      description:S.CAT_KO[scene.cat],
      onChange:v=>set(s=>({...s,scenes:{...s.scenes,casual:{...s.scenes.casual,cat:v,ex:''}}}))}),
     sceneSelect('example','ex',examples,'example',S.EX_NOTE[scene.ex]||W(scene.ex==='__custom__'?'prompt.help.example.custom':'prompt.help.example')),
     scene.cat==='__custom__'&&h(Text,{id:'category-custom',label:W('prompt.custom'),
      description:W('prompt.help.category.custom'),value:scene.catCustom,onChange:v=>setScene('catCustom',v)}),
     scene.ex==='__custom__'&&h(Text,{id:'example-custom',label:W('prompt.custom'),
      description:W('prompt.help.example.custom'),value:scene.exCustom,onChange:v=>setScene('exCustom',v)})),
    mode==='action'&&h('div',{id:'action-settings'},
     h('h3',{class:'studio-label'},W('prompt.action.settings')),
     h('div',{class:'studio-grid-fields'},
      h(Select,{id:'action-category',label:W('prompt.action.category'),value:action.category,
       options:actionOptions(S.ACTION_CATEGORIES),description:actionCategory?.description||W('prompt.action.category.help'),
       onChange:v=>setAction('category',v)}),
      h(Select,{id:'action-example',label:W('prompt.action.example'),value:action.example,
       options:actionOptions(actionCategory?.examples||[]),disabled:!actionCategory,
       description:actionExample?.description||W(actionCategory?'prompt.action.example.help':'prompt.action.example.empty'),
       onChange:v=>setAction('example',v)}),
      S.ACTION_CONTROLS.map(control=>h(Select,{key:control.key,id:'action-'+control.key,
       label:control.label,value:action[control.key],options:actionOptions(control.options),
       description:control.options.find(r=>r.key===action[control.key])?.description||control.description,
       onChange:v=>setAction(control.key,v)})))),
    h('div',{class:'studio-grid-fields'},
     sceneSelect('pose','pose',poses,'pose',poseDescription),
     sceneSelect('orientation','orient',S.ORIENTATION_OPTIONS,'orientation'),
     sceneSelect('frame','frame',S.FRAME_OPTIONS,'frame',S.FRAME_GUIDES[scene.frame]?.[0]),
     sceneSelect('lens','lens',S.LENS_OPTIONS,'lens',S.LENS_GUIDES[scene.lens]?.[0]),
     sceneSelect('aspect','aspect',['2:3','3:2','1:1','9:16','16:9'].map(v=>[v,v])),
     h(Text,{id:'camera',label:W('prompt.camera'),value:scene.camera,
      description:W('prompt.help.camera'),onChange:v=>setScene('camera',v)})),
    ['scene','outfit','custom'].map(sceneText),
    mode==='casual'&&h('details',{class:'grp'},h('summary',null,h('span',null,W('prompt.axes'))),
     h('div',{class:'grp-in'},S.LOCAL_AXES.map(k=>h(Select,{key:k,id:'axis-'+k,
      label:S.ADVANCED_LABELS[k][1],value:scene.axes[k]||'AUTO',
      description:S.ADV_AXIS[k],
      options:S.ADVANCED_OPTIONS[k].map(v=>[v,v==='AUTO'?W('prompt.auto'):(S.ADV_VAL[k]?.[v]||v)]),
      onChange:v=>setScene('axes',{...scene.axes,[k]:v})})))))),
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
  [query,setQuery]=useState(''),[group,setGroup]=useState('');
 useEffect(()=>{
  let live=true;
  Promise.all(['card','group','img'].map(f=>fetch('data/'+f+'.json',{cache:'no-cache'}).then(r=>{
   if(!r.ok)throw new Error(f+': '+r.status);return r.json();
  }))).then(([cards,groups,images])=>{
   if(!live)return;
   const all=cards.cards.character,requested=new URLSearchParams(location.search).get('mech')||saved.last;
   setName(all.some(c=>c.name===requested)?requested:all[0].name);
   setData({cards:all,groups,images:images.img||{}});
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
   h('main',{class:'studio-main'},card&&h(Editor,{key:card.name,card,images:data.images}))));
}
render(h(App),document.getElementById('app'));
