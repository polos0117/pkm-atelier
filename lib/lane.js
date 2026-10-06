/* 진화 결투(줄 싸움) 엔진 — 세 줄 1 대 1, 힘 × 상성, 동점은 속도, 줄 위에서 진화. 놀이 규칙은 여기에만 있다.
   화면(lane.html)은 상태를 그리고 단추를 넘길 뿐이다. 컬렉션·보상·금·상점은 lib/collection.js 가 맡는다.
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierLane 하나만 붙이고, node 에서는 module.exports.
   상태(st)는 통째로 JSON. 난수도 st.rngState 정수 하나(mulberry32)라서 같은 seed 는 같은 판 —
   검사(tests/lane-sim.cjs)가 그걸 믿고 297판을 굴린다.
   설계: docs/superpowers/specs/2026-10-06-lane-duel-design.md */
(function (root) {
  'use strict';
  var C = root.AtelierCollection || (typeof require === 'function' ? require('./collection.js') : null);

  var VERSION = 1;
  var HAND = 8, REFILL = 3, MULLIGAN = 2, LIVES = 2, MAX_ROUNDS = 3, LANES = 3;
  var MAIN_MIN = 15, RARE_MAX = 4;
  var POWER_DIV = 50;                                    /* 힘 = 종족값 합 / 50 → 4~14 */
  var EVO_BONUS = { light: 4, heavy: 2, mobility: 2 };   /* 키운 보너스 — 단계마다. 경장은 두 배 */
  var OPEN_MULT = 2;                                     /* 개방 — 한 판에 한 번, 줄 하나의 힘 두 배 */
  /* 선공 보정 — 뒤에 놓는 쪽이 상성으로 받아친다. 선공은 시작 손패를 이만큼 더 받는다.
     값은 Task 6 의 균형 보고(AI 끼리 297판, 선공 승률 40~60%)로 정한다 */
  var FIRST_CARDS = 1;
  var CHAMP_OWN = 17, CHAMP_ALLY = 8, CHAMP_RARE = 4;
  var FORMS = C.FORMS, LEVELS = C.LEVELS;

  /* ── 파생 ── */
  function derive(data) {
    var out = { cards: {}, list: [], pool: C.pool(data) }, ov = (data.lane && data.lane.overrides) || {}, i, c, o, card;
    for (i = 0; i < data.cards.length; i++) {
      c = data.cards[i]; o = ov[c.name] || {};
      card = { name: c.name, no: c.no, gen: c.gen, types: c.element2 ? [c.element, c.element2] : [c.element],
        bst: C.bst(c), power: o.power || Math.round(C.bst(c) / POWER_DIV), speed: c.stats[5],
        from: c.from || null, to: (c.to || []).slice(), rare: !!c.rare };
      out.cards[card.name] = card; out.list.push(card.name);
    }
    return out;
  }
  function cardsOf(data) { if (!data.__lane) data.__lane = derive(data); return data.__lane; }

  /* ── 덱 규칙 넷 — 25장 · 주 세대 15 · 전설 4 · 같은 카드 1 — 과 안 가진 카드·풀에 없는 카드 ── */
  function validateDeck(data, profile) {
    var D = cardsOf(data), deck = C.deckOf(profile, 'lane'), out = { ok: true, problems: [], n: deck.length, main: 0, rare: 0 };
    var seen = {}, dup = false, owned = false, i, id, c;
    for (i = 0; i < deck.length; i++) {
      id = deck[i]; c = D.cards[id];
      if (!c || profile.owned.indexOf(id) < 0 || !C.inPool(data, id)) { owned = true; continue; }
      if (c.gen === profile.main) out.main++;
      if (c.rare) out.rare++;
      if (seen[id]) dup = true; seen[id] = 1;
    }
    if (out.n !== C.DECK) out.problems.push('count');
    if (out.main < MAIN_MIN) out.problems.push('main');
    if (out.rare > RARE_MAX) out.problems.push('rare');
    if (dup) out.problems.push('dup');
    if (owned) out.problems.push('owned');
    out.ok = out.problems.length === 0;
    return out;
  }
  function toggleDeck(data, profile, id) {
    var deck = C.deckOf(profile, 'lane'), i = deck.indexOf(id);
    if (i >= 0) { deck.splice(i, 1); return { ok: true }; }
    if (profile.owned.indexOf(id) < 0 || !cardsOf(data).cards[id] || !C.inPool(data, id)) return { ok: false, why: 'owned' };
    deck.push(id);
    return { ok: true };
  }
  function setMain(profile, gen) { profile.main = gen; return profile; }
  /* 자동 채우기 — 모르는·안 가진·겹친 카드를 빼고, 넘치면 약한 것(주 세대 아닌 것)부터, 모자라면 주 세대 센 것부터 */
  function autoFill(data, profile) {
    var D = cardsOf(data), deck = C.deckOf(profile, 'lane'), out = { ok: false, added: [], removed: [] }, seen = {}, keep = [], i, id, cands, k, s;
    function counts() { var n = { main: 0, rare: 0 }, j, x; for (j = 0; j < deck.length; j++) { x = D.cards[deck[j]]; if (x.gen === profile.main) n.main++; if (x.rare) n.rare++; } return n; }
    for (i = 0; i < deck.length; i++) {
      id = deck[i];
      if (!D.cards[id] || profile.owned.indexOf(id) < 0 || !C.inPool(data, id) || seen[id]) { out.removed.push(id); continue; }
      seen[id] = 1; keep.push(id);
    }
    deck.length = 0; for (i = 0; i < keep.length; i++) deck.push(keep[i]);
    function weakestFirst(a, b) {
      var x = D.cards[a], y = D.cards[b], mx = x.gen === profile.main ? 1 : 0, my = y.gen === profile.main ? 1 : 0;
      return (mx - my) || (x.power - y.power) || a.localeCompare(b);
    }
    function drop(filter) {
      var list = deck.filter(filter).sort(weakestFirst);
      if (!list.length) return false;
      deck.splice(deck.indexOf(list[0]), 1); out.removed.push(list[0]);
      return true;
    }
    while (counts().rare > RARE_MAX && drop(function (x) { return D.cards[x].rare; })) { /* 전설부터 */ }
    while (deck.length > C.DECK && drop(function () { return true; })) { /* 약한 것부터 */ }
    cands = profile.owned.filter(function (x) { return D.cards[x] && C.inPool(data, x) && deck.indexOf(x) < 0; });
    cands.sort(function (a, b) { return (D.cards[b].power - D.cards[a].power) || a.localeCompare(b); });
    for (k = 0; k < 2 && deck.length < C.DECK; k++) {
      for (i = 0; i < cands.length && deck.length < C.DECK; i++) {
        s = cands[i];
        if (deck.indexOf(s) >= 0 || (D.cards[s].rare && counts().rare >= RARE_MAX)) continue;
        if (k === 0 && (D.cards[s].gen !== profile.main || counts().main >= MAIN_MIN)) continue;
        deck.push(s); out.added.push(s);
      }
    }
    out.ok = validateDeck(data, profile).ok;
    return out;
  }

  /* ── 챔피언 — 자기 세대 17 + 이웃 세대 8. 숙련은 계통이 완성된 것부터 세게, 에이스는 전설 4 ── */
  function championOf(data, gen) {
    var i, list = data.lane.champions; for (i = 0; i < list.length; i++) if (list[i].gen === gen) return list[i];
    return null;
  }
  function championReady(data, gen) {
    var ch = championOf(data, gen), own = ch ? C.genCards(data, gen, false).length : 0, ally = ch ? C.genCards(data, ch.ally, false).length : 0;
    return { ok: !!ch && own >= CHAMP_OWN && ally >= CHAMP_ALLY, own: own, ally: ally, need: Math.max(0, CHAMP_OWN - own) + Math.max(0, CHAMP_ALLY - ally) };
  }
  function championPortrait(data, gen) {
    var D = cardsOf(data), best = null, i, c;
    for (i = 0; i < D.pool.length; i++) { c = D.cards[D.pool[i]]; if (c.gen === gen && (!best || c.bst > best.bst)) best = c; }
    return best ? best.name : null;
  }
  /* 계통이 완성된 것(풀 안에 계통이 통째로)부터 — 계통은 맨 위 힘이 큰 차례, 그 뒤 나머지를 힘 차례로 */
  function strongLines(data, names, n) {
    var D = cardsOf(data), seen = {}, lines = [], rest = [], out = [], i, j, l, top;
    for (i = 0; i < names.length; i++) {
      if (seen[names[i]]) continue;
      l = C.lineOf(data, names[i]).names.filter(function (x) { return names.indexOf(x) >= 0; });
      for (j = 0; j < l.length; j++) seen[l[j]] = 1;
      if (l.length > 1) lines.push(l); else rest.push(l[0]);
    }
    top = function (l) { var m = 0, j; for (j = 0; j < l.length; j++) m = Math.max(m, D.cards[l[j]].power); return m; };
    lines.sort(function (a, b) { return top(b) - top(a) || a[0].localeCompare(b[0]); });
    for (i = 0; i < lines.length; i++) { if (out.length + lines[i].length <= n) out = out.concat(lines[i]); else rest = rest.concat(lines[i]); }
    rest.sort(function (a, b) { return D.cards[b].power - D.cards[a].power || a.localeCompare(b); });
    return out.concat(rest).slice(0, n);
  }
  function byPowerDesc(D) { return function (a, b) { return D.cards[b].power - D.cards[a].power || a.localeCompare(b); }; }
  function championDeck(data, rng, gen, level) {
    var D = cardsOf(data), ch = championOf(data, gen), own, ally, rare, i, out;
    own = C.genCards(data, gen, false); ally = C.genCards(data, ch.ally, false);
    if (level === 'rookie') { own = C.shuffle(rng, own).slice(0, CHAMP_OWN); ally = C.shuffle(rng, ally).slice(0, CHAMP_ALLY); }
    else { own = strongLines(data, own, CHAMP_OWN); ally = strongLines(data, ally, CHAMP_ALLY); }
    if (level === 'ace') {   /* 전설 4 — 자기 세대 전설을 센 차례로, 모자라면 이웃 세대 전설. 자기 세대의 약한 것부터 뺀다 */
      rare = C.genCards(data, gen, true).sort(byPowerDesc(D)).slice(0, CHAMP_RARE);
      if (rare.length < CHAMP_RARE) rare = rare.concat(C.genCards(data, ch.ally, true).sort(byPowerDesc(D)).slice(0, CHAMP_RARE - rare.length));
      own.sort(byPowerDesc(D));
      own = own.slice(0, own.length - rare.length).concat(rare);
    }
    out = own.concat(ally);
    for (i = 0; i < out.length; i++) if (!D.cards[out[i]]) throw new Error('championDeck: ' + out[i]);
    return out;
  }

  var api = {
    VERSION: VERSION, HAND: HAND, REFILL: REFILL, MULLIGAN: MULLIGAN, LIVES: LIVES, MAX_ROUNDS: MAX_ROUNDS, LANES: LANES,
    MAIN_MIN: MAIN_MIN, RARE_MAX: RARE_MAX, POWER_DIV: POWER_DIV, EVO_BONUS: EVO_BONUS, OPEN_MULT: OPEN_MULT, FIRST_CARDS: FIRST_CARDS,
    CHAMP_OWN: CHAMP_OWN, CHAMP_ALLY: CHAMP_ALLY, FORMS: FORMS, LEVELS: LEVELS,
    derive: derive, cardsOf: cardsOf, validateDeck: validateDeck, toggleDeck: toggleDeck, setMain: setMain, autoFill: autoFill,
    championOf: championOf, championReady: championReady, championPortrait: championPortrait, championDeck: championDeck
  };
  root.AtelierLane = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
