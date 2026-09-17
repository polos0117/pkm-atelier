/* Prompt contracts: identity authority, form transitions, and mode isolation. */
const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const ctx={window:{},console}; vm.createContext(ctx);
for(const f of ['prompt-spec','figures','toolkit','prompt-anthro','prompt-lifestyle'])
  vm.runInContext(fs.readFileSync('lib/'+f+'.js','utf8'),ctx);
const {AtelierSpec:S,AtelierPrompt:P,AtelierLifestyle:L,AtelierFigures:F}=ctx.window;
assert.equal(typeof P.buildPrompt,'function');
assert(S.ART_STYLES.every(r=>r.length===3)); assert.equal(S.ART_STYLES.length,12);
assert(S.STYLE_PROFILES.bright_catalog);
assert(Object.values(S).every(x=>typeof x!=='function'));
const base={mech:'Pikachu',style:S.DEFAULT_STYLE,outputMode:'portrait',identityMode:'create',
 form:'light',params:[['body type','athletic'],['eye color','amber'],['second eye color','blue']]};
let count=0;
for(const [style] of S.ART_STYLES) for(const outputMode of ['portrait','action','casual'])
 for(const form of ['light','heavy','mobility','overdrive']){
  const t=P.buildPrompt({...base,style,outputMode,form,identityMode:'reference',
   baseForm:'reference',formOverride:'OPEN_LEFT_PANEL',camera:'LOW_CAMERA',scene:'CITY_PARK'});
  assert(t.includes(S.STYLE_PROFILES[style].core),style);
  assert(!/undefined|null|Gundam|mobile.suit|\[TRANSLATION PROFILE\]/i.test(t),style);
  assert(t.includes('Pikachu')); assert(t.includes('clearly adult woman')); assert(t.includes('user-approved'));
  assert(!t.includes('body type: athletic')); assert(!t.includes('eye color: amber'));
  const order=['[STYLE CORE]','[PROJECT STYLE EXTENSION]','[SOURCE IDENTITY]',
   '[CHARACTER IDENTITY]','[OUTPUT MODE]','[CAMERA & PRESENTATION]',
   '[CONSISTENCY / NEGATIVE LOCK]','[FINAL CHECK]'].map(x=>t.indexOf(x));
  assert(order.every((x,i)=>x>=0&&(!i||x>order[i-1])));
  assert.equal(t.includes('[FORM DEFINITION]'),outputMode!=='casual');
  assert.equal(t.includes('OPEN_LEFT_PANEL'),outputMode!=='casual');
  assert.equal(t.includes('LOW_CAMERA'),outputMode!=='portrait');
  assert.equal(t.includes('CITY_PARK'),outputMode!=='portrait');
  assert.equal(P.audit(outputMode,t).length,0); count++;
 }
const first=P.buildPrompt(base);
// A creation portrait is an explicit reference sheet; all later modes stay independent.
for(const [style] of S.ART_STYLES) for(const form of ['light','heavy','mobility','overdrive']){
 const sheet=P.buildPrompt({...base,style,form,camera:'IGNORED_CAMERA',scene:'IGNORED_SCENE',aspect:'16:9'});
 assert(sheet.includes('INITIAL CHARACTER REFERENCE SHEET'),style+' creation sheet');
 assert(sheet.includes('front full-body view')&&sheet.includes('rear three-quarter full-body view'));
 for(const detail of ['face close-up','source-derived marking','back-mounted structure','footwear'])
  assert(sheet.includes(detail),'missing sheet detail: '+detail);
 assert(sheet.includes('four detail insets')&&sheet.includes('vertical 2:3'));
 assert(sheet.includes('same individual')&&sheet.includes('same selected armor configuration'));
 assert(!sheet.includes('IGNORED_CAMERA')&&!sheet.includes('IGNORED_SCENE')&&!sheet.includes('16:9'));
 assert(!sheet.includes('SINGLE-FIGURE COMPARISON PORTRAIT'),'mutually exclusive portrait instructions');
 assert(sheet.includes(S.STYLE_PROFILES[style].core),'sheet preserves selected style');
 for(const outputMode of ['portrait','action','casual']) for(const identityMode of ['create','reference']){
  if(outputMode==='portrait'&&identityMode==='create')continue;
  const other=P.buildPrompt({...base,style,form,outputMode,identityMode});
  assert(!other.includes('INITIAL CHARACTER REFERENCE SHEET'),'sheet leaked into '+outputMode+'/'+identityMode);
  assert(!other.includes('four detail insets'),'detail layout leaked into '+outputMode+'/'+identityMode);
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
console.log('PASS prompt engine: '+count+' combinations + identity and transition contracts');
