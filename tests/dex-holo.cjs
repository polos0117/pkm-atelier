/* 도감 크게 보기 홀로 효과(lib/holo.js · PixiJS, 2026-11-12) — node tests/dex-holo.cjs (CDN 이 막힌 곳은 ESM_DIR 에 preact · htm · pixi.js@8.19.0 사본)
   - 크게 보기를 열면 그림이 그려진 칸(object-fit: contain 안쪽)에 꼭 맞는 캔버스 하나가 screen 으로 얹히고, 그림이 실제로 달라진다
   - 끄면 캔버스가 없어지고 다시 열어도 꺼진 채(기억), 원본 크기에선 없다, 넘겨도 캔버스는 하나 그대로
   - 움직임 줄이기면 혼자 지나가지 않는다(가만두면 그대로), 오류 없음 */
const assert = require('node:assert/strict');
const { start } = require('./browser-harness.cjs');
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
  '<stop offset="0" stop-color="#e8e4dc"/><stop offset=".5" stop-color="#8a96a8"/><stop offset="1" stop-color="#3a3f4a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>';
const art = ctx => ctx.route(/\.(webp|png)(\?.*)?$/, r => r.fulfill({ contentType: 'image/svg+xml', headers: { 'Access-Control-Allow-Origin': '*' }, body: SVG }));
async function openZoom(p) {
  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.locator('.grid>.cell').first().click();
  await p.locator('.big .zoom').click();
  await p.locator('.zoom-layer img').evaluate(i => i.decode());
}
const shot = p => p.locator('.zoom-body').screenshot({ animations: 'disabled' });
(async () => {
  const h = await start(); let n = 0;
  try {
    const a = await h.open('dex.html', { viewport: { width: 1000, height: 900 } }), p = a.page;
    await art(a.ctx); await openZoom(p);
    const cv = p.locator('.zoom-layer canvas.holo-layer');
    await cv.waitFor({ timeout: 20000 });
    assert.equal(await p.locator('.zoom-holo').getAttribute('aria-pressed'), 'true', '처음엔 켜짐'); n++;
    /* 그림이 그려진 칸에 꼭 맞는다 — 2:3 그림이 넓은 상자 가운데 */
    const fit = await p.evaluate(() => { const i = document.querySelector('.zoom-body img'), c = document.querySelector('canvas.holo-layer'), b = i.getBoundingClientRect(), r = c.getBoundingClientRect();
      const s = Math.min(b.width / i.naturalWidth, b.height / i.naturalHeight), w = i.naturalWidth * s, hh = i.naturalHeight * s;
      return { dw: Math.abs(r.width - w), dh: Math.abs(r.height - hh), dx: Math.abs(r.left - (b.left + (b.width - w) / 2)), dy: Math.abs(r.top - (b.top + (b.height - hh) / 2)), blend: getComputedStyle(c).mixBlendMode, pe: getComputedStyle(c).pointerEvents }; });
    assert(fit.dw < 2 && fit.dh < 2 && fit.dx < 2 && fit.dy < 2, '그림 칸에 꼭 맞는다 ' + JSON.stringify(fit));
    assert.equal(fit.blend, 'screen'); assert.equal(fit.pe, 'none', '넘기기 · 누르기를 가리지 않는다'); n += 2;
    /* 그림이 실제로 달라진다 — 마우스를 옮기면 빛도 옮겨 간다 */
    const box = await cv.boundingBox();
    await p.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.2); await p.waitForTimeout(700);
    const on1 = await shot(p);
    await p.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.85); await p.waitForTimeout(700);
    const on2 = await shot(p);
    assert(!on1.equals(on2), '마우스를 따라 빛이 움직인다'); n++;
    await p.locator('.zoom-holo').click();
    await p.locator('canvas.holo-layer').waitFor({ state: 'detached', timeout: 5000 });   /* 정리는 화면을 그린 뒤(effect) */
    assert.equal(await p.locator('canvas.holo-layer').count(), 0, '끄면 캔버스가 없다');
    assert(!(await shot(p)).equals(on2), '켠 그림과 끈 그림이 다르다');
    assert.equal(await p.evaluate(() => localStorage.getItem('atelier_holo_v1')), '0', '끈 것을 기억'); n += 3;
    await p.keyboard.press('Escape'); await p.locator('.big .zoom').click(); await p.waitForTimeout(800);
    assert.equal(await p.locator('canvas.holo-layer').count(), 0, '다시 열어도 꺼진 채'); n++;
    await p.locator('.zoom-holo').click(); await cv.waitFor({ timeout: 20000 });
    await p.locator('.zoom-open').click();
    await p.locator('canvas.holo-layer').waitFor({ state: 'detached', timeout: 5000 });
    assert.equal(await p.locator('canvas.holo-layer').count(), 0, '원본 크기에선 없다');
    assert.equal(await p.locator('.zoom-holo').isDisabled(), true); n += 2;
    await p.locator('.zoom-open').click(); await cv.waitFor({ timeout: 20000 });
    if (await p.locator('.zoom-next').isEnabled()) {
      await p.keyboard.press('ArrowRight'); await p.waitForTimeout(600);
      assert.equal(await p.locator('canvas.holo-layer').count(), 1, '넘겨도 캔버스 하나'); n++;
    }
    assert.deepEqual(a.errors, [], '오류'); n++;
    await a.close();
    /* 움직임 줄이기 — 손대지 않으면 그대로 */
    const b = await h.open('dex.html', { viewport: { width: 1000, height: 900 }, reducedMotion: 'reduce' }), q = b.page;
    await art(b.ctx); await openZoom(q);
    await q.locator('canvas.holo-layer').waitFor({ timeout: 20000 }); await q.waitForTimeout(500);
    const r1 = await shot(q); await q.waitForTimeout(1200); const r2 = await shot(q);
    assert(r1.equals(r2), '움직임 줄이기면 혼자 지나가지 않는다');
    assert.deepEqual(b.errors, [], '오류'); n += 2;
    await b.close();
    console.log('PASS 도감 홀로 효과: ' + n + '가지 — 그림 칸에 꼭 맞음 · screen · 마우스를 따라감 · 끄기 기억 · 원본 크기엔 없음 · 넘기기 · 움직임 줄이기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
