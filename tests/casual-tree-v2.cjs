/* 일상컷 트리 버전2 모듈(lib/casual-tree-v2.js — game-atelier 원본) × pkm 표. node tests/casual-tree-v2.cjs
   - 검사기(tools/casual-tree-v2.py)와 같은 길: 자세 추천마다 쓸 수 있는 장소가 같다
   - 다시 검사 뒤엔 어느 칸도 걸리지 않는다(랜덤 수백 번 — 카드 세대도 돌린다)
   - pkm 몫: 안 쓰는 값(몸 뒤 · 디테일), 필수 갈래엔 얼굴 클로즈업 없음, 동료는 동료 묶음에서만 · 거기선 가슴 위 · 클로즈업 없음,
     직업 역할 동작은 그 현장에서만, 첫 등장 무렵의 해(세대) */
const assert = require('node:assert'), fs = require('node:fs'), path = require('node:path');
global.window = global; require('../lib/casual-tree.js'); require('../lib/casual-tree-v2.js');
const C = window.AtelierCasualTreeV2, R = path.join(__dirname, '..');
const t = C.make(JSON.parse(fs.readFileSync(path.join(R, 'data/casual-tree-v2.json'), 'utf8')), JSON.parse(fs.readFileSync(path.join(R, 'data/casual-tree.json'), 'utf8')));
const py = JSON.parse(require('node:child_process').execFileSync('python3', [path.join(R, 'tools/casual-tree-v2.py'), 'places-all'], { encoding: 'utf8' }));
const cards = JSON.parse(fs.readFileSync(path.join(R, 'data/card.json'), 'utf8'));
const cardList = Object.values(cards.cards).flat().map(c => ({ gen: c.gen }));   /* 생성기가 넘기는 꼴 — {gen} */
assert(cardList.length > 1000 && cardList.every(c => c.gen >= 1 && c.gen <= 9), '카드 세대');
const seeded = s => () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;

/* 1. 검사기와 같은 길 — 추천 × 장소(그 장소의 시대 · 손 자세가 바라는 특징이 있고 필수 갈래가 아닌 의상 계열) */
const req = (t.v1.required || {}).outfits || [];
/* 옷 특징 — 손 자세가 바라는 것 + 그 추천의 자세에서 되는 소품 동작이 모두 바라는 것(2026-11-25 — 공기매트는 수영복 swimsuit) */
const useFeat = pr => { if (!pr.prop_kind) return []; const us = t.v2.prop_uses.filter(u => u.kind === pr.prop_kind && u.postures.includes(pr.posture) && u.frames.includes(pr.frame)); return us.length && us.every(u => u.outfit && u.outfit === us[0].outfit) ? [us[0].outfit] : []; };
const feat = pr => [pr.right, pr.left].map(k => C.hand(t, k)).filter(h => h && h.outfit).map(h => h.outfit).concat(useFeat(pr), (C.posture(t, pr.posture) || {}).outfit ? [C.posture(t, pr.posture).outfit] : []);
let pairs = 0;
for (const pr of t.v2.presets) {
  for (const pl of C.allPlaces(t)) {
    const era = pl.eras.includes('now') ? 'now' : pl.eras[0], e = C.era(t, era);
    const fam = t.v1.outfits.find(o => e.outfits.includes(o.key) && !req.includes(o.key) && feat(pr).every(x => C.features(t, o.key, '').includes(x)) && !C.why(t, { era, place: pl.key }, 'ofam', o.key));   /* 그 장소에 설 수 있는 의상 계열만(표 outfit_rules, 2026-11-13) */
    if (!fam) continue;
    pairs++;
    assert.equal(C.presetOk(t, { era, place: pl.key, ofam: fam.key }, pr.key), py[pr.key].includes(pl.key), pr.key + ' @ ' + pl.key);
  }
  assert(py[pr.key].length, pr.key + ' 쓸 장소');
}
assert(pairs > 5000, pairs);

/* 2. 다시 검사 뒤엔 걸리는 칸이 없다 */
function valid(sc, where, card) {
  for (const k of C.ORDER) if (sc[k]) assert.equal(C.why(t, sc, k, sc[k], card), null, where + ' ' + k + '=' + sc[k] + ' ' + JSON.stringify(C.why(t, sc, k, sc[k], card)));
  for (const k of C.REQUIRED) assert(sc[k], where + ' 빈 칸 ' + k);
  if (C.propSides(sc)) assert(sc.use, where + ' 소품 동작');
  else assert(!sc.use, where + ' 손 없는 소품 동작');
  const u = C.use(t, sc.use);
  if (u) assert.equal(u.hands === 'both', C.propSides(sc) === 2, where + ' 소품 손 수');
  if (!C.frame(t, sc.frame).legs) assert(!sc.legs, where + ' 안 보이는 다리');
  /* pkm 몫 */
  assert.notEqual(sc.body, 'back', where + ' 몸 뒤');
  assert.notEqual(sc.frame, 'detail', where + ' 디테일');
  const comp = C.companionAt(t, sc.place);
  if (comp) assert(!['chest_up', 'face_close'].includes(sc.frame), where + ' 동료 묶음에 가까운 컷');
  if (!comp) assert(!(u && u.companion) && ![sc.right, sc.left].some(k => (C.hand(t, k) || {}).companion), where + ' 동료 없이 동료 동작');
  if (u && u.places) assert(C.expand(t, u.places).includes(sc.place), where + ' 역할 동작의 현장');
  if (sc.frame === 'face_close') assert(!req.includes(sc.ofam), where + ' 필수 갈래에 얼굴 클로즈업');
  assert.equal(sc.treeV, 2);
}
const rnd = seeded(7);
for (let i = 0; i < 300; i++) {
  const card = cardList[i % cardList.length];
  const sc = C.random(t, {}, card, rnd, [], { preset: i % 2 === 0 });
  valid(sc, '랜덤 ' + i, card);
}
/* 포켓몬 세계 장소만 따로 — 직업 현장 · 동료 · 나무열매가 랜덤에 잘 안 걸려도 본다 */
const pkmPlaces = t.v1.places.filter(p => ['pokeworld', 'work', 'partner', 'berry'].includes(p.group));
const rp = seeded(13);
for (let i = 0; i < 300; i++) {
  const pl = pkmPlaces[i % pkmPlaces.length];
  const sc = C.random(t, { era: 'in_pokemon', place: pl.key }, null, rp, ['era', 'place'], { preset: i % 3 === 0 });
  assert.equal(sc.place, pl.key);
  valid(sc, '포켓몬 세계 ' + pl.key);
}
const r2 = seeded(11);
for (let i = 0; i < 200; i++) {
  let sc = C.random(t, {}, null, r2);
  const k = C.ORDER[Math.floor(r2() * C.ORDER.length)], pool = k === 'place' ? t.v1.places.map(p => p.key) : [].concat(...['hands', 'legs', 'postures', 'supports', 'gaze', 'body', 'prop_uses'].map(n => t.v2[n].map(x => x.key)), Object.keys(t.v2.frames), ['prop', 'nope']);
  sc = C.set(t, sc, k, pool[Math.floor(r2() * pool.length)]);
  valid(sc, '바꾸기 ' + i + ' ' + k);
}

/* 3. pkm 고정 사례 */
const fx = (x) => Object.assign({ era: 'now', place: 'home_living', ofam: 'everyday', posture: 'stand', support: 'none', frame: 'full_body', body: 'front', head: 'with_body', camera: 'eye', right: 'down', left: 'down' }, x);
// 안 쓰는 값 — 몸 뒤 · 디테일(버전1 banned 와 같다). 뒤 3/4 는 먼 컷에서 된다
assert.equal(C.why(t, fx({}), 'body', 'back').code, 'banned');
assert.equal(C.why(t, fx({}), 'body', 'rear_3q'), null);
assert.equal(C.why(t, fx({}), 'frame', 'detail').code, 'banned');
assert(!t.v2.presets.some(p => p.body === 'back' || p.frame === 'detail'), '추천에 안 쓰는 값');
// 필수 갈래(역할극 · 수영복 · 란제리풍 · 레트로)엔 얼굴 클로즈업 없음
assert.equal(C.why(t, fx({ ofam: 'swimwear', place: 'water_pool' }), 'frame', 'face_close').code, 'required');
assert.equal(C.why(t, fx({ ofam: 'everyday' }), 'frame', 'face_close'), null);
assert.notEqual(C.repair(t, fx({ frame: 'face_close', right: 'out', left: 'out', ofam: 'roleplay' })).frame, 'face_close', '필수 갈래로 바꾸면 클로즈업이 풀린다');
// 동료 — 동료 묶음에서만 쓰다듬기 · 간식, 동료 묶음엔 가슴 위 · 클로즈업 없음
const yard = fx({ era: 'in_pokemon', place: 'partner_yard', posture: 'kneel', frame: 'three_quarter' });
assert.equal(C.why(t, yard, 'right', 'pet_companion'), null);
assert.equal(C.why(t, fx({ posture: 'kneel', frame: 'three_quarter', place: 'home_living' }), 'right', 'pet_companion').code, 'companion');
assert(C.uses(t, Object.assign({}, yard, { right: 'prop' }), 1).some(u => u.key === 'treat_offer'), '동료에게 간식');
assert(!C.uses(t, fx({ era: 'in_pokemon', place: 'pw_route', posture: 'kneel', frame: 'three_quarter', right: 'prop' }), 1).some(u => u.companion), '동료 묶음 밖엔 동료 동작 없음');
assert.equal(C.why(t, yard, 'frame', 'chest_up').code, 'companion');
assert.equal(C.why(t, fx({ era: 'in_pokemon', place: 'pw_route' }), 'frame', 'chest_up'), null);
assert(C.presetOk(t, { era: 'in_pokemon', place: 'partner_yard', ofam: 'everyday' }, 'kneel_pet'), '무릎 꿇고 동료 쓰다듬기');
assert(!C.presetOk(t, { era: 'now', place: 'home_living', ofam: 'everyday' }, 'kneel_pet'));
// 직업 역할 동작은 그 현장에서만 — 카메라가 여러 곳에 나와도 서식지 사진가는 습지 전망대에서만
const photo = fx({ era: 'in_pokemon', frame: 'waist_up', right: 'prop', left: 'prop' });
assert(C.uses(t, Object.assign({}, photo, { place: 'work_wetland' }), 2).some(u => u.key === 'job_photo_review'));
assert(!C.uses(t, Object.assign({}, photo, { place: 'pw_town' }), 2).some(u => u.key === 'job_photo_review'), '역할 동작이 다른 곳으로 새지 않는다');
assert(C.uses(t, Object.assign({}, photo, { place: 'pw_town' }), 2).some(u => u.key === 'camera_shoot'), '역할 없는 카메라 동작은 그대로');
for (const u of t.v2.prop_uses.filter(x => x.role)) assert(u.places && u.places.length === 1 && /^(work|berry)_/.test(u.places[0]), u.key + ' 현장');
// 역할 동작 문장은 동작 하나 — 「~로 일한다」 는 역할로 갔다
for (const u of t.v2.prop_uses) assert(!/working as/.test(u.en), u.key + ' 문장에 역할');
// 첫 등장 무렵 — 소품 since 를 세대의 해와 견준다(휴대용 게임기 1989, 1세대 1996 은 된다)
const hh = card => C.uses(t, fx({ era: 'release', frame: 'waist_up', right: 'prop', left: 'prop' }), 2, card).some(u => u.key === 'handheld_play');
assert(hh({ gen: 1 }) && hh({ gen: 9 }));
assert(!hh({ facts: { year: 1985 } }), '1989 전이면 없다');

/* 화면비(2026-11-23, 표 aspect_rules · aspectFor) — 눕는 자세 · 환경 컷 3:2, 허리 위 · 3/4 1:1, 나머지 2:3, 자유 설계 · 게임 코스프레 2:3 */
assert.equal(C.aspectFor(t, { posture: 'lie_front', frame: 'waist_up' }), '3:2', '엎드림은 허리 위여도 3:2');
assert.equal(C.aspectFor(t, { posture: 'recline', frame: 'full_body' }), '3:2'); assert.equal(C.aspectFor(t, { posture: 'lie_side', frame: 'chest_up' }), '3:2');
assert.equal(C.aspectFor(t, { posture: 'stand', frame: 'environmental' }), '3:2');
assert.equal(C.aspectFor(t, { posture: 'sit_chair', frame: 'waist_up' }), '1:1'); assert.equal(C.aspectFor(t, { posture: 'stand', frame: 'three_quarter' }), '1:1');
for (const f of ['full_body', 'chest_up', 'face_close', 'detail']) assert.equal(C.aspectFor(t, { posture: 'stand', frame: f }), '2:3', f);
assert.equal(C.aspectFor(t, { posture: 'sit_floor', frame: 'full_body' }), '2:3', '앉은 전신');
assert.equal(C.aspectFor(t, { sfree: true, ofree: true }), '2:3'); assert.equal(C.aspectFor(t, { posture: 'lie_side', frame: 'environmental', sfree: true }), '2:3', '자유 설계 칸');
assert.equal(C.aspectFor(t, { ofam: 'game_cosplay', posture: 'recline', frame: 'three_quarter' }), '2:3', '게임 코스프레');
assert.equal(C.aspectFor(t, {}), '2:3');
assert.deepEqual(C.aspectSize(t, '3:2'), [1536, 1024]); assert.deepEqual(C.aspectSize(t, '1:1'), [1024, 1024]); assert.deepEqual(C.aspectSize(t, '2:3'), [1024, 1536]); assert.deepEqual(C.aspectSize(t, '16:9'), [1024, 1536]);


/* 놀이터(장소 특징 k_kids, 2026-11-25 사용자 — 아이들이 배경에 나올 수 있다): 덮인 옷 계열(평상복 · 운동복 · 레트로)만, 상황 노출 없음, 가슴 사이 물건 동작 없음 · 한 장까지 무리(once_groups)는 표에 있는 열쇠만 */
{ const pg = C.allPlaces(t).find(p => p.key === 'playground'); assert(pg && C.placeHas(t, 'playground').includes('k_kids'), '놀이터 k_kids');
  const era = pg.eras[0];
  for (const o of t.v1.outfits) assert.equal(!C.why(t, { era, place: 'playground' }, 'ofam', o.key), ['everyday', 'active', 'retro'].includes(o.key) && C.era(t, era).outfits.includes(o.key), '놀이터 옷 계열 ' + o.key);
  for (const u of t.v2.prop_uses.filter(u => u.outfit === 'cleavage')) assert((u.not_has || []).includes('k_kids'), u.key + ' 놀이터에선 안 된다');
  const R0 = seeded(2511);
  for (let i = 0; i < 300; i++) { const sc = C.random(t, { era, place: 'playground' }, null, R0, ['era', 'place']); assert(['everyday', 'active', 'retro'].includes(sc.ofam), '놀이터 랜덤 옷 ' + sc.ofam); const u = C.use(t, sc.use); assert(!(u && u.outfit === 'cleavage'), '놀이터 랜덤 동작 ' + sc.use); }
  assert(!C.situOk(t, { place: 'playground' }, { key: 'x' }), '놀이터 상황 노출 없음');
  const G = t.v2.once_groups || {}; for (const k in G) { for (const u of G[k].uses || []) assert(C.use(t, u), k + ' 동작 ' + u); for (const h of G[k].hands || []) assert(C.hand(t, h), k + ' 손 ' + h); for (const po of G[k].postures || []) assert(C.posture(t, po), k + ' 자세 ' + po); } }

console.log('casual-tree-v2(pkm) 모듈 ok — 추천×장소', pairs, '· 랜덤 300 · 포켓몬 세계 300 · 바꾸기 200 · 화면비');
