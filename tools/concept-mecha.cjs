#!/usr/bin/env node
/* 2D MMORPG 메카 컨셉 지시문 — 부품을 골라 끼워 장갑 실루엣을 갈아 끼운다(2026-11-06, data/concept-mecha.json).
   사용자 「포켓몬 메카 실루엣을 생성단계에서 다양하게 부품교체하듯 갈아끼울 수 있음 좋겠는데」 · 「실루엣을 삼국지 공방 실루엣 자료에서 더 가져올 수 있으면 가져오자」

   node tools/concept-mecha.cjs <카드> [<카드> …] [--set [<카드>:]<칸>=<값>] [--random] [--seed <씨앗>] [--out <폴더>] [--json]
   node tools/concept-mecha.cjs --list          칸과 고를 수 있는 값

   칸: silhouette(큰 실루엣 — 삼국지 공방 메카 실루엣 18 + 없음) · weight · shoulders · chest · arms · hips · legs · back · head
   자동: 종의 타입 추천(types) 안에서 씨앗(카드 이름 + --seed)으로 고르고, 추천이 없는 칸은 그 칸 전체에서. --random 이면 추천을 안 본다.
   한 번에 여러 카드를 주면 큰 실루엣이 서로 겹치지 않게 고른다.
   실루엣이 모양을 정하는 칸(owns)과 원작 특징이 쥔 칸(종의 owns)은 부품을 안 싣는다 — --set 으로 직접 준 값도 그 칸이면 막는다.
   --out 이면 카드마다 <영어 이름>.txt(지시문 전체)와 <영어 이름>-parts.json(고른 부품)을 쓴다. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const C = read('concept-mecha.json'), FACES = read('face-design.json').faces;
const CARDS = (() => { const out = {}; (function walk(x) { if (Array.isArray(x)) x.forEach(walk); else if (x && typeof x === 'object') { if (x.name && x.en && x.no) out[x.name] = x; Object.values(x).forEach(walk); } })(read('card.json')); return out; })();

function hash(s) { let h = 2166136261; for (const ch of String(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let a = hash(seed); return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const pickOf = (arr, r) => arr[Math.floor(r() * arr.length)];
const optionsOf = slot => slot === 'silhouette' ? C.silhouettes : C.parts[slot];
const findOpt = (slot, key) => (optionsOf(slot) || []).find(o => o.key === key);
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
  const o = { cards: [], set: [], random: false, seed: '', out: '', json: false, list: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set.push(argv[++i]);
    else if (a === '--random') o.random = true;
    else if (a === '--seed') o.seed = argv[++i];
    else if (a === '--out') o.out = argv[++i];
    else if (a === '--json') o.json = true;
    else if (a === '--list') o.list = true;
    else if (a.startsWith('--')) throw new Error('모르는 옵션 ' + a);
    else o.cards.push(a);
  }
  return o;
}

/* 한 카드의 부품을 정한다 — 직접 준 값 → 실루엣(owns) → 칸마다 추천 · 씨앗 */
function choose(card, o, usedSil) {
  const sp = C.species[card]; if (!sp) throw new Error(card + ' 는 컨셉 표(data/concept-mecha.json species)에 없다');
  const r = rng([card, o.seed, o.random ? 'random' : 'auto'].join('|'));
  const given = {};
  for (const s of o.set) {
    const m = /^(?:(.+?):)?(\w+)=(\w+)$/.exec(s || ''); if (!m) throw new Error('--set 은 [카드:]칸=값');
    if (m[1] && m[1] !== card) continue;
    if (!C.slots.some(x => x.key === m[2])) throw new Error('없는 칸 ' + m[2]);
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
  return { card, ch, owned: [...owned] };
}

function build(card, ch) {
  const sp = C.species[card], c = CARDS[card] || {}, sil = findOpt('silhouette', ch.silhouette);
  const parts = ['shoulders', 'chest', 'arms', 'hips', 'legs', 'back', 'head'].map(k => ch[k] && findOpt(k, ch[k]).en).filter(Boolean);
  const vals = Object.assign({}, sp, {
    NAME: c.en || card, FACE: faceText(sp.no || c.no),
    SILHOUETTE: sil.en ? sil.en + '; ' : '', PARTS: parts.join(', '),
    WEIGHT: ch.weight ? findOpt('weight', ch.weight).en : 'the whole armor'
  });
  const text = C.template.replace(/\{([A-Z_]+)\}/g, (m, k) => { if (vals[k] == null) throw new Error(card + ' 의 ' + k + ' 가 비었다'); return vals[k]; });
  return text.replace(/: , /g, ': ').replace(/, ,/g, ',');
}

function summary(r) {
  return C.slots.map(({ key, ko }) => ko + ' ' + (r.ch[key] ? (findOpt(key, r.ch[key]).ko) : (r.owned.includes(key) ? '(실루엣 · 원작 특징이 정함)' : '-'))).join(' · ');
}

function main() {
  const o = args(process.argv.slice(2));
  if (o.list) {
    for (const { key, ko } of C.slots) console.log(ko + ' (' + key + '): ' + optionsOf(key).map(x => x.key + '=' + x.ko).join(' · '));
    return;
  }
  if (!o.cards.length) throw new Error('카드 이름이 필요하다(컷 표에 있는 것: ' + Object.keys(C.species).join(' · ') + ')');
  const used = [], res = [];
  for (const card of o.cards) { const r = choose(card, o, used); used.push(r.ch.silhouette); r.prompt = build(card, r.ch); res.push(r); }
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
module.exports = { choose, build, faceText, summary, C };
