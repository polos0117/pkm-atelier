/* 움직임 — lib/scene-motion.js(공방 넷이 그대로 나눠 쓰는 파일, 원본은 book-atelier)와 도감 상세에 붙인 자리.
   그림은 가디(불꽃)의 등록 그림을 쓰고, 자료는 가디 칸만 고정한 사본(연출컷 둘은 가디안 그림을 빌린다)으로 갈아 끼운다 —
   그림 쪽 세션이 새 그림을 등록해도 검사가 흔들리지 않게.
   ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/scene-motion.cjs */
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const { start, FOLD } = require('./browser-harness.cjs');
const VIEWPORTS = [FOLD.cover, { width: 390, height: 844 }, { width: 844, height: 390 }, FOLD.inner, { width: 1280, height: 900 }];
const NAME = '가디', ST = 'glossy_promo', F = s => NAME + '_' + s + '_' + ST + '_f.webp';
const IMGJSON = JSON.parse(fs.readFileSync('data/img.json', 'utf8'));
IMGJSON.img[NAME] = { byStyle: { [ST]: {
  casual: { f: [1, 2, 3].map(n => NAME + '_' + ST + '_f_casual' + n + '.webp') },
  byForm: Object.fromEntries(['light', 'light_overdrive', 'heavy', 'heavy_overdrive', 'mobility', 'mobility_overdrive'].map(k => [k, { f: F(k) }])),
} } };
IMGJSON.img[NAME].byStyle[ST].byForm.light.action = { f: ['가디안_light_glossy_promo_f.webp', '가디안_heavy_glossy_promo_f.webp'] };
const SWAP = body => { const real = window.fetch;
  window.fetch = function (u, o) { return String(u).indexOf('data/img.json') >= 0 ? Promise.resolve(new Response(body, { headers: { 'Content-Type': 'application/json' } })) : real.call(this, u, o); }; };
const DEX = 'dex.html?mech=' + encodeURIComponent(NAME);
const LAB = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<link rel="stylesheet" href="lib/scene-motion.css?v=1"><script src="lib/scene-motion.js?v=1"></script>
<style>body{margin:0;background:#111}#box,#stage{position:relative;width:320px;height:320px;background:#0b0d12}
#stage>div{position:absolute;inset:0}#a{background:#a04030}#b{background:#3060a0}</style></head>
<body><div id="box"></div><div id="stage"><div id="a"></div><div id="b"></div></div><img id="pic" width="200" height="300" alt=""></body></html>`;
const noOverflow = p => p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
const frameHash = p => p.evaluate(() => { const c = document.querySelector('#box canvas'); return c ? c.toDataURL() : null; });
const bigSrc = p => p.evaluate(() => decodeURIComponent(document.querySelector('.big img').getAttribute('src')));
const bigAnims = p => p.evaluate(() => document.querySelector('.big .zoom img').getAnimations().length);
const settled = p => p.waitForFunction(() => !document.querySelector('.am-ghost, .am-flash, .am-ring, .am-overlay'), null, { timeout: 5000 });

(async () => {
  /* 0. 나눠 쓰는 파일 — 판 머리줄, js/css 판이 같다, 바깥에서 받는 것 없음, 주제 말 없음. 타입 → 입자 표는 모듈의 종류만 쓴다 */
  const src = fs.readFileSync('lib/scene-motion.js', 'utf8'), css = fs.readFileSync('lib/scene-motion.css', 'utf8');
  assert.match(src.split('\n')[0], /^\/\* scene-motion\.js — version \d+ /, 'js 첫 줄에 판');
  assert.match(css.split('\n')[0], /^\/\* scene-motion\.css — version \d+ /, 'css 첫 줄에 판');
  assert.equal(src.match(/version (\d+)/)[1], css.match(/version (\d+)/)[1], 'js·css 판이 같다');
  const code = src.replace(/\/\*[\s\S]*?\*\//g, '');
  assert(!/import |require\(|fetch\(|https?:\/\//.test(code), '바깥에서 받는 것이 없다');
  for (const w of ['book', 'pokemon', 'pkm', 'gundam', 'myth']) assert(!code.toLowerCase().includes(w), '모듈에 ' + w + ' 가 없다');
  assert(!/\bW\(/.test(code), '모듈은 낱말 표를 안 부른다');
  for (const repo of ['../book-atelier']) if (fs.existsSync(repo + '/lib/scene-motion.js'))
    for (const f of ['lib/scene-motion.js', 'lib/scene-motion.css']) assert(fs.readFileSync(repo + '/' + f).equals(fs.readFileSync(f)), f + ' 이 ' + repo + ' 와 글자 하나 다르지 않다');
  const box = { window: {} }; vm.createContext(box); vm.runInContext(src, box); vm.runInContext(fs.readFileSync('lib/dex-filter.js', 'utf8'), box);
  const M0 = box.window.AtelierMotion, DF = box.window.AtelierDexFilter;
  assert.equal(M0.KEY, 'atelier_motion_v1');
  const group = JSON.parse(fs.readFileSync('data/group.json', 'utf8')), cards = JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards.character;
  for (const t of group.order) assert(M0.KINDS.includes(DF.PARTICLES[t]), '타입 ' + t + ' → 모듈의 종류(' + DF.PARTICLES[t] + ')');
  for (const c of cards) assert(M0.KINDS.includes(DF.particlesOf(c)), c.name + ' 입자');
  assert.equal(DF.particlesOf({ element: 'fire' }), 'embers');
  assert.equal(DF.particlesOf({ element: 'ghost', element2: 'poison' }), 'mist', '두 타입이면 첫 타입');
  assert.equal(DF.particlesOf({ element: 'normal', element2: 'flying' }), 'mist', '노말이 앞이면 둘째 타입');
  assert.equal(DF.particlesOf({ element: 'normal' }), 'dust');

  const h = await start();
  const lab = async opt => { const a = await h.open('index.html', opt); await a.ctx.route('**/motion-lab.html', r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: LAB }));
    await a.page.goto(h.base + '/motion-lab.html'); await a.page.waitForFunction(() => window.AtelierMotion); return a; };
  try {
    /* 1. 입자 — 캔버스가 생기고 프레임마다 화소가 바뀐다. destroy 로 캔버스와 고리가 걷힌다 */
    const a = await lab({ viewport: { width: 390, height: 844 } }), p = a.page;
    await p.evaluate(() => { window.pc = AtelierMotion.particles(document.getElementById('box'), 'embers', { seed: 'lab' }); });
    await p.waitForFunction(() => window.pc.frames > 5);
    assert.equal(await p.locator('#box canvas.am-particles').count(), 1, '캔버스 하나');
    const f1 = await frameHash(p); await p.waitForTimeout(250); const f2 = await frameHash(p);
    assert.notEqual(f1, f2, '프레임 사이 화소가 바뀐다');
    for (const kind of [...new Set(Object.values(DF.PARTICLES))]) {
      const n = await p.evaluate(k => new Promise(ok => { const c = AtelierMotion.particles(document.getElementById('stage'), k, { seed: k });
        setTimeout(() => { const f = c.frames; c.destroy(); ok(f); }, 200); }), kind);
      assert(n > 3, kind + ' 이 돈다(' + n + ')');
    }
    assert.equal(await p.locator('#stage canvas').count(), 0, '종류마다 destroy 로 걷혔다');
    await p.evaluate(() => window.pc.destroy());
    assert.equal(await p.locator('#box canvas').count(), 0, 'destroy — 캔버스가 없다');
    const d0 = await p.evaluate(() => window.pc.frames); await p.waitForTimeout(200);
    assert.equal(await p.evaluate(() => window.pc.frames), d0, 'destroy 뒤 프레임이 안 돈다');

    /* 2. 켄 번스 — 애니메이션 하나, 같은 씨앗 같은 움직임, 12~20초, transform 만 */
    const kb = await p.evaluate(() => { const el = document.getElementById('pic'), k = s => { const c = AtelierMotion.kenBurns(el, { seed: s }); const an = el.getAnimations();
      const r = { n: an.length, frames: JSON.stringify(an[0].effect.getKeyframes().map(f => f.transform)), d: an[0].effect.getTiming().duration }; c.stop(); return r; };
      const x = k('가디_light'), y = k('가디_light'), z = k('가디_light_overdrive'); return { x, y, z, after: el.getAnimations().length }; });
    assert.equal(kb.x.n, 1); assert.equal(kb.x.frames, kb.y.frames, '같은 씨앗은 같은 움직임'); assert.notEqual(kb.x.frames, kb.z.frames);
    assert(kb.x.d >= 12000 && kb.x.d <= 20000, '12~20초: ' + kb.x.d);
    assert(/scale/.test(kb.x.frames) && !/rotate|left|top/.test(kb.x.frames), 'transform 만');
    assert.equal(kb.after, 0, 'stop 하면 걷힌다');

    /* 3. 열리기 — 도중에 입자 터짐·빛, 끝에 새 그림이 다 보이고 남긴 스타일 없음. 같은 열쇠의 새 전환이 앞의 것을 끊는다 */
    const rv = await p.evaluate(async () => { const a = document.getElementById('a'), b = document.getElementById('b'), t = performance.now();
      const run = AtelierMotion.reveal(a, b, { kind: 'embers', removeFrom: true, key: 'lab' });
      await new Promise(r => setTimeout(r, 380));
      const mid = { burst: document.querySelectorAll('#stage .am-burst').length, flash: document.querySelectorAll('#stage .am-flash').length };
      const r = await run, cs = getComputedStyle(b);
      return { r, ms: performance.now() - t, mid, opacity: cs.opacity, clip: cs.clipPath, fromGone: !a.isConnected, style: b.getAttribute('style') || '' }; });
    assert.equal(rv.r.cancelled, false, '열리기가 끝난다');
    assert(rv.ms >= 900 && rv.ms <= 1700, '열리기 1초 남짓: ' + rv.ms);
    assert.deepEqual(rv.mid, { burst: 1, flash: 1 }, '도중 — 입자 터짐·빛');
    assert(rv.opacity === '1' && rv.clip === 'none' && rv.fromGone && !/clip-path|opacity/.test(rv.style), '끝 — 새 그림이 다 보인다: ' + JSON.stringify(rv));
    const cut = await p.evaluate(async () => { const st = document.getElementById('stage'); st.innerHTML = '<div id="a"></div><div id="b"></div><div id="c"></div>';
      const [a, b, c] = ['a', 'b', 'c'].map(id => document.getElementById(id));
      const first = AtelierMotion.reveal(a, b, { kind: 'snow', key: 'lab' }); await new Promise(r => setTimeout(r, 150));
      const second = AtelierMotion.turn(b, c, { key: 'lab', direction: 'next' }); const r1 = await first, r2 = await second;
      return { r1, r2, bClip: getComputedStyle(b).clipPath, left: st.querySelectorAll('.am-flash,.am-ghost').length }; });
    assert.deepEqual(cut, { r1: { cancelled: true }, r2: { cancelled: false }, bClip: 'none', left: 0 }, '끊기·넘기기');

    /* 4. 스위치 — atelier_motion_v1 에 on/off, 끄면 걷히고 켜면 되살아난다, 새로고침해도 남는다 */
    const sw = await p.evaluate(() => { const box = document.getElementById('box'), el = document.getElementById('pic');
      const pc = AtelierMotion.particles(box, 'snow', {}), k = AtelierMotion.kenBurns(el, { seed: 'x' }), seen = [];
      AtelierMotion.subscribe(v => seen.push(v));
      AtelierMotion.setEnabled(false);
      const off = { store: localStorage.getItem('atelier_motion_v1'), canvas: box.querySelectorAll('canvas').length, kb: el.getAnimations().length, on: AtelierMotion.enabled() };
      AtelierMotion.setEnabled(true);
      const on = { store: localStorage.getItem('atelier_motion_v1'), canvas: box.querySelectorAll('canvas').length, kb: el.getAnimations().length };
      pc.destroy(); k.stop(); AtelierMotion.setEnabled(false); return { off, on, seen }; });
    assert.deepEqual(sw.off, { store: 'off', canvas: 0, kb: 0, on: false }, '끄면 걷힌다');
    assert.deepEqual(sw.on, { store: 'on', canvas: 1, kb: 1 }, '켜면 되살아난다');
    assert.deepEqual(sw.seen, [false, true, false], '구독자에게 알린다');
    await p.reload(); await p.waitForFunction(() => window.AtelierMotion);
    assert.equal(await p.evaluate(() => AtelierMotion.enabled()), false, '새로고침해도 꺼짐');
    assert.deepEqual(a.errors, []); await a.close();

    /* 5. 동작 줄이기 — 켄 번스 없음, 떠도는 캔버스 없음, 열리기는 거의 바로 */
    const r = await lab({ viewport: { width: 390, height: 844 } }), rp = r.page;
    await rp.emulateMedia({ reducedMotion: 'reduce' }); await rp.waitForTimeout(100);   /* 바뀜 알림(change)이 지나간 뒤에 — 그 알림은 도는 전환을 끝 상태로 건너뛴다 */
    const red = await rp.evaluate(async () => { const el = document.getElementById('pic'), box = document.getElementById('box');
      AtelierMotion.kenBurns(el, { seed: 'r' }); const pc = AtelierMotion.particles(box, 'embers', {});
      const t = performance.now(); const res = await AtelierMotion.reveal(document.getElementById('a'), document.getElementById('b'), { kind: 'embers', removeFrom: true });
      return { kb: el.getAnimations().length, canvas: box.querySelectorAll('canvas').length, running: pc.running, ms: performance.now() - t, burst: document.querySelectorAll('.am-burst').length, enabled: AtelierMotion.enabled(), cancelled: res.cancelled }; });
    assert.deepEqual({ ...red, ms: 0 }, { kb: 0, canvas: 0, running: false, ms: 0, burst: 0, enabled: false, cancelled: false }, JSON.stringify(red));
    assert(red.ms < 250, '열리기가 거의 바로: ' + red.ms);
    await r.close();

    /* 6. 도감 상세 — 큰 그림에 켄 번스, 폼 ↔ 그 오버드라이브는 열리기(오버드라이브로 갈 때만 불꽃 입자가 터지고 옅게 떠돈다),
          다른 그림 바꾸기는 넘기기, 크게 보기는 켄 번스·입자 없음, 스위치는 상세에 */
    const x = await h.open(DEX, { viewport: { width: 1280, height: 900 }, init: [SWAP, JSON.stringify(IMGJSON)] }), xp = x.page;
    await xp.waitForSelector('.big .zoom img');
    await xp.waitForFunction(() => document.querySelector('.big .zoom img').getAnimations().length === 1);
    assert.match(await bigSrc(xp), /가디_light_glossy/);
    assert.equal(await xp.locator('#dex-motion').textContent(), '움직임 끄기');
    assert.equal(await xp.locator('.big .am-particles').count(), 0, '일반 폼에는 떠도는 입자 없음');
    await xp.click('.fcell[data-form="light_overdrive"]');
    await xp.waitForSelector('.big .am-burst[data-kind="embers"]');
    assert.equal(await xp.locator('.big .am-ghost').count(), 1, '폼 → 오버드라이브: 열리기(나가는 그림의 사본)');
    assert.equal(await xp.locator('.big img').count(), 1, '그림은 하나(사본은 그림 요소가 아니다)');
    await settled(xp);
    await xp.waitForSelector('.dex-motion-layer .am-particles[data-kind="embers"]');
    assert.equal(await xp.locator('.big').getAttribute('data-particles'), 'embers');
    assert.equal(await xp.evaluate(() => getComputedStyle(document.querySelector('.big img')).clipPath), 'none', '끝나면 다 보인다');
    await xp.waitForFunction(() => document.querySelector('.big .zoom img').getAnimations().length === 1);
    await xp.waitForFunction(() => !document.querySelector('.am-burst'), null, { timeout: 4000 });
    await xp.click('.fcell[data-form="light"]'); await xp.waitForTimeout(60);
    assert.equal(await xp.locator('.big .am-ghost').count(), 1, '오버드라이브 → 폼도 열리기');
    assert.equal(await xp.locator('.am-burst').count(), 0, '폼으로 돌아갈 때는 입자가 안 터진다');
    await settled(xp);
    assert.equal(await xp.locator('.big .am-particles').count(), 0, '폼으로 돌아오면 떠도는 입자가 걷힌다');
    /* 다른 폼·연출컷·일상컷 — 넘기기(입자 없음) */
    for (const sel of ['.fcell[data-form="heavy"]', '.form-actions .cell >> nth=0', '.big-next', '.gal:not(.form-actions) .cell >> nth=1']) {
      if (sel.includes('form-actions')) { await xp.click('.fcell[data-form="light"]'); await settled(xp); }
      await xp.click(sel); await xp.waitForTimeout(40);
      assert.equal(await xp.locator('.big .am-ghost').count(), 1, sel + ' — 넘기기');
      assert.equal(await xp.locator('.am-burst, .am-flash').count(), 0, sel + ' — 넘기기는 빛·입자 없음');
      await settled(xp);
      assert.equal(await xp.evaluate(() => getComputedStyle(document.querySelector('.big img')).opacity), '1');
      assert.equal(await bigAnims(xp), 1, sel + ' — 넘긴 뒤 켄 번스');
    }
    assert.match(await bigSrc(xp), /casual2/);
    assert.equal(new URL(xp.url()).searchParams.get('mech'), NAME, '주소의 ?mech= 그대로');
    /* 크게 보기 — 살펴보는 자리 */
    await xp.click('.fcell[data-form="heavy_overdrive"]'); await settled(xp);
    await xp.waitForSelector('.dex-motion-layer .am-particles');
    await xp.click('.big .zoom'); await xp.waitForSelector('.zoom-layer img'); await xp.waitForTimeout(300);
    assert.equal(await xp.evaluate(() => document.querySelector('.zoom-layer img').getAnimations().length), 0, '크게 보기 — 켄 번스 없음');
    assert.equal(await xp.locator('.zoom-layer canvas, .zoom-layer .am-ghost').count(), 0, '크게 보기 — 입자 없음');
    assert.equal(await xp.locator('.big .am-particles').count(), 0, '크게 보는 동안 뒤의 입자도 쉰다');
    await xp.keyboard.press('Escape'); await xp.waitForSelector('.zoom-layer', { state: 'detached' });
    assert.equal(await xp.evaluate(() => document.activeElement && document.activeElement.matches('.big .zoom')), true, '닫으면 초점은 큰 그림으로');
    await xp.waitForSelector('.dex-motion-layer .am-particles');
    /* 스위치 — 끄면 걷히고, 새로고침해도 꺼짐, 다시 켜면 돌아온다 */
    await xp.click('#dex-motion');
    assert.equal(await xp.locator('#dex-motion').textContent(), '움직임 켜기');
    assert.equal(await xp.locator('.big .am-particles').count(), 0, '끄면 입자가 걷힌다');
    assert.equal(await bigAnims(xp), 0, '끄면 켄 번스가 걷힌다');
    await xp.click('.fcell[data-form="heavy"]'); await xp.waitForTimeout(40);
    assert.equal(await xp.locator('.am-burst').count(), 0, '꺼짐 — 입자 없음');
    await settled(xp);
    await xp.reload(); await xp.waitForSelector('#dex-motion');
    assert.equal(await xp.locator('#dex-motion').textContent(), '움직임 켜기', '새로고침해도 꺼짐');
    assert.equal(await xp.evaluate(() => localStorage.getItem('atelier_motion_v1')), 'off');
    await xp.click('#dex-motion');
    assert.equal(await xp.evaluate(() => localStorage.getItem('atelier_motion_v1')), 'on');
    await xp.waitForFunction(() => document.querySelector('.big .zoom img').getAnimations().length === 1);
    assert.deepEqual(x.errors, []); await x.close();

    /* 7. 동작 줄이기 — 도감에서 스위치는 잠기고, 켄 번스·입자 없음 */
    const y = await h.open(DEX, { viewport: FOLD.cover, mobile: true, init: [SWAP, JSON.stringify(IMGJSON)] }), yp = y.page;
    await yp.waitForSelector('.big .zoom img'); await yp.emulateMedia({ reducedMotion: 'reduce' }); await yp.reload();
    await yp.waitForSelector('.big .zoom img');
    assert.equal(await yp.locator('#dex-motion').isDisabled(), true, '동작 줄이기 — 스위치 잠김');
    await yp.click('.fcell[data-form="light_overdrive"]'); await yp.waitForTimeout(300);
    assert.equal(await bigAnims(yp), 0, '동작 줄이기 — 켄 번스 없음');
    assert.equal(await yp.locator('.am-burst, .big .am-particles, .am-ghost').count(), 0, '동작 줄이기 — 입자·사본 없음');
    assert.deepEqual(y.errors, []); await y.close();

    /* 8. 다섯 크기 — 움직임을 켠 채 오버드라이브로 열고 가로 넘침·화면 오류 없음, 입자는 큰 그림 칸 안 */
    for (const viewport of VIEWPORTS) {
      const g = await h.open(DEX, { viewport, init: [SWAP, JSON.stringify(IMGJSON)] }), gp = g.page;
      await gp.waitForSelector('.big .zoom img');
      await gp.locator('.fcell[data-form="light_overdrive"]').click();
      await gp.waitForSelector('.big .am-burst');
      assert(await noOverflow(gp), 'dex overflow (열리는 중) ' + JSON.stringify(viewport));
      await settled(gp); await gp.waitForSelector('.dex-motion-layer .am-particles');
      const inside = await gp.evaluate(() => { const c = document.querySelector('.dex-motion-layer canvas').getBoundingClientRect(), b = document.querySelector('.big').getBoundingClientRect();
        return c.width > 50 && c.height > 50 && c.left >= b.left - 1 && c.right <= b.right + 1 && c.top >= b.top - 1 && c.bottom <= b.bottom + 1; });
      assert(inside, '입자는 큰 그림 칸 안 ' + JSON.stringify(viewport));
      assert(await noOverflow(gp), 'dex overflow ' + JSON.stringify(viewport));
      const tap = await gp.locator('#dex-motion').boundingBox(); assert(tap && tap.height >= 40, '#dex-motion 누르는 자리 ' + JSON.stringify(viewport));
      assert.deepEqual(g.errors, [], 'dex ' + JSON.stringify(viewport)); await g.close();
    }
    console.log('PASS 움직임: 같은 파일(판·바깥 없음·주제 말 없음)·타입 → 입자 ' + group.order.length + '타입 · 입자(화소 변화·destroy) · 켄 번스(씨앗·12~20초) · 열리기·끊기·넘기기 · 스위치(저장·구독·새로고침) · 동작 줄이기 · 도감 상세(폼 ↔ 오버드라이브 열리기·넘기기·떠도는 입자·크게 보기·스위치) · 다섯 크기 넘침·오류 없음');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
