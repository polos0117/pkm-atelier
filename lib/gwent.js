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

  /* ── 덱 규칙 여섯 — 25장 · 주 세대 15 · 전설 4 · 날씨판 3 · 같은 id 1 — 과 안 가진 카드·풀에 없는 카드·일상컷 없는 날씨판 ── */
  function canUse(data, profile, id) { var c = cardOf(data, id); return !!(c && profile.owned.indexOf(c.name) >= 0 && C.inPool(data, c.name)); }
  function validateDeck(data, profile) {
    var deck = C.deckOf(profile, 'gwent'), out = { ok: true, problems: [], n: deck.length, main: 0, rare: 0, weather: 0 };
    var seen = {}, dup = false, owned = false, i, id, c;
    for (i = 0; i < deck.length; i++) {
      id = deck[i]; c = cardOf(data, id);
      if (!canUse(data, profile, id)) { owned = true; continue; }
      if (c.gen === profile.main) out.main++;
      if (c.rare) out.rare++;
      if (c.weather) out.weather++;
      if (seen[id]) dup = true; seen[id] = 1;
    }
    if (out.n !== C.DECK) out.problems.push('count');
    if (out.main < MAIN_MIN) out.problems.push('main');
    if (out.rare > RARE_MAX) out.problems.push('rare');
    if (out.weather > WEATHER_MAX) out.problems.push('weather');
    if (dup) out.problems.push('dup');
    if (owned) out.problems.push('owned');
    out.ok = out.problems.length === 0;
    return out;
  }
  function toggleDeck(data, profile, id) {
    var deck = C.deckOf(profile, 'gwent'), i = deck.indexOf(id);
    if (i >= 0) { deck.splice(i, 1); return { ok: true }; }
    if (!canUse(data, profile, id)) return { ok: false, why: 'owned' };
    deck.push(id);
    return { ok: true };
  }
  function setMain(profile, gen) { profile.main = gen; return profile; }
  /* 자동 채우기 — 모르는·안 가진·겹친 id 를 빼고, 전설·날씨판이 넘치면 약한 것부터, 25 가 넘으면 주 세대 아닌 약한 것부터, 모자라면 주 세대 센 것부터(날씨판은 안 넣는다) */
  function autoFill(data, profile) {
    var deck = C.deckOf(profile, 'gwent'), out = { ok: false, added: [], removed: [] }, seen = {}, keep = [], i, id, cands, k, s;
    function counts() { var m = { main: 0, rare: 0, weather: 0 }, j, x; for (j = 0; j < deck.length; j++) { x = cardOf(data, deck[j]); if (x.gen === profile.main) m.main++; if (x.rare) m.rare++; if (x.weather) m.weather++; } return m; }
    for (i = 0; i < deck.length; i++) {
      id = deck[i];
      if (!canUse(data, profile, id) || seen[id]) { out.removed.push(id); continue; }
      seen[id] = 1; keep.push(id);
    }
    deck.length = 0; for (i = 0; i < keep.length; i++) deck.push(keep[i]);
    function weakestFirst(a, b) {
      var x = cardOf(data, a), y = cardOf(data, b), mx = x.gen === profile.main ? 1 : 0, my = y.gen === profile.main ? 1 : 0;
      return (mx - my) || (best(x) - best(y)) || a.localeCompare(b);
    }
    function drop(filter) {
      var list = deck.filter(filter).sort(weakestFirst);
      if (!list.length) return false;
      deck.splice(deck.indexOf(list[0]), 1); out.removed.push(list[0]);
      return true;
    }
    while (counts().rare > RARE_MAX && drop(function (x) { return cardOf(data, x).rare; })) { /* 전설부터 */ }
    while (counts().weather > WEATHER_MAX && drop(function (x) { return cardOf(data, x).weather; })) { /* 날씨판 */ }
    while (deck.length > C.DECK && drop(function () { return true; })) { /* 약한 것부터 */ }
    cands = profile.owned.filter(function (x) { return canUse(data, profile, x) && deck.indexOf(x) < 0; });
    cands.sort(function (a, b) { return (best(cardOf(data, b)) - best(cardOf(data, a))) || a.localeCompare(b); });
    for (k = 0; k < 2 && deck.length < C.DECK; k++) {
      for (i = 0; i < cands.length && deck.length < C.DECK; i++) {
        s = cands[i];
        if (deck.indexOf(s) >= 0 || (cardOf(data, s).rare && counts().rare >= RARE_MAX)) continue;
        if (k === 0 && (cardOf(data, s).gen !== profile.main || counts().main >= MAIN_MIN)) continue;
        deck.push(s); out.added.push(s);
      }
    }
    out.ok = validateDeck(data, profile).ok;
    return out;
  }

  /* ── 챔피언 — data/lane.json 의 아홉을 그대로. 자기 세대 17 + 이웃 8. 숙련은 계통이 완성된 것부터, 에이스는 전설 4 + 날씨판 2 ── */
  function championOf(data, gen) {
    var i, list = data.lane.champions; for (i = 0; i < list.length; i++) if (list[i].gen === gen) return list[i];
    return null;
  }
  function championReady(data, gen) {
    var ch = championOf(data, gen), own = ch ? C.genCards(data, gen, false).length : 0, ally = ch ? C.genCards(data, ch.ally, false).length : 0;
    return { ok: !!ch && own >= CHAMP_OWN && ally >= CHAMP_ALLY, own: own, ally: ally, need: Math.max(0, CHAMP_OWN - own) + Math.max(0, CHAMP_ALLY - ally) };
  }
  function championPortrait(data, gen) {
    var D = cardsOf(data), by = C.byName(data), bestName = null, bestBst = -1, i, c;
    for (i = 0; i < D.pool.length; i++) { c = by[D.pool[i]]; if (c.gen === gen && C.bst(c) > bestBst) { bestBst = C.bst(c); bestName = c.name; } }
    return bestName;
  }
  function byBestDesc(data) { return function (a, b) { return best(cardOf(data, b)) - best(cardOf(data, a)) || a.localeCompare(b); }; }
  /* 계통이 완성된 것(풀 안에 계통이 통째로)부터 — 계통은 맨 위 힘이 큰 차례, 그 뒤 나머지를 힘 차례로 */
  function strongLines(data, names, n) {
    var seen = {}, lines = [], rest = [], out = [], i, j, l, top;
    for (i = 0; i < names.length; i++) {
      if (seen[names[i]]) continue;
      l = C.lineOf(data, names[i]).names.filter(function (x) { return names.indexOf(x) >= 0; });
      for (j = 0; j < l.length; j++) seen[l[j]] = 1;
      if (l.length > 1) lines.push(l); else rest.push(l[0]);
    }
    top = function (l) { var m = 0, j; for (j = 0; j < l.length; j++) m = Math.max(m, best(cardOf(data, l[j]))); return m; };
    lines.sort(function (a, b) { return top(b) - top(a) || a[0].localeCompare(b[0]); });
    for (i = 0; i < lines.length; i++) { if (out.length + lines[i].length <= n) out = out.concat(lines[i]); else rest = rest.concat(lines[i]); }
    rest.sort(byBestDesc(data));
    return out.concat(rest).slice(0, n);
  }
  function championDeck(data, rng, gen, level) {
    var D = cardsOf(data), ch = championOf(data, gen), own, ally, rare, w, i, out;
    own = C.genCards(data, gen, false); ally = C.genCards(data, ch.ally, false);
    if (level === 'rookie') { own = C.shuffle(rng, own).slice(0, CHAMP_OWN); ally = C.shuffle(rng, ally).slice(0, CHAMP_ALLY); }
    else { own = strongLines(data, own, CHAMP_OWN); ally = strongLines(data, ally, CHAMP_ALLY); }
    if (level === 'ace') {   /* 전설 4(자기 세대 먼저, 모자라면 이웃) + 자기 세대 날씨판 2(일상컷이 있는 센 것부터) — 자기 세대의 약한 것부터 뺀다 */
      rare = C.genCards(data, gen, true).sort(byBestDesc(data)).slice(0, CHAMP_RARE);
      if (rare.length < CHAMP_RARE) rare = rare.concat(C.genCards(data, ch.ally, true).sort(byBestDesc(data)).slice(0, CHAMP_RARE - rare.length));
      w = C.genCards(data, gen, false).filter(function (x) { return D.cards[x].casual; }).sort(byBestDesc(data)).slice(0, CHAMP_WEATHER).map(function (x) { return x + WSUF; });
      own.sort(byBestDesc(data));
      own = own.slice(0, Math.max(0, own.length - rare.length - w.length)).concat(rare, w);
    }
    out = own.concat(ally);
    for (i = 0; i < out.length; i++) if (!cardOf(data, out[i])) throw new Error('championDeck: ' + out[i]);
    return out;
  }

  var api = {
    VERSION: VERSION, HAND: HAND, MULLIGAN: MULLIGAN, LIVES: LIVES, MAX_ROUNDS: MAX_ROUNDS, ROWS: ROWS,
    MAIN_MIN: MAIN_MIN, RARE_MAX: RARE_MAX, WEATHER_MAX: WEATHER_MAX, POWER_MIN: POWER_MIN, POWER_MAX: POWER_MAX,
    STRIKE_2: STRIKE_2, STRIKE_4: STRIKE_4, OPEN_BONUS: OPEN_BONUS, OPEN_BLEED: OPEN_BLEED, FIRST_BONUS: FIRST_BONUS,
    CHAMP_OWN: CHAMP_OWN, CHAMP_ALLY: CHAMP_ALLY, CHAMP_RARE: CHAMP_RARE, CHAMP_WEATHER: CHAMP_WEATHER, FORMS: FORMS, LEVELS: LEVELS, WSUF: WSUF,
    derive: derive, cardsOf: cardsOf, cardOf: cardOf, isWeather: isWeather, baseName: baseName, weatherOf: weatherOf, best: best,
    canUse: canUse, validateDeck: validateDeck, toggleDeck: toggleDeck, setMain: setMain, autoFill: autoFill, championOf: championOf, championReady: championReady, championPortrait: championPortrait, championDeck: championDeck
  };
  root.AtelierGwent = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
