# 폼 결투 (궨트식) — 설계

> 2026-10-06 · claude. 진화 결투(`2026-10-06-lane-duel-design.md`) §11 의 둘째 놀이. 같은 컬렉션(`lib/collection.js`, `pkm_duel_v1`) 위에 선다.
> 원형은 myth-atelier 의 신기 결투(`docs/DUEL_GAME.md`) — 줄 합으로 세 라운드 중 둘. 다른 것은 줄이 폼이라는 점이다.

## 한 문장

덱 스물다섯으로 손패 열을 들고, 카드를 **경장·중장·고기동 세 줄 가운데 하나에 내려 그 줄의 폼으로 세우고**, 세 줄 힘의 합으로
세 라운드 중 둘을 따내는 1 대 1 카드 결투. 상대는 세대 챔피언 아홉. 컬렉션·보상·금·상점은 진화 결투와 같이 쓴다.

## 정해진 것 (대화에서)

- 이름 **폼 결투**. 파일은 `gwent.*`. 탭·머리 "폼 결투".
- 날씨판은 **가진 카드의 공짜 폼** — 일상컷이 있는 카드는 덱에 날씨판으로도 넣는다. 컬렉션·보상·상점은 손대지 않는다.
- 진영 능력은 **없다**. 한 판 한 번·차례를 쓰는 기술은 개방 하나.
- 카드 풀·챔피언·난이도·보상·금·상점·정복·그림 문턱은 진화 결투 것 그대로(`collection.js`).

## 1. 한 판

1. 덱 25장을 섞어 손패 **10장**. 두 장까지 덱 맨 위와 바꾼다(멀리건). **라운드 사이 보충 없음** — 열 장으로 세 라운드.
2. 판은 양쪽 세 줄 **경장·중장·고기동**. 카드는 어느 줄에든 놓고, **놓인 줄이 그 카드의 폼**이다 — 힘이 폼마다 다르다(§2).
3. 선공은 동전. 다음 라운드는 **진 쪽이 선공**, 무승부 라운드면 바꿔 가며. **1라운드 선공은 합에 FIRST_BONUS(8)를 미리 받는다**
   (신기 결투 값. 균형 보고가 40~60% 밖이면 고친다 — 구현에서 8 → 39%, 10 → 40%, 12 → 42% 로 **12**).
4. 차례에 하나 — **카드 내기 · 개방 · 패스**. 패스하면 그 라운드엔 더 못 낸다. 손패가 비면 자동 패스.
5. 둘 다 패스하면 라운드. 세 줄 합(§2 합산)이 큰 쪽이 이긴다. **동점이면 둘 다 진 것**.
6. 목숨 둘. 라운드에 지면 하나. 먼저 둘 다 잃으면 패. 같은 라운드에 둘 다 잃으면 무승부. 최대 세 라운드.
7. 라운드가 끝나면 판 위 카드는 묘지로. 피해·날씨·개방 다 사라진다.

## 2. 카드

- **힘 셋** — 경장 `round((공격+특공)/20)` · 중장 `round((방어+특방)/20)` · 고기동 `round(속도×2/20)`. **1~15 로 자른다**(단단지 중장 23 → 15).
  `data/gwent.json` 의 `overrides[이름] = {light, heavy, mobility}` 가 덮는다. 종족값 차례는 `stats = [HP, 공격, 방어, 특공, 특방, 속도]`.
- **기본 힘** = 놓인 줄의 힘. **현재 힘** = 기본 힘 + 피해(−) + 개방(+) ≥ 1. 합산 때 결속·날씨를 더 본다(아래).
- **영웅** = 전설(`rare`). 피해·날씨·결속·개방을 **받지 않는다**. 상성 타격은 한다. 결속의 수에도 안 든다.
- **상성 타격**(모든 비날씨 카드, 놓을 때 한 번): 상대 판 전체에서 **내 타입에 2배 이상인 비영웅** 가운데 현재 힘이 가장 센 것 −2, 4배면 −3.
  내 타입이 둘이면 카드마다 유리한 쪽을 쓴다(둘 다 2배면 어느 쪽이든 같다). 바닥 1. 같으면 먼저 놓인 것. 없으면 아무 일 없음.
  반감·무효는 아무 일 없음. 상성표는 `data/chart.json`, 상대 타입이 둘이면 곱한다.
- **결속**: 같은 **계통**(`collection.lineOf(data, name).root` 가 같음)의 비영웅이 같은 줄(같은 쪽)에 둘 이상이면 **각각 기본 힘만큼 더한다**.
  셋이면 셋 다. 날씨판은 계통에 안 든다. 피해를 받아도 더하는 값은 기본 힘.
- **개방**: 한 판에 한 번, 차례를 써서 **내 판 위 비영웅 하나** +5. 그 뒤 **내 차례가 시작될 때마다 −1**(개방분만 줄고 바닥은 개방 전 현재 힘).
  라운드가 끝나면 끝. 그림은 그 폼의 개방 초상(`<폼>_overdrive`).
- **날씨판**: 일상컷(`casual`)이 있는 가진 카드를 덱에 `이름|w` 로 넣는다. 힘 없음, 영웅 아님, 상성 타격 없음, 계통 없음. 세대는 그 카드 것.
  내면 **줄을 골라** 날씨를 깐다 — 경장 **싸라기눈** · 중장 **모래바람** · 고기동 **비**. 그 줄은 **양쪽** 비영웅을 합산 때 **1** 로 센다
  (결속·개방·피해 무시). 같은 줄에 날씨판을 또 내면 걷힌다(내 것이든 상대 것이든). 라운드가 끝나면 걷힌다. 날씨판 자체는 판에 안 남는다(묘지로).

### 합산

줄 합 = 줄의 카드마다: 영웅이면 기본 힘 / 날씨면 1 / 아니면 현재 힘 + (결속이면 기본 힘). 세 줄을 더한다.

### 정한 예

피카츄 `[35,55,40,50,50,90]` → 경장 5 · 중장 5 · 고기동 9. 리자몽 → 10 · 8 · 10. 잉어킹 → 1 · 4 · 8. 뮤츠(영웅) → 13 · 9 · 13.
리자몽(불·비행)을 상대 판에 이상해꽃(풀·독) 7 이 있을 때 내면 불→풀 2 × 불→독 1 = 2배 → 이상해꽃 5. 상대 판에 이상해씨와 이상해풀이 같은 줄이면
둘 다 결속 — 각각 기본 힘 두 배. 그 줄에 싸라기눈이 깔리면 둘 다 1.

## 3. 턴

`st.turn` 쪽의 한 수. 모두 `{ok, why}` 를 돌려주고 `st.last.fx` 에 연출 조각을 남긴다.

- `play(data, st, id, lane)` — 손패의 `id` 를 `lane`(0 경장·1 중장·2 고기동)에. 날씨판이면 날씨를 깐다. 상성 타격 → 결속은 합산 때.
- `open(data, st, lane, i)` — 내 `lane` 의 `i` 번째 비영웅 +5. 한 판 한 번.
- `pass(data, st)`.
- 수가 끝나면 `endTurn`: 상대가 패스 안 했으면 상대 차례, 둘 다 패스면 `endRound`. 차례가 시작될 때 그쪽의 개방 카드 −1.
- `endRound`: 합 비교 → 목숨 → `roundLog.push({me, foe, winner})` → 판 비우기(묘지) → 날씨·개방 지움 → 다음 선공 = 진 쪽(무승부면 `other(first)`)
  → 세 라운드 또는 목숨 0 이면 `phase='done'`, `winner`.

## 4. 파생

`derive(data)` → `{cards:{이름→card}, list, pool}`. card = `{name, no, gen, types[], power:{light, heavy, mobility}, line(root), rare, weather:bool(일상컷 있음)}`.
덱 id `이름|w` 는 `cardOf(data, id)` 가 `{...card, id, weather:true}` 로 푼다.

## 5. 덱

25장 · 주 세대 15 이상(날씨판도 자기 세대) · 전설 4 이하 · 날씨판 3 이하 · 같은 id 1장 · 가진 카드·풀 안의 카드만(날씨판은 일상컷도 있어야).
`validateDeck(data, profile)` → `{ok, problems:[count|main|rare|weather|dup|owned], n, main, rare, weather}`.
`profile.decks.gwent` 가 비어 있으면 `autoFill` — 주 세대 계통 묶음 먼저, 나머지 센 순. 진화 결투와 같은 `collection.setDeck(profile,'gwent',ids)`.

## 6. 진행·보상·전적

진화 결투 §6 그대로: 주 세대 고르기(17장 문턱) · 챔피언 아홉(`data/lane.json` 의 `champions` 를 **그대로 읽는다**) · 그림 문턱 · 뒷장 5장 뒤집기 ·
금 10/20/35·3 · 상점 · 정복. 모두 `collection.js`. 챔피언 덱은 자기 세대 17 + 이웃 8 — 신참 무작위 · 숙련 계통 완성된 것부터 센 순(전설 없음) ·
에이스 전설 4 + 일상컷이 있는 자기 세대 카드 날씨판 2(없으면 그만큼 보통 카드).

`stats.gwent` = `emptyStats()` 에 `bestRound`(한 라운드 최고 합) · `weather`(낸 날씨판 수) · `opens`(개방 수). `bestLanes`·`lines` 는 안 쓴다(0·빈 채).
`statsView(data, profile, 'gwent')` 는 그대로 쓰고 화면이 `bestRound`·`weather`·`opens` 를 더 읽는다 — `collection.statsView` 가 `s.bestRound`·`s.weather`·`s.opens` 를 그대로 건네도록 세 줄 더한다.

## 7. AI

`value(data, st, who, move)` = (내 합 변화) − (상대 합 변화). 카드는 세 줄 가운데 가장 큰 값으로(힘·결속·날씨·상성 타격 반영). 날씨는 그 줄 양쪽 합 차이.
개방은 `+5 − (내 남은 손패 수)`(차례마다 −1 이니 늦을수록 좋다).

- **신참**: 값이 양인 수 가운데 무작위. 패스를 모른다 — 손패가 비어야 끝.
- **숙련**: 값이 가장 큰 수. 패스는 둘 — 상대가 패스했고 내가 앞선다 / 뒤지는데 남은 손패 전부(각 줄 최대 힘의 합)로도 못 뒤집는다. 개방은 값이 양일 때만.
- **에이스**: 숙련 + 1라운드엔 영웅을 안 쓴다(목숨이 하나면 다 쓴다) + 1라운드에 앞서고 손패가 8장 이하면 접는다. 구현(2026-10-06): 개방·날씨판까지 아끼면 오히려 약해져(60판: 68% → 47%) 영웅만 아낀다.

균형 보고 `tests/gwent-sim.cjs`(`allowAll`): 선공 40~60% · 세대별 25~75% · 숙련 vs 신참 55% 이상 · 에이스 vs 숙련 55% 이상 밖이면 실패. 난이도 맞대결은 그 난이도의 **결정 + 덱**으로 잰다(플레이어가 만나는 것). 결과(2026-10-06): FIRST_BONUS=12 에서 선공 42% · 세대 36~52% · 숙련>신참 100% · 에이스>숙련 68%.

## 8. 화면 (`gwent.html`)

`lane.html` 과 같은 뼈대 — 고르기 → 로비 → 덱 짜기 → 멀리건 → 대결 → 결과 → 전적·상점·배우기. 로비·결과·전적·상점·고르기는 **같은 모양**
(코드는 `gwent.html` 안에 따로 둔다 — html 끼리 import 하지 않는 관례).

- **대결**: 위에 상대 세 줄(고기동·중장·경장), 가운데 막대(양쪽 합·목숨·라운드·차례·선공 보너스), 아래 내 세 줄(경장·중장·고기동), 맨 아래 손패 칸.
  줄 머리에 폼 이름·줄 합·날씨 표시. 손패 카드를 고르면 내 세 줄에 **그 줄에서의 힘이 떠서**(`.gw-target[data-lane]`, 44px) 줄을 짚는다.
  날씨판을 고르면 세 줄에 날씨 이름이 뜬다. 개방 단추(손패 칸 제목 줄, 패스·? 옆)를 누르면 내 판 위 비영웅에 표적이 뜬다.
  판 위 카드는 그 폼 초상(개방이면 개방 초상), 힘 숫자, 피해 빨강·결속·개방 표시. 날씨 줄은 흐리게.
- **덱 짜기**: 카드에 힘 셋(5·5·9)이 함께. 상세에서 일상컷이 있으면 "날씨판으로 넣기" 전환(덱에 `이름|w`). 규칙 줄에 날씨 n/3.
- **결과·전적**: 신기 결투 꼴 — 라운드별 합, 한 라운드 최고 합, 날씨·개방 수.
- 덮개(344×882) 우선, 44px, 가로 넘침 없음.

## 9. 파일·API·저장

| 파일 | 무엇 |
|---|---|
| `lib/gwent.js` | 엔진. `window.AtelierGwent` / `module.exports`. DOM 모름 |
| `gwent.html` | 화면. Preact + htm, CSS 안에 |
| `data/gwent.json` | `note` · `overrides` · `weather: {light:'hail', heavy:'sand', mobility:'rain'}` |
| `docs/GWENT_GAME.md` | 규칙 문서 |
| `tests/gwent-sim.cjs` | 규칙·AI·보상·균형 보고(`--quick` 은 보고 생략) |
| `tests/gwent-screen.cjs` | 덮개 흐름 |

손대는 것: `lib/collection.js`(`statsView` 세 줄) · `lib/words.js`(`gwent.*`, `nav.gwent`, `home.gwent.*`) · `lib/workspace-ui.js`(탭 8, 제목) ·
`lib/workspace.css`(필요하면; `?v=gwent1`) · `tests/header-layout.cjs`·`theme-screen.cjs`(8 화면) · `tests/forms.cjs`(`gwent.json` 날씨 셋) ·
`index.html` · 허브 `polos0117.github.io/index.html` · `AGENTS.md` · `README.md` · `docs/GAME_CONCEPT.md` · `docs/PATCH.md`.

```
gwent.js
  derive(data) · cardsOf(data) · cardOf(data, id)
  validateDeck(data, profile) · toggleDeck(data, profile, id) · autoFill(data, profile)
  championDeck(data, rng, gen, level)
  newMatch(data, profile, gen, level, seed) → st   // phase 'mulligan'
  mulligan(st, i) · confirm(data, st)
  legal(data, st, who) → {play:[{id, lanes:[0,1,2]}], open:[{lane, i}], pass}
  play(data, st, id, lane) · open(data, st, lane, i) · pass(data, st) · endTurn · endRound
  rowSum(data, st, who, lane) · sums(data, st) → {me, foe}
  aiMove(data, st, level) · aiTurn(data, st, level)
  settle(data, profile, st) → outcome | null
```

상태 — `{v, seed, rngState, champion, level, round, turn, first, coin, bonus:{me,foe}, passed, lives, me, foe, weather:[null|'hail'|'sand'|'rain' ×3], seq, log, roundLog, phase, winner, played, mulligans, rewarded, outcome, last}`.
`me`/`foe` = `{hand[], deck[], rows:[[unit…] ×3], grave[], opened:false}`. unit = `{id, name, base, dmg, open, at}` (현재 힘 = base − dmg + open).

저장: `pkm_duel_v1` 에 `decks.gwent` · `stats.gwent` · `matches.gwent`. 읽을 때 모르는 id·풀 밖 카드는 덱에서 뺀다(`이름|w` 는 이름으로 검사하고 일상컷도 본다).

말: 전부 `words.js` 의 `gwent.*`. 줄 이름은 `form.*`. 날씨 이름 `gwent.weather.hail|sand|rain`. `<title>` = `app.title`.

## 10. 검사

- `tests/gwent-sim.cjs` — 파생(정한 예) · 덱 규칙 여섯 · 멀리건 · 상성 타격(2배·4배·영웅·없음) · 결속(둘·셋·영웅·피해) · 개방(+5·−1·바닥·한 번) ·
  날씨(1·걷힘·양쪽·영웅·라운드 끝) · 라운드·목숨·동점·선공 보너스 · AI 셋 · 정산·보상·전적 · 옛 저장(`decks.gwent` 없음) · 균형 보고.
- `tests/gwent-screen.cjs` — 덮개에서 고르기 → 덱 짜기(날씨판 전환) → 멀리건 → 대결(줄 고르기·날씨·개방·패스) → 결과 뒤집기 → 새로고침 이어가기 → 전적·상점.
- 기존 `words`·`patch`·`forms`·`header-layout`·`theme-screen` 통과.

## 11. 범위 밖

진영 능력 · 변형판 수집 · 영웅 능력 · 줄 옮기기 · 진화(진화 결투 몫) · 온라인.
