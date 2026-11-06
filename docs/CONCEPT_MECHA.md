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
무게 · 어깨 · 흉부 · 팔 · 허리·골반 · 다리·부츠 · 등 유닛 · 머리. `node tools/concept-mecha.cjs --list` 가 값을 다 보인다.

- 실루엣의 `owns` 는 그 실루엣이 모양을 정하는 칸(예: 기사 갑주형 — 어깨 · 흉부 · 골반 · 머리) — 그 칸 부품은 안 싣는다.
- 종의 `owns` 는 원작 특징(SIGNATURE)이 쥔 칸(피카츄 귀 머리띠 · 꼬리, 잠만보 손등 돌기) — 마찬가지로 안 싣는다. 직접 줘도 막는다.
- 자동은 종 타입의 추천 안에서 씨앗(카드 이름 + `--seed`)으로 고른다. 추천이 없는 칸은 그 칸 전체에서. `--random` 은 추천을 안 본다.
- 한 번에 여러 카드면 큰 실루엣이 서로 겹치지 않는다.
- 얼굴(FACE)은 `data/face-design.json` 그 종에서 짓는다. 손글 종(`species` — 피카츄 · 갸라도스 · 팬텀 · 잠만보)은 나머지 캐릭터 칸을 표에 쓴다.
- **자동 초안**(2026-11-06) — 표에 없는 종은 공방 자료로 짓는다(요약에 「자동 초안」). 타입 · 키 · 몸무게(`card.json` — 체형은 키 · 몸무게로 네 가지), 머리(`face-design` 머리 설계, 없으면 씨앗으로 고른 머리), 색 · 원작 특징(`source-appearance` — 생성기의 팔레트 · 입는 법을 그대로 부르고, 천(망토 · 띠 · 리본)은 판으로 바꾼다 — `auto.cloth`), 성격 · 눈 · 배경 · 판 무늬 · 발광 색은 타입 표(`auto.types`). 원작 특징이 머리 장식 · 꼬리 · 날개면 그 칸(머리 · 등)은 부품을 안 싣는다. 마음에 들면 그 종을 `species` 에 손글로 옮겨 다듬는다 — 손글이 늘 이긴다.
- 타입 표현(`--fx`) 일곱 가지 — 손에서 내는 효과 · 장갑 이음새 빛 · 오라 · 머리끝 입자 · 몸 둘레를 도는 입자 · 발밑 바닥 · 등 · 발꿈치 자취. 하나만 골라도 되고(`--fx aura`), 다 넣어도 되고(`--fx all`), 안 주면 자동(손 + 몸 하나 + 주변 하나). 손을 안 고르면 두 손은 편히 내린다. 머리끝 입자는 직접 고를 때만 — 자동 그림에서 거의 안 보였다.
- 타입이 둘인 종은 표현마다 타입을 고른다 — 기본은 다 첫 타입, `--fx-type flying` 이면 다 그 타입, `--fx hand:flying,aura:water` 처럼 표현마다, `--mix` 면 타입을 안 적은 표현에 두 타입을 섞는다. 낱말(빛 · 입자 · 바닥)은 그 타입의 `type_fx`, 첫 타입 손 효과만 종이 쓴 `HAND_EFFECT`. 여러 카드면 `--fx 갸라도스=hand,aura` 처럼 카드를 붙인다.
- 화풍(`--style`) — `mmorpg2d`(2D 한국 MMORPG, 기본) · `jp25d`(일본 2.5D 모바일 — 사용자가 붙여 준 지시문의 화풍 문구, 피카츄 전용 얼굴 말은 일반 말로) · `anime_gloss`(애니 광택 — 채도 낮은 흰색 · 은색 파스텔에 강조색 하나, 하이키 · 블룸 · 반짝이, 피부 · 옷 광택, 가는 머리 가닥. 사용자가 붙여 준 은발 세일러 그림과 견주어 만들었다). 첫 줄 · STYLE · 끝맺음만 바뀌고 나머지는 같다.
- 카메라는 수평 3/4(2026-11-06 — 일상컷이 기준 그림 얼굴을 따라가서).

```sh
node tools/concept-mecha.cjs 피카츄 갸라도스 팬텀 잠만보                 # 자동
node tools/concept-mecha.cjs 잠만보 --set silhouette=hover_rings --set legs=heels
node tools/concept-mecha.cjs 팬텀 --random --seed 3 --out <폴더>        # <영어 이름>.txt · -parts.json
node tools/concept-mecha.cjs 갸라도스 --fx hand:water,aura:flying,ground:water
node tools/concept-mecha.cjs 팬텀 --fx all --mix
node tools/concept-mecha.cjs 피카츄 --style jp25d
```
