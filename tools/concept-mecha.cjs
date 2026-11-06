#!/usr/bin/env node
/* 2D MMORPG 메카 컨셉 지시문 — 부품을 골라 끼워 장갑 실루엣을 갈아 끼운다(2026-11-06, data/concept-mecha.json).
   사용자 「포켓몬 메카 실루엣을 생성단계에서 다양하게 부품교체하듯 갈아끼울 수 있음 좋겠는데」 · 「실루엣을 삼국지 공방 실루엣 자료에서 더 가져올 수 있으면 가져오자」

   node tools/concept-mecha.cjs <카드> [<카드> …] [--set [<카드>:]<칸>=<값>] [--fx [<카드>=]<표현>[:<타입>],…] [--fx-type [<카드>=]<타입>] [--mix]
       [--random] [--seed <씨앗>] [--style mmorpg2d|jp25d] [--out <폴더>] [--json]
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
   화풍(--style): mmorpg2d(2D 한국 MMORPG, 기본) · jp25d(일본 2.5D 모바일) — 첫 줄 · STYLE · 끝맺음만 바뀐다(styles).
   --out 이면 카드마다 <영어 이름>.txt(지시문 전체)와 <영어 이름>-parts.json(고른 부품)을 쓴다. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const C = read('concept-mecha.json'), FACES = read('face-design.json').faces;
const CARDS = (() => { const out = {}; (function walk(x) { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (x.name && x.en && x.no) out[x.name] = x; Object.values(x).forEach(walk); } })(read('card.json')); return out; })();
const TYPE_KO = { normal: '노말', fire: '불꽃', water: '물', grass: '풀', electric: '전기', ice: '얼음', fighting: '격투', poison: '독', ground: '땅', flying: '비행', psychic: '에스퍼', bug: '벌레', rock: '바위', ghost: '고스트', dragon: '드래곤', dark: '악', steel: '강철', fairy: '페어리' };

/* 자동 초안 — 표에 손글 종이 없으면 공방 자료로(2026-11-06 「다른케릭터는 설계 안되어있지?」 → 「그래」).
   타입 · 키 · 몸무게(card.json), 얼굴 · 머리(face-design), 색 · 원작 특징(source-appearance — 생성기의 입는 법 · 팔레트 · 머리 줄을 그대로 부른다).
   입는 법의 천(망토 · 띠 · 리본)은 메카라 판으로 바꾼다(auto.cloth). 손글 종이 늘 이긴다 */
let PA = null;
function lib() {
  if (PA) return PA;
  const g = global; g.window = g.window || g;
  for (const f of ['prompt-spec', 'casual-tree', 'casual-tree-v2', 'prompt-anthro']) require(path.join(ROOT, 'lib', f + '.js'));
  return (PA = g.window.AtelierPrompt);
}
const SA = (() => { try { return read('source-appearance.json').entries || {}; } catch (e) { return {}; } })();
const AUTO = {};
function autoSpecies(card) {
  if (AUTO[card]) return AUTO[card];
  const c = CARDS[card]; if (!c || !C.auto) return null;
  const P = lib(), A = C.auto, no = String(c.no), types = [c.element, c.element2].filter(Boolean).map(String).map(t => t.toLowerCase()).filter(t => A.types[t]);
  if (!types.length) types.push('normal');
  const t0 = A.types[types[0]], st = { sourceAppearance: SA[no], faceDesign: FACES[no] }, r = rng('auto|' + card);
  /* 주색은 그 종의 대표 색(source-appearance color) — 팔레트 첫 색은 특징 순서라 등딱지 갈색 같은 것이 먼저 온다(꼬부기). 팔레트는 보조색 */
  const base = String((SA[no] || {}).color || '').toLowerCase(), pal = (P.palette(st) || []).filter(Boolean);
  const c1 = (A.color_words || {})[base] || pal[0] || 'silver', near = x => x === base || x.indexOf(base) >= 0 && base;
  const rest = pal.filter(x => !near(x)), c2 = rest[0] || (base === 'white' ? 'silver' : 'pearl-white');
  const hair = P.hairItems(st) || [];
  const fb = pickOf(A.hair_fallback, r), C1 = c1[0].toUpperCase() + c1.slice(1);
  const hairText = hair.length ? C1 + ' hair in a ' + hair[0] + (hair[1] ? ' with ' + hair.slice(1).join(' and ') : '')
    : /hair$/.test(fb) ? C1 + ' ' + fb.replace(/ hair$/, '') + ' hair' : C1 + ' hair in ' + fb;
  let wear = (P.wearClauses(st) || []).filter(s => !/the ’s|the 's/.test(s)).slice(0, 3);
  wear = wear.map(s => A.cloth.reduce((acc, [a, b]) => acc.split(a).join(b), s));
  const owns = [];
  if (wear.some(s => /hair ornament|headpiece|circlet|antenna|crown|crest/.test(s))) owns.push('head');
  if (wear.some(s => /back plates|plate tail|from the back of her waist|wing/.test(s))) owns.push('back');
  const h = Number(c.h) || 1, w = Number(c.w) || 30, bmi = w / (h * h);
  const fig = bmi > 80 ? A.figure.soft : h >= 1.8 ? A.figure.tall : h <= 0.5 && bmi < 40 ? A.figure.small : A.figure.base;
  const fx = C.type_fx[types[0]] || C.type_fx.normal;
  return (AUTO[card] = {
    no: c.no, types, owns, auto: true,
    PERSONA: t0.persona, HAIR: hairText, EYES: t0.eyes, FIGURE: fig,
    SIGNATURE: wear.length ? wear.join(', ') : 'small ' + c1 + ' accents echoing its silhouette on her plates',
    COLOURS: c1 + '-and-' + c2, ACCENTS: (rest[1] || 'gold') + ' and silver accents', UNDERSUIT: 'a ' + (c1 === 'black' ? 'deep grey' : 'black') + ' flexible undersuit',
    MOTIF: t0.motif, GLOW: t0.glow, LINE: 'graceful',
    BACKGROUND: t0.background, AMBIENT: 'restrained ' + fx.motes, KEY_COLOUR: c1
  });
}
const speciesOf = card => C.species[card] || autoSpecies(card);

function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pickOf = (arr, r) => arr[Math.floor(r() * arr.length)];
const optionsOf = slot => slot === 'silhouette' ? C.silhouettes : C.parts[slot];
const findOpt = (slot, key) => (optionsOf(slot) || []).find(o => o.key === key);
const fxOf = key => C.fx.find(f => f.key === key);
const an = w => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;

/* 얼굴 — data/face-design.json 의 그 종(번호) → 「a refined feminine face with …」 뒤 글 */
function faceText(no) {
  const f = ((FACES[String(no)] || {}).face) || {};
  if (!Object.keys(f).length) return '';
  const len = f['face length'] === 'balanced' ? 'balanced-length' : f['face length'];
  const wid = f['face width'] === 'medium' ? 'medium-width' : f['face width'];
  const shape = an([f['face shape'], [len, wid].filter(Boolean).join(' and ')].filter(Boolean).join(', ') + ' shape');
  const size = f['eye size'] === 'medium' ? 'medium-sized' : f['eye size'];
  const eyeShape = f['eye shape'] === 'large' ? 'open rounded' : f['eye shape'];
  const sp = { 'average eye spacing': ' at average spacing', 'wide-set eyes': ', wide-set', 'close-set eyes': ', close-set' }[f['eye spacing']] || '';
  const eyes = [size, eyeShape].filter(Boolean).join(' ') + ' eyes' + (f['eye tilt'] ? ' with ' + f['eye tilt'] : '') + sp;
  const brows = f.eyebrows ? f.eyebrows.replace(/\barches$/, 'arched brows').replace(/^(?!.*brow)(.*)$/, '$1 brows') : '';
  const nc = f['nose character'] || '', nose = nc ? an(/nose/.test(nc) ? nc : / tip$/.test(nc) ? nc.replace(/ tip$/, ' nose tip') : nc + ' nose') : '';
  const lips = f.lips ? (/s$/.test(f.lips) ? f.lips : an(f.lips)) : '';   /* 복수(eyes · lips)엔 관사를 안 붙인다 */
  const items = [shape, f['jaw & chin'] && an(f['jaw & chin']), eyes, brows, nose].filter(Boolean);
  return items.join(', ') + (lips ? ' and ' + lips : '');
}

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

/* 타입 표현 — 고른 표현과 표현마다 타입 */
function chooseFx(card, sp, o, r) {
  const types = sp.types || [], spec = forCard(o.fx, card), oneType = forCard(o.fxType, card);
  if (oneType != null && !types.includes(oneType)) throw new Error(card + ' 의 타입은 ' + types.join(' · ') + ' — ' + oneType + ' 은 아니다');
  let list;
  if (spec == null) {   /* 자동 — 손 + 몸 하나 + 주변 하나 */
    const body = C.fx.filter(f => f.where === 'body' && !f.manual), space = C.fx.filter(f => f.where === 'space' && !f.manual);   /* manual(머리끝 입자)은 직접 고를 때만 — 자동 그림에서 거의 안 보였다 */
    list = [{ key: 'hand' }, { key: pickOf(body, r).key }, { key: pickOf(space, r).key }];
  } else if (spec.trim() === 'all') list = C.fx.map(f => ({ key: f.key }));
  else list = spec.split(',').map(s => s.trim()).filter(Boolean).map(s => { const [key, type] = s.split(':'); return { key, type }; });
  const seen = new Set();
  for (const x of list) {
    if (!fxOf(x.key)) throw new Error('없는 타입 표현 ' + x.key + ' — ' + C.fx.map(f => f.key).join(' · '));
    if (seen.has(x.key)) throw new Error('타입 표현 ' + x.key + ' 이 두 번'); seen.add(x.key);
    if (x.type && !types.includes(x.type)) throw new Error(card + ' 의 타입은 ' + types.join(' · ') + ' — ' + x.key + ':' + x.type + ' 은 아니다');
  }
  if (!list.length) throw new Error(card + ' 의 타입 표현이 비었다 — 하나는 고른다');
  const free = list.filter(x => !x.type);
  if (o.mix && oneType == null && types.length > 1) {
    const order = types.slice(); if (r() < 0.5) order.reverse();
    free.forEach((x, i) => { x.type = order[i % order.length]; });
  }
  list.forEach(x => { x.type = x.type || oneType || types[0] || 'normal'; });
  /* 자동이면 같은 타입의 머리끝 입자 + 도는 입자 · 자취는 바닥으로 */
  if (spec == null) { const h = list.find(x => x.key === 'hair'), s = list.find(x => x.where === 'space' || fxOf(x.key).where === 'space'); if (h && s && ['orbit', 'trail'].includes(s.key) && h.type === s.type) s.key = 'ground'; }
  return list.map(x => ({ key: x.key, type: x.type }));
}

/* 한 카드의 부품을 정한다 — 직접 준 값 → 실루엣(owns) → 칸마다 추천 · 씨앗 */
function choose(card, o, usedSil) {
  o = Object.assign({ set: [], fx: [], fxType: [], mix: false, random: false, seed: '' }, o);
  const sp = speciesOf(card); if (!sp) throw new Error(card + ' 는 컨셉 표(data/concept-mecha.json species)에도 카드(data/card.json)에도 없다');
  const r = rng([card, o.seed, o.random ? 'random' : 'auto'].join('|'));
  const given = {};
  for (const s of o.set) {
    const m = /^(?:(.+?):)?(\w+)=(\w+)$/.exec(s || ''); if (!m) throw new Error('--set 은 [카드:]칸=값');
    if (m[1] && m[1] !== card) continue;
    if (!C.slots.some(x => x.key === m[2])) throw new Error('없는 칸 ' + m[2] + (/^fx/.test(m[2]) ? ' — 타입 표현은 --fx' : ''));
    if (!findOpt(m[2], m[3])) throw new Error(m[2] + ' 칸에 없는 값 ' + m[3]);
    given[m[2]] = m[3];
  }
  const prefs = {}; for (const t of sp.types || []) for (const [k, v] of Object.entries(C.types[t] || {})) prefs[k] = (prefs[k] || []).concat(v.filter(x => !(prefs[k] || []).includes(x)));
  const pick = slot => {
    const all = optionsOf(slot).map(x => x.key), pref = o.random ? [] : (prefs[slot] || []).filter(k => all.includes(k));
    let pool = pref.length ? pref : all;
    if (slot === 'silhouette') { const fresh = pool.filter(k => !usedSil.includes(k) && k !== 'none'); pool = fresh.length ? fresh : all.filter(k => !usedSil.includes(k)); }
    return pickOf(pool, r);
  };
  const ch = { silhouette: given.silhouette || pick('silhouette') };
  const sil = findOpt('silhouette', ch.silhouette), owned = new Set([...(sil.owns || []), ...(sp.owns || [])]);
  for (const k of Object.keys(given)) if (k !== 'silhouette' && owned.has(k)) throw new Error(card + ' 의 ' + k + ' 칸은 ' + ((sil.owns || []).includes(k) ? '실루엣 ' + sil.key : '원작 특징') + ' 이 정한다 — --set 을 뺀다');
  for (const { key } of C.slots) if (key !== 'silhouette') ch[key] = owned.has(key) ? null : (given[key] || pick(key));
  ch.fx = chooseFx(card, sp, o, r);
  return { card, ch, owned: [...owned] };
}

function fxText(sp, x) {
  const f = fxOf(x.key), w = C.type_fx[x.type] || C.type_fx.normal;
  /* 첫 타입 손 효과는 종이 쓴 HAND_EFFECT */
  if (x.key === 'hand' && sp.HAND_EFFECT && x.type === (sp.types || [])[0]) return sp.HAND_EFFECT;
  return f.en.replace(/\{(glow|motes|ground)\}/g, (m, k) => w[k]);
}

function build(card, ch, style) {
  const sp = speciesOf(card), c = CARDS[card] || {}, sil = findOpt('silhouette', ch.silhouette);
  const ST = C.styles[style || C.style_default]; if (!ST) throw new Error('없는 화풍 ' + style + ' — ' + Object.keys(C.styles).join(' · '));
  const parts = ['shoulders', 'chest', 'arms', 'hips', 'legs', 'back', 'head'].map(k => ch[k] && findOpt(k, ch[k]).en).filter(Boolean);
  const fx = ch.fx || [{ key: 'hand', type: (sp.types || [])[0] }], hand = fx.find(x => x.key === 'hand');
  const order = C.fx.map(f => f.key), rest = fx.filter(x => x.key !== 'hand').sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  const vals = Object.assign({}, sp, {
    NAME: c.en || card, FACE: faceText(sp.no || c.no),
    STYLE_HEAD: ST.head, STYLE: ST.style, STYLE_CLOSE: ST.close.replace('{KEY_COLOUR}', sp.KEY_COLOUR),
    HANDS: hand ? fxText(sp, hand) + ' and the other relaxed beside her' : C.hands_rest,
    TYPE_FX: rest.map(x => { const s = fxText(sp, x); return s[0].toUpperCase() + s.slice(1) + '. '; }).join(''),
    SILHOUETTE: sil.en ? sil.en + '; ' : '', PARTS: parts.join(', '),
    WEIGHT: ch.weight ? findOpt('weight', ch.weight).en : 'the whole armor'
  });
  const text = C.template.replace(/\{([A-Z_]+)\}/g, (m, k) => { if (vals[k] == null) throw new Error(card + ' 의 ' + k + ' 가 비었다'); return vals[k]; });
  return text.replace(/: , /g, ': ').replace(/, ,/g, ',');
}

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
module.exports = { choose, build, faceText, summary, autoSpecies, speciesOf, C };
