#!/usr/bin/env node
/* 비슷한 등록 ① 찾기(2026-11-18 사용자 「응 허용하고 이순서대로 진행해줘」 — 세계컷 GPT 설계안 3단계, 삼국지 · 원소 공방과 같은 꼴).
   ① 임의 설계 주문(lib/prompt-anthro.js buildFree)에 「우리 설계와 가장 비슷한 등록작 — 이것들과도 다르게」 줄을 넣으려고,
   이 카드의 우리 설계(얼굴 설계표 data/face-design.json — 얼굴형 · 턱 · 눈매 · 눈썹 · 헤어스타일, 메카 실루엣)와 ① 이 등록된 다른 카드를 견준다.
     - 우리 설계로 등록된 ①: 같은 칸 수(여섯 칸 중) — 실루엣은 그림 저장소 기록(records/<폴더>/light-ui.json storage.cards[카드].mecha.set.silhouette)
     - GPT 설계로 등록된 ①(기록 generation.design gpt_free): 기록의 설계 요약(generation.summary — 없으면 free_prompt 의 SUMMARY: 줄)과 우리 요약의 낱말 겹침 × 6
   점수 3 이상에서 높은 차례로 n 개(기본 3).

   node tools/design-near.cjs <카드> [--sil <실루엣 열쇠>] [--n 3]
   require('./design-near.cjs').near(<카드>, { sil, n }) → ['<영어 이름> — <요약>', …] */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.join(__dirname, '..'), read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const REPOS = ['pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3', 'pkm-atelier-img-4', 'pkm-atelier-img-5'].map(n => path.join(ROOT, '..', n, 'records'));
const KEYS = ['face shape', 'jaw & chin', 'eye shape', 'eyebrows', 'hairstyle', 'sil'];
const words = t => new Set(String(t || '').toLowerCase().replace(/[^a-z ]+/g, ' ').split(/\s+/).filter(w => w.length > 2 && !/^(and|the|with|her|face|eyes|brows|expression|hair|armor|silhouette|outline|shape)$/.test(w)));
const jac = (a, b) => { const A = words(a), B = words(b); if (!A.size || !B.size) return 0; let n = 0; A.forEach(w => { if (B.has(w)) n++; }); return n / (A.size + B.size - n); };
let REC = null;
/* 기록의 ① — 카드 이름 → { sil, gpt(요약 글 | null) }. 같은 카드가 여럿이면 나중 폴더 */
function records() {
  if (REC) return REC;
  REC = {};
  for (const dir of REPOS) {
    if (!fs.existsSync(dir)) continue;
    for (const k of fs.readdirSync(dir).sort()) {
      const f = path.join(dir, k, 'light-ui.json'); if (!fs.existsSync(f)) continue;
      let r; try { r = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
      const cards = ((r.storage || {}).cards) || {}, g = r.generation || {};
      for (const name of Object.keys(cards)) {
        const sil = ((((cards[name] || {}).mecha || {}).set) || {}).silhouette || '';
        const gpt = (g.design || r.design) === 'gpt_free' ? (g.summary || ((/^SUMMARY:\s*(.+)$/m.exec(String(g.free_prompt || '')) || [])[1] || '')).trim() : null;
        REC[name] = { sil, gpt };
      }
    }
  }
  return REC;
}
function keysOf(face, sil) { const f = (face && face.face) || {}; return { 'face shape': f['face shape'] || '', 'jaw & chin': f['jaw & chin'] || '', 'eye shape': f['eye shape'] || '', eyebrows: f.eyebrows || '', hairstyle: ((face && face.hair) || {}).hairstyle || '', sil: sil || '' }; }
function summary(k) {
  const x = v => String(v || '').replace(/_/g, ' ');
  const face = [k['face shape'] && k['face shape'] + ' face', k['jaw & chin']].filter(Boolean).join(', '), eyes = [k['eye shape'] && k['eye shape'] + ' eyes', k.eyebrows].filter(Boolean).join(', ');
  return [face && 'face — ' + face, eyes && 'eyes and brows — ' + eyes, k.hairstyle && 'hair — ' + x(k.hairstyle), k.sil && 'armor silhouette — ' + x(k.sil)].filter(Boolean).join('; ');
}
function near(name, o = {}) {
  const F = read('face-design.json'), IMG = read('img.json'), n = o.n || 3;
  const byName = {}; Object.values(F.faces || {}).forEach(f => { byName[f.name] = f; });
  const R = records(), mk = keysOf(byName[name], o.sil || (R[name] || {}).sil), ms = summary(mk), out = [];
  for (const other of Object.keys(IMG.img || {})) {
    if (other === name) continue;
    const st = (IMG.img[other] || {}).byStyle || {};
    if (!Object.keys(st).some(s => (((st[s].byForm || {}).light) || {}).f)) continue;
    const rec = R[other] || {}, face = byName[other];
    let score, text;
    if (rec.gpt != null) { if (!rec.gpt) continue; text = rec.gpt; score = jac(ms, text) * KEYS.length; }
    else { if (!face) continue; const k = keysOf(face, rec.sil); score = KEYS.filter(x => k[x] && k[x] === mk[x]).length; text = summary(k); }
    if (score >= 3) out.push({ score, line: (face ? face.en : other) + ' — ' + text });
  }
  out.sort((a, b) => b.score - a.score);
  return [...new Set(out.map(x => x.line))].slice(0, n);
}
module.exports = { near, summary };
if (require.main === module) {
  const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : ''; };
  const r = near(a[0], { sil: opt('--sil'), n: Number(opt('--n')) || 3 });
  console.log(r.length ? r.map((x, j) => (j + 1) + ') ' + x).join('\n') : '(비슷한 등록작 없음 — 점수 3 미만)');
}
