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

  /* ── 보상 뒷장 — 이기면 5장이 깔리고 첫 승 3장·재대결 1장을 골라 뒤집는다 ── */
  var REWARD_POOL = 5, REWARD_PICKS = { first: 3, again: 1 }, REWARD_LINE = 2;   /* 앞 2장은 내 계통의 빈 단계에서 */
  var REWARD_RARE = { rookie: 0, veteran: 0.1, ace: 0.35 };                       /* 전설이 깔릴 확률 */
  var REWARD_EXP = { rookie: 0, veteran: 1, ace: 2 };                             /* 종족값(합/100) 가중 지수 */
  /* 아직 없는 카드(풀 안) 가운데 — gen 이 있으면 그 세대만, rare 로 전설/비전설, filter 로 더 좁힌다 */
  function candidates(data, profile, taken, gen, rare, filter) {
    var by = byName(data), p = pool(data), out = [], i, c;
    for (i = 0; i < p.length; i++) {
      c = by[p[i]];
      if ((gen !== null && c.gen !== gen) || !!c.rare !== !!rare) continue;
      if (profile.owned.indexOf(c.name) >= 0 || taken.indexOf(c.name) >= 0) continue;
      if (filter && !filter(c)) continue;
      out.push(c.name);
    }
    return out;
  }
  function weightedPick(data, rng, list, exp) {
    var by = byName(data), w = [], sum = 0, i, r;
    for (i = 0; i < list.length; i++) { w[i] = Math.pow(bst(by[list[i]]) / 100, exp); sum += w[i]; }
    r = rand(rng) * sum;
    for (i = 0; i < list.length; i++) { r -= w[i]; if (r <= 0) return list[i]; }
    return list[list.length - 1];
  }
  /* 내 계통의 빈 단계 — 가진 카드의 바로 앞·뒤 단계인데 아직 없는 것 */
  function isLineGap(data, profile) {
    var by = byName(data), want = {}, i, c, j;
    for (i = 0; i < profile.owned.length; i++) {
      c = by[profile.owned[i]]; if (!c) continue;
      if (c.from) want[c.from] = 1;
      for (j = 0; j < (c.to || []).length; j++) want[c.to[j]] = 1;
    }
    return function (x) { return !!want[x.name]; };
  }
  function buildRewardPool(data, rng, profile, gen, level) {
    var out = [], k, rare, list, gap = isLineGap(data, profile), exp = REWARD_EXP[level] || 0, tries;
    for (k = 0; k < REWARD_POOL; k++) {
      list = null;
      if (k < REWARD_LINE) {   /* 계통 빈 단계 — 그 세대 먼저, 없으면 아무 세대, 전설은 아니다 */
        list = candidates(data, profile, out, gen, false, gap);
        if (!list.length) list = candidates(data, profile, out, null, false, gap);
      }
      if (!list || !list.length) {
        rare = rand(rng) < (REWARD_RARE[level] || 0);
        for (tries = 0; tries < 4 && (!list || !list.length); tries++) {
          /* 그 세대 전설 → 그 세대 비전설 → 아무 세대 (전설 차례는 뽑힌 것부터) */
          list = candidates(data, profile, out, tries < 2 ? gen : null, tries % 2 === 0 ? rare : !rare);
        }
      }
      if (!list || !list.length) break;
      out.push(weightedPick(data, rng, list, exp));
    }
    return out;
  }
  function pickReward(profile, o, index) {
    if (!o) return { ok: false, why: 'phase' };
    if (o.taken.length >= o.picks) return { ok: false, why: 'done' };
    if (index < 0 || index >= o.pool.length || index !== Math.floor(index)) return { ok: false, why: 'index' };
    if (o.taken.indexOf(index) >= 0) return { ok: false, why: 'taken' };
    o.taken.push(index);
    if (profile.owned.indexOf(o.pool[index]) < 0) profile.owned.push(o.pool[index]);
    return { ok: true, id: o.pool[index] };
  }
  function finishRewards(rng, profile, o) {
    var got = [], left, r;
    if (!o) return got;
    while (o.taken.length < o.picks) {
      left = []; for (r = 0; r < o.pool.length; r++) if (o.taken.indexOf(r) < 0) left.push(r);
      if (!left.length) break;
      r = pickReward(profile, o, left[randInt(rng, left.length)]);
      if (!r.ok) break;
      got.push(r.id);
    }
    return got;
  }

  /* ── 금·상점 ── */
  var GOLD = { win: { rookie: 10, veteran: 20, ace: 35 }, lose: 3 };
  var SHOP_SLOTS = 6, SHOP_REROLL = 10, SHOP_RARE = 0.15, SHOP_RARE_BST = 500;
  function goldFor(level, win) { return win ? (GOLD.win[level] || GOLD.win.rookie) : GOLD.lose; }
  /* 값 — 종족값으로 15~30, 전설 +20 */
  function shopPrice(data, name) {
    var c = byName(data)[name]; if (!c) return 0;
    return 15 + Math.round((bst(c) - BST_MIN) / (BST_MAX - BST_MIN) * 15) + (c.rare ? 20 : 0);
  }
  function inStock(profile, name) { var i, st = profile.shop.stock; for (i = 0; i < st.length; i++) if (st[i] && st[i].id === name) return true; return false; }
  function shopDraw(data, profile) {
    var by = byName(data), p = pool(data), rng = profile.shop, rare = rand(rng) < SHOP_RARE, list = [], i, c, id;
    for (i = 0; i < p.length; i++) {
      c = by[p[i]];
      if (profile.owned.indexOf(c.name) >= 0 || inStock(profile, c.name)) continue;
      if (rare && !c.rare && bst(c) < SHOP_RARE_BST) continue;
      list.push(c.name);
    }
    if (!list.length && rare) { rare = false; for (i = 0; i < p.length; i++) if (profile.owned.indexOf(p[i]) < 0 && !inStock(profile, p[i])) list.push(p[i]); }
    if (!list.length) return null;
    id = list[randInt(rng, list.length)];
    return { id: id, price: shopPrice(data, id), rare: rare, bought: false };
  }
  function shopFill(data, profile) { while (profile.shop.stock.length < SHOP_SLOTS) profile.shop.stock.push(shopDraw(data, profile)); return profile.shop; }
  function shopRotate(data, profile) {
    var st = profile.shop.stock, i, at = -1;
    for (i = 0; i < st.length; i++) if (st[i] && st[i].bought) { at = i; break; }
    if (at < 0) at = 0;
    st.splice(at, 1);
    return shopFill(data, profile);
  }
  function shopReroll(data, profile) {
    if (profile.gold < SHOP_REROLL) return { ok: false, why: 'gold' };
    profile.gold -= SHOP_REROLL; profile.shop.stock = [];
    shopFill(data, profile);
    return { ok: true };
  }
  function shopBuy(data, profile, index) {
    var slot = profile.shop.stock[index];
    if (index < 0 || index >= profile.shop.stock.length || !slot) return { ok: false, why: 'index' };
    if (slot.bought) return { ok: false, why: 'bought' };
    if (profile.gold < slot.price) return { ok: false, why: 'gold' };
    profile.gold -= slot.price; slot.bought = true;
    if (profile.owned.indexOf(slot.id) < 0) profile.owned.push(slot.id);
    return { ok: true, id: slot.id };
  }
  function shopClosed(data, profile) { var st = profile.shop.stock, i; for (i = 0; i < st.length; i++) if (st[i] && !st[i].bought) return false; return true; }

  /* ── 통계 그릇 — 놀이가 판이 끝날 때 한 번 부른다. 놀이만의 칸(bestLanes·lines)은 놀이가 직접 채운다 ── */
  function bump(table, key, win) { if (!table[key]) table[key] = { games: 0, win: 0 }; table[key].games++; if (win) table[key].win++; }
  function bumpStats(s, r) {
    var win = r.result === 'win', i, id;
    s.games++; s[r.result]++;
    s.streak = win ? s.streak + 1 : 0; if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    s.rounds += r.rounds || 0;
    bump(s.byBoss, r.boss, win); bump(s.byLevel, r.level, win); bump(s.byMain, r.main, win);
    for (i = 0; i < (r.played || []).length; i++) {
      id = r.played[i];
      if (!s.cards[id]) s.cards[id] = { played: 0, won: 0 };
      s.cards[id].played++; if (win) s.cards[id].won++;
    }
    return s;
  }
  function statsView(data, profile, game) {
    var s = upgradeProfile(profile).stats[game], out, i, g, k, list = [];
    function row(table, key) { var e = table[key] || { games: 0, win: 0 }; return { games: e.games, win: e.win }; }
    out = { line: { games: s.games, win: s.win, lose: s.lose, draw: s.draw, streak: s.streak, best: s.bestStreak },
      byBoss: [], byLevel: [], byMain: [], avgRounds: s.games ? Math.round(s.rounds / s.games * 10) / 10 : null, cards: [],
      bestLanes: s.bestLanes || 0, lines: [] };
    for (i = 0; i < data.lane.champions.length; i++) {
      g = data.lane.champions[i].gen;
      k = row(s.byBoss, g); k.gen = g; out.byBoss.push(k);
      k = row(s.byMain, g); k.gen = g; out.byMain.push(k);
    }
    for (i = 0; i < LEVELS.length; i++) { k = row(s.byLevel, LEVELS[i]); k.level = LEVELS[i]; out.byLevel.push(k); }
    for (k in s.cards) list.push({ id: k, played: s.cards[k].played, won: s.cards[k].won, rate: s.cards[k].played >= 5 ? s.cards[k].won / s.cards[k].played : null });
    list.sort(function (a, b) { return b.played - a.played || (a.id < b.id ? -1 : 1); });
    out.cards = list;
    for (k in (s.lines || {})) out.lines.push({ root: k, n: s.lines[k] });
    out.lines.sort(function (a, b) { return b.n - a.n || (a.root < b.root ? -1 : 1); });
    return out;
  }

  var api = {
    VERSION: VERSION, DECK: DECK, GAMES: GAMES, START_MAIN: START_MAIN, START_OTHER: START_OTHER, LEVELS: LEVELS, FORMS: FORMS, BST_MIN: BST_MIN, BST_MAX: BST_MAX,
    rand: rand, randInt: randInt, shuffle: shuffle, byName: byName, bst: bst, pool: pool, inPool: inPool, lineOf: lineOf,
    emptyStats: emptyStats, upgradeProfile: upgradeProfile, genCards: genCards, canPickGen: canPickGen, newProfile: newProfile,
    deckOf: deckOf, setDeck: setDeck, winsOf: winsOf, conquered: conquered,
    REWARD_POOL: REWARD_POOL, REWARD_PICKS: REWARD_PICKS, REWARD_LINE: REWARD_LINE, REWARD_RARE: REWARD_RARE, REWARD_EXP: REWARD_EXP,
    GOLD: GOLD, SHOP_SLOTS: SHOP_SLOTS, SHOP_REROLL: SHOP_REROLL, SHOP_RARE: SHOP_RARE,
    buildRewardPool: buildRewardPool, pickReward: pickReward, finishRewards: finishRewards,
    goldFor: goldFor, shopPrice: shopPrice, shopFill: shopFill, shopRotate: shopRotate, shopReroll: shopReroll, shopBuy: shopBuy, shopClosed: shopClosed,
    bumpStats: bumpStats, statsView: statsView
  };
  root.AtelierCollection = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
