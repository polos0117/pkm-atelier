/* 생성기가 일상컷 계획기 주소를 받는다 — ?mech=<카드>&casual=<선택값>.
   값을 채우고 모두 잠그며, 장면·의상 칸은 비우고, 주소에서 casual 을 지운다(새로고침이 손본 값을 덮지 않게). 모르는 값은 비우고 알린다.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/casual-plan-screen.cjs */
const assert = require('node:assert/strict');
const { start } = require('./browser-harness.cjs');
const P = require('../lib/casual-plan.js');
const cut = { cat: 'swimwear', ex: 'classic_bikini', expr: 'confident', pose: 'contrapposto', orient: 'rear_3q', frame: 'three_quarter', lens: 'portrait85', aspect: '2:3',
  axes: { overall_intensity: 'strong', skin_exposure: 'bold', action_level: 'mostly posed', source_influence: 'subtle', separates_preference: 'balanced' } };
(async () => {
  const h = await start();
  try {
    let a = await h.open('prompt.html?' + P.generatorQuery('피카츄', cut), { viewport: { width: 390, height: 844 } }), p = a.page;
    await p.waitForSelector('#category');
    assert.equal(await p.getAttribute('#mode-casual', 'aria-pressed'), 'true', '일상컷으로 연다');
    const want = { category: 'swimwear', example: 'classic_bikini', expression: 'confident', pose: 'contrapposto', orientation: 'rear_3q', frame: 'three_quarter', lens: 'portrait85', aspect: '2:3' };
    for (const [id, v] of Object.entries(want)) {
      assert.equal(await p.locator('#' + id).inputValue(), v, id);
      assert.equal(await p.getAttribute('#lock-' + id, 'aria-pressed'), 'true', id + ' 잠김');
    }
    for (const [k, v] of Object.entries(cut.axes)) {
      assert.equal(await p.locator('#axis-' + k).inputValue(), v, k);
      assert.equal(await p.getAttribute('#lock-axis-' + k, 'aria-pressed'), 'true', k + ' 잠김');
    }
    assert.equal(await p.locator('#scene').inputValue(), '', '장면 칸은 비운다');
    assert.equal(await p.locator('#outfit').inputValue(), '', '의상 칸은 비운다');
    const status = await p.locator('.studio-status').textContent();
    assert(status.includes('계획기'), '채웠다고 알린다: ' + status);
    assert(!(await p.evaluate(() => location.search)).includes('casual='), '주소에서 casual 을 지웠다');
    const out = await p.locator('#prompt-output').inputValue();
    assert(out.includes('high-waisted bikini'), '고른 예시가 프롬프트에 들어간다');
    /* 새로고침 — 손본 장면 칸이 그대로 남는다(계획을 다시 채우지 않는다) */
    await p.locator('#scene').fill('Late afternoon, rinsing sand off her ankles at a beach tap.');
    await p.waitForTimeout(120);
    await p.reload(); await p.waitForSelector('#category');
    assert.equal(await p.locator('#scene').inputValue(), 'Late afternoon, rinsing sand off her ankles at a beach tap.', '새로고침이 손본 값을 덮지 않는다');
    assert.deepEqual(a.errors, []);
    await a.close();

    /* 모르는 값 — 비우고 알린다 */
    a = await h.open('prompt.html?' + P.generatorQuery('피카츄', { ...cut, pose: 'flying', ex: 'nope' }), { viewport: { width: 390, height: 844 } }); p = a.page;
    await p.waitForSelector('#category');
    const st2 = await p.locator('.studio-status').textContent();
    assert(st2.includes('pose') && st2.includes('ex'), '모르는 값을 알린다: ' + st2);
    assert.equal(await p.getAttribute('#lock-pose', 'aria-pressed'), 'false', '모르는 값은 잠그지 않는다');
    assert.deepEqual(a.errors, []);
    await a.close();
    console.log('PASS 생성기 ← 계획기 주소: 일상컷으로 열기 · 값 채우기와 잠금(세부 강도 다섯 포함) · 장면·의상 비우기 · 주소 지우기 · 새로고침이 덮지 않음 · 모르는 값은 비우고 알림');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
