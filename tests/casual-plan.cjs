/* 일상컷 계획기 — lib/casual-plan.js · tools/casual-plan.cjs. node tests/casual-plan.cjs
   2026-10-29 일상컷 트리(B안) — 장면은 트리 길, 장부의 옛 칸(갈래/예시)은 변환표로 같은 길.
   - 빈 장부에서 서른 명을 차례로 정해도 매번 tools/casual-ledger.py check 를 통과한다(사람 손 없이)
   - 세 명 배치 · 빈 컷 다시 채우기 · 피할 값(--avoid) · 만든 컷 두기 · 같은 씨앗 같은 답
   - 생성기 주소(generatorQuery ↔ fromQuery)는 트리 위의 값만 받는다(예전 주소의 갈래·예시는 변환표로)
   - 옷 종류 말과 식이 casual-ledger.py 의 GARMENTS 와 같다
   - 옛 칸으로 쌓인 장부도 같은 길로 비교한다(같은 장소·하는 일 10명 금지가 옛 예시에도 걸린다)
   - 그림 저장소가 옆에 있으면 실제 장부로도 한 번(보고만) */
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), vm = require('node:vm'), cp = require('node:child_process');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const P = require('../lib/casual-plan.js');
require('../lib/casual-tree.js');
const CT = globalThis.AtelierCasualTree;
const c = { window: {} }; vm.createContext(c); vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib/prompt-spec.js'), 'utf8'), c);
const S = c.window.AtelierSpec;
const tree = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8'));
const subject = { gen: 1 };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-plan-'));
const LEDGER = path.join(tmp, 'casual-ledger.json'), PLAN = path.join(tmp, 'plan.json');
const check = (entries, plan) => {
  fs.writeFileSync(LEDGER, JSON.stringify({ entries }));
  fs.writeFileSync(PLAN, JSON.stringify(plan));
  try { cp.execFileSync('python3', ['tools/casual-ledger.py', 'check', PLAN, '--ledger', LEDGER, '--repos', tmp], { cwd: ROOT, stdio: 'pipe' }); return ''; }
  catch (e) { return String(e.stdout); }
};
const plan = o => P.plan({ S, tree, subject, ...o });
const at = i => new Date(Date.UTC(2026, 9, 1) + i * 36e5).toISOString();
const key = x => P.pathKey(P.pathOf(tree, x));
const groupOf = x => CT.place(tree, P.pathOf(tree, x).place).group;
/* 배치 — 걸리면 씨앗을 바꿔 다시(명령줄과 같은 길) */
function batchPlan(entries, cards, tag, opts = {}) {
  let last = '';
  for (let t = 0; t < 40; t++) {
    const batch = [];
    for (const card of cards) {
      const p = plan({ entries, card, batch, seed: [tag, card, t].join('|'), ...(opts[card] || {}) });
      batch.push({ card, species: card, refill: p.refill, cuts: p.cuts, claims: p.claims });
    }
    const pl = { session: 't', characters: batch };
    last = check(entries, pl);
    if (!last) return { plan: pl, tries: t };
  }
  throw new Error('40번 안에 못 맞췄다: ' + cards.join() + '\n' + last);
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
    assert(x.era && x.place && x.act && x.ofam && x.orient && x.frame && x.lens, '빈 값 없이: ' + JSON.stringify(x));
    assert(!x.cat && !x.ex, '새 컷은 트리 길만 적는다');
    const fixed = CT.repair(tree, x, subject, S.CLOSE_FRAMES);
    for (const k of ['era', 'place', 'act', 'ofam', 'item', 'pose', 'orient', 'lens', 'expr']) assert.equal(fixed[k] || '', x[k] || '', 'tree path ' + k + ' ' + JSON.stringify(x));
    assert.equal(x.axes.overall_intensity, 'strong'); assert.equal(x.axes.skin_exposure, 'bold'); assert.equal(x.aspect, '2:3');
    assert(x.garments.length && x.garments.every(g => P.GARMENTS[g]), '정한 옷 종류: ' + x.garments);
    const it = CT.item(tree, x.ofam, x.item);
    if (it) assert.deepEqual(x.garments, P.garmentsOf(it.en), '옷 문장의 옷 종류를 계획도 따른다: ' + x.item);
    assert(!CT.banned(tree, 'orients').includes(x.orient) && !CT.banned(tree, 'frames').includes(x.frame), '안 쓰는 값');
    if (x.frame === 'face_close') assert(!P.isRequired(tree, x), '필수 갈래 컷엔 얼굴 클로즈업이 없다');
    assert(x.expose.length === 2 && x.expose[0] !== x.expose[1] && x.expose.every(e => P.EXPOSE.includes(e)), '드러내는 방식 둘');
    assert(P.LEAD.includes(x.lead));
  }
  assert.equal(new Set(ch.cuts.map(x => x.lead)).size, 3, '장면 칸 첫머리가 세 장 다르다');
  assert.equal(new Set(ch.cuts.map(groupOf)).size, 3, '세 장은 서로 다른 장소 묶음');
  entries.push({ card, status: 'done', at: at(i), cuts: ch.cuts });
  n++;
}
/* 서른 명 동안 — 같은 장소·하는 일은 10명 안에 없고, 묶음·시대가 퍼진다 */
const seen = entries.map(e => e.cuts.map(key));
for (let i = 0; i < seen.length; i++) for (let j = Math.max(0, i - 10); j < i; j++) assert(!seen[i].some(k => seen[j].includes(k)), '10명 안 같은 장소·하는 일 ' + i + '·' + j);
const groupsUsed = new Set(entries.flatMap(e => e.cuts.map(groupOf)));
assert(groupsUsed.size >= 12, '장소 묶음이 퍼진다: ' + groupsUsed.size);
const eras = entries.flatMap(e => e.cuts.map(x => x.era)), eraN = k => eras.filter(e => e === k).length;
assert(tree.eras.every(e => eraN(e.key) > 0) && eraN('now') >= Math.max(eraN('release'), eraN('fantasy')), '시대가 퍼지고 지금이 가장 흔하다: ' + tree.eras.map(e => e.key + '=' + eraN(e.key)).join(' '));
const req = entries.map(e => e.cuts.filter(x => P.isRequired(tree, x)).map(x => x.cut).join());
assert(new Set(req).size >= 4 && req.some(r => r.length > 1), '필수 갈래 자리가 돌고 두 장인 캐릭터가 있다: ' + req.join(' '));
const reqFams = new Set(entries.flatMap(e => e.cuts.filter(x => P.isRequired(tree, x)).map(x => x.ofam)));
assert.deepEqual([...reqFams].sort(), tree.required.outfits.slice().sort(), '필수 의상 계열 넷이 다 돈다');
n += 4;

/* ── 같은 씨앗 같은 답 ── */
assert.deepEqual(plan({ entries, card: 'X', seed: 's' }), plan({ entries, card: 'X', seed: 's' }), '같은 입력·씨앗 같은 답'); n++;

/* ── 세 명 배치 — 서로의 길·짝·새 값을 빼앗지 않는다 ── */
{
  const r = batchPlan(entries, ['B1', 'B2', 'B3'], 'batch');
  const ks = r.plan.characters.flatMap(ch => ch.cuts.map(key));
  assert.equal(new Set(ks).size, 9, '배치 안 장소·하는 일 아홉이 다 다르다');
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
/* 옛 칸으로 등록된 캐릭터의 다시 채우기 — 옛 칸(갈래·예시) 두 장을 두고 새 칸 한 장 */
{
  const old = { card: 'OLD', status: 'done', at: at(99), cuts: [
    { cut: 1, cat: 'swimwear', ex: 'classic_bikini', expr: 'calm', pose: 'standing_relaxed', orient: 'front', frame: 'full_body', lens: 'natural50', axes: { source_influence: 'subtle' }, garments: ['bikini'] },
    { cut: 2, cat: 'hobbies_leisure', ex: 'hobby_music', expr: 'soft_smile', pose: 'sitting', orient: 'side', frame: 'waist_up', lens: 'portrait85', axes: { source_influence: 'strong' }, garments: ['dress'] }] };
  const r = batchPlan(entries, ['OLD'], 'refill-old', { OLD: { refill: true, kept: old.cuts } });
  const cuts = r.plan.characters[0].cuts;
  assert(cuts[0].kept && cuts[0].cat === 'swimwear' && cuts[2].place && !cuts[2].cat, '옛 칸은 그대로, 새 칸은 길');
  assert(![key(cuts[0]), key(cuts[1])].includes(key(cuts[2])) && ![groupOf(cuts[0]), groupOf(cuts[1])].includes(groupOf(cuts[2])), '옛 칸의 묶음도 피한다');
  n++;
}

/* ── 피할 값 — 막힌 하는 일을 다시 고르지 않는다 ── */
{
  const first = plan({ entries, card: 'Y', seed: 'v' }), x = first.cuts[1];
  const r = batchPlan(entries, ['Y'], 'avoid', { Y: { avoid: [{ cut: 2, field: 'act', value: x.act }] } }), again = r.plan.characters[0];
  assert.notEqual(again.cuts[1].act, x.act, '막힌 하는 일은 다시 안 나온다');
  const r2 = batchPlan(entries, ['Y'], 'avoid2', { Y: { avoid: [{ cut: null, field: 'frame', value: 'full_body' }, { cut: 3, field: 'group', value: groupOf(first.cuts[2]) }] } });
  assert(r2.plan.characters[0].cuts.every(c => c.frame !== 'full_body') && groupOf(r2.plan.characters[0].cuts[2]) !== groupOf(first.cuts[2]), '프레이밍·묶음도 피한다');
  n++;
}

/* ── 만든 컷은 두고 한 컷만 다시(--keep) — 막힌 2번만 바꾸고 1·3번은 그대로, 차례 조건까지 통과 ── */
{
  const first = plan({ entries, card: 'Z', seed: 'k' }), keep = first.cuts.filter(x => x.cut !== 2).map(x => ({ ...x, kept: true }));
  let ok = null;
  for (let t = 0; t < 40 && !ok; t++) {
    const p = plan({ entries, card: 'Z', seed: 'k' + t, kept: keep, avoid: [{ cut: 2, field: 'act', value: first.cuts[1].act }] });
    if (!check(entries, { session: 't', characters: [{ card: 'Z', species: 'Z', cuts: p.cuts }] })) ok = p;
  }
  assert(ok, '한 컷만 다시 정해도 check 를 통과한다');
  assert.equal(key(ok.cuts[0]), key(first.cuts[0])); assert.equal(key(ok.cuts[2]), key(first.cuts[2]));
  assert(ok.cuts[0].kept && ok.cuts[2].kept && !ok.cuts[1].kept && ok.cuts[1].act !== first.cuts[1].act, '1·3번은 그대로, 2번만 새로');
  n++;
}
/* ── 생성기 주소 — 왕복하고, 트리 위의 값이 아니면 버린다. 예전 주소(갈래·예시)는 변환표로 ── */
{
  const cut = entries[0].cuts[0], q = new URLSearchParams(P.generatorQuery('피카츄', cut));
  assert.equal(q.get('mech'), '피카츄');
  const got = P.fromQuery(S, q.get('casual'), tree, subject);
  for (const k of ['era', 'place', 'act', 'ofam', 'item', 'expr', 'pose', 'orient', 'frame', 'lens', 'aspect']) { assert.equal(got.scene[k] || '', cut[k] || '', k); assert(got.locks[k], k + ' 잠김'); }
  for (const k of S.LOCAL_AXES) { assert.equal(got.scene.axes[k], cut.axes[k]); assert(got.locks['axes.' + k]); }
  assert.deepEqual(got.bad, []);
  const bad = P.fromQuery(S, JSON.stringify({ ...cut, act: 'nope', orient: 'back', axes: { skin_exposure: 'extreme' } }), tree, subject);
  assert(bad.bad.includes('act') && bad.bad.includes('orient') && !bad.scene.act && !bad.scene.orient && !bad.scene.axes.skin_exposure, '모르는 값·안 쓰는 값은 버린다');
  const old = P.fromQuery(S, JSON.stringify({ cat: 'partner_care', ex: 'care_feeding', frame: 'three_quarter', orient: 'front', lens: 'natural50', expr: 'calm', pose: 'offering_food', aspect: '2:3', axes: {} }), tree, subject);
  assert.equal(old.scene.place, 'partner_garden'); assert.equal(old.scene.act, 'care_feeding'); assert.equal(old.scene.pose, 'offering_food');
  assert.equal(P.fromQuery(S, '{not json', tree), null);
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

/* ── 옛 칸도 같은 열쇠 — 앞 10명이 옛 예시로 쓴 장소·하는 일은 새 컷이 안 고른다 ── */
{
  const old = Object.keys(tree.legacy).filter(k => !k.endsWith('/')).slice(0, 30).map((k, i) => {
    const [cat, ex] = k.split('/');
    return { cut: i % 3 + 1, cat, ex, expr: 'calm', pose: '', orient: 'front', frame: 'full_body', lens: 'natural50', axes: {}, garments: ['dress'] };
  });
  const ent = [];
  for (let i = 0; i < old.length; i += 3) ent.push({ card: 'L' + i, status: 'done', at: at(i), cuts: old.slice(i, i + 3) });
  const usedKeys = new Set(old.map(key));
  for (const seed of ['l1', 'l2', 'l3']) {
    const p = plan({ entries: ent, card: 'NEW', seed });
    assert(p.cuts.every(x => !usedKeys.has(key(x))), seed + ' 옛 예시의 장소·하는 일을 다시 골랐다');
  }
  n++;
}

/* ── 작은 묶음은 한 바퀴 — 길이 여덟 개 이하인 묶음은 가장 적게 쓴 길부터 ── */
{
  const small = tree.groups.map(g => g.key).map(g => [g, P.paths(tree, null).list.filter(p => p.group === g).map(p => p.key)]).filter(([, l]) => l.length > 1 && l.length <= P.SMALL_GROUP);
  assert(small.length, '작은 묶음이 있다');
  const [g, list] = small[0], once = list[list.length - 1];
  const hist = list.slice(0, -1).map((k, i) => ({ card: 'S' + i, status: 'done', at: at(i), cuts: [{ cut: 1, era: 'now', place: k.split('/')[0], act: k.split('/')[1], ofam: 'everyday', orient: 'front', frame: 'full_body', garments: [] }] }));
  /* 그 뒤 10명이 다른 묶음을 쓴다(창 밖으로 밀어낸다) */
  for (let i = 0; i < 11; i++) hist.push({ card: 'T' + i, status: 'done', at: at(100 + i), cuts: [{ cut: 1, cat: 'lingerie', ex: 'lace_set', orient: 'side', frame: 'waist_up', garments: ['lingerie_set'] }] });
  let hit = 0;
  for (let s = 0; s < 40; s++) for (const x of plan({ entries: hist, card: 'NEW', seed: 'small' + s }).cuts) if (groupOf(x) === g) { hit++; assert.equal(key(x), once, '작은 묶음 ' + g + ' 은 아직 안 쓴 길부터'); }
  assert(hit > 0, '작은 묶음이 한 번은 나온다');
  n++;
}

/* ── 덮는 겉옷은 세 장 중 한 장까지 ── */
{
  const COV = P.COVERING;
  for (let s = 0; s < 60; s++) {
    const p = plan({ entries, card: 'NEW', seed: 'cover' + s });
    assert(p.cuts.filter(c => (c.garments || []).some(g => COV.includes(g))).length <= 1, '덮는 겉옷 두 장: ' + JSON.stringify(p.cuts.map(c => [key(c), c.garments])));
  }
  n++;
}

/* ── 실제 장부(그림 저장소가 옆에 있으면) — 미등록 한 종이 현재 장부에서도 맞춰지는지 ── */
{
  const img2 = path.join(ROOT, '..', 'pkm-atelier-img-2');
  if (fs.existsSync(path.join(img2, 'records'))) {
    const ledger = JSON.parse(cp.execFileSync('python3', ['tools/casual-ledger.py', 'view', '--fresh'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }));
    assert(ledger.entries.every(e => e.cuts.every(x => x.place && x.act)), 'view 는 옛 칸에도 길을 붙여 준다');
    const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'img.json'), 'utf8'));
    const known = new Set(ledger.entries.map(e => e.card).concat(Object.keys(registry.img || {})));
    const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/card.json'), 'utf8')).cards.character.filter(c => !known.has(c.name)).slice(0, 1).map(c => c.name);
    const out = cp.execFileSync('node', ['tools/casual-plan.cjs', ...cards, '--no-pull', '--seed', 'test'], { cwd: ROOT, encoding: 'utf8' });
    assert(out.includes('check 통과'), out);
    n++;
  } else console.log('(그림 저장소가 옆에 없어 실제 장부 시험은 건너뜀)');
}
/* 붐비는 장부 — 비교 대상이 허용된 방향·프레이밍을 다 썼고, 같은 배치 앞 캐릭터가 남은 새 값을 잡아도 계획기는 죽지 않는다 */
{
  const ORS = S.ORIENTATION_OPTIONS.map(r => r[0]).filter(v => v && !/^auto/.test(v) && !CT.banned(tree, 'orients').includes(v));
  const FRS = S.FRAME_OPTIONS.map(r => r[0]).filter(v => v && !/^auto/.test(v) && !CT.banned(tree, 'frames').includes(v));
  const crowded = [];
  for (let i = 0; i < 8; i++) crowded.push({ card: 'Z' + i, status: i >= 2 ? 'reserved' : 'done', at: at(400 + i), cuts: [1, 2, 3].map(k => {
    const j = i * 3 + k - 1;
    return { cut: k, cat: 'everyday_basic', ex: 'commute_train', expr: 'calm', pose: 'standing_formal', orient: ORS[j % ORS.length], frame: FRS[j % FRS.length], lens: 'natural50', axes: {}, garments: ['dress'] };
  }) });
  let batch = [];
  for (const card of ['Y1', 'Y2', 'Y3']) {
    const p = plan({ entries: entries.concat(crowded), card, batch, seed: 'crowded|' + card });
    assert.equal(p.cuts.length, 3, card + ' 계획이 나온다');
    assert(p.cuts.every(x => x.orient && x.frame && x.place), card + ' 컷마다 값이 있다');
    batch.push({ card, cuts: p.cuts, claims: p.claims });
  }
  n++;
}
/* 조깅하는 일에는 움직이는 자세만(2026-10-27 — 예전엔 조깅 예시) */
{
  let jog = 0;
  for (let i = 0; i < 300 && jog < 3; i++) for (const x of plan({ entries: [], card: 'J' + i, batch: [], seed: 'jog' + i, avoid: [] }).cuts)
    if (/\bjog/.test(CT.act(tree, x.act).en)) { jog++; assert(!x.pose || ['mid_stride', 'mid_action', 'turning_back'].includes(x.pose), '조깅에 ' + x.pose); }
  n++;
}
/* 생성 전 예약이 여럿 쌓여도 계획이 나온다(2026-10-27) — 구도·옷·세 축 비교는 가장 최근 예약 셋까지 */
{
  const base = [], now = Date.now();
  for (let i = 0; i < 12; i++) {
    const p = plan({ entries: base, card: 'D' + i, batch: [], seed: 'pile' + i });
    base.push({ card: 'D' + i, species: 'd-' + i, status: 'done', at: new Date(now - (100 - i) * 36e5).toISOString(), cuts: p.cuts });
  }
  const SRC = [['subtle', 'subtle', 'balanced'], ['subtle', 'subtle', 'strong'], ['balanced', 'balanced', 'subtle'], ['balanced', 'balanced', 'strong'],
    ['strong', 'strong', 'subtle'], ['strong', 'strong', 'balanced'], ['subtle', 'balanced', 'strong']];
  const GS = Object.keys(P.GARMENTS);
  const pile = [];
  for (let i = 0; i < 10; i++) {
    const p = plan({ entries: base.concat(pile), card: 'Q' + i, batch: [], seed: 'q' + i });
    p.cuts.forEach((c, k) => { c.axes = Object.assign({}, c.axes, { source_influence: SRC[i % 7][k] }); c.garments = [GS[(i * 3 + k) % GS.length]]; });
    pile.push({ card: 'Q' + i, species: 'q-' + i, status: 'reserved', at: new Date(now - (60 - i) * 6e4).toISOString(), cuts: p.cuts });
  }
  assert(batchPlan(base.concat(pile), ['NEW'], 'pile').plan, '예약이 쌓여도 계획이 나온다');
  n++;
}
/* 같은 배치에서 뒤에 정할 다시 채우기 캐릭터의 등록된 컷(fixed) — 그 컷의 짝과 겹치게 정하지 않는다 */
{
  const ORS = S.ORIENTATION_OPTIONS.map(r => r[0]).filter(v => v && !/^auto/.test(v)), FRS = S.FRAME_OPTIONS.map(r => r[0]).filter(v => v && !/^auto/.test(v));
  const fixedCuts = [];
  for (let i = 0; i < 12; i++) fixedCuts.push({ cut: 1 + (i % 3), cat: 'everyday_basic', ex: 'commute_train', orient: ORS[i % ORS.length], frame: FRS[(i * 7) % FRS.length], garments: ['dress'], axes: {} });
  for (let s = 0; s < 20; s++) {
    const p = plan({ entries, card: 'W', batch: [], fixed: [{ card: 'V', cuts: fixedCuts }], seed: 'fixed|' + s });
    const pairs = new Set(fixedCuts.map(c => c.orient + '|' + c.frame));
    if (!(p.why.relaxed || []).length) assert(p.cuts.every(c => !pairs.has(c.orient + '|' + c.frame)), '뒤 캐릭터의 등록된 컷과 짝이 겹친다: ' + s);
  }
  n++;
}
/* 하는 일의 주 활동과 부딪히는 자세·방향(2026-10-26 재생성 기록 — 그때는 예시 문장) — 계획기가 낸 컷은 늘 하는 일 문장과 맞는다 */
{
  const bad = [
    ['clapping from a pokémon tournament spectator seat, with a small pennant resting on a bag.', ['hands_in_hair', 'on_tiptoe', 'standing_relaxed'], ['looking_down']],
    ['pouring warm berry tea into a cup at a small kitchen table with a teapot and sliced fruit.', ['preparing_food', 'holding_cup'], []],
    ['waiting on a rural station bench with a travel bag, holding a snack and checking a route card.', ['cross_legged', 'sitting_floor', 'walking'], []],
    ['looking through binoculars from a hilltop lookout, with a folded habitat map in a side pocket.', ['walking', 'sitting_floor'], ['looking_down']],
    ['posing at a photo zone in front of a printed backdrop', ['taking_photo'], []],
    ['sketching habitat plants and pokémon tracks in a notebook on a park bench.', ['on_tiptoe', 'watering', 'squatting', 'standing_formal'], []]
  ];
  for (const [text, poses, orients] of bad) {
    for (const p of poses) assert.equal(P.poseFits(p, text), false, p + ' 가 「' + text.slice(0, 40) + '」 에 붙는다');
    for (const o of orients) assert.equal(P.orientFits(o, text), false, o + ' 가 「' + text.slice(0, 40) + '」 에 붙는다');
    assert(P.poseFits('mid_action', text), '「선택한 활동 진행 중」 은 늘 된다');
  }
  for (let s = 0; s < 30; s++) {
    const p = plan({ entries, card: 'Z' + s, batch: [], seed: 'fit|' + s });
    for (const x of p.cuts) {
      const it = CT.item(tree, x.ofam, x.item), t = (CT.act(tree, x.act).en + ' ' + (it ? it.en : '')).toLowerCase();
      if (x.pose) assert(P.poseFits(x.pose, t), x.act + ' 에 ' + x.pose + ' 가 붙었다');
      assert(P.orientFits(x.orient, t), x.act + ' 에 ' + x.orient + ' 가 붙었다');
      if ((CT.act(tree, x.act) || {}).companion) assert(!['chest_up', 'face_close'].includes(x.frame), '동료 장면을 가까이 잘랐다');
    }
  }
  n++;
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log('PASS 일상컷 계획기: ' + n + '가지 · 서른 명 차례로 check 통과(다시 정한 횟수 ' + tries + ') · 10명 안 장소·하는 일 겹침 없음 · 묶음 ' + groupsUsed.size + '개 · 시대 ' + tree.eras.map(e => e.key + ' ' + eraN(e.key)).join('·') + ' · 배치 · 다시 채우기(옛 칸 포함) · 피할 값 · 만든 컷 두기 · 생성기 주소 · 옷 종류 말 · 옛 칸 같은 열쇠');
