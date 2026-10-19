# PKM Atelier — 종별 얼굴 설계표

범위: 전국도감 001–1025 · 자료: `data/face-design.json`(이 문서는 `python3 tools/face-design.py render` 로 그린다. 손으로 고치지 않는다)

같은 화풍(기본 `glossy_promo`)에서 캐릭터 얼굴이 닮아 가는 것을 막는 설계다. 값은 생성기 얼굴 항목의 열쇠 그대로이고,
**생성기가 새 인물(경장 ①)의 프롬프트에 FACE 줄로 싣는다** — 화면의 "종별 얼굴 설계" 칸에서 끌 수 있고, 얼굴 항목을 직접 고르면
그 항목은 FACE 줄에서 빠지고 IDENTITY 가 쥔다. 이어가기·개방·일상에는 싣지 않는다(①을 첨부해 인물을 지킨다).

## 원칙

- 모든 인물은 20대 성인 여성이다. 원작이 아기·유체여도 아동 비율로 만들지 않는다. 사람 피부·사람 코와 입을 유지하고, 부리·주둥이·복안 같은 것은 사람 얼굴의 비율로만 옮긴다.
- 이미 확정한 경장 ①이 있으면 그 그림이 정본이다. 이 표와 달라도 다시 그리지 않는다(`registered` — 지금 그림이 등록된 종).
- 고르는 법은 무작위가 아니다. 원작 외형 특징·몸 형태·타입·키와 무게에 낱말 표로 점수를 주고(`tools/face-design.py` 의 CUES), 앞서 직접 쓴 설계에 가산점을 준다. 그러고 나서 도감 번호 차례로 겹침을 푼다.
- 같은 진화 계열끼리는 다섯 묶음(윤곽·눈·눈썹·코·입) 가운데 **3개 이상**이 다르다. 1,025종 어느 둘도 넷 이상이 같지 않다(**2개 이상** 다르다). 겹쳐서 옮긴 항목은 각 종의 "조정"에 적는다.
- 이 숫자는 글로 쓴 설계가 겹치지 않는다는 뜻이다. 그림이 실제로 구별되는지는 생성 뒤에 같은 계열·최근 캐릭터와 나란히 보고 확인한다.
- 머리색·눈색·헤어·피부색·체형은 이 표가 정하지 않는다(생성기의 다른 외형 항목).

## 지금 상태

- 서로 다른 얼굴 1025 / 1025 · 넷 이상 같은 쌍 0 · 규칙 위반 0
- 직접 쓴 설계 628종, 원작 단서 규칙으로 고른 것 397종 · 겹침을 풀며 옮긴 종 850
- 그림이 이미 있는 종(①이 정본) 313
- 항목별로 쓰인 값의 수: 얼굴형 7/7 · 얼굴 길이 3/3 · 얼굴 폭 3/3 · 턱선 · 턱끝 8/8 · 눈매 5/6 · 눈 크기 3/3 · 눈꼬리 각도 3/3 · 눈 간격 3/3 · 눈썹 8/8 · 코 9/9 · 입술 8/8

## 고치는 법

`data/face-design.json` 의 값을 고친 뒤 `python3 tools/face-design.py build` → `render` 를 돌린다. build 는 고친 값을 앞선 값으로 굳게 지키고,
그 때문에 다른 종과 겹치면 그쪽을 옮긴다. `node tests/face-design.cjs` 가 규칙과 생성기 연결을 본다.

## 1세대 · 151종

### 001 · 이상해씨 (Bulbasaur)

계열 기준: 이상해씨 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 씨앗을 품은 낮고 둥근 실루엣을 넓은 볼과 둥근 턱으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; small mouth.
```

### 002 · 이상해풀 (Ivysaur)

계열 기준: 이상해씨 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 꽃봉오리의 위로 모이는 형태를 길어진 윤곽과 또렷한 눈매로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; small delicate nose; medium lips.
```

### 003 · 이상해꽃 (Venusaur)

계열 기준: 이상해씨 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 큰 꽃의 넓은 펼침과 향기로 긴장을 달래는 특징을 넓고 완만한 얼굴로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, wide-set; fine soft arches; rounded soft tip nose; full lips.
```

### 004 · 파이리 (Charmander)

계열 기준: 파이리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 도롱뇽의 매끈한 윤곽과 꼬리 불꽃의 생동감을 열린 둥근 눈매로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; medium lips.
```

### 005 · 리자드 (Charmeleon)

계열 기준: 파이리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 긴 주둥이와 고조되는 싸움의 기질을 긴 중안부와 날카로운 눈꼬리로 해석한다.

**원작 단서:** ‘long snout’ → 얼굴 길이 긴 얼굴 · ‘slightly hooked tip’ → 눈매 강하게 치켜올라간 눈 · ‘single horn-like protrusion’ → 눈꼬리 각도 올라간 눈꼬리 · ‘slightly hooked tip’ → 눈썹 바깥에서 꺾이는 사선 · ‘single horn-like protrusion’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 006 · 리자몽 (Charizard)

계열 기준: 파이리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 용의 뚜렷한 머리선과 비행하는 위용을 광대와 단단한 턱선으로 옮긴다.

**원작 단서:** ‘paired backward horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘paired backward horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘paired backward horns’ → 눈매 가늘고 날카로운 눈 · ‘paired backward horns’ → 눈썹 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; medium lips.
```

### 007 · 꼬부기 (Squirtle)

계열 기준: 꼬부기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 둥근 등껍질과 말린 꼬리를 둥근 볼과 짧은 턱끝의 반복 곡선으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 008 · 어니부기 (Wartortle)

계열 기준: 꼬부기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 물결 꼬리와 깃털 같은 귀의 유연한 곡선을 타원 윤곽과 긴 눈매로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; small delicate nose; medium lips.
```

### 009 · 거북왕 (Blastoise)

계열 기준: 꼬부기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 거대한 거북의 체적과 강한 수류를 넓은 하관과 안정적인 수평 눈매로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; wide mouth.
```

### 010 · 캐터피 (Caterpie)

계열 기준: 캐터피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 애벌레의 둥근 마디를 부드러운 볼과 둥근 눈의 반복으로 옮긴다.

**원작 단서:** 키 0.3m → 얼굴 길이 짧은 얼굴 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; small mouth.
```

### 011 · 단데기 (Metapod)

계열 기준: 캐터피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 번데기의 접힌 면과 무거운 눈꺼풀을 각진 턱과 낮은 윗눈꺼풀로 옮긴다.

**원작 단서:** ‘two heavy-lidded eyes’ → 눈매 살짝 처진 부드러운 눈 · ‘two heavy-lidded eyes’ → 눈꼬리 각도 처진 눈꼬리 · ‘sharply pointed nose’ → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; straight slender bridge nose; thin lips.
```

### 012 · 버터플 (Butterfree)

계열 기준: 캐터피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 나비 날개의 펼침과 큰 겹눈을 넓은 상안면과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · 몸 형태 bug-wings → 눈 크기 큰 눈

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 013 · 뿔충이 (Weedle)

계열 기준: 뿔충이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 작은 뿔과 둥근 붉은 코를 또렷한 작은 눈과 둥근 사람 코끝으로 옮긴다.

**원작 단서:** ‘bulbous red nose’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; small mouth.
```

### 014 · 딱충이 (Kakuna)

계열 기준: 뿔충이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 돔형 머리와 삼각 눈을 관자놀이가 넓고 아래로 좁아지는 얼굴로 옮긴다.

**원작 단서:** ‘triangular eyes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 015 · 독침붕 (Beedrill)

계열 기준: 뿔충이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 독침과 분할 날개의 날카로운 선을 긴 눈과 좁은 턱끝으로 반복한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, close-set; angled brows; straight slender bridge nose; thin lips.
```

### 016 · 구구 (Pidgey)

계열 기준: 구구 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작고 짧은 부리와 크림색 깃의 부드러움을 짧은 코와 완만한 얼굴로 옮긴다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘short, stubby beak’ → 입술 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; small delicate nose; small mouth.
```

### 017 · 피죤 (Pidgeotto)

계열 기준: 구구 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 새의 정돈된 깃과 비행 실루엣을 길고 수평적인 눈매로 옮긴다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; medium lips.
```

### 018 · 피죤투 (Pidgeot)

계열 기준: 구구 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 길게 흐르는 볏과 맹금의 위용을 긴 윤곽과 또렷한 눈매로 옮긴다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; long arched brows; balanced nose; thin lips.
```

### 019 · 꼬렛 (Rattata)

계열 기준: 꼬렛 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 쥐의 빠른 움직임과 큰 앞니 인상을 작은 턱과 넓은 입 너비로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, wide-set; angled brows; small delicate nose; wide mouth.
```

### 020 · 레트라 (Raticate)

계열 기준: 꼬렛 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 좁은 원작 눈과 큰 앞니의 존재감을 넓은 하관과 좁은 눈매로 옮긴다.

**원작 단서:** ‘narrow black eyes’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, wide-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 021 · 깨비참 (Spearow)

계열 기준: 깨비참 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 갈고리 부리와 좁은 원작 눈을 뾰족한 사람 코끝과 날카로운 눈매로 옮긴다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘short, hooked beak’ → 눈썹 바깥에서 꺾이는 사선 · ‘short, hooked beak’ → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, small size, level outer corners, close-set; angled brows; straight slender bridge nose; thin lips.
```

### 022 · 깨비드릴조 (Fearow)

계열 기준: 깨비참 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 길고 뾰족한 부리를 긴 중안부와 길게 뻗은 콧대로 번역한다.

**원작 단서:** ‘vulturine neck’ → 얼굴형 길고 세련된 얼굴형 · ‘vulturine neck’ → 얼굴 길이 긴 얼굴 · ‘vulturine neck’ → 얼굴 폭 좁은 얼굴 · ‘vulturine neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘vulturine neck’ → 코 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; long nose with low tip; thin lips.
```

### 023 · 아보 (Ekans)

계열 기준: 아보 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 뱀의 긴 몸과 가는 시선을 길고 좁은 사람 얼굴로 해석한다.

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · ‘slit-pupil eye’ → 눈매 가늘고 날카로운 눈

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; thin lips.
```

### 024 · 아보크 (Arbok)

계열 기준: 아보 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 코브라의 펼친 후드와 올라간 입선을 넓은 광대와 긴 입 너비로 옮긴다.

**원작 단서:** ‘narrow eyes’ → 눈매 가늘고 날카로운 눈

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, upturned outer corners, average spacing; long arched brows; balanced nose; wide mouth.
```

### 025 · 피카츄 (Pikachu)

계열 기준: 피츄 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 둥근 볼주머니와 전기적인 생동감을 둥근 볼과 열린 눈매로 해석한다.

**원작 단서:** 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, wide-set; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 026 · 라이츄 (Raichu)

계열 기준: 피츄 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 라이츄의 풍성한 체적과 둥근 볼을 타원 윤곽과 도톰한 입술로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; long arched brows; small delicate nose; full lips.
```

### 027 · 모래두지 (Sandshrew)

계열 기준: 모래두지 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 뾰족한 주둥이와 아몬드형 눈을 짧고 뚜렷한 턱끝과 아몬드형 사람 눈으로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘blue, almond-shaped eyes’ → 눈매 아몬드형 눈

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; small mouth.
```

### 028 · 고지 (Sandslash)

계열 기준: 모래두지 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 등의 가시와 아몬드형 눈을 각진 광대와 긴 눈매로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘almond-shaped blue eyes’ → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 턱선과 골격이 날카로운 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 029 · 니드런♀ (Nidoran♀)

계열 기준: 니드런♀ · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 큰 귀와 독침의 대비를 넓은 상안면과 작고 또렷한 턱끝으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, wide-set; fine soft arches; small delicate nose; small mouth.
```

### 030 · 니드리나 (Nidorina)

계열 기준: 니드런♀ · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 니드리나의 단단해진 윤곽을 볼의 둥근 체적을 남긴 타원 얼굴로 옮긴다.

**원작 단서:** ‘two pointed teeth’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; straight medium brows; small delicate nose; medium lips.
```

### 031 · 니드퀸 (Nidoqueen)

계열 기준: 니드런♀ · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 뭉툭한 주둥이와 보호적인 체적을 넓고 단단한 하관으로 옮긴다.

**원작 단서:** ‘small horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘small horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small horn’ → 눈썹 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; almond eyes, medium size, downturned outer corners, average spacing; thick low brows; rounded soft tip nose; full lips.
```

### 032 · 니드런♂ (Nidoran♂)

계열 기준: 니드런♂ · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 독침과 큰 귀의 날카로운 방향을 올라간 눈꼬리와 작은 턱끝으로 옮긴다.

**원작 단서:** ‘long, pointed horn’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘long, pointed horn’ → 눈매 강하게 치켜올라간 눈 · ‘long, pointed horn’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long, pointed horn’ → 눈썹 바깥에서 꺾이는 사선 · ‘long, pointed horn’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; small delicate nose; thin lips.
```

### 033 · 니드리노 (Nidorino)

계열 기준: 니드런♂ · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 긴 주둥이와 뿔의 전방성을 긴 중안부와 집중된 눈매로 옮긴다.

**원작 단서:** ‘long, pointed horn’ → 얼굴형 길고 세련된 얼굴형 · ‘long, pointed horn’ → 얼굴 길이 긴 얼굴 · ‘long, pointed horn’ → 얼굴 폭 좁은 얼굴 · ‘long, pointed horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long, pointed horn’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; long nose with low tip; thin lips.
```

### 034 · 니드킹 (Nidoking)

계열 기준: 니드런♂ · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 큰 뿔과 강한 턱의 실루엣을 각진 사람 턱과 넓은 입으로 옮긴다.

**원작 단서:** ‘long, venomous horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘long, venomous horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long, venomous horn’ → 눈매 가늘고 날카로운 눈 · ‘long, venomous horn’ → 눈썹 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; thick low brows; balanced nose; wide mouth.
```

### 035 · 삐삐 (Clefairy)

계열 기준: 삐 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 별 같은 작은 몸과 말린 선을 둥근 얼굴과 작은 곡선 입술로 해석한다.

**원작 단서:** ‘chubby, vaguely star-shaped body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘chubby, vaguely star-shaped body’ → 얼굴 길이 짧은 얼굴 · ‘chubby, vaguely star-shaped body’ → 얼굴 폭 넓은 얼굴 · ‘chubby, vaguely star-shaped body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘chubby, vaguely star-shaped body’ → 눈매 큰 눈 · ‘chubby, vaguely star-shaped body’ → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; bow-shaped upper lip.
```

### 036 · 픽시 (Clefable)

계열 기준: 삐 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 픽시의 완만한 체적과 타원 눈을 길어진 타원 얼굴로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘black, oval eyes’ → 눈매 큰 눈 · ‘long, pointed ears’ → 눈썹 길고 바깥 아치가 선명한 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, average spacing; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 037 · 식스테일 (Vulpix)

계열 기준: 식스테일 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 여우의 작은 얼굴과 말린 꼬리 곡선을 작은 턱과 곡선 눈썹으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘large, pointed ears’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, wide-set; long arched brows; balanced nose; bow-shaped upper lip.
```

### 038 · 나인테일 (Ninetales)

계열 기준: 식스테일 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 길게 흐르는 아홉 꼬리와 신비로운 분위기를 긴 윤곽과 가늘고 긴 눈으로 해석한다.

**원작 단서:** ‘long, fluffy crest’ → 얼굴형 길고 세련된 얼굴형 · ‘long, fluffy crest’ → 얼굴 길이 긴 얼굴 · ‘long, fluffy crest’ → 얼굴 폭 좁은 얼굴 · ‘long, fluffy crest’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long, fluffy crest’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, wide-set; long arched brows; rounded soft tip nose; thin lips.
```

### 039 · 푸린 (Jigglypuff)

계열 기준: 푸푸린 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 풍선의 원형과 큰 파란 눈을 둥근 볼과 큰 사람 눈으로 옮긴다.

**원작 단서:** ‘spherical body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical body’ → 얼굴 길이 짧은 얼굴 · ‘spherical body’ → 얼굴 폭 넓은 얼굴 · ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical body’ → 눈매 큰 눈 · ‘spherical body’ → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; balanced nose; bow-shaped upper lip.
```

### 040 · 푸크린 (Wigglytuff)

계열 기준: 푸푸린 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 길어진 풍선 몸과 큰 파란 눈을 세로로 긴 타원 얼굴과 도톰한 입술로 구분한다.

**원작 단서:** 페어리 타입 → 눈썹 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; full lips.
```

### 041 · 주뱃 (Zubat)

계열 기준: 주뱃 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**이유:** 박쥐 날개의 예리한 펼침을 긴 눈매로 옮긴다. 원작의 눈 부재를 사람 얼굴에 복제하지 않는다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 몸 형태 wings → 코 곧고 가는 콧대 · ‘two fangs on each jaw’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, close-set; straight medium brows; straight slender bridge nose; straight even lips.
```

### 042 · 골뱃 (Golbat)

계열 기준: 주뱃 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 작은 원작 눈과 압도적인 입 너비를 작은 사람 눈과 넓은 입으로 해석한다.

**원작 단서:** ‘small eyes’ → 눈매 가늘고 날카로운 눈 · ‘small eyes’ → 눈 크기 작은 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, upturned outer corners, close-set; angled brows; balanced nose; wide mouth.
```

### 043 · 뚜벅쵸 (Oddish)

계열 기준: 뚜벅쵸 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 둥근 몸과 작은 붉은 눈을 짧은 얼굴과 작고 둥근 사람 눈으로 옮긴다.

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 얼굴 길이 짧은 얼굴 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round body’ → 눈매 큰 눈 · ‘beady red eyes’ → 눈 크기 작은 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, close-set; fine soft arches; rounded soft tip nose; small mouth.
```

### 044 · 냄새꼬 (Gloom)

계열 기준: 뚜벅쵸 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 늘어진 표정과 얇은 원작 입술을 낮은 윗눈꺼풀과 얇은 입술로 옮긴다.

**원작 단서:** ‘thin lips’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; thin lips.
```

### 045 · 라플레시아 (Vileplume)

계열 기준: 뚜벅쵸 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 크게 펼친 꽃의 둥근 체적을 넓은 얼굴과 완만한 눈썹 곡선으로 해석한다.

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; rounded soft tip nose; full lips.
```

### 046 · 파라스 (Paras)

계열 기준: 파라스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 버섯과 원형 눈의 둥근 반복을 짧은 윤곽과 원형에 가까운 사람 눈으로 옮긴다.

**원작 단서:** 키 0.3m → 얼굴 길이 짧은 얼굴 · ‘circular eyes’ → 눈매 큰 눈 · ‘circular eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; straight medium brows; rounded soft tip nose; small mouth.
```

### 047 · 파라섹트 (Parasect)

계열 기준: 파라스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 거대한 버섯 아래 작은 머리를 좁은 얼굴과 고요한 수평 눈매로 해석한다. 흰 눈은 옅은 홍채로만 참고한다.

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, average spacing; straight medium brows; small delicate nose; thin lips.
```

### 048 · 콘팡 (Venonat)

계열 기준: 콘팡 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 보송한 체적과 큰 겹눈을 둥근 얼굴과 큰 사람 눈으로 옮긴다.

**원작 단서:** ‘spherical body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical body’ → 얼굴 길이 짧은 얼굴 · ‘spherical body’ → 얼굴 폭 넓은 얼굴 · ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical body’ → 눈매 큰 눈 · ‘spherical body’ → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 윗입술이 활 모양인 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; full lips.
```

### 049 · 도나리 (Venomoth)

계열 기준: 콘팡 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 나방 날개의 부드러운 펼침과 원형 눈을 넓은 상안면과 둥근 눈으로 옮긴다.

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, average spacing; long arched brows; small delicate nose; small mouth.
```

### 050 · 디그다 (Diglett)

계열 기준: 디그다 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 둥근 큰 코와 작은 눈을 둥근 사람 코끝과 작고 또렷한 눈으로 해석한다.

**원작 단서:** 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; small mouth.
```

### 051 · 닥트리오 (Dugtrio)

계열 기준: 디그다 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 단단한 머리와 반복되는 작은 눈을 긴 윤곽과 정돈된 눈매로 구분한다. 머리는 하나다.

**원작 단서:** 몸 형태 heads → 얼굴 폭 좁은 얼굴 · 몸 형태 heads → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; open rounded eyes, small size, level outer corners, close-set; straight medium brows; rounded soft tip nose; medium lips.
```

### 052 · 나옹 (Meowth)

계열 기준: 나옹 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 고양이의 타원 머리와 장난스러운 분위기를 올라간 눈꼬리와 넓은 입으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, wide-set; long arched brows; small delicate nose; wide mouth.
```

### 053 · 페르시온 (Persian)

계열 기준: 나옹 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 샴고양이의 매끈하고 길쭉한 실루엣을 긴 얼굴과 가는 눈매로 옮긴다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; long arched brows; small delicate nose; thin lips.
```

### 054 · 고라파덕 (Psyduck)

계열 기준: 고라파덕 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 납작하고 넓은 부리와 작은 동공의 멍한 인상을 넓은 입과 열린 둥근 눈으로 해석한다.

**원작 단서:** ‘wide, flat cream-colored beak’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; wide mouth.
```

### 055 · 골덕 (Golduck)

계열 기준: 고라파덕 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 골덕의 유선형 몸과 날카로운 시선을 긴 얼굴과 수평으로 긴 눈으로 구분한다.

**원작 단서:** ‘four horns’ → 눈매 가늘고 날카로운 눈 · ‘four horns’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 056 · 망키 (Mankey)

계열 기준: 망키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 털 뭉치 같은 둥근 체적과 급한 기질을 둥근 볼과 굵은 사선 눈썹으로 해석한다.

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 얼굴 길이 짧은 얼굴 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은 · ‘round body’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; thick low brows; rounded soft tip nose; wide mouth.
```

### 057 · 성원숭 (Primeape)

계열 기준: 망키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 좁은 눈과 거친 체적을 넓은 하관과 깊고 좁은 눈으로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘narrow eyes’ → 눈매 가늘고 날카로운 눈 · ‘round body’ → 눈썹 짧고 둥근 · ‘round body’ → 코 코끝이 둥근

**조정:** 같은 계열 망키와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; wide mouth.
```

### 058 · 가디 (Growlithe)

계열 기준: 가디 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 강아지의 둥근 주둥이와 풍성한 털을 둥근 코끝과 부드러운 볼로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; thick low brows; rounded soft tip nose; medium lips.
```

### 059 · 윈디 (Arcanine)

계열 기준: 가디 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 큰 갈기와 당당한 체적을 넓은 광대와 단단하면서 완만한 턱으로 옮긴다.

**원작 단서:** 무게 155kg → 얼굴 폭 넓은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; full lips.
```

### 060 · 발챙이 (Poliwag)

계열 기준: 발챙이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 둥근 올챙이 몸과 큰 눈 및 분홍 입술을 둥근 얼굴과 도톰한 입술로 옮긴다.

**원작 단서:** ‘thin skin’ → 얼굴 폭 좁은 얼굴 · ‘large eyes’ → 눈매 큰 눈 · ‘large eyes’ → 눈 크기 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; open rounded eyes, large size, level outer corners, close-set; fine soft arches; small delicate nose; full lips.
```

### 061 · 슈륙챙이 (Poliwhirl)

계열 기준: 발챙이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 팔다리가 발달한 올챙이의 둥근 핵심 윤곽을 길어진 타원 얼굴로 구분한다.

**원작 단서:** ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical body’ → 눈매 큰 눈 · ‘spherical body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; straight medium brows; rounded soft tip nose; medium lips.
```

### 062 · 강챙이 (Poliwrath)

계열 기준: 발챙이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 강한 상체와 올챙이 계열의 둥근 형태를 넓은 얼굴과 집중된 수평 눈매로 옮긴다.

**원작 단서:** ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 부드럽고 둥근 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; wide mouth.
```

### 063 · 캐이시 (Abra)

계열 기준: 캐이시 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 잠과 초능력의 고요한 인상을 낮은 윗눈꺼풀과 작은 입으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, close-set; fine soft arches; small delicate nose; thin lips.
```

### 064 · 윤겔라 (Kadabra)

계열 기준: 캐이시 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 초능력과 각진 얼굴의 인상을 긴 중안부와 직선적인 눈썹으로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; long nose with low tip; thin lips.
```

### 065 · 후딘 (Alakazam)

계열 기준: 캐이시 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 길고 얇은 주둥이와 좁은 눈을 긴 콧대와 가늘고 긴 사람 눈으로 해석한다.

**원작 단서:** ‘long, thin snout’ → 얼굴 길이 긴 얼굴 · ‘ear-like spikes’ → 눈매 가늘고 날카로운 눈 · ‘long, thin snout’ → 코 길고 코끝이 내려온 · ‘ear-like spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, close-set; straight medium brows; long nose with low tip; thin lips.
```

### 066 · 알통몬 (Machop)

계열 기준: 알통몬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 평평한 원작 얼굴과 근력의 체적을 넓은 얼굴과 낮고 짧은 콧대로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘relatively flat face’ → 얼굴 폭 넓은 얼굴 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, large size, level outer corners, average spacing; thick low brows; small delicate nose; wide mouth.
```

### 067 · 근육몬 (Machoke)

계열 기준: 알통몬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 넓은 |

**이유:** 짧은 주둥이와 단단한 근육 윤곽을 각진 턱과 넓은 입으로 구분한다.

**원작 단서:** ‘four pointed teeth’ → 턱선 · 턱끝 각지고 또렷한 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은 · ‘short snout’ → 코 짧고 코끝이 들린

**조정:** 같은 계열 알통몬와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; short nose with upturned tip; wide mouth.
```

### 068 · 괴력몬 (Machamp)

계열 기준: 알통몬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 강한 체적과 두드러진 입술을 넓은 하관과 도톰한 사람 입술로 옮긴다.

**원작 단서:** 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; full lips.
```

### 069 · 모다피 (Bellsprout)

계열 기준: 모다피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 종 모양 머리와 분홍 입술을 위가 좁고 아래가 둥근 긴 얼굴과 도톰한 입술로 해석한다.

**원작 단서:** ‘beady black eyes’ → 눈 크기 작은 눈

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; small delicate nose; full lips.
```

### 070 · 우츠동 (Weepinbell)

계열 기준: 모다피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 매달린 주머니의 매끈한 윤곽과 분홍 입술을 타원 얼굴과 낮은 눈꺼풀로 옮긴다.

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; long arched brows; small delicate nose; full lips.
```

### 071 · 우츠보트 (Victreebel)

계열 기준: 모다피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 식충식물의 큰 입과 팽팽한 윤곽을 긴 얼굴과 넓고 도톰한 입술로 해석한다.

**원작 단서:** 몸 형태 blob → 눈 간격 눈 사이가 넓은 · ‘swollen pink lip’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; balanced nose; full lips.
```

### 072 · 왕눈해 (Tentacool)

계열 기준: 왕눈해 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 투명한 큰 원작 눈과 해파리의 가벼운 윤곽을 넓은 상안면과 큰 맑은 눈으로 옮긴다.

**원작 단서:** 몸 형태 tentacles → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 tentacles → 입술 입이 작은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; straight medium brows; small delicate nose; small mouth.
```

### 073 · 독파리 (Tentacruel)

계열 기준: 왕눈해 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 큰 해파리의 늘어진 선과 단단한 머리 윤곽을 긴 얼굴과 수평 눈매로 구분한다.

**원작 단서:** ‘two blue, beak-like appendages’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; prominent defined nose; thin lips.
```

### 074 · 꼬마돌 (Geodude)

계열 기준: 꼬마돌 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 암석의 면과 단단한 체적을 각진 턱과 굵은 직선 눈썹으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; thick low brows; small delicate nose; wide mouth.
```

### 075 · 데구리 (Graveler)

계열 기준: 꼬마돌 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 겹친 암석의 둔중한 윤곽을 넓은 광대와 낮고 좁은 눈매로 구분한다.

**원작 단서:** ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘rocky crest’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘rocky crest’ → 눈매 가늘고 날카로운 눈 · ‘rocky crest’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; narrow eyes, small size, level outer corners, close-set; thick low brows; balanced nose; wide mouth.
```

### 076 · 딱구리 (Golem)

계열 기준: 꼬마돌 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 구형 암석과 납작한 주둥이를 넓고 둥근 얼굴의 단단한 턱선으로 해석한다.

**원작 단서:** ‘spherical body’ → 얼굴 폭 넓은 얼굴 · ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 부드럽고 둥근 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; wide mouth.
```

### 077 · 포니타 (Ponyta)

계열 기준: 포니타 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 말의 긴 머리와 흐르는 불꽃 갈기를 긴 얼굴과 완만한 긴 눈으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; long nose with low tip; thin lips.
```

### 078 · 날쌩마 (Rapidash)

계열 기준: 포니타 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**이유:** 긴 뿔과 질주하는 말의 선을 긴 콧대와 더 선명한 눈매로 구분한다.

**원작 단서:** ‘long, flowing mane’ → 얼굴형 길고 세련된 얼굴형 · ‘long, flowing mane’ → 얼굴 길이 긴 얼굴 · ‘long, flowing mane’ → 얼굴 폭 좁은 얼굴 · ‘long, flowing mane’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘pointed horn’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 같은 계열 포니타와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; long nose with low tip; medium lips.
```

### 079 · 야돈 (Slowpoke)

계열 기준: 야돈 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 멍한 눈과 둥근 체적을 낮은 윗눈꺼풀과 짧고 넓은 얼굴로 옮긴다.

**원작 단서:** ‘vacant eyes’ → 눈매 살짝 처진 부드러운 눈 · ‘vacant eyes’ → 눈꼬리 각도 처진 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; thin straight brows; rounded soft tip nose; wide mouth.
```

### 080 · 야도란 (Slowbro)

계열 기준: 야돈 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 야돈의 느긋한 눈꺼풀을 남기고 넓어진 체적을 넓은 볼과 도톰한 입술로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘several spikes’ → 턱선 · 턱끝 각지고 또렷한 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; full lips.
```

### 081 · 코일 (Magnemite)

계열 기준: 코일 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 단일 둥근 눈과 자석의 대칭을 균형 잡힌 두 사람 눈과 정돈된 얼굴 비율로 옮긴다.

**원작 단서:** ‘gray, spherical metal body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘gray, spherical metal body’ → 눈매 큰 눈 · ‘gray, spherical metal body’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 082 · 레어코일 (Magneton)

계열 기준: 코일 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 자석의 반복 결합을 각진 윤곽과 수평적인 눈매로 구분한다. 눈은 두 개다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · ‘single eye’ → 눈 간격 눈 사이가 가까운 · ‘gray spherical body’ → 코 코끝이 둥근

**조정:** 같은 계열 코일와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; rounded soft tip nose; thin lips.
```

### 083 · 파오리 (Farfetch’d)

계열 기준: 파오리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 납작한 부리와 결연한 인상을 넓은 입과 굵은 직선 눈썹으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; wide mouth.
```

### 084 · 두두 (Doduo)

계열 기준: 두두 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 작은 |

**이유:** 길고 날카로운 부리와 작은 눈을 긴 콧대와 작고 또렷한 사람 눈으로 옮긴다.

**원작 단서:** 몸 형태 legs → 얼굴 폭 좁은 얼굴 · ‘two beady black eyes’ → 눈 크기 작은 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘long sharp beak’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; open rounded eyes, small size, level outer corners, close-set; straight medium brows; long nose with low tip; small mouth.
```

### 085 · 두트리오 (Dodrio)

계열 기준: 두두 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 세 방향으로 뻗는 새의 선을 높은 광대와 날카로운 눈매로 해석한다. 인물과 머리는 하나다.

**원작 단서:** 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘long, sharp beak’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, close-set; angled brows; prominent defined nose; thin lips.
```

### 086 · 쥬쥬 (Seel)

계열 기준: 쥬쥬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 강치의 매끈한 둥근 몸과 둥근 주둥이를 둥근 볼과 둥근 코끝으로 옮긴다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; full lips.
```

### 087 · 쥬레곤 (Dewgong)

계열 기준: 쥬쥬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 유선형 강치의 길게 흐르는 선을 타원 얼굴과 완만한 눈매로 구분한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, wide-set; fine soft arches; rounded soft tip nose; medium lips.
```

### 088 · 질퍽이 (Grimer)

계열 기준: 질퍽이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 보통 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 흐르는 진흙과 큰 눈 및 벌어진 입을 부드러운 볼과 넓은 입으로 해석한다.

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통 · ‘two large eyes’ → 눈매 큰 눈 · ‘two large eyes’ → 눈 크기 큰 눈 · ‘gaping mouth’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; balanced jawline; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; wide mouth.
```

### 089 · 질뻐기 (Muk)

계열 기준: 질퍽이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 큰 진흙 체적과 작은 눈의 대비를 넓은 얼굴과 작은 사람 눈으로 구분한다.

**원작 단서:** ‘enormous mouth’ → 턱선 · 턱끝 넓고 묵직한 턱끝 · ‘beady black pupils’ → 눈매 가늘고 날카로운 눈 · ‘beady black pupils’ → 눈 크기 작은 눈 · ‘enormous mouth’ → 입술 입이 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, upturned outer corners, average spacing; straight medium brows; rounded soft tip nose; wide mouth.
```

### 090 · 셀러 (Shellder)

계열 기준: 셀러 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 둥근 조개 안의 원형 눈과 닫힌 입을 짧은 얼굴과 작은 입으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘two round white eyes’ → 눈매 큰 눈 · ‘two round white eyes’ → 눈꼬리 각도 수평 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; straight medium brows; small delicate nose; small mouth.
```

### 091 · 파르셀 (Cloyster)

계열 기준: 셀러 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 가시진 조개와 진주 같은 중심 얼굴을 넓은 광대와 작은 턱끝으로 옮긴다.

**원작 단서:** ‘one barb-like spike’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘one barb-like spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘one barb-like spike’ → 눈매 강하게 치켜올라간 눈 · ‘one barb-like spike’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘one barb-like spike’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; straight slender bridge nose; thin lips.
```

### 092 · 고오스 (Gastly)

계열 기준: 고오스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 둥근 가스 덩어리와 넓은 입을 둥근 얼굴과 넓은 입선으로 해석한다.

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 얼굴 길이 짧은 얼굴 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; small delicate nose; wide mouth.
```

### 093 · 고우스트 (Haunter)

계열 기준: 고오스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 삼각 눈과 뾰족한 윤곽을 넓은 상안면과 치켜올라간 눈매로 옮긴다.

**원작 단서:** ‘triangular eyes’ → 눈매 강하게 치켜올라간 눈 · ‘triangular eyes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘triangular eyes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; straight slender bridge nose; wide mouth.
```

### 094 · 팬텀 (Gengar)

계열 기준: 고오스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 둥근 체적과 큰 장난스러운 입을 넓은 볼과 좁은 눈의 대비로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘numerous spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘numerous spikes’ → 눈매 가늘고 날카로운 눈 · ‘numerous spikes’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; thick low brows; rounded soft tip nose; wide mouth.
```

### 095 · 롱스톤 (Onix)

계열 기준: 롱스톤 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 길게 이어진 돌 마디를 긴 얼굴과 단단한 직선 턱선으로 옮긴다.

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · ‘rocky spine’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘rocky spine’ → 눈매 가늘고 날카로운 눈 · ‘rocky spine’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 096 · 슬리프 (Drowzee)

계열 기준: 슬리프 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 지친 원작 눈과 둥근 몸을 낮은 윗눈꺼풀과 부드러운 볼로 옮긴다.

**원작 단서:** ‘round belly’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round belly’ → 얼굴 길이 짧은 얼굴 · ‘round belly’ → 얼굴 폭 넓은 얼굴 · ‘round belly’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘tired-looking eyes’ → 눈매 살짝 처진 부드러운 눈 · ‘tired-looking eyes’ → 눈꼬리 각도 처진 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, close-set; fine soft arches; rounded soft tip nose; full lips.
```

### 097 · 슬리퍼 (Hypno)

계열 기준: 슬리프 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 큰 코와 졸린 눈을 긴 사람 코와 길고 낮은 눈매로 구분한다.

**원작 단서:** ‘sleepy-looking eyes’ → 눈매 살짝 처진 부드러운 눈 · ‘sleepy-looking eyes’ → 눈꼬리 각도 처진 눈꼬리 · ‘large nose’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; rounded soft tip nose; thin lips.
```

### 098 · 크랩 (Krabby)

계열 기준: 크랩 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 게의 넓은 옆 실루엣과 집게의 분명한 윤곽을 넓은 얼굴과 짧은 코로 옮긴다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, large size, level outer corners, wide-set; straight medium brows; small delicate nose; wide mouth.
```

### 099 · 킹크랩 (Kingler)

계열 기준: 크랩 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**이유:** 큰 집게의 각진 힘을 각진 하관과 굵은 눈썹으로 구분한다.

**원작 단서:** ‘six tall, thin spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘six tall, thin spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘six tall, thin spikes’ → 눈매 가늘고 날카로운 눈 · ‘six tall, thin spikes’ → 눈썹 굵고 눈 가까이 낮은 · ‘six tall, thin spikes’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; straight even lips.
```

### 100 · 찌리리공 (Voltorb)

계열 기준: 찌리리공 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 구형 몸과 각진 눈의 대비를 둥근 얼굴 안의 날카로운 눈매로 옮긴다.

**원작 단서:** ‘spherical ball-shaped body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical ball-shaped body’ → 얼굴 길이 짧은 얼굴 · ‘spherical ball-shaped body’ → 얼굴 폭 넓은 얼굴 · ‘spherical ball-shaped body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘angular eyes on upper hemisphere’ → 눈매 강하게 치켜올라간 눈 · ‘angular eyes on upper hemisphere’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; small delicate nose; thin lips.
```

### 101 · 붐볼 (Electrode)

계열 기준: 찌리리공 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 구형 몸과 가는 눈 및 큰 웃음선을 둥근 얼굴과 넓은 입 너비로 구분한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘black slit eyes’ → 눈매 가늘고 날카로운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘smile mouth’ → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, small size, level outer corners, wide-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 102 · 아라리 (Exeggcute)

계열 기준: 아라리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 알의 타원형과 삼각 눈을 타원 윤곽과 치켜올라간 눈매로 옮긴다.

**원작 단서:** ‘triangular eyes’ → 눈매 강하게 치켜올라간 눈 · ‘triangular eyes’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘triangular eyes’ → 눈썹 바깥에서 꺾이는 사선 · ‘small mouth’ → 입술 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, close-set; angled brows; small delicate nose; small mouth.
```

### 103 · 나시 (Exeggutor)

계열 기준: 아라리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 야자 열매의 둥근 반복과 느긋한 체적을 넓은 볼과 둥근 눈으로 해석한다.

**원작 단서:** ‘three round, light yellow heads’ → 얼굴 폭 넓은 얼굴 · ‘three round, light yellow heads’ → 눈매 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘three round, light yellow heads’ → 눈썹 가늘고 완만한 곡선 · ‘three round, light yellow heads’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; rounded soft tip nose; wide mouth.
```

### 104 · 탕구리 (Cubone)

계열 기준: 탕구리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 고독한 전승과 둥근 주둥이를 내려간 눈꼬리와 짧고 둥근 코끝으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘two rounded horns’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘two small spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘two rounded horns’ → 코 코끝이 둥근 · ‘two rounded horns’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; angled brows; rounded soft tip nose; small mouth.
```

### 105 · 텅구리 (Marowak)

계열 기준: 탕구리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 뼈의 단단한 면과 성장한 실루엣을 단단한 턱선과 깊은 수평 눈매로 구분한다.

**원작 단서:** ‘small spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘small spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small spike’ → 눈매 가늘고 날카로운 눈 · ‘small spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 106 · 시라소몬 (Hitmonlee)

계열 기준: 배루키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 길게 늘어나는 다리와 킥의 직선성을 긴 얼굴과 가늘고 긴 눈으로 해석한다.

**원작 단서:** ‘ovoid body’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; short rounded brows; long nose with low tip; thin lips.
```

### 107 · 홍수몬 (Hitmonchan)

계열 기준: 배루키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 권투의 밀도 높은 동작과 머리의 뭉툭한 돌출을 단단한 하관과 굵은 눈썹으로 해석한다.

**원작 단서:** 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; small delicate nose; medium lips.
```

### 108 · 내루미 (Lickitung)

계열 기준: 내루미 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 부드러운 둥근 몸과 혀의 큰 존재감을 둥근 볼과 넓고 도톰한 입술로 해석한다.

**원작 단서:** ‘soft, pink skin’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘soft, pink skin’ → 얼굴 길이 짧은 얼굴 · ‘soft, pink skin’ → 얼굴 폭 넓은 얼굴 · ‘soft, pink skin’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘soft, pink skin’ → 눈매 큰 눈 · ‘soft, pink skin’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; full lips.
```

### 109 · 또가스 (Koffing)

계열 기준: 또가스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 가스 구체와 멍한 눈을 둥근 얼굴과 낮은 윗눈꺼풀로 옮긴다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘vacant eyes’ → 눈매 살짝 처진 부드러운 눈 · ‘vacant eyes’ → 눈꼬리 각도 처진 눈꼬리 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; fine soft arches; small delicate nose; wide mouth.
```

### 110 · 또도가스 (Weezing)

계열 기준: 또가스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 결합된 두 구체의 둔중함을 넓은 얼굴과 긴 수평 입선으로 구분한다. 머리는 하나다.

**원작 단서:** ‘two spherical heads’ → 얼굴 폭 넓은 얼굴 · ‘two spherical heads’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘two spherical heads’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 부드럽고 둥근 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, close-set; straight medium brows; rounded soft tip nose; wide mouth.
```

### 111 · 뿔카노 (Rhyhorn)

계열 기준: 뿔카노 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**이유:** 삼각 머리와 뿔의 전방성을 높은 광대와 좁아지는 턱으로 옮긴다.

**원작 단서:** ‘gray, rocky plates’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘gray, rocky plates’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘gray, rocky plates’ → 눈매 가늘고 날카로운 눈 · ‘gray, rocky plates’ → 눈썹 굵고 눈 가까이 낮은 · ‘gray, rocky plates’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; straight even lips.
```

### 112 · 코뿌리 (Rhydon)

계열 기준: 뿔카노 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 드릴 뿔과 단단한 체적을 넓고 각진 턱과 낮은 눈매로 구분한다.

**원작 단서:** ‘several other spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘several other spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘several other spikes’ → 눈매 가늘고 날카로운 눈 · ‘several other spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 굵고 눈 가까이 낮은 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, close-set; angled brows; balanced nose; wide mouth.
```

### 113 · 럭키 (Chansey)

계열 기준: 핑복 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 알 모양 몸과 작은 눈을 넓고 둥근 얼굴 및 작고 부드러운 눈으로 옮긴다.

**원작 단서:** ‘tiny eyes’ → 눈매 가늘고 날카로운 눈 · ‘tiny eyes’ → 눈 크기 작은 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, small size, upturned outer corners, average spacing; fine soft arches; rounded soft tip nose; medium lips.
```

### 114 · 덩쿠리 (Tangela)

계열 기준: 덩쿠리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 덩굴 사이에 드러난 작은 중심 얼굴을 작은 코와 둥근 눈으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; small mouth.
```

### 115 · 캥카 (Kangaskhan)

계열 기준: 캥카 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 가족을 지키는 특징과 큰 체적을 넓은 얼굴과 안정적인 수평 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘thick, black plate’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, close-set; thick low brows; rounded soft tip nose; full lips.
```

### 116 · 쏘드라 (Horsea)

계열 기준: 쏘드라 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 작은 |

**이유:** 해마의 관형 입과 말린 곡선을 가는 긴 코와 작은 둥근 입으로 옮긴다.

**원작 단서:** 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · ‘long, tubular mouth’ → 입술 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; long nose with low tip; small mouth.
```

### 117 · 시드라 (Seadra)

계열 기준: 쏘드라 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 도톰한 입술 |

**이유:** 날카로워진 지느러미와 해마의 긴 선을 긴 얼굴과 좁은 눈매로 구분한다.

**원작 단서:** 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; long nose with low tip; full lips.
```

### 118 · 콘치 (Goldeen)

계열 기준: 콘치 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 금붕어의 유연한 지느러미와 두드러진 입술을 곡선 눈썹과 도톰한 입술로 옮긴다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘strongest, thickest horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘prominent pink lips’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; small delicate nose; full lips.
```

### 119 · 왕콘치 (Seaking)

계열 기준: 콘치 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 금붕어의 커진 체적과 두드러진 입술을 넓은 볼과 도톰한 입술로 구분한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘cream-colored horn’ → 눈매 가늘고 날카로운 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘prominent pink lips’ → 입술 도톰한 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; rounded soft tip nose; full lips.
```

### 120 · 별가사리 (Staryu)

계열 기준: 별가사리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 별의 방사 대칭과 중심 보석을 균형 잡힌 광대와 또렷한 중심 비율로 해석한다.

**원작 단서:** ‘faceted skin’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘faceted skin’ → 눈매 가늘고 날카로운 눈 · 몸 형태 blob → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; small mouth.
```

### 121 · 아쿠스타 (Starmie)

계열 기준: 별가사리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 겹친 별의 각진 대칭을 더 각진 윤곽과 가늘고 긴 눈으로 구분한다.

**원작 단서:** ‘faceted skin’ → 얼굴형 각지고 선명한 얼굴형 · ‘faceted skin’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘faceted skin’ → 눈매 가늘고 날카로운 눈 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · ‘faceted skin’ → 눈썹 바깥에서 꺾이는 사선 · ‘faceted skin’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, wide-set; angled brows; balanced nose; thin lips.
```

### 122 · 마임맨 (Mr. Mime)

계열 기준: 흉내내 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 마임의 큰 표현과 둥근 머리를 넓은 상안면과 선명한 입술 곡선으로 해석한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘round, white body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round, white body’ → 눈매 큰 눈 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 부드럽고 둥근 턱

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 123 · 스라크 (Scyther)

계열 기준: 스라크 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 낫과 사마귀의 날카로운 윤곽을 높은 광대와 치켜올라간 긴 눈으로 옮긴다.

**원작 단서:** ‘three blunt horns’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘three blunt horns’ → 눈매 강하게 치켜올라간 눈 · ‘three blunt horns’ → 눈꼬리 각도 올라간 눈꼬리 · ‘three blunt horns’ → 눈썹 바깥에서 꺾이는 사선 · ‘three blunt horns’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 턱선과 골격이 날카로운 얼굴형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 124 · 루주라 (Jynx)

계열 기준: 뽀뽀라 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 두드러진 분홍 입술과 풍성한 머리 실루엣을 도톰한 입술과 완만한 타원 얼굴로 옮긴다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; rounded soft tip nose; full lips.
```

### 125 · 에레브 (Electabuzz)

계열 기준: 에레키드 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 번개 같은 줄무늬와 힘 있는 체적을 각진 얼굴과 굵은 사선 눈썹으로 해석한다.

**원작 단서:** ‘two large fangs’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two long tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; feathered full brows; small delicate nose; wide mouth.
```

### 126 · 마그마 (Magmar)

계열 기준: 마그비 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 불꽃의 솟는 선과 오므린 부리를 또렷한 눈매와 중심이 도톰한 사람 입술로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘red spikes’ → 눈매 가늘고 날카로운 눈 · ‘red spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘puckered tan beak’ → 입술 도톰한 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; rounded soft tip nose; full lips.
```

### 127 · 쁘사이저 (Pinsir)

계열 기준: 쁘사이저 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 집게뿔의 평행한 날과 삼각 원작 눈을 각진 턱과 삼각 인상의 긴 눈으로 옮긴다.

**원작 단서:** ‘triangular eyes’ → 눈매 강하게 치켜올라간 눈 · ‘triangular eyes’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 각지고 선명한 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 128 · 켄타로스 (Tauros)

계열 기준: 켄타로스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 성난 소의 강한 이마와 갈기를 넓은 광대 및 굵고 낮은 눈썹으로 해석한다.

**원작 단서:** ‘gray horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘gray horns’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘gray horns’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, wide-set; thick low brows; balanced nose; wide mouth.
```

### 129 · 잉어킹 (Magikarp)

계열 기준: 잉어킹 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 크고 멍한 눈과 두드러진 입술을 큰 둥근 사람 눈과 도톰한 입술로 옮긴다.

**원작 단서:** 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; fuller lower lip.
```

### 130 · 갸라도스 (Gyarados)

계열 기준: 잉어킹 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 흉악한 용의 큰 턱과 긴 선을 각진 하관과 긴 콧대로 구분한다.

**원작 단서:** ‘long serpentine body’ → 얼굴형 길고 세련된 얼굴형 · ‘long serpentine body’ → 얼굴 길이 긴 얼굴 · ‘long serpentine body’ → 코 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; thick low brows; long nose with low tip; wide mouth.
```

### 131 · 라프라스 (Lapras)

계열 기준: 라프라스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 물 위를 운반하는 부드러운 실루엣을 긴 타원 윤곽과 완만한 눈매로 해석한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘long neck’ → 눈매 아몬드형 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, wide-set; fine soft arches; balanced nose; medium lips.
```

### 132 · 메타몽 (Ditto)

계열 기준: 메타몽 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 단순한 점눈과 부드럽게 변하는 몸을 작은 둥근 사람 눈과 완만한 얼굴로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘tiny eyes and simple smiling mouth’ → 눈 크기 작은 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; fine soft arches; small delicate nose; medium lips.
```

### 133 · 이브이 (Eevee)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 작은 여우형 얼굴과 목의 풍성한 털을 작은 턱과 부드러운 볼로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘small black nose’ → 코 작고 여린 코

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 134 · 샤미드 (Vaporeon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 흐르는 지느러미와 물의 선을 길고 완만한 눈매 및 타원 얼굴로 옮긴다.

**원작 단서:** ‘spiky ridge’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘tiny black nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; almond eyes, medium size, downturned outer corners, wide-set; long arched brows; small delicate nose; medium lips.
```

### 135 · 쥬피썬더 (Jolteon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 뾰족한 전기 털과 번개의 선을 각진 광대와 날카로운 눈꼬리로 구분한다.

**원작 단서:** ‘small nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운, 코 곧고 가는 콧대 → 작고 여린 코

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, close-set; angled brows; small delicate nose; thin lips.
```

### 136 · 부스터 (Flareon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 풍성한 불꽃색 털을 둥근 볼과 도톰한 입술로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; balanced nose; full lips.
```

### 137 · 폴리곤 (Porygon)

계열 기준: 폴리곤 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 다면체 머리와 기하학적 눈을 각진 사람 윤곽과 정돈된 눈 간격으로 옮긴다.

**원작 단서:** ‘pink, polyhedral head’ → 얼굴형 각지고 선명한 얼굴형 · ‘pink, polyhedral head’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘pink, polyhedral head’ → 눈매 가늘고 날카로운 눈 · ‘blue beak’ → 코 크고 또렷한 코 · ‘pink, polyhedral head’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; prominent defined nose; thin lips.
```

### 138 · 암나이트 (Omanyte)

계열 기준: 암나이트 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 나선 껍질과 접시 같은 큰 눈을 둥근 얼굴과 큰 둥근 사람 눈으로 옮긴다.

**원작 단서:** 몸 형태 tentacles → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘large saucer-like eyes’ → 눈매 큰 눈 · ‘large saucer-like eyes’ → 눈 크기 큰 눈 · 몸 형태 tentacles → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 이마가 넓고 턱이 가는 하트형

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 139 · 암스타 (Omastar)

계열 기준: 암나이트 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 나선 껍질과 송곳니 같은 입의 힘을 넓은 턱과 좁은 눈으로 구분한다.

**원작 단서:** ‘several sharp spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘several sharp spikes’ → 눈매 가늘고 날카로운 눈 · ‘several sharp spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; angled brows; balanced nose; wide mouth.
```

### 140 · 투구 (Kabuto)

계열 기준: 투구 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 낮고 단단한 껍질 아래 눈을 짧은 중안부와 작고 깊은 눈매로 해석한다.

**원작 단서:** 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; narrow eyes, small size, upturned outer corners, average spacing; straight medium brows; small delicate nose; thin lips.
```

### 141 · 투구푸스 (Kabutops)

계열 기준: 투구 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 반원형 머리와 낫의 긴 선을 긴 얼굴과 또렷한 턱끝으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; straight slender bridge nose; thin lips.
```

### 142 · 프테라 (Aerodactyl)

계열 기준: 프테라 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 공룡의 능선진 주둥이와 날개의 예리함을 각진 광대와 긴 코로 옮긴다.

**원작 단서:** ‘serrated fangs’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small sharply pointed ears’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, close-set; angled brows; long nose with low tip; wide mouth.
```

### 143 · 잠만보 (Snorlax)

계열 기준: 먹고자 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 잠과 큰 둥근 체적을 넓은 볼과 낮은 윗눈꺼풀로 해석한다.

**원작 단서:** 무게 460kg → 얼굴 폭 넓은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; drooping eyes, medium size, downturned outer corners, average spacing; fine soft arches; balanced nose; full lips.
```

### 144 · 프리져 (Articuno)

계열 기준: 프리져 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 얼음새의 흐르는 꼬리와 원형 원작 눈을 긴 윤곽과 부드러운 아몬드형 눈으로 해석한다.

**원작 단서:** ‘circular red eyes’ → 눈꼬리 각도 수평 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘short gray beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, close-set; long arched brows; straight slender bridge nose; thin lips.
```

### 145 · 썬더 (Zapdos)

계열 기준: 썬더 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 번개 깃과 작은 삼각 눈을 높은 광대와 날카로운 긴 눈으로 옮긴다.

**원작 단서:** ‘small, triangular eyes’ → 눈매 강하게 치켜올라간 눈 · ‘small, triangular eyes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘small, triangular eyes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; long nose with low tip; thin lips.
```

### 146 · 파이어 (Moltres)

계열 기준: 파이어 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**이유:** 흐르는 불꽃 깃을 타원 얼굴의 긴 곡선과 선명한 입술로 해석한다.

**원작 단서:** ‘long, flowing head crest’ → 얼굴형 길고 세련된 얼굴형 · ‘long, flowing head crest’ → 얼굴 길이 긴 얼굴 · ‘long, flowing head crest’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘long, flowing head crest’ → 눈썹 길고 바깥 아치가 선명한 · ‘pointed, brown beak’ → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; long arched brows; straight slender bridge nose; full lips.
```

### 147 · 미뇽 (Dratini)

계열 기준: 미뇽 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 매끈하고 둥근 용의 실루엣을 부드러운 타원 얼굴과 짧은 코로 옮긴다.

**원작 단서:** ‘blue serpentine body’ → 얼굴 길이 긴 얼굴

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; small mouth.
```

### 148 · 신뇽 (Dragonair)

계열 기준: 미뇽 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 길게 흐르는 몸과 구슬의 곡선을 긴 타원 얼굴과 고요한 눈매로 구분한다.

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · ‘rounded snout’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; rounded soft tip nose; medium lips.
```

### 149 · 망나뇽 (Dragonite)

계열 기준: 미뇽 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 친근한 큰 용의 둥근 주둥이와 큰 눈을 넓고 부드러운 얼굴로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 무게 210kg → 얼굴 폭 넓은 얼굴 · 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선 · ‘round snout’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, large size, level outer corners, average spacing; angled brows; rounded soft tip nose; full lips.
```

### 150 · 뮤츠 (Mewtwo)

계열 기준: 뮤츠 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 유전 실험에서 태어난 인공적인 긴장을 길고 정돈된 얼굴과 깊은 눈매로 해석한다.

**원작 단서:** ‘two short, blunt, ear-like horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two short, blunt, ear-like horns’ → 눈매 가늘고 날카로운 눈 · ‘two short, blunt, ear-like horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 각지고 선명한 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, close-set; straight medium brows; balanced nose; thin lips.
```

### 151 · 뮤 (Mew)

계열 기준: 뮤 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 작고 유연한 원형 실루엣과 파란 눈을 작은 턱과 맑은 둥근 눈으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; straight slender bridge nose; small mouth.
```

## 2세대 · 100종

### 152 · 치코리타 (Chikorita)

계열 기준: 치코리타 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 큰 머리와 잎의 둥근 곡선을 둥근 얼굴과 타원 눈으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, wide-set; fine soft arches; balanced nose; small mouth.
```

### 153 · 베이리프 (Bayleef)

계열 기준: 치코리타 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 길어진 목과 잎의 선을 타원 얼굴과 길어진 아몬드형 눈으로 구분한다.

**원작 단서:** ‘long, well-defined neck’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long, well-defined neck’ → 눈썹 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; balanced nose; medium lips.
```

### 154 · 메가니움 (Meganium)

계열 기준: 치코리타 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 넓은 꽃잎과 허브의 부드러운 이미지를 넓고 완만한 얼굴로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, wide-set; long arched brows; balanced nose; full lips.
```

### 155 · 브케인 (Cyndaquil)

계열 기준: 브케인 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 작은 |

**이유:** 긴 주둥이와 가늘게 보이는 눈을 긴 코와 낮은 윗눈꺼풀로 옮긴다.

**원작 단서:** ‘long, thin snout’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; angled brows; long nose with low tip; small mouth.
```

### 156 · 마그케인 (Quilava)

계열 기준: 브케인 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 삼각 붉은 눈과 길게 뻗은 몸을 긴 얼굴과 날카로운 눈으로 구분한다.

**원작 단서:** ‘long and slender body’ → 얼굴형 길고 세련된 얼굴형 · ‘long and slender body’ → 얼굴 길이 긴 얼굴 · ‘long and slender body’ → 얼굴 폭 좁은 얼굴 · ‘long and slender body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘triangular red eyes’ → 눈매 강하게 치켜올라간 눈 · ‘triangular red eyes’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; rounded soft tip nose; thin lips.
```

### 157 · 블레이범 (Typhlosion)

계열 기준: 브케인 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 짧고 둥근 주둥이와 화산의 힘을 넓은 하관과 작은 날카로운 눈으로 옮긴다.

**원작 단서:** ‘long, yet agile body’ → 얼굴 길이 긴 얼굴 · ‘small, triangular eyes’ → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘short, rounded snout’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): oval face, long length, wide width; wide heavy chin; sharp eyes, small size, level outer corners, wide-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 158 · 리아코 (Totodile)

계열 기준: 리아코 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 큰 턱과 활발한 악어의 윤곽을 넓은 입과 열린 둥근 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘well-developed jaws’ → 얼굴 폭 넓은 얼굴 · ‘well-developed jaws’ → 턱선 · 턱끝 넓고 묵직한 턱끝

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; wide mouth.
```

### 159 · 엘리게이 (Croconaw)

계열 기준: 리아코 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**이유:** 강해진 악어 턱과 붉은 눈을 각진 하관과 수평으로 긴 눈으로 구분한다.

**원작 단서:** ‘red spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘red spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘red spikes’ → 눈매 가늘고 날카로운 눈 · ‘red spikes’ → 눈썹 굵고 눈 가까이 낮은 · ‘red spikes’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; straight even lips.
```

### 160 · 장크로다일 (Feraligatr)

계열 기준: 리아코 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**이유:** 거대한 악어 턱을 넓고 단단한 사람 턱과 낮은 눈매로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘large, powerful jaws’ → 얼굴 폭 넓은 얼굴 · ‘large, powerful jaws’ → 턱선 · 턱끝 넓고 묵직한 턱끝 · ‘several sharp fangs’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, average spacing; thick low brows; balanced nose; straight even lips.
```

### 161 · 꼬리선 (Sentret)

계열 기준: 꼬리선 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 주위를 살피는 망보기 특징을 열린 눈과 또렷한 눈 간격으로 해석한다.

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round body’ → 눈썹 가늘고 완만한 곡선 · ‘round body’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 162 · 다꼬리 (Furret)

계열 기준: 꼬리선 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 길고 부드러운 몸통을 긴 타원 윤곽과 완만한 눈매로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, close-set; fine soft arches; rounded soft tip nose; medium lips.
```

### 163 · 부우부 (Hoothoot)

계열 기준: 부우부 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 부엉이의 둥근 몸과 눈 주위 구조를 둥근 얼굴과 굵은 눈썹으로 옮긴다.

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 얼굴 길이 짧은 얼굴 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round body’ → 눈매 큰 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; thick low brows; straight slender bridge nose; small mouth.
```

### 164 · 야부엉 (Noctowl)

계열 기준: 부우부 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 길어진 부엉이 몸과 뿔 같은 눈썹 실루엣을 긴 얼굴과 사선 눈썹으로 구분한다.

**원작 단서:** ‘bushy, cream-colored feather horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘bushy, cream-colored feather horns’ → 눈매 가늘고 날카로운 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘bushy, cream-colored feather horns’ → 눈썹 바깥에서 꺾이는 사선 · ‘bushy, cream-colored feather horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; balanced nose; thin lips.
```

### 165 · 레디바 (Ledyba)

계열 기준: 레디바 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 둥근 무당벌레 몸과 점무늬를 둥근 볼과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 몸 형태 wings → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, close-set; fine soft arches; straight slender bridge nose; small mouth.
```

### 166 · 레디안 (Ledian)

계열 기준: 레디바 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**이유:** 정돈된 날개와 성장한 무당벌레 실루엣을 타원 얼굴과 또렷한 눈매로 구분한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 몸 형태 wings → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; straight slender bridge nose; medium lips.
```

### 167 · 페이검 (Spinarak)

계열 기준: 페이검 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 거미의 둥근 몸과 작은 눈을 짧은 얼굴과 둥근 사람 눈으로 해석한다.

**원작 단서:** ‘white horn’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; angled brows; small delicate nose; small mouth.
```

### 168 · 아리아도스 (Ariados)

계열 기준: 페이검 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 긴 다리와 예리한 거미 윤곽을 긴 얼굴과 치켜올라간 눈매로 구분한다.

**원작 단서:** ‘white horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘white horn’ → 눈매 강하게 치켜올라간 눈 · ‘white horn’ → 눈꼬리 각도 올라간 눈꼬리 · ‘white horn’ → 눈썹 바깥에서 꺾이는 사선 · ‘white horn’ → 코 크고 또렷한 코 · ‘white horn’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 곧고 가는 콧대 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; prominent defined nose; thin lips.
```

### 169 · 크로뱃 (Crobat)

계열 기준: 주뱃 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 네 날개의 날카로운 방향과 작은 입을 높은 광대와 좁고 긴 눈으로 옮긴다.

**원작 단서:** 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘small mouth’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, small size, level outer corners, average spacing; angled brows; straight slender bridge nose; small mouth.
```

### 170 · 초라기 (Chinchou)

계열 기준: 초라기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 작은 |

**이유:** 큰 노란 눈과 유인등의 둥근 반복을 큰 둥근 사람 눈과 짧은 얼굴로 옮긴다.

**원작 단서:** ‘round, blue body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, blue body’ → 얼굴 길이 짧은 얼굴 · ‘round, blue body’ → 얼굴 폭 넓은 얼굴 · ‘round, blue body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round, blue body’ → 눈매 큰 눈 · ‘large yellow eyes’ → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; short nose with upturned tip; small mouth.
```

### 171 · 랜턴 (Lanturn)

계열 기준: 초라기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 큰 붉은 눈과 유선형 몸을 긴 타원 얼굴과 부드러운 둥근 눈으로 구분한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 보통 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; fuller lower lip.
```

### 172 · 피츄 (Pichu)

계열 기준: 피츄 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 작은 쥐의 날카로운 귀와 둥근 볼을 작은 턱과 열린 눈매로 해석한다. 인물 나이는 성인이다.

**원작 단서:** ‘tiny nose’ → 코 작고 여린 코

**조정:** 같은 계열 피카츄와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 입이 작은 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; medium lips.
```

### 173 · 삐 (Cleffa)

계열 기준: 삐 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 별 실루엣과 점눈을 둥근 얼굴과 작은 또렷한 사람 눈으로 해석한다.

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · ‘two small black eyes’ → 눈매 가늘고 날카로운 눈 · ‘two small black eyes’ → 눈 크기 작은 눈 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · ‘small mouth’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; narrow eyes, small size, upturned outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 174 · 푸푸린 (Igglybuff)

계열 기준: 푸푸린 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 풍선 몸과 말린 앞머리를 둥근 볼과 완만한 타원 눈으로 해석한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 같은 계열 푸린와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 이마가 넓고 턱이 가는 하트형

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; bow-shaped upper lip.
```

### 175 · 토게피 (Togepi)

계열 기준: 토게피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 알의 타원형과 가는 타원 눈을 작은 턱과 세로형 타원 눈으로 해석한다.

**원작 단서:** ‘five round-tipped, conical spikes’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘five round-tipped, conical spikes’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘five round-tipped, conical spikes’ → 눈매 큰 눈 · ‘five round-tipped, conical spikes’ → 눈썹 가늘고 완만한 곡선 · ‘five round-tipped, conical spikes’ → 코 코끝이 둥근 · ‘five round-tipped, conical spikes’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; small mouth.
```

### 176 · 토게틱 (Togetic)

계열 기준: 토게피 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 행복과 가벼운 날개의 이미지를 길어진 타원 얼굴과 완만한 눈매로 구분한다.

**원작 단서:** ‘relatively long neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘relatively long neck’ → 눈매 아몬드형 눈 · ‘relatively long neck’ → 눈썹 길고 바깥 아치가 선명한 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 턱끝이 길고 턱선이 또렷한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 177 · 네이티 (Natu)

계열 기준: 네이티 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 작은 새의 둥근 몸과 짧은 부리를 둥근 얼굴과 짧은 사람 코로 옮긴다.

**원작 단서:** ‘nearly spherical body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘nearly spherical body’ → 얼굴 길이 짧은 얼굴 · ‘nearly spherical body’ → 얼굴 폭 넓은 얼굴 · ‘nearly spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘nearly spherical body’ → 눈매 큰 눈 · ‘yellow beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; small mouth.
```

### 178 · 네이티오 (Xatu)

계열 기준: 네이티 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 얇은 입술 |

**이유:** 토템 같은 직립 실루엣과 긴 부리를 긴 얼굴과 고요한 수평 눈매로 구분한다.

**원작 단서:** ‘two long, red feather crests’ → 얼굴형 길고 세련된 얼굴형 · ‘two long, red feather crests’ → 얼굴 길이 긴 얼굴 · ‘two long, red feather crests’ → 얼굴 폭 좁은 얼굴 · ‘two long, red feather crests’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘long, slightly hooked beak’ → 코 콧대가 볼록한 매부리코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; aquiline nose with convex bridge; thin lips.
```

### 179 · 메리프 (Mareep)

계열 기준: 메리프 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 도톰한 입술 |

**이유:** 풍성한 솜털을 둥근 볼과 부드러운 코끝으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; short nose with upturned tip; full lips.
```

### 180 · 보송송 (Flaaffy)

계열 기준: 메리프 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 보통 |

**이유:** 줄어든 솜털과 매끈해진 윤곽을 더 긴 타원 얼굴로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; short nose with upturned tip; medium lips.
```

### 181 · 전룡 (Ampharos)

계열 기준: 메리프 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 길어진 목과 등대 같은 발광 특징을 긴 윤곽과 안정적인 눈매로 해석한다.

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, average spacing; straight medium brows; balanced nose; medium lips.
```

### 182 · 아르코 (Bellossom)

계열 기준: 뚜벅쵸 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 꽃과 춤의 부드러운 원형 리듬을 둥근 얼굴과 둥근 눈으로 해석한다.

**원작 단서:** 키 0.4m → 얼굴 길이 짧은 얼굴 · ‘circular blue eyes’ → 눈매 큰 눈 · ‘circular blue eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; bow-shaped upper lip.
```

### 183 · 마릴 (Marill)

계열 기준: 루리리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 물쥐의 구형 몸과 둥근 귀를 둥근 볼과 작고 또렷한 눈으로 옮긴다.

**원작 단서:** 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 작은 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; small delicate nose; fuller lower lip.
```

### 184 · 마릴리 (Azumarill)

계열 기준: 루리리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 토끼 귀와 큰 물방울 체적을 긴 타원 얼굴과 큰 둥근 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘ovoid body’ → 얼굴 길이 짧은 얼굴 · ‘ovoid body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘ovoid body’ → 눈매 큰 눈 · ‘ovoid body’ → 눈썹 가늘고 완만한 곡선 · ‘ovoid body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; full lips.
```

### 185 · 꼬지모 (Sudowoodo)

계열 기준: 꼬지지 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 나무를 흉내 내는 뻣뻣한 가지 실루엣을 긴 얼굴과 정돈된 직선 눈썹으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 186 · 왕구리 (Politoed)

계열 기준: 발챙이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 개구리의 둥근 얼굴과 말린 머리 선을 둥근 눈과 넓은 입으로 해석한다.

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; long arched brows; rounded soft tip nose; wide mouth.
```

### 187 · 통통코 (Hoppip)

계열 기준: 통통코 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 가볍게 뜨는 작은 솜풀 실루엣을 작은 턱과 열린 둥근 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; small mouth.
```

### 188 · 두코 (Skiploom)

계열 기준: 통통코 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 꽃과 타원형 원작 눈을 타원 얼굴과 완만한 곡선 눈썹으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘round green body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round green body’ → 눈매 큰 눈 · ‘round green body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, close-set; long arched brows; rounded soft tip nose; bow-shaped upper lip.
```

### 189 · 솜솜코 (Jumpluff)

계열 기준: 통통코 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 작은 |

**이유:** 둥근 솜뭉치와 작은 붉은 눈을 둥근 얼굴 안의 작은 또렷한 눈으로 구분한다.

**원작 단서:** ‘red, pupilless, beady eyes’ → 눈 크기 작은 눈

**조정:** 같은 계열 통통코와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; prominent defined nose; small mouth.
```

### 190 · 에이팜 (Aipom)

계열 기준: 에이팜 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 긴 손꼬리와 장난스러운 기질을 열린 눈매와 넓은 입 너비로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; long arched brows; small delicate nose; wide mouth.
```

### 191 · 해너츠 (Sunkern)

계열 기준: 해너츠 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 씨앗의 타원형과 작은 원작 눈을 타원 얼굴과 작고 둥근 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘beady eyes’ → 눈 크기 작은 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; fine soft arches; small delicate nose; small mouth.
```

### 192 · 해루미 (Sunflora)

계열 기준: 해너츠 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 해바라기의 둥근 중심과 펼친 꽃잎을 둥근 얼굴과 넓고 완만한 입선으로 해석한다.

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 얼굴 길이 짧은 얼굴 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round body’ → 눈썹 짧고 둥근 · ‘round body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; short rounded brows; rounded soft tip nose; wide mouth.
```

### 193 · 왕자리 (Yanma)

계열 기준: 왕자리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 잠자리의 큰 눈과 긴 몸을 긴 얼굴과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · 몸 형태 bug-wings → 눈 크기 큰 눈 · ‘two gray spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 아래로 갈수록 좁아지는 턱끝

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 194 · 우파 (Wooper)

계열 기준: 우파 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 둥근 작은 눈과 부드러운 수어 몸을 둥근 얼굴과 넓은 입으로 옮긴다.

**원작 단서:** 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, close-set; fine soft arches; small delicate nose; wide mouth.
```

### 195 · 누오 (Quagsire)

계열 기준: 우파 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 넓은 머리와 작은 눈을 넓은 볼과 작고 또렷한 사람 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘little neck’ → 얼굴 길이 긴 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴

```text
FACE (her own structure, not the style's default face): oval face, long length, wide width; wide heavy chin; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; wide mouth.
```

### 196 · 에브이 (Espeon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 가느다란 몸과 갈라진 꼬리 및 중심 보석을 작은 턱과 정돈된 긴 눈으로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, wide-set; long arched brows; small delicate nose; thin lips.
```

### 197 · 블래키 (Umbreon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 매끈한 검은 몸과 고리 무늬의 절제된 대비를 긴 윤곽과 낮고 긴 눈으로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long, pointed ears’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, small size, level outer corners, wide-set; long arched brows; balanced nose; thin lips.
```

### 198 · 니로우 (Murkrow)

계열 기준: 니로우 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 비뚤어진 부리와 모자 같은 볏을 높은 광대와 날카로운 코끝으로 옮긴다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘feathery tufts’ → 눈썹 숱 많고 결이 보이는 · ‘crooked, yellow beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, close-set; feathered full brows; straight slender bridge nose; thin lips.
```

### 199 · 야도킹 (Slowking)

계열 기준: 야돈 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 느긋한 계열 얼굴에 왕관의 안정감을 더해 넓은 볼과 고요한 눈매로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘two horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · 에스퍼 타입 → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; balanced nose; full lips.
```

### 200 · 무우마 (Misdreavus)

계열 기준: 무우마 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 흐르는 머리와 큰 붉은 눈 및 놀래키는 기질을 작은 턱과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 눈 크기 큰 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, wide-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 201 · 안농 (Unown)

계열 기준: 안농 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 문자 실루엣의 대칭과 중심 원형 눈을 정돈된 얼굴과 대칭인 두 원형 사람 눈으로 옮긴다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘one round eye with white sclera’ → 눈매 큰 눈 · ‘one round eye with white sclera’ → 눈꼬리 각도 수평 · ‘one round eye with white sclera’ → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; thin lips.
```

### 202 · 마자용 (Wobbuffet)

계열 기준: 마자 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 부드러운 몸과 먼저 공격하지 않는 특징을 긴 얼굴과 낮은 눈꺼풀로 해석한다.

**원작 단서:** ‘soft body’ → 눈썹 가늘고 완만한 곡선 · ‘soft body’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; wide mouth.
```

### 203 · 키링키 (Girafarig)

계열 기준: 키링키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**이유:** 긴 목과 둥근 코를 긴 윤곽 및 둥근 코끝을 가진 긴 콧대로 옮긴다.

**원작 단서:** ‘long neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘long neck’ → 얼굴 폭 좁은 얼굴 · ‘long neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long neck’ → 눈매 아몬드형 눈 · ‘long neck’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; long nose with low tip; medium lips.
```

### 204 · 피콘 (Pineco)

계열 기준: 피콘 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 겹친 솔방울 껍질 틈의 눈을 각진 광대와 작고 깊은 사람 눈으로 옮긴다.

**원작 단서:** ‘single upper spike’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘single upper spike’ → 눈매 가늘고 날카로운 눈 · ‘single upper spike’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘single upper spike’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, small size, upturned outer corners, wide-set; straight medium brows; small delicate nose; thin lips.
```

### 205 · 쏘콘 (Forretress)

계열 기준: 피콘 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 단단한 구형 껍질과 층의 수평선을 넓은 얼굴과 긴 수평 눈매로 구분한다.

**원작 단서:** ‘outer plates’ → 눈매 가늘고 날카로운 눈 · ‘outer plates’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; thin lips.
```

### 206 · 노고치 (Dunsparce)

계열 기준: 노고치 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 둥근 머리와 넓은 입 및 땅뱀의 긴 몸을 긴 얼굴과 넓은 입으로 해석한다.

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · ‘round head’ → 눈썹 짧고 둥근 · ‘round head’ → 코 코끝이 둥근 · ‘wide mouth’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, close-set; short rounded brows; rounded soft tip nose; wide mouth.
```

### 207 · 글라이거 (Gligar)

계열 기준: 글라이거 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 둥근 머리와 전갈의 날카로운 갈고리 대비를 작은 턱과 올라간 눈매로 해석한다.

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 몸 형태 wings → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, close-set; long arched brows; straight slender bridge nose; wide mouth.
```

### 208 · 강철톤 (Steelix)

계열 기준: 롱스톤 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 거대한 금속 머리와 강한 턱을 넓고 각진 사람 하관으로 구분한다.

**원작 단서:** ‘long rock spikes’ → 얼굴형 길고 세련된 얼굴형 · ‘long rock spikes’ → 얼굴 길이 긴 얼굴 · ‘long rock spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long rock spikes’ → 눈매 가늘고 날카로운 눈 · ‘long rock spikes’ → 눈썹 굵고 눈 가까이 낮은 · ‘long rock spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; thick low brows; straight slender bridge nose; wide mouth.
```

### 209 · 블루 (Snubbull)

계열 기준: 블루 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 불독의 처진 얼굴 체적을 넓은 볼과 내려간 눈꼬리로 해석한다.

**원작 단서:** ‘powerful jaws’ → 얼굴 폭 넓은 얼굴 · ‘powerful jaws’ → 턱선 · 턱끝 넓고 묵직한 턱끝 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, average spacing; thick low brows; rounded soft tip nose; bow-shaped upper lip.
```

### 210 · 그랑블루 (Granbull)

계열 기준: 블루 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 강해진 불독의 턱을 각진 하관과 깊은 수평 눈매로 구분한다.

**원작 단서:** ‘two small fangs’ → 턱선 · 턱끝 각지고 또렷한 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 211 · 침바루 (Qwilfish)

계열 기준: 침바루 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 부풀린 몸과 가시 및 두툼한 입술의 대비를 둥근 얼굴 안의 날카로운 눈으로 해석한다.

**원작 단서:** ‘spherical body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical body’ → 얼굴 길이 짧은 얼굴 · ‘spherical body’ → 얼굴 폭 넓은 얼굴 · ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘sharp, conical spikes’ → 눈매 가늘고 날카로운 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; full lips.
```

### 212 · 핫삼 (Scizor)

계열 기준: 스라크 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 금속 집게와 매끈한 장갑의 선을 단단한 윤곽과 정돈된 수평 눈매로 구분한다.

**원작 단서:** ‘three blunt horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘three blunt horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three blunt horns’ → 눈매 가늘고 날카로운 눈 · ‘rounded head’ → 눈썹 짧고 둥근 · ‘three blunt horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; short rounded brows; balanced nose; thin lips.
```

### 213 · 단단지 (Shuckle)

계열 기준: 단단지 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 작은 |

**이유:** 껍질에서 뻗은 가는 목과 작은 머리를 긴 콧대와 작은 눈으로 해석한다.

**원작 단서:** 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; long nose with low tip; small mouth.
```

### 214 · 헤라크로스 (Heracross)

계열 기준: 헤라크로스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 외뿔의 강한 중심축과 타원 눈을 넓고 균형 잡힌 얼굴로 옮긴다.

**원작 단서:** ‘long, pronged horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘long, pronged horn’ → 턱선 · 턱끝 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; open rounded eyes, medium size, downturned outer corners, average spacing; straight medium brows; rounded soft tip nose; medium lips.
```

### 215 · 포푸니 (Sneasel)

계열 기준: 포푸니 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 갈고리 발톱과 가느다란 몸의 예리함을 작은 턱과 날카로운 긴 눈으로 옮긴다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈 · 악 타입 → 눈썹 바깥에서 꺾이는 사선 · 얼음 타입 → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 올라간 눈꼬리 → 수평

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 216 · 깜지곰 (Teddiursa)

계열 기준: 깜지곰 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 아기곰의 둥근 귀와 볼을 둥근 얼굴과 작은 곡선 입술로 해석한다. 성인 비율을 유지한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; rounded soft tip nose; bow-shaped upper lip.
```

### 217 · 링곰 (Ursaring)

계열 기준: 깜지곰 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 굴곡 없이 곧은 |

**이유:** 큰 곰의 둔중한 체적과 강한 주둥이를 넓은 하관과 굵은 눈썹으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘small, visible fangs’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; straight even lips.
```

### 218 · 마그마그 (Slugma)

계열 기준: 마그마그 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 흐르는 용암과 큰 둥근 눈을 완만한 타원 얼굴과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · ‘small pupils’ → 눈 크기 작은 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 눈 크기 큰 눈 → 작은 눈

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; full lips.
```

### 219 · 마그카르고 (Magcargo)

계열 기준: 마그마그 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 달팽이 껍질과 둥근 코 및 넓은 입을 둥근 볼과 넓은 입으로 구분한다.

**원작 단서:** ‘oval eyes’ → 눈매 큰 눈 · ‘wide mouth’ → 입술 입이 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, average spacing; straight medium brows; rounded soft tip nose; wide mouth.
```

### 220 · 꾸꾸리 (Swinub)

계열 기준: 꾸꾸리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 털에 묻힌 가는 눈과 둥근 코를 낮은 눈꺼풀과 둥근 사람 코끝으로 옮긴다.

**원작 단서:** ‘small rounded porcine body’ → 얼굴 폭 넓은 얼굴 · ‘small rounded porcine body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘small rounded porcine body’ → 눈썹 가늘고 완만한 곡선 · ‘small rounded porcine body’ → 코 코끝이 둥근 · ‘small rounded porcine body’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; fine soft arches; rounded soft tip nose; small mouth.
```

### 221 · 메꾸리 (Piloswine)

계열 기준: 꾸꾸리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 멧돼지의 큰 털 체적과 작은 눈을 넓은 얼굴과 작은 깊은 눈으로 구분한다.

**원작 단서:** ‘two beady eyes’ → 눈매 가늘고 날카로운 눈 · ‘two beady eyes’ → 눈 크기 작은 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long fur’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, upturned outer corners, wide-set; thick low brows; straight slender bridge nose; wide mouth.
```

### 222 · 코산호 (Corsola)

계열 기준: 코산호 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 산호의 갈라진 곡선과 타원 눈을 작은 턱과 완만한 곡선 눈썹으로 해석한다.

**원작 단서:** ‘smaller, blunt horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘oval-shaped black eyes’ → 눈매 큰 눈 · ‘smiling mouth’ → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, downturned outer corners, wide-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 223 · 총어 (Remoraid)

계열 기준: 총어 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 접시 같은 눈과 분사하는 작은 몸을 큰 둥근 사람 눈과 작은 입으로 해석한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘saucer-like eyes’ → 눈매 큰 눈 · ‘saucer-like eyes’ → 눈 크기 큰 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; straight medium brows; small delicate nose; small mouth.
```

### 224 · 대포무노 (Octillery)

계열 기준: 총어 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 단단한 둥근 머리와 포탑 같은 입을 넓은 볼과 중심이 도톰한 입술로 구분한다.

**원작 단서:** ‘large, round eyes’ → 눈매 큰 눈 · ‘large, round eyes’ → 눈꼬리 각도 수평 · ‘rock-hard head’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; thick low brows; small delicate nose; full lips.
```

### 225 · 딜리버드 (Delibird)

계열 기준: 딜리버드 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 배달하는 친근함과 둥근 새 실루엣을 완만한 타원 얼굴로 해석한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, close-set; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 226 · 만타인 (Mantine)

계열 기준: 타만타 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 가오리의 넓은 날개와 작은 눈 및 입을 넓은 얼굴과 작은 이목구비로 옮긴다.

**원작 단서:** 무게 220kg → 얼굴 폭 넓은 얼굴 · ‘beady eyes’ → 눈 크기 작은 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘small mouth’ → 입술 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, small size, level outer corners, close-set; fine soft arches; small delicate nose; small mouth.
```

### 227 · 무장조 (Skarmory)

계열 기준: 무장조 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 강철 날개와 뾰족한 부리를 긴 윤곽과 긴 직선 콧대로 옮긴다.

**원작 단서:** ‘triangular crest’ → 얼굴형 각지고 선명한 얼굴형 · ‘long, metallic blue neck’ → 얼굴 길이 긴 얼굴 · ‘long, metallic blue neck’ → 얼굴 폭 좁은 얼굴 · ‘long, metallic blue neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘triangular crest’ → 눈매 가늘고 날카로운 눈 · ‘triangular crest’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 각지고 선명한 얼굴형, 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 228 · 델빌 (Houndour)

계열 기준: 델빌 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 작은 사냥개의 날카로운 골격 선을 타원 얼굴와 뾰족한 사람 코끝으로 해석한다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈 · 불꽃 타입 → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 곧고 가는 콧대 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; balanced nose; thin lips.
```

### 229 · 헬가 (Houndoom)

계열 기준: 델빌 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 큰 뿔과 사냥개의 긴 주둥이를 긴 얼굴과 굵은 사선 눈썹으로 구분한다.

**원작 단서:** ‘long, curved gray horns’ → 얼굴형 길고 세련된 얼굴형 · ‘long, curved gray horns’ → 얼굴 길이 긴 얼굴 · ‘long, curved gray horns’ → 얼굴 폭 좁은 얼굴 · ‘long, curved gray horns’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long, curved gray horns’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; thin lips.
```

### 230 · 킹드라 (Kingdra)

계열 기준: 쏘드라 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 가늘고 긴 해마 주둥이와 용의 절제된 선을 긴 중안부와 가는 눈으로 구분한다.

**원작 단서:** ‘thin, blue spines’ → 얼굴형 길고 세련된 얼굴형 · ‘thin, blue spines’ → 얼굴 길이 긴 얼굴 · ‘thin, blue spines’ → 얼굴 폭 좁은 얼굴 · ‘thin, blue spines’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · ‘thin, blue spines’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, wide-set; straight medium brows; long nose with low tip; fuller lower lip.
```

### 231 · 코코리 (Phanpy)

계열 기준: 코코리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 작은 코끼리의 둥근 체적을 둥근 볼과 둥근 사람 코끝으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; balanced nose; medium lips.
```

### 232 · 코리갑 (Donphan)

계열 기준: 코코리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 장갑과 바퀴 같은 단단한 몸을 넓은 하관과 낮고 굵은 눈썹으로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; medium lips.
```

### 233 · 폴리곤2 (Porygon2)

계열 기준: 폴리곤 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 매끈해진 가상 몸의 곡면을 둥근 모서리의 타원 얼굴과 원형 눈으로 구분한다.

**원작 단서:** ‘rounded magenta artificial bird’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘rounded magenta artificial bird’ → 눈매 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘rounded magenta artificial bird’ → 눈썹 짧고 둥근 · ‘rounded magenta artificial bird’ → 코 코끝이 둥근 · ‘rounded magenta artificial bird’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; short rounded brows; rounded soft tip nose; small mouth.
```

### 234 · 노라키 (Stantler)

계열 기준: 노라키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 큰 뿔과 긴 목의 선을 긴 얼굴 및 긴 콧대로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; long arched brows; balanced nose; medium lips.
```

### 235 · 루브도 (Smeargle)

계열 기준: 루브도 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 그림장이의 느긋하고 유연한 이미지를 완만한 눈매와 넓은 입으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘round structure’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘floppy, brown ears’ → 눈꼬리 각도 처진 눈꼬리 · ‘round structure’ → 눈썹 가늘고 완만한 곡선 · ‘round structure’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; wide mouth.
```

### 236 · 배루키 (Tyrogue)

계열 기준: 배루키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 싸움꾼의 짧고 단단한 윤곽을 짧은 중안부와 굵은 직선 눈썹으로 해석한다.

**원작 단서:** 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 같은 계열 홍수몬와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; almond eyes, large size, level outer corners, average spacing; thick low brows; balanced nose; medium lips.
```

### 237 · 카포에라 (Hitmontop)

계열 기준: 배루키 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 회전과 균형의 리듬을 타원 윤곽과 균형 잡힌 눈 간격으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘single keratinous horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘single keratinous horn’ → 눈매 가늘고 날카로운 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; medium lips.
```

### 238 · 뽀뽀라 (Smoochum)

계열 기준: 뽀뽀라 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 큰 청록 눈과 두드러진 분홍 입술을 넓은 상안면과 도톰한 입술로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, close-set; long arched brows; small delicate nose; full lips.
```

### 239 · 에레키드 (Elekid)

계열 기준: 에레키드 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 전류와 플러그의 각진 중심선을 짧고 각진 얼굴과 열린 눈매로 해석한다.

**원작 단서:** ‘two horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two horns’ → 눈썹 바깥에서 꺾이는 사선 · ‘two horns’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, large size, level outer corners, average spacing; angled brows; small delicate nose; thin lips.
```

### 240 · 마그비 (Magby)

계열 기준: 마그비 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**이유:** 둥근 노란 부리와 작은 불씨의 체적을 둥근 코끝과 도톰한 입술로 해석한다.

**원작 단서:** ‘rounded, yellow beak’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; prominent defined nose; full lips.
```

### 241 · 밀탱크 (Miltank)

계열 기준: 밀탱크 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 젖소의 둥글고 넉넉한 체적을 넓은 볼과 부드러운 수평 눈매로 해석한다.

**원작 단서:** ‘two small horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘long, black, floppy ears’ → 눈꼬리 각도 처진 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; full lips.
```

### 242 · 해피너스 (Blissey)

계열 기준: 핑복 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 행복과 돌봄의 전승 및 큰 알형 몸을 넓고 완만한 얼굴로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, close-set; long arched brows; rounded soft tip nose; medium lips.
```

### 243 · 라이코 (Raikou)

계열 기준: 라이코 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 번개 줄무늬와 큰 고양잇과의 긴장을 높은 광대와 강한 사선 눈썹으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, wide-set; thick low brows; balanced nose; wide mouth.
```

### 244 · 앤테이 (Entei)

계열 기준: 앤테이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 화산 같은 체적과 큰 갈기의 위용을 넓고 단단한 하관으로 해석한다.

**원작 단서:** 무게 198kg → 얼굴 폭 넓은 얼굴 · ‘gray plates’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘gray plates’ → 눈매 가늘고 날카로운 눈 · ‘gray plates’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱, 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; narrow eyes, medium size, level outer corners, close-set; thick low brows; balanced nose; wide mouth.
```

### 245 · 스이쿤 (Suicune)

계열 기준: 스이쿤 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 오로라처럼 흐르는 선과 긴 주둥이를 긴 얼굴 및 완만한 긴 눈매로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘thick, purple mane’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, wide-set; feathered full brows; long nose with low tip; thin lips.
```

### 246 · 애버라스 (Larvitar)

계열 기준: 애버라스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 바위 같은 면과 짧은 주둥이를 높은 광대와 짧은 사람 코로 옮긴다.

**원작 단서:** ‘blunt spike’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘blunt spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘blunt spike’ → 눈매 강하게 치켜올라간 눈 · ‘blunt spike’ → 눈꼬리 각도 올라간 눈꼬리 · ‘blunt spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘short, rounded snout’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; rounded soft tip nose; thin lips.
```

### 247 · 데기라스 (Pupitar)

계열 기준: 애버라스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 탄환 같은 매끈한 외피를 긴 타원 윤곽과 낮은 눈꺼풀로 해석한다.

**원작 단서:** ‘four large spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘four large spikes’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘four large spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘four large spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱, 눈썹 중간 두께의 직선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; drooping eyes, medium size, downturned outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 248 · 마기라스 (Tyranitar)

계열 기준: 애버라스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**이유:** 거대한 장갑과 뾰족한 윤곽을 각진 하관과 작고 강한 눈매로 구분한다.

**원작 단서:** ‘several spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘several spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘several spikes’ → 눈매 가늘고 날카로운 눈 · ‘several spikes’ → 눈썹 굵고 눈 가까이 낮은 · 무게 202kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, close-set; thick low brows; broad low bridge nose; wide mouth.
```

### 249 · 루기아 (Lugia)

계열 기준: 루기아 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**이유:** 잠수와 거대한 유선형 날개를 긴 얼굴 및 안정적인 수평 눈매로 해석한다.

**원작 단서:** ‘long, slender neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long, slender neck’ → 얼굴 길이 긴 얼굴 · ‘long, slender neck’ → 얼굴 폭 좁은 얼굴 · ‘long, slender neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long, slender neck’ → 눈매 아몬드형 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, close-set; straight medium brows; straight slender bridge nose; medium lips.
```

### 250 · 칠색조 (Ho-Oh)

계열 기준: 칠색조 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 무지개 깃의 펼침과 장중한 새의 위용을 긴 곡선 눈썹과 선명한 입술로 해석한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, close-set; long arched brows; balanced nose; full lips.
```

### 251 · 세레비 (Celebi)

계열 기준: 세레비 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 새싹의 끝과 둥근 머리 및 큰 파란 눈을 작은 턱과 큰 맑은 사람 눈으로 옮긴다.

**원작 단서:** ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round head’ → 눈매 큰 눈 · ‘large baby-blue eyes’ → 눈 크기 큰 눈 · ‘round head’ → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 부드럽고 둥근 턱

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; bow-shaped upper lip.
```

## 3세대 · 135종

### 252 · 나무지기 (Treecko)

계열 기준: 나무지기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 도마뱀의 매끈한 윤곽과 느긋하게 낮아진 시선을 타원 얼굴과 낮은 윗눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; small delicate nose; wide mouth.
```

### 253 · 나무돌이 (Grovyle)

계열 기준: 나무지기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 날카로운 잎과 길어진 몸을 긴 얼굴과 선명한 긴 눈으로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; medium lips.
```

### 254 · 나무킹 (Sceptile)

계열 기준: 나무지기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 긴 날 같은 잎과 볏을 높은 광대와 가늘고 긴 눈으로 옮긴다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, small size, level outer corners, wide-set; angled brows; balanced nose; wide mouth.
```

### 255 · 아차모 (Torchic)

계열 기준: 아차모 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 작은 |

**이유:** 솜털과 짧은 부리를 둥근 볼과 짧은 사람 코로 해석한다.

**원작 단서:** ‘fluffy coat’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘fluffy coat’ → 얼굴 길이 짧은 얼굴 · ‘fluffy coat’ → 얼굴 폭 넓은 얼굴 · ‘fluffy coat’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘fluffy coat’ → 눈매 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; short rounded brows; prominent defined nose; small mouth.
```

### 256 · 영치코 (Combusken)

계열 기준: 아차모 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**이유:** 짧고 넓은 부리와 강해진 다리의 체적을 넓은 얼굴과 열린 눈매로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘short, wide beak’ → 코 콧대가 낮고 넓은 · ‘short, wide beak’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, large size, level outer corners, average spacing; straight medium brows; broad low bridge nose; wide mouth.
```

### 257 · 번치코 (Blaziken)

계열 기준: 아차모 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 얇은 입술 |

**이유:** V형 볏과 격투의 긴 선을 긴 윤곽과 날카로운 눈썹으로 옮긴다.

**원작 단서:** ‘hooked beak’ → 눈썹 바깥에서 꺾이는 사선 · ‘hooked beak’ → 코 콧대가 볼록한 매부리코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; aquiline nose with convex bridge; thin lips.
```

### 258 · 물짱이 (Mudkip)

계열 기준: 물짱이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 큰 머리와 작은 검은 눈을 넓고 둥근 얼굴과 작은 사람 눈으로 옮긴다.

**원작 단서:** ‘black, beady eyes’ → 눈 크기 작은 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; fine soft arches; balanced nose; wide mouth.
```

### 259 · 늪짱이 (Marshtomp)

계열 기준: 물짱이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**이유:** 각진 지느러미와 단단한 팔다리를 길어진 얼굴과 선명한 눈매로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; broad low bridge nose; wide mouth.
```

### 260 · 대짱이 (Swampert)

계열 기준: 물짱이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**이유:** 큰 부채꼴 지느러미와 넓은 체적을 넓은 하관과 안정적인 눈매로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, average spacing; thick low brows; broad low bridge nose; wide mouth.
```

### 261 · 포챠나 (Poochyena)

계열 기준: 포챠나 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**이유:** 작은 하이에나의 뾰족한 이와 어두운 얼굴 대비를 올라간 눈매와 작은 코끝으로 해석한다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선 · ‘two pointed teeth’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; straight slender bridge nose; straight even lips.
```

### 262 · 그라에나 (Mightyena)

계열 기준: 포챠나 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 큰 하이에나의 검은 갈기와 마름모 귀를 긴 윤곽과 굵은 눈썹으로 구분한다.

**원작 단서:** ‘dark triangular eye markings’ → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; wide mouth.
```

### 263 · 지그제구리 (Zigzagoon)

계열 기준: 지그제구리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 너구리의 부드러운 체적은 균형 잡힌 타원 윤곽과 둥근 턱으로, 작은 검은 눈 가면의 압축된 대비는 가까운 가는 눈과 굵고 낮은 눈썹으로 해석한다. 사람의 균형 잡힌 코와 중간 두께 입술을 유지해 동물 주둥이를 복제하지 않는다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, close-set; thick low brows; balanced nose; medium lips.
```

### 264 · 직구리 (Linoone)

계열 기준: 지그제구리 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** ‘long cheek fur’ → 얼굴형 길고 세련된 얼굴형 · ‘long cheek fur’ → 얼굴 길이 긴 얼굴 · ‘long cheek fur’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long cheek fur’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘small, tuft-like ears’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, wide-set; feathered full brows; balanced nose; medium lips.
```

### 265 · 개무소 (Wurmple)

계열 기준: 개무소 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘small spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘small spikes’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘large yellow eyes’ → 눈매 큰 눈 · ‘large yellow eyes’ → 눈 크기 큰 눈 · ‘small spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘small spikes’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; open rounded eyes, large size, level outer corners, average spacing; angled brows; small delicate nose; thin lips.
```

### 266 · 실쿤 (Silcoon)

계열 기준: 개무소 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘rounded white cocoon’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘rounded white cocoon’ → 얼굴 길이 짧은 얼굴 · ‘rounded white cocoon’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘rounded white cocoon’ → 눈썹 짧고 둥근 · ‘rounded white cocoon’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; short rounded brows; rounded soft tip nose; thin lips.
```

### 267 · 뷰티플라이 (Beautifly)

계열 기준: 개무소 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝

**조정:** 같은 계열 개무소와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; medium lips.
```

### 268 · 카스쿤 (Cascoon)

계열 기준: 개무소 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 같은 계열 개무소와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; balanced nose; thin lips.
```

### 269 · 독케일 (Dustox)

계열 기준: 개무소 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘purple, egg-shaped body’ → 눈매 큰 눈 · 몸 형태 bug-wings → 눈 크기 큰 눈 · ‘purple, egg-shaped body’ → 눈썹 짧고 둥근 · ‘purple, egg-shaped body’ → 코 코끝이 둥근

**조정:** 같은 계열 실쿤와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; full lips.
```

### 270 · 연꽃몬 (Lotad)

계열 기준: 연꽃몬 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**원작 단서:** 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘large eyes’ → 눈매 큰 눈 · ‘large eyes’ → 눈 크기 큰 눈

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; open rounded eyes, large size, level outer corners, average spacing; angled brows; small delicate nose; wide mouth.
```

### 271 · 로토스 (Lombre)

계열 기준: 연꽃몬 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, wide-set; angled brows; small delicate nose; thin lips.
```

### 272 · 로파파 (Ludicolo)

계열 기준: 연꽃몬 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**원작 단서:** ‘orange bill’ → 코 콧대가 낮고 넓은 · ‘orange bill’ → 입술 입이 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; angled brows; broad low bridge nose; wide mouth.
```

### 273 · 도토링 (Seedot)

계열 기준: 도토링 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 도토리의 짧고 둥근 체적과 큰 검은 눈을 짧고 넓은 윤곽·큰 눈으로 옮기고, 작은 코와 입으로 소박한 숲의 인상을 남긴다.

**원작 단서:** ‘large black eyes’ → 눈매 큰 눈 · ‘large black eyes’ → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; short rounded brows; small delicate nose; small mouth.
```

### 274 · 잎새코 (Nuzleaf)

계열 기준: 도토링 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 좁은 얼굴 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 길고 얇은 팔과 한 장의 잎, 베이지 가면의 또렷한 면을 좁은 타원 윤곽과 기민한 아몬드 눈·가느다란 콧대로 옮긴다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, narrow width; narrow tapered chin; almond eyes, medium size, upturned outer corners, average spacing; thin straight brows; straight slender bridge nose; thin lips.
```

### 275 · 다탱구 (Shiftry)

계열 기준: 도토링 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 넓은 |

**이유:** 긴 뾰족한 코와 큰 입, 거친 흰 갈기를 긴 얼굴·각진 턱·또렷한 사람 코와 넓은 입·숱 있는 눈썹으로 해석한다. 코를 주둥이나 텐구 부리로 만들지 않는다.

**원작 단서:** ‘shaggy white mane’ → 눈썹 숱 많고 결이 보이는 · ‘long, pointed nose’ → 코 크고 또렷한 코 · ‘large mouth’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; feathered full brows; prominent defined nose; wide mouth.
```

### 276 · 테일로 (Taillow)

계열 기준: 테일로 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 작은 |

**이유:** 작고 둥근 제비 체적은 짧은 성인 얼굴과 부드러운 턱, 가는 갈색 눈과 굴하지 않는 기개는 작은 올라간 눈과 사선 눈썹으로 해석했다. 짧은 부리는 짧은 사람 코와 작은 입으로 옮긴다.

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · ‘narrow brown eyes’ → 눈매 가늘고 날카로운 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘short yellow beak’ → 입술 입이 작은

```text
FACE (her own structure, not the style's default face): compact face, short length, medium width; soft rounded jaw; narrow eyes, small size, upturned outer corners, close-set; angled brows; short nose with upturned tip; small mouth.
```

### 277 · 스왈로 (Swellow)

계열 기준: 테일로 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 계열의 가늘고 올라간 눈은 공유하되 길어진 제비 실루엣과 뾰족한 부리는 긴 얼굴·분명한 턱·곧고 긴 콧대로 해석했다. 가는 직선 눈썹과 얇은 입술로 별개의 성인 인물을 구분한다.

**원작 단서:** ‘small, narrow eyes’ → 눈매 가늘고 날카로운 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · ‘pointed, yellow beak’ → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, upturned outer corners, average spacing; thin straight brows; straight slender bridge nose; thin lips.
```

### 278 · 갈모매 (Wingull)

계열 기준: 갈모매 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 굴곡 없이 곧은 |

**이유:** 길고 납작한 날개의 수평선은 넓은 광대·넓은 눈 간격·수평의 가는 눈, 갈고리형 부리 끝은 완만히 볼록한 사람 콧대로 옮긴다. 바닷바람 활공은 긴 곡선 눈썹과 차분한 입술로 해석한다.

**원작 단서:** ‘hooked, black tip’ → 코 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): oval face, long length, wide width; balanced jawline; narrow eyes, medium size, level outer corners, wide-set; long arched brows; aquiline nose with convex bridge; straight even lips.
```

### 279 · 패리퍼 (Pelipper)

계열 기준: 갈모매 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 같은 계열 갈모매와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; fuller lower lip.
```

### 280 · 랄토스 (Ralts)

계열 기준: 랄토스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 얼굴을 가리는 둥근 머리 윤곽과 감응하는 특징을 작은 턱과 부드럽게 내려간 눈꼬리로 해석한다.

**원작 단서:** ‘two flat, red horns’ → 얼굴형 각지고 선명한 얼굴형 · 에스퍼 타입 → 눈매 아몬드형 눈 · 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, downturned outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 281 · 킬리아 (Kirlia)

계열 기준: 랄토스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 춤추는 가벼운 실루엣을 타원 얼굴과 유연한 눈썹 곡선으로 구분한다.

**원작 단서:** ‘flat, crimson horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · 에스퍼 타입 → 눈매 아몬드형 눈 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 282 · 가디안 (Gardevoir)

계열 기준: 랄토스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 드레스처럼 흐르는 긴 선과 보호하는 특징을 긴 얼굴과 고요한 눈매로 해석한다.

**원작 단서:** ‘short spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · 에스퍼 타입 → 눈매 아몬드형 눈 · ‘short spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; balanced nose; thin lips.
```

### 283 · 비구술 (Surskit)

계열 기준: 비구술 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round body’ → 눈매 큰 눈 · ‘dark, circular eyes’ → 눈꼬리 각도 수평 · ‘round body’ → 눈썹 짧고 둥근 · ‘round body’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; thin lips.
```

### 284 · 비나방 (Masquerain)

계열 기준: 비구술 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 마름모 날개와 큰 눈처럼 보이는 더듬이를 넓은 상안면과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · 몸 형태 bug-wings → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; long arched brows; straight slender bridge nose; small mouth.
```

### 285 · 버섯꼬 (Shroomish)

계열 기준: 버섯꼬 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 286 · 버섯모 (Breloom)

계열 기준: 버섯꼬 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘beak-like mouth’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; open rounded eyes, medium size, downturned outer corners, average spacing; straight medium brows; prominent defined nose; thin lips.
```

### 287 · 게을로 (Slakoth)

계열 기준: 게을로 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 나무늘보의 긴 팔과 게으른 눈매를 긴 타원 윤곽과 낮은 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; fine soft arches; balanced nose; full lips.
```

### 288 · 발바로 (Vigoroth)

계열 기준: 게을로 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 성난 원숭이의 각진 체적을 짧은 중안부와 강한 눈썹으로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, large size, level outer corners, average spacing; straight medium brows; small delicate nose; wide mouth.
```

### 289 · 게을킹 (Slaking)

계열 기준: 게을로 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘small tuft’ → 눈썹 숱 많고 결이 보이는

**조정:** 같은 계열 게을로와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는, 코 보통 → 작고 여린 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; feathered full brows; small delicate nose; full lips.
```

### 290 · 토중몬 (Nincada)

계열 기준: 토중몬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 작은 날개와 뾰족한 주둥이를 작은 눈과 선명한 코끝으로 해석한다.

**원작 단서:** ‘pointed snout’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 곧고 가는 콧대 → 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, small size, upturned outer corners, close-set; straight medium brows; long nose with low tip; thin lips.
```

### 291 · 아이스크 (Ninjask)

계열 기준: 토중몬 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 292 · 껍질몬 (Shedinja)

계열 기준: 토중몬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 속이 빈 허물과 움직이지 않는 실루엣을 고요한 눈매와 절제된 입술로 해석한다. 생기 없는 피부나 빈 눈구멍은 복제하지 않는다.

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · 고스트 타입 → 눈매 살짝 처진 부드러운 눈

**조정:** 같은 계열 토중몬와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; small delicate nose; thin lips.
```

### 293 · 소곤룡 (Whismur)

계열 기준: 소곤룡 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**원작 단서:** ‘spherical body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical body’ → 눈매 큰 눈 · ‘spherical body’ → 눈썹 짧고 둥근 · ‘spherical body’ → 코 코끝이 둥근 · ‘simple, wide mouth’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; wide mouth.
```

### 294 · 노공룡 (Loudred)

계열 기준: 소곤룡 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 각진 몸통과 원형 스피커 귀는 짧고 넓은 얼굴·단단한 턱과 대비되는 둥근 눈으로 해석한다. 넓은 입 윤곽은 넓은 사람 입술선, 짧은 코는 둥근 코끝으로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; square broad jaw; open rounded eyes, medium size, level outer corners, wide-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 295 · 폭음룡 (Exploud)

계열 기준: 소곤룡 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 길게 솟은 음향관과 큰 울림 체적은 긴 얼굴·뚜렷한 광대와 턱으로 해석한다. 좁은 눈 윤곽은 긴 아몬드 눈, 큰 발성기관은 도톰한 아래 입술로 옮겨 노공룡의 짧은 얼굴과 구분한다.

**조정:** 같은 계열 노공룡와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; angular defined jaw; almond eyes, small size, upturned outer corners, average spacing; angled brows; prominent defined nose; fuller lower lip.
```

### 296 · 마크탕 (Makuhita)

계열 기준: 마크탕 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 둥근 손과 근성의 체적을 넓은 볼과 굵은 낮은 눈썹으로 해석한다.

**원작 단서:** 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; medium lips.
```

### 297 · 하리뭉 (Hariyama)

계열 기준: 마크탕 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 거대한 손바닥과 삼각 볏의 둔중한 힘을 넓은 하관과 작은 깊은 눈으로 구분한다.

**원작 단서:** 무게 253.8kg → 얼굴 폭 넓은 얼굴 · ‘short, triangular crest’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘short, triangular crest’ → 눈매 가늘고 날카로운 눈 · ‘short, triangular crest’ → 눈꼬리 각도 올라간 눈꼬리 · ‘short, triangular crest’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; narrow eyes, small size, upturned outer corners, average spacing; thick low brows; small delicate nose; wide mouth.
```

### 298 · 루리리 (Azurill)

계열 기준: 루리리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 원형 귀와 물방울 같은 몸의 원형 반복을 짧고 넓은 얼굴·부드러운 볼과 턱으로, 작고 떨어진 검은 눈을 작고 넓게 떨어진 사람 눈으로 옮긴다. 콧대와 입은 짧고 부드럽게 하여 20대 성인 인물의 비율을 유지한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 키 0.2m → 얼굴 길이 짧은 얼굴 · 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 이마가 넓고 턱이 가는 하트형

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; small mouth.
```

### 299 · 코코파스 (Nosepass)

계열 기준: 코코파스 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 각진 화산암 체적은 넓고 각진 턱과 뚜렷한 광대로, 가느다란 눈 틈은 작은 수평 눈매로 해석한다. 큰 삼각형 나침반 코는 또렷한 사람 콧대와 코끝으로 옮기고 원작의 붉은 삼각형은 흉갑에만 남긴다.

**원작 단서:** 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): angular face, long length, wide width; square broad jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; prominent defined nose; thin lips.
```

### 300 · 에나비 (Skitty)

계열 기준: 에나비 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 분홍색의 짧고 둥근 체적과 slit-like eyes를 짧은 둥근 윤곽·작고 가는 수평 눈으로 해석한다. 크림색 초승달의 부드러운 곡선은 완만한 눈썹과 둥근 코끝으로 남긴다. 성인 얼굴 비율을 유지한다.

**원작 단서:** ‘slit-like eyes’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; narrow eyes, small size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; full lips.
```

### 301 · 델케티 (Delcatty)

계열 기준: 에나비 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**이유:** 얇게 흐르는 꼬리와 뾰족한 수염 돌기에서 균형 길이의 타원 윤곽·가느다란 직선 콧대를 해석하고, 보라색 러프의 풍성한 결은 숱 있는 눈썹으로 남긴다. 에나비의 가는 눈과 달리 넓게 열린 성인 눈으로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘purple ruff-like collar’ → 눈썹 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, wide-set; feathered full brows; straight slender bridge nose; bow-shaped upper lip.
```

### 302 · 깜까미 (Sableye)

계열 기준: 깜까미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 보석 눈과 예리한 귀의 대비를 작은 턱과 큰 선명한 사람 눈으로 해석한다.

**원작 단서:** 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, close-set; angled brows; small delicate nose; wide mouth.
```

### 303 · 입치트 (Mawile)

계열 기준: 입치트 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**이유:** 작은 본체와 큰 뒤쪽 턱의 대비를 작은 턱끝과 선명한 입술 윤곽으로 해석한다. 사람 얼굴에 두 번째 입을 붙이지 않는다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; straight slender bridge nose; bow-shaped upper lip.
```

### 304 · 가보리 (Aron)

계열 기준: 가보리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘large round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large round head’ → 얼굴 길이 짧은 얼굴 · ‘large round head’ → 얼굴 폭 넓은 얼굴 · ‘large round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘platinum steel armor’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; balanced nose; thin lips.
```

### 305 · 갱도라 (Lairon)

계열 기준: 가보리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘platinum iron armor’ → 얼굴형 각지고 선명한 얼굴형 · ‘platinum iron armor’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘platinum iron armor’ → 눈매 가늘고 날카로운 눈 · ‘platinum iron armor’ → 눈썹 바깥에서 꺾이는 사선 · ‘platinum iron armor’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 가보리와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; straight even lips.
```

### 306 · 보스로라 (Aggron)

계열 기준: 가보리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 거대한 강철 갑옷과 단단한 뿔을 넓고 각진 하관으로 옮긴다.

**원작 단서:** ‘wide, blunt spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘wide, blunt spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘wide, blunt spikes’ → 눈매 가늘고 날카로운 눈 · ‘wide, blunt spikes’ → 눈썹 굵고 눈 가까이 낮은 · ‘wide, blunt spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 입이 넓은 → 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, close-set; thick low brows; balanced nose; thin lips.
```

### 307 · 요가랑 (Meditite)

계열 기준: 요가랑 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; thin straight brows; small delicate nose; bow-shaped upper lip.
```

### 308 · 요가램 (Medicham)

계열 기준: 요가랑 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 명상의 긴 직립 선과 큰 집중 눈을 긴 윤곽과 정돈된 긴 눈매로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; thin lips.
```

### 309 · 썬더라이 (Electrike)

계열 기준: 썬더라이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; thin straight brows; balanced nose; medium lips.
```

### 310 · 썬더볼트 (Manectric)

계열 기준: 썬더라이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** ‘spiky, yellow mane’ → 얼굴형 각지고 선명한 얼굴형 · ‘spiky, yellow mane’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘spiky, yellow mane’ → 눈매 가늘고 날카로운 눈 · ‘spiky, yellow mane’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘spiky, yellow mane’ → 눈썹 숱 많고 결이 보이는

**조정:** 같은 계열 썬더라이와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, wide-set; feathered full brows; balanced nose; medium lips.
```

### 311 · 플러시 (Plusle)

계열 기준: 플러시 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 짧고 코끝이 들린 |
| 입 | 윗입술이 활 모양인 |

**이유:** 플러스 문양의 바깥으로 열리는 선과 응원을 열린 눈매와 곡선 입술로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; long arched brows; short nose with upturned tip; bow-shaped upper lip.
```

### 312 · 마이농 (Minun)

계열 기준: 마이농 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 작은 |

**이유:** 마이너스 문양의 수평선과 응원을 완만한 수평 눈매와 작은 입으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; fine soft arches; short nose with upturned tip; small mouth.
```

### 313 · 볼비트 (Volbeat)

계열 기준: 볼비트 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 발광하는 구형 꼬리와 반복 줄을 둥근 얼굴와 넓은 입선으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; wide mouth.
```

### 314 · 네오비트 (Illumise)

계열 기준: 네오비트 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 반딧불의 보라색 말린 곡선을 작은 턱과 곡선 눈썹으로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 윗입술이 활 모양인 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, downturned outer corners, average spacing; long arched brows; small delicate nose; medium lips.
```

### 315 · 로젤리아 (Roselia)

계열 기준: 꼬몽울 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; bow-shaped upper lip.
```

### 316 · 꼴깍몬 (Gulpin)

계열 기준: 꼴깍몬 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 밥통 같은 체적과 오므린 입술 및 사선 눈을 둥근 볼과 도톰한 입술로 옮긴다.

**원작 단서:** ‘small heart’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘slanted eyes’ → 눈매 강하게 치켜올라간 눈 · ‘slanted eyes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘puckered lips’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 이마가 넓고 턱이 가는 하트형

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, wide width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; fine soft arches; small delicate nose; full lips.
```

### 317 · 꿀꺽몬 (Swalot)

계열 기준: 꼴깍몬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘red, beady eyes’ → 눈매 가늘고 날카로운 눈 · ‘red, beady eyes’ → 눈 크기 작은 눈

**조정:** 같은 계열 꼴깍몬와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; small delicate nose; full lips.
```

### 318 · 샤프니아 (Carvanha)

계열 기준: 샤프니아 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘spherical body’ → 얼굴 폭 넓은 얼굴 · ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선 · ‘spherical body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; full lips.
```

### 319 · 샤크니아 (Sharpedo)

계열 기준: 샤프니아 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선 · ‘large mouth’ → 입술 입이 넓은

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; long nose with low tip; wide mouth.
```

### 320 · 고래왕자 (Wailmer)

계열 기준: 고래왕자 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘baleen plates’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘baleen plates’ → 눈썹 바깥에서 꺾이는 사선 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; small delicate nose; fuller lower lip.
```

### 321 · 고래왕 (Wailord)

계열 기준: 고래왕자 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘small beady eyes’ → 눈 크기 작은 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; fine soft arches; small delicate nose; full lips.
```

### 322 · 둔타 (Numel)

계열 기준: 둔타 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 보통 |

**이유:** 낙타의 완만한 등과 둔감한 분위기를 완만한 타원 윤곽과 낮은 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; fine soft arches; broad low bridge nose; medium lips.
```

### 323 · 폭타 (Camerupt)

계열 기준: 둔타 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 분화하는 큰 혹과 둔중한 몸을 넓은 하관 및 굵은 눈썹으로 구분한다.

**원작 단서:** 무게 220kg → 얼굴 폭 넓은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; wide mouth.
```

### 324 · 코터스 (Torkoal)

계열 기준: 코터스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘large, black, rock-like shell’ → 얼굴형 각지고 선명한 얼굴형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘large, black, rock-like shell’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘large, black, rock-like shell’ → 눈매 가늘고 날카로운 눈 · ‘large, black, rock-like shell’ → 눈썹 바깥에서 꺾이는 사선 · ‘large, black, rock-like shell’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 325 · 피그점프 (Spoink)

계열 기준: 피그점프 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 보통 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 큰 둥근 돼지 코와 원형 눈을 둥근 사람 코끝과 둥근 눈으로 해석한다.

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통 · ‘dark, circular eyes’ → 눈매 큰 눈 · ‘dark, circular eyes’ → 눈꼬리 각도 수평 · ‘large gray nose’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; balanced jawline; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; medium lips.
```

### 326 · 피그킹 (Grumpig)

계열 기준: 피그점프 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 커진 돼지의 체적과 구슬의 원형을 넓은 볼과 타원 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘oval eyes’ → 눈매 큰 눈 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, downturned outer corners, average spacing; thin straight brows; rounded soft tip nose; full lips.
```

### 327 · 얼루기 (Spinda)

계열 기준: 얼루기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 흔들리는 몸과 소용돌이 무늬를 둥근 윤곽과 낮은 눈꺼풀로 해석한다. 나선 동공은 복제하지 않는다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; bow-shaped upper lip.
```

### 328 · 톱치 (Trapinch)

계열 기준: 톱치 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 큰 머리와 턱 및 작은 눈의 대비를 넓은 하관과 작은 사람 눈으로 옮긴다.

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘large jaws’ → 턱선 · 턱끝 넓고 묵직한 턱끝 · ‘round body’ → 눈매 큰 눈 · ‘small black eyes’ → 눈 크기 작은 눈 · ‘round body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; wide heavy chin; open rounded eyes, small size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; wide mouth.
```

### 329 · 비브라바 (Vibrava)

계열 기준: 톱치 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 마름모 날개와 가는 몸을 긴 윤곽과 큰 사람 눈으로 구분한다.

**원작 단서:** 몸 형태 bug-wings → 눈 크기 큰 눈 · ‘two large white teeth’ → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; open rounded eyes, large size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; fuller lower lip.
```

### 330 · 플라이곤 (Flygon)

계열 기준: 톱치 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 큰 눈 덮개와 긴 사막용 실루엣을 큰 눈과 길고 매끈한 사람 얼굴로 해석한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 좁은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; open rounded eyes, large size, level outer corners, close-set; straight medium brows; balanced nose; thin lips.
```

### 331 · 선인왕 (Cacnea)

계열 기준: 선인왕 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘two dark green spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘round body’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; rounded soft tip nose; bow-shaped upper lip.
```

### 332 · 밤선인 (Cacturne)

계열 기준: 선인왕 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘numerous spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘numerous spikes’ → 눈매 강하게 치켜올라간 눈 · ‘numerous spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; bow-shaped upper lip.
```

### 333 · 파비코 (Swablu)

계열 기준: 파비코 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**원작 단서:** ‘round, blue body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, blue body’ → 얼굴 길이 짧은 얼굴 · ‘round, blue body’ → 얼굴 폭 넓은 얼굴 · ‘round, blue body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round, blue body’ → 눈매 큰 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, upturned outer corners, close-set; short rounded brows; straight slender bridge nose; small mouth.
```

### 334 · 파비코리 (Altaria)

계열 기준: 파비코 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 보통 |

**이유:** 구름 같은 날개와 긴 목의 선을 완만한 타원 얼굴로 해석한다.

**원작 단서:** ‘fluffy, white feathers’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘long neck’ → 눈매 아몬드형 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘fluffy, white feathers’ → 눈썹 가늘고 완만한 곡선 · ‘short, hooked beak’ → 코 콧대가 볼록한 매부리코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, close-set; fine soft arches; aquiline nose with convex bridge; medium lips.
```

### 335 · 쟝고 (Zangoose)

계열 기준: 쟝고 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘small tufts’ → 눈썹 숱 많고 결이 보이는 · ‘small red nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; feathered full brows; small delicate nose; full lips.
```

### 336 · 세비퍼 (Seviper)

계열 기준: 세비퍼 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 크기 작은 눈 → 보통, 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; full lips.
```

### 337 · 루나톤 (Lunatone)

계열 기준: 루나톤 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘cream rocky crescent’ → 얼굴형 각지고 선명한 얼굴형 · ‘cream rocky crescent’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘cream rocky crescent’ → 눈매 가늘고 날카로운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘cream rocky crescent’ → 눈썹 바깥에서 꺾이는 사선 · ‘cream rocky crescent’ → 코 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; prominent defined nose; thin lips.
```

### 338 · 솔록 (Solrock)

계열 기준: 솔록 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘eight yellow rocky rays’ → 얼굴형 각지고 선명한 얼굴형 · ‘orange spherical rock’ → 얼굴 폭 넓은 얼굴 · ‘eight yellow rocky rays’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘eight yellow rocky rays’ → 눈매 가늘고 날카로운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘eight yellow rocky rays’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 크고 또렷한 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; thin lips.
```

### 339 · 미꾸리 (Barboach)

계열 기준: 미꾸리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘small eyes’ → 눈 크기 작은 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 땅 타입 → 코 콧대가 낮고 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 콧대가 낮고 넓은, 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; fine soft arches; broad low bridge nose; fuller lower lip.
```

### 340 · 메깅 (Whiscash)

계열 기준: 미꾸리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선, 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; straight medium brows; small delicate nose; fuller lower lip.
```

### 341 · 가재군 (Corphish)

계열 기준: 가재군 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 작은 가재의 가시와 둥근 체적을 둥근 얼굴 안의 선명한 눈매로 해석한다.

**원작 단서:** ‘three spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; angled brows; small delicate nose; wide mouth.
```

### 342 · 가재장군 (Crawdaunt)

계열 기준: 가재군 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** ‘two spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘two spikes’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘circular eyes’ → 눈매 큰 눈 · ‘circular eyes’ → 눈꼬리 각도 수평 · ‘two spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; open rounded eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; medium lips.
```

### 343 · 오뚝군 (Baltoy)

계열 기준: 오뚝군 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 회전하는 점토 인형의 중심 대칭을 정돈된 타원 윤곽과 낮은 눈꺼풀로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; thin straight brows; straight slender bridge nose; thin lips.
```

### 344 · 점토도리 (Claydol)

계열 기준: 오뚝군 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**원작 단서:** ‘eight round, pink eye-like structures’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘eight round, pink eye-like structures’ → 얼굴 길이 짧은 얼굴 · ‘eight round, pink eye-like structures’ → 얼굴 폭 넓은 얼굴 · ‘eight round, pink eye-like structures’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘eight round, pink eye-like structures’ → 눈매 큰 눈 · ‘eight round, pink eye-like structures’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 도톰한 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; short rounded brows; rounded soft tip nose; small mouth.
```

### 345 · 릴링 (Lileep)

계열 기준: 릴링 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 턱끝이 뒤로 물러난 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 바다나리의 가는 줄기와 빛나는 눈을 가벼운 타원 얼굴와 큰 맑은 눈으로 해석한다.

**원작 단서:** 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · 몸 형태 blob → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 턱끝이 뒤로 물러난, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; receding soft chin; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; small delicate nose; small mouth.
```

### 346 · 릴리요 (Cradily)

계열 기준: 릴링 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 턱끝이 뒤로 물러난 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 바위단지의 큰 체적과 촉수의 곡선을 넓은 볼과 곡선 눈썹으로 구분한다.

**원작 단서:** 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 턱끝이 뒤로 물러난

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; receding soft chin; narrow eyes, medium size, level outer corners, average spacing; long arched brows; rounded soft tip nose; full lips.
```

### 347 · 아노딥스 (Anorith)

계열 기준: 아노딥스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 크기 큰 눈 → 보통, 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; thin lips.
```

### 348 · 아말도 (Armaldo)

계열 기준: 아노딥스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘four short spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘four short spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘four short spikes’ → 눈매 강하게 치켜올라간 눈 · ‘four short spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘four short spikes’ → 코 크고 또렷한 코 · ‘four short spikes’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; prominent defined nose; straight even lips.
```

### 349 · 빈티나 (Feebas)

계열 기준: 빈티나 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; small delicate nose; fuller lower lip.
```

### 350 · 밀로틱 (Milotic)

계열 기준: 빈티나 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 도톰한 입술 |

**이유:** 길게 흐르는 수중 몸과 우아한 머리 지느러미를 긴 얼굴과 길고 완만한 눈으로 해석한다.

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · ‘straight spike’ → 턱선 · 턱끝 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; long nose with low tip; full lips.
```

### 351 · 캐스퐁 (Castform)

계열 기준: 캐스퐁 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 구름 몸과 구형 머리를 둥근 볼과 둥근 사람 눈으로 해석한다.

**원작 단서:** ‘large spherical head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large spherical head’ → 얼굴 길이 짧은 얼굴 · ‘large spherical head’ → 얼굴 폭 넓은 얼굴 · ‘large spherical head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘large spherical head’ → 눈매 큰 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; short rounded brows; small delicate nose; bow-shaped upper lip.
```

### 352 · 켈리몬 (Kecleon)

계열 기준: 켈리몬 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 카멜레온의 매끈한 얼굴과 지그재그의 꺾임을 낮은 눈꺼풀과 선명한 입선으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; long arched brows; straight slender bridge nose; wide mouth.
```

### 353 · 어둠대신 (Shuppet)

계열 기준: 어둠대신 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 늘어진 천 인형과 긴 뿔을 작은 턱과 낮고 긴 눈으로 해석한다.

**원작 단서:** ‘long, pointed horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘long, pointed horn’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘long, pointed horn’ → 눈썹 길고 바깥 아치가 선명한 · ‘long, pointed horn’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; drooping eyes, medium size, downturned outer corners, wide-set; long arched brows; small delicate nose; thin lips.
```

### 354 · 다크펫 (Banette)

계열 기준: 어둠대신 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 봉제 인형의 예리한 윤곽과 지퍼 입을 작은 턱과 긴 입선으로 해석한다. 실제 지퍼는 사람 입에 붙이지 않는다.

**원작 단서:** ‘three short spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘three short spikes’ → 눈매 강하게 치켜올라간 눈 · ‘three short spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘three short spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; small delicate nose; wide mouth.
```

### 355 · 해골몽 (Duskull)

계열 기준: 해골몽 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 단일 눈과 검은 로브의 중심을 정돈된 타원 얼굴와 대칭인 두 둥근 눈으로 해석한다.

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통 · ‘single eye’ → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; open rounded eyes, medium size, level outer corners, close-set; straight medium brows; small delicate nose; thin lips.
```

### 356 · 미라몽 (Dusclops)

계열 기준: 해골몽 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 미라의 두터운 둥근 체적을 넓은 얼굴와 낮은 눈꺼풀로 구분한다. 단안은 복제하지 않는다.

**원작 단서:** 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · ‘single red eye’ → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; drooping eyes, medium size, downturned outer corners, close-set; thick low brows; rounded soft tip nose; thin lips.
```

### 357 · 트로피우스 (Tropius)

계열 기준: 트로피우스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘long neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘long neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long neck’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long neck’ → 눈썹 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; straight slender bridge nose; bow-shaped upper lip.
```

### 358 · 치렁 (Chimecho)

계열 기준: 랑딸랑 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; open rounded eyes, small size, level outer corners, average spacing; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 359 · 앱솔 (Absol)

계열 기준: 앱솔 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 초승달처럼 휘어진 뿔과 매끈한 실루엣을 긴 윤곽과 가늘고 긴 눈으로 해석한다.

**원작 단서:** ‘scythe-shaped horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘scythe-shaped horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘scythe-shaped horn’ → 눈매 가늘고 날카로운 눈 · ‘scythe-shaped horn’ → 눈썹 바깥에서 꺾이는 사선 · ‘scythe-shaped horn’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 360 · 마자 (Wynaut)

계열 기준: 마자 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 에스퍼 타입 → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; straight slender bridge nose; full lips.
```

### 361 · 눈꼬마 (Snorunt)

계열 기준: 눈꼬마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 삼각 망토와 작은 타원 몸을 높은 광대와 좁은 턱으로 해석한다.

**원작 단서:** ‘round light-blue eyes’ → 눈매 큰 눈 · ‘round light-blue eyes’ → 눈꼬리 각도 수평

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; small mouth.
```

### 362 · 얼음귀신 (Glalie)

계열 기준: 눈꼬마 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘two large, black, conical horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two large, black, conical horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two large, black, conical horns’ → 눈매 강하게 치켜올라간 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘two large, black, conical horns’ → 눈썹 바깥에서 꺾이는 사선 · ‘two large, black, conical horns’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, wide-set; angled brows; straight slender bridge nose; thin lips.
```

### 363 · 대굴레오 (Spheal)

계열 기준: 대굴레오 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 둥근 물개 몸과 푹신한 털을 둥근 볼과 도톰한 입술로 해석한다.

**원작 단서:** ‘black, circular eyes’ → 눈매 큰 눈 · ‘black, circular eyes’ → 눈꼬리 각도 수평 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; thin straight brows; rounded soft tip nose; full lips.
```

### 364 · 씨레오 (Sealeo)

계열 기준: 대굴레오 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 바다사자의 커진 체적과 두꺼운 수염을 넓은 볼과 부드러운 타원 눈으로 구분한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘oval eyes’ → 눈매 큰 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, downturned outer corners, wide-set; fine soft arches; rounded soft tip nose; medium lips.
```

### 365 · 씨카이저 (Walrein)

계열 기준: 대굴레오 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘large tufts’ → 눈썹 숱 많고 결이 보이는 · ‘round snout’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; feathered full brows; rounded soft tip nose; full lips.
```

### 366 · 진주몽 (Clamperl)

계열 기준: 진주몽 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; medium lips.
```

### 367 · 헌테일 (Huntail)

계열 기준: 진주몽 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** ‘serpentine body’ → 얼굴형 길고 세련된 얼굴형 · ‘serpentine body’ → 얼굴 길이 긴 얼굴 · ‘serpentine body’ → 얼굴 폭 좁은 얼굴 · ‘serpentine body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘serpentine body’ → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; medium lips.
```

### 368 · 분홍장이 (Gorebyss)

계열 기준: 진주몽 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 squiggle → 얼굴 길이 긴 얼굴

**조정:** 같은 계열 헌테일와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 보통 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; fuller lower lip.
```

### 369 · 시라칸 (Relicanth)

계열 기준: 시라칸 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; fuller lower lip.
```

### 370 · 사랑동이 (Luvdisc)

계열 기준: 사랑동이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 하트형 몸과 입술을 작은 턱과 도톰한 입술로 해석한다.

**원작 단서:** ‘heart-shaped scales’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, wide-set; straight medium brows; small delicate nose; full lips.
```

### 371 · 아공이 (Bagon)

계열 기준: 아공이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 단단한 머리와 큰 둥근 주둥이를 넓은 얼굴와 둥근 사람 코끝으로 해석한다.

**원작 단서:** ‘large, round snout’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, average spacing; long arched brows; rounded soft tip nose; wide mouth.
```

### 372 · 쉘곤 (Shelgon)

계열 기준: 아공이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 인내하는 둥근 갑각의 매끈한 선을 타원 윤곽과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘six white plates’ → 눈썹 바깥에서 꺾이는 사선 · ‘six white plates’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; angled brows; small delicate nose; thin lips.
```

### 373 · 보만다 (Salamence)

계열 기준: 아공이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 큰 용의 턱과 날개 힘을 각진 하관과 강한 수평 눈매로 옮긴다.

**원작 단서:** 드래곤 타입 → 얼굴형 각지고 선명한 얼굴형 · ‘pointed teeth’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; long nose with low tip; wide mouth.
```

### 374 · 메탕 (Beldum)

계열 기준: 메탕 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘nearly spherical head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘nearly spherical head’ → 얼굴 길이 짧은 얼굴 · ‘nearly spherical head’ → 얼굴 폭 넓은 얼굴 · ‘nearly spherical head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘nearly spherical head’ → 눈매 큰 눈 · ‘nearly spherical head’ → 눈썹 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; short rounded brows; straight slender bridge nose; full lips.
```

### 375 · 메탕구 (Metang)

계열 기준: 메탕 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘flat, gray spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘flat, gray spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘flat, gray spikes’ → 눈매 가늘고 날카로운 눈 · ‘flat, gray spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘flat, gray spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘flat, gray spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, average spacing; angled brows; straight slender bridge nose; straight even lips.
```

### 376 · 메타그로스 (Metagross)

계열 기준: 메탕 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**이유:** 금속 면과 중심 대칭을 넓고 각진 얼굴 및 정돈된 이목구비로 해석한다.

**원작 단서:** 무게 550kg → 얼굴 폭 넓은 얼굴 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · 강철 타입 → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, close-set; straight medium brows; balanced nose; straight even lips.
```

### 377 · 레지락 (Regirock)

계열 기준: 레지락 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** ‘orange rocky spines’ → 얼굴형 각지고 선명한 얼굴형 · ‘orange rocky spines’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘orange rocky spines’ → 눈매 가늘고 날카로운 눈 · ‘orange rocky spines’ → 눈썹 바깥에서 꺾이는 사선 · 무게 230kg → 코 콧대가 낮고 넓은 · ‘orange rocky spines’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; broad low bridge nose; thin lips.
```

### 378 · 레지아이스 (Regice)

계열 기준: 레지아이스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘four spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘four spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘four spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘four spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; full lips.
```

### 379 · 레지스틸 (Registeel)

계열 기준: 레지스틸 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 무게 205kg → 턱선 · 턱끝 넓고 각진 사각 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; full lips.
```

### 380 · 라티아스 (Latias)

계열 기준: 라티아스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**이유:** 작고 날렵한 유선형을 작은 턱과 길고 부드러운 눈으로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 몸 형태 wings → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, close-set; fine soft arches; straight slender bridge nose; medium lips.
```

### 381 · 라티오스 (Latios)

계열 기준: 라티오스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 더 긴 유선형 실루엣을 긴 얼굴과 수평적인 집중 눈매로 구분한다.

**원작 단서:** ‘thick neck’ → 얼굴형 길고 세련된 얼굴형 · ‘thick neck’ → 얼굴 길이 긴 얼굴 · ‘thick neck’ → 얼굴 폭 좁은 얼굴 · ‘thick neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; full lips.
```

### 382 · 가이오가 (Kyogre)

계열 기준: 가이오가 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 거대한 해양 실루엣과 넓은 지느러미를 넓은 얼굴과 안정적인 눈매로 옮긴다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 무게 352kg → 얼굴 폭 넓은 얼굴 · ‘two small spikes’ → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘two small spikes’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; almond eyes, medium size, downturned outer corners, wide-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 383 · 그란돈 (Groudon)

계열 기준: 그란돈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 넓은 |

**이유:** 대지의 분절된 갑옷과 큰 발톱을 각진 하관과 강한 사선 눈썹으로 옮긴다.

**원작 단서:** ‘large white spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘large white spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘large white spikes’ → 눈매 강하게 치켜올라간 눈 · ‘large white spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘large white spikes’ → 눈썹 굵고 눈 가까이 낮은 · ‘large white spikes’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; thick low brows; prominent defined nose; wide mouth.
```

### 384 · 레쿠쟈 (Rayquaza)

계열 기준: 레쿠쟈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 굴곡 없이 곧은 |

**이유:** 하늘을 가르는 긴 용의 몸을 긴 얼굴과 날카로운 긴 눈으로 해석한다.

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선 · ‘two white fangs’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; angled brows; long nose with low tip; straight even lips.
```

### 385 · 지라치 (Jirachi)

계열 기준: 지라치 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 별 모양 머리와 둥근 중심을 작은 턱과 큰 맑은 눈으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; balanced nose; small mouth.
```

### 386 · 테오키스 (Deoxys)

계열 기준: 테오키스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** DNA의 반복 대칭과 수정 중심을 정돈된 긴 얼굴과 일정한 눈 간격으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; bow-shaped upper lip.
```

## 4세대 · 107종

### 387 · 모부기 (Turtwig)

계열 기준: 모부기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 거북의 둥근 등과 작은 새싹을 둥근 얼굴과 작은 입으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 작은 → 얇은 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; thin lips.
```

### 388 · 수풀부기 (Grotle)

계열 기준: 모부기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 덤불과 단단해진 거북의 실루엣을 길어진 타원 얼굴로 구분한다.

**원작 단서:** ‘three long, brown ridges’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 턱끝이 길고 턱선이 또렷한, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; medium lips.
```

### 389 · 토대부기 (Torterra)

계열 기준: 모부기 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 대지와 큰 거북의 넓은 등판을 넓은 볼 및 단단한 하관으로 해석한다.

**원작 단서:** ‘two large spikes’ → 얼굴형 각지고 선명한 얼굴형 · 무게 310kg → 얼굴 폭 넓은 얼굴 · ‘two large spikes’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 각지고 선명한 얼굴형, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, average spacing; thick low brows; rounded soft tip nose; wide mouth.
```

### 390 · 불꽃숭이 (Chimchar)

계열 기준: 불꽃숭이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**이유:** 원숭이의 가벼운 움직임과 불꽃 꼬리를 열린 눈매와 넓은 입으로 해석한다.

**원작 단서:** ‘two pointed teeth’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; long arched brows; small delicate nose; straight even lips.
```

### 391 · 파이숭이 (Monferno)

계열 기준: 불꽃숭이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 더 민첩해진 원숭이의 선을 타원 윤곽과 올라간 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 불꽃 타입 → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; small delicate nose; wide mouth.
```

### 392 · 초염몽 (Infernape)

계열 기준: 불꽃숭이 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 불꽃 볏과 격투의 예리한 리듬을 높은 광대와 강한 수평 눈으로 해석한다.

**원작 단서:** 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; bow-shaped upper lip.
```

### 393 · 팽도리 (Piplup)

계열 기준: 팽도리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 작은 |

**이유:** 작은 펭귄의 둥근 몸을 둥근 얼굴과 짧은 코로 옮긴다.

**원작 단서:** 키 0.4m → 얼굴 길이 짧은 얼굴 · ‘short, yellow beak’ → 코 크고 또렷한 코 · ‘short, yellow beak’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; prominent defined nose; small mouth.
```

### 394 · 팽태자 (Prinplup)

계열 기준: 팽도리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 성장한 펭귄의 정돈된 선을 타원 얼굴과 직선 눈썹으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; full lips.
```

### 395 · 엠페르트 (Empoleon)

계열 기준: 팽도리 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 왕관 같은 삼지창 머리와 강철 선을 긴 윤곽과 단단한 직선 콧대로 옮긴다.

**원작 단서:** ‘three pointed horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘three pointed horns’ → 눈매 가늘고 날카로운 눈 · ‘three pointed horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; long nose with low tip; thin lips.
```

### 396 · 찌르꼬 (Starly)

계열 기준: 찌르꼬 · 설계: 원작 단서 규칙 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘long, orange beak’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 곧고 가는 콧대 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; straight medium brows; prominent defined nose; thin lips.
```

### 397 · 찌르버드 (Staravia)

계열 기준: 찌르꼬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 검정·흰색의 대비와 영역을 지키는 찌르레기 인상을, 균형 잡힌 타원 윤곽·좁고 올라간 눈·곧은 중간 두께 눈썹으로 해석. 길고 가는 주황 부리는 사람의 곧고 가는 콧대와 얇은 입술로 옮겼다. 2026-10-15 경장 ①이 확정 정본이며 후속은 그 그림을 첨부한다.

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · ‘long, orange beak’ → 코 곧고 가는 콧대

**조정:** 같은 계열 찌르꼬와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; narrow eyes, medium size, upturned outer corners, average spacing; straight medium brows; straight slender bridge nose; thin lips.
```

### 398 · 찌르호크 (Staraptor)

계열 기준: 찌르꼬 · 설계: 직접 쓴 설계 · **그림 있음 — ①이 정본**

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 붉은 끝의 검정 볏과 힘센 날개의 맹금 이미지를, 올라간 좁은 눈매와 가는 직선 눈썹·얇은 입으로 해석했다. 찌르버드와는 부드러운 둥근 턱·보통 높이의 사람 코·가는 눈썹을 구분점으로 삼았다. 2026-10-15 확정 경장 ①이 정본이며 후속은 그 그림을 첨부한다.

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리

**조정:** 같은 계열 찌르꼬·찌르버드와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 눈썹 중간 두께의 직선 → 가늘고 곧은, 코 곧고 가는 콧대 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, average spacing; thin straight brows; balanced nose; thin lips.
```

### 399 · 비버니 (Bidoof)

계열 기준: 비버니 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘similar tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는, 코 보통 → 작고 여린 코, 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; feathered full brows; small delicate nose; medium lips.
```

### 400 · 비버통 (Bibarel)

계열 기준: 비버니 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘small red nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; small delicate nose; full lips.
```

### 401 · 귀뚤뚜기 (Kricketot)

계열 기준: 귀뚤뚜기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 귀뚜라미의 둥근 마디와 말린 더듬이를 둥근 볼과 작은 눈으로 해석한다.

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; straight medium brows; small delicate nose; small mouth.
```

### 402 · 귀뚤톡크 (Kricketune)

계열 기준: 귀뚤뚜기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘dark red, round nose’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; narrow tapered chin; narrow eyes, small size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; thin lips.
```

### 403 · 꼬링크 (Shinx)

계열 기준: 꼬링크 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 작은 전기 고양이의 큰 귀와 별무늬를 작은 턱과 열린 눈매로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘short tuft’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, wide-set; feathered full brows; small delicate nose; bow-shaped upper lip.
```

### 404 · 럭시오 (Luxio)

계열 기준: 꼬링크 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 검은 갈기와 전광의 선을 길어진 타원 윤곽과 선명한 눈으로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘tufty black mane’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; feathered full brows; small delicate nose; thin lips.
```

### 405 · 렌트라 (Luxray)

계열 기준: 꼬링크 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 큰 검은 갈기와 꿰뚫는 시선의 특징을 높은 광대와 낮고 굵은 눈썹으로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 보통

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, small size, level outer corners, wide-set; thick low brows; balanced nose; medium lips.
```

### 406 · 꼬몽울 (Budew)

계열 기준: 꼬몽울 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 닫힌 꽃봉오리와 작은 눈을 작은 턱과 낮은 눈꺼풀로 해석한다.

**원작 단서:** 키 0.2m → 얼굴 길이 짧은 얼굴 · ‘small, slit-like eyes’ → 눈매 가늘고 날카로운 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, medium width; narrow tapered chin; narrow eyes, medium size, downturned outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 407 · 로즈레이드 (Roserade)

계열 기준: 꼬몽울 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**조정:** 같은 계열 로젤리아와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈썹 길고 바깥 아치가 선명한 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 408 · 두개도스 (Cranidos)

계열 기준: 두개도스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘four spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘hard, blue, dome-shaped head’ → 얼굴 폭 넓은 얼굴 · ‘four spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘hooked beak’ → 눈매 강하게 치켜올라간 눈 · ‘hooked beak’ → 눈썹 바깥에서 꺾이는 사선 · ‘hooked beak’ → 코 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; aquiline nose with convex bridge; thin lips.
```

### 409 · 램펄드 (Rampardos)

계열 기준: 두개도스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘various spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘various spikes’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘various spikes’ → 눈매 가늘고 날카로운 눈 · ‘various spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘various spikes’ → 코 크고 또렷한 코 · ‘various spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱, 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; prominent defined nose; thin lips.
```

### 410 · 방패톱스 (Shieldon)

계열 기준: 방패톱스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 타원 방패 얼굴과 두드러진 눈썹을 넓은 윤곽과 굵은 낮은 눈썹으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘prominent white brow’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, wide-set; thick low brows; rounded soft tip nose; fuller lower lip.
```

### 411 · 바리톱스 (Bastiodon)

계열 기준: 방패톱스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘three dark gray spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘three dark gray spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three dark gray spikes’ → 눈매 가늘고 날카로운 눈 · ‘three dark gray spikes’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘three dark gray spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 눈꼬리 각도 수평 → 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; narrow eyes, medium size, upturned outer corners, wide-set; angled brows; straight slender bridge nose; thin lips.
```

### 412 · 도롱충이 (Burmy)

계열 기준: 도롱충이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘beak-like mouth and yellow eyes’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; prominent defined nose; thin lips.
```

### 413 · 도롱마담 (Wormadam)

계열 기준: 도롱충이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘oval eyes’ → 눈매 큰 눈 · ‘oval eyes’ → 눈꼬리 각도 수평 · ‘long pointed beak’ → 코 크고 또렷한 코 · ‘long pointed beak’ → 입술 도톰한 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; prominent defined nose; full lips.
```

### 414 · 나메일 (Mothim)

계열 기준: 도롱충이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; medium lips.
```

### 415 · 세꿀버리 (Combee)

계열 기준: 세꿀버리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘round, yellow face’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, yellow face’ → 얼굴 길이 짧은 얼굴 · ‘round, yellow face’ → 얼굴 폭 넓은 얼굴 · ‘round, yellow face’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round, yellow face’ → 눈매 큰 눈 · ‘two black, oval eyes’ → 눈꼬리 각도 수평

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; short rounded brows; rounded soft tip nose; thin lips.
```

### 416 · 비퀸 (Vespiquen)

계열 기준: 세꿀버리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; thin lips.
```

### 417 · 파치리스 (Pachirisu)

계열 기준: 파치리스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**원작 단서:** ‘three spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘three spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘three spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; almond eyes, large size, level outer corners, wide-set; angled brows; small delicate nose; small mouth.
```

### 418 · 브이젤 (Buizel)

계열 기준: 브이젤 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 짧은 얼굴 → 보통, 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; balanced nose; full lips.
```

### 419 · 플로젤 (Floatzel)

계열 기준: 브이젤 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 아랫입술이 더 도톰한 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; fuller lower lip.
```

### 420 · 체리버 (Cherubi)

계열 기준: 체리버 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘round, deep-pink body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, deep-pink body’ → 얼굴 길이 짧은 얼굴 · ‘round, deep-pink body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘round, deep-pink body’ → 눈썹 짧고 둥근 · ‘round, deep-pink body’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; short rounded brows; rounded soft tip nose; bow-shaped upper lip.
```

### 421 · 체리꼬 (Cherrim)

계열 기준: 체리버 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; narrow eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; medium lips.
```

### 422 · 깝질무 (Shellos)

계열 기준: 깝질무 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**원작 단서:** 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · ‘bulbous heads’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘bulbous heads’ → 눈썹 짧고 둥근 · ‘bulbous heads’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 얼굴 길이 보통 → 긴 얼굴

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; wide mouth.
```

### 423 · 트리토돈 (Gastrodon)

계열 기준: 깝질무 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round head’ → 얼굴 길이 짧은 얼굴 · ‘round head’ → 얼굴 폭 넓은 얼굴 · ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round head’ → 눈썹 짧고 둥근 · ‘round head’ → 코 코끝이 둥근

**조정:** 같은 계열 깝질무와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; short rounded brows; rounded soft tip nose; bow-shaped upper lip.
```

### 424 · 겟핸보숭 (Ambipom)

계열 기준: 에이팜 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘wide eyes’ → 눈매 큰 눈 · ‘wide eyes’ → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; full lips.
```

### 425 · 흔들풍손 (Drifloon)

계열 기준: 흔들풍손 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**원작 단서:** ‘spherical, purple body’ → 얼굴형 짧고 응축된 얼굴형 · ‘spherical, purple body’ → 얼굴 길이 짧은 얼굴 · ‘spherical, purple body’ → 얼굴 폭 넓은 얼굴 · ‘spherical, purple body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical, purple body’ → 눈매 큰 눈 · ‘spherical, purple body’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; small mouth.
```

### 426 · 둥실라이드 (Drifblim)

계열 기준: 흔들풍손 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘large, spherical, purple body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large, spherical, purple body’ → 얼굴 길이 짧은 얼굴 · ‘large, spherical, purple body’ → 얼굴 폭 넓은 얼굴 · ‘large, spherical, purple body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘large, spherical, purple body’ → 눈매 큰 눈 · ‘large, spherical, purple body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; full lips.
```

### 427 · 이어롤 (Buneary)

계열 기준: 이어롤 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 키 0.4m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 입술 윗입술이 활 모양인 → 보통

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; medium lips.
```

### 428 · 이어롭 (Lopunny)

계열 기준: 이어롤 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 토끼의 긴 귀와 부드러운 털 곡선을 긴 타원 얼굴와 도톰한 입술로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, average spacing; long arched brows; small delicate nose; full lips.
```

### 429 · 무우마직 (Mismagius)

계열 기준: 무우마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 마녀 모자와 가늘고 긴 입을 긴 얼굴와 올라간 눈매로 구분한다.

**원작 단서:** ‘round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round head’ → 얼굴 길이 짧은 얼굴 · ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, wide-set; long arched brows; balanced nose; thin lips.
```

### 430 · 돈크로우 (Honchkrow)

계열 기준: 니로우 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘broad, short neck’ → 얼굴형 길고 세련된 얼굴형 · ‘broad, short neck’ → 얼굴 길이 긴 얼굴 · ‘broad, short neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘broad, short neck’ → 눈매 아몬드형 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, upturned outer corners, close-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 431 · 나옹마 (Glameow)

계열 기준: 나옹마 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘small black nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; balanced jawline; sharp eyes, medium size, upturned outer corners, wide-set; long arched brows; small delicate nose; thin lips.
```

### 432 · 몬냥이 (Purugly)

계열 기준: 나옹마 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**조정:** 같은 계열 나옹마와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; balanced nose; thin lips.
```

### 433 · 랑딸랑 (Chingling)

계열 기준: 랑딸랑 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 방울과 붉은 구슬의 원형 반복을 둥근 얼굴와 작은 입으로 해석한다.

**원작 단서:** 키 0.2m → 얼굴 길이 짧은 얼굴 · 에스퍼 타입 → 눈매 아몬드형 눈 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 큰 눈 → 아몬드형 눈, 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; thin straight brows; small delicate nose; small mouth.
```

### 434 · 스컹뿡 (Stunky)

계열 기준: 스컹뿡 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘two pointed ears’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운, 눈썹 가늘고 완만한 곡선 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; long arched brows; rounded soft tip nose; full lips.
```

### 435 · 스컹탱크 (Skuntank)

계열 기준: 스컹뿡 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘spiky fur’ → 얼굴형 각지고 선명한 얼굴형 · ‘spiky fur’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘spiky fur’ → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘spiky fur’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; sharp eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; full lips.
```

### 436 · 동미러 (Bronzor)

계열 기준: 동미러 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round yellow eyes’ → 눈매 큰 눈 · ‘round yellow eyes’ → 눈꼬리 각도 수평 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; angled brows; small delicate nose; thin lips.
```

### 437 · 동탁군 (Bronzong)

계열 기준: 동미러 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 무게 187kg → 코 콧대가 낮고 넓은

**조정:** 같은 계열 동미러와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; angled brows; broad low bridge nose; thin lips.
```

### 438 · 꼬지지 (Bonsly)

계열 기준: 꼬지지 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 분재의 작은 둥근 몸과 눈물 같은 인상을 타원 얼굴와 내려간 눈꼬리로 해석한다.

**원작 단서:** 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; almond eyes, medium size, downturned outer corners, close-set; fine soft arches; rounded soft tip nose; small mouth.
```

### 439 · 흉내내 (Mime Jr.)

계열 기준: 흉내내 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 흉내 내는 작은 몸의 표현성을 넓은 상안면과 선명한 입술 곡선으로 해석한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 에스퍼 타입 → 눈썹 가늘고 곧은 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 같은 계열 마임맨와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 길고 바깥 아치가 선명한 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, close-set; thin straight brows; small delicate nose; bow-shaped upper lip.
```

### 440 · 핑복 (Happiny)

계열 기준: 핑복 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** ‘soft, smooth, light pink body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘soft, smooth, light pink body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘soft, smooth, light pink body’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; short rounded brows; balanced nose; medium lips.
```

### 441 · 페라페 (Chatot)

계열 기준: 페라페 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 음표 머리와 노래하는 특징을 타원 윤곽과 열린 눈매 및 넓은 입으로 해석한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, large size, level outer corners, close-set; long arched brows; small delicate nose; wide mouth.
```

### 442 · 화강돌 (Spiritomb)

계열 기준: 화강돌 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 턱끝이 뒤로 물러난 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 초승달 눈과 들쭉날쭉한 입 및 봉인된 구체를 넓은 얼굴와 날카로운 눈으로 해석한다.

**원작 단서:** 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · 악 타입 → 눈매 강하게 치켜올라간 눈 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 턱끝이 뒤로 물러난, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; receding soft chin; sharp eyes, medium size, upturned outer corners, close-set; angled brows; small delicate nose; wide mouth.
```

### 443 · 딥상어동 (Gible)

계열 기준: 딥상어동 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**원작 단서:** ‘two horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two horns’ → 눈매 가늘고 날카로운 눈 · ‘two horns’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; long nose with low tip; wide mouth.
```

### 444 · 한바이트 (Gabite)

계열 기준: 딥상어동 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**원작 단서:** 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 같은 계열 딥상어동와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 길고 코끝이 내려온 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; broad low bridge nose; wide mouth.
```

### 445 · 한카리아스 (Garchomp)

계열 기준: 딥상어동 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 굴곡 없이 곧은 |

**이유:** 상어형 용의 큰 턱과 삼각 지느러미를 각진 하관과 날카로운 긴 눈으로 해석한다.

**원작 단서:** ‘small, white spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘small, white spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small, white spikes’ → 눈매 강하게 치켜올라간 눈 · ‘small, white spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘small, white spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘small, white spikes’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 딥상어동와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; long nose with low tip; straight even lips.
```

### 446 · 먹고자 (Munchlax)

계열 기준: 먹고자 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**원작 단서:** ‘round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round head’ → 얼굴 길이 짧은 얼굴 · ‘round head’ → 얼굴 폭 넓은 얼굴 · ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round head’ → 눈매 큰 눈 · ‘big, round eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; medium lips.
```

### 447 · 리오르 (Riolu)

계열 기준: 리오르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 작은 파동 수행자의 또렷한 실루엣을 작은 턱과 열린 눈매로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, close-set; straight medium brows; small delicate nose; medium lips.
```

### 448 · 루카리오 (Lucario)

계열 기준: 리오르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 긴 주둥이와 파동을 읽는 집중을 긴 중안부와 또렷한 수평 눈으로 옮긴다.

**원작 단서:** ‘long snout’ → 얼굴 길이 긴 얼굴 · ‘short, round spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘short, round spike’ → 눈매 가늘고 날카로운 눈 · ‘long snout’ → 코 길고 코끝이 내려온 · ‘short, round spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱, 코 보통 → 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; long nose with low tip; thin lips.
```

### 449 · 히포포타스 (Hippopotas)

계열 기준: 히포포타스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 보통 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 하마의 큰 주둥이와 둥근 귀를 넓은 하관 및 둥근 코끝으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; balanced jawline; open rounded eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; wide mouth.
```

### 450 · 하마돈 (Hippowdon)

계열 기준: 히포포타스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 더 큰 하마의 무게감과 강한 앞니를 넓고 단단한 턱과 작은 깊은 눈으로 구분한다.

**원작 단서:** 무게 300kg → 얼굴 폭 넓은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, wide-set; straight medium brows; balanced nose; wide mouth.
```

### 451 · 스콜피 (Skorupi)

계열 기준: 스콜피 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 작은 전갈의 집게와 마디를 좁은 턱과 선명한 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; thick low brows; straight slender bridge nose; thin lips.
```

### 452 · 드래피온 (Drapion)

계열 기준: 스콜피 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 거대한 전갈 집게와 각진 마디를 각진 턱과 강한 사선 눈썹으로 구분한다.

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · 악 타입 → 눈매 강하게 치켜올라간 눈 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; sharp eyes, medium size, upturned outer corners, average spacing; thick low brows; balanced nose; wide mouth.
```

### 453 · 삐딱구리 (Croagunk)

계열 기준: 삐딱구리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; full lips.
```

### 454 · 독개굴 (Toxicroak)

계열 기준: 삐딱구리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘gently-upward curling spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘gently-upward curling spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘gently-upward curling spike’ → 눈매 가늘고 날카로운 눈 · ‘gently-upward curling spike’ → 눈썹 굵고 눈 가까이 낮은 · ‘gently-upward curling spike’ → 코 크고 또렷한 코

**조정:** 같은 계열 삐딱구리와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; prominent defined nose; full lips.
```

### 455 · 무스틈니 (Carnivine)

계열 기준: 무스틈니 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 tentacles → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘circular eyes’ → 눈매 큰 눈 · ‘circular eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; thin lips.
```

### 456 · 형광어 (Finneon)

계열 기준: 형광어 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통, 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, wide-set; angled brows; balanced nose; fuller lower lip.
```

### 457 · 네오라이트 (Lumineon)

계열 기준: 형광어 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 같은 계열 형광어와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 턱선과 골격이 날카로운 얼굴형, 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, wide-set; angled brows; small delicate nose; medium lips.
```

### 458 · 타만타 (Mantyke)

계열 기준: 타만타 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘round body’ → 눈썹 가늘고 완만한 곡선 · ‘round body’ → 코 코끝이 둥근 · ‘round body’ → 입술 도톰한 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; fine soft arches; rounded soft tip nose; full lips.
```

### 459 · 눈쓰개 (Snover)

계열 기준: 눈쓰개 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘two green spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘two green spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two green spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘two green spikes’ → 코 곧고 가는 콧대 · ‘two green spikes’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; open rounded eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 460 · 눈설왕 (Abomasnow)

계열 기준: 눈쓰개 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘bushy eyebrows’ → 눈썹 굵고 눈 가까이 낮은 · 얼음 타입 → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; thick low brows; straight slender bridge nose; bow-shaped upper lip.
```

### 461 · 포푸니라 (Weavile)

계열 기준: 포푸니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 갈고리 발톱과 날카로운 볏을 높은 광대와 치켜올라간 눈으로 구분한다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈 · 얼음 타입 → 코 곧고 가는 콧대

**조정:** 같은 계열 포푸니와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; thin straight brows; straight slender bridge nose; thin lips.
```

### 462 · 자포코일 (Magnezone)

계열 기준: 코일 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 강철 타입 → 입술 굴곡 없이 곧은

**조정:** 같은 계열 코일·레어코일와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; open rounded eyes, large size, level outer corners, average spacing; straight medium brows; balanced nose; straight even lips.
```

### 463 · 내룸벨트 (Lickilicky)

계열 기준: 내루미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 말린 볏과 넉넉한 둥근 몸 및 긴 혀의 존재감을 넓은 볼과 도톰한 입술로 해석한다.

**조정:** 같은 계열 내루미와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; thin lips.
```

### 464 · 거대코뿌리 (Rhyperior)

계열 기준: 뿔카노 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** ‘two horns’ → 얼굴형 각지고 선명한 얼굴형 · 무게 282.8kg → 얼굴 폭 넓은 얼굴 · ‘two horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two horns’ → 눈매 가늘고 날카로운 눈 · ‘two horns’ → 눈꼬리 각도 올라간 눈꼬리 · ‘two horns’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴, 눈꼬리 각도 수평 → 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, upturned outer corners, average spacing; angled brows; broad low bridge nose; thin lips.
```

### 465 · 덩쿠림보 (Tangrowth)

계열 기준: 덩쿠리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; straight even lips.
```

### 466 · 에레키블 (Electivire)

계열 기준: 에레키드 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; fine soft arches; short nose with upturned tip; full lips.
```

### 467 · 마그마번 (Magmortar)

계열 기준: 마그비 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘egg-shaped body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘egg-shaped body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘four pink spikes’ → 눈매 가늘고 날카로운 눈 · ‘four pink spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘four pink spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘egg-shaped body’ → 코 코끝이 둥근

**조정:** 같은 계열 마그마와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, average spacing; angled brows; rounded soft tip nose; thin lips.
```

### 468 · 토게키스 (Togekiss)

계열 기준: 토게피 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 넓고 둥근 날개와 행복의 특징을 넓은 볼과 완만한 눈매로 해석한다.

**원작 단서:** ‘ovoid body’ → 얼굴 폭 넓은 얼굴 · ‘ovoid body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘ovoid body’ → 눈썹 가늘고 완만한 곡선 · ‘ovoid body’ → 코 코끝이 둥근 · ‘ovoid body’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 부드럽고 둥근 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; almond eyes, medium size, downturned outer corners, close-set; fine soft arches; rounded soft tip nose; full lips.
```

### 469 · 메가자리 (Yanmega)

계열 기준: 왕자리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**원작 단서:** ‘black triangular plate’ → 얼굴형 각지고 선명한 얼굴형 · ‘two large, white fangs’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘black triangular plate’ → 눈매 가늘고 날카로운 눈 · ‘black triangular plate’ → 눈썹 바깥에서 꺾이는 사선 · ‘black triangular plate’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 바깥에서 꺾이는 사선, 코 보통 → 곧고 가는 콧대, 입술 굴곡 없이 곧은 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; medium lips.
```

### 470 · 리피아 (Leafeon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 잎의 가늘고 부드러운 선을 타원 얼굴과 긴 아몬드형 눈으로 해석한다.

**조정:** 같은 계열 에브이·블래키와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 눈썹 길고 바깥 아치가 선명한 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; thin lips.
```

### 471 · 글레이시아 (Glaceon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 얼음 결정의 각진 선을 높은 광대와 직선적인 긴 눈으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 얼음 타입 → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, small size, level outer corners, wide-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 472 · 글라이온 (Gliscor)

계열 기준: 글라이거 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘six visible fangs’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 작은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, close-set; fine soft arches; small delicate nose; straight even lips.
```

### 473 · 맘모꾸리 (Mamoswine)

계열 기준: 꾸꾸리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 두 송곳니와 큰 털 체적을 넓은 얼굴와 작고 깊은 눈으로 해석한다.

**원작 단서:** 무게 291kg → 얼굴 폭 넓은 얼굴

**조정:** 같은 계열 메꾸리와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 입이 넓은 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, upturned outer corners, average spacing; thick low brows; rounded soft tip nose; medium lips.
```

### 474 · 폴리곤Z (Porygon-Z)

계열 기준: 폴리곤 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**원작 단서:** ‘blue bill’ → 코 콧대가 낮고 넓은 · ‘blue bill’ → 입술 입이 넓은

**조정:** 같은 계열 폴리곤와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; broad low bridge nose; wide mouth.
```

### 475 · 엘레이드 (Gallade)

계열 기준: 랄토스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**이유:** 칼날 팔과 기사의 절제된 선을 긴 얼굴과 깊은 수평 눈매로 구분한다.

**원작 단서:** ‘thin green torso’ → 얼굴형 길고 세련된 얼굴형 · ‘thin green torso’ → 얼굴 길이 긴 얼굴 · ‘thin green torso’ → 얼굴 폭 좁은 얼굴 · ‘thin green torso’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘sharp red plate’ → 눈매 가늘고 날카로운 눈 · ‘sharp red plate’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; balanced nose; straight even lips.
```

### 476 · 대코파스 (Probopass)

계열 기준: 코코파스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘small round eyes’ → 눈매 큰 눈 · ‘small round eyes’ → 눈 크기 작은 눈 · ‘small round eyes’ → 눈꼬리 각도 수평 · 몸 형태 heads → 눈 간격 눈 사이가 가까운

**조정:** 같은 계열 코코파스와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; open rounded eyes, small size, level outer corners, close-set; straight medium brows; balanced nose; straight even lips.
```

### 477 · 야느와르몽 (Dusknoir)

계열 기준: 해골몽 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 움켜쥐는 큰 몸과 높은 칼라의 수직선을 긴 얼굴와 낮은 눈꺼풀로 해석한다.

**원작 단서:** 고스트 타입 → 눈매 살짝 처진 부드러운 눈

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; balanced nose; wide mouth.
```

### 478 · 눈여아 (Froslass)

계열 기준: 눈꼬마 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 보통, 눈매 가늘고 날카로운 눈 → 아몬드형 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 479 · 로토무 (Rotom)

계열 기준: 로토무 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 플라스마의 번쩍이는 예리함과 장난스러운 실루엣을 작은 턱과 열린 눈으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, close-set; angled brows; small delicate nose; wide mouth.
```

### 480 · 유크시 (Uxie)

계열 기준: 유크시 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 지식과 둥근 투구의 고요한 중심을 낮은 눈꺼풀과 정돈된 타원 얼굴로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 키 0.3m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, close-set; straight medium brows; small delicate nose; thin lips.
```

### 481 · 엠라이트 (Mesprit)

계열 기준: 엠라이트 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 감정과 펼쳐진 머리 장식의 유연함을 작은 턱과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, close-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 482 · 아그놈 (Azelf)

계열 기준: 아그놈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 의지와 원뿔형 머리의 뾰족한 선을 높은 광대와 집중된 긴 눈으로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, average spacing; thin straight brows; small delicate nose; thin lips.
```

### 483 · 디아루가 (Dialga)

계열 기준: 디아루가 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 강철 용의 긴 면과 시간의 정돈된 이미지를 각진 긴 얼굴로 해석한다.

**원작 단서:** ‘chest plate’ → 얼굴형 각지고 선명한 얼굴형 · ‘chest plate’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘chest plate’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘chest plate’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, wide-set; straight medium brows; long nose with low tip; thin lips.
```

### 484 · 펄기아 (Palkia)

계열 기준: 펄기아 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 공간 용의 큰 체적과 둥근 장갑을 넓은 하관과 깊은 눈매로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘round purple-striped plates’ → 얼굴 폭 넓은 얼굴 · ‘round purple-striped plates’ → 눈매 가늘고 날카로운 눈 · ‘round purple-striped plates’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 눈썹 굵고 눈 가까이 낮은 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, long length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; wide mouth.
```

### 485 · 히드런 (Heatran)

계열 기준: 히드런 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 무게 430kg → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱, 눈매 가늘고 날카로운 눈 → 아몬드형 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; almond eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 486 · 레지기가스 (Regigigas)

계열 기준: 레지기가스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 거대한 체적과 반복된 보석을 넓고 정돈된 얼굴로 해석한다. 일곱 눈은 사람의 두 눈으로 번역한다.

**원작 단서:** 무게 420kg → 얼굴 폭 넓은 얼굴 · ‘seven black circular eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 입이 넓은 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, close-set; thick low brows; balanced nose; fuller lower lip.
```

### 487 · 기라티나 (Giratina)

계열 기준: 기라티나 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 거꾸로 된 세계의 길고 분절된 용을 긴 얼굴과 날카로운 눈매로 해석한다.

**원작 단서:** ‘long neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘long neck’ → 얼굴 폭 좁은 얼굴 · ‘long neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘two large horns’ → 눈매 가늘고 날카로운 눈 · ‘two large horns’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, close-set; angled brows; long nose with low tip; wide mouth.
```

### 488 · 크레세리아 (Cresselia)

계열 기준: 크레세리아 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 크고 또렷한 코 |
| 입 | 보통 |

**이유:** 초승달과 길게 흐르는 곡선을 타원 얼굴과 완만한 긴 눈매로 옮긴다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · ‘pointed, beak-like snout’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; prominent defined nose; medium lips.
```

### 489 · 피오네 (Phione)

계열 기준: 피오네 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 둥근 머리와 작은 해양 몸을 둥근 볼과 부드러운 타원 눈으로 해석한다.

**원작 단서:** ‘round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round head’ → 얼굴 길이 짧은 얼굴 · ‘round head’ → 얼굴 폭 넓은 얼굴 · ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round head’ → 눈매 큰 눈 · ‘round head’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, average spacing; short rounded brows; small delicate nose; small mouth.
```

### 490 · 마나피 (Manaphy)

계열 기준: 마나피 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 긴 더듬이와 속눈썹 무늬를 넓은 상안면과 큰 선명한 사람 눈으로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 윗입술이 활 모양인 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, wide-set; long arched brows; small delicate nose; fuller lower lip.
```

### 491 · 다크라이 (Darkrai)

계열 기준: 다크라이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 보통 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 어둠 속에 흐르는 머리와 악몽의 절제된 긴장을 긴 얼굴 및 낮은 눈꺼풀로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; balanced jawline; drooping eyes, medium size, downturned outer corners, close-set; straight medium brows; balanced nose; thin lips.
```

### 492 · 쉐이미 (Shaymin)

계열 기준: 쉐이미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 작은 풀뭉치의 둥근 핵심을 둥근 볼과 작고 부드러운 이목구비로 해석한다.

**원작 단서:** 키 0.2m → 얼굴형 짧고 응축된 얼굴형 · 키 0.2m → 얼굴 길이 짧은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; balanced nose; small mouth.
```

### 493 · 아르세우스 (Arceus)

계열 기준: 아르세우스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**이유:** 고리의 대칭과 신성한 긴 실루엣을 정돈된 긴 얼굴과 고요한 눈매로 해석한다.

**원작 단서:** 키 3.2m → 얼굴형 길고 세련된 얼굴형 · 키 3.2m → 얼굴 길이 긴 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 무게 320kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, wide-set; straight medium brows; broad low bridge nose; thin lips.
```

## 5세대 · 156종

### 494 · 비크티니 (Victini)

계열 기준: 비크티니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** V형 머리와 승리의 생동감을 작은 턱과 열린 눈매로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; angled brows; small delicate nose; bow-shaped upper lip.
```

### 495 · 주리비얀 (Snivy)

계열 기준: 주리비얀 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 풀뱀의 긴 선과 낮은 눈꺼풀을 길고 좁은 사람 얼굴로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; long arched brows; straight slender bridge nose; thin lips.
```

### 496 · 샤비 (Servine)

계열 기준: 주리비얀 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 부채처럼 펼친 잎과 가벼운 몸을 타원 얼굴과 올라간 긴 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; small delicate nose; thin lips.
```

### 497 · 샤로다 (Serperior)

계열 기준: 주리비얀 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 왕 같은 긴 뱀 실루엣을 긴 중안부와 가늘고 긴 눈으로 해석한다.

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; balanced jawline; narrow eyes, small size, level outer corners, average spacing; long arched brows; long nose with low tip; thin lips.
```

### 498 · 뚜꾸리 (Tepig)

계열 기준: 뚜꾸리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 작은 돼지의 둥근 주둥이를 둥근 코끝과 둥근 볼로 옮긴다.

**원작 단서:** ‘oval eyes’ → 눈매 큰 눈 · ‘oval eyes’ → 눈꼬리 각도 수평 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; medium lips.
```

### 499 · 차오꿀 (Pignite)

계열 기준: 뚜꾸리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 넓어진 격투 몸을 넓은 하관과 굵은 직선 눈썹으로 구분한다.

**원작 단서:** ‘chubby body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘chubby body’ → 얼굴 폭 넓은 얼굴 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은 · ‘chubby body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; wide heavy chin; almond eyes, large size, level outer corners, average spacing; thick low brows; rounded soft tip nose; wide mouth.
```

### 500 · 염무왕 (Emboar)

계열 기준: 뚜꾸리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 넓은 |

**이유:** 큰 체적과 불꽃 수염의 위용을 단단한 넓은 턱과 낮은 눈썹으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 무게 150kg → 얼굴 폭 넓은 얼굴 · ‘large bushy black eyebrows’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, close-set; thick low brows; prominent defined nose; wide mouth.
```

### 501 · 수댕이 (Oshawott)

계열 기준: 수댕이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 작은 수달의 둥근 얼굴과 조개를 둥근 볼과 짧은 코로 옮긴다.

**원작 단서:** ‘spherical white head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical white head’ → 얼굴 길이 짧은 얼굴 · ‘spherical white head’ → 얼굴 폭 넓은 얼굴 · ‘spherical white head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical white head’ → 눈매 큰 눈 · ‘spherical white head’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; thin straight brows; rounded soft tip nose; small mouth.
```

### 502 · 쌍검자비 (Dewott)

계열 기준: 수댕이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**이유:** 쌍조개와 수행자의 정돈된 인상을 타원 얼굴과 집중 눈매로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; straight even lips.
```

### 503 · 대검귀 (Samurott)

계열 기준: 수댕이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 갑옷 수달의 긴 선과 무사의 인상을 긴 얼굴와 단단한 눈썹으로 해석한다.

**원작 단서:** ‘spear-like horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘spear-like horn’ → 눈매 가늘고 날카로운 눈 · ‘spear-like horn’ → 눈썹 굵고 눈 가까이 낮은 · ‘spear-like horn’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; thin lips.
```

### 504 · 보르쥐 (Patrat)

계열 기준: 보르쥐 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 망보기와 큰 앞니의 특징을 열린 눈매 및 넓은 입 너비로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, large size, level outer corners, wide-set; straight medium brows; balanced nose; wide mouth.
```

### 505 · 보르그 (Watchog)

계열 기준: 보르쥐 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘small black pupils’ → 눈 크기 작은 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 윗입술이 활 모양인 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; long arched brows; small delicate nose; fuller lower lip.
```

### 506 · 요테리 (Lillipup)

계열 기준: 요테리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** 키 0.4m → 얼굴형 짧고 응축된 얼굴형 · 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, wide-set; fine soft arches; balanced nose; full lips.
```

### 507 · 하데리어 (Herdier)

계열 기준: 요테리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘long, cream fur’ → 얼굴형 길고 세련된 얼굴형 · ‘long, cream fur’ → 얼굴 길이 긴 얼굴 · ‘long, cream fur’ → 얼굴 폭 좁은 얼굴 · ‘long, cream fur’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long, cream fur’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 같은 계열 요테리와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; balanced nose; full lips.
```

### 508 · 바랜드 (Stoutland)

계열 기준: 요테리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**조정:** 같은 계열 요테리와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; full lips.
```

### 509 · 쌔비냥 (Purrloin)

계열 기준: 쌔비냥 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; full lips.
```

### 510 · 레파르다스 (Liepard)

계열 기준: 쌔비냥 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**조정:** 같은 계열 쌔비냥와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 짧은 얼굴 → 보통, 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; rounded soft tip nose; full lips.
```

### 511 · 야나프 (Pansage)

계열 기준: 야나프 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 가늘고 완만한 곡선, 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; prominent defined nose; bow-shaped upper lip.
```

### 512 · 야나키 (Simisage)

계열 기준: 야나프 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘shoulder tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; feathered full brows; rounded soft tip nose; full lips.
```

### 513 · 바오프 (Pansear)

계열 기준: 바오프 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 불꽃처럼 말린 머리털과 작은 원숭이의 생동감을 작은 턱과 열린 눈으로 해석한다.

**원작 단서:** ‘whorled tuft’ → 눈썹 숱 많고 결이 보이는 · ‘tiny nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; feathered full brows; small delicate nose; wide mouth.
```

### 514 · 바오키 (Simisear)

계열 기준: 바오프 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘white, fluffy shoulder ruffs’ → 눈썹 숱 많고 결이 보이는 · ‘small black nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; feathered full brows; small delicate nose; full lips.
```

### 515 · 앗차프 (Panpour)

계열 기준: 앗차프 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 물결 같은 볏과 원숭이의 가벼운 곡선을 타원 얼굴와 완만한 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘puffy, wave-like crest’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘puffy, wave-like crest’ → 눈썹 짧고 둥근 · ‘puffy, wave-like crest’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; short rounded brows; rounded soft tip nose; medium lips.
```

### 516 · 앗차키 (Simipour)

계열 기준: 앗차프 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘oval eyes’ → 눈매 큰 눈 · ‘oval eyes’ → 눈꼬리 각도 수평 · ‘several tufts’ → 눈썹 숱 많고 결이 보이는 · ‘small black nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는, 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; feathered full brows; small delicate nose; fuller lower lip.
```

### 517 · 몽나 (Munna)

계열 기준: 몽나 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 둥근 꿈먹기 몸과 가는 주둥이를 둥근 볼과 낮은 눈꺼풀로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 짧은 얼굴 → 보통, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; fine soft arches; rounded soft tip nose; small mouth.
```

### 518 · 몽얌나 (Musharna)

계열 기준: 몽나 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**이유:** 맥의 큰 몸과 꿈결의 흐르는 곡선을 넓은 볼과 도톰한 입술로 구분한다.

**조정:** 같은 계열 몽나와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 코끝이 둥근 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; drooping eyes, medium size, downturned outer corners, close-set; fine soft arches; straight slender bridge nose; full lips.
```

### 519 · 콩둘기 (Pidove)

계열 기준: 콩둘기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 작은 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · ‘short, black beak’ → 코 크고 또렷한 코 · ‘short, black beak’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 코 곧고 가는 콧대 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, average spacing; straight medium brows; prominent defined nose; small mouth.
```

### 520 · 유토브 (Tranquill)

계열 기준: 콩둘기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘black tuft’ → 눈썹 숱 많고 결이 보이는 · ‘yellow beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; feathered full brows; straight slender bridge nose; thin lips.
```

### 521 · 켄호로우 (Unfezant)

계열 기준: 콩둘기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘heart-shaped patch’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 같은 계열 유토브와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 곧고 가는 콧대 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; straight medium brows; balanced nose; thin lips.
```

### 522 · 줄뮤마 (Blitzle)

계열 기준: 줄뮤마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 작은 얼룩말의 번개 갈기를 긴 중안부와 열린 눈매로 해석한다.

**원작 단서:** ‘spiky, white mane’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘spiky, white mane’ → 눈썹 바깥에서 꺾이는 사선 · ‘spiky, white mane’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; almond eyes, large size, level outer corners, wide-set; angled brows; long nose with low tip; thin lips.
```

### 523 · 제브라이카 (Zebstrika)

계열 기준: 줄뮤마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**이유:** 큰 얼룩말의 날카로운 갈기와 강한 체적을 긴 얼굴와 굵은 눈썹으로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; long nose with low tip; medium lips.
```

### 524 · 단굴 (Roggenrola)

계열 기준: 단굴 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘navy-blue faceted rock’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 legs → 얼굴 폭 좁은 얼굴 · ‘navy-blue faceted rock’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘navy-blue faceted rock’ → 눈매 강하게 치켜올라간 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘navy-blue faceted rock’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; sharp eyes, medium size, level outer corners, close-set; angled brows; prominent defined nose; thin lips.
```

### 525 · 암트르 (Boldore)

계열 기준: 단굴 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**원작 단서:** 몸 형태 tentacles → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; small mouth.
```

### 526 · 기가이어스 (Gigalith)

계열 기준: 단굴 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** ‘blue quadrupedal rock body’ → 얼굴형 각지고 선명한 얼굴형 · 무게 260kg → 얼굴 폭 넓은 얼굴 · ‘blue quadrupedal rock body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘blue quadrupedal rock body’ → 눈매 가늘고 날카로운 눈 · 무게 260kg → 코 콧대가 낮고 넓은 · ‘blue quadrupedal rock body’ → 입술 얇은 입술

**조정:** 같은 계열 암트르와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴, 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선, 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; broad low bridge nose; thin lips.
```

### 527 · 또르박쥐 (Woobat)

계열 기준: 또르박쥐 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**원작 단서:** 키 0.4m → 얼굴 길이 짧은 얼굴 · 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 에스퍼 타입 → 눈썹 가늘고 곧은 · 몸 형태 wings → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, close-set; thin straight brows; straight slender bridge nose; small mouth.
```

### 528 · 맘박쥐 (Swoobat)

계열 기준: 또르박쥐 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 wings → 코 곧고 가는 콧대

**조정:** 같은 계열 또르박쥐와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; fine soft arches; straight slender bridge nose; small mouth.
```

### 529 · 두더류 (Drilbur)

계열 기준: 두더류 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 균형 잡힌 타원형, 코 작고 여린 코 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; broad low bridge nose; thin lips.
```

### 530 · 몰드류 (Excadrill)

계열 기준: 두더류 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 드릴 날과 땅밑을 파는 단단한 힘을 각진 하관과 작은 깊은 눈으로 해석한다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, wide-set; thick low brows; straight slender bridge nose; wide mouth.
```

### 531 · 다부니 (Audino)

계열 기준: 다부니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 소리를 듣는 큰 귀와 부드러운 체적을 완만한 타원 얼굴와 둥근 코끝으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘floppy ears’ → 눈꼬리 각도 처진 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; straight medium brows; rounded soft tip nose; full lips.
```

### 532 · 으랏차 (Timburr)

계열 기준: 으랏차 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘bulbous protrusions’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘bulbous protrusions’ → 얼굴 폭 넓은 얼굴 · ‘bulbous protrusions’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘bulbous protrusions’ → 눈매 큰 눈 · ‘dark-gray oval-shaped eyes’ → 눈꼬리 각도 수평 · ‘bulbous protrusions’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; bow-shaped upper lip.
```

### 533 · 토쇠골 (Gurdurr)

계열 기준: 으랏차 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘large, round dark-red nose’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; rounded soft tip nose; bow-shaped upper lip.
```

### 534 · 노보청 (Conkeldurr)

계열 기준: 으랏차 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**원작 단서:** ‘prominent brow’ → 눈썹 굵고 눈 가까이 낮은 · ‘large nose’ → 코 코끝이 둥근 · ‘wide mouth’ → 입술 입이 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; wide mouth.
```

### 535 · 동챙이 (Tympole)

계열 기준: 동챙이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘wide mouth’ → 턱선 · 턱끝 넓고 묵직한 턱끝 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘wide mouth’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 묵직한 턱끝

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; wide heavy chin; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; wide mouth.
```

### 536 · 두까비 (Palpitoad)

계열 기준: 동챙이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**원작 단서:** ‘ovoid body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘ovoid body’ → 얼굴 길이 짧은 얼굴 · ‘ovoid body’ → 얼굴 폭 넓은 얼굴 · ‘ovoid body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘ovoid body’ → 눈매 큰 눈 · ‘ovoid body’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 코 코끝이 둥근 → 작고 여린 코

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; short rounded brows; small delicate nose; wide mouth.
```

### 537 · 두빅굴 (Seismitoad)

계열 기준: 동챙이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**조정:** 같은 계열 동챙이·두까비와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; wide mouth.
```

### 538 · 던지미 (Throh)

계열 기준: 던지미 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round head’ → 얼굴 길이 짧은 얼굴 · ‘round head’ → 얼굴 폭 넓은 얼굴 · ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘rocky skin’ → 눈매 가늘고 날카로운 눈 · ‘rocky skin’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; rounded soft tip nose; thin lips.
```

### 539 · 타격귀 (Sawk)

계열 기준: 타격귀 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘rocky skin’ → 얼굴형 각지고 선명한 얼굴형 · ‘rocky skin’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘rocky skin’ → 눈매 가늘고 날카로운 눈 · ‘rocky skin’ → 눈썹 굵고 눈 가까이 낮은 · ‘rocky skin’ → 코 곧고 가는 콧대 · ‘rocky skin’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; straight slender bridge nose; thin lips.
```

### 540 · 두르보 (Sewaddle)

계열 기준: 두르보 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 짧고 코끝이 들린 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘large, spherical head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large, spherical head’ → 얼굴 길이 짧은 얼굴 · ‘large, spherical head’ → 얼굴 폭 넓은 얼굴 · ‘large, spherical head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘large, spherical head’ → 눈썹 짧고 둥근 · ‘large, spherical head’ → 코 짧고 코끝이 들린

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; short rounded brows; short nose with upturned tip; bow-shaped upper lip.
```

### 541 · 두르쿤 (Swadloon)

계열 기준: 두르보 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 크고 또렷한 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, average spacing; long arched brows; prominent defined nose; bow-shaped upper lip.
```

### 542 · 모아머 (Leavanny)

계열 기준: 두르보 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**원작 단서:** ‘large, round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large, round head’ → 얼굴 길이 짧은 얼굴 · ‘large, round head’ → 얼굴 폭 넓은 얼굴 · ‘large, round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘large, round head’ → 코 코끝이 둥근 · ‘large, round head’ → 입술 입이 작은

**조정:** 같은 계열 두르보와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 짧고 둥근 → 길고 바깥 아치가 선명한, 입술 윗입술이 활 모양인 → 입이 작은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; rounded soft tip nose; small mouth.
```

### 543 · 마디네 (Venipede)

계열 기준: 마디네 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 지네의 둥근 마디와 날카로운 뿔을 둥근 얼굴 안의 선명한 눈매로 해석한다.

**원작 단서:** 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; thin lips.
```

### 544 · 휠구 (Whirlipede)

계열 기준: 마디네 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 크기 작은 눈 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 545 · 펜드라 (Scolipede)

계열 기준: 마디네 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 거대한 지네의 긴 몸과 뿔을 긴 윤곽과 날카로운 긴 눈으로 구분한다.

**원작 단서:** 키 2.5m → 얼굴형 길고 세련된 얼굴형 · 키 2.5m → 얼굴 길이 긴 얼굴 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; thick low brows; long nose with low tip; thin lips.
```

### 546 · 소미안 (Cottonee)

계열 기준: 소미안 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘orange, oval-shaped eyes’ → 눈매 큰 눈 · ‘orange, oval-shaped eyes’ → 눈꼬리 각도 수평 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 크고 또렷한 코, 입술 도톰한 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; prominent defined nose; bow-shaped upper lip.
```

### 547 · 엘풍 (Whimsicott)

계열 기준: 소미안 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘large cotton-like mane’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large cotton-like mane’ → 얼굴 길이 짧은 얼굴 · ‘large cotton-like mane’ → 얼굴 폭 넓은 얼굴 · ‘large cotton-like mane’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘large cotton-like mane’ → 눈매 큰 눈 · ‘orange oval eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; angled brows; rounded soft tip nose; straight even lips.
```

### 548 · 치릴리 (Petilil)

계열 기준: 치릴리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 blob → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 549 · 드레디어 (Lilligant)

계열 기준: 치릴리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**이유:** 큰 꽃과 드레스 같은 실루엣을 완만한 타원 얼굴과 곡선 입술로 해석한다.

**원작 단서:** 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱

**조정:** 같은 계열 치릴리와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 윗입술이 활 모양인 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; small delicate nose; straight even lips.
```

### 550 · 배쓰나이 (Basculin)

계열 기준: 배쓰나이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘four spike-like protrusions’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘four spike-like protrusions’ → 눈썹 바깥에서 꺾이는 사선 · ‘four spike-like protrusions’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; prominent defined nose; full lips.
```

### 551 · 깜눈크 (Sandile)

계열 기준: 깜눈크 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long snout’ → 코 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, wide-set; thick low brows; long nose with low tip; wide mouth.
```

### 552 · 악비르 (Krokorok)

계열 기준: 깜눈크 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**원작 단서:** ‘triangular spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘triangular spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘triangular spike’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘triangular spike’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; balanced nose; wide mouth.
```

### 553 · 악비아르 (Krookodile)

계열 기준: 깜눈크 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘five triangular spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘five triangular spikes’ → 눈매 강하게 치켜올라간 눈 · ‘five triangular spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘long snout’ → 코 길고 코끝이 내려온

**조정:** 같은 계열 악비르와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 각지고 선명한 얼굴형 → 균형 잡힌 타원형, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; long nose with low tip; wide mouth.
```

### 554 · 달막화 (Darumaka)

계열 기준: 달막화 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 달마의 둥근 체적과 힘 있는 이목구비를 둥근 볼과 굵은 눈썹으로 해석한다.

**원작 단서:** ‘curly yellow eyebrows’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; feathered full brows; rounded soft tip nose; wide mouth.
```

### 555 · 불비달마 (Darmanitan)

계열 기준: 달막화 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 불꽃 고릴라의 큰 체적을 넓은 하관과 굵고 낮은 눈썹으로 구분한다.

**원작 단서:** ‘rounded red ape’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘rounded red ape’ → 얼굴 폭 넓은 얼굴 · ‘rounded red ape’ → 눈매 큰 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘flame-shaped bushy eyebrows’ → 눈썹 굵고 눈 가까이 낮은 · ‘rounded red ape’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, level outer corners, wide-set; thick low brows; balanced nose; full lips.
```

### 556 · 마라카치 (Maractus)

계열 기준: 마라카치 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘yellow spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘yellow spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘yellow spike’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; bow-shaped upper lip.
```

### 557 · 돌살이 (Dwebble)

계열 기준: 돌살이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 돌집과 갑각류의 중심 몸을 작은 눈과 정돈된 타원 얼굴로 해석한다.

**원작 단서:** 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘dark, oval-shaped eyes’ → 눈매 큰 눈 · ‘dark, oval-shaped eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; open rounded eyes, small size, level outer corners, close-set; straight medium brows; small delicate nose; small mouth.
```

### 558 · 암팰리스 (Crustle)

계열 기준: 돌살이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**이유:** 거대한 바위집의 무게를 넓은 하관과 굵은 눈썹으로 구분한다.

**원작 단서:** 무게 200kg → 얼굴 폭 넓은 얼굴 · 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은 · 무게 200kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱, 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; broad low bridge nose; wide mouth.
```

### 559 · 곤율랭 (Scraggy)

계열 기준: 곤율랭 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 느슨한 탈피 피부와 작은 도마뱀의 큰 입을 타원 윤곽과 도톰한 입술로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; angled brows; small delicate nose; full lips.
```

### 560 · 곤율거니 (Scrafty)

계열 기준: 곤율랭 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 늘어진 피부와 악당의 낮은 시선을 긴 윤곽과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; angled brows; balanced nose; full lips.
```

### 561 · 심보러 (Sigilyph)

계열 기준: 심보러 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘two small spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘two small spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two small spikes’ → 눈매 가늘고 날카로운 눈 · ‘two small spikes’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, close-set; thin straight brows; straight slender bridge nose; thin lips.
```

### 562 · 데스마스 (Yamask)

계열 기준: 데스마스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 크기 큰 눈 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; full lips.
```

### 563 · 데스니칸 (Cofagrigus)

계열 기준: 데스마스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘red, menacing eyes’ → 눈매 강하게 치켜올라간 눈 · ‘red, menacing eyes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘red, menacing eyes’ → 눈썹 바깥에서 꺾이는 사선 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 같은 계열 데스마스와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; small delicate nose; full lips.
```

### 564 · 프로토가 (Tirtouga)

계열 기준: 프로토가 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, wide-set; straight medium brows; rounded soft tip nose; medium lips.
```

### 565 · 늑골라 (Carracosta)

계열 기준: 프로토가 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** ‘deep blue rocky structures’ → 얼굴형 각지고 선명한 얼굴형 · ‘deep blue rocky structures’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘deep blue rocky structures’ → 눈매 가늘고 날카로운 눈 · ‘deep blue rocky structures’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; balanced nose; fuller lower lip.
```

### 566 · 아켄 (Archen)

계열 기준: 아켄 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱, 눈꼬리 각도 수평 → 올라간 눈꼬리, 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; narrow eyes, medium size, upturned outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 567 · 아케오스 (Archeops)

계열 기준: 아켄 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**원작 단서:** ‘scaly snake-like head’ → 얼굴형 길고 세련된 얼굴형 · ‘scaly snake-like head’ → 얼굴 길이 긴 얼굴 · ‘scaly snake-like head’ → 얼굴 폭 좁은 얼굴 · ‘scaly snake-like head’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘scaly snake-like head’ → 눈매 아몬드형 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, small size, level outer corners, close-set; thin straight brows; straight slender bridge nose; medium lips.
```

### 568 · 깨봉이 (Trubbish)

계열 기준: 깨봉이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** ‘oval-shaped eyes’ → 눈매 큰 눈 · ‘oval-shaped eyes’ → 눈꼬리 각도 수평 · ‘large triangular teeth’ → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; fuller lower lip.
```

### 569 · 더스트나 (Garbodor)

계열 기준: 깨봉이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘round, lumpy body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, lumpy body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round, lumpy body’ → 눈썹 짧고 둥근 · ‘round, lumpy body’ → 코 코끝이 둥근 · ‘round, lumpy body’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; full lips.
```

### 570 · 조로아 (Zorua)

계열 기준: 조로아 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘large tuft’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 눈썹 길고 바깥 아치가 선명한 → 숱 많고 결이 보이는, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; feathered full brows; balanced nose; bow-shaped upper lip.
```

### 571 · 조로아크 (Zoroark)

계열 기준: 조로아 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 환영 여우의 긴 갈기와 날카로운 선을 긴 얼굴 및 올라간 눈매로 옮긴다.

**원작 단서:** ‘pointed snout’ → 얼굴 길이 긴 얼굴 · 악 타입 → 눈매 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; straight slender bridge nose; wide mouth.
```

### 572 · 치라미 (Minccino)

계열 기준: 치라미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 친칠라의 큰 귀와 보드라운 체적을 둥근 볼과 짧은 코로 해석한다.

**원작 단서:** 키 0.4m → 얼굴형 짧고 응축된 얼굴형 · 키 0.4m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 573 · 치라치노 (Cinccino)

계열 기준: 치라미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**이유:** 스카프처럼 흐르는 털을 더 긴 타원 윤곽과 완만한 눈매로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, wide-set; long arched brows; prominent defined nose; full lips.
```

### 574 · 고디탱 (Gothita)

계열 기준: 고디탱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**원작 단서:** ‘two large blue eyes’ → 눈매 큰 눈 · ‘two large blue eyes’ → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; open rounded eyes, large size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; small mouth.
```

### 575 · 고디보미 (Gothorita)

계열 기준: 고디탱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 보통 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 보통, 눈매 가늘고 날카로운 눈 → 아몬드형 눈

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; balanced jawline; almond eyes, small size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; thin lips.
```

### 576 · 고디모아젤 (Gothitelle)

계열 기준: 고디탱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 같은 계열 고디보미와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; thin straight brows; straight slender bridge nose; thin lips.
```

### 577 · 유니란 (Solosis)

계열 기준: 유니란 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 세포의 작은 원형 중심을 둥근 얼굴와 작은 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘dark, oval eyes’ → 눈매 큰 눈 · ‘dark, oval eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 578 · 듀란 (Duosion)

계열 기준: 유니란 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**이유:** 분할된 세포의 겹친 타원형을 길어진 타원 얼굴로 구분한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, downturned outer corners, wide-set; fine soft arches; small delicate nose; medium lips.
```

### 579 · 란쿨루스 (Reuniclus)

계열 기준: 유니란 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘large, round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large, round head’ → 얼굴 길이 짧은 얼굴 · ‘large, round head’ → 얼굴 폭 넓은 얼굴 · ‘large, round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 에스퍼 타입 → 눈매 아몬드형 눈 · ‘large, round head’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 코 코끝이 둥근 → 작고 여린 코

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; short rounded brows; small delicate nose; full lips.
```

### 580 · 꼬지보리 (Ducklett)

계열 기준: 꼬지보리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘two tufts forming a V’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, close-set; feathered full brows; balanced nose; thin lips.
```

### 581 · 스완나 (Swanna)

계열 기준: 꼬지보리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**원작 단서:** ‘long, curving neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long, curving neck’ → 얼굴 길이 긴 얼굴 · ‘long, curving neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long, curving neck’ → 눈매 아몬드형 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘strong bill’ → 코 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, close-set; straight medium brows; broad low bridge nose; wide mouth.
```

### 582 · 바닐프티 (Vanillite)

계열 기준: 바닐프티 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 턱끝이 뒤로 물러난 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; receding soft chin; narrow eyes, medium size, level outer corners, average spacing; thin straight brows; balanced nose; thin lips.
```

### 583 · 바닐리치 (Vanillish)

계열 기준: 바닐프티 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘large, white, rounded upper body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large, white, rounded upper body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘large, white, rounded upper body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 짧고 둥근 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; thin lips.
```

### 584 · 배바닐라 (Vanilluxe)

계열 기준: 바닐프티 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘three spikes’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 heads → 얼굴 폭 좁은 얼굴 · ‘three spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three spikes’ → 눈매 가늘고 날카로운 눈 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘three spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 585 · 사철록 (Deerling)

계열 기준: 사철록 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 작은 사슴의 계절 털과 완만한 윤곽을 타원 얼굴와 둥근 눈으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; balanced nose; bow-shaped upper lip.
```

### 586 · 바라철록 (Sawsbuck)

계열 기준: 사철록 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 보통 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**조정:** 같은 계열 사철록와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; balanced jawline; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; full lips.
```

### 587 · 에몽가 (Emolga)

계열 기준: 에몽가 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** 키 0.4m → 얼굴형 짧고 응축된 얼굴형 · 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘tiny nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 입술 입이 작은 → 보통

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, wide-set; fine soft arches; small delicate nose; medium lips.
```

### 588 · 딱정곤 (Karrablast)

계열 기준: 딱정곤 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 물어붙잡는 작은 갑각의 체적을 정돈된 눈매와 넓은 입으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 아래로 갈수록 좁아지는 턱끝

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; wide mouth.
```

### 589 · 슈바르고 (Escavalier)

계열 기준: 딱정곤 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘large, round metal ridges’ → 얼굴형 각지고 선명한 얼굴형 · ‘large, round metal ridges’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘large, round metal ridges’ → 눈매 가늘고 날카로운 눈 · ‘large, round metal ridges’ → 눈썹 짧고 둥근 · ‘large, round metal ridges’ → 코 코끝이 둥근 · ‘large, round metal ridges’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 짧고 둥근, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; straight even lips.
```

### 590 · 깜놀버슬 (Foongus)

계열 기준: 깜놀버슬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** 키 0.2m → 얼굴 길이 짧은 얼굴 · ‘large pink lips’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; full lips.
```

### 591 · 뽀록나 (Amoonguss)

계열 기준: 깜놀버슬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통 · ‘fierce-looking eyes’ → 눈매 강하게 치켜올라간 눈 · ‘fierce-looking eyes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘large pink lips’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈썹 길고 바깥 아치가 선명한 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; sharp eyes, medium size, upturned outer corners, average spacing; straight medium brows; small delicate nose; full lips.
```

### 592 · 탱그릴 (Frillish)

계열 기준: 탱그릴 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**원작 단서:** ‘round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round head’ → 얼굴 길이 짧은 얼굴 · ‘round head’ → 얼굴 폭 넓은 얼굴 · ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘invisible poison spikes’ → 눈매 가늘고 날카로운 눈 · ‘invisible poison spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; small mouth.
```

### 593 · 탱탱겔 (Jellicent)

계열 기준: 탱그릴 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘red heart-shaped marking’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘red heart-shaped marking’ → 입술 윗입술이 활 모양인

**조정:** 같은 계열 탱그릴와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 작은 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; bow-shaped upper lip.
```

### 594 · 맘복치 (Alomomola)

계열 기준: 맘복치 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘heart-shaped body’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘round eyes’ → 눈매 큰 눈 · ‘round eyes’ → 눈꼬리 각도 수평 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 이마가 넓고 턱이 가는 하트형

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; full lips.
```

### 595 · 파쪼옥 (Joltik)

계열 기준: 파쪼옥 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 거미의 털 체적과 큰 눈을 둥근 볼과 큰 사람 눈으로 해석한다.

**원작 단서:** ‘ovoid body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘ovoid body’ → 얼굴 길이 짧은 얼굴 · ‘ovoid body’ → 얼굴 폭 넓은 얼굴 · ‘ovoid body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘ovoid body’ → 눈매 큰 눈 · ‘notable tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; feathered full brows; small delicate nose; small mouth.
```

### 596 · 전툴라 (Galvantula)

계열 기준: 파쪼옥 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘four tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; open rounded eyes, large size, level outer corners, average spacing; feathered full brows; balanced nose; thin lips.
```

### 597 · 철시드 (Ferroseed)

계열 기준: 철시드 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘big spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘big spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘big spikes’ → 눈매 강하게 치켜올라간 눈 · ‘small yellow eyes’ → 눈 크기 작은 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘big spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; sharp eyes, small size, level outer corners, wide-set; angled brows; prominent defined nose; thin lips.
```

### 598 · 너트령 (Ferrothorn)

계열 기준: 철시드 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘green spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘green spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘green spike’ → 눈매 가늘고 날카로운 눈 · ‘green spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘green spike’ → 코 크고 또렷한 코 · ‘green spike’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 철시드와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; prominent defined nose; straight even lips.
```

### 599 · 기어르 (Klink)

계열 기준: 기어르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 작은 톱니바퀴의 원형 중심과 정렬을 둥근 얼굴와 대칭적인 두 눈으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; thin lips.
```

### 600 · 기기어르 (Klang)

계열 기준: 기어르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**이유:** 크기가 다른 톱니의 맞물림을 타원 윤곽과 정돈된 수평 눈으로 구분한다.

**원작 단서:** 강철 타입 → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 사이가 넓은, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; straight even lips.
```

### 601 · 기기기어르 (Klinklang)

계열 기준: 기어르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 여러 톱니와 링의 단단한 결합을 각진 윤곽과 낮은 긴 눈으로 구분한다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 heads → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, close-set; straight medium brows; balanced nose; medium lips.
```

### 602 · 저리어 (Tynamo)

계열 기준: 저리어 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** ‘white tapered eel body’ → 얼굴형 길고 세련된 얼굴형 · ‘white tapered eel body’ → 얼굴 길이 긴 얼굴 · ‘white tapered eel body’ → 얼굴 폭 좁은 얼굴 · ‘white tapered eel body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘white tapered eel body’ → 눈매 아몬드형 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, small size, level outer corners, wide-set; long arched brows; straight slender bridge nose; fuller lower lip.
```

### 603 · 저리릴 (Eelektrik)

계열 기준: 저리어 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘small pupils’ → 눈 크기 작은 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; open rounded eyes, small size, level outer corners, wide-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 604 · 저리더프 (Eelektross)

계열 기준: 저리어 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘four equidistant fangs’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘four equidistant fangs’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 저리릴와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; angular defined jaw; narrow eyes, small size, level outer corners, wide-set; straight medium brows; straight slender bridge nose; straight even lips.
```

### 605 · 리그레 (Elgyem)

계열 기준: 리그레 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; thin straight brows; small delicate nose; full lips.
```

### 606 · 벰크 (Beheeyem)

계열 기준: 리그레 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈

**조정:** 같은 계열 리그레와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; full lips.
```

### 607 · 불켜미 (Litwick)

계열 기준: 불켜미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 턱끝이 뒤로 물러난 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 양초의 둥근 체적과 녹은 곡선을 둥근 얼굴와 낮은 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · ‘melted wax covering one eye’ → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 턱끝이 뒤로 물러난

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; receding soft chin; drooping eyes, medium size, downturned outer corners, close-set; fine soft arches; small delicate nose; small mouth.
```

### 608 · 램프라 (Lampent)

계열 기준: 불켜미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 램프의 정돈된 중심과 금속 곡선을 타원 얼굴와 곡선 눈썹으로 구분한다.

**원작 단서:** ‘clear, spherical head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘clear, spherical head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘pointed spike’ → 눈매 가늘고 날카로운 눈 · ‘pointed spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; long arched brows; balanced nose; thin lips.
```

### 609 · 샹델라 (Chandelure)

계열 기준: 불켜미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 촛대의 긴 곡선과 유령 불빛을 긴 윤곽과 낮은 눈꺼풀로 해석한다.

**원작 단서:** 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · ‘striped, round head’ → 눈썹 짧고 둥근 · ‘small, black spikes’ → 입술 얇은 입술

**조정:** 같은 계열 램프라와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; short rounded brows; balanced nose; thin lips.
```

### 610 · 터검니 (Axew)

계열 기준: 터검니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 작은 용의 크게 돌출한 이빨을 넓은 입 너비와 선명한 눈매로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘tall, slightly curved horn’ → 눈썹 바깥에서 꺾이는 사선 · ‘short, rounded snout’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; angled brows; rounded soft tip nose; wide mouth.
```

### 611 · 액슨도 (Fraxure)

계열 기준: 터검니 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; full lips.
```

### 612 · 액스라이즈 (Haxorus)

계열 기준: 터검니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 도끼 같은 큰 턱을 각진 하관과 넓은 입으로 구분한다.

**원작 단서:** 드래곤 타입 → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, wide-set; thick low brows; long nose with low tip; wide mouth.
```

### 613 · 코고미 (Cubchoo)

계열 기준: 코고미 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘light-blue head with round ears’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘light-blue head with round ears’ → 얼굴 길이 짧은 얼굴 · ‘light-blue head with round ears’ → 얼굴 폭 넓은 얼굴 · ‘light-blue head with round ears’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘drooping pale-blue nasal mucus’ → 눈매 살짝 처진 부드러운 눈 · ‘drooping pale-blue nasal mucus’ → 눈꼬리 각도 처진 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 짧고 둥근 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; thick low brows; rounded soft tip nose; full lips.
```

### 614 · 툰베어 (Beartic)

계열 기준: 코고미 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 도톰한 입술 |

**원작 단서:** 무게 260kg → 얼굴 폭 넓은 얼굴 · ‘beady black eyes’ → 눈 크기 작은 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long snout’ → 코 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, small size, level outer corners, wide-set; thick low brows; long nose with low tip; full lips.
```

### 615 · 프리지오 (Cryogonal)

계열 기준: 프리지오 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 눈 결정의 방사 대칭을 높은 광대와 정돈된 긴 눈으로 해석한다.

**원작 단서:** ‘large mouth’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 입이 넓은

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, small size, level outer corners, average spacing; straight medium brows; balanced nose; wide mouth.
```

### 616 · 쪼마리 (Shelmet)

계열 기준: 쪼마리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 작은 달팽이 껍질과 부드러운 중심을 타원 얼굴와 낮은 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘long, puckered mouth and green markings’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; fine soft arches; small delicate nose; full lips.
```

### 617 · 어지리더 (Accelgor)

계열 기준: 쪼마리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; balanced jawline; almond eyes, medium size, downturned outer corners, average spacing; straight medium brows; rounded soft tip nose; medium lips.
```

### 618 · 메더 (Stunfisk)

계열 기준: 메더 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; broad low bridge nose; full lips.
```

### 619 · 비조푸 (Mienfoo)

계열 기준: 비조푸 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 작은 무술가의 가벼운 선을 작은 턱과 집중된 수평 눈으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; balanced jawline; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; thin lips.
```

### 620 · 비조도 (Mienshao)

계열 기준: 비조푸 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 흐르는 소매와 무술의 유연한 선을 긴 얼굴와 완만한 긴 눈으로 구분한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; balanced nose; fuller lower lip.
```

### 621 · 크리만 (Druddigon)

계열 기준: 크리만 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘tall, conical, red spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘tall, conical, red spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘tall, conical, red spikes’ → 눈매 강하게 치켜올라간 눈 · ‘tall, conical, red spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘tall, conical, red spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 아몬드형 눈 → 강하게 치켜올라간 눈, 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; bow-shaped upper lip.
```

### 622 · 골비람 (Golett)

계열 기준: 골비람 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 작은 |

**원작 단서:** 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은, 입술 도톰한 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; fine soft arches; broad low bridge nose; small mouth.
```

### 623 · 골루그 (Golurk)

계열 기준: 골비람 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 도톰한 입술 |

**원작 단서:** 무게 330kg → 얼굴 폭 넓은 얼굴 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 같은 계열 골비람와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; broad low bridge nose; full lips.
```

### 624 · 자망칼 (Pawniard)

계열 기준: 자망칼 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 작은 날붙이의 뾰족한 선을 높은 광대와 작고 선명한 코끝으로 해석한다.

**원작 단서:** ‘rounded red and black head’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, average spacing; short rounded brows; straight slender bridge nose; thin lips.
```

### 625 · 절각참 (Bisharp)

계열 기준: 자망칼 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘round, red and black head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, red and black head’ → 얼굴 길이 짧은 얼굴 · ‘round, red and black head’ → 얼굴 폭 넓은 얼굴 · ‘round, red and black head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘triangular eyes’ → 눈매 강하게 치켜올라간 눈 · ‘triangular eyes’ → 눈꼬리 각도 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, average spacing; short rounded brows; balanced nose; thin lips.
```

### 626 · 버프론 (Bouffalant)

계열 기준: 버프론 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 입이 넓은 |

**이유:** 박치기 소의 큰 머리털과 뿔을 넓은 이마와 굵은 낮은 눈썹으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 코 코끝이 둥근 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, average spacing; thick low brows; aquiline nose with convex bridge; wide mouth.
```

### 627 · 수리둥보 (Rufflet)

계열 기준: 수리둥보 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 몸 형태 wings → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; long arched brows; straight slender bridge nose; bow-shaped upper lip.
```

### 628 · 워글 (Braviary)

계열 기준: 수리둥보 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘small black pupils’ → 눈매 가늘고 날카로운 눈 · ‘small black pupils’ → 눈 크기 작은 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘large mane’ → 눈썹 숱 많고 결이 보이는 · ‘long, thick beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, small size, upturned outer corners, close-set; feathered full brows; straight slender bridge nose; full lips.
```

### 629 · 벌차이 (Vullaby)

계열 기준: 벌차이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 보통 |
| 입 | 입이 작은 |

**원작 단서:** ‘round, pink head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, pink head’ → 얼굴 길이 짧은 얼굴 · ‘round, pink head’ → 얼굴 폭 넓은 얼굴 · ‘round, pink head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 곧고 가는 콧대 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; short rounded brows; balanced nose; small mouth.
```

### 630 · 버랜지나 (Mandibuzz)

계열 기준: 벌차이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · ‘tan ruff’ → 눈썹 숱 많고 결이 보이는 · ‘notched black beak’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 눈썹 중간 두께의 직선 → 숱 많고 결이 보이는, 코 곧고 가는 콧대 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, average spacing; feathered full brows; prominent defined nose; thin lips.
```

### 631 · 앤티골 (Heatmor)

계열 기준: 앤티골 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 도톰한 입술 |

**이유:** 개미핥기의 긴 주둥이와 관형 입을 긴 콧대와 중앙이 도톰한 입술로 해석한다.

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; long nose with low tip; full lips.
```

### 632 · 아이앤트 (Durant)

계열 기준: 아이앤트 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘steel body’ → 얼굴형 각지고 선명한 얼굴형 · ‘steel body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘steel body’ → 눈매 가늘고 날카로운 눈 · ‘steel body’ → 코 곧고 가는 콧대 · ‘steel body’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선, 코 보통 → 곧고 가는 콧대, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; straight even lips.
```

### 633 · 모노두 (Deino)

계열 기준: 모노두 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 눈을 덮은 작은 용의 앞머리와 큰 입을 낮은 눈꺼풀과 넓은 입으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; angled brows; balanced nose; wide mouth.
```

### 634 · 디헤드 (Zweilous)

계열 기준: 모노두 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 거칠어진 두 머리 용의 체적을 넓은 하관과 집중된 눈매로 구분한다. 인물 머리는 하나다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, wide-set; fine soft arches; balanced nose; wide mouth.
```

### 635 · 삼삼드래 (Hydreigon)

계열 기준: 모노두 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 거친 다두 용의 강한 턱을 각진 하관과 깊은 눈매로 해석한다. 사람 머리는 하나다.

**원작 단서:** 드래곤 타입 → 얼굴형 각지고 선명한 얼굴형 · ‘secondary necks’ → 얼굴 길이 긴 얼굴 · ‘secondary necks’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; thick low brows; long nose with low tip; wide mouth.
```

### 636 · 활화르바 (Larvesta)

계열 기준: 활화르바 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘five red, slightly whorled horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘five red, slightly whorled horns’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘five red, slightly whorled horns’ → 눈매 강하게 치켜올라간 눈 · ‘five red, slightly whorled horns’ → 눈꼬리 각도 올라간 눈꼬리 · ‘five red, slightly whorled horns’ → 눈썹 굵고 눈 가까이 낮은 · ‘five red, slightly whorled horns’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은, 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; sharp eyes, medium size, upturned outer corners, average spacing; thick low brows; prominent defined nose; thin lips.
```

### 637 · 불카모스 (Volcarona)

계열 기준: 활화르바 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘red horn-like structure’ → 얼굴형 각지고 선명한 얼굴형 · ‘red horn-like structure’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘red horn-like structure’ → 눈꼬리 각도 올라간 눈꼬리 · ‘red horn-like structure’ → 눈썹 바깥에서 꺾이는 사선 · ‘red horn-like structure’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리, 입술 윗입술이 활 모양인 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, upturned outer corners, average spacing; angled brows; small delicate nose; straight even lips.
```

### 638 · 코바르온 (Cobalion)

계열 기준: 코바르온 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 굴곡 없이 곧은 |

**이유:** 철심의 단단함과 긴 뿔을 긴 윤곽과 곧은 콧대로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 강철 타입 → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; long nose with low tip; straight even lips.
```

### 639 · 테라키온 (Terrakion)

계열 기준: 테라키온 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 넓은 |

**이유:** 암굴의 큰 체적과 둥근 뿔을 넓은 하관과 굵은 눈썹으로 해석한다.

**원작 단서:** ‘two brown, axe-like horns’ → 얼굴형 각지고 선명한 얼굴형 · 무게 260kg → 얼굴 폭 넓은 얼굴 · ‘two brown, axe-like horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two brown, axe-like horns’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘two brown, axe-like horns’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; prominent defined nose; wide mouth.
```

### 640 · 비리디온 (Virizion)

계열 기준: 비리디온 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘long horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘long horns’ → 얼굴 길이 긴 얼굴 · ‘long horns’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘long horns’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long horns’ → 눈썹 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; square broad jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; long nose with low tip; bow-shaped upper lip.
```

### 641 · 토네로스 (Tornadus)

계열 기준: 토네로스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 선풍의 흐르는 구름과 강한 상체를 긴 윤곽과 강한 사선 눈썹으로 해석한다.

**원작 단서:** ‘two purple long and sharp horns’ → 얼굴형 길고 세련된 얼굴형 · ‘two purple long and sharp horns’ → 얼굴 길이 긴 얼굴 · ‘two purple long and sharp horns’ → 얼굴 폭 좁은 얼굴 · ‘two purple long and sharp horns’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘two purple long and sharp horns’ → 눈매 강하게 치켜올라간 눈 · ‘two purple long and sharp horns’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, close-set; thick low brows; straight slender bridge nose; wide mouth.
```

### 642 · 볼트로스 (Thundurus)

계열 기준: 볼트로스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 번개 꼬리의 각과 강한 상체를 각진 하관과 굵은 눈썹으로 구분한다.

**원작 단서:** ‘single, long, sharp, purple horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘single, long, sharp, purple horn’ → 얼굴 길이 긴 얼굴 · ‘single, long, sharp, purple horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘single, long, sharp, purple horn’ → 눈매 가늘고 날카로운 눈 · ‘single, long, sharp, purple horn’ → 눈썹 굵고 눈 가까이 낮은 · ‘single, long, sharp, purple horn’ → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; straight slender bridge nose; wide mouth.
```

### 643 · 레시라무 (Reshiram)

계열 기준: 레시라무 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**이유:** 흰 깃과 긴 용의 곡선을 긴 얼굴와 완만한 눈매로 옮긴다.

**원작 단서:** ‘long and slender neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long and slender neck’ → 얼굴 길이 긴 얼굴 · ‘long and slender neck’ → 얼굴 폭 좁은 얼굴 · ‘long and slender neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long and slender neck’ → 눈매 아몬드형 눈 · ‘long and slender neck’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 사이가 넓은, 코 길고 코끝이 내려온 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, wide-set; long arched brows; straight slender bridge nose; medium lips.
```

### 644 · 제크로무 (Zekrom)

계열 기준: 제크로무 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 얇은 입술 |

**이유:** 검은 용의 금속 같은 각과 전기적 선을 각진 얼굴과 수평 눈으로 해석한다.

**원작 단서:** ‘small wing-spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘small wing-spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small wing-spike’ → 눈매 가늘고 날카로운 눈 · ‘small wing-spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘small wing-spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 보통 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; short nose with upturned tip; thin lips.
```

### 645 · 랜드로스 (Landorus)

계열 기준: 랜드로스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 풍요의 둥근 구름과 안정적인 체적을 넓은 볼과 안정적인 눈매로 해석한다.

**원작 단서:** ‘three, sharp, pink horns’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘three, sharp, pink horns’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 턱선과 골격이 날카로운 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, wide width; wide heavy chin; almond eyes, medium size, downturned outer corners, close-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 646 · 큐레무 (Kyurem)

계열 기준: 큐레무 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 비대칭 얼음 용의 날카로운 선을 긴 윤곽과 작은 턱끝으로 해석한다. 눈의 수나 얼굴 골격을 왜곡하지 않는다.

**원작 단서:** ‘long, gray neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long, gray neck’ → 얼굴 길이 긴 얼굴 · ‘long, gray neck’ → 얼굴 폭 좁은 얼굴 · ‘long, gray neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘two spikes’ → 눈매 가늘고 날카로운 눈 · ‘two spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; angled brows; prominent defined nose; thin lips.
```

### 647 · 케르디오 (Keldeo)

계열 기준: 케르디오 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘fluffy, light blue fur’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘fluffy, light blue fur’ → 얼굴 폭 넓은 얼굴 · ‘fluffy, light blue fur’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘fluffy, light blue fur’ → 눈매 큰 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘fluffy, light blue fur’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 짧은 얼굴 → 보통, 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; short rounded brows; rounded soft tip nose; full lips.
```

### 648 · 메로엣타 (Meloetta)

계열 기준: 메로엣타 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 선율과 길게 흐르는 머리의 곡선을 긴 윤곽과 곡선 눈썹으로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, close-set; long arched brows; balanced nose; bow-shaped upper lip.
```

### 649 · 게노세크트 (Genesect)

계열 기준: 게노세크트 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘purple segmented metal body’ → 얼굴형 각지고 선명한 얼굴형 · ‘purple segmented metal body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘purple segmented metal body’ → 눈매 가늘고 날카로운 눈 · ‘purple segmented metal body’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; straight even lips.
```

## 6세대 · 72종

### 650 · 도치마론 (Chespin)

계열 기준: 도치마론 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 밤송이의 둥근 중심과 작은 가시를 둥근 얼굴 안의 또렷한 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; straight medium brows; small delicate nose; small mouth.
```

### 651 · 도치보구 (Quilladin)

계열 기준: 도치마론 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 두꺼운 밤송이 체적을 넓은 볼과 굵은 눈썹으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘large, ear-like spike’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; wide heavy chin; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; wide mouth.
```

### 652 · 브리가론 (Chesnaught)

계열 기준: 도치마론 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 큰 갑옷과 가시의 힘을 각진 하관과 안정적인 눈매로 해석한다.

**원작 단서:** ‘fluffy white fur’ → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; wide mouth.
```

### 653 · 푸호꼬 (Fennekin)

계열 기준: 푸호꼬 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 여우의 큰 귀와 작은 얼굴을 작은 턱과 큰 맑은 눈으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, wide-set; straight medium brows; small delicate nose; bow-shaped upper lip.
```

### 654 · 테르나 (Braixen)

계열 기준: 푸호꼬 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 성장한 여우의 길어진 선과 마법 이미지를 타원 얼굴과 올라간 긴 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 불꽃 타입 → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; sharp eyes, medium size, upturned outer corners, close-set; long arched brows; small delicate nose; thin lips.
```

### 655 · 마폭시 (Delphox)

계열 기준: 푸호꼬 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 마법사 같은 긴 털과 여우의 선을 긴 얼굴와 고요한 긴 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 에스퍼 타입 → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; long nose with low tip; thin lips.
```

### 656 · 개구마르 (Froakie)

계열 기준: 개구마르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 작은 개구리의 둥근 눈과 거품을 둥근 얼굴와 넓은 입으로 옮긴다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; thin straight brows; small delicate nose; wide mouth.
```

### 657 · 개굴반장 (Frogadier)

계열 기준: 개구마르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 민첩해진 개구리의 유선형을 타원 얼굴와 집중된 눈매로 구분한다.

**원작 단서:** ‘backward-facing spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘backward-facing spike’ → 눈매 가늘고 날카로운 눈 · ‘backward-facing spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; small delicate nose; thin lips.
```

### 658 · 개굴닌자 (Greninja)

계열 기준: 개구마르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 닌자의 기동성과 날카로운 지느러미를 긴 얼굴와 절제된 긴 눈으로 해석한다.

**원작 단서:** 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, close-set; angled brows; balanced nose; thin lips.
```

### 659 · 파르빗 (Bunnelby)

계열 기준: 파르빗 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 키 0.4m → 얼굴 길이 짧은 얼굴 · ‘small pink nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; full lips.
```

### 660 · 파르토 (Diggersby)

계열 기준: 파르빗 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 보통 |

**원작 단서:** 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 콧대가 낮고 넓은, 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; broad low bridge nose; medium lips.
```

### 661 · 화살꼬빈 (Fletchling)

계열 기준: 화살꼬빈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘small beak’ → 코 곧고 가는 콧대 · ‘small beak’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; straight medium brows; straight slender bridge nose; small mouth.
```

### 662 · 불화살빈 (Fletchinder)

계열 기준: 화살꼬빈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · ‘sharp, black beak’ → 코 곧고 가는 콧대

**조정:** 같은 계열 화살꼬빈와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 눈썹 중간 두께의 직선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 663 · 파이어로 (Talonflame)

계열 기준: 화살꼬빈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; straight medium brows; balanced nose; bow-shaped upper lip.
```

### 664 · 분이벌레 (Scatterbug)

계열 기준: 분이벌레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 애벌레의 둥근 마디를 둥근 볼과 작은 눈으로 해석한다.

**원작 단서:** 키 0.3m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; long arched brows; small delicate nose; small mouth.
```

### 665 · 분떠도리 (Spewpa)

계열 기준: 분이벌레 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘large, round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘large, round head’ → 얼굴 길이 짧은 얼굴 · ‘large, round head’ → 얼굴 폭 넓은 얼굴 · ‘large, round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘large, round head’ → 눈썹 짧고 둥근 · ‘large, round head’ → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; short rounded brows; balanced nose; full lips.
```

### 666 · 비비용 (Vivillon)

계열 기준: 분이벌레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 크게 펼친 나비 날개와 선명한 무늬를 넓은 상안면과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘round, grayish head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round, grayish head’ → 눈매 큰 눈 · 몸 형태 bug-wings → 눈 크기 큰 눈 · ‘round, grayish head’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 부드럽고 둥근 턱, 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; long arched brows; rounded soft tip nose; bow-shaped upper lip.
```

### 667 · 레오꼬 (Litleo)

계열 기준: 레오꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 불꽃 타입 → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, wide-set; long arched brows; balanced nose; medium lips.
```

### 668 · 화염레오 (Pyroar)

계열 기준: 레오꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 불꽃 타입 → 눈꼬리 각도 올라간 눈꼬리 · ‘large, predominantly red mane’ → 눈썹 숱 많고 결이 보이는

**조정:** 같은 계열 레오꼬와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 눈썹 길고 바깥 아치가 선명한 → 숱 많고 결이 보이는, 코 보통 → 작고 여린 코

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; feathered full brows; small delicate nose; thin lips.
```

### 669 · 플라베베 (Flabébé)

계열 기준: 플라베베 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘heart-shaped ears’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘small, pointed nose’ → 코 곧고 가는 콧대 · ‘heart-shaped ears’ → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 크고 또렷한 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; straight slender bridge nose; bow-shaped upper lip.
```

### 670 · 플라엣테 (Floette)

계열 기준: 플라베베 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 키 0.2m → 얼굴형 짧고 응축된 얼굴형 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 같은 계열 플라베베와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 짧고 응축된 얼굴형, 눈썹 길고 바깥 아치가 선명한 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): compact face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; bow-shaped upper lip.
```

### 671 · 플라제스 (Florges)

계열 기준: 플라베베 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통 · ‘pointed nose’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 보통

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, average spacing; angled brows; prominent defined nose; thin lips.
```

### 672 · 메이클 (Skiddo)

계열 기준: 메이클 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘pointed black horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘pointed black horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘pointed black horns’ → 눈썹 바깥에서 꺾이는 사선 · ‘round black nose’ → 코 코끝이 둥근

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; bow-shaped upper lip.
```

### 673 · 고고트 (Gogoat)

계열 기준: 메이클 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘black horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘black horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘black horns’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 메이클와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 길고 바깥 아치가 선명한, 입술 윗입술이 활 모양인 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; small delicate nose; straight even lips.
```

### 674 · 판짱 (Pancham)

계열 기준: 판짱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 작고 여린 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; full lips.
```

### 675 · 부란다 (Pangoro)

계열 기준: 판짱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘round belly’ → 얼굴 폭 넓은 얼굴 · ‘round belly’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round belly’ → 눈매 큰 눈 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은 · ‘round belly’ → 코 코끝이 둥근 · ‘round belly’ → 입술 도톰한 입술

**조정:** 같은 계열 판짱와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; thick low brows; rounded soft tip nose; full lips.
```

### 676 · 트리미앙 (Furfrou)

계열 기준: 트리미앙 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**이유:** 푸들의 긴 주둥이와 정돈된 털의 곡선을 긴 중안부와 곡선 눈썹으로 해석한다.

**원작 단서:** ‘pointed snout’ → 얼굴 길이 긴 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long rectangular ears’ → 눈썹 길고 바깥 아치가 선명한 · ‘pointed snout’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 좁은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, wide-set; long arched brows; long nose with low tip; medium lips.
```

### 677 · 냐스퍼 (Espurr)

계열 기준: 냐스퍼 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · 에스퍼 타입 → 눈썹 가늘고 곧은 · ‘tiny nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; thin straight brows; small delicate nose; full lips.
```

### 678 · 냐오닉스 (Meowstic)

계열 기준: 냐스퍼 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 에스퍼 타입 → 눈매 아몬드형 눈 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 눈매 큰 눈 → 아몬드형 눈, 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; thin straight brows; rounded soft tip nose; full lips.
```

### 679 · 단칼빙 (Honedge)

계열 기준: 단칼빙 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 한 자루 검의 긴 중심선과 눈을 긴 윤곽과 정돈된 두 사람 눈으로 해석한다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 각지고 선명한 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; full lips.
```

### 680 · 쌍검킬 (Doublade)

계열 기준: 단칼빙 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 쌍검의 반복과 대칭을 각진 윤곽과 수평적인 두 눈으로 구분한다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 heads → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; fine soft arches; balanced nose; thin lips.
```

### 681 · 킬가르도 (Aegislash)

계열 기준: 단칼빙 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘thick, striated spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘thick, striated spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘thick, striated spike’ → 눈매 가늘고 날카로운 눈 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · ‘thick, striated spike’ → 코 크고 또렷한 코 · ‘thick, striated spike’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 쌍검킬와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선, 코 보통 → 크고 또렷한 코, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; prominent defined nose; straight even lips.
```

### 682 · 슈쁘 (Spritzee)

계열 기준: 슈쁘 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 향수의 구름 같은 곡선과 짧은 부리를 둥근 볼과 도톰한 입술로 해석한다.

**원작 단서:** ‘rounded body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘rounded body’ → 얼굴 길이 짧은 얼굴 · ‘rounded body’ → 얼굴 폭 넓은 얼굴 · ‘rounded body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘rounded body’ → 눈매 큰 눈 · ‘large red-orange eyes’ → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 크기 보통 → 큰 눈, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; long arched brows; small delicate nose; full lips.
```

### 683 · 프레프티르 (Aromatisse)

계열 기준: 슈쁘 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**원작 단서:** ‘fluffy purple fur’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘fluffy purple fur’ → 얼굴 길이 짧은 얼굴 · ‘fluffy purple fur’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘fluffy purple fur’ → 눈매 큰 눈 · ‘fluffy purple fur’ → 눈썹 가늘고 완만한 곡선 · ‘fluffy purple fur’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; rounded soft tip nose; small mouth.
```

### 684 · 나룸퍼프 (Swirlix)

계열 기준: 나룸퍼프 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘fluffy white fur’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘fluffy white fur’ → 얼굴 길이 짧은 얼굴 · 몸 형태 legs → 얼굴 폭 좁은 얼굴 · ‘fluffy white fur’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘fluffy white fur’ → 눈매 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴, 입술 도톰한 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 685 · 나루림 (Slurpuff)

계열 기준: 나룸퍼프 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘fluffy pink fur’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘fluffy pink fur’ → 얼굴 길이 짧은 얼굴 · ‘fluffy pink fur’ → 얼굴 폭 넓은 얼굴 · ‘fluffy pink fur’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘fluffy pink fur’ → 눈매 큰 눈 · ‘fluffy pink fur’ → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 크기 보통 → 큰 눈, 입술 도톰한 입술 → 얇은 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; thin lips.
```

### 686 · 오케이징 (Inkay)

계열 기준: 오케이징 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 작은 |

**원작 단서:** ‘rounded, pink body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘rounded, pink body’ → 얼굴 길이 짧은 얼굴 · ‘rounded, pink body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘rounded, pink body’ → 눈매 큰 눈 · ‘round black eyes’ → 눈꼬리 각도 수평 · ‘rounded, pink body’ → 눈썹 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; short rounded brows; prominent defined nose; small mouth.
```

### 687 · 칼라마네로 (Malamar)

계열 기준: 오케이징 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 아몬드형 눈, 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; full lips.
```

### 688 · 거북손손 (Binacle)

계열 기준: 거북손손 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 두 손 같은 넓은 갑각의 체적을 넓은 얼굴와 열린 눈매로 해석한다.

**원작 단서:** 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 heads → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; almond eyes, large size, level outer corners, close-set; straight medium brows; small delicate nose; wide mouth.
```

### 689 · 거북손데스 (Barbaracle)

계열 기준: 거북손손 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 heads → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; bow-shaped upper lip.
```

### 690 · 수레기 (Skrelp)

계열 기준: 수레기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘blunt spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘blunt spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘blunt spike’ → 눈매 가늘고 날카로운 눈 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · ‘blunt spike’ → 눈썹 바깥에서 꺾이는 사선 · 몸 형태 blob → 입술 도톰한 입술

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; long nose with low tip; full lips.
```

### 691 · 드래캄 (Dragalge)

계열 기준: 수레기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘three small spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘three small spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three small spikes’ → 눈매 가늘고 날카로운 눈 · ‘three small spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘three small spikes’ → 코 곧고 가는 콧대 · ‘three small spikes’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 수레기와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 곧고 가는 콧대, 입술 도톰한 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; straight even lips.
```

### 692 · 완철포 (Clauncher)

계열 기준: 완철포 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** ‘simple blue spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘simple blue spikes’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘simple blue spikes’ → 눈매 강하게 치켜올라간 눈 · ‘simple blue spikes’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 큰 눈 → 강하게 치켜올라간 눈, 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; sharp eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; medium lips.
```

### 693 · 블로스터 (Clawitzer)

계열 기준: 완철포 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘four black spikes’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · ‘four black spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘four black spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; full lips.
```

### 694 · 목도리키텔 (Helioptile)

계열 기준: 목도리키텔 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 작은 |

**이유:** 작은 도마뱀의 넓은 귀와 좁은 중심 얼굴을 작은 턱과 열린 눈으로 해석한다.

**원작 단서:** ‘slightly pointed head’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘slightly pointed head’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; fine soft arches; short nose with upturned tip; small mouth.
```

### 695 · 일레도리자드 (Heliolisk)

계열 기준: 목도리키텔 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 얇은 입술 |

**이유:** 펼친 목도리와 길어진 도마뱀의 선을 긴 윤곽과 날카로운 눈으로 구분한다.

**원작 단서:** ‘orange spikes’ → 눈매 가늘고 날카로운 눈 · ‘orange spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘orange spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 코 길고 코끝이 내려온 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; short nose with upturned tip; thin lips.
```

### 696 · 티고라스 (Tyrunt)

계열 기준: 티고라스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 넓은 |

**이유:** 작은 공룡의 큰 머리와 턱을 넓은 얼굴와 열린 눈매로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘two orange spikes’ → 눈썹 굵고 눈 가까이 낮은 · ‘blunt snout’ → 코 짧고 코끝이 들린

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 코끝이 둥근 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, large size, level outer corners, close-set; thick low brows; short nose with upturned tip; wide mouth.
```

### 697 · 견고라스 (Tyrantrum)

계열 기준: 티고라스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 폭군 공룡의 큰 턱과 날카로운 능선을 각진 하관과 작은 깊은 눈으로 구분한다.

**원작 단서:** ‘two orange spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘two orange spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two orange spikes’ → 눈매 가늘고 날카로운 눈 · ‘two orange spikes’ → 눈썹 굵고 눈 가까이 낮은 · ‘two orange spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; thick low brows; long nose with low tip; thin lips.
```

### 698 · 아마루스 (Amaura)

계열 기준: 아마루스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘long neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘long neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long neck’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long neck’ → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, wide-set; thin straight brows; balanced nose; thin lips.
```

### 699 · 아마루르가 (Aurorus)

계열 기준: 아마루스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘long neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘long neck’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long neck’ → 코 곧고 가는 콧대

**조정:** 같은 계열 아마루스와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 넓고 각진 사각 턱, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; square broad jaw; almond eyes, medium size, level outer corners, wide-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 700 · 님피아 (Sylveon)

계열 기준: 이브이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 크고 또렷한 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 리본과 부드러운 요정 실루엣을 작은 턱과 큰 사람 눈으로 해석한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘long blue-lined ears’ → 눈썹 길고 바깥 아치가 선명한 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 같은 계열 이브이·에브이와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, wide-set; long arched brows; prominent defined nose; bow-shaped upper lip.
```

### 701 · 루차불 (Hawlucha)

계열 기준: 루차불 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 레슬링 새의 가면 같은 선과 날개를 높은 광대와 선명한 긴 눈으로 해석한다.

**원작 단서:** ‘three rectangular, tassel-like feathers’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘three rectangular, tassel-like feathers’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three rectangular, tassel-like feathers’ → 눈매 가늘고 날카로운 눈 · ‘three rectangular, tassel-like feathers’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 각지고 또렷한 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; balanced nose; wide mouth.
```

### 702 · 데덴네 (Dedenne)

계열 기준: 데덴네 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 작은 설치류의 둥근 귀와 볼 및 안테나 수염을 둥근 얼굴와 작은 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 키 0.2m → 얼굴 길이 짧은 얼굴 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 703 · 멜리시 (Carbink)

계열 기준: 멜리시 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘small head’ → 얼굴형 짧고 응축된 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): compact face, short length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; fine soft arches; balanced nose; thin lips.
```

### 704 · 미끄메라 (Goomy)

계열 기준: 미끄메라 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** ‘antenna-like horns’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · ‘antenna-like horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘antenna-like horns’ → 눈매 가늘고 날카로운 눈 · ‘beady black eyes’ → 눈 크기 작은 눈 · ‘antenna-like horns’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; angled brows; small delicate nose; medium lips.
```

### 705 · 미끄네일 (Sliggoo)

계열 기준: 미끄메라 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘antenna-like horns’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · ‘antenna-like horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘antenna-like horns’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; open rounded eyes, medium size, level outer corners, average spacing; angled brows; rounded soft tip nose; full lips.
```

### 706 · 미끄래곤 (Goodra)

계열 기준: 미끄메라 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘antenna-like horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘relatively long neck’ → 얼굴 길이 긴 얼굴 · 무게 150.5kg → 얼굴 폭 넓은 얼굴 · ‘antenna-like horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘antenna-like horns’ → 눈매 강하게 치켜올라간 눈 · ‘antenna-like horns’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 아몬드형 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, long length, wide width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; full lips.
```

### 707 · 클레피 (Klefki)

계열 기준: 클레피 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 열쇠의 고리와 작은 중심 얼굴을 타원 윤곽과 정돈된 원형 눈으로 해석한다.

**원작 단서:** ‘spherical head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical head’ → 눈매 큰 눈 · ‘spherical head’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; straight medium brows; small delicate nose; small mouth.
```

### 708 · 나목령 (Phantump)

계열 기준: 나목령 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 윗입술이 활 모양인 → 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; small delicate nose; small mouth.
```

### 709 · 대로트 (Trevenant)

계열 기준: 나목령 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**원작 단서:** 몸 형태 tentacles → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 tentacles → 입술 입이 작은

**조정:** 같은 계열 나목령와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 이마가 넓고 턱이 가는 하트형, 눈썹 길고 바깥 아치가 선명한 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; small mouth.
```

### 710 · 호바귀 (Pumpkaboo)

계열 기준: 호바귀 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 보통 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 호박의 둥근 체적과 작은 어둠의 중심을 둥근 볼과 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 눈 크기 큰 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; balanced jawline; open rounded eyes, large size, level outer corners, close-set; fine soft arches; small delicate nose; small mouth.
```

### 711 · 펌킨인 (Gourgeist)

계열 기준: 호바귀 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 길게 뻗은 호박 줄기와 머리의 흐름을 긴 윤곽과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · ‘crescent-shaped tuft’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 눈썹 길고 바깥 아치가 선명한 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, wide-set; feathered full brows; balanced nose; thin lips.
```

### 712 · 꽁어름 (Bergmite)

계열 기준: 꽁어름 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 작은 얼음덩이의 평평한 면을 각진 윤곽 안의 둥근 눈으로 해석한다.

**원작 단서:** ‘smaller spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘smaller spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘white, round body’ → 눈매 큰 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘smaller spikes’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; open rounded eyes, medium size, level outer corners, wide-set; straight medium brows; small delicate nose; thin lips.
```

### 713 · 크레베이스 (Avalugg)

계열 기준: 꽁어름 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 빙산의 넓고 평평한 덩어리를 넓고 단단한 하관으로 구분한다.

**원작 단서:** 무게 505kg → 얼굴 폭 넓은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, wide-set; thick low brows; balanced nose; thin lips.
```

### 714 · 음뱃 (Noibat)

계열 기준: 음뱃 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘fluffy black fur’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘fluffy black fur’ → 얼굴 길이 짧은 얼굴 · ‘fluffy black fur’ → 얼굴 폭 넓은 얼굴 · ‘fluffy black fur’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘fluffy black fur’ → 눈매 큰 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; straight slender bridge nose; full lips.
```

### 715 · 음번 (Noivern)

계열 기준: 음뱃 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘fluffy mane’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘fluffy mane’ → 얼굴 길이 짧은 얼굴 · ‘fluffy mane’ → 얼굴 폭 넓은 얼굴 · ‘fluffy mane’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘fluffy mane’ → 눈매 큰 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리

**조정:** 같은 계열 음뱃와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리, 눈썹 바깥에서 꺾이는 사선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, upturned outer corners, close-set; feathered full brows; rounded soft tip nose; full lips.
```

### 716 · 제르네아스 (Xerneas)

계열 기준: 제르네아스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**이유:** 나뭇가지 같은 큰 뿔과 사슴의 긴 선을 긴 얼굴와 완만한 눈매로 옮긴다.

**원작 단서:** 키 3m → 얼굴형 길고 세련된 얼굴형 · 키 3m → 얼굴 길이 긴 얼굴 · ‘upward curving horn’ → 턱선 · 턱끝 각지고 또렷한 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱, 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; almond eyes, medium size, downturned outer corners, close-set; long arched brows; long nose with low tip; medium lips.
```

### 717 · 이벨타르 (Yveltal)

계열 기준: 이벨타르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** Y형 날개와 예리한 파괴의 실루엣을 각진 광대와 긴 눈으로 해석한다.

**원작 단서:** ‘black, forward-curving horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘black, forward-curving horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘black, forward-curving horn’ → 눈매 가늘고 날카로운 눈 · ‘black, forward-curving horn’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘black, forward-curving horn’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, close-set; angled brows; long nose with low tip; thin lips.
```

### 718 · 지가르데 (Zygarde)

계열 기준: 지가르데 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**이유:** 반복되는 육각형과 길게 이어진 몸을 정돈된 긴 얼굴로 해석한다.

**원작 단서:** ‘black serpentine body’ → 얼굴형 길고 세련된 얼굴형 · ‘black serpentine body’ → 얼굴 길이 긴 얼굴 · ‘black serpentine body’ → 얼굴 폭 좁은 얼굴 · ‘black serpentine body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘black serpentine body’ → 눈썹 길고 바깥 아치가 선명한 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 길고 바깥 아치가 선명한, 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; long arched brows; broad low bridge nose; thin lips.
```

### 719 · 디안시 (Diancie)

계열 기준: 디안시 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 보통, 눈썹 중간 두께의 직선 → 가늘고 완만한 곡선, 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; balanced jawline; narrow eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; bow-shaped upper lip.
```

### 720 · 후파 (Hoopa)

계열 기준: 후파 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 고리와 장난의 유연한 곡선을 작은 턱과 긴 입선으로 해석한다.

**원작 단서:** ‘dark gray horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘dark gray horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘dark gray horn’ → 눈매 강하게 치켜올라간 눈 · ‘dark gray horn’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, upturned outer corners, close-set; long arched brows; small delicate nose; wide mouth.
```

### 721 · 볼케니온 (Volcanion)

계열 기준: 볼케니온 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 곧은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 증기 고리와 둔중한 몸을 넓은 얼굴와 안정적인 눈매로 해석한다.

**원작 단서:** 무게 195kg → 얼굴 폭 넓은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운, 눈썹 굵고 눈 가까이 낮은 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, close-set; thin straight brows; rounded soft tip nose; wide mouth.
```

## 7세대 · 88종

### 722 · 나몰빼미 (Rowlet)

계열 기준: 나몰빼미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 작은 부엉이의 둥근 얼굴과 잎 장식을 둥근 볼과 짧은 코로 옮긴다.

**원작 단서:** ‘round body’ → 얼굴형 짧고 응축된 얼굴형 · ‘round body’ → 얼굴 길이 짧은 얼굴 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round body’ → 눈매 큰 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; straight slender bridge nose; small mouth.
```

### 723 · 빼미스로우 (Dartrix)

계열 기준: 나몰빼미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 정돈된 깃과 가려진 시선을 타원 얼굴와 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘stubby beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, close-set; long arched brows; straight slender bridge nose; thin lips.
```

### 724 · 모크나이퍼 (Decidueye)

계열 기준: 나몰빼미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 입이 작은 |

**이유:** 궁수의 후드와 조준하는 선을 긴 얼굴와 집중된 수평 눈으로 해석한다.

**원작 단서:** ‘hooked dark green beak’ → 코 콧대가 볼록한 매부리코 · ‘hooked dark green beak’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 코 보통 → 콧대가 볼록한 매부리코, 입술 얇은 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; aquiline nose with convex bridge; small mouth.
```

### 725 · 냐오불 (Litten)

계열 기준: 냐오불 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 작은 고양이의 귀와 가는 눈을 작은 턱과 올라간 눈매로 옮긴다.

**원작 단서:** ‘short, pointed ears’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; small delicate nose; fuller lower lip.
```

### 726 · 냐오히트 (Torracat)

계열 기준: 냐오불 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 성장한 고양이의 강해진 체적을 타원 얼굴와 굵은 눈썹으로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; angled brows; rounded soft tip nose; medium lips.
```

### 727 · 어흥염 (Incineroar)

계열 기준: 냐오불 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 큰 호랑이와 레슬링의 위압을 넓은 하관 및 굵고 낮은 눈썹으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 악 타입 → 눈매 강하게 치켜올라간 눈 · ‘tiny, pointed ears’ → 눈꼬리 각도 올라간 눈꼬리 · ‘tiny, pointed ears’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; balanced nose; wide mouth.
```

### 728 · 누리공 (Popplio)

계열 기준: 누리공 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 코끝이 둥근 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 물개의 둥근 코와 거품의 곡선을 둥근 볼과 둥근 사람 코끝으로 옮긴다.

**원작 단서:** ‘large eyes’ → 눈매 큰 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘light blue ruff’ → 눈썹 숱 많고 결이 보이는 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는, 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; feathered full brows; rounded soft tip nose; fuller lower lip.
```

### 729 · 키요공 (Brionne)

계열 기준: 누리공 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 크고 또렷한 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 춤추는 물개의 리본 같은 곡선을 타원 얼굴와 곡선 입술로 구분한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; prominent defined nose; bow-shaped upper lip.
```

### 730 · 누리레느 (Primarina)

계열 기준: 누리공 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 바다의 가수와 길게 흐르는 지느러미를 긴 얼굴와 완만한 긴 눈으로 해석한다.

**원작 단서:** 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, wide-set; fine soft arches; balanced nose; full lips.
```

### 731 · 콕코구리 (Pikipek)

계열 기준: 콕코구리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · ‘large blue eyes’ → 눈매 큰 눈 · ‘large blue eyes’ → 눈 크기 큰 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘gray beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, upturned outer corners, close-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 732 · 크라파 (Trumbeak)

계열 기준: 콕코구리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · ‘long beak’ → 코 크고 또렷한 코

**조정:** 같은 계열 콕코구리와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱, 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 코 곧고 가는 콧대 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, average spacing; straight medium brows; prominent defined nose; thin lips.
```

### 733 · 왕큰부리 (Toucannon)

계열 기준: 콕코구리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘prominent beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; narrow eyes, medium size, upturned outer corners, close-set; straight medium brows; straight slender bridge nose; full lips.
```

### 734 · 영구스 (Yungoos)

계열 기준: 영구스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 작은 몽구스의 긴 몸과 큰 이빨을 긴 얼굴와 넓은 입으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, large size, level outer corners, wide-set; thick low brows; long nose with low tip; wide mouth.
```

### 735 · 형사구스 (Gumshoos)

계열 기준: 영구스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 잠복하는 몽구스의 큰 얼굴와 낮은 시선을 넓은 하관과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; wide heavy chin; drooping eyes, medium size, downturned outer corners, wide-set; thick low brows; balanced nose; wide mouth.
```

### 736 · 턱지충이 (Grubbin)

계열 기준: 턱지충이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 애벌레의 둥근 몸과 턱을 둥근 볼과 중앙이 도톰한 입술로 해석한다.

**원작 단서:** 키 0.4m → 얼굴형 짧고 응축된 얼굴형 · 키 0.4m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; full lips.
```

### 737 · 전지충이 (Charjabug)

계열 기준: 턱지충이 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 각진 배터리 마디와 네모 입을 각진 윤곽과 정돈된 입술로 구분한다.

**원작 단서:** ‘two short, yellow spikes’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · ‘two short, yellow spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two short, yellow spikes’ → 눈매 가늘고 날카로운 눈 · ‘two short, yellow spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; small delicate nose; thin lips.
```

### 738 · 투구뿌논 (Vikavolt)

계열 기준: 턱지충이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 얇은 입술 |

**원작 단서:** ‘large spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘large spike’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘large spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘large spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; short nose with upturned tip; thin lips.
```

### 739 · 오기지게 (Crabrawler)

계열 기준: 오기지게 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 큰 권투 집게와 솟은 더듬이를 넓은 하관과 굵은 눈썹으로 해석한다.

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 각지고 선명한 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; wide heavy chin; almond eyes, large size, level outer corners, close-set; thick low brows; small delicate nose; wide mouth.
```

### 740 · 모단단게 (Crabominable)

계열 기준: 오기지게 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; medium lips.
```

### 741 · 춤추새 (Oricorio)

계열 기준: 춤추새 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**이유:** 플라멩코 깃과 춤의 곡선을 타원 윤곽과 선명한 입술로 해석한다. 다른 폼에서는 의상만 바꾸고 정본 얼굴을 유지한다.

**원작 단서:** 몸 형태 wings → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 가까운 → 눈 사이가 넓은, 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; straight slender bridge nose; full lips.
```

### 742 · 에블리 (Cutiefly)

계열 기준: 에블리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 작은 털뭉치와 넓은 흰 날개를 작은 턱과 큰 맑은 사람 눈으로 해석한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 작은 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; fuller lower lip.
```

### 743 · 에리본 (Ribombee)

계열 기준: 에블리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 키 0.2m → 얼굴 길이 짧은 얼굴 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · 몸 형태 bug-wings → 눈 크기 큰 눈 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 턱선 · 턱끝 부드럽고 둥근 턱 → 아래로 갈수록 좁아지는 턱끝, 눈 크기 보통 → 큰 눈, 입술 도톰한 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; bow-shaped upper lip.
```

### 744 · 암멍이 (Rockruff)

계열 기준: 암멍이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; straight slender bridge nose; medium lips.
```

### 745 · 루가루암 (Lycanroc)

계열 기준: 암멍이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘bushy white mane’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱, 눈썹 중간 두께의 직선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; narrow eyes, medium size, level outer corners, wide-set; feathered full brows; balanced nose; thin lips.
```

### 746 · 약어리 (Wishiwashi)

계열 기준: 약어리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘large watery blue eyes’ → 눈매 큰 눈 · ‘large watery blue eyes’ → 눈 크기 큰 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; prominent defined nose; full lips.
```

### 747 · 시마사리 (Mareanie)

계열 기준: 시마사리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 가시 돋친 촉수와 작은 중심 몸을 작은 턱과 낮은 눈꺼풀로 해석한다.

**원작 단서:** ‘purple, stalk-like body’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; drooping eyes, medium size, downturned outer corners, wide-set; angled brows; small delicate nose; full lips.
```

### 748 · 더시마사리 (Toxapex)

계열 기준: 시마사리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**조정:** 같은 계열 시마사리와 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; fuller lower lip.
```

### 749 · 머드나기 (Mudbray)

계열 기준: 머드나기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘large eyes’ → 눈매 큰 눈 · ‘large eyes’ → 눈 크기 큰 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; broad low bridge nose; full lips.
```

### 750 · 만마드 (Mudsdale)

계열 기준: 머드나기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**이유:** 큰 말의 갈기와 강한 다리 체적을 긴 얼굴와 굵은 눈썹으로 해석한다.

**원작 단서:** 키 2.5m → 얼굴형 길고 세련된 얼굴형 · 키 2.5m → 얼굴 길이 긴 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 땅 타입 → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; broad low bridge nose; wide mouth.
```

### 751 · 물거미 (Dewpider)

계열 기준: 물거미 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 물거품 머리와 큰 눈을 둥근 얼굴와 큰 사람 눈으로 해석한다.

**원작 단서:** 키 0.3m → 얼굴 길이 짧은 얼굴 · 몸 형태 legs → 얼굴 폭 좁은 얼굴 · ‘large light blue eyes’ → 눈매 큰 눈 · ‘large light blue eyes’ → 눈 크기 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; open rounded eyes, large size, level outer corners, close-set; straight medium brows; small delicate nose; small mouth.
```

### 752 · 깨비물거미 (Araquanid)

계열 기준: 물거미 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 각진 사각 턱 → 아래로 갈수록 좁아지는 턱끝, 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; thick low brows; small delicate nose; thin lips.
```

### 753 · 짜랑랑 (Fomantis)

계열 기준: 짜랑랑 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 키 0.3m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 입술 윗입술이 활 모양인 → 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; small delicate nose; thin lips.
```

### 754 · 라란티스 (Lurantis)

계열 기준: 짜랑랑 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**조정:** 같은 계열 짜랑랑와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, close-set; long arched brows; balanced nose; bow-shaped upper lip.
```

### 755 · 자마슈 (Morelull)

계열 기준: 자마슈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘thin, stem-like body’ → 얼굴형 길고 세련된 얼굴형 · ‘thin, stem-like body’ → 얼굴 길이 긴 얼굴 · ‘thin, stem-like body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘thin, stem-like body’ → 눈매 아몬드형 눈 · ‘thin, stem-like body’ → 눈썹 길고 바깥 아치가 선명한 · 페어리 타입 → 입술 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, large size, level outer corners, average spacing; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 756 · 마셰이드 (Shiinotic)

계열 기준: 자마슈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 이마가 넓고 턱이 가는 하트형, 코 코끝이 둥근 → 보통, 입술 도톰한 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; bow-shaped upper lip.
```

### 757 · 야도뇽 (Salandit)

계열 기준: 야도뇽 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘slit pupils’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, wide-set; straight medium brows; straight slender bridge nose; bow-shaped upper lip.
```

### 758 · 염뉴트 (Salazzle)

계열 기준: 야도뇽 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘thin body’ → 얼굴형 길고 세련된 얼굴형 · ‘thin body’ → 얼굴 길이 긴 얼굴 · ‘thin body’ → 얼굴 폭 좁은 얼굴 · ‘thin body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘thin body’ → 눈매 아몬드형 눈 · ‘thin body’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, small size, level outer corners, average spacing; long arched brows; straight slender bridge nose; full lips.
```

### 759 · 포곰곰 (Stufful)

계열 기준: 포곰곰 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 작은 곰의 둥근 체적과 보드라운 주둥이를 둥근 볼과 내려간 눈꼬리로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘small, white-tipped tuft’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, downturned outer corners, wide-set; feathered full brows; rounded soft tip nose; bow-shaped upper lip.
```

### 760 · 이븐곰 (Bewear)

계열 기준: 포곰곰 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; straight slender bridge nose; medium lips.
```

### 761 · 달콤아 (Bounsweet)

계열 기준: 달콤아 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 망고스틴의 둥근 열매와 작은 눈을 둥근 얼굴와 작은 또렷한 눈으로 해석한다.

**원작 단서:** 키 0.3m → 얼굴 길이 짧은 얼굴 · ‘beady yellow eyes’ → 눈 크기 작은 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, close-set; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 762 · 달무리나 (Steenee)

계열 기준: 달콤아 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 길고 바깥 아치가 선명한 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; thick low brows; small delicate nose; bow-shaped upper lip.
```

### 763 · 달코퀸 (Tsareena)

계열 기준: 달콤아 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 열매의 둥근 체적과 여왕 같은 긴 선을 긴 얼굴와 선명한 입술로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; balanced nose; full lips.
```

### 764 · 큐아링 (Comfey)

계열 기준: 큐아링 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘long, fluffy green crest’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘long, fluffy green crest’ → 얼굴 길이 짧은 얼굴 · ‘long, fluffy green crest’ → 얼굴 폭 좁은 얼굴 · ‘long, fluffy green crest’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘long, fluffy green crest’ → 눈매 아몬드형 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴, 눈매 큰 눈 → 아몬드형 눈

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; full lips.
```

### 765 · 하랑우탄 (Oranguru)

계열 기준: 하랑우탄 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 큰 원숭이의 넓은 코와 현자의 고요함을 넓은 얼굴와 낮은 눈꺼풀로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; drooping eyes, medium size, downturned outer corners, average spacing; thin straight brows; rounded soft tip nose; medium lips.
```

### 766 · 내던숭이 (Passimian)

계열 기준: 내던숭이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱, 눈썹 길고 바깥 아치가 선명한 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; almond eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; bow-shaped upper lip.
```

### 767 · 꼬시레 (Wimpod)

계열 기준: 꼬시레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 작고 낮은 갑각과 길게 뻗은 가시를 작은 눈과 선명한 코끝으로 해석한다.

**원작 단서:** ‘long spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long spike’ → 코 곧고 가는 콧대 · ‘long spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 각지고 선명한 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; open rounded eyes, small size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; thin lips.
```

### 768 · 갑주무사 (Golisopod)

계열 기준: 꼬시레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 겹친 큰 갑각과 무사의 단단함을 각진 하관과 굵은 눈썹으로 구분한다.

**원작 단서:** ‘several armor plates’ → 얼굴형 각지고 선명한 얼굴형 · ‘several armor plates’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘several armor plates’ → 눈매 가늘고 날카로운 눈 · ‘several armor plates’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 입이 넓은 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; thick low brows; balanced nose; full lips.
```

### 769 · 모래꿍 (Sandygast)

계열 기준: 모래꿍 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 작은 모래산의 둥근 핵심을 둥근 얼굴와 작은 눈으로 해석한다.

**원작 단서:** 몸 형태 squiggle → 얼굴 폭 좁은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; fine soft arches; small delicate nose; wide mouth.
```

### 770 · 모래성이당 (Palossand)

계열 기준: 모래꿍 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 큰 모래성의 넓은 기반과 수직 탑을 넓은 하관과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 무게 250kg → 얼굴 폭 넓은 얼굴 · 고스트 타입 → 눈매 살짝 처진 부드러운 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; drooping eyes, medium size, downturned outer corners, average spacing; straight medium brows; balanced nose; small mouth.
```

### 771 · 해무기 (Pyukumuku)

계열 기준: 해무기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 해삼의 타원 몸과 작은 눈을 완만한 타원 윤곽과 작은 이목구비로 해석한다.

**원작 단서:** ‘ovoid, black body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘ovoid, black body’ → 눈매 큰 눈 · ‘ovoid, black body’ → 눈썹 짧고 둥근 · ‘ovoid, black body’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; short rounded brows; small delicate nose; small mouth.
```

### 772 · 타입:널 (Type: Null)

계열 기준: 타입:널 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘small, silver spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘small, silver spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘small, silver spike’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; balanced nose; full lips.
```

### 773 · 실버디 (Silvally)

계열 기준: 타입:널 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘blunt snout’ → 코 짧고 코끝이 들린 · ‘one visible fang’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; short nose with upturned tip; straight even lips.
```

### 774 · 메테노 (Minior)

계열 기준: 메테노 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘rocky sphere divided into four plates’ → 얼굴형 각지고 선명한 얼굴형 · ‘rocky sphere divided into four plates’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘rocky sphere divided into four plates’ → 눈매 가늘고 날카로운 눈 · ‘rocky sphere divided into four plates’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘rocky sphere divided into four plates’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, wide-set; angled brows; prominent defined nose; thin lips.
```

### 775 · 자말라 (Komala)

계열 기준: 자말라 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** ‘small ruff’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; feathered full brows; balanced nose; medium lips.
```

### 776 · 폭거북스 (Turtonator)

계열 기준: 폭거북스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**원작 단서:** ‘several spikes’ → 얼굴형 각지고 선명한 얼굴형 · 무게 212kg → 얼굴 폭 넓은 얼굴 · ‘several spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘several spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘several spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; almond eyes, medium size, upturned outer corners, average spacing; angled brows; rounded soft tip nose; medium lips.
```

### 777 · 토게데마루 (Togedemaru)

계열 기준: 토게데마루 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 둥근 몸과 털 가시의 대비를 둥근 얼굴 안의 선명한 눈매로 해석한다.

**원작 단서:** 키 0.3m → 얼굴 길이 짧은 얼굴 · ‘14 fur spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘14 fur spikes’ → 코 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; angled brows; straight slender bridge nose; small mouth.
```

### 778 · 따라큐 (Mimikyu)

계열 기준: 따라큐 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 작은 |

**이유:** 누더기로 모습을 감춘 특징을 작은 턱과 부드럽게 내려간 눈꼬리로 해석한다. 천의 가짜 눈과 입을 사람 얼굴에 복제하지 않는다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, downturned outer corners, average spacing; fine soft arches; prominent defined nose; small mouth.
```

### 779 · 치갈기 (Bruxish)

계열 기준: 치갈기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; thin straight brows; small delicate nose; full lips.
```

### 780 · 할비롱 (Drampa)

계열 기준: 할비롱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘small, curved spike’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 무게 185kg → 얼굴 폭 넓은 얼굴 · ‘small, curved spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small, curved spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘small, curved spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, long length, wide width; angular defined jaw; open rounded eyes, medium size, level outer corners, average spacing; angled brows; rounded soft tip nose; thin lips.
```

### 781 · 타타륜 (Dhelmise)

계열 기준: 타타륜 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 키 3.9m → 얼굴형 길고 세련된 얼굴형 · 키 3.9m → 얼굴 길이 긴 얼굴 · 무게 210kg → 코 콧대가 낮고 넓은 · ‘sharp teeth’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 곧고 가는 콧대 → 콧대가 낮고 넓은, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; broad low bridge nose; straight even lips.
```

### 782 · 짜랑꼬 (Jangmo-o)

계열 기준: 짜랑꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘small, tooth-like spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘small, tooth-like spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small, tooth-like spike’ → 눈매 가늘고 날카로운 눈 · ‘small, tooth-like spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘small, tooth-like spike’ → 코 크고 또렷한 코 · ‘large, heart-shaped yellow scale’ → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; prominent defined nose; bow-shaped upper lip.
```

### 783 · 짜랑고우 (Hakamo-o)

계열 기준: 짜랑꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘small spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small spike’ → 눈매 강하게 치켜올라간 눈 · ‘small spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘small spike’ → 입술 얇은 입술

**조정:** 같은 계열 짜랑꼬와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 각지고 선명한 얼굴형 → 균형 잡힌 타원형, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 784 · 짜랑고우거 (Kommo-o)

계열 기준: 짜랑꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘small, tooth-like spike’ → 얼굴형 각지고 선명한 얼굴형 · ‘small, tooth-like spike’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘small, tooth-like spike’ → 눈매 가늘고 날카로운 눈 · ‘small, tooth-like spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘small, tooth-like spike’ → 코 곧고 가는 콧대 · ‘small, tooth-like spike’ → 입술 얇은 입술

**조정:** 같은 계열 짜랑꼬·짜랑고우와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; straight slender bridge nose; thin lips.
```

### 785 · 카푸꼬꼬꼭 (Tapu Koko)

계열 기준: 카푸꼬꼬꼭 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘round, yellow structures’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round, yellow structures’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round, yellow structures’ → 눈썹 짧고 둥근 · ‘round, yellow structures’ → 코 코끝이 둥근 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; bow-shaped upper lip.
```

### 786 · 카푸나비나 (Tapu Lele)

계열 기준: 카푸나비나 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 arms → 턱선 · 턱끝 보통 · 에스퍼 타입 → 눈매 아몬드형 눈 · 페어리 타입 → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 보통, 눈썹 바깥에서 꺾이는 사선 → 가늘고 완만한 곡선

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; thin lips.
```

### 787 · 카푸브루루 (Tapu Bulu)

계열 기준: 카푸브루루 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 넓은 |

**이유:** 큰 소뿔과 나무 껍질의 안정적인 체적을 넓은 하관과 굵은 눈썹으로 해석한다.

**원작 단서:** ‘curved, black horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘curved, black horns’ → 눈매 가늘고 날카로운 눈 · ‘curved, black horns’ → 눈썹 굵고 눈 가까이 낮은 · ‘curved, black horns’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱, 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; prominent defined nose; wide mouth.
```

### 788 · 카푸느지느 (Tapu Fini)

계열 기준: 카푸느지느 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘three spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘three spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three spikes’ → 눈매 강하게 치켜올라간 눈 · ‘three spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 아몬드형 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; full lips.
```

### 789 · 코스모그 (Cosmog)

계열 기준: 코스모그 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 성운의 부드러운 외곽과 작은 눈을 둥근 얼굴와 작은 눈으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘beady yellow eyes’ → 눈 크기 작은 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; thin straight brows; small delicate nose; small mouth.
```

### 790 · 코스모움 (Cosmoem)

계열 기준: 코스모그 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**이유:** 단단한 원시성 껍질 안의 작은 중심을 정돈된 타원 윤곽과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · 무게 999.9kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; straight medium brows; broad low bridge nose; thin lips.
```

### 791 · 솔가레오 (Solgaleo)

계열 기준: 코스모그 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 태양 사자의 큰 갈기와 금속 선을 넓은 얼굴와 깊은 눈매로 해석한다.

**원작 단서:** 무게 230kg → 얼굴 폭 넓은 얼굴 · 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 아몬드형 눈, 눈썹 굵고 눈 가까이 낮은 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, level outer corners, wide-set; thin straight brows; balanced nose; wide mouth.
```

### 792 · 루나아라 (Lunala)

계열 기준: 코스모그 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 짧고 코끝이 들린 |
| 입 | 얇은 입술 |

**이유:** 초승달 같은 거대한 날개를 긴 얼굴와 완만한 눈썹 곡선으로 해석한다.

**원작 단서:** 키 4m → 얼굴형 길고 세련된 얼굴형 · 키 4m → 얼굴 길이 긴 얼굴 · 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘short snout’ → 코 짧고 코끝이 들린 · ‘slightly curved spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, close-set; long arched brows; short nose with upturned tip; thin lips.
```

### 793 · 텅비드 (Nihilego)

계열 기준: 텅비드 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 반투명 종과 긴 촉수의 흐름을 긴 얼굴와 큰 맑은 눈으로 해석한다.

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; open rounded eyes, large size, level outer corners, average spacing; fine soft arches; balanced nose; thin lips.
```

### 794 · 매시붕 (Buzzwole)

계열 기준: 매시붕 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 팽창한 근육과 긴 바늘 입을 넓은 하관과 긴 사람 콧대로 해석한다.

**원작 단서:** ‘several black spikes’ → 얼굴형 각지고 선명한 얼굴형 · 무게 333.6kg → 얼굴 폭 넓은 얼굴 · ‘several black spikes’ → 눈매 가늘고 날카로운 눈 · ‘several black spikes’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, average spacing; thick low brows; long nose with low tip; wide mouth.
```

### 795 · 페로코체 (Pheromosa)

계열 기준: 페로코체 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘long, thin neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long, thin neck’ → 얼굴 길이 긴 얼굴 · ‘long, thin neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long, thin neck’ → 눈매 아몬드형 눈 · ‘long, thin neck’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; thin lips.
```

### 796 · 전수목 (Xurkitree)

계열 기준: 전수목 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 키 3.8m → 얼굴 길이 긴 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 코 작고 여린 코 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; short nose with upturned tip; full lips.
```

### 797 · 철화구야 (Celesteela)

계열 기준: 철화구야 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 대나무와 긴 뿔의 수직선을 긴 윤곽과 길고 곧은 콧대로 해석한다.

**원작 단서:** ‘long gray horn’ → 얼굴형 길고 세련된 얼굴형 · ‘long gray horn’ → 얼굴 길이 긴 얼굴 · ‘long gray horn’ → 얼굴 폭 좁은 얼굴 · ‘four white spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long gray horn’ → 눈매 아몬드형 눈 · ‘four white spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱, 코 길고 코끝이 내려온 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; almond eyes, medium size, downturned outer corners, average spacing; straight medium brows; straight slender bridge nose; thin lips.
```

### 798 · 종이신도 (Kartana)

계열 기준: 종이신도 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**이유:** 접힌 종이의 날카로운 면과 칼날 선을 높은 광대와 가는 눈으로 해석한다.

**원작 단서:** ‘thin and razor-sharp body’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘thin and razor-sharp body’ → 얼굴 길이 긴 얼굴 · ‘thin and razor-sharp body’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘thin and razor-sharp body’ → 눈매 가늘고 날카로운 눈 · ‘thin and razor-sharp body’ → 눈썹 바깥에서 꺾이는 사선 · ‘thin and razor-sharp body’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): sharp face, long length, medium width; narrow tapered chin; narrow eyes, small size, level outer corners, wide-set; angled brows; straight slender bridge nose; thin lips.
```

### 799 · 악식킹 (Guzzlord)

계열 기준: 악식킹 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 엄청난 입과 큰 몸의 체적을 넓은 하관 및 작은 깊은 눈으로 해석한다. 두 번째 입은 복제하지 않는다.

**원작 단서:** ‘small spikes’ → 얼굴형 각지고 선명한 얼굴형 · 무게 888kg → 얼굴 폭 넓은 얼굴 · ‘small spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘small spikes’ → 눈매 가늘고 날카로운 눈 · ‘small spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘small spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, small size, upturned outer corners, average spacing; angled brows; rounded soft tip nose; wide mouth.
```

### 800 · 네크로즈마 (Necrozma)

계열 기준: 네크로즈마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**이유:** 검은 프리즘의 예리한 면을 각진 윤곽과 절제된 이목구비로 해석한다.

**원작 단서:** ‘three large spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘three large spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three large spikes’ → 눈매 가늘고 날카로운 눈 · 무게 230kg → 코 콧대가 낮고 넓은 · ‘three large spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; broad low bridge nose; thin lips.
```

### 801 · 마기아나 (Magearna)

계열 기준: 마기아나 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 인조 몸의 정돈된 대칭과 장식 곡선을 타원 윤곽과 둥근 두 눈으로 해석한다.

**원작 단서:** 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; long arched brows; aquiline nose with convex bridge; bow-shaped upper lip.
```

### 802 · 마샤도 (Marshadow)

계열 기준: 마샤도 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘two curled horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two curled horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · ‘two curled horns’ → 눈썹 굵고 눈 가까이 낮은 · ‘two curled horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; thick low brows; small delicate nose; thin lips.
```

### 803 · 베베놈 (Poipole)

계열 기준: 베베놈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 작은 독침과 타원 눈을 작은 턱과 또렷한 타원 눈으로 해석한다.

**원작 단서:** ‘oval eyes’ → 눈매 큰 눈 · ‘three spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, medium size, downturned outer corners, average spacing; angled brows; small delicate nose; small mouth.
```

### 804 · 아고용 (Naganadel)

계열 기준: 베베놈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 길고 가는 독침과 뾰족한 볏을 긴 얼굴와 날카로운 눈매로 구분한다.

**원작 단서:** ‘long gray spike’ → 얼굴형 길고 세련된 얼굴형 · ‘long gray spike’ → 얼굴 길이 긴 얼굴 · ‘long gray spike’ → 얼굴 폭 좁은 얼굴 · ‘long gray spike’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long gray spike’ → 눈매 강하게 치켜올라간 눈 · ‘long gray spike’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, close-set; angled brows; long nose with low tip; fuller lower lip.
```

### 805 · 차곡차곡 (Stakataka)

계열 기준: 차곡차곡 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 무게 820kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; broad low bridge nose; thin lips.
```

### 806 · 두파팡 (Blacephalon)

계열 기준: 두파팡 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 불꽃놀이 구체와 가는 몸의 대비를 긴 얼굴와 큰 눈 및 넓은 입으로 해석한다.

**원작 단서:** ‘slender torso’ → 얼굴형 길고 세련된 얼굴형 · ‘slender torso’ → 얼굴 길이 긴 얼굴 · ‘slender torso’ → 얼굴 폭 좁은 얼굴 · ‘slender torso’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘slender torso’ → 눈썹 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; open rounded eyes, large size, level outer corners, average spacing; long arched brows; small delicate nose; wide mouth.
```

### 807 · 제라오라 (Zeraora)

계열 기준: 제라오라 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**이유:** 번개 수염과 고양잇과의 예리한 선을 높은 광대와 긴 눈으로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; narrow tapered chin; narrow eyes, medium size, level outer corners, average spacing; angled brows; straight slender bridge nose; full lips.
```

### 808 · 멜탄 (Meltan)

계열 기준: 멜탄 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**이유:** 작은 너트의 육각형과 중심 구체를 각진 윤곽 안의 둥근 두 눈으로 해석한다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형 · 강철 타입 → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; small delicate nose; straight even lips.
```

### 809 · 멜메탈 (Melmetal)

계열 기준: 멜탄 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 큰 너트 팔과 단단한 체적을 넓은 하관과 정돈된 눈으로 구분한다.

**원작 단서:** 무게 800kg → 얼굴 폭 넓은 얼굴 · 무게 800kg → 턱선 · 턱끝 넓고 각진 사각 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; wide mouth.
```

## 8세대 · 96종

### 810 · 흥나숭 (Grookey)

계열 기준: 흥나숭 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 작은 원숭이의 리듬과 둥근 윤곽을 둥근 볼과 열린 눈으로 해석한다.

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; fine soft arches; small delicate nose; wide mouth.
```

### 811 · 채키몽 (Thwackey)

계열 기준: 흥나숭 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 드럼의 반복 리듬과 성장한 원숭이 윤곽을 타원 얼굴와 선명한 눈매로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘several sharp teeth’ → 턱선 · 턱끝 각지고 또렷한 턱

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; small delicate nose; wide mouth.
```

### 812 · 고릴타 (Rillaboom)

계열 기준: 흥나숭 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 큰 고릴라의 이마와 체적을 넓은 하관 및 굵은 직선 눈썹으로 옮긴다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 가늘고 완만한 곡선, 입술 입이 넓은 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; medium lips.
```

### 813 · 염버니 (Scorbunny)

계열 기준: 염버니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 토끼의 큰 귀와 탄력 있는 실루엣을 작은 턱과 열린 눈매로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, average spacing; thin straight brows; small delicate nose; small mouth.
```

### 814 · 래비풋 (Raboot)

계열 기준: 염버니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 옷깃에 감춘 절제된 시선을 낮은 윗눈꺼풀과 타원 얼굴로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘thick, fluffy fur’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘thick, fluffy fur’ → 눈썹 짧고 둥근 · ‘small yellow nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; short rounded brows; small delicate nose; thin lips.
```

### 815 · 에이스번 (Cinderace)

계열 기준: 염버니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 축구 선수 같은 길고 민첩한 선을 긴 얼굴와 집중된 눈매로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; balanced nose; medium lips.
```

### 816 · 울머기 (Sobble)

계열 기준: 울머기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 겁을 먹고 숨는 특징과 큰 눈을 작은 턱과 큰 맑은 눈으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 작은 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; small delicate nose; full lips.
```

### 817 · 누겔레온 (Drizzile)

계열 기준: 울머기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 가늘어진 도마뱀의 선과 낮은 시선을 타원 얼굴와 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; drooping eyes, medium size, downturned outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 818 · 인텔리레온 (Inteleon)

계열 기준: 울머기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 비밀 요원의 길고 가는 선을 긴 중안부와 절제된 긴 눈으로 해석한다.

**원작 단서:** ‘thin, wavy, fin-like crest’ → 얼굴형 길고 세련된 얼굴형 · ‘thin, wavy, fin-like crest’ → 얼굴 길이 긴 얼굴 · ‘thin, wavy, fin-like crest’ → 얼굴 폭 좁은 얼굴 · ‘thin, wavy, fin-like crest’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘thin, wavy, fin-like crest’ → 눈썹 길고 바깥 아치가 선명한 · ‘thin, wavy, fin-like crest’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; long arched brows; long nose with low tip; fuller lower lip.
```

### 819 · 탐리스 (Skwovet)

계열 기준: 탐리스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 코 코끝이 둥근 → 보통, 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; medium lips.
```

### 820 · 요씽리스 (Greedent)

계열 기준: 탐리스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘tan and brown plump body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘tan and brown plump body’ → 얼굴 길이 짧은 얼굴 · ‘tan and brown plump body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘tan and brown plump body’ → 눈매 큰 눈 · ‘tan and brown plump body’ → 눈썹 짧고 둥근 · ‘tan and brown plump body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 가늘고 완만한 곡선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; short rounded brows; rounded soft tip nose; full lips.
```

### 821 · 파라꼬 (Rookidee)

계열 기준: 파라꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 키 0.2m → 얼굴형 짧고 응축된 얼굴형 · ‘few tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 짧고 응축된 얼굴형, 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 눈썹 중간 두께의 직선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): compact face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; feathered full brows; balanced nose; thin lips.
```

### 822 · 파크로우 (Corvisquire)

계열 기준: 파라꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘gray beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; narrow eyes, medium size, upturned outer corners, close-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 823 · 아머까오 (Corviknight)

계열 기준: 파라꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘smooth and resemble plate armor’ → 얼굴형 각지고 선명한 얼굴형 · ‘smooth and resemble plate armor’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘smooth and resemble plate armor’ → 눈매 가늘고 날카로운 눈 · ‘smooth and resemble plate armor’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘smooth and resemble plate armor’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 같은 계열 파크로우와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, close-set; thick low brows; straight slender bridge nose; straight even lips.
```

### 824 · 두루지벌레 (Blipbug)

계열 기준: 두루지벌레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 타원 머리와 큰 반사 눈을 타원 얼굴와 큰 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은 · ‘small mouth and eyebrow-like markings’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; thick low brows; small delicate nose; small mouth.
```

### 825 · 레돔벌레 (Dottler)

계열 기준: 두루지벌레 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘geometric shaped shell’ → 얼굴형 각지고 선명한 얼굴형 · ‘geometric shaped shell’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘orange, blob-like body’ → 눈매 큰 눈 · ‘geometric shaped shell’ → 눈썹 바깥에서 꺾이는 사선 · ‘orange, blob-like body’ → 코 코끝이 둥근 · ‘geometric shaped shell’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; open rounded eyes, small size, level outer corners, average spacing; angled brows; rounded soft tip nose; thin lips.
```

### 826 · 이올브 (Orbeetle)

계열 기준: 두루지벌레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 무당벌레의 둥근 껍질과 정돈된 점무늬를 둥근 얼굴와 집중된 눈으로 해석한다.

**원작 단서:** 몸 형태 wings → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; narrow eyes, medium size, level outer corners, close-set; long arched brows; small delicate nose; thin lips.
```

### 827 · 훔처우 (Nickit)

계열 기준: 훔처우 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘slender body’ → 얼굴형 길고 세련된 얼굴형 · ‘slender body’ → 얼굴 길이 긴 얼굴 · ‘slender body’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘slender body’ → 눈매 아몬드형 눈 · ‘slender body’ → 눈썹 길고 바깥 아치가 선명한 · ‘slender body’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 코 작고 여린 코 → 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; long arched brows; long nose with low tip; bow-shaped upper lip.
```

### 828 · 폭슬라이 (Thievul)

계열 기준: 훔처우 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘two long black ears’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운, 코 작고 여린 코 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, close-set; long arched brows; aquiline nose with convex bridge; bow-shaped upper lip.
```

### 829 · 꼬모카 (Gossifleur)

계열 기준: 꼬모카 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 턱끝이 뒤로 물러난 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 턱끝이 뒤로 물러난, 눈매 큰 눈 → 아몬드형 눈

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; receding soft chin; almond eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; full lips.
```

### 830 · 백솜모카 (Eldegoss)

계열 기준: 꼬모카 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 같은 계열 꼬모카와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 코 코끝이 둥근 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; prominent defined nose; full lips.
```

### 831 · 우르 (Wooloo)

계열 기준: 우르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 보통 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**이유:** 두꺼운 양털과 둥근 몸을 둥근 볼과 부드러운 타원 눈으로 해석한다. 수평 동공은 복제하지 않는다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; balanced jawline; open rounded eyes, medium size, downturned outer corners, wide-set; fine soft arches; rounded soft tip nose; full lips.
```

### 832 · 배우르 (Dubwool)

계열 기준: 우르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 큰 양뿔과 두꺼운 털의 체적을 넓은 하관과 굵은 눈썹으로 구분한다.

**원작 단서:** ‘two larger, longer, dark horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two larger, longer, dark horns’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘two larger, longer, dark horns’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; rounded soft tip nose; medium lips.
```

### 833 · 깨물부기 (Chewtle)

계열 기준: 깨물부기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘short rock-hard orange horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘short rock-hard orange horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘short rock-hard orange horn’ → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘short rock-hard orange horn’ → 눈썹 굵고 눈 가까이 낮은 · ‘short rock-hard orange horn’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈, 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, wide-set; thick low brows; prominent defined nose; thin lips.
```

### 834 · 갈가부기 (Drednaw)

계열 기준: 깨물부기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘yellow horn’ → 얼굴형 각지고 선명한 얼굴형 · ‘yellow horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘yellow horn’ → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘yellow horn’ → 눈썹 바깥에서 꺾이는 사선 · ‘yellow horn’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; sharp eyes, medium size, level outer corners, wide-set; angled brows; balanced nose; thin lips.
```

### 835 · 멍파치 (Yamper)

계열 기준: 멍파치 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** ‘heart-shaped pattern’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘small yellow nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; thick low brows; small delicate nose; medium lips.
```

### 836 · 펄스멍 (Boltund)

계열 기준: 멍파치 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** ‘two spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘two spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two spikes’ → 눈매 가늘고 날카로운 눈 · ‘two spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘two spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 눈썹 굵고 눈 가까이 낮은 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, average spacing; angled brows; balanced nose; medium lips.
```

### 837 · 탄동 (Rolycoly)

계열 기준: 탄동 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 곧고 가는 콧대 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; narrow eyes, small size, level outer corners, wide-set; straight medium brows; broad low bridge nose; thin lips.
```

### 838 · 탄차곤 (Carkol)

계열 기준: 탄동 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘black rocky minecart body’ → 얼굴형 각지고 선명한 얼굴형 · ‘black rocky minecart body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘black rocky minecart body’ → 눈매 가늘고 날카로운 눈 · ‘black rocky minecart body’ → 눈꼬리 각도 올라간 눈꼬리 · ‘black rocky minecart body’ → 눈썹 바깥에서 꺾이는 사선 · ‘black rocky minecart body’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리, 눈 간격 눈 사이가 가까운 → 눈 하나 너비 안팎, 코 보통 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, upturned outer corners, average spacing; angled brows; aquiline nose with convex bridge; thin lips.
```

### 839 · 석탄산 (Coalossal)

계열 기준: 탄동 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘two massive spikes’ → 얼굴형 각지고 선명한 얼굴형 · 키 2.8m → 얼굴 길이 긴 얼굴 · 무게 310.5kg → 얼굴 폭 넓은 얼굴 · ‘two massive spikes’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘two massive spikes’ → 눈매 가늘고 날카로운 눈 · ‘two massive spikes’ → 눈꼬리 각도 올라간 눈꼬리

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): angular face, long length, wide width; square broad jaw; narrow eyes, small size, upturned outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 840 · 과사삭벌레 (Applin)

계열 기준: 과사삭벌레 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** ‘round head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round head’ → 얼굴 길이 짧은 얼굴 · ‘round head’ → 얼굴 폭 넓은 얼굴 · ‘round head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round head’ → 눈썹 짧고 둥근 · ‘round head’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 윗입술이 활 모양인 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; fuller lower lip.
```

### 841 · 애프룡 (Flapple)

계열 기준: 과사삭벌레 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리, 눈썹 굵고 눈 가까이 낮은 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; angled brows; balanced nose; medium lips.
```

### 842 · 단지래플 (Appletun)

계열 기준: 과사삭벌레 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; small delicate nose; bow-shaped upper lip.
```

### 843 · 모래뱀 (Silicobra)

계열 기준: 모래뱀 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴 · ‘oval green eyes’ → 눈매 큰 눈 · ‘oval green eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 아래로 갈수록 좁아지는 턱끝

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; narrow tapered chin; open rounded eyes, medium size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; thin lips.
```

### 844 · 사다이사 (Sandaconda)

계열 기준: 모래뱀 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴

**조정:** 같은 계열 모래뱀와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 보통, 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; balanced jawline; narrow eyes, small size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; medium lips.
```

### 845 · 윽우지 (Cramorant)

계열 기준: 윽우지 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘bright green, large, circular eyes’ → 눈매 큰 눈 · ‘small black pupils’ → 눈 크기 작은 눈 · ‘bright green, large, circular eyes’ → 눈꼬리 각도 수평 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘large, thin yellow beak’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 코 곧고 가는 콧대 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; open rounded eyes, small size, level outer corners, close-set; straight medium brows; prominent defined nose; thin lips.
```

### 846 · 찌로꼬치 (Arrokuda)

계열 기준: 찌로꼬치 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘two big black eyes’ → 눈매 큰 눈 · ‘two big black eyes’ → 눈 크기 큰 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; thick low brows; small delicate nose; full lips.
```

### 847 · 꼬치조 (Barraskewda)

계열 기준: 찌로꼬치 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘long body’ → 얼굴 길이 긴 얼굴 · ‘long body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long body’ → 눈매 아몬드형 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘long body’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, wide-set; long arched brows; small delicate nose; fuller lower lip.
```

### 848 · 일레즌 (Toxel)

계열 기준: 일레즌 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 작은 몸과 원뿔 가시의 대비를 둥근 볼과 낮은 눈꺼풀로 해석한다. 성인 비율을 유지한다.

**원작 단서:** ‘four conical spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, average spacing; angled brows; small delicate nose; full lips.
```

### 849 · 스트린더 (Toxtricity)

계열 기준: 일레즌 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 전기와 펑크의 뾰족한 선을 긴 얼굴와 사선 눈썹으로 해석한다.

**원작 단서:** ‘two additional electric spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘two additional electric spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two additional electric spikes’ → 눈매 강하게 치켜올라간 눈 · ‘two additional electric spikes’ → 눈꼬리 각도 올라간 눈꼬리 · ‘two additional electric spikes’ → 눈썹 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; balanced nose; wide mouth.
```

### 850 · 태우지네 (Sizzlipede)

계열 기준: 태우지네 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 작은 |

**이유:** 지네의 길고 납작한 몸과 불 수염을 긴 얼굴와 낮은 긴 눈으로 해석한다.

**원작 단서:** ‘long, flat body’ → 얼굴형 길고 세련된 얼굴형 · ‘long, flat body’ → 얼굴 길이 긴 얼굴 · ‘long, flat body’ → 얼굴 폭 좁은 얼굴 · ‘long, flat body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long, flat body’ → 코 길고 코끝이 내려온 · 몸 형태 tentacles → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 입술 얇은 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, wide-set; angled brows; long nose with low tip; small mouth.
```

### 851 · 다태우지네 (Centiskorch)

계열 기준: 태우지네 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 큰 지네의 불꽃 능선과 삼각 동공 단서를 강한 사선 눈썹으로 구분한다. 동공은 사람 형태다.

**원작 단서:** 키 3m → 얼굴형 길고 세련된 얼굴형 · 키 3m → 얼굴 길이 긴 얼굴 · 불꽃 타입 → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 tentacles → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 입이 작은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; thick low brows; balanced nose; small mouth.
```

### 852 · 때때무노 (Clobbopus)

계열 기준: 때때무노 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 작은 문어 머리와 권투 장갑의 체적을 둥근 볼과 열린 눈으로 해석한다.

**원작 단서:** 몸 형태 tentacles → 얼굴형 이마가 넓고 턱이 가는 하트형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 이마가 넓고 턱이 가는 하트형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, close-set; angled brows; small delicate nose; full lips.
```

### 853 · 케오퍼스 (Grapploct)

계열 기준: 때때무노 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 큰 문어의 얽힌 촉수와 유술의 힘을 넓은 하관과 깊은 눈매로 구분한다.

**원작 단서:** 격투 타입 → 눈썹 굵고 눈 가까이 낮은 · 몸 형태 tentacles → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 아몬드형 눈, 입술 입이 넓은 → 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; almond eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; small mouth.
```

### 854 · 데인차 (Sinistea)

계열 기준: 데인차 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 찻잔의 둥근 체적과 흐르는 홍차를 둥근 얼굴와 낮은 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; long arched brows; small delicate nose; small mouth.
```

### 855 · 포트데스 (Polteageist)

계열 기준: 데인차 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 찻주전자의 긴 손잡이와 소용돌이를 타원 얼굴와 긴 곡선 눈썹으로 구분한다.

**원작 단서:** 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, wide-set; long arched brows; balanced nose; thin lips.
```

### 856 · 몸지브림 (Hatenna)

계열 기준: 몸지브림 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**이유:** 차분한 둥근 몸과 긴 모자 꼬리를 작은 턱과 낮은 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘round pink body’ → 눈썹 가늘고 완만한 곡선 · ‘round pink body’ → 코 코끝이 둥근 · ‘round pink body’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; drooping eyes, medium size, downturned outer corners, close-set; fine soft arches; rounded soft tip nose; small mouth.
```

### 857 · 손지브림 (Hattrem)

계열 기준: 몸지브림 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 정숙하고 길어진 곡선을 타원 얼굴와 완만한 긴 눈으로 구분한다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · ‘cartoon hearts’ → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; almond eyes, medium size, downturned outer corners, close-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 858 · 브리무음 (Hatterene)

계열 기준: 몸지브림 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 길게 흐르는 마녀의 실루엣을 긴 윤곽과 낮고 고요한 눈매로 해석한다.

**원작 단서:** ‘thin, white body’ → 얼굴형 길고 세련된 얼굴형 · ‘thin, white body’ → 얼굴 길이 긴 얼굴 · ‘thin, white body’ → 얼굴 폭 좁은 얼굴 · ‘thin, white body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘thin, white body’ → 눈매 아몬드형 눈 · ‘thin, white body’ → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, average spacing; thin straight brows; balanced nose; thin lips.
```

### 859 · 메롱꿍 (Impidimp)

계열 기준: 메롱꿍 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 악 타입 → 눈썹 바깥에서 꺾이는 사선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 바깥에서 꺾이는 사선, 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; bow-shaped upper lip.
```

### 860 · 쏘겨모 (Morgrem)

계열 기준: 메롱꿍 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘long white fangs’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long white fangs’ → 입술 굴곡 없이 곧은

**조정:** 같은 계열 메롱꿍와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 각지고 또렷한 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; straight even lips.
```

### 861 · 오롱털 (Grimmsnarl)

계열 기준: 메롱꿍 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 털로 짠 거대한 체적과 도깨비의 각을 넓고 단단한 턱으로 해석한다.

**원작 단서:** 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 입이 넓은 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, close-set; thick low brows; balanced nose; bow-shaped upper lip.
```

### 862 · 가로막구리 (Obstagoon)

계열 기준: 지그제구리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**원작 단서:** ‘long thick forward-leaning neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long thick forward-leaning neck’ → 얼굴 길이 긴 얼굴 · ‘long thick forward-leaning neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long thick forward-leaning neck’ → 눈매 아몬드형 눈 · ‘long thick forward-leaning neck’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; thick low brows; long nose with low tip; medium lips.
```

### 863 · 나이킹 (Perrserker)

계열 기준: 나옹 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 강철 타입 → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 입술 도톰한 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; straight even lips.
```

### 864 · 산호르곤 (Cursola)

계열 기준: 코산호 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**원작 단서:** ‘round face-bearing core’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round face-bearing core’ → 얼굴 폭 넓은 얼굴 · ‘round face-bearing core’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round face-bearing core’ → 눈매 큰 눈 · ‘round face-bearing core’ → 코 코끝이 둥근 · ‘round face-bearing core’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 짧고 둥근 → 굵고 눈 가까이 낮은, 입술 도톰한 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; small mouth.
```

### 865 · 창파나이트 (Sirfetch’d)

계열 기준: 파오리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘white duck with yellow beak’ → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; broad low bridge nose; thin lips.
```

### 866 · 마임꽁꽁 (Mr. Rime)

계열 기준: 흉내내 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 코미디언의 둥근 코와 표현적인 중심을 넓은 얼굴와 넓은 입으로 해석한다.

**원작 단서:** 얼음 타입 → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; open rounded eyes, medium size, downturned outer corners, average spacing; long arched brows; straight slender bridge nose; wide mouth.
```

### 867 · 데스판 (Runerigus)

계열 기준: 데스마스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 턱끝이 뒤로 물러난 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · ‘single purple eye’ → 눈 간격 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, narrow width; receding soft chin; narrow eyes, small size, level outer corners, close-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 868 · 마빌크 (Milcery)

계열 기준: 마빌크 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴, 입술 도톰한 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; bow-shaped upper lip.
```

### 869 · 마휘핑 (Alcremie)

계열 기준: 마빌크 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 턱끝이 뒤로 물러난 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 휘핑크림의 말린 곡선을 둥근 볼과 선명한 곡선 입술로 해석한다.

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · 몸 형태 blob → 눈 간격 눈 사이가 넓은 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 턱끝이 뒤로 물러난, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; receding soft chin; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; small delicate nose; bow-shaped upper lip.
```

### 870 · 대여르 (Falinks)

계열 기준: 대여르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 작은 병사들의 투구와 방패의 반복을 정돈된 각진 얼굴로 해석한다. 인물은 하나다.

**원작 단서:** ‘paired horned shield plates’ → 얼굴형 각지고 선명한 얼굴형 · ‘paired horned shield plates’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘paired horned shield plates’ → 눈매 가늘고 날카로운 눈 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘six black spherical troopers’ → 눈썹 짧고 둥근 · ‘paired horned shield plates’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 짧고 둥근, 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; short rounded brows; prominent defined nose; thin lips.
```

### 871 · 찌르성게 (Pincurchin)

계열 기준: 찌르성게 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 보통 |

**원작 단서:** ‘sharp spines’ → 얼굴형 각지고 선명한 얼굴형 · ‘sharp spines’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘sharp spines’ → 눈썹 바깥에서 꺾이는 사선 · ‘sharp spines’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; open rounded eyes, medium size, level outer corners, average spacing; angled brows; prominent defined nose; medium lips.
```

### 872 · 누니머기 (Snom)

계열 기준: 누니머기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** ‘round white body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round white body’ → 얼굴 길이 짧은 얼굴 · ‘round white body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘icy spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘round white body’ → 코 코끝이 둥근 · ‘icy spikes’ → 입술 얇은 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; rounded soft tip nose; thin lips.
```

### 873 · 모스노우 (Frosmoth)

계열 기준: 누니머기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 bug-wings → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 bug-wings → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘round body’ → 눈썹 짧고 둥근 · ‘round body’ → 코 코끝이 둥근

**조정:** 같은 계열 누니머기와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, close-set; short rounded brows; rounded soft tip nose; thin lips.
```

### 874 · 돌헨진 (Stonjourner)

계열 기준: 돌헨진 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** ‘gray, rectangular body’ → 얼굴형 각지고 선명한 얼굴형 · 키 2.5m → 얼굴 길이 긴 얼굴 · ‘gray, rectangular body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘gray, rectangular body’ → 눈매 가늘고 날카로운 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘gray, rectangular body’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; broad low bridge nose; thin lips.
```

### 875 · 빙큐보 (Eiscue)

계열 기준: 빙큐보 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘white beak’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, average spacing; thin straight brows; prominent defined nose; thin lips.
```

### 876 · 에써르 (Indeedee)

계열 기준: 에써르 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 배 모양 몸과 둥근 얼굴 및 나선 뿔을 완만한 타원 윤곽과 곡선 눈썹으로 해석한다.

**원작 단서:** ‘white round face’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘white round face’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 에스퍼 타입 → 눈매 아몬드형 눈 · ‘white round face’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 부드럽고 둥근 얼굴형

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, average spacing; long arched brows; rounded soft tip nose; bow-shaped upper lip.
```

### 877 · 모르페코 (Morpeko)

계열 기준: 모르페코 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** ‘two almond-shaped ears’ → 눈매 아몬드형 눈 · 악 타입 → 눈썹 바깥에서 꺾이는 사선 · ‘very tiny nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 길고 바깥 아치가 선명한 → 바깥에서 꺾이는 사선, 입술 윗입술이 활 모양인 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; angled brows; small delicate nose; medium lips.
```

### 878 · 끼리동 (Cufant)

계열 기준: 끼리동 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 강철 타입 → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 코 작고 여린 코 → 곧고 가는 콧대, 입술 윗입술이 활 모양인 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; straight slender bridge nose; straight even lips.
```

### 879 · 대왕끼리동 (Copperajah)

계열 기준: 끼리동 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘three claw-like protrusions’ → 얼굴형 각지고 선명한 얼굴형 · ‘three claw-like protrusions’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘three claw-like protrusions’ → 눈썹 바깥에서 꺾이는 사선 · 무게 650kg → 코 콧대가 낮고 넓은 · ‘three claw-like protrusions’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; broad low bridge nose; straight even lips.
```

### 880 · 파치래곤 (Dracozolt)

계열 기준: 파치래곤 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 화석의 강한 아래 몸과 작은 위 몸의 대비를 넓은 하관과 선명한 눈매로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · 무게 190kg → 얼굴 폭 넓은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, long length, wide width; wide heavy chin; sharp eyes, medium size, upturned outer corners, close-set; thick low brows; balanced nose; wide mouth.
```

### 881 · 파치르돈 (Arctozolt)

계열 기준: 파치르돈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 무게 150kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은, 입술 도톰한 입술 → 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; fine soft arches; broad low bridge nose; thin lips.
```

### 882 · 어래곤 (Dracovish)

계열 기준: 어래곤 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 도톰한 입술 |

**이유:** 긴 목과 둥근 물고기 머리의 대비를 긴 중안부와 둥근 눈으로 해석한다.

**원작 단서:** ‘three curved spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘green neck’ → 얼굴 길이 긴 얼굴 · ‘green neck’ → 얼굴 폭 좁은 얼굴 · ‘green neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘rounded triangular plate’ → 눈매 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; open rounded eyes, medium size, level outer corners, close-set; angled brows; long nose with low tip; full lips.
```

### 883 · 어치르돈 (Arctovish)

계열 기준: 어치르돈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘round blue head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round blue head’ → 얼굴 길이 짧은 얼굴 · ‘round blue head’ → 얼굴 폭 넓은 얼굴 · ‘round blue head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘round blue head’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 코 코끝이 둥근 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; short rounded brows; broad low bridge nose; full lips.
```

### 884 · 두랄루돈 (Duraludon)

계열 기준: 두랄루돈 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 아몬드형 눈, 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; fuller lower lip.
```

### 885 · 드라꼰 (Dreepy)

계열 기준: 드라꼰 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**원작 단서:** ‘serpentine body’ → 얼굴형 길고 세련된 얼굴형 · ‘serpentine body’ → 얼굴 길이 긴 얼굴 · ‘serpentine body’ → 얼굴 폭 좁은 얼굴 · ‘serpentine body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘serpentine body’ → 눈매 아몬드형 눈 · ‘serpentine body’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, small size, level outer corners, average spacing; straight medium brows; straight slender bridge nose; small mouth.
```

### 886 · 드래런치 (Drakloak)

계열 기준: 드라꼰 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘two vertical horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two vertical horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two vertical horns’ → 눈매 강하게 치켜올라간 눈 · ‘two vertical horns’ → 눈썹 바깥에서 꺾이는 사선 · ‘two vertical horns’ → 코 곧고 가는 콧대 · ‘two vertical horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; sharp eyes, small size, level outer corners, average spacing; angled brows; straight slender bridge nose; thin lips.
```

### 887 · 드래펄트 (Dragapult)

계열 기준: 드라꼰 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**이유:** 전투기 같은 납작한 머리와 유령 용의 긴 선을 긴 윤곽과 좁은 눈으로 해석한다.

**원작 단서:** 키 3m → 얼굴형 길고 세련된 얼굴형 · 키 3m → 얼굴 길이 긴 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; straight medium brows; long nose with low tip; medium lips.
```

### 888 · 자시안 (Zacian)

계열 기준: 자시안 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**이유:** 검을 연상시키는 왕의 길고 날카로운 선을 긴 얼굴와 또렷한 눈매로 해석한다.

**원작 단서:** 키 2.8m → 얼굴형 길고 세련된 얼굴형 · 키 2.8m → 얼굴 길이 긴 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; straight even lips.
```

### 889 · 자마젠타 (Zamazenta)

계열 기준: 자마젠타 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 방패 같은 갈기와 왕의 안정감을 넓은 얼굴와 굵은 눈썹으로 해석한다.

**원작 단서:** ‘shield-shaped neck fur’ → 얼굴 길이 긴 얼굴 · 무게 210kg → 얼굴 폭 넓은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은 · ‘shield-shaped neck fur’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, long length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, wide-set; thick low brows; straight slender bridge nose; wide mouth.
```

### 890 · 무한다이노 (Eternatus)

계열 기준: 무한다이노 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**이유:** 분절된 긴 외골격을 긴 얼굴와 예리한 광대로 해석한다. 해골 얼굴은 복제하지 않는다.

**원작 단서:** 키 20m → 얼굴형 길고 세련된 얼굴형 · 키 20m → 얼굴 길이 긴 얼굴 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선 · 무게 950kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 길고 코끝이 내려온 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, close-set; angled brows; broad low bridge nose; thin lips.
```

### 891 · 치고마 (Kubfu)

계열 기준: 치고마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 권법 수행자의 작은 단단한 몸과 내려간 눈썹을 굵은 낮은 눈썹으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; narrow eyes, medium size, level outer corners, close-set; thick low brows; small delicate nose; thin lips.
```

### 892 · 우라오스 (Urshifu)

계열 기준: 치고마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 보통 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 권법 곰의 강한 체적과 뻗은 머리띠를 넓은 하관과 굵은 눈썹으로 구분한다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 입이 넓은 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; balanced jawline; sharp eyes, medium size, level outer corners, average spacing; thick low brows; balanced nose; medium lips.
```

### 893 · 자루도 (Zarude)

계열 기준: 자루도 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 거친 원숭이의 긴 팔과 검은 털 및 덩굴을 긴 윤곽과 깊은 눈매로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, close-set; thick low brows; long nose with low tip; wide mouth.
```

### 894 · 레지에레키 (Regieleki)

계열 기준: 레지에레키 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 둥근 전기 중심과 반복 링을 둥근 얼굴와 정돈된 열린 두 눈으로 해석한다.

**원작 단서:** ‘round yellow body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round yellow body’ → 얼굴 길이 짧은 얼굴 · ‘round yellow body’ → 얼굴 폭 넓은 얼굴 · ‘round yellow body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round yellow body’ → 코 코끝이 둥근 · ‘three spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; straight medium brows; rounded soft tip nose; thin lips.
```

### 895 · 레지드래고 (Regidrago)

계열 기준: 레지드래고 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**원작 단서:** 드래곤 타입 → 눈썹 바깥에서 꺾이는 사선 · 무게 200kg → 코 콧대가 낮고 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 코 길고 코끝이 내려온 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; angled brows; broad low bridge nose; wide mouth.
```

### 896 · 블리자포스 (Glastrier)

계열 기준: 블리자포스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**원작 단서:** ‘ice spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘ice spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘ice spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘ice spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; straight slender bridge nose; medium lips.
```

### 897 · 레이스포스 (Spectrier)

계열 기준: 레이스포스 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘wavy purple mane’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, wide-set; feathered full brows; long nose with low tip; medium lips.
```

### 898 · 버드렉스 (Calyrex)

계열 기준: 버드렉스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 큰 왕관과 왕의 고요한 중심을 정돈된 타원 얼굴와 차분한 수평 눈으로 해석한다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 아래로 갈수록 좁아지는 턱끝

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, downturned outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 899 · 신비록 (Wyrdeer)

계열 기준: 노라키 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 큰 눈 → 아몬드형 눈, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 눈썹 가늘고 완만한 곡선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; thin straight brows; balanced nose; full lips.
```

### 900 · 사마자르 (Kleavor)

계열 기준: 스라크 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘numerous black rocky protrusions’ → 얼굴형 각지고 선명한 얼굴형 · ‘numerous black rocky protrusions’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘numerous black rocky protrusions’ → 눈매 강하게 치켜올라간 눈 · ‘numerous black rocky protrusions’ → 입술 얇은 입술

**조정:** 같은 계열 핫삼와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈, 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선, 코 보통 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; straight medium brows; aquiline nose with convex bridge; thin lips.
```

### 901 · 다투곰 (Ursaluna)

계열 기준: 깜지곰 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘nine rectangular brown spikes’ → 얼굴형 각지고 선명한 얼굴형 · 무게 290kg → 얼굴 폭 넓은 얼굴 · ‘nine rectangular brown spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘nine rectangular brown spikes’ → 눈썹 굵고 눈 가까이 낮은 · 땅 타입 → 코 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; open rounded eyes, medium size, level outer corners, wide-set; thick low brows; broad low bridge nose; full lips.
```

### 902 · 대쓰여너 (Basculegion)

계열 기준: 배쓰나이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 키 3m → 얼굴 길이 긴 얼굴 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; full lips.
```

### 903 · 포푸니크 (Sneasler)

계열 기준: 포푸니 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘long black and red feather’ → 얼굴형 길고 세련된 얼굴형 · ‘long black and red feather’ → 얼굴 길이 긴 얼굴 · ‘long black and red feather’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · ‘long black and red feather’ → 눈매 아몬드형 눈 · ‘long black and red feather’ → 눈썹 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; narrow tapered chin; almond eyes, medium size, upturned outer corners, average spacing; long arched brows; small delicate nose; thin lips.
```

### 904 · 장침바루 (Overqwil)

계열 기준: 침바루 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘two very long spikes’ → 얼굴형 길고 세련된 얼굴형 · ‘two very long spikes’ → 얼굴 길이 긴 얼굴 · ‘two very long spikes’ → 얼굴 폭 좁은 얼굴 · ‘two very long spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two very long spikes’ → 눈매 가늘고 날카로운 눈 · ‘small light-yellow eyes’ → 눈 크기 작은 눈

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; narrow eyes, small size, level outer corners, wide-set; angled brows; straight slender bridge nose; full lips.
```

### 905 · 러브로스 (Enamorus)

계열 기준: 러브로스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 하트 문양과 구름 및 두드러진 입술을 작은 턱과 도톰한 사람 입술로 해석한다.

**원작 단서:** ‘magenta heart markings’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 arms → 턱선 · 턱끝 보통 · ‘four sharp magenta horns’ → 눈매 강하게 치켜올라간 눈 · ‘four sharp magenta horns’ → 눈꼬리 각도 올라간 눈꼬리 · ‘two pointed pink ears’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 보통

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; balanced jawline; sharp eyes, medium size, upturned outer corners, average spacing; long arched brows; small delicate nose; full lips.
```

## 9세대 · 120종

### 906 · 나오하 (Sprigatito)

계열 기준: 나오하 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 풀고양이의 작은 얼굴과 잎 같은 눈 주변 선을 작은 턱과 아몬드형 눈으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 길고 바깥 아치가 선명한 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, wide-set; thick low brows; small delicate nose; bow-shaped upper lip.
```

### 907 · 나로테 (Floragato)

계열 기준: 나오하 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 날렵해진 고양이와 장난스러운 꽃의 연출을 타원 얼굴와 올라간 긴 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘long light green fur’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long light green fur’ → 눈썹 길고 바깥 아치가 선명한 · ‘small pink nose’ → 코 작고 여린 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 턱끝이 길고 턱선이 또렷한, 눈꼬리 각도 올라간 눈꼬리 → 수평

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; long chin with defined jaw; sharp eyes, medium size, level outer corners, average spacing; long arched brows; small delicate nose; thin lips.
```

### 908 · 마스카나 (Meowscarada)

계열 기준: 나오하 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 보통 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 가면과 마술사의 길고 예리한 선을 긴 얼굴와 또렷한 눈꼬리로 해석한다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 보통, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; balanced jawline; sharp eyes, medium size, upturned outer corners, close-set; long arched brows; balanced nose; thin lips.
```

### 909 · 뜨아거 (Fuecoco)

계열 기준: 뜨아거 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 작은 악어의 둥근 체적과 큰 입을 둥근 얼굴와 넓은 입으로 옮긴다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 짧은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; rounded soft tip nose; wide mouth.
```

### 910 · 악뜨거 (Crocalor)

계열 기준: 뜨아거 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 둥근 머리와 불꽃 둥지의 둔중한 체적을 넓은 볼과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘long snout’ → 코 길고 코끝이 내려온

**조정:** 같은 계열 뜨아거와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; drooping eyes, medium size, downturned outer corners, average spacing; fine soft arches; long nose with low tip; wide mouth.
```

### 911 · 라우드본 (Skeledirge)

계열 기준: 뜨아거 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 노래하는 큰 악어의 긴 턱과 단단한 면을 각진 하관 및 넓은 입으로 해석한다.

**원작 단서:** ‘rectangular scales’ → 얼굴형 각지고 선명한 얼굴형 · ‘rectangular scales’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘rectangular scales’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; long arched brows; balanced nose; wide mouth.
```

### 912 · 꾸왁스 (Quaxly)

계열 기준: 꾸왁스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 윗입술이 활 모양인 |

**이유:** 오리의 둥근 머리와 단정한 머리깃을 타원 얼굴와 둥근 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘yellow beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; straight slender bridge nose; bow-shaped upper lip.
```

### 913 · 아꾸왁 (Quaxwell)

계열 기준: 꾸왁스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 아랫입술이 더 도톰한 |

**이유:** 정돈된 깃과 춤의 직선 리듬을 긴 얼굴와 집중된 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘pointed yellow beak’ → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 입술 얇은 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; fuller lower lip.
```

### 914 · 웨이니발 (Quaquaval)

계열 기준: 꾸왁스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 크고 또렷한 코 |
| 입 | 도톰한 입술 |

**이유:** 무용수의 긴 곡선과 화려한 깃을 긴 윤곽 및 도톰한 입술로 해석한다.

**원작 단서:** ‘long light blue and orange-red feathers’ → 얼굴형 길고 세련된 얼굴형 · ‘long light blue and orange-red feathers’ → 얼굴 길이 긴 얼굴 · ‘long light blue and orange-red feathers’ → 얼굴 폭 좁은 얼굴 · ‘long light blue and orange-red feathers’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long light blue and orange-red feathers’ → 눈매 아몬드형 눈 · ‘long light blue and orange-red feathers’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; prominent defined nose; full lips.
```

### 915 · 맛보돈 (Lechonk)

계열 기준: 맛보돈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 작은 돼지의 삼각 코와 처진 귀를 둥근 볼과 작은 눈으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; medium lips.
```

### 916 · 퍼퓨돈 (Oinkologne)

계열 기준: 맛보돈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**이유:** 매끈한 돼지 몸과 말린 꼬리를 타원 윤곽과 낮은 눈꺼풀로 구분한다.

**원작 단서:** ‘droopy triangular ears’ → 눈매 살짝 처진 부드러운 눈 · ‘droopy triangular ears’ → 눈꼬리 각도 처진 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; long arched brows; rounded soft tip nose; medium lips.
```

### 917 · 타랜툴라 (Tarountula)

계열 기준: 타랜툴라 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 각진 사각 턱 → 아래로 갈수록 좁아지는 턱끝

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; almond eyes, medium size, level outer corners, average spacing; angled brows; small delicate nose; thin lips.
```

### 918 · 트래피더 (Spidops)

계열 기준: 타랜툴라 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘two large black eyes’ → 눈매 큰 눈 · ‘two large black eyes’ → 눈 크기 큰 눈 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 같은 계열 타랜툴라와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; open rounded eyes, large size, level outer corners, average spacing; thick low brows; balanced nose; thin lips.
```

### 919 · 콩알뚜기 (Nymble)

계열 기준: 콩알뚜기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 각진 사각 턱 → 아래로 갈수록 좁아지는 턱끝, 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, average spacing; angled brows; small delicate nose; medium lips.
```

### 920 · 엑스레그 (Lokix)

계열 기준: 콩알뚜기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**원작 단서:** ‘orange spike’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘orange spike’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘orange spike’ → 눈매 강하게 치켜올라간 눈 · ‘orange spike’ → 눈썹 바깥에서 꺾이는 사선 · ‘orange spike’ → 코 크고 또렷한 코 · ‘orange spike’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 각지고 선명한 얼굴형 → 턱선과 골격이 날카로운 얼굴형

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; angled brows; prominent defined nose; thin lips.
```

### 921 · 빠모 (Pawmi)

계열 기준: 빠모 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**원작 단서:** 키 0.3m → 얼굴형 짧고 응축된 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 짧고 응축된 얼굴형, 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): compact face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, wide-set; fine soft arches; rounded soft tip nose; medium lips.
```

### 922 · 빠모트 (Pawmo)

계열 기준: 빠모 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 코 코끝이 둥근 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; short nose with upturned tip; full lips.
```

### 923 · 빠르모트 (Pawmot)

계열 기준: 빠모 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 격투 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘shaggy tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 같은 계열 빠모트와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형, 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; square broad jaw; open rounded eyes, medium size, level outer corners, close-set; feathered full brows; rounded soft tip nose; full lips.
```

### 924 · 두리쥐 (Tandemaus)

계열 기준: 두리쥐 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 작고 여린 코 |
| 입 | 보통 |

**원작 단서:** ‘spherical head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical head’ → 얼굴 길이 짧은 얼굴 · ‘spherical head’ → 얼굴 폭 넓은 얼굴 · ‘spherical head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘spherical head’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 입술 입이 작은 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, close-set; short rounded brows; small delicate nose; medium lips.
```

### 925 · 파밀리쥐 (Maushold)

계열 기준: 두리쥐 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 좁은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**원작 단서:** ‘spherical head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical head’ → 얼굴 길이 짧은 얼굴 · 몸 형태 heads → 얼굴 폭 좁은 얼굴 · ‘spherical head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘spherical head’ → 눈썹 가늘고 완만한 곡선

**조정:** 같은 계열 두리쥐와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 좁은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, narrow width; soft rounded jaw; almond eyes, large size, level outer corners, close-set; fine soft arches; small delicate nose; small mouth.
```

### 926 · 쫀도기 (Fidough)

계열 기준: 쫀도기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 보통 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; thick low brows; rounded soft tip nose; bow-shaped upper lip.
```

### 927 · 바우첼 (Dachsbun)

계열 기준: 쫀도기 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 길고 코끝이 내려온 |
| 입 | 보통 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘shaggy tufts’ → 눈썹 숱 많고 결이 보이는 · ‘long snout’ → 코 길고 코끝이 내려온

**조정:** 같은 계열 쫀도기와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; feathered full brows; long nose with low tip; medium lips.
```

### 928 · 미니브 (Smoliv)

계열 기준: 미니브 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**원작 단서:** ‘round green body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round green body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round green body’ → 눈매 큰 눈 · ‘beady black eyes’ → 눈 크기 작은 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘round green body’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 윗입술이 활 모양인 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, close-set; short rounded brows; rounded soft tip nose; medium lips.
```

### 929 · 올리뇨 (Dolliv)

계열 기준: 미니브 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘black beady eyes’ → 눈 크기 작은 눈

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; open rounded eyes, small size, level outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 930 · 올리르바 (Arboliva)

계열 기준: 미니브 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 보통 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 입술 윗입술이 활 모양인 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; almond eyes, medium size, level outer corners, average spacing; long arched brows; balanced nose; medium lips.
```

### 931 · 시비꼬 (Squawkabilly)

계열 기준: 시비꼬 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘lazy eyes’ → 눈매 살짝 처진 부드러운 눈 · ‘lazy eyes’ → 눈꼬리 각도 처진 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘rounded yellow beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 아래로 갈수록 좁아지는 턱끝

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; narrow tapered chin; drooping eyes, medium size, downturned outer corners, close-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 932 · 베베솔트 (Nacli)

계열 기준: 베베솔트 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 933 · 스태솔트 (Naclstack)

계열 기준: 베베솔트 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 보통 |

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 같은 계열 베베솔트와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 콧대가 낮고 넓은, 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; broad low bridge nose; medium lips.
```

### 934 · 콜로솔트 (Garganacl)

계열 기준: 베베솔트 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 보통 |

**원작 단서:** 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱

**조정:** 같은 계열 베베솔트와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 아몬드형 눈, 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; almond eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; medium lips.
```

### 935 · 카르본 (Charcadet)

계열 기준: 카르본 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 작은 |

**이유:** 큰 머리와 작은 몸 및 불꽃 망토를 둥근 상안면과 열린 눈으로 해석한다. 인물 나이는 성인이다.

**원작 단서:** ‘very tiny neck’ → 눈매 아몬드형 눈 · ‘very tiny neck’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; straight medium brows; long nose with low tip; small mouth.
```

### 936 · 카디나르마 (Armarouge)

계열 기준: 카르본 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 각진 불꽃 장갑과 전사의 직선성을 각진 하관과 정돈된 긴 눈으로 구분한다.

**원작 단서:** 에스퍼 타입 → 눈매 아몬드형 눈 · 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 아몬드형 눈, 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, average spacing; thin straight brows; balanced nose; thin lips.
```

### 937 · 파라블레이즈 (Ceruledge)

계열 기준: 카르본 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 불꽃 칼날과 기사형 갑옷의 긴 선을 긴 얼굴와 절제된 날카로운 눈으로 해석한다.

**원작 단서:** ‘sharp pale blue protrusion’ → 눈매 가늘고 날카로운 눈 · ‘sharp pale blue protrusion’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, average spacing; angled brows; balanced nose; small mouth.
```

### 938 · 빈나두 (Tadbulb)

계열 기준: 빈나두 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 넓은 |

**원작 단서:** ‘spherical yellow head’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical yellow head’ → 얼굴 길이 짧은 얼굴 · ‘spherical yellow head’ → 얼굴 폭 넓은 얼굴 · ‘spherical yellow head’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical yellow head’ → 눈매 큰 눈 · ‘beady yellow eyes’ → 눈 크기 작은 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 코 코끝이 둥근 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, wide-set; short rounded brows; short nose with upturned tip; wide mouth.
```

### 939 · 찌리배리 (Bellibolt)

계열 기준: 빈나두 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; fine soft arches; small delicate nose; wide mouth.
```

### 940 · 찌리비 (Wattrel)

계열 기준: 찌리비 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · ‘fairly long orange beak’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 눈 간격 눈 사이가 가까운 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, wide-set; straight medium brows; straight slender bridge nose; thin lips.
```

### 941 · 찌리비크 (Kilowattrel)

계열 기준: 찌리비 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘long, hooked beak’ → 눈썹 바깥에서 꺾이는 사선 · ‘long, hooked beak’ → 코 콧대가 볼록한 매부리코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, upturned outer corners, close-set; angled brows; aquiline nose with convex bridge; thin lips.
```

### 942 · 오라티프 (Maschiff)

계열 기준: 오라티프 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 넓은 |

**이유:** 강한 작은 개의 턱과 넓은 입을 선명한 턱끝과 굵은 눈썹으로 해석한다.

**원작 단서:** 악 타입 → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘large mouth’ → 입술 입이 넓은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, wide-set; thick low brows; straight slender bridge nose; wide mouth.
```

### 943 · 마피티프 (Mabosstiff)

계열 기준: 오라티프 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 두목 개의 큰 털 체적과 낮은 시선을 넓은 하관과 낮은 눈꺼풀로 구분한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, balanced length, wide width; wide heavy chin; drooping eyes, medium size, downturned outer corners, wide-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 944 · 땃쭈르 (Shroodle)

계열 기준: 땃쭈르 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**원작 단서:** 키 0.2m → 얼굴 길이 짧은 얼굴 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; fine soft arches; balanced nose; small mouth.
```

### 945 · 태깅구르 (Grafaiai)

계열 기준: 땃쭈르 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 작은 |

**원작 단서:** ‘four tufts’ → 눈썹 숱 많고 결이 보이는 · ‘short snout’ → 코 짧고 코끝이 들린

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; almond eyes, large size, level outer corners, average spacing; feathered full brows; short nose with upturned tip; small mouth.
```

### 946 · 그푸리 (Bramblin)

계열 기준: 그푸리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘thin red pupils’ → 눈매 가늘고 날카로운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; narrow eyes, small size, level outer corners, wide-set; angled brows; small delicate nose; thin lips.
```

### 947 · 공푸리 (Brambleghast)

계열 기준: 그푸리 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**원작 단서:** ‘loose, spherical body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘loose, spherical body’ → 얼굴 길이 짧은 얼굴 · ‘loose, spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘thin red pupil’ → 눈매 가늘고 날카로운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은 · ‘loose, spherical body’ → 눈썹 짧고 둥근

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; narrow eyes, small size, level outer corners, wide-set; short rounded brows; rounded soft tip nose; small mouth.
```

### 948 · 들눈해 (Toedscool)

계열 기준: 들눈해 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** ‘bulbous pink body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘bulbous pink body’ → 눈매 큰 눈 · ‘small pupils’ → 눈 크기 작은 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘bulbous pink body’ → 눈썹 짧고 둥근 · ‘bulbous pink body’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 부드럽고 둥근 얼굴형 → 균형 잡힌 타원형

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, close-set; short rounded brows; rounded soft tip nose; bow-shaped upper lip.
```

### 949 · 육파리 (Toedscruel)

계열 기준: 들눈해 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 작은 |

**원작 단서:** 땅 타입 → 코 콧대가 낮고 넓은 · 몸 형태 tentacles → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 콧대가 낮고 넓은, 입술 윗입술이 활 모양인 → 입이 작은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; long arched brows; broad low bridge nose; small mouth.
```

### 950 · 절벼게 (Klawf)

계열 기준: 절벼게 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 매복하는 큰 갑각과 네모 이빨을 넓은 하관과 긴 입선으로 해석한다.

**원작 단서:** 몸 형태 armor → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 각지고 선명한 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, close-set; straight medium brows; balanced nose; wide mouth.
```

### 951 · 캡싸이 (Capsakid)

계열 기준: 캡싸이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 짧고 코끝이 들린 |
| 입 | 입이 작은 |

**원작 단서:** ‘white, round cap’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘white, round cap’ → 얼굴 길이 짧은 얼굴 · ‘white, round cap’ → 얼굴 폭 넓은 얼굴 · ‘white, round cap’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘white, round cap’ → 눈매 큰 눈 · ‘white, round cap’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 코끝이 둥근 → 짧고 코끝이 들린

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; short rounded brows; short nose with upturned tip; small mouth.
```

### 952 · 스코빌런 (Scovillain)

계열 기준: 캡싸이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘green, stem-like neck’ → 얼굴 길이 긴 얼굴 · ‘green, stem-like neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘green, stem-like neck’ → 눈매 아몬드형 눈 · ‘short, white fangs’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; straight even lips.
```

### 953 · 구르데 (Rellor)

계열 기준: 구르데 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘four horn-like protrusions’ → 얼굴형 각지고 선명한 얼굴형 · ‘four horn-like protrusions’ → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘four horn-like protrusions’ → 눈매 강하게 치켜올라간 눈 · ‘four horn-like protrusions’ → 눈썹 굵고 눈 가까이 낮은 · ‘bulbous nose’ → 코 코끝이 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 큰 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; square broad jaw; sharp eyes, medium size, level outer corners, average spacing; thick low brows; rounded soft tip nose; full lips.
```

### 954 · 베라카스 (Rabsca)

계열 기준: 구르데 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 armor → 턱선 · 턱끝 넓고 각진 사각 턱 · 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 armor → 눈썹 굵고 눈 가까이 낮은

**조정:** 같은 계열 구르데와 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 큰 눈 → 아몬드형 눈, 코 코끝이 둥근 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; square broad jaw; almond eyes, medium size, level outer corners, average spacing; thick low brows; straight slender bridge nose; full lips.
```

### 955 · 하느라기 (Flittle)

계열 기준: 하느라기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 큰 파란 눈과 흰 프릴의 펼침을 넓은 상안면과 큰 사람 눈으로 해석한다.

**원작 단서:** 키 0.2m → 얼굴 길이 짧은 얼굴 · ‘large blue eyes’ → 눈매 큰 눈 · ‘large blue eyes’ → 눈 크기 큰 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘small lavender mouth’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, close-set; long arched brows; small delicate nose; small mouth.
```

### 956 · 클레스퍼트라 (Espathra)

계열 기준: 하느라기 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 타조의 긴 머리와 삼각 무늬 및 긴 주둥이를 긴 중안부와 가는 눈으로 구분한다.

**원작 단서:** 에스퍼 타입 → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 눈썹 길고 바깥 아치가 선명한 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, wide-set; thin straight brows; long nose with low tip; thin lips.
```

### 957 · 어리짱 (Tinkatink)

계열 기준: 어리짱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 보통 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘pyramidal diamond-shaped steel plate’ → 얼굴형 각지고 선명한 얼굴형 · ‘pyramidal diamond-shaped steel plate’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘pyramidal diamond-shaped steel plate’ → 눈매 강하게 치켜올라간 눈 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · ‘pyramidal diamond-shaped steel plate’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈, 눈썹 바깥에서 꺾이는 사선 → 가늘고 완만한 곡선, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; fine soft arches; balanced nose; straight even lips.
```

### 958 · 벼리짱 (Tinkatuff)

계열 기준: 어리짱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘steel plates’ → 얼굴형 각지고 선명한 얼굴형 · ‘steel plates’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘steel plates’ → 눈매 가늘고 날카로운 눈 · 페어리 타입 → 눈썹 가늘고 완만한 곡선 · ‘steel plates’ → 코 곧고 가는 콧대 · ‘steel plates’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 눈썹 바깥에서 꺾이는 사선 → 가늘고 완만한 곡선, 코 보통 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; fine soft arches; straight slender bridge nose; thin lips.
```

### 959 · 두드리짱 (Tinkaton)

계열 기준: 어리짱 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 작은 본체와 거대한 망치의 대비를 작은 턱과 넓고 선명한 입으로 해석한다.

**원작 단서:** ‘steel plates’ → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 이마가 넓고 턱이 가는 하트형 → 각지고 선명한 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, wide-set; long arched brows; small delicate nose; wide mouth.
```

### 960 · 바다그다 (Wiglett)

계열 기준: 바다그다 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘long white worm-like body’ → 얼굴형 길고 세련된 얼굴형 · ‘long white worm-like body’ → 얼굴 길이 긴 얼굴 · ‘long white worm-like body’ → 얼굴 폭 좁은 얼굴 · ‘long white worm-like body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long white worm-like body’ → 눈매 아몬드형 눈 · ‘small dark-blue eyes’ → 눈 크기 작은 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, small size, level outer corners, wide-set; straight medium brows; rounded soft tip nose; full lips.
```

### 961 · 바닥트리오 (Wugtrio)

계열 기준: 바다그다 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 턱끝이 뒤로 물러난 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 blob → 턱선 · 턱끝 턱끝이 뒤로 물러난 · ‘beady dark blue eyes’ → 눈 크기 작은 눈 · 몸 형태 blob → 눈 간격 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, narrow width; receding soft chin; open rounded eyes, small size, level outer corners, wide-set; straight medium brows; rounded soft tip nose; thin lips.
```

### 962 · 떨구새 (Bombirdier)

계열 기준: 떨구새 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘long neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long neck’ → 얼굴 길이 긴 얼굴 · ‘long neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘long neck’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 아몬드형 눈 → 가늘고 날카로운 눈, 눈썹 중간 두께의 직선 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; narrow eyes, medium size, upturned outer corners, close-set; long arched brows; straight slender bridge nose; thin lips.
```

### 963 · 맨돌핀 (Finizen)

계열 기준: 맨돌핀 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 짧고 코끝이 들린 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘short snout’ → 코 짧고 코끝이 들린

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; straight medium brows; short nose with upturned tip; full lips.
```

### 964 · 돌핀맨 (Palafin)

계열 기준: 맨돌핀 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** ‘pink heart-shaped chest mark’ → 얼굴형 이마가 넓고 턱이 가는 하트형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 같은 계열 맨돌핀와 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 이마가 넓고 턱이 가는 하트형, 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; small delicate nose; fuller lower lip.
```

### 965 · 부르롱 (Varoom)

계열 기준: 부르롱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 굴곡 없이 곧은 |

**원작 단서:** ‘metal engine-shaped body’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 legs → 얼굴 폭 좁은 얼굴 · ‘metal engine-shaped body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘metal engine-shaped body’ → 눈매 가늘고 날카로운 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘metal engine-shaped body’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 코 보통 → 곧고 가는 콧대, 입술 얇은 입술 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; angled brows; straight slender bridge nose; straight even lips.
```

### 966 · 부르르룸 (Revavroom)

계열 기준: 부르롱 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘metallic body’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 legs → 얼굴 폭 좁은 얼굴 · ‘metallic body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘metallic body’ → 눈매 가늘고 날카로운 눈 · 몸 형태 legs → 눈 간격 눈 사이가 가까운 · ‘metallic body’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 좁은 얼굴, 눈썹 바깥에서 꺾이는 사선 → 굵고 눈 가까이 낮은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; thick low brows; balanced nose; thin lips.
```

### 967 · 모토마 (Cyclizar)

계열 기준: 모토마 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 보통 |

**이유:** 탑승용 용의 매끈한 흐름을 긴 윤곽과 안정적인 수평 눈으로 해석한다.

**원작 단서:** ‘black neck’ → 얼굴형 길고 세련된 얼굴형 · ‘black neck’ → 얼굴 길이 긴 얼굴 · ‘black neck’ → 얼굴 폭 좁은 얼굴 · ‘black neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘black neck’ → 눈썹 가늘고 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운, 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; thin straight brows; balanced nose; medium lips.
```

### 968 · 꿈트렁 (Orthworm)

계열 기준: 꿈트렁 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘six-segmented metal body’ → 얼굴형 각지고 선명한 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · ‘six-segmented metal body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘six-segmented metal body’ → 눈매 강하게 치켜올라간 눈 · ‘six-segmented metal body’ → 눈썹 바깥에서 꺾이는 사선 · ‘six-segmented metal body’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 큰 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; sharp eyes, small size, level outer corners, average spacing; angled brows; balanced nose; thin lips.
```

### 969 · 초롱순 (Glimmet)

계열 기준: 초롱순 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 콧대가 볼록한 매부리코

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; aquiline nose with convex bridge; thin lips.
```

### 970 · 킬라플로르 (Glimmora)

계열 기준: 초롱순 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 입이 작은 |

**이유:** 결정 꽃의 방사 대칭을 높은 광대와 정돈된 작은 이목구비로 해석한다.

**원작 단서:** 바위 타입 → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): sharp face, balanced length, medium width; square broad jaw; almond eyes, medium size, downturned outer corners, wide-set; straight medium brows; balanced nose; small mouth.
```

### 971 · 망망이 (Greavard)

계열 기준: 망망이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 보통 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 보통, 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; balanced jawline; narrow eyes, medium size, level outer corners, average spacing; thick low brows; straight slender bridge nose; medium lips.
```

### 972 · 묘두기 (Houndstone)

계열 기준: 망망이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 묵직한 턱끝 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘protruding lower jaw’ → 턱선 · 턱끝 넓고 묵직한 턱끝 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 각진 사각 턱 → 넓고 묵직한 턱끝, 눈매 가늘고 날카로운 눈 → 큰 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; wide heavy chin; open rounded eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 973 · 꼬이밍고 (Flamigo)

계열 기준: 꼬이밍고 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 짧고 둥근 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** ‘long serpentine neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long serpentine neck’ → 얼굴 길이 긴 얼굴 · ‘long serpentine neck’ → 얼굴 폭 좁은 얼굴 · ‘long serpentine neck’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long serpentine neck’ → 눈매 아몬드형 눈 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, small size, upturned outer corners, close-set; short rounded brows; straight slender bridge nose; thin lips.
```

### 974 · 터벅고래 (Cetoddle)

계열 기준: 터벅고래 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 작은 육지고래의 둥근 몸과 큰 곡선 입을 둥근 얼굴와 넓은 입으로 해석한다.

**원작 단서:** ‘large eyes’ → 눈매 큰 눈 · ‘large eyes’ → 눈 크기 큰 눈 · ‘single horn’ → 눈썹 바깥에서 꺾이는 사선 · ‘large curved mouth’ → 입술 입이 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, average spacing; angled brows; rounded soft tip nose; wide mouth.
```

### 975 · 우락고래 (Cetitan)

계열 기준: 터벅고래 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 큰 육지고래의 뿔과 넓은 물결 입을 넓은 하관과 작은 깊은 눈으로 구분한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 무게 700kg → 얼굴 폭 넓은 얼굴 · ‘five horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘five horns’ → 눈매 가늘고 날카로운 눈 · ‘five horns’ → 눈썹 굵고 눈 가까이 낮은 · ‘five horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱, 입술 입이 넓은 → 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; thick low brows; balanced nose; thin lips.
```

### 976 · 가비루사 (Veluza)

계열 기준: 가비루사 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 곧고 가는 콧대 |
| 입 | 얇은 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · ‘diamond-shaped spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · 에스퍼 타입 → 눈매 아몬드형 눈 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · ‘diamond-shaped spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘diamond-shaped spikes’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대, 입술 도톰한 입술 → 얇은 입술

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; straight slender bridge nose; thin lips.
```

### 977 · 어써러셔 (Dondozo)

계열 기준: 어써러셔 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 아랫입술이 더 도톰한 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 무게 220kg → 턱선 · 턱끝 넓고 각진 사각 턱 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 무게 220kg → 코 콧대가 낮고 넓은 · 몸 형태 fish → 입술 아랫입술이 더 도톰한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 부드럽고 둥근 턱 → 넓고 각진 사각 턱, 코 작고 여린 코 → 콧대가 낮고 넓은, 입술 도톰한 입술 → 아랫입술이 더 도톰한

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; square broad jaw; almond eyes, medium size, level outer corners, wide-set; fine soft arches; broad low bridge nose; fuller lower lip.
```

### 978 · 싸리용 (Tatsugiri)

계열 기준: 싸리용 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 작은 물고기의 매끈한 윤곽과 영리한 특징을 타원 얼굴와 낮은 눈꺼풀로 해석한다.

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 몸 형태 fish → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; long arched brows; small delicate nose; full lips.
```

### 979 · 저승갓숭 (Annihilape)

계열 기준: 망키 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 코끝이 둥근 |
| 입 | 입이 작은 |

**원작 단서:** ‘round body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘round body’ → 얼굴 폭 넓은 얼굴 · ‘round body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘round body’ → 눈썹 짧고 둥근 · ‘round body’ → 코 코끝이 둥근 · ‘round body’ → 입술 입이 작은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴, 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 입술 도톰한 입술 → 입이 작은

```text
FACE (her own structure, not the style's default face): softly rounded face, balanced length, wide width; soft rounded jaw; almond eyes, medium size, level outer corners, average spacing; short rounded brows; rounded soft tip nose; small mouth.
```

### 980 · 토오 (Clodsire)

계열 기준: 우파 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 짧고 둥근 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 입이 넓은 |

**원작 단서:** ‘rounded body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘rounded body’ → 얼굴 길이 짧은 얼굴 · ‘rounded body’ → 얼굴 폭 넓은 얼굴 · ‘rounded body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘rounded body’ → 눈매 큰 눈 · ‘black beady eyes’ → 눈 크기 작은 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 하나 너비 안팎, 눈썹 가늘고 완만한 곡선 → 짧고 둥근, 코 코끝이 둥근 → 콧대가 낮고 넓은, 입술 도톰한 입술 → 입이 넓은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, small size, level outer corners, average spacing; short rounded brows; broad low bridge nose; wide mouth.
```

### 981 · 키키링 (Farigiraf)

계열 기준: 키링키 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 곧고 가는 콧대 |
| 입 | 보통 |

**원작 단서:** ‘long, brown neck’ → 얼굴형 길고 세련된 얼굴형 · ‘long, brown neck’ → 얼굴 길이 긴 얼굴 · ‘long, brown neck’ → 얼굴 폭 좁은 얼굴 · ‘eight dark brown and yellow spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long, brown neck’ → 눈매 아몬드형 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; almond eyes, medium size, level outer corners, wide-set; thin straight brows; straight slender bridge nose; medium lips.
```

### 982 · 노고고치 (Dudunsparce)

계열 기준: 노고치 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 보통 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 보통 |

**원작 단서:** 몸 형태 squiggle → 얼굴형 길고 세련된 얼굴형 · 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 몸 형태 squiggle → 얼굴 폭 좁은 얼굴

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 도톰한 입술 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; balanced jawline; open rounded eyes, medium size, level outer corners, close-set; fine soft arches; rounded soft tip nose; medium lips.
```

### 983 · 대도각참 (Kingambit)

계열 기준: 자망칼 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 장기 말 같은 겹친 갑옷과 지휘자의 무게를 각진 하관 및 낮은 눈썹으로 해석한다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 굵고 눈 가까이 낮은 → 길고 바깥 아치가 선명한

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, average spacing; long arched brows; balanced nose; thin lips.
```

### 984 · 위대한엄니 (Great Tusk)

계열 기준: 위대한엄니 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 고대 코끼리의 큰 어금니와 육중함을 넓은 하관 및 긴 콧대로 해석한다.

**원작 단서:** ‘pinkish-red spikes’ → 얼굴형 각지고 선명한 얼굴형 · 무게 320kg → 얼굴 폭 넓은 얼굴 · ‘pinkish-red spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘pinkish-red spikes’ → 눈매 가늘고 날카로운 눈 · ‘pinkish-red spikes’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; thick low brows; long nose with low tip; wide mouth.
```

### 985 · 우렁찬꼬리 (Scream Tail)

계열 기준: 우렁찬꼬리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 코끝이 둥근 |
| 입 | 굴곡 없이 곧은 |

**이유:** 풍선 같은 큰 체적과 둥근 눈의 대비를 넓은 볼과 큰 사람 눈으로 해석한다.

**원작 단서:** ‘spherical body’ → 얼굴형 부드럽고 둥근 얼굴형 · ‘spherical body’ → 얼굴 길이 짧은 얼굴 · ‘spherical body’ → 얼굴 폭 넓은 얼굴 · ‘spherical body’ → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘spherical body’ → 눈매 큰 눈 · ‘spherical body’ → 눈썹 가늘고 완만한 곡선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 입이 넓은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, close-set; fine soft arches; rounded soft tip nose; straight even lips.
```

### 986 · 사나운버섯 (Brute Bonnet)

계열 기준: 사나운버섯 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 버섯과 용을 합친 긴 선 및 날카로운 윤곽을 긴 얼굴로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 좁은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): elongated face, long length, medium width; long chin with defined jaw; narrow eyes, small size, level outer corners, wide-set; angled brows; long nose with low tip; thin lips.
```

### 987 · 날개치는머리 (Flutter Mane)

계열 기준: 날개치는머리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 코끝이 둥근 |
| 입 | 윗입술이 활 모양인 |

**이유:** 크게 흐르는 머리와 붉은 눈의 원형을 작은 턱과 큰 사람 눈으로 해석한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘large eyes’ → 눈매 큰 눈 · ‘large eyes’ → 눈 크기 큰 눈 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; open rounded eyes, large size, level outer corners, close-set; long arched brows; rounded soft tip nose; bow-shaped upper lip.
```

### 988 · 땅을기는날개 (Slither Wing)

계열 기준: 땅을기는날개 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 땅을 걷는 큰 나방의 둔중한 체적을 넓은 얼굴와 작은 깊은 눈으로 해석한다.

**원작 단서:** ‘red spiny horn-like structure’ → 얼굴형 각지고 선명한 얼굴형 · ‘red spiny horn-like structure’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘red spiny horn-like structure’ → 눈매 가늘고 날카로운 눈 · ‘red spiny horn-like structure’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘red spiny horn-like structure’ → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 각지고 선명한 얼굴형, 턱선 · 턱끝 넓고 묵직한 턱끝 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, small size, upturned outer corners, wide-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 989 · 모래털가죽 (Sandy Shocks)

계열 기준: 모래털가죽 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 고대 자석의 거친 면과 중심 대칭을 각진 윤곽 및 정돈된 두 눈으로 해석한다.

**원작 단서:** ‘three metallic units’ → 얼굴형 각지고 선명한 얼굴형 · ‘three metallic units’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three metallic units’ → 눈매 가늘고 날카로운 눈

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 사이가 넓은 → 눈 사이가 가까운, 눈썹 굵고 눈 가까이 낮은 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, close-set; thin straight brows; balanced nose; wide mouth.
```

### 990 · 무쇠바퀴 (Iron Treads)

계열 기준: 무쇠바퀴 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 짧고 둥근 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 금속 코끼리의 반복 분절과 단단한 체적을 각진 하관과 수평 눈매로 해석한다.

**원작 단서:** ‘spherical gray metallic body’ → 얼굴형 각지고 선명한 얼굴형 · ‘spherical gray metallic body’ → 얼굴 폭 넓은 얼굴 · ‘spherical gray metallic body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘spherical gray metallic body’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘spherical gray metallic body’ → 눈썹 짧고 둥근

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴, 눈썹 중간 두께의 직선 → 짧고 둥근

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; short rounded brows; balanced nose; thin lips.
```

### 991 · 무쇠보따리 (Iron Bundle)

계열 기준: 무쇠보따리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 작고 여린 코 |
| 입 | 얇은 입술 |

**이유:** 기계 새의 둥근 머리와 정돈된 광원을 타원 얼굴와 원형 사람 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · ‘circular eyes’ → 눈매 큰 눈 · ‘circular eyes’ → 눈꼬리 각도 수평

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; thin straight brows; small delicate nose; thin lips.
```

### 992 · 무쇠손 (Iron Hands)

계열 기준: 무쇠손 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 기계 격투자의 길고 단단한 선을 긴 얼굴와 수평적인 눈매로 해석한다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 균형 잡힌 타원형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, long length, narrow width; long chin with defined jaw; narrow eyes, medium size, level outer corners, close-set; straight medium brows; long nose with low tip; thin lips.
```

### 993 · 무쇠머리 (Iron Jugulis)

계열 기준: 무쇠머리 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 턱선과 골격이 날카로운 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 금속 용의 분절된 대칭을 긴 윤곽과 정돈된 이목구비로 해석한다.

**원작 단서:** ‘black plate’ → 얼굴형 턱선과 골격이 날카로운 얼굴형 · ‘black plate’ → 눈매 가늘고 날카로운 눈 · ‘black plate’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 턱선과 골격이 날카로운 얼굴형, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은

```text
FACE (her own structure, not the style's default face): sharp face, long length, narrow width; long chin with defined jaw; narrow eyes, small size, level outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 994 · 무쇠독나방 (Iron Moth)

계열 기준: 무쇠독나방 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 코끝이 둥근 |
| 입 | 얇은 입술 |

**이유:** 기계 나방의 방사형 날개를 균형 잡힌 타원 얼굴와 수평 눈매로 해석한다.

**원작 단서:** ‘red horns’ → 눈매 가늘고 날카로운 눈 · ‘red horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 넓은, 코 보통 → 코끝이 둥근

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; rounded soft tip nose; thin lips.
```

### 995 · 무쇠가시 (Iron Thorns)

계열 기준: 무쇠가시 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 크고 또렷한 코 |
| 입 | 입이 넓은 |

**이유:** 기계 장갑의 육중한 체적을 넓은 하관 및 작은 깊은 눈으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 무게 303kg → 얼굴 폭 넓은 얼굴 · ‘retractable spikes’ → 눈매 가늘고 날카로운 눈 · ‘retractable spikes’ → 코 크고 또렷한 코

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, small size, level outer corners, average spacing; straight medium brows; prominent defined nose; wide mouth.
```

### 996 · 드니차 (Frigibax)

계열 기준: 드니차 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 드래곤 타입 → 얼굴형 각지고 선명한 얼굴형

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 긴 얼굴, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, long length, medium width; angular defined jaw; sharp eyes, medium size, level outer corners, average spacing; straight medium brows; balanced nose; thin lips.
```

### 997 · 드니꽁 (Arctibax)

계열 기준: 드니차 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** ‘sharp ice spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘sharp ice spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘sharp ice spikes’ → 눈매 강하게 치켜올라간 눈 · ‘sharp ice spikes’ → 눈썹 바깥에서 꺾이는 사선 · ‘sharp ice spikes’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; sharp eyes, medium size, level outer corners, close-set; angled brows; balanced nose; thin lips.
```

### 998 · 드닐레이브 (Baxcalibur)

계열 기준: 드니차 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 넓고 각진 사각 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 가늘고 곧은 |
| 코 | 콧대가 낮고 넓은 |
| 입 | 얇은 입술 |

**원작 단서:** 드래곤 타입 → 얼굴형 각지고 선명한 얼굴형 · 무게 210kg → 턱선 · 턱끝 넓고 각진 사각 턱 · 무게 210kg → 코 콧대가 낮고 넓은

**조정:** 같은 계열 드니차와 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱, 눈썹 중간 두께의 직선 → 가늘고 곧은, 코 보통 → 콧대가 낮고 넓은

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; square broad jaw; narrow eyes, medium size, level outer corners, average spacing; thin straight brows; broad low bridge nose; thin lips.
```

### 999 · 모으령 (Gimmighoul)

계열 기준: 모으령 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**이유:** 상자 속 작은 몸과 금빛 원형 눈을 둥근 얼굴와 둥근 두 눈으로 해석한다.

**원작 단서:** 몸 형태 blob → 얼굴형 부드럽고 둥근 얼굴형 · 키 0.3m → 얼굴 길이 짧은 얼굴 · 몸 형태 blob → 턱선 · 턱끝 부드럽고 둥근 턱 · ‘gold, circular eyes’ → 눈매 큰 눈 · ‘gold, circular eyes’ → 눈꼬리 각도 수평 · 몸 형태 blob → 입술 도톰한 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 입술 입이 작은 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, medium size, level outer corners, close-set; straight medium brows; small delicate nose; full lips.
```

### 1000 · 타부자고 (Gholdengo)

계열 기준: 모으령 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**원작 단서:** ‘oval eyes’ → 눈매 큰 눈 · ‘oval eyes’ → 눈꼬리 각도 수평 · ‘four tufts’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 숱 많고 결이 보이는, 코 작고 여린 코 → 보통

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, medium size, level outer corners, average spacing; feathered full brows; balanced nose; full lips.
```

### 1001 · 총지엔 (Wo-Chien)

계열 기준: 총지엔 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 긴 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**원작 단서:** 몸 형태 squiggle → 얼굴 길이 긴 얼굴 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 길고 바깥 아치가 선명한 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, long length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, close-set; angled brows; small delicate nose; bow-shaped upper lip.
```

### 1002 · 파오젠 (Chien-Pao)

계열 기준: 파오젠 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 무게 152.2kg → 얼굴 폭 넓은 얼굴 · ‘large fangs’ → 턱선 · 턱끝 각지고 또렷한 턱 · 악 타입 → 눈매 강하게 치켜올라간 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴, 눈매 가늘고 날카로운 눈 → 강하게 치켜올라간 눈

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; angular defined jaw; sharp eyes, medium size, level outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 1003 · 딩루 (Ting-Lu)

계열 기준: 딩루 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 각진 사각 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**원작 단서:** 무게 699.7kg → 얼굴 폭 넓은 얼굴 · 무게 699.7kg → 턱선 · 턱끝 넓고 각진 사각 턱 · ‘small red eyes’ → 눈 크기 작은 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 보통 → 넓은 얼굴, 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 각진 사각 턱

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; square broad jaw; open rounded eyes, small size, level outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 1004 · 위유이 (Chi-Yu)

계열 기준: 위유이 · 설계: 원작 단서 규칙 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 도톰한 입술 |

**원작 단서:** 몸 형태 fish → 얼굴형 균형 잡힌 타원형 · 키 0.4m → 얼굴 길이 짧은 얼굴 · 몸 형태 fish → 눈 간격 눈 사이가 넓은 · 악 타입 → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선

```text
FACE (her own structure, not the style's default face): oval face, short length, medium width; soft rounded jaw; almond eyes, medium size, level outer corners, wide-set; angled brows; small delicate nose; full lips.
```

### 1005 · 고동치는달 (Roaring Moon)

계열 기준: 고동치는달 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 거대한 초승달 날개와 고대 용의 긴 선을 긴 얼굴와 날카로운 눈으로 해석한다.

**원작 단서:** ‘light blue spikes’ → 얼굴형 각지고 선명한 얼굴형 · ‘light blue spikes’ → 눈매 강하게 치켜올라간 눈 · ‘light blue spikes’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘light blue spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 길고 세련된 얼굴형 → 각지고 선명한 얼굴형

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; long chin with defined jaw; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; long nose with low tip; wide mouth.
```

### 1006 · 무쇠무인 (Iron Valiant)

계열 기준: 무쇠무인 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 윗입술이 활 모양인 |

**이유:** 쌍날 격투자의 날카로운 직선을 긴 윤곽과 각진 눈썹으로 해석한다.

**원작 단서:** 페어리 타입 → 입술 윗입술이 활 모양인

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈매 가늘고 날카로운 눈 → 아몬드형 눈, 입술 얇은 입술 → 윗입술이 활 모양인

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, level outer corners, average spacing; angled brows; balanced nose; bow-shaped upper lip.
```

### 1007 · 코라이돈 (Koraidon)

계열 기준: 코라이돈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 숱 많고 결이 보이는 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 고대 용의 강한 몸과 큰 볏을 넓은 하관 및 굵은 눈썹으로 해석한다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 무게 303kg → 얼굴 폭 넓은 얼굴 · ‘long, twisted, brow-plume-like tendrils’ → 눈썹 숱 많고 결이 보이는

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운, 눈썹 굵고 눈 가까이 낮은 → 숱 많고 결이 보이는

```text
FACE (her own structure, not the style's default face): oval face, balanced length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, close-set; feathered full brows; balanced nose; wide mouth.
```

### 1008 · 미라이돈 (Miraidon)

계열 기준: 미라이돈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 미래 용의 매끈한 유선형을 긴 얼굴와 정돈된 긴 눈으로 해석한다.

**원작 단서:** ‘primarily metallic, violet body’ → 얼굴형 각지고 선명한 얼굴형 · 키 3.5m → 얼굴 길이 긴 얼굴 · ‘primarily metallic, violet body’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘primarily metallic, violet body’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘primarily metallic, violet body’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 바깥에서 꺾이는 사선 → 중간 두께의 직선

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; narrow eyes, medium size, level outer corners, wide-set; straight medium brows; long nose with low tip; thin lips.
```

### 1009 · 굽이치는물결 (Walking Wake)

계열 기준: 굽이치는물결 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 길고 코끝이 내려온 |
| 입 | 입이 넓은 |

**이유:** 거대한 수중 용의 긴 주둥이와 거친 선을 긴 윤곽과 날카로운 눈으로 해석한다.

**원작 단서:** 키 3.5m → 얼굴형 길고 세련된 얼굴형 · 키 3.5m → 얼굴 길이 긴 얼굴 · ‘blue horn’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘blue horn’ → 눈매 강하게 치켜올라간 눈 · ‘blue horn’ → 눈꼬리 각도 올라간 눈꼬리 · ‘blue horn’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 각지고 선명한 얼굴형 → 길고 세련된 얼굴형

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; sharp eyes, medium size, upturned outer corners, average spacing; angled brows; long nose with low tip; wide mouth.
```

### 1010 · 무쇠잎새 (Iron Leaves)

계열 기준: 무쇠잎새 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 가늘고 곧은 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 금속 뿔과 칼날 잎의 직선을 긴 얼굴와 가늘고 긴 수평 눈으로 해석한다.

**원작 단서:** ‘long metal horns’ → 얼굴형 길고 세련된 얼굴형 · ‘long metal horns’ → 얼굴 길이 긴 얼굴 · ‘long metal horns’ → 얼굴 폭 좁은 얼굴 · ‘long metal horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘long metal horns’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱, 눈썹 중간 두께의 직선 → 가늘고 곧은

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; narrow eyes, small size, level outer corners, wide-set; thin straight brows; balanced nose; thin lips.
```

### 1011 · 과미르 (Dipplin)

계열 기준: 과사삭벌레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 작은 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 곧고 가는 콧대 |
| 입 | 입이 작은 |

**이유:** 길쭉한 사과 돌출과 작은 동공을 타원 얼굴와 작은 또렷한 눈으로 해석한다.

**원작 단서:** ‘small black pupils’ → 눈 크기 작은 눈 · 몸 형태 heads → 눈 간격 눈 사이가 가까운 · ‘tall, thin protrusion’ → 코 곧고 가는 콧대

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 곧고 가는 콧대

```text
FACE (her own structure, not the style's default face): oval face, balanced length, medium width; soft rounded jaw; open rounded eyes, small size, level outer corners, close-set; fine soft arches; straight slender bridge nose; small mouth.
```

### 1012 · 차데스 (Poltchageist)

계열 기준: 차데스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 입이 작은 |

**이유:** 말차와 소용돌이 무늬의 둥근 반복을 둥근 얼굴와 완만한 눈썹으로 해석한다.

**원작 단서:** 몸 형태 ball → 얼굴형 부드럽고 둥근 얼굴형 · 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 폭 넓은 얼굴 → 보통

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, medium width; soft rounded jaw; almond eyes, medium size, downturned outer corners, wide-set; long arched brows; small delicate nose; small mouth.
```

### 1013 · 그우린차 (Sinistcha)

계열 기준: 차데스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 짧고 응축된 얼굴형 · 길이 보통 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 찻잔의 흐르는 소용돌이 얼굴을 타원 윤곽과 낮은 눈꺼풀로 구분한다. 나선 동공은 복제하지 않는다.

**원작 단서:** 몸 형태 ball → 얼굴형 짧고 응축된 얼굴형 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 고스트 타입 → 눈매 살짝 처진 부드러운 눈 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴형 균형 잡힌 타원형 → 짧고 응축된 얼굴형

```text
FACE (her own structure, not the style's default face): compact face, balanced length, medium width; soft rounded jaw; drooping eyes, medium size, downturned outer corners, wide-set; long arched brows; small delicate nose; bow-shaped upper lip.
```

### 1014 · 조타구 (Okidogi)

계열 기준: 조타구 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 균형 잡힌 타원형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 코끝이 둥근 |
| 입 | 입이 넓은 |

**이유:** 큰 개의 체적과 둥근 코를 넓은 하관 및 둥근 코끝으로 옮긴다.

**원작 단서:** 몸 형태 upright → 얼굴형 균형 잡힌 타원형 · 격투 타입 → 눈썹 굵고 눈 가까이 낮은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): oval face, short length, wide width; wide heavy chin; narrow eyes, medium size, level outer corners, close-set; thick low brows; rounded soft tip nose; wide mouth.
```

### 1015 · 이야후 (Munkidori)

계열 기준: 이야후 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 살짝 처진 부드러운 눈 · 크기 보통 · 처진 눈꼬리 · 눈 하나 너비 안팎 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 크고 또렷한 코 |
| 입 | 얇은 입술 |

**이유:** 긴 검은 털과 화살촉 무늬를 긴 윤곽과 가늘고 낮은 눈매로 해석한다.

**원작 단서:** ‘long black fur’ → 얼굴형 길고 세련된 얼굴형 · ‘long black fur’ → 얼굴 길이 긴 얼굴 · ‘long black fur’ → 얼굴 폭 좁은 얼굴 · ‘long black fur’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long black fur’ → 눈썹 길고 바깥 아치가 선명한

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 크고 또렷한 코

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; drooping eyes, medium size, downturned outer corners, average spacing; long arched brows; prominent defined nose; thin lips.
```

### 1016 · 기로치 (Fezandipiti)

계열 기준: 기로치 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 윗입술이 활 모양인 |

**이유:** 작은 새 머리와 긴 목 및 화려한 끝선을 작은 턱과 올라간 눈매로 해석한다.

**원작 단서:** 페어리 타입 → 얼굴형 이마가 넓고 턱이 가는 하트형 · ‘long neck’ → 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 · 몸 형태 wings → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 wings → 눈 간격 눈 사이가 가까운 · ‘long neck’ → 눈썹 길고 바깥 아치가 선명한 · ‘long neck’ → 코 길고 코끝이 내려온

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 코 작고 여린 코 → 길고 코끝이 내려온

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; sharp eyes, medium size, upturned outer corners, close-set; long arched brows; long nose with low tip; bow-shaped upper lip.
```

### 1017 · 오거폰 (Ogerpon)

계열 기준: 오거폰 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 보통 · 폭 보통 · 아래로 갈수록 좁아지는 턱끝 |
| 눈 | 아몬드형 눈 · 크기 큰 눈 · 수평 · 눈 사이가 가까운 |
| 눈썹 | 가늘고 완만한 곡선 |
| 코 | 작고 여린 코 |
| 입 | 입이 넓은 |

**이유:** 가면 아래 작은 얼굴과 잎의 생동감을 작은 턱과 열린 눈매로 해석한다. 가면의 표정은 사람 골격을 바꾸지 않는다.

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈 간격 눈 하나 너비 안팎 → 눈 사이가 가까운

```text
FACE (her own structure, not the style's default face): heart-shaped face, balanced length, medium width; narrow tapered chin; almond eyes, large size, level outer corners, close-set; fine soft arches; small delicate nose; wide mouth.
```

### 1018 · 브리두라스 (Archaludon)

계열 기준: 두랄루돈 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 수평 · 눈 하나 너비 안팎 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 콧대가 볼록한 매부리코 |
| 입 | 보통 |

**이유:** 합금 다리와 지그재그 면을 각진 윤곽과 정돈된 이목구비로 해석한다.

**원작 단서:** 강철 타입 → 얼굴형 각지고 선명한 얼굴형

**조정:** 같은 계열 두랄루돈와 겹쳐 원작 단서의 다음 후보로 옮김 — 코 보통 → 콧대가 볼록한 매부리코, 입술 얇은 입술 → 보통

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, medium size, level outer corners, average spacing; straight medium brows; aquiline nose with convex bridge; medium lips.
```

### 1019 · 과미드라 (Hydrapple)

계열 기준: 과사삭벌레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 턱끝이 길고 턱선이 또렷한 |
| 눈 | 아몬드형 눈 · 크기 보통 · 처진 눈꼬리 · 눈 사이가 가까운 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 길고 코끝이 내려온 |
| 입 | 도톰한 입술 |

**이유:** 사과와 길게 이어진 이무기 몸을 긴 타원 얼굴와 완만한 눈매로 해석한다.

**원작 단서:** ‘long green body’ → 얼굴형 길고 세련된 얼굴형 · ‘long green body’ → 얼굴 길이 긴 얼굴 · ‘long green body’ → 얼굴 폭 좁은 얼굴 · ‘long green body’ → 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 · ‘long green body’ → 눈매 아몬드형 눈 · 몸 형태 heads → 눈 간격 눈 사이가 가까운

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 보통 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; long chin with defined jaw; almond eyes, medium size, downturned outer corners, close-set; long arched brows; long nose with low tip; full lips.
```

### 1020 · 꿰뚫는화염 (Gouging Fire)

계열 기준: 꿰뚫는화염 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 넓은 얼굴 · 넓고 묵직한 턱끝 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 보통 |
| 입 | 입이 넓은 |

**이유:** 고대 화산 짐승의 큰 뿔과 갈기를 넓은 광대 및 강한 눈썹으로 해석한다.

**원작 단서:** ‘five grey spikes’ → 얼굴형 각지고 선명한 얼굴형 · 무게 590kg → 얼굴 폭 넓은 얼굴 · ‘five grey spikes’ → 눈매 강하게 치켜올라간 눈 · ‘five grey spikes’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘five grey spikes’ → 눈썹 바깥에서 꺾이는 사선

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 각지고 또렷한 턱 → 넓고 묵직한 턱끝

```text
FACE (her own structure, not the style's default face): angular face, balanced length, wide width; wide heavy chin; sharp eyes, medium size, upturned outer corners, wide-set; angled brows; balanced nose; wide mouth.
```

### 1021 · 날뛰는우레 (Raging Bolt)

계열 기준: 날뛰는우레 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 길고 세련된 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 굵고 눈 가까이 낮은 |
| 코 | 길고 코끝이 내려온 |
| 입 | 얇은 입술 |

**이유:** 긴 목과 번개 모양 가시의 선을 긴 얼굴와 날카로운 긴 눈으로 해석한다.

**원작 단서:** 키 5.2m → 얼굴형 길고 세련된 얼굴형 · 키 5.2m → 얼굴 길이 긴 얼굴 · ‘three blue triangle spikes’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘three blue triangle spikes’ → 눈매 강하게 치켜올라간 눈 · ‘three blue triangle spikes’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 턱선 · 턱끝 턱끝이 길고 턱선이 또렷한 → 각지고 또렷한 턱

```text
FACE (her own structure, not the style's default face): elongated face, long length, narrow width; angular defined jaw; sharp eyes, medium size, upturned outer corners, wide-set; thick low brows; long nose with low tip; thin lips.
```

### 1022 · 무쇠암석 (Iron Boulder)

계열 기준: 무쇠암석 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 보통 · 폭 보통 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 작은 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 도톰한 입술 |

**이유:** 회전하는 도끼 뿔과 금속 능선을 각진 하관과 정돈된 수평 눈매로 해석한다.

**원작 단서:** ‘two brown, rotatable, axe-like horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two brown, rotatable, axe-like horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two brown, rotatable, axe-like horns’ → 눈매 가늘고 날카로운 눈 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 입술 얇은 입술 → 도톰한 입술

```text
FACE (her own structure, not the style's default face): angular face, balanced length, medium width; angular defined jaw; narrow eyes, small size, level outer corners, wide-set; straight medium brows; balanced nose; full lips.
```

### 1023 · 무쇠감투 (Iron Crown)

계열 기준: 무쇠감투 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 각지고 선명한 얼굴형 · 길이 긴 얼굴 · 폭 좁은 얼굴 · 각지고 또렷한 턱 |
| 눈 | 가늘고 날카로운 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 중간 두께의 직선 |
| 코 | 보통 |
| 입 | 얇은 입술 |

**이유:** 금속 염소의 뿔과 칼날 어깨의 긴 선을 긴 윤곽과 선명한 눈매로 해석한다.

**원작 단서:** ‘two yellow metal horns’ → 얼굴형 각지고 선명한 얼굴형 · ‘two yellow metal horns’ → 턱선 · 턱끝 각지고 또렷한 턱 · ‘two yellow metal horns’ → 눈매 가늘고 날카로운 눈 · ‘two yellow metal horns’ → 눈꼬리 각도 올라간 눈꼬리 · 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘two yellow metal horns’ → 입술 얇은 입술

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈꼬리 각도 수평 → 올라간 눈꼬리

```text
FACE (her own structure, not the style's default face): angular face, long length, narrow width; angular defined jaw; narrow eyes, medium size, upturned outer corners, wide-set; straight medium brows; balanced nose; thin lips.
```

### 1024 · 테라파고스 (Terapagos)

계열 기준: 테라파고스 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 부드럽고 둥근 얼굴형 · 길이 짧은 얼굴 · 폭 넓은 얼굴 · 부드럽고 둥근 턱 |
| 눈 | 큰 눈 · 크기 큰 눈 · 수평 · 눈 사이가 넓은 |
| 눈썹 | 바깥에서 꺾이는 사선 |
| 코 | 작고 여린 코 |
| 입 | 굴곡 없이 곧은 |

**이유:** 작은 거북과 보석 껍질의 둥근 중심을 둥근 얼굴와 큰 맑은 눈으로 해석한다.

**원작 단서:** 몸 형태 quadruped → 눈 간격 눈 사이가 넓은 · ‘tapered segmented diamond ponytail’ → 눈썹 바깥에서 꺾이는 사선 · ‘tapered segmented diamond ponytail’ → 입술 굴곡 없이 곧은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 눈썹 가늘고 완만한 곡선 → 바깥에서 꺾이는 사선, 입술 입이 작은 → 굴곡 없이 곧은

```text
FACE (her own structure, not the style's default face): softly rounded face, short length, wide width; soft rounded jaw; open rounded eyes, large size, level outer corners, wide-set; angled brows; small delicate nose; straight even lips.
```

### 1025 · 복숭악동 (Pecharunt)

계열 기준: 복숭악동 · 설계: 직접 쓴 설계 · 새 경장에 적용

| 묶음 | 설계 |
|---|---|
| 윤곽 | 이마가 넓고 턱이 가는 하트형 · 길이 짧은 얼굴 · 폭 보통 · 부드럽고 둥근 턱 |
| 눈 | 강하게 치켜올라간 눈 · 크기 보통 · 올라간 눈꼬리 · 눈 사이가 넓은 |
| 눈썹 | 길고 바깥 아치가 선명한 |
| 코 | 작고 여린 코 |
| 입 | 윗입술이 활 모양인 |

**이유:** 복숭아 껍질의 하트 같은 윤곽과 반원 눈을 작은 턱과 둥근 상안면으로 해석한다. 검은 원작 얼굴색은 사람 피부에 복제하지 않는다.

**원작 단서:** 몸 형태 ball → 얼굴 길이 짧은 얼굴 · 몸 형태 ball → 턱선 · 턱끝 부드럽고 둥근 턱 · 몸 형태 ball → 눈 간격 눈 사이가 넓은

**조정:** 다른 종과 넷 이상 겹쳐 원작 단서의 다음 후보로 옮김 — 얼굴 길이 보통 → 짧은 얼굴, 턱선 · 턱끝 아래로 갈수록 좁아지는 턱끝 → 부드럽고 둥근 턱

```text
FACE (her own structure, not the style's default face): heart-shaped face, short length, medium width; soft rounded jaw; sharp eyes, medium size, upturned outer corners, wide-set; long arched brows; small delicate nose; bow-shaped upper lip.
```
