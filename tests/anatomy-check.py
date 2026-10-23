#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""팔·다리·손 검사기(tools/anatomy-check.py)의 판단 — 모델 없이 점 목록만으로 본다.
   Run: python3 tests/anatomy-check.py"""
import copy, importlib.util, os, unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("ac", os.path.join(ROOT, "tools", "anatomy-check.py"))
ac = importlib.util.module_from_spec(spec); spec.loader.exec_module(ac)
SIZE = (1000, 1500)


def body(move=None):
    """정면으로 선 사람 — 그림 왼쪽이 인물의 오른쪽. move={점 번호: (x, y)} 로 옮긴다(0~1)"""
    pts = {i: (0.5, 0.1) for i in range(33)}
    pts.update({12: (0.40, 0.25), 11: (0.60, 0.25), 14: (0.36, 0.40), 13: (0.64, 0.40), 16: (0.34, 0.55), 15: (0.66, 0.55),
                24: (0.44, 0.55), 23: (0.56, 0.55), 26: (0.44, 0.72), 25: (0.56, 0.72), 28: (0.44, 0.90), 27: (0.56, 0.90),
                30: (0.43, 0.92), 29: (0.57, 0.92), 32: (0.42, 0.93), 31: (0.58, 0.93)})
    pts.update(move or {})
    image = [{"x": x, "y": y, "visibility": 0.99} for x, y in (pts[i] for i in range(33))]
    world = [{"x": x, "y": y * 1.5, "z": 0.0} for x, y in (pts[i] for i in range(33))]   # 세로가 1.5 배인 그림을 같은 축척으로
    return {"count": 1, "pass": 1, "image": image, "world": world}


def hand(x, y, label, score=0.95):
    """손목이 (x, y) 에 있는 손 — 손가락은 아래로"""
    pts = [{"x": x, "y": y}] + [{"x": x + (k % 4 - 1.5) * 0.01, "y": y + 0.01 + (k // 4) * 0.008} for k in range(20)]
    return {"label": label, "score": score, "image": pts}


def two_hands():
    return [hand(0.34, 0.555, "Right"), hand(0.66, 0.555, "Left")]


def whats(r):
    return sorted(f["what"] for f in r["flags"])


class Anatomy(unittest.TestCase):
    def test_ok(self):
        r = ac.analyze(SIZE, body(), two_hands())
        self.assertEqual(r["level"], "ok", r["flags"])
        self.assertEqual([e["arm"] for e in r["hands"]], ["R", "L"], "손은 붙은 팔(인물 기준 왼·오른)")

    def test_no_body(self):
        r = ac.analyze(SIZE, None, [])
        self.assertEqual((r["level"], whats(r)), ("note", ["no_body"]))

    def test_loose_hand(self):
        r = ac.analyze(SIZE, body(), [hand(0.34, 0.555, "Right"), hand(0.5, 0.15, "Left")])
        self.assertEqual(whats(r), ["loose_hand"])
        self.assertEqual(r["level"], "check", "팔에 안 붙은 손은 살펴볼 것 — 어깨·얼굴 살결을 손으로 잡기도 한다")

    def test_many_hands(self):
        r = ac.analyze(SIZE, body(), two_hands() + [hand(0.5, 0.15, "Left"), hand(0.2, 0.3, "Right")])
        self.assertEqual(r["level"], "suspect")
        self.assertIn("many_hands", whats(r))

    def test_foot_and_duplicate_ignored(self):
        hs = two_hands() + [hand(0.44, 0.905, "Right"), hand(0.341, 0.556, "Right")]
        r = ac.analyze(SIZE, body(), hs)
        self.assertEqual(r["level"], "ok", r["flags"])
        self.assertEqual([e["arm"] for e in r["hands"]][2:], ["foot", "dup"], "맨발·같은 손을 두 번 잡은 것은 세지 않는다")

    def test_flipped_hand(self):
        r = ac.analyze(SIZE, body(), [hand(0.34, 0.555, "Left"), hand(0.66, 0.555, "Left")])
        self.assertEqual(whats(r), ["flipped_hand"])
        self.assertEqual(r["level"], "check")
        r = ac.analyze(SIZE, body(), [hand(0.34, 0.555, "Left", score=0.6), hand(0.66, 0.555, "Left")])
        self.assertEqual(r["level"], "ok", "점수가 낮은 판정은 믿지 않는다")

    def test_stretched_arm(self):
        r = ac.analyze(SIZE, body({16: (0.30, 0.80)}), [hand(0.30, 0.805, "Right"), hand(0.66, 0.555, "Left")])
        self.assertIn("arm_ratio", whats(r))
        self.assertGreater(r["measure"]["arm_R_ratio"], ac.RATIO["arm"][1])

    def test_folded_knee(self):
        r = ac.analyze(SIZE, body({28: (0.445, 0.56)}), two_hands())
        self.assertIn("leg_fold", whats(r))

    def test_asymmetric_forearm(self):
        r = ac.analyze(SIZE, body({16: (0.335, 0.47), 14: (0.36, 0.40)}), [hand(0.335, 0.475, "Right"), hand(0.66, 0.555, "Left")])
        self.assertIn("arm_sym", whats(r))

    def test_faint_body_skips_lengths(self):
        p = body({16: (0.30, 0.80)}); p["pass"] = 2
        r = ac.analyze(SIZE, p, [hand(0.30, 0.805, "Right"), hand(0.66, 0.555, "Left")])
        self.assertIn("faint_body", whats(r))
        self.assertNotIn("arm_ratio", whats(r), "문턱을 낮춰 찾은 뼈대로는 길이를 안 본다")

    def test_blurry_points_skip_lengths(self):
        p = body({16: (0.30, 0.80)}); p["image"][16]["visibility"] = 0.4
        r = ac.analyze(SIZE, p, [hand(0.30, 0.805, "Right"), hand(0.66, 0.555, "Left")])
        self.assertNotIn("arm_ratio", whats(r))

    def test_two_bodies_note(self):
        p = body(); p["count"] = 2
        r = ac.analyze(SIZE, p, two_hands())
        self.assertEqual((r["level"], whats(r)), ("note", ["bodies"]))

    def test_models_pinned(self):
        for kind, (name, url, sha) in ac.MODELS.items():
            self.assertTrue(url.startswith("https://storage.googleapis.com/mediapipe-models/") and "/1/" in url and url.endswith(name), kind)
            self.assertRegex(sha, r"^[0-9a-f]{64}$")

    def test_unavailable_does_not_stop(self):
        """모델을 못 받으면(네트워크가 403) 끝 코드 3 — 작업은 눈으로 세기로 잇는다(멈추지 않는다)"""
        import io, contextlib, json, tempfile
        d = tempfile.mkdtemp()
        old_env = {k: os.environ.get(k) for k in ("PKM_ANATOMY_MODELS",)}
        old_get = ac.urllib.request.urlretrieve
        def blocked(url, path):
            raise OSError("HTTP Error 403: Forbidden")
        try:
            os.environ["PKM_ANATOMY_MODELS"] = d; ac.urllib.request.urlretrieve = blocked
            out, js = io.StringIO(), os.path.join(d, "r.json")
            with contextlib.redirect_stdout(out):
                code = ac.main(["그림.webp", "--json", js])
            self.assertEqual(code, 3)
            self.assertIn("403", out.getvalue()); self.assertIn("눈으로 센다", out.getvalue())
            self.assertEqual(json.load(open(js))[0]["level"], "unavailable")
            self.assertFalse([f for f in os.listdir(d) if f.endswith(".part")], "받다 만 파일을 남기지 않는다")
        finally:
            ac.urllib.request.urlretrieve = old_get
            for k, v in old_env.items():
                if v is None: os.environ.pop(k, None)
                else: os.environ[k] = v

    def test_mirror_when_official_blocked(self):
        """공식 자리가 403 이면 GitHub 사본을 받는다 — sha256 이 다른 파일은 버리고 다음 자리로"""
        import hashlib, tempfile
        d = tempfile.mkdtemp(); good = b"model-bytes"; sha = hashlib.sha256(good).hexdigest()
        tried = []
        def fake(url, path):
            tried.append(url)
            if "storage.googleapis.com" in url:
                raise OSError("HTTP Error 403: Forbidden")
            open(path, "wb").write(b"tampered" if "raw.githubusercontent.com" in url else good)
        old_models, old_get, old_env = dict(ac.MODELS), ac.urllib.request.urlretrieve, os.environ.get("PKM_ANATOMY_MODELS")
        try:
            ac.MODELS["pose"] = ("x.task", "https://storage.googleapis.com/mediapipe-models/x/1/x.task", sha)
            ac.urllib.request.urlretrieve = fake; os.environ["PKM_ANATOMY_MODELS"] = d
            p = ac.model_path("pose")
            self.assertEqual(open(p, "rb").read(), good)
            self.assertEqual([u.split("/")[2] for u in tried], ["storage.googleapis.com", "raw.githubusercontent.com", "github.com"])
            self.assertTrue(all(u.endswith("/x.task") for u in tried[1:]) and all("anatomy-models" in u for u in tried[1:]))
            self.assertFalse([f for f in os.listdir(d) if f.endswith(".part")])
        finally:
            ac.MODELS.clear(); ac.MODELS.update(old_models); ac.urllib.request.urlretrieve = old_get
            if old_env is None: os.environ.pop("PKM_ANATOMY_MODELS", None)
            else: os.environ["PKM_ANATOMY_MODELS"] = old_env

    def test_input_not_mutated(self):
        p, hs = body(), two_hands(); a, b = copy.deepcopy(p), copy.deepcopy(hs)
        ac.analyze(SIZE, p, hs)
        self.assertEqual((p, hs), (a, b))


if __name__ == "__main__":
    unittest.main(verbosity=1)
