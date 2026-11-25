/* 일상컷 색인(tools/casual-index.cjs → data/casual-index.json, 허브 「일상컷 목록」 이 읽는다) — node tests/casual-index.cjs
   임시 그림 저장소 둘(0 번 · 1 번)과 임시 등록부 · 임시 게임 코스프레 목록으로 본다(실제 자료는 계속 바뀐다):
   - 꼴: 칸이 다 있다(없는 칸은 빼지 않고 null) · 우리 값이면 한글 칸이 한글 · 한 줄 JSON · 날짜 새것 먼저 · 달라진 것이 없으면 built 그대로
   - 곁가지 기록 합치기: casualN-blocked · blocked-casualN · casualN-bold · attempts/ 는 줄이 안 된다, casualN-refill 이 casualN 보다 먼저,
     같은 컷이 두 폴더 · 두 저장소에 있으면 등록부 where 저장소 → 늦은 폴더, 등록 안 된 컷은 뺀다, 화풍 없는 옛 기록 · 이름을 바꿔 올린 컷은 등록부 화풍으로
   - 필수 표시: 필수 갈래(트리 의상 계열 · 옛 칸 갈래) · 포켓몬 코스튬 · 게임 코스프레 · 캐릭터만의 컷(90) · 보통 컷은 null · 자유 설계 칸은 의상 칸이 빈다
   - 코스프레 by: 장면에 캐릭터가 차 있으면 planner, 비고 generation 에만 있으면 gpt · 캐릭터 한글은 characters[].ko(이름은 대소문자 · 빈칸 무시) → character_ko → null
   - 자유 설계 Outfit 줄: 맨 앞 줄 · 장면 글 가운데 · 우리 주문 줄은 안 뽑음 · submitted.txt 로 · 없으면 null */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), os = require('node:os'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const X = require('../tools/casual-index.cjs');
const T = X.tables(ROOT);
T.gc = { cuts: [{ key: 'mini_dress', ko: '미니 드레스' }, { key: 'bodysuit', ko: '바디수트' }],
  games: [{ key: 'gx_many', ko: '여럿 게임', en: 'Many Game', many: true, roster: 3, characters: [{ name: 'Joan', ko: '죠안', female: true }, { name: 'Lux', female: true }] },
    { key: 'gx_one', ko: '하나 게임', en: 'One Game', many: false, character: 'Hero', character_ko: '영웅' }] };
const pink = T.S.OUTFIT_COLORS.filter((c) => c.key === 'pink')[0], blush = pink.shades[1];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-index-'));
const A = path.join(tmp, 'img-a'), B = path.join(tmp, 'img-b');
const put = (repo, rel, doc) => { const f = path.join(repo, 'records', rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, typeof doc === 'string' ? doc : JSON.stringify(doc)); };
/* 생성기 저장값 꼴 기록 */
const rec = (card, style, scene, extra) => Object.assign({ storage: { last: card, cards: { [card]: { style, scenes: { casual: Object.assign({ treeV: 2 }, scene) } } } }, prompt: 'CHARACTER: …' }, extra || {});
const BU = '이상해씨', SQ = '꼬부기', ST = 'anime_25d_gloss';

/* 0 번 저장소 — 옛 납작한 꼴(갈래 cat) · 화풍 없는 옛 기록 · where 가 1 번인 컷의 옛 사본 */
put(A, 'bulbasaur-20261010/casual1-ui.json', { mech: BU, style: 'glossy_promo', outputMode: 'casual', cat: 'swimwear', outfit: 'a swimsuit' });
put(A, 'squirtle-20261011/casual1-ui.json', { input: { state: JSON.stringify({ category: { value: 'lingerie', label: '란제리' }, example: { value: '' }, outfit: { value: 'x' } }) } });
put(A, 'bulbasaur-20261020/casual1-ui.json', rec(BU, ST, { ofam: 'lingerie', item: '' }));
/* 1 번 저장소 */
const F = 'bulbasaur-20261116/';
put(B, 'bulbasaur-20261001/casual1-ui.json', rec(BU, ST, { ofam: 'everyday', item: 'jeans_tee' }));   /* 같은 저장소 옛 폴더 — 늦은 폴더가 이긴다 */
put(B, F + 'casual1-ui.json', rec(BU, ST, { ofam: 'roleplay', item: 'event_staff', ocolor: 'pink', shade: blush.key }));
for (const side of ['casual1-blocked-ui.json', 'blocked-casual1-ui.json', 'casual1-bold-ui.json', 'attempts/casual1-ui.json', 'attempts/casual12-ui.json']) put(B, F + side, rec(BU, ST, { ofam: 'lingerie', item: '' }));
put(B, F + 'casual2-ui.json', rec(BU, ST, { ofam: 'everyday', item: 'jeans_tee' }));
put(B, F + 'casual2-refill-ui.json', rec(BU, ST, { ofam: 'swimwear', item: 'classic_bikini', ocolor: 'pink',
  era: 'now', place: 'home_kitchen', posture: 'stand', frame: 'waist_up', body: 'front', camera: 'eye', gaze: 'camera', expr: 'calm', use: 'cup_hold', prop: 'cup', time: 'morning', weather: 'rain', aspect: '2:3', right: 'prop', left: 'out', support: 'none', head: 'tilt' }));
put(B, F + 'casual3-ui.json', rec(BU, ST, { ofam: 'pokemon_costume', item: 'pc_mini_dress' }));
put(B, F + 'casual4-ui.json', rec(BU, ST, { ofam: 'game_cosplay', item: 'gc_bodysuit', cosplay: { game: 'gx_many', character: ' joan ', cut: 'bodysuit', round: 1 } }));
put(B, F + 'casual5-ui.json', rec(BU, ST, { ofam: 'game_cosplay', item: 'gc_mini_dress', cosplay: { game: 'gx_many', character: '', cut: 'mini_dress', round: 1, used: [] } },
  { generation: { cosplay: { game: 'gx_many', character: 'Lux', cut: 'mini_dress' } } }));
put(B, F + 'casual6-ui.json', rec(BU, ST, { ofam: 'game_cosplay', item: 'gc_mini_dress', cosplay: { game: 'gx_one', character: 'Hero', cut: 'mini_dress', round: 1 } }));
put(B, F + 'casual7-ui.json', rec(BU, ST, { ofam: 'dongtan', item: 'dongtan_crop_skirt', ofree: true }, { prompt: 'SCENE:\nPlace: a pier\nOutfit: a navy halter top and culottes\nOutfit colours: navy' }));
put(B, F + 'casual8-ui.json', rec(BU, ST, { ofam: 'everyday', ofree: true, sfree: true },
  { prompt: 'Outfit (yours): create a revealing outfit …', generation: { design: 'gpt_free', free_prompt: 'SCENE (chosen):\nPlace: a bath. Composition: full body, vertical 2:3. Outfit: teal swimwear with hip cutouts. Situation: wind lifts her hair.\nEXPRESSION: calm' } }));
put(B, F + 'casual9-ui.json', rec(BU, ST, { ofam: 'everyday', xfree: true }, { prompt: 'Outfit and situation (yours): choose ONE of our required categories …' }));
put(B, F + 'casual9-submitted.txt', 'SCENE:\nOutfit category: swimwear. A green lined suit with a waist bridge.\nSituation: …');
put(B, F + 'casual10-ui.json', rec(BU, ST, { ofam: 'everyday', xfree: true }, { prompt: 'Outfit and situation (yours): choose …' }));
put(B, F + 'casual11-ui.json', rec(BU, ST, { ofam: 'roleplay', item: 'event_staff' }));   /* 등록 안 됨 — 막혀서 못 그린 컷 */
put(B, F + 'casual90-ui.json', rec(BU, ST, { ofam: 'everyday', own: 'all', axes: { skin_exposure: 'bold' } }, { own: { job_ko: '꽃집 견습', level: 'bold' } }));
put(B, 'squirtle-20261116/casual2-ui.json', rec(SQ, 'glossy_promo', { ofam: 'everyday', item: 'jeans_tee' }));   /* 이름을 바꿔 올린 컷 — 등록부엔 anime_25d_gloss 만 */

const files = (card, style, ns) => ns.map((n) => card + '_' + style + '_f_casual' + n + '.webp');
const bu = files(BU, ST, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 90]);
const img = { img: { [BU]: { byStyle: { glossy_promo: { casual: { f: files(BU, 'glossy_promo', [1]) } }, [ST]: { casual: { f: bu } } } },
  [SQ]: { byStyle: { glossy_promo: { casual: { f: files(SQ, 'glossy_promo', [1]) } }, [ST]: { casual: { f: files(SQ, ST, [2]) } } } } },
  where: Object.fromEntries(bu.concat(files(SQ, ST, [2])).map((f) => [f, 1])), added: { [bu[0]]: '2026-11-17', [files(BU, 'glossy_promo', [1])[0]]: '2026-10-10' } };
const repos = [{ name: X.REPOS[0], shard: 0, dir: A }, { name: X.REPOS[1], shard: 1, dir: B }];

const { doc, skipped } = X.build({ T, repos, img, now: '2026-11-17T00:00:00Z' });
const R = doc.rows, row = (card, style, n) => R.filter((r) => r.card === card && r.style === style && r.n === n)[0];

/* 꼴 */
assert.equal(doc.version, 1); assert.equal(doc.atelier, 'pkm'); assert.deepEqual(doc.source, X.REPOS.slice(0, 2));
const KEYS = ['card', 'name', 'world', 'worldKo', 'n', 'date', 'style', 'path', 'required', 'requiredKo', 'family', 'familyKo', 'item', 'itemKo', 'shade', 'shadeKo', 'cosplay', 'free'];
const HANGUL = /[가-힣]/;
/* 장면 풀이 s(2026-11-25) — 줄 끝, 있을 때만. 칸은 짧은 열쇠, 빈 칸 · undefined 없음, 우리 값은 한글(en: 1 이면 GPT 가 지은 영어) */
const S_KEYS = ['pl', 'act', 'fr', 'ex', 'gz', 'bd', 'cam', 'ln', 'lt', 'mo', 'cp', 'si', 'os', 'tm', 'ss', 'wt', 'era', 'ar', 'en'];
function sShape(r) {
  if (!('s' in r)) return;
  assert.ok(r.s && Object.keys(r.s).length, r.path + ' s 가 있으면 비지 않는다');
  for (const [k, v] of Object.entries(r.s)) {
    assert.ok(S_KEYS.includes(k), r.path + ' s 칸 ' + k);
    if (k === 'en') { assert.equal(v, 1); continue; }
    assert.equal(typeof v, 'string'); assert.ok(v.trim() && !/undefined|null|\[object/.test(v), r.path + ' s.' + k + ' = ' + v);
    if (!['ln', 'ar'].includes(k) && !(r.s.en && ['pl', 'act', 'fr'].includes(k))) assert.match(v, v === '3/4' ? /^3\/4$/ : HANGUL, r.path + ' s.' + k + ' 한글');
  }
}
for (const r of R) {
  sShape(r);
  assert.deepEqual(Object.keys(r).filter((k) => k !== 's'), KEYS, '칸 차례 · 빠진 칸 없음 ' + r.path);
  if ('s' in r) assert.equal(Object.keys(r).pop(), 's', 's 는 줄 끝');
  for (const k of ['required', 'family', 'item', 'shade']) if (r[k] != null) assert.match(String(r[k + 'Ko']), HANGUL, k + ' 한글 ' + r.path);
  if (r.cosplay) {
    assert.deepEqual(Object.keys(r.cosplay), ['game', 'gameKo', 'character', 'characterKo', 'cut', 'cutKo', 'by', 'round']);
    assert.match(r.cosplay.gameKo, HANGUL); assert.match(r.cosplay.cutKo, HANGUL);
  }
  if (r.free) assert.deepEqual(Object.keys(r.free), ['kind', 'kindKo', 'outfit']);
}
assert.equal(R.length, 14, '한 컷 한 줄 — 이상해씨 anime 열하나 + glossy 하나, 꼬부기 둘(옛 glossy · 이름 바꾼 anime) … ' + R.map((r) => r.card + r.style + r.n).join(','));
for (let i = 1; i < R.length; i++) assert(R[i - 1].date >= R[i].date, '날짜 새것 먼저');
assert.equal(R[0].date, '2026-11-17', '등록 날짜가 먼저');

/* 장면 풀이 — 둘째 줄(장소 · 하는 일 · 구도) + 더 보기(손 · 받침 · 고개는 싣지 않는다). 장면 자유 컷은 GPT 가 채운 Place 줄(한 줄에 이은 칸은 앞 칸만) */
assert.deepEqual(row(BU, ST, 2).s, { pl: '주방', act: '잔을 든다', fr: '허리 위', ex: '차분함', gz: '카메라', bd: '정면', cam: '눈높이', ln: '50mm 표준', tm: '아침', wt: '비', era: '지금 현실', ar: '2:3' });
assert.deepEqual(row(BU, ST, 8).s, { pl: 'a bath.', en: 1 });

/* 곁가지 · 겹침 · 등록 */
const c1 = row(BU, ST, 1);
assert.equal(c1.path, X.REPOS[1] + '/records/' + F + 'casual1-ui.json', '곁가지 · 옛 폴더 · 다른 저장소 사본이 아니라 그 컷: ' + c1.path);
assert.equal(c1.family, 'roleplay');
assert.equal(row(BU, ST, 2).path.endsWith('casual2-refill-ui.json'), true, '다시 채운 기록이 먼저');
assert.equal(row(BU, ST, 2).required, 'swimwear');
assert(!row(BU, ST, 11) && !row(BU, ST, 12), '등록 안 된 컷 · attempts 아래 기록은 빠진다');
assert.equal(skipped.unregistered, 1);
assert.equal(row(SQ, ST, 2).path, X.REPOS[1] + '/records/squirtle-20261116/casual2-ui.json', '이름을 바꿔 올린 컷은 등록부 화풍으로');
assert.equal(row(SQ, 'glossy_promo', 1).required, 'lingerie', '화풍 없는 옛 기록 · { value } 꼴 갈래');

/* 필수 표시 · 한글 */
assert.equal(c1.requiredKo, '필수 갈래(역할극·직업 의상)');
assert.equal(c1.itemKo, '이벤트 스태프');
assert.deepEqual([c1.shade, c1.shadeKo], [blush.key, blush.ko], '구체 색 shade 한글');
assert.deepEqual([row(BU, ST, 2).shade, row(BU, ST, 2).shadeKo], ['pink', pink.ko], 'shade 없는 옛 컷은 묶음');
const g1 = row(BU, 'glossy_promo', 1);
assert.equal(g1.required, 'swimwear', '옛 칸 갈래 swimwear'); assert.equal(g1.requiredKo, '필수 갈래(수영복)'); assert.equal(g1.date, '2026-10-10');
assert.deepEqual([row(BU, ST, 3).required, row(BU, ST, 3).requiredKo, row(BU, ST, 3).itemKo, row(BU, ST, 3).shade], ['pokemon_costume', '포켓몬 코스튬', '미니 드레스형', null]);
assert.deepEqual([row(BU, ST, 4).required, row(BU, ST, 4).requiredKo], ['game_cosplay', '게임 코스프레']);
const own = row(BU, ST, 90);
assert.deepEqual([own.required, own.requiredKo, own.family], ['own', '캐릭터만의 컷', null]);
assert.match(own.itemKo, /꽃집 견습/);
assert.equal(row(SQ, ST, 2).required, null, '보통 컷은 null');
assert.equal(row(SQ, ST, 2).familyKo, '평상복');

/* 코스프레 */
assert.deepEqual(row(BU, ST, 4).cosplay, { game: 'gx_many', gameKo: '여럿 게임', character: 'joan', characterKo: '죠안', cut: 'bodysuit', cutKo: '바디수트', by: 'planner', round: 1 });
assert.deepEqual(row(BU, ST, 5).cosplay, { game: 'gx_many', gameKo: '여럿 게임', character: 'Lux', characterKo: null, cut: 'mini_dress', cutKo: '미니 드레스', by: 'gpt', round: 1 });
assert.equal(row(BU, ST, 6).cosplay.characterKo, '영웅', '주인공 하나 게임은 character_ko');
assert.equal(row(BU, ST, 6).cosplay.by, 'planner');
assert.equal(c1.cosplay, null);

/* 자유 설계 */
const fr = (n) => row(BU, ST, n);
assert.deepEqual(fr(7).free, { kind: 'ofree', kindKo: '옷 자유', outfit: 'a navy halter top and culottes' });
assert.deepEqual([fr(7).required, fr(7).family, fr(7).item, fr(7).shade], [null, null, null, null], '자유 설계 칸은 의상 칸이 빈다');
assert.deepEqual(fr(8).free, { kind: 'sfree', kindKo: '장면 자유', outfit: 'teal swimwear with hip cutouts.' }, '장면 글 가운데 Outfit');
assert.deepEqual(fr(9).free, { kind: 'xfree', kindKo: '갈래 · 상황 자유', outfit: 'Outfit category: swimwear. A green lined suit with a waist bridge.' }, 'submitted.txt 로');
assert.equal(fr(10).free.outfit, null, '우리 주문 줄은 뽑지 않는다');
assert.equal(X.outfitLine('Outfit colours: navy — her own colour choice'), null);

/* built — 달라진 것이 없으면 그대로 */
assert.equal(X.build({ T, repos, img, now: '2026-11-18T00:00:00Z', prev: doc }).doc.built, '2026-11-17T00:00:00Z');
put(B, F + 'casual3-ui.json', rec(BU, ST, { ofam: 'pokemon_costume', item: 'pc_bodysuit' }));
assert.equal(X.build({ T, repos, img, now: '2026-11-18T00:00:00Z', prev: doc }).doc.built, '2026-11-18T00:00:00Z');

/* 명령줄 — 한 줄 JSON */
fs.writeFileSync(path.join(tmp, 'img.json'), JSON.stringify(img));
const out = path.join(tmp, 'index.json');
const r = cp.spawnSync('node', [path.join(ROOT, 'tools', 'casual-index.cjs'), '--repos', A, B, '--img', path.join(tmp, 'img.json'), '--out', out], { encoding: 'utf8' });
assert.equal(r.status, 0, r.stderr);
const text = fs.readFileSync(out, 'utf8');
assert.equal(text.trim().split('\n').length, 1, '한 줄');
assert.equal(JSON.parse(text).rows.length, 14);
fs.rmSync(tmp, { recursive: true, force: true });
console.log('PASS 일상컷 색인 — 꼴 · 한글 · 곁가지 합치기 · 필수 표시 · 코스프레 by · 자유 설계 Outfit 줄 · built 그대로 · 명령줄 (' + R.length + '줄)');
