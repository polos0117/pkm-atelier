#!/usr/bin/env node
/* 일상컷 계획기 — 생성 전에 세 장의 생성기 선택값을 도구가 정한다(lib/casual-plan.js). IMAGE_RULES.md 3절 "일상컷 장면 설정 순서" 0.

   node tools/casual-plan.cjs <카드> [<카드> …] --session <이름> [--reserve] [--push] [--v1]
       [--refill <카드>] [--avoid <카드>:<컷>:<칸>=<값>] [--keep <카드>:<컷,컷>] [--seed <씨앗>] [--out PLAN.json] [--no-pull] [--repos <img> <img-2> <img-3>]

   1. 그림 저장소를 받아 둔다(--no-pull 이 아니면 셋 다 pull --rebase). 장부·예약이 있는 pkm-atelier-img-2 에 커밋 안 한 변경이 있으면 멈춘다.
   2. tools/casual-ledger.py view --fresh 로 기록 + 세션별 예약을 읽는다(장부 파일은 쓰지 않는다 — 세션끼리 장부 커밋이 부딪치지 않게).
   3. 배치의 캐릭터를 차례로 정하고, casual-ledger.py check 로 맞춰 본다. 걸리면 씨앗을 바꿔 다시 정한다(사람 손이 안 간다).
   4. --reserve 면 casual-ledger.py reserve 로 records/casual-reservations/<세션>.json 에 적고, --push 면 그 파일만 commit·push 한다.
      push 가 밀리면 rebase 하고(세션별 파일이라 충돌이 없다) 새로 들어온 다른 세션 예약으로 다시 check — 걸리면 다시 정한다.
   5. 컷마다 선택값과 생성기 주소(prompt.html?mech=…&casual=… — 생성기가 값을 채우고 모두 잠근다)를 보여 준다. 허브 통합 생성기 주소(같은 꼴, ?a=pkm&…)도 한 줄 더.
      의상·장면 칸은 작업자가 쓴다: 계획의 garments(옷 종류) · expose(드러내는 방식 둘) · lead(장면 칸 첫머리) 를 따른다.

   이미지 도구가 막았거나 고른 값이 장면과 맞지 않으면 손으로 바꾸지 않고 --avoid 로 다시 정한다:
       node tools/casual-plan.cjs 샤로다 --session s1 --avoid 샤로다:2:act=sunbed --keep 샤로다:1,3 --reserve --push
   (--keep 은 이미 만든 컷 — 이 세션의 예약에서 그대로 두고 나머지만 다시 정한다)
   생김새 색인(data/casual-look.json, rust/casual-look 이 만든다)이 있으면 생김새가 몰린 장면·구도·옷에 벌점을 준다.
   2026-10-29 일상컷 트리(B안): 장면은 트리 길(시대·장소·하는 일·의상 계열·옷)로 정한다. 장부의 옛 칸(갈래/예시)은 casual-ledger.py view 가
   트리 변환표로 길을 붙여 준다 — 생김새 몰림도 그 길(path:<장소>/<하는 일>·group:<장소 묶음>)로 센다(Rust 색인은 그대로). --avoid 칸은 era·place·act·ofam·item·group·pose·orient·frame·lens·expr
   버전2(2026-10-30 기본, docs/CASUAL_TREE_V2.md) — 버전2 칸으로 정한다(lib/casual-plan.js planV2). 버전2 컷은 장부 비교에서 짓(소품 동작 · 몸 자세+손) ·
   몸 방향+머리 방향으로 센다. --avoid 칸은 era·place·ofam·item·group·posture·body·frame·use·expr.
   --v1 이면 예전 버전1 칸(하는 일 · 자세 · 방향 · 화각)으로 정한다 — 그때 --avoid 칸은 era·place·act·ofam·item·group·pose·orient·frame·lens·expr */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const P = require(path.join(ROOT, 'lib', 'casual-plan.js'));
const GENERATOR = 'https://polos0117.github.io/pkm-atelier/prompt.html';
/* 허브 통합 생성기도 같은 주소 꼴(?a=pkm&mech=&casual=)을 받는다 — 값을 채우고 계획 칸은 랜덤이 안 바꾼다(2026-10-29) */
const HUB = 'https://polos0117.github.io/prompt.html?a=pkm';
const TREE = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'casual-tree.json'), 'utf8'));
const TREE2 = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'casual-tree-v2.json'), 'utf8'));

function args(argv) {
  const o = { v2: true, cards: [], avoid: [], refill: [], keep: {}, repos: ['pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3'].map(n => path.join(ROOT, '..', n)) };   // [1] 이 장부·예약 자리
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--session') o.session = argv[++i];
    else if (a === '--seed') o.seed = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--reserve') o.reserve = true;
    else if (a === '--push') o.push = o.reserve = true;
    else if (a === '--no-pull') o.noPull = true;
    else if (a === '--json') o.json = true;
    else if (a === '--v2') o.v2 = true;   /* 기본이다 — 예전 명령을 그대로 받는다 */
    else if (a === '--v1') o.v2 = false;
    else if (a === '--refill') o.refill.push(argv[++i]);
    else if (a === '--avoid') o.avoid.push(argv[++i]);
    else if (a === '--keep') { const m = /^(.+?):([\d,]+)$/.exec(argv[++i] || ''); if (!m) throw new Error('--keep 은 카드:컷번호(1,3)'); o.keep[m[1]] = m[2].split(',').map(Number); }
    else if (a === '--repos') { o.repos = []; while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) o.repos.push(argv[++i]); }
    else if (a.startsWith('--')) throw new Error('모르는 옵션 ' + a);
    else o.cards.push(a);
  }
  o.cards = o.cards.concat(o.refill.filter(c => !o.cards.includes(c)));
  if (!o.cards.length) throw new Error('카드 이름이 필요하다');
  if (o.reserve && !o.session) throw new Error('--reserve 에는 --session 이 필요하다(예약 파일 이름)');
  return o;
}
function spec() {
  const c = { window: {} }; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'lib', 'prompt-spec.js'), 'utf8'), c);
  return c.window.AtelierSpec;
}
const git = (repo, ...a) => cp.execFileSync('git', ['-C', repo, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const ledgerPy = (o, ...a) => cp.execFileSync('python3', [path.join(ROOT, 'tools', 'casual-ledger.py'), ...a, '--repos', ...o.repos,
  '--ledger', path.join(o.repos[1], 'records', 'casual-ledger.json')], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'pipe'] });

function view(o) { return JSON.parse(ledgerPy(o, 'view', '--fresh')).entries; }
/* 생김새 색인 → 값마다 몰림 — 그 값을 쓴 지난 컷들의 crowd(가까운 이웃 수) 평균 */
function lookCrowd(entries, tree = TREE) {
  const f = path.join(ROOT, 'data', 'casual-look.json');
  if (!fs.existsSync(f)) return null;
  const look = JSON.parse(fs.readFileSync(f, 'utf8')), per = {};
  for (const c of look.cuts || []) per[c.card + '#' + c.cut] = c.crowd || 0;
  const sum = {}, cnt = {};
  const add = (k, v) => { sum[k] = (sum[k] || 0) + v; cnt[k] = (cnt[k] || 0) + 1; };
  for (const e of entries) for (const c of e.cuts) {
    const v = per[e.card + '#' + c.cut]; if (v == null) continue;
    const q = P.pathOf(tree, c), pl = (tree.places || []).concat(TREE2.extra_places || []).find(x => x.key === q.place);
    add('path:' + P.pathKey(q), v); if (pl) add('group:' + pl.group, v); add('pair:' + q.orient + '|' + q.frame, v);
    for (const g of c.garments || []) add('garment:' + g, v);
  }
  const crowd = {};
  for (const k in sum) crowd[k] = sum[k] / cnt[k];
  return { crowd, built: look.built, cuts: (look.cuts || []).length };
}
function speciesOf(cards, card) {
  const c = cards.find(x => x.name === card);
  const d = new Date(Date.now() + 9 * 36e5).toISOString().slice(0, 10).replace(/-/g, '');
  return (c ? c.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : card) + '-' + d;
}

function planBatch(o, S, entries, look, cards, attempt) {
  const batch = [];
  for (const card of o.cards) {
    const refill = o.refill.includes(card);
    const mine = entries.filter(e => e.card === card && e.status !== 'reserved').pop();
    if (!refill && mine) throw new Error(card + ' 는 이미 일상컷이 등록됐다 — 빈 컷을 채우려면 --refill');
    if (refill && !mine) throw new Error(card + ' 는 등록된 일상컷이 없다 — --refill 없이 새로 정한다');
    let kept = refill ? mine.cuts.map(c => ({ ...c })) : [];
    if (o.keep[card]) {
      /* 이미 만든 컷은 이 세션의 예약에서 그대로 — 나머지만 다시 정한다 */
      const res = entries.filter(e => e.card === card && e.status === 'reserved' && e.session === o.session).pop();
      if (!res) throw new Error(card + ' 의 이 세션(' + o.session + ') 예약이 없다 — --keep 은 예약한 세션에서만');
      kept = res.cuts.filter(c => o.keep[card].includes(c.cut)).map(c => ({ ...c, kept: true }));
    }
    if (refill && kept.length >= 3) throw new Error(card + ' 는 세 장이 다 있다');
    const avoid = o.avoid.map(a => { const m = /^(.+?):(\d+)?:(\w+)=(.+)$/.exec(a); if (!m) throw new Error('--avoid 는 카드:컷:칸=값'); return m; })
      .filter(m => m[1] === card).map(m => ({ cut: m[2] ? Number(m[2]) : null, field: m[3], value: m[4] }));
    /* 버전마다 칸이 다르다 — 없는 칸을 피하라고 하면 아무것도 안 피하고 조용히 지나간다 */
    const FIELDS = o.v2 ? ['era', 'place', 'ofam', 'item', 'group', 'posture', 'body', 'frame', 'use', 'expr'] : ['era', 'place', 'act', 'ofam', 'item', 'group', 'pose', 'orient', 'frame', 'lens', 'expr'];
    for (const x of avoid) if (!FIELDS.includes(x.field)) throw new Error('--avoid 칸 ' + x.field + ' 는 ' + (o.v2 ? '버전2' : '버전1(--v1)') + ' 에 없다 — ' + FIELDS.join('·'));
    const comparisonEntries = entries.filter(e => !o.cards.includes(e.card));
    /* 뒤에 정할 다시 채우기 캐릭터의 등록된 컷 — 지금 정하는 컷이 그것과 겹치면 안 된다 */
    const fixed = o.cards.slice(o.cards.indexOf(card) + 1).filter(c => o.refill.includes(c)).map(c => {
      const m = entries.filter(e => e.card === c && e.status !== 'reserved').pop();
      return m ? { card: c, cuts: m.cuts } : null;
    }).filter(Boolean);
    const gen = (cards.find(x => x.name === card) || {}).gen;
    const p = (o.v2 ? P.planV2 : P.plan)({ S, tree: TREE, tree2: TREE2, subject: { gen }, entries: comparisonEntries, card, batch, fixed, look, refill, kept, avoid, seed: [o.seed || o.session || 'plan', card, attempt].join('|') });
    batch.push({ card, species: refill ? mine.species : speciesOf(cards, card), refill: refill || undefined, cuts: p.cuts, why: p.why, claims: p.claims });
  }
  return { session: o.session || 'dry-run', planner: 'tools/casual-plan.cjs', characters: batch };
}
function check(o, planFile) {
  try { return { ok: true, out: ledgerPy(o, 'check', planFile, '--fresh') }; }
  catch (e) { return { ok: false, out: String(e.stdout || '') + String(e.stderr || '') }; }
}
function solve(o, S, cards) {
  const entries = view(o), look = lookCrowd(entries);
  const file = o.out || path.join(require('node:os').tmpdir(), 'casual-plan-' + process.pid + '.json');
  for (let attempt = 0; attempt < 40; attempt++) {
    /* 그 씨앗으로 짝을 못 찾아 계획기가 멈추면(드물다 — 장부가 바뀌면 고르는 길이 바뀐다) 장부 check 에 걸린 것처럼 다음 씨앗으로 */
    let plan, r;
    try { plan = planBatch(o, S, entries, look, cards, attempt); }
    catch (e) { if (!/^casual-plan/.test(e.message)) throw e; r = { ok: false, out: '  ✗ ' + e.message }; }
    if (plan) { fs.writeFileSync(file, JSON.stringify(plan, null, 1) + '\n'); r = check(o, file); }
    if (r.ok) return { plan, file, look, attempt, entries };
    if (attempt === 39) throw new Error('40번 정해도 장부 조건을 못 맞췄다:\n' + r.out);
  }
}

/* 계획기가 돌려준 까닭(lib 은 값만 준다)을 말로 */
function whyText(why) {
  const r = why.required || {};
  const req = r.slots && r.slots.length
    ? '필수 갈래 자리 ' + r.slots.join('·') + (r.two ? ' — 앞 넷이 모두 한 장이라 두 장' : '') + (r.prev ? ' (앞 캐릭터 ' + r.prev.join('·') + ')' : '')
    : '필수 갈래는 남은 컷에 있다';
  return req + (why.low && why.low.length ? ' · 덜 쓴 장소 묶음 ' + why.low.join('·') : '');
}

/* 버전2 컷을 말로 — 시대 · 장소 · 의상(옷) · 몸 자세 · 프레이밍 · 몸 방향 · 손 · 소품 동작(역할) */
function v2Text(c) {
  global.window = global.window || global; require(path.join(ROOT, 'lib', 'casual-tree-v2.js'));
  const C2 = globalThis.AtelierCasualTreeV2, t = C2.make(TREE2, TREE), by = (list, k) => (list || []).find(x => x.key === k) || {};
  const f = by(TREE.outfits, c.ofam), it = by(f.items, c.item), u = C2.use(t, c.use);
  return [by(TREE.eras, c.era).ko, (C2.place(t, c.place) || {}).ko, (f.ko || c.ofam) + (it.ko ? '(' + it.ko + ')' : ''), (C2.posture(t, c.posture) || {}).ko, c.frame,
    by(t.v2.body, c.body).ko + '·' + by(t.v2.head, c.head).ko, '손 ' + [c.right || 'AUTO', c.left || 'AUTO'].join('/'), u ? (u.role_ko ? u.role_ko + ' · ' : '') + u.ko : ''].filter(Boolean).join(' · ');
}
/* 길을 말로 — 시대 · 장소 · 하는 일 · 의상 계열(옷). 옛 칸은 갈래/예시도 */
function pathText(c) {
  if (c.treeV === 2) return v2Text(c);
  const q = P.pathOf(TREE, c), by = (list, k) => (list || []).find(x => x.key === k) || {};
  const f = by(TREE.outfits, q.ofam), it = by(f.items, q.item);
  return [by(TREE.eras, q.era).ko, by(TREE.places, q.place).ko, by(TREE.activities, q.act).ko, (f.ko || q.ofam) + (it.ko ? '(' + it.ko + ')' : '')].join(' · ') +
    (c.place ? '' : ' [옛 칸 ' + c.cat + '/' + c.ex + ']');
}
function show(o, res) {
  const lines = [];
  lines.push('일상컷 계획 — 세션 ' + res.plan.session + ' · 장부 ' + res.entries.length + '칸' +
    (res.look ? ' · 생김새 색인 ' + res.look.cuts + '컷(' + res.look.built + ')' : ' · 생김새 색인 없음') + (res.attempt ? ' · 다시 정한 횟수 ' + res.attempt : ''));
  for (const ch of res.plan.characters) {
    lines.push('', '■ ' + ch.card + ' (' + ch.species + ')' + (ch.refill ? ' — 빈 컷 다시 채우기' : '') + ' · ' + whyText(ch.why));
    for (const c of ch.cuts) {
      if (c.kept) { lines.push('  ' + c.cut + '번 등록됨 — ' + pathText(c)); continue; }
      if (c.treeV === 2) lines.push('  ' + c.cut + '번 ' + (P.isRequired(TREE, c) ? '★ ' : '') + pathText(c) + ' · 표정 ' + (c.expr || '—') + ' [버전2]');
      else lines.push('  ' + c.cut + '번 ' + (P.isRequired(TREE, c) ? '★ ' : '') + pathText(c) + ' · 표정 ' + (c.expr || '—') + ' · 자세 ' + (c.pose || '하는 일대로') + ' · 방향 ' + c.orient + ' · 프레이밍 ' + c.frame + ' · 화각 ' + c.lens);
      lines.push('       세부 강도 ' + ['overall_intensity', 'skin_exposure', 'action_level', 'source_influence', 'separates_preference'].map(k => c.axes[k]).join(' / ') +
        ' · 옷 ' + c.garments.join('+') + ' · 드러내기 ' + c.expose.join(', ') + ' · 장면 칸 첫머리 ' + c.lead);
      lines.push('       ' + GENERATOR + '?' + P.generatorQuery(ch.card, c));
      lines.push('       허브 ' + HUB + '&' + P.generatorQuery(ch.card, c));
    }
  }
  lines.push('', '계획 ' + res.file + ' — casual-ledger.py check 통과');
  lines.push('지시문 묶음: node tools/prompt-pack.cjs init <카드> --dir <작업 폴더> --plan <--out 으로 받은 계획 파일> → settings.json 을 채우고 build (IMAGE_RULES 3절 「지시문 묶음」)');
  return lines.join('\n');
}

function reserve(o, S, cards) {
  const img2 = o.repos[1], rel = path.join('records', 'casual-reservations', o.session.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+|[-.]+$/g, '') + '.json');
  for (let round = 0; round < 4; round++) {
    const res = solve(o, S, cards);
    ledgerPy(o, 'reserve', res.file, '--fresh');
    if (!o.push) return res;
    git(img2, 'add', rel);
    git(img2, 'commit', '-q', '-m', 'Reserve casual plan ' + res.plan.characters.map(c => c.card).join(' ') + ' (' + o.session + ')');
    try { git(img2, 'push', '-q', 'origin', 'HEAD:main'); return res; }
    catch (e) {
      /* 밀렸다 — 남의 예약 파일만 들어왔을 것이다(세션별 파일). rebase 하고 그 예약까지 보고 다시 정한다 */
      git(img2, 'pull', '-q', '--rebase', 'origin', 'main');
      const again = check(o, res.file);
      if (again.ok) { git(img2, 'push', '-q', 'origin', 'HEAD:main'); return res; }
      process.stderr.write('다른 세션의 예약과 겹쳐 다시 정한다\n');
    }
  }
  throw new Error('네 번 push 가 밀렸다 — 잠시 뒤 다시');
}

if (require.main === module) {
  try {
    const o = args(process.argv.slice(2)), S = spec();
    const cards = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'card.json'), 'utf8')).cards.character;
    for (const c of o.cards) if (!cards.some(x => x.name === c)) throw new Error('그런 카드가 없다: ' + c);
    if (!o.noPull) for (const r of o.repos) {
      if (r === o.repos[1] && git(r, 'status', '--porcelain').trim()) throw new Error(r + ' 에 커밋 안 한 변경이 있다 — 정리한 뒤 다시');
      git(r, 'pull', '-q', '--rebase', 'origin', 'main');
    }
    const res = o.reserve ? reserve(o, S, cards) : solve(o, S, cards);
    process.stdout.write((o.json ? JSON.stringify(res.plan, null, 1) : show(o, res) + (o.reserve ? '\n예약 ' + (o.push ? '— push 했다. 이제 생성한다' : '— 그림 저장소에 그 파일만 commit·push 한 뒤 생성한다') : '\n(예약 안 함 — --reserve --push 로 적는다)')) + '\n');
  } catch (e) { process.stderr.write('✗ ' + e.message + '\n'); process.exit(1); }
}
module.exports = { args, planBatch, lookCrowd, show, pathText };
