# 어디서 무엇을 가져왔나

`polos0117/atelier` 에서 **주제와 무관한 것만** 가져왔다. 옮기면서 고친 것과
일부러 뺀 것을 적는다.

## 그대로 가져온 것

| 파일 | 줄 | 하는 일 |
|---|---|---|
| `lib/workspace.css` | 335 | 공통 껍데기 · 테마 여덟 · 밀도 둘 |
| `lib/workspace-theme.js` | 57 | 테마·밀도를 그리기 전에 정한다 · `--atelier-vh` |
| `lib/workspace-ui.js` | 123 | 겉모습 고르개 · 큰 제목 · 테마별 문장 |
| `lib/fresh.js` | 116 | 새 판 감지 (홈 화면 앱은 새로고침 단추가 없다) |
| `lib/img.js` | 111 | 그림 주소 규칙 · `img.json` 읽기 |
| `tests/browser-harness.cjs` | 105 | 브라우저 검사 껍데기 |
| `tools/register-images.py` | — | 그림 등록·이름 규칙 검사 |
| `tools/make-thumbs.py` | — | 썸네일 |

## 옮기면서 고친 것

**테마 이름을 함선에서 빛깔로.** 앞선 저장소의 여덟 테마는 건담 함선 이름이었다
(`midnight` · `white-base` · `archangel` · `musai` · `rewloola` · `agama` ·
`ptolemaios` · `isaribi`). 팔레트는 주제와 무관한데 **이름이 주제에 묶여 있었다.**
빛깔 이름으로 바꿨다.

| 옛 열쇠 | 새 열쇠 | 낱말 표 |
|---|---|---|
| midnight | `midnight` | 한밤 |
| white-base | `daylight` | 한낮 |
| archangel | `blossom` | 꽃빛 |
| musai | `moss` | 이끼 |
| rewloola | `plum` | 자두 |
| agama | `sand` | 모래 |
| ptolemaios | `deep` | 심해 |
| isaribi | `ember` | 잉걸 |

`.fleet-*` 클래스도 `.crest-*` 로 바꿨다 — "함대" 는 이 놀이의 말이 아니다.

**말을 낱말 표로.** `fresh.js` 의 안내문 넷과 겉모습 고르개의 이름표를
`lib/words.js` 로 뺐다. 옮기기 전에는 코드에 박혀 있었다.

## 일부러 안 가져온 것

| | 왜 |
|---|---|
| 드래프트 엔진 (`draft-engine.js` 1,506줄) | 놀이가 안 정해졌다. 같은 모양이면 그때 가져온다 |
| 도감 (`dex.html` 883줄) | 카드 갈래가 정해져야 모양이 선다 |
| 초상 툴킷 (`prompt.html` 2,283줄 · `toolkit-spec.js` 1,270줄) | 그림을 쓸 때 가져온다. `prompt-anthro.js` 는 주제 낱말이 0회라 그대로 온다 |
| `lib/figures.js` | 위와 같음 |

## 앞선 저장소가 남긴 측정

`atelier/TRY_SAMGUK.md` — 건담 자료를 삼국지 30장으로 갈아 끼워 돌려 본 기록이다.

- 코드를 **19줄** 고쳤고 그 셋 다 주제와 무관한 자리였다
- 규칙 코드는 **한 줄도** 안 고쳤다
- 진짜로 걸린 것은 둘: **태그 인연이 이름 규칙에 묶여 있던 것**(그 뒤 `data/tag.json` 으로 고침)과 **화면 말 190 자리**
- 그래서 이 저장소는 낱말 표를 **처음부터** 둔다

## 아직 안 정한 것

- 카드 갈래를 몇으로 할지 (`data/card.json` 의 `kinds`)
- 놀이 규칙
- 그림을 쓸지
