# -*- coding: utf-8 -*-
"""자료 파일 읽기·쓰기. atelier 의 roster.py 에서 주제와 무관한 몫만 가져왔다.

카드 모양이 다르다 — atelier 는 종류 넷(mech·pilot·ship·crew)이 각자 파일을
가졌지만 여기는 data/card.json 하나에 kinds 로 갈래를 적는다."""
import json, os, re

DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
ART_SIZE = (1024, 1536)          # 2:3 세로. 폼 초상은 이 크기로 맞춘다


def path(name):
    return os.path.join(DIR, name if name.endswith(".json") else name + ".json")


def read(name):
    with open(path(name), encoding="utf-8") as f:
        return json.load(f)


def cards():
    """{카드 이름: 카드} — 갈래가 여럿이어도 한 자리로 모아 준다."""
    out = {}
    for kind, lst in (read("card").get("cards") or {}).items():
        for c in lst:
            c = dict(c, kind=kind)
            out[c["name"]] = c
    return out


def forms():
    """폼 key → 정의. 차례가 화면에 그대로 나가므로 dict 로 돌려준다."""
    return read("card").get("forms") or {}


def styles():
    """화풍 key → 이름. prompt-spec.js에서 동기화한 style.json을 읽는다."""
    return {r["key"]: r["name"] for r in read("style")["styles"]}


def one_line(v):
    """줄바꿈 없이 한 줄로. 항목 하나가 한 줄이면 diff 로 바로 읽힌다."""
    return json.dumps(v, ensure_ascii=False, separators=(", ", ": "))


def _render(obj):
    def val(v, pad):
        if isinstance(v, list) and v and isinstance(v[0], dict):
            return "[\n" + ",\n".join(pad + " " + one_line(x) for x in v) + "\n" + pad + "]"
        if isinstance(v, dict) and len(v) > 8:
            return ("{\n" + ",\n".join('%s "%s": %s' % (pad, k, val(x, pad + " "))
                                       for k, x in v.items()) + "\n" + pad + "}")
        return one_line(v)
    return "{\n" + ",\n".join(' "%s": %s' % (k, val(v, " "))
                              for k, v in obj.items()) + "\n}\n"


def write(name, obj):
    open(path(name), "w", encoding="utf-8").write(_render(obj))


def _webp_size(rel):
    """webp 머리말에서 가로·세로만 읽는다. 외부 꾸러미 없이."""
    try:
        b = open(os.path.join(os.path.dirname(DIR), rel), "rb").read(64)
    except OSError:
        return None
    if b[:4] != b"RIFF" or b[8:12] != b"WEBP":
        return None
    if b[12:16] == b"VP8X":
        return (int.from_bytes(b[24:27], "little") + 1,
                int.from_bytes(b[27:30], "little") + 1)
    if b[12:16] == b"VP8L":
        n = int.from_bytes(b[21:25], "little")
        return ((n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1)
    if b[12:16] == b"VP8 ":
        return (int.from_bytes(b[26:28], "little") & 0x3FFF,
                int.from_bytes(b[28:30], "little") & 0x3FFF)
    return None


# 일상컷 화면비(2026-11-23) — 계획(생성기 저장값 scenes.casual.aspect)이 정한다: 눕는 자세 · 환경 컷 3:2, 허리 위 · 3/4 1:1, 나머지 2:3.
# 그림 API 가 받는 크기 셋뿐. 폼 초상은 ART_SIZE 하나, 이미 그린 일상컷은 2:3 그대로
ASPECT_SIZES = {"2:3": (1024, 1536), "1:1": (1024, 1024), "3:2": (1536, 1024)}
CASUAL_FILE = re.compile(r"_casual\d+\.webp$")
CASUAL_UI = re.compile(r"^(casual\d+)-ui\.json$")


def planned_aspects(dirs=("img",)):
    """{webp 이름: 화면비} — 그림 저장소 records/<폴더>/casualN-ui.json(생성기 저장값 — 카드 이름 · 화풍 · scenes.casual.aspect).
    파일 이름은 <카드>_<화풍>_f_casualN.webp(tools/image-runner.py filename). 기록이 없으면 빈 것"""
    root, out = os.path.dirname(DIR), {}
    for rel in dirs:
        d = rel if os.path.isabs(rel) else os.path.join(root, rel)
        rec = os.path.join(os.path.dirname(os.path.realpath(d)), "records")
        if not os.path.isdir(rec):
            continue
        for base, _, files in os.walk(rec):
            for f in files:
                m = CASUAL_UI.match(f)
                if not m:
                    continue
                try:
                    st = (json.load(open(os.path.join(base, f), encoding="utf-8")) or {}).get("storage") or {}
                except (OSError, ValueError, AttributeError):
                    continue
                name = st.get("last") if isinstance(st, dict) else None
                card = ((st.get("cards") or {}).get(name) or {}) if name else {}
                a = ((card.get("scenes") or {}).get("casual") or {}).get("aspect")
                if name and card.get("style") and a in ASPECT_SIZES:
                    out["%s_%s_f_%s.webp" % (name, card["style"], m.group(1))] = a
    return out


def art_size(dirs=("img",)):
    """[(이름, 가로, 세로, 왜)…] — 그림 자리(img/, img-2/ …) 안에서 크기가 안 맞는 그림.

    폼 초상은 나란히 놓고 견주는 자리라 크기가 같아야 한다(ART_SIZE). 하나만 달라도
    고르개에서 그 칸만 커 보인다. 일상컷은 계획의 화면비(2026-11-23) — 셋 가운데 하나이고 기록이 있으면 그 크기.
    연출컷은 일부러 다른 꼴로 뽑을 수 있으므로 여기서 서지는 않고 적어 내기만 한다."""
    root = os.path.dirname(DIR)
    bad, plan = [], None
    for rel in dirs:
        d = rel if os.path.isabs(rel) else os.path.join(root, rel)
        if not os.path.isdir(d):
            continue
        for n in sorted(os.listdir(d)):
            if not n.lower().endswith(".webp"):
                continue
            sz = _webp_size(os.path.join(d, n))   # 그 자리의 경로로 — 예전엔 img/ 로 박혀 있었다
            if not sz:
                continue
            sz = tuple(sz)
            if not CASUAL_FILE.search(n):
                if sz != ART_SIZE:
                    bad.append((n, sz[0], sz[1], "폼 초상은 %d×%d" % ART_SIZE))
                continue
            if sz not in ASPECT_SIZES.values():
                bad.append((n, sz[0], sz[1], "일상컷은 " + " · ".join("%d×%d" % v for v in ASPECT_SIZES.values())))
                continue
            if plan is None:
                plan = planned_aspects(dirs)
            a = plan.get(n)
            if a and ASPECT_SIZES[a] != sz:
                bad.append((n, sz[0], sz[1], "계획 화면비 %s 는 %d×%d" % ((a,) + ASPECT_SIZES[a])))
    return bad
