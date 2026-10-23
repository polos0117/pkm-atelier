"""Separate invocation and two-calendar quotas; no image generation."""
import copy, importlib.util
from pathlib import Path
s=importlib.util.spec_from_file_location('runner',Path(__file__).resolve().parents[1]/'tools/image-runner.py')
R=importlib.util.module_from_spec(s);s.loader.exec_module(R)
def state():return dict(policy={},daily={},runs=[],claims={},blocked_candidates={},external_holds={})
def reject(f):
    try:f()
    except ValueError:return
    raise AssertionError('limit bypass')
cards=[dict(no=n,name=str(n)) for n in range(1,30)]
a=state();r=R.prepare(a,'owner',cards,{},'2026-10-23T14:59:00+00:00','one')
for _ in range(4):assert R.prepare(a,'owner',cards,{},'2026-10-23T15:01:00+00:00','one') is r
assert len(r['queue'])==1 and a['daily_kst']=={'2026-10-23':[1],'2026-10-24':[1]}
assert a['daily']=={'2026-10-23':[1]}
# Completing then repeating next/prepare must not replenish this invocation.
r['queue'][0]['status']='complete';r['status']='complete'
for _ in range(4):assert R.prepare(a,'owner',cards,{},'2026-10-24T00:01:00+00:00','one') is None
r2=R.prepare(a,'owner',cards,{},'2026-10-24T00:01:00+00:00','two')
assert R.current(r2)['no']==2 and a['daily_kst']['2026-10-24']==[1,2]
reject(lambda:R.bind_execution(a,'other','two',2))
reject(lambda:R.bind_execution(a,'owner','one',2))
# KST midnight doesn't reset UTC quota, and UTC midnight doesn't reset KST quota.
for initial,later,zone in [('2026-10-23T14:59:00+00:00','2026-10-23T15:01:00+00:00','UTC'),('2026-10-23T23:59:00+00:00','2026-10-24T00:01:00+00:00','KST')]:
    a=state();R.charge(a,range(1,13),initial);before=copy.deepcopy(a)
    reject(lambda:R.charge(a,[13],later));assert a==before
    assert R.prepare(a,'owner',[cards[12]],{},later,'full') is None
# One fresh invocation each, twelve accepted allocations, thirteenth idle.
a=state()
for i in range(12):
    r=R.prepare(a,'owner',cards,{},'2026-10-23T01:00:00+00:00',str(i))
    assert r and len(r['queue'])==1
    r['queue'][0]['slots']['light']={'status':'in_flight','at':'2026-10-23T01:00:00+00:00'}
    r['queue'][0]['status']='skipped_external_partial';r['status']='complete'
assert R.prepare(a,'owner',cards,{},'2026-10-23T02:00:00+00:00','13') is None
assert len(a['daily']['2026-10-23'])==len(a['daily_kst']['2026-10-23'])==12
# Migration retains old histories/claims and derives KST from actual intent timestamps.
a=state();a['runs']=[dict(queue=[dict(no=5,slots={'light':{'at':'2026-10-22T16:00:00+00:00'}})])]
b=copy.deepcopy(a);R.migrate_policy(a);assert a['runs']==b['runs'] and a['claims']==b['claims']
assert a['daily_kst']=={'2026-10-23':[5]}
print('PASS execution reentry/completion, 12 daily, KST/UTC midnight, atomic charge, migration preservation')
