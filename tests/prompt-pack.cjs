/* 지시문 묶음(tools/prompt-pack.cjs) — 브라우저 없이 생성기와 같은 지시문·저장값을 파일로.
   - init 은 고칠 칸만 있는 settings.json 을 만들고, 이미 있으면 덮지 않는다
   - build 는 아홉 자리(--legacy, settings.version 1)를 도구가 정하고 지시문·저장값·차례표를 쓴다
   - 2026-11-07 기본은 여덟 자리(경장 ① + 일상 일곱, anime_gloss) — ① 의 메카 큰 실루엣 · 타입 표현은 init 이 정하고(최근 ① 과 다른 실루엣), 바꾸면 사유
   - 저장값은 생성기 상태 코드(lib/prompt-state.js)를 다시 돌려도 그대로이고, 지시문은 그 저장값으로 조립부가 지은 글과 같다
   - 일상 세 컷의 선택값은 계획 파일에서만(생성기 주소와 같은 길), 직접 입력은 사유가 있어야, 장부(casual-ledger.py)가 그대로 읽는다
   - 틀린 칸(없는 칸·고정값·표에 없는 값·사유 없는 직접 입력·계획에 없는 컷)이면 아무것도 쓰지 않고 1
   화면과 글자 하나 다르지 않은지는 tests/prompt-pack-screen.cjs. Run: node tests/prompt-pack.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..'), TOOL = path.join(ROOT, 'tools/prompt-pack.cjs');
global.window = global;
for (const f of ['prompt-spec', 'casual-tree', 'prompt-anthro', 'prompt-lifestyle', 'casual-plan', 'prompt-state']) require('../lib/' + f + '.js');
const S = window.AtelierSpec, CT = window.AtelierCasualTree, P = window.AtelierPrompt, L = window.AtelierLifestyle, CP = window.AtelierCasualPlan, ST = window.AtelierPromptState;
const run = (...a) => cp.spawnSync(process.execPath, [TOOL, ...a], { encoding: 'utf8' });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-pack-'));
const AX = { overall_intensity: 'strong', skin_exposure: 'bold', action_level: 'mostly posed', source_influence: 'subtle', separates_preference: 'balanced' };
const CUTS = [
  { cut: 1, era: 'now', place: 'water_pool', act: 'sunbed', ofam: 'swimwear', item: 'classic_bikini', expr: 'confident', pose: '', orient: 'side', frame: 'three_quarter', lens: 'portrait85', aspect: '2:3', axes: AX, garments: ['bikini'], expose: ['strapless top'], lead: 'place' },
  { cut: 2, era: 'now', place: 'street_park', act: 'stroll', ofam: 'everyday', item: '', expr: 'calm', pose: '', orient: 'front_3q', frame: 'full_body', lens: 'natural50', aspect: '2:3', axes: { ...AX, action_level: 'balanced' } },
  { cut: 3, era: 'now', place: 'street_cafe', act: 'read_book', ofam: 'everyday', item: '', expr: '', pose: '', orient: 'side', frame: 'three_quarter', lens: 'natural50', aspect: '2:3', axes: { ...AX, source_influence: 'strong' } }];
const planFile = path.join(tmp, 'PLAN.json');
fs.writeFileSync(planFile, JSON.stringify({ session: 't', characters: [{ card: '피카츄', cuts: CUTS }] }));
const dir = path.join(tmp, 'pikachu');
let checks = 0;
try {
  /* init — 고칠 칸만, 일상컷엔 계획의 길·옷 종류·드러내기·첫머리 안내 */
  let r = run('init', '피카츄', '--dir', dir, '--plan', planFile, '--legacy');
  assert.equal(r.status, 0, r.stderr);
  const set = JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8'));
  assert.equal(set.style, 'glossy_promo', '기본 화풍');
  assert.deepEqual(Object.keys(set.slots), ['light', 'heavy', 'mobility', 'light_overdrive', 'heavy_overdrive', 'mobility_overdrive', 'casual1', 'casual2', 'casual3']);
  assert(!('form' in set.slots.heavy) && !('identityMode' in set.slots.light), '고정값은 settings 에 없다');
  const g1 = set.slots.casual1.guide, treeJ = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8'));
  assert.equal(g1.path, 'now / water_pool / sunbed / swimwear / classic_bikini');
  assert.deepEqual([g1.garments, g1.expose, g1.lead], [['bikini'], ['strapless top'], 'place']);
  /* 고른 길의 트리 문장 — 지시문의 Place·Activity·Outfit 줄과 같은 영어 */
  assert.equal(g1.tree.place.en, CT.place(treeJ, 'water_pool').en); assert.equal(g1.tree.act.en, CT.act(treeJ, 'sunbed').en);
  assert.equal(g1.tree.item.en, CT.item(treeJ, 'swimwear', 'classic_bikini').en); assert(g1.tree.place.group && g1.tree.act.pose_family && g1.tree.era.ko, '묶음·자세 계열·시대 이름');
  assert.equal(set.slots.casual2.guide.tree.item.key, '', '옷 자동');
  assert.notEqual(run('init', '피카츄', '--dir', dir, '--legacy').status, 0, '이미 있으면 덮지 않는다');
  checks += 3;

  /* 채운다 — ① 외형·머리 특징, 일상1 옷·장면(사유와 함께) */
  set.slots.light.params = { 'apparent age': '30s', hairstyle: 'bob' };
  set.slots.light.headFeature = 'ornament';
  set.slots.heavy.scene.action = { category: 'melee', example: 'melee_counter' };
  set.slots.heavy_overdrive.custom = 'arcs of lightning circle her';
  set.slots.casual1.outfit = 'a white string bikini with a sheer sarong'; set.slots.casual1.why = { outfit: '계획의 옷 종류 bikini 와 드러내기 strapless top 을 한 벌로' };
  set.slots.casual1.scene = 'Late sun glints on the pool tiles.'; set.slots.casual1.why.scene = '첫머리가 장소(lead place)라 수영장 타일로 연다';
  fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify(set, null, 1));
  r = run('build', '--dir', dir);
  assert.equal(r.status, 0, r.stderr);
  const names = fs.readdirSync(dir);
  for (const s of Object.keys(set.slots)) assert(names.includes(s + '-prompt.txt') && names.includes(s + '-ui.json'), s + ' 파일');
  assert(names.includes('INDEX.md'));
  checks++;

  /* 저장값 → 지시문: 생성기 상태 코드를 다시 돌려도 같은 상태, 그 상태로 지은 글 = 파일 */
  const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/card.json'), 'utf8')).cards.character, tree = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8'));
  const card = cards.find(c => c.name === '피카츄'), app = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source-appearance.json'), 'utf8')).entries[String(card.no)];
  const face = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/face-design.json'), 'utf8')).faces[String(card.no)] || null;
  const want = { light: ['action', 'light', 'create'], heavy: ['action', 'heavy', 'reference'], mobility: ['action', 'mobility', 'reference'], light_overdrive: ['action', 'overdrive', 'reference', 'light'],
    heavy_overdrive: ['action', 'overdrive', 'reference', 'heavy'], mobility_overdrive: ['action', 'overdrive', 'reference', 'mobility'], casual1: ['casual'], casual2: ['casual'], casual3: ['casual'] };
  for (const [slot, w] of Object.entries(want)) {
    const ui = JSON.parse(fs.readFileSync(path.join(dir, slot + '-ui.json'), 'utf8')), text = fs.readFileSync(path.join(dir, slot + '-prompt.txt'), 'utf8');
    const st = ui.storage.cards['피카츄'];
    assert.equal(ui.storage.last, '피카츄');
    assert.equal(st.mode, w[0], slot + ' 출력'); if (w[1]) assert.equal(st.form, w[1], slot + ' 폼'); if (w[2]) assert.equal(st.identityMode, w[2], slot + ' 인물 기준'); if (w[3]) assert.equal(st.baseForm, w[3], slot + ' 폭주 기준');
    /* 생성기가 다시 읽어도 같은 상태 — 옛 칸(갈래·예시)은 빈 장면이 다시 붙이니(화면도 같다) 빼고 견준다. 다시 지은 글도 같다 */
    const again = ST.initial(S, CT, CP, st, tree, card, null).st, bare = x => { const y = JSON.parse(JSON.stringify(x)); for (const m of ['action', 'casual']) for (const k of ['cat', 'catCustom', 'ex', 'exCustom']) delete y.scenes[m][k]; return y; };
    assert.deepEqual(bare(again), bare(st), slot + ' 저장값은 생성기가 다시 읽어도 그대로');
    assert.equal(ST.prompt(P, L, again, card, app, face, tree) + '\n', text, slot + ' 다시 읽은 상태로 지어도 같은 글');
    assert.equal(text, ST.prompt(P, L, st, card, app, face, tree) + '\n', slot + ' 지시문 = 저장값으로 지은 글');
    assert.equal(ui.prompt + '\n', text);
  }
  checks += 9;
  const light = fs.readFileSync(path.join(dir, 'light-prompt.txt'), 'utf8');
  assert(/hairstyle: bob/.test(light) && /ornament/i.test(light), '① 외형·머리 특징');
  assert(/lightning/.test(fs.readFileSync(path.join(dir, 'heavy_overdrive-prompt.txt'), 'utf8')), '폭주 추가 요청');
  /* 일상 — 계획의 선택값 그대로·잠김, 직접 입력과 사유 */
  const c1 = JSON.parse(fs.readFileSync(path.join(dir, 'casual1-ui.json'), 'utf8')), sc1 = c1.storage.cards['피카츄'].scenes.casual;
  for (const k of ['era', 'place', 'act', 'ofam', 'item', 'expr', 'orient', 'frame', 'lens']) assert.equal(sc1[k], CUTS[0][k], '계획 값 ' + k);
  assert(sc1.randomLocks.place && sc1.randomLocks.orient && sc1.randomLocks['axes.skin_exposure'], '계획 칸 잠김');
  assert.equal(sc1.outfit, set.slots.casual1.outfit); assert.deepEqual(c1.manual_inputs, { outfit: set.slots.casual1.outfit, scene: set.slots.casual1.scene });
  assert.equal(c1.manual_why.outfit, set.slots.casual1.why.outfit); assert.equal(c1.plan.cut, 1);
  assert(fs.readFileSync(path.join(dir, 'casual1-prompt.txt'), 'utf8').includes('Outfit: ' + set.slots.casual1.outfit), '옷 직접 입력이 지시문에');
  /* 계획기 주소로 생성기를 연 것과 같은 상태 — 주소 길(generatorQuery → fromQuery) 그대로 */
  const viaUrl = ST.initial(S, CT, CP, { style: 'glossy_promo', identityMode: 'reference' }, tree, card, new URLSearchParams(CP.generatorQuery('피카츄', CUTS[1])).get('casual')).st;
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'casual2-ui.json'), 'utf8')).storage.cards['피카츄'], viaUrl, '일상2 = 계획기 주소로 연 생성기 상태');
  checks += 6;
  /* 장부가 그대로 읽는다 — casual-ledger.py 의 storage_of 와 같은 길로 일상 칸 */
  const py = cp.spawnSync('python3', ['-c', `import importlib.util,json,sys
s=importlib.util.spec_from_file_location('l', ${JSON.stringify(path.join(ROOT, 'tools/casual-ledger.py'))}); m=importlib.util.module_from_spec(s); s.loader.exec_module(m)
st=m.storage_of(json.load(open(sys.argv[1]))); c=st['cards'][st['last']]['scenes']['casual']; print(json.dumps([c['place'],c['act'],c['orient'],sorted(m.garments_of(c.get('outfit')))]))`, path.join(dir, 'casual1-ui.json')], { encoding: 'utf8' });
  assert.equal(py.status, 0, py.stderr);
  const got = JSON.parse(py.stdout);
  assert.deepEqual(got.slice(0, 3), ['water_pool', 'sunbed', 'side']); assert(got[3].includes('bikini'), '장부가 옷 종류를 읽는다');
  /* 차례표 — 첨부·올릴 파일 */
  const index = fs.readFileSync(path.join(dir, 'INDEX.md'), 'utf8');
  assert(index.includes('프롬프트 임의 수정 금지 — 이미지 모델에도 똑같다') && index.includes('노출은 세션이 줄이지 않는다'), '차례표 — 임의 수정 금지 · 노출(2026-11-08)');
  assert(index.includes('| ⑤ | heavy_overdrive | ② 피카츄_heavy_glossy_promo_f.webp + (되면 ①) |') && index.includes('`피카츄_glossy_promo_f_casual1.webp`'), '차례표');
  const c1text = fs.readFileSync(path.join(dir, 'casual1-prompt.txt'), 'utf8');
  assert(index.includes('## ⑦ casual1 — 고른 길') && index.includes(g1.tree.place.en) && c1text.includes('Place: ' + g1.tree.place.en) && c1text.includes('Activity: ' + g1.tree.act.en), '차례표의 트리 문장 = 지시문 줄');
  checks += 2;
  /* 같은 settings 면 같은 글 */
  const before = fs.readFileSync(path.join(dir, 'casual3-prompt.txt'), 'utf8');
  assert.equal(run('build', '--dir', dir, '--slot', 'casual3').status, 0); assert.equal(fs.readFileSync(path.join(dir, 'casual3-prompt.txt'), 'utf8'), before, '다시 돌려도 같다');

  /* 화풍 참조 칸은 없다(2026-11-03 지움 — 2D 로 쏠린 그림을 참고해 쏠림을 굳히고 자세·구도까지 따라왔다). settings 에 있으면 틀린 칸 */
  const sr = JSON.parse(JSON.stringify(set)), srdir = path.join(tmp, 'style-reference');
  sr.slots.light.styleReference = 'Attached image is style only.';
  fs.mkdirSync(srdir); fs.writeFileSync(path.join(srdir, 'settings.json'), JSON.stringify(sr));
  r = run('build', '--dir', srdir, '--slot', 'light'); assert.equal(r.status, 1, '화풍 참조 칸은 받지 않는다');
  assert(!fs.existsSync(path.join(srdir, 'light-prompt.txt'))); checks++;

  /* 틀린 칸 — 아무것도 안 쓰고 1 */
  const bad = JSON.parse(JSON.stringify(set)), bdir = path.join(tmp, 'bad');
  bad.slots.heavy.form = 'light'; bad.slots.light.scene.expr = 'nope'; bad.slots.light.params['eye colour'] = 'red'; bad.slots.casual2.custom = 'soft rim light';
  bad.slots.light.scene.action = { category: 'melee', example: 'nope' }; bad.slots.casual3.why = { pose: 'x' };
  fs.mkdirSync(bdir); fs.writeFileSync(path.join(bdir, 'settings.json'), JSON.stringify(bad));
  r = run('build', '--dir', bdir);
  assert.equal(r.status, 1);
  for (const w of ['heavy.form', 'light.scene.expr', 'light.params.eye colour', 'casual2.why.custom', 'light.scene.action.example', 'casual3.why.pose']) assert(r.stderr.includes(w), '걸린다 ' + w);
  assert.deepEqual(fs.readdirSync(bdir), ['settings.json'], '아무것도 안 썼다');
  /* 계획에 없는 카드·컷 */
  const other = JSON.parse(JSON.stringify(set)), odir = path.join(tmp, 'other');
  other.card = '라이츄'; other.no = 26; fs.mkdirSync(odir); fs.writeFileSync(path.join(odir, 'settings.json'), JSON.stringify(other));
  r = run('build', '--dir', odir); assert.equal(r.status, 1); assert(/계획에 라이츄 1번 컷이 없다/.test(r.stderr));
  checks += 3;
  /* 버전2 계획 컷(계획기 --v2 — 2026-10-30) — 버전2 칸 그대로 잠그고 지시문도 버전2, 자유 카메라 글 없음, 표에 안 맞는 값은 걸린다 */
  require('../lib/casual-tree-v2.js');
  const C2 = window.AtelierCasualTreeV2, tree1 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree.json'), 'utf8')), tree2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/casual-tree-v2.json'), 'utf8'));
  const T2 = C2.make(tree2, tree1), pk = { gen: 1 };
  const v2cut = (n, base, preset, more) => Object.assign(C2.repair(T2, Object.assign(C2.applyPreset(T2, Object.assign({ treeV: 2 }, base), preset), more || {}), pk), { cut: n, treeV: 2, axes: AX, garments: ['shirt'], expose: [], lead: 'action' });
  const V2CUTS = [v2cut(1, { era: 'in_pokemon', place: 'work_lab', ofam: 'work' }, 'counter_work', { use: 'job_lab_maps' }),
    v2cut(2, { era: 'in_pokemon', place: 'partner_yard', ofam: 'everyday' }, 'kneel_pet', { expr: 'gentle' }),
    v2cut(3, { era: 'now', place: 'home_living', ofam: 'swimwear' }, 'stand_inspect')];
  assert.equal(V2CUTS[0].use, 'job_lab_maps');
  const v2plan = path.join(tmp, 'PLAN-v2.json'), v2dir = path.join(tmp, 'pikachu-v2');
  fs.writeFileSync(v2plan, JSON.stringify({ session: 't2', characters: [{ card: '피카츄', cuts: V2CUTS }] }));
  r = run('init', '피카츄', '--dir', v2dir, '--plan', v2plan, '--legacy'); assert.equal(r.status, 0, r.stderr);
  const s2 = JSON.parse(fs.readFileSync(path.join(v2dir, 'settings.json'), 'utf8'));
  assert.equal(s2.slots.casual1.guide.tree, 2); assert.equal(s2.slots.casual1.guide.v2.role.ko, '포켓몬 연구 코디네이터', '안내에 역할');
  s2.slots.casual1.custom = 'warm lamp light over the desk'; s2.slots.casual1.why = { custom: '연구소 책상 조명 — 고른 장소 문장에 빛이 없다' };
  fs.writeFileSync(path.join(v2dir, 'settings.json'), JSON.stringify(s2));
  r = run('build', '--dir', v2dir); assert.equal(r.status, 0, r.stderr);
  const t1 = fs.readFileSync(path.join(v2dir, 'casual1-prompt.txt'), 'utf8'), u1 = JSON.parse(fs.readFileSync(path.join(v2dir, 'casual1-ui.json'), 'utf8'));
  assert(t1.includes('POSTURE: ') && t1.includes('Role: she is at work here as a Pokémon research coordinator.') && !t1.includes('Activity: '), '버전2 지시문');
  const sc2 = u1.storage.cards['피카츄'].scenes.casual;
  assert.equal(sc2.treeV, 2); assert.equal(sc2.use, 'job_lab_maps'); assert(sc2.randomLocks.place && sc2.randomLocks.use && sc2.randomLocks.right, '계획 칸 잠금');
  assert(fs.readFileSync(path.join(v2dir, 'casual2-prompt.txt'), 'utf8').includes('exactly one Pokémon companion'), '동료 컷');
  /* 저장값을 생성기 상태 코드로 다시 열면 같은 지시문 — 화면이 이 기록을 열어도 같다 */
  const again = ST.initial(S, CT, CP, u1.storage.cards["피카츄"], tree1, { name: '피카츄', gen: 1 }, null, { C2, tree2 }).st;
  const pika = JSON.parse(fs.readFileSync(path.join(ROOT, "data/card.json"), "utf8")).cards.character.find(c => c.name === "피카츄");
  const appear = (JSON.parse(fs.readFileSync(path.join(ROOT, 'data/source-appearance.json'), 'utf8')).entries || {})[String(card.no)];
  const faces = (JSON.parse(fs.readFileSync(path.join(ROOT, 'data/face-design.json'), 'utf8')).faces || {})[String(pika.no)] || null;
  assert.equal(ST.prompt(P, L, again, pika, appear, faces, tree1, tree2) + '\n', t1, '저장값 → 같은 지시문');
  assert(fs.readFileSync(path.join(v2dir, 'INDEX.md'), 'utf8').includes('고른 장면(버전2)'), '차례표');
  /* 틀린 칸 — 버전2 컷의 카메라 글, 표에 안 맞는 계획 값 */
  s2.slots.casual2.camera = 'low angle'; fs.writeFileSync(path.join(v2dir, 'settings.json'), JSON.stringify(s2));
  r = run('build', '--dir', v2dir); assert.equal(r.status, 1); assert(/버전2 컷엔 자유 카메라 글이 없다/.test(r.stderr), r.stderr);
  delete s2.slots.casual2.camera; fs.writeFileSync(path.join(v2dir, 'settings.json'), JSON.stringify(s2));
  V2CUTS[2].body = 'back'; fs.writeFileSync(v2plan, JSON.stringify({ session: 't2', characters: [{ card: '피카츄', cuts: V2CUTS }] }));
  r = run('build', '--dir', v2dir); assert.equal(r.status, 1); assert(/버전2 트리에 안 맞는다: body/.test(r.stderr), r.stderr);
  checks += 4;
  /* 여덟 자리(2026-11-07) — 경장 ① + 일상 일곱, anime_gloss, ① 메카 실루엣 · 타입 표현 자동(최근 ① 이 쓴 실루엣은 피한다) */
  {
    require('../lib/concept-mecha.js');
    const CMT = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/concept-mecha.json'), 'utf8'));
    const p7 = CP.planV2({ S, tree: tree1, tree2, subject: pk, entries: [], card: '피카츄', seed: 'pack7' });
    assert.equal(p7.cuts.length, 7);
    const plan7 = path.join(tmp, 'PLAN-7.json'), repo = path.join(tmp, 'img-x'), d7 = path.join(tmp, 'pikachu-7'), d7b = path.join(tmp, 'pikachu-7b');
    fs.writeFileSync(plan7, JSON.stringify({ session: 't7', characters: [{ card: '피카츄', cuts: p7.cuts }] }));
    fs.mkdirSync(path.join(repo, 'records'), { recursive: true });
    r = run('init', '피카츄', '--dir', d7, '--plan', plan7, '--repos', repo); assert.equal(r.status, 0, r.stderr);
    const s7 = JSON.parse(fs.readFileSync(path.join(d7, 'settings.json'), 'utf8'));
    assert.equal(s7.version, 2); assert.equal(s7.style, 'anime_25d', '기본 화풍 애니 2.5D 디테일(2026-11-08)');
    assert.deepEqual(Object.keys(s7.slots), ['light', 'casual1', 'casual2', 'casual3', 'casual4', 'casual5', 'casual6', 'casual7']);
    const m = s7.slots.light.mecha, sil = CMT.silhouettes.find(x => x.key === m.set.silhouette);
    assert(sil && sil.key !== 'none' && Object.keys(m.set).length === 1, '큰 실루엣 하나만(부위 부품은 비운다)');
    assert(CMT.types.electric.silhouette.includes(sil.key), '타입 추천 안에서');
    assert.deepEqual(m.fx.map(x => x.key)[0], 'hand'); assert.equal(m.fx.length, 3, '타입 표현 자동 — 손 + 몸 하나 + 주변 하나');
    assert.deepEqual(s7.slots.light.mecha_auto, m);
    /* ① 체형(2026-11-07 꼬부기 초안 4 — 「이대로 고정해줘」) — 모든 종 같은 문장 */
    assert.equal(s7.slots.light.params['body type'], S.CARD_FIGURE, '피카츄 체형');
    const sn = path.join(tmp, 'snorlax-7'); r = run('init', '잠만보', '--dir', sn, '--repos', repo); assert.equal(r.status, 0, r.stderr);
    assert.equal(JSON.parse(fs.readFileSync(path.join(sn, 'settings.json'), 'utf8')).slots.light.params['body type'], S.CARD_FIGURE, '잠만보도 같은 문장');
    /* 최근 ① 이 그 실루엣을 썼으면 다른 것 */
    const rec = path.join(repo, 'records', 'raichu-anime_gloss-20261107'); fs.mkdirSync(rec);
    fs.writeFileSync(path.join(rec, 'light-ui.json'), JSON.stringify({ storage: { last: '라이츄', cards: { '라이츄': { mecha: { set: { silhouette: sil.key }, fx: [] } } } } }));
    r = run('init', '피카츄', '--dir', d7b, '--plan', plan7, '--repos', repo); assert.equal(r.status, 0, r.stderr);
    const s7b = JSON.parse(fs.readFileSync(path.join(d7b, 'settings.json'), 'utf8'));
    assert.deepEqual(s7b.slots.light.mecha_recent, [sil.key]); assert.notEqual(s7b.slots.light.mecha.set.silhouette, sil.key, '최근 ① 의 실루엣은 피한다');
    /* build — 여덟 자리, ① 에 MECHA SILHOUETTE · TYPE EFFECTS 줄, 저장값 → 같은 지시문 */
    r = run('build', '--dir', d7); assert.equal(r.status, 0, r.stderr);
    const lt = fs.readFileSync(path.join(d7, 'light-prompt.txt'), 'utf8'), lu = JSON.parse(fs.readFileSync(path.join(d7, 'light-ui.json'), 'utf8'));
    const want = window.AtelierConceptMecha.lines(CMT, ['electric'], m);
    assert(want.length === 2 && want.every(x => lt.includes(x)), '① 메카 줄');
    assert(lt.includes('body type: ' + S.CARD_FIGURE) && lt.includes('without slimming her figure'), '① 체형 줄 · 장갑만 가늘게');
    assert.deepEqual(lu.storage.cards['피카츄'].mecha, m, '저장값에 mecha');
    assert.equal(ST.prompt(P, L, ST.initial(S, CT, CP, lu.storage.cards['피카츄'], tree1, pika, null, { C2, tree2 }).st, pika, appear, faces, tree1, tree2, CMT) + '\n', lt, '저장값 → 같은 지시문');
    const idx = fs.readFileSync(path.join(d7, 'INDEX.md'), 'utf8');
    assert(idx.includes('| ⑧ | casual7 | ① 피카츄_light_anime_25d_f.webp |') && idx.includes('`피카츄_anime_25d_f_casual7.webp`') && !idx.includes('heavy'), '차례표 여덟 자리');
    for (let n = 1; n <= 7; n++) assert(fs.existsSync(path.join(d7, 'casual' + n + '-prompt.txt')), 'casual' + n);
    assert(fs.readFileSync(path.join(d7, 'casual3-prompt.txt'), 'utf8').includes('BODY LINE: keep her figure from the attached image'), '일상컷 몸 라인 줄(2026-11-07)');
    /* mecha 를 바꾸면 사유, 표에 없는 값 · 다른 타입은 걸린다 */
    const s7c = JSON.parse(JSON.stringify(s7)); s7c.slots.light.mecha = { set: { silhouette: 'knight_plate' }, fx: [{ key: 'aura', type: '' }] };
    fs.writeFileSync(path.join(d7, 'settings.json'), JSON.stringify(s7c));
    r = run('build', '--dir', d7); assert.equal(r.status, 1); assert(/mecha_why/.test(r.stderr), r.stderr);
    s7c.slots.light.mecha_why = '사용자가 기사 갑주로'; fs.writeFileSync(path.join(d7, 'settings.json'), JSON.stringify(s7c));
    r = run('build', '--dir', d7); assert.equal(r.status, 0, r.stderr);
    assert(fs.readFileSync(path.join(d7, 'light-prompt.txt'), 'utf8').includes(CMT.silhouettes.find(x => x.key === 'knight_plate').en), '바꾼 실루엣');
    s7c.slots.light.mecha = { set: { silhouette: 'nope', legs: 'heels' }, fx: [{ key: 'aura', type: 'water' }, { key: 'aura' }] };
    fs.writeFileSync(path.join(d7, 'settings.json'), JSON.stringify(s7c));
    r = run('build', '--dir', d7); assert.equal(r.status, 1);
    assert(/mecha\.set\.silhouette — 표에 없는 값/.test(r.stderr) && /타입은 electric/.test(r.stderr) && /aura 가 두 번/.test(r.stderr), r.stderr);
    /* 옷 색(2026-11-07) — 계획 색이 지시문 줄로, 옷 직접 쓰기 글은 그 색 낱말을 쓴다 */
    const cc = p7.cuts.find(x => x.ocolor), slotC = 'casual' + cc.cut, colRow = S.OUTFIT_COLORS.find(x => x.key === cc.ocolor);
    assert(fs.readFileSync(path.join(d7b, '..', 'pikachu-7', slotC + '-prompt.txt'), 'utf8').includes('Outfit colours: ' + colRow.en), '옷 색 줄');
    assert.equal(s7.slots[slotC].guide.color.key, cc.ocolor, '안내에 옷 색');
    const s7d = JSON.parse(JSON.stringify(s7b)); s7d.slots[slotC].outfit = 'a fitted dress with a short hem'; s7d.slots[slotC].why = { outfit: '옷 문장 다듬기' };
    fs.writeFileSync(path.join(d7b, 'settings.json'), JSON.stringify(s7d));
    r = run('build', '--dir', d7b); assert.equal(r.status, 1); assert(new RegExp(slotC + '.outfit — 계획의 옷 색').test(r.stderr), r.stderr);
    s7d.slots[slotC].outfit = 'a fitted ' + colRow.words[0] + ' dress with a short hem'; fs.writeFileSync(path.join(d7b, 'settings.json'), JSON.stringify(s7d));
    r = run('build', '--dir', d7b); assert.equal(r.status, 0, r.stderr);
    /* 아홉 자리 settings(version 1)는 그대로 아홉 자리 */
    assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8')).version, 1);
    checks += 6;
  }
  /* 실제로 넘긴 글(2026-11-03) — 그대로면 0, 고쳐 쓴 글이면 1 과 빠진 화풍 줄. 기록은 자리마다 쌓인다 */
  const lp = fs.readFileSync(path.join(dir, 'light-prompt.txt'), 'utf8'), sent = path.join(tmp, 'sent.txt');
  fs.writeFileSync(sent, lp.trimEnd());
  r = run('submitted', '--dir', dir, '--slot', 'light', '--file', sent); assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(path.join(dir, 'light-submitted.txt'), 'utf8'), lp.trimEnd(), '넘긴 글 그대로 남긴다');
  fs.writeFileSync(sent, lp.split('\n').filter(x => !/^STYLE:/.test(x)).join('\n').replace('SUBJECT:', 'SUBJECT: anime girl,'));
  r = run('submitted', '--dir', dir, '--slot', 'light', '--file', sent); assert.equal(r.status, 1);
  const log = JSON.parse(fs.readFileSync(path.join(dir, 'submitted.json'), 'utf8')).light;
  assert.deepEqual(log.map(x => x.same), [true, false]); assert.equal(log[1].style_kept, false);
  assert(log[1].missing.some(x => /^STYLE:/.test(x)) && log[1].added.some(x => /anime girl/.test(x)), '빠진 줄·더해진 줄');
  assert.equal(run('submitted', '--dir', dir, '--slot', 'light').status, 2, '--file 없으면 멈춘다');
  checks += 3;
  console.log('PASS 지시문 묶음: 여덟 자리(경장 + 일상 일곱 · anime_25d · 체형 · 일상 몸 라인 · ① 메카 실루엣 · 타입 표현 자동 · 최근 실루엣 피함 · 바꾸면 사유) · init(고칠 칸만·안내 — 고른 길의 트리 문장·덮지 않음) · build 아홉 자리(--legacy — 고정값·저장값 = 생성기 상태·지시문 = 조립부) · 일상(계획 값 잠김·주소 길과 같음·직접 입력과 사유·장부가 읽음) · 차례표(컷마다 고른 길) · 같은 글 · 틀린 칸 · 넘긴 글 대조 — ' + checks + '가지');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
