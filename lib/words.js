/* 낱말 표 — 화면에 뜨는 주제 낱말은 전부 여기 한 곳에서 온다.

   앞선 저장소(atelier)에서 주제를 갈아 끼워 본 기록(TRY_SAMGUK.md)이 남긴 교훈이다.
   규칙 코드는 한 줄도 안 고쳐도 돌았는데, "기체" 69 · "파일럿" 43 · "지휘관" 25 ·
   "모함" 8 … 합쳐 190 자리의 사람이 읽는 말이 화면에 박혀 있어서 다른 주제로
   돌리면 "모함 건업", "기동전사 드래프트" 같은 것이 떴다.

   그래서 이 저장소는 처음부터 말을 코드에 안 적는다. 화면은 W('kind.unit') 로
   부르고, 주제를 바꾸면 이 파일 하나만 갈아 끼운다.

   쓰는 법
     W('kind.unit')                 → '유닛'
     W('kind.unit', {n: 3})         → 자리표시자가 있으면 채워 넣는다
     W('없는.열쇠')                  → 열쇠를 그대로 돌려주고 콘솔에 적는다
                                       (조용히 빈칸이 되는 것보다 낫다)  */
(function (root) {
  'use strict';

  /* 주제를 정하면 이 표만 고친다. 값이 비어 있는 것은 아직 안 정했다는 뜻이다. */
  var WORDS = {
    "prompt.title": "프롬프트 스튜디오",
    "prompt.subtitle": "기준 인물을 만들고, 같은 인물의 폼과 장면을 확장합니다.",
    "prompt.portrait": "폼 초상",
    "prompt.action": "액션",
    "prompt.casual": "일상컷",
    "prompt.source": "원본 포켓몬",
    "prompt.type": "타입",
    "prompt.style": "화풍",
    "prompt.stage": "인물 기준",
    "prompt.create": "새 인물 만들기",
    "prompt.reference": "확정한 이미지 이어가기",
    "prompt.create.note": "성인 여성 캐릭터를 새로 설계합니다. 마음에 드는 결과를 확정한 뒤 기준 이미지로 사용하세요.",
    "prompt.reference.note": "이미지 생성 시 확정한 기준 이미지를 함께 첨부하세요. 얼굴·머리·체형은 그 이미지에서 유지하고, 표정과 움직임은 바꿀 수 있습니다.",
    "prompt.anchor.note": "후속 결과를 계속 새 기준으로 교체하지 말고, 처음 확정한 인물 이미지를 유지하세요. 기준 이미지 한 장이면 시작할 수 있습니다.",
    "prompt.form": "장갑 폼",
    "prompt.base": "폭주 기준 장갑",
    "prompt.base.reference": "첨부 이미지에 입고 있는 장갑",
    "prompt.light.note": "보디슈트 위 한 겹의 주 장갑. 노출량과는 별개입니다.",
    "prompt.heavy.note": "겹침과 두께가 보이는 중첩 장갑. 몸 자체는 커지지 않습니다.",
    "prompt.mobility.note": "얇은 장갑을 바깥으로 펼친 기동형 실루엣.",
    "prompt.overdrive.note": "기준 장갑의 일부 틈과 패널을 열어 내부를 드러냅니다. 부유는 기존 패널에만 선택적으로 적용합니다.",
    "prompt.portrait.note": "폼을 비교하기 쉽도록 전신·2:3 구도와 카메라를 유지합니다.",
    "prompt.action.note": "선택한 폼으로 움직임·시점·배경을 자유롭게 연출합니다. 화풍은 그대로 유지합니다.",
    "prompt.casual.note": "확정한 인물의 새로운 일상 장면. 폼 설정은 적용되지 않습니다.",
    "prompt.motifs": "살릴 원본 특징",
    "prompt.motifs.ph": "예: 노랑·검정 배색, 번개 꼬리 형태",
    "prompt.override": "폼 세부 요청",
    "prompt.override.ph": "예: 왼쪽 어깨 패널만 개방",
    "prompt.appearance": "최초 인물 외형",
    "prompt.appearance.note": "자동 항목은 모델이 결정합니다. 기준 이미지 모드에서는 이 값들을 다시 적용하지 않습니다.",
    "prompt.group.base": "기본",
    "prompt.group.build": "체형",
    "prompt.group.face": "얼굴",
    "prompt.group.hair": "머리",
    "prompt.auto": "자동",
    "prompt.custom": "직접 입력",
    "prompt.lock": "무작위 변경 잠금",
    "prompt.unlock": "잠금 해제",
    "prompt.random": "외형 무작위",
    "prompt.reset": "외형 초기화",
    "prompt.scene.settings": "장면 설정",
    "prompt.expression": "표정",
    "prompt.pose": "자세",
    "prompt.orientation": "방향",
    "prompt.aspect": "화면 비율",
    "prompt.scene": "장소·상황",
    "prompt.outfit": "의상·소품",
    "prompt.camera": "카메라·구도",
    "prompt.extra": "추가 연출 요청",
    "prompt.category": "일상 갈래",
    "prompt.example": "장면 예시",
    "prompt.axes": "세부 강도",
    "prompt.copy": "프롬프트 복사",
    "prompt.copied": "복사했습니다.",
    "prompt.copy.failed": "자동 복사가 안 됩니다. 아래 글을 선택해 복사하세요.",
    "prompt.output": "생성된 프롬프트",
    "prompt.count": "{n}자",
    "prompt.gallery": "등록된 이미지",
    "prompt.gallery.note": "선택한 화풍·폼·모드의 등록 이미지입니다. 기준 이미지로 자동 지정되지는 않습니다.",
    "prompt.storage.failed": "이 브라우저에서는 설정을 저장하지 못했습니다. 현재 화면에서는 계속 사용할 수 있습니다.",
    "prompt.retry": "다시 읽기",
    "prompt.source.count": "{n}종",
    "prompt.local.note": "선택한 설정은 이 브라우저에 자동 저장됩니다.",
    "prompt.output.error": "설정을 확인해 주세요: {message}",
    /* 이 놀이 자체 */
    'app.title': '제목 미정',
    'app.subtitle': '한 줄 설명이 들어갈 자리.',
    'app.code': 'UNTITLED',
    'app.brand': 'ATELIER',   /* 큰 제목 위 작은 글씨. 저장소 이름이 아니라 만든 이의 표다 */

    /* 카드 갈래 — data/card.json 의 kinds 와 같이 고친다 */
    'kind.character': '캐릭터',

    /* 폼 — 장비 목록이 아니라 장갑을 몇 겹 겹쳤나로 가른다 */
    'form.light': '경장',
    'form.heavy': '중장',
    'form.mobility': '고기동',
    'form.overdrive': '폭주',
    'form.all': '전체',
    'form.none': '폼 없음',

    /* 묶음 */
    'group.one': '진영',
    'group.all': '전체',
    'group.none': '소속 없음',

    /* 화면 공통 */
    'ui.search': '이름으로 검색',
    'ui.filter': '필터',
    'ui.reset': '조건 초기화',
    'ui.empty': '해당하는 것이 없다',
    'ui.loading': '읽는 중…',
    'ui.error': '자료를 못 읽었다 — {message}',

    /* 바탕 화면(index.html) — 놀이가 정해지면 통째로 지워도 되는 자리다 */
    'boot.layer': '공통 계층',
    'boot.next': '다음에 할 일',
    'boot.step1': '놀이를 정하고 lib/words.js 의 낱말 표부터 채운다.',
    'boot.step2': 'data/card.json 의 kinds 로 카드 갈래를 정한다.',
    'boot.step3': '그림을 쓸 때 lib/img.js 의 BASE 를 그림 저장소로 맞춘다.',

    /* 겉모습 고르개 — 빛깔 이름이다. 주제에 묶인 말을 쓰지 않는다 */
    'ui.theme': '테마',
    'ui.density': '화면 밀도',
    'ui.density.compact': '촘촘하게',
    'ui.density.relaxed': '여유롭게',
    'theme.midnight': '한밤', 'theme.daylight': '한낮', 'theme.blossom': '꽃빛',
    'theme.moss': '이끼', 'theme.plum': '자두', 'theme.sand': '모래',
    'theme.deep': '심해', 'theme.ember': '잉걸',

    /* 새 판 알림 */
    'fresh.notice': '새 판이 나왔습니다. 하던 것을 마치고 눌러 주세요.',
    'fresh.reload': '갈아타기',
    'fresh.close': '닫기',
    'fresh.stamp': '판',

    /* 카드가 들고 있는 값 — 이름표는 data/label.json 에서 온다.
       여기 있는 것은 그 값에 붙는 제목이다 */
    'card.no': '도감 번호',
    'card.size': '크기',
    'card.stats': '종족값',
    'card.total': '합계',
    'card.egg': '알그룹',
    'card.color': '색',
    'card.shape': '모양',
    'card.gen': '{n}세대',
    'card.evo': '진화',
    'card.evo.from': '이전',
    'card.evo.to': '다음',
    'card.text': '도감 설명',
    'card.height': '{n}m',
    'card.weight': '{n}kg',
    'card.rare.legendary': '전설',
    'card.rare.mythical': '환상',

    /* 화면 사이 오가기 */
    'nav.index': '들머리',
    'nav.dex': '도감',

    /* 도감 */
    'dex.compare': '나란히 보기',
    'dex.compare.note': '없는 폼도 자리를 비워 둔다 — 무엇이 모자란지 보라고.',
    'dex.style': '화풍',
    'dex.action': '연출컷',
    'dex.casual': '일상컷',
    'dex.layers': '겹',
    'ui.back': '목록으로',

    /* 그림 */
    'art.none': '그림 없음',
    'art.missing': '아직 안 만든 것',
    'art.count': '{n}장',
    'art.form.done': '폼 {done} / {all}',
    'art.form.left': '남은 폼 {n}',
  };

  var missing = {};
  function W(key, vars) {
    var s = WORDS[key];
    if (s === undefined) {
      /* 조용히 빈칸으로 두면 화면에서만 티가 나고 원인을 못 찾는다 */
      if (!missing[key]) { missing[key] = 1; console.warn('낱말 표에 없는 열쇠: ' + key); }
      return key;
    }
    if (!vars) return s;
    return s.replace(/\{(\w+)\}/g, function (m, k) {
      return vars[k] === undefined ? m : String(vars[k]);
    });
  }

  /* 표를 통째로 갈아 끼울 때(다른 주제로 시험할 때) 쓴다 */
  function load(table) { for (var k in table) WORDS[k] = table[k]; }

  root.AtelierWords = { W: W, load: load, table: WORDS,
    missing: function () { return Object.keys(missing); } };
  root.W = W;   /* 화면에서 짧게 부르라고 */
})(window);
