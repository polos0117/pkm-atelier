/* 일상컷 계획기 버전2 — lib/casual-plan.js planV2 · tools/casual-plan.cjs --v2(docs/CASUAL_TREE_V2.md 4단계). node tests/casual-plan-v2.cjs
   - 빈 장부에서 열여섯 명을 차례로 버전2 로 정해도 매번 tools/casual-ledger.py check 를 통과하고, 컷마다 버전2 모듈이 고칠 칸이 없다
   - 버전1 컷이 쌓인 장부 위에서도(섞인 장부) — 비교 열쇠는 짓 · 몸+머리(casual-ledger.py with_path 와 같다)
   - 아홉 장(2026-11-09 — 일곱 장은 11-07): 필수 셋 한 장씩 · 상황 노출 한 장 · 다른 묶음 · 프레이밍 · 몸+머리 같은 값 두 장까지 · 같은 짝 없음, 장소/짓은 최근 10명 안에서 안 겹친다
   - 생성기 주소(generatorQuery) → 생성기 상태(prompt-state planned)가 버전2 칸 그대로 잠근다 · 피할 값 · 만든 컷 두기
   - 게임 코스프레(2026-11-15 — 필수에서 상황 노출 대신, 6절): 열 장에 한 장 · 상황 노출 없음 · 코스튬 둘 · 장소 · 얼굴 클로즈업 없음 · 장부 check,
     고르기(덜 쓴 게임 · 주인공 하나 재단 겹침 없음 · 1회차 pick · 2회차 again · 다 찬 게임 빠짐 · 그리는 쪽이 없다고 한 게임), 세 공방 기록 읽기, 장부가 거는 것,
     옛 구성(목록 없이 짠 묶음 — 상황 노출 한 장)은 그대로 통과(1절의 열여섯 명), 생성기 주소 */
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
    let skip = false;
    for (const card of cards) {
      let p; try { p = (v2 ? P.planV2 : P.plan)({ S, tree, tree2, subject, entries, card, batch, seed: [tag, card, k].join('|'), ...(opts[card] || {}) }); }
      catch (e) { if (!/^casual-plan/.test(e.message)) throw e; last = e.message; skip = true; break; }   /* 명령줄(tools/casual-plan.cjs)처럼 다른 씨앗으로 다시 */
      batch.push({ card, species: card, refill: p.refill, cuts: p.cuts, claims: p.claims });
    }
    if (skip) continue;
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
/* 씨앗에 따라 「맞는 구도 없음」 으로 던질 수 있다 — 도구(tools/casual-plan.cjs)처럼 씨앗을 바꿔 다시 */
const av = (() => { for (let i = 0; i < 20; i++) { try { return P.planV2({ S, tree, tree2, subject, entries, card: 'Z', seed: 'z' + (i || ''), avoid: [{ cut: null, field: 'place', value: cut0.place }, { cut: 1, field: 'frame', value: 'full_body' }] }); } catch (e) { if (!/^casual-plan/.test(e.message)) throw e; } } throw new Error('피할 값 계획을 스무 번 안에 못 정했다'); })();
assert(!av.cuts.some(x => x.place === cut0.place || (x.cut === 1 && x.frame === 'full_body')), '피할 값(장소는 모든 컷, 프레이밍은 한 컷 — 프레이밍 하나를 열 장에서 통째로 피하면 남는 다섯 × 두 장이 딱 열 장이라, 2026-11-13 조건이 늘어난 뒤로는 거의 못 맞춘다. 도구에서도 프레이밍은 컷마다 피한다)');
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

/* 6. 게임 코스프레(2026-11-15) */
const G = require('../lib/game-cosplay.js'), LIST = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/game-cosplay.json'), 'utf8'));
const GCR = tree.cosplay_required, CUT_KEYS = LIST.cuts.map(x => x.key);
let gcn = 0;
{
  /* 6a. 고르기 — 목록 · 쓴 기록만으로(계획기 없이) */
  const seq = (list, used, k, opts) => { const out = []; let r = 0.37; const rnd = () => (r = (r * 9301 + 49297) % 233280 / 233280); for (let i = 0; i < k; i++) { const x = G.pickCosplay(list, used.concat(out), rnd, opts); if (!x) break; out.push(x); } return out; };
  /* 무게 고르기(2026-11-15 「케릭터 수 많은 게임일수록 더 많이」 → B) — 남은 인원의 제곱근. 빈 기록에서 LoL 이 주인공 하나 게임보다 훨씬 자주, 주인공 하나 게임도 나온다 */
  { let x = 123; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280, cnt = {}; for (let i = 0; i < 4000; i++) { const k = G.pickCosplay(LIST, [], rnd).game; cnt[k] = (cnt[k] || 0) + 1; }
    assert((cnt.league_of_legends || 0) > 5 * (cnt.super_mario_bros || 0) && (cnt.super_mario_bros || 0) > 0 && (cnt.league_of_legends || 0) > (cnt.street_fighter_2 || 0), '무게 고르기 ' + JSON.stringify(cnt)); }
  /* 주인공 하나 게임 — 재단 겹침 없이 열하나, 다 입으면 그 게임은 빠진다 */
  const mario = Object.assign({}, LIST, { games: LIST.games.filter(g => g.key === 'super_mario_bros') });
  const m = seq(mario, [], 20);
  assert.equal(m.length, 11, '마리오 열한 재단 뒤 끝'); assert.equal(new Set(m.map(x => x.cut)).size, 11, '재단 겹침 없음');
  assert(m.every(x => x.character === 'Mario' && x.round === 1) && /^a daring adult cosplay of Mario from Super Mario Bros\. — /.test(G.cosplayText(LIST, m[0])), '주인공 하나 — fixed 글');
  assert.equal(G.pickCosplay(LIST, m.map(x => ({ game: x.game, character: '', cut: x.cut })).concat(LIST.games.filter(g => g.key !== 'super_mario_bros').map(g => ({ game: g.key, character: g.many ? '' : g.character, cut: 'knit' }))), Math.random).game === 'super_mario_bros', false, '다 찬 주인공 게임은 빠진다(쓴 수가 가장 적어도)');
  /* 등장인물 많음(2026-11-16 「오버워치 메르시가 4케릭터안에서 2번이나」 → 「응 그래」) — 1회차도 계획기가 캐릭터를 정한다(assigned): 목록 안 · 쓴/예약 캐릭터 아님,
     여자 무게 2 · 남자 1. 목록을 다 쓰면 2회차 again(쓴 캐릭터 · 안 입은 재단), 다 차면 빠진다 */
  const OW = LIST.games.find(g => g.key === 'overwatch'), owNames = OW.characters.map(c => c.name);
  const ow = Object.assign({}, LIST, { games: [OW] });
  const p1 = G.pickCosplay(ow, [{ game: 'overwatch', character: 'tracer', cut: 'bikini' }], Math.random);
  assert(p1.round === 1 && owNames.includes(p1.character) && p1.character !== 'Tracer' && !p1.used && !p1.again, '1회차 assigned — 목록 안 · 쓴 캐릭터 아님 ' + JSON.stringify(p1));
  assert.equal(G.cosplayText(ow, p1), 'a daring adult cosplay of ' + p1.character + ' from Overwatch — the costume\'s recognisable colours and parts, ' + G.cut(LIST, p1.cut).en, '1회차 assigned 글');
  { const twenty = seq(ow, [], 20); assert(twenty.length === 20 && new Set(twenty.map(x => G.nameKey(x.character))).size === 20 && twenty.every(x => owNames.includes(x.character) && x.round === 1), '빈 기록에서 오버워치 스무 번 — 캐릭터 안 겹침 ' + twenty.map(x => x.character)); }
  { let x = 99, f = 0; const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280, fem = new Set(OW.characters.filter(c => c.female).map(c => c.name));
    for (let i = 0; i < 4000; i++) if (fem.has(G.pickCosplay(ow, [], rnd).character)) f++;
    assert(f / 4000 > fem.size / owNames.length + 0.08, '여자 무게 2 — 4000번에 여자 ' + (f / 40).toFixed(1) + '% · 목록 ' + (100 * fem.size / owNames.length).toFixed(1) + '%'); }
  /* 목록을 다 쓰면 2회차 — 쓴 캐릭터 가운데 덜 입은 하나 · 안 입은 재단 */
  const ow2 = Object.assign({}, LIST, { games: [Object.assign({}, OW, { characters: OW.characters.filter(c => c.name === 'Tracer' || c.name === 'Mercy'), roster: 2 })] });
  const u2 = [{ game: 'overwatch', character: 'Tracer', cut: 'bikini' }, { game: 'overwatch', character: 'mercy', cut: 'knit' }, { game: 'overwatch', character: 'Mercy', cut: 'idol' }];
  assert.equal(G.pickCosplay(ow2, u2.slice(0, 1), () => 0).character, 'Mercy', '남은 캐릭터가 하나면 그 캐릭터');
  const p2 = G.pickCosplay(ow2, u2, () => 0);
  assert(p2.round === 2 && p2.character === 'Tracer' && p2.cut !== 'bikini', '2회차 — 덜 쓴 캐릭터 · 안 입은 재단 ' + JSON.stringify(p2));
  assert(G.cosplayText(ow2, p2).startsWith('a daring adult cosplay of Tracer from Overwatch — the costume'), '2회차 again 글');
  const fullOw = CUT_KEYS.flatMap(c => [{ game: 'overwatch', character: 'Tracer', cut: c }, { game: 'overwatch', character: 'Mercy', cut: c }]);
  assert.equal(G.pickCosplay(ow2, fullOw, Math.random), null, '캐릭터 × 재단이 다 차면 빠진다');
  assert.equal(G.pickCosplay(ow, u2, Math.random).round, 1, '목록에 남은 캐릭터가 있으면 1회차');
  assert.equal(G.pickCosplay(ow, u2, Math.random, { full: ['overwatch'] }).round, 2, '--cosplay-full 이면 2회차');
  assert.equal(G.pickCosplay(ow, [], Math.random, { full: ['overwatch'] }), null, '쓴 캐릭터가 없으면 2회차도 없다');
  assert.deepEqual(G.cosplayAgain(ow, [{ game: 'overwatch', character: 'Tracer', cut: 'bikini' }], 'overwatch', () => 0, k => k === 'bikini' || k === 'one_piece', 'knit'), { character: 'Tracer', cut: 'one_piece' }, 'cosplayAgain — 장소가 받는 재단만');
  /* 옛 사본(characters 없음)만 예전 pick — 옛 계획의 pick 칸 글 · 2회차 몫은 그대로 */
  const owOld = Object.assign({}, LIST, { games: [Object.assign({}, OW, { characters: undefined, roster: 2 })] });
  const q1 = G.pickCosplay(owOld, [{ game: 'overwatch', character: 'Tracer', cut: 'bikini' }], Math.random);
  assert(q1.character === '' && q1.round === 1 && q1.used.join() === 'Tracer' && q1.again && q1.again.character === 'Tracer' && q1.again.cut !== 'bikini', '옛 사본 pick ' + JSON.stringify(q1));
  const as = G.againScene({ item: 'gc_' + q1.cut, cosplay: q1 });
  assert(as.item === 'gc_' + q1.again.cut && as.cosplay.round === 2 && G.cosplayText(ow, as.cosplay, q1.again.cut).startsWith('a daring adult cosplay of Tracer from Overwatch'), '옛 pick 칸의 2회차 몫 장면');
  assert(G.cosplayText(LIST, q1).startsWith('… (a daring adult cosplay of one character of your choice from Overwatch — not any of these already used: Tracer;'), '옛 pick 칸 지시문 그대로 ' + G.cosplayText(LIST, q1));
  /* 주인공 하나 게임은 기록의 이름이 달라도 그 주인공(Geralt · Geralt of Rivia) */
  { const w3 = LIST.games.find(g => g.key === 'witcher_3'), wl = Object.assign({}, LIST, { games: [w3] });
    const left = G.pickCosplay(wl, CUT_KEYS.slice(1).map(c => ({ game: 'witcher_3', character: c === 'knit' ? 'Geralt' : w3.character, cut: c })), Math.random);
    assert(left && left.cut === CUT_KEYS[0], '주인공 하나 — 다른 표기도 그 주인공의 재단 ' + JSON.stringify(left)); }
  gcn += 16;
}
{
  /* 6b. 쓴 것 = 그린 기록(generation.cosplay, 없으면 장면 cosplay 의 character 가 찬 것) + 아직 안 그린 계획의 예약(2026-11-16 — 계획 파일 · 다시 짠 replan · 세션 예약 · 장부 reserved 칸,
     character 가 찬 것). 같은 컷(공방 · 카드 · 세계 · 번호)은 한 번 — 그린 기록이 있으면 기록, replan 이 원래 계획을 이긴다. 1회차 pick(character 빈 칸)은 안 센다 — 그린 기록이 없으면 다시 짜기 대상 */
  const base2 = fs.mkdtempSync(path.join(os.tmpdir(), 'cosplay-used-'));
  const put = (repo, rel, obj) => { const f = path.join(base2, repo, 'records', rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(obj)); };
  put('pkm-atelier-img-5', 'pikachu-20261115/casual4-ui.json', { generation: { cosplay: { game: 'overwatch', character: 'D.Va', cut: 'bodysuit' } }, storage: { last: '피카츄', cards: { 피카츄: { scenes: { casual: { cosplay: { game: 'overwatch', character: '', cut: 'bodysuit', round: 1 } } } } } } });
  put('pkm-atelier-img-5', 'pikachu-20261115/casual5-ui.json', { storage: { last: '피카츄', cards: { 피카츄: { scenes: { casual: { cosplay: { game: 'overwatch', character: '', cut: 'knit', round: 1 } } } } } } });
  put('sam-atelier-img-2', '조조/samguk-casual3.kr_drawn_rim_dewy-ui.json', { card: '조조', world: 'samguk', storage: { scene: { cosplay: { game: 'tomb_raider', character: 'Lara Croft', cut: 'bikini', round: 1 } } } });
  put('sam-atelier-img-2', '조조/samguk-casual-plan.json', { card: '조조', world: 'samguk', cuts: [{ n: 3, cosplay: { game: 'tomb_raider', character: 'Lara Croft', cut: 'bikini', round: 1 } }] });
  put('sam-atelier-img-2', '조조/fantasy-casual-plan.json', { card: '조조', world: 'fantasy', cuts: [{ n: 3, cosplay: { game: 'overwatch', character: 'Mercy', cut: 'idol', round: 1 } }] });
  put('sam-atelier-img-2', '조조/fantasy-casual3-replan.json', { card: '조조', world: 'fantasy', cuts: [{ n: 3, cosplay: { game: 'overwatch', character: 'Kiriko', cut: 'leotard', round: 1 } }] });
  put('element-atelier-img', 'fe/mecha-casual-plan.json', { card: 'fe', world: 'mecha', cuts: [{ n: 3, cosplay: { game: 'dark_souls', character: 'x', cut: 'knit' } }, { n: 4, cosplay: { game: 'overwatch', character: '', cut: 'corset', round: 1, used: [] } }] });
  put('pkm-atelier-img-2', 'casual-reservations/s.json', { session: 's', at: '2026-11-16T00:00:00+09:00', characters: [{ card: '피카츄', at: '2026-11-16T00:00:00+09:00', cuts: [{ cut: 4, cosplay: { game: 'overwatch', character: '', cut: 'bodysuit', round: 1, used: [] } }, { cut: 6, cosplay: { game: 'league_of_legends', character: 'Ahri', cut: 'idol', round: 1 } }] }] });
  put('pkm-atelier-img-2', 'casual-ledger.json', { entries: [{ card: '라이츄', status: 'reserved', at: '2026-11-16T01:00:00+09:00', cuts: [{ cut: 2, cosplay: { game: 'overwatch', character: 'Ana', cut: 'corset', round: 1 } }] }, { card: '꼬부기', status: 'done', cuts: [{ cut: 1, cosplay: { game: 'overwatch', character: 'Sombra', cut: 'knit' } }] }] });
  const key = x => x.game + '/' + x.character + '/' + x.cut;
  /* 읽는 법(꼴)은 세 공방 기록 모두로 본다 — 계획기 기본은 이 공방 저장소만(2026-11-16 「공방별로 따로」, 아래 COSPLAY_REPOS 단언) */
  const ALL = ['sam-atelier-img', 'sam-atelier-img-2', 'element-atelier-img'].concat(G.COSPLAY_REPOS);
  assert.deepEqual(G.cosplayUsage(base2).map(key).sort(), ['overwatch/D.Va/bodysuit'], '기본은 이 공방 기록만');
  const used = G.cosplayUsage(base2, ALL).map(key).sort();
  assert.deepEqual(used, ['overwatch/D.Va/bodysuit', 'tomb_raider/Lara Croft/bikini'], '그린 기록만 ' + used);
  const all = G.cosplayUsed(base2, ALL), allKeys = all.used.map(key).sort();
  assert.deepEqual(allKeys, ['dark_souls/x/knit', 'league_of_legends/Ahri/idol', 'overwatch/Ana/corset', 'overwatch/D.Va/bodysuit', 'overwatch/Kiriko/leotard', 'tomb_raider/Lara Croft/bikini'], '그린 기록 + 예약(같은 컷 한 번 · replan · 장부 reserved) ' + allKeys);
  assert.deepEqual(all.pending.map(p => [p.family, p.card, p.world, p.no, p.game].join('|')), ['element-atelier|fe|mecha|4|overwatch'], '다시 짜기 대상 — 안 그린 pick 칸 ' + JSON.stringify(all.pending));
  assert.deepEqual(G.cosplayUsed(base2, ALL, { skip: p => p.card === '피카츄' }).planned.map(key).sort(), ['dark_souls/x/knit', 'overwatch/Ana/corset', 'overwatch/Kiriko/leotard'], 'skip — 다시 짜는 카드의 예약은 안 센다');
  /* 계획 파일에만 있는 캐릭터(Ana · Kiriko)는 1회차에서 빠진다 */
  { const ow3 = Object.assign({}, LIST, { games: [Object.assign({}, LIST.games.find(g => g.key === 'overwatch'), { characters: ['Ana', 'Kiriko', 'Tracer'].map(n => ({ name: n, female: true })) })] });
    const got = new Set(); for (let i = 0; i < 200; i++) got.add(G.pickCosplay(ow3, all.used, Math.random).character);
    assert.deepEqual([...got], ['Tracer'], '예약한 캐릭터는 빠진다 ' + [...got]); }
  assert.deepEqual(G.COSPLAY_REPOS, ['pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3', 'pkm-atelier-img-4', 'pkm-atelier-img-5'], '이 공방 그림 저장소만(2026-11-16 「공방별로 따로」)');
  fs.rmSync(base2, { recursive: true, force: true });
  gcn += 6;
}
/* 6c. 계획 — 열 장에 게임 코스프레 한 장(상황 노출 자리) · 포켓몬 코스튬 한 장 · 상황 노출 없음 · 표의 장소 · 얼굴 클로즈업 없음 · 옷 = 재단 · 장부 check.
   쓴 기록은 차례로 쌓는다 — 덜 쓴 게임부터 돌고, 주인공 하나 게임의 재단은 안 겹친다 */
fs.rmSync(path.join(tmp, 'casual-reservations'), { recursive: true, force: true });   /* 5절의 예약(R)은 check 만 보고 계획기는 모른다 — 지운다 */
const gcUsed = [], gcEntries = entries.slice();
for (let i = 0; i < 8; i++) {
  const card = 'G' + i, r = batchPlan(gcEntries, [card], 'gc', true, { [card]: { cosplay: { list: LIST, used: gcUsed.slice() } } }), ch = r.plan.characters[0];
  const gcs = ch.cuts.filter(x => x.ofam === GCR.outfit), cos = ch.cuts.filter(x => x.ofam === 'pokemon_costume');
  assert.equal(gcs.length, 1, card + ' 게임 코스프레 한 장'); assert.equal(cos.length, 1, card + ' 포켓몬 코스튬 그대로 한 장');
  { const st = ch.cuts.filter(x => x.situ);   /* 상황 노출은 필수에서 내려왔지만 일반 컷 하나에 늘 한 장(2026-11-16 「늘 1장은 나오게」) — 필수 · 코스튬 · 자유 설계 칸이 아니다 */
    assert(st.length === 1 && st[0].ofam !== GCR.outfit && st[0].ofam !== 'pokemon_costume' && !st[0].ofree && !st[0].xfree && !st[0].sfree, card + ' 일반 컷 하나에 상황 ' + JSON.stringify(st.map(x => [x.cut, x.ofam, x.situ]))); }
  const g = gcs[0], x = g.cosplay;
  assert(x && LIST.games.some(gg => gg.key === x.game) && CUT_KEYS.includes(x.cut) && g.item === 'gc_' + x.cut, card + ' 게임 · 재단 · 옷 ' + JSON.stringify(g));
  assert(x.character && !x.used && !x.again && !gcUsed.some(u => u.game === x.game && G.nameKey(u.character) === G.nameKey(x.character) && x.round === 1), card + ' 새 계획엔 pick 칸이 없다 — 캐릭터가 찬다 ' + JSON.stringify(x));
  assert(GCR.places.includes(g.place) || (GCR.water_cuts.includes(x.cut) && GCR.water_places.includes(g.place)), card + ' 장소 ' + g.place + ' ' + x.cut);
  assert(!GCR.not_frames.includes(g.frame) && !g.ocolor && !g.ofree && !g.xfree, card + ' 얼굴 클로즈업 · 옷 색 · 자유 칸 없음 ' + g.frame);
  assert.equal(ch.cuts.filter(y => y.ofree).length, 2, card + ' 옷 자유 둘'); assert.equal(ch.cuts.filter(y => y.xfree).length, 1, card + ' 갈래 · 상황 자유 하나');
  for (const f of tree.required.outfits) assert.equal(ch.cuts.filter(y => y.ofam === f).length, 1, card + ' 필수 ' + f);
  ch.cuts.forEach(y => validV2(y, card + ' ' + y.cut));
  gcUsed.push(x);
  gcEntries.push({ card, status: 'done', at: at(gcEntries.length), cuts: ch.cuts });
  gcn++;
}
assert(new Set(gcUsed.map(x => x.game)).size >= 3, '여덟 명이 여러 게임 — ' + gcUsed.map(x => x.game));   /* 2026-11-15 무게 고르기 — 예전엔 덜 쓴 게임 먼저라 여덟 게임 */
{ /* 예약 파일에 cosplay 가 실리고, 장부 view 가 그 예약을 cosplay 째 돌려준다(계획기가 남의 예약을 쓴 것으로 센다) */
  const lastE = gcEntries[gcEntries.length - 1];
  fs.writeFileSync(LEDGER, JSON.stringify({ entries: [] }));
  fs.writeFileSync(PLAN, JSON.stringify({ session: 'gcres', characters: [{ card: 'GR', species: 'GR', cuts: lastE.cuts }] }));
  cp.execFileSync('python3', ['tools/casual-ledger.py', 'reserve', PLAN, '--ledger', LEDGER, '--repos', tmp], { cwd: ROOT, stdio: 'pipe' });
  const viewed = JSON.parse(cp.execFileSync('python3', ['tools/casual-ledger.py', 'view', '--fresh', '--ledger', LEDGER, '--repos', tmp], { cwd: ROOT, encoding: 'utf8' })).entries.find(e => e.card === 'GR');
  const want = lastE.cuts.find(x => x.cosplay).cosplay;
  assert.deepEqual(viewed.cuts.find(x => x.cosplay).cosplay, want, '예약 → view 의 cosplay');
  fs.rmSync(path.join(tmp, 'casual-reservations'), { recursive: true, force: true });
  gcn++;
}
{
  /* 6d. 장부가 거는 것 — 게임 코스프레 두 장 · 얼굴 클로즈업 · 표 밖 장소 · 옷 ≠ 재단. 게임 코스프레 구성은 상황 노출 없이 통과, 옛 구성(목록 없음)은 상황 노출이 있어야 */
  const last = gcEntries[gcEntries.length - 1], prev = gcEntries.slice(0, -1);
  const one = cuts => check(prev, { session: 't', characters: [{ card: 'G7', species: 'G7', cuts }] });
  assert.equal(one(last.cuts), '', '그대로면 통과');
  const k = last.cuts.findIndex(x => x.ofam === GCR.outfit), other = last.cuts.findIndex(x => x.ofam !== GCR.outfit && !P.isRequired(tree, x) && x.ofam !== 'pokemon_costume');
  const mod = f => last.cuts.map((x, i) => i === k ? f(Object.assign({}, x)) : x);
  assert(/게임 코스프레 컷의 프레이밍 face_close/.test(one(mod(x => Object.assign(x, { frame: 'face_close' })))), '얼굴 클로즈업을 건다');
  assert(/게임 코스프레 컷의 장소/.test(one(mod(x => Object.assign(x, { place: 'street_cafe' })))), '표 밖 장소를 건다');
  assert(/재단 .* 와 다르다/.test(one(mod(x => Object.assign(x, { item: x.item === 'gc_knit' ? 'gc_idol' : 'gc_knit' })))), '옷 ≠ 재단을 건다');
  assert(/게임 · 재단\(cosplay\)이 없다/.test(one(mod(x => Object.assign(x, { cosplay: null })))), '게임 없는 코스프레 컷을 건다');
  assert(/게임 코스프레 컷이 2장/.test(one(last.cuts.map((x, i) => i === other ? Object.assign({}, last.cuts[k], { cut: x.cut }) : x))), '두 장을 건다');
  const noGc = last.cuts.map((x, i) => i === k ? Object.assign({}, last.cuts[other], { cut: x.cut }) : x).map(x => Object.assign({}, x, { situ: '' }));   /* 새 구성은 일반 컷에 상황이 늘 한 장(2026-11-16) — 빼고 옛 구성 판정을 본다 */
  assert(/상황 노출 컷이 0장/.test(one(noGc)), '게임 코스프레가 없으면 옛 구성 — 상황 노출이 있어야');
  gcn += 6;
}
{
  /* 6e. 생성기 주소 → 상태 — cosplay 를 그대로 잠근다, 목록에 없는 게임은 비우고 bad */
  const gcut = gcEntries[gcEntries.length - 1].cuts.find(x => x.ofam === GCR.outfit);
  const q2 = new URLSearchParams(P.generatorQuery('피카츄', gcut)).get('casual');
  const s2 = ST.initial(S, CT, P, {}, tree, { name: '피카츄', gen: 1 }, q2, { C2, tree2, cosplay: LIST });
  assert(s2.plan && !s2.plan.bad.length && s2.st.scenes.casual.randomLocks.cosplay, '주소 코스프레 ' + JSON.stringify(s2.plan));
  assert.deepEqual(s2.st.scenes.casual.cosplay, G.cosplayClean(LIST, gcut.cosplay), '주소의 cosplay 그대로');
  const bogus = Object.assign({}, gcut, { cosplay: { game: 'no_such_game', character: 'x', cut: 'knit' } });
  const s3 = ST.initial(S, CT, P, {}, tree, { name: '피카츄', gen: 1 }, new URLSearchParams(P.generatorQuery('피카츄', bogus)).get('casual'), { C2, tree2, cosplay: LIST });
  assert(s3.plan.bad.includes('cosplay') && !s3.st.scenes.casual.cosplay, '목록에 없는 게임은 비우고 bad');
  gcn += 2;
}
/* 6f. 명령줄 — 쓴 것 = 세 공방 기록 + 장부 예약(이번 카드 것은 빼고) + 같은 배치 앞 카드, --cosplay-full 은 그 게임을 2회차로 */
{
  const cli = require('../tools/casual-plan.cjs');
  const o2 = cli.args(['피카츄', '라이츄', '--session', 'gc', '--repos', tmp, '--cosplay-repos', '--cosplay-full', 'overwatch']);
  const ents = [{ card: '꼬부기', status: 'reserved', cuts: [{ cut: 1, cosplay: { game: 'dark_souls', character: 'the Chosen Undead in Elite Knight armour', cut: 'knit' } }] },
    { card: '피카츄', status: 'reserved', cuts: [{ cut: 1, cosplay: { game: 'tomb_raider', character: 'Lara Croft', cut: 'knit' } }] }];
  const gc2 = cli.cosplayOf(o2, ents);
  assert.deepEqual(gc2.used.map(x => x.game), ['dark_souls'], '예약은 이번 카드 것을 빼고'); assert.deepEqual(gc2.full, ['overwatch']);
  const cardsAll = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/card.json'), 'utf8')).cards.character;
  let pb; for (let i = 0; i < 20 && !pb; i++) { try { pb = cli.planBatch(o2, S, [], null, cardsAll, i); } catch (e) { if (!/^casual-plan/.test(e.message)) throw e; } }
  const gs = pb.characters.map(ch => ch.cuts.find(x => x.cosplay).cosplay.game);
  { const cs = pb.characters.map(ch => ch.cuts.find(x => x.cosplay).cosplay), many = new Set(LIST.games.filter(g => g.many).map(g => g.key));
    /* 2026-11-15 무게 고르기 — 같은 배치에 같은 게임이 와도 된다(등장인물 많은 게임이면 캐릭터가 다르다). 예약된 다크 소울의 재단(knit)은 다시 안 쓴다 */
    assert(cs.length === 2 && (cs[0].game !== cs[1].game || (many.has(cs[0].game) && G.nameKey(cs[0].character) !== G.nameKey(cs[1].character))) && cs.every(c => c.character) && !cs.some(c => c.game === 'dark_souls' && c.cut === 'knit'), '같은 배치 · 예약과 겹치지 않음 ' + JSON.stringify(cs)); }
  gcn += 3;
}
/* 6g. 옛 계획 다시 짜기(2026-11-16) — --recosplay 는 안 그린 옛 pick 칸의 cosplay 만 새 규칙으로(장소 그대로 · 되면 원래 재단), 다른 칸 · 다른 카드 · 그린 칸은 그대로.
   --recosplay-list 는 그림 저장소에서 계획은 있는데 아직 안 그린 pick 칸을 찍는다 */
{
  const cli = require('../tools/casual-plan.cjs');
  const src = gcEntries[gcEntries.length - 1].cuts, k = src.findIndex(x => x.ofam === GCR.outfit), N = src[k].cut;
  const old = src.map((x, i) => i === k ? Object.assign({}, x, { cosplay: { game: 'overwatch', character: '', cut: x.cosplay.cut, round: 1, used: [] } }) : x);
  const planF = path.join(tmp, 'records', 'pikachu-rc', 'plan.json');
  fs.mkdirSync(path.dirname(planF), { recursive: true });
  fs.writeFileSync(planF, JSON.stringify({ session: 'rc', characters: [{ card: '피카츄', species: 'pikachu-rc', cuts: old }, { card: '라이츄', species: 'raichu-rc', cuts: old }] }));
  const lo = () => cli.args(['--recosplay-list', '--repos', tmp, '--cosplay-repos']);
  assert.deepEqual(cli.recosplayList(lo()).map(r => r.family + '|' + r.card + '|' + r.no + '|' + r.game), ['pkm-atelier|라이츄|' + N + '|overwatch', 'pkm-atelier|피카츄|' + N + '|overwatch'], '다시 짜기 대상 목록');
  const res = cli.recosplay(cli.args(['피카츄', '--recosplay', '--plan', planF, '--repos', tmp, '--cosplay-repos']));
  const back = JSON.parse(fs.readFileSync(planF, 'utf8')), pk = back.characters[0].cuts, nc = pk[k];
  assert(res.changed.length === 1 && res.changed[0].cut === N && nc.cosplay.character && LIST.games.some(g => g.key === nc.cosplay.game) && !nc.cosplay.used, '그 칸만 새 규칙 ' + JSON.stringify(nc.cosplay));
  assert(nc.place === old[k].place && P.cosplayPlaceOk(tree, nc.cosplay.cut, nc.place) && nc.item === 'gc_' + nc.cosplay.cut && nc.cosplay.cut === old[k].cosplay.cut, '장소 그대로 · 원래 재단 ' + nc.place + ' ' + nc.cosplay.cut);
  assert(pk.every((c, i) => i === k || JSON.stringify(c) === JSON.stringify(old[i])) && JSON.stringify(back.characters[1].cuts) === JSON.stringify(old), '다른 칸 · 다른 카드는 그대로');
  assert(back.recosplay && back.recosplay[0].cuts[0].now.character === nc.cosplay.character, '계획 파일에 다시 짠 기록');
  assert.equal(cli.recosplay(cli.args(['피카츄', '--recosplay', '--plan', planF, '--repos', tmp, '--cosplay-repos'])).changed.length, 0, '두 번째는 바꿀 칸이 없다');
  /* 그린 칸(그림 저장소 기록이 있는 번호)은 안 바꾼다 */
  fs.mkdirSync(path.join(tmp, 'records', 'raichu-rc'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'records', 'raichu-rc', 'casual' + N + '-ui.json'), JSON.stringify({ storage: { last: '라이츄', cards: { 라이츄: { scenes: { casual: {} } } } } }));
  assert.equal(cli.recosplay(cli.args(['라이츄', '--recosplay', '--plan', planF, '--repos', tmp, '--cosplay-repos'])).changed.length, 0, '그린 칸은 그대로');
  assert.deepEqual(cli.recosplayList(lo()), [], '다시 짠 칸 · 그린 칸은 목록에서 빠진다');
  /* 다시 짠 피카츄 칸은 예약으로 센다 — 다른 카드를 짤 때 그 캐릭터는 빠진다 */
  const o4 = cli.args(['꼬부기', '--session', 'x', '--repos', tmp, '--cosplay-repos']), gc4 = cli.cosplayOf(o4, []);
  assert(gc4.used.some(u => u.game === nc.cosplay.game && u.character === nc.cosplay.character && u.card === '피카츄'), '다시 짠 칸도 쓴 것 ' + JSON.stringify(gc4.used));
  fs.rmSync(path.join(tmp, 'records', 'pikachu-rc'), { recursive: true, force: true }); fs.rmSync(path.join(tmp, 'records', 'raichu-rc'), { recursive: true, force: true });
  gcn += 9;
}
/* 구체 색(shade, 2026-11-16 — 사용자 「수영복 중에 색이 분홍색으로 지정되어 있는게 있어?」 → 「응 너무 많아」 → 「응 그렇게 진행해줘」).
   묶음(ocolor) 고르기는 그대로, 그 묶음 안 shade 하나 — 덜 쓴 것 먼저 · 머리 hue 피함 · 한 계획 안 겹침 없음 · 색 고정 옷 · 코스튬 · 코스프레 · 옷 자유엔 없음 · 이 공방 기록 + 예약을 센다 */
let shn = 0;
{
  const hueOf = k => (S.OUTFIT_COLORS.flatMap(g => g.shades).find(x => x.key === k) || {}).hue;
  const fixedCut = c => { const it = c.item ? CT.item(tree, c.ofam, c.item) : null, tx = it ? String(it.en || '').toLowerCase() : ''; return !!tx && S.OUTFIT_COLORS.some(g => g.words.some(w => new RegExp('\\b' + w + '\\b').test(tx))); };
  let pinkSeen = 0, total = 0;
  for (let i = 0; i < 6; i++) {
    const p = P.planV2({ S, tree, tree2, subject: { gen: 1, color: 'pink' }, entries: [], card: '피카츄', seed: 'shade|' + i, shade: { used: {} } });
    const sh = p.cuts.map(c => c.shade).filter(Boolean);
    assert(sh.length >= 3, '계획에 shade ' + sh.length);
    assert.equal(new Set(sh).size, sh.length, '한 계획 안 shade 겹침 없음');
    assert.equal(new Set(sh.map(hueOf)).size, sh.length, '한 계획 안 hue 도 겹치지 않는다(묶음이 다르다)');
    for (const c of p.cuts) {
      const fam = CT.family(tree, c.ofam);
      if (c.shade) { assert(P.shadesOf(S, c.ocolor).some(x => x.key === c.shade), c.cut + ' 그 묶음 안 열쇠 ' + c.ocolor + '/' + c.shade); total++; if (hueOf(c.shade) === 'pink') pinkSeen++; }
      if (!c.ocolor || (fam && (fam.costume || fam.cosplay)) || c.ofree || c.xfree || fixedCut(c)) assert(!c.shade, c.cut + ' shade 를 안 붙이는 컷 ' + c.ofam + '/' + c.item);
      else assert(c.shade, c.cut + ' 색 묶음이 있는 컷엔 shade');
    }
    const q = P.generatorQuery('피카츄', p.cuts.find(c => c.shade));
    assert(JSON.parse(new URLSearchParams(q).get('casual')).shade, '생성기 주소에 shade');
    shn += 4;
  }
  assert.equal(pinkSeen, 0, '분홍 머리(카드 색 pink) — 분홍 shade 없음 / ' + total);
  assert.equal(P.hairHue(S, { color: 'gray' }), 'grey'); assert.equal(P.hairHue(S, { color: 'blue', hair: 'soft cherry-blossom pink' }), 'pink'); assert.equal(P.hairHue(S, { hair: 'unreadable' }), '');
  /* 분포 — 같은 묶음 한 컷을 1000번: 기록이 없으면 고르게, 앞서 많이 쓴 shade 는 덜(덜 쓴 것 먼저) */
  let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const runN = (used, color, subj) => { const n = {}; for (let i = 0; i < 1000; i++) { const cuts = { 1: { ofam: 'everyday', item: '', ocolor: color } }; P.chooseShades(S, tree, [1], cuts, [], subj || { gen: 1, color: 'blue' }, used, [], () => false, rnd); n[cuts[1].shade] = (n[cuts[1].shade] || 0) + 1; } return n; };
  const even = runN({}, 'red'), reds = P.shadesOf(S, 'red').map(x => x.key);
  for (const k of reds) assert(even[k] > 140 && even[k] < 260, '고르게 ' + JSON.stringify(even));
  const less = runN({ cherry: 4, crimson: 1 }, 'red');
  assert(!less.cherry && !less.crimson && reds.filter(k => k !== 'cherry' && k !== 'crimson').every(k => less[k] > 250), '많이 쓴 shade 는 덜 ' + JSON.stringify(less));
  /* 머리 hue — 그 묶음이 다 머리 hue 면 피하지 않는다(남는 게 없으면) */
  assert.equal(Object.keys(runN({}, 'pink', { gen: 1, hair: 'pink' })).length, P.shadesOf(S, 'pink').length, '다 피하면 피하지 않는다');
  /* 한 계획 안 같은 묶음 두 컷 — shade 는 다르게 · 피할 값 */
  { const cuts = { 1: { ofam: 'everyday', ocolor: 'blue' }, 2: { ofam: 'everyday', ocolor: 'blue' } }; P.chooseShades(S, tree, [1, 2], cuts, [{ cut: 3, shade: 'navy' }], { gen: 1 }, {}, [], (n, f, v) => f === 'shade' && v === 'sky', rnd);
    assert(cuts[1].shade !== cuts[2].shade && ![cuts[1].shade, cuts[2].shade].includes('navy') && ![cuts[1].shade, cuts[2].shade].includes('sky'), '같은 묶음 두 컷 · 만든 컷 · 피할 값 ' + cuts[1].shade + ' ' + cuts[2].shade); }
  /* 같은 배치 — 앞 카드가 쓴 shade 도 센다 */
  { const n = {}; for (let i = 0; i < 200; i++) { const cuts = { 1: { ofam: 'everyday', ocolor: 'green' } }; P.chooseShades(S, tree, [1], cuts, [], { gen: 1 }, {}, [{ card: 'x', cuts: [{ cut: 1, shade: 'sage' }, { cut: 2, shade: 'olive' }] }], () => false, rnd); n[cuts[1].shade] = 1; }
    assert(!n.sage && !n.olive, '배치에서 쓴 shade 는 덜 ' + Object.keys(n)); }
  /* 쓴 수 세기(shadeUsed) — 이 공방 그림 저장소의 그린 기록(scene.shade) + 계획 · 예약 · 장부 reserved, 같은 컷은 한 번(그린 기록이 있으면 기록), 다시 짜는 카드는 뺀다 */
  { const repo = path.join(tmp, 'pkm-atelier-img-shade'), rec = path.join(repo, 'records');
    fs.mkdirSync(path.join(rec, 'pikachu-1'), { recursive: true }); fs.mkdirSync(path.join(rec, 'casual-reservations'), { recursive: true }); fs.mkdirSync(path.join(rec, 'raichu-1'), { recursive: true });
    fs.writeFileSync(path.join(rec, 'pikachu-1', 'casual3-ui.json'), JSON.stringify({ storage: { last: '피카츄', cards: { '피카츄': { scenes: { casual: { treeV: 2, ocolor: 'red', shade: 'cherry' } } } } } }));
    fs.writeFileSync(path.join(rec, 'casual-reservations', 's1.json'), JSON.stringify({ session: 's1', characters: [{ card: '피카츄', at: '2026-11-16T00:00:00Z', cuts: [{ cut: 3, shade: 'crimson' }, { cut: 4, shade: 'cherry' }] }] }));
    fs.writeFileSync(path.join(rec, 'raichu-1', 'plan-v2.json'), JSON.stringify({ characters: [{ card: '라이츄', cuts: [{ cut: 1, shade: 'navy' }, { cut: 2, shade: '' }] }] }));
    fs.writeFileSync(path.join(rec, 'casual-ledger.json'), JSON.stringify({ entries: [{ card: '파이리', status: 'reserved', at: '2026-11-16T01:00:00Z', cuts: [{ cut: 5, shade: 'navy' }] }, { card: '꼬부기', status: 'done', cuts: [{ cut: 1, shade: 'mint' }] }] }));
    const u = P.shadeUsed(null, [repo]);
    assert.deepEqual(u.used, { cherry: 2, navy: 2 }, '그린 기록 + 예약 + 계획 + 장부 reserved — 그린 컷의 예약은 안 센다 ' + JSON.stringify(u.used));
    assert.deepEqual(P.shadeUsed(null, [repo], { skip: x => x.card === '라이츄' }).used, { cherry: 2, navy: 1 }, '다시 짜는 카드의 계획은 뺀다');
    /* 명령줄(tools/casual-plan.cjs shadeOf) — 이 공방 저장소(--repos)에서 센 수가 계획기로 */
    const T = require('../tools/casual-plan.cjs'), o = T.args(['꼬부기', '--repos', repo, '--cosplay-repos']);
    assert.deepEqual(T.shadeOf(o, [{ card: '이브이', status: 'reserved', cuts: [{ cut: 2, shade: 'sky' }] }]).used, { cherry: 2, navy: 2, sky: 1 }, '장부 view 의 예약도');
    shn += 9; }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log('PASS 계획기 버전2: 버전1 열 명 위에 ' + N_V2 + '명(다시 정한 횟수 ' + tries + ') · 묶음 ' + groups.size + ' · 장소 ' + places.size + ' · 생성기 주소 · 피할 값 · 만든 컷 · 장부 비교 열쇠 · 예약 칸 · 게임 코스프레 ' + gcn + '가지(옛 구성 열여섯 명 그대로) · 구체 색 ' + shn + '가지');
