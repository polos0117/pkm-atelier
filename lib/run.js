/* 런 — 세 장을 뽑아 일곱 판을 이어 싸운다.

   판 사이에 진화나 회복을 고르고, 체력은 다음 판으로 이어진다. 셋이 다 쓰러지면 끝.
   규칙은 전부 여기 있고 화면(run.html)은 보여 주고 고르기만 한다. 씨앗 하나로 런 전체가
   정해진다 — 뽑기·상대·보상·판의 난수가 전부 씨앗에서 갈라져 나오므로, 저장한 상태를
   다시 읽어도 같은 런이다.

   상태는 JSON 그대로다 (localStorage 에 넣는 것은 화면의 일).
     { seed, phase: 'draft'|'fight'|'reward'|'won'|'lost', stage, round,
       roster: [{ name, hp }],   hp 는 0~1 비율. 0 이면 쓰러진 것 — 회복 전에는 안 나온다
       log: [{ stage, foes, winner, beats }] }

   lib/battle.js 처럼 window.AtelierRun 하나만 붙이고, node 에서는 module.exports 로도 준다. */
(function (root, factory) {
  var B = root.AtelierBattle || (typeof require === 'function' ? require('./battle.js') : null);
  var api = factory(B);
  root.AtelierRun = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function (B) {
  'use strict';

  var LENGTH = 7;          // 판 수
  var ROUNDS = 3;          // 뽑기 횟수 = 로스터 크기
  var HEAL = 0.5;          // 회복 보상 — 비율로 이만큼, 쓰러진 것은 이만큼으로 되살아난다
  /* 난이도. 상대의 예산 천장은 판마다 오른다 (아군 완성형은 500) — 앞 판은 덜 여문 상대다.
     이기면 숨 돌릴 만큼 저절로 회복한다. 값은 tests/run-sim.cjs 로 잰다 */
  var DIFF = { foeBudget: [300, 320, 350, 380, 400, 420, 440], regen: 0.3, evolveHeal: 1 };   // evolveHeal: 진화하면 체력이 이 비율까지 찬다

  /* 씨앗 하나에서 결정마다 다른 난수를 갈라 낸다. 같은 결정은 늘 같은 난수 */
  function rngFor(state, tag, n) { return B.rng(state.seed * 1000 + tag * 50 + (n || 0)); }
  var TAG = { draft: 1, foe: 2, reward: 3, fight: 4 };
  function fightSeed(state) { return state.seed * 1000 + TAG.fight * 50 + state.stage; }

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
    while (out.length < n && tries++ < 500 && list.length) {
      x = list[Math.floor(R() * list.length)];
      if (out.indexOf(x) < 0 && (!avoid || avoid.indexOf(x) < 0)) out.push(x);
    }
    return out;
  }

  /* ── 뽑기 ─────────────────────────────────────────
     세 장 가운데 하나. 세 장은 늘 성장형(남은 진화 2) · 중간(1) · 완성형(0) 하나씩이다 —
     지금 세기와 나중에 클 여지 사이에서 고른다. 전설은 안 나온다 */
  function newRun(seed, cards) {
    return { seed: seed, phase: 'draft', stage: 0, round: 0, roster: [], log: [] };
  }
  function offer(state, cards) {
    var by = index(cards), R = rngFor(state, TAG.draft, state.round);
    var taken = state.roster.map(function (r) { return r.name; });
    var out = [], stages = [2, 1, 0], i;
    for (i = 0; i < stages.length; i++) {
      var s = stages[i];
      out = out.concat(pickN(R, pool(by, function (c, l) { return !c.rare && l === s; }), 1, taken.concat(out)));
    }
    return out;
  }
  function pick(state, name, cards) {
    var by = index(cards);
    if (state.phase !== 'draft' || !by[name]) return state;
    var next = clone(state);
    next.roster.push({ name: name, hp: 1 });
    next.round++;
    if (next.round >= ROUNDS) { next.phase = 'fight'; next.stage = 1; }
    return next;
  }

  /* ── 상대 ─────────────────────────────────────────
     앞 판은 덜 자란 셋, 가운데는 섞여서, 뒤는 완성형. 마지막은 전설 하나가 낀다.
     운용도 뒤로 갈수록 는다 — 앞은 눌러앉기, 뒤는 관리 */
  function encounter(state, cards) {
    var by = index(cards), s = state.stage, R = rngFor(state, TAG.foe, s);
    var names, policy;
    if (s <= 2) names = pickN(R, pool(by, function (c, l) { return !c.rare && l >= 1; }), 3);
    else if (s <= 4) names = pickN(R, pool(by, function (c, l) { return !c.rare && l <= 1; }), 3);
    else if (s < LENGTH) names = pickN(R, pool(by, function (c, l) { return !c.rare && l === 0; }), 3);
    else names = pickN(R, pool(by, function (c) { return c.rare === 'legendary'; }), 1)
      .concat(pickN(R, pool(by, function (c, l) { return !c.rare && l === 0; }), 2));
    policy = s <= 1 ? 'stay:mobility' : s <= 2 ? 'stay:heavy' : s <= 4 ? 'burn' : 'managed';
    return { names: names, policy: policy, seed: fightSeed(state) };
  }

  /* ── 한 판 세우기·거두기 ───────────────────────────
     쓰러진 것(hp 0)은 안 나온다. 체력 비율은 그대로 들고 나간다 */
  function actors(state, cards, chart, policy) {
    var by = index(cards), foe = encounter(state, cards);
    var a = [], b = [], i, r;
    for (i = 0; i < state.roster.length; i++) {
      r = state.roster[i];
      if (r.hp <= 0) continue;
      a.push(B.makeActor(by[r.name], { side: 'a', policy: policy || 'managed', remaining: left(by, r.name), hpFrac: r.hp }));
    }
    var foeT = B.merge(B.TUNING, { budget: { final: DIFF.foeBudget[Math.min(state.stage, DIFF.foeBudget.length) - 1] } });
    for (i = 0; i < foe.names.length; i++)
      b.push(B.makeActor(by[foe.names[i]], { side: 'b', policy: foe.policy, remaining: left(by, foe.names[i]), tuning: foeT }));
    return { a: a, b: b, seed: foe.seed, chart: chart, foes: foe.names };
  }
  function settle(state, result, foes) {
    var next = clone(state), i, j, a;
    for (i = 0; i < next.roster.length; i++) {
      for (j = 0; j < result.actors.length; j++) {
        a = result.actors[j];
        if (a.side === 'a' && a.name === next.roster[i].name) next.roster[i].hp = a.alive ? a.hp / a.hpMax : 0;
      }
    }
    next.log.push({ stage: next.stage, foes: foes, winner: result.winner, beats: result.beats });
    if (result.winner !== 'a') next.phase = 'lost';
    else {
      /* 이기면 서 있는 것들이 숨을 돌린다. 쓰러진 것은 회복 보상으로만 돌아온다 */
      for (i = 0; i < next.roster.length; i++) if (next.roster[i].hp > 0) next.roster[i].hp = Math.min(1, next.roster[i].hp + DIFF.regen);
      next.phase = next.stage >= LENGTH ? 'won' : 'reward';
    }
    return next;
  }

  /* ── 보상 ─────────────────────────────────────────
     둘 가운데 하나 — 진화 아니면 회복.
     진화: 진화할 수 있는 로스터 전부가 한 단계 오른다 (갈래가 여럿이면 하나를 골라 준다).
       예산이 한 단계 오르고 몸을 새로 짓는 것이라 체력이 찬다 — 쓰러진 채로도 되살아난다.
       하나씩 고르게 했더니 성장형 셋은 여섯 번이 필요해 끝까지 못 컸다 (tests/run-sim.cjs).
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
    var next = clone(state), k;
    if (o.kind === 'evolve') for (k = 0; k < o.steps.length; k++) {
      next.roster[o.steps[k].who].name = o.steps[k].to;
      next.roster[o.steps[k].who].hp = Math.max(next.roster[o.steps[k].who].hp, DIFF.evolveHeal);
    } else for (k = 0; k < next.roster.length; k++)
      next.roster[k].hp = Math.min(1, (next.roster[k].hp > 0 ? next.roster[k].hp : 0) + HEAL);
    next.stage++;
    next.phase = 'fight';
    return next;
  }

  function clone(s) { return JSON.parse(JSON.stringify(s)); }

  return { LENGTH: LENGTH, ROUNDS: ROUNDS, HEAL: HEAL, DIFF: DIFF, TAG: TAG,
           newRun: newRun, offer: offer, pick: pick, encounter: encounter, actors: actors, settle: settle,
           rewards: rewards, choose: choose, left: left, index: index };
});
