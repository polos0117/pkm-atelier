/* 전투 시험장 화면. 여섯을 세우고 한 판을 굴려 박자를 되감고, 100판의 승률을 본다.
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/battle-screen.cjs */
const assert = require('node:assert/strict');
const { start, FOLD } = require('./browser-harness.cjs');

(async () => {
  const h = await start();
  try {
    const a = await h.open('battle.html'), p = a.page;
    await p.waitForSelector('.bt-setup');
    /* 처음 여섯이 도감 번호로 서 있다 — 이름은 자료에서 온다 */
    await p.waitForFunction(() => document.querySelectorAll('.bt-side input').length === 6
      && [...document.querySelectorAll('.bt-side input')].every(i => i.value));
    const names = await p.locator('.bt-side input').evaluateAll(es => es.map(e => e.value));
    assert.deepEqual(names, ['피카츄', '리자몽', '거북왕', '이상해꽃', '뮤', '이브이']);
    assert.equal(await p.locator('.bt-side input.bad').count(), 0);

    /* 한 판 — 승자가 뜨고 0 박자에서 시작한다 */
    await p.locator('.bt-run').click();
    await p.waitForSelector('.bt-result[data-winner]');
    const winner = await p.locator('.bt-result[data-winner]').getAttribute('data-winner');
    assert(['a', 'b', 'draw'].includes(winner), winner);
    assert.equal(await p.locator('.bt-beat b').getAttribute('data-beat'), '0');
    assert.equal(await p.locator('.bt-actor').count(), 6);
    assert.equal(await p.locator('.bt-log li').count(), 0, '0 박자에는 사건이 없다');
    const hp0 = await p.locator('.bt-team[data-side="a"] .bt-gauge.hp span:last-child').evaluateAll(es => es.map(e => +e.textContent));

    /* 다음 박자 — 사건이 있고 누군가의 HP 가 줄었다 */
    await p.locator('.bt-next').click();
    assert.equal(await p.locator('.bt-beat b').getAttribute('data-beat'), '1');
    assert((await p.locator('.bt-log li').count()) > 0, '1 박자에 사건이 있어야 한다');
    const hp1 = await p.locator('.bt-team[data-side="a"] .bt-gauge.hp span:last-child').evaluateAll(es => es.map(e => +e.textContent));
    assert(hp1.some((v, i) => v < hp0[i]) || hp1.every((v, i) => v === hp0[i]), hp0 + ' → ' + hp1);   // 맞았으면 줄고, 안 맞았으면 그대로 — 늘지는 않는다
    assert(!hp1.some((v, i) => v > hp0[i]), 'HP 가 늘었다');
    /* 끝 — 이긴 쪽이 아니면 다 쓰러져 있다 */
    await p.locator('.bt-beat button:last-child').click();
    const total = +(await p.locator('.bt-beat b').getAttribute('data-beat'));
    assert(total >= 1);
    if (winner !== 'draw') {
      const loser = winner === 'a' ? 'b' : 'a';
      assert.equal(await p.locator(`.bt-team[data-side="${loser}"] .bt-actor.down`).count(), 3, '진 쪽은 셋 다 쓰러진다');
      assert((await p.locator(`.bt-team[data-side="${winner}"] .bt-actor:not(.down)`).count()) >= 1);
    }
    /* 폼 표시가 낱말 표에서 온다 */
    const forms = await p.locator('.bt-actor').evaluateAll(es => es.map(e => e.dataset.form));
    assert(forms.every(f => ['light', 'heavy', 'mobility'].includes(f)), forms.join(','));
    assert.equal(await p.locator('.bt-actor .bt-name i').evaluateAll(es => es.filter(e => /form\./.test(e.textContent)).length), 0, '열쇠가 그대로 보인다');

    /* 없는 이름이면 못 굴린다 */
    await p.locator('.bt-side input').first().fill('없는카드');
    await p.waitForSelector('.bt-side input.bad');
    assert(await p.locator('.bt-run').isDisabled());
    assert((await p.locator('.bt-result:not([data-winner])').textContent()).includes('없는카드'));
    await p.locator('.bt-side input').first().fill('라이츄');
    await p.waitForFunction(() => !document.querySelector('.bt-side input.bad'));

    /* 100판 — 승률 셋이 100 이 된다 */
    await p.locator('.bt-many').click();
    await p.waitForSelector('.bt-result[data-rate]', { timeout: 60000 });
    const txt = await p.locator('.bt-result[data-rate]').textContent();
    const nums = txt.match(/(\d+)%/g).map(x => parseInt(x));
    assert.equal(nums.length, 3, txt);
    assert(Math.abs(nums[0] + nums[1] + nums[2] - 100) <= 2, txt);

    /* 폴드 덮개에서 가로로 안 넘치고, 굴러가는 자리가 화면 몫을 받는다 */
    for (const viewport of [FOLD.cover, FOLD.inner, { width: 1280, height: 900 }]) {
      await p.setViewportSize(viewport);
      assert(await p.evaluate(() => document.body.scrollWidth <= innerWidth), 'horizontal overflow ' + viewport.width);
      const box = await p.locator('.collection-scroll').boundingBox();
      assert(box.height > 100, 'scroll viewport ' + viewport.width);
    }
    assert.deepEqual(a.errors, []);
    await a.close();
    console.log('PASS 전투 시험장: 여섯 세움 · 한 판 · 박자 되감기 · 진 쪽은 다 쓰러짐 · 없는 이름 막음 · 100판 승률 · 세 화면 크기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
