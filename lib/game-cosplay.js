/* 게임 코스프레(2026-11-15) — 일상컷 필수 갈래 하나. 사용자 「pkm,원소,삼국지 공방에 갈래 하나 추가해서 게임공방에 있는 게임 코스프레 의상은 어떨까?」
   목록은 data/game-cosplay.json(원본 game-atelier — 세 공방이 같은 사본, 고치지 않는다). 「캐릭터 + 재단」 묶음이 한 단위, 쓴 기록은 세 공방(pkm · 원소 · 삼국지)을 합쳐 센다.
   세 공방이 같은 꼴로 읽고 쓴다 — 함수 이름 cosplayUsage(쓴 기록 모으기) · pickCosplay(게임 · 캐릭터 · 재단 고르기) · cosplayAgain(2회차 몫), 칸 이름(원소 53b1956 과 같게):
     장면(계획 · 생성기 상태)  scene.cosplay = { game, character, cut, round, used?, again? } — pick(등장인물 많은 게임 1회차)이면 character 는 빈 칸,
                               used 는 그 게임에서 쓴 캐릭터(지시문 {used}), again 은 그리는 쪽이 더 고를 캐릭터가 없을 때 그릴 2회차 몫 { character, cut }(쓴 캐릭터가 있을 때만)
     그린 뒤 기록              generation.cosplay = { game, character, cut }     — pick 은 그리는 쪽이 채운 캐릭터 이름
   고르기(pickCosplay):
     1. 게임 — 세 공방 기록에서 게임은 남은 인원의 제곱근 무게로 무작위(2026-11-15 「케릭터 수 많은 게임일수록 더 많이 선택되게」 → B — 처음엔 LoL 약 19% · 주인공 하나 게임 각 약 1.5%), 다 찬 게임은 빠진다
     2. 주인공 하나(many: false) — 그 주인공이 아직 안 입은 재단 하나 → text.fixed. 열하나를 다 입으면 그 게임은 빠진다
     3. 등장인물 많음 1회차(쓴 캐릭터 수 < roster) — 재단은 덜 쓴 것 먼저, 캐릭터는 그리는 쪽이 고른다 → text.pick(맨 앞 「…」 이 채우는 자리, {used} 는 그 게임에서 쓴 캐릭터)
     4. 2회차(쓴 캐릭터 수 ≥ roster, 또는 그리는 쪽이 더 없다고 할 때 — opts.full) — 쓴 캐릭터 가운데 덜 쓴 하나 + 그 캐릭터가 아직 안 입은 재단 → text.again.
        모든 캐릭터 × 재단이 차면 그 게임은 빠진다
   쓴 기록 읽기(cosplayUsage — node 만): 옆 그림 저장소(COSPLAY_REPOS 가운데 있는 것)의 records 아래 일상 기록(…casualN…-ui.json)에서
     generation.cosplay, 없으면 장면의 cosplay 가운데 character 가 찬 것. 예약 · 계획 파일은 안 읽는다(계획기가 장부 예약을 따로 더한다).
   브라우저(window.AtelierGameCosplay)와 node(module.exports)가 같이 쓴다 */
(function (root) {
  'use strict';
  var COSPLAY_REPOS = ['sam-atelier-img', 'sam-atelier-img-2', 'element-atelier-img', 'pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3', 'pkm-atelier-img-4', 'pkm-atelier-img-5'];
  var RECORD_RX = /casual\d+[^\/\\]*-ui\.json$/;
  function has(a, x) { return (a || []).indexOf(x) >= 0; }
  function str(x) { return typeof x === 'string' ? x.trim() : ''; }
  /* 캐릭터 이름 견주기 — 대소문자 · 띄어쓰기 · 부호를 빼고 */
  function nameKey(x) { return str(x).toLowerCase().replace(/[^a-z0-9À-￿]+/g, ''); }
  function fill(t, v) { return String(t || '').replace(/\{(\w+)\}/g, function (m, k) { return v[k] != null ? v[k] : m; }); }
  function game(list, key) { return ((list || {}).games || []).filter(function (g) { return g.key === key; })[0] || null; }
  function cut(list, key) { return ((list || {}).cuts || []).filter(function (c) { return c.key === key; })[0] || null; }
  /* 쓴 기록 한 칸 — { game, character, cut } 꼴만 */
  function norm(x) {
    if (!x || typeof x !== 'object' || !str(x.game)) return null;
    return { game: str(x.game), character: str(x.character), cut: str(x.cut) };
  }
  /* 기록 JSON 하나 → 쓴 코스프레(없으면 null) — generation.cosplay, 없으면 그 기록 안 장면의 cosplay(character 가 찬 것) */
  function cosplayOfRecord(rec) {
    var g = norm(rec && rec.generation && rec.generation.cosplay);
    if (g && g.character) return g;
    var found = null;
    (function walk(x, depth) {
      if (found || !x || typeof x !== 'object' || depth > 8) return;
      if (Array.isArray(x)) { x.forEach(function (y) { walk(y, depth + 1); }); return; }
      Object.keys(x).forEach(function (k) {
        if (found || k === 'generation') return;
        if (k === 'cosplay') { var c = norm(x[k]); if (c && c.character) { found = c; return; } }
        walk(x[k], depth + 1);
      });
    })(rec, 0);
    return found;
  }
  /* node — 옆 그림 저장소 records 의 일상 기록에서 쓴 코스프레를 모은다. base 는 저장소들이 있는 폴더(보통 ../), repos 는 이름 목록(없으면 COSPLAY_REPOS) */
  function cosplayUsage(base, repos) {
    var fs = require('node:fs'), path = require('node:path'), out = [];
    (repos || COSPLAY_REPOS).forEach(function (r) {
      var top = path.isAbsolute(r) ? r : path.join(base, r), recs = path.join(top, 'records');
      if (!fs.existsSync(recs)) return;
      (function walk(dir, depth) {
        var names; try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
        names.forEach(function (d) {
          var f = path.join(dir, d.name);
          if (d.isDirectory()) { if (depth < 4 && d.name !== 'casual-reservations' && d.name !== 'automation') walk(f, depth + 1); return; }
          if (!RECORD_RX.test(d.name)) return;
          var rec; try { rec = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return; }
          var c = cosplayOfRecord(rec);
          if (c) out.push(Object.assign(c, { repo: path.basename(top), file: path.relative(top, f) }));
        });
      })(recs, 0);
    });
    return out;
  }
  /* 쓴 것 세기 — 게임마다 쓴 수 · 캐릭터(이름 열쇠)마다 { name, n, cuts } */
  function tally(list, used) {
    var games = {}, chars = {};
    (list.games || []).forEach(function (g) { games[g.key] = 0; chars[g.key] = {}; });
    (used || []).forEach(function (u) {
      var x = norm(u);
      if (!x || !(x.game in games)) return;
      games[x.game]++;
      var g = game(list, x.game), nm = x.character || (g && !g.many ? g.character : '');
      if (!nm) return;
      var k = nameKey(nm), row = chars[x.game][k] || (chars[x.game][k] = { name: nm, n: 0, cuts: [] });
      row.n++;
      if (x.cut && !has(row.cuts, x.cut)) row.cuts.push(x.cut);
    });
    return { games: games, chars: chars };
  }
  /* 2회차 몫 — 그 게임에서 쓴 캐릭터 가운데 덜 입은 하나 + 그 캐릭터가 아직 안 입은 재단(cutOk 를 지키는 것 — 물가면 수영복 재단, prefer 가 되면 그것). 없으면 null */
  function cosplayAgain(list, used, gameKey, rand, cutOk, prefer) {
    rand = rand || Math.random; cutOk = cutOk || function () { return true; };
    var ch = tally(list, used).chars[gameKey] || {}, cs = (list.cuts || []).map(function (c) { return c.key; });
    var open = Object.keys(ch).sort().map(function (k) { return { c: ch[k], cuts: cs.filter(function (x) { return !has(ch[k].cuts, x) && cutOk(x); }) }; }).filter(function (x) { return x.cuts.length; });
    if (!open.length) return null;
    var lo = Math.min.apply(null, open.map(function (x) { return x.c.cuts.length; })), pool = open.filter(function (x) { return x.c.cuts.length === lo; });
    var x = pool[Math.floor(rand() * pool.length)];
    return { character: x.c.name, cut: has(x.cuts, prefer) ? prefer : x.cuts[Math.floor(rand() * x.cuts.length)] };
  }
  /* 그 게임의 지금 회차 — 1(골라 달라고 한다) · 2(쓴 캐릭터 다시) · 0(다 찼다). 주인공 하나 게임은 1 또는 0 */
  function roundOf(list, T, key, full) {
    var g = game(list, key), cs = (list.cuts || []).map(function (c) { return c.key; }), ch = T.chars[key] || {};
    if (!g) return 0;
    if (!g.many) { var me = ch[nameKey(g.character)]; return me && cs.every(function (c) { return has(me.cuts, c); }) ? 0 : 1; }
    var names = Object.keys(ch);
    if (names.length < (g.roster || 0) && !has(full, key)) return 1;
    return names.some(function (k) { return cs.some(function (c) { return !has(ch[k].cuts, c); }); }) ? 2 : 0;
  }
  /* 고르기 — list 는 data/game-cosplay.json, used 는 쓴 기록(세 공방 + 예약 + 같은 배치), rand 는 0~1.
     opts: { full: [그리는 쪽이 더 없다고 한 게임], avoid: [{field: 'game'|'cut'|'character', value}], cuts: [이 컷에 되는 재단만(없으면 다)] }
     돌려주는 것 { game, character, cut, round, used? } 또는 null(고를 게임이 없다). used 는 pick 이 지시문에 싣는 「이미 쓴 캐릭터」 이름 목록 — 장면에 같이 얼려 둔다(생성기 · 묶음 글이 같게) */
  /* 게임 고르기 무게(2026-11-15 사용자 「케릭터 수 많은 게임일수록 더 많이 선택되게 해줘」 → 「B로해줘」) — 남은 인원의 제곱근으로 무게를 둔 무작위.
     주인공 하나 게임은 1(남은 재단 비율), 등장인물 많은 게임은 1회차 √(roster − 쓴 캐릭터 수), 2회차 √(남은 「캐릭터 + 재단」 / 재단 수). 처음엔 LoL 약 19% · 주인공 하나 게임 각 약 1.5% */
  function cosplayWeight(list, T, key, N) {
    var g = game(list, key), ch = T.chars[key] || {}, names = Object.keys(ch);
    if (!g) return 0;
    var open = function (k) { return (list.cuts || []).filter(function (c) { return !has(ch[k].cuts, c.key); }).length; };
    if (!g.many) { var me = ch[nameKey(g.character)]; return Math.sqrt((me ? open(nameKey(g.character)) : N) / N); }
    if (names.length < g.roster) return Math.sqrt(g.roster - names.length);
    return Math.sqrt(names.reduce(function (s, k) { return s + open(k); }, 0) / N);
  }
  function pickCosplay(list, used, rand, opts) {
    opts = opts || {}; rand = rand || Math.random;
    var T = tally(list, used), full = opts.full || [], avoid = opts.avoid || [];
    var no = function (f, v) { return avoid.some(function (a) { return a.field === f && a.value === v; }); };
    var cutsOk = (list.cuts || []).map(function (c) { return c.key; }).filter(function (c) { return !no('cut', c) && (!opts.cuts || has(opts.cuts, c)); });
    var cutUse = {};
    (used || []).forEach(function (u) { var x = norm(u); if (x && x.cut) cutUse[x.cut] = (cutUse[x.cut] || 0) + 1; });
    var low = function (arr, score) {
      if (!arr.length) return null;
      var m = Math.min.apply(null, arr.map(score)), pool = arr.filter(function (x) { return score(x) === m; });
      return pool[Math.floor(rand() * pool.length)];
    };
    /* 게임마다 이번에 될 수 있는 고르기 */
    var cands = (list.games || []).filter(function (g) { return !no('game', g.key); }).map(function (g) {
      var r = roundOf(list, T, g.key, full), ch = T.chars[g.key] || {}, gameCut = {};
      (used || []).forEach(function (u) { var x = norm(u); if (x && x.game === g.key && x.cut) gameCut[x.cut] = (gameCut[x.cut] || 0) + 1; });
      var cutScore = function (c) { return 100 * (gameCut[c] || 0) + (cutUse[c] || 0); };
      if (!r) return null;
      if (!g.many) {
        var me = ch[nameKey(g.character)], free = cutsOk.filter(function (c) { return !(me && has(me.cuts, c)); });
        var c1 = low(free, cutScore);
        return c1 ? { game: g.key, character: g.character, cut: c1, round: 1 } : null;
      }
      if (r === 1) {
        var c2 = low(cutsOk, cutScore);
        if (!c2) return null;
        var p1 = { game: g.key, character: '', cut: c2, round: 1, used: Object.keys(ch).map(function (k) { return ch[k].name; }).sort() };
        var ag = p1.used.length ? cosplayAgain(list, used, g.key, rand, null, c2) : null;   /* 그리는 쪽이 더 없다고 하면 그릴 몫 — 계획기가 장소를 정한 뒤 다시 맞춘다 */
        if (ag) p1.again = ag;
        return p1;
      }
      var who = Object.keys(ch).filter(function (k) { return !no('character', ch[k].name) && cutsOk.some(function (c) { return !has(ch[k].cuts, c); }); });
      var k3 = low(who, function (k) { return ch[k].n; });
      if (!k3) return null;
      var c3 = low(cutsOk.filter(function (c) { return !has(ch[k3].cuts, c); }), cutScore);
      return c3 ? { game: g.key, character: ch[k3].name, cut: c3, round: 2 } : null;
    }).filter(Boolean);
    /* 남은 인원이 많은 게임일수록 자주 — 무게는 cosplayWeight(2026-11-15) */
    var ws = cands.map(function (x) { return cosplayWeight(list, T, x.game, cutsOk.length ? (list.cuts || []).length : 1); }), sum = ws.reduce(function (a, b) { return a + b; }, 0), at = rand() * sum;
    for (var i = 0; i < cands.length; i++) { at -= ws[i]; if (at < 0) return cands[i]; }
    return cands.length ? cands[cands.length - 1] : null;
  }
  /* 지시문의 의상 글 — 목록의 글(text.fixed · pick · again)에 게임 · 캐릭터 이름 · 재단을 넣는다. 재단 열쇠는 cutKey(옷 칸 gc_<재단>)가 우선.
     게임이 없거나 목록에 없으면 '' — 부르는 쪽이 트리의 옷 글을 쓴다 */
  function cosplayText(list, cos, cutKey) {
    var g = cos && game(list, cos.game), c = cut(list, cutKey || (cos && cos.cut)), T = (list || {}).text || {};
    if (!g || !c) return '';
    if (!g.many) return fill(T.fixed, { character: g.character, game: g.en, outfit: g.outfit, cut: c.en });
    if (!str(cos.character)) {
      var used = Array.isArray(cos.used) ? cos.used.map(str).filter(Boolean) : [];
      return fill(T.pick, { game: g.en, used: used.length ? used.join(', ') : T.none, cut: c.en });
    }
    return fill(T.again, { character: str(cos.character), game: g.en, cut: c.en });
  }
  /* 장면 칸 바로잡기 — 목록에 있는 게임 · 재단만, 주인공 하나 게임은 그 주인공, 글 칸은 짧게(생성기 주소 · 저장값으로 들어온다). 틀리면 null */
  function cosplayClean(list, x) {
    if (!x || typeof x !== 'object') return null;
    var g = game(list, str(x.game)), c = cut(list, str(x.cut));
    if (!g || !c) return null;
    var clip = function (s) { return str(s).replace(/[\u0000-\u001f<>{}]/g, '').slice(0, 80); };
    var out = { game: g.key, character: g.many ? clip(x.character) : g.character, cut: c.key, round: x.round === 2 && g.many && str(x.character) ? 2 : 1 };
    if (g.many && !out.character && Array.isArray(x.used)) out.used = x.used.map(clip).filter(Boolean).slice(0, 300);
    if (g.many && !out.character && x.again && clip(x.again.character) && cut(list, str(x.again.cut))) out.again = { character: clip(x.again.character), cut: str(x.again.cut) };
    return out;
  }
  /* 2회차 몫의 장면 — 1회차 칸의 again 을 그 칸의 캐릭터 · 재단(옷 칸 gc_<재단>)으로. again 이 없으면 null (지시문 묶음 <자리>-again-prompt.txt) */
  function againScene(sc) {
    var a = sc && sc.cosplay && !str(sc.cosplay.character) && sc.cosplay.again;
    if (!a) return null;
    return Object.assign({}, sc, { item: 'gc_' + a.cut, cosplay: { game: sc.cosplay.game, character: a.character, cut: a.cut, round: 2 } });
  }
  var api = { againScene: againScene, COSPLAY_REPOS: COSPLAY_REPOS, RECORD_RX: RECORD_RX, cosplayOfRecord: cosplayOfRecord, cosplayUsage: cosplayUsage, pickCosplay: pickCosplay, cosplayAgain: cosplayAgain, cosplayText: cosplayText, cosplayClean: cosplayClean,
    cosplayRound: function (list, used, key, full) { return roundOf(list, tally(list, used), key, full || []); }, cosplayTally: tally, nameKey: nameKey, game: game, cut: cut };
  root.AtelierGameCosplay = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
