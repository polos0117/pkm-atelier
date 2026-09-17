/* 런을 화면 없이 수백 번 굴린다 — 뽑기·판·보상 규칙이 맞물리는지 보는 검사이고,
   난이도를 재는 실험이다. Run: node tests/run-sim.cjs [--quick] */
const fs = require('node:fs'), assert = require('node:assert/strict');
const B = require('../lib/battle.js'), RUN = require('../lib/run.js');
const quick = process.argv.includes('--quick');
const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8'));
const chart = JSON.parse(fs.readFileSync('data/chart.json', 'utf8')).chart;
const cards = card.cards.character, by = RUN.index(cards);

/* 뽑기 전략: 어느 자리를 집나 (0 성장형 · 1 중간 · 2 완성형) */
const DRAFT = {
  final: () => 2, growth: () => 0, middle: () => 1,
  random: (R) => Math.floor(R() * 3),
};
/* 보상 전략 */
const REWARD = {
  evolve: (opts, st) => { const i = opts.findIndex(o => o.kind === 'evolve'); return i < 0 ? opts.length - 1 : i; },
  heal: (opts) => opts.length - 1,
  smart: (opts, st) => {
    const hurt = st.roster.some(r => r.hp <= 0) || st.roster.reduce((s, r) => s + r.hp, 0) / st.roster.length < 0.45;
    if (hurt) return opts.length - 1;
    const i = opts.findIndex(o => o.kind === 'evolve'); return i < 0 ? opts.length - 1 : i;
  },
};
function playRun(seed, draft, reward, policy) {
  const R = B.rng(seed + 77);
  let st = RUN.newRun(seed, cards);
  while (st.phase === 'draft') { const o = RUN.offer(st, cards); st = RUN.pick(st, o[draft(R)], cards); }
  while (st.phase === 'fight' || st.phase === 'reward') {
    if (st.phase === 'reward') { st = RUN.choose(st, reward(RUN.rewards(st, cards), st), cards); continue; }
    const f = RUN.actors(st, cards, chart, policy || 'managed');
    const r = B.battle(f.a, f.b, { seed: f.seed, chart });
    st = RUN.settle(st, r, f.foes);
  }
  return st;
}

/* ── 규칙 검사 ───────────────────────────────────── */
const ok = [];
const ck = (name, cond, got) => { assert.ok(cond, name + (got === undefined ? '' : ' ← ' + got)); ok.push(name); };
{
  const st = RUN.newRun(7, cards);
  const o = RUN.offer(st, cards);
  ck('뽑기는 성장형·중간·완성형 하나씩', o.length === 3 && RUN.left(by, o[0]) === 2 && RUN.left(by, o[1]) === 1 && RUN.left(by, o[2]) === 0, o.join('·'));
  ck('전설은 뽑기에 안 나온다', o.every(n => !by[n].rare));
  ck('같은 씨앗은 같은 뽑기', JSON.stringify(RUN.offer(st, cards)) === JSON.stringify(o));
  ck('다른 씨앗은 다른 뽑기', JSON.stringify(RUN.offer(RUN.newRun(8, cards), cards)) !== JSON.stringify(o));
  let s2 = RUN.pick(st, o[0], cards);
  ck('집으면 로스터에 들고 다음 판으로', s2.roster.length === 1 && s2.round === 1 && s2.phase === 'draft');
  ck('없는 이름은 안 집힌다', RUN.pick(st, '없는것', cards) === st);
  const o2 = RUN.offer(s2, cards);
  ck('다음 뽑기는 이미 집은 것을 안 낸다', !o2.includes(o[0]) && JSON.stringify(o2) !== JSON.stringify(o));
  s2 = RUN.pick(s2, o2[1], cards); s2 = RUN.pick(s2, RUN.offer(s2, cards)[2], cards);
  ck('셋을 집으면 1판이 선다', s2.phase === 'fight' && s2.stage === 1 && s2.roster.length === 3);
  /* 상대 */
  const e1 = RUN.encounter(s2, cards);
  ck('1판 상대는 덜 자란 셋, 눌러앉기', e1.names.length === 3 && e1.names.every(n => RUN.left(by, n) >= 1) && e1.policy === 'stay:mobility', JSON.stringify(e1));
  const s7 = Object.assign({}, s2, { stage: 7 });
  const e7 = RUN.encounter(s7, cards);
  ck('마지막 판은 전설 하나 + 완성형 둘, 관리', by[e7.names[0]].rare === 'legendary' && e7.names.slice(1).every(n => RUN.left(by, n) === 0) && e7.policy === 'managed', JSON.stringify(e7));
  /* 체력이 이어진다 */
  const f = RUN.actors(s2, cards, chart);
  ck('셋 대 셋으로 선다', f.a.length === 3 && f.b.length === 3);
  const r = B.battle(f.a, f.b, { seed: f.seed, chart });
  const s3 = RUN.settle(s2, r, f.foes);
  ck('판이 끝나면 체력 비율이 로스터에 남는다 (0~1)', s3.roster.every(x => x.hp >= 0 && x.hp <= 1), JSON.stringify(s3.roster));
  const foeT = RUN.actors(s2, cards, chart).b[0];
  ck('1판 상대는 예산 천장이 낮다', foeT.stats.hp + foeT.stats.atk + foeT.stats.def + foeT.stats.spa + foeT.stats.spd <= RUN.DIFF.foeBudget[0] - B.TUNING.budget.step * RUN.left(by, foeT.name) + 3);
  ck('판 기록이 남는다', s3.log.length === 1 && s3.log[0].stage === 1 && s3.log[0].foes.length === 3);
  if (r.winner === 'a') {
    ck('이기면 보상', s3.phase === 'reward');
    const f2 = RUN.actors(Object.assign({}, s3, { stage: 2, phase: 'fight' }), cards, chart);
    const carried = f2.a.map(a => Math.round(a.hp / a.hpMax * 100));
    ck('다음 판에 그 체력으로 나온다', f2.a.every((a, i) => Math.abs(a.hp / a.hpMax - s3.roster.filter(x => x.hp > 0)[i].hp) < 0.01), carried.join('/'));
    ck('체력 비율이 진짜 먹는다 (다 찬 것보다 적다)', f2.a.some(a => a.hp < a.hpMax) || s3.roster.every(x => x.hp === 1), carried.join('/'));
    const opts = RUN.rewards(s3, cards);
    const canEv = s3.roster.filter(x => (by[x.name].to || []).some(t => by[t])).length;
    ck('보상은 진화(있으면) 아니면 회복, 둘', opts[opts.length - 1].kind === 'heal' && opts.length === (canEv ? 2 : 1) && (!canEv || opts[0].steps.length === canEv), JSON.stringify(opts));
  ck('이기면 서 있는 것은 숨을 돌린다 (+regen, 쓰러진 것은 그대로)', s3.roster.every((x, i) => { const a = r.actors.find(a => a.side === 'a' && a.name === x.name); return a.alive ? Math.abs(x.hp - Math.min(1, a.hp / a.hpMax + RUN.DIFF.regen)) < 1e-9 : x.hp === 0; }));
    const ev = opts.findIndex(o => o.kind === 'evolve');
    if (ev >= 0) {
      const s4 = RUN.choose(s3, ev, cards);
      const st = opts[ev].steps;
      ck('진화하면 진화할 수 있는 전부가 한 단계 오르고 체력이 찬다', st.every(x => s4.roster[x.who].name === x.to && s4.roster[x.who].hp === RUN.DIFF.evolveHeal) && s4.stage === 2 && s4.phase === 'fight');
      ck('진화 못 하는 것은 그대로', s4.roster.every((x, i) => st.some(y => y.who === i) || x.name === s3.roster[i].name));
      /* 예산은 배우를 직접 세워 잰다 (쓰러진 채 진화할 수도 있어 판에 안 설 수 있다) */
      const sum = n => { const a = B.makeActor(by[n], { remaining: RUN.left(by, n) }); return a.stats.hp + a.stats.atk + a.stats.def + a.stats.spa + a.stats.spd; };
      ck('진화하면 예산이 한 단계 오른다 (+60 ±3)', st.every(x => Math.abs(sum(x.to) - sum(x.from) - B.TUNING.budget.step) <= 3), st.map(x => sum(x.from) + '→' + sum(x.to)).join(' '));
    }
    const hurt = JSON.parse(JSON.stringify(s3)); hurt.roster[0].hp = 0; hurt.roster[1].hp = 0.2;
    const s5 = RUN.choose(hurt, RUN.rewards(hurt, cards).length - 1, cards);
    ck('회복은 쓰러진 것을 절반으로 되살리고 나머지는 절반 더', s5.roster[0].hp === 0.5 && Math.abs(s5.roster[1].hp - 0.7) < 1e-9, JSON.stringify(s5.roster));
  } else ck('지면 끝', s3.phase === 'lost');
  /* 쓰러진 것은 안 나온다 */
  const down = JSON.parse(JSON.stringify(s2)); down.roster[0].hp = 0;
  ck('쓰러진 것은 판에 안 선다', RUN.actors(down, cards, chart).a.length === 2);
  /* 끝까지 */
  const end = playRun(3, DRAFT.random, REWARD.smart);
  ck('런은 이기거나 진다', end.phase === 'won' || end.phase === 'lost', end.phase);
  ck('진 런은 그 판에서 멈춘다 · 이긴 런은 일곱 판', end.phase === 'lost' ? end.log.length === end.stage : end.log.length === RUN.LENGTH, end.log.length);
  ck('같은 씨앗·같은 손이면 같은 런', JSON.stringify(playRun(3, DRAFT.random, REWARD.smart)) === JSON.stringify(end));
}
console.log('PASS 런 규칙 ' + ok.length + '가지 — 뽑기·상대·체력 이어짐·보상·끝');
if (quick) process.exit(0);

/* ── 실험 — 얼마나 어렵나 ─────────────────────────── */
const N = 200;
console.log('\n■ 자동(관리)으로 ' + N + '런. 뽑기 × 보상 전략별 완주율과 어디서 지나');
console.log(''.padEnd(18) + '완주   ' + Array.from({ length: RUN.LENGTH }, (_, i) => ('' + (i + 1)).padStart(5)).join('') + '   ← 판별 생존율');
for (const [dn, d] of Object.entries(DRAFT)) for (const [rn, r] of Object.entries(REWARD)) {
  if (dn === 'random' && rn !== 'smart') continue;
  const alive = new Array(RUN.LENGTH).fill(0); let won = 0;
  for (let s = 1; s <= N; s++) { const e = playRun(s, d, r); if (e.phase === 'won') won++; for (let i = 0; i < e.log.length; i++) if (e.log[i].winner === 'a') alive[i]++; }
  console.log((dn + '/' + rn).padEnd(18) + (won / N * 100).toFixed(0).padStart(3) + '%  ' + alive.map(x => (x / N * 100).toFixed(0).padStart(4) + '%').join(''));
}
console.log('\n■ 판별 상대 정책이 값을 하나 — 전부 managed 로 두면');
{
  const alive = new Array(RUN.LENGTH).fill(0); let won = 0;
  const orig = RUN.encounter;
  for (let s = 1; s <= N / 2; s++) {
    let st = RUN.newRun(s, cards); const R = B.rng(s + 77);
    while (st.phase === 'draft') { const o = RUN.offer(st, cards); st = RUN.pick(st, o[DRAFT.random(R)], cards); }
    while (st.phase === 'fight' || st.phase === 'reward') {
      if (st.phase === 'reward') { st = RUN.choose(st, REWARD.smart(RUN.rewards(st, cards), st), cards); continue; }
      const f = RUN.actors(st, cards, chart); for (const b of f.b) b.policy = 'managed';
      st = RUN.settle(st, B.battle(f.a, f.b, { seed: f.seed, chart }), f.foes);
    }
    if (st.phase === 'won') won++; for (let i = 0; i < st.log.length; i++) if (st.log[i].winner === 'a') alive[i]++;
  }
  console.log('  완주 ' + (won / (N / 2) * 100).toFixed(0) + '%  ' + alive.map(x => (x / (N / 2) * 100).toFixed(0).padStart(4) + '%').join(''));
}
