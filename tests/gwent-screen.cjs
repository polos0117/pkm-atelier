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
    /* ── 대결 — 내기(줄 고르기·힘 미리보기) → 결속 → 날씨 → 개방 → 패스 → 라운드 결과 ── */
    const c1 = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: pr, matches: { gwent: (() => { const x = JSON.parse(JSON.stringify(m)); return x; })() } })] }), q2 = c1.page;
    await q2.locator('#gw-mull-go').tap(); await q2.waitForSelector('.gw-screen[data-screen="match"]');
    assert.equal(await q2.locator('.gw-row[data-side="me"]').count(), 3, '내 줄 셋');
    assert.equal(await q2.locator('.gw-row[data-side="foe"]').count(), 3, '상대 줄 셋');
    await myTurn(q2); await noOverflow(q2);
    for (const id of ['gw-pass', 'gw-open', 'gw-help']) assert.equal(await q2.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && (e.id === id || (e.closest('button') || {}).id === id) ? id : (e && (e.className || e.tagName)); }, id), id, id + ' 가 가려지지 않았다');
    /* 내기 — 손패 → 상세 → 내기 → 세 줄에 힘이 뜬다 → 고기동 */
    await q2.locator('.gw-hand .cell[data-id="피카츄"]').tap(); await q2.waitForSelector('.gw-detail');
    assert.equal(await q2.locator('.gw-detail .gw-form').count(), 3, '상세에 폼 셋');
    await q2.locator('#gw-play').tap(); await q2.waitForSelector('.gw-mode');
    assert.equal(await q2.locator('.gw-target[data-kind="play"]').count(), 3, '세 줄이 빛난다');
    assert.equal(await q2.locator('.gw-target[data-kind="play"][data-lane="2"]').textContent(), '9', '고기동 줄엔 피카츄 9');
    assert.equal(await q2.locator('.gw-target[data-kind="play"][data-lane="0"]').textContent(), '5', '경장 줄엔 5');
    await tappable(q2, '.gw-target');
    await q2.locator('.gw-target[data-kind="play"][data-lane="2"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="2"] .gw-unit[data-id="피카츄"]');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit .gw-pw').textContent(), '9', '놓인 힘 9');
    assert.equal(await q2.locator('.gw-hand .cell').count(), 9, '손패가 줄었다');
    assert.equal(await q2.locator('.gw-mode').count(), 0, '고르기 모드가 닫혔다');
    await myTurn(q2);
    assert(/9/.test(await q2.locator('.gw-bar .gw-sumline b[data-side="me"]').textContent()), '막대에 내 합');
    /* 결속 — 이상해씨·이상해풀을 중장 줄에 */
    await q2.locator('.gw-hand .cell[data-id="이상해씨"]').tap(); await q2.locator('#gw-play').tap(); await q2.locator('.gw-target[data-kind="play"][data-lane="1"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="1"] .gw-unit[data-id="이상해씨"]'); await myTurn(q2);
    await q2.locator('.gw-hand .cell[data-id="이상해풀"]').tap(); await q2.locator('#gw-play').tap(); await q2.locator('.gw-target[data-kind="play"][data-lane="1"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="1"] .gw-unit[data-id="이상해풀"]');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="1"] .gw-unit.bond').count(), 2, '둘 다 결속 표시');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="1"] .gw-sum').textContent(), String(2 * (G.cardOf(dataN, '이상해씨').power.heavy + G.cardOf(dataN, '이상해풀').power.heavy)), '줄 합이 두 배');
    await myTurn(q2);
    /* 날씨판 — 세 줄에 날씨 이름이 뜬다, 고른 줄이 흐려진다 */
    await q2.locator('.gw-hand .cell[data-id="파이리|w"]').tap(); await q2.waitForSelector('.gw-detail');
    await q2.locator('#gw-play').tap(); await q2.waitForSelector('.gw-mode');
    assert(/비/.test(await q2.locator('.gw-target[data-kind="play"][data-lane="2"]').textContent()), '고기동 줄엔 비');
    await q2.locator('#gw-cancel').tap(); assert.equal(await q2.locator('.gw-mode').count(), 0, '취소');
    await q2.locator('.gw-hand .cell[data-id="파이리|w"]').tap(); await q2.locator('#gw-play').tap(); await q2.locator('.gw-target[data-kind="play"][data-lane="0"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="0"].weathered');
    assert(await q2.locator('.gw-row[data-side="foe"][data-lane="0"].weathered').count() === 1, '상대 경장 줄도 흐려진다');
    await myTurn(q2);
    /* 개방 — 손패 칸의 개방 → 내 비영웅 카드마다 표적 → 피카츄 */
    await q2.locator('#gw-open').tap(); await q2.waitForSelector('.gw-mode');
    assert.equal(await q2.locator('.gw-target[data-kind="open"]').count(), 3, '열 수 있는 카드 셋(피카츄·이상해씨·이상해풀)');
    await q2.locator('.gw-target[data-kind="open"][data-lane="2"][data-i="0"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="2"] .gw-unit.open');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit .gw-pw').textContent(), '14', '9 + 5');
    assert(await q2.locator('#gw-open').isDisabled(), '개방은 한 번');
    await myTurn(q2);
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit .gw-pw').textContent(), '13', '내 차례가 오면 −1');
    /* 판 위 카드 상세 */
    await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit').tap(); await q2.waitForSelector('.gw-detail');
    assert(await q2.locator('#gw-open-this').isDisabled(), '이미 열었으니 상세의 개방은 꺼짐');
    await q2.locator('#gw-close').tap(); await q2.waitForSelector('.gw-detail', { state: 'detached' });
    /* 패스 → 라운드 결과 */
    await q2.locator('#gw-pass').tap();
    await q2.waitForSelector('.gw-last-round', { timeout: 20000 });
    const savedM = JSON.parse(await q2.evaluate(k => localStorage.getItem(k), KEY)).matches.gwent;
    assert(savedM.roundLog.length >= 1 && savedM.log.some(e => e.t === 'weather') && savedM.log.some(e => e.t === 'open'), '매 수 저장 — 날씨·개방이 기록에');
    await tappable(q2, '#gw-pass, #gw-open, .gw-hand .cell, .gw-unit'); await noOverflow(q2);
    assert.deepEqual(c1.errors, [], '대결 화면 오류 없음');
    await c1.close();
    /* ── 결과·보상 — 이기기 직전: 2라운드, 상대 목숨 하나, 상대 손 없음 ── */
    const pr2 = C.newProfile(dataN, 1, 8); C.setDeck(pr2, 'gwent', pr2.owned.slice()); const m2 = G.newMatch(dataN, pr2, 2, 'rookie', 8); G.confirm(dataN, m2);
    Object.assign(m2, { round: 2, turn: 'me', first: 'me', coin: 'me', bonus: { me: 0, foe: 0 }, passed: { me: false, foe: false }, lives: { me: 2, foe: 1 }, roundLog: [{ me: 0, foe: 12, winner: 'foe' }], weather: [null, null, null] });
    m2.me.hand = ['뮤츠']; m2.me.deck = []; m2.foe.hand = []; m2.foe.deck = []; m2.me.rows = [[], [], []]; m2.foe.rows = [[], [], []];
    const c2 = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: pr2, matches: { gwent: m2 } })] }), r = c2.page;
    await r.waitForSelector('.gw-screen[data-screen="match"]');
    await r.reload(); await r.waitForSelector('.gw-screen[data-screen="match"]');
    assert.equal(await r.locator('.gw-hand .cell').count(), 1, '새로고침해도 손패 그대로');
    await myTurn(r);
    await r.locator('.gw-hand .cell[data-id="뮤츠"]').tap(); await r.locator('#gw-play').tap(); await r.locator('.gw-target[data-kind="play"][data-lane="0"]').tap();
    await r.waitForSelector('.gw-result[data-result]', { timeout: 15000 });   /* 손이 비어 자동 패스 → 상대도 빈 손 → 끝 */
    assert.equal(await r.locator('.gw-result').getAttribute('data-result'), 'win', '승리');
    assert(/10/.test(await r.locator('.gw-gold-earned').textContent()), '신참 +10금');
    assert.equal(await r.locator('.gw-rounds li').count(), 2, '라운드 둘');
    assert.equal(await r.locator('.gw-flipcard').count(), 5, '뒷장 다섯');
    await tappable(r, '.gw-flipcard, #gw-result-lobby, #gw-result-again');
    await r.locator('.gw-flipcard[data-index="1"]').tap(); await r.waitForSelector('.gw-flipcard[data-index="1"].flipped');
    await r.reload(); await r.waitForSelector('.gw-screen[data-screen="result"]');
    assert.equal(await r.locator('.gw-flipcard.flipped').count(), 1, '새로고침해도 뒤집은 채');
    await r.locator('.gw-flipcard[data-index="0"]').tap(); await r.locator('.gw-flipcard[data-index="4"]').tap();
    await r.waitForSelector('.gw-flipcard.missed');
    assert(await r.locator('.gw-flipcard.flipped').count() === 3 && await r.locator('.gw-flipcard.missed').count() === 2, '셋 뒤집으면 끝, 나머지는 놓친 카드');
    const after = JSON.parse(await r.evaluate(k => localStorage.getItem(k), KEY));
    assert(after.profile.owned.length === 28 && after.profile.gold === 10 && after.profile.beaten[2].rookie === 1 && after.profile.stats.gwent.games === 1 && after.profile.stats.gwent.win === 1 && after.profile.stats.lane.games === 0, '컬렉션 +3 · 금 · 이긴 횟수 · 폼 결투 통계만');
    assert(after.matches.gwent && after.matches.gwent.rewarded, '정산은 한 번');
    await r.locator('#gw-result-lobby').tap(); await r.waitForSelector('.gw-screen[data-screen="lobby"]');
    assert.equal(JSON.parse(await r.evaluate(k => localStorage.getItem(k), KEY)).matches.gwent, null, '판을 비웠다');
    assert(/1승/.test(await r.locator('.gw-champion[data-gen="2"]').textContent()), '챔피언 카드에 1승');
    await r.locator('#gw-stats').tap(); await r.waitForSelector('.gw-stats');
    assert(await r.locator('.gw-stats-boss tr[data-gen="2"] td.win').textContent() === '1 / 1' && /13/.test(await r.locator('.gw-stats-nums').textContent()), '전적에 이 판 — 최고 합 13(뮤츠)');
    assert.equal(await r.locator('.gw-stats-cards .cell').count(), 1, '카드별 — 뮤츠');
    await r.locator('#gw-stats-close').tap(); await r.waitForSelector('.gw-stats', { state: 'detached' });
    await r.locator('#gw-shop').tap(); await r.waitForSelector('.gw-shop');
    assert.equal(await r.locator('.gw-shop-slot').count(), 6, '진열 여섯');
    assert(await r.locator('#gw-shop-reroll').isEnabled(), '10금이면 새로 깔 수 있다');
    await r.locator('#gw-shop-done').tap(); await r.waitForSelector('.gw-shop', { state: 'detached' });
    await tappable(r, '.gw-tools .gw-btn'); await noOverflow(r);
    assert.deepEqual(c2.errors, [], '결과·로비 오류 없음');
    await c2.close();
    /* ── 옛 저장 — 진화 결투에서 만든 프로필(decks.gwent 없음) · 풀 밖 카드 · 일상컷 없는 날씨판 ── */
    const oldOwned = card.filter(c => c.gen === 1 && !c.rare).slice(0, 26).map(c => c.name), gone = card.find(c => c.gen === 4 && !c.rare).name;
    const d = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: { main: 1, owned: oldOwned.concat(['없는카드', gone]), decks: { lane: oldOwned.slice(0, 25) } } })] }), o = d.page;
    await o.waitForSelector('.gw-screen[data-screen="lobby"]');
    const up = JSON.parse(await o.evaluate(k => localStorage.getItem(k), KEY));
    assert(up.profile.decks.gwent.length === 25 && up.profile.decks.lane.length === 25 && up.profile.owned.includes(gone) && !up.profile.owned.includes('없는카드') && (await o.locator('.gw-deck').getAttribute('data-ok')) === 'true', '폼 결투 덱이 가진 카드로 자동으로 찼다 · 진화 결투 덱은 그대로 · 컬렉션엔 풀 밖 카드가 남는다');
    assert.deepEqual(d.errors, [], '옛 저장 오류 없음');
    await d.close();
    { /* 날씨판이 든 덱에서 그 카드의 일상컷이 내려가면 덱에서만 빠진다 */
      const q3 = C.newProfile(dataN, 1, 9); C.setDeck(q3, 'gwent', q3.owned.slice(0, 24).concat([gone + '|w']));
      const e = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: q3, matches: {} })] }), s = e.page;
      await s.waitForSelector('.gw-screen[data-screen="lobby"]');
      assert(/24\/25/.test(await s.locator('.gw-deck').textContent()) && (await s.locator('.gw-deck').getAttribute('data-ok')) === 'false', '풀 밖 카드의 날씨판은 덱에서 빠져 24/25: ' + await s.locator('.gw-deck').textContent());
      assert.deepEqual(e.errors, [], '오류 없음');
      await e.close(); }
    console.log('PASS 폼 결투 화면: 첫 고르기 · 로비 · 덱 짜기(날씨판) · 배우기 · 멀리건 · 대결 · 결과·보상 · 전적 · 상점 · 새로고침 · 옛 저장');
  } finally { await h.stop(); }
})();
