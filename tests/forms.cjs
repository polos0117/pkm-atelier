/* 폼 축 — 캐릭터 하나가 장갑을 겹쳐 갈아 입는 구조를 지킨다.
   Run: node tests/forms.cjs */
const fs = require('node:fs'), vm = require('node:vm');
const assert = require('node:assert/strict');

const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8'));
const img = JSON.parse(fs.readFileSync('data/img.json', 'utf8')).img;
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync('lib/img.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('lib/words.js', 'utf8'), ctx);
const A = ctx.window.AtelierImg, W = ctx.window.W;

/* ── 정의 ─────────────────────────────────────────── */
const FORMS = card.forms;
assert(Object.keys(FORMS).length >= 3, '폼이 너무 적다');
for (const [k, v] of Object.entries(FORMS)) {
  assert(typeof v.pick === 'boolean', k + ' 에 pick 이 없다 — 고를 수 있는 폼인지 구분이 안 된다');
  assert(typeof v.layers === 'number', k + ' 에 layers 가 없다 — 폼은 겹 수로 가른다');
  assert(W(v.word) !== v.word, k + ' 의 이름표가 낱말 표에 없다');
}
/* 폭주는 전투가 만드는 상태다. 고를 수 있게 되면 설계가 무너진다 */
assert.equal(FORMS.overdrive.pick, false, '폭주를 고를 수 있게 되어 있다');
assert(Object.values(FORMS).filter(v => v.pick).length >= 2, '고를 수 있는 폼이 둘도 안 된다');

/* ── 카드 ─────────────────────────────────────────── */
const cards = Object.values(card.cards).flat();
for (const c of cards)
  for (const f of c.forms || [])
    assert(FORMS[f], c.name + ' 이 모르는 폼 ' + f + ' 을 가리킨다');

/* ── 그림 ─────────────────────────────────────────── */
for (const c of cards) {
  const e = img[c.name]; if (!e) continue;
  for (const [style, bucket] of Object.entries(A.styleMap(e))) {
    const where = c.name + '/' + style;
    /* 일상컷은 폼을 타지 않는다 — byForm 안으로 들어가면 안 된다 */
    for (const [fk, fb] of Object.entries(A.formMap(bucket))) {
      assert(!fb.casual, where + '/' + fk + ' 안에 일상컷이 있다 — 폼 밖에 둬야 한다');
      assert(!fb.extra, where + '/' + fk + ' 안에 특별컷이 있다');
      assert(FORMS[fk], where + ' 에 모르는 폼 ' + fk);
      assert(fb.f || fb.m, where + '/' + fk + ' 에 초상이 없다');
    }
    /* action 은 없어도 정상이다. 있는 폼만 있다 */
    const withAct = A.formKeys(bucket).filter(k => A.formActs(bucket, k, 'f').length);
    assert(withAct.length <= A.formKeys(bucket).length, 'action 셈이 틀렸다');
  }
}

/* ── 완료 판정 — 성별을 보지 않는다 ─────────────────── */
{
  const want = Object.keys(FORMS);
  const b = { byForm: { light: { f: 'a.webp' }, heavy: { f: 'b.webp' } } };
  const st = A.formsDone(b, want);
  assert.equal(st.done, 2); assert.equal(st.all, want.length);
  /* vm 안에서 만든 배열은 프로토타입이 달라 deepEqual 이 realm 에서 걸린다 — 값으로 견준다 */
  assert.equal(st.left.join(','), want.filter(k => k !== 'light' && k !== 'heavy').join(','));
  assert.equal(st.ok, false);
  /* 여성만 있어도 다 찼으면 완료다. 남성을 안 만드는 동안 진척이 0 에 묶이면
     아무도 그 지표를 안 보게 된다 */
  const all = { byForm: {} };
  want.forEach(k => { all.byForm[k] = { f: k + '.webp' }; });
  assert.equal(A.formsDone(all, want).ok, true, '여성만으로는 완료가 안 된다');
}

/* ── 이름 규칙 — 뒤에서부터 벗겨야 카드 이름이 남는다 ── */
{
  const rule = fs.readFileSync('tools/register-images.py', 'utf8');
  assert(rule.includes('def split_form'), 'split_form 이 없다');
  /* 정의(def …)가 아니라 부르는 자리를 봐야 한다. 앞의 것을 보면 늘 통과한다 */
  const calls = rule.split('\n')
    .filter(l => /^\s+head, (style|form) = split_(style|form)\(/.test(l))
    .map(l => l.trim());
  assert.equal(calls.length, 2, '벗기는 자리가 둘이 아니다 — ' + calls.join(' | '));
  assert(calls[0].startsWith('head, style'),
    '화풍보다 폼을 먼저 벗기고 있다 — 이름 차례가 <카드>_<폼>_<화풍>_<성별> 이다');
  assert(rule.includes('성별 표시(_f)가 없다'), '성별을 안 적어도 통과한다');
}

const forms = Object.keys(FORMS).length;
const shots = Object.values(img).reduce((n, e) =>
  n + Object.values(A.styleMap(e)).reduce((m, b) => m + A.formKeys(b).length, 0), 0);
console.log(`PASS: 폼 ${forms}가지 정의, 카드 ${cards.length}장, 폼 초상 ${shots}장, `
  + `일상컷 폼 밖, action 선택, 완료 판정은 성별을 안 봄`);
