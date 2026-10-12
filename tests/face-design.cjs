/* 종별 얼굴 설계 — 자료 규칙과 생성기 연결. node tests/face-design.cjs
   - data/face-design.json: 1025종, 값은 생성기 얼굴 항목 그대로, 같은 얼굴 없음, 같은 계열끼리 다섯 묶음 중 셋 이상·전체 어느 둘도 둘 이상 다르다
   - 새 인물(경장 ①)에만 FACE 줄 — 이어가기·개방·일상·끈 경우엔 없다. 직접 고른 얼굴 항목은 FACE 줄에서 빠진다
   - 문서(docs/CHARACTER_FACE_DESIGNS.md)의 FACE 줄이 생성기가 실제로 만드는 줄과 글자까지 같다(도구와 엔진이 따로 놀지 않게) */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['prompt-spec', 'figures', 'toolkit', 'prompt-anthro', 'prompt-lifestyle'])
  vm.runInContext(fs.readFileSync('lib/' + f + '.js', 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L } = ctx.window;
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const cards = read('data/card.json').cards.character, app = read('data/source-appearance.json').entries;
const img = read('data/img.json').img, data = read('data/face-design.json'), F = data.faces;
const doc = fs.readFileSync('docs/CHARACTER_FACE_DESIGNS.md', 'utf8');
const GROUPS = [['face shape', 'face length', 'face width', 'jaw & chin'], ['eye shape', 'eye size', 'eye tilt', 'eye spacing'], ['eyebrows'], ['nose character'], ['lips']];
const sig = t => GROUPS.map(g => g.map(k => t[k]).join('|'));
const diff = (a, b) => a.reduce((n, x, i) => n + (x !== b[i]), 0);

/* 1. 자료 */
assert.equal(JSON.stringify(S.FACE_KEYS), JSON.stringify(GROUPS.flat()), 'FACE_KEYS 차례');
const opts = Object.fromEntries(S.FACE_KEYS.map(k => [k, S.PARAM_DEFS.find(d => d.key === k).options.map(o => o[0]).filter(v => v && v !== '__custom__')]));
for (const k of ['eye spacing', 'eyebrows']) assert(S.PARAM_GUIDES[k] && opts[k].every(v => S.PARAM_GUIDES[k][v]), k + ' 안내');
assert.equal(Object.keys(F).length, cards.length, '1025종');
const byName = Object.fromEntries(cards.map(c => [c.name, c])), root = {};
for (const c of cards) { let r = c.name, seen = new Set(); while (byName[r] && byName[r].from && byName[byName[r].from] && !seen.has(r)) { seen.add(r); r = byName[r].from; } root[c.name] = r; }
const S5 = {};
for (const c of cards) {
  const f = F[c.no]; assert(f, c.name + ' 없음'); assert.equal(f.name, c.name);
  for (const k of S.FACE_KEYS) assert(opts[k].includes(f.face[k]), c.name + ' ' + k + '=' + f.face[k] + ' 는 생성기에 없는 값');
  assert.equal(!!f.registered, !!img[c.name], c.name + ' registered 가 img.json 과 다르다');
  S5[c.no] = sig(f.face);
}
const all = Object.values(S5).map(s => s.join('/'));
assert.equal(new Set(all).size, all.length, '같은 얼굴이 둘 이상');
const lines = {}; for (const c of cards) (lines[root[c.name]] = lines[root[c.name]] || []).push(c.no);
let pairs = 0;
for (const ms of Object.values(lines)) for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
  pairs++; assert(diff(S5[ms[i]], S5[ms[j]]) >= 3, '같은 계열인데 묶음 셋 이상 다르지 않다: ' + F[ms[i]].name + '·' + F[ms[j]].name);
}
for (let i = 0; i < 5; i++) {   /* 어느 둘도 다섯 묶음 중 넷 이상 같지 않다 — 하나씩 빼고 본 열쇠가 겹치면 넷이 같다 */
  const seen = new Set();
  for (const s of Object.values(S5)) { const k = s.filter((_, j) => j !== i).join('/'); assert(!seen.has(k), '넷 이상 같은 두 얼굴'); seen.add(k); }
}
/* 옛 설계표의 실패가 다시 오지 않게 — 눈 간격은 한 값이 아니고, 항목마다 값이 고루 쓰인다 */
for (const k of S.FACE_KEYS) assert(new Set(Object.values(F).map(f => f.face[k])).size >= Math.min(3, opts[k].length), k + ' 값이 한쪽으로 몰렸다');
assert(new Set(Object.values(F).map(f => f.face['eye spacing'])).size === 3, '눈 간격이 한 값');

/* 2. 생성기 연결 */
const card = name => cards.find(c => c.name === name);
const input = (name, extra) => { const c = card(name); return { mech: c.name, sourceName: c.en, series: c.element, sourceAppearance: app[c.no], faceDesign: F[c.no],
  style: 'glossy_promo', params: [], outputMode: 'action', identityMode: 'create', form: 'light', ...extra }; };
const block = t => t.split('\n\n').find(x => x.startsWith('FACE ('));
const sq = P.buildPrompt(input('꼬부기'));
assert(block(sq), '새 인물에는 FACE 줄');
assert(sq.indexOf('FACE (') > sq.indexOf('WEAR') && sq.indexOf('FACE (') < sq.indexOf('FORM —'), 'FACE 는 WEAR 뒤, FORM 앞');
for (const k of S.FACE_KEYS) assert(block(sq).includes(F[card('꼬부기').no].face[k].replace(/ eyes$| eye spacing$/, '').replace(/^large$/, 'open rounded')), 'FACE 줄에 ' + k);
for (const [why, extra] of [['이어가기', { identityMode: 'reference', form: 'heavy' }], ['개방', { form: 'overdrive', baseForm: 'light' }], ['끔', { faceDesignOn: false }], ['자료 없음', { faceDesign: null }]])
  assert(!P.buildPrompt(input('꼬부기', extra)).includes('FACE ('), why + '에 FACE 줄이 실렸다');
assert(!L.buildSingle(input('꼬부기', { cat: 'everyday_basic' })).includes('FACE ('), '일상에 FACE 줄');
/* 직접 고른 얼굴 항목은 그 항목만 FACE 에서 빠지고 IDENTITY 가 쥔다 */
const mine = P.buildPrompt(input('꼬부기', { params: [['lips', 'wide mouth'], ['eyebrows', 'thick low brows']] }));
const own = F[card('꼬부기').no].face;
assert(mine.includes('lips: wide mouth') && mine.includes('eyebrows: thick low brows'), '직접 고른 값은 IDENTITY 로');
assert(!block(mine).includes(own.lips) || own.lips === 'wide mouth', '고른 입술이 FACE 에 남았다');
assert(!block(mine).includes(own.eyebrows) || own.eyebrows === 'thick low brows', '고른 눈썹이 FACE 에 남았다');
assert(block(mine).includes(own['face shape']), '안 고른 항목은 남는다');
/* 얼굴 항목을 다 고르면 FACE 줄이 없다 */
assert(!P.buildPrompt(input('꼬부기', { params: S.FACE_KEYS.map(k => [k, opts[k][0]]) })).includes('FACE ('), '다 고르면 FACE 줄 없음');

/* 3. 1025종 — 문서 줄 = 엔진 줄, 예산, 깨진 값 없음 */
let most = [0, ''];
for (const c of cards) {
  const t = P.buildPrompt(input(c.name)), f = block(t);
  assert(f && !/undefined|\[object|\{\w+\}/.test(t), c.en);
  assert(doc.includes('```text\n' + f + '\n```'), '문서의 FACE 줄이 생성기와 다르다: ' + c.name);
  const w = P.words(t); if (w > most[0]) most = [w, c.en];
}
assert(most[0] <= 440, '얼굴 줄을 더한 앵커 예산: ' + most.join(' '));
console.log(`PASS 얼굴 설계: 1025종 서로 다름 · 계열 ${Object.values(lines).filter(x => x.length > 1).length}개 ${pairs}쌍 셋 이상 다름 · 전체 둘 이상 다름 · 새 인물에만 FACE · 직접 고른 항목 우선 · 문서=엔진 · 최대 ${most[0]}낱말(${most[1]})`);
