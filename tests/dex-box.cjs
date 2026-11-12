/* 도감 표본 상자(2026-11-12) — 세 칸씩 상자 · 타입 색 띠 · 번호 도장, 그림 없는 종은 점선 상자에 「미발견」,
   세대 머리줄(보이는 칸 안에서 채운 종 / 종), 진행 막대(그림 있는 종 / 전체), 「목록으로」 한 줄 보기와 기억 */
const fs = require('node:fs'), assert = require('node:assert/strict');
const { start, FOLD } = require('./browser-harness.cjs');
const cards = JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards.character;
const img = JSON.parse(fs.readFileSync('data/img.json', 'utf8')).img;
const group = JSON.parse(fs.readFileSync('data/group.json', 'utf8'));
const have = cards.filter(c => img[c.name]).length;
const gen5 = cards.filter(c => c.gen === 5), gen5have = gen5.filter(c => img[c.name]).length;
const miss = cards.find(c => !img[c.name]), two = cards.find(c => img[c.name] && c.element2);
const hex = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')';
(async () => {
  const h = await start();
  try {
    const a = await h.open('dex.html', { viewport: FOLD.cover, mobile: true }), p = a.page;
    await p.waitForSelector('.grid > .cell');
    /* 세 칸 */
    const cols = await p.evaluate(() => getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length);
    assert.equal(cols, 3, '덮개에서 세 칸');
    /* 진행 막대 */
    const meter = await p.locator('.dex-meter b').textContent();
    assert.equal(meter.replace(/\s/g, ''), have + '/' + cards.length);
    /* 세대 머리줄 — 걸러지지 않았으면 세대마다 하나, 5세대는 그림 있는 종 / 종 */
    const heads = await p.locator('.gen-head').evaluateAll(es => es.map(e => [e.firstChild.textContent, e.querySelector('span').textContent.replace(/\s/g, '')]));
    assert.equal(heads.length, new Set(cards.map(c => c.gen)).size, '세대 머리줄 수');
    assert.deepEqual(heads[4][1], gen5have + '/' + gen5.length, '5세대 ' + JSON.stringify(heads[4]));
    /* 두 타입 카드의 색 띠는 반반, 순서대로 그 타입 색 */
    const stripe = await p.locator(`.grid > .cell[data-card="${two.name}"] .stripe u`).evaluateAll(es => es.map(e => getComputedStyle(e).backgroundColor));
    assert.deepEqual(stripe, [hex(group.color[two.element]), hex(group.color[two.element2])], two.name + ' 색 띠');
    /* 번호 도장 */
    assert.equal(await p.locator(`.grid > .cell[data-card="${two.name}"] .no`).textContent(), 'No.' + String(two.no).padStart(4, '0'));
    /* 그림 없는 종 — 점선 상자 · 번호 · 미발견, 이름은 남는다 */
    const m = p.locator(`.grid > .cell[data-card="${miss.name}"]`);
    assert.equal(await m.evaluate(e => getComputedStyle(e).borderTopStyle), 'dashed');
    assert.match(await m.locator('.ph').textContent(), new RegExp(String(miss.no).padStart(4, '0') + '미발견'));
    assert.equal(await m.locator('.cap strong').textContent(), miss.name);
    /* 거르면 세대 머리줄은 걸러진 것 안에서 센다 */
    await p.locator('.genre-strip button', { hasText: '5세대' }).click();
    await p.waitForFunction(() => document.querySelectorAll('.gen-head').length === 1);
    assert.equal((await p.locator('.gen-head span').textContent()).replace(/\s/g, ''), gen5have + '/' + gen5.length);
    /* 목록으로 — 한 칸, 영문명 · 타입이 보이고 색 띠는 숨는다. 새로 열어도 기억한다 */
    await p.locator('#dex-size').click();
    await p.waitForFunction(() => document.body.classList.contains('dex-compact'));
    const row = await p.evaluate(() => { const c = document.querySelector('.grid > .cell'), v = s => getComputedStyle(c.querySelector(s)).display;
      return { cols: getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length, en: v('.en'), types: v('.types'), stripe: v('.stripe'), h: c.getBoundingClientRect().height }; });
    assert.deepEqual([row.cols, row.en !== 'none', row.types !== 'none', row.stripe], [1, true, true, 'none'], JSON.stringify(row));
    assert(row.h >= 60 && row.h <= 80, '줄 높이 ' + row.h);
    await p.reload(); await p.waitForSelector('.grid > .cell');
    assert(await p.evaluate(() => document.body.classList.contains('dex-compact')), '목록 보기를 기억');
    assert.deepEqual(a.errors, []);
    assert.deepEqual(await p.evaluate(() => window.AtelierWords.missing()), []);
    await a.close();
    console.log('PASS dex box: 3 columns, type stripes, number stamps, missing boxes, gen heads, meter, row view remembered');
  } finally { await h.stop(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
