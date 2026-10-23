# 팔·다리·손 검사기 모델 사본

`tools/anatomy-check.py`(main 브랜치)가 받는 MediaPipe 모델의 사본이다. Google 공식 자리
(`storage.googleapis.com/mediapipe-models/…/float16/1/`)의 파일을 바꾸지 않고 그대로 옮겼다 —
그 서버가 막힌 작업 환경(403)에서 받으려고 둔다. 도구는 공식 자리를 먼저, 안 되면 여기를 받고, 어느 쪽이든 sha256 을 맞춰 본다.

| 파일 | sha256 | 공식 자리 |
|---|---|---|
| `pose_landmarker_heavy.task` | `64437af838a65d18e5ba7a0d39b465540069bc8aae8308de3e318aad31fcbc7b` | `pose_landmarker/pose_landmarker_heavy/float16/1/` |
| `hand_landmarker.task` | `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1` | `hand_landmarker/hand_landmarker/float16/1/` |

이 브랜치는 코드와 이력을 나누지 않는다(고아 브랜치). Pages 는 main 만 내보내므로 사이트 용량에 들지 않는다.
모델 라이선스: Apache License 2.0 — Google MediaPipe(https://github.com/google-ai-edge/mediapipe).
