/* 진화 결투 화면 — 덮개(344×882). 첫 고르기 → 로비 → 덱 짜기 → (Task 9) 대결 → (Task 10) 결과·전적·새로고침.
   그림이 6장뿐이라 img.json 을 검사용으로 바꿔 끼운다 — 1~3세대 전부 폼 초상 셋이 있는 것으로(챔피언 1·2 가 열리려면 이웃 2·3 까지). 그림 파일은 404 라 빈 자리로 뜬다.
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/lane-screen.cjs */
const fs = require('node:fs'), assert = require('node:assert/strict'), { start, FOLD } = require('./browser-harness.cjs');
const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards.character;
const NAMES = card.filter(c => c.gen <= 3).map(c => c.name);
const KEY = 'pkm_duel_v1';
const C = require('../lib/collection.js'), A = require('../lib/lane.js');
const J = n => JSON.parse(fs.readFileSync('data/' + n + '.json', 'utf8'));
/* 화면과 같은 풀(1~3세대)로 node 쪽 자료를 만든다 — 판을 손으로 짜서 저장에 넣으려고 */
const fakeImgObj = (() => { const img = {}; for (const n of NAMES) img[n] = { byStyle: { test: { byForm: { light: { f: n + '_light_test_f.webp' }, heavy: { f: n + '_heavy_test_f.webp' }, mobility: { f: n + '_mobility_test_f.webp' } }, casual: { f: [n + '_test_f_casual1.webp'] } } } }; return img; })();
const dataN = { cards: card, chart: J('chart').chart, group: J('group'), label: J('label'), img: fakeImgObj, lane: J('lane') };
/* 내 차례가 올 때까지(상대 수는 0.6초마다) */
const myTurn = p => p.waitForSelector('.ln-turn[data-turn="me"]', { timeout: 15000 });
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
    /* ── 대결 — 멀리건 → 놓기(폼) → 진화 → 개방 → 옮기기 → 패스 → 라운드 결과. 판은 손으로 짜서 저장에 넣는다 ── */
    const pr = C.newProfile(dataN, 1, 7), m = A.newMatch(dataN, pr, 2, 'rookie', 7);
    m.me.hand = ['이상해씨', '이상해풀', '이상해꽃', '꼬부기', '피카츄', '파이리', '잉어킹', '이브이'];
    m.foe.hand = ['치코리타', '베이리프', '브케인', '리아코', '꼬리선', '토게피', '네이티', '에레키드'].filter(n => NAMES.includes(n));
    const store = [KEY, JSON.stringify({ v: 1, profile: pr, matches: { lane: m } })];
    const b = await openLane(h, { store }), q = b.page;
    assert.equal(await q.locator('.ln-screen').getAttribute('data-screen'), 'mulligan', '저장된 판은 멀리건부터');
    assert.equal(await q.locator('.ln-mull .cell').count(), 8, '손패 8');
    await q.locator('.ln-mull .cell').nth(7).tap(); assert.equal(await q.locator('.ln-mull .cell.swapped').count(), 1, '한 장 바꿈');
    await tappable(q, '.ln-mull .cell, #ln-mull-go');
    await q.locator('#ln-mull-go').tap(); await q.waitForSelector('.ln-screen[data-screen="match"]');
    assert.equal(await q.locator('.ln-lane').count(), 3, '세 줄');
    await myTurn(q); await noOverflow(q);
    /* 놓기 — 손패 → 상세 → 중장 → 놓기 → 줄 고르기 */
    await q.locator('.ln-hand .cell[data-id="이상해씨"]').tap(); await q.waitForSelector('.ln-detail');
    assert.equal(await q.locator('.ln-detail .ln-form[aria-pressed="true"]').getAttribute('data-form'), 'light', '기본은 경장');
    await q.locator('.ln-detail .ln-form[data-form="heavy"]').tap();
    await q.locator('#ln-place').tap(); await q.waitForSelector('.ln-mode');
    assert.equal(await q.locator('.ln-target[data-kind="place"]').count(), 3, '빈 줄 셋이 빛난다');
    await tappable(q, '.ln-target');
    await q.locator('.ln-target[data-kind="place"][data-lane="0"]').tap();
    await q.waitForSelector('.ln-lane[data-lane="0"] .ln-slot[data-side="me"] .ln-stack');
    assert.equal(await q.locator('.ln-lane[data-lane="0"] .ln-slot[data-side="me"] .ln-stack').getAttribute('data-form'), 'heavy', '중장으로 놓였다');
    assert.equal(await q.locator('.ln-hand .cell').count(), 7, '손패가 줄었다');
    assert.equal(await q.locator('.ln-mode').count(), 0, '고르기 모드가 닫혔다');
    await myTurn(q);
    assert(await q.locator('.ln-vs[data-lane="0"] .ln-atk[data-side="me"]').textContent() !== '', '승부 칸에 내 공격값');
    /* 진화 — 이상해풀을 같은 줄에 */
    await q.locator('.ln-hand .cell[data-id="이상해풀"]').tap(); await q.waitForSelector('.ln-detail');
    await q.locator('#ln-place').tap(); await q.waitForSelector('.ln-mode');
    assert.equal(await q.locator('.ln-target[data-kind="evolve"][data-lane="0"]').count(), 1, '0번 줄은 진화로 빛난다');
    assert.equal(await q.locator('.ln-target[data-kind="swap"]').count(), 0, '진화되는 줄엔 교체가 아니라 진화');
    await q.locator('.ln-target[data-kind="evolve"][data-lane="0"]').tap();
    await q.waitForFunction(() => document.querySelectorAll('.ln-lane[data-lane="0"] .ln-slot[data-side="me"] .ln-stack .ln-under').length === 1);
    assert.equal(await q.locator('.ln-lane[data-lane="0"] .ln-slot[data-side="me"] .ln-stack .ln-pw').textContent(), '10', '이상해풀 8 + 중장 2');
    await myTurn(q);
    /* 교체 — 꼬부기를 0번 줄에 */
    await q.locator('.ln-hand .cell[data-id="꼬부기"]').tap(); await q.waitForSelector('.ln-detail');
    await q.locator('#ln-place').tap(); await q.waitForSelector('.ln-mode');
    assert.equal(await q.locator('.ln-target[data-kind="swap"][data-lane="0"]').count(), 1, '내 스택이 있는 줄은 교체로 빛난다');
    await q.locator('#ln-cancel').tap(); assert.equal(await q.locator('.ln-mode').count(), 0, '취소');
    /* 개방 — 막대의 개방 → 줄 고르기 */
    await q.locator('#ln-open').tap(); await q.waitForSelector('.ln-mode');
    assert.equal(await q.locator('.ln-target[data-kind="open"]').count(), 1, '열 수 있는 스택 하나');
    await q.locator('.ln-target[data-kind="open"][data-lane="0"]').tap();
    await q.waitForSelector('.ln-lane[data-lane="0"] .ln-slot[data-side="me"] .ln-stack.open');
    assert(await q.locator('#ln-open').isDisabled(), '개방은 한 번');
    await myTurn(q);
    /* 옮기기 — 고기동 피카츄를 1번에 놓고 2번으로 */
    await q.locator('.ln-hand .cell[data-id="피카츄"]').tap(); await q.waitForSelector('.ln-detail');
    await q.locator('.ln-detail .ln-form[data-form="mobility"]').tap(); await q.locator('#ln-place').tap();
    await q.locator('.ln-target[data-kind="place"][data-lane="1"]').tap();
    await q.waitForSelector('.ln-lane[data-lane="1"] .ln-slot[data-side="me"] .ln-stack[data-form="mobility"]');
    await myTurn(q);
    await q.locator('.ln-lane[data-lane="1"] .ln-slot[data-side="me"] .ln-stack').tap(); await q.waitForSelector('.ln-detail');
    await q.locator('#ln-move').tap(); await q.waitForSelector('.ln-mode');
    assert.equal(await q.locator('.ln-target[data-kind="move"]').count(), 2, '갈 수 있는 줄 둘(0번은 자리 바꿈)');
    await q.locator('.ln-target[data-kind="move"][data-lane="2"]').tap();
    await q.waitForSelector('.ln-lane[data-lane="2"] .ln-slot[data-side="me"] .ln-stack[data-form="mobility"]');
    assert.equal(await q.locator('.ln-lane[data-lane="1"] .ln-slot[data-side="me"] .ln-stack').count(), 0, '1번 줄은 비었다');
    await myTurn(q);
    /* 패스 → 라운드 결과 */
    await q.locator('#ln-pass').tap();
    await q.waitForSelector('.ln-last-round', { timeout: 20000 });
    const savedM = JSON.parse(await q.evaluate(k => localStorage.getItem(k), KEY)).matches.lane;
    assert(savedM.roundLog.length >= 1 && savedM.log.some(e => e.t === 'evolve') && savedM.log.some(e => e.t === 'open') && savedM.log.some(e => e.t === 'move'), '매 수 저장 — 진화·개방·옮기기가 기록에');
    await tappable(q, '#ln-pass, #ln-open, .ln-hand .cell'); await noOverflow(q);
    assert.deepEqual(b.errors, [], '대결 화면 오류 없음');
    await b.close();
    console.log('PASS 결투 화면: 첫 고르기 · 로비 · 덱 짜기 · 멀리건 · 대결');
  } finally { await h.stop(); }
})();
