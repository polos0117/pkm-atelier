/* 도감 넘기기 — 목록 자리 되돌리기 · 그림·카드 넘기기(화살표·방향키·밀기) · 휴대폰 뒤로 가기.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dex-nav.cjs
   그림 파일은 체크아웃에 없어 404 여도 된다 — 칸 높이는 aspect-ratio 로 서므로 굴린 자리는 그대로 잰다 */
const assert = require('node:assert/strict');
const { start, FOLD } = require('./browser-harness.cjs');
const top = p => p.evaluate(() => document.querySelector('.collection-scroll').scrollTop);
const name = p => p.$eval('.bar h2', e => e.textContent.trim());
const count = p => p.$eval('.big-count', e => e.textContent.trim()).catch(() => '');
const big = p => p.$eval('.big img', e => e.getAttribute('src'));
/* 손가락처럼 그 자리에서 누른다 — locator.click() 은 누르기 전에 칸을 화면 안으로 굴려서 "굴린 자리" 를 바꿔 버린다 */
const tap = (p, card) => p.evaluate(n => [...document.querySelectorAll('.grid > .cell')].find(x => x.dataset.card === n).click(), card);
/* 지금 화면 가운데쯤에 보이는 목록 칸 하나(그림이 있는 칸) */
async function visibleCell(p) {
  return p.evaluate(() => {
    const sc = document.querySelector('.collection-scroll').getBoundingClientRect();
    const c = [...document.querySelectorAll('.grid > .cell')].find(x => { const r = x.getBoundingClientRect(), m = (r.top + r.bottom) / 2; return m > sc.top && m < sc.bottom && x.querySelector('img'); });
    return c && c.dataset.card;
  });
}
(async () => {
  const h = await start();
  try {
    const a = await h.open('dex.html', { viewport: FOLD.cover, mobile: true }), p = a.page;
    await p.waitForSelector('.grid > .cell');
    const len0 = await p.evaluate(() => history.length);

    /* 1. 목록으로 — 열기 전에 굴려 둔 자리로 */
    await p.evaluate(() => { document.querySelector('.collection-scroll').scrollTop = 900; });
    await p.waitForTimeout(150);
    const was = await top(p);
    assert(was > 400, '목록이 굴러갔다: ' + was);
    const first = await visibleCell(p);
    await tap(p, first);
    await p.waitForSelector('.bar h2');
    assert.equal(await name(p), first, '누른 카드가 열린다');
    assert.equal(await p.evaluate(() => history.length), len0 + 1, '상세를 열면 기록이 한 칸 쌓인다');
    await p.click('.back');
    await p.waitForSelector('.grid > .cell');
    assert(Math.abs(await top(p) - was) <= 2, '목록으로 단추 — 굴린 자리로 돌아온다: ' + await top(p) + ' / ' + was);

    /* 2. 휴대폰 뒤로 가기 — 앞 화면이 아니라 목록으로, 자리도 그대로 */
    await tap(p, first);
    await p.waitForSelector('.bar h2');
    await p.goBack();
    await p.waitForSelector('.grid > .cell');
    assert(/dex\.html/.test(p.url()), '뒤로 가기는 도감 목록에 머문다: ' + p.url());
    assert.equal(await p.$('.bar h2'), null, '상세가 닫힌다');
    assert(Math.abs(await top(p) - was) <= 2, '뒤로 가기 — 굴린 자리로 돌아온다');

    /* 3. 큰 그림 넘기기 — 방향키로 이 카드의 그림을 차례로, 끝을 넘으면 다음 카드의 첫 그림 */
    await p.evaluate(() => { document.querySelector('.collection-scroll').scrollTop = 0; });
    const one = await visibleCell(p);
    await tap(p, one);
    await p.waitForSelector('.big-nav');
    const total = Number((await count(p)).split('/')[1]);
    assert(total > 1 && (await count(p)).startsWith('1 /'), '첫 그림부터, 몇 / 전체: ' + await count(p));
    const nextName = await p.$eval('#dex-card-next span', e => e.textContent.trim());
    const s1 = await big(p);
    await p.keyboard.press('ArrowRight');
    assert.equal(await count(p), '2 / ' + total, '→ 다음 그림');
    assert.notEqual(await big(p), s1, '큰 그림이 바뀐다');
    await p.keyboard.press('ArrowLeft');
    assert.equal(await count(p), '1 / ' + total, '← 앞 그림');
    for (let i = 1; i < total; i++) await p.keyboard.press('ArrowRight');
    assert.equal(await count(p), total + ' / ' + total, '마지막 그림');
    assert(await p.$eval('.big-next', e => e.classList.contains('to-card')), '끝에서는 화살표가 다음 카드로 간다고 보인다');
    await p.keyboard.press('ArrowRight');
    await p.waitForFunction(n => document.querySelector('.bar h2').textContent.trim() === n, nextName);
    assert((await count(p)).startsWith('1 /'), '다음 카드는 첫 그림부터');
    /* 앞 카드로 넘어가면 그 마지막 그림 */
    await p.keyboard.press('ArrowLeft');
    await p.waitForFunction(n => document.querySelector('.bar h2').textContent.trim() === n, one);
    assert.equal(await count(p), total + ' / ' + total, '앞 카드는 마지막 그림부터');

    /* 4. 밀기 — 손가락이 왼쪽으로 가면 다음, 단추를 누르면 그 단추 몫 */
    const here = await name(p), c0 = await count(p);
    const box = await p.$eval('.big', e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await p.evaluate(({ x, y }) => {
      const el = document.querySelector('.big img'), o = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true };
      el.dispatchEvent(new PointerEvent('pointerdown', { ...o, clientX: x + 60, clientY: y }));
      dispatchEvent(new PointerEvent('pointerup', { ...o, clientX: x - 60, clientY: y + 4 }));
    }, box);
    const c1 = await count(p);
    assert(c1 !== c0 || await name(p) !== here, '밀면 넘어간다: ' + c0 + ' → ' + c1);

    /* 5. 카드 줄 — 다음 카드 단추, 그리고 뒤로 가기 한 번이면 목록(넘긴 만큼 기록이 쌓이지 않는다). 마지막에 본 카드 칸이 보인다 */
    await p.click('#dex-card-next');
    const seen = await name(p);
    await p.click('#dex-card-next');
    const last = await name(p);
    assert.notEqual(last, seen, '다음 카드 단추');
    assert.equal(await p.evaluate(() => history.length), len0 + 1, '카드를 넘겨도 기록은 한 칸');
    await p.goBack();
    await p.waitForSelector('.grid > .cell');
    const shown = await p.evaluate(n => {
      const sc = document.querySelector('.collection-scroll').getBoundingClientRect();
      const c = [...document.querySelectorAll('.grid > .cell')].find(x => x.dataset.card === n), r = c && c.getBoundingClientRect();
      return !!r && r.bottom > sc.top && r.top < sc.bottom;
    }, last);
    assert(shown, '돌아오면 마지막에 본 카드 칸이 화면에 있다');
    /* 목록에서 한 번 더 뒤로 가면 그때는 도감을 떠난다 — 남은 기록 칸이 없다 */
    assert.equal(await p.evaluate(() => history.length), len0 + 1, '기록 칸 수는 열 때 쌓은 그대로(앞으로 가기 자리)');

    assert.deepEqual(a.errors, [], '화면 오류 없음');
    await a.close();
    console.log('PASS 도감 넘기기: 목록 자리 되돌리기 · 그림 넘기기(방향키·밀기) · 카드 넘기기 · 휴대폰 뒤로 가기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
