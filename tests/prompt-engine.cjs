/* Prompt contracts: identity authority, form transitions, and mode isolation. */
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const ctx={window:{},console}; vm.createContext(ctx);
for(const f of ['prompt-spec','figures','toolkit','prompt-anthro','prompt-lifestyle'])
  vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const {AtelierSpec:S,AtelierPrompt:P,AtelierLifestyle:L,AtelierFigures:F}=ctx.window;
assert.equal(typeof P.buildPrompt,'function');
assert(S.ART_STYLES.every(r=>r.length===3)); assert.equal(S.ART_STYLES.length,14);
assert(S.STYLE_PROFILES.bright_catalog);
assert(S.STYLE_PROFILES.glossy_promo);
assert(S.STYLE_PROFILES.glossy_promo.core.includes('TEXT AND GRAPHIC OVERLAYS'));
assert(S.STYLE_PROFILES.glossy_promo.core.includes('no typography'));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart);
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.core.includes('illustrated hybrid'));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.core.includes('illustration-first'));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.core.includes('crisp readable midground'));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.core.includes("selected hairstyle's exact length"));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.anthro.includes('Detail density is a rendering treatment'));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.anthro.includes('not permission to redesign'));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.anthro.includes("not from changing the reference character's hairstyle"));
assert(S.STYLE_PROFILES.mecha_cinematic_keyart.core.includes('no typography'));
assert.equal(JSON.stringify(Object.keys(S.ACTION_STYLE_CORES).sort()),JSON.stringify(Array.from(S.ART_STYLES,r=>r[0]).sort()));
assert(Object.values(S).every(x=>typeof x!=='function'));
const base={mech:'Pikachu',style:S.DEFAULT_STYLE,outputMode:'portrait',identityMode:'create',
 form:'light',params:[['body type','athletic'],['eye color','amber'],['second eye color','blue']]};
// The common approved-sheet -> action path stays concise and uses only relevant mount modules.
const shortAction=P.buildPrompt({...base,mech:'Squirtle',sourceName:'Squirtle',identityMode:'reference',outputMode:'action',form:'heavy',
 motifs:'hexagonal segmented carapace, curled spiral tail and water-jet nozzles'});
const shortWords=shortAction.trim().split(/\s+/).length;
const shortNegatives=(shortAction.match(/\b(?:no|not|never|without|avoid|do not|must not|cannot)\b/gi)||[]).length;
assert(shortWords<800,'reference action prompt grew beyond its compact budget: '+shortWords);
assert((shortAction.match(/^\[/gm)||[]).length<=10,'too many compact action blocks');
assert(shortNegatives<=12,'compact action accumulated prohibitions: '+shortNegatives);
for(const legacy of ['MOUNT LOCK','OCCLUSION LOCK','CORRECTION PRIORITY','FAIL CONDITIONS']) assert(!shortAction.includes(legacy));
assert(shortAction.includes('SHELL:')&&shortAction.includes('TAIL:'));
const rearAction=P.buildPrompt({...base,mech:'Bulbasaur',identityMode:'reference',outputMode:'action'});
assert(rearAction.includes('REAR UNIT:')&&!rearAction.includes('SHELL:')&&!rearAction.includes('TAIL:'));
const plainAction=P.buildPrompt({...base,identityMode:'reference',outputMode:'action'});
assert(!plainAction.includes('REAR UNIT:')&&!plainAction.includes('SHELL:')&&!plainAction.includes('TAIL:'));
// Source engineering is separate from rendering and from continuation identity.
for(const identityMode of ['create','reference']) for(const outputMode of ['portrait','action','casual']) {
 for(const form of ['light','heavy','mobility','overdrive']) {
  const t=P.buildPrompt({...base,mech:'Squirtle',identityMode,outputMode,form,baseForm:'heavy'});
  const compact=identityMode==='reference'&&outputMode==='action';
  if(compact){
   assert(!t.includes('BODY-SPACE MOUNT LOCK:')&&!t.includes('MOUNT CORRECTION PRIORITY:'));
   assert(!t.includes('OCCLUSION LOCK:')&&!t.includes('FAIL CONDITIONS:'));
   assert(t.includes('SHELL:')&&t.includes('TAIL:'));
   assert(t.includes('natural occlusion'));
   continue;
  }
  const marker='BODY-SPACE MOUNT LOCK:';
  assert.equal(t.split(marker).length-1,outputMode==='casual'?0:1,'mount rule must occur once in armored modes only');
  assert.equal(t.includes('MOUNT CORRECTION PRIORITY:'),identityMode==='reference'&&outputMode!=='casual');
  if(outputMode!=='casual') {
   assert(t.includes('independent sacral root'));
   assert(t.includes('not a camera-facing disk'));
   assert(!t.includes('approved alternative mounting designs'));
   if(identityMode==='reference') {
    assert(t.includes('even when continuing the same form'));
    assert(t.includes('Image approval alone does not approve an ambiguous attachment'));
   }
   assert(!t.includes('If correct geometry would hide the tail completely, hide it completely.'));
   assert(t.includes('Do not delete, shrink or forcibly conceal signature equipment'));
   assert(t.includes('Natural lateral projection is allowed'));
   assert.equal(t.includes('COMPARISON BODY ANGLE: 25-35 degrees'),identityMode==='reference'&&outputMode==='portrait');
   assert(t.includes('Natural distal overlap beside a limb is not itself a mounting error.'));
   assert(t.includes('FAIL CONDITIONS:'));
   assert(!t.includes('Allocate visual mass'));
   if(identityMode==='reference'&&outputMode==='portrait') {
    assert(t.includes('Rotate torso, pelvis and mounted equipment together'));
    assert(t.includes('same turn direction and angle across light, heavy, mobility and overdrive'));
   }
   assert(t.includes('not relocate the main mounts'));
  }
 }
}
// Creative planning is restricted to new armored designs; insets only to sheets.
for(const mech of ['Squirtle','Bulbasaur','Mew'])
 for(const identityMode of ['create','reference'])
  for(const outputMode of ['portrait','action','casual'])
   for(const form of ['light','heavy','mobility','overdrive']) {
    const t=P.buildPrompt({...base,mech,identityMode,outputMode,form,baseForm:'heavy'});
    const armored=outputMode!=='casual';
    const compact=identityMode==='reference'&&outputMode==='action';
    assert.equal(t.includes('CREATIVE ENGINEERING PREPASS:'),armored&&identityMode==='create');
    assert.equal(t.includes('APPROVED-DESIGN CREATIVE LOCK:'),armored&&identityMode==='reference'&&!compact);
    assert.equal(t.includes('INSET FIDELITY LOCK:'),outputMode==='portrait'&&identityMode==='create');
    if(armored&&!compact) {
     assert(t.includes('Hidden or stowed does not mean absent'));
     assert(t.includes('core equipment and form-specific armor parts'));
     assert(!t.includes('For a source with a back bulb'));
     assert(!t.includes('hydro-pressure reactor'));
    }
    if(compact) assert(t.includes('approved sheet defines the core equipment'));
    if(armored&&identityMode==='create') {
     assert(t.includes('Optional is not absent by default'));
     assert(t.includes('Include the concise design record with the result'));
    }
   }
for (const style of S.ART_STYLES.map(r=>r[0])) {
 const fresh=P.buildPrompt({...base,style});
 assert(fresh.includes('SOURCE-TO-MECHANISM DESIGN:'));
 const designOrder=['[SOURCE IDENTITY]','[SOURCE ENGINEERING]','[CHARACTER IDENTITY]','[FORM DEFINITION]','[STYLE CORE]','[OUTPUT MODE]'].map(k=>fresh.indexOf(k));
 assert(designOrder.every((n,i)=>n>=0&&(!i||n>designOrder[i-1])));
 assert(fresh.includes('Start from a fresh design'));
 assert(fresh.includes('anatomically correct body-space mounts'));
 const continued=P.buildPrompt({...base,style,identityMode:'reference'});
 assert(continued.includes('Preserve the approved source-to-mechanism design'));
 assert(!continued.includes('Start from a fresh design'));
 const casualDesign=P.buildPrompt({...base,style,outputMode:'casual'});
 assert(!casualDesign.includes('SOURCE-TO-MECHANISM DESIGN:'));
}
assert(!P.buildPrompt({...base,form:'heavy'}).includes('Build a unified substantial upper-chest cuirass'));
assert(!P.buildPrompt({...base,form:'heavy'}).includes('Keep the central abdomen and natural waist in the established flexible undersuit by default'));
// Material identity must survive every style, form and output mode without changing coverage.
function assertMaterials(t,mode){
 assert(t.includes('[MATERIAL SEPARATION]'),'missing material separation');
 t=t.split('[MATERIAL SEPARATION]')[1].split('\n\n[')[0];
 if(t.includes('Render skin with soft anatomical shading')){
  assert(t.includes('undersuit as flexible fabric'));
  assert(t.includes('armor as rigid plates'));
  assert(t.includes('selected form explicitly adds outer armor'));
  return;
 }
 assert(t.includes('Exposed human skin is living skin'),'skin must not become shell');
 assert(t.includes('Do not convert covered areas into bare skin'),'coverage guard');
 assert(t.includes('selected style'),'material rules preserve style');
 if(mode==='casual'){
  assert(t.includes('Clothing remains clothing'));
  assert(!t.includes('BODYSUIT:')&&!t.includes('ARMOR:'));
 }else{
  assert(t.includes('BODYSUIT:')&&t.includes('ARMOR:'));
  assert(t.includes('cream or flesh-coloured bodysuit remains fabric'));
  assert(t.includes('never bare skin by default'));
 }
}
const materialProbe=P.buildPrompt(base);
// Heavy panel travel applies only to heavy overdrive; unknown reference armor stays conditional.
for(const outputMode of ['portrait','action','casual']) for(const baseForm of ['light','heavy','mobility','reference']) {
 const t=P.buildPrompt({...base,identityMode:'reference',outputMode,form:'overdrive',baseForm});
 assert.equal(t.includes('HEAVY PANEL TRAVEL:'),outputMode==='portrait'&&['heavy','reference'].includes(baseForm));
 if(baseForm==='reference'&&outputMode==='portrait') assert(t.includes('Only if the attached base armor is heavy'));
}
assert(!P.buildPrompt({...base,form:'heavy'}).includes('HEAVY PANEL TRAVEL:'));
assert(P.buildPrompt({...base,form:'overdrive',baseForm:'heavy'}).includes('HEAVY PANEL TRAVEL:'));
// Heavy coverage is a form transformation, isolated from light, mobility and casual.
for(const outputMode of ['portrait','action','casual']) for(const form of ['light','heavy','mobility']) {
 const t=P.buildPrompt({...base,identityMode:'reference',outputMode,form});
 assert.equal(t.includes('HEAVY COVERAGE:'),outputMode==='portrait'&&form==='heavy');
}
const heavyPrompt=P.buildPrompt({...base,identityMode:'reference',form:'heavy'});
assert(heavyPrompt.includes('front and outer upper thighs'));
assert(heavyPrompt.includes('one dominant broad front plate'));
assert(heavyPrompt.includes('pelvis-to-knee'));
const heavyOpen=P.buildPrompt({...base,identityMode:'reference',form:'overdrive',baseForm:'heavy'});
assert(heavyOpen.includes('large solid doors'));
assert(heavyOpen.includes('Do not subdivide'));
// Reference anatomy authority must survive all output modes, but never leak into new identities.
for(const outputMode of ['portrait','action','casual']) {
 const t=P.buildPrompt({...base,identityMode:'reference',outputMode});
 if(outputMode==='action') {
  assert(t.includes('same woman from the approved identity anchor'));
  assert(t.includes('height and body proportions'));
 } else {
  assert(t.includes('FRONT-VIEW ANATOMY AUTHORITY:'));
  assert(t.includes('Do not average conflicting views'));
 }
 if(outputMode!=='casual') assert(!P.buildPrompt({...base,identityMode:'create',outputMode}).includes('FRONT-VIEW ANATOMY AUTHORITY:'));
}
for(const form of ['heavy','overdrive']) {
 const t=P.buildPrompt({...base,identityMode:'reference',form,baseForm:'heavy'});
 assert(t.includes('The body does not need to fill the armor cavity'));
 assert(t.includes('inner-thigh contours'));
 assert(t.includes('Do not infer a larger breast or ribcage'));
}
assert(!P.buildPrompt({...base,identityMode:'reference',form:'light'}).includes('The body does not need to fill the armor cavity'));
// Form-specific staging must not leak into normal portraits, sheets or casual scenes.
for(const baseForm of ['light','heavy','mobility','reference']) {
 const state={...base,identityMode:'reference',form:'overdrive',baseForm};
 const portrait=P.buildPrompt(state);
 assert(portrait.includes('OVERDRIVE COMPARISON STAGING'),'overdrive needs its own portrait staging');
 assert(!portrait.includes('small pose variation and restrained effects'),'normal staging suppresses overdrive');
 assert(portrait.includes('vertical 2:3')&&portrait.includes('main front view'));
 for(const outputMode of ['action','casual'])
  assert(!P.buildPrompt({...state,outputMode}).includes('OVERDRIVE COMPARISON STAGING'));
 assert(!P.buildPrompt({...state,identityMode:'create',baseForm:'light'}).includes('OVERDRIVE COMPARISON STAGING'));
}
for(const form of ['light','heavy','mobility'])
 assert(!P.buildPrompt({...base,identityMode:'reference',form}).includes('OVERDRIVE COMPARISON STAGING'));
assertMaterials(materialProbe,'portrait');
assert.throws(()=>assertMaterials(materialProbe.replace(/\[MATERIAL SEPARATION\][\s\S]*?(?=\n\n\[)/,''),'portrait'));
let count=0;
for(const [style] of S.ART_STYLES) for(const outputMode of ['portrait','action','casual'])
 for(const form of ['light','heavy','mobility','overdrive']){
  const t=P.buildPrompt({...base,style,outputMode,form,identityMode:'reference',
   baseForm:'reference',formOverride:'OPEN_LEFT_PANEL',camera:'LOW_CAMERA',scene:'CITY_PARK'});
  assert(t.includes(outputMode==='action'?S.ACTION_STYLE_CORES[style]:S.STYLE_PROFILES[style].core),style);
  if(outputMode==='action') {
   assert(t.trim().split(/\s+/).length<800,style+' compact action exceeded word budget');
   assert((t.match(/\b(?:no|not|never|without|avoid|do not|must not|cannot)\b/gi)||[]).length<=12,style+' compact action accumulated prohibitions');
  }
  assertMaterials(t,outputMode);
  assert(!/undefined|null|Gundam|mobile.suit|\[TRANSLATION PROFILE\]/i.test(t),style);
  assert(t.includes('Pikachu')); assert(t.includes('woman')); assert(t.includes('user-approved'));
  assert(t.startsWith('[GENERATION INPUT]')&&t.includes('IMAGE-GUIDED CONTINUATION'));
  assert(!t.includes('TEXT-TO-IMAGE NEW CHARACTER'));
  assert(!t.includes('referenced_image_paths')&&!t.includes('num_last_images_to_include'));
  assert(!t.includes('body type: athletic')); assert(!t.includes('eye color: amber'));
  const order=(outputMode==='action'?
   ['[SOURCE IDENTITY]','[CHARACTER IDENTITY]','[SOURCE ENGINEERING]','[FORM DEFINITION]','[STYLE CORE]','[MATERIAL SEPARATION]','[OUTPUT MODE]','[FINAL CHECK]']:
   ['[SOURCE IDENTITY]','[CHARACTER IDENTITY]','[STYLE CORE]','[PROJECT STYLE EXTENSION]','[OUTPUT MODE]','[CAMERA & PRESENTATION]','[CONSISTENCY / NEGATIVE LOCK]','[FINAL CHECK]']).map(x=>t.indexOf(x));
  assert(order.every((x,i)=>x>=0&&(!i||x>order[i-1])));
  assert.equal(t.includes('[FORM DEFINITION]'),outputMode!=='casual');
  assert.equal(t.includes('OPEN_LEFT_PANEL'),outputMode!=='casual');
  assert.equal(t.includes('LOW_CAMERA'),outputMode!=='portrait');
  assert.equal(t.includes('CITY_PARK'),outputMode!=='portrait');
  assert.equal(P.audit(outputMode,t).length,0); count++;
 }
const first=P.buildPrompt(base);
const tailAction=P.buildPrompt({...base,outputMode:'action'});
assert(tailAction.includes('posterior centerline at the sacrum or lower back'));
assert(tailAction.includes('never originate from the abdomen, front waist, side waist, chest or front hip'));
// New creation never assumes an uploaded identity or source image, including optional face settings.
for(const [style] of S.ART_STYLES) for(const outputMode of ['portrait','action'])
 for(const form of ['light','heavy','mobility','overdrive']){
  const t=P.buildPrompt({...base,style,outputMode,form,params:[...base.params,['facial ethnicity','East Asian']]});
  assert(t.startsWith('[GENERATION INPUT]')&&t.includes('TEXT-TO-IMAGE NEW CHARACTER'));
  assertMaterials(t,outputMode);
  assert(t.includes('No input image is required'));
  const input=t.slice(0,t.indexOf('[STYLE CORE]'));
  assert(input.includes('omit both referenced_image_paths and num_last_images_to_include'));
  assert(input.includes('Do not automatically use earlier conversation images'));
  assert(t.includes('neither a character reference nor a source-creature picture'));
  assert(!/Preserve attached design|attached reference identity|compare face, hair and body with the approved|reference image\x27s own rendering/i.test(t),style+' leaked image requirement');
  assert(t.includes('facial ethnicity: East Asian'));
 }
// A creation portrait is an explicit reference sheet; all later modes stay independent.
for(const [style] of S.ART_STYLES) for(const form of ['light','heavy','mobility','overdrive']){
 const sheet=P.buildPrompt({...base,style,form,camera:'IGNORED_CAMERA',scene:'IGNORED_SCENE',aspect:'16:9'});
 assert(sheet.includes('INITIAL CHARACTER REFERENCE SHEET'),style+' creation sheet');
 assert(sheet.includes('ENVIRONMENT DEFAULT:'),'sheet needs a spatial background');
 assert(!sheet.includes('COMPARISON ENVIRONMENT:'),'sheet must establish, not inherit, the comparison environment');
 assert(sheet.includes('front full-body view')&&sheet.includes('rear three-quarter full-body view'));
 for(const detail of ['face close-up','source-derived marking','back-mounted structure','footwear'])
  assert(sheet.includes(detail),'missing sheet detail: '+detail);
 assert(sheet.includes('four detail insets')&&sheet.includes('vertical 3:4'));
 assert(!sheet.includes('vertical 2:3'),'initial reference sheet kept the narrow portrait ratio');
 assert(sheet.includes("rear three-quarter view and equipment inset must clearly show the tail's posterior attachment root"));
 assert(sheet.includes('same individual')&&sheet.includes('same selected armor configuration'));
 assert(!sheet.includes('IGNORED_CAMERA')&&!sheet.includes('IGNORED_SCENE')&&!sheet.includes('16:9'));
 assert(!sheet.includes('SINGLE-FIGURE COMPARISON PORTRAIT'),'mutually exclusive portrait instructions');
 assert(sheet.includes(S.STYLE_PROFILES[style].core),'sheet preserves selected style');
 for(const outputMode of ['portrait','action','casual']) for(const identityMode of ['create','reference']){
  if(outputMode==='portrait'&&identityMode==='create')continue;
  const other=P.buildPrompt({...base,style,form,outputMode,identityMode});
  assert(!other.includes('INITIAL CHARACTER REFERENCE SHEET'),'sheet leaked into '+outputMode+'/'+identityMode);
  assert(!other.includes('four detail insets'),'detail layout leaked into '+outputMode+'/'+identityMode);
  assert.equal(other.includes('COMPARISON ENVIRONMENT:'),outputMode==='portrait','background continuity must stay in comparison mode');
  if(outputMode==='portrait'){
   assert(other.includes('If the reference has no setting, establish one once'));
   assert(other.includes('same location, background layout and lighting across forms'));
   assert(other.includes('Explicit user background requests override this default'));
  }
  if(outputMode==='portrait'){
   assert(other.includes('SINGLE-FIGURE COMPARISON PORTRAIT'));
   assert(other.includes('main front view'),'sheet reference resolves to its front view');
  }
 }
}
assert(first.includes('body type: athletic')); assert(first.includes('right eye is amber'));
assert(first.includes('left eye is blue')); assert(!first.includes('Use the SAME'));
assert(!first.includes('[BODY MEASUREMENT NOTE]'));
assert(P.buildPrompt({...base,params:[['body measurements (B/W/H)','84/58/86']]}).includes('[BODY MEASUREMENT NOTE]'));
assert(P.buildPrompt({...base,form:'heavy'}).includes('multiple overlapping'));
assert(P.buildPrompt({...base,form:'mobility'}).includes('outward'));
assert.throws(()=>P.buildPrompt({...base,form:'unknown'}));
assert.throws(()=>P.buildPrompt({...base,style:'semi_real'}));
assert.throws(()=>P.buildPrompt({...base,outputMode:'collage'}));
assert.throws(()=>P.buildPrompt({...base,form:'overdrive',baseForm:'reference'}));
const od=P.buildPrompt({...base,identityMode:'reference',form:'overdrive'});
assert(od.includes('armor actually worn in the attached reference'));
assert(od.includes('selected existing seams')); assert(od.includes('Floating is optional'));
const explicit=P.buildPrompt({...base,form:'overdrive',baseForm:'heavy'});
assert(explicit.includes('multiple overlapping'));
assert(!explicit.includes('armor actually worn in the attached reference'));
const casual=L.buildSingle({source:{mech:'Pikachu'},style:S.DEFAULT_STYLE,cat:'everyday_basic',
 axes:{source_influence:'subtle'},scene:'CITY_PARK',carryFace:true,carryBody:true,
 record:{female:{params:{'body type':'LEGACY_BODY'}}}});
assert(casual.includes('CITY_PARK')); assert(!casual.includes('LEGACY_BODY'));
assert(!casual.includes('[FORM DEFINITION]')); assert(P.buildAnthro(base).includes('body type: athletic'));
assert(F.has('body type',Object.keys(S.BODY_FIG)[0]));
assert(F.has('hairstyle',Object.keys(S.HAIR_FIG)[0]));


for (const identityMode of ['create','reference']) {
 const light=P.buildPrompt({...base,identityMode,form:'light'});
 assert(light.includes('LIGHT STRUCTURAL DEPTH:'));
 assert(light.includes('does not require a continuous bodysuit'));
 assert(light.includes('Preserve approved coverage'));
 assert(!P.buildPrompt({...base,identityMode,form:'heavy'}).includes('LIGHT STRUCTURAL DEPTH:'));
 assert(!P.buildPrompt({...base,identityMode,outputMode:'casual'}).includes('LIGHT STRUCTURAL DEPTH:'));
}
assert(P.buildPrompt(base).includes('biology/silhouette and elemental type'));

const compactSheet=P.buildPrompt({...base,style:'glossy_promo',params:[]});
assert(compactSheet.length < 10000,'compact creation sheet exceeds text budget');
assert(!compactSheet.includes('Lock skeletal shoulder width'),'creation must establish anatomy, not lock an absent reference');
// Bilateral construction applies to armor only, once, across forms and identity modes.
for(const identityMode of ['create','reference']) for(const outputMode of ['portrait','action','casual'])
 for(const form of ['light','heavy','mobility','overdrive']) {
 const t=P.buildPrompt({...base,identityMode,outputMode,form});
 const compact=identityMode==='reference'&&outputMode==='action';
 assert.equal(t.split('BILATERAL ARMOR:').length-1,outputMode==='casual'||compact?0:1);
 if(outputMode!=='casual'&&!compact) {
  assert(t.includes('matching part inventory, dimensions and anatomical mounting levels'));
  assert(t.includes('explicitly requested or explicitly approved asymmetric equipment'));
  assert(t.includes('Pose, perspective, cable curves and panel-opening angles may differ'));
 }
 if(compact) assert(t.includes('Paired shoulder, arm, thigh, knee, shin and footwear armor uses matching parts'));
}
for(const identityMode of ['create','reference']) {
 for(const form of ['heavy','overdrive']) {
  const t=P.buildPrompt({...base,identityMode,form,baseForm:'heavy'});
  assert(t.includes('FULL-BODY ENCLOSURE:'));
  assert(t.includes('previously exposed skin or textile'));
  assert(t.includes('abdomen, waist, pelvis'));
  assert(!t.includes('preserve established abdominal coverage unless'));
 }
 const light=P.buildPrompt({...base,identityMode,form:'light'});
 assert(light.includes('separate regional armor assemblies'));
 assert(!light.includes('FULL-BODY ENCLOSURE:'));
 assert(!P.buildPrompt({...base,identityMode,outputMode:'casual',form:'heavy'}).includes('FULL-BODY ENCLOSURE:'));
}
console.log('PASS prompt engine: '+count+' combinations + identity and transition contracts');
