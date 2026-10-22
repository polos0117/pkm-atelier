# rust — 일상컷 생김새(casual-look)

일상컷 그림이 **이미 올라간 다른 캐릭터의 일상컷과 거의 같은 그림인지**를 잰다.
장부(`tools/casual-ledger.py`)는 고른 *말*(갈래·예시·구도)만 보므로, 말이 달라도
그림은 "노을 해변을 걷는 수영복" 처럼 똑같이 나오는 것을 못 막는다. 이 도구가 그 구멍을 맡는다.

쓰는 곳이 둘이다.

1. **계획기에 돌려주기** — `index` 가 `data/casual-look.json` 을 쓰고, `tools/casual-plan.cjs` 가
   그것을 읽어 그림이 몰린 예시·갈래·(방향, 프레이밍) 짝·옷 종류를 덜 고른다.
   등록 워크플로(`.github/workflows/register-images.yml`)가 `data/img.json` 이 바뀔 때마다 다시 짓는다.
2. **올리기 전 문턱** — 만든 세 장을 `check` 로 재어, 다른 캐릭터 일상컷이나 자기 세 장끼리
   거의 같으면 1 로 끝난다. 그 컷은 계획기로 다시 정한다(`--avoid`·`--keep`, IMAGE_RULES 3절 7번).

## 쓰기

```bash
cd rust
cargo build --release -p casual-look
cargo run --release -p casual-look -- index                          # data/casual-look.json 다시 짓기
cargo run --release -p casual-look -- check --card 피카츄 a.webp b.webp c.webp [--json]
cargo run --release -p casual-look -- pairs --top 20                 # 가장 가까운 짝(문턱 다시 맞출 때)
cargo test -p casual-look
```

cargo 가 없는 곳(생성 세션 등)에서는 `check` 를 node 로 돌린다 — 같은 셈을 wasm 으로 묶어 올려 두었다(`tools/casual-look.wasm`).

```bash
node tools/casual-look.cjs check --card 피카츄 a.webp b.webp c.webp [--json]   # 글·끝 번호(0·1·2)가 명령줄과 같다
```

그림 저장소는 이 저장소 옆(`../pkm-atelier-img`, `../pkm-atelier-img-2`)에서 찾고, `thumb/` 이 있으면
그쪽을 읽는다. 저장소 뿌리는 `PKM_ROOT` 로 바꾼다. 의존 상자를 못 받는 곳에서는 `--offline`.

## 재는 것

그림을 256×384 로 줄인 뒤 셋을 섞는다(무게 0.50 / 0.40 / 0.10, 점수 = 거리 × 1000).

| 무엇 | 어떻게 | 무게 |
| --- | --- | --- |
| 윤곽 | 64×96 밝기의 HOG(4×6 칸 × 8 방향) — 몸·소품·배경 선의 자리 | 0.50 |
| 배치 | 16×24 밝기(평균·편차로 맞춤) — 밝고 어두운 덩어리의 자리 | 0.40 |
| 색 | `art-core` 의 색 닮음 | 0.10 |

색 무게가 작은 것은 일부러다 — 같은 구도에 옷 색만 바꾼 그림도 "같은 그림" 으로 잡아야 한다.

## 문턱

실제 1123컷을 눈으로 맞췄다. 150~222 는 같은 장면·같은 구도(노을 해변 걷기, 부엌 타르트, 수영장 비키니),
270 넘게는 다른 그림이었다.

- `DUP_BELOW` 215 — 이 아래면 거의 같다. `check` 가 막는다.
- `CROWD_BELOW` 245 — 이 아래 이웃 수가 그 컷의 "몰림". 계획기가 이걸 평균 내어 덜 고른다.

문턱을 바꾸면 `pairs` 로 위쪽 짝을 다시 눈으로 보고, `src/main.rs` 의 상수와 시험을 같이 고친다.

## art-core

`art-core/` 는 book-atelier 의 `rust/art-core` 를 그대로 옮겨 온 것이다. 고치면 양쪽을 맞춘다.

## wasm — cargo 없이 도는 문턱

셈은 `casual-look/src/lib.rs` 한 곳이고, 명령줄(`src/main.rs` — 파일·스레드·찍기)과 `casual-wasm`(포인터·길이만 쓰는 `extern "C"`)이 같이 쓴다.
`index`·`pairs` 는 명령줄만 — 색인은 등록 워크플로가 짓는다.

`art-core`·`casual-look/src/lib.rs`·`casual-wasm` 을 고쳤으면 wasm 을 다시 지어 올린다. 안 그러면 `node tests/casual-look-wasm.cjs` 가
"wasm 이 소스보다 묵었다" 로 막는다(wasm 안의 소스 셈 — `casual-wasm/build.rs`).

```bash
cd rust
cargo build --profile wasm --target wasm32-unknown-unknown -p casual-wasm   # rustup target add wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/wasm/casual_wasm.wasm ../tools/casual-look.wasm
cargo build --release -p casual-look && node ../tests/casual-look-wasm.cjs  # 명령줄이 지어져 있으면 글이 한 글자도 같은지까지 본다
```
