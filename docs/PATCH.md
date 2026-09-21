# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "5. 고쳤으면 적는다" 에 있다.
집 화면(`index.html`)의 **패치 기록** 단추가 이 파일을 그대로 읽어 보여 준다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-09-21` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 화면이 읽지 않는다. `node tests/patch.cjs` 가 모양을 본다.

여기서부터 적기 시작했다. 그 전 것은 `git log` 에 있다.

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
