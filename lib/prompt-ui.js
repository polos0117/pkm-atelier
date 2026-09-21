import {h,render} from 'https://esm.sh/preact@10.24.3';
import {useState,useEffect,useLayoutEffect,useMemo,useRef} from 'https://esm.sh/preact@10.24.3/hooks';
import {WorkspaceHeader} from './workspace-ui.js?v=header1';
const S=window.AtelierSpec,P=window.AtelierPrompt,L=window.AtelierLifestyle,
 A=window.AtelierImg,F=window.AtelierFigures,W=window.W,R=window.AtelierSceneRandom;
const STORE='pkm_prompt_v2',MODES=['portrait','action','casual'],FORMS=['light','heavy','mobility','overdrive'];
const defs=S.PARAM_DEFS.filter(d=>S.IDENTITY_GROUPS.includes(d.group)&&!S.IDENTITY_EXCLUDED.includes(d.key));
const blankScene=()=>({expr:'',pose:'',orient:'',scene:'',outfit:'',frame:'',lens:'',camera:'',custom:'',aspect:'2:3',
 cat:'everyday_basic',catCustom:'',ex:'',exCustom:'',axes:{},action:{},randomLocks:{}});
const defaults=()=>({style:S.DEFAULT_STYLE,identityMode:'create',form:'light',baseForm:'light',
 motifs:'',formOverride:'',headFeature:'',featureInsets:{},params:{},locks:{},mode:'portrait',
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
 const out={...d,...x,featureInsets:object(x.featureInsets),params:object(x.params),locks:object(x.locks),scenes:{}};
 if(!S.STYLE_PROFILES[out.style])out.style=d.style;
 if(!MODES.includes(out.mode))out.mode=d.mode;
 if(!FORMS.includes(out.form))out.form=d.form;
 if(!['create','reference'].includes(out.identityMode))out.identityMode='create';
 if(!['reference','light','heavy','mobility'].includes(out.baseForm))out.baseForm='light';
 if(out.identityMode==='create'&&out.baseForm==='reference')out.baseForm='light';
 for(const k of ['motifs','formOverride','headFeature'])if(typeof out[k]!=='string')out[k]='';
 /* 옛 저장값의 front/rear/function 은 뜻이 달라 버린다 — 세 칸이 얼굴·설계 언어·장착부로 바뀌었다 */
 out.featureInsets=Object.fromEntries(['face','design','mount'].map(k=>[k,typeof out.featureInsets[k]==='string'?out.featureInsets[k]:'']));
 for(const mode of MODES){
  out.scenes[mode]={...blankScene(),...object(object(x.scenes)[mode])};
  out.scenes[mode].axes=object(out.scenes[mode].axes);
  out.scenes[mode].action=normalizeAction(out.scenes[mode].action);
  out.scenes[mode].randomLocks=Object.fromEntries(Object.entries(object(out.scenes[mode].randomLocks)).filter(([,v])=>v===true));
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
function Editor({card,images,appearance}){
 const [st,set]=useState(()=>normalize(object(saved.cards)[card.name]));
 const [notice,setNotice]=useState(''),[storageError,setStorageError]=useState(false);
 const outputRef=useRef();
 const mode=st.mode,scene=st.scenes[mode],reference=mode==='casual'||st.identityMode==='reference';
 const insetSuggestions=P.featureInsetSuggestions({params:st.params,motifs:st.motifs,sourceAppearance:appearance,headFeature:st.headFeature});
 const headOptions=S.HEAD_FEATURE_OPTIONS.map(r=>[r[0],r[1]]),headCustom=!!st.headFeature&&!headOptions.some(([v])=>v===st.headFeature);
 const update=(key,value)=>{set(s=>({...s,[key]:value}));setNotice('')};
 const setScene=(key,value)=>set(s=>({...s,scenes:{...s.scenes,[mode]:{...s.scenes[mode],[key]:value}}}));
 const setAction=(key,value)=>set(s=>{
  const current=s.scenes.action;
  return {...s,scenes:{...s.scenes,action:{...current,action:{...current.action,[key]:value,
   ...(key==='category'?{example:''}:{})}}}};
 });
 const setParam=(key,value)=>set(s=>({...s,params:{...s.params,[key]:value}}));
 const setFeatureInset=(key,value)=>set(s=>({...s,featureInsets:{...s.featureInsets,[key]:value}}));
 useLayoutEffect(()=>{
  saved={...saved,last:card.name,cards:{...object(saved.cards),[card.name]:st}};
  try{localStorage.setItem(STORE,JSON.stringify(saved));setStorageError(false)}catch{setStorageError(true)}
 },[st,card.name]);
 const result=useMemo(()=>{
  try{
   const input={...st,...scene,mech:card.name,sourceName:card.en,sourceAppearance:appearance,
    series:[card.element,card.element2].filter(Boolean).join(' / '),
    outputMode:mode,identityMode:reference?'reference':'create',params:Object.entries(st.params)};
   return {text:mode==='casual'?L.buildSingle(input):P.buildPrompt(input)};
  }catch(e){return {text:'',error:W('prompt.output.error',{message:e.message})}}
 },[st,card,mode,reference,scene,appearance]);
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
 const randomScene=key=>set(s=>({...s,scenes:{...s.scenes,[mode]:R.randomize(s.scenes[mode],mode,key)}}));
 const toggleSceneLock=key=>set(s=>{
  const current=s.scenes[mode];
  return {...s,scenes:{...s.scenes,[mode]:{...current,randomLocks:{...current.randomLocks,[key]:!current.randomLocks[key]}}}};
 });
 const randomSelect=(props,key)=>mode==='portrait'?h(Select,props):h('div',{class:'scene-choice',key:props.key||key},
  h(Select,props),h('div',{class:'scene-choice-actions'},
   h('button',{type:'button',id:'random-'+props.id,disabled:!R.canRandomize(scene,mode,key),
    'aria-label':W('prompt.scene.random.field',{label:props.label}),onClick:()=>randomScene(key)},W('prompt.scene.random.short')),
   h('button',{type:'button',id:'lock-'+props.id,'aria-pressed':!!scene.randomLocks[key],
    'aria-label':W(scene.randomLocks[key]?'prompt.scene.unlock.field':'prompt.scene.lock.field',{label:props.label}),
    onClick:()=>toggleSceneLock(key)},W(scene.randomLocks[key]?'prompt.scene.locked':'prompt.scene.lock'))));
 const sceneSelect=(id,key,options,label,description)=>randomSelect({id,label:W('prompt.'+(label||key)),value:scene[key],
  description:description||W('prompt.help.'+(label||key)),options,onChange:v=>setScene(key,v)},key);
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
   h(StyleSample,{key:st.style,style:st.style}),
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
    description:W(mode==='casual'?'prompt.help.motifs':'prompt.help.motifs.auto'),
    placeholder:W('prompt.motifs.ph'),onChange:v=>update('motifs',v)})),
  mode==='portrait'&&!reference&&h('section',{class:'studio-card',id:'feature-insets'},
   h('div',{class:'studio-actions'},h('h2',{class:'studio-title'},W('prompt.insets.title')),
    h('button',{type:'button',id:'feature-insets-reset',onClick:()=>update('featureInsets',{})},W('prompt.insets.reset'))),
   note(W('prompt.insets.note')),
   appearance&&h('p',{id:'source-appearance-summary',class:'studio-note'},
    P.sourceFeatures({sourceAppearance:appearance}).join(' · '),' ',
    h('a',{href:appearance.source,target:'_blank',rel:'noreferrer'},W('prompt.appearance.source')),' · ',
    h('a',{href:'https://creativecommons.org/licenses/by-nc-sa/2.5/',target:'_blank',rel:'noreferrer'},W('prompt.appearance.license'))),
   h(Select,{id:'head-feature',label:W('prompt.head'),description:W('prompt.head.help'),
    value:headCustom?'__custom__':st.headFeature,options:headOptions,onChange:v=>update('headFeature',v)}),
   headCustom||st.headFeature==='__custom__'?h('div',{class:'custom-value'},h(Text,{id:'head-feature-custom',label:W('prompt.custom'),
    value:headCustom?st.headFeature:'',onChange:v=>update('headFeature',v||'__custom__')})):null,
   h('details',{id:'feature-insets-advanced'},h('summary',null,W('prompt.insets.advanced')),
   ['face','design','mount'].map(key=>h(Text,{key,id:'feature-inset-'+key,
    label:W('prompt.insets.'+key),description:W('prompt.insets.'+key+'.help'),
    value:st.featureInsets[key]||insetSuggestions[key],onChange:v=>setFeatureInset(key,v)})))),
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
  h('section',{class:'studio-card'},h('h2',{class:'studio-title'},W('prompt.scene.settings')),
   mode!=='portrait'&&h('div',null,
    h('button',{type:'button',id:'random-scene',disabled:!Object.keys(R.fields(scene,mode)).some(k=>R.canRandomize(scene,mode,k)),
     onClick:()=>randomScene(null)},W('prompt.scene.random.all')),note(W('prompt.scene.random.help'))),
   sceneSelect('expression','expr',S.EXPRESSION_OPTIONS,'expression'),
   mode!=='portrait'&&h('div',null,
    mode==='casual'&&h('div',{class:'studio-grid-fields'},
     randomSelect({id:'category',label:W('prompt.category'),value:scene.cat,options:categoryOptions,
      description:S.CAT_KO[scene.cat],
      onChange:v=>set(s=>({...s,scenes:{...s.scenes,casual:{...s.scenes.casual,cat:v,ex:''}}}))},'cat'),
     sceneSelect('example','ex',examples,'example',S.EX_NOTE[scene.ex]||W(scene.ex==='__custom__'?'prompt.help.example.custom':'prompt.help.example')),
     scene.cat==='__custom__'&&h(Text,{id:'category-custom',label:W('prompt.custom'),
      description:W('prompt.help.category.custom'),value:scene.catCustom,onChange:v=>setScene('catCustom',v)}),
     scene.ex==='__custom__'&&h(Text,{id:'example-custom',label:W('prompt.custom'),
      description:W('prompt.help.example.custom'),value:scene.exCustom,onChange:v=>setScene('exCustom',v)})),
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
     sceneSelect('pose','pose',poses,'pose',poseDescription),
     sceneSelect('orientation','orient',S.ORIENTATION_OPTIONS,'orientation',S.ORIENTATION_GUIDES[scene.orient]?.[0]),
     sceneSelect('frame','frame',S.FRAME_OPTIONS,'frame',[W('prompt.help.frame'),S.FRAME_GUIDES[scene.frame]?.[0]].filter(Boolean).join('\n')),
     sceneSelect('lens','lens',S.LENS_OPTIONS,'lens',[W('prompt.help.lens'),S.LENS_GUIDES[scene.lens]?.[0]].filter(Boolean).join('\n')),
     sceneSelect('aspect','aspect',['2:3','3:2','1:1','9:16','16:9'].map(v=>[v,v])),
     h(Text,{id:'camera',label:W('prompt.camera'),value:scene.camera,
      description:W('prompt.help.camera'),onChange:v=>setScene('camera',v)})),
    ['scene','outfit','custom'].map(sceneText),
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
  [query,setQuery]=useState(''),[group,setGroup]=useState('');
 useEffect(()=>{
  let live=true;
  Promise.all(['card','group','img','source-appearance'].map(f=>fetch('data/'+f+'.json',{cache:'no-cache'}).then(r=>{
   if(!r.ok)throw new Error(f+': '+r.status);return r.json();
  }).catch(e=>{if(f==='source-appearance')return null;throw e}))).then(([cards,groups,images,appearance])=>{
   if(!live)return;
   const all=cards.cards.character,requested=new URLSearchParams(location.search).get('mech')||saved.last;
   setName(all.some(c=>c.name===requested)?requested:all[0].name);
   setData({cards:all,groups,images:images.img||{},appearance:appearance?.entries||{},appearanceFailed:!appearance});
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
    card&&h(Editor,{key:card.name,card,images:data.images,appearance:data.appearance[String(card.no)]}))));
}
render(h(App),document.getElementById('app'));
