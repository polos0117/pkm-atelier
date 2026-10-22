"""One hash-bound correction preserves original artifacts and rejects duplicate calls."""
import importlib.util, tempfile, json, copy
from pathlib import Path
from PIL import Image
s=importlib.util.spec_from_file_location('r',Path(__file__).resolve().parents[1]/'tools/image-runner.py');r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
def rejects(fn):
    try: fn()
    except ValueError: return
    raise AssertionError('unsafe retry accepted')
with tempfile.TemporaryDirectory() as tmp:
    t=Path(tmp); files={}
    for name, data in [('prompt.txt','actual UI'),('ui.json','{}')]: (t/name).write_text(data)
    Image.new('RGB',(1024,1536)).save(t/'image.png')
    run={'id':'test','status':'active','queue':[{'no':345,'name':'릴링','status':'working','slots':{}}]}
    r.intent(run,'light',t/'prompt.txt',t/'ui.json',files);r.record(run,'light',t/'image.png',files)
    c=r.current(run); old=copy.deepcopy(c['slots']['light']); oldfiles=dict(files)
    run['status']='blocked';c.update(status='blocked',reason='QA mismatch')
    auth={'card':345,'slot':'light','max_corrections':1,'rejected_sha256':old['image']['sha256'],'user_approval':'Explicit one correction approved'}
    qa={'accepted':False,'image_sha256':old['image']['sha256'],'reviewer':'test','observations':['mismatch']}
    (t/'a.json').write_text(json.dumps(auth));(t/'q.json').write_text(json.dumps(qa))
    def retry(): r.retry_intent(run,'light',t/'prompt.txt',t/'ui.json',t/'q.json',t/'a.json',files)
    auth['card']=346;(t/'a.json').write_text(json.dumps(auth));rejects(retry)
    auth['card']=345;(t/'a.json').write_text(json.dumps(auth));retry()
    assert c['attempt_history'][0]['image']==old['image']
    assert all(files[k]==v for k,v in oldfiles.items())
    assert c['slots']['light']['attempt']==2
    rejects(retry);rejects(lambda:r.intent(run,'light',t/'prompt.txt',t/'ui.json',files))
    r.record(run,'light',t/'image.png',files)
    assert '/attempts/2/' in c['slots']['light']['image']['path']
    run['status']='blocked';c.update(status='blocked',reason='second QA failure');rejects(retry)
    state={'runs':[run]};r.check_assets(state,files.__getitem__);r.restore(state,files.__getitem__,t/'restore')
    assert (t/'restore'/old['image']['path']).exists()
    broken=dict(files);broken[old['image']['path']]=b'bad';rejects(lambda:r.check_assets(state,broken.__getitem__))
print('PASS one correction, immutable history, duplicate guard, hash-bound approval, restore all attempts')
