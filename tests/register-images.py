"""Register distinct armor/overdrive portraits and action slots without renaming legacy art."""
import copy, contextlib
import importlib.util
import io
from pathlib import Path
import sys
import tempfile
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools'))
spec = importlib.util.spec_from_file_location('register_images', Path(sys.path[0]) / 'register-images.py')
reg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reg)

forms = {'light': {}, 'heavy': {}, 'mobility': {}, 'overdrive': {}}
style = 'cinematic_semi_real'
slots = ['light', 'heavy', 'mobility', 'light_overdrive', 'heavy_overdrive', 'mobility_overdrive', 'overdrive']
with tempfile.TemporaryDirectory() as folder:
    names = [f'Pikachu_{form}_{style}_f.webp' for form in slots]
    actions = [f'Pikachu_{form}_{style}_f_action1.webp' for form in ['heavy', 'heavy_overdrive']]
    for name in names + actions:
        (Path(folder) / name).touch()
    doc = {'img': {}}
    with patch.object(reg, 'IMG_DIR', folder), patch.object(reg, 'EXTRA_DIRS', []), \
         patch.object(reg.roster, 'read', return_value=doc), \
         patch.object(reg.roster, 'cards', return_value={'Pikachu': {}}), \
         patch.object(reg.roster, 'styles', return_value={style: style}), \
         patch.object(reg.roster, 'forms', return_value=forms), \
         patch.object(reg.roster, 'art_size', return_value=[]), \
         patch.object(reg.roster, 'write') as write, \
         patch.object(sys, 'argv', ['register-images.py']), contextlib.redirect_stdout(io.StringIO()):
        reg.main()
        write.assert_called_once()
        bucket = doc['img']['Pikachu']['byStyle'][style]['byForm']
        assert set(bucket) == set(slots)
        for form, name in zip(slots, names):
            assert bucket[form]['f'] == name
        assert bucket['heavy']['action']['f'] == [actions[0]]
        assert bucket['heavy_overdrive']['action']['f'] == [actions[1]]
        assert reg.listed_files(doc['img']) == set(names + actions)
        write.reset_mock()
        reg.main()
        write.assert_called_once()  # Re-registration retains every image without duplicates.
        assert reg.listed_files(doc['img']) == set(names + actions)
        (Path(folder) / f'Pikachu_unknown_overdrive_{style}_f.webp').touch()
        write.reset_mock()
        try:
            reg.main()
        except SystemExit as exc:
            assert exc.code == 1
        else:
            raise AssertionError('Unknown base armor must fail validation')
        write.assert_not_called()

# ── 그림 저장소 여럿(2026-10-13) — 새 그림은 열린 저장소에만, where 에 자리, 같은 이름 금지, 못 받은 저장소는 자리 보존 ──
def run(doc, a, b, argv=()):
    """파일처럼 매번 새로 읽는다 — 실패한 차례가 고친 내용이 다음 차례로 새지 않게. 저장했으면 저장한 것을, 아니면 그대로를 돌려준다"""
    out = io.StringIO()
    with patch.object(reg, 'IMG_DIR', a), patch.object(reg, 'EXTRA_DIRS', [b]), \
         patch.object(reg.roster, 'read', side_effect=lambda *_: copy.deepcopy(doc)), \
         patch.object(reg.roster, 'cards', return_value={'Pikachu': {}, 'Eevee': {}}), \
         patch.object(reg.roster, 'styles', return_value={style: style}), \
         patch.object(reg.roster, 'forms', return_value=forms), \
         patch.object(reg.roster, 'art_size', return_value=[]) as size, \
         patch.object(reg.roster, 'write') as write, \
         patch.object(sys, 'argv', ['register-images.py', *argv]), contextlib.redirect_stdout(out):
        try:
            reg.main(); code = 0
        except SystemExit as exc:
            code = exc.code
    return code, write, out.getvalue(), size, (write.call_args[0][1] if write.called else doc)

with tempfile.TemporaryDirectory() as root:
    a, b = Path(root) / 'img', Path(root) / 'img-2'
    a.mkdir(); b.mkdir()
    old = f'Pikachu_light_{style}_f.webp'; new = f'Eevee_light_{style}_f.webp'; sample = 'style-test-glossy.webp'
    (a / old).touch(); (b / new).touch(); (b / sample).touch()
    doc = {'img': {'Pikachu': {'byStyle': {style: {'byForm': {'light': {'f': old}}}}}}}
    code, write, out, size, doc = run(doc, str(a), str(b))
    assert code == 0 and write.called, out
    assert doc['where'] == {new: 1, sample: 1}, doc.get('where')          # 0 번은 적지 않는다 — 옛 주소 그대로
    assert doc['img']['Eevee']['byStyle'][style]['byForm']['light']['f'] == new
    assert size.call_args[0][0] == [str(a), str(b)], size.call_args      # 크기 검사도 두 자리를 본다
    # 다시 돌려도 같다
    code, write, out, _, again = run(doc, str(a), str(b)); assert code == 0 and again == doc
    # 닫힌 0 번 저장소에 새 이름 → 전체 실패, 쓰지 않는다. 이미 있는 이름(교체)은 받는다
    (a / f'Eevee_heavy_{style}_f.webp').touch()
    code, write, out, *_ = run(doc, str(a), str(b))
    assert code == 1 and not write.called and '닫힌 그림 저장소' in out, out
    (a / f'Eevee_heavy_{style}_f.webp').unlink()
    (b / new).unlink(); (a / new).touch()                                 # 교체 — 이미 있는 이름을 0 번에 두면 받는다(자리는 0 번으로)
    code, write, out, _, moved = run(doc, str(a), str(b))
    assert code == 0 and new not in moved['where'], out
    (a / new).unlink(); (b / new).touch()
    # 같은 이름이 두 저장소에 → 실패
    (a / new).touch()
    code, write, out, *_ = run(doc, str(a), str(b))
    assert code == 1 and not write.called and '같은 이름' in out, out
    (a / new).unlink()
    # 2 번 저장소를 못 받았다 → where 는 그대로, --prune 은 거부
    gone = Path(root) / 'img-x'
    code, write, out, _, kept = run(doc, str(a), str(gone))
    assert code == 0 and kept['where'] == {new: 1, sample: 1} and 'pkm-atelier-img-2' in out, out
    code, write, out, *_ = run(doc, str(a), str(gone), ['--prune'])
    assert code not in (0, None) and not write.called, (code, out)
    # 아직 아무것도 안 올린(만들기 전) 저장소를 못 받은 것은 --prune 을 막지 않는다
    code, write, out, _, fresh = run({'img': doc['img']}, str(a), str(gone), ['--prune'])
    assert code == 0 and write.called and 'where' not in fresh, (code, out)
    # 2 번에서 파일이 사라졌다 — --prune 전에는 자리를 남긴다
    (b / sample).unlink()
    code, write, out, _, kept = run(doc, str(a), str(b))
    assert code == 0 and kept['where'].get(sample) == 1
    code, write, out, _, pruned = run(doc, str(a), str(b), ['--prune'])
    assert code == 0 and pruned['where'] == {new: 1}, pruned.get('where')
print('PASS image registration: 3 normal + 3 overdrive slots, independent action, legacy, repeat and invalid base · shards: where, open/closed, duplicate, missing repo, prune')
