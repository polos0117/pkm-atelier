/* Real Preact casual controls, without a browser/network dependency.
   NODE_PATH=<node_modules with jsdom and preact> node tests/prompt-casual-dom.cjs */
const assert=require('node:assert/strict');
const {open,pause,storeKey}=require('./prompt-dom-harness.cjs');
const fixture=JSON.stringify({last:'피카츄',cards:{
 '피카츄':{mode:'casual',identityMode:'reference',scenes:{casual:{cat:'occupation_basic',ex:'orbital_logistics',camera:'SAVED_CAMERA'}}},
 '이상해씨':{mode:'casual',identityMode:'reference'}
}});
(async()=>{
 let a=await open(fixture);
 try{
  const {get,set,click,output,w}=a;
  assert.equal(get('camera').value,'SAVED_CAMERA','legacy camera text was lost');
  assert(get('frame')&&get('lens'),'framing and lens menus are missing');
  assert.equal(get('frame').value,'');assert.equal(get('lens').value,'');
  assert.equal(get('example').value,'orbital_logistics','saved job selection was lost');
  assert.match(get('example').selectedOptions[0].textContent,/포켓몬 여행/);
  assert(output().includes('Pokémon travel-supply shopkeeper'));
  for(const id of ['motifs','expression','category','example','pose','orientation','frame','lens','aspect','camera','scene','outfit','custom']){
   assert(get(id+'-description')?.textContent.trim(),id+' needs a description');
   assert.equal(get(id).getAttribute('aria-describedby'),id+'-description');
   assert.equal(get(id).getAttribute('aria-labelledby'),id+'-label');
  }
  for(const cat of ['partner_care','travel_exploration','food_berries','festivals_contests','hobbies_leisure']){
   await set('category',cat);
   assert.equal(get('example').value,'','category must reset previous scene');
   assert.equal(get('category-description').textContent,w.AtelierSpec.CAT_KO[cat]);
   const value=w.AtelierSpec.EXAMPLE_MAP[cat][1][0];await set('example',value);
   assert.equal(get('example-description').textContent,w.AtelierSpec.EX_NOTE[value]);
   assert(output().includes(w.AtelierLifestyle.exampleText(cat,value)));
  }
  await set('category','__custom__');await set('category-custom','CUSTOM_CATEGORY');
  await set('example','__custom__');await set('example-custom','CUSTOM_EXAMPLE');
  assert(output().includes('CUSTOM_CATEGORY')&&output().includes('CUSTOM_EXAMPLE'));
  await set('category','partner_care');await set('example','care_feeding');
  await set('pose','offering_food');await set('frame','waist_up');await set('lens','wide24');
  const action=w.AtelierSpec.ADVANCED_OPTIONS.action_level.find(v=>v!=='AUTO');
  await set('axis-action_level',action);
  assert(output().includes('action_level: '+action));
  const expected=[w.AtelierSpec.POSE_GUIDES.offering_food[1],w.AtelierSpec.FRAME_GUIDES.waist_up[1],w.AtelierSpec.LENS_GUIDES.wide24[1]];
  for(const v of expected)assert(output().includes(v),v);
  assert(get('frame-description').textContent.includes(w.W('prompt.help.frame')));
  assert(get('frame-description').textContent.includes(w.AtelierSpec.FRAME_GUIDES.waist_up[0]));
  assert(get('lens-description').textContent.includes(w.W('prompt.help.lens')));
  assert(get('lens-description').textContent.includes(w.AtelierSpec.LENS_GUIDES.wide24[0]));
  for(const [value] of w.AtelierSpec.LENS_OPTIONS){
   await set('lens',value);
   const description=get('lens-description').textContent;
   assert(description.includes(w.W('prompt.help.lens')),'lens explanation must stay visible');
   if(value)assert(description.includes(w.AtelierSpec.LENS_GUIDES[value][0]));
  }
  await set('lens','wide24');
  for(const axis of w.AtelierSpec.LOCAL_AXES)assert(get('axis-'+axis+'-description').textContent.trim());
  await click('mode-portrait');assert(!get('frame')&&!get('lens'));
  for(const v of expected)assert(!output().includes(v),'casual choice leaked to portrait');
  await click('mode-action');assert.equal(get('frame').value,'');assert.equal(get('camera').value,'');
  await click('mode-casual');assert.equal(get('frame').value,'waist_up');
  await set('source','이상해씨');assert.equal(get('frame').value,'');
  await set('source','피카츄');assert.equal(get('lens').value,'wide24');
  // Effects persist state asynchronously; wait for the actual storage condition.
  for(let n=0;n<40&&JSON.parse(w.localStorage.getItem(storeKey)).last!=='피카츄';n++)await pause();
  const saved=w.localStorage.getItem(storeKey);
  assert.deepEqual(Array.from(w.AtelierWords.missing()),[]);assert.deepEqual(a.errors,[]);
  a.dom.window.close();a=await open(saved);
  for(const [id,value] of [['category','partner_care'],['example','care_feeding'],['pose','offering_food'],['frame','waist_up'],['lens','wide24'],['camera','SAVED_CAMERA']])
   assert.equal(a.get(id).value,value,'restore '+id);
  assert.deepEqual(a.errors,[]);
  console.log('PASS casual DOM: descriptions, choices, custom text, old saved jobs, camera, mode/card isolation and restored settings');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
