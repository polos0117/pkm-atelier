#!/usr/bin/env python3
"""A submitted HAIR line must survive the second canonical-hair build."""
import importlib.util
import json
import pathlib
import sys
import tempfile
from unittest.mock import patch

root = pathlib.Path(__file__).resolve().parents[1]
source = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'tools/face-design.py'
spec = importlib.util.spec_from_file_location('face_design', source)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)
m.ROOT = str(root)
hair = {'hairstyle': 'crown braid', 'hair length': 'long', 'bangs': 'choppy bangs'}
card = {'no': 405, 'name': '렌트라'}
img = {'렌트라': {'byStyle': {'glossy_promo': {'byForm': {'light': {}}}}}}
prompt = ('INPUT: text only\n\nSOURCE: Luxray (렌트라), electric type.\n\n'
          'HAIR: long crown braid, choppy bangs.\n\nFORM — LIGHT: slim plates.')
with tempfile.TemporaryDirectory() as td:
    p = pathlib.Path(td) / 'light-ui.json'
    ui = {'storage': {'last': '렌트라', 'cards': {'렌트라': {
        'form': 'light', 'identityMode': 'create', 'mode': 'action', 'params': {}}}},
        'prompt': prompt}
    p.write_text(json.dumps(ui, ensure_ascii=False), encoding='utf-8')
    with patch.object(m, 'record_dirs', return_value=[td]):
        old = {'405': {'hair': hair, 'hair_locked': False}}
        first, _, _ = m.design_hair([card], {}, img, old, {'렌트라': '렌트라'}, m.hair_spec())
        assert first['렌트라'] == hair
        old = {'405': {'hair': first['렌트라'], 'hair_locked': True}}
        second, _, _ = m.design_hair([card], {}, img, old, {'렌트라': '렌트라'}, m.hair_spec())
        assert second['렌트라'] == hair, 'rebuilding an already locked HAIR line discarded it'
        ui['prompt'] = prompt.replace('\n\nHAIR: long crown braid, choppy bangs.', '')
        p.write_text(json.dumps(ui, ensure_ascii=False), encoding='utf-8')
        plain, _, _ = m.design_hair([card], {}, img, old, {'렌트라': '렌트라'}, m.hair_spec())
        assert plain['렌트라'] == {}, 'an older image without HAIR must remain unspecified'
print('PASS canonical HAIR: first lock, repeated build, legacy unspecified hair')
