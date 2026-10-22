import importlib.util,tempfile,json
from pathlib import Path
s=importlib.util.spec_from_file_location('l',Path(__file__).resolve().parents[1]/'tools/casual-ledger.py');l=importlib.util.module_from_spec(s);s.loader.exec_module(l)
with tempfile.TemporaryDirectory() as tmp:
 p=Path(tmp);(p/'img').mkdir();(p/'img/릴리요_glossy_promo_f_casual3.webp').write_bytes(b'fixture')
 old=p/'records/original/casual3-ui.json';old.parent.mkdir(parents=True)
 def ui(cat):return {'card':'릴리요','storage':{'last':'릴리요','cards':{'릴리요':{'scenes':{'casual':{'cat':cat,'ex':'__custom__','outfit':'shirt and trousers'}}}}}}
 old.write_text(json.dumps(ui('adult_roleplay')));saved=old.read_bytes();new=p/'records/automation/replacements/new/ui.json';new.parent.mkdir(parents=True);new.write_text(json.dumps(ui('hobbies_leisure')))
 state={'runs':[{'queue':[{'name':'릴리요','replacements':[{'status':'accepted','slot':'casual3','ui':{'path':str(new.relative_to(p))}}]}]}]}
 (p/'records/automation/state.json').write_text(json.dumps(state));rows=l.read_records([str(p)]);assert len(rows)==1 and rows[0]['cuts'][0]['cat']=='hobbies_leisure';assert old.read_bytes()==saved
print('PASS ledger reads current replacement UI without rewriting historical UI')
