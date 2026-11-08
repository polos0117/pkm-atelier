/* 생성기 「새 인물 만들기」 의 메카 옵션(2026-11-06 「그 신규 생성에 붙여줘. 옵션값으로」) — 큰 실루엣 · 부위 부품 · 타입 표현.
   기본 없음 = 지금 지시문 그대로 · 고른 칸만 FORM 줄 뒤에 MECHA SILHOUETTE / TYPE EFFECTS 줄(lib/concept-mecha.js lines 와 같은 글)
   실루엣이 정하는 칸 막힘 · 두 타입 종은 표현마다 타입 · 저장값 · 이어가기(reference) · 일상컷에는 없음 · 따로 있던 탭은 없음 · 폰 넘침
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/concept-mecha-screen.cjs */
'use strict';
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs');
const H = require('./browser-harness.cjs');
const ROOT = path.join(__dirname, '..');
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'concept-mecha.json'), 'utf8'));
const CM = require(path.join(ROOT, 'lib', 'concept-mecha.js'));

(async () => {
  const t = await H.start(); let n = 0;
  try {
    for (const vp of [{ width: 1280, height: 900 }, H.FOLD.cover]) {
      const o = await t.open('prompt.html?mech=' + encodeURIComponent('꼬부기'), { viewport: vp }), p = o.page;
      await p.waitForSelector('#mecha-options');
      const out = () => p.inputValue('#prompt-output');
      assert.equal(await p.$('#mode-concept'), null, '따로 있던 메카 컨셉 탭은 없다'); n++;
      /* 기본 — 줄 없음 */
      const base = await out();
      assert(!/MECHA SILHOUETTE|TYPE EFFECTS/.test(base), '기본은 없음'); n++;
      /* 큰 실루엣 기사 갑주 — 어깨 칸 막힘 · 다리 직접 */
      await p.selectOption('#mecha-silhouette', 'knight_plate');
      assert.equal(await p.isDisabled('#mecha-shoulders'), true, '실루엣이 정하는 칸 막힘'); n++;
      await p.selectOption('#mecha-legs', 'heels');
      const [sil] = CM.lines(C, ['water'], { set: { silhouette: 'knight_plate', legs: 'heels' } });
      let txt = await out();
      assert(txt.includes(sil), 'MECHA SILHOUETTE 줄 = lines'); n++;
      const paras = txt.split('\n\n'), form = await p.evaluate(() => window.AtelierSpec.FORM_LINES.light);
      assert.equal(paras[paras.indexOf(sil) - 2], form, 'FORM 줄 · ARMOR 줄 뒤'); n++;
      assert.equal(paras[paras.indexOf(sil) - 1], await p.evaluate(() => window.AtelierSpec.PROMPT_LINES.armor), 'ARMOR 줄(2026-11-08) 바로 뒤'); n++;
      assert.equal(txt.replace('\n\n' + sil, ''), base, '그 줄 말고는 그대로'); n++;
      /* 타입 표현 하나만 — 오라 */
      await p.check('#mecha-fx-aura');
      const want = CM.lines(C, ['water'], { set: { silhouette: 'knight_plate', legs: 'heels' }, fx: [{ key: 'aura', type: '' }] });
      txt = await out();
      assert(txt.includes(want[1]) && /^TYPE EFFECTS: Her whole silhouette is outlined/.test(want[1]), 'TYPE EFFECTS 줄 = lines'); n++;
      /* 저장값 — 새로고침해도 그대로 */
      await p.reload(); await p.waitForSelector('#mecha-options');
      assert.equal(await out(), txt, '새로고침 뒤 같은 지시문'); n++;
      /* 이어가기(확정한 이미지) — 옵션도 줄도 없다 */
      await p.selectOption('#identity-mode', 'reference');
      assert.equal(await p.$('#mecha-options'), null, '이어가기에는 옵션 없음');
      assert(!/MECHA SILHOUETTE|TYPE EFFECTS/.test(await out()), '이어가기 지시문에 줄 없음'); n++;
      await p.selectOption('#identity-mode', 'create'); await p.waitForSelector('#mecha-options');
      /* 모두 없음으로 — 처음 지시문 */
      await p.click('#mecha-clear');
      assert.equal(await out(), base, '모두 없음 = 처음'); n++;
      /* 일상컷에는 없다 */
      await p.click('#mode-casual');
      assert.equal(await p.$('#mecha-options'), null, '일상컷에는 옵션 없음'); n++;
      await p.click('#mode-action'); await p.waitForSelector('#mecha-options');
      /* 두 타입 종 — 표현마다 타입 */
      await p.selectOption('#source', '갸라도스'); await p.waitForSelector('#mecha-options');
      await p.check('#mecha-fx-hand'); await p.check('#mecha-fx-aura');
      await p.selectOption('#mecha-fx-type-aura', 'flying');
      const g = CM.lines(C, ['water', 'flying'], { fx: [{ key: 'hand', type: '' }, { key: 'aura', type: 'flying' }] });
      txt = await out();
      assert(txt.includes(g[0]) && g[0].includes('pale sky-blue glow') && !txt.includes('MECHA SILHOUETTE'), '두 타입 = lines · 오라는 비행'); n++;
      /* 폰 — 가로 넘침 없음 */
      const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert(over <= 1, '가로 넘침 ' + over + ' @' + vp.width); n++;
      assert.deepEqual(o.errors, [], '콘솔 오류');
      await o.close();
    }
    console.log('PASS 새 인물 만들기 메카 옵션: 탭 없음 · 기본 없음 · 실루엣 칸 막힘 · 실루엣 줄 · 타입 표현 줄 · 새로고침 · 이어가기 · 모두 없음 · 일상컷 · 두 타입 · 폰 넘침 — ' + n + '가지');
  } finally { await t.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
