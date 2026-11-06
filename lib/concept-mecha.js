/* 2D MMORPG 메카 컨셉 조립부 — 부품을 골라 끼워 장갑 실루엣을 갈아 끼운다(2026-11-06, docs/CONCEPT_MECHA.md).
   생성기 화면(lib/prompt-ui.js 의 「메카 컨셉」 갈래)과 명령줄 도구(tools/concept-mecha.cjs)가 같이 쓴다 — 같은 선택이면 글자 하나 다르지 않게
   (사용자 「생성기에 메카 실루엣 설정이랑 속성 효과 선택하는건 안넣었어?」 → 「응」).
   브라우저(window.AtelierConceptMecha)와 node(module.exports) 둘 다. 자료는 make 에 넘긴다:
     C  data/concept-mecha.json · faces  data/face-design.json 의 faces · appearance  data/source-appearance.json 의 entries
     cards  카드 이름 → 카드(data/card.json) · P  lib/prompt-anthro.js(AtelierPrompt — 자동 초안의 입는 법 · 팔레트 · 머리)
   오류는 열쇠 + 값으로 던진다(err.code · err.args) — 화면은 낱말 표로, 도구는 그대로 찍는다. 코드에 한글을 두지 않는다(tests/words.cjs) */
(function (root) {
  'use strict';
  function fail(code, args) { var e = new Error(code + (args ? ' ' + JSON.stringify(args) : '')); e.code = code; e.args = args || {}; return e; }
  function hash(s) { var h = 2166136261, i; s = String(s); for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { var a = hash(seed); return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pickOf(arr, r) { return arr[Math.floor(r() * arr.length)]; }
  function an(w) { return (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w; }
  function has(a, x) { return a.indexOf(x) >= 0; }

  function make(C, data) {
    data = data || {};
    var FACES = data.faces || {}, SA = data.appearance || {}, CARDS = data.cards || {}, P = data.P || null, AUTO = {};
    var SLOTS = C.slots.map(function (s) { return s.key; });
    function optionsOf(slot) { return slot === 'silhouette' ? C.silhouettes : C.parts[slot]; }
    function findOpt(slot, key) { return (optionsOf(slot) || []).filter(function (o) { return o.key === key; })[0]; }
    function fxOf(key) { return C.fx.filter(function (f) { return f.key === key; })[0]; }

    /* 얼굴 — face-design 의 그 종(번호) → 「a refined feminine face with …」 뒤 글 */
    function faceText(no) {
      var f = ((FACES[String(no)] || {}).face) || {};
      if (!Object.keys(f).length) return '';
      var len = f['face length'] === 'balanced' ? 'balanced-length' : f['face length'];
      var wid = f['face width'] === 'medium' ? 'medium-width' : f['face width'];
      var shape = an([f['face shape'], [len, wid].filter(Boolean).join(' and ')].filter(Boolean).join(', ') + ' shape');
      var size = f['eye size'] === 'medium' ? 'medium-sized' : f['eye size'];
      var eyeShape = f['eye shape'] === 'large' ? 'open rounded' : f['eye shape'];
      var sp = { 'average eye spacing': ' at average spacing', 'wide-set eyes': ', wide-set', 'close-set eyes': ', close-set' }[f['eye spacing']] || '';
      var eyes = [size, eyeShape].filter(Boolean).join(' ') + ' eyes' + (f['eye tilt'] ? ' with ' + f['eye tilt'] : '') + sp;
      var brows = f.eyebrows ? f.eyebrows.replace(/\barches$/, 'arched brows').replace(/^(?!.*brow)(.*)$/, '$1 brows') : '';
      var nc = f['nose character'] || '', nose = nc ? an(/nose/.test(nc) ? nc : / tip$/.test(nc) ? nc.replace(/ tip$/, ' nose tip') : nc + ' nose') : '';
      var lips = f.lips ? (/s$/.test(f.lips) ? f.lips : an(f.lips)) : '';   /* 복수(eyes · lips)엔 관사를 안 붙인다 */
      var items = [shape, f['jaw & chin'] && an(f['jaw & chin']), eyes, brows, nose].filter(Boolean);
      return items.join(', ') + (lips ? ' and ' + lips : '');
    }

    /* 자동 초안 — 손글 종(C.species)이 없으면 공방 자료로. 주색은 대표 색, 입는 법의 천은 판으로(auto.cloth). 손글 종이 늘 이긴다 */
    function autoSpecies(card) {
      if (AUTO[card]) return AUTO[card];
      var c = CARDS[card]; if (!c || !C.auto || !P) return null;
      var A = C.auto, no = String(c.no);
      var types = [c.element, c.element2].filter(Boolean).map(function (t) { return String(t).toLowerCase(); }).filter(function (t) { return A.types[t]; });
      if (!types.length) types.push('normal');
      var t0 = A.types[types[0]], st = { sourceAppearance: SA[no], faceDesign: FACES[no] }, r = rng('auto|' + card);
      var base = String((SA[no] || {}).color || '').toLowerCase(), pal = (P.palette(st) || []).filter(Boolean);
      var c1 = (A.color_words || {})[base] || pal[0] || 'silver';
      var rest = pal.filter(function (x) { return !(x === base || (base && x.indexOf(base) >= 0)); }), c2 = rest[0] || (base === 'white' ? 'silver' : 'pearl-white');
      var hair = P.hairItems(st) || [], fb = pickOf(A.hair_fallback, r), C1 = c1[0].toUpperCase() + c1.slice(1);
      var hairText = hair.length ? C1 + ' hair in a ' + hair[0] + (hair[1] ? ' with ' + hair.slice(1).join(' and ') : '')
        : /hair$/.test(fb) ? C1 + ' ' + fb.replace(/ hair$/, '') + ' hair' : C1 + ' hair in ' + fb;
      var wear = (P.wearClauses(st) || []).filter(function (s) { return !/the ’s|the 's/.test(s); }).slice(0, 3)
        .map(function (s) { return A.cloth.reduce(function (acc, ab) { return acc.split(ab[0]).join(ab[1]); }, s); });
      var owns = [];
      if (wear.some(function (s) { return /hair ornament|headpiece|circlet|antenna|crown|crest/.test(s); })) owns.push('head');
      if (wear.some(function (s) { return /back plates|plate tail|from the back of her waist|wing/.test(s); })) owns.push('back');
      var h = Number(c.h) || 1, w = Number(c.w) || 30, bmi = w / (h * h);
      var fig = bmi > 80 ? A.figure.soft : h >= 1.8 ? A.figure.tall : h <= 0.5 && bmi < 40 ? A.figure.small : A.figure.base;
      var fx = C.type_fx[types[0]] || C.type_fx.normal;
      return (AUTO[card] = {
        no: c.no, types: types, owns: owns, auto: true,
        PERSONA: t0.persona, HAIR: hairText, EYES: t0.eyes, FIGURE: fig,
        SIGNATURE: wear.length ? wear.join(', ') : 'small ' + c1 + ' accents echoing its silhouette on her plates',
        COLOURS: c1 + '-and-' + c2, ACCENTS: (rest[1] || 'gold') + ' and silver accents', UNDERSUIT: 'a ' + (c1 === 'black' ? 'deep grey' : 'black') + ' flexible undersuit',
        MOTIF: t0.motif, GLOW: t0.glow, LINE: 'graceful',
        BACKGROUND: t0.background, AMBIENT: 'restrained ' + fx.motes, KEY_COLOUR: c1
      });
    }
    function speciesOf(card) { return C.species[card] || autoSpecies(card); }

    /* 칸마다 고를 수 있는 값 — 화면의 고르개 · 도구의 --list */
    function slotOptions(card, slot, ch) {
      var sp = speciesOf(card) || {}, sil = findOpt('silhouette', (ch || {}).silhouette) || { owns: [] };
      var owned = slot !== 'silhouette' && (has(sil.owns || [], slot) || has(sp.owns || [], slot));
      return { owned: owned, by: owned ? (has(sil.owns || [], slot) ? 'silhouette' : 'source') : '', options: optionsOf(slot) || [] };
    }

    /* 타입 표현 — fx: null(자동) · 'all' · [{key, type?}] · fxType: 한 타입으로 · mix: 섞기 */
    function chooseFx(card, sp, o, r) {
      var types = sp.types || [], spec = o.fx, oneType = o.fxType || null, list;
      if (oneType && !has(types, oneType)) throw fail('type', { card: card, type: oneType, types: types });
      if (spec == null) {   /* 자동 — 손 + 몸 하나 + 주변 하나. manual(머리끝 입자)은 직접 고를 때만 */
        var body = C.fx.filter(function (f) { return f.where === 'body' && !f.manual; }), space = C.fx.filter(function (f) { return f.where === 'space' && !f.manual; });
        list = [{ key: 'hand' }, { key: pickOf(body, r).key }, { key: pickOf(space, r).key }];
      } else if (spec === 'all') list = C.fx.map(function (f) { return { key: f.key }; });
      else list = spec.map(function (x) { return { key: x.key, type: x.type || '' }; });
      var seen = {};
      list.forEach(function (x) {
        if (!fxOf(x.key)) throw fail('fx', { key: x.key });
        if (seen[x.key]) throw fail('fx.twice', { key: x.key }); seen[x.key] = 1;
        if (x.type && !has(types, x.type)) throw fail('type', { card: card, type: x.type, types: types });
      });
      if (!list.length) throw fail('fx.empty', { card: card });
      if (o.mix && !oneType && types.length > 1) {
        var order = types.slice(); if (r() < 0.5) order.reverse();
        list.filter(function (x) { return !x.type; }).forEach(function (x, i) { x.type = order[i % order.length]; });
      }
      list.forEach(function (x) { x.type = x.type || oneType || types[0] || 'normal'; });
      return list.map(function (x) { return { key: x.key, type: x.type }; });
    }

    /* 한 카드의 부품을 정한다 — o.set{칸: 값}(직접) → 실루엣 owns → 칸마다 추천 · 씨앗.
       o.strict 면 실루엣 · 원작이 정하는 칸에 직접 준 값을 막고(도구), 아니면 조용히 비운다(화면 — 실루엣을 바꾸면 그 칸은 실루엣이 쥔다) */
    function choose(card, o, usedSil) {
      o = o || {}; usedSil = usedSil || [];
      var sp = speciesOf(card); if (!sp) throw fail('card', { card: card });
      var r = rng([card, o.seed || '', o.random ? 'random' : 'auto'].join('|')), given = {};
      Object.keys(o.set || {}).forEach(function (k) {
        var v = o.set[k]; if (!v) return;
        if (!has(SLOTS, k)) throw fail('slot', { slot: k });
        if (!findOpt(k, v)) throw fail('value', { slot: k, value: v });
        given[k] = v;
      });
      var prefs = {};
      (sp.types || []).forEach(function (t) { var p = C.types[t] || {}; Object.keys(p).forEach(function (k) { prefs[k] = (prefs[k] || []).concat(p[k].filter(function (x) { return !has(prefs[k] || [], x); })); }); });
      function pick(slot) {
        var all = optionsOf(slot).map(function (x) { return x.key; }), pref = o.random ? [] : (prefs[slot] || []).filter(function (k) { return has(all, k); });
        var pool = pref.length ? pref : all;
        if (slot === 'silhouette') { var fresh = pool.filter(function (k) { return !has(usedSil, k) && k !== 'none'; }); pool = fresh.length ? fresh : all.filter(function (k) { return !has(usedSil, k); }); }
        return pickOf(pool, r);
      }
      var ch = { silhouette: given.silhouette || pick('silhouette') };
      var sil = findOpt('silhouette', ch.silhouette), owned = (sil.owns || []).concat((sp.owns || []).filter(function (k) { return !has(sil.owns || [], k); }));
      Object.keys(given).forEach(function (k) {
        if (k !== 'silhouette' && has(owned, k) && o.strict) throw fail('owned', { card: card, slot: k, by: has(sil.owns || [], k) ? 'silhouette' : 'source', silhouette: sil.key });
      });
      SLOTS.forEach(function (k) { if (k !== 'silhouette') ch[k] = has(owned, k) ? null : (given[k] || pick(k)); });
      ch.fx = chooseFx(card, sp, o, r);
      return { card: card, ch: ch, owned: owned };
    }

    function fxText(sp, x) {
      var f = fxOf(x.key), w = C.type_fx[x.type] || C.type_fx.normal;
      if (x.key === 'hand' && sp.HAND_EFFECT && x.type === (sp.types || [])[0]) return sp.HAND_EFFECT;   /* 첫 타입 손 효과는 종이 쓴 HAND_EFFECT */
      return f.en.replace(/\{(glow|motes|ground)\}/g, function (m, k) { return w[k]; });
    }

    function build(card, ch, style) {
      var sp = speciesOf(card), c = CARDS[card] || {}, sil = findOpt('silhouette', ch.silhouette);
      if (!sp) throw fail('card', { card: card });
      var ST = C.styles[style || C.style_default]; if (!ST) throw fail('style', { style: style, styles: Object.keys(C.styles) });
      var parts = ['shoulders', 'chest', 'arms', 'hips', 'legs', 'back', 'head'].map(function (k) { return ch[k] && findOpt(k, ch[k]).en; }).filter(Boolean);
      var fx = ch.fx || [{ key: 'hand', type: (sp.types || [])[0] }], hand = fx.filter(function (x) { return x.key === 'hand'; })[0];
      var order = C.fx.map(function (f) { return f.key; }), rest = fx.filter(function (x) { return x.key !== 'hand'; }).sort(function (a, b) { return order.indexOf(a.key) - order.indexOf(b.key); });
      var vals = Object.assign({}, sp, {
        NAME: c.en || card, FACE: faceText(sp.no || c.no),
        STYLE_HEAD: ST.head, STYLE: ST.style, STYLE_CLOSE: ST.close.replace('{KEY_COLOUR}', sp.KEY_COLOUR),
        HANDS: hand ? fxText(sp, hand) + ' and the other relaxed beside her' : C.hands_rest,
        TYPE_FX: rest.map(function (x) { var s = fxText(sp, x); return s[0].toUpperCase() + s.slice(1) + '. '; }).join(''),
        SILHOUETTE: sil.en ? sil.en + '; ' : '', PARTS: parts.join(', '),
        WEIGHT: ch.weight ? findOpt('weight', ch.weight).en : 'the whole armor'
      });
      var text = C.template.replace(/\{([A-Z_]+)\}/g, function (m, k) { if (vals[k] == null) throw fail('blank', { card: card, field: k }); return vals[k]; });
      return text.replace(/: , /g, ': ').replace(/, ,/g, ',');
    }

    return { C: C, SLOTS: SLOTS, optionsOf: optionsOf, findOpt: findOpt, fxOf: fxOf, faceText: faceText, autoSpecies: autoSpecies, speciesOf: speciesOf,
      slotOptions: slotOptions, choose: choose, build: build };
  }

  var api = { make: make };
  root.AtelierConceptMecha = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
