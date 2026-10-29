#!/usr/bin/env node
/* 지시문 묶음 — 브라우저 없이 생성기와 같은 지시문·저장값을 파일로(2026-10-29, 사용자 「브라우저에서 하라고 시켰는데 파일로 정리해서 읽게 하는게 더 좋을거 같아」).
   생성기 화면이 쓰는 상태 코드(lib/prompt-state.js)와 조립부(lib/prompt-anthro.js · lib/prompt-lifestyle.js)를 그대로 불러
   한 캐릭터 아홉 자리(IMAGE_RULES 3절 표)의 지시문(<자리>-prompt.txt)과 생성기 저장값(<자리>-ui.json — 화면의 storage 와 같은 꼴)을 쓴다.
   글자 하나 다르지 않은지는 tests/prompt-pack-screen.cjs 가 실제 생성기 화면과 견준다.

   node tools/prompt-pack.cjs init <카드> --dir <작업 폴더> [--style <화풍 키>] [--plan PLAN.json]
     작업 폴더에 settings.json(고칠 수 있는 칸만)을 만든다 — 이미 있으면 덮지 않고 멈춘다.
     --plan 은 일상컷 계획기(tools/casual-plan.cjs --out)의 계획 파일. 일상 세 컷의 선택값은 계획에서만 온다(settings 에 안 쓴다).
   node tools/prompt-pack.cjs build --dir <작업 폴더> [--slot <자리>]
     settings.json 을 읽어 지시문·저장값·차례표(INDEX.md)를 쓴다. 틀린 칸(없는 열쇠·표에 없는 값·사유 없는 직접 입력·계획에 없는 컷)이 있으면
     아무것도 쓰지 않고 1 로 끝난다. 다시 돌리면 같은 글이 나온다(만든 때 줄만 다르다).

   자리마다 고정인 것(출력·인물 기준·장갑 폼·폭주 기준 장갑·첨부)은 도구가 정한다 — settings 에 없다. 고칠 수 있는 칸:
     light               motifs · formOverride · headFeature · faceDesignOn · params(외형) · scene(장면 칸 — 비워 두는 것이 기본)
     heavy · mobility    motifs · formOverride · scene
     *_overdrive         motifs · formOverride · custom(추가 연출 요청 — 생성기도 폭주엔 이 칸만 보인다)
     casual1~3           scene · outfit · camera · custom(직접 입력) 과 why(칸마다 사유 — IMAGE_RULES 3절 4) */
'use strict';
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
global.window = global;
for (const f of ['prompt-spec', 'casual-tree', 'prompt-anthro', 'prompt-lifestyle', 'casual-plan', 'prompt-state']) require(path.join(ROOT, 'lib', f + '.js'));
const S = window.AtelierSpec, CT = window.AtelierCasualTree, P = window.AtelierPrompt, L = window.AtelierLifestyle, CP = window.AtelierCasualPlan, ST = window.AtelierPromptState;
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));

/* 아홉 자리 — IMAGE_RULES 3절 표 그대로 */
const SLOTS = {
  light: { n: '①', mode: 'action', form: 'light', identityMode: 'create', baseForm: 'light', attach: [], fields: ['motifs', 'formOverride', 'headFeature', 'faceDesignOn', 'params', 'scene'] },
  heavy: { n: '②', mode: 'action', form: 'heavy', identityMode: 'reference', baseForm: 'light', attach: ['light'], fields: ['motifs', 'formOverride', 'scene'] },
  mobility: { n: '③', mode: 'action', form: 'mobility', identityMode: 'reference', baseForm: 'light', attach: ['light'], fields: ['motifs', 'formOverride', 'scene'] },
  light_overdrive: { n: '④', mode: 'action', form: 'overdrive', identityMode: 'reference', baseForm: 'light', attach: ['light'], fields: ['motifs', 'formOverride', 'custom'] },
  heavy_overdrive: { n: '⑤', mode: 'action', form: 'overdrive', identityMode: 'reference', baseForm: 'heavy', attach: ['heavy', 'light?'], fields: ['motifs', 'formOverride', 'custom'] },
  mobility_overdrive: { n: '⑥', mode: 'action', form: 'overdrive', identityMode: 'reference', baseForm: 'mobility', attach: ['mobility', 'light?'], fields: ['motifs', 'formOverride', 'custom'] },
  casual1: { n: '⑦', mode: 'casual', cut: 1, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why'] },
  casual2: { n: '⑧', mode: 'casual', cut: 2, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why'] },
  casual3: { n: '⑨', mode: 'casual', cut: 3, attach: ['light'], fields: ['scene', 'outfit', 'camera', 'custom', 'why'] }
};
const ACTION_SCENE = ['expr', 'pose', 'orient', 'frame', 'lens', 'aspect', 'camera', 'scene', 'outfit', 'custom', 'action'];
const CASUAL_TEXT = ['scene', 'outfit', 'camera', 'custom'];
const keys = rows => rows.map(r => Array.isArray(r) ? r[0] : r.key).filter(v => v && v !== '__custom__');

function args(argv) {
  const o = { cmd: argv[0], card: '', dir: '', style: '', plan: '', slot: '' };
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dir') o.dir = argv[++i]; else if (a === '--style') o.style = argv[++i]; else if (a === '--plan') o.plan = argv[++i];
    else if (a === '--slot') o.slot = argv[++i]; else if (!a.startsWith('--') && !o.card) o.card = a;
    else throw new Error('모르는 인자: ' + a);
  }
  return o;
}
function data() {
  const cards = read('card.json').cards.character, tree = read('casual-tree.json');
  const opt = f => { try { return read(f); } catch (e) { return null; } };
  return { cards, tree, appearance: (opt('source-appearance.json') || {}).entries || null, faces: (opt('face-design.json') || {}).faces || null };
}
/* 화면과 같은 몫 — 원작 외형은 없으면 undefined, 얼굴 설계는 없으면 null(lib/prompt-ui.js App) */
const extras = (d, c) => ({ appearance: d.appearance ? d.appearance[String(c.no)] : undefined, face: d.faces ? d.faces[String(c.no)] || null : null });
const cardOf = (d, name) => d.cards.find(c => c.name === name);
const fileName = (card, style, slot) => card + (slot.startsWith('casual') ? '' : '_' + slot) + '_' + style + '_f' + (slot.startsWith('casual') ? '_' + slot : '') + '.webp';   // tools/image-runner.py filename

/* 계획 파일에서 그 카드의 컷 — 생성기 주소와 같은 길(generatorQuery → fromQuery)로 넘긴다 */
function planCut(plan, card, n) {
  const ch = (plan.characters || []).find(x => x.card === card);
  const cut = ch && (ch.cuts || []).find(c => c.cut === n);
  if (!cut) return null;
  return { cut, raw: new URLSearchParams(CP.generatorQuery(card, cut)).get('casual') };
}

function init(o) {
  if (!o.card || !o.dir) throw new Error('init <카드> --dir <작업 폴더>');
  const d = data(), c = cardOf(d, o.card);
  if (!c) throw new Error('카드가 없다: ' + o.card + ' (data/card.json 의 이름 그대로)');
  const style = o.style || S.DEFAULT_STYLE;
  if (!S.ACTION_STYLE_CORES[style]) throw new Error('화풍 키가 없다: ' + style);
  const file = path.join(o.dir, 'settings.json');
  if (fs.existsSync(file)) throw new Error('이미 있다 — 덮지 않는다: ' + file);
  const blank = () => { return { expr: '', pose: '', orient: '', frame: '', lens: '', aspect: '2:3', camera: '', scene: '', outfit: '', custom: '', action: ST.normalizeAction(S, {}) }; };
  const set = { version: 1, card: c.name, no: c.no, style, plan: o.plan ? path.resolve(o.plan) : '',
    note: '고칠 수 있는 칸만 있다. 자리마다 고정인 것(출력·인물 기준·장갑 폼·폭주 기준·첨부)은 tools/prompt-pack.cjs 가 정한다. 다 쓰면 build.', slots: {} };
  const plan = o.plan ? JSON.parse(fs.readFileSync(o.plan, 'utf8')) : null;
  for (const [slot, def] of Object.entries(SLOTS)) {
    const s = {};
    for (const f of def.fields) {
      if (f === 'params') s.params = {};
      else if (f === 'faceDesignOn') s.faceDesignOn = true;
      else if (f === 'scene' && def.mode === 'action') s.scene = blank();
      else if (f === 'why') s.why = {};
      else s[f] = '';
    }
    if (def.mode === 'casual' && plan) {
      const pc = planCut(plan, c.name, def.cut);
      /* 쓰는 사람이 볼 것 — 계획의 옷 종류·드러내는 방식·장면 칸 첫머리(build 는 이 칸을 읽지 않는다) */
      if (pc) s.guide = { path: [pc.cut.era, pc.cut.place, pc.cut.act, pc.cut.ofam, pc.cut.item].filter(Boolean).join(' / '), garments: pc.cut.garments || [], expose: pc.cut.expose || [], lead: pc.cut.lead || '' };
    }
    set.slots[slot] = s;
  }
  fs.mkdirSync(o.dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(set, null, 1) + '\n');
  console.log('만들었다 ' + file + ' — 칸을 채우고 node tools/prompt-pack.cjs build --dir ' + o.dir);
}

/* settings 한 자리 → 생성기 상태(화면이 저장할 그대로). 틀린 칸은 bad 에 */
function stateOf(set, slot, d, c, plan, bad) {
  const def = SLOTS[slot], s = set.slots[slot] || {};
  const where = k => slot + '.' + k;
  for (const k of Object.keys(s)) if (def.fields.indexOf(k) < 0 && k !== 'guide') bad.push(where(k) + ' — 이 자리엔 없는 칸(고정값은 도구가 정한다)');
  const str = k => { const v = s[k]; if (v != null && typeof v !== 'string') bad.push(where(k) + ' — 글이어야 한다'); return typeof v === 'string' ? v : ''; };
  if (def.mode === 'casual') {
    if (!plan) { bad.push(slot + ' — 계획 파일이 없다(init --plan 또는 settings.plan)'); return null; }
    const pc = planCut(plan, c.name, def.cut);
    if (!pc) { bad.push(slot + ' — 계획에 ' + c.name + ' ' + def.cut + '번 컷이 없다'); return null; }
    const first = ST.initial(S, CT, CP, { style: set.style, identityMode: 'reference' }, d.tree, c, pc.raw);
    if (!first.plan) { bad.push(slot + ' — 계획 컷을 못 읽었다'); return null; }
    if (first.plan.bad.length) bad.push(slot + ' — 계획 값이 트리에 안 맞는다: ' + first.plan.bad.join(', ') + ' (tools/casual-plan.cjs 로 다시 정한다)');
    const sc = Object.assign({}, first.st.scenes.casual), why = s.why && typeof s.why === 'object' ? s.why : {};
    for (const f of CASUAL_TEXT) {
      sc[f] = str(f);
      if (sc[f].trim() && !(typeof why[f] === 'string' && why[f].trim())) bad.push(where('why.' + f) + ' — 직접 입력엔 그 컷에 맞춘 사유를 쓴다(IMAGE_RULES 3절 4)');
    }
    for (const k of Object.keys(why)) if (CASUAL_TEXT.indexOf(k) < 0) bad.push(where('why.' + k) + ' — 없는 칸');
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
  return { st: ST.initial(S, CT, CP, raw, d.tree, c, null).st };
}

function build(o) {
  if (!o.dir) throw new Error('build --dir <작업 폴더>');
  const file = path.join(o.dir, 'settings.json');
  const set = JSON.parse(fs.readFileSync(file, 'utf8'));
  const d = data(), c = cardOf(d, set.card), bad = [];
  if (!c) throw new Error('카드가 없다: ' + set.card);
  if (c.no !== set.no) bad.push('no — 카드 번호가 다르다(' + set.no + ' ≠ ' + c.no + ')');
  if (!S.ACTION_STYLE_CORES[set.style]) bad.push('style — 화풍 키가 없다: ' + set.style);
  for (const k of Object.keys(set.slots || {})) if (!SLOTS[k]) bad.push('slots.' + k + ' — 없는 자리');
  const planFile = o.plan || set.plan, plan = planFile && fs.existsSync(planFile) ? JSON.parse(fs.readFileSync(planFile, 'utf8')) : null;
  if (planFile && !plan) bad.push('plan — 계획 파일이 없다: ' + planFile);
  const want = o.slot ? [o.slot] : Object.keys(SLOTS);
  if (o.slot && !SLOTS[o.slot]) throw new Error('자리: ' + Object.keys(SLOTS).join(' · '));
  const out = [];
  for (const slot of want) {
    const r = stateOf(set, slot, d, c, plan, bad);
    if (!r) continue;
    const x = extras(d, c), text = ST.prompt(P, L, r.st, c, x.appearance, x.face, d.tree);
    const ui = { storage: { last: c.name, cards: { [c.name]: r.st } }, prompt: text };
    if (r.cut) { ui.plan = r.cut; ui.manual_inputs = r.manual; ui.manual_why = r.why; }
    out.push({ slot, text, ui });
  }
  if (bad.length) { console.error('고칠 칸 ' + bad.length + '개 — 아무것도 쓰지 않았다:\n  ' + bad.join('\n  ')); process.exit(1); }
  let rev = '';
  try { rev = cp.execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD']).toString().trim(); } catch (e) { /* git 이 없는 곳 */ }
  for (const r of out) {
    fs.writeFileSync(path.join(o.dir, r.slot + '-prompt.txt'), r.text + '\n');
    fs.writeFileSync(path.join(o.dir, r.slot + '-ui.json'), JSON.stringify(r.ui, null, 1) + '\n');
  }
  /* 차례표 — 이 자리의 지시문을 읽어 그대로 제출하고, 적힌 그림을 첨부한다 */
  const sha = t => crypto.createHash('sha256').update(t + '\n').digest('hex').slice(0, 12);
  const att = a => a.map(x => x.endsWith('?') ? '(되면 ' + SLOTS[x.slice(0, -1)].n + ')' : SLOTS[x].n + ' ' + fileName(c.name, set.style, x)).join(' + ') || '없음';
  const lines = ['# ' + c.name + ' (' + String(c.no).padStart(4, '0') + ' · ' + c.en + ') — 지시문 묶음', '',
    '화풍 `' + set.style + '` · 만든 도구 `tools/prompt-pack.cjs build` · 생성기 코드 ' + (rev || '?') + ' · ' + new Date().toISOString(), '',
    '자리마다 `<자리>-prompt.txt` 를 **고치지 않고 그대로** 제출하고, 첨부 칸의 그림을 붙인다. 고칠 것이 있으면 settings.json 을 고쳐 build 를 다시 돌린다.',
    '기록에는 `<자리>-ui.json`(생성기 저장값과 같은 꼴)과 지시문을 둔다 — 관리기를 쓰면 `python3 tools/image-runner.py intent --card ' + c.no + ' --slot <자리> --prompt <이 폴더>/<자리>-prompt.txt --ui <이 폴더>/<자리>-ui.json`.', '',
    '| 차례 | 자리 | 첨부 | 지시문 | 낱말 | sha256(앞 12) | 올릴 파일 |', '|---|---|---|---|---|---|---|'];
  for (const r of out) lines.push('| ' + SLOTS[r.slot].n + ' | ' + r.slot + ' | ' + att(SLOTS[r.slot].attach) + ' | `' + r.slot + '-prompt.txt` | ' + P.words(r.text) + ' | `' + sha(r.text) + '` | `' + fileName(c.name, set.style, r.slot) + '` |');
  if (!o.slot) fs.writeFileSync(path.join(o.dir, 'INDEX.md'), lines.join('\n') + '\n');
  console.log('썼다 ' + out.length + '자리 → ' + o.dir + (o.slot ? '' : ' (INDEX.md)'));
}

if (require.main === module) {
  try {
    const o = args(process.argv.slice(2));
    if (o.cmd === 'init') init(o); else if (o.cmd === 'build') build(o);
    else { console.error('node tools/prompt-pack.cjs init <카드> --dir <작업 폴더> [--style 키] [--plan PLAN.json] | build --dir <작업 폴더> [--slot 자리]'); process.exit(2); }
  } catch (e) { console.error(e.message); process.exit(2); }
}
module.exports = { SLOTS, init, build, stateOf, planCut, fileName };
