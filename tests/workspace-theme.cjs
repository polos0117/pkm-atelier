const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const source = fs.readFileSync('lib/workspace-theme.js', 'utf8');
const ui = fs.readFileSync('lib/workspace-ui.js', 'utf8');
const css = fs.readFileSync('lib/workspace.css', 'utf8');
const stored = new Map();
const events = new Map();
const viewportEvents = new Map();
const properties = new Map();
const frames = [];
const meta = { content: '' };
const root = {
  dataset: {},
  style: { setProperty: (key, value) => properties.set(key, value) }
};
const window = {
  innerHeight: 800,
  visualViewport: {
    height: 704,
    addEventListener: (type, fn) => viewportEvents.set(type, fn)
  },
  addEventListener: (type, fn) => events.set(type, fn),
  dispatchEvent: () => {}
};

vm.runInNewContext(source, {
  window,
  document: {
    documentElement: root,
    querySelector: selector => selector === 'meta[name="theme-color"]' ? meta : null
  },
  localStorage: {
    getItem: key => stored.has(key) ? stored.get(key) : null,
    setItem: (key, value) => stored.set(key, value)
  },
  requestAnimationFrame: fn => { frames.push(fn); return frames.length; },
  cancelAnimationFrame: () => {},
  Event: function Event(type) { this.type = type; }
});

while (frames.length) frames.shift()();
assert.equal(root.dataset.theme, 'midnight');
assert.equal(meta.content, '#101925');
assert.equal(properties.get('--atelier-vh'), '704px');

window.AtelierAppearance.set('theme', 'blossom');
assert.equal(root.dataset.theme, 'blossom');
assert.equal(stored.get('atelier_theme_v1'), 'blossom');
assert.equal(meta.content, '#f7f8fa');

window.AtelierAppearance.set('theme', 'daylight');
assert.equal(root.dataset.theme, 'daylight');
assert.equal(meta.content, '#edf1f5');

window.AtelierAppearance.set('theme', 'moss');
assert.equal(root.dataset.theme, 'moss');
assert.equal(stored.get('atelier_theme_v1'), 'moss');
assert.equal(meta.content, '#121a14');

window.AtelierAppearance.set('theme', 'plum');
assert.equal(root.dataset.theme, 'plum');
assert.equal(meta.content, '#1c141b');

for (const [name, color] of [['sand', '#f3efe4'], ['deep', '#0d1d25'], ['ember', '#1d1710']]) {
  window.AtelierAppearance.set('theme', name);
  assert.equal(root.dataset.theme, name);
  assert.equal(stored.get('atelier_theme_v1'), name);
  assert.equal(meta.content, color, name + ' 의 theme-color');
}

window.AtelierAppearance.set('theme', 'unknown');
assert.equal(root.dataset.theme, 'midnight');
assert.equal(meta.content, '#101925');

/* 고르개·토큰·함선 이름이 테마마다 다 있어야 한다 */
const THEMES = [["midnight", "MIDNIGHT / 01"], ["daylight", "DAYLIGHT / 02"], ["blossom", "BLOSSOM / 03"], ["moss", "MOSS / 04"], ["plum", "PLUM / 05"], ["sand", "SAND / 06"], ["deep", "DEEP / 07"], ["ember", "EMBER / 08"]];
for (const [key, sign] of THEMES) {
  assert(ui.includes("<option value=\"" + key + "\">${W('theme." + key + "')}</option>"),
    key + ' 고르개 항목이 낱말 표를 안 쓴다');
  if (key !== 'midnight') assert(css.includes(':root[data-theme="' + key + '"] {'), key + ' 토큰이 없다');
  assert(css.includes("content:'" + sign + "'"), sign + ' 이 없다');
}
/* 주제에 묶인 말이 겉모습 층에 돌아오지 않게 한다 */
assert(!/fleet|함대|함선/i.test(css + ui), '겉모습 층에 주제 낱말이 들어왔다');

/* 결은 body 에만 깐다 — 카드나 글자 위에 깔면 읽기가 나빠진다 */
for (const key of ['plum', 'deep', 'ember'])
  assert(css.includes('[data-theme="' + key + '"] body {background-color:var(--bg);background-image:'),
    key + ' 의 결이 body 에 걸려 있지 않다');
/* 테마마다 제 문장이 있어야 한다. 하나라도 빠지면 조용히 미드나이트 것이 나온다 */
const marks = ui.slice(ui.indexOf('const CREST_MARK'), ui.indexOf('const MARK_STYLE'));
for (const [key] of THEMES)
  assert(marks.includes('\n  ' + key + ': ['), key + ' 문장이 없다');
/* 색을 박으면 테마를 바꿔도 안 따라온다 */
assert(!/#[0-9a-f]{3,6}/i.test(marks), '문장에 색을 박았다');
/* 넷이 서로 달라야 한다 — 베껴 두고 안 고친 것을 잡는다 */
const shapes = [...marks.matchAll(/\['([Mm][^']+)'/g)].map(m => m[1]);
assert(shapes.length >= 27, '문장 도형이 너무 적다 — ' + shapes.length);
assert.equal(new Set(shapes).size, shapes.length, '문장에 같은 도형이 두 번 있다');
assert(ui.includes('CREST_MARK[theme] || CREST_MARK.midnight'), '모르는 테마의 되돌림이 없다');
/* 도형을 모듈 자리에 담아 둔 VNode 로 두면 다시 그릴 때 내용이 빠질 수 있다.
   자료로 두고 그릴 때마다 새로 만드는지 본다 */
assert(!/:\s*html`/.test(marks), '문장을 VNode 로 담아 두었다 — 자료로 두고 그릴 때 만든다');
assert(/CREST_MARK\[theme\][^;]*\.map\(/.test(ui.replace(/\n/g, ' ')), '문장을 그릴 때 만들지 않는다');
assert(viewportEvents.has('resize'));
assert(events.has('storage'));

console.log('PASS: 여덟 테마, theme colors, storage normalization and visible viewport sizing');
