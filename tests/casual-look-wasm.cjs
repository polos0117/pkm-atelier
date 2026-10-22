#!/usr/bin/env node
/* 일상컷 생김새 문턱의 wasm 판(tools/casual-look.wasm · tools/casual-look.cjs) — cargo 없는 곳에서도 같은 문턱이 서나.
   - wasm 이 소스보다 묵지 않았나: wasm 안의 source_hash 와 rust/ 소스를 같은 규칙으로 셈한 값(rust/casual-wasm/build.rs)
   - 세 장끼리 거의 같으면 1, 다른 그림이면 0, 못 읽으면 2 — 실패한 뒤에도 앞 그림이 다음 검사에 남지 않는다
   - 등록된 일상컷(그림 저장소가 옆에 있을 때) — 다른 카드로 넣으면 그 컷과 거의 같다고 잡는다
   - 명령줄(rust/target/release/casual-look 이 지어져 있을 때)과 글·끝 번호가 한 글자도 다르지 않다 */
'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), os = require('node:os'), path = require('node:path'), zlib = require('node:zlib'), cp = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const C = require(path.join(ROOT, 'tools', 'casual-look.cjs'));
let n = 0;
const ok = (name, f) => { f(); n++; console.log('✓', name); };

/* build.rs 와 같은 셈 */
function sourceHash() {
  const rust = path.join(ROOT, 'rust'), files = [];
  const walk = rel => {
    const p = path.join(rust, rel);
    if (!fs.existsSync(p)) return;
    if (fs.statSync(p).isDirectory()) for (const k of fs.readdirSync(p).sort()) walk(`${rel}/${k}`);
    else files.push(rel);
  };
  for (const rel of ['art-core/Cargo.toml', 'art-core/src', 'casual-look/Cargo.toml', 'casual-look/src/lib.rs', 'casual-wasm/Cargo.toml', 'casual-wasm/build.rs', 'casual-wasm/src']) walk(rel);
  files.sort();
  let h = 0xcbf29ce484222325n;
  const feed = buf => { for (const b of buf) { h ^= BigInt(b); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; } };
  for (const f of files) {
    feed(Buffer.from(f)); feed([0]);
    feed(Buffer.from(fs.readFileSync(path.join(rust, f), 'utf8').replace(/\r\n/g, '\n'))); feed([0]);
  }
  return h.toString(16).padStart(16, '0');
}

/* 시험 그림 — 512×768 RGB PNG */
function png(f) {
  const w = 512, h = 768, raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw.set(f(x, y), y * (w * 3 + 1) + 1 + x * 3);
  const crcT = Array.from({ length: 256 }, (_, k) => { let c = k; for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = b => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casual-look-'));
const put = (name, buf) => { const p = path.join(tmp, name); fs.writeFileSync(p, buf); return p; };
const bar = cx => (x, y) => Math.abs(x - cx) < 60 || y > 600 ? [200, 40, 40] : [20, 20, 60];
const A = put('a.png', png(bar(256))), A2 = put('a2.png', png(bar(256))), B = put('b.png', png((x, y) => Math.abs(x - 90) < 60 && y < 500 ? [40, 200, 90] : [60, 20, 20]));
const BAD = put('bad.webp', Buffer.from('그림이 아니다'));
const EMPTY = put('empty.json', '{"cuts": []}\n');
const quiet = () => { const o = { text: '', err: '' }; return [o, { out: s => { o.text += s; }, err: s => { o.err += s; } }]; };
const run = a => { const [o, io] = quiet(); o.code = C.run(a, io); return o; };

ok('wasm 이 소스와 같다', () => {
  assert.equal(C.load().hash, sourceHash(), 'tools/casual-look.wasm 이 소스보다 묵었다 — rust/README.md 대로 다시 지어 올릴 것');
});

ok('세 장끼리 거의 같으면 1 · 다른 그림이면 0 · 못 읽으면 2', () => {
  const same = run(['check', '--card', '피카츄', A, A2, '--index', EMPTY]);
  assert.equal(same.code, 1, same.text + same.err);
  assert.match(same.text, /이번 2번째 그림과 거의 같다/);
  const diff = run(['check', '--card', '피카츄', A, B, '--index', EMPTY, '--json']);
  assert.equal(diff.code, 0, diff.text + diff.err);
  const j = JSON.parse(diff.text);
  assert.equal(j.ok, true); assert.equal(j.cuts.length, 2); assert.equal(j.cuts[0].file, A);
  const bad = run(['check', '--card', '피카츄', A, BAD, '--index', EMPTY]);
  assert.equal(bad.code, 2); assert.match(bad.err, /bad\.webp/);
  assert.equal(run(['check', '--card', '피카츄', path.join(tmp, '없다.webp'), '--index', EMPTY]).code, 2);
  assert.equal(run(['check', '--card', '피카츄', A, '--index', path.join(tmp, '없다.json')]).code, 2);
  assert.equal(run(['check', A]).code, 2, '카드 없이');
  assert.match(run(['index']).err, /cargo/);
});

ok('실패한 뒤 앞 그림이 남지 않는다', () => {
  const W = C.load();
  assert.throws(() => W.check('{"cuts": []}', '피카츄', [{ name: 'a', bytes: fs.readFileSync(A) }, { name: 'bad', bytes: fs.readFileSync(BAD) }], true), /bad/);
  const r = W.check('{"cuts": []}', '피카츄', [{ name: 'a2', bytes: fs.readFileSync(A2) }], true);
  assert.equal(JSON.parse(r.out).cuts.length, 1);
});

/* 등록된 일상컷 — 썸네일·원본이 옆 그림 저장소에 있을 때 */
const INDEX = path.join(ROOT, 'data', 'casual-look.json');
const doc = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'img.json'), 'utf8'));
const where = f => { const k = (doc.where || {})[f] || 0, d = path.join(ROOT, k ? `img-${k + 1}` : 'img'); return [path.join(d, 'thumb', f), path.join(d, f)].find(p => fs.existsSync(p)); };
const reg = JSON.parse(fs.readFileSync(INDEX, 'utf8')).cuts.map(c => ({ ...c, at: where(c.file) })).filter(c => c.at).slice(0, 3);
if (reg.length) ok('등록된 일상컷을 다른 카드로 넣으면 거의 같다고 잡는다', () => {
  const r = run(['check', '--card', '다른카드', reg[0].at, '--json']);
  assert.equal(r.code, 1, r.err);
  assert.ok(JSON.parse(r.text).cuts[0].duplicate_of.some(x => x[0] === reg[0].file));
  const own = run(['check', '--card', reg[0].card, reg[0].at, '--json']);
  assert.ok(!JSON.parse(own.text).cuts[0].duplicate_of.some(x => x[0] === reg[0].file), '같은 카드의 컷은 견주지 않는다');
});
else console.log('· 그림 저장소가 옆에 없다 — 등록된 일상컷 대조는 건너뜀');

const BIN = path.join(ROOT, 'rust', 'target', 'release', 'casual-look');
if (fs.existsSync(BIN)) ok('명령줄과 글·끝 번호가 같다', () => {
  const sets = [['--card', '피카츄', A, A2, B, '--index', EMPTY], ['--card', '피카츄', A, BAD, '--index', EMPTY]];
  if (reg.length) sets.push(['--card', '다른카드', ...reg.map(c => c.at)], ['--card', reg[0].card, ...reg.map(c => c.at)]);
  for (const s of sets) for (const js of [[], ['--json']]) {
    const a = ['check', ...s, ...js];
    const nat = cp.spawnSync(BIN, a, { encoding: 'utf8' }), w = run(a);
    assert.equal(w.code, nat.status, a.join(' '));
    assert.equal(w.text, nat.stdout, a.join(' '));
    assert.equal(w.err, nat.stderr, a.join(' '));
  }
});
else console.log('· rust/target/release/casual-look 이 없다(cargo 없음) — 명령줄 대조는 건너뜀');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`casual-look wasm — ${n}가지 통과`);
