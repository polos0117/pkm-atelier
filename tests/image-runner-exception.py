import importlib.util, tempfile, json, copy
from pathlib import Path
s=importlib.util.spec_from_file_location('r',Path(__file__).resolve().parents[1]/'tools/image-runner.py');r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
def rejects(fn):
    try: fn()
    except ValueError: return
    raise AssertionError('invalid exception accepted')
with tempfile.TemporaryDirectory() as d:
    p=Path(d)/'approval.json';files={};item={'status':'review','image':{'path':'original.png','sha256':'abc'},'prompt':{'path':'prompt.txt','sha256':'def'}}
    run={'id':'test','status':'blocked','queue':[{'no':345,'name':'릴링','status':'blocked','reason':'QA failure preserved','slots':{'light_overdrive':item}}]}
    a={'card':345,'slot':'light_overdrive','image_sha256':'abc','message_id':'user-message','user_approval':'use this exact result'}
    def accept():r.accept_exception(run,'light_overdrive',p,files)
    p.write_text(json.dumps(dict(a,image_sha256='wrong')));rejects(accept)
    p.write_text(json.dumps(a));accept()
    assert item['status']=='accepted' and item['qa_passed'] is False and item['acceptance_basis']=='user_exception'
    audit=json.loads(files[item['exception']['path']]);assert audit['prior_block_reason']=='QA failure preserved'
    assert item['image']['sha256']=='abc' and item['prompt']['sha256']=='def'
    rejects(accept)
print('PASS exact-hash exception, immutable QA evidence, single acceptance; normal review unchanged')
