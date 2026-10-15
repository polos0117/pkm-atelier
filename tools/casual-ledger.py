#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""일상컷 장부 — 여러 세션이 동시에 일상컷을 만들어도 같은 장면·구도·옷을 고르지 않게 한다.

장부는 그림 저장소 하나에 둔다: pkm-atelier-img-2/records/casual-ledger.json
(그림 저장소를 더 늘려도 장부는 여기 하나다). 한 칸이 캐릭터 하나, 상태는 둘이다.
  done      그림 저장소 기록(records/<종>-<날짜>/casualN-ui.json)에서 읽어 온 등록분
  reserved  생성 전에 세션이 먼저 적어 둔 계획. 등록되면 build 가 done 으로 바꾼다

  python3 tools/casual-ledger.py build   — 기록을 다시 읽어 done 칸을 만든다(reserved 는 지킨다)
  python3 tools/casual-ledger.py report  — 계획에 쓸 요약(최근 예시·구도 짝·덜 쓴 갈래·옷 종류·필수 갈래 자리)
  python3 tools/casual-ledger.py check  PLAN.json — 계획이 IMAGE_RULES 3절 "일상컷 장면 설정 순서" 의
                                                  장부 조건을 지키는지 본다. 어기면 1 로 끝난다
  python3 tools/casual-ledger.py reserve PLAN.json — check 를 통과하면 장부에 reserved 로 적는다
                                                  (그다음 그림 저장소를 commit·push 해야 다른 세션이 본다)

PLAN.json 꼴(배치 하나 — 같이 만드는 캐릭터 전부):
  {"session": "아무 이름", "characters": [
     {"card": "무장조", "species": "skarmory-20261016",
      "cuts": [{"cut": 1, "cat": "...", "ex": "...", "expr": "...", "pose": "...", "orient": "...",
                "frame": "...", "lens": "...",
                "axes": {"action_level": "...", "source_influence": "...", "separates_preference": "..."},
                "garments": ["dress", ...], "scene": "(선택)", "outfit": "(선택)"}, ...]}]}

기본 경로는 이 저장소 옆의 ../pkm-atelier-img, ../pkm-atelier-img-2 다(--repos 로 바꾼다)."""
import argparse, datetime, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPOS = [os.path.join(os.path.dirname(ROOT), n) for n in ("pkm-atelier-img", "pkm-atelier-img-2")]
LEDGER = os.path.join(os.path.dirname(ROOT), "pkm-atelier-img-2", "records", "casual-ledger.json")

REQUIRED = {"adult_roleplay", "swimwear", "lingerie"}
# 갈래 고르기에서 세지 않는 것: 자동·직접 입력, everyday(everyday_basic 과 예시가 같은 옛 이름),
# partner_care(곁에 포켓몬이 있어야 하는데 일상컷은 한 명만 그린다)
NOT_COUNTED = {"auto_random", "__custom__", "everyday", "partner_care"}
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


def added_at(repo, rel):
    """기록 폴더가 처음 커밋된 시각. 커밋 전이면 지금"""
    try:
        out = subprocess.run(["git", "-C", repo, "log", "--diff-filter=A", "--format=%aI", "--", rel],
                             capture_output=True, text=True).stdout.split()
        return out[-1] if out else now()
    except OSError:
        return now()


def read_records(repos):
    entries = []
    for repo in repos:
        base = os.path.join(repo, "records")
        if not os.path.isdir(base):
            continue
        for d in sorted(os.listdir(base)):
            cuts, card = [], None
            for i in (1, 2, 3):
                f = os.path.join(base, d, "casual%d-ui.json" % i)
                if not os.path.exists(f):
                    continue
                try:
                    with open(f, encoding="utf-8") as h:
                        st = (json.load(h).get("storage") or {})
                except (ValueError, OSError):
                    continue
                card = st.get("last") or card
                c = ((st.get("cards") or {}).get(st.get("last")) or {}).get("scenes", {}).get("casual")
                if not c:
                    continue
                ax = c.get("axes") or {}
                cuts.append({"cut": i, **{k: c.get(k) or None for k in
                                          ("cat", "ex", "expr", "pose", "orient", "frame", "lens")},
                             "axes": {k: ax.get(k) for k in ("action_level", "source_influence", "separates_preference")},
                             "garments": garments_of(c.get("outfit"))})
            if cuts:
                entries.append({"species": d, "card": card, "repo": os.path.basename(repo),
                                "at": added_at(repo, os.path.join("records", d)), "status": "done", "cuts": cuts})
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


def live(doc):
    return sorted([e for e in doc["entries"] if fresh(e)], key=when)


def build(args):
    old = load(args.ledger)
    done = read_records(args.repos)
    cards = {e["card"] for e in done}
    keep = [e for e in old.get("entries", []) if e.get("status") == "reserved" and fresh(e) and e.get("card") not in cards]
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
    es = live(doc)
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


def check_plan(doc, plan, sp):
    errs = []
    es = live(doc)
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
        if len(cuts) != 3:
            bad("일상컷은 세 장")
        for k in ("expr", "pose", "orient", "frame"):
            if len({c.get(k) for c in cuts}) != len(cuts):
                bad("세 장의 %s 가 서로 달라야 한다" % k)
        req = [c["cut"] for c in cuts if c.get("cat") in REQUIRED]
        if not req:
            bad("필수 갈래(adult_roleplay·swimwear·lingerie)가 없다")
        if prev_req is not None and req and sorted(req) == sorted(prev_req):
            bad("필수 갈래 자리 %s 가 바로 앞 캐릭터와 같다 — 컷 번호를 돌린다" % req)
        last = hist[-(TWO_REQUIRED_EVERY - 1):]
        if len(last) == TWO_REQUIRED_EVERY - 1 and all(sum(c.get("cat") in REQUIRED for c in e["cuts"]) < 2 for e in last) and len(req) < 2:
            bad("앞 %d명이 모두 필수 갈래 한 장 — 이번에는 두 장" % (TWO_REQUIRED_EVERY - 1))
        used_ex = {(c.get("cat"), c.get("ex")) for e in exw for c in e["cuts"]}
        pairs = cut_pairs(cmp_)
        orients = {c.get("orient") for e in cmp_ for c in e["cuts"]}
        frames = {c.get("frame") for e in cmp_ for c in e["cuts"]}
        gar = {g for e in cmp_ for c in e["cuts"] for g in (c.get("garments") or [])}
        for c in cuts:
            n = c.get("cut")
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
            if c.get("cat") == "adult_roleplay" and re.search(r"themed|costume (event|booth|party|exhibition)|exhibition|booth", (c.get("scene") or "").lower()):
                bad("%s번: 역할극을 테마 행사장·코스튬 부스로 연출했다 — 그 역할의 장면 자체로 쓴다" % n)
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
        motif = sum(bool(re.search(r"\b(tiny|small|one) [a-z -]*(charm|pendant|ring|earring|clasp|pin|brooch|bracelet|badge|clip|stud)", (c.get("outfit") or "").lower())) for c in cuts)
        if motif == 3:
            bad("세 장 모두 작은 원작 장신구 — 필요한 컷에만 넣는다")
        hist.append({"card": who, "cuts": cuts})
        prev_req = req
    return errs


def check(args, write=False):
    doc, sp = load(args.ledger), spec()
    with open(args.plan, encoding="utf-8") as f:
        plan = json.load(f)
    errs = check_plan(doc, plan, sp)
    for e in errs:
        print("  ✗ " + e)
    if errs:
        print("계획 미통과 %d건 — 고친 뒤 다시 check" % len(errs))
        sys.exit(1)
    print("계획 통과 — %d명" % len(plan.get("characters") or []))
    if write:
        names = {ch["card"] for ch in plan["characters"]}
        doc["entries"] = [e for e in doc["entries"] if not (e.get("status") == "reserved" and e.get("card") in names)]
        for ch in plan["characters"]:
            doc["entries"].append({"species": ch.get("species"), "card": ch["card"], "status": "reserved",
                                   "session": plan.get("session"), "at": now(),
                                   "cuts": [{k: c.get(k) for k in ("cut", "cat", "ex", "expr", "pose", "orient", "frame", "lens", "axes", "garments")}
                                            for c in ch["cuts"]]})
        save(args.ledger, doc)
        print("장부에 reserved 로 적었다 — 그림 저장소를 commit·push 한 뒤 생성한다")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["build", "report", "check", "reserve"])
    ap.add_argument("plan", nargs="?")
    ap.add_argument("--ledger", default=LEDGER)
    ap.add_argument("--repos", nargs="+", default=REPOS)
    a = ap.parse_args()
    if a.cmd in ("check", "reserve") and not a.plan:
        ap.error("PLAN.json 이 필요하다")
    {"build": build, "report": report, "check": check, "reserve": lambda x: check(x, True)}[a.cmd](a)


if __name__ == "__main__":
    main()
