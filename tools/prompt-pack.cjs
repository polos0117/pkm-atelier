#!/usr/bin/env node
/* 지시문 묶음 — 브라우저 없이 생성기와 같은 지시문·저장값을 파일로(2026-10-29, 사용자 「브라우저에서 하라고 시켰는데 파일로 정리해서 읽게 하는게 더 좋을거 같아」).
   생성기 화면이 쓰는 상태 코드(lib/prompt-state.js)와 조립부(lib/prompt-anthro.js · lib/prompt-lifestyle.js)를 그대로 불러
   한 캐릭터 아홉 자리(IMAGE_RULES 3절 표)의 지시문(<자리>-prompt.txt)과 생성기 저장값(<자리>-ui.json — 화면의 storage 와 같은 꼴)을 쓴다.
   글자 하나 다르지 않은지는 tests/prompt-pack-screen.cjs 가 실제 생성기 화면과 견준다.

   2026-11-07 여덟 자리(사용자 「gpt 생성룰을 이제 지금 화풍(애니광택)으로 해서 경장1장만 만들자」 · 「필수3 코스튬1 자유3」):
     경장 ① 한 장 + 일상컷 아홉 장(2026-11-09 — 필수 셋 · 코스튬 · 상황 노출 · 자유 넷), 화풍 기본 anime_25d_gloss(생성기 기본과 같다 — 2026-11-08). ① 의 메카 큰 실루엣 · 타입 표현은 init 이 정해 settings 에 적는다(아래 mecha).
     settings.version 4 가 열한 자리(경장 + 일상 열 — 2026-11-11 갈래 · 상황 자유 한 장 더), version 3 은 열 자리(경장 + 일상 아홉 — 11-11 까지 만든 묶음), version 2 는 여덟 자리(일상 일곱 — 11-08 까지 만든 묶음), version 1(예전 · --legacy)은 아홉 자리 그대로 build 한다.

   node tools/prompt-pack.cjs init <카드> --dir <작업 폴더> [--style <화풍 키>] [--plan PLAN.json] [--legacy] [--repos <그림 저장소> …]
     작업 폴더에 settings.json(고칠 수 있는 칸만)을 만든다 — 이미 있으면 덮지 않고 멈춘다.
     --plan 은 일상컷 계획기(tools/casual-plan.cjs --out)의 계획 파일. 일상 컷의 선택값은 계획에서만 온다(settings 에 안 쓴다).
     mecha — 그 종의 타입 추천 안에서 최근 열 명의 ①(그림 저장소 records/<폴더>/light-ui.json)이 안 쓴 큰 실루엣 하나 + 타입 표현 자동
       (손 + 몸 하나 + 주변 하나, 두 타입 종은 섞는다 — lib/concept-mecha.js choose). 부위 부품은 비운다(원작 입는 법 WEAR 가 부위를 쥔다).
       mecha_auto 는 정한 값 그대로(build 는 안 읽는다) — mecha 를 바꾸면 mecha_why 에 사유를 쓴다.
   node tools/prompt-pack.cjs build --dir <작업 폴더> [--slot <자리>]
     settings.json 을 읽어 지시문·저장값·차례표(INDEX.md)를 쓴다. 틀린 칸(없는 열쇠·표에 없는 값·사유 없는 직접 입력·계획에 없는 컷)이 있으면
     아무것도 쓰지 않고 1 로 끝난다. 다시 돌리면 같은 글이 나온다(만든 때 줄만 다르다).
   node tools/prompt-pack.cjs submitted --dir <작업 폴더> --slot <자리> --file <image_gen 에 넘긴 글 그대로>
     실제로 넘긴 글을 <자리>-submitted.txt 로 남기고 <자리>-prompt.txt 와 견준다(끝 공백만 무시). 결과는 submitted.json 에 자리마다 쌓는다.
     같으면 0, 다르면 1 — 빠진 줄·더해진 줄·화풍 줄(STYLE)이 남았는지를 찍는다. 2026-11-03 사용자 「문구를 받아들이는 모델 성능이 바뀐게 아닌가」 —
     세션이 지시문을 고쳐 쓰고 넘기는지 확인할 길이 없었다(기록엔 prompt.txt 의 sha 만 있었다).

   자리마다 고정인 것(출력·인물 기준·장갑 폼·폭주 기준 장갑·첨부)은 도구가 정한다 — settings 에 없다. 고칠 수 있는 칸:
     light               motifs · formOverride · headFeature · faceDesignOn · params(외형) · scene(장면 칸 — 비워 두는 것이 기본) · mecha · mecha_why(여덟 자리만)
     heavy · mobility    motifs · formOverride · scene
     *_overdrive         motifs · formOverride · custom(추가 연출 요청 — 생성기도 폭주엔 이 칸만 보인다)
     casual1~7(아홉 자리는 1~3)  scene · outfit · camera · custom(직접 입력) 과 why(칸마다 사유 — IMAGE_RULES 3절 4)
   일상 칸 옆 guide 에는 고른 길의 트리 문장(한글 이름·영어 문장·장소 묶음·자세 계열·의상 안내)과 옷 종류·드러내기·첫머리가 있고, INDEX.md 에도 컷마다 표로 찍는다.
   버전2 계획 컷(cut.treeV === 2 — 계획기 --v2, docs/CASUAL_TREE_V2.md)은 버전2 칸 그대로 잠그고 지시문도 버전2. 버전2 컷엔 자유 카메라 글이 없다
   (camera 는 카메라 높이 칸이다 — 조명 · 분위기는 custom 에). 버전1 계획 컷은 지금까지와 같다 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
global.window = global;
for (const f of ['prompt-spec', 'casual-tree', 'casual-tree-v2', 'prompt-anthro', 'prompt-lifestyle', 'casual-plan', 'prompt-state', 'concept-mecha']) require(path.join(ROOT, 'lib', f + '.js'));
const S = window.AtelierSpec, CT = window.AtelierCasualTree, C2 = window.AtelierCasualTreeV2, P = window.AtelierPrompt, L = window.AtelierLifestyle, CP = window.AtelierCasualPlan, ST = window.AtelierPromptState;
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));

/* 아홉 자리(예전 — settings.version 1) */
const NINE = {
  light: { n: '①', mode: 'action', form: 'light', identityMode: 'create', baseForm: 'light', attach: [], fields: ['motifs', 'formOverride', 'headFeature', 'faceDesignOn', 'params', 'scene', 'exposure', 'exposure_why'] },
  heavy: { n: '②', mode: 'action', form: 'heavy', identityMode: 'reference', baseForm: 'light', attach: ['light'], fields: ['motifs', 'formOverride', 'scene', 'exposure', 'exposure_why'] },
  mobility: { n: '③', mode: 'action', form: 'mobility', identityMode: 'reference', baseForm: 'light', attach: ['light'], fields: ['motifs', 'formOverride', 'scene', 'exposure', 'exposure_why'] },
  light_overdrive: { n: '④', mode: 'action', form: 'overdrive', identityMode: 'reference', baseForm: 'light', attach: ['light'], fields: ['motifs', 'formOverride', 'custom'] },
  heavy_overdrive: { n: '⑤', mode: 'action', form: 'overdrive', identityMode: 'reference', baseForm: 'heavy', attach: ['heavy', 'light?'], fields: ['motifs', 'formOverride', 'custom'] },
  mobility_overdrive: { n: '⑥', mode: 'action', form: 'overdrive', identityMode: 'reference', baseForm: 'mobility', attach: ['mobility', 'light?'], fields: ['motifs', 'formOverride', 'custom'] },
  casual1: { n: '⑦', mode: 'casual', cut: 1, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why', 'exposure', 'exposure_why'] },
  casual2: { n: '⑧', mode: 'casual', cut: 2, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why', 'exposure', 'exposure_why'] },
  casual3: { n: '⑨', mode: 'casual', cut: 3, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why', 'exposure', 'exposure_why'] }
};
/* 여덟 자리(2026-11-07 — settings.version 2) — 경장 ① + 일상 일곱. 2026-11-08 까지 만든 묶음 */
const SLOTS7 = { light: Object.assign({}, NINE.light, { fields: NINE.light.fields.concat(['mecha', 'mecha_why']) }) };
['②', '③', '④', '⑤', '⑥', '⑦', '⑧'].forEach((n, i) => { SLOTS7['casual' + (i + 1)] = { n, mode: 'casual', cut: i + 1, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why', 'exposure', 'exposure_why'] }; });
/* 열 자리(2026-11-09 — settings.version 3, IMAGE_RULES 3절 표) — 경장 ① + 일상 아홉(사용자 「일상컷 룰에 '상황으로 만들기'를 필수로 넣어주고, 거기는 일상컷 생성 수를 9장으로」).
   일상 칸 situ — 비우면 계획 그대로, "none" 은 상황 노출 컷이 노출을 낮춰도 막혔을 때만 상황을 뺀다(exposure_why 필요) */
const SLOTS9 = { light: SLOTS7.light };
['②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'].forEach((n, i) => { SLOTS9['casual' + (i + 1)] = { n, mode: 'casual', cut: i + 1, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why', 'exposure', 'exposure_why', 'situ'] }; });
/* 열한 자리(2026-11-11 — settings.version 4) — 경장 ① + 일상 열(아홉 + 갈래 · 상황 자유 한 장, 사용자 「gpt 담당 자유컷 1장더 추가해서 필수갈래랑 상황노출을 묶어서 우리쪽에 없는 목록으로 그리라고 넣어줘. 그러면 이제 일상컷 10장씩」) */
const SLOTS = Object.assign({}, SLOTS9, { casual10: Object.assign({}, SLOTS9.casual9, { n: '⑪', cut: 10 }) });
const slotsOf = set => (set && set.version >= 4 ? SLOTS : set && set.version === 3 ? SLOTS9 : set && set.version === 2 ? SLOTS7 : NINE);
const PACK_STYLE = S.DEFAULT_STYLE, LEGACY_STYLE = 'glossy_promo';   /* 여덟 자리의 기본 화풍 = 생성기 화면의 기본(anime_25d_gloss) · 아홉 자리(--legacy)는 그때 기본 */
const MECHA_RECENT = 10;
const ACTION_SCENE = ['expr', 'pose', 'orient', 'frame', 'lens', 'aspect', 'camera', 'scene', 'outfit', 'custom', 'action'];
const CASUAL_TEXT = ['scene', 'outfit', 'camera', 'custom'];
const CASUAL_TEXT_V2 = ['scene', 'outfit', 'custom'];
const keys = rows => rows.map(r => Array.isArray(r) ? r[0] : r.key).filter(v => v && v !== '__custom__');

function args(argv) {
  const o = { cmd: argv[0], card: '', dir: '', style: '', plan: '', slot: '', file: '', legacy: false,
    repos: ['pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3', 'pkm-atelier-img-4'].map(n => path.join(ROOT, '..', n)) };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--legacy') o.legacy = true;
    else if (a === '--repos') { o.repos = []; while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) o.repos.push(argv[++i]); }
    else if (a === '--dir') o.dir = argv[++i]; else if (a === '--style') o.style = argv[++i]; else if (a === '--plan') o.plan = argv[++i];
    else if (a === '--slot') o.slot = argv[++i]; else if (a === '--file') o.file = argv[++i]; else if (!a.startsWith('--') && !o.card) o.card = a;
    else throw new Error('모르는 인자: ' + a);
  }
  return o;
}
function data() {
  const cards = read('card.json').cards.character, tree = read('casual-tree.json'), tree2 = read('casual-tree-v2.json');
  const opt = f => { try { return read(f); } catch (e) { return null; } };
  return { cards, tree, tree2, v2: { C2, tree2 }, appearance: (opt('source-appearance.json') || {}).entries || null, faces: (opt('face-design.json') || {}).faces || null, concept: opt('concept-mecha.json') };
}
/* 화면과 같은 몫 — 원작 외형은 없으면 undefined, 얼굴 설계는 없으면 null(lib/prompt-ui.js App) */
const extras = (d, c) => ({ appearance: d.appearance ? d.appearance[String(c.no)] : undefined, face: d.faces ? d.faces[String(c.no)] || null : null });
const cardOf = (d, name) => d.cards.find(c => c.name === name);
/* 메카 조립부(lib/concept-mecha.js) — 자동 초안 종도 생성기와 같은 자료로 */
function cmOf(d) {
  if (!d.concept || !window.AtelierConceptMecha) return null;
  const byName = {}; d.cards.forEach(c => { byName[c.name] = c; });
  return window.AtelierConceptMecha.make(d.concept, { faces: d.faces || {}, appearance: d.appearance || {}, cards: byName, P });
}
/* 최근 ① 의 큰 실루엣 — 그림 저장소 records/<폴더>/light-ui.json 의 생성기 저장값(mecha). 폴더 끝 날짜(YYYYMMDD) 차례, 없는 저장소는 건너뛴다 */
function recentSilhouettes(repos, except) {
  const got = [];
  for (const r of repos || []) {
    const base = path.join(r, 'records');
    let dirs = [];
    try { dirs = fs.readdirSync(base); } catch (e) { continue; }
    for (const dname of dirs) {
      const f = path.join(base, dname, 'light-ui.json');
      let ui; try { ui = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
      const cards = ((ui.storage || {}).cards) || {};
      for (const [name, st] of Object.entries(cards)) {
        const sil = st && st.mecha && st.mecha.set && st.mecha.set.silhouette;
        if (sil && name !== except) got.push({ sil, at: (/(\d{8})$/.exec(dname) || [, '00000000'])[1] + '|' + dname });
      }
    }
  }
  return got.sort((a, b) => a.at < b.at ? -1 : a.at > b.at ? 1 : 0).slice(-MECHA_RECENT).map(x => x.sil);
}
/* ① 체형 — 외형 칸 body type 에(직접 쓴 글). 2026-11-07 처음엔 메카 컨셉의 종별 체형 문장(통통은 한 단계 아래)이었고,
   같은 날 꼬부기 초안 4(흉부 은은하게 · 허리 가늘게 · 골반 크게 · 허벅지 위쪽만 약간)를 사용자 「이대로 고정해줘」 — 모든 종 같은 문장(S.CARD_FIGURE) */
function figureOf(d, c) { return S.CARD_FIGURE || ''; }
function autoMecha(d, c, used) {
  const CM = cmOf(d);
  if (!CM) return null;
  const r = CM.choose(c.name, { mix: true, strict: false }, used || []);
  return { set: { silhouette: r.ch.silhouette }, fx: r.ch.fx.map(x => ({ key: x.key, type: x.type })) };
}
const fileName = (card, style, slot) => card + (slot.startsWith('casual') ? '' : '_' + slot) + '_' + style + '_f' + (slot.startsWith('casual') ? '_' + slot : '') + '.webp';   // tools/image-runner.py filename

/* 계획 파일에서 그 카드의 컷 — 생성기 주소와 같은 길(generatorQuery → fromQuery)로 넘긴다 */
function planCut(plan, card, n) {
  const ch = (plan.characters || []).find(x => x.card === card);
  const cut = ch && (ch.cuts || []).find(c => c.cut === n);
  if (!cut) return null;
  if (cut.treeV === 2) return { cut, v2: true };
  return { cut, raw: new URLSearchParams(CP.generatorQuery(card, cut)).get('casual') };
}

/* 쓰는 사람이 볼 것 — 고른 길의 트리 문장(data/casual-tree.json — 지시문의 Place·Activity·Outfit 줄이 이 영어 그대로)과
   계획의 옷 종류·드러내는 방식·장면 칸 첫머리. 장면·옷 칸은 이 문장을 되풀이하거나 다르게 쓰지 않는다(IMAGE_RULES 3절 3·5). build 는 읽지 않는다 */
/* 버전2 컷의 안내 — 장소 · 역할 · 소품 동작 · 몸 자세 · 구도 · 손 · 의상(지시문의 Place · Role · PROP · POSTURE 줄이 이 영어 그대로) */
function guideOfV2(d, cut) {
  const t = C2.make(d.tree2, d.tree), by = (list, k) => (list || []).find(r => r.key === k);
  const row = (x, extra) => x ? Object.assign({ key: x.key, ko: x.ko, en: x.en }, extra || {}) : null;
  const p = C2.place(t, cut.place), u = C2.use(t, cut.use), pr = u && C2.prop(t, u.prop), f = C2.family(t, cut.ofam), it = cut.item ? C2.item(t, cut.ofam, cut.item) : null;
  return {
    tree: 2, path: [cut.era, cut.place, cut.ofam, cut.item, cut.posture, cut.frame, cut.use].filter(Boolean).join(' / '),
    v2: { era: row(CT.era(d.tree, cut.era)), place: row(p), role: u && u.role ? { ko: u.role_ko, en: u.role } : null, use: u ? { key: u.key, ko: u.ko, en: u.en.replace('{prop}', pr ? pr.en : ''), prop: pr ? pr.ko : '' } : null,
      ofam: row(f, f && f.guide ? { guide: f.guide } : {}), item: it ? row(it) : { key: '', ko: '자동 — 계열 안에서 장면에 맞게', en: '' },
      posture: row(C2.posture(t, cut.posture)), frame: cut.frame, body: row(by(t.v2.body, cut.body)), hands: [cut.right || 'AUTO', cut.left || 'AUTO'].join(' · ') },
    garments: cut.garments || [], expose: cut.expose || [], lead: cut.lead || '', color: colorGuide(cut), situ: situGuide(cut), free: freeGuide(cut)
  };
}
/* 옷 자유(2026-11-09) · 갈래 · 상황 자유(2026-11-11) 컷 표시 */
function freeGuide(cut) { return cut.xfree ? '갈래 · 상황 자유(자유 장면)' : cut.sfree ? '장면 자유(자유 장면)' : cut.ofree ? '옷 자유' : ''; }
/* 상황 노출(2026-11-09) — 계획의 situ */
function situGuide(cut) { const c = (S.SITUATIONS || []).find(x => x.key === cut.situ); return c ? { key: c.key, ko: c.ko, en: c.en } : null; }
/* 옷 색(2026-11-07) — 계획의 ocolor. 옷 직접 쓰기 글은 이 색 낱말을 하나는 쓴다(build 가 본다) */
function colorGuide(cut) { const c = (S.OUTFIT_COLORS || []).find(x => x.key === cut.ocolor); return c ? { key: c.key, ko: c.ko, en: c.en, words: c.words } : null; }
function guideOf(tree, cut) {
  const e = CT.era(tree, cut.era), p = CT.place(tree, cut.place), a = CT.act(tree, cut.act), f = CT.family(tree, cut.ofam), it = cut.item ? CT.item(tree, cut.ofam, cut.item) : null;
  const fam = CT.poseFamily(tree, cut.act), g = p && CT.group(tree, p.group);
  const row = (x, extra) => x ? Object.assign({ key: x.key, ko: x.ko, en: x.en }, extra || {}) : null;
  return {
    path: [cut.era, cut.place, cut.act, cut.ofam, cut.item].filter(Boolean).join(' / '),
    tree: { era: row(e), place: row(p, g ? { group: g.ko } : {}), act: row(a, fam ? { pose_family: fam.ko } : {}), ofam: row(f, f && f.guide ? { guide: f.guide } : {}),
      item: it ? row(it) : { key: '', ko: '자동 — 계열 안에서 장면에 맞게', en: '' } },
    garments: cut.garments || [], expose: cut.expose || [], lead: cut.lead || '', color: colorGuide(cut)
  };
}

function init(o) {
  if (!o.card || !o.dir) throw new Error('init <카드> --dir <작업 폴더>');
  const d = data(), c = cardOf(d, o.card);
  if (!c) throw new Error('카드가 없다: ' + o.card + ' (data/card.json 의 이름 그대로)');
  const SL = o.legacy ? NINE : SLOTS, style = o.style || (o.legacy ? LEGACY_STYLE : PACK_STYLE);
  if (!S.ACTION_STYLE_CORES[style]) throw new Error('화풍 키가 없다: ' + style);
  if (S.RETIRED_STYLES[style]) throw new Error('내린 화풍이다(' + S.RETIRED_STYLES[style].date + ' — ' + S.RETIRED_STYLES[style].why + '): ' + style);
  const file = path.join(o.dir, 'settings.json');
  if (fs.existsSync(file)) throw new Error('이미 있다 — 덮지 않는다: ' + file);
  const blank = () => { return { expr: '', pose: '', orient: '', frame: '', lens: '', aspect: '2:3', camera: '', scene: '', outfit: '', custom: '', action: ST.normalizeAction(S, {}) }; };
  const set = { version: o.legacy ? 1 : 4, card: c.name, no: c.no, style, plan: o.plan ? path.resolve(o.plan) : '',
    note: '고칠 수 있는 칸만 있다. 자리마다 고정인 것(출력·인물 기준·장갑 폼·폭주 기준·첨부)은 tools/prompt-pack.cjs 가 정한다. 다 쓰면 build.', slots: {} };
  const plan = o.plan ? JSON.parse(fs.readFileSync(o.plan, 'utf8')) : null;
  const used = o.legacy ? [] : recentSilhouettes(o.repos, c.name);
  for (const [slot, def] of Object.entries(SL)) {
    const s = {};
    for (const f of def.fields) {
      if (f === 'params') { s.params = {}; const fig = !o.legacy && figureOf(d, c); if (fig) s.params['body type'] = fig; }
      else if (f === 'mecha') { s.mecha = autoMecha(d, c, used) || { set: {}, fx: [] }; s.mecha_auto = JSON.parse(JSON.stringify(s.mecha)); s.mecha_recent = used; }
      else if (f === 'faceDesignOn') s.faceDesignOn = true;
      else if (f === 'scene' && def.mode === 'action') s.scene = blank();
      else if (f === 'why') s.why = {};
      else s[f] = '';
    }
    if (def.mode === 'casual' && plan) {
      const pc = planCut(plan, c.name, def.cut);
      /* 쓰는 사람이 볼 것 — 계획의 옷 종류·드러내는 방식·장면 칸 첫머리(build 는 이 칸을 읽지 않는다) */
      if (pc) s.guide = pc.v2 ? guideOfV2(d, pc.cut) : guideOf(d.tree, pc.cut);
    }
    set.slots[slot] = s;
  }
  fs.mkdirSync(o.dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(set, null, 1) + '\n');
  console.log('만들었다 ' + file + ' — 칸을 채우고 node tools/prompt-pack.cjs build --dir ' + o.dir);
}

/* 옷 직접 쓰기 글이 계획 색을 따랐나 — 그 색 낱말이 하나도 없으면 고칠 칸(2026-11-07). 코스튬 컷 · 색 없는 계획은 안 본다 */
function colorCheck(sc, cut, where, bad) {
  const g = colorGuide(cut), text = String(sc.outfit || '').toLowerCase();
  if (!g || !text.trim()) return;
  if (!g.words.some(w => new RegExp('\\b' + w + '\\b').test(text))) bad.push(where('outfit') + ' — 계획의 옷 색 ' + g.ko + '(' + g.words.slice(0, 3).join(' · ') + ' …)을 쓴다');
}
/* 노출 낮추기(사용자 2026-11-08 「pkm쪽도 막히면 낮춰서 재시도로 룰 바꿔줘. 삼국지쪽에 맞게」) — 안전 필터에 막힌 자리만, 한 단계씩.
   일상: skin_exposure bold → moderate → low. 메카 폼(① · ② · ③): 두 곳 열기 → 한 곳(moderate) → 열지 않기(low). 사유(exposure_why — 막힌 응답)가 꼭 있다(IMAGE_RULES 3절 7) */
const EXPOSE_LOWER = ['moderate', 'low'];
function lowerOf(s, where, bad) {
  if (s.exposure == null || s.exposure === '') return '';
  if (EXPOSE_LOWER.indexOf(s.exposure) < 0) { bad.push(where('exposure') + ' — ' + EXPOSE_LOWER.join(' · ') + ' 중 하나(안전 필터에 막혀 한 단계씩 낮출 때만)'); return ''; }
  if (!(typeof s.exposure_why === 'string' && s.exposure_why.trim())) { bad.push(where('exposure_why') + ' — 노출을 낮추면 막힌 사유(응답 · request_id)를 쓴다'); return ''; }
  return s.exposure;
}
/* settings 한 자리 → 생성기 상태(화면이 저장할 그대로). 틀린 칸은 bad 에 */
function stateOf(set, slot, d, c, plan, bad) {
  const def = slotsOf(set)[slot], s = set.slots[slot] || {};
  const where = k => slot + '.' + k;
  for (const k of Object.keys(s)) if (def.fields.indexOf(k) < 0 && k !== 'guide' && !(def.fields.indexOf('mecha') >= 0 && (k === 'mecha_auto' || k === 'mecha_recent'))) bad.push(where(k) + ' — 이 자리엔 없는 칸(고정값은 도구가 정한다)');
  const str = k => { const v = s[k]; if (v != null && typeof v !== 'string') bad.push(where(k) + ' — 글이어야 한다'); return typeof v === 'string' ? v : ''; };
  if (def.mode === 'casual') {
    if (!plan) { bad.push(slot + ' — 계획 파일이 없다(init --plan 또는 settings.plan)'); return null; }
    const pc = planCut(plan, c.name, def.cut);
    if (!pc) { bad.push(slot + ' — 계획에 ' + c.name + ' ' + def.cut + '번 컷이 없다'); return null; }
    if (pc.v2) {
      const base = ST.initial(S, CT, CP, { style: set.style, identityMode: 'reference' }, d.tree, c, null, d.v2).st;
      const got = ST.plannedV2(S, base, pc.cut, d.tree, c, d.v2);
      if (got.bad.length) bad.push(slot + ' — 계획 값이 버전2 트리에 안 맞는다: ' + got.bad.join(', ') + ' (tools/casual-plan.cjs --v2 로 다시 정한다)');
      if (str('camera').trim()) bad.push(where('camera') + ' — 버전2 컷엔 자유 카메라 글이 없다(카메라 높이는 계획 칸 — 조명 · 분위기는 custom 에)');
      const sc = Object.assign({}, got.st.scenes.casual), why = s.why && typeof s.why === 'object' ? s.why : {};
      for (const f of CASUAL_TEXT_V2) {
        sc[f] = str(f);
        if (sc[f].trim() && !(typeof why[f] === 'string' && why[f].trim())) bad.push(where('why.' + f) + ' — 직접 입력엔 그 컷에 맞춘 사유를 쓴다(IMAGE_RULES 3절 4)');
      }
      for (const k of Object.keys(why)) if (CASUAL_TEXT_V2.indexOf(k) < 0) bad.push(where('why.' + k) + ' — 없는 칸');
      colorCheck(sc, pc.cut, where, bad);
      const lw2 = lowerOf(s, where, bad); if (lw2) sc.axes = Object.assign({}, sc.axes, { skin_exposure: lw2 });
      if (s.situ != null && s.situ !== '') {   /* 상황 빼기(2026-11-09) — 노출을 낮춘 뒤에도 막힌 상황 컷만 */
        if (s.situ !== 'none') bad.push(where('situ') + ' — none(빼기)만 — 상황은 계획기가 정한다');
        else if (!(typeof s.exposure_why === 'string' && s.exposure_why.trim())) bad.push(where('exposure_why') + ' — 상황을 빼면 막힌 사유(응답 · request_id)를 쓴다');
        else sc.situ = '';
      }
      return { st: Object.assign({}, got.st, { scenes: Object.assign({}, got.st.scenes, { casual: sc }) }), cut: pc.cut, manual: Object.fromEntries(CASUAL_TEXT_V2.filter(f => sc[f].trim()).map(f => [f, sc[f]])), why };
    }
    const first = ST.initial(S, CT, CP, { style: set.style, identityMode: 'reference' }, d.tree, c, pc.raw);
    if (!first.plan) { bad.push(slot + ' — 계획 컷을 못 읽었다'); return null; }
    if (first.plan.bad.length) bad.push(slot + ' — 계획 값이 트리에 안 맞는다: ' + first.plan.bad.join(', ') + ' (tools/casual-plan.cjs 로 다시 정한다)');
    const sc = Object.assign({}, first.st.scenes.casual), why = s.why && typeof s.why === 'object' ? s.why : {};
    for (const f of CASUAL_TEXT) {
      sc[f] = str(f);
      if (sc[f].trim() && !(typeof why[f] === 'string' && why[f].trim())) bad.push(where('why.' + f) + ' — 직접 입력엔 그 컷에 맞춘 사유를 쓴다(IMAGE_RULES 3절 4)');
    }
    for (const k of Object.keys(why)) if (CASUAL_TEXT.indexOf(k) < 0) bad.push(where('why.' + k) + ' — 없는 칸');
    colorCheck(sc, pc.cut, where, bad);
    const lw1 = lowerOf(s, where, bad); if (lw1) sc.axes = Object.assign({}, sc.axes, { skin_exposure: lw1 });
    return { st: Object.assign({}, first.st, { scenes: Object.assign({}, first.st.scenes, { casual: sc }) }), cut: pc.cut, manual: Object.fromEntries(CASUAL_TEXT.filter(f => sc[f].trim()).map(f => [f, sc[f]])), why };
  }
  const raw = { style: set.style, mode: 'action', form: def.form, identityMode: def.identityMode, baseForm: def.baseForm, motifs: str('motifs'), formOverride: str('formOverride') };
  if (def.fields.indexOf('headFeature') >= 0) {
    raw.headFeature = str('headFeature');
    if (raw.headFeature === '__custom__') bad.push(where('headFeature') + ' — 직접 입력이면 그 글을 쓴다');
  }
  if (def.fields.indexOf('faceDesignOn') >= 0) {
    if (s.faceDesignOn != null && typeof s.faceDesignOn !== 'boolean') bad.push(where('faceDesignOn') + ' — true/false');
    raw.faceDesignOn = s.faceDesignOn !== false;
  }
  if (def.fields.indexOf('params') >= 0) {
    const ps = s.params && typeof s.params === 'object' ? s.params : {}, defs = S.PARAM_DEFS.filter(x => S.IDENTITY_GROUPS.includes(x.group) && !S.IDENTITY_EXCLUDED.includes(x.key));
    for (const [k, v] of Object.entries(ps)) {
      const dd = defs.find(x => x.key === k);
      if (!dd) bad.push(where('params.' + k) + ' — 외형 칸이 아니다');
      else if (typeof v !== 'string' || v === '__custom__') bad.push(where('params.' + k) + ' — 값(표의 열쇠 또는 직접 쓴 글)');
    }
    raw.params = Object.fromEntries(Object.entries(ps).filter(([, v]) => typeof v === 'string' && v));
  }
  const scene = {};
  if (def.fields.indexOf('scene') >= 0) {
    const sc = s.scene && typeof s.scene === 'object' ? s.scene : {};
    for (const k of Object.keys(sc)) if (ACTION_SCENE.indexOf(k) < 0) bad.push(where('scene.' + k) + ' — 없는 칸');
    const ok = { expr: keys(S.EXPRESSION_OPTIONS), pose: keys(S.ACTION_POSES).concat(keys(S.POSE_OPTIONS)), orient: keys(S.ORIENTATION_OPTIONS), frame: keys(S.FRAME_OPTIONS), lens: keys(S.LENS_OPTIONS), aspect: ['2:3', '3:2', '1:1', '9:16', '16:9'] };
    for (const [k, list] of Object.entries(ok)) if (sc[k] && list.indexOf(sc[k]) < 0) bad.push(where('scene.' + k) + ' — 표에 없는 값 ' + JSON.stringify(sc[k]));
    for (const k of ['camera', 'scene', 'outfit', 'custom']) if (sc[k] != null && typeof sc[k] !== 'string') bad.push(where('scene.' + k) + ' — 글이어야 한다');
    Object.assign(scene, sc);
    const act = ST.normalizeAction(S, sc.action);
    for (const [k, v] of Object.entries(sc.action || {})) if (v && act[k] !== v) bad.push(where('scene.action.' + k) + ' — 표에 없는 값 ' + JSON.stringify(v));
  }
  if (def.fields.indexOf('custom') >= 0) scene.custom = str('custom');
  raw.scenes = { action: scene };
  /* 메카 큰 실루엣 · 부품 · 타입 표현(여덟 자리 ①) — 표에 있는 값만, 정한 값(mecha_auto)과 다르면 사유 */
  if (def.fields.indexOf('mecha') >= 0 && s.mecha != null) {
    const C = d.concept, m = s.mecha, types = [c.element, c.element2].filter(Boolean);
    if (!C) bad.push(where('mecha') + ' — data/concept-mecha.json 이 없다');
    else if (typeof m !== 'object' || Array.isArray(m)) bad.push(where('mecha') + ' — { set: {칸: 값}, fx: [{key, type}] }');
    else {
      for (const k of Object.keys(m)) if (k !== 'set' && k !== 'fx') bad.push(where('mecha.' + k) + ' — 없는 칸');
      const optsOf = k => k === 'silhouette' ? C.silhouettes : C.parts[k];
      for (const [k, v] of Object.entries(m.set || {})) {
        if (!C.slots.some(x => x.key === k)) bad.push(where('mecha.set.' + k) + ' — 없는 칸(' + C.slots.map(x => x.key).join(' · ') + ')');
        else if (v && !(optsOf(k) || []).some(x => x.key === v)) bad.push(where('mecha.set.' + k) + ' — 표에 없는 값 ' + JSON.stringify(v));
      }
      const seen = {};
      for (const f of Array.isArray(m.fx) ? m.fx : []) {
        if (!f || !C.fx.some(x => x.key === f.key)) bad.push(where('mecha.fx') + ' — 없는 타입 표현 ' + JSON.stringify(f && f.key));
        else if (seen[f.key]) bad.push(where('mecha.fx') + ' — ' + f.key + ' 가 두 번');
        else if (f.type && !types.includes(f.type)) bad.push(where('mecha.fx') + ' — ' + c.name + ' 의 타입은 ' + types.join(' · ') + ' (' + f.type + ' 아님)');
        if (f && f.key) seen[f.key] = 1;
      }
      if (m.fx != null && !Array.isArray(m.fx)) bad.push(where('mecha.fx') + ' — 목록이어야 한다');
      const norm = x => JSON.stringify(ST.normalizeMecha(x));
      if (s.mecha_auto && norm(m) !== norm(s.mecha_auto) && !(typeof s.mecha_why === 'string' && s.mecha_why.trim())) bad.push(where('mecha_why') + ' — 정한 메카 값(mecha_auto)을 바꾸면 사유를 쓴다');
      raw.mecha = ST.normalizeMecha(m);
    }
  }
  const lw = lowerOf(s, where, bad), st0 = ST.initial(S, CT, CP, raw, d.tree, c, null).st;
  if (lw) st0.mechaExposure = lw;   /* 메카 폼 노출 한 단계씩(2026-11-08) */
  return { st: st0 };
}

function build(o) {
  if (!o.dir) throw new Error('build --dir <작업 폴더>');
  const file = path.join(o.dir, 'settings.json');
  const set = JSON.parse(fs.readFileSync(file, 'utf8'));
  const d = data(), c = cardOf(d, set.card), bad = [];
  if (!c) throw new Error('카드가 없다: ' + set.card);
  if (c.no !== set.no) bad.push('no — 카드 번호가 다르다(' + set.no + ' ≠ ' + c.no + ')');
  if (!S.ACTION_STYLE_CORES[set.style]) bad.push('style — 화풍 키가 없다: ' + set.style);
  else if (S.RETIRED_STYLES[set.style]) bad.push('style — 내린 화풍이다(' + S.RETIRED_STYLES[set.style].date + '): ' + set.style);
  const SL = slotsOf(set);
  for (const k of Object.keys(set.slots || {})) if (!SL[k]) bad.push('slots.' + k + ' — 없는 자리');
  const planFile = o.plan || set.plan, plan = planFile && fs.existsSync(planFile) ? JSON.parse(fs.readFileSync(planFile, 'utf8')) : null;
  if (planFile && !plan) bad.push('plan — 계획 파일이 없다: ' + planFile);
  const want = o.slot ? [o.slot] : Object.keys(SL);
  if (o.slot && !SL[o.slot]) throw new Error('자리: ' + Object.keys(SL).join(' · '));
  const out = [];
  for (const slot of want) {
    const r = stateOf(set, slot, d, c, plan, bad);
    if (!r) continue;
    const x = extras(d, c), text = ST.prompt(P, L, r.st, c, x.appearance, x.face, d.tree, d.tree2, d.concept);
    const ui = { storage: { last: c.name, cards: { [c.name]: r.st } }, prompt: text };
    if (r.cut) { ui.plan = r.cut; ui.manual_inputs = r.manual; ui.manual_why = r.why; }
    out.push({ slot, text, ui });
  }
  if (bad.length) { console.error('고칠 칸 ' + bad.length + '개 — 아무것도 쓰지 않았다:\n  ' + bad.join('\n  ')); process.exit(1); }
  let rev = '';
  try { rev = cp.execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD']).toString().trim(); } catch (e) { /* git 이 없는 곳 */ }
  /* 옷 목록(2026-11-09 「일상컷도 우리쪽 의상자료를 참고하라고해서 여기 없는걸 선택하라고 하자」) — 옷 자유 컷은 이 목록에 없는 옷을 짓는다 */
  fs.writeFileSync(path.join(o.dir, 'outfit-catalog.md'), '# Our outfit catalog — every outfit type we already use for casual cuts\n\nFor a free-outfit cut, design an outfit that is NOT on this list.\n\n' + (d.tree.outfits || []).map(f => '## ' + f.key + ' — ' + String(f.en).replace('{costume}', 'her creature') + '\n' + (f.items || []).map(i => '- ' + String(i.en).replace('{costume}', 'her creature')).join('\n')).join('\n\n') + '\n' +
    /* 우리 상황 노출 목록(2026-11-11) — 갈래 · 상황 자유 컷은 여기 없는 상황을 짓는다 */
    '\n# Our exposure situations — every situation we already use\n\nFor the free category + situation cut, invent a situation that is NOT on this list.\n\n' + (S.SITUATIONS || []).map(x => '- ' + x.key + ' — ' + x.en).join('\n') + '\n');
  for (const r of out) {
    fs.writeFileSync(path.join(o.dir, r.slot + '-prompt.txt'), r.text + '\n');
    fs.writeFileSync(path.join(o.dir, r.slot + '-ui.json'), JSON.stringify(r.ui, null, 1) + '\n');
    /* ① GPT 임의 설계 주문(2026-11-11 — 삼국지 · 원소처럼 ① 네 장: 우리 설계 둘 + 임의 설계 둘) */
    if (r.slot === 'light') fs.writeFileSync(path.join(o.dir, 'light-free.txt'), P.buildFree(r.text, r.ui.storage.cards[c.name], d.concept) + '\n');
  }
  /* 차례표 — 이 자리의 지시문을 읽어 그대로 제출하고, 적힌 그림을 첨부한다 */
  const sha = t => crypto.createHash('sha256').update(t + '\n').digest('hex').slice(0, 12);
  const att = a => a.map(x => x.endsWith('?') ? '(되면 ' + SL[x.slice(0, -1)].n + ')' : SL[x].n + ' ' + fileName(c.name, set.style, x)).join(' + ') || '없음';
  const lines = ['# ' + c.name + ' (' + String(c.no).padStart(4, '0') + ' · ' + c.en + ') — 지시문 묶음', '',
    '화풍 `' + set.style + '` · 만든 도구 `tools/prompt-pack.cjs build` · 생성기 코드 ' + (rev || '?') + ' · ' + new Date().toISOString(), '',
    '자리마다 `<자리>-prompt.txt` 를 **고치지 않고 그대로** 제출하고, 첨부 칸의 그림을 붙인다. 고칠 것이 있으면 settings.json 을 고쳐 build 를 다시 돌린다.', '',
    '**① → 멈춤 → 일상컷**(2026-11-11 삼국지 · 원소와 같이). ① 은 **네 장**(첨부 없이 한 장씩) — **두 장은 우리 설계 `light-prompt.txt` 그대로, 두 장은 임의 설계 `light-free.txt`**(설계 주문 — 화풍 · 색 · 머리색 · 체형 · 장갑 폼 · 원작 특징 · 노출 · 구도 · 자세는 우리 것, 큰 실루엣은 목록에서 하나 + 원작에서 딴 제 아이디어 하나, 얼굴 · 눈색(우리 것이든 제 것이든) · 헤어스타일 · 화장 · 표정 · 장면(배경) · 타입 효과는 맡은 쪽이 지어 제 지시문을 쓴다, 둘째 장은 첫째와 확실히 다르게(자세는 같게)). 네 장을 「우리 설계 1 · 2 / GPT 설계 1 · 2」 로 붙여 보이고 **멈추고 묻는다** — 고르기 전엔 일상컷으로 넘어가지 않고 ① 도 올리지 않는다. 고른 장만 올리고 그 장을 붙여 일상컷을 그린다. 임의 설계 장이면 기록 `generation.design: "gpt_free"` 와 실제로 넘긴 지시문(`generation.free_prompt`)을 남긴다.', '',
    '**일상컷 옷 자유 컷 두 장** — 계획에 「옷 자유」 로 적힌 컷 가운데 「장면 자유」 가 아닌 한 장은 Outfit 줄이 「노출 의상을 네가 지어라」 다 — 이 묶음의 `outfit-catalog.md`(우리가 쓰는 옷 전부)를 읽고 **거기 없는 옷**을 지어 그 줄에만 써 넣는다(실제로 넘긴 글은 기록에).', '',
    '**일상컷 자유 장면 두 장**(2026-11-11) — 계획에 「장면 자유」(옷 자유 가운데 한 장) · 「갈래 · 상황 자유」 로 적힌 컷은 SCENE 칸이 설계 주문이다: **장소 · 활동 · 자세 · 구도 · 의상을 맡은 쪽이 짓는다** — 캐릭터의 특징에서 출발해 예상하지 못했지만 자연스럽게 어울리는 일상의 한 순간, 참신함은 장식보다 상황과 행동에서, 이 묶음의 다른 일상컷 · 이 세션에서 그린 컷과 비슷한 장면은 피한다. 장면 자유는 `outfit-catalog.md` 에 **없는 노출 의상**, 갈래 · 상황 자유는 필수 갈래(성인 롤플레이 · 수영복 · 란제리풍) 하나를 골라 **없는 옷** + 끝의 상황 목록에 **없는 노출 상황**. SCENE 밖의 칸(얼굴 · 화풍 · 체형 · 인체 · 옷 갈아입기 · 각도)과 표정 · 노출 강도 · 원작 영향도 줄은 우리 것 그대로 — 그 위에서 제 지시문을 써 그린다. 기록에 `generation.design: "gpt_free"` 와 실제로 넘긴 지시문(`generation.free_prompt`).', '',
    '**프롬프트 임의 수정 금지 — 이미지 모델에도 똑같다(2026-11-08).** IMAGE_RULES.md 1절의 변경 사유(settings 고친 뒤 build · 막혔을 때 계획기 다시 계획 · 같은 지시문 재생성 · 사용자가 시킨 부분 고치기) 말고는 낱말 하나도 고치지 않는다. image_gen 에도 이 글 그대로 넘기고(`submitted` 0 일 때만) 고쳐 쓰지 말고 그대로 그리게 한다.', '',
    '**노출은 세션이 줄이지 않는다.** 노출 · 의상 줄을 빼거나 누그러뜨리거나 고정값(강도 strong · 노출 bold)을 미리 낮추지 않는다 — 실제로 막혔을 때만 IMAGE_RULES.md 3절 7 순서(같은 지시문 한 번 → 노출 한 단계씩 settings exposure · exposure_why → 계획기로 장면 다시). 검수 `qa.json` 에 컷마다 `exposure`(match · weaker · stronger + 근거).',
    '기록에는 `<자리>-ui.json`(생성기 저장값과 같은 꼴)과 지시문을 둔다 — 관리기를 쓰면 `python3 tools/image-runner.py intent --card ' + c.no + ' --slot <자리> --prompt <이 폴더>/<자리>-prompt.txt --ui <이 폴더>/<자리>-ui.json`.', '',
    '| 차례 | 자리 | 첨부 | 지시문 | 낱말 | sha256(앞 12) | 올릴 파일 |', '|---|---|---|---|---|---|---|'];
  for (const r of out) lines.push('| ' + SL[r.slot].n + ' | ' + r.slot + ' | ' + att(SL[r.slot].attach) + ' | `' + r.slot + '-prompt.txt` | ' + P.words(r.text) + ' | `' + sha(r.text) + '` | `' + fileName(c.name, set.style, r.slot) + '` |');
  /* 일상 컷마다 고른 길 — 트리 문장(지시문에 그대로 들어간다) */
  for (const r of out.filter(x => x.ui.plan && x.ui.plan.treeV === 2)) {
    const g = guideOfV2(d, r.ui.plan), v = g.v2;
    lines.push('', '## ' + SL[r.slot].n + ' ' + r.slot + ' — 고른 장면(버전2)', '',
      '| 칸 | 고른 것 | 지시문 문장 |', '|---|---|---|',
      '| 시대 | ' + (v.era ? v.era.ko : '—') + ' | ' + (v.era ? v.era.en : '') + ' |',
      '| 장소 | ' + (v.place ? v.place.ko : '—') + ' | ' + (v.place ? v.place.en : '') + ' |',
      '| 역할 | ' + (v.role ? v.role.ko : '—') + ' | ' + (v.role ? v.role.en : '') + ' |',
      '| 의상 | ' + (v.ofam ? v.ofam.ko : '—') + ' · ' + v.item.ko + ' | ' + (v.item.en || (v.ofam ? v.ofam.en : '')) + ' |',
      '| 몸 자세 · 구도 | ' + (v.posture ? v.posture.ko : '—') + ' · ' + v.frame + ' · ' + (v.body ? v.body.ko : '—') + ' | ' + (v.posture ? v.posture.en : '') + ' |',
      '| 손 · 소품 동작 | ' + v.hands + (v.use ? ' · ' + v.use.prop + ' · ' + v.use.ko : '') + ' | ' + (v.use ? v.use.en : '') + ' |', '',
      '옷 종류 ' + (g.garments.join(' + ') || '—') + ' · 옷 색 ' + (g.color ? g.color.ko + ' (' + g.color.en + ')' : '—') + (g.situ ? ' · 상황 ' + g.situ.ko : '') + (g.free ? ' · ' + g.free : '') + ' · 드러내기 ' + (g.expose.join(', ') || '—') + ' · 장면 칸 첫머리 ' + (g.lead || '—') +
      (Object.keys(r.ui.manual_inputs || {}).length ? ' · 직접 입력 ' + Object.keys(r.ui.manual_inputs).join(', ') : ''));
  }
  for (const r of out.filter(x => x.ui.plan && x.ui.plan.treeV !== 2)) {
    const g = guideOf(d.tree, r.ui.plan), t = g.tree;
    lines.push('', '## ' + SL[r.slot].n + ' ' + r.slot + ' — 고른 길', '',
      '| 칸 | 고른 것 | 트리 문장(지시문 그대로) |', '|---|---|---|',
      '| 시대 | ' + (t.era ? t.era.ko : '—') + ' | ' + (t.era ? t.era.en : '') + ' |',
      '| 장소 | ' + (t.place ? t.place.ko + (t.place.group ? ' · ' + t.place.group : '') : '—') + ' | ' + (t.place ? t.place.en : '') + ' |',
      '| 하는 일 | ' + (t.act ? t.act.ko + (t.act.pose_family ? ' · ' + t.act.pose_family : '') : '—') + ' | ' + (t.act ? t.act.en : '') + ' |',
      '| 의상 계열 | ' + (t.ofam ? t.ofam.ko : '—') + ' | ' + (t.ofam ? t.ofam.en + (t.ofam.guide ? ' — ' + t.ofam.guide : '') : '') + ' |',
      '| 옷 | ' + t.item.ko + ' | ' + t.item.en + ' |', '',
      '옷 종류 ' + (g.garments.join(' + ') || '—') + ' · 옷 색 ' + (g.color ? g.color.ko + ' (' + g.color.en + ')' : '—') + (g.situ ? ' · 상황 ' + g.situ.ko : '') + (g.free ? ' · ' + g.free : '') + ' · 드러내기 ' + (g.expose.join(', ') || '—') + ' · 장면 칸 첫머리 ' + (g.lead || '—') +
      (Object.keys(r.ui.manual_inputs || {}).length ? ' · 직접 입력 ' + Object.keys(r.ui.manual_inputs).join(', ') : ''));
  }
  if (!o.slot) fs.writeFileSync(path.join(o.dir, 'INDEX.md'), lines.join('\n') + '\n');
  console.log('썼다 ' + out.length + '자리 → ' + o.dir + (o.slot ? '' : ' (INDEX.md)'));
}

/* 실제로 넘긴 글 — 묶음 지시문과 글자 그대로인지(2026-11-03). 넘긴 글이 묶음과 다르면 그 그림은 묶음 지시문의 결과가 아니다 */
function submitted(o) {
  if (!o.dir || !(SLOTS[o.slot] || SLOTS7[o.slot] || NINE[o.slot]) || !o.file) throw new Error('submitted --dir <작업 폴더> --slot <자리> --file <넘긴 글>');   /* SLOTS 가 SLOTS9 를 품는다 */
  const want = fs.readFileSync(path.join(o.dir, o.slot + '-prompt.txt'), 'utf8'), got = fs.readFileSync(o.file, 'utf8');
  const out = path.join(o.dir, o.slot + '-submitted.txt');
  if (path.resolve(o.file) !== path.resolve(out)) fs.writeFileSync(out, got);
  const hash = t => crypto.createHash('sha256').update(t).digest('hex');
  const lines = t => t.split('\n').map(x => x.trimEnd()).filter(Boolean);
  /* 화풍 줄 — 줄 꼴(일상컷)은 「STYLE: …」, 칸 꼴(메카 지시문, 2026-11-11)은 1칸 머리(CORE_FRAME.s1) 바로 아래 줄 */
  const a = lines(want), b = lines(got), s1 = S.CORE_FRAME ? a.indexOf(S.CORE_FRAME.s1) : -1;
  const style = a.find(x => /^STYLE:/.test(x)) || (s1 >= 0 && a[s1 + 1]) || '';
  const r = { slot: o.slot, at: new Date().toISOString(), prompt_sha256: hash(want), submitted_sha256: hash(got), same: want.trimEnd() === got.trimEnd(),
    prompt_words: P.words(want), submitted_words: P.words(got), style_kept: !style || b.includes(style),
    missing: a.filter(x => !b.includes(x)).slice(0, 8), added: b.filter(x => !a.includes(x)).slice(0, 8) };
  const logFile = path.join(o.dir, 'submitted.json'), log = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : {};
  (log[o.slot] = log[o.slot] || []).push(r);
  fs.writeFileSync(logFile, JSON.stringify(log, null, 1) + '\n');
  console.log(JSON.stringify(r, null, 1));
  if (!r.same) { console.error('넘긴 글이 ' + o.slot + '-prompt.txt 와 다르다 — 고쳐 쓰지 말고 파일 글 그대로 넘긴다(이미 그렸으면 그 그림은 올리지 말고 알린다)'); process.exit(1); }
}

if (require.main === module) {
  try {
    const o = args(process.argv.slice(2));
    if (o.cmd === 'init') init(o); else if (o.cmd === 'build') build(o); else if (o.cmd === 'submitted') submitted(o);
    else { console.error('node tools/prompt-pack.cjs init <카드> --dir <작업 폴더> [--style 키] [--plan PLAN.json] | build --dir <작업 폴더> [--slot 자리] | submitted --dir <작업 폴더> --slot 자리 --file <넘긴 글>'); process.exit(2); }
  } catch (e) { console.error(e.message); process.exit(2); }
}
module.exports = { SLOTS, SLOTS9, SLOTS7, NINE, slotsOf, PACK_STYLE, init, build, submitted, stateOf, planCut, fileName, guideOfV2, recentSilhouettes, autoMecha };
