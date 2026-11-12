/* 일상컷 버전2 지시문(lib/prompt-anthro.js — treeV 2 + 표 tree2). node tests/prompt-casual-v2.cjs
   - 자세 추천 × 쓸 수 있는 장소마다, 랜덤 장면(카드 세대 · 표정 · 세부 강도)마다: 하는 일 · HAND TASK 줄 없음, POSTURE · COMPOSITION · 렌즈,
     손 줄은 본인 기준, 한글 없음, 낱말 상한
   - pkm 몫: 직업 역할 동작이면 Role 줄, 동료 묶음이면 동료 줄 · 한 마리 줄(아니면 「한 명만」), 첫 등장 무렵의 해, 포켓몬 세계
   - 버전1 기록(treeV 없음)은 버전2 표가 와도 버전1 지시문 그대로 */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {} }; vm.createContext(ctx);
for (const name of ['prompt-spec', 'casual-tree', 'casual-tree-v2', 'prompt-anthro', 'prompt-lifestyle']) vm.runInContext(fs.readFileSync('lib/' + name + '.js', 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L, AtelierCasualTreeV2: C } = ctx.window;
const tree = JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8')), tree2 = JSON.parse(fs.readFileSync('data/casual-tree-v2.json', 'utf8'));
const t = C.make(tree2, tree), T = S.PROMPT_LINES;
const cards = Object.values(JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards).flat();
const base = { mech: 'Pikachu', series: 'Electric', style: S.DEFAULT_STYLE, tree, tree2, gen: 1, treeV: 2 };
const block = (s, k) => (s.split(k + ' (chosen):\n')[1] || '').split('\n\n')[0];
const LIMIT = 1400;   /* 2026-11-11 1200 → 1400(사용자 「상한을 늘려서 지시문을 정확하게 써줘」 — 자유 장면 주문을 줄이지 않는다). 그 전엔 game 과 같은 1200(docs/CASUAL_TREE_V2.md 4절) */
let n = 0, most = [0, ''];
function look(sc, where, card) {
  const st = Object.assign({}, base, card ? { mech: card.en, gen: card.gen } : {}, sc);
  const text = L.buildSingle(st), sb = block(text, 'SCENE'), r = C.repair(t, P.sceneV2(st), { gen: st.gen });
  assert(!/Activity:|HAND TASK|Orientation:|Framing:/.test(text), where + ' 버전1 줄');
  assert(/POSTURE: /.test(sb) && /COMPOSITION: /.test(sb) && /Lens \/ perspective: /.test(sb), where + ' 버전2 줄');
  assert(text.includes(T.bodyV2) && text.includes(T.handsV2), where + ' 몸 · 손 줄');
  assert(!/[가-힣]/.test(text), where + ' 한글');
  const u = C.use(t, r.use);
  assert.equal(sb.includes('Role: '), !!(u && u.role), where + ' 역할 줄');
  const comp = C.companionAt(t, r.place);
  assert.equal(text.includes(T.figureCompanion), comp, where + ' 동료 한 마리 줄');
  assert.equal(text.includes(T.figure), !comp, where + ' 한 명만 줄');
  assert.equal(sb.includes(T.casualCompanionV2), comp, where + ' 동료 장면 줄');
  assert.equal(text.includes(T.casualWorld), r.era === 'in_pokemon', where + ' 포켓몬 세계');
  if (r.era === 'release') assert(text.includes(String(tree.gen_years[String(st.gen)])), where + ' 첫 등장의 해');
  const f = C.frame(t, r.frame);
  assert.equal(text.includes('\n\nCROP: '), !!f.close, where + ' 가까운 컷 CROP');
  const body = t.v2.body.find(b => b.key === r.body), head = t.v2.head.find(h => h.key === r.head);
  assert.equal(text.includes('LOOK-BACK:'), !!(body.far && head.look_back), where + ' 돌아보기');
  for (const side of ['right', 'left']) if (r[side]) assert(sb.includes(side.toUpperCase() + ' HAND: her own ' + side) || sb.includes('BOTH HANDS:'), where + ' ' + side + ' 손 본인 기준');
  if (u) assert(sb.includes('PROP: with ' + (u.hands === 'both' ? 'both hands' : 'her own ' + (r.right === 'prop' ? 'right' : 'left') + ' hand')), where + ' PROP');
  const w = P.words(text);
  assert(w <= LIMIT, where + ' ' + w + ' 낱말');
  if (w > most[0]) most = [w, where];
  n++;
  return text;
}
/* 1. 자세 추천 × 쓸 수 있는 장소(장소마다 그 시대 하나) — 2026-11-12 다 돌지 않고 추천마다 · 장소마다 한 번은 + 열 쌍에 하나(이천여 쌍이 1분 걸렸다) */
const seenPr = new Set(), seenPl = new Set(); let pairs = 0;
for (const pr of tree2.presets) for (const pl of C.allPlaces(t)) {
  const era = pl.eras.includes('now') ? 'now' : pl.eras[0];
  if (!C.presetOk(t, { era, place: pl.key, ofam: 'everyday' }, pr.key)) continue;
  if (seenPr.has(pr.key) && seenPl.has(pl.key) && pairs++ % 10) continue;
  seenPr.add(pr.key); seenPl.add(pl.key);
  look(C.repair(t, C.applyPreset(t, { treeV: 2, era, place: pl.key, ofam: 'everyday' }, pr.key)), pr.key + ' @ ' + pl.key);
}
assert(n > 200 && seenPr.size === tree2.presets.length, '추천 × 장소 ' + n + ' · 추천 ' + seenPr.size + '/' + tree2.presets.length);
/* 2. 랜덤 — 카드 세대 · 표정 · 세부 강도 다섯을 다 얹어 가장 긴 것 */
let s = 9, xf = 0; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
const exprs = S.EXPRESSION_OPTIONS.map(x => Array.isArray(x) ? x[0] : x.key || x).filter(Boolean);
for (let i = 0; i < 150; i++) {
  const card = cards[i % cards.length], sc = C.random(t, {}, { gen: card.gen }, rnd);
  const axes = {}; (S.LOCAL_AXES || []).forEach(k => { const o = S.ADVANCED_OPTIONS[k] || []; if (o.length) axes[k] = o[o.length - 1]; });
  look(Object.assign(sc, { expr: exprs[i % exprs.length], axes, scene: i % 4 ? '' : 'late afternoon light through the window', ofeat: i % 5 ? [] : ['glasses'] }), '랜덤 ' + i, card);
  /* 자유 장면(2026-11-11 — 갈래 · 상황 자유 · 장면 자유) — SCENE 이 주문, 우리 장소 · 자세 · 구도 · 손 · 크롭 · 시대 줄 없음, 얼굴 · 화풍 · 인체 칸 그대로 */
  if (sc.ofam !== 'pokemon_costume') {
    const fr = Object.assign({}, base, { mech: card.en, gen: card.gen }, sc, i % 2 ? { xfree: true } : { sfree: true, ofree: true }), tf = L.buildSingle(fr), F = S.FREE_SCENE;
    assert(tf.includes(F.head) && tf.includes(F.avoid) && tf.includes(i % 2 ? F.xfree : F.sfree) && !tf.includes(i % 2 ? F.sfree : F.xfree) && tf.includes(F.keep) && tf.includes(F.end), '랜덤 ' + i + ' 자유 주문');
    assert(!/^(Place|POSTURE|COMPOSITION|Lens \/ perspective|RIGHT HAND|LEFT HAND|BOTH HANDS|PROP|GAZE|Outfit|Outfit colours|Cut|Situation|action_level|separates_preference): /m.test(tf) && !/\n\n(CROP|WORLD|LOOK-BACK): /.test(tf) && !tf.includes(S.OUTFIT_FREE), '랜덤 ' + i + ' 자유 — 우리 장면 줄 없음');
    assert(/\n\nFACE: /.test(tf) && /\n\nBODY TYPE: /.test(tf) && /\n\nSTYLE: /.test(tf) && tf.includes(T.anatomy) && tf.includes(T.bodyV2) && tf.includes(T.handsV2) && tf.includes(T.figure) && /^skin_exposure: /m.test(tf), '랜덤 ' + i + ' 자유 — 얼굴 · 화풍 · 인체 · 노출 강도 그대로');
    if (fr.expr) assert(/^EXPRESSION: /m.test(tf), '랜덤 ' + i + ' 자유 — 표정');
    assert(!/[가-힣]/.test(tf) && P.words(tf) <= LIMIT, '랜덤 ' + i + ' 자유 ' + P.words(tf));
    xf++;
  }
}
/* 3. pkm 고정 사례 */
const job = C.repair(t, { treeV: 2, era: 'in_pokemon', place: 'work_lab', ofam: 'work', posture: 'stand', support: 'none', frame: 'waist_up', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'prop', left: 'prop', use: 'job_lab_maps' });
assert.equal(job.use, 'job_lab_maps');
let tx = look(job, '연구소 지도');
assert(block(tx, 'SCENE').includes('Role: she is at work here as a Pokémon research coordinator.') && block(tx, 'SCENE').includes('spreads a habitat map flat across the desk'), tx);
const pet = C.repair(t, C.applyPreset(t, { treeV: 2, era: 'in_pokemon', place: 'partner_yard', ofam: 'everyday' }, 'kneel_pet'));
tx = look(pet, '동료 쓰다듬기');
assert(block(tx, 'SCENE').includes("hand rests gently on her companion's head") && tx.includes('exactly one Pokémon companion'), tx);
tx = look(C.repair(t, { treeV: 2, era: 'release', place: 'home_living', ofam: 'everyday' }), '첫 등장 무렵', { en: 'Mew', gen: 1 });
assert(tx.includes('around 1996'), '1세대 1996');
/* 4. 버전1 기록은 버전1 지시문 — 버전2 표가 와도 */
const v1 = L.buildSingle({ ...base, treeV: undefined, era: 'now', place: 'home_living', act: tree.activities.find(a => (a.places || []).includes('home_living')).key, ofam: 'everyday' });
assert(/Activity: /.test(v1) && !/POSTURE: /.test(v1) && v1.includes(T.handsCasual), '버전1 기록');
/* 포켓몬 코스튬(2026-11-01) — 옷 문장의 {costume} 이 그 종의 영어 이름 · 색 · 특징으로 채워지고, OUTPUT · WARDROBE 줄이 바뀌고, 「장신구로만」 축 줄은 빠진다 */
{
  const ap = JSON.parse(fs.readFileSync('data/source-appearance.json', 'utf8')).entries['25'];
  const sc = { era: 'now', place: 'stage_convention', ofam: 'pokemon_costume', item: 'pc_bodysuit', posture: 'stand', support: 'none', frame: 'three_quarter', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'hip', left: 'natural', aspect: '2:3',
    axes: { overall_intensity: 'strong', skin_exposure: 'bold', source_influence: 'subtle' } };
  const text = L.buildSingle(Object.assign({}, base, { sourceName: 'Pikachu', sourceAppearance: ap }, sc)), sb = block(text, 'SCENE');
  assert(/Outfit: a daring adult costume version of Pikachu itself — yellow/.test(sb) && sb.includes(ap.features[0].detail) && sb.includes('never painted on her own skin') && sb.includes('high-cut bodysuit'), '코스튬 옷 문장 ' + sb);
  assert(text.includes(T.casualOutputCostume) && text.includes(T.casualWardrobeCostume) && !text.includes(T.casualOutputV2) && !text.includes(T.casualWardrobe) && !sb.includes('source_influence:'), '코스튬 OUTPUT · WARDROBE · 축 줄');
  const hw = L.buildSingle(Object.assign({}, base, sc, { place: 'night_club', ofam: 'halloween', item: 'hw_vampire' }));
  assert(hw.includes(T.casualOutputV2) && block(hw, 'SCENE').includes('source_influence: subtle'), '할로윈은 보통 옷 줄');
  n += 2;
}
assert(xf > 100, '자유 장면 ' + xf);
console.log(`PASS 일상컷 버전2 지시문: ${n}개 · 가장 긴 것 ${most[0]}낱말(${most[1]}) · 상한 ${LIMIT} · 역할 · 동료 · 첫 등장의 해 · 자유 장면 ${xf} · 버전1 기록`);
