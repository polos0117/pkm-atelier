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
// 화풍은 한 줄 — 갑주 출력은 ACTION_STYLE_CORES, 일상은 장갑 말이 없는 CASUAL_STYLE_CORES
for (const { key } of actual.styles) {
  for (const form of ['light', 'heavy', 'overdrive']) for (const identityMode of ['create', 'reference']) {
    const text = P.buildPrompt({ mech: 'test', series: 'water', style: key, outputMode: 'action', identityMode, form, baseForm: 'light', params: [] });
    assert(text.includes('STYLE: ' + S.ACTION_STYLE_CORES[key]), 'Wrong action style: ' + key);
    assert(!text.includes('undefined'), 'Unresolved prompt: ' + key);
  }
  const casual = L.buildSingle({ mech: 'test', series: 'water', style: key, cat: 'everyday_basic', aspect: '2:3', axes: {} });
  assert(casual.includes('STYLE: ' + S.CASUAL_STYLE_CORES[key]), 'Wrong casual style: ' + key);
  assert(!casual.includes(S.ACTION_STYLE_CORES[key]), 'Armor style leaked into casual: ' + key);
  assert(!casual.includes('undefined'), 'Unresolved prompt: ' + key);
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
