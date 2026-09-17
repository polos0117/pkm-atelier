/* 런 — 일곱 자리가 한 팩에서 뽑고, 나는 그 여섯과 보스를 차례로 만난다.

   드래프트: 나와 AI 여섯이 공유 팩(12장)에서 뱀 순서로 한 장씩, 세 바퀴. 내 차례에는
   보급 요청(리롤)으로 안 집힌 카드를 갈 수 있다 — 마지막 바퀴만 빼고. 원본(atelier)의
   드래프트 꼴 그대로다. 집힌 카드는 그 자리 것이라 남에게 안 간다.
   런: 여섯 판은 같은 팩에서 뽑은 AI 들이다 — 약한 순서로 만나고, 그들도 판마다 자라
   있다(내가 보상을 받았을 만큼 진화해 있다). 일곱째는 보스(전설 하나 + 완성형 둘).
   성장: 뽑을 때 덜 자란 카드를 집었으면, 런 안에서 진화할 때마다 예산에 보정이 붙는다.
   그래서 런 안에서 키운 완성형이 처음부터 완성형으로 집은 것보다 세다 — 늦게 세지는
   값을 그렇게 돌려받는다.
   체력은 다음 판으로 이어지고, 이기면 조금 숨을 돌린다. 판 사이 보상은 진화(전부 한
   단계, 체력이 찬다) 아니면 회복(절반).

   규칙은 전부 여기 있고 화면(run.html)은 보여 주고 고르기만 한다. 씨앗 하나로 런 전체가
   정해진다 — 팩·AI 의 손·상대·보상·판의 난수가 전부 씨앗에서 갈라져 나온다.

   상태는 JSON 그대로다 (localStorage 에 넣는 것은 화면의 일).
     { seed, phase: 'draft'|'nature'|'fight'|'reward'|'won'|'lost',
       round, turn, order: [[자리…] × ROUNDS], pack: [{ name, by }], rerolls,
       seats: [{ pref, roster: [{ name, origin }] }],   0 번이 나
       roster: [{ name, hp, origin, grown, nature }],   hp 0~1, 0 이면 쓰러진 것. nature 는 성격(폼 열쇠)
       foes: [자리…],  stage,  log: [{ stage, seat, foes, winner, beats }] }

   lib/battle.js 처럼 window.AtelierRun 하나만 붙이고, node 에서는 module.exports 로도 준다. */
(function (root, factory) {
  var B = root.AtelierBattle || (typeof require === 'function' ? require('./battle.js') : null);
  var api = factory(B);
  root.AtelierRun = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function (B) {
  'use strict';

  var SEATS = 7;           // 나 + AI 여섯
  var ROUNDS = 3;          // 바퀴 수 = 로스터 크기
  var PACKN = 12;          // 공유 팩 크기 — 일곱이 집고도 고를 것이 남게
  var REROLL_MAX = 2;      // 보급 요청 횟수
  var LENGTH = 7;          // 판 수 = AI 여섯 + 보스
  var HEAL = 0.5;          // 회복 보상 — 비율로 이만큼, 쓰러진 것은 이만큼으로 되살아난다
  /* 성장 보정과 난이도. 값은 tests/run-sim.cjs 로 잰다 —
     뽑기 세 갈래(성장형·중간·완성형)의 완주율이 비슷해야 하고, 완주율은 반 언저리 */
  var DIFF = {
    grow: 20,                               // 런 안에서 진화 한 번마다 예산에 더해지는 것 (한 단계 60 위에)
    foeScale: [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.85],   // 판별 상대 예산 배율 (일곱째는 보스)
    regen: 0.3,                             // 이기면 서 있는 것이 이만큼 숨을 돌린다
    evolveHeal: 1                           // 진화하면 체력이 이 비율까지 찬다
  };

  /* 씨앗 하나에서 결정마다 다른 난수를 갈라 낸다. 같은 결정은 늘 같은 난수 */
  var TAG = { order: 1, pack: 2, ai: 3, boss: 4, reward: 5, fight: 6, pref: 7, grow: 8 };
  function rngFor(state, tag, n, m) { return B.rng(state.seed * 1000 + tag * 97 + (n || 0) * 13 + (m || 0)); }
  function fightSeed(state) { return state.seed * 1000 + TAG.fight * 97 + state.stage; }

  /* ── 카드 풀 ─────────────────────────────────────── */
  function index(cards) {
    var by = {}, i;
    for (i = 0; i < cards.length; i++) by[cards[i].name] = cards[i];
    return by;
  }
  /* 남은 진화 수 — 예산이 여기서 갈린다 */
  function left(by, name) {
    var c = by[name]; if (!c || !c.to) return 0;
    var m = 0, i, t;
    for (i = 0; i < c.to.length; i++) { t = c.to[i]; if (by[t]) m = Math.max(m, 1 + left(by, t)); }
    return m;
  }
  function pool(by, filter) {
    var out = [], k;
    for (k in by) if (filter(by[k], left(by, k))) out.push(k);
    out.sort();              // 객체 순서에 기대지 않는다 — 씨앗이 같으면 같은 뽑기
    return out;
  }
  function pickN(R, list, n, avoid) {
    var out = [], tries = 0, x;
    while (out.length < n && tries++ < 800 && list.length) {
      x = list[Math.floor(R() * list.length)];
      if (out.indexOf(x) < 0 && (!avoid || avoid.indexOf(x) < 0)) out.push(x);
    }
    return out;
  }
  function taken(state) {
    var out = [], i, j;
    for (i = 0; i < state.seats.length; i++) for (j = 0; j < state.seats[i].roster.length; j++) out.push(state.seats[i].roster[j].name);
    for (i = 0; i < state.pack.length; i++) out.push(state.pack[i].name);
    return out;
  }
  /* 팩 한 벌 — 성장형·중간·완성형이 고루 섞이게 세 갈래에서 같은 수씩. 전설은 안 나온다 */
  function deal(state, by, n, salt) {
    var R = rngFor(state, TAG.pack, state.round, salt), avoid = taken(state), out = [], stages = [2, 1, 0], i;
    for (i = 0; i < n; i++) {
      var s = stages[i % 3];
      out = out.concat(pickN(R, pool(by, function (c, l) { return !c.rare && l === s; }), 1, avoid.concat(out)));
    }
    return out.map(function (name) { return { name: name, by: null }; });
  }

  /* ── 드래프트 ─────────────────────────────────────── */
  function shuffle(R, arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(R() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function newRun(seed, cards) {
    var by = index(cards), st = { seed: seed, phase: 'draft', round: 0, turn: 0, order: [], pack: [], rerolls: REROLL_MAX,
      seats: [], roster: [], foes: [], stage: 0, log: [] };
    var R = rngFor(st, TAG.order), first = shuffle(R, [0, 1, 2, 3, 4, 5, 6].slice(0, SEATS)), r, i;
    for (r = 0; r < ROUNDS; r++) st.order.push(r % 2 === 0 ? first : first.slice().reverse());   // 뱀 순서
    var P = rngFor(st, TAG.pref);
    for (i = 0; i < SEATS; i++) st.seats.push({ pref: i === 0 ? 0 : Math.round(P() * 100) / 100, roster: [] });   // pref: 성장을 얼마나 값 치나 (0~1)
    st.pack = deal(st, by, PACKN, 0);
    return advance(st, by);
  }
  function whose(state) { return state.order[state.round][state.turn]; }
  function isMine(state) { return state.phase === 'draft' && whose(state) === 0; }
  /* AI 의 손 — 지금 세기와 클 여지를 제 성향(pref)만큼 섞어 본다. 조금 흔들린다 */
  function aiScore(state, by, seat, name) {
    var l = left(by, name), now = B.TUNING.budget.final - B.TUNING.budget.step * l;
    var later = l * (B.TUNING.budget.step + DIFF.grow);
    var R = rngFor(state, TAG.ai, state.round * SEATS + seat, name.length + name.charCodeAt(0));
    return now + state.seats[seat].pref * later + (R() - 0.5) * 60;
  }
  function open(state) { return state.pack.filter(function (x) { return x.by === null; }); }
  function give(state, by, seat, name) {
    var i;
    for (i = 0; i < state.pack.length; i++) if (state.pack[i].name === name && state.pack[i].by === null) state.pack[i].by = seat;
    state.seats[seat].roster.push({ name: name, origin: left(by, name) });
  }
  /* 내 차례가 올 때까지 AI 가 집는다. 바퀴가 끝나면 새 팩, 세 바퀴가 끝나면 런 */
  function advance(state, by) {
    for (;;) {
      if (state.turn >= SEATS) {
        state.round++; state.turn = 0;
        if (state.round >= ROUNDS) return beginRun(state, by);
        state.pack = deal(state, by, PACKN, 0);
      }
      var seat = whose(state);
      if (seat === 0) return state;
      var best = null, bs = -1e9, cands = open(state), i, s;
      for (i = 0; i < cands.length; i++) { s = aiScore(state, by, seat, cands[i].name); if (s > bs) { bs = s; best = cands[i].name; } }
      if (best) give(state, by, seat, best);
      state.turn++;
    }
  }
  function pick(state, name, cards) {
    var by = index(cards);
    if (!isMine(state) || !open(state).some(function (x) { return x.name === name; })) return state;
    var next = clone(state);
    give(next, by, 0, name);
    next.turn++;
    return advance(next, by);
  }
  /* 보급 요청 — 안 집힌 카드를 새로 간다. 마지막 바퀴에는 없다 (원본 규칙) */
  function canReroll(state) { return isMine(state) && state.rerolls > 0 && state.round < ROUNDS - 1; }
  function reroll(state, cards) {
    if (!canReroll(state)) return state;
    var by = index(cards), next = clone(state);
    next.rerolls--;
    var keep = next.pack.filter(function (x) { return x.by !== null; });
    var fresh = deal(next, by, next.pack.length - keep.length, REROLL_MAX - next.rerolls);
    next.pack = keep.concat(fresh);
    return next;
  }
  /* 세 바퀴가 끝났다 — 내 로스터를 세우고, AI 여섯을 약한 순서로 늘어놓는다 */
  function power(by, seatRoster) {
    var s = 0, i;
    for (i = 0; i < seatRoster.length; i++) s += B.TUNING.budget.final - B.TUNING.budget.step * left(by, seatRoster[i].name);
    return s;
  }
  function beginRun(state, by) {
    var i, j;
    state.roster = state.seats[0].roster.map(function (r) { return { name: r.name, hp: 1, origin: r.origin, grown: 0, nature: null }; });
    var ais = [];
    for (i = 1; i < SEATS; i++) ais.push(i);
    ais.sort(function (a, b) { return power(by, state.seats[a].roster) - power(by, state.seats[b].roster) || a - b; });
    state.foes = ais;
    /* AI 는 능력치에 맞는 성격을 고른다. 나는 다음 단계에서 셋을 고른다 */
    for (i = 1; i < SEATS; i++) for (j = 0; j < state.seats[i].roster.length; j++)
      state.seats[i].roster[j].nature = suggest(by, state.seats[i].roster[j].name);
    state.phase = 'nature'; state.stage = 1;
    return state;
  }

  /* ── 성격 — 어느 폼이 몸에 맞나 ────────────────────
     드래프트가 끝나면 셋에게 하나씩. 능력치가 오르내리고(lib/battle.js NATURE), 그 폼으로
     판에 서며, 맡길 때 운용이 그 폼을 일하는 폼으로 삼는다. 갈아 입기는 그대로 된다.
     진화해도 성격은 남는다 — 포켓몬처럼 */
  function suggest(by, name) { return B.fitNature(B.budgetStats(by[name], left(by, name), B.TUNING)); }
  function setNature(state, i, nature) {
    if (state.phase !== 'nature' || !state.roster[i] || !B.NATURE[nature]) return state;
    var next = clone(state);
    next.roster[i].nature = nature;
    return next;
  }
  function natureDone(state) { return state.roster.length > 0 && state.roster.every(function (r) { return !!r.nature; }); }
  function startRun(state) {
    if (state.phase !== 'nature' || !natureDone(state)) return state;
    var next = clone(state);
    next.phase = 'fight';
    return next;
  }

  /* ── 상대 ─────────────────────────────────────────
     s 판(1~6)은 foes[s-1] 자리. 그 AI 는 그때까지 보상을 s-1 번 받았고 늘 진화를 골랐다고
     본다 — 진화할 수 있는 것은 전부 그만큼 자라 있다. 일곱째는 보스 */
  function grownRoster(state, by, seat, times) {
    var out = [], i, k, r, name, grown, tos;
    for (i = 0; i < state.seats[seat].roster.length; i++) {
      r = state.seats[seat].roster[i]; name = r.name; grown = 0;
      for (k = 0; k < times; k++) {
        tos = (by[name].to || []).filter(function (t) { return by[t]; });
        if (!tos.length) break;
        name = tos[Math.floor(rngFor(state, TAG.grow, seat * 10 + i, k)() * tos.length)]; grown++;
      }
      out.push({ name: name, origin: r.origin, grown: grown, nature: r.nature || null });
    }
    return out;
  }
  function encounter(state, cards) {
    var by = index(cards), s = state.stage;
    if (s < LENGTH) {
      var seat = state.foes[s - 1];
      return { seat: seat, members: grownRoster(state, by, seat, s - 1), policy: s <= 2 ? 'stay:heavy' : s <= 4 ? 'burn' : 'managed', seed: fightSeed(state) };
    }
    var R = rngFor(state, TAG.boss);
    var names = pickN(R, pool(by, function (c) { return c.rare === 'legendary'; }), 1)
      .concat(pickN(R, pool(by, function (c, l) { return !c.rare && l === 0; }), 2));
    return { seat: -1, members: names.map(function (n) { return { name: n, origin: 0, grown: 0, nature: suggest(by, n) }; }), policy: 'managed', seed: fightSeed(state) };
  }

  /* ── 한 판 세우기·거두기 ───────────────────────────
     예산 = 기본 + 성장 보정 × 런 안에서 진화한 수. 상대는 거기에 판별 배율.
     쓰러진 것(hp 0)은 안 나온다. 체력 비율은 그대로 들고 나간다 */
  function budgetOf(grown, scale) {
    return B.merge(B.TUNING, { budget: { final: Math.round((B.TUNING.budget.final + DIFF.grow * (grown || 0)) * (scale || 1)) } });
  }
  function actors(state, cards, chart, policy) {
    var by = index(cards), foe = encounter(state, cards);
    var a = [], b = [], i, r, m;
    for (i = 0; i < state.roster.length; i++) {
      r = state.roster[i];
      if (r.hp <= 0) continue;
      a.push(B.makeActor(by[r.name], { side: 'a', policy: policy || 'managed', remaining: left(by, r.name), hpFrac: r.hp, tuning: budgetOf(r.grown), nature: r.nature }));
    }
    var scale = DIFF.foeScale[Math.min(state.stage, DIFF.foeScale.length) - 1];
    for (i = 0; i < foe.members.length; i++) {
      m = foe.members[i];
      b.push(B.makeActor(by[m.name], { side: 'b', policy: foe.policy, remaining: left(by, m.name), tuning: budgetOf(m.grown, scale), nature: m.nature || null }));
    }
    return { a: a, b: b, seed: foe.seed, chart: chart, foes: foe.members.map(function (x) { return x.name; }), seat: foe.seat };
  }
  function settle(state, result, foes, seat) {
    var next = clone(state), i, j, a;
    for (i = 0; i < next.roster.length; i++) {
      for (j = 0; j < result.actors.length; j++) {
        a = result.actors[j];
        if (a.side === 'a' && a.name === next.roster[i].name) next.roster[i].hp = a.alive ? a.hp / a.hpMax : 0;
      }
    }
    next.log.push({ stage: next.stage, seat: seat == null ? -1 : seat, foes: foes, winner: result.winner, beats: result.beats });
    if (result.winner !== 'a') next.phase = 'lost';
    else {
      /* 이기면 서 있는 것들이 숨을 돌린다. 쓰러진 것은 회복·진화로만 돌아온다 */
      for (i = 0; i < next.roster.length; i++) if (next.roster[i].hp > 0) next.roster[i].hp = Math.min(1, next.roster[i].hp + DIFF.regen);
      next.phase = next.stage >= LENGTH ? 'won' : 'reward';
    }
    return next;
  }

  /* ── 보상 ─────────────────────────────────────────
     둘 가운데 하나 — 진화 아니면 회복.
     진화: 진화할 수 있는 로스터 전부가 한 단계 오른다 (갈래가 여럿이면 하나를 골라 준다).
       예산이 한 단계 + 성장 보정만큼 오르고, 몸을 새로 짓는 것이라 체력이 찬다.
     회복: 전부 절반 회복, 쓰러진 것은 절반으로 되살아난다.
     진화할 것이 없으면 회복뿐이다 — 완성형만 뽑으면 늦게 세지는 값을 그렇게 치른다 */
  function rewards(state, cards) {
    var by = index(cards), R = rngFor(state, TAG.reward, state.stage);
    var steps = [], i, c, out = [];
    for (i = 0; i < state.roster.length; i++) {
      c = by[state.roster[i].name];
      var tos = (c && c.to || []).filter(function (t) { return by[t]; });
      if (tos.length) steps.push({ who: i, from: c.name, to: tos[Math.floor(R() * tos.length)] });
    }
    if (steps.length) out.push({ kind: 'evolve', steps: steps });
    out.push({ kind: 'heal' });
    return out;
  }
  function choose(state, i, cards) {
    var opts = rewards(state, cards), o = opts[i];
    if (state.phase !== 'reward' || !o) return state;
    var next = clone(state), k, r;
    if (o.kind === 'evolve') for (k = 0; k < o.steps.length; k++) {
      r = next.roster[o.steps[k].who];
      r.name = o.steps[k].to; r.grown = (r.grown || 0) + 1;
      r.hp = Math.max(r.hp, DIFF.evolveHeal);
    } else for (k = 0; k < next.roster.length; k++)
      next.roster[k].hp = Math.min(1, (next.roster[k].hp > 0 ? next.roster[k].hp : 0) + HEAL);
    next.stage++;
    next.phase = 'fight';
    return next;
  }

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  return { SEATS: SEATS, ROUNDS: ROUNDS, PACKN: PACKN, REROLL_MAX: REROLL_MAX, LENGTH: LENGTH, HEAL: HEAL, DIFF: DIFF, TAG: TAG,
           newRun: newRun, pick: pick, reroll: reroll, canReroll: canReroll, isMine: isMine, whose: whose, open: open,
           suggest: suggest, setNature: setNature, natureDone: natureDone, startRun: startRun,
           encounter: encounter, actors: actors, settle: settle, rewards: rewards, choose: choose, budgetOf: budgetOf,
           left: left, index: index, power: power };
});
