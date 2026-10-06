/* 폼 결투를 화면 없이 굴린다 — 파생·덱 규칙·판·상성 타격·결속·개방·날씨·AI·정산. --quick 없이 돌리면 균형 보고.
   Run: node tests/gwent-sim.cjs [--quick] */
const fs = require('node:fs'), assert = require('node:assert/strict');
const C = require('../lib/collection.js');
const G = require('../lib/gwent.js');
const quick = process.argv.includes('--quick');
const J = n => JSON.parse(fs.readFileSync('data/' + n + '.json', 'utf8'));
const card = J('card'), chart = J('chart'), img = J('img');
/* 규칙 검사는 그림 유무를 무시한다 — allowAll(날씨판도 전부 가능). 풀 문턱은 real 로 본다 */
const data = { cards: card.cards.character, chart: chart.chart, group: J('group'), label: J('label'), img: img.img || {}, lane: J('lane'), gwent: J('gwent'), allowAll: true };
const real = { ...data, allowAll: false };
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const by = C.byName(data);

/* ── 파생 — 힘 셋 · 계통 · 전설 · 날씨판 id ── */
{
  const D = G.cardsOf(data);
  ok(D.list.length === 1025 && D.pool.length === 1025, '전부 파생, 풀(allowAll)');
  for (const id of D.list) { const c = D.cards[id]; for (const f of C.FORMS) ok(c.power[f] >= 1 && c.power[f] <= 15, id + ' ' + f + ' 힘 1~15: ' + c.power[f]); ok(typeof c.line === 'string' && c.types.length >= 1, id + ' 계통·타입'); }
  const P = id => [D.cards[id].power.light, D.cards[id].power.heavy, D.cards[id].power.mobility].join();
  ok(P('피카츄') === '5,5,9' && P('리자몽') === '10,8,10' && P('잉어킹') === '1,4,8' && P('뮤츠') === '13,9,13', '정한 예: ' + [P('피카츄'), P('리자몽'), P('잉어킹'), P('뮤츠')].join(' / '));
  ok(D.cards['단단지'].power.heavy === 15 && D.cards['해피너스'].power.mobility === 6, '천장 15 · 고기동은 속도만: ' + D.cards['단단지'].power.heavy + ',' + D.cards['해피너스'].power.mobility);
  ok(D.cards['이상해풀'].line === '이상해씨' && D.cards['쥬피썬더'].line === '이브이' && D.cards['뮤츠'].line === '뮤츠', '계통 뿌리');
  ok(D.cards['뮤츠'].rare && !D.cards['피카츄'].rare, '전설');
  ok(D.cards['꼬부기'].casual && G.cardsOf(real).cards['꼬부기'].casual === false && G.cardsOf(real).cards['피카츄'].casual === true, 'allowAll 이면 일상컷 있는 셈, 진짜 자료에선 등록된 것만(피카츄 있음·꼬부기 없음)');
  ok(G.isWeather('피카츄|w') && !G.isWeather('피카츄') && G.baseName('피카츄|w') === '피카츄' && G.baseName('피카츄') === '피카츄', '날씨판 id');
  const w = G.cardOf(data, '피카츄|w');
  ok(w && w.weather && w.name === '피카츄' && w.id === '피카츄|w' && w.gen === 1 && !w.rare && w.types.length === 0 && G.best(w) === 0, '날씨판 카드');
  ok(G.cardOf(data, '피카츄') === D.cards['피카츄'] && G.cardOf(data, '없는카드') === null && G.cardOf(data, '없는카드|w') === null && G.cardOf(real, '꼬부기|w') === null && G.cardOf(real, '피카츄|w').weather, '카드 찾기 — 일상컷이 없으면 날씨판도 없다');
  ok(G.best(D.cards['피카츄']) === 9 && G.best(D.cards['뮤츠']) === 13, '가장 센 폼');
  ok(G.weatherOf(data, 0) === 'hail' && G.weatherOf(data, 1) === 'sand' && G.weatherOf(data, 2) === 'rain', '줄마다 날씨');
  const dat2 = { ...data, gwent: { ...data.gwent, overrides: { '잉어킹': { light: 9 } } } }; delete dat2.__gwent;
  ok(G.cardsOf(dat2).cards['잉어킹'].power.light === 9 && G.cardsOf(dat2).cards['잉어킹'].power.heavy === 4, 'overrides 가 힘 하나를 덮는다');
  ok(G.HAND === 10 && G.FIRST_BONUS >= 0 && G.OPEN_BONUS === 5 && G.WEATHER_MAX === 3, '상수');
}

/* ── 덱 규칙 여섯 — 25장 · 주 세대 15 · 전설 4 · 날씨판 3 · 같은 id 1 · 안 가진 카드 ── */
{
  const pr = C.newProfile(data, 1, 3); C.setDeck(pr, 'gwent', pr.owned.slice());
  ok(G.validateDeck(data, pr).ok, '시작 컬렉션 25 를 그대로 덱으로');
  const deck = C.deckOf(pr, 'gwent');
  deck.pop(); { const v = G.validateDeck(data, pr); ok(!v.ok && v.problems.join() === 'count' && v.n === 24, '24장'); }
  deck.push(deck[0]); ok(G.validateDeck(data, pr).problems.includes('dup'), '같은 id 둘');
  deck.pop(); deck.push('뮤츠'); ok(G.validateDeck(data, pr).problems.join() === 'owned', '안 가진 카드'); deck.pop();
  pr.owned.push('뮤츠', '뮤', '프리져', '썬더', '파이어'); deck.splice(0, 5, '뮤츠', '뮤', '프리져', '썬더', '파이어');
  { const v = G.validateDeck(data, pr); ok(v.problems.includes('rare') && v.rare === 5, '전설 5'); }
  G.setMain(pr, 2); ok(G.validateDeck(data, pr).problems.includes('main'), '주 세대를 바꾸면 15 규칙'); G.setMain(pr, 1);
  ok(G.toggleDeck(data, pr, '뮤츠').ok && !deck.includes('뮤츠') && G.toggleDeck(data, pr, '망나뇽').why === 'owned', '빼기 · 안 가진 카드는 못 넣는다');
  /* 날씨판 — 가진 카드의 공짜 폼. 기본판과 같이 넣어도 되고, 3장까지 */
  const w = deck.filter(x => !G.isWeather(x)).slice(0, 4).map(x => x + '|w');
  ok(G.toggleDeck(data, pr, w[0]).ok && deck.includes(w[0]) && G.validateDeck(data, pr).weather === 1, '날씨판 넣기 — 기본판과 함께');
  ok(G.toggleDeck(data, pr, '망나뇽|w').why === 'owned', '안 가진 카드의 날씨판은 안 된다');
  deck.push(w[1], w[2], w[3]); { const v = G.validateDeck(data, pr); ok(v.problems.includes('weather') && v.weather === 4, '날씨판 4 는 초과'); }
  const fill = G.autoFill(data, pr);
  ok(fill.ok && G.validateDeck(data, pr).ok && deck.length === 25 && deck.filter(G.isWeather).length <= 3, '자동 채우기가 규칙을 채운다(날씨판을 줄여서): ' + JSON.stringify(fill));
  { const q = C.newProfile(data, 1, 3); q.decks.gwent = ['없는카드', '뮤츠', '피카츄|w']; const f = G.autoFill(data, q); ok(f.removed.join() === '없는카드,뮤츠,피카츄|w' && G.validateDeck(data, q).ok, '모르는 카드·안 가진 카드(의 날씨판)는 빼고 채운다'); }
  { const q = C.newProfile(data, 1, 3); q.decks.gwent = []; const f = G.autoFill(data, q); ok(f.ok && q.decks.gwent.length === 25 && q.decks.gwent.every(x => !G.isWeather(x)), '빈 덱은 가진 카드로 25 — 날씨판은 자동으로 안 넣는다'); }
  { const q = C.newProfile(data, 1, 3); q.owned = q.owned.slice(0, 20); q.decks.gwent = q.owned.slice(); const f = G.autoFill(data, q); ok(!f.ok && G.validateDeck(data, q).problems.join() === 'count', '카드가 20장뿐이면 못 채운다 — 죽지 않고 count'); }
  { /* 진짜 자료 — 일상컷이 없는 카드의 날씨판은 안 가진 것과 같다 */
    const q = C.newProfile(data, 1, 3); q.decks.gwent = q.owned.slice(0, 24).concat([q.owned[0] + '|w']);
    ok(!G.canUse(real, q, q.owned[0] + '|w') && G.validateDeck(real, q).problems.includes('owned'), '일상컷 없는 카드의 날씨판은 owned'); }
}
/* ── 챔피언 ── */
{
  ok(G.championOf(data, 1).ally === 2 && G.championOf(data, 10) === null && G.championReady(data, 1).ok && !G.championReady(real, 1).ok, '챔피언·이웃·그림 문턱');
  ok(G.championPortrait(data, 1) === '뮤츠', '초상은 그 세대 종족값 최고');
  for (const lv of C.LEVELS) for (const g of [1, 5, 9]) {
    const d1 = G.championDeck(data, { rngState: 1 }, g, lv), d2 = G.championDeck(data, { rngState: 1 }, g, lv);
    ok(d1.length === 25 && new Set(d1).size === 25 && d1.join() === d2.join() && d1.every(x => G.cardOf(data, x)), `${g}세대 ${lv} 덱 25·같은 시드`);
    const own = d1.filter(x => G.cardOf(data, x).gen === g), ally = d1.filter(x => G.cardOf(data, x).gen === G.championOf(data, g).ally);
    ok(own.length === 17 && ally.length === 8, `${g}세대 ${lv} 자기 17 + 이웃 8`);
    const rare = d1.filter(x => G.cardOf(data, x).rare).length, w = d1.filter(G.isWeather).length;
    ok(lv === 'ace' ? rare === 4 && w === 2 : rare === 0 && w === 0, `${g}세대 ${lv} 전설 ${rare} 날씨 ${w}`);
  }
  { const a = G.championDeck(data, { rngState: 1 }, 1, 'rookie'), b = G.championDeck(data, { rngState: 2 }, 1, 'rookie'); ok(a.join() !== b.join(), '신참은 무작위'); }
  { const d = G.championDeck(real, { rngState: 1 }, 1, 'ace'); ok(true, '(real 은 문턱 미달 — 던지지만 않으면 됨)'); }
}

/* ── 판 — 시드·멀리건·선공 보정 ── */
const freshMatch = (seed, gen, level, deck) => { const pr = C.newProfile(data, gen || 1, seed); C.setDeck(pr, 'gwent', deck || pr.owned.slice()); return [pr, G.newMatch(data, pr, G.championOf(data, gen || 1).ally, level || 'veteran', seed)]; };
{
  const [, m1] = freshMatch(42), [, m2] = freshMatch(42);
  ok(JSON.stringify(m1) === JSON.stringify(m2), '같은 시드 같은 판');
  ok(m1.phase === 'mulligan' && m1.me.hand.length === 10 && m1.me.deck.length === 15 && m1.foe.hand.length === 10 && m1.lives.me === 2 && m1.round === 1, '손 10 · 덱 15 · 목숨 둘 · 1라운드');
  ok(m1.me.rows.length === 3 && m1.me.rows.every(r => r.length === 0) && !m1.me.opened && m1.weather.join() === ',,' && m1.bonus.me === 0, '빈 줄 셋, 개방 안 씀, 날씨 없음');
  const first = m1.me.hand[0], topDeck = m1.me.deck[0];
  ok(G.mulligan(m1, 0).ok && m1.me.hand[0] === topDeck && m1.me.deck[m1.me.deck.length - 1] === first, '멀리건 — 덱 맨 위와 바꾸고 옛 카드는 맨 아래');
  ok(G.mulligan(m1, 1).ok && G.mulligan(m1, 2).why === 'mulligan', '2장까지');
  G.confirm(data, m1);
  ok(m1.phase === 'play' && m1.turn === m1.first && m1.coin === m1.first && m1.bonus[m1.first] === G.FIRST_BONUS && m1.bonus[G.other(m1.first)] === 0, '선공 결정 · 선공 보너스 ' + G.FIRST_BONUS);
  ok(G.sums(data, m1)[m1.first] === G.FIRST_BONUS && G.sums(data, m1)[G.other(m1.first)] === 0, '보너스는 합에 들어간다');
  ok(G.mulligan(m1, 0).why === 'phase', '시작 뒤엔 멀리건 없음');
  let me = 0; for (let s = 0; s < 40; s++) { const [, m] = freshMatch(s); G.confirm(data, m); if (m.first === 'me') me++; }
  ok(me > 8 && me < 32, '선공은 양쪽 다 나온다: ' + me);
}
/* 판을 손으로 만든다: 양쪽 손패를 정하고 선공을 me 로, 보너스 0. 손이 비면 자동 패스라서 여분 한 장(잉어킹)을 붙인다 — exact 면 안 붙인다 */
const rig = (myHand, foeHand, opt) => {
  opt = opt || {};
  const [pr, m] = freshMatch(opt.seed || 1, opt.gen || 1, opt.level || 'veteran');
  m.me.hand = myHand.concat(opt.exact ? [] : ['잉어킹']); m.foe.hand = foeHand.concat(opt.exact ? [] : ['잉어킹']); m.me.deck = []; m.foe.deck = [];
  m.phase = 'play'; m.first = m.turn = m.coin = opt.first || 'me'; m.bonus = { me: 0, foe: 0 };
  return [pr, m];
};
/* 수는 st.turn 쪽 것 — put 은 차례를 그쪽으로 돌려놓고 낸다 */
const put = (m, who, id, lane) => { m.turn = who; const r = G.play(data, m, id, lane); assert(r.ok, `${who} ${id} 줄 ${lane}: ${r.why}`); return r; };
const unit = (m, who, lane, i) => m[who].rows[lane][i || 0];
/* ── 내기 — 줄이 폼, 힘이 줄마다 다르다 ── */
{
  const [, m] = rig(['피카츄', '꼬부기', '이상해씨'], ['파이리']);
  ok(G.play(data, m, '파이리', 0).why === 'hand' && G.play(data, m, '피카츄', 3).why === 'lane', '손에 없는 카드 · 없는 줄');
  const L = G.legal(data, m, 'me'); ok(L.play.length === 4 && L.play[0].lanes.join() === '0,1,2' && L.open.length === 0 && L.pass && G.legal(data, m, 'foe').play.length === 0, '내 차례의 합법 수');
  ok(G.play(data, m, '피카츄', 2).ok && unit(m, 'me', 2).name === '피카츄' && unit(m, 'me', 2).base === 9 && unit(m, 'me', 2).dmg === 0 && unit(m, 'me', 2).open === 0 && m.turn === 'foe', '고기동 줄에 놓으면 힘 9 (속도)');
  ok(m.me.hand.join() === '꼬부기,이상해씨,잉어킹' && m.played.join() === '피카츄' && m.log[m.log.length - 1].t === 'play', '손에서 줄로 · 낸 카드 기록');
  ok(G.cur(unit(m, 'me', 2)) === 9 && G.rowSum(data, m, 'me', 2) === 9 && G.sums(data, m).me === 9 && G.sums(data, m).foe === 0, '현재 힘 · 줄 합 · 전체 합');
  put(m, 'foe', '파이리', 0); ok(unit(m, 'foe', 0).base === G.cardOf(data, '파이리').power.light && m.turn === 'me', '상대는 경장 줄에');
  put(m, 'me', '꼬부기', 2); ok(m.me.rows[2].length === 2 && m.me.rows[2][1].name === '꼬부기' && G.rowSum(data, m, 'me', 2) === 9 + G.cardOf(data, '꼬부기').power.mobility, '같은 줄에 둘 — 합');
  ok(G.sums(data, m).rows.me.join() === '0,0,' + G.rowSum(data, m, 'me', 2), '줄별 합');
}
/* ── 패스·턴·라운드·목숨 ── */
{
  const [, m] = rig(['이상해씨', '꼬부기'], ['파이리']);
  ok(G.play(data, m, '이상해씨', 1).ok && m.turn === 'foe', '놓으면 차례가 넘어간다');
  ok(G.pass(data, m).ok && m.passed.foe && m.turn === 'me', '상대 패스 → 내 차례');
  ok(G.play(data, m, '꼬부기', 0).ok && m.turn === 'me', '상대가 패스했으니 내 차례가 이어진다');
  ok(G.pass(data, m).ok && m.roundLog.length === 1 && m.round === 2, '둘 다 패스 → 라운드 끝');
  const r = m.roundLog[0]; ok(r.winner === 'me' && r.me === G.cardOf(data, '이상해씨').power.heavy + G.cardOf(data, '꼬부기').power.light && r.foe === 0 && m.lives.foe === 1 && m.lives.me === 2, '합으로 내가 땄다 → 상대 목숨 하나: ' + JSON.stringify(r));
  ok(m.me.rows.every(x => x.length === 0) && m.me.grave.sort().join() === '꼬부기,이상해씨' && !m.passed.me && !m.passed.foe && m.bonus.me === 0, '판은 묘지로, 패스 풀림, 보너스 없음');
  ok(m.first === 'foe' && m.turn === 'foe', '진 쪽이 선공');
  ok(m.me.hand.length === 1 && m.foe.hand.length === 2, '라운드 사이 보충 없음 — 나 1(잉어킹), 상대 2(파이리·잉어킹)');
}
{ /* 빈 손 자동 패스 · 동점은 둘 다 잃음 */
  const [, m] = rig(['피카츄'], ['피카츄'], { exact: true });
  put(m, 'me', '피카츄', 0); ok(m.passed.me && m.turn === 'foe', '손이 비면 자동 패스');
  put(m, 'foe', '피카츄', 0);
  ok(m.phase === 'done' && m.roundLog[0].winner === 'draw' && m.lives.me === 0 && m.lives.foe === 0 && m.roundLog.length === 2 && m.winner === 'draw', '5 : 5 동점 → 둘 다 잃고, 2라운드는 빈 손 0:0 → 둘 다 0 → 무승부로 끝');
}
{ /* 선공 보너스 — 1라운드만, 동점이면 선공이 바뀐다 */
  const [, m] = rig(['피카츄', '꼬부기'], ['피카츄', '꼬부기']);
  m.bonus.me = G.FIRST_BONUS;
  put(m, 'me', '피카츄', 0); put(m, 'foe', '피카츄', 0); G.pass(data, m); G.pass(data, m);
  ok(m.roundLog[0].me === 5 + G.FIRST_BONUS && m.roundLog[0].foe === 5 && m.roundLog[0].winner === 'me' && m.bonus.me === 0 && m.first === 'foe', '보너스로 땄다 · 2라운드엔 보너스 없음');
  m.turn = 'foe'; put(m, 'foe', '꼬부기', 0); put(m, 'me', '꼬부기', 0); G.pass(data, m); G.pass(data, m);
  ok(m.round === 2 && m.roundLog[1].winner === 'draw' && m.lives.me === 1 && m.lives.foe === 0 && m.phase === 'done' && m.winner === 'me', '2R 동점 → 둘 다 잃고 상대 0 → 내가 이김(끝난 판은 라운드 수가 안 는다)');
}
{ /* 세 라운드 상한 */
  const [, m] = rig(['피카츄', '꼬부기', '이상해씨'], ['파이리', '파이리', '파이리']);
  put(m, 'me', '꼬부기', 0); G.pass(data, m); G.pass(data, m);
  ok(m.round === 2 && m.lives.foe === 1 && m.first === 'foe', '1R 나 → 진 상대가 선공');
  put(m, 'foe', '파이리', 0); G.pass(data, m); G.pass(data, m);
  ok(m.round === 3 && m.lives.me === 1 && m.first === 'me', '2R 상대 → 3R, 진 내가 선공');
  put(m, 'me', '피카츄', 2); put(m, 'foe', '파이리', 1); G.pass(data, m); G.pass(data, m);
  ok(m.phase === 'done' && m.roundLog.length === 3 && m.roundLog[2].winner === 'me' && m.winner === 'me', '3R 9 : 6 → 내가 이김, 세 라운드');
  ok(G.play(data, m, '이상해씨', 0).why === 'phase' && G.pass(data, m).why === 'phase', '끝난 판엔 못 둔다');
}

/* ── 상성 타격 — 놓을 때 한 번, 상대 판 전체에서 내 타입에 2배 이상인 비영웅 가운데 가장 센 것 ── */
{
  const [, m] = rig(['리자몽', '꼬부기', '피카츄', '파이리'], ['이상해꽃', '이상해씨', '뮤츠', '꼬마돌']);
  ok(G.mult(data, ['fire', 'flying'], ['grass', 'poison']) === 2 && G.mult(data, ['water'], ['rock', 'ground']) === 4 && G.mult(data, ['electric'], ['rock', 'ground']) === 0 && G.mult(data, ['normal'], ['ghost']) === 0, '배율 — 유리한 쪽으로, 상대 둘은 곱');
  put(m, 'foe', '이상해꽃', 0); put(m, 'foe', '이상해씨', 1); put(m, 'foe', '뮤츠', 2);
  put(m, 'me', '리자몽', 0);
  const hit = m.last.hit; ok(hit && hit.id === '이상해꽃' && hit.lane === 0 && hit.n === 2 && hit.mult === 2 && unit(m, 'foe', 0).dmg === 2 && G.cur(unit(m, 'foe', 0)) === G.cardOf(data, '이상해꽃').power.light - 2, '불→풀 2배 → 가장 센 이상해꽃 −2: ' + JSON.stringify(hit));
  ok(unit(m, 'foe', 1).dmg === 0, '약한 쪽은 안 맞는다');
  m.turn = 'me'; put(m, 'me', '파이리', 1);
  ok(m.last.hit.id === '이상해꽃' && unit(m, 'foe', 0).dmg === 4, '또 가장 센 것(현재 힘으로) — 이상해꽃 −4');
  put(m, 'foe', '꼬마돌', 1); ok(m.last.hit && m.last.hit.id === '리자몽' && m.last.hit.mult === 4 && m.last.hit.n === 3 && unit(m, 'me', 0).dmg === 3, '바위 → 불·비행 4배 → 리자몽 −3: ' + JSON.stringify(m.last.hit));
  m.turn = 'me'; put(m, 'me', '꼬부기', 2);
  ok(m.last.hit.id === '꼬마돌' && m.last.hit.n === 3 && m.last.hit.mult === 4 && unit(m, 'foe', 1, 1).dmg === 3, '물→바위·땅 4배 → −3 (꼬마돌이 이상해꽃보다 세진 않아도 4배가 아니라 "가장 센 2배 이상" — 꼬마돌 ' + G.cur(unit(m, 'foe', 1, 1)) + ' vs 이상해꽃 ' + G.cur(unit(m, 'foe', 0)) + ')');
}
{ /* 영웅은 안 맞는다 · 바닥 1 · 힘 1 은 그냥 넘어간다 */
  const [, m] = rig(['꼬부기', '꼬부기', '꼬부기'], ['뮤츠', '파이리']);
  put(m, 'foe', '뮤츠', 0); put(m, 'me', '꼬부기', 0); ok(m.last.hit === null, '전설(에스퍼)은 물에 2배여도 안 맞는다');
  put(m, 'foe', '파이리', 0); m.turn = 'me'; put(m, 'me', '꼬부기', 1);
  const f = unit(m, 'foe', 0, 1); ok(m.last.hit && m.last.hit.id === '파이리' && G.cur(f) === Math.max(1, f.base - 2), '파이리 −2');
  f.dmg = f.base - 1; m.turn = 'me'; put(m, 'me', '꼬부기', 2); ok(m.last.hit === null && G.cur(f) === 1, '힘 1 은 더 못 깎는다 — 타격 없음');
}
/* ── 결속 — 같은 계통 비영웅이 같은 줄에 둘 이상이면 각각 기본 힘만큼 ── */
{
  const [, m] = rig(['이상해씨', '이상해풀', '이상해꽃', '피카츄'], ['꼬부기']);   /* 상대는 물 — 풀·독을 2배로 못 때려 합이 그대로 */
  const b = id => G.cardOf(data, id).power.heavy;
  put(m, 'me', '이상해씨', 1); ok(G.unitValue(data, m, 'me', 1, 0).bond === false && G.rowSum(data, m, 'me', 1) === b('이상해씨'), '혼자는 결속 없음');
  put(m, 'foe', '꼬부기', 1); m.turn = 'me'; put(m, 'me', '이상해풀', 1);
  ok(G.unitValue(data, m, 'me', 1, 0).bond && G.unitValue(data, m, 'me', 1, 1).bond && G.rowSum(data, m, 'me', 1) === 2 * (b('이상해씨') + b('이상해풀')), '둘이면 둘 다 두 배');
  m.turn = 'me'; put(m, 'me', '이상해꽃', 1); ok(G.rowSum(data, m, 'me', 1) === 2 * (b('이상해씨') + b('이상해풀') + b('이상해꽃')), '셋이면 셋 다');
  m.turn = 'me'; put(m, 'me', '피카츄', 1); ok(G.unitValue(data, m, 'me', 1, 3).bond === false, '다른 계통은 아니다');
  unit(m, 'me', 1, 0).dmg = 2; ok(G.unitValue(data, m, 'me', 1, 0).value === b('이상해씨') - 2 + b('이상해씨'), '피해를 받아도 더하는 값은 기본 힘');
  ok(G.rowSum(data, m, 'me', 0) === 0, '다른 줄엔 결속 없음');
}
{ /* 영웅은 결속에 안 든다 */
  const [, m] = rig(['뮤츠', '뮤'], ['파이리']);
  put(m, 'me', '뮤츠', 0); put(m, 'foe', '파이리', 0); m.turn = 'me'; put(m, 'me', '뮤', 0);
  ok(!G.unitValue(data, m, 'me', 0, 0).bond && G.rowSum(data, m, 'me', 0) === 13 + 10, '뮤츠·뮤는 계통이 달라 결속 없음, 영웅은 기본 힘');
}
/* ── 개방 — 한 판에 한 번, 내 판 위 비영웅 +5, 내 차례가 시작될 때마다 −1, 바닥은 개방 전 ── */
{
  const [, m] = rig(['꼬부기', '피카츄', '이브이', '뮤츠'], ['파이리', '파이리', '파이리', '파이리']);
  ok(G.open(data, m, 0, 0).why === 'lane' && G.legal(data, m, 'me').open.length === 0, '빈 줄은 못 연다');
  put(m, 'me', '꼬부기', 0); put(m, 'foe', '파이리', 0); m.turn = 'me'; put(m, 'me', '뮤츠', 1); put(m, 'foe', '파이리', 1); m.turn = 'me';
  ok(G.legal(data, m, 'me').open.length === 1 && G.legal(data, m, 'me').open[0].lane === 0 && G.open(data, m, 1, 0).why === 'rare', '열 수 있는 것은 비영웅뿐');
  const base = G.cur(unit(m, 'me', 0));
  ok(G.open(data, m, 0, 0).ok && unit(m, 'me', 0).open === 5 && m.me.opened && m.opens === 1 && G.cur(unit(m, 'me', 0)) === base + 5 && m.turn === 'foe', '개방 +5, 턴을 쓴다');
  put(m, 'foe', '파이리', 2);   /* 상대 수 → 내 차례 시작 → −1 */
  ok(m.turn === 'me' && unit(m, 'me', 0).open === 4 && G.cur(unit(m, 'me', 0)) === base + 4, '내 차례가 오면 −1');
  ok(G.open(data, m, 0, 0).why === 'opened' && G.legal(data, m, 'me').open.length === 0, '한 판에 한 번');
  put(m, 'me', '피카츄', 2); put(m, 'foe', '파이리', 2);
  ok(unit(m, 'me', 0).open === 3, '또 −1');
  G.pass(data, m); G.pass(data, m);
  ok(m.round === 2 && m.me.opened && G.legal(data, m, m.turn).open.length === 0 && m.me.rows[0].length === 0, '라운드가 바뀌어도 개방은 쓴 채, 판은 비었다');
  for (let k = 0; k < 6; k++) { m.turn = 'foe'; G.pass(data, m); m.turn = 'me'; }
  ok(true, '(바닥 검사는 아래)');
}
{ /* 바닥 — 개방분이 다 식어도 개방 전 현재 힘 아래로는 안 간다 */
  const [, m] = rig(['꼬부기'], ['파이리', '파이리', '파이리', '파이리', '파이리', '파이리', '파이리'], { first: 'foe' });
  m.turn = 'foe'; put(m, 'foe', '파이리', 0); put(m, 'me', '꼬부기', 0); m.turn = 'me';
  const base = G.cur(unit(m, 'me', 0)); G.open(data, m, 0, 0);
  for (let k = 0; k < 6; k++) { m.turn = 'foe'; put(m, 'foe', '파이리', 1); }
  ok(unit(m, 'me', 0).open === 0 && G.cur(unit(m, 'me', 0)) === base, '여섯 차례 뒤 개방 0, 힘은 개방 전으로');
}
/* ── 날씨판 — 줄을 골라 깐다, 양쪽 비영웅은 1, 영웅은 그대로, 또 내면 걷힘, 라운드 끝에 걷힘 ── */
{
  const [, m] = rig(['파이리|w', '꼬부기|w', '피카츄', '이상해씨', '이상해풀'], ['뮤츠', '파이리', '리자드|w']);
  put(m, 'me', '이상해씨', 0); put(m, 'foe', '뮤츠', 0); m.turn = 'me'; put(m, 'me', '이상해풀', 0); put(m, 'foe', '파이리', 0); m.turn = 'me';
  const before = G.rowSum(data, m, 'me', 0);
  ok(G.play(data, m, '파이리|w', 0).ok && m.weather[0] === 'hail' && m.last.kind === 'weather' && m.last.on === true && m.me.grave.includes('파이리|w') && m.weathers === 1 && m.turn === 'foe', '경장 줄에 싸라기눈, 날씨판은 묘지로');
  ok(G.rowSum(data, m, 'me', 0) === 2 && G.unitValue(data, m, 'me', 0, 0).weather && G.rowSum(data, m, 'foe', 0) === 13 + 1, '날씨 줄 — 양쪽 비영웅 1(결속 무시), 뮤츠는 13 그대로: ' + before + ' → 2');
  ok(G.sums(data, m).rows.me[0] === 2, '줄별 합도');
  G.pass(data, m); m.turn = 'me';   /* 상대 패스 */
  ok(G.play(data, m, '꼬부기|w', 0).ok && m.weather[0] === null && m.last.on === false && G.rowSum(data, m, 'me', 0) === before, '같은 줄에 또 내면 걷힌다');
  ok(G.play(data, m, '피카츄', 1).ok && m.turn === 'me', '(상대가 패스해 내 차례가 이어진다)');
  m.passed.foe = false; m.turn = 'foe';
  ok(G.play(data, m, '리자드|w', 1).ok && m.weather[1] === 'sand' && G.rowSum(data, m, 'me', 1) === 1, '상대도 날씨판을 — 중장 줄에 모래바람, 내 피카츄 1');
  m.turn = 'me'; G.pass(data, m); m.turn = 'foe'; G.pass(data, m);
  ok(m.round === 2 && m.weather.join() === ',,', '라운드가 끝나면 걷힌다');
}
{ /* 날씨판은 타격이 없고, 상대 영웅만 있는 줄에 깔아도 아무 일 없음 */
  const [, m] = rig(['꼬부기|w'], ['이상해씨']);
  put(m, 'foe', '이상해씨', 2); m.turn = 'me';
  ok(G.play(data, m, '꼬부기|w', 2).ok && m.last.hit === undefined && unit(m, 'foe', 2).dmg === 0 && G.rowSum(data, m, 'foe', 2) === 1, '날씨판 — 타격 없음, 비 깔림');
}

/* ── AI ── */
const playOut = (m, myLevel, foeLevel) => { let guard = 0; while (m.phase === 'play' && guard++ < 200) { const r = G.aiTurn(data, m, m.turn === 'me' ? myLevel : foeLevel); assert(r.ok, 'AI 가 불법 수: ' + JSON.stringify(r)); } assert(m.phase === 'done', '판이 안 끝난다'); return m; };
{
  const [, m] = freshMatch(3); G.confirm(data, m);
  const mv = G.aiMove(data, m, 'veteran'); ok(['play', 'pass', 'open'].includes(mv.kind), '첫 수: ' + mv.kind);
  for (let s = 0; s < 30; s++) { const [, g] = freshMatch(100 + s, 1 + (s % 9)); G.confirm(data, g); playOut(g, 'veteran', C.LEVELS[s % 3]); ok(g.roundLog.length >= 1 && g.roundLog.length <= 3 && ['me', 'foe', 'draw'].includes(g.winner), '판 ' + s + ' 끝: ' + g.winner); }
  { const [, a] = freshMatch(77); G.confirm(data, a); playOut(a, 'ace', 'ace'); const [, b] = freshMatch(77); G.confirm(data, b); playOut(b, 'ace', 'ace'); ok(JSON.stringify(a.log) === JSON.stringify(b.log), '같은 시드 같은 판 — AI 도'); }
  { let diff = 0; for (let s = 0; s < 20; s++) { const [, g] = freshMatch(200 + s); G.confirm(data, g); const r = G.aiMove(data, JSON.parse(JSON.stringify(g)), 'rookie'), v = G.aiMove(data, JSON.parse(JSON.stringify(g)), 'veteran'); if (JSON.stringify(r) !== JSON.stringify(v)) diff++; } ok(diff > 0, '신참은 무작위가 섞인다: ' + diff); }
  { /* 가장 센 줄에 놓는다 — 피카츄는 고기동 9 */
    const [, g] = rig(['피카츄'], ['파이리'], { exact: true });
    const mv = G.aiMove(data, g, 'veteran'); ok(mv.kind === 'play' && mv.id === '피카츄' && mv.lane === 2, '피카츄는 고기동 줄(9): ' + JSON.stringify(mv)); }
  { /* 앞서는데 상대가 패스하면 패스 */
    const [, g] = rig(['꼬부기', '피카츄'], ['파이리'], { first: 'foe' });
    put(g, 'me', '꼬부기', 0); g.turn = 'foe'; G.pass(data, g);
    ok(G.aiMove(data, g, 'veteran').kind === 'pass' && G.aiMove(data, g, 'ace').kind === 'pass', '앞서는데 상대 패스 → 패스');
    ok(G.aiMove(data, g, 'rookie').kind === 'play', '신참은 패스를 모른다'); }
  { /* 뒤지는데 손패 전부로도 못 뒤집으면 패스 */
    const [, g] = rig(['캐터피'], ['뮤츠', '뮤츠', '뮤츠'], { first: 'foe', exact: true });
    g.turn = 'foe'; put(g, 'foe', '뮤츠', 0); put(g, 'foe', '뮤츠', 1); put(g, 'foe', '뮤츠', 2); g.turn = 'me';
    ok(G.potential(data, g, 'me') < 39 && G.aiMove(data, g, 'veteran').kind === 'pass', '숙련 — 캐터피(+개방 5)로는 39 를 못 넘는다 → 패스'); }
  { /* 결속을 센다 — 같은 줄에 두 번째 단계를 */
    const [, g] = rig(['이상해씨', '이상해풀', '피카츄'], ['파이리', '파이리', '파이리'], { first: 'foe' });
    g.turn = 'foe'; put(g, 'foe', '파이리', 0); put(g, 'me', '이상해씨', 1);
    g.turn = 'foe'; put(g, 'foe', '파이리', 1); g.turn = 'me';
    const mv = G.aiMove(data, g, 'veteran'); ok(mv.kind === 'play' && mv.id === '이상해풀' && mv.lane === 1, '이상해풀을 이상해씨 줄(중장)에 — 결속: ' + JSON.stringify(mv)); }
  { /* 날씨판은 상대 줄이 셀 때 — 내 줄이 비고 상대 줄이 크면 값이 양 */
    const [, g] = rig(['파이리|w'], ['이상해꽃', '이상해씨'], { first: 'foe', exact: true });
    g.turn = 'foe'; put(g, 'foe', '이상해꽃', 0); put(g, 'foe', '이상해씨', 0); g.turn = 'me';
    const mv = G.aiMove(data, g, 'veteran'); ok(mv.kind === 'play' && mv.id === '파이리|w' && mv.lane === 0, '경장 줄(상대 결속 큰 줄)에 싸라기눈: ' + JSON.stringify(mv)); }
  { /* 에이스는 1라운드에 영웅·날씨·개방을 아낀다 — 목숨이 하나면 다 쓴다 */
    const [, g] = rig(['뮤츠', '파이리|w', '피카츄'], ['파이리', '파이리'], { exact: true, level: 'ace' });
    const mv = G.aiMove(data, g, 'ace'); ok(mv.kind === 'play' && mv.id === '피카츄', '에이스 1R — 뮤츠(영웅)는 아낀다, 날씨판은 값이 없어 안 낸다: ' + JSON.stringify(mv));
    g.round = 2; g.lives.me = 1; const mv2 = G.aiMove(data, g, 'ace'); ok(mv2.kind === 'play' && mv2.id === '뮤츠', '목숨 하나면 뮤츠: ' + JSON.stringify(mv2)); }
}
/* ── 정산 — 통계·보상·금 ── */
{
  const [pr, m] = freshMatch(5); G.confirm(data, m); playOut(m, 'veteran', 'rookie');
  ok(G.settle(data, pr, m) !== null && m.rewarded && G.settle(data, pr, m) === null, '정산은 한 번');
  const s = pr.stats.gwent, o = m.outcome;
  ok(s.games === 1 && s[o.result] === 1 && s.rounds === m.roundLog.length && s.byBoss[m.champion].games === 1 && s.byLevel.veteran.games === 1 && s.byMain[1].games === 1, '통계가 는다');
  ok(s.bestRound === Math.max(...m.roundLog.map(r => r.me)) && s.weather === m.weathers && s.opens === m.opens && m.played.every(id => s.cards[id].played === 1 && !G.isWeather(id)), '최고 합·날씨·개방·카드별(기본 이름으로)');
  ok(pr.stats.lane.games === 0, '진화 결투 통계는 그대로');
  ok(o.gold === (o.result === 'win' ? 20 : 3) && pr.gold === o.gold, '금');
  if (o.result === 'win') { ok(o.pool.length === 5 && o.picks === 3 && o.first && pr.beaten[m.champion].veteran === 1, '첫 승 — 뒷장 5, 3장'); ok(G.pickReward(data, pr, m, 0).ok && pr.owned.includes(o.pool[0]), '뒤집기'); ok(G.finishRewards(data, pr, m).length === 2 && o.taken.length === 3, '나머지 자동'); }
  else ok(o.pool.length === 0 && o.picks === 0, '지면 보상 없음');
  const v = G.statsView(data, pr); ok(v.line.games === 1 && v.byBoss.length === 9 && typeof v.bestRound === 'number' && typeof v.weather === 'number' && typeof v.opens === 'number', '전적 보기 — 최고 합·날씨·개방');
  { const old = C.upgradeProfile({ main: 1, owned: ['피카츄'], decks: { lane: ['피카츄'] }, stats: { lane: { games: 3 } } }, data);
    ok(old.decks.gwent.length === 0 && old.stats.gwent.games === 0 && old.stats.gwent.bestRound === 0 && old.stats.lane.games === 3 && old.stats.lane.bestRound === 0, '옛 저장(gwent 없음)도 올린다'); }
}
/* ── 균형 보고 — 세대 9 × 난이도 3 × 시드 11 = 297판, 거기에 난이도 맞대결 ── */
if (!quick) {
  const perGen = {}, first = { w: 0, n: 0 }; let rounds = 0, games = 0, draws = 0, opens = 0, weathers = 0, strikes = 0;
  for (const ch of data.lane.champions) for (let li = 0; li < C.LEVELS.length; li++) for (let s = 0; s < 11; s++) {
    const lv = C.LEVELS[li], seed = ch.gen * 1000 + li * 100 + s;
    const pr = C.newProfile(data, ch.gen, seed); C.setDeck(pr, 'gwent', G.championDeck(data, { rngState: seed }, ch.gen, 'veteran'));
    const m = G.newMatch(data, pr, ch.ally, lv, seed); G.confirm(data, m); playOut(m, 'veteran', lv);
    games++; rounds += m.roundLog.length; opens += m.log.filter(e => e.t === 'open').length; weathers += m.log.filter(e => e.t === 'weather').length; strikes += m.log.filter(e => e.t === 'play' && e.hit).length;
    perGen[ch.gen] = perGen[ch.gen] || { w: 0, n: 0 }; perGen[ch.gen].n++;
    if (m.winner === 'draw') draws++; else { first.n++; if (m.winner === m.coin) first.w++; if (m.winner === 'me') perGen[ch.gen].w++; }
  }
  /* 난이도 맞대결 — 내 쪽은 그 난이도의 결정과 덱(에이스는 전설 4 + 날씨판 2)으로, 상대는 아래 난이도로. 플레이어가 만나는 것이 결정 + 덱이다 */
  const duel = (a, b, n) => { let w = 0, d = 0; for (let s = 0; s < n; s++) { const g = 1 + (s % 9), pr = C.newProfile(data, g, 500 + s); C.setDeck(pr, 'gwent', G.championDeck(data, { rngState: 500 + s }, g, a)); const m = G.newMatch(data, pr, G.championOf(data, g).ally, b, 500 + s); G.confirm(data, m); playOut(m, a, b); if (m.winner === 'me') w++; else if (m.winner === 'draw') d++; } return { w, d, n }; };
  const vr = duel('veteran', 'rookie', 60), av = duel('ace', 'veteran', 60);
  const pct = x => Math.round(x * 100);
  console.log(`\n폼 결투 ${games}판 — 선공 승률 ${pct(first.w / first.n)}% (무승부 ${draws}) · 평균 라운드 ${(rounds / games).toFixed(2)} · 판당 개방 ${(opens / games).toFixed(2)} 날씨 ${(weathers / games).toFixed(2)} 타격 ${(strikes / games).toFixed(1)} · FIRST_BONUS=${G.FIRST_BONUS}`);
  for (const g in perGen) console.log(`  ${g}세대  ${String(pct(perGen[g].w / perGen[g].n)).padStart(3)}%  (${perGen[g].n})`);
  console.log(`  숙련 vs 신참 ${pct(vr.w / vr.n)}% (무 ${vr.d}) · 에이스 vs 숙련 ${pct(av.w / av.n)}% (무 ${av.d})`);
  assert(first.w / first.n >= 0.4 && first.w / first.n <= 0.6, '선공 승률이 40~60% 밖 — FIRST_BONUS 를 조정한다');
  for (const g in perGen) assert(perGen[g].w / perGen[g].n >= 0.25 && perGen[g].w / perGen[g].n <= 0.75, g + '세대 승률이 25~75% 밖');
  assert(vr.w / vr.n >= 0.55, '숙련이 신참을 55% 는 이겨야 한다');
  assert(av.w / av.n >= 0.55, '에이스가 숙련을 55% 는 이겨야 한다');
}

console.log('PASS 폼 결투 규칙: ' + n + ' 가지');
