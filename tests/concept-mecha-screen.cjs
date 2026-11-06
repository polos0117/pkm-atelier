/* 생성기 「메카 컨셉」 갈래 = 명령줄 도구 — 같은 선택이면 화면 지시문이 tools/concept-mecha.cjs 와 글자 하나 다르지 않다(2026-11-06).
   탭 · 화풍 · 칸 직접 고르기 · 실루엣이 정하는 칸 막힘 · 씨앗 · 타입 표현 자동 / 직접(하나만 · 둘째 타입) · 자동 초안 종 · 저장값 · 폰 넘침
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/concept-mecha-screen.cjs */
'use strict';
const assert = require('node:assert/strict'), path = require('node:path');
const H = require('./browser-harness.cjs');
const M = require(path.join(__dirname, '..', 'tools', 'concept-mecha.cjs')), CM = M.CM;
const same = (card, o, style) => CM.build(card, CM.choose(card, Object.assign({ set: {}, fx: null, mix: false, seed: '', strict: false }, o), []).ch, style);

(async () => {
  const t = await H.start(); let n = 0;
  try {
    for (const vp of [{ width: 1280, height: 900 }, H.FOLD.cover]) {
      const o = await t.open('prompt.html?mech=' + encodeURIComponent('꼬부기'), { viewport: vp }), p = o.page;
      await p.waitForSelector('#mode-concept');
      await p.click('#mode-concept'); await p.waitForSelector('#concept-panel');
      const out = () => p.inputValue('#prompt-output');
      /* 처음 — 자동 · 기본 화풍 */
      assert.equal(await out(), same('꼬부기', {}), '자동 = 도구'); n++;
      /* 큰 실루엣을 기사 갑주로 — 어깨 칸이 막히고, 다리는 직접 */
      await p.selectOption('#concept-silhouette', 'knight_plate');
      assert.equal(await p.isDisabled('#concept-shoulders'), true, '실루엣이 정하는 칸 막힘'); n++;
      await p.selectOption('#concept-legs', 'heels');
      assert.equal(await out(), same('꼬부기', { set: { silhouette: 'knight_plate', legs: 'heels' } }), '직접 고른 칸 = 도구'); n++;
      /* 화풍 · 씨앗 */
      await p.selectOption('#concept-style', 'mmorpg2d');
      await p.fill('#concept-seed', '7');
      assert.equal(await out(), same('꼬부기', { set: { silhouette: 'knight_plate', legs: 'heels' }, seed: '7' }, 'mmorpg2d'), '화풍 · 씨앗 = 도구'); n++;
      /* 타입 표현 직접 — 자동을 끄면 지금 고른 셋이 체크된 채로, 오라 하나만 남기기 */
      await p.uncheck('#concept-fx-auto'); await p.waitForSelector('#concept-fx-list');
      for (const k of ['hand', 'seams', 'aura', 'hair', 'orbit', 'ground', 'trail']) if (k !== 'aura' && await p.isChecked('#concept-fx-' + k)) await p.uncheck('#concept-fx-' + k);
      if (!await p.isChecked('#concept-fx-aura')) await p.check('#concept-fx-aura');
      const txt = await out();
      assert.equal(txt, same('꼬부기', { set: { silhouette: 'knight_plate', legs: 'heels' }, seed: '7', fx: [{ key: 'aura', type: '' }] }, 'mmorpg2d'), '타입 표현 하나만 = 도구');
      assert(txt.includes('both hands relaxed at her sides') && txt.includes('Her whole silhouette is outlined'), '손 없이 · 오라만'); n++;
      /* 저장값 — 새로고침해도 그대로 */
      await p.reload(); await p.waitForSelector('#concept-panel');
      assert.equal(await out(), txt, '새로고침 뒤 같은 지시문'); n++;
      /* 두 타입 종 — 표현마다 타입 */
      await p.selectOption('#source', '갸라도스'); await p.click('#mode-concept'); await p.waitForSelector('#concept-panel');   /* 갈래는 카드마다 저장된다 */
      await p.uncheck('#concept-fx-auto').catch(() => {});
      for (const k of ['hand', 'seams', 'aura', 'hair', 'orbit', 'ground', 'trail']) if (await p.isChecked('#concept-fx-' + k)) await p.uncheck('#concept-fx-' + k);
      await p.check('#concept-fx-hand'); await p.check('#concept-fx-aura');
      await p.selectOption('#concept-fx-type-aura', 'flying');
      const g = await out();
      assert.equal(g, same('갸라도스', { fx: [{ key: 'hand', type: '' }, { key: 'aura', type: 'flying' }] }), '두 타입 = 도구');
      assert(g.includes('outlined by a pale sky-blue glow'), '오라는 비행'); n++;
      /* 자동 초안 종 */
      await p.selectOption('#source', '파이리'); await p.click('#mode-concept'); await p.waitForSelector('#concept-panel');
      assert(await p.isVisible('#concept-draft'), '자동 초안 안내');
      assert.equal(await out(), same('파이리', {}), '자동 초안 = 도구'); n++;
      /* 폰 — 가로 넘침 없음 */
      const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      assert(over <= 1, '가로 넘침 ' + over + ' @' + vp.width); n++;
      assert.deepEqual(o.errors, [], '콘솔 오류');
      await o.close();
    }
    console.log('PASS 메카 컨셉 화면: 탭 · 자동 · 칸 직접 · 실루엣이 정하는 칸 막힘 · 화풍 · 씨앗 · 타입 표현 하나만 · 두 타입 · 자동 초안 · 새로고침 · 폰 넘침 = 도구 지시문 — ' + n + '가지');
  } finally { await t.stop(); }
})().catch(e => { console.error(e); process.exit(1); });
