"""Safety contracts: real bare Git CAS, immutable recovery, daily quota, serial gates."""
import copy, importlib.util, json, os, subprocess, tempfile
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
s = importlib.util.spec_from_file_location('runner', ROOT / 'tools/image-runner.py')
R = importlib.util.module_from_spec(s); s.loader.exec_module(R)


def rejects(fn, message):
    try: fn()
    except (ValueError, RuntimeError, subprocess.CalledProcessError): return
    raise AssertionError(message)


with tempfile.TemporaryDirectory() as td:
    t = Path(td); bare = t/'remote.git'; repo=t/'clone'
    def cmd(*args): return subprocess.check_output(args, stderr=subprocess.PIPE)
    cmd('git','init','--bare',str(bare)); cmd('git','clone',str(bare),str(repo))
    R.git(repo,'config','user.name','Test');R.git(repo,'config','user.email','test@example.invalid')
    R.git(repo,'checkout','-b','main');(repo/'preserve.txt').write_text('other worker')
    R.git(repo,'add','preserve.txt');R.git(repo,'commit','-m','initial');R.git(repo,'push','origin','main')
    store=R.Store(repo);state=store.state()
    cards=[{'no':345,'name':'릴링'},{'no':346,'name':'릴리요'},{'no':347,'name':'아노딥스'}]
    q=R.prepare(state,'worker',cards,{},'2026-10-22','test-execution')
    assert len(q['queue'])==1
    rejects(lambda:R.prepare(state,'other',cards,{},'2026-10-22','test-execution'),'owner takeover')
    rejects(lambda:R.charge(state,list(range(13)),'2026-10-22'),'third daily character')
    # Resume on another day charges the unfinished pair on that day too.
    R.prepare(state,'worker',cards,{},'2026-10-23','test-execution')
    assert state['daily']['2026-10-23']==[345]
    first=store.publish(state,{},'claims')
    assert R.git(repo,'show','origin/main:preserve.txt')==b'other worker'
    stale=R.Store(repo);fresh=R.Store(repo);latest=fresh.state();latest['marker']='new owner evidence'
    fresh.publish(latest,{},'concurrent writer')
    rejects(lambda:stale.publish(state,{},'stale claim'),'stale overwrite')
    assert R.Store(repo).state()['marker']=='new owner evidence'
    # An in-flight intent cannot be issued twice or skipped; another slot is gated.
    prompt=t/'prompt.txt';prompt.write_text('Actual UI prompt fixture')
    ui=t/'ui.json';ui.write_text('{}');files={}
    R.intent(q,'light',prompt,ui,files)
    rejects(lambda:R.intent(q,'light',prompt,ui,files),'duplicate generation')
    rejects(lambda:R.intent(q,'heavy',prompt,ui,files),'skip light result')
    image=t/'out.png';Image.new('RGB',(1024,1536)).save(image)
    R.record(q,'light',image,files)
    rejects(lambda:R.record(q,'light',image,files),'replace existing result')
    rejects(lambda:R.intent(q,'heavy',prompt,ui,files),'skip light QA')
    qa=t/'qa.json';qa.write_text(json.dumps({'accepted':True,'image_sha256':'wrong','reviewer':'agent','observations':'visible'}))
    rejects(lambda:R.review(q,'light',qa,files),'wrong QA hash')
    sha=q['queue'][0]['slots']['light']['image']['sha256']
    qa.write_text(json.dumps({'accepted':True,'image_sha256':sha,'reviewer':'agent','observations':'visible','face_reason':'source based','compared_characters':['a','b','c']}))
    R.review(q,'light',qa,files);R.intent(q,'heavy',prompt,ui,files)
    assert q['queue'][0]['slots']['heavy']['references']=={'light':sha}
    # Preservation: immutable text artifacts are committed and restorable; originals are session-only —
    # never committed (Pages size), only their sha256 and WebP sha256 are recorded.
    store=R.Store(repo);store.publish(state,files,'checkpoint')
    store=R.Store(repo);remote=store.state();R.check_assets(remote,store.read)
    light=remote['runs'][0]['queue'][0]['slots']['light']
    assert light['image']['session_only'] and light['image']['path'] not in store.paths
    assert light['image']['webp_sha256']==R.digest(R.webp(image.read_bytes()))
    assert R.digest(R.image_bytes(light['image'],store.read))==sha, 'original from this session cache'
    R.restore(remote,store.read,t/'restored')
    assert not (t/'restored'/light['image']['path']).exists()
    prompt_path=light['prompt']['path']
    assert (t/'restored'/prompt_path).read_bytes()==prompt.read_bytes()
    (t/'restored'/prompt_path).write_bytes(b'foreign work')
    rejects(lambda:R.restore(remote,store.read,t/'restored'),'restore overwrite')
    rejects(lambda:store.publish(remote,{prompt_path:b'changed'},'replace'),'remote artifact replacement')
    rejects(lambda:store.publish(remote,{'records/automation/new.png':image.read_bytes()},'raw'),'raw upload forbidden')
    rejects(lambda:R.check_assets(remote,lambda p:b'lost'),'missing artifacts')
    # Another session (empty cache) cannot conjure the original; it must stop, not regenerate silently.
    keep=R.CACHE;R.CACHE=t/'other-session-cache'
    rejects(lambda:R.image_bytes(light['image'],store.read),'original outside its session')
    R.CACHE=keep
    rejects(lambda:R.complete(q,state,store,store),'early complete')
    # Legacy, existing unregistered images, external reservations and claims are excluded.
    reg={'img':{'릴링':{'byStyle':{'glossy_promo':{'casual':{'f':['old.webp']}}}}}}
    out,blocked=R.candidates(cards,reg,{'릴리요_light_glossy_promo_f.webp'},set(),{'아노딥스':'interrupted'},R.Store(repo).state() | {'claims':{}})
    assert out==[] and blocked['345']['status']=='blocked_legacy_metadata'
    assert blocked['346']['status']=='external_work'
    # Complete only after exact source conversion, thumbnails and dex registration.
    import io
    completed = copy.deepcopy(q)
    c = completed['queue'][0]
    c['slots'] = {slot: copy.deepcopy(c['slots']['light']) for slot in R.SLOTS}
    for x in c['slots'].values(): x['status'] = 'accepted'
    raw = image.read_bytes(); buf = io.BytesIO()
    Image.open(io.BytesIO(raw)).save(buf, format='WEBP', quality=85, method=6)
    thumb = io.BytesIO(); Image.new('RGB', (341, 512)).save(thumb, format='WEBP')
    blobs = {c['slots']['light']['image']['path']: raw}
    entry = {'byForm': {}, 'casual': {'f': []}}; where = {}
    for slot in R.SLOTS:
        f = c['name'] + ('_' + slot if not slot.startswith('casual') else '') + '_glossy_promo_f' + ('_' + slot if slot.startswith('casual') else '') + '.webp'
        if slot.startswith('casual'): entry['casual']['f'].append(f)
        else: entry['byForm'][slot] = {'f': f}
        blobs['img/' + f] = buf.getvalue(); blobs['img/thumb/' + f] = thumb.getvalue(); where[f] = 1
    registry = {'img': {c['name']: {'byStyle': {'glossy_promo': entry}}}, 'where': where}
    image_store = type('Images', (), {'base':'image-commit','read':lambda self,p:blobs[p]})()
    code_store = type('Code', (), {'base':'code-commit','read':lambda self,p:R.encoded(registry)})()
    broken = next(p for p in blobs if p.startswith('img/') and not p.startswith('img/thumb/'))
    original = blobs[broken]; blobs[broken] = b'wrong bytes'
    rejects(lambda:R.complete(completed,state,image_store,code_store),'wrong published bytes')
    blobs[broken] = original
    R.complete(completed,state,image_store,code_store)
    assert completed['queue'][0]['status']=='complete'
    assert R.next_step(completed)['action']=='complete'
print('PASS image runner: Git contention, immutable outputs, serial intent/QA, daily/resume quota, external holds, recovery hashes')
