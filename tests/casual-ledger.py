"""일상컷 장부 — 기록 읽기, 예약, 계획 검사. python3 tests/casual-ledger.py
   - build: casualN-ui.json 에서 선택값과 옷 종류를 읽고, 등록된 캐릭터의 reserved 는 done 으로 바뀐다
   - check: IMAGE_RULES 3절의 장부 조건을 하나씩 어긴 계획이 그 이유로 걸린다. 지키는 계획은 통과한다
   - reserve: 통과한 계획만 reserved 로 적고, 다음 세션의 check 가 그것을 비교 대상으로 본다"""
import copy, importlib.util, io, json, contextlib, os, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('ledger', ROOT / 'tools' / 'casual-ledger.py')
L = importlib.util.module_from_spec(spec); spec.loader.exec_module(L)
SP = L.spec()


def cut(n, cat, ex, expr, pose, orient, frame, src, garments, act="balanced", **kw):
    return {"cut": n, "cat": cat, "ex": ex, "expr": expr, "pose": pose, "orient": orient, "frame": frame, "lens": "natural50",
            "axes": {"action_level": act, "source_influence": src, "separates_preference": "balanced"}, "garments": garments, **kw}


def done(card, cuts, at):
    return {"species": card, "card": card, "status": "done", "at": at, "cuts": cuts}


# 앞선 다섯 명 — 필수 갈래는 모두 한 장, 1번 자리
hist = [done("A%d" % i, [cut(1, "adult_roleplay", "retro_racer", "e1", "p1", "front", "full_body", "subtle", ["jacket", "shorts"]),
                          cut(2, "everyday_basic", "pottery_class", "e2", "p2", "side", "waist_up", "balanced", ["blouse", "skirt"]),
                          cut(3, "partner_care", "care_walk", "e3", "p3", "front_3q", "three_quarter", "subtle", ["shirt", "trousers"])],
             "2026-10-1%dT10:00:00+09:00" % i) for i in range(1, 6)]
doc = {"entries": hist}

good = {"session": "t", "characters": [{"card": "B", "species": "b-1", "cuts": [
    cut(1, "festivals_contests", "fest_lantern", "x1", "q1", "low_angle", "environmental", "strong", ["dress"], act="mostly active"),
    cut(2, "swimwear", "classic_bikini", "x2", "q2", "high_angle", "chest_up", "balanced", ["bikini"], act="mostly posed"),
    cut(3, "lingerie", "lace_set", "x3", "q3", "rear_3q", "full_body", "subtle", ["lingerie_set"], act="mostly posed")]}]}
assert "classic_bikini" in SP["ex"]["swimwear"] and "lace_set" in SP["ex"]["lingerie"] and "fest_lantern" in SP["ex"]["festivals_contests"]
assert L.check_plan(doc, good, SP) == [], L.check_plan(doc, good, SP)


def fails(mutate, why):
    p = copy.deepcopy(good); mutate(p["characters"][0]["cuts"])
    errs = L.check_plan(doc, p, SP)
    assert any(why in e for e in errs), (why, errs)

fails(lambda c: c[0].update(cat="partner_care", ex="care_walk"), "이미 썼다")                       # 최근 10명 안 같은 예시
fails(lambda c: c[0].update(orient="front", frame="full_body"), "짝")                                     # 구도 짝 겹침
fails(lambda c: c[1].update(frame="detail"), "쓰지 않는")                                                 # 얼굴이 안 보이는 프레이밍
fails(lambda c: c[1].update(frame="face_close"), "필수 갈래")                                              # 얼굴 클로즈업 — 수영복 컷엔 안 쓴다
fails(lambda c: c[0].update(orient="crouching", frame="face_close"), "카메라 쪽")                            # 얼굴 클로즈업 — 몸 방향과 짝짓지 않는다
_fc = copy.deepcopy(good); _fc["characters"][0]["cuts"][0].update(frame="face_close")                     # 얼굴 클로즈업 — 2026-10-27 열었다
assert L.check_plan(doc, _fc, SP) == [], L.check_plan(doc, _fc, SP)
fails(lambda c: c[2].update(cat="active", ex=SP["ex"]["active"][0]), "두 장")                        # 다섯 명에 한 번은 두 장
fails(lambda c: [x["axes"].update(source_influence="subtle") for x in c], "SOURCE")                      # 세 장 같은 영향도
fails(lambda c: c[0].update(garments=["robe2"]), "garments")                                             # 정해 둔 옷 종류만
fails(lambda c: c[0].update(outfit="Linen dress, no outer layer."), "덧옷")                              # 채우기 문구
fails(lambda c: c[0].update(scene="A plain unlettered lantern stall."), "글자")                          # 글자 금지 문구
fails(lambda c: c[0].update(cat="partner_care", ex="care_walk"), "바퀴")                          # 예시 적은 갈래는 한 바퀴(취미는 2026-10-26 열두 개가 됐다)

# 덮는 겉옷은 한 장까지
p = copy.deepcopy(good); p["characters"][0]["cuts"][0]["garments"] = ["dress", "coat"]; p["characters"][0]["cuts"][2]["garments"] = ["lingerie_set", "cardigan"]
assert any("겉옷" in e for e in L.check_plan(doc, p, SP))
# 시간대가 달라도 시각 차례로 줄 선다
assert [e["card"] for e in L.live({"entries": [done("late", [], "2026-10-15T01:00:00+00:00"), done("early", [], "2026-10-15T09:30:00+09:00")]})] == ["early", "late"]
# 한 바퀴: 예시가 적은 갈래는 덜 쓴 것부터 — 기록에 care_walk 만 썼으니 care_walk 은 바퀴에서 빠진다
assert "care_walk" not in L.small_cat_open(doc["entries"], "partner_care", SP["ex"]["partner_care"])
# 필수 갈래 자리 — 바로 앞 캐릭터와 같은 자리면 걸린다
p = copy.deepcopy(good); c = p["characters"][0]["cuts"]
c[0].update(cat="adult_roleplay", ex="casino_dealer"); c[1].update(cat="festivals_contests", ex="fest_booth"); c[2].update(cat="travel_exploration", ex="travel_lakeside")
assert any("자리" in e for e in L.check_plan(doc, p, SP))
# 빈·조용한 장소는 한 장까지
p = copy.deepcopy(good); [x.update(scene="An empty lantern street.") for x in p["characters"][0]["cuts"][:2]]
assert any("빈·조용한" in e for e in L.check_plan(doc, p, SP))

# 배치 안 두 캐릭터가 같은 예시·같은 구도 짝 — 동시 세션 문제를 계획 단계에서 막는다
p = copy.deepcopy(good); twin = copy.deepcopy(p["characters"][0]); twin.update(card="C", species="c-1"); p["characters"].append(twin)
errs = L.check_plan(doc, p, SP)
assert any(e.startswith("C:") and "이미 썼다" in e for e in errs) and any(e.startswith("C:") and "짝" in e for e in errs), errs

# 다시 채우기 — 등록된 두 장은 kept, 빈 한 장만 새로. 차례 조건은 안 보고 새 컷의 겹침은 본다
refill = {"session": "r", "characters": [{"card": "A5", "species": "A5", "refill": True, "cuts": [
    dict(hist[-1]["cuts"][0], kept=True), dict(hist[-1]["cuts"][1], kept=True),
    cut(3, "festivals_contests", "fest_booth", "e9", "p9", "low_angle", "chest_up", "strong", ["dress"])]}]}
assert L.check_plan(doc, refill, SP) == [], L.check_plan(doc, refill, SP)
bad_refill = copy.deepcopy(refill); bad_refill["characters"][0]["cuts"][2].update(cat="partner_care", ex="care_walk", orient="side", frame="waist_up")
errs = L.check_plan(doc, bad_refill, SP)
assert any("이미 썼다" in e for e in errs) and any("짝" in e for e in errs) and not any("자리" in e or "두 장" in e for e in errs), errs

L.STAMP_SINCE = "2026-01-01T00:00:00+00:00"   # 도입 전 예약 봐주기는 아래에서 따로 본다(시계에 매이지 않게)
with tempfile.TemporaryDirectory() as tmp:
    # reserve → 다른 세션의 같은 계획이 걸린다
    led = os.path.join(tmp, "ledger.json"); json.dump(doc, open(led, "w"))
    plan = os.path.join(tmp, "plan.json"); json.dump(good, open(plan, "w"))
    a = type("A", (), {"ledger": led, "plan": plan, "repos": []})
    with contextlib.redirect_stdout(io.StringIO()):
        L.check(a, write=True)
    saved = json.load(open(led))
    # 예약은 장부가 아니라 세션별 파일에 — push 가 엇갈려도 남의 예약을 지우지 않는다
    rfile = Path(tmp) / "casual-reservations" / "t.json"
    assert rfile.exists() and [e["status"] for e in saved["entries"]].count("reserved") == 0
    assert [e["card"] for e in L.live(saved, led) if e["status"] == "reserved"] == ["B"]
    other = copy.deepcopy(good); other["characters"][0].update(card="D", species="d-1")
    errs = L.check_plan(saved, other, SP, led)
    assert any("이미 썼다" in e for e in errs) and any("짝" in e for e in errs), errs
    # 다른 세션이 같은 시각에 예약해도 두 파일이 다 남는다
    json.dump({**other, "session": "u"}, open(plan, "w")); a2 = type("A", (), {"ledger": led, "plan": plan, "repos": []})
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            L.check(a2, write=True)
        raise AssertionError("겹치는 계획이 예약됐다")
    except SystemExit:
        pass
    # 도장 — reserve 가 적은 칸엔 도장이 있고, 고치거나 손으로 쓴 칸은 verify 가 1 로 끝난다(2026-10-25 히포포타스)
    r = json.load(open(rfile)); e0 = r["characters"][0]
    assert e0.get("stamp") and L.stamp_problem(r["session"], e0) is None, e0
    va = type("V", (), {"ledger": led, "session": "t", "card": None})
    with contextlib.redirect_stdout(io.StringIO()):
        L.verify(va)
    hand = copy.deepcopy(r); hand["characters"][0]["cuts"][1]["ex"] = "late_snack"; json.dump(hand, open(rfile, "w"))
    assert "고친" in L.stamp_problem("t", hand["characters"][0])
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            L.verify(va)
        raise AssertionError("손으로 고친 예약을 통과시켰다")
    except SystemExit as x:
        assert x.code == 1
    nostamp = {k: v for k, v in hand["characters"][0].items() if k != "stamp"}
    assert "없다" in L.stamp_problem("t", nostamp)
    assert L.stamp_problem("t", {**nostamp, "at": "2025-12-31T23:00:00+00:00"}) is None, "도입 전 예약은 따지지 않는다"
    json.dump(r, open(rfile, "w"))
    # 오래된 예약은 버린다
    r = json.load(open(rfile)); r["characters"][0]["at"] = "2020-01-01T00:00:00+09:00"; json.dump(r, open(rfile, "w"))
    assert L.check_plan(saved, other, SP, led) == [], L.check_plan(saved, other, SP, led)
    mine = {**good["characters"][0], "status": "reserved", "at": L.now()}
    saved["entries"].append(mine)   # 옛 장부 안의 예약(파일 이전)도 그대로 읽는다

    # build — 기록을 읽고, 등록된 캐릭터의 예약은 지운다
    rec = Path(tmp) / "img2" / "records" / "b-1"; rec.mkdir(parents=True)
    for c in good["characters"][0]["cuts"]:
        sc = {k: c[k] for k in ("cat", "ex", "expr", "pose", "orient", "frame", "lens")}
        sc.update(axes=c["axes"], outfit="A long linen sundress with a short denim jacket.")
        json.dump({"storage": {"last": "B", "cards": {"B": {"scenes": {"casual": sc}}}}}, open(rec / ("casual%d-ui.json" % c["cut"]), "w"))
    json.dump(saved, open(led, "w"))
    (Path(tmp) / "img2" / "img").mkdir()
    for n in (1, 2, 3):
        (Path(tmp) / "img2" / "img" / ("B_glossy_promo_f_casual%d.webp" % n)).touch()
    b = type("B", (), {"ledger": led, "repos": [str(Path(tmp) / "img2")]})
    with contextlib.redirect_stdout(io.StringIO()):
        L.build(b)
    out = json.load(open(led))
    assert [e["status"] for e in out["entries"]] == ["done"], out["entries"]
    # 이미 같은 번호·갈래·예시로 게시된 refill 예약은 live 비교에서 중복 계산하지 않는다.
    completed_refill = {"card": "B", "status": "reserved", "refill": True, "at": L.now(),
                        "cuts": copy.deepcopy(out["entries"][0]["cuts"])}
    assert [e["status"] for e in L.live({"entries": out["entries"] + [completed_refill]})] == ["done"]
    pending_refill = copy.deepcopy(completed_refill)
    pending_refill["cuts"][-1]["ex"] = "not_yet_published"
    assert [e["status"] for e in L.live({"entries": out["entries"] + [pending_refill]})] == ["done", "reserved"]
    # 등록된 캐릭터의 다시 채우기 예약은 그 컷이 기록에 오를 때까지 남는다
    out["entries"].append({"card": "B", "species": "b-1", "status": "reserved", "refill": True, "at": L.now(),
                           "cuts": [dict(c, kept=True) for c in good["characters"][0]["cuts"][:2]] +
                                   [cut(3, "festivals_contests", "fest_booth", "e9", "p9", "low_angle", "chest_up", "strong", ["dress"])]})
    json.dump(out, open(led, "w"))
    with contextlib.redirect_stdout(io.StringIO()):
        L.build(b)
    assert [e["status"] for e in json.load(open(led))["entries"]] == ["done", "reserved"]
    assert out["entries"][0]["cuts"][0]["garments"] == ["dress", "jacket"], out["entries"][0]["cuts"][0]
    # 저장소 하나가 없으면 다시 만들지 않는다
    try:
        L.build(type("G", (), {"ledger": led, "repos": [str(Path(tmp) / "img2"), str(Path(tmp) / "nope")]}))
        raise AssertionError("저장소가 없는데 build 했다")
    except SystemExit as e:
        assert "nope" in str(e)
    # 그림이 없는 컷(막혀서 빈 컷)은 등록분으로 세지 않는다
    (Path(tmp) / "img2" / "img" / "B_glossy_promo_f_casual3.webp").unlink()
    with contextlib.redirect_stdout(io.StringIO()):
        L.build(b)
    assert [c["cut"] for c in json.load(open(led))["entries"][0]["cuts"]] == [1, 2]
    (Path(tmp) / "img2" / "img" / "B_glossy_promo_f_casual3.webp").touch()
    with contextlib.redirect_stdout(io.StringIO()):
        L.build(b)
    out = json.load(open(led))


# Compact per-card UI captures must become done entries and retire reservations.
with tempfile.TemporaryDirectory() as tmp:
    repo = Path(tmp) / "images"
    rec = repo / "records" / "compact-20261022"
    rec.mkdir(parents=True)
    (repo / "img").mkdir()
    image = "Compact_glossy_promo_f_casual1.webp"
    (repo / "img" / image).write_bytes(b"fixture")
    scene = {**good["characters"][0]["cuts"][0], "outfit": "Linen dress"}
    (rec / "casual1-ui.json").write_text(json.dumps({
        "card": "Compact", "storage": {"scenes": {"casual": scene}}
    }))
    es = L.read_records([str(repo)])
    assert len(es) == 1 and es[0]["card"] == "Compact", es
    assert es[0]["cuts"][0]["garments"] == ["dress"]
    reserved = {**es[0], "status": "reserved", "at": L.now()}
    assert [e["status"] for e in L.live({"entries": es + [reserved]})] == ["done"]

# Fresh check/reserve must use the same registered records as the planner.
with tempfile.TemporaryDirectory() as tmp:
    led = str(Path(tmp) / "ledger.json")
    json.dump({"entries": [done("stale", good["characters"][0]["cuts"], "2026-01-01T00:00:00+00:00")]}, open(led, "w"))
    orig = L.read_records
    try:
        L.read_records = lambda repos: hist
        a = type("A", (), {"ledger": led, "repos": ["fixture"], "fresh": True})
        assert L.snapshot(a)["entries"] == hist
        assert L.check_plan(L.snapshot(a), good, SP) == []
        # Legacy embedded reservations survive refreshing the registered records.
        pending = {**good["characters"][0], "card": "pending", "status": "reserved", "at": L.now()}
        json.dump({"entries": [pending]}, open(led, "w"))
        assert pending in L.snapshot(a)["entries"]
    finally:
        L.read_records = orig

# 다시 채운 컷·사용자가 준 컷 — 막힌 앞 시도의 casualN-ui.json 대신 casualN-refill-ui.json(localStorage 통째 꼴도), import.json 은 계획에서
# (2026-10-24 미라몽·치렁·마자: 막힌 장면이 등록분으로 읽혀 다시 채우기 예약이 안 풀리고, 비교 대상이 늘어 계획기가 멈췄다)
with tempfile.TemporaryDirectory() as tmp:
    repo = Path(tmp) / "img3"; rec = repo / "records" / "e-1"; rec.mkdir(parents=True); (repo / "img").mkdir()
    def state(card, sc):
        return {"last": card, "cards": {card: {"scenes": {"casual": sc}}}}
    sc = lambda cat, ex: {"cat": cat, "ex": ex, "expr": "e", "pose": "p", "orient": "side", "frame": "waist_up", "lens": "natural50", "axes": {}, "outfit": "A linen dress."}
    json.dump({"storage": state("E", sc("swimwear", "classic_bikini"))}, open(rec / "casual1-ui.json", "w"))
    json.dump({"storage": state("E", sc("lingerie", "garter_set"))}, open(rec / "casual2-ui.json", "w"))                      # 막힌 앞 시도
    json.dump({"storage": {"pkm_prompt_v2": json.dumps(state("E", sc("everyday_sensual", "morning_stretch")))}}, open(rec / "casual2-refill-ui.json", "w"))
    json.dump({"plan_match": "계획 3번과 맞는다", "output": {"file": "E_glossy_promo_f_casual3.webp"}}, open(rec / "casual3-import.json", "w"))
    json.dump({"characters": [{"card": "E", "cuts": [cut(3, "hobbies_leisure", "hobby_craft", "e3", "p3", "front", "full_body", "strong", ["vest", "trousers"])]}]}, open(rec / "plan-v2.json", "w"))
    for n in (1, 2, 3):
        (repo / "img" / ("E_glossy_promo_f_casual%d.webp" % n)).touch()
    got = L.read_records([str(repo)])
    assert [(c["cut"], c["cat"], c["ex"]) for c in got[0]["cuts"]] == [(1, "swimwear", "classic_bikini"), (2, "everyday_sensual", "morning_stretch"), (3, "hobbies_leisure", "hobby_craft")], got
    assert got[0]["cuts"][2]["garments"] == ["trousers", "vest"]
    imp = json.load(open(rec / "casual3-import.json")); imp.pop("plan_match"); json.dump(imp, open(rec / "casual3-import.json", "w"))
    assert [c["cut"] for c in L.read_records([str(repo)])[0]["cuts"]] == [1, 2], "계획과 맞춰 보지 않은 그림은 계획대로 셈하지 않는다"

print("PASS 일상컷 장부: 기록 읽기·옷 종류 · 예시 10명·한 바퀴 · 구도 짝·새 값 · 필수 갈래 자리·두 장 · 세 축 · 채우기 문구 · 빈 장소 · 덮는 겉옷 · 배치 안 겹침 · 예약(세션별 파일)·도장·만료 · 등록 뒤 done · 다시 채우기 · 빈 컷은 안 셈")
