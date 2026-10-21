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

# ── 들어온 날(added, 2026-10-21) — 새 파일은 오늘 · 적힌 날짜는 그대로 · 이력이 없으면 비운다 · 온전한 이력만 메운다(얕은 받기는 안 믿는다) ──
import os, subprocess
def sh(cwd, *args, day=None):
    env = dict(os.environ, GIT_AUTHOR_NAME='t', GIT_AUTHOR_EMAIL='t@t', GIT_COMMITTER_NAME='t', GIT_COMMITTER_EMAIL='t@t')
    if day:
        env.update(GIT_AUTHOR_DATE=day + 'T12:00:00+00:00', GIT_COMMITTER_DATE=day + 'T12:00:00+00:00')
    subprocess.run(['git', *args], cwd=cwd, env=env, check=True, capture_output=True)

with tempfile.TemporaryDirectory() as root, patch.object(reg, 'today', return_value='2026-10-21'):
    a, b = Path(root) / 'img', Path(root) / 'img-2'
    a.mkdir(); b.mkdir()
    old = f'Pikachu_light_{style}_f.webp'; undated = f'Pikachu_heavy_{style}_f.webp'; new = f'Eevee_light_{style}_f.webp'
    for f in (old, undated): (a / f).touch()
    (b / new).touch()
    doc = {'img': {'Pikachu': {'byStyle': {style: {'byForm': {'light': {'f': old}, 'heavy': {'f': undated}}}}}},
           'added': {old: '2026-09-30', 'gone.webp': '2026-09-01'}}
    code, write, out, _, got = run(doc, str(a), str(b))
    assert code == 0 and write.called, out
    # 새 파일은 오늘 · 있던 날짜는 그대로 · git 이 아닌 자리의 날짜 없는 파일은 비운다 · 등록부에 없는 파일의 날짜는 걷는다
    assert got['added'] == {old: '2026-09-30', new: '2026-10-21'}, got['added']
    assert '날짜 모름 1' in out, out
    code, write, out, _, again = run(got, str(a), str(b))
    assert code == 0 and again['added'] == got['added'], again['added']     # 다시 돌려도 날짜가 안 바뀐다

    # 온전한 이력 — 파일을 처음 더한 커밋 날짜로 메운다. 있던 날짜(old)는 이력이 달라도 안 바꾼다
    repo = Path(root) / 'repo'; (repo / 'img').mkdir(parents=True)
    sh(repo, 'init', '-q')
    (repo / 'img' / old).touch(); sh(repo, 'add', '.'); sh(repo, 'commit', '-qm', '1', day='2026-09-02')
    (repo / 'img' / undated).touch(); sh(repo, 'add', '.'); sh(repo, 'commit', '-qm', '2', day='2026-10-02')
    (repo / 'README').write_text('x'); sh(repo, 'add', '.'); sh(repo, 'commit', '-qm', '3', day='2026-10-05')
    (repo / 'img' / undated).write_bytes(b'x'); sh(repo, 'commit', '-qam', '4', day='2026-10-06')   # 교체는 "더하기" 가 아니다
    code, write, out, _, got = run(got, str(repo / 'img'), str(b))
    assert code == 0 and got['added'] == {old: '2026-09-30', undated: '2026-10-02', new: '2026-10-21'}, got['added']
    # --history 로 다른 자리의 clone 을 짚어도 같다
    code, write, out, _, viaflag = run({**got, 'added': {}}, str(a), str(b), ['--history', 'pkm-atelier-img=' + str(repo)])
    assert code == 0 and viaflag['added'] == {old: '2026-09-02', undated: '2026-10-02'}, viaflag['added']
    # 얕은 받기 — 마지막 커밋이 모든 파일을 "더한" 것으로 보이므로(2026-10-06) 메우지 않는다
    shallow = Path(root) / 'shallow'
    sh(root, 'clone', '-q', '--depth', '1', repo.as_uri(), str(shallow))
    code, write, out, _, kept = run({**got, 'added': {old: '2026-09-30'}}, str(shallow / 'img'), str(b))
    assert code == 0 and kept['added'] == {old: '2026-09-30'}, kept['added']
    assert reg.history_dates(str(shallow), 'img') and reg.repo_of(str(shallow / 'img')) is None
    code, *_ = run(got, str(a), str(b), ['--history', 'nope=' + str(repo)])
    assert code not in (0, None), code                                     # 모르는 저장소 이름은 막는다
# ── 들어온 시각(added_at, 2026-10-22) — 새 파일은 지금 · 최근 30일만 · 이력은 적힌 날짜와 하루 안의 커밋일 때만 ──
with tempfile.TemporaryDirectory() as root, patch.object(reg, 'today', return_value='2026-10-21'), \
     patch.object(reg, 'now', return_value='2026-10-21T09:30:00Z'):
    a, b = Path(root) / 'img', Path(root) / 'img-2'
    a.mkdir(); b.mkdir()
    old = f'Pikachu_light_{style}_f.webp'; mid = f'Pikachu_heavy_{style}_f.webp'; new = f'Eevee_light_{style}_f.webp'
    for f in (old, mid): (a / f).touch()
    (b / new).touch()
    doc = {'img': {'Pikachu': {'byStyle': {style: {'byForm': {'light': {'f': old}, 'heavy': {'f': mid}}}}}},
           'added': {old: '2026-09-01', mid: '2026-10-02'}, 'added_at': {old: '2026-09-01T08:00:00Z', 'gone.webp': '2026-10-20T00:00:00Z'}}
    code, write, out, _, got = run(doc, str(a), str(b))
    assert code == 0 and got['added_at'] == {new: '2026-10-21T09:30:00Z'}, got['added_at']    # 새 파일은 지금 · 30일 넘은 것·없는 파일은 걷는다
    repo = Path(root) / 'repo'; (repo / 'img').mkdir(parents=True)
    sh(repo, 'init', '-q')
    (repo / 'img' / old).touch(); sh(repo, 'add', '.'); sh(repo, 'commit', '-qm', '1', day='2026-09-01')
    (repo / 'img' / mid).touch(); sh(repo, 'add', '.'); sh(repo, 'commit', '-qm', '2', day='2026-10-02')
    code, write, out, _, got = run(got, str(repo / 'img'), str(b))
    assert code == 0 and got['added_at'] == {mid: '2026-10-02T12:00:00Z', new: '2026-10-21T09:30:00Z'}, got['added_at']   # 최근 것만 이력의 시각으로
    code, write, out, _, other = run({**got, 'added': {**got['added'], mid: '2026-10-05'}, 'added_at': {}}, str(repo / 'img'), str(b))
    assert code == 0 and other['added_at'] == {}, other['added_at']                                 # 적힌 날짜와 커밋 날이 하루 넘게 다르면 메우지 않는다
    assert reg.utc_stamp('2026-10-22T08:36:09+09:00') == '2026-10-21T23:36:09Z' and reg.utc_stamp('nope') is None
print('PASS image registration: 3 normal + 3 overdrive slots, independent action, legacy, repeat and invalid base · shards: where, open/closed, duplicate, missing repo, prune · added: today, kept, missing without history, git history, shallow ignored · added_at: now, recent only, history within a day')
