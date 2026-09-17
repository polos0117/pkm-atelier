/* 런을 화면 없이 수백 번 굴린다 — 드래프트·판·보상 규칙이 맞물리는지 보는 검사이고,
   난이도와 성장 보정을 재는 실험이다. Run: node tests/run-sim.cjs [--quick] */
const fs = require('node:fs'), assert = require('node:assert/strict');
const B = require('../lib/battle.js'), RUN = require('../lib/run.js');
const quick = process.argv.includes('--quick');
const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8'));
const chart = JSON.parse(fs.readFileSync('data/chart.json', 'utf8')).chart;
const cards = card.cards.character, by = RUN.index(cards);

/* 내 뽑기 전략: 팩의 안 집힌 카드 가운데 무엇을 집나 */
const DRAFT = {
  final: (open) => open.find(x => RUN.left(by, x.name) === 0) || open[0],
  growth: (open) => open.find(x => RUN.left(by, x.name) === 2) || open[0],
  middle: (open) => open.find(x => RUN.left(by, x.name) === 1) || open[0],
  random: (open, R) => open[Math.floor(R() * open.length)],
};
/* 보상 전략 */
const REWARD = {
  evolve: (opts) => { const i = opts.findIndex(o => o.kind === 'evolve'); return i < 0 ? opts.length - 1 : i; },
  heal: (opts) => opts.length - 1,
  smart: (opts, st) => {
    const hurt = st.roster.some(r => r.hp <= 0) || st.roster.reduce((s, r) => s + r.hp, 0) / st.roster.length < 0.45;
    if (hurt) return opts.length - 1;
    const i = opts.findIndex(o => o.kind === 'evolve'); return i < 0 ? opts.length - 1 : i;
  },
};
/* 성격 전략 */
const NATURE = {
  fit: (st) => st.roster.map(r => RUN.suggest(by, r.name)),
  anti: (st) => st.roster.map(r => { const f = RUN.suggest(by, r.name); return f === 'heavy' ? 'mobility' : f === 'mobility' ? 'light' : 'heavy'; }),
  heavy: (st) => st.roster.map(() => 'heavy'),
};
function playRun(seed, draft, reward, policy, nature) {
  const R = B.rng(seed + 77);
  let st = RUN.newRun(seed, cards);
  while (st.phase === 'draft') st = RUN.pick(st, draft(RUN.open(st), R).name, cards);
  const ns = (nature || NATURE.fit)(st);
  for (let i = 0; i < ns.length; i++) st = RUN.setNature(st, i, ns[i], cards);
  st = RUN.startRun(st);
  while (st.phase === 'fight' || st.phase === 'reward') {
    if (st.phase === 'reward') { st = RUN.choose(st, reward(RUN.rewards(st, cards), st), cards); continue; }
    const f = RUN.actors(st, cards, chart, policy || 'managed');
    const r = B.battle(f.a, f.b, { seed: f.seed, chart });
    st = RUN.settle(st, r, f.foes, f.seat);
  }
  return st;
}

/* ── 규칙 검사 ───────────────────────────────────── */
const ok = [];
const ck = (name, cond, got) => { assert.ok(cond, name + (got === undefined ? '' : ' ← ' + got)); ok.push(name); };
{
  const st = RUN.newRun(7, cards);
  ck('일곱 자리, 세 바퀴 뱀 순서', st.seats.length === 7 && st.order.length === 3 && JSON.stringify(st.order[1]) === JSON.stringify(st.order[0].slice().reverse()));
  ck('팩은 12장, 성장형·중간·완성형이 넷씩, 전설 없음', st.pack.length === 12 && [2, 1, 0].every(l => st.pack.filter(x => RUN.left(by, x.name) === l).length === 4) && st.pack.every(x => !by[x.name].rare));
  ck('내 차례까지 AI 가 먼저 집었다', RUN.isMine(st) && st.pack.filter(x => x.by !== null).length === st.order[0].indexOf(0), st.pack.filter(x => x.by !== null).length + ' vs ' + st.order[0].indexOf(0));
  ck('집힌 카드는 그 자리 로스터에', st.pack.filter(x => x.by !== null).every(x => st.seats[x.by].roster.some(r => r.name === x.name)));
  ck('같은 씨앗은 같은 팩', JSON.stringify(RUN.newRun(7, cards).pack) === JSON.stringify(st.pack));
  ck('다른 씨앗은 다른 팩', JSON.stringify(RUN.newRun(8, cards).pack) !== JSON.stringify(st.pack));
  /* 집기 */
  const open0 = RUN.open(st), takenOne = st.pack.find(x => x.by !== null);
  if (takenOne) ck('남이 집은 카드는 못 집는다', RUN.pick(st, takenOne.name, cards) === st);
  ck('없는 이름은 안 집힌다', RUN.pick(st, '없는것', cards) === st);
  const mine = open0[0].name;
  let s2 = RUN.pick(st, mine, cards);
  ck('집으면 내 로스터에 들고, 원래 단계(origin)를 적는다', s2.seats[0].roster.length === 1 && s2.seats[0].roster[0].name === mine && s2.seats[0].roster[0].origin === RUN.left(by, mine));
  ck('집은 뒤 다시 내 차례 (같은 바퀴거나 다음 바퀴)', RUN.isMine(s2) && (s2.round === 0 ? s2.turn > st.turn : s2.round === 1));
  const aiPicked = s2.seats.slice(1).reduce((n, s) => n + s.roster.length, 0);
  ck('AI 는 뒤에서 제 몫을 집었다', aiPicked >= 6, aiPicked);
  /* 보급 요청 */
  const s2open = RUN.open(s2).map(x => x.name);
  const rr = RUN.reroll(s2, cards);
  ck('보급 요청은 안 집힌 카드만 간다', rr.rerolls === s2.rerolls - 1 && rr.pack.filter(x => x.by !== null).length === s2.pack.filter(x => x.by !== null).length
    && RUN.open(rr).every(x => !s2open.includes(x.name)) && rr.pack.length === s2.pack.length, JSON.stringify(RUN.open(rr).map(x => x.name)));
  ck('집힌 것은 그대로', JSON.stringify(rr.pack.filter(x => x.by !== null)) === JSON.stringify(s2.pack.filter(x => x.by !== null)));
  const rr2 = RUN.reroll(rr, cards), rr3 = RUN.reroll(rr2, cards);
  ck('보급은 두 번까지', rr2.rerolls === 0 && rr3 === rr2);
  /* 세 바퀴 */
  let s3 = s2; while (s3.phase === 'draft') s3 = RUN.pick(s3, RUN.open(s3)[0].name, cards);
  ck('세 바퀴가 끝나면 성격 고르기 — 일곱 자리 모두 셋씩', s3.phase === 'nature' && s3.stage === 1 && s3.seats.every(s => s.roster.length === 3) && s3.roster.length === 3);
  ck('AI 는 능력치에 맞는 성격을 골라 두었다', s3.seats.slice(1).every(s => s.roster.every(r => r.nature === RUN.suggest(by, r.name))));
  ck('성격을 다 고르기 전에는 못 나간다', RUN.startRun(s3) === s3 && !RUN.natureDone(s3));
  ck('없는 성격은 안 붙는다', RUN.setNature(s3, 0, 'xx') === s3);
  s3 = RUN.setNature(s3, 0, 'heavy'); s3 = RUN.setNature(s3, 1, 'light'); s3 = RUN.setNature(s3, 2, RUN.suggest(by, s3.roster[2].name));
  ck('셋에 성격이 붙는다', s3.roster[0].nature === 'heavy' && s3.roster[1].nature === 'light' && RUN.natureDone(s3));
  s3 = RUN.startRun(s3);
  ck('다 고르면 1판', s3.phase === 'fight' && s3.stage === 1);
  ck('마지막 바퀴에는 보급이 없다', !RUN.canReroll(Object.assign({}, s2, { round: 2, turn: s2.order[2].indexOf(0) })));
  ck('스물한 장이 전부 다른 카드', new Set(s3.seats.flatMap(s => s.roster.map(r => r.name))).size === 21);
  ck('AI 여섯이 약한 순서로 늘어선다', s3.foes.length === 6 && s3.foes.every((f, i) => i === 0 || RUN.power(by, s3.seats[f].roster) >= RUN.power(by, s3.seats[s3.foes[i - 1]].roster)));
  /* 상대 */
  const e1 = RUN.encounter(s3, cards), e3 = RUN.encounter(Object.assign({}, s3, { stage: 3 }), cards), e7 = RUN.encounter(Object.assign({}, s3, { stage: 7 }), cards);
  ck('1판 상대는 첫 AI 의 로스터 그대로', e1.seat === s3.foes[0] && JSON.stringify(e1.members.map(m => m.name)) === JSON.stringify(s3.seats[e1.seat].roster.map(r => r.name)) && e1.members.every(m => m.grown === 0));
  const e3seat = s3.seats[s3.foes[2]].roster;
  ck('3판 상대는 두 번 자라 있다 (진화할 수 있었던 만큼)', e3.members.every((m, i) => m.grown === Math.min(2, RUN.left(by, e3seat[i].name)) && RUN.left(by, m.name) === RUN.left(by, e3seat[i].name) - m.grown), JSON.stringify(e3.members));
  ck('일곱째는 보스 — 전설 하나 + 완성형 둘', e7.seat === -1 && by[e7.members[0].name].rare === 'legendary' && e7.members.slice(1).every(m => RUN.left(by, m.name) === 0));
  /* 예산 — 성장 보정 */
  const sum = a => a.stats.hp + a.stats.atk + a.stats.def + a.stats.spa + a.stats.spd;
  const f1 = RUN.actors(s3, cards, chart);
  ck('셋 대 셋으로 선다', f1.a.length === 3 && f1.b.length === 3);
  ck('내 성격이 배우에 실린다 (그 폼으로 선다)', f1.a[0].nature === 'heavy' && f1.a[0].form === 'heavy' && f1.a[1].form === 'light');
  ck('상대도 성격을 달고 선다', f1.b.every(x => x.nature && x.form === x.nature));
  /* 성격이 두 칸을 올리고 두 칸을 내리니 합이 조금 흔들린다 — 성격까지 셈해서 견준다 */
  const expect = x => { const T = B.merge(B.TUNING, { budget: { final: Math.round(B.TUNING.budget.final * RUN.DIFF.foeScale[0]) } }); return sum({ stats: B.applyNature(B.budgetStats(by[x.name], RUN.left(by, x.name), T), x.nature) }); };
  ck('1판 상대 예산은 배율만큼 낮다 (성격 셈 포함)', f1.b.every(x => sum(x) === expect(x) && sum(x) < 0.7 * B.TUNING.budget.final), f1.b.map(x => sum(x) + '/' + expect(x)).join(' '));
  const grownSt = JSON.parse(JSON.stringify(s3)); grownSt.roster[0].grown = 2;
  const g0 = RUN.actors(s3, cards, chart).a[0], g2 = RUN.actors(grownSt, cards, chart).a[0];
  ck('런 안에서 두 번 진화한 것은 예산이 보정 × 2 만큼 더 크다', Math.abs(sum(g2) - sum(g0) - 2 * RUN.DIFF.grow) <= 3, sum(g0) + '→' + sum(g2));
  /* 체력이 이어진다 */
  const r = B.battle(f1.a, f1.b, { seed: f1.seed, chart });
  const s4 = RUN.settle(s3, r, f1.foes, f1.seat);
  ck('판이 끝나면 체력 비율이 로스터에 남는다 (0~1)', s4.roster.every(x => x.hp >= 0 && x.hp <= 1));
  ck('판 기록에 자리와 상대가 남는다', s4.log.length === 1 && s4.log[0].seat === f1.seat && s4.log[0].foes.length === 3);
  if (r.winner === 'a') {
    ck('이기면 보상, 서 있는 것은 숨을 돌린다', s4.phase === 'reward' && s4.roster.every((x, i) => { const a = r.actors.find(a => a.side === 'a' && a.name === x.name); return a.alive ? Math.abs(x.hp - Math.min(1, a.hp / a.hpMax + RUN.DIFF.regen)) < 1e-9 : x.hp === 0; }));
    const opts = RUN.rewards(s4, cards), canEv = s4.roster.filter(x => (by[x.name].to || []).some(t => by[t])).length;
    ck('보상은 진화(있으면) 아니면 회복', opts[opts.length - 1].kind === 'heal' && opts.length === (canEv ? 2 : 1));
    if (canEv) {
      const s5 = RUN.choose(s4, 0, cards);
      ck('진화하면 전부 한 단계, grown 이 하나 늘고 체력이 찬다', opts[0].steps.every(x => s5.roster[x.who].name === x.to && s5.roster[x.who].grown === (s4.roster[x.who].grown || 0) + 1 && s5.roster[x.who].hp === RUN.DIFF.evolveHeal) && s5.stage === 2);
      ck('진화해도 성격은 남는다', opts[0].steps.every(x => s5.roster[x.who].nature === s4.roster[x.who].nature));
    }
    const hurt = JSON.parse(JSON.stringify(s4)); hurt.roster[0].hp = 0; hurt.roster[1].hp = 0.2;
    const s6 = RUN.choose(hurt, RUN.rewards(hurt, cards).length - 1, cards);
    ck('회복은 쓰러진 것을 절반으로 되살리고 나머지는 절반 더', s6.roster[0].hp === 0.5 && Math.abs(s6.roster[1].hp - 0.7) < 1e-9);
  } else ck('지면 끝', s4.phase === 'lost');
  const down = JSON.parse(JSON.stringify(s3)); down.roster[0].hp = 0;
  ck('쓰러진 것은 판에 안 선다', RUN.actors(down, cards, chart).a.length === 2);
  /* 끝까지 */
  const end = playRun(3, DRAFT.random, REWARD.smart);
  ck('런은 이기거나 진다', end.phase === 'won' || end.phase === 'lost', end.phase);
  ck('진 런은 그 판에서 멈춘다 · 이긴 런은 일곱 판', end.phase === 'lost' ? end.log.length === end.stage : end.log.length === RUN.LENGTH);
  ck('같은 씨앗·같은 손이면 같은 런', JSON.stringify(playRun(3, DRAFT.random, REWARD.smart)) === JSON.stringify(end));
}
console.log('PASS 런 규칙 ' + ok.length + '가지 — 공유 팩·뱀 순서·보급·AI 손·자란 상대·성장 보정·체력 이어짐·보상·끝');
if (quick) process.exit(0);

/* ── 실험 — 얼마나 어렵나, 성장이 값을 하나 ─────────── */
const N = +process.env.N || 150;
function table(label, rows) {
  console.log('\n■ ' + label + ' — ' + N + '런, 완주율과 판별 생존율');
  console.log(''.padEnd(18) + '완주   ' + Array.from({ length: RUN.LENGTH }, (_, i) => ('' + (i + 1)).padStart(5)).join(''));
  for (const [name, draft, reward, nature] of rows) {
    const alive = new Array(RUN.LENGTH).fill(0); let won = 0;
    for (let s = 1; s <= N; s++) { const e = playRun(s, draft, reward, null, nature); if (e.phase === 'won') won++; for (let i = 0; i < e.log.length; i++) if (e.log[i].winner === 'a') alive[i]++; }
    console.log(name.padEnd(18) + (won / N * 100).toFixed(0).padStart(3) + '%  ' + alive.map(x => (x / N * 100).toFixed(0).padStart(4) + '%').join(''));
  }
}
table('성격 — 맞게 고른 쪽이 이기나 (무작위 뽑기, 진화 우선)', [
  ['맞는 성격', DRAFT.random, REWARD.smart, NATURE.fit], ['거꾸로 고른 성격', DRAFT.random, REWARD.smart, NATURE.anti], ['전부 중장형', DRAFT.random, REWARD.smart, NATURE.heavy],
]);
table('자동(관리) · 보상은 다치지 않았으면 진화', [
  ['완성형만', DRAFT.final, REWARD.smart], ['성장형만', DRAFT.growth, REWARD.smart], ['중간만', DRAFT.middle, REWARD.smart], ['무작위', DRAFT.random, REWARD.smart],
  ['성장형 · 회복만', DRAFT.growth, REWARD.heal], ['성장형 · 늘 진화', DRAFT.growth, REWARD.evolve],
]);
