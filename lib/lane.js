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
  /* 선공 보정 — 뒤에 놓는 쪽이 상성으로 받아친다. 선공은 시작 손패를 이만큼 더 받고, 2라운드 보충에서 후공이 같은 수를 받아 맞춘다.
     297판 보고(2026-10-06): 판 전체 +1·+2 는 선공 승률 75% → 92% 로 널뛰었고, 1라운드 몫으로만 주니 47~49% */
  var FIRST_CARDS = 2;
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

  /* ── 판 ── */
  function other(who) { return who === 'me' ? 'foe' : 'me'; }
  function blankSide() { return { hand: [], deck: [], lanes: [null, null, null], grave: [], opened: false }; }
  function top(stack) { return stack ? stack.cards[stack.cards.length - 1] : null; }
  function newMatch(data, profile, gen, level, seed) {
    var st = { v: VERSION, seed: seed | 0, rngState: seed | 0, champion: gen, level: level, round: 1, turn: null, first: null, coin: null,
      passed: { me: false, foe: false }, lives: { me: LIVES, foe: LIVES }, me: blankSide(), foe: blankSide(), seq: 0, log: [], roundLog: [],
      phase: 'mulligan', winner: null, played: [], grown: [], mulligans: 0, rewarded: false, outcome: null, last: null };
    st.me.deck = C.shuffle(st, C.deckOf(profile, 'lane').slice());
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
  function draw(side, n) { var k; for (k = 0; k < n && side.deck.length; k++) side.hand.push(side.deck.shift()); }
  /* 상대 멀리건 — 힘이 가장 낮은 2장. 그 뒤 동전으로 선공, 선공은 FIRST_CARDS 장 더 */
  function confirm(data, st) {
    var D = cardsOf(data), i, k, idx, foe = st.foe;
    if (st.phase !== 'mulligan') return st;
    for (k = 0; k < MULLIGAN; k++) {
      idx = -1;
      for (i = 0; i < foe.hand.length; i++) if (idx < 0 || D.cards[foe.hand[i]].power < D.cards[foe.hand[idx]].power) idx = i;
      if (idx < 0 || !swapTop(foe, idx)) break;
    }
    st.first = C.rand(st) < 0.5 ? 'me' : 'foe';
    st.coin = st.first;
    draw(st[st.first], FIRST_CARDS);
    st.turn = st.first; st.phase = 'play';
    st.log.push({ t: 'first', who: st.first });
    startRound(data, st);
    return st;
  }
  function begin(st, who, kind, extra) { var k; st.last = { who: who, kind: kind, fx: [] }; for (k in extra || {}) st.last[k] = extra[k]; }
  /* 합법인 수 — Task 5 가 evolve·move·open 을 채운다 */
  function legal(data, st, who) {
    var D = cardsOf(data), out = { place: [], evolve: [], move: [], open: [], pass: false }, side, i, lanes, l;
    if (st.phase !== 'play' || st.turn !== who || st.passed[who]) return out;
    side = st[who];
    /* 놓기는 어느 줄이든 — 내 스택이 있는 줄이면 교체(스택은 묘지로). 포켓몬의 교체 — 받아친 상대에게 되받아치는 길 */
    lanes = []; for (l = 0; l < LANES; l++) lanes.push(l);
    for (i = 0; i < side.hand.length; i++) out.place.push({ id: side.hand[i], lanes: lanes.slice() });
    legalMore(data, st, who, out);
    out.pass = true;
    return out;
  }
  /* 진화·옮기기·개방의 합법 수 */
  function legalMore(data, st, who, out) {
    var D = cardsOf(data), side = st[who], l, s, i, t, to;
    for (l = 0; l < LANES; l++) {
      s = side.lanes[l]; if (!s) continue;
      to = D.cards[top(s)].to;
      for (i = 0; i < side.hand.length; i++) if (to.indexOf(side.hand[i]) >= 0) out.evolve.push({ id: side.hand[i], lane: l });
      if (s.form === 'mobility' && !s.moved) for (t = 0; t < LANES; t++) if (t !== l) out.move.push({ from: l, to: t });
      if (!side.opened) out.open.push(l);
    }
  }
  /* 한 수를 적용한다 — endTurn 은 안 한다(AI 의 evaluate 가 라운드 끝 전 값을 재려고). move = {kind, id, lane, form, from, to} */
  function act(data, st, move) {
    var who = st.turn, side = st[who], D = cardsOf(data), c, i, k, tmp;
    if (st.phase !== 'play') return { ok: false, why: 'phase' };
    if (st.passed[who]) return { ok: false, why: 'passed' };
    if (move.kind === 'pass') { begin(st, who, 'pass'); st.passed[who] = true; st.log.push({ t: 'pass', who: who }); return { ok: true }; }
    if (move.kind === 'place') {
      c = D.cards[move.id]; i = side.hand.indexOf(move.id);
      if (i < 0 || !c) return { ok: false, why: 'hand' };
      if (!(move.lane >= 0 && move.lane < LANES)) return { ok: false, why: 'lane' };
      if (FORMS.indexOf(move.form) < 0) return { ok: false, why: 'form' };
      side.hand.splice(i, 1);
      tmp = side.lanes[move.lane];
      if (tmp) for (k = 0; k < tmp.cards.length; k++) side.grave.push(tmp.cards[k]);   /* 교체 — 있던 스택은 묘지로(키운 보너스·개방도 같이) */
      side.lanes[move.lane] = { cards: [move.id], form: move.form, bonus: 0, open: false, moved: false, at: st.seq++ };
      begin(st, who, 'place', { id: move.id, lane: move.lane, form: move.form, swap: tmp ? top(tmp) : null });
      if (who === 'me' && st.played.indexOf(move.id) < 0) st.played.push(move.id);
      st.log.push({ t: 'place', who: who, id: move.id, lane: move.lane, form: move.form, swap: tmp ? top(tmp) : null });
      return { ok: true };
    }
    return actMore(data, st, who, move);
  }
  function actMore(data, st, who, move) {
    var D = cardsOf(data), side = st[who], s, i, c, tmp;
    if (move.kind === 'evolve') {
      c = D.cards[move.id]; i = side.hand.indexOf(move.id); s = side.lanes[move.lane];
      if (i < 0 || !c) return { ok: false, why: 'hand' };
      if (!s) return { ok: false, why: 'lane' };
      if (D.cards[top(s)].to.indexOf(move.id) < 0) return { ok: false, why: 'evo' };
      side.hand.splice(i, 1);
      s.cards.push(move.id); s.bonus += EVO_BONUS[s.form];
      if (!c.to.length) st.grown.push(C.lineOf(data, move.id).root);   /* 끝까지 키웠다 */
      begin(st, who, 'evolve', { id: move.id, lane: move.lane, from: s.cards[s.cards.length - 2] });
      if (who === 'me' && st.played.indexOf(move.id) < 0) st.played.push(move.id);
      st.log.push({ t: 'evolve', who: who, id: move.id, lane: move.lane });
      return { ok: true };
    }
    if (move.kind === 'move') {
      s = side.lanes[move.from];
      if (!s || !(move.to >= 0 && move.to < LANES) || move.to === move.from) return { ok: false, why: 'lane' };
      if (s.form !== 'mobility') return { ok: false, why: 'form' };
      if (s.moved) return { ok: false, why: 'moved' };
      tmp = side.lanes[move.to]; side.lanes[move.to] = s; side.lanes[move.from] = tmp; s.moved = true;
      begin(st, who, 'move', { from: move.from, to: move.to, swap: !!tmp });
      st.log.push({ t: 'move', who: who, from: move.from, to: move.to });
      return { ok: true };
    }
    if (move.kind === 'open') {
      s = side.lanes[move.lane];
      if (side.opened) return { ok: false, why: 'opened' };
      if (!s) return { ok: false, why: 'lane' };
      s.open = true; side.opened = true;
      begin(st, who, 'open', { lane: move.lane, id: top(s) });
      st.log.push({ t: 'open', who: who, lane: move.lane });
      return { ok: true };
    }
    return { ok: false, why: 'kind' };
  }
  function evolve(data, st, id, lane) { var r = act(data, st, { kind: 'evolve', id: id, lane: lane }); if (r.ok) endTurn(data, st); return r; }
  function move(data, st, from, to) { var r = act(data, st, { kind: 'move', from: from, to: to }); if (r.ok) endTurn(data, st); return r; }
  function open(data, st, lane) { var r = act(data, st, { kind: 'open', lane: lane }); if (r.ok) endTurn(data, st); return r; }
  function place(data, st, id, lane, form) { var r = act(data, st, { kind: 'place', id: id, lane: lane, form: form }); if (r.ok) endTurn(data, st); return r; }
  function pass(data, st) { var r = act(data, st, { kind: 'pass' }); if (r.ok) endTurn(data, st); return r; }
  /* 할 수 있는 일이 하나도 없으면(손패 없음, 옮길·열 것 없음) 자동 패스 */
  function canAct(data, st, who) {
    var L, save = st.turn, out;
    st.turn = who; L = legal(data, st, who); st.turn = save;
    out = L.place.length || L.evolve.length || L.move.length || L.open.length;
    return !!out;
  }
  function endTurn(data, st) {
    var who = st.turn;
    if (!st.passed[who] && !canAct(data, st, who)) st.passed[who] = true;
    if (st.passed.me && st.passed.foe) return endRound(data, st);
    st.turn = st.passed[other(who)] ? who : other(who);
  }
  function startRound(data, st) {
    if (!canAct(data, st, 'me')) st.passed.me = true;
    if (!canAct(data, st, 'foe')) st.passed.foe = true;
    if (st.passed.me && st.passed.foe) return endRound(data, st);
    if (st.passed[st.turn]) st.turn = other(st.turn);
  }
  function clearSide(side) {
    var l, i, s;
    for (l = 0; l < LANES; l++) { s = side.lanes[l]; if (s) for (i = 0; i < s.cards.length; i++) side.grave.push(s.cards[i]); side.lanes[l] = null; }
  }
  function endRound(data, st) {
    var sc = scores(data, st), winner = sc.me > sc.foe ? 'me' : sc.foe > sc.me ? 'foe' : 'draw', loser;
    st.roundLog.push({ me: sc.me, foe: sc.foe, lanes: sc.lanes, winner: winner });
    if (winner !== 'me') st.lives.me--;
    if (winner !== 'foe') st.lives.foe--;
    st.log.push({ t: 'round', n: st.round, winner: winner, me: sc.me, foe: sc.foe });
    clearSide(st.me); clearSide(st.foe);
    st.passed = { me: false, foe: false };
    if (st.lives.me <= 0 || st.lives.foe <= 0 || st.round >= MAX_ROUNDS) {
      st.phase = 'done';
      st.winner = st.lives.me > st.lives.foe ? 'me' : st.lives.foe > st.lives.me ? 'foe' : 'draw';
      st.turn = null;
      return;
    }
    st.round++;
    draw(st.me, REFILL); draw(st.foe, REFILL);
    if (st.round === 2) draw(st[other(st.coin)], FIRST_CARDS);   /* 선공의 한 장은 1라운드 몫 — 2라운드 보충에서 후공이 같은 수를 받는다 */
    /* 다음 라운드는 이긴 쪽이 먼저 — 줄 싸움은 뒤에 놓는 쪽이 받아치므로 진 쪽에 뒤를 준다(동점이면 바꿔 가며).
       궨트의 "진 쪽 선공" 을 그대로 두면 1라운드를 진 쪽이 2라운드도 먼저 놓아 눈덩이가 굴렀다(297판 보고: 선공 승률 19%) */
    loser = winner === 'draw' ? other(st.first) : other(winner);
    st.first = loser; st.turn = loser;
    startRound(data, st);
  }

  /* ── 승부 — 힘 × 상성, 동점은 고기동 → 속도 → 먼저 놓인 쪽 ── */
  /* 내 타입(둘이면 유리한 쪽)이 상대 타입(둘이면 곱)에 주는 배율 */
  function mult(data, atkTypes, defTypes) {
    var best = 0, i, j, m;
    for (i = 0; i < atkTypes.length; i++) {
      m = 1; for (j = 0; j < defTypes.length; j++) m *= data.chart[atkTypes[i]][defTypes[j]];
      if (m > best) best = m;
    }
    return best;
  }
  function sideOf(data, st, stack, vs) {
    var D = cardsOf(data), c = D.cards[top(stack)], power = (c.power + stack.bonus) * (stack.open ? OPEN_MULT : 1), m = 1;
    if (vs) { m = mult(data, c.types, D.cards[top(vs)].types); if (vs.form === 'heavy' && m > 1) m = 1; }
    return { id: c.name, power: power, mult: m, atk: power * m, speed: c.speed, form: stack.form, at: stack.at };
  }
  function matchup(data, st, lane) {
    var ms = st.me.lanes[lane], fs = st.foe.lanes[lane], out = { me: null, foe: null, winner: null, by: 'none' };
    if (!ms && !fs) return out;
    if (ms) out.me = sideOf(data, st, ms, fs);
    if (fs) out.foe = sideOf(data, st, fs, ms);
    if (!ms || !fs) { out.winner = ms ? 'me' : 'foe'; out.by = 'empty'; return out; }
    if (out.me.atk !== out.foe.atk) { out.winner = out.me.atk > out.foe.atk ? 'me' : 'foe'; out.by = 'atk'; }
    else if ((ms.form === 'mobility') !== (fs.form === 'mobility')) { out.winner = ms.form === 'mobility' ? 'me' : 'foe'; out.by = 'form'; }
    else if (out.me.speed !== out.foe.speed) { out.winner = out.me.speed > out.foe.speed ? 'me' : 'foe'; out.by = 'speed'; }
    else { out.winner = ms.at < fs.at ? 'me' : 'foe'; out.by = 'first'; }
    return out;
  }
  function scores(data, st) {
    var out = { me: 0, foe: 0, lanes: [] }, l, u;
    for (l = 0; l < LANES; l++) { u = matchup(data, st, l); out.lanes.push(u.winner); if (u.winner) out[u.winner]++; }
    return out;
  }

  /* ── AI — 시드 난수로 결정적. 값 = (딴 줄 − 잃은 줄) × 10 + 줄마다 (내 공격값 − 상대 공격값) ── */
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function value(data, st, who) {
    var sc = scores(data, st), v = (sc[who] - sc[other(who)]) * 10, l, u;
    for (l = 0; l < LANES; l++) { u = matchup(data, st, l); v += (u[who] ? u[who].atk : 0) - (u[other(who)] ? u[other(who)].atk : 0); }
    return v;
  }
  function evaluate(data, st, move) {
    var who = st.turn, before = value(data, st, who), c = clone(st), sc;
    act(data, c, move);   /* endTurn 없이 — 라운드가 끝나 판이 비기 전의 값을 잰다 */
    sc = scores(data, c);
    return { gain: value(data, c, who) - before, lanes: sc[who] - sc[other(who)] };
  }
  function aiMove(data, st, level) {
    var D = cardsOf(data), who = st.turn, me = st[who], you = other(who), L = legal(data, st, who), cands = [];
    var sc, ld, foePassed, i, j, f, c, m, g, keep;
    level = level || st.level;
    if (!L.pass) return { kind: 'pass' };
    sc = scores(data, st); ld = sc[who] - sc[you]; foePassed = st.passed[you];
    /* 숙련·에이스는 줄 수가 느는 수만 둔다 — 못 뒤집는 줄에 카드를 내는 것은 버리는 것. 신참은 값이 오르면 다 둔다 */
    function add(list, mv) {
      g = evaluate(data, st, mv); if (level !== 'rookie' && g.lanes <= ld) return;
      /* 값 — 줄 수가 느는 것이 먼저, 그다음 싼 카드(힘이 낮은 것)로, 그다음 여유. 가장 센 카드로 약한 줄을 뒤집는 것은 낭비다 */
      list.push({ m: mv, g: g.gain, lanes: g.lanes, cost: mv.id ? D.cards[mv.id].power : 0 });
    }
    for (i = 0; i < L.place.length; i++) {
      c = D.cards[L.place[i].id];
      for (j = 0; j < L.place[i].lanes.length; j++) for (f = 0; f < FORMS.length; f++) {
        m = { kind: 'place', id: c.name, lane: L.place[i].lanes[j], form: FORMS[f] };
        add(cands, m);
      }
    }
    for (i = 0; i < L.evolve.length; i++) add(cands, { kind: 'evolve', id: L.evolve[i].id, lane: L.evolve[i].lane });
    /* 옮기기·개방은 줄을 뒤집을 때만 — 빈 줄에 혼자 열어 두면 한 판에 한 번뿐인 개방을 버리는 것 */
    for (i = 0; i < L.move.length; i++) { g = evaluate(data, st, { kind: 'move', from: L.move[i].from, to: L.move[i].to }); if (g.lanes > ld) cands.push({ m: { kind: 'move', from: L.move[i].from, to: L.move[i].to }, g: g.gain, lanes: g.lanes }); }
    for (i = 0; i < L.open.length; i++) { g = evaluate(data, st, { kind: 'open', lane: L.open[i] }); if (g.lanes > ld) cands.push({ m: { kind: 'open', lane: L.open[i] }, g: g.gain, lanes: g.lanes }); }
    if (ld > 0 && foePassed) return { kind: 'pass' };
    if (!cands.length) return { kind: 'pass' };
    cands.sort(function (a, b) { return (b.lanes - a.lanes) || (a.cost - b.cost) || (b.g - a.g); });   /* 안정 정렬 — 같으면 먼저 것 */
    /* 상대가 패스했는데 어떤 수로도 줄 수가 안 늘면 더 쓰지 않는다. 목숨 하나면 끝까지. 신참은 이 판단이 없다 */
    if (level !== 'rookie' && foePassed && cands[0].lanes <= ld && st.lives[who] > 1) return { kind: 'pass' };
    keep = level === 'rookie' ? cands.length : 1;   /* 신참은 값이 오르는 수 가운데 아무거나 */
    return cands[keep === 1 ? 0 : C.randInt(st, keep)].m;
  }
  function aiTurn(data, st, level) {
    var m = aiMove(data, st, level), r;
    r = act(data, st, m); if (r.ok) endTurn(data, st);
    return { ok: r.ok, move: m, why: r.why };
  }

  /* ── 정산 — 판이 끝날 때 한 번. 통계·금·보상 뒷장·상점 돌림 ── */
  function settle(data, profile, st) {
    var s, win = st.winner === 'me', result, i, best = 0, pool = [], picks = 0, first = false, gold;
    if (st.phase !== 'done' || st.rewarded) return null;
    C.upgradeProfile(profile, data); s = profile.stats.lane;
    result = win ? 'win' : st.winner === 'foe' ? 'lose' : 'draw';
    C.bumpStats(s, { result: result, boss: st.champion, level: st.level, main: profile.main, rounds: st.roundLog.length, played: st.played });
    for (i = 0; i < st.roundLog.length; i++) if (st.roundLog[i].me > best) best = st.roundLog[i].me;
    if (best > s.bestLanes) s.bestLanes = best;
    for (i = 0; i < st.grown.length; i++) s.lines[st.grown[i]] = (s.lines[st.grown[i]] || 0) + 1;
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
  function statsView(data, profile) { return C.statsView(data, profile, 'lane'); }

  var api = {
    VERSION: VERSION, HAND: HAND, REFILL: REFILL, MULLIGAN: MULLIGAN, LIVES: LIVES, MAX_ROUNDS: MAX_ROUNDS, LANES: LANES,
    MAIN_MIN: MAIN_MIN, RARE_MAX: RARE_MAX, POWER_DIV: POWER_DIV, EVO_BONUS: EVO_BONUS, OPEN_MULT: OPEN_MULT, FIRST_CARDS: FIRST_CARDS,
    CHAMP_OWN: CHAMP_OWN, CHAMP_ALLY: CHAMP_ALLY, FORMS: FORMS, LEVELS: LEVELS,
    derive: derive, cardsOf: cardsOf, validateDeck: validateDeck, toggleDeck: toggleDeck, setMain: setMain, autoFill: autoFill,
    championOf: championOf, championReady: championReady, championPortrait: championPortrait, championDeck: championDeck,
    other: other, top: top, newMatch: newMatch, mulligan: mulligan, confirm: confirm, legal: legal, act: act, place: place, pass: pass, evolve: evolve, move: move, open: open, endTurn: endTurn, matchup: matchup, scores: scores, mult: mult,
    value: value, evaluate: evaluate, aiMove: aiMove, aiTurn: aiTurn, settle: settle, pickReward: pickReward, finishRewards: finishRewards, statsView: statsView
  };
  root.AtelierLane = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
