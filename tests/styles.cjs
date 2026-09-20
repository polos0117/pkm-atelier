/* Prompt choices, registry, image buckets and filenames share one vocabulary.
   Run: node tests/styles.cjs */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { registry } = require('../tools/sync-styles.cjs');

const expected = registry();
const actual = JSON.parse(fs.readFileSync('data/style.json', 'utf8'));
assert.deepEqual(actual, expected, 'Registry differs from prompt choices');
const ctx = { window: {}, console };
vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/prompt-anthro.js', 'lib/prompt-lifestyle.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L } = ctx.window;
// Glossy promo keeps the same identity; approved-sheet actions use its concise style core.
for(const outputMode of ['portrait','action','casual']) {
 const text=P.buildPrompt({mech:'Bulbasaur',style:'glossy_promo',outputMode,identityMode:'reference',form:'heavy'});
 if(outputMode==='action') {
  assert(text.includes(S.ACTION_STYLE_CORES.glossy_promo));
  assert(text.includes('Premium glossy anime-mecha promotional key art'));
  assert(text.includes('same polished rendering intensity'));
  assert(!text.includes('PROJECT STYLE EXTENSION'));
  continue;
 }
 assert(text.includes('Premium anime-mecha promotional key art with clean linework'));
 assert(text.includes('strong dimensional shading'));
 assert(text.includes('grouped illustrated shadow shapes'));
 assert(text.includes('same high-impact promotional rendering intensity as the mechanical armor'));
 assert(text.includes('stronger upper-lash definition'));
 assert(text.includes('Preserve selected or approved eye shape, facial geometry, age and expression'));
 assert(!text.includes('economical nose and lip lines, and selective soft transitions'));
 assert(text.includes('Restrained skin highlights'));
 assert(!text.includes('glossy highlights across body'));
 assert(text.includes('Do not force a background, expression'));
 assert(!text.includes('luminous semi-real 2.5D rendering'));
 assert(!text.includes('selective shallow depth of field'));
}
for (const { key } of actual.styles) {
  const text = P.buildAnthro({ mech: 'test', series: 'test', gender: 'female', style: key,
    morph: 'standard_humanoid', translation: 'balanced', params: [] });
  assert(text.includes(S.STYLE_PROFILES[key].core), 'Wrong anthro style: ' + key);
  const casual = L.buildSingle({ source: { mech: 'test' }, gender: 'female', style: key,
    cat: 'everyday_basic', aspect: '2:3', axes: {}, carryFace: false, carryBody: false });
  assert(casual.includes(S.STYLE_PROFILES[key].core), 'Wrong casual style: ' + key);
  assert(!text.includes('undefined') && !casual.includes('undefined'), 'Unresolved prompt: ' + key);
}
const known = new Set(actual.styles.map(s => s.key));
const images = JSON.parse(fs.readFileSync('data/img.json', 'utf8')).img;
let count = 0;
function files(value, key) {
  if (typeof value === 'string' && value.endsWith('.webp')) {
    assert(value.includes('_' + key + '_'), 'Filename style differs from bucket: ' + value);
    count++;
  } else if (value && typeof value === 'object') {
    for (const child of Object.values(value)) files(child, key);
  }
}
for (const [name, entry] of Object.entries(images)) {
  for (const [key, bucket] of Object.entries(entry.byStyle || {})) {
    assert(known.has(key), 'Unrecognized image style: ' + name + '/' + key);
    files(bucket, key);
  }
}
console.log('PASS: ' + actual.styles.length + ' styles generate prompts; ' + count + ' image filenames match');

for(const identityMode of ['create','reference']) {
 const t=P.buildPrompt({mech:'Bulbasaur',style:'glossy_promo',outputMode:'portrait',identityMode,form:'light',params:[['apparent age','20s'],['facial character','cute']]});
 if(identityMode==='create') assert(t.includes('preserve age and geometry'),'demeanor must preserve the specified identity');
 if(identityMode==='create') assert(t.includes('adult woman in her twenties'));
 else assert(!t.includes('apparent age:'),'creation age must not override approved identity');
 if(identityMode==='create') assert(t.includes('apparent age: 20s'));
}
