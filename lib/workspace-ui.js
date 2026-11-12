import { h } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useRef } from 'https://esm.sh/preact@10.24.3/hooks';

/* Appearance is shared between pages; generation settings are independent. */
function useAppearance() {
  const [appearance, setAppearance] = useState(() => window.AtelierAppearance.get());
  useEffect(() => {
    const sync = () => setAppearance(window.AtelierAppearance.get());
    addEventListener('atelier-appearance', sync);
    sync();
    return () => removeEventListener('atelier-appearance', sync);
  }, []);
  return appearance;
}
/* 설정 — 메뉴 줄의 ⚙ 하나. 누르면 테마·화면 밀도가 같은 폭 두 칸으로 펼쳐지고, 아랫줄에 머리 조작이 붙는다.
   바깥을 누르거나 Esc 면 닫힌다. 펼침은 저장하지 않는다 */
export function AppearanceControls({children}) {
  const appearance = useAppearance(), W = window.W;
  const [open, setOpen] = useState(false), ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const away = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const esc = e => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('pointerdown', away); addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', away); removeEventListener('keydown', esc); };
  }, [open]);
  return h('div', {class:'appearance-controls' + (open ? ' open' : ''), ref},
    h('button', {type:'button', class:'appearance-toggle', 'aria-expanded':open, 'aria-label':W('ui.settings'), title:W('ui.settings'),
      onClick:() => setOpen(v => !v)}, h('span', {class:'theme-dot', 'aria-hidden':'true'}), h('span', {'aria-hidden':'true'}, '\u2699')),
    open && h('div', {class:'appearance-panel', role:'group', 'aria-label':W('ui.settings')},
      h('label', null, W('ui.theme'),
        h('select', {'aria-label':W('ui.theme'), value:appearance.theme,
          onChange:e => window.AtelierAppearance.set('theme', e.target.value)},
          window.AtelierAppearance.themes.map(key => h('option', {key, value:key}, W('theme.' + key))))),
      h('label', null, W('ui.density'),
        h('select', {'aria-label':W('ui.density'), value:appearance.density,
          onChange:e => window.AtelierAppearance.set('density', e.target.value)},
          ['compact', 'relaxed'].map(key => h('option', {key, value:key}, W('ui.density.' + key))))),
      children && h('div', {class:'appearance-extra'}, children)));
}

/* 문장은 하나 — 몬스터볼(옛 daylight 모양). 지역마다의 모습은 머리 그림이 맡는다(2026-11-12). 색은 판의 변수를 따른다 */
const MARK_STYLE = {
  line:{stroke:'currentColor','stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'},
  primary:{fill:'var(--accent)'},
  surface:{fill:'var(--card)',stroke:'currentColor','stroke-width':2}
};
function Crest() {
  return h('svg',{class:'crest-mark',viewBox:'0 0 48 48',fill:'none','aria-hidden':'true'},[
    ['M6 24a18 18 0 0 1 36 0Z','primary'],
    ['M42 24a18 18 0 1 1-36 0 18 18 0 1 1 36 0Z','line'],
    ['M6 24h12m12 0h12','line'],
    ['M30 24a6 6 0 1 1-12 0 6 6 0 1 1 12 0Z','surface']
  ].map(([d,kind],i)=>h('path',{key:i,d,...MARK_STYLE[kind]})));
}
/* 연구소 상태줄 — 머리말 오른쪽의 실제 수치 한 줄: 등록한 종·그림 수(data/img.json), 이 테마의 진열 수(이 브라우저),
   마지막 패치 날짜(docs/PATCH.md 맨 앞 4KB). 못 읽은 값은 칸째 뺀다 */
function countFiles(x){
  if(typeof x==='string')return /\.webp$/i.test(x)?1:0;
  if(!x||typeof x!=='object')return 0;
  let n=0;for(const v of Array.isArray(x)?x:Object.values(x))n+=countFiles(v);return n;
}
function patchHead(){
  try{return fetch('docs/PATCH.md',{headers:{Range:'bytes=0-4095'}}).then(r=>r&&r.ok?r.text():'').catch(()=>'');}
  catch(e){return Promise.resolve('');}
}
function useLabStatus(){
  const [data,setData]=useState(null),[,tick]=useState(0);
  useEffect(()=>{
    let live=true;const IMG=window.AtelierImg;
    Promise.all([
      IMG&&IMG.load?Promise.resolve().then(()=>IMG.load()).catch(()=>null):Promise.resolve(null),
      patchHead()
    ]).then(([img,patch])=>{
      if(!live)return;const m=/(?:^|\n)## (\d{4}-\d{2}-\d{2})/.exec(patch);
      setData({species:img?Object.keys(img).length:null,images:img?countFiles(img):null,patch:m?m[1]:null});
    });
    const again=()=>tick(v=>v+1);
    for(const e of ['atelier-hall','atelier-appearance','storage'])addEventListener(e,again);
    return()=>{live=false;for(const e of ['atelier-hall','atelier-appearance','storage'])removeEventListener(e,again);};
  },[]);
  const IMG=window.AtelierImg,hall=IMG&&IMG.hallPicks?IMG.hallPicks().length:null;
  return {...(data||{}),hall,max:IMG&&IMG.HALL_MAX};
}
function LabStatus(){
  const W=window.W,s=useLabStatus(),fmt=n=>Number(n).toLocaleString('ko-KR');
  const rows=[
    s.species!=null&&['species',W('lab.status.species'),W('lab.status.species.value',{n:fmt(s.species)})],
    s.images!=null&&['images',W('lab.status.images'),W('lab.status.images.value',{n:fmt(s.images)})],
    s.hall!=null&&s.max&&['hall',W('lab.status.hall'),W('lab.status.hall.value',{n:s.hall,max:s.max})],
    s.patch&&['patch',W('lab.status.patch'),s.patch.slice(5).replace('-','.')],
  ].filter(Boolean);
  return h('dl',{class:'lab-status','aria-label':W('lab.status')},rows.map(([k,label,value])=>
    h('div',{key:k,'data-status':k},h('dt',null,label),h('dd',null,value))));
}
export function WorkspaceHeading({title,subtitle}) {
  const W=window.W;
  /* 문양·제목은 연구소(index.html)로 가는 링크 — 덮개 화면에서는 항해의 '연구소' 탭이 숨고 이것이 집으로 가는 길이다 */
  return h('div',{class:'workspace-heading'},
    h('a',{class:'workspace-title',href:'index.html','aria-label':W('nav.index')},h(Crest),
      h('div',null,h('h1',null,title),h('p',null,subtitle))),
    h(LabStatus));
}
/* 지역 그림 층 · 나무 표지판(시안 A, 2026-11-12). 그림은 그림 저장소 4 번 regions/ — new Image() 로 미리 받아 보고
   못 받으면(오프라인 · 저장소 지연) .no-art: 지역 색 바탕만 남고 풍경 단추는 숨는다. 접히면 그림 층도 접힌 머리 높이로(CSS).
   표지판을 누르면 여행 지도(onOpenMap — Task 6), 풍경 단추는 풍경만 보기(Task 5) */
function useArtFailed(url){
  const [failed,setFailed]=useState(null);
  useEffect(()=>{
    let live=true;const img=new Image();
    img.onerror=()=>{if(live)setFailed(url);};
    img.src=url;
    return()=>{live=false;img.onerror=null;};
  },[url]);
  return failed===url;
}
/* 풍경만 보기 — 층 `.scenery`(fixed · 그림 높이 100% · 폭 자연 · 가로 굴림). 열 때 pushState({scenery:1}), 뒤로 가기(popstate)가 닫는다 —
   Esc · 닫기 단추는 우리 기록이면 history.back() 으로 같은 길을 타서 기록이 남지 않는다. 머리 단추 · 그림 빈 곳 · ⚙ 안 단추가
   'atelier-scenery' 사건으로 연다(셋이 한 상태를 본다). 움직임 줄이기면 html.scenery-still — 흐려지기 없이 바로 */
function motionOn(){const M=window.AtelierMotion;return M&&M.enabled?M.enabled():!matchMedia('(prefers-reduced-motion: reduce)').matches;}
function openScenery(){dispatchEvent(new Event('atelier-scenery'));}
function Scenery({region}){
  const W=window.W,[open,setOpen]=useState(false),ref=useRef(null),opener=useRef(null),isOpen=useRef(false),closing=useRef(false);
  isOpen.current=open;
  /* 닫을 때 한 번만 back() — popstate 는 비동기라 두 번 누르면 앞 화면으로 나간다(closing). 열려 있지 않은데 남은 {scenery:1} 은 무시 */
  const back=()=>{if(!isOpen.current||closing.current||!(history.state&&history.state.scenery))return;closing.current=true;history.back();};
  useEffect(()=>{
    if(history.state&&history.state.scenery)history.replaceState(null,'');   /* 새로고침으로 남은 낡은 기록 */
    const show=()=>{
      opener.current=document.activeElement;closing.current=false;
      if(!(history.state&&history.state.scenery))history.pushState({scenery:1},'');   /* 뒤로 · 앞으로로 남은 기록이면 다시 쌓지 않는다 */
      setOpen(true);
    };
    const pop=()=>{closing.current=false;setOpen(false);},esc=e=>{if(e.key==='Escape')back();};
    addEventListener('atelier-scenery',show);addEventListener('popstate',pop);addEventListener('keydown',esc);
    return()=>{removeEventListener('atelier-scenery',show);removeEventListener('popstate',pop);removeEventListener('keydown',esc);};
  },[]);
  const close=()=>{if(history.state&&history.state.scenery)back();else setOpen(false);};
  useEffect(()=>{
    if(!open)return;
    const root=document.documentElement;
    root.classList.add('scenery');root.classList.toggle('scenery-still',!motionOn());
    requestAnimationFrame(()=>ref.current&&ref.current.classList.add('in'));
    ref.current&&ref.current.querySelector('.scenery-close').focus({preventScroll:true});
    return()=>{root.classList.remove('scenery','scenery-still');
      const o=opener.current;opener.current=null;
      const t=o&&o.isConnected&&o!==document.body?o:o&&o.classList.contains('scenery-open')?document.querySelector('.appearance-toggle'):null;   /* ⚙ 안 단추는 판이 닫혔을 수 있다 */
      if(t)t.focus({preventScroll:true});};
  },[open]);
  if(!open)return null;
  /* 처음엔 지역의 pos 자리로 굴려 둔다 — 첫 값(가로 %)을 넘치는 폭에 비례해 */
  const place=e=>{const sc=e.currentTarget.parentNode,pos=(innerWidth>=600?region.posWide:region.pos)||'50%',p=parseFloat(pos)||50;
    sc.scrollLeft=(sc.scrollWidth-sc.clientWidth)*p/100;};
  return h('div',{class:'scenery',ref,role:'dialog','aria-label':W('region.scenery'),onClick:e=>{if(e.target.closest('.scenery-close')||e.target.tagName==='IMG')close();}},
    h('img',{src:region.art,alt:'',draggable:false,onLoad:place}),
    h('button',{type:'button',class:'scenery-close','aria-label':W('region.scenery.close'),title:W('region.scenery.close')},'✕'));
}
function SceneryOpen(){
  const {theme}=useAppearance(),W=window.W,noArt=useArtFailed(window.AtelierAppearance.regions[theme].art);
  return !noArt&&h('button',{type:'button',class:'scenery-open',onClick:openScenery},W('region.scenery'));
}
function RegionHead({onOpenMap}){
  const {theme}=useAppearance(),W=window.W,region=window.AtelierAppearance.regions[theme];
  const noArt=useArtFailed(region.art);
  return [
    h('div',{key:'hero',class:'region-hero'+(noArt?' no-art':''),'data-region':theme,'aria-hidden':'true',
      style:{'--region-art':`url("${region.art}")`,'--region-pos':region.pos,'--region-pos-wide':region.posWide}}),
    h('div',{key:'sign',class:'region-sign-row'},
      h('button',{type:'button',class:'region-sign',onClick:onOpenMap},h('span',null,W('region.sign',{name:W('theme.'+theme)}))),
      h('button',{type:'button',class:'scenery-toggle',hidden:noArt,'aria-label':W('region.scenery'),title:W('region.scenery'),onClick:openScenery},
        h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor','stroke-width':2,'stroke-linejoin':'round','aria-hidden':'true'},
          h('rect',{x:3,y:5,width:18,height:14,rx:2}),h('path',{d:'M3 16l5-5 4 4 3-3 6 6'})))),
    h(Scenery,{key:'scenery',region})
  ];
}
/* The header folds: the title block hides, the navigation row (with its settings button) stays.
   The choice is a per-viewer convenience kept in this browser only — it can be missing or blocked. */
const FOLD_KEY='pkm_header_fold';
function readFold(){ try { return localStorage.getItem(FOLD_KEY)==='1'; } catch(e){ return false; } }
function writeFold(v){ try { if(v) localStorage.setItem(FOLD_KEY,'1'); else localStorage.removeItem(FOLD_KEY); } catch(e){} }
/* 본문 건너뛰기 — 화면마다 머리 바로 다음 자리가 본문이다(도감은 검색 줄, 집은 캡슐 진열…).
   그 자리에 초점을 옮기고 보이게 한다. 주소의 #content 는 남기지 않는다 */
function skipToContent(e){
  const head=e.currentTarget.closest('.workspace-header'),next=head&&head.nextElementSibling;
  if(!next)return;
  e.preventDefault();
  if(!next.hasAttribute('tabindex'))next.setAttribute('tabindex','-1');
  next.focus({preventScroll:true});next.scrollIntoView({block:'nearest'});
}
/* Every page uses the same header markup and navigation order. */
export function WorkspaceHeader({page,onOpenMap}) {
  const W=window.W;
  const [folded,setFolded]=useState(readFold);
  const toggle=()=>setFolded(v=>{ writeFold(!v); return !v; });
  const title={index:'app.title',dex:'dex.title',prompt:'prompt.title',battle:'battle.title',run:'run.title',lane:'lane.title',gwent:'gwent.title',survey:'survey.title'}[page];
  /* 머리 상자의 빈 곳(자식이 덮지 않은 자리 — 뒤에 그림이 비친다)을 누르면 풍경만 보기. 그림 층 자체는 z-index:-1 이라 눌리지 않는다 */
  const tapArt=e=>{if(e.target===e.currentTarget&&!e.currentTarget.querySelector('.no-art'))openScenery();};
  return h('div',{class:'workspace-header'+(folded?' folded':''),onClick:tapArt},
    h('a',{class:'skip-link',href:'#content',onClick:skipToContent},W('ui.skip')),
    h(RegionHead,{onOpenMap}),
    h(WorkspaceHeading,{title:W(title),
      subtitle:W(page==='prompt'?'prompt.subtitle':page==='lane'?'lane.subtitle':page==='gwent'?'gwent.subtitle':'app.subtitle')}),
    h('div',{class:'workspace-nav-row'},
      h('nav',{class:'workspace-nav','aria-label':W('ui.nav')},['index','dex','prompt','battle','run','lane','gwent','survey'].map(key=>
        h('a',{key,href:key+'.html','aria-current':key===page?'page':undefined},
          W('nav.'+key)))),
      h(AppearanceControls,null,
        h(SceneryOpen),
        h('button',{type:'button',class:'header-fold','aria-expanded':!folded,
          'aria-label':W(folded?'ui.header.unfold':'ui.header.fold'),title:W(folded?'ui.header.unfold':'ui.header.fold'),onClick:toggle},
          W(folded?'ui.header.unfold':'ui.header.fold.short')))));
}
export function ThemeGallery() {
  const {theme}=useAppearance(),W=window.W;
  return h('section',{'aria-label':W('home.themes')},
    h('div',{class:'theme-gallery-head'},h('h2',null,W('home.themes')),h('p',null,W('home.themes.note'))),
    h('div',{class:'theme-gallery'},window.AtelierAppearance.themes.map(key=>
      h('button',{key,type:'button',class:'theme-card','data-theme-preview':key,
        'aria-pressed':theme===key,onClick:()=>window.AtelierAppearance.set('theme',key)},
        h(Crest),h('span',{class:'theme-swatches','aria-hidden':'true'},h('i'),h('i'),h('i')),
        h('strong',null,W('theme.' + key)),h('small',null,W('theme.note.'+key)),
        theme===key&&h('span',{class:'theme-selected','aria-hidden':'true'},'✓')))));
}
