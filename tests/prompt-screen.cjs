/* 툴킷 화면이 이 저장소 자료로 실제로 도나.

   prompt.html 은 atelier 에서 한 글자도 안 고치고 옮겨 왔다. 고친 것은
   부르는 자리뿐이다 — 자료 표 이름, 카드 파일, 없는 화면 링크.
   그래서 여기서 볼 것은 "말이 바뀌었나" 가 아니라 "선이 이어졌나" 다.

   화면 말(한글 1,189자리)은 아직 안 뺐다. tests/words.cjs 의 PENDING 이 지켜본다.
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/prompt-screen.cjs */
const fs = require('node:fs');
const { start, report, FOLD } = require('./browser-harness.cjs');

const CARD = JSON.parse(fs.readFileSync('data/card.json', 'utf8'));
const NAME = CARD.cards.character[0].name;
const GROUP = JSON.parse(fs.readFileSync('data/group.json', 'utf8'));

const rows = [];
const ck = (n, ok, got) => rows.push([n, !!ok, got === undefined ? '' : String(got)]);

(async () => {
  const h = await start();
  const a = await h.open('prompt.html', { viewport: FOLD.inner, mobile: true });
  const P = a.page;
  /* 못 받은 것을 모은다. 그림·기록은 아직 없는 것이 정상이라 따로 가른다 */
  const missing = [];
  P.on('response', r => { if (r.status() >= 400) missing.push(r.url().split('/').pop()); });
  /* 선을 하나만 끊어도 화면이 통째로 안 선다. 그때 30초 기다리다 죽으면
     무엇이 없어서 못 섰는지가 한 줄도 안 남는다 — 짧게 기다리고 그대로 보고한다 */
  const stood = await P.waitForSelector('select', { timeout: 6000 }).then(() => true, () => false);
  await P.waitForTimeout(stood ? 1500 : 500);

  ck('페이지 오류 없음', a.errors.length === 0, a.errors.join(' / '));
  ck('화면이 선다', stood, await P.evaluate(() => (document.body.innerText || '').slice(0, 80)));
  ck('제목이 낱말 표와 같다', await P.title() === '제목 미정', await P.title());

  /* 자료 표가 실렸나 — 고르개가 표에서 나온다 */
  const sels = await P.$$eval('select', els => els.length);
  ck('설정 고르개가 표에서 선다 (40개 넘게)', sels > 40, sels);

  const cardSel = await P.$$eval('select', (els, n) =>
    els.findIndex(e => [...e.options].some(o => o.textContent.includes(n))), NAME);
  ck('카드 고르개에 card.json 의 카드가 뜬다', cardSel >= 0, cardSel);

  const groupSel = await P.$$eval('select', (els, label) =>
    els.some(e => [...e.options].some(o => o.textContent.trim() === label)),
    GROUP.name[GROUP.order[0]]);
  ck('묶음 고르개가 group.json 을 읽는다', groupSel, GROUP.name[GROUP.order[0]]);

  /* 없는 파일을 부르고 있지 않나 — 코드·자료는 다 있어야 한다.
     toolkit-data.json 은 아직 커밋한 기록이 없어 정상적으로 404 다 */
  const codeMissing = missing.filter(f => /\.(js|css|json|html)$/.test(f) && f !== 'toolkit-data.json');
  ck('코드·자료를 다 찾는다', codeMissing.length === 0, [...new Set(codeMissing)].join(' '));

  if (!stood) { await a.close(); await h.stop(); return report(rows, '툴킷 화면'); }

  /* 세 탭이 실제로 글을 뽑나 */
  /* $$eval 은 넘길 값을 하나만 받는다 — 둘을 묶어 보낸다 */
  const val = await P.$$eval('select', (els, arg) =>
    [...els[arg.i].options].find(o => o.textContent.includes(arg.n)).value,
    { i: cardSel, n: NAME });
  await P.selectOption('select >> nth=' + cardSel, val);
  await P.waitForTimeout(900);

  const click = t => P.evaluate(t => {
    const b = [...document.querySelectorAll('button')].find(x => x.textContent.trim() === t);
    if (b) b.click();
    return !!b;
  }, t);
  const textOf = async () => {
    await click('텍스트 보기');
    await P.waitForTimeout(800);
    const t = await P.evaluate(() => {
      const ta = document.querySelector('textarea'); return ta ? ta.value : '';
    });
    await click('텍스트 보기');
    await P.waitForTimeout(250);
    return t;
  };

  for (const [tab, least] of [['의인화', 15000], ['단일 컷', 5000], ['콜라주', 8000]]) {
    ck(tab + ' 탭이 있다', await click(tab));
    await P.waitForTimeout(1500);
    const t = await textOf();
    ck(tab + ' 이 글을 뽑는다', t.length > least, t.length + '자');
    ck(tab + ' 에 고른 카드 이름이 실린다', t.includes(NAME), t.slice(0, 60));
  }
  ck('탭을 다 돌아도 오류가 없다', a.errors.length === 0, a.errors.join(' / '));
  await a.close();
  await h.stop();
  report(rows, '툴킷 화면');
})().catch(e => {
  ck('검사가 도중에 죽었다', false, String((e && e.message) || e).split('\n')[0]);
  report(rows, '툴킷 화면');
  process.exit(1);
});
