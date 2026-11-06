/* 2D MMORPG 메카 컨셉 — 부품 표(data/concept-mecha.json) · 지시문(tools/concept-mecha.cjs)
   표의 열쇠 · 실루엣 owns · 종 · 자동 · 랜덤 · --set · 겹치는 칸 막기 · 배치 안 실루엣 안 겹침 · 빈 칸 · 무기 · 카메라 */
'use strict';
const assert = require('node:assert/strict'), path = require('node:path');
const M = require(path.join(__dirname, '..', 'tools', 'concept-mecha.cjs')), C = M.C;
const SLOTS = C.slots.map(s => s.key), base = { set: [], random: false, seed: '' };

/* 표 — 칸마다 값이 있고 열쇠가 겹치지 않으며, owns 는 있는 칸만 */
assert.deepEqual(SLOTS, ['silhouette', 'weight', 'shoulders', 'chest', 'arms', 'hips', 'legs', 'back', 'head', 'fx_body', 'fx_space']);
/* 타입 표현(2026-11-06) — 18 타입마다 빛 · 입자 · 바닥 낱말 */
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
    if (!o.random || r.ch.fx_body !== 'none') assert(r.ch.fx_body !== 'none' && r.ch.fx_space !== 'none', card + ' 자동은 타입 표현을 싣는다');
    if (r.ch.fx_body === 'hair') assert(!['orbit', 'trail'].includes(r.ch.fx_space), card + ' 같은 입자 두 번 ' + i);
    assert(/relaxed beside her\. [A-Z][^.]*\. [A-Z][^.]*\. CAMERA:/.test(txt), card + ' 타입 표현 두 문장 ' + i);
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
assert.throws(() => M.choose('뮤츠', base, []), /컨셉 표/);
const nofx = M.build('팬텀', M.choose('팬텀', { ...base, set: ['fx_body=none', 'fx_space=none'] }, []).ch);
assert(nofx.includes('relaxed beside her. CAMERA:'), '타입 표현을 뺄 수 있다');
assert(M.build('잠만보', M.choose('잠만보', { ...base, set: ['fx_space=ground'] }, []).ch).includes('warm light spreads over the floor'), '첫 타입 낱말');
/* 배치 — 큰 실루엣이 서로 겹치지 않는다 */
for (let i = 0; i < 20; i++) {
  const used = [];
  for (const card of Object.keys(C.species)) used.push(M.choose(card, { ...base, seed: 'b' + i }, used).ch.silhouette);
  assert.equal(new Set(used).size, used.length, '배치 실루엣 겹침 ' + used.join(' '));
}
/* 얼굴 — face-design 에서 */
assert.match(M.faceText(130), /^an elongated, long and medium-width shape, an angular defined jaw, medium-sized sharp eyes/);
console.log('PASS 메카 컨셉: 칸 ' + SLOTS.length + ' · 큰 실루엣 ' + C.silhouettes.length + ' · 종 ' + Object.keys(C.species).length + ' × 자동 · 랜덤 ' + n + ' 지시문 · 추천 · --set · 겹치는 칸 막기 · 배치 안 겹침 · 얼굴');
