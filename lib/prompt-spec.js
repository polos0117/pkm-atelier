/* 프롬프트 자료 표 — 사람이 읽는 말과 생성기에 나가는 문구가 전부 여기 있다.
   atelier 의 선택지·화풍을 바탕으로 포켓몬 메카 생성 규칙을 분리했다.

   여기만 갈아 끼우면 다른 주제로 돈다. 조립부(prompt-anthro.js ·
   prompt-lifestyle.js)에는 한글이 0자리다 — 말은 전부 이 표에서 꺼내 쓴다.

   PROJECT_RULES·FORM_PROFILES·OUTPUT_PROFILES 가 생성 규칙의 기준이다.
   화풍 키와 외형 선택지 키는 자료·그림 파일과 연결되므로 유지한다.
   옛 툴킷의 카테고리·요약 표는 호환을 위해 남아 있지만 콜라주는 출력하지 않는다.

   lib/words.js 와 같은 취급을 받는다 — tests/words.cjs 의 한글 검사에서 빠지고,
   대신 "표 말고 아무것도 없나"를 따로 본다. 화면 코드를 여기 숨기지 못하게.

   옮기면서 뺀 것: NAME_RULES (21갈래). 카드 이름 정규식으로 일상컷 후보를
   골랐는데, atelier 에서도 옛 화면(prompt-legacy.html)만 쓰고 지금 화면은 안 쓴다.
   이름에 규칙을 묶는 방식 자체가 주제를 갈아 끼우면 깨진다 — 되살릴 일이 있으면
   카드에 결을 적고 그걸 읽는 꼴로 다시 만든다. */
(function (root) {
  'use strict';

  /* 아래 셋은 toolkit.js 가 쓰던 이름표다. 말은 한 곳에 모은다는 규칙대로
     이리로 옮겼다 — toolkit.js 쪽에는 한글이 한 자리도 없게 된다.
     CAT_KO 는 카테고리 설명(긴 글)이고 이쪽은 요약에 찍는 짧은 이름표다 */
  const CAT_SHORT = {
    adult_roleplay: '성인 역할극', occupation_basic: '직업(기본)', occupation_sensual: '직업(섹시)',
    everyday_basic: '일상(기본)', everyday_sensual: '일상(섹시)', swimwear: '수영복', active: '액티브',
    source_editorial: 'SOURCE 에디토리얼', homewear: '홈웨어', private_evening: '프라이빗 이브닝',
    lingerie: '란제리', everyday: '일상', wildcard: '와일드카드', auto_random: '자동/랜덤'
  };
  /* 요약에 넣을 설정 항목과 이름표. 여기 있는 것만, 이 차례로 찍는다 */
  const PARAM_SHORT = {
    'facial ethnicity': '계통', 'apparent age': '나이', 'body type': '체형',
    'hair color': '머리색', 'hair length': '머리길이', 'hairstyle': '헤어', 'eye color': '눈색',
    'facial hair': '수염', 'face shape': '얼굴형', 'facial character': '인상', 'skin tone': '피부'
  };
  /* 요약 한 줄을 짜는 데 쓰는 조각들 */
  const SUMMARY_WORDS = {
    female: '여', male: '남', times: '회',
    underboob: '언더부스트', hasNote: '추가 지시 있음'
  };

  /* 원본을 가리키는 말. 조립부(prompt-anthro.js · prompt-lifestyle.js)가
     이 셋만 꺼내 쓰므로, 주제를 갈아 끼울 때 코드는 안 건드린다.
     SOURCE_INPUT 의 {name} 자리에 카드 이름이 들어간다 */
  const SOURCE_WORD = { param: 'source creature', armor: 'creature-inspired armor', heading: 'SOURCE CREATURE' };
  const SOURCE_INPUT = 'SOURCE CREATURE: [{name}]';

  const PARAM_DEFS = [{"key": "apparent age", "label": "Apparent Age", "ko": "외관상 나이", "options": [["", "AUTO — 원본 포켓몬 이미지에 맞춰 자동 결정"], ["20s", "20s — 20대 성인"], ["30s", "30s — 30대 성인"], ["40s", "40s — 40대 성인"], ["mature adult", "Mature Adult — 성숙하고 연륜 있는 성인"], ["youthful adult", "Youthful — 동안 (성인이되 어려 보이는 얼굴)"], ["__custom__", "직접 입력… — 원하는 나이 인상 직접 작성"]], "group": "base"}, {"key": "facial ethnicity", "label": "Facial Ethnicity", "ko": "얼굴 계통", "options": [["", "AUTO — 지정 안 함 (모델 기본값 = 서구권으로 쏠리기 쉬움)"], ["East Asian", "East Asian — 동아시아 계열"], ["Korean", "Korean — 한국계"], ["Japanese", "Japanese — 일본계"], ["Chinese", "Chinese — 중국계"], ["Southeast Asian", "Southeast Asian — 동남아 계열"], ["Central Asian", "Central Asian — 중앙아시아 계열"], ["South Asian", "South Asian — 남아시아 계열"], ["Middle Eastern", "Middle Eastern — 중동 계열"], ["European", "European — 유럽 계열"], ["Nordic", "Nordic — 북유럽 계열"], ["Mediterranean", "Mediterranean — 지중해 계열"], ["Slavic", "Slavic — 슬라브 계열"], ["Latin American", "Latin American — 라틴 계열"], ["African", "African — 아프리카 계열"], ["mixed East Asian and European", "Mixed (EA×EU) — 동아시아·유럽 혼혈"], ["__custom__", "직접 입력… — 원하는 계통 직접 작성"]], "group": "base"}, {"key": "human-mechanical balance", "label": "Human ↔ Mechanical Balance", "ko": "인간/기계 비율", "options": [["", "AUTO — 원본 포켓몬에 맞춰 자동 결정"], ["more human", "More Human — 인간 신체 비중을 더 높임"], ["balanced", "Balanced — 인간과 기계 요소를 균형 있게"], ["more mechanical", "More Mechanical — 기계 장갑 비중을 더 높임"], ["very mechanical", "Very Mechanical — 원원본 포켓몬 구조를 매우 강하게 유지"], ["__custom__", "직접 입력… — 원하는 비율 직접 작성"]], "group": "base"}, {"key": "body type", "label": "Body Type", "ko": "체형", "options": [["", "AUTO — 원본 포켓몬 실루엣에서 자동 추론"], ["slender", "Slender — 가늘고 슬림한 체형"], ["athletic", "Athletic — 탄탄한 운동형 체형"], ["curvy", "Curvy — 허리와 골반 곡선이 강조된 체형"], ["glamorous", "Glamorous — 풍만하고 화려한 체형"], ["muscular", "Muscular — 근육이 뚜렷한 체형"], ["heavy-built", "Heavy-built — 중후하고 묵직한 체형"], ["tall and lean", "Tall & Lean — 장신의 길고 슬림한 체형"], ["petite", "Petite — 작고 아담한 체형"], ["hourglass", "Hourglass — 허리가 잘록한 모래시계형"], ["voluptuous", "Voluptuous — 굴곡이 크고 육감적인 체형"], ["toned", "Toned — 군살 없이 잔근육이 잡힌 체형"], ["wiry", "Wiry — 가늘지만 단단한 체형"], ["soft-figured", "Soft-figured — 부드럽고 살집 있는 체형"], ["pear-shaped", "Pear-shaped — 하체에 무게가 실린 체형"], ["inverted triangle", "Inverted Triangle — 어깨가 넓고 하체가 좁은 역삼각형"], ["stocky", "Stocky — 짧고 다부진 체형"], ["statuesque", "Statuesque — 크고 당당한 조각상 같은 체형"], ["broad-shouldered", "Broad-shouldered — 어깨가 특히 넓은 체형"], ["burly", "Burly — 크고 두꺼운 거구"], ["lanky", "Lanky — 키만 크고 마른 체형"], ["barrel-chested", "Barrel-chested — 흉곽이 통처럼 두꺼운 체형"], ["rangy", "Rangy — 길고 유연한 근육질"], ["__custom__", "직접 입력… — 원하는 체형 직접 작성"]], "group": "build"}, {"key": "height impression", "label": "Height Impression", "ko": "키 인상", "options": [["", "AUTO — 전체 비율에서 자동 결정"], ["short", "Short — 비교적 작은 키 인상"], ["average", "Average — 평균적인 키 인상"], ["tall", "Tall — 장신 인상"], ["very tall", "Very Tall — 매우 큰 키 인상"], ["__custom__", "직접 입력… — 원하는 키/비율 직접 작성"]], "group": "build", "sub": "body type"}, {"key": "shoulder build", "label": "Shoulder Build", "ko": "어깨 체형", "options": [["", "AUTO — 자동 결정"], ["narrow", "Narrow — 좁은 어깨"], ["average", "Average — 평균적인 어깨"], ["broad", "Broad — 넓은 어깨"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "torso / chest build", "label": "Torso / Chest Build", "ko": "상체/흉곽 인상", "options": [["", "AUTO — 자동 결정"], ["slim", "Slim — 얇고 가벼운 상체"], ["balanced", "Balanced — 균형 잡힌 상체"], ["full", "Full — 풍만한 상체"], ["powerful", "Powerful — 넓고 강한 흉곽"], ["v-taper", "V-taper — 어깨에서 허리로 급히 좁아지는 상체"], ["full bust", "Full Bust — 가슴 볼륨이 뚜렷한 상체"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "torso length", "label": "Torso Length", "ko": "몸통 길이", "options": [["", "AUTO — 자동 결정"], ["short", "Short — 짧은 몸통"], ["balanced", "Balanced — 보통"], ["long", "Long — 긴 몸통"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "waist / hip silhouette", "label": "Waist / Hip Silhouette", "ko": "허리/골반 실루엣", "options": [["", "AUTO — 자동 결정"], ["straight", "Straight — 직선적인 실루엣"], ["athletic", "Athletic — 운동형 허리/골반"], ["balanced", "Balanced — 균형형"], ["hourglass", "Hourglass — 허리가 잘록한 모래시계형"], ["curvy", "Curvy — 골반 곡선이 강조된 형태"], ["narrow-hipped", "Narrow-hipped — 골반이 좁은 형태"], ["broad-hipped", "Broad-hipped — 골반이 넓게 벌어진 형태"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "leg proportion", "label": "Leg Proportion", "ko": "다리 비율", "options": [["", "AUTO — 자동 결정"], ["balanced", "Balanced — 균형형"], ["long", "Long — 긴 다리"], ["very long", "Very Long — 매우 긴 다리"], ["powerful", "Powerful — 굵고 힘 있는 다리"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "lower-body build", "label": "Lower-body Build", "ko": "하체 굵기", "options": [["", "AUTO — 자동 결정"], ["slender", "Slender — 가는 하체"], ["balanced", "Balanced — 보통"], ["full", "Full — 굵은 하체"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "body measurements (B/W/H)", "label": "Body Measurements", "ko": "신체 치수 B/W/H", "options": [["", "AUTO — 자동 결정"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type", "ph": "94 / 61 / 95"}, {"key": "facial character", "label": "Facial Character", "ko": "얼굴 인상", "options": [["", "AUTO — 원본 포켓몬 성격에 맞춰 자동 결정"], ["elegant", "Elegant — 우아하고 정제된 인상"], ["cool", "Cool — 차갑고 세련된 인상"], ["sharp", "Sharp — 예리하고 공격적인 인상"], ["mature", "Mature — 성숙하고 안정된 인상"], ["soft", "Soft — 부드럽고 온화한 인상"], ["glamorous", "Glamorous — 화려하고 매력적인 인상"], ["rugged", "Rugged — 거칠고 강인한 인상"], ["stoic", "Stoic — 무표정하고 절제된 인상"], ["weathered", "Weathered — 풍상을 겪은 거친 인상"], ["boyish", "Boyish — 앳되고 장난기 있는 인상"], ["regal", "Regal — 위엄 있고 고압적인 인상"], ["cute", "Cute — 귀엽고 사랑스러운 인상"], ["doll-like", "Doll-like — 인형처럼 정제된 인상"], ["cheerful", "Cheerful — 밝고 명랑한 인상"], ["innocent", "Innocent — 맑고 순수해 보이는 인상"], ["friendly", "Friendly — 다가가기 쉬운 인상"], ["sleepy-eyed", "Sleepy-eyed — 나른한 인상"], ["refined", "Refined — 단정하고 세련된 인상"], ["fierce", "Fierce — 사납고 거센 인상"], ["exotic", "Exotic — 이국적인 인상"], ["androgynous", "Androgynous — 중성적인 인상"], ["melancholic", "Melancholic — 어딘가 쓸쓸한 인상"], ["__custom__", "직접 입력… — 원하는 얼굴 인상 직접 작성"]], "group": "face"}, {"key": "facial hair", "label": "Facial Hair", "ko": "수염", "sex": "male", "options": [["", "AUTO — 원본 포켓몬 인상에 맞춰 자동 결정"], ["clean-shaven", "Clean-shaven — 수염 없이 매끈하게"], ["light stubble", "Light Stubble — 하루이틀 자란 옅은 수염"], ["heavy stubble", "Heavy Stubble — 짙게 자란 무정수염"], ["mustache", "Mustache — 콧수염만"], ["goatee", "Goatee — 턱 끝만 좁게 기른 염소수염"], ["short beard", "Short Beard — 짧게 다듬은 턱수염"], ["full beard", "Full Beard — 풍성한 전체 수염"], ["chinstrap beard", "Chinstrap — 턱선을 따라 가늘게 두른 수염"], ["sideburns", "Sideburns — 구레나룻 강조"], ["__custom__", "직접 입력… — 원하는 수염 형태 직접 작성"]], "group": "face"}, {"key": "skin tone", "label": "Skin Tone", "ko": "피부 톤", "options": [["", "AUTO — 자동 결정"], ["pale", "Pale — 매우 밝은 피부"], ["light", "Light — 밝은 피부"], ["medium", "Medium — 중간 피부톤"], ["tan", "Tan — 태닝된 피부"], ["deep", "Deep — 짙은 피부톤"], ["__custom__", "직접 입력…"]], "group": "face"}, {"key": "face shape", "label": "Face Shape", "ko": "얼굴형", "options": [["", "AUTO — 원본 포켓몬 디자인에서 자동 추론"], ["oval", "Oval — 균형 잡힌 타원형"], ["angular", "Angular — 각지고 선명한 얼굴형"], ["heart-shaped", "Heart-shaped — 이마가 넓고 턱이 가는 하트형"], ["elongated", "Elongated — 길고 세련된 얼굴형"], ["compact", "Compact — 짧고 응축된 얼굴형"], ["softly rounded", "Softly Rounded — 부드럽고 둥근 얼굴형"], ["sharp", "Sharp — 턱선과 골격이 날카로운 얼굴형"], ["__custom__", "직접 입력… — 얼굴형 직접 작성"]], "group": "face", "sub": "facial character"}, {"key": "eye shape", "label": "Eye Shape", "ko": "눈매", "options": [["", "AUTO — 자동 결정"], ["narrow", "Narrow — 가늘고 날카로운 눈"], ["almond", "Almond — 아몬드형 눈"], ["large", "Large — 큰 눈"], ["sharp", "Sharp — 강하게 치켜올라간 눈"], ["drooping", "Drooping — 살짝 처진 부드러운 눈"], ["upturned", "Upturned — 끝이 올라간 눈"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eye color", "label": "Eye Color", "ko": "눈동자 색 · 오른쪽", "options": [["", "AUTO — 센서/원본 포켓몬색에서 자동 결정"], ["red", "Red — 적색"], ["crimson", "Crimson — 진홍색"], ["amber", "Amber — 호박색"], ["gold", "Gold — 금색"], ["orange", "Orange — 주황색"], ["green", "Green — 녹색"], ["teal", "Teal — 청록색"], ["pale blue", "Pale Blue — 옅은 하늘색"], ["blue", "Blue — 청색"], ["navy", "Navy — 짙은 남색"], ["purple", "Purple — 보라색"], ["lavender", "Lavender — 연보라"], ["pink", "Pink — 분홍색"], ["gray", "Gray — 회색"], ["silver", "Silver — 은색"], ["brown", "Brown — 갈색"], ["black", "Black — 검은색"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "second eye color", "label": "Second Eye Color", "ko": "오드아이 · 왼쪽 눈", "group": "face", "sub": "facial character", "options": [["", "사용 안 함 — 양쪽 같은 색"], ["red", "Red — 적색"], ["crimson", "Crimson — 진홍색"], ["amber", "Amber — 호박색"], ["gold", "Gold — 금색"], ["orange", "Orange — 주황색"], ["green", "Green — 녹색"], ["teal", "Teal — 청록색"], ["pale blue", "Pale Blue — 옅은 하늘색"], ["blue", "Blue — 청색"], ["navy", "Navy — 짙은 남색"], ["purple", "Purple — 보라색"], ["lavender", "Lavender — 연보라"], ["pink", "Pink — 분홍색"], ["gray", "Gray — 회색"], ["silver", "Silver — 은색"], ["brown", "Brown — 갈색"], ["black", "Black — 검은색"], ["__custom__", "직접 입력… — 원하는 색 직접 작성"]]}, {"key": "expression", "label": "Expression", "ko": "표정", "options": [["", "AUTO — 원본 포켓몬 성격에 맞춰 자동 결정"], ["calm", "Calm — 차분함"], ["serious", "Serious — 진지함"], ["confident", "Confident — 자신감"], ["cold", "Cold — 차갑고 냉정함"], ["gentle", "Gentle — 부드러움"], ["smirk", "Smirk — 옅은 비웃음/미소"], ["fierce", "Fierce — 강렬하고 사나움"], ["stoic", "Stoic — 감정을 절제한 무표정"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "face length", "label": "Face Length", "ko": "얼굴 길이", "options": [["", "AUTO — 자동 결정"], ["short", "Short — 짧은 얼굴"], ["balanced", "Balanced — 보통"], ["long", "Long — 긴 얼굴"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "face width", "label": "Face Width", "ko": "얼굴 폭", "options": [["", "AUTO — 자동 결정"], ["narrow", "Narrow — 좁은 얼굴"], ["medium", "Medium — 보통"], ["wide", "Wide — 넓은 얼굴"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "jaw & chin", "label": "Jaw & Chin", "ko": "턱선 · 턱끝", "options": [["", "AUTO — 자동 결정"], ["soft rounded jaw", "Soft — 부드럽고 둥근 턱"], ["balanced jawline", "Balanced — 보통"], ["angular defined jaw", "Angular — 각지고 또렷한 턱"], ["square broad jaw", "Square — 넓고 각진 사각 턱"], ["narrow tapered chin", "Tapered — 아래로 갈수록 좁아지는 턱끝"], ["wide heavy chin", "Heavy — 넓고 묵직한 턱끝"], ["long chin with defined jaw", "Long — 턱끝이 길고 턱선이 또렷한"], ["receding soft chin", "Receding — 턱끝이 뒤로 물러난"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eye size", "label": "Eye Size", "ko": "눈 크기", "options": [["", "AUTO — 자동 결정"], ["small", "Small — 작은 눈"], ["medium", "Medium — 보통"], ["large", "Large — 큰 눈"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eye tilt", "label": "Eye Tilt", "ko": "눈꼬리 각도", "options": [["", "AUTO — 자동 결정"], ["downturned outer corners", "Downturned — 처진 눈꼬리"], ["level outer corners", "Level — 수평"], ["upturned outer corners", "Upturned — 올라간 눈꼬리"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "nose character", "label": "Nose Character", "ko": "코", "options": [["", "AUTO — 자동 결정"], ["small delicate nose", "Delicate — 작고 여린 코"], ["balanced nose", "Balanced — 보통"], ["prominent defined nose", "Prominent — 크고 또렷한 코"], ["straight slender bridge", "Straight — 곧고 가는 콧대"], ["aquiline nose with convex bridge", "Aquiline — 콧대가 볼록한 매부리코"], ["rounded soft tip", "Rounded Tip — 코끝이 둥근"], ["broad low bridge", "Broad Low — 콧대가 낮고 넓은"], ["short nose with upturned tip", "Upturned — 짧고 코끝이 들린"], ["long nose with low tip", "Long — 길고 코끝이 내려온"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "lips", "label": "Lips", "ko": "입술", "options": [["", "AUTO — 자동 결정"], ["thin lips", "Thin — 얇은 입술"], ["medium lips", "Medium — 보통"], ["full lips", "Full — 도톰한 입술"], ["fuller lower lip", "Fuller Lower — 아랫입술이 더 도톰한"], ["bow-shaped upper lip", "Bow — 윗입술이 활 모양인"], ["straight even lips", "Even — 굴곡 없이 곧은"], ["wide mouth", "Wide — 입이 넓은"], ["small mouth", "Small — 입이 작은"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "hair color", "label": "Hair Color", "ko": "머리색", "options": [["", "AUTO — 원본 포켓몬 색상에 맞춰 자동 결정"], ["white", "White — 흰색"], ["platinum", "Platinum — 백금색"], ["silver", "Silver — 은색"], ["ash blonde", "Ash Blonde — 애시 블론드"], ["blonde", "Blonde — 금발"], ["gold", "Gold — 금색"], ["orange", "Orange — 주황색"], ["red", "Red — 붉은색"], ["crimson", "Crimson — 진홍색"], ["pink", "Pink — 분홍색"], ["purple", "Purple — 보라색"], ["lavender", "Lavender — 연보라"], ["navy", "Navy — 짙은 남색"], ["blue", "Blue — 파란색"], ["teal", "Teal — 청록색"], ["mint", "Mint — 민트색"], ["green", "Green — 녹색"], ["brown", "Brown — 갈색"], ["black", "Black — 검은색"], ["__custom__", "직접 입력… — 원하는 색 직접 작성"]], "group": "hair"}, {"key": "hairstyle", "label": "Hairstyle", "ko": "헤어스타일", "options": [["", "AUTO — 원본 포켓몬 디자인에 맞춰 자동 결정"], ["bob", "Bob — 단정한 보브컷"], ["pixie cut", "Pixie Cut — 짧고 가벼운 픽시컷"], ["layered", "Layered — 층을 살린 레이어드"], ["ponytail", "Ponytail — 포니테일"], ["twin tail", "Twin Tail — 트윈테일"], ["wolf cut", "Wolf Cut — 층감이 강한 울프컷"], ["slicked back", "Slicked Back — 뒤로 넘긴 스타일"], ["wavy", "Wavy — 웨이브 헤어"], ["straight", "Straight — 곧은 생머리"], ["side ponytail", "Side Ponytail — 사이드 포니테일"], ["high ponytail", "High Ponytail — 높이 묶은 포니테일"], ["braid", "Single Braid — 한 갈래 땋은 머리"], ["twin braids", "Twin Braids — 양갈래 땋은 머리"], ["crown braid", "Crown Braid — 머리를 둘러 땋은 왕관형"], ["chignon", "Chignon — 단정하게 말아 올린 시뇽"], ["messy bun", "Messy Bun — 흐트러진 번"], ["top knot", "Top Knot — 정수리에 묶어 올린 번"], ["low bun", "Low Bun — 목덜미 낮은 번"], ["half-up", "Half-up — 반묶음"], ["space buns", "Space Buns — 양쪽 동그란 번"], ["hime cut", "Hime Cut — 히메컷"], ["asymmetric cut", "Asymmetric Cut — 좌우 길이가 다른 비대칭컷"], ["undercut", "Undercut — 옆/뒤를 밀어낸 언더컷"], ["side-shaved long hair", "Side-shaved Long — 한쪽만 밀고 나머지는 긴 머리"], ["curly", "Curly — 굵은 곱슬"], ["tight curls", "Tight Curls — 잔곱슬 / 아프로"], ["locs", "Locs — 로크스 / 드레드풍"], ["ringlet curls", "Ringlet Curls — 세로로 말린 드릴 컬"], ["finger waves", "Finger Waves — 레트로 웨이브"], ["feathered", "Feathered — 끝을 가볍게 친 페더컷"], ["blunt cut", "Blunt Cut — 끝을 일자로 자른 컷"], ["wet-look slick", "Wet-look Slick — 젖은 듯 넘긴 스타일"], ["windswept", "Windswept — 바람에 날린 듯한 스타일"], ["buzz cut", "Buzz Cut — 아주 짧게 민 머리"], ["crew cut", "Crew Cut — 짧고 단정한 크루컷"], ["side part", "Side Part — 가르마를 탄 단정한 컷"], ["fade", "Fade — 옆을 그라데이션으로 짧게 친 컷"], ["man bun", "Man Bun — 뒤로 묶어 올린 번"], ["swept back", "Swept Back — 뒤로 넘긴 볼륨 있는 스타일"], ["shaggy", "Shaggy — 덥수룩하게 흐트러진 컷"], ["mullet", "Mullet — 앞은 짧고 뒤만 긴 컷"], ["__custom__", "직접 입력… — 헤어스타일 직접 작성"]], "group": "hair"}, {"key": "hair length", "label": "Hair Length", "ko": "머리 길이", "options": [["", "AUTO — 원본 포켓몬 실루엣에 맞춰 자동 결정"], ["very short", "Very Short — 매우 짧은 머리"], ["short", "Short — 짧은 머리"], ["medium", "Medium — 중간 길이"], ["long", "Long — 긴 머리"], ["very long", "Very Long — 매우 긴 머리"], ["__custom__", "직접 입력… — 길이 직접 작성"]], "group": "hair", "sub": "hairstyle"}, {"key": "bangs", "label": "Bangs", "ko": "앞머리", "options": [["", "AUTO — 자동 결정"], ["none", "None — 앞머리 없음"], ["straight bangs", "Straight Bangs — 일자 앞머리"], ["side-swept bangs", "Side-swept Bangs — 옆으로 넘긴 앞머리"], ["curtain bangs", "Curtain Bangs — 커튼뱅"], ["long side bangs", "Long Side Bangs — 긴 사이드뱅"], ["long side bangs covering one eye", "One-eye Cover — 한쪽 눈을 덮는 긴 사이드뱅"], ["asymmetric bangs", "Asymmetric Bangs — 좌우 길이가 다른 앞머리"], ["parted bangs", "Parted Bangs — 가운데를 가른 앞머리"], ["choppy bangs", "Choppy Bangs — 끝을 불규칙하게 친 앞머리"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "hair accent", "label": "Hair Accent", "ko": "머리 삐침 · 잔머리", "group": "hair", "sub": "hairstyle", "options": [["", "AUTO — 지정 안 함"], ["a single antenna strand standing up", "Antenna Strand — 안테나 헤어 한 가닥"], ["two antenna strands standing up", "Twin Antennae — 안테나 헤어 두 가닥"], ["a prominent cowlick", "Cowlick — 크게 뻗친 가마머리"], ["loose stray strands framing the face", "Stray Strands — 얼굴 옆 잔머리"], ["neatly kept, no stray strands", "Neat — 삐침 없이 정돈"], ["__custom__", "직접 입력… — 원하는 형태 직접 작성"]]}, {"key": "hair texture", "label": "Hair Texture", "ko": "머릿결", "options": [["", "AUTO — 자동 결정"], ["fine", "Fine — 가늘고 매끄러운"], ["medium", "Medium — 보통"], ["thick", "Thick — 굵고 뻣뻣한"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "hair volume", "label": "Hair Volume", "ko": "머리 볼륨", "options": [["", "AUTO — 자동 결정"], ["flat", "Flat — 납작한"], ["moderate", "Moderate — 보통"], ["full", "Full — 풍성한"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "parting", "label": "Parting", "ko": "가르마", "options": [["", "AUTO — 자동 결정"], ["center part", "Center — 가운데 가르마"], ["slight off-center part", "Slight off-center — 살짝 비낀 가르마"], ["deep side part", "Deep side — 깊은 옆 가르마"], ["no visible part", "None — 가르마 없음"], ["swept back", "Swept back — 뒤로 넘긴"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "armor coverage", "label": "Armor Coverage", "ko": "장갑 커버리지", "options": [["", "AUTO — 원본 포켓몬 구조에서 자동 결정"], ["full", "Full — 거의 전신 장갑"], ["high", "High — 장갑 비중이 높은 편"], ["balanced", "Balanced — 피부와 장갑의 균형"], ["open", "Open — 일부 피부 노출이 더 많은 구조"], ["__custom__", "직접 입력… — 커버리지 직접 작성"]], "group": "armor"}, {"key": "lower-body treatment", "label": "Lower-body Treatment", "ko": "하체 장갑 구조", "options": [["", "AUTO — 원원본 포켓몬 실루엣에 맞춰 자동 결정"], ["armored skirt", "Armored Skirt — 스커트형 장갑"], ["split armored skirt", "Split Armored Skirt — 좌우 분할 스커트 장갑"], ["robe-like armor", "Robe-like Armor — 로브형 장갑"], ["mantle-like armor", "Mantle-like Armor — 망토/드레이프형 장갑"], ["pants armor", "Pants Armor — 바지처럼 이어지는 장갑 구조"], ["layered plates", "Layered Plates — 여러 겹 판넬형 하체 장갑"], ["__custom__", "직접 입력… — 하체 구조 직접 작성"]], "group": "armor", "sub": "armor coverage"}, {"key": "head crest integration", "label": "Head Crest Integration", "ko": "헤드 크레스트 표현", "options": [["", "AUTO — 원원본 포켓몬에 맞춰 자동 결정"], ["mechanical crest", "Mechanical Crest — 기계식 크레스트 유지"], ["headband-like", "Headband-like — 헤드밴드처럼 통합"], ["hair ornament", "Hair Ornament — 헤어 장식처럼 통합"], ["helmet-like", "Helmet-like — 헬멧 구조로 통합"], ["sensor ornament", "Sensor Ornament — 센서 장식으로 표현"], ["__custom__", "직접 입력…"]], "group": "armor", "sub": "armor coverage"}, {"key": "silhouette character", "label": "Silhouette Character", "ko": "전체 실루엣 성격", "options": [["", "AUTO — 자동 결정"], ["aerodynamic", "Aerodynamic — 공기역학적이고 날렵함"], ["elegant", "Elegant — 우아하고 유려함"], ["aggressive", "Aggressive — 공격적이고 뾰족함"], ["heavy", "Heavy — 중장갑형의 묵직함"], ["tactical", "Tactical — 실전적이고 전술적"], ["regal", "Regal — 위엄 있고 장식적인 인상"], ["experimental", "Experimental — 실험기다운 이질적 형태"], ["minimal", "Minimal — 간결하고 절제된 형태"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "equipment emphasis", "label": "Equipment Emphasis", "ko": "장비 강조", "options": [["", "AUTO — 원본 포켓몬 대표 장비를 자동 우선"], ["balanced", "Balanced — 장비를 균형 있게"], ["backpack", "Backpack — 백팩 구조 강조"], ["wings / binders", "Wings / Binders — 날개/바인더 강조"], ["main weapon", "Main Weapon — 주무장 강조"], ["shield", "Shield — 방패 강조"], ["remote weapons", "Remote Weapons — 판넬/비트/드론 강조"], ["transformation system", "Transformation System — 변형기구 강조"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "equipment state", "label": "Equipment State", "ko": "장비 상태", "options": [["", "AUTO — 자동 결정"], ["fully mounted", "Fully Mounted — 장비 전부 장착"], ["main weapon held", "Main Weapon Held — 주무장을 손에 듦"], ["weapons stowed", "Weapons Stowed — 무장 수납 상태"], ["equipment deployed", "Equipment Deployed — 날개/판넬 등 전개 상태"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "pose character", "label": "Pose Character", "ko": "포즈 성격", "options": [["", "AUTO — 자동 결정"], ["neutral", "Neutral — 정적인 기본 자세"], ["heroic", "Heroic — 영웅적인 자세"], ["confident", "Confident — 자신감 있는 자세"], ["relaxed", "Relaxed — 힘을 뺀 자연스러운 자세"], ["combat-ready", "Combat-ready — 전투 준비 자세"], ["elegant", "Elegant — 우아한 자세"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "view angle", "label": "View Angle", "ko": "시점", "options": [["", "AUTO — 자동 결정"], ["front", "Front — 정면"], ["front three-quarter", "Front 3/4 — 정면 45도"], ["side", "Side — 측면"], ["rear three-quarter", "Rear 3/4 — 후면 45도"], ["__custom__", "직접 입력…"]], "group": "shot"}];

  const CATS = [["auto_random", "AUTO / RANDOM", "자동 / 랜덤", ""], ["adult_roleplay", "ADULT ROLEPLAY / OCCUPATION EVENT FASHION", "성인 역할극 / 직업풍 이벤트 패션", "Create playful adult event fashion inspired by occupation or roleplay motifs. It must read as a costume made for a stage presentation or themed event, not as an authentic workplace uniform. Use original colours and decorative details — no real institutional insignia, no weapons, no tactical gear. Describe the costume by its tailoring, trim, and props, and show a believable styling or preparation action.", "f"], ["occupation_basic", "POKÉMON-WORLD OCCUPATION — BASIC", "포켓몬 세계 직업컷 — 기본", "Show one believable working moment in the Pokémon world. Choose care, research, conservation, berry cultivation, crafts, travel, contests or battle support. Make the profession readable through a concrete task, practical clothing and relevant tools. Preserve the approved woman; invent her own workwear instead of copying an existing trainer, Gym Leader or Pokémon Center character."], ["occupation_sensual", "POKÉMON-WORLD OCCUPATION — STYLED", "포켓몬 세계 직업컷 — 섹시", "Show one believable working moment in the Pokémon world. Choose care, research, conservation, berry cultivation, crafts, travel, contests or battle support. Make the profession readable through a concrete task, practical clothing and relevant tools. Preserve the approved woman; invent her own workwear instead of copying an existing trainer, Gym Leader or Pokémon Center character. Use glamorous tailoring and confident professional presence while keeping the outfit credible for the task."], ["everyday_basic", "EVERYDAY LIFE — BASIC", "일상컷 — 기본", "Create candid ordinary personal-life moments. The scene should feel lived-in, believable, and visually specific rather than staged. Use normal contemporary clothing with clear character personality. Avoid glamour-shoot posing, professional work, and costume styling."], ["everyday_sensual", "EVERYDAY LIFE — SENSUAL", "일상컷 — 섹시", "Create a sensual but non-explicit everyday lifestyle moment with the same clearly adult character. The situation must read as believable ordinary life, so specify the room, the clothing, and a concrete action already in progress rather than a posed shoot. Use natural household or street lighting and eye-level framing; fabric drape, movement, and light carry the mood. Avoid turning the scene into a lingerie catalogue or a deliberate glamour shoot."], ["partner_care", "PARTNER CARE & BONDING", "파트너 돌봄·교감", "Show a quiet personal moment caring for a Pokémon companion. Make the interaction, supporting props and comfortable setting specific; keep the approved woman as the main subject and any companion anatomically separate."], ["travel_exploration", "TRAVEL & FIELD EXPLORATION", "여행·필드 탐험", "Show travel or peaceful field exploration in the Pokémon world, with useful travel clothing and a specific activity. Let the environment support the woman without overwhelming her or turning the scene into combat."], ["food_berries", "FOOD & BERRIES", "요리·나무열매", "Show a specific everyday cooking, berry-growing or picnic activity in the Pokémon world. Use readable hands, utensils and ingredients; favor ordinary personal life over professional workwear."], ["festivals_contests", "FESTIVALS & CONTESTS", "축제·콘테스트 나들이", "Show one moment attending a Pokémon-world festival or contest, with an identifiable activity and event props. Preserve the approved identity and let the selected scene determine clothing and mood."], ["hobbies_leisure", "HOBBIES & QUIET LEISURE", "취미·느긋한 휴식", "Show a personal hobby or restful leisure moment with a specific action and relevant objects. Pokémon motifs may appear naturally in the activity, without requiring armor, a uniform or a companion."], ["swimwear", "SWIMWEAR LIFESTYLE", "수영복 라이프스타일", "This single scene is swimwear-focused. Use modern swimwear that is fully lined and stays secure during movement, described by its construction — neckline, straps, panels, leg line, fabric. Prioritize a memorable swimwear scene with real action and water context over static posing. Keep the setting a public or resort one: poolside, shoreline, deck, or open water.", "f"], ["active", "ACTIVE / MOVEMENT FASHION", "액티브 / 무브먼트 패션", "Show real movement with fashion-forward activewear or movement-oriented clothing. Avoid generic gym snapshots. Prioritize dynamic motion, readable silhouette, waist and hip lines, fabric movement, and varied action."], ["source_editorial", "SOURCE-INSPIRED EDITORIAL FASHION", "SOURCE 영감 에디토리얼 패션", "This scene should reinterpret the source creature as human editorial fashion. Translate source-specific colors, geometry, silhouette logic, crest language, and equipment symbolism into couture or themed fashion. No literal armor, no pilot suit, no mechanical body, no weapons."], ["homewear", "FASHION HOMEWEAR / LOUNGE LIFE", "패션 홈웨어 / 라운지 라이프", "Create designed, fashion-forward homewear or lounge-life scenes. Avoid plain pajamas and bland static sofa poses. Use believable home-life actions, stylish home fashion silhouettes, and a sensual but natural private-life atmosphere.", "f"], ["private_evening", "PRIVATE EVENING FASHION", "프라이빗 이브닝 패션", "Create mature private evening fashion scenes with intimate but non-explicit atmosphere. Use elegant, attractive, clearly adult styling, confident body language, and believable private-life context.", "f"], ["lingerie", "LINGERIE-INSPIRED FASHION", "란제리풍 패션", "Use tasteful adult lingerie-inspired evening fashion with full intimate coverage. Describe the garment by its construction — cut, fabric, trim, straps, closures, layers — rather than by mood words. The garments are securely fitted and fully opaque, and the look is suitable for a mainstream evening-fashion editorial. Build the image through framing, silhouette, posture, and lighting rather than exposure.", "f"], ["everyday", "EVERYDAY LIFESTYLE", "일상 라이프스타일", "Depict ordinary personal-life moments rather than occupation, costume, or formal editorial shoots. Keep them candid, believable, visually varied, and attractive without becoming too plain."], ["traditional", "TRADITIONAL / HERITAGE FASHION", "전통 의상 / 헤리티지 패션", "This cut is built around traditional dress drawn from the character's own ethnic background. Use either authentic formal traditional clothing or a modernised everyday interpretation of it, as specified by the example. Keep the garment structure, layering logic, fastening, and silhouette faithful to that tradition rather than generic orientalism or costume-shop pastiche. Colours may follow the source creature, but the construction must remain true to the tradition. Place the character in a setting where such clothing is plausibly worn."], ["wildcard", "WILDCARD", "와일드카드", "Invent one fresh adult lifestyle scene. It should remain stylish, sensual, cinematic, and non-explicit with a coherent specific activity."], ["__custom__", "CUSTOM", "직접 입력", ""]];

  const PRESETS = {"free": {"label": "자유 설정", "pairs": ["adult_roleplay", "swimwear", "homewear"], "advanced": {}}, "A": {"label": "코스튬 · 수영복 · 홈웨어", "pairs": ["adult_roleplay", "swimwear", "homewear"], "advanced": {"overall_intensity": "sensual", "pair_gap": "medium", "outfit_variety": "high", "scene_variety": "high", "source_influence": "subtle"}}, "B": {"label": "액티브 · SOURCE · 프라이빗", "pairs": ["active", "source_editorial", "private_evening"], "advanced": {"overall_intensity": "sensual", "pair_gap": "medium", "outfit_variety": "high", "scene_variety": "high", "source_influence": "balanced"}}, "random_variety": {"label": "랜덤 다양성 강화", "pairs": ["wildcard", "wildcard", "wildcard"], "advanced": {"overall_intensity": "sensual", "pair_gap": "medium", "outfit_variety": "extreme", "scene_variety": "extreme", "pose_variety": "extreme", "camera_variety": "extreme", "unexpected_cuts": "3"}}, "outfit_focus": {"label": "의상 중심", "pairs": ["adult_roleplay", "source_editorial", "lingerie"], "advanced": {"overall_intensity": "bold", "pair_gap": "medium", "outfit_variety": "extreme", "scene_variety": "high", "source_influence": "balanced"}}, "scene_focus": {"label": "장면 중심", "pairs": ["everyday", "swimwear", "wildcard"], "advanced": {"overall_intensity": "sensual", "pair_gap": "medium", "scene_variety": "extreme", "camera_variety": "high", "pose_variety": "high"}}, "strong_fashion": {"label": "강한 패션 중심", "pairs": ["adult_roleplay", "source_editorial", "lingerie"], "advanced": {"overall_intensity": "strong", "pair_gap": "strong", "skin_exposure": "bold", "outfit_variety": "high", "source_influence": "balanced"}}, "stable": {"label": "안정형", "pairs": ["adult_roleplay", "swimwear", "private_evening"], "advanced": {"overall_intensity": "restrained", "pair_gap": "small", "outfit_variety": "normal", "scene_variety": "normal", "pose_variety": "normal"}}, "worklife": {"label": "직업 · 일상 믹스", "pairs": ["occupation_basic", "everyday_basic", "everyday_sensual"], "advanced": {"overall_intensity": "sensual", "pair_gap": "medium", "scene_variety": "high", "pose_variety": "high"}}, "worklife_bold": {"label": "직업 · 일상 강한 버전", "pairs": ["occupation_sensual", "everyday_sensual", "private_evening"], "advanced": {"overall_intensity": "bold", "pair_gap": "medium", "outfit_variety": "high", "scene_variety": "high", "skin_exposure": "moderate"}}};

  const ADVANCED_OPTIONS = {"overall_intensity": ["AUTO", "restrained", "sensual", "bold", "strong"], "pair_gap": ["AUTO", "small", "medium", "strong", "extreme"], "outfit_variety": ["AUTO", "normal", "high", "extreme"], "scene_variety": ["AUTO", "normal", "high", "extreme"], "pose_variety": ["AUTO", "normal", "high", "extreme"], "camera_variety": ["AUTO", "normal", "high", "extreme"], "skin_exposure": ["AUTO", "low", "moderate", "bold"], "separates_preference": ["AUTO", "balanced", "prefer separates", "strongly prefer separates"], "action_level": ["AUTO", "mostly posed", "balanced", "mostly active"], "direct_gaze_limit": ["AUTO", "0", "1", "2"], "smile_limit": ["AUTO", "0", "1", "2"], "unexpected_cuts": ["AUTO", "1", "2", "3"], "source_influence": ["AUTO", "subtle", "balanced", "strong"]};

  const ADVANCED_LABELS = {"overall_intensity": ["Overall Intensity", "전체 강도"], "pair_gap": ["Pair Gap", "약한 컷↔강한 컷 차이"], "outfit_variety": ["Outfit Variety", "의상 다양성"], "scene_variety": ["Scene Variety", "장면 다양성"], "pose_variety": ["Pose Variety", "포즈 다양성"], "camera_variety": ["Camera Variety", "카메라 다양성"], "skin_exposure": ["Skin Exposure", "피부 노출 정도"], "separates_preference": ["Separates Preference", "분리형 의상 선호"], "action_level": ["Action Level", "액션 비중"], "direct_gaze_limit": ["Direct Gaze Limit", "정면 시선 최대"], "smile_limit": ["Smile Limit", "미소 최대"], "unexpected_cuts": ["Unexpected Cuts", "예상 밖 컷 수"], "source_influence": ["Source Influence", "SOURCE 영향도"]};

  /* 화풍마다 "이걸로 뽑으면 이렇게 나온다" 견본. 화풍 고르개 아래 줄에 깔린다 */
  const STYLE_SAMPLE = {
    cinematic_semi_real: ['style-cinematic_semi_real.webp', 'style-cinematic_semi_real2.webp', '엘메스_casual3.webp'],
    game_keyart: ['style-game_keyart2.webp', 'style-game_keyart3.webp', 'style-game_keyart.webp'],
    glossy_kr_game: ['style-glossy_kr_game2.webp', 'style-glossy_kr_game3.webp', 'style-glossy_kr_game.webp'],
    game_cgi: ['style-game_cgi.webp', 'style-game_cgi2.webp'],
    semi_real_paint: ['style-semi_real_paint.webp', 'style-semi_real_paint2.webp'],
    ink_wash: ['style-ink_wash2.webp', 'style-ink_wash.webp'],
    photoreal: ['style-photoreal.webp', 'style-photoreal2.webp'],
    anime_illust: ['style-anime_illust.webp', 'style-anime_illust2.webp'],
    cel_anime: ['style-cel_anime.webp', 'style-cel_anime2.webp'],
    painterly: ['style-painterly.webp', 'style-painterly2.webp'],
    retro_anime: ['style-retro_anime.webp', 'style-retro_anime2.webp']
  };

  const RANDOM_POOL = ["adult_roleplay", "occupation_basic", "occupation_sensual", "swimwear", "active", "source_editorial", "homewear", "private_evening", "lingerie", "everyday_basic", "everyday_sensual", "wildcard", "traditional"];

  const EXAMPLE_MAP = {"auto_random": [["", "AUTO", "자동", "basic"], ["seasonal_night", "Seasonal Night Mood", "계절감 있는 야간 무드", "basic"], ["travel_cut", "Travel / Resort Vibe", "여행 / 리조트 무드", "popular"], ["festival_night", "Night Festival", "야간 페스티벌", "popular"], ["unexpected_contrast", "Unexpected Contrast Concept", "예상 밖 대비 콘셉트", "special"], ["retro_future", "Retro-Future Lifestyle", "레트로 퓨처 라이프", "special"], ["rainy_city", "Rainy City Evening", "비 오는 도시의 저녁", "popular"], ["weekend_market", "Weekend Market Stroll", "주말 시장 산책", "popular"], ["late_studio", "Late-night Studio", "심야 작업실", "popular"], ["rooftop_wind", "Windy Rooftop", "바람 부는 옥상", "popular"], ["seaside_offseason", "Off-season Seaside", "비수기 바닷가", "special"], ["neon_alley", "Neon Backstreet", "네온 뒷골목", "special"], ["snow_evening", "Snowy Evening", "눈 내리는 저녁", "special"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "adult_roleplay": [["", "AUTO", "자동", "basic"], ["event_staff", "Adult Event Staff Costume", "성인 이벤트 스태프 코스튬", "basic", "f", "an event staff costume with a fitted vest, name-tag ribbon, and lanyard, at a themed venue"], ["uniform_inspired", "Stylized Uniform-inspired Look", "스타일화된 유니폼풍 룩", "basic", "f", "a stylized uniform-inspired costume with crisp lapels and decorative epaulettes, no real insignia"], ["adult_police", "Adult Police Costume", "성인 경찰 코스튬", "popular", "f", "a fictional police-inspired costume at a theatrical costume event, using original decorative badges rather than real insignia"], ["adult_nurse", "Adult Nurse Costume", "성인 간호사 코스튬", "popular", "f", "a fictional retro nurse-inspired costume at a theatrical costume event, using original decorative symbols rather than authentic hospital identification"], ["adult_maid", "Adult Maid Costume", "성인 메이드 코스튬", "popular", "f", "a black-and-white maid costume with a structured bodice, puffed sleeves, and a full apron, at a costume event"], ["adult_secretary", "Adult Secretary Costume", "성인 비서 코스튬", "popular", "f", "a retro secretary-inspired costume with a fitted blazer, pencil skirt, and decorative eyewear, at a themed office party"], ["bunny", "Bunny Costume", "바니 코스튬", "popular", "f", "a retro casino bunny costume with a fitted one-piece garment, cuffs, bow-tie collar, and rabbit-ear headband, on a stage floor"], ["flight_attendant", "Flight-attendant-inspired Costume", "승무원풍 코스튬", "popular", "f", "a retro flight-attendant-inspired costume with a fitted jacket, scarf, and original airline-style trim, at a themed event"], ["casino_dealer", "Casino Dealer / Hostess Styling", "카지노 딜러 / 호스티스 스타일", "popular", "f", "a casino dealer costume with a fitted waistcoat, bow tie, and cuffs, at a card table"], ["lab_roleplay", "Laboratory Roleplay Fashion", "연구실 역할극 패션", "special", "f", "a laboratory-themed costume with a crisp white coat over a fitted dress, using original decorative badges"], ["ceremonial_instructor", "Ceremonial Instructor Styling", "세리머니얼 인스트럭터 스타일", "special", "f", "a ceremonial instructor costume with a belted jacket, gloves, and a decorative sash"], ["retro_racer", "Retro Grid / Racing Costume", "레트로 레이싱 코스튬", "special", "f", "a retro racing grid costume with a cropped team jacket, shorts, and boots, beside a track barrier"], ["vinyl_stage", "Vinyl Stage Fashion", "비닐 스테이지 패션", "special", "f", "a vinyl stage costume with a glossy fitted jacket and boots under stage lighting"], ["masquerade", "Masquerade Costume Fashion", "마스커레이드 코스튬 패션", "special", "f", "a masquerade costume with a feathered eye mask, a structured bodice, and a full skirt"], ["adult_teacher", "Adult Teacher Costume", "성인 교사 코스튬", "popular", "f", "a teacher-inspired costume look with a fitted blazer, pleated skirt, reading glasses, and books"], ["adult_librarian", "Adult Librarian Styling", "성인 사서 스타일", "popular", "f", "a librarian-inspired costume with a fitted cardigan, pencil skirt, and glasses, among bookshelves"], ["cheer_costume", "Cheer Squad Costume", "치어 코스튬", "popular", "f", "a varsity cheer costume with a pleated skirt, striped fitted top, and team-colour panels, on a gym floor"], ["cabin_crew_retro", "Retro Cabin Crew", "레트로 객실승무원", "special", "f", "a retro cabin crew costume with a fitted jacket, pillbox hat, and neck scarf"], ["circus_ringmaster", "Circus Ringmaster Fashion", "서커스 링마스터 패션", "special", "f", "a circus ringmaster costume with a tailcoat, high boots, and a top hat, under a tent canopy"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "occupation_basic": [["", "AUTO — source-appropriate profession", "AUTO — 원본 포켓몬에 어울리는 직업 자동", "basic"], ["office_project", "Pokémon research coordinator arranging habitat maps, observation photographs and field kits", "포켓몬 연구소 조사 코디네이터", "basic", "", "Pokémon research coordinator arranging habitat maps, observation photographs and field kits at a regional laboratory desk."], ["field_surveyor", "Pokémon field ecologist examining tracks with a magnifier and sketchbook beside a forest trail", "야생 포켓몬 생태 조사원", "basic", "", "Pokémon field ecologist examining tracks with a magnifier and sketchbook beside a forest trail."], ["industrial_inspector", "Pokémon reserve caretaker checking a habitat gate and replenishing shaded water bowls with practical gloves", "포켓몬 보호구역 관리원", "basic", "", "Pokémon reserve caretaker checking a habitat gate and replenishing shaded water bowls with practical gloves."], ["drone_operator", "Pokémon habitat photographer reviewing camera images beside a tripod and marked field map", "포켓몬 서식지 사진 조사원", "popular", "", "Pokémon habitat photographer reviewing camera images beside a tripod and marked field map at a wetland lookout."], ["aviation_control", "Flying-Pokémon travel attendant checking a luggage harness and route map", "비행 포켓몬 이동 안내원", "popular", "", "Flying-Pokémon travel attendant checking a luggage harness and route map at an open landing shelter."], ["rescue_paramedic", "Pokémon Center care worker preparing a clean examination mat, folded blanket and basic care kit; use an original uniform and character identity", "포켓몬 센터 케어 스태프", "popular", "", "Pokémon Center care worker preparing a clean examination mat, folded blanket and basic care kit; use an original uniform and character identity."], ["test_engineer", "Poké Ball repair artisan using precision tools to adjust a ball latch on a padded workbench", "몬스터볼 수리사", "popular", "", "Poké Ball repair artisan using precision tools to adjust a ball latch on a padded workbench."], ["robotics_researcher", "Rotom-device researcher inspecting a domestic appliance with a diagnostic tablet and an open service panel in a Pokémon laboratory", "로토무 기기 연구원", "popular", "", "Rotom-device researcher inspecting a domestic appliance with a diagnostic tablet and an open service panel in a Pokémon laboratory."], ["mobility_tuner", "Ride-Pokémon outfitter stitching a saddle pad and adjusting travel harness buckles", "라이드 포켓몬 장구 제작자", "popular", "", "Ride-Pokémon outfitter stitching a saddle pad and adjusting travel harness buckles at a leathercraft bench."], ["marine_technician", "Water-Pokémon aquarium keeper testing water beside a feeding bucket and a spacious habitat tank", "물 포켓몬 수족관 사육사", "special", "", "Water-Pokémon aquarium keeper testing water beside a feeding bucket and a spacious habitat tank."], ["observatory_engineer", "Nocturnal Pokémon researcher adjusting a telescope and reviewing field sketches", "포켓몬 야간 생태 연구원", "special", "", "Nocturnal Pokémon researcher adjusting a telescope and reviewing field sketches at a quiet night observatory."], ["architecture_engineer", "Pokémon habitat designer arranging shelter scale models, nest materials and habitat plans on a studio table", "포켓몬 서식 공간 설계자", "special", "", "Pokémon habitat designer arranging shelter scale models, nest materials and habitat plans on a studio table."], ["renewable_engineer", "Electric-Pokémon behavior researcher arranging insulated resting pads and small monitoring instruments in a comfortable observation room", "전기 포켓몬 교감 연구원", "special", "", "Electric-Pokémon behavior researcher arranging insulated resting pads and small monitoring instruments in a comfortable observation room."], ["stage_rigging", "Pokémon Contest stage assistant placing rehearsal markers and checking decorative props beside a performance platform", "포켓몬 콘테스트 무대 스태프", "special", "", "Pokémon Contest stage assistant placing rehearsal markers and checking decorative props beside a performance platform."], ["orbital_logistics", "Pokémon travel-supply shopkeeper packing a route map, feed pouch and Poké Ball case", "포켓몬 여행 물품점 점원", "basic", "", "Pokémon travel-supply shopkeeper packing a route map, feed pouch and Poké Ball case at a wooden shop counter."], ["materials_lab", "Pokémon egg researcher checking a padded incubation nest and temperature monitor beside a field notebook", "포켓몬 알 연구원", "basic", "", "Pokémon egg researcher checking a padded incubation nest and temperature monitor beside a field notebook."], ["welding_fabricator", "Apricorn-ball craftsperson shaping an apricorn shell with hand tools", "규토리볼 공예가", "basic", "", "Apricorn-ball craftsperson shaping an apricorn shell with hand tools at a tidy Pokémon workshop bench."], ["crane_operator", "Pokémon ranch caretaker carrying a feed basket and arranging fresh straw in a sunlit shelter", "포켓몬 목장 돌봄 담당자", "basic", "", "Pokémon ranch caretaker carrying a feed basket and arranging fresh straw in a sunlit shelter."], ["firefighter", "Pokémon rescue ranger coiling a rescue rope and preparing a padded transport blanket", "포켓몬 구조대원", "popular", "", "Pokémon rescue ranger coiling a rescue rope and preparing a padded transport blanket at a mountain trail station."], ["hv_battery_tech", "Pokémon Center equipment attendant checking care-station connections and arranging cleaned trays in a service room", "포켓몬 센터 장비 관리원", "popular", "", "Pokémon Center equipment attendant checking care-station connections and arranging cleaned trays in a service room."], ["wind_turbine_tech", "Bird-Pokémon sanctuary keeper renewing nest lining and checking perches in a spacious aviary", "새 포켓몬 보호소 관리원", "popular", "", "Bird-Pokémon sanctuary keeper renewing nest lining and checking perches in a spacious aviary."], ["transit_control", "Pokémon League registration attendant arranging entrant kits and a match schedule", "포켓몬 리그 접수 담당자", "popular", "", "Pokémon League registration attendant arranging entrant kits and a match schedule at an arena reception desk; no readable text needed."], ["port_operations", "Pokémon port guide checking travel bags and a coastal route map beside a passenger ferry dock", "포켓몬 항구 여행 안내원", "popular", "", "Pokémon port guide checking travel bags and a coastal route map beside a passenger ferry dock."], ["surveyor_cartographer", "Pokémon expedition cartographer comparing a compass with a hand-drawn habitat map beside a trail marker", "포켓몬 탐험 지도 제작자", "popular", "", "Pokémon expedition cartographer comparing a compass with a hand-drawn habitat map beside a trail marker."], ["sonar_analyst", "Aquatic-Pokémon researcher listening through headphones while checking a hydrophone recorder", "물 포켓몬 생태 음향 연구원", "special", "", "Aquatic-Pokémon researcher listening through headphones while checking a hydrophone recorder at a calm lake pier."], ["avionics_tech", "Pokémon delivery-partner caretaker checking a mail satchel and flight harness", "포켓몬 배달 파트너 관리사", "popular", "", "Pokémon delivery-partner caretaker checking a mail satchel and flight harness at a village parcel station."], ["demolition_planner", "Pokémon fossil excavator gently brushing sediment from a fossil beside a gridded excavation tray", "포켓몬 화석 발굴가", "special", "", "Pokémon fossil excavator gently brushing sediment from a fossil beside a gridded excavation tray."], ["cold_chain", "Pokémon berry-supply worker sorting colorful berries into padded crates in a cool storeroom", "열매 저장·유통 담당자", "special", "", "Pokémon berry-supply worker sorting colorful berries into padded crates in a cool storeroom."], ["satellite_operator", "Pokémon migration researcher comparing seasonal habitat maps and observation photographs", "포켓몬 이동 경로 연구원", "popular", "", "Pokémon migration researcher comparing seasonal habitat maps and observation photographs at a research station."], ["forensic_engineer", "Pokémon fossil-restoration researcher aligning fossil fragments with soft brushes and a magnifier", "포켓몬 화석 복원 연구원", "special", "", "Pokémon fossil-restoration researcher aligning fossil fragments with soft brushes and a magnifier at a museum bench."], ["hazmat_specialist", "Poison-Pokémon habitat specialist using protective gloves to tend enclosure plants with ventilation and sealed sample containers", "독 포켓몬 생태 관리원", "special", "", "Poison-Pokémon habitat specialist using protective gloves to tend enclosure plants with ventilation and sealed sample containers."], ["simulator_instructor", "Pokémon battle coach arranging practice cones and demonstrating a calm training cue", "포켓몬 배틀 코치", "popular", "", "Pokémon battle coach arranging practice cones and demonstrating a calm training cue at an outdoor practice field."], ["archive_restorer", "Pokémon museum archivist handling an old field guide and specimen tray with cotton gloves in an archive room", "포켓몬 박물관 기록 보존가", "special", "", "Pokémon museum archivist handling an old field guide and specimen tray with cotton gloves in an archive room."], ["agri_drone", "Pokémon berry grower pruning a small tree and collecting ripe berries in a woven basket", "나무열매 재배가", "special", "", "Pokémon berry grower pruning a small tree and collecting ripe berries in a woven basket."], ["railway_engineer", "Pokémon travel-train attendant arranging luggage straps and a partner resting cushion in a carriage", "포켓몬 여행 열차 승무원", "special", "", "Pokémon travel-train attendant arranging luggage straps and a partner resting cushion in a carriage."], ["water_plant", "Pokémon wetland conservation worker testing water and collecting litter with tongs beside a reed-lined path", "포켓몬 습지 보호 활동가", "special", "", "Pokémon wetland conservation worker testing water and collecting litter with tongs beside a reed-lined path."], ["__custom__", "CUSTOM", "직접 입력", "special"]], "occupation_sensual": [["", "AUTO — source-appropriate profession", "AUTO — 원본 포켓몬에 어울리는 직업 자동", "basic"], ["fashion_project", "Pokémon Contest coordinator reviewing rehearsal props and a cue sheet backstage in tailored practical clothing", "콘테스트 코디네이터", "basic", "", "Pokémon Contest coordinator reviewing rehearsal props and a cue sheet backstage in tailored practical clothing."], ["night_lab", "Nocturnal Pokémon researcher sorting habitat photographs and sample cases", "야행성 포켓몬 연구원", "basic", "", "Nocturnal Pokémon researcher sorting habitat photographs and sample cases at a softly lit laboratory desk."], ["fashion_test_engineer", "Poké Ball case designer comparing shell finishes and fitting sample parts", "몬스터볼 공방 디자이너", "popular", "", "Poké Ball case designer comparing shell finishes and fitting sample parts at a Pokémon craft studio bench."], ["flight_supervisor", "Flying-Pokémon tour guide checking route notes and a passenger harness", "비행 포켓몬 투어 가이드", "popular", "", "Flying-Pokémon tour guide checking route notes and a passenger harness at a scenic landing terrace."], ["elite_paramedic", "Pokémon Center care supervisor organizing blankets and care trays in a clean treatment room, wearing an original practical uniform", "포켓몬 센터 케어 리더", "popular", "", "Pokémon Center care supervisor organizing blankets and care trays in a clean treatment room, wearing an original practical uniform."], ["drone_director", "Pokémon wildlife documentary director adjusting a tripod camera and reviewing habitat sketches", "포켓몬 생태 다큐 촬영감독", "popular", "", "Pokémon wildlife documentary director adjusting a tripod camera and reviewing habitat sketches at a field hide."], ["hightech_inspector", "Rotom-product designer comparing appliance prototypes and testing controls in a Pokémon design showroom", "로토무 제품 디자이너", "popular", "", "Rotom-product designer comparing appliance prototypes and testing controls in a Pokémon design showroom."], ["prototype_consultant", "Ride-Pokémon gear stylist fitting a travel harness and matching saddlebags in an equipment atelier", "라이드 장구 스타일리스트", "special", "", "Ride-Pokémon gear stylist fitting a travel harness and matching saddlebags in an equipment atelier."], ["luxury_yacht_tech", "Water-Pokémon resort caretaker preparing towels and a feeding tray beside a lagoon deck", "물 포켓몬 리조트 케어 담당자", "special", "", "Water-Pokémon resort caretaker preparing towels and a feeding tray beside a lagoon deck."], ["night_observatory", "Pokémon stargazing guide positioning a telescope and arranging constellation cards", "별 관측 투어 안내자", "special", "", "Pokémon stargazing guide positioning a telescope and arranging constellation cards at an outdoor observatory."], ["motion_stage_director", "Pokémon Contest performance director positioning stage props and indicating a rehearsal path under stage lights", "콘테스트 공연 연출가", "special", "", "Pokémon Contest performance director positioning stage props and indicating a rehearsal path under stage lights."], ["night_dispatch", "Pokémon travel-center manager arranging route maps and lodging brochures", "포켓몬 여행 안내소 매니저", "basic", "", "Pokémon travel-center manager arranging route maps and lodging brochures at an evening visitor desk."], ["test_pilot_brief", "Pokémon battle commentator checking a headset and reviewing match notes", "포켓몬 배틀 해설가", "popular", "", "Pokémon battle commentator checking a headset and reviewing match notes at an arena broadcast desk."], ["yacht_captain", "Water-Pokémon observation-boat guide checking binoculars and a marine habitat chart on deck", "물 포켓몬 관찰선 가이드", "popular", "", "Water-Pokémon observation-boat guide checking binoculars and a marine habitat chart on deck."], ["auction_specialist", "Pokémon artifact appraiser examining a vintage Poké Ball and travel tools with a jeweler's loupe", "포켓몬 도구 감정가", "popular", "", "Pokémon artifact appraiser examining a vintage Poké Ball and travel tools with a jeweler's loupe at a display table."], ["motorsport_engineer", "Pokémon battle referee checking signal flags and a match card beside a battle court in a practical original uniform", "포켓몬 배틀 심판", "popular", "", "Pokémon battle referee checking signal flags and a match card beside a battle court in a practical original uniform."], ["surgical_tech", "Pokémon groomer arranging brushes and clean towels beside a padded grooming platform in a salon", "포켓몬 그루머", "popular", "", "Pokémon groomer arranging brushes and clean towels beside a padded grooming platform in a salon."], ["stunt_coordinator", "Pokémon performance trainer setting hoops and floor markers for a controlled stage rehearsal", "포켓몬 퍼포먼스 트레이너", "special", "", "Pokémon performance trainer setting hoops and floor markers for a controlled stage rehearsal."], ["gallery_curator", "Pokémon natural-history curator arranging habitat illustrations and small models in a museum gallery", "포켓몬 생태 전시 큐레이터", "popular", "", "Pokémon natural-history curator arranging habitat illustrations and small models in a museum gallery."], ["helicopter_pilot", "Pokémon ranger team leader checking a field pack and a rescue route map", "포켓몬 레인저 현장 리더", "popular", "", "Pokémon ranger team leader checking a field pack and a rescue route map at a woodland station."], ["deep_dive_specialist", "Water-Pokémon dive researcher checking mask straps and a waterproof observation slate", "물 포켓몬 잠수 조사원", "special", "", "Water-Pokémon dive researcher checking mask straps and a waterproof observation slate at a shoreline research base."], ["broadcast_director", "Pokémon Contest reporter checking a microphone and interview notes backstage before a broadcast", "포켓몬 콘테스트 리포터", "special", "", "Pokémon Contest reporter checking a microphone and interview notes backstage before a broadcast."], ["perfume_developer", "Pokémon berry-fragrance artisan comparing berry peels and scent blotters", "나무열매 향 공방 조향사", "special", "", "Pokémon berry-fragrance artisan comparing berry peels and scent blotters at an elegant workshop counter."], ["armory_curator", "Pokémon cultural-museum curator placing apricorn balls and historic travel gear on padded display stands", "포켓몬 문화박물관 학예사", "special", "", "Pokémon cultural-museum curator placing apricorn balls and historic travel gear on padded display stands."], ["orbital_hotel", "Pokémon-friendly hotel concierge preparing a partner resting kit and a local route map", "포켓몬 동반 호텔 컨시어지", "special", "", "Pokémon-friendly hotel concierge preparing a partner resting kit and a local route map at the reception counter."], ["__custom__", "CUSTOM", "직접 입력", "special"]], "swimwear": [["", "AUTO", "자동", "basic"], ["classic_bikini", "Classic Bikini", "클래식 비키니", "basic", "f", "a navy high-waisted bikini with a supportive halter top"], ["sport_onepiece", "Sporty One-piece", "스포티 원피스", "basic", "f", "a sporty one-piece swimsuit with a racerback and a high neckline in solid performance fabric"], ["highleg_onepiece", "High-leg One-piece", "하이레그 원피스", "popular", "f", "a high-leg one-piece swimsuit with a high neckline and supportive racerback"], ["monokini", "Monokini", "모노키니", "popular", "f", "a sculptural monokini with asymmetric side cut-outs joined by a solid central panel"], ["triangle_bikini", "Triangle Bikini", "트라이앵글 비키니", "popular", "f", "a triangle bikini with slider cups and tie-side bottoms"], ["bandeau_bikini", "Bandeau Bikini", "반두 비키니", "popular", "f", "a bandeau bikini with a straight strapless top and matching bottoms"], ["halter_bikini", "Halter Bikini", "홀터 비키니", "popular", "f", "a halter bikini with a neck tie and a supportive underbust band"], ["asymmetric_swim", "Asymmetric One-shoulder Swimwear", "비대칭 원숄더 수영복", "popular", "f", "an asymmetric one-shoulder swimsuit with a single wide strap and a clean diagonal neckline"], ["crossstrap_swim", "Cross-strap Swimwear", "크로스 스트랩 수영복", "popular", "f", "a swimsuit with crossed back straps and a scooped front neckline"], ["moonlit_pool", "Moonlit Outdoor Pool", "달빛 야외풀", "special", "f", "in swimwear at an outdoor pool at night, lit by underwater lamps and moonlight"], ["rooftop_infinity_pool", "Rooftop Infinity Pool", "루프탑 인피니티 풀", "special", "f", "in swimwear at a rooftop infinity pool with the city skyline behind her"], ["outdoor_shower", "Outdoor Shower / Rinse-off", "야외 샤워 / 린스오프", "special", "f", "rinsing off at an open-air poolside shower after swimming, still in swimwear"], ["cabana_daybed", "Resort Cabana / Daybed", "리조트 카바나 / 데이베드", "special", "f", "seated at a resort cabana daybed in swimwear with an open cover-up, a book and a cold drink beside her"], ["thermal_spa", "Modern Thermal Spa Pool", "모던 온천 / 스파 풀", "special", "f", "in swimwear at a modern thermal spa pool, steam rising off the water"], ["shoreline_walk", "Wet Shoreline Walk", "젖은 해변 산책", "special", "f", "walking along a wet shoreline in swimwear, wet sand and shallow surf underfoot"], ["boyshort_swim", "Boyshort Swimwear", "보이쇼트 수영복", "popular", "f", "a boyshort swimsuit set with a fitted top and short square-cut bottoms"], ["rashguard_set", "Rashguard Set", "래시가드 세트", "popular", "f", "a long-sleeve rashguard with a zip front over matching swim bottoms"], ["wrap_swim", "Wrap-front Swimwear", "랩 프론트 수영복", "popular", "f", "a wrap-front swimsuit with a crossed bodice and a tie at the waist"], ["swim_coverup", "Swimwear + Cover-up", "수영복 + 커버업", "popular", "f", "swimwear worn under an open gauzy cover-up, tied loosely at the hip"], ["poolside_bar", "Poolside Bar", "풀사이드 바", "special", "f", "in swimwear at a poolside bar, a cold drink on the counter"], ["river_dock", "River Dock / Lake Pier", "강가 데크 / 호수 선착장", "special", "f", "in swimwear on a wooden river dock, feet over the edge above the water"], ["burkini_modest", "Modest Full-cover Swimwear", "부르키니 · 전신형", "popular", "f", "a modest full-cover swimsuit with long sleeves, full-length legs, and a fitted hood"], ["sarong_wrap", "Sarong Wrap over Swimwear", "사롱을 두른 수영복", "popular", "f", "swimwear with a printed sarong knotted at the hip"], ["yukata_poolside", "Yukata over Swimwear", "수영복 위 유카타", "popular", "f", "swimwear with a light yukata worn open over it, poolside"], ["heritage_pattern_swim", "Heritage-pattern Swimwear", "전통 문양 수영복", "special", "f", "a swimsuit in a heritage textile pattern with matching trim"], ["onsen_after", "Hot Spring, After Bath", "온천 후", "special", "f", "at an outdoor hot-spring bathing area after a soak, wrapped in a towel, steam and a stone basin around her"], ["hanbok_coverup", "Hanbok-line Cover-up", "한복 선을 딴 커버업", "special", "f", "swimwear under a hanbok-line cover-up with a high waist and wide flowing skirt"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "active": [["", "AUTO", "자동", "basic"], ["warmup", "Warm-up / Cool-down", "워밍업 / 쿨다운", "basic"], ["stretch", "Mobility Stretch Session", "모빌리티 스트레칭", "basic"], ["dance_transition", "Dance Practice Transition", "댄스 연습 중 전환 동작", "popular"], ["pilates", "Pilates / Core Session", "필라테스 / 코어 세션", "popular"], ["tennis_active", "Tennis-inspired Active Fashion", "테니스풍 액티브 패션", "popular"], ["basketball_jersey", "Loose Basketball Jersey Fashion", "루즈 농구저지 패션", "popular"], ["boxing_fitness", "Boxing Fitness Styling", "복싱 피트니스 스타일", "popular"], ["running_recovery", "Post-run Recovery", "러닝 후 리커버리", "popular"], ["parkour_stairs", "Stair / Parkour Transition", "계단 / 파쿠르 전환 동작", "special"], ["roller_skating", "Roller-skating Fashion", "롤러스케이트 패션", "special"], ["fencing_motion", "Fencing-inspired Movement Fashion", "펜싱풍 무브먼트 패션", "special"], ["climbing_warmup", "Climbing Warm-up", "클라이밍 워밍업", "special"], ["surf_prep", "Surf Preparation", "서핑 준비 장면", "special"], ["yoga_flow", "Yoga Flow", "요가 플로우", "popular"], ["cycling_kit", "Cycling Kit", "사이클링 복장", "popular"], ["track_sprint", "Track Sprint Start", "트랙 스타트 자세", "popular"], ["archery_draw", "Archery Draw", "활 당기는 순간", "special"], ["aerial_silk", "Aerial Silk Practice", "에어리얼 실크 연습", "special"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "source_editorial": [["", "AUTO — strongest source motif", "AUTO — 원본 포켓몬 대표 모티프 자동", "basic"], ["couture_gala", "Couture Gala Look", "쿠튀르 갈라 룩", "basic"], ["runway", "Runway Editorial", "런웨이 에디토리얼", "basic"], ["aerodynamic_couture", "Aerodynamic Layered Couture", "공기역학적 레이어드 쿠튀르", "popular"], ["metallic_asymmetry", "Metallic Asymmetric Tailoring", "메탈릭 비대칭 테일러링", "popular"], ["ceremonial_whitegold", "Ceremonial White / Gold Look", "의전풍 화이트 / 골드 룩", "popular"], ["cyber_street", "Cyber Street Editorial", "사이버 스트리트 에디토리얼", "popular"], ["deconstructed_frame", "Deconstructed Frame-line Couture", "프레임 라인 해체형 쿠튀르", "special"], ["floating_panel", "Floating-panel Inspired Couture", "플로팅 패널 영감 쿠튀르", "special"], ["luminous_circuit", "Luminous Circuit Editorial", "루미너스 서킷 에디토리얼", "special"], ["wing_light", "Wing-light / Kinetic Layer Editorial", "윙 라이트 / 키네틱 레이어 에디토리얼", "special"], ["heavy_architecture", "Heavy Architectural Tailoring", "중량감 있는 아키텍처럴 테일러링", "special"], ["stealth_monochrome", "Stealth Monochrome Editorial", "스텔스 모노크롬 에디토리얼", "special"], ["transformation_drape", "Transforming Drape Construction", "변형 구조 드레이프", "special"], ["orbital_ring", "Orbital Ring / Halo Geometry", "궤도 링 / 헤일로 지오메트리", "special"], ["thruster_flare", "Thruster-flare Hemline", "스러스터 플레어 헴라인", "popular", "f"], ["cockpit_harness", "Cockpit Harness Tailoring", "콕핏 하네스 테일러링", "popular"], ["camo_couture", "Camouflage Couture", "카모 쿠튀르", "special"], ["ceramic_plate", "Ceramic Plate Layering", "세라믹 플레이트 레이어링", "special"], ["heritage_couture", "Heritage × Source Couture", "전통 구조 + 원본 포켓몬색 쿠튀르", "popular"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "homewear": [["", "AUTO", "자동", "basic"], ["soft_tank_shorts", "Soft Tank Top + Shorts", "소프트 탱크탑 + 쇼츠", "basic", "f"], ["satin_lounge", "Satin Lounge Set", "새틴 라운지 세트", "basic", "f"], ["offshoulder_knit", "Off-shoulder Knit Homewear", "오프숄더 니트 홈웨어", "popular", "f"], ["camisole_wrap", "Camisole + Wrap Bottom", "캐미솔 + 랩 바텀", "popular", "f"], ["bralette_cardigan", "Bralette + Open Cardigan", "브라렛 + 오픈 가디건", "popular", "f"], ["one_shoulder_lounge", "One-shoulder Lounge Set", "원숄더 라운지 세트", "popular", "f"], ["backless_lounge", "Backless Lounge Look", "백리스 라운지 룩", "special", "f"], ["after_bath", "After-bath Homewear", "목욕 후 홈웨어", "special", "f"], ["window_vanity", "Window-side Vanity Moment", "창가 화장대 순간", "special", "f"], ["late_night_kitchen", "Late-night Kitchen Homewear", "늦은 밤 주방 홈웨어", "special", "f"], ["laundry_lounge", "Laundry / Bedding Lounge Scene", "빨래 / 침구 정리 라운지 장면", "special", "f"], ["sunroom_lounge", "Sunroom Lounge Fashion", "선룸 라운지 패션", "special", "f"], ["oversized_shirt", "Oversized Shirt Homewear", "오버사이즈 셔츠 홈웨어", "popular", "f"], ["hoodie_shorts", "Cropped Hoodie + Shorts", "크롭 후디 + 쇼츠", "popular", "f"], ["knit_dress_home", "Soft Knit Dress", "소프트 니트 원피스", "popular", "f"], ["robe_morning", "Morning Robe", "아침 로브", "popular", "f"], ["floor_cushion", "Floor Cushion Lounging", "바닥 쿠션에서 뒹굴기", "special", "f"], ["home_workout", "Home Stretch Corner", "집 안 스트레칭 코너", "special", "f"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "private_evening": [["", "AUTO", "자동", "basic"], ["slip_dress", "Slip Dress Evening", "슬립 드레스 이브닝", "basic", "f"], ["cocktail_mini", "Cocktail Mini Dress", "칵테일 미니드레스", "basic", "f"], ["one_shoulder_satin", "One-shoulder Satin Evening", "원숄더 새틴 이브닝", "popular", "f"], ["low_back_evening", "Low-back Evening Dress", "로우백 이브닝 드레스", "popular", "f"], ["after_party", "After-party Styling", "애프터파티 스타일링", "popular", "f"], ["hotel_evening", "Hotel Room Evening", "호텔룸 이브닝", "popular", "f"], ["balcony_night", "Night Balcony Mood", "야간 발코니 무드", "popular", "f"], ["mirror_touchup", "Mirror Touch-up", "거울 앞 메이크업 수정", "special", "f"], ["opera_night", "Opera / Theater Night Styling", "오페라 / 극장 나이트 스타일", "special", "f"], ["penthouse_window", "Penthouse Window Mood", "펜트하우스 창가 무드", "special", "f"], ["silk_robe_evening", "Silk Robe over Evening Base", "이브닝 베이스 위 실크 로브", "special", "f"], ["velvet_evening", "Velvet Evening Dress", "벨벳 이브닝 드레스", "popular", "f"], ["halter_evening", "Halter-neck Evening", "홀터넥 이브닝", "popular", "f"], ["high_slit_gown", "High-slit Gown", "하이슬릿 가운", "popular", "f"], ["wine_bar", "Wine Bar Corner", "와인바 구석 자리", "special", "f"], ["night_drive", "Night Drive Passenger Seat", "야간 드라이브 조수석", "special", "f"], ["heritage_evening", "Traditional Formal Evening", "전통 정장 차림의 저녁", "popular", "f"], ["tea_ceremony_night", "Evening Tea Ceremony", "저녁 다례", "special", "f"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "lingerie": [["", "AUTO", "자동", "basic"], ["lace_set", "Lace Lingerie Set", "레이스 란제리 세트", "basic", "f", "a black lace lingerie set with a longline top, high-waisted bottoms, and geometric lace trim"], ["satin_set", "Satin Lingerie Set", "새틴 란제리 세트", "basic", "f", "a satin lingerie set with a smooth bias-cut top and matching bottoms in a single deep colour"], ["bralette_highwaist", "Bralette + High-waist Bottom", "브라렛 + 하이웨이스트 바텀", "popular", "f", "a soft-cup bralette with wide supportive straps and matching high-waisted lingerie bottoms"], ["bustier_inspired", "Bustier-inspired Lingerie", "뷔스티에풍 란제리", "popular", "f", "a bustier-inspired satin lingerie top with a long structured bodice and vertical seam detailing"], ["bodysuit", "Lingerie Bodysuit", "란제리 보디수트", "popular", "f", "a lingerie bodysuit with a scooped neckline, wide shoulder straps, and lace side panels"], ["garter_set", "Garter-inspired Styling", "가터풍 스타일링", "popular", "f", "a lingerie set with decorative garter straps, worn as styling detail"], ["corset_lingerie", "Corset-inspired Lingerie", "코르셋풍 란제리", "popular", "f", "a corset-inspired lingerie bodice with visible boning seams and a matching high-waisted piece"], ["open_shirt_lingerie", "Open Shirt over Lingerie", "란제리 위 오픈 셔츠", "special", "f", "a tailored oversized shirt worn open over a matching satin lingerie set"], ["night_robe", "Night Robe + Lingerie", "나이트 로브 + 란제리", "special", "f", "a lingerie set worn under an open silk night robe with a tied sash"], ["back_strap", "Back-strap Lingerie", "백스트랩 란제리", "special", "f", "a lingerie set with a decorative strap arrangement across the upper back"], ["asymmetric_lingerie", "Asymmetric Lingerie Set", "비대칭 란제리 세트", "special", "f", "an asymmetric lingerie set with one shoulder strap, a diagonal neckline, and matching high-waisted bottoms"], ["slip_lingerie", "Lingerie Slip", "란제리 슬립", "popular", "f", "a bias-cut satin lingerie slip with narrow straps and a straight hem"], ["babydoll", "Babydoll", "베이비돌", "popular", "f", "a babydoll lingerie slip with narrow shoulder straps, an empire waist, and a softly flared hem"], ["longline_bra", "Longline Bra Set", "롱라인 브라 세트", "popular", "f", "a longline bra set with a wide supportive underband and matching high-waisted bottoms"], ["knit_lingerie", "Knit-blend Lingerie", "니트 혼방 란제리", "special", "f", "a knit-blend lingerie set in soft ribbed jersey with a relaxed cropped top"], ["morning_lingerie", "Morning-light Lingerie", "아침 햇살 란제리", "special", "f", "a simple cotton lingerie set in morning window light, sheets and a mug nearby"], ["juban_inspired", "Juban-inspired Silk Layer", "나가주반 응용 실크 레이어", "popular", "f", "a juban-inspired silk underlayer with a wrapped front and a narrow sash"], ["hanbok_slip", "Hanbok Underlayer-inspired Set", "속적삼·속치마 응용 세트", "popular", "f", "a hanbok underlayer-inspired lingerie set with a short wrapped top and a full high-waisted skirt"], ["qipao_silk_set", "Qipao-inspired Silk Set", "치파오 응용 실크 세트", "popular", "f", "a qipao-inspired silk lingerie set with a mandarin collar and frog-button closures"], ["embroidered_corset", "Folk-embroidered Corset", "민속 자수 코르셋", "special", "f", "a folk-embroidered corset with structured boning and colourful thread work over a matching piece"], ["kebaya_lace", "Kebaya-inspired Lace Top", "크바야 응용 레이스 상의", "special", "f", "a kebaya-inspired sheer lace top with fine floral embroidery over a fitted camisole"], ["sari_blouse_set", "Sari Blouse-inspired Set", "사리 블라우스 응용 세트", "special", "f", "a sari blouse-inspired lingerie set with a short fitted top and a draped lower piece"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "everyday_basic": [["", "AUTO", "자동", "basic"], ["commute_train", "Train / Subway Commute", "지하철 / 기차 통근", "basic"], ["grocery_run", "Grocery Run", "장보기", "basic"], ["simple_cooking", "Simple Cooking", "간단한 요리", "basic"], ["cafe_takeout", "Coffee / Takeout Run", "커피 / 테이크아웃", "popular"], ["laundry", "Laundry / Folding Clothes", "세탁 / 빨래 개기", "popular"], ["rain_walk", "Rainy Day Walk", "비 오는 날 걷기", "popular"], ["station_wait", "Waiting at Station", "역에서 기다리기", "popular"], ["bookstore", "Bookstore Browsing", "서점 구경", "popular"], ["parcel_pickup", "Parcel / Convenience-store Pickup", "택배 / 편의점 픽업", "popular"], ["midnight_laundromat", "Midnight Laundromat", "심야 코인세탁방", "special"], ["greenhouse", "Greenhouse / Plant Shop", "온실 / 식물가게", "special"], ["pottery_class", "Pottery / Craft Class", "도예 / 공예 클래스", "special"], ["record_store", "Vinyl Record Store", "레코드숍", "special"], ["hardware_store", "Hardware / Home-improvement Store", "철물 / 홈센터", "special"], ["hanbok_errand", "Modern Traditional Daily Errand", "생활한복 차림의 외출", "popular"], ["festival_daily", "Local Festival Day", "지역 축제날", "special"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "everyday_sensual": [["", "AUTO", "자동", "basic"], ["morning_stretch", "Morning Stretch", "아침 스트레칭", "basic", "", "stretching her shoulders beside a sunlit window just after opening the curtains"], ["window_light", "Window-light Casual Moment", "창가 자연광 캐주얼 순간", "basic", "", "standing in casual clothes in the light of a large window, one hand on the frame"], ["late_snack", "Late-night Snack / Drink", "늦은 밤 간식 / 음료", "popular", "", "eating a late-night snack at the kitchen counter in loungewear"], ["high_shelf", "Reaching to a High Shelf", "높은 선반 손 뻗기", "popular", "", "reaching for a storage box on a high kitchen shelf, shown from an eye-level three-quarter view"], ["hair_tie", "Tying Hair after Shower", "샤워 후 머리 묶기", "popular", "", "tying her hair up after a shower, wearing a soft robe in a bright bathroom"], ["laundry_soft", "Laundry with Soft Fashion Reveal", "소프트 패션 리빌 세탁 장면", "popular", "", "folding laundry at home in soft loungewear, a cardigan slipping loosely off one shoulder"], ["sunroom_relax", "Sunroom Relaxation", "선룸 휴식", "popular", "", "curled on a sunroom sofa in soft knitwear with a blanket and a book"], ["balcony_plants", "Watering Balcony Plants", "발코니 식물 물주기", "popular", "", "watering balcony plants in a fitted knit dress, morning light across the railing"], ["rainy_return", "Returning Home after Rain", "비 맞고 귀가한 순간", "special", "", "coming in from the rain and slipping off a damp raincoat in the entryway, hair slightly wet"], ["floor_organizing", "Floor-level Closet Organizing", "바닥에 앉아 옷장 정리", "special", "", "kneeling on the floor to sort folded clothes into a low drawer"], ["after_work_change", "Changing Outer Layers after Work", "퇴근 후 겉옷 정리", "special", "", "hanging up a work jacket and changing into home wear just after getting in"], ["fridge_light", "Refrigerator-light Late-night Moment", "냉장고 불빛 늦은 밤 순간", "special", "", "standing at the open refrigerator late at night, lit only by its interior light"], ["shoe_bench", "Sitting to Tie Shoes", "신발 신으려 앉은 순간", "popular", "", "sitting on the entryway bench to tie her shoes before going out"], ["mirror_selfie", "Full-length Mirror Check", "전신거울 앞 옷매무새", "popular", "", "checking her outfit in a full-length mirror, phone raised"], ["window_rain", "Watching Rain from Window", "창밖 비 구경", "popular", "", "watching rain run down the window from an armchair, mug in hand"], ["stair_landing", "Stair Landing Pause", "계단 참에서 잠깐 멈춤", "special", "", "pausing on a stair landing with one hand on the railing"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "traditional": [["auto_traditional", "Auto — Match Ethnicity", "계통에 맞춰 자동 선택", "basic"], ["hanbok_formal", "Hanbok — Formal", "한복(한국) · 정장", "popular"], ["hanbok_daily", "Hanbok — Modern Daily", "생활한복(한국) · 일상형", "popular"], ["kimono_formal", "Kimono — Formal", "기모노(일본) · 정장", "popular"], ["yukata_daily", "Yukata — Summer Casual", "유카타(일본) · 여름 일상", "popular"], ["hanfu_formal", "Hanfu — Formal", "한푸(중국) · 정장", "popular"], ["qipao_daily", "Qipao — Modern Daily", "치파오(중국) · 현대형", "popular", "f"], ["aodai_daily", "Áo Dài", "아오자이(베트남)", "popular", "f"], ["sari_formal", "Sari — Formal", "사리(인도) · 정장", "popular", "f"], ["lehenga_formal", "Lehenga", "레헹가(인도)", "special", "f"], ["salwar_daily", "Salwar Kameez — Daily", "살와르 카미즈(인도·파키스탄) · 일상", "special", "f"], ["abaya_modern", "Modern Abaya", "아바야(아라비아반도) · 현대형", "popular", "f"], ["kaftan_daily", "Kaftan — Resort Daily", "카프탄(북아프리카·중동) · 리조트 일상", "special"], ["thobe_inspired", "Thobe-inspired Dress", "토브(아라비아반도) 응용 드레스", "special"], ["dirndl_modern", "Modern Dirndl", "디른들(독일·오스트리아) 현대형", "special", "f"], ["folk_embroidery", "Folk Embroidery Blouse", "자수 블라우스(동유럽)", "special", "f"], ["kente_modern", "Kente-patterned Modern Dress", "켄테(가나) 무늬 현대 드레스", "popular", "f"], ["boubou_flow", "Flowing Boubou", "부부(서아프리카) · 흐르는 실루엣", "special"], ["huipil_modern", "Modern Huipil", "우이필(중미) 현대형", "special", "f"], ["poncho_andes", "Andean Woven Layer", "안데스(페루·볼리비아) 직조 레이어", "special"], ["kilt_inspired", "Kilt-inspired Skirt", "킬트(스코틀랜드) 응용 스커트", "special"], ["kebaya_daily", "Kebaya — Daily", "크바야(인도네시아) · 일상", "special", "f"], ["barong_inspired", "Barong-inspired Sheer Top", "바롱(필리핀) 응용 시스루 상의", "special"], ["caftan_evening", "Traditional Evening Layering", "전통 이브닝 레이어링(지역은 계통에 따름)", "popular"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "wildcard": [["", "AUTO", "자동", "basic"], ["festival_night", "Night Festival Cut", "야간 페스티벌 컷", "basic"], ["rain_editorial", "Rain Editorial", "비 오는 에디토리얼", "popular"], ["arcade_night", "Night Arcade Styling", "야간 아케이드 스타일", "popular"], ["ferry_deck", "Ferry / Ship Deck Fashion", "페리 / 선박 데크 패션", "popular"], ["retro_motel", "Retro Motel Mood", "레트로 모텔 무드", "special"], ["desert_resort", "Desert Resort Fashion", "사막 리조트 패션", "special"], ["futuristic_spa", "Futuristic Spa", "퓨처리스틱 스파", "special"], ["observatory_night", "Night Observatory", "야간 천문대", "special"], ["greenhouse_afterdark", "Greenhouse after Dark", "심야 온실", "special"], ["rooftop_cinema", "Rooftop Cinema", "루프탑 시네마", "special"], ["winter_lodge", "Winter Lodge Fashion", "겨울 로지 패션", "special"], ["art_studio", "After-hours Art Studio", "영업 종료 후 아트 스튜디오", "special"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "__custom__": [["", "AUTO", "자동", "basic"], ["__custom__", "CUSTOM", "직접 입력", "special"]], "partner_care": [["", "AUTO", "자동 — 이 갈래에 맞는 장면", "basic"], ["care_feeding", "Offering a small berry treat to a Pokémon companion beside a feeding bowl in a quiet garden.", "간식 건네기", "basic", "", "Offering a small berry treat to a Pokémon companion beside a feeding bowl in a quiet garden."], ["care_brushing", "Gently brushing a Pokémon companion on a grooming mat, with a towel and a small brush basket nearby.", "브러싱 시간", "basic", "", "Gently brushing a Pokémon companion on a grooming mat, with a towel and a small brush basket nearby."], ["care_walk", "Walking along a park path beside a curious Pokémon companion, carrying a small treat pouch.", "함께 산책", "basic", "", "Walking along a park path beside a curious Pokémon companion, carrying a small treat pouch."], ["care_rain_shelter", "Wiping rain from a Pokémon companion with a towel under a covered porch, umbrellas resting nearby.", "비 그치길 기다리기", "basic", "", "Wiping rain from a Pokémon companion with a towel under a covered porch, umbrellas resting nearby."], ["care_nap", "Resting beside a sleeping Pokémon companion on a shaded picnic blanket with a closed book nearby.", "낮잠 지켜보기", "basic", "", "Resting beside a sleeping Pokémon companion on a shaded picnic blanket with a closed book nearby."], ["care_play", "Rolling a soft toy ball toward a playful Pokémon companion in an enclosed grassy courtyard.", "장난감 놀이", "basic", "", "Rolling a soft toy ball toward a playful Pokémon companion in an enclosed grassy courtyard."], ["__custom__", "CUSTOM", "직접 입력", "basic"]], "travel_exploration": [["", "AUTO", "자동 — 이 갈래에 맞는 장면", "basic"], ["travel_trail", "Pausing at a forest trail junction to compare a folded map with a trail marker, wearing a light travel pack.", "숲길 지도 확인", "basic", "", "Pausing at a forest trail junction to compare a folded map with a trail marker, wearing a light travel pack."], ["travel_station", "Waiting on a rural station bench with a travel bag, holding a snack and checking a route card.", "여행 열차 기다리기", "basic", "", "Waiting on a rural station bench with a travel bag, holding a snack and checking a route card."], ["travel_camp", "Folding a camping blanket beside a small tent and a neatly arranged cooking kit at a quiet campsite.", "캠프 정리", "basic", "", "Folding a camping blanket beside a small tent and a neatly arranged cooking kit at a quiet campsite."], ["travel_lakeside", "Taking a water break on a flat lakeside rock, with walking shoes and a travel bag clearly grounded.", "호숫가 쉬어가기", "basic", "", "Taking a water break on a flat lakeside rock, with walking shoes and a travel bag clearly grounded."], ["travel_lookout", "Looking through binoculars from a hilltop lookout, with a folded habitat map in a side pocket.", "전망대 풍경 감상", "basic", "", "Looking through binoculars from a hilltop lookout, with a folded habitat map in a side pocket."], ["travel_coast", "Examining shells and small tracks on a beach while making a quick sketch in a travel notebook.", "해변 탐사 산책", "basic", "", "Examining shells and small tracks on a beach while making a quick sketch in a travel notebook."], ["__custom__", "CUSTOM", "직접 입력", "basic"]], "food_berries": [["", "AUTO", "자동 — 이 갈래에 맞는 장면", "basic"], ["food_harvest", "Picking ripe berries from a small tree and placing them in a woven basket in a sunny garden.", "나무열매 따기", "basic", "", "Picking ripe berries from a small tree and placing them in a woven basket in a sunny garden."], ["food_poffin", "Mixing Poffin batter in a bowl at a home kitchen counter, with berries and a baking tray nearby.", "포핀 만들기", "basic", "", "Mixing Poffin batter in a bowl at a home kitchen counter, with berries and a baking tray nearby."], ["food_pokeblock", "Preparing colorful Pokéblock-inspired berry treats with a cutting board and small food molds at home.", "포켓몬 간식 준비", "basic", "", "Preparing colorful Pokéblock-inspired berry treats with a cutting board and small food molds at home."], ["food_picnic", "Unpacking a picnic lunch and sliced berries on a blanket beside a travel basket.", "피크닉 도시락", "basic", "", "Unpacking a picnic lunch and sliced berries on a blanket beside a travel basket."], ["food_tea", "Pouring warm berry tea into a cup at a small kitchen table with a teapot and sliced fruit.", "열매차 우리기", "basic", "", "Pouring warm berry tea into a cup at a small kitchen table with a teapot and sliced fruit."], ["food_market", "Choosing fresh berries at a village market stall and placing them into a paper shopping bag.", "열매 시장 장보기", "basic", "", "Choosing fresh berries at a village market stall and placing them into a paper shopping bag."], ["__custom__", "CUSTOM", "직접 입력", "basic"]], "festivals_contests": [["", "AUTO", "자동 — 이 갈래에 맞는 장면", "basic"], ["fest_lantern", "Walking through a lantern festival with a small snack, wearing comfortable event clothing with subtle Pokémon motifs.", "등불 축제 산책", "basic", "", "Walking through a lantern festival with a small snack, wearing comfortable event clothing with subtle Pokémon motifs."], ["fest_ribbon", "Comparing decorative ribbons at a Pokémon Contest preparation table beside a compact accessory case.", "콘테스트 리본 고르기", "basic", "", "Comparing decorative ribbons at a Pokémon Contest preparation table beside a compact accessory case."], ["fest_cheering", "Clapping from a Pokémon tournament spectator seat, with a small pennant resting on a bag.", "관중석 응원", "basic", "", "Clapping from a Pokémon tournament spectator seat, with a small pennant resting on a bag."], ["fest_booth", "Browsing handmade Pokémon-themed charms at a festival booth and lifting one for a closer look.", "축제 부스 구경", "basic", "", "Browsing handmade Pokémon-themed charms at a festival booth and lifting one for a closer look."], ["fest_rehearsal", "Practicing a simple presentation gesture with a ribbon prop backstage before a Pokémon Contest.", "무대 전 가벼운 연습", "basic", "", "Practicing a simple presentation gesture with a ribbon prop backstage before a Pokémon Contest."], ["fest_fireworks", "Waiting for festival fireworks at a riverside seating area, holding a drink with a small bag beside her.", "불꽃놀이 기다리기", "basic", "", "Waiting for festival fireworks at a riverside seating area, holding a drink with a small bag beside her."], ["__custom__", "CUSTOM", "직접 입력", "basic"]], "hobbies_leisure": [["", "AUTO", "자동 — 이 갈래에 맞는 장면", "basic"], ["hobby_reading", "Turning a page of an illustrated Pokémon field guide while seated by a window with a cup of tea.", "도감 읽기", "basic", "", "Turning a page of an illustrated Pokémon field guide while seated by a window with a cup of tea."], ["hobby_sketch", "Sketching habitat plants and Pokémon tracks in a notebook on a park bench.", "생태 스케치", "basic", "", "Sketching habitat plants and Pokémon tracks in a notebook on a park bench."], ["hobby_craft", "Threading beads into a small Pokémon-inspired travel charm at a hobby table with tidy craft tools.", "여행 부적 만들기", "basic", "", "Threading beads into a small Pokémon-inspired travel charm at a hobby table with tidy craft tools."], ["hobby_music", "Practicing a small acoustic instrument in a cozy room with a music stand and a resting cushion nearby.", "악기 연습", "basic", "", "Practicing a small acoustic instrument in a cozy room with a music stand and a resting cushion nearby."], ["hobby_photo", "Sorting printed habitat photographs beside a camera and a travel scrapbook at a cafe table.", "산책 사진 고르기", "basic", "", "Sorting printed habitat photographs beside a camera and a travel scrapbook at a cafe table."], ["hobby_gardening", "Watering small berry seedlings on a windowsill and trimming a dry leaf with gardening scissors.", "창가 화분 돌보기", "basic", "", "Watering small berry seedlings on a windowsill and trimming a dry leaf with gardening scissors."], ["__custom__", "CUSTOM", "직접 입력", "basic"]], "everyday": [["", "AUTO", "자동", "basic"], ["commute_train", "Train / Subway Commute", "지하철 / 기차 통근", "basic"], ["grocery_run", "Grocery Run", "장보기", "basic"], ["simple_cooking", "Simple Cooking", "간단한 요리", "basic"], ["cafe_takeout", "Coffee / Takeout Run", "커피 / 테이크아웃", "popular"], ["laundry", "Laundry / Folding Clothes", "세탁 / 빨래 개기", "popular"], ["rain_walk", "Rainy Day Walk", "비 오는 날 걷기", "popular"], ["station_wait", "Waiting at Station", "역에서 기다리기", "popular"], ["bookstore", "Bookstore Browsing", "서점 구경", "popular"], ["parcel_pickup", "Parcel / Convenience-store Pickup", "택배 / 편의점 픽업", "popular"], ["midnight_laundromat", "Midnight Laundromat", "심야 코인세탁방", "special"], ["greenhouse", "Greenhouse / Plant Shop", "온실 / 식물가게", "special"], ["pottery_class", "Pottery / Craft Class", "도예 / 공예 클래스", "special"], ["record_store", "Vinyl Record Store", "레코드숍", "special"], ["hardware_store", "Hardware / Home-improvement Store", "철물 / 홈센터", "special"], ["hanbok_errand", "Modern Traditional Daily Errand", "생활한복 차림의 외출", "popular"], ["festival_daily", "Local Festival Day", "지역 축제날", "special"], ["__custom__", "CUSTOM", "직접 입력", "special"]]};

  const GROUP_LABELS = {"basic": "기본 / Standard", "popular": "대중 / Popular", "special": "특수 / Unusual"};

  const EXPRESSION_DETAIL = {
    calm:'relaxed brow, softly open eyes, lips closed and unstrained, no smile',
    focused:'slightly drawn brow, narrowed steady eyes fixed on one point, mouth firmly closed',
    soft_smile:'faint upward pull at the mouth corners, lips together, warmth reaching the lower eyelids',
    half_smile:'one mouth corner lifted higher than the other, lips closed, gaze slightly to the side',
    playful:'asymmetric grin with teeth just showing, one brow raised, eyes narrowed with amusement',
    confident:'level brow, direct unhurried gaze, chin slightly raised, mouth closed and composed',
    sensual:'heavy-lidded eyes, lips slightly parted and relaxed, brow smooth, chin a little lowered',
    provocative:'direct challenging gaze under lowered lids, one brow raised, mouth corner tugged in a slight smirk',
    sleepy:'heavy drooping eyelids, unfocused gaze, softened slack mouth, brow low and relaxed',
    candid:'caught mid-motion, eyes off camera, mouth in an unposed in-between shape',
    mildly_annoyed:'inner brows drawn together, one eye slightly narrowed, mouth pressed flat to one side',
    surprised:'raised brows, widened eyes with visible upper white, mouth open in a small round shape',
    curious:'one brow raised higher, head tilted, eyes wide and attentive, lips slightly parted',
    serious:'level lowered brow, steady unblinking gaze, mouth closed in a straight line, jaw set',
    amused:'crinkled lower eyelids, closed-lip smile pushing the cheeks up, brows relaxed',
    bored:'lidded half-open eyes looking away, slack mouth, brows flat and unengaged',
    pensive:'gaze angled down and away, slightly furrowed brow, lips lightly pressed or touched',
    smug:'one mouth corner lifted, lids lowered in a knowing look, chin tipped slightly up',
    gentle:'softly lowered brows, warm relaxed eyes, faint closed-lip smile, no tension anywhere',
    determined:'brows pulled down and in, hard forward gaze, jaw clenched, mouth a tight line',
    exhausted:'drooping lids and brows, dull unfocused gaze, mouth slightly open and slack, shoulders of the face fallen',
    nostalgic:'soft distant gaze past the camera, faint wistful half-smile, brows gently raised at the inner ends',
    unimpressed:'flat level brows, half-lidded deadpan stare, mouth in a straight unmoved line',
    flustered:'raised inner brows, darting or averted eyes, mouth slightly open, faint blush across the cheeks and nose',
    proud:'chin lifted, brows level, eyes bright and steady, closed-lip smile with a firm mouth',
    wistful:'gaze softened and directed slightly upward or away, faint sad smile, inner brows raised',
    mischievous:'narrowed sparkling eyes, one brow up, closed-lip grin pushed to one side',
    relieved:'brows released upward and outward, eyes half closed, breath-out mouth slightly open, whole face loosened',
    cold_smile:'mouth smiling while the eyes stay flat and unsmiling, brows level, gaze direct and unwarm',
    laughing:'head tipped back slightly, eyes squeezed nearly shut, mouth open wide with teeth showing, cheeks raised high',
    laughing_open:'mouth open wide in a laugh with teeth showing and cheeks raised, but the eyes stay open and engaged \u2014 lids only slightly narrowed, gaze still readable rather than squeezed shut'
  };

  const EXPRESSION_OPTIONS = [
    ['', 'AUTO — 자동'],
    ['calm', 'calm — 차분함'],
    ['focused', 'focused — 집중'],
    ['soft_smile', 'soft smile — 옅은 미소'],
    ['half_smile', 'half-smile — 은은한 미소'],
    ['playful', 'playful — 장난기'],
    ['confident', 'confident — 자신감'],
    ['sensual', 'sensual — 자연스러운 섹시'],
    ['provocative', 'provocative — 도발적이되 비노출'],
    ['sleepy', 'sleepy — 졸린 느낌'],
    ['candid', 'candid — 생활감'],
    ['mildly_annoyed', 'mildly annoyed — 약간 짜증'],
    ['surprised', 'surprised — 놀람'],
    ['curious', 'curious — 호기심'],
    ['serious', 'serious — 진지함'],
    ['amused', 'amused — 재미있어하는'],
    ['bored', 'bored — 심드렁함'],
    ['pensive', 'pensive — 생각에 잠긴'],
    ['smug', 'smug — 우쭐한'],
    ['gentle', 'gentle — 온화함'],
    ['determined', 'determined — 결의에 찬'],
    ['exhausted', 'exhausted — 지친'],
    ['nostalgic', 'nostalgic — 아련한'],
    ['unimpressed', 'unimpressed — 시큰둥함'],
    ['flustered', 'flustered — 당황한'],
    ['proud', 'proud — 자랑스러운'],
    ['wistful', 'wistful — 그리운 듯한'],
    ['mischievous', 'mischievous — 짓궂은'],
    ['relieved', 'relieved — 안도한'],
    ['cold_smile', 'cold smile — 차가운 미소'],
    ['laughing', 'laughing — 소리내어 웃는 · 눈 감김'],
    ['laughing_open', 'laughing, eyes open — 소리내어 웃는 · 눈 뜬 채']
  ];

  const ORIENTATION_OPTIONS = [
    ['', 'AUTO — 자동'],
    ['front', 'front — 정면'],
    ['front_3q', 'front three-quarter — 앞 3/4'],
    ['side', 'side profile — 측면'],
    ['rear_3q', 'rear three-quarter — 뒤 3/4'],
    ['back', 'back view — 뒷태'],
    ['over_shoulder', 'over shoulder — 뒤돌아보기'],
    ['seated_twist', 'seated twist — 앉은 비틀기'],
    ['walking_away', 'walking away — 멀어지는 방향'],
    ['turning_midmotion', 'turning mid-motion — 움직임 중 회전'],
    ['low_angle', 'low angle — 아래에서 올려다본 각도'],
    ['high_angle', 'high angle — 위에서 내려다본 각도'],
    ['leaning_forward', 'leaning forward — 앞으로 기울인 상체'],
    ['leaning_back', 'leaning back — 뒤로 젖힌 상체'],
    ['crouching', 'crouching — 쪼그린 자세'],
    ['reclining', 'reclining — 기대 누운 자세'],
    ['reaching_up', 'reaching up — 위로 손 뻗기'],
    ['looking_down', 'looking down — 시선을 아래로'],
    ['looking_away', 'looking away — 시선을 밖으로'],
    ['back_to_camera', 'back to camera — 완전히 등진 자세'],
    ['profile_close', 'close profile — 측면 근접'],
    ['three_quarter_back', 'three-quarter back — 뒤 3/4 강조']
  ];

  const POSE_OPTIONS = [["", "자동 — 장면에 맞게"], ["standing_relaxed", "편하게 선 자세"], ["standing_formal", "반듯하게 서기"], ["contrapposto", "한쪽 다리에 무게 싣기"], ["hand_on_hip", "허리에 손"], ["arms_crossed", "팔짱"], ["sitting", "의자에 앉기"], ["sitting_floor", "바닥에 앉기"], ["kneeling", "무릎을 댄 자세"], ["leaning_wall", "벽에 기대기"], ["leaning_furniture", "가구에 기대기"], ["walking", "걷기"], ["mid_stride", "걸음 중간"], ["stretching", "기지개"], ["bending_over", "상체 숙이기"], ["on_tiptoe", "발끝 세우기"], ["hands_in_hair", "머리 정리하기"], ["carrying_something", "물건 들기"], ["mid_action", "동작 한가운데"], ["squatting", "쪼그려 앉기"], ["one_knee_up", "한쪽 무릎 세워 앉기"], ["side_sitting", "다리를 옆으로 두고 앉기"], ["cross_legged", "책상다리로 앉기"], ["perched_seat", "걸터앉기"], ["turning_back", "돌아보는 순간"], ["waving", "가볍게 손 흔들기"], ["holding_cup", "컵 들고 쉬기"], ["reading_book", "책 읽기"], ["offering_food", "간식 건네기"], ["gentle_pat", "쓰다듬기"], ["watering", "물 주기"], ["preparing_food", "음식 준비하기"], ["taking_photo", "사진 찍기"], ["adjusting_bag", "가방끈 고쳐 메기"], ["checking_map", "지도 펼쳐 보기"], ["small_jog", "가벼운 조깅"], ["dance_step", "작은 댄스 스텝"]];

  const EX_NOTE = {"classic_bikini": "상하의가 나뉜 가장 기본적인 비키니.", "sport_onepiece": "경영복에 가까운 스포티한 원피스 수영복.", "highleg_onepiece": "다리 라인이 골반 위까지 파인 원피스.", "monokini": "원피스인데 옆구리나 배 쪽이 크게 뚫린 형태. 조각이 이어져 있어 비키니는 아니다.", "triangle_bikini": "상의 컵이 삼각형이고 목 뒤로 끈을 묶는 형태.", "bandeau_bikini": "어깨끈 없이 가슴을 가로로 감싸는 튜브형 상의.", "halter_bikini": "목 뒤로 끈을 걸어 어깨선을 드러내는 상의.", "asymmetric_swim": "한쪽 어깨만 덮는 비대칭 구조.", "crossstrap_swim": "등이나 가슴 앞에서 끈이 교차하는 구조.", "boyshort_swim": "하의가 짧은 반바지 형태라 엉덩이를 더 덮는다.", "rashguard_set": "긴팔 또는 반팔 상의로 팔까지 덮는 서핑용 세트.", "wrap_swim": "앞자락을 겹쳐 여미는 랩 구조의 수영복.", "swim_coverup": "수영복 위에 얇은 셔츠나 사롱을 걸친 상태.", "lace_set": "레이스 소재의 브라와 하의 세트.", "satin_set": "광택 있는 새틴 소재 세트.", "bralette_highwaist": "와이어 없는 브라렛에 배꼽 위까지 오는 하의를 맞춘 조합.", "bustier_inspired": "가슴부터 허리까지 이어진 상의. 코르셋보다 짧고 조임이 약하다.", "bodysuit": "상하의가 하나로 붙은 원피스형 란제리.", "garter_set": "허벅지에 두르는 밴드로 스타킹을 고정하는 구성.", "corset_lingerie": "허리를 조여 실루엣을 만드는 뻣뻣한 구조물. 뷔스티에보다 길고 단단하다.", "open_shirt_lingerie": "란제리 위에 셔츠를 걸치고 단추를 잠그지 않은 상태.", "night_robe": "란제리 위에 얇은 가운을 덧입은 구성.", "back_strap": "등 쪽 끈 배치가 장식이 되는 디자인.", "asymmetric_lingerie": "좌우 구조가 다른 비대칭 세트.", "slip_lingerie": "어깨끈이 가는 민소매 원피스형. 잠옷과 속옷의 중간.", "babydoll": "가슴 아래부터 퍼지는 짧고 하늘하늘한 형태.", "longline_bra": "브라 밑단이 갈비뼈 아래까지 내려오는 긴 형태.", "soft_tank_shorts": "민소매 상의에 짧은 하의를 맞춘 가장 기본적인 실내복.", "satin_lounge": "광택 있는 상하의 세트. 파자마보다 격이 있다.", "offshoulder_knit": "어깨가 흘러내리는 니트 상의.", "camisole_wrap": "가는 끈 상의에 감아 입는 하의를 맞춘 조합.", "bralette_cardigan": "브라렛 위에 가디건을 걸치고 여미지 않은 상태.", "one_shoulder_lounge": "한쪽 어깨만 덮는 실내복 세트.", "backless_lounge": "등이 크게 트인 실내복.", "oversized_shirt": "몸보다 큰 셔츠 한 장을 원피스처럼 입은 차림.", "hoodie_shorts": "배가 드러나는 짧은 후디에 쇼츠를 맞춘 조합.", "knit_dress_home": "몸에 붙는 부드러운 니트 원피스.", "robe_morning": "아침에 가운만 걸친 상태.", "slip_dress": "어깨끈이 가늘고 몸을 따라 흐르는 원피스.", "cocktail_mini": "무릎 위로 짧은 정장풍 드레스.", "one_shoulder_satin": "한쪽 어깨만 덮는 새틴 드레스.", "low_back_evening": "앞은 단정하고 등이 크게 파인 드레스.", "velvet_evening": "벨벳 특유의 묵직한 광택이 나는 드레스.", "halter_evening": "목 뒤로 끈을 걸어 어깨와 등을 드러내는 드레스.", "high_slit_gown": "긴 드레스에 다리까지 트임이 들어간 형태.", "event_staff": "행사 진행요원풍 의상. 실제 유니폼이 아니라 이벤트용 해석.", "uniform_inspired": "제복의 요소만 빌린 스타일. 특정 기관을 특정할 수 없게 한다.", "bunny": "몸에 붙는 원피스형에 토끼 귀와 커프스를 더한 고전적 코스튬.", "casino_dealer": "조끼·나비넥타이·소매 밴드 같은 딜러 요소를 쓴 스타일.", "lab_roleplay": "가운과 실험 도구를 소품으로 쓰는 연구실 역할극.", "retro_racer": "70~80년대 레이싱 이벤트풍 의상.", "vinyl_stage": "광택 있는 비닐 소재의 무대 의상.", "masquerade": "가면무도회풍. 가면과 장식이 중심.", "circus_ringmaster": "긴 재킷과 실크햇을 쓴 서커스 단장풍.", "aerodynamic_couture": "공기 흐름을 형상화한 겹겹의 재단.", "metallic_asymmetry": "금속 광택 원단으로 좌우를 다르게 재단한 옷.", "ceremonial_whitegold": "흰색과 금색을 쓴 의전복풍.", "deconstructed_frame": "원본 포켓몬 내부 프레임 선을 옷의 절개선으로 옮긴 형태.", "floating_panel": "원본 포켓몬 판넬처럼 몸에서 살짝 떠 있는 조각들.", "luminous_circuit": "회로 형태의 발광 라인이 들어간 옷.", "wing_light": "날개나 바인더를 빛나는 레이어로 번역한 형태.", "heavy_architecture": "건축물처럼 구조가 무겁고 각진 재단.", "stealth_monochrome": "무광 검정 계열 단색으로 통일한 스타일.", "transformation_drape": "변형기구를 접히고 펼쳐지는 드레이프로 옮긴 형태.", "orbital_ring": "원본 포켓몬의 링·헤일로 구조를 장신구나 실루엣으로 옮긴 형태.", "thruster_flare": "스러스터 분사를 밑단이 퍼지는 형태로 번역.", "cockpit_harness": "조종석 하네스를 벨트 장식으로 옮긴 재단.", "pilates": "매트나 기구 위에서 코어를 쓰는 동작.", "basketball_jersey": "몸보다 큰 농구 유니폼을 헐렁하게 입은 차림.", "parkour_stairs": "계단이나 난간을 넘는 순간의 동작.", "aerial_silk": "천에 매달려 자세를 잡는 공중 동작.", "archery_draw": "활시위를 당겨 정지한 순간.", "auto_traditional": "계통 설정을 보고 어울리는 전통 의상을 알아서 고른다.", "hanbok_formal": "한국 한복. 저고리와 치마의 비율, 고름 매듭, 배래선을 지킨 정장형.", "hanbok_daily": "한국 한복의 구조만 남기고 길이와 소재를 현대화한 생활한복.", "kimono_formal": "일본 기모노. 오비를 갖춘 정식 형태로, 옷깃 여밈 방향까지 지킨다.", "yukata_daily": "일본의 여름용 홑겹 기모노. 축제·저녁 산책에 어울린다.", "hanfu_formal": "중국 한푸. 교령·유군 같은 특유의 여밈과 층 구성.", "qipao_daily": "중국 치파오(청삼). 입식 칼라와 옆트임을 살린 현대적 형태.", "aodai_daily": "긴 상의에 통 넓은 바지를 받쳐 입는 베트남 전통복.", "sari_formal": "인도 사리. 한 장의 천을 감아 두르는 방식과 어깨 드레이프가 핵심.", "lehenga_formal": "인도 레헹가. 긴 치마 + 짧은 상의 + 두파타 세 겹 구성.", "salwar_daily": "인도·파키스탄 지역의 살와르 카미즈. 통 넓은 바지에 긴 튜닉을 걸친 일상 차림.", "abaya_modern": "아라비아반도의 아바야. 몸을 감싸는 긴 겉옷을 현대적으로 재단한 형태.", "kaftan_daily": "북아프리카·중동 지역의 카프탄. 품이 넉넉하고 소매가 넓은 원피스형 겉옷.", "thobe_inspired": "아라비아반도 토브의 직선 재단과 자수를 응용한 드레스.", "dirndl_modern": "독일·오스트리아의 디른들. 보디스 + 앞치마 구조를 현대적으로 다듬은 형태.", "folk_embroidery": "동유럽 민속 자수를 살린 블라우스.", "kente_modern": "가나 켄테 직조 무늬를 현대 드레스에 옮긴 형태.", "boubou_flow": "서아프리카의 넓고 길게 흐르는 겉옷.", "huipil_modern": "중미의 사각 재단 상의와 자수 문양.", "poncho_andes": "안데스 직조 천을 겹쳐 두른 레이어.", "kilt_inspired": "스코틀랜드 킬트의 타탄 주름과 여밈 구조를 응용한 스커트.", "kebaya_daily": "인도네시아 크바야. 몸에 붙는 자수 상의 + 사롱 조합.", "barong_inspired": "비치는 원단에 자수를 넣은 필리핀풍 상의.", "caftan_evening": "전통 겉옷을 이브닝 룩으로 겹쳐 입은 구성.", "heritage_couture": "전통 의상의 구조·여밈을 원본 포켓몬 색으로 옮긴 쿠튀르.", "hanbok_errand": "생활한복 차림으로 장을 보거나 나들이하는 장면.", "heritage_evening": "전통 정장을 갖춰 입고 나선 저녁 자리.", "burkini_modest": "머리부터 발목까지 덮는 모디스트 수영복. 노출 없이 물놀이 상황을 만든다.", "sarong_wrap": "수영복 위에 전통 사롱 천을 허리에 둘러 묶은 차림.", "yukata_poolside": "수영복 위에 유카타를 걸친 온천·여름 축제 분위기.", "heritage_pattern_swim": "켄테·이카트·자수 같은 전통 문양을 현대 수영복에 옮긴 형태.", "onsen_after": "온천에서 나온 직후. 수건과 유카타, 젖은 머리.", "hanbok_coverup": "저고리 깃과 고름 선을 응용한 비치 커버업.", "juban_inspired": "기모노 속옷인 나가주반의 여밈과 실루엣을 응용한 실크 레이어.", "hanbok_slip": "속적삼과 속치마의 층 구성을 현대 란제리로 옮긴 세트.", "qipao_silk_set": "입식 칼라와 매듭 단추를 살린 실크 상하 세트.", "embroidered_corset": "동유럽 민속 자수를 얹은 코르셋.", "kebaya_lace": "크바야 특유의 몸에 붙는 자수 레이스 상의를 응용.", "sari_blouse_set": "사리의 짧은 블라우스와 페티코트 구성을 응용한 세트.", "office_project": "서식지 지도와 관찰 기록을 정리해 조사 일정을 준비해요.", "field_surveyor": "숲에서 발자국과 흔적을 살피고 생태를 기록해요.", "industrial_inspector": "울타리와 쉼터를 점검해 포켓몬의 생활 공간을 돌봐요.", "drone_operator": "카메라로 서식지를 촬영하고 관찰 지점을 기록해요.", "aviation_control": "착륙 쉼터에서 여행용 짐과 비행 경로를 확인해요.", "rescue_paramedic": "진료대 옆에서 담요와 케어 도구를 준비해요.", "test_engineer": "작업대에서 몬스터볼의 잠금장치를 정비해요.", "robotics_researcher": "로토무용 생활 기기의 작동 상태를 살펴요.", "mobility_tuner": "승용 안장과 가방끈을 체형에 맞춰 손질해요.", "marine_technician": "수조 옆에서 먹이와 수질 검사 도구를 준비해요.", "observatory_engineer": "별빛 아래 관측 장비와 야행성 관찰 기록을 확인해요.", "architecture_engineer": "크기가 다른 쉼터 모형과 둥지 재료를 배치해요.", "renewable_engineer": "휴식용 패드와 관측 기기로 전기 타입의 생활 반응을 살펴요.", "stage_rigging": "공연장 뒤편에서 소품과 발판을 준비해요.", "orbital_logistics": "여행 가방에 지도·먹이·몬스터볼 파우치를 챙겨요.", "materials_lab": "완충 둥지와 온도계를 갖춘 관찰 공간을 점검해요.", "welding_fabricator": "규토리 껍질을 깎고 작은 부품을 맞춰요.", "crane_operator": "목장에 먹이와 짚을 옮기고 쉼터를 정리해요.", "firefighter": "산길 구조 거점에서 로프와 운반 담요를 정리해요.", "hv_battery_tech": "센터에서 케어 장비의 연결부와 세척 상태를 확인해요.", "wind_turbine_tech": "높은 횃대와 둥지 재료를 손질해요.", "transit_control": "대회장 데스크에서 참가용품과 경기 일정을 정리해요.", "port_operations": "선착장에서 승선용 짐과 항로 지도를 확인해요.", "surveyor_cartographer": "현장에서 산길과 포켓몬 서식 구역을 지도에 옮겨요.", "sonar_analyst": "물가에서 수중 마이크와 기록 장비를 확인해요.", "avionics_tech": "배달 가방과 비행용 하네스를 점검해요.", "demolition_planner": "발굴지에서 붓으로 화석 주변의 흙을 털어요.", "cold_chain": "종류별 열매를 분류하고 상자에 담아요.", "satellite_operator": "관찰 사진과 지도로 계절별 이동 경로를 비교해요.", "forensic_engineer": "작업대에서 화석 조각을 맞추고 상태를 기록해요.", "hazmat_specialist": "장갑과 환기 장비를 갖추고 서식 식물을 관리해요.", "simulator_instructor": "연습장에서 표식과 훈련 도구로 동작을 설명해요.", "archive_restorer": "장갑을 끼고 오래된 생태 도감과 표본을 살펴요.", "agri_drone": "열매나무를 가지치기하고 익은 열매를 수확해요.", "railway_engineer": "열차 안에서 여행객용 짐칸과 휴식 공간을 정리해요.", "water_plant": "습지에서 수질을 살피고 작은 쓰레기를 수거해요.", "fashion_project": "무대 뒤에서 연습 순서와 소품을 확인하는 세련된 직업컷이에요.", "night_lab": "야간 연구실에서 관찰 자료를 정리해요.", "fashion_test_engineer": "공방에서 케이스 소재와 부품을 조합해요.", "flight_supervisor": "전망대에서 이동 경로와 여행 장구를 준비해요.", "elite_paramedic": "센터에서 케어 물품을 점검하는 차분한 업무 장면이에요.", "drone_director": "야외 촬영장에서 카메라와 관찰 동선을 확인해요.", "hightech_inspector": "쇼룸에서 로토무 기기의 형태와 조작부를 살펴요.", "prototype_consultant": "라이드용 가방과 하네스를 실용적으로 조합해요.", "luxury_yacht_tech": "수변 리조트에서 휴식용 타월과 먹이를 준비해요.", "night_observatory": "밤의 전망대에서 망원경과 관측 지도를 펼쳐요.", "motion_stage_director": "공연 무대에서 동선과 조명을 맞춰요.", "night_dispatch": "저녁 안내소에서 노선 지도와 숙소 자료를 정리해요.", "test_pilot_brief": "경기장 중계석에서 헤드셋과 경기 자료를 준비해요.", "yacht_captain": "배 위에서 쌍안경과 해양 관찰 지도를 확인해요.", "auction_specialist": "확대경으로 오래된 몬스터볼과 여행 도구를 살펴요.", "motorsport_engineer": "경기장 가장자리에서 심판 깃발과 진행표를 준비해요.", "surgical_tech": "브러시와 타월을 정리하고 손질 공간을 준비해요.", "stunt_coordinator": "연습 무대에서 링과 표식을 배치해요.", "gallery_curator": "생태 그림과 모형을 전시대에 배치해요.", "helicopter_pilot": "숲의 거점에서 탐험 장비와 구조 지도를 확인해요.", "deep_dive_specialist": "해변 거점에서 잠수 장비와 기록판을 준비해요.", "broadcast_director": "대회장 뒤편에서 마이크와 취재 자료를 확인해요.", "perfume_developer": "열매 껍질과 향 재료를 작은 병에 나눠 담아요.", "armory_curator": "여행 도구와 규토리볼을 전시용 받침에 올려요.", "orbital_hotel": "로비에서 파트너용 휴식 키트와 여행 지도를 준비해요.", "care_feeding": "낮은 먹이 그릇 옆에서 파트너에게 작은 간식을 건네요.", "care_brushing": "손질용 브러시와 타월을 두고 파트너를 부드럽게 빗겨요.", "care_walk": "길가의 냄새나 풍경을 살피는 파트너와 천천히 걸어요.", "care_rain_shelter": "처마 아래에서 파트너의 물기를 닦으며 비를 피해요.", "care_nap": "편안한 쉼터에서 잠든 파트너 옆에 앉아 쉬어요.", "care_play": "안전한 마당에서 작은 공이나 장난감으로 함께 놀아요.", "travel_trail": "갈림길에서 지도와 이정표를 번갈아 살펴요.", "travel_station": "역 벤치에서 짐과 간식을 챙기며 열차를 기다려요.", "travel_camp": "텐트 옆에서 담요나 취사 도구를 정리해요.", "travel_lakeside": "물가의 돌에 앉아 물병을 들고 잠깐 쉬어요.", "travel_lookout": "난간 옆에서 쌍안경으로 멀리 펼쳐진 지형을 살펴요.", "travel_coast": "해변에서 조개와 발자국을 관찰하며 기록해요.", "food_harvest": "작은 나무에서 잘 익은 열매를 골라 바구니에 담아요.", "food_poffin": "앞치마를 두르고 반죽을 섞거나 구운 포핀을 정리해요.", "food_pokeblock": "색이 다른 열매를 잘라 먹기 좋은 간식을 준비해요.", "food_picnic": "피크닉 매트 위에서 도시락과 과일을 펼쳐요.", "food_tea": "주전자와 찻잔을 놓고 향긋한 열매차를 따라요.", "food_market": "시장에서 열매의 상태를 살피고 종이봉투에 담아요.", "fest_lantern": "등불 사이를 걸으며 작은 축제 간식을 들어요.", "fest_ribbon": "작은 소품 테이블에서 색과 소재가 다른 리본을 비교해요.", "fest_cheering": "대회장 관중석에서 박수치며 경기를 응원해요.", "fest_booth": "가판대의 작은 공예품을 살펴보고 하나를 집어 들어요.", "fest_rehearsal": "무대 뒤에서 소품을 들고 차분히 동작을 맞춰요.", "fest_fireworks": "강변에 앉아 음료를 들고 저녁 하늘을 바라봐요.", "hobby_reading": "편한 의자에서 도감의 그림을 보며 페이지를 넘겨요.", "hobby_sketch": "공원에서 식물이나 포켓몬의 흔적을 관찰하며 그려요.", "hobby_craft": "작업 테이블에서 작은 비즈와 끈으로 장식을 만들어요.", "hobby_music": "방 안에서 작은 악기를 연주하며 리듬을 맞춰요.", "hobby_photo": "테이블 위의 카메라와 사진을 보며 여행 기록을 정리해요.", "hobby_gardening": "실내 화분에 물을 주고 잎을 손질해요.", "seasonal_night": "계절이 드러나는 옷차림으로 저녁 거리를 걷거나 쉬어요.", "travel_cut": "숙소나 여행지에서 짐을 정리하고 잠깐 쉬는 장면이에요.", "festival_night": "밤 축제에서 간식을 들거나 부스를 구경해요.", "unexpected_contrast": "평소 의외의 장소와 소품을 조합하되 한 가지 생활 동작을 중심으로 해요.", "retro_future": "복고풍 생활용품과 미래적인 공간을 섞어 일상을 그려요.", "rainy_city": "비 젖은 도시에서 우산을 접거나 처마 아래 잠깐 멈춰요.", "weekend_market": "주말 시장의 가판대에서 물건을 고르고 장바구니에 담아요.", "late_studio": "늦은 시간 작업실에서 도구를 정리하거나 작품을 살펴요.", "rooftop_wind": "바람 부는 옥상에서 옷자락이나 머리카락을 정리해요.", "seaside_offseason": "한산한 바닷가를 걷거나 벤치에서 바다를 바라봐요.", "neon_alley": "간판 불빛이 비치는 골목에서 길을 찾거나 음료를 들어요.", "snow_evening": "눈 내리는 저녁에 목도리를 고쳐 매거나 따뜻한 컵을 들어요.", "adult_police": "경찰복의 재단을 차용한 이벤트 의상을 입고 소품을 정리해요.", "adult_nurse": "간호복에서 따온 이벤트 의상의 단추와 액세서리를 손질해요.", "adult_maid": "메이드풍 앞치마와 장식이 있는 이벤트 의상으로 준비 동작을 해요.", "adult_secretary": "셔츠와 재킷을 조합한 비서풍 이벤트 의상을 정돈해요.", "flight_attendant": "승무원풍 스카프와 재킷을 갖춘 이벤트 스타일이에요.", "ceremonial_instructor": "장식 재킷과 단정한 소품을 갖춘 행사 진행자풍 의상이에요.", "adult_teacher": "셔츠·카디건·책을 조합한 교사풍 이벤트 스타일이에요.", "adult_librarian": "책과 안경을 소품으로 사용하는 사서풍 이벤트 스타일이에요.", "cheer_costume": "움직임에 맞는 치어 의상과 응원 소품을 준비해요.", "cabin_crew_retro": "복고풍 모자와 스카프로 객실승무원 스타일을 표현해요.", "moonlit_pool": "달빛이 비치는 야외 수영장 가장자리에서 쉬어요.", "rooftop_infinity_pool": "옥상 수영장에서 도시 풍경과 수면이 함께 보여요.", "outdoor_shower": "수영복을 착용한 채 수영 후 물기를 씻어내요.", "cabana_daybed": "카바나 그늘에서 타월과 음료를 두고 쉬어요.", "thermal_spa": "수영복 차림으로 온천형 스파 풀에서 휴식해요.", "shoreline_walk": "얕은 물이 밀려오는 해변을 천천히 걸어요.", "poolside_bar": "수영장 옆 바에서 음료를 받거나 잠깐 쉬어요.", "river_dock": "강이나 호수의 데크에서 수영을 준비해요.", "warmup": "운동 전후에 팔과 다리를 가볍게 풀어요.", "stretch": "관절의 움직임이 읽히도록 몸을 천천히 늘여요.", "dance_transition": "춤 연습 중 무게중심을 옮기는 순간을 보여줘요.", "tennis_active": "라켓을 들고 공을 받기 전의 준비 동작을 해요.", "boxing_fitness": "운동용 글러브를 착용하고 기본 스텝이나 가드를 연습해요.", "running_recovery": "달리기를 마친 뒤 호흡을 고르거나 물을 마셔요.", "roller_skating": "롤러스케이트로 균형을 잡으며 천천히 이동해요.", "fencing_motion": "펜싱복의 움직임과 발의 스텝을 중심으로 표현해요.", "climbing_warmup": "실내 암벽 앞에서 손을 풀고 장비를 점검해요.", "surf_prep": "물가에서 보드를 챙기고 서핑 장비를 정돈해요.", "yoga_flow": "매트 위에서 자연스러운 요가 동작을 이어가요.", "cycling_kit": "사이클링 복장으로 자전거와 헬멧을 점검해요.", "track_sprint": "트랙에서 출발을 준비하며 낮게 중심을 잡아요.", "couture_gala": "포켓몬의 색과 형태를 반영한 정교한 드레스로 행사를 준비해요.", "runway": "의상의 실루엣과 재단이 잘 드러나는 런웨이 걸음이에요.", "cyber_street": "포켓몬 모티프를 미래적인 스트리트 의상에 옮겨요.", "camo_couture": "몸의 무늬를 위장무늬 같은 패션 패턴으로 재해석해요.", "ceramic_plate": "매끈한 장식 소재를 겹쳐 의복의 구조를 강조해요.", "after_bath": "목욕 후 홈웨어를 입고 타월이나 머리카락을 정리해요.", "window_vanity": "창가 화장대에서 빗이나 액세서리를 사용해요.", "late_night_kitchen": "홈웨어 차림으로 늦은 밤 음료나 간식을 준비해요.", "laundry_lounge": "집에서 세탁물이나 침구를 접고 정리해요.", "sunroom_lounge": "햇빛이 드는 실내에서 책이나 음료와 함께 쉬어요.", "floor_cushion": "바닥 쿠션에 편하게 기대어 휴식해요.", "home_workout": "집의 작은 운동 공간에서 몸을 가볍게 풀어요.", "after_party": "행사가 끝난 뒤 겉옷이나 액세서리를 정리해요.", "hotel_evening": "호텔 방에서 저녁 외출을 준비하거나 짐을 풀어요.", "balcony_night": "밤의 발코니에서 음료를 들고 바깥을 바라봐요.", "mirror_touchup": "거울 앞에서 립 메이크업이나 머리 모양을 다듬어요.", "opera_night": "극장에 갈 차림으로 코트와 작은 가방을 챙겨요.", "penthouse_window": "큰 창가에서 도시 야경을 보며 잠깐 쉬어요.", "silk_robe_evening": "이브닝 의상 위에 실크 로브를 걸치고 옷매무새를 정리해요.", "wine_bar": "와인바의 구석 자리에서 잔과 메뉴를 살펴요.", "night_drive": "차의 조수석에서 밤 풍경을 바라보는 장면이에요.", "tea_ceremony_night": "저녁의 조용한 공간에서 찻잔과 다구를 정돈해요.", "knit_lingerie": "니트 질감이 드러나는 란제리풍 의상을 불투명한 소재로 표현해요.", "morning_lingerie": "아침 빛 속에서 란제리풍 의상의 겹침과 소재를 보여줘요.", "commute_train": "대중교통에서 손잡이를 잡거나 가방을 챙기며 이동해요.", "grocery_run": "가게에서 식재료를 고르고 장바구니에 담아요.", "simple_cooking": "주방에서 재료를 썰거나 간단한 음식을 만들어요.", "cafe_takeout": "카페에서 테이크아웃 컵을 받거나 뚜껑을 정리해요.", "laundry": "세탁물을 꺼내거나 테이블 위에서 접어요.", "rain_walk": "우산을 들고 비 오는 길을 천천히 걸어요.", "station_wait": "역에서 가방과 시간을 확인하며 교통편을 기다려요.", "bookstore": "서가 앞에서 책 한 권을 꺼내 살펴봐요.", "parcel_pickup": "편의점이나 수령대에서 작은 택배 상자를 받아요.", "midnight_laundromat": "늦은 시간 세탁실에서 빨래 바구니와 세제를 정리해요.", "greenhouse": "온실이나 식물가게에서 잎을 살피고 화분을 고르세요.", "pottery_class": "공방에서 흙을 빚거나 도구로 작은 작품을 다듬어요.", "record_store": "음반 가게에서 재킷을 넘겨 보며 음반을 골라요.", "hardware_store": "생활 수리에 필요한 작은 공구나 재료를 살펴요.", "festival_daily": "지역 축제에 편한 옷차림으로 나가 먹거리와 가판대를 구경해요.", "morning_stretch": "아침에 편한 실내복으로 팔과 어깨를 가볍게 늘여요.", "window_light": "창가에서 책이나 음료를 들고 자연스럽게 쉬어요.", "late_snack": "늦은 밤 주방에서 간식이나 음료를 꺼내요.", "high_shelf": "높은 선반의 물건을 꺼내려고 팔을 위로 뻗어요.", "hair_tie": "편한 옷을 입고 양손으로 젖은 머리를 묶어요.", "laundry_soft": "부드러운 생활복 차림으로 빨래를 접거나 건조대에 걸어요.", "sunroom_relax": "햇빛이 드는 방에서 몸을 기대고 잠깐 쉬어요.", "balcony_plants": "발코니의 화분에 물을 주고 잎을 살펴요.", "rainy_return": "집에 들어와 젖은 겉옷과 우산을 정리해요.", "floor_organizing": "바닥에 앉아 옷이나 수납함을 차례로 정리해요.", "after_work_change": "퇴근 후 재킷을 벗어 옷걸이에 걸고 가방을 내려놓아요.", "fridge_light": "냉장고를 열고 늦은 밤 먹을 음료나 간식을 골라요.", "shoe_bench": "현관 벤치에 앉아 신발 끈이나 버클을 정리해요.", "mirror_selfie": "전신거울 앞에서 옷매무새를 살피거나 휴대폰을 들어요.", "window_rain": "실내 창가에서 빗방울을 바라보며 쉬어요.", "stair_landing": "계단참에서 걸음을 멈추고 가방이나 머리카락을 정리해요.", "rain_editorial": "비와 우산을 활용해 의상의 재단과 움직임을 보여줘요.", "arcade_night": "밤의 오락실에서 게임을 하거나 작은 경품을 살펴요.", "ferry_deck": "배의 갑판에서 난간 곁에 서서 바람을 맞아요.", "retro_motel": "복고풍 숙소에서 여행 가방과 옷을 정리해요.", "desert_resort": "건조한 풍경의 리조트에서 그늘을 찾아 쉬어요.", "futuristic_spa": "미래적인 휴식 공간에서 가운이나 타월을 정돈해요.", "observatory_night": "야간 천문대에서 망원경과 별자리를 살펴요.", "greenhouse_afterdark": "밤의 온실에서 식물을 관찰하거나 물을 줘요.", "rooftop_cinema": "옥상 상영회에서 담요와 간식을 챙기며 영화를 기다려요.", "winter_lodge": "겨울 산장에서 겉옷을 정리하고 따뜻한 음료를 들어요.", "art_studio": "작업이 끝난 공방에서 도구와 작품을 정돈해요."};

  const CAT_KO = {"auto_random": "카테고리를 지정하지 않고 GPT가 알아서 고른다. 무엇이 나올지 예측이 어려운 대신 매번 다른 결과가 나온다.", "adult_roleplay": "직업을 소재로 한 성인 코스튬 패션. 실제 제복이 아니라 이벤트용 의상처럼 보이게 한다. 실제 계급장·무기·전술장비는 나오지 않는다.", "occupation_basic": "포켓몬 돌봄·연구·열매 재배·콘테스트·여행을 돕는 직업 장면. 도구와 작업 동작으로 역할을 보여줘요. 선택한 인물의 외모를 유지하고 고유한 작업복을 입혀요.", "occupation_sensual": "포켓몬 돌봄·연구·열매 재배·콘테스트·여행을 돕는 직업 장면. 도구와 작업 동작으로 역할을 보여줘요. 실용성을 유지하면서 재단과 자세로 세련된 분위기를 더해요.", "everyday_basic": "꾸미지 않은 생활 장면. 연출된 화보가 아니라 우연히 찍힌 순간처럼 보이게 한다. 평범한 현대 옷차림.", "everyday_sensual": "같은 생활 장면에 옷의 드레이프·어깨·허리·조명으로 분위기를 얹는다. 상황 자체는 여전히 평범해야 하고 란제리 화보가 되면 안 된다.", "swimwear": "수영장·해변·물가에서 현대적인 수영복과 자연스러운 움직임을 보여줘요.", "active": "실제 움직임이 보이는 액티브웨어. 헬스장 스냅 같은 뻔한 컷을 피하고 동작·천의 흐름·실루엣을 강조한다.", "source_editorial": "포켓몬의 색·무늬·실루엣을 일상 패션이나 쿠튀르로 옮겨요. 장갑을 그대로 입히는 갈래는 아니에요.", "homewear": "집에서 입는 옷이되 디자인된 홈웨어. 밋밋한 잠옷과 소파에 앉은 정적인 포즈를 피하고 생활 동작을 넣는다.", "private_evening": "성인의 사적인 저녁 시간. 우아하고 세련된 이브닝 스타일링과 호텔·발코니·거울 앞 같은 사적인 맥락.", "lingerie": "란제리풍 패션. 중요 부위는 전부 가린 채로 프레이밍·실루엣·자세·조명으로 분위기를 만든다.", "everyday": "평범한 생활 동작과 편한 옷차림을 중심으로 한 장면이에요.", "wildcard": "새로운 장소와 활동을 자유롭게 조합해 한 장면을 만들어요.", "__custom__": "카테고리를 직접 문장으로 적는다. 아래 입력란에 원하는 방향을 그대로 쓰면 된다.", "traditional": "그 캐릭터의 계통에 맞는 전통 의상. 정장형과 현대화된 일상형 중에서 고른다. 고증을 지키되 색은 원본 포켓몬을 따를 수 있다.", "partner_care": "먹이 주기·브러싱·휴식처럼 포켓몬과 함께하는 가까운 일상을 그려요.", "travel_exploration": "숲길·역·호숫가에서 이동하고 쉬는 여행 장면이에요. 전투보다 탐험과 휴식을 중심으로 해요.", "food_berries": "열매 수확부터 포핀 만들기·피크닉까지 음식과 손동작이 보이는 장면이에요.", "festivals_contests": "축제 구경·응원·무대 준비처럼 행사에 참여하는 일상을 그려요.", "hobbies_leisure": "독서·그림·공예·음악처럼 평소 취향이 드러나는 조용한 장면이에요."};

  const ADV_AXIS = {"overall_intensity": "이 장면의 스타일링과 분위기를 얼마나 강하게 표현할지 정해요.", "pair_gap": "각 쌍에서 앞 컷과 뒤 컷의 강도 차이.", "outfit_variety": "여섯 컷의 의상이 서로 얼마나 달라야 하는지.", "scene_variety": "장소와 상황이 서로 얼마나 달라야 하는지.", "pose_variety": "자세와 몸의 방향이 서로 얼마나 달라야 하는지.", "camera_variety": "카메라 거리와 각도가 얼마나 달라야 하는지.", "skin_exposure": "가슴·골반을 제외한 부위의 노출 정도.", "separates_preference": "상하의가 나뉜 옷을 얼마나 선호할지. 원피스 쏠림을 막는다.", "action_level": "쉬는 장면부터 활발한 움직임까지 동작의 크기를 정해요.", "direct_gaze_limit": "카메라를 정면으로 보는 컷을 최대 몇 개까지 둘지.", "smile_limit": "미소 짓는 컷을 최대 몇 개까지 둘지. 표정이 하나로 수렴하는 걸 막는다.", "unexpected_cuts": "예상 밖 발상의 컷을 몇 개 섞을지.", "source_influence": "원본 포켓몬의 색·무늬·형태를 의상과 소품에 얼마나 반영할지 정해요."};

  const ADV_VAL={"overall_intensity": {"restrained": "절제", "sensual": "자연스럽게 관능적", "bold": "과감", "strong": "가장 강함"}, "pair_gap": {"small": "차이 거의 없음", "medium": "적당한 차이", "strong": "뚜렷한 차이", "extreme": "극단적 대비"}, "outfit_variety": {"normal": "보통", "high": "많이 다르게", "extreme": "전부 다르게"}, "scene_variety": {"normal": "보통", "high": "많이 다르게", "extreme": "전부 다르게"}, "pose_variety": {"normal": "보통", "high": "많이 다르게", "extreme": "전부 다르게"}, "camera_variety": {"normal": "보통", "high": "많이 다르게", "extreme": "전부 다르게"}, "skin_exposure": {"low": "적게", "moderate": "보통", "bold": "많이"}, "separates_preference": {"balanced": "균형", "prefer separates": "분리형 선호", "strongly prefer separates": "분리형 강하게 선호"}, "action_level": {"mostly posed": "대부분 포즈", "balanced": "절반씩", "mostly active": "대부분 동작"}, "direct_gaze_limit": {"0": "없음", "1": "최대 1컷", "2": "최대 2컷"}, "smile_limit": {"0": "없음", "1": "최대 1컷", "2": "최대 2컷"}, "unexpected_cuts": {"1": "1컷", "2": "2컷", "3": "3컷"}, "source_influence": {"subtle": "은은하게", "balanced": "적당히", "strong": "강하게"}};

  const RANDOM_MODES={
    stable:{ko:'안정형',desc:'실패가 적은 무난한 조합',
      pool:['adult_roleplay','occupation_basic','everyday_basic','homewear','swimwear','private_evening'],
      adv:{overall_intensity:'sensual',pair_gap:'small',outfit_variety:'normal',scene_variety:'normal',pose_variety:'normal'}},
    variety:{ko:'다양성형',desc:'여섯 컷이 서로 최대한 다르게',descOne:'카테고리 전체에서 고르게',
      pool:null,
      adv:{overall_intensity:'sensual',pair_gap:'medium',outfit_variety:'extreme',scene_variety:'extreme',
           pose_variety:'extreme',camera_variety:'extreme',unexpected_cuts:'2'}},
    bold:{ko:'과감형',desc:'강도와 노출을 한 단계 올림',
      pool:['lingerie','private_evening','swimwear','adult_roleplay','occupation_sensual','everyday_sensual'],
      adv:{overall_intensity:'bold',pair_gap:'strong',skin_exposure:'bold',outfit_variety:'high',smile_limit:'1'}},
    experimental:{ko:'실험형',desc:'예상 밖 조합 위주. 통제력은 가장 낮음',
      pool:['wildcard','source_editorial','auto_random','active','occupation_sensual'],
      adv:{overall_intensity:'bold',pair_gap:'extreme',scene_variety:'extreme',camera_variety:'extreme',
           unexpected_cuts:'3',direct_gaze_limit:'1'}},
    source:{ko:'원본 포켓몬친화형',desc:'추천 근거를 그대로 세 Pair 에 적용',
      pool:null,useRec:true,
      adv:{overall_intensity:'sensual',source_influence:'strong',outfit_variety:'high',scene_variety:'high'}},
    life:{ko:'생활형',desc:'직업과 일상 비중을 높임',
      pool:['occupation_basic','occupation_sensual','everyday_basic','everyday_sensual','homewear','active'],
      adv:{overall_intensity:'restrained',pair_gap:'medium',action_level:'balanced',scene_variety:'high'}},
    fashion:{ko:'패션형',desc:'의상과 스타일 중심',
      pool:['source_editorial','adult_roleplay','lingerie','private_evening','homewear'],
      adv:{overall_intensity:'sensual',outfit_variety:'extreme',separates_preference:'prefer separates',
           source_influence:'balanced'}}
  };

  const ART_STYLES=[
    [
      'cinematic_semi_real',
      '세미리얼 시네마틱',
      '회화적 세미리얼 + 자연스러운 영화 조명. 얼굴과 메카 모두 같은 페인터리 렌더링 언어를 사용하며 CGI·가챠 키아트 쪽으로 튀는 것을 억제한다.'],

    [
      'game_keyart',
      '게임 키아트 2.5D',
      '애니 얼굴 + 입체 볼륨감. 평면 애니와 풀 3D CGI 사이 중간지점을 목표로 하는 2.5D 모바일게임 키아트.'],

    [
      'glossy_kr_game',
      '한국형 글로시 게임 일러스트',
      '강한 광택·채색 림라이트·보석 같은 색감의 고급 한국형 모바일게임 일러스트. 체형과 복식 구조는 CHARACTER IDENTITY와 원원본 포켓몬을 따르며 화풍이 임의로 바꾸지 않는다.'],

    [
      'glossy_promo',
      '글로시 프로모 키아트',
      '깔끔한 선화와 성인 애니 얼굴, 입체적인 2.5D 명암, 촘촘한 하드서피스 메카를 결합한 프로모션 키아트. 선명하고 정돈된 색감과 선택적인 광택을 사용하며 체형·장갑·구도는 선택 설정을 따른다.'],

    [
      'mecha_cinematic_keyart',
      '메카 시네마틱 키아트',
      '선명한 성인 애니풍 얼굴과 고채도 프로모 일러스트에 촘촘한 하드서피스 메카를 결합한 키아트. 기준 이미지의 인물·헤어·체형·장갑 설계는 유지하고, 밝고 또렷한 명암·다층 재질·읽히는 배경으로 표현한다.'],

    [
      'game_cgi',
      '게임 시네마틱 CGI',
      '고급 게임 컷신형 스타일라이즈드 3D. 피부 SSS와 PBR 메카 재질을 쓰되 실사 인간이나 2D 그림으로 가지 않는다.'],

    [
      'semi_real_paint',
      '세미리얼 유화',
      '붓결이 더 뚜렷한 디지털 유화형 반실사. 세미리얼 시네마틱보다 광학적 영화 느낌은 줄이고 실제 회화 표면감을 더 강하게 남긴다.'],

    [
      'photoreal',
      '사진풍',
      '실제 촬영된 성인 인물과 실제 제작된 메카 장비처럼 보이는 사진풍. CGI 렌더가 아니라 카메라로 찍은 결과를 목표로 한다.'],

    [
      'anime_illust',
      '애니 일러스트',
      '현대 애니 일러스트. 깨끗한 선, 명확한 애니 얼굴, 2~3단 명암과 부드러운 보조 그라데이션. 실사·CG와 확실히 분리.'],

    [
      'cel_anime',
      '셀화 애니',
      '굵고 명확한 외곽선 + 단순한 1~2단 셀 명암. 그라데이션과 재질 반사를 최소화한 정통 셀 애니 방식.'],

    [
      'painterly',
      '회화적 컨셉아트',
      '큰 붓질과 명암 구성이 우선하는 컨셉아트. 주요 실루엣과 원본 포켓몬 식별 요소는 읽히게 남기고 작은 표면 묘사는 과감히 생략.'],

    [
      'retro_anime',
      '레트로 애니',
      '1980~90년대 손그림 셀 애니. 제한된 셀 명암, 아날로그 색분리, 손그림 배경과 은은한 필름 질감.'],

    [
      'ink_wash',
      '수묵 담채',
      '먹선·번짐·담채·여백이 중심. 기계 구조도 금속 CG가 아니라 붓선과 먹 농담으로 번역한다.'],
    ["bright_catalog","밝은 카탈로그","밝고 고른 빛의 카탈로그 도판. 전신을 크게 두고 카메라·빛·배경을 폼마다 똑같이 유지해 나란히 놓고 견줄 수 있게 한다. 글자 없음, 연출 절제."]
  ];

  const STYLE_CORES = {
    cinematic_semi_real: [
      'high-end painterly semi-realistic character illustration with naturalistic cinematic lighting and restrained anime-informed facial idealization.',
      'The final image must read first as a sophisticated semi-realistic digital painting, not as an anime illustration, mobile-game key art, 3D character render, or live-action photograph.',

      'FACE: preserve mature adult facial anatomy, believable skull structure, and convincing three-dimensional facial volume.',
      'Anime influence is restrained and limited to subtle idealization: slightly more expressive eyes, refined eye shape, a delicate but anatomically plausible nose, softly shaped lips, and a graceful jaw.',
      'Eye size remains close to believable adult human proportion.',
      'Facial structure specified in CHARACTER IDENTITY remains authoritative and must not be replaced by a recurring anime beauty template.',
      'Build facial features through painted light, value transitions, and soft form rather than crisp graphic linework.',
      'Eyelids, lash lines, irises, lips, cheeks, nose, and jaw all belong to the same painted surface language.',
      'Avoid graphic eyelashes, oversized irises, simplified triangular noses, tiny doll-like mouths, extreme V-shaped jaws, and separately drawn anime eyes sitting on top of realistic skin.',

      'SKIN: softly painted dimensionality, subtle subsurface warmth, restrained natural texture, and smooth but non-plastic transitions.',
      'Do not render photographic pore noise, but retain believable facial planes and natural variation.',
      'Highlights on skin are painted light rather than glossy CG reflections.',

      'HAIR: construct hair from painterly grouped masses with selected fine strands and flyaways.',
      'Use natural highlight grouping rather than uniformly sharp strand-by-strand photographic rendering.',

      'CLOTHING, ACCESSORIES, AND SURFACES: preserve convincing material identity, but render fabric, leather, and other worn surfaces through the same painterly visual language as the face.',
      'Reflections and specular highlights are selectively simplified and painted rather than physically perfect PBR reflections.',

      'LIGHTING: broad cinematic key light, natural reflected bounce, restrained rim illumination, atmospheric shadow colour, realistic falloff, and subtle bloom.',
      'The subject and environment share one coherent lighting system.',

      'EDGE AND DETAIL HIERARCHY: use selective sharpness.',
      'Important focal edges, hardware, and a few illuminated hair strands may be crisp while skin, secondary forms, and distant elements remain softer.',
      'Avoid uniformly razor-sharp rendering.',

      'Avoid cel shading, graphic anime linework, airbrushed gacha-game skin, glossy plastic skin, generic Unreal or Octane style CGI, physically perfect PBR reflections, and excessively clean mobile-game character rendering.'
    ].join(' '),

    game_keyart: [
      'premium 2.5D mobile-game character illustration with strongly volumetric painted rendering.',
      'The final image must read as high-end illustrated game key art occupying the visual middle ground between flat anime drawing and full 3D CGI.',
      'Forms are built primarily through smooth gradients, soft ambient occlusion, controlled specular highlights, dimensional light, and carefully modelled volume rather than graphic outlines or flat cel shading.',

      'FACE: use clearly anime-informed facial construction combined with strong soft three-dimensional modelling.',
      'The face must retain visible volumetric form in the forehead, eyelids, eye sockets, nose bridge, cheeks, lips, jaw, and chin, built through smooth painted gradients rather than flat cel shapes or graphic linework.',
      'Eyes may be large and expressive, but they must sit naturally inside a softly modelled three-dimensional face rather than appearing as flat anime eye artwork placed over the skin.',
      'Use restrained eyelid and lash definition, a softly simplified nose, and clean lips, while preserving the face shape, ethnicity, maturity, and individual identity defined in CHARACTER IDENTITY.',
      'The face should carry less micro-detail than the clothing and equipment, but it must not become flat.',

      'SKIN: smooth high-end 2.5D game-illustration skin with long airbrushed gradients, soft subsurface-like warmth, rounded form shading, gentle ambient occlusion, and controlled glossy highlights.',
      'Skin must feel volumetric and luminous, not flat, cel-shaded, photographic, or plastic.',
      'Do not use photographic pores, realistic skin grain, or raw 3D shader noise.',

      'HAIR: construct hair from layered grouped locks with clearly modelled volume, broad glossy highlight bands, soft internal shadowing, and a limited number of separated strands and flyaways.',
      'Hair must feel more dimensional than flat anime hair, but remain illustrated rather than photographically strand-rendered.',

      'CLOTHING, ACCESSORIES, AND SURFACES: use clean but volumetric rendering with clear form separation, rounded light falloff, stylized reflections, ambient occlusion, and controlled glossy highlights.',
      'Edges may be crisp where necessary, but form must be described primarily through three-dimensional light and material response rather than heavy outlines, flat graphic colouring, or simple cel blocks.',

      'LIGHTING: use bright, controlled dimensional key light, soft fill and bounce, decisive rim separation, selective coloured accent light, and believable but stylized light falloff.',
      'Lighting must create clear three-dimensional form across face, skin, hair, and clothing.',

      'BACKGROUND: use strong subject isolation with simplified atmospheric space, glow, bokeh, soft environmental shapes, or reduced background detail.',
      'The background may suggest depth and real spatial lighting but must remain subordinate to the character.',

      'RENDERING BALANCE: the result should feel more volumetric than conventional 2D anime illustration but more illustrated and stylized than a fully rendered 3D game character.',
      'Use polished 2.5D modelling and shading without crossing into photorealism.',

      'Avoid flat anime rendering, cel-shaded skin, purely 2D character-sheet rendering, visible comic-style outlines, flat graphic facial construction, uniformly hard-edged shadows, heavy line-art dependence, simple television-anime shading, photographic skin texture, fully photorealistic CGI, raw Unreal or Octane rendering, hyper-real PBR material noise, plastic 3D skin, perfect ray-traced reflections, and generic game-engine asset presentation.'
    ].join(' ')
  };

  const ANTHRO_STYLE_EXTENSIONS = {
    cinematic_semi_real: [
      'ARMOR AND MECHANICAL SURFACES: preserve convincing material identity and clear mechanical structure, but render metal, composite, and painted armor through the same painterly visual language as the face.',
      'MECHANICAL PAINTERLY LOCK: mechanical armor may be highly detailed and precisely constructed, but high detail must not change the rendering language into CGI or PBR. Panel geometry, weapons, backpack structures, joints, and hard-surface forms may remain crisp and mechanically legible, while their lighting and material response must still read as painted illustration. Do not use uniform PBR roughness, ray-traced-looking reflections, perfectly smooth metallic gradients, or the polished surface language of a rendered 3D game asset. Mechanical complexity controls WHAT is depicted, not HOW realistically it is rendered.',
      'Selected mechanical focal edges may be somewhat sharper than skin, but the overall armor surface must retain the same painterly edge hierarchy and optical softness as the rest of the illustration; it must never look like a separate 3D render composited onto a painted character.',
      'Even highly polished armor uses painted interpretations of reflection rather than physically exact reflections \u2014 specular highlights may be strong where appropriate, but stay selective, broken, and compositionally designed rather than continuous ray-traced surface response.'
    ].join(' '),

    game_keyart: [
      'ARMOR AND MECHANICAL SURFACES: use clean but volumetric hard-surface rendering with clear panel separation, rounded light falloff, stylized reflections, ambient occlusion, and controlled glossy highlights.',
      'Render the selected form geometry and material distinctions without turning the surfaces into fully realistic PBR assets.',
      'Metal, composite, and painted armor should be visibly distinct, but their reflections and specular behaviour remain stylized and art-directed.',
      'IDENTITY FIDELITY: render the identity and selected form defined below through this style. CHARACTER IDENTITY controls who is depicted; this style controls the rendering language.',
      'Do not simplify the source creature into generic mobile-game heroine armor \u2014 this style may beautify and polish the rendering, but it must not replace source-specific mechanical geometry with generic fantasy-mecha costume design.'
    ].join(' ')
  };

  const LIFESTYLE_STYLE_EXTENSIONS = {
    cinematic_semi_real: [
      'Clothing, skin, hair, and environment in this scene all follow the semi-real painterly surface logic established above.',
      'Fabrics, leather, denim, knitwear, and other materials retain tactile detail and natural folds, described through the same painterly value language as skin and hair.',
      'Wet skin or swimwear may show localized highlights without turning the entire figure into glossy plastic.',
      'The character must feel embedded in the environment, with consistent light and atmosphere across figure and background.'
    ].join(' '),

    game_keyart: [
      'Fabrics, swimwear, leather, and accessories in this scene retain the same polished 2.5D game-illustration treatment established above \u2014 clear form, rounded light falloff, and controlled glossy highlights.',
      'Skin remains smooth and volumetric rather than flat or photographic.',
      'The environment is simplified and atmospherically blurred, keeping the character as the clear subject.',
      'The scene may be glamorous and glossy, but stays lifestyle-focused; equipment appears only when explicitly requested for this scene.'
    ].join(' ')
  };

  const STYLE_PROFILES = {
    cinematic_semi_real: { core: STYLE_CORES.cinematic_semi_real, anthro: ANTHRO_STYLE_EXTENSIONS.cinematic_semi_real, lifestyle: LIFESTYLE_STYLE_EXTENSIONS.cinematic_semi_real },
    game_keyart: { core: STYLE_CORES.game_keyart, anthro: ANTHRO_STYLE_EXTENSIONS.game_keyart, lifestyle: LIFESTYLE_STYLE_EXTENSIONS.game_keyart },
    glossy_kr_game: {
      core: [
        "high-gloss stylised character illustration in the visual language of premium Korean mobile-game key art.",
        "The rendering is strongly stylised, glamorous, saturated, and highly polished, but the character design, body proportions, armor silhouette, and costume structure remain controlled by CHARACTER IDENTITY and FORM DEFINITION.",
        "FACE: strongly stylised but clearly adult facial rendering built on mature semi-real 2.5D modelling.",
        "The face must keep dimensional volume in the cheeks, nose bridge, nose tip, lips, eyelids, and jaw rather than flattening into a modern anime or mecha key-art template.",
        "Use elegant eye shapes, deliberate lash definition, a refined but dimensional nose, softly glossy lips with readable volume, and polished beauty rendering.",
        "The exact eye geometry, face shape, ethnicity, maturity, and facial character must still follow CHARACTER IDENTITY rather than collapsing into one recurring glamour face.",
        "SKIN: exceptionally smooth airbrushed gradients with bright designed specular highlights and deep saturated shadow colour.",
        "Skin appears polished and luminous rather than photographic, but the facial planes underneath stay dimensional — gradients must not flatten the form into uniform airbrushed shading.",
        "HAIR: glossy grouped locks with strong highlight ribbons, saturated colour separation, and selected sharp strands.",
        "Hair should feel illustrated and lacquered rather than photographically rendered.",
        "DECORATIVE DETAIL: straps, trim, fittings, chains, ribbons, jewellery, or ornamental accents may appear only where the selected design or explicit scene requests support them.",
        "Do not add generic baroque decoration merely because of the selected art style.",
        "LIGHTING: theatrical key light, strong coloured rim light, deep jewel-toned shadows, controlled bloom, and dramatic contrast.",
        "BACKGROUND: simplified atmospheric glow, bokeh, gradients, or broad decorative light shapes.",
        "Avoid photographic realism, muted colour, flat cel shading, low-gloss rendering, plain unrendered surfaces, unrelated fantasy ornament, and generic baroque redesign.",
        /* 화풍이 흔들릴 때 돌아올 자리. 색·재질·장면이 바뀌어도 같은 화풍임을 끝에서 한 번 더 못박는다. */
        "STYLE SIGNATURE: maintain a premium Korean game-illustration finish built on semi-real 2.5D form, mature dimensional facial modelling, refined luminous skin gradients, polished hair rendering, crisp focal detail, and strong material separation.",
        "Do not drift toward flat modern anime rendering, generic mecha key-art facial simplification, or cel-like treatment merely because the subject, armor, palette, or scene becomes more mechanical or saturated.",
        "Colour palette and material gloss may vary by subject, but the underlying rendering language must remain recognisably high-end glossy Korean game character art."
      ].join(' '),
      anthro: [
        "ARMOR, CLOTHING, AND MECHANICAL SURFACES: thick glossy rendering with strong stylized specular highlights, saturated colour, crisp edge accents, and luxurious material separation.",
        "Metal, painted armor, latex-like surfaces, fabric, and glass may each reflect light differently, but all remain part of the same highly stylised illustration.",
        "Do not convert source-specific mechanical design into generic fantasy costume.",
        "Even with highly mechanical silhouettes, saturated armor colour, or strong rim lighting, the exposed human face keeps the same mature semi-real 2.5D rendering — dimensional cheeks, nose bridge, nose tip, lips, eyelids, and jaw — instead of being simplified into a flatter anime or mecha key-art face.",
        "Hard-surface armor keeps a nuanced material response: differentiate painted metal, matte coating, polished edges, dark mechanical joints, and reflective hard surfaces rather than reducing the whole armor system to uniformly clean cel-like highlights.",
        /* 유광 화풍이라고 장갑까지 전부 번쩍여야 하는 건 아니다. 무광은 재질 이야기고 화풍은 그대로다. */
        "A matte, military, pale, dark, or heavily saturated armor palette is still this style: matte describes the material, not the rendering language, which stays premium glossy Korean game illustration rather than concept art or anime key art."
      ].join(' '),
      lifestyle: [
        "Clothing, fabric, and accessories in this scene follow the same high-gloss stylised rendering established above — strong specular highlights, saturated colour, and luxurious material separation.",
        "The face keeps mature semi-real 2.5D construction rather than drifting toward cleaner flat anime beauty: nose, lips, cheeks, eyelids, and jaw stay softly dimensional with refined gradients, and hair keeps layered glossy strand groups with fine secondary detail.",
        /* 광택을 빼는 게 아니라, 온몸이 균일하게 젖어 보이는 것만 막는다. */
        "Use luminous glossy skin highlights selectively and with dimensional falloff — dry skin may still look polished and radiant, but avoid uniformly wet-looking specular coverage unless the scene explicitly involves water or moisture.",
        "Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
      ].join(' ')
    },
    glossy_promo: {
      "core": "Premium anime-mecha promotional key art with clean linework, dense hard-surface detail, strong dimensional shading, vivid elegant colors and polished 2.5D rendering. FACE DESIGN: anime-designed face, stronger upper-lash definition, rich irises, decisive mouth, grouped illustrated shadow shapes and hair strands, selective luminous highlights. Preserve selected or approved eye shape, facial geometry, age and expression; angular shading must not reshape the face. Face carries the same high-impact promotional rendering intensity as the mechanical armor: matching clarity/contrast, not metallic gloss. Restrained skin highlights; controlled hair/armor gloss, deep mechanical contact shadows and crisp bevel reflections. Avoid soft generic bishoujo, pastel delicacy, semi-real beauty portraits, airbrushing, wet skin, flat cel-only shading and literal CGI. Do not force a background, expression, perspective or effects; follow output settings. TEXT AND GRAPHIC OVERLAYS: no typography, labels, logos or watermarks; requested sheet panels only.",
      "anthro": "Resolve plate edges, recessed joints, fasteners, actuators and mounting points in the existing design. Give light armor visible structural depth without extra heavy shells. Use broad shaded planes and dark mechanical gaps for weight. Keep skin, fabric and machinery distinct; detail never enlarges anatomy or adds equipment.",
      "lifestyle": "Apply the same anime face and dimensional illustrated finish to the requested scene. Render clothing through drape, seams and appropriate highlights. Include machinery only when requested."
},
    mecha_cinematic_keyart: {
      core: [
        "high-impact, illustration-first mecha promotional key art with an unmistakably anime-designed adult face, luminous dimensional body rendering, and dense premium hard-surface mechanics.",
        "The final image is a polished illustrated hybrid with crisp graphic shapes, saturated campaign-art colour, and convincing mechanical volume. It must read as authored premium character illustration rather than soft airbrushed glamour, a literal CGI or game-engine render, or live-action photography.",
        "STYLE AUTHORITY: this style controls rendering, lighting, spatial depth, and surface finish only. CHARACTER IDENTITY, FORM DEFINITION, OUTPUT MODE, and explicit camera or scene settings remain authoritative for anatomy, armor coverage, equipment, pose, framing, and environment.",
        "FACE DESIGN: the face must visibly read as an adult anime character, not a realistic beauty portrait with slightly brighter eyes. For a new character, unless explicit facial settings specify otherwise, use moderately enlarged expressive eyes and luminous irises, elegant curved eyelids and fine lashes, a compact simply illustrated nose, delicately simplified lips, soft cheek contours and a gently rounded lower face. Keep a clearly adult woman in her twenties or the specified adult age, with individual ethnicity and source-appropriate character appeal; no childlike proportions, chibi head, generic doll or identical cute face for every species. Explicit facial settings and the approved reference identity remain authoritative; preserve a reference character's distinguishing features and already approved stylized proportions rather than replacing her with a different person.",
        "FACE RENDERING: use continuous soft luminous gradients and warm cheek colour over the anime facial design. Simplify realistic nose-bridge, nostril and lip micro-detail while keeping dimensional cheeks, eyelids and jaw, with delicately illustrated satin lips and clear eye highlights. Translate the face through this illustrated language instead of copying photographic facial surface detail. Expression follows the selected scene and character: lively appeal does not require a smile, parted lips, cheerful mood or direct gaze in every image.",
        "HYBRID FINISH: anime facial design and richly dimensional body, hair, armor and environment share the same cinematic illumination. Keep the body's volume, layered hair highlights, dense mechanical construction, nuanced reflections, fine contact shadows and spatial depth. Do not flatten the whole image into standard cel-shaded anime, broad flat colour blocks or thick black outlines. The face is stylized in design but softly volumetric in paint; skin, cloth and hard armor remain distinct materials.",
        "SKIN: use luminous painted dimensional gradients, clean warm-to-cool colour transitions, selective bright highlights, and restrained natural texture. Keep skin polished and alive without photographic pore noise, waxy game-CGI shading, porcelain plastic, or uniformly wet gloss.",
        "HAIR: use bold layered lock groups, bright ribbon-like highlights, luminous rim strands, selected fine flyaways, and a crisp readable silhouette. Keep the selected hairstyle's exact length, silhouette, parting, volume, and colour; do not add a ponytail, lengthen the hair, or replace it with generic windblown glamour hair.",
        "LIGHTING AND COLOUR: use a brilliant shaped key light, bright source-colour accents, cool or complementary environmental fill, strong clean rim separation, small controlled bloom, and deep but colourful readable shadows. Favour punchy saturation, luminous focal highlights, and high local contrast over pale neutral CGI lighting, grey haze, or low-contrast pastel softness.",
        "SPACE: build layered near, middle, and far planes around single-figure scenes. When no environment is explicitly selected, use a bright large-scale technological launch bay, industrial deck, or futuristic city-hangar with structural depth, reflected light, and a crisp readable midground. Use depth of field selectively on the far distance only; do not dissolve the whole background into fog or generic bokeh.",
        "DETAIL HIERARCHY: keep the face, hair silhouette, complete full-body outline, major armor masses, joints, hands, feet, and defining equipment sharply readable. Carry resolved edge work and material separation across the whole figure, then soften only genuinely distant secondary background detail.",
        "MODE DISCIPLINE: single-figure portraits and action scenes may use a full-body campaign-art presentation, strong environmental scale, and cinematic depth only to the extent allowed by OUTPUT MODE. Initial reference sheets keep their required multi-view layout and comparison portraits keep their fixed camera and pose rules, while receiving the same crisp face, saturated illustration finish, hard-surface precision, and lighting quality.",
        "TEXT AND GRAPHIC OVERLAYS: no typography, no headings, no numbers, no captions, no handwritten notes, no labels, no interface panels, no infographic bands, no borders, no logos, no watermarks, and no letter-like decorative marks anywhere in the image.",
        "Avoid soft low-detail airbrushing, pale desaturated CGI lighting, dark featureless studio bokeh, flat cel shading, painterly unresolved armor, generic plastic bodysuits, raw PBR asset presentation, photoreal live-action skin, excessive bloom, shallow focus across the figure, illegible silhouettes, poster copy, and character-card layouts."
      ].join(' '),
      anthro: [
        "ARMOR AND MECHANICAL SURFACES: preserve the selected form and every source-specific armor mass while rendering crisp angular interlocking plates, purposeful panel breaks, layered bevelled edges, recessed seams, fine fasteners, compact actuators, exposed inner-frame glimpses at existing gaps, articulated dark joints, and believable load-bearing connections.",
        "Use high-density hard-surface detail inside the existing plate boundaries without changing a light form into heavy armor or covering exposed areas that FORM DEFINITION leaves open. Detail density is a rendering treatment, not permission to redesign armor coverage, silhouette, palette, equipment, or attachment points.",
        "Separate saturated painted armor, dark inner chassis, bare metal, composite, rubber, glass, small emissive accents, fabric, and skin through designed reflections, crisp edge highlights, fine contact shadows, and controlled roughness. Keep the result illustration-first and art-directed rather than physically neutral or a raw PBR asset render.",
        "Integrate source-creature colours, markings, ears, tails, wings, and other selected motifs into mechanically plausible structures. Preserve all attachment points and keep back equipment, weapons, hands, and feet fully readable.",
        "Campaign richness must come from rendering, light, edge construction, and mechanical microstructure, not from changing the reference character's hairstyle, anatomy, body proportions, armor masses, coverage, or equipment.",
        "The character and environment share one coherent light field, with reflected source colours, bright rim accents, and contact light grounding the armor in the scene.",
        "Do not add serial numbers, warning labels, brand marks, interface callouts, title blocks, or decorative pseudo-writing to armor, props, floors, walls, vehicles, or background banners."
      ].join(' '),
      lifestyle: [
        "Render the same adult identity with the style's unmistakably anime-designed face and soft dimensional facial painting, luminous illustrated skin, layered highlighted hair, saturated campaign-art colour, and coherent environmental light, but omit armor and combat effects unless the selected scene explicitly requests them. Preserve the approved facial identity and stylized proportions, and let the requested expression control the mood. Keep body and clothing volume rather than flattening them into cel shading.",
        "Clothing and props use believable layered construction, fine seams, designed highlights, tactile material separation, and illustration-first polish without becoming a literal game-engine render.",
        "Keep the requested everyday location and action authoritative; do not force an industrial hangar, heroic stance, or battle staging into a casual scene.",
        "Screens, packaging, signs, books, walls, clothing, and props contain no readable writing, numbers, logos, captions, interface text, or decorative pseudo-letters."
      ].join(' ')
    },
    game_cgi: {
      core: [
        "high-end stylized 3D character render in the visual language of a premium game cinematic.",
        "The final image must unmistakably read as sophisticated CGI rather than live-action photography, 2D anime illustration, painterly concept art, or mobile-game 2.5D key art.",
        "FACE: preserve clearly adult anatomy and the facial structure defined by CHARACTER IDENTITY while allowing tasteful game-character idealization.",
        "Use believable three-dimensional eyelids, nose, lips, cheeks, jaw, and eye sockets rather than flat anime line construction.",
        "Eyes may be slightly idealized but remain physically integrated into the modeled face.",
        "SKIN: smooth high-end digital skin shading with controlled subsurface scattering, fine but restrained surface variation, realistic roughness transitions, and carefully shaped specular response.",
        "Avoid waxy skin, porcelain plastic skin, excessive pore detail, and live-action photographic imperfection.",
        "HAIR: modeled strand groups and layered hair cards or groom-like masses with physically coherent highlights.",
        "Avoid flat painted hair bands and avoid hyper-photographic individual-strand noise.",
        "LIGHTING: cinematic studio-quality key, fill, bounce, rim, volumetric separation, controlled bloom, and believable reflected light.",
        "Use physically coherent three-dimensional lighting throughout the character.",
        "Avoid painterly brushwork, flat anime shading, cel outlines, photographic live-action skin, crude plastic surfaces, excessive ray-traced mirror reflections, and generic unlit character-viewer presentation."
      ].join(' '),
      anthro: [
        "ARMOR AND MECHANICAL SURFACES: clean premium PBR-style material separation with convincing painted metal, exposed metal, composite, rubber, glass, and emissive sensors.",
        "Use controlled reflections, roughness variation, subtle edge wear, and clear mechanical segmentation.",
        "Materials should feel intentionally art-directed rather than like a raw photoreal asset render."
      ].join(' '),
      lifestyle: "Clothing, fabric, and accessories in this scene follow the same premium stylized 3D material logic established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    semi_real_paint: {
      core: [
        "semi-realistic digital oil painting with visibly painted surfaces, grounded adult anatomy, and resolved character design.",
        "The image must read as a finished digital painting rather than a photograph, CGI render, anime key visual, or loose unfinished concept sketch.",
        "FACE AND SKIN: realistic adult facial structure with softly idealized beauty, painted through layered colour, subtle brush texture, and believable value transitions.",
        "Retain visible but controlled painterly texture across cheeks, lips, eyelids, neck, and exposed skin.",
        "Do not use photographic pore detail or perfectly airbrushed game skin.",
        "HAIR: painted in coherent masses with visible brush grouping and selected strands.",
        "Highlights should feel brushed into the hair rather than physically ray-traced.",
        "EDGE HANDLING: most important forms remain resolved and readable, while selected secondary edges may soften into surrounding values.",
        "LIGHTING: grounded directional illumination with believable volume and colour bounce, interpreted through painterly value and colour rather than photographic optics.",
        "Avoid loose unresolved concept-art brushwork, perfectly clean CGI material rendering, glossy mobile-game airbrushing, flat cel shading, and fully photographic skin."
      ].join(' '),
      anthro: [
        "ARMOR, FABRIC, AND MECHANICAL PARTS: preserve convincing material differences and rich surface detail while allowing visible brush texture across painted metal, composite, fabric, and worn surfaces.",
        "Specular highlights and reflections are interpreted through painting and need not be physically perfect.",
        "Do not leave major anatomy or signature mechanical structures vague or unfinished."
      ].join(' '),
      lifestyle: "Clothing, fabric, and other worn materials in this scene follow the same semi-realistic painted surface logic established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    photoreal: {
      core: [
        "high-end photorealistic live-action character photography with believable practical and mechanical materials.",
        "The final image must read as a real photograph captured by a camera, not as digital painting, anime illustration, mobile-game key art, or visible CGI character rendering.",
        "FACE AND SKIN: realistic adult human facial anatomy, natural skin texture, subtle pores, fine tonal variation, believable lips, eyelids, lashes, and eyes.",
        "Beauty styling may be polished and editorial, but do not reshape the face into anime proportions or plastic game-character anatomy.",
        "HAIR: naturally photographed hair with believable strand grouping, flyaways, translucency, and real light interaction.",
        "LIGHTING: real photographic key, fill, bounce, rim, practical reflections, natural falloff, and physically believable exposure.",
        "Use realistic camera depth of field and lens behaviour only where compositionally appropriate.",
        "Avoid painterly brush texture, anime eye construction, cel shading, game-render skin, Unreal-style CGI appearance, artificial plastic gloss, excessive cinematic bloom, and impossible illustrated reflections."
      ].join(' '),
      anthro: [
        "ARMOR AND MECHANICAL SURFACES: appear as physically fabricated real-world materials with believable scale, seams, joints, painted surfaces, metal, composite, rubber, glass, and practical wear.",
        "Reflections follow the photographed environment rather than stylized illustrated highlight shapes."
      ].join(' '),
      lifestyle: "Clothing, fabric, and accessories in this scene are photographed with the same practical, real-world material logic established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    anime_illust: {
      core: [
        "polished modern anime character illustration with clean confident linework, clearly anime facial construction, and controlled two-to-three-step shading supported by soft gradients.",
        "The image must read unmistakably as a finished 2D anime illustration rather than photography, 3D CGI, painterly concept art, or glossy 2.5D game rendering.",
        "FACE: clearly anime, with expressive eyes, simplified but elegant nose and mouth construction, clean eyelid definition, and adult facial proportions appropriate to CHARACTER IDENTITY.",
        "Preserve individual face shape, ethnicity, maturity, and facial character rather than reusing one generic anime face.",
        "SKIN: smooth illustrated colour with clean shadow shapes and restrained soft gradients.",
        "No photographic pores, realistic skin noise, or wet CG-style specular response.",
        "HAIR: defined graphic locks with clean directional flow, selective internal strand lines, and stylized highlight shapes.",
        "LIGHTING: illustrated key and rim lighting expressed through designed colour shapes and gradients rather than physically perfect reflections.",
        "Avoid photographic skin, camera grain, realistic lens blur, 3D-render materials, loose brushwork, thick glossy mobile-game rendering, and completely flat low-detail television animation."
      ].join(' '),
      anthro: [
        "ARMOR, COSTUME, AND MECHANICAL PARTS: retain crisp source-specific geometry, clean outlines, controlled cel-like shading, and simplified illustrated highlights.",
        "Mechanical surfaces must remain part of the same 2D drawing and must not become photoreal PBR objects."
      ].join(' '),
      lifestyle: "Clothing, fabric, and accessories in this scene follow the same clean 2D illustrated rendering established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    cel_anime: {
      core: [
        "flat cel-shaded anime character illustration with bold clean outlines, hard-edged shadow shapes, minimal gradients, and strong poster-like colour blocking.",
        "The entire image must use a consistent cel-animation rendering language.",
        "FACE: clearly adult anime facial construction with simplified eyes, nose, mouth, and clean graphic shapes.",
        "Follow the facial geometry and character identity defined in CHARACTER IDENTITY without realistic skin rendering.",
        "SKIN: flat local colour with one primary shadow tone and only minimal highlight accents.",
        "No pores, subsurface scattering, glossy airbrushing, or photographic tonal modelling.",
        "HAIR: clean graphic masses separated into major locks with simple highlight shapes and hard colour boundaries.",
        "LIGHTING: communicate form through deliberate cel-shadow shapes and limited rim-colour bands rather than realistic cinematic falloff.",
        "Avoid soft painterly modelling, airbrushed game skin, realistic material reflections, photographic lighting, CGI shading, excessive gradients, and dense micro-detail."
      ].join(' '),
      anthro: [
        "ARMOR AND MECHANICAL PARTS: render the selected form through bold outlines, hard shadow blocks, simplified metal colour separation, and minimal reflected-light detail.",
        "Do not introduce realistic PBR reflections or painterly texture."
      ].join(' '),
      lifestyle: "Clothing, fabric, and accessories in this scene follow the same flat cel-shaded rendering established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    painterly: {
      core: [
        "loose painterly concept-art illustration built from broad visible brushwork, strong value composition, atmospheric colour masses, and selectively unresolved edges.",
        "The image should feel like confident high-level production concept art rather than a polished game render, anime key visual, photograph, or detailed digital oil portrait.",
        "FACE AND FIGURE: maintain readable adult anatomy, expression, and identity, but describe secondary facial detail economically through brush shape and value rather than precise linework.",
        "HAIR, SKIN, FABRIC, AND ARMOR: all materials are interpreted through broad painted masses and selective texture.",
        "Do not individually render every pore, strand, panel scratch, screw, or micro-reflection.",
        "LIGHTING: prioritize large readable light and shadow masses, colour temperature, silhouette separation, and atmosphere over physically exact reflection behaviour.",
        "Avoid photorealistic surface rendering, polished PBR materials, airbrushed mobile-game skin, crisp anime linework, uniformly finished edges, and excessive micro-detail."
      ].join(' '),
      anthro: [
        "MECHANICAL MATERIALS: when the scene calls for armor, keep the selected form readable through large brush shapes and simplified surface detail. Material rendering does not add equipment or freeze armor configuration.",
        "Important silhouette-defining mechanical edges may remain resolved while secondary edges dissolve into painterly atmosphere."
      ].join(' '),
      lifestyle: "Clothing, fabric, and other worn materials in this scene are interpreted through the same broad painterly masses established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    retro_anime: {
      core: [
        "authentic late-1980s to mid-1990s hand-drawn cel-animation illustration.",
        "The image should evoke photographed painted cels and hand-painted animation backgrounds rather than modern digital anime, glossy mobile-game art, CGI, or photography.",
        "FACE: period-appropriate adult anime construction with restrained eye size, clean hand-drawn eyelids, simplified nose and mouth, and expressive but not modern moe-style proportions.",
        "Retain the individual facial identity specified by CHARACTER IDENTITY.",
        "LINEWORK: thin-to-medium hand-inked outlines with slight natural variation rather than perfectly vector-clean digital lines.",
        "SHADING: one or two hard-edged cel shadow tones with very limited gradient use.",
        "Highlights are simple painted shapes rather than glossy modern specular streaks.",
        "COLOUR: slightly muted analogue palette, visible colour separation, gentle film response, and restrained saturation compared with modern game art.",
        "BACKGROUND: hand-painted animation-background feeling with simplified perspective, soft painted atmosphere, and subtle analogue grain.",
        "Avoid modern gacha-game gloss, photoreal materials, PBR reflection, digital bloom overload, modern jewelled irises, hyper-clean vector outlines, and contemporary 3D anime rendering."
      ].join(' '),
      anthro: [
        "HAIR AND MECHANICAL PARTS: simplified into clear animation-friendly colour regions while preserving the selected form and individual character identity."
      ].join(' '),
      lifestyle: "Clothing and accessories in this scene follow the same hand-drawn cel-animation colour regions established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    ink_wash: {
      core: [
        "ink-and-wash character illustration combining expressive brush outlines, diluted ink values, translucent restrained colour washes, and generous negative space.",
        "The final image must clearly read as traditional-media-inspired ink painting rather than digital CGI, polished anime key art, photorealism, or oil painting.",
        "FACE AND FIGURE: keep adult anatomy and identity readable using economical brush contours, soft wash modelling, and selective facial detail.",
        "Do not over-render eyes, lips, skin texture, or small facial features.",
        "SKIN AND HAIR: describe form through paper tone, diluted wash, broken brush edges, and selective dark accents rather than smooth airbrushing or realistic specular highlights.",
        "COLOUR: use restrained translucent accent colours derived from the chosen palette rather than fully saturated opaque local colour.",
        "BACKGROUND: use open paper-like negative space, atmospheric ink blooms, sparse environmental suggestions, and selective calligraphic shadow masses.",
        "Do not force a dark cinematic studio background when it conflicts with this style.",
        "Avoid glossy reflections, photographic skin, CGI lighting, dense mechanical micro-detail, hard digital gradients, game-render bloom, flat modern cel shading, and cluttered fully painted backgrounds."
      ].join(' '),
      anthro: [
        "ARMOR AND MECHANICAL STRUCTURE: render the selected design and its materials, but translate material rendering into expressive ink lines, dry-brush texture, diluted wash, and simplified tonal masses.",
        "Metal must not become glossy CGI or physically reflective PBR material."
      ].join(' '),
      lifestyle: "Clothing and other worn materials in this scene are translated into the same expressive ink lines and diluted wash established above. Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
    },
    bright_catalog: {
      core: "bright clean product-catalogue character illustration with even, optimistic daylight and a clearly legible subject. Preserve the catalogue finish across all output modes. Framing and movement follow OUTPUT MODE; comparison portraits use the calm full-figure catalogue presentation, while action and casual scenes may change pose and camera. LIGHTING: broad soft key from the front with gentle fill, no deep shadow pockets, no hard rim, no theatrical colour wash. Every edge of the silhouette stays readable against the background. FACE AND SKIN: clean adult rendering with even tone, restrained specular, and no heavy contouring. The face stays bright and unmodelled rather than dramatic. BACKGROUND: a bright, uncluttered, casually futuristic setting held at low contrast and low saturation — pale sky, clean panels, soft gradients. It sits behind the subject and never crosses in front of the silhouette. EFFECTS: energy, sparks, glow, smoke, and particles are restrained to a trace or omitted entirely. TEXT: no captions, labels, watermarks, logos, or lettering of any kind anywhere in the image. Avoid dramatic cinematic grading, heavy rim lighting, dark backgrounds, motion blur, debris, lens flare, and busy environmental storytelling. STYLE SIGNATURE: keep the plate bright, even, and comparable. When the subject becomes more mechanical, more saturated, or more powerful, the lighting must retain its even catalogue quality — the catalogue look is what makes two plates comparable side by side.",
      anthro: [
        "ARMOR AND MECHANICAL SURFACES: fully legible from the requested viewpoint, with even light across every plate so that panel lines, seams, joint gaps, and layer thickness can be counted at a glance.",
        "Material separation reads through local colour and clean edge definition rather than through dramatic highlights or deep shadow.",
        "In PORTRAIT show construction clearly. In ACTION preserve this readable material treatment during the requested movement."
      ].join(" "),
      lifestyle: [
        "Clothing, fabric, and accessories in this scene keep the same bright even light and calm presentation established above.",
        "The setting stays uncluttered and low-contrast so the figure reads first.",
        "Equipment appears only when explicitly requested by the scene; material rendering does not prescribe equipment."
      ].join(" ")
    },  };

  /* 최초 인물의 세부 외형 해석. 후속 생성에는 승인한 이미지가 우선한다. */
  const ETHNIC_PART=[
    ['facial bone structure',['face shape','face length','face width','jaw & chin']],
    ['eye shape',['eye shape','eye size','eye tilt']],
    ['eyelid form',['eye shape','eye size','eye tilt']],
    ['nose bridge',['nose character']],
    ['lip shape',['lips']]
  ];
  const DEFAULT_STYLE='cinematic_semi_real';
  const MODE = { PORTRAIT:'portrait', ACTION:'action', CASUAL:'casual' };
  const CUTE_SET={'cute':1,'doll-like':1,'innocent':1,'cheerful':1};
  const CUTE_LOCK='Express {C} through expression and stylization while preserving the selected age and facial geometry.';
  const YOUTHFUL_LOCK='A woman in her twenties with youthful facial styling; preserve explicit facial geometry and body settings.';
  const UNDERBOOB_NEG='no fully covered lower breast, no simple abdomen gap, no detached breast cups, no floating armor, no exposed cleavage-only design';
  const UNDERBOOB_POS='the chest armor ends slightly above the natural inframammary fold, revealing a narrow crescent of the lower breast on both sides; the exposed underboob must be directly continuous with the breast contour, not a separate cutout or gap; nipples and areola remain fully covered; the armor hugs the upper and outer breast naturally and transitions smoothly into the sternum sensor and side armor';

  /* ══ 파라미터 도식 ══
     체형은 어깨·가슴·허리·골반 반폭(px)과 키·굵기 배율로,
     헤어는 길이단계·질감·볼륨·묶음코드로 그린다. 손으로 그리지 않아야
     옵션끼리 폭 차이가 그대로 비교된다. */
  const BODY_FIG={
    'slender':[18,16,11,17,1.00,.85,'가늘고 굴곡이 완만한 체형. 어깨와 골반 폭이 비슷하고 전체적으로 얇다.'],
    'athletic':[22,18,14,19,1.00,1.00,'어깨가 적당히 넓고 허리가 단단한 운동형. 굴곡보다 균형이 먼저 보인다.'],
    'curvy':[19,22,13,25,1.00,1.00,'가슴과 골반이 허리보다 확실히 넓은 곡선형.'],
    'glamorous':[20,25,13,26,1.02,1.00,'굴곡이 크고 화려한 체형. curvy보다 상하체 볼륨이 한 단계 더 크다.'],
    'muscular':[26,22,18,22,1.00,1.20,'근육량이 뚜렷해 어깨와 사지가 굵다. 허리도 얇지 않다.'],
    'heavy-built':[26,25,25,26,0.98,1.25,'상하체가 고르게 두껍고 묵직한 중후한 체격.'],
    'tall and lean':[19,16,12,17,1.12,.85,'키가 크면서 폭은 좁다. slender를 세로로 늘린 형태.'],
    'petite':[17,17,12,18,0.86,.95,'키가 작고 전체 비율이 아담하다. 폭은 평균이라 마른 인상은 아니다.'],
    'hourglass':[20,23,12,23,1.00,1.00,'가슴과 골반 폭이 같고 허리만 크게 들어간 모래시계형.'],
    'voluptuous':[20,27,15,28,1.00,1.10,'가슴·골반 볼륨이 가장 큰 육감형. 허리는 상대적으로만 얇다.'],
    'toned':[21,18,13,19,1.00,.95,'군살 없이 잔근육이 잡힌 체형. muscular보다 가늘고 선이 곱다.'],
    'wiry':[18,15,11,15,1.00,.80,'얇지만 단단한 체형. 굴곡이 거의 없고 힘줄이 도드라진다.'],
    'soft-figured':[21,23,22,25,0.98,1.15,'허리 굴곡이 적고 전체적으로 부드럽게 살집이 있다.'],
    'pear-shaped':[17,17,14,26,1.00,1.05,'상체는 좁고 골반·허벅지에 무게가 실린 형태.'],
    'inverted triangle':[26,21,14,17,1.00,1.00,'어깨가 가장 넓고 아래로 갈수록 좁아진다. pear의 반대.'],
    'stocky':[24,22,21,23,0.88,1.20,'키는 작고 폭은 넓은 다부진 체격.'],
    'statuesque':[22,21,14,22,1.15,1.00,'장신에 골격이 당당한 조각상 같은 체형.']
  };
  /* [길이단계, 질감, 볼륨, 묶음코드, 앞머리, 설명] */
  const HAIR_FIG={
    'bob':[1,'straight',2,'','blunt','턱선 근처에서 일자로 떨어지는 단정한 길이.'],
    'pixie cut':[0,'straight',1,'','wispy','귀와 목덜미가 드러나는 아주 짧은 컷.'],
    'layered':[2,'wavy',4,'','side','층을 내 끝으로 갈수록 가벼워지는 컷.'],
    'ponytail':[3,'straight',2,'mid','side','뒤로 모아 한 갈래로 묶은 기본형.'],
    'twin tail':[3,'straight',2,'twin','blunt','좌우 높은 위치에서 두 갈래로 묶는다.'],
    'wolf cut':[2,'wavy',6,'','wispy','윗머리는 짧고 아랫머리는 길어 층감이 강하다.'],
    'slicked back':[1,'flat',0,'','none','이마를 완전히 드러내고 뒤로 붙여 넘긴 스타일.'],
    'wavy':[3,'wavy',4,'','side','전체가 완만한 S자 웨이브.'],
    'straight':[3,'straight',2,'','blunt','굴곡 없이 곧게 떨어지는 생머리.'],
    'side ponytail':[2,'straight',2,'sidetail','side','한쪽 어깨로 넘겨 묶는다.'],
    'high ponytail':[3,'straight',2,'high','wispy','정수리 가까이 높게 묶어 얼굴선이 당겨진다.'],
    'braid':[4,'braid',2,'mid','side','뒤로 한 갈래 땋아 내린다.'],
    'twin braids':[4,'braid',2,'twin','blunt','좌우로 나눠 두 갈래로 땋는다.'],
    'crown braid':[0,'braid',3,'crown','none','머리를 둘러 땋아 왕관처럼 올린다.'],
    'chignon':[0,'straight',2,'lowbun','side','목덜미에 매끈하게 말아 붙인 단정한 번.'],
    'messy bun':[0,'wavy',4,'midbun','wispy','대충 올려 묶어 잔머리가 빠져나온 번.'],
    'top knot':[0,'straight',2,'topbun','none','정수리에 높이 올려 묶은 번.'],
    'low bun':[0,'straight',2,'lowbun','blunt','목덜미 낮은 위치의 번. 시뇽보다 느슨하다.'],
    'half-up':[3,'straight',3,'half','side','윗머리만 묶고 아랫머리는 내린다.'],
    'space buns':[0,'straight',2,'twinbun','blunt','양쪽에 동그란 번을 두 개 만든다.'],
    'hime cut':[4,'straight',3,'','hime','일자 앞머리 + 얼굴 옆 사이드를 턱선에서 자른 형태.'],
    'asymmetric cut':[2,'asym',3,'','side','좌우 길이가 확연히 다른 비대칭컷.'],
    'undercut':[1,'straight',2,'','side','옆과 뒤를 짧게 밀고 윗머리만 남긴다.'],
    'side-shaved long hair':[3,'shave',3,'','side','한쪽만 밀고 나머지는 길게 남긴다.'],
    'curly':[2,'curly',6,'','wispy','굵고 탄력 있는 곱슬. 옆 볼륨이 크다.'],
    'tight curls':[1,'coily',8,'','none','잔곱슬이 둥글게 부풀어 오른 형태.'],
    'locs':[3,'locs',3,'','none','가닥이 굵게 뭉쳐 늘어지는 로크스.'],
    'ringlet curls':[3,'ringlet',4,'','side','세로로 말린 드릴 형태의 컬.'],
    'finger waves':[1,'fwave',2,'','none','머리에 붙은 얕은 물결의 레트로 웨이브.'],
    'feathered':[2,'wavy',4,'','side','끝을 가볍게 쳐서 바깥으로 흐르게 한 컷.'],
    'blunt cut':[2,'straight',2,'','blunt','끝을 층 없이 일자로 자른 컷.'],
    'wet-look slick':[2,'flat',1,'','none','젖은 듯 광이 나게 붙여 넘긴 스타일.'],
    'windswept':[2,'wind',4,'','wispy','한쪽으로 바람에 날린 듯한 흐름.']
  };

  Object.assign(BODY_FIG,{
    'broad-shouldered':[28,22,17,20,1.02,1.05,'어깨가 가장 넓고 아래로 갈수록 좁아진다. 상체 인상이 지배적이다.'],
    'burly':[27,26,24,25,1.05,1.30,'키도 크고 폭도 넓은 거구. heavy-built보다 한 단계 더 크다.'],
    'lanky':[19,17,14,17,1.14,.80,'키는 크고 살은 거의 없다. 팔다리가 유난히 길어 보인다.'],
    'barrel-chested':[25,27,23,23,0.98,1.20,'흉곽이 통처럼 앞뒤로 두껍다. 어깨보다 가슴이 먼저 보인다.'],
    'rangy':[23,20,15,19,1.08,.95,'길고 유연한 근육질. muscular보다 가늘고 움직임이 가벼워 보인다.']
  });
  Object.assign(HAIR_FIG,{
    'buzz cut':[0,'flat',0,'','none','두피가 비칠 만큼 짧게 민 머리.'],
    'crew cut':[0,'straight',1,'','none','윗머리만 조금 남긴 짧고 단정한 컷.'],
    'side part':[1,'straight',2,'','side','가르마를 타 한쪽으로 넘긴 단정한 컷.'],
    'fade':[0,'shave',1,'','none','옆과 뒤를 위로 갈수록 길어지게 친 그라데이션 컷.'],
    'man bun':[0,'straight',2,'lowbun','none','뒤로 모아 작게 묶어 올린 번.'],
    'swept back':[1,'wind',3,'','none','이마를 드러내고 뒤로 넘겨 볼륨을 준 스타일.'],
    'shaggy':[2,'wavy',5,'','wispy','층 없이 덥수룩하게 흐트러진 컷.'],
    'mullet':[2,'asym',2,'','blunt','앞과 옆은 짧고 뒤만 길게 남긴 컷.']
  });

  /* 성별 전용 값(ONLY), 색 표, 설정 묶음 차례. 화면이 항목을 그릴 때 쓴다 */
  const GROUP_META=[["base", "기본", "원본 포켓몬 해석의 큰 방향을 정한다", true], ["build", "체형", "Body Type 이 전체 실루엣을 정하고, 아래 항목이 그 안에서 조정한다", true], ["face", "얼굴", "Facial Character 가 전체 인상을 정하고, 아래 항목이 세부를 잡는다", true], ["hair", "머리", "Hairstyle 이 형태를 정하고, 길이와 앞머리가 그 안에서 조정한다", true], ["armor", "장갑 · 의장", "원원본 포켓몬 구조를 어디까지 인간 형태로 옮길지", false], ["shot", "연출", "포즈 · 시점 · 장비 강조처럼 그림의 찍는 방식", false]];
  const ONLY={
    'facial character':{'glamorous':'female','rugged':'male','weathered':'male','soft':'female'},
    'torso / chest build':{'full':'female','full bust':'female','powerful':'male','v-taper':'male'},
    'waist / hip silhouette':{'hourglass':'female','curvy':'female','broad-hipped':'female','narrow-hipped':'male'},
    'armor coverage':{'open':'female'},
    'lower-body treatment':{'robe-like armor':'female','mantle-like armor':'female'},
    'hair length':{'very long':'female'},
    'body type':{'curvy':'female','glamorous':'female','hourglass':'female','voluptuous':'female',
      'pear-shaped':'female','soft-figured':'female','petite':'female',
      'broad-shouldered':'male','burly':'male','lanky':'male','barrel-chested':'male','rangy':'male'},
    'hairstyle':{'twin tail':'female','twin braids':'female','space buns':'female','hime cut':'female',
      'ringlet curls':'female','crown braid':'female','chignon':'female','finger waves':'female',
      'buzz cut':'male','crew cut':'male','side part':'male','fade':'male','man bun':'male',
      'swept back':'male','shaggy':'male','mullet':'male'}
  };
  const COLOR_HEX={
    white:'#F2F2F2',platinum:'#E4E6EA',silver:'#C8CCD2','ash blonde':'#C9BBA0',blonde:'#E3C574',
    gold:'#D8A72B',amber:'#C87E24',orange:'#D97524',red:'#C0392B',crimson:'#8E1B2B',
    pink:'#E08AA8',purple:'#7E5AA8',lavender:'#B9A6DE','pale blue':'#9EC7E8',blue:'#2F6FD0',
    navy:'#1E3A6E',teal:'#1F8A8A',mint:'#7FD8C0',green:'#2E9E5B',brown:'#7A5230',
    gray:'#8A8F98',black:'#14161A'
  };
  const COLOR_KEYS={'hair color':1,'eye color':1,'second eye color':1};

  /* 일상컷(단일·콜라주)에 쓰는 고정 문구·목록 */
  const LOCAL_AXES=['overall_intensity','skin_exposure','action_level','source_influence','separates_preference'];
  const PAIR_ONLY=['pair_gap'];
  const ADV_EN={
    overall_intensity:'Overall sensual intensity',
    pair_gap:'Pair intensity gap',
    outfit_variety:'Outfit variety',
    scene_variety:'Scene variety',
    pose_variety:'Pose variety',
    camera_variety:'Camera variety',
    skin_exposure:'Visible non-intimate skin exposure',
    separates_preference:'Separates preference',
    action_level:'Action balance',
    direct_gaze_limit:'Maximum direct-camera gazes',
    smile_limit:'Maximum obvious smiles',
    unexpected_cuts:'Minimum unexpected coherent cuts',
    source_influence:'SOURCE influence outside source-editorial panels'
  };
  const TRAD_EX={burkini_modest:1,sarong_wrap:1,yukata_poolside:1,heritage_pattern_swim:1,
    onsen_after:1,hanbok_coverup:1,juban_inspired:1,hanbok_slip:1,qipao_silk_set:1,
    embroidered_corset:1,kebaya_lace:1,sari_blouse_set:1,hanbok_errand:1,festival_daily:1,
    heritage_evening:1,tea_ceremony_night:1,heritage_couture:1};
  const PROJECT_RULES = {
  "createInput": "TEXT-TO-IMAGE NEW CHARACTER. No input image is required: neither a character reference nor a source-creature picture. Generate from the text; any reference sheet requested below is the output, not an input. Do not automatically use earlier conversation images. For the image tool, omit both referenced_image_paths and num_last_images_to_include; these are call instructions, not image text.",
  "referenceInput": "IMAGE-GUIDED CONTINUATION. Use the user-approved character image supplied with this request as the identity input. A separate source-creature picture is not required. If the character reference is a multi-view sheet, all views describe the same person and equipment; follow OUTPUT MODE for the new image layout. Preserve the supplied identity while rendering it in the selected style, rather than copying the input image's rendering language.",
  "project": "Create one woman as an original source-inspired mechanical heroine. Keep functional engineering and a readable human silhouette; avoid unrelated weapons, crests and decorative greebling.",
  "casualProject": "Show one woman in a coherent everyday, fashion or other requested scene. Rendering remains controlled by STYLE CORE. Ordinary clothing is the default; armor or source-specific equipment appears only when explicitly requested for this scene. A source motif may be as subtle as a color accent or small accessory. Never require mascot cosplay or every anatomical feature of the source creature.",
  "source": "Use a few defining source colors, markings, silhouette cues and elemental motifs. Translate them into machinery, not mascot cosplay. Appendages are optional and species-specific. Source colors do not dictate human skin color; do not copy an existing trainer or pilot.",
  "sourceDesignCreate": "SOURCE-TO-MECHANISM DESIGN: Start from a fresh design. CREATIVE ENGINEERING PREPASS: before one image call, write a concise canonical design record in the prompt, not on canvas. User choices precede species choices; Optional is not absent by default. Distinguish core equipment and form-specific armor parts; selected/absent, mounted/stowed and visible/occluded are separate states. Hidden or stowed does not mean absent. Combine biology/silhouette and elemental type into one original functional signature mechanism and at most one surface detail on an existing part. Record function, shape, materials, colors/markings and anatomically correct body-space mounts; reuse across views. No unrelated equipment, anatomy/form changes or fixed species templates. Include the concise design record with the result for reuse, provisional until approved.",
  "sourceDesignReference": "SOURCE-TO-MECHANISM DESIGN: Preserve the approved source-to-mechanism design. APPROVED-DESIGN CREATIVE LOCK: Use explicit user changes first, then the approved design record/reference. Do not reinterpret core functions, motifs or component identity. Distinguish core equipment and form-specific armor parts. Hidden or stowed does not mean absent; unseen components remain unresolved unless established by approved views/records. Never restore explicitly absent core equipment from species associations or delete existing equipment because it is occluded. FORM DEFINITION may add/change protective plates, fins and articulation within the same core design, not invent unrelated appendages or mechanisms. Overdrive opens the existing base equipment. MOUNT CORRECTION PRIORITY: Repair attachment errors using BODY-SPACE MOUNT LOCK even when continuing the same form; this overrides incidental attachment-preservation language, not identity or core presence. Image approval alone does not approve an ambiguous attachment. Preserve established surface design unless the user requests redesign.",
  "sourceMounts": "BODY-SPACE MOUNT LOCK: Apply only to selected equipment; never decide its presence. Shell cradle centered on spine, inner face against back, dome rearward. Tail: independent sacral root on posterior pelvic midline below shell, extending rearward before curling; separate shell/tail/nozzle mounts. The curl is 3D, not a camera-facing disk. Forms may articulate parts but not relocate the main mounts. Body-relative geometry, not screen coordinates; explicit user mounting instructions override defaults.\n\nREAR EQUIPMENT OCCLUSION LOCK: Natural lateral projection is allowed for shell rims and connected distal curls. Do not delete, shrink or forcibly conceal signature equipment to fix mounts. Keep established dimensions; equipment follows torso/pelvis rotation, never independent shifts for visibility. In-frame means no cropping, not no occlusion. Sheets show separate roots in rear view/inset.\n\nFAIL CONDITIONS: tail rooted on front/side waist, hip, shoulder or arm; shell shifted sideways or spiral re-aimed for display; framing/anatomy changed to expose equipment. Body turn follows CAMERA & PRESENTATION. Natural distal overlap beside a limb is not itself a mounting error.",
  "create": "Invent one distinctive adult woman using the appearance settings. Anatomy is independent of equipment size.",
  "reference": "Use the SAME woman from the user-approved identity anchor; first drafts and successive outputs do not replace it automatically. Preserve face geometry, age, ethnicity, eye shape/colors and their sides, skin tone, hair color/cut/length, height and body proportions. Expression and natural hair motion may change, not facial structure or haircut. One approved image suffices; extra design images control only named armor details, never another face/body. Creation-stage parameters do not override the anchor. FRONT-VIEW ANATOMY AUTHORITY: for sheets, the main front full-body view controls proportions and any contradictory depiction of the SAME skin/textile surface. Do not average conflicting views or widen the body from rear perspective. Rear views/insets explain equipment and genuinely rear-only coverage; never propagate rear fabric onto front skin. Explicitly approved alternative anatomy overrides this default. A single-image reference controls its own anatomy. Compare proportions with pose/perspective accounted for, not literal pixel widths.",
  "armorSymmetry": "BILATERAL ARMOR: paired shoulder, arm, thigh, knee, shin and footwear use matching part inventory, dimensions and anatomical mounting levels. Only explicitly requested or explicitly approved asymmetric equipment is exempt, not accidental mismatches. Pose, perspective, cable curves and panel-opening angles may differ. All views/insets document the same parts; compare in body coordinates, not screen widths.",
  "createForm": "Establish the selected anatomy first; fit the chosen armor outside it. Body size and skin/textile contours are independent of armor volume. Keep source colors and structural motifs, with a clearly readable form silhouette.",
  "formCommon": "The same human body sits beneath every form. Lock skeletal shoulder width, ribcage, bust, waist, pelvis, thigh and calf thickness, limb lengths and height to the identity reference. Add armor volume OUTSIDE this unchanged body; never inflate the torso or thighs for heavy armor or slim the body for mobility. Exposed skin and flexible undersuit contours stay consistent. Form changes affect armor layering, thickness and arrangement, not anatomy. Keep source-derived colors and recognizable structural motifs. At equal camera scale, light, heavy and mobility must be distinguishable by outer silhouette before fine details. Armor is not an immutable identity lock.",
  "referenceForm": "Preserve attached design details where compatible with the selected form and MOUNT CORRECTION PRIORITY. Repair erroneous equipment placement without changing body proportions; pose follows CAMERA & PRESENTATION. The identity sheet anchors the person, not the original armor thickness or silhouette when a DIFFERENT form is selected. FORM DEFINITION authorizes the selected armor transformation; style instructions about preserving armor prevent incidental redesign, not this requested form change. For overdrive with a separate base-form image, preserve that image's armor inventory and construction while opening it.",
  "materialCommon": "Render distinct materials in the selected style. Exposed human skin is living skin: natural tone and soft anatomical shading, no panel seams or metallic reflections. Do not convert covered areas into bare skin to fix textures. Only explicit form/outfit changes authorize outer coverage changes; preserve underlying skin/textile boundaries. Color alone does not identify material.",
  "materialArmor": "BODYSUIT: flexible textile, seams and tension folds; a cream or flesh-coloured bodysuit remains fabric. Honor requested finishes. ARMOR: rigid thickness, bevels, seams and hard reflections. Openings reveal established underlying material, never bare skin by default.",
  "materialClothing": "Clothing remains clothing: distinguish fabric from exposed skin through garment edges, seams, drape and material-appropriate folds. Preserve the requested fabric and finish, including satin, leather or other explicitly chosen materials; do not force everything matte. Do not turn ordinary garments into rigid anatomical shells or introduce mechanical equipment to separate materials.",
  "overdrive": "OVERDRIVE is an unstable high-output state, not a maintenance or cooling demonstration. Open selected existing seams and panels of the base armor; do not open every joint by default. Reveal the established inner frame and bodysuit. Combine mechanical opening, visibly stronger source-appropriate energy and bodily tension. Bright internal cores and seams cast local light onto nearby armor; concentrated energy escapes from opened regions; tense hands, a braced stance and focused intensity convey strain without changing anatomy. Explicit expression settings remain authoritative. Intensify the existing elemental signature: fire sources may amplify their flames with heat distortion and embers, electric sources use discharge arcs, and other sources use their own characteristic energy rather than universal fire or lightning. Keep the face, hands, panel boundaries and silhouette readable; avoid a frame-filling effect cloud. Preserve the base armor's recognizable structure, colors, mass and attachment points. Do not invent extra shoulder or thigh blocks, weapons or appendages to manufacture an opening. Floating is optional and limited to panels already present in the base armor, with a clear relationship to their original attachments. Opening is not bodily mutation, a different person or automatic escalation to the heaviest armor. Energy follows the selected rendering style: even restrained styles must show relative escalation through visible opening, concentrated energy cues and bodily tension without abandoning their style.",
  "negative": "One coherent human body with two arms and two legs; no duplicated hands, faces or accidental limbs. Source-derived appendages remain intentional design elements, not extra human limbs. When a source-derived tail is present, its root must attach on the posterior centerline at the sacrum or lower back, with a physically continuous base and correct body occlusion. It must never originate from the abdomen, front waist, side waist, chest or front hip. Keep facial identity and anatomy independent of rendering stylization, outfit and armor volume. No childlike age regression, generic identity replacement, unintended collage, captions, logos or watermarks. Lighting, surfaces and edge treatment follow the selected style in every mode.",
  "final": "Before finishing, verify one woman, the chosen source identity, the correct output mode, coherent anatomy and the selected rendering style. For armored modes verify the chosen layering or opening logic without changing the body. For casual scenes verify that no form rules leaked into the outfit. Obey identity and mode boundaries even when a local detail request conflicts with them.",
  "referenceFinal": "Compare face, hair and body with the approved identity anchor supplied for this request.",
  "heavyOverdrive": "HEAVY PANEL TRAVEL: retain the enclosing base armor inventory when opening; do not revert to isolated light-form plates or remove abdominal and pelvic armor. For a newly designed heavy base, establish the full-body shell first. Make the opening of the existing heavy armor unmistakable at thumbnail scale through large plate displacement and visible air gaps, not just brighter seams or tiny cooling vents. Where present in the base design, swing the large shoulder outer shells outward on hinges by roughly 45-60 degrees, separate forearm outer shells on visible support linkages, lift the existing front/outer thigh cuisses away from the established underlying material, and open the broad outer shin shells like large solid doors to reveal inner frame, radiators and actuators. Do not subdivide the broad heavy plates into feather-like fins, narrow decorative blades or new fragments; retain their solid thickness, coverage when closed and recognizable markings. Adapt the angle to joint clearance and the existing construction; these are selected shell groups, not every joint. Reorient the SAME thick plates around their original attachment points, keeping the base armor inventory and protective mass. Do not add fins, new panels, fragmented debris or equipment. Leave chest and pelvic protection intact, and preserve established exposed skin and opaque fabric boundaries. The original identity anchor controls anatomy; a corrected base-form portrait controls armor construction and must also retain that anatomy. Keep camera, figure scale and margins; fit the opening into the existing framing rather than zooming out. Source-appropriate internal energy lights the undersides of the displaced plates while the body and panel edges remain readable.",
  "heavyOverdriveConditional": "Only if the attached base armor is heavy, apply the following heavy-panel instructions; otherwise keep the selected base form's normal opening rules without adding heavy armor.",
  "portraitCamera": "Full-body comparison portrait, vertical 2:3. Keep head, feet and equipment in frame with consistent margins. COMPARISON BODY ANGLE: 25-35 degrees from frontal. Rotate torso, pelvis and mounted equipment together in one coherent front-three-quarter stance; turn the face gently toward the camera without twisting only the shoulders. Use the same turn direction and angle across light, heavy, mobility and overdrive. The sheet's main front view controls anatomy and camera height, not a mandatory frontal pose; rear views/insets explain equipment. Compose one full-body figure, never the sheet layout or its reduced figure scale. If a prior comparison portrait is frontal, establish this slight body turn while keeping camera height, focal length, subject scale, framing and background layout. Once this comparison angle is established, retain it across forms with only small natural pose/expression changes. Explicit user viewpoint instructions override the default. An action/casual reference does not impose its dynamic camera. Preserve shell/tail mounts and established dimensions; allow naturally visible shell curvature, rim and distal tail without pulling equipment sideways to display it or forcing it out of sight. COMPARISON ENVIRONMENT: Use a recognizable setting with spatial depth, such as a lab, hangar or greenhouse suited to the design. If the reference has no setting, establish one once; otherwise retain its setting. Keep the same location, background layout and lighting across forms. Use restrained detail and contrast behind the readable figure, with no foreground obstruction. Render the setting in the selected style, including sparse painted or ink suggestions where appropriate; avoid an empty studio void by default. Do not shrink the figure or change framing to show scenery. Explicit user background requests override this default. No dramatic action camera, strong foreshortening or foreground occlusion.",
  "freeCamera": "Camera, crop, viewpoint, pose and environment may change to support this scene. Do not inherit the portrait's fixed camera or framing. Preserve identity and readable anatomy through movement. The selected rendering style still controls lighting and surfaces; ACTION does not automatically mean anime.",
  "measurement": "B/W/H means approximate bust/waist/hip circumferences in cm, not widths or armor dimensions. Use as visual proportion guidance within the chosen build, not literal CAD constraints or a reason to exaggerate anatomy."
};
  const FORM_PROFILES = {
  "light": "LIGHT: separate regional armor assemblies on a compact supporting frame: one protective layer at shoulders, arms, hips/thighs and lower legs, with flexible interfaces instead of full enclosure. Lightness comes from regional coverage and articulation, not flimsy plates. Skin exposure is optional; outfits may fill gaps. LIGHT STRUCTURAL DEPTH: plate cross-sections, bevelled rims, recessed connections and articulated joints, without heavy stacked shells. This does not require a continuous bodysuit or broad pale panels; honor explicit suits. Preserve approved coverage and skin/textile boundaries in continuation; detail adds no anatomy or equipment.",
  "heavy": "HEAVY: multiple overlapping protective layers forming a full-body armored shell outside the unchanged person. HEAVY COVERAGE: FULL-BODY ENCLOSURE: connect protection around the chest, back, lateral ribs, abdomen, waist, pelvis, upper arms, forearms, thighs, knees, shins and feet. Wrap front, sides and rear rather than leaving light-form body gaps between isolated plates. Use segmented abdominal and waist plates, articulated pelvic protection and wraparound cuisses covering the front and outer upper thighs as well as their rear surfaces. Keep the face visible; a helmet is not required. Small flexible joint clearances at neck, armpits, elbows, groin and knees permit movement but must not become large exposed torso or thigh windows. Heavy selection itself authorizes outer armor over previously exposed skin or textile, including the abdomen; preserve those underlying materials without enlarging the body or adding padded flesh. This applies to both new creation and a transition from a lighter reference. Explicit user coverage exceptions take precedence. Build substantial shoulder housings, forearm shells and load-bearing greaves, with thick rims, recessed joints and deep overlaps. Each greave has one dominant broad front plate and a deep wraparound side housing, not repeated thin fins. Preserve source colors, motifs and selected core equipment; body protection is not a new source appendage. Added thickness is external shell and clearance, not increased anatomy. BODY / SHELL SEPARATION: treat this as replacing external equipment on the same person, not generating a heavier-bodied person. Establish anatomical shoulder joints, ribcage, bust, natural waist, pelvic width, hip joints and inner-thigh contours from the selected anatomy for new creation or authoritative identity view for continuation before fitting armor. Preserve head-to-pelvis, pelvis-to-knee and knee-to-ankle relationships and limb thickness, accounting for pose and perspective. Keep visible skin and fitted textile contours at the established dimensions; do not pad or round the undersuit to merge it into the outer shell. The body does not need to fill the armor cavity. Use stand-off brackets, recessed connections and air space between the unchanged body and thick shells. Add protective volume outward and forward from the body, without spreading hip joints, widening the pelvis or moving inner-thigh contours inward to fill the shells. Do not infer a larger breast or ribcage from a larger chest cuirass; its internal clearance and shell thickness explain the outer volume. Retain broad external shoulder housings, thick forearms and heavy greaves; anatomy correction must neither shrink the armor into a light form nor make the person thinner than the selected or approved anatomy. A secondary armor reference controls equipment only, even if its body has drifted. Preserve underlying skin/textile boundaries; outer armor may cover them as authorized, but do not invent additional padding or fabric across uncovered skin.",
  "mobility": "MOBILITY: use thin armor arranged outward into a visibly expanded, agile silhouette distinct from regional light armor and enclosing heavy armor. Use source-derived swept-back fins, separated directional panels and compact rearward propulsion structures with clear negative space and readable attachments. Reduce obstructive armor around moving joints while retaining established underlying skin/textile boundaries. The difference must be visible at thumbnail scale through projection, direction and spacing, not merely smaller light-armor plates, a few glowing strips or more skin exposure. Keep exact reference body thickness and proportions. Avoid heavy stacked housings, generic giant wings and unrelated equipment; adapt directional structures to the source motifs."
};
  const OUTPUT_PROFILES = {
  "portrait": "SINGLE-FIGURE COMPARISON PORTRAIT: generate exactly one full-body depiction of the approved woman showing the selected armor form clearly. Calm staging, legible layer boundaries, small pose variation and restrained effects. No secondary view, duplicate figure or detail inset, even when the identity reference is a multi-view character sheet.",
  "overdrivePortrait": "SINGLE-FIGURE COMPARISON PORTRAIT. OVERDRIVE COMPARISON STAGING: exactly one full-body depiction of the approved woman in the selected base armor under visible high-output strain. Legible opened panels, concentrated source-specific energy and tense hands or a braced stance distinguish this state from the normal portrait. Keep comparison camera, subject scale and full silhouette; small pose changes express strong tension without an action leap or dramatic foreshortening. This replaces the normal portrait's calm staging and restrained-effects default. Preserve an explicitly selected expression. No secondary view, duplicate figure or detail inset.",
  "action": "ACTION: generate one dynamic scene using the selected armor form. Pose, viewpoint, motion, effects and environment may be dramatic while the woman and form remain recognizable. Action is a presentation mode, not an additional armor form.",
  "casual": "CASUAL: generate one standalone scene of the same woman. Outfit, pose, expression and environment follow this scene's requests independently of armor forms. Source motifs are optional subtle accents; do not import a form silhouette or require source cosplay."
};
  // Only portrait + create uses a multi-view layout; it is still one reference image.
  const REFERENCE_SHEET_PROFILE = {
    "output": "INITIAL CHARACTER REFERENCE SHEET: show the same individual, one woman in the same selected armor configuration. Layout: large front full-body view on the left, equal-scale rear three-quarter full-body view in the middle, exactly four detail insets in a narrow right column. Insets, top to bottom: face close-up; source-derived marking or armor detail; main back-mounted structure and attachment; footwear and lower-leg construction. If a feature is absent, enlarge an existing characteristic detail instead. Document one design, not alternate forms.",
    "camera": "One vertical 3:4 canvas; align main-view head/foot levels. Bodies/equipment in frame; natural occlusion. Neutral standing: front slightly turned or frontal, rear shows mounts. Compact spacing; no shrinking/zoom-out. Insets alone use close-ups. ENVIRONMENT DEFAULT: one setting with depth (lab/hangar/greenhouse), low contrast/detail, consistent light; follow style, including sparse ink cues. No empty void, action perspective or foreground obstruction. Explicit user background requests override this default.",
    "negative": "INSET FIDELITY LOCK: Each inset magnifies a named installed component, never a new design. Match main-view silhouette, panels, colors, markings, channels, fasteners and mounts; finer detail may increase, structure may not. Plan details before views. Keep face, hair, anatomy, coverage and left/right identity identical. Each full body has two arms and two legs; appendages are equipment. If tailed, the rear three-quarter view and equipment inset must clearly show the tail's posterior attachment root at the sacrum, continuously connected, never front/side waist. No alternate faces/outfits, extra limbs, childlike proportions or text overlays.",
    "final": "Verify both full-body views and four matching detail insets, readable face and attachments, consistent anatomy and selected style. This sheet becomes an identity anchor only after user approval."
};
  const PARAM_GUIDES = {
    "body type": {
      "slender": ["골격과 팔다리가 가늘고 연부조직 볼륨이 적어요.", "narrow frame and slim limbs, low soft-tissue volume"],
      "athletic": ["중간 골격에 운동으로 발달한 근육을 표현해요.", "moderate frame with developed functional muscles"],
      "curvy": ["허리와 가슴·골반 사이의 부드러운 곡선 차이를 강조해요.", "flowing bust-to-waist and hip-to-waist curves"],
      "glamorous": ["가슴과 골반의 풍만함, 잘록한 허리로 표현해요. 화장이나 의상 지시는 아니에요.", "full bust and hips with a defined waist; anatomy, not makeup or outfit"],
      "muscular": ["어깨·팔·몸통·다리에 근육의 두께와 구분이 뚜렷해요.", "substantial, visibly defined muscles through torso and limbs"],
      "heavy-built": ["넓은 골격과 두꺼운 몸통·팔다리를 뜻해요. 중장갑이나 키를 뜻하지 않아요.", "broad frame, thick torso and limbs; independent of armor and height"],
      "tall and lean": ["큰 키에 가늘고 길게 이어지는 몸통과 팔다리를 조합해요.", "tall stature, lean torso and long slender limbs"],
      "petite": ["작은 성인 골격과 아담한 키예요. 아동 비례로 바꾸지 않아요.", "short stature and small adult frame; adult head-to-body proportions"],
      "hourglass": ["가슴과 골반의 정면 폭이 비슷하고 허리가 좁아요. 전체 볼륨은 별개예요.", "similar bust and hip widths, distinctly narrower waist; volume is separate"],
      "voluptuous": ["가슴·골반·허벅지의 풍부한 연부조직과 큰 굴곡을 표현해요.", "generous soft-tissue volume at bust, hips and thighs with pronounced curves"],
      "toned": ["근육 크기를 키우기보다 피부 아래 잔근육 윤곽을 보여줘요.", "subtle muscle definition without large muscle mass"],
      "wiry": ["가느다란 골격 위에 힘줄과 단단한 근육 윤곽이 보여요.", "slim frame with taut, sinewy muscle definition"],
      "soft-figured": ["근육 경계가 두드러지지 않는 부드러운 살집이에요.", "soft flesh contours with little visible muscle separation"],
      "pear-shaped": ["어깨·가슴보다 골반과 허벅지 쪽에 폭과 볼륨이 많아요.", "hips and thighs wider and fuller than shoulders and bust"],
      "inverted triangle": ["골반보다 어깨가 넓고 아래로 좁아지는 골격이에요.", "shoulders wider than hips, upper body tapering downward"],
      "stocky": ["상대적으로 짧은 팔다리와 폭이 있는 단단한 몸통이에요.", "compact broad torso and relatively short, sturdy limbs"],
      "statuesque": ["큰 키와 균형 잡힌 긴 비례, 탄탄한 볼륨이에요.", "tall, balanced long proportions with substantial firm contours"],
      "broad-shouldered": ["골반과 비교해 어깨뼈 사이 폭이 넓어요. 견갑 장비 크기와 달라요.", "wide skeletal shoulder span relative to hips"],
      "burly": ["넓은 골격 위로 몸통과 팔다리의 근육·살집이 두꺼워요.", "large broad frame with thick muscular and soft-tissue mass"],
      "lanky": ["큰 키에 특히 길고 가느다란 팔다리예요.", "tall frame with especially long, thin limbs"],
      "barrel-chested": ["흉곽 자체가 앞뒤로 깊고 옆으로 넓어요. 가슴 크기와는 별개예요.", "wide, deep ribcage; independent of breast volume"],
      "rangy": ["긴 팔다리에 가늘고 유연한 근육이 이어져요.", "long limbs with lean, flexible muscle contours"]
    },
    "height impression": {
      "short": ["성인 비례 안에서 키가 작게 읽히도록 해요. 화면 속 인물 크기를 줄이지 않아요.", "short adult stature; keep subject framing unchanged"],
      "average": ["선택한 체형 안에서 키의 크고 작음이 두드러지지 않아요.", "moderate stature within the build"],
      "tall": ["성인 장신 비례로 표현해요. 카메라를 뒤로 빼라는 뜻은 아니에요.", "tall adult stature; preserve framing"],
      "very tall": ["장신보다 더 큰 키 인상이며 머리나 관절을 왜곡하지 않아요.", "exceptionally tall adult stature with plausible head and joint proportions"]
    },
    "shoulder build": {
      "narrow": ["선택한 체형 안에서 어깨뼈 사이 폭을 조금 좁혀요.", "relatively narrow skeletal shoulder span within the build"],
      "average": ["체형에 맞는 중간 어깨 폭을 유지해요.", "moderate skeletal shoulder span within the build"],
      "broad": ["골격의 어깨 폭을 넓혀요. 어깨 장갑 부피와는 별개예요.", "relatively broad skeletal shoulder span, independent of pauldrons"]
    },
    "torso / chest build": {
      "slim": ["흉곽의 폭·앞뒤 두께와 상체 살집을 절제해요.", "slim ribcage and low upper-torso soft-tissue volume"],
      "balanced": ["선택한 체형에 맞는 중간 흉곽·가슴 볼륨이에요.", "moderate ribcage and bust volume within the build"],
      "full": ["흉곽 주변과 가슴을 포함한 상체의 부드러운 볼륨을 늘려요.", "fuller upper-torso soft tissue including bust"],
      "powerful": ["흉곽 폭·두께와 등·가슴 주변 근육을 강조해요.", "broad deep ribcage with strong upper-torso muscles"],
      "v-taper": ["어깨·등의 폭에서 허리로 뚜렷하게 좁아져요.", "upper back and shoulders taper distinctly to the waist"],
      "full bust": ["흉곽과 어깨는 유지하고 가슴의 볼륨만 강조해요.", "fuller breast volume without widening ribcage or shoulders"]
    },
    "torso length": {
      "short": ["어깨선에서 골반까지의 길이가 체형 내에서 짧은 편이에요. 복부를 찌그러뜨리지 않아요.", "relatively short shoulder-to-pelvis span; retain anatomical spacing"],
      "balanced": ["선택한 체형에 맞는 중간 몸통 길이예요.", "moderate shoulder-to-pelvis span within the build"],
      "long": ["어깨선에서 골반까지의 길이를 조금 길게 잡아요.", "relatively long shoulder-to-pelvis span within the build"]
    },
    "waist / hip silhouette": {
      "straight": ["허리와 골반 폭의 차이가 적은 윤곽이에요.", "small waist-to-hip width contrast"],
      "athletic": ["허리가 탄탄하고 골반으로 이어지는 굴곡이 절제돼요.", "firm waist with restrained hip curvature"],
      "balanced": ["체형에 이미 정한 허리·골반 비율을 과장 없이 유지해요.", "retain the build's waist-to-hip ratio without extra exaggeration"],
      "hourglass": ["골반보다 허리가 확실히 좁고 양옆 곡선이 이어져요.", "distinct waist indentation curving outward into hips"],
      "curvy": ["허리에서 골반 바깥으로 이어지는 둥근 곡선을 강조해요.", "rounded outward hip curves from the waist"],
      "narrow-hipped": ["선택한 골격 안에서 골반 폭을 좁게 잡아요.", "relatively narrow pelvic span within the build"],
      "broad-hipped": ["골반 자체의 가로 폭을 넓혀요. 허벅지 굵기와는 별개예요.", "relatively broad pelvic span; thigh thickness is separate"]
    },
    "leg proportion": {
      "balanced": ["몸통에 맞는 다리 길이예요. 굵기는 하체 굵기에서 정해요.", "moderate leg length relative to torso"],
      "long": ["몸통 대비 다리가 긴 편이며 무릎 위치도 함께 맞춰요.", "long hip-to-floor span with proportionate thigh and shin lengths"],
      "very long": ["몸통 대비 다리가 특히 길되 관절과 성인 비례를 유지해요.", "especially long legs with plausible adult joint proportions"],
      "powerful": ["길이보다는 허벅지·종아리의 발달한 근육을 뜻해요.", "developed thigh and calf muscles; no implied leg-length change"]
    },
    "lower-body build": {
      "slender": ["장갑 아래 허벅지·종아리의 굵기를 가늘게 잡아요.", "slender anatomical thighs and calves beneath armor"],
      "balanced": ["체형에 맞는 중간 허벅지·종아리 굵기예요.", "moderate thigh and calf thickness within the build"],
      "full": ["허벅지·종아리 자체의 볼륨을 풍부하게 해요. 장갑 부피와 별개예요.", "fuller anatomical thighs and calves, independent of armor volume"]
    },
    "face shape": {
      "oval": ["광대 부근이 조금 넓고 이마·턱으로 완만하게 좁아지는 타원형이에요.", "oval outline, slightly widest at cheekbones with gradual taper"],
      "angular": ["광대와 턱 모서리의 방향 전환이 보여요. 턱끝 모양은 턱 설정을 따라요.", "visible cheekbone and jaw-angle transitions; chin follows its own setting"],
      "heart-shaped": ["이마·광대가 하관보다 넓어요. 턱끝까지 반드시 뾰족할 필요는 없어요.", "forehead and cheekbones wider than lower face; chin tip follows its own setting"],
      "elongated": ["가로 폭보다 세로 길이가 도드라지는 얼굴형이에요.", "vertical face length pronounced relative to width"],
      "compact": ["이마부터 턱까지의 구간이 짧고 응축된 성인 얼굴이에요.", "compact adult facial proportions with short vertical spacing"],
      "softly rounded": ["얼굴 외곽이 넓은 곡선으로 이어져요. 볼살을 자동으로 늘리지 않아요.", "rounded outer facial outline with smooth transitions; no added cheek fullness"],
      "sharp": ["광대와 하관의 윤곽이 또렷해요. 턱끝과 폭은 세부 선택이 우선이에요.", "crisp cheekbone and lower-face contours; explicit width and chin take priority"]
    },
    "jaw & chin": {
      "soft rounded jaw": ["하관 폭을 적당히 유지하고 턱끝을 넓은 U자 곡선으로 그려요. 볼살 추가나 V자 턱이 아니에요.", "rounded U-shaped lower-face outline with moderate width and a broad curved chin tip; no pointed apex, V taper or added cheek fullness"],
      "balanced jawline": ["턱의 폭·각·길이가 두드러지지 않는 완만한 윤곽이에요.", "moderate jaw width, angle and chin length with gradual transitions"],
      "angular defined jaw": ["귀 아래 턱 모서리와 하악선을 또렷하게 해요. 사각 폭을 강제하지 않아요.", "defined mandibular corners and lower-jaw edges; no automatic widening"],
      "square broad jaw": ["하관 폭을 유지하고 양쪽 턱 모서리와 넓은 턱끝을 표현해요.", "broad lower jaw with squared corners and a wide chin tip"],
      "narrow tapered chin": ["볼 아래에서 턱끝으로 확실히 좁아져요. 턱 길이를 늘리지는 않아요.", "lower face narrows distinctly toward a small chin tip without lengthening it"],
      "wide heavy chin": ["턱끝의 폭과 앞쪽 볼륨을 강조해요. 볼이나 얼굴 전체를 키우지 않아요.", "wide, substantial chin tip without enlarging cheeks or the entire face"],
      "long chin with defined jaw": ["아랫입술 아래부터 턱끝까지를 길게 하고 턱선을 또렷하게 해요.", "longer lower-lip-to-chin span with defined jaw edges"],
      "receding soft chin": ["측면에서 턱끝이 아랫입술보다 뒤로 들어가요. 짧은 얼굴과는 달라요.", "chin projects less forward than lower lip in profile, with a soft jaw edge"]
    },
    "face length": {
      "short": ["헤어라인부터 턱까지의 세로 길이가 상대적으로 짧아요.", "relatively short hairline-to-chin span"],
      "balanced": ["얼굴형 안에서 과장 없는 중간 세로 길이예요.", "moderate hairline-to-chin span within the face shape"],
      "long": ["헤어라인부터 턱까지의 세로 길이가 상대적으로 길어요.", "relatively long hairline-to-chin span"]
    },
    "face width": {
      "narrow": ["광대 사이 가로 폭이 상대적으로 좁아요. 턱끝 모양은 별개예요.", "relatively narrow cheekbone-to-cheekbone span; chin shape is separate"],
      "medium": ["얼굴형에 맞는 중간 광대 폭이에요.", "moderate cheekbone-to-cheekbone span within the face shape"],
      "wide": ["광대 사이 가로 폭이 넓어요. 볼살을 더하는 지시가 아니에요.", "relatively wide cheekbone span, not extra cheek fat"]
    },
    "eye shape": {
      "narrow": ["눈꺼풀 사이 세로 틈이 좁은 눈이에요. 눈꼬리 각도와 구분해요.", "low vertical eyelid opening; corner tilt is separate"],
      "almond": ["가운데가 넓고 양끝으로 좁아지는 아몬드 윤곽이에요.", "almond outline, widest centrally and tapering toward both corners"],
      "large": ["눈꺼풀 개방이 큰 기본 눈매예요. 별도 눈 크기 선택이 우선해요.", "open, rounded eyelid outline; explicit eye size controls scale"],
      "sharp": ["눈꺼풀 선이 또렷하고 바깥쪽이 들린 기본 눈매예요. 별도 각도가 우선해요.", "crisp eyelid edges, upward corners unless eye tilt is specified"],
      "drooping": ["바깥 눈꼬리가 내려간 기본 눈매예요. 별도 각도가 우선해요.", "soft eyelid contour, downward outer corners unless eye tilt is specified"],
      "upturned": ["바깥 눈꼬리가 안쪽보다 올라가요. 별도 각도가 우선해요.", "outer corners above inner corners unless eye tilt is specified"]
    },
    "eye size": {
      "small": ["얼굴 폭에 비해 눈의 크기가 작아요. 눈을 가늘게 뜨는 표정과 달라요.", "small eyes relative to face width, not squinting"],
      "medium": ["얼굴 폭에 맞는 중간 눈 크기예요.", "moderate eye size relative to face width"],
      "large": ["얼굴 폭 대비 큰 눈이에요. 나이나 턱 모양은 바꾸지 않아요.", "large eyes relative to face width"]
    },
    "eye tilt": {
      "downturned outer corners": ["눈의 안쪽 끝보다 바깥 끝을 낮게 그려요.", "outer eye corners lower than inner corners"],
      "level outer corners": ["눈의 안쪽과 바깥쪽 끝 높이를 비슷하게 맞춰요.", "inner and outer eye corners at similar height"],
      "upturned outer corners": ["눈의 안쪽 끝보다 바깥 끝을 높게 그려요.", "outer eye corners higher than inner corners"]
    },
    "nose character": {
      "small delicate nose": ["콧대·콧방울·코끝을 얼굴 대비 작고 가늘게 해요.", "small nose with fine bridge, narrow alae and small tip"],
      "balanced nose": ["코의 길이·폭·돌출을 얼굴 안에서 중간 정도로 해요.", "moderate nose length, width and projection relative to face"],
      "prominent defined nose": ["콧대와 코끝의 돌출·입체감을 뚜렷하게 해요.", "noticeably projecting bridge and tip with defined structure"],
      "straight slender bridge": ["콧등이 곧고 콧대 폭이 가늘어요.", "straight nasal profile with a narrow bridge"],
      "aquiline nose with convex bridge": ["측면 콧등이 바깥으로 볼록하게 휘어요.", "convex bridge visible in nasal profile"],
      "rounded soft tip": ["코끝이 둥글고 부드러워요. 코 전체를 크게 하지 않아요.", "rounded nasal tip without enlarging the whole nose"],
      "broad low bridge": ["콧대 높이가 낮고 가로 폭이 넓어요.", "low nasal bridge with broad width"],
      "short nose with upturned tip": ["코 길이가 짧고 끝이 조금 위로 향해요.", "short nasal length with a slightly upward tip"],
      "long nose with low tip": ["코 길이가 길고 끝이 아래로 향해요.", "long nasal length with a downward tip"]
    },
    "lips": {
      "thin lips": ["입술의 붉은 부분 두께가 얇아요. 입 너비는 별개예요.", "thin upper and lower vermilion; mouth width is separate"],
      "medium lips": ["입술 두께가 중간 정도예요.", "moderate upper and lower lip thickness"],
      "full lips": ["윗입술·아랫입술의 두께를 도톰하게 해요.", "full upper and lower vermilion"],
      "fuller lower lip": ["윗입술보다 아랫입술을 더 도톰하게 해요.", "lower lip fuller than upper lip"],
      "bow-shaped upper lip": ["윗입술 중앙에 두 봉우리와 오목한 홈을 표현해요.", "defined Cupid's bow with two peaks and a central dip"],
      "straight even lips": ["기본 입술 경계의 굴곡이 작아요. 무표정을 강제하지 않아요.", "relatively even lip border at rest; expression may change"],
      "wide mouth": ["입꼬리 사이의 가로 길이를 넓혀요. 두께와 달라요.", "wide corner-to-corner mouth span; thickness is separate"],
      "small mouth": ["입꼬리 사이의 가로 길이를 작게 해요. 나이를 낮추지 않아요.", "short corner-to-corner mouth span; preserve adult age"]
    },
    "hair length": {
      "very short": ["풀어 놓은 머리 기준 두피 가까이에서 귀 위까지예요. 짧은 고정 컷은 그 범위 안에서 조절해요.", "scalp-close to above-ear length; within the selected cut"],
      "short": ["풀어 놓은 머리 기준 귀에서 턱선 부근이에요. 픽시·버즈 등은 고유 길이를 유지해요.", "ear-to-jaw length unless the selected cut requires shorter hair"],
      "medium": ["풀어 놓은 머리 기준 목에서 어깨 부근이에요. 픽시·버즈 등 고정 컷을 늘리지 않아요.", "neck-to-shoulder length unless the selected cut fixes another range"],
      "long": ["풀어 놓은 머리 기준 어깨 아래에서 등 중간까지예요. 묶은 길이와 구분해요.", "below-shoulder to mid-back loose length; tied hair may appear shorter"],
      "very long": ["풀어 놓은 머리 기준 허리 또는 그 아래까지예요. 짧은 고정 컷을 덮어쓰지 않아요.", "waist-length or longer when loose; preserve any fixed short cut"]
    },
    "hair texture": {
      "fine": ["머리카락 한 올이 가늘고 유연해요. 숱이 적다는 뜻은 아니에요.", "fine flexible strands, independent of hair density"],
      "medium": ["한 올 굵기와 뻣뻣함이 중간 정도예요. 머리 길이와 달라요.", "medium strand thickness/stiffness"],
      "thick": ["한 올이 굵고 형태를 잘 유지해요. 부피·인종·곱슬은 별개예요.", "coarse, firm strands; independent of volume, ethnicity and curl pattern"]
    },
    "hair volume": {
      "flat": ["모근이 두피 가까이 붙고 옆으로 부풀지 않아요.", "low root lift and little outward fullness"],
      "moderate": ["모근 들림과 머리 전체 부피가 중간 정도예요.", "moderate root lift and overall fullness"],
      "full": ["모근이 들리고 머리 덩어리의 부피가 풍성해요. 머리통을 키우지 않아요.", "high root lift and full hair mass without enlarging the skull"]
    },
    "parting": {
      "center part": ["정수리에서 이마 중앙으로 가르마가 보여요.", "visible central scalp part"],
      "slight off-center part": ["중앙에서 조금 벗어난 가르마예요.", "visible scalp part slightly off center"],
      "deep side part": ["한쪽 관자놀이 쪽으로 치우친 가르마예요.", "visible scalp part far to one side"],
      "no visible part": ["두피에 선명한 가르마 선이 보이지 않아요. 옆으로 넘긴 앞머리는 가능해요.", "no exposed scalp part line; directional fringe is allowed"],
      "swept back": ["이마에서 뒤쪽으로 모근 방향을 넘겨요. 앞머리를 골랐다면 그 부분은 유지해요.", "roots directed backward; retain explicitly selected fringe"]
    },
    "bangs": {
      "none": ["앞으로 내린 앞머리 없이 이마가 드러나요.", "no fringe hanging over forehead"],
      "straight bangs": ["이마 위 앞머리의 끝이 수평에 가깝게 이어져요.", "fringe with a nearly horizontal lower edge"],
      "side-swept bangs": ["이마를 비스듬히 가로질러 한쪽으로 흐르는 앞머리예요.", "fringe swept diagonally across forehead"],
      "curtain bangs": ["가운데가 갈라져 얼굴 양옆으로 곡선처럼 흘러요.", "split fringe curving outward on both sides"],
      "long side bangs": ["옆으로 흐르는 긴 앞머리예요. 고정된 짧은 컷은 그 범위 안에서 표현해요.", "long lateral fringe within the selected cut's length range"],
      "long side bangs covering one eye": ["한쪽 눈 위를 머리카락으로 덮어요. 눈 자체를 없애지 않아요.", "side fringe occluding one eye, which remains anatomically present"],
      "asymmetric bangs": ["좌우 끝 길이가 다른 앞머리예요.", "fringe with unequal left and right lengths"],
      "parted bangs": ["앞머리를 가운데에서 두 갈래로 나눠요.", "fringe divided centrally; scalp part may remain concealed"],
      "choppy bangs": ["앞머리 끝이 여러 길이의 층과 삐침으로 나뉘어요.", "fringe with uneven, clearly separated tips"]
    },
    "apparent age": {
      "20s": ["20대 성인의 얼굴과 신체 비례예요.", "adult woman in her twenties"],
      "30s": ["30대 성인의 인상이며 노화 흔적을 과장하지 않아요.", "adult woman in her thirties; restrained age cues"],
      "40s": ["40대 성인의 인상이며 주름을 과장하지 않아요.", "adult woman in her forties; natural age cues"],
      "mature adult": ["연륜 있는 성인 인상이에요. 정확한 나이는 직접 입력으로 정할 수 있어요.", "mature adult woman with visible but restrained age cues"],
      "youthful adult": ["20대 성인에 동안 인상을 더해요. 아동의 신체 비례로 바꾸지 않아요.", "adult woman in her twenties with youthful styling and adult proportions"]
    },
    "skin tone": {
      "pale": ["피부 고유색이 매우 밝아요. 조명을 밝게 하거나 창백하게 탈색하지 않아요.", "very light natural skin tone; retain living skin coloration"],
      "light": ["피부 고유색이 밝아요. 조명이나 민족을 지정하는 값은 아니에요.", "light natural skin tone"],
      "medium": ["피부 고유색이 중간 명도예요. 원본 포켓몬 색을 적용하지 않아요.", "medium natural skin tone, independent of source colors"],
      "tan": ["따뜻한 황갈색 피부톤이에요. 특정 민족이나 태닝 자국을 강제하지 않아요.", "warm tan skin tone; no implied ethnicity or tan lines"],
      "deep": ["피부 고유색이 짙어요. 조명으로 어둡게 만드는 것과 달라요.", "deep natural skin tone; preserve readable lighting"]
    },
    "facial character": {
      "elegant": ["정제된 태도와 섬세한 표정으로 우아함을 표현해요.", "composed, graceful demeanor"],
      "cool": ["절제된 시선과 담담한 표정의 인상이에요.", "reserved, self-possessed demeanor"],
      "sharp": ["집중한 시선의 예리한 인상이에요. 턱을 뾰족하게 바꾸지 않아요.", "alert, incisive demeanor; no implied pointed jaw"],
      "mature": ["침착하고 안정적인 태도예요. 선택한 나이를 올리지 않아요.", "self-assured composure without increasing selected age"],
      "soft": ["표정의 긴장이 약하고 온화해요. 볼살을 추가하지 않아요.", "gentle demeanor without added facial fullness"],
      "glamorous": ["정돈된 스타일링과 자신감 있는 인상이에요. 얼굴 구조는 유지해요.", "polished, confident glamour without changing facial geometry"],
      "rugged": ["꾸밈이 적고 강인한 인상이에요. 흉터를 자동 추가하지 않아요.", "unpolished, resilient demeanor; no automatic scars"],
      "stoic": ["감정 변화가 적고 절제된 인상이에요.", "emotionally restrained demeanor"],
      "weathered": ["선택한 나이 안에서 생활감 있는 피부 표현을 더해요.", "weather-exposed skin character within the selected age"],
      "boyish": ["성인 여성에게 장난스럽고 중성적인 스타일링을 더해요.", "playful, tomboyish adult styling"],
      "regal": ["침착한 권위와 품위가 느껴지는 인상이에요.", "dignified, authoritative composure"],
      "cute": ["친근한 표정으로 귀여움을 더해요. 턱·눈 크기나 나이는 바꾸지 않아요.", "endearing demeanor without changing age or facial geometry"],
      "doll-like": ["피부와 스타일링이 정교하고 단정해요. 인형 관절이나 아동 비례는 아니에요.", "meticulously groomed adult styling; no doll anatomy"],
      "cheerful": ["활기 있는 시선과 밝은 인상이에요. 장면 표정이 우선이에요.", "lively, upbeat demeanor"],
      "innocent": ["꾸밈없고 열린 인상이에요. 볼살이나 아동화를 뜻하지 않아요.", "open, unguarded demeanor"],
      "friendly": ["편안하고 다가가기 쉬운 인상이에요.", "approachable, welcoming demeanor"],
      "sleepy-eyed": ["눈꺼풀 힘이 풀린 나른한 인상이에요. 눈의 구조는 유지해요.", "relaxed eyelids and drowsy demeanor; preserve eye geometry"],
      "refined": ["단정하고 절제된 스타일링이에요.", "neat, understated grooming and demeanor"],
      "fierce": ["강한 집중과 긴장이 느껴지는 인상이에요.", "intense, determined demeanor"],
      "exotic": ["개성 있는 스타일링을 뜻해요. 특정 민족이나 피부색을 추가하지 않아요.", "distinctive styling; no inferred ethnicity or skin-tone change"],
      "androgynous": ["성인 여성의 중성적인 스타일링이에요. 신체나 나이를 바꾸지 않아요.", "androgynous adult styling without anatomy or age changes"],
      "melancholic": ["시선과 미세한 표정에 쓸쓸함을 담아요.", "subdued, wistful demeanor"]
    },
    "hairstyle": {
      "bob": ["턱선 부근에서 끝나는 보브 윤곽이에요. 길이는 귀 아래~목 범위에서 조절해요.", "bob outline ending between below-ear and neck level"],
      "pixie cut": ["옆·뒤는 짧고 정수리만 약간 긴 픽시컷이에요. 중간 길이를 골라도 목까지 늘리지 않아요.", "cropped sides/nape, slightly longer crown"],
      "layered": ["여러 길이의 층으로 머리 윤곽을 만들어요.", "distinct graduated layers"],
      "ponytail": ["뒤에서 한 갈래로 묶고 남은 머리가 아래로 이어져요.", "one rear tie with a hanging tail"],
      "twin tail": ["좌우 두 갈래로 묶은 머리예요.", "two side ties with hanging tails"],
      "wolf cut": ["정수리의 짧은 층과 목덜미의 긴 층을 연결해요.", "short layered crown transitioning to longer nape layers"],
      "slicked back": ["모근부터 뒤로 매끈하게 빗어 넘겨요.", "smooth backward-directed hair from the roots"],
      "wavy": ["머리카락이 느슨한 S자 물결을 만들어요.", "loose S-shaped waves"],
      "straight": ["큰 굴곡 없이 곧게 내려오는 머리예요.", "straight strands without waves"],
      "side ponytail": ["한쪽 옆에서 한 갈래로 묶어요.", "single ponytail tied to one side"],
      "high ponytail": ["머리 뒤 높은 위치에서 한 갈래로 묶어요.", "single ponytail tied high on the head"],
      "braid": ["한 갈래를 규칙적으로 엮어 땋아요.", "one interwoven braid"],
      "twin braids": ["좌우 두 갈래를 각각 땋아요.", "two interwoven braids"],
      "crown braid": ["땋은 머리를 머리 둘레로 감아요.", "braid wrapped around the head"],
      "chignon": ["뒤통수 아래에서 머리를 매끈하게 말아 고정해요.", "smooth coiled updo at the lower rear head"],
      "messy bun": ["한 덩어리로 말아 묶고 일부 가닥을 느슨하게 남겨요.", "loosely gathered bun; stray strands follow the accent setting"],
      "top knot": ["정수리에서 머리를 말아 한 덩어리로 묶어요.", "single coiled bun at the crown"],
      "low bun": ["목덜미 가까이에 낮게 말아 묶어요.", "single bun near the nape"],
      "half-up": ["윗부분만 묶고 아래 머리는 풀어 두어요.", "upper section tied back, lower section loose"],
      "space buns": ["머리 좌우에 둥근 번을 하나씩 만들어요.", "two rounded side buns"],
      "hime cut": ["일자 앞머리와 턱 부근 옆머리, 긴 뒷머리의 단차예요.", "blunt fringe, cheek-to-jaw side locks and longer back section"],
      "asymmetric cut": ["좌우 머리 끝 길이가 다른 컷이에요.", "unequal left and right cut lengths"],
      "undercut": ["옆·뒤의 아래층을 짧게 밀고 윗머리를 남겨요.", "closely clipped lower sides or nape under a longer top"],
      "side-shaved long hair": ["한쪽 옆만 짧게 밀고 나머지는 어깨 아래로 길게 남겨요.", "one clipped side, remaining hair below shoulders"],
      "curly": ["머리가 굵고 느슨한 고리 형태로 말려요.", "broad loose curls"],
      "tight curls": ["작은 반경의 촘촘한 컬이에요. 인종이나 피부색을 지정하지 않아요.", "small-radius dense curls; independent of ethnicity"],
      "locs": ["머리카락을 여러 개의 로프 같은 가닥으로 뭉친 스타일이에요. 피부·민족과 별개예요.", "separate rope-like locs; independent of ethnicity and skin tone"],
      "ringlet curls": ["세로로 이어지는 나선형 컬이에요.", "distinct vertical spiral ringlets"],
      "finger waves": ["두피 가까이에서 규칙적인 S자 굴곡을 만들어요.", "sculpted close-to-scalp S-shaped waves"],
      "feathered": ["끝을 가볍게 층내 바깥으로 퍼지게 해요.", "light layered ends fanning outward"],
      "blunt cut": ["머리 끝이 한 줄의 뚜렷한 경계로 끝나요.", "hair ends cut along a clean even edge"],
      "wet-look slick": ["머리카락이 젖은 듯 뭉쳐 윤기가 나요. 피부를 젖게 하지 않아요.", "sleek grouped glossy hair; no wet-skin treatment"],
      "windswept": ["바람을 받은 듯 가닥 흐름을 한쪽으로 모아요. 길이·컷은 유지해요.", "directional wind-shaped strands within the chosen length"],
      "buzz cut": ["두피 가까이 아주 짧고 고르게 민 머리예요.", "uniform scalp-close crop"],
      "crew cut": ["짧은 옆머리와 조금 더 긴 짧은 윗머리예요.", "short clipped sides and a slightly longer short top"],
      "side part": ["한쪽에 가르마를 두고 머리를 나눠 빗어요.", "hair divided along a side part"],
      "fade": ["옆·뒤가 아래로 갈수록 점점 짧아져요.", "sides and nape graded progressively shorter downward"],
      "man bun": ["뒤쪽에 한 덩어리로 말아 묶어요. 성별을 바꾸지 않아요.", "single rear bun; no gender change"],
      "swept back": ["볼륨을 남긴 채 머리를 뒤로 넘겨요.", "hair swept backward with root lift"],
      "shaggy": ["끝과 층이 불규칙하게 흩어지는 컷이에요.", "tousled uneven layers and ends"],
      "mullet": ["앞·옆은 짧고 목덜미 쪽이 길어요.", "short front and sides with a longer nape"]
    },
    "hair accent": {
      "a single antenna strand standing up": ["정수리에서 머리카락 한 가닥이 서요. 장비 안테나가 아니에요.", "one upright hair tuft, not mechanical antenna"],
      "two antenna strands standing up": ["정수리에서 머리카락 두 가닥이 서요. 뿔이나 장비가 아니에요.", "two upright hair tufts, not horns or equipment"],
      "a prominent cowlick": ["가마 주변에서 한 덩어리의 머리가 튀어나와요.", "a pronounced tuft lifted at the crown whorl"],
      "loose stray strands framing the face": ["얼굴 양옆에 가는 잔머리를 남겨요.", "loose fine strands beside the face"],
      "neatly kept, no stray strands": ["선택한 머리 윤곽 안으로 가닥을 정리해요.", "neatly contained strands without stray tufts"]
    }
  };
  const HAIR_LENGTH_LIMITS = {
  "pixie cut": [
    "픽시컷은 길이 선택과 관계없이 짧은 옆·뒤와 약간 긴 정수리를 유지해요.",
    "short pixie range: cropped sides/nape and slightly longer crown"
  ],
  "buzz cut": [
    "버즈컷은 두피 가까이 짧게 민 길이를 유지해요.",
    "scalp-close buzz-cut length"
  ],
  "crew cut": [
    "크루컷은 짧은 옆머리와 짧은 윗머리 범위를 유지해요.",
    "short crew-cut range with clipped sides and a slightly longer top"
  ],
  "bob": [
    "보브컷은 귀 아래부터 목까지의 범위로 해석해요.",
    "below-ear to neck-length bob range"
  ],
  "side-shaved long hair": [
    "한쪽을 민 긴 머리는 나머지 머리가 어깨 아래로 내려오는 구조를 유지해요.",
    "remaining unshaved section below shoulders"
  ]
};
  const EYE_CONTOURS = {
  "large": "open rounded eyelid outline; scale follows eye size",
  "sharp": "crisp eyelid contour; corner direction follows eye tilt",
  "drooping": "soft eyelid contour; corner direction follows eye tilt",
  "upturned": "tapered eyelid contour; corner direction follows eye tilt"
};
  const PARAM_GROUP_HELP = {
  "base": "명시한 나이와 피부·얼굴 설정을 우선하며, 원본 종이나 장비 크기에서 사람의 외형을 강제하지 않아요.",
  "build": "장갑 아래 성인 신체를 정해요. 체형이 큰 방향이고 세부값은 그 범위에서 조절해요. 보통·균형은 체형을 초기화하지 않아요.",
  "face": "얼굴 인상보다 구체적인 윤곽·크기·각도가 우선해요. 세부값은 해당 부위만 바꾸며 선택한 나이를 유지해요.",
  "hair": "스타일의 구조·고유 길이가 우선해요. 길이는 풀었을 때, 머릿결은 한 올의 굵기, 볼륨은 전체 부피를 뜻해요."
};
  const PARAM_HELP = {
  "auto": "지정하지 않은 부분만 다른 선택과 모순되지 않게 결정해요.",
  "custom": "직접 입력한 내용은 그대로 전달돼요. 바꿀 부위·길이·윤곽을 구체적으로 적어 주세요.",
  "ethnicity": "넓은 외모 참고 범위예요. 같은 계통 안에서도 개인차를 허용하고, 얼굴 윤곽·피부톤·헤어 선택을 우선해요.",
  "measurement": "가슴 / 허리 / 골반 둘레를 cm로 입력해요. 폭이나 장갑 치수가 아니며, 체형 안에서 비율 참고로 사용해요.",
  "eye": "인물 본인의 오른쪽·왼쪽 기준이에요. 왼쪽 색을 비우면 양쪽에 기본 눈 색을 사용해요.",
  "color": "피부나 조명 대신 선택한 머리 또는 홍채의 고유색에 적용해요."
};

  const SCENE_AXIS_GUIDES = {
  "overall_intensity": {
    "restrained": [
      "의상과 태도를 차분하게 절제해요. 노출량은 별도 선택이에요.",
      "understated styling and restrained demeanor; exposure is separate"
    ],
    "sensual": [
      "부드러운 옷의 흐름과 여유 있는 몸짓으로 관능미를 표현해요.",
      "sensual fabric drape and relaxed expressive posture; no automatic extra exposure"
    ],
    "bold": [
      "대담한 의상선과 자신감 있는 태도로 강도를 높여요.",
      "bold outfit lines and confident demeanor; honor chosen coverage"
    ],
    "strong": [
      "선택한 장면 안에서 의상·태도의 존재감을 가장 강하게 해요.",
      "maximal styling presence within the scene; retain chosen exposure and anatomy"
    ]
  },
  "skin_exposure": {
    "low": [
      "목·손 정도의 제한된 노출이에요. 직접 지정한 의상이 우선해요.",
      "mostly covered clothing, limited neck/hand exposure unless outfit is explicit"
    ],
    "moderate": [
      "팔이나 종아리 등 일부 부위를 드러내요. 가슴·골반은 가려요.",
      "some exposed arms or lower legs, with chest and pelvis covered"
    ],
    "bold": [
      "어깨·등·복부·다리에서 장면에 맞는 부위를 더 드러내요. 가슴·골반은 가려요.",
      "more scene-appropriate shoulder, back, midriff or leg exposure; cover chest and pelvis"
    ]
  },
  "action_level": {
    "mostly posed": [
      "한 장 안에서 잠시 멈추거나 자세를 유지하는 순간이에요.",
      "a paused or held moment of the selected activity"
    ],
    "balanced": [
      "자세를 읽기 쉬운 가벼운 동작의 한 순간이에요. 컷 수 비율이 아니에요.",
      "a readable moment of gentle movement, not a ratio of multiple images"
    ],
    "mostly active": [
      "선택한 활동을 실제로 수행하는 중간 순간이에요. 포즈 선택과 충돌하면 포즈를 유지해요.",
      "an active mid-action moment compatible with the selected pose"
    ]
  },
  "source_influence": {
    "subtle": [
      "원본의 색 포인트나 작은 장신구 정도만 반영해요.",
      "one restrained source-color accent or small accessory"
    ],
    "balanced": [
      "색과 작은 무늬 등 두 가지 안팎의 특징을 의상에 반영해요.",
      "a few source color and marking cues integrated into everyday clothing"
    ],
    "strong": [
      "원본 색·무늬를 의상 디자인에서 분명하게 보여줘요. 장갑이나 종족 신체는 추가하지 않아요.",
      "clearly recognizable source palette and motifs in clothing, not new armor or creature anatomy"
    ]
  },
  "separates_preference": {
    "balanced": [
      "장면에 맞춰 원피스나 상하의 조합을 선택해요. 둘을 겹치라는 뜻은 아니에요.",
      "choose either a one-piece outfit or separates to suit the scene"
    ],
    "prefer separates": [
      "명시한 의상이 없으면 상의·하의를 나눈 조합을 선호해요.",
      "prefer separate top and bottom unless outfit is explicitly specified"
    ],
    "strongly prefer separates": [
      "명시한 의상이 없으면 상의·하의 조합을 기본으로 해요.",
      "use separate top and bottom by default; explicit outfit takes priority"
    ]
  }
};
  const ORIENTATION_GUIDES = {
  "front": [
    "몸통·골반이 카메라를 향해요. 시선은 별도예요.",
    "torso and pelvis face the camera; gaze is independent"
  ],
  "front_3q": [
    "몸통과 골반을 함께 약 30~45도 돌린 앞쪽 시점이에요.",
    "front three-quarter body turn of about 30-45 degrees; rotate torso and pelvis together"
  ],
  "side": [
    "몸통·골반을 옆으로 약 90도 돌려요.",
    "side body profile, approximately 90 degrees to camera"
  ],
  "rear_3q": [
    "등과 한쪽 옆면이 함께 보이도록 몸통·골반을 돌려요.",
    "rear three-quarter view showing back and one flank"
  ],
  "back": [
    "등 중앙이 카메라를 향해요.",
    "back centered toward camera"
  ],
  "over_shoulder": [
    "몸은 뒤쪽을 향하고 얼굴만 어깨 너머로 돌려요.",
    "body turned away, head looking back over a shoulder"
  ],
  "seated_twist": [
    "앉은 골반을 지지하고 상체만 자연스럽게 비틀어요.",
    "seated with supported pelvis and a natural torso twist"
  ],
  "walking_away": [
    "카메라에서 멀어지는 방향으로 걷는 모습이에요.",
    "walking away from camera with a readable rearward stride"
  ],
  "turning_midmotion": [
    "몸을 돌리는 중간 동작을 포착해요. 장비도 부착 부위를 따라요.",
    "mid-turn body motion with equipment following its body mounts"
  ],
  "low_angle": [
    "카메라가 인물보다 낮아요. 전신·상반신 범위는 프레이밍 선택을 따라요.",
    "camera below subject looking upward; obey selected framing"
  ],
  "high_angle": [
    "카메라가 인물보다 높아요. 전신·상반신 범위는 프레이밍 선택을 따라요.",
    "camera above subject looking downward; obey selected framing"
  ],
  "leaning_forward": [
    "상체를 앞쪽으로 기울이되 발·골반으로 균형을 유지해요.",
    "torso leaning forward with supported balance"
  ],
  "leaning_back": [
    "상체를 뒤로 기울이며 지지점을 분명히 해요.",
    "torso leaning backward with clear support"
  ],
  "crouching": [
    "무릎과 골반을 굽혀 낮게 앉아요.",
    "low crouch with flexed knees and hips"
  ],
  "reclining": [
    "몸의 무게를 바닥·의자 등에 맡겨 비스듬히 누워요.",
    "reclined body supported by a surface"
  ],
  "reaching_up": [
    "팔을 위로 뻗되 어깨·몸통 연결을 자연스럽게 해요.",
    "reach upward with natural shoulder articulation"
  ],
  "looking_down": [
    "시선이 아래쪽이에요. 카메라 높이를 바꾸는 지시가 아니에요.",
    "gaze directed downward; camera height unchanged"
  ],
  "looking_away": [
    "시선이 카메라 밖을 향해요. 몸 방향을 강제하지 않아요.",
    "gaze off-camera; body orientation independent"
  ],
  "back_to_camera": [
    "몸의 후면이 카메라를 향해요. 얼굴을 억지로 노출하지 않아요.",
    "body fully facing away; no forced face visibility"
  ],
  "profile_close": [
    "측면을 강조해요. 프레이밍을 따로 고르면 그 범위를 우선해요.",
    "side profile, close only when no explicit framing is selected"
  ],
  "three_quarter_back": [
    "후면과 옆면을 함께 보여 장비의 깊이를 읽기 쉽게 해요.",
    "rear three-quarter view with natural equipment depth and occlusion"
  ]
};
  const IDENTITY_GROUPS = ['base', 'build', 'face', 'hair'];
  const IDENTITY_EXCLUDED = ['human-mechanical balance', 'facial hair', 'expression'];

  const POSE_GUIDES = {
  "standing_relaxed": [
    "어깨를 풀고 두 발에 자연스럽게 무게를 나눠 서요.",
    "Stand at ease with relaxed shoulders and naturally balanced feet."
  ],
  "standing_formal": [
    "등을 펴고 안정적으로 서서 또렷한 실루엣을 보여줘요.",
    "Stand upright with a balanced stance and a composed posture."
  ],
  "contrapposto": [
    "한쪽 다리에 체중을 싣고 반대쪽 무릎을 편하게 풀어요.",
    "Rest weight on one leg with the opposite knee relaxed in natural contrapposto."
  ],
  "hand_on_hip": [
    "한 손을 허리에 두고 다른 손은 장면에 맞게 내려요.",
    "Place one hand on the hip and let the other arm rest naturally or support the scene's prop."
  ],
  "arms_crossed": [
    "가슴 앞에서 팔을 편하게 교차해요.",
    "Fold the arms comfortably across the torso with readable hands."
  ],
  "sitting": [
    "의자나 벤치에 앉아 발과 손을 자연스럽게 놓아요.",
    "Sit naturally on a chair or bench with supported feet and readable hands."
  ],
  "sitting_floor": [
    "바닥이나 매트에 앉아 다리를 편하게 배치해요.",
    "Sit comfortably on the floor or a mat with clearly separated legs and hands."
  ],
  "kneeling": [
    "낮은 작업이나 교감에 맞게 한쪽 또는 양쪽 무릎을 대요.",
    "Kneel in a stable supported position suited to a low task or interaction."
  ],
  "leaning_wall": [
    "벽에 어깨나 등을 가볍게 기대어 쉬어요.",
    "Lean a shoulder or the back lightly against a wall while keeping balance through the feet."
  ],
  "leaning_furniture": [
    "테이블이나 난간에 손 또는 팔꿈치를 올려요.",
    "Rest a hand or forearm on a table, counter or railing in a relaxed supported pose."
  ],
  "walking": [
    "한 발을 내디디며 팔이 자연스럽게 따라 움직여요.",
    "Walk at a comfortable pace with a natural step and arm swing."
  ],
  "mid_stride": [
    "발을 옮기는 순간을 잡아 이동감을 보여줘요.",
    "Capture a clear mid-stride step with believable weight transfer."
  ],
  "stretching": [
    "팔과 등을 천천히 펴는 편안한 동작이에요.",
    "Stretch the arms and upper back gently in a comfortable everyday motion."
  ],
  "bending_over": [
    "낮은 물건을 살피듯 허리를 가볍게 숙여요.",
    "Bend forward slightly to examine or reach a low object with a balanced stance."
  ],
  "on_tiptoe": [
    "높은 물건을 향해 발뒤꿈치를 조금 들어요.",
    "Rise slightly onto the toes to reach a higher object without changing limb proportions."
  ],
  "hands_in_hair": [
    "양손이나 한 손으로 머리 모양을 정돈해요.",
    "Use the hands to tidy the established hairstyle without changing its cut or length."
  ],
  "carrying_something": [
    "장면의 가방·바구니·상자를 무게에 맞게 들어요.",
    "Carry the scene's bag, basket or box with believable hand contact and weight."
  ],
  "mid_action": [
    "선택한 장면의 활동이 진행 중인 순간을 잡아요.",
    "Capture the selected activity already in progress with a readable natural gesture."
  ],
  "squatting": [
    "낮은 대상과 눈높이를 맞추며 무릎을 굽혀요.",
    "Squat comfortably to interact at a lower height with balanced feet."
  ],
  "one_knee_up": [
    "바닥에 앉아 한쪽 무릎을 세우고 팔을 편하게 올려요.",
    "Sit on a mat with one knee raised and an arm resting naturally on it."
  ],
  "side_sitting": [
    "두 다리를 한쪽으로 모아 매트에 편하게 앉아요.",
    "Sit on a mat with both legs folded to one side and a relaxed upright torso."
  ],
  "cross_legged": [
    "매트나 바닥에서 다리를 교차하고 편하게 쉬어요.",
    "Sit cross-legged on a floor cushion with relaxed shoulders and readable hands."
  ],
  "perched_seat": [
    "벤치나 낮은 턱에 가볍게 걸터앉아 발을 내려요.",
    "Perch on a low ledge or bench with the feet resting naturally below."
  ],
  "turning_back": [
    "몸의 진행 방향을 유지하며 고개와 어깨만 살짝 돌려요.",
    "Pause mid-step and turn the head and shoulders gently back, without twisting the torso unnaturally."
  ],
  "waving": [
    "한 손을 어깨 높이로 들어 인사해요.",
    "Raise one hand near shoulder height in a friendly small wave."
  ],
  "holding_cup": [
    "컵을 한 손 또는 두 손으로 받쳐 들고 쉬어요.",
    "Hold a cup comfortably in one or both hands during a quiet break."
  ],
  "reading_book": [
    "책을 펼쳐 들고 페이지를 살피는 자세예요.",
    "Hold an open book with readable finger placement and look toward its pages."
  ],
  "offering_food": [
    "그릇이나 작은 간식을 대상 쪽으로 내밀어요.",
    "Offer a small treat or food bowl toward the scene's companion, keeping hands and companion separate."
  ],
  "gentle_pat": [
    "손바닥을 부드럽게 낮춰 파트너를 쓰다듬어요.",
    "Gently lower one hand to pat the scene's Pokémon companion with a natural shoulder and elbow angle."
  ],
  "watering": [
    "물뿌리개를 기울여 낮은 화분이나 식물에 물을 줘요.",
    "Tilt a small watering can toward plants with a clear grip and believable balance."
  ],
  "preparing_food": [
    "작업대 앞에서 반죽을 섞거나 재료를 정리해요.",
    "Work at a kitchen counter, stirring a bowl or arranging ingredients with clearly separated hands and utensils."
  ],
  "taking_photo": [
    "카메라를 안정적으로 잡고 장면 속 대상을 촬영해요.",
    "Hold a camera with both hands to photograph a subject in the scene."
  ],
  "adjusting_bag": [
    "한 손으로 어깨끈을 당겨 여행 가방을 정돈해요.",
    "Adjust a shoulder strap with one hand while supporting the travel bag naturally."
  ],
  "checking_map": [
    "두 손으로 지도를 펴고 길을 확인해요.",
    "Hold a folded-out route map in both hands while checking the surroundings."
  ],
  "small_jog": [
    "팔을 작게 흔들며 천천히 달리는 동작이에요.",
    "Jog lightly with compact arm movement and a believable running step."
  ],
  "dance_step": [
    "한 발을 옮기며 손과 어깨로 리듬을 표현해요.",
    "Take a small rhythmic dance step with coordinated arms and balanced feet."
  ]
};

  const FRAME_OPTIONS = [
  [
    "",
    "자동 — 장면에 맞게"
  ],
  [
    "environmental",
    "환경 중심 와이드"
  ],
  [
    "full_body",
    "전신"
  ],
  [
    "three_quarter",
    "무릎 위"
  ],
  [
    "waist_up",
    "허리 위"
  ],
  [
    "chest_up",
    "가슴 위"
  ],
  [
    "face_close",
    "얼굴 클로즈업"
  ],
  [
    "detail",
    "손·소품 디테일"
  ]
];

  const FRAME_GUIDES = {
  "environmental": [
    "인물의 전신과 주변 장소를 함께 넓게 보여줘요.",
    "Environmental long shot: show the complete woman and enough surroundings to establish the activity and location."
  ],
  "full_body": [
    "머리부터 발끝까지 인물이 빠짐없이 보여요.",
    "Full-body framing: keep the complete head, hands and feet inside the frame with restrained margins."
  ],
  "three_quarter": [
    "머리부터 무릎 부근까지 담아 동작과 표정을 함께 보여줘요.",
    "Three-quarter portrait framing from the head to just above the knees, with the scene's hand action readable."
  ],
  "waist_up": [
    "얼굴·상체·손동작을 중심으로 담아요.",
    "Waist-up framing showing the head, torso and relevant hand gesture; place essential props inside this crop."
  ],
  "chest_up": [
    "얼굴과 어깨, 작은 표정 변화에 집중해요.",
    "Chest-up framing focused on the face, shoulders and expression with a small amount of setting."
  ],
  "face_close": [
    "머리 모양과 얼굴이 중심이 되는 가까운 구도예요.",
    "Close-up of the face and hairstyle, preserving the approved facial identity and using only a subtle background."
  ],
  "detail": [
    "장면에서 쓰는 손과 도구를 가까이 보여줘요.",
    "Detail framing centered on the woman's hands and the scene's object or task, with natural anatomy and readable contact."
  ]
};

  const LENS_OPTIONS = [
  [
    "",
    "자동 — 장면에 맞게"
  ],
  [
    "wide24",
    "광각 · 24mm 느낌"
  ],
  [
    "documentary35",
    "준광각 · 35mm 느낌"
  ],
  [
    "natural50",
    "표준 · 50mm 느낌"
  ],
  [
    "portrait85",
    "준망원 · 85mm 느낌"
  ],
  [
    "telephoto135",
    "망원 · 135mm 느낌"
  ]
];

  const LENS_GUIDES = {
  "wide24": [
    "24mm 광각: 주변 장소와 앞뒤 거리감이 넓게 드러나요. 숲길·도시 전투처럼 공간과 움직임을 함께 보여주기 좋아요. 가까운 손발이나 얼굴이 과장되지 않도록 억제해요.",
    "24mm-equivalent wide-angle impression with spacious environmental depth; use enough camera distance to avoid stretching the face or limbs."
  ],
  "documentary35": [
    "35mm 준광각: 인물과 주변 상황을 균형 있게 담는 생활 스냅 느낌이에요. 산책·카페·여행이나 주변 지형이 중요한 액션 장면에 어울려요.",
    "35mm-equivalent environmental perspective balancing the woman and the setting with moderate depth."
  ],
  "natural50": [
    "50mm 표준: 앞뒤 거리감을 과하게 벌리거나 압축하지 않는 무난한 표현이에요. 인물의 자세·의상·표정을 자연스럽게 보여주고 싶을 때 고르세요.",
    "50mm-equivalent natural perspective with balanced proportions and modest depth compression."
  ],
  "portrait85": [
    "85mm 준망원: 같은 프레이밍에서 배경이 조금 가까워 보이고 얼굴과 몸의 원근감이 차분해져요. 상반신·표정 중심의 컷이나 정돈된 전신 인물컷에 어울려요.",
    "85mm-equivalent short-telephoto perspective from a suitable distance, with gentle background compression."
  ],
  "telephoto135": [
    "135mm 망원: 멀리서 바라보듯 앞뒤 공간이 압축되고 배경 요소가 겹쳐 보여요. 군더더기 없는 인물 강조나 멀리서 포착한 순간에 어울려요. 배경 흐림은 필요하면 추가 지시로 정해요.",
    "135mm-equivalent telephoto perspective from farther away, with compressed background depth and unchanged anatomy."
  ]
};

  const SCENE_CHOICE_RULE = "SELECTED SCENE PRIORITY: Explicit pose, orientation, framing and lens choices take priority over incidental staging in category guides or examples. Adapt the activity and its props to those choices without changing identity; never force a full-body view when a close crop is selected. Lens values describe an illustrative perspective, not mandatory photographic rendering or background blur.";

  const ACTION_CATEGORIES = [
  {
    "key": "ready",
    "label": "전투 준비·대치",
    "description": "공격 전의 긴장감과 준비 자세를 보여줘요.",
    "prompt": "Stage a tense preparation or standoff with deliberate balance and readable equipment, before an exchange begins.",
    "examples": [
      {
        "key": "ready_guard",
        "label": "경계 자세",
        "description": "주변을 살피며 무게중심을 낮추고 다음 움직임을 준비해요.",
        "prompt": "Scan the surroundings from a balanced guard stance with one foot ready to move."
      },
      {
        "key": "ready_corner",
        "label": "엄폐물 뒤 상황 확인",
        "description": "엄폐물 옆에서 상체를 살짝 돌려 진로를 확인해요.",
        "prompt": "Check a route from beside low cover, keeping hands and the existing equipment readable."
      },
      {
        "key": "ready_charge",
        "label": "기술 준비",
        "description": "기존 장비나 타입 모티프에 맞춰 기술을 준비하는 자세예요.",
        "prompt": "Prepare an established source-derived technique with a deliberate hand or equipment position; emission depends on the power and effects selections."
      }
    ]
  },
  {
    "key": "melee",
    "label": "근접 공방",
    "description": "거리 좁히기·타격·반격처럼 가까운 거리의 움직임을 보여줘요.",
    "prompt": "Stage a close-range exchange with coherent footwork, readable hands and a clear line of action.",
    "examples": [
      {
        "key": "melee_step",
        "label": "거리 좁히기",
        "description": "짧은 스텝으로 접근하며 몸과 손의 방향을 맞춰요.",
        "prompt": "Close distance with one compact step and a coordinated torso and hand position."
      },
      {
        "key": "melee_counter",
        "label": "비껴서 반격",
        "description": "공격선을 비껴난 뒤 상체와 팔을 돌려 반격해요.",
        "prompt": "Pivot off an implied attack line into a controlled counter motion, keeping an unseen opponent outside the frame."
      },
      {
        "key": "melee_sweep",
        "label": "넓은 궤적의 일격",
        "description": "장비나 팔의 이동 궤적이 한눈에 보이는 동작이에요.",
        "prompt": "Execute a broad but anatomically coherent strike arc with the selected equipment use, or an unarmed motion if selected."
      }
    ]
  },
  {
    "key": "ranged",
    "label": "원거리 기술·사격",
    "description": "기존 장비나 원본 타입의 기술로 먼 대상을 겨냥해요.",
    "prompt": "Stage a ranged technique using the established source-derived capability or existing equipment, with a readable aim and release direction.",
    "examples": [
      {
        "key": "aimed_release",
        "label": "겨냥 후 발동",
        "description": "한 방향을 향해 자세를 잡고 기술을 발동해요.",
        "prompt": "Aim an existing source-derived ability or equipment toward an off-frame target and stage a controlled release."
      },
      {
        "key": "ranged_sidestep",
        "label": "옆으로 이동하며 겨냥",
        "description": "옆걸음 중에도 시선과 기술 방향을 유지해요.",
        "prompt": "Track an off-frame target during a lateral step with a stable torso and readable aiming direction."
      },
      {
        "key": "ranged_recover",
        "label": "발동 후 자세 회복",
        "description": "기술을 쓴 뒤 몸의 균형과 손 위치를 되돌려요.",
        "prompt": "Recover balance after a ranged action, returning the hands or existing equipment to a controlled position."
      }
    ]
  },
  {
    "key": "evasion",
    "label": "회피·지상 기동",
    "description": "옆으로 피하거나 지형을 이용해 빠르게 이동해요.",
    "prompt": "Stage evasive ground movement with believable weight transfer, clear limb separation and a readable travel path.",
    "examples": [
      {
        "key": "evasion_side",
        "label": "측면 회피",
        "description": "몸을 옆으로 옮겨 가상의 공격선을 벗어나요.",
        "prompt": "Shift laterally away from an implied incoming attack with a planted push-off foot."
      },
      {
        "key": "evasion_cover",
        "label": "엄폐물 사이 이동",
        "description": "낮은 장애물 사이를 이동하며 다음 진로를 살펴요.",
        "prompt": "Move between low obstacles while checking the next route and keeping the existing silhouette recognizable."
      },
      {
        "key": "evasion_slide",
        "label": "낮게 미끄러져 피하기",
        "description": "무게중심을 낮춰 짧게 미끄러지고 다시 균형을 잡아요.",
        "prompt": "Perform a short low slide into a stable recovery, with clear knees, feet and hand placement."
      }
    ]
  },
  {
    "key": "aerial",
    "label": "도약·공중 기동",
    "description": "점프·공중 선회·착지 장면이에요. 비행 장비가 없으면 짧은 도약으로 표현해요.",
    "prompt": "Stage a jump or aerial maneuver appropriate to existing capability; without established flight equipment use a brief physical leap, not sustained flight.",
    "examples": [
      {
        "key": "aerial_leap",
        "label": "장애물 넘기",
        "description": "낮은 장애물을 뛰어넘으며 팔과 다리를 자연스럽게 펴요.",
        "prompt": "Leap over a low obstacle with a plausible trajectory and clearly separated limbs."
      },
      {
        "key": "aerial_turn",
        "label": "공중 방향 전환",
        "description": "점프 중 몸을 살짝 틀거나 기존 추진 장비로 방향을 바꿔요.",
        "prompt": "Change direction during a jump, or use established propulsion if present, without adding wings or thrusters."
      },
      {
        "key": "aerial_landing",
        "label": "착지 순간",
        "description": "발이 닿고 무릎이 충격을 받는 순간을 보여줘요.",
        "prompt": "Land with bent knees and a stable contact point; any dust or impact effect follows the selected effect amount."
      }
    ]
  },
  {
    "key": "defense",
    "label": "방어·호위",
    "description": "막아내기·버티기·진로 보호처럼 방어 중심의 동작이에요.",
    "prompt": "Stage a defensive action with a stable center of gravity and a clear protected direction, using the selected form's existing protection.",
    "examples": [
      {
        "key": "defense_brace",
        "label": "정면에서 버티기",
        "description": "발을 넓게 디디고 기존 방어 구조로 힘을 받아내요.",
        "prompt": "Brace against an implied force through the feet and the existing protective surfaces."
      },
      {
        "key": "defense_intercept",
        "label": "공격선 가로막기",
        "description": "보호할 방향 앞으로 나서며 방어 자세를 취해요.",
        "prompt": "Step across an implied attack line to protect an off-frame route, using existing armor or a guarded stance."
      },
      {
        "key": "defense_retreat",
        "label": "방어하며 물러나기",
        "description": "상체의 경계를 유지하면서 한 발씩 뒤로 물러나요.",
        "prompt": "Take a measured backward step while maintaining a coherent guard and a clear protected direction."
      }
    ]
  },
  {
    "key": "rescue",
    "label": "구조·현장 돌파",
    "description": "위험한 구역을 통과하거나 길을 확보하는 임무 장면이에요.",
    "prompt": "Stage a non-graphic rescue or hazardous-terrain maneuver with a specific practical task and readable surroundings.",
    "examples": [
      {
        "key": "rescue_reach",
        "label": "안전한 쪽으로 손 내밀기",
        "description": "안정적으로 발을 딛고 화면 밖 대상을 돕는 손짓을 해요.",
        "prompt": "Plant the feet securely and reach toward an off-frame person to guide them toward safety, without adding another visible human body."
      },
      {
        "key": "rescue_route",
        "label": "통로 확보",
        "description": "기존 능력과 장비에 맞는 작은 장애물을 옮기거나 우회해요.",
        "prompt": "Clear or bypass a manageable obstacle using only established strength or equipment to open a safe route."
      },
      {
        "key": "rescue_crossing",
        "label": "불안정한 지형 건너기",
        "description": "흔들리는 발판을 확인하며 중심을 잡고 이동해요.",
        "prompt": "Cross uneven ground cautiously, testing the next foothold with controlled weight transfer."
      }
    ]
  },
  {
    "key": "training",
    "label": "훈련·기술 시연",
    "description": "자세 연습·표적 훈련·기술 점검처럼 동작이 잘 읽히는 장면이에요.",
    "prompt": "Stage a controlled training or demonstration activity with a specific task and readable technique.",
    "examples": [
      {
        "key": "training_form",
        "label": "기본 동작 연습",
        "description": "한 동작의 발·골반·팔 배치를 또렷하게 보여줘요.",
        "prompt": "Practice one precise technique with clearly readable foot, torso and hand alignment."
      },
      {
        "key": "training_target",
        "label": "표적 훈련",
        "description": "작은 훈련용 표적을 향해 기존 능력의 방향을 맞춰요.",
        "prompt": "Align an existing capability or a physical technique toward a simple practice target appropriate to the selected equipment mode."
      },
      {
        "key": "training_system",
        "label": "장비 작동 점검",
        "description": "장갑을 새로 열거나 바꾸지 않고 기존 장비의 상태를 살펴요.",
        "prompt": "Check the operation of an existing equipment unit in the selected armor configuration without adding service openings or changing the form."
      }
    ]
  },
  {
    "key": "aftermath",
    "label": "전투 직후·정비",
    "description": "동작을 마친 뒤 자세를 추스르거나 장비를 확인하는 순간이에요.",
    "prompt": "Stage the immediate aftermath of exertion, focusing on recovery, awareness or an equipment check without inventing damage.",
    "examples": [
      {
        "key": "after_breath",
        "label": "호흡과 자세 정돈",
        "description": "동작이 끝난 뒤 어깨를 낮추고 균형을 회복해요.",
        "prompt": "Pause after exertion to settle the shoulders and regain a stable breathing posture."
      },
      {
        "key": "after_check",
        "label": "장비 상태 확인",
        "description": "팔이나 장착부를 살펴보며 이상 여부를 확인해요.",
        "prompt": "Inspect an existing forearm unit or attachment with a focused glance, preserving the established armor state."
      },
      {
        "key": "after_watch",
        "label": "주변 경계 유지",
        "description": "몸의 긴장을 조금 풀되 시선은 주변을 살펴요.",
        "prompt": "Relax slightly after an exchange while keeping an alert gaze toward the surrounding area."
      }
    ]
  }
];

  const ACTION_POSES = [
  {
    "key": "combat_ready",
    "label": "기본 전투 자세",
    "description": "한 발을 앞에 두고 손과 시선을 다음 동작에 맞춰요.",
    "prompt": "Use a balanced combat-ready stance with one foot forward and hands prepared for the chosen action."
  },
  {
    "key": "low_guard",
    "label": "낮은 가드",
    "description": "무릎을 굽히고 몸 가까이 손을 두어 안정감을 줘요.",
    "prompt": "Lower the center of gravity with bent knees and a compact guard close to the torso."
  },
  {
    "key": "forward_lunge",
    "label": "전방 런지",
    "description": "앞발에 무게를 옮기며 한 방향으로 길게 내디뎌요.",
    "prompt": "Lunge forward with controlled weight transfer and a planted leading foot."
  },
  {
    "key": "cross_step",
    "label": "교차 스텝",
    "description": "발을 짧게 교차해 이동 방향을 바꾸는 순간이에요.",
    "prompt": "Use a brief crossing step to redirect travel with clearly separated legs and stable balance."
  },
  {
    "key": "pivot_strike",
    "label": "회전 동작",
    "description": "발을 축으로 골반과 어깨를 함께 돌려요.",
    "prompt": "Pivot through the feet, hips and shoulders in a coordinated turning action without twisting the anatomy unnaturally."
  },
  {
    "key": "aiming",
    "label": "겨냥 자세",
    "description": "손이나 기존 장비를 한 방향으로 안정적으로 향하게 해요.",
    "prompt": "Align the hands or existing equipment toward one clear off-frame direction in a stable aiming posture."
  },
  {
    "key": "braced_shot",
    "label": "지지하며 발동",
    "description": "발을 단단히 디디고 기술의 반동이나 힘을 받아요.",
    "prompt": "Brace through the feet and torso for the selected technique, retaining the original body proportions."
  },
  {
    "key": "side_dodge",
    "label": "옆으로 피하기",
    "description": "한쪽 발로 밀어내며 상체를 옆으로 이동해요.",
    "prompt": "Push laterally from one planted foot into a clear sidestep dodge."
  },
  {
    "key": "low_slide",
    "label": "낮은 슬라이딩",
    "description": "한쪽 다리를 펴고 몸을 낮춰 짧게 미끄러져요.",
    "prompt": "Perform a low controlled slide with one leg extended and readable foot, knee and hand placement."
  },
  {
    "key": "running_start",
    "label": "달려 나가는 순간",
    "description": "앞으로 기울며 첫 발을 힘 있게 내디뎌요.",
    "prompt": "Lean into the first driving step of a run, with a coherent push-off and arm swing."
  },
  {
    "key": "aerial_twist",
    "label": "공중 선회",
    "description": "도약 중 어깨와 골반을 조금 돌려 방향을 바꿔요.",
    "prompt": "Turn slightly in a brief airborne leap with coherent torso alignment and separated limbs."
  },
  {
    "key": "diving",
    "label": "전방 도약",
    "description": "양발로 밀어 전방으로 짧게 뛰어드는 자세예요.",
    "prompt": "Launch into a short forward leap with a plausible trajectory; do not imply sustained flight without established capability."
  },
  {
    "key": "landing",
    "label": "착지 자세",
    "description": "무릎과 발목을 굽혀 충격을 받으며 중심을 잡아요.",
    "prompt": "Land with knees and ankles absorbing the motion and a believable contact point."
  },
  {
    "key": "shielding",
    "label": "진로를 가로막는 자세",
    "description": "한쪽 팔이나 기존 방어 장비를 앞세워 통로를 지켜요.",
    "prompt": "Place the body across a protected route with a guarded arm or an existing defensive unit held forward."
  },
  {
    "key": "braced_stance",
    "label": "묵직하게 버티기",
    "description": "두 발을 넓게 딛고 허리와 어깨를 안정적으로 유지해요.",
    "prompt": "Plant both feet firmly in a grounded bracing stance, using posture rather than a larger body to convey weight."
  },
  {
    "key": "rescue_reach",
    "label": "손을 내밀어 돕기",
    "description": "안정적으로 서거나 한쪽 무릎을 대고 손을 앞으로 내밀어요.",
    "prompt": "Reach one hand forward in a stable supported rescue gesture while preserving clear fingers and limb anatomy."
  }
];

  const ACTION_CONTROLS = [
  {
    "key": "timing",
    "label": "동작 타이밍",
    "description": "한 동작에서 어느 순간을 잡을지 정해요. 자동이면 선택한 예시를 따라요.",
    "promptLabel": "Action timing",
    "options": [
      {
        "key": "before",
        "label": "동작 직전",
        "description": "움직이기 바로 전의 준비와 긴장감을 잡아요.",
        "prompt": "Capture the instant immediately before the chosen action begins."
      },
      {
        "key": "windup",
        "label": "힘을 모으는 순간",
        "description": "발·허리·팔에 힘이 모이는 준비 동작을 잡아요.",
        "prompt": "Capture the action's wind-up with coordinated weight loading, without anatomical enlargement."
      },
      {
        "key": "release",
        "label": "동작 전개",
        "description": "기술이나 이동이 시작되어 궤적이 읽히는 순간이에요.",
        "prompt": "Capture the selected movement or technique as it unfolds with a clear direction."
      },
      {
        "key": "impact",
        "label": "접촉·착지 순간",
        "description": "타격·방어·착지처럼 힘이 닿는 순간을 잡아요.",
        "prompt": "Capture the contact or landing beat appropriate to the activity, keeping anatomy and equipment readable."
      },
      {
        "key": "followthrough",
        "label": "후속·회복 동작",
        "description": "기술을 마치고 균형을 되찾는 순간이에요.",
        "prompt": "Capture a controlled follow-through or balance recovery after the selected action."
      }
    ]
  },
  {
    "key": "equipment",
    "label": "무장·장비 사용",
    "description": "어느 장비로 동작할지 정해요. 해당 장비가 없으면 새로 붙이지 않고 기존 구조에 맞춰요.",
    "promptLabel": "Equipment use",
    "options": [
      {
        "key": "unarmed",
        "label": "맨손·체술",
        "description": "손발과 몸의 움직임을 중심으로 해요. 기존 무장은 비활성 상태로 유지해요.",
        "prompt": "Use unarmed physical movement; keep existing weapons stowed or inactive rather than deleting them. Do not fire a weapon or add one."
      },
      {
        "key": "body_system",
        "label": "신체 주변 내장 유닛",
        "description": "기존 팔·다리·몸통 장치가 있을 때 활용해요.",
        "prompt": "Use an existing limb- or torso-mounted functional unit only if established; otherwise adapt to a physical movement without adding machinery."
      },
      {
        "key": "handheld",
        "label": "기존 휴대 무장",
        "description": "기준 디자인에 있는 휴대 무장을 사용해요. 없는 무장을 만들지 않아요.",
        "prompt": "Use an already established handheld weapon or tool. If none exists, adapt the action to the existing capability without inventing a weapon."
      },
      {
        "key": "back_unit",
        "label": "등·백팩 장치",
        "description": "기존 백팩·등 장비의 기능을 동작에 활용해요.",
        "prompt": "Use the existing back-mounted equipment and its established articulation. If absent, use a compatible physical action without adding a backpack."
      },
      {
        "key": "tail_unit",
        "label": "꼬리·보조 장치",
        "description": "이미 있는 꼬리형 장비나 보조 장치를 활용해요.",
        "prompt": "Use an established tail-like or auxiliary unit with its correct attachment and continuous connection. If absent, adapt without adding appendages."
      },
      {
        "key": "defense_unit",
        "label": "기존 방어 구조",
        "description": "기존 방패·장갑·방어 장치를 우선 사용해요.",
        "prompt": "Use an existing shield or protective armor surface; when no shield exists, use a guarded body stance instead of adding one."
      }
    ]
  },
  {
    "key": "power",
    "label": "기술·에너지 발현",
    "description": "원본 타입에 맞는 기술의 발현 단계를 정해요. 장갑 개방이나 폭주 폼을 자동으로 켜지 않아요.",
    "promptLabel": "Power manifestation",
    "options": [
      {
        "key": "none",
        "label": "발현 없음",
        "description": "새로운 속성 에너지 없이 동작과 장비만 보여줘요.",
        "prompt": "Add no newly emitted elemental energy or charging aura; preserve only the design's established sensor lights."
      },
      {
        "key": "subtle",
        "label": "약한 기운",
        "description": "기존 장치 주변에 작은 타입별 기운만 표현해요.",
        "prompt": "Show a restrained hint of the source-appropriate ability localized to its existing origin point, if effects are enabled."
      },
      {
        "key": "concentrated",
        "label": "응축·준비",
        "description": "작은 범위에 힘이 모이는 준비 상태예요.",
        "prompt": "Suggest source-appropriate power gathering in a compact area at an established functional point, without changing the armor state."
      },
      {
        "key": "released",
        "label": "기술 발동",
        "description": "원본 타입의 기술이 한 방향으로 뻗는 순간이에요.",
        "prompt": "Show a source-appropriate technique directed along the action line, using an established emission point and respecting the selected effects amount."
      },
      {
        "key": "residual",
        "label": "발동 후 잔류",
        "description": "기술을 마친 뒤 남은 작은 기운을 표현해요.",
        "prompt": "Show only a fading source-appropriate trace after the technique, if effects are enabled; do not open or damage armor."
      }
    ]
  },
  {
    "key": "effects",
    "label": "효과량",
    "description": "섬광·잔상·먼지 같은 부가 효과의 양을 정해요. 없음이면 기술 선택과 관계없이 추가 효과를 억제해요.",
    "promptLabel": "Added effects",
    "options": [
      {
        "key": "none",
        "label": "없음",
        "description": "섬광·잔상·먼지 없이 자세와 구조가 또렷하게 보여요.",
        "prompt": "No added VFX: omit attack glows, auras, trails, motion blur, impact flashes, dust and debris; use the pose to communicate the action."
      },
      {
        "key": "minimal",
        "label": "적게",
        "description": "접촉점이나 기술 발생점에만 작은 효과를 넣어요.",
        "prompt": "Use minimal localized effects at contact or emission points, with the face, hands and armor edges unobscured."
      },
      {
        "key": "balanced",
        "label": "보통",
        "description": "동작의 방향이 보이되 인물과 장비를 가리지 않아요.",
        "prompt": "Use moderate effects to clarify the action direction while keeping the character and defining equipment unobscured."
      },
      {
        "key": "dramatic",
        "label": "강하게",
        "description": "선택한 동작 주변의 효과를 강조하되 얼굴과 주요 구조는 남겨요.",
        "prompt": "Use strong but controlled source-appropriate action effects around the movement, preserving clear face, hands, body contours and defining equipment."
      }
    ]
  },
  {
    "key": "speed",
    "label": "속도감",
    "description": "정지된 힘부터 순간 가속까지 움직임의 인상을 정해요. 체형과 카메라 거리는 유지해요.",
    "promptLabel": "Motion impression",
    "options": [
      {
        "key": "still",
        "label": "순간 정지",
        "description": "빠른 동작도 멈춘 프레임처럼 선명하게 보여요.",
        "prompt": "Freeze a readable instant with crisp contours and no speed blur, even if the underlying action is fast."
      },
      {
        "key": "slow",
        "label": "느리고 묵직하게",
        "description": "천천히 힘을 싣는 자세와 안정적인 접지감을 강조해요.",
        "prompt": "Convey slow deliberate power through weight transfer and grounded posture, not a thicker body or larger armor."
      },
      {
        "key": "fast",
        "label": "빠르고 경쾌하게",
        "description": "짧은 스텝과 분명한 이동 방향으로 속도를 보여줘요.",
        "prompt": "Convey brisk movement through coordinated pose and a clear travel direction; any trails follow the effects selection."
      },
      {
        "key": "burst",
        "label": "순간 가속",
        "description": "밀어내는 첫 동작과 강한 방향성을 강조해요.",
        "prompt": "Convey a sudden acceleration through a strong push-off and compact action line, without adding boosters or changing the selected form."
      }
    ]
  },
  {
    "key": "environment",
    "label": "전장·장소",
    "description": "액션이 벌어질 기본 환경을 고르고, 장소·상황 입력으로 날씨와 시간을 덧붙일 수 있어요.",
    "promptLabel": "Action environment",
    "options": [
      {
        "key": "training_ground",
        "label": "훈련장",
        "description": "낮은 장애물과 훈련용 표적이 있는 공간이에요.",
        "prompt": "Set the action in a clear training area with restrained practice obstacles appropriate to the chosen activity."
      },
      {
        "key": "city",
        "label": "도시 거리",
        "description": "도로와 건물 사이의 진로를 활용해요.",
        "prompt": "Set the action on a readable city street with clear movement space and restrained background detail."
      },
      {
        "key": "forest",
        "label": "숲·초목 지대",
        "description": "나무와 낮은 식물 사이에서 이동과 교전을 표현해요.",
        "prompt": "Set the action in woodland with spaced trunks, low plants and a readable route around the woman."
      },
      {
        "key": "rocky",
        "label": "암석·협곡",
        "description": "바위와 단단한 지면으로 접지감과 높낮이를 보여줘요.",
        "prompt": "Set the action on rocky terrain with stable ledges and a clear ground plane."
      },
      {
        "key": "coast",
        "label": "물가·해안",
        "description": "물과 젖은 지면을 활용하되 동작이 잘 보이게 해요.",
        "prompt": "Set the action at a shoreline or shallow waterside area with a clear footing and restrained reflections."
      },
      {
        "key": "ruins",
        "label": "유적·폐허",
        "description": "기둥과 낮은 잔해로 엄폐와 통로를 만들어요.",
        "prompt": "Set the action among old stone ruins with low obstacles and a readable passage, without forcing explosions or debris clouds."
      },
      {
        "key": "grassland",
        "label": "초원·평원",
        "description": "넓은 지면에서 동작과 실루엣을 또렷하게 보여줘요.",
        "prompt": "Set the action on an open grassy plain with a clear horizon and enough contextual detail for depth."
      },
      {
        "key": "indoor",
        "label": "실내 시설",
        "description": "단단한 바닥과 설비가 있는 실내에서 동작을 보여줘요.",
        "prompt": "Set the action in a spacious indoor facility with functional structures and a clear movement path."
      }
    ]
  }
];

  const ACTION_DIRECTION_RULES = "ACTION DIRECTION PRIORITY: These choices stage the selected form; they do not change identity, anatomy, armor thickness, coverage or opening state. Do not add equipment, weapons, appendages or propulsion to satisfy a scene. Use existing capability or adapt the activity. Explicit equipment, power, effects, speed and timing choices override incidental suggestions in the category or example. Effects none suppresses all added VFX even when power is selected; power none suppresses new elemental emissions while ordinary motion effects may follow their own setting. Existing sensor lights remain part of the design. Explicit pose, framing, lens and free-text scene requests remain authoritative within identity and form boundaries. An energetic attack never activates overdrive or opens panels automatically. Keep one main woman; targets and people being protected can stay off-frame.";

  root.AtelierSpec = {
    ACTION_CATEGORIES, ACTION_POSES, ACTION_CONTROLS, ACTION_DIRECTION_RULES,
    PROJECT_RULES, FORM_PROFILES, OUTPUT_PROFILES, REFERENCE_SHEET_PROFILE, IDENTITY_GROUPS, IDENTITY_EXCLUDED,
    SOURCE_WORD: SOURCE_WORD, SOURCE_INPUT: SOURCE_INPUT,
    CAT_SHORT: CAT_SHORT, PARAM_SHORT: PARAM_SHORT, SUMMARY_WORDS: SUMMARY_WORDS,
    PARAM_DEFS: PARAM_DEFS,
    SCENE_AXIS_GUIDES, ORIENTATION_GUIDES,
    PARAM_GUIDES, PARAM_GROUP_HELP, PARAM_HELP, HAIR_LENGTH_LIMITS, EYE_CONTOURS,
    CATS: CATS,
    PRESETS: PRESETS,
    ADVANCED_OPTIONS: ADVANCED_OPTIONS,
    ADVANCED_LABELS: ADVANCED_LABELS,
    RANDOM_POOL: RANDOM_POOL,
    STYLE_SAMPLE: STYLE_SAMPLE,
    EXAMPLE_MAP: EXAMPLE_MAP,
    GROUP_LABELS: GROUP_LABELS,
    EXPRESSION_DETAIL: EXPRESSION_DETAIL,
    EXPRESSION_OPTIONS: EXPRESSION_OPTIONS,
    ORIENTATION_OPTIONS: ORIENTATION_OPTIONS,
    POSE_OPTIONS: POSE_OPTIONS,
    POSE_GUIDES, FRAME_OPTIONS, FRAME_GUIDES, LENS_OPTIONS, LENS_GUIDES, SCENE_CHOICE_RULE,
    EX_NOTE: EX_NOTE,
    CAT_KO: CAT_KO,
    ADV_AXIS: ADV_AXIS,
    ADV_VAL: ADV_VAL,
    RANDOM_MODES: RANDOM_MODES,
    ART_STYLES: ART_STYLES,
    STYLE_CORES: STYLE_CORES,
    ANTHRO_STYLE_EXTENSIONS: ANTHRO_STYLE_EXTENSIONS,
    LIFESTYLE_STYLE_EXTENSIONS: LIFESTYLE_STYLE_EXTENSIONS,
    STYLE_PROFILES: STYLE_PROFILES,
    ETHNIC_PART: ETHNIC_PART,
    DEFAULT_STYLE: DEFAULT_STYLE,
    MODE: MODE,
    CUTE_SET: CUTE_SET,
    CUTE_LOCK: CUTE_LOCK,
    YOUTHFUL_LOCK: YOUTHFUL_LOCK,
    UNDERBOOB_NEG: UNDERBOOB_NEG,
    UNDERBOOB_POS: UNDERBOOB_POS,
    BODY_FIG: BODY_FIG,
    HAIR_FIG: HAIR_FIG,
    GROUP_META: GROUP_META,
    ONLY: ONLY,
    COLOR_HEX: COLOR_HEX,
    COLOR_KEYS: COLOR_KEYS,
    LOCAL_AXES: LOCAL_AXES,
    PAIR_ONLY: PAIR_ONLY,
    ADV_EN: ADV_EN,
    TRAD_EX: TRAD_EX,
  };
})(window);
