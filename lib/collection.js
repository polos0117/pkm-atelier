/* 두 결투(진화 결투 · 궨트식)가 같이 쓰는 컬렉션 — 풀·계통·프로필·덱 보관·통계 그릇·보상·금·상점.
   놀이 규칙은 하나도 없다. 그건 lib/lane.js(와 뒤에 올 궨트식 엔진)에 있다.
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierCollection 하나만 붙이고, node 에서는 module.exports.
   설계: docs/superpowers/specs/2026-10-06-lane-duel-design.md */
(function (root) {
  'use strict';

  var VERSION = 1, DECK = 25, GAMES = ['lane', 'gwent'];
  var START_MAIN = 17, START_OTHER = 8;          /* 시작 컬렉션 — 주 세대 비전설 17(계통 단위) + 다른 세대 비전설 8 */
  var LEVELS = ['rookie', 'veteran', 'ace'];
  var FORMS = ['light', 'heavy', 'mobility'];     /* 풀에 들려면 이 셋의 초상이 다 있어야 한다 */
  var BST_MIN = 175, BST_MAX = 720;

  /* ── 난수 (mulberry32) — 상태는 st.rngState 정수 하나 ── */
  function rand(st) {
    st.rngState = (st.rngState + 0x6D2B79F5) | 0;
    var t = st.rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function randInt(st, n) { return Math.floor(rand(st) * n); }
  function shuffle(st, list) {
    for (var i = list.length - 1; i > 0; i--) { var j = randInt(st, i + 1), x = list[i]; list[i] = list[j]; list[j] = x; }
    return list;
  }

  /* ── 자료 ── */
  function byName(data) {
    var i; if (data.__by) return data.__by;
    data.__by = {}; for (i = 0; i < data.cards.length; i++) data.__by[data.cards[i].name] = data.cards[i];
    return data.__by;
  }
  function bst(c) { var s = 0, i; for (i = 0; i < c.stats.length; i++) s += c.stats[i]; return s; }
  /* 폼 초상 셋이 어느 화풍에서든 다 있나 */
  function hasForms(img, name) {
    var e = img && img[name], bs = e && e.byStyle, k, b, f;
    if (!bs) return false;
    for (k in bs) {
      b = bs[k].byForm; if (!b) continue;
      for (f = 0; f < FORMS.length; f++) if (!b[FORMS[f]] || !b[FORMS[f]].f) break;
      if (f === FORMS.length) return true;
    }
    return false;
  }
  function pool(data) {
    var out, i; if (data.__pool) return data.__pool;
    out = []; for (i = 0; i < data.cards.length; i++) if (data.allowAll || hasForms(data.img, data.cards[i].name)) out.push(data.cards[i].name);
    data.__pool = out; return out;
  }
  function inPool(data, name) {
    var p, i; if (!data.__poolSet) { data.__poolSet = {}; p = pool(data); for (i = 0; i < p.length; i++) data.__poolSet[p[i]] = 1; }
    return !!data.__poolSet[name];
  }
  /* 계통 — from 을 따라 뿌리로, 뿌리에서 to 를 따라 전부. 되돌이표·없는 이름이 있어도 끝난다 */
  function lineOf(data, name) {
    var by = byName(data), seen = {}, out = [], q, cur, i, c, nxt;
    if (data.__line && data.__line[name]) return data.__line[name];
    cur = name;
    while (by[cur] && by[cur].from && by[by[cur].from] && !seen[cur]) { seen[cur] = 1; cur = by[cur].from; }
    seen = {}; q = [cur];
    while (q.length) {
      c = q.shift(); if (seen[c] || !by[c]) continue; seen[c] = 1; out.push(c);
      nxt = by[c].to || []; for (i = 0; i < nxt.length; i++) q.push(nxt[i]);
    }
    if (!out.length) out = [name];
    out.sort(function (a, b) { return (by[a] ? by[a].no : 0) - (by[b] ? by[b].no : 0); });
    data.__line = data.__line || {};
    for (i = 0; i < out.length; i++) data.__line[out[i]] = { root: cur, names: out };
    return data.__line[name] || { root: name, names: [name] };
  }

  /* ── 프로필 ── */
  function emptyStats() {
    return { games: 0, win: 0, lose: 0, draw: 0, streak: 0, bestStreak: 0, rounds: 0,
      byBoss: {}, byLevel: {}, byMain: {}, cards: {}, bestLanes: 0, lines: {} };
  }
  function upgradeProfile(p, data) {
    var e, k, g;
    if (p.gold === undefined) p.gold = 0;
    if (!p.owned) p.owned = [];
    if (!p.decks) p.decks = {};
    if (p.deck && !p.decks.lane) { p.decks.lane = p.deck; }   /* 아주 옛 꼴 — deck 하나 */
    delete p.deck;
    if (!p.stats || p.stats.games !== undefined) p.stats = {};   /* 옛 꼴은 stats 가 바로 통계였다 — 버린다 */
    for (g = 0; g < GAMES.length; g++) {
      if (!p.decks[GAMES[g]]) p.decks[GAMES[g]] = [];
      if (!p.stats[GAMES[g]]) p.stats[GAMES[g]] = {};
      e = emptyStats(); for (k in e) if (p.stats[GAMES[g]][k] === undefined) p.stats[GAMES[g]][k] = e[k];
    }
    if (!p.shop || !p.shop.stock) p.shop = { rngState: (p.owned.length * 7919 + 17) | 0, stock: [] };
    if (data) shopFill(data, p);
    if (!p.beaten) p.beaten = {};
    if (!p.level || LEVELS.indexOf(p.level) < 0) p.level = LEVELS[0];
    p.v = VERSION;
    return p;
  }
  function genCards(data, gen, rare) {
    var by = byName(data), p = pool(data), out = [], i, c;
    for (i = 0; i < p.length; i++) { c = by[p[i]]; if ((gen === null || c.gen === gen) && !!c.rare === !!rare) out.push(c.name); }
    return out;
  }
  function canPickGen(data, gen) {
    var n = genCards(data, gen, false).length;
    return { ok: n >= START_MAIN, n: n, need: Math.max(0, START_MAIN - n) };
  }
  /* 계통 단위로 n 장 — 계통(풀 안의 것만)을 통째로 넣고, 남는 자리는 남은 카드로 */
  function pickLines(data, rng, names, n) {
    var seen = {}, lines = [], rest = [], out = [], i, j, l;
    for (i = 0; i < names.length; i++) {
      if (seen[names[i]]) continue;
      l = lineOf(data, names[i]).names.filter(function (x) { return names.indexOf(x) >= 0; });
      for (j = 0; j < l.length; j++) seen[l[j]] = 1;
      if (l.length > 1) lines.push(l); else rest.push(l[0]);
    }
    shuffle(rng, lines);
    for (i = 0; i < lines.length; i++) {
      if (out.length + lines[i].length <= n) out = out.concat(lines[i]);
      else rest = rest.concat(lines[i]);
    }
    shuffle(rng, rest);
    return out.concat(rest).slice(0, n);
  }
  function newProfile(data, gen, seed) {
    var rng = { rngState: seed | 0 };
    var mine = pickLines(data, rng, genCards(data, gen, false), START_MAIN);
    var others = shuffle(rng, genCards(data, null, false).filter(function (x) { return byName(data)[x].gen !== gen; })).slice(0, START_OTHER);
    var owned = mine.concat(others);
    return upgradeProfile({ v: VERSION, main: gen, owned: owned, decks: { lane: owned.slice() }, beaten: {}, level: LEVELS[0],
      gold: 0, shop: { rngState: (seed ^ 0x9E3779B9) | 0, stock: [] } }, data);
  }
  function deckOf(profile, game) { if (!profile.decks) profile.decks = {}; if (!profile.decks[game]) profile.decks[game] = []; return profile.decks[game]; }
  function setDeck(profile, game, ids) { deckOf(profile, game); profile.decks[game] = ids.slice(); return profile.decks[game]; }
  function winsOf(profile, gen) { var b = (profile.beaten || {})[gen] || {}, n = 0, k; for (k in b) n += b[k]; return n; }
  function conquered(data, profile) {
    var i; for (i = 0; i < data.lane.champions.length; i++) if (winsOf(profile, data.lane.champions[i].gen) < 1) return false;
    return true;
  }

  /* Task 2 가 여기에 보상·금·상점·통계를 더한다 */
  function shopFill(data, profile) { return profile.shop; }

  var api = {
    VERSION: VERSION, DECK: DECK, GAMES: GAMES, START_MAIN: START_MAIN, START_OTHER: START_OTHER, LEVELS: LEVELS, FORMS: FORMS, BST_MIN: BST_MIN, BST_MAX: BST_MAX,
    rand: rand, randInt: randInt, shuffle: shuffle, byName: byName, bst: bst, pool: pool, inPool: inPool, lineOf: lineOf,
    emptyStats: emptyStats, upgradeProfile: upgradeProfile, genCards: genCards, canPickGen: canPickGen, newProfile: newProfile,
    deckOf: deckOf, setDeck: setDeck, winsOf: winsOf, conquered: conquered, shopFill: shopFill
  };
  root.AtelierCollection = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
