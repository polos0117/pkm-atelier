/* 일상컷 계획기 — 생성 전에 일상컷의 생성기 선택값을 도구가 정한다(2026-10-22).
   2026-11-07 일곱 장(사용자 「일상컷 규칙은 기존에 필수갈래 택1에서 전체포함으로 7장으로」 · 「레트로는 필수에서 빼고, 필수3 코스튬1 자유3 으로」):
     필수 갈래 셋(역할극 · 수영복 · 란제리풍)이 한 장씩 + 포켓몬 코스튬 한 장 + 자유 세 장. 필수 자리 돌리기 · 다섯 명에 두 장은 세 장 시절 규칙이라 안 본다.
     방향 · 프레이밍은 같은 값 두 장까지(프레이밍이 여섯뿐), 같은 (방향, 프레이밍) 짝은 한 장. 세 축 겹침은 비교 대상 한 명과 다섯 장 이상이면.
     세 장으로 등록된 캐릭터를 다시 채울 때는 세 장 규칙 그대로(count 3 — 레트로도 필수로 읽는다).
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
  function gcm_() {
    if (!root.AtelierGameCosplay && typeof require === 'function') require('./game-cosplay.js');
    return root.AtelierGameCosplay;
  }
  function tree2_() {
    tree_();
    if (!root.AtelierCasualTreeV2 && typeof require === 'function') require('./casual-tree-v2.js');
    return root.AtelierCasualTreeV2;
  }

  var REQUIRED = ['adult_roleplay', 'swimwear', 'lingerie', 'retro_glamour'];   /* 장부 옛 칸의 필수 갈래 이름(레트로 글래머는 2026-10-26 더했다) */
  var EX_WINDOW = 10, CMP_WINDOW = 3, GROUP_WINDOW = 10, GROUP_LOW = 5, SMALL_GROUP = 8, TWO_REQUIRED_EVERY = 5;
  var FRESH_RATE = 0.9;   /* 새 묶음 몫 — 둘째 자유 칸이 장소가 다 새것인 묶음에서 고를 확률(2026-11-24) */
  /* 2026-11-09 아홉 장(사용자 「일상컷 룰에 '상황으로 만들기'를 필수로 넣어주고, 거기는 일상컷 생성 수를 9장으로」) — 필수 셋 + 코스튬 + 상황 노출 + 자유 넷.
     일곱 장(2026-11-07 ~ 11-08)으로 등록된 캐릭터 다시 채우기는 일곱 장 규칙(상황 없이), 세 장으로 등록된 캐릭터는 세 장 */
  /* 2026-11-11 열 장(사용자 「gpt 담당 자유컷 1장더 추가해서 필수갈래랑 상황노출을 묶어서 우리쪽에 없는 목록으로 그리라고 넣어줘. 그러면 이제 일상컷 10장씩」) — 아홉 장 + 갈래 · 상황 자유 한 장(xfree).
     아홉 장(TEN_SINCE 앞)으로 등록된 캐릭터 다시 채우기는 아홉 장 */
  /* 2026-11-15 필수 구성 — 상황 노출 자리에 게임 코스프레(cosplaySlot · o.cosplay = { list, used, full }, lib/game-cosplay.js). 장 수 · 자리는 그대로, 목록 없이 부르면 예전 구성 */
  var CUTS = 10, NINE_CUTS = 9, MID_CUTS = 7, LEGACY_CUTS = 3, NINE_SINCE = '2026-11-08T18:45:00+00:00', TEN_SINCE = '2026-11-11T14:10:00+00:00';
  /* 몇 장 — 세 장으로 등록된 캐릭터 다시 채우기는 세 장. 일곱 장 캐릭터인지는 등록 때(NINE_SINCE 앞)로 가린다 — 컷 번호만으로는 아홉 장 캐릭터의 빈 8 · 9 번과 못 가른다.
     명령줄(tools/casual-plan.cjs)이 장부의 등록 시각을 보고 count 로 준다 */
  function cutCount(o) {
    if (o.count) return o.count;
    var k = o.kept || [];
    return o.refill && k.length && k.every(function (c) { return c.cut <= LEGACY_CUTS; }) ? LEGACY_CUTS : CUTS;
  }
  function refillCount(entry) {
    var cs = (entry && entry.cuts) || [], at = entry && entry.at && Date.parse(entry.at), old = at && at < Date.parse(NINE_SINCE), nine = at && at < Date.parse(TEN_SINCE);
    return !cs.some(function (c) { return c.cut > LEGACY_CUTS; }) ? LEGACY_CUTS : old && !cs.some(function (c) { return c.cut > MID_CUTS; }) ? MID_CUTS : nine && !cs.some(function (c) { return c.cut > NINE_CUTS; }) ? NINE_CUTS : CUTS;
  }
  /* 상황 노출 — 그 옷에 맞는 상황 열쇠들(S.SITUATIONS 의 fit · skip). 옷 글은 고른 옷 문장, 없으면 옷 종류 이름 */
  function situsFor(S, text) {
    return (S.SITUATIONS || []).filter(function (x) { return new RegExp(x.fit || '.', 'i').test(text || '') && !(x.skip && new RegExp(x.skip, 'i').test(text || '')); }).map(function (x) { return x.key; });
  }
  /* 상황을 고를 때 보는 옷 글 — 지시문(lib/prompt-anthro.js situLine)과 같게: 옷 글, 없으면 계열 글(2026-11-23 — 옷 없이 계열만인 컷에서 계획기는 옷 종류 글로, 지시문은 계열 글로 맞는지 봐 상황 줄이 빠졌다) */
  function situText(tree, c) { var it = c.item ? tree_().item(tree, c.ofam, c.item) : null, f = tree_().family(tree, c.ofam); return String((it && it.en) || (f && f.en) || ''); }
  function outfitText(tree, c) { var it = c.item ? tree_().item(tree, c.ofam, c.item) : null; return it ? String(it.en || '') : (c.garments || []).join(' ').replace(/_/g, ' '); }
  function nums(N) { var a = [], i; for (i = 1; i <= N; i++) a.push(i); return a; }
  function repeatLimit(N) { return N > LEGACY_CUTS ? 2 : 1; }      /* 방향 · 프레이밍 같은 값 몇 장까지 */
  function sameAxesLimit(N) { return N > LEGACY_CUTS ? N - 2 : 2; } /* 비교 대상 한 명과 세 축이 같은 컷이 몇 장 이상이면 겹침 */
  /* 3b. 옷 색(2026-11-07 사용자 「의상색도 정해줘」) — lib/prompt-spec.js OUTFIT_COLORS 에서 컷마다 하나.
     옷 문장이 이미 색을 정하면 그 색, 아니면 이 캐릭터에 아직 안 쓴 색 가운데 최근에 덜 쓴 것. 그 종의 대표 색(subject.color — card.json color)은 피한다
     (원작 색을 옷에 옮기지 않는다). 코스튬 컷은 원작 색이라 비운다 */
  function chooseColors(S, tree, slots, cuts, kept, hist, subject, avoided, rand, look) {
    var CT = tree_(), COLS = S.OUTFIT_COLORS || [];
    if (!COLS.length) return;
    var use = recency(hist, function (c) { return c.ocolor || null; }), mine = (subject && subject.color) || '';
    var taken = kept.map(function (c) { return c.ocolor; }).filter(Boolean);
    var named = function (text) { return COLS.filter(function (col) { return col.words.some(function (w) { return new RegExp('\\b' + w + '\\b').test(text); }); })[0]; };
    slots.forEach(function (n) {
      var c = cuts[n], fam = CT.family(tree, c.ofam);
      if (fam && fam.costume) { c.ocolor = ''; return; }
      var it = c.item ? CT.item(tree, c.ofam, c.item) : null, fixed = it && named(String(it.en || '').toLowerCase());
      if (fixed) { c.ocolor = fixed.key; taken.push(fixed.key); return; }
      var pool = COLS.filter(function (col) { return !(mine && col.card === mine) && !avoided(n, 'ocolor', col.key); });
      var fresh = pool.filter(function (col) { return !has(taken, col.key); });
      if (fresh.length) pool = fresh;
      var got = pick(pool, function (col) { return (use[col.key] || 0) + 0.3 * crowd(look, 'color:' + col.key); }, rand);
      c.ocolor = got ? got.key : '';
      if (got) taken.push(got.key);
    });
  }
  /* 3c. 구체 색(shade, 2026-11-16 사용자 「수영복 중에 색이 분홍색으로 지정되어 있는게 있어?」 → 「응 너무 많아」 → 분홍을 빼는 안 거절 → 「응 그렇게 진행해줘」).
     묶음 글(「rose pink and blush」)을 주면 GPT 가 맨 앞 색으로 쏠렸다 — 묶음 고르기(3b)는 그대로 두고 그 묶음 안의 구체 색 하나(S.OUTFIT_COLORS[].shades)를 정한다:
       이 공방이 그린 기록 + 아직 안 그린 계획 · 예약(o.shade.used — shadeUsed)과 같은 배치에서 그 shade 를 쓴 수가 적은 것 먼저(같으면 씨앗으로 무작위),
       그 캐릭터 머리색과 같은 색상 갈래(hue)는 피하고(다 피하면 피하지 않는다), 한 계획 안에서 같은 shade 는 두 번 안 쓰고 같은 hue 도 되도록 피한다.
     옷 문장이 색을 정한 옷(색 고정) · 코스튬 · 게임 코스프레 · 옷 자유 · 갈래 · 상황 자유 컷엔 붙이지 않는다(ocolor 규칙과 같다). 장면 칸 shade(ocolor 는 그대로 — 옛 기록 · 화면 호환).
     씨앗은 따로(shade|씨앗) — 다른 칸의 고르기는 shade 를 넣기 전과 같다 */
  function shadesOf(S, key) { var g = (S.OUTFIT_COLORS || []).filter(function (c) { return c.key === key; })[0]; return (g && g.shades) || []; }
  function hueOfText(S, text) {
    var t = String(text || '').toLowerCase(), rows = S.HAIR_HUES || [], i;
    for (i = 0; i < rows.length; i++) if (new RegExp('\\b(' + rows[i][1] + ')\\b').test(t)) return rows[i][0];
    return '';
  }
  /* 머리 hue — subject.hair(머리색 영어 글)가 있으면 그 글에서, 없으면 카드 도감 색(이 공방의 머리색은 종의 메인색 — S.CARD_HUE). 못 읽으면 '' (피하지 않는다) */
  function hairHue(S, subject) {
    if (!subject) return '';
    if (subject.hair) return hueOfText(S, subject.hair);
    return (S.CARD_HUE || {})[subject.color] || '';
  }
  function colorFixed(S, tree, c) {
    var it = c.item ? tree_().item(tree, c.ofam, c.item) : null, t = it ? String(it.en || '').toLowerCase() : '';
    return !!t && (S.OUTFIT_COLORS || []).some(function (col) { return col.words.some(function (w) { return new RegExp('\\b' + w + '\\b').test(t); }); });
  }
  function chooseShades(S, tree, slots, cuts, kept, subject, used, batch, avoided, rand) {
    var CT = tree_(), hh = hairHue(S, subject), n0 = {}, keyHue = {};
    (S.OUTFIT_COLORS || []).forEach(function (g) { (g.shades || []).forEach(function (x) { keyHue[x.key] = x.hue; }); });
    Object.keys(used || {}).forEach(function (k) { n0[k] = (n0[k] || 0) + used[k]; });
    (batch || []).forEach(function (b) { (b.cuts || []).forEach(function (c) { if (c && c.shade && !c.kept) n0[c.shade] = (n0[c.shade] || 0) + 1; }); });
    var taken = kept.map(function (c) { return c.shade; }).filter(Boolean), hues = taken.map(function (k) { return keyHue[k]; }).filter(Boolean);
    slots.forEach(function (n) {
      var c = cuts[n], fam = CT.family(tree, c.ofam);
      c.shade = '';
      if (!c.ocolor || (fam && (fam.costume || fam.cosplay)) || c.ofree || c.xfree || c.sfree || colorFixed(S, tree, c)) return;
      var pool = shadesOf(S, c.ocolor).filter(function (x) { return !has(taken, x.key) && !avoided(n, 'shade', x.key); });
      if (!pool.length) return;
      var noHair = pool.filter(function (x) { return !hh || x.hue !== hh; });
      if (noHair.length) pool = noHair;
      var newHue = pool.filter(function (x) { return !has(hues, x.hue); });
      if (!newHue.length) {   /* 그 hue 가 이미 이 계획에 있다(색 고정 옷이 몸 쪽 고르기에서 비워져 같은 묶음이 두 번 남은 경우, 2026-11-25) — 새 hue 가 남은 다른 묶음으로 */
        var alt = (S.OUTFIT_COLORS || []).filter(function (g) { return g.key !== c.ocolor && !(subject && subject.color && g.card === subject.color) && (g.shades || []).some(function (x) { return !has(hues, x.hue) && !has(taken, x.key) && (!hh || x.hue !== hh); }); });
        if (alt.length) { c.ocolor = alt[Math.floor(rand() * alt.length)].key; newHue = shadesOf(S, c.ocolor).filter(function (x) { return !has(hues, x.hue) && !has(taken, x.key) && (!hh || x.hue !== hh); }); }
      }
      if (newHue.length) pool = newHue;
      var lo = Math.min.apply(null, pool.map(function (x) { return n0[x.key] || 0; }));
      pool = pool.filter(function (x) { return (n0[x.key] || 0) === lo; });
      var got = pool[Math.floor(rand() * pool.length)];
      c.shade = got.key; taken.push(got.key); hues.push(got.hue);
    });
  }
  /* node — 이 공방 그림 저장소에서 shade 를 쓴 수(게임 코스프레 cosplayUsed 와 같은 길 — lib/game-cosplay.js walkRepos):
     그린 기록(…casualN…-ui.json 안 장면의 shade) + 아직 안 그린 계획 · 예약(계획 파일 · records/casual-reservations · 장부 reserved 칸의 cuts[].shade).
     같은 컷(공방 · 카드 · 세계 · 번호)은 한 번 — 그린 기록이 있으면 기록, 없으면 계획 가운데 늦은 것. opts.skip(계획 칸) 이 참이면 그 계획 칸은 안 센다(지금 다시 짜는 카드).
     돌려주는 것 { used: { shade: 수 }, drawn: { 컷 열쇠: 1 }, rows } */
  function shadeUsed(base, repos, opts) {
    opts = opts || {};
    var G = gcm_(), drawn = {}, rows = [], best = {};
    var famOf = function (at) { return (opts.family && opts.family(at.top)) || G.familyOf(at.repo); };
    var findShade = function (x) {
      var got = '';
      (function walk(y, d) {
        if (got || !y || typeof y !== 'object' || d > 8) return;
        if (Array.isArray(y)) { y.forEach(function (z) { walk(z, d + 1); }); return; }
        if (typeof y.shade === 'string' && y.shade) { got = y.shade; return; }
        Object.keys(y).forEach(function (k) { if (k !== 'generation') walk(y[k], d + 1); });
      })(x, 0);
      return got;
    };
    G.walkRepos(base, repos, function (kind, doc, at) {
      if (kind === 'record') {
        var row = Object.assign({ family: famOf(at), repo: at.repo, file: at.file }, G.recordPlace(doc, at.name, at.folder));
        drawn[G.cutKeyOf(row)] = 1;
        row.shade = findShade(doc);
        if (row.shade) rows.push(row);
        return;
      }
      var fm = /^(?:(.+?)-)?casual(?:(\d+)-)?(?:re)?plan/.exec(at.name) || [], replan = /replan/.test(at.name) ? 1 : 0, family = famOf(at);
      (function walk(x, ctx, depth) {
        if (!x || typeof x !== 'object' || depth > 6) return;
        if (Array.isArray(x)) { x.forEach(function (y) { walk(y, ctx, depth + 1); }); return; }
        if (x.status && x.status !== 'reserved') return;   /* 장부의 done 칸은 그린 기록에서 센다 */
        var me = { card: (typeof x.card === 'string' && x.card) || ctx.card, world: (typeof x.world === 'string' && x.world) || ctx.world, at: (typeof x.at === 'string' && x.at) || ctx.at };
        ['cuts', 'casual_plan'].forEach(function (k) {
          if (!Array.isArray(x[k])) return;
          x[k].forEach(function (c) {
            if (!c || typeof c.shade !== 'string' || !c.shade) return;
            var no = typeof c.cut === 'number' ? c.cut : typeof c.n === 'number' ? c.n : typeof c.no === 'number' ? c.no : fm[2] ? Number(fm[2]) : null;
            var r = { shade: c.shade, family: family, card: me.card || at.folder, world: me.world, no: no, at: me.at, replan: replan, repo: at.repo, file: at.file };
            var k2 = G.cutKeyOf(r), old = best[k2];
            if (!old || old.replan < r.replan || (old.replan === r.replan && old.at <= r.at)) best[k2] = r;
          });
        });
        Object.keys(x).forEach(function (k) { if (k !== 'cuts' && k !== 'casual_plan') walk(x[k], me, depth + 1); });
      })(doc, { card: '', world: fm[1] || '', at: (doc && typeof doc.at === 'string' && doc.at) || '' }, 0);
    });
    Object.keys(best).sort().forEach(function (k) { if (!drawn[k] && !(opts.skip && opts.skip(best[k]))) rows.push(best[k]); });
    var used = {};
    rows.forEach(function (r) { used[r.shade] = (used[r.shade] || 0) + 1; });
    return { used: used, drawn: drawn, rows: rows };
  }
  /* 이 캐릭터가 이미 쓴 의상 계열 — 세 장은 일상복만 겹쳐도 되고(3), 일곱 장은 일상복도 겹치지 않게(10 — 2026-11-07 뮤츠 시험 자유 셋이 다 일상복) */
  function famRepeat(taken, k, N) { return !has(taken, k) ? 0 : N > LEGACY_CUTS ? 10 : k !== 'everyday' ? 3 : 0; }
  /* 일곱 장 — 바로 앞 캐릭터 하나(배치 안이면 배치에서 바로 앞, 아니면 장부의 마지막)와만 견준다. 셋 · 배치 전부와 견주면 스물한 컷이 값을 다 쓴다 */
  function freshWindow(N, base, cmp, others, fixed) { return N > LEGACY_CUTS ? (others.length ? others.slice(-1) : base.slice(-1)) : cmp; }
  function count(a, x) { var n = 0, i; for (i = 0; i < a.length; i++) if (a[i] === x) n++; return n; }
  function combos(list, k) {
    var out = [];
    (function go(i, cur) { if (cur.length === k) { out.push(cur.slice()); return; } for (var j = i; j < list.length; j++) { cur.push(list[j]); go(j + 1, cur); cur.pop(); } })(0, []);
    return out;
  }
  function srcCombosFor(N) {
    var out = [[]], i;
    for (i = 0; i < N; i++) out = [].concat.apply([], out.map(function (s) { return SOURCE.map(function (v) { return s.concat([v]); }); }));
    return out;
  }
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
    traditional: '\\b(hanbok|kimono|yukata|sari|ao dai|dirndl|hanfu)\\b',
    bodysuit: '\\b(bodysuit|leotard|catsuit)\\b'   /* 할로윈 · 포켓몬 코스튬(2026-11-01) */
  };
  var COVERING = ['coat', 'jacket', 'cardigan', 'sweater'];
  var ONE_PIECE = ['dress', 'jumpsuit', 'overalls', 'swimsuit', 'slip', 'robe', 'traditional', 'lingerie_set', 'bikini', 'bodysuit'];
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
    'mini length', 'high-cut leg', 'plunging neckline', 'bare midriff', 'strapless top', 'one-shoulder cut',
    'deep V neckline', 'sweetheart neckline', 'backless', 'cutout waist'];
  /* 깊게 파인 목선 — 컷마다 하나는 이것(2026-11-07 사용자 「일상컷 의상들을 더 몸매가 드러나는 파인 의상들로」) */
  var NECKLINE = ['plunging neckline', 'deep V neckline', 'sweetheart neckline'];
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
    'nostalgic', 'pensive', 'wistful', 'mischievous', 'proud', 'flustered', 'relieved', 'laughing', 'laughing_open', 'confident', 'serious', 'wink'];
  var ALLURE = ['confident', 'sensual', 'provocative', 'half_smile', 'smug', 'playful', 'calm', 'mischievous', 'pensive', 'wistful', 'soft_smile', 'cold_smile', 'serious', 'flustered', 'sleepy', 'wink'];
  var EXPR_FOR = {
    lingerie: ALLURE, evening: ALLURE.concat(['laughing', 'amused', 'proud']), homewear: ALLURE.concat(['sleepy', 'candid', 'amused', 'gentle']),
    swimwear: ALLURE.concat(['laughing', 'candid', 'amused', 'surprised']), bath: ALLURE.concat(['relieved', 'sleepy', 'gentle']),
    roleplay: ALLURE.concat(['proud', 'amused', 'laughing', 'focused']), editorial: ALLURE.concat(['bored', 'unimpressed', 'cold_smile', 'proud', 'serious']),
    active: WARM.concat(['exhausted', 'relieved', 'determined']), retro: ALLURE.concat(['playful', 'laughing', 'proud', 'amused']),
    subculture: ALLURE.concat(['bored', 'unimpressed', 'cold_smile', 'proud', 'determined']), costume: ALLURE.concat(['proud', 'amused', 'curious', 'focused']), game_cosplay: ALLURE.concat(['proud', 'amused', 'playful', 'focused']),
    bridal: ALLURE.concat(['gentle', 'laughing', 'nostalgic', 'relieved', 'flustered']), work: WARM.concat(['sensual', 'smug'])
  };
  var STILL_FAMS = ['lingerie', 'evening', 'homewear', 'traditional', 'bath', 'bridal'];
  var DRINKS = ['cup', 'drink_glass', 'water_bottle', 'teapot'];   /* 마실 것 — 한 캐릭터 세 장에 한 장까지(game 계획기와 같다) */
  var RUNNING = ['mid_action', 'stretching', 'mid_stride'];
  /* 옷 종류에 맞는 드러내는 방식 */
  var EXPOSE_FOR = {
    traditional: ['deep V neckline', 'off-shoulder neckline', 'open back', 'high thigh slit', 'cropped hem', 'side cutouts', 'one-shoulder cut'],
    swim: ['high-cut leg', 'plunging neckline', 'deep V neckline', 'sweetheart neckline', 'open back', 'side cutouts', 'cutout waist', 'strapless top', 'halter neck', 'bare midriff'],
    dress: ['off-shoulder neckline', 'halter neck', 'open back', 'backless', 'high thigh slit', 'mini length', 'plunging neckline', 'deep V neckline', 'sweetheart neckline', 'one-shoulder cut', 'strapless top', 'side cutouts', 'cutout waist'],
    separates: ['cropped hem', 'bare midriff', 'plunging neckline', 'deep V neckline', 'sweetheart neckline', 'off-shoulder neckline', 'halter neck', 'mini length', 'side cutouts', 'cutout waist', 'one-shoulder cut', 'open back', 'strapless top']
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
  var EXTRA = {}, EXTRA_ROWS = [];
  function setExtra(tree2) { EXTRA = {}; EXTRA_ROWS = ((tree2 || {}).extra_places || []).slice(); EXTRA_ROWS.forEach(function (p) { EXTRA[p.key] = p.group; }); }
  function groupOf(tree, c) { var p = tree_().place(tree, c.place); return p ? p.group : (EXTRA[c.place] || ''); }
  function reqFams(tree) { return (tree.required || {}).outfits || []; }
  /* 세 장 시절의 필수 갈래(레트로도) — 세 장으로 등록된 캐릭터를 읽을 때만 */
  function reqFamsLegacy(tree) { return reqFams(tree).concat((tree.required || {}).legacy_outfits || []); }
  /* 포켓몬 코스튬(2026-11-01 사용자 「해당 케릭터의 성인 버전 코스튬 의상을 추가해서 필수컷에」) — 필수 갈래와 따로 세 장에 한 장.
     새로 정하는 캐릭터만(다시 채우기 · 이미 등록된 캐릭터는 그대로) */
  function costumeFam(tree) { return (tree.costume_required || {}).outfit || ''; }
  function costumeSlot(tree, kept, slots, reqSlots, refill, rand) {
    var COS = costumeFam(tree);
    if (!COS || refill || kept.some(function (c) { return c.ofam === COS; })) return null;
    var rest = slots.filter(function (n) { return !has(reqSlots, n); });
    return rest.length ? rest[Math.floor(rand() * rest.length)] : null;
  }
  /* 게임 코스프레(2026-11-15 사용자 「pkm,원소,삼국지 공방에 갈래 하나 추가해서 게임공방에 있는 게임 코스프레 의상은 어떨까?」 → 필수에서 상황 노출 대신) —
     열 장에 한 장, 포켓몬 코스튬과 따로(코스튬 필수 컷이 둘). 트리 표 cosplay_required(의상 계열 · 장소 · 물가 재단 · 안 쓰는 프레이밍), 목록과 쓴 기록은 o.cosplay = { list, used, full }.
     o.cosplay 가 없으면(목록 없이 부르는 옛 검사 · 도구) 예전 구성(상황 노출 한 장) 그대로. 새로 정하는 캐릭터만 — 다시 채우기는 그대로 */
  function cosplayFam(tree) { return (tree.cosplay_required || {}).outfit || ''; }
  function cosplaySlot(tree, o, kept, slots, reqSlots, cosSlot, refill, rand) {
    var GC = cosplayFam(tree);
    if (!GC || !(o.cosplay && o.cosplay.list) || refill || kept.some(function (c) { return c.ofam === GC; })) return null;
    var rest = slots.filter(function (n) { return !has(reqSlots, n) && n !== cosSlot; });
    return rest.length ? rest[Math.floor(rand() * rest.length)] : null;
  }
  /* 게임 · 캐릭터 · 재단 — lib/game-cosplay.js pickCosplay. --avoid 의 item=gc_<재단> · cosplay=<게임 열쇠> 를 피한다 */
  function cosplayChoose(o, n, rand, card) {
    var av = [];
    (o.avoid || []).forEach(function (a) {
      if (a.cut != null && a.cut !== n) return;
      if (a.field === 'item' && /^gc_/.test(a.value)) av.push({ field: 'cut', value: a.value.slice(3) });
      if (a.field === 'cosplay') av.push({ field: 'game', value: a.value });
    });
    var got = gcm_().pickCosplay(o.cosplay.list, o.cosplay.used || [], rand, { full: o.cosplay.full || [], avoid: av });
    if (!got) throw new Error('casual-plan: no game cosplay left to pick (' + card + ')');
    return got;
  }
  /* 1회차 칸의 2회차 몫(again)을 그 장소에 맞게(물가면 수영복 재단) 다시 — 원소 withAgain 과 같다 */
  function cosplayAgainAt(tree, o, pick, place, rand) {
    if (!pick.again) return pick;
    var a = gcm_().cosplayAgain(o.cosplay.list, o.cosplay.used || [], pick.game, rand, function (k) { return cosplayPlaceOk(tree, k, place); }, pick.cut), out = Object.assign({}, pick);
    if (a) out.again = a; else delete out.again;
    return out;
  }
  /* 그 재단이 설 수 있는 장소 — 표의 places, 물가 재단(비키니 · 원피스 수영복)이면 water_places 도 */
  function cosplayPlaceOk(tree, cutKey, placeKey) { var R = tree.cosplay_required || {}; return has(R.places, placeKey) || (has(R.water_cuts, cutKey) && has(R.water_places, placeKey)); }
  /* 옛 계획 다시 짜기(2026-11-16 사용자 「오버워치 메르시가 4케릭터안에서 2번이나」 → 「응 그래」) — 계획의 아직 안 그린 옛 pick 칸(등장인물 많은 게임 · character 빈 칸)의
     cosplay 만 새 규칙(lib/game-cosplay.js pickCosplay — 캐릭터를 계획기가 정한다)으로 다시 정한다. 장소는 그대로 — 그 장소가 받는 재단만(물가면 수영복 재단), 되면 원래 재단.
     옷(gc_<재단>) · 옷 종류(garments)만 재단을 따라간다. 다른 칸 · 다른 컷은 그대로.
     o = { tree, cosplay: { list, used, full }, cuts, done(컷) — 참이면 그린 컷(안 바꾼다), seed | rand }. 돌려주는 것 { cuts(새 배열), changed: [{ cut, was, now }] } */
  function isPickCut(list, c) { var x = c && c.cosplay, g = x && gcm_().game(list, x.game); return !!(g && g.many && !String(x.character || '').trim()); }
  function recosplayCuts(o) {
    var G = gcm_(), CT = tree_(), list = o.cosplay.list, used = (o.cosplay.used || []).slice(), rand = o.rand || rng('recosplay|' + (o.seed || '')), changed = [];
    var cuts = o.cuts.map(function (c0) {
      var c = Object.assign({}, c0);
      if (!isPickCut(list, c) || c.kept || (o.done && o.done(c))) return c;
      var ok = (list.cuts || []).map(function (k) { return k.key; }).filter(function (k) { return cosplayPlaceOk(o.tree, k, c.place); });
      var got = ok.length ? G.pickCosplay(list, used, rand, { full: o.cosplay.full || [], cuts: ok, prefer: c.cosplay.cut }) : null;
      if (!got) throw new Error('casual-plan recosplay: no game cosplay for cut ' + c.cut + ' at ' + c.place);
      var was = c.cosplay;
      c.cosplay = got; c.item = 'gc_' + got.cut;
      c.garments = uniq(garmentsOf((CT.item(o.tree, c.ofam, c.item) || {}).en || '')).sort();
      used.push(got); changed.push({ cut: c.cut, was: was, now: got });
      return c;
    });
    return { cuts: cuts, changed: changed };
  }
  function chooseSitu(S, tree, N, slots, cuts, kept, reqSlots, cosSlot, hist, avoided, rand, card, indoorAt) {
    cosSlot = [].concat(cosSlot);   /* 코스튬 컷 번호들 — 포켓몬 코스튬 · 게임 코스프레(2026-11-15) */
    slots.forEach(function (n) { cuts[n].situ = ''; });
    if (N < NINE_CUTS || kept.some(function (c) { return c.situ; })) return null;
    var NF = S.SITU_NOT_FRAMES || ['face_close'], use = recency(hist, function (c) { return c.situ || null; });
    var opts = [];
    slots.forEach(function (n) {
      var c = cuts[n];
      if (has(reqSlots, n) || has(cosSlot, n) || has(NF, c.frame) || c.ofree || c.xfree) return;   /* 자유 설계 칸엔 안 얹는다(게임 코스프레 구성은 그 칸을 먼저 정한다) */
      situsFor(S, situText(tree, c)).forEach(function (k) {
        /* 새 상황 일곱은 옷 글에 좁게 맞는다 — 옷이 트리의 옷(item)으로 정해진 컷에만 준다. 작업자가 옷 글을 쓰는 컷(garments)은 글이 달라져 Situation 줄이 빠질 수 있다 */
        if (!c.item && !has(['wet', 'wind', 'undone', 'strap'], k)) return;
        if (indoorAt && !indoorAt(c, k)) return;   /* 상황 표의 조건(2026-11-13 — 바람은 실내가 아닌 곳, 땀은 더운 곳, 역광 실루엣은 창 · 하늘, 트임은 걷거나 앉은 전신 컷). 젖은 옷은 실내면 지시문이 물 튐 글(enIn) */
        if (!avoided(n, 'situ', k)) opts.push({ n: n, k: k });
      });
    });
    var got = pick(opts, function (x) { return (use[x.k] || 0) + rand() * 0.5; }, rand);
    if (!got) throw new Error('casual-plan v2: no free cut fits a situation (' + card + ')');
    cuts[got.n].situ = got.k;
    return { cut: got.n, situ: got.k };
  }
  /* 게임 코스프레 구성의 상황 한 장(2026-11-16 사용자 「늘 1장은 나오게 맞춰줘」) — 먼저 상황을 일반 컷 하나에 얹고 자유 설계 칸을 고른다(옛 차례).
     그러면 자유 설계 칸이 모자라면(얼굴 클로즈업이 많을 때) 자유 설계 칸을 먼저 정하고 남은 일반 컷에 상황. 그래도 안 되면 상황 없이(자유 설계 칸은 늘 선다) */
  function situThenFrees(cuts, slots, situ, frees, strict) {
    var clear = function () { slots.forEach(function (n) { cuts[n].situ = ''; delete cuts[n].ofree; delete cuts[n].sfree; delete cuts[n].xfree; }); };
    try { var a = situ(); frees(); return a; } catch (e) { clear(); }
    frees();
    try { return situ(); } catch (e) { if (strict) throw e; slots.forEach(function (n) { cuts[n].situ = ''; }); return null; }   /* strict(기본 v2) — 던져서 계획기가 다른 씨앗으로 다시 짜게(옛 필수 때와 같다) */
  }
  /* 옷 자유 컷(2026-11-09 사용자 「element, pkm 쪽도 넣어주고. 포켓몬은 지금 일상9장이니까 2장정도 분배해줘도 되겠다」) — 아홉 장이면 두 장:
     필수 셋 · 코스튬 · 상황 컷이 아니고 얼굴 클로즈업이 아닌 컷. Outfit 줄이 S.OUTFIT_FREE(노출 의상을 GPT · Claude 가, 우리 옷 계열에 없는 것 위주로), 옷 색은 비운다 */
  var OFREE_N = 2;
  function o_refill(kept) { return (kept || []).length > 0; }   /* 이미 등록된 컷을 받은 계획 = 다시 채우기 */
  function chooseOfree(S, N, slots, cuts, kept, reqSlots, cosSlot, rand, card) {
    cosSlot = [].concat(cosSlot);
    slots.forEach(function (n) { delete cuts[n].ofree; delete cuts[n].sfree; });
    var need = OFREE_N - kept.filter(function (c) { return c.ofree; }).length;   /* 이미 만든 컷(kept)의 옷 자유는 센다 */
    if (N < NINE_CUTS || need <= 0) return null;
    var NF = S.SITU_NOT_FRAMES || ['face_close'];
    var pool = slots.filter(function (n) { var c = cuts[n]; return !has(reqSlots, n) && !has(cosSlot, n) && !c.situ && !has(NF, c.frame); });
    if (o_refill(kept) && pool.length < need) need = pool.length;   /* 다시 채우기(2026-11-18 — 일곱 · 아홉 장 캐릭터를 열 장까지 늘릴 때)는 남은 자리만큼만 */
    if (pool.length < need) throw new Error('casual-plan v2: not enough free cuts for free outfits (' + card + ')');
    var got = [];
    while (got.length < need) { var k = pool.splice(Math.floor(rand() * pool.length), 1)[0]; got.push(k); cuts[k].ofree = true; cuts[k].ocolor = ''; }
    /* 장면 자유(2026-11-11 「지금 맡겨놓은 일상컷 1장만 같이 이런식으로」) — 열 장이면 옷 자유 둘 가운데 한 장은 장소 · 활동 · 자세 · 구도 · 의상을 맡은 쪽이(S.FREE_SCENE) */
    if (N >= CUTS && !kept.some(function (c) { return c.sfree; })) cuts[got[Math.floor(rand() * got.length)]].sfree = true;
    return got.sort(function (a, b) { return a - b; });
  }
  /* 갈래 · 상황 자유 컷(2026-11-11) — 열 장이면 한 장: 필수 셋 · 코스튬 · 상황 · 옷 자유 컷이 아니고 얼굴 클로즈업이 아닌 컷.
     SCENE 이 S.FREE_SCENE 주문(장소 · 활동 · 자세 · 구도 · 의상을 맡은 쪽이 — 필수 갈래 하나를 골라 outfit-catalog.md 에 없는 노출 의상 + 우리 상황 목록에 없는 노출 상황), 옷 색은 비운다 */
  function chooseXfree(S, N, slots, cuts, kept, reqSlots, cosSlot, rand, card) {
    cosSlot = [].concat(cosSlot);
    slots.forEach(function (n) { delete cuts[n].xfree; });
    if (N < CUTS || kept.some(function (c) { return c.xfree; })) return null;
    var NF = S.SITU_NOT_FRAMES || ['face_close'];
    var pool = slots.filter(function (n) { var c = cuts[n]; return !has(reqSlots, n) && !has(cosSlot, n) && !c.situ && !c.ofree && !has(NF, c.frame); });
    if (!pool.length && o_refill(kept)) return null;   /* 다시 채우기는 자리가 없으면 건너뛴다 */
    if (!pool.length) throw new Error('casual-plan v2: no free cut for the free category + situation cut (' + card + ')');
    var k = pool[Math.floor(rand() * pool.length)];
    cuts[k].xfree = true; cuts[k].ocolor = '';
    return k;
  }
  function isRequired(tree, c, legacy) { return has(legacy ? reqFamsLegacy(tree) : reqFams(tree), c.ofam) || has(REQUIRED, c.cat); }
  /* 1. 필수 갈래 자리 — 일곱 장: 아직 없는 필수 계열마다 한 자리(최근에 필수가 덜 간 번호). 세 장: 바로 앞 캐릭터와 다른 번호, 앞 넷이 모두 한 장이면 두 장 */
  function requiredSlots(N, tree, o) {
    var kept = o.kept, slots = o.slots, refill = o.refill, hist = o.hist, base = o.base, rand = o.rand, keptNo = kept.map(function (c) { return c.cut; });
    var legacy = N <= LEGACY_CUTS, reqOf = function (c) { return isRequired(tree, c, legacy); };
    var posUse = recency(base.slice(-10), function (c) { return isRequired(tree, c, true) ? 'p' + c.cut : null; });
    if (!legacy) {
      var need = reqFams(tree).filter(function (f) { return !kept.some(function (c) { return c.ofam === f; }); });
      var opts = combos(slots, Math.min(need.length, slots.length));
      var got = pick(opts, function (s) { return s.reduce(function (a, n) { return a + (posUse['p' + n] || 0); }, 0); }, rand) || [];
      return { slots: got, why: { slots: got, all: true } };
    }
    var prev = hist.length ? hist[hist.length - 1].cuts.filter(reqOf).map(function (c) { return c.cut; }).sort() : null;
    var last4 = hist.slice(-(TWO_REQUIRED_EVERY - 1));
    var needTwo = !refill && last4.length === TWO_REQUIRED_EVERY - 1 && last4.every(function (e) { return e.cuts.filter(reqOf).length < 2; });
    var keptReq = kept.filter(reqOf).map(function (c) { return c.cut; }), reqSlots;
    if (refill) reqSlots = keptReq.length ? [] : [slots[Math.floor(rand() * slots.length)]];
    else {
      var options = (needTwo ? [[1, 2], [1, 3], [2, 3]] : [[1], [2], [3]]).filter(function (x) { return !prev || x.join() !== prev.join(); });
      /* 이미 만든 컷(kept)을 두고 다시 정할 때 — 그 컷이 필수 갈래면 그 자리를 품은 짝만, 아니면 그 자리를 뺀 짝만 */
      options = options.filter(function (x) { return kept.every(function (c) { return reqOf(c) === has(x, c.cut); }); });
      if (!options.length) options = [keptReq.length ? keptReq.slice() : [slots[0]]];
      reqSlots = pick(options, function (x) { return x.reduce(function (a, n) { return a + (posUse['p' + n] || 0); }, 0); }, rand).filter(function (n) { return !has(keptNo, n); });
    }
    return { slots: reqSlots, why: { slots: reqSlots, two: needTwo, prev: prev } };
  }
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
    return freshFill(n, freshGroups(tree));
  }
  /* 새로 더한 장소(표 start_median — 2026-11-23 놀이공원 · 포켓몬 사파리 · 수족관 · 카페)는 쓴 장소의 가운데 값에서 시작한다.
     장소 · 묶음 점수가 낮은 것부터 고르니 그대로 두면(점수 0) 한동안 새 장소 · 새 묶음만 뽑혔다. 장소가 다 새것인 묶음도 같이 */
  function freshPlaces(tree) { return tree.places.concat(EXTRA_ROWS).filter(function (p) { return p.start_median; }).map(function (p) { return p.key; }); }
  function freshGroups(tree) {
    var all = tree.places.concat(EXTRA_ROWS);
    return tree.groups.map(function (g) { return g.key; }).filter(function (g) { var ps = all.filter(function (p) { return p.group === g; }); return ps.length && ps.every(function (p) { return p.start_median; }); });
  }
  function freshFill(score, keys) {
    var v = Object.keys(score).map(function (k) { return score[k]; }).filter(function (x) { return x > 0; }).sort(function (a, b) { return a - b; });
    if (!v.length) return score;
    var mid = v[Math.floor(v.length / 2)], out = Object.assign({}, score);
    keys.forEach(function (k) { if (!out[k]) out[k] = mid; });
    return out;
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
    cmp.forEach(function (e) { e.cuts.forEach(function (c) { pairs[c.orient + '|' + c.frame] = 1; }); });
    /* 새 값(방향 · 프레이밍 · 옷 종류) — 일곱 장이면 바로 앞 캐릭터(+ 배치)와만 견준다. 셋과 견주면 스물한 컷이 값을 거의 다 써서 못 맞춘다 */
    freshWindow(cutCount(o), base, cmp, others, fixed).forEach(function (e) { e.cuts.forEach(function (c) { orients[c.orient] = 1; frames[c.frame] = 1; (c.garments || []).forEach(function (g) { gar[g] = 1; }); }); });
    /* 배치 안에서 앞 캐릭터가 "새 값" 으로 잡은 옷 종류·방향·프레이밍 — 뒤 캐릭터가 같이 쓰면 앞 캐릭터의 새 값이 사라진다(check 는 배치 전체를 본다) */
    var claimed = { garment: {}, orient: {}, frame: {} };
    batch.forEach(function (b) { var k; for (k in claimed) ((b.claims || {})[k] || []).forEach(function (v) { claimed[k][v] = 1; }); });
    var avoided = function (cut, field, value) { return avoid.some(function (a) { return (a.cut == null || a.cut === cut) && a.field === field && a.value === value; }); };
    var keptNo = kept.map(function (c) { return c.cut; }), N = cutCount(o), LIM = repeatLimit(N);
    var slots = nums(N).filter(function (n) { return !has(keptNo, n); });
    var why = { count: N }, P = paths(tree, subject), RF = N <= LEGACY_CUTS ? reqFamsLegacy(tree) : reqFams(tree);

    var rq = requiredSlots(N, tree, { kept: kept, slots: slots, refill: refill, hist: hist, base: base, rand: rand }), reqSlots = rq.slots;
    why.required = rq.why;   /* 말로 옮기기는 tools/casual-plan.cjs */
    var COS = costumeFam(tree), cosSlot = costumeSlot(tree, kept, slots, reqSlots, refill, rand);
    why.costume = cosSlot;
    var GC = cosplayFam(tree), gcSlot = cosplaySlot(tree, o, kept, slots, reqSlots, cosSlot, refill, rand), gcPick = gcSlot ? cosplayChoose(o, gcSlot, rand, card) : null;
    var gcMode = !!gcSlot || (!!GC && kept.some(function (c) { return c.ofam === GC; })), GC_NF = (tree.cosplay_required || {}).not_frames || [];
    why.cosplay = gcSlot ? Object.assign({ cut: gcSlot }, gcPick, { cutKey: gcPick.cut }) : null;

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
        return p.options.some(function (x) { return (fam ? x.fam === fam : !has(RF, x.fam) && x.fam !== COS && x.fam !== GC) && !avoided(n, 'ofam', x.fam) && !avoided(n, 'era', x.era); });
      });
    }
    var fresh = function (g, n) { return pathOptions(n, g).some(function (p) { return !everUsed[p.key]; }) ? FRESH_BONUS : 0; };
    var eraScore = function (e) { return ((eraUse[e] || 0) + 1 + 2 * takenEras.filter(function (x) { return x === e; }).length) / (ERA_WEIGHT[e] || 1); };
    function choose(n, p, fam) {
      var opts = p.options.filter(function (x) { return (fam ? x.fam === fam : !has(RF, x.fam) && x.fam !== COS && x.fam !== GC) && !avoided(n, 'ofam', x.fam) && !avoided(n, 'era', x.era); });
      var f = fam || pick(uniq(opts.map(function (x) { return x.fam; })), function (k) { return (famUse[k] || 0) + famRepeat(takenFams, k, N); }, rand);
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
    if (gcSlot) {   /* 게임 코스프레 — 그 재단이 설 수 있는 장소(표 cosplay_required)의 길 */
      var gc1 = pathOptions(gcSlot, '', GC).filter(function (p) { return cosplayPlaceOk(tree, gcPick.cut, p.place); });
      /* 포켓몬 코스튬이 설 묶음을 남긴다(두 코스튬 컷의 장소가 겹친다 — 무대 · 오락실 · 집 · 화보) */
      var gl1 = gc1.filter(function (p) { return !cosSlot || pathOptions(cosSlot, '', COS).some(function (q) { return q.group !== p.group; }); });
      var gp1 = pick(gl1.length ? gl1 : gc1, pathScore, rand);
      if (!gp1) throw new Error('casual-plan: no path to the game cosplay outfit family (' + card + ' cut ' + gcSlot + ')');
      cuts[gcSlot] = choose(gcSlot, gp1, GC); cuts[gcSlot].item = 'gc_' + gcPick.cut; cuts[gcSlot].cosplay = cosplayAgainAt(tree, o, gcPick, gp1.place, rand);
      takenGroups.push(gp1.group); takenFams.push(GC); takenEras.push(cuts[gcSlot].era);
    }
    if (cosSlot) {
      var cp = pick(pathOptions(cosSlot, '', COS), pathScore, rand);
      /* 코스튬 컷이 설 장소 묶음(무대 · 오락실 · 집 · 화보)을 필수 · 게임 코스프레 칸이 다 가져가면 그 묶음의 다른 장소로(2026-11-23 — 옷이 늘어 난수 순서가 바뀌자 시험 GC1 · Z0 에서 드러남, 같은 장소는 안 됨) */
      if (!cp) { var keepG = takenGroups, usedPl = Object.keys(cuts).map(function (k) { return cuts[k] && cuts[k].place; }); takenGroups = kept.map(function (c) { return groupOf(tree, c); }); cp = pick(pathOptions(cosSlot, '', COS).filter(function (q) { return usedPl.indexOf(q.place) < 0; }), pathScore, rand); takenGroups = keepG; }
      if (!cp) throw new Error('casual-plan: no path to the costume outfit family (' + card + ' cut ' + cosSlot + ')');
      cuts[cosSlot] = choose(cosSlot, cp, COS); takenGroups.push(cp.group); takenFams.push(COS); takenEras.push(cuts[cosSlot].era);
    }
    var free = slots.filter(function (n) { return !has(reqSlots, n) && n !== cosSlot && n !== gcSlot; });
    /* 일곱 장 — 자유 컷은 이 캐릭터가 아직 안 쓴 의상 계열이 있는 길에서(2026-11-07) */
    var newFam = function (n, p) { return p.options.some(function (x) { return !has(RF, x.fam) && x.fam !== COS && x.fam !== GC && !has(takenFams, x.fam) && !avoided(n, 'ofam', x.fam) && !avoided(n, 'era', x.era); }); };
    free.forEach(function (n, i) {
      var pool = tree.groups.map(function (g) { return g.key; }).filter(function (g) { return !has(takenGroups, g) && !avoided(n, 'group', g) && pathOptions(n, g).length; });
      if (N > LEGACY_CUTS) { var nf = pool.filter(function (g) { return pathOptions(n, g).some(function (p) { return newFam(n, p); }); }); if (nf.length) pool = nf; }
      if (i === 0 && !refill) { var lowPool = pool.filter(function (k) { return has(low, k); }); if (lowPool.length) pool = lowPool; }
      /* 새 묶음 몫(2026-11-24 사용자 「포켓몬만 좀 더 자주 나오게 해줘」) — 장소가 다 새것인 묶음(놀이공원 · 탈 것 · 보드 · 하늘 …)은 가운데 값에서 시작해 240컷에 0번 나왔다.
         둘째 자유 칸은 FRESH_RATE 확률로 새 묶음에서만 고른다 — 한 묶음에 많아야 한 장이라 몰리지 않는다 */
      if (i === 1 && !refill) { var freshPool = pool.filter(function (k) { return has(freshGroups(tree), k); }); if (freshPool.length && rand() < FRESH_RATE) pool = freshPool; }
      var g = pick(pool, function (k) { return (groupUse[k] || 0) - fresh(k, n) + 0.3 * crowd(o.look, 'group:' + k); }, rand);
      var gp = g ? pathOptions(n, g) : [];
      if (N > LEGACY_CUTS) { var np = gp.filter(function (p) { return newFam(n, p); }); if (np.length) gp = np; }
      var p = pick(gp, pathScore, rand);
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
    /* 이 캐릭터가 이미 입힌 옷 종류 — 일곱 장이면 같은 옷(셔츠 + 반바지 …)이 여러 번 나왔다(2026-11-07 뮤츠 시험) */
    var charGar = keptGar.slice();
    /* 게임 코스프레 컷은 재단이 옷을 정한다 — 먼저(덮는 겉옷 · 새 옷 종류를 다른 컷이 그 위에서 맞춘다) */
    var gOrder = gcSlot ? [gcSlot].concat(slots.filter(function (n) { return n !== gcSlot; })) : slots;
    gOrder.forEach(function (n, i) {
      var c = cuts[n], a = CT.act(tree, c.act), last = i === gOrder.length - 1;
      if (n === gcSlot) { var gs = uniq(garmentsOf((CT.item(tree, c.ofam, c.item) || {}).en || '')).sort(); if (gs.some(function (g) { return has(COVERING, g); })) covered = true; if (gs.some(function (g) { return !gar[g]; })) newGar = true; c.garments = gs; charGar = charGar.concat(gs); return; }
      var score = function (g) { return (garUse[g] || 0) + (gar[g] ? 1.5 : 0) + 3 * count(charGar, g) + 0.3 * crowd(o.look, 'garment:' + g) - (last && !newGar && !gar[g] ? 10 : 0); };
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
      c.garments = set; charGar = charGar.concat(set);
    });

    chooseColors(S, tree, slots, cuts, kept, base.slice(-EX_WINDOW).concat(others), subject, avoided, rand, o.look);

    /* 4. 표정·자세·방향·프레이밍·화각 — 세 장 서로 다르게, (방향, 프레이밍) 짝은 비교 대상과 겹치지 않게, 한 장은 새 방향이나 새 프레이밍.
          트리 규칙(자세 계열·앉는 자리·손·보이는 부위·안 쓰는 값·얼굴 클로즈업은 얼굴이 카메라 쪽인 방향만·필수 갈래 컷엔 안 씀) 안에서 */
    var exprs = concrete(S.EXPRESSION_OPTIONS), lenses = concrete(S.LENS_OPTIONS), allFrames = concrete(S.FRAME_OPTIONS);
    var use = function (field) { return recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c[field]; }); };
    var U = { expr: use('expr'), pose: use('pose'), orient: use('orient'), frame: use('frame'), lens: use('lens') };
    var pairUse = recency(base, function (c) { return c.orient + '|' + c.frame; });
    var taken = { expr: kept.map(function (c) { return c.expr; }).filter(Boolean), pose: kept.map(function (c) { return c.pose; }).filter(Boolean), orient: kept.map(function (c) { return c.orient; }), frame: kept.map(function (c) { return c.frame; }), lens: [],
      pair: kept.map(function (c) { return c.orient + '|' + c.frame; }) };
    var freshDone = kept.some(function (c) { return !orients[c.orient] || !frames[c.frame]; });
    slots.forEach(function (n, i) {
      var c = cuts[n], a = CT.act(tree, c.act), it = CT.item(tree, c.ofam, c.item), text = (a.en + ' ' + (it ? it.en : '')).toLowerCase();
      var lowItem = !!(it && it.low);
      var mustFresh = !refill && !freshDone && i === slots.length - 1;   /* 다시 채우기는 새 값 조건을 안 본다(장부 check 와 같게) */
      /* 짝 고르기 — 조건을 다 지키는 짝이 없으면 뒤에서부터 하나씩 풀어 다시 본다(새 값 → 배치가 잡은 값 → 비교 대상과 겹치는 짝).
         계획기는 그래도 계획을 낸다 — 장부 check 가 어긋난 것을 말해 주고, 씨앗을 바꿔 다시 정한다(멈추지 않는다).
         마지막 단계는 이 캐릭터의 다른 컷이 쓴 방향·프레이밍도 푼다 — 앞 두 컷이 그 하는 일이 받는 프레이밍을 다 가져가면(목욕 · 물속처럼 받는 것이 적은 길) 짝이 없어 멈췄다 */
      var combos = [], step;
      for (step = 0; step < 5 && !combos.length; step++) {
        allFrames.forEach(function (fr) {
          if ((step < 4 && count(taken.frame, fr) >= LIM) || avoided(n, 'frame', fr) || (step < 2 && claimed.frame[fr])) return;
          if (!CT.frameOk(tree, c.act, fr, c) || (lowItem && CT.frameRule(tree, fr).low === false) || (n === gcSlot && has(GC_NF, fr))) return;
          var poseOK = CT.poses(tree, c.act, fr).filter(function (p) { return !has(taken.pose, p) && !avoided(n, 'pose', p) && poseFits(p, text) && !(has(STILL_FAMS, c.ofam) && has(RUNNING, p)); });
          CT.orients(tree, c.act, fr, S.CLOSE_FRAMES).forEach(function (or) {
            if ((step < 4 && count(taken.orient, or) >= LIM) || avoided(n, 'orient', or) || (step < 2 && claimed.orient[or]) || !orientFits(or, text)) return;
            if (step < 4 && has(taken.pair, or + '|' + fr)) return;
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
      var best = pick(combos, function (x) { return (U.orient[x.orient] || 0) + (U.frame[x.frame] || 0) + 2 * (count(taken.orient, x.orient) + count(taken.frame, x.frame)) + 0.5 * (pairUse[x.orient + '|' + x.frame] || 0) + 0.3 * crowd(o.look, 'pair:' + x.orient + '|' + x.frame) - (!orients[x.orient] || !frames[x.frame] ? 0.5 : 0); }, rand);
      if (!best) throw new Error('casual-plan: no orientation/framing pair (' + card + ' cut ' + n + ' ' + pathKey(c) + ')');
      c.orient = best.orient; c.frame = best.frame;
      /* 자세 — 하는 일이 자세를 이미 정하면 비워 둔다(트리에 맞는 자세가 없을 때). 활동 자세는 하는 일과 맞을 때 조금 앞세운다 */
      c.pose = pick(best.poses, function (p) { return (U.pose[p] || 0) - (ACTIVITY[p] ? 0.7 : 0); }, rand) || '';
      var moods = EXPR_FOR[c.ofam] || WARM;
      c.expr = CT.exprOk(tree, c) ? pick(exprs.filter(function (v) { return !has(taken.expr, v) && !avoided(n, 'expr', v) && has(moods, v); }), function (v) { return U.expr[v] || 0; }, rand) || '' : '';
      var lensOk = lenses.filter(function (v) { return !avoided(n, 'lens', v) && CT.lensOk(tree, c.frame, v); });
      c.lens = pick(lensOk.filter(function (v) { return !has(taken.lens, v); }), function (v) { return U.lens[v] || 0; }, rand) || pick(lensOk, function (v) { return count(taken.lens, v) + (U.lens[v] || 0); }, rand) || '';
      c.aspect = '2:3';
      if (c.expr) taken.expr.push(c.expr);
      if (c.pose) taken.pose.push(c.pose);
      taken.orient.push(c.orient); taken.frame.push(c.frame); taken.lens.push(c.lens); taken.pair.push(c.orient + '|' + c.frame);
      if (!orients[c.orient] || !frames[c.frame]) freshDone = true;
    });

    /* 4b. 상황 노출(2026-11-09) — planV2 와 같다. 게임 코스프레 구성(2026-11-15 — 필수에서 내려옴)에서도 일반 컷 하나에 늘 한 장(2026-11-16 사용자 「늘 1장은 나오게 맞춰줘」) —
       필수 · 코스튬(포켓몬 · 게임) 칸은 빼고 고른다 */
    var situ1 = function () { return chooseSitu(S, tree, N, slots, cuts, kept, reqSlots, [cosSlot, gcSlot], base.slice(-EX_WINDOW).concat(others), avoided, rand, card); };
    var frees1 = function () { why.ofree = chooseOfree(S, N, slots, cuts, kept, reqSlots, [cosSlot, gcSlot], rand, card); why.xfree = chooseXfree(S, N, slots, cuts, kept, reqSlots, [cosSlot, gcSlot], rand, card); };
    if (!gcMode) { why.situ = situ1(); frees1(); }
    else why.situ = situThenFrees(cuts, slots, situ1, frees1);   /* 게임 코스프레 구성 — 일반 컷 하나에 늘(2026-11-16), 안 되면 건너뛴다 */

    /* 5. 세부 강도 세 축 — 액션 비중은 자세·자세 계열에서, 분리형 선호는 옷에서, SOURCE 영향도는 세 장이 다르고 비교 대상과 구성이 겹치지 않게 */
    slots.forEach(function (n) {
      var c = cuts[n], fam = (CT.act(tree, c.act) || {}).family, meta = (tree.pose_meta || {})[c.pose] || {};
      c.axes = { action_level: has(MOVING, c.pose) || (!c.pose && has(['walk', 'move'], fam)) ? 'mostly active' : (meta.hands || has(['leaning_wall', 'leaning_furniture', 'bending_over'], c.pose) || (!c.pose && fam === 'low')) ? 'balanced' : 'mostly posed',
        separates_preference: c.garments.some(function (g) { return has(ONE_PIECE, g); }) && !c.garments.some(function (g) { return has(BOTTOMS, g); }) ? 'balanced' : 'prefer separates' };
    });
    var srcCombos = srcCombosFor(N), CN = nums(N), SAME = sameAxesLimit(N);
    var keptSrc = {};
    kept.forEach(function (c) { keptSrc[c.cut] = (c.axes || {}).source_influence; });
    var srcUse = recency(base.slice(-EX_WINDOW), function (c) { return (c.axes || {}).source_influence; });
    var okSrc = srcCombos.filter(function (s) {
      var full = CN.map(function (n, i) { return keptSrc[n] || s[i]; });
      if (kept.some(function (c) { return keptSrc[c.cut] && s[c.cut - 1] !== keptSrc[c.cut]; })) return false;
      if (uniq(full).length === 1) return false;
      if (refill) return true;
      var sorted = full.slice().sort().join();
      return !cmp.some(function (e) {
        if (e.cuts.length === N && e.cuts.map(function (c) { return (c.axes || {}).source_influence; }).sort().join() === sorted) return true;
        var same = CN.filter(function (n, i) {
          var c = cuts[n] || kept.filter(function (k) { return k.cut === n; })[0], ax = c && c.axes ? { action_level: c.axes.action_level, source_influence: full[i], separates_preference: c.axes.separates_preference } : null;
          return ax && e.cuts.some(function (x) { var y = x.axes || {}; return y.action_level === ax.action_level && y.source_influence === ax.source_influence && y.separates_preference === ax.separates_preference; });
        }).length;
        return same >= SAME;
      });
    });
    if (!okSrc.length && (o._tries || 0) >= 20) {
      /* 씨앗을 스무 번 바꿔도 겹치면 — 세 장이 다르기만 한 구성으로 낸다(장부 check 가 겹침을 말하고 다시 정한다). 끝없이 다시 부르면 호출이 넘친다 */
      okSrc = srcCombos.filter(function (s) { return uniq(CN.map(function (n, i) { return keptSrc[n] || s[i]; })).length > 1; });
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
    var takenExpose = [], leads = LEAD.slice(), charPairs = {};
    slots.forEach(function (n) {
      var c = cuts[n], kindList = EXPOSE_FOR[exposeKind(c.garments)], list = kindList.filter(function (x) { return !has(takenExpose, x); }), first, second;
      /* 일곱 장이면 그 옷 종류의 드러내기가 다 돈다 — 다시 처음부터, 이 캐릭터에 덜 쓴 것부터 · 같은 짝은 한 캐릭터에 한 번(2026-11-07 가디 일곱 장 중 넷이 「트인 등 + 원숄더」) */
      if (list.length < 2) list = kindList.slice();
      var exScore = function (x) { return 10 * count(takenExpose, x) + (exposeUse[x] || 0); };
      /* 첫째는 깊게 파인 목선(그 옷 종류에 있으면), 둘째는 목선이 아닌 것 */
      var necks = list.filter(function (x) { return has(NECKLINE, x); });
      if (!necks.length) necks = kindList.filter(function (x) { return has(NECKLINE, x); });
      first = pick(necks.length ? necks : list, exScore, rand);
      var ok2 = list.filter(function (x) { return x !== first && !charPairs[[first, x].sort().join('+')]; });
      var notNeck = ok2.filter(function (x) { return !has(NECKLINE, x); });
      if (notNeck.length) ok2 = notNeck;
      second = pick(ok2.filter(function (x) { return !usedPairs[[first, x].sort().join('+')]; }), exScore, rand) || pick(ok2, exScore, rand) || list.filter(function (x) { return x !== first; })[0];
      c.expose = [first, second];
      charPairs[[first, second].sort().join('+')] = 1;
      takenExpose.push(first, second);
      if (!leads.length) leads = LEAD.slice();
      c.lead = leads.splice(Math.floor(rand() * leads.length), 1)[0];
    });

    /* 3c. 구체 색 — 다른 칸을 다 정한 뒤(옷 자유 · 갈래 자유가 옷 색을 비운 뒤), 따로 씨앗 */
    chooseShades(S, tree, slots, cuts, kept, subject, (o.shade || {}).used, o.batch, avoided, rng('shade|' + (o.seed != null ? o.seed : card)));
    var out = nums(N).map(function (n) {
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
  /* 한 장까지 무리(표 once_groups) · 고를 표정(exprs) — 2026-11-25 */
  /* 운동 경기 · 놀이 소품 동작(2026-11-25) — 추천이 운동이 아니어도 이 동작이면 움직이는 컷 */
  var SPORT_USE_KEYS = ['bball_dribble', 'bball_shoot', 'ball_spin', 'bat_stance', 'mitt_catch', 'mitt_windup', 'soccer_throwin', 'soccer_juggle', 'volley_serve', 'volley_set', 'volley_dig', 'badminton_serve', 'pingpong_serve', 'racket_forehand', 'racket_serve', 'racket_ready', 'golf_address', 'golf_finish', 'bowl_throw', 'sand_build'];
  var SPORT_POSTURES = ['swim_crawl', 'float_back', 'slide_splash', 'yoga_tree', 'yoga_warrior', 'yoga_seated', 'jog', 'swing_sit', 'slide_sit', 'seesaw_sit', 'climb_frame'];
  function SPORT_USES(t) { return SPORT_USE_KEYS.filter(function (k) { return !!root.AtelierCasualTreeV2.use(t, k); }); }
  function onceOf(t, c) { var O = (t.v2 && t.v2.once_groups) || {}; if (!c) return []; return Object.keys(O).filter(function (k) { var o = O[k]; return has(o.uses || [], c.use) || has(o.postures || [], c.posture) || (o.hands || []).some(function (h) { return h === c.right || h === c.left; }); }); }
  function exprPool(t, c, all) { var C2 = root.AtelierCasualTreeV2, u = C2.use(t, c.use), p = C2.preset(t, c.preset), l = all; [u && u.exprs, p && p.exprs].forEach(function (x) { if (x && x.length) { var k = l.filter(function (e) { return has(x, e); }); if (k.length) l = k; } }); return l; }
  var V2_FIELDS = ['era', 'place', 'weather', 'time', 'moment', 'light', 'spot', 'depth', 'view', 'ofam', 'item', 'ocolor', 'shade', 'expose', 'situ', 'ofree', 'sfree', 'xfree', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'legs', 'gaze', 'expr', 'preset', 'cosplay', 'turn', 'ostyle', 'aspect'];   /* turn(고개 좌우 2026-11-20) · ostyle(옷 꾸밈 2026-11-23) — 빠져 있어 생성기 주소 · 지시문 묶음에서 사라졌다. aspect(화면비 2026-11-23) — 장부 · 생성기 주소 · 지시문 묶음까지 */
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
    cmp.forEach(function (e) { e.cuts.forEach(function (c) { pairs[c.orient + '|' + c.frame] = 1; }); });
    /* 새 값(방향 · 프레이밍 · 옷 종류) — 일곱 장이면 바로 앞 캐릭터(+ 배치)와만 견준다. 셋과 견주면 스물한 컷이 값을 거의 다 써서 못 맞춘다 */
    freshWindow(cutCount(o), base, cmp, others, fixed).forEach(function (e) { e.cuts.forEach(function (c) { orients[c.orient] = 1; frames[c.frame] = 1; (c.garments || []).forEach(function (g) { gar[g] = 1; }); }); });
    var claimed = { garment: {}, orient: {}, frame: {} };
    batch.forEach(function (b) { var k; for (k in claimed) ((b.claims || {})[k] || []).forEach(function (v) { claimed[k][v] = 1; }); });
    var avoided = function (cut, field, value) { return avoid.some(function (a) { return (a.cut == null || a.cut === cut) && a.field === field && a.value === value; }); };
    var keptNo = kept.map(function (c) { return c.cut; }), N = cutCount(o), LIM = repeatLimit(N);
    var slots = nums(N).filter(function (n) { return !has(keptNo, n); });
    var why = { tree: 2, count: N }, RF = N <= LEGACY_CUTS ? reqFamsLegacy(tree) : reqFams(tree);

    /* 1. 필수 갈래 자리 — plan 과 같다 */
    var rq = requiredSlots(N, tree, { kept: kept, slots: slots, refill: refill, hist: hist, base: base, rand: rand }), reqSlots = rq.slots;
    why.required = rq.why;
    var COS = costumeFam(tree), cosSlot = costumeSlot(tree, kept, slots, reqSlots, refill, rand);
    why.costume = cosSlot;
    var GC = cosplayFam(tree), gcSlot = cosplaySlot(tree, o, kept, slots, reqSlots, cosSlot, refill, rand), gcPick = gcSlot ? cosplayChoose(o, gcSlot, rand, card) : null;
    var gcMode = !!gcSlot || (!!GC && kept.some(function (c) { return c.ofam === GC; })), GC_NF = (tree.cosplay_required || {}).not_frames || [];
    why.cosplay = gcSlot ? Object.assign({ cut: gcSlot }, gcPick, { cutKey: gcPick.cut }) : null;

    /* 2. 장소 · 시대 · 의상 계열 — 버전2 는 의상을 장소가 거르지 않는다(시대만). 세 장은 다른 묶음, 한 장은 덜 쓴 묶음, 장소는 최근에 덜 쓴 것 */
    var places = C2.allPlaces(t).filter(function (p) { return t.v2.places[p.key]; }).map(function (p) {
      return { key: p.key, group: p.group, eras: (p.eras || []).filter(function (e) { return !C2.why(t, { era: e }, 'place', p.key, subject); }) };
    }).filter(function (p) { return p.eras.length; });
    var groupUse = freshFill(recency(base.slice(-GROUP_WINDOW).concat(others), function (c) { return groupOf(tree, c); }), freshGroups(tree));
    var famUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.ofam; });
    var eraUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.legacy ? null : c.era; });
    var placeUse = freshFill(recency(base, function (c) { return c.place; }), freshPlaces(tree));
    var low = lowGroups(tree, base.slice(-GROUP_WINDOW).concat(others));
    var cuts = {}, takenGroups = kept.map(function (c) { return (C2.place(t, c.place) || {}).group; }), takenFams = kept.map(function (c) { return c.ofam; }), takenEras = kept.map(function (c) { return c.era; });
    var awkUsed = kept.some(function (c) { return C2.awkward(t, c.ofam, c.place).length; });
    var eraScore = function (e) { return ((eraUse[e] || 0) + 1 + 2 * takenEras.filter(function (x) { return x === e; }).length) / (ERA_WEIGHT[e] || 1); };
    var famsAt = function (p, era, req) { var e = CT.era(tree, era); return (e ? e.outfits : []).filter(function (f) { return (req ? f === req : !has(RF, f) && f !== COS && f !== GC) && !avoided(0, 'ofam', f) && !(f === COS && C2.awkward(t, f, p.key).length) && !C2.why(t, { era: era, place: p.key }, 'ofam', f); }); };   /* 의상 계열이 설 수 있는 장소 종류(표 outfit_rules, 2026-11-13) */
    function placeOptions(n, g, req) {
      return places.filter(function (p) {
        if (g && p.group !== g) return false;
        if (has(takenGroups, p.group) || avoided(n, 'place', p.key) || avoided(n, 'group', p.group)) return false;
        return p.eras.some(function (e) { return !avoided(n, 'era', e) && famsAt(p, e, req).some(function (f) { return !avoided(n, 'ofam', f); }); });
      });
    }
    var placeScore = function (p) { return (placeUse[p.key] || 0) + 0.3 * crowd(o.look, 'group:' + p.group); };
    /* 일곱 장 — 자유 컷은 이 캐릭터가 아직 안 쓴 의상 계열을 고를 수 있는 장소에서(2026-11-07) */
    var newFamP = function (n, p) { return p.eras.some(function (e) { return !avoided(n, 'era', e) && famsAt(p, e).some(function (f) { return !has(takenFams, f) && !avoided(n, 'ofam', f); }); }); };
    function choose(n, p, req) {
      var eras = p.eras.filter(function (e) { return !avoided(n, 'era', e) && famsAt(p, e, req).length; });
      var era = pick(eras, eraScore, rand);
      var fams = famsAt(p, era, req).filter(function (f) { return !avoided(n, 'ofam', f); });
      var calm = fams.filter(function (f) { return !C2.awkward(t, f, p.key).length; });
      if (awkUsed || calm.length) fams = calm.length ? calm : fams;
      var f = req || pick(fams, function (k) { return (famUse[k] || 0) + famRepeat(takenFams, k, N); }, rand);
      if (C2.awkward(t, f, p.key).length) awkUsed = true;
      return { cut: n, treeV: 2, era: era, place: p.key, ofam: f };
    }
    reqSlots.forEach(function (n) {
      var fam = pick(RF.filter(function (f) { return !has(takenFams, f) && !avoided(n, 'ofam', f) && placeOptions(n, '', f).length; }), function (f) { return famUse[f] || 0; }, rand);
      var p = fam && pick(placeOptions(n, '', fam), placeScore, rand);
      if (!p) throw new Error('casual-plan v2: no place for a required outfit family (' + card + ' cut ' + n + ')');
      cuts[n] = choose(n, p, fam); takenGroups.push(p.group); takenFams.push(fam); takenEras.push(cuts[n].era);
    });
    if (gcSlot) {   /* 게임 코스프레 — 그 재단이 설 수 있는 장소(표 cosplay_required) */
      var gc2 = placeOptions(gcSlot, '', GC).filter(function (p) { return cosplayPlaceOk(tree, gcPick.cut, p.key); });
      var gl2 = gc2.filter(function (p) { return !cosSlot || placeOptions(cosSlot, '', COS).some(function (q) { return q.group !== p.group; }); });   /* 포켓몬 코스튬이 설 묶음을 남긴다 */
      var gp2 = pick(gl2.length ? gl2 : gc2, placeScore, rand);
      if (!gp2) throw new Error('casual-plan v2: no place for the game cosplay outfit family (' + card + ' cut ' + gcSlot + ')');
      cuts[gcSlot] = choose(gcSlot, gp2, GC); cuts[gcSlot].item = 'gc_' + gcPick.cut; cuts[gcSlot].cosplay = cosplayAgainAt(tree, o, gcPick, gp2.key, rand);
      takenGroups.push(gp2.group); takenFams.push(GC); takenEras.push(cuts[gcSlot].era);
    }
    if (cosSlot) {
      var cp = pick(placeOptions(cosSlot, '', COS), placeScore, rand);
      if (!cp) throw new Error('casual-plan v2: no place for the costume outfit family (' + card + ' cut ' + cosSlot + ')');
      cuts[cosSlot] = choose(cosSlot, cp, COS); takenGroups.push(cp.group); takenFams.push(COS); takenEras.push(cuts[cosSlot].era);
    }
    slots.filter(function (n) { return !has(reqSlots, n) && n !== cosSlot && n !== gcSlot; }).forEach(function (n, i) {
      var pool = uniq(places.map(function (p) { return p.group; })).filter(function (g) { return !has(takenGroups, g) && !avoided(n, 'group', g) && placeOptions(n, g).length; });
      if (N > LEGACY_CUTS) { var nf = pool.filter(function (g) { return placeOptions(n, g).some(function (p) { return newFamP(n, p); }); }); if (nf.length) pool = nf; }
      if (i === 0 && !refill) { var lowPool = pool.filter(function (k) { return has(low, k); }); if (lowPool.length) pool = lowPool; }
      /* 새 묶음 몫(2026-11-24 사용자 「포켓몬만 좀 더 자주 나오게 해줘」) — 장소가 다 새것인 묶음(놀이공원 · 탈 것 · 보드 · 하늘 …)은 가운데 값에서 시작해 240컷에 0번 나왔다.
         둘째 자유 칸은 FRESH_RATE 확률로 새 묶음에서만 고른다 — 한 묶음에 많아야 한 장이라 몰리지 않는다 */
      if (i === 1 && !refill) { var freshPool = pool.filter(function (k) { return has(freshGroups(tree), k); }); if (freshPool.length && rand() < FRESH_RATE) pool = freshPool; }
      var g = pick(pool, function (k) { return (groupUse[k] || 0) + 0.3 * crowd(o.look, 'group:' + k); }, rand);
      var gp = g ? placeOptions(n, g) : [];
      if (N > LEGACY_CUTS) { var np = gp.filter(function (p) { return newFamP(n, p); }); if (np.length) gp = np; }
      var p = pick(gp, placeScore, rand);
      if (!p) throw new Error('casual-plan v2: no place left (' + card + ' cut ' + n + ')');
      cuts[n] = choose(n, p); takenGroups.push(p.group); takenFams.push(cuts[n].ofam); takenEras.push(cuts[n].era);
    });
    why.low = low;

    /* 3. 옷 — plan 과 같은 규칙(하는 일 전용 옷은 버전2 에선 안 고른다 — 하는 일이 없다) */
    var garUse = recency(cmp.concat(base.slice(-EX_WINDOW)), function (c) { return c.garments || []; });
    var clsUse = recency(cmp.concat(base.slice(-EX_WINDOW)), function (c) { var it = c.item ? CT.item(tree, c.ofam, c.item) : null; return it && it.cls ? [c.ofam + ':' + it.cls] : []; });   /* 실루엣 갈래(2026-11-23) — 최근 캐릭터들이 쓴 수영복 · 란제리 갈래 */
    var keptGar = [];
    kept.forEach(function (c) { keptGar = keptGar.concat(c.garments || []); });
    var covered = keptGar.some(function (g) { return has(COVERING, g); }), special = {};
    tree.activities.forEach(function (a) { (a.prefer || []).forEach(function (k) { special[k] = 1; }); });
    var newGar = keptGar.some(function (g) { return !gar[g]; });
    /* 이 캐릭터가 이미 입힌 옷 종류 — 일곱 장이면 같은 옷(셔츠 + 반바지 …)이 여러 번 나왔다(2026-11-07 뮤츠 시험) */
    var charGar = keptGar.slice();
    var gOrder = gcSlot ? [gcSlot].concat(slots.filter(function (n) { return n !== gcSlot; })) : slots;   /* 게임 코스프레 컷은 재단이 옷을 정한다 — 먼저 */
    gOrder.forEach(function (n, i) {
      var c = cuts[n], last = i === gOrder.length - 1;
      if (n === gcSlot) { var gs = uniq(garmentsOf((CT.item(tree, c.ofam, c.item) || {}).en || '')).sort(); if (gs.some(function (g) { return has(COVERING, g); })) covered = true; if (gs.some(function (g) { return !gar[g]; })) newGar = true; c.garments = gs; charGar = charGar.concat(gs); return; }
      var score = function (g) { return (garUse[g] || 0) + (gar[g] ? 1.5 : 0) + 3 * count(charGar, g) + 0.3 * crowd(o.look, 'garment:' + g) - (last && !newGar && !gar[g] ? 10 : 0); };
      var items = CT.items(tree, c.ofam, '').filter(function (it) {
        var g = garmentsOf(it.en);
        return !avoided(n, 'item', it.key) && !special[it.key] && g.length && !g.some(function (x) { return claimed.garment[x] || (covered && has(COVERING, x)); });
      });
      var it = pick(items, function (x) { var g = garmentsOf(x.en); return g.reduce(function (tt, y) { return tt + score(y); }, 0) / g.length + (x.cls ? 2 * (clsUse[c.ofam + ':' + x.cls] || 0) : 0); }, rand), set;   /* 덜 쓴 실루엣 갈래 먼저(2026-11-23) */
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
      c.garments = set; charGar = charGar.concat(set);
    });

    chooseColors(S, tree, slots, cuts, kept, base.slice(-EX_WINDOW).concat(others), subject, avoided, rand, o.look);

    /* 4. 몸 쪽 — 그 장소 · 시대 · 의상에서 쓸 수 있는 자세 추천 + 칸마다 뽑은 장면 몇 개 가운데,
          세 장 서로 다른 프레이밍 · 몸 방향+머리 방향 · 추천, (몸+머리, 프레이밍) 짝은 비교 대상과 겹치지 않게, 한 장은 새 값, 장소/짓은 10명 안에서 안 겹치게 */
    var exprs = concrete(S.EXPRESSION_OPTIONS);
    var use = function (f) { return recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c[f]; }); };
    var U = { expr: use('expr'), orient: use('orient'), frame: use('frame'), pose: use('pose'), use: use('use') };
    /* 소품 단위로도 센다 — 동작만 세면 잔 · 컵 동작 넷이 돌아가며 나왔다(사용자 2026-10-30 「기본 소품이 컵 밖에 없다」). 마실 것 넷은 한 무리, 한 캐릭터에 한 장까지 */
    var propOf = function (c) { var u = c && c.use && C2.use(t, c.use); return u ? u.prop : null; };
    var isDrink = function (c) { return has(DRINKS, propOf(c)); };
    var Uprop = recency(base.slice(-EX_WINDOW).concat(others), propOf);
    var drinkUse = DRINKS.reduce(function (a, d) { return a + (Uprop[d] || 0); }, 0);
    var pairUse = recency(base, function (c) { return c.orient + '|' + c.frame; });
    /* 자세 · 몸 방향 · 카메라 높이 짝(2026-11-18 사용자 C) — 셋을 따로 세면 고르게 퍼져도 「서서 · 정면 · 눈높이」 짝이 몰렸다(서기 34% · 정면 쪽 63% · 눈높이 48%).
       짝의 최근 횟수만큼 덜고, 그 짝은 더 — 같은 묶음에 벌써 있으면 크게 */
    var comboOf = function (c) { return [c.posture || '', c.body || '', c.camera || ''].join('|'); };
    var sfe = function (c) { return c.posture === 'stand' && (c.body === 'front' || c.body === 'front_3q') && c.camera === 'eye'; };
    var comboUse = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.posture ? comboOf(c) : null; });
    var taken = { expr: kept.map(function (c) { return c.expr; }).filter(Boolean), orient: kept.map(function (c) { return c.orient; }), frame: kept.map(function (c) { return c.frame; }), pose: kept.map(function (c) { return c.pose; }).filter(Boolean),
      pair: kept.map(function (c) { return c.orient + '|' + c.frame; }) };
    var freshDone = kept.some(function (c) { return !orients[c.orient] || !frames[c.frame]; });
    /* 게임 코스프레 구성의 상황 한 장(2026-11-16 「늘 1장은 나오게」) — 일반 컷이 적어 얼굴 클로즈업만 남는 일이 잦았다: 옷이 상황에 맞는 일반 컷 하나를 미리 골라 그 컷엔 클로즈업을 안 준다 */
    var SITU_NF = S.SITU_NOT_FRAMES || ['face_close'], situSlot = null;
    if (gcMode && !kept.some(function (c) { return c.situ; })) {
      var sitPool = slots.filter(function (m) { return !has(reqSlots, m) && m !== cosSlot && m !== gcSlot && situsFor(S, situText(tree, cuts[m])).length; });
      if (sitPool.length) situSlot = sitPool[Math.floor(rand() * sitPool.length)];
    }
    slots.forEach(function (n, i) {
      var c = cuts[n], sc0 = { treeV: 2, era: c.era, place: c.place, ofam: c.ofam, item: c.item };
      var mustFresh = !refill && !freshDone && i === slots.length - 1;
      var cands = [];
      C2.presets(t, sc0, subject).forEach(function (p) { cands.push(C2.repair(t, C2.applyPreset(t, sc0, p.key), subject, function (l) { return l[Math.floor(rand() * l.length)]; })); });
      for (var k = 0; k < 8; k++) {
        var rc = C2.random(t, sc0, subject, rand, ['era', 'place', 'ofam', 'item'], { preset: false });
        /* 손 칸을 둘 다 비운 후보는 「자연스럽게」 로 채운다(2026-11-13 — 기록 1,891장 중 719장이 손 줄 없이 나갔다. 빈 채면 모델이 고르고 자세 · 소품 글과 부딪혔다) */
        if (!rc.right && !rc.left) rc = C2.repair(t, Object.assign({}, rc, { right: 'natural', left: 'natural' }), subject);
        cands.push(rc);
      }
      /* 소품을 쓰는 손이면 소품 동작 — 덜 쓴 것(역할 동작 · 동료 동작 포함) */
      cands = cands.map(function (x) {
        if (!C2.propSides(x)) return x;
        var us = C2.choices(t, x, 'use', subject).filter(function (u) { return !avoided(n, 'use', u); });
        var drinkTaken = kept.concat(slots.slice(0, i).map(function (m) { return cuts[m]; })).some(isDrink);
        var u = pick(us, function (k2) { var pp = C2.use(t, k2).prop, dr = has(DRINKS, pp);
          var uu = C2.use(t, k2);
          return (U.use[k2] || 0) + 0.7 * (Uprop[pp] || 0) + (dr ? 0.7 * drinkUse + (drinkTaken ? 5 : 0) : 0) - (uu.role ? 0.6 : 0) -
            (uu.stage ? 0.3 : uu.kind === 'hold' ? -0.3 : 0); }, rand);   /* 행동 단계(2026-11-18) — 준비 · 하는 중 · 마무리 동작은 먼저, 그냥 들고 있기는 뒤로 */
        return u ? C2.set(t, x, 'use', u, subject) : x;
      }).map(function (x) { return pathOf(tree, x); });
      var ok = function (x, step) {
        if (!x.frame || count(taken.frame, x.frame) >= LIM || avoided(n, 'frame', x.frame) || (step < 2 && claimed.frame[x.frame])) return false;
        if (n === gcSlot && has(GC_NF, x.frame)) return false;   /* 게임 코스프레 컷엔 얼굴 클로즈업 안 씀(코스튬이 안 보인다 — 표 cosplay_required.not_frames) */
        if (n === situSlot && has(SITU_NF, x.frame)) return false;   /* 상황을 얹을 일반 컷 — 클로즈업이면 상황이 안 보인다 */
        if (gcMode && has(SITU_NF, x.frame) && SITU_NF.some(function (f) { return count(taken.frame, f) >= 1; })) return false;   /* 게임 코스프레 구성은 일반 컷이 적어(상황 · 옷 자유 둘 · 갈래 자유가 다 클로즈업 아닌 컷) 얼굴 클로즈업은 한 장까지 */
        if (count(taken.orient, x.orient) >= LIM || has(taken.pair, x.orient + '|' + x.frame) || avoided(n, 'body', x.body) || avoided(n, 'posture', x.posture) || (step < 2 && claimed.orient[x.orient])) return false;
        if (x.pose && has(taken.pose, x.pose)) return false;
        if (C2.presetOnce && C2.presetOnce(t, x.preset) && kept.concat(slots.slice(0, i).map(function (m) { return cuts[m]; })).some(function (c) { return c && C2.presetOnce(t, c.preset); })) return false;
        /* 한 캐릭터 한 장까지(표 once_groups, 2026-11-25 — 몸짓 · 가슴 사이 물건 · 빵 물기 · 게임 · 운동 경기 · 수영 · 공기매트 · 워터파크 · 요가 · 조깅 · 놀이터 · 모래성) */
        if (onceOf(t, x).some(function (g) { return kept.concat(slots.slice(0, i).map(function (m) { return cuts[m]; })).some(function (c) { return onceOf(t, c).indexOf(g) >= 0; }); })) return false;
        /* 놀이터(장소 특징 k_kids) — 목선이 열린 옷(cleavage)은 안 쓴다 */
        if (has(C2.placeHas(t, x.place), 'k_kids') && has(C2.features(t, x.ofam, x.item), 'cleavage')) return false;   /* 두 손 모으기 · 무릎 꿇기 · 쉿은 한 캐릭터 한 장까지(표 preset_once, 2026-11-23) */
        if (usedPath[pathKey(x)] || avoided(n, 'use', x.use)) return false;
        if (step < 3 && isDrink(x) && kept.concat(slots.slice(0, i).map(function (m) { return cuts[m]; })).some(isDrink)) return false;
        if (step < 3 && pairs[x.orient + '|' + x.frame]) return false;
        if (step < 1 && mustFresh && orients[x.orient] && frames[x.frame]) return false;
        return true;
      };
      var pool = [], step;
      for (step = 0; step < 4 && !pool.length; step++) pool = cands.filter(function (x) { return ok(x, step); });
      if (step > 1) (why.relaxed = why.relaxed || []).push({ cut: n, step: step - 1 });
      var best = pick(pool, function (x) { return (U.orient[x.orient] || 0) + (U.frame[x.frame] || 0) + 2 * (count(taken.orient, x.orient) + count(taken.frame, x.frame)) + 0.5 * (pairUse[x.orient + '|' + x.frame] || 0) + (U.pose[x.pose] || 0) + (U.use[x.use] || 0) +
        0.5 * crowd(o.look, 'path:' + pathKey(x)) + 0.3 * crowd(o.look, 'pair:' + x.orient + '|' + x.frame) - (!orients[x.orient] || !frames[x.frame] ? 0.5 : 0) +
        ((C2.preset(t, x.preset) || {}).pose ? 0.8 : 0) + 0.8 * (comboUse[comboOf(x)] || 0) - ((C2.use(t, x.use) || {}).role ? 1.5 : 0) +   /* 직업 현장 역할 동작은 앞으로(2026-11-18 — 추천 · 단계 동작이 늘어 밀렸다) */
        (sfe(x) ? 1.5 + 2.5 * kept.concat(slots.slice(0, i).map(function (m) { return cuts[m]; })).filter(sfe).length : 0) + (x.posture === 'stand' ? 0.6 : 0) + (x.camera === 'eye' ? 0.3 : 0) + (C2.presetBias ? C2.presetBias(t, x.preset) : 0); }, rand);   /* 자세 추천 넓이(2026-11-23 공용 모듈 presetBias) — 어디서나 되는 추천은 뒤로, 드문 곳에서만 되는 추천은 앞으로 */   /* 카메라용 몸짓 추천(표의 pose — 쉿 · 브이 · 엄지 척 · 손 흔들기 …)은 뒤로(2026-11-13) */
      if (!best) throw new Error('casual-plan v2: no body / framing for ' + card + ' cut ' + n + ' (' + c.place + ')');
      V2_FIELDS.forEach(function (f) { if (f !== 'expr' && f !== 'ocolor' && f !== 'shade' && f !== 'expose' && f !== 'situ' && f !== 'ofree' && f !== 'sfree' && f !== 'xfree' && f !== 'cosplay' && f !== 'aspect') c[f] = best[f] || ''; });   /* 옷 색은 3b 에서(구체 색은 3c — 끝에), 상황은 4b 에서 */
      /* 표정 — 얼굴이 보이면 의상 계열에 어울리는 것, 세 장 서로 다르게 */
      var bd = (t.v2.body.filter(function (b) { return b.key === c.body; })[0]) || {}, hd = (t.v2.head.filter(function (h) { return h.key === c.head; })[0]) || {};
      var moods = EXPR_FOR[c.ofam] || WARM;
      var ex2 = exprPool(t, c, exprs);   /* 소품 동작 · 추천의 exprs(빵 물기 — 입을 벌리지 않는 표정, 몸짓 — 장난 · 당당 · 윙크, 2026-11-25) */
      c.expr = bd.face_hidden && !hd.look_back ? '' : pick(ex2.filter(function (v) { return !has(taken.expr, v) && !avoided(n, 'expr', v) && (has(moods, v) || ex2.length < exprs.length); }), function (v) { return U.expr[v] || 0; }, rand) || '';
      c.aspect = '2:3';
      if (c.expr) taken.expr.push(c.expr);
      if (best.pose) taken.pose.push(best.pose);
      taken.orient.push(best.orient); taken.frame.push(c.frame); taken.pair.push(best.orient + '|' + c.frame);
      if (!orients[best.orient] || !frames[c.frame]) freshDone = true;
    });

    /* 4b. 상황 노출(2026-11-09) — 아홉 장이면 한 장: 필수 셋 · 코스튬이 아닌 컷, 얼굴 클로즈업 아닌 컷, 그 옷에 맞는 상황. 최근에 덜 쓴 상황부터 */
    /* 2026-11-15 게임 코스프레 구성이면 상황 노출이 필수에서 내려왔다 — 2026-11-16 사용자 「늘 1장은 나오게 맞춰줘」: 자유 설계 칸을 정한 뒤 남은 일반 컷 하나에 늘(옛 구성은 그대로 먼저) */
    var situ2 = function (sl) { return chooseSitu(S, tree, N, sl || slots, cuts, kept, reqSlots, [cosSlot, gcSlot], base.slice(-EX_WINDOW).concat(others), avoided, rand, card, function (c, k) { return C2.situOk(t, c, (S.SITUATIONS || []).filter(function (x) { return x.key === k; })[0]); }); };
    var frees2 = function () { why.ofree = chooseOfree(S, N, slots, cuts, kept, reqSlots, [cosSlot, gcSlot], rand, card); why.xfree = chooseXfree(S, N, slots, cuts, kept, reqSlots, [cosSlot, gcSlot], rand, card); };
    if (!gcMode) { why.situ = situ2(); frees2(); }
    else {
      /* 미리 고른 일반 컷(situSlot — 클로즈업 아님 · 옷이 상황에 맞음)에 먼저 얹고, 자유 설계 칸은 나머지에서 */
      var pre = null; if (situSlot != null) { try { pre = situ2([situSlot]); } catch (e) { pre = null; } }
      if (pre) { cuts[situSlot].situ = pre.situ; frees2(); why.situ = pre; }
      else why.situ = situThenFrees(cuts, slots, situ2, frees2, true);
    }

    /* 4c. 빛 · 날씨 · 빛의 방향 · 화면 안 자리 · 배경 깊이 · 전경 · 카메라 높이(2026-11-13) — 전엔 이 칸들을 한 번도 안 채워 묶음의 빛이 한 가지였다.
       조건은 표 ambience 와 모듈 C2.ambience(시간대는 하늘 · 창이 있는 곳, 등불은 실내, 밤 고정 장소는 밤 시간대만 …). 묶음 안에서 덜 쓴 값부터 */
    (function () {
      var AMB = ['time', 'weather', 'light', 'spot', 'depth', 'view'], used = {};
      /* 전체 기록 비율(2026-11-18 사용자 A) — 다른 캐릭터들 컷에서 센 횟수를 0 ~ 1 로(가장 많이 쓴 값이 1). 묶음 안 횟수 다음으로 본다 */
      var global = {};
      ['time', 'weather', 'light'].forEach(function (k) {
        var m = {}; base.forEach(function (e) { (e.cuts || []).forEach(function (c) { if (c[k]) m[c[k]] = (m[c[k]] || 0) + 1; }); });
        var top = Math.max.apply(null, [1].concat(Object.keys(m).map(function (x) { return m[x]; })));
        global[k] = {}; Object.keys(m).forEach(function (x) { global[k][x] = m[x] / top; });
      });
      var note = function (c) { AMB.concat(['camera']).forEach(function (k) { if (c[k]) { used[k] = used[k] || {}; used[k][c[k]] = (used[k][c[k]] || 0) + 1; } }); };
      kept.forEach(function (c) { if (c && c.treeV === 2) note(c); });
      slots.forEach(function (n) {
        var c = cuts[n], a = C2.ambience(t, c, rand, { used: used, global: global, hairs: [] });
        AMB.forEach(function (k) { c[k] = a[k] || ''; });
        if (a.camera) c.camera = a.camera;
        if (c.situ === 'sheer_light') { c.light = 'back'; if (has(['night', 'neon', 'lamplight'], c.time)) c.time = ''; if (c.weather === 'night_snow') c.weather = ''; }   /* 역광 실루엣 상황은 빛이 뒤에서 */
        note(c);
      });
      /* 고개 · 몸 좌우(2026-11-20 — 공용 모듈 spreadTurns): 한 묶음 안에서 정면 · 왼쪽 · 오른쪽을 덜 쓴 쪽으로. 자유 설계 칸은 맡은 쪽이 짓는다 */
      if (C2.spreadTurns) C2.spreadTurns(t, slots.map(function (n) { return cuts[n]; }).filter(function (c) { return c && !c.sfree && !c.xfree; }), rand, kept);
      /* 옷 꾸밈(2026-11-23 — 공용 모듈 spreadStyles, 사용자 「1,3,4,5,6번까지해서 공통으로 해줘」): 소재 · 입은 모양 · 핏 · 겹쳐 입기 · 장신구를 묶음 안에서 덜 쓴 것부터. 코스프레 · 자유 설계 · 직접 쓴 옷 글은 모듈이 뺀다. 두꺼운 겉옷 · 장갑은 눈 · 겨울일 때만 */
      if (C2.spreadStyles) C2.spreadStyles(t, slots.map(function (n) { return cuts[n]; }).filter(function (c) { return c && !c.sfree && !c.xfree; }), rand, kept, { cold: function (sc) { return /snow|winter|cold|frost|freez/.test([sc.season, sc.weather, sc.cityWeather].join(' ')); } });
    })();

    /* 4d. 순간(2026-11-18 사용자 D — 「목욕거품을 머리위에 올리거나 몸에 붙어있다는 등」) — 노출과 상관없는 작은 사건 하나(표 moments). 일반 컷 몇 장에만
       (자유 설계 · 상황 노출 · 코스튬 · 게임 코스프레 컷은 빼고 — 한 컷에 작은 사건은 하나), 다른 캐릭터 기록 + 묶음에서 덜 쓴 것. 장면 · 시간대 · 날씨가 정해진 뒤 */
    (function () {
      var MAX = 3, RATE = 0.4, g = recency(base.slice(-EX_WINDOW).concat(others), function (c) { return c.moment || null; }), here = {};
      kept.forEach(function (c) { if (c && c.moment) here[c.moment] = (here[c.moment] || 0) + 1; });
      var n = slots.filter(function (m) { return cuts[m].moment; }).length;
      slots.forEach(function (m) {
        var c = cuts[m];
        if (n >= MAX || c.moment || c.ofree || c.sfree || c.xfree || c.situ || c.cosplay || c.ofam === 'pokemon_costume' || rand() >= RATE) return;
        var list = C2.moments ? C2.moments(t, c) : []; if (!list.length) return;
        var sc = function (k) { return 3 * (here[k] || 0) + (g[k] || 0); }, min = Math.min.apply(null, list.map(sc));
        var pool = list.filter(function (k) { return sc(k) - min < 1; });
        c.moment = pool[Math.floor(rand() * pool.length)]; here[c.moment] = (here[c.moment] || 0) + 1; n++;
      });
    })();

    /* 5. 세부 강도 세 축 — 액션 비중은 몸 자세에서, 분리형은 옷에서, SOURCE 영향도는 plan 과 같은 규칙 */
    slots.forEach(function (n) {
      var c = cuts[n], po = C2.posture(t, c.posture) || {}, u = C2.use(t, c.use);
      var sport = (C2.preset(t, c.preset) || {}).act === 'sport' || has(SPORT_USES(t), c.use) || has(SPORT_POSTURES, c.posture);   /* 운동 · 놀이(2026-11-25 사용자 「이제는 신경안쓰려고」 — 활동 장면의 그림 오류를 받아들인다): 움직이는 컷은 mostly active */
      c.axes = { action_level: po.family === 'walk' || sport ? 'mostly active' : (po.family === 'low' || has(['lean_counter', 'sit_lean', 'lean_rail', 'lean_wall'], c.posture) || (u && u.hands === 'both')) ? 'balanced' : 'mostly posed',
        separates_preference: c.garments.some(function (g) { return has(ONE_PIECE, g); }) && !c.garments.some(function (g) { return has(BOTTOMS, g); }) ? 'balanced' : 'prefer separates' };
    });
    var srcCombos = srcCombosFor(N), CN = nums(N), SAME = sameAxesLimit(N);
    var keptSrc = {};
    kept.forEach(function (c) { keptSrc[c.cut] = (c.axes || {}).source_influence; });
    var srcUse = recency(base.slice(-EX_WINDOW), function (c) { return (c.axes || {}).source_influence; });
    var okSrc = srcCombos.filter(function (x) {
      var full = CN.map(function (n, i) { return keptSrc[n] || x[i]; });
      if (kept.some(function (c) { return keptSrc[c.cut] && x[c.cut - 1] !== keptSrc[c.cut]; })) return false;
      if (uniq(full).length === 1) return false;
      if (refill) return true;
      var sorted = full.slice().sort().join();
      return !cmp.some(function (e) {
        if (e.cuts.length === N && e.cuts.map(function (c) { return (c.axes || {}).source_influence; }).sort().join() === sorted) return true;
        var same = CN.filter(function (n, i) {
          var c = cuts[n] || kept.filter(function (k) { return k.cut === n; })[0], ax = c && c.axes ? { action_level: c.axes.action_level, source_influence: full[i], separates_preference: c.axes.separates_preference } : null;
          return ax && e.cuts.some(function (y) { var z = y.axes || {}; return z.action_level === ax.action_level && z.source_influence === ax.source_influence && z.separates_preference === ax.separates_preference; });
        }).length;
        return same >= SAME;
      });
    });
    if (!okSrc.length && (o._tries || 0) >= 20) {
      okSrc = srcCombos.filter(function (x) { return uniq(CN.map(function (n, i) { return keptSrc[n] || x[i]; })).length > 1; });
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
    var takenExpose = [], leads = LEAD.slice(), charPairs = {};
    slots.forEach(function (n) {
      var c = cuts[n], kindList = EXPOSE_FOR[exposeKind(c.garments)], list = kindList.filter(function (x) { return !has(takenExpose, x); }), first, second;
      /* 일곱 장이면 그 옷 종류의 드러내기가 다 돈다 — 다시 처음부터, 이 캐릭터에 덜 쓴 것부터 · 같은 짝은 한 캐릭터에 한 번(2026-11-07 가디 일곱 장 중 넷이 「트인 등 + 원숄더」) */
      if (list.length < 2) list = kindList.slice();
      var exScore = function (x) { return 10 * count(takenExpose, x) + (exposeUse[x] || 0); };
      /* 첫째는 깊게 파인 목선(그 옷 종류에 있으면), 둘째는 목선이 아닌 것 */
      var necks = list.filter(function (x) { return has(NECKLINE, x); });
      if (!necks.length) necks = kindList.filter(function (x) { return has(NECKLINE, x); });
      first = pick(necks.length ? necks : list, exScore, rand);
      var ok2 = list.filter(function (x) { return x !== first && !charPairs[[first, x].sort().join('+')]; });
      var notNeck = ok2.filter(function (x) { return !has(NECKLINE, x); });
      if (notNeck.length) ok2 = notNeck;
      second = pick(ok2.filter(function (x) { return !usedPairs[[first, x].sort().join('+')]; }), exScore, rand) || pick(ok2, exScore, rand) || list.filter(function (x) { return x !== first; })[0];
      c.expose = [first, second];
      charPairs[[first, second].sort().join('+')] = 1;
      takenExpose.push(first, second);
      if (!leads.length) leads = LEAD.slice();
      c.lead = leads.splice(Math.floor(rand() * leads.length), 1)[0];
    });
    /* 3c. 구체 색 — 다른 칸을 다 정한 뒤(옷 자유 · 갈래 자유가 옷 색을 비운 뒤), 따로 씨앗 */
    chooseShades(S, tree, slots, cuts, kept, subject, (o.shade || {}).used, o.batch, avoided, rng('shade|' + (o.seed != null ? o.seed : card)));
    /* 화면비(2026-11-23 사용자 「배경이 보이니까 더 시원하네」 → 「다른 공방도 조금씩 해보자」) — 자유 설계 칸까지 정한 뒤 공용 모듈 aspectFor(표 aspect_rules):
       눕는 자세 · 환경 컷 3:2, 허리 위 · 3/4 1:1, 나머지 · 자유 설계 칸(ofree · sfree · xfree) · 게임 코스프레 2:3. 남겨 둔 컷(kept — 그린 것)은 그대로 */
    slots.forEach(function (n) { cuts[n].aspect = C2.aspectFor ? C2.aspectFor(t, cuts[n]) : '2:3'; });
    var out = nums(N).map(function (n) {
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
  var SCENE_FIELDS = ['era', 'place', 'act', 'ofam', 'item', 'ocolor', 'shade', 'expose', 'situ', 'ofree', 'sfree', 'xfree', 'expr', 'pose', 'orient', 'frame', 'lens', 'cosplay'];
  function generatorQuery(card, cut) {
    var v = {}, k;
    /* 버전2 컷은 버전2 칸 그대로(treeV 2) — 생성기(lib/prompt-state.js planned)가 버전2 로 채우고 잠근다 */
    if (cut.treeV === 2) {
      v.treeV = 2;
      V2_FIELDS.forEach(function (f) { if (cut[f]) v[f] = cut[f]; });
      if (cut.own) v.own = cut.own;
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
      ocolor: function () { return (S.OUTFIT_COLORS || []).some(function (c) { return c.key === v.ocolor; }); },
      shade: function () { return shadesOf(S, scene.ocolor).some(function (c) { return c.key === v.shade; }); },   /* 그 묶음의 구체 색만(2026-11-16) */
      situ: function () { return (S.SITUATIONS || []).some(function (c) { return c.key === v.situ; }); },
      expose: function () { return Array.isArray(v.expose) && v.expose.length <= 2 && v.expose.every(function (x) { return has(EXPOSE, x); }); },
      lens: function () { return has(concrete(S.LENS_OPTIONS), v.lens) && CT.lensOk(tree, scene.frame, v.lens); },
      pose: function () { return has(CT.poses(tree, scene.act, scene.frame), v.pose); },
      orient: function () { return has(CT.orients(tree, scene.act, scene.frame, S.CLOSE_FRAMES, scene.pose), v.orient); },
      expr: function () { return has(concrete(S.EXPRESSION_OPTIONS), v.expr) && CT.exprOk(tree, Object.assign({}, scene, { orient: v.orient })); }
    };
    var opt = { item: 1, pose: 1, expr: 1, ocolor: 1, shade: 1, expose: 1, situ: 1 };   /* 비어 와도 되는 칸(옷 자동 · 하는 일대로 · 표정 없음 · 옷 색 없음) */
    ['era', 'place', 'act', 'ofam', 'frame', 'item', 'ocolor', 'shade', 'expose', 'situ', 'lens', 'pose', 'orient', 'expr'].forEach(function (k) {
      if (opt[k] && !v[k]) { scene[k] = ''; locks[k] = true; return; }
      if (v[k] && ok[k]()) { scene[k] = v[k]; locks[k] = true; } else { scene[k] = ''; bad.push(k); }
    });
    /* 게임 코스프레(2026-11-15) — 게임 · 캐릭터 · 재단. 목록에 맞는지는 생성기 상태(lib/prompt-state.js)가 목록으로 본다 */
    if (v.cosplay && typeof v.cosplay === 'object' && !Array.isArray(v.cosplay)) { scene.cosplay = v.cosplay; locks.cosplay = true; }
    if (has(['2:3', '3:2', '1:1', '9:16', '16:9'], v.aspect)) { scene.aspect = v.aspect; locks.aspect = true; }
    for (k in (v.axes || {})) if (S.ADVANCED_OPTIONS[k] && has(S.LOCAL_AXES, k) && has(S.ADVANCED_OPTIONS[k], v.axes[k]) && v.axes[k] !== 'AUTO') { axes[k] = v.axes[k]; locks['axes.' + k] = true; }
    scene.axes = axes;
    return { scene: scene, locks: locks, bad: bad };
  }

  /* 캐릭터만의 컷(2026-11-13) — 표 data/casual-own.json(o.own). 일상 열 장에 더해 한 장(번호 OWN.number 90 — 장부 · 묶음 규칙에는 안 센다). 내용이 없는 캐릭터는 null.
     장면 글은 하나, 의상 줄만 노출 단계(level — bold · moderate · low)로. 손 · 구도는 표의 자세 추천을 트리로 풀어 쓴다. o = { S, tree, tree2, subject, own, card, level, rand } */
  function ownRow(OWN, card, world) { var w = (((OWN || {}).cards || {})[card] || {}).worlds || {}; return w.all || w[world || ''] || null; }
  /* 표에서 오는 글 칸 — 장소 글 · 장면 글 · 그 단계의 의상 글 · 도구(prop → 「그 물건」 소품 자리 prop '0' + ownProp). 계획기 · 지시문 묶음 · 생성기(lib/prompt-state.js plannedV2)가
     같이 쓴다 — 생성기 주소로는 own 과 단계만 넘기고 글은 여기서 다시 읽는다(주소로 임의 글을 받지 않게). 내용이 없으면 null, 그 단계의 의상 글이 없으면 오류(다른 단계 글로 조용히 바꾸지 않는다) */
  function ownFields(OWN, card, level, world) {
    var row = ownRow(OWN, card, world), levels = (OWN || {}).levels || ['bold', 'moderate', 'low'];
    if (!row) return null;
    level = level || levels[0];
    if (!has(levels, level) || !(row.outfit || {})[level]) throw new Error('casual-plan own: ' + card + ' — no outfit text for exposure level ' + level + ' in the table (' + levels.join(' / ') + ')');
    var f = { own: 'all', placeText: row.place, scene: row.activity, outfit: row.outfit[level], level: level, job_ko: row.job_ko };
    if (row.prop) { f.prop = '0'; f.ownProp = row.prop; }
    return f;
  }
  /* o = { tree, tree2, subject, own(표), card, level, seed 또는 rand } — 같은 seed 면 단계를 내려도 의상 줄만 바뀐다(빛 · 화면 자리는 그대로).
     직업의 도구(row.prop)는 「그 물건」 소품(signature) 자리로 들고 row.use(sig_hold · sig_raise · sig_both · sig_low)가 드는 동작. prop 없이 use 만 있으면 트리 소품 동작.
     자세 추천 · 소품 동작이 바탕 장소에서 안 되면 조용히 바꾸지 않고 오류 — 표를 고친다 */
  function ownCutV2(o) {
    var C2 = tree2_(), OWN = o.own || {}, row = ownRow(OWN, o.card, o.world), f = ownFields(OWN, o.card, o.level, o.world);
    if (!row) return null;
    var fail = function (m) { throw new Error('casual-plan own: ' + o.card + ' — ' + m + ' (fix base / preset / use / prop in data/casual-own.json)'); };
    if (row.prop && !row.use) fail('prop without use — add how she holds the tool (sig_hold / sig_raise / sig_both / sig_low)');
    var t = C2.make(o.tree2, o.tree), rand = o.rand || (o.seed != null ? rng('own|' + o.seed) : Math.random), first = function (l) { return l[0]; };
    var pre = C2.preset(t, row.preset), sc = { treeV: 2, era: row.era || (C2.place(t, row.base) || { eras: [] }).eras[0], place: row.base, ofam: row.ofam || 'everyday' };
    if (!pre) fail('preset ' + row.preset + ' is not in the tree');
    if (f.ownProp) { sc.prop = f.prop; sc.ownProp = f.ownProp; }
    sc = C2.repair(t, C2.applyPreset(t, sc, row.preset), o.subject, first);
    if (sc.place !== row.base) fail('base place ' + row.base + ' is not in the tree or not open to this card');
    if (sc.posture !== pre.posture) fail('preset ' + row.preset + ' does not fit base place ' + row.base);
    if (row.use) { sc = C2.set(t, sc, 'use', row.use, o.subject, first); if (sc.use !== row.use || sc.posture !== pre.posture) fail('use ' + row.use + ' does not fit preset ' + row.preset + ' @ ' + row.base + ' — the preset needs a prop hand (one for a one-hand use, both for sig_both)'); }
    var a = C2.ambience(t, sc, rand, { hairs: [] }); ['time', 'weather', 'light', 'spot', 'depth', 'view'].forEach(function (k) { if (a[k]) sc[k] = a[k]; });
    delete f.level;
    return Object.assign(sc, f, { cut: OWN.number || 90, preset: row.preset, axes: { overall_intensity: 'strong', skin_exposure: o.level || (OWN.levels || ['bold'])[0] }, aspect: C2.aspectFor ? C2.aspectFor(t, sc) : '2:3' });   /* 화면비 — 장면대로(2026-11-23) */
  }
  var api = { ownCutV2: ownCutV2, ownRow: ownRow, ownFields: ownFields, plan: plan, planV2: planV2, V2_FIELDS: V2_FIELDS, jitOf: jitOf, generatorQuery: generatorQuery, fromQuery: fromQuery, garmentsOf: garmentsOf, poseFits: poseFits, orientFits: orientFits, pathOf: pathOf, pathKey: pathKey,
    isRequired: isRequired, paths: paths, CUTS: CUTS, NINE_CUTS: NINE_CUTS, TEN_SINCE: TEN_SINCE, MID_CUTS: MID_CUTS, OFREE_N: OFREE_N, LEGACY_CUTS: LEGACY_CUTS, NINE_SINCE: NINE_SINCE, refillCount: refillCount, situsFor: situsFor, outfitText: outfitText, cutCount: cutCount, repeatLimit: repeatLimit, sameAxesLimit: sameAxesLimit, GARMENTS: GARMENTS, EXPOSE: EXPOSE, NECKLINE: NECKLINE, LEAD: LEAD,
    shadesOf: shadesOf, hairHue: hairHue, hueOfText: hueOfText, chooseShades: chooseShades, shadeUsed: shadeUsed,
    REQUIRED: REQUIRED, costumeFam: costumeFam, cosplayFam: cosplayFam, cosplayPlaceOk: cosplayPlaceOk, recosplayCuts: recosplayCuts, isPickCut: isPickCut, COVERING: COVERING, EX_WINDOW: EX_WINDOW, CMP_WINDOW: CMP_WINDOW, CMP_RESERVED: CMP_RESERVED, SMALL_GROUP: SMALL_GROUP, GROUP_LOW: GROUP_LOW };
  root.AtelierCasualPlan = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
