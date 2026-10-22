"""Terminal rejection can be archived once; uncertain/in-flight calls cannot retry."""
import importlib.util,tempfile,json,copy
from pathlib import Path
s=importlib.util.spec_from_file_location('r',Path(__file__).resolve().parents[1]/'tools/image-runner.py');r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
def rejects(fn):
    try: fn()
    except ValueError: return
    raise AssertionError('unsafe replan accepted')
with tempfile.TemporaryDirectory() as tmp:
    t=Path(tmp);files={}
    for name,data in [('old.txt','old UI prompt'),('new.txt','substantively nonsexual stage scene'),('ui.json','{}')]: (t/name).write_text(data)
    run={'id':'test','status':'active','queue':[{'no':346,'name':'릴리요','status':'working','slots':{}}]}
    r.intent(run,'light',t/'old.txt',t/'ui.json',files);c=r.current(run);old=copy.deepcopy(c['slots']['light']);before=dict(files)
    a={'card':346,'slot':'light','max_new_attempts':1,'rejected_prompt_sha256':old['prompt']['sha256'],'user_approval':'explicit new nonsexual concept','substantive_nonsexual_changes':['full coverage, neutral activity']}
    f={'terminal':True,'output_files':[],'code':'moderation_blocked','request_id':'request','prompt_sha256':old['prompt']['sha256']}
    def save():
        (t/'a.json').write_text(json.dumps(a));(t/'f.json').write_text(json.dumps(f))
    def retry():r.replan_rejected(run,'light',t/'new.txt',t/'ui.json',t/'f.json',t/'a.json',files)
    save();rejects(retry)
    run['status']='blocked';c.update(status='blocked',reason='terminal tool rejection')
    f['terminal']=False;save();rejects(retry)
    f['terminal']=True;f['output_files']=['unknown.png'];save();rejects(retry)
    f['output_files']=[];a['card']=345;save();rejects(retry)
    a['card']=346;save();c['external_pending']={'files':['external']};rejects(retry);c.pop('external_pending')
    retry();assert c['attempt_history'][0]['prompt']==old['prompt'];assert all(files[k]==v for k,v in before.items())
    assert c['slots']['light']['attempt']==2
    run['status']='blocked';c.update(status='blocked');rejects(retry)
    state={'runs':[run]};r.check_assets(state,files.__getitem__);r.restore(state,files.__getitem__,t/'restore')
    failure=c['attempt_history'][0]['tool_failure'];assert (t/'restore'/failure['path']).exists()
    broken=dict(files);broken[failure['path']]=b'corrupt';rejects(lambda:r.check_assets(state,broken.__getitem__))
print('PASS terminal-only replan, scoped approval, immutable history, one-shot guard, failure restore')
