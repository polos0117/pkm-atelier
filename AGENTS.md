# 작업 지침

아직 **놀이가 정해지지 않은 저장소**다. 여기 있는 것은 주제와 무관한 바탕뿐이고,
`atelier` 에서 실제로 돌려 본 것만 가져왔다.

## 먼저 읽을 것

| 문서 | 무엇 |
|---|---|
| 이 문서 | 규칙과 자리 |
| `docs/PORT_NOTES.md` | 어디서 무엇을 가져왔고, 무엇을 일부러 뺐나 |

## 지켜야 할 것 넷

### 1. 화면에 말을 적지 않는다

사람이 읽는 말은 전부 `lib/words.js` 에서 온다. 화면은 `W('kind.unit')` 로 부른다.

앞선 저장소가 이걸 안 해서, 주제를 갈아 끼웠더니 삼국지 판에서 "모함 건업",
"기동전사 드래프트" 가 떴다. 화면 190 자리였다. `node tests/words.cjs` 가 막는다.

`<title>` 만 예외다 — HTML 이 읽히는 순간 필요해서 자바스크립트로 못 넣는다.
대신 낱말 표의 `app.title` 과 같은지 검사가 본다.

**말을 담는 것이 일인 파일**(`lib/words.js` · `lib/prompt-spec.js`)은 한글 검사에서
빠진다. 대신 "정말 표뿐인가" 를 따로 본다 — 내보내는 것에 함수가 있거나
`document.` · `localStorage` · `fetch(` 가 보이면 실패한다. 빼 준 자리에 화면 코드가
숨으면 주제를 갈아 끼울 때 또 190 자리가 되기 때문이다.

### 2. 그림은 이 저장소에 두지 않는다

`pkm-atelier-img` 저장소에 올리고 Pages 를 켠다. 그쪽이 1 GB 를 따로 받는다.
`lib/img.js` 의 `BASE` 한 줄이 그 주소를 가리킨다.

`img/` 는 `.gitignore` 에 있다. 브라우저 검사를 돌릴 때만 쓰는 임시 자리다 —
`tests/browser-harness.cjs` 가 배포 주소를 이 폴더로 돌려준다. 여기 둔 파일은
올라가지 않으므로, 실제로 화면에 띄우려면 그림 저장소에 같은 이름으로 올려야 한다.

그리고 그림이 그림 저장소에 있다고 화면에 뜨지는 않는다.
`python3 tools/register-images.py` 가 `data/img.json` 에 적은 것만 뜬다.

앞선 저장소는 그림을 같이 두었다가 `.git` 이 323 MB 가 되었다. 그중 250 MB 가
그림이고, 이력을 지워도 46 MB 밖에 안 줄어든다 — 옮기려면 이력 재작성이 필요하고
그러면 남의 clone 이 다 깨진다. 처음부터 나눠 두면 그 일이 없다.

### 3. 화면을 갈아치우면 그 화면에 딸린 검사를 같이 옮긴다

안 옮기면 검사가 조용히 죽는다. 앞선 저장소에서 화면 셋을 차례로 옮기는 동안
`*-smoke.cjs` 다섯 개가 그렇게 죽었고 이틀 동안 아무도 몰랐다.
늘 빨간 검사가 있으면 진짜 고장도 같이 묻힌다.

### 4. 화면은 껍데기가 정한 자리에 들어간다

`lib/workspace.css` 는 `.dex-page` · `.prompt-page` 를 `100dvh` 로 잠그고
**한 자리만** 구르게 한다 — 도감은 `.collection-scroll`, 스튜디오는 `.wrap` 이다.
그 자리를 안 쓰고 `main` 에 바로 내용을 넣으면 아래쪽이 통째로 잘린다.
화면은 멀쩡해 보이고 스크롤만 안 되므로 눈으로는 잘 안 잡힌다.

Preact 가 그리는 `#app` 이 사이에 끼면 키도 같이 물려줘야 한다. 안 그러면
`flex:1 1 0` 인 굴림 자리가 높이 0 이 된다 — 굴러가기는 하는데 보이는 것이 없다.
`dex.html` 의 `.dex-page > #app` 규칙이 그 자리다.

## 검사

```bash
node tests/words.cjs             # 낱말이 코드에 박히지 않았나
node tests/workspace-theme.cjs   # 테마 여덟 · 밀도 · 문장 · 결
node tests/forms.cjs             # 폼 축 — 자료·등록기·img.js 가 같은 말을 하나
node tests/prompt-engine.cjs     # 프롬프트가 화면 없이 끝까지 나오나
```

`prompt-engine` 은 브라우저를 안 띄운다. 조립부가 값을 인자로 받게 갈라져 있어서
`node` 로 바로 부를 수 있다 — atelier 에서는 화면을 띄워야 확인이 됐다.

브라우저 검사는 `tests/browser-harness.cjs` 를 쓴다. CDN(esm.sh)이 막힌 곳에서는
`ESM_DIR` 에 preact·htm 이 든 `node_modules` 경로를 준다.

```bash
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dex-forms.cjs
```

`dex-forms` 는 자료를 세 벌로 돌린다 — 등록된 그대로, 폼 둘을 지운 것,
연출컷을 한 장 붙인 것. 채워진 자료만으로는 "빈 폼" 쪽을 볼 수가 없어서다.
갈아 끼우기는 `browser-harness` 의 `init` 으로 `fetch` 를 감싸서 한다.

**검사를 고칠 때는 일부러 어겨 실패하는 것을 먼저 본다.** 통과하는데 아무것도
안 보는 검사가 제일 나쁘다.

## 자료

`data/*.json` 은 머리말 `note` 에 **모양을 적어 둔다.** 앞선 저장소에서 레코드
모양을 몰라 배열로 만들었다가 터진 적이 있다.
