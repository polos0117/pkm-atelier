/* 일상컷 버전2 지시문(lib/prompt-anthro.js — treeV 2 + 표 tree2). node tests/prompt-casual-v2.cjs
   - 자세 추천 × 쓸 수 있는 장소마다, 랜덤 장면(카드 세대 · 표정 · 세부 강도)마다: 하는 일 · HAND TASK 줄 없음, POSTURE · COMPOSITION · 렌즈,
     손 줄은 본인 기준, 한글 없음, 낱말 상한
   - pkm 몫: 직업 역할 동작이면 Role 줄, 동료 묶음이면 동료 줄 · 한 마리 줄(아니면 「한 명만」), 첫 등장 무렵의 해, 포켓몬 세계
   - 버전1 기록(treeV 없음)은 버전2 표가 와도 버전1 지시문 그대로
   - 게임 코스프레(2026-11-15) — 주인공 하나 · 1회차(「…」 채우는 자리) · 2회차 글, 게임 · 캐릭터 이름, OUTPUT · WARDROBE 코스프레 줄, 옷 색 · 상황 · 원작 영향도 줄 없음, 체형 · 복근 줄 그대로 */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {} }; vm.createContext(ctx);
for (const name of ['prompt-spec', 'casual-tree', 'casual-tree-v2', 'prompt-anthro', 'prompt-lifestyle', 'game-cosplay']) vm.runInContext(fs.readFileSync('lib/' + name + '.js', 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L, AtelierCasualTreeV2: C } = ctx.window;
const tree = JSON.parse(fs.readFileSync('data/casual-tree.json', 'utf8')), tree2 = JSON.parse(fs.readFileSync('data/casual-tree-v2.json', 'utf8'));
const t = C.make(tree2, tree), T = S.PROMPT_LINES;
const cards = Object.values(JSON.parse(fs.readFileSync('data/card.json', 'utf8')).cards).flat();
const base = { mech: 'Pikachu', series: 'Electric', style: S.DEFAULT_STYLE, tree, tree2, gen: 1, treeV: 2 };
const block = (s, k) => (s.split(k + ' (chosen):\n')[1] || '').split('\n\n')[0];
const LIMIT = 1450;   /* 2026-11-26 1400 → 1450(배경 인물 · 팔 잇기 · 뒷모습 줄 — 글은 줄이지 않고 상한을 올린다) · 2026-11-11 1200 → 1400(사용자 「상한을 늘려서 지시문을 정확하게 써줘」 — 자유 장면 주문을 줄이지 않는다). 그 전엔 game 과 같은 1200(docs/CASUAL_TREE_V2.md 4절) */
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
  /* 2026-11-23 — 일상컷은 figureCasual(작고 흐린 배경 인물은 되고 포켓몬 · 동물 없음), 포켓몬이 사는 장소(animals)는 figurePokemon(배경에만), 동료 묶음은 figureCompanion */
  const pkmHere = !!(C.animalsAt && C.animalsAt(t, r.place));
  assert.equal(text.includes(T.figureCasual), !comp && !pkmHere, where + ' 주인공 하나 줄(포켓몬 없음)');
  assert.equal(text.includes(T.figurePokemon), !comp && pkmHere, where + ' 포켓몬은 배경에만 줄');
  assert(!text.includes(T.figure), where + ' 카드 그림의 한 명만 줄은 일상컷에 안 쓴다');
  assert.equal(sb.includes(T.casualCompanionV2), comp, where + ' 동료 장면 줄');
  assert.equal(text.includes(T.casualWorld) || text.includes(T.casualWorldPokemon), r.era === 'in_pokemon', where + ' 포켓몬 세계');   /* 포켓몬이 사는 장소는 casualWorldPokemon(2026-11-23) */
  if (r.era === 'in_pokemon') assert.equal(text.includes(T.casualWorldPokemon), !!(C.animalsAt && C.animalsAt(t, r.place)), where + ' 포켓몬 세계 — 포켓몬이 사는 장소만 배경 포켓몬');
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
/*   옷에 기대는 손(옷깃 collar · 끈 strap · 주머니 pocket — outfit_features)의 추천은 그 특징이 기본인 의상 계열에서 본다(2026-11-23 collar_waist 는 깃 옷 —
     everyday 기본엔 깃이 없어 work 에서). 특징이 필요 없거나 everyday 가 가진 추천은 그대로 everyday */
/* 옷 특징 — 손 자세가 바라는 것 + 그 추천의 자세에서 되는 소품 동작이 모두 바라는 것(2026-11-25 — 공기매트는 수영복 swimsuit) */
const useNeed = pr => { if (!pr.prop_kind) return []; const us = tree2.prop_uses.filter(u => u.kind === pr.prop_kind && u.postures.includes(pr.posture) && u.frames.includes(pr.frame)); return us.length && us.every(u => u.outfit && u.outfit === us[0].outfit) ? [us[0].outfit] : []; };
const OF = tree2.outfit_features.defaults, needOf = pr => ['right', 'left'].map(s => (tree2.hands.find(h => h.key === pr[s]) || {}).outfit).filter(Boolean).concat(useNeed(pr), (tree2.postures.find(p => p.key === pr.posture) || {}).outfit ? [tree2.postures.find(p => p.key === pr.posture).outfit] : []);
const famOf = pr => { const need = needOf(pr); return ['everyday'].concat(Object.keys(OF)).find(f => need.every(x => OF[f].includes(x))) || 'everyday'; };
const seenPr = new Set(), seenPl = new Set(); let pairs = 0;
for (const pr of tree2.presets) { const ofam = famOf(pr); for (const pl of C.allPlaces(t)) {
  const era = pl.eras.includes('now') ? 'now' : pl.eras[0];
  if (!C.presetOk(t, { era, place: pl.key, ofam }, pr.key)) continue;
  if (seenPr.has(pr.key) && seenPl.has(pl.key) && pairs++ % 10) continue;
  seenPr.add(pr.key); seenPl.add(pl.key);
  look(C.repair(t, C.applyPreset(t, { treeV: 2, era, place: pl.key, ofam }, pr.key)), pr.key + ' @ ' + pl.key + (ofam === 'everyday' ? '' : ' · ' + ofam));
} }
assert(n > 200 && seenPr.size === tree2.presets.length, '추천 × 장소 ' + n + ' · 추천 ' + seenPr.size + '/' + tree2.presets.length);
/* 2. 랜덤 — 카드 세대 · 표정 · 세부 강도 다섯을 다 얹어 가장 긴 것 */
let s = 9, xf = 0; const rnd = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
const exprs = S.EXPRESSION_OPTIONS.map(x => Array.isArray(x) ? x[0] : x.key || x).filter(Boolean);
for (let i = 0; i < 150; i++) {
  const card = cards[i % cards.length], sc = C.random(t, {}, { gen: card.gen }, rnd);
  const axes = {}; (S.LOCAL_AXES || []).forEach(k => { const o = S.ADVANCED_OPTIONS[k] || []; if (o.length) axes[k] = o[o.length - 1]; });
  look(Object.assign(sc, { expr: exprs[i % exprs.length], axes, scene: i % 4 ? '' : 'late afternoon light through the window', ofeat: i % 5 ? [] : ['glasses'] }), '랜덤 ' + i, card);
  /* 자유 장면(2026-11-11 — 갈래 · 상황 자유 · 장면 자유) — SCENE 이 주문, 우리 장소 · 자세 · 구도 · 손 · 크롭 · 시대 줄 없음, 얼굴 · 화풍 · 인체 칸 그대로 */
  if (!(tree.outfits.find(f => f.key === sc.ofam) || {}).costume) {   /* 코스튬 컷(포켓몬 코스튬 · 게임 코스프레)은 자유 장면이 안 된다 */
    const fr = Object.assign({}, base, { mech: card.en, gen: card.gen }, sc, i % 2 ? { xfree: true } : { sfree: true, ofree: true }), tf = L.buildSingle(fr), F = S.FREE_SCENE;
    assert(tf.includes(F.head) && tf.includes(F.avoid) && tf.includes(i % 2 ? F.xfree : F.sfree) && !tf.includes(i % 2 ? F.sfree : F.xfree) && tf.includes(F.keep) && tf.includes(F.end), '랜덤 ' + i + ' 자유 주문');
    assert(!/^(Place|POSTURE|COMPOSITION|Lens \/ perspective|RIGHT HAND|LEFT HAND|BOTH HANDS|PROP|GAZE|Outfit|Outfit colours|Cut|Situation|action_level|separates_preference): /m.test(tf) && !/\n\n(CROP|WORLD|LOOK-BACK): /.test(tf) && !tf.includes(S.OUTFIT_FREE), '랜덤 ' + i + ' 자유 — 우리 장면 줄 없음');
    assert(/\n\nFACE: /.test(tf) && /\n\nBODY TYPE: /.test(tf) && /\n\nSTYLE: /.test(tf) && tf.includes(T.anatomy) && tf.includes(T.bodyV2) && tf.includes(T.handsV2) && tf.includes(T.figureCasual) && !tf.includes(T.figure) && /^skin_exposure: /m.test(tf), '랜덤 ' + i + ' 자유 — 얼굴 · 화풍 · 인체 · 노출 강도 그대로(한 명 줄은 일상컷 figureCasual — 2026-11-23)');
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
/* 게임 코스프레(2026-11-15) — 목록의 글에 게임 · 캐릭터 이름 · 재단(옷 칸 gc_<재단>), 코스프레 OUTPUT · WARDROBE, 색 · 상황 · 원작 영향도 줄 없음 */
{
  const G = ctx.window.AtelierGameCosplay, list = JSON.parse(fs.readFileSync('data/game-cosplay.json', 'utf8'));
  const sc = { era: 'now', place: 'arcade_hall', ofam: 'game_cosplay', item: 'gc_bodysuit', ocolor: 'red', situ: 'wind', posture: 'stand', support: 'none', frame: 'three_quarter', body: 'front_3q', head: 'with_body', camera: 'eye', right: 'hip', left: 'natural', aspect: '2:3',
    axes: { overall_intensity: 'strong', skin_exposure: 'bold', source_influence: 'subtle' } };
  const run = (cos, extra) => { const text = L.buildSingle(Object.assign({}, base, { cosplayList: list }, sc, { cosplay: cos }, extra || {})); return { text, sb: block(text, 'SCENE') }; };
  const fixed = run({ game: 'legend_of_zelda', character: 'Link', cut: 'mini_dress', round: 1 });   /* 옷 칸(gc_bodysuit)이 재단을 정한다 */
  assert(fixed.sb.includes('Outfit: a daring adult cosplay of Link from The Legend of Zelda — Link\'s outfit — a green belted tunic') && fixed.sb.includes('cut as a high-cut bodysuit'), '주인공 하나 ' + fixed.sb);
  assert(fixed.text.includes(T.casualOutputCosplay) && fixed.text.includes(T.casualWardrobeCosplay) && !fixed.text.includes(T.casualOutputV2) && !fixed.text.includes(T.casualWardrobe) && !fixed.text.includes(T.casualOutputCostume), '코스프레 OUTPUT · WARDROBE');
  assert(!/Outfit colours:|Situation:|source_influence:/.test(fixed.sb) && !/accessories and objects around her|her source belongs in accessories/.test(fixed.text), '색 · 상황 · 원작 영향도 · 「장신구로만」 줄 없음');
  assert(/\n\nBODY TYPE: /.test(fixed.text) && fixed.text.includes(T.figureCasual) && !fixed.text.includes(T.figure) && fixed.text.includes(T.bodyV2) && /^skin_exposure: bold/m.test(fixed.sb), '체형 · 인체 · 노출 줄 그대로(한 명 줄은 일상컷 figureCasual — 2026-11-23)');
  const abs = Object.keys((T.abs || {}).by || {})[0];
  if (abs) assert(run({ game: 'legend_of_zelda', character: 'Link', cut: 'bodysuit' }, { mech: abs }).text.includes(T.abs[T.abs.by[abs]]), '복근 줄 그대로');
  /* 2026-11-16 — 등장인물 많은 게임 1회차도 계획기가 정한 캐릭터(text.assigned). 옛 계획의 pick 칸(character 빈 칸)은 지시문 그대로 */
  const assigned = run({ game: 'overwatch', character: 'Kiriko', cut: 'bodysuit', round: 1 });
  assert(assigned.sb.includes('Outfit: ' + list.text.assigned.replace('{character}', 'Kiriko').replace('{game}', 'Overwatch').replace('{cut}', 'cut as a high-cut bodysuit')) && assigned.text.includes(T.casualOutputCosplay) && !assigned.sb.includes('…'), '1회차 assigned ' + assigned.sb);
  const pick = run({ game: 'overwatch', character: '', cut: 'bodysuit', round: 1, used: ['Tracer', 'Mercy'] });
  assert(/^Outfit: … \(a daring adult cosplay of one character of your choice from Overwatch — not any of these already used: Tracer, Mercy; write the character's name first/m.test(pick.sb), '옛 1회차 pick 칸 그대로 ' + pick.sb);
  assert(run({ game: 'overwatch', character: '', cut: 'bodysuit', round: 1 }).sb.includes('already used: none yet;'), '1회차 — 쓴 캐릭터 없음');
  const again = run({ game: 'overwatch', character: 'Mercy', cut: 'bodysuit', round: 2 });
  assert(again.sb.includes('Outfit: a daring adult cosplay of Mercy from Overwatch — the costume\'s recognisable colours and parts, cut as a high-cut bodysuit'), '2회차 ' + again.sb);
  const fallback = run(undefined);   /* 게임을 안 고른 장면(랜덤 · 손으로 계열만) — 트리의 옷 글 */
  assert(fallback.sb.includes('Outfit: a daring adult cosplay of a video-game character, cut as a high-cut bodysuit') && fallback.text.includes(T.casualOutputCosplay), '게임 없음 — 옷 칸 글');
  for (const x of [fixed, assigned, pick, again]) assert(!/[가-힣]/.test(x.text) && P.words(x.text) <= LIMIT, '한글 · 낱말 ' + P.words(x.text));
  /* 버전1 장면도 같은 글 */
  const v1c = L.buildSingle({ ...base, treeV: undefined, cosplayList: list, era: 'now', place: 'arcade_hall', act: tree.activities.find(a => (a.places || []).includes('arcade_hall') || (a.places || []).includes('@arcade')).key, ofam: 'game_cosplay', item: 'gc_idol', cosplay: { game: 'super_mario_bros', character: 'Mario', cut: 'idol', round: 1 } });
  assert(v1c.includes('Outfit: a daring adult cosplay of Mario from Super Mario Bros.') && v1c.includes(T.casualOutputCosplay) && v1c.includes(T.casualWardrobeCosplay), '버전1 게임 코스프레');
  assert.equal(G.cosplayText(list, { game: 'super_mario_bros', cut: 'idol' }), 'a daring adult cosplay of Mario from Super Mario Bros. — ' + list.games[0].outfit + ', cut as a stage idol outfit — a cropped jacket and a pleated mini skirt');
  n += 6;
}
/* 옷 색 구체 색(shade, 2026-11-16) — Outfit colours 줄은 묶음 글(「… and …」) 대신 shade 의 en 하나. shade 없는 옛 장면은 카드 · 묶음으로 결정적(머리 hue 피함),
   색 고정 옷(옷 문장이 그 묶음 색을 정함)은 묶음 글 그대로, 코스튬 · 게임 코스프레 · 옷 자유엔 줄 없음 */
{
  const sc0 = { era: 'now', place: 'cafe', ofam: 'everyday', posture: 'stand', frame: 'knee_up', body: 'front_3q', head: 'with_body', camera: 'eye', expr: '' };
  const line = (sc, extra) => (/^Outfit colours: (.*?) — her own colour choice/m.exec(block(L.buildSingle(Object.assign({}, base, extra || {}, sc)), 'SCENE')) || [])[1];
  for (const g of S.OUTFIT_COLORS) {
    assert(g.shades.length >= 4 && g.shades.length <= 5, g.key + ' shade 넷 ~ 다섯');
    for (const x of g.shades) {
      assert(x.key && x.ko && x.en && x.hue, g.key + ' shade 칸');
      assert(!/\bsuch as\b|,| and | or /.test(x.en), x.key + ' 색 하나만: ' + x.en);
      assert(g.words.some(w => new RegExp('\\b' + w + '\\b').test(x.en)), x.key + ' 묶음 낱말(옷 직접 쓰기 검사)');
      assert.equal(line({ ...sc0, ocolor: g.key, shade: x.key }), x.en, x.key + ' 줄');
      n++;
    }
    const a = line({ ...sc0, ocolor: g.key }, { mech: '피카츄', cardColor: 'yellow' }), b = line({ ...sc0, ocolor: g.key }, { mech: '피카츄', cardColor: 'yellow' });
    assert.equal(a, b, g.key + ' 옛 장면 — 같은 입력 같은 색');
    assert(g.shades.some(x => x.en === a) && a !== g.en, g.key + ' 옛 장면 — 그 묶음의 shade: ' + a);
    assert.equal(line({ ...sc0, ocolor: g.key, shade: 'nope' }, { mech: '피카츄', cardColor: 'yellow' }), a, g.key + ' 없는 열쇠 = 자동');
  }
  const keys = S.OUTFIT_COLORS.flatMap(g => g.shades.map(x => x.key));
  assert.equal(new Set(keys).size, keys.length, 'shade 열쇠 겹침 없음');
  /* 옛 장면 — 카드마다 고르게 퍼진다(한 묶음 안) */
  const spread = new Set(cards.slice(0, 200).map(c => line({ ...sc0, ocolor: 'blue' }, { mech: c.name, cardColor: c.color })));
  assert.equal(spread.size, S.OUTFIT_COLORS.find(g => g.key === 'blue').shades.length, '옛 장면 — 카드마다 다른 shade');
  assert.equal(P.hueOfHair('soft cherry-blossom pink'), 'pink'); assert.equal(P.hueOfHair('silver-white'), 'white'); assert.equal(P.hueOfHair('???'), '');
  /* 색 고정 옷 — 옷 문장의 묶음 색 그대로(묶음 글) */
  const fixedIt = (() => { for (const f of tree.outfits) for (const it of f.items || []) { const g = S.OUTFIT_COLORS.find(c => c.words.some(w => new RegExp('\\b' + w + '\\b').test(String(it.en).toLowerCase()))); if (g && !f.costume) return { f, it, g }; } })();
  if (fixedIt) {
    const txt = L.buildSingle(Object.assign({}, base, { ...sc0, ofam: fixedIt.f.key, item: fixedIt.it.key, ocolor: fixedIt.g.key }));
    const got = (/^Outfit colours: (.*?) — /m.exec(block(txt, 'SCENE')) || [])[1];
    if (got) assert.equal(got, fixedIt.g.en, '색 고정 옷 — 묶음 글 ' + fixedIt.it.key);
  }
  /* 코스튬 · 옷 자유 — 줄 없음 */
  assert(!/Outfit colours:/.test(L.buildSingle(Object.assign({}, base, { ...sc0, ofam: 'pokemon_costume', ocolor: 'red', shade: 'cherry' }))), '코스튬 — 옷 색 줄 없음');
  assert(!/Outfit colours:/.test(L.buildSingle(Object.assign({}, base, { ...sc0, ofree: true, ocolor: 'red', shade: 'cherry' }))), '옷 자유 — 옷 색 줄 없음');
}
assert(xf > 100, '자유 장면 ' + xf);
/* 놀이터(k_kids, 2026-11-25) — 노출 축을 많이(bold)로 줘도 드러내는 노출 글 · 상황 노출이 없고, 배경 아이들 · 덮인 옷 줄이 실린다 */
for (const era of ['now', 'release']) {
  const txt = L.buildSingle(Object.assign({}, base, { era, place: 'playground', ofam: 'everyday', situ: 'wet', axes: { skin_exposure: 'bold' }, posture: 'swing_sit', frame: 'full_body' }));
  assert(/children may appear only as small, soft-focus background figures/.test(txt) && /fully non-revealing/.test(txt), era + ' 놀이터 아이들 · 덮인 옷 줄');
  assert(!/most revealing|natural cleavage|more scene-appropriate shoulder|skin clearly showing|Situation: right now/i.test(txt), era + ' 놀이터 노출 글\n' + txt);
}

console.log(`PASS 일상컷 버전2 지시문: ${n}개 · 가장 긴 것 ${most[0]}낱말(${most[1]}) · 상한 ${LIMIT} · 역할 · 동료 · 첫 등장의 해 · 자유 장면 ${xf} · 버전1 기록 · 게임 코스프레`);
