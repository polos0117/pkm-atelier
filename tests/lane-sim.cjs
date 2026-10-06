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

/* ── 판 — 시드·멀리건·선공·보충 ── */
const freshMatch = (seed, gen, level, deck) => { const pr = C.newProfile(data, gen || 1, seed); if (deck) C.setDeck(pr, 'lane', deck); return [pr, A.newMatch(data, pr, A.championOf(data, gen || 1).ally, level || 'veteran', seed)]; };
{
  const [, m1] = freshMatch(42), [, m2] = freshMatch(42);
  ok(JSON.stringify(m1) === JSON.stringify(m2), '같은 시드 같은 판');
  ok(m1.phase === 'mulligan' && m1.me.hand.length === 8 && m1.me.deck.length === 17 && m1.foe.hand.length === 8 && m1.lives.me === 2 && m1.round === 1, '손 8 · 덱 17 · 목숨 둘 · 1라운드');
  ok(m1.me.lanes.length === 3 && m1.me.lanes.every(x => x === null) && !m1.me.opened, '빈 줄 셋, 개방 안 씀');
  const first = m1.me.hand[0], topDeck = m1.me.deck[0];
  ok(A.mulligan(m1, 0).ok && m1.me.hand[0] === topDeck && m1.me.deck[m1.me.deck.length - 1] === first, '멀리건 — 덱 맨 위와 바꾸고 옛 카드는 맨 아래');
  ok(A.mulligan(m1, 1).ok && A.mulligan(m1, 2).why === 'mulligan', '2장까지');
  ok(A.mulligan(m1, -1).why === 'mulligan' || A.mulligan(m1, -1).why === 'hand', '없는 자리');
  A.confirm(data, m1);
  ok(m1.phase === 'play' && (m1.first === 'me' || m1.first === 'foe') && m1.turn === m1.first && m1.coin === m1.first, '선공 결정');
  ok(m1[m1.first].hand.length === 8 + A.FIRST_CARDS && m1[A.other(m1.first)].hand.length === 8, '선공은 FIRST_CARDS 장 더: ' + A.FIRST_CARDS);
  ok(A.mulligan(m1, 0).why === 'phase', '시작 뒤엔 멀리건 없음');
  let me = 0; for (let s = 0; s < 40; s++) { const [, m] = freshMatch(s); A.confirm(data, m); if (m.first === 'me') me++; }
  ok(me > 8 && me < 32, '선공은 양쪽 다 나온다: ' + me);
}
/* ── 승부 수학 — 손으로 짠 판 ── */
/* 판을 손으로 만든다: 양쪽 손패를 정하고 선공을 me 로 고정. 손이 비면 자동 패스라서 여분 한 장(잉어킹)을 붙인다 — exact 면 안 붙인다 */
const rig = (myHand, foeHand, opt) => {
  opt = opt || {};
  const [pr, m] = freshMatch(opt.seed || 1, opt.gen || 1, opt.level || 'veteran');
  m.me.hand = myHand.concat(opt.exact ? [] : ['잉어킹']); m.foe.hand = foeHand.concat(opt.exact ? [] : ['잉어킹']); m.me.deck = []; m.foe.deck = [];
  m.phase = 'play'; m.first = m.turn = m.coin = opt.first || 'me';
  return [pr, m];
};
/* 수는 st.turn 쪽 것이다 — put 은 차례를 그쪽으로 돌려놓고 낸다 */
const put = (m, who, id, lane, form) => { m.turn = who; const r = A.place(data, m, id, lane, form || 'light'); assert(r.ok, `${who} ${id} 줄 ${lane}: ${r.why}`); return r; };
{
  const [, m] = rig(['이상해씨', '꼬부기', '피카츄'], ['파이리', '파이리', '꼬마돌']);
  put(m, 'me', '이상해씨', 0); put(m, 'foe', '파이리', 0);
  let u = A.matchup(data, m, 0);
  ok(u.me.power === 6 && u.me.mult === 1 && u.me.atk === 6 && u.foe.mult === 2 && u.foe.atk === 12 && u.winner === 'foe' && u.by === 'atk', '풀·독 6 대 불 6 → 독으로 때려 6 : 12 파이리');
  put(m, 'me', '꼬부기', 1); put(m, 'foe', '파이리', 1);
  u = A.matchup(data, m, 1); ok(u.me.atk === 12 && u.foe.atk === 3 && u.winner === 'me', '물 대 불 → 12 : 3');
  put(m, 'me', '피카츄', 2);
  ok(!m.passed.me && m.round === 1, '줄 셋이 다 차도 개방이 남아 있으면 자동 패스가 아니다');
  put(m, 'foe', '꼬마돌', 2);
  const sc = A.scores(data, m); ok(sc.me === 1 && sc.foe === 2 && sc.lanes.join() === 'foe,me,foe', '딴 줄 1 : 2');
  A.pass(data, m); A.pass(data, m);
  ok(m.round === 2 && m.roundLog[0].me === 1 && m.roundLog[0].foe === 2, '둘 다 패스 → 라운드 끝');
}
{ /* 전기 → 바위·땅 — 두 타입을 곱해 면역, 상대는 유리한 쪽으로 */
  const [, m] = rig(['피카츄'], ['꼬마돌']);
  put(m, 'me', '피카츄', 0); put(m, 'foe', '꼬마돌', 0);
  const u = A.matchup(data, m, 0); ok(u.me.atk === 0 && u.me.mult === 0 && u.foe.mult === 2 && u.foe.atk === 12 && u.winner === 'foe', '전기 → 바위·땅 은 1 × 0 = 면역, 땅 → 전기 2배(유리한 쪽으로)');
  const sc = A.scores(data, m); ok(sc.me === 0 && sc.foe === 1 && sc.lanes.join() === 'foe,,', '딴 줄 0 : 1');
}
{ /* 빈 자리·양쪽 0·속도·먼저 놓인 쪽·같은 카드 */
  const [, m] = rig(['이브이', '피카츄'], ['무우마', '피카츄']);
  ok(A.matchup(data, m, 0).winner === null && A.matchup(data, m, 0).by === 'none', '둘 다 비면 아무도');
  put(m, 'me', '이브이', 0); ok(A.matchup(data, m, 0).winner === 'me' && A.matchup(data, m, 0).by === 'empty', '상대 자리가 비면 내가');
  put(m, 'foe', '무우마', 0);
  let u = A.matchup(data, m, 0); ok(u.me.atk === 0 && u.foe.atk === 0 && u.winner === 'foe' && u.by === 'speed', '노말 ↔ 고스트 양쪽 0 → 속도(55 대 85)');
  put(m, 'me', '피카츄', 1); put(m, 'foe', '피카츄', 1);
  u = A.matchup(data, m, 1); ok(u.me.atk === 3 && u.foe.atk === 3 && u.winner === 'me' && u.by === 'first', '같은 카드(전기 ↔ 전기 ½) — 속도도 같으면 먼저 놓인 쪽');
}
/* ── 놓기·패스·턴 ── */
{
  const [, m] = rig(['이상해씨', '꼬부기'], ['파이리']);
  ok(A.place(data, m, '파이리', 0, 'light').why === 'hand', '손에 없는 카드');
  ok(A.place(data, m, '이상해씨', 3, 'light').why === 'lane' && A.place(data, m, '이상해씨', 0, 'wings').why === 'form', '없는 줄·없는 폼');
  ok(A.legal(data, m, 'me').place.length === 3 && A.legal(data, m, 'me').place[0].lanes.join() === '0,1,2' && A.legal(data, m, 'foe').place.length === 0, '내 차례의 합법 수');
  ok(A.place(data, m, '이상해씨', 1, 'heavy').ok && m.me.hand.join() === '꼬부기,잉어킹' && m.me.lanes[1].cards.join() === '이상해씨' && m.me.lanes[1].form === 'heavy' && m.turn === 'foe', '놓으면 손에서 줄로, 차례가 넘어간다');
  ok(m.played.join() === '이상해씨' && m.log[m.log.length - 1].t === 'place', '낸 카드 기록');
  ok(A.place(data, m, '꼬부기', 1, 'light').why === 'hand', '수는 st.turn 쪽 것 — 상대 차례에 내 카드를 내면 상대 손에 없다');
  ok(A.pass(data, m).ok && m.passed.foe && m.turn === 'me', '상대 패스 → 내 차례');
  ok(A.place(data, m, '꼬부기', 0, 'light').ok && m.turn === 'me', '상대가 패스했으니 내 차례가 이어진다');
  ok(A.pass(data, m).ok && m.roundLog.length === 1 && m.round === 2, '둘 다 패스 → 라운드 끝');
  const r = m.roundLog[0]; ok(r.winner === 'me' && r.me === 2 && r.foe === 0 && m.lives.foe === 1 && m.lives.me === 2, '줄 2 : 0 → 내가 따고 상대 목숨 하나');
  ok(m.me.lanes.every(x => x === null) && m.me.grave.join() === '꼬부기,이상해씨' && !m.passed.me && !m.passed.foe, '판은 묘지로(줄 차례), 패스 풀림');
  ok(m.first === 'foe' && m.turn === 'foe', '진 쪽이 선공');
}
{ /* 보충 3장 · 빈 손 자동 패스 · 동점은 둘 다 잃음 */
  const [, m] = rig(['이상해씨'], ['파이리'], { exact: true });
  m.me.opened = m.foe.opened = true;   /* 개방이 남아 있으면 할 일이 있는 것 — 손패만 보려고 둘 다 쓴 것으로 */
  m.me.deck = ['꼬부기', '피카츄', '이브이', '뮤츠']; m.foe.deck = ['꼬마돌'];
  put(m, 'me', '이상해씨', 0); ok(m.passed.me && m.turn === 'foe', '손이 비면 자동 패스');
  put(m, 'foe', '파이리', 1);
  ok(m.round === 2 && m.roundLog[0].winner === 'draw' && m.lives.me === 1 && m.lives.foe === 1, '1 : 1 동점 → 둘 다 목숨을 잃는다');
  ok(m.me.hand.join() === '꼬부기,피카츄,이브이' && m.me.deck.join() === '뮤츠' && m.foe.hand.join() === '꼬마돌', '라운드가 바뀌면 3장 보충(있는 만큼)');
  ok(m.first === 'foe' && m.turn === 'foe', '동점이면 선공이 바뀐다');
  put(m, 'foe', '꼬마돌', 0); ok(m.passed.foe && m.turn === 'me', '상대 손이 비면 자동 패스 → 내 차례');
  put(m, 'me', '피카츄', 1); ok(m.turn === 'me', '상대가 패스 상태면 내 차례가 이어진다');
  put(m, 'me', '이브이', 2);
  A.pass(data, m);
  ok(m.phase === 'done' && m.winner === 'me' && m.lives.foe === 0 && m.turn === null, '줄 2 : 1 → 상대 목숨 0 → 끝');
  ok(A.place(data, m, '꼬부기', 0, 'light').why === 'phase' && A.pass(data, m).why === 'phase', '끝난 판엔 못 둔다');
}
{ /* 둘 다 빈 손으로 라운드가 시작되면 0 : 0 동점 → 둘 다 잃고 끝 */
  const [, m] = rig(['이상해씨'], ['파이리'], { exact: true });
  m.me.opened = m.foe.opened = true;
  put(m, 'me', '이상해씨', 0); put(m, 'foe', '파이리', 1);
  ok(m.round === 2 && m.me.hand.length === 0 && m.foe.hand.length === 0 && m.phase === 'done' && m.winner === 'draw' && m.roundLog.length === 2, '2라운드가 빈 손 0:0 → 둘 다 0 → 무승부로 끝');
}
{ /* 세 라운드 상한 */
  const [, m] = rig(['이상해씨', '꼬부기', '피카츄'], ['파이리', '파이리', '파이리']);
  put(m, 'me', '꼬부기', 0); A.pass(data, m); A.pass(data, m);           /* 1R: 상대 패스, 나 패스 */
  ok(m.round === 2 && m.lives.foe === 1 && m.first === 'foe', '1R 나');
  put(m, 'foe', '파이리', 0); A.pass(data, m); A.pass(data, m);          /* 2R: 나 패스, 상대 패스 */
  ok(m.round === 3 && m.lives.me === 1 && m.first === 'me', '2R 상대 → 3R, 진 쪽 선공');
  put(m, 'me', '피카츄', 0); put(m, 'foe', '파이리', 1); A.pass(data, m); A.pass(data, m);
  ok(m.phase === 'done' && m.winner === 'draw' && m.roundLog.length === 3 && m.roundLog[2].lanes.join() === 'me,foe,', '3R 1:1 동점 → 무승부, 세 라운드');
}

/* ── 진화 ── */
{
  const [, m] = rig(['이상해씨', '이상해풀', '이상해꽃'], ['파이리']);
  ok(A.evolve(data, m, '이상해풀', 0).why === 'lane', '빈 줄엔 진화 없음');
  put(m, 'me', '이상해씨', 0); put(m, 'foe', '파이리', 0);
  ok(A.legal(data, m, 'me').evolve.length === 1 && A.legal(data, m, 'me').evolve[0].id === '이상해풀' && A.legal(data, m, 'me').evolve[0].lane === 0, '합법 진화 — 다음 단계만');
  ok(A.evolve(data, m, '이상해꽃', 0).why === 'evo', '단계를 건너뛰지 못한다');
  ok(A.evolve(data, m, '이상해풀', 0).ok && m.me.lanes[0].cards.join() === '이상해씨,이상해풀' && m.me.lanes[0].bonus === 4 && m.turn === 'foe', '진화 — 스택에 쌓이고 경장은 +4');
  m.turn = 'me';
  let u = A.matchup(data, m, 0); ok(u.me.id === '이상해풀' && u.me.power === 12 && u.me.atk === 12 && u.foe.atk === 12 && u.winner === 'foe' && u.by === 'speed', '힘 8+4 = 12 : 12 → 속도 60 대 65');
  ok(A.evolve(data, m, '이상해꽃', 0).ok && m.me.lanes[0].bonus === 8 && A.matchup(data, m, 0).me.power === 19 && A.matchup(data, m, 0).winner === 'me', '한 번 더 — 11+8 = 19');
  ok(m.grown.join() === '이상해씨' && m.played.join() === '이상해씨,이상해풀,이상해꽃' && m.log.filter(e => e.t === 'evolve').length === 2, '끝까지 키운 계통·낸 카드·기록');
}
{ /* 중장은 +2 · 타입이 바뀐다(리자몽은 땅 면역) · 분기 */
  const [, m] = rig(['리자드', '리자몽', '이브이', '쥬피썬더'], ['모래두지']);
  put(m, 'me', '리자드', 0, 'heavy'); put(m, 'foe', '모래두지', 0);
  let u = A.matchup(data, m, 0); ok(u.me.atk === 8 && u.foe.mult === 1 && u.foe.atk === 6 && u.winner === 'me', '중장 리자드 — 땅 2배가 1배로 막혀 8 : 6');
  m.turn = 'me'; A.evolve(data, m, '리자몽', 0);
  u = A.matchup(data, m, 0); ok(m.me.lanes[0].bonus === 2 && u.me.power === 13 && u.foe.mult === 0 && u.foe.atk === 0 && u.winner === 'me', '리자몽 — 중장 +2, 비행이 붙어 땅 면역 0');
  put(m, 'me', '이브이', 1, 'light'); m.turn = 'me';
  ok(A.legal(data, m, 'me').evolve.some(e => e.id === '쥬피썬더' && e.lane === 1), '분기 진화 — to 에 있는 것 어느 쪽이든');
  m.turn = 'me'; ok(A.evolve(data, m, '쥬피썬더', 1).ok && A.matchup(data, m, 1).me.id === '쥬피썬더' && m.grown.join() === '파이리,이브이', '이브이 → 쥬피썬더');
}
/* ── 폼 — 중장 상한·고기동 동점·옮기기 ── */
{
  const [, m] = rig(['어니부기', '피카츄', '꼬마돌'], ['피카츄', '피카츄', '꼬부기']);
  put(m, 'me', '어니부기', 0, 'heavy'); put(m, 'foe', '피카츄', 0);
  let u = A.matchup(data, m, 0); ok(u.me.atk === 8 && u.foe.mult === 1 && u.foe.atk === 6 && u.winner === 'me', '중장 — 2배(12)가 1배(6)로');
  put(m, 'me', '피카츄', 1, 'mobility'); put(m, 'foe', '피카츄', 1);
  u = A.matchup(data, m, 1); ok(u.winner === 'me' && u.by === 'form', '고기동 — 같은 공격값이면 속도 상관없이');
  put(m, 'me', '꼬마돌', 2, 'heavy'); put(m, 'foe', '꼬부기', 2);
  u = A.matchup(data, m, 2); ok(u.foe.mult === 1 && u.foe.atk === 6 && u.me.atk === 6 && u.winner === 'foe' && u.by === 'speed', '4배(물 → 바위·땅)도 1배로 — 6 : 6 → 속도 20 대 43 은 꼬부기');
}
{ /* 옮기기 — 고기동만, 라운드에 한 번, 빈 줄로 가거나 자리 바꿈 */
  const [, m] = rig(['피카츄', '꼬부기', '이브이'], ['파이리']);
  put(m, 'me', '피카츄', 0, 'mobility'); put(m, 'foe', '파이리', 0);
  ok(A.matchup(data, m, 0).winner === 'me', '전기 6 대 불 6 → 고기동');
  m.turn = 'me';
  ok(A.legal(data, m, 'me').move.length === 2 && A.legal(data, m, 'me').move.map(x => x.to).join() === '1,2', '옮길 수 있는 줄 둘');
  ok(A.move(data, m, 0, 0).why === 'lane' && A.move(data, m, 0, 3).why === 'lane', '같은 줄·없는 줄');
  ok(A.move(data, m, 0, 2).ok && m.me.lanes[0] === null && m.me.lanes[2].cards.join() === '피카츄' && m.me.lanes[2].moved && m.turn === 'foe', '빈 줄로 — 턴을 쓴다');
  m.turn = 'me'; ok(A.move(data, m, 2, 1).why === 'moved', '라운드에 한 번');
  put(m, 'me', '꼬부기', 0, 'light'); m.turn = 'me';
  ok(A.move(data, m, 0, 1).why === 'form', '경장은 못 옮긴다');
  put(m, 'me', '이브이', 1, 'mobility'); m.turn = 'me';
  ok(A.move(data, m, 1, 0).ok && m.me.lanes[0].cards.join() === '이브이' && m.me.lanes[1].cards.join() === '꼬부기' && m.me.lanes[0].moved && !m.me.lanes[1].moved, '자리 바꿈 — 옮긴 쪽만 moved');
  ok(A.matchup(data, m, 0).me.id === '이브이' && A.matchup(data, m, 0).me.atk === 7 && A.matchup(data, m, 0).winner === 'me' && A.matchup(data, m, 2).by === 'empty', '옮긴 뒤 승부는 새 자리로 — 이브이 7 대 파이리 6');
}
{ /* 개방 — 한 판에 한 번, 힘 두 배, 라운드가 끝나면 풀리지만 쓴 것은 남는다 */
  const [, m] = rig(['꼬부기', '피카츄'], ['리자드', '파이리']);
  put(m, 'me', '꼬부기', 0); put(m, 'foe', '리자드', 0);
  ok(A.matchup(data, m, 0).me.atk === 12 && A.matchup(data, m, 0).foe.atk === 4 && A.matchup(data, m, 0).winner === 'me', '물 6×2 대 불 8×½');
  m.turn = 'foe';
  ok(A.open(data, m, 1).why === 'lane', '빈 줄은 못 연다');
  ok(A.legal(data, m, 'foe').open.join() === '0', '열 수 있는 줄');
  ok(A.open(data, m, 0).ok && m.foe.lanes[0].open && m.foe.opened && m.turn === 'me', '개방 — 턴을 쓴다');
  let u = A.matchup(data, m, 0); ok(u.foe.power === 16 && u.foe.atk === 8 && u.me.atk === 12 && u.winner === 'me', '8 × 2 = 16, × ½ = 8 — 아직 진다');
  m.turn = 'foe'; put(m, 'foe', '파이리', 1); m.turn = 'foe';
  ok(A.open(data, m, 1).why === 'opened' && A.legal(data, m, 'foe').open.length === 0, '한 판에 한 번');
  m.turn = 'me'; ok(A.open(data, m, 0).ok && A.matchup(data, m, 0).me.atk === 24, '내 개방은 따로 — 6 × 2 × 2');
  A.pass(data, m); A.pass(data, m);   /* 상대 패스, 나 패스 */
  ok(m.round === 2 && m.roundLog[0].winner === 'draw' && m.foe.opened && m.me.opened && A.legal(data, m, m.turn).open.length === 0, '라운드가 바뀌어도 개방은 쓴 채');
}
{ /* 손이 비어도 옮기기·개방이 남았으면 자동 패스가 아니다 */
  const [, m] = rig(['피카츄'], ['파이리', '꼬부기'], { exact: true });
  put(m, 'me', '피카츄', 0, 'mobility');
  ok(!m.passed.me && m.turn === 'foe', '손은 비었지만 옮기기·개방이 있다');
  put(m, 'foe', '파이리', 1); m.turn = 'me';
  ok(A.move(data, m, 0, 2).ok && !m.passed.me, '옮기고도 개방이 남았다');
  m.turn = 'me'; ok(A.open(data, m, 2).ok && m.passed.me, '개방까지 쓰면 할 일이 없어 자동 패스');
}

console.log('PASS 결투 규칙: ' + n + ' 가지');
