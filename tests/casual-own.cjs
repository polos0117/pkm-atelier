/* 캐릭터만의 컷(번호 90, IMAGE_RULES 3절 「캐릭터만의 컷」) — 계획 → 장부 → 지시문 묶음 → 생성기 주소까지 한 줄로 가는가. node tests/casual-own.cjs
   표는 검사 안의 임시 표다(data/casual-own.json 은 내용이 계속 바뀐다). 잠만보 = 도구 없는 줄, 럭키 = 도구(prop)를 두 손으로 드는 줄, 피카츄 = 내용 없음
   - 계획기: 일상 열 장 뒤에 90번 한 장(같은 씨앗이면 열 장은 표가 있든 없든 같다) · 내용 없는 카드는 「아직 없음」 · --own 은 이미 등록된 카드의 그 한 장만 · --own-level 은 의상 줄만
   - 장부: 90번이 든 계획이 check · reserve 를 통과하고 예약에는 90번이 없다 · 기록 폴더의 casual90-ui.json 은 장부에 안 읽힌다
   - 지시문 묶음: casual90-prompt.txt 에 표의 장소 · 장면 · 의상 · 도구(PROP 줄), casual90-ui.json 에 scene.own 과 맨 위 own
   - 생성기 주소: own 과 단계만 실리고 글은 표에서 다시 읽는다(주소에 끼운 글은 버린다) */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const PL = require('../tools/casual-plan.cjs'), PK = require('../tools/prompt-pack.cjs');   /* prompt-pack 이 lib 을 window(global)에 올린다 */
const S = window.AtelierSpec, CT = window.AtelierCasualTree, C2 = window.AtelierCasualTreeV2, CP = window.AtelierCasualPlan, ST = window.AtelierPromptState;
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const cards = read('card.json').cards.character, tree = read('casual-tree.json'), tree2 = read('casual-tree-v2.json');
const OUTFIT = { bold: 'a fitted look — a cropped top and shorts', moderate: 'a look — a short-sleeved top and a knee-length skirt', low: 'a look — a cardigan and a long skirt' };
const OWN = { number: 90, levels: ['bold', 'moderate', 'low'], cards: {
  '잠만보': { worlds: { all: { job_ko: '낮잠 카페 주인', base: 'street_park', place: 'the lawn terrace of a small nap café', activity: 'she is the owner of a nap café on her own break', preset: 'lie_side_full', outfit: OUTFIT } } },
  '럭키': { worlds: { all: { job_ko: '케어실 간호사', base: 'work_center', place: 'a clean care room by a bright window', activity: 'she is a care-room nurse between visits', preset: 'stand_use', prop: 'a steel care tray of rolled bandages', use: 'sig_both', outfit: OUTFIT } } } } };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-own-'));
const LEDGER = path.join(tmp, 'records', 'casual-ledger.json'), PLAN = path.join(tmp, 'plan.json');
fs.mkdirSync(path.join(tmp, 'records'));
fs.writeFileSync(LEDGER, JSON.stringify({ entries: [] }));
const ledger = (...a) => cp.spawnSync('python3', ['-X', 'utf8', path.join(ROOT, 'tools/casual-ledger.py'), ...a, '--ledger', LEDGER, '--repos', tmp], { encoding: 'utf8' });
const opts = (argv, table) => Object.assign(PL.args(argv.concat(['--repos', tmp])), { ownTable: table, img: {} });
const spec = S;
/* 장부 check 를 통과하는 묶음이 나올 때까지(계획기 solve 와 같은 길) */
function planned(argv, table, entries = []) {
  for (let k = 0; k < 40; k++) {
    let plan; try { plan = PL.planBatch(opts(argv, table), spec, entries, null, cards, k); } catch (e) { if (!/^casual-plan/.test(e.message)) throw e; continue; }
    fs.writeFileSync(PLAN, JSON.stringify(plan));
    const r = ledger('check', PLAN);
    if (r.status === 0) return { plan, k };
  }
  throw new Error('40번 안에 장부를 못 맞췄다');
}
let checks = 0;
try {
  /* 1. 계획기 — 열 장 + 90번, 내용 없는 카드는 건너뜀, 열 장은 표와 상관없이 같다 */
  const a = planned(['잠만보', '--session', 't'], OWN), ch = a.plan.characters[0], own = ch.cuts[10];
  assert.equal(ch.cuts.length, 11);
  assert.deepEqual([own.cut, own.own, own.treeV, own.preset, own.posture, own.place, own.placeText, own.scene, own.outfit, own.axes.skin_exposure],
    [90, 'all', 2, 'lie_side_full', 'lie_side', 'street_park', OWN.cards['잠만보'].worlds.all.place, OWN.cards['잠만보'].worlds.all.activity, OUTFIT.bold, 'bold']);
  const bare = PL.planBatch(opts(['잠만보', '--session', 't'], { cards: {} }), spec, [], null, cards, a.k).characters[0];
  assert.deepEqual(bare.cuts, ch.cuts.slice(0, 10), '표가 있든 없든 일상 열 장은 같다');
  assert.match(bare.own_note, /^90 ◇ .*아직 없음.*건너뜀/);
  const text = PL.show({}, { plan: a.plan, entries: [], look: null, file: PLAN, attempt: 0 });
  assert(text.includes('90번 ◆ 캐릭터만의 컷 — 낮잠 카페 주인 · 노출 bold · lie_side_full'), text);
  assert(PL.show({}, { plan: { session: 't', characters: [bare] }, entries: [], look: null, file: PLAN, attempt: 0 }).includes('90 ◇'));
  checks += 5;

  /* 2. 장부 — 90번이 든 계획이 reserve 를 통과하고 예약엔 열 장만. 기록의 casual90-ui.json 은 안 읽힌다 */
  let r = ledger('reserve', PLAN);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const res = JSON.parse(fs.readFileSync(path.join(tmp, 'records', 'casual-reservations', 't.json'), 'utf8')).characters[0];
  assert.deepEqual(res.cuts.map(c => c.cut), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(ledger('verify', '--session', 't').status, 0);
  checks += 3;

  /* 3. 지시문 묶음 — casual90 한 자리. 표의 글 · PROP 줄의 도구 · 기록의 own */
  const b = planned(['럭키', '--session', 'u'], OWN), tool = b.plan.characters[0].cuts[10];
  assert.deepEqual([tool.use, tool.right, tool.left, tool.prop, tool.ownProp], ['sig_both', 'prop', 'prop', '0', OWN.cards['럭키'].worlds.all.prop]);
  const dir = path.join(tmp, 'pack'), c = cards.find(x => x.name === '럭키');
  const log = console.log; console.log = () => {};
  try { PK.init({ card: '럭키', dir, plan: PLAN, repos: [tmp] }); PK.build({ dir, slot: 'casual90', ownTable: OWN }); } finally { console.log = log; }
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8')).slots.casual90.guide.own, '케어실 간호사', 'init 이 casual90 자리를 만든다(계획에 90번이 있을 때만 — 없을 때는 tests/prompt-pack.cjs 의 열한 자리)');
  const prompt = fs.readFileSync(path.join(dir, 'casual90-prompt.txt'), 'utf8'), ui = JSON.parse(fs.readFileSync(path.join(dir, 'casual90-ui.json'), 'utf8'));
  const row = OWN.cards['럭키'].worlds.all;
  for (const line of ['Place: ' + row.place, 'Scene note: ' + row.activity, 'Outfit: ' + OUTFIT.bold]) assert(prompt.includes(line + '\n'), '지시문에 없다: ' + line);
  assert.match(prompt, /\nPROP: [^\n]*a steel care tray of rolled bandages[^\n]*\n/);
  assert(!/her own tool/.test(prompt), '도구 글 대신 트리의 자리 말이 나왔다');
  assert.deepEqual(ui.own, { job_ko: '케어실 간호사', level: 'bold' });
  assert.equal(ui.storage.cards['럭키'].scenes.casual.own, 'all');
  assert.equal(ui.plan.cut, 90);
  assert.equal(PK.fileName('럭키', PK.PACK_STYLE, 'casual90'), '럭키_' + PK.PACK_STYLE + '_f_casual90.webp');
  /* 계획에 90번이 없는 묶음은 이 자리를 조용히 건너뛴다 · 표가 계획 뒤에 바뀌면 고칠 칸 */
  { const bad = [], d = { ...PK.data(), }; d.v2 = { ...d.v2, own: OWN };
    assert.equal(PK.stateOf({ version: 4, style: PK.PACK_STYLE, slots: {} }, 'casual90', d, c, { characters: [{ card: '럭키', cuts: b.plan.characters[0].cuts.slice(0, 10) }] }, bad), null); assert.deepEqual(bad, []);
    const moved = JSON.parse(JSON.stringify(OWN)); moved.cards['럭키'].worlds.all.place = 'another room';
    d.v2 = { ...d.v2, own: moved }; PK.stateOf({ version: 4, style: PK.PACK_STYLE, slots: {} }, 'casual90', d, c, b.plan, bad); assert.match(bad.join(), /계획과 다르다: placeText/); }
  /* 기록 폴더에 casual90-ui.json 만 있어도 장부 칸이 안 생긴다 */
  fs.mkdirSync(path.join(tmp, 'records', 'chansey-20261113'));
  fs.copyFileSync(path.join(dir, 'casual90-ui.json'), path.join(tmp, 'records', 'chansey-20261113', 'casual90-ui.json'));
  r = ledger('view', '--fresh');
  assert.deepEqual(JSON.parse(r.stdout).entries.filter(e => e.status === 'done'), [], '90번 기록이 장부에 읽혔다');
  assert.equal(PL.ownDone(opts(['럭키'], OWN), '럭키'), true, '기록의 90번을 못 봤다');
  checks += 13;

  /* 4. 생성기 주소 — own 과 단계만, 글은 표에서. 주소에 끼운 글은 버린다 */
  const q = JSON.parse(new URLSearchParams(CP.generatorQuery('럭키', tool)).get('casual'));
  assert.equal(q.own, 'all');
  for (const k of ['placeText', 'scene', 'outfit', 'ownProp', 'prop']) assert(!(k in q), '주소에 글 칸 ' + k);
  const open = (raw, table) => ST.initial(S, CT, CP, {}, tree, c, JSON.stringify(raw), { C2, tree2, own: table });
  const got = open({ ...q, placeText: 'EVIL', scene: 'EVIL', outfit: 'EVIL', ownProp: 'EVIL' }, OWN), sc = got.st.scenes.casual;
  assert.deepEqual(got.plan.bad, []);
  assert.deepEqual([sc.own, sc.placeText, sc.scene, sc.outfit, sc.ownProp, sc.use], ['all', row.place, row.activity, OUTFIT.bold, row.prop, 'sig_both']);
  assert.deepEqual(sc, ui.storage.cards['럭키'].scenes.casual, '주소로 연 장면 = 묶음의 저장값');
  assert.equal(open({ ...q, axes: { ...q.axes, skin_exposure: 'low' } }, OWN).st.scenes.casual.outfit, OUTFIT.low);
  assert(open(q, { cards: {} }).plan.bad.includes('own'), '표에 없는 카드인데 own 을 받았다');
  { const plain = open({ ...q, own: undefined, placeText: 'EVIL', ownProp: 'EVIL' }, OWN).st.scenes.casual; assert(!plain.placeText && !plain.ownProp && plain.use !== 'sig_both', '캐릭터만의 컷이 아닌 주소가 글 · 도구를 받았다'); }
  checks += 8;

  /* 5. --own — 일상컷이 이미 등록된 카드의 그 한 장만. --own-level 은 의상 줄 · 단계만 바꾼다 */
  const done = [{ card: '잠만보', species: 'snorlax-20261101', status: 'done', at: '2026-11-01T00:00:00Z', cuts: ch.cuts.slice(0, 10) }];
  assert.throws(() => PL.planBatch(opts(['잠만보', '--session', 't'], OWN), spec, done, null, cards, 0), /--own/);
  const o1 = planned(['잠만보', '--own', '--session', 't'], OWN, done).plan.characters[0];
  assert.deepEqual([o1.species, o1.own_only, o1.cuts.length], ['snorlax-20261101', true, 1]);
  assert.deepEqual(o1.cuts[0], own, '같은 세션이면 같은 컷');
  const o2 = planned(['잠만보', '--own', '--own-level', 'moderate', '--session', 't'], OWN, done).plan.characters[0].cuts[0];
  assert.deepEqual(o2, { ...own, outfit: OUTFIT.moderate, axes: { ...own.axes, skin_exposure: 'moderate' } });
  assert.throws(() => PL.planBatch(opts(['피카츄', '--own'], OWN), spec, [], null, cards, 0), /아직 없음/);
  assert.throws(() => PL.args(['잠만보', '--own', '--reserve', '--session', 't']), /예약이 없다/);
  /* 표의 줄이 트리에 안 맞으면 조용히 바꾸지 않는다 — 90번만 못 짓고 열 장은 그대로 */
  { const broken = JSON.parse(JSON.stringify(OWN)); broken.cards['잠만보'].worlds.all.prop = 'a tray'; broken.cards['잠만보'].worlds.all.use = 'sig_hold';
    const x = PL.planBatch(opts(['잠만보', '--session', 't'], broken), spec, [], null, cards, a.k).characters[0];
    assert.deepEqual(x.cuts, ch.cuts.slice(0, 10)); assert.match(x.own_note, /^90 ✗ .*sig_hold/);
    assert.throws(() => PL.planBatch(opts(['잠만보', '--own'], broken), spec, [], null, cards, 0), /sig_hold/); }
  checks += 9;
  console.log('캐릭터만의 컷 통과 — ' + checks + '가지');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
