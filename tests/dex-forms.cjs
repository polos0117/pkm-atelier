/* 도감의 폼 보기. 여기서 보려는 것은 딱 셋이다.
     · 정의된 폼이 card.json 차례대로 한 줄에 늘어서나 (없는 폼도 자리를 지키나)
     · 고르개에 그림이 있는 폼만 올라가나 (눌러도 아무 일 없는 단추를 안 만드나)
     · 빈 칸(연출컷)은 아예 안 그리나

   자료를 두 벌로 돌린다. 한 벌은 저장소에 실제로 등록된 것, 다른 한 벌은
   폼 둘을 일부러 지운 것이다. 채워진 자료만으로는 "빈 폼" 쪽을 볼 수가 없다.

   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dex-forms.cjs */
const fs = require('node:fs'), vm = require('node:vm');
const { start, report, FOLD } = require('./browser-harness.cjs');

/* 검사도 말을 코드에 안 적는다. 낱말 표에서 읽어 와 화면과 견준다 */
const ctx = { window: {}, console: { warn() {} } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('lib/words.js', 'utf8'), ctx);
const W = ctx.window.AtelierWords.W;

const CARD = JSON.parse(fs.readFileSync('data/card.json', 'utf8'));
const IMGJSON = JSON.parse(fs.readFileSync('data/img.json', 'utf8'));
const NAME = Object.keys(IMGJSON.img)[0];
const DEFS = CARD.forms;
const WANT = (CARD.cards.character.find(c => c.name === NAME) || {}).forms;

/* img.json 을 갈아 끼운 채로 화면을 연다. 페이지가 뜨기 전에 fetch 를 감싼다 */
function withImg(doc) {
  return ['__DEX_IMG__', JSON.stringify(doc)];
}
const SWAP = ([mark, body]) => {
  const real = window.fetch;
  window.fetch = function (u, o) {
    if (String(u).indexOf('data/img.json') >= 0) {
      return Promise.resolve(new Response(body, { headers: { 'Content-Type': 'application/json' } }));
    }
    return real.call(this, u, o);
  };
  window[mark] = 1;
};

/* 폼 둘을 지운 자료 */
const TRIMMED = JSON.parse(JSON.stringify(IMGJSON));
const GONE = WANT.slice(-2);
{
  const byStyle = TRIMMED.img[NAME].byStyle, k = Object.keys(byStyle)[0];
  for (const f of GONE) delete byStyle[k].byForm[f];
}
/* 연출컷을 한 장 붙인 자료 — 있는 일상컷 파일을 그대로 빌려 쓴다 */
const WITHACT = JSON.parse(JSON.stringify(IMGJSON));
let ACTFILE = '';
{
  const byStyle = WITHACT.img[NAME].byStyle, k = Object.keys(byStyle)[0];
  ACTFILE = byStyle[k].casual.f[0];
  byStyle[k].byForm[WANT[0]].action = { f: [ACTFILE] };
}

const q = (page, sel, fn) => page.$$eval(sel, fn);

const rows = [];
const ck = (name, ok, got) => rows.push([name, !!ok, got === undefined ? '' : String(got)]);

/* 도중에 터져도 여기까지 본 것은 찍는다. 예전에 한 번, 화면을 고쳐 놓고 검사를
   돌렸더니 둘째 판에서 선택자를 못 찾아 죽는 바람에 첫 판에서 이미 어긋나 있던
   것이 한 줄도 안 나왔다 — 무엇이 깨졌는지 알아보는 데 그만큼 더 걸렸다 */
(async () => {
  const h = await start();

  /* ── 1. 등록된 자료 그대로 ───────────────────────────── */
  const a = await h.open('dex.html', { viewport: FOLD.cover, mobile: true });
  const P = a.page;
  await P.waitForSelector('.grid .cell');

  ck('페이지 오류 없음', a.errors.length === 0, a.errors.join(' / '));

  const cells = await q(P, '.grid .cell .cap', els => els.map(e => e.textContent));
  ck('목록에 등록된 카드가 뜬다', cells.some(t => t.indexOf(NAME) === 0), cells.join(' | '));

  const prog = W('art.form.done', { done: WANT.length, all: WANT.length });
  ck('목록 진척은 성별을 안 본다 — 여성만 있어도 ' + prog,
    cells.some(t => t.indexOf(prog) > 0), cells.join(' | '));

  await P.$eval('.grid .cell', e => e.scrollIntoView({ block: 'center' }));
  await P.waitForFunction(() => {
    const i = document.querySelector('.grid .cell img');
    return i && i.complete && i.naturalWidth > 0;
  }, null, { timeout: 8000 }).catch(() => {});
  const cover = await q(P, '.grid .cell img',
    els => els.map(i => [decodeURIComponent(i.currentSrc || i.src), i.naturalWidth]));
  ck('목록 대표 그림이 실제로 실린다',
    cover.length > 0 && cover.every(c => c[1] > 0), JSON.stringify(cover));
  ck('목록 대표 그림은 자세히 보기가 처음 여는 폼과 같다',
    cover.length > 0 && cover[0][0].indexOf('_' + WANT[0] + '_') > 0, JSON.stringify(cover));

  await P.click('.grid .cell');
  await P.waitForSelector('.fstrip .fcell');

  const strip = await q(P, '.fstrip .fcell', els => els.map(e => ({
    form: e.dataset.form, off: e.disabled, gap: e.classList.contains('gap'),
    on: e.classList.contains('on'), label: e.querySelector('b').textContent,
    bar: e.querySelector('u').textContent,
  })));
  ck('나란히 보기에 정의된 폼이 card.json 차례로 전부 선다',
    strip.map(s => s.form).join(',') === WANT.join(','), strip.map(s => s.form).join(','));
  ck('폼 이름은 낱말 표에서 온다',
    strip.every(s => s.label === W(DEFS[s.form].word)), strip.map(s => s.label).join(','));
  ck('겹 수를 눈금으로 보여 준다',
    strip.every(s => s.bar.length === (DEFS[s.form].layers || 1)),
    strip.map(s => s.form + ':' + s.bar).join(' '));
  ck('그림이 다 있으면 빈 칸이 없다', strip.every(s => !s.gap && !s.off),
    strip.filter(s => s.gap || s.off).map(s => s.form).join(','));
  ck('처음에는 첫 폼이 골라져 있다',
    strip.filter(s => s.on).map(s => s.form).join(',') === WANT[0], strip.filter(s => s.on).length);

  await P.waitForFunction(() => {
    const i = document.querySelector('.big img');
    return i && i.complete && i.naturalWidth > 0;
  }, null, { timeout: 8000 }).catch(() => {});
  const big1 = await P.$eval('.big img', i => {
    const r = i.getBoundingClientRect();
    return [decodeURIComponent(i.currentSrc || i.src), i.naturalWidth,
            Math.round(Math.min(r.bottom, innerHeight) - Math.max(r.top, 0))];
  });
  ck('큰 그림이 실제로 실린다', big1[1] > 0, big1.join(' '));
  ck('큰 그림이 화면 안에 실제로 보인다', big1[2] > 100, big1.join(' '));
  ck('큰 그림은 썸네일이 아니라 원본이다', big1[0].indexOf('/thumb/') < 0, big1[0]);
  ck('큰 그림은 고른 폼의 것이다', big1[0].indexOf('_' + WANT[0] + '_') > 0, big1[0]);

  await P.click('.fstrip .fcell[data-form="' + WANT[1] + '"]');
  await P.waitForFunction(f => {
    const i = document.querySelector('.big img');
    return i && decodeURIComponent(i.src).indexOf('_' + f + '_') > 0;
  }, WANT[1], { timeout: 4000 }).catch(() => {});
  const big2 = await P.$eval('.big img', i => decodeURIComponent(i.src));
  ck('폼을 바꾸면 큰 그림이 바뀐다', big2.indexOf('_' + WANT[1] + '_') > 0, big2);

  const secs = await q(P, '.sec', els => els.map(e => e.textContent));
  ck('연출컷이 없으면 그 칸을 아예 안 그린다',
    !secs.some(t => t.indexOf(W('dex.action')) === 0), secs.join(' | '));
  ck('일상컷 칸은 뜬다', secs.some(t => t.indexOf(W('dex.casual')) === 0), secs.join(' | '));

  const casual = await q(P, '.gal img', els => els.map(i => [i.complete, i.naturalWidth]));
  ck('일상컷 그림이 실제로 실린다', casual.length > 0 && casual.every(c => c[1] > 0), JSON.stringify(casual));

  /* 가로로 잘리는 것이 없나. documentElement.scrollWidth 로는 못 본다 —
     껍데기가 .dex-page 를 overflow:hidden 으로 잠가서, 넘친 것은 스크롤이 생기는
     대신 소리 없이 잘린다. 그래서 칸마다 실제 자리를 재고, 옆으로 미는 상자
     안에 든 것만 봐준다 */
  const cut = await P.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll('main *')) {
      const r = el.getBoundingClientRect();
      if (!r.width && !r.height) continue;
      let p = el.parentElement, scroller = false;
      while (p && p !== document.body) {
        if (/auto|scroll/.test(getComputedStyle(p).overflowX)) { scroller = true; break; }
        p = p.parentElement;
      }
      if (scroller) continue;
      if (r.right > innerWidth + 1 || r.left < -1)
        bad.push(el.className || el.tagName);
    }
    return [...new Set(bad)];
  });
  ck('폴드 덮개(344) 에서 가로로 잘리는 칸이 없다', cut.length === 0, cut.join(' | '));

  /* 아래가 잘리지 않고 실제로 굴러가나. 껍데기 자리(.collection-scroll)를 안 쓰면
     화면은 멀쩡해 보이는데 스크롤만 안 된다 */
  const scroll = await P.evaluate(async () => {
    const box = document.querySelector('.collection-scroll');
    if (!box) return { why: '.collection-scroll 없음' };
    const room = box.scrollHeight - box.clientHeight;
    box.scrollTop = 9999;
    await new Promise(r => setTimeout(r, 120));
    return { room, at: box.scrollTop, tall: box.clientHeight,
             folded: document.querySelector('main').classList.contains('dex-scrolled') };
  });
  const innerH = await P.evaluate(() => innerHeight);
  /* 높이 0 짜리 상자도 "굴릴 자리"는 있다 — scrollHeight 만 보면 아무것도 안 보이는
     화면이 검사를 통과한다. 실제로 화면의 몫을 차지하는지 같이 본다 */
  ck('굴러가는 자리가 화면의 몫을 차지한다', scroll.tall > innerH / 4,
    scroll.tall + ' / ' + innerH);
  ck('아래로 굴릴 자리가 있다', scroll.room > 0, JSON.stringify(scroll));
  ck('실제로 굴러간다', scroll.at > 0, JSON.stringify(scroll));
  ck('굴리면 머리말이 접힌다(dex-scrolled)', scroll.folded === true, JSON.stringify(scroll));

  /* 끝까지 내렸을 때. 큰 그림이 화면의 절반을 넘으면 한 장이 화면을 다 먹고
     그 밑의 컷들이 저 아래로 밀린다. 마지막 칸이 화면 밑동에 붙어도 누르기 사납다 */
  const foot = await P.evaluate(() => {
    const box = document.querySelector('.collection-scroll'), r = box.getBoundingClientRect();
    const vis = el => { const b = el.getBoundingClientRect();
      return Math.round(Math.min(b.bottom, r.bottom) - Math.max(b.top, r.top)); };
    const last = box.lastElementChild, lb = last.getBoundingClientRect();
    return { tall: box.clientHeight,
      big: Math.round(document.querySelector('.big').getBoundingClientRect().height),
      lastSeen: vis(last), lastHigh: Math.round(lb.height),
      tail: box.scrollHeight - box.scrollTop - (Math.round(lb.bottom - r.top)) };
  });
  const innerH2 = await P.evaluate(() => innerHeight);
  ck('큰 그림이 화면의 절반을 넘지 않는다', foot.big <= innerH2 / 2,
    foot.big + ' / ' + innerH2);
  ck('끝까지 내리면 마지막 칸이 다 보인다', foot.lastSeen >= foot.lastHigh, JSON.stringify(foot));
  ck('마지막 칸 아래에 여백이 있다', foot.tail >= 32, JSON.stringify(foot));

  await P.evaluate(() => { document.querySelector('.collection-scroll').scrollTop = 0; });

  await P.click('.back');
  await P.waitForSelector('.grid .cell');
  ck('목록으로 돌아온다', (await P.$('.fstrip')) === null);
  await a.close();

  /* ── 2. 폼 둘을 지운 자료 ────────────────────────────── */
  const b = await h.open('dex.html', { viewport: FOLD.cover, mobile: true, init: [SWAP, withImg(TRIMMED)] });
  const Q = b.page;
  await Q.waitForSelector('.grid .cell');
  ck('갈아 끼운 자료를 읽었다', await Q.evaluate(() => !!window.__DEX_IMG__));

  const gapProg = W('art.form.done', { done: WANT.length - GONE.length, all: WANT.length });
  const gapCap = await q(Q, '.grid .cell .cap', els => els.map(e => e.textContent));
  ck('빠진 폼이 진척에 그대로 보인다 — ' + gapProg,
    gapCap.some(t => t.indexOf(gapProg) > 0), gapCap.join(' | '));

  await Q.click('.grid .cell');
  await Q.waitForSelector('.fstrip .fcell');
  const strip2 = await q(Q, '.fstrip .fcell', els => els.map(e => ({
    form: e.dataset.form, off: e.disabled, gap: e.classList.contains('gap'),
    ph: !!e.querySelector('.ph'), pressed: e.getAttribute('aria-pressed'),
  })));
  ck('없는 폼도 줄에서 자리를 지킨다',
    strip2.map(s => s.form).join(',') === WANT.join(','), strip2.map(s => s.form).join(','));
  ck('없는 폼은 빈 칸으로 표시된다',
    strip2.filter(s => s.gap).map(s => s.form).join(',') === GONE.join(','),
    strip2.filter(s => s.gap).map(s => s.form).join(','));
  ck('없는 폼은 아예 눌리지 않는다',
    strip2.every(s => s.off === s.gap), strip2.map(s => s.form + ':' + s.off).join(' '));
  ck('없는 폼 칸은 "' + W('art.missing') + '" 자리다',
    strip2.every(s => s.ph === s.gap), strip2.map(s => s.form + ':' + s.ph).join(' '));
  ck('없는 폼에는 고름 표시(aria-pressed)를 안 단다',
    strip2.filter(s => s.gap).every(s => s.pressed === null),
    strip2.map(s => s.form + ':' + s.pressed).join(' '));

  const left = W('art.form.left', { n: GONE.length });
  ck('남은 폼 수를 적어 둔다', (await q(Q, '.sec', els => els.map(e => e.textContent)))
    .some(t => t.indexOf(left) > 0), left);

  /* 빈 폼을 눌러도 큰 그림이 안 바뀐다 — 눌러지지 않아야 정상이다 */
  const before = await Q.$eval('.big img', i => decodeURIComponent(i.src));
  await Q.$eval('.fstrip .fcell[data-form="' + GONE[0] + '"]', e => e.click());
  const after = await Q.$eval('.big img', i => decodeURIComponent(i.src));
  ck('빈 폼을 눌러도 화면이 안 흔들린다', before === after, before + ' → ' + after);
  ck('갈아 끼운 판에도 페이지 오류가 없다', b.errors.length === 0, b.errors.join(' / '));
  await b.close();

  /* ── 3. 연출컷을 한 장 붙인 자료 ─────────────────────── */
  const c = await h.open('dex.html', { viewport: FOLD.cover, mobile: true, init: [SWAP, withImg(WITHACT)] });
  const R = c.page;
  await R.waitForSelector('.grid .cell');
  await R.click('.grid .cell');
  await R.waitForSelector('.fstrip .fcell');
  const secs3 = await q(R, '.sec', els => els.map(e => e.textContent));
  ck('연출컷이 있으면 그 칸이 뜬다',
    secs3.some(t => t.indexOf(W('dex.action')) === 0), secs3.join(' | '));
  ck('연출컷 수를 적는다',
    secs3.some(t => t.indexOf(W('dex.action')) === 0 && t.indexOf(W('art.count', { n: 1 })) > 0),
    secs3.join(' | '));

  /* 연출컷은 그 폼의 것이다 — 안 붙인 폼으로 옮기면 칸이 사라진다 */
  await R.click('.fstrip .fcell[data-form="' + WANT[1] + '"]');
  await R.waitForTimeout(120);
  const secs4 = await q(R, '.sec', els => els.map(e => e.textContent));
  ck('연출컷은 붙인 폼에만 뜬다',
    !secs4.some(t => t.indexOf(W('dex.action')) === 0), secs4.join(' | '));
  await c.close();

  await h.stop();
  report(rows, '도감 폼 보기');
})().catch(e => {
  ck('검사가 도중에 죽었다', false, String((e && e.message) || e).split('\n')[0]);
  report(rows, '도감 폼 보기');
  process.exit(1);
});
