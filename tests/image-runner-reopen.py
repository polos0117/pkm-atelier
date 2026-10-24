"""보류한 실행 다시 열기 — reopen-deferred → replan-rejected → 기다리던 개방 슬롯. python3 tests/image-runner-reopen.py
   (2026-10-24 진주몽·헌테일·분홍장이: 세 실행이 deferred 라 replan-rejected 가 받을 활성 실행이 없었다)"""
import importlib.util, json, tempfile
from pathlib import Path
s = importlib.util.spec_from_file_location('R', Path(__file__).resolve().parents[1] / 'tools/image-runner.py'); R = importlib.util.module_from_spec(s); s.loader.exec_module(R)


def rejects(f, why):
    try:
        f()
    except ValueError:
        return
    raise AssertionError('unsafe: ' + why)


tmp = Path(tempfile.mkdtemp())
def w(name, obj):
    (tmp / name).write_text(obj if isinstance(obj, str) else json.dumps(obj))
    return str(tmp / name)


a = {'policy': {}, 'daily': {}, 'runs': [], 'claims': {}, 'blocked_candidates': {}, 'external_holds': {}}
r = R.prepare(a, 'worker', [{'no': 366, 'name': '진주몽'}], {}, '2026-10-24T02:00:00Z', 'e1'); c = r['queue'][0]
for k in ('light', 'heavy', 'light_overdrive', 'heavy_overdrive', 'casual1', 'casual2', 'casual3'):
    c['slots'][k] = {'status': 'accepted', 'image': {'path': 'x/' + k, 'sha256': k}}
old_prompt = w('old.txt', 'old prompt')
c['slots']['mobility'] = {'status': 'rejected', 'prompt': {'path': 'p', 'sha256': R.digest(Path(old_prompt).read_bytes())}, 'ui': {'path': 'u', 'sha256': 'u'},
                          'references': {'light': 'light'}, 'tool_failure': {'path': 'records/f.json', 'sha256': 'f'}}
c['slots']['mobility_overdrive'] = {'status': 'blocked_dependency', 'depends_on': 'mobility', 'reason': 'mobility rejected'}
c.update(status='blocked', reason='mobility terminal safety refusal'); r['status'] = 'blocked'
r.update(status='deferred', deferred_at='2026-10-24T02:10:00Z', defer_reason='keep partial')
assert R.active(a) is None

approval = w('reopen.json', {'card': 366, 'user_approval': '빠진 컷 다시 계획해 채워 줘'})
other = R.prepare(a, 'worker', [{'no': 369, 'name': '시라칸'}], {}, '2026-10-24T08:00:00Z', 'e2')
rejects(lambda: R.reopen_deferred(a, 'worker', 366, 'refill', approval), '다른 실행이 돌고 있는데 열었다')
other['status'] = 'complete'; other['queue'][0]['status'] = 'complete'
rejects(lambda: R.reopen_deferred(a, 'worker', 366, '', approval), '까닭 없이 열었다')
rejects(lambda: R.reopen_deferred(a, 'worker', 366, 'refill', w('bad.json', {'card': 367, 'user_approval': 'x'})), '다른 카드 승인으로 열었다')
rejects(lambda: R.reopen_deferred(a, 'other', 366, 'refill', approval), '다른 주인이 열었다')
R.reopen_deferred(a, 'worker', 366, 'refill', approval)
assert R.active(a) is r and r['status'] == 'blocked' and c['status'] == 'blocked' and r['reopen_history'][0]['defer_reason'] == 'keep partial'
assert R.next_step(r)['action'] == 'blocked'

# 다시 계획 — deferred 가 남긴 'rejected' 슬롯도 받는다. 한 번뿐
failure = w('failure.json', {'terminal': True, 'output_files': [], 'code': 'moderation_blocked', 'request_id': 'req', 'prompt_sha256': c['slots']['mobility']['prompt']['sha256']})
ok = w('approval.json', {'card': 366, 'slot': 'mobility', 'rejected_prompt_sha256': c['slots']['mobility']['prompt']['sha256'], 'max_new_attempts': 1,
                         'user_approval': '빠진 컷 다시 계획해 채워 줘', 'substantive_nonsexual_changes': '선택 연출 없음 → striding · eye-level 3/4 전신'})
files = {}
R.replan_rejected(r, 'mobility', w('new.txt', 'new prompt'), w('ui.json', {'storage': {}}), failure, ok, files)
assert r['status'] == 'active' and c['slots']['mobility']['status'] == 'in_flight' and c['slots']['mobility']['attempt'] == 2
assert c['attempt_history'][0]['status'] == 'tool_rejected_no_output' and any(p.endswith('attempts/2/approval.json') for p in files)
rejects(lambda: R.replan_rejected(r, 'mobility', w('new2.txt', 'again'), w('ui2.json', {}), failure, ok, {}), '두 번 다시 계획했다')

# 기다리던 개방 슬롯 — 고기동이 받아들여지면 다음 차례로 열린다
assert R.next_step(r)['slot'] == 'mobility' and R.next_step(r)['action'] == 'in_flight'
c['slots']['mobility'].update(status='accepted', image={'path': 'x/m', 'sha256': 'm'})
step = R.next_step(r)
assert step['slot'] == 'mobility_overdrive' and step['action'] == 'prepare_ui_then_intent', step
R.intent(r, 'mobility_overdrive', w('od.txt', 'overdrive prompt'), w('odui.json', {'storage': {}}), {})
assert c['slots']['mobility_overdrive']['status'] == 'in_flight' and c['slots']['mobility_overdrive']['references'] == {'mobility': 'm'}
assert c['block_history'][-1]['status'] == 'blocked_dependency'
print('PASS reopen deferred: one run at a time · explicit card approval · owner · rejected slot replans once · dependency slot opens after its reference')
