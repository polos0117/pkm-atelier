/* 생성기가 일상컷 계획기 주소를 받는다 — ?mech=<카드>&casual=<선택값>.
   값을 채우고 모두 잠그며, 장면·의상 칸은 비우고, 주소에서 casual 을 지운다(새로고침이 손본 값을 덮지 않게). 모르는 값은 비우고 알린다.
   2026-10-29 트리 길(시대·장소·하는 일·의상 계열·옷) — 예전 주소(갈래·예시)도 변환표로 받는다.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/casual-plan-screen.cjs */
const assert = require('node:assert/strict');
const { start } = require('./browser-harness.cjs');
const P = require('../lib/casual-plan.js');
const cut = { era: 'now', place: 'water_pool', act: 'sunbed', ofam: 'swimwear', item: 'classic_bikini', expr: 'confident', pose: '', orient: 'side', frame: 'three_quarter', lens: 'portrait85', aspect: '2:3',
  axes: { overall_intensity: 'strong', skin_exposure: 'bold', action_level: 'mostly posed', source_influence: 'subtle', separates_preference: 'balanced' } };
(async () => {
  const h = await start();
  try {
    let a = await h.open('prompt.html?' + P.generatorQuery('피카츄', cut), { viewport: { width: 390, height: 844 } }), p = a.page;
    await p.waitForSelector('#place');
    assert.equal(await p.getAttribute('#mode-casual', 'aria-pressed'), 'true', '일상컷으로 연다');
    const want = { era: 'now', place: 'water_pool', act: 'sunbed', ofam: 'swimwear', item: 'classic_bikini', expression: 'confident', orientation: 'side', frame: 'three_quarter', lens: 'portrait85', aspect: '2:3' };
    for (const [id, v] of Object.entries(want)) {
      assert.equal(await p.locator('#' + id).inputValue(), v, id);
      assert.equal(await p.getAttribute('#lock-' + id, 'aria-pressed'), 'true', id + ' 잠김');
    }
    assert.equal(await p.getAttribute('#lock-pose', 'aria-pressed'), 'true', '자세 「하는 일대로」 도 잠근다');
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
    assert(out.includes('high-waisted bikini'), '고른 옷이 프롬프트에 들어간다');
    /* 새로고침 — 손본 장면 칸이 그대로 남는다(계획을 다시 채우지 않는다) */
    await p.locator('#scene').fill('Late afternoon, rinsing sand off her ankles at a beach tap.');
    await p.waitForTimeout(120);
    await p.reload(); await p.waitForSelector('#place');
    assert.equal(await p.locator('#scene').inputValue(), 'Late afternoon, rinsing sand off her ankles at a beach tap.', '새로고침이 손본 값을 덮지 않는다');
    assert.deepEqual(a.errors, []);
    await a.close();

    /* 모르는 값·안 쓰는 값 — 비우고 알린다 */
    a = await h.open('prompt.html?' + P.generatorQuery('피카츄', { ...cut, act: 'flying', orient: 'back' }), { viewport: { width: 390, height: 844 } }); p = a.page;
    await p.waitForSelector('#place');
    const st2 = await p.locator('.studio-status').textContent();
    assert(st2.includes('act') && st2.includes('orient'), '모르는 값을 알린다: ' + st2);
    assert.equal(await p.getAttribute('#lock-act', 'aria-pressed'), 'false', '모르는 값은 잠그지 않는다');
    assert.deepEqual(a.errors, []);
    await a.close();

    /* 예전 주소(갈래·예시) — 변환표로 같은 길 */
    const old = 'mech=' + encodeURIComponent('피카츄') + '&casual=' + encodeURIComponent(JSON.stringify({ cat: 'partner_care', ex: 'care_feeding', expr: 'calm', pose: 'offering_food', orient: 'front', frame: 'three_quarter', lens: 'natural50', aspect: '2:3', axes: {} }));
    a = await h.open('prompt.html?' + old, { viewport: { width: 390, height: 844 } }); p = a.page;
    await p.waitForSelector('#place');
    assert.equal(await p.locator('#place').inputValue(), 'partner_garden'); assert.equal(await p.locator('#act').inputValue(), 'care_feeding');
    assert((await p.locator('#prompt-output').inputValue()).includes('exactly one Pokémon companion'), '동료 줄');
    assert.deepEqual(a.errors, []);
    await a.close();
    console.log('PASS 생성기 ← 계획기 주소: 일상컷으로 열기 · 트리 길 채우기와 잠금(세부 강도 다섯 포함) · 장면·의상 비우기 · 주소 지우기 · 새로고침이 덮지 않음 · 모르는 값은 비우고 알림 · 예전 주소');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
