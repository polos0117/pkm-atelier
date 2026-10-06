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
  var FIRST_BONUS = 12;                                  /* 1라운드 선공 보정 — 297판 보고(2026-10-06): 8 → 선공 39%, 10 → 40%, 12 → 42%. 뒤에 놓는 쪽이 늘 답하므로 구조적으로 후공이 유리하다 */
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

  /* ── 판 ── */
  function other(who) { return who === 'me' ? 'foe' : 'me'; }
  function blankSide() { return { hand: [], deck: [], rows: [[], [], []], grave: [], opened: false }; }
  /* 현재 힘 = 기본 − 피해 + 개방, 바닥 1 */
  function cur(u) { return Math.max(POWER_MIN, u.base - u.dmg + u.open); }
  function newMatch(data, profile, gen, level, seed) {
    var st = { v: VERSION, seed: seed | 0, rngState: seed | 0, champion: gen, level: level, round: 1, turn: null, first: null, coin: null,
      bonus: { me: 0, foe: 0 }, passed: { me: false, foe: false }, lives: { me: LIVES, foe: LIVES }, me: blankSide(), foe: blankSide(), weather: [null, null, null],
      seq: 0, log: [], roundLog: [], phase: 'mulligan', winner: null, played: [], opens: 0, weathers: 0, mulligans: 0, rewarded: false, outcome: null, last: null };
    st.me.deck = C.shuffle(st, C.deckOf(profile, 'gwent').slice());
    st.foe.deck = C.shuffle(st, championDeck(data, st, gen, level));
    st.me.hand = st.me.deck.splice(0, HAND);
    st.foe.hand = st.foe.deck.splice(0, HAND);
    return st;
  }
  function swapTop(side, i) {
    var old = side.hand[i];
    if (!side.deck.length) return false;
    side.hand[i] = side.deck.shift(); side.deck.push(old);
    return true;
  }
  function mulligan(st, i) {
    if (st.phase !== 'mulligan') return { ok: false, why: 'phase' };
    if (st.mulligans >= MULLIGAN) return { ok: false, why: 'mulligan' };
    if (i < 0 || i >= st.me.hand.length) return { ok: false, why: 'hand' };
    swapTop(st.me, i); st.mulligans++;
    return { ok: true };
  }
  /* 상대 멀리건 — 가장 약한 비날씨 2장. 그 뒤 동전으로 선공, 선공은 합에 FIRST_BONUS 를 미리 받는다 */
  function confirm(data, st) {
    var i, k, idx, foe = st.foe, c;
    if (st.phase !== 'mulligan') return st;
    for (k = 0; k < MULLIGAN; k++) {
      idx = -1;
      for (i = 0; i < foe.hand.length; i++) { c = cardOf(data, foe.hand[i]); if (!c || c.weather) continue; if (idx < 0 || best(c) < best(cardOf(data, foe.hand[idx]))) idx = i; }
      if (idx < 0 || !swapTop(foe, idx)) break;
    }
    st.first = C.rand(st) < 0.5 ? 'me' : 'foe';
    st.coin = st.first;
    st.bonus[st.first] = FIRST_BONUS;
    st.turn = st.first; st.phase = 'play';
    st.log.push({ t: 'first', who: st.first });
    startRound(data, st);
    return st;
  }
  function begin(st, who, kind, extra) { var k; st.last = { who: who, kind: kind, fx: [] }; for (k in extra || {}) st.last[k] = extra[k]; }
  /* 합법인 수 — 내기는 어느 줄이든, 개방은 내 판 위 비영웅 하나(한 판에 한 번) */
  function legal(data, st, who) {
    var D = cardsOf(data), out = { play: [], open: [], pass: false }, side, i, r;
    if (st.phase !== 'play' || st.turn !== who || st.passed[who]) return out;
    side = st[who];
    for (i = 0; i < side.hand.length; i++) out.play.push({ id: side.hand[i], lanes: [0, 1, 2] });
    if (!side.opened) for (r = 0; r < ROWS; r++) for (i = 0; i < side.rows[r].length; i++) if (!D.cards[side.rows[r][i].name].rare) out.open.push({ lane: r, i: i });
    out.pass = true;
    return out;
  }
  /* 한 수를 적용한다 — endTurn 은 안 한다(AI 의 evaluate 가 라운드 끝 전 값을 재려고). move = {kind:'play'|'open'|'pass', id, lane, i} */
  function act(data, st, move) {
    var who = st.turn, side = st[who], c, i, r, u;
    if (st.phase !== 'play') return { ok: false, why: 'phase' };
    if (st.passed[who]) return { ok: false, why: 'passed' };
    if (move.kind === 'pass') { begin(st, who, 'pass'); st.passed[who] = true; st.log.push({ t: 'pass', who: who }); return { ok: true }; }
    if (move.kind === 'play') {
      c = cardOf(data, move.id); i = side.hand.indexOf(move.id); r = move.lane;
      if (i < 0 || !c) return { ok: false, why: 'hand' };
      if (!(r >= 0 && r < ROWS)) return { ok: false, why: 'lane' };
      side.hand.splice(i, 1);
      if (who === 'me' && st.played.indexOf(c.name) < 0) st.played.push(c.name);
      if (c.weather) return playWeather(data, st, who, c, r);
      u = { id: move.id, name: c.name, base: c.power[FORMS[r]], dmg: 0, open: 0, at: st.seq++ };
      side.rows[r].push(u);
      begin(st, who, 'play', { id: move.id, lane: r, i: side.rows[r].length - 1, hit: strike(data, st, who, c) });
      st.log.push({ t: 'play', who: who, id: move.id, lane: r, hit: st.last.hit });
      return { ok: true };
    }
    if (move.kind === 'open') return actOpen(data, st, who, move);
    return { ok: false, why: 'kind' };
  }
  function play(data, st, id, lane) { var r = act(data, st, { kind: 'play', id: id, lane: lane }); if (r.ok) endTurn(data, st); return r; }
  function open(data, st, lane, i) { var r = act(data, st, { kind: 'open', lane: lane, i: i }); if (r.ok) endTurn(data, st); return r; }
  function pass(data, st) { var r = act(data, st, { kind: 'pass' }); if (r.ok) endTurn(data, st); return r; }
  /* 차례가 시작될 때 그쪽 개방 카드가 1 식는다 */
  function bleed(side) { var r, i, u; for (r = 0; r < ROWS; r++) for (i = 0; i < side.rows[r].length; i++) { u = side.rows[r][i]; if (u.open > 0) u.open = Math.max(0, u.open - OPEN_BLEED); } }
  function endTurn(data, st) {
    var who = st.turn, next;
    if (!st.passed[who] && !st[who].hand.length) st.passed[who] = true;   /* 손패가 비면 자동 패스 — 남은 개방은 잃는다 */
    if (st.passed.me && st.passed.foe) return endRound(data, st);
    next = st.passed[other(who)] ? who : other(who);
    st.turn = next; bleed(st[next]);
  }
  function startRound(data, st) {
    if (!st.me.hand.length) st.passed.me = true;
    if (!st.foe.hand.length) st.passed.foe = true;
    if (st.passed.me && st.passed.foe) return endRound(data, st);
    if (st.passed[st.turn]) st.turn = other(st.turn);
  }
  /* ── 상성 타격 — 내 타입(둘이면 유리한 쪽)이 상대 타입(둘이면 곱)에 주는 배율 ── */
  function mult(data, atkTypes, defTypes) {
    var bestM = 0, i, j, m;
    for (i = 0; i < atkTypes.length; i++) {
      m = 1; for (j = 0; j < defTypes.length; j++) m *= data.chart[atkTypes[i]][defTypes[j]];
      if (m > bestM) bestM = m;
    }
    return bestM;
  }
  /* 놓을 때 한 번 — 상대 판 전체에서 2배 이상인 비영웅 가운데 현재 힘이 가장 센 것(같으면 먼저 놓인 것). 2배 −2, 4배 −3, 바닥 1. 없거나 더 못 깎으면 null */
  function strike(data, st, who, c) {
    var D = cardsOf(data), you = st[other(who)], pick = null, r, i, u, m, n;
    for (r = 0; r < ROWS; r++) for (i = 0; i < you.rows[r].length; i++) {
      u = you.rows[r][i]; if (D.cards[u.name].rare) continue;
      m = mult(data, c.types, D.cards[u.name].types); if (m < 2) continue;
      if (!pick || cur(u) > cur(pick.u) || (cur(u) === cur(pick.u) && u.at < pick.u.at)) pick = { u: u, lane: r, i: i, m: m };
    }
    if (!pick) return null;
    n = Math.min(pick.m >= 4 ? STRIKE_4 : STRIKE_2, cur(pick.u) - POWER_MIN);
    if (n <= 0) return null;
    pick.u.dmg += n;
    return { lane: pick.lane, i: pick.i, id: pick.u.id, n: n, mult: pick.m };
  }
  /* 날씨판 — 줄을 골라 깐다(이미 깔려 있으면 걷는다). 판에 안 남고 묘지로 */
  function playWeather(data, st, who, c, r) {
    var w = weatherOf(data, r), on = !st.weather[r];
    st.weather[r] = on ? w : null; st[who].grave.push(c.id);
    if (who === 'me') st.weathers++;
    begin(st, who, 'weather', { id: c.id, lane: r, on: on, weather: w });
    st.log.push({ t: 'weather', who: who, id: c.id, lane: r, on: on });
    return { ok: true };
  }
  /* 개방 — 한 판에 한 번, 내 판 위 비영웅 하나 +5 */
  function actOpen(data, st, who, move) {
    var side = st[who], u = side.rows[move.lane] && side.rows[move.lane][move.i];
    if (side.opened) return { ok: false, why: 'opened' };
    if (!u) return { ok: false, why: 'lane' };
    if (cardsOf(data).cards[u.name].rare) return { ok: false, why: 'rare' };
    u.open = OPEN_BONUS; side.opened = true;
    if (who === 'me') st.opens++;
    begin(st, who, 'open', { lane: move.lane, i: move.i, id: u.id });
    st.log.push({ t: 'open', who: who, lane: move.lane, id: u.id });
    return { ok: true };
  }
  /* ── 합산 — 영웅은 기본 힘, 날씨 줄은 1, 아니면 현재 힘 + 결속(같은 계통 비영웅이 같은 줄에 둘 이상)이면 기본 힘 ── */
  function bondCount(data, row) { var D = cardsOf(data), n = {}, i, l; for (i = 0; i < row.length; i++) { if (D.cards[row[i].name].rare) continue; l = D.cards[row[i].name].line; n[l] = (n[l] || 0) + 1; } return n; }
  function unitValue(data, st, who, lane, i) {
    var D = cardsOf(data), u = st[who].rows[lane][i], c = D.cards[u.name], bonds;
    if (c.rare) return { value: u.base, bond: false, weather: false };
    if (st.weather[lane]) return { value: 1, bond: false, weather: true };
    bonds = bondCount(data, st[who].rows[lane]);
    return { value: cur(u) + (bonds[c.line] > 1 ? u.base : 0), bond: bonds[c.line] > 1, weather: false };
  }
  function rowSum(data, st, who, lane) { var s = 0, i; for (i = 0; i < st[who].rows[lane].length; i++) s += unitValue(data, st, who, lane, i).value; return s; }
  function sums(data, st) {
    var out = { me: st.bonus.me, foe: st.bonus.foe, rows: { me: [], foe: [] } }, r, a, b;
    for (r = 0; r < ROWS; r++) { a = rowSum(data, st, 'me', r); b = rowSum(data, st, 'foe', r); out.rows.me.push(a); out.rows.foe.push(b); out.me += a; out.foe += b; }
    return out;
  }
  function clearSide(side) { var r, i; for (r = 0; r < ROWS; r++) { for (i = 0; i < side.rows[r].length; i++) side.grave.push(side.rows[r][i].id); side.rows[r] = []; } }
  function endRound(data, st) {
    var s = sums(data, st), winner = s.me > s.foe ? 'me' : s.foe > s.me ? 'foe' : 'draw';
    st.roundLog.push({ me: s.me, foe: s.foe, winner: winner });
    if (winner !== 'me') st.lives.me--;
    if (winner !== 'foe') st.lives.foe--;
    st.log.push({ t: 'round', n: st.round, winner: winner, me: s.me, foe: s.foe });
    clearSide(st.me); clearSide(st.foe);
    st.weather = [null, null, null]; st.bonus = { me: 0, foe: 0 };
    st.passed = { me: false, foe: false };
    if (st.lives.me <= 0 || st.lives.foe <= 0 || st.round >= MAX_ROUNDS) {
      st.phase = 'done';
      st.winner = st.lives.me > st.lives.foe ? 'me' : st.lives.foe > st.lives.me ? 'foe' : 'draw';
      st.turn = null;
      return;
    }
    st.round++;
    st.first = winner === 'draw' ? other(st.first) : other(winner);   /* 진 쪽이 선공, 동점이면 바꿔 가며 */
    st.turn = st.first;
    startRound(data, st);
  }

  /* ── AI — 시드 난수로 결정적. 값 = 내 합 − 상대 합. 카드는 세 줄 가운데 값이 가장 큰 줄(힘·결속·날씨·타격이 다 들어간다) ── */
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function value(data, st, who) { var s = sums(data, st); return s[who] - s[other(who)]; }
  function evaluate(data, st, move) { var who = st.turn, before = value(data, st, who), c = clone(st); act(data, c, move); return value(data, c, who) - before; }
  /* 손패를 다 내면 얼마나 더 — 각 카드의 가장 센 폼 + 남은 개방 + 날씨판이 있으면 상대 가장 센 줄을 1로 깎는 몫 */
  function potential(data, st, who) {
    var side = st[who], you = st[other(who)], i, c, p = 0, w = false, cut = 0, r;
    for (i = 0; i < side.hand.length; i++) { c = cardOf(data, side.hand[i]); if (!c) continue; if (c.weather) w = true; else p += best(c); }
    if (!side.opened) p += OPEN_BONUS;
    if (w) for (r = 0; r < ROWS; r++) if (!st.weather[r]) cut = Math.max(cut, rowSum(data, st, who === 'me' ? 'foe' : 'me', r) - you.rows[r].length);
    return p + cut;
  }
  function aiMove(data, st, level) {
    var who = st.turn, me = st[who], you = other(who), L = legal(data, st, who), cands = [], pos, plays, i, j, c, g, mv, lead, hold;
    level = level || st.level;
    if (!L.pass) return { kind: 'pass' };
    lead = value(data, st, who);
    /* 에이스는 1라운드에 영웅을 아낀다 — 목숨이 하나면 다 쓴다. 날씨판·개방까지 아끼면 오히려 약해졌다(60판: 숙련 상대 47% → 68%) */
    hold = level === 'ace' && st.round === 1 && st.lives[who] > 1;
    for (i = 0; i < L.play.length; i++) {
      c = cardOf(data, L.play[i].id);
      if (hold && c.rare) continue;
      for (j = 0; j < ROWS; j++) { mv = { kind: 'play', id: L.play[i].id, lane: j }; cands.push({ m: mv, g: evaluate(data, st, mv), cost: c.weather ? 0 : best(c) }); }
    }
    for (i = 0; i < L.open.length; i++) { mv = { kind: 'open', lane: L.open[i].lane, i: L.open[i].i }; cands.push({ m: mv, g: evaluate(data, st, mv) - me.hand.length * OPEN_BLEED, cost: 0 }); }   /* 차례마다 식으니 남은 손패만큼 뺀다 */
    if (level === 'rookie') {   /* 값이 오르는 수 가운데 아무거나. 패스를 모른다 — 오르는 수가 없으면 아무 카드나 */
      pos = cands.filter(function (x) { return x.g > 0; });
      if (pos.length) return pos[C.randInt(st, pos.length)].m;
      plays = cands.filter(function (x) { return x.m.kind === 'play'; });
      return plays.length ? plays[C.randInt(st, plays.length)].m : { kind: 'pass' };
    }
    if (lead > 0 && st.passed[you]) return { kind: 'pass' };                 /* 앞서는데 상대가 패스했다 */
    if (lead < 0 && potential(data, st, who) < -lead) return { kind: 'pass' };   /* 손패를 다 내도 못 뒤집는다 — 이 라운드는 버린다 */
    if (level === 'ace' && st.round === 1 && st.lives[who] > 1 && lead > 0 && me.hand.length <= HAND - 2) return { kind: 'pass' };   /* 에이스 — 1라운드는 앞서면 일찍 접어 손패를 아낀다 */
    cands.sort(function (a, b) { return (b.g - a.g) || (a.cost - b.cost); });   /* 값 큰 것, 같으면 싼 카드 */
    if (!cands.length || cands[0].g <= 0) return { kind: 'pass' };
    return cands[0].m;
  }
  function aiTurn(data, st, level) {
    var m = aiMove(data, st, level), r;
    r = act(data, st, m); if (r.ok) endTurn(data, st);
    return { ok: r.ok, move: m, why: r.why };
  }

  /* ── 정산 — 판이 끝날 때 한 번. 통계·금·보상 뒷장·상점 돌림 ── */
  function settle(data, profile, st) {
    var s, win = st.winner === 'me', result, i, top = 0, pool = [], picks = 0, first = false, gold;
    if (st.phase !== 'done' || st.rewarded) return null;
    C.upgradeProfile(profile, data); s = profile.stats.gwent;
    result = win ? 'win' : st.winner === 'foe' ? 'lose' : 'draw';
    C.bumpStats(s, { result: result, boss: st.champion, level: st.level, main: profile.main, rounds: st.roundLog.length, played: st.played });
    for (i = 0; i < st.roundLog.length; i++) if (st.roundLog[i].me > top) top = st.roundLog[i].me;
    if (top > s.bestRound) s.bestRound = top;
    s.weather = (s.weather || 0) + st.weathers; s.opens = (s.opens || 0) + st.opens;
    if (win) {
      if (!profile.beaten[st.champion]) profile.beaten[st.champion] = {};
      profile.beaten[st.champion][st.level] = (profile.beaten[st.champion][st.level] || 0) + 1;
      first = profile.beaten[st.champion][st.level] === 1;
      pool = C.buildRewardPool(data, st, profile, st.champion, st.level);
      picks = Math.min(pool.length, first ? C.REWARD_PICKS.first : C.REWARD_PICKS.again);
    }
    gold = C.goldFor(st.level, win);
    profile.gold += gold; C.shopRotate(data, profile);
    st.rewarded = true;
    st.outcome = { result: result, first: first, pool: pool, picks: picks, taken: [], gold: gold };
    return st.outcome;
  }
  function pickReward(data, profile, st, index) { return C.pickReward(profile, st.outcome, index); }
  function finishRewards(data, profile, st) { return C.finishRewards(st, profile, st.outcome); }
  function statsView(data, profile) { return C.statsView(data, profile, 'gwent'); }

  var api = {
    VERSION: VERSION, HAND: HAND, MULLIGAN: MULLIGAN, LIVES: LIVES, MAX_ROUNDS: MAX_ROUNDS, ROWS: ROWS,
    MAIN_MIN: MAIN_MIN, RARE_MAX: RARE_MAX, WEATHER_MAX: WEATHER_MAX, POWER_MIN: POWER_MIN, POWER_MAX: POWER_MAX,
    STRIKE_2: STRIKE_2, STRIKE_4: STRIKE_4, OPEN_BONUS: OPEN_BONUS, OPEN_BLEED: OPEN_BLEED, FIRST_BONUS: FIRST_BONUS,
    CHAMP_OWN: CHAMP_OWN, CHAMP_ALLY: CHAMP_ALLY, CHAMP_RARE: CHAMP_RARE, CHAMP_WEATHER: CHAMP_WEATHER, FORMS: FORMS, LEVELS: LEVELS, WSUF: WSUF,
    derive: derive, cardsOf: cardsOf, cardOf: cardOf, isWeather: isWeather, baseName: baseName, weatherOf: weatherOf, best: best,
    canUse: canUse, validateDeck: validateDeck, toggleDeck: toggleDeck, setMain: setMain, autoFill: autoFill, championOf: championOf, championReady: championReady, championPortrait: championPortrait, championDeck: championDeck,
    other: other, cur: cur, newMatch: newMatch, mulligan: mulligan, confirm: confirm, legal: legal, act: act, play: play, open: open, pass: pass, endTurn: endTurn, startRound: startRound, endRound: endRound, unitValue: unitValue, rowSum: rowSum, sums: sums,
    mult: mult, strike: strike,
    value: value, evaluate: evaluate, potential: potential, aiMove: aiMove, aiTurn: aiTurn, settle: settle, pickReward: pickReward, finishRewards: finishRewards, statsView: statsView
  };
  root.AtelierGwent = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
