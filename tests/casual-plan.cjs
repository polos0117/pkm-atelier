/* 일상컷 계획기 — lib/casual-plan.js · tools/casual-plan.cjs. node tests/casual-plan.cjs
   - 빈 장부에서 서른 명을 차례로 정해도 매번 tools/casual-ledger.py check 를 통과한다(사람 손 없이)
   - 세 명 배치 · 빈 컷 다시 채우기 · 피할 값(--avoid) · 같은 씨앗 같은 답
   - 생성기 주소(generatorQuery ↔ fromQuery)는 정한 말만 받는다
   - 옷 종류 말과 식이 casual-ledger.py 의 GARMENTS 와 같다
   - 그림 저장소가 옆에 있으면 실제 장부로도 한 번(보고만) */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm'), cp = require('node:child_process');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const P = require('../lib/casual-plan.js');
const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/prompt-spec.js'), 'utf8'), c);
const S = c.window.AtelierSpec;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-plan-'));
const LEDGER = path.join(tmp, 'casual-ledger.json'), PLAN = path.join(tmp, 'plan.json');
const check = (entries, plan) => {
  fs.writeFileSync(LEDGER, JSON.stringify({ entries }));
  fs.writeFileSync(PLAN, JSON.stringify(plan));
  try { cp.execFileSync('python3', ['tools/casual-ledger.py', 'check', PLAN, '--ledger', LEDGER, '--repos', tmp], { cwd: ROOT, stdio: 'pipe' }); return ''; }
  catch (e) { return String(e.stdout); }
};
const at = i => new Date(Date.UTC(2026, 9, 1) + i * 36e5).toISOString();
/* 배치 — 걸리면 씨앗을 바꿔 다시(명령줄과 같은 길) */
function batchPlan(entries, cards, tag, opts = {}) {
  for (let t = 0; t < 40; t++) {
    const batch = [];
    for (const card of cards) {
      const p = P.plan({ S, entries, card, batch, seed: [tag, card, t].join('|'), ...(opts[card] || {}) });
      batch.push({ card, species: card, refill: p.refill, cuts: p.cuts, claims: p.claims });
    }
    const plan = { session: 't', characters: batch };
    const err = check(entries, plan);
    if (!err) return { plan, tries: t };
  }
  throw new Error('40번 안에 못 맞췄다: ' + cards.join());
}
let n = 0;

/* ── 서른 명을 차례로 — 한 명씩 정하고 등록된 것으로 친다 ── */
const entries = [];
let tries = 0;
for (let i = 0; i < 30; i++) {
  const card = 'C' + i, r = batchPlan(entries, [card], 'seq');
  tries += r.tries;
  const ch = r.plan.characters[0];
  assert.equal(ch.cuts.length, 3);
  for (const x of ch.cuts) {
    assert(x.cat && x.ex && x.expr && x.pose && x.orient && x.frame && x.lens, '빈 값 없이: ' + JSON.stringify(x));
    assert.equal(x.axes.overall_intensity, 'strong'); assert.equal(x.axes.skin_exposure, 'bold'); assert.equal(x.aspect, '2:3');
    assert(x.garments.length && x.garments.every(g => P.GARMENTS[g]), '정한 옷 종류: ' + x.garments);
    assert(x.expose.length === 2 && x.expose[0] !== x.expose[1] && x.expose.every(e => P.EXPOSE.includes(e)), '드러내는 방식 둘');
    assert(P.LEAD.includes(x.lead));
  }
  assert.equal(new Set(ch.cuts.map(x => x.lead)).size, 3, '장면 칸 첫머리가 세 장 다르다');
  entries.push({ card, status: 'done', at: at(i), cuts: ch.cuts });
  n++;
}
/* 서른 명 동안 — 같은 예시는 10명 안에 없고, 갈래가 퍼진다 */
const seen = entries.map(e => e.cuts.map(x => x.cat + '/' + x.ex));
for (let i = 0; i < seen.length; i++) for (let j = Math.max(0, i - 10); j < i; j++) assert(!seen[i].some(k => seen[j].includes(k)), '10명 안 같은 예시 ' + i + '·' + j);
const catsUsed = new Set(entries.flatMap(e => e.cuts.map(x => x.cat)));
assert(catsUsed.size >= 12, '갈래가 퍼진다: ' + catsUsed.size);
const req = entries.map(e => e.cuts.filter(x => P.REQUIRED.includes(x.cat)).map(x => x.cut).join());
assert(new Set(req).size >= 4 && req.some(r => r.length > 1), '필수 갈래 자리가 돌고 두 장인 캐릭터가 있다: ' + req.join(' '));
n += 3;

/* ── 같은 씨앗 같은 답, 다른 씨앗이면 다를 수 있다 ── */
const a1 = P.plan({ S, entries, card: 'X', seed: 's' }), a2 = P.plan({ S, entries, card: 'X', seed: 's' });
assert.deepEqual(a1, a2, '같은 입력·씨앗 같은 답'); n++;

/* ── 세 명 배치 — 서로의 예시·짝·새 값을 빼앗지 않는다 ── */
{
  const r = batchPlan(entries, ['B1', 'B2', 'B3'], 'batch');
  const exs = r.plan.characters.flatMap(ch => ch.cuts.map(x => x.cat + '/' + x.ex));
  assert.equal(new Set(exs).size, 9, '배치 안 예시 아홉이 다 다르다');
  const pairs = r.plan.characters.flatMap(ch => ch.cuts.map(x => x.orient + '|' + x.frame));
  assert.equal(new Set(pairs).size, 9, '배치 안 (방향, 프레이밍) 짝이 다 다르다');
  n += 2;
}

/* ── 빈 컷 다시 채우기 — 등록된 두 장은 그대로, 빈 한 장만 ── */
{
  const mine = entries[entries.length - 1], kept = mine.cuts.slice(0, 2);
  const r = batchPlan(entries, [mine.card], 'refill', { [mine.card]: { refill: true, kept } });
  const cuts = r.plan.characters[0].cuts;
  assert(cuts[0].kept && cuts[1].kept && !cuts[2].kept && cuts[2].cut === 3, '빈 3번만 새로');
  assert.deepEqual({ ...cuts[0], kept: undefined }, { ...kept[0], kept: undefined });
  n++;
}

/* ── 피할 값 — 막힌 예시를 다시 고르지 않는다 ── */
{
  const first = P.plan({ S, entries, card: 'Y', seed: 'v' }), x = first.cuts[1];
  const again = P.plan({ S, entries, card: 'Y', seed: 'v', avoid: [{ cut: 2, field: 'ex', value: x.ex }] });
  assert.notEqual(again.cuts[1].ex, x.ex, '막힌 예시는 다시 안 나온다');
  assert.equal(check(entries, { session: 't', characters: [{ card: 'Y', species: 'Y', cuts: again.cuts }] }), '');
  n++;
}

/* ── 만든 컷은 두고 한 컷만 다시(--keep) — 막힌 2번만 바꾸고 1·3번은 그대로, 차례 조건까지 통과 ── */
{
  const first = P.plan({ S, entries, card: 'Z', seed: 'k' }), keep = first.cuts.filter(x => x.cut !== 2).map(x => ({ ...x, kept: true }));
  let ok = null;
  for (let t = 0; t < 40 && !ok; t++) {
    const p = P.plan({ S, entries, card: 'Z', seed: 'k' + t, kept: keep, avoid: [{ cut: 2, field: 'ex', value: first.cuts[1].ex }] });
    if (!check(entries, { session: 't', characters: [{ card: 'Z', species: 'Z', cuts: p.cuts }] })) ok = p;
  }
  assert(ok, '한 컷만 다시 정해도 check 를 통과한다');
  assert.equal(ok.cuts[0].ex, first.cuts[0].ex); assert.equal(ok.cuts[2].ex, first.cuts[2].ex);
  assert(ok.cuts[0].kept && ok.cuts[2].kept && !ok.cuts[1].kept && ok.cuts[1].ex !== first.cuts[1].ex, '1·3번은 그대로, 2번만 새로');
  n++;
}
/* ── 생성기 주소 — 왕복하고, 정한 말이 아니면 버린다 ── */
{
  const cut = entries[0].cuts[0], q = new URLSearchParams(P.generatorQuery('피카츄', cut));
  assert.equal(q.get('mech'), '피카츄');
  const got = P.fromQuery(S, q.get('casual'));
  for (const k of ['cat', 'ex', 'expr', 'pose', 'orient', 'frame', 'lens', 'aspect']) { assert.equal(got.scene[k], cut[k]); assert(got.locks[k], k + ' 잠김'); }
  for (const k of S.LOCAL_AXES) { assert.equal(got.scene.axes[k], cut.axes[k]); assert(got.locks['axes.' + k]); }
  assert.deepEqual(got.bad, []);
  const bad = P.fromQuery(S, JSON.stringify({ ...cut, ex: 'nope', pose: 'flying', axes: { skin_exposure: 'extreme' } }));
  assert(bad.bad.includes('ex') && bad.bad.includes('pose') && !bad.scene.ex && !bad.scene.pose && !bad.scene.axes.skin_exposure, '모르는 값은 버린다');
  assert.equal(P.fromQuery(S, '{not json'), null);
  n += 3;
}

/* ── 옷 종류 말 — casual-ledger.py 와 같은 식 ── */
{
  const py = JSON.parse(cp.execFileSync('python3', ['-c', 'import importlib.util,json;s=importlib.util.spec_from_file_location("l","tools/casual-ledger.py");m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(json.dumps(m.GARMENTS))'], { cwd: ROOT, encoding: 'utf8' }));
  assert.deepEqual(P.GARMENTS, py, '옷 종류 말과 식이 같다');
  assert.deepEqual(P.garmentsOf('A navy high-waisted bikini with a halter top'), ['bikini']);
  n += 2;
}

/* Replanning must exclude both requested cards' previous reservations, as check_plan does. */
{
  const cli = require('../tools/casual-plan.cjs');
  const o = cli.args(['뚜꾸리', '차오꿀', '--session', 'replan-test']);
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/card.json'), 'utf8')).cards.character;
  const first = cli.planBatch(o, S, entries, null, cards, 0);
  const own = first.characters.map(ch => ({ ...ch, status: 'reserved', at: at(1) }));
  const again = cli.planBatch(o, S, entries.concat(own), null, cards, 0);
  assert.deepEqual(again, first, 'previous reservations from this batch must not change its comparisons');
  n++;
}

/* ── 실제 장부(그림 저장소가 옆에 있으면) — 미등록 한 종이 현재 장부에서도 맞춰지는지 ── */
{
  const img2 = path.join(ROOT, '..', 'pkm-atelier-img-2');
  if (fs.existsSync(path.join(img2, 'records'))) {
    const ledger = JSON.parse(cp.execFileSync('python3', ['tools/casual-ledger.py', 'view', '--fresh'], { cwd: ROOT, encoding: 'utf8' }));
    const known = new Set(ledger.entries.map(e => e.card));
    const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/card.json'), 'utf8')).cards.character.filter(c => !known.has(c.name)).slice(0, 1).map(c => c.name);
    const out = cp.execFileSync('node', ['tools/casual-plan.cjs', ...cards, '--no-pull', '--seed', 'test'], { cwd: ROOT, encoding: 'utf8' });
    assert(out.includes('check 통과'), out);
    n++;
  } else console.log('(그림 저장소가 옆에 없어 실제 장부 시험은 건너뜀)');
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log('PASS 일상컷 계획기: ' + n + '가지 · 서른 명 차례로 check 통과(다시 정한 횟수 ' + tries + ') · 10명 안 예시 겹침 없음 · 갈래 ' + catsUsed.size + '개 · 배치 · 다시 채우기 · 피할 값 · 만든 컷 두기 · 생성기 주소 · 옷 종류 말');
