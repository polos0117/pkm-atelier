/* 일상컷 계획기 — 생성 전에 세 장의 생성기 선택값을 도구가 정한다(2026-10-22).
   GPT 가 계획을 짜고 tools/casual-ledger.py check 가 거르던 것을, 이 모듈이 처음부터 장부 조건 안에서 고른다.
   IMAGE_RULES.md 3절 "일상컷 장면 설정 순서" 의 장부 조건(장소·하는 일 10명·한 바퀴, 필수 갈래 자리·다섯 명에 두 장, 덜 쓴 장소 묶음,
   (방향, 프레이밍) 짝·새 값, 옷 종류 새로·덮는 겉옷 한 장, 세 축)을 지키고, 남은 후보 가운데서는
   최근에 덜 쓴 값 · 생김새가 몰린 적이 적은 값(Rust casual-look 색인이 주는 crowd)을 고른다. 같은 입력·씨앗이면 같은 답.

   2026-10-29 일상컷 트리(B안 — 사용자 「B로 가자. 필수 갈래는 pkm 규칙 유지하고 나머지는 말한 대로」):
     장면은 갈래·예시 대신 트리 길(시대 → 장소 → 하는 일 → 의상 계열 → 옷, lib/casual-tree.js · data/casual-tree.json)로 고른다.
     장부의 옛 칸(갈래 cat · 예시 ex)은 트리 변환표(legacy)로 같은 길로 읽는다 — 두 열쇠를 같이 본다.
       같은 예시 금지 → 같은 장소·하는 일(place/act) 금지 · 덜 쓴 갈래 → 덜 쓴 장소 묶음(group) · 안 쓴 예시가 남은 갈래 → 안 쓴 길이 남은 묶음
       필수 갈래 → 의상 계열이 역할극·수영복·란제리풍·레트로(트리 required.outfits, 옛 칸은 갈래 이름으로도)
     자세·방향·프레이밍·렌즈·표정은 트리의 칸끼리 규칙(자세 계열·앉는 자리·손·보이는 부위·안 쓰는 값·얼굴 클로즈업 조건) 안에서,
     그 위에 예전처럼 하는 일 문장과 맞는 자세만(poseFits — 예시 문장 대신 하는 일 문장). 옷 종류(garments)·드러내는 방식(expose)·장면 칸 첫머리(lead)는 그대로 정한다.

   브라우저(window.AtelierCasualPlan)와 node(module.exports)가 같이 쓴다 — 명령줄은 tools/casual-plan.cjs.
   plan({ S, tree, subject, entries, card, batch, seed, look, refill, kept, avoid })
     S        lib/prompt-spec.js 의 AtelierSpec
     tree     data/casual-tree.json
     subject  { gen } — 카드의 세대(첫 등장 무렵 시대의 장소를 그 해로 거른다)
     entries  장부의 살아 있는 칸(done + 다른 세션의 reserved), 시각 차례 — casual-ledger.py view 가 준다
     batch    이번 배치에서 먼저 정한 다른 캐릭터 [{card, cuts}]
     look     { crowd: { 'path:<place>/<act>': n, 'group:<group>': n, 'pair:<orient>|<frame>': n(버전2 컷은 act = 짓, orient = 몸+머리), 'garment:<g>': n } } — 없으면 0
     refill   빈 컷 다시 채우기 — kept 에 이미 등록된 컷을 주면 그 번호는 그대로 두고 나머지만 정한다
     avoid    [{cut, field, value}] — 이미지 도구가 막았거나 장면과 맞지 않아 다시 정할 때 피할 값(field: era·place·act·ofam·item·group·pose·orient·frame·lens·expr)
   돌려주는 것 { card, cuts:[{cut, era, place, act, ofam, item, expr, pose, orient, frame, lens, aspect, axes, garments, expose, lead}], why, claims }

   2026-10-30 일상컷 트리 버전2(docs/CASUAL_TREE_V2.md 4단계) — planV2(같은 입력 + tree2) 는 버전2 칸으로 세 장을 정한다(명령줄 --v2).
     버전2 엔 하는 일이 없다 — 장부 비교의 열쇠를 바꿔 센다(pathOf 가 버전2 컷에 붙인다, casual-ledger.py with_path 와 같다):
       하는 일(act) → 짓(use — 소품 동작, 없으면 몸 자세:오른손:왼손) · 방향(orient) → 몸 방향+머리 방향 · 자세(pose) → 자세 추천
     그래서 버전1 · 버전2 컷이 섞인 장부도 그대로 견준다(둘 다 가진 칸 — 장소 · 묶음 · 의상 · 프레이밍 · 표정 · 옷 종류 · 세 축 — 이 맞물리고,
     짓 · 몸 방향은 두 버전의 말이 달라 서로 걸리지 않는다). 작은 묶음 한 바퀴는 버전1 길(장소/하는 일)의 규칙이라 버전2 컷엔 안 본다 */
(function (root) {
  'use strict';
  function tree_() {
    if (!root.AtelierCasualTree && typeof require === 'function') require('./casual-tree.js');
    return root.AtelierCasualTree;
  }
  function tree2_() {
    tree_();
    if (!root.AtelierCasualTreeV2 && typeof require === 'function') require('./casual-tree-v2.js');
    return root.AtelierCasualTreeV2;
  }

  var REQUIRED = ['adult_roleplay', 'swimwear', 'lingerie', 'retro_glamour'];   /* 장부 옛 칸의 필수 갈래 이름(레트로 글래머는 2026-10-26 더했다) */
  var EX_WINDOW = 10, CMP_WINDOW = 3, GROUP_WINDOW = 10, GROUP_LOW = 5, SMALL_GROUP = 8, TWO_REQUIRED_EVERY = 5;
  /* 구도·옷·세 축 비교에 넣는 다른 세션 예약은 가장 최근 셋까지(2026-10-27) — 예약 전부를 넣으면 생성 전 예약이 일고여덟만 쌓여도
     SOURCE 영향도 구성(일곱 가지)·옷 종류가 다 막혀 계획이 안 나온다. 장소·하는 일 비교는 예약 전부를 그대로 본다 */
  var CMP_RESERVED = 3;
  var FRESH_BONUS = 1;   /* 한 번도 안 쓴 길이 남은 묶음의 가산점(2026-10-27 — 갈래 때와 같다) */
  var FIXED_AXES = { overall_intensity: 'strong', skin_exposure: 'bold' };
  var SOURCE = ['subtle', 'balanced', 'strong'];
  /* 시대 무게 — 덜 쓴 시대를 고르되 지금 현실이 가장 흔하게(game 계획기와 같은 생각). 옛 장부 칸은 다 「지금」 으로 읽힌다 */
  var ERA_WEIGHT = { now: 5, release: 2, in_pokemon: 3, fantasy: 1 };

  /* 옷 종류 — tools/casual-ledger.py 의 GARMENTS 와 같은 말·같은 식(tests/casual-plan.cjs 가 맞춰 본다) */
  var GARMENTS = {
    dress: '\\b(dress|gown|sundress|kaftan|qipao|cheongsam)\\b',
    jumpsuit: '\\b(jumpsuit|romper|playsuit|boilersuit)\\b',
    overalls: '\\b(overalls?|dungarees|bib (shorts|trousers))\\b',
    coat: '\\b(coat|trench|parka|cape)\\b',
    jacket: '\\b(jacket|blazer|bomber|windbreaker)\\b',
    cardigan: '\\bcardigan\\b',
    vest: '\\b(vest|waistcoat|gilet)\\b',
    sweater: '\\b(sweater|jumper|hoodie|sweatshirt|pullover)\\b',
    shirt: '\\bshirt\\b',
    blouse: '\\bblouse\\b',
    knit_top: '\\bknit(ted)? (top|tee)\\b',
    tank: '\\b(tank|camisole|cami)\\b',
    crop_top: '\\b(crop(ped)? top|bandeau|bralette|sports bra)\\b',
    skirt: '\\bskirt\\b',
    shorts: '\\bshorts\\b',
    trousers: '\\b(trousers|pants|jeans|culottes|slacks)\\b',
    leggings: '\\b(leggings|tights)\\b',
    swimsuit: '\\b(swimsuit|one-piece|monokini|rash ?guard)\\b',
    bikini: '\\bbikini\\b',
    lingerie_set: '\\b(lingerie|bustier|corset|teddy)\\b',
    slip: '\\bslip\\b',
    robe: '\\b(robe|kimono-style robe|wrap robe)\\b',
    apron: '\\bapron\\b',
    uniform: '\\buniform\\b',
    traditional: '\\b(hanbok|kimono|yukata|sari|ao dai|dirndl|hanfu)\\b'
  };
  var COVERING = ['coat', 'jacket', 'cardigan', 'sweater'];
  var ONE_PIECE = ['dress', 'jumpsuit', 'overalls', 'swimsuit', 'slip', 'robe', 'traditional', 'lingerie_set', 'bikini'];
  var TOPS = ['shirt', 'blouse', 'knit_top', 'tank', 'crop_top', 'vest'];
  var BOTTOMS = ['skirt', 'shorts', 'trousers', 'leggings'];
  /* 옷 문장이 옷 종류를 안 정할 때(자동 — 「장소에 맞는 평상복」 등) 의상 계열마다 고를 수 있는 옷 — 한 벌, 또는 상의 + 하의 */
  var PALETTE = {
    homewear: ['robe', 'slip', 'tank', 'crop_top', 'knit_top', 'shorts'],
    evening: ['dress', 'slip', 'jumpsuit', 'blouse', 'skirt', 'trousers'],
    active: ['crop_top', 'tank', 'leggings', 'shorts', 'jumpsuit'],
    traditional: ['traditional'],
    roleplay: ['uniform', 'vest', 'skirt', 'shorts', 'dress'],
    swimwear: ['bikini', 'swimsuit'],
    lingerie: ['lingerie_set', 'slip'],
    bath: ['robe', 'swimsuit'],
    editorial: ['dress', 'jumpsuit', 'coat', 'crop_top', 'skirt', 'trousers'],
    work: ['overalls', 'shirt', 'vest', 'trousers', 'shorts', 'apron', 'jacket', 'skirt'],
    retro: ['dress', 'swimsuit', 'bikini', 'jumpsuit', 'skirt', 'shorts', 'crop_top', 'slip'],
    subculture: ['jacket', 'skirt', 'shorts', 'trousers', 'dress', 'crop_top', 'tank', 'vest'],
    costume: ['dress', 'skirt', 'crop_top'],
    bridal: ['dress', 'slip'],
    '*': ['dress', 'jumpsuit', 'overalls', 'shirt', 'blouse', 'knit_top', 'tank', 'crop_top', 'skirt', 'shorts', 'trousers', 'jacket', 'cardigan', 'coat', 'vest']
  };
  /* 드러내는 방식 — 의상 칸에 옷의 구조로 쓴다(IMAGE_RULES 3절 "노출"). 컷마다 둘, 컷끼리·최근과 짝이 겹치지 않게 */
  var EXPOSE = ['off-shoulder neckline', 'halter neck', 'open back', 'cropped hem', 'side cutouts', 'high thigh slit',
    'mini length', 'high-cut leg', 'plunging neckline', 'bare midriff', 'strapless top', 'one-shoulder cut'];
  /* 장면 칸 첫머리 — 세 장이 같은 틀("<빈 장소>에서 <시간대>; 그녀가 …")로 시작하지 않게 */
  var LEAD = ['action', 'light', 'place', 'detail'];

  /* 자세 묶음 — 방향과 어울리는지만 본다 */
  var SEATED = ['sitting', 'sitting_floor', 'side_sitting', 'cross_legged', 'perched_seat'];
  var LOW = ['kneeling', 'squatting', 'one_knee_up'];
  var MOVING = ['walking', 'mid_stride', 'dance_step', 'turning_back', 'waving', 'on_tiptoe', 'stretching', 'mid_action'];
  /* 손에 무엇을 든 자세는 하는 일 문장에 그 물건·일이 있을 때만(예전에는 예시 문장) */
  var ACTIVITY = {
    holding_cup: /\b(cup|coffee|tea|drink|latte|mug|juice)\b/, reading_book: /\b(book|read|reading|guide|novel|page)\b/,
    offering_food: /\b(treat|snack|food|berr(y|ies)|offer)/, gentle_pat: /\b(companion|partner|pet|pat|brush)/,
    watering: /\b(watering|waters? (the |her |small |young )?(plants?|flowers?|seedlings?|herbs?|garden|bed))\b/, preparing_food: /\b(cook|cooking|bake|baking|batter|recipe|chop|stir|mix|knead|whisk|slic|ingredient|dough)/,
    taking_photo: /\b(camera|tak(e|es|ing) (a )?(photo|picture)s?|snap(s|ping)?|photographs?)\b/, adjusting_bag: /\b(bag|backpack|tote|luggage)/,
    checking_map: /\b(map|route|trail|guidebook)/, carrying_something: /\b(carry|carrying|basket|box|crate|tray|bundle)/,
    /* 2026-10-26 더한 활동 자세 — 하는 일의 동작을 자세가 같이 민다 */
    clapping: /\b(clap(s|ping)?|applau\w*|cheer(s|ing)?)\b/, looking_through: /\b(binoculars?|telescope|spyglass|stargaz\w*)\b/,
    pouring_drink: /\bpour(s|ing)?\b/, sketching: /\b(sketch(es|ing)?|drawing|sketchbook|notebook)\b/,
    folding_cloth: /\b(fold(s|ing)? (a |the |her )?(\w+ )?(blanket|towel|laundry|linen|sheets?|shirts?|cloth|clothes|garments?|scarf)|laundry)\b/,
    playing_instrument: /\b(instrument|guitar|violin|ukulele|piano|flute|harp|cello|accordion)\b/,
    eating: /\b(eat(s|ing)?|tast(e|es|ing)|bite|noodles?|curry|dessert|ice cream|snack)\b/,
    holding_umbrella: /\b(an? (open )?umbrella|parasol)\b/,
    dressing_up: /\b(earrings?|shoe straps?|tie(s|ing)? (her )?shoes|putting on|getting ready|bracelets?|necklaces?)\b/
  };
  /* 하는 일의 주 활동과 부딪히는 자세를 뺀다(2026-10-26 예시 문장 규칙 — 박수 예시에 머리 정리, 차 따르기에 그릇 젓기, 쌍안경 전망대에 걷기 …) */
  var HANDS = /\b(hold(s|ing)?|clap(s|ping)?|pour(s|ing)?|fold(s|ing)?|sketch(es|ing)?|draw(s|ing)?|paint(s|ing)?|play(s|ing)?|writ(e|es|ing)|read(s|ing)?|cook(s|ing)?|stir(s|ring)?|carr(y|ies|ying)|check(s|ing)?|adjust(s|ing)?|ty(ing)|tie(s)?|thread(s|ing)?|sew(s|ing)?|knit(s|ting)?|wash(es|ing)?|water(s|ing)?|photograph(s|ing)?|brush(es|ing)?|pick(s|ing)?|arrang(e|es|ing)|serv(e|es|ing)|offer(s|ing)?|feed(s|ing)?|pat(s|ting)?|tun(e|es|ing)|typ(e|es|ing)|clean(s|ing)?|wip(e|es|ing)|wrap(s|ping)?|test(s|ing)?|measur(e|es|ing)|cut(s|ting)?|scan(s|ning)?|binoculars?|telescope|grip(s|ping)?|lift(s|ing)?|tap(s|ping)?|sort(s|ing)?|pack(s|ing)?|choos(e|es|ing)|select(s|ing)?|plac(e|es|ing)|hang(s|ing)?|polish(es|ing)?|stack(s|ing)?|fix(es|ing)?|repair(s|ing)?|sip(s|ping)?|toast(s|ing)?|shap(e|es|ing)|mold(s|ing)?|dust(s|ing)?|rins(e|es|ing)|scrub(s|bing)?|decorat(e|es|ing)|tidy(ing)?|tidies|load(s|ing)?|steady(ing)?|count(s|ing)?|dry(ing)?|drap(e|es|ing)|remov(e|es|ing)|tak(e|es|ing) off|put(s|ting)? on|unzip(s|ping)?|zip(s|ping)?|button(s|ing)?|apply(ing)?|applies|spray(s|ing)?)\b/;
  var MOVE = /\b(walk(s|ing)?|stroll(s|ing)?|strides?|striding|commut(e|es|ing)|hik(e|es|ing)|wander(s|ing)?|crossing|arriv(e|es|ing)|parade|promenade|jog(s|ging)?|run(s|ning)?|sprint(s|ing)?|march(es|ing)?)\b/;
  var SEAT_AT = /\b(seated|sitting|sits|sit|bench|sofa|couch|chair|stool|seat|armchair|barstool|swing)\b/;
  var STAND_AT = /\b(standing|stands|lookout|podium|runway|queue|counter|stall|platform|booth)\b/;
  var FLOOR = ['sitting_floor', 'side_sitting', 'cross_legged', 'one_knee_up', 'kneeling'];
  var UPRIGHT = ['standing_relaxed', 'standing_formal', 'contrapposto', 'hand_on_hip', 'leaning_wall', 'on_tiptoe', 'walking', 'mid_stride', 'dance_step', 'turning_back', 'squatting', 'bending_over'];
  /* 자기 동작을 따로 시키는 자세 — 하는 일에 그 동작이 있을 때만(HANDS_ONLY 는 손으로 하는 일이 없어도 된다) */
  var OWN_ACTION = {
    on_tiptoe: /\b(reach(es|ing)?|shelf|shelves|high|overhead|lanterns?|ceiling|top)\b/,
    bending_over: /\b(low|floor|ground|pick(s|ing)?|gather(s|ing)?|bend(s|ing)?|planters?|tray|table|crates?|baskets?|garden|tide|shells?|harvest(s|ing)?)\b/,
    hands_in_hair: /\b(hair|mirror|vanity|towel|drying|breeze|ponytail|braid|hairpin|ribbon)\b/,
    waving: /\b(wave|waves|waving|greet(s|ing)?|hello|goodbye|farewell|welcom(e|es|ing))\b/,
    stretching: /\b(stretch(es|ing)?|yoga|warm-?up|exercis(e|es|ing)|waking|pilates)\b/,
    squatting: /\b(low|floor|ground|pets?|plants?|garden|shells?|crouch(es|ing)?|squat(s|ting)?|tide|pick(s|ing)?)\b/,
    walking: MOVE, mid_stride: MOVE, turning_back: MOVE,
    dance_step: /\b(danc(e|es|ing|er)|rehears(e|al|ing)|cheer(s|ing|leader)?|perform(s|ing|ance)?|routine|choreograph\w*)\b/
  };
  var HANDS_ONLY = ['arms_crossed', 'stretching', 'squatting', 'turning_back'];
  var JOG = /\bjog(s|ging)?\b/, JOG_POSES = ['mid_stride', 'mid_action', 'turning_back'];
  /* 자세가 하는 일 문장과 맞나 — 자세 계열·앉는 자리·손·보이는 부위는 트리가 먼저 거른다(CT.poses) */
  function poseFits(p, text) {
    if (JOG.test(text) && !has(JOG_POSES, p)) return false;
    if (ACTIVITY[p] && !ACTIVITY[p].test(text)) return false;
    if ((p === 'holding_cup' || p === 'preparing_food') && /\bpour/.test(text)) return false;   /* 따르기는 들고 있기·젓기가 아니다 */
    if (OWN_ACTION[p] && !OWN_ACTION[p].test(text) && !(has(HANDS_ONLY, p) && !HANDS.test(text))) return false;
    if (p === 'arms_crossed' && HANDS.test(text)) return false;
    if (has(UPRIGHT, p) && SEAT_AT.test(text) && !MOVE.test(text)) return false;
    if (has(FLOOR, p) && (SEAT_AT.test(text) || STAND_AT.test(text) || MOVE.test(text))) return false;
    if ((p === 'sitting' || p === 'perched_seat') && (MOVE.test(text) || /\bstanding\b/.test(text))) return false;
    return true;
  }
  /* 방향 — 보기·관람하는 일에 시선 아래, 손 뻗을 것이 없는 일에 위로 손 뻗기 */
  var ORIENT_NEEDS = { reaching_up: /\b(reach(es|ing)?|shelf|shelves|high|overhead|hang(s|ing)?|lanterns?|ceiling|stretch(es|ing)?|banners?|branch(es)?|trees?)\b/ };
  var ORIENT_NOT = { looking_down: /\b(binoculars?|telescope|lookout|look(s|ing)? (out|up|through)|watch(es|ing)?|view(s|ing)?|spectators?|audience|stargaz\w*|fireworks?|sky|clap(s|ping)?|cheer(s|ing)?)\b/ };
  function orientFits(or, text) {
    if (ORIENT_NEEDS[or] && !ORIENT_NEEDS[or].test(text)) return false;
    if (ORIENT_NOT[or] && ORIENT_NOT[or].test(text)) return false;
    return true;
  }
  var ORIENT_FOR = {
    reclining: SEATED.concat(['lying_prone', 'lying_side', '']), crouching: LOW, seated_twist: SEATED,
    turning_midmotion: MOVING.concat(['standing_relaxed', 'contrapposto', 'hand_on_hip', 'hands_in_hair']),
    reaching_up: ['standing_relaxed', 'on_tiptoe', 'stretching', 'hands_in_hair', 'watering', 'carrying_something']
  };
  /* 의상 계열과 어울리는 표정 — 덜 쓴 값만 고르면 소풍에 도발적 표정, 정장 한복에 조깅이 나왔다(2026-10-22 첫 시험, 그때는 갈래마다) */
  var WARM = ['calm', 'focused', 'soft_smile', 'half_smile', 'playful', 'candid', 'curious', 'amused', 'gentle', 'determined', 'surprised',
    'nostalgic', 'pensive', 'wistful', 'mischievous', 'proud', 'flustered', 'relieved', 'laughing', 'laughing_open', 'confident', 'serious'];
  var ALLURE = ['confident', 'sensual', 'provocative', 'half_smile', 'smug', 'playful', 'calm', 'mischievous', 'pensive', 'wistful', 'soft_smile', 'cold_smile', 'serious', 'flustered', 'sleepy'];
  var EXPR_FOR = {
    lingerie: ALLURE, evening: ALLURE.concat(['laughing', 'amused', 'proud']), homewear: ALLURE.concat(['sleepy', 'candid', 'amused', 'gentle']),
    swimwear: ALLURE.concat(['laughing', 'candid', 'amused', 'surprised']), bath: ALLURE.concat(['relieved', 'sleepy', 'gentle']),
    roleplay: ALLURE.concat(['proud', 'amused', 'laughing', 'focused']), editorial: ALLURE.concat(['bored', 'unimpressed', 'cold_smile', 'proud', 'serious']),
    active: WARM.concat(['exhausted', 'relieved', 'determined']), retro: ALLURE.concat(['playful', 'laughing', 'proud', 'amused']),
    subculture: ALLURE.concat(['bored', 'unimpressed', 'cold_smile', 'proud', 'determined']), costume: ALLURE.concat(['proud', 'amused', 'curious', 'focused']),
    bridal: ALLURE.concat(['gentle', 'laughing', 'nostalgic', 'relieved', 'flustered']), work: WARM.concat(['sensual', 'smug'])
  };
  var STILL_FAMS = ['lingerie', 'evening', 'homewear', 'traditional', 'bath', 'bridal'];
  var RUNNING = ['mid_action', 'stretching', 'mid_stride'];
  /* 옷 종류에 맞는 드러내는 방식 */
  var EXPOSE_FOR = {
    traditional: ['off-shoulder neckline', 'open back', 'high thigh slit', 'cropped hem', 'side cutouts', 'one-shoulder cut'],
    swim: ['high-cut leg', 'plunging neckline', 'open back', 'side cutouts', 'strapless top', 'halter neck', 'bare midriff'],
    dress: ['off-shoulder neckline', 'halter neck', 'open back', 'high thigh slit', 'mini length', 'plunging neckline', 'one-shoulder cut', 'strapless top', 'side cutouts'],
    separates: ['cropped hem', 'bare midriff', 'off-shoulder neckline', 'halter neck', 'mini length', 'side cutouts', 'one-shoulder cut', 'open back', 'strapless top']
  };
  function exposeKind(g) {
    if (has(g, 'traditional')) return 'traditional';
    if (g.some(function (x) { return has(['swimsuit', 'bikini', 'lingerie_set'], x); })) return 'swim';
    if (g.some(function (x) { return has(['dress', 'slip', 'jumpsuit', 'robe'], x); }) && !g.some(function (x) { return has(BOTTOMS, x); })) return 'dress';
    return 'separates';
  }

  function has(a, x) { return a.indexOf(x) >= 0; }
  function uniq(a) { var o = [], i; for (i = 0; i < a.length; i++) if (!has(o, a[i])) o.push(a[i]); return o; }
  /* 씨앗 — FNV-1a 32 → mulberry32 */
  function hash(s) { var h = 2166136261, i; s = String(s); for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var t = hash(seed); return function () { t = (t + 0x6D2B79F5) | 0; var x = Math.imul(t ^ (t >>> 15), t | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

  function concrete(rows) { return rows.map(function (r) { return r[0]; }).filter(function (v) { return v && v !== 'AUTO' && v !== '__custom__' && v.indexOf('auto_') !== 0; }); }
  function garmentsOf(text) {
    var t = String(text || '').toLowerCase(), out = [], k;
    for (k in GARMENTS) if (new RegExp(GARMENTS[k]).test(t)) out.push(k);
    return out.sort();
  }

  /* ── 두 열쇠 — 새 칸은 트리 길, 옛 칸(갈래·예시)은 변환표로 같은 길, 버전2 칸은 짓 · 몸 방향을 붙인다 ── */
  function jitOf(c) { return c.use || [c.posture || '', c.right || '-', c.left || '-'].join(':'); }
  function pathOf(tree, c) {
    if (c && c.treeV === 2) return Object.assign({}, c, { act: jitOf(c), orient: (c.body || '') + '+' + (c.head || ''), pose: c.preset || '' });
    if (!c || c.place) return c;
    var s = tree_().fromLegacy(tree, { cat: c.cat, ex: c.ex });
    return Object.assign({}, c, { era: s.era, place: s.place, act: s.act, ofam: s.ofam, item: s.item || '', legacy: true });
  }
  function normEntries(tree, list) { return list.map(function (e) { return Object.assign({}, e, { cuts: (e.cuts || []).map(function (c) { return pathOf(tree, c); }) }); }); }
  function pathKey(c) { return c.place + '/' + c.act; }
  /* 버전2 표의 새 장소(extra_places)는 버전1 표에 없다 — 장부 check(spec 이 같은 표를 읽는다)와 같게 그 묶음으로 센다 */
  var EXTRA = {};
  function setExtra(tree2) { EXTRA = {}; ((tree2 || {}).extra_places || []).forEach(function (p) { EXTRA[p.key] = p.group; }); }
  function groupOf(tree, c) { var p = tree_().place(tree, c.place); return p ? p.group : (EXTRA[c.place] || ''); }
  function reqFams(tree) { return (tree.required || {}).outfits || []; }
  function isRequired(tree, c) { return has(reqFams(tree), c.ofam) || has(REQUIRED, c.cat); }
  /* 트리의 모든 길(시대 · 장소 · 하는 일 · 의상 계열) — subject 가 있으면 첫 등장 해로 거른다. 같은 장소·하는 일은 한 열쇠 */
  var PATHS = typeof WeakMap === 'function' ? new WeakMap() : null;
  function paths(tree, subject) {
    var CT = tree_(), memo = PATHS && PATHS.get(tree), mk = subject && subject.gen != null ? 'g' + subject.gen : '-';
    if (memo && memo[mk]) return memo[mk];
    var by = {}, list = [];
    tree.eras.forEach(function (e) {
      CT.places(tree, e.key, subject || null).forEach(function (p) {
        CT.acts(tree, e.key, p.key).forEach(function (a) {
          var fams = CT.outfitFamilies(tree, e.key, p.key, a.key).map(function (f) { return f.key; });
          if (!fams.length) return;
          var k = p.key + '/' + a.key;
          if (!by[k]) { by[k] = { key: k, place: p.key, act: a.key, group: p.group, options: [] }; list.push(by[k]); }
          fams.forEach(function (f) { by[k].options.push({ era: e.key, fam: f }); });
        });
      });
    });
    var out = { list: list, by: by };
    if (PATHS) { if (!memo) { memo = {}; PATHS.set(tree, memo); } memo[mk] = out; }
    return out;
  }
  /* 묶음마다의 모든 길 열쇠(해로 거르지 않는다 — 장부 check 와 같은 바퀴) */
  function groupKeys(tree, g) { return paths(tree, null).list.filter(function (p) { return p.group === g; }).map(function (p) { return p.key; }); }

  /* ── 장부에서 읽는 것 — casual-ledger.py 와 같은 창 ── */
  function groupCounts(tree, entries) {
    var n = {}, i, j, k;
    tree.groups.forEach(function (g) { n[g.key] = 0; });
    for (i = 0; i < entries.length; i++) for (j = 0; j < entries[i].cuts.length; j++) { k = groupOf(tree, entries[i].cuts[j]); if (k in n) n[k]++; }
    return n;
  }
  function lowGroups(tree, entries) {
    var n = groupCounts(tree, entries), v = Object.keys(n).map(function (k) { return n[k]; }).sort(function (a, b) { return a - b; }), cut;
    if (!v.length) return [];
    cut = v[Math.min(GROUP_LOW, v.length) - 1];
    return Object.keys(n).filter(function (k) { return n[k] <= cut; });
  }
  /* 작은 묶음(길이 SMALL_GROUP 개 이하)은 한 바퀴 — 그 묶음 길 가운데 가장 적게 쓴 것들 */
  function smallOpen(tree, entries, g) {
    var list = groupKeys(tree, g), n = {}, i, j, k, m;
    if (!list.length || list.length > SMALL_GROUP) return null;
    list.forEach(function (x) { n[x] = 0; });
    for (i = 0; i < entries.length; i++) for (j = 0; j < entries[i].cuts.length; j++) { k = pathKey(entries[i].cuts[j]); if (k in n) n[k]++; }
    m = Math.min.apply(null, list.map(function (x) { return n[x]; }));
    return list.filter(function (x) { return n[x] === m; });
  }
  /* 최근일수록 무거운 사용 횟수 — 바로 앞 캐릭터 1, 그 앞 0.85, … */
  function recency(entries, get) {
    var score = {}, i, j, w, vals, k;
    for (i = entries.length - 1, w = 1; i >= 0; i--, w *= 0.85) for (j = 0; j < entries[i].cuts.length; j++) {
      vals = get(entries[i].cuts[j]); if (!Array.isArray(vals)) vals = [vals];
      for (k = 0; k < vals.length; k++) if (vals[k] != null) score[vals[k]] = (score[vals[k]] || 0) + w;
    }
    return score;
  }
  function crowd(look, key) { return ((look && look.crowd) || {})[key] || 0; }

  /* 후보 가운데 점수가 가장 낮은 것 — 같으면 씨앗으로 */
  function pick(list, score, rand) {
    var best = null, bs = Infinity, i, s;
    if (!list.length) return null;
    var order = list.slice().map(function (v) { return { v: v, r: rand() }; });
    for (i = 0; i < order.length; i++) { s = score(order[i].v) + order[i].r * 1e-6; if (s < bs) { bs = s; best = order[i].v; } }
    return best;
  }

  function plan(o) {
    var S = o.S, tree = o.tree, CT = tree_(), subject = o.subject || null, card = o.card, refill = !!o.refill, avoid = o.avoid || [];
    if (!tree) throw new Error('casual-plan: tree (data/casual-tree.json) is required');
    setExtra(o.tree2);
    var batch = (o.batch || []).map(function (b) { return Object.assign({}, b, { cuts: normEntries(tree, [b])[0].cuts }); });
    var kept = (o.kept || []).map(function (c) { return pathOf(tree, c); });
    var rand = rng(o.seed != null ? o.seed : card), names = [card].concat(batch.map(function (b) { return b.card; }));
    var all = normEntries(tree, (o.entries || []).filter(function (e) { return e && e.cuts; }));
    var base = all.filter(function (e) { return !has(names, e.card); });
    var reserved = base.filter(function (e) { return e.status === 'reserved'; });
    var others = batch.map(function (b) { return { card: b.card, cuts: b.cuts }; });
    /* 같은 배치에서 아직 안 정한 다시 채우기 캐릭터의 이미 등록된 컷 — 장부 check 는 배치 안 모두를 서로 견주니, 그 컷과 겹쳐도 못 바꾼다(2026-10-24 헌테일 ↔ 분홍장이) */
    var fixed = normEntries(tree, (o.fixed || []).filter(function (f) { return !has(names, f.card) || f.card !== card; }).map(function (f) { return { card: f.card, cuts: f.cuts }; }));
    var cmp = base.slice(-CMP_WINDOW).concat(reserved.slice(-CMP_RESERVED).filter(function (e) { return base.slice(-CMP_WINDOW).indexOf(e) < 0; }), others, fixed);
    var exw = base.slice(-EX_WINDOW).concat(reserved.filter(function (e) { return base.slice(-EX_WINDOW).indexOf(e) < 0; }), others, fixed);
    var hist = base.concat(others);
    var usedPath = {}, pairs = {}, orients = {}, frames = {}, gar = {};
    exw.forEach(function (e) { e.cuts.forEach(function (c) { usedPath[pathKey(c)] = 1; }); });
    cmp.forEach(function (e) { e.cuts.forEach(function (c) { pairs[c.orient + '|' + c.frame] = 1; orients[c.orient] = 1; frames[c.frame] = 1; (c.garments || []).forEach(function (g) { gar[g] = 1; }); }); });
    /* 배치 안에서 앞 캐릭터가 "새 값" 으로 잡은 옷 종류·방향·프레이밍 — 뒤 캐릭터가 같이 쓰면 앞 캐릭터의 새 값이 사라진다(check 는 배치 전체를 본다) */
    var claimed = { garment: {}, orient: {}, frame: {} };
    batch.forEach(function (b) { var k; for (k in claimed) ((b.claims || {})[k] || []).forEach(function (v) { claimed[k][v] = 1; }); });
    var avoided = function (cut, field, value) { return avoid.some(function (a) { return (a.cut == null || a.cut === cut) && a.field === field && a.value === value; }); };
    var keptNo = kept.map(function (c) { return c.cut; });
    var slots = [1, 2, 3].filter(function (n) { return !has(keptNo, n); });
    var why = {}, P = paths(tree, subject), RF = reqFams(tree);

    /* 1. 필수 갈래 자리 — 바로 앞 캐릭터와 다른 번호, 앞 넷이 모두 한 장이면 두 장 */
    var reqOf = function (c) { return isRequired(tree, c); };
    var prev = hist.length ? hist[hist.length - 1].cuts.filter(reqOf).map(function (c) { return c.cut; }).sort() : null;
    var last4 = hist.slice(-(TWO_REQUIRED_EVERY - 1));
    var needTwo = !refill && last4.length === TWO_REQUIRED_EVERY - 1 && last4.every(function (e) { return e.cuts.filter(reqOf).length < 2; });
    var keptReq = kept.filter(reqOf).map(function (c) { return c.cut; });
    var reqSlots;
    if (refill) reqSlots = keptReq.length ? [] : [slots[Math.floor(rand() * slots.length)]];
    else {
      var options = needTwo ? [[1, 2], [1, 3], [2, 3]] : [[1], [2], [3]];
      options = options.filter(function (s) { return !prev || s.join() !== prev.join(); });
      /* 이미 만든 컷(kept)을 두고 다시 정할 때 — 그 컷이 필수 갈래면 그 자리를 품은 짝만, 아니면 그 자리를 뺀 짝만 */
      options = options.filter(function (s) { return kept.every(function (c) { return reqOf(c) === has(s, c.cut); }); });
      if (!options.length) options = [keptReq.length ? keptReq.slice() : [slots[0]]];
      var posUse = recency(base.slice(-10), function (c) { return reqOf(c) ? 'p' + c.cut : null; });
      reqSlots = pick(options, function (s) { return s.reduce(function (a, n) { return a + (posUse['p' + n] || 0); }, 0); }, rand).filter(function (n) { return !has(keptNo, n); });
    }
    why.required = { slots: reqSlots, two: needTwo, prev: prev };   /* 말로 옮기기는 tools/casual-plan.cjs */

    /* 2. 장소 묶음과 길 — 필수 자리는 필수 의상 계열(최근에 덜 쓴 것)의 길, 나머지 중 한 장은 덜 쓴 묶음, 세 장 모두 다른 묶음.
          길(장소·하는 일)은 최근 10명·예약·배치에서 안 쓴 것, 작은 묶음은 한 바퀴, 남은 것 가운데 장부 전체에서 덜 쓴·생김새가 덜 몰린 것 */
    var groupUse = recency(base.slice(-GROUP_WINDOW).concat(others), function (c) { return groupOf(tree, c); });
    var famUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.ofam; });
    /* 시대는 새 칸만 센다 — 옛 칸(갈래·예시)엔 시대가 없어 변환표가 다 「지금」 으로 읽는다. 세면 한동안 지금이 아닌 시대만 나온다 */
    var eraUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.legacy ? null : c.era; });
    var pathUse = recency(base, pathKey);
    var low = lowGroups(tree, base.slice(-GROUP_WINDOW).concat(others));
    var everUsed = {};
    all.concat(others).forEach(function (e) { e.cuts.forEach(function (c) { everUsed[pathKey(c)] = 1; }); });
    var cuts = {}, takenGroups = kept.map(function (c) { return groupOf(tree, c); }), takenFams = kept.map(function (c) { return c.ofam; }), takenEras = kept.map(function (c) { return c.era; });
    var coveredPick = kept.some(function (c) { return (c.garments || []).some(function (g) { return has(COVERING, g); }); });
    /* 그 자리에서 고를 수 있는 길 — req 면 필수 계열 fam 이 있는 길, 아니면 필수가 아닌 계열이 있는 길 */
    function pathOptions(n, g, fam) {
      var open = g ? smallOpen(tree, all, g) : null;
      return P.list.filter(function (p) {
        if (g && p.group !== g) return false;
        if (has(takenGroups, p.group) || usedPath[p.key] || avoided(n, 'place', p.place) || avoided(n, 'act', p.act) || avoided(n, 'group', p.group)) return false;
        if (open && !has(open, p.key)) return false;
        return p.options.some(function (x) { return (fam ? x.fam === fam : !has(RF, x.fam)) && !avoided(n, 'ofam', x.fam) && !avoided(n, 'era', x.era); });
      });
    }
    var fresh = function (g, n) { return pathOptions(n, g).some(function (p) { return !everUsed[p.key]; }) ? FRESH_BONUS : 0; };
    var eraScore = function (e) { return ((eraUse[e] || 0) + 1 + 2 * takenEras.filter(function (x) { return x === e; }).length) / (ERA_WEIGHT[e] || 1); };
    function choose(n, p, fam) {
      var opts = p.options.filter(function (x) { return (fam ? x.fam === fam : !has(RF, x.fam)) && !avoided(n, 'ofam', x.fam) && !avoided(n, 'era', x.era); });
      var f = fam || pick(uniq(opts.map(function (x) { return x.fam; })), function (k) { return (famUse[k] || 0) + (has(takenFams, k) && k !== 'everyday' ? 3 : 0); }, rand);
      var era = pick(uniq(opts.filter(function (x) { return x.fam === f; }).map(function (x) { return x.era; })), eraScore, rand);
      return { cut: n, era: era, place: p.place, act: p.act, ofam: f };
    }
    var pathScore = function (p) { return (pathUse[p.key] || 0) + 0.5 * crowd(o.look, 'path:' + p.key) - (everUsed[p.key] ? 0 : 0.3); };
    reqSlots.forEach(function (n) {
      var fam = pick(RF.filter(function (f) { return !has(takenFams, f) && !avoided(n, 'ofam', f) && pathOptions(n, '', f).length; }), function (f) { return famUse[f] || 0; }, rand);
      var p = fam && pick(pathOptions(n, '', fam), pathScore, rand);
      if (!p) throw new Error('casual-plan: no path to a required outfit family (' + card + ' cut ' + n + ')');
      cuts[n] = choose(n, p, fam); takenGroups.push(p.group); takenFams.push(fam); takenEras.push(cuts[n].era);
    });
    var free = slots.filter(function (n) { return !has(reqSlots, n); });
    free.forEach(function (n, i) {
      var pool = tree.groups.map(function (g) { return g.key; }).filter(function (g) { return !has(takenGroups, g) && !avoided(n, 'group', g) && pathOptions(n, g).length; });
      if (i === 0 && !refill) { var lowPool = pool.filter(function (k) { return has(low, k); }); if (lowPool.length) pool = lowPool; }
      var g = pick(pool, function (k) { return (groupUse[k] || 0) - fresh(k, n) + 0.3 * crowd(o.look, 'group:' + k); }, rand);
      var p = g && pick(pathOptions(n, g), pathScore, rand);
      if (!p) throw new Error('casual-plan: no path left (' + card + ' cut ' + n + ')');
      cuts[n] = choose(n, p); takenGroups.push(p.group); takenFams.push(cuts[n].ofam); takenEras.push(cuts[n].era);
    });
    why.low = low;

    /* 3. 옷 — 의상 계열 안의 옷 하나(하는 일이 먼저 고르라는 옷이 있으면 그중에서). 옷 문장의 옷 종류가 garments.
          덮는 겉옷은 세 장 중 한 장까지, 한 장은 비교 대상이 안 쓴 옷 종류, 배치 앞 캐릭터가 잡은 새 옷 종류는 안 쓴다 */
    var garUse = recency(cmp.concat(base.slice(-EX_WINDOW)), function (c) { return c.garments || []; });
    var keptGar = [];
    kept.forEach(function (c) { keptGar = keptGar.concat(c.garments || []); });
    var covered = coveredPick || keptGar.some(function (g) { return has(COVERING, g); });
    /* 종목·하는 일 전용 옷(어느 하는 일이 먼저 고르라는 옷 — 펜싱복·양궁복·사이클 복장 …)은 그 하는 일에서만. 공원 놀이에 펜싱복이 붙었다(2026-10-29 시험) */
    var special = {};
    tree.activities.forEach(function (a) { (a.prefer || []).forEach(function (k) { special[k] = 1; }); });
    var newGar = keptGar.some(function (g) { return !gar[g]; });
    slots.forEach(function (n, i) {
      var c = cuts[n], a = CT.act(tree, c.act), last = i === slots.length - 1;
      var score = function (g) { return (garUse[g] || 0) + (gar[g] ? 1.5 : 0) + 0.3 * crowd(o.look, 'garment:' + g) - (last && !newGar && !gar[g] ? 10 : 0); };
      var items = CT.items(tree, c.ofam, '').filter(function (it) {
        var g = garmentsOf(it.en);
        return !avoided(n, 'item', it.key) && (!special[it.key] || has(a.prefer || [], it.key)) && g.length && !g.some(function (x) { return claimed.garment[x] || (covered && has(COVERING, x)); });
      });
      var prefer = items.filter(function (it) { return has(a.prefer || [], it.key); });
      if (prefer.length) items = prefer;
      var it = pick(items, function (x) { var g = garmentsOf(x.en); return g.reduce(function (t, y) { return t + score(y); }, 0) / g.length; }, rand), set;
      if (it) { c.item = it.key; set = garmentsOf(it.en); }
      else {
        /* 옷 문장이 옷 종류를 안 정하는 계열 — 갈래 옷 표에서 한 벌, 또는 상의 + 하의 */
        c.item = '';
        var pal = (PALETTE[c.ofam] || PALETTE['*']).filter(function (g) { return !(covered && has(COVERING, g)) && !claimed.garment[g]; });
        var one = pick(pal.filter(function (g) { return has(ONE_PIECE, g) || has(['uniform', 'apron'], g); }), score, rand);
        var top = pick(pal.filter(function (g) { return has(TOPS, g); }), score, rand), bot = pick(pal.filter(function (g) { return has(BOTTOMS, g); }), score, rand);
        var A1 = one ? [one] : null, B1 = top && bot ? [top, bot] : null;
        set = !A1 ? B1 : !B1 ? A1 : (score(A1[0]) <= (score(B1[0]) + score(B1[1])) / 2 ? A1 : B1);
        if (!set) set = [pal[0] || 'dress'];
      }
      set = uniq(set).sort();
      if (set.some(function (g) { return has(COVERING, g); })) covered = true;
      if (set.some(function (g) { return !gar[g]; })) newGar = true;
      c.garments = set;
    });

    /* 4. 표정·자세·방향·프레이밍·화각 — 세 장 서로 다르게, (방향, 프레이밍) 짝은 비교 대상과 겹치지 않게, 한 장은 새 방향이나 새 프레이밍.
          트리 규칙(자세 계열·앉는 자리·손·보이는 부위·안 쓰는 값·얼굴 클로즈업은 얼굴이 카메라 쪽인 방향만·필수 갈래 컷엔 안 씀) 안에서 */
    var exprs = concrete(S.EXPRESSION_OPTIONS), lenses = concrete(S.LENS_OPTIONS), allFrames = concrete(S.FRAME_OPTIONS);
    var use = function (field) { return recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c[field]; }); };
    var U = { expr: use('expr'), pose: use('pose'), orient: use('orient'), frame: use('frame'), lens: use('lens') };
    var pairUse = recency(base, function (c) { return c.orient + '|' + c.frame; });
    var taken = { expr: kept.map(function (c) { return c.expr; }).filter(Boolean), pose: kept.map(function (c) { return c.pose; }).filter(Boolean), orient: kept.map(function (c) { return c.orient; }), frame: kept.map(function (c) { return c.frame; }), lens: [] };
    var freshDone = kept.some(function (c) { return !orients[c.orient] || !frames[c.frame]; });
    slots.forEach(function (n, i) {
      var c = cuts[n], a = CT.act(tree, c.act), it = CT.item(tree, c.ofam, c.item), text = (a.en + ' ' + (it ? it.en : '')).toLowerCase();
      var lowItem = !!(it && it.low);
      var mustFresh = !refill && !freshDone && i === slots.length - 1;   /* 다시 채우기는 새 값 조건을 안 본다(장부 check 와 같게) */
      /* 짝 고르기 — 조건을 다 지키는 짝이 없으면 뒤에서부터 하나씩 풀어 다시 본다(새 값 → 배치가 잡은 값 → 비교 대상과 겹치는 짝).
         계획기는 그래도 계획을 낸다 — 장부 check 가 어긋난 것을 말해 주고, 씨앗을 바꿔 다시 정한다(멈추지 않는다) */
      var combos = [], step;
      for (step = 0; step < 4 && !combos.length; step++) {
        allFrames.forEach(function (fr) {
          if (has(taken.frame, fr) || avoided(n, 'frame', fr) || (step < 2 && claimed.frame[fr])) return;
          if (!CT.frameOk(tree, c.act, fr, c) || (lowItem && CT.frameRule(tree, fr).low === false)) return;
          var poseOK = CT.poses(tree, c.act, fr).filter(function (p) { return !has(taken.pose, p) && !avoided(n, 'pose', p) && poseFits(p, text) && !(has(STILL_FAMS, c.ofam) && has(RUNNING, p)); });
          CT.orients(tree, c.act, fr, S.CLOSE_FRAMES).forEach(function (or) {
            if (has(taken.orient, or) || avoided(n, 'orient', or) || (step < 2 && claimed.orient[or]) || !orientFits(or, text)) return;
            if (step < 3 && pairs[or + '|' + fr]) return;
            if (step < 1 && mustFresh && orients[or] && frames[fr]) return;
            /* 그 방향과 맞는 자세 — 얼굴을 보여야 하는 자세(쉿·엄지 척)는 등 쪽 방향과 안 맞는다(CT.orients 의 pose) */
            var ps = poseOK.filter(function (p) { return (!ORIENT_FOR[or] || has(ORIENT_FOR[or], p)) && has(CT.orients(tree, c.act, fr, S.CLOSE_FRAMES, p), or); });
            if (!ps.length && ORIENT_FOR[or] && poseOK.length) return;   /* 이 하는 일에 그 방향과 맞는 자세가 없으면 그 방향을 안 쓴다 */
            combos.push({ orient: or, frame: fr, poses: ps });
          });
        });
      }
      if (step > 1) (why.relaxed = why.relaxed || []).push({ cut: n, step: step - 1 });
      var best = pick(combos, function (x) { return (U.orient[x.orient] || 0) + (U.frame[x.frame] || 0) + 0.5 * (pairUse[x.orient + '|' + x.frame] || 0) + 0.3 * crowd(o.look, 'pair:' + x.orient + '|' + x.frame) - (!orients[x.orient] || !frames[x.frame] ? 0.5 : 0); }, rand);
      if (!best) throw new Error('casual-plan: no orientation/framing pair (' + card + ' cut ' + n + ' ' + pathKey(c) + ')');
      c.orient = best.orient; c.frame = best.frame;
      /* 자세 — 하는 일이 자세를 이미 정하면 비워 둔다(트리에 맞는 자세가 없을 때). 활동 자세는 하는 일과 맞을 때 조금 앞세운다 */
      c.pose = pick(best.poses, function (p) { return (U.pose[p] || 0) - (ACTIVITY[p] ? 0.7 : 0); }, rand) || '';
      var moods = EXPR_FOR[c.ofam] || WARM;
      c.expr = CT.exprOk(tree, c) ? pick(exprs.filter(function (v) { return !has(taken.expr, v) && !avoided(n, 'expr', v) && has(moods, v); }), function (v) { return U.expr[v] || 0; }, rand) || '' : '';
      c.lens = pick(lenses.filter(function (v) { return !has(taken.lens, v) && !avoided(n, 'lens', v) && CT.lensOk(tree, c.frame, v); }), function (v) { return U.lens[v] || 0; }, rand) || '';
      c.aspect = '2:3';
      if (c.expr) taken.expr.push(c.expr);
      if (c.pose) taken.pose.push(c.pose);
      taken.orient.push(c.orient); taken.frame.push(c.frame); taken.lens.push(c.lens);
      if (!orients[c.orient] || !frames[c.frame]) freshDone = true;
    });

    /* 5. 세부 강도 세 축 — 액션 비중은 자세·자세 계열에서, 분리형 선호는 옷에서, SOURCE 영향도는 세 장이 다르고 비교 대상과 구성이 겹치지 않게 */
    slots.forEach(function (n) {
      var c = cuts[n], fam = (CT.act(tree, c.act) || {}).family, meta = (tree.pose_meta || {})[c.pose] || {};
      c.axes = { action_level: has(MOVING, c.pose) || (!c.pose && has(['walk', 'move'], fam)) ? 'mostly active' : (meta.hands || has(['leaning_wall', 'leaning_furniture', 'bending_over'], c.pose) || (!c.pose && fam === 'low')) ? 'balanced' : 'mostly posed',
        separates_preference: c.garments.some(function (g) { return has(ONE_PIECE, g); }) && !c.garments.some(function (g) { return has(BOTTOMS, g); }) ? 'balanced' : 'prefer separates' };
    });
    var srcCombos = [], ia, ib, id;
    for (ia = 0; ia < 3; ia++) for (ib = 0; ib < 3; ib++) for (id = 0; id < 3; id++) srcCombos.push([SOURCE[ia], SOURCE[ib], SOURCE[id]]);
    var keptSrc = {};
    kept.forEach(function (c) { keptSrc[c.cut] = (c.axes || {}).source_influence; });
    var srcUse = recency(base.slice(-EX_WINDOW), function (c) { return (c.axes || {}).source_influence; });
    var okSrc = srcCombos.filter(function (s) {
      var full = [1, 2, 3].map(function (n, i) { return keptSrc[n] || s[i]; });
      if (kept.some(function (c) { return keptSrc[c.cut] && s[[1, 2, 3].indexOf(c.cut)] !== keptSrc[c.cut]; })) return false;
      if (uniq(full).length === 1) return false;
      if (refill) return true;
      var sorted = full.slice().sort().join();
      return !cmp.some(function (e) {
        if (e.cuts.length === 3 && e.cuts.map(function (c) { return (c.axes || {}).source_influence; }).sort().join() === sorted) return true;
        var same = [1, 2, 3].filter(function (n, i) {
          var c = cuts[n] || kept.filter(function (k) { return k.cut === n; })[0], ax = c && c.axes ? { action_level: c.axes.action_level, source_influence: full[i], separates_preference: c.axes.separates_preference } : null;
          return ax && e.cuts.some(function (x) { var y = x.axes || {}; return y.action_level === ax.action_level && y.source_influence === ax.source_influence && y.separates_preference === ax.separates_preference; });
        }).length;
        return same >= 2;
      });
    });
    if (!okSrc.length && (o._tries || 0) >= 20) {
      /* 씨앗을 스무 번 바꿔도 겹치면 — 세 장이 다르기만 한 구성으로 낸다(장부 check 가 겹침을 말하고 다시 정한다). 끝없이 다시 부르면 호출이 넘친다 */
      okSrc = srcCombos.filter(function (s) { return uniq([1, 2, 3].map(function (n, i) { return keptSrc[n] || s[i]; })).length > 1; });
      why.relaxed = (why.relaxed || []).concat([{ axes: true }]);
    }
    if (!okSrc.length) {
      /* 세 축이 겹치면 분리형 선호를 한 단 올려 다시 본다 */
      return plan(Object.assign({}, o, { seed: String(o.seed != null ? o.seed : card) + '+', _tries: (o._tries || 0) + 1 }));
    }
    var src = pick(okSrc, function (s) { return s.reduce(function (t, v) { return t + (srcUse[v] || 0); }, 0); }, rand);
    slots.forEach(function (n) {
      var c = cuts[n];
      c.axes = { overall_intensity: FIXED_AXES.overall_intensity, skin_exposure: FIXED_AXES.skin_exposure,
        action_level: c.axes.action_level, source_influence: src[n - 1], separates_preference: c.axes.separates_preference };
    });

    /* 6. 드러내는 방식·장면 첫머리 — 의상·장면 칸을 쓸 때의 길잡이(장부의 expose·lead 로 다음 계획이 피한다) */
    var exposeUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.expose || []; });
    var usedPairs = {};
    base.slice(-EX_WINDOW).concat(others).forEach(function (e) { e.cuts.forEach(function (c) { if (c.expose && c.expose.length === 2) usedPairs[c.expose.slice().sort().join('+')] = 1; }); });
    var takenExpose = [], leads = LEAD.slice();
    slots.forEach(function (n) {
      var c = cuts[n], list = EXPOSE_FOR[exposeKind(c.garments)].filter(function (x) { return !has(takenExpose, x); }), first, second;
      first = pick(list, function (x) { return exposeUse[x] || 0; }, rand);
      second = pick(list.filter(function (x) { return x !== first && !usedPairs[[first, x].sort().join('+')]; }), function (x) { return exposeUse[x] || 0; }, rand) || list.filter(function (x) { return x !== first; })[0];
      c.expose = [first, second];
      takenExpose.push(first, second);
      c.lead = leads.splice(Math.floor(rand() * leads.length), 1)[0];
    });

    var out = [1, 2, 3].map(function (n) {
      var k = (o.kept || []).filter(function (c) { return c.cut === n; })[0];
      return k ? Object.assign({ kept: true }, k) : cuts[n];
    });
    var claims = { garment: [], orient: [], frame: [] };
    slots.forEach(function (n) {
      var c = cuts[n];
      c.garments.forEach(function (g) { if (!gar[g] && !has(claims.garment, g)) claims.garment.push(g); });
      if (!orients[c.orient]) claims.orient.push(c.orient);
      if (!frames[c.frame]) claims.frame.push(c.frame);
    });
    return { card: card, cuts: out, why: why, claims: claims, refill: refill || undefined };
  }

  /* ── 버전2 계획(2026-10-30) — 같은 장부 조건, 몸 쪽은 버전2 모듈(lib/casual-tree-v2.js)의 자세 추천 · 칸 안에서 ──
     o 는 plan 과 같고 tree2(data/casual-tree-v2.json)가 더 있다. 돌려주는 컷은 버전2 칸 그대로(treeV 2) + 세 축 · 옷 종류 · 드러내기 · 첫머리 */
  var V2_FIELDS = ['era', 'place', 'weather', 'ofam', 'item', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'legs', 'gaze', 'expr', 'preset'];
  function planV2(o) {
    var S = o.S, tree = o.tree, CT = tree_(), C2 = tree2_(), subject = o.subject || null, card = o.card, refill = !!o.refill, avoid = o.avoid || [];
    if (!tree || !o.tree2) throw new Error('casual-plan v2: tree (data/casual-tree.json) and tree2 (data/casual-tree-v2.json) are required');
    setExtra(o.tree2);
    var t = C2.make(o.tree2, tree);
    var batch = (o.batch || []).map(function (b) { return Object.assign({}, b, { cuts: normEntries(tree, [b])[0].cuts }); });
    var kept = (o.kept || []).map(function (c) { return pathOf(tree, c); });
    var rand = rng(o.seed != null ? o.seed : card), names = [card].concat(batch.map(function (b) { return b.card; }));
    var all = normEntries(tree, (o.entries || []).filter(function (e) { return e && e.cuts; }));
    var base = all.filter(function (e) { return !has(names, e.card); });
    var reserved = base.filter(function (e) { return e.status === 'reserved'; });
    var others = batch.map(function (b) { return { card: b.card, cuts: b.cuts }; });
    var fixed = normEntries(tree, (o.fixed || []).filter(function (f) { return f.card !== card; }).map(function (f) { return { card: f.card, cuts: f.cuts }; }));
    var cmp = base.slice(-CMP_WINDOW).concat(reserved.slice(-CMP_RESERVED).filter(function (e) { return base.slice(-CMP_WINDOW).indexOf(e) < 0; }), others, fixed);
    var exw = base.slice(-EX_WINDOW).concat(reserved.filter(function (e) { return base.slice(-EX_WINDOW).indexOf(e) < 0; }), others, fixed);
    var hist = base.concat(others);
    var usedPath = {}, pairs = {}, orients = {}, frames = {}, gar = {};
    exw.forEach(function (e) { e.cuts.forEach(function (c) { usedPath[pathKey(c)] = 1; }); });
    cmp.forEach(function (e) { e.cuts.forEach(function (c) { pairs[c.orient + '|' + c.frame] = 1; orients[c.orient] = 1; frames[c.frame] = 1; (c.garments || []).forEach(function (g) { gar[g] = 1; }); }); });
    var claimed = { garment: {}, orient: {}, frame: {} };
    batch.forEach(function (b) { var k; for (k in claimed) ((b.claims || {})[k] || []).forEach(function (v) { claimed[k][v] = 1; }); });
    var avoided = function (cut, field, value) { return avoid.some(function (a) { return (a.cut == null || a.cut === cut) && a.field === field && a.value === value; }); };
    var keptNo = kept.map(function (c) { return c.cut; });
    var slots = [1, 2, 3].filter(function (n) { return !has(keptNo, n); });
    var why = { tree: 2 }, RF = reqFams(tree);

    /* 1. 필수 갈래 자리 — plan 과 같다 */
    var reqOf = function (c) { return isRequired(tree, c); };
    var prev = hist.length ? hist[hist.length - 1].cuts.filter(reqOf).map(function (c) { return c.cut; }).sort() : null;
    var last4 = hist.slice(-(TWO_REQUIRED_EVERY - 1));
    var needTwo = !refill && last4.length === TWO_REQUIRED_EVERY - 1 && last4.every(function (e) { return e.cuts.filter(reqOf).length < 2; });
    var keptReq = kept.filter(reqOf).map(function (c) { return c.cut; }), reqSlots;
    if (refill) reqSlots = keptReq.length ? [] : [slots[Math.floor(rand() * slots.length)]];
    else {
      var options = (needTwo ? [[1, 2], [1, 3], [2, 3]] : [[1], [2], [3]]).filter(function (x) { return !prev || x.join() !== prev.join(); });
      options = options.filter(function (x) { return kept.every(function (c) { return reqOf(c) === has(x, c.cut); }); });
      if (!options.length) options = [keptReq.length ? keptReq.slice() : [slots[0]]];
      var posUse = recency(base.slice(-10), function (c) { return reqOf(c) ? 'p' + c.cut : null; });
      reqSlots = pick(options, function (x) { return x.reduce(function (a, n) { return a + (posUse['p' + n] || 0); }, 0); }, rand).filter(function (n) { return !has(keptNo, n); });
    }
    why.required = { slots: reqSlots, two: needTwo, prev: prev };

    /* 2. 장소 · 시대 · 의상 계열 — 버전2 는 의상을 장소가 거르지 않는다(시대만). 세 장은 다른 묶음, 한 장은 덜 쓴 묶음, 장소는 최근에 덜 쓴 것 */
    var places = C2.allPlaces(t).filter(function (p) { return t.v2.places[p.key]; }).map(function (p) {
      return { key: p.key, group: p.group, eras: (p.eras || []).filter(function (e) { return !C2.why(t, { era: e }, 'place', p.key, subject); }) };
    }).filter(function (p) { return p.eras.length; });
    var groupUse = recency(base.slice(-GROUP_WINDOW).concat(others), function (c) { return groupOf(tree, c); });
    var famUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.ofam; });
    var eraUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.legacy ? null : c.era; });
    var placeUse = recency(base, function (c) { return c.place; });
    var low = lowGroups(tree, base.slice(-GROUP_WINDOW).concat(others));
    var cuts = {}, takenGroups = kept.map(function (c) { return (C2.place(t, c.place) || {}).group; }), takenFams = kept.map(function (c) { return c.ofam; }), takenEras = kept.map(function (c) { return c.era; });
    var awkUsed = kept.some(function (c) { return C2.awkward(t, c.ofam, c.place).length; });
    var eraScore = function (e) { return ((eraUse[e] || 0) + 1 + 2 * takenEras.filter(function (x) { return x === e; }).length) / (ERA_WEIGHT[e] || 1); };
    var famsAt = function (p, era, req) { var e = CT.era(tree, era); return (e ? e.outfits : []).filter(function (f) { return (req ? f === req : !has(RF, f)) && !avoided(0, 'ofam', f); }); };
    function placeOptions(n, g, req) {
      return places.filter(function (p) {
        if (g && p.group !== g) return false;
        if (has(takenGroups, p.group) || avoided(n, 'place', p.key) || avoided(n, 'group', p.group)) return false;
        return p.eras.some(function (e) { return !avoided(n, 'era', e) && famsAt(p, e, req).some(function (f) { return !avoided(n, 'ofam', f); }); });
      });
    }
    var placeScore = function (p) { return (placeUse[p.key] || 0) + 0.3 * crowd(o.look, 'group:' + p.group); };
    function choose(n, p, req) {
      var eras = p.eras.filter(function (e) { return !avoided(n, 'era', e) && famsAt(p, e, req).length; });
      var era = pick(eras, eraScore, rand);
      var fams = famsAt(p, era, req).filter(function (f) { return !avoided(n, 'ofam', f); });
      var calm = fams.filter(function (f) { return !C2.awkward(t, f, p.key).length; });
      if (awkUsed || calm.length) fams = calm.length ? calm : fams;
      var f = req || pick(fams, function (k) { return (famUse[k] || 0) + (has(takenFams, k) && k !== 'everyday' ? 3 : 0); }, rand);
      if (C2.awkward(t, f, p.key).length) awkUsed = true;
      return { cut: n, treeV: 2, era: era, place: p.key, ofam: f };
    }
    reqSlots.forEach(function (n) {
      var fam = pick(RF.filter(function (f) { return !has(takenFams, f) && !avoided(n, 'ofam', f) && placeOptions(n, '', f).length; }), function (f) { return famUse[f] || 0; }, rand);
      var p = fam && pick(placeOptions(n, '', fam), placeScore, rand);
      if (!p) throw new Error('casual-plan v2: no place for a required outfit family (' + card + ' cut ' + n + ')');
      cuts[n] = choose(n, p, fam); takenGroups.push(p.group); takenFams.push(fam); takenEras.push(cuts[n].era);
    });
    slots.filter(function (n) { return !has(reqSlots, n); }).forEach(function (n, i) {
      var pool = uniq(places.map(function (p) { return p.group; })).filter(function (g) { return !has(takenGroups, g) && !avoided(n, 'group', g) && placeOptions(n, g).length; });
      if (i === 0 && !refill) { var lowPool = pool.filter(function (k) { return has(low, k); }); if (lowPool.length) pool = lowPool; }
      var g = pick(pool, function (k) { return (groupUse[k] || 0) + 0.3 * crowd(o.look, 'group:' + k); }, rand);
      var p = g && pick(placeOptions(n, g), placeScore, rand);
      if (!p) throw new Error('casual-plan v2: no place left (' + card + ' cut ' + n + ')');
      cuts[n] = choose(n, p); takenGroups.push(p.group); takenFams.push(cuts[n].ofam); takenEras.push(cuts[n].era);
    });
    why.low = low;

    /* 3. 옷 — plan 과 같은 규칙(하는 일 전용 옷은 버전2 에선 안 고른다 — 하는 일이 없다) */
    var garUse = recency(cmp.concat(base.slice(-EX_WINDOW)), function (c) { return c.garments || []; });
    var keptGar = [];
    kept.forEach(function (c) { keptGar = keptGar.concat(c.garments || []); });
    var covered = keptGar.some(function (g) { return has(COVERING, g); }), special = {};
    tree.activities.forEach(function (a) { (a.prefer || []).forEach(function (k) { special[k] = 1; }); });
    var newGar = keptGar.some(function (g) { return !gar[g]; });
    slots.forEach(function (n, i) {
      var c = cuts[n], last = i === slots.length - 1;
      var score = function (g) { return (garUse[g] || 0) + (gar[g] ? 1.5 : 0) + 0.3 * crowd(o.look, 'garment:' + g) - (last && !newGar && !gar[g] ? 10 : 0); };
      var items = CT.items(tree, c.ofam, '').filter(function (it) {
        var g = garmentsOf(it.en);
        return !avoided(n, 'item', it.key) && !special[it.key] && g.length && !g.some(function (x) { return claimed.garment[x] || (covered && has(COVERING, x)); });
      });
      var it = pick(items, function (x) { var g = garmentsOf(x.en); return g.reduce(function (tt, y) { return tt + score(y); }, 0) / g.length; }, rand), set;
      if (it) { c.item = it.key; set = garmentsOf(it.en); }
      else {
        c.item = '';
        var pal = (PALETTE[c.ofam] || PALETTE['*']).filter(function (g) { return !(covered && has(COVERING, g)) && !claimed.garment[g]; });
        var one = pick(pal.filter(function (g) { return has(ONE_PIECE, g) || has(['uniform', 'apron'], g); }), score, rand);
        var top = pick(pal.filter(function (g) { return has(TOPS, g); }), score, rand), bot = pick(pal.filter(function (g) { return has(BOTTOMS, g); }), score, rand);
        var A1 = one ? [one] : null, B1 = top && bot ? [top, bot] : null;
        set = !A1 ? B1 : !B1 ? A1 : (score(A1[0]) <= (score(B1[0]) + score(B1[1])) / 2 ? A1 : B1);
        if (!set) set = [pal[0] || 'dress'];
      }
      set = uniq(set).sort();
      if (set.some(function (g) { return has(COVERING, g); })) covered = true;
      if (set.some(function (g) { return !gar[g]; })) newGar = true;
      c.garments = set;
    });

    /* 4. 몸 쪽 — 그 장소 · 시대 · 의상에서 쓸 수 있는 자세 추천 + 칸마다 뽑은 장면 몇 개 가운데,
          세 장 서로 다른 프레이밍 · 몸 방향+머리 방향 · 추천, (몸+머리, 프레이밍) 짝은 비교 대상과 겹치지 않게, 한 장은 새 값, 장소/짓은 10명 안에서 안 겹치게 */
    var exprs = concrete(S.EXPRESSION_OPTIONS);
    var use = function (f) { return recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c[f]; }); };
    var U = { expr: use('expr'), orient: use('orient'), frame: use('frame'), pose: use('pose'), use: use('use') };
    var pairUse = recency(base, function (c) { return c.orient + '|' + c.frame; });
    var taken = { expr: kept.map(function (c) { return c.expr; }).filter(Boolean), orient: kept.map(function (c) { return c.orient; }), frame: kept.map(function (c) { return c.frame; }), pose: kept.map(function (c) { return c.pose; }).filter(Boolean) };
    var freshDone = kept.some(function (c) { return !orients[c.orient] || !frames[c.frame]; });
    slots.forEach(function (n, i) {
      var c = cuts[n], sc0 = { treeV: 2, era: c.era, place: c.place, ofam: c.ofam, item: c.item };
      var mustFresh = !refill && !freshDone && i === slots.length - 1;
      var cands = [];
      C2.presets(t, sc0, subject).forEach(function (p) { cands.push(C2.repair(t, C2.applyPreset(t, sc0, p.key), subject, function (l) { return l[Math.floor(rand() * l.length)]; })); });
      for (var k = 0; k < 8; k++) cands.push(C2.random(t, sc0, subject, rand, ['era', 'place', 'ofam', 'item'], { preset: false }));
      /* 소품을 쓰는 손이면 소품 동작 — 덜 쓴 것(역할 동작 · 동료 동작 포함) */
      cands = cands.map(function (x) {
        if (!C2.propSides(x)) return x;
        var us = C2.choices(t, x, 'use', subject).filter(function (u) { return !avoided(n, 'use', u); });
        var u = pick(us, function (k2) { return (U.use[k2] || 0) - (C2.use(t, k2).role ? 0.3 : 0); }, rand);
        return u ? C2.set(t, x, 'use', u, subject) : x;
      }).map(function (x) { return pathOf(tree, x); });
      var ok = function (x, step) {
        if (!x.frame || has(taken.frame, x.frame) || avoided(n, 'frame', x.frame) || (step < 2 && claimed.frame[x.frame])) return false;
        if (has(taken.orient, x.orient) || avoided(n, 'body', x.body) || avoided(n, 'posture', x.posture) || (step < 2 && claimed.orient[x.orient])) return false;
        if (x.pose && has(taken.pose, x.pose)) return false;
        if (usedPath[pathKey(x)] || avoided(n, 'use', x.use)) return false;
        if (step < 3 && pairs[x.orient + '|' + x.frame]) return false;
        if (step < 1 && mustFresh && orients[x.orient] && frames[x.frame]) return false;
        return true;
      };
      var pool = [], step;
      for (step = 0; step < 4 && !pool.length; step++) pool = cands.filter(function (x) { return ok(x, step); });
      if (step > 1) (why.relaxed = why.relaxed || []).push({ cut: n, step: step - 1 });
      var best = pick(pool, function (x) { return (U.orient[x.orient] || 0) + (U.frame[x.frame] || 0) + 0.5 * (pairUse[x.orient + '|' + x.frame] || 0) + (U.pose[x.pose] || 0) + (U.use[x.use] || 0) +
        0.5 * crowd(o.look, 'path:' + pathKey(x)) + 0.3 * crowd(o.look, 'pair:' + x.orient + '|' + x.frame) - (!orients[x.orient] || !frames[x.frame] ? 0.5 : 0); }, rand);
      if (!best) throw new Error('casual-plan v2: no body / framing for ' + card + ' cut ' + n + ' (' + c.place + ')');
      V2_FIELDS.forEach(function (f) { if (f !== 'expr') c[f] = best[f] || ''; });
      /* 표정 — 얼굴이 보이면 의상 계열에 어울리는 것, 세 장 서로 다르게 */
      var bd = (t.v2.body.filter(function (b) { return b.key === c.body; })[0]) || {}, hd = (t.v2.head.filter(function (h) { return h.key === c.head; })[0]) || {};
      var moods = EXPR_FOR[c.ofam] || WARM;
      c.expr = bd.face_hidden && !hd.look_back ? '' : pick(exprs.filter(function (v) { return !has(taken.expr, v) && !avoided(n, 'expr', v) && has(moods, v); }), function (v) { return U.expr[v] || 0; }, rand) || '';
      c.aspect = '2:3';
      if (c.expr) taken.expr.push(c.expr);
      if (best.pose) taken.pose.push(best.pose);
      taken.orient.push(best.orient); taken.frame.push(c.frame);
      if (!orients[best.orient] || !frames[c.frame]) freshDone = true;
    });

    /* 5. 세부 강도 세 축 — 액션 비중은 몸 자세에서, 분리형은 옷에서, SOURCE 영향도는 plan 과 같은 규칙 */
    slots.forEach(function (n) {
      var c = cuts[n], po = C2.posture(t, c.posture) || {}, u = C2.use(t, c.use);
      c.axes = { action_level: po.family === 'walk' ? 'mostly active' : (po.family === 'low' || has(['lean_counter', 'sit_lean', 'lean_rail', 'lean_wall'], c.posture) || (u && u.hands === 'both')) ? 'balanced' : 'mostly posed',
        separates_preference: c.garments.some(function (g) { return has(ONE_PIECE, g); }) && !c.garments.some(function (g) { return has(BOTTOMS, g); }) ? 'balanced' : 'prefer separates' };
    });
    var srcCombos = [], ia, ib, id;
    for (ia = 0; ia < 3; ia++) for (ib = 0; ib < 3; ib++) for (id = 0; id < 3; id++) srcCombos.push([SOURCE[ia], SOURCE[ib], SOURCE[id]]);
    var keptSrc = {};
    kept.forEach(function (c) { keptSrc[c.cut] = (c.axes || {}).source_influence; });
    var srcUse = recency(base.slice(-EX_WINDOW), function (c) { return (c.axes || {}).source_influence; });
    var okSrc = srcCombos.filter(function (x) {
      var full = [1, 2, 3].map(function (n, i) { return keptSrc[n] || x[i]; });
      if (kept.some(function (c) { return keptSrc[c.cut] && x[[1, 2, 3].indexOf(c.cut)] !== keptSrc[c.cut]; })) return false;
      if (uniq(full).length === 1) return false;
      if (refill) return true;
      var sorted = full.slice().sort().join();
      return !cmp.some(function (e) {
        if (e.cuts.length === 3 && e.cuts.map(function (c) { return (c.axes || {}).source_influence; }).sort().join() === sorted) return true;
        var same = [1, 2, 3].filter(function (n, i) {
          var c = cuts[n] || kept.filter(function (k) { return k.cut === n; })[0], ax = c && c.axes ? { action_level: c.axes.action_level, source_influence: full[i], separates_preference: c.axes.separates_preference } : null;
          return ax && e.cuts.some(function (y) { var z = y.axes || {}; return z.action_level === ax.action_level && z.source_influence === ax.source_influence && z.separates_preference === ax.separates_preference; });
        }).length;
        return same >= 2;
      });
    });
    if (!okSrc.length && (o._tries || 0) >= 20) {
      okSrc = srcCombos.filter(function (x) { return uniq([1, 2, 3].map(function (n, i) { return keptSrc[n] || x[i]; })).length > 1; });
      why.relaxed = (why.relaxed || []).concat([{ axes: true }]);
    }
    if (!okSrc.length) return planV2(Object.assign({}, o, { seed: String(o.seed != null ? o.seed : card) + '+', _tries: (o._tries || 0) + 1 }));
    var src = pick(okSrc, function (x) { return x.reduce(function (tt, v) { return tt + (srcUse[v] || 0); }, 0); }, rand);
    slots.forEach(function (n) {
      var c = cuts[n];
      c.axes = { overall_intensity: FIXED_AXES.overall_intensity, skin_exposure: FIXED_AXES.skin_exposure,
        action_level: c.axes.action_level, source_influence: src[n - 1], separates_preference: c.axes.separates_preference };
    });

    /* 6. 드러내는 방식 · 장면 첫머리 — plan 과 같다 */
    var exposeUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.expose || []; });
    var usedPairs = {};
    base.slice(-EX_WINDOW).concat(others).forEach(function (e) { e.cuts.forEach(function (c) { if (c.expose && c.expose.length === 2) usedPairs[c.expose.slice().sort().join('+')] = 1; }); });
    var takenExpose = [], leads = LEAD.slice();
    slots.forEach(function (n) {
      var c = cuts[n], list = EXPOSE_FOR[exposeKind(c.garments)].filter(function (x) { return !has(takenExpose, x); }), first, second;
      first = pick(list, function (x) { return exposeUse[x] || 0; }, rand);
      second = pick(list.filter(function (x) { return x !== first && !usedPairs[[first, x].sort().join('+')]; }), function (x) { return exposeUse[x] || 0; }, rand) || list.filter(function (x) { return x !== first; })[0];
      c.expose = [first, second];
      takenExpose.push(first, second);
      c.lead = leads.splice(Math.floor(rand() * leads.length), 1)[0];
    });
    var out = [1, 2, 3].map(function (n) {
      var k = (o.kept || []).filter(function (c) { return c.cut === n; })[0];
      return k ? Object.assign({ kept: true }, k) : cuts[n];
    });
    var claims = { garment: [], orient: [], frame: [] };
    slots.forEach(function (n) {
      var c = cuts[n], or = (c.body || '') + '+' + (c.head || '');
      c.garments.forEach(function (g) { if (!gar[g] && !has(claims.garment, g)) claims.garment.push(g); });
      if (!orients[or]) claims.orient.push(or);
      if (!frames[c.frame]) claims.frame.push(c.frame);
    });
    return { card: card, cuts: out, why: why, claims: claims, refill: refill || undefined };
  }

  /* 생성기 주소 — prompt.html?mech=<카드>&casual=<선택값 JSON>. 생성기는 받은 값을 채우고 모두 잠근다 */
  var SCENE_FIELDS = ['era', 'place', 'act', 'ofam', 'item', 'expr', 'pose', 'orient', 'frame', 'lens'];
  function generatorQuery(card, cut) {
    var v = {}, k;
    /* 버전2 컷은 버전2 칸 그대로(treeV 2) — 생성기(lib/prompt-state.js planned)가 버전2 로 채우고 잠근다 */
    if (cut.treeV === 2) {
      v.treeV = 2;
      V2_FIELDS.forEach(function (f) { if (cut[f]) v[f] = cut[f]; });
      v.aspect = cut.aspect || '2:3'; v.axes = cut.axes;
      return 'mech=' + encodeURIComponent(card) + '&casual=' + encodeURIComponent(JSON.stringify(v));
    }
    for (k = 0; k < SCENE_FIELDS.length; k++) v[SCENE_FIELDS[k]] = cut[SCENE_FIELDS[k]] || '';
    v.aspect = cut.aspect || '2:3'; v.axes = cut.axes;
    return 'mech=' + encodeURIComponent(card) + '&casual=' + encodeURIComponent(JSON.stringify(v));
  }
  /* 생성기가 주소의 값을 받아들일 때 — 트리 위의 값만, 나머지는 버린다. 예전 주소(갈래·예시)는 변환표로. 돌려주는 것 { scene, locks, bad } */
  function fromQuery(S, raw, tree, subject) {
    var v, scene = {}, locks = {}, bad = [], axes = {}, k, CT = tree_();
    try { v = JSON.parse(raw); } catch (e) { return null; }
    if (!v || typeof v !== 'object' || !tree) return null;
    if (!v.place && v.cat) v = Object.assign({}, v, pathOf(tree, { cat: v.cat, ex: v.ex }));
    var ok = {
      era: function () { return !!CT.era(tree, v.era); },
      place: function () { return CT.places(tree, scene.era, subject || null).some(function (p) { return p.key === v.place; }); },
      act: function () { return CT.acts(tree, scene.era, scene.place).some(function (a) { return a.key === v.act; }); },
      ofam: function () { return CT.outfitFamilies(tree, scene.era, scene.place, scene.act).some(function (f) { return f.key === v.ofam; }); },
      frame: function () { return has(concrete(S.FRAME_OPTIONS), v.frame) && CT.frameOk(tree, scene.act, v.frame, scene); },
      item: function () { return CT.items(tree, scene.ofam, scene.frame).some(function (i) { return i.key === v.item; }); },
      lens: function () { return has(concrete(S.LENS_OPTIONS), v.lens) && CT.lensOk(tree, scene.frame, v.lens); },
      pose: function () { return has(CT.poses(tree, scene.act, scene.frame), v.pose); },
      orient: function () { return has(CT.orients(tree, scene.act, scene.frame, S.CLOSE_FRAMES, scene.pose), v.orient); },
      expr: function () { return has(concrete(S.EXPRESSION_OPTIONS), v.expr) && CT.exprOk(tree, Object.assign({}, scene, { orient: v.orient })); }
    };
    var opt = { item: 1, pose: 1, expr: 1 };   /* 비어 와도 되는 칸(옷 자동 · 하는 일대로 · 표정 없음) */
    ['era', 'place', 'act', 'ofam', 'frame', 'item', 'lens', 'pose', 'orient', 'expr'].forEach(function (k) {
      if (opt[k] && !v[k]) { scene[k] = ''; locks[k] = true; return; }
      if (v[k] && ok[k]()) { scene[k] = v[k]; locks[k] = true; } else { scene[k] = ''; bad.push(k); }
    });
    if (has(['2:3', '3:2', '1:1', '9:16', '16:9'], v.aspect)) { scene.aspect = v.aspect; locks.aspect = true; }
    for (k in (v.axes || {})) if (S.ADVANCED_OPTIONS[k] && has(S.LOCAL_AXES, k) && has(S.ADVANCED_OPTIONS[k], v.axes[k]) && v.axes[k] !== 'AUTO') { axes[k] = v.axes[k]; locks['axes.' + k] = true; }
    scene.axes = axes;
    return { scene: scene, locks: locks, bad: bad };
  }

  var api = { plan: plan, planV2: planV2, V2_FIELDS: V2_FIELDS, jitOf: jitOf, generatorQuery: generatorQuery, fromQuery: fromQuery, garmentsOf: garmentsOf, poseFits: poseFits, orientFits: orientFits, pathOf: pathOf, pathKey: pathKey,
    isRequired: isRequired, paths: paths, GARMENTS: GARMENTS, EXPOSE: EXPOSE, LEAD: LEAD,
    REQUIRED: REQUIRED, COVERING: COVERING, EX_WINDOW: EX_WINDOW, CMP_WINDOW: CMP_WINDOW, CMP_RESERVED: CMP_RESERVED, SMALL_GROUP: SMALL_GROUP, GROUP_LOW: GROUP_LOW };
  root.AtelierCasualPlan = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
