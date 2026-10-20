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

/* 3. 머리 — 종마다 헤어스타일·길이·앞머리. 생성기가 스스로 고르면 보브·웨이브 몇 가지로 몰렸다(2026-10-20)
   - 값은 생성기 열쇠, 여성 인물이라 남성 전용 값 없음, 길이는 컷에 맞음(HAIR_LENGTH_LIMITS)
   - 한 헤어스타일 8% · 보브 4% 를 넘지 않는다(확정 그림이 이미 넘으면 그 수까지 — 새로 고르지 않는다)
   - 진화 한 걸음마다 같은 묶음에서 길이가 줄지 않거나, 이어지는 묶음으로 더 공들인 쪽 · 계열 안 두 종이 똑같지 않다 · 도감 옆 번호의 다른 계열과 헤어스타일이 다르다
   - 경장 ①이 등록된 종은 그림 기록의 값으로 잠근다 */
assert.deepEqual([...S.HAIR_KEYS], ['hairstyle', 'hair length', 'bangs'], 'HAIR_KEYS');
const HR = data.rules.hair, HK = S.HAIR_KEYS, LEN = HR.lengths;
const hopt = Object.fromEntries(HK.map(k => [k, S.PARAM_DEFS.find(d => d.key === k).options.map(o => o[0]).filter(v => v && v !== '__custom__')]));
const male = k => Object.entries(S.ONLY[k] || {}).filter(([, s]) => s === 'male').map(([v]) => v);
for (const v of ['buzz cut', 'crew cut', 'fade', 'man bun', 'mullet']) assert(male('hairstyle').includes(v), '남성 전용 표에 ' + v);
const lightReg = new Set(Object.entries(img).filter(([, v]) => Object.values(v.byStyle || {}).some(s => s.byForm && s.byForm.light)).map(([n]) => n));
const fam = s => Object.keys(HR.family).find(f => HR.family[f].includes(s)) || HR.familyLocked[s];
const edgeOk = (p, c) => {
  const a = p.hairstyle, b = c.hairstyle; if (!a || !b) return true;
  const longer = !p['hair length'] || !c['hair length'] || LEN.indexOf(c['hair length']) >= LEN.indexOf(p['hair length']);
  if (fam(a) === fam(b)) return longer;
  return (HR.grow[fam(a)] || []).includes(fam(b)) && (HR.elab[b] ?? 1) >= (HR.elab[a] ?? 1) && longer;
};
const triple = h => HK.map(k => h[k]).join('|');
const count = {}, lockedCount = {};
let locked = 0, lockedWith = 0;
for (const c of cards) {
  const f = F[c.no], h = f.hair;
  assert(h && typeof h === 'object' && f.hair_why, c.name + ' 머리 설계 없음');
  /* 잠금은 경장 ①이 등록된 종에만. 등록됐는데 안 잠긴 종은 이 표의 HAIR 줄로 만든 그림 — 표와 그림이 같다(다음 build 가 기록으로 잠근다) */
  if (f.hair_locked) assert(lightReg.has(c.name), c.name + ' 경장 ①이 등록되지 않았는데 hair_locked');
  for (const [k, v] of Object.entries(h)) assert(HK.includes(k) && hopt[k].includes(v), c.name + ' 머리 ' + k + '=' + v + ' 는 생성기에 없는 값');
  if (h.hairstyle) { count[h.hairstyle] = (count[h.hairstyle] || 0) + 1; if (f.hair_locked) lockedCount[h.hairstyle] = (lockedCount[h.hairstyle] || 0) + 1; }
  if (f.hair_locked) { locked++; if (h.hairstyle) lockedWith++; continue; }
  assert.deepEqual(Object.keys(h).sort(), [...HK].sort(), c.name + ' 머리 항목 셋');
  for (const k of HK) assert(!male(k).includes(h[k]), c.name + ' 남성 전용 머리 ' + h[k]);
  assert(HR.length[h.hairstyle].includes(h['hair length']), c.name + ' ' + h.hairstyle + ' 에 맞지 않는 길이 ' + h['hair length']);
  if (h.hairstyle === 'pixie cut') assert(['very short', 'short'].includes(h['hair length']), c.name + ' 픽시는 짧게');
  if (h.hairstyle === 'bob') assert.equal(h['hair length'], 'short', c.name + ' 보브는 짧은 머리');
  if (h.hairstyle === 'side-shaved long hair') assert(['long', 'very long'].includes(h['hair length']), c.name + ' 한쪽 민 긴 머리는 길게');
  if (h.hairstyle === 'hime cut') assert.equal(h.bangs, 'straight bangs', c.name + ' 히메컷은 일자 앞머리');
  if (HR.bangs[h.hairstyle]) assert(HR.bangs[h.hairstyle].includes(h.bangs), c.name + ' ' + h.hairstyle + ' 에 맞지 않는 앞머리');
}
const N = cards.length, cap = s => Math.max(Math.floor((s === 'bob' ? HR.bobCap : HR.cap) * N), lockedCount[s] || 0);
assert(HR.cap <= 0.08 && HR.bobCap <= 0.04, '상한 8% · 보브 4%');
for (const [s, k] of Object.entries(count)) assert(k <= cap(s), '헤어스타일 ' + s + ' ' + k + '종 — 상한 ' + cap(s));
assert(Object.keys(count).length >= 30, '헤어스타일이 몇 가지로 몰렸다: ' + Object.keys(count).length);
const hairOf = n => F[byName[n].no];
for (const c of cards) if (c.from && byName[c.from] && !(hairOf(c.from).hair_locked && F[c.no].hair_locked))
  assert(edgeOk(hairOf(c.from).hair, F[c.no].hair), '계열 잇기: ' + c.from + ' ' + triple(hairOf(c.from).hair) + ' → ' + c.name + ' ' + triple(F[c.no].hair));
for (const ms of Object.values(lines)) for (let i = 0; i < ms.length; i++) for (let j = i + 1; j < ms.length; j++) {
  const a = F[ms[i]], b = F[ms[j]];
  if (!(a.hair_locked && b.hair_locked) && a.hair.hairstyle) assert(triple(a.hair) !== triple(b.hair), '같은 계열 머리가 똑같다: ' + a.name + '·' + b.name);
}
const dex = [...cards].sort((a, b) => a.no - b.no);
for (let i = 1; i < dex.length; i++) {
  const a = F[dex[i - 1].no], b = F[dex[i].no];
  if (root[a.name] === root[b.name] || (a.hair_locked && b.hair_locked) || !a.hair.hairstyle) continue;
  assert.notEqual(a.hair.hairstyle, b.hair.hairstyle, '도감 옆 번호 다른 계열인데 헤어스타일이 같다: ' + a.name + '·' + b.name);
}
/* 잠근 값 = 그림 기록 — 기록 저장소가 옆에 받아져 있을 때만 본다(읽기만) */
let checkedRecords = 0;
for (const c of cards) {
  const f = F[c.no], r = f.hair_record;
  if (!f.hair_locked || !r) continue;
  const path = require('node:path').join('..', r.path);
  if (!fs.existsSync(path)) continue;
  const text = fs.readFileSync(path, 'utf8');
  for (const [k, v] of Object.entries(r.raw)) assert(text.includes(k + ': ' + v) || text.includes(JSON.stringify(k) + ': ' + JSON.stringify(v)), c.name + ' 기록 ' + r.path + ' 에 ' + k + ': ' + v + ' 가 없다');
  if (r.raw.hairstyle && hopt.hairstyle.includes(r.raw.hairstyle)) assert.equal(f.hair.hairstyle, r.raw.hairstyle, c.name + ' 잠근 헤어스타일이 기록과 다르다');
  if (r.raw['hair length'] && hopt['hair length'].includes(r.raw['hair length'])) assert.equal(f.hair['hair length'], r.raw['hair length'], c.name + ' 잠근 길이가 기록과 다르다');
  if (r.raw.bangs && hopt.bangs.includes(r.raw.bangs)) assert.equal(f.hair.bangs, r.raw.bangs, c.name + ' 잠근 앞머리가 기록과 다르다');
  checkedRecords++;
}

/* 4. HAIR 줄 — 새 인물에만, FACE 바로 뒤. 직접 고른 머리 항목이 이긴다 */
const hb = t => t.split('\n\n').find(x => x.startsWith('HAIR: '));
const free = cards.find(c => !F[c.no].hair_locked && F[c.no].hair['hair length'] && !S.HAIR_LENGTH_LIMITS[F[c.no].hair.hairstyle] && F[c.no].hair.bangs !== 'none');
const fh = F[free.no].hair, ft = P.buildPrompt(input(free.name));
assert.equal(hb(ft), 'HAIR: ' + fh['hair length'] + ' ' + fh.hairstyle + ', ' + fh.bangs + '.', '새 인물에 HAIR 줄');
assert(ft.indexOf('\n\nHAIR: ') > ft.indexOf('FACE (') && ft.indexOf('\n\nHAIR: ') < ft.indexOf('FORM —'), 'HAIR 는 FACE 뒤, FORM 앞');
assert(!ft.includes('\nhairstyle: '), '설계 머리는 IDENTITY 로 가지 않는다');
for (const [why, extra] of [['이어가기', { identityMode: 'reference', form: 'heavy' }], ['개방', { form: 'overdrive', baseForm: 'light' }], ['끔', { faceDesignOn: false }], ['자료 없음', { faceDesign: null }],
  ['헤어스타일을 고름', { params: [['hairstyle', 'locs']] }]])
  assert(!P.buildPrompt(input(free.name, extra)).includes('\n\nHAIR: '), why + '에 HAIR 줄이 실렸다');
assert(!L.buildSingle(input(free.name, { cat: 'everyday_basic' })).includes('HAIR: '), '일상에 HAIR 줄');
const mineLen = P.buildPrompt(input(free.name, { params: [['hair length', 'very short']] }));
assert.equal(hb(mineLen), 'HAIR: ' + fh.bangs + '.', '길이를 고르면 컷과 길이가 빠지고 앞머리만 남는다');
assert(mineLen.includes('hair length: very short'), '고른 길이는 IDENTITY 로');
const mineBangs = P.buildPrompt(input(free.name, { params: [['bangs', 'none']] }));
assert.equal(hb(mineBangs), 'HAIR: ' + fh['hair length'] + ' ' + fh.hairstyle + '.', '앞머리를 고르면 앞머리만 빠진다');
assert(!P.buildPrompt(input(free.name, { params: HK.map(k => [k, hopt[k][0]]) })).includes('\n\nHAIR: '), '머리를 다 고르면 HAIR 줄 없음');
const pixie = cards.find(c => !F[c.no].hair_locked && S.HAIR_LENGTH_LIMITS[F[c.no].hair.hairstyle]);
assert(hb(P.buildPrompt(input(pixie.name))).startsWith('HAIR: ' + F[pixie.no].hair.hairstyle + ','), '길이가 고정된 컷은 길이를 안 적는다');
const empty = cards.find(c => F[c.no].hair_locked && !Object.keys(F[c.no].hair).length);
assert(empty && !P.buildPrompt(input(empty.name)).includes('\n\nHAIR: '), '기록에 머리가 없는 확정 종은 HAIR 줄 없음');
const lockedOne = cards.find(c => F[c.no].hair_locked && F[c.no].hair.hairstyle);
assert(hb(P.buildPrompt(input(lockedOne.name))).includes(F[lockedOne.no].hair.hairstyle), '잠근 종은 기록값으로 HAIR 줄');

/* 5. 1025종 — 문서 줄 = 엔진 줄, 예산, 깨진 값 없음 */
let most = [0, ''];
for (const c of cards) {
  const t = P.buildPrompt(input(c.name)), f = block(t), hl = hb(t);
  assert(f && !/undefined|\[object|\{\w+\}/.test(t), c.en);
  assert(doc.includes('```text\n' + f + '\n```'), '문서의 FACE 줄이 생성기와 다르다: ' + c.name);
  assert.equal(!!hl, Object.keys(F[c.no].hair).length > 0, c.name + ' HAIR 줄 유무');
  if (hl) assert(doc.includes('```text\n' + hl + '\n```'), '문서의 HAIR 줄이 생성기와 다르다: ' + c.name);
  const w = P.words(t); if (w > most[0]) most = [w, c.en];
}
assert(most[0] <= 440, '얼굴·머리 줄을 더한 앵커 예산: ' + most.join(' '));
const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s, k]) => s + ' ' + k).join(', ');
console.log(`PASS 얼굴 설계: 1025종 서로 다름 · 계열 ${Object.values(lines).filter(x => x.length > 1).length}개 ${pairs}쌍 셋 이상 다름 · 전체 둘 이상 다름 · 새 인물에만 FACE · 직접 고른 항목 우선 · 문서=엔진 · 최대 ${most[0]}낱말(${most[1]})`);
console.log(`PASS 머리 설계: 헤어스타일 ${Object.keys(count).length}가지(많은 순 ${top}) · 8%·보브 4% 상한 · 계열 잇기 · 옆 번호 다름 · 잠금 ${locked}(기록값 ${lockedWith}, 기록 대조 ${checkedRecords}) · 새 인물에만 HAIR · 직접 고른 머리 우선`);
