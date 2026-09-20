/* Run the actual dex.html module with Preact and HTM; no external CDN required. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM,VirtualConsole}=require('jsdom'),fixture=require('./dex-filter-fixture.cjs');
const pause=()=>new Promise(r=>setTimeout(r,25));
const read=f=>fs.readFileSync(f,'utf8');
async function open(saved='',blocked=false){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));
 const dom=new JSDOM('<body class="dex-page"><div id="app"></div></body>',{url:'https://dex.test/dex.html',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
 const w=dom.window;
 if(saved)w.localStorage.setItem('pkm_dex_filters_v1',saved);
 if(blocked){w.Storage.prototype.getItem=()=>{throw Error('blocked')};w.Storage.prototype.setItem=()=>{throw Error('blocked')}}
 const data={'card':{cards:{character:fixture.cards},forms:fixture.defs},style:{styles:fixture.styles},img:{img:fixture.img},group:fixture.group,label:fixture.label};
 w.fetch=async url=>({ok:true,json:async()=>data[String(url).match(/data\/(\w+)\.json/)[1]]});
 const preact=path.dirname(require.resolve('preact/package.json'));
 w.eval(read(preact+'/dist/preact.umd.js'));w.eval(read(preact+'/hooks/dist/hooks.umd.js'));
 w.eval(read(path.dirname(require.resolve('htm'))+'/htm.umd.js'));
 for(const f of ['workspace-theme','words','img','dex-filter'])w.eval(read('lib/'+f+'.js'));
 const imports='const {h,render,Fragment}=window.preact; const {useState,useEffect,useMemo}=window.preactHooks; const htm=window.htm;';
 const strip=s=>s.replace(/^import .*;\n/gm,'').replace(/^export /gm,'');
 w.eval('(function(){'+imports+strip(read('lib/workspace-ui.js'))+'window.TestHeader=WorkspaceHeader;})();');
 const src=read('dex.html').match(/<script type="module">([\s\S]*?)<\/script>/)[1];
 w.AtelierFresh={watch(){}};
 w.eval('(function(){'+imports+'const WorkspaceHeader=window.TestHeader;'+strip(src)+'})();');
 const get=s=>w.document.querySelector(s);
 for(let i=0;i<60&&!get('#dex-style');i++)await pause();
 assert(get('#dex-style'),'catalog did not render');
 const set=async(s,v)=>{const e=get(s);assert(e,s);e.value=v;e.dispatchEvent(new w.Event(e.tagName==='SELECT'?'change':'input',{bubbles:true}));await pause()};
 const click=async s=>{const e=get(s);assert(e,s);e.click();await pause()};
 return {dom,w,get,set,click,errors,rows:()=>Array.from(w.document.querySelectorAll('.grid>.cell'))};
}
(async()=>{
 let a=await open();
 try{
  assert.equal(a.rows().length,4);
  await a.set('#dex-type','flying');assert.equal(a.rows().length,1);
  await a.set('#dex-gen','2');assert.equal(a.rows().length,0);assert(a.get('.empty'));
  await a.click('#dex-reset');
  await a.set('#dex-style','game_keyart');await a.set('#dex-cut','portrait');await a.set('#dex-form','heavy');
  assert.equal(a.rows().length,1);assert(a.rows()[0].querySelector('img').src.endsWith('a-heavy.webp'));
  await a.click('.grid>.cell');assert(a.get('.big img').src.endsWith('a-heavy.webp'));
  await a.click('.fcell[data-form="light"]');assert(a.get('.big img').src.endsWith('a-light.webp'));
  await a.click('.back');assert.equal(a.get('#dex-form').value,'heavy');assert.equal(a.get('#dex-style').value,'game_keyart');
  await a.set('#dex-cut','action');assert.equal(a.rows().length,2);
  await a.click('.grid>.cell:nth-child(2)');assert(a.get('.big img').src.endsWith('a-heavy-act2.webp'));
  await a.click('.back');await a.set('#dex-cut','casual');
  assert(a.get('#dex-form').disabled);assert.equal(a.get('#dex-form').value,'');assert.equal(a.rows().length,3);
  await a.set('#dex-style','glossy_promo');assert.equal(a.rows().length,1);
  await a.click('.grid>.cell');assert(a.get('.big img').src.endsWith('a-gloss-casual.webp'));
  assert.equal(a.get('.sw .on').textContent,'Glossy');
  await a.click('.back');await a.set('#dex-cut','base');assert.equal(a.rows().length,0);
  await a.set('#dex-style','');assert.equal(a.rows().length,2);
  await a.click('.grid>.cell:nth-child(2)');assert(a.get('.big img').src.endsWith('d-legacy.webp'));
  await a.click('.back');await a.set('#dex-cut','portrait');await a.set('#dex-form','overdrive');
  await a.click('.grid>.cell');assert(a.get('.big img').src.endsWith('b-old-od.webp'));
  await a.click('.back');await a.click('#dex-reset');await a.set('.search-row input','#0001');assert.equal(a.rows().length,1);
  await a.set('#dex-cut','extra');assert.equal(a.rows().length,1);
  await a.click('.grid>.cell');assert(a.get('.big img').src.endsWith('a-extra.webp'));
  await a.click('.back');await pause();
  const saved=a.w.localStorage.getItem('pkm_dex_filters_v1');
  assert.deepEqual(a.errors,[]);assert.deepEqual(Array.from(a.w.AtelierWords.missing()),[]);
  a.dom.window.close();a=await open(saved);
  assert.equal(a.get('#dex-cut').value,'extra');assert.equal(a.get('.search-row input').value,'#0001');assert.equal(a.rows().length,1);
  await a.click('#dex-reset');assert.equal(a.rows().length,4);
  assert.deepEqual(a.errors,[]);a.dom.window.close();a=await open('{broken');assert.equal(a.rows().length,4);
  a.dom.window.close();a=await open('',true);await a.set('#dex-type','water');assert.equal(a.rows().length,2);assert.deepEqual(a.errors,[]);
  console.log('PASS dex DOM: filters, counts, exact selected image/style/form, all cut types, back navigation, restore/reset and blocked storage');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
