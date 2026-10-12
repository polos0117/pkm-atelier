#!/usr/bin/env python3
"""종별 얼굴 설계 — data/face-design.json 을 만들고 검사하고 docs/CHARACTER_FACE_DESIGNS.md 를 그린다.

    python3 tools/face-design.py build [--seed-doc <옛 설계표.md>]   # 고르고 겹침을 풀어 json 을 쓴다
    python3 tools/face-design.py render                             # json → 설계표 문서
    python3 tools/face-design.py --check                            # 쓰지 않고 규칙만 본다(검사가 부른다)

값은 생성기의 얼굴 항목(lib/prompt-spec.js 의 PARAM_DEFS, group face)의 열쇠 그대로다 — 생성기가 그대로 싣는다.
고르는 법은 무작위가 아니다. 원작 외형 단서(data/source-appearance.json 의 특징 문장·몸 형태)와 카드 자료
(키·무게·타입)에 낱말 표(CUES)로 점수를 주고, 앞선 값(직접 쓴 설계 또는 이 json 의 이전 값)에 가산점을 준다.
그다음 정해진 차례(도감 번호)로 겹침을 푼다:
  - 같은 진화 계열끼리는 얼굴 다섯 묶음(윤곽·눈·눈썹·코·입) 가운데 셋 이상이 달라야 한다.
  - 1,025종 어느 둘도 다섯 묶음 가운데 넷 이상이 같으면 안 된다(둘 이상 다르다).
겹치면 점수를 가장 적게 잃는 다음 후보로 옮기고, 무엇을 왜 옮겼는지 adjusted 에 적는다.
"""
import argparse, heapq, json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
DATA = os.path.join(ROOT, 'data', 'face-design.json')
DOC = os.path.join(ROOT, 'docs', 'CHARACTER_FACE_DESIGNS.md')

GROUPS = [('윤곽', ['face shape', 'face length', 'face width', 'jaw & chin']),
          ('눈', ['eye shape', 'eye size', 'eye tilt', 'eye spacing']),
          ('눈썹', ['eyebrows']), ('코', ['nose character']), ('입', ['lips'])]
LINE_MIN, GLOBAL_MIN = 3, 2      # 계열 안·전체에서 달라야 할 묶음 수

BASE = {'face shape': {'oval': .3}, 'face length': {'balanced': .4}, 'face width': {'medium': .4},
        'jaw & chin': {'balanced jawline': .3}, 'eye shape': {'almond': .3}, 'eye size': {'medium': .5},
        'eye tilt': {'level outer corners': .5}, 'eye spacing': {'average eye spacing': .6},
        'eyebrows': {'straight medium brows': .3}, 'nose character': {'balanced nose': .3}, 'lips': {'medium lips': .3}}

# 낱말 표 — (정규식, 사람이 읽는 단서 이름, {항목: {값: 점수}}). 특징 문장 하나에 걸리면 그 문장을 단서로 적는다
R, A, L = 'softly rounded', 'angular', 'elongated'
CUES = [
    (r'\b(round|rounded|spherical|ball|orb|ovoid|plump|chubby|pudgy|fluffy|puffy|fuzzy|egg|blob|bubble|cotton|pillow|bulbous|puff|soft|dumpling|bun)\b', '둥글고 말랑한 체적',
     {'face shape': {R: 2, 'compact': 1}, 'face length': {'short': 1}, 'face width': {'wide': .8}, 'jaw & chin': {'soft rounded jaw': 2, 'receding soft chin': .8},
      'eye shape': {'large': .8}, 'nose character': {'rounded soft tip': 1.5, 'short nose with upturned tip': .8}, 'lips': {'full lips': .6, 'small mouth': .6},
      'eyebrows': {'short rounded brows': 1.5, 'fine soft arches': .6}}),
    (r'\b(sharp|spike|spikes|spiky|blade|blades|claw|claws|horn|horns|angular|crystal|crystalline|rock|rocky|stone|boulder|metal|metallic|steel|iron|plate|plates|geometric|triangular|diamond|square|rectangular|polyhedral|jagged|serrated|faceted|cube)\b', '단단한 면·뾰족한 선',
     {'face shape': {A: 2, 'sharp': 1.2}, 'jaw & chin': {'angular defined jaw': 2, 'square broad jaw': .8}, 'eye shape': {'sharp': 1, 'narrow': .6},
      'eye tilt': {'upturned outer corners': .6}, 'eyebrows': {'angled brows': 1.5, 'thick low brows': .6}, 'nose character': {'prominent defined nose': .8, 'straight slender bridge': .6},
      'lips': {'thin lips': .8, 'straight even lips': .8}}),
    (r'\b(long|elongated|slender|thin|serpent|serpentine|snake|eel|neck|tubular|whip|ribbon|ribbons|streamer|streamers|lanky|willowy|stalk)\b', '길게 흐르는 선',
     {'face shape': {L: 2}, 'face length': {'long': 2}, 'face width': {'narrow': 1}, 'jaw & chin': {'long chin with defined jaw': 1.6, 'narrow tapered chin': .8},
      'eye shape': {'almond': .8}, 'nose character': {'straight slender bridge': 1, 'long nose with low tip': .8}, 'eyebrows': {'long arched brows': 1, 'thin straight brows': .6}}),
    (r'\bhooked beak\b|\bhooked\b', '굽은 부리', {'nose character': {'aquiline nose with convex bridge': 3}, 'eye shape': {'sharp': .8}, 'eyebrows': {'angled brows': .8}}),
    (r'\b(flat|wide|broad|duck|bill)\b[^,;]*\b(beak|bill)\b|\bbill\b', '넓고 납작한 부리', {'nose character': {'broad low bridge': 2.5}, 'lips': {'wide mouth': 1.5}}),
    (r'\bbeak\b', '부리', {'nose character': {'prominent defined nose': 1.5, 'straight slender bridge': .8}, 'lips': {'small mouth': .8, 'thin lips': .5}, 'eye tilt': {'upturned outer corners': .5}}),
    (r'\b(long|pointed|thin)\b[^,;]*\bsnout\b', '길고 뾰족한 주둥이', {'nose character': {'long nose with low tip': 2.2, 'prominent defined nose': .8}, 'face length': {'long': .6}}),
    (r'\b(short|blunt|flat|stubby)\b[^,;]*\bsnout\b', '짧고 뭉툭한 주둥이', {'nose character': {'short nose with upturned tip': 1.8, 'broad low bridge': 1}}),
    (r'\b(round|rounded)\b[^,;]*\bsnout\b', '둥근 주둥이', {'nose character': {'rounded soft tip': 2}}),
    (r'\b(small|tiny)\b[^,;]*\bnose\b', '작은 코', {'nose character': {'small delicate nose': 2.5}}),
    (r'\b(large|big|bulbous|round)\b[^,;]*\bnose\b', '크고 둥근 코', {'nose character': {'rounded soft tip': 2, 'broad low bridge': 1}}),
    (r'\b(pointed|sharp|sharply)\b[^,;]*\bnose\b', '뾰족한 코', {'nose character': {'prominent defined nose': 2, 'straight slender bridge': 1}}),
    (r'\b(wide|large|enormous|gaping|huge|big|broad)\b[^,;]*\bmouth\b', '큰 입', {'lips': {'wide mouth': 3}, 'jaw & chin': {'wide heavy chin': .6}}),
    (r'\b(small|tiny|little)\b[^,;]*\bmouth\b', '작은 입', {'lips': {'small mouth': 3}}),
    (r'\b(smile|smiling|upturned)\b[^,;]*\bmouth\b|\bsmile\b', '웃는 입', {'lips': {'bow-shaped upper lip': 2.5}}),
    (r'\b(pointed|puckered|pucker|tubular|pursed)\b[^,;]*\b(mouth|beak|lips?)\b', '오므린 입', {'lips': {'fuller lower lip': 1.5, 'full lips': 1, 'small mouth': .6}}),
    (r'\b(prominent|large|puffy|swollen|thick|big)\b[^,;]*\blips?\b', '도톰한 입술', {'lips': {'full lips': 3, 'fuller lower lip': 1}}),
    (r'\bthin lips?\b', '얇은 입술', {'lips': {'thin lips': 3}}),
    (r'\b(powerful|large|strong|well-developed|protruding|heavy)\b[^,;]*\bjaws?\b', '힘센 턱', {'jaw & chin': {'wide heavy chin': 2, 'square broad jaw': 2}, 'face width': {'wide': .6}}),
    (r'\b(oversized|large|buck)\b[^,;]*\b(front )?teeth\b', '큰 앞니', {'lips': {'fuller lower lip': 1.2, 'bow-shaped upper lip': .8}, 'nose character': {'short nose with upturned tip': .5}}),
    (r'\b(fang|fangs|sharp teeth|pointed teeth|serrated)\b', '송곳니', {'jaw & chin': {'angular defined jaw': .8}, 'lips': {'straight even lips': .8}}),
    (r'\b(large|big|huge|saucer|saucer-like|enormous|wide)\b[^,;]*\beyes?\b', '큰 눈', {'eye shape': {'large': 2}, 'eye size': {'large': 2.5}}),
    (r'\b(small|tiny|beady|dot|dot-like|pinpoint)\b[^,;]*\b(eyes?|pupils?)\b', '작은 눈', {'eye size': {'small': 2.5}, 'eye shape': {'narrow': .6}}),
    (r'\b(narrow|slit|slit-like|squinting|thin)\b[^,;]*\b(eyes?|pupils?)\b|\bslit-pupil\b', '가는 눈', {'eye shape': {'narrow': 2.5}, 'eye size': {'small': .5}}),
    (r'\b(triangular|angular|slanted|sharp|glaring|fierce|menacing|stern|angry)\b[^,;]*\beyes?\b', '날카로운 눈', {'eye shape': {'sharp': 2.2}, 'eye tilt': {'upturned outer corners': 2}, 'eyebrows': {'angled brows': .8}}),
    (r'\balmond\b', '아몬드 눈', {'eye shape': {'almond': 3}}),
    (r'\b(heavy-lidded|sleepy|sleepy-looking|lazy|tired|tired-looking|droopy|drooping|half-closed|vacant|dull)\b', '졸린 눈', {'eye shape': {'drooping': 3}, 'eye tilt': {'downturned outer corners': 2.5}}),
    (r'\b(round|circular|oval|oval-shaped)\b[^,;]*\beyes?\b', '둥근 눈', {'eye shape': {'large': 1.2}, 'eye tilt': {'level outer corners': .8}}),
    (r'\b(sides? of (its|the) head|side-facing|on either side)\b', '옆으로 붙은 눈', {'eye spacing': {'wide-set eyes': 3}}),
    (r'\b(single|one|cyclopean)\b[^,;]*\beye\b', '외눈', {'eye spacing': {'close-set eyes': 1.5}}),
    (r'\b(bushy|thick|prominent|large|heavy)\b[^,;]*\b(eye)?brows?\b', '굵은 눈썹', {'eyebrows': {'thick low brows': 2.5, 'feathered full brows': 1.5}}),
    (r'\b(curly|fluffy|feathery|tufted)\b[^,;]*\b(eye)?brows?\b', '숱 많은 눈썹', {'eyebrows': {'feathered full brows': 3}}),
    (r'\b(mane|tuft|tufts|ruff|fluff|plume|plumes|fur collar)\b', '갈기·깃털 다발', {'eyebrows': {'feathered full brows': 1}}),
    (r'\b(dome-shaped|dome|round|spherical)\b[^,;]*\bhead\b', '둥근 머리', {'face shape': {R: 1}, 'face width': {'wide': .6}}),
    (r'\b(triangular|pointed|wedge)\b[^,;]*\bhead\b', '뾰족한 머리', {'face shape': {'heart-shaped': 1.2, 'sharp': .8}, 'jaw & chin': {'narrow tapered chin': 1}}),
    (r'\b(small|tiny)\b[^,;]*\bhead\b', '작은 머리', {'face shape': {'compact': 1}}),
    (r'\b(flat|flattened)\b[^,;]*\bface\b', '납작한 얼굴', {'nose character': {'broad low bridge': 1.5}, 'face width': {'wide': .8}}),
    (r'\b(heart|heart-shaped)\b', '하트 모양', {'face shape': {'heart-shaped': 2}, 'lips': {'bow-shaped upper lip': 1}}),
    (r'\b(ears?)\b[^,;]*\b(droop|drooping|floppy|hanging|lop)\b|\b(droop|drooping|floppy|lop)\b[^,;]*\bears?\b', '처진 귀', {'eye tilt': {'downturned outer corners': 1.2}, 'eyebrows': {'short rounded brows': .6}}),
    (r'\b(pointed|tall|long)\b[^,;]*\bears?\b', '선 귀', {'eye tilt': {'upturned outer corners': .8}, 'eyebrows': {'long arched brows': .6}}),
]
BODY_CUES = 3   # CUES 의 앞 셋(둥근·단단한·긴)은 몸 전체의 결
BODY_PARTS = {'body', 'head', 'face', 'skin', 'fur', 'shell', 'crest', 'horn', 'spike', 'spine', 'plate', 'mane', 'neck', 'carapace', 'hide',
              'coat', 'feather', 'scale', 'armor', 'structure', 'frame', 'core', 'torso', 'chest', 'belly', 'shape', 'form', 'protrusion', 'ridge', 'cap', 'helmet'}
SHAPE = {
    'ball': ('몸 형태 ball', {'face shape': {R: 2, 'compact': 1}, 'face length': {'short': 1.2}, 'jaw & chin': {'soft rounded jaw': 1.5}, 'eye size': {'large': .6}, 'eye spacing': {'wide-set eyes': .8}}),
    'blob': ('몸 형태 blob', {'face shape': {R: 1.5}, 'jaw & chin': {'receding soft chin': 1.5, 'soft rounded jaw': .8}, 'lips': {'full lips': .6}, 'eye spacing': {'wide-set eyes': .6}}),
    'squiggle': ('몸 형태 squiggle', {'face shape': {L: 2}, 'face length': {'long': 1.5}, 'face width': {'narrow': 1}}),
    'fish': ('몸 형태 fish', {'eye spacing': {'wide-set eyes': 2}, 'face shape': {'oval': .8}, 'lips': {'fuller lower lip': .6}}),
    'arms': ('몸 형태 arms', {'jaw & chin': {'balanced jawline': .6}}),
    'upright': ('몸 형태 upright', {'face shape': {'oval': .6}}),
    'legs': ('몸 형태 legs', {'face width': {'narrow': .6}, 'eye spacing': {'close-set eyes': .6}}),
    'quadruped': ('몸 형태 quadruped', {'eye spacing': {'wide-set eyes': .8}, 'nose character': {'balanced nose': .4}}),
    'wings': ('몸 형태 wings', {'eye tilt': {'upturned outer corners': 1}, 'nose character': {'straight slender bridge': .6}, 'eye spacing': {'close-set eyes': .6}}),
    'tentacles': ('몸 형태 tentacles', {'face shape': {'heart-shaped': 1}, 'eye shape': {'drooping': .6}, 'lips': {'small mouth': .8}}),
    'heads': ('몸 형태 heads', {'eye spacing': {'close-set eyes': 1}, 'face width': {'narrow': .6}}),
    'humanoid': ('몸 형태 humanoid', {'face shape': {'oval': .4}, 'nose character': {'balanced nose': .4}}),
    'bug-wings': ('몸 형태 bug-wings', {'face shape': {'heart-shaped': 1.2}, 'eye size': {'large': .8}, 'jaw & chin': {'narrow tapered chin': 1}}),
    'armor': ('몸 형태 armor', {'face shape': {A: 1.2}, 'jaw & chin': {'square broad jaw': 1.5}, 'eyebrows': {'thick low brows': .8}}),
}
TYPE = {
    'fairy': {'face shape': {'heart-shaped': .8}, 'lips': {'bow-shaped upper lip': .8}, 'eyebrows': {'fine soft arches': .8}, 'eye size': {'large': .5}},
    'psychic': {'eye shape': {'almond': .6}, 'eyebrows': {'thin straight brows': .8}, 'nose character': {'straight slender bridge': .4}},
    'ghost': {'eye shape': {'drooping': .6}, 'face width': {'narrow': .5}, 'lips': {'small mouth': .5}},
    'dragon': {'face shape': {A: .6, 'sharp': .4}, 'eyebrows': {'angled brows': .8}, 'face length': {'long': .5}},
    'fighting': {'jaw & chin': {'square broad jaw': .8}, 'eyebrows': {'thick low brows': .8}, 'face width': {'wide': .4}},
    'steel': {'face shape': {A: .6}, 'lips': {'straight even lips': .6}, 'nose character': {'straight slender bridge': .4}},
    'rock': {'face shape': {A: .5}, 'jaw & chin': {'square broad jaw': .6}, 'nose character': {'broad low bridge': .4}},
    'ground': {'face width': {'wide': .5}, 'nose character': {'broad low bridge': .6}},
    'water': {'face shape': {'oval': .5}, 'eye spacing': {'wide-set eyes': .4}, 'lips': {'fuller lower lip': .4}},
    'ice': {'nose character': {'straight slender bridge': .6}, 'lips': {'thin lips': .5}, 'eyebrows': {'thin straight brows': .5}},
    'fire': {'eye tilt': {'upturned outer corners': .6}, 'eyebrows': {'angled brows': .4}},
    'electric': {'eye tilt': {'upturned outer corners': .5}, 'nose character': {'short nose with upturned tip': .4}},
    'grass': {'face shape': {'oval': .4}, 'eyebrows': {'fine soft arches': .5}},
    'bug': {'face shape': {'heart-shaped': .5}, 'jaw & chin': {'narrow tapered chin': .5}},
    'poison': {'eye shape': {'narrow': .5}, 'lips': {'full lips': .4}},
    'dark': {'eye shape': {'sharp': .6}, 'eyebrows': {'angled brows': .6}, 'eye spacing': {'close-set eyes': .4}},
    'flying': {'eye tilt': {'upturned outer corners': .5}, 'nose character': {'straight slender bridge': .4}},
    'normal': {'nose character': {'balanced nose': .4}, 'lips': {'medium lips': .4}},
}
TYPE_KO = {'fairy': '페어리', 'psychic': '에스퍼', 'ghost': '고스트', 'dragon': '드래곤', 'fighting': '격투', 'steel': '강철', 'rock': '바위',
           'ground': '땅', 'water': '물', 'ice': '얼음', 'fire': '불꽃', 'electric': '전기', 'grass': '풀', 'bug': '벌레', 'poison': '독',
           'dark': '악', 'flying': '비행', 'normal': '노말'}

# 옛 설계표(2026-10-12 gpt)의 한글 문장 → 생성기 값. 직접 쓴 614종의 선택을 앞선 값으로 살리려고 한 번만 쓴다
SEED_MAP = {
    '윤곽': [('세로가 조금 긴 타원', {'face shape': 'oval', 'face length': 'balanced', 'face width': 'medium', 'jaw & chin': 'soft rounded jaw'}),
             ('가로세로 차이가 작은 둥근', {'face shape': R, 'face length': 'short', 'face width': 'wide', 'jaw & chin': 'soft rounded jaw'}),
             ('세로가 긴 윤곽', {'face shape': L, 'face length': 'long', 'face width': 'narrow', 'jaw & chin': 'long chin with defined jaw'}),
             ('넓은 광대와 하관', {'face shape': 'oval', 'face length': 'balanced', 'face width': 'wide', 'jaw & chin': 'wide heavy chin'}),
             ('면이 분명한', {'face shape': A, 'face length': 'balanced', 'face width': 'medium', 'jaw & chin': 'angular defined jaw'}),
             ('이마와 윗볼이 넓고', {'face shape': 'heart-shaped', 'face length': 'balanced', 'face width': 'medium', 'jaw & chin': 'narrow tapered chin'}),
             ('광대가 가장 넓고', {'face shape': 'sharp', 'face length': 'balanced', 'face width': 'medium', 'jaw & chin': 'narrow tapered chin'})],
    '눈': [('비교적 곧은 윗눈꺼풀', {'eye shape': 'narrow', 'eye size': 'medium', 'eye tilt': 'level outer corners'}),
           ('윗눈꺼풀의 아치가 둥근', {'eye shape': 'large', 'eye size': 'medium', 'eye tilt': 'level outer corners'}),
           ('양 끝이 완만하게 좁아지는 아몬드', {'eye shape': 'almond', 'eye size': 'medium', 'eye tilt': 'level outer corners'}),
           ('세로 높이가 낮고', {'eye shape': 'narrow', 'eye size': 'small', 'eye tilt': 'level outer corners'}),
           ('바깥 눈꼬리가 올라간', {'eye shape': 'sharp', 'eye size': 'medium', 'eye tilt': 'upturned outer corners'}),
           ('높이와 너비가 모두 큰', {'eye shape': 'large', 'eye size': 'large', 'eye tilt': 'level outer corners'}),
           ('홍채 위쪽을 덮는', {'eye shape': 'drooping', 'eye size': 'medium', 'eye tilt': 'downturned outer corners'}),
           ('완만한 수평 아몬드', {'eye shape': 'almond', 'eye size': 'medium', 'eye tilt': 'downturned outer corners'}),
           ('작고 둥근 눈', {'eye shape': 'large', 'eye size': 'small', 'eye tilt': 'level outer corners'}),
           ('열린 아몬드', {'eye shape': 'almond', 'eye size': 'large', 'eye tilt': 'level outer corners'}),
           ('타원형 눈', {'eye shape': 'large', 'eye size': 'medium', 'eye tilt': 'downturned outer corners'}),
           ('가로로 짧은 눈', {'eye shape': 'narrow', 'eye size': 'small', 'eye tilt': 'upturned outer corners'}),
           ('부드럽게 내려가는', {'eye shape': 'almond', 'eye size': 'medium', 'eye tilt': 'downturned outer corners'})],
    '눈썹': [('중간 두께의 직선', {'eyebrows': 'straight medium brows'}), ('가늘고 완만한 곡선', {'eyebrows': 'fine soft arches'}),
             ('긴 곡선', {'eyebrows': 'long arched brows'}), ('굵고 낮게', {'eyebrows': 'thick low brows'}), ('사선', {'eyebrows': 'angled brows'})],
    '코': [('짧은 중간 높이', {'nose character': 'small delicate nose'}), ('중간 길이의 곧은', {'nose character': 'balanced nose'}),
           ('둥글고 충분한 체적', {'nose character': 'rounded soft tip'}), ('길게 읽히는', {'nose character': 'long nose with low tip'}),
           ('가늘고 중간 길이', {'nose character': 'straight slender bridge'})],
    '입': [('얇고 선명한', {'lips': 'thin lips'}), ('좌우로 긴', {'lips': 'wide mouth'}), ('중앙 체적이 분명', {'lips': 'full lips'}),
           ('둥근 입술 윤곽', {'lips': 'small mouth'}), ('윗입술 중앙의 곡선', {'lips': 'bow-shaped upper lip'}), ('균형 잡힌', {'lips': 'medium lips'})],
}
SEED_W = {'species': 3.0, 'draft': 1.0}   # 직접 쓴 것은 굳게, 단서 초안은 원작 단서가 이기게
KEEP_W = 4.0                               # 이 json 의 이전 값 — 다시 돌려도 안 흔들린다


def spec():
    out = subprocess.run(['node', '-e', "global.window={};require('./lib/prompt-spec.js');const S=window.AtelierSpec;"
                          "process.stdout.write(JSON.stringify({keys:S.FACE_KEYS,defs:S.PARAM_DEFS.filter(d=>S.FACE_KEYS.includes(d.key))}))"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    opts = {d['key']: [o[0] for o in d['options'] if o[0] and o[0] != '__custom__'] for d in j['defs']}
    ko = {d['key']: {o[0]: o[1].split('— ', 1)[-1] for o in d['options']} for d in j['defs']}
    name = {d['key']: d['ko'] for d in j['defs']}
    return j['keys'], opts, ko, name


def compatible(t):
    s, ln, w, j = t['face shape'], t['face length'], t['face width'], t['jaw & chin']
    if s in (R, 'compact') and (ln == 'long' or j in ('long chin with defined jaw', 'angular defined jaw', 'narrow tapered chin', 'square broad jaw')): return False
    if s == L and (ln != 'long' or w == 'wide' or j in ('wide heavy chin', 'receding soft chin', 'soft rounded jaw')): return False
    if s in (A, 'sharp') and j in ('soft rounded jaw', 'receding soft chin'): return False
    if s == 'heart-shaped' and (j not in ('narrow tapered chin', 'soft rounded jaw', 'balanced jawline') or w == 'narrow'): return False
    if ln == 'long' and s not in (L, 'oval', 'sharp', A): return False
    if ln == 'short' and s not in (R, 'compact', 'heart-shaped', 'oval'): return False
    if w == 'narrow' and j in ('square broad jaw', 'wide heavy chin'): return False
    if w == 'wide' and j in ('narrow tapered chin', 'long chin with defined jaw'): return False
    e, z, tl = t['eye shape'], t['eye size'], t['eye tilt']
    if e == 'upturned' and tl != 'upturned outer corners': return False
    if e == 'drooping' and tl != 'downturned outer corners': return False
    if e == 'sharp' and tl == 'downturned outer corners': return False
    if e == 'large' and z == 'small' and tl != 'level outer corners': return False
    if e == 'narrow' and z == 'large': return False
    return True


def groups(t):
    return tuple(tuple(t[k] for k in ks) for _, ks in GROUPS)


def diff(a, b):
    return sum(1 for x, y in zip(a, b) if x != y)


def load_inputs():
    cards = json.load(open(os.path.join(ROOT, 'data', 'card.json')))['cards']['character']
    app = json.load(open(os.path.join(ROOT, 'data', 'source-appearance.json')))['entries']
    img = json.load(open(os.path.join(ROOT, 'data', 'img.json'))).get('img', {})
    return cards, app, img


def lines_of(cards):
    by = {c['name']: c for c in cards}
    root = {}
    for c in cards:
        cur, seen = c['name'], set()
        while by.get(cur, {}).get('from') in by and cur not in seen:
            seen.add(cur); cur = by[cur]['from']
        root[c['name']] = cur
    return root


def read_seed(path):
    s = open(path, encoding='utf-8').read()
    out = {}
    for m in re.finditer(r'\n### (\d{3,4}) · [^\n]*\n(.*?)(?=\n### \d{3,4} · |\Z)', s, re.S):
        no, body = int(m.group(1)), m.group(2)
        how = 'species' if '작성: 종별 직접 작성' in body else 'draft'
        rows = dict(re.findall(r'^\| (윤곽|눈|눈썹|코|입) \| (.*?) \|$', body, re.M))
        why = re.search(r'\*\*원작과 연결한 이유:\*\* (.*)', body)
        val = {}
        for g, table in SEED_MAP.items():
            for needle, v in table:
                if needle in rows.get(g, ''):
                    val.update(v); break
        out[no] = {'how': how, 'face': val, 'why': why.group(1).strip() if why and how == 'species' else ''}
    return out


def score(card, rec, keys, opts):
    sc = {k: {o: BASE[k].get(o, 0.0) for o in opts[k]} for k in keys}
    why = {k: {o: [] for o in opts[k]} for k in keys}
    def add(k, o, w, label):
        if o in sc[k]:
            sc[k][o] += w
            if w >= .6 and label not in why[k][o]: why[k][o].append(label)
    hits = {}
    for f in (rec or {}).get('features', []):
        part = f.get('part', '').lower()
        text = (part + ' ' + f.get('detail', '')).lower()
        for i, (rx, _, tab) in enumerate(CUES):
            # 몸 전체의 결(둥근·뾰족·긴)은 몸통·머리 쪽 특징에서만 읽는다 — 다리가 가늘다고 얼굴이 길어지지 않고, 코가 둥글다고 얼굴이 둥글어지지 않는다
            if i < BODY_CUES and part not in BODY_PARTS: continue
            if not re.search(rx, text): continue
            hits[i] = hits.get(i, 0) + 1
            if hits[i] > 2: continue          # 같은 단서가 여러 특징에 걸려도 두 번까지만 센다
            for k, d in tab.items():
                for o, w in d.items(): add(k, o, w, '‘' + f['detail'] + '’')
    shape = (rec or {}).get('shape') or card.get('shape')
    if shape in SHAPE:
        label, tab = SHAPE[shape]
        for k, d in tab.items():
            for o, w in d.items(): add(k, o, w, label)
    for t in [card.get('element'), card.get('element2')]:
        for k, d in TYPE.get(t, {}).items():
            for o, w in d.items(): add(k, o, w, TYPE_KO.get(t, t) + ' 타입')
    wkg, hm = card.get('w') or 0, card.get('h') or 0
    if wkg >= 150:
        for k, o in [('face width', 'wide'), ('jaw & chin', 'square broad jaw'), ('nose character', 'broad low bridge')]: add(k, o, .8, f'무게 {wkg:g}kg')
    if hm >= 2.5:
        for k, o in [('face length', 'long'), ('face shape', L)]: add(k, o, .8, f'키 {hm:g}m')
    if 0 < hm <= .4 and wkg <= 6:
        for k, o in [('face shape', 'compact'), ('face length', 'short')]: add(k, o, .8, f'키 {hm:g}m')
    return sc, why


def build(seed_doc=None):
    keys, opts, ko, name = spec()
    cards, app, img = load_inputs()
    old = json.load(open(DATA)).get('faces', {}) if os.path.exists(DATA) else {}
    seed = read_seed(seed_doc) if seed_doc else {}
    root = lines_of(cards)
    cards = sorted(cards, key=lambda c: c['no'])
    names = {c['name']: c for c in cards}
    taken, by_line, four = {}, {}, [set() for _ in GROUPS]
    faces, fallback = {}, []
    for c in cards:
        no, rec = c['no'], app.get(str(c['no']))
        sc, why = score(c, rec, keys, opts)
        prev = old.get(str(no))
        sd = seed.get(no)
        how = (prev or {}).get('how') or (sd or {}).get('how') or 'draft'
        prior = (prev or {}).get('face') or (sd or {}).get('face') or {}
        pw = KEEP_W if prev else SEED_W[how]
        for k, o in prior.items():
            if k in sc and o in sc[k]: sc[k][o] += pw
        ranked = {k: sorted(opts[k], key=lambda o: -sc[k][o])[:6] for k in keys}
        best = {k: sc[k][ranked[k][0]] for k in keys}
        mates = [faces[str(names[n]['no'])] for n in by_line.get(root[c['name']], [])]

        def ok(t, gmin):
            g = groups(t)
            if g in taken: return False
            if gmin >= 2 and any(tuple(x for j, x in enumerate(g) if j != i) in four[i] for i in range(len(GROUPS))): return False
            return all(diff(g, groups(m['face'])) >= LINE_MIN for m in mates)
        def search(test):
            heap, seen, pops = [(0.0, (0,) * len(keys))], set(), 0
            while heap and pops < 40000:
                cost, idx = heapq.heappop(heap); pops += 1
                if idx in seen: continue
                seen.add(idx)
                t = {k: ranked[k][i] for k, i in zip(keys, idx)}
                if compatible(t) and test(t): return t
                for a in range(len(keys)):
                    if idx[a] + 1 < len(ranked[keys[a]]):
                        n = list(idx); n[a] += 1; n = tuple(n)
                        if n not in seen:
                            heapq.heappush(heap, (sum(best[keys[b]] - sc[keys[b]][ranked[keys[b]][n[b]]] for b in range(len(keys))), n))
            return None
        top = search(lambda t: True)        # 겹침을 보기 전의 가장 맞는 얼굴
        chosen = None
        for gmin in (GLOBAL_MIN, 1):
            chosen = search(lambda t: ok(t, gmin))
            if chosen: break
            fallback.append(no)
        assert chosen, no
        g = groups(chosen); taken[g] = no
        for i in range(len(GROUPS)): four[i].add(tuple(x for j, x in enumerate(g) if j != i))
        by_line.setdefault(root[c['name']], []).append(c['name'])
        moved = [k for k in keys if chosen[k] != top[k]]
        cues = []
        for k in keys:
            for lab in why[k][chosen[k]][:1]:
                cues.append(f"{lab} → {name[k]} {ko[k][chosen[k]]}")
        clash = []
        if moved:
            near = [m for m in mates if diff(groups(top), groups(m['face'])) < LINE_MIN]
            clash.append(('같은 계열 ' + '·'.join(m['name'] for m in near) + '와 겹쳐') if near else '다른 종과 넷 이상 겹쳐')
            clash.append('원작 단서의 다음 후보로 옮김 — ' + ', '.join(f"{name[k]} {ko[k][top[k]]} → {ko[k][chosen[k]]}" for k in moved))
        faces[str(no)] = {'name': c['name'], 'en': c.get('en', ''), 'line': root[c['name']], 'how': how,
                          'registered': c['name'] in img, 'face': chosen,
                          'why': (prev or {}).get('why') or (sd or {}).get('why') or '',
                          'cues': cues[:6], 'adjusted': ' '.join(clash) or ((prev or {}).get('adjusted', '') if prev and prev.get('face') == chosen else '')}
    out = {'version': 1,
           'note': 'tools/face-design.py 가 만든다. 값은 생성기 얼굴 항목(lib/prompt-spec.js)의 열쇠 그대로이고, 새 인물(경장 ①)에만 FACE 줄로 실린다. 손으로 고치면 build 를 다시 돌려 겹침 검사를 받는다.',
           'rules': {'lineMin': LINE_MIN, 'globalMin': GLOBAL_MIN, 'groups': [g for g, _ in GROUPS]},
           'sources': ['data/card.json', 'data/source-appearance.json (Bulbapedia contributors, CC BY-NC-SA 2.5)'],
           'faces': faces}
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=0, separators=(',', ':'))
        f.write('\n')
    print(f'[얼굴] {len(faces)}종 · 겹침 풀이로 옮긴 종 {sum(1 for v in faces.values() if v["adjusted"])} · 전체 기준을 낮춘 종 {len(fallback)}')
    return out


def check(data=None, quiet=False):
    keys, opts, ko, name = spec()
    cards, app, img = load_inputs()
    data = data or json.load(open(DATA))
    faces = data['faces']
    bad = []
    if len(faces) != len(cards): bad.append(f'종 수 {len(faces)} ≠ 카드 {len(cards)}')
    root = lines_of(cards)
    for c in cards:
        f = faces.get(str(c['no']))
        if not f: bad.append(f"{c['no']} 없음"); continue
        if f['name'] != c['name']: bad.append(f"{c['no']} 이름 {f['name']} ≠ {c['name']}")
        for k in keys:
            if f['face'].get(k) not in opts[k]: bad.append(f"{c['name']} {k}={f['face'].get(k)} 는 생성기에 없는 값")
        if not compatible(f['face']): bad.append(f"{c['name']} 서로 맞지 않는 조합 {f['face']}")
        if bool(f.get('registered')) != (c['name'] in img): bad.append(f"{c['name']} registered 표시가 img.json 과 다르다")
    G = {no: groups(f['face']) for no, f in faces.items()}
    if len(set(G.values())) != len(G): bad.append('같은 얼굴이 둘 이상')
    line = {}
    for c in cards: line.setdefault(root[c['name']], []).append(str(c['no']))
    for r, ms in line.items():
        for i in range(len(ms)):
            for j in range(i + 1, len(ms)):
                d = diff(G[ms[i]], G[ms[j]])
                if d < LINE_MIN: bad.append(f'계열 {r}: {faces[ms[i]]["name"]}·{faces[ms[j]]["name"]} 묶음 {d}개만 다르다')
    seen = [dict() for _ in GROUPS]
    near = 0
    for no, g in G.items():
        for i in range(len(GROUPS)):
            k = tuple(x for j, x in enumerate(g) if j != i)
            if k in seen[i]: near += 1
            seen[i].setdefault(k, no)
    if not quiet:
        print(f'[검사] {len(faces)}종 · 서로 다른 얼굴 {len(set(G.values()))} · 넷 이상 같은 쌍 {near} · 문제 {len(bad)}')
        for b in bad[:30]: print('  ' + b)
    return bad, near


def face_line(f, keys, opts):
    """생성기와 같은 FACE 줄(lib/prompt-anthro.js faceLine) — 문서에 그대로 보인다"""
    t = f['face']
    eye = 'open rounded' if t['eye shape'] == 'large' else t['eye shape']
    space = {'close-set eyes': 'close-set', 'average eye spacing': 'average spacing', 'wide-set eyes': 'wide-set'}[t['eye spacing']]
    part = [f"{t['face shape']} face, {t['face length']} length, {t['face width']} width", t['jaw & chin'],
            f"{eye} eyes, {t['eye size']} size, {t['eye tilt']}, {space}", t['eyebrows'],
            t['nose character'] if 'nose' in t['nose character'] else t['nose character'] + ' nose', t['lips']]
    return "FACE (her own structure, not the style's default face): " + '; '.join(part) + '.'


def render():
    keys, opts, ko, name = spec()
    data = json.load(open(DATA))
    faces = data['faces']
    bad, near = check(data, quiet=True)
    G = [groups(f['face']) for f in faces.values()]
    gens = [(1, 151), (152, 251), (252, 386), (387, 493), (494, 649), (650, 721), (722, 809), (810, 905), (906, 1025)]
    out = [
        '# PKM Atelier — 종별 얼굴 설계표',
        '',
        f'범위: 전국도감 001–{len(faces):04d} · 자료: `data/face-design.json`(이 문서는 `python3 tools/face-design.py render` 로 그린다. 손으로 고치지 않는다)',
        '',
        '같은 화풍(기본 `glossy_promo`)에서 캐릭터 얼굴이 닮아 가는 것을 막는 설계다. 값은 생성기 얼굴 항목의 열쇠 그대로이고,',
        '**생성기가 새 인물(경장 ①)의 프롬프트에 FACE 줄로 싣는다** — 화면의 "종별 얼굴 설계" 칸에서 끌 수 있고, 얼굴 항목을 직접 고르면',
        '그 항목은 FACE 줄에서 빠지고 IDENTITY 가 쥔다. 이어가기·개방·일상에는 싣지 않는다(①을 첨부해 인물을 지킨다).',
        '',
        '## 원칙',
        '',
        '- 모든 인물은 20대 성인 여성이다. 원작이 아기·유체여도 아동 비율로 만들지 않는다. 사람 피부·사람 코와 입을 유지하고, 부리·주둥이·복안 같은 것은 사람 얼굴의 비율로만 옮긴다.',
        '- 이미 확정한 경장 ①이 있으면 그 그림이 정본이다. 이 표와 달라도 다시 그리지 않는다(`registered` — 지금 그림이 등록된 종).',
        '- 고르는 법은 무작위가 아니다. 원작 외형 특징·몸 형태·타입·키와 무게에 낱말 표로 점수를 주고(`tools/face-design.py` 의 CUES), 앞서 직접 쓴 설계에 가산점을 준다. 그러고 나서 도감 번호 차례로 겹침을 푼다.',
        f'- 같은 진화 계열끼리는 다섯 묶음(윤곽·눈·눈썹·코·입) 가운데 **{LINE_MIN}개 이상**이 다르다. 1,025종 어느 둘도 넷 이상이 같지 않다(**{GLOBAL_MIN}개 이상** 다르다). 겹쳐서 옮긴 항목은 각 종의 "조정"에 적는다.',
        '- 이 숫자는 글로 쓴 설계가 겹치지 않는다는 뜻이다. 그림이 실제로 구별되는지는 생성 뒤에 같은 계열·최근 캐릭터와 나란히 보고 확인한다.',
        '- 머리색·눈색·헤어·피부색·체형은 이 표가 정하지 않는다(생성기의 다른 외형 항목).',
        '',
        '## 지금 상태',
        '',
        f'- 서로 다른 얼굴 {len(set(G))} / {len(faces)} · 넷 이상 같은 쌍 {near} · 규칙 위반 {len(bad)}',
        f'- 직접 쓴 설계 {sum(1 for f in faces.values() if f["how"] == "species")}종, 원작 단서 규칙으로 고른 것 {sum(1 for f in faces.values() if f["how"] == "draft")}종 · 겹침을 풀며 옮긴 종 {sum(1 for f in faces.values() if f["adjusted"])}',
        f'- 그림이 이미 있는 종(①이 정본) {sum(1 for f in faces.values() if f["registered"])}',
        '- 항목별로 쓰인 값의 수: ' + ' · '.join(f"{name[k]} {len({f['face'][k] for f in faces.values()})}/{len(opts[k])}" for k in keys),
        '',
        '## 고치는 법',
        '',
        '`data/face-design.json` 의 값을 고친 뒤 `python3 tools/face-design.py build` → `render` 를 돌린다. build 는 고친 값을 앞선 값으로 굳게 지키고,',
        '그 때문에 다른 종과 겹치면 그쪽을 옮긴다. `node tests/face-design.cjs` 가 규칙과 생성기 연결을 본다.',
        '',
    ]
    for g0, g1 in gens:
        sub = [(int(no), f) for no, f in faces.items() if g0 <= int(no) <= g1]
        if not sub: continue
        out += [f'## {gens.index((g0, g1)) + 1}세대 · {len(sub)}종', '']
        for no, f in sorted(sub):
            t = f['face']
            head = f"### {no:03d} · {f['name']} ({f['en']})"
            meta = f"계열 기준: {f['line']} · 설계: {'직접 쓴 설계' if f['how'] == 'species' else '원작 단서 규칙'} · {'**그림 있음 — ①이 정본**' if f['registered'] else '새 경장에 적용'}"
            out += [head, '', meta, '',
                    '| 묶음 | 설계 |', '|---|---|',
                    f"| 윤곽 | {ko['face shape'][t['face shape']]} · 길이 {ko['face length'][t['face length']]} · 폭 {ko['face width'][t['face width']]} · {ko['jaw & chin'][t['jaw & chin']]} |",
                    f"| 눈 | {ko['eye shape'][t['eye shape']]} · 크기 {ko['eye size'][t['eye size']]} · {ko['eye tilt'][t['eye tilt']]} · {ko['eye spacing'][t['eye spacing']]} |",
                    f"| 눈썹 | {ko['eyebrows'][t['eyebrows']]} |",
                    f"| 코 | {ko['nose character'][t['nose character']]} |",
                    f"| 입 | {ko['lips'][t['lips']]} |", '']
            if f['why']: out += [f"**이유:** {f['why']}", '']
            if f['cues']: out += ['**원작 단서:** ' + ' · '.join(f['cues']), '']
            if f['adjusted']: out += [f"**조정:** {f['adjusted']}", '']
            out += ['```text', face_line(f, keys, opts), '```', '']
    with open(DOC, 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(out))
    print(f'[문서] {DOC} · {len(faces)}종')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', nargs='?', choices=['build', 'render'])
    ap.add_argument('--seed-doc')
    ap.add_argument('--check', action='store_true')
    a = ap.parse_args()
    if a.cmd == 'build': build(a.seed_doc)
    elif a.cmd == 'render': render()
    if a.check or not a.cmd:
        bad, _ = check()
        sys.exit(1 if bad else 0)
