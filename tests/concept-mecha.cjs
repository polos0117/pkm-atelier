/* 메카 옵션 표(data/concept-mecha.json) · 조립부(lib/concept-mecha.js) — 생성기 「새 인물 만들기」 의 메카 실루엣 · 부위 부품 · 타입 표현,
   지시문 묶음 ① 의 자동 고르기(make(...).choose). 처음엔 2D MMORPG 메카 컨셉 명령줄 도구도 있었다 — 2026-11-08 지웠다(사용자 「도구 안쓰면 지워줘」).
   표의 열쇠 · 실루엣 owns · 자동(타입 추천 · 손 + 몸 + 주변) · 직접 고르기 · 겹치는 칸 · 배치 안 겹침 · 자동 초안 1025종 · 옵션 줄 자리 */
'use strict';
const assert = require('node:assert/strict'), path = require('node:path'), fs = require('node:fs');
const ROOT = path.join(__dirname, '..'), read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
global.window = global.window || global;
for (const f of ['prompt-spec', 'casual-tree', 'prompt-anthro', 'prompt-lifestyle', 'prompt-state']) require(path.join(ROOT, 'lib', f + '.js'));
const W = global.window, CML = require(path.join(ROOT, 'lib', 'concept-mecha.js')), C = read('concept-mecha.json');
const CARDS = {}; (function walk(x) { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (x.name && x.en && x.no) CARDS[x.name] = x; Object.values(x).forEach(walk); } })(read('card.json'));
const M = CML.make(C, { faces: read('face-design.json').faces, appearance: read('source-appearance.json').entries || {}, cards: CARDS, P: W.AtelierPrompt });
const SLOTS = C.slots.map(s => s.key);

/* 도구는 지웠다 — 표에도 그 몫(틀 · 화풍 · 체형)이 없다 */
assert(!fs.existsSync(path.join(ROOT, 'tools', 'concept-mecha.cjs')), '명령줄 도구는 지웠다');
for (const k of ['template', 'styles', 'style_default', 'card_figure', 'hands_rest']) assert(!(k in C), '도구 몫 ' + k + ' 없음');
assert.deepEqual(Object.keys(CML).sort(), ['lines', 'make']);
assert(!('build' in M) && !('faceText' in M), '지시문 틀 조립은 없다');

/* 표 — 칸마다 값이 있고 열쇠가 겹치지 않으며, owns 는 있는 칸만 */
assert.deepEqual(SLOTS, ['silhouette', 'weight', 'shoulders', 'chest', 'arms', 'hips', 'legs', 'back', 'head']);
/* 타입 표현(2026-11-06) — 일곱 가지(손 · 몸 셋 · 주변 셋), 18 타입마다 빛 · 입자 · 바닥 낱말 */
assert.deepEqual(C.fx.map(f => f.key), ['hand', 'seams', 'aura', 'hair', 'orbit', 'ground', 'trail']);
assert.deepEqual(Object.keys(C.type_fx).sort(), Object.keys(C.types).sort(), '타입 표현 낱말 = 타입 추천 타입');
for (const [t, w] of Object.entries(C.type_fx)) for (const k of ['glow', 'motes', 'ground']) assert(w[k], t + ' ' + k);
for (const k of SLOTS) { const o = k === 'silhouette' ? C.silhouettes : C.parts[k]; assert(o.length >= 3, k); assert.equal(new Set(o.map(x => x.key)).size, o.length, k + ' 열쇠 겹침'); o.forEach(x => assert(x.ko, k + ' ' + x.key + ' 한글')); }
assert.equal(C.silhouettes.length, 19, '삼국지 공방 메카 실루엣 18 + 없음');
for (const s of C.silhouettes) for (const k of s.owns) assert(SLOTS.includes(k) && k !== 'silhouette', s.key + ' owns ' + k);
for (const [t, p] of Object.entries(C.types)) for (const [k, v] of Object.entries(p)) for (const x of v) assert((k === 'silhouette' ? C.silhouettes : C.parts[k]).some(o => o.key === x), t + ' ' + k + ' ' + x);
const all = JSON.stringify(C.silhouettes) + JSON.stringify(C.parts);
assert(!/cannon|weapon|blade gun|rifle|sword/i.test(all), '부품에 무기 없음');
/* 슬림 실루엣은 판 장갑(2026-11-08 — 「armored bodysuit」 이 바디슈트처럼 그려졌다) */
assert(!/bodysuit/i.test(JSON.stringify(C.silhouettes)), '실루엣에 bodysuit 없음');

/* 자동 — 손글 종 넷: 타입 추천 안의 큰 실루엣, 손 + 몸 하나 + 주변 하나, 첫 타입, 머리끝 입자는 고를 때만, 실루엣 · 원작이 정하는 칸은 비운다 */
let n = 0;
for (const card of Object.keys(C.species)) {
  const sp = C.species[card], pref = sp.types.flatMap(t => (C.types[t] || {}).silhouette || []);
  for (const t of sp.types) assert(C.types[t], card + ' 타입 ' + t);
  for (let i = 0; i < 30; i++) {
    const r = M.choose(card, { seed: 's' + i, random: i % 2 === 1 }, []), fk = r.ch.fx.map(x => x.key);
    assert.equal(fk[0], 'hand', card + ' 자동은 손 + 몸 + 주변'); assert.equal(fk.length, 3);
    assert(r.ch.fx.every(x => x.type === sp.types[0]), card + ' 기본은 첫 타입');
    assert(!fk.includes('hair'), card + ' 머리끝 입자는 고를 때만 ' + i);
    if (i % 2 === 0) assert(pref.includes(r.ch.silhouette), card + ' 추천 실루엣');
    const sil = C.silhouettes.find(s => s.key === r.ch.silhouette);
    for (const k of [...sil.owns, ...(sp.owns || [])]) assert.equal(r.ch[k], null, card + ' ' + k + ' 은 실루엣 · 원작이 정한다');
    for (const k of SLOTS) if (r.ch[k]) assert((k === 'silhouette' ? C.silhouettes : C.parts[k]).some(x => x.key === r.ch[k]), card + ' ' + k);
    n++;
  }
  assert.deepEqual(M.choose(card, { seed: 'x' }, []), M.choose(card, { seed: 'x' }, []), card + ' 씨앗');
}
/* 직접 고르기 — 칸마다, 실루엣이 정하는 칸은 strict 면 막고 아니면 비운다, 없는 칸 · 값 · 카드는 막는다 */
const s1 = M.choose('피카츄', { set: { silhouette: 'wing_binder', legs: 'heels' } }, []);
assert.equal(s1.ch.silhouette, 'wing_binder'); assert.equal(s1.ch.legs, 'heels'); assert.equal(s1.ch.back, null, '날개 바인더가 등을 정한다');
assert.throws(() => M.choose('피카츄', { set: { silhouette: 'knight_plate', shoulders: 'balloon' }, strict: true }, []), e => e.code === 'owned');
assert.equal(M.choose('피카츄', { set: { silhouette: 'knight_plate', shoulders: 'balloon' } }, []).ch.shoulders, null, 'strict 가 아니면 조용히 비운다');
assert.throws(() => M.choose('피카츄', { set: { legs: 'jetpack' } }, []), e => e.code === 'value');
assert.throws(() => M.choose('피카츄', { set: { wings: 'x' } }, []), e => e.code === 'slot');
assert.throws(() => M.choose('없는포켓몬', {}, []), e => e.code === 'card');
/* 타입 표현 — 다 · 표현마다 타입 · 한 타입으로 · 섞기 · 틀린 값 */
assert.equal(M.choose('잠만보', { fx: 'all' }, []).ch.fx.length, 7);
assert.deepEqual(M.choose('갸라도스', { fx: [{ key: 'hand', type: 'flying' }, { key: 'aura', type: 'water' }] }, []).ch.fx, [{ key: 'hand', type: 'flying' }, { key: 'aura', type: 'water' }]);
assert(M.choose('갸라도스', { fx: [{ key: 'hand' }, { key: 'ground' }], fxType: 'flying' }, []).ch.fx.every(f => f.type === 'flying'), '한 타입으로');
assert.deepEqual([...new Set(M.choose('팬텀', { fx: [{ key: 'hand' }, { key: 'seams' }, { key: 'orbit' }, { key: 'ground' }], mix: true }, []).ch.fx.map(f => f.type))].sort(), ['ghost', 'poison'], '섞기 — 두 타입 다');
assert(M.choose('피카츄', { fx: [{ key: 'hand' }, { key: 'aura' }], mix: true }, []).ch.fx.every(f => f.type === 'electric'), '한 타입 종은 섞어도 그 타입');
assert.throws(() => M.choose('팬텀', { fx: [{ key: 'aura', type: 'water' }] }, []), e => e.code === 'type');
assert.throws(() => M.choose('팬텀', { fx: [{ key: 'laser' }] }, []), e => e.code === 'fx');
assert.throws(() => M.choose('팬텀', { fx: [{ key: 'aura' }, { key: 'aura' }] }, []), e => e.code === 'fx.twice');
/* 배치 — 큰 실루엣이 서로 겹치지 않는다(지시문 묶음이 최근 실루엣을 넘긴다) */
for (let i = 0; i < 20; i++) {
  const used = [];
  for (const card of Object.keys(C.species)) used.push(M.choose(card, { seed: 'b' + i }, used).ch.silhouette);
  assert.equal(new Set(used).size, used.length, '배치 실루엣 겹침 ' + used.join(' '));
}
/* 자동 초안(2026-11-06) — 표에 없는 종은 공방 자료로. 1025종 다 고를 수 있고, 손글 종이 이긴다, 원작 특징이 정하는 칸은 비운다 */
let na = 0;
for (const nm of Object.keys(CARDS)) {
  const sp = M.speciesOf(nm); assert(sp, nm + ' 초안');
  if (C.species[nm]) { assert(!sp.auto, nm + ' 손글이 이긴다'); continue; }
  assert(sp.types.every(x => C.types[x]), nm + ' 타입');
  const r = M.choose(nm, { mix: true, strict: false }, []);   /* 지시문 묶음이 부르는 꼴 */
  for (const k of sp.owns) assert.equal(r.ch[k], null, nm + ' ' + k + ' 은 원작 특징이 정한다');
  na++;
}
assert(na > 1000, '자동 초안 ' + na);

/* 생성기 「새 인물 만들기」 의 메카 옵션(2026-11-06) — 조립부(lib/prompt-anthro.js)가 FORM · ARMOR 줄 바로 뒤에 lines 만 싣는다. 안 고르면 · 표가 없으면 · 이어가기면 그대로 */
{
  const ST = W.AtelierPromptState, S = W.AtelierSpec;
  const card = read('card.json').cards.character.find(c => c.name === '갸라도스');
  const tree = read('casual-tree.json'), nz = x => ST.normalize(S, W.AtelierCasualTree, x, tree), st0 = nz({});
  const pr = (st, table) => ST.prompt(W.AtelierPrompt, W.AtelierLifestyle, st, card, undefined, null, tree, null, table);
  const sel = { set: { silhouette: 'knight_plate', legs: 'heels', shoulders: 'balloon' }, fx: [{ key: 'aura', type: 'flying' }, { key: 'hand', type: '' }] };
  const want = CML.lines(C, ['water', 'flying'], sel);
  assert.equal(want.length, 2);
  assert(want[1].indexOf('TYPE EFFECTS: One open hand') === 0 && want[1].includes('pale sky-blue glow'), '표현 순서는 표 순서 · 오라는 비행');
  /* 줄 꼴(칸 꼴 스위치를 끈 판 — 2026-11-11 부터 지시문은 칸 꼴, 줄 꼴은 S.SECTIONS.on=false 로 남아 있다) — FORM · ARMOR 문단 바로 뒤 */
  S.SECTIONS.on = false;
  { const withM = pr(nz({ mecha: sel }), C), base = pr(st0, C);
    const paras = withM.split('\n\n'), i = paras.indexOf(want[0]);
    assert.equal(paras[i - 2], S.FORM_LINES.light, 'FORM 줄 · ARMOR 줄 뒤'); assert.equal(paras[i - 1], S.PROMPT_LINES.armor, 'ARMOR 줄(2026-11-08) 바로 뒤'); assert.equal(paras[i + 1], want[1]);
    assert.equal(paras.filter((x, k) => k !== i && k !== i + 1).join('\n\n'), base, '두 줄 말고는 그대로');
    assert.equal(pr(nz({ mecha: sel }), null), base, '표가 없으면 안 싣는다');
    assert.equal(pr(nz({ mecha: { set: {}, fx: [] } }), C), base, '안 고르면 그대로');
    assert(!/MECHA|TYPE EFFECTS/.test(pr(nz({ mecha: sel, identityMode: 'reference' }), C)), '이어가기에는 없다'); }
  S.SECTIONS.on = true;
  /* 칸 꼴(실제로 나가는 지시문) — 실루엣은 3칸 「Silhouette:」 로 Armor 줄 바로 뒤, 타입 표현은 4칸 「Type effects:」. 글은 lines 그대로, 두 줄 말고는 그대로 */
  { const withM = pr(nz({ mecha: sel }), C), base = pr(st0, C), CF = S.CORE_FRAME;
    const sil = 'Silhouette: ' + want[0].replace(/^MECHA SILHOUETTE: /, ''), fx = 'Type effects: ' + want[1].replace(/^TYPE EFFECTS: /, '');
    const B = withM.split('\n\n'), b3 = B[3].split('\n'), b4 = B[4].split('\n'), i = b3.indexOf(sil);
    assert(B.length === 6 && B[1].startsWith(CF.s1 + '\n') && b3[0] === CF.s3.replace('{costume}', S.SECTIONS.costume).replace('{genre}', 'LIGHT'), '칸 꼴');
    assert(i > 1 && b3[i - 2] === 'Costume: ' + S.FORM_LINES.light.replace(/^FORM — LIGHT: /, '') && b3[i - 1] === 'Armor: ' + S.PROMPT_LINES.armor.replace(/^ARMOR: /, ''), '3칸 — Costume · Armor 줄 바로 뒤에 Silhouette');
    assert(b4.includes(fx), '4칸에 Type effects');
    assert.equal(withM.split('\n').filter(l => l !== sil && l !== fx).join('\n'), base, '두 줄 말고는 그대로(칸 꼴)');
    assert.equal(pr(nz({ mecha: sel }), null), base, '표가 없으면 안 싣는다(칸 꼴)');
    assert.equal(pr(nz({ mecha: { set: {}, fx: [] } }), C), base, '안 고르면 그대로(칸 꼴)');
    const ref = pr(nz({ mecha: sel, identityMode: 'reference' }), C);
    assert(ref.startsWith('Input: the attached image') && !/^(?:Silhouette|Type effects|MECHA|TYPE EFFECTS)\b/m.test(ref) && !ref.includes(want[0].replace(/^MECHA SILHOUETTE: /, '')), '이어가기에는 없다(칸 꼴)'); }
  assert(C.silhouettes.find(o => o.key === 'knight_plate').owns.includes('shoulders'));
  assert(!want[0].includes(C.parts.shoulders.find(o => o.key === 'balloon').en), '실루엣이 정하는 칸은 안 싣는다');
  assert.equal(nz({ mode: 'concept', concept: { set: {} } }).mode, 'action', '잠깐 있던 갈래는 액션으로');
}
console.log('PASS 메카 옵션: 칸 ' + SLOTS.length + ' · 큰 실루엣 ' + C.silhouettes.length + ' · 손글 종 ' + Object.keys(C.species).length + ' × 자동 ' + n + ' · 자동 초안 ' + na + ' · 직접 고르기 · 겹치는 칸 · 타입 표현 · 배치 안 겹침 · 옵션 줄 자리 · 명령줄 도구 없음');
