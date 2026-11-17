/* 게임 코스프레(2026-11-15) — 일상컷 필수 갈래 하나. 사용자 「pkm,원소,삼국지 공방에 갈래 하나 추가해서 게임공방에 있는 게임 코스프레 의상은 어떨까?」
   목록은 data/game-cosplay.json(원본 game-atelier — 세 공방이 같은 사본, 고치지 않는다). 「캐릭터 + 재단」 묶음이 한 단위, 쓴 기록은 세 공방(pkm · 원소 · 삼국지)을 합쳐 센다.
   세 공방이 같은 꼴로 읽고 쓴다 — 함수 이름 cosplayUsage(쓴 기록 모으기) · pickCosplay(게임 · 캐릭터 · 재단 고르기) · cosplayAgain(2회차 몫), 칸 이름(원소 53b1956 과 같게):
     장면(계획 · 생성기 상태)  scene.cosplay = { game, character, cut, round, used?, again? } — pick(등장인물 많은 게임 1회차)이면 character 는 빈 칸,
                               used 는 그 게임에서 쓴 캐릭터(지시문 {used}), again 은 그리는 쪽이 더 고를 캐릭터가 없을 때 그릴 2회차 몫 { character, cut }(쓴 캐릭터가 있을 때만)
     그린 뒤 기록              generation.cosplay = { game, character, cut }     — pick 은 그리는 쪽이 채운 캐릭터 이름
   고르기(pickCosplay):
     1. 게임 — 세 공방 기록에서 게임은 남은 인원의 제곱근 무게로 무작위(2026-11-15 「케릭터 수 많은 게임일수록 더 많이 선택되게」 → B — 처음엔 LoL 약 19% · 주인공 하나 게임 각 약 1.5%), 다 찬 게임은 빠진다
     2. 주인공 하나(many: false) — 그 주인공이 아직 안 입은 재단 하나 → text.fixed. 열하나를 다 입으면 그 게임은 빠진다
     3. 등장인물 많음 1회차(목록 characters 가운데 아직 안 쓰고 예약도 안 된 캐릭터가 있을 때) — 계획기가 캐릭터를 정한다(2026-11-16 사용자 「오버워치 메르시가 4케릭터안에서 2번이나」 → 「응 그래」):
        남은 캐릭터 가운데 무작위, 여자 캐릭터 무게 2 · 남자 1(남자는 크로스플레이). 재단은 그 게임에서 덜 쓴 것 먼저 → text.assigned.
        (옛 1회차 pick — character 빈 칸, 그리는 쪽이 「…」 를 채운다 → text.pick — 은 새 계획에서 안 쓴다. 이미 짜인 옛 계획의 칸을 위해 글 · 묶음 안내만 남는다)
     4. 2회차(목록의 캐릭터를 모두 쓰거나 예약했을 때, 또는 opts.full) — 쓴 캐릭터 가운데 덜 쓴 하나 + 그 캐릭터가 아직 안 입은 재단 → text.again.
        모든 캐릭터 × 재단이 차면 그 게임은 빠진다
   쓴 것(cosplayUsed — node 만) = 그린 기록 + 아직 안 그린 계획의 예약. 옆 그림 저장소(COSPLAY_REPOS 가운데 있는 것)의 records 아래
     그린 기록(…casualN…-ui.json) — generation.cosplay, 없으면 장면의 cosplay 가운데 character 가 찬 것(cosplayUsage),
     계획 · 예약(cosplayPlanned) — 계획 파일(…plan.json · …plan-v2.json · …-replan.json), 세션 예약(casual-reservations/*.json), 장부(casual-ledger.json)의 reserved 칸.
     같은 컷(공방 · 카드 · 세계 · 번호)은 한 번만 — 그린 기록이 있으면 기록이, 없으면 계획 가운데 늦은 것(다시 짠 replan · 늦은 at)이 그 컷이다.
   브라우저(window.AtelierGameCosplay)와 node(module.exports)가 같이 쓴다 */
(function (root) {
  'use strict';
  /* 쓴 것은 이 공방 그림 저장소에서만(2026-11-16 사용자 「공방별로 따로 두는건?」 → 「응 그렇게 진행해줘」 — 전엔 세 공방 합쳐 읽었는데 없는 저장소를 조용히 건너뛰었다.
     다른 공방과는 같은 캐릭터가 나올 수 있다). 계획기가 이 공방 저장소가 하나도 없으면 멈추고, 빠진 것은 알린다(tools/casual-plan.cjs) */
  var COSPLAY_REPOS = ['pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3', 'pkm-atelier-img-4', 'pkm-atelier-img-5'];
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
  /* 공방 이름 — 그림 저장소 이름에서 -img(-N) 를 뗀다(pkm-atelier-img-3 → pkm-atelier). 같은 공방의 저장소 여럿이 한 컷을 나눠 갖는다 */
  function familyOf(repo) { return String(repo || '').replace(/-img(-\d+)?$/, ''); }
  /* 컷 열쇠 — 공방 · 카드 · 세계(없으면 '') · 번호 */
  function cutKeyOf(x) { return [x.family || '', x.card || '', x.world || '', x.no == null ? '' : x.no].join('|'); }
  function storageOf(rec) {
    var st = (rec && rec.storage) || {};
    if (!st.cards && !st.scenes && typeof st.pkm_prompt_v2 === 'string') { try { st = JSON.parse(st.pkm_prompt_v2); } catch (e) { st = {}; } }
    return st;
  }
  /* 그린 기록 한 장의 자리 — 카드(기록의 card · 저장값의 last · 폴더 이름) · 세계(기록의 world, 파일 이름 앞 <세계>-casualN) · 번호(casualN) */
  function recordPlace(rec, name, folder) {
    var m = /^(?:(.+?)-)?casual(\d+)/.exec(name) || [], st = storageOf(rec);
    return { card: str(rec && rec.card) || str(st.last) || folder, world: str(rec && rec.world) || m[1] || '', no: m[2] ? Number(m[2]) : null };
  }
  /* node — 옆 그림 저장소 records 를 한 번 훑는다. fn(kind, json, { top, file, name, folder }) — kind 는 'record'(일상 기록) · 'plan'(계획 · 예약 · 장부) */
  var PLAN_RX = /(?:^|[-_.])(?:re)?plan(?:-v2)?\.json$/;
  function walkRepos(base, repos, fn) {
    var fs = require('node:fs'), path = require('node:path');
    (repos || COSPLAY_REPOS).forEach(function (r) {
      var top = path.isAbsolute(r) ? r : path.join(base, r), recs = path.join(top, 'records');
      if (!fs.existsSync(recs)) return;
      (function walk(dir, depth, inRes) {
        var names; try { names = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return; }
        names.forEach(function (d) {
          var f = path.join(dir, d.name);
          if (d.isDirectory()) { if (depth < 4 && d.name !== 'automation') walk(f, depth + 1, d.name === 'casual-reservations'); return; }
          if (!/\.json$/.test(d.name)) return;
          var kind = RECORD_RX.test(d.name) && !inRes ? 'record' : (inRes || PLAN_RX.test(d.name) || (depth === 0 && d.name === 'casual-ledger.json')) ? 'plan' : '';
          if (!kind) return;
          var j; try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return; }
          fn(kind, j, { top: top, repo: path.basename(top), file: path.relative(top, f), name: d.name, folder: inRes || depth === 0 ? '' : path.basename(dir) });
        });
      })(recs, 0, false);
    });
  }
  /* 공방 이름 — opts.family(저장소 폴더) 가 주면 그것(검사 · --repos 로 받은 폴더), 아니면 저장소 이름에서 */
  function famOf(opts, at) { return (opts && opts.family && opts.family(at.top)) || familyOf(at.repo); }
  /* node — 옆 그림 저장소 records 의 일상 기록에서 쓴 코스프레를 모은다. base 는 저장소들이 있는 폴더(보통 ../), repos 는 이름 목록(없으면 COSPLAY_REPOS).
     opts.all 이면 코스프레가 없는 기록도(cosplay: null) — 「그린 컷」 자리를 알려고. 칸마다 repo · file · family · card · world · no */
  function cosplayUsage(base, repos, opts) {
    var out = [];
    walkRepos(base, repos, function (kind, rec, at) {
      if (kind !== 'record') return;
      var c = cosplayOfRecord(rec), row = Object.assign({ repo: at.repo, file: at.file, family: famOf(opts, at) }, recordPlace(rec, at.name, at.folder));
      if (c) out.push(Object.assign(c, row));
      else if (opts && opts.all) out.push(Object.assign({ cosplay: null }, row));
    });
    return out;
  }
  /* node — 계획 · 예약 · 장부(reserved 칸)의 게임 코스프레 칸. 컷 열쇠마다 늦은 것 하나(replan 파일 > 늦은 at > 나중에 읽은 것).
     칸마다 game · character · cut · round(그 계획 그대로 — pick 은 character 빈 칸 · used) + repo · file · family · card · world · no · at */
  function cosplayPlanned(base, repos, opts) {
    var best = {};
    walkRepos(base, repos, function (kind, doc, at) {
      if (kind !== 'plan') return;
      var fm = /^(?:(.+?)-)?casual(?:(\d+)-)?(?:re)?plan/.exec(at.name) || [], replan = /replan/.test(at.name) ? 1 : 0, family = famOf(opts, at);
      (function walk(x, ctx, depth) {
        if (!x || typeof x !== 'object' || depth > 6) return;
        if (Array.isArray(x)) { x.forEach(function (y) { walk(y, ctx, depth + 1); }); return; }
        if (x.status && x.status !== 'reserved') return;   /* 장부의 done 칸은 그린 기록에서 센다 */
        var me = { card: str(x.card) || ctx.card, world: str(x.world) || ctx.world, at: str(x.at) || ctx.at };
        ['cuts', 'casual_plan'].forEach(function (k) {
          if (!Array.isArray(x[k])) return;
          x[k].forEach(function (c) {
            var cos = c && norm(c.cosplay);
            if (!cos) return;
            var no = typeof c.cut === 'number' ? c.cut : typeof c.n === 'number' ? c.n : typeof c.no === 'number' ? c.no : fm[2] ? Number(fm[2]) : null;
            var row = Object.assign({}, c.cosplay, cos, { round: c.cosplay.round || 1, repo: at.repo, file: at.file, family: family, card: me.card || at.folder, world: me.world, no: no, at: me.at, replan: replan });
            var k2 = cutKeyOf(row), old = best[k2];
            if (!old || old.replan < row.replan || (old.replan === row.replan && old.at <= row.at)) best[k2] = row;
          });
        });
        Object.keys(x).forEach(function (k) { if (k !== 'cuts' && k !== 'casual_plan' && k !== 'cosplay') walk(x[k], me, depth + 1); });
      })(doc, { card: '', world: fm[1] || '', at: str(doc && doc.at) }, 0);
    });
    return Object.keys(best).sort().map(function (k) { return best[k]; });
  }
  /* node — 쓴 것 = 그린 기록 + 아직 안 그린 계획의 예약(character 가 찬 것). 같은 컷은 한 번 — 그린 기록(코스프레가 없는 기록도)이 있는 컷의 계획은 안 센다.
     opts.family(저장소 폴더) — 공방 이름을 정한다(검사 · --repos 로 받은 폴더), opts.skip(계획 칸) — 참이면 그 계획 칸은 안 센다(지금 다시 짜는 카드).
     돌려주는 것 { used, records, planned, pending } — planned 는 센 예약, pending 은 아직 안 그린 옛 pick 칸(character 빈 칸 — 다시 짜기 대상) */
  function cosplayUsed(base, repos, opts) {
    opts = opts || {};
    var all = cosplayUsage(base, repos, { all: true, family: opts.family }), drawn = {};
    all.forEach(function (r) { drawn[cutKeyOf(r)] = 1; });
    var open = cosplayPlanned(base, repos, opts).filter(function (p) { return !drawn[cutKeyOf(p)] && !(opts.skip && opts.skip(p)); });
    var records = all.filter(function (r) { return r.cosplay !== null; }), planned = open.filter(function (p) { return p.character; });
    return { used: records.concat(planned), records: records, planned: planned, pending: open.filter(function (p) { return !p.character; }), drawn: drawn };
  }
  /* 쓴 것 세기 — 게임마다 쓴 수 · 캐릭터(이름 열쇠)마다 { name, n, cuts } */
  function tally(list, used) {
    var games = {}, chars = {};
    (list.games || []).forEach(function (g) { games[g.key] = 0; chars[g.key] = {}; });
    (used || []).forEach(function (u) {
      var x = norm(u);
      if (!x || !(x.game in games)) return;
      games[x.game]++;
      var g = game(list, x.game), nm = g && !g.many ? g.character : x.character;
      if (g && g.many && nm) { var ak = (g.characters || []).filter(function (c) { return (c.aka || []).some(function (a) { return nameKey(a) === nameKey(nm); }); })[0]; if (ak) nm = ak.name; }   /* 다른 표기(aka — 2026-11-17)는 그 캐릭터 이름으로 */   /* 주인공 하나 게임은 기록의 이름이 달라도(Geralt · Geralt of Rivia) 그 주인공 */
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
  /* 등장인물 많은 게임의 캐릭터 목록(characters — 2026-11-16) 가운데 아직 안 쓰고 예약도 안 된 것. 목록이 없는 옛 사본이면 null */
  function freeChars(g, ch) {
    if (!Array.isArray(g.characters) || !g.characters.length) return null;
    return g.characters.filter(function (c) { return c && str(c.name) && !ch[nameKey(c.name)]; });
  }
  /* 그 게임의 지금 회차 — 1(새 캐릭터 · 옛 사본은 골라 달라고 한다) · 2(쓴 캐릭터 다시) · 0(다 찼다). 주인공 하나 게임은 1 또는 0 */
  function roundOf(list, T, key, full) {
    var g = game(list, key), cs = (list.cuts || []).map(function (c) { return c.key; }), ch = T.chars[key] || {};
    if (!g) return 0;
    if (!g.many) { var me = ch[nameKey(g.character)]; return me && cs.every(function (c) { return has(me.cuts, c); }) ? 0 : 1; }
    var names = Object.keys(ch), fc = freeChars(g, ch);
    if ((fc ? fc.length > 0 : names.length < (g.roster || 0)) && !has(full, key)) return 1;
    return names.some(function (k) { return cs.some(function (c) { return !has(ch[k].cuts, c); }); }) ? 2 : 0;
  }
  /* 고르기 — list 는 data/game-cosplay.json, used 는 쓴 기록(세 공방 + 예약 + 같은 배치), rand 는 0~1.
     opts: { full: [2회차로 넘길 게임], avoid: [{field: 'game'|'cut'|'character', value}], cuts: [이 컷에 되는 재단만(없으면 다)], prefer: 되면 그 재단(다시 짜기 — 옷 · 드러내기가 덜 바뀌게) }
     돌려주는 것 { game, character, cut, round } 또는 null(고를 게임이 없다). 등장인물 많은 게임 1회차도 캐릭터가 찬다(2026-11-16 — assigned).
     목록에 characters 가 없는 옛 사본만 예전 pick({ character: '', used }) */
  /* 게임 고르기 무게(2026-11-15 사용자 「케릭터 수 많은 게임일수록 더 많이 선택되게 해줘」 → 「B로해줘」) — 남은 인원의 제곱근으로 무게를 둔 무작위.
     주인공 하나 게임은 1(남은 재단 비율), 등장인물 많은 게임은 1회차 √(목록에서 안 쓴 · 안 예약한 캐릭터 수 — 옛 사본은 roster − 쓴 수), 2회차 √(남은 「캐릭터 + 재단」 / 재단 수) */
  function cosplayWeight(list, T, key, N) {
    var g = game(list, key), ch = T.chars[key] || {}, names = Object.keys(ch);
    if (!g) return 0;
    var open = function (k) { return (list.cuts || []).filter(function (c) { return !has(ch[k].cuts, c.key); }).length; };
    if (!g.many) { var me = ch[nameKey(g.character)]; return Math.sqrt((me ? open(nameKey(g.character)) : N) / N); }
    var fc = freeChars(g, ch);
    if (fc ? fc.length : names.length < g.roster) return Math.sqrt(fc ? fc.length : g.roster - names.length);
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
    var lowCut = function (arr, score) { return opts.prefer && has(arr, opts.prefer) ? opts.prefer : low(arr, score); };
    /* 게임마다 이번에 될 수 있는 고르기 */
    var cands = (list.games || []).filter(function (g) { return !no('game', g.key); }).map(function (g) {
      var r = roundOf(list, T, g.key, full), ch = T.chars[g.key] || {}, gameCut = {};
      (used || []).forEach(function (u) { var x = norm(u); if (x && x.game === g.key && x.cut) gameCut[x.cut] = (gameCut[x.cut] || 0) + 1; });
      var cutScore = function (c) { return 100 * (gameCut[c] || 0) + (cutUse[c] || 0); };
      if (!r) return null;
      if (!g.many) {
        var me = ch[nameKey(g.character)], free = cutsOk.filter(function (c) { return !(me && has(me.cuts, c)); });
        var c1 = lowCut(free, cutScore);
        return c1 ? { game: g.key, character: g.character, cut: c1, round: 1 } : null;
      }
      var fc = freeChars(g, ch);
      if (r === 1 && fc) {   /* 2026-11-16 — 계획기가 정한다: 남은 캐릭터 가운데 여자 무게 2 · 남자 1 */
        var pool = fc.filter(function (c) { return !no('character', c.name); }), cA = lowCut(cutsOk, cutScore);
        if (!pool.length || !cA) return null;
        var wsum = pool.reduce(function (s, c) { return s + (c.female ? 2 : 1); }, 0), wat = rand() * wsum, who1 = pool[pool.length - 1];
        for (var j = 0; j < pool.length; j++) { wat -= pool[j].female ? 2 : 1; if (wat < 0) { who1 = pool[j]; break; } }
        return { game: g.key, character: who1.name, cut: cA, round: 1 };
      }
      if (r === 1) {   /* 옛 사본(characters 없음) — 그리는 쪽이 고른다(pick) */
        var c2 = lowCut(cutsOk, cutScore);
        if (!c2) return null;
        var p1 = { game: g.key, character: '', cut: c2, round: 1, used: Object.keys(ch).map(function (k) { return ch[k].name; }).sort() };
        var ag = p1.used.length ? cosplayAgain(list, used, g.key, rand, null, c2) : null;   /* 그리는 쪽이 더 없다고 하면 그릴 몫 — 계획기가 장소를 정한 뒤 다시 맞춘다 */
        if (ag) p1.again = ag;
        return p1;
      }
      var who = Object.keys(ch).filter(function (k) { return !no('character', ch[k].name) && cutsOk.some(function (c) { return !has(ch[k].cuts, c); }); });
      var k3 = low(who, function (k) { return ch[k].n; });
      if (!k3) return null;
      var c3 = lowCut(cutsOk.filter(function (c) { return !has(ch[k3].cuts, c); }), cutScore);
      return c3 ? { game: g.key, character: ch[k3].name, cut: c3, round: 2 } : null;
    }).filter(Boolean);
    /* 남은 인원이 많은 게임일수록 자주 — 무게는 cosplayWeight(2026-11-15) */
    var ws = cands.map(function (x) { return cosplayWeight(list, T, x.game, cutsOk.length ? (list.cuts || []).length : 1); }), sum = ws.reduce(function (a, b) { return a + b; }, 0), at = rand() * sum;
    for (var i = 0; i < cands.length; i++) { at -= ws[i]; if (at < 0) return cands[i]; }
    return cands.length ? cands[cands.length - 1] : null;
  }
  /* 지시문의 의상 글 — 목록의 글(text.fixed · assigned · again · 옛 pick)에 게임 · 캐릭터 이름 · 재단을 넣는다. 재단 열쇠는 cutKey(옷 칸 gc_<재단>)가 우선.
     등장인물 많은 게임: 캐릭터 빈 칸 → pick(옛 계획), 2회차 → again, 그 밖(1회차 · 생성기에서 고른 캐릭터) → assigned(없는 옛 사본이면 again).
     게임이 없거나 목록에 없으면 '' — 부르는 쪽이 트리의 옷 글을 쓴다 */
  function cosplayText(list, cos, cutKey) {
    var g = cos && game(list, cos.game), c = cut(list, cutKey || (cos && cos.cut)), T = (list || {}).text || {};
    if (!g || !c) return '';
    if (!g.many) return fill(T.fixed, { character: g.character, game: g.en, outfit: g.outfit, cut: c.en });
    if (!str(cos.character)) {
      var used = Array.isArray(cos.used) ? cos.used.map(str).filter(Boolean) : [];
      return fill(T.pick, { game: g.en, used: used.length ? used.join(', ') : T.none, cut: c.en });
    }
    return fill(cos.round === 2 || !T.assigned ? T.again : T.assigned, { character: str(cos.character), game: g.en, cut: c.en });
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
  /* walkRepos · recordPlace 는 일상컷 구체 색 세기(lib/casual-plan.js shadeUsed, 2026-11-16)도 같은 길로 읽는다 */
  var api = { againScene: againScene, COSPLAY_REPOS: COSPLAY_REPOS, RECORD_RX: RECORD_RX, cosplayOfRecord: cosplayOfRecord, cosplayUsage: cosplayUsage, pickCosplay: pickCosplay, cosplayAgain: cosplayAgain, cosplayText: cosplayText, cosplayClean: cosplayClean,
    cosplayRound: function (list, used, key, full) { return roundOf(list, tally(list, used), key, full || []); }, cosplayTally: tally, cosplayPlanned: cosplayPlanned, cosplayUsed: cosplayUsed, cutKeyOf: cutKeyOf, walkRepos: walkRepos, recordPlace: recordPlace, familyOf: familyOf, nameKey: nameKey, game: game, cut: cut };
  root.AtelierGameCosplay = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
