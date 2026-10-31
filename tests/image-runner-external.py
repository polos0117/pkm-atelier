"""External publication races: do not overwrite, misattribute, or evade daily quota."""
import copy, importlib.util, io, json, tempfile
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
s = importlib.util.spec_from_file_location('runner', ROOT/'tools/image-runner.py')
R = importlib.util.module_from_spec(s);s.loader.exec_module(R)

class Remote:
    def __init__(self, base, files=None): self.base=base;self.files=files or {};self.paths=set(self.files)
    def read(self, path): return self.files[path]


def setup():
    state={'version':1,'policy':{'daily_max':2,'timezone':'UTC'},'daily':{},'runs':[],'claims':{},'blocked_candidates':{},'external_holds':{'428':{'session':'interrupted-other'}}}
    cards=[{'no':n,'name':name} for n,name in [(345,'릴링'),(346,'릴리요'),(347,'아노딥스'),(348,'아말도')]]
    run=R.prepare(state,'worker',cards,{},'2026-10-22','test-execution')
    return state,run,cards


def registry_for(card, shard=1):
    v={'byForm':{},'casual':{'f':[]}};files={};where={}
    for slot in R.SLOTS:
        f=R.filename(card,slot)
        if slot.startswith('casual'):v['casual']['f'].append(f)
        else:v['byForm'][slot]={'f':f}
        files['img/'+f]=b'external '+slot.encode();files['img/thumb/'+f]=b'thumb'
        if shard:where[f]=shard
    return {'img':{card['name']:{'byStyle':{card['style']:v}}},'where':where},files

# A complete publication in the OLD shard is detected too; untouched allocation refunded.
state,run,cards=setup();c=run['queue'][0];reg,files=registry_for(c,0)
a,b=Remote('old-head',files),Remote('new-head')
assert R.reconcile_external(state,run,reg,[a,b],'code-head',b.read)
assert c['status']=='completed_externally'
assert state['daily']['2026-10-22']==[]
assert state['claims']['345']['status']=='completed_externally'
assert c['external_evidence']['commits']['code']=='code-head'
assert state['external_holds']['428']['session']=='interrupted-other'
run=R.prepare(state,'worker',cards[1:],{},'2026-10-22','test-execution')
assert R.current(run)['no']==346
R.prepare(state,'worker',cards[1:],{},'2026-10-22','test-execution')
assert len(run['queue'])==1

# Partial/root-only and registry-only evidence are both explicit skips, never deletion.
for mode in ('root','registry'):
    state,run,_=setup();c=run['queue'][0];reg,files=registry_for(c)
    if mode=='root':reg={};files={next(p for p in files if p.startswith('img/')):b'partial'}
    else:files={}
    a,b=Remote('a'),Remote('b',files)
    before=copy.deepcopy(files)
    R.reconcile_external(state,run,reg,[a,b],'code',b.read)
    assert c['status']=='skipped_external_partial' and files==before

# An unresolved generation stays in flight until its actual output is preserved.
state,run,_=setup();c=run['queue'][0]
c['slots']['light']={'status':'in_flight','at':'2026-10-22T01:00:00+00:00'}
f=R.filename(c,'heavy');a,b=Remote('a'),Remote('b',{'img/'+f:b'other'})
R.reconcile_external(state,run,{},[a,b],'code',b.read)
assert c['status']!='skipped_external_partial' and c.get('external_pending')
assert R.next_step(run)['action']=='in_flight'
with tempfile.TemporaryDirectory() as tmp:
    p=Path(tmp)/'result.png';Image.new('RGB',(1024,1536)).save(p);artifacts={}
    R.record(run,'light',p,artifacts)
    source=lambda path: artifacts[path] if path in artifacts else b.read(path)
    R.reconcile_external(state,run,{},[a,b],'code',source)
    assert c['status']=='skipped_external_partial'
    # The original stays in the session cache; only its hashes are recorded (no PNG committed).
    assert c['slots']['light']['image']['path'] not in artifacts and c['slots']['light']['image']['session_only']
    assert R.webp(R.image_bytes(c['slots']['light']['image'],source))
    assert 345 in state['daily']['2026-10-22']  # Generation cannot be refunded.
    R.prepare(state,'worker',[{'no':347,'name':'아노딥스'}],{},'2026-10-22','test-execution')
    assert len(run['queue'])==1  # No third generating character.

# Preserved originals are not publications. Own WebP bytes, including pending registration,
# are recognized by the source hash; another slot's foreign bytes still trigger a skip.
state,run,_=setup();c=run['queue'][0];buf=io.BytesIO();Image.new('RGB',(1024,1536)).save(buf,format='PNG');raw=buf.getvalue()
path='records/automation/preserved.png';c['slots']['light']={'status':'accepted','image':{'path':path,'sha256':R.digest(raw)}}
a,b=Remote('a'),Remote('b',{path:raw});R.reconcile_external(state,run,{},[a,b],'code',b.read)
assert not c.get('external_evidence')
f=R.filename(c,'light');b.files['img/'+f]=R.webp(raw);b.paths=set(b.files)
R.reconcile_external(state,run,{},[a,b],'code',b.read)
assert c['status'] not in R.TERMINAL and c['own_publication']['files']==[f]
b.files['img/'+R.filename(c,'heavy')]=b'foreign';b.paths=set(b.files)
R.reconcile_external(state,run,{},[a,b],'code',b.read)
assert c['status']=='skipped_external_partial'

# All nine own outputs with registration still absent must wait, not skip.
state,run,_=setup();c=run['queue'][0]
c['slots']={slot:{'status':'accepted','image':{'path':path,'sha256':R.digest(raw)}} for slot in R.SLOTS}
files={path:raw, **{'img/'+R.filename(c,slot):R.webp(raw) for slot in R.SLOTS}}
a,b=Remote('a'),Remote('b',files)
R.reconcile_external(state,run,{},[a,b],'code-before-registration',b.read)
assert c['status'] not in R.TERMINAL and R.next_step(run)['action']=='verify_registration'
assert not c.get('external_evidence')

# Exhausted candidates terminate; never clear another owner's claim.
state,run,_=setup();a=Remote('a');reg={'img':{}};files={}
for c in run['queue']:
    r,fs=registry_for(c);reg['img'].update(r['img']);reg.setdefault('where',{}).update(r['where']);files.update(fs)
b=Remote('b',files);R.reconcile_external(state,run,reg,[a,b],'code',b.read)
assert R.prepare(state,'worker',[],{},'2026-10-22','test-execution') is None
assert R.active(state) is None
state,run,_=setup();c=run['queue'][0];reg,files=registry_for(c)
state['claims']['345']={'owner':'someone-else','run':'other','status':'held'}
R.reconcile_external(state,run,reg,[Remote('a'),Remote('b',files)],'code',lambda p:files[p])
assert state['claims']['345']['owner']=='someone-else' and state['claims']['345']['status']=='held'
print('PASS external skip: both shards/dex, complete vs partial, in-flight preservation, own-byte attribution, quota refunds, bounded refill')

# Command-level race: an old character's intent must not be attached to its replacement.
import contextlib, sys, subprocess
with tempfile.TemporaryDirectory() as tmp:
    root=Path(tmp)
    def repo(name, files):
        bare=root/(name+'.git');local=root/name
        subprocess.run(['git','init','--bare',str(bare)],check=True,capture_output=True)
        subprocess.run(['git','clone',str(bare),str(local)],check=True,capture_output=True)
        R.git(local,'config','user.name','Test');R.git(local,'config','user.email','test@example.invalid')
        R.git(local,'checkout','-b','main')
        for p,b in files.items():
            f=local/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_bytes(b)
        R.git(local,'add','.');R.git(local,'commit','-m','fixture');R.git(local,'push','origin','main')
        return local
    code=repo('code',{'data/card.json':R.encoded({'cards':{'character':[{'no':n,'name':name} for n,name in [(345,'릴링'),(346,'릴리요'),(347,'아노딥스')]]}}),'data/img.json':R.encoded({'img':{}})})
    first=repo('pkm-atelier-img',{'README.md':b'preserve'})
    second=repo('pkm-atelier-img-2',{'README.md':b'preserve'})
    third=repo('pkm-atelier-img-3',{'README.md':b'preserve'})   # closed since 2026-10-31
    fourth=repo('pkm-atelier-img-4',{'README.md':b'preserve'})   # open image repository (2026-10-31)
    oldroot,oldargv=R.ROOT,sys.argv
    def cli(*args):
        sys.argv=['image-runner.py',*args,'--repo',str(second),'--owner','worker','--execution-id','cli-test']
        out=io.StringIO()
        with contextlib.redirect_stdout(out):R.main()
        return json.loads(out.getvalue())
    try:
        R.ROOT=code
        cli('prepare')
        external=R.Store(second);st=external.state()
        R.git(second,'merge','--ff-only','origin/main')
        external_path=second/'img/릴링_light_glossy_promo_f.webp';external_path.parent.mkdir();external_path.write_bytes(b'external preserved')
        R.git(second,'add','img');R.git(second,'commit','-m','other worker publishes');R.git(second,'push','origin','main')
        # Deliberately nonexistent old UI paths: skip must happen before reading them.
        response=cli('intent','--card','345','--slot','light','--prompt','missing-old-prompt','--ui','missing-old-ui')
        assert response['intent_recorded'] is False and response['operation']=='reconciled_external_skip'
        assert response['next']['no']==346
        live=R.Store(second);st=live.state();run=R.active(st)
        assert st['runs'][0]['queue'][0]['status']=='skipped_external_partial'
        assert run['queue'][0]['slots']=={} and R.current(run)['no']==346
        assert st['daily'][R.now()[:10]]==[346]
        for _ in range(3):
            assert cli('next')['next']['no']==346
        assert len(R.active(R.Store(second).state())['queue'])==1
        assert live.read('img/릴링_light_glossy_promo_f.webp')==b'external preserved'
        latest=R.Store(second);R.assert_heads([latest])
        latest.publish(latest.state(),{},'concurrent heartbeat')
        try:R.assert_heads([live]);raise AssertionError('stale snapshot accepted')
        except RuntimeError:pass
        try:cli('intent','--card','345','--slot','light');raise AssertionError('stale character accepted')
        except ValueError:pass
        # Originals/accepted bytes are publishable once; the normal push is the race guard.
        state,run,_=setup();c=run['queue'][0]
        buf=io.BytesIO();Image.new('RGB',(1024,1536)).save(buf,format='PNG');raw=buf.getvalue()
        source='records/automation/fixture.png';c['slots']={slot:{'status':'accepted','image':{'path':source,'sha256':R.digest(raw)}} for slot in R.SLOTS}
        R.prepare_publication(run,lambda p:raw)
        assert len(c['publication']['files'])==9 and R.next_step(run)['action']=='publish_images_then_verify_registration'
        c['own_publication']={'files':[R.filename(c,slot) for slot in R.SLOTS]}
        assert R.next_step(run)['action']=='verify_registration'
    finally:R.ROOT=oldroot;sys.argv=oldargv
# 일상컷 intent 앞 — 자기 예약이라도 계획기(reserve)가 적은 그대로가 아니면 멈춘다(2026-10-25 히포포타스)
L = R.ledger_tool(); L.STAMP_SINCE = '2026-01-01T00:00:00+00:00'   # 도입 전 예약 봐주기는 따로 본다(시계에 매이지 않게)
state,run,_=setup();c=R.current(run);session='image-runner-'+run['id']+'-'+str(c['no'])
at=dt_now=__import__('datetime').datetime.now(__import__('datetime').timezone.utc).replace(microsecond=0).isoformat()
entry={'species':'x-1','card':c['name'],'at':at,'cuts':[{'cut':1,'cat':'swimwear','ex':'pool_float'}]}
entry['stamp']=L.stamp_of(session,entry)
good={'session':session,'at':at,'characters':[entry]}
R.guard_external(Remote('r',{'records/casual-reservations/'+session+'.json':json.dumps(good)}),run,'casual1')
bad=copy.deepcopy(good);bad['characters'][0]['cuts'][0]['ex']='rooftop_infinity_pool'
try:
    R.guard_external(Remote('r',{'records/casual-reservations/'+session+'.json':json.dumps(bad)}),run,'casual1');raise AssertionError('hand-edited reservation accepted')
except ValueError as e: assert 'not written by the planner' in str(e)
bad['characters'][0].pop('stamp')
try:
    R.guard_external(Remote('r',{'records/casual-reservations/'+session+'.json':json.dumps(bad)}),run,'casual1');raise AssertionError('unstamped reservation accepted')
except ValueError as e: assert 'not written by the planner' in str(e)
R.guard_external(Remote('r',{'records/casual-reservations/'+session+'.json':json.dumps(bad)}),run,'light')   # 폼 컷은 일상 예약을 안 본다
print('PASS command race: stale intent skips without reading old UI; replacement quota; snapshot change; prepublication manifest; casual reservation stamp')
