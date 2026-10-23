# 이미지 작업 이어가기 — 2시간마다 실행당 1종 · 하루 최대 12종

사용자 승인: AI가 첫 경장부터 검수하고 미완성 캐릭터를 번호순으로 실행당 최대 1종, Asia/Seoul 및 UTC 날짜별 각각 최대 12종 처리한다. 별도 사용자 검토 요청 없이 AI QA 후 일반 push한다. 이미지·도감·자동화 코드·상태의 일반 main push만 사용한다. 강제 push, 기존 이미지 교체/삭제, 과거 UI 기록 추정, 조건 완화는 금지다. 일정 생성은 별도 부모 작업이 맡으며 이 도구는 cron을 만들지 않는다.

## 시각적 품질은 업로드 후 사용자 검토 (2026-10-23 승인)

사용자는 “내가 끝나고 업로드 되면 알아서 확인할테니까 중간에 묻지말고 그냥 진행해.”라고 승인했다. 이 자동화의 잘림·장갑/디자인 차이·손 등 시각적 품질 지적은 중간 확인이나 자동 재생성 없이 게시 대상으로 채택한다. 실제 QA 관찰과 `accepted:false`를 보존하고, 관리기의 `block` → 실패 QA 불변 기록 → `accept-exception` 경로에 해당 이미지 해시와 이 승인 근거를 연결한다. `qa_passed:false`, `acceptance_basis:user_exception`을 유지한다. 일반 `review`를 느슨하게 만들거나 실패를 통과로 바꾸지 않는다. 아래의 시각적 QA 실패 중단/개별 승인 설명보다 이 최신 승인이 우선한다.

이 승인은 콘텐츠 안전 거절·불명확한 생성 응답·원본 유실·도구 오류·타 세션 예약·일일/실행 상한에는 적용되지 않는다. 그 경우 정확한 근거를 보존하고 중단·보고한다. 필터 탐색, 자동 재시도, 기존 공개 이미지 교체 권한도 생기지 않는다.

## 다음 실행의 짧은 지침

먼저 AGENTS.md와 IMAGE_RULES.md를 읽고 코드와 이미지 세 저장소를 최신 main으로 받는다. 기존 로컬 변경을 reset하지 않는다. Python 3 + Pillow, Node, Playwright/Chromium이 필요하다. 코드·이미지 저장소 셋을 나란히 둔다. casual-plan은 실제 img/와 records를 읽으므로 기록만 받은 sparse checkout으로 생성 계획을 확정하지 않는다.

```sh
# 예약 호출 고유 ID를 한 번 정하고 모든 후속 명령/재진입에 그대로 재사용한다.
# 부모가 제공한 invocation ID 권장. 없다면 시작 시 한 번만 아래처럼 고정한다.
export PKM_EXECUTION_ID="pkm-$(date -u +%Y%m%dT%H%M%SZ)"
python3 tools/image-runner.py status
python3 tools/image-runner.py restore --dir /workspace/pkm-recovery
python3 tools/image-runner.py prepare --owner pkm-daily
python3 tools/image-runner.py next
```

`restore`는 원격에 실제 저장된 과거 원본·원문·UI·QA의 SHA256을 확인한다. 새 session_only 원본은 복구하지 못한다. 후속 참조 생성 전에 기존 로컬 캐시 해시를 확인하고, 없으면 중복 생성하지 말고 정확히 보고한다. 같은 경로의 다른 파일은 덮어쓰지 않는다. 복구가 실패하면 생성하지 말고 보고한다. 릴링 경장은 이미 생성된 파일을 쓰며 다시 만들지 않는다. `prepare`는 새 run을 만들거나 같은 owner의 미완료 run을 재개한다. `next`가 `review`면 보존된 결과를 검수하고, `in_flight`면 먼저 도구 결과/파일을 찾아 `record`한다. `in_flight`는 재생성 허가가 아니다. `blocked`면 원인을 해결하기 전에는 진행하지 않는다.

## 실행 단위와 잠금

정본 상태는 `pkm-atelier-img-2/records/automation/state.json` 하나다. `daily`는 UTC, `daily_kst`는 Asia/Seoul 날짜별 최대 12종을 각각 기록한다. `executions[ID].characters`는 실행당 최대 1종을 별도로 제한한다. `--execution-id ID` 또는 `PKM_EXECUTION_ID`는 모든 상태 변경 명령에 필수이며 같은 실행의 반복 next/prepare·중단 재진입·날짜 변경에도 바꾸지 않는다. 완료 후 같은 ID로 next를 반복해도 idle이다. 새 예약 호출만 새 ID를 쓴다. 실행 ID를 바꿔 동일 호출의 한도를 우회하지 않는다.

활성 run은 현재 캐릭터만 재개하고 큐를 보충하지 않는다. 다음 호출이 미완료 캐릭터를 재개하면 그 호출의 1종 한도를 사용한다. prepare와 실제 intent 직전 두 날짜 상한을 확인한다. 자정 이후 참조 생성도 해당 날짜에 계산한다. 결과 보존(record)은 날짜 제한 때문에 버리지 않는다. 날짜 할당은 보수적으로 prepare부터 계산하며, intent 없는 외부 건너뛰기만 두 날짜/실행 할당을 반환한다. 과거 완료·claim·예약은 그대로 둔다. 기존 UTC 장부는 유지하고 KST 장부만 실제 intent 시각으로 이관한다.

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

QA JSON은 `reviewer`, `image_sha256`, 구체적인 `observations`, `accepted:true`를 담는다. 경장은 `face_reason`, 실제 비교한 `compared_characters` 3명 이상과 계열 확인을 기록한다. 일상컷은 `diversity_comparison`에 실제 그림 비교를 적는다. 설정값이 다르다는 이유만으로 통과시키지 않는다. 검수 불합격/도구 거절/불명확한 응답은 아래 block으로 중단한다. 이 최소 구현은 거절된 컷을 자동 재생성하거나 기존 시도를 덮어쓰지 않는다. 명시적 재시도와 예외 채택은 아래의 제한된 승인 경로만 사용한다.

일상컷 전에는 `next`의 `casual_session`으로 기존 계획기를 실행해 check·예약·일반 push한다. `intent`는 해당 캐릭터의 다른 세션 예약이 있으면 멈추고, 자기 일상 예약의 존재와 24시간 유효성을 확인한다.

```sh
node tools/casual-plan.cjs 릴링 --session <next의-casual_session> --reserve --push --out /path/plan.json
python3 tools/image-runner.py block --reason '실제 실패 원인'
# 증거로 원인을 해결한 뒤에만. pending intent나 QA는 그대로 남는다.
python3 tools/image-runner.py resume --reason '확인한 해결 내용'
```

계획기의 view/check/reserve는 모두 --fresh로 같은 원본 기록과 기존 예약을 합친다. 공유 장부 파일을 덮어쓰지 않는다. 직접 Python 검사를 할 때도 `casual-ledger.py check PLAN.json --fresh`를 쓴다. 검사를 완화하거나 실패를 무한 재시도로 숨기지 않는다.

## 업로드와 완료

9개 slot을 모두 승인한 뒤 IMAGE_RULES대로 새 WebP를 만들고 이름·중복 검사를 수행한다. PNG는 quality85/method6, 기존 WebP는 재인코딩하지 않는다. 이미지(img/)와 종별 records는 한 캐릭터 단위 커밋으로 **열린 저장소 img-3/main**에 올린다 — 생성 원본 PNG 없이(아래 "원본은 세션 안에만"). 상태(`records/automation/state.json`)는 그대로 img-2. 업로드 직전에 `python3 tools/image-runner.py prepublish --owner pkm-daily --card 345`를 실행한다. 반환 `operation`이 prepublish이고 `upload_base`가 있을 때만 그 commit을 부모로 업로드 커밋을 만든다. 로컬 업로드 checkout의 HEAD가 그 SHA와 일치하는지 확인하고, 기존 경로에는 다른 바이트를 쓰지 않는다. 일반 push가 밀리면 rebase 후 재push하지 말고 prepublish부터 다시 대조한다. prepublish는 이미지를 업로드하지 않는다. 기존 원격 원본 기록은 보존하지만 새 원본 PNG/JPG는 업로드하지 않는다. 썸네일/등록 Actions의 실패·경고를 확인한다.

```sh
python3 tools/image-runner.py complete --owner pkm-daily --card 345
```

complete는 where 가 가리키는 저장소(새 run 은 img-3 = where 2, 10-22 run 은 img-2 = where 1)의 9장 바이트가 record 때 적은 WebP sha256(옛 run 은 보존 원본의 규정 변환)과 같은지, 썸네일이 있는지, 코드 main의 data/img.json 슬롯과 where가 맞는지 확인한 뒤 다음 캐릭터를 허용한다. Actions 로그의 경고까지 조회하는 기능은 없으므로 에이전트가 별도로 확인·보고해야 한다. 원격 반영 전에는 완료로 표시하지 않는다.

## 외부 작업이 먼저 게시한 경우

`prepare`·`next`·이미지 작업 명령과 업로드 직전 `prepublish`는 최신 세 이미지 저장소(img·img-2·img-3)의 img/ 원본 및 코드 data/img.json을 함께 읽는다. 코드만 등록됐거나 이미지 일부만 게시됐으면 `skipped_external_partial`, 같은 화풍의 기본 9개 슬롯이 등록되고 해당 저장소의 원본·썸네일도 존재하면 `completed_externally`로 기록한다. 자기 claim만 종료 상태와 근거 commit·파일 해시를 남기며, 타 세션 예약·잠금·이미지는 수정하지 않는다. interrupted나 예약 만료를 소유권 양도로 보지 않는다.

건너뛴 뒤에는 남은 하루 한도 안에서 다음 적격 캐릭터를 번호순으로 보충한다. 아직 intent도 없는 캐릭터는 예약된 한도를 반환한다. intent/결과가 있는 캐릭터는 그날 한도에 남기므로 외부 게시를 이용해 실행당 1종 및 두 날짜별 12종 생성 상한을 넘길 수 없다. 후보 목록을 유한하게 한 번 검사하며 모두 제외되거나 한도가 소진되면 idle로 끝난다. `next`도 이제 필요한 대조·건너뛰기 상태를 일반 push할 수 있다. 읽기만 하려면 status를 쓴다.

이미 `in_flight`이면 claim을 즉시 종료하지 않고 external_pending에 증거를 남긴다. 기존 생성 호출 결과를 찾고 record로 원본의 해시를 남긴 뒤(원본은 세션 캐시) 다시 대조한다. 재호출은 금지다. records/automation의 원본은 외부 게시로 세지 않는다. img/에 게시된 파일도 record 때 적은 WebP 해시(옛 run 은 보존 원본의 규정 WebP 해시) 또는 prepublish의 출력 해시와 일치하면 자기 결과로 인식한다. 자기 9장이 게시되고 등록이 기다려지는 상태는 verify_registration이며 외부 건너뛰기가 아니다.

원격 snapshot은 상태 게시 직전에 다시 확인하며, img-2 일반 push의 부모 commit도 경합을 막는다. 서로 다른 저장소를 하나의 트랜잭션으로 잠그는 기능은 없으므로 검사 직후 다른 작업이 게시할 수 있다. 이 경우 생성 결과를 버리거나 재호출하지 말고 record로 보존한 뒤 다음 대조에 맡긴다. 업로드는 위 upload_base를 지켜 push 충돌을 재검사 신호로 처리한다.

## 원본은 세션 안에만 (2026-10-23)

`record`는 결과 원본을 커밋하지 않는다. 바이트는 세션 캐시(`PKM_IMAGE_CACHE`, 기본 `<tmp>/pkm-image-runner/<sha256>.<ext>`)에만 두고,
상태에는 `{"path", "sha256", "session_only": true, "webp_sha256"}`만 적는다 — img-2 가 기록 폴더의 원본 PNG(312 MB)로 Pages 1 GB 에 닿았다.
`check_assets`·`restore`는 session_only 원본을 건너뛴다(커밋된 것이 없다). `prepublish`·`complete`·외부 게시 대조는 `webp_sha256`을 쓰므로 원본이 없어도 된다.
원본 바이트가 필요한 것(WebP 만들기, 교체의 원본 대조)은 그 세션에서만 된다 — 다른 세션에서는 "original not in this session" 으로 멈춘다.
그때는 다시 생성하지 말고 멈춘 까닭을 보고한다(재생성은 명시 승인으로만). 10-22 run 처럼 원본이 이미 커밋된 항목은 예전처럼 img-2 에서 읽는다.

## 검증 범위

한 장의 실제 UI→image_gen→로컬 PNG→재열기와 같은 환경의 턴 간 해시 검증은 성공했다. 코드 검사는 실제 bare Git에 대한 동시 push 거부, 하루 상한·다음 날 재개, 미완료/QA 게이트, 불변 원본·복구, 원격 이미지/도감 완료 대조를 포함한다. 예약 실행에서 image_gen·브라우저·이 파일시스템을 사용할 수 있는지는 별도 검증 대상이다. 예약 실행에서 도구가 없으면 상태만 보고하고 대체 API를 만들지 않는다. '2시간 간격 일정'과 '완전 무인 생성 검증 완료'는 같은 뜻이 아니다.

## 명시적으로 승인된 한 번의 수정

QA로 blocked된 보존 결과만 `retry-intent --owner pkm-daily --card N --slot SLOT --prompt FILE --ui FILE --qa REJECTED_QA --approval APPROVAL`로 수정할 수 있다. approval JSON은 card, slot, rejected_sha256, max_corrections:1, 실제 user_approval을 담는다. 승인 자체를 관리기가 얻는 것은 아니므로 에이전트가 사용자 승인을 확인해야 한다. rejected QA는 accepted:false, image_sha256, reviewer, observations를 담는다.

이 명령은 기존 결과를 attempt_history에 보존하고 새 제출을 attempts/2에 원자적으로 기록한다. intent_recorded:true일 때만 한 번 호출한다. record/review는 현재 시도를 가리키며 restore는 과거 시도와 승인도 복구한다. 같은 슬롯의 추가 수정은 거부한다. 다시 실패하면 block하며 자동 재시도하지 않는다. 기존 외부 결과 대조·하루 상한·일반 push 경합 보호는 그대로 적용된다.

## 특정 결과의 사용자 예외 승인

사용자가 보존된 불합격 결과를 명시적으로 채택하면 `accept-exception --owner pkm-daily --card N --slot SLOT --approval FILE`을 쓴다. 승인 JSON은 card, slot, image_sha256, message_id, user_approval을 담는다. 관리기는 blocked/review 결과와 정확한 해시를 대조하고 별도 user-exception.json에 실패 사유와 qa_passed:false를 보존한다. accepted는 이 경우 사용자 채택을 뜻하며 QA 통과가 아니다. 일반 review 조건과 다른 슬롯 기준은 바뀌지 않는다. 에이전트는 실제 사용자 승인 없이 이 명령을 쓰지 않는다.

## 결과 파일 없는 도구 거절 뒤 명시적 재계획

`replan-rejected --card N --slot SLOT --prompt FILE --ui FILE --failure FILE --approval FILE`은 확정된 moderation_blocked 응답으로 파일이 반환되지 않은 blocked intent에만 쓴다. 진행 중이거나 결과가 불확실한 호출은 대상이 아니다. failure는 terminal:true, output_files:[], code, request_id, prompt_sha256을 기록한다. approval은 card, slot, rejected_prompt_sha256, max_new_attempts:1, user_approval, substantive_nonsexual_changes를 기록한다. 에이전트는 실제 승인과 실질적인 비성적 내용 변경을 확인해야 한다. 필터 통과 지점을 탐색하는 반복 기능이 아니다.

기존 intent와 도구 거절은 attempt_history 및 tool-failure.json에 남고 새 시도는 attempts/2에 기록된다. 거절 기록도 restore에서 해시 검사한다. 같은 슬롯에는 한 번만 허용하며 재거절 시 block한다. 사용자 지시로 바꾼 강도·노출·의상·구도는 실제 UI와 별도 승인 기록에 남기고, 일반 계획·QA 검사를 완화하지 않는다.

## 완료 후 사용자가 지정한 공개 슬롯 교체

명시적으로 승인된 완료 캐릭터 casual3 교체는 `append_completed_replacement`로 이전 공개 해시·승인·새 검수 원본을 대조한 후 `replacements`에 추가한다. 기존 slots, outputs, completed_at과 실패 시도는 과거 완료 기록으로 그대로 남는다. 공개 WebP와 상태 overlay는 같은 일반 push에 반영한다. 완료 상태를 재개하거나 새 캐릭터를 생성하지 않는다. `verify-completed`는 마지막 교체 원본을 우선하여 실제 공개 바이트·썸네일·도감 슬롯을 읽기 전용으로 검증한다. restore와 장부도 교체 원본·실제 UI를 반영하며 과거 기록을 삭제하지 않는다.

## 정책 변경만 반영

`python3 tools/image-runner.py migrate-policy`는 큐를 만들거나 생성하지 않고 img-2 상태의 정책과 날짜 장부만 이관한다. 일정은 부모가 별도로 2시간 간격으로 설정한다. 실행 명령은 위 환경변수 설정 후 `restore`, `prepare --owner pkm-daily`, `next --owner pkm-daily` 순서다. 이후 이미지 명령에는 반드시 `--card N`을 적는다. QA/도구 차단은 기록하고 알리며 무제한 재시도나 필터 탐색을 하지 않는다.

## 명시적 미완료 보류

`defer-run --owner pkm-daily --card N --reason TEXT`는 현재 실행을 deferred로 보류하며 캐릭터의 blocked 상태·claim·실패 슬롯·날짜 장부를 그대로 보존한다. 결과 불명확 in_flight는 보류할 수 없다. 파일 없는 확정 moderation_blocked만 근거를 읽어 허용한다. 다음 예약은 새 실행 ID로 다음 적격 캐릭터를 선택하며 보류 캐릭터 claim을 탈취하지 않는다. 개별 안전 거절은 재시도하지 않고, 승인된 정본으로 가능한 독립 슬롯만 별도 명시적 intent 기록으로 진행한다. 전체 도구 오류·권한·상한·원격 충돌은 계속 중단 사유다.
