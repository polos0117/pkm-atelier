/* 전투 엔진 실험. 검사이면서 실험실이다.

   앞쪽은 규칙이 코드에 제대로 옮겨졌나 보는 검사다 — 문서가 "된다/안 된다" 로
   못 박은 것들. 하나라도 어긋나면 실패한다.
   뒤쪽은 굴려서 숫자를 보는 실험이다 — 퇴화 전략이 이기나, 중장 과열이 눈덩이가
   되나, 박자 수를 바꾸면 무엇이 흔들리나. 이건 실패가 아니라 보고다.

   Run: node tests/battle-sim.cjs            (실험까지)
        node tests/battle-sim.cjs --quick    (검사만) */
const fs = require('node:fs'), assert = require('node:assert/strict');
const B = require('../lib/battle.js');
const quick = process.argv.includes('--quick');

const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8'));
const chart = JSON.parse(fs.readFileSync('data/chart.json', 'utf8')).chart;
const by = {}; for (const c of card.cards.character) by[c.name] = c;
const left = n => { const c = by[n]; return !c.to ? 0 : 1 + Math.max(...c.to.filter(t => by[t]).map(left)); };

function team(names, side, policy, opt) {
  return names.map((n, i) => B.makeActor(by[n], Object.assign({ side, policy, remaining: left(n) }, opt || {})));
}
function fight(aNames, aPol, bNames, bPol, seed, tuning) {
  return B.battle(team(aNames, 'a', aPol), team(bNames, 'b', bPol), { seed, chart, tuning });
}
/* 같은 스피드면 아군(a)이 먼저 움직인다 — 그래서 앞쪽이 유리하다. 실험은 양쪽을
   바꿔 두 번 돌려 평균한다. 안 그러면 거울 판이 50% 가 안 나온다 */
function winRate(aNames, aPol, bNames, bPol, n, tuning) {
  let a = 0, d = 0, beats = 0, forced = 0, forcedHeavy = 0;
  for (let s = 1; s <= n; s++) {
    const r1 = fight(aNames, aPol, bNames, bPol, s, tuning);
    const r2 = fight(bNames, bPol, aNames, aPol, s, tuning);
    if (r1.winner === 'a') a++; else if (r1.winner === 'draw') d++;
    if (r2.winner === 'b') a++; else if (r2.winner === 'draw') d++;
    beats += r1.beats + r2.beats;
    for (const r of [r1, r2]) for (const e of r.log) if (e.kind === 'forced-open') { forced++; if (e.from === 'heavy') forcedHeavy++; }
  }
  return { a: a / (2 * n), draw: d / (2 * n), beats: beats / (2 * n), forced: forced / (2 * n), forcedHeavy: forcedHeavy / (2 * n) };
}
/* 앞쪽만 도는 원래 꼴 — 선공 이점을 재는 데 쓴다 */
function winRateOneWay(aNames, aPol, bNames, bPol, n, tuning) {
  let a = 0;
  for (let s = 1; s <= n; s++) if (fight(aNames, aPol, bNames, bPol, s, tuning).winner === 'a') a++;
  return a / n;
}

const ROSTER = ['피카츄', '리자몽', '거북왕'];
const OTHER = ['이상해꽃', '뮤', '이브이'];
const ok = [];
const ck = (name, cond, got) => { assert.ok(cond, name + (got === undefined ? '' : ' ← ' + got)); ok.push(name); };

/* ── 규칙이 코드에 옮겨졌나 ─────────────────────── */

/* 예산 = 최종형 − 남은 진화 × 한 단계 (규칙) */
{
  const T = B.TUNING, f = B.budgetStats(by['리자몽'], 0, T), m = B.budgetStats(by['리자드'], 1, T), s = B.budgetStats(by['파이리'], 2, T);
  const sum = o => Object.values(o).reduce((x, y) => x + y, 0);
  ck('예산이 단계로 갈린다 (500 / 440 / 380 ±3)',
    Math.abs(sum(f) - 500) <= 3 && Math.abs(sum(m) - 440) <= 3 && Math.abs(sum(s) - 380) <= 3, [sum(f), sum(m), sum(s)].join('/'));
  const mew = B.budgetStats(by['뮤'], 0, T);
  ck('전설도 최종형이면 같은 예산', Math.abs(sum(mew) - sum(f)) <= 3, sum(mew) + ' vs ' + sum(f));
  ck('분포는 원본 몫을 따른다 (리자몽 특공 > 방어)', f.spa > f.def);
}

/* 상성은 표에서 온다 */
ck('불꽃→풀 2배 · 전기→땅 0', B.typeMul(chart, 'fire', ['grass']) === 2 && B.typeMul(chart, 'electric', ['ground']) === 0);
ck('두 타입은 곱한다 (불꽃→풀·독 = 2×1)', B.typeMul(chart, 'fire', ['grass', 'poison']) === 2);

/* 경장 복귀는 Drive 0 에서도 되고 Heat 도 안 붙는다 (규칙 — 갇히지 않는다) */
{
  const a = team(['거북왕'], 'a', 'stay:light')[0]; a.form = 'heavy'; a.drive = 0; a.heat = 50;
  const foe = team(['뮤'], 'b', 'stay:light')[0];
  const r = B.battle([a], [foe], { seed: 3, chart, maxBeats: 1 });
  const sw = r.log.find(e => e.kind === 'switch' && e.who === '거북왕');
  ck('중장·Drive 0 에서 경장으로 돌아간다', !!sw && sw.to === 'light');
  /* 박자 끝의 Heat 로 보면 안 된다 — 경장이 15 를 식혀서 붙은 12 를 덮는다. 전환 순간의 값을 본다 */
  ck('그 전환에 Heat 가 안 붙는다 (전환 전후 같다)', sw && sw.heat === sw.heatBefore, sw && (sw.heatBefore + '→' + sw.heat));
}

/* 전환 잠금과 전환 Heat (규칙) */
{
  const a = team(['거북왕'], 'a', 'stay:heavy')[0]; a.drive = 0;
  const foe = team(['이브이'], 'b', 'stay:light')[0];
  const r = B.battle([a], [foe], { seed: 5, chart, maxBeats: 1 });
  const sw2 = r.log.find(e => e.kind === 'switch' && e.who === '거북왕');
  ck('경장→중장 전환은 Heat 를 받는다 (딱 switchHeat 만큼)', sw2 && sw2.heat - sw2.heatBefore === B.TUNING.switchHeat, sw2 && (sw2.heatBefore + '→' + sw2.heat));
  ck('전환은 그 박자의 행동을 먹는다 (공격 없음)', !r.log.some(e => e.kind === 'attack' && e.who === '거북왕'));
}

/* 과열 = 강제 개방, 그리고 그 폼이 하던 일을 친다 (규칙) */
function forceAt(form, seed) {
  const a = team(['리자몽'], 'a', 'stay:' + form)[0]; a.form = form; a.heat = 99; a.drive = 80;
  const foe = team(['뮤'], 'b', 'stay:light')[0]; foe.stats.atk = 1; foe.stats.spa = 1;   // 안 아픈 적
  const r = B.battle([a], [foe], { seed, chart, maxBeats: 4 });
  return { a, r };
}
{
  const { a, r } = forceAt('light', 7);
  const fo = r.log.find(e => e.kind === 'forced-open');
  ck('Heat 천장에서 강제로 열린다', !!fo && fo.from === 'light');
  const idx = r.log.indexOf(fo);
  ck('경장 강제 개방은 Drive 를 전부 잃는다', a.count.forced === 1 && r.log.slice(idx).some(e => e.kind === 'vent') && a.drive < 80, a.drive);
  const vent = r.log.find(e => e.kind === 'vent');
  const ventHit = r.log.find(e => e.kind === 'hit' && e.untargeted);
  ck('강제 방출은 대상을 못 고른다', !!vent && !!ventHit);
}
{
  const { a, r } = forceAt('mobility', 8);
  ck('고기동 강제 개방은 다음 행동을 잃는다', r.log.some(e => e.kind === 'skip' && e.who === '리자몽'));
}
{
  /* 중장 개방 중에는 아군을 못 받아낸다 */
  const tank = team(['거북왕'], 'a', 'stay:heavy')[0]; tank.form = 'heavy'; tank.heat = 99;
  const mate = team(['피카츄'], 'a', 'stay:light')[0];
  const foe = team(['뮤'], 'b', 'stay:light')[0];
  const r = B.battle([tank, mate], [foe], { seed: 9, chart, maxBeats: 3 });
  /* 열린 동안만 못 받는다. 개방이 끝나면 다시 받아내는 것이 맞다 — 창을 개방 구간으로 좁힌다 */
  const fo = r.log.findIndex(e => e.kind === 'forced-open' && e.who === '거북왕');
  const fe = r.log.findIndex((e, i) => i > fo && e.kind === 'open-end' && e.who === '거북왕');
  const during = r.log.slice(fo, fe < 0 ? undefined : fe).filter(e => e.kind === 'hit' && e.guard && e.to === '거북왕');
  const hitsMate = r.log.slice(fo, fe < 0 ? undefined : fe).filter(e => e.kind === 'hit' && e.to === '피카츄');
  ck('열린 중장은 보호를 못 한다 (개방 중 받아낸 타격 0, 아군은 맞는다)', fo >= 0 && during.length === 0 && hitsMate.length > 0,
    during.length + ' / ' + hitsMate.length);
}
{
  /* 강제 개방의 냉각이 자발보다 길다 */
  /* stay:* 정책은 열지 않는다 — 여는 것은 managed 다 (검사 쪽 실수였다) */
  const v = team(['리자몽'], 'a', 'managed')[0]; v.drive = 100;
  const foe = team(['뮤'], 'b', 'stay:light')[0]; foe.stats.atk = 1; foe.stats.spa = 1;
  const r = B.battle([v], [foe], { seed: 12, chart, maxBeats: 4, tuning: {} });
  ck('강제 냉각 > 자발 냉각', B.TUNING.forced.coolLock > B.TUNING.open.coolLock);
  ck('자발적 개방은 Drive 를 낸다', r.log.some(e => e.kind === 'open') && v.count.opens === 1);
}
/* 자발적 개방은 냉각 잠금 중에 못 연다 · 개방 중 재발동 없다 */
{
  const v = team(['뮤'], 'a', 'managed')[0]; v.drive = 100;
  const foe = team(['이브이'], 'b', 'stay:light')[0]; foe.stats.atk = 1; foe.stats.spa = 1;
  const r = B.battle([v], [foe], { seed: 13, chart, maxBeats: 6 });
  const opens = r.log.filter(e => e.kind === 'open' || e.kind === 'forced-open').map(e => e.beat);
  const ends = r.log.filter(e => e.kind === 'open-end').map(e => e.beat);
  let okGap = true;
  for (let i = 1; i < opens.length; i++) if (opens[i] - ends[i - 1] < B.TUNING.open.coolLock) okGap = false;
  ck('개방 사이에 냉각 잠금이 있다', okGap, opens.join(',') + ' / ' + ends.join(','));
}
/* 스피드는 순서다 — 같은 박자에 두 번 안 움직인다 (고기동 연속행동 빼고) */
{
  const r = fight(ROSTER, 'stay:light', OTHER, 'stay:light', 21);
  const perBeat = {};
  for (const e of r.log) if (e.kind === 'attack' || e.kind === 'switch' || e.kind === 'skip' || e.kind === 'vent') {
    const k = e.beat + '|' + e.who; perBeat[k] = (perBeat[k] || 0) + 1; }
  ck('한 박자에 한 행동 (경장만 있을 때)', Object.values(perBeat).every(n => n === 1));
  const fast = r.actors.slice().sort((x, y) => y.stats.spe - x.stats.spe)[0];
  const first = r.log.find(e => e.beat === 1 && (e.kind === 'attack' || e.kind === 'switch'));
  ck('가장 빠른 쪽이 먼저 움직인다', first && first.who === fast.name, (first || {}).who + ' vs ' + fast.name);
}
/* 자원이 범위를 안 벗어난다 */
{
  let bad = 0;
  for (let s = 1; s <= 50; s++) {
    const r = fight(ROSTER, 'managed', OTHER, 'managed', s);
    for (const a of r.actors) if (a.heat > B.TUNING.maxHeat || a.heat < 0 || a.drive > B.TUNING.maxDrive || a.drive < 0) bad++;
  }
  ck('Heat·Drive 가 범위 안에 있다 (50판)', bad === 0, bad);
}
/* 같은 씨앗은 같은 판 */
{
  const x = fight(ROSTER, 'managed', OTHER, 'managed', 33), y = fight(ROSTER, 'managed', OTHER, 'managed', 33);
  ck('같은 씨앗이면 같은 결과', x.winner === y.winner && x.beats === y.beats && x.log.length === y.log.length);
}

console.log('PASS 규칙 ' + ok.length + '가지 — 예산·상성·복귀·전환·강제 개방·냉각·차례·범위·재현');
if (quick) process.exit(0);

/* ── 실험 ───────────────────────────────────────── */
const N = 200;
const pct = x => (x * 100).toFixed(0).padStart(3) + '%';
console.log('\n■ 선공 이점 — 같은 스피드면 앞쪽이 먼저 (managed 거울, ' + N + '판, 앞쪽만)');
console.log('  앞쪽 승률 ' + pct(winRateOneWay(ROSTER, 'managed', ROSTER, 'managed', N)) + ' — 50% 에서 먼 만큼이 선공의 값이다. 아래 실험은 양쪽을 바꿔 평균한다');

console.log('\n■ 퇴화 전략 검사 — 거울 판 (' + ROSTER.join('·') + ' 서로), ' + N + '판×2. 승률 (무승부) 박자 · 강제개방/판');
const pols = ['managed', 'stay:light', 'stay:heavy', 'stay:mobility', 'burn'];
console.log('              ' + pols.map(p => p.padStart(22)).join(''));
const table = {};
for (const p of pols) {
  let row = p.padEnd(14);
  for (const q of pols) {
    const w = winRate(ROSTER, p, ROSTER, q, N); table[p + '>' + q] = w;
    row += (pct(w.a) + ' (' + pct(w.draw).trim() + ') ' + w.beats.toFixed(0) + '박 ' + w.forced.toFixed(1)).padStart(22);
  }
  console.log(row);
}
const managedBeatsAll = pols.filter(q => q !== 'managed').every(q => table['managed>' + q].a > 0.5);
console.log(managedBeatsAll ? '  → 운용이 눌러앉기·태우기를 모두 이긴다' : '  → ⚠ 운용이 못 이기는 정책이 있다: '
  + pols.filter(q => q !== 'managed' && table['managed>' + q].a <= 0.5).join(', '));
const burnVsManaged = table['burn>managed'].a;
console.log('  일부러 태우기 vs 운용: ' + pct(burnVsManaged) + (burnVsManaged < 0.5 ? ' — 과열은 공짜 필살기가 아니다' : ' — ⚠ 태우는 쪽이 이긴다'));

console.log('\n■ 다른 로스터 — ' + ROSTER.join('·') + ' vs ' + OTHER.join('·') + ' (managed 끼리)');
{
  const w = winRate(ROSTER, 'managed', OTHER, 'managed', N), v = winRate(OTHER, 'managed', ROSTER, 'managed', N);
  console.log('  앞쪽 승률 ' + pct(w.a) + ' · 자리 바꾸면 ' + pct(v.a) + ' · 평균 ' + w.beats.toFixed(0) + '박자');
}

console.log('\n■ 중장 과열 눈덩이 — 중장이 먼저 강제로 열린 판에서 그 쪽이 이기나');
for (const [label, pa, pb] of [['managed 거울', 'managed', 'managed'], ['stay:heavy 거울', 'stay:heavy', 'stay:heavy'], ['managed vs stay:heavy', 'managed', 'stay:heavy']]) {
  let games = 0, forcedHeavy = 0, wonAfter = 0, forcedAny = 0;
  for (let s = 1; s <= N; s++) for (const r of [fight(ROSTER, pa, ROSTER, pb, s), fight(ROSTER, pb, ROSTER, pa, s)]) {
    games++;
    const fh = r.log.find(e => e.kind === 'forced-open' && e.from === 'heavy');
    if (r.log.some(e => e.kind === 'forced-open')) forcedAny++;
    if (fh) { forcedHeavy++; if (r.winner === fh.side) wonAfter++; }
  }
  console.log('  ' + label.padEnd(22) + ' 강제 개방 난 판 ' + String(forcedAny).padStart(3) + '/' + games + ' · 중장에서 먼저 ' + String(forcedHeavy).padStart(3)
    + ' · 그 뒤 그 쪽 승률 ' + (forcedHeavy ? pct(wonAfter / forcedHeavy) : '  —') + (forcedHeavy && wonAfter / forcedHeavy < 0.3 ? '  ⚠ 눈덩이' : ''));
}

console.log('\n■ 박자 수 흔들기 — managed vs stay:heavy 승률 (' + (N / 2) + '판)');
const sweep = [
  ['switchLock 1', { switchLock: 1 }], ['switchLock 2 (기본)', {}], ['switchLock 3', { switchLock: 3 }],
  ['open.beats 1', { open: { beats: 1 } }], ['open.beats 3', { open: { beats: 3 } }],
  ['coolLock 2/4', { open: { coolLock: 2 }, forced: { coolLock: 4 } }], ['coolLock 5/8', { open: { coolLock: 5 }, forced: { coolLock: 8 } }],
  ['switchHeat 6', { switchHeat: 6 }], ['switchHeat 20', { switchHeat: 20 }],
];
for (const [name, t] of sweep) {
  const w = winRate(ROSTER, 'managed', ROSTER, 'stay:heavy', N / 2, t);
  const b = winRate(ROSTER, 'managed', ROSTER, 'burn', N / 2, t);
  console.log('  ' + name.padEnd(22) + ' vs 중장 ' + pct(w.a) + '   vs 태우기 ' + pct(b.a) + '   ' + w.beats.toFixed(0) + '박자');
}

console.log('\n■ 완성형 vs 성장형 (예산만) — 리자몽·거북왕·이상해꽃 vs 파이리·꼬부기·이상해씨, managed');
{
  const w = winRate(['리자몽', '거북왕', '이상해꽃'], 'managed', ['파이리', '꼬부기', '이상해씨'], 'managed', N);
  console.log('  최종형 승률 ' + pct(w.a) + ' — 두 단계(' + (B.TUNING.budget.step * 2) + ') 차이가 이만큼이다');
}
