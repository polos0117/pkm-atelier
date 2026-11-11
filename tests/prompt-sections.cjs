/* 칸 꼴 메카 지시문 — 새 인물 · 이어가기 · 개방이 core 칸 틀(AtelierSpec.CORE_FRAME, 화풍공방 core v4~)의 「머리말 + 다섯 칸」 으로 나온다
   (사용자 2026-11-11 「초안 없이 다 진행해줘」 — 3단계 칸 꼴 통일. 삼국지 · 원소 공방과 같은 틀).
   글은 옛 줄 꼴 그대로 자리만 옮긴다 — 이 검사는 스위치를 끈 옛 꼴과 견줘 「잃은 지시 없음 · 더한 지시 없음」 을 본다.
   달라져도 되는 글은 CHANGED 목록뿐이다(R4 줄 머리는 MAP). 일상컷은 칸 꼴이 아니다(그대로).
   Run: node tests/prompt-sections.cjs */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const ctx = { window: {}, console }; vm.createContext(ctx);
for (const f of ['prompt-spec', 'casual-tree', 'casual-tree-v2', 'concept-mecha', 'prompt-anthro', 'prompt-lifestyle']) vm.runInContext(fs.readFileSync('lib/' + f + '.js', 'utf8'), ctx);
const { AtelierSpec: S, AtelierPrompt: P, AtelierLifestyle: L } = ctx.window, T = S.PROMPT_LINES, CF = S.CORE_FRAME, SE = S.SECTIONS;
const read = f => JSON.parse(fs.readFileSync('data/' + f + '.json', 'utf8'));
const cards = read('card').cards.character, app = read('source-appearance').entries, faces = read('face-design').faces, concept = read('concept-mecha'), tree = read('casual-tree');
const words = t => (t.match(/\S+/g) || []).length;

assert(CF && CF.s1 && CF.s2 && CF.s3 && CF.s4 && CF.s5 && CF.anatomy && CF.avoid, 'core 칸 틀(CORE_FRAME) — core v4 블록');
assert(SE && SE.on === true && P.sectionsOn(), '스위치 S.SECTIONS.on 이 켜져 있다');
assert.equal(SE.costume, 'ARMOR', '3칸 낱말');

/* ── 칸 대조표 — 옛 줄 머리 → [칸(0 = 머리말), 칸 안 줄 머리]. 머리가 없는 줄(IDENTITY 의 값 줄 · 고른 장면 값)은 제 문단의 칸을 따른다 ── */
const MAP = [
  [/^INPUT: /, 0, 'Input: '], [/^SOURCE: /, 0, 'Source: '], [/^SUBJECT: /, 0, 'Subject: '],
  [/^STYLE: /, 1, ''],
  [/^FACE \(her own structure, not the style's default face\): /, 2, "Face — her own structure, not the style's default face: "],
  [/^HAIR: /, 2, 'Hair: '], [/^HAIR COLOR: /, 2, 'Hair color: '], [/^IMPRESSION (?=\()/, 2, 'Impression '], [/^IDENTITY (?=\()/, 2, 'Identity '],
  [/^ANATOMY: /, 2, 'Proportions: '], [/^BODY: /, 2, 'Body: '], [/^HANDS: /, 2, 'Hands: '],
  [/^FORM — (?:LIGHT|HEAVY|MOBILITY): /, 3, 'Costume: '], [/^FORM NOTE: /, 3, 'Form note: '], [/^ARMOR: /, 3, 'Armor: '], [/^MECHA SILHOUETTE: /, 3, 'Silhouette: '],
  [/^PALETTE: /, 3, 'Colours: '], [/^WEAR: /, 3, 'Wear: '], [/^WEAR (?=\(user choice\): )/, 3, 'Wear '], [/^HEAD: /, 3, 'Head: '], [/^MOTIFS (?=to keep: )/, 3, 'Motifs '], [/^EXPOSURE: /, 3, 'Exposure: '],
  [/^TYPE EFFECTS: /, 4, 'Type effects: '], [/^NOTE: /, 4, 'Note: '], [/^Chosen settings below /, 4, 'Chosen settings below '],
  [/^ONE FIGURE ONLY\. /, 5, 'One figure only. ']
];
/* OUTPUT 문단은 문장마다 자리가 다르다 — [그 문장의 첫머리, 칸, 칸 안 줄 머리]. 첨부 그림의 그 사람은 2칸 맨 위, 입력 · 출력 설명은 머리말(R9) */
const OUTPUT = {
  create: [['one dynamic action image', 0, 'Output: '], ['Vertical 2:3 frame', 4, 'Composition: '], ['Camera level with her face', 4, ''], ['Default stance is', 4, 'Pose: ']],
  reference: [['the ', 0, 'Output: '], ['Keep her face', 2, ''], ['Vertical 2:3 frame', 4, 'Composition: '], ['Camera level with her face', 4, ''], ['A new card-ready pose', 4, 'Pose: ']],
  overdrive: [['the OPENED (overdrive) state', 0, 'Output: '], ['Keep its camera', 2, ''], ['Change only this: ', 3, ''], ['No new armor', 5, ''], ['The pair must read', 4, '']]
};
/* ── R4~R8 로 달라진 글 전부 — 전(was) → 후(now, 빈 글 = 그 자리에서 빠진다). avoid = 5칸 Avoid 줄로 간 낱말. 이 목록 밖의 차이는 실패다 ── */
const CHANGED = [
  /* R5 — 「No …」 나열 문장 · 마디는 Avoid 로. 앞 마디가 빠져 문장 머리가 된 마디는 첫 글자만 대문자 */
  { rule: 'R5', was: 'No second character, no creature beside her, no text, no lettering, no logo, no watermark, no speech bubble, no frame border.', now: '',
    avoid: ['second character', 'creature beside her', 'text', 'lettering', 'logo', 'watermark', 'speech bubble', 'frame border'] },
  { rule: 'R5', was: 'No extra limbs; her worn features are costume, never extra limbs.', now: 'Her worn features are costume, never extra limbs.', avoid: ['extra limbs'] },
  { rule: 'R5', was: 'Her body inside keeps its size; no weapon, no cannon.', now: 'Her body inside keeps its size.', avoid: ['weapon', 'cannon'] },
  { rule: 'R5', was: 'Slim sensor fins sweep back from the temples; no helmet, no giant wings.', now: 'Slim sensor fins sweep back from the temples.', avoid: ['helmet', 'giant wings'] },
  { rule: 'R5', was: 'No new armor, no new helmet, no weapon.', now: '', avoid: ['new armor', 'new helmet', 'weapon'] },
  { rule: 'R5', was: 'illustrated in 2D; no 3D render or photorealistic appearance.', now: 'illustrated in 2D.', avoid: ['3D render', 'photorealistic appearance'] },              /* 화풍 anime_gloss */
  { rule: 'R5', was: 'illustrated in 2D anime; no 3D render or photorealistic appearance.', now: 'illustrated in 2D anime.', avoid: ['3D render', 'photorealistic appearance'] },  /* 화풍 gloss_daylight */
  { rule: 'R5', was: ' No stereotyped features.', now: '', avoid: ['stereotyped features'] },   /* 외형 값 facial ethnicity 의 풀이 글 끝 문장 */
  /* R6 — 옛 줄 이름(FORM · FACE)을 가리키던 말. 얼굴 줄이 없는 지시문(이어가기 · 개방 · 얼굴 설계 끔)은 가리킬 줄이 없다 */
  { rule: 'R6', was: 'change only her armor, as FORM says.', now: 'change only her armor, as the costume below says.' },
  { rule: 'R6', was: 'drawn to her own FACE line below', now: 'drawn to her own Face line below', when: 'face' },
  { rule: 'R6', was: 'drawn to her own FACE line below', now: 'drawn to her own face', when: 'noface' },
  /* R7 — 2칸 끝 해부 줄(CORE_FRAME.anatomy)과 글자 뜻이 그대로 겹치는 부분만 뺀다 */
  { rule: 'R7', was: 'a normal human body — one head, two arms and two legs, each joined at its natural joint; elbows,', now: 'a normal human body — elbows,' },
  { rule: 'R7', was: 'natural human hands. ', now: '' }
];
/* 제자리에 남는 「No …」(R5 의 조건 붙은 금지 · 한 지시의 일부) — 뒤 마디가 「at most …」 인 금지, 고른 값의 「No added VFX: omit …」 */
const NO_STAYS = [/No helmet; at most a slim headband or temple sensor\./, /: No added VFX: omit /];
const OLD_NAMES = /\b(?:INPUT|SOURCE|PALETTE|STYLE|SUBJECT|WEAR|HEAD|FACE|HAIR|IMPRESSION|FORM|ARMOR|MECHA|EFFECTS|EXPOSURE|OUTPUT|IDENTITY|ANATOMY|BODY|HANDS|NOTE|MOTIFS)\b/;
const used = CHANGED.map(() => 0), seen = { create: 0, reference: 0, overdrive: 0 }, range = { min: 1e9, max: 0, diff: 0 };
/* 낱말 수 범위 — 지시문 종류마다. 처음엔 전체를 250~1150 한 범위로 두었는데, 개방은 줄이 적어(입력 · 원작 · 화풍 · 바꿀 것 · 한 사람 · 몸 · 손)
   가장 짧은 화풍(cinematic_semi_real)에서 245낱말이라 하한에 걸렸고, 새 인물은 다 고른 것이 1151낱말이라 상한에 걸렸다 — 지시문이 틀린 것이 아니라 범위를 한 종류 기준으로 잡은 탓.
   2026-11-11 이 검사의 전 범위에서 잰 값: 새 인물 589~1151 · 이어가기 432~750 · 개방 245~382(줄 꼴은 각각 584~1146 · 426~744 · 238~377). 잰 값에 위아래 여유를 둔다 */
const WORDS = { create: [550, 1200], reference: [400, 800], overdrive: [220, 420] };
const byKind = { create: { min: 1e9, max: 0 }, reference: { min: 1e9, max: 0 }, overdrive: { min: 1e9, max: 0 } };
const sentences = t => t.split(/(?<=\.)\s+(?=[A-Z])/).map(x => x.trim()).filter(Boolean);
const blockOf = (B, b) => '\n' + B[b] + '\n';

function check(st, id) {
  const kind = st.form === 'overdrive' ? 'overdrive' : st.identityMode === 'reference' ? 'reference' : 'create';
  const t = P.buildPrompt(st), old = P.buildPrompt(st, { sections: false }), B = t.split('\n\n'), lines = t.split('\n').filter(Boolean);
  id = kind + ' ' + id; seen[kind]++;
  /* 1) 여섯 덩어리 · 칸 머리 = core 칸 틀 · 차례 */
  assert.equal(B.length, 6, id + ' 머리말 + 다섯 칸');
  const heads = [CF.s1, CF.s2, CF.s3.replace('{costume}', SE.costume).replace('{genre}', st.form.toUpperCase()), CF.s4, CF.s5];
  assert.deepEqual(B.slice(1).map(b => b.split('\n')[0]), heads, id + ' 칸 머리 차례');
  assert(B.slice(1).every(b => b.split('\n').length > 1), id + ' 빈 칸 없음');
  assert.deepEqual(B[0].split('\n').map(l => l.split(': ')[0]), kind === 'create' ? ['Input', 'Source', 'Subject', 'Output'] : ['Input', 'Source', 'Output'], id + ' 머리말 — 입력 · 원작 · (주제) · 출력');
  /* 2) 2칸 끝 = 해부 줄 · 빛 줄 하나 이하 · Avoid 는 5칸 맨 끝에 한 줄 */
  assert(B[2].endsWith('\n' + CF.anatomy), id + ' 2칸은 해부 줄로 끝난다');
  assert.equal(lines.filter(l => l === CF.anatomy).length, 1, id + ' 해부 줄 한 번');
  assert(lines.filter(l => /^Light: /.test(l)).length <= 1, id + ' 빛 줄 하나 이하');
  const av = lines.filter(l => /^Avoid: /.test(l));
  assert(av.length === 1 && lines[lines.length - 1] === av[0] && /^Avoid: [^.]+\.$/.test(av[0]), id + ' Avoid 한 줄 — 5칸 맨 끝');
  const avoid = av[0].slice(7, -1).split(', ');
  assert.equal(new Set(avoid).size, avoid.length, id + ' Avoid 낱말은 한 번씩');
  /* R9 — 첨부 그림의 그 사람은 2칸 맨 위 */
  if (kind !== 'create') assert(B[2].split('\n')[1].startsWith(kind === 'reference' ? 'Keep her face, ' : 'Keep its camera, '), id + ' 첨부 그림의 그 사람 — 2칸 맨 위');
  /* 3) Avoid 줄 밖에 「No …」 나열 문장 없음(조건 붙은 것만) · 고정 글(화풍 · 폼 · 비율 · 5칸)에는 「; no …」 마디도 없음 */
  for (const l of lines) if (!/^Avoid: /.test(l)) {
    const m = l.match(/(?:^|[.;:] )No [a-z0-9]/g) || [];
    assert(m.length <= NO_STAYS.filter(re => re.test(l)).length, id + ' Avoid 밖의 「No …」 문장: ' + l);
  }
  for (const l of B[1].split('\n').concat(B[5].split('\n'), lines.filter(x => /^(?:Costume|Proportions): /.test(x)))) if (!/^Avoid: /.test(l))
    assert(!/[;,] no [a-z0-9][^;.]*\.(?: |$)/.test(l.replace(NO_STAYS[0], '')) || /unless/.test(l), id + ' 「; no …」 금지 마디는 Avoid 로: ' + l);
  /* 4) 없어진 줄 이름(옛 대문자 머리) · 찌꺼기 없음 — 칸 머리 다섯 줄은 뺀다 */
  const bodyText = lines.filter(l => heads.indexOf(l) < 0).join('\n');
  assert(!OLD_NAMES.test(bodyText), id + ' 옛 줄 이름이 남았다: ' + (bodyText.match(OLD_NAMES) || [])[0]);
  assert(!/\.\.|: \.|[{}]|undefined|\[object|\n\n\n| {2}/.test(t), id + ' 찌꺼기(.. · 빈 머리 · {…} · undefined)');
  assert.equal(new Set(lines).size, lines.length, id + ' 같은 줄이 두 번 없음');
  /* 5) 잃은 지시 없음 — 옛 꼴을 문단 → 줄 → 문장으로 쪼개, 문장마다 제 칸에 그대로 있는지(달라진 글은 CHANGED 뿐) */
  const hasFace = /\nFACE \(/.test('\n' + old), moved = [];
  const change = (u, back) => { CHANGED.forEach((c, i) => {
    if (c.when && (c.when === 'face') !== hasFace) return;
    if (back) { if (c.now && u.includes(c.now)) u = u.replace(c.now, c.was); return; }
    if (u.includes(c.was)) { u = u.replace(c.was, c.now); used[i]++; (c.avoid || []).forEach(x => moved.push(x)); }
  }); return u; };
  for (const para of old.split('\n\n')) {
    let b = -1;
    for (const line of para.split('\n')) {
      const row = MAP.find(r => r[0].test(line)), out = /^OUTPUT: /.test(line);
      assert(row || out || b >= 0, id + ' 대조표에 없는 옛 줄: ' + line.slice(0, 60));
      if (out) {
        let at = null;
        for (const u of sentences(line.replace(/^OUTPUT: /, ''))) {
          at = OUTPUT[kind].find(r => u.startsWith(r[0])) || at;
          assert(at, id + ' OUTPUT 대조표에 없는 문장: ' + u);
          const v = change(u); if (!v.trim()) continue;
          assert(blockOf(B, at[1]).includes(at[2] && u.startsWith(at[0]) ? '\n' + at[2] + v : v), id + ' 잃은 지시(OUTPUT → ' + at[1] + '칸): ' + u);
        }
        continue;
      }
      if (row) b = row[1];
      const body = row ? line.replace(row[0], '') : line, nh = row ? row[2] : '';
      const v = change(body).trim();
      if (!v) { assert(!nh || !blockOf(B, b).includes('\n' + nh.trim() + ' \n'), id); continue; }
      if (nh) assert(blockOf(B, b).includes('\n' + nh + sentences(v)[0]), id + ' 줄 머리(' + nh.trim() + ') · 자리(' + b + '칸): ' + line.slice(0, 70));
      for (const u of sentences(v)) assert(B[b].includes(u), id + ' 잃은 지시(' + b + '칸): ' + u);
    }
  }
  assert.deepEqual(avoid.slice().sort(), Array.from(new Set(moved)).sort(), id + ' Avoid 줄 = 옛 꼴의 「No …」 낱말 그대로');
  /* 6) 더한 지시 없음 — 칸 꼴의 문장마다 옛 꼴에 있다(칸 머리 · 해부 줄 · Avoid 줄 · CHANGED 의 후 글만 새것) */
  const NEW_HEADS = MAP.map(r => r[2]).concat(['Output: ', 'Composition: ', 'Pose: ']).filter(Boolean).sort((a, b) => b.length - a.length);
  for (const l of lines) {
    if (heads.indexOf(l) >= 0 || l === CF.anatomy || /^Avoid: /.test(l)) continue;
    const h = NEW_HEADS.find(x => (l.startsWith(x) || l === x.trim()) && !old.includes(l)) || '';   /* 머리만 남은 줄(「One figure only.」 — 뒤 나열이 Avoid 로 갔다) */
    for (const u of sentences(l.slice(h.length))) assert(old.includes(u) || old.includes(change(u, true)), id + ' 옛 꼴에 없는 글: ' + u);
  }
  /* 7) 낱말 수 — 칸 머리 · 해부 줄 · Avoid 만큼만 달라진다. 범위는 종류마다(WORDS) */
  const w = words(t), d = w - words(old);
  range.min = Math.min(range.min, w); range.max = Math.max(range.max, w); range.diff = Math.max(range.diff, Math.abs(d));
  const r = byKind[kind]; r.min = Math.min(r.min, w); r.max = Math.max(r.max, w);
  assert(d >= -12 && d <= 24, id + ' 낱말 차이 ' + d);
  assert(w >= WORDS[kind][0] && w <= WORDS[kind][1], id + ' 낱말 ' + w + ' — ' + kind + ' 범위 ' + WORDS[kind].join('~'));
  return t;
}

const input = (c, extra) => ({ mech: c.name, sourceName: c.en, series: [c.element, c.element2].filter(Boolean).join(' / '), sourceAppearance: app[String(c.no)], faceDesign: faces[String(c.no)],
  style: S.DEFAULT_STYLE, params: [], outputMode: 'action', identityMode: 'create', form: 'light', gen: c.gen, mechaTable: concept, tree, ...extra });
const KINDS = [];
for (const form of ['light', 'heavy', 'mobility']) KINDS.push({ identityMode: 'create', form }, { identityMode: 'reference', form });
for (const baseForm of ['light', 'heavy', 'mobility', 'reference']) KINDS.push({ form: 'overdrive', baseForm, identityMode: 'reference' });

/* ── 가) 전 카드 × 지시문 종류 열(새 인물 3폼 · 이어가기 3폼 · 개방 4) — 기본 화풍 ── */
let n = 0;
for (const c of cards) for (const k of KINDS) { check(input(c, k), c.name + ' ' + JSON.stringify(k)); n++; }
/* ── 나) 화풍 열여덟 × 종류 열 — 화풍 글의 「No …」 · FACE 가리키는 말 ── */
const few = ['이상해씨', '꼬부기', '피카츄', '갸라도스', '뮤츠', '루기아'].map(x => cards.find(c => c.name === x)).filter(Boolean);
assert(few.length >= 5, '견본 카드');
for (const [style] of S.ART_STYLES) for (const c of few) for (const k of KINDS) { check(input(c, { ...k, style }), c.name + ' ' + style + ' ' + JSON.stringify(k)); n++; }
/* ── 다) 고르는 칸 전부 — 입는 법 직접 쓰기 · 머리 특징 · 얼굴 설계 끔 · 폼 메모 · 메카 옵션 · 노출 단계 · 외형 값 · 액션 연출 · 장면 값 ── */
const c0 = few[0], c1 = few[3], both = (extra, id) => { for (const k of KINDS) { check(input(c0, { ...extra, ...k }), id + ' ' + JSON.stringify(k)); n++; } };
both({ motifs: 'the bulb as a round shoulder mantle' }, 'motifs');
both({ formOverride: 'thicker shoulder plates', custom: 'light rain' }, 'formOverride + custom');
both({ faceDesignOn: false }, 'faceDesign off');
for (const lv of ['moderate', 'low']) both({ mechaExposure: lv }, 'mechaExposure ' + lv);
for (const [key] of S.HEAD_FEATURE_OPTIONS.filter(r => r[0] && r[0] !== '__custom__')) both({ headFeature: key }, 'head ' + key);
both({ headFeature: 'a small leaf hairpin' }, 'head custom');
for (const sil of concept.silhouettes) { check(input(c1, { mecha: { set: { silhouette: sil.key }, fx: concept.fx.map(f => ({ key: f.key, type: 'flying' })) } }), 'mecha ' + sil.key); n++; }
for (const slot of Object.keys(concept.parts)) for (const o of concept.parts[slot]) { check(input(c1, { mecha: { set: { [slot]: o.key }, fx: [{ key: 'hand' }] } }), 'mecha ' + slot + ' ' + o.key); n++; }
for (const d of S.PARAM_DEFS.filter(d => S.IDENTITY_GROUPS.includes(d.group) && !S.IDENTITY_EXCLUDED.includes(d.key)))
  for (const [v] of d.options.filter(([v]) => v && v !== '__custom__')) { check(input(c0, { params: [[d.key, v]] }), 'param ' + d.key + '/' + v); n++; }
check(input(c0, { params: [['eye color', 'red'], ['second eye color', 'gold'], ['body measurements (B/W/H)', '90 / 60 / 90'], ['body type', S.CARD_FIGURE], ['hairstyle', 'pixie cut'], ['hair length', 'long']] }), 'params 묶음'); n++;
const act = { identityMode: 'reference', form: 'heavy' };
for (const cat of S.ACTION_CATEGORIES) for (const ex of cat.examples) for (const id of ['create', 'reference']) { check(input(c0, { ...(id === 'reference' ? act : {}), action: { category: cat.key, example: ex.key } }), 'action ' + ex.key); n++; }
for (const ctl of S.ACTION_CONTROLS) for (const o of ctl.options) { check(input(c0, { ...act, action: { [ctl.key]: o.key } }), 'control ' + ctl.key + '/' + o.key); n++; }
for (const p of S.ACTION_POSES) { check(input(c0, { pose: p.key }), 'pose ' + p.key); n++; }
for (const [v] of S.POSE_OPTIONS.filter(([v]) => v)) { check(input(c0, { ...act, pose: v }), 'pose ' + v); n++; }
for (const [v] of S.ORIENTATION_OPTIONS.filter(([v]) => v)) { check(input(c0, { orient: v }), 'orient ' + v); n++; }
for (const [v] of S.FRAME_OPTIONS.filter(([v]) => v)) { check(input(c0, { ...act, frame: v }), 'frame ' + v); n++; }
for (const [v] of S.LENS_OPTIONS.filter(([v]) => v)) { check(input(c0, { lens: v }), 'lens ' + v); n++; }
for (const v of Object.keys(S.EXPRESSION_DETAIL)) { check(input(c0, { ...act, expr: v }), 'expr ' + v); n++; }
const full = { action: { category: S.ACTION_CATEGORIES[0].key, example: S.ACTION_CATEGORIES[0].examples[0].key, effects: 'none' }, expr: 'smirk', pose: S.ACTION_POSES[0].key, orient: 'back_to_camera', scene: 'a harbor at dusk',
  outfit: 'a short cape', custom: 'light rain', frame: S.FRAME_OPTIONS.filter(([v]) => v)[0][0], lens: S.LENS_OPTIONS.filter(([v]) => v)[0][0], camera: 'low angle', aspect: '3:2', formOverride: 'thicker shoulder plates',
  headFeature: 'accessory', params: [['facial ethnicity', 'East Asian'], ['jaw & chin', 'soft rounded jaw'], ['facial character', 'sharp'], ['body measurements (B/W/H)', '90 / 60 / 90']],
  mecha: { set: { silhouette: concept.silhouettes[1].key }, fx: [{ key: 'hand' }, { key: 'aura', type: 'flying' }] } };
for (const k of KINDS) { check(input(c1, { ...full, ...k }), '다 고른 것 ' + JSON.stringify(k)); n++; }
assert(used.every(x => x > 0), '안 쓰인 예외(CHANGED): ' + CHANGED.filter((c, i) => !used[i]).map(c => c.was).join(' | '));

/* ── 꼴 본보기 — 줄이 제 칸에(꼬부기 ① · 다 고른 갸라도스) ── */
const sq = P.buildPrompt(input(cards.find(c => c.name === '꼬부기'), {})), Q = sq.split('\n\n');
assert(sq.startsWith('Input: text only') && /^Source: Squirtle \(꼬부기\), water type\.$/m.test(Q[0]) && /^Subject: A female mecha personification character with Squirtle as her motif/m.test(Q[0]) && /^Output: one dynamic action image that is also this form's card art\.$/m.test(Q[0]), '머리말');
assert(Q[1] === CF.s1 + '\n' + P.splitNo(S.ACTION_STYLE_CORES[S.DEFAULT_STYLE]).text.replace(SE.faceRef.from, SE.faceRef.line), '1칸 — 화풍 문단(얼굴 줄은 below)');
assert(/^Face — her own structure, not the style's default face: /m.test(Q[2]) && /^Impression \(reads even at card size\): /m.test(Q[2]) && /^Proportions: natural adult proportions/m.test(Q[2]) && /^Body: a normal human body — elbows, /m.test(Q[2]) && /^Hands: Keep both hands relaxed/m.test(Q[2]), '2칸 — 얼굴 · 인상 · 비율 · 몸 · 손');
assert(Q[3].startsWith('3. ARMOR — LIGHT\nCostume: one layer of thin, close-fitting hard armor') && /^Armor: rigid hard-surface mecha armor/m.test(Q[3]) && /^Colours: brown, white, light blue, pale yellow\.$/m.test(Q[3]) && /^Wear: the brown dorsal shell/m.test(Q[3]) && /^Exposure: armor and undersuit open by design only at /m.test(Q[3]), '3칸 — 폼 · 장갑 · 색 · 입는 법 · 노출');
assert(Q[3].indexOf('\nCostume: ') < Q[3].indexOf('\nArmor: ') && Q[3].indexOf('\nArmor: ') < Q[3].indexOf('\nColours: ') && Q[3].indexOf('\nWear: ') < Q[3].indexOf('\nExposure: '), '3칸 차례');
assert(Q[4] === CF.s4 + '\nComposition: ' + T.card + '\nPose: Default stance is a standing, card-ready pose; motion, effects and setting may be dramatic while her design stays readable.', '4칸 — 구도 · 자세');
assert(Q[5] === CF.s5 + '\nOne figure only.\nAvoid: second character, creature beside her, text, lettering, logo, watermark, speech bubble, frame border, extra limbs.', '5칸 — 한 사람 · Avoid');
const rich = P.buildPrompt(input(c1, full)), R = rich.split('\n\n');
assert(/^Silhouette: [^\n]+ Solid hard-surface plates that read as armor, not cloth\.$/m.test(R[3]) && /^Form note: thicker shoulder plates$/m.test(R[3]) && /^Head: her species head features are echoed by small jewelry/m.test(R[3]), '3칸 — 실루엣 · 폼 메모 · 머리 특징');
assert(R[3].indexOf('\nCostume: ') < R[3].indexOf('\nForm note: ') && R[3].indexOf('\nForm note: ') < R[3].indexOf('\nArmor: ') && R[3].indexOf('\nArmor: ') < R[3].indexOf('\nSilhouette: '), '3칸 차례 — 폼 · 메모 · 장갑 · 실루엣');
assert(/^Identity \(chosen details override the automatic look\)\nfacial ethnicity: East Asian$/m.test(R[2]) && R[2].includes('\nB/W/H are approximate bust/waist/hip circumferences'), '2칸 — 직접 고른 외형 묶음');
assert(R[2].includes('; no pointed apex, V taper or added cheek fullness') && R[2].includes('; no implied pointed jaw') && /^Avoid: stereotyped features, /m.test(R[5]), '외형 풀이 글 — 한 지시에 딸린 「; no …」 는 제자리, 통째 「No …」 문장만 Avoid');
assert(R[4].indexOf('\nComposition: ') < R[4].indexOf('\nPose: Default stance') && R[4].indexOf('\nPose: Default stance') < R[4].indexOf('\nType effects: ') && R[4].indexOf('\nType effects: ') < R[4].indexOf('\n' + T.sceneRule) &&
  R[4].indexOf('\n' + T.sceneRule) < R[4].indexOf('\nAction category: ') && R[4].includes('\nAdded effects: No added VFX: omit ') && /\nExpression: [^\n]+\nPose: [^\n]+\nOrientation: /.test(R[4]) && R[4].endsWith('\nAspect ratio: 3:2'), '4칸 — 구도 · 기본 자세 · 타입 표현 · 고른 값 묶음(규칙 줄 아래)');
const od = P.buildPrompt(input(c1, { form: 'overdrive', baseForm: 'heavy', formOverride: 'wider gaps', custom: 'night' })), O = od.split('\n\n');
assert(O[3].startsWith('3. ARMOR — OVERDRIVE\nChange only this: the stacked outer plates swing away') && O[3].endsWith('\nForm note: wider gaps') && O[4] === CF.s4 + '\nThe pair must read as the same picture before and after she opens up.\nNote: night' &&
  O[5].endsWith('\nAvoid: new armor, new helmet, weapon, second character, creature beside her, text, lettering, logo, watermark, speech bubble, frame border.') && /^Hands: keep both hands as in the attached image; /m.test(O[2]), '개방 — 바꿀 것 3칸 · 같은 그림 4칸 · 금지 Avoid');

/* ── 금지 가르기(splitNo) — 나열만 옮기고, 조건 붙은 것 · 한 지시에 딸린 것은 그대로 ── */
const sn = (t, w) => { const r = P.splitNo(t, w); return [r.text, Array.from(r.avoid).join('|')]; };
assert.deepEqual(sn('No a, b or c.'), ['', 'a|b|c']);
assert.deepEqual(sn('Keep x; no a, no b. Next.'), ['Keep x. Next.', 'a|b']);
assert.deepEqual(sn('No extra limbs; her worn features are costume.'), ['Her worn features are costume.', 'extra limbs']);
assert.deepEqual(sn('No helmet; at most a slim headband.'), ['No helmet; at most a slim headband.', ''], '뒤 마디가 at most 면 제자리');
assert.deepEqual(sn('No hat unless she wears one, no cape.'), ['No hat unless she wears one.', 'cape'], 'unless 가 붙은 낱말은 제자리');
assert.deepEqual(sn('x: A; no implied b. No stereotyped features.', true), ['x: A; no implied b.', 'stereotyped features'], 'whole — 통째 문장만');
assert.deepEqual(sn('Added effects: No added VFX: omit a, b; use c.', true), ['Added effects: No added VFX: omit a, b; use c.', '']);
assert.deepEqual(sn('Scene: a harbor  at dusk', true), ['Scene: a harbor  at dusk', ''], '옮길 것이 없으면 글자 그대로');

/* ── 스위치 — 끄면 옛 줄 꼴 그대로 · core 칸 틀이 없어도 옛 꼴 · 일상컷은 칸 꼴이 아니다 ── */
const st0 = input(c0, {}), sec = P.buildPrompt(st0), oldForm = P.buildPrompt(st0, { sections: false });
assert(oldForm.startsWith('INPUT: text only') && oldForm.includes('\n\nSTYLE: ' + S.ACTION_STYLE_CORES[S.DEFAULT_STYLE] + '\n\n') && oldForm.includes('\n\n' + S.FORM_LINES.light + '\n\n' + T.armor + '\n\n') && oldForm.endsWith(T.handsArmor) && !oldForm.includes(CF.s1), '옛 줄 꼴');
SE.on = false; assert.equal(P.buildPrompt(st0), oldForm, '스위치를 끄면 옛 꼴'); assert(!P.sectionsOn()); SE.on = true;
const keep = S.CORE_FRAME; delete S.CORE_FRAME; assert.equal(P.buildPrompt(st0), oldForm, 'core 칸 틀이 없으면 옛 꼴'); S.CORE_FRAME = keep;
assert.equal(P.buildPrompt(st0), sec, '다시 켜면 칸 꼴');
const casual = L.buildSingle(input(c0, { outputMode: 'casual' }));
SE.on = false; const casualOff = L.buildSingle(input(c0, { outputMode: 'casual' })); SE.on = true;
assert(casual === casualOff && casual.startsWith('CHARACTER: ') && !casual.includes(CF.s1) && !casual.includes(CF.anatomy), '일상컷은 그대로(칸 꼴 아님)');

console.log('PASS 칸 꼴 메카 지시문: ' + n + '장(새 인물 ' + seen.create + ' · 이어가기 ' + seen.reference + ' · 개방 ' + seen.overdrive + ') · 칸 머리 = core 칸 틀 · 옛 꼴과 견줘 잃은 지시 · 더한 지시 없음(달라진 글 ' + CHANGED.length + '가지) · 낱말 ' + range.min + '~' + range.max + '(새 인물 ' + byKind.create.min + '~' + byKind.create.max + ' · 이어가기 ' + byKind.reference.min + '~' + byKind.reference.max + ' · 개방 ' + byKind.overdrive.min + '~' + byKind.overdrive.max + ', 옛 꼴과 차이 ' + range.diff + ' 안)');
