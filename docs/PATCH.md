# 패치 기록

파일을 고친 쪽이 직접 한 칸 적는다. 규칙은 `AGENTS.md` 의 "5. 고쳤으면 적는다" 에 있다.
집 화면(`index.html`)의 **패치 기록** 단추가 이 파일을 그대로 읽어 보여 준다.

모양은 두 줄이 전부다. 한 칸은 `##` 으로 시작하고 `날짜 · 누가 · 무엇을 바꿨나` 를
가운뎃점으로 나눈다. 그 아래 `-` 줄에 `파일 — 왜/무엇` 을 파일마다 하나씩 적는다.
날짜는 `2026-09-21` 꼴, 누가는 `claude` 또는 `gpt`, 새 칸이 위로 간다.
이 안내글은 첫 `##` 앞이라 화면이 읽지 않는다. `node tests/patch.cjs` 가 모양을 본다.

여기서부터 적기 시작했다. 그 전 것은 `git log` 에 있다.


## 2026-11-11 · gpt · 야돈 애니 2.5D 광택 10장 등록
- data/img.json — 승인된 메카 1장과 일상컷 9장을 anime_25d_gloss 화풍으로 추가하고 기존 화풍을 보존했다.

## 2026-11-11 · claude · ① 임의 설계 — 자세는 우리 것, 눈색은 우리 것 · 맡은 쪽 것 둘 다
- 사용자 「자세는 고정, 눈색은 자유로 하자」 → 「대신 눈색은 우리거 써도 되고, gpt가 정해도 되는걸로」 — FREE_DESIGN.eyes 「Eye colour (your choice): ours is … — keep it or choose your own」(우리 눈색은 Impression 줄에서) — lib/prompt-spec.js FREE_DESIGN.pose · free · second, lib/prompt-anthro.js buildFree 가 우리 ① 의 자세 줄(「Default stance is a standing, card-ready pose …」)을 「Pose (fixed — ours)」 로 싣는다. 장면(배경)은 맡은 쪽. IMAGE_RULES 「① 경장」 · 묶음 INDEX 말 · tests/prompt-pack.cjs

## 2026-11-11 · claude · ① 네 장 — 우리 설계 둘 + GPT 임의 설계 둘, 고른 뒤 일상컷
- 사용자 「pkm쪽 생성룰에 삼국지나 원소공방처럼 메카컷 우리쪽설계2장, gpt설계 2장 생성해서 나한테 검토 후 진행하는 방향으로 바꿔줘」
- lib/prompt-spec.js FREE_DESIGN(삼국지 · 원소 WORLD_FREE 꼴), lib/prompt-anthro.js buildFree — 우리 ① 지시문(칸 꼴 · 줄 꼴)에서 화풍 · 색 · 머리색 · 체형 · 장갑 폼 · 원작 특징 · 노출 · 구도를 「fixed — ours」 로 뽑고, 큰 실루엣은 그 종 타입 추천 목록에서 하나 + 원작 아이디어 하나, 얼굴 · 눈색 · 헤어스타일 · 표정 · 자세 · 장면 · 타입 효과는 맡은 쪽
- tools/prompt-pack.cjs build — ① 자리에 light-free.txt, INDEX.md 에 「① → 멈춤 → 일상컷」(네 장 · 고른 장만 올림 · gpt_free 기록). IMAGE_RULES.md 「① 경장」 · docs/IMAGE_AUTOMATION.md. tests/prompt-pack.cjs

## 2026-11-11 · claude · 인상 눈빛 낱말에서 「눈을 얼마나 뜨나」 빼기(감사 P3)
- IMPRESSION_VIBES 다섯: fierce 「a sharp, narrow-eyed glare(눈을 가늘게 뜬 노려봄)」 → 「a sharp, challenging stare(날카롭게 도전하는 눈빛)」, sleepy 「heavy, sleepy half-lidded eyes(반쯤 감긴 졸린 눈)」 → 「a drowsy, unhurried gaze(졸린 듯 느긋한 눈빛)」, regal 「a proud gaze from slightly lowered lids(눈꺼풀을 내린 오만한 눈빛)」 → 「a proud, level gaze(오만하게 똑바로)」, elegant 「a poised gaze under lowered lashes(속눈썹을 내리깐)」 → 「a poised, quiet gaze(침착하고 조용한)」, cheerful 「a sunny, open look…(눈을 활짝 뜬)」 → 「a sunny look with laughter in her eyes(밝은 얼굴, 눈에 웃음)」
- 까닭: 눈 모양 · 크기는 Face 줄이 정하는데 인상 줄이 눈 뜬 정도까지 정해 부딪혔다(큰 눈 + 가늘게 뜬 노려봄 등). 처진 눈꼬리 + 날카로운 아이라인은 화장이라 그대로
- 지시문 299종의 Impression 줄 한 토막만 바뀜(다른 줄 0). prompt.html prompt-spec ?v=p3, 검사 — 처음부터 깨져 있던 14개 말고 통과
- 사용자 2026-11-11 「응 고쳐줘」

## 2026-11-11 · claude · 기본 화풍의 「파스텔」 → 「자기 색을 부드럽게」(감사 P1)
- anime_25d_gloss 세계 그림 글: 「Use luminous midtones, restrained highlights on clothing and armor, and a delicate pastel palette(빛나는 중간 톤, 옷 · 장갑엔 절제된 하이라이트, 섬세한 파스텔 색)」 → 「Use luminous midtones and restrained highlights on clothing and armor, keeping her own colours in soft, clean tints(… 색은 그 종의 자기 색 그대로 부드럽고 깨끗한 톤으로)」. 일상컷 글도 같이(장갑 말만 빠진 꼴)
- 까닭: 첫 색이 검정 · 짙은 색인 183종(검정이 들어간 종 330)에서 종의 색 줄(Colours)과 「파스텔」 이 서로 반대 말이었다(독침붕 · 피죤투 · 아보 …). 광택 전 판 anime_25d 는 기본 화풍이 아니라 그대로
- 지시문 1,025종 모두 1칸 한 문장만 바뀜. prompt.html prompt-spec ?v=p1, 검사 — 처음부터 깨져 있던 14개 말고 통과(dot-screen 은 한 번 깨졌다 다시 돌리니 통과 — 도트 배율 검사)
- 사용자 2026-11-11 「응 고쳐줘」

## 2026-11-11 · claude · 메카 지시문 칸 꼴
- lib/prompt-anthro.js · lib/prompt-spec.js — 새 인물 · 이어가기 · 개방 지시문을 core 칸 틀(CORE_FRAME)의 머리말 + 다섯 칸으로(toSections). 사용자 2026-11-11 「초안 없이 다 진행해줘」(3단계 — 칸 꼴 통일). 일상컷은 그대로
- 칸 대조 — 머리말 Input · Source · Subject · Output / 1 STYLE 화풍 문장 / 2 CHARACTER (첨부 그림의 그 사람) · Face — · Hair · Hair color · Impression · Identity · Proportions(옛 ANATOMY) · Body · Hands · 해부 줄 / 3 ARMOR — 폼 Costume(옛 FORM —) · Form note · Armor · Silhouette · Colours(옛 PALETTE) · Wear · Head · Motifs to keep · Exposure (개방은 Change only this) / 4 SCENE Composition · Pose · Type effects · 고른 장면 값 · Note / 5 CONSTRAINTS ONE FIGURE ONLY. · Avoid
- 바뀐 글 — 줄 머리(첫 글자만 대문자 · 삼국지 낱말), 「No …」 나열 문장 · 마디 8가지 → Avoid(No helmet; at most … · unless · No added VFX 는 제자리), 옛 줄 이름 가리키던 말 as FORM says → as the costume below says · her own FACE line below → her own Face line below(얼굴 줄 없으면 her own face), 해부 줄과 겹치는 BODY 마디 · natural human hands. 빼기. 전부 tests/prompt-sections.cjs CHANGED 표
- 스위치 lib/prompt-spec.js SECTIONS.on(false 면 줄 꼴) · buildPrompt(st,{sections:false}) 는 그 한 번만 줄 꼴 · prompt.html ?v=sections1
- tools/prompt-pack.cjs — submitted 의 화풍 줄을 칸 꼴에선 「1. STYLE」 바로 아래 줄로(옛 /^STYLE:/ 로는 늘 style_kept true 였다)
- tools/face-design.py — 그림 기록 지시문 읽기가 칸 꼴(Input · Source · 3. ARMOR — LIGHT · Hair:)도 읽는다(머리 잠금이 칸 꼴 ① 을 못 찾지 않게)
- tests/prompt-sections.cjs(새) — 전 카드 × 새 인물 · 이어가기 세 폼 · 개방 넷, 화풍 열여덟, 고르는 칸 전부 1만 2천 장을 줄 꼴과 마디마다 견준다(잃은 글 · 새로 쓴 글 0) · 낱말 범위는 종류마다(개방 245낱말이 옛 하한 250 에 걸렸다)
- tests — 줄 꼴 조건 검사는 스위치 끈 판으로 계속 보고(prompt-engine · face-design · concept-mecha · styles · prompt-appearance) 칸 꼴 검사를 더했다. 칸 꼴 기준으로 고쳐 쓴 것: source-appearance · prompt-pack · prompt-action(빈 글끼리 같던 장갑 문단) · prompt-screen · concept-mecha-screen · prompt-pack-screen · prompt-appearance-dom · source-appearance-dom · face-design-hair-lock.py
- IMAGE_RULES.md 3절 · AGENTS.md 검사 목록 — 칸 꼴 단락 · 새 검사 한 줄

## 2026-11-11 · claude · core v4 블록
- core 블록 판을 v4 로 — 칸 꼴 틀(CORE_FRAME)이 같이 오지만 이 공방 지시문은 아직 제 구조라 바뀐 것 없음. 칸 꼴로 옮길 땐 대조표 초안 먼저(사용자 2026-11-11 3단계)

## 2026-11-11 · claude · core v3 블록
- core 블록 판만 v3 로 — 포켓몬은 face_shape · lips 표가 없어 지시문 변화 없음
- prompt.html ?v=core3

## 2026-11-11 · claude · core v2 블록
- core 블록 판만 v2 로 — 포켓몬은 face_shape 표가 없어 지시문 변화 없음(긴 얼굴은 제 FACE_SOFT 로 이미 순화)
- prompt.html ?v=core2

## 2026-11-11 · claude · 표정 표를 공방 공통 글(core v1)로
- lib/prompt-spec.js 끝에 화풍공방 core/v1 블록 — 표정 표(EXPRESSION_DETAIL) 32개가 공통 글(삼국지 11-03 순화본)로 바뀐다. 공방에만 있는 열쇠는 그대로
- 사용자 2026-11-11 「프롬포트 생성 관련 테스트나 문구관리를 하나의 공방에서 관리는 못하나」 → 「응 1번부터 진행해줘」
- ① 지시문(1025종)은 표정을 안 실어서 바뀐 것 없음 — 생성기에서 표정을 고를 때만 새 글
- 검사 tests/core-sync.cjs(블록 = 원본), prompt.html ?v=core1

## 2026-11-11 · claude · 그림 없는 화풍 열하나 내림
- 사용자 「도감에 그림 등록이 없는 키들은 빼는게 좋을거 같아」 → 「1,2번 다 내려줘」 — data/img.json byStyle 에 한 장도 없던 game_keyart · glossy_kr_game · game_cgi · semi_real_paint · photoreal · anime_illust · cel_anime · painterly · retro_anime · ink_wash · bright_catalog(다시 세어 0 확인). 남는 화풍 일곱: glossy_promo · anime_25d_gloss · anime_gloss · anime_25d · mecha_cinematic_keyart · gloss_daylight · cinematic_semi_real
- lib/prompt-spec.js — RETIRED_STYLES(날짜 · 까닭)와 LIVE_STYLES(ART_STYLES 에서 내린 것만 뺀 차례) 추가. 정의 · 화풍 문장 · 견본은 기록으로 그대로 둔다
- tools/sync-styles.cjs · data/style.json — 내린 열하나에 retired 2026-11-11 · retired_why 를 붙여 생성(등록기가 옛 파일 이름을 읽도록 목록엔 남긴다). LIVE_STYLES 와 어긋나거나 기본 화풍이 내린 것이면 실패
- lib/prompt-ui.js — 생성기 화풍 고르개가 LIVE_STYLES 만(18 → 7). lib/prompt-state.js — 저장값 · 주소의 내린 화풍은 기본 화풍으로. prompt.html 판(retire1)
- tools/prompt-pack.cjs — init --style 내린 화풍이면 서고, build 는 settings 의 내린 화풍을 고칠 칸으로
- dex.html — 도감 화풍 거르기에서 retired 화풍을 뺀다(그림은 원래 없다 · 주소로 고른 값이면 그 칸만 남긴다)
- tests/styles.cjs · prompt-engine.cjs · prompt-screen.cjs · prompt-pack.cjs · dex-nav.cjs — 옛 18 개 고르개 대신 지금 일곱 · 내린 열하나(그림 없음 · 저장값은 기본으로 · 묶음이 막는다 · 도감 거르기에 없음). 옛 코드로 돌려 실패하는 것을 먼저 봤다. AGENTS.md · README.md · IMAGE_RULES.md 화풍 말 고침

## 2026-11-11 · gpt · 윤겔라·모다피 애니 2.5D 광택 열 장씩 등록
- data/img.json — 윤겔라·모다피 각각 경장 1장과 일상 9장을 anime_25d_gloss로 추가. 기존 화풍과 그림은 보존하고 새 그림은 4번 그림 저장소에 게시.

## 2026-11-10 · claude · 두 타입 머리색 — 바탕은 종의 메인색, 보조색만 타입색
- 사용자 「아니 내말은 메인컬러는 그 케릭터 메인색 쓰고 보조로 들어가는 색을 타입색 쓰자고」 — 바로 앞 칸은 바탕까지 첫 타입색이라 루카리오 머리가 진홍이 됐다
- lib/prompt-spec.js hairMix 「her main hair color is the creature's own main color; {둘째 타입색} for her {둘째 타입} type runs through it as the accent, in streaks and at the tips」. lib/prompt-anthro.js hairMixLine 은 둘째 타입색만. 첫 타입은 대개 몸 색과 같아 둘째를 쓴다. tests/prompt-engine.cjs 이상해씨 바탕 메인색 · 보조 violet

## 2026-11-10 · claude · 두 타입 머리색을 타입색으로 — 비행은 흰색
- 사용자 「그러면 몸의 색 말고, 타입색으로 넣어보자. 비행이면 흰색 같이」 — 몸 팔레트에서 고르게 했더니 리자몽은 주황에 청록이 조금만 섞였다
- lib/prompt-spec.js TYPE_HAIR(타입 열여덟 → 머리색, 비행 white · 강철 silver · 악 black …), hairMix 「{첫 타입색} hair for her {타입}, with {둘째 타입색} … in streaks and at the tips — these type colors, not her body's palette」. lib/prompt-anthro.js hairMixLine 이 표를 읽는다
- tests/prompt-engine.cjs 이상해씨 leaf green + violet · 갸라도스 비행 white · 타입 열여덟 모두 색. 이상해씨 · 리자몽 · 갸라도스 · 루카리오로 시험 그림(올리지 않음)

## 2026-11-10 · claude · 두 타입 종 머리색 — 타입마다 한 색씩 섞기
- 사용자 「포켓몬 쪽에 타입 여러개인 친구들은 발챙이처럼 헤어색 섞는것도 좋겠다」 — 발챙이 ①(anime_25d_gloss)은 파란 머리에 분홍이 끝 · 가닥으로 섞였다
- lib/prompt-spec.js PROMPT_LINES.hairMix, lib/prompt-anthro.js hairMixLine — 새 인물 만들기에서 타입이 둘이면 HAIR 줄 다음에 「HAIR COLOR: 타입 하나에 한 색씩, 그 종의 팔레트에서 — 바탕색에 둘째 색이 가닥 · 끝으로」. 색 이름은 적지 않는다(모델이 팔레트에서). 머리색을 직접 고르면 안 싣는다. 이어가기 · 일상컷은 첨부 그림의 머리색 그대로
- tests/prompt-engine.cjs 두 타입 · 한 타입 · 머리색 고름, 1025종 낱말 상한 605 → 640. prompt.html 스크립트 판(hairmix1)

## 2026-11-09 · claude · 일상컷 가까운 컷 — 팔 없는 몸통 · 떠다니는 손 막기
- 사용자 「일상컷 구도에서 팔이 잘리거나 추가팔이 생성되는게 많아졌는데」 — 최근 일상컷 120장 중 가슴 위 · 클로즈업 컷의 약 30% 가 팔 없이 몸통만 남았고 3~4장은 팔에 안 이어진 손이 떠 있었다(페르시온 일상 2 손 흔들기 + 쇄골). HANDS 줄이 「손은 화면 밖에 둬도 된다」 고만 해서 팔째 빠졌고, 두 손을 다 올린 가까운 컷에서 한 팔이 몸에서 떨어졌다
- lib/prompt-spec.js — CROP(버전1 · 2) 끝에 「두 어깨와 위팔은 보이고 가장자리 너머로 이어진다 — 팔 없는 몸통 금지」, HANDS(버전2) 「손은 팔뚝 너머로 화면을 벗어나도 되지만 팔 없이 떠 있지 않는다」, HAND TASK 「손은 팔 · 어깨에 이어진다」. tests/prompt-engine.cjs 일상 낱말 상한 660 → 670
- data/casual-tree-v2.json — 「화면 밖」 손 문장을 「프레이밍 아래로 낮게 — 그 팔이 어깨에서 화면 밖으로 내려간다」 로. 추천 wave_chest 왼손 가슴 → 화면 밖, recline_head 가슴 위 → 허리 위
- lib/casual-tree-v2.js(공용) · tools/casual-tree-v2.py — 가슴 위 · 얼굴 클로즈업에서 두 손을 다 올리면(얼굴 · 가슴 · 머리 위, 또는 소품) 왼손을 못 고른다(why raised — 화면 · 랜덤 · 계획기가 같이 막는다). lib/words.js 낱말 raised. 화면들 캐시 번호 arms1
- IMAGE_RULES.md 팔·다리·손 점검의 「세기」 — 가까운 컷은 두 어깨에서 위팔이 이어져 나가나 본다. 팔 없는 몸통 · 떠 있는 손은 틀린 것

## 2026-11-09 · claude · 얼굴 설계표 — 긴 얼굴 특징은 둘까지(159종 다시 고름)
- 사용자 「설계표도 다시 짜줘」 — tools/face-design.py compatible: 길쭉한 얼굴형 · 긴 길이 · 긴 턱끝 · 좁은 폭 가운데 둘까지(LONG_MAX). relong 명령 — 셋 이상 겹친 종만 build 와 같은 점수(원작 단서 + 지금 값 가산점) · 같은 겹침 규칙(같은 계열 셋 이상 · 전체 둘 이상 다름)으로 가장 덜 옮기는 얼굴로. 머리 · 인상 · 다른 종은 그대로(그림 저장소 2 의 작업 트리에 기록이 없어 build 대신)
- data/face-design.json — 159종 다시 고름(adjusted 에 무엇을 옮겼는지). 길쭉한 얼굴형 138 → 71 · 긴 턱끝 142 → 52 · 긴 길이 210 → 198. docs/CHARACTER_FACE_DESIGNS.md 다시 그림(원칙 한 줄). tests/face-design.cjs 긴 얼굴 특징 둘까지

## 2026-11-09 · claude · 긴 얼굴 누그러뜨리기 — FACE 줄 「살짝 긴」 · 「늘어나지 않게」
- 사용자 「너무 긴 얼굴은 길이를 좀 줄이자. 약간 기괴해지네」 — 1,025종 중 159종이 긴 길이 · 길쭉한 얼굴형 · 긴 턱끝(· 좁은 폭)을 셋 이상 겹쳐 받았다
- lib/prompt-spec.js FACE_SOFT · FACE_LONG_NOTE, lib/prompt-anthro.js faceItems — 자료 값은 그대로 두고 FACE 줄 낱말만 elongated → softly elongated · long → slightly long · long chin with defined jaw → defined jaw with a slightly longer chin, 하나라도 있으면 첫 묶음 뒤 「only gently longer than average, never stretched or gaunt」. tools/face-design.py face_line 같은 줄 · 원칙 한 줄 · docs/CHARACTER_FACE_DESIGNS.md 다시 그림. prompt.html 스크립트 판(face2)
- 깨비드릴조 · 나인테일로 확인 — 등록 ① 보다 턱끝 · 아래 얼굴이 짧아졌다

## 2026-11-09 · claude · 인상 — 우수 낱말에서 「울음」 빼기 · 고스트 · 얼음 · 악 타입 쪽으로
- tools/face-design.py — 사용자 「우수는 누구야?」 → 「응 고쳐줘」: 도감 글 낱말 「울음」이 울음소리(삐삐 · 왕구리 · 델빌 · 헬가 · 동챙이)를 슬픔으로 잡았다. 슬픔 낱말은 슬프 · 슬픔 · 외로 · 고독 · 눈물만. 우수 타입 점수 고스트 1.2 → 1.5 · 얼음 .8 → 1.2 · 악 .5 → 1
- 우수 7종 → 24종(대부분 고스트, 약어리 · 조로아크는 도감 글). data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md 다시 고름 · 그림

## 2026-11-09 · claude · 인상 — 사나움 줄이기(4% 상한) · 점수 차 큰 종부터
- tools/face-design.py — 사용자 「사나움을 많이 줄여줘」: 분위기 사나움 상한 12% → 4%(IMP_CAP_VIBE, 123종 → 41종). 상한이 있는 분위기는 도감 번호 차례가 아니라 그 분위기가 가장 뚜렷한 종(첫째 · 둘째 점수 차)부터 자리를 준다 — 번호 차례면 사나움 41자리가 1~4세대에 몰렸다(지금 1~9세대에 퍼짐). 다른 종 분위기도 일부 바뀌었다(거북왕 우아함 · 꼬부기 · 깨비참 밝음)
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md 다시 고름 · 그림. tests/face-design.cjs 사나움 4% 상한

## 2026-11-09 · claude · 얼굴 다양화 — 화풍 문장의 얼굴 묘사 빼기 · 인상(나이감 · 분위기 · 눈 색) 자동
- 사용자 「pkm쪽 얼굴 느낌을 지금보다 다양화 할 수 없을까?」 → 「문장은 지금 화풍키에 넣어줘. 인상은 자동으로 해줘」 — 등록 ① 열두 명이 머리색 말고는 같은 얼굴이었다
- lib/prompt-spec.js — anime_25d_gloss 화풍 문장(메카 · 일상)의 「large expressive eyes … small simplified nose and mouth … compact tapered jaw」 를 「her own FACE line — not one shared default face」 로(그 말이 모든 종의 FACE 줄을 이겼다). IMPRESSION_AGES · IMPRESSION_VIBES(분위기 열넷 — 눈빛 · 아이라인), PROMPT_LINES.impression
- lib/prompt-anthro.js — impressionLine: 새 인물(경장 ①)에만 FACE · HAIR 뒤 IMPRESSION 줄, 얼굴 설계를 끄면 빠지고 눈 색을 직접 고르면 눈 색만 빠진다
- tools/face-design.py — impression(종의 타입 · 가장 높은 능력치 · 진화 단계 · 희귀 · 도감 글 낱말 → 분위기, 한 분위기 12% 상한 · 진화 단계 → 나이감 · 도감 색 → 눈 색), build 도 같이, check · 문서에 인상 칸. data/face-design.json faces[].impression · docs/CHARACTER_FACE_DESIGNS.md 다시 그림
- IMAGE_RULES.md — 얼굴 설계 절에 인상 줄. prompt.html — 스크립트 판(face1). tests/face-design.cjs(인상 자료 · 줄 자리 · 끄기 · 눈 색) · prompt-engine.cjs(화풍 문장에 얼굴 묘사 없음)
- 거북왕(온화 · 20대 후반) · 깨비참(사나움 · 초반) · 꼬부기(쿨함 · 초반)로 확인 — 등록 ① 과 견줘 얼굴 인상이 갈렸다. 이미 등록된 그림은 그대로

## 2026-11-09 · claude · 일상컷 옷 자유 컷 — 우리 옷 목록(outfit-catalog.md) 밖으로
- 사용자 「일상컷도 우리쪽 의상자료를 참고하라고해서 여기 없는걸 선택하라고 하자」 — lib/prompt-spec.js OUTFIT_FREE(삼국지와 같은 글 — 묶음의 outfit-catalog.md 를 읽고 거기 없는 옷을 Outfit 줄에 써 넣는다), tools/prompt-pack.cjs 가 outfit-catalog.md(옷 계열 · 옷 전부)를 쓰고 INDEX 안내. IMAGE_RULES. prompt.html 판 ofree2

## 2026-11-09 · claude · 일상컷 옷 자유 컷 두 장 — 우리 옷 계열에 없는 것 위주로
- 사용자 「element, pkm 쪽도 넣어주고. 포켓몬은 지금 일상9장이니까 2장정도 분배해줘도 되겠다」 · 「포켓몬쪽은 일상컷만」 · 「gpt나 너한테 맡긴다면 지금 우리쪽 갈래나 의상 등 없는거 위주로 … 최대한 없는걸로」 — ① 은 그대로(우리 설계 한 장)
- lib/prompt-spec.js OUTFIT_FREE(삼국지와 같은 글 — 노출 의상 주문 · 우리 계열 목록에 없는 꼴 먼저). lib/prompt-anthro.js 장면 칸 ofree 면 Outfit 줄이 그 주문, Outfit colours · Cut 줄 없음. lib/prompt-state.js PLAN_V2 ofree
- lib/casual-plan.js chooseOfree — 아홉 장이면 두 장(필수 셋 · 코스튬 · 상황 · 얼굴 클로즈업이 아닌 컷, 이미 만든 컷의 옷 자유는 센다), 옷 색 비움. tools/casual-ledger.py 옷 자유 두 장 검사 · 예약 칸 ofree. tools/prompt-pack.cjs INDEX 안내
- 검사 casual-plan · casual-plan-v2 · casual-ledger · prompt-pack. 문서 IMAGE_RULES. prompt.html 스크립트 판 ofree1

## 2026-11-09 · claude · 일상컷 아홉 장 · 상황 노출 필수 · 삼국지 쪽 계열 · 옷 · 장소 옮기기
- 사용자 「포켓몬쪽에도 삼국지쪽이랑 비교해서 없는 갈래들이랑 의상들 있으면 추가해줘. 일상컷 룰에 '상황으로 만들기'를 필수로 넣어주고, 거기는 일상컷 생성 수를 9장으로 맞춰줘」
- data/casual-tree.json · casual-tree-v2.json — 삼국지 공방에서 계열 셋(동탄룩 · 모험가 · 신화 드레이프 — 지금 · 그 해 · 포켓몬 세계 · 무대·환상 시대에 맞게), 같은 계열의 없던 옷 46벌(평상복 · 란제리풍 네글리제 · 실크 파자마 · 운동복 · 전통 · 역할극 바텐더 · 오피스룩 · 레이싱 모델 …), 장소 열여덟(사무실 · 다이너 · 공항 · 녹음실 · 목장 · 해적선 · 정글 유적 · 오아시스 · 대리석 신전 · 목욕궁 · 하늘 정원 · 물속 궁 · 얼음 궁 …, 역사의 자리 · 세계 안은 삼국지 몫이라 뺐다). 옷 계열 17 → 20, 옷 → 351, 장소 135 → 153. situ_required 표
- lib/prompt-spec.js SITUATIONS(젖은 옷 · 바람에 날림 · 반쯤 푼 차림 · 흘러내린 어깨끈, 삼국지와 같은 글) · SITU_NOT_FRAMES, lib/prompt-anthro.js 일상컷 Cut 줄 다음 「Situation: right now — …」(맞는 옷에만 · 코스튬 컷 빼고), lib/prompt-state.js · lib/prompt-ui.js · lib/words.js 생성기 「상황」 칸(계획 값이면 잠김)
- lib/casual-plan.js — CUTS 9(MID_CUTS 7 · LEGACY_CUTS 3), chooseSitu: 필수 셋 · 코스튬 · 얼굴 클로즈업이 아닌 컷 가운데 그 옷에 맞는 상황 하나(최근에 덜 쓴 상황부터, 버전1 · 2 모두). 다시 채우기 장수는 refillCount(등록 시각이 NINE_SINCE 앞이고 7번까지면 일곱 장). tools/casual-plan.cjs --avoid situ
- tools/casual-ledger.py — 아홉 장 · 상황 노출 한 장(필수 · 코스튬 · 얼굴 클로즈업 컷이 아닌) 검사, 예약 칸 situ. tools/prompt-pack.cjs settings version 3 = 열 자리(②~⑩), version 2 여덟 자리 그대로, 일상 칸 situ none(막혔을 때만, exposure_why). tools/image-runner.py 새 차례 slot_set light9(일곱 장 차례 light7 그대로)
- 문서 IMAGE_RULES(3절 표 · 아홉 장 · 상황 노출 · 필터 순서에 상황 빼기) · AGENTS · docs/IMAGE_AUTOMATION. 검사 casual-plan · casual-plan-v2(상황 넷 · 새 계열) · casual-ledger · prompt-pack · image-runner

## 2026-11-08 · claude · 메카 컨셉 명령줄 도구를 지웠다
- tools/concept-mecha.cjs — 지웠다(사용자 「도구 안쓰면 지워줘」 — 생성기 · 지시문 묶음으로만 만든다)
- lib/concept-mecha.js — 도구만 쓰던 지시문 조립(build · faceText · fxText · generatorFigure · extraLines)을 뺐다. 생성기 옵션 줄(lines) · 지시문 묶음 자동 고르기(make · choose)는 그대로
- data/concept-mecha.json — 도구 몫(template · styles · style_default · card_figure · hands_rest)을 뺐다. 실루엣 · 부품 · 타입 표현 · 타입 추천 · 종 · 자동 초안은 그대로
- docs/CONCEPT_MECHA.md · AGENTS.md · lib/prompt-spec.js(주석) — 메카 옵션 표 설명으로
- tests/concept-mecha.cjs — 도구 대신 조립부를 직접 본다(표 · 자동 · 직접 고르기 · 타입 표현 · 배치 · 자동 초안 · 옵션 줄 자리 · 도구 없음)

## 2026-11-08 · claude · 새 화풍 키 애니 2.5D 광택(anime_25d_gloss) — 기본 화풍
- lib/prompt-spec.js · data/style.json — 피부 광택 문장을 새 키 anime_25d_gloss(애니 2.5D 광택)로 옮기고 anime_25d 는 광택 전 문장으로 되돌렸다(사용자 「새 화풍키로 등록해줘. 그래야 도감에서 안겹치겠다」 — 광택 전에 등록한 anime_25d 그림 22명 174장과 도감에서 갈린다). 기본 화풍 = anime_25d_gloss. 두 문장은 앞 커밋의 것과 글자까지 같다
- tools/image-runner.py · tools/prompt-pack.cjs · IMAGE_RULES.md — 새 차례 · 여덟 자리 기본 화풍, 기준 화풍 문장. prompt.html — 스크립트 판(gloss25dkey1)
- tests/prompt-engine.cjs · prompt-pack.cjs · prompt-screen.cjs · image-runner.py · styles.cjs — 화풍 18가지 · 기본 화풍 · 광택은 새 키에만 · 장갑 말 없는 화풍은 두 문장이 같다

## 2026-11-08 · claude · 일상컷 — 화풍 문장 · 설계표 체형(첨부 ① 은 얼굴 · 머리만)
- lib/prompt-anthro.js — 일상컷 STYLE 줄을 「첨부 그림 렌더링 그대로」 대신 그 화풍 문장(CASUAL_STYLE_CORES — 메카컷 문장에서 장갑 말만 뺀 것)으로(사용자 「메카컷에 쓰인 화풍 문구를 붙여서」). BODY LINE 대신 BODY TYPE — 설계표 체형 문구(카드의 body type, 없으면 CARD_FIGURE), 첨부 ① 은 갑옷이 몸을 가리니 몸은 이 줄에서(사용자 「첨부는 하고, 몸매만 따로 적자」). FACE 줄 · 첨부는 그대로. 꼬부기 애니 2.5D 일상 4 · 6 으로 확인(5 링 비키니는 안전 필터에 막혔다)
- lib/prompt-spec.js — CHARACTER 줄 「몸 비율」 대신 「몸매는 BODY TYPE」, WARDROBE 세 줄 「첨부에서 얼굴 · 머리만」. prompt.html — 스크립트 판(casualbody1)
- IMAGE_RULES.md — 일상컷 몸 · 화풍 문장
- tests/prompt-engine.cjs · styles.cjs · prompt-pack.cjs · prompt-screen.cjs — 일상컷 STYLE = 그 화풍 문장, BODY TYPE · 카드 체형 · 얼굴 · 머리만

## 2026-11-08 · claude · 애니 2.5D 디테일 — 피부 광택
- lib/prompt-spec.js — anime_25d 화풍 문장(메카컷 · 일상컷): 하이라이트 절제는 옷(메카컷은 옷과 장갑)에만, 피부엔 어깨 · 쇄골 · 가슴 · 팔 · 허벅지의 매끈하고 밝은 광택(젖거나 기름지지 않게)(사용자 「2.5d에 피부광택만 좀 추가해볼래?」 · 「일상컷에도 넣고」). 일상컷은 첨부 ① 의 렌더링을 따르므로 ① 의 광택을 이어받는다. 꼬부기 ① · 일상 3장으로 확인
- prompt.html — 스크립트 판(gloss25d1)

## 2026-11-08 · claude · 메카컷 — 바디슈트처럼 보이던 장갑을 단단한 판으로
- lib/prompt-spec.js — 경장 FORM 줄: 가슴판 · 배 마디 판 · 어깨 · 팔 · 골반 · 허벅지 · 무릎 · 정강이 · 부츠까지 얇은 판이 몸 대부분을 덮고 슈트는 관절 틈에만(얇고 몸에 붙는 것 · 체형은 그대로, 노출은 EXPOSURE 줄이 연다). 새 ARMOR 줄 — 두께 · 모서리 · 패널 선 · 통풍구 · 센서 빛이 있는 단단한 기계 판, 천에 그린 무늬 · 무늬 바디슈트 아님(사용자 「메카 이미지가 조촐 — 바디슈트만 입은 느낌」). 새 화풍(애니 광택 · 애니 2.5D)의 STYLE 엔 기계 말이 없어 장갑이 천처럼 그려졌다. 꼬부기 · 피카츄 애니 2.5D 로 전후 확인
- lib/prompt-anthro.js — ARMOR 줄을 FORM 줄 바로 뒤에(경장 · 중장 · 고기동, 새 인물 · 이어가기). 일상컷 · 개방은 그대로
- data/concept-mecha.json — 실루엣 slim_suit 를 「슬림 밀착 장갑형」, 문장의 bodysuit 를 plate armor 로(몸통 판까지)
- docs/PROMPT_REWRITE.md — 경장 낱말 · prompt.html — 스크립트 판(armor1)
- tests/prompt-engine.cjs · face-design.cjs · concept-mecha.cjs · concept-mecha-screen.cjs — ARMOR 줄 자리 · 경장 판 · 낱말 상한(앵커 +105, 이어가기 +56)

## 2026-11-08 · claude · 메카 폼 노출 두 곳 · 막히면 노출 한 단계씩 낮춰 재시도
- 사용자 「pkm쪽도 삼국지처럼 장갑 일부 여는 식으로 바꿔줘」 — lib/prompt-spec.js MECHA_OPENINGS · MECHA_EXPOSE, lib/prompt-anthro.js mechaOpenings · mechaExposure: 네 곳(어깨 · 위팔 / 가슴 창 / 허리 / 허벅지) 가운데 종 이름 해시로 두 곳, ① · ② · ③ 같은 곳, 끝은 「intimate areas covered」. 낱말 예산 검사(prompt-engine · face-design)를 그만큼(+30~35) 올렸다.
- 사용자 「pkm쪽도 막히면 낮춰서 재시도로 룰 바꿔줘. 삼국지쪽에 맞게」 — tools/prompt-pack.cjs 에 자리별 exposure(moderate · low) · exposure_why(막힌 사유 없으면 build 멈춤): 일상은 skin_exposure, 메카 폼은 열린 곳 두 곳 → 한 곳 → 없음. IMAGE_RULES 3절 7 순서(같은 지시문 한 번 → 노출 한 단계씩 → 계획기로 장면 다시), 1절 · 6 검수 · IMAGE_AUTOMATION · INDEX.md 첫머리 맞춤. tests/prompt-pack.cjs 가 사유 · 단계를 막는다.

## 2026-11-08 · claude · 프롬프트 임의 수정 금지 — 이미지 모델에도 · 노출은 세션이 줄이지 않는다
- 사용자 「pkm쪽에도 프롬포트 임의 수정 금지 조항이랑 위에처럼 지시문 등도 pkm쪽에 맞춰서 추가해줘」 — 삼국지 공방과 같은 날 같은 규칙을 pkm 꼴로.
- IMAGE_RULES.md 1절 — 고쳐도 되는 사유(settings 고친 뒤 build · 3절 7 계획기 다시 계획 · 3절 6 같은 지시문 재생성 · 사용자가 시킨 부분 고치기)만, image_gen 에도 글 그대로(submitted 0 일 때만), 고정값 · 노출 줄을 세션이 누그러뜨리지 않는다. 3절 6 노출 항목에 qa.json exposure(match · weaker · stronger + 근거).
- docs/IMAGE_AUTOMATION.md 「생성과 검수」 · tools/prompt-pack.cjs INDEX.md 첫머리에 같은 두 줄 — tests/prompt-pack.cjs 가 막는다.

## 2026-11-08 · claude · 기준 화풍 애니 2.5D 디테일(anime_25d)
- lib/prompt-spec.js — DEFAULT_STYLE 을 anime_25d 로(사용자 「기본 화풍 바꿔줘」). 생성기 화면 처음 값 · 지시문 묶음 init 이 따라간다. 이미 저장된 카드 · 시작한 캐릭터의 화풍은 그대로
- tools/image-runner.py · tools/prompt-pack.cjs — 새 차례 · 여덟 자리 기본 화풍 anime_25d
- IMAGE_RULES.md — 기준 화풍 문장
- tests/prompt-engine.cjs · prompt-pack.cjs · image-runner.py — 기본 화풍 기대값

## 2026-11-08 · claude · 새 화풍 애니 2.5D 디테일(anime_25d)
- lib/prompt-spec.js · data/style.json · prompt.html — 사용자가 붙여 준 「CHARACTER RENDERING STYLE ONLY」 문장을 그대로 화풍 anime_25d(애니 2.5D 디테일)로 더했다(갑주 · 일상 같은 문장). 꼬부기 메카컷 · 일상 2장으로 확인. 기본 화풍은 그대로 anime_gloss
- tests/prompt-engine.cjs · prompt-screen.cjs — 화풍 17가지

## 2026-11-08 · claude · 기준 화풍 다시 애니 광택(anime_gloss)
- lib/prompt-spec.js — DEFAULT_STYLE 을 anime_gloss 로(사용자 「화풍 기준키 다시 이걸로 바꾸자」 — 애니 광택 꼬부기 ① + 일상 7장을 보고). 생성기 화면 처음 값 · 지시문 묶음 init 이 따라간다. 체형 · 7.5등신 · BODY LINE 은 그대로
- tools/image-runner.py — 새 차례의 화풍 anime_gloss
- data/concept-mecha.json · tools/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 메카 컨셉 도구 기본 화풍도 anime_gloss
- IMAGE_RULES.md · tools/prompt-pack.cjs — 기준 화풍 문장. 광택 자연광으로 시작한 캐릭터(이상해씨)는 그 화풍으로 이어 간다
- tests/prompt-engine.cjs · prompt-pack.cjs · concept-mecha.cjs · image-runner.py — 기본 화풍 기대값

## 2026-11-08 · gpt · 이상해씨 일상 6번 최종 승인본 반영
- data/img.json — 정본 얼굴을 다시 적용한 앉은 구도·은은한 미소의 최종 승인본으로 일상 6번만 교체하고 반영 시각을 갱신했다.

## 2026-11-08 · gpt · 이상해씨 일상 2번 팔 연결 수정
- data/img.json — 사용자 검토를 통과한 낚싯대 팔 수정본으로 일상 2번만 교체하고 반영 시각을 갱신했다. 일상 6번은 검토 중으로 게시하지 않았다.

## 2026-11-08 · gpt · 이상해씨 최신 생성기로 8장 재생성
- data/img.json — 수정된 slim 허리·완만한 골반선·7.5등신 생성기로 메카 1장과 일상컷 7장을 교체하고 반영 시각을 갱신했다. 기존 파일명·화풍별 목록은 보존했다.

## 2026-11-07 · gpt · 이상해씨 광택 자연광 8장 등록
- data/img.json — gloss_daylight 메카 1장과 일상컷 7장을 새 화풍으로 추가. 기존 그림을 보존하고 원격 파일 목록으로 대조했다.

## 2026-11-07 · claude · 메카 컨셉 도구 — 애니 광택 · 광택 자연광도 생성기와 같은 체형 · 7.5등신
- data/concept-mecha.json(card_figure · styles.*.figure) · lib/concept-mecha.js(build) — 애니 광택 · 광택 자연광 화풍이면 종별 FIGURE 대신 생성기 ① 체형(CARD_FIGURE 와 같은 글)과 「about 7.5 heads tall with her head in proportion to her body」. mmorpg2d · jp25d 는 종별 체형 그대로. 생성기 · 지시문 묶음(① 체형 · ANATOMY · 일상 BODY LINE)은 화풍과 상관없이 이미 같은 문장이다. 사용자 「애니광택에도 메카컷이랑, 일상컷 몸매관련된 것만 수정해줘」
- tests/concept-mecha.cjs — 두 화풍의 체형 · 같은 글 대조

## 2026-11-07 · claude · 체형 문장 고침 — 허리 slim · 골반에서 허벅지로 매끄럽게 · 7.5등신
- lib/prompt-spec.js(CARD_FIGURE · ANATOMY) · lib/prompt-anthro.js(일상 BODY LINE) · prompt.html — 허리 「very slim, tightly cinched」 → 「slim」, 「허벅지 위쪽만」 대신 골반에서 허벅지로 매끄럽게 이어져 무릎 쪽으로 서서히 좁아지게(골반 아래에서 갑자기 좁아지지 않게), 「long slender lower legs」 의 long 을 뺐다. ANATOMY 에 「about 7.5 heads tall, her head in proportion to her shoulders and body」. 사용자 「머리는 크고 몸이 너무 작게 나왔어」 · 「허벅지 위라고만 했더니 몸 라인이 골반 상단부에서 급격히 줄어들어서」 · 「긴몸통과 다리 문구는 자칫 위험할거 같아」 · 「허리는 slim으로」
- IMAGE_RULES.md 3절 · tests/prompt-engine.cjs(앵커 425 → 440 · 1025종 445 → 460) · tests/face-design.cjs(490 → 505)

## 2026-11-07 · claude · 메카 컨셉 도구 기본 화풍도 광택 자연광
- data/concept-mecha.json · tools/concept-mecha.cjs — 화풍 gloss_daylight(광택 자연광 — 생성기와 같은 STYLE 문장, 첫 줄 · 끝맺음)을 더하고 기본(style_default)으로. 애니 광택 · mmorpg2d · jp25d 는 --style 로 남는다. 사용자 「기본 화풍도 바꿔줘. 지금 만든걸로」 — 생성기 · 지시문 묶음 · 관리기는 바로 앞 칸에서 이미 바뀌었다
- tests/concept-mecha.cjs · tools/prompt-pack.cjs(설명 글)

## 2026-11-07 · claude · 기준 화풍 광택 자연광(gloss_daylight) · ① 체형 · 일상컷 몸 라인 — 꼬부기 초안 4 그대로
- lib/prompt-spec.js · data/style.json · prompt.html — 새 화풍 gloss_daylight(광택 자연광 — 자연광 · 피부의 강한 광택 하이라이트 · 진한 색과 금 테두리 · 색이 들어간 부드러운 선 · 낮 빛망울 배경)을 기본(DEFAULT_STYLE)으로. 애니 광택은 그대로 남는다(이미 그 화풍인 캐릭터). ANATOMY 줄의 「No body-part enlargement」 를 뺐다. CARD_FIGURE — ① 체형 문장(흉부 은은하게 · 허리 아주 가늘게 · 골반 넓게 · 허벅지 위쪽만 약간). 사용자(첨부 그림 화풍 → 꼬부기 초안 1~4) 「이대로 고정해줘」
- tools/prompt-pack.cjs — 여덟 자리 기본 화풍 = gloss_daylight, ① body type 은 모든 종 CARD_FIGURE(종별 체형 문장 대신)
- lib/prompt-anthro.js — 일상컷(버전1 · 2) FACE 줄 다음에 「BODY LINE: keep her figure from the attached image and show its line slightly emphasized — …」
- tools/image-runner.py — 새 차례의 화풍 gloss_daylight
- IMAGE_RULES.md 1 · 3절 · tests/prompt-engine.cjs(화풍 16 · 기본 · ANATOMY · 일상 예산 580 → 640) · prompt-screen.cjs · prompt-pack.cjs · image-runner.py

## 2026-11-07 · claude · 피부 노출 「많이」 문장은 예전 그대로
- lib/prompt-spec.js · IMAGE_RULES.md — 바로 앞 칸에서 바꾼 bold 문장(전체 · 가까운 컷)을 되돌렸다. 깊은 목선 드러내기와 「Cut」 줄은 그대로. 사용자 「노출 많이도 우선은 놔둬줘」

## 2026-11-07 · claude · 일상컷 의상 — 몸매가 드러나는 깊게 파인 옷
- lib/casual-plan.js — 드러내는 방식에 깊은 V넥 · 스위트하트 넥 · 등 전체가 트인 · 허리 컷아웃을 더하고, 컷마다 첫째는 깊게 파인 목선(플런징 · 깊은 V · 스위트하트), 둘째는 목선이 아닌 것. 사용자 「일상컷 의상들을 더 몸매가 드러나는 파인 의상들로 설정 변경해줘」
- lib/prompt-anthro.js · lib/prompt-state.js · lib/prompt-ui.js · lib/words.js · prompt.html — 그 두 방식을 지시문 「Cut: … — a figure-hugging fit that follows her curves; chest and pelvis stay securely covered.」 줄로(버전1 · 2, 옷 직접 쓰기 글이 없어도), 생성기 주소 · 계획 칸에 expose(잠금), 일상컷 화면에 「드러내는 곳」 안내
- lib/prompt-spec.js — 피부 노출 bold 문장(전체 · 가까운 컷)을 「low-cut, figure-hugging … a deep neckline …; chest and pelvis stay securely covered」로
- tools/casual-ledger.py — 기록에서 expose 를 읽는다
- IMAGE_RULES.md 3절 · tests/casual-plan.cjs(컷마다 목선) · casual-plan-v2.cjs(목록 칸 비교)

## 2026-11-07 · claude · 도감 — 화풍을 고르면 그 화풍에 그림이 없는 카드는 「이 화풍 그림 없음」 칸으로
- lib/dex-filter.js · dex.html · lib/words.js — 화풍을 고르면 모든 카드가 나오고, 그 화풍(과 고른 폼 · 컷)에 그림이 없는 카드는 점선 빈 칸 「이 화풍 그림 없음」(밑에 화풍 이름 · 「비어 있음」). 다른 화풍 그림으로 채우지 않는다. 빈 칸을 열면 자세히 보기에 「〈화풍〉 그림은 아직 비어 있어요 — 다른 화풍을 보여 줍니다」. 폼만 고른 거르기는 그대로. 사용자 「도감에서 화풍 별로 셀렉트할때, 그 화풍에 빈 그림은 비어있다고 표시해줘」
- tests/dex-filter.cjs — 빈 화풍은 모든 카드가 빈 칸(그 화풍 열쇠), 채운 칸 + 빈 칸 = 목록

## 2026-11-07 · claude · ① 체형 — 메카 컨셉의 종별 체형 문장 · 경장 폼 줄은 장갑만 가늘게
- tools/prompt-pack.cjs · lib/concept-mecha.js(generatorFigure) · data/concept-mecha.json(auto.figure.full) — 여덟 자리 ① 의 외형 칸 body type 에 메카 컨셉의 종별 체형 문장. 통통한 체형(auto.figure.soft · 손글의 plump)은 한 단계 아래 full(「a full-figured, softly curvaceous figure …」). 메카 컨셉 도구의 체형은 그대로. 사용자 「이전이랑 비교해서 몸매 볼륨이 좀 줄었네」 → 「통통체형은 빼고 한단계 아래로 설정해서 둘 다 해줘」 — 어제 꼬부기 · 파이리 · 이상해씨(메카 컨셉 도구)엔 체형 줄이 있었고 생성기 ① 엔 없었다
- lib/prompt-spec.js · prompt.html — 경장 폼 줄 「a slim readable outline」 → 「the armor's outline stays slim and readable without slimming her figure」(생성기로 만드는 모든 경장 ①)
- IMAGE_RULES.md 3절 · tests/prompt-pack.cjs · tests/face-design.cjs(앵커 예산 480 → 490)

## 2026-11-07 · claude · 일곱 장 자유 컷 — 의상 계열이 서로 다르게 · 새 값은 바로 앞 캐릭터와
- lib/casual-plan.js — 일곱 장이면 이 캐릭터가 이미 쓴 의상 계열(일상복 포함)에 큰 감점, 자유 컷은 아직 안 쓴 계열이 있는 길 · 장소에서 고른다(뮤츠 시험 자유 셋이 다 일상복 — 사용자 「응」). 새 값(방향 · 프레이밍 · 옷 종류) 비교는 바로 앞 캐릭터 하나 — 배치 안이면 배치에서 바로 앞(세 명 배치에서 스물한 컷이 값을 다 써 계획이 안 나왔다). 세 장 규칙은 그대로
- tools/casual-ledger.py — 일곱 장 자유 컷의 의상 계열이 겹치면 건다, 새 값 비교는 차례대로 바로 앞 캐릭터
- IMAGE_RULES.md 3절 · tests/casual-plan.cjs · casual-plan-v2.cjs · casual-ledger.py — 자유 컷 계열 겹침 없음(시험 판의 자유 컷 하나를 직장 계열로)

## 2026-11-07 · claude · 일상컷 옷 색 — 계획기가 컷마다 정한다
- lib/prompt-spec.js — 옷 색 열둘(OUTFIT_COLORS — 한글 이름 · 지시문 영어 · 알아보는 낱말 · card.json color 짝). 사용자 「의상색도 정해줘」
- lib/casual-plan.js · tools/casual-plan.cjs — 3b 단계 옷 색(ocolor): 옷 문장이 색을 정하면 그 색, 아니면 이 캐릭터에 아직 안 쓴 색 가운데 최근 열 명에서 덜 쓴 것, 그 종의 대표 색은 피한다. 코스튬 컷은 없음. 생성기 주소 · 버전2 칸 · --avoid 칸에 ocolor
- lib/prompt-anthro.js · lib/prompt-state.js · lib/prompt-ui.js · lib/words.js · prompt.html — 지시문 Outfit 줄 다음 「Outfit colours: …」(버전1 · 2, 코스튬 컷 빼고), 계획 값은 잠근다, 일상컷 「옷 색」 칸
- tools/casual-ledger.py — 기록 · 예약에 ocolor, 같은 색 세 컷 이상이면 건다
- tools/prompt-pack.cjs — 일상 안내 · 차례표에 옷 색, 옷 직접 쓰기 글에 계획 색 낱말이 없으면 고칠 칸
- IMAGE_RULES.md 3절 · tests/casual-plan.cjs · casual-ledger.py · prompt-pack.cjs — 옷 색 규칙 · 검사

## 2026-11-07 · claude · 일곱 장 일상컷 — 드러내는 방식 · 옷 종류가 한 캐릭터 안에서 되풀이되지 않게
- lib/casual-plan.js — 드러내는 방식: 후보가 다 돌면 처음으로 돌아가던 것을, 이 캐릭터에 덜 쓴 방식부터 · 같은 짝은 한 번만(가디 일곱 장 중 넷이 「트인 등 + 원숄더」 — 사용자 「응 고쳐줘」). 옷 종류: 이 캐릭터가 이미 입힌 종류에 점수를 더 줘 같은 옷(뮤츠 시험 셔츠 + 반바지 셋)이 되풀이되지 않게. 버전1 · 버전2 모두
- tools/casual-ledger.py — 일곱 장 계획에 같은 드러내는 방식 짝이 두 컷이면 건다
- tests/casual-plan.cjs · casual-plan-v2.cjs · casual-ledger.py — 드러내기 짝 겹침 없음 · 한 방식 세 장까지 · 같은 짝은 걸린다

## 2026-11-07 · claude · 시험 셋을 지금 지시문에 맞춤 — 액션 카드 줄 · 앵커 예산 · 일상컷 화풍 줄
- tests/prompt-action.cjs · tests/face-design.cjs — 2026-11-06 ① · 이어가기 카메라 수평 3/4(f46e651)가 바꾼 card 줄(「face toward the camera」 → 「face turned gently three-quarters toward the camera」, 「Camera level with her face」)을 보고, 앵커 예산 460 → 480(그 줄이 약 20낱말 늘었다 — 가장 긴 Walking Wake 477). 그 커밋에서 같이 고쳤어야 했다
- tests/styles.cjs — 일상컷은 2026-11-03 부터 화풍을 첨부 그림에 맡긴다(REF_STYLE) — 공방 화풍 문장 대신 그 줄을 본다

## 2026-11-07 · claude · 생성기 화면 기본 화풍 — 애니 광택(anime_gloss)
- lib/prompt-spec.js · prompt.html — DEFAULT_STYLE glossy_promo → anime_gloss. 새로 여는 카드 · 화풍을 안 고른 지시문이 애니 광택. 이미 저장된 카드의 화풍은 그대로. 사용자(화면 기본값도 바꿀까?) 「응 바꿔줘」
- tools/prompt-pack.cjs — 여덟 자리 기본 = 화면 기본, 아홉 자리(--legacy)는 그때 기본 glossy_promo 그대로
- IMAGE_RULES.md 1절 · tests/prompt-engine.cjs — 기본 화풍 문장 · 검사

## 2026-11-07 · claude · 이미지 생성 규칙 — 경장 ① 한 장(애니 광택 · 메카 실루엣 자동) + 일상컷 일곱 장(필수 셋 · 코스튬 · 자유 셋)
- IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md · docs/CONCEPT_MECHA.md · AGENTS.md — 한 캐릭터 = 경장 ① + 일상 일곱(중장 · 고기동 · 개방은 이제 안 만든다), 기준 화풍 anime_gloss, 일상 필수 갈래는 역할극 · 수영복 · 란제리풍이 한 장씩(레트로는 자유로), 필수 자리 돌리기 · 다섯 명에 두 장은 세 장 시절 규칙으로. 이미 아홉 장으로 시작한 캐릭터는 아홉 장 그대로. 사용자 「gpt 생성룰을 이제 지금 화풍(애니광택)으로 해서 경장1장만 만들자」 · 「일상컷 규칙은 기존에 필수갈래 택1에서 전체포함으로 7장으로 하자」 · 「레트로는 필수에서 빼고, 필수3 코스튬1 자유3 으로」 · 실루엣 · 효과는 「계획기 자동 — 실루엣만 + 효과 자동」
- data/casual-tree.json — 필수 갈래 roleplay · swimwear · lingerie, `legacy_outfits` retro(세 장 기록을 읽을 때만)
- lib/casual-plan.js · tools/casual-plan.cjs — 새 캐릭터 일곱 장(세 장 캐릭터 다시 채우기는 세 장 그대로): 필수 셋 한 장씩(덜 간 번호로) + 코스튬 + 자유 셋, 일곱 묶음, 방향 · 프레이밍 같은 값 두 장까지 · 같은 짝 한 장, 새 값(방향 · 프레이밍 · 옷 종류)은 바로 앞 캐릭터와, 세 축 겹침은 다섯 장 이상, 드러내기 · 첫머리는 다 돌면 다시. 버전1 · 버전2 모두. 실제 장부(세 장 캐릭터 위)에서도 check 통과
- tools/casual-ledger.py — 같은 조건으로 검사(일곱 장 · 필수 셋 한 장씩 · 같은 값 두 장 · 같은 짝), 기록 읽기 casual1~7, 세 장 다시 채우기는 옛 규칙
- tools/prompt-pack.cjs — 여덟 자리(settings version 2): 경장 ① + casual1~7, 기본 화풍 anime_gloss, ① 의 `mecha` 를 init 이 정한다(타입 추천 안에서 최근 열 명의 ① 이 안 쓴 큰 실루엣 + 타입 표현 자동, `mecha_auto` · `mecha_recent`), 바꾸면 `mecha_why`, 표에 없는 값 · 다른 타입 · 두 번은 걸린다. 아홉 자리는 `--legacy`(version 1 settings 는 그대로 아홉 자리로 build)
- tools/image-runner.py — 새 차례는 `slot_set: light7`(경장 + casual1~7, 화풍 anime_gloss), 그 전 차례는 아홉 자리 그대로. 다 찬 캐릭터 판정은 아홉 자리 또는 경장 + 일상 일곱
- tests/casual-plan.cjs · casual-plan-v2.cjs · casual-ledger.py · casual-tree.py · prompt-pack.cjs · prompt-pack-screen.cjs · image-runner*.py — 일곱 장 · 여덟 자리(화면 대조 여덟 + 아홉) · 예전 아홉 자리 차례

## 2026-11-06 · claude · 메카 실루엣 · 타입 표현을 「새 인물 만들기」 옵션으로 — 따로 있던 탭은 뺐다
- lib/prompt-ui.js · lib/words.js · prompt.html — 액션 · 새 인물 만들기에 「메카 실루엣 · 타입 표현 (선택)」 칸: 큰 실루엣 · 무게 · 부위 부품 칸마다 없음(기본) / 직접, 큰 실루엣이 정하는 칸은 막힘, 타입 표현 일곱 가지 체크(두 타입 종은 표현마다 타입), 모두 없음으로. 이어가기 · 일상컷 · 폭주에는 없다. 「메카 컨셉」 탭은 뺐다(명령줄 도구는 그대로). 사용자 「아 잘못 이해했네. 그 신규 생성에 붙여줘. 옵션값으로」
- lib/concept-mecha.js — `lines(C, types, sel)`: 고른 칸만 `MECHA SILHOUETTE:` · `TYPE EFFECTS:` 줄로(표현은 표 순서, 빈 타입은 첫 타입)
- lib/prompt-anthro.js — 새 인물 만들기 지시문의 FORM 줄 바로 뒤에 그 줄을 싣는다. 안 고르면 지금 지시문 그대로
- lib/prompt-state.js · tools/prompt-pack.cjs — 저장값 `mecha`(set · fx), 잠깐 있던 갈래 `concept` 는 액션으로. 조립부 입력에 메카 표(data/concept-mecha.json) — 지시문 묶음도 화면과 같은 글
- tests/concept-mecha-screen.cjs — 새 자리 26가지(데스크톱 · 폰) · tests/concept-mecha.cjs — FORM 줄 뒤 두 줄 말고는 그대로 · 표 없음 · 안 고름 · 이어가기
- docs/CONCEPT_MECHA.md · AGENTS.md — 자리 · 시험

## 2026-11-06 · claude · 생성기에 「메카 컨셉」 갈래 — 실루엣 · 부품 · 타입 표현 고르기
- lib/concept-mecha.js — 메카 컨셉 조립부를 도구에서 떼어 냈다(브라우저 · node 둘 다, 오류는 열쇠로). 같은 선택이면 화면과 도구가 글자 하나 다르지 않다
- lib/prompt-ui.js · prompt.html · lib/words.js — 생성기 탭 「메카 컨셉」: 컨셉 화풍, 자동 조합 씨앗 · 다른 조합, 큰 실루엣 · 부위 부품 칸마다 자동(지금 고른 값 표시) / 직접, 실루엣 · 원작 특징이 정하는 칸은 막힘, 타입 표현 자동(두 타입 섞기) / 직접(일곱 가지 체크, 두 타입 종은 표현마다 타입), 자동 초안 안내, 그 화풍 경장 그림 보기. 사용자 「생성기에 메카 실루엣 설정이랑 속성 효과 선택하는건 안넣었어?」 → 「응」
- lib/prompt-state.js — 저장값에 갈래 `concept` 와 선택값(`concept` — set · fx · mix · seed · style)
- tools/concept-mecha.cjs — 조립부를 부르는 얇은 명령줄(옵션 · 한글 오류 그대로, 지시문 바뀌지 않음)
- tests/concept-mecha-screen.cjs — 화면 = 도구 18가지(데스크톱 · 폰) · tests/prompt-screen.cjs — 화풍 수 15(앞 커밋에서 못 고친 것)
- docs/CONCEPT_MECHA.md · AGENTS.md — 자리 · 시험

## 2026-11-06 · claude · 화풍 anime_gloss(애니 광택) — 도감에서 고르는 새 화풍
- lib/prompt-spec.js · data/style.json — 화풍 열쇠 `anime_gloss`(애니 광택 — 2D MMORPG 메카 컨셉의 기본 화풍: 채도 낮은 흰색 · 은색 파스텔, 하이키 · 블룸 · 반짝이, 가는 머리 가닥, 자연광 윤기)를 ART_STYLES 끝에 더하고 세계 · 일상 화풍 줄(일상은 장갑 말 없이)을 넣었다. 기존 그림 · 기본 화풍(glossy_promo)은 그대로 — 도감 화풍 고르개에 따로 뜬다. 사용자 「이상해씨, 파이리,꼬부기 올려줘」 · 「신규 화풍으로 기존거는 두고, 도감에서 선택할 수 있게」
- tests/prompt-engine.cjs — 화풍 수 15

## 2026-11-06 · claude · 메카 컨셉 기본 화풍 — 애니 광택(자연광 윤기)
- data/concept-mecha.json — 기본 화풍 mmorpg2d → anime_gloss. anime_gloss 의 광택 문장을 젖은 스펙큘러 광택에서 야외 햇빛의 부드럽고 넓은 윤기(젖거나 기름지거나 플라스틱 같지 않게)로. 꼬부기 메카 · 일상컷 세 장을 보고 사용자 「응 이걸로 기본화풍 바꿔줘」. mmorpg2d · jp25d 는 --style 로 남는다
- tools/concept-mecha.cjs · tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 기본 화풍 · 자연광 문장 검사

## 2026-11-06 · claude · 메카 컨셉 화풍 anime_gloss(애니 광택)
- data/concept-mecha.json · tools/concept-mecha.cjs — 화풍 `anime_gloss`: 채도 낮은 흰색 · 은색 파스텔에 진한 강조색 하나, 하얗게 빛나는 하이키 조명 · 블룸 · 반짝이, 피부 · 장갑 · 스타킹 광택, 결마다 빛이 맺힌 가는 머리 가닥, 끝맺음에서 「rich … colours」 를 뺐다. 사용자가 붙여 준 은발 세일러 그림과 수치로 견주어(채도 0.16 · 대비 0.24 — 꼬부기 메카 0.38 · 0.17) 사용자 「같은 2d 인데 이런느낌이 안나네」 → 「응 해줘」
- tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 화풍 셋 · 칸 검사

## 2026-11-06 · claude · 메카 컨셉 자동 초안 — 주색은 대표 색
- tools/concept-mecha.cjs · data/concept-mecha.json — 머리색 · 장갑 주색 · 키 색을 그 종의 대표 색(source-appearance color → `auto.color_words`)으로, 팔레트는 보조색 · 장식색으로만. 꼬부기 시험 그림이 팔레트 첫 색(등딱지 갈색)으로 갈색 머리 · 갈색 장갑이 됐다. 대체 머리 문장(「… hair in shoulder-length layered hair」)도 고쳤다
- tests/concept-mecha.cjs — 꼬부기 주색 하늘색 · 머리 문장

## 2026-11-06 · claude · 메카 컨셉 자동 초안 — 1025종
- tools/concept-mecha.cjs · data/concept-mecha.json — 손글 표에 없는 종은 공방 자료로 캐릭터 칸 초안을 짓는다: 타입 · 키 · 몸무게(card.json), 얼굴 · 머리(face-design), 색 · 원작 특징(source-appearance — 생성기의 palette · wearClauses · hairItems 를 그대로 부르고 천은 판으로), 타입 표(성격 · 눈 · 배경 · 판 무늬 · 발광 색, `auto`). 원작 특징이 머리 · 등을 쥐면 그 칸은 비운다. 사용자 「다른케릭터는 설계 안되어있지?」 → 「그래」
- tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 1025종 다 지어진다 · 빈 칸 없음 · 바뀐 입는 법에 천 없음 · 손글이 이긴다

## 2026-11-06 · claude · 메카 컨셉 화풍 칸 — 2D MMORPG · 일본 2.5D
- data/concept-mecha.json · tools/concept-mecha.cjs — 화풍 칸(`styles` · `--style`): `mmorpg2d`(2D 한국 MMORPG, 기본 — 지금 글 그대로) · `jp25d`(일본 2.5D 모바일 — 사용자가 붙여 준 지시문의 화풍 문구를 첫 줄 · STYLE · 끝맺음에, 피카츄 전용 얼굴 말은 일반 말로). 피카츄로 그려 보고 사용자 「응 넣어줘」
- tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 기본은 글자 그대로 · 2.5D 는 화풍 세 자리만 다르다 · 없는 화풍 막기

## 2026-11-06 · claude · 메카 컨셉 머리끝 입자는 고를 때만
- data/concept-mecha.json · tools/concept-mecha.cjs — 타입 표현 머리끝 입자(hair)에 `manual` — 자동 후보에서 빼고 `--fx hair` 로 직접 고를 때만. 문장을 세게 해도 잠만보 시험 그림에서 거의 안 보였다. 사용자 「응 고를때만」
- tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 자동엔 머리끝이 없다 · 고르면 실린다

## 2026-11-06 · claude · 메카 컨셉 타입 표현 — 더 또렷하게 · 모양으로 가르기
- data/concept-mecha.json — 오라 · 머리끝 입자 문장을 세게(「clearly visible … bright rim」 · 「glow brightly and visibly」 — 시험 그림에서 옅었다). 타입 낱말을 색보다 모양으로 — 독 거품 · 방울(초록 기), 고스트 불꽃, 비행 바람 줄기 · 흰 깃털, 물 거품, 에스퍼 기하 문양, 페어리 별 모양, 드래곤 비늘 모양, 악 날 선 조각(고스트/독 · 물/비행을 섞어도 차이가 안 보였다). 사용자 「응 그래」
- tests/concept-mecha.cjs — 낱말 따라 고침

## 2026-11-06 · claude · 메카 컨셉 타입 표현 — 골라 싣기 · 두 타입
- data/concept-mecha.json · tools/concept-mecha.cjs — 타입 표현을 칸 둘(몸 · 주변)에서 일곱 가지 목록(`fx` — 손 · 이음새 빛 · 오라 · 머리끝 입자 · 도는 입자 · 바닥 · 자취)으로: `--fx` 로 하나만 · 여럿 · `all`, 안 주면 자동(손 + 몸 + 주변), 손을 안 고르면 두 손을 편히. 두 타입 종은 표현마다 타입(`--fx hand:flying,aura:water`) · 한 타입으로(`--fx-type`) · 섞기(`--mix`), 기본은 첫 타입. 사용자 「표현을 다 넣어도 되고, 하나만 선택해도 되는걸로. 타입이 두가지인건 선택적으로, 같은 타입 스타일로 골라도 되고, 각각 다른 스타일을 고를수도 있게」
- tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 하나만 · 다 · 손 없이 · 표현마다 타입 · 한 타입 · 섞기 · 카드=표현 · 틀린 타입 · 없는 표현 · 두 번

## 2026-11-06 · claude · 메카 컨셉 타입 표현 문장 다듬기
- data/concept-mecha.json — 발밑 바닥 효과 18 타입을 동사가 있는 온전한 문장으로, 오라는 「실루엣이 그 빛으로 둘러진다」 꼴로(관사 겹침). tests/concept-mecha.cjs — 낱말 따라 고침

## 2026-11-06 · claude · 메카 컨셉 타입 표현 — 몸 · 주변 칸
- data/concept-mecha.json — 손 효과 말고 타입 표현 칸 둘: 몸(장갑 이음새 · 관절로 흐르는 빛 · 실루엣을 두르는 오라 · 머리끝이 입자로 흩어짐) · 주변(몸 둘레를 도는 입자 · 발밑 바닥 효과 · 등 · 발꿈치 자취), 18 타입마다 빛 · 입자 · 바닥 낱말(`type_fx`). 사용자 「타입 표현을 손에 드는거 외에도 몇가지 더 추가하자」
- tools/concept-mecha.cjs — POSE AND SCENE 에 타입 표현 두 문장(첫 타입 낱말), 자동은 늘 싣고 머리끝 입자와 주변 입자 · 자취는 같이 안 고른다
- tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md — 칸 11 · 타입 낱말 18 · 뺄 수 있음 · 같은 낱말 두 번 막기

## 2026-11-06 · claude · 메카 컨셉 날개 바인더 — 겹친 장갑 패널
- data/concept-mecha.json — 날개 바인더형을 깃 모양 판에서 넓고 평평한 장갑 패널 여러 장을 관절 틀 위에 엇갈려 겹쳐 펼친 날개로(깃털 아님). 사용자 「난 판넬식으로 여러장 겹쳐서 만든다는줄」

## 2026-11-06 · claude · 메카 컨셉 날개 바인더 — 깃 모양 판
- data/concept-mecha.json — 큰 실루엣 날개 바인더형 문장: 「날개 모양 바인더 판」 → 가는 관절 틀 위에 얇게 겹친 깃 모양 판이 부채처럼 펼쳐져 끝이 가볍게 갈라지는 날개 한 쌍. 피카츄 시험에서 각진 판 두 장처럼 딱딱했다. 사용자 「아쉬운점 수정해줘」

## 2026-11-06 · claude · 2D MMORPG 메카 컨셉 — 부품 갈아 끼우기(시범)
- data/concept-mecha.json — 새 컨셉 ① 틀과 부품 칸: 큰 실루엣 18(삼국지 공방 메카 실루엣에서 — 무기 · 노출 문장만 포켓몬 규칙으로) + 무게 · 어깨 · 흉부 · 팔 · 허리·골반 · 다리·부츠 · 등 · 머리, 타입 18 추천, 피카츄 · 갸라도스 · 팬텀 · 잠만보 캐릭터 값. 사용자 「포켓몬 메카 실루엣을 생성단계에서 다양하게 부품교체하듯 갈아끼울 수 있음 좋겠는데」 · 「실루엣을 삼국지 공방 실루엣 자료에서 더 가져올 수 있으면 가져오자」
- tools/concept-mecha.cjs — 부품을 골라(자동은 타입 추천 · 씨앗, `--random` · `--set`) 전체 지시문을 짓는다. 실루엣 · 원작 특징이 정하는 칸은 부품을 빼고, 배치 안 큰 실루엣은 안 겹친다. 얼굴은 face-design 에서
- tests/concept-mecha.cjs · docs/CONCEPT_MECHA.md · AGENTS.md — 시험과 안내

## 2026-11-06 · claude · ① · 이어가기 카메라 — 수평 3/4
- lib/prompt-spec.js — `card` 줄: 「얼굴은 카메라 쪽(정면 또는 3/4)」 → 카메라는 얼굴 높이 수평, 몸과 얼굴은 완만한 3/4(등은 아님), 턱은 들지도 당기지도 않고 얼굴에 올려다보는 원근 없음. 올려다본 ①을 붙인 일상컷이 하관이 길고 턱이 무겁게 따라갔고, 정면 ①은 일상컷 고개 각도를 굳혔다(갸라도스 — 옛 · 수평 정면 · 수평 3/4 ① 비교). 사용자 「수평 정면 3/4 구도를 기본으로 하자」
- tests/prompt-engine.cjs — 카메라 줄 검사, 앵커 · 이어가기 · 1025종 낱말 상한 +25
- IMAGE_RULES.md — ① 결과 조건에 카메라

## 2026-11-06 · claude · 일상컷 FACE 줄 — 카메라 · 자세가 얼굴을 길게 · 턱을 무겁게 만들지 않는다
- lib/prompt-anthro.js — 일상컷 FACE 줄에 사용자 문장 그대로(낮은 · 높은 카메라 · 턱 괴기 · 옆모습 · 돌아보기에서도 첨부 그림의 얼굴형 · 턱 길이 · 얼굴 길이 대 폭 비율 유지), 금지 목록(Do not add …)에 「a face lengthened by the camera angle, a heavy jaw」. 원소공방 일상컷과 같은 문장. 사용자 「위 문장을 일상컷 생성기에 넣어줄래?」 · 「포켓몬에도」
- tests/prompt-engine.cjs — 일상 낱말 상한 520 → 580, 얼굴 고정 문장이 실린다

## 2026-11-03 · claude · 일상컷 얼굴 · 화풍은 첨부 그림에 맡긴다
- lib/prompt-anthro.js — 일상컷 지시문 끝에서 refLock: 화풍 문장 → 「STYLE: keep the attached image's rendering exactly …」, 나이 줄 → 「FACE: exactly the face of the attached image …」(없으면 CHARACTER 밑에), 표정 줄 끝에 「눈썹 · 눈꺼풀 · 입꼬리로만」, FINAL CHECK 줄 뺌. 사용자 「일상컷 저거 너무 이상해」 → 「이제 좀 낫네」 → 「응 다 적용해줘」 — 화풍 · 얼굴 문장을 새로 주면 GPT 세션이 첨부 그림의 얼굴을 다시 그렸다(헬륨 메카 일상)
- tests — 일상컷 화풍 · 얼굴 · 표정 줄 검사로 바꾸고 일상컷 낱말 상한을 올렸다
- IMAGE_RULES.md — 일상컷 규칙 한 줄
## 2026-11-03 · gpt · 비리디온 경장 기준 후속 이미지 화풍 교체
- docs/image-batches/virizion-restyle-20261103.md — 현재 경장 기준 중장·고기동·폼별 개방·일상 8장 교체 커밋과 실제 제출문·참조·QA를 기록했다. 기존 도감 슬롯과 주소를 유지한다.

## 2026-11-03 · gpt · 테라키온 경장 기준 후속 이미지 화풍 교체
- docs/image-batches/terrakion-restyle-20261103.md — 현재 경장 기준 중장·고기동·폼별 개방·일상 8장 교체 커밋과 실제 제출문·참조·QA를 기록했다. 기존 도감 슬롯과 주소를 유지한다.

## 2026-11-03 · gpt · 제크로무 경장 기준 후속 8장 등록
- docs/image-batches/zekrom-restyle-20261103.md — 등록된 경장의 얼굴·머리·체형을 참조한 중장·고기동·폼별 개방·일상 8장의 이미지 커밋과 제출문·검수 기록을 남겼다.

## 2026-11-03 · gpt · 레시라무 경장 기준 후속 이미지 화풍 교체
- docs/image-batches/reshiram-restyle-20261103.md — 등록된 경장을 유지하고 중장·고기동·폼별 개방·일상 8장을 교체한 이미지 커밋과 검수 기록을 남겼다. 도감 파일명과 슬롯은 유지한다.

## 2026-11-03 · claude · 경장 검수에 「화풍이 2.5D 인가」
- IMAGE_RULES.md 3절 ① — 아홉 장 모두 qa.json 에 style_25d {판정, 근거}(얼굴의 칠한 입체 음영 · 진한 검은 선 · 평평한 피부). ①이 2D 면 같은 지시문으로 한 번 더, 또 2D 면 확정 말고 사용자에게. 사용자 「포켓몬쪽 며칠전부터 화풍이 2d 애니쪽으로 치우치는것 같아」 — 제크로무 경장을 GPT 세션은 글자 그대로 넘겼는데(submitted same) 평평한 셀 얼굴, 같은 글을 API 로 넣으면 기존 화풍이었다. 세션 도구 쪽 변화로 보고 화풍 줄은 그대로 둔다(보강 줄은 API 에서 기존보다 반실사로 나와 사용자 「화풍 줄만 되돌려줘」)

## 2026-11-03 · claude · 지시문 묶음의 화풍 참조 칸(styleReference) 지움
- tools/prompt-pack.cjs — light.styleReference 칸과 INPUT 줄 바꾸기를 뺐다(51990c5 에서 넣은 것). 사용자 「기존에 2D쏠림 이미지를 참고하면 결국 2d가 되잖아」 · 「해당 규칙은 지워줘」 — 참고한 테라키온 경장이 이미 2D 쪽이었고, INPUT 이 "drawn anime facial rendering, linework" 를 따르라 해 쏠림을 굳혔으며 자세 · 망토 · 배경까지 따라왔다. 그 칸이 든 settings 는 이제 틀린 칸(1)
- tests/prompt-pack.cjs — 화풍 참조 칸 시험을 「받지 않는다」 로

## 2026-11-03 · claude · image_gen 에 실제로 넘긴 글을 그대로 남기고 묶음 지시문과 견주기
- tools/prompt-pack.cjs — submitted 명령: 넘긴 글을 <자리>-submitted.txt 로 남기고 <자리>-prompt.txt 와 견준다(끝 공백만 무시). submitted.json 에 sha256 · 같은지 · 빠진 줄 · 더해진 줄 · 화풍 줄이 남았는지. 다르면 1. 사용자 「며칠전부터 화풍이 2d 애니쪽으로 치우치는것 같아 … 문구를 받아들이는 모델 성능이 바뀐게 아닌가」 — 기록엔 prompt.txt 의 sha 만 있어 세션이 글을 고쳐 넘겼는지 알 길이 없었다
- IMAGE_RULES.md 3절 「지시문 묶음」 · 8절 체크포인트 — 부르기 직전 대조, 0 일 때만 부른다, 다른 글로 그린 그림은 올리지 않고 알린다, submitted_sha256 · submitted_same
- docs/IMAGE_AUTOMATION.md — 생성과 검수 명령 줄
- tests/prompt-pack.cjs — 같은 글 0 · 화풍 줄 뺀 글 1 · 기록 쌓임 · --file 없으면 멈춤

## 2026-11-03 · gpt · 비리디온·토네로스 경장 미형 재설계
- data/face-design.json — 두 종의 과도한 얼굴 길이·턱·눈 간격을 균형 있는 성인 얼굴로 조정.
- docs/CHARACTER_FACE_DESIGNS.md — 수정한 두 종의 얼굴 설계표를 다시 생성.
- tools/prompt-pack.cjs — 신규 경장에 기존 컬렉션을 화풍·비율 참조로 첨부할 때 정체성 참조와 구분하고 실제 INPUT·UI 기록에 반영.
- tests/prompt-pack.cjs — 기본 출력 유지 및 명시적 화풍 참조의 안내·원문 보존 확인.

## 2026-11-02 · claude · 포켓몬 코스튬 컷엔 얼굴 클로즈업 안 씀
- data/casual-tree.json — costume_required.not_frames [face_close]. 사용자 「포켓몬의 필수코스튬 컷은 얼굴 클로즈업 장면은 빼도록 수정해줘」 — 얼굴만 남으면 코스튬이 안 보인다
- lib/casual-tree.js · lib/casual-tree-v2.js · tools/casual-tree.py — 공용 모듈(game 원본) 복사: costumeNo — frameOk · why(code costume). 계획기 버전1 · 2 는 frameOk · why 로 고르니 그대로 걸러진다
- tools/casual-ledger.py — check 가 「코스튬 컷의 프레이밍 face_close」 를 건다
- lib/words.js — prompt.v2.why.costume
- tests/casual-plan.cjs · tests/casual-plan-v2.cjs · tests/casual-ledger.py — 서른 명마다 코스튬 컷 프레이밍 · 두 모듈의 이유 · 장부 검사
- IMAGE_RULES.md 3절 코스튬 줄 · AGENTS.md 트리 표 칸 — 규칙

## 2026-11-01 · claude · 「난간에서 돌아보기」 빼기 — 뒷모습으로 돌아보며 얼굴 · 머리에 손 안 대기
- data/casual-tree-v2.json — 자세 추천 rail_lookback(뒤 3/4 · 어깨 너머 · 오른손 난간 · 왼손 머리 넘기기)을 뺐다. 좌우 · 팔 줄을 적은 시험 세 장도 사용자가 「아니 지금도 이상해. 그냥 지금 구도는 갈래에서 없애줘」
- lib/casual-tree-v2.js(공용) — 몸이 뒤쪽(far)이고 머리가 어깨 너머(look_back)면 얼굴 · 머리에 대는 손(zone face)을 못 고른다(why lookback — 화면 · 랜덤 · 계획기가 같이 막는다). backLook 은 팔 줄 없이 왼쪽 어깨 · 손의 화면 쪽만. 예전 기록의 그 손은 다시 검사(repair)가 비운다
- tools/casual-tree-v2.py — 추천이 그 조합이면 건다
- lib/words.js — 못 고르는 까닭 낱말 lookback. 생성기 캐시 번호 올림

## 2026-11-01 · claude · 뒷모습 돌아보기 — 돌아보는 어깨 · 손의 화면 쪽 · 얼굴 손의 팔
- lib/casual-tree-v2.js(공용, game 원본 · book · element · pkm 같은 파일) — backLook: 몸이 뒤쪽(far)이고 머리가 어깨 너머(look_back)면 돌아보는 어깨를 얼굴에 닿는 손(zone face)의 쪽으로(없으면 왼쪽) 정하고, 손 줄에 붙일 화면 쪽 말과 얼굴 손의 팔 줄을 준다. 「어깨 너머」 만 적으니 모델이 아무 쪽으로 돌렸고 뒷모습에서 「her own right hand」 를 자주 뒤집어, 얼굴 쪽과 반대 팔이 귀를 만지려 머리 뒤를 가로질렀다(element 「난간에서 돌아보기」 — 사용자 「지속적으로 뒷태에서 머리 만지는 컷이 팔 구조 해석이 잘못됐는지」). 시험 세 장(o-blood 메카 일상1 두 번 · c 판타지 일상1)에서 팔이 같은 쪽 어깨에서 올라갔다
- lib/prompt-anthro.js — COMPOSITION 의 머리 말을 「her own left shoulder — the shoulder on the image's left side」 로, 손 줄 끝에 「on the image's … side, since her back is to the camera」, 얼굴 손이면 ARM 줄(같은 쪽 어깨에서 · 팔꿈치는 옆으로 · 머리 · 목 뒤를 가로지르지 않는다). 앞모습은 그대로. 생성기 캐시 번호 올림

## 2026-11-01 · claude · 할로윈 코스튬 의상 · 포켓몬 성인 코스튬 필수 컷
- data/casual-tree.json · data/casual-tree-v2.json — 의상 계열 둘: 할로윈 코스튬(halloween, 열여섯 벌 — 수위 있게) · 포켓몬 코스튬(pokemon_costume, costume: true — 다섯 가지 재단, 옷 문장의 {costume} 을 종마다 채움). 시대는 지금 · 무대·환상, 무대 의상 받는 곳 + 거실 · 바 · 옥상 파티 · 축제 거리(코스튬은 코스프레 행사 · 테마 행사장 · 오락실 · 거실 · 침실 · 클럽 · 화보 스튜디오 · 별빛 무대). costume_required 칸. 버전2 어색한 조합에 목욕 · 운동 · 물가. 사용자 「각 공방에 일상컷 의상중에 할로윈 코스튬 의상 등 좀 더 추가해줘. 수위가 좀 있는걸로」 「포켓몬 공방에는 해당 케릭터의 성인 버전 코스튬 의상을 추가해서 필수컷에 넣어주고」 「위와 관련되서 걸리는 검사지 있으면 완화해줘」
- lib/prompt-anthro.js · lib/prompt-spec.js — 코스튬 컷은 옷 문장 {costume} = 영어 이름 · 색(셋까지) · 특징(넷까지) → 코스튬 조각(피부엔 안 그림), casualOutputCostume · casualWardrobeCostume 로 바꾸고 source_influence 축 줄을 싣지 않는다(「원작은 장신구로만 · 생물 코스튬 아님」 과 부딪혔다). prompt.html 캐시 이름 costume
- lib/casual-plan.js — 버전1 · 버전2 계획 모두 코스튬 칸 하나(필수 갈래 자리가 아닌 칸에서, 새 캐릭터만). 자유 칸은 코스튬 계열을 안 고른다. 옷 종류에 bodysuit(bodysuit · leotard · catsuit) — 코스튬 · 할로윈 옷이 옷 종류 없이 빠지지 않게
- tools/casual-ledger.py — 트리 칸 계획에 코스튬 컷이 없으면 건다(옛 칸만 · 다시 채우기는 안 봄). 완화: 「필수 갈래가 아닌 컷 가운데 덜 쓴 장소 묶음」 은 자유 컷(필수 갈래 · 코스튬이 아닌 컷)에서만 — 필수 두 장 + 코스튬이면 보지 않는다. 옷 종류 bodysuit
- IMAGE_RULES.md 3절 — 「원작 색·무늬를 옷에 옮기지 않는다」 의 예외(코스튬 컷) · 코스튬 한 장 꼭 · 할로윈 계열
- tests/casual-ledger.py · tests/casual-plan.cjs · tests/casual-plan-v2.cjs · tests/prompt-casual-v2.cjs — 코스튬 있는 계획 통과 · 없으면 걸림 · 섞인 계획은 코스튬만 빼고 · 서른 명마다 코스튬 한 장(버전1 · 버전2) · 작은 묶음 시험은 코스튬 없는 표로(자유 칸 수를 보는 시험이 아니다) · 피카츄 코스튬 지시문 · 할로윈은 보통 옷 줄

## 2026-10-31 · claude · 그림 저장소4(pkm-atelier-img-4) 열기 · img-3 닫기
- tools/register-images.py · lib/img.js · .github/workflows/register-images.yml · .gitignore — 넷째 그림 저장소 pkm-atelier-img-4(where 3)를 열린 저장소로. img-3 은 사이트 약 938MB(썸네일 워크플로의 900MB 경고)라 닫는다(교체만)
- tools/image-runner.py — 저장소 목록(IMAGE_REPOS)에 img-4, 저장소 묶음을 목록 차례대로 만든다(shard_stores) — 올릴 곳(upload_base)은 목록 끝
- tools/casual-ledger.py · tools/casual-plan.cjs · tools/face-design.py — 그림 저장소 넷을 읽는다(장부·예약·러너 상태는 img-2 에 그대로)
- IMAGE_RULES.md · AGENTS.md · docs/IMAGE_AUTOMATION.md · README.md · rust/README.md — 저장소 표·올리는 곳·잇는 링크(img-4). 다음 저장소를 붙일 때 고칠 목록을 4절에 다 적었다
- tests/image-runner-external.py — 넷째 저장소 자리
- pkm-atelier-img-4 — 뼈대(README · .nojekyll · 썸네일 워크플로 · img/ · records/). 공방 모음 도트 공방도 pkm 그림 주소 차례 끝에 img-4, 새 도트는 img-4 sprites/ 로

## 2026-10-30 · claude · 일상컷 소품 고르게 — game 의 새 소품 · 마실 것 한 장
- data/casual-tree-v2.json — game 버전2 표를 다시 받아(소품 104 → 115 · 동작 138 → 153): 농구공 · 비치볼 · 토트백 · 선글라스 · 종이 지도 · 스케이트보드 · 불꽃 막대 · 풍선 · 레코드판 · 편지 · 챙 넓은 모자, 헤드폰은 직업 현장 소품과 합쳐 장소를 넓혔다, 몇 곳에만 되던 소품의 장소도 넓혔다
- lib/casual-plan.js — 버전2 계획기가 소품 단위로도 센다(동작만 세면 잔 동작 넷이 돌아가며 나왔다), 마실 것(잔 · 칵테일 잔 · 물병 · 찻주전자)은 한 무리로 세고 한 캐릭터 세 장에 한 장까지
- tests/casual-plan-v2.cjs — 마실 것 한 장 · 서른 명에 소품 열 가지 넘게, 한 소품이 넷 또는 4분의 1을 넘지 않게
- 사용자 「기본 소품이 컵 밖에 없다」 — game 계획기 1,050컷에서 소품 든 컷의 15% 가 잔이었다(game PATCH 같은 날)

## 2026-10-30 · claude · 늘 빨갛던 시험 여섯을 고침(전체 72 통과)
- tests/lane-sim.cjs · tests/gwent-sim.cjs — 「진짜 풀엔 아직 잠긴 세대 · 챔피언이 있다」 는 그림이 다 올라와 거짓이 됐다 → 한 세대 그림을 뺀 풀로 잠김 · n장 더를 본다(real 의 셈 자리 __pool 은 안 옮긴다 — 옮기면 뺀 것이 안 먹는다)
- tests/dex-layout.cjs — 옛 개방 그림 칸을 img.json 맨 앞 카드로 박았다 → 옛 그림(폼 없는 overdrive)이 있는 카드를 찾아 쓴다
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — build 뒤 등록된 72종 registered · 머리 잠금 다시(tools/face-design.py build · render). 미등록 셋(맘복치 · 약어리 · 돌핀맨)은 잠금이 늘어 머리 몫을 다시 나눠 머리가 바뀌었다
- tools/face-design.py · tests/face-design.cjs — registered 는 한쪽만 본다(그림은 날마다 올라와 build 전까지 늦을 수 있다 — 등록 안 된 종이 registered 면 틀림) · 일상 FACE/HAIR 없음 검사를 트리 길 · 버전2 장면으로(옛 갈래 cat 은 없어졌다)
- tests/browser-harness.cjs — 체형 · 머리 미리보기를 img/figure-previews 에 안 옮겼으면 옆 atelier 체크아웃의 assets/figures 에서 읽는다(prompt-controls 가 30초 기다리다 죽었다) · AGENTS.md — 준비물 줄
- appearance-extractor 는 코드가 아니라 준비물 — tools/appearance-requirements.txt 를 깔면 통과(AGENTS 에 이미 적혀 있다)

## 2026-10-30 · claude · 일상컷 표정 「윙크」
- lib/prompt-spec.js — 표정 선택지와 문장에 윙크(game 에서 — 버전2 표엔 문장만 와 있고 선택지가 없어 생성기 · 랜덤 · 계획기가 못 골랐다) · prompt.html — prompt-spec v=wink
- lib/casual-plan.js — 계획기 표정 묶음(평상 · 매력)에 윙크

## 2026-10-30 · claude · 일상컷 트리 버전2 옮기기 6단계 — 계획기 기본을 버전2 로
- tools/casual-plan.cjs — 기본이 버전2(예전 길은 --v1), 그 버전에 없는 --avoid 칸이면 멈춘다
- data/casual-tree.json — game 의 의상 여덟 벌(터틀넥+퀼팅 조끼 · 플리스+조거 · 스키 · 턱시도+캐미솔 · 제빵사 · 플로리스트 · 정비 점프수트 · 90년대 윈드브레이커) · data/casual-tree-v2.json — 그 옷 칸(의상 특징 · 날씨) 되살림
- lib/casual-plan.js — 버전1 계획기가 한 컷의 프레이밍을 앞 두 컷이 다 가져가면 멈추던 것 → 마지막 단계에서 자기 컷 값도 풀고 장부 check 에 맡긴다
- IMAGE_RULES.md 3절 · docs/IMAGE_AUTOMATION.md · AGENTS.md — 버전2 칸 읽는 법 · 설정 키 · 기록 칸 · --avoid 칸 · docs/CASUAL_TREE_V2.md — 7-5 둘째 시범(파이리) · 7-6 결과
- tests/casual-plan.cjs — 버전1 은 --v1, 실제 장부에서 기본(버전2) · --v1 둘 다, 버전2 에 없는 --avoid 칸
- 허브(polos0117.github.io) — 버전2 계획 주소는 pkm 생성기로 넘긴다(4f9ee54)

## 2026-10-30 · claude · 일상컷 트리 버전2 옮기기 5단계 — 이상해씨 시범
- docs/CASUAL_TREE_V2.md — 7-5 결과: 옛 시트 이상해씨의 빈 자리 casual2·3 을 계획기 --v2 로(세 장 그려 둘을 골랐다, 한 장은 안전 필터에 막혀 다시 정함), 시범이 찾은 계획기 문제 셋과 남은 것
- 그림 · 기록은 pkm-atelier-img-3(`records/bulbasaur-20261030/`)

## 2026-10-30 · claude · 일상컷 계획기 버전2 — 예약 칸 · 새 장소 묶음 고침(이상해씨 시범에서)
- tools/casual-ledger.py — reserve 가 버전2 컷의 칸(treeV · 몸 자세 · 몸 · 머리 · 손 · 동작 …)을 버리고 버전1 칸만 적었다 → 버전2 컷은 버전2 칸 전부를 적는다. 그 예약에서 --keep 이 몸+머리를 못 읽어 「orient 가 달라야」 로 걸렸다
- lib/casual-plan.js — 장소 묶음 셈(groupOf)이 버전2 표의 새 장소 여덟을 몰라 장부 check 와 덜 쓴 묶음을 다르게 셌다(버전2 예약이 쌓이면 버전1 계획기가 계획을 못 냈다) → 두 계획기 모두 tree2 의 extra_places 를 같은 묶음으로 센다
- tools/casual-plan.cjs — 한 씨앗에서 계획기가 짝을 못 찾아 멈추면 다음 씨앗으로(장부 check 에 걸린 것과 같게 — 전엔 계획기 전체가 끝났다)
- tests/casual-plan-v2.cjs — 예약 칸 왕복 · 두 컷을 두고 다시 정하기 · 버전2 컷이 쌓인 장부 위 버전1 계획기 · tests/casual-plan.cjs — 실제 장부의 버전2 컷은 act 대신 짓

## 2026-10-30 · claude · 일상컷 트리 버전2 옮기기 4단계 — 계획기 --v2 · 장부
- lib/casual-plan.js — planV2(몸 쪽을 버전2 모듈로 — 자세 추천 + 뽑은 장면, 소품 동작, 프레이밍 · 몸+머리 · 추천 서로 다르게), 버전2 컷의 비교 열쇠(짓 · 몸+머리 · 추천), 생성기 주소 버전2, 생김새 색인 길 몰림
- tools/casual-plan.cjs — --v2, 버전2 컷 보이기, 색인 묶음에 버전2 새 장소 · tools/casual-ledger.py — 버전2 컷 읽기 · 같은 비교 열쇠 · 버전2 칸 검사, 버전2 새 장소
- lib/prompt-state.js — 버전2 계획기 주소(treeV 2)는 버전2 장면으로 잠근다, 버전1 주소는 그대로
- tests/casual-plan-v2.cjs — 새 시험 · AGENTS.md — 검사 목록 · docs/CASUAL_TREE_V2.md — 7-4 결과
- 계획기 기본 · gpt 자동화는 아직 버전1(--v2 를 줄 때만 버전2)

## 2026-10-30 · claude · 일상컷 트리 버전2 옮기기 3단계 — 생성기 화면 · 지시문 묶음
- lib/prompt-ui.js — 일상 갈래 버전2 칸(game 생성기에서, 역할 · 동료 · 안 쓰는 값은 pkm 몫), 맞지 않는 칸이면 복사 막기 · 손 말 경고, 버전1 기록 표 · 버전2로 다시 고르기. 새 장면은 버전2, 계획기 주소는 버전1 그대로
- lib/prompt-state.js — v2(C2 · tree2)를 주면 새 장면 · 버전2 기록은 버전2, plannedV2(버전2 계획 컷 잠그기), 계획기 값(버전1)은 버전1 빈 장면 위에 · lib/prompt-random.js — 버전2 장면 랜덤
- lib/prompt-spec.js — CASUAL_HAND_WORDS · lib/words.js — 버전2 말(game 에서) + 까닭 required · companion, 역할 · prompt.html — casual-tree-v2.js 를 읽는다, v=v2a
- tools/prompt-pack.cjs — 버전2 계획 컷(treeV 2)은 버전2 로 잠그고 짓는다, 그 컷엔 camera 글 없음, 안내 · 차례표 버전2. 버전1 컷은 그대로
- tests/prompt-screen.cjs · tests/prompt-pack.cjs — 버전2 몫 · docs/CASUAL_TREE_V2.md — 7-3 결과

## 2026-10-30 · claude · 일상컷 트리 버전2 옮기기 2단계 — 지시문
- lib/prompt-anthro.js — treeV 2 장면 + 버전2 표면 버전2 줄(POSTURE · SUPPORT · COMPOSITION · 렌즈 자동 · 손 둘 · PROP · LEGS · GAZE · 시선 말을 뗀 표정), pkm 몫 Role(직업 역할 동작) · Companion(동료 묶음) 줄, 첫 등장의 해 · 포켓몬 세계 · 동료 한 마리 줄은 그대로. 버전1 기록은 버전1 지시문
- lib/prompt-spec.js — 버전2 줄 열하나 · prompt.html — prompt-spec · prompt-anthro v=tree2a
- tests/prompt-casual-v2.cjs — 새 시험(가장 긴 것 805 낱말, 상한 1200) · AGENTS.md — 검사 목록 · docs/CASUAL_TREE_V2.md — 7-2 결과
- 화면 · 지시문 묶음 · 자동화는 아직 버전1(3단계부터)

## 2026-10-30 · claude · 일상컷 트리 버전2 옮기기 1단계 — 공용 모듈 · pkm 표 · 검사
- lib/casual-tree-v2.js · tools/casual-tree-v2.py — game-atelier 원본을 그대로 복사(같은 파일). pkm 칸(banned · not_required · companion · 동작 places · role)을 읽는 규칙을 game 에서 더했다
- data/casual-tree-v2.json — 새 표: pkm 51곳 받침, 직업 현장 역할 동작 63, 동료 쓰다듬기 · 동료 동작 다섯, 나무열매 · 요리 · 몬스터볼 동작, 몸 뒤 안 씀, 동료 묶음 가슴 위 · 클로즈업 안 씀, 추천 53
- tests/casual-tree-v2.cjs · tests/casual-tree-v2.py — 새 시험 · AGENTS.md — 검사 목록 · 공용 모듈 줄 · docs/CASUAL_TREE_V2.md — 7-1 결과
- 생성기 · 계획기 · 장부 · 자동화는 아직 버전1 그대로(2단계부터). game 의 새 의상 여덟 벌은 버전1 표에 넣으면 버전1 계획기 시험이 길을 못 찾아 4단계로 미뤘다

## 2026-10-30 · claude · 일상컷 트리 버전2 옮기기 계획
- docs/CASUAL_TREE_V2.md — game-atelier 의 버전2 를 pkm 으로 옮기는 계획(사용자). 공용 모듈 · pkm 표 · 지시문 · 화면 · 계획기 · 장부 · 시범 여섯 단계. 시범이 끝날 때까지 계획기 기본과 gpt 자동화는 버전1 그대로




## 2026-10-29 · claude · 헤엄치기 문장·컷
- data/casual-tree.json — 하는 일 swim 의 en 「swimming through the water mid-stroke」 → 「swimming breaststroke, her head and shoulders above the water」, not_frames 에 three_quarter 를 더했다. game 리니지 일상4 가 두 번 다 물속에 앉아 기댔다 — 무릎까지 담는 3/4 컷이 수평으로 누운 헤엄과 부딪혀 몸을 세웠다

## 2026-10-29 · claude · 하는 일 「화장대 앞 치장」 문장을 동작 하나로
- data/casual-tree.json — makeup 의 en 「putting on earrings and makeup」 → 「fastening one earring」(game 워크래프트 III 일상4 에서 팔이 가슴 사이로 튀어나왔다 — 두 동작이라 두 손이 다 얼굴로)

## 2026-10-29 · claude · 지시문 묶음 — 일상 안내에 고른 길의 트리 문장
- tools/prompt-pack.cjs — settings.json 일상 컷의 `guide.tree` 에 고른 길의 트리 문장(시대·장소·하는 일·의상 계열·옷의 한글 이름·영어 문장, 장소 묶음·자세 계열·의상 안내)을, INDEX.md 에 컷마다 「고른 길」 표를 더했다(사용자 「일상컷 트리표도 같이 제공하는거야?」 — 장면·옷 칸을 길 문장과 나란히 읽어 써야 하는데 열쇠만 보였다).
- tests/prompt-pack.cjs — 안내의 트리 문장 = 트리 표 = 지시문의 Place·Activity 줄. IMAGE_RULES.md — 3절 「지시문 묶음」 의 guide 설명.

## 2026-10-29 · claude · 지시문 묶음 — 브라우저 대신 파일로 생성기 지시문·저장값
- tools/prompt-pack.cjs — 새 도구(사용자 「브라우저에서 하라고 시켰는데 파일로 정리해서 읽게 하는게 더 좋을거 같아」). `init <카드> --dir --plan` 이 고칠 칸만 있는 settings.json 을, `build --dir` 가 아홉 자리(IMAGE_RULES 3절 표 — 출력·인물 기준·장갑 폼·폭주 기준·첨부는 도구가 정한다)의 `<자리>-prompt.txt` · `<자리>-ui.json`(생성기 저장값 꼴) · INDEX.md(차례·첨부·올릴 파일·sha256)를 쓴다. 일상 선택값은 계획 파일에서만(계획기 주소와 같은 길), 직접 입력엔 사유가 있어야, 틀린 칸이 있으면 아무것도 안 쓰고 1.
- lib/prompt-state.js — 새 공용 모듈. 생성기 화면의 저장값 꼴·바로잡기(normalize)·계획기 값 받기(planned)·조립부 입력을 lib/prompt-ui.js 에서 떼어 냈다 — 화면과 도구가 같은 코드라 같은 글이 나온다. prompt.html prompt-state v=1 · prompt-ui v=state1. tests/prompt-dom-harness.cjs 도 싣는다.
- lib/prompt-ui.js — 위 모듈을 쓴다(동작은 그대로 — prompt·casual 검사 그대로 통과).
- tests/prompt-pack.cjs · tests/prompt-pack-screen.cjs — 도구(node)와, 묶음 저장값을 실제 생성기 화면에 넣으면 아홉 자리 지시문이 글자 하나 다르지 않은지(브라우저).
- IMAGE_RULES.md — 3절 「지시문 묶음」 을 새로 두고, 2절 파일 표·「그 밖의 원칙」(실제 UI → 묶음 칸, 묶음 지시문을 손으로 고쳐 내지 않는다)·일상컷 차례 3·기록 4를 묶음으로. docs/IMAGE_AUTOMATION.md — 생성 절차와 intent 예를 묶음 파일로, 브라우저는 검사에만. tools/casual-plan.cjs — 끝에 묶음 안내 한 줄. tools/image-runner.py — UI 출처 주석. AGENTS.md — 검사 둘.

## 2026-10-29 · claude · 일상컷 계획기 — 허브 통합 생성기 주소도 찍는다
- tools/casual-plan.cjs — 컷마다 생성기 주소 밑에 `허브 https://polos0117.github.io/prompt.html?a=pkm&mech=…&casual=…` 한 줄(사용자 「일상컷 계획 불러오기도 허브에 넣어줘」). 허브가 같은 꼴을 받아 값을 채우고 계획 칸은 랜덤이 안 바꾼다 — 지시문은 옛 생성기와 같다(허브 tests/prompt-screen.cjs).
- IMAGE_RULES.md — 3절 계획기 차례 3에 허브 주소로 열어도 된다는 한 줄.

## 2026-10-29 · claude · 일상컷 트리 모듈 — 해방 까닭(why·unlocked)
- lib/casual-tree.js — game 원본 다시 복사: 허브 통합 생성기(polos0117.github.io/prompt.html)의 「해방」 몫 `why`(트리 밖 값의 까닭 code, 안이면 null — 안 쓰는 값은 `banned` 가 먼저)와 `unlocked`(장면의 `unlocked` 칸은 repair 가 고치지 않는다). prompt.html casual-tree v=tree2.
- tests/casual-tree.cjs — 트리 안 값은 까닭이 없고, 다른 시대 장소·없는 값·계열 밖 자세엔 까닭이 붙고, 해방한 자세는 고치기에도 남는지 · 등 돌림은 「안 쓴다」(banned).

## 2026-10-29 · claude · 일상컷 트리(B안) — 갈래·예시 대신 시대 → 장소 → 하는 일 → 의상 → 구도, 장부는 두 열쇠
- data/casual-tree.json — 새 트리 표(game-atelier 트리를 바탕으로, 빌드는 세션 스크립트). 시대 넷: 지금 · 첫 등장 무렵(세대의 해 gen_years — 1세대 1996 … 9세대 2022, 사용자 「과거는 그렇게」) · 포켓몬 세계 안 · 무대·환상. pkm 몫 장소 묶음: 포켓몬 세계(포켓몬센터·콘테스트장·스타디움 …) · 포켓몬 직업 현장(예전 직업컷 61개가 하는 일 하나씩, 직업복 계열 — 기존 트레이너·관장·포켓몬센터 옷을 베끼지 않게) · 동료 포켓몬과 함께(companion — 예전 파트너 돌봄, 가슴 위·클로즈업 없음) · 나무열매·요리. 게임 몫(개발실·방송·PC방 …)은 뺐다. 필수 갈래는 pkm 규칙 그대로 의상 계열 역할극·수영복·란제리풍·레트로(세계 안 규칙 없음, 사용자 「필수 갈래는 pkm 규칙 유지」). 안 쓰는 값(banned: back·back_to_camera·walking_away·detail)과 얼굴 클로즈업 조건(frame_rules.face_close — 필수 갈래 컷엔 안 쓰고 얼굴이 카메라 쪽인 방향만)을 표에 적었다. 예전 갈래·예시 531개는 추천 조합 340·예전 기록 변환표 500으로(빠진 것 0). 활동 자세(박수·쌍안경·따르기 …)·눕기 자세·동료 자세(쓰다듬기·간식 내밀기 — companion)를 자세 계열에 넣었다.
- lib/casual-tree.js · tools/casual-tree.py — game 원본 복사(규칙 칸 넷을 더했다: banned · not_required · companion 자세 · gen_years). tests/casual-tree.cjs · casual-tree.py 새로(pkm 몫까지).
- lib/prompt-spec.js · prompt-anthro.js · prompt-lifestyle.js — 예전 표(CATS·EXAMPLE_MAP·EXAMPLE_DETAIL·EX_NOTE·CAT_KO·RANDOM_POOL·TRAD_EX)를 지우고 일상컷을 트리 길로 짓는다(casualDetails). game 차례 — FRAME 밑에 CROP(가까운 컷)·시대 줄(ERA 「그 포켓몬이 처음 나온 해」 · WORLD 포켓몬 세계 · SETTING)·SCENE, 그 뒤에 옷·각도 줄. 가까운 컷 옷 줄·노출 풀이, 직업복·전통 의상 Outfit note, 동료 묶음이면 동료 줄. ANGLE·손·고정값은 그대로. 쉿·엄지 척 자세. 예전 저장값의 갈래·예시는 변환표로 옮긴다.
- lib/prompt-ui.js · prompt-random.js · prompt.html · lib/words.js — 갈래·예시 메뉴 대신 트리 단계(추천 조합 → 시대 → 장소 → 하는 일 → 의상 계열 → 옷), 자세·방향은 하는 일 안에서, 안 쓰는 값은 메뉴에 없고, 표정은 맨 끝. 고정값(strong·bold·2:3)은 처음부터 잠근다(game 과 같게). 랜덤은 트리 차례 — 잠근 칸이 살아남는 값만 뽑는다(시대를 뽑았는데 잠근 장소가 그 시대에 없으면 다른 시대). 버전 꼬리표 tree1.
- lib/casual-plan.js · tools/casual-plan.cjs — 계획기가 트리 길을 고른다. 장부 규칙은 그대로 옮겼다: 같은 예시 → 같은 장소·하는 일(10명), 안 쓴 예시가 남은 갈래 → 안 쓴 길이 남은 장소 묶음, 덜 쓴 갈래 → 덜 쓴 장소 묶음, 작은 갈래 한 바퀴 → 작은 묶음 한 바퀴, 세 장은 서로 다른 묶음. 옷 종류(garments)는 고른 옷 문장에서, 드러내는 방식·장면 칸 첫머리는 그대로. 자세는 트리 규칙 위에 하는 일 문장 규칙(예전 예시 문장 규칙). 시대는 덜 쓴 것을 무게(지금 5 · 포켓몬 세계 3 · 첫 등장 2 · 환상 1)로, 옛 칸은 시대 셈에서 뺀다. 종목 전용 옷은 그 하는 일에서만. 생김새 몰림은 path:<장소>/<하는 일>·group:<묶음> 으로(Rust 색인은 그대로). 생성기 주소는 트리 칸(예전 주소의 갈래·예시도 받는다).
- tools/casual-ledger.py — 두 열쇠: 옛 칸(갈래/예시)은 읽을 때 트리 변환표로 길을 붙인다(장부 파일은 그대로). check 는 같은 장소·하는 일·작은 묶음 한 바퀴·덜 쓴 묶음·세 장 다른 묶음·트리 위의 길(시대·장소·하는 일·옷)·안 쓰는 값·얼굴 클로즈업 조건을 본다. 기록·예약은 길 칸(era·place·act·ofam·item)을 적고 도장에 들어간다. 필수 갈래는 의상 계열(옛 칸은 갈래 이름으로도).
- tests — prompt-casual · prompt-casual-dom · prompt-random · prompt-random-dom · casual-plan · casual-plan-screen · casual-ledger 를 트리 기준으로 다시 썼고, prompt-engine · prompt-action · prompt-appearance · source-appearance · styles · prompt-screen 은 트리 표를 넘기게. 모의 검사: 옛 장부 158명을 차례로 새 계획기로 다시 짜면 막힘 0 · 다시 정한 횟수 0 · 474컷에 길 405가지(같은 길 많아야 3번) · 묶음 16개 12~41컷.
- IMAGE_RULES.md 3절 · AGENTS.md — 일상컷을 트리 기준으로(필수 갈래 표에 의상 계열 키, 장면 설정 순서 2를 시대 → 장소 → 하는 일 → 의상 → 옷으로, --avoid 칸 act·place·item·group·ofam, 기록 칸). image-runner 는 예시 열쇠를 안 써서 그대로.

## 2026-10-29 · claude · 일상컷 옷 — 첨부 그림의 색·무늬를 따라가지 않게, 포켓몬은 장신구·주변 사물로
- lib/prompt-spec.js · prompt.html — game 일상컷 옷이 첨부 그림을 따라 비슷비슷하던 것과 같은 문구가 여기도 있었다(사용자 「book 이랑 pkm 도 같이」). OUTPUT 은 포켓몬을 장신구·주변 사물로만(옷의 색·무늬·재단엔 넣지 않는다, 장갑·종족 옷은 여전히 안 된다), WARDROBE 는 첨부 그림의 색·무늬·장식을 옷에 옮기지 말라, 원본 반영 축(source_influence)은 subtle 장신구 하나 / balanced 장신구 하나와 주변 사물 하나 / strong 장신구·소품 몇 가지(옷은 늘 그 장면의 옷). prompt-spec v=outfit1.
- tests/prompt-casual.cjs — 옷에 포켓몬 색·무늬를 넣으라는 말이 없고, 원본 반영 세 값이 장신구·사물을 말한다.
- tests/prompt-engine.cjs — 일상컷 길이 한도 420 → 470. 2026-10-28 FRAME 줄 커밋(1f70429)이 439낱말로 넘겨 이 검사를 깨뜨린 채 올라갔다(그때 놓쳤다). 이번 옷 문구로 455.
- IMAGE_RULES.md 일상컷 — 「원본 색·작은 장신구」·「장신구·무늬·색으로」·「다른 컷은 색·무늬로」를 장신구·주변 사물로.

## 2026-10-29 · gpt · 라우드본 생성 외형 자료 보완
- data/source-appearance.json — 라우드본의 붉은 비늘·흰 기하 무늬·불꽃 화관을 확인해 신규 경장 의상 모티프로 반영.

## 2026-10-29 · gpt · 악뜨거 생성 외형 자료 보완
- data/source-appearance.json — 악뜨거의 누락된 붉은 몸색·노란 비늘·불꽃 둥지와 알 모티프를 원작 설명으로 확인해 신규 경장 프롬프트에 반영.

## 2026-10-28 · claude · 도트 재생기 복사 — 머리말(여섯 공방)
- lib/sprite-actor.js — 공방 모음 원본 복사. 머리말만 바뀜(게임 공방이 여섯째로 붙어 「여섯 공방 저장소」) — 동작 그대로라 캐시 꼬리표는 안 올림

## 2026-10-28 · claude · 도트 둘 더 — 리자몽·블래키 4K
- data/sprites.json — charizard(리자몽)·umbreon(블래키) 인물 칸(base 는 열린 pkm-atelier-img-3). 사용자 「삼국지는 빼고 공방별로 둘씩 더」 — 포켓몬 그림 중 내가 고른 둘(light 폼 그림이 정본). book 공방의 4K 길(2160×3840 원본 격자 그대로 · 칸 192×256 · dot 0.5)로 뽑아 pkm-atelier-img-3 의 sprites/<id>/ 에 올렸다(원본 gen1, 기록 records/sprites/<id>/*_4k.json). 연구소 바닥·캡슐·도감 상세에 저절로 선다

## 2026-10-28 · claude · 일상컷 화면비 — FRAME 줄을 늘 싣기
- lib/prompt-spec.js · lib/prompt-anthro.js — 일상컷 지시문에 화면비가 빠졌다. 2:3 이 아닐 때만 "Aspect ratio" 를 실어 기본 2:3 에서는 비율 말이 하나도 없었다(사용자, game 에서 먼저 찾음). 일상컷은 이제 OUTPUT 바로 뒤에 FRAME 줄(2:3 이면 "a vertical 2:3 (1024×1536)")을 늘 싣고, SCENE 에는 겹쳐 싣지 않는다. 액션은 그대로(card 줄이 2:3 을 말한다).
- IMAGE_RULES.md 일상컷 1절 — 비율 줄이 이제 프롬프트에 들어간다. camera 칸에 비율 문장을 손으로 넣던 방법은 뺐다.
- prompt.html — prompt-spec·prompt-anthro v=frame1.
- tests/prompt-casual.cjs — 기본 2:3 과 다른 비율 넷의 FRAME 줄, SCENE 에 겹치지 않음, 액션은 예전 규칙.

## 2026-10-28 · claude · 도트 재생기 복사 — floor 가 카드마다 한 명
- lib/sprite-actor.js — 공방 모음 원본 복사(같은 카드의 다른 도트가 있어도 바닥엔 하나만 — 여기 자료엔 아직 그런 쌍이 없다). index·dex.html 의 ?v=4

## 2026-10-28 · claude · 도트 재생기 v3 복사
- lib/sprite-actor.js — 공방 모음 원본 v3 그대로(인물 칸의 dot — 4K 인물을 같은 화면 크기로). index·dex.html 의 ?v=3

## 2026-10-27 · claude · 종별 머리 설계 — 여성 머리 여섯 더하기, 섀기를 여성 머리로, 남성 머리 배정은 되돌림
- lib/prompt-spec.js — 생성기 헤어스타일에 여성 머리 여섯을 더했다: 아프로 · 아프로 퍼프 · 박스 브레이드 · 콘로 · 피시테일 땋기 · 비치 웨이브(라벨·설명·견본 그림 수치). 아프로·브레이드 계열이 표에 없었다(사용자). 섀기는 남성 표시에서 빼 여성 머리로도 쓴다. 다른 남성 표시 머리(버즈컷·크루컷·페이드·옆가르마·넘긴 머리·멀릿·맨번)는 그대로 여성 인물에 배정하지 않는다 — 바로 앞 커밋(304d79a)의 드문 몫 배정은 사용자가 원한 것이 아니어서 되돌렸다. prompt.html 판 `hair2`.
- tools/face-design.py — 새 머리의 묶음·길이·앞머리·공들임 값과 원작 단서(둥글고 폭신한 몸·구름 → 아프로·퍼프, 촉수·덩굴 → 박스 브레이드, 줄무늬·마디·격투 → 콘로, 물고기·지느러미 → 피시테일, 물결·물 타입 → 비치 웨이브, 헝클어진 털·갈기 → 섀기). 적게 쓰인 헤어스타일 채우기 — 8종에 못 미치는 머리는 원작 단서가 맞는 종을 미리 골라 앞서 정한 머리보다 세게 당긴다(계열 잇기에 맞는 종만, 한 종에 하나, 다른 세션이 지금 만드는 종은 빼고). 이게 없으면 앞서 정한 머리를 지키는 가산점 때문에 새 머리가 한 번도 안 나왔다.
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 다시 build·render. ①이 아직 없는 52종의 머리가 바뀌었다(아프로·퍼프·박스 브레이드·콘로·비치 웨이브·섀기 각 8, 피시테일 6, 젖은 듯 넘긴 머리·뒤로 붙인 머리 채움). 확정 그림 580종은 그대로. 여성 헤어스타일 전부가 배정된다.
- tests/face-design.cjs — 여성 헤어스타일은 모두 한 번 이상 배정, 새 머리 여섯·섀기는 여성 머리. 앵커 예산 440 → 460(BODY 줄).

## 2026-10-27 · claude · 종별 머리 설계 — 드문 헤어스타일도 배정
- tools/face-design.py — 생성기가 남성 쪽으로 표시한 헤어스타일 여덟(버즈컷·크루컷·페이드·옆가르마·넘긴 머리·섀기·멀릿·맨번)을 여성 인물 머리 고르기에서 아예 빼 두어, 다섯은 한 번도 배정되지 않았다(사용자). 드문 몫(0.6% = 6종)까지 배정한다. 묶음(짧은 컷·곧은 결·층 낸 컷·올림머리)·길이·앞머리·공들임 값을 정하고, 원작 단서(강철·바위 판 → 버즈·크루컷, 격투 → 크루컷·맨번·페이드, 볏·날개 → 넘긴 머리, 갈기·헝클어진 털 → 멀릿·섀기, 노말·에스퍼 → 옆가르마)를 더했다. 헤어스타일마다 단서 점수가 가장 높은 종을 몫만큼 미리 고르되 계열 잇기에 맞는 종만, 한 종에 하나만, 다른 세션이 지금 만드는(살아 있는 일상컷 예약) 종은 빼고, 그 자리만 앞서 정한 머리보다 세게 당긴다. 확정한 그림(잠금 580)은 그대로.
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 다시 build·render. 바뀐 것은 아직 ①이 없는 32종의 머리뿐(버즈컷 6 · 크루컷 6 · 넘긴 머리 6 · 섀기 6 · 멀릿 6 · 옆가르마 5 · 맨번 3 · 페이드 1 — 확정 그림 몫 포함). 생성기의 헤어스타일 41가지가 모두 배정된다. 등록 표시(registered)도 img.json 에 맞춰졌다.
- tests/face-design.cjs — 남성 표시 머리는 드문 몫으로만, 헤어스타일마다 한 번 이상 배정, 드문 머리 상한. 앵커 예산 440 → 460(BODY 줄).

## 2026-10-27 · claude · 가벼운 조깅 — 자세에서 빼고 액티브 갈래 예시로
- lib/prompt-spec.js — 자세 「가벼운 조깅」(small_jog)을 뺐다. 자세로 고르면 어느 갈래에서든 옷까지 조깅복으로 바뀌었다(사용자). 대신 일상 갈래 「액티브 / 무브먼트 패션」에 예시 「가벼운 아침 조깅」(light_jog — 공원 길을 러닝웨어 차림으로 가볍게 뛴다)을 더했다. 조깅복은 그 갈래에서만 나온다. 옛 기록의 small_jog 값은 그대로 둔다(읽기만 한다). prompt.html 판 올림.
- lib/casual-plan.js · tests/casual-plan.cjs — 자세 묶음(움직임·선 자세·달리기·예시 동작)에서 조깅을 뺐다. 조깅 예시에는 움직이는 자세(mid_stride·mid_action·turning_back)만 붙는다 — 안 막으면 팔짱 끼기가 붙었다. prompt.html 판 plan `plan8`.

## 2026-10-27 · claude · 가벼운 조깅 자세 — 옷차림은 그대로
- lib/prompt-spec.js — 자세 「가벼운 조깅」 영어 문장 "Jog lightly with compact arm movement and a believable running step." 이 의상까지 조깅복으로 바꿨다(사용자). "Move at a light, quick jog … ; her outfit stays exactly as described." 로 — 금지어 대신 옷은 고른 그대로라고 적는다. 한국어 설명도 맞췄다. 걷기·스트레칭·댄스 스텝 문장에는 운동복을 부르는 말이 없어 그대로. prompt.html 판 올림.

## 2026-10-27 · claude · 생성 프롬프트 — 몸 개수 줄, 손 줄은 짧은 긍정형, 일상컷 손 규칙
- lib/prompt-spec.js · lib/prompt-anthro.js — 폼·이어가기·개방·일상컷 모두에 BODY 줄(머리 하나·팔 둘·다리 둘, 제 관절에 붙고 사람처럼 굽음, 손·발은 자세·쥔 것·화면에 가려져도 된다)을 더했다. 그림 저장소의 팔·다리·손 고침 커밋이 10-21 부터 늘었고(최근 일주일 31개 중 30개가 일상컷 — 팔 셋·다리 하나 더·등 뒤로 뻗은 팔·쥔 손) 건담 생성기의 "two arms, two legs" 개수 줄은 10-02 간결화 때 빠졌다. 손가락 개수는 적지 않는다 — 쥐거나 가려져야 할 구도에서도 다섯을 다 보이려 한다.
- 같은 곳 — HANDS 줄을 "natural human hands." 로 줄였다. 10-06·10-18 의 "엄지 하나와 손가락 넷, 엄지는 안쪽, 합쳐지거나 겹치거나 뒤집히거나 더 생기지 않게" 는 금지를 늘어놓아 손에 주의를 끌었다(10-02 간결화 때 금지를 쌓을수록 그것을 보여 주려 했던 것과 같은 일). 손 기본 자세·장갑·개방의 손 줄에서도 금지어를 뺐다.
- 같은 곳 — 일상컷에 HAND TASK 줄(자세·장면대로 움직이고 쉬는 손은 편하게, 가려져도 되며 모든 손·손가락을 억지로 보이지 않는다 — 사용자 문장).
- tests/prompt-engine.cjs — 새 줄이 들어가는지, 손 줄에 손가락 개수·금지어가 없는지, HAND TASK 가 고른 자세를 덮지 않는지. 낱말 예산 앵커 400 · 이어가기 330 · 개방 260 · 일상 420 · 1025종 420. prompt.html 판 `body1`.

## 2026-10-27 · claude · 썸네일 — 깨진 그림 하나에 전체가 멈추지 않게
- tools/make-thumbs.py — 열리지 않는 원본은 건너뛰고 나머지 썸네일을 다 만든 뒤 2 로 끝난다. Actions 에는 그 파일을 `::error::` 로 적는다. 빼미스로우 중장 개방(`빼미스로우_heavy_overdrive_glossy_promo_f.webp`)이 0바이트로 올라간 뒤(pkm-atelier-img-3 4ea2eba) 도구가 그 파일에서 멈춰, 셋째 그림 저장소의 썸네일 실행 12번(모크나이퍼~누리레느)이 다 실패했다. 다른 캐릭터는 세션마다 손으로 썸네일을 올렸고 빼미스로우 아홉 장만 비어 있었다.
- tests/make-thumbs.py — 멀쩡한 것 둘과 0바이트 하나 — 둘은 만들고 2 로 끝나며 `::error::` 를 적는다. 고치기 전 도구는 그 자리에서 죽었다.
- IMAGE_RULES.md · AGENTS.md — 등록 순서 6 에 `열리지 않는 그림` 단계가 빨갈 때 할 일, 검사 목록에 새 시험.
- 그림 저장소 셋의 .github/workflows/thumbs.yml — 썸네일 단계를 `continue-on-error` 로 두어 되커밋까지 가고, 맨 끝 `열리지 않는 그림` 단계가 실행을 빨갛게 남긴다.
- pkm-atelier-img-3 — 빼미스로우 썸네일 여덟 장을 표준 도구로 만들어 올렸다. 중장 개방은 원본이 없어(만든 세션 임시 폴더에만 있었다) 다시 만들어야 한다 — 바꾸는 것은 사용자가 정한다.

## 2026-10-27 · gpt · 다크라이 일상 3 목 회전 보정
- 그림 저장소 `다크라이_glossy_promo_f_casual3.webp` — 몸통에 비해 과하게 뒤돌아보던 얼굴을 화면 오른쪽 발코니 방향으로 돌려 목·어깨 연결을 자연스럽게 고쳤다. 같은 장면·의상·앉은 자세와 파일명을 유지하고, 기준 경장과 기존 컷을 참조해 부분 수정했다. 원본 해시·제출 프롬프트·육안 검수는 `pkm-atelier-img-3/records/darkrai-20261027-casual3-neckfix/`에 남겼다.

## 2026-10-27 · claude · 일상컷 비교 대상 — 예약은 가장 최근 셋까지
- lib/casual-plan.js · tools/casual-ledger.py — 구도·옷 종류·세 축 비교에 다른 세션 예약을 전부 넣던 것을 가장 최근 셋까지로 줄였다(CMP_RESERVED 3). 생성 전 예약이 일고여덟만 쌓여도 SOURCE 영향도 구성(세 장이 다 같지 않은 것 일곱 가지)과 옷 종류 스물넷이 다 막혀 씨앗을 40번 바꿔도 계획이 안 나왔다(2026-10-27 옛 그림 저장소로 크레세리아를 정할 때 예약 26명이 그랬다). 장면 예시 비교는 예시가 470여 개라 막히지 않아 예약 전부를 그대로 본다. 계획기와 check 가 같은 창을 본다. prompt.html 판 plan `plan7`.
- tests/casual-ledger.py — 예약 다섯 가운데 가장 오래된 것과 SOURCE 구성이 같으면 통과, 가장 최근 것과 같으면 걸린다. 가장 오래된 예약의 장면 예시는 그대로 걸린다.
- tests/casual-plan.cjs — 예약 열 명이 SOURCE 구성 일곱 가지·옷 종류를 다 써도 계획이 check 를 통과한다(고치기 전에는 40번 다 걸렸다).
- IMAGE_RULES.md — 비교 대상 정의를 고쳤다.

## 2026-10-27 · claude · 일상컷 계획기 — 안 쓴 예시가 남은 갈래에 가산점
- lib/casual-plan.js — 필수 갈래가 아닌 자리의 갈래 고르기에, 장부 전체에서 한 번도 안 쓴 예시가 남은 갈래 가산점(FRESH_BONUS 1)을 더했다. 갈래를 최근 10명 기준으로 돌려쓰기만 하니 예시 37개 갈래와 7개 갈래가 같은 횟수씩 차례를 받아, 새로 넣은 갈래·큰 갈래의 예시가 오래 남았다(안 쓴 예시 82개, 69개가 새 갈래 여덟). 지금 장부에서 120명 모의 — 지금 방식은 80명에 11개·120명에 4개 남고, 예시 단위로 쪼개 고르면 80명에 0개지만 파트너 돌봄 0장·일상 기본 3장으로 굶었다. 가산점은 80명에 1개, 옛 갈래도 7~10장. 안 쓴 예시를 다 쓰면 원래 돌려쓰기로 돌아온다. 장부 check 조건은 그대로다. prompt.html 판 plan `plan6`.
- tests/casual-plan.cjs — 필수 아닌 갈래가 모두 덜 쓴 갈래이고 취미 갈래에만 안 쓴 예시가 남으면 그 예시를 고른다(가산점을 0 으로 두면 걸린다).
- IMAGE_RULES.md — 계획기의 갈래 고르기에 가산점을 적었다.

## 2026-10-27 · claude · 일상컷 얼굴 클로즈업 열기
- lib/casual-plan.js · tools/casual-ledger.py — 일상컷에 쓰지 않던 프레이밍에서 얼굴 클로즈업(`face_close`)을 뺐다. 2026-10-13 에 "얼굴이 안 보이는 프레이밍" 으로 손·소품 디테일과 같이 막았는데, 얼굴 클로즈업은 얼굴이 오히려 가장 잘 보인다. 옷·장면이 거의 안 남으니 필수 갈래 컷에는 쓰지 않고, 얼굴이 카메라 쪽인 방향(정면·앞 3/4·측면·어깨 너머·아래·위·앞으로 기울임·시선 아래·시선 돌림·옆얼굴 클로즈업)하고만 짝짓는다 — 계획기와 check 가 같은 조건을 본다. 세 장 프레이밍이 서로 달라 한 캐릭터에 한 장까지. 손·소품 디테일과 등진 방향 셋은 그대로 막는다. prompt.html 판 plan `plan5`.
- IMAGE_RULES.md — 쓰지 않는 값에서 얼굴 클로즈업을 빼고 조건을 적었다.
- tests/casual-ledger.py · tests/casual-plan.cjs — 필수 갈래 컷·몸 방향과 짝지은 얼굴 클로즈업은 걸리고, 지키면 통과한다. 붐비는 장부 시험의 프레이밍 목록에 얼굴 클로즈업을 넣었다.

## 2026-10-26 · claude · 일상컷 갈래 여덟 — 레트로 글래머·서브컬처 패션과 세부 갈래 여섯
- lib/prompt-spec.js — 일상컷 갈래 여덟을 더했다. 큰 갈래 둘은 레트로 글래머(18 — 20년대 플래퍼부터 50년대 핀업·70년대 디스코·80년대 에어로빅·Y2K까지)·서브컬처 패션(17 — 고스·펑크·록·갸루·데코라·사이버고스·그런지·스팀펑크·고딕 로리타·비주얼계 …)이다. 세부 갈래 여섯은 나이트라이프(10)·댄스 무대(12)·스파·온천·사우나(9)·판타지 코스튬(10)·웨딩·브라이덜(10)·레드카펫·갈라(9)다. 갈래마다 영어 지시·한국어 설명, 예시마다 한국어 설명을 달았고 생성기의 선(불투명·가슴과 골반 가림·한 명)은 그대로다. 오늘 넣은 예시 가운데 아직 안 쓴 열 개(50년대 비키니·핀업 란제리·옥상 파티·재즈 바·인어 쇼·발레·카바레 쇼걸·사우나 라운지·뱀파이어·브라이덜 레이스)를 새 갈래로 옮겼다 — 핼러윈 마녀는 pkm 엘레이드 일상2가 이미 써서 역할극에 둔다. 그 전부터 있던 예시는 기록·장부가 「갈래/예시」 짝으로 쥐고 있어 옮기지 않는다. 무작위 갈래 목록(RANDOM_POOL)에도 더했다. prompt.html 판 spec `cats26`·plan `plan4`.
- lib/casual-plan.js · tools/casual-ledger.py — 레트로 글래머를 필수 갈래 후보에 넣었다(역할극·수영복·란제리·레트로 글래머 중 한 장). 새 갈래의 옷 종류(PALETTE)·표정(EXPR_FOR)을 정하고, 스파·웨딩·갈라는 달리기 자세를 안 쓰며, 스파는 눕기 자세를 쓸 수 있다. 장면 예시를 선택지가 적은 컷부터 고른다 — 역할극 컷이 해적 선장(코트)을 먼저 잡자 뒤 와일드카드 컷에 코트 예시만 남아 덮는 겉옷이 두 장이 됐다. 해적 선장 문구의 'corset' 을 'cinched waist' 로 — 옷 종류 셈이 란제리로 읽었다.
- IMAGE_RULES.md — 필수 갈래 표에 레트로 글래머를 더하고 새 갈래·옮긴 예시를 적었다.

## 2026-10-26 · claude · 수영복·역할극·란제리·홈웨어·이브닝 예시 더하기
- lib/prompt-spec.js — 수위 높은 갈래에 예시 33개를 더했다(한국어 설명 포함). 수영복 10(컷아웃·딥 플런지·50년대 하이웨이스트·링 장식·크로셰·요트 갑판·폭포 웅덩이·비치발리볼·패들보드·튜브), 역할극 10(카바레 쇼걸·핼러윈 마녀·뱀파이어 백작 부인·마조렛·세일러 무대·라이프가드·고양이 카페·크리스마스 파티·인어 쇼·발레 무대), 란제리 8(브라이덜 레이스·새틴 테디·레트로 핀업·벨벳·스트랩 등판·스포티 코튼·실크 슈미즈·앞 끈 코르셋), 홈웨어 3(사우나 라운지·발코니 해먹·침대 위 아침), 프라이빗 이브닝 2(옥상 파티·재즈 바 피아노)다. 생성기의 기존 선(안감 댄 불투명 소재, 가슴·골반 가림)은 그대로다. 역할극 문구에서 'corset' 은 빼고 'bodice'·'cinched waist' 로 썼다 — pkm 계획기의 옷 종류 셈이 란제리로 읽는다. prompt.html 판 spec `hiex1`·plan `plan3`.
- lib/casual-plan.js — 「한 장은 새 옷 종류」를 마지막 컷에서만 챙겼는데, 그 컷 예시가 옷을 정해 두면 챙길 곳이 없었다(새 예시 다수가 옷을 정한다). 예시가 옷을 정한 컷을 먼저 세고, 옷을 정하지 않은 컷 가운데 마지막에서 챙긴다.
- tests/casual-plan.cjs — 피할 값 시험을 명령줄과 같은 길(씨앗 바꿔 다시 정하기)로 돌린다. 세 컷 예시가 모두 옷을 정하면 한 번에는 새 옷 종류를 못 챙길 수 있다.

## 2026-10-26 · claude · 일상컷 장면 예시·자세 더하기
- lib/prompt-spec.js — 장면 예시 27개를 더했다. 여행 5(페리 갑판·산장 체크인·케이블카·온천 족욕·사막 유적)·음식 5(캠프 카레·타르트·도시락·주스 노점·포장마차 국수)·축제 5(꽃차 퍼레이드·고리 던지기·겨울 조명·꽃관·춤판)·취미 6(보드게임·낚시·탐조·종이접기·뜨개질·별 보기)·역할극 6(마술사 조수·해적 선장·누아르 탐정·아이돌 무대·레트로 우주비행사·로데오 카우걸). 장부를 세니 예시 여섯 개짜리 네 갈래를 3~8바퀴 돌았고 역할극은 19개 중 18개를 썼다. 자세 11개를 더했다 — 활동 자세 9(박수·쌍안경/망원경·음료 따르기·스케치·천 개기·악기 연주·먹기·우산 들기·장신구 매만지기)와 눕기 2(엎드리기·옆으로 눕기). 예시마다 한국어 설명(EX_NOTE)도 달았다.
- lib/casual-plan.js — 새 활동 자세는 예시 문구에 그 동작이 있을 때만(있으면 먼저) 고른다. 눕기는 누울 자리가 있는 쉬는 장면에만, 기대 눕기(reclining) 방향과 짝짓는다. 악기는 북 무대처럼 악기가 배경인 예시에, 장신구는 의상 커프스에 붙지 않게 했다.
- IMAGE_RULES.md — 「예시 8개 이하 갈래」는 이제 파트너 돌봄뿐이다. 활동 자세·눕기 조건을 적었다.
- tests/casual-ledger.py — 「한 바퀴」 검사를 파트너 돌봄으로 옮겼다(취미가 열두 개가 됐다). prompt.html 판 `posefit2`·`plan2`.

## 2026-10-26 · claude · 일상컷 자세·방향이 장면 예시의 주 활동과 부딪히던 것
- lib/casual-plan.js — 자세·방향을 예시 문구와 맞춰 본다(`poseFits`·`orientFits`). 자기 동작이 있는 자세(발끝 들고 손 뻗기·머리 정리·손 흔들기·걷기 …)는 예시에 그 동작이 있을 때만, 서기·걷기는 앉은 예시에 안 쓰고, 바닥 자세는 의자·벤치·카운터가 있는 예시에 안 쓴다. 건네기·쓰다듬기는 파트너 돌봄에서만, 젓기·들기는 따르기 예시에 안 쓴다. 시선 아래는 보기·관람 예시에, 위로 손 뻗기는 뻗을 것이 없는 예시에 안 쓰고, 그 방향에 맞는 자세가 없으면 그 방향을 건너뛴다. 재생성 기록의 「설정과 안 맞음」이 대부분 이 짝이었다(토게키스·개굴반장·개굴닌자·스완나·메탕·미라몽·야나키·동미러).
- lib/prompt-spec.js · lib/prompt-anthro.js — 일상컷의 돌기 방향(turning_midmotion) 문장에서 갑옷용 "장비가 부착 부위를 따른다" 를 빼고 옷·머리카락이 따라 돈다고 쓴다(`CASUAL_ORIENT_GUIDES`). prompt.html 판 `posefit1`.
- IMAGE_RULES.md — 3절에 자세·방향 맞춤 조건을 적었다.
- tests/casual-plan.cjs · tests/prompt-engine.cjs — 걸렸던 짝이 안 나오는지, 계획기가 낸 컷이 늘 맞는 짝인지, 일상컷 돌기 문장을 본다.

## 2026-10-26 · claude · 재생성 기준 완화 — 가짜 글자·잘림·비침·남은 장식
- IMAGE_RULES.md — 6의 「다시 만드는 것」에서 글자를 실제 상표·로고로 좁혔다. 「적기만 하는 것」에 가짜 글자·테두리에 조금 걸린 잘림·조금 비치는 천·일상컷에 남은 원작 장식을 더했다. 그림 저장소 기록을 훑으니 재생성 251건 가운데 이 넷이 절반 가까이였다. ②③(과 ①)의 잘림도 얼굴·팔다리가 크게 잘린 것만 다시 만든다.
- docs/PROMPT_REWRITE.md — 같은 기준 요약을 맞췄다.

## 2026-10-25 · claude · 뒤돌아보기 — 뒷태(back) 각도도
- lib/prompt-spec.js — `LOOK_BACK` 에 뒷태(back)를 더하고 그 문장에도 "얼굴이 보이면 어깨 너머로 4분의 1까지, 옆얼굴" 을 적었다(책·신화·건담 공방과 같은 표). tests/prompt-engine.cjs 도 뒷태를 본다

## 2026-10-25 · claude · 뒤돌아보는 일상컷 — 등 위에 정면 얼굴이 붙던 것
- lib/prompt-spec.js — 등이 카메라를 보는 각도 셋(rear_3q·three_quarter_back·over_shoulder)과 돌아보는 자세(turning_back)의 문장에 한계를 적었다 — 고개는 어깨 너머로 4분의 1까지, 얼굴은 옆얼굴이나 3/4. 새 줄 `casualLookBack`(LOOK-BACK:) — 턱은 가까운 어깨 위, 먼 쪽 눈·볼은 조금 가려져도 되고, 목 옆선이 돌아간 것을 보이고, 어깨선은 머리 뒤로 이어지며, 카메라 쪽으로 오는 것은 얼굴 전체가 아니라 눈. `LOOK_BACK` 표가 그 각도·자세를 정한다
- lib/prompt-anthro.js — 일상컷에서 그 각도나 자세를 골랐을 때만 ANGLE 줄 다음에 LOOK-BACK 줄을 싣는다. 각도 문장이 "몸은 뒤로, 고개만 돌린다" 뿐이라 첨부 그림의 정면 얼굴과 카메라를 보는 표정이 이겨, 등과 날개뼈가 보이는데 얼굴은 정면인 그림이 되풀이됐다(도치보구 3·푸호꼬 1·3). 생성기 prompt.html 의 두 파일 ?v=lookback1
- tests/prompt-engine.cjs — 네 각도·자세에는 LOOK-BACK 줄이 있고, 다른 각도·자세·폼 컷에는 없다

## 2026-10-25 · claude · 바닥에 앉는 자세 — 다리·발이 뭉개지던 것
- lib/prompt-spec.js — 바닥에 앉는 자세 다섯(바닥에 앉기·무릎 대기·한쪽 무릎 세우기·옆으로 앉기·책상다리)의 문장에 다리 배치를 적었다 — 무릎이 향하는 쪽, 정강이가 놓이는 곳, 두 발의 자리와 두 발이 다 보이게. "다리를 한쪽으로 접어 앉는다" 처럼 접는다는 말만 있으면 뒤에서 본 각도에서 다리가 몸에 가려 모델이 짐작해 그렸고, 다리가 방석에 섞이거나 발이 무릎 옆에 튀어나왔다. 생성기 prompt.html 의 prompt-spec.js ?v=legs1

## 2026-10-25 · claude · 일상컷 계획기가 레쿠쟈를 40번 다 못 정하던 것 — 예시가 정한 겉옷
- lib/casual-plan.js — 예시 문구가 옷을 정하는 예시(관측소의 코트·출근 열차의 재킷 …)는 4의 옷 고르기를 안 거쳐 "덮는 겉옷은 세 장 중 한 장까지" 를 피해 갔다. 예시 고르기는 씨앗보다 쓴 횟수가 먼저라, 갈래가 같게 잡히면 같은 두 예시가 뽑혀 40번 모두 check 에 걸렸다(wildcard/observatory_night + everyday_basic/commute_train). 이제 겉옷을 정하는 예시는 한 장까지만 고르고(남은 예시가 그것뿐이면 그대로 둔다), 4의 갈래 옷 고르기도 예시가 정한 겉옷을 차례와 상관없이 먼저 센다
- tests/casual-plan.cjs — 겉옷을 정하는 예시만 남은 장부에서 60번 정해도 덮는 겉옷은 한 장까지(고치기 전 코드는 이 검사에서 걸린다)

## 2026-10-25 · claude · 일상컷 예약에 도장 — 손으로 고친 예약이 남과 같은 장면을 받던 것
- tools/casual-ledger.py — `reserve` 가 캐릭터마다 도장(`stamp`: 세션·캐릭터·시각·컷·다시 채우기의 sha256)을 적는다. 새 명령 `verify [--session S] [--card C]` — 도장이 없거나 안 맞는 예약 칸을 찾아 1 로 끝난다. 도입 전(`STAMP_SINCE`) 예약은 따지지 않는다. 히포포타스(25일 05:04·05:06 KST, 계획기를 거치지 않고 적고 손으로 고친 예약)가 바로 앞 레지스틸과 같은 장면 예시 둘(late_snack·rooftop_infinity_pool)·같은 (방향, 프레이밍) 짝 셋을 받았다 — 그때 장부로 되살려 check 하면 8건, 아무것도 막지 않았다
- tools/image-runner.py — `intent` 앞 `guard_external` 이 자기 일상 예약의 도장도 본다(`casual-ledger.py` 의 셈을 그대로 불러 쓴다)
- IMAGE_RULES.md 3절 0 · docs/IMAGE_AUTOMATION.md · AGENTS.md — 생성 직전 `verify`, 예약 파일은 손으로 쓰거나 고치지 않는다
- tests/casual-ledger.py · tests/image-runner-external.py — 도장 찍기·맞음·고친 칸·도장 없음·도입 전 예약, 관리기가 고친 예약에서 멈춘다

## 2026-10-25 · gpt · 켄호로우 인물 기준 확정
- data/face-design.json — 켄호로우의 원작 근거와 확정 경장 기록을 고정하고 현재 도감 등록 표시를 맞췄다. 다른 종의 얼굴·머리 설계는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 자료에서 다시 그린 설계표.

## 2026-10-25 · gpt · 유토브 인물 기준 확정
- data/face-design.json — 유토브의 원작 근거와 경장 기록을 고정하고 현재 도감의 등록 표시를 맞췄다. 다른 종의 얼굴·머리 설계는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 자료에서 다시 그린 설계표.

## 2026-10-24 · claude · 일상컷 예약 push 상시 승인
- AGENTS.md — 계획기 `--reserve --push` 가 예약 파일(`pkm-atelier-img-2/records/casual-reservations/<세션>.json`)을 올리는 것은 저장소 주인이 미리 승인한 표준 절차라고 적었다. gpt 쪽 자동 승인 검토가 이 push 를 "기존 승인보다 넓은 콘텐츠 공개"로 보고 막아 일상컷 생성이 멈췄다. 범위는 예약 파일 하나 — 그림·다른 경로·강제 push·삭제는 들지 않는다

## 2026-10-24 · claude · 보류한 실행을 다시 열어 막힌 슬롯을 재계획
- tools/image-runner.py — `reopen-deferred --card N --reason --approval`: 보류(deferred)한 실행을 카드 승인으로 다시 연다(다른 실행이 돌면 거부, 주인·claim 대조, 결과 파일 없는 rejected 슬롯이 있어야). `replan-rejected` 는 보류가 남긴 `rejected` 슬롯도 받는다. `blocked_dependency` 슬롯(고기동 개방)은 참조가 accepted 되면 다음 차례로 열리고 기다린 기록은 block_history 에. 진주몽·헌테일·분홍장이 세 실행이 deferred 라 재계획 명령이 받을 활성 실행이 없어 작업 세션이 생성 전에 멈췄다
- docs/IMAGE_AUTOMATION.md — 「보류한 실행을 다시 열어 재계획」
- tests/image-runner-reopen.py — 다른 실행 중 거부·까닭·카드 승인·주인·한 번만 재계획·기다리던 개방 슬롯

## 2026-10-24 · gpt · 사랑동이·아공이 기준 이미지 확정
- data/face-design.json — 사랑동이·아공이의 경장 등록 상태와 머리 기록을 잠가 이후 이미지가 ①을 기준으로 이어지게 함.
- docs/CHARACTER_FACE_DESIGNS.md — 같은 두 캐릭터의 정본·기록 경로와 집계를 생성기로 갱신.

## 2026-10-24 · claude · 다시 채우기 둘을 한 배치로 정하면 못 맞추던 것
- lib/casual-plan.js · tools/casual-plan.cjs — 같은 배치에서 뒤에 정할 다시 채우기 캐릭터의 등록된 컷(fixed)을 앞 캐릭터 계획의 비교 대상에 넣는다. 장부 check 는 배치 안을 서로 견주는데 계획기는 앞 캐릭터만 봐서, 헌테일 1번이 분홍장이의 등록된 1번 짝(leaning_back, chest_up)을 골라 40번 다 걸렸다. 다시 채우기는 "새 방향·프레이밍" 조건도 안 본다(check 와 같게)
- tests/casual-plan.cjs — 뒤 캐릭터의 등록된 컷과 짝이 겹치지 않는다

## 2026-10-24 · claude · 일상컷 얼굴이 ①의 각도를 따라 하던 것
- lib/prompt-spec.js · lib/prompt-anthro.js — 일상컷 프롬프트에 ANGLE 줄(book-atelier 와 같은 말): 첨부한 ①은 누구인지만 정하고, 고개 각도·기울기·시선·화면 속 얼굴 크기·카메라 높이·자르기는 따르지 않는다 — 장면 설정대로 돌리고 그 각도에서 자연스럽게, 생김새는 그대로. 폼·개방에는 없다. prompt.html 의 두 스크립트 ?v=angle1
- IMAGE_RULES.md — 3절 ⑦⑧⑨ 일상컷
- tests/prompt-action.cjs — 일상컷에만 ANGLE 줄

## 2026-10-24 · gpt · 몽얌나·콩둘기 아홉 장씩 등록과 정본 고정
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 몽얌나·콩둘기의 경장 머리와 실제 제출 원문 기록을 잠금. 콩둘기의 원작 단서 해석을 보완하고 도감과 어긋난 분홍장이 등록 표시를 현재 상태에 맞춤.
- docs/image-batches/musharna-20261024.md · docs/image-batches/pidove-20261024.md — 이미지 커밋·QA와 썸네일·도감 등록 결과 기록.

## 2026-10-24 · gpt · 꼬지지 아홉 장 등록과 정본 고정
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 꼬지지의 등록 표시와 실제 경장 머리를 고정해 후속 인물 기준을 보존.
- docs/image-batches/bonsly-20261024.md — 이미지 커밋·차단 뒤 다른 장면 재계획·검수 기록.

## 2026-10-24 · gpt · 동탁군 아홉 장 등록과 정본 고정
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 동탁군 원작 단서의 얼굴 해석을 보완하고 실제 경장 머리를 잠금. 이미 등록된 진주몽·헌테일의 등록·머리 잠금 표시도 현재 도감과 맞춤.
- docs/image-batches/bronzong-20261024.md — 이미지 커밋·부분 수정·검수와 도감 등록 결과 기록.

## 2026-10-24 · gpt · 씨카이저 9장 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 씨카이저 정본의 긴 곱슬·커튼뱅 기록을 잠근다.
- docs/image-batches/walrein-20261024.md — 씨카이저 9장과 정본·확대 검수·일상 비교·반영 커밋을 기록한다.

## 2026-10-24 · gpt · 씨레오 9장 등록과 얼굴 설계 근거
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 등록된 경장의 머리 기록을 잠그고 씨카이저의 원작 특징을 사람 얼굴로 옮긴 근거를 확정한다.
- docs/image-batches/sealeo-20261024.md — 씨레오 정본·9장·생성 기록·확대 검수·이미지 및 도감 반영을 기록한다.

## 2026-10-24 · claude · 일상컷 계획기가 짝을 못 찾고 멈추던 것
- tools/casual-ledger.py — 다시 채운 컷은 막힌 앞 시도의 casualN-ui.json 대신 casualN-refill-ui.json 을 읽는다(브라우저 localStorage 를 통째로 적은 꼴도 푼다). 생성기 상태 없이 사용자가 준 그림만 올린 컷(casualN-import.json 에 plan_match)은 그 폴더 계획(plan-v2.json·plan.json)의 그 컷 값으로 센다. 미라몽·치렁·마자의 막힌 장면이 등록분으로 읽혀 다시 채우기 예약 셋이 안 풀렸고(비교 대상 +9컷), 해골몽 2번은 아예 안 셌다
- lib/casual-plan.js — 비교 대상이 허용된 방향·프레이밍을 다 써 "새 값" 짝이 없으면 TypeError 로 죽던 것: 새 값 → 배치가 잡은 값 → 겹치는 짝 차례로 풀어 계획을 낸다(why.relaxed, 장부 check 가 어긋난 것을 말하고 씨앗을 바꿔 다시 정한다). 세 축이 겹칠 때 자기 자신을 끝없이 다시 부르던 것은 스무 번에서 멈춘다. 실제 장부로 3명 배치 400번 — 고치기 전 절반 실패, 고친 뒤 0
- tests/casual-ledger.py · tests/casual-plan.cjs — 다시 채운 기록·사용자 그림 기록 읽기, 붐비는 장부의 3명 배치(고치기 전 코드는 이 검사에서 죽는다)

## 2026-10-24 · claude · 팔·다리·손 검사기 — 그래픽 라이브러리 없는 환경에서도
- tools/anatomy-check.py — libGLESv2·libEGL·libGL 이 없어 mediapipe 를 못 읽으면 끝 코드 3 과 함께 GL 없이 도는 설치 줄(NO_GL: mediapipe 0.10.14 + headless OpenCV)을 알려 준다. 0.10.14 는 GL 라이브러리를 휠 안에 갖고 있다 — 시스템 GL 라이브러리를 다 치운 자리에서 등록된 그림 61장이 최신 판과 같은 등급, 늘어난 팔(야나프 일상 2 교체 전)도 같게 걸린다
- IMAGE_RULES.md — 3절 끝 「팔·다리·손 점검」에 GL 없는 환경(GPT 쪽)의 설치 줄
- tests/anatomy-check.py — GL 라이브러리가 없을 때 끝 코드 3·안내 줄

## 2026-10-24 · claude · 팔·다리·손 검사기 모델의 GitHub 사본
- anatomy-models 브랜치(고아, Pages 밖) — MediaPipe 자세·손 모델 float16/1 을 바꾸지 않고 옮겼다(sha256 같음, Apache 2.0). storage.googleapis.com 이 막힌 GPT 쪽 작업 환경용. 릴리스 첨부는 이 세션에 권한이 없어 브랜치로 했다
- tools/anatomy-check.py — 모델을 PKM_ANATOMY_MODEL_URL → 공식 자리 → raw.githubusercontent.com → github.com/…/raw/ 차례로 받고, sha256 이 다른 파일은 버리고 다음 자리로
- IMAGE_RULES.md — 3절 끝 「팔·다리·손 점검」에 사본 자리와 PyPI
- tests/anatomy-check.py — 공식이 403 이면 사본 차례·바뀐 파일 버리기

## 2026-10-24 · claude · 팔·다리·손 검사기를 못 돌려도 멈추지 않게
- tools/anatomy-check.py — 모델을 못 받거나(작업 환경이 storage.googleapis.com 을 막아 403) mediapipe·libEGL 이 없으면 끝 코드 3 과 "눈으로 세기로 잇는다" 안내, --json 에 unavailable. 받다 만 파일은 지운다. PKM_ANATOMY_MODEL_URL 로 모델 사본 자리를 바꿀 수 있다(sha256 은 그대로)
- IMAGE_RULES.md — 3절 끝 「팔·다리·손 점검」·9절: 검사기를 못 돌리면 멈추지 않고 눈으로 세기 + anatomy.tool 에 unavailable. 예약 작업 하나가 403 에서 생성 전에 멈춘 것(생성·업로드 0건)
- tests/anatomy-check.py — 받기가 403 이면 끝 코드 3·안내·unavailable·.part 없음

## 2026-10-24 · claude · 팔·다리·손 검사기 — 올리기 전에 세션 안에서
- tools/anatomy-check.py — 새 도구: 자세 추정(MediaPipe 자세 33점·손 21점)으로 그림마다 팔에 안 붙은 손·서로 떨어진 손 셋 이상·한 팔 끝에 손 둘·뒤집힌 손(손의 왼·오른이 붙은 팔과 반대)·아래팔/위팔·정강이/허벅지 길이 비·왼오른 길이 차·접힐 수 없는 팔꿈치·무릎을 본다. --overlay 로 뼈대 그림, --json 으로 기록. 2:3 그림에서 몸을 못 찾으면 정사각으로 덧대 한 번 더(못 찾음 35% → 4%). 맨발·같은 손 두 번은 세지 않는다. 모델은 세션 임시 자리에, sha256 고정
- 문턱 — 등록된 그림 365장으로 맞췄다: suspect 0 · check 11%. 야나프 일상 2 교체 전 그림(늘어난 팔)은 걸리고 교체본은 통과. 폭타 일상 1 의 목덜미 셋째 손은 손 모델이 못 잡는다 — 그래서 눈으로 세기를 같이 한다
- IMAGE_RULES.md — 3절 끝 「팔·다리·손 점검 — 아홉 장 모두」: 검사기 + 눈으로 세기(팔 둘·다리 둘·손가락 다섯·엄지 쪽·꺾이는 쪽), qa.json 의 anatomy 칸. 6절 등록 순서 2에 확인
- tests/anatomy-check.py · AGENTS.md — 모델 없이 점 목록으로 판단 14가지

## 2026-10-24 · gpt · 스컹뿡 이미지 9장과 두 정본의 머리 고정
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 랑딸랑·스컹뿡의 확정 경장 HAIR 값을 잠그고 원작 기반 얼굴 선택 이유와 기존 등록 상태를 동기화했다.
- docs/image-batches/stunky-20261024.md — 9장·썸네일·도감 등록과 마지막 컷의 공개 행사 장면 재계획을 기록했다.

## 2026-10-24 · gpt · 랑딸랑 이미지 9장 등록
- docs/image-batches/chingling-20261024.md — 이미지·썸네일·도감 등록과 검수 근거를 기록했다.

## 2026-10-23 · gpt · 치렁 8장 부분 등록과 정본 잠금
- data/face-design.json — 치렁 경장 기록의 머리를 정본으로 잠그고 등록 상태 반영.
- docs/CHARACTER_FACE_DESIGNS.md — 치렁의 정본·등록 정보를 자료에서 다시 그림.
- docs/image-batches/chimecho-20261023.md — 8장 반영 결과와 일상1 도구 거절·미생성 상태를 기록.

## 2026-10-23 · gpt · 트로피우스 9장 등록과 정본 잠금
- data/face-design.json — 트로피우스 경장 기록의 머리를 정본으로 잠그고, 이미 등록된 해골몽·미라몽의 등록 표시만 현재 도감에 맞춤.
- docs/CHARACTER_FACE_DESIGNS.md — 얼굴 설계 자료의 정본·등록 상태를 다시 그림.
- docs/image-batches/tropius-20261023.md — 이미지 9장·정본 해시·비교 관찰·썸네일과 도감 등록 결과를 기록.

## 2026-10-23 · gpt · 완료된 일상 다시 채우기 예약 중복 제외
- tools/casual-ledger.py — 게시된 번호·갈래·예시가 모두 일치하는 refill 예약을 비교에서 제외해 완료 컷이 구도 후보를 중복 점유하지 않게 했다. 예약 파일은 보존한다.
- tests/casual-ledger.py — 완료 예약 제외와 미게시 예시 예약 보존을 확인한다.

## 2026-10-23 · gpt · 미완료 자동화 실행 보류
- tools/image-runner.py · tests/image-runner-defer.py — 확정 안전 거절 실행만 claim·슬롯·한도를 보존해 보류하고 다음 예약 후보를 허용한다. 불확실한 호출과 다른 소유자는 거부한다.
- docs/IMAGE_AUTOMATION.md — 보류 명령과 독립 슬롯 진행 범위를 기록했다.

## 2026-10-23 · gpt · 앗차키·몽나 정본 확정
- data/face-design.json — 각 9장 생성·검수 후 경장 ①을 정본으로 표시하고, 실제 그림과 생성기 HAIR 줄에 맞춘 머리 기록을 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 두 종의 정본 표시와 머리 잠금·근거 기록을 반영했다.

## 2026-10-23 · gpt · 앗차프 일상 2 오른팔 연결 수정
- 그림 저장소 img-3의 앗차프_glossy_promo_f_casual2.webp — 옷 중간에서 나오던 오른손을 어깨·팔꿈치·손목에서 이어지는 팔로 수정했다(08b695c). 바구니를 든 반대 손과 기존 도감 슬롯은 유지한다.
- 생성 기록 — 이전 UI·프롬프트·검수·해시를 보존하고 replacements/casual2-right-arm-20261023에 수정 입력과 검수 근거를 남겼다.

## 2026-10-23 · gpt · 자동화 시각 QA 사후 검토 승인 기록
- docs/IMAGE_AUTOMATION.md — 사용자 승인에 따라 시각적 실패는 원래 QA와 해시를 보존하고 예외 채택한다. 안전·기술 차단과 상한은 그대로 유지한다.

## 2026-10-23 · gpt · 바오키·앗차프 18장 정본 등록
- data/face-design.json — 바오키의 얼굴 해석 근거를 보완하고 두 캐릭터의 경장 ①을 정본으로 표시하며 생성 기록의 머리 값을 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 두 캐릭터의 정본·머리 잠금 표시와 바오키 설계 근거를 다시 그렸다.
- data/img.json — 셋째 그림 저장소의 두 캐릭터 각 9장과 썸네일 자동 등록을 확인했다(7bb93b1). 이미지 커밋은 바오키 06367ac, 앗차프 00219e1이며, 앗차프 중장 개방의 빈 WebP 변환본은 정상 원본에서 다시 변환해 1a27d6d로 복구했다.

## 2026-10-23 · gpt · 이미지 자동화 실행별 한도와 두 날짜 상한
- tools/image-runner.py — 실행 ID별 1종과 한국·UTC 날짜별 12종을 분리하고 기존 claim·기록을 유지한다. 새 원본은 세션 안에 두며 img-3 업로드 기준 커밋을 반환한다.
- tests/image-runner.py · tests/image-runner-external.py · tests/image-runner-limits.py — 반복 실행·외부 건너뛰기·두 자정·일일 상한·기록 이관을 검사한다.
- docs/IMAGE_AUTOMATION.md — 2시간 실행의 동일 ID 재개 명령과 원본 유실 중단, 별도 사용자 검토 없는 AI QA 절차를 적었다.

## 2026-10-23 · gpt · 야나키·바오프 이미지 등록과 얼굴 설계 근거
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 야나키의 수풀 볏·어깨 털·눈썹을 해석한 얼굴 설계 근거를 확정했다. 후속 폼은 실제 경장 이미지를 기준으로 만든다.
- tools/face-design.py — 셋째 그림 저장소의 실제 생성 기록도 읽어 등록한 캐릭터의 머리를 잠그도록 했다.
- data/img.json — 야나키·바오프 각 9장을 셋째 그림 저장소에서 자동 등록했다. 생성 프롬프트·선택값·검수 기록은 해당 그림 저장소에 보존했다.

## 2026-10-23 · claude · 그림 저장소3(pkm-atelier-img-3) 열기 · 원본 PNG 는 세션 안에만
- tools/register-images.py · lib/img.js · .github/workflows/register-images.yml · .gitignore — 셋째 그림 저장소 pkm-atelier-img-3(where 2)를 열린 저장소로. img-2 는 사이트 약 960MB(1GB 한도)라 닫는다
- tools/image-runner.py — 생성 원본 PNG 를 그림 저장소 records/ 에 올리지 않고 세션 임시 자리(PKM_IMAGE_CACHE)에만, 기록에는 sha256(+webp_sha256, session_only)만. 공개 그림 대조는 WebP 해시로, 새 그림은 img-3 에. 이미 올라간 원본(img-2 records/)은 그대로 읽는다
- tools/casual-ledger.py · tools/casual-plan.cjs — 그림 저장소 셋을 읽는다(장부·예약·러너 상태는 img-2 에 그대로)
- data/sprites.json — 새 도트 인물은 img-3 sprites/ 에, 인물 칸에 제 base
- IMAGE_RULES.md · docs/IMAGE_AUTOMATION.md · AGENTS.md · README.md · rust/README.md — 저장소 표·올리는 곳·「원본 PNG 는 세션 안에만」 절
- tests/image-runner*.py — 세션 원본·img-3 대조

## 2026-10-23 · gpt · 나옹마·몬냥이 이미지 정본과 일상컷 교체
- data/face-design.json — 두 종의 경장 정본 표시와 생성 기록의 머리 값을 잠그고 얼굴 해석 근거를 남겼다.
- docs/CHARACTER_FACE_DESIGNS.md — 두 종의 정본·머리 잠금과 해석 근거를 자료에서 다시 그렸다.
- lib/casual-plan.js — 예시 상세 문구(EXAMPLE_DETAIL)의 옷 종류도 읽어 실제 제출 장면과 계획 의상이 어긋나지 않게 했다.
- tests/casual-plan.cjs — 예시가 요구하는 옷 종류가 계획에 포함되는지 서른 명의 계획으로 확인한다.
- 그림 기록 — 나옹마·몬냥이 각 9장을 등록했다(7e93d0f·2a2dd44). 사용자 지적에 따라 몬냥이 일상 1·3번의 손과 팔 오류는 새 사물 배치와 팔 동작으로 재생성해 같은 번호에 교체하며, 이전 원본과 생성 기록은 보존한다.

## 2026-10-23 · gpt · 어둠대신·다크펫 이미지 정본 등록
- data/face-design.json — 두 종의 경장 정본 표시와 실제 생성 기록의 머리 값을 고정했다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본·머리 잠금 표시를 자료에서 다시 그렸다.

## 2026-10-23 · gpt · 켈리몬 이미지 정본 등록
- data/face-design.json — 경장 정본이 등록된 켈리몬의 얼굴 표시와 긴 포니테일을 생성 기록으로 고정했다.
- docs/CHARACTER_FACE_DESIGNS.md — 켈리몬의 정본·머리 잠금 표시를 자료에서 다시 그렸다.

## 2026-10-23 · gpt · 캐스퐁 이미지 정본 등록
- data/face-design.json — 경장 정본이 등록된 캐스퐁의 얼굴 표시와 짧은 곱슬머리를 생성 기록으로 고정했다.
- docs/CHARACTER_FACE_DESIGNS.md — 캐스퐁의 정본·머리 잠금 표시를 자료에서 다시 그렸다.

## 2026-10-23 · gpt · 무우마직·돈크로우 이미지 정본 등록
- data/face-design.json · docs/CHARACTER_FACE_DESIGNS.md — 두 캐릭터 경장을 정본으로 표시하고 실제 생성 기록의 머리를 잠갔다. 원작 얼굴 해석의 근거를 보완했다.
- 이미지 각 9장과 원본·실제 UI·프롬프트·검수 기록은 그림 저장소 main의 무우마직 9f8e020, 돈크로우 df0b7af에 보존했다. 무우마직 일상 2는 도구 거절 뒤 오피스 테마 파티로 재계획했고, 두 캐릭터 일상 3의 가짜 글자만 지웠다.

## 2026-10-23 · gpt · 레파르다스·야나프 이미지 18장과 정본 확정
- data/img.json — 레파르다스·야나프 각 9장의 자동 등록을 확인한다(9d0c517). 이미지·원본·기록 커밋은 그림 저장소의 8eae473·484cd5c다.
- data/face-design.json — 두 캐릭터의 경장 ①을 정본으로 표시하고 실제 생성 기록으로 머리를 잠근다. 원작 특징을 성인 얼굴로 해석한 이유를 기록한다.
- docs/CHARACTER_FACE_DESIGNS.md — 도감 등록 후 확정된 두 캐릭터의 정본 상태를 자료에서 다시 그린다.

## 2026-10-23 · claude · 일상컷 장면 예시 — 쓴 횟수가 적은 것 먼저
- lib/casual-plan.js — 큰 갈래(예시 9개 넘게)의 예시도 장부 전체에서 쓴 횟수가 가장 적은 것 가운데서 고른다(그 안에서 예전처럼 오래전에 쓴·생김새가 덜 몰린 것). 최근 값만 보던 때는 오래전에 열 번 넘게 쓴 예시가 새 예시와 같은 값이 되어 몇 개에 몰렸다(성인 역할극 retro_racer 12번·란제리 slip_lingerie 10번, 같은 갈래 다른 예시는 1~4번)
- IMAGE_RULES.md — 3절 계획기 설명에 같은 말
- tests/casual-plan.cjs — 오래전에 열두 번 쓴 예시·두 번씩 쓴 예시·한 번 쓴 예시가 있으면 한 번 쓴 것을 고르는지(씨앗 넷)

## 2026-10-23 · gpt · 요테리·하데리어 이미지 18장 등록과 정본 잠금
- data/img.json — 요테리의 전투·개방·일상 9장을 그림 저장소 main의 실제 파일에서 등록한다. 하데리어 9장의 기존 등록을 유지한다.
- data/face-design.json — 요테리·하데리어 경장 ①의 실제 생성 기록으로 등록 상태와 머리를 잠그고 원작 특징의 얼굴 해석 근거를 적는다.
- docs/CHARACTER_FACE_DESIGNS.md — 두 종의 정본·등록·머리 잠금 상태를 자료에서 다시 렌더한다.

## 2026-10-23 · gpt · 밀로틱 9장 등록과 정본 잠금
- data/face-design.json — 밀로틱 경장 ①의 얼굴·매우 긴 웨이브·커튼뱅을 생성 기록으로 잠그고 정본 표시를 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 밀로틱의 그림 있음 표시, 머리 잠금 출처와 등록 통계를 다시 렌더링했다.
- 그림 저장소 records/milotic-20261023 — 경장·중장·고기동·폼별 개방 3장·일상 3장의 원본, 프롬프트, 생성기 선택값과 검수 기록을 보존했다. 이미지 9a8a005, 도감 등록 799b3f6.

## 2026-10-23 · gpt · 바랜드·쌔비냥 이미지 정본 등록
- data/face-design.json — 바랜드·쌔비냥 18장과 경장 정본의 얼굴·머리 잠금을 기록하고, 함께 등록된 빈티나의 기존 정본 표시도 동기화했다.
- docs/CHARACTER_FACE_DESIGNS.md — 확정된 경장 ①이 설계표보다 우선하도록 등록 표시와 머리 기록 출처를 도구로 다시 렌더링했다.

## 2026-10-22 · gpt · 아말도 이미지 9장 등록과 정본 잠금
- data/face-design.json — 등록된 아말도 경장 ①의 기록으로 긴 페더컷·일자 앞머리를 잠근다. 동시 등록된 하데리어도 실제 경장 기록과 대조해 등록·잠금 표지만 동기화한다.
- docs/CHARACTER_FACE_DESIGNS.md — 새 정본의 등록·머리 잠금 상태와 전체 통계를 다시 렌더한다.

## 2026-10-22 · gpt · 아노딥스 이미지 9장 등록과 정본 잠금
- data/face-design.json — 등록된 아노딥스 경장 ①의 생성기 기록을 정본으로 표시하고 중간 길이 블런트컷·일자 앞머리를 잠근다.
- docs/CHARACTER_FACE_DESIGNS.md — 아노딥스의 등록·머리 잠금 상태를 자료에서 다시 렌더한다.

## 2026-10-22 · gpt · 보르그 이미지 9장 등록과 정본 잠금
- data/face-design.json — 등록된 보르그 경장 ①의 실제 생성기 기록을 정본으로 표시하고 긴 포니테일·커튼뱅을 잠근다.
- docs/CHARACTER_FACE_DESIGNS.md — 보르그의 등록·잠금 상태를 자료에서 다시 렌더한다.

## 2026-10-22 · gpt · 전송 중 잘린 정본 데이터와 설계표 복구
- data/face-design.json — 큰 파일 전송에서 잘린 내용을 온전한 원본으로 복구하고 Git blob 해시를 대조한다.
- docs/CHARACTER_FACE_DESIGNS.md — 설계표 전체를 복구하고 원격 바이트가 렌더 원본과 일치하는지 검증한다.

## 2026-10-22 · gpt · 보르쥐 이미지 9장 등록과 정본 잠금
- data/face-design.json — 등록된 보르쥐 경장 ①의 실제 생성기 기록을 정본으로 표시하고 긴 포니테일·불규칙 앞머리 설계를 잠근다.
- docs/CHARACTER_FACE_DESIGNS.md — 보르쥐의 등록·잠금 상태를 자료에서 다시 렌더한다.

## 2026-10-22 · gpt · 같은 슬롯 이미지 교체의 생김새 색인 갱신
- .github/workflows/register-images.yml — 이미지 저장소의 images-updated 알림은 파일명 목록이 같아도 그림이 교체됐을 수 있으므로 생김새 색인을 다시 만든다. 시간표의 무변경 건너뛰기는 유지한다.

## 2026-10-22 · gpt · 승인된 완료 슬롯 교체를 이력으로 보존
- tools/image-runner.py — 이전 공개 해시와 승인을 대조해 완료 기록 뒤에 교체를 추가하고 현재 이미지 복구·읽기 전용 완료 검증에 반영한다.
- tools/casual-ledger.py — 과거 UI는 유지하고 승인된 교체의 실제 UI를 현재 장부에 읽는다.
- tests/image-runner-replacement.py — 이전 완료 불변·승인/공개 해시 경합·중복 거부·현재 이미지 검증을 확인한다.
- tests/casual-ledger-replacement.py — 원래 기록을 고치지 않고 새 UI를 읽는 것을 확인한다.
- docs/IMAGE_AUTOMATION.md — 완료 후 명시적 슬롯 교체와 verify-completed 사용 범위를 적는다.

## 2026-10-22 · claude · 도트 띠 높이는 공용 재생기가 맞춘다
- lib/sprite-actor.js — 공방 모음 원본 그대로(grow). index.html · dex.html 의 ?v=2
- index.html · dex.html — 앞서 화면마다 넣은 높이 셈을 지우고 재생기의 grow 로(연구소 바닥은 grow:true, 도감 무대는 mount 기본). 폴드·150% 검사는 그대로 통과

## 2026-10-22 · gpt · 릴리요 등록 정본의 머리 기록 잠금
- data/face-design.json — 등록된 릴리요 경장 원본과 실제 제출 HAIR 기록으로 긴 양갈래 땋은 머리·커튼뱅을 잠근다.
- docs/CHARACTER_FACE_DESIGNS.md — 릴리요 등록·잠금 상태를 자료에서 다시 렌더한다.

## 2026-10-22 · gpt · 파일 없는 확정 거절의 한 번 재계획 기록
- tools/image-runner.py — 명시적 비성적 재계획 승인을 기존 intent 해시에 묶고 거절·원문을 불변 이력으로 보존한다. 불확실한 호출과 반복 재시도는 거부한다.
- tests/image-runner-replan.py — 진행 중/불확실 결과·다른 카드 승인·외부 경합·중복 재시도 거부와 거절 기록 복구를 확인한다.
- docs/IMAGE_AUTOMATION.md — 파일 없는 거절과 사용자 승인 재계획의 조건 및 중단 기준을 적는다.

## 2026-10-22 · gpt · 이어롤 기본 9장 등록·정본 고정
- data/face-design.json — 이어롤 경장 ① 얼굴과 짧은 레이어드 머리를 정본으로 표시하고 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 통계를 자료에서 다시 그렸다.
- 그림·도감 — pkm-atelier-img-2의 5438ecb에 경장·중장·고기동, 각 개방과 일상 3장을 반영했다. 일상 3은 카메라의 작은 가짜 라벨만 부분 수정했다. 썸네일·그림 등록 성공, 기존 작업은 보존했다.

## 2026-10-22 · gpt · 이어롭 기본 9장 등록·정본 고정
- data/face-design.json — 이어롭의 경장 ① 얼굴과 긴 레이어드 머리를 정본으로 표시하고 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 정본 표시와 통계를 자료에서 다시 그렸다.
- 그림·도감 — pkm-atelier-img-2의 106485b에 경장·중장·고기동, 각 개방과 일상 3장을 반영했다. 예약 6c0ff50, 썸네일·그림 등록 성공, 기존 작업은 보존했다.

## 2026-10-22 · claude · 폴드에서 도트 머리가 잘리던 것
- index.html — 연구소 바닥 높이를 실제 도트 크기로 늘린다. 도트 한 칸은 실제 화소의 정수배라 화소 배율 2.625(폴드)면 1.14배, 1.5(노트북 150%)면 1.33배로 커져 156 띠를 넘었다. 창 크기·배율이 바뀌면 다시 잰다
- dex.html — 도감 상세의 도트 무대도 같은 셈으로 늘린다
- tests/dot-screen.cjs · tests/browser-harness.cjs — 화소 배율(dpr)을 줄 수 있게 하고, 폴드 겉·속 화면(2.625)과 150% 노트북(1.5)에서 바닥·무대 모두 머리가 안 잘리는지 본다

## 2026-10-22 · claude · 연구소 도트 바닥에서 머리가 잘리던 것
- lib/capsule.css — 연구소 바닥 높이 150(휴대폰 132) → 156 하나로. 칸(96×128)을 다 쓰는 루기아가 휴대폰에서 머리 14px 가 잘렸다. index.html 의 capsule.css ?v=dot2
- tests/dot-screen.cjs — 좁은 화면·넓은 화면 모두 인물 칸 위(걷기 오르내림 2칸 더)가 바닥 띠 안에 드는지 본다

## 2026-10-22 · gpt · 릴링 9장 등록과 경장 정본 고정
- data/face-design.json · 릴링의 등록 상태와 실제 경장 원문의 머리 기록을 고정.
- docs/CHARACTER_FACE_DESIGNS.md · 등록된 경장 정본과 머리 잠금을 반영.
- 그림·기록 · img-2 b2ea850에 릴링 9장 게시, 자동 등록 627a791 확인. 경장 개방은 QA 통과가 아닌 사용자 예외 승인으로 채택하고 실패 관찰·승인 메시지·원본 이력을 보존. 릴리요 중장은 머리 장식 상단 잘림으로 별도 보류.

## 2026-10-22 · claude · 첫 도트 인물 — 루기아
- data/sprites.json — 루기아(lugia) 인물 칸: 정지·대기 4칸·걷기 6칸(빠르기 88, 칸마다 dy)·반응 4칸, 96×128 칸·발 기준선 126. 도트 공방(dot.html)에서 만든 인물 칸 그대로. 그림은 pkm-atelier-img-2 sprites/lugia/. 연구소 바닥을 거닐고, 캡슐을 열면 뛰쳐나오고, 도감 상세에 도트 줄이 뜬다

## 2026-10-22 · gpt · 쌍검자비·대검귀 경장 정본과 아홉 장 등록
- data/face-design.json — 두 종의 등록 상태와 경장 ①의 머리 기록을 확정해 후속 작업의 인물 기준을 고정.
- docs/CHARACTER_FACE_DESIGNS.md — 쌍검자비·대검귀를 그림 있음·경장 정본으로 표시하고 잠근 머리의 근거를 반영.
- 그림·기록 — 쌍검자비 84c6398, 대검귀 c26dd4d에 각 9장과 실제 생성기 입력·분류·검수 기록을 반영. 대검귀 경장 개방의 빈 업로드는 보존 원본과 같은 바이트로 d341201에서 복구했으며 재생성하지 않음.

## 2026-10-22 · gpt · 특정 불합격 결과의 사용자 예외 채택
- tools/image-runner.py · 해시·승인 메시지로 묶은 예외 채택을 일반 QA와 분리하고 실패 관찰을 보존.
- tests/image-runner-exception.py · 잘못된 해시와 중복 채택 거부, 예외 감사 기록 확인.
- docs/IMAGE_AUTOMATION.md · 사용자 예외 승인 명령과 적용 범위 기록.

## 2026-10-22 · gpt · 승인된 이미지 수정 한 번의 이력 보존
- tools/image-runner.py · 해시로 묶인 수정 승인과 불합격 시도를 보존하고 별도 경로로 한 번만 생성하도록 추가.
- tests/image-runner-retry.py · 중복 호출·추가 재시도 거부와 기존 원본 및 승인 복구를 검사.
- docs/IMAGE_AUTOMATION.md · 명시적 수정 승인과 재개 명령 기록.


## 2026-10-22 · gpt · 예약 뒤 외부 게시를 보존하고 자동 건너뛰기
- tools/image-runner.py — 두 이미지 저장소·도감을 대조해 외부 완성/부분 게시를 구분하고 자기 claim만 종료한다. 미착수 한도 반환·유한 큐 보충·in_flight 결과 보존·자기 게시 판별·업로드 전 snapshot 확인을 추가했다.
- tests/image-runner-external.py — 외부 완성/부분 게시, 옛 저장소, 자기 결과, 생성 중 경합, 하루 상한, 실제 Git에서 오래된 intent와 업로드 기준 commit을 검사한다.
- docs/IMAGE_AUTOMATION.md — 건너뛰기 상태와 --card·intent_recorded·prepublish/upload_base·등록 대기 절차를 설명한다.
- AGENTS.md — 외부 게시 후 관리기를 통해 건너뛰고 진행 중 결과는 보존하도록 안내한다.

## 2026-10-22 · gpt · 이미지 작업 잠금·하루 상한·복구와 장부 입력 통일
- AGENTS.md — 다른 세션도 전체 캐릭터 claim을 확인하고 interrupted 작업을 임의 인수하지 않도록 진입 지침을 연결했다.
- tools/image-runner.py — 원격 상태 하나로 최대 2종 순차 큐·전체 캐릭터 claim·호출 전후 기록·QA 게이트·해시 복구·등록 완료를 관리한다. 일반 push 충돌은 중단한다.
- tests/image-runner.py — 동시 Git 쓰기 거부·일일 상한·재개·원본 보존·QA·등록 검증을 시험한다.
- tools/casual-ledger.py — 최신 기록과 예약을 합치는 snapshot을 view/check/reserve가 공유한다.
- tools/casual-plan.cjs — check/reserve에도 fresh를 넘겨 계획 단계와 같은 자료를 검사한다.
- tests/casual-ledger.py — 오래된 장부 대신 최신 등록 기록을 검사하고 기존 예약은 유지하는 회귀 검사를 추가했다.
- tests/casual-plan.cjs — 신규 종 통합 시험에서 UI 장부 없는 기존 등록종도 제외한다.
- docs/IMAGE_AUTOMATION.md — 다음 실행 명령·중단 조건·복구·도구 가용성의 검증 한계를 적었다.

## 2026-10-22 · gpt · 수댕이 이미지 정본 등록
- data/face-design.json — 수댕이 경장 ①을 정본으로 표시하고 짧은 곱슬 머리·커튼뱅의 생성 기록을 잠갔다. 실제 그림이 후속 생성의 기준이다.
- docs/CHARACTER_FACE_DESIGNS.md — 현재 정본 등록 상태로 다시 렌더링했다.
- docs/image-batches/oshawott-20261022.md — 폼·개방·일상 9장, 일상 2번 손 수정 및 생김새 검사 기록을 연결했다.


## 2026-10-22 · gpt · 염무왕 이미지 정본 등록
- data/face-design.json — 염무왕 경장 ①을 정본으로 표시하고 관찰된 긴 바람결 머리·옆 앞머리를 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 현재 정본 등록 상태로 다시 렌더링했다.
- docs/image-batches/emboar-20261022.md — 폼·개방·일상 9장과 생성 기록 및 검수 결과를 연결했다.

## 2026-10-22 · gpt · 잘린 얼굴 설계 자료 복구
- data/face-design.json — 생략 문자열로 손상된 382–673 구간을 정상 체크아웃에서 복구하고 최신 나머지 구간 및 뚜꾸리·차오꿀의 정본 등록 표시를 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 복구된 1,025종 자료에서 다시 렌더링했다.

## 2026-10-22 · gpt · 뚜꾸리·차오꿀 이미지 정본 등록
- data/face-design.json — 뚜꾸리의 짧은 머리와 차오꿀의 긴 웨이브 머리를 경장 ① 관찰값으로 잠그고 등록 표시를 맞췄다. 아직 미등록인 염무왕의 머리 길이는 한 단계 늘려 계열 잇기와 종별 구분을 유지한다.
- docs/CHARACTER_FACE_DESIGNS.md — 두 캐릭터의 정본 표시와 머리 관찰 근거를 자료에서 다시 그렸다.

## 2026-10-22 · gpt · 점토도리 일상컷 2 다리와 가구 겹침 수정
- 그림 저장소 img/점토도리_glossy_promo_f_casual2.webp — 가구에 끊겨 보이던 왼쪽 다리를 고쳐 양쪽 다리가 자연스럽게 이어지도록 같은 파일을 교체했다. 얼굴·의상·장면은 유지했다.
- 그림 저장소 records/claydol-20261022 — 수정 프롬프트·전후 해시·검수 결과를 추가하고 분류표와 체크포인트를 갱신했다(fadd87479852aba5beca305aef970ff3fb31dda5).

## 2026-10-22 · claude · 일상컷 생김새 문턱을 cargo 없이도
- rust/casual-look/src/lib.rs — 셈(생김새·거리·색인 읽기·check 글)을 라이브러리로 뺐다. 명령줄 main.rs 는 파일·스레드·찍기만 — 색인이 전과 한 글자도 같다.
- rust/casual-wasm/ — 같은 셈의 wasm(extern "C", 소스 셈을 안에 넣는다). tools/casual-look.wasm 으로 올렸다.
- tools/casual-look.cjs — node 로 check. cargo 없는 생성 세션이 문턱을 건너뛰던 것을 막는다. 글·끝 번호가 명령줄과 같다(실제 일상컷 120장 대조).
- IMAGE_RULES.md — 3절 6번: 문턱은 node tools/casual-look.cjs 로, "cargo 가 없으면 건너뛴다" 를 지웠다.
- tests/casual-look-wasm.cjs · AGENTS.md · rust/README.md — wasm 이 소스보다 묵었나 · 세 장 겹침 · 못 읽는 그림 · 명령줄 대조. 다시 짓는 법.

## 2026-10-22 · gpt · 완료된 일상컷 예약 인식 복구
- tools/casual-ledger.py — 카드별 storage와 최상위 card를 가진 기록도 읽어 완료된 예약이 비교 후보를 계속 차지하지 않게 했다.
- tests/casual-ledger.py — 카드별 기록의 done 전환과 예약 제외를 재현 검사한다.
- tools/casual-plan.cjs — 배치 자신의 이전 예약은 비교에서 빼 검사기와 동일한 대상으로 다시 계획한다.
- tests/casual-plan.cjs — 실제 장부 검사 대상은 아직 등록되지 않은 종에서 골라 누적 등록에 따라 검사가 깨지지 않게 했다.

## 2026-10-22 · gpt · 둥실라이드 이미지 9장 등록과 정본 고정
- data/face-design.json — 경장 ① 기록의 긴 곱슬·사이드뱅을 정본으로 잠갔다. 흔들풍손과 다른 얼굴·머리 설계 및 기존 1,025종 자료는 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 둥실라이드의 경장 정본 표시를 생성 자료에서 다시 그렸다.

## 2026-10-22 · gpt · 흔들풍손 이미지 9장 등록과 정본 고정
- data/face-design.json — 경장 ① 기록으로 짧은 잔곱슬·사이드뱅을 잠그고, 앞선 main 변경에서 생략 문구로 잘린 구간을 직전 정상본에서 복구했다. 점토도리·오뚝군의 최신 정본 변경은 보존했다.
- docs/CHARACTER_FACE_DESIGNS.md — 복구한 1,025종 자료에서 전체 문서를 다시 그려 흔들풍손 정본 표시와 문서 중간 누락을 바로잡았다.

## 2026-10-22 · gpt · 점토도리 이미지 9장 등록과 경장 정본 고정
- data/face-design.json — 점토도리 경장 등록 상태와 긴 히메컷·일자 앞머리를 실제 제출 기록으로 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 점토도리 ①이 정본임을 생성 자료에서 다시 그렸다.

## 2026-10-22 · gpt · 오뚝군 이미지 9장 등록과 경장 정본 고정
- data/face-design.json — 오뚝군 경장 등록 상태와 짧은 레트로 웨이브·옆 앞머리를 실제 제출 기록으로 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 오뚝군 ①이 정본임을 생성 자료에서 다시 그렸다.

## 2026-10-22 · gpt · 가재장군 이미지 9장 등록과 경장 정본 고정
- data/face-design.json — 가재장군 경장 등록 상태와 긴 울프컷·불규칙 앞머리를 실제 제출 기록으로 잠갔다.
- docs/CHARACTER_FACE_DESIGNS.md — 가재장군 ①이 정본임을 생성 자료에서 다시 그렸다.

## 2026-10-22 · claude · 도트 포켓몬 — 연구소 바닥·캡슐을 열면 뛰쳐나오기·도감 상세
- index.html — 연구소 바닥(캡슐 벽 밑 .lab-floor): 도트가 있는 포켓몬이 거닌다(좁으면 둘·넓으면 셋, 날마다 차례가 돈다), 누르면 진열된 포켓몬은 그 캡슐이 열리고 없으면 도감으로. 캡슐을 열면 그 포켓몬의 도트가 유리가 걷히는 사이 캡슐에서 튀어나와 화면 바닥을 거닌다(눌러도 캡슐은 그대로, 닫으면 캡슐로 뛰어 들어간다). 도트가 없으면 아무것도 없다 — 연구소는 그대로
- dex.html — 상세의 도트 줄(작은 무대, 누르면 반응)·목록 칸의 「도트」 표(오른쪽 위)
- data/sprites.json — 새 자료(인물은 아직 없다 — 도트 공방의 「인물 칸 복사」를 actors 에 넣는다, 그림은 pkm-atelier-img-2/sprites/)
- lib/words.js — home.dot.* · dex.dot.*, lib/capsule.css — .lab-floor, lib/sprite-actor.js — 공방 모음 원본(mount 더함)
- tests/dot-screen.cjs — 새 검사(시험 자료 셋, tests/fixtures/make-sprites.py 가 그린다) · tests/browser-harness.cjs — files·imgRoot(sprites/)·reducedMotion · AGENTS.md

## 2026-10-22 · claude · 도트 재생기 v2 를 받아 둔다
- lib/sprite-actor.js · lib/sprite-actor.css — 공방 모음 원본 v2(floor·popOut·actorFor/forCard 더함) 그대로 복사. 아직 부르는 화면은 없다
- tests/sprite-actor-copy.cjs — v2 의 내보내기 일곱

## 2026-10-22 · claude · 도트 재생기 공용 모듈을 받아 둔다
- lib/sprite-actor.js · lib/sprite-actor.css — 다섯 공방이 같이 쓰는 도트 인물 재생기(판 v1). 원본은 공방 모음(polos0117.github.io)의 sprite-actor.js·.css, 글자 하나 다르지 않게 복사했다. 아직 부르는 화면은 없다 — 도트 인물은 공방 모음의 도트 공방(dot.html)에서 만들고 data/sprites.json 을 두면 세운다
- tests/sprite-actor-copy.cjs — 새 검사: 복사본이 원본과 같다 · AGENTS.md — 공용 모듈 한 줄과 검사 목록

## 2026-10-22 · gpt · 가재군 경장 정본 확정
- data/face-design.json — 가재군의 경장 ①을 정본으로 표시하고 실제 제출 프롬프트의 머리 기록을 잠금.
- docs/CHARACTER_FACE_DESIGNS.md — 가재군의 정본 표시를 자료에서 다시 렌더링.

## 2026-10-22 · gpt · 메깅 경장 정본 확정
- data/face-design.json — 메깅의 등록 표시와 경장 ① 머리 기록 잠금을 반영. 후속 여덟 장은 정본 및 각 닫힌 폼에서 이어 생성.
- docs/CHARACTER_FACE_DESIGNS.md — 메깅의 정본 표시를 자료에서 다시 렌더링.

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



