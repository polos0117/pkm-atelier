/* 프롬프트 엔진. 화면 없이 글이 끝까지 나오나 본다.

   atelier 에서는 이걸 못 했다 — 조립 함수들이 스스로 화면을 뒤져서, 확인하려면
   브라우저를 띄워야 했다. 값을 인자로 받게 갈라 놓은 덕에 여기서는 그냥 부른다.

   여기서 보는 것은 뼈대다. 안에 든 말(건담 낱말)은 아직 안 고쳤고,
   그건 lib/prompt-spec.js 한 곳에서 고칠 일이다.
   Run: node tests/prompt-engine.cjs */
const fs = require('node:fs'), vm = require('node:vm');
const assert = require('node:assert/strict');

const ctx = { window: {}, console: { warn() {} }, Date: Date, Math: Math, JSON: JSON };
vm.createContext(ctx);
for (const f of ['lib/prompt-spec.js', 'lib/figures.js', 'lib/toolkit.js',
                 'lib/prompt-anthro.js', 'lib/prompt-lifestyle.js'])
  vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L,
        AtelierToolkit: TK, AtelierFigures: F } = ctx.window;

const ok = [];
const ck = (name, cond, got) => { assert.ok(cond, name + (got === undefined ? '' : ' ← ' + got)); ok.push(name); };

/* ── 표가 다 왔나 ─────────────────────────────── */
ck('표 60개 넘게 왔다', Object.keys(S).length >= 60, Object.keys(S).length);
ck('함수는 한 개도 안 섞였다',
  Object.keys(S).every(k => typeof S[k] !== 'function'),
  Object.keys(S).filter(k => typeof S[k] === 'function').join(','));
ck('이름 정규식 표는 안 가져왔다', S.NAME_RULES === undefined);
for (const k of ['PARAM_DEFS', 'ART_STYLES', 'STYLE_PROFILES', 'STYLE_CORES', 'templateC',
                 'MORPHOLOGY_PROFILES', 'TRANSLATION_PROFILES', 'CATS', 'EXAMPLE_MAP',
                 'BODY_FIG', 'HAIR_FIG', 'CAT_SHORT', 'PARAM_SHORT', 'SUMMARY_WORDS'])
  ck('표 ' + k, S[k] !== undefined);

/* ── 의인화 글 ────────────────────────────────── */
const st = {
  mech: '피카츄', series: '전기', gender: 'female',
  style: S.DEFAULT_STYLE, morph: Object.keys(S.MORPHOLOGY_PROFILES)[0],
  translation: Object.keys(S.TRANSLATION_PROFILES)[0],
  params: P.paramValues([['apparent age', '20s'], ['facial ethnicity', 'East Asian'],
                         ['eye color', 'amber'], ['hair color', 'blonde']],
                        { gender: 'female' }),
};
const anthro = P.buildAnthro(st);
ck('의인화 글이 나온다', anthro.length > 2000, anthro.length + '자');
ck('블록이 차례대로 선다',
  ['[ANTHRO STYLE EXTENSION]', '[SOURCE MORPHOLOGY ADAPTER]', '[TRANSLATION PROFILE]']
    .map(t => anthro.indexOf(t)).every((v, i, a) => v > 0 && (i === 0 || v > a[i - 1])),
  ['[ANTHRO STYLE EXTENSION]', '[SOURCE MORPHOLOGY ADAPTER]', '[TRANSLATION PROFILE]']
    .map(t => anthro.indexOf(t)).join(','));
ck('고른 값이 글에 실린다', anthro.includes('apparent age: 20s') && anthro.includes('피카츄'));
ck('일상 블록은 안 섞인다', !anthro.includes('[LIFESTYLE STYLE EXTENSION]'));
ck('검산이 조용하다', P.audit(S.MODE.ANTHRO, anthro).length === 0);

/* 숫자를 안 넣으면 치수 메모 자체가 없다 — 옛 글이 안 바뀌어야 한다 */
ck('치수를 안 적으면 그 블록이 없다', !anthro.includes('[BODY MEASUREMENT NOTE]'));
const withBWH = P.buildAnthro(Object.assign({}, st,
  { params: st.params.concat([['body measurements (B/W/H)', '84/58/86']]) }));
ck('치수를 적으면 그 블록이 붙는다', withBWH.includes('[BODY MEASUREMENT NOTE]'));

/* ── 일상컷 ───────────────────────────────────── */
ck('카테고리 표가 배열이다', Array.isArray(S.CATS), typeof S.CATS);
/* 화면이 넘기던 꼴 그대로 넘긴다 (prompt.html 의 buildSingle 호출부와 같다) */
const single = L.buildSingle({
  source: { mech: '피카츄' }, gender: 'female', style: S.DEFAULT_STYLE, record: null,
  cat: 'everyday_basic', catCustom: '', ex: '', exCustom: '',
  aspect: '', frame: '', expr: '', orient: '', pose: '',
  scene: '', outfit: '', camera: '', custom: '', axes: {},
  carryFace: {}, carryBody: {},
});
ck('일상컷 글이 나온다', typeof single === 'string' && single.length > 500, (single || '').length + '자');
ck('일상컷에 의인화 블록이 안 섞인다',
  !['[ANTHRO STYLE EXTENSION]', '[TRANSLATION PROFILE]', '[SOURCE MORPHOLOGY ADAPTER]']
    .some(t => single.includes(t)),
  single.slice(0, 80));

/* ── 이름표가 한 곳에서 온다 ──────────────────── */
const w = TK.words();
ck('toolkit 이 표에서 이름표를 꺼낸다',
  w.cat.swimwear === S.CAT_SHORT.swimwear && w.label['eye color'] === S.PARAM_SHORT['eye color']);

/* ── 도형 ─────────────────────────────────────── */
/* 도형은 설정 항목 열쇠로 찾는다 — 'body'/'hair' 가 아니라 PARAM_DEFS 의 열쇠다 */
ck('체형 도형이 산다', F.has('body type', Object.keys(S.BODY_FIG)[0]),
  Object.keys(S.BODY_FIG)[0]);
ck('머리 도형이 산다', F.has('hairstyle', Object.keys(S.HAIR_FIG)[0]),
  Object.keys(S.HAIR_FIG)[0]);
ck('없는 도형은 없다고 한다', !F.has('body type', '없는값'));

console.log('PASS: ' + ok.length + '가지 — 표 ' + Object.keys(S).length +
  '개, 의인화 ' + anthro.length + '자, 일상컷 ' + single.length + '자');
