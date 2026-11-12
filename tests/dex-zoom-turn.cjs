/* 도감 크게 보기 넘기기 전환(2026-11-12) — node tests/dex-zoom-turn.cjs (CDN 이 막힌 곳은 ESM_DIR)
   - 넘기면 나가는 그림의 사본(.am-ghost)이 그림 칸에 겹쳐 흐려지고, 새 그림은 넘긴 쪽에서 들어온다(→ 는 오른쪽에서, ← 는 왼쪽에서)
   - 끝나면 사본이 없어지고 새 그림은 다 보인다. 켄 번스 · 입자는 없다
   - 움직임 줄이기면 사본 없이 바로 바뀐다, 오류 없음 */
const assert = require('node:assert/strict');
const { start } = require('./browser-harness.cjs');
const svg = c => '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200"><rect width="100%" height="100%" fill="' + c + '"/></svg>';
let k = 0;
const art = ctx => ctx.route(/\.(webp|png)(\?.*)?$/, r => r.fulfill({ contentType: 'image/svg+xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: svg(['#6a8', '#a86', '#68a', '#a6a'][k++ % 4]) }));
async function openZoom(p) {
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.locator('.grid>.cell').first().click();
  await p.locator('.big .zoom').click();
  await p.locator('.zoom-layer img').evaluate(i => i.decode());
}
/* 새 그림의 첫 움직임 — 들어오는 쪽(translateX 부호) */
const enterFrom = p => p.evaluate(() => { const a = document.querySelector('.zoom-body>img').getAnimations()[0]; if (!a) return null;
  const t = a.effect.getKeyframes()[0].transform || ''; const m = t.match(/translateX\((-?[\d.]+)px\)/); return m ? Math.sign(+m[1]) : null; });
(async () => {
  const h = await start(); let n = 0;
  try {
    const a = await h.open('dex.html', { viewport: { width: 1000, height: 900 } }), p = a.page;
    await art(a.ctx); await openZoom(p);
    assert.equal(await p.locator('.zoom-body .am-ghost').count(), 0, '열 때는 전환 없음');
    assert.equal(await p.locator('.zoom-body>img').evaluate(i => i.getAnimations().length), 0, '켄 번스 없음'); n += 2;
    if (!(await p.locator('.zoom-next').isEnabled())) throw new Error('넘길 그림이 없다(도감 자료)');
    const before = await p.locator('.zoom-body>img').getAttribute('src');
    await p.keyboard.press('ArrowRight');
    await p.waitForFunction(() => document.querySelectorAll('.zoom-body .am-ghost').length === 1 && document.querySelector('.zoom-body>img').getAnimations().length > 0, null, { timeout: 3000 });
    assert.notEqual(await p.locator('.zoom-body>img').getAttribute('src'), before, '그림이 바뀌었다');
    assert.equal(await p.locator('.zoom-body .am-ghost').evaluate(g => g.style.backgroundImage.includes('url(')), true, '사본은 나가는 그림');
    assert.equal(await enterFrom(p), 1, '→ 는 오른쪽에서 들어온다'); n += 3;
    /* 사본이 그림 칸에 겹친다 */
    /* 들어오고 나가는 움직임(transform)을 뺀 자리끼리 — offset 값은 transform 을 안 탄다 */
    const fit = await p.evaluate(() => { const g = document.querySelector('.zoom-body .am-ghost'), i = document.querySelector('.zoom-body>img');
      return Math.max(Math.abs(g.offsetLeft - i.offsetLeft), Math.abs(g.offsetTop - i.offsetTop), Math.abs(g.offsetWidth - i.offsetWidth), Math.abs(g.offsetHeight - i.offsetHeight)); });
    assert(fit < 2, '사본이 그림 칸에 겹친다 ' + fit); n++;
    await p.locator('.zoom-body .am-ghost').waitFor({ state: 'detached', timeout: 3000 });
    assert.equal(await p.locator('.zoom-body>img').evaluate(i => +getComputedStyle(i).opacity), 1, '끝나면 새 그림이 다 보인다'); n++;
    await p.keyboard.press('ArrowLeft');
    await p.waitForFunction(() => document.querySelector('.zoom-body>img').getAnimations().length > 0, null, { timeout: 3000 });
    assert.equal(await enterFrom(p), -1, '← 는 왼쪽에서 들어온다'); n++;
    await p.locator('.zoom-body .am-ghost').waitFor({ state: 'detached', timeout: 3000 });
    /* 빠르게 여러 번 넘겨도 사본은 하나만 남는다 */
    for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(100);
    assert(await p.locator('.zoom-body .am-ghost').count() <= 1, '빠르게 넘겨도 사본 하나'); n++;
    await p.locator('.zoom-body .am-ghost').waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});
    assert.equal(await p.locator('.zoom-body .am-ghost').count(), 0, '다 끝나면 사본 없음'); n++;
    assert.deepEqual(a.errors, [], '오류'); n++;
    await a.close();
    const b = await h.open('dex.html', { viewport: { width: 1000, height: 900 }, reducedMotion: 'reduce' }), q = b.page;
    await art(b.ctx); await openZoom(q);
    await q.keyboard.press('ArrowRight'); await q.waitForTimeout(150);
    assert.equal(await q.locator('.zoom-body .am-ghost').count(), 0, '움직임 줄이기 — 사본 없음');
    assert.equal(await q.locator('.zoom-body>img').evaluate(i => +getComputedStyle(i).opacity), 1, '움직임 줄이기 — 바로 다 보인다');
    assert.deepEqual(b.errors, [], '오류'); n += 3;
    await b.close();
    console.log('PASS 도감 크게 보기 넘기기 전환: ' + n + '가지 — 나가는 그림 사본 · 넘긴 쪽에서 들어옴 · 끝나면 정리 · 빠르게 넘겨도 하나 · 움직임 줄이기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
