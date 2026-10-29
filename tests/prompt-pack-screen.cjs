/* 지시문 묶음 = 생성기 화면 — tools/prompt-pack.cjs 가 쓴 저장값(<자리>-ui.json 의 storage)을 생성기에 넣고 열면
   화면의 지시문이 묶음의 <자리>-prompt.txt 와 글자 하나 다르지 않다(아홉 자리 모두). 파일로 읽고 그대로 제출해도 생성기를 쓴 것과 같다.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/prompt-pack-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), cp = require('node:child_process');
const { start } = require('./browser-harness.cjs');
const TOOL = path.join(__dirname, '..', 'tools/prompt-pack.cjs');
const AX = { overall_intensity: 'strong', skin_exposure: 'bold', action_level: 'mostly posed', source_influence: 'subtle', separates_preference: 'balanced' };
const CUTS = [
  { cut: 1, era: 'now', place: 'water_pool', act: 'sunbed', ofam: 'swimwear', item: 'classic_bikini', expr: 'confident', pose: '', orient: 'side', frame: 'three_quarter', lens: 'portrait85', aspect: '2:3', axes: AX },
  { cut: 2, era: 'in_pokemon', place: 'partner_garden', act: 'care_feeding', ofam: 'everyday', item: '', expr: 'gentle', pose: 'offering_food', orient: 'front', frame: 'three_quarter', lens: 'natural50', aspect: '2:3', axes: { ...AX, source_influence: 'strong' } },
  { cut: 3, era: 'now', place: 'street_cafe', act: 'read_book', ofam: 'everyday', item: '', expr: '', pose: '', orient: 'side', frame: 'three_quarter', lens: 'natural50', aspect: '2:3', axes: AX }];
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-pack-screen-')), dir = path.join(tmp, 'pack'), planFile = path.join(tmp, 'PLAN.json');
  fs.writeFileSync(planFile, JSON.stringify({ characters: [{ card: '피카츄', cuts: CUTS }] }));
  const run = (...a) => { const r = cp.spawnSync(process.execPath, [TOOL, ...a], { encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); };
  run('init', '피카츄', '--dir', dir, '--plan', planFile);
  const set = JSON.parse(fs.readFileSync(path.join(dir, 'settings.json'), 'utf8'));
  set.slots.light.params = { 'apparent age': '30s', hairstyle: 'bob' }; set.slots.light.headFeature = 'yellow ear headband';
  set.slots.heavy.scene = { ...set.slots.heavy.scene, expr: 'focused', pose: 'low_guard', frame: 'full_body', action: { category: 'melee', example: 'melee_counter', timing: 'windup' } };
  set.slots.mobility.formOverride = '왼쪽 어깨 패널만 개방'; set.slots.heavy_overdrive.custom = 'arcs of lightning circle her';
  set.slots.casual1.outfit = 'a white string bikini with a sheer sarong'; set.slots.casual1.why = { outfit: '계획의 옷 종류대로' };
  set.slots.casual3.scene = 'Rain streaks the cafe window.'; set.slots.casual3.camera = 'eye level'; set.slots.casual3.why = { scene: '장면 첫머리', camera: '눈높이로 고정' };
  fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify(set, null, 1));
  run('build', '--dir', dir);
  const h = await start();
  let checks = 0;
  try {
    for (const slot of Object.keys(set.slots)) {
      const ui = JSON.parse(fs.readFileSync(path.join(dir, slot + '-ui.json'), 'utf8')), want = fs.readFileSync(path.join(dir, slot + '-prompt.txt'), 'utf8').replace(/\n$/, '');
      const a = await h.open('prompt.html?mech=' + encodeURIComponent('피카츄'), { viewport: { width: 390, height: 844 }, store: ['pkm_prompt_v2', JSON.stringify(ui.storage)] });
      await a.page.waitForFunction(() => (document.getElementById('prompt-output') || {}).value?.length > 200, null, { timeout: 20000 });
      assert.equal(await a.page.locator('#prompt-output').inputValue(), want, slot + ' — 묶음과 생성기 화면의 지시문이 다르다');
      assert.deepEqual(a.errors, [], slot + ' 오류');
      await a.close(); checks++;
    }
    console.log('PASS 지시문 묶음 = 생성기 화면: 아홉 자리(① 외형·머리 직접 입력 · ② 연출 · ③ 폼 요청 · 폭주 셋 · 일상 셋 계획 값·옷·장면·카메라) — ' + checks + '가지');
  } finally { await h.stop(); fs.rmSync(tmp, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
