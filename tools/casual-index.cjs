#!/usr/bin/env node
/* 일상컷 색인 — 그림 저장소들의 records 에서 일상컷 기록을 읽어 data/casual-index.json 을 쓴다(2026-11-17 사용자 「저거를 목록을 두고 확인할 수 있는 방법은 없을까?
   위치는 허브가 좋을거 같은데, 허브에서 간단하게만. 필수컷 만들 때 뜬 갈래랑 의상이랑, 게임코스튬 때 쓴 게임, 케릭터, 의상갈래 정도만 알 수 있으면 좋겠는데」 →
   「응 그렇게 진행해줘. 우리쪽에서 고르는건 한글로 표시되게 해줘. gpt 쪽은 영어로 설계하니까 그건 어쩔 수 없이 놔두고」). 허브 「일상컷 목록」(casual.html)이 읽는다.
   세 공방(삼국지 · 원소 · pkm)이 같은 꼴을 쓴다 — { version: 1, atelier: 'pkm', built, source: [그림 저장소], rows: [한 컷 한 줄] }. 그림은 읽지 않는다.

   node tools/casual-index.cjs [--repos <img> <img-2> <img-3> <img-4> <img-5>] [--img data/img.json] [--out data/casual-index.json] [--check]
     --repos  그림 저장소 폴더(차례는 lib/img.js BASES · tools/register-images.py SHARDS 와 같다 — 이름은 차례로 정한다). 기본은 옆 폴더 ../pkm-atelier-img ~ -5.
              없는 폴더는 건너뛴다(source 에 안 적힌다). 등록 워크플로는 img-repo ~ img-repo-5 를 준다.
     --img    등록부 — 여기 적힌 일상컷(<카드>_<화풍>_f_casualN.webp)만 줄로 낸다(막혀서 못 그린 · 등록 전 컷은 뺀다). 파일이 없으면 거르지 않는다.
     --check  쓰지 않고 몇 줄인지만 찍는다

   한 컷 = 기록 폴더(records/<폴더>/) 하나의 casualN — 장부(tools/casual-ledger.py read_records)와 같은 길:
     casualN-refill-ui.json 이 있으면 그것, 없으면 casualN-ui.json. 곁가지 기록(casualN-blocked-ui.json · blocked-casualN-ui.json · casualN-bold-ui.json ·
     attempts/ · blocked-attempts/ … 아래 폴더)은 같은 컷의 막힌 · 버린 시도라 줄로 내지 않는다. 기록의 화풍이 등록부와 안 맞으면(화풍 없는 옛 기록 · 이름을 바꿔 올린 컷) styleOf 가 고른다. 자동화 관리기가 받아들인 교체(records/automation/state.json
     replacements · accepted)는 그 기록으로 바꿔 읽는다. 같은 카드 · 화풍 · 번호가 여러 폴더에 있으면 화풍이 기록 그대로인 것 → 등록부 where 의 저장소 → 늦은 폴더 날짜 → 뒤 저장소 차례.
   필수 표시(required) — pkm 은 의상 계열로 정한다(lib/casual-plan.js isRequired · costumeFam · cosplayFam 과 같은 표 data/casual-tree.json):
     필수 갈래(required.outfits — 역할극 · 수영복 · 란제리풍, 옛 칸 갈래 adult_roleplay · swimwear · lingerie · retro_glamour, 세 장 시절 레트로) ·
     포켓몬 코스튬(costume_required) · 게임 코스프레(cosplay_required) · 캐릭터만의 컷(90번 — own). 자유 설계 칸(ofree · sfree · xfree)은 맡은 쪽이 옷을 지으니 필수 · 의상 칸을 비운다.
   한글: 의상 계열 · 옷은 트리 ko, 옷 색은 lib/prompt-spec.js OUTFIT_COLORS(shade ko — shade 가 없는 옛 컷은 묶음 ko), 게임 · 재단은 data/game-cosplay.json ko,
     캐릭터는 그 게임 characters[].ko(이름은 대소문자 · 빈칸 · 부호 빼고 견준다 — lib/game-cosplay.js nameKey) → 주인공 하나 게임의 character_ko → 없으면 null.
     GPT 가 지은 것(자유 설계의 Outfit 줄 · GPT 가 골랐던 옛 코스프레 캐릭터)은 기록 그대로 영어 */
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const ROOT = path.resolve(__dirname, '..');
const REPOS = ['pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3', 'pkm-atelier-img-4', 'pkm-atelier-img-5'];
const GC = require(path.join(ROOT, 'lib', 'game-cosplay.js'));
const CAT_FAM = { adult_roleplay: 'roleplay', swimwear: 'swimwear', lingerie: 'lingerie', retro_glamour: 'retro' };   /* 장부 옛 칸의 필수 갈래 → 트리 의상 계열 */
const RETRO_FROM = '2026-10-26', RETRO_TO = '2026-11-06';   /* 레트로 글래머가 필수였던 세 장 시절(IMAGE_RULES 3절 필수 갈래 표) */
const FREE_KO = { ofree: '옷 자유', gfree: '갈래 자유', sfree: '장면 자유', xfree: '갈래 · 상황 자유' };
const LEVEL_KO = { bold: '높음', moderate: '중간', low: '낮음' };
const REQ_KO = { own: '캐릭터만의 컷' };

const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const str = (x) => (typeof x === 'string' ? x.trim() : '');
function spec(root) {
  const c = { window: {} }; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(root, 'lib', 'prompt-spec.js'), 'utf8'), c);
  return c.window.AtelierSpec;
}
/* 표 — 트리 · 게임 코스프레 목록 · 옷 색 · 캐릭터만의 컷 · 카드 */
function tables(root) {
  root = root || ROOT;
  const S = spec(root), tree = readJson(path.join(root, 'data', 'casual-tree.json'));
  const gc = readJson(path.join(root, 'data', 'game-cosplay.json'));
  let own = {}; try { own = readJson(path.join(root, 'data', 'casual-own.json')).cards || {}; } catch (e) { own = {}; }
  let cards = []; try { cards = (readJson(path.join(root, 'data', 'card.json')).cards || {}).character || []; } catch (e) { cards = []; }
  const fams = {}, items = {};
  (tree.outfits || []).forEach((o) => { fams[o.key] = o; (o.items || []).forEach((it) => { items[o.key + '/' + it.key] = it; if (!items['*/' + it.key]) items['*/' + it.key] = it; }); });
  const byEn = {};
  cards.forEach((c) => { if (c.en) byEn[String(c.en).toLowerCase().replace(/[^a-z0-9]/g, '')] = c.name; });
  return { S, tree, gc, own, fams, items, byEn,
    req: (tree.required || {}).outfits || [], reqLegacy: (tree.required || {}).legacy_outfits || [],
    costume: (tree.costume_required || {}).outfit || '', cosplay: (tree.cosplay_required || {}).outfit || '' };
}
function storageOf(rec) {
  let st = (rec && rec.storage) || (rec && rec.cards ? rec : {});   /* 저장값을 맨 위에 그대로 적은 옛 기록도 */
  if (!st.cards && !st.scenes && typeof st.pkm_prompt_v2 === 'string') { try { st = JSON.parse(st.pkm_prompt_v2); } catch (e) { st = {}; } }
  return st;
}
function dateOf(s) { const m = /(20\d\d)-?(\d\d)-?(\d\d)/.exec(s || ''); return m ? m[1] + '-' + m[2] + '-' + m[3] : ''; }
/* 폴더 이름(<종 영어 이름>-<날짜>…)에서 카드 — 기록에 카드 이름이 없는 옛 꼴만 */
function cardOfFolder(T, folder) {
  const parts = folder.split('-');
  for (let i = parts.length; i > 0; i--) { const k = parts.slice(0, i).join('').toLowerCase().replace(/[^a-z0-9]/g, ''); if (T.byEn[k]) return T.byEn[k]; }
  return '';
}
/* 기록 하나 → { card, style, scene } — 세 꼴: 생성기 저장값 { last, cards }, 카드 상태 그대로 { style, scenes }, 옛 납작한 꼴(맨 위에 cat · outfit · style) */
function sceneOf(T, rec, folder) {
  const st = storageOf(rec);
  let card = str(st.last) || str(rec.card) || str(rec.mech);
  if (!card && !st.cards) card = cardOfFolder(T, folder);
  const cd = (st.cards || {})[card] || (st.scenes ? st : null);
  if (cd && (cd.scenes || {}).casual) return { card, style: str(cd.style) || str(rec.style), scene: cd.scenes.casual };
  if (rec.outputMode === 'casual' || rec.cat) return { card, style: str(rec.style), scene: rec };
  /* 2026-10-10 ~ 10-14 손으로 남긴 기록(input · state · controls · selected · ui …) — 안에서 장면 칸(scenes.casual · ofam · cat · category)이 든 첫 칸을 찾는다 */
  const hit = deepScene(rec);
  if (!hit) return { card, style: str(rec.style), scene: null };
  const sc = hit.scene.cat || !hit.scene.category ? hit.scene : Object.assign({}, hit.scene, { cat: val(hit.scene.category), ex: val(hit.scene.ex) || val(hit.scene.example) });
  return { card: card || hit.card || cardOfFolder(T, folder), style: val(rec.style) || hit.style, scene: sc };
}
const val = (v) => (typeof v === 'string' ? v.trim() : v && typeof v.value === 'string' ? v.value.trim() : '');   /* 옛 화면 기록의 { value, label } */
function deepScene(rec) {
  let found = null, style = '', card = '';
  (function walk(x, depth) {
    if (found || depth > 8 || !x) return;
    if (typeof x === 'string') { if (/^\s*\{/.test(x) && x.length < 2e6) { try { walk(JSON.parse(x), depth + 1); } catch (e) { /* 글 */ } } return; }
    if (typeof x !== 'object') return;
    if (Array.isArray(x)) { x.forEach((y) => walk(y, depth + 1)); return; }
    if (!style && val(x.style)) style = val(x.style);
    if (!card && typeof x.last === 'string') card = x.last.trim();
    if (x.scenes && x.scenes.casual) { found = x.scenes.casual; if (typeof x.style === 'string') style = x.style.trim(); return; }
    if (typeof x.ofam === 'string' || typeof x.cat === 'string' || (val(x.category) && ('outfit' in x || 'example' in x))) { found = x; return; }
    Object.keys(x).forEach((k) => { if (k !== 'generation') walk(x[k], depth + 1); });
  })(rec, 0);
  return found ? { scene: found, style, card } : null;
}
/* 지시문 속 Outfit 줄 — 우리 주문 줄(「Outfit (yours)」 · 「Outfit and situation (yours)」)과 옷 색 줄은 빼고 맡은 쪽이 쓴 줄 */
function outfitLine(text) {
  const lines = String(text || '').split(/\r?\n/);
  for (const raw of lines) {
    const l = raw.replace(/^\s*[-*]\s*/, '').trim();
    if (!/^Outfit\b/.test(l) || /^Outfit\s+colou?rs?\b/i.test(l) || /^Outfit\s*(?:and situation\s*)?\(yours\)/i.test(l)) continue;
    const m = /^Outfit\s*:\s*(.+)$/.exec(l);
    if (m) return m[1].trim();
    if (/^Outfit[^:]{0,40}:\s*\S/.test(l)) return l;
  }
  /* 장면 글 가운데 끼운 「… Outfit: …. Situation: …」 — 다음 「Xxx:」 칸 앞까지 */
  for (const l of lines) {
    const m = /(?:^|[.;]\s+)Outfit\s*:\s*(.+?)(?=\s+[A-Z][A-Za-z ]{0,24}:\s|$)/.exec(l);
    if (m) return m[1].trim();
  }
  return null;
}
function itemOf(T, fam, key) { return (fam && T.items[fam + '/' + key]) || T.items['*/' + key] || null; }
function shadeOf(T, sc) {
  const C = T.S.OUTFIT_COLORS || [], k = str(sc.shade), g = C.filter((r) => r.key === str(sc.ocolor))[0];
  if (k) {
    const s = ((g && g.shades) || []).filter((x) => x.key === k)[0] || [].concat(...C.map((r) => r.shades || [])).filter((x) => x.key === k)[0];
    return { shade: k, shadeKo: s ? s.ko : null };
  }
  if (g) return { shade: g.key, shadeKo: g.ko };   /* shade 가 없는 옛 컷 — 그때 지시문에 간 묶음 */
  return { shade: null, shadeKo: null };
}
function characterKo(gc, gameKey, name) {
  const g = GC.game(gc, gameKey);
  if (!g) return null;
  const k = GC.nameKey(name);
  const c = k && (g.characters || []).filter((x) => x && GC.nameKey(x.name) === k)[0];
  if (c && str(c.ko)) return str(c.ko);
  if (!g.many && str(g.character_ko)) return str(g.character_ko);
  return null;
}
function cosplayOf(T, sc, rec, item) {
  const s = sc.cosplay && typeof sc.cosplay === 'object' ? sc.cosplay : null, gen = (rec.generation || {}).cosplay || null;
  const game = str(s && s.game) || str(gen && gen.game);
  if (!game) return null;
  const sChar = str(s && s.character), gChar = str(gen && gen.character), g = GC.game(T.gc, game);
  const character = sChar || gChar || (g && !g.many ? str(g.character) : '') || null;
  const cut = str(s && s.cut) || str(gen && gen.cut) || (str(item).indexOf('gc_') === 0 ? str(item).slice(3) : '') || null, c = cut && GC.cut(T.gc, cut);
  return { game, gameKo: (g && str(g.ko)) || null, character, characterKo: character ? characterKo(T.gc, game, character) : null,
    cut, cutKo: (c && str(c.ko)) || null, by: sChar || (g && !g.many) ? 'planner' : 'gpt', round: (s && s.round === 2) ? 2 : 1 };
}
/* 옛 칸(갈래 cat · 예시 ex)만 있는 컷 — 트리 변환표(legacy)로 의상 계열 · 옷(tools/casual-ledger.py with_path 와 같다) */
function legacyOutfit(T, sc) {
  const L = T.tree.legacy || {};
  let v = L[str(sc.cat) + '/' + str(sc.ex)] || L[str(sc.cat) + '/'] || {};
  if (v.preset) { const pr = (T.tree.presets || []).filter((p) => p.key === v.preset)[0] || {}; v = { outfit: pr.outfit, item: pr.item }; }
  return { fam: str(v.outfit), item: str(v.item) };
}
/* 한 컷 → 한 줄 */
function rowOf(T, c) {
  const sc = c.scene || {}, rec = c.rec || {};
  const free = sc.sfree ? 'sfree' : sc.xfree ? 'xfree' : sc.gfree ? 'gfree' : sc.ofree ? 'ofree' : null;
  const own = c.n === 90 || !!sc.own;
  let fam = str(sc.ofam), item = str(sc.item);
  if (!fam && !str(sc.place) && sc.cat) { const l = legacyOutfit(T, sc); fam = l.fam; item = item || l.item; }
  const row = { card: c.card, name: c.card, world: '', worldKo: '', n: c.n, date: c.date, style: c.style, path: c.path,
    required: null, requiredKo: null, family: null, familyKo: null, item: null, itemKo: null, shade: null, shadeKo: null, cosplay: null, free: null };
  if (own) {
    const o = rec.own || {}, job = str(o.job_ko) || str(((((T.own[c.card] || {}).worlds || {}).all) || {}).job_ko);
    const lv = str(o.level) || str(((rec.generation || {}).own || {}).level) || str((sc.axes || {}).skin_exposure);
    Object.assign(row, { required: 'own', requiredKo: REQ_KO.own, item: 'own' + (lv ? ':' + lv : ''),
      itemKo: job ? job + ' 차림' + (LEVEL_KO[lv] ? '(노출 ' + LEVEL_KO[lv] + ')' : '') : null });
    return row;
  }
  if (free) {
    const g = rec.generation || {};
    let outfit = outfitLine(g.free_prompt) || outfitLine(rec.prompt);
    if (!outfit && c.submitted) { try { outfit = outfitLine(fs.readFileSync(c.submitted, 'utf8')); } catch (e) { outfit = null; } }
    row.free = { kind: free, kindKo: FREE_KO[free], outfit: outfit || null };
    return row;
  }
  const F = T.fams[fam], it = item ? itemOf(T, fam, item) : null;
  if (fam) { row.family = fam; row.familyKo = F ? F.ko : null; }
  if (item) { row.item = item; row.itemKo = it ? it.ko : null; }
  if (fam === T.costume) Object.assign(row, { required: fam, requiredKo: F ? F.ko : null });
  else if (fam === T.cosplay) Object.assign(row, { required: fam, requiredKo: F ? F.ko : null });
  else {
    let rq = T.req.indexOf(fam) >= 0 ? fam : CAT_FAM[str(sc.cat)] || null;
    if (!rq && T.reqLegacy.indexOf(fam) >= 0 && c.date >= RETRO_FROM && c.date <= RETRO_TO) rq = fam;
    if (rq) { const RF = T.fams[rq]; row.required = rq; row.requiredKo = '필수 갈래(' + (RF ? RF.ko : rq) + ')'; }
    Object.assign(row, shadeOf(T, sc));
  }
  if (fam === T.cosplay || sc.cosplay || (rec.generation || {}).cosplay) row.cosplay = cosplayOf(T, sc, rec, item);
  return row;
}
/* 등록부 → { 'card|style|n': 저장소 차례 } (where 가 없으면 0 번) */
function registered(img) {
  if (!img || !img.img) return null;
  const out = {}, where = img.where || {}, added = img.added || {};
  Object.keys(img.img).forEach((card) => {
    const bs = img.img[card].byStyle || {};
    Object.keys(bs).forEach((style) => (((bs[style].casual || {}).f) || []).forEach((f) => {
      const m = /_casual(\d+)\.webp$/.exec(f);
      if (m) out[card + '|' + style + '|' + Number(m[1])] = { shard: where[f] || 0, added: added[f] || '', file: f };
    }));
  });
  return out;
}
/* 기록의 화풍이 등록부와 안 맞을 때(화풍이 안 적힌 옛 기록 · 이름을 바꿔 올린 컷 — 헤라크로스 2026-11-17) — 그 카드 · 번호로 등록된 다른 화풍 가운데
   하나뿐이면 그것, 폴더 이름에 든 화풍(가장 긴 것), 그래도 여럿이면 등록 날짜가 폴더 날짜에 가장 가까운 것 */
function styleOf(reg, card, style, n, folder) {
  if (style && reg[card + '|' + style + '|' + n]) return style;
  const alts = Object.keys(reg).filter((k) => { const p = k.split('|'); return p[0] === card && p[2] === String(n) && p[1] !== style; }).map((k) => k.split('|')[1]);
  if (alts.length <= 1) return alts[0] || style;
  const flat = (x) => String(x).toLowerCase().replace(/[^a-z0-9]/g, ''), fd = flat(folder);
  const named = alts.filter((a) => fd.indexOf(flat(a)) >= 0).sort((a, b) => flat(b).length - flat(a).length);
  if (named.length) return named[0];
  const day = dateOf(folder), gap = (a) => { const d = reg[card + '|' + a + '|' + n].added; return d && day ? Math.abs(Date.parse(d) - Date.parse(day)) : Infinity; };
  return alts.sort((a, b) => (gap(a) === gap(b) ? (a < b ? -1 : 1) : gap(a) - gap(b)))[0];
}
/* 받아 둔 그림 저장소에서 컷 후보 — [{ repo, shard, folder, n, file, rec }] */
function candidates(repos) {
  const out = [];
  repos.forEach((r) => {
    const base = path.join(r.dir, 'records');
    if (!fs.existsSync(base)) return;
    const repl = {};
    try {
      const state = readJson(path.join(base, 'automation', 'state.json'));
      (state.runs || []).forEach((run) => (run.queue || []).forEach((ch) => (ch.replacements || []).forEach((x) => {
        const m = /^casual(\d+)$/.exec(x.slot || ''), p = ((x.ui || {}).path) || '';
        if (x.status === 'accepted' && m && p.indexOf('records/automation/') === 0 && p.split('/').indexOf('..') < 0) repl[ch.name + '|' + Number(m[1])] = p;
      })));
    } catch (e) { /* 관리기 상태가 없는 저장소 */ }
    fs.readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'automation' && d.name !== 'casual-reservations').sort((a, b) => (a.name < b.name ? -1 : 1)).forEach((d) => {
      const dir = path.join(base, d.name), names = fs.readdirSync(dir), ns = new Set();
      names.forEach((f) => { const m = /^casual(\d+)(?:-refill)?-ui\.json$/.exec(f); if (m) ns.add(Number(m[1])); });
      [...ns].sort((a, b) => a - b).forEach((n) => {
        const f = names.indexOf('casual' + n + '-refill-ui.json') >= 0 ? 'casual' + n + '-refill-ui.json' : 'casual' + n + '-ui.json';
        let rec; try { rec = readJson(path.join(dir, f)); } catch (e) { return; }
        let rel = 'records/' + d.name + '/' + f;
        const sub = path.join(dir, 'casual' + n + '-submitted.txt');
        out.push({ repo: r.name, shard: r.shard, folder: d.name, n, rel, rec, submitted: fs.existsSync(sub) ? sub : null, repl, dir: r.dir });
      });
    });
  });
  return out;
}
function build(o) {
  const T = o.T || tables(o.root), reg = registered(o.img);
  const best = {}, skipped = { unregistered: 0, noscene: 0 };
  candidates(o.repos).forEach((c) => {
    let s = sceneOf(T, c.rec, c.folder);
    const rk = s.card && c.repl[s.card + '|' + c.n];
    if (rk) { try { c.rec = readJson(path.join(c.dir, rk)); c.rel = rk; s = sceneOf(T, c.rec, c.folder); c.submitted = null; } catch (e) { /* 그대로 */ } }
    if (!s.card || !s.scene) { skipped.noscene++; return; }
    const style = reg ? styleOf(reg, s.card, s.style, c.n, c.folder) : s.style;
    const key = s.card + '|' + style + '|' + c.n, R = reg ? reg[key] : null;
    if (reg && !R) { skipped.unregistered++; return; }
    const cand = { card: s.card, style, n: c.n, scene: s.scene, rec: c.rec, submitted: c.submitted, path: c.repo + '/' + c.rel,
      date: (R && R.added) || dateOf(c.folder), fdate: dateOf(c.folder), shard: c.shard, folder: c.folder, home: R ? R.shard === c.shard : true, exact: style === s.style };
    const old = best[key];
    const better = !old || (cand.exact !== old.exact ? cand.exact : cand.home !== old.home ? cand.home : cand.fdate !== old.fdate ? cand.fdate > old.fdate : cand.shard !== old.shard ? cand.shard > old.shard : cand.folder > old.folder);
    if (better) best[key] = cand;
  });
  const rows = Object.keys(best).map((k) => rowOf(T, best[k]));
  rows.sort((a, b) => (a.date !== b.date ? (a.date < b.date ? 1 : -1) : a.card !== b.card ? (a.card < b.card ? -1 : 1) : a.world !== b.world ? (a.world < b.world ? -1 : 1) : a.n !== b.n ? a.n - b.n : a.style < b.style ? -1 : a.style > b.style ? 1 : 0));
  const doc = { version: 1, atelier: 'pkm', built: o.now || new Date().toISOString().replace(/\.\d+Z$/, 'Z'), source: o.repos.filter((r) => fs.existsSync(path.join(r.dir, 'records'))).map((r) => r.name), rows };
  if (o.prev && o.prev.built && JSON.stringify(o.prev.rows) === JSON.stringify(rows) && JSON.stringify(o.prev.source) === JSON.stringify(doc.source)) doc.built = o.prev.built;   /* 달라진 것이 없으면 시각도 그대로 — 워크플로가 매시 빈 커밋을 하지 않게 */
  return { doc, skipped };
}
function summary(doc) {
  const R = doc.rows, cnt = (f) => R.filter(f).length, by = {};
  R.forEach((r) => { if (r.required) by[r.required] = (by[r.required] || 0) + 1; });
  return { rows: R.length, required: cnt((r) => r.required), byRequired: by, cosplay: cnt((r) => r.cosplay), planner: cnt((r) => r.cosplay && r.cosplay.by === 'planner'), gpt: cnt((r) => r.cosplay && r.cosplay.by === 'gpt'),
    free: cnt((r) => r.free), outfit: cnt((r) => r.free && r.free.outfit) };
}
function main(argv) {
  const o = { repos: REPOS.map((n) => path.join(ROOT, '..', n)), img: path.join(ROOT, 'data', 'img.json'), out: path.join(ROOT, 'data', 'casual-index.json') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repos') { o.repos = []; while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) o.repos.push(path.resolve(argv[++i])); }
    else if (a === '--img') o.img = path.resolve(argv[++i]);
    else if (a === '--out') o.out = path.resolve(argv[++i]);
    else if (a === '--check') o.check = true;
    else throw new Error('모르는 칸: ' + a);
  }
  if (o.repos.length > REPOS.length) throw new Error('--repos 는 ' + REPOS.length + ' 개까지(차례대로 ' + REPOS.join(' · ') + ')');
  const repos = o.repos.map((dir, i) => ({ name: REPOS[i], shard: i, dir }));
  let img = null; try { img = readJson(o.img); } catch (e) { console.warn('등록부를 못 읽었다(' + o.img + ') — 거르지 않는다'); }
  let prev = null; try { prev = readJson(o.out); } catch (e) { prev = null; }
  const { doc, skipped } = build({ repos, img, prev });
  if (!doc.source.length) { console.error('그림 저장소가 하나도 없다 — ' + o.repos.join(' · ')); process.exit(1); }
  const s = summary(doc);
  console.log('일상컷 색인 — 저장소 ' + doc.source.join(' · ') + ' · 줄 ' + s.rows + ' · 필수 ' + s.required + ' ' + JSON.stringify(s.byRequired) +
    ' · 코스프레 ' + s.cosplay + '(planner ' + s.planner + ' · gpt ' + s.gpt + ') · 자유 설계 ' + s.free + '(Outfit 줄 ' + s.outfit + ') · 뺀 것 등록 안 됨 ' + skipped.unregistered + ' · 장면 없음 ' + skipped.noscene);
  if (o.check) return;
  fs.writeFileSync(o.out, JSON.stringify(doc) + '\n');
  console.log('썼다: ' + path.relative(process.cwd(), o.out) + (prev && prev.built === doc.built ? ' (달라진 것 없음)' : ''));
}
module.exports = { REPOS, tables, sceneOf, outfitLine, rowOf, registered, candidates, build, summary, characterKo };
if (require.main === module) main(process.argv.slice(2));
