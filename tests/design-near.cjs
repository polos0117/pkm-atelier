/* 비슷한 등록 ① 찾기(tools/design-near.cjs, 2026-11-18 세계컷 GPT 설계안 3단계) */
const assert = require('node:assert'), N = require('../tools/design-near.cjs');
const r = N.near('강철톤', { sil: 'power_limbs' });
assert(Array.isArray(r) && r.length <= 3 && r.every(x => / — face — /.test(x) && !/— ;|— $/.test(x)) && !r.some(x => /^Steelix /.test(x)), '셋까지 · 자기 빼고 · 빈 칸 없음 ' + JSON.stringify(r));
assert.equal(N.summary({ 'face shape': 'oval', 'jaw & chin': '', 'eye shape': 'almond', eyebrows: '', hairstyle: '', sil: 'heavy_assault' }), 'face — oval face; eyes and brows — almond eyes; armor silhouette — heavy assault', '요약 꼴');
console.log('PASS 비슷한 등록 ①: 셋까지 · 자기 빼고 · 요약 꼴(' + r.length + ')');
