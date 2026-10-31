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
import argparse, datetime, heapq, json, os, re, subprocess, sys

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

# ── 머리(2026-10-20) ─────────────────────────────────────────────────────────────
# 생성기가 머리를 스스로 고르면 보브·웨이브·하이 포니테일 몇 가지로 몰렸다(기록 84종 중 보브 23).
# 그래서 얼굴처럼 종마다 헤어스타일·길이·앞머리를 원작 단서로 고른다. 값은 생성기 머리 항목의 열쇠 그대로다.
# 인물은 모두 여성이라 남성 전용 값(ONLY 의 male — buzz cut·crew cut·fade·man bun·mullet·side part·swept back·shaggy)은 쓰지 않는다.
HAIR_KEYS = ['hairstyle', 'hair length', 'bangs']
LENGTHS = ['very short', 'short', 'medium', 'long', 'very long']
HAIR_CAP, BOB_CAP = 0.08, 0.04            # 한 헤어스타일이 1,025종에서 차지할 수 있는 몫 · 보브는 따로 더 낮게
# 적게 쓰인 헤어스타일 채우기(2026-10-27) — 앞서 정한 머리를 지키는 가산점(항목마다 +2.5) 때문에 새로 더한 머리(아프로·브레이드 …)가
# 한 번도 안 나왔다. FILL_MIN 종에 못 미치는 헤어스타일은 원작 단서가 FILL_SCORE 넘는 종 가운데 가장 잘 맞는 종을 미리 골라 FILL_PULL 만큼 당긴다
FILL_MIN, FILL_SCORE, FILL_PULL = 8, .7, 12.0
# 헤어스타일마다 맞는 길이(HAIR_LENGTH_LIMITS 와 같은 뜻 — 픽시·보브는 짧게, 한쪽 민 긴 머리는 길게)
HAIR_LEN = {
    'pixie cut': ['very short', 'short'], 'bob': ['short'], 'undercut': ['short', 'medium'], 'finger waves': ['short', 'medium'],
    'tight curls': ['short', 'medium'], 'blunt cut': ['short', 'medium', 'long'], 'asymmetric cut': ['short', 'medium', 'long'],
    'layered': ['short', 'medium', 'long'], 'feathered': ['short', 'medium', 'long'], 'wolf cut': ['short', 'medium', 'long'],
    'windswept': ['short', 'medium', 'long'], 'curly': ['short', 'medium', 'long'], 'slicked back': ['short', 'medium', 'long'],
    'wet-look slick': ['medium', 'long'], 'straight': ['medium', 'long', 'very long'], 'wavy': ['medium', 'long', 'very long'],
    'locs': ['medium', 'long', 'very long'], 'ponytail': ['medium', 'long', 'very long'], 'high ponytail': ['medium', 'long', 'very long'],
    'side ponytail': ['medium', 'long', 'very long'], 'half-up': ['medium', 'long', 'very long'], 'twin tail': ['short', 'medium', 'long', 'very long'],
    'braid': ['long', 'very long'], 'twin braids': ['medium', 'long', 'very long'], 'ringlet curls': ['medium', 'long', 'very long'],
    'hime cut': ['long', 'very long'], 'side-shaved long hair': ['long', 'very long'],
    'chignon': ['medium', 'long'], 'messy bun': ['medium', 'long'], 'top knot': ['medium', 'long'], 'low bun': ['medium', 'long'],
    'space buns': ['medium', 'long'], 'crown braid': ['long', 'very long'],
    # 2026-10-27 — 아프로·브레이드 계열과 섀기(생성기에서 여성 머리로도 쓴다)
    'shaggy': ['short', 'medium', 'long'], 'afro': ['short', 'medium'], 'afro puffs': ['medium', 'long'], 'box braids': ['long', 'very long'],
    'cornrows': ['short', 'medium', 'long'], 'fishtail braid': ['long', 'very long'], 'beach waves': ['medium', 'long', 'very long'],
}
# 계열을 잇는 묶음 — 진화하며 같은 묶음 안에 있거나, 이어지는 묶음으로 더 길고 공들인 쪽으로 간다
FAMILY = {'crop': ['pixie cut', 'bob', 'undercut', 'finger waves'],
          'sleek': ['straight', 'hime cut', 'blunt cut', 'slicked back', 'wet-look slick'],
          'layer': ['layered', 'feathered', 'wolf cut', 'windswept', 'asymmetric cut', 'side-shaved long hair', 'shaggy'],
          'curl': ['wavy', 'curly', 'tight curls', 'ringlet curls', 'locs', 'afro', 'beach waves'],
          'tail': ['ponytail', 'high ponytail', 'side ponytail', 'twin tail', 'half-up'],
          'braid': ['braid', 'twin braids', 'crown braid', 'box braids', 'cornrows', 'fishtail braid'],
          'bun': ['chignon', 'messy bun', 'top knot', 'low bun', 'space buns', 'afro puffs']}
FAM_OF = {s: f for f, ss in FAMILY.items() for s in ss}
FAM_KO = {'crop': '짧은 컷', 'sleek': '곧은 결', 'layer': '층 낸 컷', 'curl': '웨이브·곱슬', 'tail': '묶은 꼬리', 'braid': '땋은 머리', 'bun': '올림머리'}
GROW = {'crop': {'sleek', 'layer', 'curl', 'tail'}, 'sleek': {'tail', 'braid', 'bun', 'layer'}, 'layer': {'tail', 'curl', 'sleek', 'braid'},
        'curl': {'tail', 'bun', 'braid'}, 'tail': {'braid', 'bun'}, 'braid': {'bun'}, 'bun': set()}
ELAB = {s: 0 for s in ('pixie cut', 'bob', 'blunt cut', 'straight', 'undercut')}
ELAB.update({s: 1 for s in ('layered', 'feathered', 'wavy', 'ponytail', 'asymmetric cut', 'slicked back', 'wet-look slick', 'curly',
                            'half-up', 'windswept', 'wolf cut', 'tight curls', 'low bun', 'shaggy', 'beach waves', 'afro', 'cornrows')})
ELAB.update({s: 2 for s in ('high ponytail', 'side ponytail', 'twin tail', 'braid', 'side-shaved long hair', 'messy bun', 'top knot',
                            'finger waves', 'locs', 'space buns', 'afro puffs', 'fishtail braid')})
ELAB.update({s: 3 for s in ('twin braids', 'crown braid', 'chignon', 'ringlet curls', 'hime cut', 'box braids')})
BANGS_OK = {'hime cut': ['straight bangs'], 'slicked back': ['none'], 'wet-look slick': ['none'],
            'finger waves': ['none', 'side-swept bangs', 'long side bangs'],
            'undercut': ['none', 'side-swept bangs', 'long side bangs', 'long side bangs covering one eye', 'asymmetric bangs', 'choppy bangs'],
            'side-shaved long hair': ['side-swept bangs', 'long side bangs', 'long side bangs covering one eye', 'asymmetric bangs'],
            'pixie cut': ['none', 'side-swept bangs', 'choppy bangs', 'straight bangs', 'asymmetric bangs', 'parted bangs'],
            'cornrows': ['none'], 'afro': ['none', 'curtain bangs', 'choppy bangs'], 'afro puffs': ['none', 'curtain bangs', 'straight bangs']}
BANGS_BASE = {'straight bangs': .3, 'side-swept bangs': .3, 'curtain bangs': .3, 'parted bangs': .2, 'none': .2, 'long side bangs': .2,
              'choppy bangs': .2, 'asymmetric bangs': .1, 'long side bangs covering one eye': 0.0}
LEN_BASE = {'very short': 0.0, 'short': .3, 'medium': .4, 'long': .4, 'very long': .2}
H_BAL, L_BAL, B_BAL, NEAR_PEN = 1.2, .5, .6, .7   # 많이 쓴 값일수록 깎는 정도(헤어스타일·길이·앞머리) · 가까운 번호의 다른 계열과 같은 헤어스타일 감점
HS, HL, HB = 'hairstyle', 'hair length', 'bangs'
# 낱말 표 — (정규식, 단서 이름, {항목: {값: 점수}}, 몸 쪽만 볼지). 특징 문장(부위+설명)에 건다
HAIR_CUES = [
    (r'\b(long|large|tall|big)\b[^,;]*\b(ears?|antenna|antennae|feelers?|ribbons?|streamers?)\b|\b(ribbon|ribbons|streamer|streamers|feeler|feelers)\b',
     '길게 늘어진 귀·더듬이·리본', {HS: {'twin tail': 2.2, 'twin braids': 1.2, 'side ponytail': .8}, HL: {'long': .6, 'very long': .4}}, False),
    (r'\b(antenna|antennae)\b', '더듬이', {HS: {'twin tail': .8, 'space buns': .8}, HB: {'parted bangs': .5}}, False),
    (r'\b(pointed|triangular)\b[^,;]*\bears?\b', '선 귀', {HS: {'high ponytail': .6, 'twin tail': .6, 'wolf cut': .4}}, False),
    (r'\b(droop\w*|floppy|lop|hanging)\b[^,;]*\bears?\b|\bears?\b[^,;]*\b(droop\w*|floppy|hanging)\b', '처진 귀',
     {HS: {'twin braids': 1.2, 'low bun': .5, 'side ponytail': .5}, HB: {'curtain bangs': .5}}, False),
    (r'\b(two|three|four|five|six|seven|eight|nine|ten|twin|paired|multiple|several|many)\b[^,;]*\btails\b', '여러 갈래 꼬리',
     {HS: {'twin tail': 1.8, 'twin braids': 1.0, 'ringlet curls': .6}, HL: {'very long': .6}}, False),
    (r'\b(long|flowing|thin|slender|whip-like|trailing|serpentine)\b[^,;]*\btail\b', '긴 꼬리',
     {HS: {'ponytail': 1.6, 'braid': 1.2, 'high ponytail': 1.0, 'side ponytail': .5}, HL: {'long': .6}}, False),
    (r'\b(fluffy|bushy|puffy|fan-like)\b[^,;]*\btails?\b', '복슬한 꼬리', {HS: {'curly': 1.0, 'ponytail': .4, 'messy bun': .4}}, False),
    (r'\btail\b', '꼬리', {HS: {'ponytail': .5, 'high ponytail': .3}}, False),
    (r'\b(crest|crests|plume|plumes|wisp|head feathers?)\b', '볏·머리 깃',
     {HS: {'top knot': 1.2, 'high ponytail': 1.2, 'slicked back': .8, 'wolf cut': .6}, HB: {'side-swept bangs': .5}}, False),
    (r'\b(mane|ruff|ruffs)\b', '갈기·목털', {HS: {'wolf cut': 1.8, 'layered': 1.0, 'curly': .6, 'feathered': .6, 'shaggy': .8, 'afro': .6}, HL: {'long': .3}}, False),
    (r'\b(tuft|tufts|tufty|cowlick)\b', '털 다발', {HS: {'wolf cut': .8, 'messy bun': .8, 'feathered': .6}, HB: {'choppy bangs': .5}}, False),
    (r'\b(spike|spikes|spiky|spiked|spiny|spines?|quills?|jagged)\b', '가시·삐죽한 선',
     {HS: {'wolf cut': 1.0, 'asymmetric cut': .8, 'windswept': .5}, HB: {'choppy bangs': 1.2}}, False),
    (r'\b(horn|horns|horn-like|tusk|tusks)\b', '뿔', {HS: {'top knot': .8, 'high ponytail': .6, 'slicked back': .5}, HB: {'parted bangs': .6, 'none': .4}}, False),
    (r'\b(flame|flames|fire|fiery|blaze|blazing|ember|embers|burning)\b', '불꽃',
     {HS: {'windswept': 2.2, 'wolf cut': .8, 'high ponytail': .6}, HB: {'side-swept bangs': .5}}, False),
    (r'\b(fins?|fin-like|wave|waves|wavy|flowing|water|bubbles?|gills?|webbed|flippers?|flipper-like|droplets?)\b', '지느러미·물결',
     {HS: {'wavy': 1.4, 'finger waves': .8, 'straight': .6, 'wet-look slick': .6, 'beach waves': 1.0, 'fishtail braid': .6}, HB: {'curtain bangs': .4, 'long side bangs': .4}}, False),
    (r'\b(flower|flowers|petal|petals|blossom|blossoms|bloom|bud|buds|corolla)\b', '꽃·꽃잎',
     {HS: {'crown braid': 1.8, 'half-up': 1.0, 'ringlet curls': .4}, HB: {'curtain bangs': .4}}, False),
    (r'\b(leaf|leaves|leafy|leaf-like|frond|fronds|moss)\b', '잎', {HS: {'half-up': 1.3, 'layered': .6, 'messy bun': .6}}, False),
    (r'\b(vine|vines|stem|stems|stalk|stalks|stem-like|branch|branches|twig|twigs|tendril|tendrils)\b', '덩굴·줄기',
     {HS: {'braid': 1.4, 'twin braids': .8, 'locs': .4, 'box braids': .8, 'fishtail braid': .6}, HL: {'long': .4}}, False),
    (r'\b(bulb|seed|seeds|sprout|acorn|pod|nut)\b', '알뿌리·씨앗', {HS: {'messy bun': 1.2, 'top knot': .6}}, False),
    (r'\b(mushroom|mushrooms|cap|caps|helmet|dome|dome-shaped)\b', '버섯 갓·둥근 덮개', {HS: {'bob': 1.5, 'blunt cut': 1.0, 'finger waves': .4}, HB: {'straight bangs': .8}}, False),
    (r'\b(round|rounded|roundish|spherical|ball|orb|ovoid|plump|chubby|fluffy|puffy|fuzzy|cotton|cotton-like|pillow|bulbous|puff|soft|woolly|wool|fleece|egg-shaped)\b',
     '둥글고 폭신한 몸', {HS: {'curly': 1.3, 'space buns': 1.2, 'tight curls': 1.0, 'messy bun': .4, 'afro': 1.2, 'afro puffs': .8}, HB: {'straight bangs': .4}}, True),
    (r'\b(cloud|clouds|cloud-like|smoke|gas|mist|fog|vapor)\b', '구름·연기', {HS: {'curly': .8, 'wavy': .6, 'windswept': .6, 'afro': .8}}, False),
    (r'\b(mask|mask-like|masquerade|gown|dress|skirt|veil|cape|cloak|robe|elegant|graceful|regal|tiara|jewel|jewels|gem|gems|pearl|pearls)\b',
     '가면·드레스·보석', {HS: {'chignon': 1.2, 'hime cut': 1.0, 'ringlet curls': .8, 'crown braid': .5}}, False),
    (r'\b(crown|crown-like|crowned)\b', '왕관', {HS: {'crown braid': 1.5, 'chignon': .6}}, False),
    (r'\b(rock|rocks|rocky|stone|stones|boulder|metal|metallic|steel|iron|plate|plates|armor|armored|block|blocky|cube|square|rectangular|geometric|hexagonal|polyhedral|gear|gears|magnet|magnets|bolt|bolts|screw|faceted)\b',
     '돌·강철 판', {HS: {'blunt cut': 1.4, 'asymmetric cut': 1.0, 'undercut': 1.0, 'side-shaved long hair': .8}, HB: {'straight bangs': .5, 'none': .4}}, False),
    (r'\b(tentacle|tentacles)\b', '촉수', {HS: {'locs': 1.6, 'ringlet curls': 1.0, 'twin braids': .8, 'box braids': 1.4}, HL: {'long': .5}}, False),
    (r'\b(feather|feathers|feathered|feathery|plumage|wing|wings|wing-like)\b', '깃털·날개',
     {HS: {'feathered': 1.6, 'layered': .8, 'windswept': .6}, HB: {'side-swept bangs': .5}}, False),
    (r'\b(stripe|stripes|striped|band|bands|ring|rings|segment|segments|segmented)\b', '줄무늬·마디',
     {HS: {'braid': .7, 'twin braids': .5, 'finger waves': .5, 'cornrows': 1.0, 'box braids': .5}}, False),
    (r'\b(curl|curls|curled|curly|curling|swirl|swirly|swirled|whorled|spiral|spirals|coil|coiled|coiling)\b', '말린 선',
     {HS: {'ringlet curls': 1.2, 'curly': 1.0, 'finger waves': .6}}, False),
    (r'\b(lightning|lightning-shaped|zigzag|zigzagging|zigzags|electric|spark|sparks|thunder\w*)\b', '번개',
     {HS: {'asymmetric cut': 1.0, 'windswept': .8, 'side ponytail': .5}, HB: {'asymmetric bangs': .8, 'choppy bangs': .5}}, False),
    (r'\b(ice|icy|snow|snowy|snowflake|frost|frosty|frozen|icicle|icicles|crystal|crystals|crystalline)\b', '얼음·결정',
     {HS: {'straight': 1.0, 'hime cut': .6, 'blunt cut': .6, 'chignon': .4}, HB: {'straight bangs': .5}}, False),
    (r'\b(blade|blades|scythe|scythes|sword|swords|sickle|sickles|axe|axe-like|razor|razor-sharp)\b', '칼날',
     {HS: {'asymmetric cut': 1.2, 'side-shaved long hair': 1.0, 'undercut': .6, 'high ponytail': .5}, HB: {'asymmetric bangs': .6, 'long side bangs': .5}}, False),
    (r'\b(hidden|covered|covering|obscured|single|one|cyclopean)\b[^,;]*\beyes?\b|\beyes?\b[^,;]*\b(hidden|covered|obscured)\b', '가린 눈·외눈',
     {HB: {'long side bangs covering one eye': 2.0}}, False),
    (r'\bforehead\b', '이마 장식', {HB: {'parted bangs': 1.0, 'none': .6}}, False),
    (r'\b(sleepy|lazy|drowsy|droopy)\b', '졸린 인상', {HS: {'messy bun': 1.0, 'low bun': .6}}, False),
    (r'\b(shaggy|messy|unkempt|scruffy|ragged|tattered|torn|disheveled)\b', '헝클어진 털',
     {HS: {'wolf cut': 1.0, 'messy bun': .8, 'layered': .6, 'shaggy': 1.2}, HB: {'choppy bangs': .8}}, False),
    (r'\b(whisker|whiskers|mustache|mustaches|beard|barbels?)\b', '수염', {HS: {'low bun': .6, 'twin braids': .5}, HB: {'curtain bangs': .5}}, False),
    (r'\b(star|stars|star-shaped|crescent|crescent-shaped|moon)\b', '별·초승달', {HS: {'space buns': .8, 'chignon': .5}, HB: {'parted bangs': .4}}, False),
]
# 원작이 사람 머리칼을 가진 종(가디안·루주라 등) — 그 머리를 먼저 따른다
HAIR_PART = [(r'\b(long|flowing|billowy|streaming)\b', {HS: {'straight': 1.4, 'wavy': 1.0}, HL: {'very long': .8, 'long': .6}}),
             (r'\b(wavy|billowy)\b', {HS: {'wavy': 1.5}}), (r'\b(spike|spiked|spiky|jutting|zigzag\w*)\b', {HS: {'wolf cut': 1.5, 'windswept': .8}}),
             (r'\b(curly|curled)\b', {HS: {'curly': 1.5}}), (r'\bsplit\b', {HS: {'twin tail': 1.5}}),
             (r'.', {HS: {'bob': .6, 'layered': .5, 'blunt cut': .4}})]
HAIR_SHAPE = {
    'ball': {HS: {'space buns': .8, 'curly': .6, 'bob': .5, 'pixie cut': .4}}, 'blob': {HS: {'messy bun': .8, 'curly': .6, 'wavy': .4}},
    'squiggle': {HS: {'braid': 1.4, 'straight': 1.0}, HL: {'very long': .6, 'long': .4}}, 'fish': {HS: {'wavy': 1.0, 'wet-look slick': .8, 'finger waves': .5, 'fishtail braid': 1.0, 'beach waves': .5}},
    'arms': {HS: {'ponytail': .4}}, 'upright': {HS: {'high ponytail': .3}}, 'legs': {HS: {'pixie cut': .4}},
    'quadruped': {HS: {'ponytail': .4, 'layered': .3}}, 'wings': {HS: {'feathered': 1.0, 'windswept': .6}},
    'tentacles': {HS: {'locs': .8, 'ringlet curls': .6, 'box braids': .8}}, 'heads': {HS: {'twin tail': 1.0, 'space buns': .6}},
    'humanoid': {HS: {'straight': .4, 'hime cut': .3, 'layered': .3}}, 'bug-wings': {HS: {'twin tail': .6, 'bob': .4, 'layered': .4}},
    'armor': {HS: {'blunt cut': .8, 'undercut': .6}},
}
HAIR_TYPE = {
    'fairy': {HS: {'ringlet curls': 1.0, 'twin tail': .6, 'crown braid': .5, 'curly': .3, 'afro puffs': .5}, HB: {'straight bangs': .4, 'curtain bangs': .3}},
    'psychic': {HS: {'hime cut': 1.0, 'chignon': .8, 'straight': .6}, HB: {'parted bangs': .5, 'straight bangs': .4}},
    'ghost': {HS: {'straight': .8, 'asymmetric cut': .4, 'hime cut': .4}, HB: {'long side bangs covering one eye': 1.4, 'asymmetric bangs': .8, 'long side bangs': .5}, HL: {'long': .4}},
    'dark': {HS: {'asymmetric cut': .8, 'side-shaved long hair': .6, 'wolf cut': .5, 'straight': .3, 'shaggy': .4}, HB: {'long side bangs covering one eye': .8, 'asymmetric bangs': .8, 'long side bangs': .5}},
    'dragon': {HS: {'high ponytail': 1.0, 'braid': .8, 'wolf cut': .6, 'side-shaved long hair': .5}, HL: {'long': .4}},
    'fighting': {HS: {'high ponytail': 1.2, 'top knot': 1.0, 'braid': .6, 'undercut': .6, 'cornrows': .6}, HB: {'none': .4, 'side-swept bangs': .3}},
    'steel': {HS: {'blunt cut': 1.0, 'asymmetric cut': .6, 'undercut': .5, 'wet-look slick': .4}, HB: {'straight bangs': .5}},
    'rock': {HS: {'blunt cut': .8, 'low bun': .6, 'undercut': .4}, HB: {'straight bangs': .4, 'none': .3}},
    'ground': {HS: {'low bun': .8, 'braid': .6, 'messy bun': .5, 'box braids': .4}, HB: {'side-swept bangs': .3}},
    'water': {HS: {'wavy': 1.0, 'finger waves': .5, 'straight': .4, 'wet-look slick': .3, 'beach waves': .6}, HB: {'curtain bangs': .4}},
    'ice': {HS: {'straight': .8, 'hime cut': .5, 'chignon': .5, 'blunt cut': .4}, HB: {'straight bangs': .5}},
    'fire': {HS: {'windswept': 1.2, 'wolf cut': .5, 'high ponytail': .5}, HB: {'side-swept bangs': .4, 'choppy bangs': .3}},
    'electric': {HS: {'windswept': .7, 'asymmetric cut': .6, 'side ponytail': .6, 'high ponytail': .4}, HB: {'choppy bangs': .5, 'asymmetric bangs': .4}},
    'grass': {HS: {'half-up': .8, 'crown braid': .5, 'messy bun': .5, 'braid': .4}, HB: {'curtain bangs': .4}},
    'bug': {HS: {'twin tail': .5, 'pixie cut': .5, 'layered': .4, 'bob': .3}, HB: {'straight bangs': .4}},
    'poison': {HS: {'wet-look slick': .6, 'side-shaved long hair': .6, 'undercut': .4, 'curly': .3}, HB: {'asymmetric bangs': .4}},
    'flying': {HS: {'feathered': .8, 'windswept': .6, 'layered': .5}, HB: {'side-swept bangs': .5}},
    'normal': {HS: {'ponytail': .6, 'layered': .5, 'half-up': .3, 'low bun': .3, 'afro': .3, 'shaggy': .3}, HB: {'curtain bangs': .3, 'side-swept bangs': .3}},
}


def spec():
    out = subprocess.run(['node', '-e', "global.window={};require('./lib/prompt-spec.js');const S=window.AtelierSpec;"
                          "process.stdout.write(JSON.stringify({keys:S.FACE_KEYS,defs:S.PARAM_DEFS.filter(d=>S.FACE_KEYS.includes(d.key))}))"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    opts = {d['key']: [o[0] for o in d['options'] if o[0] and o[0] != '__custom__'] for d in j['defs']}
    ko = {d['key']: {o[0]: o[1].split('— ', 1)[-1] for o in d['options']} for d in j['defs']}
    name = {d['key']: d['ko'] for d in j['defs']}
    return j['keys'], opts, ko, name


def hair_spec():
    """생성기 머리 항목 셋의 값·한글 이름, 여성 인물에 쓸 수 있는 헤어스타일, 길이가 고정되는 헤어스타일"""
    out = subprocess.run(['node', '-e', "global.window={};require('./lib/prompt-spec.js');const S=window.AtelierSpec;"
                          f"const K={json.dumps(HAIR_KEYS)};"
                          "process.stdout.write(JSON.stringify({defs:S.PARAM_DEFS.filter(d=>K.includes(d.key)),only:S.ONLY,limits:S.HAIR_LENGTH_LIMITS,keys:S.HAIR_KEYS||null}))"],
                         cwd=ROOT, capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    by = {d['key']: d for d in j['defs']}
    opts = {k: [o[0] for o in by[k]['options'] if o[0] and o[0] != '__custom__'] for k in HAIR_KEYS}
    ko = {k: {o[0]: o[1].split('— ', 1)[-1] for o in by[k]['options']} for k in HAIR_KEYS}
    name = {k: by[k]['ko'] for k in HAIR_KEYS}
    male = {k: {v for v, s in (j['only'].get(k) or {}).items() if s == 'male'} for k in HAIR_KEYS}
    female = {k: [v for v in opts[k] if v not in male[k]] for k in HAIR_KEYS}
    assert j['keys'] is None or j['keys'] == HAIR_KEYS, ('HAIR_KEYS 가 생성기와 다르다', j['keys'])
    assert set(female[HS]) == set(HAIR_LEN), ('HAIR_LEN 이 여성 헤어스타일 전부를 덮지 않는다', set(female[HS]) ^ set(HAIR_LEN))
    assert set(sum(FAMILY.values(), [])) == set(HAIR_LEN) and set(ELAB) == set(HAIR_LEN)
    assert all(set(v) <= set(opts[HB]) for v in BANGS_OK.values()) and set(BANGS_BASE) == set(opts[HB])
    return {'opts': opts, 'ko': ko, 'name': name, 'male': male, 'female': female, 'limits': j['limits']}


# ── 확정한 그림의 머리 — 그림 저장소의 기록(records)에서 읽는다(읽기만) ─────────────────────────
RECORD_DIRS = [os.path.join(ROOT, '..', d) for d in ('pkm-atelier-img/records', 'pkm-atelier-img/generation', 'pkm-atelier-img-2/records', 'pkm-atelier-img-3/records', 'pkm-atelier-img-4/records')]
RECORD_SKIP = re.compile(r'reject|before|initial|attempt|not-selected|original|previous|retry|repair|kept-|targeted|revised|framing', re.I)
CANON_LEN = {'pixie cut': 'short', 'bob': 'short', 'side-shaved long hair': 'long', 'buzz cut': 'very short', 'crew cut': 'very short'}
FAM_EXTRA = {'swept back': 'sleek', 'side part': 'crop', 'mullet': 'layer', 'buzz cut': 'crop', 'crew cut': 'crop', 'fade': 'crop', 'man bun': 'bun'}


def record_dirs():
    env = os.environ.get('PKM_RECORDS')
    dirs = env.split(os.pathsep) if env else RECORD_DIRS
    return [os.path.abspath(d) for d in dirs if os.path.isdir(d)]


def working_cards():
    """살아 있는(24시간 안) 일상컷 예약의 카드 이름 — 그 세션이 이미 이 표의 HAIR 줄로 ①을 만들었을 수 있다"""
    out = set()
    d = os.path.join(ROOT, '..', 'pkm-atelier-img-2', 'records', 'casual-reservations')
    now = datetime.datetime.now(datetime.timezone.utc)
    for f in (sorted(os.listdir(d)) if os.path.isdir(d) else []):
        try:
            j = json.load(open(os.path.join(d, f), encoding='utf-8'))
        except (ValueError, OSError):
            continue
        for c in j.get('characters') or []:
            try:
                t = datetime.datetime.fromisoformat(c.get('at') or j.get('at'))
            except (TypeError, ValueError):
                continue
            if (now - t).total_seconds() < 24 * 3600 and c.get('card'): out.add(c['card'])
    return out


def light_registered(img):
    return {n for n, v in img.items() if any('light' in (s.get('byForm') or {}) for s in (v.get('byStyle') or {}).values())}


def read_records(dirs):
    """카드 이름 → 경장 ① 새 인물 기록들 [(종류, 경로, {항목: 원래 값}, HAIR 줄 있음)]. 종류 ui = 화면 저장값, prompt = 제출한 프롬프트"""
    found = {}
    def from_prompt(t, path):
        if not t.startswith('INPUT: text only') or 'FORM — LIGHT' not in t: return
        m = re.search(r'SOURCE: [^\n]*?\(([^)\n]+)\)', t)
        if not m: return
        vals = {}
        for k in HAIR_KEYS:
            mm = re.search(r'^' + re.escape(k) + r': (.+?)(?: — |$)', t, re.M)
            if mm: vals[k] = mm.group(1).strip()
        found.setdefault(m.group(1), []).append(('prompt', path, vals, '\n\nHAIR: ' in t))
    def walk(o, path):
        if isinstance(o, dict):
            st = o.get('storage')
            if isinstance(st, dict) and isinstance(st.get('cards'), dict):
                c = st['cards'].get(st.get('last'))
                if isinstance(c, dict) and c.get('form') == 'light' and c.get('identityMode') == 'create' and c.get('mode', 'action') == 'action':
                    p = c.get('params') if isinstance(c.get('params'), dict) else {}
                    found.setdefault(st['last'], []).append(('ui', path, {k: p[k] for k in HAIR_KEYS if isinstance(p.get(k), str) and p[k]}, False))
            for v in o.values(): walk(v, path)
        elif isinstance(o, list):
            for v in o: walk(v, path)
        elif isinstance(o, str) and o.startswith('INPUT: text only'): from_prompt(o, path)
    for d in dirs:
        for dp, dn, fn in os.walk(d):
            dn.sort()
            for f in sorted(fn):
                p = os.path.join(dp, f)
                if RECORD_SKIP.search(os.path.relpath(p, d)): continue
                rel = os.path.relpath(p, os.path.join(ROOT, '..'))
                try:
                    if f.endswith('.txt'): from_prompt(open(p, encoding='utf-8', errors='replace').read(), rel)
                    elif f.endswith('.json'): walk(json.load(open(p, encoding='utf-8')), rel)
                except (ValueError, OSError):
                    continue
    return found


def norm_hair(raw, H):
    """기록에 적힌 값 → 생성기 열쇠. 직접 쓴 말(short bob·long wavy)도 가까운 열쇠로. 못 읽으면 그 항목은 비운다"""
    out = {}
    s = (raw.get(HS) or '').strip().lower()
    if s:
        m = re.match(r'(very short|very long|short|medium|long|sleek)\s+(.+)$', s)
        st, ln = (m.group(2), m.group(1)) if m and s not in H['opts'][HS] else (s, None)
        st = {'shag': 'shaggy'}.get(st, st)
        if st not in H['opts'][HS]:
            st = 'bob' if 'bob' in st else 'ponytail' if st.endswith('ponytail') else None
        if st: out[HS] = st
        if ln in LENGTHS and not raw.get(HL): out[HL] = ln
    L = (raw.get(HL) or '').strip()
    if L in H['opts'][HL]: out[HL] = L
    elif L and out.get(HS) in CANON_LEN and H['limits'].get(out[HS], ['', ''])[1] == L: out[HL] = CANON_LEN[out[HS]]
    b = (raw.get(HB) or '').strip()
    if b in H['opts'][HB]: out[HB] = b
    return out


def pick_record(ev):
    """한 종의 기록 가운데 정본 하나 — 화면 저장값(ui)이 프롬프트보다, light-ui.json·light.txt 가 다른 이름보다 먼저"""
    main = ('light-ui.json', 'light.txt', 'light-prompt.txt', 'light.json')
    return sorted(ev, key=lambda e: (e[0] != 'ui', os.path.basename(e[1]) not in main, e[1]))[0]


def hair_score(card, rec, depth, final, H):
    sc = {k: {o: 0.0 for o in H['opts'][k]} for k in HAIR_KEYS}
    for b, w in BANGS_BASE.items(): sc[HB][b] += w
    for L, w in LEN_BASE.items(): sc[HL][L] += w
    why = {k: {o: [] for o in H['opts'][k]} for k in HAIR_KEYS}
    def add(tab, label, mul=1.0):
        for k, d in tab.items():
            for o, w in d.items():
                if o in sc[k]:
                    sc[k][o] += w * mul
                    if w * mul >= .6 and label not in why[k][o]: why[k][o].append(label)
    hits = {}
    for f in (rec or {}).get('features', []):
        part = f.get('part', '').lower()
        text = (part + ' ' + f.get('detail', '')).lower()
        quote = '‘' + f.get('detail', '') + '’'
        if part == 'hair':
            for rx, tab in HAIR_PART:
                if re.search(rx, text): add(tab, quote + '(원작의 머리칼)', 1.4)
            continue
        for i, (rx, label, tab, body) in enumerate(HAIR_CUES):
            if body and part not in BODY_PARTS: continue
            if not re.search(rx, text): continue
            hits[i] = hits.get(i, 0) + 1
            if hits[i] > 2: continue
            add(tab, quote)
    shape = (rec or {}).get('shape') or card.get('shape')
    if shape in HAIR_SHAPE: add(HAIR_SHAPE[shape], '몸 형태 ' + shape)
    for t in [card.get('element'), card.get('element2')]:
        if t in HAIR_TYPE: add(HAIR_TYPE[t], TYPE_KO.get(t, t) + ' 타입')
    hm = card.get('h') or 0
    if 0 < hm <= .5: add({HS: {'pixie cut': .8, 'bob': .8, 'twin tail': .5, 'space buns': .5}, HL: {'short': .9, 'very short': .4}}, f'키 {hm:g}m')
    elif hm <= .9: add({HL: {'short': .3, 'medium': .5}}, f'키 {hm:g}m')
    elif hm < 1.6: add({HL: {'medium': .3, 'long': .4}}, f'키 {hm:g}m')
    elif hm < 2.5: add({HL: {'long': .6, 'very long': .2}}, f'키 {hm:g}m')
    else: add({HL: {'very long': .8, 'long': .4}, HS: {'straight': .4, 'braid': .4}}, f'키 {hm:g}m')
    if depth == 0 and not final: add({HL: {'short': .3, 'medium': .3}}, '진화 전 단계')
    if depth >= 1 and final: add({HL: {'long': .4, 'very long': .3}}, '최종 진화')
    egg = card.get('egg') or []
    if 'no-eggs' in egg and not card.get('from') and not card.get('to'):
        add({HS: {'chignon': .6, 'crown braid': .5, 'hime cut': .4, 'ringlet curls': .4}, HL: {'very long': .4}}, '전설·환상')
    elif 'no-eggs' in egg and card.get('to'):
        add({HS: {'pixie cut': .5, 'space buns': .5, 'twin tail': .4}}, '아기 단계')
    return sc, why


def hair_fam(s):
    return FAM_OF.get(s) or FAM_EXTRA.get(s)


def hair_edge_ok(p, c):
    """진화 한 걸음(p → c)에서 머리가 이어지나 — 같은 묶음에서 길이가 줄지 않거나, 이어지는 묶음으로 더 공들인 쪽"""
    a, b = p.get(HS), c.get(HS)
    if not a or not b: return True
    la, lb = p.get(HL), c.get(HL)
    longer = not la or not lb or LENGTHS.index(lb) >= LENGTHS.index(la)
    fa, fb = hair_fam(a), hair_fam(b)
    if fa == fb: return longer
    return fb in GROW.get(fa, set()) and ELAB.get(b, 1) >= ELAB.get(a, 1) and longer


def hair_triple(v):
    return tuple(v.get(k) for k in HAIR_KEYS)


def hair_caps(n):
    return {'all': int(HAIR_CAP * n), 'bob': int(BOB_CAP * n)}


def design_hair(cards, app, img, old, roots, H):
    """1,025종 머리. 확정한 ①이 있는 종은 기록값으로 잠그고, 나머지를 도감 번호 차례로 고른다"""
    n = len(cards)
    by = {c['name']: c for c in cards}
    caps = hair_caps(n)
    styles = H['female'][HS]
    def depth(c):
        d, cur, seen = 0, c, set()
        while cur.get('from') in by and cur['name'] not in seen:
            seen.add(cur['name']); cur = by[cur['from']]; d += 1
        return d
    reg = light_registered(img)
    dirs = record_dirs()
    found = read_records(dirs) if dirs else {}
    if not dirs: print('[머리] 그림 저장소 기록이 없다 — 잠금은 json 의 이전 값을 쓴다')
    out, locked = {}, {}
    for c in cards:
        if c['name'] not in reg: continue
        prev = (old.get(str(c['no'])) or {})
        if dirs:
            ev = found.get(c['name'], [])
            if ev:
                kind, path, raw, line = pick_record(ev)
                vals = norm_hair(raw, H)
                if any(e[3] for e in ev) and prev.get('hair'):   # HAIR 줄로 확정한 값은 잠근 뒤 다시 build 해도 보존한다
                    vals = {**{k: v for k, v in prev['hair'].items() if k in HAIR_KEYS}, **vals}
                rec = {'path': path, 'kind': kind, 'raw': raw}
            else:
                vals, rec = {}, None
        else:
            vals, rec = (prev.get('hair') or {}, prev.get('hair_record')) if prev.get('hair_locked') else ({}, None)
        locked[c['name']] = (vals, rec)
    cnt, bcnt, lcnt = {}, {}, {}
    def put(name, v):
        out[name] = v
        if v.get(HS): cnt[v[HS]] = cnt.get(v[HS], 0) + 1
        if v.get(HL): lcnt[v[HL]] = lcnt.get(v[HL], 0) + 1
        if v.get(HB): bcnt[v[HB]] = bcnt.get(v[HB], 0) + 1
    for name, (v, _) in locked.items(): put(name, v)
    cap = {s: max(caps['bob' if s == 'bob' else 'all'], cnt.get(s, 0)) for s in H['opts'][HS]}
    target_s, target_l, target_b = n / len(styles), n / len(LENGTHS), n / len(H['opts'][HB])
    kids = {}
    for c in cards:
        if c.get('from') in by: kids.setdefault(c['from'], []).append(c['name'])
    order = sorted(cards, key=lambda c: c['no'])
    no_of = {c['name']: c['no'] for c in cards}
    at = {c['no']: c['name'] for c in cards}
    line_of = {}
    for c in cards: line_of.setdefault(roots[c['name']], []).append(c['name'])
    res = {}
    scores = {c['name']: hair_score(c, app.get(str(c['no'])), depth(c), not c.get('to'), H) for c in order if c['name'] not in locked}
    cur = {c['name']: (out.get(c['name']) or (old.get(str(c['no'])) or {}).get('hair') or {}) for c in order}
    def fits(nm, st):
        """지금 계열(부모·자식)의 머리와 이어지는 길이가 하나라도 있나"""
        c = by[nm]
        par = [cur[c['from']]] if c.get('from') in cur and cur[c['from']].get(HS) else []
        ch = [cur[k] for k in kids.get(nm, []) if cur.get(k, {}).get(HS)]
        return any(all(hair_edge_ok(pp, {HS: st, HL: L}) for pp in par) and all(hair_edge_ok({HS: st, HL: L}, k) for k in ch) for L in HAIR_LEN[st])
    have = {}
    for nm, v in cur.items():
        if v.get(HS): have[v[HS]] = have.get(v[HS], 0) + 1
    fill, taken = set(), working_cards()   # 다른 세션이 지금 만드는 종(살아 있는 일상컷 예약)은 바꾸지 않는다
    for st in sorted((x for x in styles if have.get(x, 0) < FILL_MIN), key=lambda x: (have.get(x, 0), x)):
        best = sorted(((v[0][HS][st], -no_of[nm], nm) for nm, v in scores.items()
                       if v[0][HS][st] >= FILL_SCORE and nm not in taken and fits(nm, st)), reverse=True)
        for _, _, nm in best[:FILL_MIN - have.get(st, 0)]:
            fill.add((nm, st)); taken.add(nm)
    for c in order:
        name, no = c['name'], c['no']
        if name in locked: continue
        sc, why = scores[name]
        prev = old.get(str(no)) or {}
        if prev.get('hair') and not prev.get('hair_locked'):
            for k, v in prev['hair'].items():
                if k in sc and v in sc[k]: sc[k][v] += 2.5
        mates = [m for m in line_of[roots[name]] if m != name and m in out]
        rel = [out[m] for m in ([c['from']] if c.get('from') in out else [])], [out[k] for k in kids.get(name, []) if k in out]
        near = [out[at[j]] for j in range(no - 4, no + 5) if j != no and j in at and at[j] in out and roots[at[j]] != roots[name]]
        adj = [out[at[j]] for j in (no - 1, no + 1) if j in at and at[j] in out and roots[at[j]] != roots[name]]
        fams = {hair_fam(out[m].get(HS)) for m in mates if out[m].get(HS)}
        pb = [p.get(HB) for p in rel[0] if p.get(HB)]
        cands = []
        for s in styles:
            for L in HAIR_LEN[s]:
                for b in BANGS_OK.get(s, H['opts'][HB]):
                    raw = sc[HS][s] + sc[HL][L] + sc[HB][b]
                    v = raw - H_BAL * cnt.get(s, 0) / target_s - L_BAL * lcnt.get(L, 0) / target_l - B_BAL * bcnt.get(b, 0) / target_b
                    v -= NEAR_PEN * sum(1 for x in near if x.get(HS) == s)
                    if FAM_OF[s] in fams: v += .8
                    if (name, s) in fill: v += FILL_PULL
                    if b in pb: v += .5
                    cands.append((v, raw, {HS: s, HL: L, HB: b}))
        def fails(t):
            bad = []
            if cnt.get(t[HS], 0) >= cap[t[HS]]: bad.append('cap')
            if not all(hair_edge_ok(p, t) for p in rel[0]) or not all(hair_edge_ok(t, k) for k in rel[1]): bad.append('edge')
            if any(hair_triple(out[m]) == hair_triple(t) for m in mates): bad.append('same')
            if any(x.get(HS) == t[HS] for x in adj): bad.append('adj')
            return bad
        cands.sort(key=lambda x: (-x[0], hair_triple(x[2])))
        top = max(enumerate(cands), key=lambda e: (e[1][1], -e[0]))[1][2]
        chosen, relaxed = None, []
        for allow in ([], ['adj'], ['adj', 'same'], ['adj', 'same', 'edge']):
            for v, raw, t in cands:
                if not [f for f in fails(t) if f not in allow]: chosen = t; break
            if chosen: relaxed = allow; break
        assert chosen, name
        put(name, chosen)
        cues = []
        for k in HAIR_KEYS:
            for lab in why[k][chosen[k]][:1]: cues.append(f"{lab} → {H['name'][k]} {H['ko'][k][chosen[k]]}")
        note = []
        if chosen[HS] != top[HS]:
            reason = fails(top)
            what = {'cap': '헤어스타일 상한(8%·보브 4%)에 닿아', 'edge': '진화 계열의 머리 잇기 규칙에 맞추려고',
                    'same': '같은 계열 종과 머리가 똑같아', 'adj': '도감 바로 옆 다른 계열과 헤어스타일이 겹쳐'}
            note.append((what[reason[0]] if reason else '많이 쓴 헤어스타일이라 고르게 나누려고') +
                        f" {H['ko'][HS][top[HS]]} → {H['ko'][HS][chosen[HS]]}")
        if not note and prev.get('hair') == chosen and not prev.get('hair_locked'):   # 다시 돌려 같은 머리면 앞서 적은 조정을 남긴다
            old_note = (prev.get('adjusted') or '').split(HAIR_ADJ, 1)
            if len(old_note) == 2: note.append(old_note[1])
        if relaxed: note.append('풀 수 없어 ' + '·'.join({'adj': '옆 번호 다름', 'same': '계열 안 다름', 'edge': '계열 잇기'}[r] for r in relaxed) + ' 규칙을 늦춤')
        labels = []
        for k in (HS, HL, HB):
            for l in why[k][chosen[k]]:
                if l not in labels: labels.append(l)
        reasons = [l for l in labels if l.startswith('‘')][:2] + [l for l in labels if not l.startswith('‘')][:1]
        res[name] = {'cues': cues[:4], 'adjusted': ' '.join(note),
                     'why': ('·'.join(reasons) + '에서 ' if reasons else '원작 단서가 적어 분포가 빈 쪽에서 ') +
                            f"{H['ko'][HS][chosen[HS]]}{'' if FAM_KO[FAM_OF[chosen[HS]]] in H['ko'][HS][chosen[HS]] else '(' + FAM_KO[FAM_OF[chosen[HS]]] + ')'} · {H['ko'][HL][chosen[HL]]} · {H['ko'][HB][chosen[HB]]}"
                            + (f" — {by[c['from']]['name'] if c.get('from') in by else ''}에서 이어 {'같은 묶음' if c.get('from') in out and hair_fam(out[c['from']].get(HS)) == FAM_OF[chosen[HS]] else '더 공들인 묶음'}" if c.get('from') in out and out[c['from']].get(HS) else '')}
    for name, (v, rec) in locked.items():
        if rec and v:
            why = f"확정한 ① 그림의 기록값({rec['path']})을 그대로 따른다 — 표가 그림과 어긋나지 않게 잠금"
        elif rec:
            why = f"확정한 ① 그림이 정본 — 기록({rec['path']})에 머리 선택이 없어(모델 기본) 표가 정하지 않는다"
        else:
            why = '확정한 ① 그림이 정본 — 머리 기록을 찾지 못해 표가 정하지 않는다'
        res[name] = {'cues': [], 'adjusted': '', 'why': why, 'record': rec}
    return out, res, locked


def hair_items(hair, limits):
    """생성기 HAIR 줄(lib/prompt-anthro.js hairItems)과 같은 낱말 — 문서에 그대로 보인다"""
    s, L, b = hair.get(HS), hair.get(HL), hair.get(HB)
    parts = []
    if s: parts.append((L + ' ' if L and s not in limits else '') + s)
    elif L: parts.append(L + ' hair')
    if b: parts.append('no bangs' if b == 'none' else b)
    return parts


def hair_line(hair, limits):
    p = hair_items(hair, limits)
    return 'HAIR: ' + ', '.join(p) + '.' if p else ''


def check_hair(faces, cards, img, H, quiet=False):
    bad = []
    n = len(cards)
    caps = hair_caps(n)
    roots = lines_of(cards)
    by = {c['name']: c for c in cards}
    reg = light_registered(img)
    cnt, lcnt = {}, {}
    for c in cards:
        f = faces.get(str(c['no'])) or {}
        h = f.get('hair')
        if not isinstance(h, dict): bad.append(f"{c['name']} 머리 없음"); continue
        # 잠금은 경장 ①이 등록된 종에만. 등록됐는데 안 잠긴 종은 이 표의 HAIR 줄로 만든 그림이라 표 = 그림이다(build 가 기록을 읽어 잠근다)
        if f.get('hair_locked') and c['name'] not in reg: bad.append(f"{c['name']} 경장 ①이 등록되지 않았는데 hair_locked")
        if not f.get('hair_why'): bad.append(f"{c['name']} hair_why 없음")
        for k, v in h.items():
            if k not in HAIR_KEYS or v not in H['opts'][k]: bad.append(f"{c['name']} 머리 {k}={v} 는 생성기에 없는 값")
        if h.get(HS):
            cnt[h[HS]] = cnt.get(h[HS], 0) + 1
            if f.get('hair_locked'): lcnt[h[HS]] = lcnt.get(h[HS], 0) + 1
        if f.get('hair_locked'): continue
        if set(h) != set(HAIR_KEYS): bad.append(f"{c['name']} 머리 항목 셋이 다 없다"); continue
        if any(h[k] in H['male'][k] for k in HAIR_KEYS): bad.append(f"{c['name']} 남성 전용 머리 {h}")
        if h[HL] not in HAIR_LEN.get(h[HS], []): bad.append(f"{c['name']} {h[HS]} 에 맞지 않는 길이 {h[HL]}")
        if h[HB] not in BANGS_OK.get(h[HS], H['opts'][HB]): bad.append(f"{c['name']} {h[HS]} 에 맞지 않는 앞머리 {h[HB]}")
    for s, k in cnt.items():
        cap = caps['bob' if s == 'bob' else 'all']
        if k > max(cap, lcnt.get(s, 0)): bad.append(f'헤어스타일 {s} {k}종 — 상한 {cap}(확정 그림 {lcnt.get(s, 0)})을 넘는다')
    hair = {c['name']: (faces.get(str(c['no'])) or {}).get('hair') or {} for c in cards}
    lock = {c['name']: bool((faces.get(str(c['no'])) or {}).get('hair_locked')) for c in cards}
    for c in cards:
        p = c.get('from')
        if p in by and not (lock[p] and lock[c['name']]) and not hair_edge_ok(hair[p], hair[c['name']]):
            bad.append(f"계열 잇기: {p} {hair_triple(hair[p])} → {c['name']} {hair_triple(hair[c['name']])}")
    line = {}
    for c in cards: line.setdefault(roots[c['name']], []).append(c['name'])
    for ms in line.values():
        for i in range(len(ms)):
            for j in range(i + 1, len(ms)):
                a, b = ms[i], ms[j]
                if lock[a] and lock[b]: continue
                if hair[a].get(HS) and hair_triple(hair[a]) == hair_triple(hair[b]): bad.append(f'같은 계열 {a}·{b} 머리가 똑같다')
    order = sorted(cards, key=lambda c: c['no'])
    for x, y in zip(order, order[1:]):
        if roots[x['name']] == roots[y['name']] or (lock[x['name']] and lock[y['name']]): continue
        s = hair[x['name']].get(HS)
        if s and s == hair[y['name']].get(HS): bad.append(f"도감 옆 번호 {x['no']}·{y['no']} 다른 계열인데 헤어스타일 {s} 가 같다")
    dirs = record_dirs()
    if dirs:   # 기록이 있는 곳에서는 잠근 값이 기록과 같은지 다시 읽어 본다
        found = read_records(dirs)
        for c in cards:
            f = faces.get(str(c['no'])) or {}
            if not f.get('hair_locked'): continue
            ev = found.get(c['name'])
            if not ev:
                if f.get('hair_record'): bad.append(f"{c['name']} 잠근 기록 {f['hair_record'].get('path')} 을 찾지 못했다")
                continue
            kind, path, raw, _ = pick_record(ev)
            want = norm_hair(raw, H)
            if any(f['hair'].get(k) != v for k, v in want.items()): bad.append(f"{c['name']} 잠근 머리 {f['hair']} 가 기록 {path} {want} 와 다르다")
    if not quiet:
        top = sorted(cnt.items(), key=lambda x: -x[1])[:10]
        print(f"[머리] 잠금 {sum(lock.values())} · 헤어스타일 {len(cnt)}가지 · 많은 순 " + ' '.join(f'{s} {k}' for s, k in top) + f' · 문제 {len(bad)}')
    return bad


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


HAIR_ADJ = '[머리] '


def face_adjusted(text):
    """adjusted 에서 얼굴 몫만 — 머리 조정은 '[머리] ' 뒤에 붙는다"""
    return '' if text.startswith(HAIR_ADJ) else text.split(' ' + HAIR_ADJ)[0]


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
                          'cues': cues[:6], 'adjusted': ' '.join(clash) or (face_adjusted((prev or {}).get('adjusted', '')) if prev and prev.get('face') == chosen else '')}
    H = hair_spec()
    hair, hres, locked = design_hair(cards, app, img, old, root, H)
    for c in cards:
        f, r = faces[str(c['no'])], hres[c['name']]
        f['hair'] = {k: hair[c['name']][k] for k in HAIR_KEYS if hair[c['name']].get(k)}
        f['hair_locked'] = c['name'] in locked
        f['hair_why'] = r['why']
        f['hair_cues'] = r['cues']
        if f['hair_locked']: f['hair_record'] = r['record']
        if r['adjusted']: f['adjusted'] = (f['adjusted'] + ' ' if f['adjusted'] else '') + HAIR_ADJ + r['adjusted']
    out = {'version': 1,
           'note': 'tools/face-design.py 가 만든다. 값은 생성기 얼굴 항목(lib/prompt-spec.js)의 열쇠 그대로이고, 새 인물(경장 ①)에만 FACE 줄로 실린다. 손으로 고치면 build 를 다시 돌려 겹침 검사를 받는다. faces: 번호 → {name,en,line,how,registered,face:{얼굴 항목: 값},why,cues,adjusted,hair:{hairstyle,hair length,bangs},hair_locked,hair_why,hair_cues,hair_record?}. hair 는 생성기 머리 항목 열쇠 그대로이고 FACE 뒤 HAIR 줄로 실린다. hair_locked 는 경장 ①이 등록된 종 — 그림 저장소 기록의 값(없으면 빈 hair)을 따른다.',
           'rules': {'lineMin': LINE_MIN, 'globalMin': GLOBAL_MIN, 'groups': [g for g, _ in GROUPS],
                     'hair': {'keys': HAIR_KEYS, 'cap': HAIR_CAP, 'bobCap': BOB_CAP, 'lengths': LENGTHS, 'length': HAIR_LEN, 'bangs': BANGS_OK,
                              'family': FAMILY, 'familyLocked': FAM_EXTRA, 'grow': {k: sorted(v) for k, v in GROW.items()}, 'elab': ELAB}},
           'sources': ['data/card.json', 'data/source-appearance.json (Bulbapedia contributors, CC BY-NC-SA 2.5)'],
           'faces': faces}
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=0, separators=(',', ':'))
        f.write('\n')
    print(f'[얼굴] {len(faces)}종 · 겹침 풀이로 옮긴 종 {sum(1 for v in faces.values() if face_adjusted(v["adjusted"]))} · 전체 기준을 낮춘 종 {len(fallback)}')
    print(f'[머리] 잠금 {len(locked)} · 옮긴 종 {sum(1 for r in hres.values() if r["adjusted"])}')
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
        # 그림은 날마다 올라온다 — build 뒤에 등록된 종(registered 가 아직 거짓)은 다음 build 까지 기다린다. 등록 안 된 종이 registered 면 틀렸다
        if f.get('registered') and c['name'] not in img: bad.append(f"{c['name']} registered 인데 img.json 에 없다")
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
    bad += check_hair(faces, cards, img, hair_spec(), quiet)
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
    H = hair_spec()
    hcount = {}
    for f in faces.values():
        if f['hair'].get(HS): hcount[f['hair'][HS]] = hcount.get(f['hair'][HS], 0) + 1
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
        '- 머리색·눈색·피부색·체형은 이 표가 정하지 않는다(생성기의 다른 외형 항목). 헤어스타일·길이·앞머리는 아래 "머리" 규칙으로 정한다.',
        '',
        '## 머리',
        '',
        '생성기가 머리를 스스로 고르면 몇 가지로 몰렸다(그림 기록 84종 중 보브 23·웨이브 13·하이 포니테일 8). 그래서 얼굴처럼 종마다',
        '헤어스타일·길이·앞머리를 원작 단서로 고르고, **생성기가 새 인물(경장 ①)에만 FACE 뒤에 `HAIR:` 줄로 싣는다** — 같은 칸에서 끄고,',
        '헤어스타일을 직접 고르면 HAIR 줄이 통째로, 길이만 고르면 컷과 길이가, 앞머리만 고르면 앞머리가 빠진다.',
        '',
        '- 값은 생성기 머리 항목의 열쇠 그대로다. 인물은 모두 여성이라 남성 전용 값(버즈컷·크루컷·페이드·맨번·멀릿·사이드 파트·스웹트 백·섀기)은 쓰지 않는다.',
        '- 길이는 컷에 맞춘다(`HAIR_LENGTH_LIMITS` 와 같은 뜻 — 픽시는 짧게, 보브는 짧은 머리, 한쪽 민 긴 머리는 길게). 히메컷은 일자 앞머리, 넘긴 머리는 앞머리 없음.',
        f'- 한 헤어스타일은 1,025종의 {int(HAIR_CAP * 100)}%(={hair_caps(len(faces))["all"]}종), 보브는 {int(BOB_CAP * 100)}%(={hair_caps(len(faces))["bob"]}종)를 넘지 않는다. 확정한 그림이 이미 그보다 많으면 새로 고르지 않는다.',
        '- 같은 진화 계열은 같은 묶음(' + ' · '.join(f'{FAM_KO[k]}' for k in FAMILY) + ') 안에서 길이가 줄지 않거나, 이어지는 묶음으로 더 공들인 쪽으로 간다. 계열 안 두 종이 똑같지는 않고, 도감 바로 옆 번호의 다른 계열과는 헤어스타일이 다르다.',
        '- **경장 ①이 등록된 종은 그림 저장소 기록(`records/*-ui.json`·제출 프롬프트)의 값으로 잠근다**(`hair_locked`). 기록에 머리 선택이 없으면(모델 기본) 표가 정하지 않는다.',
        '',
        '## 지금 상태',
        '',
        f'- 서로 다른 얼굴 {len(set(G))} / {len(faces)} · 넷 이상 같은 쌍 {near} · 규칙 위반 {len(bad)}',
        f'- 직접 쓴 설계 {sum(1 for f in faces.values() if f["how"] == "species")}종, 원작 단서 규칙으로 고른 것 {sum(1 for f in faces.values() if f["how"] == "draft")}종 · 겹침을 풀며 옮긴 종 {sum(1 for f in faces.values() if face_adjusted(f["adjusted"]))} · 머리를 옮긴 종 {sum(1 for f in faces.values() if HAIR_ADJ in f["adjusted"])}',
        f'- 그림이 이미 있는 종(①이 정본) {sum(1 for f in faces.values() if f["registered"])}',
        '- 항목별로 쓰인 값의 수: ' + ' · '.join(f"{name[k]} {len({f['face'][k] for f in faces.values()})}/{len(opts[k])}" for k in keys),
        f'- 머리: 확정 그림으로 잠근 종 {sum(1 for f in faces.values() if f.get("hair_locked"))}(기록값 있음 {sum(1 for f in faces.values() if f.get("hair_locked") and f["hair"])}) · 새로 고른 종 {sum(1 for f in faces.values() if not f.get("hair_locked"))}',
        '- 헤어스타일 분포(잠금 포함): ' + ' · '.join(f"{H['ko'][HS][s]} {k}" for s, k in sorted(hcount.items(), key=lambda x: (-x[1], x[0]))),
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
                    f"| 입 | {ko['lips'][t['lips']]} |",
                    '| 머리 | ' + (' · '.join(f"{H['name'][k]} {H['ko'][k][f['hair'][k]]}" for k in HAIR_KEYS if f['hair'].get(k)) or '정하지 않음') +
                    (' (확정 그림으로 잠금)' if f.get('hair_locked') else '') + ' |', '']
            if f['why']: out += [f"**이유:** {f['why']}", '']
            if f.get('hair_why'): out += [f"**머리:** {f['hair_why']}", '']
            if f.get('hair_cues'): out += ['**머리 단서:** ' + ' · '.join(f['hair_cues']), '']
            if f['cues']: out += ['**원작 단서:** ' + ' · '.join(f['cues']), '']
            if f['adjusted']: out += [f"**조정:** {f['adjusted']}", '']
            out += ['```text', face_line(f, keys, opts), '```', '']
            if hair_line(f['hair'], H['limits']): out += ['```text', hair_line(f['hair'], H['limits']), '```', '']
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
