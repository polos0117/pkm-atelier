/* 전투 엔진 — 화면 없이 돈다. docs/GAME_CONCEPT.md 의 규칙을 그대로 코드로 옮긴 것이다.

   왜 화면보다 먼저 만드나: 문서가 남긴 미정은 전부 수치다(박자 수 · 예산 한 단계 ·
   진화 보상 빈도). 수치는 문서로 못 정하고 굴려 봐야 나온다. 그리고 "중장 과열
   눈덩이" 같은 걱정이 진짜인지도 굴려 봐야 안다. 그래서 node 로 수천 판을 돌릴 수
   있는 엔진을 먼저 둔다. tests/battle-sim.cjs 가 그 실험이다.

   규칙은 문서를 따르고, 문서에 없는 값은 전부 TUNING 에 모아 둔다.
   실험이 값을 바꿔 가며 돌리므로 TUNING 은 부를 때 덮어쓸 수 있다.

   이 파일에는 화면 말이 없다 — 사건은 영문 열쇠로 남기고, 사람이 읽는 말은
   부르는 쪽(검사)이 붙인다. lib/words.js 와 같은 규칙이다.

   lib/img.js 처럼 window.AtelierBattle 하나만 붙인다. node 에서는 module.exports 로도 준다. */
(function (root, factory) {
  var api = factory();
  root.AtelierBattle = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  /* 문서가 정하지 않은 값. 전부 시험 대상이다 — 굳은 규칙은 아래 코드에 있다 */
  var TUNING = {
    budget: { final: 500, step: 60, speedOut: true },    // 스피드는 예산 밖 — 순서만 정하니 예산에 넣으면 죽은 몫이 된다 (규칙, 신호 11)       // 예산 = final − 남은 진화 × step
    hpScale: 4,                              // 체력 = HP 종족값 × 이 값
    maxDrive: 100, maxHeat: 100,
    startDrive: 30,
    basePower: 36,
    form: {
      /* regen·cool 은 박자마다 / hitHeat 는 맞을 때 / atkHeat 는 칠 때 */
      light:    { atk: 1.0, def: 0.85, regen: 15, cool: 15, hitHeat: 6, atkHeat: 4, evade: 0,    order: 0 },
      mobility: { atk: 1.0, def: 0.9,  regen: 3,  cool: 6,  hitHeat: 6, atkHeat: 6, evade: 0.35, evadeHeat: 10, order: 1, extraCost: 30 },   // 피하면 Heat 가 오른다 (규칙)
      heavy:    { atk: 0.9, def: 1.3,  regen: 3,  cool: 3,  hitHeat: 3, atkHeat: 8, evade: 0,    order: 2, guard: 0.6 },
    },
    switchHeat: 12, switchLock: 2,           // 경장 복귀는 Heat 0 (규칙)
    lightReturnFree: true,                   // 경장 복귀는 행동도 안 먹는다 (규칙 — 신호 8 의 D)
    overheat: { atk: 1.0, extra: true, clear: 60 },   // 과열 상태(강제로 열린 뒤 Heat 가 clear 밑으로 식을 때까지) 의 공격 배율 · 연속행동 (신호 9 후보 — 기본은 아무 것도 안 함)
    open:   { cost: 60, entryHeat: 25, beats: 2, atk: 1.8, coolLock: 3, vent: 40 },
    forced: { atk: 1.2, coolLock: 5,         // 대상 못 고름 · 위력 낮음 · 냉각 김 (규칙)
              vent: 0, stun: false, beats: 0 },    // 강제 방출은 Heat 를 안 뺀다 (규칙 — 신호 8 의 B) · 열린 동안 행동을 못 하나 · 지속(0 이면 open.beats)
    heavyOpenDef: 1.0,                       // 중장 개방 중 방어는 일반 수준으로 (규칙: 보호를 내준다)
  };

  function merge(a, b) {
    var out = {}, k;
    for (k in a) out[k] = (a[k] && typeof a[k] === 'object' && !Array.isArray(a[k])) ? merge(a[k], (b || {})[k]) : a[k];
    for (k in (b || {})) if (!(k in out) || typeof out[k] !== 'object') out[k] = b[k];
    return out;
  }

  /* 씨앗 난수 — 같은 씨앗이면 같은 판. 실험을 되풀이할 수 있어야 한다 */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s += 0x6D2B79F5; var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* 예산 = 최종형 공통값 − 남은 진화 × 한 단계. 원본 종족값의 몫으로 나눈다 (규칙) */
  function budgetStats(card, remaining, T) {
    var raw = card.stats, tot = 0, i, b = T.budget.final - T.budget.step * (remaining || 0);
    var n = T.budget.speedOut ? 5 : 6;      // 스피드를 예산 밖에 두면 다섯 칸에 나눈다
    for (i = 0; i < n; i++) tot += raw[i];
    var s = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 }, keys = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
    for (i = 0; i < n; i++) s[keys[i]] = Math.round(b * raw[i] / tot);
    if (T.budget.speedOut) s.spe = raw[5];   // 스피드는 원본 그대로 — 순서만 정한다
    return s;
  }

  function makeActor(card, opt) {
    opt = opt || {};
    var T = opt.tuning || TUNING;
    var st = budgetStats(card, opt.remaining || 0, T);
    return {
      name: card.name, side: opt.side || 'a', policy: opt.policy || 'managed',
      types: [card.element].concat(card.element2 ? [card.element2] : []),
      atkType: card.element,
      stats: st, hpMax: st.hp * T.hpScale, hp: st.hp * T.hpScale,
      form: opt.form || 'light', open: null,
      drive: T.startDrive, heat: 0,
      switchLock: 0, coolLock: 0, skipNext: false, pendingVent: false, overheated: false,
      reserved: null, alive: true,
      count: { switches: 0, opens: 0, forced: 0, extra: 0 },
    };
  }

  function typeMul(chart, atkType, types) {
    var m = 1, i, row = (chart || {})[atkType] || {};
    for (i = 0; i < types.length; i++) m *= (row[types[i]] === undefined ? 1 : row[types[i]]);
    return m;
  }

  /* ── 한 판 ───────────────────────────────────────── */
  function battle(sideA, sideB, opt) {
    opt = opt || {};
    var T = opt.tuning ? merge(TUNING, opt.tuning) : TUNING;
    var R = rng(opt.seed || 1), chart = opt.chart || {};
    var maxBeats = opt.maxBeats || 60;
    var log = [];
    var all = sideA.concat(sideB);
    var beat = 0;

    function foes(a) { return all.filter(function (x) { return x.alive && x.side !== a.side; }); }
    function mates(a) { return all.filter(function (x) { return x.alive && x.side === a.side && x !== a; }); }
    function ev(kind, a, extra) { var e = { beat: beat, kind: kind, who: a && a.name, side: a && a.side }; for (var k in (extra || {})) e[k] = extra[k]; log.push(e); }

    function clampHeat(a) {
      if (a.heat > T.maxHeat) a.heat = T.maxHeat;
      if (a.heat < 0) a.heat = 0;
      if (a.overheated && a.heat < T.overheat.clear) a.overheated = false;
      /* 천장에 닿으면 강제로 열린다 (규칙). 이미 열려 있으면 그대로.
         냉각 잠금 동안은 다시 안 터진다 — 강제 방출은 Heat 를 안 빼므로, 이게 없으면 100 에서
         끝나자마자 또 열려 영원히 되풀이되고 경장으로 갈 틈이 없다 */
      if (a.heat >= T.maxHeat && !a.open && a.coolLock === 0) forceOpen(a);
    }

    function forceOpen(a) {
      a.open = { from: a.form, left: T.forced.beats || T.open.beats, forced: true };
      a.pendingVent = true;
      a.overheated = true;      // 과열은 상태다 — clear 밑으로 식을 때까지 남는다
      a.count.forced++;
      /* 그 폼이 하던 일을 친다 (규칙) */
      if (a.form === 'light') a.drive = 0;
      if (a.form === 'mobility') a.skipNext = true;
      /* 중장은 열린 동안 보호가 끊긴다 — guard 판정이 open 을 보므로 따로 할 것 없다 */
      ev('forced-open', a, { from: a.form });
    }

    function endOpen(a) {
      var forced = a.open.forced, before = a.heat;
      a.open = null;
      a.heat -= forced ? T.forced.vent : T.open.vent;   // 자발 개방은 열이 빠진다. 강제는 안 빠진다 (규칙) — 식히려면 경장으로
      if (a.heat < 0) a.heat = 0;
      a.coolLock = forced ? T.forced.coolLock : T.open.coolLock;
      ev('open-end', a, { forced: forced, heatBefore: before, heat: a.heat });
    }

    function defOf(a) {
      var f = T.form[a.form].def;
      if (a.open && a.form === 'heavy') f = T.heavyOpenDef;
      return f;
    }

    function hit(att, tgt, mult, untargeted) {
      /* 고기동은 피한다 — 열려 있으면 못 피한다. 피하는 것도 공짜가 아니다: Heat 가 오른다
         (맞을 때보다 더). 계속 피하다 보면 천장에 닿아 강제로 열린다 */
      if (!tgt.open && T.form[tgt.form].evade && R() < T.form[tgt.form].evade) {
        var hb = tgt.heat;
        tgt.heat += T.form[tgt.form].evadeHeat || 0;
        ev('evade', tgt, { by: att.name, heatBefore: hb, heat: tgt.heat });
        clampHeat(tgt);
        return 0;
      }
      /* 중장 아군이 서 있으면 받아낸다 — 열린 중장은 못 받는다 */
      var guard = null, m = mates(tgt), i;
      for (i = 0; i < m.length; i++) if (m[i].form === 'heavy' && !m[i].open) { guard = m[i]; break; }
      var atkStat = att.stats.atk, useSpecial = att.stats.spa > att.stats.atk;
      if (useSpecial) atkStat = att.stats.spa;
      var base = T.basePower * atkStat * T.form[att.form].atk * (att.open ? (att.open.forced ? T.forced.atk : T.open.atk) : 1)
        * (att.overheated && !att.open ? T.overheat.atk : 1)
        * typeMul(chart, att.atkType, tgt.types) * (0.9 + R() * 0.2) * (mult || 1);
      function apply(victim, share) {
        var defStat = useSpecial ? victim.stats.spd : victim.stats.def;
        var dmg = Math.round(base * share / (defStat * defOf(victim)));
        victim.hp -= dmg;
        victim.heat += T.form[victim.form].hitHeat;
        ev('hit', att, { to: victim.name, dmg: dmg, guard: victim !== tgt, untargeted: !!untargeted });
        if (victim.hp <= 0) { victim.hp = 0; victim.alive = false; ev('down', victim); }
        clampHeat(victim);
        return dmg;
      }
      var total = 0;
      if (guard && !untargeted) { total += apply(guard, T.form.heavy.guard); total += apply(tgt, 1 - T.form.heavy.guard); }
      else total += apply(tgt, 1);
      att.heat += T.form[att.form].atkHeat;
      clampHeat(att);
      return total;
    }

    function pickTarget(a) {
      var f = foes(a); if (!f.length) return null;
      f.sort(function (x, y) { return x.hp - y.hp; });
      return f[0];
    }

    function doSwitch(a, form) {
      if (a.switchLock > 0 || a.open || form === a.form) return false;
      var before = a.heat;
      a.form = form;
      a.switchLock = T.switchLock;
      if (form !== 'light') a.heat += T.switchHeat;   // 경장 복귀는 Heat 0 (규칙)
      a.count.switches++;
      ev('switch', a, { to: form, heatBefore: before, heat: a.heat });   // 전환이 더한 것을 따로 볼 수 있게
      clampHeat(a);
      return true;
    }

    function doOpen(a) {
      if (a.open || a.coolLock > 0 || a.drive < T.open.cost) return false;
      a.drive -= T.open.cost;
      a.heat += T.open.entryHeat;
      a.open = { from: a.form, left: T.open.beats, forced: false };
      a.count.opens++;
      ev('open', a, { from: a.form });
      if (a.heat > T.maxHeat) a.heat = T.maxHeat;   // 자발적 개방은 천장에 닿아도 다시 강제되지 않는다
      var t = pickTarget(a); if (t) hit(a, t, 1);
      return true;
    }

    function act(a) {
      if (!a.alive) return;
      if (a.skipNext) { a.skipNext = false; ev('skip', a); return; }
      /* 강제로 열린 동안 행동을 못 한다 (후보 규칙 — 방출 한 번은 나간다) */
      if (T.forced.stun && a.open && a.open.forced && !a.pendingVent) { ev('skip', a, { stun: true }); return; }
      /* 강제 방출이 먼저 나간다. 예약은 다음 박자로 밀린다 (규칙) */
      if (a.pendingVent) {
        a.pendingVent = false;
        var f = foes(a); if (f.length) hit(a, f[Math.floor(R() * f.length)], 1, true);
        ev('vent', a);
        return;
      }
      var cmd = a.reserved; a.reserved = null;
      if (!cmd) cmd = (typeof a.policy === 'function' ? a.policy : POLICY[a.policy])(a, { foes: foes(a), mates: mates(a), T: T, beat: beat }, R);
      var done = false;
      if (cmd.kind === 'switch') { done = doSwitch(a, cmd.form); if (done && cmd.form === 'light' && T.lightReturnFree) done = false; }
      else if (cmd.kind === 'open') done = doOpen(a);
      if (!done) { var t = pickTarget(a); if (t) hit(a, t, 1); ev('attack', a); }
      /* 고기동의 연속행동 — Drive 를 내고 같은 박자에 한 번 더 (규칙의 유일한 빈도 예외) */
      if (a.alive && a.form === 'mobility' && !a.open && cmd.extra && a.drive >= T.form.mobility.extraCost && (T.overheat.extra || !a.overheated)) {
        a.drive -= T.form.mobility.extraCost; a.count.extra++;
        var t2 = pickTarget(a); if (t2) hit(a, t2, 1); ev('extra', a);
      }
    }

    function tick(a) {
      if (!a.alive) return;
      a.drive = Math.min(T.maxDrive, a.drive + T.form[a.form].regen);
      if (!a.open) a.heat -= T.form[a.form].cool;
      if (a.switchLock > 0) a.switchLock--;
      if (a.coolLock > 0) a.coolLock--;
      if (a.open) { a.open.left--; if (a.open.left <= 0) endOpen(a); }
      clampHeat(a);
    }

    function order() {
      return all.filter(function (x) { return x.alive; }).sort(function (x, y) {
        if (y.stats.spe !== x.stats.spe) return y.stats.spe - x.stats.spe;
        if (T.form[x.form].order !== T.form[y.form].order) return T.form[x.form].order - T.form[y.form].order;
        return x.side === 'a' ? -1 : 1;    // 같으면 아군 먼저 (임시 규칙)
      });
    }

    function aliveSides() {
      var a = all.some(function (x) { return x.alive && x.side === 'a'; });
      var b = all.some(function (x) { return x.alive && x.side === 'b'; });
      return { a: a, b: b };
    }

    /* 화면이 되감기를 하려면 박자마다 자리를 떠 둬야 한다 (opt.snapshots). 0 번은 시작 자리 */
    var snaps = opt.snapshots ? [] : null;
    function snap() {
      snaps.push({ beat: beat, actors: all.map(function (a) {
        return { name: a.name, side: a.side, form: a.form, hp: a.hp, hpMax: a.hpMax, heat: a.heat, drive: a.drive,
                 alive: a.alive, open: !!a.open, forced: !!(a.open && a.open.forced) };
      }) });
    }
    if (snaps) { beat = 0; snap(); }
    for (beat = 1; beat <= maxBeats; beat++) {
      var ord = order(), i;
      for (i = 0; i < ord.length; i++) act(ord[i]);
      for (i = 0; i < all.length; i++) tick(all[i]);
      if (snaps) snap();
      var s = aliveSides();
      if (!s.a || !s.b) break;
    }
    var end = aliveSides();
    return { winner: end.a && !end.b ? 'a' : (!end.a && end.b ? 'b' : 'draw'), beats: Math.min(beat, maxBeats), log: log, actors: all, snaps: snaps };
  }

  /* ── 정책 — 누가 무엇을 고르나 ─────────────────────
     정책은 예약을 대신한다. 사람이 멈춰서 고를 것을 규칙으로 흉내 낸다 */
  var POLICY = {
    /* 그 폼에 눌러앉는다. 퇴화 전략 검사용 */
    'stay:light':    function (a) { return a.form === 'light' ? { kind: 'attack' } : { kind: 'switch', form: 'light' }; },
    'stay:heavy':    function (a) { return a.form === 'heavy' ? { kind: 'attack' } : { kind: 'switch', form: 'heavy' }; },
    'stay:mobility': function (a) { return a.form === 'mobility' ? { kind: 'attack', extra: true } : { kind: 'switch', form: 'mobility' }; },
    /* 중장에 앉아 열 수 있으면 연다 — 자발 개방을 남용하면 이기는지 본다.
       "일부러 과열" 은 이게 아니라 stay:* 다 (안 식히니까). 이름은 옛것을 남긴다 */
    'burn': function (a, s) {
      if (a.form !== 'heavy') return { kind: 'switch', form: 'heavy' };
      if (!a.open && a.coolLock === 0 && a.drive >= s.T.open.cost) return { kind: 'open' };
      return { kind: 'attack' };
    },
    /* 문서가 그리는 운용. 식힐 때 경장, 버틸 때 중장, 잡을 때 고기동, 찼으면 연다.
       경장은 식히는 자리지 사는 자리가 아니다 — 식었으면 바로 일하는 폼으로 나간다.
       (처음 꼴은 "찼으면 연다" 를 먼저 봐서 Drive 60 이 되면 경장에서 열고, 경장에서 거의 안 나갔다.
        피카츄가 경장 그대로 3박자에 죽었다. 그 꼴로 잰 숫자는 "경장+개방" 의 숫자였다)
       문턱은 MANAGED 에 있고 managedWith(p) 로 바꿔 끼울 수 있다 — 실험이 훑는 자리 */
    'managed': null,
  };
  var MANAGED = {
    heatOut: 100,      // 이 Heat 부터 경장으로 빠진다. 100 = 과열을 맞고 나서 식힌다 — 이른 식힘은 값을 안 한다 (신호 9·10)
    heatBack: 35,      // 경장에서 이 밑으로 식으면 일하는 폼으로 나간다
    openHeatMax: 60,   // 이 Heat 밑에서만 연다
    openInLight: true, // 경장에서도 여나
    openFirst: false,  // 빠지기 전에 찼으면 먼저 여나 (개방 끝의 방출 40 이 식힘 구실)
    extraMargin: 0,    // 연속행동은 Drive 가 값 + 이만큼일 때 (아끼면 진다 — 신호 7)
    overheatIn: '',    // 과열을 이 폼에서 맞는다 — Heat 가 overheatAt 이면 그 폼으로 간다 (빈 값이면 안 고른다. null 은 merge 가 object 로 봐서 못 덮는다)
    overheatAt: 85,
  };
  function managedWith(p) {
    var P = merge(merge({}, MANAGED), p || {});
    return function (a, s) {
      var T = s.T, tank = a.stats.def >= a.stats.spe;
      var canOpen = !a.open && a.coolLock === 0 && a.drive >= T.open.cost && (P.openInLight || a.form !== 'light');
      if (a.open) return { kind: 'attack', extra: true };
      if (a.heat >= P.heatOut && a.form !== 'light') {
        if (P.openFirst && canOpen) return { kind: 'open' };
        if (a.switchLock === 0) return { kind: 'switch', form: 'light' };
      }
      if (P.overheatIn && a.heat >= P.overheatAt && a.form !== P.overheatIn && a.switchLock === 0)
        return { kind: 'switch', form: P.overheatIn };
      if (a.form === 'light' && a.heat < P.heatBack && a.switchLock === 0)
        return { kind: 'switch', form: tank ? 'heavy' : 'mobility' };
      if (canOpen && a.heat < P.openHeatMax) return { kind: 'open' };
      return { kind: 'attack', extra: a.drive >= T.form.mobility.extraCost + P.extraMargin };
    };
  }
  POLICY.managed = managedWith();

  return { TUNING: TUNING, POLICY: POLICY, MANAGED: MANAGED, managedWith: managedWith, rng: rng, budgetStats: budgetStats, makeActor: makeActor, battle: battle, typeMul: typeMul, merge: merge };
});
