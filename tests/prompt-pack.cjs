/* 지시문 묶음(tools/prompt-pack.cjs) — 브라우저 없이 생성기와 같은 지시문·저장값을 파일로.
   - init 은 고칠 칸만 있는 settings.json 을 만들고, 이미 있으면 덮지 않는다
   - build 는 아홉 자리(IMAGE_RULES 3절 표 — 출력·인물 기준·장갑 폼·폭주 기준·첨부)를 도구가 정하고 지시문·저장값·차례표를 쓴다
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
  let r = run('init', '피카츄', '--dir', dir, '--plan', planFile);
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
  assert.notEqual(run('init', '피카츄', '--dir', dir).status, 0, '이미 있으면 덮지 않는다');
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
  assert(index.includes('| ⑤ | heavy_overdrive | ② 피카츄_heavy_glossy_promo_f.webp + (되면 ①) |') && index.includes('`피카츄_glossy_promo_f_casual1.webp`'), '차례표');
  const c1text = fs.readFileSync(path.join(dir, 'casual1-prompt.txt'), 'utf8');
  assert(index.includes('## ⑦ casual1 — 고른 길') && index.includes(g1.tree.place.en) && c1text.includes('Place: ' + g1.tree.place.en) && c1text.includes('Activity: ' + g1.tree.act.en), '차례표의 트리 문장 = 지시문 줄');
  checks += 2;
  /* 같은 settings 면 같은 글 */
  const before = fs.readFileSync(path.join(dir, 'casual3-prompt.txt'), 'utf8');
  assert.equal(run('build', '--dir', dir, '--slot', 'casual3').status, 0); assert.equal(fs.readFileSync(path.join(dir, 'casual3-prompt.txt'), 'utf8'), before, '다시 돌려도 같다');

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
  console.log('PASS 지시문 묶음: init(고칠 칸만·안내 — 고른 길의 트리 문장·덮지 않음) · build 아홉 자리(고정값·저장값 = 생성기 상태·지시문 = 조립부) · 일상(계획 값 잠김·주소 길과 같음·직접 입력과 사유·장부가 읽음) · 차례표(컷마다 고른 길) · 같은 글 · 틀린 칸 — ' + checks + '가지');
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }
