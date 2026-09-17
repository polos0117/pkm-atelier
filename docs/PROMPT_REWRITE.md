# 프롬프트 낱말 갈아 끼우기 — GPT 에게 넘길 일

`lib/prompt-spec.js` **한 파일**만 고치면 된다. 다른 파일은 안 봐도 된다.

이 저장소는 `atelier`(기동전사 건담 드래프트)에서 프롬프트 엔진을 통째로 가져왔다.
**구조는 그대로 쓰고 말만 이 놀이(포켓몬 메카 무스메)의 것으로 바꾸는 것**이 이 일이다.

---

## 왜 파일 하나인가

엔진이 이미 "구조"와 "말"로 갈라져 있다.

| 파일 | 줄 | 한글 | 영문 주제어 |
|---|---|---|---|
| `lib/prompt-spec.js` | 998 | **1,521자리** | **82자리** |
| `lib/prompt-anthro.js` | 193 | 0 | 0 |
| `lib/prompt-lifestyle.js` | 450 | 0 | 0 |
| `lib/figures.js` | 237 | 0 | 0 |
| `lib/toolkit.js` | 254 | 0 | 0 |

조립부 넷은 말을 한 자도 안 들고 있다. 전부 표에서 꺼내 쓴다.
코드에 박혀 있던 영문 주제어 7자리는 이미 `SOURCE_WORD` · `SOURCE_INPUT` 로 빼 두었다.

---

## 일 1 — 영문 주제어 82자리

생성기에 나가는 프롬프트 본문에서 **원본을 가리키는 말**이다.
건담에서는 "mobile suit" 였고, 이 놀이에서는 포켓몬 종(種)이다.

| 표 | 자리 | 무엇 |
|---|---|---|
| `templateC` | **45** | 의인화 프롬프트의 본문 틀. 여기가 제일 크다 |
| `STYLE_PROFILES` | 14 | 화풍 12가지의 `core`·`anthro`·`lifestyle` |
| `LIFESTYLE_REFERENCE_LOCK_BASE` | 5 | 일상컷의 참조 고정 문구 |
| `SOURCE_WORD` | 3 | **여기가 지렛대** — 아래 참고 |
| `AGGRESSIVE_MORPHOLOGY_CORE` | 3 | 난형 기체용 형태 문구 |
| `CATS` | 3 | 카테고리 설명 |
| `SOURCE_INPUT` | 2 | 일상컷 `[INPUT]` 블록 |
| `LIMB_OWNERSHIP_LOCK` | 2 | 팔다리 귀속 고정 |
| `TRANSLATION_PROFILES` | 2 | 번역 방침 |
| `ANTHRO_STYLE_EXTENSIONS` · `MORPHOLOGY_COMMON` · `LIFESTYLE_STYLE_LOCK` | 각 1 | |

### `SOURCE_WORD` 부터 고친다

조립부가 원본을 부르는 말은 **이 셋만** 쓴다. 여기를 고치면 코드는 안 건드려도 된다.

```js
const SOURCE_WORD = {
  param:   'mobile suit name',    // PARAMETERS 블록의 항목 이름
  armor:   'mobile-suit armor',   // "원본의 장갑" 을 가리킬 때
  heading: 'SOURCE MOBILE SUIT'   // [INPUT] 블록의 제목
};
```

### `templateC` 의 첫 문장이 이렇다

```
Full-body anthropomorphization of a Gundam-series mobile suit. Every design
decision — armor color scheme, head crest, backpack and weapon attachments,
facial design, hair color, and hairstyle — is determined s…
```

"Gundam-series mobile suit" 를 갈면 된다. 나머지(장갑 배색·머리 장식·백팩·무장)는
이 놀이에도 그대로 있는 개념이라 살려도 된다.

---

## 절대 건드리지 말 것

### `mechanical` (87자리)

**원본을 가리키는 말이 아니다.** 의인화된 몸에 붙은 **장갑**을 가리킨다.
이 놀이에도 장갑이 그대로 있으므로 그대로 둔다.

```
"armor, mechanical parts, weapons"        ← 몸에 붙은 것
"Human ↔ Mechanical Balance"              ← 설정 항목 이름
"ARMOR AND MECHANICAL SURFACES: …"        ← 화풍의 장갑 렌더링 지시
```

갈아 낄 것은 `mobile suit` 쪽이다. 둘을 섞지 말 것.

### 열쇠(key) 이름

`cinematic_semi_real`, `everyday_basic`, `apparent age` 같은 영문 열쇠는
`data/style.json` · `data/img.json` · **그림 파일 이름**까지 이어져 있다.
바꾸면 이미 올린 그림이 미아가 된다. 표시 이름(`name`)만 바꾼다.

### 표 이름과 구조

`const PARAM_DEFS` 같은 표 이름, 객체의 칸 이름(`core`·`anthro`·`lifestyle`),
배열의 차례는 코드가 읽는다. 값만 바꾼다.

---

## 일 2 — 한글 1,521자리

화면에 뜨는 말이다. 여섯 표에 1,236자리(81%)가 몰려 있다.

| 표 | 자리 | 무엇 |
|---|---|---|
| `PARAM_DEFS` | **504** | 설정 45가지의 선택지 설명 |
| `EXAMPLE_MAP` | **397** | 카테고리별 예시 목록 |
| `EX_NOTE` | 154 | 예시 한 줄 설명 |
| `CAT_KO` | 64 | 카테고리 긴 설명 |
| `ART_STYLES` | 62 | 화풍 12가지의 한글 설명 |
| `HAIR_FIG` | 55 | 머리 모양 이름 |

그 밖에 `ADV_VAL` 38 · `EXPRESSION_OPTIONS` 34 · `BODY_FIG` 29 ·
`ORIENTATION_OPTIONS` 23 · `POSE_OPTIONS` 19 · `CAT_SHORT` 19 …

### 꼴

`PARAM_DEFS` 의 선택지는 `[열쇠, "표시 문자열"]` 이고, 표시 문자열은
`"<영문 값> — <한글 설명>"` 꼴이다. **앞의 열쇠는 그대로 두고 뒤의 설명만 고친다.**

```js
["",    "AUTO — 기체 이미지에 맞춰 자동 결정"]   →  "AUTO — <이 놀이의 말>에 맞춰 자동 결정"
["20s", "20s — 20대 성인"]                    →  그대로 (주제와 무관)
```

### 주제에 묶인 한글

`기체` 34 · `원기체` 6 · `메카` 3 · `파일럿` 2. 나머지 한글은 대부분
나이·체형·머리·표정처럼 주제와 무관한 말이라 손댈 것이 없다.

---

## 고친 뒤 확인

```bash
node tests/prompt-engine.cjs     # 표가 다 있나 · 글이 끝까지 나오나 (34가지)
node tools/sync-styles.cjs       # data/style.json 이 ART_STYLES 와 맞나
node tests/styles.cjs            # 화풍 12가지가 다 글을 뽑나
node tests/words.cjs             # 화면 코드에 한글이 새로 박히지 않았나
```

넷 다 통과하면 뼈대는 안 깨진 것이다.

**화풍 열쇠나 이름을 바꿨으면** `node tools/sync-styles.cjs --write` 로
`data/style.json` 을 다시 만든다. 열쇠를 바꿨다면 `pkm-atelier-img` 의 파일 이름과
`data/img.json` 도 같이 가야 한다 — 안 그러면 화면에서 그림이 전부 404 난다.
`python3 tools/register-images.py --check` 가 그걸 잡아 준다.

---

## 이 일이 아닌 것

`prompt.html`(2,306줄)에 **화면 말 1,189자리**가 따로 박혀 있다. 그건 이 일과 별개고,
`lib/words.js` 의 낱말 표로 빼는 작업이다. `tests/words.cjs` 의 `PENDING` 이
자리 수를 지켜보고 있다 — 늘어나면 실패하고, 다 빼면 그 줄을 지우라고 실패한다.

낱말이 정해진 뒤에 하는 것이 순서상 낫다. 화면 말은 표에서 온 말을 따라가야 하니까.

---

## 참고

- `docs/PORT_NOTES.md` — 무엇을 어디서 가져왔고 무엇을 일부러 뺐나
- `AGENTS.md` — 이 저장소의 규칙 넷
- `lib/prompt-spec.js` 머리말 — 이 파일이 무엇인지, 왜 한글 검사에서 빠지는지
