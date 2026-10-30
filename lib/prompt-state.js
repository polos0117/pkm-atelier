/* 생성기 상태 — 저장값의 꼴·바로잡기·일상컷 계획기 값 받기·조립부 입력(2026-10-29, lib/prompt-ui.js 에서 떼어 냈다).
   생성기 화면(lib/prompt-ui.js)과 지시문 파일 도구(tools/prompt-pack.cjs)가 같이 쓴다 — 브라우저를 안 띄워도
   화면이 만들 저장값(ui.json 의 storage)과 지시문이 글자 하나 다르지 않게(사용자 「파일로 정리해서 읽게 하는게 더 좋을거 같아」).
   브라우저(window.AtelierPromptState)와 node(module.exports) 둘 다. 표·모듈은 인자로 받는다:
     S  lib/prompt-spec.js(AtelierSpec) · CT lib/casual-tree.js · CP lib/casual-plan.js · P lib/prompt-anthro.js · L lib/prompt-lifestyle.js
     v2 = { C2: lib/casual-tree-v2.js, tree2: data/casual-tree-v2.json } — 주면 새 일상 장면 · 버전2 기록은 버전2(docs/CASUAL_TREE_V2.md, 2026-10-30).
     안 주면(지시문 묶음의 버전1 계획 컷) 버전1 그대로. 버전1 기록(하는 일 · 자세 · 방향 · 갈래)은 v2 를 줘도 버전1 로 연다 */
(function (root) {
  'use strict';
  var MODES = ['action', 'casual'], FORMS = ['light', 'heavy', 'mobility', 'overdrive'];
  /* 일상컷 고정값 — IMAGE_RULES 3절(전체 강도 가장 강함 · 피부 노출 많이 · 화면 비율 2:3). 처음부터 잠근다(game 생성기와 같게, 2026-10-29).
     잠금은 장면 랜덤만 막고 손으로 바꾸는 것은 막지 않는다. 저장된 상태를 불러올 때도 비었으면 다시 채우고 잠근다 */
  var CASUAL_FIXED = { axes: { overall_intensity: 'strong', skin_exposure: 'bold' }, aspect: '2:3' };
  var CASUAL_FIXED_LOCKS = ['axes.overall_intensity', 'axes.skin_exposure', 'aspect'];
  function object(x) { return x && typeof x === 'object' && !Array.isArray(x) ? x : {}; }
  function blankScene() {
    return { expr: '', pose: '', orient: '', scene: '', outfit: '', frame: '', lens: '', camera: '', custom: '', aspect: '2:3',
      cat: 'everyday_basic', catCustom: '', ex: '', exCustom: '', axes: {}, action: {}, randomLocks: {} };
  }
  /* 버전2 새 장면 — 버전1 칸(갈래 · 예시 · 하는 일 · 자세 · 방향 · 렌즈 · 자유 카메라 글) 없이. camera 는 카메라 높이 열쇠다 */
  function blankV2() { return { treeV: 2, expr: '', scene: '', outfit: '', custom: '', aspect: '2:3', axes: {}, action: {}, randomLocks: {} }; }
  function isV2(sc) { return !!sc && sc.treeV === 2; }
  function useV2(v2) { return !!(v2 && v2.C2 && v2.tree2); }
  function t2Of(v2, tree) { return v2.C2.make(v2.tree2, tree); }
  function fixCasual(sc) {
    var axes = Object.assign({}, sc.axes), randomLocks = Object.assign({}, sc.randomLocks);
    Object.keys(CASUAL_FIXED.axes).forEach(function (k) { if (!axes[k] || axes[k] === 'AUTO') axes[k] = CASUAL_FIXED.axes[k]; });
    CASUAL_FIXED_LOCKS.forEach(function (k) { randomLocks[k] = true; });
    return Object.assign({}, sc, { axes: axes, aspect: sc.aspect || CASUAL_FIXED.aspect, randomLocks: randomLocks });
  }
  function defaults(S) {
    return { style: S.DEFAULT_STYLE, identityMode: 'create', form: 'light', baseForm: 'light',
      motifs: '', formOverride: '', headFeature: '', faceDesignOn: true, params: {}, locks: {}, mode: 'action',
      scenes: { action: blankScene(), casual: fixCasual(blankScene()) } };
  }
  function normalizeAction(S, raw) {
    var x = object(raw), category = S.ACTION_CATEGORIES.filter(function (r) { return r.key === x.category; })[0], out;
    out = { category: category ? category.key : '', example: category && category.examples.some(function (r) { return r.key === x.example; }) ? x.example : '' };
    S.ACTION_CONTROLS.forEach(function (control) { out[control.key] = control.options.some(function (r) { return r.key === x[control.key]; }) ? x[control.key] : ''; });
    return out;
  }
  /* 저장값을 지금 표에 맞춘다 — 없는 화풍·폼·갈래는 기본으로, 장면은 빈 장면 위에 */
  function normalize(S, CT, input, tree, v2) {
    var d = defaults(S), x = object(input);
    var out = Object.assign({}, d, x, { params: object(x.params), locks: object(x.locks), scenes: {} });
    delete out.featureInsets;
    if (!S.ACTION_STYLE_CORES[out.style]) out.style = d.style;
    /* 폼 초상(기준 시트)은 없어졌다 — 옛 저장값은 액션으로 */
    if (MODES.indexOf(out.mode) < 0) out.mode = d.mode;
    if (FORMS.indexOf(out.form) < 0) out.form = d.form;
    if (['create', 'reference'].indexOf(out.identityMode) < 0) out.identityMode = 'create';
    if (['reference', 'light', 'heavy', 'mobility'].indexOf(out.baseForm) < 0) out.baseForm = 'light';
    ['motifs', 'formOverride', 'headFeature'].forEach(function (k) { if (typeof out[k] !== 'string') out[k] = ''; });
    if (typeof out.faceDesignOn !== 'boolean') out.faceDesignOn = true;
    MODES.forEach(function (mode) {
      var sc = Object.assign(blankScene(), object(object(x.scenes)[mode])), locks = object(sc.randomLocks), kept = {};
      sc.axes = object(sc.axes);
      sc.action = normalizeAction(S, sc.action);
      Object.keys(locks).forEach(function (k) { if (locks[k] === true) kept[k] = true; });
      sc.randomLocks = kept;
      out.scenes[mode] = sc;
    });
    /* 일상컷은 트리 길 — 예전 저장값의 갈래·예시는 변환표로 옮긴다(lib/casual-tree.js). 카드마다 맞추기(첫 등장 해 등)는 initial 이 */
    var was = object(object(x.scenes).casual);
    if (useV2(v2) && (isV2(was) || !v2.C2.isV1(was)))
      out.scenes.casual = fixCasual(Object.assign(blankV2(), was, { treeV: 2, axes: object(was.axes), action: {}, randomLocks: out.scenes.casual.randomLocks }));
    else out.scenes.casual = fixCasual(CT.fromLegacy(tree, out.scenes.casual));
    return out;
  }
  /* 일상컷 계획기(tools/casual-plan.cjs)의 값 — 채우고 모두 잠근다. 장면·의상 칸은 새 컷이라 비운다.
     raw 는 주소의 casual= 글(JSON). 돌려주는 것 {st, n(잠근 칸 수), bad(트리에 안 맞아 비운 칸)} 또는 null */
  function planned(S, CP, st, raw, tree, card, v2) {
    /* 버전2 계획기(--v2)의 주소 — 버전2 칸 그대로 잠근다 */
    var v; try { v = raw ? JSON.parse(raw) : null; } catch (e) { v = null; }
    if (v && v.treeV === 2) return useV2(v2) && card ? plannedV2(S, st, v, tree, card, v2) : null;
    var got = raw && CP ? CP.fromQuery(S, raw, tree) : null;
    if (!got) return null;
    /* 계획기 값은 버전1 칸이다(계획기 --v2 전까지) — 버전2 새 장면 위에 얹지 않고 버전1 빈 장면 위에 */
    var prev = isV2(st.scenes.casual) ? fixCasual(blankScene()) : st.scenes.casual;
    var scene = Object.assign({}, prev, got.scene, { scene: '', outfit: '', camera: '', custom: '', preset: '', action: prev.action,
      axes: Object.assign({}, got.scene.axes), randomLocks: got.locks });
    return { st: Object.assign({}, st, { mode: 'casual', scenes: Object.assign({}, st.scenes, { casual: scene }) }), n: Object.keys(got.locks).length, bad: got.bad };
  }
  /* 화면이 카드를 열 때의 상태 — 저장값 바로잡기 → 일상컷을 그 카드에 맞추기(세대의 해) → 계획기 값(있으면) */
  function initial(S, CT, CP, saved, tree, card, raw, v2) {
    var s = normalize(S, CT, saved, tree, v2), subj = { gen: card.gen }, sc = s.scenes.casual;
    sc = isV2(sc) && useV2(v2) ? v2.C2.repair(t2Of(v2, tree), sc, subj) : CT.repair(tree, sc, subj, S.CLOSE_FRAMES);
    s = Object.assign({}, s, { scenes: Object.assign({}, s.scenes, { casual: sc }) });
    var p = planned(S, CP, s, raw, tree, card, v2);
    return { st: p ? p.st : s, plan: p ? { n: p.n, bad: p.bad } : null };
  }
  /* 버전2 계획 컷(계획기 --v2 의 cut — 버전2 칸 그대로) — 채우고 모두 잠근다. 장면 · 의상 · 추가 연출은 새 컷이라 비운다.
     돌려주는 것 {st, n, bad(다시 검사가 고친 칸 — 표에 안 맞는 계획)} */
  var PLAN_V2 = ['era', 'place', 'weather', 'ofam', 'item', 'posture', 'support', 'frame', 'body', 'head', 'camera', 'right', 'left', 'use', 'legs', 'gaze', 'expr', 'preset', 'ofeat'];
  function plannedV2(S, st, cut, tree, card, v2) {
    if (!cut || !useV2(v2)) return null;
    var scene = blankV2(), locks = {};
    PLAN_V2.forEach(function (k) { if (cut[k] !== undefined && cut[k] !== '') { scene[k] = cut[k]; if (k !== 'preset' && k !== 'ofeat') locks[k] = true; } });
    scene.axes = Object.assign({}, object(cut.axes));
    Object.keys(scene.axes).forEach(function (k) { locks['axes.' + k] = true; });
    if (cut.aspect) scene.aspect = cut.aspect;
    locks.aspect = true;
    scene.randomLocks = locks;
    var fixed = v2.C2.repair(t2Of(v2, tree), fixCasual(scene), { gen: card.gen });
    var bad = PLAN_V2.filter(function (k) { return k !== 'preset' && k !== 'ofeat' && (scene[k] || '') !== (fixed[k] || ''); });
    return { st: Object.assign({}, st, { mode: 'casual', scenes: Object.assign({}, st.scenes, { casual: fixed }) }), n: Object.keys(locks).length, bad: bad };
  }
  /* 첨부 그림이 인물을 정하는가 — 일상컷·폭주는 늘, 액션은 「확정한 이미지 이어가기」 일 때 */
  function reference(st) { return st.mode === 'casual' || (st.mode === 'action' && st.form === 'overdrive') || st.identityMode === 'reference'; }
  /* 조립부 입력 — 생성기 화면의 result 와 같다 */
  function input(st, card, appearance, face, tree, tree2) {
    var mode = st.mode, params = Object.keys(st.params).map(function (k) { return [k, st.params[k]]; });
    return Object.assign({}, st, st.scenes[mode], { mech: card.name, sourceName: card.en, sourceAppearance: appearance, faceDesign: face, tree: tree, tree2: tree2 || null, gen: card.gen,
      series: [card.element, card.element2].filter(Boolean).join(' / '),
      outputMode: mode, identityMode: reference(st) ? 'reference' : 'create', params: params });
  }
  function prompt(P, L, st, card, appearance, face, tree, tree2) {
    var x = input(st, card, appearance, face, tree, tree2);
    return st.mode === 'casual' ? L.buildSingle(x) : P.buildPrompt(x);
  }
  var api = { MODES: MODES, FORMS: FORMS, CASUAL_FIXED: CASUAL_FIXED, CASUAL_FIXED_LOCKS: CASUAL_FIXED_LOCKS, object: object, blankScene: blankScene, fixCasual: fixCasual,
    defaults: defaults, normalizeAction: normalizeAction, normalize: normalize, planned: planned, plannedV2: plannedV2, PLAN_V2: PLAN_V2, initial: initial, blankV2: blankV2, isV2: isV2, reference: reference, input: input, prompt: prompt };
  root.AtelierPromptState = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
