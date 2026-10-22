#!/usr/bin/env python3
"""Bounded image-work coordinator. No image API, scheduler, force-push or deletion.
All mutable state and preserved assets live in img-2 records/automation/.
A normal fast-forward push is the compare-and-swap; contention stops the caller.
"""
import argparse, datetime as dt, hashlib, io, json, os, re, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = 'records/automation/state.json'
SLOTS = ['light', 'heavy', 'mobility', 'light_overdrive', 'heavy_overdrive', 'mobility_overdrive', 'casual1', 'casual2', 'casual3']


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')


def digest(b):
    return hashlib.sha256(b).hexdigest()


def encoded(v):
    return (json.dumps(v, ensure_ascii=False, indent=2) + '\n').encode()


def git(repo, *args, data=None, env=None):
    return subprocess.check_output(['git', '-C', str(repo), *args], input=data, env=env, stderr=subprocess.PIPE)


class Store:
    def __init__(self, repo):
        self.repo = Path(repo)
        git(repo, 'fetch', '-q', 'origin', 'main')
        self.base = git(repo, 'rev-parse', 'origin/main').decode().strip()
        self.paths = set(git(repo, 'ls-tree', '-rz', '--name-only', self.base).decode().split('\0'))

    def read(self, path):
        return git(self.repo, 'show', self.base + ':' + path)

    def state(self):
        return json.loads(self.read(STATE)) if STATE in self.paths else {
            'version': 1, 'policy': {'daily_max': 2, 'timezone': 'UTC'},
            'daily': {}, 'runs': [], 'claims': {}, 'blocked_candidates': {}, 'external_holds': {}}

    def publish(self, state, files, message):
        # Never overwrite a stored image, prompt or QA. State is the sole mutable file.
        for path, data in files.items():
            if not path.startswith('records/automation/') or '..' in Path(path).parts:
                raise ValueError('invalid artifact path')
            if path in self.paths and self.read(path) != data:
                raise ValueError('refuse artifact replacement: ' + path)
        files = {**files, STATE: encoded(state)}
        with tempfile.TemporaryDirectory(prefix='image-runner-') as tmp:
            env = {**os.environ, 'GIT_INDEX_FILE': str(Path(tmp) / 'index')}
            git(self.repo, 'read-tree', self.base, env=env)
            for path, data in files.items():
                blob = git(self.repo, 'hash-object', '-w', '--stdin', data=data).decode().strip()
                git(self.repo, 'update-index', '--add', '--cacheinfo', '100644,' + blob + ',' + path, env=env)
            tree = git(self.repo, 'write-tree', env=env).decode().strip()
            commit = git(self.repo, 'commit-tree', tree, '-p', self.base, data=(message + '\n').encode()).decode().strip()
        try:
            git(self.repo, 'push', 'origin', commit + ':refs/heads/main')
        except subprocess.CalledProcessError as e:
            # A disconnected response may hide success. Resolve before allowing retry.
            git(self.repo, 'fetch', '-q', 'origin', 'main')
            try:
                git(self.repo, 'merge-base', '--is-ancestor', commit, 'origin/main')
            except subprocess.CalledProcessError:
                raise RuntimeError('push not confirmed; STOP and inspect remote. Attempted commit: ' + commit) from e
        return commit


def active(state):
    return next((r for r in reversed(state['runs']) if r['status'] != 'complete'), None)


def owned(state, owner):
    r = active(state)
    if not r or r['owner'] != owner:
        raise ValueError('no active run owned by this owner; do not take over another run')
    for c in r['queue']:
        claim = state['claims'].get(str(c['no']), {})
        if claim.get('owner') != owner or claim.get('run') != r['id']:
            raise ValueError('character claim does not match run')
    return r


def charge(state, numbers, day):
    used = state['daily'].setdefault(day, [])
    combined = sorted(set(used) | set(numbers))
    if len(combined) > 2:
        raise ValueError('daily maximum 2 characters reached (UTC)')
    state['daily'][day] = combined


def current(run):
    return next((c for c in run['queue'] if c['status'] != 'complete'), None)


def check_assets(state, read):
    for run in state['runs']:
        for c in run['queue']:
            for item in c['slots'].values():
                for key in ['prompt', 'ui', 'image', 'qa']:
                    a = item.get(key)
                    if a and (not a['path'].startswith('records/automation/') or '..' in Path(a['path']).parts):
                        raise ValueError('invalid recovery artifact path')
                    if a and digest(read(a['path'])) != a['sha256']:
                        raise ValueError('missing/corrupt recovery artifact: ' + a['path'])


def next_step(run):
    c = current(run)
    if c is None:
        return {'action': 'complete'}
    if c['status'] == 'blocked':
        return {'card': c['name'], 'action': 'blocked', 'reason': c['reason']}
    for slot in SLOTS:
        item = c['slots'].get(slot)
        if not item:
            return {'card': c['name'], 'no': c['no'], 'slot': slot, 'action': 'prepare_ui_then_intent',
                    'casual_session': 'image-runner-' + run['id'] + '-' + str(c['no'])}
        if item['status'] != 'accepted':
            return {'card': c['name'], 'no': c['no'], 'slot': slot, 'action': item['status'], 'evidence': item}
    return {'card': c['name'], 'no': c['no'], 'action': 'publish_images_then_verify_registration'}


def candidates(cards, registry, inventories, records, reservations, state):
    out, blocked = [], {}
    for card in sorted(cards, key=lambda c: c['no']):
        n, name = card['no'], card['name']
        if str(n) in state['claims'] or str(n) in state['external_holds'] or name in reservations:
            continue
        styles = registry.get('img', {}).get(name, {}).get('byStyle', {})
        complete = any(all(v.get('byForm', {}).get(f, {}).get('f') for f in SLOTS[:6]) and
                       len(v.get('casual', {}).get('f', [])) >= 3 for v in styles.values())
        if complete:
            continue
        if styles:
            blocked[str(n)] = {'card': name, 'status': 'blocked_legacy_metadata' if name not in records else 'external_partial',
                               'reason': 'Preserve registered slots; recover ownership and genuine UI metadata before refill.'}
            continue
        if name in records or any(f.startswith(name.replace(' ', '_') + '_') or f.startswith(name + '_') for f in inventories):
            blocked[str(n)] = {'card': name, 'status': 'external_work', 'reason': 'Remote images/records already exist.'}
            continue
        out.append(card)
    return out, blocked


def prepare(state, owner, available, blocked, day):
    r = active(state)
    state['blocked_candidates'].update(blocked)
    if r:
        r = owned(state, owner)
        if r['status'] == 'blocked':
            raise ValueError('run blocked; inspect evidence and resume explicitly')
        charge(state, [c['no'] for c in r['queue'] if c['status'] != 'complete'], day)
        return r
    capacity = 2 - len(state['daily'].get(day, []))
    picked = available[:capacity]
    if not picked:
        raise ValueError('no available daily capacity or unclaimed candidates')
    charge(state, [c['no'] for c in picked], day)
    ident = day + '-' + str(len(state['runs']) + 1)
    r = {'id': ident, 'owner': owner, 'status': 'active', 'created_at': now(), 'queue': [
        {'no': c['no'], 'name': c['name'], 'style': 'glossy_promo', 'status': 'claimed', 'slots': {}} for c in picked]}
    state['runs'].append(r)
    for c in r['queue']:
        state['claims'][str(c['no'])] = {'owner': owner, 'run': ident, 'status': 'held', 'at': now()}
    return r


def artifact(files, prefix, label, path):
    b = Path(path).read_bytes()
    target = prefix + '/' + label
    files[target] = b
    return {'path': target, 'sha256': digest(b)}


def intent(run, slot, prompt, ui, files):
    step = next_step(run)
    if step.get('action') != 'prepare_ui_then_intent' or step['slot'] != slot:
        raise ValueError('not the next slot; pending result/review must be resolved first')
    c = current(run)
    # UI is captured by the agent, not synthesized by this coordinator.
    if not Path(prompt).read_text().strip() or not isinstance(json.loads(Path(ui).read_text()), dict):
        raise ValueError('actual prompt and UI JSON required')
    refs = [] if slot == 'light' else [slot.replace('_overdrive', '') if slot.endswith('_overdrive') else 'light']
    for ref in refs:
        if c['slots'].get(ref, {}).get('status') != 'accepted':
            raise ValueError('reference not accepted')
    prefix = 'records/automation/runs/' + run['id'] + '/' + str(c['no']) + '/' + slot
    c['slots'][slot] = {'status': 'in_flight', 'at': now(), 'prompt': artifact(files, prefix, 'prompt.txt', prompt),
                        'ui': artifact(files, prefix, 'ui.json', ui),
                        'references': {ref: c['slots'][ref]['image']['sha256'] for ref in refs}}
    c['status'] = 'working'


def record(run, slot, image, files):
    from PIL import Image
    c = current(run)
    item = c['slots'].get(slot, {})
    if item.get('status') != 'in_flight':
        raise ValueError('record requires an existing in_flight intent; do not generate again')
    with Image.open(image) as im:
        im.load()
        if im.size != (1024, 1536) or im.format not in ('PNG', 'WEBP'):
            raise ValueError('expected decoded PNG/WebP 1024x1536; preserve rejected original locally')
        ext = '.png' if im.format == 'PNG' else '.webp'
    prefix = 'records/automation/runs/' + run['id'] + '/' + str(c['no']) + '/' + slot
    item.update(status='review', image=artifact(files, prefix, 'original' + ext, image), received_at=now())


def review(run, slot, qa, files):
    c = current(run); item = c['slots'].get(slot, {})
    if item.get('status') != 'review':
        raise ValueError('review requires preserved output')
    q = json.loads(Path(qa).read_text())
    if q.get('image_sha256') != item['image']['sha256'] or not q.get('observations') or not q.get('reviewer'):
        raise ValueError('QA must identify inspected image hash, reviewer and observations')
    if q.get('accepted') is not True:
        raise ValueError('QA not accepted; use block, never silently advance')
    if slot == 'light' and (len(q.get('compared_characters', [])) < 3 or not q.get('face_reason')):
        raise ValueError('canonical face comparison and face rationale required')
    if slot.startswith('casual') and not q.get('diversity_comparison'):
        raise ValueError('actual-image diversity QA required')
    prefix = 'records/automation/runs/' + run['id'] + '/' + str(c['no']) + '/' + slot
    item.update(status='accepted', qa=artifact(files, prefix, 'qa.json', qa))


def complete(run, state, images, code):
    from PIL import Image
    c = current(run)
    if next_step(run)['action'] != 'publish_images_then_verify_registration':
        raise ValueError('all nine slots require accepted QA before completion')
    registry = json.loads(code.read('data/img.json'))
    entry = registry.get('img', {}).get(c['name'], {}).get('byStyle', {}).get(c['style'], {})
    outputs = {}
    for slot in SLOTS:
        original = images.read(c['slots'][slot]['image']['path'])
        with Image.open(io.BytesIO(original)) as im:
            if im.format == 'WEBP':
                expected = original
            else:
                buf = io.BytesIO(); im.save(buf, format='WEBP', quality=85, method=6); expected = buf.getvalue()
        if slot.startswith('casual'):
            filename = c['name'] + '_' + c['style'] + '_f_' + slot + '.webp'
            registered = filename in entry.get('casual', {}).get('f', [])
        else:
            filename = c['name'] + '_' + slot + '_' + c['style'] + '_f.webp'
            registered = entry.get('byForm', {}).get(slot, {}).get('f') == filename
        if not registered or registry.get('where', {}).get(filename) != 1:
            raise ValueError('registration pending: ' + filename)
        if digest(images.read('img/' + filename)) != digest(expected):
            raise ValueError('published bytes differ from preserved source conversion: ' + filename)
        with Image.open(io.BytesIO(images.read('img/thumb/' + filename))) as thumb:
            thumb.load()
            if max(thumb.size) != 512: raise ValueError('thumbnail invalid')
        outputs[slot] = {'file': filename, 'sha256': digest(expected)}
    c.update(status='complete', outputs=outputs, image_commit=images.base, registration_commit=code.base, completed_at=now())
    state['claims'][str(c['no'])]['status'] = 'complete'
    if current(run) is None:
        run['status'] = 'complete'


def restore(state, read, target):
    root = Path(target)
    for r in state['runs']:
        for c in r['queue']:
            for item in c['slots'].values():
                for key in ['prompt', 'ui', 'image', 'qa']:
                    a = item.get(key)
                    if not a:
                        continue
                    data = read(a['path'])
                    if digest(data) != a['sha256']:
                        raise ValueError('remote artifact hash mismatch')
                    dest = root / a['path']
                    if dest.exists() and digest(dest.read_bytes()) != a['sha256']:
                        raise ValueError('refuse overwrite during restore: ' + str(dest))
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    if not dest.exists():
                        with dest.open('xb') as f:
                            f.write(data)


def remote_inputs(code, imgs):
    registry = json.loads(code.read('data/img.json'))
    cards = json.loads(code.read('data/card.json'))['cards']['character']
    inventory, records, reserved = set(), set(), {}
    for store in imgs:
        inventory |= {p[4:] for p in store.paths if re.fullmatch(r'img/[^/]+\.webp', p)}
        for p in store.paths:
            if p.startswith('records/') and p.endswith('.json') and not p.startswith('records/automation/'):
                if '/casual-reservations/' not in p and not p.endswith('/checkpoint.json'):
                    continue
                d = json.loads(store.read(p))
                if '/casual-reservations/' in p:
                    # Even interrupted/expired sessions are not silently taken over.
                    for c in d.get('characters', []):
                        reserved[c['card']] = {'session': d.get('session'), 'file': p, 'at': c.get('at') or d.get('at'),
                                               'status': 'external_reservation_do_not_take_over'}
                elif d.get('card'):
                    records.add(d['card'])
    return cards, registry, inventory, records, reserved


def guard_external(store, run, slot):
    c = current(run)
    if any(p.startswith('img/' + c['name'] + '_') and p.endswith('.webp') for p in store.paths):
        raise ValueError('images now exist remotely; reconcile before another generation')
    session = 'image-runner-' + run['id'] + '-' + str(c['no'])
    mine = None
    for p in store.paths:
        if p.startswith('records/casual-reservations/') and p.endswith('.json'):
            d = json.loads(store.read(p))
            if any(ch['card'] == c['name'] for ch in d.get('characters', [])):
                if d.get('session') != session:
                    raise ValueError('another session owns a casual reservation; do not take over')
                mine = d
    if slot.startswith('casual'):
        if not mine:
            raise ValueError('publish planner reservation first: --session ' + session)
        when = dt.datetime.fromisoformat(mine['at'])
        if when.tzinfo is None or (dt.datetime.now(dt.timezone.utc) - when).total_seconds() >= 24 * 3600:
            raise ValueError('own casual reservation expired; replan/revalidate before generation')


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('command', choices=['status', 'prepare', 'next', 'intent', 'record', 'adopt-pilot', 'review', 'complete', 'block', 'resume', 'restore'])
    ap.add_argument('--owner', default='pkm-daily')
    ap.add_argument('--repo', default=str(ROOT.parent / 'pkm-atelier-img-2'))
    ap.add_argument('--slot', choices=SLOTS)
    for key in ['prompt', 'ui', 'image', 'qa', 'reason', 'dir', 'pilot-checkpoint']:
        ap.add_argument('--' + key)
    a = ap.parse_args()
    store = Store(a.repo); state = store.state(); files = {}
    check_assets(state, store.read)
    if a.command == 'restore':
        if not a.dir:
            raise ValueError('--dir required')
        restore(state, store.read, a.dir)
        print('restored and hash verified; never regenerate missing local files before restore')
        return
    if a.command in ('status', 'next'):
        r = active(state)
        print(json.dumps({'head': store.base, 'run': r, 'next': next_step(r) if r else 'prepare',
                          'external_holds': state['external_holds'], 'daily': state['daily']}, ensure_ascii=False, indent=2))
        return
    if a.command == 'prepare':
        code = Store(ROOT); first = Store(ROOT.parent / 'pkm-atelier-img')
        data = remote_inputs(code, [first, store])
        for c in data[0]:
            if c['name'] in data[4]:
                state['external_holds'][str(c['no'])] = {'card': c['name'], **data[4][c['name']]}
        available, blocked = candidates(*data, state)
        run = prepare(state, a.owner, available, blocked, now()[:10])
    else:
        run = owned(state, a.owner)
        charge(state, [c['no'] for c in run['queue'] if c['status'] != 'complete'], now()[:10])
        if run['status'] == 'blocked' and a.command != 'resume':
            raise ValueError('run blocked; no generation until explicitly resolved')
        if a.command == 'intent':
            if not a.slot: raise ValueError('--slot required')
            guard_external(store, run, a.slot)
            intent(run, a.slot, a.prompt, a.ui, files)
        elif a.command == 'adopt-pilot':
            pilot = json.loads(Path(a.pilot_checkpoint).read_text())
            if pilot.get('card') != current(run)['name'] or pilot.get('slot') != 'light' or pilot.get('sha256') != digest(Path(a.image).read_bytes()):
                raise ValueError('pilot checkpoint/card/slot/hash mismatch')
            guard_external(store, run, 'light')
            intent(run, 'light', a.prompt, a.ui, files)
            record(run, 'light', a.image, files)
            item = current(run)['slots']['light']
            item.update(imported_existing_result=True, actual_submitted_at=pilot.get('submitted_at'))
            prefix = 'records/automation/runs/' + run['id'] + '/' + str(current(run)['no']) + '/light'
            artifact(files, prefix, 'pilot-checkpoint.json', a.pilot_checkpoint)
        elif a.command == 'record': record(run, a.slot, a.image, files)
        elif a.command == 'review': review(run, a.slot, a.qa, files)
        elif a.command == 'complete': complete(run, state, store, Store(ROOT))
        elif a.command == 'block':
            if not a.reason: raise ValueError('--reason required')
            run['status'] = 'blocked'; current(run).update(status='blocked', reason=a.reason)
        elif a.command == 'resume':
            if not a.reason: raise ValueError('resolution --reason required')
            if run['status'] != 'blocked': raise ValueError('not blocked')
            run['status'] = 'active'; current(run).update(status='working', resolution=a.reason)
    run['updated_at'] = now()
    commit = store.publish(state, files, 'Image runner: ' + a.command + ' ' + run['id'])
    print(json.dumps({'commit': commit, 'next': next_step(run)}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError, subprocess.CalledProcessError) as exc:
        raise SystemExit('STOP: ' + str(exc))
