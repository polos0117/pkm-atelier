/* 일상컷 계획기 — 생성 전에 세 장의 생성기 선택값을 도구가 정한다(2026-10-22).
   GPT 가 계획을 짜고 tools/casual-ledger.py check 가 거르던 것을, 이 모듈이 처음부터 장부 조건 안에서 고른다.
   IMAGE_RULES.md 3절 "일상컷 장면 설정 순서" 의 장부 조건(예시 10명·한 바퀴, 필수 갈래 자리·다섯 명에 두 장, 덜 쓴 갈래,
   (방향, 프레이밍) 짝·새 값, 옷 종류 새로·덮는 겉옷 한 장, 세 축)을 지키고, 남은 후보 가운데서는
   최근에 덜 쓴 값 · 생김새가 몰린 적이 적은 값(Rust casual-look 색인이 주는 crowd)을 고른다. 같은 입력·씨앗이면 같은 답.

   브라우저(window.AtelierCasualPlan)와 node(module.exports)가 같이 쓴다 — 명령줄은 tools/casual-plan.cjs.
   plan({ S, entries, card, batch, seed, look, refill, kept, avoid })
     S        lib/prompt-spec.js 의 AtelierSpec
     entries  장부의 살아 있는 칸(done + 다른 세션의 reserved), 시각 차례 — casual-ledger.py view 가 준다
     batch    이번 배치에서 먼저 정한 다른 캐릭터 [{card, cuts}]
     look     { crowd: { 'ex:<cat>/<ex>': n, 'pair:<orient>|<frame>': n, 'garment:<g>': n } } — 없으면 0
     refill   빈 컷 다시 채우기 — kept 에 이미 등록된 컷을 주면 그 번호는 그대로 두고 나머지만 정한다
     avoid    [{cut, field, value}] — 이미지 도구가 막았거나 장면과 맞지 않아 다시 정할 때 피할 값
   돌려주는 것 { card, cuts:[{cut, cat, ex, expr, pose, orient, frame, lens, aspect, axes, garments, expose, lead, why}] } */
(function (root) {
  'use strict';

  var REQUIRED = ['adult_roleplay', 'swimwear', 'lingerie'];
  var NOT_COUNTED = ['auto_random', '__custom__', 'everyday'];
  var BANNED_FRAME = ['face_close', 'detail'];
  var BANNED_ORIENT = ['back', 'back_to_camera', 'walking_away'];
  var EX_WINDOW = 10, CMP_WINDOW = 3, CAT_WINDOW = 10, CAT_LOW = 5, SMALL_CAT = 8, TWO_REQUIRED_EVERY = 5;
  var FIXED_AXES = { overall_intensity: 'strong', skin_exposure: 'bold' };
  var SOURCE = ['subtle', 'balanced', 'strong'];

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
  /* 예시 문구에 옷이 없을 때 갈래마다 고를 수 있는 옷 — 한 벌, 또는 상의 + 하의(+ 겉옷 하나) */
  var PALETTE = {
    homewear: ['robe', 'slip', 'tank', 'crop_top', 'knit_top', 'shorts'],
    private_evening: ['dress', 'slip', 'jumpsuit', 'blouse', 'skirt', 'trousers'],
    active: ['crop_top', 'tank', 'leggings', 'shorts', 'jumpsuit'],
    traditional: ['traditional'],
    adult_roleplay: ['uniform', 'vest', 'skirt', 'shorts', 'dress'],
    swimwear: ['bikini', 'swimsuit'],
    lingerie: ['lingerie_set', 'slip'],
    source_editorial: ['dress', 'jumpsuit', 'coat', 'crop_top', 'skirt', 'trousers'],
    occupation_basic: ['overalls', 'shirt', 'vest', 'trousers', 'shorts', 'apron', 'jacket', 'skirt'],
    occupation_sensual: ['shirt', 'blouse', 'vest', 'skirt', 'trousers', 'dress', 'jacket'],
    partner_care: ['overalls', 'tank', 'shirt', 'shorts', 'skirt', 'trousers'],
    food_berries: ['dress', 'apron', 'tank', 'blouse', 'shorts', 'skirt'],
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
  var MOVING = ['walking', 'mid_stride', 'small_jog', 'dance_step', 'turning_back', 'waving', 'on_tiptoe', 'stretching', 'mid_action'];
  /* 손에 무엇을 든 자세는 예시 문구에 그 물건·일이 있을 때만 */
  var ACTIVITY = {
    holding_cup: /\b(cup|coffee|tea|drink|latte|mug|juice)\b/, reading_book: /\b(book|read|reading|guide|novel|page)\b/,
    offering_food: /\b(treat|snack|food|berr(y|ies)|offer)/, gentle_pat: /\b(companion|partner|pet|pat|brush)/,
    watering: /\b(watering|waters? (the |her |small |young )?(plants?|flowers?|seedlings?|herbs?|garden|bed))\b/, preparing_food: /\b(cook|cooking|bake|baking|batter|recipe|chop|stir|mix|knead|whisk|slic|ingredient|dough)/,
    taking_photo: /\b(photo|camera|picture|snap)/, adjusting_bag: /\b(bag|backpack|tote|luggage)/,
    checking_map: /\b(map|route|trail|guidebook)/, carrying_something: /\b(carry|carrying|basket|box|crate|tray|bundle)/,
    /* 2026-10-26 더한 활동 자세 — 예시 동작을 자세가 같이 민다(전에는 이런 예시에 「활동 진행 중」만 남았다) */
    clapping: /\b(clap(s|ping)?|applau\w*|cheer(s|ing)?)\b/, looking_through: /\b(binoculars?|telescope|spyglass|stargaz\w*)\b/,
    pouring_drink: /\bpour(s|ing)?\b/, sketching: /\b(sketch(es|ing)?|drawing|sketchbook|notebook)\b/,
    folding_cloth: /\b(fold(s|ing)? (a |the |her )?(\w+ )?(blanket|towel|laundry|linen|sheets?|shirts?|cloth|clothes|garments?|scarf)|laundry)\b/,
    playing_instrument: /\b(instrument|guitar|violin|ukulele|piano|flute|harp|cello|accordion)\b/,
    eating: /\b(eat(s|ing)?|tast(e|es|ing)|bite|noodles?|curry|dessert|ice cream|snack)\b/,
    holding_umbrella: /\b(an? (open )?umbrella|parasol)\b/,
    dressing_up: /\b(earrings?|shoe straps?|tie(s|ing)? (her )?shoes|putting on|getting ready|bracelets?|necklaces?)\b/
  };
  /* 예시의 주 활동과 부딪히는 자세·방향을 뺀다(2026-10-26). 자세 문장이 따로 시키는 동작을 그림이 따라가 예시 활동이 빠졌다 —
     박수 예시에 머리 정리·발끝 들고 손 뻗기(토게키스·개굴반장), 차 따르기에 그릇 젓기(개굴닌자), 쌍안경 전망대에 걷기·시선 아래(스완나),
     역 벤치에 방석 책상다리(메탕), 동료 없는 부엌에 "동료에게 건네기"(미라몽), 담요 개기에 손 뻗기(야나키) */
  var HANDS = /\b(hold(s|ing)?|clap(s|ping)?|pour(s|ing)?|fold(s|ing)?|sketch(es|ing)?|draw(s|ing)?|paint(s|ing)?|play(s|ing)?|writ(e|es|ing)|read(s|ing)?|cook(s|ing)?|stir(s|ring)?|carr(y|ies|ying)|check(s|ing)?|adjust(s|ing)?|ty(ing)|tie(s)?|thread(s|ing)?|sew(s|ing)?|knit(s|ting)?|wash(es|ing)?|water(s|ing)?|photograph(s|ing)?|brush(es|ing)?|pick(s|ing)?|arrang(e|es|ing)|serv(e|es|ing)|offer(s|ing)?|feed(s|ing)?|pat(s|ting)?|tun(e|es|ing)|typ(e|es|ing)|clean(s|ing)?|wip(e|es|ing)|wrap(s|ping)?|test(s|ing)?|measur(e|es|ing)|cut(s|ting)?|scan(s|ning)?|binoculars?|telescope|grip(s|ping)?|lift(s|ing)?|tap(s|ping)?|sort(s|ing)?|pack(s|ing)?|choos(e|es|ing)|select(s|ing)?|plac(e|es|ing)|hang(s|ing)?|polish(es|ing)?|stack(s|ing)?|fix(es|ing)?|repair(s|ing)?|sip(s|ping)?|toast(s|ing)?|shap(e|es|ing)|mold(s|ing)?|dust(s|ing)?|rins(e|es|ing)|scrub(s|bing)?|decorat(e|es|ing)|tidy(ing)?|tidies|load(s|ing)?|steady(ing)?|count(s|ing)?|dry(ing)?|drap(e|es|ing)|remov(e|es|ing)|tak(e|es|ing) off|put(s|ting)? on|unzip(s|ping)?|zip(s|ping)?|button(s|ing)?|apply(ing)?|applies|spray(s|ing)?)\b/;
  var MOVE = /\b(walk(s|ing)?|stroll(s|ing)?|strides?|striding|commut(e|es|ing)|hik(e|es|ing)|wander(s|ing)?|crossing|arriv(e|es|ing)|parade|promenade|jog(s|ging)?|run(s|ning)?|sprint(s|ing)?|march(es|ing)?)\b/;
  var SEAT_AT = /\b(seated|sitting|sits|sit|bench|sofa|couch|chair|stool|seat|armchair|barstool|swing)\b/;
  var STAND_AT = /\b(standing|stands|lookout|podium|runway|queue|counter|stall|platform|booth)\b/;
  var LIE = /\b(bed|sofa|couch|blanket|deck|lounger|sunbed|beach|towel|grass|lawn|futon|mat|rug|poolside|hammock|daybed)\b/;   /* 누울 자리가 있는 예시에만 */
  var LYING = ['lying_prone', 'lying_side'];
  var REST = /\b(resting (on|beside|in|by|against)|relax(es|ing)?|nap(s|ping)?|sleeping|lounge|lounging|sunbath\w*|lazy|unwind\w*|daybed|lying|lies)\b/;
  var LOUNGE_CATS = ['homewear', 'lingerie', 'private_evening', 'swimwear', 'everyday_sensual'];
  var WORK_CATS = ['adult_roleplay', 'occupation_basic', 'occupation_sensual', 'active'];
  var FLOOR = ['sitting_floor', 'side_sitting', 'cross_legged', 'one_knee_up', 'kneeling'];
  var UPRIGHT = ['standing_relaxed', 'standing_formal', 'contrapposto', 'hand_on_hip', 'leaning_wall', 'on_tiptoe', 'walking', 'mid_stride', 'small_jog', 'dance_step', 'turning_back', 'squatting', 'bending_over'];   /* 예시가 앉아 있으면 안 쓴다 */
  /* 자기 동작을 따로 시키는 자세 — 예시에 그 동작이 있을 때만(HANDS_ONLY 는 예시에 손으로 하는 일이 없어도 된다) */
  var OWN_ACTION = {
    on_tiptoe: /\b(reach(es|ing)?|shelf|shelves|high|overhead|lanterns?|ceiling|top)\b/,
    bending_over: /\b(low|floor|ground|pick(s|ing)?|gather(s|ing)?|bend(s|ing)?|planters?|tray|table|crates?|baskets?|garden|tide|shells?|harvest(s|ing)?)\b/,
    hands_in_hair: /\b(hair|mirror|vanity|towel|drying|breeze|ponytail|braid|hairpin|ribbon)\b/,
    waving: /\b(wave|waves|waving|greet(s|ing)?|hello|goodbye|farewell|welcom(e|es|ing))\b/,
    stretching: /\b(stretch(es|ing)?|yoga|warm-?up|exercis(e|es|ing)|waking|pilates)\b/,
    squatting: /\b(low|floor|ground|pets?|plants?|garden|shells?|crouch(es|ing)?|squat(s|ting)?|tide|pick(s|ing)?)\b/,
    walking: MOVE, mid_stride: MOVE, turning_back: MOVE,
    small_jog: /\b(jog(s|ging)?|run(s|ning)?|sprint(s|ing)?)\b/,
    dance_step: /\b(danc(e|es|ing|er)|rehears(e|al|ing)|cheer(s|ing|leader)?|perform(s|ing|ance)?|routine|choreograph\w*)\b/,
    lying_prone: LIE, lying_side: LIE
  };
  var HANDS_ONLY = ['arms_crossed', 'stretching', 'squatting', 'turning_back'];
  var COMPANION_POSE = ['offering_food', 'gentle_pat'];   /* 자세 문장이 동료를 전제한다 — 파트너 돌봄에서만 */
  function poseFits(p, text, cat) {
    if (ACTIVITY[p] && !ACTIVITY[p].test(text)) return false;
    if (has(COMPANION_POSE, p) && cat !== 'partner_care') return false;
    if (has(LYING, p) && (has(WORK_CATS, cat) || HANDS.test(text) && !REST.test(text) || !REST.test(text) && !has(LOUNGE_CATS, cat) || /\b(seated|sitting|sits)\b/.test(text))) return false;   /* 눕기는 쉬는 장면에만 — 손으로 하는 일·일터·무대에는 안 쓴다 */
    if ((p === 'holding_cup' || p === 'preparing_food') && /\bpour/.test(text)) return false;   /* 따르기는 들고 있기·젓기가 아니다 */
    if (OWN_ACTION[p] && !OWN_ACTION[p].test(text) && !(has(HANDS_ONLY, p) && !HANDS.test(text))) return false;
    if (p === 'arms_crossed' && HANDS.test(text)) return false;
    if (has(UPRIGHT, p) && SEAT_AT.test(text) && !MOVE.test(text)) return false;
    if ((has(FLOOR, p) || has(LYING, p)) && (SEAT_AT.test(text) && !has(LYING, p) || STAND_AT.test(text) || MOVE.test(text))) return false;
    if ((p === 'sitting' || p === 'perched_seat') && (MOVE.test(text) || /\bstanding\b/.test(text))) return false;
    return true;
  }
  /* 방향 — 보기·관람 예시에 시선 아래, 손 뻗을 것이 없는 예시에 위로 손 뻗기 */
  var ORIENT_NEEDS = { reaching_up: /\b(reach(es|ing)?|shelf|shelves|high|overhead|hang(s|ing)?|lanterns?|ceiling|stretch(es|ing)?|banners?|branch(es)?|trees?)\b/ };
  var ORIENT_NOT = { looking_down: /\b(binoculars?|telescope|lookout|look(s|ing)? (out|up|through)|watch(es|ing)?|view(s|ing)?|spectators?|audience|stargaz\w*|fireworks?|sky|clap(s|ping)?|cheer(s|ing)?)\b/ };
  function orientFits(or, text) {
    if (ORIENT_NEEDS[or] && !ORIENT_NEEDS[or].test(text)) return false;
    if (ORIENT_NOT[or] && ORIENT_NOT[or].test(text)) return false;
    return true;
  }
  var ORIENT_FOR = {
    reclining: SEATED.concat(['lying_prone', 'lying_side']), crouching: LOW, seated_twist: SEATED,
    turning_midmotion: MOVING.concat(['standing_relaxed', 'contrapposto', 'hand_on_hip', 'hands_in_hair']),
    reaching_up: ['standing_relaxed', 'on_tiptoe', 'stretching', 'hands_in_hair', 'watering', 'carrying_something']
  };
  /* 갈래와 어울리는 표정·자세 — 덜 쓴 값만 고르면 소풍에 도발적 표정, 정장 한복에 조깅이 나왔다(2026-10-22 첫 시험) */
  var WARM = ['calm', 'focused', 'soft_smile', 'half_smile', 'playful', 'candid', 'curious', 'amused', 'gentle', 'determined', 'surprised',
    'nostalgic', 'pensive', 'wistful', 'mischievous', 'proud', 'flustered', 'relieved', 'laughing', 'laughing_open', 'confident', 'serious'];
  var ALLURE = ['confident', 'sensual', 'provocative', 'half_smile', 'smug', 'playful', 'calm', 'mischievous', 'pensive', 'wistful', 'soft_smile', 'cold_smile', 'serious', 'flustered', 'sleepy'];
  var EXPR_FOR = {
    lingerie: ALLURE, private_evening: ALLURE, homewear: ALLURE.concat(['sleepy', 'candid', 'amused', 'gentle']), swimwear: ALLURE.concat(['laughing', 'candid', 'amused', 'surprised']),
    everyday_sensual: ALLURE.concat(['candid', 'amused', 'curious']), occupation_sensual: ALLURE.concat(['focused', 'determined', 'proud']),
    adult_roleplay: ALLURE.concat(['proud', 'amused', 'laughing', 'focused']),
    source_editorial: ALLURE.concat(['bored', 'unimpressed', 'cold_smile', 'proud', 'serious']),
    active: WARM.concat(['exhausted', 'relieved', 'determined']), wildcard: WARM.concat(ALLURE, ['bored', 'mildly_annoyed', 'unimpressed', 'exhausted', 'sleepy'])
  };
  var STILL_CATS = ['lingerie', 'private_evening', 'homewear', 'traditional'];
  var RUNNING = ['small_jog', 'mid_action', 'stretching', 'mid_stride'];
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
  var CLOSE_ORIENT = ['profile_close'];
  var CLOSE_FRAME = ['chest_up', 'waist_up'];

  function has(a, x) { return a.indexOf(x) >= 0; }
  function uniq(a) { var o = [], i; for (i = 0; i < a.length; i++) if (!has(o, a[i])) o.push(a[i]); return o; }
  /* 씨앗 — FNV-1a 32 → mulberry32 */
  function hash(s) { var h = 2166136261, i; s = String(s); for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var t = hash(seed); return function () { t = (t + 0x6D2B79F5) | 0; var x = Math.imul(t ^ (t >>> 15), t | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }

  function concrete(rows) { return rows.map(function (r) { return r[0]; }).filter(function (v) { return v && v !== 'AUTO' && v !== '__custom__' && v.indexOf('auto_') !== 0; }); }
  function exRows(S, cat) { return (S.EXAMPLE_MAP[cat] || []).filter(function (r) { return r[0] && r[0] !== '__custom__' && r[0].indexOf('auto_') !== 0 && r[4] !== 'm'; }); }
  function exText(S, cat, ex) { var r = exRows(S, cat).filter(function (r) { return r[0] === ex; })[0]; return r ? ((r[1] || '') + ' ' + (r[5] || (S.EXAMPLE_DETAIL || {})[ex] || '')).toLowerCase() : ''; }
  function garmentsOf(text) {
    var t = String(text || '').toLowerCase(), out = [], k;
    for (k in GARMENTS) if (new RegExp(GARMENTS[k]).test(t)) out.push(k);
    return out.sort();
  }
  function cats(S) { return S.CATS.filter(function (r) { return r[4] !== 'm' && !has(NOT_COUNTED, r[0]); }).map(function (r) { return r[0]; }); }

  /* ── 장부에서 읽는 것 — casual-ledger.py 와 같은 창 ── */
  function catCounts(entries, list) {
    var n = {}, i, j, k;
    for (i = 0; i < list.length; i++) n[list[i]] = 0;
    for (i = 0; i < entries.length; i++) for (j = 0; j < entries[i].cuts.length; j++) {
      k = entries[i].cuts[j].cat === 'everyday' ? 'everyday_basic' : entries[i].cuts[j].cat;
      if (k in n) n[k]++;
    }
    return n;
  }
  function lowCats(entries, list) {
    var n = catCounts(entries, list), v = Object.keys(n).map(function (k) { return n[k]; }).sort(function (a, b) { return a - b; }), cut;
    if (!v.length) return [];
    cut = v[Math.min(CAT_LOW, v.length) - 1];
    return Object.keys(n).filter(function (k) { return n[k] <= cut; });
  }
  function smallOpen(entries, cat, list) {
    var n = {}, i, j, c, m;
    for (i = 0; i < list.length; i++) n[list[i]] = 0;
    for (i = 0; i < entries.length; i++) for (j = 0; j < entries[i].cuts.length; j++) { c = entries[i].cuts[j]; if (c.cat === cat && c.ex in n) n[c.ex]++; }
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
    var S = o.S, card = o.card, batch = o.batch || [], kept = o.kept || [], refill = !!o.refill, avoid = o.avoid || [];
    var rand = rng(o.seed != null ? o.seed : card), names = [card].concat(batch.map(function (b) { return b.card; }));
    var all = (o.entries || []).filter(function (e) { return e && e.cuts; });
    var base = all.filter(function (e) { return !has(names, e.card); });
    var done = base.filter(function (e) { return e.status !== 'reserved'; });
    var reserved = base.filter(function (e) { return e.status === 'reserved'; });
    var others = batch.map(function (b) { return { card: b.card, cuts: b.cuts }; });
    /* 같은 배치에서 아직 안 정한 다시 채우기 캐릭터의 이미 등록된 컷 — 장부 check 는 배치 안 모두를 서로 견주니, 그 컷과 겹쳐도 못 바꾼다(2026-10-24 헌테일 ↔ 분홍장이) */
    var fixed = (o.fixed || []).filter(function (f) { return !has(names, f.card) || f.card !== card; }).map(function (f) { return { card: f.card, cuts: f.cuts }; });
    var cmp = base.slice(-CMP_WINDOW).concat(reserved.filter(function (e) { return base.slice(-CMP_WINDOW).indexOf(e) < 0; }), others, fixed);
    var exw = base.slice(-EX_WINDOW).concat(reserved.filter(function (e) { return base.slice(-EX_WINDOW).indexOf(e) < 0; }), others, fixed);
    var hist = base.concat(others);
    var listCats = cats(S);
    var usedEx = {}, pairs = {}, orients = {}, frames = {}, gar = {};
    exw.forEach(function (e) { e.cuts.forEach(function (c) { usedEx[c.cat + '/' + c.ex] = 1; }); });
    cmp.forEach(function (e) { e.cuts.forEach(function (c) { pairs[c.orient + '|' + c.frame] = 1; orients[c.orient] = 1; frames[c.frame] = 1; (c.garments || []).forEach(function (g) { gar[g] = 1; }); }); });
    /* 배치 안에서 앞 캐릭터가 "새 값" 으로 잡은 옷 종류·방향·프레이밍 — 뒤 캐릭터가 같이 쓰면 앞 캐릭터의 새 값이 사라진다(check 는 배치 전체를 본다) */
    var claimed = { garment: {}, orient: {}, frame: {} };
    batch.forEach(function (b) { var k; for (k in claimed) ((b.claims || {})[k] || []).forEach(function (v) { claimed[k][v] = 1; }); });
    var avoided = function (cut, field, value) { return avoid.some(function (a) { return (a.cut == null || a.cut === cut) && a.field === field && a.value === value; }); };
    var keptNo = kept.map(function (c) { return c.cut; });
    var slots = [1, 2, 3].filter(function (n) { return !has(keptNo, n); });
    var why = {};

    /* 1. 필수 갈래 자리 — 바로 앞 캐릭터와 다른 번호, 앞 넷이 모두 한 장이면 두 장 */
    var prev = hist.length ? hist[hist.length - 1].cuts.filter(function (c) { return has(REQUIRED, c.cat); }).map(function (c) { return c.cut; }).sort() : null;
    var last4 = hist.slice(-(TWO_REQUIRED_EVERY - 1));
    var needTwo = !refill && last4.length === TWO_REQUIRED_EVERY - 1 && last4.every(function (e) { return e.cuts.filter(function (c) { return has(REQUIRED, c.cat); }).length < 2; });
    var keptReq = kept.filter(function (c) { return has(REQUIRED, c.cat); }).map(function (c) { return c.cut; });
    var reqSlots;
    if (refill) reqSlots = keptReq.length ? [] : [slots[Math.floor(rand() * slots.length)]];
    else {
      var options = needTwo ? [[1, 2], [1, 3], [2, 3]] : [[1], [2], [3]];
      options = options.filter(function (s) { return !prev || s.join() !== prev.join(); });
      /* 이미 만든 컷(kept)을 두고 다시 정할 때 — 그 컷이 필수 갈래면 그 자리를 품은 짝만, 아니면 그 자리를 뺀 짝만 */
      options = options.filter(function (s) { return kept.every(function (c) { return has(REQUIRED, c.cat) === has(s, c.cut); }); });
      if (!options.length) options = [keptReq.length ? keptReq.slice() : [slots[0]]];
      var posUse = recency(base.slice(-10), function (c) { return has(REQUIRED, c.cat) ? 'p' + c.cut : null; });
      reqSlots = pick(options, function (s) { return s.reduce(function (a, n) { return a + (posUse['p' + n] || 0); }, 0); }, rand).filter(function (n) { return !has(keptNo, n); });
    }
    why.required = { slots: reqSlots, two: needTwo, prev: prev };   /* 말로 옮기기는 tools/casual-plan.cjs */

    /* 2. 갈래 — 필수 자리는 필수 갈래(최근에 덜 쓴 것), 나머지 중 한 장은 덜 쓴 갈래, 세 장 모두 다른 갈래 */
    var catUse = recency(base.slice(-CAT_WINDOW).concat(others), function (c) { return c.cat; });   /* 같은 배치의 앞 캐릭터도 센다 — 안 그러면 셋이 같은 갈래로 몰린다 */
    var low = lowCats(base.slice(-CAT_WINDOW).concat(others), listCats);
    var chosen = {};
    kept.forEach(function (c) { chosen[c.cut] = c.cat; });
    var takenCats = kept.map(function (c) { return c.cat; });
    reqSlots.forEach(function (n) {
      var c = pick(REQUIRED.filter(function (k) { return !has(takenCats, k) && !avoided(n, 'cat', k); }), function (k) { return catUse[k] || 0; }, rand);
      chosen[n] = c; takenCats.push(c);
    });
    var free = slots.filter(function (n) { return !has(reqSlots, n); });
    free.forEach(function (n, i) {
      var pool = listCats.filter(function (k) { return !has(REQUIRED, k) && !has(takenCats, k) && !avoided(n, 'cat', k) && exOptions(k, n).length; });
      if (i === 0 && !refill) { var lowPool = pool.filter(function (k) { return has(low, k); }); if (lowPool.length) pool = lowPool; }
      var c = pick(pool, function (k) { return (catUse[k] || 0) + 0.3 * crowd(o.look, 'cat:' + k); }, rand);
      chosen[n] = c; takenCats.push(c);
    });
    why.low = low;

    function exOptions(cat, n) {
      var list = exRows(S, cat).map(function (r) { return r[0]; });
      if (list.length > 0 && list.length <= SMALL_CAT) list = smallOpen(all, cat, list);
      return list.filter(function (x) { return !usedEx[cat + '/' + x] && !avoided(n, 'ex', x) && !garmentsOf(exText(S, cat, x)).some(function (g) { return claimed.garment[g]; }); });
    }
    /* 3. 장면 예시 — 최근 10명·예약·배치에서 안 쓴 것, 작은 갈래는 한 바퀴, 남은 것 가운데 장부 전체에서 쓴 횟수가 가장 적은 것,
       그 안에서 오래전에 쓴·생김새가 덜 몰린 것. 횟수를 먼저 보는 것은 큰 갈래 때문이다 — 최근 것만 보면 오래전에 열 번 넘게 쓴 예시가
       한 번도 안 쓴 예시와 같은 값이 되어 몇 개에 몰렸다(retro_racer 12번, 같은 갈래의 다른 예시는 1~4번 — 2026-10-22 점검) */
    var exUse = recency(base, function (c) { return c.cat + '/' + c.ex; });
    var cuts = {};
    /* 덮는 겉옷은 세 장 중 한 장까지 — 예시 문구가 옷을 정하는 예시(관측소의 코트·출근 열차의 재킷)는 4의 옷 고르기를 안 거치니 여기서 막는다.
       안 막으면 갈래가 같게 잡힐 때마다 같은 두 예시가 뽑혀 씨앗을 바꿔도 40번 다 걸렸다(2026-10-25 레쿠쟈) */
    var coverEx = function (cat, x) { return garmentsOf(exText(S, cat, x)).some(function (g) { return has(COVERING, g); }); };
    var coveredEx = kept.some(function (c) { return (c.garments || []).some(function (g) { return has(COVERING, g); }); });
    slots.forEach(function (n) {
      var cat = chosen[n], opts = smallOpen(all, cat, exOptions(cat, n));
      if (coveredEx) { var bare = opts.filter(function (x) { return !coverEx(cat, x); }); if (bare.length) opts = bare; }
      var ex = pick(opts, function (x) { return (exUse[cat + '/' + x] || 0) + 0.5 * crowd(o.look, 'ex:' + cat + '/' + x); }, rand);
      if (ex && coverEx(cat, ex)) coveredEx = true;
      cuts[n] = { cut: n, cat: cat, ex: ex };
    });

    /* 4. 옷 — 예시가 옷을 정했으면 그것, 아니면 갈래의 옷 가운데 비교 대상이 덜 쓴 것. 덮는 겉옷은 세 장 중 한 장까지, 한 장은 새 옷 종류 */
    var garUse = recency(cmp.concat(base.slice(-EX_WINDOW)), function (c) { return c.garments || []; });
    var keptGar = [];
    kept.forEach(function (c) { keptGar = keptGar.concat(c.garments || []); });
    /* 예시가 정한 겉옷은 차례와 상관없이 먼저 센다 — 앞 컷에서 갈래 옷으로 코트를 고른 뒤 뒤 컷 예시가 재킷을 정하면 둘이 된다 */
    var covered = keptGar.some(function (g) { return has(COVERING, g); }) ||
      slots.some(function (n) { return garmentsOf(exText(S, cuts[n].cat, cuts[n].ex)).some(function (g) { return has(COVERING, g); }); });
    var newGar = keptGar.some(function (g) { return !gar[g]; });
    /* 예시가 옷을 정한 컷을 먼저 센다 — 「한 장은 새 옷 종류」를 마지막 컷에서만 챙겼는데, 그 컷 예시가 옷을 정해 두면 챙길 곳이 없었다(2026-10-26).
       이제 옷을 정하지 않은 컷 가운데 마지막에서 챙긴다 */
    var fixedOf = function (n) { return garmentsOf(exText(S, cuts[n].cat, cuts[n].ex)); };
    var order = slots.filter(function (n) { return fixedOf(n).length; }).concat(slots.filter(function (n) { return !fixedOf(n).length; }));
    var lastFree = order.filter(function (n) { return !fixedOf(n).length; }).slice(-1)[0];
    order.forEach(function (n) {
      var c = cuts[n], fixed = fixedOf(n), set, pal, top, bot, one;
      if (fixed.length) set = fixed;
      else {
        pal = (PALETTE[c.cat] || PALETTE['*']).filter(function (g) { return !(covered && has(COVERING, g)) && !claimed.garment[g]; });
        var score = function (g) { return (garUse[g] || 0) + (gar[g] ? 1.5 : 0) + 0.3 * crowd(o.look, 'garment:' + g) - (n === lastFree && !newGar && !gar[g] ? 10 : 0); };
        one = pick(pal.filter(function (g) { return has(ONE_PIECE, g) || has(['uniform', 'apron'], g); }), score, rand);
        top = pick(pal.filter(function (g) { return has(TOPS, g); }), score, rand);
        bot = pick(pal.filter(function (g) { return has(BOTTOMS, g); }), score, rand);
        var a = one ? [one] : null, b = top && bot ? [top, bot] : null;
        set = !a ? b : !b ? a : (score(a[0]) <= (score(b[0]) + score(b[1])) / 2 ? a : b);
        if (has(['apron', 'uniform'], set[0]) && set.length === 1 && bot) set = [set[0], bot];
        if (!set) set = [pal[0]];
      }
      set = uniq(set).sort();
      if (set.some(function (g) { return has(COVERING, g); })) covered = true;
      if (set.some(function (g) { return !gar[g]; })) newGar = true;
      c.garments = set;
    });

    /* 5. 표정·자세·방향·프레이밍·화각 — 세 장 서로 다르게, (방향, 프레이밍) 짝은 비교 대상과 겹치지 않게, 한 장은 새 방향이나 새 프레이밍 */
    var oneOf = function (key) { return concrete(S[key]); };
    var exprs = oneOf('EXPRESSION_OPTIONS'), poses = oneOf('POSE_OPTIONS'), lenses = oneOf('LENS_OPTIONS');
    var ors = oneOf('ORIENTATION_OPTIONS').filter(function (v) { return !has(BANNED_ORIENT, v) && !claimed.orient[v]; });
    var frs = oneOf('FRAME_OPTIONS').filter(function (v) { return !has(BANNED_FRAME, v) && !claimed.frame[v]; });
    var use = function (field) { return recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c[field]; }); };
    var U = { expr: use('expr'), pose: use('pose'), orient: use('orient'), frame: use('frame'), lens: use('lens') };
    var pairUse = recency(base, function (c) { return c.orient + '|' + c.frame; });
    var taken = { expr: kept.map(function (c) { return c.expr; }), pose: kept.map(function (c) { return c.pose; }), orient: kept.map(function (c) { return c.orient; }), frame: kept.map(function (c) { return c.frame; }), lens: [] };
    var freshDone = kept.some(function (c) { return !orients[c.orient] || !frames[c.frame]; });
    slots.forEach(function (n, i) {
      var c = cuts[n], text = exText(S, c.cat, c.ex);
      var poseOK = poses.filter(function (p) { return !has(taken.pose, p) && !avoided(n, 'pose', p) && poseFits(p, text, c.cat) && !(has(STILL_CATS, c.cat) && has(RUNNING, p)); });
      var mustFresh = !refill && !freshDone && i === slots.length - 1;   /* 다시 채우기는 새 값 조건을 안 본다(장부 check 와 같게) */
      /* 짝 고르기 — 조건을 다 지키는 짝이 없으면 뒤에서부터 하나씩 풀어 다시 본다(새 값 → 배치가 잡은 값 → 비교 대상과 겹치는 짝).
         계획기는 그래도 계획을 낸다 — 장부 check 가 어긋난 것을 말해 주고, 씨앗을 바꿔 다시 정한다(멈추지 않는다) */
      var combos = [], oi, fi, step, allOrs = oneOf('ORIENTATION_OPTIONS').filter(function (v) { return !has(BANNED_ORIENT, v); });
      for (step = 0; step < 4 && !combos.length; step++) {
        var orList = step >= 2 ? allOrs : ors, frList = step >= 2 ? oneOf('FRAME_OPTIONS').filter(function (v) { return !has(BANNED_FRAME, v); }) : frs;
        for (oi = 0; oi < orList.length; oi++) for (fi = 0; fi < frList.length; fi++) {
          var or = orList[oi], fr = frList[fi];
          if (has(taken.orient, or) || has(taken.frame, fr) || avoided(n, 'orient', or) || avoided(n, 'frame', fr) || !orientFits(or, text)) continue;
          if (step < 3 && pairs[or + '|' + fr]) continue;
          if (has(CLOSE_ORIENT, or) && !has(CLOSE_FRAME, fr)) continue;
          if (step < 1 && mustFresh && orients[or] && frames[fr]) continue;
          var ps = ORIENT_FOR[or] ? poseOK.filter(function (p) { return has(ORIENT_FOR[or], p); }) : poseOK;
          if (!ps.length && ORIENT_FOR[or] && poseOK.length) continue;   /* 이 예시에 그 방향과 맞는 자세가 없으면 그 방향을 안 쓴다 */
          if (!ps.length) ps = poseOK.length ? poseOK : poses.filter(function (p) { return !has(taken.pose, p); });
          if (!ps.length) continue;
          combos.push({ orient: or, frame: fr, poses: ps });
        }
      }
      if (step > 1) (why.relaxed = why.relaxed || []).push({ cut: n, step: step - 1 });
      var best = pick(combos, function (x) { return (U.orient[x.orient] || 0) + (U.frame[x.frame] || 0) + 0.5 * (pairUse[x.orient + '|' + x.frame] || 0) + 0.3 * crowd(o.look, 'pair:' + x.orient + '|' + x.frame) - (!orients[x.orient] || !frames[x.frame] ? 0.5 : 0); }, rand);
      c.orient = best.orient; c.frame = best.frame;
      c.pose = pick(best.poses, function (p) { return (U.pose[p] || 0) - (ACTIVITY[p] ? 0.7 : 0); }, rand);
      var moods = EXPR_FOR[c.cat] || WARM;
      c.expr = pick(exprs.filter(function (v) { return !has(taken.expr, v) && !avoided(n, 'expr', v) && has(moods, v); }), function (v) { return U.expr[v] || 0; }, rand);
      c.lens = pick(lenses.filter(function (v) { return !has(taken.lens, v) && !avoided(n, 'lens', v); }), function (v) { return U.lens[v] || 0; }, rand);
      c.aspect = '2:3';
      taken.expr.push(c.expr); taken.pose.push(c.pose); taken.orient.push(c.orient); taken.frame.push(c.frame); taken.lens.push(c.lens);
      if (!orients[c.orient] || !frames[c.frame]) freshDone = true;
    });

    /* 6. 세부 강도 세 축 — 액션 비중은 자세에서, 분리형 선호는 옷에서, SOURCE 영향도는 세 장이 다르고 비교 대상과 구성이 겹치지 않게 */
    slots.forEach(function (n) {
      var c = cuts[n];
      c.axes = { action_level: has(MOVING, c.pose) ? 'mostly active' : (ACTIVITY[c.pose] || has(['leaning_wall', 'leaning_furniture', 'bending_over'], c.pose)) ? 'balanced' : 'mostly posed',
        separates_preference: c.garments.some(function (g) { return has(ONE_PIECE, g); }) && !c.garments.some(function (g) { return has(BOTTOMS, g); }) ? 'balanced' : 'prefer separates' };
    });
    var srcCombos = [], a, b, d;
    for (a = 0; a < 3; a++) for (b = 0; b < 3; b++) for (d = 0; d < 3; d++) srcCombos.push([SOURCE[a], SOURCE[b], SOURCE[d]]);
    var keptSrc = {};
    kept.forEach(function (c) { keptSrc[c.cut] = (c.axes || {}).source_influence; });
    var srcUse = recency(base.slice(-EX_WINDOW), function (c) { return (c.axes || {}).source_influence; });
    var okSrc = srcCombos.filter(function (s) {
      var full = [1, 2, 3].map(function (n, i) { return keptSrc[n] || s[i]; });
      if (kept.some(function (c, i) { return keptSrc[c.cut] && s[[1, 2, 3].indexOf(c.cut)] !== keptSrc[c.cut]; })) return false;
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
      slots.forEach(function (n) { if (cuts[n].axes.separates_preference === 'prefer separates') cuts[n].axes.separates_preference = 'strongly prefer separates'; });
      return plan(Object.assign({}, o, { seed: String(o.seed != null ? o.seed : card) + '+', _tries: (o._tries || 0) + 1 }));
    }
    var src = pick(okSrc, function (s) { return s.reduce(function (t, v) { return t + (srcUse[v] || 0); }, 0); }, rand);
    slots.forEach(function (n) {
      var c = cuts[n];
      c.axes = { overall_intensity: FIXED_AXES.overall_intensity, skin_exposure: FIXED_AXES.skin_exposure,
        action_level: c.axes.action_level, source_influence: src[n - 1], separates_preference: c.axes.separates_preference };
    });

    /* 7. 드러내는 방식·장면 첫머리 — 의상·장면 칸을 쓸 때의 길잡이(장부의 expose·lead 로 다음 계획이 피한다) */
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
      var k = kept.filter(function (c) { return c.cut === n; })[0];
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

  /* 생성기 주소 — prompt.html?mech=<카드>&casual=<선택값 JSON>. 생성기는 받은 값을 채우고 모두 잠근다 */
  function generatorQuery(card, cut) {
    var v = { cat: cut.cat, ex: cut.ex, expr: cut.expr, pose: cut.pose, orient: cut.orient, frame: cut.frame, lens: cut.lens, aspect: cut.aspect || '2:3', axes: cut.axes };
    return 'mech=' + encodeURIComponent(card) + '&casual=' + encodeURIComponent(JSON.stringify(v));
  }
  /* 생성기가 주소의 값을 받아들일 때 — 정한 말만, 나머지는 버린다. 돌려주는 것 { scene, locks, bad } */
  function fromQuery(S, raw) {
    var v, scene = {}, locks = {}, bad = [], axes = {}, k;
    try { v = JSON.parse(raw); } catch (e) { return null; }
    if (!v || typeof v !== 'object') return null;
    var catOK = S.CATS.some(function (r) { return r[0] === v.cat && r[0] !== 'auto_random' && r[0] !== '__custom__'; });
    if (catOK) { scene.cat = v.cat; locks.cat = true; } else bad.push('cat');
    if (catOK && exRows(S, v.cat).some(function (r) { return r[0] === v.ex; })) { scene.ex = v.ex; locks.ex = true; } else bad.push('ex');
    var lists = { expr: 'EXPRESSION_OPTIONS', pose: 'POSE_OPTIONS', orient: 'ORIENTATION_OPTIONS', frame: 'FRAME_OPTIONS', lens: 'LENS_OPTIONS' };
    for (k in lists) { if (has(concrete(S[lists[k]]), v[k])) { scene[k] = v[k]; locks[k] = true; } else bad.push(k); }
    if (has(['2:3', '3:2', '1:1', '9:16', '16:9'], v.aspect)) { scene.aspect = v.aspect; locks.aspect = true; }
    for (k in (v.axes || {})) if (S.ADVANCED_OPTIONS[k] && has(S.LOCAL_AXES, k) && has(S.ADVANCED_OPTIONS[k], v.axes[k]) && v.axes[k] !== 'AUTO') { axes[k] = v.axes[k]; locks['axes.' + k] = true; }
    scene.axes = axes;
    return { scene: scene, locks: locks, bad: bad };
  }

  var api = { plan: plan, generatorQuery: generatorQuery, fromQuery: fromQuery, garmentsOf: garmentsOf, poseFits: poseFits, orientFits: orientFits, GARMENTS: GARMENTS, EXPOSE: EXPOSE, LEAD: LEAD,
    REQUIRED: REQUIRED, COVERING: COVERING, EX_WINDOW: EX_WINDOW, CMP_WINDOW: CMP_WINDOW };
  root.AtelierCasualPlan = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
