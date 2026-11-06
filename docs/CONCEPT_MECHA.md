# 2D MMORPG 메카 컨셉 — 부품 갈아 끼우기 (시범, 2026-11-06)

포켓몬 공방 새 컨셉(프리미엄 2D 한국 MMORPG 공식 캐릭터 일러스트, 메카 장갑)의 ① 지시문을 부품으로 짓는다.
지금 생성기(`prompt.html` — 경장 · 중장 · 고기동 고정 문장)와는 따로 굴려 보고, 마음에 들면 옮긴다.
사용자 「포켓몬 메카 실루엣을 생성단계에서 다양하게 부품교체하듯 갈아끼울 수 있음 좋겠는데」 · 「추천대로 하는데 실루엣을 삼국지 공방 실루엣 자료에서 더 가져올 수 있으면 가져오자」.

## 자리

| 파일 | 무엇 |
|---|---|
| `data/concept-mecha.json` | 틀(`template`) · 칸(`slots`) · 큰 실루엣(`silhouettes`) · 부품(`parts`) · 타입 추천(`types`) · 종(`species`) |
| `tools/concept-mecha.cjs` | 부품을 골라 전체 지시문을 짓는다 |
| `tests/concept-mecha.cjs` | 표 · 자동 · 랜덤 · 직접 고르기 · 겹치는 칸 · 배치 |

## 칸

큰 실루엣(삼국지 공방 메카 실루엣 18 — `sam-atelier` `lib/prompt-spec.js` 의 `MECHA_SILHOUETTES`, 무기 · 노출 문장만 포켓몬 규칙에 맞게 + 없음) ·
무게 · 어깨 · 흉부 · 팔 · 허리·골반 · 다리·부츠 · 등 유닛 · 머리 · 타입 표현 — 몸(장갑 이음새 빛 · 오라 · 머리끝 입자) · 타입 표현 — 주변(도는 입자 · 발밑 바닥 · 자취). `node tools/concept-mecha.cjs --list` 가 값을 다 보인다.

- 실루엣의 `owns` 는 그 실루엣이 모양을 정하는 칸(예: 기사 갑주형 — 어깨 · 흉부 · 골반 · 머리) — 그 칸 부품은 안 싣는다.
- 종의 `owns` 는 원작 특징(SIGNATURE)이 쥔 칸(피카츄 귀 머리띠 · 꼬리, 잠만보 손등 돌기) — 마찬가지로 안 싣는다. 직접 줘도 막는다.
- 자동은 종 타입의 추천 안에서 씨앗(카드 이름 + `--seed`)으로 고른다. 추천이 없는 칸은 그 칸 전체에서. `--random` 은 추천을 안 본다.
- 한 번에 여러 카드면 큰 실루엣이 서로 겹치지 않는다.
- 얼굴(FACE)은 `data/face-design.json` 그 종에서 짓는다. 나머지 캐릭터 칸(성격 · 머리 · 눈 · 체형 · 원작 특징 · 색 · 손 효과 · 배경)은 종마다 표에 쓴다 — 지금 피카츄 · 갸라도스 · 팬텀 · 잠만보.
- 타입 표현은 손 효과(HAND_EFFECT)에 더해 몸 · 주변 두 칸 — 낱말(빛 · 입자 · 바닥)은 첫 타입의 `type_fx`. 자동이면 늘 싣고(빼려면 `--set fx_body=none`), 머리끝 입자와 주변 입자 · 자취는 같이 안 고른다(같은 낱말 두 번).
- 카메라는 수평 3/4(2026-11-06 — 일상컷이 기준 그림 얼굴을 따라가서).

```sh
node tools/concept-mecha.cjs 피카츄 갸라도스 팬텀 잠만보                 # 자동
node tools/concept-mecha.cjs 잠만보 --set silhouette=hover_rings --set legs=heels
node tools/concept-mecha.cjs 팬텀 --random --seed 3 --out <폴더>        # <영어 이름>.txt · -parts.json
```
