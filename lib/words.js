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
    "workspace.signature": "CREATURE DESIGN LAB",
    "dex.title": "포켓몬 메카 도감",
    "home.title": "익숙한 포켓몬, 새로운 가능성.",
    "home.intro": "원본의 개성에서 시작해 나만의 메카 캐릭터를 만드세요. 도감에 모인 모습들을 비교하고, 같은 인물의 다음 폼과 장면을 이어갈 수 있습니다.",
    "home.tag": "발견하고 · 만들고 · 기록하기",
    "home.dex.code": "01 / COLLECTION",
    "home.prompt.code": "02 / CREATION",
    "home.dex.title": "도감 둘러보기",
    "home.dex.note": "포켓몬의 정보와 완성된 폼, 액션과 일상 이미지를 한곳에서.",
    "home.prompt.title": "프롬프트 만들기",
    "home.prompt.note": "기준 인물부터 경장·중장·고기동·폭주, 그리고 새로운 일상까지.",
    "home.themes": "오늘의 연구소 분위기",
    "home.themes.note": "고른 테마는 도감과 생성기에도 함께 적용됩니다.",
    "theme.note.midnight": "별빛 아래의 탐사 기록",
    "theme.note.daylight": "몬스터볼 레드와 민트",
    "theme.note.blossom": "연분홍 꽃잎과 페어리 빛",
    "theme.note.moss": "짙은 녹음과 연두 새싹",
    "theme.note.plum": "보랏빛 안개 속 작은 유령",
    "theme.note.sand": "햇살 노랑과 전기 스파크",
    "theme.note.deep": "푸른 물결과 청록빛 산호",
    "theme.note.ember": "뜨거운 불꽃과 주황 잔광",
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
    "prompt.create.note": "이미지 첨부 없이 성인 여성 캐릭터를 새로 만듭니다. 포켓몬 원작 이미지도 필수가 아닙니다. 마음에 드는 결과를 확정한 뒤 후속 생성의 기준으로 사용하세요.",
    "prompt.reference.note": "이미지 생성 시 확정한 기준 이미지를 함께 첨부하세요. 얼굴·머리·체형은 그 이미지에서 유지하고, 표정과 움직임은 바꿀 수 있습니다.",
    "prompt.anchor.note": "후속 결과를 계속 새 기준으로 교체하지 말고, 처음 확정한 인물 이미지를 유지하세요. 기준 이미지 한 장이면 시작할 수 있습니다.",
    "prompt.form": "장갑 폼",
    "prompt.base": "폭주 기준 장갑",
    "prompt.base.reference": "첨부 이미지에 입고 있는 장갑",
    "prompt.light.note": "보디슈트 위 한 겹의 주 장갑. 노출량과는 별개입니다.",
    "prompt.heavy.note": "겹침과 두께가 보이는 중첩 장갑. 몸 자체는 커지지 않습니다.",
    "prompt.mobility.note": "얇은 장갑을 바깥으로 펼친 기동형 실루엣.",
    "prompt.overdrive.note": "기준 장갑의 일부 틈과 패널을 열어 내부를 드러냅니다. 부유는 기존 패널에만 선택적으로 적용합니다.",
    "prompt.portrait.create.note": "기준 시트 한 장을 만듭니다. 정면·후면 전신과 얼굴·특징 장갑·등 장비·발의 확대컷을 가로폭을 넓힌 3:4 화면에 함께 배치합니다.",
    "prompt.portrait.note": "확정한 기준 인물의 전신 한 컷을 만듭니다. 기준 시트는 정면 모습을 바탕으로 하며, 폼끼리 비교할 수 있게 2:3 구도와 카메라를 유지합니다.",
    "prompt.action.note": "선택한 폼으로 움직임·시점·배경을 자유롭게 연출합니다. 화풍은 그대로 유지합니다.",
    "prompt.casual.note": "확정한 인물의 새로운 일상 장면. 폼 설정은 적용되지 않습니다.",
    "prompt.motifs": "살릴 원본 특징",
    "prompt.motifs.ph": "예: 노랑·검정 배색, 번개 꼬리 형태",
    "prompt.override": "폼 세부 요청",
    "prompt.override.ph": "예: 왼쪽 어깨 패널만 개방",
    "prompt.appearance": "최초 인물 외형",
    "prompt.figure.pick": "{label} · 이미지로 선택",
    "prompt.color.pick": "{label} 팔레트",
    "prompt.eye.same": "양쪽 같은 색",
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
    'app.title': '포켓몬 메카 연구소',
    'app.subtitle': '포켓몬의 개성을 기록하고, 새로운 메카 폼을 발견합니다.',
    'app.code': 'PKM / 001',
    'app.brand': 'POKÉMON × MECHA',   /* 큰 제목 위 작은 글씨. 저장소 이름이 아니라 만든 이의 표다 */

    /* 카드 갈래 — data/card.json 의 kinds 와 같이 고친다 */
    'kind.character': '캐릭터',

    /* 폼 — 장비 목록이 아니라 장갑을 몇 겹 겹쳤나로 가른다 */
    'form.light': '경장',
    'form.heavy': '중장',
    'form.mobility': '고기동',
    'form.overdrive': '폭주',
    'form.overdriveOf': '{form}-폭주',
    'form.all': '전체',
    'form.none': '폼 없음',

    /* 묶음 */
    'group.one': '타입',
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

    /* 포켓몬 연구소 테마. 저장된 선택값을 위해 열쇠는 유지한다. */
    'ui.theme': '테마',
    'ui.density': '화면 밀도',
    'ui.density.compact': '촘촘하게',
    'ui.density.relaxed': '여유롭게',
    'theme.midnight': '야간 도감', 'theme.daylight': '포켓몬 연구소', 'theme.blossom': '페어리 가든',
    'theme.moss': '상록숲', 'theme.plum': '고스트 타워', 'theme.sand': '피카츄 옐로',
    'theme.deep': '블루오션', 'theme.ember': '불꽃 체육관',

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
    'nav.index': '연구소',
    'nav.dex': '도감',
    'nav.battle': '전투',
    'nav.run': '런',
    'run.title': '일곱 판',
    'home.run.code': '04 / RUN',
    'home.run.title': '일곱 판 달리기',
    'home.run.note': 'AI 여섯과 한 팩에서 드래프트하고, 그 여섯과 보스를 차례로 만난다. 덜 자란 카드를 키우면 더 세진다.',
    'run.new': '새 런',
    'run.seed': '씨앗 {n}',
    'run.stage': '{n} / {total} 판',
    'run.draft.title': '드래프트 {n} / {total} 바퀴',
    'run.draft.note': '일곱 자리가 한 팩에서 뱀 순서로 집는다. 내 차례에 남은 것 가운데 하나. 덜 자란 카드는 지금은 약하지만 런 안에서 진화할 때마다 예산에 보정이 붙어, 다 키우면 처음부터 완성형으로 집은 것보다 세다.',
    'run.draft.turn': '내 차례 — {left}장 남음',
    'run.draft.taken': '{seat} 가 집음',
    'run.seat.me': '나',
    'run.seat.ai': 'AI {n}',
    'run.reroll': '보급 요청 · {n} / {max}',
    'run.reroll.last': '마지막 바퀴 · 보급 불가',
    'run.rivals': '같은 팩에서 뽑은 여섯 — 약한 순서로 만난다',
    'run.rival.line': '{seat}: {names}',
    'run.foes.seat': '{seat} · {n}번 자람',
    'run.foes.boss': '보스',
    'run.grown': '런에서 {n}번 진화 · 예산 +{bonus}',
    'run.growth.2': '두 번 더 큰다',
    'run.growth.1': '한 번 더 큰다',
    'run.growth.0': '다 컸다',
    'run.pick': '이 카드로',
    'run.roster': '로스터',
    'run.foes': '상대',
    'run.foes.note': '{policy}',
    'run.fight.auto': '맡기고 끝까지',
    'run.fight.manual': '직접 조종',
    'run.fight.go': '싸운다',
    'run.fight.won': '이겼다 · {beats}박자',
    'run.fight.lost': '졌다 · {beats}박자',
    'run.down': '쓰러짐',
    'run.reward.title': '보상 — 하나만',
    'run.reward.evolve': '진화',
    'run.reward.evolve.note': '{list} — 예산이 한 단계 오르고 체력이 찬다',
    'run.reward.heal': '회복',
    'run.reward.heal.note': '전부 절반 회복. 쓰러진 것은 절반으로 되살아난다',
    'run.reward.step': '{from} → {to}',
    'run.won.title': '일곱 판을 다 이겼다',
    'run.lost.title': '{n}판에서 졌다',
    'run.end.note': '판마다 상대 · 박자 수',
    'run.end.line': '{stage}판 {result} — {foes} · {beats}박자',
    'run.win': '승',
    'run.lose': '패',
    'run.again': '다시 — 새 씨앗으로',
    'run.hp': '체력 {n}%',
    'run.help': '나와 AI 여섯이 한 팩에서 세 장씩 뽑는다. 그 여섯을 약한 순서로 차례로 만나고, 그들도 판마다 자라 있다. 일곱째는 보스. 체력은 다음 판으로 이어지고, 판 사이에 진화(전부 한 단계, 체력이 찬다) 아니면 회복(절반) 을 고른다.',
    'battle.title': '전투 시험장',
    'home.battle.code': '03 / BATTLE',
    'home.battle.title': '전투 굴려 보기',
    'home.battle.note': '세 마리씩 골라 규칙대로 굴린다. 박자마다 폼과 Heat, Drive 가 어떻게 움직이는지 본다.',
    'battle.side.a': '아군',
    'battle.side.b': '상대',
    'battle.slot': '카드 이름',
    'battle.policy': '운용',
    'battle.policy.managed': '운용 — 맞고 나서 식힌다, 찼으면 연다',
    'battle.policy.stay:light': '경장에 눌러앉기',
    'battle.policy.stay:heavy': '중장에 눌러앉기',
    'battle.policy.stay:mobility': '고기동에 눌러앉기',
    'battle.policy.burn': '중장 + 열 수 있으면 연다',
    'battle.seed': '씨앗',
    'battle.run': '한 판',
    'battle.many': '100판',
    'battle.running': '굴리는 중…',
    'battle.unknown': '{name} — 없는 카드',
    'battle.winner': '{side} 승 · {beats}박자',
    'battle.draw': '무승부 · {beats}박자',
    'battle.rate': '아군 {a}% · 상대 {b}% · 무승부 {d}% — {n}판, 양쪽을 바꿔 두 번씩',
    'battle.beat': '박자 {n} / {total}',
    'battle.first': '처음',
    'battle.prev': '앞 박자',
    'battle.next': '다음 박자',
    'battle.last': '끝',
    'battle.open': '열림',
    'battle.forced': '강제 개방',
    'battle.down': '쓰러짐',
    'battle.events': '이 박자에 일어난 것',
    'battle.ev.attack': '{who} 공격',
    'battle.ev.hit': '{who} → {to} {dmg}{guard}{untargeted}',
    'battle.ev.guard': ' (중장이 받아냄)',
    'battle.ev.untargeted': ' (대상 못 고름)',
    'battle.ev.vent': '{who} 강제 방출',
    'battle.ev.evade': '{who} 피함 · Heat {heatBefore}→{heat}',
    'battle.ev.switch': '{who} → {form} · Heat {heatBefore}→{heat}',
    'battle.ev.open': '{who} 개방',
    'battle.ev.forced-open': '{who} 과열 — 강제 개방',
    'battle.ev.open-end': '{who} 개방 끝',
    'battle.ev.skip': '{who} 행동을 잃음',
    'battle.ev.extra': '{who} 연속행동',
    'battle.ev.down': '{who} 쓰러짐',
    'battle.play': '아군을 직접 조종한다',
    'battle.start': '시작',
    'battle.step': '박자 굴리기',
    'battle.plan': '이 박자에 할 것 — 안 고른 아군은 운용 규칙이 맡는다',
    'battle.cmd.auto': '맡김',
    'battle.cmd.attack': '공격',
    'battle.cmd.open': '개방',
    'battle.cmd.target': '대상',
    'battle.cmd.any': '규칙대로',
    'battle.cmd.extra': '연속행동',
    'battle.over': '끝 — {result}',
    'battle.help': '박자 사이에 멈춘다. 아군마다 할 것을 고르고 굴리면 한 박자가 지나간다. 전환은 잠금이 풀려야, 개방은 Drive 가 차야 고를 수 있다.',
    'battle.note': '규칙은 lib/battle.js 그대로다. docs/GAME_CONCEPT.md 의 "굴려 본 것" 이 이 판에서 나온 숫자다. 이름을 바꾸면 도감의 아무 카드나 세울 수 있다.',

    /* 도감 */
    'dex.compare': '나란히 보기',
    'dex.overdrive.legacy': '기존 폭주 이미지 · 기준 장갑 미지정',
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
