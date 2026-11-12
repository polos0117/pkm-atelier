/* 종별 얼굴 설계 — 자료 규칙과 생성기 연결. node tests/face-design.cjs
   - data/face-design.json: 1025종, 값은 생성기 얼굴 항목 그대로, 같은 얼굴 없음, 같은 계열끼리 다섯 묶음 중 셋 이상·전체 어느 둘도 둘 이상 다르다
   - 새 인물(경장 ①)에만 FACE 줄 — 이어가기·개방·일상·끈 경우엔 없다. 직접 고른 얼굴 항목은 FACE 줄에서 빠진다
   - 문서(docs/CHARACTER_FACE_DESIGNS.md)의 FACE 줄이 생성기가 실제로 만드는 줄과 글자까지 같다(도구와 엔진이 따로 놀지 않게) */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['prompt-spec', 'figures', 'toolkit', 'casual-tree', 'casual-tree-v2', 'prompt-anthro', 'prompt-lifestyle'])
  vm.runInContext(fs.readFileSync('lib/' + f + '.js', 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L } = ctx.window;
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const cards = read('data/card.json').cards.character, app = read('data/source-appearance.json').entries;
const img = read('data/img.json').img, data = read('data/face-design.json'), F = data.faces;
const doc = fs.readFileSync('docs/CHARACTER_FACE_DESIGNS.md', 'utf8');
/* 일상컷은 트리 길로(2026-10-29 — 옛 갈래 cat 은 없어졌다) · 버전2 장면(2026-10-30 기본)도 */
const tree = read('data/casual-tree.json'), tree2 = read('data/casual-tree-v2.json');
const CASUAL = { tree, era: 'now', place: 'home_living', act: tree.activities.find(a => (a.places || []).includes('home_living')).key, ofam: 'everyday' };
const CASUAL2 = { tree, tree2, treeV: 2, era: 'now', place: 'home_living', ofam: 'everyday', posture: 'stand', support: 'none', frame: 'waist_up', body: 'front', head: 'with_body', camera: 'eye' };
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
  /* 그림은 날마다 올라온다 — build 뒤에 등록된 종은 다음 build(tools/face-design.py build)까지 registered 가 거짓이어도 된다. 거꾸로는 틀렸다 */
  if (f.registered) assert(img[c.name], c.name + ' registered 인데 img.json 에 없다');
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
/* 줄 꼴로 본다(칸 꼴 스위치를 끈 판) — FACE · HAIR · IMPRESSION 문단의 자리와 글, 문서(docs/CHARACTER_FACE_DESIGNS.md)의 FACE · HAIR 줄이 이 꼴이다.
   실제로 나가는 칸 꼴(2026-11-11)에서 같은 줄이 2칸에 그대로 있는지는 아래 「2-2. 칸 꼴」 */
const build = st => P.buildPrompt(st, { sections: false });
const block = t => t.split('\n\n').find(x => x.startsWith('FACE ('));
const sq = build(input('꼬부기'));
assert(block(sq), '새 인물에는 FACE 줄');
assert(sq.indexOf('FACE (') > sq.indexOf('WEAR') && sq.indexOf('FACE (') < sq.indexOf('FORM —'), 'FACE 는 WEAR 뒤, FORM 앞');
for (const k of S.FACE_KEYS) assert(block(sq).includes(F[card('꼬부기').no].face[k].replace(/ eyes$| eye spacing$/, '').replace(/^large$/, 'open rounded')), 'FACE 줄에 ' + k);
for (const [why, extra] of [['이어가기', { identityMode: 'reference', form: 'heavy' }], ['개방', { form: 'overdrive', baseForm: 'light' }], ['끔', { faceDesignOn: false }], ['자료 없음', { faceDesign: null }]])
  assert(!build(input('꼬부기', extra)).includes('FACE ('), why + '에 FACE 줄이 실렸다');
for (const sc of [CASUAL, CASUAL2]) assert(!L.buildSingle(input('꼬부기', { ...sc, outputMode: 'casual', identityMode: 'reference' })).includes('FACE ('), '일상에 FACE 줄' + (sc.treeV ? '(버전2)' : ''));
/* 직접 고른 얼굴 항목은 그 항목만 FACE 에서 빠지고 IDENTITY 가 쥔다 */
const mine = build(input('꼬부기', { params: [['lips', 'wide mouth'], ['eyebrows', 'thick low brows']] }));
const own = F[card('꼬부기').no].face;
assert(mine.includes('lips: wide mouth') && mine.includes('eyebrows: thick low brows'), '직접 고른 값은 IDENTITY 로');
assert(!block(mine).includes(own.lips) || own.lips === 'wide mouth', '고른 입술이 FACE 에 남았다');
assert(!block(mine).includes(own.eyebrows) || own.eyebrows === 'thick low brows', '고른 눈썹이 FACE 에 남았다');
assert(block(mine).includes(own['face shape']), '안 고른 항목은 남는다');
/* 얼굴 항목을 다 고르면 FACE 줄이 없다 */
assert(!build(input('꼬부기', { params: S.FACE_KEYS.map(k => [k, opts[k][0]]) })).includes('FACE ('), '다 고르면 FACE 줄 없음');

/* 2-0. 긴 얼굴은 「살짝」(2026-11-09 사용자 「너무 긴 얼굴은 길이를 좀 줄이자」) — 자료 값은 그대로, FACE 줄 낱말만 누그러뜨리고 늘어나지 않게 */
{
  /* 설계표도(2026-11-09 「설계표도 다시 짜줘」) — 길쭉한 얼굴형 · 긴 길이 · 긴 턱끝 · 좁은 폭 가운데 둘까지 */
  const longN = t => (t['face shape'] === 'elongated') + (t['face length'] === 'long') + (t['jaw & chin'] === 'long chin with defined jaw') + (t['face width'] === 'narrow');
  const over = cards.filter(c => longN(F[c.no].face) > 2).map(c => c.name);
  assert.deepEqual(over, [], '긴 얼굴 특징 셋 이상: ' + over.slice(0, 10).join(' '));
  const lf = cards.find(c => F[c.no].face['face shape'] === 'elongated' && F[c.no].face['face length'] === 'long');
  const b = block(build(input(lf.name)));
  assert(b.includes('softly elongated face, slightly long length') && b.includes(S.FACE_LONG_NOTE), lf.name + ' 긴 얼굴 누그러뜨림: ' + b);
  const lc = cards.find(c => F[c.no].face['jaw & chin'] === 'long chin with defined jaw');
  assert(block(build(input(lc.name))).includes('defined jaw with a slightly longer chin'), lc.name + ' 긴 턱끝 누그러뜨림');
  assert(!/(^|[^y] )elongated face|, long length|long chin with defined jaw/.test(b), lf.name + ' 날것 낱말이 남았다');
  assert(!block(sq).includes(S.FACE_LONG_NOTE), '긴 얼굴이 아니면 덧말 없음');
}

/* 2-1. 인상(2026-11-09 — 사용자 「pkm쪽 얼굴 느낌을 지금보다 다양화」 → 「인상은 자동으로」) — 나이감 · 분위기 · 눈 색. 전신 카드에서도 보이는 차이
   - 1025종 모두, 값은 생성기 표(IMPRESSION_AGES · IMPRESSION_VIBES), 한 분위기 12% 상한, 분위기는 열 가지 넘게 쓰인다
   - 새 인물(경장 ①)에만 HAIR 뒤 IMPRESSION 줄 — 이어가기 · 개방 · 일상 · 끈 경우엔 없다. 눈 색을 직접 고르면 눈 색만 빠진다 */
{
  const vc = {};
  for (const c of cards) {
    const m = F[c.no].impression; assert(m, c.name + ' 인상 없음');
    assert(S.IMPRESSION_AGES[m.age] && S.IMPRESSION_VIBES[m.vibe] && m.eyes, c.name + ' 인상 값 ' + JSON.stringify(m));
    vc[m.vibe] = (vc[m.vibe] || 0) + 1;
  }
  assert(Object.values(vc).every(n => n <= Math.floor(cards.length * 0.12)), '한 분위기 12% 상한 ' + JSON.stringify(vc));
  assert((vc.fierce || 0) <= Math.floor(cards.length * 0.04), '사나움 4% 상한(2026-11-09 「사나움을 많이 줄여줘」) ' + vc.fierce);
  assert(Object.keys(vc).length >= 10, '분위기가 고루 쓰인다 ' + Object.keys(vc).length);
  const sqm = F[card('꼬부기').no].impression, v = S.IMPRESSION_VIBES[sqm.vibe];
  const ib = t => t.split('\n\n').find(x => x.startsWith('IMPRESSION ('));
  assert(ib(sq) && ib(sq).includes(v[1]) && ib(sq).includes(S.IMPRESSION_AGES[sqm.age][1]) && ib(sq).includes(sqm.eyes + ' eyes') && ib(sq).includes(v[3]), '새 인물에 IMPRESSION 줄: ' + ib(sq));
  assert(/^IMPRESSION \(reads even at card size\): an? /.test(ib(sq)), '관사');
  const paras = sq.split('\n\n'), fi = paras.findIndex(x => x.startsWith('FACE (')), ii = paras.findIndex(x => x.startsWith('IMPRESSION ('));
  assert(ii > fi && ii <= fi + 2, 'IMPRESSION 은 FACE · HAIR 바로 뒤');
  for (const [why, extra] of [['이어가기', { identityMode: 'reference', form: 'heavy' }], ['개방', { form: 'overdrive', baseForm: 'light' }], ['끔', { faceDesignOn: false }], ['자료 없음', { faceDesign: null }]])
    assert(!build(input('꼬부기', extra)).includes('IMPRESSION ('), why + '에 IMPRESSION 줄이 실렸다');
  for (const sc of [CASUAL, CASUAL2]) assert(!L.buildSingle(input('꼬부기', { ...sc, outputMode: 'casual', identityMode: 'reference' })).includes('IMPRESSION ('), '일상에 IMPRESSION 줄');
  const eyeMine = build(input('꼬부기', { params: [['eye color', 'gold']] }));
  assert(ib(eyeMine) && !ib(eyeMine).includes(sqm.eyes + ' eyes') && ib(eyeMine).includes(v[2]), '눈 색을 고르면 눈 색만 빠진다');
  assert(doc.includes('| 인상 | '), '문서에 인상 칸');
}

/* 3. 머리 — 종마다 헤어스타일·길이·앞머리. 생성기가 스스로 고르면 보브·웨이브 몇 가지로 몰렸다(2026-10-20)
   - 값은 생성기 열쇠, 여성 인물이라 남성 전용 값 없음, 길이는 컷에 맞음(HAIR_LENGTH_LIMITS)
   - 한 헤어스타일 4% · 보브 3% 를 넘지 않는다(2026-11-12 머리 34가지를 더하며 8% · 4% 에서)(확정 그림이 이미 넘으면 그 수까지 — 새로 고르지 않는다)
   - 진화 한 걸음마다 같은 묶음에서 길이가 줄지 않거나, 이어지는 묶음으로 더 공들인 쪽 · 계열 안 두 종이 똑같지 않다 · 도감 옆 번호의 다른 계열과 헤어스타일이 다르다
   - 경장 ①이 등록된 종은 그림 기록의 값으로 잠근다 */
assert.deepEqual([...S.HAIR_KEYS], ['hairstyle', 'hair length', 'bangs'], 'HAIR_KEYS');
const HR = data.rules.hair, HK = S.HAIR_KEYS, LEN = HR.lengths;
const hopt = Object.fromEntries(HK.map(k => [k, S.PARAM_DEFS.find(d => d.key === k).options.map(o => o[0]).filter(v => v && v !== '__custom__')]));
const male = k => Object.entries(S.ONLY[k] || {}).filter(([, s]) => s === 'male').map(([v]) => v);
for (const v of ['buzz cut', 'crew cut', 'fade', 'man bun', 'mullet']) assert(male('hairstyle').includes(v), '남성 전용 표에 ' + v);
const lightReg = new Set(Object.entries(img).filter(([, v]) => { const s = (v.byStyle || {})[S.DEFAULT_STYLE]; return s && s.byForm && s.byForm.light; }).map(([n]) => n));   /* 잠금은 기본 화풍 그림만(2026-11-12) */
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
assert(HR.cap <= 0.04 && HR.bobCap <= 0.03, '상한 4% · 보브 3%');
for (const [s, k] of Object.entries(count)) assert(k <= cap(s), '헤어스타일 ' + s + ' ' + k + '종 — 상한 ' + cap(s));
assert(Object.keys(count).length >= 30, '헤어스타일이 몇 가지로 몰렸다: ' + Object.keys(count).length);
/* 여성 헤어스타일은 새로 더한 것(아프로·브레이드 …)까지 모두 배정된다 — 적게 쓰인 머리 채우기(2026-10-27) */
for (const v of hopt.hairstyle) if (!male('hairstyle').includes(v)) assert(count[v] > 0, '배정되지 않은 여성 헤어스타일 ' + v);
for (const v of ['afro', 'afro puffs', 'box braids', 'cornrows', 'fishtail braid', 'beach waves', 'shaggy']) assert(hopt.hairstyle.includes(v) && !male('hairstyle').includes(v), '여성 머리 ' + v);
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
const fh = F[free.no].hair, ft = build(input(free.name));
assert.equal(hb(ft), 'HAIR: ' + fh['hair length'] + ' ' + fh.hairstyle + (S.HAIR_BOLD[fh.hairstyle] ? ' (' + S.HAIR_BOLD[fh.hairstyle] + ')' : '') + ', ' + fh.bangs + '.', '새 인물에 HAIR 줄');
assert(ft.indexOf('\n\nHAIR: ') > ft.indexOf('FACE (') && ft.indexOf('\n\nHAIR: ') < ft.indexOf('FORM —'), 'HAIR 는 FACE 뒤, FORM 앞');
assert(!ft.includes('\nhairstyle: '), '설계 머리는 IDENTITY 로 가지 않는다');
for (const [why, extra] of [['이어가기', { identityMode: 'reference', form: 'heavy' }], ['개방', { form: 'overdrive', baseForm: 'light' }], ['끔', { faceDesignOn: false }], ['자료 없음', { faceDesign: null }],
  ['헤어스타일을 고름', { params: [['hairstyle', 'locs']] }]])
  assert(!build(input(free.name, extra)).includes('\n\nHAIR: '), why + '에 HAIR 줄이 실렸다');
for (const sc of [CASUAL, CASUAL2]) assert(!L.buildSingle(input(free.name, { ...sc, outputMode: 'casual', identityMode: 'reference' })).includes('HAIR: '), '일상에 HAIR 줄' + (sc.treeV ? '(버전2)' : ''));
const mineLen = build(input(free.name, { params: [['hair length', 'very short']] }));
assert.equal(hb(mineLen), 'HAIR: ' + fh.bangs + '.', '길이를 고르면 컷과 길이가 빠지고 앞머리만 남는다');
assert(mineLen.includes('hair length: very short'), '고른 길이는 IDENTITY 로');
const mineBangs = build(input(free.name, { params: [['bangs', 'none']] }));
assert.equal(hb(mineBangs), 'HAIR: ' + fh['hair length'] + ' ' + fh.hairstyle + (S.HAIR_BOLD[fh.hairstyle] ? ' (' + S.HAIR_BOLD[fh.hairstyle] + ')' : '') + '.', '앞머리를 고르면 앞머리만 빠진다');
assert(!build(input(free.name, { params: HK.map(k => [k, hopt[k][0]]) })).includes('\n\nHAIR: '), '머리를 다 고르면 HAIR 줄 없음');
const pixie = cards.find(c => !F[c.no].hair_locked && S.HAIR_LENGTH_LIMITS[F[c.no].hair.hairstyle]);
assert(hb(build(input(pixie.name))).startsWith('HAIR: ' + F[pixie.no].hair.hairstyle + (S.HAIR_BOLD[F[pixie.no].hair.hairstyle] ? ' (' : ',')), '길이가 고정된 컷은 길이를 안 적는다');
const empty = cards.find(c => F[c.no].hair_locked && !Object.keys(F[c.no].hair).length);
assert(empty && !build(input(empty.name)).includes('\n\nHAIR: '), '기록에 머리가 없는 확정 종은 HAIR 줄 없음');
const lockedOne = cards.find(c => F[c.no].hair_locked && F[c.no].hair.hairstyle);
assert(hb(build(input(lockedOne.name))).includes(F[lockedOne.no].hair.hairstyle), '잠근 종은 기록값으로 HAIR 줄');

/* 5. 1025종 — 문서 줄 = 엔진 줄, 예산, 깨진 값 없음 */
let most = [0, ''];
for (const c of cards) {
  const t = build(input(c.name)), f = block(t), hl = hb(t);
  assert(f && !/undefined|\[object|\{\w+\}/.test(t), c.en);
  assert(doc.includes('```text\n' + f + '\n```'), '문서의 FACE 줄이 생성기와 다르다: ' + c.name);
  assert.equal(!!hl, Object.keys(F[c.no].hair).length > 0, c.name + ' HAIR 줄 유무');
  if (hl) assert(doc.includes('```text\n' + hl + '\n```'), '문서의 HAIR 줄이 생성기와 다르다: ' + c.name);
  const w = P.words(t); if (w > most[0]) most = [w, c.en];
}
// BODY 줄(2026-10-27, 약 40낱말)로 440 → 460 · 카메라 수평 3/4 줄(2026-11-06, 약 20낱말 늘었다)로 460 → 480 · 경장 폼 줄 「몸을 가늘게 하지 않는다」(2026-11-07, +7)로 480 → 490 · ANATOMY 7.5등신(+14)로 → 505
assert(most[0] <= 680, '얼굴·머리 줄을 더한 앵커 예산: ' + most.join(' '));   // 2026-11-09 +30 — IMPRESSION 줄 · 2026-11-08 +105 — 경장 판 · ARMOR 줄 · 2026-11-08 +30 — 메카 노출 줄(두 곳만 열린 장갑)

/* 6. 칸 꼴(2026-11-11 — 실제로 나가는 지시문) — 줄 꼴의 FACE · HAIR · HAIR COLOR · IMPRESSION 문단이 2칸에 한 줄씩 글 그대로(줄 머리만 Face — · Hair · Hair color · Impression),
   차례도 그대로. 1칸 화풍 문장의 「FACE line」 은 「Face line」(얼굴 줄이 없으면 「her own face」). 이어가기 · 개방 · 끔 · 자료 없음에는 셋 다 없다 */
const SE = S.SECTIONS, CF = S.CORE_FRAME;
const toSec = l => l.replace(/^FACE \(([^)]*)\): /, 'Face — $1: ').replace(/^HAIR COLOR: /, 'Hair color: ').replace(/^HAIR: /, 'Hair: ').replace(/^IMPRESSION /, 'Impression ');
const LOOK = /^(?:FACE \(|HAIR: |HAIR COLOR: |IMPRESSION \()/;
let secN = 0;
for (const c of cards) {
  const old = build(input(c.name)), t = P.buildPrompt(input(c.name)), B = t.split('\n\n'), b2 = B[2].split('\n');
  const want = old.split('\n\n').filter(x => LOOK.test(x)).map(toSec);
  assert(B.length === 6 && b2[0] === CF.s2 && want.length >= 2, c.name + ' 칸 꼴 2칸');
  const at = want.map(x => b2.indexOf(x));
  assert(at.every(i => i > 0) && at.every((i, k) => !k || i > at[k - 1]), c.name + ' 칸 꼴 2칸에 얼굴 · 머리 · 인상 줄이 글 그대로 · 차례대로: ' + want.filter((x, k) => at[k] < 0).join(' | '));
  assert(!t.includes('FACE line') && (!old.includes(SE.faceRef.from) || B[1].includes(SE.faceRef.line)), c.name + ' 1칸 — 얼굴 줄은 아래 Face 줄');
  assert(!/(?:^|\n)(?:FACE \(|HAIR: |IMPRESSION \()/.test(t), c.name + ' 칸 꼴에 줄 꼴 머리');
  secN++;
}
{ const t = P.buildPrompt(input(free.name, { style: 'anime_25d_gloss' }));
  assert(t.split('\n\n')[1].includes(SE.faceRef.line) && /\nFace — /.test(t), '기본 화풍 1칸 — 얼굴 줄이 있으면 「her own Face line below」'); }
for (const [why, extra] of [['이어가기', { identityMode: 'reference', form: 'heavy' }], ['개방', { form: 'overdrive', baseForm: 'light' }], ['끔', { faceDesignOn: false }], ['자료 없음', { faceDesign: null }]]) {
  const t = P.buildPrompt(input(free.name, { ...extra, style: 'anime_25d_gloss' }));   /* 「drawn to her own FACE line below」 를 가진 화풍(기본) */
  assert(t.includes('\n\n' + CF.s2 + '\n') && !/\n(?:Face — |Hair: |Impression \()/.test(t) && !t.includes(SE.faceRef.line) && t.split('\n\n')[1].includes(SE.faceRef.none), why + '에 칸 꼴 얼굴 · 머리 · 인상 줄이 실렸다');
}
const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([s, k]) => s + ' ' + k).join(', ');
console.log(`PASS 얼굴 설계: 1025종 서로 다름 · 계열 ${Object.values(lines).filter(x => x.length > 1).length}개 ${pairs}쌍 셋 이상 다름 · 전체 둘 이상 다름 · 새 인물에만 FACE · 직접 고른 항목 우선 · 문서=엔진 · 칸 꼴 2칸에 같은 줄 ${secN}종 · 최대 ${most[0]}낱말(${most[1]})`);
console.log(`PASS 머리 설계: 헤어스타일 ${Object.keys(count).length}가지(많은 순 ${top}) · 4%·보브 3% 상한 · 계열 잇기 · 옆 번호 다름 · 잠금 ${locked}(기록값 ${lockedWith}, 기록 대조 ${checkedRecords}) · 새 인물에만 HAIR · 직접 고른 머리 우선`);
