import importlib.util,copy,json
from pathlib import Path
s=importlib.util.spec_from_file_location('R',Path(__file__).resolve().parents[1]/'tools/image-runner.py');R=importlib.util.module_from_spec(s);s.loader.exec_module(R)
a={'policy':{},'daily':{},'runs':[],'claims':{},'blocked_candidates':{},'external_holds':{}}
r=R.prepare(a,'worker',[{'no':355,'name':'해골몽'}],{},'2026-10-23T10:00:00Z','old');c=r['queue'][0];c['status']='blocked';r['status']='blocked';c['slots']['casual2']={'status':'in_flight'}
def rejects(f):
 try:f()
 except ValueError:return
 raise AssertionError('unsafe deferral')
rejects(lambda:R.defer_run(a,'worker','defer',lambda p:b''))
c['slots']['casual2']['tool_failure']={'path':'failure'}
rejects(lambda:R.defer_run(a,'worker','defer',lambda p:json.dumps({'terminal':False}).encode()))
old=copy.deepcopy(a);f=json.dumps({'terminal':True,'output_files':[],'code':'moderation_blocked'}).encode()
rejects(lambda:R.defer_run(a,'other','defer',lambda p:f))
R.defer_run(a,'worker','retain partial outputs and claim',lambda p:f)
assert a['claims']==old['claims'] and a['daily']==old['daily'] and r['queue']==old['runs'][0]['queue'] and R.active(a) is None
r2=R.prepare(a,'worker',[{'no':355,'name':'해골몽'},{'no':356,'name':'미라몽'}],{},'2026-10-23T12:00:00Z','new');assert R.current(r2)['no']==356
assert a['executions']['new']['characters']==[356] and a['daily']['2026-10-23']==[355,356]
print('PASS deferred run retains claims/history/quota; refuses unresolved intents and other owners; next eligible character only')
