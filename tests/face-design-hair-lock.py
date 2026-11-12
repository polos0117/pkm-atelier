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
img = {'렌트라': {'byStyle': {'anime_25d_gloss': {'byForm': {'light': {}}}}}}   # 잠금은 기본 화풍 그림만(2026-11-12)
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
        # 칸 꼴(2026-11-11) — 같은 지시문이 머리말 + 다섯 칸으로 나온다: Input · Source · 2칸 Hair 줄 · 3칸 「3. ARMOR — LIGHT」
        sec = ('Input: text only\nSource: Luxray (렌트라), electric type.\n\n1. STYLE\nslim.\n\n2. CHARACTER\n'
               'Hair: long crown braid, choppy bangs.\nhairstyle: crown braid\n\n3. ARMOR — LIGHT\nCostume: slim plates.')
        ui['prompt'] = sec
        p.write_text(json.dumps(ui, ensure_ascii=False), encoding='utf-8')
        ev = m.read_records([td]).get('렌트라', [])
        assert any(e[0] == 'prompt' and e[3] and e[2].get('hairstyle') == 'crown braid' for e in ev), ('칸 꼴 지시문을 기록으로 못 읽었다', ev)
        again, _, _ = m.design_hair([card], {}, img, old, {'렌트라': '렌트라'}, m.hair_spec())
        assert again['렌트라'] == hair, '칸 꼴 Hair 줄로 확정한 머리를 다시 build 하며 잃었다'
        ui['prompt'] = sec.replace('3. ARMOR — LIGHT', '3. ARMOR — HEAVY')
        p.write_text(json.dumps(ui, ensure_ascii=False), encoding='utf-8')
        assert not any(e[0] == 'prompt' for e in m.read_records([td]).get('렌트라', [])), '칸 꼴 중장 지시문은 경장 ① 기록이 아니다'
    # 다른 화풍 그림만 있는 종은 잠그지 않는다(2026-11-12 「그림있는건 지금 기본화풍 기준으로」)
    other = {'렌트라': {'byStyle': {'glossy_promo': {'byForm': {'light': {}}}}}}
    style = m.hair_spec()['style']
    assert '렌트라' in m.light_registered(img, style) and '렌트라' not in m.light_registered(other, style), '옛 화풍 그림만 있는 종을 잠근다'
print('PASS canonical HAIR: first lock, repeated build, legacy unspecified hair, sections-form prompt, default-style lock only')
