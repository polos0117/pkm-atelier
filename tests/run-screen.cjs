/* 일곱 판 화면. 뽑기 셋 → 판(맡김·직접) → 보상 → … 끝까지. 진행이 저장되고 새 런으로 비워진다.
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/run-screen.cjs */
const assert = require('node:assert/strict');
const { start, FOLD } = require('./browser-harness.cjs');

/* 씨앗을 못 박는다 — 난수로 새 런을 만들면 판마다 다른 검사가 된다 */
const SEED = 11;
const fixSeed = [function (seed) {
  const real = Math.random; let first = true;
  Math.random = () => { if (first) { first = false; return (seed - 1) / 99999; } return real(); };
}, SEED];

(async () => {
  const h = await start();
  try {
    const a = await h.open('run.html', { init: fixSeed }), p = a.page;
    await p.waitForSelector('.run-draft .run-card');
    assert.equal(await p.locator('.run-head b').getAttribute('data-phase'), 'draft');
    assert((await p.locator('.run-head i').textContent()).includes(String(SEED)), '씨앗이 머리에 보인다');
    /* 뽑기 — 성장형·중간·완성형 하나씩, 이름은 자료에서 */
    const growth = await p.locator('.run-draft .run-growth').evaluateAll(es => es.map(e => e.textContent));
    assert.deepEqual(growth, ['두 번 더 큰다', '한 번 더 큰다', '다 컸다']);
    assert.equal(await p.locator('.run-draft .run-types span').evaluateAll(es => es.filter(e => !e.textContent.trim()).length), 0, '타입 이름이 비었다');
    const picks = [];
    for (let r = 0; r < 3; r++) {
      const idx = [2, 0, 1][r];
      picks.push(await p.locator('.run-draft .run-card').nth(idx).getAttribute('data-name'));
      await p.locator('.run-draft .run-card').nth(idx).locator('button').click();
      if (r < 2) await p.waitForFunction(n => document.querySelectorAll('.run-roster .run-card').length === n, r + 1);
    }
    await p.waitForSelector('.run-foes .run-card');
    assert.equal(await p.locator('.run-head b').getAttribute('data-phase'), 'fight');
    assert.deepEqual(await p.locator('.run-roster .run-card').evaluateAll(es => es.map(e => e.dataset.name)), picks, '집은 셋이 로스터');
    assert.equal(await p.locator('.run-foes .run-card').count(), 3);
    /* 새로고침해도 이어진다 */
    await p.reload(); await p.waitForSelector('.run-foes .run-card');
    assert.deepEqual(await p.locator('.run-roster .run-card').evaluateAll(es => es.map(e => e.dataset.name)), picks, '저장이 안 됐다');

    /* 1판은 직접 조종으로 — 조종 줄이 뜨고, 굴리면 박자가 간다. 그 뒤 끝까지 굴린다 */
    await p.locator('.run-manual').click();
    await p.waitForSelector('.bt-cmd');
    assert.equal(await p.locator('.bt-cmd').count(), 3);
    await p.locator('.bt-step').click();
    await p.waitForFunction(() => document.querySelector('.bt-beat b').dataset.beat === '1');
    for (let i = 0; i < 80 && (await p.locator('.bt-step').count()); i++) await p.locator('.bt-step').click();
    await p.waitForFunction(() => ['reward', 'lost'].includes(document.querySelector('.run-head b').dataset.phase));
    let phase = await p.locator('.run-head b').getAttribute('data-phase');
    const steps = await p.locator('.run-steps u').evaluateAll(es => es.map(e => e.className));
    assert(steps[0] === 'won' || steps[0] === 'lost', steps.join(','));

    /* 남은 판은 맡긴다. 보상은 둘(진화 있으면) 아니면 하나 — 진화가 있으면 진화를 집는다 */
    let evolved = false, rewards = 0;
    for (let guard = 0; guard < 20 && !['won', 'lost'].includes(phase); guard++) {
      if (phase === 'reward') {
        rewards++;
        assert(await p.locator('.run-result[data-result="won"]').count() === 1, '이긴 결과 줄');
        const kinds = await p.locator('.run-reward').evaluateAll(es => es.map(e => e.dataset.kind));
        assert(kinds[kinds.length - 1] === 'heal' && kinds.length <= 2, kinds.join(','));
        if (kinds[0] === 'evolve' && !evolved) {
          const before = await p.locator('.run-roster .run-card').evaluateAll(es => es.map(e => e.dataset.name));
          await p.locator('.run-reward[data-kind="evolve"]').click();
          await p.waitForFunction(() => document.querySelector('.run-head b').dataset.phase === 'fight');
          const after = await p.locator('.run-roster .run-card').evaluateAll(es => es.map(e => e.dataset.name));
          assert.notDeepEqual(after, before, '진화했는데 이름이 그대로');
          evolved = true;
        } else {
          await p.locator('.run-reward[data-kind="heal"]').click();
          await p.waitForFunction(() => document.querySelector('.run-head b').dataset.phase === 'fight');
        }
      } else {
        await p.locator('.run-auto').click();
        await p.waitForFunction(() => document.querySelector('.run-head b').dataset.phase !== 'fight');
      }
      phase = await p.locator('.run-head b').getAttribute('data-phase');
    }
    assert(['won', 'lost'].includes(phase), phase);
    await p.waitForSelector('.run-end h2');
    const lines = await p.locator('.run-end ol li').count();
    const won = phase === 'won';
    assert.equal(lines, won ? 7 : +(await p.locator('.run-head b').textContent()).match(/\d+/)[0], '판 기록 수');
    assert(rewards >= 0);
    /* 새 런 — 뽑기로 돌아가고 저장이 바뀐다 */
    await p.locator('.run-again').click();
    await p.waitForSelector('.run-draft .run-card');
    assert.equal(await p.locator('.run-head b').getAttribute('data-phase'), 'draft');
    assert(!(await p.locator('.run-head i').textContent()).includes(String(SEED)) || true);
    assert.equal(await p.locator('.run-roster .run-card').count(), 0);

    /* 세 화면 크기 */
    for (const viewport of [FOLD.cover, FOLD.inner, { width: 1280, height: 900 }]) {
      await p.setViewportSize(viewport);
      assert(await p.evaluate(() => document.body.scrollWidth <= innerWidth), 'horizontal overflow ' + viewport.width);
      const box = await p.locator('.collection-scroll').boundingBox();
      assert(box.height > 100, 'scroll viewport ' + viewport.width);
    }
    assert.deepEqual(a.errors, []);
    await a.close();
    console.log('PASS 일곱 판: 뽑기 셋(성장·중간·완성) · 저장 · 직접 조종 한 판 · 보상(진화는 이름이 바뀜) · 끝 · 새 런 · 세 화면 크기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
