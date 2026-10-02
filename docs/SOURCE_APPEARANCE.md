# 원작 외형 자동 데이터

전국도감 1~1025종을 `data/card.json`의 번호로 연결한다. 포켓몬 선택만으로 새 인물 프롬프트의
**PALETTE**(특징 글에서 뽑은 색 낱말, 눈 색은 빼고)와 **WEAR**(부위마다 의상으로 옮기는 문장)를 채운다
(2026-10-02). 부위 → 입는 법 표는 `lib/prompt-spec.js` 의 `WEAR_PARTS`·`MARKING_PARTS` 이고, 표에 없는
몸 부위(눈·코·입·다리·몸통·털·피부…)는 문장이 되지 않고 색만 PALETTE 로 간다. "skin patches" 처럼 몸
낱말이 섞인 글은 몸 낱말을 빼고 싣는다 — 그대로 두면 그녀의 피부에 얼룩을 그린다.
사용자 입력이나 실행 시 AI/API 호출은 없다. 직접 쓴 입는 법이 있으면 자동을 대신하고,
이어가기·개방·일상에서는 첨부한 승인 이미지가 정하므로 자료를 싣지 않는다.

## 데이터와 범위

- `data/source-appearance.json`: 번호별 이름·기본 색/체형 분류·3~6개의 짧은 영문 외형 특징·
  출처 URL·원문 revision·수집일·추출 본문 해시·방법·폼 범위. 한 종의 특징은 24단어 이내다.
- `data/source-appearance-corrections.json`: 자동 추출이 부족하거나 기본 폼 분리가 필요한 종의
  원문 대조 보정. 런타임에 사용자에게 보정을 요구하는 목록이 아니다.
- `tools/fetch-appearance.py`: 공개 MediaWiki API를 50종씩, 최소 5초 간격으로 수집하고
  Biology 설명에서 외형 명사구를 추출한다. 원문은 git 제외 캐시에만 둔다.

기본 종/명시된 기본 폼의 외형 자료다. 리전·메가·모든 성별·모든 폼을 망라한 자료가 아니다.
텍스트를 자동 추출한 것으로 **1,025종 공식 그림을 모두 눈으로 검수한 결과는 아니다.**
서술에 따라 특징 중요도나 표현이 어색할 수 있다. 자동 검사와 표본 원문 대조를 거쳤으며,
발견한 오류는 출처를 확인해 보정 파일에서 고친다. 검사 통과가 시각적 정확성을 보장하지 않는다.

원작의 껍질·무늬·꼬리·날개만 기록한다. 인간의 눈·머리·체형 설정이나 창작 메카 부품의
장착점·추진기·무기를 원작 사실처럼 기록하지 않는다. 생성 AI가 프롬프트의 사전 설계에서
특징을 구체적인 의상·장갑 표면으로 옮긴다.

## 출처와 조건

기본 이름/번호/색/형태는 기존 [PokéAPI](https://github.com/PokeAPI/pokeapi) 카드 자료를 따른다.
세부 외형은 각 항목에 연결된 **Bulbapedia contributors**의 설명을 추출·축약·부분 재서술했다.
이 파생 데이터 두 파일은 [CC BY-NC-SA 2.5](https://creativecommons.org/licenses/by-nc-sa/2.5/)로 제공한다.
[Bulbapedia 저작권 안내](https://bulbapedia.bulbagarden.net/wiki/Bulbapedia:Copyrights)의
출처 표시·비상업·동일조건 공유를 유지한다. 상업 프로젝트에 그대로 사용할 수 있는
자유 이용 데이터로 취급하지 않는다. 이 표기는 앱 전체 코드나 포켓몬 IP의 별도 권리를 허가하지 않는다.
생성기에서도 현재 종의 출처와 라이선스를 연결한다.

## 재수집과 검사

```bash
python -m pip install -r tools/appearance-requirements.txt
python tools/fetch-appearance.py --fetch --build
node tests/source-appearance.cjs
python tests/appearance-extractor.py
NODE_PATH=/path/to/dependencies/node_modules node tests/source-appearance-dom.cjs
```

캐시된 배치는 재사용한다. 의도적으로 갱신할 때만 `.cache/source-appearance/batch-*.json`을
별도 보관 후 다시 수집한다. 누락이나 3개 미만 특징이 있으면 생성기는 오류로 종료하고
배포 데이터를 덮어쓰지 않는다. 원문 revision은 항목마다 기록되므로 변경을 추적할 수 있다.

검사는 1,025종 커버리지·출처·길이·중복, 잘못된 데이터의 실패, 전체 종의 최초/이어가기
프롬프트 4,100개, 실제 Preact 화면의 자동 입력·종 변경·수동 보정·저장·복원·데이터 실패를 확인한다.
