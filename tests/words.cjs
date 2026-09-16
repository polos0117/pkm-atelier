/* 낱말이 코드에 박히지 않았는지 본다.
   앞선 저장소는 화면 190 자리에 주제 낱말이 박혀 있어서, 주제를 바꾸니
   "모함 건업" 같은 것이 떴다. 그 일이 다시 나지 않게 처음부터 막는다.
   Run: node tests/words.cjs */
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path');
const assert = require('node:assert/strict');

const ctx = { window: {}, console: { warn() {} } };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('lib/words.js', 'utf8'), ctx);
const AW = ctx.window.AtelierWords, W = AW.W;

/* 표가 제 일을 하나 */
assert.equal(typeof W, 'function');
assert.equal(W('art.count', { n: 3 }), '3장', '자리표시자를 안 채운다');
assert.equal(W('없는열쇠'), '없는열쇠', '없는 열쇠는 열쇠를 돌려줘야 한다');
assert(AW.missing().includes('없는열쇠'), '없는 열쇠를 안 적어 둔다');
AW.load({ 'kind.unit': '병종' });
assert.equal(W('kind.unit'), '병종', '표를 갈아 끼울 수 없다');

/* 화면 코드가 말을 직접 적고 있지 않나 — 한글이 보이면 낱말 표로 빼야 한다.
   lib/words.js 와 주석은 뺀다 */
/* <title> 만은 예외다 — HTML 이 읽히는 순간 필요해서 자바스크립트로 넣을 수 없다.
   대신 낱말 표의 app.title 과 같은지 따로 본다(아래). 나머지는 전부 표에서 온다 */
const strip = s => s
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<title>[^<]*<\/title>/g, '');
const targets = [];
for (const dir of ['.', 'lib']) {
  for (const f of fs.readdirSync(dir)) {
    const p = dir === '.' ? f : dir + '/' + f;
    if (!/\.(html|js)$/.test(f)) continue;
    if (p === 'lib/words.js' || !fs.statSync(p).isFile()) continue;
    targets.push(p);
  }
}
assert(targets.length >= 2, '볼 파일이 없다 — ' + targets.join(', '));
const found = [];
for (const p of targets) {
  const body = strip(fs.readFileSync(p, 'utf8'));
  const hits = body.match(/[가-힣][가-힣 ]{1,}/g) || [];
  if (hits.length) found.push(p + ': ' + [...new Set(hits)].slice(0, 5).join(' · '));
}
assert.equal(found.length, 0,
  '화면 코드에 한글이 박혀 있다. lib/words.js 로 뺄 것\n  ' + found.join('\n  '));

/* 한글이 아니어도 말은 말이다 — 앞선 저장소에서 옮겨 온 상표가 남아 있으면 잡는다.
   window.AtelierWords 처럼 이름으로 쓰는 것은 뺀다. 그것은 화면에 안 뜬다 */
for (const p of targets) {
  const body = strip(fs.readFileSync(p, 'utf8')).replace(/Atelier[A-Z]\w*/g, '');
  for (const w of ['ATELIER', 'Atelier', 'MOBILE SUIT', 'GUNDAM', '건담'])
    assert(!body.includes(w), p + ' 에 ' + w + ' 가 박혀 있다 — lib/words.js 로 뺄 것');
}

/* 정적 <title> 은 낱말 표와 갈리면 안 된다 */
for (const p of targets.filter(x => x.endsWith('.html'))) {
  const m = fs.readFileSync(p, 'utf8').match(/<title>([^<]*)<\/title>/);
  if (!m) continue;
  assert.equal(m[1], AW.table['app.title'],
    p + ' 의 <title> 이 낱말 표의 app.title 과 다르다');
}

console.log(`PASS: 낱말 표 동작, 갈아 끼우기, 없는 열쇠 보고, 화면 ${targets.length}개에 박힌 말 없음, <title> 은 표와 일치`);
