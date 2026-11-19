#!/usr/bin/env node
/* ① GPT 임의 설계 칸 채우기 검사(2026-11-18 사용자 「크게는 우리거를 따르는데, 헤어스타일, 의상은 무조건 다르게 … 의상만 우리 실루엣 안에서만 고르게하고」 → 「응 이대로 진행해줘」 — 삼국지 · 원소 공방과 같은 꼴).
   설계 주문(light-free.txt — lib/prompt-anthro.js buildFree)의 우리 경장 지시문에서 표시한 칸([HAIRSTYLE: …] · [ARMOR SILHOUETTE: …] · [TYPE EFFECTS: …] · [BODY TYPE: …](우리 체형 목록 글 그대로) · 얼굴 칸 일곱(우리 것 뺀 목록 글 그대로, 두 장도 칸마다 다르게 — 2026-11-19) · Design idea · Setting detail)과
   Face · Impression 줄만 바뀌었는지, 타입 효과([TYPE EFFECTS: …])가 우리 표의 손 · 몸 · 주변 문장 하나씩인지, 헤어스타일이 우리와 다른지, 실루엣이 목록 글 그대로인지, 첫 줄이 SUMMARY 인지 본다. 틀리면 1.

   node tools/world-fill-check.cjs <지시문 묶음 폴더> <채운 글> [--other <다른 GPT 설계 글>]
   (묶음 폴더의 light-prompt.txt · light-ui.json 과 data/concept-mecha.json 을 읽는다) */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
global.window = global;
for (const f of ['prompt-spec', 'casual-tree', 'casual-tree-v2', 'prompt-anthro']) require(path.join(ROOT, 'lib', f + '.js'));
const P = window.AtelierPrompt;
const a = process.argv.slice(2), opt = k => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
const [dir, file] = a.filter((x, i) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
if (!dir || !file) { console.error('node tools/world-fill-check.cjs <지시문 묶음 폴더> <채운 글> [--other <글>]'); process.exit(2); }
const text = fs.readFileSync(path.join(dir, 'light-prompt.txt'), 'utf8').replace(/\n$/, '');
const cards = ((JSON.parse(fs.readFileSync(path.join(dir, 'light-ui.json'), 'utf8')).storage || {}).cards) || {};
const st = cards[Object.keys(cards)[0]] || {}, concept = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'concept-mecha.json'), 'utf8'));
const errs = P.freeFillErrors(text, st, concept, fs.readFileSync(file, 'utf8'), opt('--other') ? fs.readFileSync(opt('--other'), 'utf8') : null);
if (errs.length) { console.log('✗ ' + errs.join('\n✗ ')); process.exit(1); }
console.log('통과 — 칸만 채웠다');
