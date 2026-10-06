/* 진화 결투를 화면 없이 굴린다 — 규칙·AI·보상이 맞물리는지 보는 검사이고, --quick 없이 돌리면 297판 균형 보고.
   Run: node tests/lane-sim.cjs [--quick] */
const fs = require('node:fs'), assert = require('node:assert/strict');
const C = require('../lib/collection.js');
const A = require('../lib/lane.js');
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

/* ── 보상 뒷장 ── */
{
  const pr = C.newProfile(data, 1, 11), rng = { rngState: 5 };
  pr.owned = ['이상해씨', '파이리', '꼬부기', '뮤츠']; pr.decks.lane = pr.owned.slice();
  const pool1 = C.buildRewardPool(data, rng, pr, 1, 'rookie');
  ok(pool1.length === 5 && new Set(pool1).size === 5 && pool1.every(x => !pr.owned.includes(x)), '뒷장 5장, 서로 다르고 아직 없는 카드');
  ok(['이상해풀', '리자드', '어니부기'].includes(pool1[0]) && ['이상해풀', '리자드', '어니부기'].includes(pool1[1]), '앞 2장은 내 계통의 빈 단계: ' + pool1.slice(0, 2).join());
  ok(pool1.every(x => by[x].gen === 1), '그 챔피언의 세대 먼저');
  ok(pool1.slice(2).every(x => !by[x].rare), '신참은 전설 없음');
  { /* 난이도별 전설 비율 — 120판 */
    const cnt = { rookie: 0, veteran: 0, ace: 0 };
    for (const lv of C.LEVELS) for (let s = 0; s < 120; s++) { const r = { rngState: s * 31 + 7 }, q = C.newProfile(data, 3, s); cnt[lv] += C.buildRewardPool(data, r, q, 3, lv).filter(x => by[x].rare).length; }
    ok(cnt.rookie === 0 && cnt.veteran > 0 && cnt.ace > cnt.veteran * 2, '전설 — 신참 0 · 숙련 조금 · 에이스 많이: ' + JSON.stringify(cnt));
  }
  { /* 세대가 다 차면 다른 세대 */
    const q = C.newProfile(data, 1, 3); q.owned = C.genCards(data, 1, false).concat(C.genCards(data, 1, true));
    const r = C.buildRewardPool(data, { rngState: 1 }, q, 1, 'rookie');
    ok(r.length === 5 && r.every(x => by[x].gen !== 1), '1세대를 다 가지면 다른 세대에서');
  }
  { /* 진짜 풀 안에서만 */
    const q = C.newProfile(data, 1, 3); q.owned = [];
    const r = C.buildRewardPool(real, { rngState: 1 }, q, 1, 'ace');
    ok(r.every(x => C.inPool(real, x)), '진짜 풀 안에서만: ' + r.join());
  }
  const o = { pool: pool1, picks: 3, taken: [] };
  ok(C.pickReward(pr, o, 1).ok && pr.owned.includes(pool1[1]) && o.taken.join() === '1', '뒤집으면 내 것');
  ok(!C.pickReward(pr, o, 1).ok && C.pickReward(pr, o, 9).why === 'index', '같은 자리·없는 자리는 안 됨');
  const got = C.finishRewards({ rngState: 2 }, pr, o);
  ok(got.length === 2 && o.taken.length === 3 && pr.owned.length === 4 + 3, '남은 몫은 자동으로');
  ok(!C.pickReward(pr, o, 0).ok, '다 뒤집었으면 끝');
}
/* ── 금·상점 ── */
{
  const pr = C.newProfile(data, 1, 5);
  ok(C.goldFor('rookie', true) === 10 && C.goldFor('ace', true) === 35 && C.goldFor('veteran', false) === 3, '금');
  ok(C.shopPrice(data, '약어리') === 15 && C.shopPrice(data, '캐터피') === 16 && C.shopPrice(data, '뮤츠') === 29 + 20 && C.shopPrice(data, '이상해꽃') === 25, '값 15~30, 전설 +20: ' + [C.shopPrice(data, '캐터피'), C.shopPrice(data, '뮤츠'), C.shopPrice(data, '이상해꽃')].join());
  ok(pr.shop.stock.length === 6 && pr.shop.stock.every(s => s && !pr.owned.includes(s.id) && s.price > 0 && !s.bought), '진열 6, 없는 카드, 값표');
  { let rare = 0, all = 0; for (let s = 0; s < 300; s++) { const q = C.newProfile(data, 2, s); for (const sl of q.shop.stock) { all++; if (sl.rare) { rare++; ok(by[sl.id].rare || C.bst(by[sl.id]) >= 500, '희귀 자리는 전설이거나 500 이상'); } } }
    ok(rare / all > 0.1 && rare / all < 0.2, '희귀 자리 15% 쯤: ' + (rare / all).toFixed(2)); }
  ok(C.shopBuy(data, pr, 0).why === 'gold', '0금엔 못 산다');
  pr.gold = 200; const first = pr.shop.stock[0].id, price = pr.shop.stock[0].price;
  ok(C.shopBuy(data, pr, 0).id === first && pr.owned.includes(first) && pr.gold === 200 - price && pr.shop.stock[0].bought, '사면 내 것·금 줄고·자리 잠김');
  ok(C.shopBuy(data, pr, 0).why === 'bought', '산 자리는 또 못 산다');
  const second = pr.shop.stock[1].id; C.shopRotate(data, pr);
  ok(pr.shop.stock.length === 6 && pr.shop.stock[0].id === second && !pr.shop.stock.some(s => s.id === first), '한 칸 돈다 — 산 자리가 나간다');
  pr.gold = 9; ok(C.shopReroll(data, pr).why === 'gold', '10금 없으면 새로 못 깐다');
  pr.gold = 10; const before = pr.shop.stock.map(s => s.id).join(); ok(C.shopReroll(data, pr).ok && pr.gold === 0 && pr.shop.stock.map(s => s.id).join() !== before, '10금에 새로');
  ok(!C.shopClosed(data, pr), '살 것이 있다');
  pr.owned = C.pool(data).slice(); pr.shop.stock = []; C.shopFill(data, pr);
  ok(pr.shop.stock.every(s => s === null) && C.shopClosed(data, pr), '전부 가지면 빈 진열 · 닫힘');
}
/* ── 통계 그릇 ── */
{
  const s = C.emptyStats();
  C.bumpStats(s, { result: 'win', boss: 1, level: 'rookie', main: 1, rounds: 2, played: ['피카츄', '라이츄'] });
  C.bumpStats(s, { result: 'lose', boss: 1, level: 'ace', main: 1, rounds: 3, played: ['피카츄'] });
  ok(s.games === 2 && s.win === 1 && s.lose === 1 && s.streak === 0 && s.bestStreak === 1 && s.rounds === 5, '판·승·패·연승');
  ok(s.byBoss[1].games === 2 && s.byBoss[1].win === 1 && s.byLevel.ace.games === 1 && s.byMain[1].win === 1, '챔피언·난이도·주 세대별');
  ok(s.cards['피카츄'].played === 2 && s.cards['피카츄'].won === 1 && s.cards['라이츄'].won === 1, '카드별');
  const pr = C.newProfile(data, 1, 1); pr.stats.lane = s;
  const v = C.statsView(data, pr, 'lane');
  ok(v.line.games === 2 && v.byBoss.length === 9 && v.byLevel.length === 3 && v.cards[0].id === '피카츄' && v.cards[0].rate === null && v.avgRounds === 2.5, '전적 보기 — 5판 미만은 승률 없음');
}

/* ── 파생 ── */
{
  const D = A.cardsOf(data);
  ok(D.list.length === 1025 && D.pool.length === 1025, '전부 파생, 풀(allowAll)');
  for (const id of D.list) { const c = D.cards[id]; ok(c.power >= 4 && c.power <= 14 && c.types.length >= 1 && c.types.length <= 2 && typeof c.speed === 'number' && Array.isArray(c.to), id + ' 힘 4~14·타입·속도·to'); }
  ok(D.cards['이상해씨'].power === 6 && D.cards['이상해꽃'].power === 11 && D.cards['뮤츠'].power === 14 && D.cards['잉어킹'].power === 4, '힘 = 합/50');
  ok(D.cards['이상해씨'].types.join() === 'grass,poison' && D.cards['파이리'].types.join() === 'fire' && D.cards['리자몽'].types.join() === 'fire,flying', '타입');
  ok(D.cards['이상해씨'].to.join() === '이상해풀' && D.cards['이브이'].to.length === 8 && D.cards['뮤츠'].to.length === 0 && D.cards['뮤츠'].rare, '계통·전설');
  ok(D.cards['이상해씨'].speed === 45 && D.cards['파이리'].speed === 65, '속도');
  const dat2 = { ...data, lane: { ...data.lane, overrides: { '잉어킹': { power: 9 } } } }; delete dat2.__lane;
  ok(A.cardsOf(dat2).cards['잉어킹'].power === 9, 'overrides 가 힘을 덮는다');
  ok(A.cardsOf(real).pool.length === C.pool(real).length, '진짜 풀');
}
/* ── 덱 규칙 넷 — 25장 · 주 세대 15 · 전설 4 · 같은 카드 1 · 안 가진 카드 ── */
{
  const pr = C.newProfile(data, 1, 3);
  ok(A.validateDeck(data, pr).ok, '시작 덱은 규칙에 맞는다');
  const deck = C.deckOf(pr, 'lane');
  deck.pop(); { const v = A.validateDeck(data, pr); ok(!v.ok && v.problems.join() === 'count' && v.n === 24, '24장'); }
  deck.push(deck[0]); { const v = A.validateDeck(data, pr); ok(v.problems.includes('dup'), '같은 카드 둘'); }
  deck.pop(); deck.push('뮤츠'); { const v = A.validateDeck(data, pr); ok(v.problems.join() === 'owned', '안 가진 카드'); }
  deck.pop();   /* 안 가진 뮤츠를 도로 뺀다 — 아래서 전설 다섯을 앞에 넣으면 둘이 되니까 */
  pr.owned.push('뮤츠', '뮤', '프리져', '썬더', '파이어'); deck.splice(0, 5, '뮤츠', '뮤', '프리져', '썬더', '파이어');
  { const v = A.validateDeck(data, pr); ok(v.problems.includes('rare') && v.rare === 5, '전설 5'); }
  A.setMain(pr, 2); { const v = A.validateDeck(data, pr); ok(v.problems.includes('main') && v.main < 15, '주 세대를 바꾸면 15 규칙을 다시'); }
  A.setMain(pr, 1);
  ok(A.toggleDeck(data, pr, '뮤츠').ok && !deck.includes('뮤츠'), '빼기');
  ok(A.toggleDeck(data, pr, '망나뇽').why === 'owned', '안 가진 카드는 못 넣는다');
  const fill = A.autoFill(data, pr);
  ok(fill.ok && A.validateDeck(data, pr).ok && deck.length === 25, '자동 채우기가 규칙을 채운다: ' + JSON.stringify(fill));
  { const q = C.newProfile(data, 1, 3); q.decks.lane = ['없는카드', '뮤츠']; const f = A.autoFill(data, q); ok(f.removed.join() === '없는카드,뮤츠' && A.validateDeck(data, q).ok, '모르는 카드·안 가진 카드는 빼고 채운다'); }
  { const q = C.newProfile(data, 1, 3); q.owned = q.owned.slice(0, 20); q.decks.lane = q.owned.slice(); const f = A.autoFill(data, q); ok(!f.ok && A.validateDeck(data, q).problems.join() === 'count', '카드가 20장뿐이면 못 채운다 — 죽지 않고 count'); }
}
/* ── 챔피언 ── */
{
  ok(A.championOf(data, 1).ally === 2 && A.championOf(data, 9).ally === 8 && A.championOf(data, 10) === null, '챔피언·이웃');
  ok(A.championReady(data, 1).ok && !A.championReady(real, 1).ok && A.championReady(real, 1).need > 0, '그림 문턱 — 진짜 풀에선 n장 더');
  ok(A.championPortrait(data, 1) === '뮤츠' && C.inPool(data, A.championPortrait(data, 5)), '초상은 그 세대 종족값 최고');
  const D = A.cardsOf(data);
  for (const lv of C.LEVELS) for (const g of [1, 5, 9]) {
    const d1 = A.championDeck(data, { rngState: 1 }, g, lv), d2 = A.championDeck(data, { rngState: 1 }, g, lv);
    ok(d1.length === 25 && new Set(d1).size === 25 && d1.join() === d2.join(), `${g}세대 ${lv} 덱 25·같은 시드`);
    const own = d1.filter(x => D.cards[x].gen === g), ally = d1.filter(x => D.cards[x].gen === A.championOf(data, g).ally);
    ok(own.length === 17 && ally.length === 8, `${g}세대 ${lv} 자기 17 + 이웃 8`);
    const rare = d1.filter(x => D.cards[x].rare).length;
    ok(lv === 'ace' ? rare === 4 : rare === 0, `${g}세대 ${lv} 전설 ${rare}`);
    if (lv !== 'rookie') { /* 계통이 완성된 것부터 — 자기 세대 17 안에 통째 계통이 있다 */
      const whole = own.filter(x => { const l = C.lineOf(data, x).names; return l.length > 1 && l.every(y => own.includes(y)); });
      ok(whole.length >= 3, `${g}세대 ${lv} 통째 계통: ` + whole.length);
    }
  }
  { const a = A.championDeck(data, { rngState: 1 }, 1, 'rookie'), b = A.championDeck(data, { rngState: 2 }, 1, 'rookie'); ok(a.join() !== b.join(), '신참은 무작위'); }
}

console.log('PASS 결투 규칙: ' + n + ' 가지');
