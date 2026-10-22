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

정본 상태는 `pkm-atelier-img-2/records/automation/state.json` 하나다. UTC 날짜별 최대 2종을 원격 상태로 계산하며 다음 날짜에 미완료 run을 재개할 때도 미완료 캐릭터를 그날 상한에 포함한다. 활성 큐와 그날 생성 대상으로 계산되는 캐릭터는 최대 2종이고(건너뛴 이력은 큐에 남는다), 앞 캐릭터의 이미지·썸네일·도감 등록 확인 전에는 뒤 캐릭터에 들어갈 수 없다. 당일 더 이상 여유가 없으면 멈춘다.

claims는 캐릭터 전체에 대한 owner/run 잠금이다. 시간 경과만으로 만료/탈취하지 않는다. 이어롤·이어롭처럼 interrupted인 세션도 기존 예약 파일의 session/at/경로를 external_holds에 보존하고 자동 인수하지 않는다. 염무왕·수댕이 등 다른 세션도 같다. 기존 도감에 부분 등록됐지만 소유권이나 과거 UI가 불분명한 캐릭터는 blocked_candidates에 보류한다. legacy 기록을 꾸며내지 않는다. 이 관리기를 쓰지 않는 다른 작업자에게까지 강제되는 서버 잠금은 아니다. 다른 작업자도 생성 전 claims를 확인해야 한다.

모든 변경은 최신 원격 main을 부모로 하는 commit과 **일반 push**로 게시한다. 동시에 main이 바뀌면 fast-forward 조건으로 거절되고 멈춘다. 실패한 commit을 무작정 rebase/push하지 않는다. 실패 응답이 모호하면 원격에서 해당 commit 포함 여부를 확인한다. 임시 index를 써서 다른 작업자의 working tree/index/브랜치를 바꾸지 않는다. 원본·프롬프트·QA 파일은 기존 바이트를 교체하지 못한다.

## 생성과 검수

관리기는 이미지 생성 API를 제공하지 않는다. 에이전트가 실제 UI를 선택하고 제출 원문을 확인한 뒤 현재 세션의 image_gen을 호출한다. 선택값·직접 입력 이유·잠금·원문은 IMAGE_RULES에 맞게 캡처한다. 다른 유료 API나 새 자격증명을 사용하지 않는다.

```sh
# 먼저 원문/UI를 영속 기록. 성공한 intent 하나당 생성 호출 한 번만.
python3 tools/image-runner.py intent --owner pkm-daily --card 345 --slot heavy --prompt /path/prompt.txt --ui /path/ui.json
# 에이전트가 image_gen을 호출한다. 위 명령은 이미지를 만들지 않는다.
# 도구가 실제로 반환한 파일 경로만 사용한다.
python3 tools/image-runner.py record --owner pkm-daily --card 345 --slot heavy --image /actual/result.png
python3 tools/image-runner.py review --owner pkm-daily --card 345 --slot heavy --qa /path/qa.json
```

①이 accepted가 되기 전에는 다음 slot의 intent를 기록할 수 없다. 중장·고기동·일상은 ① 해시를, 개방은 해당 폼의 해시를 references에 기록한다. 에이전트는 그 파일을 실제 첨부해야 하며 관리기가 첨부를 대신하거나 외부 호출 사실을 증명하지 않는다. `intent_recorded:true`와 대상 번호·slot을 확인한 호출만 생성한다. `reconciled_external_skip` 응답이면 기존 원문을 제출하지 말고 새 대상의 실제 UI부터 준비한다.

`--card`는 현재 도감 번호와 일치해야 한다. 외부 작업 때문에 큐가 바뀌었을 때 이전 캐릭터의 원문·결과·QA가 새 캐릭터에 붙는 것을 막는다.

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

9개 slot을 모두 승인한 뒤 IMAGE_RULES대로 새 WebP를 만들고 이름·중복 검사를 수행한다. PNG는 quality85/method6, 기존 WebP는 재인코딩하지 않는다. 이미지와 종별 records는 한 캐릭터 단위 커밋으로 img-2/main에 올린다. 업로드 직전에 `python3 tools/image-runner.py prepublish --owner pkm-daily --card 345`를 실행한다. 반환 `operation`이 prepublish이고 `upload_base`가 있을 때만 그 commit을 부모로 업로드 커밋을 만든다. 로컬 업로드 checkout의 HEAD가 그 SHA와 일치하는지 확인하고, 기존 경로에는 다른 바이트를 쓰지 않는다. 일반 push가 밀리면 rebase 후 재push하지 말고 prepublish부터 다시 대조한다. prepublish는 이미지를 업로드하지 않는다. `records/automation/` 아래 원본 PNG는 복구용이며 도감 이미지로 등록되지 않는다. 썸네일/등록 Actions의 실패·경고를 확인한다.

```sh
python3 tools/image-runner.py complete --owner pkm-daily --card 345
```

complete는 원격 img-2의 9장 바이트가 보존 원본의 규정 변환과 같은지, 썸네일이 있는지, 코드 main의 data/img.json 슬롯과 where=1이 맞는지 확인한 뒤 다음 캐릭터를 허용한다. Actions 로그의 경고까지 조회하는 기능은 없으므로 에이전트가 별도로 확인·보고해야 한다. 원격 반영 전에는 완료로 표시하지 않는다.

## 외부 작업이 먼저 게시한 경우

`prepare`·`next`·이미지 작업 명령과 업로드 직전 `prepublish`는 최신 두 이미지 저장소의 img/ 원본 및 코드 data/img.json을 함께 읽는다. 코드만 등록됐거나 이미지 일부만 게시됐으면 `skipped_external_partial`, 같은 화풍의 기본 9개 슬롯이 등록되고 해당 저장소의 원본·썸네일도 존재하면 `completed_externally`로 기록한다. 자기 claim만 종료 상태와 근거 commit·파일 해시를 남기며, 타 세션 예약·잠금·이미지는 수정하지 않는다. interrupted나 예약 만료를 소유권 양도로 보지 않는다.

건너뛴 뒤에는 남은 하루 한도 안에서 다음 적격 캐릭터를 번호순으로 보충한다. 아직 intent도 없는 캐릭터는 예약된 한도를 반환한다. intent/결과가 있는 캐릭터는 그날 한도에 남기므로 외부 게시를 이용해 하루 2종 생성 상한을 넘길 수 없다. 후보 목록을 유한하게 한 번 검사하며 모두 제외되거나 한도가 소진되면 idle로 끝난다. `next`도 이제 필요한 대조·건너뛰기 상태를 일반 push할 수 있다. 읽기만 하려면 status를 쓴다.

이미 `in_flight`이면 claim을 즉시 종료하지 않고 external_pending에 증거를 남긴다. 기존 생성 호출 결과를 찾고 record로 원본을 보존한 뒤 다시 대조한다. 재호출은 금지다. records/automation의 원본은 외부 게시로 세지 않는다. img/에 게시된 파일도 보존 원본의 규정 WebP 해시 또는 prepublish의 출력 해시와 일치하면 자기 결과로 인식한다. 자기 9장이 게시되고 등록이 기다려지는 상태는 verify_registration이며 외부 건너뛰기가 아니다.

원격 snapshot은 상태 게시 직전에 다시 확인하며, img-2 일반 push의 부모 commit도 경합을 막는다. 서로 다른 저장소를 하나의 트랜잭션으로 잠그는 기능은 없으므로 검사 직후 다른 작업이 게시할 수 있다. 이 경우 생성 결과를 버리거나 재호출하지 말고 record로 보존한 뒤 다음 대조에 맡긴다. 업로드는 위 upload_base를 지켜 push 충돌을 재검사 신호로 처리한다.

## 검증 범위

한 장의 실제 UI→image_gen→로컬 PNG→재열기와 같은 환경의 턴 간 해시 검증은 성공했다. 코드 검사는 실제 bare Git에 대한 동시 push 거부, 하루 상한·다음 날 재개, 미완료/QA 게이트, 불변 원본·복구, 원격 이미지/도감 완료 대조를 포함한다. 예약 실행에서 image_gen·브라우저·이 파일시스템을 사용할 수 있는지는 별도 검증 대상이다. 예약 실행에서 도구가 없으면 상태만 보고하고 대체 API를 만들지 않는다. '하루 한 번 일정'과 '완전 무인 생성 검증 완료'는 같은 뜻이 아니다.

## 명시적으로 승인된 한 번의 수정

QA로 blocked된 보존 결과만 `retry-intent --owner pkm-daily --card N --slot SLOT --prompt FILE --ui FILE --qa REJECTED_QA --approval APPROVAL`로 수정할 수 있다. approval JSON은 card, slot, rejected_sha256, max_corrections:1, 실제 user_approval을 담는다. 승인 자체를 관리기가 얻는 것은 아니므로 에이전트가 사용자 승인을 확인해야 한다. rejected QA는 accepted:false, image_sha256, reviewer, observations를 담는다.

이 명령은 기존 결과를 attempt_history에 보존하고 새 제출을 attempts/2에 원자적으로 기록한다. intent_recorded:true일 때만 한 번 호출한다. record/review는 현재 시도를 가리키며 restore는 과거 시도와 승인도 복구한다. 같은 슬롯의 추가 수정은 거부한다. 다시 실패하면 block하며 자동 재시도하지 않는다. 기존 외부 결과 대조·하루 상한·일반 push 경합 보호는 그대로 적용된다.

## 특정 결과의 사용자 예외 승인

사용자가 보존된 불합격 결과를 명시적으로 채택하면 `accept-exception --owner pkm-daily --card N --slot SLOT --approval FILE`을 쓴다. 승인 JSON은 card, slot, image_sha256, message_id, user_approval을 담는다. 관리기는 blocked/review 결과와 정확한 해시를 대조하고 별도 user-exception.json에 실패 사유와 qa_passed:false를 보존한다. accepted는 이 경우 사용자 채택을 뜻하며 QA 통과가 아니다. 일반 review 조건과 다른 슬롯 기준은 바뀌지 않는다. 에이전트는 실제 사용자 승인 없이 이 명령을 쓰지 않는다.

## 결과 파일 없는 도구 거절 뒤 명시적 재계획

`replan-rejected --card N --slot SLOT --prompt FILE --ui FILE --failure FILE --approval FILE`은 확정된 moderation_blocked 응답으로 파일이 반환되지 않은 blocked intent에만 쓴다. 진행 중이거나 결과가 불확실한 호출은 대상이 아니다. failure는 terminal:true, output_files:[], code, request_id, prompt_sha256을 기록한다. approval은 card, slot, rejected_prompt_sha256, max_new_attempts:1, user_approval, substantive_nonsexual_changes를 기록한다. 에이전트는 실제 승인과 실질적인 비성적 내용 변경을 확인해야 한다. 필터 통과 지점을 탐색하는 반복 기능이 아니다.

기존 intent와 도구 거절은 attempt_history 및 tool-failure.json에 남고 새 시도는 attempts/2에 기록된다. 거절 기록도 restore에서 해시 검사한다. 같은 슬롯에는 한 번만 허용하며 재거절 시 block한다. 사용자 지시로 바꾼 강도·노출·의상·구도는 실제 UI와 별도 승인 기록에 남기고, 일반 계획·QA 검사를 완화하지 않는다.
