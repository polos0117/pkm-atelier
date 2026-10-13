/* 그림 저장소 여럿 — 옛 주소는 한 글자도 안 바뀌고, where 에 적힌 그림만 다음 저장소로 간다.
   Run: node tests/img-shards.cjs
   - where 가 없으면 등록된 모든 파일의 원본·썸네일 주소가 BASES[0] + 파일 이름 그대로(저장소를 나누기 전과 같다)
   - where 에 적힌 파일은 원본·썸네일·thumbTag 의 되돌림(onerror)까지 그 저장소로
   - 실제 data/img.json 의 where 값이 맞는 번호다(0 번은 적지 않는다)
   - lib/img.js 의 BASES · tools/register-images.py 의 SHARDS · 워크플로가 받는 저장소 · .gitignore 가 같은 차례 */
const fs = require('node:fs'), vm = require('node:vm');
const assert = require('node:assert/strict');

const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('lib/img.js', 'utf8'), ctx);
const A = ctx.window.AtelierImg;
const doc = JSON.parse(fs.readFileSync('data/img.json', 'utf8'));
const files = [...new Set(Object.values(doc.img).flatMap(e => A.allShotsOf(e).concat(
  ...Object.values(A.styleMap(e)).flatMap(b => Object.values(A.formMap(b)).flatMap(f => [f.f, f.m, ...A.cuts(f, 'action', 'f'), ...A.cuts(f, 'action', 'm')]))
)).filter(Boolean))];
assert(files.length > 1000, '등록 파일을 다 모았다: ' + files.length);

/* 1. 옛 주소 그대로 — where 없음 */
const OLD = 'https://polos0117.github.io/pkm-atelier-img/img/';
const enc = f => encodeURIComponent(f).replace(/'/g, '%27');
A.setShards({ img: doc.img });
assert.equal(A.BASE, OLD, '첫 저장소 주소');
assert.equal(A.BASES[0], OLD);
for (const f of files) {
  assert.equal(A.imgURL(f), OLD + enc(f), f);
  assert.equal(A.thumbURL(f), OLD + 'thumb/' + enc(f), f);
}

/* 2. where 에 적힌 것만 옮긴다. 이상한 번호(0·없는 번호·소수·글자)는 무시하고 첫 저장소로 */
const two = A.BASES[1], [x, y] = files;
assert.equal(two, 'https://polos0117.github.io/pkm-atelier-img-2/img/');
A.setShards({ where: { [x]: 1, [y]: 0, 'a.webp': 9, 'b.webp': 0.5, 'c.webp': '1' } });
assert.equal(A.imgURL(x), two + enc(x));
assert.equal(A.thumbURL(x), two + 'thumb/' + enc(x));
const tag = A.thumbTag(x);
assert(tag.includes('src="' + two + 'thumb/' + enc(x) + '"') && tag.includes("this.src='" + two + enc(x) + "'"), '썸네일·되돌림 둘 다 둘째 저장소: ' + tag);
for (const f of [y, 'a.webp', 'b.webp', 'c.webp']) assert.equal(A.imgURL(f), OLD + enc(f), f + ' 는 첫 저장소');
/* load 로 읽어도 같이 맞춰진다 — 문서를 바꿔 읽으면 앞 자리가 남지 않는다 */
A.setShards({});
assert.equal(A.imgURL(x), OLD + enc(x), '자리를 비우면 다시 첫 저장소');

/* 3. 실제 자료 */
const where = doc.where || {};
for (const [f, i] of Object.entries(where)) {
  assert(Number.isInteger(i) && i > 0 && i < A.BASES.length, f + ' 의 저장소 번호 ' + i);
  assert(files.includes(f) || /^style-/.test(f), f + ' 는 등록되지 않은 파일인데 where 에 있다');
}

/* 4. 차례 — 저장소를 더할 때 한 곳만 고치면 여기서 걸린다 */
const py = fs.readFileSync('tools/register-images.py', 'utf8');
const SHARDS = JSON.parse(py.match(/^SHARDS = (\[.*\])$/m)[1]);
const EXTRA = JSON.parse(py.match(/^EXTRA_DIRS = (\[.*\])$/m)[1]);
assert.equal(SHARDS.length, A.BASES.length, '저장소 수');
SHARDS.forEach((s, i) => assert.equal(A.BASES[i], 'https://polos0117.github.io/' + s + '/img/', i + ' 번 저장소'));
assert.deepEqual(EXTRA, SHARDS.slice(1).map((_, i) => 'img-' + (i + 2)), '둘째부터의 자리 이름은 img-N');
const wf = fs.readFileSync('.github/workflows/register-images.yml', 'utf8');
SHARDS.forEach((s, i) => {
  const path = i ? 'img-repo-' + (i + 1) : 'img-repo';
  assert(new RegExp('repository: polos0117/' + s + '\\s*\\n\\s*path: ' + path + '\\b').test(wf), s + ' 를 ' + path + ' 로 받는다');
  assert(wf.includes('ln -s ' + path + '/img ' + (i ? EXTRA[i - 1] : 'img')), path + ' 를 잇는다');
  if (i) assert(new RegExp('continue-on-error: true\\s*\\n\\s*with:\\s*\\n\\s*repository: polos0117/' + s + '\\b').test(wf), s + ' 를 못 받아도 등록은 돈다');
});
const ignore = fs.readFileSync('.gitignore', 'utf8').split('\n');
for (const d of ['img', ...EXTRA]) assert(ignore.includes('/' + d), d + ' 는 올리지 않는다');
console.log(`PASS 그림 저장소: 옛 주소 ${files.length}개 그대로 · where 에 적힌 것만 둘째 저장소부터 · 자료 where ${Object.keys(where).length} · BASES=SHARDS=워크플로`);
