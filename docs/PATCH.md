# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "5. 고쳤으면 적는다" 에 있다.
집 화면(`index.html`)의 **패치 기록** 단추가 이 파일을 그대로 읽어 보여 준다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-09-21` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 화면이 읽지 않는다. `node tests/patch.cjs` 가 모양을 본다.

여기서부터 적기 시작했다. 그 전 것은 `git log` 에 있다.


## 2026-10-22 · gpt · 트리토돈·겟핸보숭 18장 등록과 경장 정본 고정
- data/face-design.json — 두 종의 경장 ①을 정본으로 표시하고 생성 기록의 머리 설계를 잠금. 동시 등록된 메깅은 등록 여부만 도감과 동기화하며 얼굴·머리는 그대로 보존.
- docs/CHARACTER_FACE_DESIGNS.md — 두 종의 정본 표시와 잠금 기록 경로를 도구로 다시 출력.
- 그림·생성 기록은 pkm-atelier-img-2의 c9142a1(트리토돈 9장)·57d7717(겟핸보숭 9장)에 반영. 폼 3·개방 3·일상 3이며, 트리토돈 일상 1은 막힌 란제리 대신 계획기로 예약한 오피스 테마 행사 장면.

## 2026-10-22 · claude · 일상컷 계획기 — 고르기는 도구가, 생김새는 Rust 가 잰다
- lib/casual-plan.js — 새 계획기. 장부(최근 예시·갈래 사용·필수 갈래 자리·비교 대상의 짝과 옷)를 읽어 세 컷의 갈래·예시·표정·포즈·방향·프레이밍·렌즈·세 축·옷 종류·드러내는 방식·장면 첫머리를 정한다. 같은 씨앗이면 같은 답, 배치 안에서는 앞사람의 새 값을 뺏지 않고, 피크닉에 도발 표정·한복에 달리기 같은 어긋난 짝은 표로 막는다. 세션이 손으로 고르던 것이 계속 같은 장면으로 몰렸다
- tools/casual-plan.cjs — 명령줄. 그림 저장소를 당겨 장부를 새로 읽고, `casual-ledger.py check` 를 통과할 때까지 다시 고르고, `--reserve --push` 로 세션 예약까지 올린다. `--refill`·`--avoid`·`--keep` 으로 빈 컷·막힌 컷만 다시 정하고, 컷마다 생성기 주소를 낸다
- tools/casual-ledger.py — 예약을 세션마다 따로 파일(records/casual-reservations/<세션>.json)에 둔다(한 장부에 같이 쓰다 push 가 엇갈려 남의 예약을 지웠다). 등록 차례를 img.json added_at → added → 폴더 날짜 → 온전한 git 이력으로 세고(얕은 clone 커밋 시각으로 차례가 뒤섞였다), `view` 명령을 더했다
- rust/ — casual-look: 일상컷을 윤곽(HOG)·밝기 배치·색으로 재어 `index`(data/casual-look.json, 몰림)·`check`(올리기 전 문턱, 다른 캐릭터와 점수 215 미만이면 막음)·`pairs`. 문턱은 실제 1123컷을 눈으로 맞췄다. art-core 는 book-atelier 에서 옮겨 왔다. rust/README.md
- data/casual-look.json — 첫 색인 1123컷. 가장 몰린 예시는 swimwear/shoreline_walk
- lib/prompt-ui.js · prompt.html · lib/words.js — 생성기가 `?mech=<카드>&casual=<값>` 을 받아 일상컷으로 열고 값을 채워 모두 잠그며, 장면·의상 칸은 비우고 주소에서 지운다(새로고침이 손본 값을 덮지 않게). 모르는 값은 비우고 알린다. ?v=plan1
- .github/workflows/register-images.yml — img.json 이 바뀌면 생김새 색인을 다시 짓는다(실패해도 등록은 막지 않는다)
- IMAGE_RULES.md — 일상컷 순서: 계획기로 정하고 생성기 주소로 열기, 올리기 전 casual-look check, 막히면 --avoid·--keep
- tests/casual-plan.cjs · tests/casual-plan-screen.cjs · tests/casual-ledger.py · AGENTS.md — 서른 명 차례로 check 통과, 배치·다시 채우기·피할 값·만든 컷 두기, 생성기 주소 왕복과 화면, 세션별 예약

## 2026-10-22 · claude · 도감 최근 추가 — 같은 날 안에서는 늦게 들어온 그림부터
- dex.html — "최근 추가" 띠가 같은 날 그림을 도감 번호 차례로 세워, 10-21(UTC) 하루에 44종 396장이 들어오자 24칸이 번호 낮은 고래왕 쪽으로만 차고 방금 올린 샤로다·미꾸리·깝질무는 밀려 안 보였다. 같은 날 안은 들어온 시각(added_at)이 늦은 것부터, 시각이 같거나 없으면 도감 번호 차례. img.js ?v=recent2
- lib/img.js — `added_at` 을 읽는 `addedAtOf`(날짜가 있는 파일만)
- tools/register-images.py — `added_at`({파일: "YYYY-MM-DDTHH:MM:SSZ"}, 최근 30일만): 새로 등록한 파일은 지금 시각, 시각이 없는 최근 파일은 온전한 이력에서 적힌 날짜와 하루 안의 커밋 시각(UTC)으로 메운다(워크플로가 자정 넘어 등록하면 하루 어긋난다). 30일이 지나면 걷는다
- data/img.json — 손으로 한 번 돌려 최근 그림 1296장(10-13~10-21, 모두 2번 저장소)의 시각을 이력에서 메웠다
- tests/register-images.py · tests/dex-recent.cjs — 시각: 새 파일·30일·하루 안 이력, 띠: 같은 날은 늦은 시각부터(번호로는 24칸 밖인 둘이 그날 맨 앞)

## 2026-10-22 · gpt · 샤로다 9장 정본 확정
- data/face-design.json — 최신 1025종 얼굴 설계를 보존하고 샤로다 경장 ①의 정본·머리 잠금만 반영했다.
- docs/CHARACTER_FACE_DESIGNS.md — 전체 설계와 샤로다의 정본 표시를 도구로 렌더했다.
- docs/image-batches/serperior-20261022.md — 9장 파일·참조·해시·제출 프롬프트·검수와 차단 후 재계획 기록을 남겼다.

## 2026-10-22 · gpt · 샤비 9장 생성 기록
- docs/image-batches/servine-20261022.md — 경장 정본·9장 이미지 커밋·참조와 검수 기록 위치를 남겼다. 동시 작업의 최신 얼굴 자료에서 샤비 정본·머리 잠금이 이미 반영된 것을 확인했다.

## 2026-10-22 · gpt · 체리꼬·깝질무 18장 정본 확정
- data/face-design.json — 체리꼬·깝질무의 경장 정본과 머리를 잠그고 자동 등록된 샤비의 등록 표시를 최신 자료와 맞췄다. 다른 세션의 전체 자료 복구와 솔록·미꾸리 정본 변경을 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 복구된 전체 1025종 자료에서 정본 표시와 머리 잠금을 렌더했다.
- docs/image-batches/cherrim-20261022.md · docs/image-batches/shellos-20261022.md — 캐릭터별 9장과 예약·그림 커밋·정본 해시·실제 검수·자동 등록 근거를 기록했다.


## 2026-10-22 · gpt · 미꾸리 9장 정본 확정
- data/face-design.json — 미꾸리 경장 ①을 정본으로 표시하고 머리 기록을 잠갔다. 솔록 반영 때 발생한 1 MiB 전송 생략은 전체 1025종을 복구하여 정확한 Git blob 해시 대조(2148ed4)로 해결했다.
- docs/CHARACTER_FACE_DESIGNS.md — 최신 다른 종의 설계를 보존하면서 정본 집계를 렌더했다. 전송 크기 제한으로 생략된 전체 문서를 복구하고 Git blob 해시로 일치를 확인했다.
- docs/IMAGE_BATCH_BARBOACH_20261022.md — 9장 생성·검수·이미지 커밋과 경장 해시를 기록했다.

## 2026-10-22 · gpt · 솔록 9장 정본 확정
- data/face-design.json — 솔록 경장 ①을 정본으로 표시하고 머리 기록을 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 최신 다른 종의 설계를 보존하면서 정본 집계를 렌더했다.
- docs/IMAGE_BATCH_SOLROCK_20261022.md — 9장 생성·검수·이미지 커밋과 경장 해시를 기록했다.

## 2026-10-22 · gpt · 파비코리·쟝고 18장 정본 확정
- data/face-design.json — 두 경장 ①을 정본으로 표시하고 머리 기록을 잠갔다. 검사 중 발견한 전송 생략 손상은 동시 작업의 최신 복구본에서 해결됐음을 확인했으며 루나톤·세비퍼를 포함한 다른 종의 최신 설계를 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 전체 1025종 자료와 두 경장의 정본 집계를 그대로 렌더했다.
- docs/image-batches/altaria-20261022.md · docs/image-batches/zangoose-20261022.md — 각각 9장, 예약·그림 커밋·정본 해시·실제 검수 기록을 남겼다.


## 2026-10-22 · gpt · 루나톤 이미지 9장 정본 확정
- data/face-design.json — 루나톤 경장 ①의 등록 표시와 머리 정본 잠금을 반영했다. 큰 파일 전송 뒤 원본·원격 blob 해시를 대조해 전체 내용을 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 루나톤 정본 표시와 집계를 렌더하고 전송 중 잘린 문서를 정상 원본으로 복구했다.
- docs/image-batches/lunatone-20261022.md — 이미지·예약·정본 해시·실제 검수·자동 등록을 기록했다.

## 2026-10-22 · gpt · 세비퍼 이미지 9장 정본 확정
- data/face-design.json — 세비퍼 경장 ①을 정본으로 표시하고 종별 머리를 잠갔다. 동시 등록된 파비코리는 등록 표시만 동기화하고 다른 종의 설계는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 집계를 같은 자료에서 렌더했다.
- docs/image-batches/seviper-20261022.md — 그림 커밋·예약·정본 해시·실제 검수와 자동 등록을 기록했다.

## 2026-10-22 · gpt · 주리비얀 경장 개방 보충으로 9장 완성
- docs/image-batches/snivy-20261022.md — 사용자가 제공·확정한 경장 개방의 원본·변환본·해시·커밋과 자동 등록을 기록하고 이전 보류 상태를 해소했다.

## 2026-10-22 · gpt · 체리버 이미지 9장 정본 확정
- data/face-design.json — 체리버 경장 ① 기록값으로 머리를 잠가 정본을 보존하고 동시 자동 등록된 주리비얀의 등록 여부 표시만 도감과 일치.
- docs/CHARACTER_FACE_DESIGNS.md — 체리버의 등록·머리 정본 표시를 렌더.
- docs/image-batches/cherubi-20261022.md — 이미지 커밋·생성·파일 복구·관찰 검수 기록.

## 2026-10-22 · gpt · 주리비얀 이미지 8장 등록·정본 기록
- data/face-design.json — 주리비얀 경장 ①을 정본으로 표시하고 생성기의 페더컷 설계를 잠갔다. 동시 자동 등록된 체리버는 등록 표시만 동기화하고 다른 종의 설계는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 집계를 도구로 갱신했다.
- docs/image-batches/snivy-20261022.md — 이미지·자동 등록·검수·정본 해시와 경장 개방 1장 필터 차단을 기록했다.

## 2026-10-22 · gpt · 플로젤 이미지 9장 정본 확정
- data/face-design.json — 플로젤 경장 ①의 기록값으로 머리를 잠가 후속 생성의 정본을 보존.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 자료의 정본·머리 잠금 표시를 렌더.
- docs/image-batches/floatzel-20261022.md — 이미지 커밋·참조·검수·차단 후 대체 장면 기록.

## 2026-10-22 · gpt · 비크티니 이미지 9장 등록·정본 기록
- data/face-design.json — 비크티니 경장 ①을 정본으로 표시하고 실제 생성기 머리 설계를 잠갔다. 다른 종의 설계는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 집계를 도구로 갱신했다.
- docs/image-batches/victini-20261022.md — 이미지·예약·자동 등록 커밋, 정본 해시와 검수 기록을 연결한다.

## 2026-10-22 · gpt · 파비코 이미지 9장 등록·정본 기록
- data/face-design.json — 파비코 경장 ①의 얼굴·짧은 페더컷을 잠갔다. 동시에 반영된 브이젤 작업의 정본 표시와 기존 설계는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 집계를 도구로 갱신했다.
- docs/image-batches/swablu-20261022.md — 이미지·장부·등록 커밋과 정본 해시·검수·커피 동작 보완을 기록했다.

## 2026-10-22 · gpt · 얼굴 설계 자료 전송 손상 복구 기록
- data/face-design.json — 이전 업로드 과정의 출력 길이 제한으로 손상된 파일을 정상본으로 복구했다. 분할 바이너리 전송 후 Git blob 해시 일치를 확인했다(a879034).
- docs/CHARACTER_FACE_DESIGNS.md — 같은 전송 제한에 잘린 문서를 정상본으로 복구하고 자료와의 일치 검사를 다시 통과시켰다.

## 2026-10-22 · gpt · 브이젤 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 브이젤 경장 ①의 얼굴·머리를 정본으로 표시한다.
- docs/image-batches/buizel-20261022.md — 9장과 예약·실제 제출·색상표 라벨 부분 수정·검수·등록 커밋을 연결한다.

## 2026-10-22 · gpt · 파치리스 이미지 9장 검수 기록
- docs/image-batches/pachirisu-20261022.md — 경장 정본·실제 제출·해시·예약·검수·도감 등록 커밋을 연결한다.

## 2026-10-22 · gpt · 밤선인 이미지 9장 등록·정본 기록
- data/face-design.json — 밤선인 경장 ①의 얼굴·머리를 정본으로 잠그고, 함께 자동 등록된 파치리스의 기존 경장 기록 상태도 동기화했다. 기존 얼굴 설계는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 실제 기록값을 도구로 다시 그렸다.
- docs/image-batches/cacturne-20261022.md — 이미지·장부·등록 커밋과 정본 해시·검수 근거를 남겼다.

## 2026-10-21 · gpt · 선인왕 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 선인왕 경장을 얼굴·머리 정본으로 표시하며 다른 종의 설계는 보존한다.
- docs/image-batches/cacnea-20261021.md — 이미지 9장·예약·실제 제출·부분 수정·검수 기록을 연결한다.

## 2026-10-21 · gpt · 플라이곤 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 플라이곤 경장을 얼굴·머리 정본으로 표시하며 다른 종의 설계는 보존한다.
- docs/image-batches/flygon-20261021.md — 이미지 9장과 복구·예약·실제 제출·검수 기록을 연결한다.

## 2026-10-21 · gpt · 비퀸 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 비퀸 경장을 얼굴·머리 정본으로 표시한다.
- docs/image-batches/vespiquen-20261021.md — 이미지 9장, 장부 예약과 제출·검수 기록을 연결한다.

## 2026-10-21 · gpt · 세꿀버리 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 세꿀버리 경장을 얼굴·머리 정본으로 표시한다.
- docs/image-batches/combee-20261021.md — 이미지 9장, 장부 예약과 제출·검수 기록을 연결한다.

## 2026-10-21 · gpt · 나메일 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 나메일 경장을 얼굴·머리 정본으로 표시한다.
- docs/image-batches/mothim-20261021.md — 이미지 9장, 장부 예약과 제출·검수 기록을 연결한다.

## 2026-10-21 · gpt · 도롱마담 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 도롱마담 경장을 얼굴·머리 정본으로 표시한다.
- docs/image-batches/wormadam-20261021.md — 이미지 9장, 장부 예약과 제출·검수 기록을 연결한다.
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 이미 등록된 비브라바의 누락된 정본 표시도 실제 생성 기록으로 맞춘다.

## 2026-10-21 · claude · 도감 즐겨찾기 — 지금 보이는 그림을 하트로 담고, 공방 모음에서 모아 본다
- lib/favorites.js — 공방 넷과 공방 모음(polos0117.github.io)이 같이 쓰는 즐겨찾기 모듈(판 v1). 원본은 공방 모음의 favorites.js, 글자 하나 다르지 않게 복사했다. 열쇠 atelier_favorites_v1(한 출처라 공방끼리 같은 목록), 약속은 그쪽 README 「즐겨찾기」절
- dex.html — 상세의 진열 줄 앞에 하트 「즐겨찾기」(aria-pressed) — 카드가 아니라 큰 그림에 떠 있는 그 그림(폼·연출·일상)을 담는다. 담은 수 「즐겨찾기 n」 은 /favorites.html 로, 담았다·뺐다·저장이 막혔다는 알림(aria-live). ?mech=&pic= 로 오면 그 그림의 화풍·폼·컷으로 열고, 목록 주소에서는 pic 을 지운다
- lib/words.js — dex.fav.* 낱말 여섯
- tests/dex-favorites.cjs — 새 검사: 하트·저장된 칸의 모양·그림마다 따로·새로고침·link 로 열기·저장 막힘·다섯 크기 44px·넘침·초점, 공방 모음 원본과 같은 파일인가 · AGENTS.md — 공용 모듈 한 줄과 검사 목록

## 2026-10-21 · claude · 도감 상세에 움직임 — 켄 번스·오버드라이브 열리기·타입 입자

- lib/scene-motion.js · lib/scene-motion.css — 공방 넷이 같이 쓰는 움직임 모듈(판 1)을 book-atelier 에서 글자 하나 바꾸지 않고 가져왔다. 고칠 때는 원본(book)에서 판을 올리고 다시 복사한다. 설명은 book-atelier docs/SCENE_MOTION.md
- dex.html — 큰 그림에 켄 번스. 같은 장갑의 폼 ↔ 그 오버드라이브는 열리기(오버드라이브로 갈 때만 그 종의 타입 입자가 터진다), 다른 폼·연출컷·일상컷으로 바꾸면 넘기기. 오버드라이브 그림에만 타입 입자가 옅게 떠돈다. 크게 보기는 켄 번스·입자 없음. 상세에 "움직임 켜기·끄기"(열쇠 atelier_motion_v1, 다른 공방과 같이), 동작 줄이기면 잠긴다
- lib/dex-filter.js — 타입 → 입자 표(`PARTICLES`·`particlesOf`). 첫 타입, 노말이 앞이고 둘째 타입이 있으면 둘째(노말·비행 → 안개)
- lib/words.js — `motion.*` 낱말 넷
- tests/scene-motion.cjs — 새 검사: 같은 파일·타입 표, 입자·켄 번스·열리기·넘기기·스위치 저장·동작 줄이기, 도감 상세, 다섯 크기 넘침·오류 없음 · AGENTS.md — 검사 목록에 한 줄
- 집 화면 캡슐의 "오버드라이브 보기" 는 그대로 — 캡슐마다 두 겹을 CSS 로 바꾸는 자리라 열리기를 얹으면 작은 손질이 아니다

## 2026-10-21 · gpt · 톱치 이미지 등록과 인물 정본
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 톱치 경장을 얼굴·머리 정본으로 표시한다.
- docs/image-batches/trapinch-20261021.md — 이미지 9장, 장부 예약과 제출·검수 기록을 연결한다.

## 2026-10-21 · claude · 테마를 공방마다 따로

- lib/workspace-theme.js — 다섯 공방이 한 주소(polos0117.github.io) 아래라 localStorage 를 같이 쓰는데, 건담·pkm·신화가 테마를 같은 열쇠 `atelier_theme_v1` 에 적어 한 공방에서 고르면 다른 공방 테마가 바뀌었다(건담은 이름이 달라 기본으로 되돌아갔다). 이 공방 열쇠 `pkm_theme_v1` 로. 처음 한 번만 옛 열쇠의 값이 이 공방 테마이면 옮겨 오고, 옛 열쇠는 지우지 않는다. 화면 밀도는 그대로 함께 쓴다
- tests/workspace-theme.cjs — 새 열쇠, 옛 값 한 번 옮기기, 다른 공방 이름은 안 옮김, 여기서 바꿔도 옛 열쇠는 그대로 · tests/home-screen.cjs — 심는 열쇠

## 2026-10-21 · gpt · 도롱충이 그림 정본 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 도롱충이 9장 등록에 맞춰 경장 ①을 정본으로 표시하고 실제 생성기 기록의 짧은 양갈래·가른 앞머리를 잠갔다.
- docs/image-batches/burmy-20261021.md — 그림 커밋·썸네일·도감 등록과 일상 2번 글자 부분 수정 및 원본 보관 위치를 기록했다.

## 2026-10-21 · gpt · 바리톱스 이미지와 얼굴 설계
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 바리톱스·도롱충이 얼굴 설계의 원작 해석 근거를 보완하고, 바리톱스 9장의 경장 인물 기준과 제출 기록을 연결한다.
- docs/image-batches/bastiodon-20261021.md — 이미지 9장과 썸네일·도감 등록 성공 및 생성 기록 위치를 남긴다.

## 2026-10-21 · claude · 말풍선 — 줄에 놓인 카드가 도감 글을 한마디
- lib/speech.js — 새 파일(원본은 지도 저장소 speech.js, 다섯 저장소에 같은 파일). 요소 위에 꼬리 달린 풍선 — 둘까지, 글 길이만큼, 움직임 줄이기면 애니메이션 없이. 화면 말 없음
- lane.html — 놓거나 진화한 카드(내 것도 상대 것도)가 card.json 의 도감 글(text)을 스택 위 풍선으로
- gwent.html — 놓인 카드가 도감 글을 그 자리 위 풍선으로
- tests/lane-screen.cjs · tests/gwent-screen.cjs — 놓은 뒤 풍선(앞 수의 풍선이 남아 있을 수 있어 글로 찾는다)

## 2026-10-21 · claude · 도감 최근 추가 띠·새 그림 표시 — img.json 에 들어온 날(added)
- tools/register-images.py — data/img.json 에 `added`({파일: "YYYY-MM-DD"})를 적는다. 이번 실행에 새로 등록한 파일은 오늘(UTC) 날짜, 적힌 날짜는 그대로, 날짜 없는 등록 파일은 그 그림 저장소의 git 이력에서 처음 더한 커밋 날짜(%cs, 이름 바꾸기도 더하기로)로 메운다. 얕은 받기(shallow)는 첫 커밋이 모든 파일을 "더한" 것으로 보여 날짜를 지어내므로 메우지 않는다 — 워크플로는 그림 저장소를 얕게 받으므로 CI 에서는 새 파일에 오늘 날짜만 붙는다(워크플로는 안 고쳤다). 날짜를 모르면 비운다. `--history <저장소>=<clone>` 으로 다른 자리의 온전한 clone 이력을 쓸 수 있다
- data/img.json — 한 번 메웠다: 등록 파일 3143장 모두 그림 저장소 두 곳의 전체 이력(blobless clone)에서 날짜를 얻었다(2026-09-17 ~ 10-21). note 에 added 모양을 적었다
- dex.html — 목록 맨 위 "최근 추가" 띠(UTC 최근 7일, 새것부터 24장, 같은 날은 도감 번호 차례, 누르면 그 카드를 그 그림으로 연다, 없으면 숨김). "새" 표시는 이 브라우저의 지난 방문 뒤 들어온 그림 — 대표 이미지 칸은 카드에 새 그림이 있으면, 컷을 고른 칸·상세의 폼/연출/일상 칸은 그 그림이면. 방문 기록(pkm_dex_seen_v1)은 시계가 아니라 자료로 적는다: 떠날 때(pagehide·화면 숨김) 가장 늦은 날과 그날 그림을 적고, 기준은 탭을 처음 연 때 sessionStorage 에 잡아 보는 동안 표시가 안 사라진다. 첫 방문은 표시 없음. "새 그림만" 은 필터 상자(5칸 고르개 격자)에 끼우면 줄이 하나 남아 목록 줄의 "작게 보기" 옆 눌림 단추로 두었다 — 새 그림이 있을 때만 보이고, 주소·저장에 안 남기며 초기화가 푼다
- lib/img.js — img.json 을 읽을 때 added 도 받아 둔다(setAdded · addedOf · addedAll)
- lib/gallery.css — 띠(제 안에서만 옆으로 구름, 초점 테두리가 안 잘리게 안쪽 여백)와 "새" 표시(테마마다 읽히게 글자색·바탕색을 뒤집음)
- lib/words.js — 최근 추가·새 표시·새 그림만 낱말
- tests/register-images.py — added: 새 파일은 오늘 · 적힌 날짜 유지 · 이력이 없으면 비움 · git 이력으로 메움(교체는 더하기가 아님) · --history · 얕은 받기는 안 믿음
- tests/dex-recent.cjs — 새 브라우저 검사: 날짜를 심은 img.json 과 지난 방문 기록으로 띠·새 표시·새 그림만·떠날 때 기록·첫 방문·빈 창 숨김·다섯 크기(옆 넘침·44px·초점)
- tests/dex-nav.cjs — 3번(큰 그림 넘기기)이 맨 위로 굴린 뒤 보이는 칸을 찾았는데, 띠가 휴대폰에서 첫 줄을 화면 밖으로 민다. 목록 첫 줄로 굴려서 찾는다(띠가 없는 주에도 같다)
- AGENTS.md — 검사 목록에 dex-recent 한 줄

## 2026-10-21 · claude · 오늘 기록 — 네 놀이가 끝나면 공방 지도가 읽는 칸에 적는다
- lib/today.js — 새 파일. 다섯 공방이 한 출처(polos0117.github.io)라 localStorage 를 같이 쓴다: 판이 끝나면 atelier_today_v1:pokemon 에 {d, n, w, daily, at, seen} 한 칸(bump), 다녀가면 seen(visit), 날짜 씨앗(seed), ?daily(isDaily). 모양의 약속은 지도 저장소 README 「오늘 기록」절, 다섯 저장소에 같은 파일
- lib/survey-ui.js · survey.html — 작전 시작은 이미 오늘 날짜가 씨앗이라 그대로 오늘의 판: 끝나는 수에서 한 칸(목표 30을 넘기면 승, 오늘 날짜 씨앗이면 daily), 지도에서 ?daily 로 왔고 진행 중인 작전이 없으면 바로 시작, 열면 다녀간 자국
- lane.html · gwent.html — 정산할 때 한 칸(이기면 승), 열면 다녀간 자국
- run.html — 런이 won/lost 로 넘어가는 수에서 한 칸(전환일 때만 — 새로고침으로 두 번 안 적힌다), 열면 다녀간 자국
- tests/survey-screen.cjs · run-screen.cjs · lane-screen.cjs · gwent-screen.cjs — 끝난 뒤 오늘 기록 칸(판 수·승·daily·다녀간 자국)

## 2026-10-21 · gpt · 방패톱스 그림 정본 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 방패톱스 9장 등록에 맞춰 경장 ①을 얼굴·머리 정본으로 표시하고 실제 제출한 짧은 일자 컷·일자 앞머리를 잠갔다.

## 2026-10-21 · gpt · 램펄드 그림 정본 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 램펄드 9장 등록에 맞춰 경장 ①을 얼굴·머리 정본으로 표시하고 실제 제출한 긴 울프컷·불규칙 앞머리를 잠갔다.

## 2026-10-21 · gpt · 얼루기 이미지 9장 정본 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 얼루기 경장 ①을 정본으로 표시하고 긴 땋은 머리 기록값을 잠갔다. 앞선 전송에서 잘린 큰 설계 파일 2개는 정상 원본으로 복구했으며 이후 업로드는 바이트 해시를 대조한다.
- docs/image-batches/spinda-20261021.md — 캐릭터별 이미지 커밋과 생성·검수 기록 및 장부 완료 반영을 남겼다.

## 2026-10-21 · gpt · 피그킹 이미지 9장 정본 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 경장 ①을 얼굴·머리 정본으로 표시하고 기록값으로 머리를 잠갔다.
- docs/image-batches/grumpig-20261021.md — 이미지 커밋과 실제 생성·검수 기록 위치를 남겼다.

## 2026-10-21 · gpt · 폭타 일상 1번 손 중복 수정
- pkm-atelier-img-2/img/폭타_glossy_promo_f_casual1.webp — 거울 앞에서 머리를 만지는 컷의 목덜미 옆에 추가된 손을 부분 수정하고, 같은 파일명으로 교체했다. 원래 장면·인물·의상은 유지했다.
- pkm-atelier-img-2/records/camerupt-20261021 — 수정 전후 해시·부분 수정 프롬프트·첨부 기준과 손 검수 결과를 기록했다.

## 2026-10-21 · gpt · 두개도스 경장 정본 등록
- data/face-design.json — 두개도스 경장 ①을 정본으로 표시하고 실제 제출한 울프컷 설계를 잠갔다. 돔·가시·부리를 사람 얼굴로 해석한 이유를 보충했다.
- docs/CHARACTER_FACE_DESIGNS.md — 얼굴·머리 정본 표시와 설계 이유를 자료에서 다시 렌더했다.
- docs/image-batches/cranidos-20261021.md — 9장 생성·검수·그림 커밋과 등록 기록을 남겼다.

## 2026-10-21 · gpt · 피그점프 9장 등록과 경장 정본 표시
- data/face-design.json — 피그점프 경장 ①을 정본으로 표시하고 실제 제출한 HAIR 설계를 잠갔다. 현재 도감과 등록 표시를 동기화했다: 피그점프.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 머리 기록을 자료에서 다시 그렸다.
- docs/image-batches/spoink-20261021.md — 9장 생성·검수와 이미지 저장소 커밋을 기록했다.

## 2026-10-21 · gpt · 로즈레이드 경장 정본 등록
- data/face-design.json — 로즈레이드 경장 ①을 정본으로 표시하고 실제 제출한 머리 설계를 잠갔다. 원작 곡선·가면·꽃잎을 사람 얼굴로 해석한 이유를 보충했다.
- docs/CHARACTER_FACE_DESIGNS.md — 얼굴·머리 정본 표시와 설계 이유를 자료에서 다시 렌더했다.
- docs/image-batches/roserade-20261021.md — 9장 생성·검수·그림 커밋과 자동 썸네일·도감 등록 성공을 기록했다.

## 2026-10-21 · gpt · 코터스 9장 등록과 경장 정본 표시
- data/face-design.json — 코터스 경장 ①을 정본으로 표시하고 실제 제출한 HAIR 설계를 잠갔다. 현재 도감과 등록 표시를 동기화했다: 코터스, 로즈레이드.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 머리 기록을 자료에서 다시 그렸다.
- docs/image-batches/torkoal-20261021.md — 9장 생성·검수와 이미지 저장소 커밋을 기록했다.

## 2026-10-21 · gpt · 폭타 9장 등록과 정본 표시
- data/face-design.json — 폭타 경장 ①을 정본으로 표시하고 실제 생성기의 머리 설계 기록으로 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 폭타의 정본 표시와 머리 기록을 자료에서 다시 그렸다.

## 2026-10-21 · gpt · 럭시오 경장 정본 등록
- data/face-design.json — 럭시오의 경장 ①을 정본으로 표시하고 실제 생성기 HAIR 설계에 따른 머리를 잠갔다. 기존 인물의 얼굴 설계는 유지했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시를 자료와 같은 표로 다시 렌더했다.

## 2026-10-21 · gpt · 꼬링크 경장 정본 등록
- data/face-design.json — 꼬링크의 경장 ①을 정본으로 표시하고 실제 생성기 HAIR 설계에 따른 머리를 잠갔다. 기존 인물의 얼굴 설계는 유지했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시를 자료와 같은 표로 다시 렌더했다. 기존 등록·기록 불일치만 동기화: 폭타, 럭시오.

## 2026-10-21 · gpt · 렌트라·꼬몽울 9컷 등록과 정본 머리 보존
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 렌트라·꼬몽울의 경장 ①을 정본으로 표시하고 제출한 HAIR 설정을 잠갔다. 같은 시점에 자동 등록된 둔타·꼬링크와 고래왕의 기록도 현재 등록부·경장 기록에 맞춰 반영했다.
- tools/face-design.py — HAIR 줄로 확정한 머리가 이미 잠긴 상태에서도 다시 build 할 때 유지되게 했다. 직접 고른 UI 값이 있으면 그 값이 우선하며, HAIR가 없는 옛 그림에는 설계를 새로 부여하지 않는다.
- tests/face-design-hair-lock.py — 최초 잠금·두 번째 build의 머리 보존·HAIR가 없는 옛 기록의 미지정 상태를 검사한다. 수정 전 조건에서 두 번째 build 검사가 실패함을 확인했다.


## 2026-10-21 · gpt · 둔타 9장 등록과 정본 표시
- data/face-design.json — 둔타 경장 ①을 정본으로 표시하고 실제 생성기의 머리 설계 기록으로 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 둔타의 정본 표시와 머리 기록을 자료에서 다시 그렸다.

## 2026-10-21 · claude · 종별 머리 설계 — 헤어스타일이 몇 가지로 몰리지 않게
- tools/face-design.py — 얼굴 설계에 머리(헤어스타일·길이·앞머리)를 더했다. 원작 단서 표(HAIR_CUES: 긴 귀·꼬리→트윈테일·땋은 머리, 볏·갈기→울프컷·하이 포니테일, 불꽃→윈드스웹트, 물·지느러미→웨이브, 잎·꽃→반묶음·크라운 브레이드, 둥근 몸→곱슬·스페이스 번, 에스퍼·페어리→히메컷·시뇽·드릴 컬, 돌·강철→블런트·비대칭·언더컷, 고스트·악→한쪽 눈을 덮는 앞머리)로 고르고 분포(한 가지 8%·보브 4%)·진화 계열 잇기·옆 번호 다름을 build 와 --check 가 지킨다. 남성 전용 값은 쓰지 않는다. 경장 ①이 등록된 종은 그림 저장소 기록(*-ui.json·제출 프롬프트, 읽기만)의 값으로 잠근다(hair_locked) — 기록에 머리가 없으면 표가 정하지 않는다.
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 1025종 머리 값·이유·단서·조정과 HAIR 줄, 머리 규칙과 분포 절.
- lib/prompt-spec.js · lib/prompt-anthro.js — HAIR_KEYS 와 `HAIR:` 줄. 새 인물(경장 ①)에만 FACE 바로 뒤에 싣고, 헤어스타일을 직접 고르면 줄 전체, 길이만 고르면 컷과 길이, 앞머리만 고르면 앞머리가 빠진다. 이어가기·개방·일상에는 없다.
- lib/prompt-ui.js · lib/words.js — 설계 칸에 머리 세 항목과 이유를 보이고, 무작위 변경이 설계된 머리를 건드리지 않게.
- tests/face-design.cjs · tests/prompt-engine.cjs · tests/prompt-screen.cjs — 머리 값·여성 값·길이 맞음·상한·계열 잇기·옆 번호·잠금=기록, HAIR 줄 유무(직접 고름·이어가기·일상), 문서=엔진, 예산 440.
- AGENTS.md · IMAGE_RULES.md · docs/PROMPT_REWRITE.md — 설계가 머리도 싣는다는 한 줄씩.

## 2026-10-21 · gpt · 고래왕 이미지 9장 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 긴 고래 체적·작은 눈을 해석한 얼굴과 경장 정본 표시를 기록.
- docs/image-batches/wailord-20261021.md — 9장 생성·검수, 카드 글자 부분 수정과 동일 설정 수영컷 재시도를 기록.

## 2026-10-21 · gpt · 고래왕자 이미지 9장 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 둥근 고래 체적·수염판 입을 해석한 얼굴과 경장 정본 표시를 기록.
- docs/image-batches/wailmer-20261021.md — 9장 생성·검수 기록과 이미지 저장소 커밋을 연결.

## 2026-10-20 · claude · 크게 보기 「원본 열기」를 「원본 크기」로

- dex.html — 크게 보기의 「원본 열기」는 그림 파일을 새 창으로 열었는데, 홈 화면 앱(허브 범위 `/`)에서는 같은 앱 창에 그림만 떠서 돌아올 길이 없었다. 새 창 대신 크게 보기 안에서 제 픽셀 크기로 펼쳐 손가락·휠로 미는 「원본 크기」 단추로(다시 누르면 「화면에 맞추기」, 넘기면 다시 맞춘다). 원본 크기에서는 넘기기 손짓을 끈다
- lib/words.js · lib/gallery.css — 단추 말, 원본 크기 칸(가로·세로로 굴림)
- tests/gallery-screen.cjs — 새 창이 안 열리고, 제 픽셀 크기로 펼치고, 다시 누르면 맞추는지

## 2026-10-20 · claude · 캡슐 둘레를 비웠다 — 머리말 상태줄, 층 안내, 늘 어두운 캡슐 벽

- lib/workspace-ui.js · lib/workspace.css — 머리말이 장식 넷을 겹쳐 입었다(「POKÉMON × MECHA / PKM / 001」 눈썹, 오른쪽 테마 이름·삼색 막대·8px 「CREATURE DESIGN LAB」, 제목 밑 삼색 막대). 문양 + 제목 + 부제만 남기고, 오른쪽에 실제 수치 한 줄 — 등록 종 수·그림 수(data/img.json)·이 테마 진열 n / 12·마지막 패치 날짜(docs/PATCH.md 앞 4KB) — 을 둔다. 못 읽은 값은 칸째 뺀다. 덮개(599px 이하)에서는 숨긴다. 눈썹이 빠진 만큼 넓은 화면 머리말 높이 136→112px
- lib/img.js — load() 가 한 화면 안에서 같은 주소를 한 번만 받는다(화면 몸통과 상태줄이 같이 부른다). 실패는 기억하지 않는다
- index.html · lib/workspace.css · lib/capsule.css — 캡슐 아래 링크 일곱이 같은 둥근 카드에 「A-01 / ARCHIVE」 같은 가짜 번호(차례가 아니다)와 분홍 원 ↗ 를 달고 있었다(HOME_CAPSULE_PLAN 5절에서 온 것). 만드는 곳(도감·프롬프트) 두 칸과 「시험장」 다섯 줄로 나눠 무게를 달리하고, 번호·화살표·그림자를 뺐다. 「발견하고 · 만들고 · 기록하기」 꼬리표도 지웠다
- lib/capsule.css — 캡슐 벽이 --bg 88% 섞임이라 밝은 테마에서 회색 안개처럼 보였다. 테마와 상관없이 흑연색(#16212a→#22323b)으로 고정하고 벽 위 글자·굴림막대도 벽에 맞췄다
- lib/words.js — lab.status.* · home.links · home.arena 를 더하고, 링크 제목의 「기록실 · 」 같은 앞머리를 뗐다. 안 쓰는 app.code · app.brand · workspace.signature · home.*.code · home.tag 를 지웠다
- *.html · lib/prompt-ui.js · lib/survey-ui.js — 꼬리표 ?v=status1
- tests/theme-screen.cjs — 테마 여덟에서 캡슐 벽이 어둡다, 상태줄 값이 자료와 같다, 장식 층이 없다. tests/home-screen.cjs — 칸 둘·줄 다섯, 가짜 번호·화살표 없음. tests/workspace-theme.cjs — 상태줄이 있고 장식 낱말이 없다

## 2026-10-20 · claude · 글꼴 — 한글 고딕 하나를 실제로 불러오고, 명조·자간 준 고정폭 한글을 걷었다

- *.html — 'Pretendard' 를 첫 글꼴로 적었지만 어디서도 불러오지 않아 OS 글꼴로 보였다. 화면 여덟 머리에서 Noto Sans KR(400–800, display=swap)을 Google Fonts 로 불러온다. preconnect 두 줄, 글꼴 css 는 media="print"→onload 로 첫 화면을 막지 않는다. 못 받으면(오프라인·검사) OS 고딕으로 그대로 선다
- lib/workspace.css — 글꼴 토막 --sans(Noto Sans KR 먼저)·--num(고정폭, 숫자에만). body 와 단추·입력칸이 --sans 를 쓴다. 불러오지 않는 Pretendard 는 뺐다. 장면 머리글 한글 자간도 뺐다
- lib/gallery.css · dex.html · lib/words.js — 책 저장소에서 가져온 명조(--gallery-serif, Noto Serif KR — 이것도 불러온 적 없음)를 걷고 목록 머리·카드 이름·상세 제목·확대 보기 제목을 고딕 굵기로. 목록 위 「ATELIER / ILLUSTRATED ARCHIVE」 눈썹과 gallery.kicker 낱말을 지웠다
- dex.html · lane.html · gwent.html · run.html · battle.html · lib/survey.css · lib/capsule.css · lib/workspace.css — 고정폭 글꼴에 자간을 준 한글 꼬리표(「주 세대를 고른다」·도감 칸 아랫줄·판 표시 등 90곳)를 고딕 + tabular-nums 로. 고정폭은 숫자만 남은 30곳(No.0004·종족값·힘·금·확대 쪽수·날짜)에만 --num 으로
- tests/workspace-theme.cjs — 화면마다 글꼴 링크(display=swap·preconnect·첫 화면 안 막음), --sans 가 Noto Sans KR 먼저, 명조 없음, --sans 칸에 자간 없음, 고정폭은 --num 으로만
- tests/dex-nav.cjs — 그리기 전 높이 어림의 허용을 0.1% 로. 글꼴이 바뀌어 이름이 두 줄로 접히는 칸 하나만큼(23px) 어긋났다

## 2026-10-20 · claude · 휴대폰 손맛 — 당겨서 새로고침, 도감 머리말 접기, 44px 단추, 본문 건너뛰기

- lib/workspace.css — 집·도감·스튜디오가 html 에 overflow:hidden·overscroll-behavior:none 을 모든 포인터에 걸어 휴대폰에서 당겨서 새로고침이 죽었다. 문서 잠금은 @media (pointer:fine) 안으로 옮기고, 휴대폰에서는 굴림 자리(.wrap·.collection-scroll)가 맨 위에서 더 당긴 몫을 문서로 넘긴다(overscroll-behavior-y:auto). 문서는 화면 높이 그대로라 구를 것이 없어 "굴러가는 자리는 하나" 는 그대로다
- lib/workspace.css · dex.html — 도감에서 굴리면 탭·도구만 숨고 머리말이 남아 390 화면 위쪽 244px 를 먹었다. 굴리면(.dex-fold.dex-scrolled) 머리말을 접기 단추와 같은 모양으로 줄인다 — 넓은 화면은 숨기고, 덮개는 문양 + 제목 한 줄(연구소 링크). 맨 위 근처로 오면 펼친다(24px/4px 사이를 두어 경계에서 깜빡이지 않게)
- lib/workspace.css — 덮개 항해 탭 폭을 글자만큼 먼저 주고 남는 것을 나눈다(flex-basis:auto). 똑같이 나누면 「폼결투」가 잘렸다. .figure-auto·.patch-close 도 44px
- lib/prompt.css — 장면 칸의 무작위·잠금(36px), 외형 잠금 .param-lock(32px), 그림 고르기 머리 단추(36px)를 44px 로. 잠금 자리만큼 이름 칸 오른쪽을 띄운다
- lib/workspace-ui.js · lib/words.js — 모든 화면이 링크 여덟·설정을 지나야 본문에 닿았다. 첫 Tab 에 보이는 「본문으로 건너뛰기」(머리 다음 자리로 초점을 옮긴다)와 항해 nav 의 aria-label(ui.skip · ui.nav)
- *.html · lib/prompt-ui.js · lib/survey-ui.js — 껍데기 파일 꼬리표를 ?v=shell1 로 맞췄다(workspace.css·workspace-ui.js·words.js·prompt.css)
- tests/header-layout.cjs — 포인터별 문서 잠금·문서는 안 구름·굴림 자리는 구름, 도감을 굴리면 머리말이 접히고 항해는 내려가지 않음·맨 위면 원래 자리, 본문 건너뛰기(첫 Tab·Enter 로 초점 이동). tests/prompt-screen.cjs — 단추 44px

## 2026-10-20 · claude · 도감 — 화면 밖 칸은 안 그리고, 보던 카드와 필터를 주소에

- dex.html — 목록 칸 1,025개를 한꺼번에 그렸다. `.grid>.cell` 에 content-visibility:auto 를 주고, 그리기 전 높이(contain-intrinsic-size)는 그림 칸·빈 칸을 하나씩 재어 --cell-h-art·--cell-h 로 준다(폭이 바뀌거나 글꼴이 늦게 오면 다시 잰다). 어림이 실제와 같아 굴림 높이·목록 자리 되돌리기가 그대로다. 344 화면에서 처음 그리는 칸이 10개
- dex.html — 상세를 열 때 쌓던 기록 칸에 주소가 없어 새로고침·공유하면 보던 카드가 사라졌다. 열면 `?mech=<이름>` 을 pushState 로, 카드를 넘기거나 진화로 건너가면 replaceState 로 바꾸고, 닫으면(뒤로 가기·목록으로) 목록 주소로 돌아간다. 목록에서 앞으로 가기면 그 카드를 다시 연다
- dex.html — 필터(검색·화풍·세대·타입·폼·컷)를 localStorage 에만 두었다. 기본값이 아닌 것을 주소에 replaceState 로 적고, 주소에 필터가 있으면 그것이 저장값보다 먼저다. 검색 칸에 name·autocomplete=off·enterkeyhint
- lib/words.js — dex.filter.search.hint(자리글, … 로 끝남)
- tests/dex-nav.cjs — content-visibility·화면 밖 칸 수·어림 높이=실제, 열기·넘기기·닫기·앞으로 가기의 ?mech=, 필터 주소·새로고침·주소만 받은 새 창

## 2026-10-20 · claude · 일곱 판 — 새 런은 한 번 묻고 지운다

- run.html — 머리줄 「새 런」이 저장된 진행 중인 런을 확인 없이 바로 지웠다(결투의 처음부터 화면·탐사의 sv-confirm 에는 있는 단계). 누르면 아래에 묻는 줄이 펼쳐지고 「이어서 한다」·「지우고 새 런」 중 하나를 고른다. 끝 화면의 「다시 — 새 씨앗으로」는 런이 끝났으니 그대로 바로 간다
- lib/words.js — run.new.confirm · run.new.cancel · run.new.go
- tests/run-screen.cjs — 묻기만 하면 런이 그대로(새로고침해도), 계속하면 그대로, 지우면 로스터가 비고 저장된다

## 2026-10-20 · claude · 화면 다듬기 스킬 둘

- .claude/skills/frontend-design/ — 화면을 새로 만들거나 손볼 때 흔한 기본값을 피하고 주제에 맞는 색·서체·배치를 정하게 하는 지침. anthropics/skills 의 것을 그대로(Apache 2.0, LICENSE.txt 같이)
- .claude/skills/web-design-guidelines/ — "UI 검토해 줘" 에 화면 코드를 Vercel Web Interface Guidelines(접근성·포커스·터치 자리·대비)로 검사. 쓸 때마다 지침 원문을 GitHub 에서 받는다. vercel-labs/agent-skills 의 것을 그대로

## 2026-10-20 · claude · find-skills 스킬

- .claude/skills/find-skills/SKILL.md — "이런 일 하는 스킬 있나" 를 물으면 공개 스킬 모음(skills.sh, `npx skills find`)에서 찾아 설치까지 돕는 스킬. vercel-labs/skills v1.7.4 의 것을 그대로(MIT)

## 2026-10-20 · gpt · 연구소 캡슐 진열과 도감 연결

- index.html — 진화 가족이 겹치지 않는 무작위 진열·사용자 진열 우선, 캡슐 열기·정보판·도감/프롬프트 연결, 미리 읽은 오버드라이브 이미지 전환을 추가했다.
- lib/capsule.css — 타입별 액체 빛·유리 반사·금속 명판과 CSS 연구소 벽을 만들고 여섯 화면 크기·낮은 가로 화면·움직임 줄이기를 처리했다.
- lib/img.js — 테마별 pkm_hall_v1 진열 저장(최대 12)과 기본 화풍·장갑 순서의 캡슐 이미지 선택을 공통 계층에 추가했다.
- dex.html — 연구소 진열/내리기 버튼과 개수, mech 주소 바로 열기를 추가하고 목록 복귀 이력을 유지했다. 카드 전환 직후 방향키가 빠지지 않도록 키 처리 등록 시점도 맞췄다.
- lib/words.js — 캡슐 안내와 진열 버튼 문구, 기존 일곱 링크의 연구소 구역 명판을 낱말 표로 관리한다.
- tests/home-screen.cjs — 여섯 크기의 캡슐 배치·이미지 실패·진열·열기·전환·가족 무작위·도감 연결을 검사한다. 이전 홈에서 캡슐 검사 실패를 확인했다.
- AGENTS.md — 홈 화면 검사 명령을 추가했다.
- docs/HOME_CAPSULE_PLAN.md — 완료 조건과 CSS 벽 선택을 기록했다.

## 2026-10-20 · claude · 집 화면 정비 캡슐 줄 계획서

- docs/HOME_CAPSULE_PLAN.md — 집 화면을 메카 포켓몬이 하나씩 든 유리 캡슐 줄로 바꾸는 작업 계획(gpt 가 맡는다). 진열(도감에서 고르기)·타입 색 빛·열면 정보판과 도감·프롬프트 문·오버드라이브 보기·연구소 구역판 이름표·가로/폴드 배치·검사, 배경 그림(선택)의 그림 프롬프트까지
- AGENTS.md — 먼저 읽을 것 표에 계획서

## 2026-10-20 · gpt · book-atelier의 감상 중심 갤러리를 도감에 적용

- dex.html — 세대 바로가기와 접힌 상세 필터, 타입·번호를 보이는 작품 목록, 큰 그림 옆 여섯 폼 비교, 원본 전체화면 감상·방향키·스와이프를 추가. 기존 진화·필터·목록 복귀를 유지
- lib/gallery.css — 테마 색상은 유지하고 2:3 이미지 자리 예약·contain, 데스크톱 펼침면·모바일 한 열, 갤러리 여백과 서체를 적용
- lib/gallery.js — 전체화면의 배경 inert·Tab 순환·Esc·닫은 뒤 포커스 복귀를 공통 처리
- lib/words.js — 갤러리 안내·감상 조작·이미지 실패 문구를 낱말 표로 관리
- tests/gallery-screen.cjs — 344·390·690·1440px에서 로딩 전후 배치·탐색·큰 이미지·키보드·복귀 검사. 원본 도감에서는 실패 확인
- tests/dex-forms.cjs — 카드 제목과 마지막 정보 영역의 새 배치를 기준으로 검색·스크롤 검사 유지

## 2026-10-20 · gpt · 꼴깍몬 일상 3번 왼팔 연결 교정
- pkm-atelier-img-2/img/꼴깍몬_glossy_promo_f_casual3.webp — 끊겨 보이던 왼팔을 화장대까지 자연스럽게 잇도록 재생성해 같은 이름으로 교체했다(그림 커밋 93264e5). 얼굴·의상·귀걸이 장면과 기존 도감 슬롯은 유지한다.
- pkm-atelier-img-2/records/gulpin-20261020 — 이전 검수의 팔 정상 판정을 정정하고, 바뀐 생성기 입력·프롬프트·해시와 양팔 확대 검수 결과를 기록했다.

## 2026-10-20 · gpt · 샤프니아·샤크니아 이미지와 경장 정본 등록
- data/face-design.json — 두 캐릭터의 등록 상태와 원작에서 얼굴로 옮긴 근거를 반영했다. 확정한 경장 ①을 후속 생성 정본으로 유지하며 얼굴 선택값은 바꾸지 않았다.
- docs/CHARACTER_FACE_DESIGNS.md — 도구로 두 캐릭터의 그림 있음 표시·얼굴 근거·등록 종 수를 다시 그렸다.
- data/img.json — 자동 등록 3f008b5·9c698bd가 각 폼 3장·개방 3장·일상 3장씩 등록했다. 그림과 실제 UI·프롬프트·검수 기록은 pkm-atelier-img-2의 962fe7b·e894f8f에 반영했다. 샤프니아의 침구 접기 컷을 예시 활동에 맞춰 다시 만들고, 샤크니아의 카메라 렌즈 각인 표식은 해당 컷만 부분 수정했다.

## 2026-10-20 · gpt · 귀뚤뚜기 경장 정본 표시
- data/face-design.json — 확정한 경장 ①을 후속 생성 정본으로 표시했다.
- docs/CHARACTER_FACE_DESIGNS.md — 도구로 정본 표시와 등록 종 수를 다시 그렸다.
- 그림 작업 — pkm-atelier-img-2의 115281d에 8컷과 검수 기록을 반영했다. casual3은 스케이트 가짜 라벨이 세 번 수정 후에도 남아 사용자 지정 한도에 따라 제외했다.

## 2026-10-20 · gpt · 귀뚤톡크 경장 정본 표시
- data/face-design.json — 확정한 경장 ①을 후속 생성 정본으로 표시했다. 길고 좁은 얼굴·눈·코끝·입술을 원작 단서로 해석한 이유를 보완했다. 비버니·비버통의 기존 자동 등록과 어긋났던 정본 표시 두 곳도 실제 등록 상태와 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 도구로 정본 표시와 등록 종 수를 다시 그렸다.
- 그림 작업 — pkm-atelier-img-2의 c1602b0에 9컷과 실제 UI·프롬프트·검수 기록을 반영했다.

## 2026-10-20 · gpt · 꼴깍몬·꿀꺽몬 이미지와 경장 정본 등록
- data/face-design.json — 두 캐릭터의 그림 있음 상태를 반영해 경장 ①을 후속 생성의 정본으로 유지하고, 꿀꺽몬의 작은 붉은 눈·둥근 체적과 계열 얼굴 차이를 해석한 근거를 보완했다. 얼굴 선택값은 유지한다.
- docs/CHARACTER_FACE_DESIGNS.md — 도구로 두 캐릭터의 등록 상태와 등록 종 수 및 꿀꺽몬 얼굴 근거를 갱신했다.
- data/img.json — 자동 등록 1650147이 각 폼 3장·개방 3장·일상 3장을 등록했다. 그림 커밋은 d3b8f42·22925c3이며, 아케이드 기기와 운동화의 가짜 글자는 해당 컷만 부분 수정했다.

## 2026-10-20 · gpt · 로젤리아 경장 정본과 이미지 등록 완료
- data/face-design.json — 로젤리아의 폼·개방·일상 9장 등록을 반영해 경장 ①을 정본으로 유지한다. 얼굴 선택값은 바꾸지 않았다.
- docs/CHARACTER_FACE_DESIGNS.md — 얼굴 설계 도구로 로젤리아의 그림 있음 상태와 등록 종 수를 갱신했다.
- data/img.json — 자동 등록 4abdb94가 로젤리아 9장을 등록했다. 그림 커밋은 d3301eb이며, 가면무도회 첫 결과의 여분 팔은 같은 설정으로 다시 생성해 검수했다.

## 2026-10-20 · gpt · 네오비트 경장 정본과 이미지 등록 완료
- data/face-design.json — 네오비트 9장 등록 상태를 반영하고 확정한 경장 ①을 후속 생성의 정본으로 유지한다.
- docs/CHARACTER_FACE_DESIGNS.md — 도구로 네오비트의 그림 있음 상태와 등록 종 수를 갱신했다.
- data/img.json — 자동 등록 f5871be가 폼 3장·개방 3장·일상 3장을 등록했다. 그림 커밋은 9943367이며 차단된 자수 코르셋 예시는 수영장 사롱 장면으로 새로 예약·생성했다.

## 2026-10-20 · gpt · 얼굴 자료 인코딩 복구와 로젤리아 근거 보완
- data/face-design.json — 최신 커밋의 중간 바이트 손상으로 생성기가 읽지 못하던 파일을 직전 정상 자료에서 복원하고, 마이농·볼비트의 최신 확정 정보는 보존했다. 로젤리아의 속눈썹·가시·꽃잎을 얼굴로 해석한 근거도 보완했다.
- docs/CHARACTER_FACE_DESIGNS.md — 복구된 1,025종 자료에서 설계표를 다시 생성했다.

## 2026-10-20 · gpt · 마이농·볼비트 이미지와 경장 정본 등록
- data/face-design.json — 마이농·볼비트의 그림 있음 상태를 반영해 확정한 경장 ①을 후속 생성의 정본으로 유지한다. 얼굴 선택값은 바꾸지 않았다.
- docs/CHARACTER_FACE_DESIGNS.md — 얼굴 설계 도구로 두 캐릭터의 등록 상태와 등록 종 수를 갱신했다.
- data/img.json — 자동 등록이 두 캐릭터의 폼 3장·개방 3장·일상 3장씩을 등록했다. 그림 커밋은 49f0e4c·20ee5ca이며, 볼비트 역할극 컷은 거절된 무대 예시 대신 행사 스태프로 다시 예약·생성했다.

## 2026-10-19 · gpt · 썬더볼트·플러시 경장 정본과 이미지 등록 완료
- data/face-design.json — 두 캐릭터의 등록 상태를 반영하고 썬더볼트의 갈기·방전 모티프 얼굴 해석 근거를 적었다. 기존 얼굴 선택값은 유지한다.
- docs/CHARACTER_FACE_DESIGNS.md — 경장 ①이 정본인 두 캐릭터의 상태와 근거를 자료에서 다시 그리고, 기존 문서의 생략 표기 구간도 원본 자료로 복원했다.
- data/img.json — 자동 등록이 썬더볼트·플러시의 폼 3장·개방 3장·일상 3장씩을 등록했다. 그림 커밋은 a2ea9fc·ff3ddfa이며, 플러시 관찰실 계측기의 가짜 라벨을 부분 수정했다.

## 2026-10-19 · gpt · 요가램·썬더라이 이미지와 경장 정본 등록
- data/face-design.json — 썬더라이의 번개형 무늬와 볏에서 각진 턱·수평 눈·곧은 눈썹의 근거를 보완하고, 최신 그림 등록 상태를 맞춰 확정 경장을 후속 생성의 정본으로 유지한다.
- docs/CHARACTER_FACE_DESIGNS.md — 도구로 얼굴 설계와 경장 정본 상태를 다시 그렸다.

## 2026-10-19 · gpt · 입치트 경장 정본 등록
- data/face-design.json — 경장·중장·고기동, 각 개방과 일상컷 3장 등록 뒤 입치트를 그림 있음으로 표시해 확정한 경장 ①을 정본으로 유지한다.
- docs/CHARACTER_FACE_DESIGNS.md — 생성 도구로 설계표의 입치트 정본 상태와 등록 종 수를 갱신했다.

## 2026-10-19 · gpt · 깜까미 경장 정본 등록
- data/face-design.json — 경장·중장·고기동, 각 개방과 일상컷 3장 등록 뒤 깜까미를 그림 있음으로 표시해 확정한 경장 ①이 후속 생성의 정본임을 맞췄다.
- docs/CHARACTER_FACE_DESIGNS.md — 생성 도구로 설계표의 깜까미 정본 상태와 등록 종 수를 갱신했다.

## 2026-10-19 · gpt · 에나비·델케티 얼굴 설계 보완
- data/face-design.json — 둥근 에나비의 가는 눈·둥근 코끝과 길게 흐르는 델케티의 타원 윤곽·직선 콧대를 구분하고 원작 근거를 기록했다. build가 검출한 플로젤 설계 겹침도 도구의 재배정 결과로 맞췄다.
- docs/CHARACTER_FACE_DESIGNS.md — 도구로 다시 생성해 실제 신규 경장 프롬프트와 같은 얼굴 설계를 표시했다. 도감 등록 후 두 캐릭터를 그림 있음으로 표시해 정본 우선 상태도 맞췄다.

## 2026-10-19 · gpt · 루리리·코코파스 얼굴 설계 보완
- data/face-design.json — 원형 물방울과 각진 화산암의 특징을 각각 사람 얼굴 구조로 해석하고 코코파스 초안의 근거를 보완했다.
- docs/CHARACTER_FACE_DESIGNS.md — 생성 도구로 설계표를 다시 만들어 신규 경장 프롬프트와 맞췄다.

## 2026-10-18 · claude · 손 엄지 방향 · 경찰·간호사 코스튬 · 고른 옷은 제 모습대로
- lib/prompt-spec.js — book-atelier 와 같다. 손 줄에 "엄지는 그 손의 안쪽, 뒤집힌 손 없이"(낱말 수는 그대로 — 앵커 400 안), 경찰·간호사 예시를 부품 + 한 손 동작으로(금지어뿐이라 코스튬이 안 읽혔다), WARDROBE 에 "고른 옷은 제 색·부품을 지키고 원작은 작은 장식 하나까지".

## 2026-10-18 · claude · 일상컷 예시 장면 문장 모두 채우기 · 고른 전통 의상이 이긴다
- lib/prompt-spec.js — EXAMPLE_DETAIL: 장면 문장(6번째 칸)이 없어 영어 이름만 실리던 예시 136개에 옷차림 + 한 가지 동작을, 전통 의상은 짜임·여밈·실루엣을 적었다(book-atelier 와 같은 문장, 에디토리얼은 포켓몬 말로). 전통 의상 갈래 풀이를 "예시에 적힌 전통이 계통 설정·첨부 그림의 옷을 이긴다, 자동만 계통을 따른다" 로 — book-atelier 에서 아오자이를 골랐는데 책의 지역 옷이 나왔다.
- lib/prompt-lifestyle.js — 예시에 장면 문장이 없으면 EXAMPLE_DETAIL 을 싣는다.
- tests/prompt-casual.cjs — 모든 예시에 장면 문장, 아오자이 프롬프트, 풀이에 책·건담 말이 없는지.

## 2026-10-17 · claude · 일상컷 옷 갈아입히기
- lib/prompt-spec.js · lib/prompt-anthro.js — 일상컷에 WARDROBE 줄: 옷을 통째로 바꾸고, 첨부 그림에서는 얼굴·머리·몸만(갑옷·옷·겹·허리띠·술·장신구·머리 장식·배경은 아니다), 장면 설정의 옷이 한눈에 읽히게. book-atelier 춘향전에서 간호사 코스튬을 골랐는데 첨부한 한복이 그대로 나왔다 — 같은 구조라 여기도 넣었다.
- tests/prompt-casual.cjs — 일상컷에 WARDROBE 줄이 장면 앞에 있는지.

## 2026-10-15 · claude · 일상컷 다시 만들기 줄이기·막혔을 때 다른 장면으로·빈 컷 다시 채우기
- IMAGE_RULES.md — 최근 4종(노공룡·폭음룡·찌르버드·찌르호크) 일상컷 12장 중 3장이 비었다: 이미지 도구 안전 필터에 두 번씩 막힌 2장(리조트 샤워장 수영복, 바닥에 앉은 란제리를 아래에서 본 각도)과, 배경 관객·측면 방향 불일치로 세 번 다시 만들다 넘어간 1장. 6단계를 "다시 만드는 것"(비율·글자·손·다른 인물·예시 활동 없음·노출을 덮음)과 "적기만 하는 것"(프레이밍·방향·자세·표정·옷 세부)으로 나눴다. 7단계를 더했다 — 막히면 말만 바꿔 다시 보내거나 고정값을 낮추지 않고, 같은 갈래의 다른 예시 → 다른 (필수) 갈래 순서로 다시 계획한다. 그래도 막히면 비우고 보고한다. 빈 컷 다시 채우기 절차(refill 예약)를 적었다.
- tools/casual-ledger.py · tests/casual-ledger.py — build 가 그림 저장소 img/ 에 그림이 있는 컷만 등록분으로 센다(막혀 빈 컷의 설정이 "쓴 예시" 로 들어가던 것), 그림 저장소 둘 중 하나라도 없으면 멈춘다(세션마다 받은 저장소가 달라 장부가 66칸↔87칸으로 바뀌었다). PLAN.json 의 "refill": true·"kept": true. check 는 새 컷만 겹침을 보고 차례 조건은 건너뛴다. build 는 등록된 캐릭터라도 다시 채우는 컷이 기록에 오를 때까지 예약을 남긴다.
- docs/PROMPT_REWRITE.md — 요약.

## 2026-10-15 · gpt · 찌르호크 경장 정본 표시
- data/face-design.json — 아홉 장 자동 등록을 확인한 찌르호크 경장 ①의 정본 표시와 원작 해석 근거.
- docs/CHARACTER_FACE_DESIGNS.md — 찌르호크 정본 표시를 자료에서 다시 그림.

## 2026-10-15 · gpt · 찌르버드 경장 정본 표시
- data/face-design.json — 찌르버드 경장 ①의 원작 해석 근거와 정본 표시.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시를 자료에서 다시 그림.

## 2026-10-15 · gpt · 폭음룡 경장 정본과 아홉 장 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 폭음룡의 긴 윤곽·좁은 눈·뚜렷한 코와 아래 입술을 원작에서 해석하고 등록된 경장 ①을 정본으로 표시.
- docs/image-batches/exploud-20261015.md — 그림·기록 커밋, 경장 해시와 아홉 장 검수·자동 등록 완료 기록.

## 2026-10-15 · gpt · 노공룡 경장 정본과 이미지 작업 기록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 노공룡 얼굴 설계와 등록된 경장 ① 정본 표시. 도구의 충돌 해소로 미등록 초안 히포포타스·불비달마·우라오스가 조정됐으며, 기존 그림은 보존했다.
- docs/image-batches/loudred-20261015.md — 그림·기록 커밋과 경장 해시, 8장 등록 및 안전 필터로 건너간 일상 3번 기록.

## 2026-10-15 · claude · 배경의 흐릿한 실루엣은 두 번째 인물로 보지 않는다
- IMAGE_RULES.md — 극장 객석에 그림자처럼 비친 사람까지 "한 명만" 위반으로 보고 다시 만드는 일이 잦았다. 생성기의 "한 명만" 은 주인공을 다투는 두 번째 인물을 막는 말이라고 적고, 얼굴·세부가 없는 배경 실루엣·그림자·작은 군중은 허용했다. 다시 만드는 것은 얼굴이 알아볼 만큼 보이는 사람, 크기·초점이 그녀와 비슷한 사람, 그녀 몸에 닿거나 겹친 사람, 같은 얼굴이 하나 더 나온 경우다. 일상컷 6단계와 "그 밖의 원칙"(모든 컷)에 넣었다. 생성기 프롬프트는 그대로 둔다 — 프롬프트는 엄하게, 검수는 이 기준으로.

## 2026-10-15 · claude · 일상컷 노출이 약해진 것 되돌리기 — 소매 조건을 노출 조건으로
- IMAGE_RULES.md — 규칙을 보강한 뒤 일상컷 의상 문구에서 몸을 덮는 옷(긴소매·재킷·코트·카디건·셔츠)이 12% → 45%, 드러내는 옷이 크게 줄었다(615컷 실측). 내가 넣은 소매 조건(민소매가 많으면 소매 있는 상의)과 "새 옷 종류" 조건이 겉옷 쪽으로 밀었고, 서식 조항을 빼면서 드러나는 부위를 적던 말도 사라졌다. 세부 강도 줄의 bold 만으로는 의상 칸의 긴소매·겉옷을 이기지 못한다. 소매 조건을 지우고 노출 조건을 넣었다: 평상복 컷도 드러나는 부위 둘 이상을 옷 구조로 쓰고 방식은 컷마다 바꾸며, 덮는 겉옷·긴소매는 세 장 중 한 장까지(열어 입거나 짧게). 생성 후 대조에 "적은 노출이 그림에서 덮이지 않았나" 를 더했다.
- tools/casual-ledger.py · tests/casual-ledger.py — 덮는 겉옷(coat·jacket·cardigan·sweater)이 두 장 이상이면 check 가 막는다.
- docs/PROMPT_REWRITE.md — 요약.

## 2026-10-15 · claude · 파트너 돌봄 갈래 살리기, 역할극 규칙을 생성기 정의에 맞춤
- lib/prompt-spec.js · lib/prompt-anthro.js — 파트너 돌봄 갈래는 "포켓몬 동료를 돌보는 장면" 인데 일상컷마다 "한 명만, 곁에 생물 없음" 줄이 같이 나가 프롬프트가 스스로 부딪쳤다. 이 갈래만 "그녀 한 명 + 동료 한 마리(따로 선 생물, 몸에 붙지 않음, 사람 아님)" 줄로 바꾼다. 다른 갈래는 그대로다.
- tests/prompt-casual.cjs — 파트너 돌봄만 동료를 허락하고 다른 갈래는 한 명만인지 본다.
- IMAGE_RULES.md — 파트너 돌봄을 덜 쓴 갈래 셈에서 빼던 조항을 지우고, 동료를 장소·상황 칸에 종 이름으로 한 마리 적고 결과에서 따로 섰는지 보게 했다. 앞 칸에서 "역할극은 행사장 말고 그 역할 장면으로" 라고 썼는데, 생성기 갈래 정의는 "무대·테마 행사용 의상이지 실제 직장 유니폼이 아니다" 여서 거꾸로였다 — 무대 의상은 지키되 무대 종류(백스테이지·리허설·스튜디오·피팅룸·퍼레이드 등)를 바꾸라고 고쳤다.
- tools/casual-ledger.py · tests/casual-ledger.py — 파트너 돌봄을 셈에 넣고, 역할극 무대 검사 대신 빈·조용한 장소 세 장 중 한 장까지를 본다.
- *.html — prompt-spec.js·prompt-anthro.js 캐시 표.

## 2026-10-15 · claude · 일상컷 장부·배치 계획 — 동시 세션이 같은 장면을 고르지 않게
- tools/casual-ledger.py — 일상컷 장부(pkm-atelier-img-2/records/casual-ledger.json)를 만든다. build 는 그림 저장소 기록에서 컷마다 선택값과 옷 종류를 읽고, report 는 계획에 쓸 요약을, check 는 배치 계획이 장부 조건(예시 10명·한 바퀴, 덜 쓴 갈래, 필수 갈래 자리·다섯 명에 두 장, (방향, 프레이밍) 짝·새 값, 옷 종류 새로, 세 축, 채우기 문구, 역할극 무대)을 지키는지, reserve 는 통과한 계획을 예약으로 적는다. 54종 162컷을 세어 보니 선택값은 고르게 퍼졌지만 같은 예시가 캐릭터마다 돌아왔고(레이싱 피트 7번, 포핀 7번 — 게을킹·초염몽은 29초 차이로 같은 장면), 필수 갈래는 54종 모두 한 장·48종이 1번 컷, 의상·장면 문장이 같은 틀이었다. 2~3개 세션이 동시에 돌며 서로의 계획을 못 본 것이 한 원인이다.
- tests/casual-ledger.py — 기록 읽기·옷 종류, 각 조건 위반, 배치 안 겹침, 예약 뒤 다른 세션 계획 걸림, 만료, 시간대가 다른 시각 정렬, 등록 뒤 done.
- IMAGE_RULES.md — 비교 대상을 장부로 바꾸고(구도·옷·세 축은 최근 3명, 예시·갈래는 최근 10명, 예약과 배치 포함) 0단계 "배치로 계획하고 장부에 예약한 뒤 생성" 을 더했다. 같은 예시 재사용 금지·한 바퀴, 덜 쓴 갈래, 필수 갈래 자리 돌리기·두 장, 옷 종류 새로, 채우기 문구·글자 금지 문구·장면 문장 틀 금지, 역할극은 그 역할의 장면으로, 모티프 장신구는 필요한 컷에만. 서식처럼 굳은 "목선·소매·기장·겹침 명시" 조항과 손으로 옮기던 비교표, 방향·프레이밍 묶음 조건(짝 조건이 대신한다)은 뺐다.
- docs/PROMPT_REWRITE.md · AGENTS.md — 요약과 검사 목록.

## 2026-10-15 · gpt · 갈모매 등록과 테일로·스왈로·갈모매 27장 최종 검수
- data/face-design.json — 세 캐릭터의 확정 경장을 정본으로 유지하고 도감에 등록된 상태를 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 전체 1,025종 설계표를 정본 자료에서 다시 그려 등록 표시를 맞췄다. 원격 메타데이터도 전체 바이트의 Git 해시로 확인했다.
- 그림 저장소 records/wingull-20261014 — 일반 폼·개방·일상 각 셋의 실제 생성기 선택과 제출 원문, 원작 근거, 손과 구도·일상 다양성 검수 및 해시를 보존했다. 배경 새 제거·기차역 벤치 자세와 기장·세탁기 라벨과 양손 보완도 기록했다.
- 그림 저장소 records/taillow-20261014 · records/swellow-20261014 — 전체 27장 원본의 원격 Git 해시·썸네일 존재·폼 6개와 일상 3개 슬롯 등록을 검증했다. 테일로 수정본 전송 문제는 원본과 같은 해시로 복구했고 썸네일 자동화 정상 완료를 확인했다.

## 2026-10-14 · gpt · 스왈로 9장 등록 완료
- data/face-design.json — 스왈로의 확정 경장 얼굴 구조를 유지하며 등록 상태를 도감과 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 생성기에 적용한 정본 자료에서 등록 표시를 다시 그렸다.
- 그림 저장소 records/swellow-20261014 — 일반 폼 셋·개방 셋·해변 산책·철물점·악기 연습의 실제 UI·제출 원문·손과 다양성 검수·해시를 기록했다. 철물점 자 숫자 제거와 선택한 얕은 V 목선 수정도 보존했다.

## 2026-10-14 · gpt · 테일로 9장 등록과 제비·갈매기 얼굴 설계
- data/face-design.json — 테일로·스왈로·갈모매의 원작 체적과 눈·부리·날개 단서로 성인 얼굴을 구분하고 테일로 경장 정본의 등록 상태를 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 생성기에 적용한 정본 자료에서 설계표를 다시 그렸다.
- 그림 저장소 records/taillow-20261014 — 경장·중장·고기동과 개방 셋·일상 셋의 UI 선택·제출 원문·해시·손과 다양성 검수를 기록했다. 헬멧 가짜 라벨 제거와 최근 조합 비교에 따른 창가 컷 재생성도 보존했다.

## 2026-10-14 · gpt · 도토링·잎새코·다탱구 27장 등록 완료
- data/face-design.json — 확정한 세 인물의 얼굴 설계를 유지하고 신규 등록 상태를 도감 등록부와 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 등록 표시를 정본 자료에서 다시 그려 생성기와 설계표를 맞췄다.
- 그림 저장소 records/seedot-20261014 · records/nuzleaf-20261014 · records/shiftry-20261014 — 각 9장의 실제 생성기 선택값·제출 원문·해시·손과 일상 다양성 검수 및 수정 기록을 보존했다.

## 2026-10-14 · gpt · 도토링 계열 얼굴 설계 보완
- data/face-design.json — 도토리 체적·잎과 가면·긴 코와 흰 갈기에서 도토링·잎새코·다탱구의 윤곽과 이목구비를 각각 설계하고 근거를 기록했다. build가 요구하는 기존 등록 표시도 현재 img.json과 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 생성기 정본 자료에서 설계표를 다시 그려 실제 FACE 문장과 맞췄다.

## 2026-10-13 · claude · 일상컷 생성 후 대조에서 프레이밍 제외
- IMAGE_RULES.md — 6단계의 "고른 프레이밍대로 끊겼는지" 대조가 재생성을 너무 많이 불러 뺐다. 프레이밍이 고른 값보다 조금 넓거나 좁아도 다시 만들지 않고, 실제로 담긴 범위만 qa.json 에 적는다. 생성 전 프레이밍 선택 조건(짝·묶음 겹침 금지, 새 값 한 장)과 방향·표정·예시 활동·의상·글자·손·인물 대조는 그대로다.
- docs/PROMPT_REWRITE.md — 요약에서 프레이밍 대조를 뺐다.

## 2026-10-13 · claude · 일상컷 장면 설정 순서 보강 — 구도·세 축·의상·사유·결과 대조
- IMAGE_RULES.md — 새 순서를 처음 적용한 무장조·델빌·헬가 9장을 검토한 결과로 보강했다. 절차(잠금·예시·자동 없음)는 지켰지만 다양성은 틀을 복사했다: 최근 6종 18컷이 방향 3종 × 프레이밍 3종만 돌려 썼고 무장조는 비교 대상 대포무노와 차례까지 같았다, 세 축은 세 종이 같은 배열(SOURCE 영향도 9/9 subtle), 직접 입력 사유는 9장이 같은 두 문장, 의상은 9장 중 8장이 민소매, 장면 칸이 예시의 주 활동을 바꾼 컷 2장, 고른 프레이밍과 결과가 다른 컷 3장을 "9/9 통과" 로 기록했다. 비교 대상의 정의를 두고, 2단계에 일상컷에 쓰지 않는 값(얼굴이 안 보이는 프레이밍·등진 방향)·비교표·(방향, 프레이밍) 짝 겹침 금지·방향·프레이밍 묶음 겹침 금지·방향이나 프레이밍 새 값 한 장 이상(화각만은 안 침)·랜덤 먼저·세 축을 장면에 맞춰 고르기(SOURCE 영향도 구성 겹침 금지), 3단계에 목선·소매·기장·겹침과 평상복 컷 소매 조건·제목만 있는 예시의 주 활동, 4단계에 예시 원문·컷별 사유와 세 축 이유·생성 전 비교표·수정 재생성 기록, 5단계에 해당 걸러내기, 6단계로 생성 후 선택값과 결과의 컷별 대조(그림에서 본 것을 근거로, 두 번 어긋나면 값을 바꿔 다시)를 더했다. 보강안은 독립 검토를 한 번 더 거쳐 조건끼리 막히는 곳(2:3 문장 사유, 예시 의상과 목선 기재, 얼굴이 빠지는 프레이밍)과 우회로(화각만 바꾸기, 컷 차례만 섞기)를 고쳤다. 기존 등록 이미지는 그대로 둔다.
- docs/PROMPT_REWRITE.md — 같은 기준을 요약해 더했다.

## 2026-10-13 · claude · 일상컷 장면 설정 — 생성기 선택지 우선, 화면 비율 2:3 고정
- IMAGE_RULES.md — gpt 의 "일상컷 직접 입력 허용" 칸(e3f7aaf)이 직접 입력을 넓게 허용해, 고정하라는 두 값만 고르고 나머지를 글로 채우던 방식이 그대로 통과했다(기록된 일상컷에서 장면 예시·세부 강도 나머지 세 축·랜덤 잠금 사용 0장). 3절 끝에 "일상컷 장면 설정 순서"를 두었다: 고정값 잠금 → 갈래 → 장면 예시(목록에서 고르고 기획은 거기서 출발, 예시 직접 입력은 객관적 이유가 있을 때 세 장 중 한 장까지) → 나머지 선택 항목 전부 구체 값(자동·auto_ 금지) → 맞는 선택지가 없는 것만 짧게 직접 입력. 직접 입력이 고른 값을 다시 쓰거나 뒤집는 것, camera·custom 에 생성기가 이미 넣는 말(인물 유지·장갑 제거·성인 체형)이나 세 장 공통 문구를 넣는 것을 막고, 기록 형식과 제출 전 미통과 조건을 정했다. 표정·자세·방향·프레이밍을 "직접 입력"으로 설정해도 된다던 완화는 되돌렸다(직접 입력 칸이 없다). 화면 비율 2:3 을 고정값에 더했다 — 생성기는 2:3 이면 비율 줄을 내지 않으므로 이미지 도구 크기로 지정하고 결과 크기를 확인한다. 새로 만드는 일상컷에만 적용하고 기존 등록 이미지는 다시 만들지 않는다.
- docs/PROMPT_REWRITE.md — 같은 기준으로 일상컷 단락을 맞췄다.

## 2026-10-13 · gpt · 대포무노·딜리버드·만타인 이미지 27장 등록 검수
- docs/image-batches/20261013-224-226.json — 캐릭터별 9장 생성·손과 개방 구도·최근 일상컷 비교, 원본 해시·정본·이미지 커밋·썸네일·도감 자동 등록 결과를 기록했다. 그림은 열린 둘째 저장소에 추가했고 기존 파일은 보존했다.

## 2026-10-13 · gpt · 일상컷 직접 입력 허용과 실제 결과 다양성 검수
- IMAGE_RULES.md — 기존 선택지와 생성기 내 직접 입력을 함께 활용하도록 명시했다. 실제 이미지에서 최근 컷과 장소·활동·의상 실루엣·자세·구도를 비교하고, 비슷한 조합으로 수렴한 컷은 다시 기획·생성·검수한다. 정본·화풍·두 고정 강도 값과 기존 등록 이미지를 보존한다.
- docs/PROMPT_REWRITE.md — 같은 기준을 현재 생성 규칙에 반영했다. 프롬프트나 설정값이 다른 것만으로 다양화 성공을 판단하지 않고 실제 입력·제출 원문·비교 결과를 기록한다.

## 2026-10-13 · claude · 그림 저장소 나누기 — 새 그림은 pkm-atelier-img-2, 옛 주소 그대로
- lib/img.js — 그림 주소를 저장소 목록(BASES)에서 고른다. img.json 의 where 에 적힌 파일만 다음 저장소로 가고 나머지(옛 그림 전부)는 첫 저장소 주소가 한 글자도 안 바뀐다. 첫 저장소의 Pages 사이트가 1 GB 를 넘었다(약 1.18 GB).
- lib/prompt-ui.js — img.json 을 직접 읽는 생성기 화면도 setShards 로 저장소 자리를 맞춘다.
- tools/register-images.py — 그림 저장소 여럿을 읽어 where 를 적는다. 새 이름은 열린 저장소(번호가 가장 큰 것)에만 받고, 닫힌 저장소의 새 이름·두 저장소의 같은 이름은 등록 전체를 멈춘다. 둘째부터의 저장소를 못 받으면 자리를 지키고 경고만, 그 저장소에 적힌 그림이 있으면 --prune 을 거부한다.
- tools/roster.py — 그림 크기 검사가 여러 자리를 보고, 자리 이름을 실제 경로로 잇는다(전에는 "img" 를 박아 두었다).
- .github/workflows/register-images.yml — 둘째 저장소를 img-2 로 받는다(아직 없거나 못 받아도 등록은 돈다). 검사에 img-shards·register-images 를 더했다.
- tests/img-shards.cjs — 옛 주소 2,099개가 그대로인지, where 만 옮기는지(썸네일·되돌림 포함), BASES·SHARDS·워크플로·.gitignore 차례가 같은지 본다.
- tests/register-images.py — 저장소 여럿: where 적기·다시 돌려도 같음·닫힌 저장소·교체·같은 이름·못 받은 저장소·--prune. 차례마다 자료를 새로 읽게 했다(실패한 차례의 고침이 다음으로 새지 않게).
- tests/browser-harness.cjs — 둘째 저장소 주소를 체크아웃의 img-2/ 로 돌린다.
- tests/battle-screen.cjs — "그림 없는 카드" 를 리자몽으로 박아 둬서 리자몽 그림이 등록되자 실패했다. 기본 여섯 가운데 그림이 없는 카드를 자료에서 고른다.
- .gitignore — img·img-2 를 링크로 이어도 올라가지 않게(끝 / 를 뺐다).
- *.html — img.js·prompt-ui.js 캐시 표를 shards1 로.
- IMAGE_RULES.md · AGENTS.md · README.md — 어느 저장소에 올리나(새 그림은 열린 저장소, 교체만 제자리), 새 그림 WebP 품질 85·method 6(옛 그림은 다시 인코딩하지 않는다), 다음 저장소 더하는 법.

## 2026-10-13 · gpt · 포챠나·그라에나·지그제구리 27장 등록과 얼굴 정본
- data/face-design.json — 3종의 글로시 프로모 경장 정본을 표시하고 최신 도감의 등록 상태와 동기화했다. 지그제구리의 부드러운 체적과 작은 눈 가면을 사람 얼굴 구조로 해석한 이유를 보완했으며 모든 기존 얼굴 선택값을 유지했다.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 자료에서 얼굴 설계 이유와 정본 안내를 다시 그렸다. 각 캐릭터의 일반 3폼·폼별 개방 3장·일상 3장, 실제 생성기 선택값·제출 프롬프트·교정 기록을 캐릭터별 이미지 커밋에 저장하고 자동 도감 등록을 확인했다.

## 2026-10-13 · gpt · 아차모 일상컷 3번 목 회전 교체
- pkm-atelier-img/img/아차모_glossy_promo_f_casual3.webp — 경장 정본을 참조해 얼굴·가슴·어깨가 같은 방향을 향하는 새 전망대 장면으로 교체했다. 기존 3번 등록 파일명을 유지하고 다른 여덟 장은 보존했다.

## 2026-10-13 · gpt · 물짱이·늪짱이·대짱이 27장 제작과 정본 표시
- data/face-design.json — 신규 3종의 글로시 프로모 경장 정본 등록 표시를 최신 도감과 동기화했다. 얼굴 구조와 선택값은 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 자료에서 정본 안내와 등록 수를 다시 그렸다. 각 종의 기본 3폼·폼별 개방 3장·일상 3장을 이미지 저장소에 캐릭터별 커밋으로 추가하고 자동 썸네일·도감 등록을 확인했다.

## 2026-10-13 · gpt · 아차모·영치코·번치코 글로시 프로모 27장 제작 완료
- data/face-design.json — 현재 도감과 정본 존재 표시를 맞췄다. 1,025종 얼굴 선택값을 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 자료에서 등록 표시를 다시 그렸다.
- data/img.json — 캐릭터별 경장·중장·고기동, 폼별 개방 3장, 일상컷 3장을 등록했다. 원격 원본·썸네일 각 27장을 검증하고 기존 이미지를 보존했다. 번치코 경장은 중단 전 해시로 복구해 이어 만들었다.

## 2026-10-13 · gpt · 마그카르고 9장 등록 완료

- data/img.json — 마그카르고의 경장·중장·고기동, 폼별 개방 3장, 일상 3장을 자동 등록으로 확인했다. 두 번째 일상 WebP는 기록된 원본 해시로 복구했다.
- data/face-design.json — 현재 도감과 정본 존재 표시를 동기화했다. 얼굴 설계와 선택값은 모두 유지했다.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 얼굴 자료에서 등록 상태와 정본 안내를 다시 그렸다.

## 2026-10-13 · gpt · 마그마그 9장 등록 완료

- data/img.json — 마그마그의 경장·중장·고기동, 폼별 개방 3장, 일상 3장을 자동 등록으로 확인했다. 기존 등록과 이미지를 보존했다.
- data/face-design.json — 현재 도감과 정본 존재 표시를 동기화했다. 얼굴 설계와 선택값은 모두 유지했다.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 얼굴 자료에서 등록 상태와 정본 안내를 다시 그렸다.

## 2026-10-13 · gpt · 헤라크로스 글로시 프로모 아홉 장 도감 등록
- data/img.json — 경장·중장·고기동과 폼별 개방, 일상컷 3장을 등록 도구로 추가했다. 기존 등록 항목을 보존했다.

## 2026-10-13 · gpt · 뮤츠·뮤 18장 등록과 얼굴 정본 표시
- data/img.json — 글로시 프로모 뮤의 경장·중장·고기동, 폼별 개방 3장, 일상 3장을 등록했다. 뮤츠 9장 자동 등록과 기존 자료를 보존했다.
- data/face-design.json — 현재 도감 등록 상태와 정본 표시를 동기화했다. 1,025종 얼굴 구조와 선택값은 유지했다.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 자료에서 설계표를 다시 그려 뮤츠·뮤의 경장 정본 안내를 맞췄다.

## 2026-10-13 · gpt · 투구푸스·프테라·잠만보 이미지와 도감 완료
- data/img.json — 세 캐릭터의 폼 3·폼별 개방 3·일상 3을 등록·확인했다. 원격 원본·썸네일 각 27장을 해시와 이미지 디코딩으로 검증하고 다른 등록을 보존했다.
- data/face-design.json — 최신 도감 등록에 맞춰 정본 존재 표시만 동기화했다. 1,025종의 얼굴 선택값은 모두 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 동일 자료에서 정본 표시와 등록 수를 다시 그렸다. 프테라의 중단 전 6장 원본을 복구해 이어 만들었고 빈 개방 WebP는 원래 해시로 복구했다.

## 2026-10-13 · gpt · 화석 캐릭터 도감 등록과 얼굴 기준 표시 동기화
- data/face-design.json — 암나이트·암스타·투구를 포함한 최근 이미지 등록 종의 registered 표시를 현재 도감과 동기화했다. 1,025종의 얼굴 구조·선택값은 바꾸지 않았다.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 자료에서 문서를 다시 그려 등록 수와 정본 안내를 맞췄다.

## 2026-10-12 · claude · 실패하던 검사 셋 — 그림이 늘어 낡은 가정, 장갑 줄의 skin 오탐

- tests/gwent-sim.cjs — "꼬부기는 일상컷 없음"·"1세대 챔피언은 잠김"을 박아 두었는데 그림이 올라와 둘 다 바뀌었다. 일상컷 있는/없는 카드를 img.json 에서 골라 보고, 챔피언 그림 문턱은 세대마다 진짜 풀의 수(자기 17·이웃 8)로 맞는지, 아직 잠긴 챔피언이 있는지로
- tests/lane-sim.cjs — "진짜 풀에선 1세대를 못 고른다"·"1세대 챔피언은 잠김"이 같은 이유로 깨졌다. 세대 고르기 문턱(17)·챔피언 문턱을 세대마다 수로 보고, 모자란 세대·챔피언이 있는지로
- lib/prompt-spec.js — 손 줄의 장갑 "full-finger and skin-tight" 가 피부색 명사 검사("…-skin")에 걸렸다(실제 피부색이 실린 게 아니다). 뜻이 같은 "close-fitting" 으로 바꿔 tests/source-appearance.cjs 의 검사는 그대로 둔다. prompt.html 꼬리표 ?v=face3

## 2026-10-12 · claude · 생성기 기본 화풍을 glossy_promo 로

- lib/prompt-spec.js — DEFAULT_STYLE 을 cinematic_semi_real → glossy_promo. IMAGE_RULES·얼굴 설계표는 기본을 글로시 프로모 키아트로 적는데 생성기는 처음 열면 세미리얼 시네마틱이었다. 저장된 화풍이 있는 카드는 그대로
- prompt.html — prompt-spec 꼬리표 ?v=face2
- tests/prompt-engine.cjs — 기본 화풍과 화풍을 안 고른 프롬프트가 글로시 프로모인지

## 2026-10-12 · claude · 종별 얼굴 설계 — 겹침 정리와 생성기 연결

- data/face-design.json (새), tools/face-design.py (새) — 옛 설계표를 생성기 얼굴 항목의 값으로 옮겨 자료로. 옛 표는 1025종에 서로 다른 얼굴 428개(한 문장을 64종이 같이 씀), 눈 간격은 1025종 한 값, 같은 계열 76곳이 똑같은 얼굴이었다. 원작 특징 문장·몸 형태·타입·키와 무게에 낱말 표로 점수를 주고(직접 쓴 614종은 그 선택에 가산점), 도감 차례로 겹침을 푼다: 같은 계열 다섯 묶음(윤곽·눈·눈썹·코·입) 중 셋 이상, 전체 어느 둘도 둘 이상 다름. 몸 전체의 결(둥근·뾰족·긴)은 몸통·머리 특징에서만 읽어 다리·코 문장이 얼굴형을 정하지 않게 했다(핑복이 "단단한 면"이던 것). 옮긴 항목은 종마다 "조정"에 적는다
- docs/CHARACTER_FACE_DESIGNS.md — 자료를 그린 표로 다시(1.6MB → 1.0MB). 상태 줄에 서로 다른 얼굴·위반 수를 싣고, 각 종의 FACE 줄은 생성기가 만드는 줄과 같다
- lib/prompt-spec.js — 얼굴 항목에 눈 간격·눈썹을 더하고(안내 포함) FACE_KEYS, PROMPT_LINES.face
- lib/prompt-anthro.js — faceItems/faceLine: 새 인물(경장 ①)에만 WEAR·HEAD 뒤 FACE 줄. 직접 고른 얼굴 항목은 빼서 IDENTITY 와 두 벌·반대 지시가 안 생긴다. 이어가기·개방·일상·끔·자료 없음이면 없다
- lib/prompt-ui.js, lib/prompt.css, lib/words.js — "원작 특징" 칸 아래 "종별 얼굴 설계": 끄기, 고른 값 열하나(직접 고른 항목은 그어 둠)·이유·원작 단서·조정. 무작위 변경은 켜 둔 동안 얼굴 항목을 건드리지 않는다. data/face-design.json 을 못 읽으면 칸 없이 돈다. 꼬리표 ?v=face1
- IMAGE_RULES.md, docs/PROMPT_REWRITE.md, AGENTS.md — "생성기에 자동 주입되지 않는다·문장을 손으로 덧붙인다"를 생성기 연결과 고치는 법으로 바꿈. 앵커 예산은 얼굴 줄 몫으로 440낱말
- tests/face-design.cjs (새) — 자료 규칙(값·같은 얼굴 없음·계열 셋·전체 둘·눈 간격 한 값 아님), 새 인물에만 FACE·직접 고른 항목 우선·다 고르면 없음, 1025종 문서 줄=엔진 줄·예산. 주입을 끄면 실패한다. tests/prompt-screen.cjs — 칸 열하나·끄고 켜기·무작위 변경·이어가기에 없음

## 2026-10-12 · gpt · 원작 기반 캐릭터별 얼굴 설계 규칙

- IMAGE_RULES.md — 신규 경장의 얼굴을 원작 특징에 맞춰 설계하고 같은 화풍 안에서 구조를 구분. 무작위 배정 금지, 성인 인물·사람 얼굴 유지, 비교 검수·체크포인트 기록, 기존 경장 ① 우선과 후속 인물 고정 규칙 추가
- docs/PROMPT_REWRITE.md — 현재 규칙에 얼굴 설계표와 신규 경장용 추가 지시 사용을 연결. 기본 화풍 glossy_promo 및 이어가기·개방·일상에 외형을 다시 싣지 않는 계약 유지
- docs/CHARACTER_FACE_DESIGNS.md — 1,025종 얼굴 설계 제안과 원작 근거·이유·신규 경장용 문장. 개별 작성과 단서별 해석 초안을 구분하고, 기존 이미지 관찰 기록이나 자동 생성기 적용 자료가 아님을 명시
- AGENTS.md — 이미지 작업 시 얼굴 설계표 확인과 정본 이미지 우선 원칙을 연결

## 2026-10-10 · gpt · 일상컷 장면과 캐릭터 간 구성 다양화

- IMAGE_RULES.md — 세 장의 갈래·장소·활동·의상 실루엣을 달리하고, 최근 일상컷 작업 캐릭터 3명과 이번 작업의 앞선 캐릭터를 비교해 유사 장면을 다시 기획. 필수 갈래·프레이밍·방향의 고정 반복을 막고 비교 근거·조명·화각을 기록하며 생성 후 실제 차이를 확인
- docs/PROMPT_REWRITE.md — 현재 규칙 요약에 캐릭터 간 반복 확인과 장면·의상·구도 다양화를 동기화

## 2026-10-08 · claude · 도감 — 목록 자리 되돌리기, 그림·카드 넘기기, 휴대폰 뒤로 가기

- dex.html — 상세를 열 때 목록이 굴러 있던 자리를 적어 두고 "목록으로"에서 그 자리로(넘겨서 다른 카드를 봤으면 그 칸이 보이게 한 번 더 민다). 전엔 목록이 새로 그려지며 첫 칸으로 튀었다
- dex.html — 큰 그림 넘기기: 좌우 화살표·방향키·밀기로 이 화풍의 폼 초상(일반 → 폭주) → 연출컷 → 일상컷 차례, 끝을 넘으면 앞 카드(마지막 그림)·다음 카드(첫 그림). 큰 그림 밑에 ‹ 앞 카드 · 몇 / 전체 · 다음 카드 › 줄. 차례는 지금 거른 목록에서 그림이 있는 카드만. myth 도감과 같은 손
- dex.html — 휴대폰 뒤로 가기: 상세를 열면 기록을 한 칸 쌓고 popstate 면 목록으로. "목록으로"도 그 칸을 내린다. 카드를 넘겨도 칸은 하나라 뒤로 한 번이면 목록이다. 전엔 앞 화면으로 나갔다
- lib/words.js — dex.card.prev · dex.card.next · dex.card.count · dex.shot.prev · dex.shot.next. 모든 화면 words.js 꼬리표 ?v=dexnav1
- tests/dex-nav.cjs (새) — 굴린 자리 되돌리기(단추·뒤로 가기), 방향키로 그림·카드 넘기기와 끝의 앞·다음 카드, 밀기, 카드 줄, 넘겨도 기록 한 칸. 옛 dex.html 에서는 실패한다. tests/dex-filter-dom.cjs — 화면이 useLayoutEffect 를 써서 들여오기 줄에 더함. AGENTS.md 검사 목록에 한 줄

## 2026-10-08 · gpt · 일상컷 표정 다양화 규칙

- IMAGE_RULES.md — 일상컷 3장의 표정도 각각 다른 값으로 실제 UI에서 선택하고, 기존 얼굴 구조와 인물 정체성을 유지한 채 장면에 맞게 다양화. 계획·분류표·체크포인트에 표정 선택값도 기록
- docs/PROMPT_REWRITE.md — 현재 일상컷 규칙 요약에 표정 다양화를 동기화

## 2026-10-08 · claude · 결투 — 로비에 처음부터(저장 지우고 주 세대 다시 고르기)

- lane.html, gwent.html — 로비 도구 줄에 "처음부터". 한 번 더 묻는 칸(취소·지우기)을 거쳐 같이 쓰는 저장 pkm_duel_v1 을 지우고 고르기 화면으로. 컬렉션은 주 세대를 고를 때의 풀로 나뉘어, 그림이 늘기 전에 만든 프로필에는 새로 그린 카드가 안 들어왔다
- lib/words.js — lane.reset · lane.reset.go · lane.reset.note. 모든 화면 words.js 꼬리표 ?v=reset1
- tests/lane-screen.cjs, tests/gwent-screen.cjs — 처음부터: 취소면 그대로, 지우면 저장이 비고 고르기로, 다시 고르면 컬렉션 25·금 0·전적 0

## 2026-10-08 · gpt · 일상컷 3장 구성과 고정 강도 규칙

- IMAGE_RULES.md — 일상컷을 단독 3장으로 변경. 성인 역할극·수영복·란제리풍 패션 중 최소 한 장 포함, 이미지마다 자세·방향·프레이밍 다양화, 전체 강도 가장 강함·피부 노출 많이를 실제 UI에서 고정 선택하고 제출 프롬프트 확인
- AGENTS.md — 일상컷 기본 수량 안내를 3장으로 동기화
- docs/PROMPT_REWRITE.md — 현재 규칙의 일상컷 순서와 갈래·구도·강도 요약을 새 작업 규칙에 맞춤

## 2026-10-07 · gpt · 이미지 생성 기준 화풍을 글로시 프로모 키아트로

- IMAGE_RULES.md — 사용자 요청에 따라 새 캐릭터의 화풍 미지정 시 glossy_promo 를 실제 생성기 UI에서 선택하도록 명시. 명시적 화풍 요청과 기존 확정 캐릭터의 화풍은 보존

## 2026-10-06 · claude · 생성기 — 손 줄은 해부만, 고른 손 동작과 이어가기 손복장을 덮어쓰지 않게

- lib/prompt-spec.js — HANDS 를 손가락 수·분리만으로 줄였다. 손 자세 기본값(주먹·편 손바닥·카메라로 내민 손 금지)은 handsDefault 로 따로, 이어가기용 handsWear(첨부 그림의 장갑·맨손 그대로) 추가. 69b8b95 는 일상 끝에 "loose fist, open palm" 을 늘 붙여 컵 들기·사진 찍기·손 흔들기 같은 고른 자세와 부딪혔고, 이어가기에 "never fingerless" 장갑을 늘 붙여 맨손 인물에 장갑을 씌울 수 있었다
- lib/prompt-anthro.js — 액션: 고른 장면·자세가 없을 때만 handsDefault, 장갑 규칙은 새 인물만, 이어가기는 handsWear. 일상은 HANDS 만. 개방은 그대로
- prompt.html — prompt-spec·prompt-anthro 꼬리표 ?v=hands2
- tests/prompt-engine.cjs — 회귀 검사: HANDS 에 자세 말이 없고, 컵 들기·사진 찍기·손 흔들기·책 읽기·머리 정리·물건 들기 자세가 일상·액션에서 손 줄에 덮이지 않으며, 이어가기에 장갑 규칙이 붙지 않는다

## 2026-10-06 · claude · 생성기 — 손가락이 늘고 뭉치지 않게 손 줄, 개방에서 손·눈 색 고정

- lib/prompt-spec.js — ANATOMY 의 "both hands drawn correctly as hands" 한 줄을 HANDS 로 뺐다: 엄지 하나 손가락 넷·떨어져 있고 붙거나 겹치지 않음, 주먹·편 손바닥·어딘가에 얹은 손, 카메라로 내민 손·벌린 손가락 금지. 액션은 손가락 있는 밀착 장갑(손가락 없는 장갑 금지)·효과가 손가락에 감기지 않음을 더한다. 꼬부기·어니부기 그림에서 망가진 손이 다 내민 손·손가락 없는 장갑·손에 감긴 물줄기였다
- lib/prompt-spec.js — 개방의 "her hands and expression tighten" 을 지웠다(손을 움직이라는 말이라 고정한 손이 다시 그려졌다). "her eyes catch that light" 는 "눈 색은 그대로, 빛만 맺힘" 으로 — 개방 한 장씩 눈 색이 바뀌었다. 개방에는 HANDS(첨부 그림의 손 그대로)를 붙인다
- lib/prompt-anthro.js — 액션·이어가기 끝에 HANDS+장갑, 일상에 HANDS, 개방에 손 고정 줄
- prompt.html — prompt-spec·prompt-anthro 꼬리표 ?v=hands1
- tests/prompt-engine.cjs — 손 줄·장갑·개방 손 고정·눈 색 검사, 낱말 예산을 앵커 400·이어가기 310·개방 240·일상 360 으로(손 줄 몫)

## 2026-10-06 · claude · 폼 결투 — 리뷰 뒤 손질: 날씨 줄 타격, 두 화면의 저장 되읽기, 꼬리표

- lib/gwent.js — 상성 타격이 날씨 줄의 카드를 고르지 않는다(어차피 1로 세니 합이 안 바뀌고 맑은 줄의 표적을 놓쳤다)
- gwent.html, lane.html — 같은 저장을 두 화면·여러 탭이 쓰므로 storage 사건과 뒤로 가기(pageshow persisted)에 다시 읽는다 — 옛 프로필을 쥔 채 저장하면 그쪽 보상을 지웠다. collection.js 꼬리표를 ?v=gwent1 로(통계 그릇이 바뀌었다)
- gwent.html — 날씨 줄에 놓을 때 힘 미리보기가 1(엔진 합산과 같이)
- tests/gwent-sim.cjs, tests/gwent-screen.cjs, tests/lane-screen.cjs — 그 검사
- docs/GWENT_GAME.md — 타격 규칙에 날씨 줄 제외를 적음

## 2026-10-06 · claude · 폼 결투 — 규칙 문서, 검사 목록, README

- docs/GWENT_GAME.md — 플레이어가 읽는 규칙과 자료·저장·검사·굴려 본 숫자
- AGENTS.md, README.md, docs/GAME_CONCEPT.md — 가리킴과 검사 목록
- docs/superpowers/specs/2026-10-06-gwent-duel-design.md — 에이스 AI 와 선공 보정을 구현 결과대로(영웅만 아낀다, FIRST_BONUS 12, 맞대결은 결정 + 덱)

## 2026-10-06 · claude · 폼 결투 — 대결 판

- gwent.html — 상대 세 줄 ↑ 막대 ↓ 내 세 줄. 손패 카드를 고르면 세 줄에 그 줄의 힘(날씨판은 날씨 이름)이 떠서 줄을 짚는다. 개방은 카드마다 표적. 타격·결속·개방·날씨 표시와 연출. 옛 프로필의 빈 폼 결투 덱은 걸러 내기와 같은 번에 채운다(따로 하면 옛 프로필이 덮어썼다)
- tests/gwent-screen.cjs — 대결·결과·전적·상점·새로고침·옛 저장(decks.gwent 없는 프로필·풀 밖 날씨판)

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



