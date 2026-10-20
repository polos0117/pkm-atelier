const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('lib/workspace-theme.js','utf8');
const css=fs.readFileSync('lib/workspace.css','utf8'),ui=fs.readFileSync('lib/workspace-ui.js','utf8');
const stored=new Map(),events=new Map(),viewportEvents=new Map(),properties=new Map(),frames=[];
const meta={content:''},root={dataset:{},style:{setProperty:(k,v)=>properties.set(k,v)}};
const window={innerHeight:800,visualViewport:{height:704,addEventListener:(k,v)=>viewportEvents.set(k,v)},
 addEventListener:(k,v)=>events.set(k,v),dispatchEvent(){}};
vm.runInNewContext(source,{window,document:{documentElement:root,querySelector:()=>meta},
 localStorage:{getItem:k=>stored.get(k)||null,setItem:(k,v)=>stored.set(k,v)},
 requestAnimationFrame:fn=>{frames.push(fn);return frames.length},cancelAnimationFrame(){},Event:function(){}});
while(frames.length)frames.shift()();
assert.equal(root.dataset.theme,'daylight','new visitors start in the Pokemon laboratory');
assert.equal(properties.get('--atelier-vh'),'704px');
const themes=['midnight','daylight','blossom','moss','plum','sand','deep','ember'];
assert.deepEqual(Array.from(window.AtelierAppearance.themes),themes,'saved theme keys stay stable');
for(const key of themes){
 window.AtelierAppearance.set('theme',key);
 assert.equal(root.dataset.theme,key);
 assert.equal(stored.get('atelier_theme_v1'),key);
 const block=css.match(new RegExp(':root\\[data-theme="'+key+'"\\][^{]*\\{([^}]+)\\}'));
 assert(block,key+' palette');
 assert.equal(meta.content,block[1].match(/--deck:(#[0-9a-f]{6})/)[1],key+' browser chrome');
 assert(ui.includes("W('theme.' +"),'theme names must come from words');
 assert(css.includes('[data-theme-preview="'+key+'"]'),key+' palette preview');
}
window.AtelierAppearance.set('theme','unknown');
assert.equal(root.dataset.theme,'daylight');
window.AtelierAppearance.set('density','relaxed');
assert.equal(root.dataset.density,'relaxed');
window.AtelierAppearance.set('density','unknown');
assert.equal(root.dataset.density,'compact');
stored.set('atelier_theme_v1','plum');events.get('storage')({key:'atelier_theme_v1'});
assert.equal(root.dataset.theme,'plum','cross-tab preference survives');
const marks=ui.slice(ui.indexOf('const CREST_MARK'),ui.indexOf('const MARK_STYLE'));
const shapes=[...marks.matchAll(/  (\w+): \[([\s\S]*?)\n  \]/g)].map(m=>m[2]);
assert.equal(shapes.length,8);
assert.equal(new Set(shapes).size,8,'eight distinct motifs');
assert(!/#[0-9a-f]{3,6}/i.test(marks),'motifs inherit palette colors');
assert(!/지구연방|네오지온|소레스탈|철화단|모노아이|CREATIVE DECK/.test(ui));
assert(!css.includes("content:'DAYLIGHT"),'theme labels are not CSS content');
assert(ui.includes("W('lab.status')"),'the header carries the lab status line');
assert(!/workspace\.signature|app\.code|app\.brand|crest-signature|eyebrow/.test(ui),'decorative header layers stay gone');
assert(viewportEvents.has('resize'));assert(events.has('storage'));
/* 글꼴 — 한글 고딕 하나를 실제로 불러온다(못 받아도 화면은 OS 고딕으로 선다). 명조·자간 준 고정폭 한글은 없다 */
const pages=fs.readdirSync('.').filter(f=>f.endsWith('.html'));
assert(pages.length>=8);
for(const f of pages){
 const html=fs.readFileSync(f,'utf8');
 assert(html.includes('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'),f+' preconnect');
 const link=html.match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"([^>]*)>/);
 assert(link&&/family=Noto\+Sans\+KR/.test(link[1])&&/display=swap/.test(link[1]),f+' loads Noto Sans KR with display=swap');
 assert(/media="print" onload="this\.media='all'"/.test(link[2]),f+' font stylesheet never blocks first paint');
 assert(html.indexOf(link[0])<html.indexOf('lib/workspace.css'),f+' font link before the shell stylesheet');
}
assert(/--sans:'Noto Sans KR',/.test(css),'one Korean sans first in --sans');
assert(/body \{[^}]*font:[^;}]*var\(--sans\)/.test(css),'body uses --sans');
assert(!css.includes('Pretendard'),'no family that is never loaded');
const sheets=[...pages,...fs.readdirSync('lib').filter(f=>f.endsWith('.css')).map(f=>'lib/'+f)];
for(const f of sheets){
 const text=fs.readFileSync(f,'utf8');
 assert(!/Serif KR|Myungjo|Batang|gallery-serif/.test(text),f+' has no borrowed serif');
 for(const m of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)){
  if(!/font:[^;}]*var\(--sans\)/.test(m[2]))continue;
  assert(!/letter-spacing:\s*\.\d/.test(m[2]),f+' '+m[1].trim().split('\n').pop()+' — 한글 글자 칸에 자간');
 }
 if(f!=='lib/prompt.css')assert(!/ui-monospace,monospace/.test(text.replace(/--num:[^;]+;/,'')),f+' monospace only through --num');
}
console.log('PASS: 8 Pokemon themes, persistent keys, palette previews, browser chrome, viewport sizing and one loaded Korean sans');
