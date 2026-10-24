#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""그림의 팔·다리·손 오류를 걸러 보는 검사기 — 세션 안에서, 올리기 전에.

  python3 tools/anatomy-check.py <그림…> [--overlay DIR] [--json FILE] [--strict]

자세 추정(MediaPipe 자세 33점 · 손 21점)으로 그림마다 아래를 본다. 모델은 실사 사진으로 배웠고 늘 팔 둘·다리 둘·
손가락 다섯을 가정하므로, 셋째 팔·여섯째 손가락을 직접 세지는 못한다 — 결과는 "오류"가 아니라 "의심"이고, 걸린 그림은
--overlay 의 뼈대 그림과 원본을 눈으로 본다(IMAGE_RULES 3절 끝 「팔·다리·손 점검」).

  suspect(의심)  서로 떨어진 손이 셋 이상
  check(살펴볼 것) 팔에 붙지 않은 손(셋째 손·떨어진 손 — 어깨·얼굴 살결을 손으로 잡기도 한다) · 한 팔 끝에 손 둘
                 손의 왼·오른 판정이 붙은 팔과 반대(뒤집힌 손 — 손등/손바닥에 따라 모델이 헷갈리기도 한다)
                 아래팔/위팔·정강이/허벅지 길이 비가 사람 범위 밖(늘어나거나 짧아진 팔다리)
                 왼쪽·오른쪽 같은 마디 길이가 크게 다름 · 팔꿈치·무릎이 접힐 수 없을 만큼 접힘
  note           몸이나 손을 못 찾음 — 가린 옷·각도 탓이 흔하다. 눈으로 본다

끝 코드: suspect 가 있으면 1(--strict 면 check 도 1). 없으면 0. 검사기를 못 돌리면 3 — 모델을 못 받았거나(네트워크가 storage.googleapis.com 을
막으면 403) mediapipe·libEGL 이 없다. 그때 작업은 멈추지 않는다: 눈으로 세기만 하고 qa.json 의 anatomy.tool 에 "unavailable: <원인>" 을
적는다(IMAGE_RULES 3절 끝). 모델은 공식 자리 → GitHub 사본(pkm-atelier 의 anatomy-models 브랜치) 차례로 받는다. 다른 사본이 있으면
PKM_ANATOMY_MODEL_URL=<주소 앞> 이 맨 먼저다(sha256 은 어느 쪽이든 맞춰 본다).
모델은 처음 한 번 받아 PKM_ANATOMY_MODELS(기본 <tmp>/pkm-anatomy-models)에 둔다 — 저장소에 올리지 않는다. sha256 을 맞춰 본다.
필요한 것: pip install mediapipe (리눅스는 apt-get install libegl1 libgles2 도). 그래픽 라이브러리(libEGL·libGLESv2·libGL)를 깔 수 없는
환경이면 NO_GL 줄대로 — mediapipe 0.10.14 는 그 라이브러리를 휠 안에 갖고 있고, OpenCV 는 headless 판이 libGL 을 안 찾는다(파이썬 3.9~3.12.
2026-10-24 시스템 GL 라이브러리를 다 치운 자리에서 등록된 그림 61장이 1.1.1 과 같은 결과). analyze() 는 모델 없이 점 목록만으로 돈다
(tests/anatomy-check.py)."""
import hashlib, json, math, os, sys, tempfile, urllib.request

MODELS = {
    "pose": ("pose_landmarker_heavy.task",
             "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_heavy/float16/1/pose_landmarker_heavy.task",
             "64437af838a65d18e5ba7a0d39b465540069bc8aae8308de3e318aad31fcbc7b"),
    "hand": ("hand_landmarker.task",
             "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
             "fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1"),
}
# 공식 자리가 막힌 환경(403)용 사본 — pkm-atelier 의 고아 브랜치 anatomy-models(Pages 밖). 공식 → 사본 차례로, 어느 쪽이든 sha256 을 맞춘다
MIRRORS = ["https://raw.githubusercontent.com/polos0117/pkm-atelier/anatomy-models/",
           "https://github.com/polos0117/pkm-atelier/raw/anatomy-models/"]
# 자세 점 번호(MediaPipe) — 왼·오른은 그림 속 인물 기준
SH, EL, WR, HIP, KN, AN = {"L": 11, "R": 12}, {"L": 13, "R": 14}, {"L": 15, "R": 16}, {"L": 23, "R": 24}, {"L": 25, "R": 26}, {"L": 27, "R": 28}
SIDE = {"L": "왼", "R": "오른"}
# 문턱 — 등록된 그림 365장(img-3 전부 + img-2 230장)으로 맞춘 값: suspect 0 · check 11% · 늘어난 팔(야나프 일상 2 교체 전, 1.95)은 걸린다
VIS = 0.7            # 이보다 흐린 점은 길이·각도에 안 쓴다
VIS_PAIR = 0.85      # 왼·오른 견주기는 더 또렷한 점만
ATTACH = 0.6         # 손목과 자세 손목 사이가 어깨너비의 이만큼 안이면 그 팔의 손
TWIN = 0.35          # 한 팔 끝 두 손이 이만큼 떨어져 있으면 둘이다(겹친 같은 손이 아니다)
SAME = 0.15          # 두 손의 손목이 이만큼 가까우면 같은 손을 두 번 잡은 것
FEET = (27, 28, 29, 30, 31, 32)   # 발목·발뒤꿈치·발끝 — 맨발을 손으로 잡는 일이 잦다(등록된 그림에서 "떨어진 손" 의 절반)
HAND_SCORE = 0.8     # 왼·오른 판정을 믿는 손 점수
RATIO = {"arm": (0.3, 1.6), "leg": (0.6, 2.4)}    # 아래/위 길이 비 — 등록된 그림 236장의 1~99% 바깥(애니 그림은 정강이가 길다)
SYM = (0.6, 1 / 0.6)                               # 왼/오른 같은 마디 길이 비
FOLD = 15.0          # 팔꿈치·무릎 각도(도)가 이보다 작으면 접힐 수 없다


NO_GL = 'pip install "mediapipe==0.10.14" opencv-contrib-python-headless && pip uninstall -y opencv-contrib-python opencv-python'


class Unavailable(Exception):
    """검사기를 못 돌린다 — 모델·mediapipe·그래픽 라이브러리가 없다. 끝 코드 3"""


def model_dir():
    return os.environ.get("PKM_ANATOMY_MODELS") or os.path.join(tempfile.gettempdir(), "pkm-anatomy-models")


def model_path(kind):
    name, url, sha = MODELS[kind]
    d = model_dir(); os.makedirs(d, exist_ok=True)
    p = os.path.join(d, name)
    base = os.environ.get("PKM_ANATOMY_MODEL_URL")
    urls = ([base.rstrip("/") + "/" + name] if base else []) + [url] + [m + name for m in MIRRORS]
    if not os.path.exists(p):
        tmp, why = p + ".part", []
        for u in urls:
            try:
                urllib.request.urlretrieve(u, tmp)
                if hashlib.sha256(open(tmp, "rb").read()).hexdigest() == sha:
                    os.replace(tmp, p); break
                why.append("%s: sha256 이 다르다" % u)
            except Exception as e:   # 403(네트워크 정책)·끊김·없는 주소
                why.append("%s: %s" % (u, e))
            if os.path.exists(tmp):
                os.remove(tmp)
        else:
            raise Unavailable("모델 %s 을 못 받았다 — %s" % (name, " · ".join(why)))
    got = hashlib.sha256(open(p, "rb").read()).hexdigest()
    if got != sha:
        raise SystemExit("모델 %s 의 sha256 이 다르다(%s) — 지우고 다시 받는다: %s" % (name, got[:12], p))
    return p


def dist(a, b):
    return math.sqrt(sum((a[k] - b[k]) ** 2 for k in a if k in b and k in ("x", "y", "z")))


def angle(a, b, c):
    """b 에서 a·c 로 가는 두 선의 각도(도)"""
    v = [a[k] - b[k] for k in ("x", "y", "z")]; w = [c[k] - b[k] for k in ("x", "y", "z")]
    nv = math.sqrt(sum(x * x for x in v)); nw = math.sqrt(sum(x * x for x in w))
    if not nv or not nw:
        return 180.0
    return math.degrees(math.acos(max(-1.0, min(1.0, sum(x * y for x, y in zip(v, w)) / (nv * nw)))))


def analyze(size, pose, hands):
    """size=(w,h). pose=None 또는 {"image":[33점 {x,y,visibility}(0~1)], "world":[33점 {x,y,z}(미터)], "count":찾은 몸 수}.
    hands=[{"label":"Left"|"Right"(MediaPipe 판정 — 거울 입력을 가정한다), "score":0~1, "image":[21점 {x,y}]}].
    → {"level":"ok"|"note"|"check"|"suspect", "flags":[{"level","what","msg"}], "hands":[...], "measure":{...}}"""
    w, h = size
    flags, out_hands, measure = [], [], {}
    px = lambda p: {"x": p["x"] * w, "y": p["y"] * h}
    flag = lambda level, what, msg: flags.append({"level": level, "what": what, "msg": msg})
    if not pose:
        flag("note", "no_body", "몸을 못 찾았다 — 눈으로 본다")
    else:
        I, Wd = pose["image"], pose.get("world") or pose["image"]
        vis = lambda i: I[i].get("visibility", 1.0)
        if pose.get("count", 1) > 1 and pose.get("pass", 1) == 1:
            flag("note", "bodies", "몸이 %d 개로 잡혔다 — 거울·그림자·겹친 팔다리. 두 번째 인물이 있나 본다" % pose["count"])
        sw = dist(px(I[SH["L"]]), px(I[SH["R"]])) or dist(px(I[HIP["L"]]), px(I[HIP["R"]])) or 0.15 * w
        measure["shoulder_px"] = round(sw, 1)
        # 길이 비·접힘 — 첫 번에 찾은 몸(문턱을 낮춰 찾은 뼈대는 갑옷·망토에서 엉뚱하게 늘어졌다)의, 세 점이 다 또렷한 팔다리만
        firm = pose.get("pass", 1) == 1
        if not firm:
            flag("note", "faint_body", "몸을 문턱을 낮춰 찾았다 — 뼈대가 흐려 팔다리 길이·각도는 안 본다")
        for limb, (a, b, c) in ({"arm": (SH, EL, WR), "leg": (HIP, KN, AN)} if firm else {}).items():
            seg = {}
            for s in ("L", "R"):
                if min(vis(a[s]), vis(b[s]), vis(c[s])) < VIS:
                    continue
                up, low = dist(Wd[a[s]], Wd[b[s]]), dist(Wd[b[s]], Wd[c[s]])
                seg[s] = (up, low, min(vis(a[s]), vis(b[s]), vis(c[s])))
                if up > 0:
                    r = low / up; measure["%s_%s_ratio" % (limb, s)] = round(r, 2)
                    lo, hi = RATIO[limb]
                    if r < lo or r > hi:
                        flag("check", limb + "_ratio", "%s%s %s 길이 비 %.2f — 사람 범위 %.2f~%.2f 밖(늘어나거나 짧아진 %s)" % (
                            SIDE[s], "팔" if limb == "arm" else "다리", "아래팔/위팔" if limb == "arm" else "정강이/허벅지", r, lo, hi, "팔" if limb == "arm" else "다리"))
                ang = angle(Wd[a[s]], Wd[b[s]], Wd[c[s]]); measure["%s_%s_angle" % (limb, s)] = round(ang)
                if ang < FOLD:
                    flag("check", limb + "_fold", "%s%s %s 가 %d° 로 접혔다 — 접힐 수 없는 각도" % (SIDE[s], "팔" if limb == "arm" else "다리", "팔꿈치" if limb == "arm" else "무릎", ang))
            if "L" in seg and "R" in seg and min(seg["L"][2], seg["R"][2]) >= VIS_PAIR:
                for k, name in ((0, "위" if limb == "arm" else "허벅지"), (1, "아래" if limb == "arm" else "정강이")):
                    if seg["R"][k] > 0:
                        r = seg["L"][k] / seg["R"][k]
                        if r < SYM[0] or r > SYM[1]:
                            flag("check", limb + "_sym", "왼·오른 %s%s 길이가 %.2f 배 — 한쪽만 늘어났나" % (name, "팔" if limb == "arm" else "", r))
        # 손 — 어느 팔 끝에 붙었나, 왼·오른 판정이 그 팔과 맞나. 뼈대가 흐리면(두 번째로 찾은 몸·흐린 손목) 떨어진 손은 살펴볼 것까지만
        wrists = {s: px(I[WR[s]]) for s in ("L", "R")}
        feet = [px(I[k]) for k in FEET]
        sure = firm and min(vis(WR["L"]), vis(WR["R"])) >= VIS   # 손목이 또렷해야 "어깨너비의 몇 배" 가 믿을 만하다
        taken = {"L": [], "R": []}
        seen = []
        for i, hd in enumerate(hands):
            wpt = px(hd["image"][0])
            near = min(("L", "R"), key=lambda s: dist(wpt, wrists[s]))
            d = dist(wpt, wrists[near]) / sw
            side = {"Left": "L", "Right": "R"}.get(hd["label"])   # 손 판정은 그림 속 인물의 왼·오른(등록된 그림 104손에서 거울로 읽으면 90% 가 어긋났다)
            e = {"i": i, "label_side": side, "score": round(hd.get("score", 0), 2), "arm": near if d <= ATTACH else None, "gap": round(d, 2)}
            out_hands.append(e)
            if any(dist(wpt, s) / sw <= SAME for s in seen):
                e["arm"] = "dup"; continue   # 같은 손을 두 번 잡았다
            if d > ATTACH and min(dist(wpt, f) for f in feet) / sw <= ATTACH:
                e["arm"] = "foot"; continue  # 맨발을 손으로 잡았다
            seen.append(wpt)
            if d > ATTACH:
                flag("check", "loose_hand", "손 하나가 어느 팔 끝에도 안 붙었다(가까운 %s손목에서 어깨너비의 %.1f 배) — 셋째 손·떨어진 손%s" % (
                    SIDE[near], d, "" if sure else " · 뼈대가 흐려 더 확실치 않다"))
                continue
            taken[near].append(e)
            if side and side != near and hd.get("score", 0) >= HAND_SCORE:
                flag("check", "flipped_hand", "%s팔 끝의 손이 %s손으로 보인다 — 엄지가 반대쪽인 뒤집힌 손(손등이 보이면 모델이 헷갈리기도 한다)" % (SIDE[near], SIDE[side]))
        if len(seen) > 2:
            flag("suspect", "many_hands", "손이 %d 개 잡혔다 — 사람 손은 둘" % len(seen))
        for s in ("L", "R"):
            if len(taken[s]) >= 2:
                a, b = taken[s][0], taken[s][1]
                if dist(px(hands[a["i"]]["image"][0]), px(hands[b["i"]]["image"][0])) / sw > TWIN:
                    flag("check", "twin_hands", "%s팔 끝에 손이 둘 — 한쪽 팔에 손이 겹쳐 났다" % SIDE[s])
    order = ["ok", "note", "check", "suspect"]
    level = max([f["level"] for f in flags] or ["ok"], key=order.index)
    return {"level": level, "flags": flags, "hands": out_hands, "measure": measure}


class quiet:
    """모델(C++)이 표준 오류에 쏟는 경고 줄을 잠시 막는다 — 우리 글은 표준 출력으로 나간다"""
    def __enter__(self):
        sys.stderr.flush(); self.saved = os.dup(2); null = os.open(os.devnull, os.O_WRONLY); os.dup2(null, 2); os.close(null)
    def __exit__(self, *a):
        sys.stderr.flush(); os.dup2(self.saved, 2); os.close(self.saved)


def detect(paths):
    """그림마다 (크기, 자세, 손) — MediaPipe 로. 몸은 셋까지 찾아 둘 이상이면 알린다.
    못 찾으면 정사각으로 덧대고 문턱을 낮춰 한 번 더 — 2:3 세로 그림은 몸을 못 찾는 일이 잦았다(등록된 그림 365장 중 35%, 덧대면 넷에 셋을 찾는다)"""
    import numpy as np
    from PIL import Image
    os.environ.setdefault("GLOG_minloglevel", "2"); os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "3")   # 모델의 내부 경고 줄을 숨긴다
    try:
        import mediapipe as mp
    except ImportError as e:
        if "lib" in str(e) and ".so" in str(e):   # libGL.so.1(OpenCV) · libGLESv2.so.2 · libEGL.so.1 — 그래픽 라이브러리가 없다
            raise Unavailable("mediapipe 를 못 읽었다(%s) — apt-get install libegl1 libgles2 libgl1 이 안 되면: %s" % (e, NO_GL))
        raise Unavailable("mediapipe 가 없다(%s) — pip install mediapipe (리눅스는 apt-get install libegl1 libgles2 도. 못 깔면: %s)" % (e, NO_GL))
    V, B = mp.tasks.vision, mp.tasks.BaseOptions
    mk = lambda c: (V.PoseLandmarker.create_from_options(V.PoseLandmarkerOptions(base_options=B(model_asset_path=model_path("pose")), num_poses=3,
                                                                                min_pose_detection_confidence=c, min_pose_presence_confidence=c)),
                    V.HandLandmarker.create_from_options(V.HandLandmarkerOptions(base_options=B(model_asset_path=model_path("hand")), num_hands=4,
                                                                                min_hand_detection_confidence=c, min_hand_presence_confidence=c)))
    model_path("pose"); model_path("hand")   # 받기 실패는 Unavailable 로 — 모델을 띄우기 전에
    try:
        with quiet():
            first, second = mk(0.3), mk(0.1)
    except OSError as e:   # libEGL.so.1 같은 그래픽 라이브러리가 없다
        raise Unavailable("모델을 못 띄웠다(%s) — 리눅스는 apt-get install libegl1 libgles2, 못 깔면: %s" % (e, NO_GL))
    as_mp = lambda im: mp.Image(image_format=mp.ImageFormat.SRGB, data=np.asarray(im))
    try:
        for p in paths:
            im = Image.open(p).convert("RGB"); size = im.size; w, h = size
            side = max(w, h); ox, oy = (side - w) // 2, (side - h) // 2
            sq = Image.new("RGB", (side, side), (127, 127, 127)); sq.paste(im, (ox, oy))
            same = (lambda x: x, lambda y: y)
            back = (lambda x: (x * side - ox) / w, lambda y: (y * side - oy) / h)   # 덧댄 정사각의 좌표 → 원래 그림의 좌표

            def run(k, found):
                r = first[k].detect(as_mp(im))
                if found(r):
                    return r, same
                return second[k].detect(as_mp(sq)), back
            with quiet():
                pr, px = run(0, lambda r: r.pose_landmarks)
                hr, hx = run(1, lambda r: r.hand_landmarks)
            P = None
            if pr.pose_landmarks:
                P = {"count": len(pr.pose_landmarks), "pass": 1 if px is same else 2,
                     "image": [{"x": px[0](l.x), "y": px[1](l.y), "visibility": l.visibility} for l in pr.pose_landmarks[0]],
                     "world": [{"x": l.x, "y": l.y, "z": l.z} for l in pr.pose_world_landmarks[0]]}
            H = [{"label": hr.handedness[i][0].category_name, "score": hr.handedness[i][0].score,
                  "image": [{"x": hx[0](l.x), "y": hx[1](l.y)} for l in hr.hand_landmarks[i]]} for i in range(len(hr.hand_landmarks))]
            yield p, im, size, P, H
    finally:
        with quiet():
            for x in first + second:
                x.close()


BONES = [(11, 12), (11, 13), (13, 15), (12, 14), (14, 16), (11, 23), (12, 24), (23, 24), (23, 25), (25, 27), (24, 26), (26, 28)]
HAND_BONES = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 7), (7, 8), (5, 9), (9, 10), (10, 11), (11, 12), (9, 13), (13, 14), (14, 15), (15, 16), (13, 17), (0, 17), (17, 18), (18, 19), (19, 20)]


def overlay(im, size, pose, hands, result, out):
    """뼈대 그림 — 왼쪽 몸은 하늘색, 오른쪽은 주황, 흐린 점은 점선 대신 옅게. 손은 붙은 팔 색, 안 붙은 손은 빨강"""
    from PIL import ImageDraw
    w, h = size; im = im.copy(); d = ImageDraw.Draw(im, "RGBA")
    col = {"L": (80, 190, 255), "R": (255, 150, 40), "C": (230, 230, 230)}
    side = lambda i: "L" if i in (11, 13, 15, 23, 25, 27) else "R"
    if pose:
        I = pose["image"]
        for a, b in BONES:
            v = min(I[a]["visibility"], I[b]["visibility"]); s = side(a) if side(a) == side(b) else "C"
            d.line([(I[a]["x"] * w, I[a]["y"] * h), (I[b]["x"] * w, I[b]["y"] * h)], fill=col[s] + (230 if v >= VIS else 90,), width=6)
        for i in (11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28):
            x, y = I[i]["x"] * w, I[i]["y"] * h
            d.ellipse([x - 7, y - 7, x + 7, y + 7], fill=col[side(i)] + (240 if I[i]["visibility"] >= VIS else 100,))
    for e, hd in zip(result["hands"], hands):
        c = col.get(e["arm"], (170, 170, 170)) if e["arm"] else (255, 40, 40)
        P = hd["image"]
        for a, b in HAND_BONES:
            d.line([(P[a]["x"] * w, P[a]["y"] * h), (P[b]["x"] * w, P[b]["y"] * h)], fill=c + (230,), width=3)
        x, y = P[4]["x"] * w, P[4]["y"] * h   # 엄지 끝
        d.ellipse([x - 6, y - 6, x + 6, y + 6], outline=(255, 255, 255, 255), width=3)
    tag = {"ok": (60, 170, 90), "note": (120, 120, 120), "check": (230, 170, 30), "suspect": (220, 50, 50)}[result["level"]]
    d.rectangle([0, 0, w, 44], fill=tag + (220,))
    d.text((12, 14), result["level"].upper() + "  " + " / ".join(f["what"] for f in result["flags"]), fill=(255, 255, 255, 255))
    im.save(out, quality=88)


def main(argv):
    args, ov, js, strict = [], None, None, False
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--overlay": ov = argv[i + 1]; i += 2; continue
        if a == "--json": js = argv[i + 1]; i += 2; continue
        if a == "--strict": strict = True; i += 1; continue
        args.append(a); i += 1
    if not args:
        print(__doc__); return 2
    if ov:
        os.makedirs(ov, exist_ok=True)
    report, worst = [], "ok"
    order = ["ok", "note", "check", "suspect"]
    try:
        for p, im, size, P, H in detect(args):
            r = analyze(size, P, H)
            r["file"] = p
            report.append(r)
            worst = max(worst, r["level"], key=order.index)
            mark = {"ok": "·", "note": "?", "check": "!", "suspect": "✗"}[r["level"]]
            print("%s %s — %s · 손 %d" % (mark, os.path.basename(p), r["level"], len(H)))
            for f in r["flags"]:
                print("     %s %s" % (f["level"], f["msg"]))
            if ov:
                o = os.path.join(ov, os.path.splitext(os.path.basename(p))[0] + "-anatomy.jpg")
                overlay(im, size, P, H, r, o)
                print("     뼈대 그림 " + o)
    except Unavailable as e:
        print("검사기를 못 돌렸다 — %s" % e)
        print("멈추지 않는다: 그림마다 눈으로 센다(팔 둘·다리 둘·손가락 다섯·엄지 쪽·꺾이는 쪽 — IMAGE_RULES 3절 끝)")
        print('qa.json 의 anatomy.tool 에 "unavailable: <원인>" 을 적는다. 검사기를 돌렸다고 적지 않는다')
        if js:
            json.dump([{"file": p, "level": "unavailable", "why": str(e)} for p in args], open(js, "w"), ensure_ascii=False, indent=1)
        return 3
    if js:
        json.dump(report, open(js, "w"), ensure_ascii=False, indent=1)
    n = {k: sum(1 for r in report if r["level"] == k) for k in order}
    print("\n%d장 — 의심 %d · 살펴볼 것 %d · 못 찾음 %d · 통과 %d" % (len(report), n["suspect"], n["check"], n["note"], n["ok"]))
    if n["suspect"] or (strict and n["check"]):
        print("✗ 걸린 그림은 뼈대 그림(--overlay)과 원본을 나란히 보고 팔·다리·손을 센다 — 오류면 다시 만든다")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
