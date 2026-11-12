/* 도감 목록의 시작선 — 메뉴 줄 · 검색줄 · 제목 · 최근 띠 · 세대 띠 · 거르기 · 개수 줄 · 카드가 왼쪽 한 선에 선다(2026-11-12, 사용자 「깔끔하지 않다」 —
   그 전엔 덮개에서 12 · 16 · 18 · 21px 넷이었다). 오른쪽도 한 선(굴림 막대 자리만큼은 봐준다). 거르기 줄의 글자와 +/− 는 가운데가 같다 */
const assert = require('node:assert/strict');
const { start, FOLD } = require('./browser-harness.cjs');
const LEFT = { nav: '.workspace-nav', search: '.search-row input', title: '.gallery-intro h2', recent: '.recent > .sec',
  recentItem: '.recent-item', gen: '.genre-strip button', filters: '.dex-filters summary', count: '.dex-view-row .sec', card: '.grid > .cell' };
const RIGHT = { gear: '.appearance-toggle', reset: '#dex-reset', filters: '.dex-filters summary', size: '#dex-size' };
(async () => {
  const h = await start();
  try {
    for (const [vp, mobile] of [[FOLD.cover, true], [FOLD.inner, true], [{ width: 1280, height: 900 }, false]]) {
      const a = await h.open('dex.html', { viewport: vp, mobile }), p = a.page;
      await p.waitForSelector('.grid > .cell');
      const m = await p.evaluate(([L, R]) => {
        const box = s => { const e = document.querySelector(s); return e && e.getBoundingClientRect(); };
        const sc = document.querySelector('.collection-scroll'), bar = sc.offsetWidth - sc.clientWidth;
        const left = {}, right = {};
        for (const [k, s] of Object.entries(L)) { const b = box(s); if (b) left[k] = Math.round(b.left * 2) / 2; }
        for (const [k, s] of Object.entries(R)) { const b = box(s); if (b) right[k] = Math.round((innerWidth - b.right) * 2) / 2; }
        const sum = document.querySelector('.dex-filters summary'), sb = sum.getBoundingClientRect(), after = getComputedStyle(sum, '::after');
        /* 가장 오른쪽 카드의 오른쪽 끝 — 굴림 막대만큼 안쪽이어도 된다 */
        const cells = [...document.querySelectorAll('.grid > .cell')].slice(0, 6).map(e => e.getBoundingClientRect());
        right.card = Math.round((innerWidth - Math.max(...cells.map(b => b.right))) * 2) / 2;
        return { left, right, bar, sumAlign: getComputedStyle(sum).alignItems, after: after.content, ox: document.documentElement.scrollWidth - innerWidth };
      }, [LEFT, RIGHT]);
      const tag = vp.width + '×' + vp.height;
      assert.equal(Object.keys(m.left).length, Object.keys(LEFT).length, tag + ' 재지 못한 칸: ' + JSON.stringify(m.left));
      const edge = m.left.nav;
      for (const [k, x] of Object.entries(m.left)) assert(Math.abs(x - edge) <= 0.5, `${tag} 왼쪽 ${k} ${x}px — 시작선 ${edge}px`);
      const r0 = m.right.gear;
      for (const [k, x] of Object.entries(m.right)) {
        const slack = ['filters', 'size', 'card'].includes(k) ? m.bar : 0;   /* 굴림 자리 안의 것은 굴림 막대만큼 안쪽 */
        assert(x >= r0 - 0.5 && x <= r0 + slack + 0.5, `${tag} 오른쪽 ${k} ${x}px — 끝선 ${r0}px(+막대 ${m.bar})`);
      }
      assert.equal(m.sumAlign, 'center', tag + ' 거르기 줄 가운데 맞춤');
      assert.equal(m.ox, 0, tag + ' 가로 넘침');
      /* 굴려서 머리가 접혀도(main.dex-scrolled) 검색줄은 그 선에 — 접힌 머리에 workspace.css 의 안쪽 여백이 붙어 21px 로 돌아간 적이 있다 */
      await p.locator('.collection-scroll').evaluate(e => { e.scrollTop = 900; });
      await p.waitForSelector('main.dex-scrolled');
      const sx = await p.evaluate(() => [document.querySelector('.workspace-nav').getBoundingClientRect().left, document.querySelector('.search-row input').getBoundingClientRect().left]);
      assert(Math.abs(sx[0] - sx[1]) <= 0.5, `${tag} 굴린 뒤 검색줄 ${sx[1]}px — 시작선 ${sx[0]}px`);
      /* 「목록으로」 — 한 줄에 한 종, 줄도 그 선에서 시작하고 번호가 한 줄에 든다 */
      await p.locator('#dex-size').click();
      await p.waitForFunction(() => document.body.classList.contains('dex-compact'));
      const rw = await p.evaluate(() => { const c = document.querySelector('.grid > .cell'), n = c.querySelector('.no'), b = c.getBoundingClientRect();
        return { left: b.left, w: b.width, gw: document.querySelector('.grid').clientWidth, noH: n.getBoundingClientRect().height, line: parseFloat(getComputedStyle(n).lineHeight) }; });
      assert(Math.abs(rw.left - edge) <= 0.5 && Math.abs(rw.w - rw.gw) <= 1, `${tag} 목록 줄 ${rw.left}px · 폭 ${rw.w}/${rw.gw}`);
      assert(rw.noH <= rw.line * 1.5, `${tag} 목록 줄 번호가 두 줄로 꺾였다 ${rw.noH}px`);
      assert.deepEqual(a.errors, []);
      await a.close();
    }
    console.log('PASS dex gutter: one left edge and one right edge on the list screen at cover, inner and desktop — also scrolled and in the row view');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
