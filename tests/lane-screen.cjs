/* 진화 결투 화면 — 덮개(344×882). 첫 고르기 → 로비 → 덱 짜기 → (Task 9) 대결 → (Task 10) 결과·전적·새로고침.
   그림이 6장뿐이라 img.json 을 검사용으로 바꿔 끼운다 — 1~3세대 전부 폼 초상 셋이 있는 것으로(챔피언 1·2 가 열리려면 이웃 2·3 까지). 그림 파일은 404 라 빈 자리로 뜬다.
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/lane-screen.cjs */
const fs = require('node:fs'), assert = require('node:assert/strict'), { start, FOLD } = require('./browser-harness.cjs');
const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards.character;
const NAMES = card.filter(c => c.gen <= 3).map(c => c.name);
const KEY = 'pkm_duel_v1';
/* fetch 를 가로채 data/img.json 만 검사용으로 */
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
async function openLane(h, opt) {
  opt = opt || {};
  const a = await h.open('lane.html', { viewport: FOLD.cover, mobile: true, init: fakeImg, store: opt.store });
  await a.page.waitForSelector('.ln-screen[data-screen]');
  return a;
}
const tappable = async (p, sel) => { for (const b of await p.locator(sel).all()) { if (!await b.isVisible()) continue; const r = await b.boundingBox(); assert(r && r.height >= 44 && r.width >= 40, sel + ' 누르는 자리 44px: ' + JSON.stringify(r)); } };
const noOverflow = async p => assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '가로 넘침');
(async () => {
  const h = await start();
  try {
    /* 첫 고르기 — 잠긴 세대(4세대부터)·고르면 로비 */
    const a = await openLane(h), p = a.page;
    assert.equal(await p.locator('.ln-screen').getAttribute('data-screen'), 'pick', '첫 화면은 고르기');
    assert.equal(await p.locator('.ln-gen').count(), 9, '세대 아홉');
    assert(await p.locator('.ln-gen[data-gen="1"]').isEnabled() && await p.locator('.ln-gen[data-gen="3"]').isEnabled(), '1~3세대는 열려 있다');
    assert(await p.locator('.ln-gen[data-gen="4"]').isDisabled() && /\d/.test(await p.locator('.ln-gen[data-gen="4"] .ln-need').textContent()), '4세대는 잠기고 n장 더');
    assert(await p.locator('#ln-pick-go').isDisabled(), '고르기 전엔 시작 못 함');
    await tappable(p, '.ln-gen'); await noOverflow(p);
    await p.locator('.ln-gen[data-gen="1"]').tap(); await p.locator('#ln-pick-go').tap();
    await p.waitForSelector('.ln-screen[data-screen="lobby"]');
    /* 로비 */
    const saved = JSON.parse(await p.evaluate(k => localStorage.getItem(k), KEY));
    assert(saved.profile.main === 1 && saved.profile.owned.length === 25 && saved.profile.decks.lane.length === 25 && saved.v === 1, '프로필이 저장됐다');
    assert.equal(await p.locator('.ln-champion').count(), 9, '챔피언 아홉');
    assert(await p.locator('.ln-champion[data-gen="1"]').isEnabled() && await p.locator('.ln-champion[data-gen="2"]').isEnabled(), '1·2세대 챔피언 도전 가능(이웃 2·3 이 풀에)');
    assert(await p.locator('.ln-champion[data-gen="3"]').isDisabled() && /\d/.test(await p.locator('.ln-champion[data-gen="3"] .ln-need').textContent()), '3세대 챔피언은 이웃 4세대가 없어 잠김');
    assert((await p.locator('.ln-deck').getAttribute('data-ok')) === 'true', '시작 덱은 출전 가능');
    assert(/25/.test(await p.locator('.ln-coll').textContent()), '컬렉션 25');
    await p.locator('.ln-lv button[data-lv="ace"]').tap(); assert.equal(await p.locator('.ln-lv button.on').getAttribute('data-lv'), 'ace', '난이도 고르기');
    await tappable(p, '.ln-tools .ln-btn, .ln-lv button, .ln-champion:enabled'); await noOverflow(p);
    /* 덱 짜기 — 빼면 규칙 줄이 빨개지고 출전이 막힌다, 넣으면 돌아온다, 자동 채우기 */
    await p.locator('#ln-build').tap(); await p.waitForSelector('.ln-screen[data-screen="build"]');
    assert.equal(await p.locator('.ln-pick-cell').count(), 25, '가진 카드 25');
    await p.locator('.ln-pick-cell .ln-toggle').first().tap();
    assert.equal(await p.locator('.ln-rule span[data-rule="count"].bad').count(), 1, '24장 — 규칙 줄이 빨갛다');
    assert((await p.locator('.ln-why').textContent()).length > 0, '무엇이 모자란지');
    await p.locator('#ln-build-done').tap(); await p.waitForSelector('.ln-screen[data-screen="lobby"]');
    assert((await p.locator('.ln-deck').getAttribute('data-ok')) === 'false' && await p.locator('.ln-champion[data-gen="1"]').isDisabled(), '규칙 미달이면 출전 못 함');
    await p.locator('#ln-build').tap(); await p.waitForSelector('.ln-screen[data-screen="build"]');
    await p.locator('[data-view="out"]').tap(); assert.equal(await p.locator('.ln-pick-cell').count(), 1, '덱 밖 한 장');
    await p.locator('.ln-pick-cell .ln-toggle').first().tap(); await p.locator('[data-view="all"]').tap();
    assert.equal(await p.locator('.ln-rule span.bad').count(), 0, '다시 25장');
    /* 상세 — 폼 셋 그림이 나란히 */
    await p.locator('.ln-pick-cell .cell').first().tap(); await p.waitForSelector('.ln-detail');
    assert.equal(await p.locator('.ln-detail .ln-forms .ln-form').count(), 3, '폼 셋');
    await p.locator('#ln-close').tap(); await p.waitForSelector('.ln-detail', { state: 'detached' });
    /* 주 세대를 바꾸면 15 규칙 */
    await p.locator('.ln-main-pick button[data-gen="2"]').tap();
    assert.equal(await p.locator('.ln-rule span[data-rule="main"].bad').count(), 1, '2세대로 바꾸면 주 세대 미달');
    await p.locator('.ln-main-pick button[data-gen="1"]').tap();
    assert.equal(await p.locator('.ln-rule span.bad').count(), 0, '되돌리면 맞는다');
    /* 자동 채우기 — 다 빼고 누르면 25 */
    await p.locator('[data-view="in"]').tap();
    for (let i = 0; i < 5; i++) await p.locator('.ln-pick-cell .ln-toggle').first().tap();
    await p.locator('#ln-autofill').tap(); await p.locator('[data-view="all"]').tap();
    assert.equal(await p.locator('.ln-rule span.bad').count(), 0, '자동 채우기');
    await tappable(p, '.ln-toggle, .ln-chips button, .ln-main-pick button, .ln-build-act .ln-btn'); await noOverflow(p);
    await p.locator('#ln-build-done').tap(); await p.waitForSelector('.ln-screen[data-screen="lobby"]');
    assert.deepEqual(a.errors, [], '화면 오류 없음');
    await a.close();
    console.log('PASS 결투 화면: 첫 고르기 · 로비 · 덱 짜기');
  } finally { await h.stop(); }
})();
