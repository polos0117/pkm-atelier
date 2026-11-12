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
  const {theme}=useAppearance(),W=window.W;
  /* 문양·제목은 연구소(index.html)로 가는 링크 — 덮개 화면에서는 항해의 '연구소' 탭이 숨고 이것이 집으로 가는 길이다 */
  return h('div',{class:'workspace-heading'},
    h('a',{class:'workspace-title',href:'index.html','aria-label':W('nav.index')},h(Crest),
      h('div',null,h('h1',null,title),h('p',null,subtitle))),
    h(LabStatus));
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
export function WorkspaceHeader({page}) {
  const W=window.W;
  const [folded,setFolded]=useState(readFold);
  const toggle=()=>setFolded(v=>{ writeFold(!v); return !v; });
  const title={index:'app.title',dex:'dex.title',prompt:'prompt.title',battle:'battle.title',run:'run.title',lane:'lane.title',gwent:'gwent.title',survey:'survey.title'}[page];
  return h('div',{class:'workspace-header'+(folded?' folded':'')},
    h('a',{class:'skip-link',href:'#content',onClick:skipToContent},W('ui.skip')),
    h(WorkspaceHeading,{title:W(title),
      subtitle:W(page==='prompt'?'prompt.subtitle':page==='lane'?'lane.subtitle':page==='gwent'?'gwent.subtitle':'app.subtitle')}),
    h('div',{class:'workspace-nav-row'},
      h('nav',{class:'workspace-nav','aria-label':W('ui.nav')},['index','dex','prompt','battle','run','lane','gwent','survey'].map(key=>
        h('a',{key,href:key+'.html','aria-current':key===page?'page':undefined},
          W('nav.'+key)))),
      h(AppearanceControls,null,
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
