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

console.log('PASS 폼 결투 규칙: ' + n + ' 가지');
