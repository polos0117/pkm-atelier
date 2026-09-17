# (제목 미정)

놀이는 아직 정하지 않았다. 지금은 **바탕만** 있다 — `polos0117/atelier` 에서
주제와 무관한 층만 가져온 것이다.

먼저 [AGENTS.md](AGENTS.md) 를 읽는다. 옮겨 온 내력은
[docs/PORT_NOTES.md](docs/PORT_NOTES.md) 에 있다.

```
index.html   바탕이 서는지 보여 주는 화면. 놀이가 정해지면 지워도 된다
lib/         주제와 무관한 층 (껍데기 · 테마 여덟 · 낱말 표 · 새 판 감지 · 그림 주소)
data/        자료. 머리말 note 에 모양이 적혀 있다
tools/       그림 등록 · 썸네일
tests/       검사
```

그림은 이 저장소에 두지 않는다 — `pkm-atelier-img` 저장소에 올리고 Pages 를 켠다.

```bash
node tests/words.cjs             # 낱말이 코드에 박히지 않았나
node tests/workspace-theme.cjs   # 테마 여덟 · 밀도 · 문장 · 결
python3 -m http.server 8765      # 화면은 fetch 로 자료를 읽으므로 서버가 필요하다
```

## 화풍 키 동기화

화풍 key와 이름은 `lib/prompt-spec.js`의 `ART_STYLES`가 정본이다.
도감·이미지 등록 도구는 여기서 생성한 `data/style.json`을 읽는다.
화풍을 고칠 때 두 목록을 따로 편집하지 않는다.

```bash
node tools/sync-styles.cjs --write
node tools/sync-styles.cjs --check
node tests/styles.cjs
```

기존 `semi_real` 이미지 분류와 원본·썸네일 파일명은
`cinematic_semi_real`로 통합했다. 사용되지 않던 `bright_catalog`는 제거했다.
이름만 통일한 것으로, 기존 이미지를 재생성하거나 화풍을 보정한 것은 아니다.
