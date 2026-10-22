#!/usr/bin/env node
/* 일상컷 생김새 문턱 — cargo 없는 곳에서. rust/casual-look 의 check 와 같은 셈을 wasm(tools/casual-look.wasm)으로 돌린다.

   node tools/casual-look.cjs check --card <카드> <그림1> <그림2> <그림3> [--json] [--index data/casual-look.json]

   글·끝 번호도 명령줄과 같다 — 0 통과 · 1 거의 같은 컷 있음(그 컷은 계획기로 다시 정한다) · 2 실패.
   색인을 다시 짓는 index 와 pairs 는 cargo 로만(색인은 등록 워크플로가 짓는다 — rust/README.md).
   wasm 이 소스보다 묵었는지는 tests/casual-look-wasm.cjs 가 본다. 소스를 고쳤으면 rust/README.md 대로 다시 지어 올린다. */
'use strict';
const fs = require('node:fs'), path = require('node:path');
const ROOT = process.env.PKM_ROOT ? path.resolve(process.env.PKM_ROOT) : path.resolve(__dirname, '..');
const WASM = path.join(__dirname, 'casual-look.wasm');
const API_VERSION = 1;

function load(file = WASM) {
  const m = new WebAssembly.Instance(new WebAssembly.Module(fs.readFileSync(file)), {});
  const x = m.exports;
  if (x.api_version() !== API_VERSION) throw new Error(`casual-look.wasm 내보내기 꼴 ${x.api_version()} — 싣개는 ${API_VERSION}`);
  const text = (ptr, len) => Buffer.from(new Uint8Array(x.memory.buffer, ptr, len)).toString('utf8');
  /* 바이트를 wasm 자리에 써 넣고 f(ptr, len) — 끝나면 돌려준다 */
  const withBytes = (buf, f) => {
    const ptr = x.alloc(buf.length);
    new Uint8Array(x.memory.buffer, ptr, buf.length).set(buf);
    try { return f(ptr, buf.length); } finally { x.dealloc(ptr, buf.length); }
  };
  const err = () => text(x.err_ptr(), x.err_len());
  return {
    hash: text(x.source_hash_ptr(), x.source_hash_len()),
    /* files: [{name, bytes}] → {code: 0 통과 · 1 거의 같다, out: 찍을 글}. 실패면 던진다 */
    check(indexText, card, files, asJson) {
      for (const f of files) {
        const r = withBytes(Buffer.from(f.name, 'utf8'), (np, nl) => withBytes(f.bytes, (bp, bl) => x.add(np, nl, bp, bl)));
        if (r < 0) { const e = err(); x.clear(); throw new Error(e); }
      }
      const r = withBytes(Buffer.from(indexText, 'utf8'), (ip, il) => withBytes(Buffer.from(card, 'utf8'), (cp, cl) => x.check(ip, il, cp, cl, asJson ? 1 : 0)));
      if (r < 0) throw new Error(err());
      return { code: r === 1 ? 0 : 1, out: text(x.out_ptr(), x.out_len()) };
    },
  };
}

/* 명령줄 — rust/casual-look/src/main.rs 의 check 와 같은 인자 읽기 */
function run(a, io = { out: s => process.stdout.write(s), err: s => process.stderr.write(s) }) {
  const get = k => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length ? a[i + 1] : undefined; };
  const indexPath = get('--index') || path.join(ROOT, 'data', 'casual-look.json');
  try {
    if (a[0] !== 'check') throw new Error(a[0] === 'index' || a[0] === 'pairs'
      ? `${a[0]} 은 cargo 로 — cd rust && cargo run --release -p casual-look -- ${a[0]}`
      : 'node tools/casual-look.cjs check --card <카드> <그림>… [--json] [--index <색인>]');
    const card = get('--card') || '';
    const skip = a.map((x, i) => (x === '--card' || x === '--index') ? i + 1 : -1).filter(i => i >= 0);
    const files = a.map((x, i) => [x, i]).filter(([x, i]) => i >= 1 && !x.startsWith('--') && !skip.includes(i)).map(([x]) => x);
    if (!card || !files.length) throw new Error('casual-look check --card <카드> <그림>…');
    let indexText;
    try { indexText = fs.readFileSync(indexPath, 'utf8'); }
    catch (e) { throw new Error(`${indexPath}: ${e.message} — 먼저 casual-look index`); }
    const imgs = files.map(f => {
      try { return { name: f, bytes: fs.readFileSync(f) }; }
      catch (e) { throw new Error(`${f}: ${e.message}`); }
    });
    const r = load().check(indexText, card, imgs, a.includes('--json'));
    io.out(r.out);
    return r.code;
  } catch (e) {
    io.err(`✗ ${e.message}\n`);
    return 2;
  }
}

module.exports = { load, run, WASM, API_VERSION };
if (require.main === module) process.exitCode = run(process.argv.slice(2));
