/* 폼 결투(궨트식) 엔진 — 세 줄(경장·중장·고기동)의 힘 합으로 세 라운드 중 둘. 줄이 폼이라 힘이 줄마다 다르다.
   놓을 때 상성 타격, 같은 계통은 결속, 개방은 +5 뒤 내 차례마다 −1, 날씨판은 줄을 1로. 놀이 규칙은 여기에만 있다.
   화면(gwent.html)은 상태를 그리고 단추를 넘길 뿐이다. 컬렉션·보상·금·상점은 lib/collection.js 가 맡는다(진화 결투와 같이).
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierGwent 하나만 붙이고, node 에서는 module.exports.
   상태(st)는 통째로 JSON. 난수도 st.rngState 정수 하나(mulberry32)라서 같은 seed 는 같은 판 — tests/gwent-sim.cjs 가 그걸 믿는다.
   설계: docs/superpowers/specs/2026-10-06-gwent-duel-design.md */
(function (root) {
  'use strict';
  var C = root.AtelierCollection || (typeof require === 'function' ? require('./collection.js') : null);

  var VERSION = 1;
  var HAND = 10, MULLIGAN = 2, LIVES = 2, MAX_ROUNDS = 3, ROWS = 3;
  var MAIN_MIN = 15, RARE_MAX = 4, WEATHER_MAX = 3;
  var POWER_DIV = 20, POWER_MIN = 1, POWER_MAX = 15;      /* 힘 = 종족값 쌍 / 20 → 1~15 */
  var STRIKE_2 = 2, STRIKE_4 = 3;                         /* 상성 타격 — 2배 −2, 4배 −3 */
  var OPEN_BONUS = 5, OPEN_BLEED = 1;                     /* 개방 +5, 그 뒤 내 차례가 시작될 때마다 −1 */
  var FIRST_BONUS = 8;                                    /* 1라운드 선공 보정 — 균형 보고로 잰다 */
  var CHAMP_OWN = 17, CHAMP_ALLY = 8, CHAMP_RARE = 4, CHAMP_WEATHER = 2;
  var FORMS = C.FORMS, LEVELS = C.LEVELS, WSUF = '|w';
  var WEATHER_DEFAULT = { light: 'hail', heavy: 'sand', mobility: 'rain' };

  /* ── 파생 ── */
  function clamp(x) { return Math.max(POWER_MIN, Math.min(POWER_MAX, x)); }
  /* 일상컷이 어느 화풍에든 있나 — 날씨판이 되려면 */
  function hasCasual(img, name) {
    var e = img && img[name], bs = e && e.byStyle, k, c;
    if (!bs) return false;
    for (k in bs) { c = bs[k].casual; if (!c) continue; if (Array.isArray(c) ? c.length : ((c.f && c.f.length) || (c.m && c.m.length))) return true; }
    return false;
  }
  function derive(data) {
    var out = { cards: {}, list: [], pool: C.pool(data) }, ov = (data.gwent && data.gwent.overrides) || {}, i, c, o, s, card;
    for (i = 0; i < data.cards.length; i++) {
      c = data.cards[i]; o = ov[c.name] || {}; s = c.stats;
      card = { name: c.name, no: c.no, gen: c.gen, types: c.element2 ? [c.element, c.element2] : [c.element],
        power: { light: clamp(o.light || Math.round((s[1] + s[3]) / POWER_DIV)), heavy: clamp(o.heavy || Math.round((s[2] + s[4]) / POWER_DIV)), mobility: clamp(o.mobility || Math.round(s[5] * 2 / POWER_DIV)) },
        line: C.lineOf(data, c.name).root, rare: !!c.rare, casual: !!data.allowAll || hasCasual(data.img, c.name) };
      out.cards[card.name] = card; out.list.push(card.name);
    }
    return out;
  }
  function cardsOf(data) { if (!data.__gwent) data.__gwent = derive(data); return data.__gwent; }
  function isWeather(id) { return typeof id === 'string' && id.length > WSUF.length && id.slice(-WSUF.length) === WSUF; }
  function baseName(id) { return isWeather(id) ? id.slice(0, -WSUF.length) : id; }
  function weatherOf(data, row) { var w = (data.gwent && data.gwent.weather) || WEATHER_DEFAULT; return w[FORMS[row]] || WEATHER_DEFAULT[FORMS[row]]; }
  /* 덱 id → 카드. 날씨판 id(이름|w)는 일상컷이 있는 카드만 — 없으면 null(모르는 카드와 같이 다룬다) */
  function cardOf(data, id) {
    var c = cardsOf(data).cards[baseName(id)];
    if (!c) return null;
    if (!isWeather(id)) return c;
    if (!c.casual) return null;
    return { name: c.name, id: id, no: c.no, gen: c.gen, types: [], power: { light: 0, heavy: 0, mobility: 0 }, line: null, rare: false, weather: true };
  }
  function best(c) { return Math.max(c.power.light, c.power.heavy, c.power.mobility); }

  var api = {
    VERSION: VERSION, HAND: HAND, MULLIGAN: MULLIGAN, LIVES: LIVES, MAX_ROUNDS: MAX_ROUNDS, ROWS: ROWS,
    MAIN_MIN: MAIN_MIN, RARE_MAX: RARE_MAX, WEATHER_MAX: WEATHER_MAX, POWER_MIN: POWER_MIN, POWER_MAX: POWER_MAX,
    STRIKE_2: STRIKE_2, STRIKE_4: STRIKE_4, OPEN_BONUS: OPEN_BONUS, OPEN_BLEED: OPEN_BLEED, FIRST_BONUS: FIRST_BONUS,
    CHAMP_OWN: CHAMP_OWN, CHAMP_ALLY: CHAMP_ALLY, CHAMP_RARE: CHAMP_RARE, CHAMP_WEATHER: CHAMP_WEATHER, FORMS: FORMS, LEVELS: LEVELS, WSUF: WSUF,
    derive: derive, cardsOf: cardsOf, cardOf: cardOf, isWeather: isWeather, baseName: baseName, weatherOf: weatherOf, best: best
  };
  root.AtelierGwent = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
