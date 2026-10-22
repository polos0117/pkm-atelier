import importlib.util,json,copy,io
from pathlib import Path
from PIL import Image
s=importlib.util.spec_from_file_location('r',Path(__file__).resolve().parents[1]/'tools/image-runner.py');r=importlib.util.module_from_spec(s);s.loader.exec_module(r)
def png(color):
 b=io.BytesIO();Image.new('RGB',(1024,1536),color).save(b,format='PNG');return b.getvalue()
def rejects(f):
 try:f()
 except ValueError:return
 raise AssertionError('unsafe replacement accepted')
files={};old=png('red');new=png('blue');prefix='records/automation/replacements/test'
def art(n,b):
 p=prefix+'/'+n;files[p]=b;return {'path':p,'sha256':r.digest(b)}
olditem={'status':'accepted','image':art('old.png',old)}
c={'no':346,'name':'릴리요','style':'glossy_promo','status':'complete','completed_at':'old-time','outputs':{'historical':'unchanged'},'slots':{s:copy.deepcopy(olditem) for s in r.SLOTS}}
run={'id':'r','status':'complete','queue':[c]};state={'runs':[run],'claims':{'346':{'status':'complete'}}}
entry={'casual':{'f':[]},'byForm':{}};reg={'img':{'릴리요':{'byStyle':{'glossy_promo':entry}}},'where':{}}
for slot in r.SLOTS:
 n=r.filename(c,slot);files['img/'+n]=r.webp(old);reg['where'][n]=1
 if slot.startswith('casual'):entry['casual']['f'].append(n)
 else:entry['byForm'][slot]={'f':n}
 b=io.BytesIO();Image.new('RGB',(341,512)).save(b,format='WEBP');files['img/thumb/'+n]=b.getvalue()
item={'image':art('new.png',new)};q={'accepted':True,'reviewer':'test','image_sha256':r.digest(new),'observations':['checked'],'diversity_comparison':'checked'};item['qa']=art('qa.json',r.encoded(q))
a={'card':346,'slot':'casual3','user_approval':'explicit replacement','old_public_sha256':r.digest(r.webp(old))};item['approval']=art('approval.json',r.encoded(a))
before=copy.deepcopy(c)
a['old_public_sha256']='bad';rejects(lambda:r.append_completed_replacement(state,'r',346,'casual3',item,a,files.__getitem__))
a['old_public_sha256']=r.digest(r.webp(old));path,data=r.append_completed_replacement(state,'r',346,'casual3',item,a,files.__getitem__);files[path]=data
assert {k:v for k,v in c.items() if k!='replacements'}==before
rejects(lambda:r.append_completed_replacement(state,'r',346,'casual3',item,a,files.__getitem__))
class Store:
 base='commit'
 def read(self,p):return files[p]
class Code:
 base='code'
 def read(self,p):return r.encoded(reg)
snapshot=copy.deepcopy(state);assert r.verify_completed(state,Store(),Code())==[346];assert state==snapshot
r.check_assets(state,files.__getitem__)
files[path]=r.webp(old);rejects(lambda:r.verify_completed(state,Store(),Code()))
print('PASS replacement: old completion immutable, approval/current-byte guard, duplicate rejection, effective recovery/hash verification')
