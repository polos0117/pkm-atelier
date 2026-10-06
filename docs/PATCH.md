# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "5. 고쳤으면 적는다" 에 있다.
집 화면(`index.html`)의 **패치 기록** 단추가 이 파일을 그대로 읽어 보여 준다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-09-21` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 화면이 읽지 않는다. `node tests/patch.cjs` 가 모양을 본다.

여기서부터 적기 시작했다. 그 전 것은 `git log` 에 있다.

## 2026-10-06 · claude · 폼 결투 — 화면 뼈대

- gwent.html — 고르기·로비·덱 짜기(날씨판 넣기/빼기)·상세(폼 셋과 힘)·규칙·멀리건·결과·전적·상점. 대결 판은 다음 칸. 같은 저장(pkm_duel_v1)의 decks.gwent·matches.gwent
- tests/gwent-screen.cjs — 덮개 흐름 검사 1(고르기 → 로비 → 덱 짜기 → 배우기 → 멀리건)
- lib/words.js — 탭 말을 '폼결투'로(띄면 덮개 탭에서 잘린다)

## 2026-10-06 · claude · 폼 결투 — 말·항해·집·허브

- lib/words.js — gwent.* 와 nav.gwent·home.gwent.* (공통 말은 lane.* 를 같이 쓴다)
- lib/workspace-ui.js — 탭 여덟, 폼 결투 제목·부제
- lib/workspace.css — 덮개에서 탭 일곱이 한 줄에 들도록 글자 11px
- index.html — 놀이 목록에 폼 결투
- *.html, lib/prompt-ui.js, lib/survey-ui.js — words·workspace-ui·workspace.css 를 ?v=gwent1 로
- tests/header-layout.cjs, tests/theme-screen.cjs — 화면 여덟

## 2026-10-06 · claude · 폼 결투 — AI·정산·균형 보고

- lib/gwent.js — AI 셋(신참 무작위·숙련 값 최대와 패스 둘·에이스 1라운드 영웅 아끼기와 일찍 접기), 정산(stats.gwent·보상·금·상점 돌림). 균형 보고로 FIRST_BONUS=12(선공 42%)
- lib/collection.js — 통계 그릇에 폼 결투 몫(bestRound·weather·opens), statsView 가 건넨다
- tests/gwent-sim.cjs — AI·정산 검사, 297판 + 난이도 맞대결 120판 균형 보고(에이스는 자기 덱으로 잰다)
- tests/lane-sim.cjs — 통계 그릇에 새 칸 셋

## 2026-10-06 · claude · 폼 결투 — 상성 타격·결속·개방·날씨

- lib/gwent.js — 놓을 때 상성 타격(2배 −2·4배 −3·바닥 1·영웅 제외), 계통 결속(각각 기본 힘), 개방(+5, 내 차례마다 −1), 날씨판(줄을 골라 양쪽 비영웅 1, 또 내면 걷힘)
- tests/gwent-sim.cjs — 그 검사

## 2026-10-06 · claude · 폼 결투 — 판

- lib/gwent.js — 시드 판·멀리건·선공 보너스·내기(줄 = 폼)·패스·턴·라운드·목숨·합산. 라운드 사이 보충 없음, 동점은 둘 다 잃음
- tests/gwent-sim.cjs — 그 검사

## 2026-10-06 · claude · 폼 결투 — 덱 규칙과 챔피언 덱

- lib/gwent.js — 덱 규칙 여섯(25·주 세대 15·전설 4·날씨판 3·같은 id 1·안 가진 카드), 자동 채우기, 챔피언 덱(에이스는 전설 4 + 날씨판 2)
- tests/gwent-sim.cjs — 그 검사

## 2026-10-06 · claude · 폼 결투 — 자료와 파생

- data/gwent.json — 폼 결투 자료(overrides·줄별 날씨 열쇠). 챔피언은 lane.json 것을 같이 쓴다
- lib/gwent.js — 둘째 결투 엔진의 뼈대: 힘 셋(경장 공격+특공·중장 방어+특방·고기동 속도×2, ÷20, 1~15)·계통·날씨판 id(이름|w)
- tests/gwent-sim.cjs — 파생 검사(정한 예·천장·날씨판 id)
- tests/forms.cjs — gwent.json 의 날씨 셋·overrides 범위

## 2026-10-06 · claude · 폼 결투(궨트식) 구현 계획

- docs/superpowers/plans/2026-10-06-gwent-duel.md — 아홉 과제: 자료·파생 → 덱 규칙·챔피언 → 판 → 타격·결속·개방·날씨 → AI·정산·균형 → 말·항해·허브 → 화면 뼈대 → 대결 판 → 문서

## 2026-10-06 · claude · 폼 결투(궨트식) 설계

- docs/superpowers/specs/2026-10-06-gwent-duel-design.md — 둘째 결투의 설계. 줄이 폼(힘이 폼마다 다름)·상성 타격·계통 결속·개방(열 출혈)·날씨판(가진 카드의 공짜 폼)·진영 능력 없음. 컬렉션·보상·상점은 진화 결투와 같이 쓴다

## 2026-10-06 · claude · 진화 결투 — 리뷰 뒤 손질: 덮개에서 가려지던 단추, 풀에서 빠진 카드

- lane.html — 패스·개방·? 를 위 막대에서 손패 칸 제목 줄로. 덮개 첫 판(길잡이 켜짐)에서 위 막대가 손패 칸에 깔려 패스를 누르면 "길잡이 끄기"가 눌렸다. 저장을 읽을 때 덱은 풀 안의 카드만 남긴다 — 그림이 내려간 카드가 덱에 남으면 "25/25 규칙 미달·안 가진 카드" 로 틀리게 말하고 뺄 길도 없었다. 컬렉션엔 남긴다(그림이 돌아오면 쓰게)
- tests/lane-screen.cjs — 첫 판 화면에서 굴리기 전에 패스·개방·? 자리를 짚어 그 단추가 잡히는지, 풀에서 빠진 카드가 든 옛 저장이 24/25 로 보이는지

## 2026-10-06 · claude · 진화 결투 — 규칙 문서·검사 목록

- docs/LANE_GAME.md — 한 판·진행·AI·자료·저장·검사 · docs/GAME_CONCEPT.md — 가리킴 · AGENTS.md — 먼저 읽을 것·검사 둘, 머리 검사는 화면 일곱 · README.md — lane.html · tests/header-layout.cjs — 통과 글에 화면 일곱

## 2026-10-06 · claude · 진화 결투 — 결과·보상 뒤집기·전적·상점·배우기

- lane.html — 결과(승·패·무·+금, 라운드별 줄 ●○·, 뒷장 다섯 — 세대만 보이는 뒷면을 눌러 일상컷으로 공개, 첫 승 3장·재대결 1장, 나머지는 놓친 카드, 떠나면 자동), 전적(챔피언별·난이도별·주 세대별·최고 줄·평균 라운드·카드별 승률·끝까지 키운 계통), 상점(뒷장 여섯·값표·희귀·새로 깔기), 배우기(규칙 넷·길잡이 다시). 판이 끝나면 한 번만 정산, 새로고침해도 이어진다. 옛 저장(deck 하나·stats 없음·모르는 이름)도 올려 쓴다
- tests/browser-harness.cjs — store(저장값 심기)는 탭에서 한 번만. 초기화 스크립트가 새로고침마다 다시 돌아 화면이 저장한 것을 덮었다 — "새로고침해도 이어진다" 를 볼 수 없었다
- tests/lane-screen.cjs — 이기기 직전 판 → 새로고침 이어짐 → 승리 → 뒷장 5·뒤집기·새로고침·놓친 카드 → 컬렉션·금·통계 → 로비·전적·상점(새로 깔기)·배우기 → 옛 저장

## 2026-10-06 · claude · 진화 결투 — 대결 화면

- lane.html — 멀리건(8장 펼쳐 2장 바꾸기), 대결: 상대 띠(초상·손패 부채·묘지·개방 썼는지), 세 줄이 가로로 셋(위 상대 스택·가운데 승부 칸 — 공격값·×2/×½/면역 배지·따는 쪽 화살표·속도/고기동/먼저·아래 내 스택, 앞 단계는 부채꼴), 막대(딴 줄 ●○·라운드·목숨·차례·패스·개방·?), 손패 띠. 손패 카드 → 상세에서 폼 셋 그림 나란히 고르고 "놓기" → 빛나는 줄을 누른다(같은 계통이면 "진화", 내 스택이 있으면 "교체"). 내 스택 → 옮기기(고기동)·개방. 상대 턴은 0.6초마다, 매 수 저장. 연출: 날아가는 카드·뒤집기·진화 빛·개방 터짐·옮기기 미끄러짐·배지 튀어오름·라운드 결과 띠와 딴 줄 테두리. 규칙 한눈에·첫 판 길잡이
- tests/lane-screen.cjs — 판을 손으로 짜서 저장에 넣고 멀리건 → 중장으로 놓기 → 진화(10) → 교체 자리 → 개방 → 고기동 옮기기 → 취소 → 패스 → 라운드 결과, 매 수 저장

## 2026-10-06 · claude · 진화 결투 — 첫 고르기·로비·덱 짜기

- lane.html — 저장(pkm_duel_v1 — 프로필 + matches.lane, 모르는 이름 걸러 내기), 그림(폼 초상·개방·일상컷), 카드 칸(경장 초상·힘·타입 칩·단계), 상세(폼 셋 그림이 나란히), 첫 고르기(17장 미만 세대는 "그림 n장 더"로 잠김), 로비(주 세대·덱 상태·컬렉션 n/풀/전체·금·난이도·챔피언 아홉 — 그림 모자라면 잠김·정복 띠), 덱 짜기(주 세대·규칙 줄·거르개 세대/계통·넣기 빼기·자동 채우기)
- tests/lane-screen.cjs — img.json 을 1~3세대 전부 등록된 것으로 바꿔 끼워 덮개에서 고르기 → 로비 → 덱 짜기 흐름, 44px·가로 넘침

## 2026-10-06 · claude · 진화 결투 — 낱말·머리 메뉴 일곱·껍데기

- lib/words.js — nav.lane · home.lane.* · lane.*(로비·덱 짜기·대결·결과·전적·상점·규칙·길잡이). 모든 화면의 words.js 를 v=lane1 로
- lib/workspace-ui.js — 메뉴 일곱(연구소·도감·프롬프트·전투·런·결투·탐사), 제목 표에 lane, 문양·제목을 연구소 링크로(v=lane1)
- lib/workspace.css — 덮개(599px 이하)는 연구소 탭을 숨기고 탭 글자 10px, 접어도 문양 + 제목 한 줄(44px)이 남아 연구소 링크. 낮은 화면은 연구소 탭 되살림(v=lane1)
- lane.html — 껍데기: 자료 읽기·.ln-screen
- index.html — 놀이 목록에 결투
- tests/header-layout.cjs — 화면 일곱·탭 7·덮개 규칙(연구소 탭 숨김·제목 링크·접은 제목 한 줄·탭 글자 안 잘림) · tests/theme-screen.cjs — lane.html

## 2026-10-06 · claude · 진화 결투 — AI·정산·균형 보고, 교체 규칙과 선공 보정

- lib/lane.js — AI(숙련·에이스는 줄 수가 느는 수만, 가장 싼 카드부터 · 신참은 값이 오르는 수 아무거나 · 개방·옮기기는 줄을 뒤집을 때만 · 앞서는데 상대 패스면 패스, 줄을 못 늘리면 패스), 정산(통계·최고 줄 수·끝까지 키운 계통·금·보상 뒷장·상점 돌림). 균형 보고로 바꾼 규칙 둘 — **교체**(내 스택이 있는 줄에 놓으면 있던 스택은 묘지로; 없으면 뒤에 놓는 쪽이 늘 이겨 선공 승률 6~20%) · **선공 보정 FIRST_CARDS = 2 를 1라운드 몫으로**(2라운드 보충에서 후공이 같은 수를 받는다; 판 전체 +1·+2 는 75~92% 로 널뜀). 297판 보고: 선공 47~49%, 세대별 30~61%, 숙련 덱·숙련 AI 가 신참 66%·숙련 38%·에이스 11%
- docs/superpowers/specs/2026-10-06-lane-duel-design.md — §1-3 정한 값, §3 교체, §7 AI 를 구현대로(에이스의 1라운드 아끼기·1단계 안 놓기는 재 보니 약해져서 뺌)
- tests/lane-sim.cjs — 교체·AI 합법 수·결정성·난이도·패스 규칙·정산, 균형 보고(--quick 아니면 297판)

## 2026-10-06 · claude · 진화 결투 — 진화·옮기기·개방·폼

- lib/lane.js — 진화(다음 단계만, 분기는 to 어느 쪽이든, 스택에 쌓이고 힘·타입·속도가 그 카드 것으로, 키운 보너스 +2 · 경장 +4 누적, 끝까지 키운 계통은 grown 에), 옮기기(고기동만·라운드에 한 번·빈 줄로 가거나 자리 바꿈), 개방(한 판에 한 번·힘 두 배·그 라운드만), 중장은 받는 2·4배를 1배로, 고기동은 동점을 이긴다. 손이 비어도 옮기기·개방이 남으면 자동 패스가 아니다
- tests/lane-sim.cjs — 위 전부(리자몽 땅 면역·이브이 분기 포함)

## 2026-10-06 · claude · 진화 결투 — 판 진행과 승부

- lib/lane.js — 판(손 8·멀리건 2·동전 선공·선공은 FIRST_CARDS 장 더), 놓기(빈 줄에 폼을 골라)·패스·자동 패스, 줄의 승부(힘 × 상성 — 두 타입은 유리한 쪽으로 때리고 둘을 곱해 맞는다, 동점은 고기동 → 속도 → 먼저 놓인 쪽, 빈 자리는 상대가), 라운드(딴 줄이 많은 쪽, 같으면 둘 다 잃음, 묘지, 보충 3장, 진 쪽 선공), 목숨 둘·세 라운드
- tests/lane-sim.cjs — 위 전부, 손으로 짠 판(rig)

## 2026-10-06 · claude · 진화 결투 — 엔진 뼈대: 파생·덱 규칙·챔피언 덱

- lib/lane.js — 파생(힘 = 종족값 합/50 → 4~14, 타입 둘, 속도, 계통 to, 전설; lane.json overrides 가 힘을 덮는다), 덱 규칙 넷(25·주 세대 15·전설 4·같은 카드 1)과 안 가진·풀에 없는 카드, 자동 채우기, 챔피언 아홉(자기 세대 17 + 이웃 8 — 신참 무작위·숙련 계통 완성된 것부터·에이스 전설 4), 그림 문턱(championReady)
- tests/lane-sim.cjs — 위 전부

## 2026-10-06 · claude · 진화 결투 — 보상 뒷장·금·상점·통계 그릇

- lib/collection.js — 보상 뒷장 5장(앞 2장은 내 계통의 빈 단계, 난이도별 전설 비율 0/10/35%·종족값 가중, 그 세대 먼저, 풀 안에서만)·뒤집기·자동 마무리, 금(승 10/20/35·패 3), 상점(진열 6·값 15~30·전설 +20·희귀 자리 15%·돌림·새로 깔기 10금), 통계 그릇(bumpStats·statsView)
- tests/lane-sim.cjs — 위 전부

## 2026-10-06 · claude · 진화 결투 — 자료와 공용 컬렉션

- data/lane.json — overrides(비어 있음)·champions(세대 아홉, 이웃 세대)
- lib/collection.js — 두 결투가 같이 쓰는 컬렉션: 풀(폼 초상 셋이 있는 카드)·계통(from/to 앞뒤·분기)·프로필(시작 컬렉션 = 주 세대 비전설 17 계통 단위 + 다른 세대 8)·놀이별 덱 보관·옛 저장 올리기
- tests/lane-sim.cjs — 풀·계통·프로필 검사 · tests/forms.cjs — 상성표 18×18, from/to 가 서로 맞나, lane.json

## 2026-10-06 · claude · 진화 결투 — 구현 계획

- docs/superpowers/plans/2026-10-06-lane-duel.md — 과제 열둘(자료·공용 컬렉션 → 엔진: 파생·덱·챔피언 → 판 진행·승부 → 진화·옮기기·개방·폼 → AI·정산·균형 → 낱말·머리 일곱·껍데기 → 고르기·로비·덱 짜기 → 대결 화면 → 결과·보상·전적·상점 → 문서 → 허브 링크), 과제마다 실패하는 검사 먼저·코드·기록·커밋
- docs/superpowers/specs/2026-10-06-lane-duel-design.md — §2 보기를 규칙대로(두 타입은 유리한 쪽으로 때린다 — 이상해씨는 독으로 6)

## 2026-10-06 · claude · 진화 결투(줄 싸움) — 설계 문서

- docs/superpowers/specs/2026-10-06-lane-duel-design.md — 넷째 놀이의 설계. 세 줄 1 대 1, 힘 × 상성, 동점은 속도, 줄 위에서 진화. 바깥 틀(목숨·패스·보상 뒤집기·금·상점·전적)은 myth-atelier 의 신기 결투에서. 카드 풀은 폼 초상 셋이 등록된 카드만. 컬렉션은 뒤에 올 궨트식 결투와 같이 쓴다(lib/collection.js). 코드는 아직 없다 — 구현 계획은 승인 뒤에

## 2026-10-02 · claude · 생성기 간결화 — 기준 시트를 없애고 원작 특징은 의상으로

- lib/prompt-anthro.js · lib/prompt-spec.js — myth-atelier 꼴로 다시 썼다. 카드 프롬프트 763~920낱말 → 경장 322 · 중장 이어가기 244 · 개방 191 · 일상 197(꼬부기). 장착점·가림·FAIL·판 규율·참조 역할 문단은 지웠다 — 등딱지·꼬리를 몸에 단 물건으로 적고 "옮기지 마라" 를 쌓을수록 모델이 보여 주려고 옮겨서 구도가 망가졌다(사용자 보고). 원작 특징은 부위마다 "어떻게 입나"(WEAR_PARTS: 등딱지→어깨 망토, 꼬리→허리띠 자락, 귀→머리 장식 …)로 적고, 표에 없는 몸 부위는 색만 PALETTE 로. 개방은 그 폼 그림을 첨부해 같은 그림에서 판만 연다(기준 폼별 OPEN_LINES, 타입별 TYPE_ENERGY). 일상 화풍은 장갑 말이 없는 CASUAL_STYLE_CORES
- lib/prompt-ui.js · lib/words.js · prompt.html — 출력은 액션·일상 둘(옛 폼 초상 저장값은 액션으로). 확대컷 세 칸 편집을 지우고 "원작 특징 — 의상으로" 칸(자료·출처·라이선스·자동 입는 법·머리 특징 표현). 개방이면 인물 기준·장면 선택을 숨긴다. 모든 화면 words.js 캐시 lean1
- tools/sync-styles.cjs — 화풍마다 ACTION_STYLE_CORES·CASUAL_STYLE_CORES 가 있는지 본다(옛 STYLE_PROFILES 대신)
- tools/capture-appearance-example.cjs · docs/examples — 꼬부기 예시를 새 화면에서 다시 떴다. 제출문에 설계 기록을 덧붙이지 않는다
- tests/prompt-engine.cjs — 새 계약으로 다시 썼다: 옛 법조문이 돌아오면 실패, 이어가기·개방·일상에 외형·색·입는 법이 새면 실패, 1025종 몸 부위 소음 없음, 낱말 예산. 일부러 어긴 판 셋이 실패하는 것을 봤다
- tests/prompt-appearance · prompt-action · prompt-casual · styles · source-appearance · *-dom · prompt-screen — 폼 초상·확대컷·대괄호 머리말 대신 새 출력. prompt-appearance 상한 13000 → 5200자(외형 서른 개 다 고른 새 인물 4725자)
- IMAGE_RULES.md · docs/PROMPT_REWRITE.md · docs/SOURCE_APPEARANCE.md · AGENTS.md — 순서는 경장 ①(첨부 없음, 인물 기준) → 중장·고기동(① 첨부) → 개방(그 폼 그림 첨부) → 일상(① 첨부). 이미 시트로 만든 여섯 종은 경장 그림을 ①로 잇는다
- tests/dex-forms.cjs 는 이 변경 전에도 이 체크아웃에서 실패한다(카드 그림 대기 시간 초과) — 손대지 않았다

## 2026-10-02 · claude · 머리 — 테마·밀도·접기를 ⚙ 하나로
- lib/workspace-ui.js — 테마·화면 밀도 줄은 두 칸 폭이 들쭉날쭉하고 모든 화면에서 한 줄을 먹었다. 메뉴 줄 끝의 ⚙ 하나로 접고, 누르면 같은 폭 두 칸과 아랫줄 머리 접기가 펼쳐진다. 바깥을 누르거나 Esc 면 닫힌다(ui settings1)
- lib/workspace.css — 예전 테마 줄 규칙을 걷고 ⚙·펼침 패널 모양. 고르개는 브라우저 화살표가 제 자리를 쓰므로 오른쪽 여백을 줄였다(css settings2)
- lib/words.js — ui.settings · ui.header.fold.short. 머리 접기 설명에서 "테마" 를 뺐다(words settings1)
- *.html · lib/prompt-ui.js · lib/survey-ui.js — 위 세 파일의 버전 표시를 settings1 로
- tests/header-layout.cjs · theme-screen.cjs — 테마·접기를 누르기 전에 ⚙ 를 연다. 접어도 ⚙ 는 남는다
- tests/dex-filter-dom.cjs — 머리가 useRef 를 쓴다. 가짜 훅 목록에 더한다
- tests/browser-harness.cjs — ESM_DIR 없이 돌리면 esm.sh 하위 모듈까지 abort 되어 Preact 화면이 안 그려졌다. 주석대로 CDN 으로 내보낸다

## 2026-09-21 · claude · 뒷태 기본 구도는 되돌렸다

- lib/prompt-spec.js · lib/prompt-anthro.js — 등 장비 종에 넣었던 "돌아보는 3/4 후면" 기본 구도를 뺐다. 등딱지 위치는 맞았지만 액션 카드가
  전부 뒷모습이 되는 구조는 틀렸다(사용자 판단). 액션은 카메라를 향하고, 등 장비는 몸에 가려지면 가려진 채가 맞다는 OCCLUSION 규칙만 남긴다
- tests/prompt-engine.cjs — 뒷모습을 강제하는 문장이 없는지

## 2026-09-21 · claude · 등 장비 종의 액션 기본 구도를 돌아보는 3/4 후면으로

- lib/prompt-spec.js · lib/prompt-anthro.js — 말로 세 번 막아도 등딱지가 어깨로 갔다. 정면 + "장비도 보이게" 가 모순이라서다.
  등 장비 종은 사용자가 방향·자세·카메라·프레임을 안 정했을 때 "몸통을 120도 돌리고 어깨 너머로 카메라를 돌아보는 3/4 후면" 이 기본.
  장비가 제자리에서 보이니 옮길 이유가 없다. 방향을 직접 고르면 그게 이긴다
- tests/prompt-engine.cjs — 등 장비 종은 기본 구도가 있고, 방향을 고르면 빠지고, 등 장비 없는 종엔 없다. 예산 950 / 폭주 1000
- lib/prompt-spec.js — "돌아본다" 를 모델이 정지한 뒷모습으로 그려서, 카메라 선택일 뿐 동작은 유지하라고 고쳤다: 어깨 뒤 45도 약간 낮게, 달리거나 비트는 동작 한가운데, 효과 그대로

## 2026-09-21 · claude · 등딱지와 꼬리가 어깨·엉덩이 옆으로 옮겨 붙던 것

- lib/prompt-spec.js — 이어가기 액션 출력이 "머리·발·장착 장비를 보여라" 였다. 등 장비는 정면에서 안 보이니 모델이 옆으로 옮겼다.
  "머리와 발만 잘리지 않게, 등 장비는 몸 돌림·3/4·낮은 카메라로 드러내되 옮기지 않고, 가려지면 가려진 채" 로 바꿨다
- lib/prompt-spec.js · lib/prompt-anthro.js — 등 장비 종(등딱지·꼬리·등 유닛)에만 OCCLUSION 문단: 몸통·골반 뒤에 붙어 같이 돌고,
  어깨·옆구리·엉덩이·팔로 옮기지 않는다. 어깨 위 테두리와 엉덩이 옆 꼬리 끝이면 충분. FAIL 조건 두 줄
- tests/prompt-engine.cjs — 등 장비 종은 OCCLUSION 이 있고 없는 종은 없는지, 출력이 장비 노출을 요구하지 않는지.
  낱말 예산 800 → 900, 폭주 950 (사용자 허락)

## 2026-09-21 · claude · 중장 액션에서 몸이 커지고 판이 잘게 깨지던 것

- lib/prompt-spec.js — 중장 액션 정의를 "열두 부위에 층층이" 나열에서 판 수 세기로 바꿨다(흉갑·복대·골반판 하나, 한쪽에 어깨·상완·전완·허벅지·무릎·정강이·부츠 각 하나).
  몸 윤곽은 고관절·허벅지·허리·무릎에서 시트 그대로, 맨살을 덮는 판은 위에 띄운다. 대포·무기·새 부속 금지
- lib/prompt-spec.js · lib/prompt-anthro.js — 모든 폼 공통 PLATE DISCIPLINE: 부위마다 주판 하나 + 보조판 둘까지, 발광선 판당 하나, 피스톤·호스는 관절과 장비 뿌리에만,
  등딱지는 등 너비 그대로(백팩으로 줄이지 않기). STYLE CORE 는 판을 그리지 판을 더하지 않는다
- tests/prompt-engine.cjs — 네 폼 액션에 규율 문장, 중장에 몸 윤곽·판 수·무기 금지 문장이 있는지. 옛 부위 나열이 돌아오면 실패
- docs/PROMPT_REWRITE.md — heavy 항목에 판 수 세기 설명

## 2026-09-21 · claude · 기준 시트 확대컷을 세 칸으로, 머리 장비는 폼이 정한다

- lib/prompt-spec.js · lib/prompt-anthro.js — 오른쪽 확대컷 4칸(얼굴·A·B·C)을 3칸(얼굴·머리–어깨 설계 언어·후면 장착부)으로.
  이유: 확대컷은 첨부 시 250픽셀로 줄어 못 읽히고, 폼 그림은 전신 두 뷰만 따르므로 표면 특징 세 개를 확대할 값이 없었다.
  A/B/C 순위 매기기(FEATURE_INSET_TERMS)를 지우고, 자료는 후면 장착부 한 칸만, 뿌리 있는 부위(INSET_MOUNT_PARTS)일 때만 채운다
- lib/prompt-spec.js — 폼별 머리 장비(경장 센서·중장 얼굴 개방형 헬멧·고기동 센서 핀·폭주는 기존 패널만)와 공통 얼굴 보존 규칙(headCommon),
  이어가기 액션에 역할 문단(referenceActionRoles: 정면=비율, 후면·장착부=장비 위치, 머리–어깨=문법, 폼=외장만)
- lib/prompt-spec.js — 화면에도 프롬프트에도 안 실리던 "헤드 크레스트 표현"(건담 시절 armor 그룹)을 지우고
  HEAD_FEATURE_OPTIONS(없음·기계 부품·헤어 장식·악세사리·센서 핀·직접 입력)로 바꿔 시트 칸에 살렸다
- lib/prompt-ui.js · lib/words.js · prompt.html — 확대컷 세 칸 편집, 머리 특징 표현 선택, 옛 front/rear/function 저장값은 버린다
- tests/prompt-engine.cjs · tests/prompt-appearance-dom.cjs · tests/source-appearance.cjs · tests/source-appearance-dom.cjs — 세 칸·머리 규칙·역할 문단·장착부 오염 검사
- IMAGE_RULES.md · docs/PROMPT_REWRITE.md · docs/SOURCE_APPEARANCE.md · AGENTS.md — 규칙과 검사 목록
- tests/prompt-appearance.cjs — 시트 글자 상한 12000 → 13000. 세 칸 역할·머리 규칙으로 11965 → 12723자. 더 늘면 문장을 깎는다

## 2026-09-21 · gpt · 1025종 외형 특징과 기준 시트 확대컷을 자동으로 채운다

- data/source-appearance.json · data/source-appearance-corrections.json — 전국도감 1~1025종의 출처가 있는 외형 특징과 기본 폼 보정 자료
- lib/prompt-anthro.js · lib/prompt-spec.js — 입력이 비어 있으면 종별 특징과 얼굴 외 확대컷 세 곳을 자동 적용하고 이어가기에는 승인 디자인을 유지
- lib/prompt-ui.js · lib/words.js · prompt.html — 포켓몬 선택으로 외형 자료를 연결하고 수동 입력은 선택 보정으로 표시, 자료 로드 실패 안내와 캐시 갱신
- tools/fetch-appearance.py · tools/appearance-requirements.txt — 외형 설명 수집·추출과 재생성 도구
- tests/source-appearance.cjs · tests/source-appearance-dom.cjs · tests/appearance-extractor.py — 1025종·4100개 프롬프트, 실제 Preact 화면, 잘못된 자료와 외형 추출 검사
- tests/prompt-engine.cjs · tests/prompt-dom-harness.cjs — 새 확대컷 명칭과 자료 로드 실패를 기존 검사에 연결
- docs/SOURCE_APPEARANCE.md · docs/PROMPT_REWRITE.md · IMAGE_RULES.md — 자동 적용 범위, 출처·라이선스, 검수 한계와 생성 순서 기록
- tools/capture-appearance-example.cjs · docs/examples/squirtle-auto-settings.json · docs/examples/squirtle-auto-generator.txt · docs/examples/squirtle-auto-submitted.txt — 꼬부기 경장 예시의 실제 생성기 설정·출력과 이미지 호출용 설계 문구 보관; 완성 이미지가 아닌 입력 기록

## 2026-09-21 · gpt · 기준 시트 확대컷 네 칸을 직접 정한다

- lib/prompt-anthro.js · lib/prompt-spec.js — 모호한 확대컷 분류를 고정된 얼굴·전면·후면·기능 목록과 원본 특징 추천으로 교체
- lib/prompt-ui.js · lib/words.js · prompt.html — 기준 시트에서 네 칸을 카드별로 고치고 저장하는 화면과 캐시 갱신
- tests/prompt-engine.cjs · tests/prompt-appearance-dom.cjs — 순서·중복·모드 격리와 화면 저장·복원 검사
- docs/PROMPT_REWRITE.md · IMAGE_RULES.md — 실제 생성 순서와 결과 판정 기준을 새 네 칸에 맞춤

## 2026-09-21 · claude · 패치 기록을 남기기 시작한다

- docs/PATCH.md — 이 파일. 두 세션이 손으로 적는 자리
- lib/patch.js — 화면과 검사가 같이 쓰는 해석기
- index.html — 집 화면에 패치 기록 단추와 칸
- lib/words.js · lib/workspace.css — 단추와 칸의 말과 결
- AGENTS.md — "5. 고쳤으면 적는다" 규칙
- tests/patch.cjs · tests/patch-screen.cjs — 모양 검사와 화면 검사

## 2026-09-21 · gpt · 이어가기 액션 프롬프트를 줄였다

- lib/prompt-anthro.js — 이어가기+액션 경로에 짧은 갈래. 1600낱말 → 456, 금지 지시 32 → 0
- lib/prompt-spec.js — 짧은 갈래가 쓸 문장과 폼별 요약, 장비 종류별 마운트 힌트
- tests/prompt-engine.cjs · tests/prompt-action.cjs · tests/styles.cjs — 짧은 갈래 검사

## 2026-09-20 · claude · 폼 그림은 액션 출력으로 만든다

- lib/prompt-spec.js — 액션 프로필에 카드용 기본값(한 명·세로 전신·얼굴이 카메라·앞 가림 없음).
  폼 초상 카메라를 자유로 풀어 봤다가 뒷모습이 나와서 되돌렸다
- IMAGE_RULES.md · docs/PROMPT_REWRITE.md — 순서표 ①~⑥ 의 출력을 액션으로
- tests/prompt-action.cjs — 카드용 기본값이 빠지면 실패한다

## 2026-09-20 · gpt · 도감에 촘촘히 보기와 갈래 거르개

- dex.html · lib/words.js — 촘촘히 보기 토글을 브라우저에 기억
- 화풍·생성 갈래·그림 유무로 거르기

## 2026-09-18 · claude · 그림을 올리면 등록까지 자동으로

- .github/workflows/register-images.yml — 그림 저장소를 읽어 data/img.json 에 적고 되커밋.
  썸네일 워크플로가 보내는 repository_dispatch 로 깨어난다
- pkm-atelier-img/.github/workflows/thumbs.yml — 썸네일을 만들고 코드 저장소를 깨운다
- IMAGE_RULES.md — "올리면 자동이다" 절
