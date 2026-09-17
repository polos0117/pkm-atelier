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

    /* 직접 조종 — 박자 사이에 멈춰서 고르고 굴린다 */
    await p.locator('.bt-side input').first().fill('피카츄');
    await p.locator('.bt-play input').check();
    await p.locator('.bt-run').click();
    await p.waitForSelector('.bt-cmd');
    assert.equal(await p.locator('.bt-beat b').getAttribute('data-beat'), '0');
    assert.equal(await p.locator('.bt-cmd').count(), 3, '아군 셋에 조종 줄');
    assert.equal(await p.locator('.bt-team[data-side="b"] .bt-cmd').count(), 0, '상대는 못 고른다');
    /* 처음엔 폼 셋 중 지금 폼은 꺼져 있고, 개방은 Drive 가 안 차 꺼져 있다 */
    const first = p.locator('.bt-cmd').first();
    assert(await first.locator('button[data-cmd="open"]').isDisabled(), '개방은 Drive 30 으로는 못 연다');
    assert.equal(await first.locator('button[data-cmd]:disabled').count(), 2, '지금 폼 + 개방');
    await first.locator('button[data-cmd="attack"]').click();
    await first.locator('select').selectOption('뮤');
    await p.locator('.bt-cmd').nth(2).locator('button[data-cmd="heavy"]').click();
    await p.locator('.bt-step').click();
    await p.waitForFunction(() => document.querySelector('.bt-beat b').dataset.beat === '1');
    const lines = await p.locator('.bt-log li').evaluateAll(es => es.map(e => e.textContent));
    assert(lines.some(t => t.startsWith('피카츄 → 뮤')), lines.join(' | '));
    /* 그림 — 등록된 피카츄는 폼 그림이 서고, 폼을 바꾸면 그림이 바뀐다. 없는 카드는 자리만 */
    const src = async () => decodeURIComponent(await p.locator('.bt-actor[data-name="피카츄"] img.bt-pic').getAttribute('src'));
    const form0 = await p.locator('.bt-actor[data-name="피카츄"]').getAttribute('data-form');
    assert((await src()).includes('피카츄_' + form0 + '_'), await src());
    assert.equal(await p.locator('.bt-actor[data-name="리자몽"] .bt-pic.none').count(), 1, '그림 없는 카드는 자리만');
    assert.equal(await p.locator('.bt-actor[data-name="리자몽"] img').count(), 0);
    const other = ['light', 'heavy', 'mobility'].find(f => f !== form0);
    const pikaCmd = p.locator('.bt-cmd[data-name="피카츄"]');
    if (!(await pikaCmd.locator(`button[data-cmd="${other}"]`).isDisabled())) {
      await pikaCmd.locator(`button[data-cmd="${other}"]`).click();
      await p.locator('.bt-step').click();
      await p.waitForFunction(f => document.querySelector('.bt-actor[data-name="피카츄"]').dataset.form === f, other);
      assert((await src()).includes('피카츄_' + other + '_'), await src());
    }
    assert(lines.some(t => t.startsWith('거북왕 → 중장')), lines.join(' | '));
    assert.equal(await p.locator('.bt-cmd').nth(2).locator('button[data-cmd="heavy"]').isDisabled(), true, '이제 중장이라 중장 단추는 꺼진다');
    /* 끝까지 굴리면 결과가 뜨고 되감기로 넘어간다 */
    for (let i = 0; i < 60 && (await p.locator('.bt-step').count()); i++) await p.locator('.bt-step').click();
    await p.waitForSelector('.bt-result[data-winner]');
    await p.waitForSelector('.bt-next');
    assert.equal(await p.locator('.bt-cmd').count(), 0);

    /* 폴드 덮개에서 가로로 안 넘치고, 굴러가는 자리가 화면 몫을 받는다 */
    for (const viewport of [FOLD.cover, FOLD.inner, { width: 1280, height: 900 }]) {
      await p.setViewportSize(viewport);
      assert(await p.evaluate(() => document.body.scrollWidth <= innerWidth), 'horizontal overflow ' + viewport.width);
      const box = await p.locator('.collection-scroll').boundingBox();
      assert(box.height > 100, 'scroll viewport ' + viewport.width);
    }
    assert.deepEqual(a.errors, []);
    await a.close();
    console.log('PASS 전투 시험장: 여섯 세움 · 한 판 · 박자 되감기 · 진 쪽은 다 쓰러짐 · 없는 이름 막음 · 100판 승률 · 직접 조종(대상·폼 예약, 단추는 엔진이 켜고 끔) · 세 화면 크기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
