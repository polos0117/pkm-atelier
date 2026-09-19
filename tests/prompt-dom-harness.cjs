/* DOM harness for the real Preact prompt editor. Requires jsdom and preact. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const storeKey='pkm_prompt_v2';
const pause=()=>new Promise(resolve=>setTimeout(resolve,25));
async function open(store){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<!doctype html><html><head></head><body class="prompt-page"><div class="wrap"><div id="app"></div></div></body></html>',{
  url:'https://prompt.test/prompt.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc
 });
 const w=dom.window;w.localStorage.setItem(storeKey,store);
 w.fetch=async url=>({ok:true,json:async()=>JSON.parse(read(url))});
 const preact=path.dirname(require.resolve('preact/package.json'));
 w.eval(fs.readFileSync(path.join(preact,'dist/preact.umd.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(preact,'hooks/dist/hooks.umd.js'),'utf8'));
 for(const f of ['workspace-theme','words','img','prompt-spec','figures','prompt-anthro','prompt-lifestyle','prompt-random'])w.eval(read('lib/'+f+'.js'));
 const imports='const {h,render}=window.preact; const {useState,useEffect,useLayoutEffect,useMemo,useRef}=window.preactHooks;';
 const strip=s=>s.replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
 w.eval('(function(){'+imports+strip(read('lib/workspace-ui.js'))+'window.TestHeader=WorkspaceHeader;})();');
 w.eval('(function(){'+imports+'const WorkspaceHeader=window.TestHeader;'+strip(read('lib/prompt-ui.js'))+'})();');
 const get=id=>w.document.getElementById(id);
 for(let n=0;n<80&&!get('prompt-output');n++)await pause();
 assert(get('prompt-output'),'screen did not render');
 const set=async(id,value)=>{
  const e=get(id);assert(e,'missing control '+id);e.value=value;
  e.dispatchEvent(new w.Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));await pause();
 };
 const click=async id=>{get(id).click();await pause()};
 const output=()=>get('prompt-output').value;
 return {dom,w,get,set,click,output,errors};
}
module.exports={open,pause,storeKey};
