/* Use the actual Preact editor controls; capture, do not reconstruct its prompt.
   NODE_PATH=/path/to/node_modules node tools/capture-appearance-example.cjs */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {open,storeKey}=require('../tests/prompt-dom-harness.cjs');
const root=path.resolve(__dirname,'..');
(async()=>{
 const a=await open(JSON.stringify({last:'꼬부기',cards:{}}));
 try{
  await a.set('source','꼬부기');
  await a.click('mode-portrait');
  await a.set('identity-mode','create');
  await a.set('form','light');
  await a.set('style','glossy_promo');
  const params={'apparent age':'20s','hair color':'blue','hairstyle':'wolf cut',
   'hair length':'medium','eye color':'pink','jaw & chin':'soft rounded jaw'};
  for(const [k,v]of Object.entries(params))await a.set('param-'+k.replace(/\W/g,'-'),v);
  assert.equal(a.get('motifs').value,'');
  assert.deepEqual(a.errors,[]);
  const prompt=a.output();
  assert(prompt.includes('brown dorsal shell with white rim'));
  assert(prompt.includes('pale-yellow belly shell'));
  assert(prompt.includes('inward-curled long tail'));
  const data=JSON.parse(fs.readFileSync(path.join(root,'data/source-appearance.json'))).entries['7'];
  const designRecord='[RESOLVED DESIGN RECORD — provisional, not text on canvas]\n'+
   'Source: Squirtle; the three automatic source targets are resolved below before rendering. '+
   'One water-type defense mechanism links a compact dorsal reservoir with a ventral protective plastron. '+
   'A: brown segmented shell reservoir, white rim, centered on the thoracic spine with a visible two-point spinal cradle; dome faces rearward. '+
   'B: pale-yellow segmented chest plastron, mounted to the front torso harness, with thin cyan water-channel seams. '+
   'C: light-blue articulated tail curling inward, attached through its own sacral socket below the shell, projecting backward before curling. '+
   'The shell and tail have separate roots. All three components retain the same panels, colors, scale and attachment points across the front view, rear view and their dedicated insets. '+
   'Human skin remains human skin; source light blue is carried by hair and armor. '+
   'Light armor uses blue painted composite, pale-yellow ceramic plating, dark flexible fabric and small metallic joints. '+
   'Four right-column crops, top to bottom: selected human face; shell with spinal cradle; chest plastron; tail with sacral socket. '+
   'The rear view and tail crop show the root above the curl. Frame the distinct human face clearly. '+
   'A quiet clean aquatic maintenance hangar supports the three-column reference sheet. Produce exactly one image.\n';
  const dir=path.join(root,'docs/examples');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'squirtle-auto-generator.txt'),prompt+'\n');
  fs.writeFileSync(path.join(dir,'squirtle-auto-submitted.txt'),prompt+'\n\n'+designRecord);
  fs.writeFileSync(path.join(dir,'squirtle-auto-settings.json'),JSON.stringify({
   note:'Actual Preact UI capture. Empty motifs/inset overrides. Submitted prompt appends the required AI design prepass; it is not user data or an approved identity anchor.',
   sourceNo:7,sourceRevision:data.revision,settings:JSON.parse(a.w.localStorage.getItem(storeKey)),
   generatorWords:prompt.split(/\s+/).length,generatorCharacters:prompt.length,
   submittedWords:(prompt+'\n'+designRecord).split(/\s+/).length
  },null,2)+'\n');
  console.log('Captured actual editor output:',prompt.length,'characters;',prompt.split(/\s+/).length,'words.');
 }finally{a.dom.window.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
