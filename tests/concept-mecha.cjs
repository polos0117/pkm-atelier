/* 2D MMORPG 메카 컨셉 — 부품 표(data/concept-mecha.json) · 지시문(tools/concept-mecha.cjs)
   표의 열쇠 · 실루엣 owns · 종 · 자동 · 랜덤 · --set · 겹치는 칸 막기 · 배치 안 실루엣 안 겹침 · 빈 칸 · 무기 · 카메라 */
'use strict';
const assert = require('node:assert/strict'), path = require('node:path');
const M = require(path.join(__dirname, '..', 'tools', 'concept-mecha.cjs')), C = M.C;
const SLOTS = C.slots.map(s => s.key), base = { set: [], random: false, seed: '' };

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

let n = 0;
for (const card of Object.keys(C.species)) {
  const sp = C.species[card];
  for (const t of sp.types) assert(C.types[t], card + ' 타입 ' + t);
  for (let i = 0; i < 30; i++) {
    const o = { ...base, seed: 's' + i, random: i % 2 === 1 }, r = M.choose(card, o, []), txt = M.build(card, r.ch);
    assert(!/\{[A-Z_]+\}|undefined|null|: ,|, ,|; ,/.test(txt), card + ' 빈 칸 ' + i);
    const fk = r.ch.fx.map(x => x.key);
    assert.equal(fk[0], 'hand', card + ' 자동은 손 + 몸 + 주변'); assert.equal(fk.length, 3);
    assert(r.ch.fx.every(x => x.type === sp.types[0]), card + ' 기본은 첫 타입');
    assert(!fk.includes('hair'), card + ' 머리끝 입자는 고를 때만 ' + i);
    assert(/relaxed beside her\. [A-Z][^.]*\. [A-Z][^.]*\. CAMERA:/.test(txt) && txt.includes(sp.HAND_EFFECT), card + ' 손(종의 손 효과) + 두 문장 ' + i);
    assert(txt.includes('CAMERA: camera level with her face') && txt.includes('no weapons') && txt.includes('Her two human hands are uncovered'), card + ' 고정 줄');
    assert(!/\ban? ((?!and\b)[\w-]+ ){0,2}(eyes|lips)\b/.test(txt.split('COSTUME:')[0]), card + ' 복수에 관사 ' + i);
    const sil = C.silhouettes.find(s => s.key === r.ch.silhouette);
    for (const k of [...sil.owns, ...(sp.owns || [])]) assert.equal(r.ch[k], null, card + ' ' + k + ' 은 실루엣 · 원작이 정한다');
    for (const k of SLOTS) if (r.ch[k]) assert((k === 'silhouette' ? C.silhouettes : C.parts[k]).some(x => x.key === r.ch[k]), card + ' ' + k);
    n++;
  }
  /* 같은 씨앗이면 같은 글 */
  assert.equal(M.build(card, M.choose(card, { ...base, seed: 'x' }, []).ch), M.build(card, M.choose(card, { ...base, seed: 'x' }, []).ch), card + ' 씨앗');
}
/* 자동은 타입 추천 안에서 큰 실루엣을 고른다 */
for (const card of Object.keys(C.species)) {
  const pref = C.species[card].types.flatMap(t => (C.types[t] || {}).silhouette || []);
  for (let i = 0; i < 10; i++) assert(pref.includes(M.choose(card, { ...base, seed: 'p' + i }, []).ch.silhouette), card + ' 추천 실루엣');
}
/* --set — 칸마다 직접, 카드 하나만, 겹치는 칸은 막는다, 없는 값도 막는다 */
const s1 = M.choose('피카츄', { ...base, set: ['silhouette=wing_binder', '피카츄:legs=heels', '갸라도스:legs=round_toe'] }, []);
assert.equal(s1.ch.silhouette, 'wing_binder'); assert.equal(s1.ch.legs, 'heels'); assert.equal(s1.ch.back, null, '날개 바인더가 등을 정한다');
assert.throws(() => M.choose('피카츄', { ...base, set: ['silhouette=knight_plate', 'shoulders=balloon'] }, []), /실루엣 knight_plate/);
assert.throws(() => M.choose('피카츄', { ...base, set: ['head=crest'] }, []), /원작 특징/);
assert.throws(() => M.choose('피카츄', { ...base, set: ['legs=jetpack'] }, []), /없는 값/);
assert.throws(() => M.choose('없는포켓몬', base, []), /카드/);
/* 자동 초안(2026-11-06) — 표에 없는 종은 공방 자료로. 1025종 다 지어지고, 천(망토 · 띠 · 리본)은 판으로, 빈 칸 · 무기 없음, 손글 종이 이긴다 */
const CARDN = require(path.join(__dirname, '..', 'data', 'card.json'));
const names = []; (function walk(x) { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (x.name && x.en && x.no) names.push(x.name); Object.values(x).forEach(walk); } })(CARDN);
let na = 0;
for (const nm of [...new Set(names)]) {
  const sp = M.speciesOf(nm); assert(sp, nm + ' 초안');
  if (C.species[nm]) { assert(!sp.auto, nm + ' 손글이 이긴다'); continue; }
  const r = M.choose(nm, { ...base, seed: 'a' }, []), t = M.build(nm, r.ch);
  assert(!/\{[A-Z_]+\}|undefined|null|: ,|, ,|; ,/.test(t), nm + ' 빈 칸');
  const sig = t.split("identity is unmistakable: ")[1].split('\n')[0];
  const after = sig.split(/\bbecomes?\b/).slice(1).map(x => x.split(/, the /)[0]).join(' | ');   /* 바뀐 뒤 쪽만 — 원작 특징 이름(리본 같은)은 그대로 */
  assert(!/\b(cape|sash|ribbons?)\b/.test(after) && !/(^|[^e]) mantle\b/.test(after), nm + ' 천 → 판 ' + after.slice(0, 160));
  assert(sp.types.every(x => C.types[x]), nm + ' 타입');
  for (const k of sp.owns) assert.equal(r.ch[k], null, nm + ' ' + k + ' 은 원작 특징이 정한다');
  na++;
}
assert(na > 1000, '자동 초안 ' + na);
/* 주색 · 머리색은 대표 색(꼬부기 — 팔레트 첫 색이 등딱지 갈색이었다) */
const sq = M.autoSpecies('꼬부기'); assert(sq.HAIR.startsWith('Sky-blue') && sq.COLOURS.startsWith('sky-blue-and-') && sq.KEY_COLOUR === 'sky-blue', '꼬부기 주색 ' + sq.HAIR + ' / ' + sq.COLOURS);
for (const nm of ['이상해씨', '리자몽', '뮤츠', '님피아', '꼬부기']) assert(!/hair in (long|loose|shoulder-length)[^,]* hair/.test(M.autoSpecies(nm).HAIR), nm + ' 머리 문장 ' + M.autoSpecies(nm).HAIR);
/* 타입 표현 — 하나만 · 다 · 손 없이 · 표현마다 타입 · 한 타입으로 · 섞기 · 틀린 값 */
const fxB = (card, o) => { const r = M.choose(card, { ...base, ...o }, []); return { r, t: M.build(card, r.ch) }; };
let x = fxB('팬텀', { fx: ['aura'] });
assert.deepEqual(x.r.ch.fx, [{ key: 'aura', type: 'ghost' }]); assert(x.t.includes(C.hands_rest + '. Her whole silhouette is outlined by a ghostly violet glow with flickering spectral flames, clearly visible as a bright rim of light along her body and armor. CAMERA:'), '하나만 · 손 없이');
x = fxB('잠만보', { fx: ['all'] });
assert.equal(x.r.ch.fx.length, 7); assert(x.t.includes(C.species['잠만보'].HAND_EFFECT) && x.t.includes('warm light spreads over the floor') && x.t.includes('streams back from her heels'), '다');
x = fxB('갸라도스', { fx: ['hand:flying,aura:water,orbit:flying'] });
assert(x.t.includes('one open hand conjuring a pale sky-blue glow with white wind streaks amid swirling streaks of wind') && x.t.includes('outlined by a cyan-blue water glow, clearly visible') && x.t.includes('Swirling streaks of wind and small drifting white feathers circle'), '표현마다 타입(둘째 타입 손은 낱말로)');
x = fxB('갸라도스', { fx: ['hand,ground'], fxType: ['flying'] });
assert(x.r.ch.fx.every(f => f.type === 'flying') && x.t.includes('A swirl of wind sweeps the floor'), '한 타입으로');
x = fxB('팬텀', { fx: ['hand,seams,orbit,ground'], mix: true });
assert.deepEqual([...new Set(x.r.ch.fx.map(f => f.type))].sort(), ['ghost', 'poison'], '섞기 — 두 타입 다');
x = fxB('피카츄', { fx: ['hand,aura'], mix: true }); assert(x.r.ch.fx.every(f => f.type === 'electric'), '한 타입 종은 섞어도 그 타입');
x = fxB('팬텀', { fx: ['팬텀=hair', '피카츄'], set: [] }); assert.deepEqual(x.r.ch.fx.map(f => f.key), ['hair'], '카드=표현 · 머리끝은 고르면 실린다'); assert(x.t.includes('The tips of her hair glow brightly'));
assert.throws(() => fxB('팬텀', { fx: ['aura:water'] }), /팬텀 의 타입은/);
assert.throws(() => fxB('팬텀', { fxType: ['fire'] }), /팬텀 의 타입은/);
assert.throws(() => fxB('팬텀', { fx: ['laser'] }), /없는 타입 표현/);
assert.throws(() => fxB('팬텀', { fx: ['aura,aura'] }), /두 번/);
assert.throws(() => fxB('팬텀', { set: ['fx_body=none'] }), /--fx/);
/* 배치 — 큰 실루엣이 서로 겹치지 않는다 */
for (let i = 0; i < 20; i++) {
  const used = [];
  for (const card of Object.keys(C.species)) used.push(M.choose(card, { ...base, seed: 'b' + i }, used).ch.silhouette);
  assert.equal(new Set(used).size, used.length, '배치 실루엣 겹침 ' + used.join(' '));
}
/* 화풍(2026-11-06) — 기본은 2D 한국 MMORPG, jp25d 는 첫 줄 · STYLE · 끝맺음만 바뀐다 */
assert.equal(C.style_default, 'gloss_daylight'); assert.deepEqual(Object.keys(C.styles), ['mmorpg2d', 'jp25d', 'anime_gloss', 'gloss_daylight']);   // 2026-11-07 기본 광택 자연광
for (const [k, v] of Object.entries(C.styles)) assert(v.ko && v.head && v.style && v.close.includes('{KEY_COLOUR}'), k + ' 화풍 칸');
for (const card of Object.keys(C.species)) {
  const ch = M.choose(card, { ...base, seed: 'st' }, []).ch, k = M.build(card, ch, 'mmorpg2d'), j = M.build(card, ch, 'jp25d');
  assert.equal(M.build(card, ch), M.build(card, ch, 'gloss_daylight'), card + ' 기본 화풍');
  assert(M.build(card, ch).includes('Strong glossy shine') && M.build(card, ch).includes('Natural sunlit daylight'), card + ' 광택 자연광');
  assert(M.build(card, ch, 'anime_gloss').includes('natural sunlit sheen'), card + ' 애니 광택은 그대로');
  assert(k.includes('premium 2D Korean MMORPG official character illustration style') && k.includes('rich ' + C.species[card].KEY_COLOUR + ' colours, polished 2D Korean MMORPG character key art.'), card + ' 2D');
  assert(j.includes('high-quality Japanese 2.5D mobile-game') && j.includes('STYLE: Premium Japanese mobile RPG') && j.includes('premium Japanese 2.5D mobile RPG character key art.') && !/Korean|MMORPG/.test(j) && !/amber|rounded jaw/.test(j.split('\n\n').find(p => p.startsWith('STYLE:'))), card + ' 2.5D(STYLE 에 피카츄 전용 말 없음)');
  const strip = t => t.split('\n\n').filter(p => !/^(Use case|STYLE):/.test(p)).join('\n\n').replace(/Bright clear lighting.*$|Clear character silhouette against.*$/m, '');
  assert.equal(strip(j), strip(k), card + ' 화풍 말고는 같다');
}
assert.throws(() => M.build('피카츄', M.choose('피카츄', base, []).ch, 'oil'), /없는 화풍/);
/* 얼굴 — face-design 에서 */
assert.match(M.faceText(130), /^an elongated, long and medium-width shape, an angular defined jaw, medium-sized sharp eyes/);
/* 생성기 「새 인물 만들기」 의 메카 옵션(2026-11-06) — 조립부(lib/prompt-anthro.js)가 FORM 줄 바로 뒤에 lines 만 싣는다. 안 고르면 · 표가 없으면 · 이어가기면 그대로 */
{
  const ROOT = path.join(__dirname, '..');
  for (const f of ['prompt-spec', 'casual-tree', 'prompt-anthro', 'prompt-lifestyle', 'prompt-state']) require(path.join(ROOT, 'lib', f + '.js'));
  const W = global.window, ST = W.AtelierPromptState, S = W.AtelierSpec, CML = require(path.join(ROOT, 'lib', 'concept-mecha.js'));
  const card = require(path.join(ROOT, 'data', 'card.json')).cards.character.find(c => c.name === '갸라도스');
  const tree = require(path.join(ROOT, 'data', 'casual-tree.json')), nz = x => ST.normalize(S, W.AtelierCasualTree, x, tree), st0 = nz({});
  const pr = (st, table) => ST.prompt(W.AtelierPrompt, W.AtelierLifestyle, st, card, undefined, null, tree, null, table);
  const sel = { set: { silhouette: 'knight_plate', legs: 'heels', shoulders: 'balloon' }, fx: [{ key: 'aura', type: 'flying' }, { key: 'hand', type: '' }] };
  const want = CML.lines(C, ['water', 'flying'], sel), withM = pr(nz({ mecha: sel }), C), base = pr(st0, C);
  assert.equal(want.length, 2);
  assert(want[1].indexOf('TYPE EFFECTS: One open hand') === 0 && want[1].includes('pale sky-blue glow'), '표현 순서는 표 순서 · 오라는 비행');
  const paras = withM.split('\n\n'), i = paras.indexOf(want[0]);
  assert.equal(paras[i - 1], S.FORM_LINES.light, 'FORM 줄 바로 뒤'); assert.equal(paras[i + 1], want[1]);
  assert.equal(paras.filter((x, k) => k !== i && k !== i + 1).join('\n\n'), base, '두 줄 말고는 그대로');
  assert.equal(pr(nz({ mecha: sel }), null), base, '표가 없으면 안 싣는다');
  assert.equal(pr(nz({ mecha: { set: {}, fx: [] } }), C), base, '안 고르면 그대로');
  assert(!/MECHA|TYPE EFFECTS/.test(pr(nz({ mecha: sel, identityMode: 'reference' }), C)), '이어가기에는 없다');
  assert(C.silhouettes.find(o => o.key === 'knight_plate').owns.includes('shoulders'));
  assert(!want[0].includes(C.parts.shoulders.find(o => o.key === 'balloon').en), '실루엣이 정하는 칸은 안 싣는다');
  assert.equal(nz({ mode: 'concept', concept: { set: {} } }).mode, 'action', '잠깐 있던 갈래는 액션으로');
}
console.log('PASS 메카 컨셉: 칸 ' + SLOTS.length + ' · 큰 실루엣 ' + C.silhouettes.length + ' · 종 ' + Object.keys(C.species).length + ' × 자동 · 랜덤 ' + n + ' 지시문 · 추천 · --set · 겹치는 칸 막기 · 배치 안 겹침 · 얼굴');
