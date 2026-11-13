/* 일상컷 계획기 버전2 — lib/casual-plan.js planV2 · tools/casual-plan.cjs --v2(docs/CASUAL_TREE_V2.md 4단계). node tests/casual-plan-v2.cjs
   - 빈 장부에서 열여섯 명을 차례로 버전2 로 정해도 매번 tools/casual-ledger.py check 를 통과하고, 컷마다 버전2 모듈이 고칠 칸이 없다
   - 버전1 컷이 쌓인 장부 위에서도(섞인 장부) — 비교 열쇠는 짓 · 몸+머리(casual-ledger.py with_path 와 같다)
   - 아홉 장(2026-11-09 — 일곱 장은 11-07): 필수 셋 한 장씩 · 상황 노출 한 장 · 다른 묶음 · 프레이밍 · 몸+머리 같은 값 두 장까지 · 같은 짝 없음, 장소/짓은 최근 10명 안에서 안 겹친다
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
/* 코스튬 컷엔 얼굴 클로즈업 안 씀(2026-11-02 사용자 「필수코스튬 컷은 얼굴 클로즈업 장면은 빼도록」) — 표 costume_required.not_frames, 두 모듈 다 */
{
  const CT1 = globalThis.AtelierCasualTree, sc = { treeV: 2, era: 'now', place: 'stage_convention', ofam: 'pokemon_costume' };
  require('node:assert/strict').deepEqual(tree.costume_required.not_frames, ['face_close']);
  require('node:assert/strict').equal((C2.why(t, sc, 'frame', 'face_close', subject) || {}).code, 'costume');
  require('node:assert/strict').equal(C2.why(t, { ...sc, ofam: 'everyday' }, 'frame', 'face_close', subject)?.code === 'costume', false);
  require('node:assert/strict').equal(CT1.frameOk(tree, '', 'face_close', { ofam: 'pokemon_costume' }), false);
  require('node:assert/strict').equal(CT1.why(tree, { ofam: 'pokemon_costume' }, 'frame', 'face_close').code, 'costume');
}
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

/* 1. 섞인 장부 — 버전1 열 명 뒤에 버전2 열여섯 명(2026-11-12 서른 → 열여섯 — 사람마다 python check 를 띄워 1분이 걸렸다) */
const N_V2 = 16;
const entries = [];
for (let i = 0; i < 10; i++) {
  const r = batchPlan(entries, ['A' + i], 'v1', false);
  entries.push({ card: 'A' + i, status: 'done', at: at(entries.length), cuts: r.plan.characters[0].cuts });
}
let tries = 0; const situN = {};
for (let i = 0; i < N_V2; i++) {
  const card = 'B' + i, r = batchPlan(entries, [card], 'seq', true), ch = r.plan.characters[0];
  tries += r.tries;
  assert.equal(ch.cuts.length, 10);
  /* 갈래 · 상황 자유 컷(2026-11-11) — 한 장, 필수 · 코스튬 · 상황 · 옷 자유 · 얼굴 클로즈업이 아닌 컷, 옷 색 없음 */
  { const xf = ch.cuts.filter(x => x.xfree); assert.equal(xf.length, 1, card + ' 갈래 · 상황 자유 한 장'); assert.equal(ch.cuts.filter(x => x.sfree).length, 1, card + ' 장면 자유 한 장'); assert(ch.cuts.filter(x => x.sfree).every(x => x.ofree), card + ' 장면 자유는 옷 자유 가운데'); assert(xf.every(x => !P.isRequired(tree, x) && x.ofam !== 'pokemon_costume' && !x.situ && !x.ofree && x.frame !== 'face_close' && !x.ocolor), card + ' 갈래 · 상황 자유 컷'); }
  /* 옷 자유 컷(2026-11-09) — 두 장, 필수 · 코스튬 · 상황 · 얼굴 클로즈업이 아닌 컷, 옷 색 없음 */
  { const fr = ch.cuts.filter(x => x.ofree); assert.equal(fr.length, 2, card + ' 옷 자유 두 장'); assert(fr.every(x => !P.isRequired(tree, x) && x.ofam !== 'pokemon_costume' && !x.situ && x.frame !== 'face_close' && !x.ocolor), card + ' 옷 자유 컷'); }
  /* 상황 노출(2026-11-09) — 한 장, 필수 · 코스튬 · 얼굴 클로즈업이 아닌 컷, 그 옷에 맞는 것. 지시문에 Situation 줄 */
  { const si = ch.cuts.filter(x => x.situ); assert.equal(si.length, 1, card + ' 상황 한 장');
    assert(!P.isRequired(tree, si[0]) && si[0].ofam !== 'pokemon_costume' && si[0].frame !== 'face_close' && P.situsFor(S, P.outfitText(tree, si[0])).includes(si[0].situ), card + ' 상황 컷: ' + JSON.stringify(si[0])); situN[si[0].situ] = (situN[si[0].situ] || 0) + 1; }
  const cos = ch.cuts.filter(x => x.ofam === 'pokemon_costume');
  assert(cos.length === 1 && ['now', 'fantasy'].includes(cos[0].era) && !C2.awkward(t, cos[0].ofam, cos[0].place).length, card + ' 포켓몬 코스튬 한 장 — 지금 · 무대·환상, 어색하지 않은 곳');
  assert(cos[0].frame && cos[0].frame !== 'face_close', card + ' 코스튬 컷엔 얼굴 클로즈업 안 씀(2026-11-02) — ' + cos[0].frame);
  ch.cuts.forEach(x => validV2(x, card + ' ' + x.cut));
  for (const f of tree.required.outfits) assert.equal(ch.cuts.filter(x => x.ofam === f).length, 1, card + ' 필수 ' + f + ' 한 장');
  const bh = x => x.body + '+' + x.head;
  assert(ch.cuts.every(x => ch.cuts.filter(y => y.frame === x.frame).length <= 2 && ch.cuts.filter(y => bh(y) === bh(x)).length <= 2), card + ' 프레이밍 · 몸+머리 같은 값 두 장까지');
  assert.equal(new Set(ch.cuts.map(x => bh(x) + '|' + x.frame)).size, 10, card + ' 같은 짝 없음');
  assert.equal(new Set(ch.cuts.map(x => x.expose.slice().sort().join('+'))).size, 10, card + ' 드러내기 짝 겹침');
  const freeFams = ch.cuts.filter(x => !P.isRequired(tree, x) && x.ofam !== 'pokemon_costume').map(x => x.ofam);
  assert.equal(new Set(freeFams).size, freeFams.length, card + ' 자유 컷 의상 계열 겹침: ' + freeFams);
  assert.equal(new Set(ch.cuts.map(x => (C2.place(t, x.place) || {}).group)).size, 10, card + ' 다른 묶음');
  const recent = new Set(entries.slice(-10).flatMap(e => e.cuts.map(key)));
  for (const x of ch.cuts) assert(!recent.has(key(x)), card + ' 장소/짓 ' + key(x) + ' 최근 10명');
  entries.push({ card, status: 'done', at: at(entries.length), cuts: ch.cuts });
  n++;
}
/* 상황 넷이 다 돈다 · 새 계열(동탄룩 · 모험가 · 신화 드레이프, 2026-11-09 삼국지에서 옮김)도 나온다 */
assert(Object.keys(situN).length >= 4, '상황 넷 넘게(2026-11-13 상황이 늘었다 — 아홉) ' + JSON.stringify(situN));
{ const fams = new Set(entries.slice(10).flatMap(e => e.cuts.map(x => x.ofam))); assert(['dongtan', 'adventure', 'drape'].every(f => fams.has(f)), '새 계열 — ' + [...fams].join(' · ')); }
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
/* 소품 — 마실 것(잔 · 칵테일 잔 · 물병 · 찻주전자)은 한 캐릭터에 한 장까지, 버전2 사람들에 소품이 고르게(사용자 2026-10-30 「기본 소품이 컵 밖에 없다」) */
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
for (const k of P.V2_FIELDS) if (cut0[k]) { assert.deepEqual(sc[k], cut0[k], '주소 ' + k); if (k !== 'preset') assert(sc.randomLocks[k], '잠금 ' + k); }
/* 버전1 계획기 주소는 버전1 장면 그대로 */
const v1cut = entries[0].cuts[0], s1 = ST.initial(S, CT, P, {}, tree, { name: '피카츄', gen: 1 }, new URLSearchParams(P.generatorQuery('피카츄', v1cut)).get('casual'), { C2, tree2 });
assert(!s1.st.scenes.casual.treeV && s1.st.scenes.casual.act === v1cut.act, '버전1 주소');

/* 3. 피할 값 · 만든 컷 두기 */
/* 전신 프레이밍을 통째로 피하면 남는 프레이밍 다섯 × 두 장 = 열 장이라 빠듯하다 — 씨앗에 따라 「맞는 구도 없음」 으로 던진다(고치기 전 60번 중 12번, 2026-11-13 규칙 뒤 17번). 도구(tools/casual-plan.cjs)처럼 씨앗을 바꿔 다시 */
const av = (() => { for (let i = 0; i < 20; i++) { try { return P.planV2({ S, tree, tree2, subject, entries, card: 'Z', seed: 'z' + (i || ''), avoid: [{ cut: null, field: 'place', value: cut0.place }, { cut: null, field: 'frame', value: 'full_body' }] }); } catch (e) { if (!/^casual-plan/.test(e.message)) throw e; } } throw new Error('피할 값 계획을 스무 번 안에 못 정했다'); })();
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
rp.characters[0].cuts.forEach((x, i) => { assert.equal(saved[i].treeV, 2); for (const k of P.V2_FIELDS) assert.deepEqual(saved[i][k] || '', x[k] || '', '예약 칸 ' + k); });
/* 명령줄처럼 걸리면 씨앗을 바꿔 다시 — 열 장(2026-11-11)부터 한 씨앗만으로는 짝이 비교 대상과 겹칠 수 있다 */
let re3 = null, why3 = '';
for (let i = 0; i < 10 && !re3; i++) {
  const r = P.planV2({ S, tree, tree2, subject, entries, card: 'R', seed: 'r3' + (i || ''), kept: saved.slice(0, 2), avoid: [{ cut: 3, field: 'item', value: saved[2].item }] });
  why3 = check(entries, { session: 't2', characters: [{ card: 'R', species: 'R', cuts: r.cuts, claims: r.claims }] });
  if (!why3) re3 = r;
}
assert(re3 && re3.cuts[0].kept && re3.cuts[1].kept, '두 컷을 두고 다시 정한 계획\n' + why3);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('PASS 계획기 버전2: 버전1 열 명 위에 ' + N_V2 + '명(다시 정한 횟수 ' + tries + ') · 묶음 ' + groups.size + ' · 장소 ' + places.size + ' · 생성기 주소 · 피할 값 · 만든 컷 · 장부 비교 열쇠 · 예약 칸');
