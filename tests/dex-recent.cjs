/* 도감 최근 추가 · 새 그림 — 띠(7일 · 24장 · 새것부터 · 누르면 그 그림으로) · "새" 표시(지난 방문 기준, 떠날 때 기록) · 새 그림만 · 다섯 크기.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dex-recent.cjs
   img.json 은 진짜 자료에 날짜(added)만 검사용으로 갈아 끼운다 — 오늘(UTC) 둘 · 사흘 전 스물다섯 · 열흘 전 셋.
   지난 방문은 localStorage 에 "사흘 전, 그날 그림 하나 빼고 다 봄" 으로 심는다 → 새것은 셋 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { start } = require('./browser-harness.cjs');

const CARD = JSON.parse(fs.readFileSync('data/card.json', 'utf8'));
const DOC = JSON.parse(fs.readFileSync('data/img.json', 'utf8'));
const NO = Object.fromEntries(Object.values(CARD.cards).flat().map(c => [c.name, c.no]));
const day = n => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const TODAY = day(0), D3 = day(3), D10 = day(10), FROM = day(6);

/* 카드마다 폼 초상 하나 · 일상컷 하나 */
function filesOf(entry) {
  const out = { portrait: null, casual: null };
  for (const b of Object.values(entry.byStyle || {})) {
    for (const f of Object.values(b.byForm || {})) if (!out.portrait && f.f) out.portrait = f.f;
    if (!out.casual && b.casual && b.casual.f && b.casual.f[0]) out.casual = b.casual.f[0];
  }
  return out;
}
const cards = Object.keys(DOC.img).filter(n => NO[n] && filesOf(DOC.img[n]).portrait).sort((a, b) => NO[a] - NO[b]);
const A = { card: cards[0], file: filesOf(DOC.img[cards[0]]).portrait };
const bName = cards.slice(1).find(n => filesOf(DOC.img[n]).casual);
const B = { card: bName, file: filesOf(DOC.img[bName]).casual };
const rest = cards.filter(n => n !== A.card && n !== B.card);
const C = rest.slice(0, 25).map(n => ({ card: n, file: filesOf(DOC.img[n]).portrait }));
const D = rest.slice(25, 28).map(n => ({ card: n, file: filesOf(DOC.img[n]).portrait }));
const added = {};
for (const x of [A, B]) added[x.file] = TODAY;
for (const x of C) added[x.file] = D3;
for (const x of D) added[x.file] = D10;
const NEW = [A, B, C[0]];
const SEEN = { mark: D3, known: C.slice(1).map(x => x.file) };
/* 같은 날(사흘 전) 안에서 늦게 들어온 둘 — 도감 번호로는 24장 밖이지만 시각(added_at)이 있어 그날 맨 앞 */
const LATE = [C[24], C[23]];
const addedAt = { [C[23].file]: D3 + 'T08:00:00Z', [C[24].file]: D3 + 'T09:00:00Z' };
const fixture = (a, t = addedAt) => JSON.stringify({ ...DOC, added: a, added_at: t });

/* fetch 갈아 끼우기 + 지난 방문 심기(이 살림에서 한 번만 — 새 탭에서 다시 심지 않게 localStorage 로 막는다) */
const INIT = ([body, seen]) => {
  const real = window.fetch;
  window.fetch = function (u, o) {
    if (String(u).indexOf('data/img.json') >= 0) return Promise.resolve(new Response(body, { headers: { 'Content-Type': 'application/json' } }));
    return real.call(this, u, o);
  };
  try {
    if (seen && !localStorage.getItem('__recent_seeded')) { localStorage.setItem('__recent_seeded', '1'); localStorage.setItem('pkm_dex_seen_v1', seen); }
  } catch (e) {}
};
const open = (h, opt, body, seen) => h.open('dex.html', { ...opt, init: [INIT, [body, seen ? JSON.stringify(seen) : null]] });
const strip = p => p.$$eval('.recent-item', els => els.map(e => ({ card: e.dataset.card, file: e.dataset.file, day: e.dataset.day, badge: !!e.querySelector('.new-badge') })));
const newCells = p => p.$$eval('.grid > .cell[data-new]', els => els.map(e => e.dataset.card).sort());
const badgeCells = p => p.$$eval('.grid > .cell', els => els.filter(e => e.querySelector('.new-badge')).map(e => e.dataset.card).sort());
const sorted = a => [...a].sort();

(async () => {
  const h = await start();
  try {
    /* 1. 띠 — 7일 안 · 24장 · 새것부터(같은 날은 도감 번호 차례) · 열흘 전은 없다 */
    let a = await open(h, { viewport: { width: 390, height: 844 } }, fixture(added), SEEN), p = a.page;
    await p.waitForSelector('.grid > .cell');
    await p.waitForSelector('.recent-item');
    const s = await strip(p);
    assert.equal(s.length, 24, '띠는 24장까지: ' + s.length);
    const want = [A, B].sort((x, y) => NO[x.card] - NO[y.card]).concat(LATE, C.slice(0, 20));
    assert.deepEqual(s.map(x => x.file), want.map(x => x.file), '오늘 것 → 사흘 전, 같은 날은 늦게 들어온 시각부터, 시각이 없으면 번호 차례');
    assert(s.every(x => x.day >= FROM), '모두 최근 7일 안');
    assert(!s.some(x => D.some(d => d.file === x.file)), '열흘 전 그림은 띠에 없다');
    assert.equal(await p.$eval('.recent', e => e.compareDocumentPosition(document.querySelector('.grid')) & Node.DOCUMENT_POSITION_FOLLOWING ? 'before' : 'after'), 'before', '띠는 목록 위에');

    /* 2. "새" — 지난 방문 뒤(사흘 전보다 늦거나, 사흘 전인데 못 본 것). 띠·목록 칸 모두 */
    assert.deepEqual(sorted(s.filter(x => x.badge).map(x => x.file)), sorted(NEW.map(x => x.file).filter(f => s.some(x => x.file === f))), '띠의 새 표시는 새 그림에만');
    assert.deepEqual(await newCells(p), sorted(NEW.map(x => x.card)), '대표 이미지 칸 — 새 그림이 있는 카드에만 새 표시');
    assert.deepEqual(await badgeCells(p), await newCells(p), '표시가 보이는 칸 = data-new 칸');

    /* 3. 새 그림만 — 거른 목록 · 초기화하면 풀린다 */
    await p.click('#dex-new-only');
    assert.equal(await p.getAttribute('#dex-new-only', 'aria-pressed'), 'true');
    assert.deepEqual(await p.$$eval('.grid > .cell', els => els.map(e => e.dataset.card).sort()), sorted(NEW.map(x => x.card)), '새 그림만 — 새 카드만 남는다');
    await p.click('#dex-reset');
    assert.equal(await p.getAttribute('#dex-new-only', 'aria-pressed'), 'false', '초기화하면 새 그림만도 풀린다');
    assert((await p.$$('.grid > .cell')).length > 100, '목록이 다시 다 나온다');

    /* 4. 띠를 누르면 그 카드를 그 그림으로 연다 — 일상컷 B. 상세의 그 컷에도 새 표시 */
    await p.click(`.recent-item[data-file="${B.file}"]`);
    await p.waitForSelector('.bar h2');
    assert.equal(await p.$eval('.bar h2', e => e.textContent.trim()), B.card, '누른 그림의 카드가 열린다');
    assert.equal(decodeURIComponent(await p.$eval('.big img', e => e.getAttribute('src'))).split('/').pop(), B.file, '큰 그림이 누른 그림');
    assert(await p.$$eval('.gal .cell', els => els.some(e => e.querySelector('.new-badge'))), '상세의 일상컷에도 새 표시');
    await p.click('.back');
    await p.waitForSelector('.recent-item');
    await p.click(`.recent-item[data-file="${A.file}"]`);
    await p.waitForSelector('.bar h2');
    assert.equal(await p.$eval('.bar h2', e => e.textContent.trim()), A.card);
    assert.equal(decodeURIComponent(await p.$eval('.big img', e => e.getAttribute('src'))).split('/').pop(), A.file, '폼 초상도 그 그림으로');
    assert(await p.$$eval('.fstrip .fcell', els => els.some(e => e.querySelector('.new-badge'))), '나란히 보기의 그 폼에도 새 표시');
    await p.click('.back');
    await p.waitForSelector('.grid > .cell');

    /* 5. 보는 동안에는 기록을 안 고친다 → 떠날 때(pagehide) 고친다 → 같은 탭 새로고침에도 표시는 남는다 → 새 탭(다음 방문)에는 없다 */
    const seenNow = () => p.evaluate(() => JSON.parse(localStorage.getItem('pkm_dex_seen_v1')));
    assert.deepEqual(await seenNow(), SEEN, '보는 동안 지난 방문 기록 그대로');
    await p.evaluate(() => dispatchEvent(new Event('pagehide')));
    const after = await seenNow();
    assert.equal(after.mark, TODAY, '떠날 때 가장 늦은 날을 적는다');
    assert.deepEqual(sorted(after.known), sorted([A.file, B.file]), '그날 그림을 적는다');
    await p.reload();
    await p.waitForSelector('.grid > .cell');
    assert.deepEqual(await newCells(p), sorted(NEW.map(x => x.card)), '같은 탭 새로고침 — 이 방문의 표시는 남는다');
    const tab = await a.ctx.newPage();
    await tab.goto(h.base + '/dex.html');
    await tab.waitForSelector('.grid > .cell');
    await tab.waitForSelector('.recent-item');
    assert.deepEqual(await newCells(tab), [], '다음 방문 — 이미 본 것은 새 표시가 없다');
    assert.equal(await tab.$('#dex-new-only'), null, '새 그림이 없으면 새 그림만 단추도 없다');
    assert.deepEqual(a.errors, [], '화면 오류 없음: ' + a.errors.join(' | '));
    await a.close();

    /* 6. 처음 온 브라우저 — 띠는 있고 새 표시는 없다. 숨김으로 떠나면 적는다 */
    a = await open(h, { viewport: { width: 390, height: 844 } }, fixture(added), null); p = a.page;
    await p.waitForSelector('.recent-item');
    assert.equal((await strip(p)).filter(x => x.badge).length, 0, '첫 방문 — 띠에 새 표시 없음');
    assert.deepEqual(await badgeCells(p), [], '첫 방문 — 목록에 새 표시 없음');
    assert.equal(await p.evaluate(() => localStorage.getItem('pkm_dex_seen_v1')), null, '첫 방문 — 보는 동안 안 적는다');
    await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); });
    assert.equal((await p.evaluate(() => JSON.parse(localStorage.getItem('pkm_dex_seen_v1')))).mark, TODAY, '화면이 숨으면 적는다');
    await a.close();

    /* 7. 창 안에 없으면 띠를 숨긴다 · 날짜가 아예 없는 자료도 */
    for (const [why, body] of [['열흘 전뿐', fixture(Object.fromEntries(Object.keys(added).map(f => [f, D10])))], ['added 없음', JSON.stringify(DOC.added ? (({ added: _, ...r }) => r)(DOC) : DOC)]]) {
      a = await open(h, { viewport: { width: 390, height: 844 } }, body, SEEN); p = a.page;
      await p.waitForSelector('.grid > .cell');
      assert.equal(await p.$('.recent'), null, '띠 숨김 — ' + why);
      assert.deepEqual(a.errors, [], why + ' 화면 오류 없음');
      await a.close();
    }

    /* 8. 다섯 크기 — 쪽은 옆으로 안 넘친다, 띠는 제 안에서 구른다, 누를 자리 44px, 초점 테두리 */
    for (const vp of [[344, 882], [390, 844], [844, 390], [690, 829], [1280, 900]]) {
      a = await open(h, { viewport: { width: vp[0], height: vp[1] } }, fixture(added), SEEN); p = a.page;
      await p.waitForSelector('.recent-item');
      const m = await p.evaluate(() => {
        const sc = document.querySelector('.collection-scroll'), st = document.querySelector('.recent-strip');
        const items = [...st.querySelectorAll('.recent-item')].map(e => e.getBoundingClientRect());
        return { doc: document.documentElement.scrollWidth - document.documentElement.clientWidth, body: document.body.scrollWidth - document.body.clientWidth,
          sc: sc.scrollWidth - sc.clientWidth, strip: st.scrollWidth - st.clientWidth, ox: getComputedStyle(st).overflowX,
          stripRight: st.getBoundingClientRect().right - sc.getBoundingClientRect().right,
          small: items.filter(r => r.width < 44 || r.height < 44).length };
      });
      const tag = vp.join('×');
      assert(m.doc <= 0 && m.body <= 0, tag + ' 쪽이 옆으로 안 넘친다: ' + JSON.stringify(m));
      assert(m.sc <= 0, tag + ' 굴림 자리도 옆으로 안 넘친다: ' + m.sc);
      assert(m.strip > 0 && m.ox === 'auto', tag + ' 띠는 제 안에서 옆으로 구른다: ' + JSON.stringify(m));
      assert(m.stripRight <= 0.5, tag + ' 띠가 굴림 자리 밖으로 안 나간다: ' + m.stripRight);
      assert.equal(m.small, 0, tag + ' 띠의 칸은 44px 이상');
      const tools = await p.$$eval('.dex-view-tools button', els => els.map(e => e.getBoundingClientRect().height));
      assert(tools.length === 2 && tools.every(x => x >= 44), tag + ' 새 그림만 · 작게 보기 44px: ' + tools);
      if (vp[0] === 344) {
        await p.focus('.recent-item');
        await p.keyboard.press('Tab');
        const f = await p.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return { item: e.classList.contains('recent-item'), fv: e.matches(':focus-visible'), w: parseFloat(cs.outlineWidth), style: cs.outlineStyle }; });
        assert(f.item && f.fv && f.w >= 2 && f.style !== 'none', '키보드 초점이 띠 칸에 보인다: ' + JSON.stringify(f));
      }
      assert.deepEqual(a.errors, [], tag + ' 화면 오류 없음');
      await a.close();
    }
    console.log('PASS 도감 최근 추가 — 띠 7일·24장·새것부터·그 그림으로 열기 · 새 표시(지난 방문·떠날 때 기록·첫 방문 없음) · 새 그림만 · 빈 창 숨김 · 다섯 크기');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
