# 작업 지침

놀이의 **뼈대는 정해졌고 규칙은 아직**이다. 무엇이 정해졌고 무엇이 안 정해졌는지는
`docs/GAME_CONCEPT.md` 에 있다. 코드는 `atelier` 에서 실제로 돌려 본 것을 가져왔다.

## 먼저 읽을 것

| 문서 | 무엇 |
|---|---|
| 이 문서 | 규칙과 자리 |
| `docs/PORT_NOTES.md` | 어디서 무엇을 가져왔고, 무엇을 일부러 뺐나 |
| `docs/GAME_CONCEPT.md` | 게임 구조 — 정해진 것과 아직 시험할 것 |
| `docs/PROMPT_REWRITE.md` | 포켓몬 메카 생성 규칙·기준 이미지·세 출력 모드와 검사 |

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

이미지를 만들고 올리고 등록하는 작업은 먼저 [IMAGE_RULES.md](IMAGE_RULES.md) 를 읽는다 —
한 캐릭터 = 기준 시트 1 + 폼 초상 3 + 폼별 개방 3 + 일상컷 1, 파일명, 두 저장소 순서,
중단 복구가 거기 있다.

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
node tests/battle-sim.cjs --quick  # 전투 규칙이 코드에 옮겨졌나 (--quick 없이 돌리면 실험까지)
node tests/run-sim.cjs --quick     # 런 규칙 — 뽑기·상대·체력 이어짐·보상·끝 (--quick 없이 돌리면 완주율 표)
```

`battle-sim` 은 검사이면서 실험실이다. `--quick` 은 규칙 29가지만 본다. 빼고 돌리면
수천 판을 굴려 퇴화 전략·과열 눈덩이·박자 수 민감도를 표로 찍는다 — 그건 실패가
아니라 보고다. 결과는 `docs/GAME_CONCEPT.md` 의 "굴려 본 것" 에 적는다.

`prompt-engine` 은 브라우저를 안 띄운다. 조립부가 값을 인자로 받게 갈라져 있어서
`node` 로 바로 부를 수 있다 — atelier 에서는 화면을 띄워야 확인이 됐다.

브라우저 검사에는 **준비물이 둘** 있다. 없으면 무슨 일인지 모른 채 30초를 기다리다 죽는다.

```bash
# 1) 그림 — 배포 주소를 여기로 돌려 준다 (img/ 는 .gitignore 라 체크아웃에 없다)
mkdir -p img/figure-previews
cp <atelier>/assets/figures/*.png img/figure-previews/    # 체형·머리 미리보기 65장
#    카드 그림은 pkm-atelier-img 에서 img/ 로 내려받는다

# 2) CDN — esm.sh 가 막힌 곳에서만
ESM_DIR=<preact·htm 이 든 node_modules>
```

브라우저 검사는 `tests/browser-harness.cjs` 를 쓴다. CDN(esm.sh)이 막힌 곳에서는
`ESM_DIR` 에 preact·htm 이 든 `node_modules` 경로를 준다.

```bash
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/dex-forms.cjs
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/prompt-screen.cjs
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/battle-screen.cjs   # 전투 시험장 — 세움·한 판·되감기·100판·직접 조종
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/run-screen.cjs      # 일곱 판 — 뽑기·저장·판·보상·끝·새 런
ESM_DIR=<node_modules> CHROMIUM_PATH=<chrome> node tests/header-layout.cjs   # 화면 다섯의 머리가 같은 자리에
```

`run.html` 은 놀 수 있는 게임이다 — 규칙은 `lib/run.js`(런: 공유 팩 드래프트·AI 여섯·
성격·성장 보정·체력 이어짐·보상)와 `lib/battle.js`(한 판, 성격 `NATURE`)에만 있다.
맡긴 판에서 운용은 스스로 열지 않는다(`managedWith({openInLight:false, openHeatMax:-1})`) —
오버라이드는 사람 것이라 판이 멈춰 묻는다. 그 멈춤도 화면이 엔진의 `can().open` 을 보고
멈추는 것이지 규칙을 따로 셈하는 것이 아니다. 난이도 값(`RUN.DIFF`)은
`tests/run-sim.cjs` 로 잰다: 자동 운용으로 완주율이 성장형·완성형 뽑기 모두 반 언저리,
성장형이 조금 위(성장 보정이 뜻한 바). 한쪽이 죽으면 뽑기가 선택이 아니다.
전투 화면 조각(`lib/battle-ui.js`)은 `battle.html` 과 같이 쓴다.

`battle.html` 은 `lib/battle.js` 의 얼굴이다. 규칙은 엔진에만 있고 화면은 굴리고
보여 주기만 한다 — 판을 되감는 것은 엔진이 `snapshots` 로 박자마다 떠 둔 자리를
읽는 것이지 화면이 다시 계산하는 것이 아니다. 직접 조종도 같다: 화면의 단추는
엔진의 `can()` 이 켜고 끄고, 고른 것은 `reserve()` 로 넘기며, `step()` 이 한 박자를
굴린다. "이 폼으로 갈 수 있나" 를 화면이 따로 셈하면 규칙이 두 곳이 된다.

`dex-forms` 는 자료를 세 벌로 돌린다 — 등록된 그대로, 폼 둘을 지운 것,
연출컷을 한 장 붙인 것. 채워진 자료만으로는 "빈 폼" 쪽을 볼 수가 없어서다.
갈아 끼우기는 `browser-harness` 의 `init` 으로 `fetch` 를 감싸서 한다.

**검사를 고칠 때는 일부러 어겨 실패하는 것을 먼저 본다.** 통과하는데 아무것도
안 보는 검사가 제일 나쁘다.

## 자료

`data/*.json` 은 머리말 `note` 에 **모양을 적어 둔다.** 앞선 저장소에서 레코드
모양을 몰라 배열로 만들었다가 터진 적이 있다.

`data/card.json` 과 `data/group.json` 은 **손으로 고치지 않는다.** 만드는 것은
`tools/fetch-cards.py` 다 — 다시 돌리면 손으로 넣은 것은 날아간다.

```bash
python3 tools/fetch-cards.py --check      # 무엇이 달라지는지만
python3 tools/fetch-cards.py              # 받아서 덮어쓴다
```

PokéAPI 가 제 저장소에 올려 둔 CSV 아홉 장을 받는다. REST API 를 한 마리씩
부르지 않는 까닭은 1,025종이면 호출이 1,025번이기 때문이다. CSV 는 합쳐서 0.5 MB 다.

**카드 이름(`name`)은 그림 파일 이름이다.** `<카드>_<폼>_<화풍>_<성별>.webp` 가
여기서 만들어지므로 한 번 정하면 못 바꾼다 — 바꾸면 이미 올린 그림이 미아가 된다.
그래서 이 도구는 한국어 이름이 비거나 이름이 겹치면 파일을 안 쓰고 선다.
