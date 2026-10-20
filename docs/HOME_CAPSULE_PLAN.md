# 집 화면 — 정비 캡슐 줄 (작업 계획서)

> 2026-10-20 claude 가 짜고 gpt 가 맡는다. 다 하면 이 문서 끝의 "끝났다고 보는 것" 을 체크하고,
> `docs/PATCH.md` 에 칸을 적는다. 이 문서는 지우지 않고 "한 일" 로 남긴다.

## 0. 왜

다른 공방의 집 화면에는 그 공방다운 진열대가 있다 — 신화(`myth-atelier/index.html`)는 제단 위를 도는 **신전 홀**,
책(`book-atelier/index.html` + `lib/bookshelf.js`)은 **책장**, 건담은 3D 격납고. pkm 은 소개 글과 링크 카드 일곱 장뿐이다.
허브(`polos0117.github.io`) 지도에서 pkm 은 **초록 수조가 있는 연구소 방**이다 — 들어오면 같은 연구소가 이어지게,
**메카 포켓몬이 하나씩 든 유리 캡슐이 연구소 벽을 따라 줄지어 선** 진열대를 만든다.

## 1. 화면 한 장 (위에서 아래로)

1. 머리(`WorkspaceHeader page="index"`) — 그대로.
2. **캡슐 줄** `section.capsule-bay` — 새로 만든다. 이 문서의 본론.
3. 짧은 소개 한 줄 + 꼬리표 — 지금 `.lab-intro` 를 캡슐 줄 아래로 내리고 줄인다(제목·소개 문구는 그대로 낱말 표에서).
4. 패치 기록 단추(`Patch`) — 그대로.
5. **연구소 구역판** `.lab-links` — 링크 일곱 장은 그대로 두고 이름표만 연구소 구역으로 바꾼다(5절).
6. 테마 갤러리(`ThemeGallery`) — 그대로.

## 2. 캡슐 줄

### 2-1. 무엇을 세우나

- **진열한 것 먼저.** 도감에서 고른 포켓몬(최대 12) — 책·신화의 진열과 같은 방식을 `lib/img.js` 에 옮긴다
  (`myth-atelier/lib/img.js` 의 `HALL_STORE`·`hallTheme`·`hallPicks`·`setHallPicks`·`toggleHall` 을 그대로.
  저장 열쇠는 `pkm_hall_v1`, 테마(서고)마다 따로, 이 브라우저에만). 도감 상세에 "연구소에 진열" 단추 하나 —
  `book-atelier/dex.html` 의 `#dex-hall` 단추와 같은 꼴.
- **진열이 비었으면** 그림 있는 종에서 무작위 12. 같은 진화 가족이 둘 이상 안 나오게(`data/card.json` 의 `from`·`to` 로 묶는다).
- 한 캡슐의 그림 = 기본 화풍(`glossy_promo`, 없으면 그 종에 있는 첫 화풍)의 **경장 `light` 폼**,
  없으면 `heavy` → `mobility` 차례. 썸네일(`AtelierImg.thumbURL`)을 쓰고, 썸네일이 없으면 원본(`imgURL`)으로 한 번 되돌린다.
  그래도 없으면 캡슐 안에 이름표만(빈 캡슐 — 액체만 빛난다).

### 2-2. 캡슐 하나

```
┌───────┐  ← 금속 뚜껑(위 고리 + 작은 상태등 — 타입 색)
│ ░░░░░ │  ← 유리관: 안쪽에 타입 색 액체 빛(아래가 진하고 위로 옅어짐), 기포 몇 개가 천천히 오른다
│  🖼  │  ← 메카 그림(2:3, 유리 안. 위쪽이 얼굴이 되게 object-position: center top)
│ ░░░░░ │
├───────┤  ← 받침: No.0025 · 이름 · 타입 칩(한두 개)
└───────┘
```

- 자료: `data/card.json` 의 `cards` 에서 `no`(번호, 네 자리로 0 채움) · `name` · `element`·`element2`(타입).
  타입 색은 `data/group.json` 의 `color`(예: fire `#E62829`), 타입 이름은 같은 파일의 `name`.
- 빛 색 = `element` 색. 타입이 둘이면 액체를 아래 `element` → 위 `element2` 로 그라데이션.
- 유리 반사(세로 흰 띠 하나), 금속 테두리, 바닥 그림자 — CSS 만으로(그림 파일 없이).
- 상태는 둘: **닫힘**(기본) · **열림**(눌렀을 때, 2-4).

### 2-3. 늘어놓기

- **가로로 한 줄**, 넘치면 옆으로 민다(`overflow-x:auto` + `scroll-snap`). 캡슐 너비는 화면에 맞춰:
  덮개(344×882) 약 120px, 휴대폰 세로(390) 128px, 폴드 안쪽(690) 150px, PC 170px. 첫 화면에 캡슐이 셋 이상 보이게.
- **휴대폰 가로·폴드 덮개 가로(높이 550 아래)** — 캡슐 높이가 화면 높이를 넘지 않게 `dvh` 로 묶는다
  (`book-atelier/lib/landscape.css` 의 방식). 머리 자리는 건드리지 않는다(`tests/header-layout.cjs`).
- 캡슐 줄 뒤에 연구소 벽(2-6). 앞에 금속 바닥 띠.
- 줄 위 작은 줄: 왼쪽 "연구소 진열 / 진열한 n" 또는 "무작위", 오른쪽 **"오버드라이브 보기"** 단추 하나.

### 2-4. 누르면 — 캡슐이 열린다

- 유리가 위로 올라가고(0.35s) 그 캡슐 그림이 앞으로 나온다. 다른 캡슐은 어두워진다.
- 캡슐 줄 아래(가로 화면이면 오른쪽)에 **정보판** 하나: 큰 그림 · No · 이름 · 분류(`genus`) · 타입 칩 ·
  도감 한 줄(`text`) · 문 셋 — **도감에서 보기**(`dex.html?mech=<이름>`) · **프롬프트로**(`prompt.html?mech=<이름>`,
  이미 이 꼴을 읽는다 — `lib/prompt-ui.js` 338줄) · **닫기**.
- `dex.html?mech=<이름>` 은 지금 없다 — 도감이 이 값을 읽어 그 카드 상세를 바로 열게 더한다.
  없는 이름이면 목록 그대로.
- Esc · 바깥 누르기 · 닫기로 닫힌다. 열린 캡슐은 주소에 안 남긴다.

### 2-5. 오버드라이브 보기

신화의 "각성 보기", 책의 "개방 보기" 와 같은 자리. 누르면 모든 캡슐 그림이 그 폼의 `<폼>_overdrive`
(`light` 이면 `light_overdrive`)로 바뀐다(겹친 두 장의 불투명도만 바꾼다 — 다시 받지 않는다).
없는 종은 그대로. 액체 빛이 한 단계 밝아지고 상태등이 깜빡인다. 다시 누르면 돌아온다.

### 2-6. 연구소 벽 — 배경 그림(선택)

CSS 만으로도 된다(어두운 금속 패널 + 파이프 선 몇 줄 + 아래쪽 타입 색 반사). 그림을 쓰고 싶으면 한 장만:

- **파일**: `pkm-atelier-img-2` 저장소의 `ui/lab-bay.webp`(그림 저장소의 `img/` 가 아니라 `ui/` — 등록기·썸네일 워크플로가
  안 건드린다). 주소 `https://polos0117.github.io/pkm-atelier-img-2/ui/lab-bay.webp`. 없으면 CSS 벽으로.
- **크기**: 2400×1000(가로), webp q85. 캡슐이 그 위에 서므로 **가운데 아래 60% 는 비워 둔다**(벽과 바닥만).
- **프롬프트 (그대로 쓰면 된다)**:

  > Wide interior of a sleek high-tech mecha research lab at night, empty of people and creatures. A long back wall of
  > dark brushed-metal panels with thin glowing cyan and amber trim lines, overhead pipe runs and cable trays, small
  > status lights, a few holographic data screens with abstract graphs high on the wall. A polished dark metal floor with
  > soft reflections. The lower middle of the frame is an open, uncluttered floor strip where a row of display capsules
  > will be added later — leave it empty. Cinematic, clean, semi-realistic concept art, deep navy and graphite palette,
  > soft rim lighting. No text, no logos, no characters, no capsules, no tanks. Aspect 12:5.

- 테마 여덟(`lib/workspace-theme.js`)이 밝은 것도 있다 — 그림 위에 `--bg` 색 반투명을 깔아 테마에 맞춘다
  (밝은 테마는 옅게, 어두운 테마는 그대로).

## 3. 움직임

- 기포가 천천히 오른다(캡슐마다 박자를 다르게). 액체 빛이 아주 천천히 숨 쉰다.
- 마우스를 올리면 그 캡슐 상태등이 켜지고 살짝 떠오른다(2px).
- `prefers-reduced-motion` 이면 기포·숨쉬기를 멈추고 여닫기는 바로.

## 4. 낱말 (`lib/words.js` — 화면에 한글을 박지 않는다)

새 열쇠(예): `home.bay` 연구소 진열 · `home.bay.picked` 진열한 {n} · `home.bay.random` 무작위 ·
`home.bay.pick` 진열할 포켓몬은 도감에서 고른다 · `home.bay.overdrive` 오버드라이브 보기 · `home.bay.empty` 빈 캡슐 ·
`home.bay.toDex` 도감에서 보기 · `home.bay.toPrompt` 프롬프트로 · `home.bay.close` 닫기 · `dex.hall.add`/`remove`/`full`/`count`.
번호 꼴 `home.bay.no` = `No.{n}`.

## 5. 연구소 구역판 — 링크 일곱 장의 이름표

링크(`dex prompt battle run lane gwent survey`)와 순서는 그대로. `home.<key>.code` 를 구역 번호로, 제목 앞에 구역 이름:

| 열쇠 | code | 구역 |
|---|---|---|
| dex | `A-01 / ARCHIVE` | 기록실 |
| prompt | `A-02 / DESIGN` | 설계실 |
| battle | `B-01 / TEST` | 시험장 |
| run | `B-02 / EXPEDITION` | 원정 |
| lane | `C-01 / ARENA` | 대전장 · 진화 결투 |
| gwent | `C-02 / ARENA` | 대전장 · 폼 결투 |
| survey | `D-01 / SURVEY` | 조사실 |

카드 꼴은 지금 `.lab-link` 를 살짝만 — 왼쪽 위에 구역 번호 판(금속 명판 느낌), 오른쪽 위 화살표는 그대로.

## 6. 파일

- `index.html` — `CapsuleBay` 컴포넌트(신화의 `Hall` 자리), App 차례 바꿈.
- `lib/capsule.css`(새) — 캡슐·줄·정보판·벽. `workspace.css` 는 되도록 안 건드린다.
- `lib/img.js` — 진열(2-1). `dex.html` — 진열 단추, `?mech=` 읽기.
- `lib/words.js` — 4·5절.
- `tests/home-screen.cjs`(새) — 7절. `AGENTS.md` 검사 목록에 한 줄.
- `docs/PATCH.md` — 한 칸.

## 7. 검사 — `tests/home-screen.cjs` (`tests/browser-harness.cjs` 를 쓴다)

크기: 덮개 344×882 · 휴대폰 세로 390×844 · 휴대폰 가로 844×390 · 덮개 가로 882×344 · 폴드 안쪽 690×829 · PC 1280×900.

- 캡슐이 1~12 개 선다. 첫 화면에 셋 이상 보인다. 가로로 페이지가 넘치지 않는다(캡슐 줄만 옆으로 민다).
- 가로 크기 둘에서 캡슐 하나가 화면 높이 안에 다 든다.
- 그림 없는 종 → 이름표 캡슐. 썸네일 404 → 원본으로.
- 진열: `localStorage` 에 `pkm_hall_v1` 을 심으면 그 차례대로 선다.
- 누르면 열린다 — 정보판에 No·이름·타입, 도감 문이 `dex.html?mech=<이름>`. Esc 로 닫힌다.
- 오버드라이브 보기 — 있는 종은 그림 주소가 `_overdrive` 로, 없는 종은 그대로.
- `dex.html?mech=피카츄` 가 그 상세를 연다.
- 링크 일곱 장이 그대로 있다(주소 같음).
- 기존 검사가 그대로 통과: `words.cjs` · `header-layout.cjs` · `theme-screen.cjs` · `patch.cjs` · `patch-screen.cjs` · `dex-nav.cjs`.

## 끝났다고 보는 것

- [ ] 캡슐 줄 · 열기 · 오버드라이브 보기 · 진열(도감 단추 포함) · `?mech=` 바로 열기
- [ ] 여섯 크기에서 넘침 없음, 가로에서 캡슐이 높이 안에
- [ ] 구역판 이름표
- [ ] (선택) 배경 그림 `ui/lab-bay.webp` — 없으면 CSS 벽
- [ ] `tests/home-screen.cjs` 와 기존 검사 통과, `AGENTS.md`·`docs/PATCH.md` 적음
