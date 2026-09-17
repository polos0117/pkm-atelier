# -*- coding: utf-8 -*-
"""자료 파일 읽기·쓰기. atelier 의 roster.py 에서 주제와 무관한 몫만 가져왔다.

카드 모양이 다르다 — atelier 는 종류 넷(mech·pilot·ship·crew)이 각자 파일을
가졌지만 여기는 data/card.json 하나에 kinds 로 갈래를 적는다."""
import json, os

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


def art_size():
    """[(이름, 가로, 세로)…] — img/ 안에서 ART_SIZE 가 아닌 그림.

    폼 초상은 나란히 놓고 견주는 자리라 크기가 같아야 한다. 하나만 달라도
    고르개에서 그 칸만 커 보인다. 다만 연출컷·일상컷은 일부러 다른 꼴로
    뽑을 수 있으므로 여기서 서지는 않고 적어 내기만 한다."""
    root = os.path.dirname(DIR)
    d = os.path.join(root, "img")
    if not os.path.isdir(d):
        return []
    bad = []
    for n in sorted(os.listdir(d)):
        if not n.lower().endswith(".webp"):
            continue
        sz = _webp_size(os.path.join("img", n))
        if sz and sz != ART_SIZE:
            bad.append((n, sz[0], sz[1]))
    return bad
