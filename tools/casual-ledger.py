#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""일상컷 장부 — 여러 세션이 동시에 일상컷을 만들어도 같은 장면·구도·옷을 고르지 않게 한다.

장부는 그림 저장소 하나에 둔다: pkm-atelier-img-2/records/casual-ledger.json
(그림 저장소를 더 늘려도 장부는 여기 하나다). 한 칸이 캐릭터 하나, 상태는 둘이다.
  done      그림 저장소 기록(records/<종>-<날짜>/casualN-ui.json)에서 읽어 온 등록분.
            차례는 등록 시각으로 센다 — data/img.json 의 added_at → added 날짜 → 기록 폴더 날짜 →
            git 이력(얕은 clone 이면 믿지 않는다)
  reserved  생성 전에 세션이 먼저 적어 둔 계획. 세션마다 따로 records/casual-reservations/<세션>.json 에
            둔다(한 파일에 같이 쓰면 push 가 엇갈려 남의 예약을 지웠다). 24시간이 지났거나 그 캐릭터가
            등록되면 읽을 때 빠진다(장부 안에 남은 옛 reserved 칸도 읽기는 한다)

  python3 tools/casual-ledger.py build   — 기록을 다시 읽어 done 칸을 만든다(reserved 는 지킨다)
  python3 tools/casual-ledger.py report  — 계획에 쓸 요약(최근 장소/하는 일·구도 짝·덜 쓴 장소 묶음·옷 종류·필수 갈래 자리)
  python3 tools/casual-ledger.py view [--fresh] — 장부 + 살아 있는 예약을 합친 JSON(계획기가 읽는다).
                                                  --fresh 면 기록을 다시 읽어 done 을 새로 센다
  python3 tools/casual-ledger.py check  PLAN.json — 계획이 IMAGE_RULES 3절 "일상컷 장면 설정 순서" 의
                                                  장부 조건을 지키는지 본다. 어기면 1 로 끝난다
  python3 tools/casual-ledger.py reserve PLAN.json — check 를 통과하면 세션 예약 파일에 적는다
                                                  (그다음 그림 저장소를 commit·push 해야 다른 세션이 본다.
                                                  보통은 node tools/casual-plan.cjs … --reserve --push 가 다 한다)
  python3 tools/casual-ledger.py verify [--session S] [--card C] — 예약이 reserve 가 적은 그대로인가(도장).
                                                  손으로 쓰거나 고친 예약이면 1 로 끝난다 — 생성 전에 본다

예약 파일은 손으로 쓰거나 고치지 않는다 — reserve 가 캐릭터마다 도장(stamp: 그 칸의 sha256)을 같이 적는다.
check 를 안 거친 예약은 도장이 없거나 안 맞는다(2026-10-25 히포포타스: 계획을 손으로 고쳐 레지스틸과 같은 장면 둘·
같은 구도 셋을 받았고, 아무것도 막지 않았다). 바꿀 것이 있으면 계획기 --avoid·--keep 으로 다시 정한다.

계획은 손으로 짜지 않는다 — node tools/casual-plan.cjs <카드>… --session <이름> 이 장부·예약·생김새 색인
(data/casual-look.json)을 읽어 정하고, 이 check 를 통과할 때까지 다시 고른다.

PLAN.json 꼴(배치 하나 — 같이 만드는 캐릭터 전부):
  {"session": "아무 이름", "characters": [
     {"card": "무장조", "species": "skarmory-20261016",
      "cuts": [{"cut": 1, "era": "...", "place": "...", "act": "...", "ofam": "...", "item": "...",
                "expr": "...", "pose": "...", "orient": "...", "frame": "...", "lens": "...",
                "axes": {"action_level": "...", "source_influence": "...", "separates_preference": "..."},
                "garments": ["dress", ...], "scene": "(선택)", "outfit": "(선택)"}, ...]}]}

빠진 컷 다시 채우기(안전 필터에 막혀 비었거나 넘어간 컷): 그 캐릭터에 "refill": true 를 주고, 이미 등록된
컷에는 "kept": true 를 붙여 세 장을 다 적는다. 새로 만드는 컷만 장소·하는 일·구도·옷·채우기 문구를 보고, 차례에 매인
조건(필수 갈래 자리 돌리기·다섯 명에 두 장·덜 쓴 장소 묶음·새 값)은 보지 않는다. 세 장 안의 조건(값이 서로 다름·필수 갈래
한 장 이상·덮는 겉옷 한 장까지)은 그대로 본다.

두 열쇠(2026-10-29 일상컷 트리, B안): 새 컷은 트리 길(시대 era · 장소 place · 하는 일 act · 의상 계열 ofam · 옷 item —
data/casual-tree.json)로 적는다. 옛 컷(갈래 cat · 예시 ex)은 트리 변환표(legacy)로 같은 길을 붙여 읽는다 — 장부 파일은 그대로 두고
읽을 때만(view·check·report). 규칙은 그대로 옮겼다: 같은 예시 → 같은 장소·하는 일, 덜 쓴 갈래 → 덜 쓴 장소 묶음,
작은 갈래 한 바퀴 → 작은 묶음 한 바퀴, 필수 갈래 → 의상 계열이 역할극·수영복·란제리풍·레트로(옛 칸은 갈래 이름으로도).
안 쓰는 방향·프레이밍과 얼굴 클로즈업 조건은 트리 표(banned · frame_rules.face_close)에서 읽는다.

버전2 컷(2026-10-30, docs/CASUAL_TREE_V2.md — treeV 2, 계획기 --v2)엔 하는 일 · 방향이 없다. 읽을 때 비교 열쇠를 붙인다
(lib/casual-plan.js pathOf 와 같다): 하는 일 act ← 짓(소품 동작 use, 없으면 몸 자세:오른손:왼손) · 방향 orient ← 몸 방향+머리 방향 ·
자세 pose ← 자세 추천. 그래서 버전1 · 버전2 컷이 섞인 장부도 같은 규칙으로 견준다. 작은 묶음 한 바퀴는 버전1 길의 규칙이라 버전2 컷엔 안 본다.
버전2 컷의 트리 검사는 안 쓰는 값(몸 방향 · 프레이밍)과 얼굴 클로즈업 조건만 — 칸끼리 맞는지는 계획기 · 지시문 묶음(plannedV2)이 본다.

기본 경로는 이 저장소 옆의 ../pkm-atelier-img, ../pkm-atelier-img-2, ../pkm-atelier-img-3, ../pkm-atelier-img-4 다(--repos 로 바꾼다).
장부·예약은 그대로 둘째 저장소에 — 새 그림의 기록은 열린 저장소(지금 넷째)에 쌓인다."""
from pathlib import Path
import argparse, datetime, importlib.util, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPOS = [os.path.join(os.path.dirname(ROOT), n) for n in ("pkm-atelier-img", "pkm-atelier-img-2", "pkm-atelier-img-3", "pkm-atelier-img-4")]
LEDGER = os.path.join(os.path.dirname(ROOT), "pkm-atelier-img-2", "records", "casual-ledger.json")
# 예약은 세션마다 따로 파일(2026-10-22) — 한 장부 파일에 다들 쓰다 push 가 엇갈리면 남의 예약을 지웠다(밤선인·파치리스, 체리꼬·샤비)
RESERVATIONS = "casual-reservations"

REQUIRED = {"adult_roleplay", "swimwear", "lingerie", "retro_glamour"}  # 옛 칸의 필수 갈래 이름(레트로 글래머 2026-10-26)
TREE_FILE = os.path.join(ROOT, "data", "casual-tree.json")
TREE2_FILE = os.path.join(ROOT, "data", "casual-tree-v2.json")
# 버전2 컷의 칸(lib/casual-plan.js V2_FIELDS)
V2_KEYS = ("era", "place", "weather", "ofam", "item", "posture", "support", "frame", "body", "head", "camera", "right", "left", "use", "legs", "gaze", "expr", "preset")
EX_WINDOW = 10          # 같은 장소·하는 일(옛 칸은 같은 예시)은 최근 10명 안에서 다시 쓰지 않는다
CMP_WINDOW = 3          # 구도·옷·세 축 비교는 최근 3명
CMP_RESERVED = 3        # 그 비교에 넣는 다른 세션 예약도 가장 최근 셋까지(2026-10-27 — 전부 넣으면 예약이 쌓일 때 SOURCE 구성 일곱 가지·옷 종류가 다 막혔다)
GROUP_WINDOW = 10       # 덜 쓴 장소 묶음은 최근 10명으로 센다(옛 「덜 쓴 갈래」)
GROUP_LOW = 5           # 그중 사용 횟수 하위 5개(같은 횟수는 함께)
# 도장 — 이 시각 전의 예약은 도장이 없어도 읽는다(도입 전에 적은 것)
STAMP_SINCE = "2026-10-25T02:55:00+00:00"
SMALL_GROUP = 8         # 길(장소·하는 일)이 이 수 이하인 묶음은 한 바퀴를 다 돌기 전까지 같은 길을 다시 쓰지 않는다(옛 「작은 갈래」)
PATH_KEYS = ("era", "place", "act", "ofam", "item")
TWO_REQUIRED_EVERY = 5  # 다섯 명에 한 명은 필수 갈래를 두 장
RESERVE_HOURS = 24      # 이보다 오래된 reserved 는 끝난 것으로 보지 않고 버린다

# 옷 종류 — 계획의 garments 는 이 말만 쓴다. 기록에서 읽을 때는 의상 문장에서 찾는다
GARMENTS = {
    "dress": r"\b(dress|gown|sundress|kaftan|qipao|cheongsam)\b",
    "jumpsuit": r"\b(jumpsuit|romper|playsuit|boilersuit)\b",
    "overalls": r"\b(overalls?|dungarees|bib (shorts|trousers))\b",
    "coat": r"\b(coat|trench|parka|cape)\b",
    "jacket": r"\b(jacket|blazer|bomber|windbreaker)\b",
    "cardigan": r"\bcardigan\b",
    "vest": r"\b(vest|waistcoat|gilet)\b",
    "sweater": r"\b(sweater|jumper|hoodie|sweatshirt|pullover)\b",
    "shirt": r"\bshirt\b",
    "blouse": r"\bblouse\b",
    "knit_top": r"\bknit(ted)? (top|tee)\b",
    "tank": r"\b(tank|camisole|cami)\b",
    "crop_top": r"\b(crop(ped)? top|bandeau|bralette|sports bra)\b",
    "skirt": r"\bskirt\b",
    "shorts": r"\bshorts\b",
    "trousers": r"\b(trousers|pants|jeans|culottes|slacks)\b",
    "leggings": r"\b(leggings|tights)\b",
    "swimsuit": r"\b(swimsuit|one-piece|monokini|rash ?guard)\b",
    "bikini": r"\bbikini\b",
    "lingerie_set": r"\b(lingerie|bustier|corset|teddy)\b",
    "slip": r"\bslip\b",
    "robe": r"\b(robe|kimono-style robe|wrap robe)\b",
    "apron": r"\bapron\b",
    "uniform": r"\buniform\b",
    "traditional": r"\b(hanbok|kimono|yukata|sari|ao dai|dirndl|hanfu)\b",
}
# 몸을 덮는 겉옷 — 피부 노출 bold 를 의상이 지워 버리지 않게 세 장 중 한 장까지
COVERING = {"coat", "jacket", "cardigan", "sweater"}
FILLER = [
    (r"no (outer|extra) (layer|jacket)", "덧옷이 없다는 채우기 문구"),
    (r"unlettered|unlabell?ed|no lettering|no text|no logo|no signs?\b|without (letters|text|labels?)", "글자 금지 문구(생성기가 이미 넣는다)"),
]


def now():
    return datetime.datetime.now(datetime.timezone.utc).astimezone().isoformat(timespec="seconds")


_CT = None


def ct():
    """트리 검사기(tools/casual-tree.py)의 길 함수 — 같은 허용 관계를 쓴다"""
    global _CT
    if _CT is None:
        sp = importlib.util.spec_from_file_location("casual_tree", os.path.join(ROOT, "tools", "casual-tree.py"))
        _CT = importlib.util.module_from_spec(sp)
        sp.loader.exec_module(_CT)
    return _CT


def spec():
    """일상컷 트리 표와 거기서 센 것 — 묶음마다의 모든 길(장소/하는 일), 장소의 묶음"""
    with open(TREE_FILE, encoding="utf-8") as f:
        tree = json.load(f)
    C = ct()
    places = {p["key"]: p for p in tree["places"]}
    keys = {}
    for e in tree["eras"]:
        for p in C.places_in(tree, e["key"]):
            for a in C.activities_at(tree, p["key"]):
                if C.outfit_families(tree, e["key"], p["key"], a):
                    keys.setdefault(p["group"], set()).add(p["key"] + "/" + a["key"])
    presets = {x["key"]: x for x in tree.get("presets", [])}
    try:
        with open(TREE2_FILE, encoding="utf-8") as f:
            tree2 = json.load(f)
    except (OSError, ValueError):
        tree2 = {}
    # 버전2 표의 새 장소(도서관 · 온실 …)도 묶음을 안다 — 버전1 길 목록엔 넣지 않는다
    for p in tree2.get("extra_places") or []:
        places.setdefault(p["key"], p)
    return {"tree": tree, "tree2": tree2, "places": places, "groups": [g["key"] for g in tree["groups"]],
            "group_paths": {g: sorted(v) for g, v in keys.items()}, "presets": presets,
            "required": set((tree.get("required") or {}).get("outfits") or [])}


SP = None


def sp_():
    global SP
    if SP is None:
        SP = spec()
    return SP


def jit_of(c):
    """버전2 컷의 짓 — 소품 동작, 없으면 몸 자세:오른손:왼손(lib/casual-plan.js jitOf)"""
    return c.get("use") or "%s:%s:%s" % (c.get("posture") or "", c.get("right") or "-", c.get("left") or "-")


def is_v2(c):
    return bool(c) and c.get("treeV") == 2


def with_path(c, sp=None):
    """옛 칸(갈래·예시)에 트리 길을 붙인다 — lib/casual-tree.js fromLegacy 와 같다. 이미 길이 있으면 그대로.
    버전2 컷엔 비교 열쇠(act ← 짓 · orient ← 몸+머리 · pose ← 자세 추천)를 붙인다"""
    if is_v2(c):
        return {**c, "act": jit_of(c), "orient": "%s+%s" % (c.get("body") or "", c.get("head") or ""), "pose": c.get("preset") or None}
    if not c or c.get("place"):
        return c
    sp = sp or sp_()
    L = sp["tree"].get("legacy") or {}
    v = L.get("%s/%s" % (c.get("cat"), c.get("ex") or "")) or L.get("%s/" % c.get("cat")) or L.get("everyday/") or {}
    if v.get("preset"):
        pr = sp["presets"].get(v["preset"]) or {}
        v = {"era": pr.get("era"), "place": pr.get("place"), "act": pr.get("act"), "outfit": pr.get("outfit"), "item": pr.get("item")}
    return {**c, "era": v.get("era"), "place": v.get("place"), "act": v.get("act"), "ofam": v.get("outfit"), "item": v.get("item") or "", "legacy": True}


def path_key(c):
    return "%s/%s" % (c.get("place"), c.get("act"))


def group_of(c, sp=None):
    p = (sp or sp_())["places"].get(c.get("place"))
    return p["group"] if p else None


def is_required(c, sp=None):
    return c.get("ofam") in (sp or sp_())["required"] or c.get("cat") in REQUIRED


def garments_of(text):
    t = (text or "").lower()
    return sorted(g for g, p in GARMENTS.items() if re.search(p, t))


def registered():
    """data/img.json 의 들어온 시각·날짜 — 기록 폴더의 시각은 이것을 먼저 쓴다"""
    try:
        with open(os.path.join(ROOT, "data", "img.json"), encoding="utf-8") as f:
            d = json.load(f)
    except (OSError, ValueError):
        return {}, {}
    return d.get("added_at") or {}, d.get("added") or {}


REG = None


def added_at(repo, rel, card=None, files=()):
    """그 캐릭터 일상컷이 들어온 시각. 차례는 이것으로 센다.

    1) data/img.json 의 added_at(등록기가 적는 UTC 시각, 최근 30일) 2) added 날짜 3) 폴더 이름의 날짜(<종>-YYYYMMDD)
    4) 온전한 이력에서 기록 폴더를 처음 커밋한 시각. 얕은 받기(shallow)의 이력은 믿지 않는다 — 모든 파일이 마지막 커밋에
    더해진 것으로 보여 128칸이 한 시각에 뭉쳤고, "최근 10명" 이 엉뚱한 옛 캐릭터가 되었다(2026-10-22 점검)."""
    global REG
    if REG is None:
        REG = registered()
    at, day = REG
    got = sorted(at[f] for f in files if f in at)
    if got:
        return got[-1].replace("Z", "+00:00")
    days = sorted(day[f] for f in files if f in day)
    if days:
        return days[-1] + "T12:00:00+00:00"
    m = re.search(r"-(\d{4})(\d{2})(\d{2})$", os.path.basename(rel))
    if m:
        return "%s-%s-%sT12:00:00+00:00" % m.groups()
    try:
        shallow = subprocess.run(["git", "-C", repo, "rev-parse", "--is-shallow-repository"], capture_output=True, text=True).stdout.strip()
        if shallow == "false":
            out = subprocess.run(["git", "-C", repo, "log", "--diff-filter=A", "--format=%aI", "--", rel],
                                 capture_output=True, text=True).stdout.split()
            if out:
                return out[-1]
    except OSError:
        pass
    return now()


def read_records(repos):
    """기록에서 컷을 읽되, 그림 저장소 img/ 에 그 컷 그림이 실제로 있는 것만 센다 —
    막혀서 비었거나 넘어간 컷의 설정은 기록에 남아 있어도 등록분이 아니다"""
    imgs = set()
    for repo in repos:
        d = os.path.join(repo, "img")
        if os.path.isdir(d):
            imgs.update(os.listdir(d))
    replacement_ui = {}
    for repo in repos:
        state_path = Path(repo) / 'records/automation/state.json'
        if not state_path.exists():
            continue
        state = json.loads(state_path.read_text())
        for run in state.get('runs', []):
            for ch in run.get('queue', []):
                for replacement in ch.get('replacements', []):
                    slot = replacement.get('slot', '')
                    if replacement.get('status') == 'accepted' and re.fullmatch(r'casual[1-3]', slot):
                        relative = replacement['ui']['path']
                        if not relative.startswith('records/automation/') or '..' in Path(relative).parts:
                            raise ValueError('invalid replacement UI path')
                        replacement_ui[(ch['name'], int(slot[-1]))] = Path(repo) / relative
    entries = []
    for repo in repos:
        base = os.path.join(repo, "records")
        if not os.path.isdir(base):
            continue
        for d in sorted(os.listdir(base)):
            cuts, card, files = [], None, []
            for i in (1, 2, 3):
                f = os.path.join(base, d, "casual%d-ui.json" % i)
                # 다시 채운 컷 — 막힌 앞 시도의 casualN-ui.json 이 남아 있어도 등록된 그림을 만든 상태는 casualN-refill-ui.json 이다
                # (2026-10-24 미라몽·치렁·마자: 막힌 장면이 등록분으로 읽혀 다시 채우기 예약이 안 풀리고 비교 대상이 늘어 계획기가 멈췄다)
                refill = os.path.join(base, d, "casual%d-refill-ui.json" % i)
                if os.path.exists(refill):
                    f = refill
                if not os.path.exists(f):
                    c = imported_cut(os.path.join(base, d), i)   # 사용자가 준 그림만 있고 생성기 상태가 없는 컷
                    mine = [n for n in imgs if c and n.startswith(c["card"] + "_") and n.endswith("_f_casual%d.webp" % i)]
                    if c and (mine or not imgs):
                        card = card or c["card"]; files += mine
                        cuts.append({k: v for k, v in c.items() if k != "card"})
                    continue
                try:
                    with open(f, encoding="utf-8") as h:
                        record = json.load(h)
                        st = storage_of(record)
                except (ValueError, OSError):
                    continue
                card = st.get("last") or record.get("card") or card
                if (card, i) in replacement_ui:
                    record = json.loads(replacement_ui[(card, i)].read_text())
                    st = storage_of(record)
                cd = (st.get("cards") or {}).get(card) or (st if "scenes" in st else {})
                c = cd.get("scenes", {}).get("casual")
                if not c or not card:
                    continue
                mine = [n for n in imgs if n.startswith(card + "_") and n.endswith("_f_casual%d.webp" % i)]
                if imgs and not mine:
                    continue
                files += mine
                ax = c.get("axes") or {}
                if is_v2(c):
                    cuts.append({"cut": i, "treeV": 2, **{k: c.get(k) or None for k in V2_KEYS},
                                 "axes": {k: ax.get(k) for k in ("action_level", "source_influence", "separates_preference")},
                                 "garments": garments_of(c.get("outfit"))})
                    continue
                cuts.append({"cut": i, **{k: c.get(k) or None for k in
                                          ("cat", "ex") + PATH_KEYS + ("expr", "pose", "orient", "frame", "lens")},
                             "axes": {k: ax.get(k) for k in ("action_level", "source_influence", "separates_preference")},
                             "garments": garments_of(c.get("outfit"))})
            if cuts:
                entries.append({"species": d, "card": card, "repo": os.path.basename(repo),
                                "at": added_at(repo, os.path.join("records", d), card, files), "status": "done", "cuts": cuts})
    return entries


def imported_cut(d, i):
    """casualN-import.json(사용자가 준 그림을 그 컷 자리에 올린 기록)만 있고 casualN-ui.json 이 없으면 — 그 폴더의 계획(plan-v2.json · plan.json)에서
    그 컷의 선택값을 읽는다. 기록이 계획과 맞는다고 적은 것(plan_match)만 — 맞춰 보지 않은 그림을 계획대로 셈하지 않는다(2026-10-24 해골몽 2번)"""
    p = os.path.join(d, "casual%d-import.json" % i)
    if not os.path.exists(p):
        return None
    try:
        with open(p, encoding="utf-8") as h:
            imp = json.load(h)
    except (ValueError, OSError):
        return None
    if not imp.get("plan_match"):
        return None
    card = re.match(r"(.+?)_", (imp.get("output") or {}).get("file") or "")
    for name in ("plan-v2.json", "plan.json"):
        q = os.path.join(d, name)
        if not os.path.exists(q):
            continue
        try:
            with open(q, encoding="utf-8") as h:
                plan = json.load(h)
        except (ValueError, OSError):
            continue
        for ch in plan.get("characters") or []:
            if card and ch.get("card") != card.group(1):
                continue
            for c in ch.get("cuts") or []:
                if c.get("cut") == i:
                    ax = c.get("axes") or {}
                    if is_v2(c):
                        return {"card": ch.get("card"), "cut": i, "treeV": 2, **{k: c.get(k) or None for k in V2_KEYS},
                                "axes": {k: ax.get(k) for k in ("action_level", "source_influence", "separates_preference")},
                                "garments": sorted(c.get("garments") or [])}
                    return {"card": ch.get("card"), "cut": i, **{k: c.get(k) or None for k in ("cat", "ex") + PATH_KEYS + ("expr", "pose", "orient", "frame", "lens")},
                            "axes": {k: ax.get(k) for k in ("action_level", "source_influence", "separates_preference")},
                            "garments": sorted(c.get("garments") or [])}
    return None


def storage_of(record):
    """생성기 상태 — 보통은 storage 가 곧 상태({last, cards}). 브라우저 localStorage 를 통째로 적은 기록은
    {"pkm_prompt_v2": "<상태 JSON 글>"} 꼴이라 풀어 읽는다(다시 채우기 기록 casualN-refill-ui.json)"""
    st = record.get("storage") or {}
    if "cards" not in st and "scenes" not in st and isinstance(st.get("pkm_prompt_v2"), str):
        try:
            st = json.loads(st["pkm_prompt_v2"])
        except ValueError:
            st = {}
    return st


def load(path):
    if not os.path.exists(path):
        return {"entries": []}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save(path, doc):
    doc["note"] = ("일상컷 장부. tools/casual-ledger.py 가 쓴다 — 손으로 고치지 않는다. "
                   "생성 전에 reserve 로 계획을 적고 push 한 뒤 생성한다. IMAGE_RULES.md 3절 \"일상컷 장면 설정 순서\".")
    doc["updated"] = now()
    doc["entries"] = sorted(doc["entries"], key=when)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)
        f.write("\n")


def when(e):
    """시각으로 정렬한다 — 세션마다 시간대가 달라 글자 차례로는 틀린다"""
    try:
        t = datetime.datetime.fromisoformat(e.get("at") or "")
    except ValueError:
        return datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)
    return t if t.tzinfo else t.replace(tzinfo=datetime.timezone.utc)


def fresh(e):
    if e.get("status") != "reserved":
        return True
    try:
        t = datetime.datetime.fromisoformat(e["at"])
    except (KeyError, ValueError):
        return False
    return (datetime.datetime.now(datetime.timezone.utc) - t).total_seconds() < RESERVE_HOURS * 3600


RESERVE_TAIL = ("axes", "garments", "expose", "lead", "kept")


def reserve_keys(c):
    """예약 파일에 적는 칸 — 버전2 컷은 treeV 와 버전2 칸 전부(짓 · 몸+머리 는 장부가 다시 만든다), 버전1 컷은 지금까지 그대로"""
    if is_v2(c):
        return ("cut", "treeV") + V2_KEYS + RESERVE_TAIL
    return ("cut", "cat", "ex") + PATH_KEYS + ("expr", "pose", "orient", "frame", "lens") + RESERVE_TAIL


def stamp_of(session, e):
    """예약 칸 하나의 도장 — reserve 가 check 를 통과시킨 그대로인지(세션·캐릭터·시각·컷·다시 채우기)"""
    import hashlib
    body = {"session": session, "card": e.get("card"), "species": e.get("species"), "at": e.get("at"),
            "refill": bool(e.get("refill")), "cuts": e.get("cuts") or []}
    return hashlib.sha256(json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()


def stamp_problem(session, e):
    """도장이 맞으면 None, 아니면 까닭. 도입 전(STAMP_SINCE 앞)의 예약은 따지지 않는다"""
    try:
        if datetime.datetime.fromisoformat(str(e.get("at"))) < datetime.datetime.fromisoformat(STAMP_SINCE):
            return None
    except ValueError:
        return "예약 시각을 읽을 수 없다"
    if not e.get("stamp"):
        return "도장이 없다 — reserve 를 거치지 않고 적은 예약"
    if e["stamp"] != stamp_of(session, e):
        return "도장이 안 맞는다 — reserve 뒤에 손으로 고친 예약"
    return None


def verify(args):
    """예약 파일이 reserve 가 적은 그대로인가 — 손으로 쓰거나 고친 칸을 찾는다. --session·--card 로 좁힌다"""
    d = os.path.join(os.path.dirname(args.ledger), RESERVATIONS)
    bad = n = 0
    for name in sorted(os.listdir(d)) if os.path.isdir(d) else []:
        if not name.endswith(".json"):
            continue
        with open(os.path.join(d, name), encoding="utf-8") as f:
            r = json.load(f)
        session = r.get("session") or name[:-5]
        if args.session and session != args.session:
            continue
        for e in r.get("characters") or []:
            if args.card and e.get("card") != args.card:
                continue
            if not args.session and not args.card and not fresh({**e, "status": "reserved", "at": e.get("at") or r.get("at")}):
                continue
            n += 1
            why = stamp_problem(session, e)
            if why:
                bad += 1
                print("  ✗ %s · %s: %s" % (name, e.get("card"), why))
    if bad:
        print("예약 %d칸 가운데 %d칸이 reserve 가 적은 것과 다르다 — 계획기로 다시 정한다(node tools/casual-plan.cjs … --reserve --push)" % (n, bad))
        sys.exit(1)
    if not n and (args.session or args.card):
        print("그런 예약이 없다")
        sys.exit(1)
    print("예약 %d칸 — 도장 맞음" % n)


def reservations(ledger, stale=False):
    """세션마다의 예약 파일(records/casual-reservations/<세션>.json) — 24시간 안의 것만(stale 이면 지난 것도)"""
    d = os.path.join(os.path.dirname(ledger), RESERVATIONS)
    out = []
    if not os.path.isdir(d):
        return out
    for n in sorted(os.listdir(d)):
        if not n.endswith(".json"):
            continue
        try:
            with open(os.path.join(d, n), encoding="utf-8") as f:
                r = json.load(f)
        except (OSError, ValueError):
            continue
        for e in r.get("characters") or []:
            e = {**e, "status": "reserved", "session": r.get("session") or n[:-5], "at": e.get("at") or r.get("at")}
            if stale or fresh(e):
                out.append(e)
    return out


def pathed(e):
    return {**e, "cuts": [with_path(c) for c in e.get("cuts") or []]}


def live(doc, ledger=None):
    """장부의 칸 + 세션별 예약. 등록된 캐릭터(done)의 예약은 빼고(다시 채우기는 남긴다), 같은 캐릭터 예약은 늦은 것 하나만.
    칸마다 트리 길을 붙여 준다(옛 칸은 변환표로) — 계획기·check 가 같은 열쇠로 본다"""
    es = [pathed(e) for e in doc["entries"] if fresh(e)]
    if ledger:
        es += [pathed(e) for e in reservations(ledger)]
        # 계획기가 정한 드러내는 방식(expose)은 생성기 상태에 남지 않는다 — 같은 컷(번호·길)의 예약에서 옮겨 온다
        plans = {(r.get("card"), c.get("cut"), path_key(with_path(c))): c.get("expose") for r in reservations(ledger, stale=True) for c in r.get("cuts") or [] if c.get("expose")}
        for e in es:
            if e.get("status") != "reserved":
                for c in e["cuts"]:
                    k = (e.get("card"), c.get("cut"), path_key(c))
                    if not c.get("expose") and plans.get(k):
                        c["expose"] = plans[k]
    done = {e["card"] for e in es if e.get("status") != "reserved"}
    completed_cuts = {(e["card"], c.get("cut"), path_key(c))
                      for e in es if e.get("status") != "reserved" for c in e["cuts"]}
    last = {}
    for e in sorted(es, key=when):
        if e.get("status") == "reserved":
            if e.get("card") in done and not e.get("refill"):
                continue
            if e.get("refill") and e.get("cuts") and all(
                    (e.get("card"), c.get("cut"), path_key(c)) in completed_cuts
                    for c in e["cuts"]):
                continue
            last[e.get("card")] = e
    return sorted([e for e in es if e.get("status") != "reserved"] + list(last.values()), key=when)


def build(args):
    gone = [r for r in args.repos if not os.path.isdir(os.path.join(r, "records"))]
    if gone:
        # 세션마다 받아 둔 저장소가 다르면 장부가 줄었다 늘었다 한다 — 다 받은 곳에서만 다시 만든다
        raise SystemExit("그림 저장소가 없다: %s — pkm-atelier 옆에 넷 다 받은 뒤 build 한다" % ", ".join(gone))
    old = load(args.ledger)
    done = read_records(args.repos)
    cards = {e["card"] for e in done}
    got = {(e["card"], c["cut"], path_key(with_path(c))) for e in done for c in e["cuts"]}

    def pending(e):
        """등록되지 않은 예약 — 새 캐릭터이거나, 다시 채우는 컷이 아직 기록에 없다"""
        if e.get("status") != "reserved" or not fresh(e):
            return False
        if e.get("card") not in cards:
            return True
        return bool(e.get("refill")) and any((e["card"], c["cut"], path_key(with_path(c))) not in got
                                             for c in e["cuts"] if not c.get("kept"))
    keep = [e for e in old.get("entries", []) if pending(e)]
    save(args.ledger, {"entries": done + keep})
    print("장부: done %d · reserved %d → %s" % (len(done), len(keep), args.ledger))


def cut_pairs(entries):
    return {(c.get("orient"), c.get("frame")) for e in entries for c in e["cuts"]}


def group_counts(entries, sp):
    n = {k: 0 for k in sp["groups"]}
    for e in entries:
        for c in e["cuts"]:
            k = group_of(c, sp)
            if k in n:
                n[k] += 1
    return n


def low_groups(entries, sp):
    n = group_counts(entries, sp)
    if not n:
        return set()
    cut = sorted(n.values())[min(GROUP_LOW, len(n)) - 1]
    return {k for k, v in n.items() if v <= cut}


def report(args):
    doc, sp = load(args.ledger), spec()
    es = live(doc, args.ledger)
    print("장부 %s — 칸 %d (reserved %d)" % (args.ledger, len(es), sum(e["status"] == "reserved" for e in es)))
    print("\n[최근 %d명 · 다시 쓰지 않는 장소/하는 일]" % EX_WINDOW)
    for e in es[-EX_WINDOW:]:
        print("  %-8s %-9s %s" % (e["card"], e["status"], " · ".join(path_key(c) for c in e["cuts"])))
    print("\n[최근 %d명 · (방향, 프레이밍) 짝 · 옷 종류 · 세 축]" % CMP_WINDOW)
    for e in es[-CMP_WINDOW:]:
        for c in e["cuts"]:
            ax = c.get("axes") or {}
            print("  %-8s %d  (%s, %s)  %s  [%s/%s/%s]" % (e["card"], c["cut"], c.get("orient"), c.get("frame"),
                  ",".join(c.get("garments") or []) or "-", ax.get("action_level"), ax.get("source_influence"), ax.get("separates_preference")))
    n = group_counts(es[-GROUP_WINDOW:], sp)
    low = low_groups(es[-GROUP_WINDOW:], sp)
    print("\n[최근 %d명 장소 묶음 사용 횟수 — * 는 덜 쓴 묶음]" % GROUP_WINDOW)
    print("  " + " · ".join("%s%s=%d" % ("*" if k in low else "", k, v) for k, v in sorted(n.items(), key=lambda x: x[1])))
    print("\n[길이 %d개 이하인 묶음 — 이번 바퀴에 아직 안 쓴 길]" % SMALL_GROUP)
    for k, lst in sp["group_paths"].items():
        if 0 < len(lst) <= SMALL_GROUP:
            print("  %s: %s" % (k, ", ".join(small_group_open(es, k, lst))))
    print("\n[필수 갈래 자리 — 최근 %d명]" % TWO_REQUIRED_EVERY)
    for e in es[-TWO_REQUIRED_EVERY:]:
        print("  %-8s %s" % (e["card"], [c["cut"] for c in e["cuts"] if is_required(c, sp)]))


def small_group_open(entries, group, lst):
    """한 바퀴 — 이 묶음 길 가운데 가장 적게 쓴 것들(장부의 살아 있는 칸 전부 — 계획기와 같다)"""
    n = {x: 0 for x in lst}
    for e in entries:
        for c in e["cuts"]:
            k = path_key(with_path(c))
            if k in n:
                n[k] += 1
    m = min(n.values())
    return [x for x in lst if n[x] == m]


def tree_problems_v2(c, sp):
    """버전2 컷 — 꼭 있어야 하는 칸, 안 쓰는 값(몸 방향 · 프레이밍), 얼굴 클로즈업 조건. 칸끼리는 계획기 · 지시문 묶음이 본다"""
    tree, tree2, out = sp["tree"], sp.get("tree2") or {}, []
    for k in ("era", "place", "ofam", "posture", "support", "frame", "body", "head", "camera"):
        if not c.get(k):
            out.append("버전2 칸 %s 가 비었다" % k)
    if c.get("place") and c.get("place") not in sp["places"]:
        out.append("장소 %s 가 없다" % c.get("place"))
    if c.get("frame") in (tree.get("banned") or {}).get("frames", []) + (tree2.get("banned") or {}).get("frames", []) or \
            c.get("body") in (tree2.get("banned") or {}).get("body", []):
        out.append("일상컷에 쓰지 않는 몸 방향·프레이밍")
    rule = (tree.get("frame_rules") or {}).get(c.get("frame")) or {}
    if rule.get("not_required") and is_required(c, sp):
        out.append("%s 는 필수 갈래 컷에 쓰지 않는다(옷이 안 남는다)" % c.get("frame"))
    return out


def tree_problems(c, sp):
    """그 컷이 트리 위의 길·구도인가 — 시대·장소·하는 일·의상 계열·옷, 안 쓰는 값, 얼굴 클로즈업 조건(트리 표)"""
    if is_v2(c):
        return tree_problems_v2(c, sp)
    tree, C, out = sp["tree"], ct(), []
    errs = C.path_errors(tree, {"era": c.get("era"), "place": c.get("place"), "act": c.get("act"), "outfit": c.get("ofam"), "item": c.get("item") or ""})
    out += errs
    ban = tree.get("banned") or {}
    if c.get("frame") in ban.get("frames", []) or c.get("orient") in ban.get("orients", []):
        out.append("일상컷에 쓰지 않는 방향·프레이밍")
    rule = (tree.get("frame_rules") or {}).get(c.get("frame")) or {}
    if rule.get("not_required") and is_required(c, sp):
        out.append("%s 는 필수 갈래 컷에 쓰지 않는다(옷이 안 남는다)" % c.get("frame"))
    if c.get("orient") in (rule.get("no_orients") or []):
        out.append("%s 에는 방향 %s 를 안 쓴다(얼굴이 카메라 쪽인 방향만)" % (c.get("frame"), c.get("orient")))
    return out


def check_plan(doc, plan, sp, ledger=None):
    errs = []
    es = live(doc, ledger)
    batch = [{**ch, "cuts": [with_path(c, sp) for c in ch.get("cuts") or []]} for ch in plan.get("characters") or []]
    names = {ch.get("card") for ch in batch}
    base = [e for e in es if e.get("card") not in names]
    req_of = lambda c: is_required(c, sp)
    prev_req = [c["cut"] for c in base[-1]["cuts"] if req_of(c)] if base else None
    hist = base[:]
    for ch in batch:
        who, cuts = ch.get("card"), ch.get("cuts") or []
        others = [{"card": o.get("card"), "cuts": o.get("cuts") or []} for o in batch if o is not ch]
        res = [e for e in es if e["status"] == "reserved" and e.get("card") not in names]
        cmp_ = base[-CMP_WINDOW:] + [e for e in res[-CMP_RESERVED:] if e not in base[-CMP_WINDOW:]] + others
        exw = base[-EX_WINDOW:] + [e for e in es if e["status"] == "reserved" and e.get("card") not in names] + others
        bad = lambda m: errs.append("%s: %s" % (who, m))
        refill = bool(ch.get("refill"))
        if len(cuts) != 3:
            bad("일상컷은 세 장")
        # 표정·자세는 비어 있어도 된다(하는 일이 정한다) — 고른 것끼리만 다르게
        for k in ("expr", "pose", "orient", "frame"):
            vals = [c.get(k) for c in cuts if c.get(k) or k in ("orient", "frame")]
            if len(set(vals)) != len(vals):
                bad("세 장의 %s 가 서로 달라야 한다" % k)
        req = [c["cut"] for c in cuts if req_of(c)]
        if not req:
            bad("필수 갈래(의상 계열 %s — 옛 칸 adult_roleplay·swimwear·lingerie·retro_glamour)가 없다" % "·".join(sorted(sp["required"])))
        if not refill and prev_req is not None and req and sorted(req) == sorted(prev_req):
            bad("필수 갈래 자리 %s 가 바로 앞 캐릭터와 같다 — 컷 번호를 돌린다" % req)
        last = hist[-(TWO_REQUIRED_EVERY - 1):]
        if not refill and len(last) == TWO_REQUIRED_EVERY - 1 and all(sum(req_of(c) for c in e["cuts"]) < 2 for e in last) and len(req) < 2:
            bad("앞 %d명이 모두 필수 갈래 한 장 — 이번에는 두 장" % (TWO_REQUIRED_EVERY - 1))
        used_path = {path_key(c) for e in exw for c in e["cuts"]}
        pairs = cut_pairs(cmp_)
        orients = {c.get("orient") for e in cmp_ for c in e["cuts"]}
        frames = {c.get("frame") for e in cmp_ for c in e["cuts"]}
        gar = {g for e in cmp_ for c in e["cuts"] for g in (c.get("garments") or [])}
        for c in cuts:
            n = c.get("cut")
            if c.get("kept"):
                continue
            if not c.get("place") or not c.get("act"):
                bad("%s번: 장소·하는 일이 비었다" % n)
                continue
            if path_key(c) in used_path:
                bad("%s번: 장소·하는 일 %s 를 최근 %d명·예약·배치 안에서 이미 썼다" % (n, path_key(c), EX_WINDOW))
            g = group_of(c, sp)
            lst = sp["group_paths"].get(g) or []
            if not is_v2(c) and 0 < len(lst) <= SMALL_GROUP and path_key(c) not in small_group_open(es, g, lst):
                bad("%s번: 묶음 %s 는 길이 %d개뿐 — 이번 바퀴에 아직 안 쓴 길부터 쓴다" % (n, g, len(lst)))
            for m in tree_problems(c, sp):
                bad("%s번: %s" % (n, m))
            if (c.get("orient"), c.get("frame")) in pairs:
                bad("%s번: (방향, 프레이밍) 짝 (%s, %s) 이 비교 대상과 겹친다" % (n, c.get("orient"), c.get("frame")))
            if not [g for g in (c.get("garments") or []) if g in GARMENTS]:
                bad("%s번: garments 가 비었거나 정해 둔 옷 종류가 아니다(%s)" % (n, ", ".join(GARMENTS)))
            for p, why in FILLER:
                if re.search(p, ((c.get("outfit") or "") + " " + (c.get("scene") or "")).lower()):
                    bad("%s번: %s" % (n, why))
        # 세 장은 서로 다른 장소 묶음(옛 「세 장 모두 다른 갈래」) — 이미 등록된 컷(kept)끼리 겹친 것은 그대로 둔다
        groups = [group_of(c, sp) for c in cuts]
        for c in cuts:
            if not c.get("kept") and groups.count(group_of(c, sp)) > 1:
                bad("%s번: 장소 묶음 %s 를 다른 컷도 쓴다 — 세 장은 서로 다른 묶음" % (c.get("cut"), group_of(c, sp)))
        if sum(bool(re.search(r"\b(empty|deserted|quiet)\b", (c.get("scene") or "").lower())) for c in cuts) > 1:
            bad("빈·조용한 장소는 세 장 중 한 장까지")
        if refill:
            cover = [c["cut"] for c in cuts if set(c.get("garments") or []) & COVERING]
            if len(cover) > 1:
                bad("몸을 덮는 겉옷(%s)을 %s번 컷에 — 세 장 중 한 장까지" % ("·".join(sorted(COVERING)), cover))
            continue
        if not any(c.get("orient") not in orients or c.get("frame") not in frames for c in cuts):
            bad("방향이나 프레이밍을 비교 대상이 안 쓴 값으로 고른 컷이 없다")
        if not any(g not in gar for c in cuts for g in (c.get("garments") or [])):
            bad("비교 대상이 안 쓴 옷 종류가 한 장에도 없다")
        low = low_groups(base[-GROUP_WINDOW:] + others, sp)
        if not any(group_of(c, sp) in low for c in cuts if not req_of(c)):
            bad("필수 갈래가 아닌 컷 가운데 덜 쓴 장소 묶음(%s)이 없다" % ", ".join(sorted(low)))
        src = [(c.get("axes") or {}).get("source_influence") for c in cuts]
        if len(set(src)) == 1:
            bad("SOURCE 영향도가 세 장 모두 같다")
        for e in cmp_:
            if sorted(src) == sorted((c.get("axes") or {}).get("source_influence") for c in e["cuts"]) and len(e["cuts"]) == len(cuts):
                bad("SOURCE 영향도 구성이 %s 와 같다" % e.get("card"))
            same = sum(1 for c in cuts if any((c.get("axes") or {}) == (d.get("axes") or {}) for d in e["cuts"]))
            if same >= 2:
                bad("세 축 값이 %s 의 컷과 같은 컷이 둘 이상" % e.get("card"))
        cover = [c["cut"] for c in cuts if set(c.get("garments") or []) & COVERING]
        if len(cover) > 1:
            bad("몸을 덮는 겉옷(%s)을 %s번 컷에 — 세 장 중 한 장까지" % ("·".join(sorted(COVERING)), cover))
        motif = sum(bool(re.search(r"\b(tiny|small|one) [a-z -]*(charm|pendant|ring|earring|clasp|pin|brooch|bracelet|badge|clip|stud)", (c.get("outfit") or "").lower())) for c in cuts)
        if motif == 3:
            bad("세 장 모두 작은 원작 장신구 — 필요한 컷에만 넣는다")
        hist.append({"card": who, "cuts": cuts})
        prev_req = req
    return errs


def snapshot(args):
    """One source for planning and validation; never rewrite the shared ledger."""
    old = load(args.ledger)
    if not getattr(args, "fresh", False):
        return old
    return {"entries": read_records(args.repos) +
            [e for e in old.get("entries", []) if e.get("status") == "reserved"]}


def check(args, write=False):
    doc, sp = snapshot(args), spec()
    with open(args.plan, encoding="utf-8") as f:
        plan = json.load(f)
    errs = check_plan(doc, plan, sp, args.ledger)
    for e in errs:
        print("  ✗ " + e)
    if errs:
        print("계획 미통과 %d건 — 고친 뒤 다시 check" % len(errs))
        sys.exit(1)
    print("계획 통과 — %d명" % len(plan.get("characters") or []))
    if write:
        session = re.sub(r"[^A-Za-z0-9._-]+", "-", str(plan.get("session") or "")).strip("-.")
        if not session:
            raise SystemExit("계획에 session 이름이 없다 — 예약 파일 이름이 된다")
        d = os.path.join(os.path.dirname(args.ledger), RESERVATIONS)
        os.makedirs(d, exist_ok=True)
        path = os.path.join(d, session + ".json")
        old = {}
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                old = {e["card"]: e for e in (json.load(f).get("characters") or []) if fresh({**e, "status": "reserved"})}
        at = now()
        for ch in plan["characters"]:
            e = {"species": ch.get("species"), "card": ch["card"], "at": at,
                 "cuts": [{k: c.get(k) for k in reserve_keys(c) if c.get(k) is not None and (k != "kept" or c.get(k))}
                          for c in ch["cuts"]]}
            if ch.get("refill"):
                e["refill"] = True
            e["stamp"] = stamp_of(plan.get("session"), e)
            old[ch["card"]] = e
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"note": "일상컷 예약 — tools/casual-ledger.py reserve 가 쓴다. 손으로 쓰거나 고치지 않는다(캐릭터마다 도장 stamp — 고치면 verify·관리기가 막는다). 세션 하나 = 파일 하나라 push 가 엇갈려도 남의 예약을 지우지 않는다. 24시간 지나면 읽지 않는다.",
                       "session": plan.get("session"), "at": at, "characters": list(old.values())}, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print("예약 %s — 이 파일만 commit·push 한 뒤 생성한다" % os.path.relpath(path, os.path.dirname(os.path.dirname(args.ledger))))


def view(args):
    """계획기(tools/casual-plan.cjs)가 읽는 살아 있는 칸 — 장부 + 세션별 예약, 시각 차례. --fresh 면 기록에서 다시 읽는다(장부 파일은 안 쓴다)"""
    doc = snapshot(args)
    es = live(doc, args.ledger)
    json.dump({"entries": es}, sys.stdout, ensure_ascii=False)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["build", "report", "check", "reserve", "view", "verify"])
    ap.add_argument("plan", nargs="?")
    ap.add_argument("--ledger", default=LEDGER)
    ap.add_argument("--repos", nargs="+", default=REPOS)
    ap.add_argument("--fresh", action="store_true", help="view/check/reserve: 장부 파일 대신 기록에서 다시 읽는다")
    ap.add_argument("--session", help="verify: 이 세션의 예약만")
    ap.add_argument("--card", help="verify: 이 캐릭터의 예약만")
    a = ap.parse_args()
    if a.cmd in ("check", "reserve") and not a.plan:
        ap.error("PLAN.json 이 필요하다")
    {"build": build, "report": report, "check": check, "reserve": lambda x: check(x, True), "view": view, "verify": verify}[a.cmd](a)


if __name__ == "__main__":
    main()
