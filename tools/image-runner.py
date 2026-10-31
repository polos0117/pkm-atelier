#!/usr/bin/env python3
"""Bounded image-work coordinator. No image API, scheduler, force-push or deletion.
All mutable state and preserved text assets (prompt, UI, QA, approvals) live in img-2 records/automation/.
Generated originals are NOT committed (2026-10-23): they stay in this session's cache (PKM_IMAGE_CACHE,
default <tmp>/pkm-image-runner/<sha256>.<ext>) and the record keeps only their sha256 and the sha256 of
their WebP conversion. Older records whose originals were committed still read them from img-2.
New images are published to the open image repository (the last of IMAGE_REPOS, img-4 since 2026-10-31);
the earlier ones are closed (replacements only).
A normal fast-forward push is the compare-and-swap; contention stops the caller.
"""
import copy
import argparse, datetime as dt, hashlib, io, json, os, re, subprocess, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STATE = 'records/automation/state.json'
SLOTS = ['light', 'heavy', 'mobility', 'light_overdrive', 'heavy_overdrive', 'mobility_overdrive', 'casual1', 'casual2', 'casual3']
TERMINAL = {'complete', 'completed_externally', 'skipped_external_partial'}
IMAGE_REPOS = ['pkm-atelier-img', 'pkm-atelier-img-2', 'pkm-atelier-img-3', 'pkm-atelier-img-4']   # data/img.json "where" order; last one is open
DAILY_MAX = 12
EXECUTION_MAX = 1
KST = dt.timezone(dt.timedelta(hours=9))

CACHE = Path(os.environ.get('PKM_IMAGE_CACHE') or Path(tempfile.gettempdir()) / 'pkm-image-runner')


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
            'version': 1, 'policy': {'daily_max': DAILY_MAX, 'execution_max': EXECUTION_MAX, 'timezone': 'Asia/Seoul', 'utc_daily_max': DAILY_MAX},
            'daily': {}, 'runs': [], 'claims': {}, 'blocked_candidates': {}, 'external_holds': {}}

    def publish(self, state, files, message):
        # Never overwrite a stored image, prompt or QA. State is the sole mutable file.
        for path, data in files.items():
            if not path.startswith('records/automation/') or '..' in Path(path).parts:
                raise ValueError('invalid artifact path')
            if Path(path).suffix.lower() in ('.png', '.jpg', '.jpeg') and path not in self.paths:
                raise ValueError('raw originals must remain session-local')
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
    return next((r for r in reversed(state['runs']) if r['status'] not in ('complete', 'deferred')), None)


def owned(state, owner):
    r = active(state)
    if not r or r['owner'] != owner:
        raise ValueError('no active run owned by this owner; do not take over another run')
    for c in r['queue']:
        if c['status'] in TERMINAL:
            continue
        claim = state['claims'].get(str(c['no']), {})
        if claim.get('owner') != owner or claim.get('run') != r['id']:
            raise ValueError('character claim does not match run')
    return r


def dates(at):
    t = dt.datetime.fromisoformat(at)
    if t.tzinfo is None:
        t = t.replace(tzinfo=dt.timezone.utc)
    return t.astimezone(dt.timezone.utc).date().isoformat(), t.astimezone(KST).date().isoformat()


def migrate_policy(state):
    state['policy'].update(daily_max=DAILY_MAX, utc_daily_max=DAILY_MAX,
                           execution_max=EXECUTION_MAX, timezone='Asia/Seoul', cadence_hours=2)
    if 'daily_kst' not in state:
        state['daily_kst'] = {}
        for run in state['runs']:
            for c in run['queue']:
                for item in list(c['slots'].values()) + c.get('attempt_history', []):
                    if item.get('at'):
                        day = dates(item['at'])[1]
                        used = state['daily_kst'].setdefault(day, [])
                        if c['no'] not in used: used.append(c['no'])
    state.setdefault('executions', {})


def charge(state, numbers, at):
    migrate_policy(state)
    utc, kst = dates(at)
    updates = [(state['daily'], utc, 'UTC'), (state['daily_kst'], kst, 'Asia/Seoul')]
    for ledger, day, zone in updates:
        if len(set(ledger.get(day, [])) | set(numbers)) > DAILY_MAX:
            raise ValueError('daily maximum 12 characters reached (' + zone + ')')
    for ledger, day, _ in updates:
        ledger[day] = sorted(set(ledger.get(day, [])) | set(numbers))


def bind_execution(state, owner, ident, number):
    if not ident: raise ValueError('--execution-id required; reuse the same ID throughout one scheduled invocation')
    migrate_policy(state)
    e = state['executions'].setdefault(ident, {'owner': owner, 'at': now(), 'characters': []})
    if e['owner'] != owner: raise ValueError('execution owner mismatch')
    if number not in e['characters']:
        if len(e['characters']) >= EXECUTION_MAX: raise ValueError('execution maximum 1 character reached')
        e['characters'].append(number)


def current(run):
    return next((c for c in run['queue'] if c['status'] not in TERMINAL), None)


def filename(card, slot):
    return card['name'] + ('_' + slot if not slot.startswith('casual') else '') + '_' + card['style'] + '_f' + ('_' + slot if slot.startswith('casual') else '') + '.webp'


def webp(original):
    from PIL import Image
    with Image.open(io.BytesIO(original)) as im:
        if im.format == 'WEBP':
            return original
        buf = io.BytesIO(); im.save(buf, format='WEBP', quality=85, method=6)
        return buf.getvalue()


def keep_original(prefix, label, path):
    """Session-only original: cache the bytes locally, commit only hashes (no PNG in the Pages repository)."""
    b = Path(path).read_bytes(); h = digest(b)
    CACHE.mkdir(parents=True, exist_ok=True)
    local = CACHE / (h + Path(label).suffix)
    if not local.exists():
        local.write_bytes(b)
    return {'path': prefix + '/' + label, 'sha256': h, 'session_only': True, 'webp_sha256': digest(webp(b))}


def image_bytes(a, read):
    """Original bytes: committed legacy artifact, or this session's cache for session-only originals."""
    if not a.get('session_only'):
        return read(a['path'])
    for local in CACHE.glob(a['sha256'] + '.*'):
        b = local.read_bytes()
        if digest(b) == a['sha256']:
            return b
    raise ValueError('original not in this session (session_only, sha256 ' + a['sha256'][:12] + '); '
                     'originals are never committed - regenerate under an explicit approval')


def public_hash(a, read):
    """sha256 of the WebP that must be published for this original."""
    return a['webp_sha256'] if a.get('webp_sha256') else digest(webp(image_bytes(a, read)))


def registered_files(value):
    if isinstance(value, str):
        return {value} if value.endswith('.webp') else set()
    children = value.values() if isinstance(value, dict) else value if isinstance(value, list) else []
    return set().union(*(registered_files(v) for v in children))


def externally_complete(card, registry, images):
    for style, v in registry.get('img', {}).get(card['name'], {}).get('byStyle', {}).items():
        names = [v.get('byForm', {}).get(s, {}).get('f') for s in SLOTS[:6]]
        casual = v.get('casual', {}).get('f', [])
        names += [next((f for f in casual if f.endswith('_f_casual' + str(n) + '.webp')), None) for n in (1, 2, 3)]
        if not all(names):
            continue
        def exists(f):
            shard = registry.get('where', {}).get(f, 0)
            return shard < len(images) and all(p in images[shard].paths for p in ('img/' + f, 'img/thumb/' + f))
        if all(exists(f) for f in names):
            return True
    return False


def reconcile_external(state, run, registry, images, code_head, read):
    """End only our claim. Unresolved tool calls keep their slot until record saves output."""
    before = encoded(state)
    for c in run['queue']:
        if c['status'] in TERMINAL:
            continue
        own = {filename(c, s): public_hash(v['image'], read) for s, v in c['slots'].items() if v.get('image')}
        own = {f: c.get('publication', {}).get('files', {}).get('img/' + f, h) for f, h in own.items()}
        published, foreign, ours = [], [], []
        for shard, store in enumerate(images):
            for p in sorted(store.paths):
                if not re.fullmatch(r'img/[^/]+\.webp', p):
                    continue
                f = p[4:]
                if not (f.startswith(c['name'] + '_') or f.startswith(c['name'].replace(' ', '_') + '_')):
                    continue
                h = digest(store.read(p))
                item = {'file': f, 'shard': shard, 'sha256': h}
                published.append(item)
                if shard >= 1 and own.get(f) == h:   # img-2 (earlier runs), img-3 or img-4 (open) — never the closed first shard
                    ours.append(f)
                else:
                    foreign.append(item)
        registered = registered_files(registry.get('img', {}).get(c['name'], {}))
        # Known own filenames with missing/stale registration remain reconciliation work,
        # never an excuse to abandon our published outputs as somebody else's work.
        foreign_registered = sorted(registered - set(own))
        if not foreign and not foreign_registered:
            c.pop('external_pending', None)
            if ours:
                c['own_publication'] = {'files': sorted(ours), 'status': 'verify_registration'}
            continue
        evidence = {'commits': {'code': code_head, **{('img' + (str(i + 1) if i else '')): s.base for i, s in enumerate(images)}},
                    'published': published, 'foreign_files': foreign, 'registered_files': sorted(registered)}
        if any(v.get('status') == 'in_flight' for v in c['slots'].values()):
            c.setdefault('external_pending', evidence)
            continue
        status = 'completed_externally' if externally_complete(c, registry, images) else 'skipped_external_partial'
        c.update(status=status, external_evidence=evidence, ended_at=now())
        c.pop('external_pending', None)
        claim = state['claims'].get(str(c['no']), {})
        if claim.get('owner') == run['owner'] and claim.get('run') == run['id']:
            claim.update(status=status, ended_at=now(), reason='external publication', evidence=evidence)
        # An intent may already have called the generator. Never refund that character.
        # Untouched claims, however, must not consume the capacity of their replacements.
        if not c['slots']:
            c['refunded_days'] = []
            for day, used in list(state['daily'].items()) + list(state.get('daily_kst', {}).items()):
                if c['no'] in used:
                    used.remove(c['no']); c['refunded_days'].append(day)
            for e in state.get('executions', {}).values():
                if c['no'] in e['characters']: e['characters'].remove(c['no'])
    if not current(run):
        run['status'] = 'complete'
    elif not any(c['status'] == 'blocked' for c in run['queue'] if c['status'] not in TERMINAL):
        run['status'] = 'active'
    return encoded(state) != before


def check_assets(state, read):
    for run in state['runs']:
        for c in run['queue']:
            for item in list(c['slots'].values()) + c.get('attempt_history', []) + c.get('replacements', []):
                for key in ['prompt', 'ui', 'image', 'qa', 'approval', 'correction_reference', 'exception', 'tool_failure']:
                    a = item.get(key)
                    if a and (not a['path'].startswith('records/automation/') or '..' in Path(a['path']).parts):
                        raise ValueError('invalid recovery artifact path')
                    if a and a.get('session_only'):
                        continue   # original kept in its session only — nothing committed to verify
                    if a and digest(read(a['path'])) != a['sha256']:
                        raise ValueError('missing/corrupt recovery artifact: ' + a['path'])


def defer_run(state, owner, reason, read):
    r = owned(state, owner)
    if not reason: raise ValueError('explicit deferral reason required')
    for c in r['queue']:
        for item in c['slots'].values():
            if item.get('status') == 'in_flight':
                if not item.get('tool_failure'): raise ValueError('unresolved in_flight; reconcile before deferral')
                f = json.loads(read(item['tool_failure']['path']))
                if f.get('terminal') is not True or f.get('output_files') != [] or f.get('code') != 'moderation_blocked':
                    raise ValueError('only confirmed terminal safety refusal may be deferred')
    r.update(status='deferred', deferred_at=now(), defer_reason=reason)
    # Preserve character state, claims, slot histories and daily ledgers verbatim.
    return r


def reopen_deferred(state, owner, card, reason, approval):
    """보류(deferred)한 실행을 명시적 승인으로 다시 연다 — 결과 파일 없이 안전 거절된 슬롯을 replan-rejected 로 다시 계획하려고.
    다른 실행이 돌고 있으면 열지 않는다(한 번에 한 실행). 캐릭터는 blocked 그대로 — 다음은 replan-rejected 뿐이다(2026-10-24 진주몽·헌테일·분홍장이)"""
    if not reason: raise ValueError('explicit reopen reason required')
    if active(state): raise ValueError('another run is active; finish or defer it before reopening a deferred run')
    a = json.loads(Path(approval).read_text()) if approval else {}
    if a.get('card') != card or not a.get('user_approval'):
        raise ValueError('explicit user approval for this card required (approval JSON: card, user_approval)')
    runs = [r for r in state['runs'] if r['status'] == 'deferred' and r['owner'] == owner and current(r) and current(r)['no'] == card]
    if len(runs) != 1: raise ValueError('exactly one deferred run of this owner for --card required')
    r = runs[0]; c = current(r)
    claim = state['claims'].get(str(card), {})
    if claim.get('owner') != owner or claim.get('run') != r['id']:
        raise ValueError('character claim does not match deferred run')
    if c['status'] != 'blocked' or not any(s.get('status') == 'rejected' and s.get('tool_failure') and not s.get('image') for s in c['slots'].values()):
        raise ValueError('deferred run has no terminal no-output rejected slot to replan')
    r.setdefault('reopen_history', []).append({'at': now(), 'reason': reason, 'deferred_at': r.get('deferred_at'),
                                               'defer_reason': r.get('defer_reason'), 'user_approval': a['user_approval']})
    r['status'] = 'blocked'
    return r


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
        if item['status'] == 'blocked_dependency' and c['slots'].get(item.get('depends_on'), {}).get('status') == 'accepted':
            return {'card': c['name'], 'no': c['no'], 'slot': slot, 'action': 'prepare_ui_then_intent',
                    'casual_session': 'image-runner-' + run['id'] + '-' + str(c['no']), 'was': item}   # 기다리던 참조가 생겼다
        if item['status'] != 'accepted':
            return {'card': c['name'], 'no': c['no'], 'slot': slot, 'action': item['status'], 'evidence': item}
    waiting = len(c.get('own_publication', {}).get('files', [])) == 9
    return {'card': c['name'], 'no': c['no'], 'action': 'verify_registration' if waiting else 'publish_images_then_verify_registration'}


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


def prepare(state, owner, available, blocked, at, execution_id=None):
    if not execution_id: raise ValueError('--execution-id required')
    migrate_policy(state)
    state['blocked_candidates'].update(blocked)
    r = active(state)
    if r:
        r = owned(state, owner)
        if r['status'] == 'blocked':
            raise ValueError('run blocked; inspect evidence and resume explicitly')
        c = current(r)
        bind_execution(state, owner, execution_id, c['no'])
        charge(state, [c['no']], at)
        return r  # Never refill an active queue.
    e = state['executions'].get(execution_id, {})
    if e.get('owner', owner) != owner: raise ValueError('execution owner mismatch')
    if len(e.get('characters', [])) >= EXECUTION_MAX: return None
    utc, kst = dates(at)
    if len(state['daily'].get(utc, [])) >= DAILY_MAX or len(state['daily_kst'].get(kst, [])) >= DAILY_MAX:
        return None
    picked = next((c for c in available if str(c['no']) not in state['claims']), None)
    if not picked: return None
    bind_execution(state, owner, execution_id, picked['no'])
    charge(state, [picked['no']], at)
    ident = utc + '-' + str(len(state['runs']) + 1)
    r = {'id': ident, 'execution_id': execution_id, 'owner': owner, 'status': 'active', 'created_at': now(), 'queue': [
        {'no': picked['no'], 'name': picked['name'], 'style': 'glossy_promo', 'status': 'claimed', 'slots': {}}]}
    state['runs'].append(r)
    state['claims'][str(picked['no'])] = {'owner': owner, 'run': ident, 'status': 'held', 'at': now()}
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
    # UI comes from the agent — tools/prompt-pack.cjs (same state code as the generator) or the generator screen — never synthesized here.
    if not Path(prompt).read_text().strip() or not isinstance(json.loads(Path(ui).read_text()), dict):
        raise ValueError('actual prompt and UI JSON required')
    refs = [] if slot == 'light' else [slot.replace('_overdrive', '') if slot.endswith('_overdrive') else 'light']
    for ref in refs:
        if c['slots'].get(ref, {}).get('status') != 'accepted':
            raise ValueError('reference not accepted')
    prefix = 'records/automation/runs/' + run['id'] + '/' + str(c['no']) + '/' + slot
    if c['slots'].get(slot, {}).get('status') == 'blocked_dependency':
        c.setdefault('block_history', []).append(dict(c['slots'][slot], slot=slot, resolved_at=now()))
    c['slots'][slot] = {'status': 'in_flight', 'at': now(), 'prompt': artifact(files, prefix, 'prompt.txt', prompt),
                        'ui': artifact(files, prefix, 'ui.json', ui),
                        'references': {ref: c['slots'][ref]['image']['sha256'] for ref in refs}}
    c['status'] = 'working'


def retry_intent(run, slot, prompt, ui, qa, approval, files):
    """Consume one explicit, hash-bound approval; preserve the rejected attempt forever."""
    c = current(run); old = c['slots'].get(slot, {})
    auth = json.loads(Path(approval).read_text())
    q = json.loads(Path(qa).read_text())
    if run['status'] != 'blocked' or c['status'] != 'blocked' or old.get('status') != 'review':
        raise ValueError('retry requires blocked QA result, never an in-flight call')
    if any(x.get('slot') == slot for x in c.get('attempt_history', [])):
        raise ValueError('one correction only; further retries are not supported')
    if (auth.get('card') != c['no'] or auth.get('slot') != slot or auth.get('max_corrections') != 1
            or auth.get('rejected_sha256') != old['image']['sha256'] or not auth.get('user_approval')):
        raise ValueError('explicit one-shot approval bound to card, slot and rejected hash required')
    if (q.get('accepted') is not False or q.get('image_sha256') != old['image']['sha256']
            or not q.get('observations') or not q.get('reviewer')):
        raise ValueError('rejected QA evidence required')
    # Validate new UI before changing the current pointer. All changes publish atomically.
    if not Path(prompt).read_text().strip() or not isinstance(json.loads(Path(ui).read_text()), dict):
        raise ValueError('actual prompt and UI required')
    prefix = 'records/automation/runs/' + run['id'] + '/' + str(c['no']) + '/' + slot
    archived = dict(old, slot=slot, status='rejected', rejection_reason=c['reason'])
    archived['qa'] = artifact(files, prefix, 'rejected-qa.json', qa)
    c.setdefault('attempt_history', []).append(archived)
    prefix += '/attempts/2'
    c['slots'][slot] = {'status': 'in_flight', 'attempt': 2, 'at': now(),
        'prefix': prefix, 'approval': artifact(files, prefix, 'approval.json', approval),
        'prompt': artifact(files, prefix, 'prompt.txt', prompt), 'ui': artifact(files, prefix, 'ui.json', ui),
        'references': dict(old['references']), 'correction_reference': old['image']}
    run['status'] = 'active'; c['status'] = 'working'



def replan_rejected(run, slot, prompt, ui, failure, approval, files):
    """One explicitly authorized new concept after a terminal no-output rejection."""
    c = current(run); old = c['slots'].get(slot, {})
    a = json.loads(Path(approval).read_text()); f = json.loads(Path(failure).read_text())
    if (run['status'] != 'blocked' or c['status'] != 'blocked'
            or old.get('status') not in ('in_flight', 'rejected') or old.get('image') or c.get('external_pending')):
        raise ValueError('requires blocked terminal no-output attempt with no external publication pending')
    if any(x.get('slot') == slot for x in c.get('attempt_history', [])):
        raise ValueError('one explicit replan only; no automated rejection loop')
    if (f.get('terminal') is not True or f.get('output_files') != []
            or f.get('code') != 'moderation_blocked' or not f.get('request_id')
            or f.get('prompt_sha256') != old['prompt']['sha256']):
        raise ValueError('terminal tool rejection bound to original prompt required')
    if (a.get('card') != c['no'] or a.get('slot') != slot or a.get('max_new_attempts') != 1
            or a.get('rejected_prompt_sha256') != old['prompt']['sha256']
            or not a.get('user_approval') or not a.get('substantive_nonsexual_changes')):
        raise ValueError('explicit scoped approval and substantive nonsexual replan required')
    if (not Path(prompt).read_text().strip() or digest(Path(prompt).read_bytes()) == old['prompt']['sha256']
            or not isinstance(json.loads(Path(ui).read_text()), dict)):
        raise ValueError('new actual UI and changed prompt required')
    prefix = 'records/automation/runs/' + run['id'] + '/' + str(c['no']) + '/' + slot
    archived = dict(old, slot=slot, status='tool_rejected_no_output', rejection_reason=c['reason'])
    archived['tool_failure'] = artifact(files, prefix, 'tool-failure.json', failure)
    c.setdefault('attempt_history', []).append(archived)
    prefix += '/attempts/2'
    auth = artifact(files, prefix, 'approval.json', approval)
    c['slots'][slot] = {'status': 'in_flight', 'attempt': 2, 'at': now(), 'prefix': prefix,
        'approval': auth, 'prompt': artifact(files, prefix, 'prompt.txt', prompt),
        'ui': artifact(files, prefix, 'ui.json', ui), 'references': dict(old['references'])}
    c.setdefault('block_history', []).append({'reason': c['reason'], 'resolved_by': auth})
    run['status'] = 'active'; c['status'] = 'working'


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
    prefix = item.get('prefix', prefix)
    item.update(status='review', image=keep_original(prefix, 'original' + ext, image), received_at=now())


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
    prefix = item.get('prefix', prefix)
    item.update(status='accepted', qa=artifact(files, prefix, 'qa.json', qa))


def accept_exception(run, slot, approval, files):
    c = current(run); item = c['slots'].get(slot, {})
    a = json.loads(Path(approval).read_text())
    if run['status'] != 'blocked' or c['status'] != 'blocked' or item.get('status') != 'review':
        raise ValueError('exception requires a blocked, preserved QA result')
    if (a.get('card') != c['no'] or a.get('slot') != slot
            or a.get('image_sha256') != item['image']['sha256']
            or not a.get('message_id') or not a.get('user_approval')):
        raise ValueError('explicit exception must identify card, slot, exact hash and user message')
    prefix = item.get('prefix', 'records/automation/runs/' + run['id'] + '/' + str(c['no']) + '/' + slot)
    audit = dict(a, qa_passed=False, prior_block_reason=c['reason'], accepted_at=now())
    data = encoded(audit); path = prefix + '/user-exception.json'; files[path] = data
    item.update(status='accepted', acceptance_basis='user_exception', qa_passed=False,
                exception={'path': path, 'sha256': digest(data)})
    c.setdefault('block_history', []).append({'reason': c['reason'], 'resolved_by': item['exception']})
    c['status'] = 'working'; run['status'] = 'active'


def effective_slot(c, slot):
    matches = [x for x in c.get('replacements', []) if x['slot'] == slot]
    return matches[-1] if matches else c['slots'][slot]


def append_completed_replacement(state, run_id, card, slot, item, approval, read):
    """Append an authorized current-image overlay; original completion is immutable."""
    run = next(r for r in state['runs'] if r['id'] == run_id)
    c = next(c for c in run['queue'] if c['no'] == card)
    if run['status'] != 'complete' or c['status'] != 'complete' or slot != 'casual3':
        raise ValueError('replacement requires completed run/card and explicit casual3 scope')
    old = effective_slot(c, slot)
    old_hash = public_hash(old['image'], read)
    public = 'img/' + filename(c, slot)
    if (approval.get('card') != card or approval.get('slot') != slot or not approval.get('user_approval')
            or approval.get('old_public_sha256') != old_hash or digest(read(public)) != old_hash):
        raise ValueError('replacement approval or current public bytes do not match')
    qa = json.loads(read(item['qa']['path']))
    if (qa.get('accepted') is not True or qa.get('image_sha256') != item['image']['sha256']
            or not qa.get('observations') or not qa.get('diversity_comparison') or not qa.get('reviewer')):
        raise ValueError('replacement requires actual accepted image and diversity QA')
    source = image_bytes(item['image'], read)
    if digest(source) != item['image']['sha256']:
        raise ValueError('replacement source hash mismatch')
    entry = dict(item, slot=slot, status='accepted', replaced_at=now(),
                 previous_public_sha256=old_hash,
                 public_sha256=digest(webp(source)),
                 original_completed_at=c['completed_at'])
    c.setdefault('replacements', []).append(entry)
    return public, webp(source)


def verify_completed(state, images, code):
    """Read-only verification of effective images, retaining historical completion."""
    checked = []
    for run in state['runs']:
        for c in run['queue']:
            if c['status'] != 'complete': continue
            shadow = copy.deepcopy(state)
            r = next(x for x in shadow['runs'] if x['id'] == run['id'])
            cc = next(x for x in r['queue'] if x['no'] == c['no'])
            cc['slots'] = {slot: effective_slot(c, slot) for slot in SLOTS}
            cc['status'] = 'working'
            r['queue'] = [cc]
            complete(r, shadow, images, code)
            checked.append(c['no'])
    return checked


def complete(run, state, images, code, read=None):
    """images: one store (legacy single shard) or the shard stores in IMAGE_REPOS order; read: records (img-2)."""
    from PIL import Image
    shards = images if isinstance(images, (list, tuple)) else None
    read = read or (shards[1].read if shards else images.read)
    c = current(run)
    if next_step(run)['action'] not in ('publish_images_then_verify_registration', 'verify_registration'):
        raise ValueError('all nine slots require accepted QA before completion')
    registry = json.loads(code.read('data/img.json'))
    entry = registry.get('img', {}).get(c['name'], {}).get('byStyle', {}).get(c['style'], {})
    outputs = {}
    for slot in SLOTS:
        expected = public_hash(c['slots'][slot]['image'], read)
        if slot.startswith('casual'):
            filename = c['name'] + '_' + c['style'] + '_f_' + slot + '.webp'
            registered = filename in entry.get('casual', {}).get('f', [])
        else:
            filename = c['name'] + '_' + slot + '_' + c['style'] + '_f.webp'
            registered = entry.get('byForm', {}).get(slot, {}).get('f') == filename
        shard = registry.get('where', {}).get(filename, 0)
        if not registered or shard < 1 or (shards and shard >= len(shards)):
            raise ValueError('registration pending: ' + filename)
        pub = shards[shard] if shards else images
        if digest(pub.read('img/' + filename)) != expected:
            raise ValueError('published bytes differ from preserved source conversion: ' + filename)
        with Image.open(io.BytesIO(pub.read('img/thumb/' + filename))) as thumb:
            thumb.load()
            if max(thumb.size) != 512: raise ValueError('thumbnail invalid')
        outputs[slot] = {'file': filename, 'sha256': expected, 'shard': shard}
    c.update(status='complete', outputs=outputs, image_commit=pub.base, registration_commit=code.base, completed_at=now())
    state['claims'][str(c['no'])]['status'] = 'complete'
    if current(run) is None:
        run['status'] = 'complete'


def prepare_publication(run, read):
    if next_step(run)['action'] != 'publish_images_then_verify_registration':
        raise ValueError('publication requires all nine accepted slots')
    c = current(run)
    c['publication'] = {'status': 'preflight_checked', 'at': now(), 'repository': IMAGE_REPOS[-1],
                        'files': {'img/' + filename(c, s): public_hash(c['slots'][s]['image'], read) for s in SLOTS}}


def assert_heads(stores):
    # There is no cross-repository atomic transaction. Recheck other snapshots just
    # before the img-2 fast-forward push, whose parent also protects all image writes.
    for store in stores:
        head = git(store.repo, 'ls-remote', 'origin', 'refs/heads/main').decode().split()[0]
        if head != store.base:
            raise RuntimeError('remote snapshot changed; rerun reconciliation before any generation or upload')


def restore(state, read, target):
    root = Path(target)
    for r in state['runs']:
        for c in r['queue']:
            for item in list(c['slots'].values()) + c.get('attempt_history', []) + c.get('replacements', []):
                for key in ['prompt', 'ui', 'image', 'qa', 'approval', 'correction_reference', 'exception', 'tool_failure']:
                    a = item.get(key)
                    if not a or a.get('session_only'):
                        continue   # session-only originals were never committed — nothing to restore
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


def shard_stores(store):
    """Stores in IMAGE_REPOS order; store is img-2 (state). The open (last) repository must be cloned too."""
    for n in IMAGE_REPOS:
        if n != IMAGE_REPOS[1] and not (ROOT.parent / n).is_dir():
            raise ValueError(n + ' must be cloned next to pkm-atelier' + (' (open image repository)' if n == IMAGE_REPOS[-1] else ''))
    return [store if i == 1 else Store(ROOT.parent / n) for i, n in enumerate(IMAGE_REPOS)]


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


_LEDGER = None


def ledger_tool():
    """tools/casual-ledger.py — 예약 도장 셈을 한 곳에 둔다(한 번만 싣는다)"""
    global _LEDGER
    if _LEDGER is None:
        import importlib.util
        spec = importlib.util.spec_from_file_location('casual_ledger', Path(__file__).resolve().with_name('casual-ledger.py'))
        _LEDGER = importlib.util.module_from_spec(spec); spec.loader.exec_module(_LEDGER)
    return _LEDGER


def guard_external(store, run, slot):
    c = current(run)
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
        # 도장 — reserve(check 통과) 가 적은 그대로인가. 손으로 쓰거나 고친 예약은 남과 같은 장면을 받아도 막을 것이 없었다(2026-10-25 히포포타스·레지스틸)
        why = ledger_tool().stamp_problem(mine.get('session'), next(ch for ch in mine['characters'] if ch['card'] == c['name']))
        if why:
            raise ValueError('casual reservation was not written by the planner (' + why + '); replan with tools/casual-plan.cjs --reserve --push')


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('command', choices=['defer-run', 'reopen-deferred', 'migrate-policy', 'status', 'prepare', 'next', 'intent', 'record', 'adopt-pilot', 'retry-intent', 'replan-rejected', 'accept-exception', 'review', 'prepublish', 'complete', 'block', 'resume', 'restore', 'verify-completed'])
    ap.add_argument('--execution-id', default=os.environ.get('PKM_EXECUTION_ID'))
    ap.add_argument('--owner', default='pkm-daily')
    ap.add_argument('--repo', default=str(ROOT.parent / 'pkm-atelier-img-2'))
    ap.add_argument('--slot', choices=SLOTS)
    ap.add_argument('--card', type=int, help='required dex number for image/QA operations; prevents stale UI applying to a replacement')
    for key in ['prompt', 'ui', 'image', 'qa', 'reason', 'dir', 'pilot-checkpoint', 'approval', 'failure']:
        ap.add_argument('--' + key)
    a = ap.parse_args()
    store = Store(a.repo); state = store.state(); files = {}
    check_assets(state, store.read)
    if a.command == 'restore':
        if not a.dir:
            raise ValueError('--dir required')
        restore(state, store.read, a.dir)
        print('committed artifacts restored and hash verified; session_only originals require the existing local cache, otherwise STOP and report')
        return
    if a.command == 'verify-completed':
        print(json.dumps({'verified_completed': verify_completed(state, shard_stores(store), Store(ROOT))}))
        return
    if a.command == 'status':
        r = active(state)
        print(json.dumps({'head': store.base, 'run': r, 'next': next_step(r) if r else 'prepare',
                          'external_holds': state['external_holds'], 'policy': state['policy'], 'daily': state['daily'],
                          'daily_kst': state.get('daily_kst', {}), 'executions': state.get('executions', {})}, ensure_ascii=False, indent=2))
        return
    before = encoded(state)
    migrate_policy(state)
    if a.command == 'migrate-policy':
        commit = store.publish(state, {}, 'Image runner: 12 daily / 1 per execution policy') if encoded(state) != before else None
        print(json.dumps({'commit': commit, 'policy': state['policy']}))
        return
    if not a.execution_id: raise ValueError('--execution-id or PKM_EXECUTION_ID required')
    state['policy']['external_publication'] = 'skip_after_preserving_in_flight_result'
    state['policy']['image_operations_require_card'] = True
    code = Store(ROOT); shards = shard_stores(store); opened = shards[-1]
    data = remote_inputs(code, shards)
    if a.command == 'reopen-deferred':
        if a.card is None: raise ValueError('--card required')
        reopen_deferred(state, a.owner, a.card, a.reason, a.approval)
    run = active(state)
    if run:
        run = owned(state, a.owner)
    previous = current(run)['no'] if run and current(run) else None
    if a.command in ('intent', 'record', 'adopt-pilot', 'retry-intent', 'replan-rejected', 'accept-exception', 'review', 'prepublish', 'complete'):
        if a.card is None or a.card != previous:
            raise ValueError('--card must match the current dex number; read next and prepare its actual UI')
    # record must always preserve the pending tool result BEFORE retiring its claim.
    recorded = a.command == 'record'
    if recorded:
        if not run: raise ValueError('no pending run')
        record(run, a.slot, a.image, files)
    read = lambda p: files[p] if p in files else store.read(p)
    if run:
        reconcile_external(state, run, data[1], shards, code.base, read)
    for card in data[0]:
        reservation = data[4].get(card['name'])
        claim = state['claims'].get(str(card['no']))
        own_session = 'image-runner-' + claim['run'] + '-' + str(card['no']) if claim else None
        if reservation and reservation.get('session') != own_session:
            state['external_holds'][str(card['no'])] = {'card': card['name'], **reservation}
    available, blocked = candidates(*data, state)
    state['blocked_candidates'].update(blocked)
    after = current(run)['no'] if run and current(run) else None
    switched = previous != after
    operation = a.command
    if a.command == 'defer-run':
        if a.card != previous: raise ValueError('--card must match deferred character')
        defer_run(state, a.owner, a.reason, read)
    elif a.command == 'reopen-deferred':
        bind_execution(state, a.owner, a.execution_id, a.card)   # 오늘 몫(일일 상한)은 replan-rejected 가 센다
    elif a.command in ('prepare', 'next') or switched:
        # Single finite candidate scan. Never apply an old card's UI/QA to a replacement.
        run = prepare(state, a.owner, available, blocked, now(), a.execution_id)
        operation = 'reconciled_external_skip' if switched else a.command
    elif not recorded:
        run = owned(state, a.owner)
        bind_execution(state, a.owner, a.execution_id, current(run)['no'])
        if a.command in ('intent', 'retry-intent', 'replan-rejected', 'adopt-pilot'):
            charge(state, [current(run)['no']], now())
            # Actual reference bytes must exist before recording any new tool intent.
            for item in current(run)['slots'].values():
                if item.get('image'): image_bytes(item['image'], store.read)
        if run['status'] == 'blocked' and a.command not in ('resume', 'retry-intent', 'replan-rejected', 'accept-exception'):
            raise ValueError('run blocked; no generation until explicitly resolved')
        if a.command == 'intent':
            if not a.slot: raise ValueError('--slot required')
            guard_external(store, run, a.slot)
            intent(run, a.slot, a.prompt, a.ui, files)
        elif a.command == 'accept-exception':
            accept_exception(run, a.slot, a.approval, files)
        elif a.command == 'replan-rejected':
            guard_external(store, run, a.slot)
            replan_rejected(run, a.slot, a.prompt, a.ui, a.failure, a.approval, files)
        elif a.command == 'retry-intent':
            guard_external(store, run, a.slot)
            retry_intent(run, a.slot, a.prompt, a.ui, a.qa, a.approval, files)
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
        elif a.command == 'review': review(run, a.slot, a.qa, files)
        elif a.command == 'prepublish': prepare_publication(run, store.read)
        elif a.command == 'complete': complete(run, state, shards, code, read)
        elif a.command == 'block':
            if not a.reason: raise ValueError('--reason required')
            run['status'] = 'blocked'; current(run).update(status='blocked', reason=a.reason)
        elif a.command == 'resume':
            if not a.reason: raise ValueError('resolution --reason required')
            if run['status'] != 'blocked': raise ValueError('not blocked')
            run['status'] = 'active'; current(run).update(status='working', resolution=a.reason)
    commit = None
    if encoded(state) != before or files:
        if run: run['updated_at'] = now()
        assert_heads([*shards, code])
        commit = store.publish(state, files, 'Image runner: ' + operation)
    print(json.dumps({'commit': commit, 'operation': operation,
                      'intent_recorded': operation in ('intent', 'retry-intent', 'replan-rejected'),
                      'upload_base': opened.base if operation == 'prepublish' else None,
                      'next': next_step(run) if run else {'action': 'idle', 'reason': 'no daily capacity or eligible candidates'}}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError, RuntimeError, OSError, subprocess.CalledProcessError) as exc:
        raise SystemExit('STOP: ' + str(exc))
