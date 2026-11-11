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
for (const f of ['lib/prompt-spec.js', 'lib/casual-tree.js', 'lib/prompt-anthro.js', 'lib/prompt-lifestyle.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L } = ctx.window;
// 화풍은 한 줄 — 갑주 출력은 ACTION_STYLE_CORES, 일상은 장갑 말이 없는 CASUAL_STYLE_CORES
for (const { key } of actual.styles) {
  for (const form of ['light', 'heavy', 'overdrive']) for (const identityMode of ['create', 'reference']) {
    const text = P.buildPrompt({ mech: 'test', series: 'water', style: key, outputMode: 'action', identityMode, form, baseForm: 'light', params: [] });
    assert(text.includes('STYLE: ' + S.ACTION_STYLE_CORES[key]), 'Wrong action style: ' + key);
    assert(!text.includes('undefined'), 'Unresolved prompt: ' + key);
  }
  const casual = L.buildSingle({ mech: 'test', series: 'water', style: key, cat: 'everyday_basic', aspect: '2:3', axes: {}, tree: JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8')) });
  /* 일상컷 STYLE 은 그 화풍의 일상 문장(2026-11-08 — 그 전 11-03 부터는 「첨부 그림 그대로」) */
  assert(casual.includes('STYLE: ' + S.CASUAL_STYLE_CORES[key]) && !casual.includes("keep the attached image's rendering"), 'Wrong casual style: ' + key);   // 2026-11-08 — 그 화풍 문장
  /* 갑주 문장에 장갑 말이 있을 때만 다르다 — anime_25d 처럼 처음부터 장갑 말이 없으면 두 문장이 같다 */
  if (S.ACTION_STYLE_CORES[key] !== S.CASUAL_STYLE_CORES[key]) assert(!casual.includes(S.ACTION_STYLE_CORES[key]), 'Armor style leaked into casual: ' + key);
  assert(!/\barmor\b|\bmecha\b|hard-surface/i.test(S.CASUAL_STYLE_CORES[key]), 'Casual style speaks armor: ' + key);
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
/* 내린 화풍(2026-11-11) — style.json 에 남되 retired · retired_why 가 붙고, 그 키로 등록된 그림이 없다(그림 없는 것만 내렸다).
   새 작업 쪽: 생성기 저장값의 내린 화풍은 기본 화풍으로 돌아간다 */
const LIVE = ['cinematic_semi_real', 'glossy_promo', 'mecha_cinematic_keyart', 'anime_gloss', 'gloss_daylight', 'anime_25d', 'anime_25d_gloss'];
assert.deepEqual(actual.styles.filter(s => !s.retired).map(s => s.key), LIVE, 'Live styles');
const retiredRows = actual.styles.filter(s => s.retired);
assert.equal(retiredRows.length, 11, 'Retired styles');
const used = new Set(Object.values(images).flatMap(e => Object.keys(e.byStyle || {})));
for (const r of retiredRows) {
  assert(r.retired === '2026-11-11' && /도감에 그림이 없는 화풍/.test(r.retired_why), 'Retired row: ' + r.key);
  assert(!used.has(r.key), 'A retired style has registered images: ' + r.key);
}
vm.runInContext(fs.readFileSync('lib/prompt-state.js', 'utf8'), ctx);
const ST = ctx.window.AtelierPromptState, tree = JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8'));
for (const r of retiredRows) assert.equal(ST.normalize(S, ctx.window.AtelierCasualTree, { style: r.key }, tree).style, S.DEFAULT_STYLE, 'Retired style kept in state: ' + r.key);
for (const key of LIVE) assert.equal(ST.normalize(S, ctx.window.AtelierCasualTree, { style: key }, tree).style, key, 'Live style dropped from state: ' + key);
console.log('PASS: ' + actual.styles.length + ' styles generate prompts (' + LIVE.length + ' live, ' + retiredRows.length + ' retired); ' + count + ' image filenames match');

for(const identityMode of ['create','reference']) {
 const t=P.buildPrompt({mech:'Bulbasaur',style:'glossy_promo',outputMode:'portrait',identityMode,form:'light',params:[['apparent age','20s'],['facial character','cute']]});
 if(identityMode==='create') assert(t.includes('preserve age and geometry'),'demeanor must preserve the specified identity');
 if(identityMode==='create') assert(t.includes('adult woman in her twenties'));
 else assert(!t.includes('apparent age:'),'creation age must not override approved identity');
 if(identityMode==='create') assert(t.includes('apparent age: 20s'));
}
