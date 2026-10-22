# 이미지 작업 이어가기 — 하루 최대 2종

사용자 승인: AI가 첫 경장부터 검수하고 미완성 캐릭터를 번호순으로 최대 2종씩 순차 처리한다. 이미지·도감·자동화 코드·상태의 일반 main push만 사용한다. 강제 push, 기존 이미지 교체/삭제, 과거 UI 기록 추정, 조건 완화는 금지다. 일정 생성은 별도 부모 작업이 맡으며 이 도구는 cron을 만들지 않는다.

## 다음 실행의 짧은 지침

먼저 AGENTS.md와 IMAGE_RULES.md를 읽고 세 저장소를 최신 main으로 받는다. 기존 로컬 변경을 reset하지 않는다. Python 3 + Pillow, Node, Playwright/Chromium이 필요하다. 코드·이미지 저장소 둘을 나란히 둔다. casual-plan은 실제 img/와 records를 읽으므로 기록만 받은 sparse checkout으로 생성 계획을 확정하지 않는다.

```sh
python3 tools/image-runner.py status
python3 tools/image-runner.py restore --dir /workspace/pkm-recovery
python3 tools/image-runner.py prepare --owner pkm-daily
python3 tools/image-runner.py next
```

`restore`는 원격 체크포인트가 가리키는 원본·원문·UI·QA를 읽어 SHA256을 확인한다. 같은 경로의 다른 파일은 덮어쓰지 않는다. 복구가 실패하면 생성하지 말고 보고한다. 릴링 경장은 이미 생성된 파일을 쓰며 다시 만들지 않는다. `prepare`는 새 run을 만들거나 같은 owner의 미완료 run을 재개한다. `next`가 `review`면 보존된 결과를 검수하고, `in_flight`면 먼저 도구 결과/파일을 찾아 `record`한다. `in_flight`는 재생성 허가가 아니다. `blocked`면 원인을 해결하기 전에는 진행하지 않는다.

## 실행 단위와 잠금

정본 상태는 `pkm-atelier-img-2/records/automation/state.json` 하나다. UTC 날짜별 최대 2종을 원격 상태로 계산하며 다음 날짜에 미완료 run을 재개할 때도 미완료 캐릭터를 그날 상한에 포함한다. 실행 하나의 큐는 최대 2종이고 앞 캐릭터의 이미지·썸네일·도감 등록 확인 전에는 뒤 캐릭터에 들어갈 수 없다. 당일 더 이상 여유가 없으면 멈춘다.

claims는 캐릭터 전체에 대한 owner/run 잠금이다. 시간 경과만으로 만료/탈취하지 않는다. 이어롤·이어롭처럼 interrupted인 세션도 기존 예약 파일의 session/at/경로를 external_holds에 보존하고 자동 인수하지 않는다. 염무왕·수댕이 등 다른 세션도 같다. 기존 도감에 부분 등록됐지만 소유권이나 과거 UI가 불분명한 캐릭터는 blocked_candidates에 보류한다. legacy 기록을 꾸며내지 않는다. 이 관리기를 쓰지 않는 다른 작업자에게까지 강제되는 서버 잠금은 아니다. 다른 작업자도 생성 전 claims를 확인해야 한다.

모든 변경은 최신 원격 main을 부모로 하는 commit과 **일반 push**로 게시한다. 동시에 main이 바뀌면 fast-forward 조건으로 거절되고 멈춘다. 실패한 commit을 무작정 rebase/push하지 않는다. 실패 응답이 모호하면 원격에서 해당 commit 포함 여부를 확인한다. 임시 index를 써서 다른 작업자의 working tree/index/브랜치를 바꾸지 않는다. 원본·프롬프트·QA 파일은 기존 바이트를 교체하지 못한다.

## 생성과 검수

관리기는 이미지 생성 API를 제공하지 않는다. 에이전트가 실제 UI를 선택하고 제출 원문을 확인한 뒤 현재 세션의 image_gen을 호출한다. 선택값·직접 입력 이유·잠금·원문은 IMAGE_RULES에 맞게 캡처한다. 다른 유료 API나 새 자격증명을 사용하지 않는다.

```sh
# 먼저 원문/UI를 영속 기록. 성공한 intent 하나당 생성 호출 한 번만.
python3 tools/image-runner.py intent --owner pkm-daily --slot heavy --prompt /path/prompt.txt --ui /path/ui.json
# 에이전트가 image_gen을 호출한다. 위 명령은 이미지를 만들지 않는다.
# 도구가 실제로 반환한 파일 경로만 사용한다.
python3 tools/image-runner.py record --owner pkm-daily --slot heavy --image /actual/result.png
python3 tools/image-runner.py review --owner pkm-daily --slot heavy --qa /path/qa.json
```

①이 accepted가 되기 전에는 다음 slot의 intent를 기록할 수 없다. 중장·고기동·일상은 ① 해시를, 개방은 해당 폼의 해시를 references에 기록한다. 에이전트는 그 파일을 실제 첨부해야 하며 관리기가 첨부를 대신하거나 외부 호출 사실을 증명하지 않는다.

QA JSON은 `reviewer`, `image_sha256`, 구체적인 `observations`, `accepted:true`를 담는다. 경장은 `face_reason`, 실제 비교한 `compared_characters` 3명 이상과 계열 확인을 기록한다. 일상컷은 `diversity_comparison`에 실제 그림 비교를 적는다. 설정값이 다르다는 이유만으로 통과시키지 않는다. 검수 불합격/도구 거절/불명확한 응답은 아래 block으로 중단한다. 이 최소 구현은 거절된 컷을 자동 재생성하거나 기존 시도를 덮어쓰지 않는다. 재시도 이력 관리 확장은 별도 검증 후 추가한다.

일상컷 전에는 `next`의 `casual_session`으로 기존 계획기를 실행해 check·예약·일반 push한다. `intent`는 해당 캐릭터의 다른 세션 예약이 있으면 멈추고, 자기 일상 예약의 존재와 24시간 유효성을 확인한다.

```sh
node tools/casual-plan.cjs 릴링 --session <next의-casual_session> --reserve --push --out /path/plan.json
python3 tools/image-runner.py block --reason '실제 실패 원인'
# 증거로 원인을 해결한 뒤에만. pending intent나 QA는 그대로 남는다.
python3 tools/image-runner.py resume --reason '확인한 해결 내용'
```

계획기의 view/check/reserve는 모두 --fresh로 같은 원본 기록과 기존 예약을 합친다. 공유 장부 파일을 덮어쓰지 않는다. 직접 Python 검사를 할 때도 `casual-ledger.py check PLAN.json --fresh`를 쓴다. 검사를 완화하거나 실패를 무한 재시도로 숨기지 않는다.

## 업로드와 완료

9개 slot을 모두 승인한 뒤 IMAGE_RULES대로 새 WebP를 만들고 이름·중복 검사를 수행한다. PNG는 quality85/method6, 기존 WebP는 재인코딩하지 않는다. 이미지와 종별 records는 한 캐릭터 단위 커밋으로 img-2/main에 올린다. `records/automation/` 아래 원본 PNG는 복구용이며 도감 이미지로 등록되지 않는다. 썸네일/등록 Actions의 실패·경고를 확인한다.

```sh
python3 tools/image-runner.py complete --owner pkm-daily
```

complete는 원격 img-2의 9장 바이트가 보존 원본의 규정 변환과 같은지, 썸네일이 있는지, 코드 main의 data/img.json 슬롯과 where=1이 맞는지 확인한 뒤 다음 캐릭터를 허용한다. Actions 로그의 경고까지 조회하는 기능은 없으므로 에이전트가 별도로 확인·보고해야 한다. 원격 반영 전에는 완료로 표시하지 않는다.

## 검증 범위

한 장의 실제 UI→image_gen→로컬 PNG→재열기와 같은 환경의 턴 간 해시 검증은 성공했다. 코드 검사는 실제 bare Git에 대한 동시 push 거부, 하루 상한·다음 날 재개, 미완료/QA 게이트, 불변 원본·복구, 원격 이미지/도감 완료 대조를 포함한다. 예약 실행에서 image_gen·브라우저·이 파일시스템을 사용할 수 있는지는 별도 검증 대상이다. 예약 실행에서 도구가 없으면 상태만 보고하고 대체 API를 만들지 않는다. '하루 한 번 일정'과 '완전 무인 생성 검증 완료'는 같은 뜻이 아니다.
