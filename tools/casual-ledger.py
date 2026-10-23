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
  python3 tools/casual-ledger.py report  — 계획에 쓸 요약(최근 예시·구도 짝·덜 쓴 갈래·옷 종류·필수 갈래 자리)
  python3 tools/casual-ledger.py view [--fresh] — 장부 + 살아 있는 예약을 합친 JSON(계획기가 읽는다).
                                                  --fresh 면 기록을 다시 읽어 done 을 새로 센다
  python3 tools/casual-ledger.py check  PLAN.json — 계획이 IMAGE_RULES 3절 "일상컷 장면 설정 순서" 의
                                                  장부 조건을 지키는지 본다. 어기면 1 로 끝난다
  python3 tools/casual-ledger.py reserve PLAN.json — check 를 통과하면 세션 예약 파일에 적는다
                                                  (그다음 그림 저장소를 commit·push 해야 다른 세션이 본다.
                                                  보통은 node tools/casual-plan.cjs … --reserve --push 가 다 한다)

계획은 손으로 짜지 않는다 — node tools/casual-plan.cjs <카드>… --session <이름> 이 장부·예약·생김새 색인
(data/casual-look.json)을 읽어 정하고, 이 check 를 통과할 때까지 다시 고른다.

PLAN.json 꼴(배치 하나 — 같이 만드는 캐릭터 전부):
  {"session": "아무 이름", "characters": [
     {"card": "무장조", "species": "skarmory-20261016",
      "cuts": [{"cut": 1, "cat": "...", "ex": "...", "expr": "...", "pose": "...", "orient": "...",
                "frame": "...", "lens": "...",
                "axes": {"action_level": "...", "source_influence": "...", "separates_preference": "..."},
                "garments": ["dress", ...], "scene": "(선택)", "outfit": "(선택)"}, ...]}]}

빠진 컷 다시 채우기(안전 필터에 막혀 비었거나 넘어간 컷): 그 캐릭터에 "refill": true 를 주고, 이미 등록된
컷에는 "kept": true 를 붙여 세 장을 다 적는다. 새로 만드는 컷만 예시·구도·옷·채우기 문구를 보고, 차례에 매인
조건(필수 갈래 자리 돌리기·다섯 명에 두 장·덜 쓴 갈래·새 값)은 보지 않는다. 세 장 안의 조건(값이 서로 다름·필수 갈래
한 장 이상·덮는 겉옷 한 장까지)은 그대로 본다.

기본 경로는 이 저장소 옆의 ../pkm-atelier-img, ../pkm-atelier-img-2, ../pkm-atelier-img-3 이다(--repos 로 바꾼다).
장부·예약은 그대로 둘째 저장소에 — 새 그림의 기록은 셋째 저장소에 쌓인다."""
from pathlib import Path
import argparse, datetime, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPOS = [os.path.join(os.path.dirname(ROOT), n) for n in ("pkm-atelier-img", "pkm-atelier-img-2", "pkm-atelier-img-3")]
LEDGER = os.path.join(os.path.dirname(ROOT), "pkm-atelier-img-2", "records", "casual-ledger.json")
# 예약은 세션마다 따로 파일(2026-10-22) — 한 장부 파일에 다들 쓰다 push 가 엇갈리면 남의 예약을 지웠다(밤선인·파치리스, 체리꼬·샤비)
RESERVATIONS = "casual-reservations"

REQUIRED = {"adult_roleplay", "swimwear", "lingerie"}
# 갈래 고르기에서 세지 않는 것: 자동·직접 입력, everyday(everyday_basic 과 예시가 같은 옛 이름)
NOT_COUNTED = {"auto_random", "__custom__", "everyday"}
BANNED_FRAME = {"face_close", "detail"}
BANNED_ORIENT = {"back", "back_to_camera", "walking_away"}
EX_WINDOW = 10          # 같은 장면 예시는 최근 10명 안에서 다시 쓰지 않는다
CMP_WINDOW = 3          # 구도·옷·세 축 비교는 최근 3명
CAT_WINDOW = 10         # 덜 쓴 갈래는 최근 10명으로 센다
CAT_LOW = 5             # 그중 사용 횟수 하위 5개(같은 횟수는 함께)
SMALL_CAT = 8           # 예시가 이 수 이하인 갈래는 한 바퀴를 다 돌기 전까지 같은 예시를 다시 쓰지 않는다
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


def spec():
    """생성기의 갈래·예시 목록. 정본은 lib/prompt-spec.js 라 node 로 읽는다"""
    js = ("const fs=require('fs'),vm=require('vm');const c={window:{}};vm.createContext(c);"
          "vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);const S=c.window.AtelierSpec;"
          "const ex={};for(const [k,v] of Object.entries(S.EXAMPLE_MAP))ex[k]=v.filter(r=>r[0]&&r[0]!=='__custom__'"
          "&&!r[0].startsWith('auto_')&&r[4]!=='m').map(r=>r[0]);"
          "process.stdout.write(JSON.stringify({cats:S.CATS.filter(r=>r[4]!=='m').map(r=>r[0]),ex}))")
    out = subprocess.run(["node", "-e", js, os.path.join(ROOT, "lib", "prompt-spec.js")],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


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
                if not os.path.exists(f):
                    continue
                try:
                    with open(f, encoding="utf-8") as h:
                        record = json.load(h)
                        st = record.get("storage") or {}
                except (ValueError, OSError):
                    continue
                card = st.get("last") or record.get("card") or card
                if (card, i) in replacement_ui:
                    record = json.loads(replacement_ui[(card, i)].read_text())
                    st = record.get("storage") or {}
                cd = (st.get("cards") or {}).get(card) or (st if "scenes" in st else {})
                c = cd.get("scenes", {}).get("casual")
                if not c or not card:
                    continue
                mine = [n for n in imgs if n.startswith(card + "_") and n.endswith("_f_casual%d.webp" % i)]
                if imgs and not mine:
                    continue
                files += mine
                ax = c.get("axes") or {}
                cuts.append({"cut": i, **{k: c.get(k) or None for k in
                                          ("cat", "ex", "expr", "pose", "orient", "frame", "lens")},
                             "axes": {k: ax.get(k) for k in ("action_level", "source_influence", "separates_preference")},
                             "garments": garments_of(c.get("outfit"))})
            if cuts:
                entries.append({"species": d, "card": card, "repo": os.path.basename(repo),
                                "at": added_at(repo, os.path.join("records", d), card, files), "status": "done", "cuts": cuts})
    return entries


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


def live(doc, ledger=None):
    """장부의 칸 + 세션별 예약. 등록된 캐릭터(done)의 예약은 빼고(다시 채우기는 남긴다), 같은 캐릭터 예약은 늦은 것 하나만"""
    es = [e for e in doc["entries"] if fresh(e)]
    if ledger:
        es += reservations(ledger)
        # 계획기가 정한 드러내는 방식(expose)은 생성기 상태에 남지 않는다 — 같은 컷(번호·예시)의 예약에서 옮겨 온다
        plans = {(r.get("card"), c.get("cut"), c.get("ex")): c.get("expose") for r in reservations(ledger, stale=True) for c in r.get("cuts") or [] if c.get("expose")}
        for e in es:
            if e.get("status") != "reserved":
                for c in e["cuts"]:
                    if not c.get("expose") and plans.get((e.get("card"), c.get("cut"), c.get("ex"))):
                        c["expose"] = plans[(e.get("card"), c.get("cut"), c.get("ex"))]
    done = {e["card"] for e in es if e.get("status") != "reserved"}
    last = {}
    for e in sorted(es, key=when):
        if e.get("status") == "reserved":
            if e.get("card") in done and not e.get("refill"):
                continue
            last[e.get("card")] = e
    return sorted([e for e in es if e.get("status") != "reserved"] + list(last.values()), key=when)


def build(args):
    gone = [r for r in args.repos if not os.path.isdir(os.path.join(r, "records"))]
    if gone:
        # 세션마다 받아 둔 저장소가 다르면 장부가 줄었다 늘었다 한다 — 다 받은 곳에서만 다시 만든다
        raise SystemExit("그림 저장소가 없다: %s — pkm-atelier 옆에 셋 다 받은 뒤 build 한다" % ", ".join(gone))
    old = load(args.ledger)
    done = read_records(args.repos)
    cards = {e["card"] for e in done}
    got = {(e["card"], c["cut"], c.get("cat"), c.get("ex")) for e in done for c in e["cuts"]}

    def pending(e):
        """등록되지 않은 예약 — 새 캐릭터이거나, 다시 채우는 컷이 아직 기록에 없다"""
        if e.get("status") != "reserved" or not fresh(e):
            return False
        if e.get("card") not in cards:
            return True
        return bool(e.get("refill")) and any((e["card"], c["cut"], c.get("cat"), c.get("ex")) not in got
                                             for c in e["cuts"] if not c.get("kept"))
    keep = [e for e in old.get("entries", []) if pending(e)]
    save(args.ledger, {"entries": done + keep})
    print("장부: done %d · reserved %d → %s" % (len(done), len(keep), args.ledger))


def cut_pairs(entries):
    return {(c.get("orient"), c.get("frame")) for e in entries for c in e["cuts"]}


def cat_counts(entries, cats):
    n = {k: 0 for k in cats if k not in NOT_COUNTED}
    for e in entries:
        for c in e["cuts"]:
            k = "everyday_basic" if c.get("cat") == "everyday" else c.get("cat")
            if k in n:
                n[k] += 1
    return n


def low_cats(entries, cats):
    n = cat_counts(entries, cats)
    if not n:
        return set()
    cut = sorted(n.values())[min(CAT_LOW, len(n)) - 1]
    return {k for k, v in n.items() if v <= cut}


def report(args):
    doc, sp = load(args.ledger), spec()
    es = live(doc, args.ledger)
    print("장부 %s — 칸 %d (reserved %d)" % (args.ledger, len(es), sum(e["status"] == "reserved" for e in es)))
    print("\n[최근 %d명 · 다시 쓰지 않는 장면 예시]" % EX_WINDOW)
    for e in es[-EX_WINDOW:]:
        print("  %-8s %-9s %s" % (e["card"], e["status"], " · ".join("%s/%s" % (c.get("cat"), c.get("ex")) for c in e["cuts"])))
    print("\n[최근 %d명 · (방향, 프레이밍) 짝 · 옷 종류 · 세 축]" % CMP_WINDOW)
    for e in es[-CMP_WINDOW:]:
        for c in e["cuts"]:
            ax = c.get("axes") or {}
            print("  %-8s %d  (%s, %s)  %s  [%s/%s/%s]" % (e["card"], c["cut"], c.get("orient"), c.get("frame"),
                  ",".join(c.get("garments") or []) or "-", ax.get("action_level"), ax.get("source_influence"), ax.get("separates_preference")))
    n = cat_counts(es[-CAT_WINDOW:], sp["cats"])
    low = low_cats(es[-CAT_WINDOW:], sp["cats"])
    print("\n[최근 %d명 갈래 사용 횟수 — * 는 덜 쓴 갈래]" % CAT_WINDOW)
    print("  " + " · ".join("%s%s=%d" % ("*" if k in low else "", k, v) for k, v in sorted(n.items(), key=lambda x: x[1])))
    print("\n[예시가 %d개 이하인 갈래 — 이번 바퀴에 아직 안 쓴 예시]" % SMALL_CAT)
    for k, lst in sp["ex"].items():
        if 0 < len(lst) <= SMALL_CAT and k not in NOT_COUNTED:
            print("  %s: %s" % (k, ", ".join(small_cat_open(doc["entries"], k, lst))))
    print("\n[필수 갈래 자리 — 최근 %d명]" % TWO_REQUIRED_EVERY)
    for e in es[-TWO_REQUIRED_EVERY:]:
        print("  %-8s %s" % (e["card"], [c["cut"] for c in e["cuts"] if c.get("cat") in REQUIRED]))


def small_cat_open(entries, cat, lst):
    """한 바퀴 — 이 갈래 예시 가운데 가장 적게 쓴 것들"""
    n = {x: 0 for x in lst}
    for e in entries:
        if not fresh(e):
            continue
        for c in e["cuts"]:
            if c.get("cat") == cat and c.get("ex") in n:
                n[c["ex"]] += 1
    m = min(n.values())
    return [x for x in lst if n[x] == m]


def check_plan(doc, plan, sp, ledger=None):
    errs = []
    es = live(doc, ledger)
    batch = plan.get("characters") or []
    names = {ch.get("card") for ch in batch}
    base = [e for e in es if e.get("card") not in names]
    prev_req = [c["cut"] for c in base[-1]["cuts"] if c.get("cat") in REQUIRED] if base else None
    hist = base[:]
    for ch in batch:
        who, cuts = ch.get("card"), ch.get("cuts") or []
        others = [{"card": o.get("card"), "cuts": o.get("cuts") or []} for o in batch if o is not ch]
        cmp_ = base[-CMP_WINDOW:] + [e for e in es if e["status"] == "reserved" and e.get("card") not in names] + others
        exw = base[-EX_WINDOW:] + [e for e in es if e["status"] == "reserved" and e.get("card") not in names] + others
        bad = lambda m: errs.append("%s: %s" % (who, m))
        refill = bool(ch.get("refill"))
        if len(cuts) != 3:
            bad("일상컷은 세 장")
        for k in ("expr", "pose", "orient", "frame"):
            if len({c.get(k) for c in cuts}) != len(cuts):
                bad("세 장의 %s 가 서로 달라야 한다" % k)
        req = [c["cut"] for c in cuts if c.get("cat") in REQUIRED]
        if not req:
            bad("필수 갈래(adult_roleplay·swimwear·lingerie)가 없다")
        if not refill and prev_req is not None and req and sorted(req) == sorted(prev_req):
            bad("필수 갈래 자리 %s 가 바로 앞 캐릭터와 같다 — 컷 번호를 돌린다" % req)
        last = hist[-(TWO_REQUIRED_EVERY - 1):]
        if not refill and len(last) == TWO_REQUIRED_EVERY - 1 and all(sum(c.get("cat") in REQUIRED for c in e["cuts"]) < 2 for e in last) and len(req) < 2:
            bad("앞 %d명이 모두 필수 갈래 한 장 — 이번에는 두 장" % (TWO_REQUIRED_EVERY - 1))
        used_ex = {(c.get("cat"), c.get("ex")) for e in exw for c in e["cuts"]}
        pairs = cut_pairs(cmp_)
        orients = {c.get("orient") for e in cmp_ for c in e["cuts"]}
        frames = {c.get("frame") for e in cmp_ for c in e["cuts"]}
        gar = {g for e in cmp_ for c in e["cuts"] for g in (c.get("garments") or [])}
        for c in cuts:
            n = c.get("cut")
            if c.get("kept"):
                continue
            if c.get("cat") in (None, "", "auto_random", "everyday") or not c.get("ex") or str(c.get("ex")).startswith("auto_"):
                bad("%s번: 갈래·예시가 비었거나 자동·옛 이름이다" % n)
            if (c.get("cat"), c.get("ex")) in used_ex and c.get("ex") != "__custom__":
                bad("%s번: 예시 %s/%s 를 최근 %d명·예약·배치 안에서 이미 썼다" % (n, c.get("cat"), c.get("ex"), EX_WINDOW))
            lst = sp["ex"].get(c.get("cat")) or []
            if 0 < len(lst) <= SMALL_CAT and c.get("ex") in lst and c["ex"] not in small_cat_open(doc["entries"], c["cat"], lst):
                bad("%s번: %s 는 예시가 %d개뿐 — 이번 바퀴에 아직 안 쓴 예시부터 쓴다" % (n, c["cat"], len(lst)))
            if c.get("frame") in BANNED_FRAME or c.get("orient") in BANNED_ORIENT:
                bad("%s번: 일상컷에 쓰지 않는 방향·프레이밍" % n)
            if (c.get("orient"), c.get("frame")) in pairs:
                bad("%s번: (방향, 프레이밍) 짝 (%s, %s) 이 비교 대상과 겹친다" % (n, c.get("orient"), c.get("frame")))
            if not [g for g in (c.get("garments") or []) if g in GARMENTS]:
                bad("%s번: garments 가 비었거나 정해 둔 옷 종류가 아니다(%s)" % (n, ", ".join(GARMENTS)))
            for p, why in FILLER:
                if re.search(p, ((c.get("outfit") or "") + " " + (c.get("scene") or "")).lower()):
                    bad("%s번: %s" % (n, why))
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
        low = low_cats(base[-CAT_WINDOW:] + others, sp["cats"])
        if not any(c.get("cat") in low for c in cuts if c.get("cat") not in REQUIRED):
            bad("필수 갈래가 아닌 컷 가운데 덜 쓴 갈래(%s)가 없다" % ", ".join(sorted(low)))
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
                 "cuts": [{k: c.get(k) for k in ("cut", "cat", "ex", "expr", "pose", "orient", "frame", "lens", "axes", "garments", "expose", "lead", "kept") if c.get(k) is not None and (k != "kept" or c.get(k))}
                          for c in ch["cuts"]]}
            if ch.get("refill"):
                e["refill"] = True
            old[ch["card"]] = e
        with open(path, "w", encoding="utf-8") as f:
            json.dump({"note": "일상컷 예약 — tools/casual-ledger.py reserve 가 쓴다. 세션 하나 = 파일 하나라 push 가 엇갈려도 남의 예약을 지우지 않는다. 24시간 지나면 읽지 않는다.",
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
    ap.add_argument("cmd", choices=["build", "report", "check", "reserve", "view"])
    ap.add_argument("plan", nargs="?")
    ap.add_argument("--ledger", default=LEDGER)
    ap.add_argument("--repos", nargs="+", default=REPOS)
    ap.add_argument("--fresh", action="store_true", help="view/check/reserve: 장부 파일 대신 기록에서 다시 읽는다")
    a = ap.parse_args()
    if a.cmd in ("check", "reserve") and not a.plan:
        ap.error("PLAN.json 이 필요하다")
    {"build": build, "report": report, "check": check, "reserve": lambda x: check(x, True), "view": view}[a.cmd](a)


if __name__ == "__main__":
    main()
