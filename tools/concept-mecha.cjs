#!/usr/bin/env node
/* 2D MMORPG 메카 컨셉 지시문 — 부품을 골라 끼워 장갑 실루엣을 갈아 끼운다(2026-11-06, data/concept-mecha.json).
   사용자 「포켓몬 메카 실루엣을 생성단계에서 다양하게 부품교체하듯 갈아끼울 수 있음 좋겠는데」 · 「실루엣을 삼국지 공방 실루엣 자료에서 더 가져올 수 있으면 가져오자」

   node tools/concept-mecha.cjs <카드> [<카드> …] [--set [<카드>:]<칸>=<값>] [--fx [<카드>=]<표현>[:<타입>],…] [--fx-type [<카드>=]<타입>] [--mix]
       [--random] [--seed <씨앗>] [--style gloss_daylight|anime_gloss|mmorpg2d|jp25d] [--out <폴더>] [--json]
   node tools/concept-mecha.cjs --list          칸 · 타입 표현 · 고를 수 있는 값

   칸: silhouette(큰 실루엣 — 삼국지 공방 메카 실루엣 18 + 없음) · weight · shoulders · chest · arms · hips · legs · back · head
   자동: 종의 타입 추천(types) 안에서 씨앗(카드 이름 + --seed)으로 고르고, 추천이 없는 칸은 그 칸 전체에서. --random 이면 추천을 안 본다.
   한 번에 여러 카드를 주면 큰 실루엣이 서로 겹치지 않게 고른다.
   실루엣이 모양을 정하는 칸(owns)과 원작 특징이 쥔 칸(종의 owns)은 부품을 안 싣는다 — --set 으로 직접 준 값도 그 칸이면 막는다.

   타입 표현(fx — 2026-11-06 「표현을 다 넣어도 되고, 하나만 선택해도 되는걸로. 타입이 두가지인건 선택적으로, 같은 타입 스타일로 골라도 되고, 각각 다른 스타일을 고를수도 있게」):
     hand(손에서 내는 효과) · seams(이음새 빛) · aura(오라) · hair(머리끝 입자) · orbit(도는 입자) · ground(발밑 바닥) · trail(자취)
     --fx hand,aura,ground        고른 것만(하나만 줘도 된다) · --fx all  일곱 가지 다 · 안 주면 자동(손 + 몸 하나 + 주변 하나)
     --fx hand:water,aura:flying  표현마다 타입 — 그 종의 타입만 · --fx-type flying  타입을 안 적은 표현은 다 그 타입(기본은 첫 타입)
     --mix                        타입을 안 적은 표현에 그 종의 타입을 섞어 준다(두 타입 종이면 둘 다 쓴다)
     손을 안 고르면 두 손은 편히 내린다. 머리끝 입자(hair)는 직접 고를 때만(자동 후보에서 뺐다 — 시험 그림에서 거의 안 보였다). 같은 타입의 머리끝 입자와 도는 입자 · 자취는 자동으로 같이 안 고른다(같은 낱말 두 번).
   화풍(--style): gloss_daylight(광택 자연광, 기본 — 2026-11-07 「기본 화풍도 바꿔줘. 지금 만든걸로」) · anime_gloss(애니 광택 — 하이키 파스텔 · 자연광 윤기, 11-06 기본) · mmorpg2d(2D 한국 MMORPG) · jp25d(일본 2.5D 모바일) — 첫 줄 · STYLE · 끝맺음만 바뀐다(styles).
   --out 이면 카드마다 <영어 이름>.txt(지시문 전체)와 <영어 이름>-parts.json(고른 부품)을 쓴다. */
'use strict';
/* 조립은 lib/concept-mecha.js(생성기 화면과 같이 쓴다, 2026-11-06). 여기는 명령줄 옵션 → 선택값, 오류 열쇠 → 한글 */
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const C = read('concept-mecha.json');
const CARDS = (() => { const out = {}; (function walk(x) { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (x.name && x.en && x.no) out[x.name] = x; Object.values(x).forEach(walk); } })(read('card.json')); return out; })();
const TYPE_KO = { normal: '노말', fire: '불꽃', water: '물', grass: '풀', electric: '전기', ice: '얼음', fighting: '격투', poison: '독', ground: '땅', flying: '비행', psychic: '에스퍼', bug: '벌레', rock: '바위', ghost: '고스트', dragon: '드래곤', dark: '악', steel: '강철', fairy: '페어리' };
function libP() { const g = global; g.window = g.window || g; for (const f of ['prompt-spec', 'casual-tree', 'casual-tree-v2', 'prompt-anthro']) require(path.join(ROOT, 'lib', f + '.js')); return g.window.AtelierPrompt; }
const SA = (() => { try { return read('source-appearance.json').entries || {}; } catch (e) { return {}; } })();
const CM = require(path.join(ROOT, 'lib', 'concept-mecha.js')).make(C, { faces: read('face-design.json').faces, appearance: SA, cards: CARDS, P: libP() });
const { faceText, autoSpecies, speciesOf, findOpt, fxOf, optionsOf } = CM;

/* 오류 열쇠 → 한글 */
const MSG = {
  card: a => a.card + ' 는 컨셉 표(data/concept-mecha.json species)에도 카드(data/card.json)에도 없다',
  slot: a => '없는 칸 ' + a.slot + (/^fx/.test(a.slot) ? ' — 타입 표현은 --fx' : ''),
  value: a => a.slot + ' 칸에 없는 값 ' + a.value,
  owned: a => a.card + ' 의 ' + a.slot + ' 칸은 ' + (a.by === 'silhouette' ? '실루엣 ' + a.silhouette : '원작 특징') + ' 이 정한다 — --set 을 뺀다',
  type: a => a.card + ' 의 타입은 ' + a.types.join(' · ') + ' — ' + a.type + ' 은 아니다',
  fx: a => '없는 타입 표현 ' + a.key + ' — ' + C.fx.map(f => f.key).join(' · '),
  'fx.twice': a => '타입 표현 ' + a.key + ' 이 두 번',
  'fx.empty': a => a.card + ' 의 타입 표현이 비었다 — 하나는 고른다',
  style: a => '없는 화풍 ' + a.style + ' — ' + a.styles.join(' · '),
  blank: a => a.card + ' 의 ' + a.field + ' 가 비었다'
};
const ko = e => { if (e && e.code && MSG[e.code]) { const k = new Error(MSG[e.code](e.args)); k.code = e.code; return k; } return e; };
const wrap = f => (...a) => { try { return f(...a); } catch (e) { throw ko(e); } };

function args(argv) {
  const o = { cards: [], set: [], fx: [], fxType: [], mix: false, random: false, seed: '', style: '', out: '', json: false, list: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set.push(argv[++i]);
    else if (a === '--fx') o.fx.push(argv[++i]);
    else if (a === '--fx-type') o.fxType.push(argv[++i]);
    else if (a === '--mix') o.mix = true;
    else if (a === '--random') o.random = true;
    else if (a === '--seed') o.seed = argv[++i];
    else if (a === '--style') o.style = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--list') o.list = true;
    else if (a.startsWith('--')) throw new Error('모르는 옵션 ' + a);
    else o.cards.push(a);
  }
  return o;
}
/* 「카드=값」 이면 그 카드만, 아니면 모든 카드 — 카드 이름이 붙은 것이 이긴다 */
function forCard(list, card) {
  let all = null, own = null;
  for (const v of list || []) { const m = /^(.+?)=(.*)$/.exec(v || ''); if (m) { if (m[1] === card) own = m[2]; } else all = v; }
  return own != null ? own : all;
}
/* 명령줄 옵션 → 조립부 선택값(그 카드 몫) */
function optsFor(card, o) {
  const set = {};
  for (const s of o.set || []) {
    const m = /^(?:(.+?):)?(\w+)=(\w+)$/.exec(s || ''); if (!m) throw new Error('--set 은 [카드:]칸=값');
    if (m[1] && m[1] !== card) continue;
    set[m[2]] = m[3];
  }
  const spec = forCard(o.fx, card);
  const fx = spec == null ? null : spec.trim() === 'all' ? 'all' : spec.split(',').map(x => x.trim()).filter(Boolean).map(x => { const [key, type] = x.split(':'); return { key, type }; });
  return { set, fx, fxType: forCard(o.fxType, card), mix: !!o.mix, random: !!o.random, seed: o.seed || '', strict: true };
}
const choose = wrap((card, o, usedSil) => CM.choose(card, optsFor(card, o || {}), usedSil || []));
const build = wrap((card, ch, style) => CM.build(card, ch, style));

function summary(r) {
  const parts = C.slots.map(({ key, ko }) => ko + ' ' + (r.ch[key] ? (findOpt(key, r.ch[key]).ko) : (r.owned.includes(key) ? '(실루엣 · 원작 특징이 정함)' : '-')));
  const fx = (r.ch.fx || []).map(x => fxOf(x.key).ko + '(' + (TYPE_KO[x.type] || x.type) + ')');
  return (speciesOf(r.card).auto ? '(자동 초안) ' : '') + parts.join(' · ') + '\n  타입 표현: ' + fx.join(' · ') + (r.ch.style ? '\n  화풍: ' + C.styles[r.ch.style].ko : '');
}

function main() {
  const o = args(process.argv.slice(2));
  if (o.list) {
    for (const { key, ko } of C.slots) console.log(ko + ' (' + key + '): ' + optionsOf(key).map(x => x.key + '=' + x.ko).join(' · '));
    console.log('화풍 (--style): ' + Object.entries(C.styles).map(([k, v]) => k + '=' + v.ko).join(' · ') + ' (기본 ' + C.style_default + ')');
    console.log('타입 표현 (--fx): ' + C.fx.map(f => f.key + '=' + f.ko).join(' · ') + ' · all=다');
    for (const [k, v] of Object.entries(C.species)) console.log('  ' + k + ' 타입: ' + v.types.join(' · '));
    return;
  }
  if (!o.cards.length) throw new Error('카드 이름이 필요하다(컨셉 표에 있는 것: ' + Object.keys(C.species).join(' · ') + ')');
  const used = [], res = [];
  for (const card of o.cards) { const r = choose(card, o, used); used.push(r.ch.silhouette); r.ch.style = o.style || C.style_default; r.prompt = build(card, r.ch, r.ch.style); res.push(r); }
  if (o.out) {
    fs.mkdirSync(o.out, { recursive: true });
    for (const r of res) {
      const en = String((CARDS[r.card] || {}).en || r.card).toLowerCase();
      fs.writeFileSync(path.join(o.out, en + '.txt'), r.prompt + '\n');
      fs.writeFileSync(path.join(o.out, en + '-parts.json'), JSON.stringify({ card: r.card, parts: r.ch, owned: r.owned, seed: o.seed, random: o.random }, null, 1) + '\n');
    }
  }
  if (o.json) return console.log(JSON.stringify(res, null, 1));
  for (const r of res) console.log('■ ' + r.card + ' — ' + summary(r) + '\n\n' + r.prompt + '\n');
}
if (require.main === module) { try { main(); } catch (e) { console.error('✗ ' + e.message); process.exit(1); } }
module.exports = { choose, build, faceText, summary, autoSpecies, speciesOf, C, CM };
