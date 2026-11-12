# 지역 테마 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 포켓몬 공방의 테마 여덟을 지역 아홉(관동~팔데아)으로 바꾸고, 지역 그림을 모든 화면 머리에 깔고, 풍경만 보기 · 여행 지도 · 구름 전환 · 지역별 진열장 · 도감 세대 머리줄 지역 이름을 넣는다.

**Architecture:** 지역 표(열쇠 · 세대 · 그림 주소 · 그림 보이는 자리 · 옛 열쇠 짝)는 `lib/workspace-theme.js` 한 곳에 두고 `window.AtelierAppearance` 로 낸다. 색은 지금처럼 `lib/workspace.css` 의 `[data-theme]` 블록(지역 아홉). 머리 그림 · 표지판 · 풍경 · 여행 지도는 모든 화면이 같이 쓰는 `lib/workspace-ui.js` 의 `WorkspaceHeader` 안에서 그린다. 전환은 `AtelierAppearance.travel(key)` 하나가 `document.startViewTransition` 으로 감싼다.

**Tech Stack:** Preact 10.24.3 + htm(esm.sh), 바닐라 JS(IIFE) · CSS, playwright 검사(`tests/browser-harness.cjs`), Node 22.

**Spec:** `docs/superpowers/specs/2026-11-12-region-theme-design.md`

## Global Constraints

- 폴드 덮개 344×882 터치가 1순위 — 누르는 자리 44px 이상, 가로 넘침 0. 펼침 690×829 · PC 1280×900 도 깨지지 않는다.
- 화면 말은 전부 `lib/words.js` 에서(`node tests/words.cjs`). 외래어 대신 한국어. 지역 이름: 관동 · 성도 · 호연 · 신오 · 하나 · 칼로스 · 알로라 · 가라르 · 팔데아.
- 그림은 이 저장소에 두지 않는다 — `pkm-atelier-img-4` 의 `regions/`(그 저장소 `img/` 밖).
- 지역 아홉 모두 AA 대비 4.5:1(지금 `tests/theme-screen.cjs` 의 여섯 쌍)과 `meta[name=theme-color] = --deck`.
- 움직임 줄이기(`window.AtelierMotion` 이 있으면 그 `enabled()` 거짓, 없으면 `prefers-reduced-motion: reduce`) · View Transitions 없는 브라우저에서는 전환 · 흐려지기 없이 바로 바뀐다.
- 공식 로고 · 공식 지도 · 공식 도트를 쓰지 않는다.
- 저장 열쇠: 테마 `pkm_theme_v1`, 옛 공용 `atelier_theme_v1`(읽기만), 진열 `pkm_hall_v1`. 밀도 `atelier_density_v1` 은 손대지 않는다.
- 옛 열쇠 → 지역: midnight→unova · daylight→kanto · blossom→kalos · moss→hoenn · plum→sinnoh · sand→paldea · deep→alola · ember→johto. 모르는 값 → kanto.
- 매 커밋: `docs/PATCH.md` 맨 위에 한 칸(AGENTS.md 5, `node tests/patch.cjs`), 바꾼 공유 파일의 `?v=` 꼬리표를 모든 화면에서 같이 올린다(`lib/workspace.css` · `lib/workspace-ui.js` · `lib/workspace-theme.js` 는 화면 여덟이 부른다). push 전 `git pull --rebase`.
- 검사 돌리기(Git Bash): `NODE_PATH=/c/Users/jjshs/atelier/node_modules fnm exec --using=22 node tests/<파일>.cjs`. 8765 가 다른 세션에 잡혀 있으면 정적 서버를 다른 자리로 띄우고 `BASE_URL` 로.
- 검사는 바꾼 만큼만(CLAUDE.md). 마지막 작업에서만 화면 검사 묶음 전체.

## Review Focus

1. **옛 테마를 저장해 둔 사람이 다시 온다** — 테마는 짝지은 지역으로, 진열장도 그 지역 칸으로 보인다(빈 진열장이 되면 안 된다). → Task 1 · Task 2 검사.
2. **그림을 못 받는다(오프라인 · 저장소 지연)** — 머리는 지역 색 바탕만으로 멀쩡하고 글자가 읽힌다, 풍경 보기 단추는 숨는다. → Task 4 검사.
3. **다른 탭에서 지역을 바꾼다(storage 사건)** — 이 탭도 전환 없이 그 지역으로, 진열장도 바뀐다. → Task 1 검사(이미 있는 storage 줄을 지역 열쇠로).
4. **도감에서 굴려 머리가 접힌 상태(`dex-scrolled`)에서 지역을 바꾸거나 풍경을 연다** — 접힌 머리에선 그림 층도 접혀 내용이 가려지지 않고, 풍경은 접힘과 상관없이 연다. → Task 4 · Task 5 검사.
5. **여행 지도에서 지금 지역을 다시 누른다 · 빠르게 두 번 누른다** — 전환이 겹쳐 돌지 않고, 같은 지역이면 전환 없이 판만 닫힌다. → Task 7 검사.

---

### Task 1: 지역 아홉 — 표 · 색 · 낱말 · 옛 테마 옮기기

**Files:**
- Modify: `lib/workspace-theme.js` (themeColors · normalize · read · AtelierAppearance)
- Modify: `lib/workspace.css:11-66` (테마 여덟 블록 → 지역 아홉), `:127-133` (테마별 바탕 무늬 줄 삭제), `:233,245`(밝은 테마 목록을 지역 열쇠로)
- Modify: `lib/workspace-ui.js` (CREST_MARK 여덟 → `Crest` 하나: 지금 `daylight` 모양)
- Modify: `lib/words.js:177-184,487-489` (theme.* · theme.note.*)
- Test: `tests/workspace-theme.cjs`, `tests/theme-screen.cjs`

**Interfaces:**
- Produces: `window.AtelierAppearance.themes` = `['kanto','johto','hoenn','sinnoh','unova','kalos','alola','galar','paldea']`(세대 차례, frozen).
  `window.AtelierAppearance.regions[key]` = `{gen:Number, art:String, thumb:String, pos:String}` — `art` = `'https://polos0117.github.io/pkm-atelier-img-4/regions/'+key+'.webp'`, `thumb` = 같은 자리 `thumb/`+key+`.webp`, `pos` = CSS background-position(지역마다 랜드마크가 보이게, 기본 `'50% 40%'`).
  `window.AtelierAppearance.legacy` = 옛 열쇠 → 지역 열쇠 표(frozen, Global Constraints 의 짝).
  `get()` · `set(key,value)` 는 그대로.
- 낱말: `theme.<지역>` = 지역 이름(「관동」), `theme.note.<지역>` = 그림 한 줄(설계 표의 「랜드마크 · 시간」을 짧게).

- [ ] **Step 1: 실패하는 검사로 바꾸기** — `tests/workspace-theme.cjs`:
  - 처음 온 사람 `root.dataset.theme === 'kanto'`.
  - `themes` 가 위 아홉(차례까지).
  - 아홉 모두 `set` → `pkm_theme_v1` 저장, `[data-theme="<지역>"]` 블록의 `--deck` = `meta.content`, `[data-theme-preview="<지역>"]` 있음.
  - 옛 값 옮기기: `pkm_theme_v1='plum'` 으로 시작 → `sinnoh` 이고 저장값도 `sinnoh`. 옛 공용 `atelier_theme_v1='midnight'`(지역 값 없음) → `unova`. 모르는 값 `'unknown'` → `kanto`.
  - storage 사건으로 `pkm_theme_v1='galar'` → `galar`.
  - 문장: `CREST_MARK` 가 없고 `Crest` 는 지역과 상관없이 같은 모양(「eight distinct motifs」 단언 삭제).
  - `regions.kanto.art` 가 위 주소, 아홉 모두 `gen` 1~9 한 번씩.
- [ ] **Step 2: 실패 확인** — `node tests/workspace-theme.cjs` → `daylight` 기대 단언에서 FAIL.
- [ ] **Step 3: 구현** — workspace-theme.js 의 `themeColors` 를 지역 아홉(값 = 그 지역 `--deck`)으로, `normalize` 는 옛 열쇠를 `legacy` 로 바꾼 뒤 모르면 `'kanto'`, `read` 는 옮긴 값을 `pkm_theme_v1` 에 다시 적는다. workspace.css 지역 아홉 블록: 지금 블록과 같은 변수 전부(`color-scheme · --bg · --deck · --card · --card2 · --text · --muted · --line · --accent · --accent-soft · --on-accent · --signal · --gold · --ok · --warn · --pattern · --shadow`). 색은 설계 「지역 색」 규칙대로 그림(`C:\Users\jjshs\pkm-region-art\<지역>.webp`)에서 — 하나는 어두운 판(`color-scheme:dark`), 신오는 판단. `:root,` 기본 선택자는 kanto 블록으로.
- [ ] **Step 4: `tests/theme-screen.cjs` 를 아홉으로** — `.theme-card` 수 9, 처음 `kanto`, 대비 · theme-color 를 아홉 지역에서. 테마별 바탕 무늬 단언(`backgrounds` 집합)과 문장 모양 집합 단언은 삭제(Task 4 가 그림 단언을 더한다). 실행 → PASS.
- [ ] **Step 5: 통과 확인** — `node tests/workspace-theme.cjs` · `node tests/theme-screen.cjs` · `node tests/words.cjs` 모두 PASS.
- [ ] **Step 6: 커밋** — PATCH.md 한 칸, `?v=` 올림(workspace.css · workspace-ui.js · workspace-theme.js 를 부르는 화면 여덟).

### Task 2: 진열장 — 지역마다 따로, 옛 테마 진열 옮기기

**Files:**
- Modify: `lib/img.js:198-225` (hallTheme · hallAll)
- Test: `tests/home-screen.cjs` (진열 덩어리 뒤에 추가)

**Interfaces:**
- Consumes: `AtelierAppearance.legacy`, `AtelierAppearance.get().theme`(Task 1).
- Produces: `AtelierImg.hallPicks(theme?)` · `setHallPicks(list, theme?)` · `toggleHall(name, theme?)` — 이름 · 인자 그대로, `theme` 기본이 지금 지역. 기본값 `'daylight'` → `'kanto'`.

- [ ] **Step 1: 실패하는 검사** — `home-screen.cjs` 에 `store: ['pkm_hall_v1', JSON.stringify({daylight:['이상해씨'], midnight:['파이리'], kanto:['꼬부기']})]` 로 연 탭:
  - `hallPicks('kanto')` 가 `['꼬부기']`(이미 있는 지역 칸은 덮지 않는다), `hallPicks('unova')` 가 `['파이리']`, `hallPicks('galar')` 가 `[]`.
  - 저장값에 `daylight` · `midnight` 칸이 없다.
  - 한 번 더 새로고침해도 같은 결과.
- [ ] **Step 2: 실패 확인** — `node tests/home-screen.cjs` → 그 단언 FAIL.
- [ ] **Step 3: 구현** — `hallAll()` 이 읽을 때 옛 열쇠 칸이 있으면 `legacy` 로 옮겨(대상 칸이 없을 때만) 옛 칸을 지우고 한 번 저장한다. 배열 하나로 된 아주 옛 값(`Array.isArray(j)`)은 `kanto` 칸으로.
- [ ] **Step 4: 통과 확인** — `node tests/home-screen.cjs` · `node tests/theme-screen.cjs`(현황 줄 진열 수) PASS.
- [ ] **Step 5: 커밋** — PATCH.md, `img.js?v=` 를 부르는 화면 모두.

### Task 3: 지역 그림 올리기 · 검사 껍데기가 그림 주소를 받게

**Files:**
- 그림 저장소(따로 클론): `C:\Users\jjshs\pkm-atelier-img-4\regions\<지역>.webp` 아홉 + `regions\thumb\<지역>.webp` 아홉
- Modify: `tests/browser-harness.cjs` (route — `regions/` 주소)

**Interfaces:**
- Produces: 배포 주소 `https://polos0117.github.io/pkm-atelier-img-4/regions/<지역>.webp` · `…/regions/thumb/<지역>.webp`(Task 1 의 `art` · `thumb`). 검사에서는 껍데기가 이 주소를 아무 그림으로 채운다.

- [ ] **Step 1: 그림 저장소 클론 · 규칙 읽기** — `git clone https://github.com/polos0117/pkm-atelier-img-4 /c/Users/jjshs/pkm-atelier-img-4`, 그 README · 워크플로가 `img/` 밖을 건드리지 않는지 확인(`regions/` 를 썸네일 · 등록 워크플로가 읽지 않아야 한다).
- [ ] **Step 2: 그림 넣기** — 원본은 `C:\Users\jjshs\pkm-region-art\<지역>.webp` 를 바꾸지 않고 복사(설계의 sha256 과 같아야 한다 — `sha256sum` 으로 대조). 엽서용 `thumb/` 은 PIL 로 폭 360 · WebP q80.
- [ ] **Step 3: 올리기** — 그 저장소 main 에 커밋 · push(메시지 한국어, 공동 작성 줄). 몇 분 뒤 `curl -sI <art 주소>` 가 200 · `image/webp`.
- [ ] **Step 4: 껍데기** — `browser-harness.cjs` route 에서 경로가 `/pkm-atelier-img-4/regions/` 로 시작하면 코드 안에 둔 작은 PNG(1×1 이상, base64 상수)로 200 응답(`opt.regionArt === false` 면 404 — Task 4 의 「그림 못 받음」 검사용). 저장소에 그림 파일을 두지 않는다.
- [ ] **Step 5: 확인 · 커밋** — `node tests/theme-screen.cjs` 그대로 PASS. PATCH.md(이 저장소: 껍데기 · 그림 자리) 한 칸.

### Task 4: 화면 머리 — 지역 그림 · 표지판 · 반투명 제목판

**Files:**
- Modify: `lib/workspace-ui.js` (`WorkspaceHeader` · `WorkspaceHeading`)
- Modify: `lib/workspace.css` (머리 층)
- Create: `tests/region-header.cjs`
- Test: `tests/header-layout.cjs`

**Interfaces:**
- Consumes: `AtelierAppearance.regions`(Task 1), 그림 주소(Task 3).
- Produces: 머리 DOM — `.workspace-header` 안에 `.region-hero`(배경 그림 층, `data-region=<지역>`, 그림을 못 받으면 `.no-art`), `button.region-sign`(글 `W('region.sign',{name})` = 「관동 지방」, 누르면 Task 6 의 여행 지도를 연다 — 이 작업에서는 `onOpenMap` 을 받는 자리만), `button.scenery-toggle`(Task 5 가 동작을 붙인다). 제목판은 지금 `.workspace-heading`(글 그대로)을 반투명 판으로.

- [ ] **Step 1: 실패하는 검사 `tests/region-header.cjs`** — 344×882 · 690×829 · 1280×900, 화면 여덟(index · dex · prompt · battle · run · lane · gwent · survey):
  - `.region-hero` 의 계산된 `background-image` 에 `regions/kanto.webp` 가 있고, 지역을 `alola` 로 바꾸면 `regions/alola.webp`.
  - `.region-sign` 글이 「관동 지방」, 높이 44px 이상.
  - 344×882 에서 `.workspace-nav` 아래끝 ≤ 300px, 가로 넘침 0.
  - 제목 `h1` 의 글자색과 그 뒤 제목판 바탕(계산된 배경 · 지역 `--card` 반투명)의 대비 ≥ 4.5.
  - `opt.regionArt:false` 로 연 탭: `.region-hero.no-art`, `.scenery-toggle` 숨김, 제목 대비는 그대로 ≥ 4.5.
  - dex 에서 `.collection-scroll` 을 굴려 `main.dex-scrolled` 가 붙으면 `.region-hero` 높이가 접힌 머리 높이를 넘지 않는다.
- [ ] **Step 2: 실패 확인** — `node tests/region-header.cjs` → `.region-hero` 없음 FAIL.
- [ ] **Step 3: 구현** — 그림 층은 `background-image` + 아래로 `--bg` 로 녹는 그라데이션(시안 A: 폰에서 300px 남짓). 그림 받기는 `new Image()` 로 미리 받아 실패하면 `.no-art`. 표지판은 공통 겉모습(나무 이정표: 갈색 판 · 둥근 오른끝 · 못 하나 — 지역 색과 무관한 고정 색, 글자 대비 4.5 이상). 접힘(`folded` · `dex-scrolled`)에서는 그림 층을 접힌 머리 높이로. 문장은 Task 1 의 하나.
- [ ] **Step 4: `tests/header-layout.cjs` 갱신 · 통과** — 머리 높이 기대값만 새 머리에 맞추고 나머지(여덟 화면 · 다섯 크기 · 접힘 · 건너뛰기 링크) 그대로 PASS. `region-header.cjs` PASS.
- [ ] **Step 5: 커밋** — PATCH.md, 낱말 `region.sign`, `?v=`, AGENTS.md 검사 목록에 `region-header.cjs`.

### Task 5: 풍경만 보기

**Files:**
- Modify: `lib/workspace-ui.js` (Scenery 층, `.scenery-toggle` · 그림 층 빈 곳 누르기)
- Modify: `lib/workspace.css`
- Test: `tests/region-header.cjs` (덩어리 추가)

**Interfaces:**
- Consumes: `.scenery-toggle`(Task 4), `regions[theme].art`.
- Produces: 열린 동안 `document.documentElement.classList` 에 `scenery`, 층 `.scenery`(role=dialog, aria-label `W('region.scenery')`), 닫는 단추 `.scenery-close`(`W('region.scenery.close')`). 열 때 `history.pushState({scenery:1})`, `popstate` 로 닫힌다.

- [ ] **Step 1: 실패하는 검사** — 344×882 dex:
  - `.scenery-toggle` 누름 → `.scenery` 보임, `.workspace-nav` · `.collection-scroll` 의 계산된 불투명도 0(또는 visibility hidden), 그림 폭 > 화면 폭이고 `.scenery` 의 `scrollLeft` 를 밀 수 있다(가로로 둘러보기).
  - 뒤로 가기(`page.goBack()`) → 닫히고 주소는 dex 그대로(앞 화면으로 안 나간다).
  - 다시 열고 Esc → 닫힘, `.scenery-close` 로도 닫힘.
  - `dex-scrolled` 상태에서도 열린다.
  - `reducedMotion:'reduce'` 탭: 열고 닫을 때 `transition-duration` 0.
- [ ] **Step 2: 실패 확인** — FAIL(`.scenery` 없음).
- [ ] **Step 3: 구현** — 머리 그림 층의 빈 곳 누르기와 `.scenery-toggle` 둘 다 연다. 그림은 높이 100%, 폭 자연(가로 굴림), 처음엔 `regions[theme].pos` 자리로 굴려 둔다.
- [ ] **Step 4: 통과 확인** — `node tests/region-header.cjs` PASS.
- [ ] **Step 5: 커밋** — PATCH.md, 낱말 `region.scenery` · `region.scenery.close`, `?v=`.

### Task 6: 여행 지도 · 지역 고르개들

**Files:**
- Modify: `lib/workspace-ui.js` (RegionMap 판 · `AppearanceControls` 의 테마 select · `ThemeGallery`)
- Modify: `lib/workspace.css`
- Create: `tests/region-map.cjs`

**Interfaces:**
- Consumes: `.region-sign`(Task 4), `regions[key].thumb · gen`.
- Produces: 판 `.region-map`(role=dialog, aria-label `W('region.map')`), 엽서 `button.region-card[data-region=<지역>]`(작은 그림 · `W('theme.'+key)` · `W('region.map.gen',{n})`), 지금 지역 엽서에 `aria-current="true"` 와 도장(`W('region.map.here')`). 엽서 누름 → `AtelierAppearance.travel(key)`(Task 7 — 이 작업에서는 `travel` 이 없으면 `set('theme',key)`로) 후 판 닫힘. ⚙ select 와 `ThemeGallery` 의 `onChange`/`onClick` 도 같은 경로.

- [ ] **Step 1: 실패하는 검사 `tests/region-map.cjs`** — 344×882 · 690×829 · 1280×900:
  - `.region-sign` 누름 → `.region-map` 보임, `.region-card` 9, 차례 kanto…paldea, kanto 엽서 `aria-current="true"`.
  - 엽서 모두 높이 44px 이상, 판 안에서 아홉이 다 보이거나 판이 세로로 굴러 마지막 엽서에 닿는다, 가로 넘침 0.
  - `hoenn` 엽서 누름 → `dataset.theme === 'hoenn'`, 판 닫힘, 표지판 글 「호연 지방」, 진열 현황(`.lab-status [data-status=hall]`)이 호연 칸 수.
  - Esc · 판 바깥 누르기로 닫힘, 초점이 표지판으로 돌아온다.
  - ⚙ select 와 집 화면 `ThemeGallery` 에도 지역 아홉, 고르면 같은 결과.
- [ ] **Step 2: 실패 확인** — FAIL.
- [ ] **Step 3: 구현** — 판은 아래에서 올라오는 판(폰) · 가운데 판(PC). 엽서 배치는 344 에서 두 칸 격자(만드는 쪽 판단 가능, 위 단언만 지키면).
- [ ] **Step 4: 통과 확인** — `region-map.cjs` · `theme-screen.cjs` PASS.
- [ ] **Step 5: 커밋** — PATCH.md, 낱말 `region.map` · `region.map.gen` · `region.map.here`, `?v=`, AGENTS.md 검사 목록.

### Task 7: 구름 전환 — `AtelierAppearance.travel`

**Files:**
- Modify: `lib/workspace-theme.js` (`travel`)
- Modify: `lib/workspace.css` (`::view-transition-old(root)` · `::view-transition-new(root)`)
- Test: `tests/region-map.cjs` (덩어리 추가)

**Interfaces:**
- Produces: `window.AtelierAppearance.travel(key) → Promise<void>` — 같은 지역이면 아무것도 안 하고 끝, 전환 중에 또 부르면 진행 중인 전환을 건너뛰게(`skipTransition`) 하고 새 것만, 움직임 줄이기 · `startViewTransition` 없음이면 `set('theme',key)` 만. 전환 중 `documentElement.classList` 에 `travelling`. storage 사건은 `travel` 을 거치지 않는다(전환 없음).

- [ ] **Step 1: 실패하는 검사** — `init` 으로 `document.startViewTransition` 을 감싸 부른 수를 센다:
  - 엽서 하나 누름 → 1번, 끝나면 `travelling` 없음, 전환 시간(계산된 `animation-duration`) ≤ 0.8s.
  - 같은 지역 엽서 → 0번, 판만 닫힘.
  - 다른 엽서 둘을 50ms 간격으로 → 마지막 지역으로 끝나고 오류 없음.
  - `reducedMotion:'reduce'` 탭 → 0번, 지역은 바뀜.
  - `startViewTransition` 을 지운 탭 → 오류 없이 바뀜.
  - 다른 탭 storage 사건 → 0번.
- [ ] **Step 2: 실패 확인** — FAIL(`travel` 없음).
- [ ] **Step 3: 구현** — 구름은 CSS 가면(흐린 흰 덩어리 그라데이션 · SVG 가면 중 판단): 옛 화면이 구름 속으로 흐려지고 새 화면이 구름을 걷어내며. 0.6초 안팎. Task 6 의 고르개 셋이 `travel` 을 부르게 바꾼다.
- [ ] **Step 4: 통과 확인** — `region-map.cjs` PASS.
- [ ] **Step 5: 커밋** — PATCH.md, `?v=`.

### Task 8: 도감 세대 머리줄 지역 이름 · 마무리 검사

**Files:**
- Modify: `dex.html` (List 의 `.gen-head`)
- Modify: `lib/words.js` (`dex.gen.region`)
- Test: `tests/dex-box.cjs`

**Interfaces:**
- Consumes: `AtelierAppearance.themes`(세대 n → `themes[n-1]`).
- Produces: `.gen-head` 첫 글이 `W('dex.gen.region',{gen:W('card.gen',{n}),region:W('theme.'+themes[n-1])})` = 「5세대 · 하나 지방」.

- [ ] **Step 1: 실패하는 검사** — `dex-box.cjs` 의 머리줄 단언: `heads[4][0] === '5세대 · 하나 지방'`, 첫 머리줄 「1세대 · 관동 지방」.
- [ ] **Step 2: 실패 확인 → 구현 → 통과** — `node tests/dex-box.cjs` PASS.
- [ ] **Step 3: 마무리 검사 묶음** — words · workspace-theme · theme-screen · header-layout · region-header · region-map · home-screen · dex-box · dex-gutter · dex-favorites · gallery-screen · patch. 그림이 없어 원래부터 멈추던 검사(dex-forms · dex-recent · dex-nav)는 바꾸기 전과 같은 자리에서 멈추는지만 본다.
- [ ] **Step 4: 344×882 스크린샷** — 집 · 도감 · 프롬프트를 관동 · 하나 · 알로라로 찍어 사용자에게 보낸다(SendUserFile).
- [ ] **Step 5: 커밋 · push** — PATCH.md, `?v=`.
