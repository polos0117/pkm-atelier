/* 폼 결투 화면 — 덮개(344×882). 첫 고르기 → 로비 → 덱 짜기(날씨판) → 멀리건 → (Task 8) 대결 → 결과·전적·상점·새로고침·옛 저장.
   그림이 몇 장뿐이라 img.json 을 검사용으로 바꿔 끼운다 — 1~3세대 전부 폼 초상 셋 + 일상컷 하나. 그림 파일은 404 라 빈 자리로 뜬다.
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/gwent-screen.cjs */
const fs = require('node:fs'), assert = require('node:assert/strict'), { start, FOLD } = require('./browser-harness.cjs');
const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards.character;
const NAMES = card.filter(c => c.gen <= 3).map(c => c.name);
const KEY = 'pkm_duel_v1';
const C = require('../lib/collection.js'), G = require('../lib/gwent.js');
const J = n => JSON.parse(fs.readFileSync('data/' + n + '.json', 'utf8'));
const fakeImgObj = (() => { const img = {}; for (const n of NAMES) img[n] = { byStyle: { test: { byForm: { light: { f: n + '_light_test_f.webp' }, heavy: { f: n + '_heavy_test_f.webp' }, mobility: { f: n + '_mobility_test_f.webp' } }, casual: { f: [n + '_test_f_casual1.webp'] } } } }; return img; })();
const dataN = { cards: card, chart: J('chart').chart, group: J('group'), label: J('label'), img: fakeImgObj, lane: J('lane'), gwent: J('gwent') };
const myTurn = p => p.waitForSelector('.gw-turn[data-turn="me"]', { timeout: 15000 });
const fakeImg = [names => {
  const real = window.fetch;
  window.fetch = (u, o) => {
    if (String(u).includes('data/img.json')) {
      const img = {}; for (const n of names) img[n] = { byStyle: { test: { byForm: { light: { f: n + '_light_test_f.webp' }, heavy: { f: n + '_heavy_test_f.webp' }, mobility: { f: n + '_mobility_test_f.webp' } }, casual: { f: [n + '_test_f_casual1.webp'] } } } };
      return Promise.resolve(new Response(JSON.stringify({ version: 1, img }), { headers: { 'Content-Type': 'application/json' } }));
    }
    return real(u, o);
  };
}, NAMES];
async function openGwent(h, opt) {
  opt = opt || {};
  const a = await h.open('gwent.html', { viewport: FOLD.cover, mobile: true, init: fakeImg, store: opt.store });
  await a.page.waitForSelector('.gw-screen[data-screen]');
  return a;
}
const tappable = async (p, sel) => { for (const b of await p.locator(sel).all()) { if (!await b.isVisible()) continue; const r = await b.boundingBox(); assert(r && r.height >= 44 && r.width >= 40, sel + ' 누르는 자리 44px: ' + JSON.stringify(r)); } };
const noOverflow = async p => assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '가로 넘침');
(async () => {
  const h = await start();
  try {
    /* 첫 고르기 */
    const a = await openGwent(h), p = a.page;
    assert.equal(await p.locator('.gw-screen').getAttribute('data-screen'), 'pick', '첫 화면은 고르기');
    assert.equal(await p.locator('.gw-gen').count(), 9, '세대 아홉');
    assert(await p.locator('.gw-gen[data-gen="1"]').isEnabled() && await p.locator('.gw-gen[data-gen="4"]').isDisabled(), '1세대 열림, 4세대 잠김');
    await tappable(p, '.gw-gen'); await noOverflow(p);
    await p.locator('.gw-gen[data-gen="1"]').tap(); await p.locator('#gw-pick-go').tap();
    await p.waitForSelector('.gw-screen[data-screen="lobby"]');
    /* 로비 — 프로필은 진화 결투와 같은 저장, 덱은 decks.gwent */
    const saved = JSON.parse(await p.evaluate(k => localStorage.getItem(k), KEY));
    assert(saved.profile.main === 1 && saved.profile.owned.length === 25 && saved.profile.decks.gwent.length === 25 && saved.profile.decks.lane.length === 25, '프로필이 저장됐다 — 두 덱');
    assert.equal(await p.locator('.gw-champion').count(), 9, '챔피언 아홉');
    assert(await p.locator('.gw-champion[data-gen="1"]').isEnabled() && await p.locator('.gw-champion[data-gen="3"]').isDisabled(), '1세대 도전 가능, 3세대 잠김');
    assert((await p.locator('.gw-deck').getAttribute('data-ok')) === 'true', '시작 덱은 출전 가능');
    await p.locator('.gw-lv button[data-lv="ace"]').tap(); assert.equal(await p.locator('.gw-lv button.on').getAttribute('data-lv'), 'ace', '난이도');
    await tappable(p, '.gw-tools .gw-btn, .gw-lv button, .gw-champion:enabled'); await noOverflow(p);
    /* 덱 짜기 — 빼면 빨갛고, 날씨판을 넣으면 날씨 1/3, 네 장이면 빨갛다 */
    await p.locator('#gw-build').tap(); await p.waitForSelector('.gw-screen[data-screen="build"]');
    assert.equal(await p.locator('.gw-pick-cell').count(), 25, '가진 카드 25');
    assert(/^\d+·\d+·\d+$/.test(await p.locator('.gw-pick-cell .gw-pw3').first().textContent()), '카드에 힘 셋');
    await p.locator('.gw-pick-cell .gw-toggle').first().tap();
    assert.equal(await p.locator('.gw-rule span[data-rule="count"].bad').count(), 1, '24장 — 규칙 줄이 빨갛다');
    const firstId = await p.locator('.gw-pick-cell .gw-toggle-w').first().getAttribute('data-id');
    await p.locator('.gw-pick-cell .gw-toggle-w').first().tap();
    assert(/1\/3/.test(await p.locator('.gw-rule span[data-rule="weather"]').textContent()) && await p.locator('.gw-rule span.bad').count() === 0, '날씨판 1/3 — 25장으로 돌아온다');
    assert(JSON.parse(await p.evaluate(k => localStorage.getItem(k), KEY)).profile.decks.gwent.includes(firstId + '|w'), '덱에 이름|w');
    for (let i = 1; i < 4; i++) await p.locator('.gw-pick-cell .gw-toggle-w').nth(i).tap();
    assert.equal(await p.locator('.gw-rule span[data-rule="weather"].bad').count(), 1, '날씨판 넷은 초과');
    await p.locator('[data-view="in"]').tap(); assert.equal(await p.locator('.gw-pick-cell').count(), 25, '덱 안 — 기본판 24 + 날씨판만 든 1');
    await p.locator('[data-view="all"]').tap();
    await p.locator('#gw-autofill').tap();
    assert.equal(await p.locator('.gw-rule span.bad').count(), 0, '자동 채우기가 날씨판을 줄여 규칙을 채운다');
    /* 상세 — 폼 셋과 힘, 날씨판 단추 */
    await p.locator('.gw-pick-cell .cell').first().tap(); await p.waitForSelector('.gw-detail');
    assert.equal(await p.locator('.gw-detail .gw-form').count(), 3, '폼 셋');
    assert(await p.locator('#gw-detail-w').isVisible(), '날씨판 넣기/빼기 단추');
    await p.locator('#gw-close').tap(); await p.waitForSelector('.gw-detail', { state: 'detached' });
    await p.locator('.gw-main-pick button[data-gen="2"]').tap(); assert.equal(await p.locator('.gw-rule span[data-rule="main"].bad').count(), 1, '주 세대를 바꾸면 미달');
    await p.locator('.gw-main-pick button[data-gen="1"]').tap();
    await tappable(p, '.gw-toggle, .gw-toggle-w, .gw-chips button, .gw-main-pick button, .gw-build-act .gw-btn'); await noOverflow(p);
    await p.locator('#gw-build-done').tap(); await p.waitForSelector('.gw-screen[data-screen="lobby"]');
    /* 배우기 */
    await p.locator('#gw-learn').tap(); await p.waitForSelector('.gw-rules');
    assert.equal(await p.locator('.gw-rule-card').count(), 4, '규칙 넷');
    await p.locator('#gw-rules-close').tap(); await p.waitForSelector('.gw-rules', { state: 'detached' });
    assert.deepEqual(a.errors, [], '화면 오류 없음');
    await a.close();
    /* ── 멀리건 — 판을 손으로 짜서 저장에 넣는다 ── */
    const pr = C.newProfile(dataN, 1, 7); C.setDeck(pr, 'gwent', pr.owned.slice()); const m = G.newMatch(dataN, pr, 2, 'rookie', 7);
    m.me.hand = ['이상해씨', '이상해풀', '꼬부기', '피카츄', '파이리|w', '잉어킹', '이브이', '뮤츠', '리자드', '꼬마돌'];
    /* 상대 손패는 내 풀·독·전기를 2배로 때리지 못하는 카드만 — 대결 검사(Task 8)가 결속 합을 그대로 읽는다 */
    m.foe.hand = ['치코리타', '베이리프', '메가니움', '리아코', '엘리게이', '꼬리선', '토게피', '에레키드', '메리프', '보송송'].filter(n => NAMES.includes(n));
    const b = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: pr, matches: { gwent: m } })] }), q = b.page;
    assert.equal(await q.locator('.gw-screen').getAttribute('data-screen'), 'mulligan', '저장된 판은 멀리건부터');
    assert.equal(await q.locator('.gw-mull .cell').count(), 10, '손패 10');
    assert.equal(await q.locator('.gw-mull .cell[data-id="파이리|w"] .gw-wtag').count(), 1, '날씨판은 표시가 붙는다');
    await q.locator('.gw-mull .cell').nth(9).tap(); assert.equal(await q.locator('.gw-mull .cell.swapped').count(), 1, '한 장 바꿈');
    await tappable(q, '.gw-mull .cell, #gw-mull-go'); await noOverflow(q);
    await q.locator('#gw-mull-go').tap(); await q.waitForSelector('.gw-screen[data-screen="match"]');
    assert.deepEqual(b.errors, [], '멀리건 화면 오류 없음');
    await b.close();
    console.log('PASS 폼 결투 화면: 첫 고르기 · 로비 · 덱 짜기(날씨판) · 배우기 · 멀리건');
  } finally { await h.stop(); }
})();
