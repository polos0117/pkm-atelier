/* 진화 결투를 화면 없이 굴린다 — 규칙·AI·보상이 맞물리는지 보는 검사이고, --quick 없이 돌리면 297판 균형 보고.
   Run: node tests/lane-sim.cjs [--quick] */
const fs = require('node:fs'), assert = require('node:assert/strict');
const C = require('../lib/collection.js');
const quick = process.argv.includes('--quick');
const J = n => JSON.parse(fs.readFileSync('data/' + n + '.json', 'utf8'));
const card = J('card'), chart = J('chart'), img = J('img');
/* 규칙 검사는 그림 유무를 무시한다 — allowAll. 풀 문턱은 따로 본다 */
const data = { cards: card.cards.character, chart: chart.chart, group: J('group'), label: J('label'), img: img.img || {}, lane: J('lane'), allowAll: true };
const real = { ...data, allowAll: false };
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const by = C.byName(data);

/* ── 풀·계통 ── */
ok(C.pool(data).length === 1025, '풀(allowAll)은 전부');
ok(C.pool(real).length < 1025 && C.pool(real).every(x => by[x]), '진짜 풀은 그림 있는 카드만');
ok(C.bst(by['이상해씨']) === 318 && C.bst(by['뮤츠']) === 680, '종족값 합');
const L = C.lineOf(data, '이상해풀');
ok(L.root === '이상해씨' && L.names.join() === '이상해씨,이상해풀,이상해꽃', '계통은 앞뒤 다');
ok(C.lineOf(data, '이브이').names.length === 9 && C.lineOf(data, '쥬피썬더').root === '이브이', '분기 계통도 하나');
ok(C.lineOf(data, '뮤츠').names.join() === '뮤츠', '혼자인 카드');
for (const c of data.cards) ok(C.lineOf(data, c.name).names.includes(c.name), c.name + ' 계통에 자기가 있다');

/* ── 프로필 ── */
ok(C.canPickGen(data, 1).ok && C.canPickGen(data, 1).need === 0, '세대 1 고를 수 있다');
ok(!C.canPickGen(real, 1).ok && C.canPickGen(real, 1).need > 0, '진짜 풀에선 모자란다 — n장 더');
const p = C.newProfile(data, 1, 7);
ok(p.owned.length === 25 && C.deckOf(p, 'lane').length === 25, '시작 컬렉션 25 = 시작 덱');
ok(p.owned.filter(x => by[x].gen === 1).length === 17 && p.owned.every(x => !by[x].rare), '주 세대 17 · 비전설');
ok(p.owned.filter(x => by[x].gen !== 1).length === 8, '다른 세대 8');
{ /* 계통 단위 — 주 세대 17장 가운데 계통이 통째로 들어간 것이 있다 */
  const mine = p.owned.filter(x => by[x].gen === 1), whole = mine.filter(x => { const l = C.lineOf(data, x).names; return l.length > 1 && l.every(y => mine.includes(y)); });
  ok(whole.length >= 2, '계통이 통째로: ' + whole.join());
}
ok(JSON.stringify(C.newProfile(data, 1, 7)) === JSON.stringify(p), '같은 시드 같은 프로필');
ok(p.gold === 0 && Array.isArray(p.shop.stock) && p.stats.lane.games === 0 && p.level === 'rookie', '금 0 · 상점 그릇 · 빈 통계 · 신참');
{ const old = C.upgradeProfile({ main: 2, owned: ['피카츄'], deck: ['피카츄'] }, data);
  ok(old.decks.lane.join() === '피카츄' && old.stats.lane.games === 0 && old.gold === 0 && old.beaten && old.v === C.VERSION, '옛 저장(deck 하나·stats 없음)도 올린다'); }
ok(C.deckOf(p, 'gwent').length === 0 && Array.isArray(p.decks.gwent), 'deckOf 는 없는 놀이의 덱을 만들어 준다');
C.setDeck(p, 'lane', p.owned.slice(0, 3)); ok(C.deckOf(p, 'lane').length === 3, 'setDeck');
ok(C.winsOf(p, 1) === 0 && !C.conquered(data, p), '아직 정복 아님');
p.beaten = {}; for (const ch of data.lane.champions) p.beaten[ch.gen] = { rookie: 1 };
ok(C.conquered(data, p), '아홉을 다 이기면 정복');

console.log('PASS 결투 규칙: ' + n + ' 가지');
