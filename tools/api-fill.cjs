#!/usr/bin/env node
/* 빈 일상컷을 그림 API 로 채운다(2026-11-18 사용자 「실제로 생성안된 이미지 있는 케릭터들 API 호출로 이미지 만들어서 업로드해줘」).
   지시문은 묶음의 <자리>-prompt.txt 글 그대로(IMAGE_RULES 1절 — 고쳐 쓰지 않는다), 첨부는 그 캐릭터의 ① 경장 그림.
   막히면 한 번만 부르고 1 이 아닌 3 으로 끝난다 — 다음 단계(같은 지시문 한 번 더 → 노출 낮추기 → 다시 계획)는 IMAGE_RULES 3절 7 순서대로 부르는 쪽이 정한다.
   키는 환경 변수 OPENAI_API_KEY 로만(값을 찍거나 적지 않는다). 손 하나 — 삼국지 공방 tools/api-draw.cjs 의 부르는 길과 같다.

   node tools/api-fill.cjs draw  --prompt <자리>-prompt.txt --ref <① webp> --out <폴더> --name <이름> [--model gpt-image-2.5-sunburst] [--quality medium] [--ref-size 768] [--step retry|moderate|low|replan|group]
        → <폴더>/<이름>.png · <이름>.gen.json(모델 · 엔드포인트 · 사용량 · png/지시문/첨부 sha256). 막히면 <이름>.blocked.json(request_id · 사유)
   node tools/api-fill.cjs webp  <png> <out.webp>                   WebP 품질 85 · method 6(IMAGE_RULES 4절), 1024×1536 확인
   node tools/api-fill.cjs sheet <out.jpg> <그림>… [--labels a,b,…]  붙여 보기(사용자에게 보여 줄 때) */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');

const BASE = process.env.API_DRAW_BASE || 'https://api.openai.com/v1';
const SIZE = '1024x1536', MODEL = 'gpt-image-2.5-sunburst';
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function py(code, args) { const r = cp.spawnSync('python3', ['-c', code, ...args], { encoding: 'utf8' }); if (r.status) throw new Error(r.stderr || 'python 실패'); return r.stdout; }

function args(argv) {
  const o = { _: [], model: MODEL, quality: 'medium', 'ref-size': '768' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) o[a.slice(2)] = argv[++i]; else o._.push(a);
  }
  return o;
}

async function call(url, body) {
  const key = process.env.OPENAI_API_KEY; if (!key) throw new Error('OPENAI_API_KEY 가 없다');
  const r = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + key }, body });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch (e) { /* 글 그대로 */ }
  if (!r.ok) {
    const m = (j && j.error && j.error.message) || t.slice(0, 300), e = new Error(m);
    e.status = r.status; e.safety = /safety|rejected|moderation/i.test(m);
    e.request_id = r.headers.get('x-request-id') || ((/request ID ([0-9a-f-]{8,})/i.exec(m) || [])[1]) || null;
    e.code = (j && j.error && j.error.code) || null;
    throw e;
  }
  return { j, request_id: r.headers.get('x-request-id') || null };
}

function shrinkRef(ref, out, w) {
  if (!w) return ref;
  const h = Math.round(w * 1.5), dst = path.join(out, '.ref-' + w + '-' + sha(ref).slice(0, 10) + '.png');
  if (!fs.existsSync(dst)) py(`import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert('RGB').resize((int(sys.argv[3]),int(sys.argv[4])),Image.LANCZOS).save(sys.argv[2])`, [ref, dst, String(w), String(h)]);
  return dst;
}

async function draw(o) {
  const prompt = fs.readFileSync(o.prompt, 'utf8'), out = o.out, name = o.name;
  if (!prompt.trim() || !o.ref || !out || !name) throw new Error('--prompt · --ref · --out · --name 이 필요하다');
  fs.mkdirSync(out, { recursive: true });
  const w = Number(o['ref-size']) || 0, sent = shrinkRef(o.ref, out, w), buf = fs.readFileSync(sent), t0 = Date.now();
  const fd = new FormData();
  fd.append('model', o.model); fd.append('prompt', prompt); fd.append('size', SIZE); fd.append('quality', o.quality); fd.append('n', '1');
  fd.append('image[]', new Blob([buf], { type: 'image/png' }), path.basename(sent));
  const base = { tool: 'tools/api-fill.cjs', model: o.model, endpoint: 'images/edits', size: [1024, 1536], quality: o.quality, step: o.step || 'first',
    prompt_file: path.basename(o.prompt), prompt_sha256: sha(Buffer.from(prompt)), ref: path.basename(o.ref), ref_sha256: sha(fs.readFileSync(o.ref)),
    ref_sent: w ? { size: [w, Math.round(w * 1.5)], sha256: sha(buf) } : null, at: new Date().toISOString() };
  try {
    const { j, request_id } = await call(BASE + '/images/edits', fd);
    const png = Buffer.from(j.data[0].b64_json, 'base64');
    fs.writeFileSync(path.join(out, name + '.png'), png);
    const gen = { ...base, request_id, usage: j.usage || null, seconds: (Date.now() - t0) / 1000, png_sha256: sha(png) };
    fs.writeFileSync(path.join(out, name + '.gen.json'), JSON.stringify(gen, null, 1));
    console.log(name + ' 받았다 ' + gen.seconds.toFixed(1) + '초 · 출력 ' + ((j.usage || {}).output_tokens || '?'));
    return 0;
  } catch (e) {
    const bl = { ...base, blocked: !!e.safety, status: e.status || null, code: e.code, request_id: e.request_id, reason: String(e.message).slice(0, 400), image_returned: false };
    fs.writeFileSync(path.join(out, name + '.blocked.json'), JSON.stringify(bl, null, 1));
    console.log(name + (e.safety ? ' 막힘 — ' : ' 실패 — ') + String(e.message).slice(0, 160));
    return e.safety ? 3 : 1;
  }
}

function webp(src, dst) {
  py(`import sys\nfrom PIL import Image\nim=Image.open(sys.argv[1])\nassert im.size==(1024,1536), im.size\nim.convert('RGB').save(sys.argv[2],'WEBP',quality=85,method=6)\nprint(Image.open(sys.argv[2]).format, Image.open(sys.argv[2]).size)`, [src, dst]);
  return 0;
}

function sheet(o) {
  const [dst, ...imgs] = o._, labels = (o.labels || '').split(',');
  py(`import sys,json\nfrom PIL import Image,ImageDraw,ImageFont\nfs=json.loads(sys.argv[2]);ls=json.loads(sys.argv[3])\nW,H=341,512;c=min(6,len(fs));r=(len(fs)+c-1)//c\nS=Image.new('RGB',(W*c,(H+34)*r),'white');d=ImageDraw.Draw(S)\ntry: f=ImageFont.truetype('/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',22)\nexcept Exception:\n  try: f=ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',22)\n  except Exception: f=ImageFont.load_default()\nfor i,p in enumerate(fs):\n  x,y=(i%c)*W,(i//c)*(H+34)\n  S.paste(Image.open(p).convert('RGB').resize((W,H)),(x,y+34))\n  d.text((x+6,y+4),ls[i] if i<len(ls) else str(i+1),fill='black',font=f)\nS.save(sys.argv[1],quality=88)`, [dst, JSON.stringify(imgs), JSON.stringify(labels)]);
  return 0;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2), o = args(rest);
  if (cmd === 'draw') return draw(o);
  if (cmd === 'webp') return webp(o._[0], o._[1]);
  if (cmd === 'sheet') return sheet(o);
  console.error('draw · webp · sheet'); return 2;
}
if (require.main === module) main().then(c => process.exit(c), e => { console.error(e.message); process.exit(1); });
