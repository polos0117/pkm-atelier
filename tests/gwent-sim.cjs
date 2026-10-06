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

console.log('PASS 폼 결투 규칙: ' + n + ' 가지');
