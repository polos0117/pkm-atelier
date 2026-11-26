/* 도감 크게 보기 넘기기 전환(2026-11-12) — node tests/dex-zoom-turn.cjs (CDN 이 막힌 곳은 ESM_DIR)
   - 넘기면 나가는 그림의 사본(.am-ghost)이 그림 칸에 겹쳐 흐려지고, 새 그림은 넘긴 쪽에서 들어온다(→ 는 오른쪽에서, ← 는 왼쪽에서)
   - 끝나면 사본이 없어지고 새 그림은 다 보인다. 켄 번스 · 입자는 없다
   - 움직임 줄이기면 사본 없이 바로 바뀐다, 오류 없음
   - 일상컷 한 줄(lib/casual-note.js, 2026-11-17) — fixture 색인으로 목록 · 상세 칸엔 없음 · 상세 큰 그림 · 크게 보기에서만 · 필수 · 코스프레 · 자유 설계 · 없는 컷 */
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
    /* 일상컷 한 줄(2026-11-17 「상세보기나 크게보기 일 때만 보이도록」) — fixture 색인: 목록 · 상세의 일상컷 칸엔 없음(목록을 그릴 때 색인을 안 받는다) ·
       상세 큰 그림과 크게 보기에서만 · 필수 · 코스프레(GPT 고름) · 자유 설계(영어, 줄였다 펼침) · 색인에 없는 컷은 없음 · 색인은 한 번만 */
    {
      const IJ = JSON.parse(require('node:fs').readFileSync('data/img.json', 'utf8')).img;
      const card = Object.keys(IJ).find(k => Object.values(IJ[k].byStyle || {}).some(b => ((b.casual || {}).f || []).length >= 4 && Object.values(b.byForm || {}).some(f => f.f)));
      const c = await h.open('dex.html', { viewport: { width: 1000, height: 900 } }), r = c.page; let fetched = 0, doc = { version: 1, rows: [] };
      await art(c.ctx); await c.ctx.route(/\/data\/casual-index\.json/, q => { fetched++; return q.fulfill({ contentType: 'application/json', body: JSON.stringify(doc) }); });
      await r.reload({ waitUntil: 'domcontentloaded' }); await r.waitForSelector('.grid > .cell');
      assert.equal(await r.locator('.cnote').count(), 0, '목록 칸엔 한 줄이 없다');
      await r.evaluate(k => [...document.querySelectorAll('.grid > .cell')].find(x => x.dataset.card === k).click(), card); await r.waitForSelector('.other-art .gal:not(.form-actions) .cell');
      assert.equal(fetched, 0, '목록 · 상세 초상에선 색인을 안 받는다');
      const cells = r.locator('.other-art .gal:not(.form-actions) .cell');
      for (let i = 0; (await cells.count()) < 4 && i < await r.locator('.sw button').count(); i++) await r.locator('.sw button').nth(i).click();   /* 일상컷이 넷 넘는 화풍으로 */
      const files = (await cells.locator('img').evaluateAll(es => es.map(e => decodeURIComponent(e.getAttribute('src').split('/').pop())))).slice(0, 4);
      const st = files[0].slice(card.length + 1, files[0].lastIndexOf('_f_casual')), outfit = 'an original plum fitted sleeveless romper with a deep square neckline, a separate curved chest yoke linked to the shorts by two slim side bridges';
      const base = f => ({ card, name: card, world: '', worldKo: '', n: +f.match(/_casual(\d+)\.webp$/)[1], date: '2026-11-17', style: st, path: '', required: null, requiredKo: null, family: null, familyKo: null, item: null, itemKo: null, shade: null, shadeKo: null, cosplay: null, free: null });
      doc.rows = [Object.assign(base(files[0]), { required: 'swimwear', requiredKo: '노출 갈래(수영복)', family: 'adventure', familyKo: '모험가', item: 'aviatrix', itemKo: '비행사', shade: 'orange', shadeKo: '코랄 · 오렌지',
          s: { pl: '주방', act: '잔을 든다', fr: '허리 위', ex: '차분함', tm: '아침', wt: '비', era: '지금 현실', ar: '2:3' } }),
        Object.assign(base(files[1]), { required: 'game_cosplay', requiredKo: '게임 코스프레', family: 'game_cosplay', familyKo: '게임 코스프레', item: 'gc_slit_gown', itemKo: '트임 롱드레스', cosplay: { game: 'war_of_genesis_3', gameKo: '창세기전 3 · 파트 2', character: 'Embla', characterKo: '엠블라', cut: 'slit_gown', cutKo: '트임 롱드레스', by: 'gpt', round: 1 } }),
        Object.assign(base(files[2]), { free: { kind: 'sfree', kindKo: '장면 자유', outfit }, s: { pl: 'a bath.', en: 1, ar: '2:3' } })];
      assert.equal(await r.locator('.cnote').count(), 0, '상세의 일상컷 칸엔 한 줄이 없다');
      await cells.nth(0).click(); const dn = r.locator('.artwork-panel .dex-cnote'); await dn.waitFor();
      assert.equal(fetched, 1, '일상컷을 처음 열 때 색인 한 번'); assert.equal((await dn.locator('.cnote-l1').textContent()).trim(), '필수 · 노출 갈래(수영복) — 비행사 · 코랄 · 오렌지', '상세 — 첫 줄 필수 · 옷 · 색');
      assert.equal((await dn.locator('.cnote-l2').textContent()).trim(), '주방 · 잔을 든다 · 허리 위', '상세 — 둘째 줄 장소 · 하는 일 · 구도(2026-11-25)');
      { const m = dn.locator('.cnote-more'), bb = await m.boundingBox(); assert(bb.height >= 44 && bb.width >= 44, '더 보기 44px'); assert.equal(await m.getAttribute('aria-expanded'), 'false');
        await m.click(); assert.equal(await m.getAttribute('aria-expanded'), 'true'); const sh = r.locator('.cnote-sheet'); await sh.waitFor();   /* 더 보기는 겹치는 판(2026-11-26) */
        assert.deepEqual(await sh.locator('.cnote-list dt').allTextContents(), ['표정', '시간대', '날씨', '시대', '화면비']);
        await r.keyboard.press('Escape'); assert.equal(await sh.count(), 0, 'Esc 로 판이 닫힌다'); assert.equal(await m.getAttribute('aria-expanded'), 'false', '다시 접힘'); }
      await r.keyboard.press('ArrowRight'); await r.waitForFunction(() => /코스프레/.test((document.querySelector('.dex-cnote') || {}).textContent || ''));
      assert.equal((await dn.textContent()).trim(), '필수 · 게임 코스프레 — 창세기전 3 · 파트 2 · 엠블라 · 트임 롱드레스GPT 고름', '상세 — 코스프레(캐릭터 한글 · GPT 고름) · 장면 풀이 없는 옛 줄은 첫 줄만');
      await r.locator('.big .zoom').click(); const zn = r.locator('.zoom-layer .zoom-cnote'); await zn.waitFor();
      assert.equal(await zn.locator('b').textContent(), '필수 · 게임 코스프레', '크게 보기에도'); assert.equal(await zn.locator('.cnote-gpt').count(), 1);
      await r.keyboard.press('ArrowRight'); await r.waitForSelector('.zoom-cnote .cnote-more');
      const more = zn.locator('.cnote-more'), l1 = zn.locator('.cnote-l1'); assert.equal(await l1.locator('b').textContent(), '장면 자유');
      assert.equal(await zn.locator('.cnote-l2 span[lang="en"]').textContent(), 'a bath.', '자유 설계 장면은 영어 그대로'); assert.equal(await zn.locator('.cnote-l2 .cnote-tag').textContent(), 'GPT 설계');
      assert.equal(await more.getAttribute('aria-expanded'), 'false'); assert((await l1.locator('span[lang="en"]').textContent()).endsWith('…'), '긴 Outfit 은 줄여 보인다');
      const zb = async () => Object.values(await r.locator('.zoom-body>img').boundingBox()); await r.waitForTimeout(800); const z0 = await zb(); const near = (x, y) => x.every((v, i) => Math.abs(v - y[i]) <= 2);   /* 넘김 움직임이 끝난 뒤에 재고, 소수점 흔들림은 봐준다 */
      await more.click(); assert.equal(await more.getAttribute('aria-expanded'), 'true'); await r.locator('.cnote-sheet').waitFor();
      assert.equal(await r.locator('.cnote-sheet .cnote-l1 span[lang="en"]').textContent(), outfit, '더 보기 판 — 다 보임(영어 그대로)');
      { const z1 = await zb(); assert(near(z1, z0), '판이 떠도 그림 자리 · 크기는 그대로 ' + JSON.stringify([z0, z1])); }
      await r.keyboard.press('Escape'); assert.equal(await r.locator('.cnote-sheet').count(), 0, 'Esc 는 판만 닫는다');
      assert.equal(await r.locator('.zoom-layer').count(), 1, '판을 닫아도 크게 보기 그대로');
      await r.keyboard.press('ArrowRight'); await r.waitForFunction(f => decodeURIComponent((document.querySelector('.zoom-body>img') || {}).getAttribute('src') || '').endsWith(f), files[3]);
      assert.equal(await r.locator('.cnote').count(), 0, '색인에 없는 컷은 아무것도 안 보인다'); assert.equal(fetched, 1, '색인은 한 번만');
      assert(await r.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '옆 넘침'); assert.deepEqual(c.errors, [], '오류'); n += 24;
      await c.close();
    }
    console.log('PASS 도감 크게 보기 넘기기 전환: ' + n + '가지 — 나가는 그림 사본 · 넘긴 쪽에서 들어옴 · 끝나면 정리 · 빠르게 넘겨도 하나 · 움직임 줄이기 · 일상컷 한 줄(상세 · 크게 보기에서만)');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
