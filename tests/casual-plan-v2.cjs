/* 일상컷 계획기 버전2 — lib/casual-plan.js planV2 · tools/casual-plan.cjs --v2(docs/CASUAL_TREE_V2.md 4단계). node tests/casual-plan-v2.cjs
   - 빈 장부에서 서른 명을 차례로 버전2 로 정해도 매번 tools/casual-ledger.py check 를 통과하고, 컷마다 버전2 모듈이 고칠 칸이 없다
   - 버전1 컷이 쌓인 장부 위에서도(섞인 장부) — 비교 열쇠는 짓 · 몸+머리(casual-ledger.py with_path 와 같다)
   - 세 장: 필수 갈래 한 장 이상 · 다른 묶음 · 다른 프레이밍 · 다른 몸+머리, 장소/짓은 최근 10명 안에서 안 겹친다
   - 생성기 주소(generatorQuery) → 생성기 상태(prompt-state planned)가 버전2 칸 그대로 잠근다 · 피할 값 · 만든 컷 두기 */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm'), cp = require('node:child_process');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const P = require('../lib/casual-plan.js');
const C2 = globalThis.AtelierCasualTreeV2 || (require('../lib/casual-tree.js'), require('../lib/casual-tree-v2.js'), globalThis.AtelierCasualTreeV2);
const ST = require('../lib/prompt-state.js');
const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/prompt-spec.js'), 'utf8'), c);
const S = c.window.AtelierSpec, CT = globalThis.AtelierCasualTree;
const tree = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8')), tree2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree-v2.json'), 'utf8'));
const t = C2.make(tree2, tree), subject = { gen: 1 };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-plan-v2-'));
const LEDGER = path.join(tmp, 'casual-ledger.json'), PLAN = path.join(tmp, 'plan.json');
const check = (entries, plan) => {
  fs.writeFileSync(LEDGER, JSON.stringify({ entries }));
  fs.writeFileSync(PLAN, JSON.stringify(plan));
  try { cp.execFileSync('python3', ['tools/casual-ledger.py', 'check', PLAN, '--ledger', LEDGER, '--repos', tmp], { cwd: ROOT, stdio: 'pipe' }); return ''; }
  catch (e) { return String(e.stdout); }
};
const at = i => new Date(Date.UTC(2026, 9, 1) + i * 36e5).toISOString();
function batchPlan(entries, cards, tag, v2, opts = {}) {
  let last = '';
  for (let k = 0; k < 40; k++) {
    const batch = [];
    for (const card of cards) {
      const p = (v2 ? P.planV2 : P.plan)({ S, tree, tree2, subject, entries, card, batch, seed: [tag, card, k].join('|'), ...(opts[card] || {}) });
      batch.push({ card, species: card, refill: p.refill, cuts: p.cuts, claims: p.claims });
    }
    const pl = { session: 't', characters: batch };
    last = check(entries, pl);
    if (!last) return { plan: pl, tries: k };
  }
  throw new Error('40번 안에 못 맞췄다: ' + cards.join() + '\n' + last);
}
const key = x => P.pathKey(P.pathOf(tree, x));
let n = 0;
function validV2(x, where) {
  assert.equal(x.treeV, 2, where);
  for (const k of C2.ORDER) if (x[k]) assert.equal(C2.why(t, x, k, x[k], subject), null, where + ' ' + k + '=' + x[k] + ' ' + JSON.stringify(C2.why(t, x, k, x[k], subject)));
  for (const k of C2.REQUIRED) assert(x[k], where + ' 빈 칸 ' + k);
  const r = C2.repair(t, x, subject);
  for (const k of C2.ORDER) assert.equal(r[k] || '', x[k] || '', where + ' 다시 검사가 고친다 ' + k);
  assert(x.garments.length && x.expose.length === 2 && x.lead && x.axes.source_influence, where + ' 옷 종류 · 드러내기 · 첫머리 · 세 축');
}

/* 1. 섞인 장부 — 버전1 열 명 뒤에 버전2 서른 명 */
const entries = [];
for (let i = 0; i < 10; i++) {
  const r = batchPlan(entries, ['A' + i], 'v1', false);
  entries.push({ card: 'A' + i, status: 'done', at: at(entries.length), cuts: r.plan.characters[0].cuts });
}
let tries = 0;
for (let i = 0; i < 30; i++) {
  const card = 'B' + i, r = batchPlan(entries, [card], 'seq', true), ch = r.plan.characters[0];
  tries += r.tries;
  assert.equal(ch.cuts.length, 3);
  ch.cuts.forEach(x => validV2(x, card + ' ' + x.cut));
  assert(ch.cuts.some(x => P.isRequired(tree, x)), card + ' 필수 갈래');
  for (const f of ['frame']) assert.equal(new Set(ch.cuts.map(x => x[f])).size, 3, card + ' 다른 ' + f);
  assert.equal(new Set(ch.cuts.map(x => x.body + '+' + x.head)).size, 3, card + ' 다른 몸+머리');
  assert.equal(new Set(ch.cuts.map(x => (C2.place(t, x.place) || {}).group)).size, 3, card + ' 다른 묶음');
  const recent = new Set(entries.slice(-10).flatMap(e => e.cuts.map(key)));
  for (const x of ch.cuts) assert(!recent.has(key(x)), card + ' 장소/짓 ' + key(x) + ' 최근 10명');
  entries.push({ card, status: 'done', at: at(entries.length), cuts: ch.cuts });
  n++;
}
/* 버전2 컷이 쌓인 장부 위에서 버전1 계획기도 check 를 통과한다 — 버전2 표의 새 장소도 같은 묶음으로 센다(이상해씨 시범 예약 뒤 버전1 계획기가 덜 쓴 묶음을 장부와 다르게 셌다) */
assert(entries.slice(10).some(e => e.cuts.some(x => !tree.places.some(p => p.key === x.place))), '버전2 새 장소가 장부에 있다');
for (let i = 0; i < 5; i++) batchPlan(entries, ['V' + i], 'after', false, { ['V' + i]: { tree2 } });
/* 버전2 컷이 고르게 퍼진다 — pkm 몫(직업 역할 · 동료 · 포켓몬 세계)도 나온다 */
const v2cuts = entries.slice(10).flatMap(e => e.cuts);
const groups = new Set(v2cuts.map(x => (C2.place(t, x.place) || {}).group)), places = new Set(v2cuts.map(x => x.place));
assert(groups.size >= 12 && places.size >= 50, '묶음 ' + groups.size + ' · 장소 ' + places.size);
assert(v2cuts.some(x => (C2.use(t, x.use) || {}).role), '역할 동작');
assert(v2cuts.some(x => x.era === 'in_pokemon'), '포켓몬 세계');
assert(new Set(v2cuts.map(x => x.frame)).size >= 6 && new Set(v2cuts.map(x => x.body)).size >= 4, '구도가 퍼진다');
assert(!v2cuts.some(x => x.body === 'back' || x.frame === 'detail'), '안 쓰는 값');
/* 소품 — 마실 것(잔 · 칵테일 잔 · 물병 · 찻주전자)은 한 캐릭터에 한 장까지, 서른 명에 소품이 고르게(사용자 2026-10-30 「기본 소품이 컵 밖에 없다」) */
const DR = ['cup', 'drink_glass', 'water_bottle', 'teapot'], propOf = x => (C2.use(t, x.use) || {}).prop;
for (const e of entries.slice(10)) assert(e.cuts.filter(x => DR.includes(propOf(x))).length <= 1, e.card + ' 마실 것 두 장');
const pc = {}; v2cuts.forEach(x => { const p = propOf(x); if (p) pc[p] = (pc[p] || 0) + 1; });
const most = Math.max(...Object.values(pc)), withProp = Object.values(pc).reduce((a, b) => a + b, 0);
assert(Object.keys(pc).length >= 10 && most <= Math.max(4, withProp / 4), '소품이 한쪽으로 몰린다: ' + JSON.stringify(pc));

/* 2. 생성기 주소 → 생성기 상태 — 버전2 칸 그대로 잠근다 */
const cut0 = entries[entries.length - 1].cuts[0], q = new URLSearchParams(P.generatorQuery('피카츄', cut0)).get('casual');
const st = ST.initial(S, CT, P, {}, tree, { name: '피카츄', gen: 1 }, q, { C2, tree2 });
assert(st.plan && !st.plan.bad.length, '주소 값이 트리에 맞는다 ' + JSON.stringify(st.plan));
const sc = st.st.scenes.casual;
assert.equal(sc.treeV, 2); assert.equal(st.st.mode, 'casual');
for (const k of P.V2_FIELDS) if (cut0[k]) { assert.equal(sc[k], cut0[k], '주소 ' + k); if (k !== 'preset') assert(sc.randomLocks[k], '잠금 ' + k); }
/* 버전1 계획기 주소는 버전1 장면 그대로 */
const v1cut = entries[0].cuts[0], s1 = ST.initial(S, CT, P, {}, tree, { name: '피카츄', gen: 1 }, new URLSearchParams(P.generatorQuery('피카츄', v1cut)).get('casual'), { C2, tree2 });
assert(!s1.st.scenes.casual.treeV && s1.st.scenes.casual.act === v1cut.act, '버전1 주소');

/* 3. 피할 값 · 만든 컷 두기 */
const av = P.planV2({ S, tree, tree2, subject, entries, card: 'Z', seed: 'z', avoid: [{ cut: null, field: 'place', value: cut0.place }, { cut: null, field: 'frame', value: 'full_body' }] });
assert(!av.cuts.some(x => x.place === cut0.place || x.frame === 'full_body'), '피할 값');
const keep = P.planV2({ S, tree, tree2, subject, entries, card: 'Z', seed: 'z2', kept: [Object.assign({}, av.cuts[0], { kept: true })] });
assert.deepEqual(keep.cuts[0].place, av.cuts[0].place); assert(keep.cuts[0].kept, '만든 컷은 그대로');
assert.deepEqual(P.planV2({ S, tree, tree2, subject, entries, card: 'Z', seed: 'same' }), P.planV2({ S, tree, tree2, subject, entries, card: 'Z', seed: 'same' }), '같은 씨앗 같은 답');

/* 4. 장부의 비교 열쇠 — 버전2 컷의 짓 · 몸+머리 가 같으면 check 가 건다 */
const dup = JSON.parse(JSON.stringify(entries[entries.length - 1].cuts));
const bad = check(entries, { session: 't', characters: [{ card: 'D', species: 'D', cuts: dup }] });
assert(/장소·하는 일 .* 이미 썼다/.test(bad) && /짝 .* 겹친다/.test(bad), '같은 장소/짓 · 같은 짝을 건다:\n' + bad);

/* 5. 예약 파일이 버전2 칸을 다 담는다 — 그 예약에서 두 컷을 두고(--keep) 한 컷만 다시 정해도 check 를 통과한다(이상해씨 시범에서 예약이 버전1 칸만 적어 걸렸다) */
const rp = batchPlan(entries, ['R'], 'res', true).plan;
fs.writeFileSync(PLAN, JSON.stringify(rp));
cp.execFileSync('python3', ['tools/casual-ledger.py', 'reserve', PLAN, '--ledger', LEDGER, '--repos', tmp], { cwd: ROOT, stdio: 'pipe' });
const saved = JSON.parse(fs.readFileSync(path.join(tmp, 'casual-reservations', 't.json'), 'utf8')).characters[0].cuts;
rp.characters[0].cuts.forEach((x, i) => { assert.equal(saved[i].treeV, 2); for (const k of P.V2_FIELDS) assert.equal(saved[i][k] || '', x[k] || '', '예약 칸 ' + k); });
const re3 = P.planV2({ S, tree, tree2, subject, entries, card: 'R', seed: 'r3', kept: saved.slice(0, 2), avoid: [{ cut: 3, field: 'item', value: saved[2].item }] });
assert.equal(check(entries, { session: 't2', characters: [{ card: 'R', species: 'R', cuts: re3.cuts, claims: re3.claims }] }), '', '두 컷을 두고 다시 정한 계획');
fs.rmSync(tmp, { recursive: true, force: true });
console.log('PASS 계획기 버전2: 버전1 열 명 위에 서른 명(다시 정한 횟수 ' + tries + ') · 묶음 ' + groups.size + ' · 장소 ' + places.size + ' · 생성기 주소 · 피할 값 · 만든 컷 · 장부 비교 열쇠 · 예약 칸');
