/* 도트 포켓몬 — 연구소 바닥 · 캡슐을 열면 뛰쳐나오기 · 도감 상세의 도트 줄 · 목록의 「도트」 표 (data/sprites.json · lib/sprite-actor.js).
   도트 자료는 시험 자료(피카츄·이상해씨·리자몽)를 opt.files 로 주고, 그림은 tests/fixtures/make-sprites.py 가 임시 자리에 그린다.
   - 연구소: 도트가 있으면 캡슐 벽 밑에 바닥이 생기고(좁으면 둘·넓으면 셋) 거닌다 · 누르면 진열된 포켓몬은 그 캡슐이 열리고, 없으면 도감으로
   - 캡슐을 열면 그 포켓몬의 도트가 캡슐에서 튀어나와 화면 바닥을 거닌다 · 도트를 눌러도 캡슐은 그대로 · 닫으면 들어간다 · 도트 없는 포켓몬은 아무것도
   - 동작 줄이기면 뛰지 않고 서 있다 · 도트 자료가 비면 바닥도 뛰쳐나오기도 없다(연구소는 그대로)
   - 도감: 도트 있는 포켓몬의 상세에 작은 무대, 없는 포켓몬은 없다 · 목록 칸에 「도트」 표
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dot-screen.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { execFileSync } = require('node:child_process');
const { start } = require('./browser-harness.cjs');
const species = ['피카츄', '이상해씨', '파이리', '꼬부기'];
const actor = (card, id) => ({ card, id, form: 'base', cell: [96, 128], foot: [48, 126], scale: 1, flip: true, facing: 'right', states: {
  still: { file: id + '/' + id + '_base_still.png', frames: 1 },
  idle: { file: id + '/' + id + '_base_idle.png', frames: 4, order: [0, 1, 2, 3], ms: [300, 200, 140, 200] },
  walk: { file: id + '/' + id + '_base_walk.png', frames: 6, order: [0, 1, 2, 3, 4, 5], ms: [120, 120, 120, 120, 120, 120], speed: 60, dy: [0, 1, -1, 0, 1, -1] },
  react: { file: id + '/' + id + '_base_react.png', frames: 4, order: [0, 1, 2, 3], ms: [100, 120, 160, 120] } } });
const SPRITES = { base: 'https://polos0117.github.io/pkm-atelier-img-2/sprites/', actors: { pikachu: actor('피카츄', 'pikachu'), bulbasaur: actor('이상해씨', 'bulbasaur'), charizard: actor('리자몽', 'charizard') } };
const art = fs.mkdtempSync(path.join(os.tmpdir(), 'pkm-dot-'));
fs.writeFileSync(path.join(art, 'sprites.json'), JSON.stringify(SPRITES));
execFileSync('python3', [path.join(__dirname, 'fixtures', 'make-sprites.py'), path.join(art, 'sprites.json'), art]);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aEioAAAAASUVORK5CYII=', 'base64');
const IMGS = { img: Object.fromEntries(species.map((s, i) => [s, { byStyle: { glossy_promo: { byForm: { light: { f: '__dot_' + i + '.png' } } } } }])) };
function seed({ picks, images }) {
  localStorage.setItem('pkm_theme_v1', 'daylight');
  localStorage.setItem('pkm_hall_v1', JSON.stringify(picks));
  const original = window.fetch;
  window.fetch = function (url, ...a) { return String(url).includes('data/img.json') ? Promise.resolve(new Response(JSON.stringify(images), { headers: { 'Content-Type': 'application/json' } })) : original.call(this, url, ...a); };
}
const opt = (extra = {}) => ({ viewport: { width: 390, height: 844 }, mobile: true, imgRoot: art, files: { 'data/sprites.json': SPRITES }, init: [seed, { picks: { daylight: species }, images: IMGS }], ...extra });
const wait = ms => new Promise(ok => setTimeout(ok, ms));

(async () => {
  const h = await start(), temp = [];
  let n = 0;
  try {
    for (let i = 0; i < species.length; i++) { const f = path.resolve(__dirname, '../img/__dot_' + i + '.png'); fs.writeFileSync(f, png); temp.push(f); }

    /* ── 연구소 — 바닥, 캡슐 뛰쳐나오기 ── */
    let s = await h.open('index.html', opt()), p = s.page;
    await p.waitForSelector('.capsule');
    await p.waitForSelector('.lab-floor:not([hidden]) .sprite-actor:not([hidden])', { timeout: 10000 });
    assert.equal(await p.locator('.lab-floor .sprite-actor').count(), 2, '좁으면 둘');
    assert(await p.evaluate(() => { const w = document.querySelector('.capsule-bay .bay-wall').getBoundingClientRect(), f = document.querySelector('.lab-floor').getBoundingClientRect(); return f.top >= w.bottom - 1; }), '바닥은 캡슐 벽 밑');
    /* 머리가 띠 위로 잘리지 않는다 — 칸(96×128, 발 126)을 다 쓰는 인물이 dy 로 2칸 올라가도 */
    assert(await p.evaluate(() => { const f = document.querySelector('.lab-floor').getBoundingClientRect(); return [...document.querySelectorAll('.lab-floor .sprite-actor')].every(a => { const u = a.sprite.debug().unit; return a.getBoundingClientRect().top - 2 * u >= f.top - 0.5; }); }), '좁은 화면에서 머리가 잘린다');
    assert.match(await p.locator('.lab-floor .sprite-actor').first().getAttribute('aria-label'), /도트 — 눌러서 캡슐 열기/);
    await p.waitForFunction(() => [...document.querySelectorAll('.lab-floor .sprite-actor')].some(a => a.sprite.debug().state === 'walk'), null, { timeout: 10000 });
    n += 2;

    await p.click('.capsule[data-name="피카츄"]');
    await p.waitForFunction(() => { const a = document.querySelector('.sprite-popout[data-card="피카츄"] .sprite-actor'); return a && !a.hidden && a.sprite.debug().ready; }, null, { timeout: 8000 });
    await wait(900);
    const land = await p.evaluate(() => { const r = document.querySelector('.sprite-popout .sprite-actor').getBoundingClientRect(); return { b: Math.round(r.bottom), vh: innerHeight, label: document.querySelector('.sprite-popout .sprite-actor').getAttribute('aria-label') }; });
    assert(land.b > land.vh - 60 && land.b <= land.vh + 30, '화면 바닥에 내려앉는다 ' + JSON.stringify(land));
    assert.match(land.label, /캡슐에서 나온 피카츄 도트/);
    await p.locator('.sprite-popout .sprite-actor').click();
    assert.equal(await p.locator('.capsule[data-name="피카츄"].is-open').count(), 1, '도트를 눌러도 캡슐은 그대로');
    await p.keyboard.press('Escape');
    await p.waitForFunction(() => !document.querySelector('.sprite-popout'), null, { timeout: 4000 });
    n += 2;
    await p.click('.capsule[data-name="꼬부기"]'); await wait(1200);
    assert.equal(await p.locator('.sprite-popout').count(), 0, '도트 없는 포켓몬은 뛰쳐나오지 않는다');
    await p.keyboard.press('Escape');
    /* 다른 캡슐로 바로 넘어가면 — 앞의 도트는 들어가고 새 도트가 나온다(한 번에 하나) */
    await p.click('.capsule[data-name="피카츄"]'); await p.waitForSelector('.sprite-popout[data-card="피카츄"]');
    await p.click('.capsule[data-name="이상해씨"]');
    await p.waitForSelector('.sprite-popout[data-card="이상해씨"]', { timeout: 6000 }); await wait(500);
    assert.equal(await p.locator('.sprite-popout').count(), 1, '한 번에 하나');
    assert.deepEqual(s.errors, []);
    await s.close();
    n++;

    /* 넓으면 셋 · 바닥의 도트를 누르면 — 진열된 포켓몬은 캡슐이 열리고, 없으면 도감으로 */
    s = await h.open('index.html', opt({ viewport: { width: 1280, height: 900 }, mobile: false })); p = s.page;
    await p.waitForSelector('.lab-floor:not([hidden]) .sprite-actor:not([hidden])', { timeout: 10000 });
    await p.waitForFunction(() => document.querySelectorAll('.lab-floor .sprite-actor').length === 3);
    /* 머리가 띠 위로 잘리지 않는다 — 칸(96×128, 발 126)을 다 쓰는 인물이 dy 로 2칸 올라가도 */
    assert(await p.evaluate(() => { const f = document.querySelector('.lab-floor').getBoundingClientRect(); return [...document.querySelectorAll('.lab-floor .sprite-actor')].every(a => { const u = a.sprite.debug().unit; return a.getBoundingClientRect().top - 2 * u >= f.top - 0.5; }); }), '넓은 화면에서 머리가 잘린다');
    await p.locator('.lab-floor .sprite-actor[data-who="이상해씨"]').click({ force: true });
    await p.waitForSelector('.capsule[data-name="이상해씨"].is-open');
    await p.keyboard.press('Escape'); await wait(400);
    await Promise.all([p.waitForURL(/dex\.html\?mech=/), p.locator('.lab-floor .sprite-actor[data-who="리자몽"]').click({ force: true })]);
    assert.equal(decodeURIComponent(new URL(p.url()).searchParams.get('mech')), '리자몽', '진열에 없으면 도감으로');
    await s.close();
    n += 2;

    /* 동작 줄이기 — 뛰지 않고 서 있다 */
    s = await h.open('index.html', opt({ reducedMotion: 'reduce' })); p = s.page;
    await p.waitForSelector('.capsule'); await p.click('.capsule[data-name="피카츄"]');
    await p.waitForSelector('.sprite-popout .sprite-actor:not([hidden])', { timeout: 8000 });
    assert(await p.evaluate(() => !document.querySelector('.sprite-popout .sprite-actor').sprite.running && document.querySelector('.sprite-popout-stage').getAnimations().length === 0), '동작 줄이기 — 서 있다');
    await s.close();
    /* 도트 자료가 비면 — 바닥도 뛰쳐나오기도 없다 */
    s = await h.open('index.html', opt({ files: { 'data/sprites.json': { base: SPRITES.base, actors: {} } } })); p = s.page;
    await p.waitForSelector('.capsule'); await wait(800);
    assert.equal(await p.locator('.lab-floor').isHidden(), true, '바닥 없음');
    await p.click('.capsule[data-name="피카츄"]'); await wait(900);
    assert.equal(await p.locator('.sprite-popout').count(), 0, '뛰쳐나오기 없음');
    assert.deepEqual(s.errors, []);
    await s.close();
    n += 2;

    /* ── 도감 — 상세의 도트 줄 · 목록의 「도트」 표 ── */
    s = await h.open('dex.html?mech=' + encodeURIComponent('피카츄'), opt()); p = s.page;
    await p.waitForSelector('.dex-dot:not([hidden]) .sprite-actor:not([hidden])', { timeout: 10000 });
    assert.match(await p.locator('.dex-dot .sprite-actor').getAttribute('aria-label'), /피카츄 도트/);
    assert(await p.evaluate(() => { const st = document.querySelector('.dex-dot-stage').getBoundingClientRect(), a = document.querySelector('.dex-dot .sprite-actor').getBoundingClientRect(); return a.bottom <= st.bottom + 1 && a.top >= st.top - 1; }), '인물이 무대 안');
    await p.locator('.dex-dot-stage').scrollIntoViewIfNeeded(); await wait(200);   // 화면 밖이면 재생기가 쉰다
    await p.locator('.dex-dot .sprite-actor').click();
    await p.waitForFunction(() => document.querySelector('.dex-dot .sprite-actor').dataset.state === 'react', null, { timeout: 3000 });
    await s.close();
    s = await h.open('dex.html?mech=' + encodeURIComponent('꼬부기'), opt()); p = s.page;
    await p.waitForSelector('#detail-title'); await wait(1200);
    assert.equal(await p.locator('.dex-dot').isHidden(), true, '도트 없는 포켓몬은 줄이 없다');
    await s.close();
    s = await h.open('dex.html', opt()); p = s.page;
    await p.waitForSelector('.cell[data-card="피카츄"] .dot-badge', { timeout: 10000 });
    assert.equal(await p.locator('.cell[data-card="꼬부기"] .dot-badge').count(), 0);
    assert.deepEqual(s.errors, []);
    await s.close();
    n += 3;
    /* ── 화소 배율이 정수가 아닌 화면 — 폴드(2.625: 도트 한 칸 3화소 = 1.14배) · 노트북 150%(1.5: 2화소 = 1.33배). 띠·무대가 그만큼 커져 머리가 안 잘린다 ── */
    const headIn = (host, sel) => p.evaluate(([host, sel]) => { const f = document.querySelector(host).getBoundingClientRect(), as = [...document.querySelectorAll(sel)];
      return as.length > 0 && as.every(a => { const u = a.sprite.debug().unit; return a.getBoundingClientRect().top - 2 * u >= f.top - 0.5 && a.getBoundingClientRect().bottom <= f.bottom + 0.5; }); }, [host, sel]);
    for (const [dpr, vp, mobile] of [[2.625, { width: 344, height: 882 }, true], [2.625, { width: 690, height: 829 }, true], [1.5, { width: 1280, height: 800 }, false]]) {
      s = await h.open('index.html', opt({ viewport: vp, mobile, dpr })); p = s.page;
      await p.waitForSelector('.lab-floor:not([hidden]) .sprite-actor:not([hidden])', { timeout: 10000 });
      assert(await headIn('.lab-floor', '.lab-floor .sprite-actor'), '연구소 바닥에서 머리가 잘린다 — 배율 ' + dpr + ' · 폭 ' + vp.width);
      await s.close();
      s = await h.open('dex.html?mech=' + encodeURIComponent('피카츄'), opt({ viewport: vp, mobile, dpr })); p = s.page;
      await p.waitForSelector('.dex-dot:not([hidden]) .sprite-actor:not([hidden])', { timeout: 10000 });
      assert(await headIn('.dex-dot-stage', '.dex-dot .sprite-actor'), '도감 무대에서 머리가 잘린다 — 배율 ' + dpr + ' · 폭 ' + vp.width);
      await s.close();
    }
    n++;

    console.log('PASS 도트 포켓몬: ' + n + '가지 · 연구소 바닥(좁으면 둘·넓으면 셋·누르면 캡슐 또는 도감) · 캡슐을 열면 뛰쳐나와 바닥을 거닌다(눌러도 캡슐은 그대로·닫으면 들어간다·도트 없으면 없음·하나만) · 동작 줄이기 · 자료 없음 · 도감 상세 무대 · 목록 「도트」 표 · 폴드·150% 화면에서 머리가 안 잘린다');
  } finally { temp.forEach(f => fs.rmSync(f, { force: true })); await h.stop(); fs.rmSync(art, { recursive: true, force: true }); }
})().catch(e => { console.error(e); process.exit(1); });
