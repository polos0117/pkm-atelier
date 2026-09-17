"""Register distinct armor/overdrive portraits and action slots without renaming legacy art."""
import contextlib
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
    with patch.object(reg, 'IMG_DIR', folder), \
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
print('PASS image registration: 3 normal + 3 overdrive slots, independent action, legacy, repeat and invalid base')
