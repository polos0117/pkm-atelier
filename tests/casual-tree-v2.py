"""일상컷 트리 버전2 검사기(tools/casual-tree-v2.py — game-atelier 원본) × pkm 표. python3 tests/casual-tree-v2.py
   - 실제 표(data/casual-tree-v2.json)가 통과한다
   - pkm 몫을 일부러 어겨 걸리는지 본다: 안 쓰는 값 · 동료 · 역할 · 동작의 장소 · 51곳 받침"""
import copy, importlib.util, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('ct2', ROOT / 'tools' / 'casual-tree-v2.py')
T = importlib.util.module_from_spec(spec); spec.loader.exec_module(T)
doc, v1 = T.load()
assert T.check(doc, v1) == [], T.check(doc, v1)


def fails(mutate, word):
    d = copy.deepcopy(doc); mutate(d)
    e = ' | '.join(T.check(d, v1))
    assert word in e, (word, e)


row = lambda d, table, k: next(r for r in d[table] if r['key'] == k)
pre = lambda d, k: row(d, 'presets', k)
# 안 쓰는 값 — 몸 뒤 · 디테일(버전1 banned)은 추천에 못 쓴다, 없는 값은 못 적는다
fails(lambda d: pre(d, 'walk_beside').update(body='back'), '이 공방이 안 쓰는 값')
fails(lambda d: pre(d, 'stand_inspect').update(frame='detail'), '이 공방이 안 쓰는 값')
fails(lambda d: d['banned']['body'].append('sideways'), '안 쓰는 몸 방향 의 몸 방향 sideways')
# 동료 — 동료 묶음에서만, 동료 묶음엔 가슴 위 · 클로즈업 없음
fails(lambda d: pre(d, 'kneel_pet').update(frame='chest_up', legs=''), '추천 kneel_pet — 자세 · 받침 · 손 · 다리 · 소품이 다 되는 장소가 없다')
fails(lambda d: d['companion']['not_frames'].append('wide'), '동료 묶음에서 안 쓰는 프레이밍 의 프레이밍 wide')
assert all(p in T.companion_places(v1) for p in T.preset_places(doc, v1, pre(doc, 'kneel_pet'))), '쓰다듬기는 동료 묶음에서만'
assert 'partner_yard' not in T.preset_places(doc, v1, dict(pre(doc, 'stand_inspect'), frame='chest_up')), '동료 묶음에 가슴 위 X'
# 역할 · 동작의 장소
fails(lambda d: row(d, 'prop_uses', 'job_lab_maps').pop('role_ko'), '역할에 한국어 이름(role_ko)')
fails(lambda d: row(d, 'prop_uses', 'job_lab_maps').update(role='포켓몬 연구원'), '영어 칸에 한글')
fails(lambda d: row(d, 'prop_uses', 'job_lab_maps').update(places=['work_moon']), '장소 work_moon')
fails(lambda d: row(d, 'prop_uses', 'job_photo_review').update(places=['home_living']), '의 장소에 소품 camera 이 안 나온다')
fails(lambda d: row(d, 'prop_uses', 'job_lab_maps').update(en='works as a coordinator and spreads {prop} out'), '동작 둘')
# pkm 장소 받침 — 51곳 다
fails(lambda d: d['places'].pop('work_lab'), '장소 work_lab 의 받침(has)이 없다')
fails(lambda d: d['places']['partner_yard'].append('trampoline'), '받침 trampoline')
assert set(T.companion_places(v1)) == {p['key'] for p in v1['places'] if p['group'] == 'partner'}
print('casual-tree-v2(pkm) ok — 추천', len(doc['presets']), '· 장소', len(doc['places']), '· 역할', sum(1 for u in doc['prop_uses'] if u.get('role')))
