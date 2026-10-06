# 폼 결투(궨트식) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pkm-atelier 에 둘째 카드 결투 "폼 결투"(궨트식 — 세 줄 합으로 세 라운드 중 둘, 줄이 폼)를 진화 결투와 같은 컬렉션 위에 세운다.

**Architecture:** 규칙은 `lib/gwent.js`(IIFE, `window.AtelierGwent`/`module.exports`, DOM 모름)에만, 화면은 `gwent.html`(Preact+htm, CSS 안에, `gw-` 접두)에, 컬렉션·보상·금·상점은 있는 `lib/collection.js`. 상태는 통째 JSON + mulberry32 (`st.rngState`) 라 같은 시드는 같은 판 — `tests/gwent-sim.cjs` 가 그걸 믿고 균형 보고를 굴린다. 구조는 `lib/lane.js`·`lane.html`·`tests/lane-*.cjs` 를 그대로 따른다.

**Tech Stack:** vanilla JS (ES5 in lib), Preact 10.24.3 + htm (esm.sh), node:assert tests, Playwright via `tests/browser-harness.cjs`.

**Spec:** `docs/superpowers/specs/2026-10-06-gwent-duel-design.md`

## Global Constraints

- 화면 말은 전부 `lib/words.js` 의 `gwent.*`(`W('…')`); `<title>` 은 `포켓몬 메카 연구소`(`app.title`). `node tests/words.cjs` 가 막는다.
- 모든 변경은 `docs/PATCH.md` 맨 위에 한 칸 (`## 2026-10-06 · claude · 무엇` + 빈 줄 + `- 파일 — 왜`). `node tests/patch.cjs`.
- 공유 파일 `?v=` 는 손으로 올린다: 이번 작업은 `words.js`·`workspace-ui.js`·`workspace.css` 를 `?v=gwent1` 로 (모든 html + `lib/prompt-ui.js`·`lib/survey-ui.js`).
- 덮개(344×882) 우선: 누르는 자리 44px, 가로 넘침 없음.
- 저장 열쇠 `pkm_duel_v1` 하나 — `decks.gwent`·`stats.gwent`·`matches.gwent`. 모르는 id·풀 밖 카드는 덱에서만 뺀다(컬렉션은 둔다).
- 힘 = 경장 `round((공격+특공)/20)` · 중장 `round((방어+특방)/20)` · 고기동 `round(속도×2/20)`, 1~15. 덱 id `이름|w` = 날씨판.
- 선공 보정 FIRST_BONUS=8 는 균형 보고(선공 40~60%, 세대 25~75%, 숙련>신참 55%+, 에이스>숙련 55%+)로 다시 잰다.
- main 에서 바로 작업(저장소 관례); 다른 세션이 main 에 밀므로 push 전 `git pull --rebase`.
- 검사 환경(Git Bash): `export NODE_PATH="C:\\Users\\jjshs\\atelier\\node_modules" CHROMIUM_PATH="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" PYTHONUTF8=1; fnm exec --using=22 node tests/X.cjs`.

## Review Focus

1. 날씨판 id(`이름|w`)가 저장·덱·손패·묘지·통계 어디서든 모르는 카드로 터지지 않나 — 일상컷이 내려간 카드의 `|w` 는 덱에서 빠지고 컬렉션엔 남아야 한다 (Task 2 validate/autoFill, Task 8 sanitise 검사).
2. 손패가 비었는데 개방이 남은 쪽 — 자동 패스로 개방을 잃는 것이 규칙(명세 §1-4)이고 화면이 "개방 가능"으로 보이면 안 된다 (Task 3 자동 패스 검사, Task 8 단추 disabled).
3. 라운드 끝에 개방·날씨·피해·보너스가 전부 지워지는가, 2라운드 합이 0부터 시작하는가 (Task 4 검사).
4. 상성 타격이 영웅·날씨 줄·힘 1 카드를 건드리지 않는가, 바닥 1 (Task 4 검사).
5. 덮개에서 패스·개방·? 단추가 손패 칸에 깔리지 않는가(진화 결투 리뷰에서 터졌던 것) — Task 8 elementFromPoint 검사.

---

### Task 1: 자료 · 파생 (`data/gwent.json`, `lib/gwent.js` 뼈대, `tests/gwent-sim.cjs` 시작)

**Files:**
- Create: `data/gwent.json`, `lib/gwent.js`, `tests/gwent-sim.cjs`
- Modify: `tests/forms.cjs` (gwent.json 검사), `docs/PATCH.md`

**Interfaces:**
- Produces: `AtelierGwent.{derive, cardsOf(data)→{cards:{이름→card}, list, pool}, cardOf(data,id)→card|null, isWeather(id), baseName(id), weatherOf(data,row), best(card)}`. card = `{name,no,gen,types[],power:{light,heavy,mobility},line(root),rare,casual}`; 날씨 카드 = `{name,id,no,gen,types:[],power:{0,0,0},line:null,rare:false,weather:true}`. 상수 `HAND=10, MULLIGAN=2, LIVES=2, MAX_ROUNDS=3, ROWS=3, MAIN_MIN=15, RARE_MAX=4, WEATHER_MAX=3, POWER_MIN=1, POWER_MAX=15, STRIKE_2=2, STRIKE_4=3, OPEN_BONUS=5, OPEN_BLEED=1, FIRST_BONUS=8, CHAMP_OWN=17, CHAMP_ALLY=8, CHAMP_RARE=4, CHAMP_WEATHER=2, FORMS, LEVELS, WSUF='|w'`.

- [ ] **Step 1: Write the failing test**

Create `tests/gwent-sim.cjs`:

```js
/* 폼 결투를 화면 없이 굴린다 — 파생·덱 규칙·판·상성 타격·결속·개방·날씨·AI·정산. --quick 없이 돌리면 균형 보고.
   Run: node tests/gwent-sim.cjs [--quick] */
const fs = require('node:fs'), assert = require('node:assert/strict');
const C = require('../lib/collection.js');
const G = require('../lib/gwent.js');
const quick = process.argv.includes('--quick');
const J = n => JSON.parse(fs.readFileSync('data/' + n + '.json', 'utf8'));
const card = J('card'), chart = J('chart'), img = J('img');
/* 규칙 검사는 그림 유무를 무시한다 — allowAll(날씨판도 전부 가능). 풀 문턱은 real 로 본다 */
const data = { cards: card.cards.character, chart: chart.chart, group: J('group'), label: J('label'), img: img.img || {}, lane: J('lane'), gwent: J('gwent'), allowAll: true };
const real = { ...data, allowAll: false };
let n = 0; const ok = (c, m) => { assert(c, m); n++; };
const by = C.byName(data);

/* ── 파생 — 힘 셋 · 계통 · 전설 · 날씨판 id ── */
{
  const D = G.cardsOf(data);
  ok(D.list.length === 1025 && D.pool.length === 1025, '전부 파생, 풀(allowAll)');
  for (const id of D.list) { const c = D.cards[id]; for (const f of C.FORMS) ok(c.power[f] >= 1 && c.power[f] <= 15, id + ' ' + f + ' 힘 1~15: ' + c.power[f]); ok(typeof c.line === 'string' && c.types.length >= 1, id + ' 계통·타입'); }
  const P = id => [D.cards[id].power.light, D.cards[id].power.heavy, D.cards[id].power.mobility].join();
  ok(P('피카츄') === '5,5,9' && P('리자몽') === '10,8,10' && P('잉어킹') === '1,4,8' && P('뮤츠') === '13,9,13', '정한 예: ' + [P('피카츄'), P('리자몽'), P('잉어킹'), P('뮤츠')].join(' / '));
  ok(D.cards['단단지'].power.heavy === 15 && D.cards['해피너스'].power.mobility === 6, '천장 15 · 고기동은 속도만: ' + D.cards['단단지'].power.heavy + ',' + D.cards['해피너스'].power.mobility);
  ok(D.cards['이상해풀'].line === '이상해씨' && D.cards['쥬피썬더'].line === '이브이' && D.cards['뮤츠'].line === '뮤츠', '계통 뿌리');
  ok(D.cards['뮤츠'].rare && !D.cards['피카츄'].rare, '전설');
  ok(D.cards['꼬부기'].casual && G.cardsOf(real).cards['꼬부기'].casual === false && G.cardsOf(real).cards['피카츄'].casual === true, 'allowAll 이면 일상컷 있는 셈, 진짜 자료에선 등록된 것만(피카츄 있음·꼬부기 없음)');
  ok(G.isWeather('피카츄|w') && !G.isWeather('피카츄') && G.baseName('피카츄|w') === '피카츄' && G.baseName('피카츄') === '피카츄', '날씨판 id');
  const w = G.cardOf(data, '피카츄|w');
  ok(w && w.weather && w.name === '피카츄' && w.id === '피카츄|w' && w.gen === 1 && !w.rare && w.types.length === 0 && G.best(w) === 0, '날씨판 카드');
  ok(G.cardOf(data, '피카츄') === D.cards['피카츄'] && G.cardOf(data, '없는카드') === null && G.cardOf(data, '없는카드|w') === null && G.cardOf(real, '꼬부기|w') === null && G.cardOf(real, '피카츄|w').weather, '카드 찾기 — 일상컷이 없으면 날씨판도 없다');
  ok(G.best(D.cards['피카츄']) === 9 && G.best(D.cards['뮤츠']) === 13, '가장 센 폼');
  ok(G.weatherOf(data, 0) === 'hail' && G.weatherOf(data, 1) === 'sand' && G.weatherOf(data, 2) === 'rain', '줄마다 날씨');
  const dat2 = { ...data, gwent: { ...data.gwent, overrides: { '잉어킹': { light: 9 } } } }; delete dat2.__gwent;
  ok(G.cardsOf(dat2).cards['잉어킹'].power.light === 9 && G.cardsOf(dat2).cards['잉어킹'].power.heavy === 4, 'overrides 가 힘 하나를 덮는다');
  ok(G.HAND === 10 && G.FIRST_BONUS >= 0 && G.OPEN_BONUS === 5 && G.WEATHER_MAX === 3, '상수');
}

console.log('PASS 폼 결투 규칙: ' + n + ' 가지');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `fnm exec --using=22 node tests/gwent-sim.cjs --quick`
Expected: FAIL — `Cannot find module '../lib/gwent.js'`

- [ ] **Step 3: Create `data/gwent.json`**

```json
{
 "version": 1,
 "note": "폼 결투(gwent.html) 자료. overrides[카드 이름] = {light, heavy, mobility} 가 힘 셋을 덮는다(1~15, 적은 것만). weather 는 줄(폼)마다 깔리는 날씨 열쇠 — 말은 lib/words.js 의 gwent.weather.<열쇠>. 챔피언 아홉은 data/lane.json 의 champions 를 그대로 쓴다. 규칙은 lib/gwent.js, 설계는 docs/superpowers/specs/2026-10-06-gwent-duel-design.md",
 "overrides": {},
 "weather": { "light": "hail", "heavy": "sand", "mobility": "rain" }
}
```

- [ ] **Step 4: Create `lib/gwent.js`**

```js
/* 폼 결투(궨트식) 엔진 — 세 줄(경장·중장·고기동)의 힘 합으로 세 라운드 중 둘. 줄이 폼이라 힘이 줄마다 다르다.
   놓을 때 상성 타격, 같은 계통은 결속, 개방은 +5 뒤 내 차례마다 −1, 날씨판은 줄을 1로. 놀이 규칙은 여기에만 있다.
   화면(gwent.html)은 상태를 그리고 단추를 넘길 뿐이다. 컬렉션·보상·금·상점은 lib/collection.js 가 맡는다(진화 결투와 같이).
   ES 모듈도 빌드도 쓰지 않는다. window.AtelierGwent 하나만 붙이고, node 에서는 module.exports.
   상태(st)는 통째로 JSON. 난수도 st.rngState 정수 하나(mulberry32)라서 같은 seed 는 같은 판 — tests/gwent-sim.cjs 가 그걸 믿는다.
   설계: docs/superpowers/specs/2026-10-06-gwent-duel-design.md */
(function (root) {
  'use strict';
  var C = root.AtelierCollection || (typeof require === 'function' ? require('./collection.js') : null);

  var VERSION = 1;
  var HAND = 10, MULLIGAN = 2, LIVES = 2, MAX_ROUNDS = 3, ROWS = 3;
  var MAIN_MIN = 15, RARE_MAX = 4, WEATHER_MAX = 3;
  var POWER_DIV = 20, POWER_MIN = 1, POWER_MAX = 15;      /* 힘 = 종족값 쌍 / 20 → 1~15 */
  var STRIKE_2 = 2, STRIKE_4 = 3;                         /* 상성 타격 — 2배 −2, 4배 −3 */
  var OPEN_BONUS = 5, OPEN_BLEED = 1;                     /* 개방 +5, 그 뒤 내 차례가 시작될 때마다 −1 */
  var FIRST_BONUS = 8;                                    /* 1라운드 선공 보정 — 균형 보고로 잰다 */
  var CHAMP_OWN = 17, CHAMP_ALLY = 8, CHAMP_RARE = 4, CHAMP_WEATHER = 2;
  var FORMS = C.FORMS, LEVELS = C.LEVELS, WSUF = '|w';
  var WEATHER_DEFAULT = { light: 'hail', heavy: 'sand', mobility: 'rain' };

  /* ── 파생 ── */
  function clamp(x) { return Math.max(POWER_MIN, Math.min(POWER_MAX, x)); }
  /* 일상컷이 어느 화풍에든 있나 — 날씨판이 되려면 */
  function hasCasual(img, name) {
    var e = img && img[name], bs = e && e.byStyle, k, c;
    if (!bs) return false;
    for (k in bs) { c = bs[k].casual; if (!c) continue; if (Array.isArray(c) ? c.length : ((c.f && c.f.length) || (c.m && c.m.length))) return true; }
    return false;
  }
  function derive(data) {
    var out = { cards: {}, list: [], pool: C.pool(data) }, ov = (data.gwent && data.gwent.overrides) || {}, i, c, o, s, card;
    for (i = 0; i < data.cards.length; i++) {
      c = data.cards[i]; o = ov[c.name] || {}; s = c.stats;
      card = { name: c.name, no: c.no, gen: c.gen, types: c.element2 ? [c.element, c.element2] : [c.element],
        power: { light: clamp(o.light || Math.round((s[1] + s[3]) / POWER_DIV)), heavy: clamp(o.heavy || Math.round((s[2] + s[4]) / POWER_DIV)), mobility: clamp(o.mobility || Math.round(s[5] * 2 / POWER_DIV)) },
        line: C.lineOf(data, c.name).root, rare: !!c.rare, casual: !!data.allowAll || hasCasual(data.img, c.name) };
      out.cards[card.name] = card; out.list.push(card.name);
    }
    return out;
  }
  function cardsOf(data) { if (!data.__gwent) data.__gwent = derive(data); return data.__gwent; }
  function isWeather(id) { return typeof id === 'string' && id.length > WSUF.length && id.slice(-WSUF.length) === WSUF; }
  function baseName(id) { return isWeather(id) ? id.slice(0, -WSUF.length) : id; }
  function weatherOf(data, row) { var w = (data.gwent && data.gwent.weather) || WEATHER_DEFAULT; return w[FORMS[row]] || WEATHER_DEFAULT[FORMS[row]]; }
  /* 덱 id → 카드. 날씨판 id(이름|w)는 일상컷이 있는 카드만 — 없으면 null(모르는 카드와 같이 다룬다) */
  function cardOf(data, id) {
    var c = cardsOf(data).cards[baseName(id)];
    if (!c) return null;
    if (!isWeather(id)) return c;
    if (!c.casual) return null;
    return { name: c.name, id: id, no: c.no, gen: c.gen, types: [], power: { light: 0, heavy: 0, mobility: 0 }, line: null, rare: false, weather: true };
  }
  function best(c) { return Math.max(c.power.light, c.power.heavy, c.power.mobility); }

  var api = {
    VERSION: VERSION, HAND: HAND, MULLIGAN: MULLIGAN, LIVES: LIVES, MAX_ROUNDS: MAX_ROUNDS, ROWS: ROWS,
    MAIN_MIN: MAIN_MIN, RARE_MAX: RARE_MAX, WEATHER_MAX: WEATHER_MAX, POWER_MIN: POWER_MIN, POWER_MAX: POWER_MAX,
    STRIKE_2: STRIKE_2, STRIKE_4: STRIKE_4, OPEN_BONUS: OPEN_BONUS, OPEN_BLEED: OPEN_BLEED, FIRST_BONUS: FIRST_BONUS,
    CHAMP_OWN: CHAMP_OWN, CHAMP_ALLY: CHAMP_ALLY, CHAMP_RARE: CHAMP_RARE, CHAMP_WEATHER: CHAMP_WEATHER, FORMS: FORMS, LEVELS: LEVELS, WSUF: WSUF,
    derive: derive, cardsOf: cardsOf, cardOf: cardOf, isWeather: isWeather, baseName: baseName, weatherOf: weatherOf, best: best
  };
  root.AtelierGwent = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `fnm exec --using=22 node tests/gwent-sim.cjs --quick`
Expected: `PASS 폼 결투 규칙: N 가지`. 정한 예 네 값이 다르면 종족값을 `data/card.json` 에서 확인하고 **검사 기대값을 자료대로 고친다**(힘 공식이 명세와 같은지 먼저 본다).

- [ ] **Step 6: `tests/forms.cjs` 에 gwent.json 검사**

`for (const k in lane.overrides) assert(by1[k], …);` 줄 뒤에:

```js
  const gw = JSON.parse(fs.readFileSync('data/gwent.json', 'utf8'));
  assert.deepEqual(Object.keys(gw.weather).sort(), ['heavy', 'light', 'mobility'], '폼 결투 날씨는 폼 셋에 하나씩');
  for (const k in gw.overrides) { assert(by1[k], `gwent overrides 의 ${k} 는 없는 카드`); for (const f in gw.overrides[k]) assert(['light', 'heavy', 'mobility'].includes(f) && gw.overrides[k][f] >= 1 && gw.overrides[k][f] <= 15, `${k} 의 ${f} 는 1~15`); }
```

Run: `fnm exec --using=22 node tests/forms.cjs` → Expected: PASS 줄.

- [ ] **Step 7: PATCH 칸 + commit**

`docs/PATCH.md` 맨 위(안내글 다음, 첫 `##` 앞):

```
## 2026-10-06 · claude · 폼 결투 — 자료와 파생

- data/gwent.json — 폼 결투 자료(overrides·줄별 날씨 열쇠). 챔피언은 lane.json 것을 같이 쓴다
- lib/gwent.js — 둘째 결투 엔진의 뼈대: 힘 셋(경장 공격+특공·중장 방어+특방·고기동 속도×2, ÷20, 1~15)·계통·날씨판 id(이름|w)
- tests/gwent-sim.cjs — 파생 검사(정한 예·천장·날씨판 id)
- tests/forms.cjs — gwent.json 의 날씨 셋·overrides 범위
```

```bash
git add data/gwent.json lib/gwent.js tests/gwent-sim.cjs tests/forms.cjs docs/PATCH.md
git commit -m "폼 결투 — 자료와 파생"
```

---

### Task 2: 덱 규칙 · 챔피언 덱

**Files:**
- Modify: `lib/gwent.js` (`var api` 앞에 더한다, api 에 이름 추가), `tests/gwent-sim.cjs`, `docs/PATCH.md`

**Interfaces:**
- Consumes: Task 1 의 `cardOf`, `best`, `cardsOf`.
- Produces: `canUse(data, profile, id)`, `validateDeck(data, profile) → {ok, problems:[count|main|rare|weather|dup|owned], n, main, rare, weather}`, `toggleDeck(data, profile, id) → {ok, why?}`, `setMain(profile, gen)`, `autoFill(data, profile) → {ok, added[], removed[]}`, `championOf(data, gen)`, `championReady(data, gen) → {ok, own, ally, need}`, `championPortrait(data, gen)`, `championDeck(data, rng, gen, level) → [id…]` (에이스는 전설 4 + 날씨판 2).

- [ ] **Step 1: Write the failing tests** — `console.log('PASS …')` 앞에:

```js
/* ── 덱 규칙 여섯 — 25장 · 주 세대 15 · 전설 4 · 날씨판 3 · 같은 id 1 · 안 가진 카드 ── */
{
  const pr = C.newProfile(data, 1, 3); C.setDeck(pr, 'gwent', pr.owned.slice());
  ok(G.validateDeck(data, pr).ok, '시작 컬렉션 25 를 그대로 덱으로');
  const deck = C.deckOf(pr, 'gwent');
  deck.pop(); { const v = G.validateDeck(data, pr); ok(!v.ok && v.problems.join() === 'count' && v.n === 24, '24장'); }
  deck.push(deck[0]); ok(G.validateDeck(data, pr).problems.includes('dup'), '같은 id 둘');
  deck.pop(); deck.push('뮤츠'); ok(G.validateDeck(data, pr).problems.join() === 'owned', '안 가진 카드'); deck.pop();
  pr.owned.push('뮤츠', '뮤', '프리져', '썬더', '파이어'); deck.splice(0, 5, '뮤츠', '뮤', '프리져', '썬더', '파이어');
  { const v = G.validateDeck(data, pr); ok(v.problems.includes('rare') && v.rare === 5, '전설 5'); }
  G.setMain(pr, 2); ok(G.validateDeck(data, pr).problems.includes('main'), '주 세대를 바꾸면 15 규칙'); G.setMain(pr, 1);
  ok(G.toggleDeck(data, pr, '뮤츠').ok && !deck.includes('뮤츠') && G.toggleDeck(data, pr, '망나뇽').why === 'owned', '빼기 · 안 가진 카드는 못 넣는다');
  /* 날씨판 — 가진 카드의 공짜 폼. 기본판과 같이 넣어도 되고, 3장까지 */
  const w = deck.filter(x => !G.isWeather(x)).slice(0, 4).map(x => x + '|w');
  ok(G.toggleDeck(data, pr, w[0]).ok && deck.includes(w[0]) && G.validateDeck(data, pr).weather === 1, '날씨판 넣기 — 기본판과 함께');
  ok(G.toggleDeck(data, pr, '망나뇽|w').why === 'owned', '안 가진 카드의 날씨판은 안 된다');
  deck.push(w[1], w[2], w[3]); { const v = G.validateDeck(data, pr); ok(v.problems.includes('weather') && v.weather === 4, '날씨판 4 는 초과'); }
  const fill = G.autoFill(data, pr);
  ok(fill.ok && G.validateDeck(data, pr).ok && deck.length === 25 && deck.filter(G.isWeather).length <= 3, '자동 채우기가 규칙을 채운다(날씨판을 줄여서): ' + JSON.stringify(fill));
  { const q = C.newProfile(data, 1, 3); q.decks.gwent = ['없는카드', '뮤츠', '피카츄|w']; const f = G.autoFill(data, q); ok(f.removed.join() === '없는카드,뮤츠,피카츄|w' && G.validateDeck(data, q).ok, '모르는 카드·안 가진 카드(의 날씨판)는 빼고 채운다'); }
  { const q = C.newProfile(data, 1, 3); q.decks.gwent = []; const f = G.autoFill(data, q); ok(f.ok && q.decks.gwent.length === 25 && q.decks.gwent.every(x => !G.isWeather(x)), '빈 덱은 가진 카드로 25 — 날씨판은 자동으로 안 넣는다'); }
  { const q = C.newProfile(data, 1, 3); q.owned = q.owned.slice(0, 20); q.decks.gwent = q.owned.slice(); const f = G.autoFill(data, q); ok(!f.ok && G.validateDeck(data, q).problems.join() === 'count', '카드가 20장뿐이면 못 채운다 — 죽지 않고 count'); }
  { /* 진짜 자료 — 일상컷이 없는 카드의 날씨판은 안 가진 것과 같다 */
    const q = C.newProfile(data, 1, 3); q.decks.gwent = q.owned.slice(0, 24).concat([q.owned[0] + '|w']);
    ok(!G.canUse(real, q, q.owned[0] + '|w') && G.validateDeck(real, q).problems.includes('owned'), '일상컷 없는 카드의 날씨판은 owned'); }
}
/* ── 챔피언 ── */
{
  ok(G.championOf(data, 1).ally === 2 && G.championOf(data, 10) === null && G.championReady(data, 1).ok && !G.championReady(real, 1).ok, '챔피언·이웃·그림 문턱');
  ok(G.championPortrait(data, 1) === '뮤츠', '초상은 그 세대 종족값 최고');
  for (const lv of C.LEVELS) for (const g of [1, 5, 9]) {
    const d1 = G.championDeck(data, { rngState: 1 }, g, lv), d2 = G.championDeck(data, { rngState: 1 }, g, lv);
    ok(d1.length === 25 && new Set(d1).size === 25 && d1.join() === d2.join() && d1.every(x => G.cardOf(data, x)), `${g}세대 ${lv} 덱 25·같은 시드`);
    const own = d1.filter(x => G.cardOf(data, x).gen === g), ally = d1.filter(x => G.cardOf(data, x).gen === G.championOf(data, g).ally);
    ok(own.length === 17 && ally.length === 8, `${g}세대 ${lv} 자기 17 + 이웃 8`);
    const rare = d1.filter(x => G.cardOf(data, x).rare).length, w = d1.filter(G.isWeather).length;
    ok(lv === 'ace' ? rare === 4 && w === 2 : rare === 0 && w === 0, `${g}세대 ${lv} 전설 ${rare} 날씨 ${w}`);
  }
  { const a = G.championDeck(data, { rngState: 1 }, 1, 'rookie'), b = G.championDeck(data, { rngState: 2 }, 1, 'rookie'); ok(a.join() !== b.join(), '신참은 무작위'); }
  { const d = G.championDeck(real, { rngState: 1 }, 1, 'ace'); ok(true, '(real 은 문턱 미달 — 던지지만 않으면 됨)'); }
}
```

  주: 마지막 `real` 줄은 `championDeck(real, …)` 이 카드가 모자라 25 미만일 수 있다 — 던지지 않아야 한다. 던지면 `try` 로 감싸지 말고 엔진이 모자란 만큼만 돌려주는지 본다(길이 검사 없음).

- [ ] **Step 2: Run** `fnm exec --using=22 node tests/gwent-sim.cjs --quick` → Expected: FAIL `G.validateDeck is not a function`.

- [ ] **Step 3: Implement** — `lib/gwent.js` 의 `function best` 뒤, `var api` 앞:

```js
  /* ── 덱 규칙 여섯 — 25장 · 주 세대 15 · 전설 4 · 날씨판 3 · 같은 id 1 — 과 안 가진 카드·풀에 없는 카드·일상컷 없는 날씨판 ── */
  function canUse(data, profile, id) { var c = cardOf(data, id); return !!(c && profile.owned.indexOf(c.name) >= 0 && C.inPool(data, c.name)); }
  function validateDeck(data, profile) {
    var deck = C.deckOf(profile, 'gwent'), out = { ok: true, problems: [], n: deck.length, main: 0, rare: 0, weather: 0 };
    var seen = {}, dup = false, owned = false, i, id, c;
    for (i = 0; i < deck.length; i++) {
      id = deck[i]; c = cardOf(data, id);
      if (!canUse(data, profile, id)) { owned = true; continue; }
      if (c.gen === profile.main) out.main++;
      if (c.rare) out.rare++;
      if (c.weather) out.weather++;
      if (seen[id]) dup = true; seen[id] = 1;
    }
    if (out.n !== C.DECK) out.problems.push('count');
    if (out.main < MAIN_MIN) out.problems.push('main');
    if (out.rare > RARE_MAX) out.problems.push('rare');
    if (out.weather > WEATHER_MAX) out.problems.push('weather');
    if (dup) out.problems.push('dup');
    if (owned) out.problems.push('owned');
    out.ok = out.problems.length === 0;
    return out;
  }
  function toggleDeck(data, profile, id) {
    var deck = C.deckOf(profile, 'gwent'), i = deck.indexOf(id);
    if (i >= 0) { deck.splice(i, 1); return { ok: true }; }
    if (!canUse(data, profile, id)) return { ok: false, why: 'owned' };
    deck.push(id);
    return { ok: true };
  }
  function setMain(profile, gen) { profile.main = gen; return profile; }
  /* 자동 채우기 — 모르는·안 가진·겹친 id 를 빼고, 전설·날씨판이 넘치면 약한 것부터, 25 가 넘으면 주 세대 아닌 약한 것부터, 모자라면 주 세대 센 것부터(날씨판은 안 넣는다) */
  function autoFill(data, profile) {
    var deck = C.deckOf(profile, 'gwent'), out = { ok: false, added: [], removed: [] }, seen = {}, keep = [], i, id, cands, k, s;
    function counts() { var m = { main: 0, rare: 0, weather: 0 }, j, x; for (j = 0; j < deck.length; j++) { x = cardOf(data, deck[j]); if (x.gen === profile.main) m.main++; if (x.rare) m.rare++; if (x.weather) m.weather++; } return m; }
    for (i = 0; i < deck.length; i++) {
      id = deck[i];
      if (!canUse(data, profile, id) || seen[id]) { out.removed.push(id); continue; }
      seen[id] = 1; keep.push(id);
    }
    deck.length = 0; for (i = 0; i < keep.length; i++) deck.push(keep[i]);
    function weakestFirst(a, b) {
      var x = cardOf(data, a), y = cardOf(data, b), mx = x.gen === profile.main ? 1 : 0, my = y.gen === profile.main ? 1 : 0;
      return (mx - my) || (best(x) - best(y)) || a.localeCompare(b);
    }
    function drop(filter) {
      var list = deck.filter(filter).sort(weakestFirst);
      if (!list.length) return false;
      deck.splice(deck.indexOf(list[0]), 1); out.removed.push(list[0]);
      return true;
    }
    while (counts().rare > RARE_MAX && drop(function (x) { return cardOf(data, x).rare; })) { /* 전설부터 */ }
    while (counts().weather > WEATHER_MAX && drop(function (x) { return cardOf(data, x).weather; })) { /* 날씨판 */ }
    while (deck.length > C.DECK && drop(function () { return true; })) { /* 약한 것부터 */ }
    cands = profile.owned.filter(function (x) { return canUse(data, profile, x) && deck.indexOf(x) < 0; });
    cands.sort(function (a, b) { return (best(cardOf(data, b)) - best(cardOf(data, a))) || a.localeCompare(b); });
    for (k = 0; k < 2 && deck.length < C.DECK; k++) {
      for (i = 0; i < cands.length && deck.length < C.DECK; i++) {
        s = cands[i];
        if (deck.indexOf(s) >= 0 || (cardOf(data, s).rare && counts().rare >= RARE_MAX)) continue;
        if (k === 0 && (cardOf(data, s).gen !== profile.main || counts().main >= MAIN_MIN)) continue;
        deck.push(s); out.added.push(s);
      }
    }
    out.ok = validateDeck(data, profile).ok;
    return out;
  }

  /* ── 챔피언 — data/lane.json 의 아홉을 그대로. 자기 세대 17 + 이웃 8. 숙련은 계통이 완성된 것부터, 에이스는 전설 4 + 날씨판 2 ── */
  function championOf(data, gen) {
    var i, list = data.lane.champions; for (i = 0; i < list.length; i++) if (list[i].gen === gen) return list[i];
    return null;
  }
  function championReady(data, gen) {
    var ch = championOf(data, gen), own = ch ? C.genCards(data, gen, false).length : 0, ally = ch ? C.genCards(data, ch.ally, false).length : 0;
    return { ok: !!ch && own >= CHAMP_OWN && ally >= CHAMP_ALLY, own: own, ally: ally, need: Math.max(0, CHAMP_OWN - own) + Math.max(0, CHAMP_ALLY - ally) };
  }
  function championPortrait(data, gen) {
    var D = cardsOf(data), by = C.byName(data), bestName = null, bestBst = -1, i, c;
    for (i = 0; i < D.pool.length; i++) { c = by[D.pool[i]]; if (c.gen === gen && C.bst(c) > bestBst) { bestBst = C.bst(c); bestName = c.name; } }
    return bestName;
  }
  function byBestDesc(data) { return function (a, b) { return best(cardOf(data, b)) - best(cardOf(data, a)) || a.localeCompare(b); }; }
  /* 계통이 완성된 것(풀 안에 계통이 통째로)부터 — 계통은 맨 위 힘이 큰 차례, 그 뒤 나머지를 힘 차례로 */
  function strongLines(data, names, n) {
    var seen = {}, lines = [], rest = [], out = [], i, j, l, top;
    for (i = 0; i < names.length; i++) {
      if (seen[names[i]]) continue;
      l = C.lineOf(data, names[i]).names.filter(function (x) { return names.indexOf(x) >= 0; });
      for (j = 0; j < l.length; j++) seen[l[j]] = 1;
      if (l.length > 1) lines.push(l); else rest.push(l[0]);
    }
    top = function (l) { var m = 0, j; for (j = 0; j < l.length; j++) m = Math.max(m, best(cardOf(data, l[j]))); return m; };
    lines.sort(function (a, b) { return top(b) - top(a) || a[0].localeCompare(b[0]); });
    for (i = 0; i < lines.length; i++) { if (out.length + lines[i].length <= n) out = out.concat(lines[i]); else rest = rest.concat(lines[i]); }
    rest.sort(byBestDesc(data));
    return out.concat(rest).slice(0, n);
  }
  function championDeck(data, rng, gen, level) {
    var D = cardsOf(data), ch = championOf(data, gen), own, ally, rare, w, i, out;
    own = C.genCards(data, gen, false); ally = C.genCards(data, ch.ally, false);
    if (level === 'rookie') { own = C.shuffle(rng, own).slice(0, CHAMP_OWN); ally = C.shuffle(rng, ally).slice(0, CHAMP_ALLY); }
    else { own = strongLines(data, own, CHAMP_OWN); ally = strongLines(data, ally, CHAMP_ALLY); }
    if (level === 'ace') {   /* 전설 4(자기 세대 먼저, 모자라면 이웃) + 자기 세대 날씨판 2(일상컷이 있는 센 것부터) — 자기 세대의 약한 것부터 뺀다 */
      rare = C.genCards(data, gen, true).sort(byBestDesc(data)).slice(0, CHAMP_RARE);
      if (rare.length < CHAMP_RARE) rare = rare.concat(C.genCards(data, ch.ally, true).sort(byBestDesc(data)).slice(0, CHAMP_RARE - rare.length));
      w = C.genCards(data, gen, false).filter(function (x) { return D.cards[x].casual; }).sort(byBestDesc(data)).slice(0, CHAMP_WEATHER).map(function (x) { return x + WSUF; });
      own.sort(byBestDesc(data));
      own = own.slice(0, Math.max(0, own.length - rare.length - w.length)).concat(rare, w);
    }
    out = own.concat(ally);
    for (i = 0; i < out.length; i++) if (!cardOf(data, out[i])) throw new Error('championDeck: ' + out[i]);
    return out;
  }
```

api 에 더한다: `canUse: canUse, validateDeck: validateDeck, toggleDeck: toggleDeck, setMain: setMain, autoFill: autoFill, championOf: championOf, championReady: championReady, championPortrait: championPortrait, championDeck: championDeck,`

- [ ] **Step 4: Run** → Expected: PASS. (`전설 ${rare} 날씨 ${w}` 가 어긋나면 그 세대 풀의 전설 수를 본다 — 1·5·9 세대엔 전설이 넷 이상 있다.)

- [ ] **Step 5: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — 덱 규칙과 챔피언 덱

- lib/gwent.js — 덱 규칙 여섯(25·주 세대 15·전설 4·날씨판 3·같은 id 1·안 가진 카드), 자동 채우기, 챔피언 덱(에이스는 전설 4 + 날씨판 2)
- tests/gwent-sim.cjs — 그 검사
```

```bash
git add lib/gwent.js tests/gwent-sim.cjs docs/PATCH.md && git commit -m "폼 결투 — 덱 규칙과 챔피언 덱"
```

---
### Task 3: 판 — 시드·멀리건·선공 보정·내기·패스·턴·라운드·목숨·합산(기본)

**Files:**
- Modify: `lib/gwent.js`, `tests/gwent-sim.cjs`, `docs/PATCH.md`

**Interfaces:**
- Consumes: Task 2 `championDeck`, Task 1 `cardOf`/`best`/`weatherOf`.
- Produces: `other, cur(unit), newMatch(data, profile, gen, level, seed) → st`, `mulligan(st, i)`, `confirm(data, st)`, `legal(data, st, who) → {play:[{id, lanes:[0,1,2]}], open:[{lane, i}], pass}`, `act(data, st, move)` (endTurn 없이), `play(data, st, id, lane)`, `open(data, st, lane, i)`, `pass(data, st)`, `endTurn`, `startRound`, `endRound`, `rowSum(data, st, who, lane)`, `sums(data, st) → {me, foe, rows:{me:[3], foe:[3]}}`, `unitValue(data, st, who, lane, i) → {value, bond, weather}`. 상태 꼴은 명세 §9. 이 Task 의 `act` 는 날씨판·상성 타격·결속·개방을 **아직** 안 한다(Task 4) — 단 `open` 수와 `unit.open`·`unit.dmg` 자리는 둔다.

- [ ] **Step 1: Write the failing tests** — PASS 줄 앞에:

```js
/* ── 판 — 시드·멀리건·선공 보정 ── */
const freshMatch = (seed, gen, level, deck) => { const pr = C.newProfile(data, gen || 1, seed); C.setDeck(pr, 'gwent', deck || pr.owned.slice()); return [pr, G.newMatch(data, pr, G.championOf(data, gen || 1).ally, level || 'veteran', seed)]; };
{
  const [, m1] = freshMatch(42), [, m2] = freshMatch(42);
  ok(JSON.stringify(m1) === JSON.stringify(m2), '같은 시드 같은 판');
  ok(m1.phase === 'mulligan' && m1.me.hand.length === 10 && m1.me.deck.length === 15 && m1.foe.hand.length === 10 && m1.lives.me === 2 && m1.round === 1, '손 10 · 덱 15 · 목숨 둘 · 1라운드');
  ok(m1.me.rows.length === 3 && m1.me.rows.every(r => r.length === 0) && !m1.me.opened && m1.weather.join() === ',,' && m1.bonus.me === 0, '빈 줄 셋, 개방 안 씀, 날씨 없음');
  const first = m1.me.hand[0], topDeck = m1.me.deck[0];
  ok(G.mulligan(m1, 0).ok && m1.me.hand[0] === topDeck && m1.me.deck[m1.me.deck.length - 1] === first, '멀리건 — 덱 맨 위와 바꾸고 옛 카드는 맨 아래');
  ok(G.mulligan(m1, 1).ok && G.mulligan(m1, 2).why === 'mulligan', '2장까지');
  G.confirm(data, m1);
  ok(m1.phase === 'play' && m1.turn === m1.first && m1.coin === m1.first && m1.bonus[m1.first] === G.FIRST_BONUS && m1.bonus[G.other(m1.first)] === 0, '선공 결정 · 선공 보너스 ' + G.FIRST_BONUS);
  ok(G.sums(data, m1)[m1.first] === G.FIRST_BONUS && G.sums(data, m1)[G.other(m1.first)] === 0, '보너스는 합에 들어간다');
  ok(G.mulligan(m1, 0).why === 'phase', '시작 뒤엔 멀리건 없음');
  let me = 0; for (let s = 0; s < 40; s++) { const [, m] = freshMatch(s); G.confirm(data, m); if (m.first === 'me') me++; }
  ok(me > 8 && me < 32, '선공은 양쪽 다 나온다: ' + me);
}
/* 판을 손으로 만든다: 양쪽 손패를 정하고 선공을 me 로, 보너스 0. 손이 비면 자동 패스라서 여분 한 장(잉어킹)을 붙인다 — exact 면 안 붙인다 */
const rig = (myHand, foeHand, opt) => {
  opt = opt || {};
  const [pr, m] = freshMatch(opt.seed || 1, opt.gen || 1, opt.level || 'veteran');
  m.me.hand = myHand.concat(opt.exact ? [] : ['잉어킹']); m.foe.hand = foeHand.concat(opt.exact ? [] : ['잉어킹']); m.me.deck = []; m.foe.deck = [];
  m.phase = 'play'; m.first = m.turn = m.coin = opt.first || 'me'; m.bonus = { me: 0, foe: 0 };
  return [pr, m];
};
/* 수는 st.turn 쪽 것 — put 은 차례를 그쪽으로 돌려놓고 낸다 */
const put = (m, who, id, lane) => { m.turn = who; const r = G.play(data, m, id, lane); assert(r.ok, `${who} ${id} 줄 ${lane}: ${r.why}`); return r; };
const unit = (m, who, lane, i) => m[who].rows[lane][i || 0];
/* ── 내기 — 줄이 폼, 힘이 줄마다 다르다 ── */
{
  const [, m] = rig(['피카츄', '꼬부기', '이상해씨'], ['파이리']);
  ok(G.play(data, m, '파이리', 0).why === 'hand' && G.play(data, m, '피카츄', 3).why === 'lane', '손에 없는 카드 · 없는 줄');
  const L = G.legal(data, m, 'me'); ok(L.play.length === 4 && L.play[0].lanes.join() === '0,1,2' && L.open.length === 0 && L.pass && G.legal(data, m, 'foe').play.length === 0, '내 차례의 합법 수');
  ok(G.play(data, m, '피카츄', 2).ok && unit(m, 'me', 2).name === '피카츄' && unit(m, 'me', 2).base === 9 && unit(m, 'me', 2).dmg === 0 && unit(m, 'me', 2).open === 0 && m.turn === 'foe', '고기동 줄에 놓으면 힘 9 (속도)');
  ok(m.me.hand.join() === '꼬부기,이상해씨,잉어킹' && m.played.join() === '피카츄' && m.log[m.log.length - 1].t === 'play', '손에서 줄로 · 낸 카드 기록');
  ok(G.cur(unit(m, 'me', 2)) === 9 && G.rowSum(data, m, 'me', 2) === 9 && G.sums(data, m).me === 9 && G.sums(data, m).foe === 0, '현재 힘 · 줄 합 · 전체 합');
  put(m, 'foe', '파이리', 0); ok(unit(m, 'foe', 0).base === G.cardOf(data, '파이리').power.light && m.turn === 'me', '상대는 경장 줄에');
  put(m, 'me', '꼬부기', 2); ok(m.me.rows[2].length === 2 && m.me.rows[2][1].name === '꼬부기' && G.rowSum(data, m, 'me', 2) === 9 + G.cardOf(data, '꼬부기').power.mobility, '같은 줄에 둘 — 합');
  ok(G.sums(data, m).rows.me.join() === '0,0,' + G.rowSum(data, m, 'me', 2), '줄별 합');
}
/* ── 패스·턴·라운드·목숨 ── */
{
  const [, m] = rig(['이상해씨', '꼬부기'], ['파이리']);
  ok(G.play(data, m, '이상해씨', 1).ok && m.turn === 'foe', '놓으면 차례가 넘어간다');
  ok(G.pass(data, m).ok && m.passed.foe && m.turn === 'me', '상대 패스 → 내 차례');
  ok(G.play(data, m, '꼬부기', 0).ok && m.turn === 'me', '상대가 패스했으니 내 차례가 이어진다');
  ok(G.pass(data, m).ok && m.roundLog.length === 1 && m.round === 2, '둘 다 패스 → 라운드 끝');
  const r = m.roundLog[0]; ok(r.winner === 'me' && r.me === G.cardOf(data, '이상해씨').power.heavy + G.cardOf(data, '꼬부기').power.light && r.foe === 0 && m.lives.foe === 1 && m.lives.me === 2, '합으로 내가 땄다 → 상대 목숨 하나: ' + JSON.stringify(r));
  ok(m.me.rows.every(x => x.length === 0) && m.me.grave.sort().join() === '꼬부기,이상해씨' && !m.passed.me && !m.passed.foe && m.bonus.me === 0, '판은 묘지로, 패스 풀림, 보너스 없음');
  ok(m.first === 'foe' && m.turn === 'foe', '진 쪽이 선공');
  ok(m.me.hand.length === 1 && m.foe.hand.length === 2, '라운드 사이 보충 없음 — 나 1(잉어킹), 상대 2(파이리·잉어킹)');
}
{ /* 빈 손 자동 패스 · 동점은 둘 다 잃음 */
  const [, m] = rig(['피카츄'], ['피카츄'], { exact: true });
  put(m, 'me', '피카츄', 0); ok(m.passed.me && m.turn === 'foe', '손이 비면 자동 패스');
  put(m, 'foe', '피카츄', 0);
  ok(m.phase === 'done' && m.roundLog[0].winner === 'draw' && m.lives.me === 0 && m.lives.foe === 0 && m.roundLog.length === 2 && m.winner === 'draw', '5 : 5 동점 → 둘 다 잃고, 2라운드는 빈 손 0:0 → 둘 다 0 → 무승부로 끝');
}
{ /* 선공 보너스 — 1라운드만, 동점이면 선공이 바뀐다 */
  const [, m] = rig(['피카츄', '꼬부기'], ['피카츄', '꼬부기']);
  m.bonus.me = G.FIRST_BONUS;
  put(m, 'me', '피카츄', 0); put(m, 'foe', '피카츄', 0); G.pass(data, m); G.pass(data, m);
  ok(m.roundLog[0].me === 5 + G.FIRST_BONUS && m.roundLog[0].foe === 5 && m.roundLog[0].winner === 'me' && m.bonus.me === 0 && m.first === 'foe', '보너스로 땄다 · 2라운드엔 보너스 없음');
  m.turn = 'foe'; put(m, 'foe', '꼬부기', 0); put(m, 'me', '꼬부기', 0); G.pass(data, m); G.pass(data, m);
  ok(m.round === 2 && m.roundLog[1].winner === 'draw' && m.lives.me === 1 && m.lives.foe === 0 && m.phase === 'done' && m.winner === 'me', '2R 동점 → 둘 다 잃고 상대 0 → 내가 이김(끝난 판은 라운드 수가 안 는다)');
}
{ /* 세 라운드 상한 */
  const [, m] = rig(['피카츄', '꼬부기', '이상해씨'], ['파이리', '파이리', '파이리']);
  put(m, 'me', '꼬부기', 0); G.pass(data, m); G.pass(data, m);
  ok(m.round === 2 && m.lives.foe === 1 && m.first === 'foe', '1R 나 → 진 상대가 선공');
  put(m, 'foe', '파이리', 0); G.pass(data, m); G.pass(data, m);
  ok(m.round === 3 && m.lives.me === 1 && m.first === 'me', '2R 상대 → 3R, 진 내가 선공');
  put(m, 'me', '피카츄', 2); put(m, 'foe', '파이리', 1); G.pass(data, m); G.pass(data, m);
  ok(m.phase === 'done' && m.roundLog.length === 3 && m.roundLog[2].winner === 'me' && m.winner === 'me', '3R 9 : 6 → 내가 이김, 세 라운드');
  ok(G.play(data, m, '이상해씨', 0).why === 'phase' && G.pass(data, m).why === 'phase', '끝난 판엔 못 둔다');
}
```

- [ ] **Step 2: Run** → Expected: FAIL `G.newMatch is not a function`.

- [ ] **Step 3: Implement** — `championDeck` 뒤에:

```js
  /* ── 판 ── */
  function other(who) { return who === 'me' ? 'foe' : 'me'; }
  function blankSide() { return { hand: [], deck: [], rows: [[], [], []], grave: [], opened: false }; }
  /* 현재 힘 = 기본 − 피해 + 개방, 바닥 1 */
  function cur(u) { return Math.max(POWER_MIN, u.base - u.dmg + u.open); }
  function newMatch(data, profile, gen, level, seed) {
    var st = { v: VERSION, seed: seed | 0, rngState: seed | 0, champion: gen, level: level, round: 1, turn: null, first: null, coin: null,
      bonus: { me: 0, foe: 0 }, passed: { me: false, foe: false }, lives: { me: LIVES, foe: LIVES }, me: blankSide(), foe: blankSide(), weather: [null, null, null],
      seq: 0, log: [], roundLog: [], phase: 'mulligan', winner: null, played: [], opens: 0, weathers: 0, mulligans: 0, rewarded: false, outcome: null, last: null };
    st.me.deck = C.shuffle(st, C.deckOf(profile, 'gwent').slice());
    st.foe.deck = C.shuffle(st, championDeck(data, st, gen, level));
    st.me.hand = st.me.deck.splice(0, HAND);
    st.foe.hand = st.foe.deck.splice(0, HAND);
    return st;
  }
  function swapTop(side, i) {
    var old = side.hand[i];
    if (!side.deck.length) return false;
    side.hand[i] = side.deck.shift(); side.deck.push(old);
    return true;
  }
  function mulligan(st, i) {
    if (st.phase !== 'mulligan') return { ok: false, why: 'phase' };
    if (st.mulligans >= MULLIGAN) return { ok: false, why: 'mulligan' };
    if (i < 0 || i >= st.me.hand.length) return { ok: false, why: 'hand' };
    swapTop(st.me, i); st.mulligans++;
    return { ok: true };
  }
  /* 상대 멀리건 — 가장 약한 비날씨 2장. 그 뒤 동전으로 선공, 선공은 합에 FIRST_BONUS 를 미리 받는다 */
  function confirm(data, st) {
    var i, k, idx, foe = st.foe, c;
    if (st.phase !== 'mulligan') return st;
    for (k = 0; k < MULLIGAN; k++) {
      idx = -1;
      for (i = 0; i < foe.hand.length; i++) { c = cardOf(data, foe.hand[i]); if (!c || c.weather) continue; if (idx < 0 || best(c) < best(cardOf(data, foe.hand[idx]))) idx = i; }
      if (idx < 0 || !swapTop(foe, idx)) break;
    }
    st.first = C.rand(st) < 0.5 ? 'me' : 'foe';
    st.coin = st.first;
    st.bonus[st.first] = FIRST_BONUS;
    st.turn = st.first; st.phase = 'play';
    st.log.push({ t: 'first', who: st.first });
    startRound(data, st);
    return st;
  }
  function begin(st, who, kind, extra) { var k; st.last = { who: who, kind: kind, fx: [] }; for (k in extra || {}) st.last[k] = extra[k]; }
  /* 합법인 수 — 내기는 어느 줄이든, 개방은 내 판 위 비영웅 하나(한 판에 한 번) */
  function legal(data, st, who) {
    var D = cardsOf(data), out = { play: [], open: [], pass: false }, side, i, r;
    if (st.phase !== 'play' || st.turn !== who || st.passed[who]) return out;
    side = st[who];
    for (i = 0; i < side.hand.length; i++) out.play.push({ id: side.hand[i], lanes: [0, 1, 2] });
    if (!side.opened) for (r = 0; r < ROWS; r++) for (i = 0; i < side.rows[r].length; i++) if (!D.cards[side.rows[r][i].name].rare) out.open.push({ lane: r, i: i });
    out.pass = true;
    return out;
  }
  /* 한 수를 적용한다 — endTurn 은 안 한다(AI 의 evaluate 가 라운드 끝 전 값을 재려고). move = {kind:'play'|'open'|'pass', id, lane, i} */
  function act(data, st, move) {
    var who = st.turn, side = st[who], c, i, r, u;
    if (st.phase !== 'play') return { ok: false, why: 'phase' };
    if (st.passed[who]) return { ok: false, why: 'passed' };
    if (move.kind === 'pass') { begin(st, who, 'pass'); st.passed[who] = true; st.log.push({ t: 'pass', who: who }); return { ok: true }; }
    if (move.kind === 'play') {
      c = cardOf(data, move.id); i = side.hand.indexOf(move.id); r = move.lane;
      if (i < 0 || !c) return { ok: false, why: 'hand' };
      if (!(r >= 0 && r < ROWS)) return { ok: false, why: 'lane' };
      side.hand.splice(i, 1);
      if (who === 'me' && st.played.indexOf(c.name) < 0) st.played.push(c.name);
      if (c.weather) return playWeather(data, st, who, c, r);
      u = { id: move.id, name: c.name, base: c.power[FORMS[r]], dmg: 0, open: 0, at: st.seq++ };
      side.rows[r].push(u);
      begin(st, who, 'play', { id: move.id, lane: r, i: side.rows[r].length - 1, hit: strike(data, st, who, c) });
      st.log.push({ t: 'play', who: who, id: move.id, lane: r, hit: st.last.hit });
      return { ok: true };
    }
    if (move.kind === 'open') return actOpen(data, st, who, move);
    return { ok: false, why: 'kind' };
  }
  /* Task 4 가 채운다 — 지금은 날씨판은 그냥 묘지로, 타격 없음, 개방 없음 */
  function playWeather(data, st, who, c, r) { st[who].grave.push(c.id); begin(st, who, 'weather', { id: c.id, lane: r }); st.log.push({ t: 'weather', who: who, id: c.id, lane: r }); return { ok: true }; }
  function strike() { return null; }
  function actOpen() { return { ok: false, why: 'kind' }; }
  function play(data, st, id, lane) { var r = act(data, st, { kind: 'play', id: id, lane: lane }); if (r.ok) endTurn(data, st); return r; }
  function open(data, st, lane, i) { var r = act(data, st, { kind: 'open', lane: lane, i: i }); if (r.ok) endTurn(data, st); return r; }
  function pass(data, st) { var r = act(data, st, { kind: 'pass' }); if (r.ok) endTurn(data, st); return r; }
  /* 차례가 시작될 때 그쪽 개방 카드가 1 식는다 */
  function bleed(side) { var r, i, u; for (r = 0; r < ROWS; r++) for (i = 0; i < side.rows[r].length; i++) { u = side.rows[r][i]; if (u.open > 0) u.open = Math.max(0, u.open - OPEN_BLEED); } }
  function endTurn(data, st) {
    var who = st.turn, next;
    if (!st.passed[who] && !st[who].hand.length) st.passed[who] = true;   /* 손패가 비면 자동 패스 — 남은 개방은 잃는다 */
    if (st.passed.me && st.passed.foe) return endRound(data, st);
    next = st.passed[other(who)] ? who : other(who);
    st.turn = next; bleed(st[next]);
  }
  function startRound(data, st) {
    if (!st.me.hand.length) st.passed.me = true;
    if (!st.foe.hand.length) st.passed.foe = true;
    if (st.passed.me && st.passed.foe) return endRound(data, st);
    if (st.passed[st.turn]) st.turn = other(st.turn);
  }
  /* ── 합산 — 영웅은 기본 힘, 날씨 줄은 1, 아니면 현재 힘 + 결속이면 기본 힘 (결속·날씨는 Task 4) ── */
  function unitValue(data, st, who, lane, i) {
    var D = cardsOf(data), u = st[who].rows[lane][i], c = D.cards[u.name];
    if (c.rare) return { value: u.base, bond: false, weather: false };
    return { value: cur(u), bond: false, weather: false };
  }
  function rowSum(data, st, who, lane) { var s = 0, i; for (i = 0; i < st[who].rows[lane].length; i++) s += unitValue(data, st, who, lane, i).value; return s; }
  function sums(data, st) {
    var out = { me: st.bonus.me, foe: st.bonus.foe, rows: { me: [], foe: [] } }, r, a, b;
    for (r = 0; r < ROWS; r++) { a = rowSum(data, st, 'me', r); b = rowSum(data, st, 'foe', r); out.rows.me.push(a); out.rows.foe.push(b); out.me += a; out.foe += b; }
    return out;
  }
  function clearSide(side) { var r, i; for (r = 0; r < ROWS; r++) { for (i = 0; i < side.rows[r].length; i++) side.grave.push(side.rows[r][i].id); side.rows[r] = []; } }
  function endRound(data, st) {
    var s = sums(data, st), winner = s.me > s.foe ? 'me' : s.foe > s.me ? 'foe' : 'draw';
    st.roundLog.push({ me: s.me, foe: s.foe, winner: winner });
    if (winner !== 'me') st.lives.me--;
    if (winner !== 'foe') st.lives.foe--;
    st.log.push({ t: 'round', n: st.round, winner: winner, me: s.me, foe: s.foe });
    clearSide(st.me); clearSide(st.foe);
    st.weather = [null, null, null]; st.bonus = { me: 0, foe: 0 };
    st.passed = { me: false, foe: false };
    if (st.lives.me <= 0 || st.lives.foe <= 0 || st.round >= MAX_ROUNDS) {
      st.phase = 'done';
      st.winner = st.lives.me > st.lives.foe ? 'me' : st.lives.foe > st.lives.me ? 'foe' : 'draw';
      st.turn = null;
      return;
    }
    st.round++;
    st.first = winner === 'draw' ? other(st.first) : other(winner);   /* 진 쪽이 선공, 동점이면 바꿔 가며 */
    st.turn = st.first;
    startRound(data, st);
  }
```

api 에: `other: other, cur: cur, newMatch: newMatch, mulligan: mulligan, confirm: confirm, legal: legal, act: act, play: play, open: open, pass: pass, endTurn: endTurn, startRound: startRound, endRound: endRound, unitValue: unitValue, rowSum: rowSum, sums: sums,`

- [ ] **Step 4: Run** → Expected: PASS. 어긋나면 종족값으로 힘을 손으로 셈해 기대값을 자료대로 고친다(규칙이 명세대로인지 먼저).

- [ ] **Step 5: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — 판

- lib/gwent.js — 시드 판·멀리건·선공 보너스·내기(줄 = 폼)·패스·턴·라운드·목숨·합산. 라운드 사이 보충 없음, 동점은 둘 다 잃음
- tests/gwent-sim.cjs — 그 검사
```

```bash
git add lib/gwent.js tests/gwent-sim.cjs docs/PATCH.md && git commit -m "폼 결투 — 판"
```

---

### Task 4: 상성 타격 · 결속 · 영웅 · 개방 · 날씨

**Files:**
- Modify: `lib/gwent.js` (`strike`·`actOpen`·`playWeather`·`unitValue` 를 바꾼다), `tests/gwent-sim.cjs`, `docs/PATCH.md`

**Interfaces:**
- Produces: `mult(data, atkTypes, defTypes)`, `strike(data, st, who, card) → {lane, i, id, n, mult}|null`, `open` 수(`{kind:'open', lane, i}`), 날씨 `st.weather[lane]`, `unitValue` 에 `bond`·`weather`. `st.last.kind` ∈ `play|weather|open|pass`, `st.last.hit`.

- [ ] **Step 1: Write the failing tests** — PASS 줄 앞에:

```js
/* ── 상성 타격 — 놓을 때 한 번, 상대 판 전체에서 내 타입에 2배 이상인 비영웅 가운데 가장 센 것 ── */
{
  const [, m] = rig(['리자몽', '꼬부기', '피카츄', '파이리'], ['이상해꽃', '이상해씨', '뮤츠', '꼬마돌']);
  ok(G.mult(data, ['fire', 'flying'], ['grass', 'poison']) === 2 && G.mult(data, ['water'], ['rock', 'ground']) === 4 && G.mult(data, ['electric'], ['rock', 'ground']) === 0 && G.mult(data, ['normal'], ['ghost']) === 0, '배율 — 유리한 쪽으로, 상대 둘은 곱');
  put(m, 'foe', '이상해꽃', 0); put(m, 'foe', '이상해씨', 1); put(m, 'foe', '뮤츠', 2);
  put(m, 'me', '리자몽', 0);
  const hit = m.last.hit; ok(hit && hit.id === '이상해꽃' && hit.lane === 0 && hit.n === 2 && hit.mult === 2 && unit(m, 'foe', 0).dmg === 2 && G.cur(unit(m, 'foe', 0)) === G.cardOf(data, '이상해꽃').power.light - 2, '불→풀 2배 → 가장 센 이상해꽃 −2: ' + JSON.stringify(hit));
  ok(unit(m, 'foe', 1).dmg === 0, '약한 쪽은 안 맞는다');
  m.turn = 'me'; put(m, 'me', '파이리', 1);
  ok(m.last.hit.id === '이상해꽃' && unit(m, 'foe', 0).dmg === 4, '또 가장 센 것(현재 힘으로) — 이상해꽃 −4');
  put(m, 'foe', '꼬마돌', 1); ok(m.last.hit && m.last.hit.id === '리자몽' && m.last.hit.mult === 4 && m.last.hit.n === 3 && unit(m, 'me', 0).dmg === 3, '바위 → 불·비행 4배 → 리자몽 −3: ' + JSON.stringify(m.last.hit));
  m.turn = 'me'; put(m, 'me', '꼬부기', 2);
  ok(m.last.hit.id === '꼬마돌' && m.last.hit.n === 3 && m.last.hit.mult === 4 && unit(m, 'foe', 1, 1).dmg === 3, '물→바위·땅 4배 → −3 (꼬마돌이 이상해꽃보다 세진 않아도 4배가 아니라 "가장 센 2배 이상" — 꼬마돌 ' + G.cur(unit(m, 'foe', 1, 1)) + ' vs 이상해꽃 ' + G.cur(unit(m, 'foe', 0)) + ')');
}
{ /* 영웅은 안 맞는다 · 바닥 1 · 힘 1 은 그냥 넘어간다 */
  const [, m] = rig(['꼬부기', '꼬부기', '꼬부기'], ['뮤츠', '파이리']);
  put(m, 'foe', '뮤츠', 0); put(m, 'me', '꼬부기', 0); ok(m.last.hit === null, '전설(에스퍼)은 물에 2배여도 안 맞는다');
  put(m, 'foe', '파이리', 0); m.turn = 'me'; put(m, 'me', '꼬부기', 1);
  const f = unit(m, 'foe', 0, 1); ok(m.last.hit && m.last.hit.id === '파이리' && G.cur(f) === Math.max(1, f.base - 2), '파이리 −2');
  f.dmg = f.base - 1; m.turn = 'me'; put(m, 'me', '꼬부기', 2); ok(m.last.hit === null && G.cur(f) === 1, '힘 1 은 더 못 깎는다 — 타격 없음');
}
/* ── 결속 — 같은 계통 비영웅이 같은 줄에 둘 이상이면 각각 기본 힘만큼 ── */
{
  const [, m] = rig(['이상해씨', '이상해풀', '이상해꽃', '피카츄'], ['꼬부기']);   /* 상대는 물 — 풀·독을 2배로 못 때려 합이 그대로 */
  const b = id => G.cardOf(data, id).power.heavy;
  put(m, 'me', '이상해씨', 1); ok(G.unitValue(data, m, 'me', 1, 0).bond === false && G.rowSum(data, m, 'me', 1) === b('이상해씨'), '혼자는 결속 없음');
  put(m, 'foe', '꼬부기', 1); m.turn = 'me'; put(m, 'me', '이상해풀', 1);
  ok(G.unitValue(data, m, 'me', 1, 0).bond && G.unitValue(data, m, 'me', 1, 1).bond && G.rowSum(data, m, 'me', 1) === 2 * (b('이상해씨') + b('이상해풀')), '둘이면 둘 다 두 배');
  m.turn = 'me'; put(m, 'me', '이상해꽃', 1); ok(G.rowSum(data, m, 'me', 1) === 2 * (b('이상해씨') + b('이상해풀') + b('이상해꽃')), '셋이면 셋 다');
  m.turn = 'me'; put(m, 'me', '피카츄', 1); ok(G.unitValue(data, m, 'me', 1, 3).bond === false, '다른 계통은 아니다');
  unit(m, 'me', 1, 0).dmg = 2; ok(G.unitValue(data, m, 'me', 1, 0).value === b('이상해씨') - 2 + b('이상해씨'), '피해를 받아도 더하는 값은 기본 힘');
  ok(G.rowSum(data, m, 'me', 0) === 0, '다른 줄엔 결속 없음');
}
{ /* 영웅은 결속에 안 든다 */
  const [, m] = rig(['뮤츠', '뮤'], ['파이리']);
  put(m, 'me', '뮤츠', 0); put(m, 'foe', '파이리', 0); m.turn = 'me'; put(m, 'me', '뮤', 0);
  ok(!G.unitValue(data, m, 'me', 0, 0).bond && G.rowSum(data, m, 'me', 0) === 13 + 10, '뮤츠·뮤는 계통이 달라 결속 없음, 영웅은 기본 힘');
}
/* ── 개방 — 한 판에 한 번, 내 판 위 비영웅 +5, 내 차례가 시작될 때마다 −1, 바닥은 개방 전 ── */
{
  const [, m] = rig(['꼬부기', '피카츄', '이브이', '뮤츠'], ['파이리', '파이리', '파이리', '파이리']);
  ok(G.open(data, m, 0, 0).why === 'lane' && G.legal(data, m, 'me').open.length === 0, '빈 줄은 못 연다');
  put(m, 'me', '꼬부기', 0); put(m, 'foe', '파이리', 0); m.turn = 'me'; put(m, 'me', '뮤츠', 1); put(m, 'foe', '파이리', 1); m.turn = 'me';
  ok(G.legal(data, m, 'me').open.length === 1 && G.legal(data, m, 'me').open[0].lane === 0 && G.open(data, m, 1, 0).why === 'rare', '열 수 있는 것은 비영웅뿐');
  const base = G.cur(unit(m, 'me', 0));
  ok(G.open(data, m, 0, 0).ok && unit(m, 'me', 0).open === 5 && m.me.opened && m.opens === 1 && G.cur(unit(m, 'me', 0)) === base + 5 && m.turn === 'foe', '개방 +5, 턴을 쓴다');
  put(m, 'foe', '파이리', 2);   /* 상대 수 → 내 차례 시작 → −1 */
  ok(m.turn === 'me' && unit(m, 'me', 0).open === 4 && G.cur(unit(m, 'me', 0)) === base + 4, '내 차례가 오면 −1');
  ok(G.open(data, m, 0, 0).why === 'opened' && G.legal(data, m, 'me').open.length === 0, '한 판에 한 번');
  put(m, 'me', '피카츄', 2); put(m, 'foe', '파이리', 2);
  ok(unit(m, 'me', 0).open === 3, '또 −1');
  G.pass(data, m); G.pass(data, m);
  ok(m.round === 2 && m.me.opened && G.legal(data, m, m.turn).open.length === 0 && m.me.rows[0].length === 0, '라운드가 바뀌어도 개방은 쓴 채, 판은 비었다');
  for (let k = 0; k < 6; k++) { m.turn = 'foe'; G.pass(data, m); m.turn = 'me'; }
  ok(true, '(바닥 검사는 아래)');
}
{ /* 바닥 — 개방분이 다 식어도 개방 전 현재 힘 아래로는 안 간다 */
  const [, m] = rig(['꼬부기'], ['파이리', '파이리', '파이리', '파이리', '파이리', '파이리', '파이리'], { first: 'foe' });
  m.turn = 'foe'; put(m, 'foe', '파이리', 0); put(m, 'me', '꼬부기', 0); m.turn = 'me';
  const base = G.cur(unit(m, 'me', 0)); G.open(data, m, 0, 0);
  for (let k = 0; k < 6; k++) { m.turn = 'foe'; put(m, 'foe', '파이리', 1); }
  ok(unit(m, 'me', 0).open === 0 && G.cur(unit(m, 'me', 0)) === base, '여섯 차례 뒤 개방 0, 힘은 개방 전으로');
}
/* ── 날씨판 — 줄을 골라 깐다, 양쪽 비영웅은 1, 영웅은 그대로, 또 내면 걷힘, 라운드 끝에 걷힘 ── */
{
  const [, m] = rig(['파이리|w', '꼬부기|w', '피카츄', '이상해씨', '이상해풀'], ['뮤츠', '파이리', '리자드|w']);
  put(m, 'me', '이상해씨', 0); put(m, 'foe', '뮤츠', 0); m.turn = 'me'; put(m, 'me', '이상해풀', 0); put(m, 'foe', '파이리', 0); m.turn = 'me';
  const before = G.rowSum(data, m, 'me', 0);
  ok(G.play(data, m, '파이리|w', 0).ok && m.weather[0] === 'hail' && m.last.kind === 'weather' && m.last.on === true && m.me.grave.includes('파이리|w') && m.weathers === 1 && m.turn === 'foe', '경장 줄에 싸라기눈, 날씨판은 묘지로');
  ok(G.rowSum(data, m, 'me', 0) === 2 && G.unitValue(data, m, 'me', 0, 0).weather && G.rowSum(data, m, 'foe', 0) === 13 + 1, '날씨 줄 — 양쪽 비영웅 1(결속 무시), 뮤츠는 13 그대로: ' + before + ' → 2');
  ok(G.sums(data, m).rows.me[0] === 2, '줄별 합도');
  G.pass(data, m); m.turn = 'me';   /* 상대 패스 */
  ok(G.play(data, m, '꼬부기|w', 0).ok && m.weather[0] === null && m.last.on === false && G.rowSum(data, m, 'me', 0) === before, '같은 줄에 또 내면 걷힌다');
  ok(G.play(data, m, '피카츄', 1).ok && m.turn === 'me', '(상대가 패스해 내 차례가 이어진다)');
  m.passed.foe = false; m.turn = 'foe';
  ok(G.play(data, m, '리자드|w', 1).ok && m.weather[1] === 'sand' && G.rowSum(data, m, 'me', 1) === 1, '상대도 날씨판을 — 중장 줄에 모래바람, 내 피카츄 1');
  m.turn = 'me'; G.pass(data, m); m.turn = 'foe'; G.pass(data, m);
  ok(m.round === 2 && m.weather.join() === ',,', '라운드가 끝나면 걷힌다');
}
{ /* 날씨판은 타격이 없고, 상대 영웅만 있는 줄에 깔아도 아무 일 없음 */
  const [, m] = rig(['꼬부기|w'], ['이상해씨']);
  put(m, 'foe', '이상해씨', 2); m.turn = 'me';
  ok(G.play(data, m, '꼬부기|w', 2).ok && m.last.hit === undefined && unit(m, 'foe', 2).dmg === 0 && G.rowSum(data, m, 'foe', 2) === 1, '날씨판 — 타격 없음, 비 깔림');
}
```

- [ ] **Step 2: Run** → Expected: FAIL at `'불→풀 2배 → 가장 센 이상해꽃 −2'`(hit 가 null).

- [ ] **Step 3: Implement** — Task 3 의 세 자리표(`playWeather`·`strike`·`actOpen`)와 `unitValue` 를 **바꾼다**:

```js
  /* ── 상성 타격 — 내 타입(둘이면 유리한 쪽)이 상대 타입(둘이면 곱)에 주는 배율 ── */
  function mult(data, atkTypes, defTypes) {
    var bestM = 0, i, j, m;
    for (i = 0; i < atkTypes.length; i++) {
      m = 1; for (j = 0; j < defTypes.length; j++) m *= data.chart[atkTypes[i]][defTypes[j]];
      if (m > bestM) bestM = m;
    }
    return bestM;
  }
  /* 놓을 때 한 번 — 상대 판 전체에서 2배 이상인 비영웅 가운데 현재 힘이 가장 센 것(같으면 먼저 놓인 것). 2배 −2, 4배 −3, 바닥 1. 없거나 더 못 깎으면 null */
  function strike(data, st, who, c) {
    var D = cardsOf(data), you = st[other(who)], pick = null, r, i, u, m, n;
    for (r = 0; r < ROWS; r++) for (i = 0; i < you.rows[r].length; i++) {
      u = you.rows[r][i]; if (D.cards[u.name].rare) continue;
      m = mult(data, c.types, D.cards[u.name].types); if (m < 2) continue;
      if (!pick || cur(u) > cur(pick.u) || (cur(u) === cur(pick.u) && u.at < pick.u.at)) pick = { u: u, lane: r, i: i, m: m };
    }
    if (!pick) return null;
    n = Math.min(pick.m >= 4 ? STRIKE_4 : STRIKE_2, cur(pick.u) - POWER_MIN);
    if (n <= 0) return null;
    pick.u.dmg += n;
    return { lane: pick.lane, i: pick.i, id: pick.u.id, n: n, mult: pick.m };
  }
  /* 날씨판 — 줄을 골라 깐다(이미 깔려 있으면 걷는다). 판에 안 남고 묘지로 */
  function playWeather(data, st, who, c, r) {
    var w = weatherOf(data, r), on = !st.weather[r];
    st.weather[r] = on ? w : null; st[who].grave.push(c.id);
    if (who === 'me') st.weathers++;
    begin(st, who, 'weather', { id: c.id, lane: r, on: on, weather: w });
    st.log.push({ t: 'weather', who: who, id: c.id, lane: r, on: on });
    return { ok: true };
  }
  /* 개방 — 한 판에 한 번, 내 판 위 비영웅 하나 +5 */
  function actOpen(data, st, who, move) {
    var side = st[who], u = side.rows[move.lane] && side.rows[move.lane][move.i];
    if (side.opened) return { ok: false, why: 'opened' };
    if (!u) return { ok: false, why: 'lane' };
    if (cardsOf(data).cards[u.name].rare) return { ok: false, why: 'rare' };
    u.open = OPEN_BONUS; side.opened = true;
    if (who === 'me') st.opens++;
    begin(st, who, 'open', { lane: move.lane, i: move.i, id: u.id });
    st.log.push({ t: 'open', who: who, lane: move.lane, id: u.id });
    return { ok: true };
  }
  /* ── 합산 — 영웅은 기본 힘, 날씨 줄은 1, 아니면 현재 힘 + 결속(같은 계통 비영웅이 같은 줄에 둘 이상)이면 기본 힘 ── */
  function bondCount(data, row) { var D = cardsOf(data), n = {}, i, l; for (i = 0; i < row.length; i++) { if (D.cards[row[i].name].rare) continue; l = D.cards[row[i].name].line; n[l] = (n[l] || 0) + 1; } return n; }
  function unitValue(data, st, who, lane, i) {
    var D = cardsOf(data), u = st[who].rows[lane][i], c = D.cards[u.name], bonds;
    if (c.rare) return { value: u.base, bond: false, weather: false };
    if (st.weather[lane]) return { value: 1, bond: false, weather: true };
    bonds = bondCount(data, st[who].rows[lane]);
    return { value: cur(u) + (bonds[c.line] > 1 ? u.base : 0), bond: bonds[c.line] > 1, weather: false };
  }
```

api 에: `mult: mult, strike: strike,`

- [ ] **Step 4: Run** → Expected: PASS. (꼬마돌 검사: 타격 대상은 "2배 이상 가운데 가장 센 것"이라 이상해꽃(2배)이 꼬마돌(4배)보다 현재 힘이 세면 이상해꽃이 맞는다 — 그러면 기대를 자료대로 고친다. 이상해꽃 광 base 는 −4 된 뒤이니 꼬마돌 중장이 더 셀 것이다.)

- [ ] **Step 5: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — 상성 타격·결속·개방·날씨

- lib/gwent.js — 놓을 때 상성 타격(2배 −2·4배 −3·바닥 1·영웅 제외), 계통 결속(각각 기본 힘), 개방(+5, 내 차례마다 −1), 날씨판(줄을 골라 양쪽 비영웅 1, 또 내면 걷힘)
- tests/gwent-sim.cjs — 그 검사
```

```bash
git add lib/gwent.js tests/gwent-sim.cjs docs/PATCH.md && git commit -m "폼 결투 — 상성 타격·결속·개방·날씨"
```

---
### Task 5: AI 셋 · 정산 · 전적 · 균형 보고

**Files:**
- Modify: `lib/gwent.js`, `lib/collection.js` (`emptyStats`·`statsView` 세 값), `tests/gwent-sim.cjs`, `tests/lane-sim.cjs`(통계 그릇 검사 하나), `docs/PATCH.md`

**Interfaces:**
- Produces: `value(data, st, who)`, `evaluate(data, st, move) → gain`, `potential(data, side)`, `aiMove(data, st, level) → move`, `aiTurn(data, st, level) → {ok, move, why}`, `settle(data, profile, st) → outcome|null`, `pickReward(data, profile, st, i)`, `finishRewards(data, profile, st)`, `statsView(data, profile)`. `collection.emptyStats()` 에 `bestRound:0, weather:0, opens:0`; `collection.statsView` 결과에 `bestRound, weather, opens`.

- [ ] **Step 1: Write the failing tests** — PASS 줄 앞에:

```js
/* ── AI ── */
const playOut = (m, myLevel, foeLevel) => { let guard = 0; while (m.phase === 'play' && guard++ < 200) { const r = G.aiTurn(data, m, m.turn === 'me' ? myLevel : foeLevel); assert(r.ok, 'AI 가 불법 수: ' + JSON.stringify(r)); } assert(m.phase === 'done', '판이 안 끝난다'); return m; };
{
  const [, m] = freshMatch(3); G.confirm(data, m);
  const mv = G.aiMove(data, m, 'veteran'); ok(['play', 'pass', 'open'].includes(mv.kind), '첫 수: ' + mv.kind);
  for (let s = 0; s < 30; s++) { const [, g] = freshMatch(100 + s, 1 + (s % 9)); G.confirm(data, g); playOut(g, 'veteran', C.LEVELS[s % 3]); ok(g.roundLog.length >= 1 && g.roundLog.length <= 3 && ['me', 'foe', 'draw'].includes(g.winner), '판 ' + s + ' 끝: ' + g.winner); }
  { const [, a] = freshMatch(77); G.confirm(data, a); playOut(a, 'ace', 'ace'); const [, b] = freshMatch(77); G.confirm(data, b); playOut(b, 'ace', 'ace'); ok(JSON.stringify(a.log) === JSON.stringify(b.log), '같은 시드 같은 판 — AI 도'); }
  { let diff = 0; for (let s = 0; s < 20; s++) { const [, g] = freshMatch(200 + s); G.confirm(data, g); const r = G.aiMove(data, JSON.parse(JSON.stringify(g)), 'rookie'), v = G.aiMove(data, JSON.parse(JSON.stringify(g)), 'veteran'); if (JSON.stringify(r) !== JSON.stringify(v)) diff++; } ok(diff > 0, '신참은 무작위가 섞인다: ' + diff); }
  { /* 가장 센 줄에 놓는다 — 피카츄는 고기동 9 */
    const [, g] = rig(['피카츄'], ['파이리'], { exact: true });
    const mv = G.aiMove(data, g, 'veteran'); ok(mv.kind === 'play' && mv.id === '피카츄' && mv.lane === 2, '피카츄는 고기동 줄(9): ' + JSON.stringify(mv)); }
  { /* 앞서는데 상대가 패스하면 패스 */
    const [, g] = rig(['꼬부기', '피카츄'], ['파이리'], { first: 'foe' });
    put(g, 'me', '꼬부기', 0); g.turn = 'foe'; G.pass(data, g);
    ok(G.aiMove(data, g, 'veteran').kind === 'pass' && G.aiMove(data, g, 'ace').kind === 'pass', '앞서는데 상대 패스 → 패스');
    ok(G.aiMove(data, g, 'rookie').kind === 'play', '신참은 패스를 모른다'); }
  { /* 뒤지는데 손패 전부로도 못 뒤집으면 패스 */
    const [, g] = rig(['캐터피'], ['뮤츠', '뮤츠', '뮤츠'], { first: 'foe', exact: true });
    g.turn = 'foe'; put(g, 'foe', '뮤츠', 0); put(g, 'foe', '뮤츠', 1); put(g, 'foe', '뮤츠', 2); g.turn = 'me';
    ok(G.potential(data, g, 'me') < 39 && G.aiMove(data, g, 'veteran').kind === 'pass', '숙련 — 캐터피(+개방 5)로는 39 를 못 넘는다 → 패스'); }
  { /* 결속을 센다 — 같은 줄에 두 번째 단계를 */
    const [, g] = rig(['이상해씨', '이상해풀', '피카츄'], ['파이리', '파이리', '파이리'], { first: 'foe' });
    g.turn = 'foe'; put(g, 'foe', '파이리', 0); put(g, 'me', '이상해씨', 1);
    g.turn = 'foe'; put(g, 'foe', '파이리', 1); g.turn = 'me';
    const mv = G.aiMove(data, g, 'veteran'); ok(mv.kind === 'play' && mv.id === '이상해풀' && mv.lane === 1, '이상해풀을 이상해씨 줄(중장)에 — 결속: ' + JSON.stringify(mv)); }
  { /* 날씨판은 상대 줄이 셀 때 — 내 줄이 비고 상대 줄이 크면 값이 양 */
    const [, g] = rig(['파이리|w'], ['이상해꽃', '이상해씨'], { first: 'foe', exact: true });
    g.turn = 'foe'; put(g, 'foe', '이상해꽃', 0); put(g, 'foe', '이상해씨', 0); g.turn = 'me';
    const mv = G.aiMove(data, g, 'veteran'); ok(mv.kind === 'play' && mv.id === '파이리|w' && mv.lane === 0, '경장 줄(상대 결속 큰 줄)에 싸라기눈: ' + JSON.stringify(mv)); }
  { /* 에이스는 1라운드에 영웅·날씨·개방을 아낀다 — 목숨이 하나면 다 쓴다 */
    const [, g] = rig(['뮤츠', '파이리|w', '피카츄'], ['파이리', '파이리'], { exact: true, level: 'ace' });
    const mv = G.aiMove(data, g, 'ace'); ok(mv.kind === 'play' && mv.id === '피카츄', '에이스 1R — 뮤츠·날씨판은 아낀다: ' + JSON.stringify(mv));
    g.round = 2; g.lives.me = 1; const mv2 = G.aiMove(data, g, 'ace'); ok(mv2.kind === 'play' && mv2.id === '뮤츠', '목숨 하나면 뮤츠: ' + JSON.stringify(mv2)); }
}
/* ── 정산 — 통계·보상·금 ── */
{
  const [pr, m] = freshMatch(5); G.confirm(data, m); playOut(m, 'veteran', 'rookie');
  ok(G.settle(data, pr, m) !== null && m.rewarded && G.settle(data, pr, m) === null, '정산은 한 번');
  const s = pr.stats.gwent, o = m.outcome;
  ok(s.games === 1 && s[o.result] === 1 && s.rounds === m.roundLog.length && s.byBoss[m.champion].games === 1 && s.byLevel.veteran.games === 1 && s.byMain[1].games === 1, '통계가 는다');
  ok(s.bestRound === Math.max(...m.roundLog.map(r => r.me)) && s.weather === m.weathers && s.opens === m.opens && m.played.every(id => s.cards[id].played === 1 && !G.isWeather(id)), '최고 합·날씨·개방·카드별(기본 이름으로)');
  ok(pr.stats.lane.games === 0, '진화 결투 통계는 그대로');
  ok(o.gold === (o.result === 'win' ? 20 : 3) && pr.gold === o.gold, '금');
  if (o.result === 'win') { ok(o.pool.length === 5 && o.picks === 3 && o.first && pr.beaten[m.champion].veteran === 1, '첫 승 — 뒷장 5, 3장'); ok(G.pickReward(data, pr, m, 0).ok && pr.owned.includes(o.pool[0]), '뒤집기'); ok(G.finishRewards(data, pr, m).length === 2 && o.taken.length === 3, '나머지 자동'); }
  else ok(o.pool.length === 0 && o.picks === 0, '지면 보상 없음');
  const v = G.statsView(data, pr); ok(v.line.games === 1 && v.byBoss.length === 9 && typeof v.bestRound === 'number' && typeof v.weather === 'number' && typeof v.opens === 'number', '전적 보기 — 최고 합·날씨·개방');
  { const old = C.upgradeProfile({ main: 1, owned: ['피카츄'], decks: { lane: ['피카츄'] }, stats: { lane: { games: 3 } } }, data);
    ok(old.decks.gwent.length === 0 && old.stats.gwent.games === 0 && old.stats.gwent.bestRound === 0 && old.stats.lane.games === 3 && old.stats.lane.bestRound === 0, '옛 저장(gwent 없음)도 올린다'); }
}
/* ── 균형 보고 — 세대 9 × 난이도 3 × 시드 11 = 297판, 거기에 난이도 맞대결 ── */
if (!quick) {
  const perGen = {}, first = { w: 0, n: 0 }; let rounds = 0, games = 0, draws = 0, opens = 0, weathers = 0, strikes = 0;
  for (const ch of data.lane.champions) for (let li = 0; li < C.LEVELS.length; li++) for (let s = 0; s < 11; s++) {
    const lv = C.LEVELS[li], seed = ch.gen * 1000 + li * 100 + s;
    const pr = C.newProfile(data, ch.gen, seed); C.setDeck(pr, 'gwent', G.championDeck(data, { rngState: seed }, ch.gen, 'veteran'));
    const m = G.newMatch(data, pr, ch.ally, lv, seed); G.confirm(data, m); playOut(m, 'veteran', lv);
    games++; rounds += m.roundLog.length; opens += m.log.filter(e => e.t === 'open').length; weathers += m.log.filter(e => e.t === 'weather').length; strikes += m.log.filter(e => e.t === 'play' && e.hit).length;
    perGen[ch.gen] = perGen[ch.gen] || { w: 0, n: 0 }; perGen[ch.gen].n++;
    if (m.winner === 'draw') draws++; else { first.n++; if (m.winner === m.coin) first.w++; if (m.winner === 'me') perGen[ch.gen].w++; }
  }
  const duel = (a, b, n) => { let w = 0, d = 0; for (let s = 0; s < n; s++) { const g = 1 + (s % 9), pr = C.newProfile(data, g, 500 + s); C.setDeck(pr, 'gwent', G.championDeck(data, { rngState: 500 + s }, g, b)); const m = G.newMatch(data, pr, G.championOf(data, g).ally, b, 500 + s); G.confirm(data, m); playOut(m, a, b); if (m.winner === 'me') w++; else if (m.winner === 'draw') d++; } return { w, d, n }; };
  const vr = duel('veteran', 'rookie', 60), av = duel('ace', 'veteran', 60);
  const pct = x => Math.round(x * 100);
  console.log(`\n폼 결투 ${games}판 — 선공 승률 ${pct(first.w / first.n)}% (무승부 ${draws}) · 평균 라운드 ${(rounds / games).toFixed(2)} · 판당 개방 ${(opens / games).toFixed(2)} 날씨 ${(weathers / games).toFixed(2)} 타격 ${(strikes / games).toFixed(1)} · FIRST_BONUS=${G.FIRST_BONUS}`);
  for (const g in perGen) console.log(`  ${g}세대  ${String(pct(perGen[g].w / perGen[g].n)).padStart(3)}%  (${perGen[g].n})`);
  console.log(`  숙련 vs 신참 ${pct(vr.w / vr.n)}% (무 ${vr.d}) · 에이스 vs 숙련 ${pct(av.w / av.n)}% (무 ${av.d})`);
  assert(first.w / first.n >= 0.4 && first.w / first.n <= 0.6, '선공 승률이 40~60% 밖 — FIRST_BONUS 를 조정한다');
  for (const g in perGen) assert(perGen[g].w / perGen[g].n >= 0.25 && perGen[g].w / perGen[g].n <= 0.75, g + '세대 승률이 25~75% 밖');
  assert(vr.w / vr.n >= 0.55, '숙련이 신참을 55% 는 이겨야 한다');
  assert(av.w / av.n >= 0.55, '에이스가 숙련을 55% 는 이겨야 한다');
}
```

  `tests/lane-sim.cjs` 의 통계 그릇 검사(`const s = C.emptyStats();` 묶음)에 한 줄: `ok(s.bestRound === 0 && s.weather === 0 && s.opens === 0, '폼 결투 몫도 그릇에');`

- [ ] **Step 2: Run** `--quick` → Expected: FAIL `G.aiTurn is not a function`.

- [ ] **Step 3: Implement** — `lib/collection.js`: `emptyStats` 를
  `{ games: 0, win: 0, lose: 0, draw: 0, streak: 0, bestStreak: 0, rounds: 0, byBoss: {}, byLevel: {}, byMain: {}, cards: {}, bestLanes: 0, lines: {}, bestRound: 0, weather: 0, opens: 0 }` 로;
  `statsView` 의 `out = {…, bestLanes: s.bestLanes || 0, lines: [] }` 에 `bestRound: s.bestRound || 0, weather: s.weather || 0, opens: s.opens || 0` 를 더한다. 머리말의 "통계 그릇" 줄은 그대로(두 놀이가 한 그릇 꼴을 쓴다).

  `lib/gwent.js` — `endRound` 뒤에:

```js
  /* ── AI — 시드 난수로 결정적. 값 = 내 합 − 상대 합. 카드는 세 줄 가운데 값이 가장 큰 줄(힘·결속·날씨·타격이 다 들어간다) ── */
  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function value(data, st, who) { var s = sums(data, st); return s[who] - s[other(who)]; }
  function evaluate(data, st, move) { var who = st.turn, before = value(data, st, who), c = clone(st); act(data, c, move); return value(data, c, who) - before; }
  /* 손패를 다 내면 얼마나 더 — 각 카드의 가장 센 폼 + 남은 개방 + 날씨판이 있으면 상대 가장 센 줄을 1로 깎는 몫 */
  function potential(data, st, who) {
    var side = st[who], you = st[other(who)], i, c, p = 0, w = false, cut = 0, r;
    for (i = 0; i < side.hand.length; i++) { c = cardOf(data, side.hand[i]); if (!c) continue; if (c.weather) w = true; else p += best(c); }
    if (!side.opened) p += OPEN_BONUS;
    if (w) for (r = 0; r < ROWS; r++) if (!st.weather[r]) cut = Math.max(cut, rowSum(data, st, who === 'me' ? 'foe' : 'me', r) - you.rows[r].length);
    return p + cut;
  }
  function aiMove(data, st, level) {
    var who = st.turn, me = st[who], you = other(who), L = legal(data, st, who), cands = [], pos, plays, i, j, c, g, mv, lead, hold;
    level = level || st.level;
    if (!L.pass) return { kind: 'pass' };
    lead = value(data, st, who);
    hold = level === 'ace' && st.round === 1 && st.lives[who] > 1;   /* 에이스는 1라운드에 영웅·날씨판·개방을 아낀다 — 목숨이 하나면 다 쓴다 */
    for (i = 0; i < L.play.length; i++) {
      c = cardOf(data, L.play[i].id);
      if (hold && (c.rare || c.weather)) continue;
      for (j = 0; j < ROWS; j++) { mv = { kind: 'play', id: L.play[i].id, lane: j }; cands.push({ m: mv, g: evaluate(data, st, mv), cost: c.weather ? 0 : best(c) }); }
    }
    if (!hold) for (i = 0; i < L.open.length; i++) { mv = { kind: 'open', lane: L.open[i].lane, i: L.open[i].i }; cands.push({ m: mv, g: evaluate(data, st, mv) - me.hand.length * OPEN_BLEED, cost: 0 }); }   /* 차례마다 식으니 남은 손패만큼 뺀다 */
    if (level === 'rookie') {   /* 값이 오르는 수 가운데 아무거나. 패스를 모른다 — 오르는 수가 없으면 아무 카드나 */
      pos = cands.filter(function (x) { return x.g > 0; });
      if (pos.length) return pos[C.randInt(st, pos.length)].m;
      plays = cands.filter(function (x) { return x.m.kind === 'play'; });
      return plays.length ? plays[C.randInt(st, plays.length)].m : { kind: 'pass' };
    }
    if (lead > 0 && st.passed[you]) return { kind: 'pass' };                 /* 앞서는데 상대가 패스했다 */
    if (lead < 0 && potential(data, st, who) < -lead) return { kind: 'pass' };   /* 손패를 다 내도 못 뒤집는다 — 이 라운드는 버린다 */
    if (level === 'ace' && st.round === 1 && lead > 0 && me.hand.length <= HAND - 3) return { kind: 'pass' };   /* 에이스 — 1라운드는 손패를 아낀다 */
    cands.sort(function (a, b) { return (b.g - a.g) || (a.cost - b.cost); });   /* 값 큰 것, 같으면 싼 카드 */
    if (!cands.length || cands[0].g <= 0) return { kind: 'pass' };
    return cands[0].m;
  }
  function aiTurn(data, st, level) {
    var m = aiMove(data, st, level), r;
    r = act(data, st, m); if (r.ok) endTurn(data, st);
    return { ok: r.ok, move: m, why: r.why };
  }

  /* ── 정산 — 판이 끝날 때 한 번. 통계·금·보상 뒷장·상점 돌림 ── */
  function settle(data, profile, st) {
    var s, win = st.winner === 'me', result, i, top = 0, pool = [], picks = 0, first = false, gold;
    if (st.phase !== 'done' || st.rewarded) return null;
    C.upgradeProfile(profile, data); s = profile.stats.gwent;
    result = win ? 'win' : st.winner === 'foe' ? 'lose' : 'draw';
    C.bumpStats(s, { result: result, boss: st.champion, level: st.level, main: profile.main, rounds: st.roundLog.length, played: st.played });
    for (i = 0; i < st.roundLog.length; i++) if (st.roundLog[i].me > top) top = st.roundLog[i].me;
    if (top > s.bestRound) s.bestRound = top;
    s.weather = (s.weather || 0) + st.weathers; s.opens = (s.opens || 0) + st.opens;
    if (win) {
      if (!profile.beaten[st.champion]) profile.beaten[st.champion] = {};
      profile.beaten[st.champion][st.level] = (profile.beaten[st.champion][st.level] || 0) + 1;
      first = profile.beaten[st.champion][st.level] === 1;
      pool = C.buildRewardPool(data, st, profile, st.champion, st.level);
      picks = Math.min(pool.length, first ? C.REWARD_PICKS.first : C.REWARD_PICKS.again);
    }
    gold = C.goldFor(st.level, win);
    profile.gold += gold; C.shopRotate(data, profile);
    st.rewarded = true;
    st.outcome = { result: result, first: first, pool: pool, picks: picks, taken: [], gold: gold };
    return st.outcome;
  }
  function pickReward(data, profile, st, index) { return C.pickReward(profile, st.outcome, index); }
  function finishRewards(data, profile, st) { return C.finishRewards(st, profile, st.outcome); }
  function statsView(data, profile) { return C.statsView(data, profile, 'gwent'); }
```

api 에: `value: value, evaluate: evaluate, potential: potential, aiMove: aiMove, aiTurn: aiTurn, settle: settle, pickReward: pickReward, finishRewards: finishRewards, statsView: statsView`

- [ ] **Step 4: Run** `--quick` → Expected: PASS. 각 AI 검사가 어긋나면 **먼저 값 계산을 손으로 재** 보고(힘·결속·날씨 포함) 기대값이 틀렸으면 자료대로, AI 가 틀렸으면 코드를 고친다.

- [ ] **Step 5: 균형 보고** — `fnm exec --using=22 node tests/gwent-sim.cjs > ../scratch/gwent-balance.txt; tail -20 …`
  Expected: 선공 40~60%, 세대 25~75%, 숙련>신참 ≥55%, 에이스>숙련 ≥55%. 밖이면: 선공 → `FIRST_BONUS` 를 ±2 로 옮겨 다시(최대 세 번, 값과 결과를 ledger 에 `Ruling:`), 난이도 → `aiMove` 의 패스 조건·에이스 hold 조건을 손본다. 모든 조정은 ledger 에.

- [ ] **Step 6: 전체 검사** `lane-sim --quick`, `gwent-sim --quick`, `forms` → PASS.

- [ ] **Step 7: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — AI·정산·균형 보고

- lib/gwent.js — AI 셋(신참 무작위·숙련 값 최대와 패스 둘·에이스 1라운드 아끼기), 정산(stats.gwent·보상·금·상점 돌림), 균형 보고 결과로 FIRST_BONUS=<값>
- lib/collection.js — 통계 그릇에 폼 결투 몫(bestRound·weather·opens), statsView 가 건넨다
- tests/gwent-sim.cjs — AI·정산 검사, 297판 + 난이도 맞대결 120판 균형 보고
- tests/lane-sim.cjs — 통계 그릇에 새 칸 셋
```

```bash
git add lib/gwent.js lib/collection.js tests/gwent-sim.cjs tests/lane-sim.cjs docs/PATCH.md && git commit -m "폼 결투 — AI·정산·균형 보고"
```

---

### Task 6: 말 · 항해 탭 · 집 화면 · 허브 · 검사 목록

**Files:**
- Modify: `lib/words.js` (`nav.gwent`, `home.gwent.*`, `gwent.*`), `lib/workspace-ui.js` (탭 8, 제목·부제), `lib/workspace.css`(덮개 탭 글자), `index.html`(lab-links), 모든 `*.html` + `lib/prompt-ui.js` + `lib/survey-ui.js` (`?v=lane1` → `?v=gwent1`), `tests/header-layout.cjs`, `tests/theme-screen.cjs`, `../polos0117.github.io/index.html`, `docs/PATCH.md`

**Interfaces:**
- Produces: 낱말 열쇠 전부(아래 표 그대로 — Task 7·8 의 화면이 이 열쇠만 쓴다).

- [ ] **Step 1: 검사부터 바꾼다 (RED)** — `tests/header-layout.cjs` 와 `tests/theme-screen.cjs` 의 화면 목록에 `['gwent.html','.gw-screen']` 를 `lane.html` 뒤에; theme-screen 의 항해 차례 배열에 `'gwent.html'` 을 `'lane.html'` 뒤에; header-layout 의 `결투·탐사 탭이 보인다` 줄에 `a[href="gwent.html"]` 도 보이는지 더하고 PASS 문구를 `8 pages` 로.

Run: `fnm exec --using=22 node tests/theme-screen.cjs` → Expected: FAIL (gwent.html 404 또는 항해 배열 불일치).

- [ ] **Step 2: `lib/words.js`** — `'nav.lane': '결투',` 뒤에 `'nav.gwent': '폼 결투',`; `lane.*` 묶음 끝(`'lane.need.deck': …,` 뒤)에:

```js
    /* 폼 결투 — gwent.html */
    'home.gwent.code': '07 / FORM DUEL',
    'home.gwent.title': '폼 결투',
    'home.gwent.note': '카드를 경장·중장·고기동 줄에 내려 그 줄의 폼으로 세운다. 세 줄 합으로 세 라운드 중 둘. 상성 타격·계통 결속·개방·날씨판.',
    'gwent.title': '폼 결투',
    'gwent.subtitle': '줄이 폼 — 세 줄 힘의 합으로 세 라운드 중 둘.',
    'gwent.pick.title': '주 세대를 고른다',
    'gwent.pick.note': '그 세대 17장(계통째)과 다른 세대 8장으로 시작한다. 진화 결투와 같은 컬렉션이다. 그림이 17장 안 된 세대는 잠겨 있다.',
    'gwent.pick.go': '이 세대로 시작',
    'gwent.lobby.deck': '덱 {n}/{max}', 'gwent.lobby.build': '덱 짜기',
    'gwent.lv.note': '신참은 무작위 덱, 숙련은 계통이 완성된 덱, 에이스는 거기에 전설 넷과 날씨판 둘.',
    'gwent.lobby.champions.note': '자기 세대 17장 + 이웃 세대 8장을 든다. 그림이 모자란 챔피언은 잠겨 있다. 진화 결투와 승수를 따로 센다.',
    'gwent.build.note': '25장. 주 세대 15장 이상, 전설 4장 이하, 날씨판 3장 이하. 같은 계통을 같은 줄에 모으면 결속.',
    'gwent.build.rule.weather': '날씨판 {n}/3',
    'gwent.why.weather': '날씨판은 3장까지',
    'gwent.build.autofill.note': '주 세대 센 것부터 25장을 채운다(날씨판은 손으로)',
    'gwent.build.weather.add': '날씨판 넣기', 'gwent.build.weather.remove': '날씨판 빼기', 'gwent.build.weather.none': '일상컷이 없어 날씨판이 안 된다',
    'gwent.weather.tag': '날씨판',
    'gwent.weather.hail': '싸라기눈', 'gwent.weather.sand': '모래바람', 'gwent.weather.rain': '비',
    'gwent.weather.note': '내면 줄을 골라 깐다 — 그 줄의 양쪽 비전설은 1. 같은 줄에 또 내면 걷힌다.',
    'gwent.power3': '경장 {light} · 중장 {heavy} · 고기동 {mobility}',
    'gwent.form.light.text': '공격 + 특공', 'gwent.form.heavy.text': '방어 + 특방', 'gwent.form.mobility.text': '속도 × 2',
    'gwent.hero': '전설 — 피해·날씨·결속·개방을 받지 않는다',
    'gwent.row.sum': '합 {n}',
    'gwent.row.empty': '빈 줄',
    'gwent.play': '내기', 'gwent.play.where': '어느 줄에? 숫자가 그 줄의 힘',
    'gwent.open': '개방', 'gwent.open.used': '개방 씀', 'gwent.open.pick': '열 카드를 고른다', 'gwent.open.this': '이 카드 개방',
    'gwent.unit.dmg': '피해 −{n}', 'gwent.unit.open': '개방 +{n}', 'gwent.unit.bond': '결속',
    'gwent.hit': '{name} −{n}',
    'gwent.first.bonus': '선공 +{n}',
    'gwent.sum': '{me} : {foe}',
    'gwent.round.win': '{n}라운드 — {me} : {foe}, 내가 땄다', 'gwent.round.lose': '{n}라운드 — {me} : {foe}, 상대가 땄다', 'gwent.round.draw': '{n}라운드 — {me} : {foe}, 동점. 둘 다 잃는다',
    'gwent.round.win.short': '{n}라운드 승', 'gwent.round.lose.short': '{n}라운드 패', 'gwent.round.draw.short': '{n}라운드 동점',
    'gwent.result.pool.note': '뒷장을 눌러 뒤집는다. 첫 승은 3장, 재대결은 1장. 앞 두 장은 내 계통의 빈 단계.',
    'gwent.stats.best': '한 라운드 최고 합 {n}', 'gwent.stats.weather': '날씨판 {n}', 'gwent.stats.opens': '개방 {n}',
    'gwent.rules.title': '규칙 한눈에',
    'gwent.rules.1.title': '줄이 폼', 'gwent.rules.1.text': '카드는 경장·중장·고기동 어느 줄에든 — 놓은 줄이 그 카드의 폼이고 힘이 줄마다 다르다(경장 공격+특공, 중장 방어+특방, 고기동 속도). 세 줄 합이 큰 쪽이 라운드. 동점은 둘 다 잃는다. 목숨 둘, 라운드 셋. 손패 열 장으로 세 라운드 — 보충은 없다.',
    'gwent.rules.2.title': '상성 타격과 결속', 'gwent.rules.2.text': '카드를 내면 상대 판에서 내 타입에 2배 이상인 비전설 가운데 가장 센 것이 −2(4배는 −3). 같은 계통을 같은 줄에 둘 이상 모으면 각각 기본 힘만큼 더한다. 전설은 피해·날씨·결속·개방을 받지 않는다.',
    'gwent.rules.3.title': '개방', 'gwent.rules.3.text': '한 판에 한 번, 차례를 써서 내 판 위 카드 하나 +5. 그 뒤 내 차례가 올 때마다 1씩 식는다 — 늦게 쓸수록 좋다.',
    'gwent.rules.4.title': '날씨판과 패스', 'gwent.rules.4.text': '일상컷이 있는 카드는 덱에 날씨판으로도 넣는다(3장까지). 내면 줄을 골라 깐다 — 경장 싸라기눈·중장 모래바람·고기동 비. 그 줄의 양쪽 비전설은 1. 또 내면 걷힌다. 패스하면 이 라운드는 끝. 1라운드 선공은 합 +8.',
    'gwent.guide.1': '손패에서 카드를 누르고 내기 — 세 줄에 그 줄의 힘이 뜬다. 가장 큰 줄에 놓자.',
    'gwent.guide.2': '상대가 답한다. 가운데 숫자가 합 — 큰 쪽이 라운드를 딴다.',
    'gwent.guide.3': '같은 계통을 같은 줄에 모으면 결속으로 두 배. 상대 타입에 2배인 카드를 내면 타격.',
    'gwent.guide.4': '앞서고 있으면 패스. 손패는 세 라운드 몫이다.',
    'gwent.guide.5': '개방은 한 판에 한 번 — 마지막 라운드의 결정적인 카드에.',
    'gwent.guide.6': '날씨판은 상대가 센 줄에. 라운드 셋, 목숨 둘.',
```

  화면은 나머지(세대·난이도·로비·덱 짜기·멀리건·결과·전적·상점·패스·차례·닫기 등)를 **`lane.*` 열쇠 그대로** 쓴다 — 같은 말이고 두 벌 두면 어긋난다. 단 `lane.title`·`lane.subtitle`·`lane.rules.*`·`lane.guide.*`·`lane.build.note`·`lane.lv.note`·`lane.lobby.champions.note`·`lane.result.pool.note`·`lane.stats.best` 는 **쓰지 않는다**(위에 gwent 것이 있다).

- [ ] **Step 3: `lib/workspace-ui.js`** — `title` 표에 `gwent:'gwent.title'`; subtitle 식을 `page==='prompt'?'prompt.subtitle':page==='lane'?'lane.subtitle':page==='gwent'?'gwent.subtitle':'app.subtitle'`; 탭 배열 `['index','dex','prompt','battle','run','lane','gwent','survey']`.

- [ ] **Step 4: `index.html`** lab-links 배열에 `'gwent'` 를 `'lane'` 뒤에.

- [ ] **Step 5: `?v=` 올리기** — 저장소 전체에서 `words.js?v=lane1`·`workspace-ui.js?v=lane1`·`workspace.css?v=lane1` → `gwent1` (`grep -rl "v=lane1" --include=*.html --include=*.js .` 로 찾아 전부).

- [ ] **Step 6: 허브** `../polos0117.github.io/index.html` — 두 nav 의 `<a href="/pkm-atelier/lane.html">결투</a>` 뒤에 `<a href="/pkm-atelier/gwent.html">폼 결투</a>`; 설명 문장의 "진화 결투." 뒤에 " 폼 결투." (문장 하나면 `…진화 결투, 폼 결투.`).

- [ ] **Step 7: 덮개 탭** — 임시 `gwent.html` 없이도 header-layout 은 gwent.html 을 열려고 하므로, 이 Task 의 검사는 **Task 7 에서** 돈다. 여기서는 `node tests/words.cjs`·`workspace-theme.cjs` 만: Expected PASS (words 는 html 안의 한글 리터럴과 `W` 열쇠 유무를 본다 — 열쇠가 빠졌다고 하면 위 표에 더한다).

  덮개(344px)에서 탭 일곱(연구소 숨김)이 한 줄에 들어가야 한다. `lib/workspace.css` 의 `@media (max-width:599px)` 묶음에 `.workspace-nav a {font-size:11px}` 를 더해 둔다(Task 7 의 header-layout 이 글자 잘림을 잰다 — 거기서 안 맞으면 `nav.gwent` 를 `'폼결투'` 로).

- [ ] **Step 8: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — 말·항해·집·허브

- lib/words.js — gwent.* 와 nav.gwent·home.gwent.* (공통 말은 lane.* 를 같이 쓴다)
- lib/workspace-ui.js — 탭 여덟, 폼 결투 제목·부제
- lib/workspace.css — 덮개에서 탭 일곱이 한 줄에 들도록 글자 11px
- index.html — 놀이 목록에 폼 결투
- *.html, lib/prompt-ui.js, lib/survey-ui.js — words·workspace-ui·workspace.css 를 ?v=gwent1 로
- tests/header-layout.cjs, tests/theme-screen.cjs — 화면 여덟
```

```bash
git add -A lib index.html *.html tests/header-layout.cjs tests/theme-screen.cjs docs/PATCH.md && git commit -m "폼 결투 — 말·항해·집·허브"
cd ../polos0117.github.io && git add index.html && git commit -m "pkm 폼 결투 링크" && cd ../pkm-atelier
```

---
### Task 7: `gwent.html` — 껍데기·자료·저장·카드·고르기·로비·덱 짜기(날씨판)·규칙·멀리건 + 덮개 검사 1

**Files:**
- Create: `gwent.html`, `tests/gwent-screen.cjs`
- Modify: `docs/PATCH.md`

**Interfaces:**
- Consumes: `AtelierGwent`(Task 1~5), `AtelierCollection`, `AtelierImg`, 낱말(Task 6).
- Produces: 화면 뼈대 — `.gw-screen[data-screen=pick|lobby|build|mulligan|match|result]`, `.gw-gen[data-gen]`, `#gw-pick-go`, `.gw-head .gw-deck[data-ok]`, `.gw-coll`, `#gw-build`·`#gw-stats`·`#gw-shop`·`#gw-learn`, `.gw-lv button[data-lv]`, `.gw-champion[data-gen]`, 덱 짜기 `.gw-pick-cell`·`.gw-toggle[data-id]`·`.gw-toggle-w[data-id]`·`.gw-rule span[data-rule]`·`.gw-why`·`#gw-build-done`·`#gw-autofill`·`[data-view]`·`.gw-main-pick button[data-gen]`, 상세 `.gw-detail`·`.gw-form[data-form]`·`#gw-close`·`#gw-detail-act`·`#gw-detail-w`, 규칙 `.gw-rules`·`.gw-rule-card`·`#gw-rules-close`, 멀리건 `.gw-mull .cell`·`.swapped`·`#gw-mull-go`. Task 8 이 `Match` 를 채운다 — 이 Task 의 `Match` 는 `<section class="gw-screen" data-screen="match">` 빈 자리.

- [ ] **Step 1: Write the failing test** — `tests/gwent-screen.cjs`:

```js
/* 폼 결투 화면 — 덮개(344×882). 첫 고르기 → 로비 → 덱 짜기(날씨판) → 멀리건 → (Task 8) 대결 → 결과·전적·상점·새로고침·옛 저장.
   그림이 몇 장뿐이라 img.json 을 검사용으로 바꿔 끼운다 — 1~3세대 전부 폼 초상 셋 + 일상컷 하나. 그림 파일은 404 라 빈 자리로 뜬다.
   Run: ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/gwent-screen.cjs */
const fs = require('node:fs'), assert = require('node:assert/strict'), { start, FOLD } = require('./browser-harness.cjs');
const card = JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards.character;
const NAMES = card.filter(c => c.gen <= 3).map(c => c.name);
const KEY = 'pkm_duel_v1';
const C = require('../lib/collection.js'), G = require('../lib/gwent.js');
const J = n => JSON.parse(fs.readFileSync('data/' + n + '.json', 'utf8'));
const fakeImgObj = (() => { const img = {}; for (const n of NAMES) img[n] = { byStyle: { test: { byForm: { light: { f: n + '_light_test_f.webp' }, heavy: { f: n + '_heavy_test_f.webp' }, mobility: { f: n + '_mobility_test_f.webp' } }, casual: { f: [n + '_test_f_casual1.webp'] } } } }; return img; })();
const dataN = { cards: card, chart: J('chart').chart, group: J('group'), label: J('label'), img: fakeImgObj, lane: J('lane'), gwent: J('gwent') };
const myTurn = p => p.waitForSelector('.gw-turn[data-turn="me"]', { timeout: 15000 });
const fakeImg = [names => {
  const real = window.fetch;
  window.fetch = (u, o) => {
    if (String(u).includes('data/img.json')) {
      const img = {}; for (const n of names) img[n] = { byStyle: { test: { byForm: { light: { f: n + '_light_test_f.webp' }, heavy: { f: n + '_heavy_test_f.webp' }, mobility: { f: n + '_mobility_test_f.webp' } }, casual: { f: [n + '_test_f_casual1.webp'] } } } };
      return Promise.resolve(new Response(JSON.stringify({ version: 1, img }), { headers: { 'Content-Type': 'application/json' } }));
    }
    return real(u, o);
  };
}, NAMES];
async function openGwent(h, opt) {
  opt = opt || {};
  const a = await h.open('gwent.html', { viewport: FOLD.cover, mobile: true, init: fakeImg, store: opt.store });
  await a.page.waitForSelector('.gw-screen[data-screen]');
  return a;
}
const tappable = async (p, sel) => { for (const b of await p.locator(sel).all()) { if (!await b.isVisible()) continue; const r = await b.boundingBox(); assert(r && r.height >= 44 && r.width >= 40, sel + ' 누르는 자리 44px: ' + JSON.stringify(r)); } };
const noOverflow = async p => assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), '가로 넘침');
(async () => {
  const h = await start();
  try {
    /* 첫 고르기 */
    const a = await openGwent(h), p = a.page;
    assert.equal(await p.locator('.gw-screen').getAttribute('data-screen'), 'pick', '첫 화면은 고르기');
    assert.equal(await p.locator('.gw-gen').count(), 9, '세대 아홉');
    assert(await p.locator('.gw-gen[data-gen="1"]').isEnabled() && await p.locator('.gw-gen[data-gen="4"]').isDisabled(), '1세대 열림, 4세대 잠김');
    await tappable(p, '.gw-gen'); await noOverflow(p);
    await p.locator('.gw-gen[data-gen="1"]').tap(); await p.locator('#gw-pick-go').tap();
    await p.waitForSelector('.gw-screen[data-screen="lobby"]');
    /* 로비 — 프로필은 진화 결투와 같은 저장, 덱은 decks.gwent */
    const saved = JSON.parse(await p.evaluate(k => localStorage.getItem(k), KEY));
    assert(saved.profile.main === 1 && saved.profile.owned.length === 25 && saved.profile.decks.gwent.length === 25 && saved.profile.decks.lane.length === 25, '프로필이 저장됐다 — 두 덱');
    assert.equal(await p.locator('.gw-champion').count(), 9, '챔피언 아홉');
    assert(await p.locator('.gw-champion[data-gen="1"]').isEnabled() && await p.locator('.gw-champion[data-gen="3"]').isDisabled(), '1세대 도전 가능, 3세대 잠김');
    assert((await p.locator('.gw-deck').getAttribute('data-ok')) === 'true', '시작 덱은 출전 가능');
    await p.locator('.gw-lv button[data-lv="ace"]').tap(); assert.equal(await p.locator('.gw-lv button.on').getAttribute('data-lv'), 'ace', '난이도');
    await tappable(p, '.gw-tools .gw-btn, .gw-lv button, .gw-champion:enabled'); await noOverflow(p);
    /* 덱 짜기 — 빼면 빨갛고, 날씨판을 넣으면 날씨 1/3, 네 장이면 빨갛다 */
    await p.locator('#gw-build').tap(); await p.waitForSelector('.gw-screen[data-screen="build"]');
    assert.equal(await p.locator('.gw-pick-cell').count(), 25, '가진 카드 25');
    assert(/5/.test(await p.locator('.gw-pick-cell .gw-pw3').first().textContent()), '카드에 힘 셋');
    await p.locator('.gw-pick-cell .gw-toggle').first().tap();
    assert.equal(await p.locator('.gw-rule span[data-rule="count"].bad').count(), 1, '24장 — 규칙 줄이 빨갛다');
    const firstId = await p.locator('.gw-pick-cell .gw-toggle-w').first().getAttribute('data-id');
    await p.locator('.gw-pick-cell .gw-toggle-w').first().tap();
    assert(/1\/3/.test(await p.locator('.gw-rule span[data-rule="weather"]').textContent()) && await p.locator('.gw-rule span.bad').count() === 0, '날씨판 1/3 — 25장으로 돌아온다');
    assert(JSON.parse(await p.evaluate(k => localStorage.getItem(k), KEY)).profile.decks.gwent.includes(firstId + '|w'), '덱에 이름|w');
    for (let i = 1; i < 4; i++) await p.locator('.gw-pick-cell .gw-toggle-w').nth(i).tap();
    assert.equal(await p.locator('.gw-rule span[data-rule="weather"].bad').count(), 1, '날씨판 넷은 초과');
    await p.locator('[data-view="in"]').tap(); assert.equal(await p.locator('.gw-pick-cell').count(), 25, '덱 안 — 기본판 24 + 날씨판만 든 1');
    await p.locator('[data-view="all"]').tap();
    await p.locator('#gw-autofill').tap();
    assert.equal(await p.locator('.gw-rule span.bad').count(), 0, '자동 채우기가 날씨판을 줄여 규칙을 채운다');
    /* 상세 — 폼 셋과 힘, 날씨판 단추 */
    await p.locator('.gw-pick-cell .cell').first().tap(); await p.waitForSelector('.gw-detail');
    assert.equal(await p.locator('.gw-detail .gw-form').count(), 3, '폼 셋');
    assert(await p.locator('#gw-detail-w').isVisible(), '날씨판 넣기/빼기 단추');
    await p.locator('#gw-close').tap(); await p.waitForSelector('.gw-detail', { state: 'detached' });
    await p.locator('.gw-main-pick button[data-gen="2"]').tap(); assert.equal(await p.locator('.gw-rule span[data-rule="main"].bad').count(), 1, '주 세대를 바꾸면 미달');
    await p.locator('.gw-main-pick button[data-gen="1"]').tap();
    await tappable(p, '.gw-toggle, .gw-toggle-w, .gw-chips button, .gw-main-pick button, .gw-build-act .gw-btn'); await noOverflow(p);
    await p.locator('#gw-build-done').tap(); await p.waitForSelector('.gw-screen[data-screen="lobby"]');
    /* 배우기 */
    await p.locator('#gw-learn').tap(); await p.waitForSelector('.gw-rules');
    assert.equal(await p.locator('.gw-rule-card').count(), 4, '규칙 넷');
    await p.locator('#gw-rules-close').tap(); await p.waitForSelector('.gw-rules', { state: 'detached' });
    assert.deepEqual(a.errors, [], '화면 오류 없음');
    await a.close();
    /* ── 멀리건 — 판을 손으로 짜서 저장에 넣는다 ── */
    const pr = C.newProfile(dataN, 1, 7); C.setDeck(pr, 'gwent', pr.owned.slice()); const m = G.newMatch(dataN, pr, 2, 'rookie', 7);
    m.me.hand = ['이상해씨', '이상해풀', '꼬부기', '피카츄', '파이리|w', '잉어킹', '이브이', '뮤츠', '리자드', '꼬마돌'];
    /* 상대 손패는 내 풀·독·전기를 2배로 때리지 못하는 카드만 — 대결 검사(Task 8)가 결속 합을 그대로 읽는다 */
    m.foe.hand = ['치코리타', '베이리프', '메가니움', '리아코', '엘리게이', '꼬리선', '토게피', '에레키드', '메리프', '보송송'].filter(n => NAMES.includes(n));
    const b = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: pr, matches: { gwent: m } })] }), q = b.page;
    assert.equal(await q.locator('.gw-screen').getAttribute('data-screen'), 'mulligan', '저장된 판은 멀리건부터');
    assert.equal(await q.locator('.gw-mull .cell').count(), 10, '손패 10');
    assert.equal(await q.locator('.gw-mull .cell[data-id="파이리|w"] .gw-wtag').count(), 1, '날씨판은 표시가 붙는다');
    await q.locator('.gw-mull .cell').nth(9).tap(); assert.equal(await q.locator('.gw-mull .cell.swapped').count(), 1, '한 장 바꿈');
    await tappable(q, '.gw-mull .cell, #gw-mull-go'); await noOverflow(q);
    await q.locator('#gw-mull-go').tap(); await q.waitForSelector('.gw-screen[data-screen="match"]');
    assert.deepEqual(b.errors, [], '멀리건 화면 오류 없음');
    await b.close();
    console.log('PASS 폼 결투 화면: 첫 고르기 · 로비 · 덱 짜기(날씨판) · 배우기 · 멀리건');
  } finally { await h.stop(); }
})();
```

- [ ] **Step 2: Run** `fnm exec --using=22 node tests/gwent-screen.cjs` → Expected: FAIL (gwent.html 404 → `.gw-screen` 대기 timeout).

- [ ] **Step 3: Create `gwent.html`** — `lane.html` 을 본으로 하되 `gw-` 접두. CSS 는 `lane.html` 의 것을 `ln-` → `gw-` 로 바꾼 것에 아래 **줄 판 CSS** 를 더한다(스택·승부 칸·옮기기 연출 CSS 는 뺀다). 전체:

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow, noarchive, noimageindex">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#faf9f3">
<title>포켓몬 메카 연구소</title>
<!--
  폼 결투(궨트식)의 얼굴. 규칙은 lib/gwent.js 에만, 컬렉션·보상·상점은 lib/collection.js 에만 있다 — 여기는 상태를 그리고 단추를 엔진에 넘길 뿐이다.
  진화 결투(lane.html)와 같은 저장(localStorage 의 pkm_duel_v1)을 쓴다 — decks.gwent · stats.gwent · matches.gwent.
  설계: docs/superpowers/specs/2026-10-06-gwent-duel-design.md
-->
<link rel="stylesheet" href="lib/workspace.css?v=gwent1">
<style>
/* ⟵ lane.html 의 <style> 전체를 복사하고 `ln-` 를 `gw-` 로, `.lane-page` 를 `.gwent-page` 로 바꾼다. 그 가운데
   .gw-lanes · .gw-lane · .gw-slot · .gw-stack* · .gw-vs · .gw-row · .gw-atk · .gw-arrow · .gw-mult · .gw-by · @keyframes gw-evo · gw-slide · .gw-stage 는 지우고 아래를 더한다 */
/* ── 줄 판 — 상대 셋 ↑ 막대 ↓ 내 셋. 줄은 머리(폼·날씨·합) + 카드 띠 ── */
.gw-rows {display:flex;flex-direction:column;gap:4px;margin:4px 0}
.gw-row {position:relative;display:grid;grid-template-columns:54px minmax(0,1fr);gap:4px;min-height:64px;padding:3px;border:1px solid var(--line);border-radius:10px;background:var(--card)}
.gw-row[data-side="foe"] {background:color-mix(in srgb,var(--signal,#c33) 6%,var(--card))}
.gw-row.weathered {background:repeating-linear-gradient(135deg,var(--card) 0 8px,var(--card2) 8px 16px)}
.gw-row.won-me {box-shadow:inset 0 0 0 2px var(--accent)} .gw-row.won-foe {box-shadow:inset 0 0 0 2px var(--signal,#c33)}
.gw-row-head {display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 2px;font:700 10px ui-monospace,monospace;color:var(--muted);letter-spacing:.02em}
.gw-row-head b {font-size:15px;color:var(--text)} .gw-row[data-side="foe"] .gw-row-head b {color:var(--signal,#c33)}
.gw-row-head .gw-wx {color:var(--accent);font-size:10px}
.gw-units {display:flex;gap:4px;overflow-x:auto;align-items:center;min-height:58px}
.gw-units .gw-row-empty {font:700 10px ui-monospace,monospace;color:var(--muted);padding-left:4px}
.gw-unit {position:relative;flex:none;width:44px;height:58px;padding:0;border:1px solid var(--line);border-radius:6px;overflow:hidden;background:var(--card2);font:inherit;color:inherit;cursor:pointer}
.gw-unit img,.gw-unit .ph {width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.gw-unit .gw-pw {left:2px;bottom:2px;min-width:18px;padding:1px 3px;font-size:11px;border-radius:4px}
.gw-unit.rare {border-color:var(--gold,#c9a227);box-shadow:0 0 0 1px var(--gold,#c9a227)}
.gw-unit.hurt .gw-pw {background:var(--signal,#c33)} .gw-unit.bond .gw-pw {background:var(--gold,#c9a227);color:#221a06} .gw-unit.open {box-shadow:0 0 0 2px var(--accent),0 0 12px var(--accent)}
.gw-unit.flip {animation:gw-flip .5s ease-out} @keyframes gw-flip {from {transform:rotateY(90deg)} to {transform:rotateY(0)}}
.gw-unit.hit {animation:gw-hit .6s} @keyframes gw-hit {0%,100% {transform:none} 25% {transform:translateX(-4px);filter:brightness(1.6) sepia(1) hue-rotate(-50deg)} 75% {transform:translateX(4px)}}
.gw-unit.burst::after {content:'';position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,var(--accent) 0,transparent 65%);animation:gw-burst .8s ease-out forwards;pointer-events:none}
.gw-target {position:absolute;inset:3px;z-index:2;display:flex;align-items:center;justify-content:center;min-height:44px;border:2px dashed var(--accent);border-radius:8px;background:var(--accent-soft);color:var(--text);font:800 15px ui-monospace,monospace;cursor:pointer;animation:gw-pulse 1.2s infinite alternate}
.gw-target[data-kind="open"] {position:static;inset:auto;flex:none;width:44px;height:58px;font-size:11px;border-color:var(--gold,#c9a227);background:color-mix(in srgb,var(--gold,#c9a227) 25%,transparent)}
.gw-pw3 {position:absolute;left:6px;bottom:6px;padding:2px 6px;border-radius:7px;font:800 11px ui-monospace,monospace;background:#000a;color:#fff;letter-spacing:.04em}
.gw-pw3.rare {background:var(--gold,#c9a227);color:#221a06}
.gw-wtag {position:absolute;right:6px;top:6px;padding:2px 6px;border-radius:999px;background:var(--accent);color:var(--on-accent,#fff);font:700 10px ui-monospace,monospace}
.gw-form .gw-fp {display:block;padding:0 6px 6px;text-align:center;font:800 14px ui-monospace,monospace;color:var(--text)}
.gw-toggle-w {min-height:44px;background:var(--card2);border:1px solid var(--line);border-radius:8px;color:var(--muted);font:inherit;font-weight:700;font-size:11px;cursor:pointer}
.gw-toggle-w.in {background:var(--accent-soft);color:var(--accent);border-color:var(--accent)}
.gw-toggle-w:disabled {opacity:.4;cursor:default}
.gw-bar .gw-sumline b {font-size:18px;color:var(--text);letter-spacing:.06em} .gw-bar .gw-sumline b[data-side="foe"] {color:var(--signal,#c33)}
@media (prefers-reduced-motion:reduce) {.gw-unit.flip,.gw-unit.hit,.gw-target {animation:none} .gw-unit.burst::after {display:none}}
</style>
<script src="lib/workspace-theme.js?v=pokemon1"></script>
<script src="lib/words.js?v=gwent1"></script>
<script src="lib/fresh.js?v=4"></script>
<script src="lib/img.js"></script>
<script src="lib/collection.js?v=1"></script>
<script src="lib/gwent.js?v=1"></script>
</head>
<body class="dex-page gwent-page">
<div id="app"></div>
<script type="module">
import { h, render } from 'https://esm.sh/preact@10.24.3';
import { useState, useEffect, useMemo, useRef } from 'https://esm.sh/preact@10.24.3/hooks';
import htm from 'https://esm.sh/htm@3.1.1';
import { WorkspaceHeader } from './lib/workspace-ui.js?v=gwent1';
const html = htm.bind(h);
const W = window.W, IMG = window.AtelierImg, C = window.AtelierCollection, G = window.AtelierGwent;
const STORE = 'pkm_duel_v1';

function Shell({ children }) {
  return html`<main>
    <${WorkspaceHeader} page="gwent" />
    <div class="collection-scroll" tabindex="0">${children}</div>
  </main>`;
}
/* 자료 — card·chart·group·label·lane(챔피언)·gwent 와 그림 등록부 */
function useData() {
  const [state, set] = useState(null);
  useEffect(() => {
    const get = f => fetch(f, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(f + ' ' + r.status); return r.json(); });
    Promise.all([get('data/card.json'), get('data/chart.json'), get('data/group.json'), get('data/label.json'), get('data/lane.json'), get('data/gwent.json'), IMG.load()])
      .then(([card, chart, group, label, lane, gwent, img]) => set({ data: { cards: card.cards.character, chart: chart.chart, group, label, img, lane, gwent } }))
      .catch(e => set({ error: String((e && e.message) || e) }));
  }, []);
  return state;
}
/* 저장 하나 — 진화 결투와 같은 열쇠. 여기는 matches.gwent 만 읽고 쓴다 */
function load() {
  try {
    const j = JSON.parse(localStorage.getItem(STORE));
    if (!j || !j.profile) return { profile: null, match: null };
    return { profile: C.upgradeProfile(j.profile), match: j.v === C.VERSION && j.matches && j.matches.gwent ? j.matches.gwent : null };
  } catch { return { profile: null, match: null }; }
}
function save(profile, match) { try { const j = JSON.parse(localStorage.getItem(STORE) || '{}'); localStorage.setItem(STORE, JSON.stringify({ v: C.VERSION, profile, matches: { ...(j.matches || {}), gwent: match } })); } catch {} }
function seed() { return (Date.now() ^ Math.floor(Math.random() * 1e9)) | 0; }
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/* 모르는 이름은 컬렉션에서, 풀 밖·일상컷 없는 날씨판은 덱에서만 뺀다. 판에 모르는 id 가 있으면 판을 버린다 */
function sanitise(data, profile, match) {
  const D = G.cardsOf(data), known = id => !!D.cards[G.baseName(id)];
  let changed = false;
  if (profile) {
    const owned = profile.owned.filter(known), deck = C.deckOf(profile, 'gwent').filter(id => G.canUse(data, profile, id));
    if (owned.length !== profile.owned.length || deck.length !== profile.decks.gwent.length) { profile = JSON.parse(JSON.stringify(profile)); profile.owned = owned; profile.decks.gwent = deck; changed = true; }
    const stock = (profile.shop && profile.shop.stock) || [];
    if (stock.length < C.SHOP_SLOTS || stock.some(x => x && !known(x.id))) { profile = JSON.parse(JSON.stringify(profile)); profile.shop.stock = stock.filter(x => !x || known(x.id)); C.upgradeProfile(profile, data); changed = true; }
  }
  if (match) {
    const ids = [];
    for (const side of ['me', 'foe']) { const sd = match[side] || {}; ids.push(...(sd.hand || []), ...(sd.deck || []), ...(sd.grave || [])); for (const r of sd.rows || []) for (const u of r) ids.push(u.id); }
    if (!ids.every(id => G.cardOf(data, id))) { match = null; changed = true; }
  }
  return { profile, match, changed };
}

/* ── 그림 — 폼 초상·개방·일상컷 ── */
function formArt(data, name, form, open) {
  const entry = data.img[name]; if (!entry) return null;
  const bs = IMG.styleMap(entry), want = open ? [form + '_overdrive', 'overdrive', form] : [form];
  for (const k of Object.keys(bs)) for (const f of want) { const one = IMG.formOf(bs[k], f); if (one && one.f) return one.f; }
  return null;
}
function casualArt(data, name) {
  const entry = data.img[name]; if (!entry) return null;
  const bs = IMG.styleMap(entry);
  for (const k of Object.keys(bs)) { const c = bs[k].casual, f = c && (Array.isArray(c) ? c : c.f); if (f && f.length) return f[0]; }
  return null;
}
function Thumb({ file, cls }) {
  if (!file) return html`<span class=${'ph ' + (cls || '')}></span>`;
  return html`<img src=${IMG.thumbURL(file)} alt="" loading="lazy" class=${cls}
    onError=${e => { const t = e.currentTarget; if (t.dataset.f) { t.replaceWith(Object.assign(document.createElement('span'), { className: 'ph' })); return; } t.dataset.f = '1'; t.src = IMG.imgURL(file); }} />`;
}
const typeName = (data, t) => data.group.name[t] || t, typeColor = (data, t) => data.group.color[t] || '#888';
function TypeChips({ data, types }) { return html`<span class="gw-types">${types.map(t => html`<i key=${t} class="gw-type" style=${'--tc:' + typeColor(data, t)}>${typeName(data, t)}</i>`)}</span>`; }
const p3 = c => [c.power.light, c.power.heavy, c.power.mobility].join('·');
const wxName = (data, lane) => W('gwent.weather.' + G.weatherOf(data, lane));
/* 카드 한 칸 — 경장 초상 + 힘 셋 + 타입. 날씨판 id 면 일상컷 + 날씨판 표시 */
function Card({ data, id, art, onClick, cls, attrs, children }) {
  const c = G.cardOf(data, id); if (!c) return null;
  const file = art !== undefined ? art : c.weather ? casualArt(data, c.name) : formArt(data, c.name, 'light');
  return html`<button type="button" class=${'cell ' + (cls || '')} data-id=${id} onClick=${onClick} ...${attrs || {}}>
    <span class="face"><${Thumb} file=${file} />
      ${c.weather ? html`<span class="gw-wtag">${W('gwent.weather.tag')}</span>` : html`<span class=${'gw-pw3' + (c.rare ? ' rare' : '')}>${p3(c)}</span>`}
      ${children}</span>
    <span class="cap"><span class="cnm">${c.name}</span><${TypeChips} data=${data} types=${c.types} />
      ${c.rare && html`<span class="gw-tag">${W('lane.rare')}</span>`}</span>
  </button>`;
}
/* 상세 — 폼 셋 그림과 그 줄의 힘. unit 은 판 위 카드(피해·개방). actions 단추가 붙는다 */
function Detail({ data, id, unit, lane, actions, onClose }) {
  const c = G.cardOf(data, id), base = G.cardsOf(data).cards[G.baseName(id)], raw = data.cards.find(x => x.name === base.name) || {};
  const line = C.lineOf(data, base.name);
  return html`<div class="gw-detail" data-id=${id} role="dialog" aria-label=${base.name}>
    <h4>${base.name}${base.rare ? html`<span class="gw-tag">${W('lane.rare')}</span>` : ''}${c && c.weather ? html`<span class="gw-tag">${W('gwent.weather.tag')}</span>` : ''}</h4>
    ${c && c.weather ? html`<div class="face" style="max-width:160px;border-radius:10px;overflow:hidden"><${Thumb} file=${casualArt(data, base.name)} /></div><p class="note">${W('gwent.weather.note')}</p>`
    : html`<div class="gw-forms">${C.FORMS.map((f, i) => html`<span key=${f} class=${'gw-form' + (lane === i ? ' on' : '')} data-form=${f}>
      <span class="face"><${Thumb} file=${formArt(data, base.name, f, !!(unit && unit.open && lane === i))} /></span><b>${W('form.' + f)}</b><span class="gw-fp">${base.power[f]}</span><small>${W('gwent.form.' + f + '.text')}</small></span>`)}</div>`}
    <dl>
      <dt>${W('lane.power')}</dt><dd>${W('gwent.power3', base.power)} <${TypeChips} data=${data} types=${base.types} /></dd>
      ${line.names.length > 1 && html`<dt>${W('lane.line')}</dt><dd>${line.names.join(' → ')}</dd>`}
      ${base.rare && html`<dt>${W('gwent.hero')}</dt>`}
      ${unit && unit.dmg ? html`<dt>${W('gwent.unit.dmg', { n: unit.dmg })}</dt>` : ''}
      ${unit && unit.open ? html`<dt>${W('gwent.unit.open', { n: unit.open })}</dt>` : ''}
    </dl>
    ${raw.text && html`<p class="lore">${raw.text}</p>`}
    <div class="gw-detail-act">
      ${(actions || []).map(a => html`<button type="button" key=${a.id} id=${a.id} class=${'gw-btn ' + (a.cls || 'primary')} disabled=${a.disabled} onClick=${a.onClick}>${a.label}</button>`)}
      <button type="button" class="gw-btn" id="gw-close" onClick=${onClose}>${W('lane.close')}</button>
    </div>
  </div>`;
}

/* ── 첫 고르기 ── */
function Pick({ data, onPick }) {
  const [gen, setGen] = useState(null);
  return html`<section class="gw-screen gw-pick" data-screen="pick">
    <p class="sec">${W('gwent.pick.title')}</p><p class="note">${W('gwent.pick.note')}</p>
    <div class="gw-gens" role="group" aria-label=${W('gwent.pick.title')}>${data.lane.champions.map(ch => { const can = C.canPickGen(data, ch.gen); return html`<button key=${ch.gen} type="button"
      class=${'gw-gen' + (gen === ch.gen ? ' on' : '')} data-gen=${ch.gen} aria-pressed=${gen === ch.gen} disabled=${!can.ok} onClick=${() => setGen(ch.gen)}>
      ${W('lane.gen', { n: ch.gen })}${can.ok ? html`<small>${can.n}</small>` : html`<span class="gw-need">${W('lane.locked', { n: can.need })}</span>`}</button>`; })}</div>
    <button type="button" class="gw-btn primary" id="gw-pick-go" disabled=${gen === null} onClick=${() => onPick(gen)}>${W('gwent.pick.go')}</button>
  </section>`;
}
/* ── 로비 ── */
function Lobby({ data, profile, act, setScreen, onChallenge, panel }) {
  const v = G.validateDeck(data, profile), pool = C.pool(data).length;
  return html`<section class="gw-screen gw-lobby" data-screen="lobby">
    <div class="gw-head">
      <span>${W('lane.lobby.main')} <b class="gw-main">${W('lane.gen', { n: profile.main })}</b></span>
      <span class="gw-deck" data-ok=${v.ok ? 'true' : 'false'}><b>${W('gwent.lobby.deck', { n: v.n, max: C.DECK })}</b> ${W(v.ok ? 'lane.lobby.deck.ok' : 'lane.lobby.deck.bad')}</span>
      <span class="gw-coll">${W('lane.lobby.collection', { n: profile.owned.length, pool, all: data.cards.length })}</span>
      <span class="gw-gold">${W('lane.gold', { n: profile.gold || 0 })}</span>
    </div>
    <div class="gw-tools">
      <button type="button" class="gw-btn" id="gw-build" onClick=${() => setScreen('build')}>${W('gwent.lobby.build')}</button>
      <button type="button" class="gw-btn" id="gw-stats" onClick=${() => setScreen('stats')}>${W('lane.lobby.stats')}</button>
      <button type="button" class="gw-btn" id="gw-shop" onClick=${() => setScreen('shop')}>${W('lane.lobby.shop')}</button>
      <button type="button" class="gw-btn" id="gw-learn" onClick=${() => setScreen('learn')}>${W('lane.learn')}</button>
    </div>
    ${panel}
    <p class="sec">${W('lane.lobby.level')}<span class="help">${W('gwent.lv.note')}</span></p>
    <div class="gw-lv" role="group" aria-label=${W('lane.lobby.level')}>${C.LEVELS.map(l => html`<button key=${l} type="button" data-lv=${l}
      class=${profile.level === l ? 'on' : ''} aria-pressed=${profile.level === l} onClick=${() => act(p => { p.level = l; })}>${W('lane.lv.' + l)}</button>`)}</div>
    ${C.conquered(data, profile) && html`<div class="gw-conquered">${W('lane.lobby.conquered')}</div>`}
    <p class="sec">${W('lane.lobby.champions')}<span class="help">${W('gwent.lobby.champions.note')}</span></p>
    <div class="gw-champions">${data.lane.champions.map(ch => { const ready = G.championReady(data, ch.gen), portrait = G.championPortrait(data, ch.gen); return html`<button key=${ch.gen} type="button" class="gw-champion" data-gen=${ch.gen}
      disabled=${!v.ok || !ready.ok} onClick=${() => onChallenge(ch.gen)}>
      <span class="face"><${Thumb} file=${portrait && formArt(data, portrait, 'light')} /></span>
      <span><b>${W('lane.champion', { n: ch.gen })}</b><small>${W('lane.gen', { n: ch.ally })}</small>
        ${ready.ok ? html`<small>${W('lane.champion.wins', { n: C.winsOf(profile, ch.gen) })} · ${W('lane.champion.go')}</small>` : html`<span class="gw-need">${W('lane.locked', { n: ready.need })}</span>`}</span></button>`; })}</div>
    ${!v.ok && html`<p class="note">${W('lane.need.deck')}</p>`}
  </section>`;
}
/* ── 덱 짜기 — 기본판 넣기/빼기와 날씨판 넣기/빼기 ── */
function Build({ data, profile, act, setScreen }) {
  const D = G.cardsOf(data), v = G.validateDeck(data, profile), deck = C.deckOf(profile, 'gwent');
  const [view, setView] = useState('all'), [genf, setGenf] = useState('all'), [detail, setDetail] = useState(null);
  const ids = useMemo(() => profile.owned.filter(x => D.cards[x] && C.inPool(data, x)).sort((a, b) => D.cards[a].no - D.cards[b].no), [profile.owned]);
  const inDeck = id => deck.includes(id), wid = id => id + G.WSUF;
  const shown = ids.filter(id => { const c = D.cards[id];
    return (view === 'all' || (view === 'in') === (inDeck(id) || inDeck(wid(id)))) && (genf === 'all' || (genf === 'main') === (c.gen === profile.main)); });
  const rule = (key, text) => html`<span data-rule=${key} class=${v.problems.includes(key) ? 'bad' : ''}>${text}</span>`;
  const chips = (label, attr, cur, set, list) => html`<div class="gw-chips" role="group" aria-label=${label}><i>${label}</i>${list.map(([k, text]) => html`<button key=${k} type="button" ...${{ [attr]: k }} class=${cur === k ? 'on' : ''} aria-pressed=${cur === k} onClick=${() => set(k)}>${text}</button>`)}</div>`;
  const toggle = id => act(p => G.toggleDeck(data, p, id));
  const why = k => W(k === 'weather' ? 'gwent.why.weather' : 'lane.why.' + k);
  return html`<section class="gw-screen gw-build" data-screen="build">
    <p class="sec">${W('lane.build')}<span class="help">${W('gwent.build.note')}</span></p>
    <div class="gw-main-pick" role="group" aria-label=${W('lane.lobby.main')}>${data.lane.champions.map(ch => html`<button key=${ch.gen} type="button" data-gen=${ch.gen}
      class=${profile.main === ch.gen ? 'on' : ''} aria-pressed=${profile.main === ch.gen} onClick=${() => act(p => G.setMain(p, ch.gen))}>${W('lane.gen', { n: ch.gen })}</button>`)}</div>
    <div class="gw-rule" data-ok=${v.ok ? 'true' : 'false'}>${rule('count', W('lane.build.rule.count', { n: v.n }))}${rule('main', W('lane.build.rule.main', { n: v.main }))}${rule('rare', W('lane.build.rule.rare', { n: v.rare }))}${rule('weather', W('gwent.build.rule.weather', { n: v.weather }))}</div>
    <p class="gw-why">${v.problems.map(why).join(' · ')}</p>
    <div class="gw-build-act">
      <button type="button" class="gw-btn primary" id="gw-build-done" onClick=${() => setScreen('lobby')}>${W('lane.build.done')}</button>
      <button type="button" class="gw-btn" id="gw-autofill" title=${W('gwent.build.autofill.note')} onClick=${() => act(p => G.autoFill(data, p))}>${W('lane.build.autofill')}</button>
    </div>
    ${chips(W('lane.build.view'), 'data-view', view, setView, [['all', W('lane.build.view.all')], ['in', W('lane.build.view.in')], ['out', W('lane.build.view.out')]])}
    ${chips(W('lane.build.filter.gen'), 'data-genf', genf, setGenf, [['all', W('lane.build.view.all')], ['main', W('lane.build.filter.main')], ['other', W('lane.build.filter.other')]])}
    ${shown.length ? html`<div class="grid">${shown.map(id => html`<div key=${id} class="gw-pick-cell">
      <${Card} data=${data} id=${id} cls=${inDeck(id) ? 'in' : ''} attrs=${{ 'aria-pressed': inDeck(id) }} onClick=${() => setDetail(id)} />
      <button type="button" class=${'gw-toggle' + (inDeck(id) ? ' in' : '')} data-id=${id} onClick=${() => toggle(id)}>${W(inDeck(id) ? 'lane.build.remove' : 'lane.build.add')}</button>
      <button type="button" class=${'gw-toggle-w' + (inDeck(wid(id)) ? ' in' : '')} data-id=${id} disabled=${!D.cards[id].casual} title=${D.cards[id].casual ? '' : W('gwent.build.weather.none')} onClick=${() => toggle(wid(id))}>${W(inDeck(wid(id)) ? 'gwent.build.weather.remove' : 'gwent.build.weather.add')}</button></div>`)}</div>`
      : html`<p class="gw-empty">${W('ui.empty')}</p>`}
    ${detail && html`<${Detail} data=${data} id=${detail} onClose=${() => setDetail(null)}
      actions=${[{ id: 'gw-detail-act', label: W(inDeck(detail) ? 'lane.build.remove' : 'lane.build.add'), cls: inDeck(detail) ? '' : 'primary', onClick: () => { toggle(detail); setDetail(null); } },
        { id: 'gw-detail-w', label: W(inDeck(wid(detail)) ? 'gwent.build.weather.remove' : 'gwent.build.weather.add'), cls: '', disabled: !D.cards[detail].casual, onClick: () => { toggle(wid(detail)); setDetail(null); } }]} />`}
  </section>`;
}
/* ── 규칙 한눈에 · 첫 판 길잡이 ── */
function Rules({ onClose, onGuideAgain }) {
  return html`<section class="gw-rules" role="dialog" aria-label=${W('gwent.rules.title')}>
    <div class="gw-rules-head"><h3>${W('gwent.rules.title')}</h3><button type="button" class="gw-btn" id="gw-rules-close" onClick=${onClose}>${W('lane.close')}</button></div>
    <div class="gw-rules-grid">${[1, 2, 3, 4].map(i => html`<div key=${i} class="gw-rule-card"><b>${W('gwent.rules.' + i + '.title')}</b><p>${W('gwent.rules.' + i + '.text')}</p></div>`)}</div>
    ${onGuideAgain && html`<div class="gw-build-act"><button type="button" class="gw-btn" id="gw-guide-again" onClick=${onGuideAgain}>${W('lane.guide.again')}</button></div>`}
  </section>`;
}
const GUIDE_STEPS = 6;
function guideStep(st) {
  const mine = st.log.filter(e => e.who === 'me'), theirs = st.log.filter(e => e.who === 'foe' && e.t !== 'pass');
  if (!mine.some(e => e.t === 'play')) return 1;
  if (!theirs.length) return 2;
  if (mine.filter(e => e.t === 'play').length < 2 && st.round < 2) return 3;
  if (!st.roundLog.length) return 4;
  if (!st.me.opened) return 5;
  return 6;
}
function Guide({ st, onSkip }) {
  const n = guideStep(st);
  return html`<div class="gw-guide" data-step=${n}><small>${W('lane.guide.step', { n, total: GUIDE_STEPS })}</small><p>${W('gwent.guide.' + n)}</p>
    <button type="button" class="gw-btn" id="gw-guide-skip" onClick=${onSkip}>${W('lane.guide.skip')}</button></div>`;
}
/* ── 멀리건 ── */
function Mulligan({ data, st, actMatch }) {
  const [swapped, setSwapped] = useState([]);
  const left = G.MULLIGAN - st.mulligans;
  return html`<section class="gw-screen gw-mull" data-screen="mulligan">
    <p class="sec">${W('lane.mull.title')}<span class="help">${W('lane.mull.note')}</span></p>
    <p class="gw-mull-left">${W('lane.mull.left', { n: left })}</p>
    <div class="grid">${st.me.hand.map((id, i) => html`<${Card} key=${i} data=${data} id=${id} cls=${swapped.includes(i) ? 'swapped' : ''}
      onClick=${() => { if (swapped.includes(i) || left <= 0) return; if (actMatch(m => G.mulligan(m, i)).ok) setSwapped(swapped.concat([i])); }} />`)}</div>
    <button type="button" class="gw-btn primary" id="gw-mull-go" onClick=${() => actMatch(m => { G.confirm(data, m); return { ok: true }; })}>${W('lane.mull.go')}</button>
  </section>`;
}
/* ── 대결 — Task 8 ── */
function Match({ data, profile, st, actMatch, act }) {
  return html`<section class="gw-screen gw-board" data-screen="match"><p class="note">${W('lane.round', { n: st.round })}</p></section>`;
}

/* 카드 뒷면 — 세대만 보인다 */
const GEN_COLORS = ['#c0392b', '#d68910', '#1e8449', '#1f618d', '#6c3483', '#117a65', '#b03a2e', '#2e4053', '#7d6608'];
function CardBack({ gen }) { return html`<span class="gw-backface" style=${'--gc:' + GEN_COLORS[(gen - 1) % 9]}>${W('lane.gen', { n: gen })}</span>`; }
/* ── 결과 — 라운드별 합, 뒷장 다섯 뒤집기 ── */
function Result({ data, st, onLobby, onAgain, onFlip }) {
  const D = G.cardsOf(data), o = st.outcome;
  const pool = (o && o.pool) || [], taken = (o && o.taken) || [], picks = o ? o.picks : 0, left = Math.max(0, picks - taken.length), done = o && left === 0;
  return html`<section class="gw-screen gw-result" data-screen="result" data-result=${o ? o.result : undefined}>
    ${o && html`<h2>${W('lane.result.' + o.result)}${o.gold ? html`<span class="gw-gold-earned">${W('lane.gold.earned', { n: o.gold })}</span>` : ''}</h2>`}
    <p class="sec">${W('lane.result.rounds')}</p>
    <ul class="gw-rounds">${st.roundLog.map((r, i) => html`<li key=${i} data-winner=${r.winner}>${W('lane.round', { n: i + 1 })} <b>${W('gwent.sum', { me: r.me, foe: r.foe })}</b> ${W('lane.round.' + (r.winner === 'me' ? 'win' : r.winner === 'foe' ? 'lose' : 'draw') + '.short', { n: i + 1 })}</li>`)}</ul>
    ${o && html`<p class="sec">${W('lane.result.reward')}<span class="help">${W('gwent.result.pool.note')}</span></p>`}
    ${o && !pool.length && html`<p class="gw-reward-none">${W(o.result === 'win' ? 'lane.result.reward.all' : 'lane.result.reward.none')}</p>`}
    ${pool.length ? html`<div class="gw-reveal">
      <p class="gw-result-left">${done ? W('lane.result.flipped') : taken.length ? W('lane.result.left', { n: left }) : W('lane.result.flip', { n: picks })}</p>
      <div class="gw-pool">${pool.map((id, i) => { const c = D.cards[id], flipped = taken.includes(i), missed = done && !flipped;
        return html`<button type="button" key=${id} class=${'gw-flipcard' + (flipped ? ' flipped' : '') + (missed ? ' missed' : '')} data-index=${i} data-rare=${c.rare ? '1' : undefined}
          disabled=${flipped || done} aria-label=${flipped || missed ? c.name : W('lane.result.flip', { n: picks })} onClick=${() => onFlip(i)}>
          <div class="gw-flipper"><${CardBack} gen=${c.gen} /><${Card} data=${data} id=${id} art=${casualArt(data, id) || formArt(data, id, 'light')} /></div></button>`; })}</div></div>` : ''}
    <div class="gw-result-act">
      <button type="button" class="gw-btn primary" id="gw-result-lobby" onClick=${onLobby}>${W('lane.result.lobby')}</button>
      <button type="button" class="gw-btn" id="gw-result-again" onClick=${onAgain}>${W('lane.result.again')}</button>
    </div>
  </section>`;
}
/* ── 전적 ── */
function Stats({ data, profile, onClose }) {
  const D = G.cardsOf(data), v = G.statsView(data, profile), L = v.line;
  const cell = e => e.games ? W('lane.stats.cell', { win: e.win, games: e.games }) : W('lane.stats.none');
  const table = (cls, title, rows, key, name) => html`<table class=${cls}><thead><tr><th colspan="2">${title}</th></tr></thead>
    <tbody>${rows.map(r => html`<tr key=${r[key]} ...${{ ['data-' + (key === 'level' ? 'lv' : 'gen')]: r[key] }}><td>${name(r)}</td><td class="win">${cell(r)}</td></tr>`)}</tbody></table>`;
  return html`<section class="gw-stats" aria-label=${W('lane.stats')}>
    <div class="gw-stats-head"><h3>${W('lane.stats')}</h3><button type="button" class="gw-btn" id="gw-stats-close" onClick=${onClose}>${W('lane.stats.close')}</button></div>
    ${!L.games ? html`<p class="gw-stats-empty">${W('lane.stats.empty')}</p>` : html`
      <p class="gw-stats-line">${W('lane.stats.line', { games: L.games, win: L.win, lose: L.lose, draw: L.draw, streak: L.streak, best: L.best })}</p>
      <div class="gw-stats-tables">
        ${table('gw-stats-boss', W('lane.stats.byBoss'), v.byBoss, 'gen', r => W('lane.champion', { n: r.gen }))}
        ${table('gw-stats-level', W('lane.stats.byLevel'), v.byLevel, 'level', r => W('lane.lv.' + r.level))}
        ${table('gw-stats-main', W('lane.stats.byMain'), v.byMain, 'gen', r => W('lane.gen', { n: r.gen }))}
      </div>
      <div class="gw-stats-nums"><span>${W('gwent.stats.best', { n: v.bestRound })}</span><span>${W('lane.stats.rounds', { n: v.avgRounds === null ? W('lane.stats.none') : v.avgRounds })}</span><span>${W('gwent.stats.weather', { n: v.weather })}</span><span>${W('gwent.stats.opens', { n: v.opens })}</span></div>
      <div class="gw-stats-cards"><p class="sec">${W('lane.stats.cards')}<span class="help">${W('lane.stats.cards.note')}</span></p>
        <div class="grid">${v.cards.filter(c => D.cards[c.id]).map(c => html`<${Card} key=${c.id} data=${data} id=${c.id}>
          <span class="gw-stat">${W('lane.stats.card', { played: c.played, rate: c.rate === null ? W('lane.stats.none') : Math.round(c.rate * 100) + '%' })}</span><//>`)}</div></div>`}
  </section>`;
}
/* ── 상점 ── */
function Shop({ data, profile, act, onClose }) {
  const D = G.cardsOf(data), stock = profile.shop.stock, gold = profile.gold || 0, closed = C.shopClosed(data, profile);
  return html`<section class="gw-shop" aria-label=${W('lane.shop')}>
    <div class="gw-shop-head"><h3>${W('lane.shop')}</h3><span class="gw-gold">${W('lane.gold', { n: gold })}</span></div>
    <p class="note help">${W('lane.shop.note')}</p>
    ${closed && html`<p class="gw-reward-none">${W('lane.shop.closed')}</p>`}
    <div class="gw-shop-grid">${stock.map((slot, i) => { const c = slot && D.cards[slot.id];
      if (!c) return html`<button key=${'e' + i} type="button" class="gw-shop-slot empty" data-index=${i} disabled>${W('lane.shop.empty')}</button>`;
      return html`<button key=${slot.id} type="button" class=${'gw-shop-slot gw-flipcard' + (slot.bought ? ' flipped' : '')} data-index=${i} data-id=${slot.id} data-rare=${slot.rare ? '1' : undefined}
        disabled=${slot.bought || gold < slot.price} aria-label=${slot.bought ? c.name : W('lane.shop.price', { n: slot.price })} onClick=${() => act(p => C.shopBuy(data, p, i))}>
        <div class="gw-flipper"><${CardBack} gen=${c.gen} /><${Card} data=${data} id=${slot.id} /></div>
        ${slot.rare && !slot.bought && html`<span class="gw-rare">${W('lane.shop.rare')}</span>`}
        <span class="gw-price">${W('lane.shop.price', { n: slot.price })}</span></button>`; })}</div>
    <div class="gw-shop-act">
      <button type="button" class="gw-btn" id="gw-shop-reroll" disabled=${gold < C.SHOP_REROLL} onClick=${() => act(p => C.shopReroll(data, p))}>${W('lane.shop.reroll', { n: C.SHOP_REROLL })}</button>
      <button type="button" class="gw-btn primary" id="gw-shop-done" onClick=${onClose}>${W('lane.shop.done')}</button>
    </div>
  </section>`;
}

function App() {
  const loaded = useData();
  const [saved] = useState(load);
  const [profile, setProfile] = useState(saved.profile), [match, setMatch] = useState(saved.match);
  const [screen, setScreen] = useState('lobby');
  const data = loaded && loaded.data;
  const cleaned = useRef(false);
  const profileRef = useRef(profile); profileRef.current = profile;   /* 상대 턴 타이머가 옛 프로필을 쥐지 않게 */
  useEffect(() => {
    if (!data || !match || match.phase !== 'play' || match.turn !== 'foe') return;
    const t = setTimeout(() => { const next = JSON.parse(JSON.stringify(match)); G.aiTurn(data, next); save(profileRef.current, next); setMatch(next); }, reduced() ? 0 : 600);
    return () => clearTimeout(t);
  }, [match, data]);
  useEffect(() => {
    if (!data || !match || match.phase !== 'done' || match.rewarded) return;
    const p = JSON.parse(JSON.stringify(profile)), m = JSON.parse(JSON.stringify(match));
    G.settle(data, p, m); p.tutorialGwent = true; save(p, m); setProfile(p); setMatch(m);
  }, [match, data]);
  if (data && !cleaned.current) {
    cleaned.current = true;
    const r = sanitise(data, profile, match);
    if (r.changed) { save(r.profile, r.match); setProfile(r.profile); setMatch(r.match); }
  }
  if (!loaded) return html`<${Shell}><section class="gw-screen"><p class="note">${W('ui.loading')}</p></section><//>`;
  if (loaded.error) return html`<${Shell}><section class="gw-screen"><p class="note">${W('ui.error', { message: loaded.error })}</p></section><//>`;
  const actMatch = fn => { const next = JSON.parse(JSON.stringify(match)); const r = fn(next) || { ok: true }; if (r.ok !== false) { save(profile, next); setMatch(next); } return r; };
  const act = fn => { const next = JSON.parse(JSON.stringify(profile)); fn(next); save(next, match); setProfile(next); };
  /* 첫 고르기 — 진화 결투와 같은 프로필을 만들고 폼 결투 덱은 가진 카드 그대로 */
  const onPick = gen => { const p = C.newProfile(data, gen, seed()); C.setDeck(p, 'gwent', p.owned.slice()); save(p, null); setProfile(p); };
  const onChallenge = gen => { const m = G.newMatch(data, profile, gen, profile.level, seed()); save(profile, m); setMatch(m); };
  const onFlip = i => { const p = JSON.parse(JSON.stringify(profile)), m = JSON.parse(JSON.stringify(match)); if (!G.pickReward(data, p, m, i).ok) return; save(p, m); setProfile(p); setMatch(m); };
  const finish = () => { const p = JSON.parse(JSON.stringify(profile)), m = JSON.parse(JSON.stringify(match)); G.finishRewards(data, p, m); return p; };
  const onLobby = () => { const p = finish(); save(p, null); setProfile(p); setMatch(null); setScreen('lobby'); };
  const onAgain = () => { const p = finish(); const m = G.newMatch(data, p, match.champion, match.level, seed()); save(p, m); setProfile(p); setMatch(m); };
  const panel = screen === 'stats' ? html`<${Stats} data=${data} profile=${profile} onClose=${() => setScreen('lobby')} />`
    : screen === 'shop' ? html`<${Shop} data=${data} profile=${profile} act=${act} onClose=${() => setScreen('lobby')} />`
    : screen === 'learn' ? html`<${Rules} onClose=${() => setScreen('lobby')} onGuideAgain=${() => { act(p => { p.tutorialGwent = false; }); setScreen('lobby'); }} />` : null;
  /* 진화 결투에서 만든 프로필이면 폼 결투 덱이 비어 있다 — 가진 카드로 채운다 */
  if (profile && !C.deckOf(profile, 'gwent').length && profile.owned.length) { const p = JSON.parse(JSON.stringify(profile)); G.autoFill(data, p); save(p, match); setProfile(p); }
  const which = !profile ? 'pick' : match && match.phase === 'mulligan' ? 'mulligan' : match && match.phase === 'play' ? 'match' : match ? 'result' : screen;
  return html`<${Shell}>
    ${which === 'pick' ? html`<${Pick} data=${data} onPick=${onPick} />`
    : which === 'mulligan' ? html`<${Mulligan} data=${data} st=${match} actMatch=${actMatch} />`
    : which === 'match' ? html`<${Match} data=${data} profile=${profile} st=${match} actMatch=${actMatch} act=${act} />`
    : which === 'result' ? html`<${Result} data=${data} st=${match} onLobby=${onLobby} onAgain=${onAgain} onFlip=${onFlip} />`
    : which === 'build' ? html`<${Build} data=${data} profile=${profile} act=${act} setScreen=${setScreen} />`
    : html`<${Lobby} data=${data} profile=${profile} act=${act} setScreen=${setScreen} onChallenge=${onChallenge} panel=${panel} />`}
  <//>`;
}
render(html`<${App} />`, document.getElementById('app'));
window.AtelierFresh.watch();
</script>
</body>
</html>
```

  CSS 복사 때 `--row-h` 변수와 `.lane-page .collection-scroll:has(.ln-dock)` 는 `.gwent-page … .gw-dock` 로. 길잡이 플래그는 **`profile.tutorialGwent`**(진화 결투의 `tutorial` 과 따로).

- [ ] **Step 4: Run** `tests/gwent-screen.cjs` → Expected: PASS 줄. 덱 안 보기(`[data-view="in"]`) 수가 25 가 아니면 `shown` 의 식을 본다(날씨판만 든 카드도 덱 안). 날씨 넷 검사가 안 맞으면 `.gw-toggle-w` 가 `disabled` 인지(검사용 img 는 전부 일상컷이 있다).

- [ ] **Step 5: Run** `words.cjs`, `header-layout.cjs`, `theme-screen.cjs` → Expected: 셋 다 PASS (탭 글자 잘림이 나면 `lib/words.js` 의 `nav.gwent` 를 `'폼결투'` 로 하고 ledger 에 Ruling).

- [ ] **Step 6: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — 화면 뼈대

- gwent.html — 고르기·로비·덱 짜기(날씨판 넣기/빼기)·상세(폼 셋과 힘)·규칙·멀리건·결과·전적·상점. 대결 판은 다음 칸. 같은 저장(pkm_duel_v1)의 decks.gwent·matches.gwent
- tests/gwent-screen.cjs — 덮개 흐름 검사 1(고르기 → 로비 → 덱 짜기 → 배우기 → 멀리건)
```

```bash
git add gwent.html tests/gwent-screen.cjs docs/PATCH.md && git commit -m "폼 결투 — 화면 뼈대"
```

---
### Task 8: `gwent.html` — 대결 판(줄·내기·날씨·개방·패스·연출) + 덮개 검사 2(대결·결과·전적·상점·새로고침·옛 저장)

**Files:**
- Modify: `gwent.html` (`Match` 를 채운다 + `Unit`·`Row`), `tests/gwent-screen.cjs`, `docs/PATCH.md`

**Interfaces:**
- Produces: `.gw-board`, `.gw-row[data-side=me|foe][data-lane=0|1|2]`(`.weathered`), `.gw-row-head .gw-sum`, `.gw-unit[data-id][data-side][data-lane][data-i][data-form]`(`.hurt`·`.bond`·`.open`), `.gw-target[data-kind=play|open][data-lane][data-i?]`, `.gw-mode`·`#gw-cancel`, `.gw-bar .gw-sumline b[data-side]`, `.gw-turn[data-turn]`, `.gw-last-round`, `.gw-dock` 안 `#gw-help`·`#gw-open`·`#gw-pass`, `.gw-hand .cell[data-id]`, 상세 단추 `#gw-play`·`#gw-open-this`.

- [ ] **Step 1: Write the failing test** — `tests/gwent-screen.cjs` 의 멀리건 묶음 끝(`await b.close();` 뒤, `console.log` 앞)에:

```js
    /* ── 대결 — 내기(줄 고르기·힘 미리보기) → 결속 → 날씨 → 개방 → 패스 → 라운드 결과 ── */
    const c1 = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: pr, matches: { gwent: (() => { const x = JSON.parse(JSON.stringify(m)); return x; })() } })] }), q2 = c1.page;
    await q2.locator('#gw-mull-go').tap(); await q2.waitForSelector('.gw-screen[data-screen="match"]');
    assert.equal(await q2.locator('.gw-row[data-side="me"]').count(), 3, '내 줄 셋');
    assert.equal(await q2.locator('.gw-row[data-side="foe"]').count(), 3, '상대 줄 셋');
    await myTurn(q2); await noOverflow(q2);
    for (const id of ['gw-pass', 'gw-open', 'gw-help']) assert.equal(await q2.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && (e.id === id || (e.closest('button') || {}).id === id) ? id : (e && (e.className || e.tagName)); }, id), id, id + ' 가 가려지지 않았다');
    /* 내기 — 손패 → 상세 → 내기 → 세 줄에 힘이 뜬다 → 고기동 */
    await q2.locator('.gw-hand .cell[data-id="피카츄"]').tap(); await q2.waitForSelector('.gw-detail');
    assert.equal(await q2.locator('.gw-detail .gw-form').count(), 3, '상세에 폼 셋');
    await q2.locator('#gw-play').tap(); await q2.waitForSelector('.gw-mode');
    assert.equal(await q2.locator('.gw-target[data-kind="play"]').count(), 3, '세 줄이 빛난다');
    assert.equal(await q2.locator('.gw-target[data-kind="play"][data-lane="2"]').textContent(), '9', '고기동 줄엔 피카츄 9');
    assert.equal(await q2.locator('.gw-target[data-kind="play"][data-lane="0"]').textContent(), '5', '경장 줄엔 5');
    await tappable(q2, '.gw-target');
    await q2.locator('.gw-target[data-kind="play"][data-lane="2"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="2"] .gw-unit[data-id="피카츄"]');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit .gw-pw').textContent(), '9', '놓인 힘 9');
    assert.equal(await q2.locator('.gw-hand .cell').count(), 9, '손패가 줄었다');
    assert.equal(await q2.locator('.gw-mode').count(), 0, '고르기 모드가 닫혔다');
    await myTurn(q2);
    assert(/9/.test(await q2.locator('.gw-bar .gw-sumline b[data-side="me"]').textContent()), '막대에 내 합');
    /* 결속 — 이상해씨·이상해풀을 중장 줄에 */
    await q2.locator('.gw-hand .cell[data-id="이상해씨"]').tap(); await q2.locator('#gw-play').tap(); await q2.locator('.gw-target[data-kind="play"][data-lane="1"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="1"] .gw-unit[data-id="이상해씨"]'); await myTurn(q2);
    await q2.locator('.gw-hand .cell[data-id="이상해풀"]').tap(); await q2.locator('#gw-play').tap(); await q2.locator('.gw-target[data-kind="play"][data-lane="1"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="1"] .gw-unit[data-id="이상해풀"]');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="1"] .gw-unit.bond').count(), 2, '둘 다 결속 표시');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="1"] .gw-sum').textContent(), String(2 * (G.cardOf(dataN, '이상해씨').power.heavy + G.cardOf(dataN, '이상해풀').power.heavy)), '줄 합이 두 배');
    await myTurn(q2);
    /* 날씨판 — 세 줄에 날씨 이름이 뜬다, 고른 줄이 흐려진다 */
    await q2.locator('.gw-hand .cell[data-id="파이리|w"]').tap(); await q2.waitForSelector('.gw-detail');
    await q2.locator('#gw-play').tap(); await q2.waitForSelector('.gw-mode');
    assert(/비/.test(await q2.locator('.gw-target[data-kind="play"][data-lane="2"]').textContent()), '고기동 줄엔 비');
    await q2.locator('#gw-cancel').tap(); assert.equal(await q2.locator('.gw-mode').count(), 0, '취소');
    await q2.locator('.gw-hand .cell[data-id="파이리|w"]').tap(); await q2.locator('#gw-play').tap(); await q2.locator('.gw-target[data-kind="play"][data-lane="0"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="0"].weathered');
    assert(await q2.locator('.gw-row[data-side="foe"][data-lane="0"].weathered').count() === 1, '상대 경장 줄도 흐려진다');
    await myTurn(q2);
    /* 개방 — 손패 칸의 개방 → 내 비영웅 카드마다 표적 → 피카츄 */
    await q2.locator('#gw-open').tap(); await q2.waitForSelector('.gw-mode');
    assert.equal(await q2.locator('.gw-target[data-kind="open"]').count(), 3, '열 수 있는 카드 셋(피카츄·이상해씨·이상해풀)');
    await q2.locator('.gw-target[data-kind="open"][data-lane="2"][data-i="0"]').tap();
    await q2.waitForSelector('.gw-row[data-side="me"][data-lane="2"] .gw-unit.open');
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit .gw-pw').textContent(), '14', '9 + 5');
    assert(await q2.locator('#gw-open').isDisabled(), '개방은 한 번');
    await myTurn(q2);
    assert.equal(await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit .gw-pw').textContent(), '13', '내 차례가 오면 −1');
    /* 판 위 카드 상세 */
    await q2.locator('.gw-row[data-side="me"][data-lane="2"] .gw-unit').tap(); await q2.waitForSelector('.gw-detail');
    assert(await q2.locator('#gw-open-this').isDisabled(), '이미 열었으니 상세의 개방은 꺼짐');
    await q2.locator('#gw-close').tap(); await q2.waitForSelector('.gw-detail', { state: 'detached' });
    /* 패스 → 라운드 결과 */
    await q2.locator('#gw-pass').tap();
    await q2.waitForSelector('.gw-last-round', { timeout: 20000 });
    const savedM = JSON.parse(await q2.evaluate(k => localStorage.getItem(k), KEY)).matches.gwent;
    assert(savedM.roundLog.length >= 1 && savedM.log.some(e => e.t === 'weather') && savedM.log.some(e => e.t === 'open'), '매 수 저장 — 날씨·개방이 기록에');
    await tappable(q2, '#gw-pass, #gw-open, .gw-hand .cell, .gw-unit'); await noOverflow(q2);
    assert.deepEqual(c1.errors, [], '대결 화면 오류 없음');
    await c1.close();
    /* ── 결과·보상 — 이기기 직전: 2라운드, 상대 목숨 하나, 상대 손 없음 ── */
    const pr2 = C.newProfile(dataN, 1, 8); C.setDeck(pr2, 'gwent', pr2.owned.slice()); const m2 = G.newMatch(dataN, pr2, 2, 'rookie', 8); G.confirm(dataN, m2);
    Object.assign(m2, { round: 2, turn: 'me', first: 'me', coin: 'me', bonus: { me: 0, foe: 0 }, passed: { me: false, foe: false }, lives: { me: 2, foe: 1 }, roundLog: [{ me: 0, foe: 12, winner: 'foe' }], weather: [null, null, null] });
    m2.me.hand = ['뮤츠']; m2.me.deck = []; m2.foe.hand = []; m2.foe.deck = []; m2.me.rows = [[], [], []]; m2.foe.rows = [[], [], []];
    const c2 = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: pr2, matches: { gwent: m2 } })] }), r = c2.page;
    await r.waitForSelector('.gw-screen[data-screen="match"]');
    await r.reload(); await r.waitForSelector('.gw-screen[data-screen="match"]');
    assert.equal(await r.locator('.gw-hand .cell').count(), 1, '새로고침해도 손패 그대로');
    await myTurn(r);
    await r.locator('.gw-hand .cell[data-id="뮤츠"]').tap(); await r.locator('#gw-play').tap(); await r.locator('.gw-target[data-kind="play"][data-lane="0"]').tap();
    await r.waitForSelector('.gw-result[data-result]', { timeout: 15000 });   /* 손이 비어 자동 패스 → 상대도 빈 손 → 끝 */
    assert.equal(await r.locator('.gw-result').getAttribute('data-result'), 'win', '승리');
    assert(/10/.test(await r.locator('.gw-gold-earned').textContent()), '신참 +10금');
    assert.equal(await r.locator('.gw-rounds li').count(), 2, '라운드 둘');
    assert.equal(await r.locator('.gw-flipcard').count(), 5, '뒷장 다섯');
    await tappable(r, '.gw-flipcard, #gw-result-lobby, #gw-result-again');
    await r.locator('.gw-flipcard[data-index="1"]').tap(); await r.waitForSelector('.gw-flipcard[data-index="1"].flipped');
    await r.reload(); await r.waitForSelector('.gw-screen[data-screen="result"]');
    assert.equal(await r.locator('.gw-flipcard.flipped').count(), 1, '새로고침해도 뒤집은 채');
    await r.locator('.gw-flipcard[data-index="0"]').tap(); await r.locator('.gw-flipcard[data-index="4"]').tap();
    await r.waitForSelector('.gw-flipcard.missed');
    assert(await r.locator('.gw-flipcard.flipped').count() === 3 && await r.locator('.gw-flipcard.missed').count() === 2, '셋 뒤집으면 끝, 나머지는 놓친 카드');
    const after = JSON.parse(await r.evaluate(k => localStorage.getItem(k), KEY));
    assert(after.profile.owned.length === 28 && after.profile.gold === 10 && after.profile.beaten[2].rookie === 1 && after.profile.stats.gwent.games === 1 && after.profile.stats.gwent.win === 1 && after.profile.stats.lane.games === 0, '컬렉션 +3 · 금 · 이긴 횟수 · 폼 결투 통계만');
    assert(after.matches.gwent && after.matches.gwent.rewarded, '정산은 한 번');
    await r.locator('#gw-result-lobby').tap(); await r.waitForSelector('.gw-screen[data-screen="lobby"]');
    assert.equal(JSON.parse(await r.evaluate(k => localStorage.getItem(k), KEY)).matches.gwent, null, '판을 비웠다');
    assert(/1승/.test(await r.locator('.gw-champion[data-gen="2"]').textContent()), '챔피언 카드에 1승');
    await r.locator('#gw-stats').tap(); await r.waitForSelector('.gw-stats');
    assert(await r.locator('.gw-stats-boss tr[data-gen="2"] td.win').textContent() === '1 / 1' && /13/.test(await r.locator('.gw-stats-nums').textContent()), '전적에 이 판 — 최고 합 13(뮤츠)');
    assert.equal(await r.locator('.gw-stats-cards .cell').count(), 1, '카드별 — 뮤츠');
    await r.locator('#gw-stats-close').tap(); await r.waitForSelector('.gw-stats', { state: 'detached' });
    await r.locator('#gw-shop').tap(); await r.waitForSelector('.gw-shop');
    assert.equal(await r.locator('.gw-shop-slot').count(), 6, '진열 여섯');
    assert(await r.locator('#gw-shop-reroll').isEnabled(), '10금이면 새로 깔 수 있다');
    await r.locator('#gw-shop-done').tap(); await r.waitForSelector('.gw-shop', { state: 'detached' });
    await tappable(r, '.gw-tools .gw-btn'); await noOverflow(r);
    assert.deepEqual(c2.errors, [], '결과·로비 오류 없음');
    await c2.close();
    /* ── 옛 저장 — 진화 결투에서 만든 프로필(decks.gwent 없음) · 풀 밖 카드 · 일상컷 없는 날씨판 ── */
    const oldOwned = card.filter(c => c.gen === 1 && !c.rare).slice(0, 26).map(c => c.name), gone = card.find(c => c.gen === 4 && !c.rare).name;
    const d = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: { main: 1, owned: oldOwned.concat(['없는카드', gone]), decks: { lane: oldOwned.slice(0, 25) } } })] }), o = d.page;
    await o.waitForSelector('.gw-screen[data-screen="lobby"]');
    const up = JSON.parse(await o.evaluate(k => localStorage.getItem(k), KEY));
    assert(up.profile.decks.gwent.length === 25 && up.profile.decks.lane.length === 25 && up.profile.owned.includes(gone) && !up.profile.owned.includes('없는카드') && (await o.locator('.gw-deck').getAttribute('data-ok')) === 'true', '폼 결투 덱이 가진 카드로 자동으로 찼다 · 진화 결투 덱은 그대로 · 컬렉션엔 풀 밖 카드가 남는다');
    assert.deepEqual(d.errors, [], '옛 저장 오류 없음');
    await d.close();
    { /* 날씨판이 든 덱에서 그 카드의 일상컷이 내려가면 덱에서만 빠진다 */
      const q3 = C.newProfile(dataN, 1, 9); C.setDeck(q3, 'gwent', q3.owned.slice(0, 24).concat([gone + '|w']));
      const e = await openGwent(h, { store: [KEY, JSON.stringify({ v: 1, profile: q3, matches: {} })] }), s = e.page;
      await s.waitForSelector('.gw-screen[data-screen="lobby"]');
      assert(/24\/25/.test(await s.locator('.gw-deck').textContent()) && (await s.locator('.gw-deck').getAttribute('data-ok')) === 'false', '풀 밖 카드의 날씨판은 덱에서 빠져 24/25: ' + await s.locator('.gw-deck').textContent());
      assert.deepEqual(e.errors, [], '오류 없음');
      await e.close(); }
```

  그리고 PASS 문구를 `'PASS 폼 결투 화면: 첫 고르기 · 로비 · 덱 짜기(날씨판) · 배우기 · 멀리건 · 대결 · 결과·보상 · 전적 · 상점 · 새로고침 · 옛 저장'` 로.

- [ ] **Step 2: Run** → Expected: FAIL at `'내 줄 셋'`(0).

- [ ] **Step 3: Implement** — `gwent.html` 의 자리표 `Match` 를 아래 셋으로 바꾼다:

```js
/* ── 판 위 카드 하나 — 그 줄 폼의 초상(개방이면 개방 그림), 현재 힘. 피해 빨강·결속 금빛·개방 테두리 ── */
function Unit({ data, st, side, lane, i, fx, onClick, target, onTarget }) {
  const u = st[side].rows[lane][i], c = G.cardsOf(data).cards[u.name], v = G.unitValue(data, st, side, lane, i);
  const cls = 'gw-unit' + (c.rare ? ' rare' : '') + (u.dmg ? ' hurt' : '') + (v.bond ? ' bond' : '') + (u.open ? ' open' : '') + (fx ? ' ' + fx : '');
  if (target) return html`<button type="button" class="gw-target" data-kind="open" data-lane=${lane} data-i=${i} onClick=${() => onTarget(lane, i)}>${W('gwent.open')}</button>`;
  return html`<button type="button" class=${cls} data-id=${u.id} data-side=${side} data-lane=${lane} data-i=${i} data-form=${C.FORMS[lane]} onClick=${onClick}>
    <${Thumb} file=${formArt(data, u.name, C.FORMS[lane], u.open > 0)} /><span class=${'gw-pw' + (c.rare ? ' rare' : '')}>${v.weather ? 1 : G.cur(u)}</span>
  </button>`;
}
/* ── 줄 하나 — 머리(폼·날씨·합) + 카드 띠. mode 면 누를 자리가 빛난다 ── */
function Row({ data, st, side, lane, mode, onTarget, onDetail, fxOf, won }) {
  const s = G.sums(data, st), wx = st.weather[lane], units = st[side].rows[lane];
  const mine = side === 'me' && st.turn === 'me' && mode;
  const playLabel = () => { const c = G.cardOf(data, mode.id); return c.weather ? wxName(data, lane) : String(c.power[C.FORMS[lane]]); };
  return html`<div class=${'gw-row' + (wx ? ' weathered' : '') + (won ? ' won-' + won : '')} data-side=${side} data-lane=${lane}>
    <div class="gw-row-head"><span>${W('form.' + C.FORMS[lane])}</span><b class="gw-sum">${s.rows[side][lane]}</b>${wx && html`<span class="gw-wx">${W('gwent.weather.' + wx)}</span>`}</div>
    <div class="gw-units">${units.length ? units.map((u, i) => html`<${Unit} key=${u.id + i} data=${data} st=${st} side=${side} lane=${lane} i=${i} fx=${fxOf(side, lane, i)} onClick=${() => onDetail(side, lane, i)}
      target=${mine && mode.kind === 'open' && !G.cardsOf(data).cards[u.name].rare} onTarget=${(l, i) => onTarget('open', l, i)} />`) : html`<span class="gw-row-empty">${W('gwent.row.empty')}</span>`}</div>
    ${mine && mode.kind === 'play' && html`<button type="button" class="gw-target" data-kind="play" data-lane=${lane} onClick=${() => onTarget('play', lane)}>${playLabel()}</button>`}
  </div>`;
}
/* ── 대결 ── */
function Match({ data, profile, st, actMatch, act }) {
  const D = G.cardsOf(data), portrait = G.championPortrait(data, st.champion);
  const s = G.sums(data, st), L = G.legal(data, st, 'me'), mine = st.turn === 'me' && st.phase === 'play';
  const [detail, setDetail] = useState(null);   /* {id, hand:true} | {side, lane, i} */
  const [mode, setMode] = useState(null), [banner, setBanner] = useState(null), [help, setHelp] = useState(false);
  const rounds = useRef(st.roundLog.length);
  useEffect(() => { if (st.roundLog.length > rounds.current) { setMode(null); setDetail(null); if (!reduced()) { setBanner(st.roundLog.length); const t = setTimeout(() => setBanner(null), 1400); rounds.current = st.roundLog.length; return () => clearTimeout(t); } } rounds.current = st.roundLog.length; }, [st.roundLog.length]);
  /* 이번 수의 연출 — 새로 놓인 카드 flip, 맞은 카드 hit, 개방 burst */
  const fxOf = (side, lane, i) => { const l = st.last; if (!l) return null;
    if (l.kind === 'play' && l.who === side && l.lane === lane && l.i === i) return 'flip';
    if (l.kind === 'play' && l.hit && l.who !== side && l.hit.lane === lane && l.hit.i === i) return 'hit';
    if (l.kind === 'open' && l.who === side && l.lane === lane && l.i === i) return 'burst'; return null; };
  const lastRound = st.roundLog.length ? st.roundLog[st.roundLog.length - 1] : null;
  const roundText = (r, n, short) => W('gwent.round.' + (r.winner === 'me' ? 'win' : r.winner === 'foe' ? 'lose' : 'draw') + (short ? '.short' : ''), { n, me: r.me, foe: r.foe });
  const won = () => banner && lastRound ? (lastRound.winner === 'draw' ? null : lastRound.winner) : null;
  const onTarget = (kind, lane, i) => {
    const m = mode; setMode(null); setDetail(null);
    if (kind === 'play') actMatch(x => G.play(data, x, m.id, lane));
    else if (kind === 'open') actMatch(x => G.open(data, x, lane, i));
  };
  const openDetail = (side, lane, i) => setDetail({ side, lane, i });
  const unitOf = d => d && d.side ? st[d.side].rows[d.lane][d.i] : null;
  const detailId = detail ? (detail.hand ? detail.id : (unitOf(detail) || {}).id) : null;
  const detailActions = () => {
    if (!detail) return [];
    if (detail.hand) return [{ id: 'gw-play', label: W('gwent.play'), disabled: !mine || !L.play.some(x => x.id === detail.id), onClick: () => { setMode({ kind: 'play', id: detail.id }); setDetail(null); } }];
    if (detail.side === 'me') return [{ id: 'gw-open-this', label: W('gwent.open.this'), disabled: !mine || !L.open.some(x => x.lane === detail.lane && x.i === detail.i), onClick: () => { setDetail(null); actMatch(x => G.open(data, x, detail.lane, detail.i)); } }];
    return [];
  };
  const hit = st.last && st.last.kind === 'play' && st.last.hit ? st.last.hit : null;
  const rowProps = { data, st, mode, onTarget, onDetail: openDetail, fxOf };
  return html`<section class="gw-screen gw-board" data-screen="match">
    <div class="gw-foe"><span class="face"><${Thumb} file=${portrait && formArt(data, portrait, 'light')} /></span>
      <span><b>${W('lane.champion', { n: st.champion })}</b>${W('lane.lv.' + st.level)}</span>
      <span class="gw-foe-fan"><span class="gw-cards" aria-hidden="true">${st.foe.hand.map((_, i) => html`<span key=${i} class="gw-back" style=${'--gc:' + typeColor(data, (D.cards[portrait] || { types: ['normal'] }).types[0])}></span>`)}</span><span class="gw-foe-hand">${W('lane.foe.hand', { n: st.foe.hand.length })}</span></span>
      <span class="gw-foe-grave">${W('lane.foe.grave', { n: st.foe.grave.length })}</span>
      <span class="gw-foe-open" data-used=${st.foe.opened ? 'true' : 'false'}>${W(st.foe.opened ? 'lane.open.used' : 'lane.open')}</span></div>
    ${mode && html`<div class="gw-mode">${W(mode.kind === 'play' ? 'gwent.play.where' : 'gwent.open.pick')}<button type="button" class="gw-btn" id="gw-cancel" onClick=${() => setMode(null)}>${W('lane.cancel')}</button></div>`}
    <div class="gw-rows">${[2, 1, 0].map(l => html`<${Row} key=${'f' + l} ...${rowProps} side="foe" lane=${l} won=${won() === 'foe' ? 'foe' : null} />`)}</div>
    <div class="gw-bar">
      <span class="gw-sumline"><b data-side="me">${s.me}</b> : <b data-side="foe">${s.foe}</b></span>
      <span class="gw-round">${W('lane.round', { n: st.round })}</span>
      <span class="gw-lives" data-me=${st.lives.me} data-foe=${st.lives.foe}>${W('lane.lives')} ${'♥'.repeat(st.lives.me)}${'♡'.repeat(G.LIVES - st.lives.me)} : ${'♥'.repeat(st.lives.foe)}${'♡'.repeat(G.LIVES - st.lives.foe)}</span>
      ${st.bonus.me > 0 && html`<span class="gw-first">${W('gwent.first.bonus', { n: st.bonus.me })}</span>`}
      <span class="gw-turn" data-turn=${st.turn || ''}>${st.passed.me ? W('lane.passed') : W(mine ? 'lane.turn.me' : 'lane.turn.foe')}</span>
      ${hit && html`<span class="gw-hitline">${W('gwent.hit', { name: G.baseName(hit.id), n: hit.n })}</span>`}
      ${lastRound && html`<span class="gw-last-round">${roundText(lastRound, st.roundLog.length)}</span>`}
    </div>
    <div class="gw-rows">${[0, 1, 2].map(l => html`<${Row} key=${'m' + l} ...${rowProps} side="me" lane=${l} won=${won() === 'me' ? 'me' : null} />`)}</div>
    <div class="gw-dock">${!profile.tutorialGwent && html`<${Guide} st=${st} onSkip=${() => act(p => { p.tutorialGwent = true; })} />`}
      <p class="sec">${W('lane.hand', { n: st.me.hand.length })}<span class="gw-deck-pile">${W('lane.deck.left', { n: st.me.deck.length })}</span>
        <span class="gw-bar-act">
          <button type="button" class="gw-btn gw-help" id="gw-help" aria-label=${W('gwent.rules.title')} title=${W('gwent.rules.title')} onClick=${() => setHelp(true)}>?</button>
          <button type="button" class="gw-btn" id="gw-open" disabled=${!mine || st.me.opened || !L.open.length} onClick=${() => setMode({ kind: 'open' })}>${W(st.me.opened ? 'gwent.open.used' : 'gwent.open')}</button>
          <button type="button" class="gw-btn" id="gw-pass" disabled=${!L.pass} onClick=${() => { setMode(null); setDetail(null); actMatch(m => G.pass(data, m)); }}>${W('lane.pass')}</button>
        </span></p>
      <div class="gw-hand">${st.me.hand.map((id, i) => html`<${Card} key=${id + i} data=${data} id=${id} onClick=${() => setDetail({ id, hand: true })} />`)}</div></div>
    ${detail && detailId && html`<${Detail} data=${data} id=${detailId} unit=${unitOf(detail)} lane=${detail.hand ? undefined : detail.lane} actions=${detailActions()} onClose=${() => setDetail(null)} />`}
    ${help && html`<${Rules} onClose=${() => setHelp(false)} />`}
    ${banner && lastRound && html`<div class="gw-banner">${roundText(lastRound, st.roundLog.length, true)}<br />${W('gwent.sum', { me: lastRound.me, foe: lastRound.foe })}</div>`}
  </section>`;
}
```

  CSS 에 `.gw-hitline {flex-basis:100%;color:var(--signal,#c33);font-size:12px}` 를 더한다. `Row` 의 play 표적은 `.gw-units` 위를 덮는다(`position:absolute; inset:3px`) — 줄 머리까지 덮지 않도록 `left:60px` 로 둔다.

- [ ] **Step 4: Run** → Expected: PASS. 흔한 어긋남: (1) 날씨 뒤 결속 검사 차례 — 검사는 결속 → 날씨 순이라 괜찮다; (2) `'내 차례가 오면 −1'` 은 상대가 수를 둬야 내 차례가 온다 — 상대가 패스했으면 내 차례가 바로 이어져 bleed 는 그때도 돈다(엔진 endTurn) → 13; (3) 결과 화면에서 `'13'` 최고 합 — 뮤츠 경장 13; 상대가 2R 빈 손이면 0 : 13.

- [ ] **Step 5: Run** 전체: `words`, `patch`, `forms`, `lane-sim --quick`, `gwent-sim --quick`, `lane-screen`, `gwent-screen`, `header-layout`, `theme-screen`, `survey-screen`, `run-screen` → PASS (battle-screen 은 이 작업 전부터 깨진 검사 — 그대로 보고).

- [ ] **Step 6: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — 대결 판

- gwent.html — 상대 세 줄 ↑ 막대 ↓ 내 세 줄. 손패 카드를 고르면 세 줄에 그 줄의 힘(날씨판은 날씨 이름)이 떠서 줄을 짚는다. 개방은 카드마다 표적. 타격·결속·개방·날씨 표시와 연출
- tests/gwent-screen.cjs — 대결·결과·전적·상점·새로고침·옛 저장(decks.gwent 없는 프로필·풀 밖 날씨판)
```

```bash
git add gwent.html tests/gwent-screen.cjs docs/PATCH.md && git commit -m "폼 결투 — 대결 판"
```

---

### Task 9: 문서 — `docs/GWENT_GAME.md` · AGENTS · README · GAME_CONCEPT · 메모리

**Files:**
- Create: `docs/GWENT_GAME.md`
- Modify: `AGENTS.md`(문서 표·검사 목록), `README.md`, `docs/GAME_CONCEPT.md`(가리킴), `docs/PATCH.md`

- [ ] **Step 1: `docs/GWENT_GAME.md`** — `docs/LANE_GAME.md` 꼴로. 머리: 한 판(§1 일곱 줄), 카드(힘 셋·영웅·상성 타격·결속·개방·날씨판), 진행(진화 결투와 같은 컬렉션·챔피언·보상·금·상점, 날씨판은 가진 카드의 공짜 폼), AI(신참·숙련·에이스 한 줄씩), 자료(`card.json` 의 stats 여섯·element·from/to·rare·gen, `chart.json`, `img.json` 의 폼 초상·개방·일상컷, `lane.json` 챔피언, `gwent.json` overrides·weather), 저장(`pkm_duel_v1` 의 `decks.gwent`·`stats.gwent`·`matches.gwent`), 검사(두 줄). 균형 보고의 숫자(Task 5 결과)를 "굴려 본 것" 한 줄로.

- [ ] **Step 2: `AGENTS.md`** — 문서 표에 `| \`docs/GWENT_GAME.md\` | 폼 결투 — 세 줄 합·줄이 폼·상성 타격·결속·개방·날씨판·저장·검사 |` 를 LANE 줄 뒤에; 검사 목록에 `node tests/gwent-sim.cjs --quick   # 폼 결투 — 규칙·AI·보상 (--quick 없이 돌리면 균형 보고)` 와 `… node tests/gwent-screen.cjs    # 폼 결투 — 고르기·덱 짜기(날씨판)·대결·결과·전적·상점`; header-layout 주석을 `화면 여덟`.
  `README.md` 파일 목록에 `gwent.html   폼 결투 — 세 줄 합, 줄이 폼. 규칙은 docs/GWENT_GAME.md`. `docs/GAME_CONCEPT.md` 표에 `| \`docs/GWENT_GAME.md\` | 다섯째 놀이 폼 결투(궨트식). 설계 \`docs/superpowers/specs/2026-10-06-gwent-duel-design.md\` |`.

- [ ] **Step 3: Run** `node tests/patch.cjs` → PASS.

- [ ] **Step 4: PATCH 칸 + commit**

```
## 2026-10-06 · claude · 폼 결투 — 규칙 문서, 검사 목록, README

- docs/GWENT_GAME.md — 플레이어가 읽는 규칙과 자료·저장·검사
- AGENTS.md, README.md, docs/GAME_CONCEPT.md — 가리킴과 검사 목록
```

```bash
git add docs/GWENT_GAME.md AGENTS.md README.md docs/GAME_CONCEPT.md docs/PATCH.md && git commit -m "폼 결투 — 규칙 문서, 검사 목록, README"
```

- [ ] **Step 5: 메모리** — `C:\Users\jjshs\.claude\projects\C--\memory\pkm-lane-duel.md` 의 Status 에 폼 결투 구현 상태와 균형 숫자를 더한다(푸시 뒤).
