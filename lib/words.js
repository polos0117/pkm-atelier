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
