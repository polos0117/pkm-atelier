/* 프롬프트 자료 표 — 사람이 읽는 말과 생성기에 나가는 문구가 전부 여기 있다.
   atelier 의 선택지·화풍을 바탕으로 포켓몬 메카 생성 규칙을 분리했다.

   여기만 갈아 끼우면 다른 주제로 돈다. 조립부(prompt-anthro.js ·
   prompt-lifestyle.js)에는 한글이 0자리다 — 말은 전부 이 표에서 꺼내 쓴다.

   PROMPT_LINES·FORM_LINES·OPEN_LINES·WEAR_PARTS 가 생성 규칙의 기준이다(2026-10-02 간결화 —
   docs/PROMPT_REWRITE.md 첫 절). 화풍 키와 외형 선택지 키는 자료·그림 파일과 연결되므로 유지한다.
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

  const PARAM_DEFS = [{"key": "apparent age", "label": "Apparent Age", "ko": "외관상 나이", "options": [["", "AUTO — 원본 포켓몬 이미지에 맞춰 자동 결정"], ["20s", "20s — 20대 성인"], ["30s", "30s — 30대 성인"], ["40s", "40s — 40대 성인"], ["mature adult", "Mature Adult — 성숙하고 연륜 있는 성인"], ["youthful adult", "Youthful — 동안 (성인이되 어려 보이는 얼굴)"], ["__custom__", "직접 입력… — 원하는 나이 인상 직접 작성"]], "group": "base"}, {"key": "facial ethnicity", "label": "Facial Ethnicity", "ko": "얼굴 계통", "options": [["", "AUTO — 지정 안 함 (모델 기본값 = 서구권으로 쏠리기 쉬움)"], ["East Asian", "East Asian — 동아시아 계열"], ["Korean", "Korean — 한국계"], ["Japanese", "Japanese — 일본계"], ["Chinese", "Chinese — 중국계"], ["Southeast Asian", "Southeast Asian — 동남아 계열"], ["Central Asian", "Central Asian — 중앙아시아 계열"], ["South Asian", "South Asian — 남아시아 계열"], ["Middle Eastern", "Middle Eastern — 중동 계열"], ["European", "European — 유럽 계열"], ["Nordic", "Nordic — 북유럽 계열"], ["Mediterranean", "Mediterranean — 지중해 계열"], ["Slavic", "Slavic — 슬라브 계열"], ["Latin American", "Latin American — 라틴 계열"], ["African", "African — 아프리카 계열"], ["mixed East Asian and European", "Mixed (EA×EU) — 동아시아·유럽 혼혈"], ["__custom__", "직접 입력… — 원하는 계통 직접 작성"]], "group": "base"}, {"key": "human-mechanical balance", "label": "Human ↔ Mechanical Balance", "ko": "인간/기계 비율", "options": [["", "AUTO — 원본 포켓몬에 맞춰 자동 결정"], ["more human", "More Human — 인간 신체 비중을 더 높임"], ["balanced", "Balanced — 인간과 기계 요소를 균형 있게"], ["more mechanical", "More Mechanical — 기계 장갑 비중을 더 높임"], ["very mechanical", "Very Mechanical — 원원본 포켓몬 구조를 매우 강하게 유지"], ["__custom__", "직접 입력… — 원하는 비율 직접 작성"]], "group": "base"}, {"key": "body type", "label": "Body Type", "ko": "체형", "options": [["", "AUTO — 원본 포켓몬 실루엣에서 자동 추론"], ["slender", "Slender — 가늘고 슬림한 체형"], ["athletic", "Athletic — 탄탄한 운동형 체형"], ["curvy", "Curvy — 허리와 골반 곡선이 강조된 체형"], ["glamorous", "Glamorous — 풍만하고 화려한 체형"], ["muscular", "Muscular — 근육이 뚜렷한 체형"], ["heavy-built", "Heavy-built — 중후하고 묵직한 체형"], ["tall and lean", "Tall & Lean — 장신의 길고 슬림한 체형"], ["petite", "Petite — 작고 아담한 체형"], ["hourglass", "Hourglass — 허리가 잘록한 모래시계형"], ["voluptuous", "Voluptuous — 굴곡이 크고 육감적인 체형"], ["toned", "Toned — 군살 없이 잔근육이 잡힌 체형"], ["wiry", "Wiry — 가늘지만 단단한 체형"], ["soft-figured", "Soft-figured — 부드럽고 살집 있는 체형"], ["pear-shaped", "Pear-shaped — 하체에 무게가 실린 체형"], ["inverted triangle", "Inverted Triangle — 어깨가 넓고 하체가 좁은 역삼각형"], ["stocky", "Stocky — 짧고 다부진 체형"], ["statuesque", "Statuesque — 크고 당당한 조각상 같은 체형"], ["broad-shouldered", "Broad-shouldered — 어깨가 특히 넓은 체형"], ["burly", "Burly — 크고 두꺼운 거구"], ["lanky", "Lanky — 키만 크고 마른 체형"], ["barrel-chested", "Barrel-chested — 흉곽이 통처럼 두꺼운 체형"], ["rangy", "Rangy — 길고 유연한 근육질"], ["__custom__", "직접 입력… — 원하는 체형 직접 작성"]], "group": "build"}, {"key": "height impression", "label": "Height Impression", "ko": "키 인상", "options": [["", "AUTO — 전체 비율에서 자동 결정"], ["short", "Short — 비교적 작은 키 인상"], ["average", "Average — 평균적인 키 인상"], ["tall", "Tall — 장신 인상"], ["very tall", "Very Tall — 매우 큰 키 인상"], ["__custom__", "직접 입력… — 원하는 키/비율 직접 작성"]], "group": "build", "sub": "body type"}, {"key": "shoulder build", "label": "Shoulder Build", "ko": "어깨 체형", "options": [["", "AUTO — 자동 결정"], ["narrow", "Narrow — 좁은 어깨"], ["average", "Average — 평균적인 어깨"], ["broad", "Broad — 넓은 어깨"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "torso / chest build", "label": "Torso / Chest Build", "ko": "상체/흉곽 인상", "options": [["", "AUTO — 자동 결정"], ["slim", "Slim — 얇고 가벼운 상체"], ["balanced", "Balanced — 균형 잡힌 상체"], ["full", "Full — 풍만한 상체"], ["powerful", "Powerful — 넓고 강한 흉곽"], ["v-taper", "V-taper — 어깨에서 허리로 급히 좁아지는 상체"], ["full bust", "Full Bust — 가슴 볼륨이 뚜렷한 상체"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "torso length", "label": "Torso Length", "ko": "몸통 길이", "options": [["", "AUTO — 자동 결정"], ["short", "Short — 짧은 몸통"], ["balanced", "Balanced — 보통"], ["long", "Long — 긴 몸통"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "waist / hip silhouette", "label": "Waist / Hip Silhouette", "ko": "허리/골반 실루엣", "options": [["", "AUTO — 자동 결정"], ["straight", "Straight — 직선적인 실루엣"], ["athletic", "Athletic — 운동형 허리/골반"], ["balanced", "Balanced — 균형형"], ["hourglass", "Hourglass — 허리가 잘록한 모래시계형"], ["curvy", "Curvy — 골반 곡선이 강조된 형태"], ["narrow-hipped", "Narrow-hipped — 골반이 좁은 형태"], ["broad-hipped", "Broad-hipped — 골반이 넓게 벌어진 형태"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "leg proportion", "label": "Leg Proportion", "ko": "다리 비율", "options": [["", "AUTO — 자동 결정"], ["balanced", "Balanced — 균형형"], ["long", "Long — 긴 다리"], ["very long", "Very Long — 매우 긴 다리"], ["powerful", "Powerful — 굵고 힘 있는 다리"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "lower-body build", "label": "Lower-body Build", "ko": "하체 굵기", "options": [["", "AUTO — 자동 결정"], ["slender", "Slender — 가는 하체"], ["balanced", "Balanced — 보통"], ["full", "Full — 굵은 하체"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type"}, {"key": "body measurements (B/W/H)", "label": "Body Measurements", "ko": "신체 치수 B/W/H", "options": [["", "AUTO — 자동 결정"], ["__custom__", "직접 입력…"]], "group": "build", "sub": "body type", "ph": "94 / 61 / 95"}, {"key": "facial character", "label": "Facial Character", "ko": "얼굴 인상", "options": [["", "AUTO — 원본 포켓몬 성격에 맞춰 자동 결정"], ["elegant", "Elegant — 우아하고 정제된 인상"], ["cool", "Cool — 차갑고 세련된 인상"], ["sharp", "Sharp — 예리하고 공격적인 인상"], ["mature", "Mature — 성숙하고 안정된 인상"], ["soft", "Soft — 부드럽고 온화한 인상"], ["glamorous", "Glamorous — 화려하고 매력적인 인상"], ["rugged", "Rugged — 거칠고 강인한 인상"], ["stoic", "Stoic — 무표정하고 절제된 인상"], ["weathered", "Weathered — 풍상을 겪은 거친 인상"], ["boyish", "Boyish — 앳되고 장난기 있는 인상"], ["regal", "Regal — 위엄 있고 고압적인 인상"], ["cute", "Cute — 귀엽고 사랑스러운 인상"], ["doll-like", "Doll-like — 인형처럼 정제된 인상"], ["cheerful", "Cheerful — 밝고 명랑한 인상"], ["innocent", "Innocent — 맑고 순수해 보이는 인상"], ["friendly", "Friendly — 다가가기 쉬운 인상"], ["sleepy-eyed", "Sleepy-eyed — 나른한 인상"], ["refined", "Refined — 단정하고 세련된 인상"], ["fierce", "Fierce — 사납고 거센 인상"], ["exotic", "Exotic — 이국적인 인상"], ["androgynous", "Androgynous — 중성적인 인상"], ["melancholic", "Melancholic — 어딘가 쓸쓸한 인상"], ["__custom__", "직접 입력… — 원하는 얼굴 인상 직접 작성"]], "group": "face"}, {"key": "facial hair", "label": "Facial Hair", "ko": "수염", "sex": "male", "options": [["", "AUTO — 원본 포켓몬 인상에 맞춰 자동 결정"], ["clean-shaven", "Clean-shaven — 수염 없이 매끈하게"], ["light stubble", "Light Stubble — 하루이틀 자란 옅은 수염"], ["heavy stubble", "Heavy Stubble — 짙게 자란 무정수염"], ["mustache", "Mustache — 콧수염만"], ["goatee", "Goatee — 턱 끝만 좁게 기른 염소수염"], ["short beard", "Short Beard — 짧게 다듬은 턱수염"], ["full beard", "Full Beard — 풍성한 전체 수염"], ["chinstrap beard", "Chinstrap — 턱선을 따라 가늘게 두른 수염"], ["sideburns", "Sideburns — 구레나룻 강조"], ["__custom__", "직접 입력… — 원하는 수염 형태 직접 작성"]], "group": "face"}, {"key": "skin tone", "label": "Skin Tone", "ko": "피부 톤", "options": [["", "AUTO — 자동 결정"], ["pale", "Pale — 매우 밝은 피부"], ["light", "Light — 밝은 피부"], ["medium", "Medium — 중간 피부톤"], ["tan", "Tan — 태닝된 피부"], ["deep", "Deep — 짙은 피부톤"], ["__custom__", "직접 입력…"]], "group": "face"}, {"key": "face shape", "label": "Face Shape", "ko": "얼굴형", "options": [["", "AUTO — 원본 포켓몬 디자인에서 자동 추론"], ["oval", "Oval — 균형 잡힌 타원형"], ["angular", "Angular — 각지고 선명한 얼굴형"], ["heart-shaped", "Heart-shaped — 이마가 넓고 턱이 가는 하트형"], ["elongated", "Elongated — 길고 세련된 얼굴형"], ["compact", "Compact — 짧고 응축된 얼굴형"], ["softly rounded", "Softly Rounded — 부드럽고 둥근 얼굴형"], ["sharp", "Sharp — 턱선과 골격이 날카로운 얼굴형"], ["__custom__", "직접 입력… — 얼굴형 직접 작성"]], "group": "face", "sub": "facial character"}, {"key": "eye shape", "label": "Eye Shape", "ko": "눈매", "options": [["", "AUTO — 자동 결정"], ["narrow", "Narrow — 가늘고 날카로운 눈"], ["almond", "Almond — 아몬드형 눈"], ["large", "Large — 큰 눈"], ["sharp", "Sharp — 강하게 치켜올라간 눈"], ["drooping", "Drooping — 살짝 처진 부드러운 눈"], ["upturned", "Upturned — 끝이 올라간 눈"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eye color", "label": "Eye Color", "ko": "눈동자 색 · 오른쪽", "options": [["", "AUTO — 센서/원본 포켓몬색에서 자동 결정"], ["red", "Red — 적색"], ["crimson", "Crimson — 진홍색"], ["amber", "Amber — 호박색"], ["gold", "Gold — 금색"], ["orange", "Orange — 주황색"], ["green", "Green — 녹색"], ["teal", "Teal — 청록색"], ["pale blue", "Pale Blue — 옅은 하늘색"], ["blue", "Blue — 청색"], ["navy", "Navy — 짙은 남색"], ["purple", "Purple — 보라색"], ["lavender", "Lavender — 연보라"], ["pink", "Pink — 분홍색"], ["gray", "Gray — 회색"], ["silver", "Silver — 은색"], ["brown", "Brown — 갈색"], ["black", "Black — 검은색"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "second eye color", "label": "Second Eye Color", "ko": "오드아이 · 왼쪽 눈", "group": "face", "sub": "facial character", "options": [["", "사용 안 함 — 양쪽 같은 색"], ["red", "Red — 적색"], ["crimson", "Crimson — 진홍색"], ["amber", "Amber — 호박색"], ["gold", "Gold — 금색"], ["orange", "Orange — 주황색"], ["green", "Green — 녹색"], ["teal", "Teal — 청록색"], ["pale blue", "Pale Blue — 옅은 하늘색"], ["blue", "Blue — 청색"], ["navy", "Navy — 짙은 남색"], ["purple", "Purple — 보라색"], ["lavender", "Lavender — 연보라"], ["pink", "Pink — 분홍색"], ["gray", "Gray — 회색"], ["silver", "Silver — 은색"], ["brown", "Brown — 갈색"], ["black", "Black — 검은색"], ["__custom__", "직접 입력… — 원하는 색 직접 작성"]]}, {"key": "expression", "label": "Expression", "ko": "표정", "options": [["", "AUTO — 원본 포켓몬 성격에 맞춰 자동 결정"], ["calm", "Calm — 차분함"], ["serious", "Serious — 진지함"], ["confident", "Confident — 자신감"], ["cold", "Cold — 차갑고 냉정함"], ["gentle", "Gentle — 부드러움"], ["smirk", "Smirk — 옅은 비웃음/미소"], ["fierce", "Fierce — 강렬하고 사나움"], ["stoic", "Stoic — 감정을 절제한 무표정"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "face length", "label": "Face Length", "ko": "얼굴 길이", "options": [["", "AUTO — 자동 결정"], ["short", "Short — 짧은 얼굴"], ["balanced", "Balanced — 보통"], ["long", "Long — 긴 얼굴"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "face width", "label": "Face Width", "ko": "얼굴 폭", "options": [["", "AUTO — 자동 결정"], ["narrow", "Narrow — 좁은 얼굴"], ["medium", "Medium — 보통"], ["wide", "Wide — 넓은 얼굴"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "jaw & chin", "label": "Jaw & Chin", "ko": "턱선 · 턱끝", "options": [["", "AUTO — 자동 결정"], ["soft rounded jaw", "Soft — 부드럽고 둥근 턱"], ["balanced jawline", "Balanced — 보통"], ["angular defined jaw", "Angular — 각지고 또렷한 턱"], ["square broad jaw", "Square — 넓고 각진 사각 턱"], ["narrow tapered chin", "Tapered — 아래로 갈수록 좁아지는 턱끝"], ["wide heavy chin", "Heavy — 넓고 묵직한 턱끝"], ["long chin with defined jaw", "Long — 턱끝이 길고 턱선이 또렷한"], ["receding soft chin", "Receding — 턱끝이 뒤로 물러난"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eye size", "label": "Eye Size", "ko": "눈 크기", "options": [["", "AUTO — 자동 결정"], ["small", "Small — 작은 눈"], ["medium", "Medium — 보통"], ["large", "Large — 큰 눈"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eye tilt", "label": "Eye Tilt", "ko": "눈꼬리 각도", "options": [["", "AUTO — 자동 결정"], ["downturned outer corners", "Downturned — 처진 눈꼬리"], ["level outer corners", "Level — 수평"], ["upturned outer corners", "Upturned — 올라간 눈꼬리"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eye spacing", "label": "Eye Spacing", "ko": "눈 간격", "options": [["", "AUTO — 자동 결정"], ["close-set eyes", "Close-set — 눈 사이가 가까운"], ["average eye spacing", "Average — 눈 하나 너비 안팎"], ["wide-set eyes", "Wide-set — 눈 사이가 넓은"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "eyebrows", "label": "Eyebrows", "ko": "눈썹", "options": [["", "AUTO — 자동 결정"], ["fine soft arches", "Fine Arch — 가늘고 완만한 곡선"], ["long arched brows", "Long Arch — 길고 바깥 아치가 선명한"], ["straight medium brows", "Straight — 중간 두께의 직선"], ["thin straight brows", "Thin Straight — 가늘고 곧은"], ["thick low brows", "Thick Low — 굵고 눈 가까이 낮은"], ["angled brows", "Angled — 바깥에서 꺾이는 사선"], ["short rounded brows", "Short Round — 짧고 둥근"], ["feathered full brows", "Feathered — 숱 많고 결이 보이는"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "nose character", "label": "Nose Character", "ko": "코", "options": [["", "AUTO — 자동 결정"], ["small delicate nose", "Delicate — 작고 여린 코"], ["balanced nose", "Balanced — 보통"], ["prominent defined nose", "Prominent — 크고 또렷한 코"], ["straight slender bridge", "Straight — 곧고 가는 콧대"], ["aquiline nose with convex bridge", "Aquiline — 콧대가 볼록한 매부리코"], ["rounded soft tip", "Rounded Tip — 코끝이 둥근"], ["broad low bridge", "Broad Low — 콧대가 낮고 넓은"], ["short nose with upturned tip", "Upturned — 짧고 코끝이 들린"], ["long nose with low tip", "Long — 길고 코끝이 내려온"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "lips", "label": "Lips", "ko": "입술", "options": [["", "AUTO — 자동 결정"], ["thin lips", "Thin — 얇은 입술"], ["medium lips", "Medium — 보통"], ["full lips", "Full — 도톰한 입술"], ["fuller lower lip", "Fuller Lower — 아랫입술이 더 도톰한"], ["bow-shaped upper lip", "Bow — 윗입술이 활 모양인"], ["straight even lips", "Even — 굴곡 없이 곧은"], ["wide mouth", "Wide — 입이 넓은"], ["small mouth", "Small — 입이 작은"], ["__custom__", "직접 입력…"]], "group": "face", "sub": "facial character"}, {"key": "hair color", "label": "Hair Color", "ko": "머리색", "options": [["", "AUTO — 원본 포켓몬 색상에 맞춰 자동 결정"], ["white", "White — 흰색"], ["platinum", "Platinum — 백금색"], ["silver", "Silver — 은색"], ["ash blonde", "Ash Blonde — 애시 블론드"], ["blonde", "Blonde — 금발"], ["gold", "Gold — 금색"], ["orange", "Orange — 주황색"], ["red", "Red — 붉은색"], ["crimson", "Crimson — 진홍색"], ["pink", "Pink — 분홍색"], ["purple", "Purple — 보라색"], ["lavender", "Lavender — 연보라"], ["navy", "Navy — 짙은 남색"], ["blue", "Blue — 파란색"], ["teal", "Teal — 청록색"], ["mint", "Mint — 민트색"], ["green", "Green — 녹색"], ["brown", "Brown — 갈색"], ["black", "Black — 검은색"], ["__custom__", "직접 입력… — 원하는 색 직접 작성"]], "group": "hair"}, {"key": "hairstyle", "label": "Hairstyle", "ko": "헤어스타일", "options": [["", "AUTO — 원본 포켓몬 디자인에 맞춰 자동 결정"], ["bob", "Bob — 단정한 보브컷"], ["pixie cut", "Pixie Cut — 짧고 가벼운 픽시컷"], ["layered", "Layered — 층을 살린 레이어드"], ["ponytail", "Ponytail — 포니테일"], ["twin tail", "Twin Tail — 트윈테일"], ["wolf cut", "Wolf Cut — 층감이 강한 울프컷"], ["slicked back", "Slicked Back — 뒤로 넘긴 스타일"], ["wavy", "Wavy — 웨이브 헤어"], ["straight", "Straight — 곧은 생머리"], ["side ponytail", "Side Ponytail — 사이드 포니테일"], ["high ponytail", "High Ponytail — 높이 묶은 포니테일"], ["braid", "Single Braid — 한 갈래 땋은 머리"], ["twin braids", "Twin Braids — 양갈래 땋은 머리"], ["crown braid", "Crown Braid — 머리를 둘러 땋은 왕관형"], ["chignon", "Chignon — 단정하게 말아 올린 시뇽"], ["messy bun", "Messy Bun — 흐트러진 번"], ["top knot", "Top Knot — 정수리에 묶어 올린 번"], ["low bun", "Low Bun — 목덜미 낮은 번"], ["half-up", "Half-up — 반묶음"], ["space buns", "Space Buns — 양쪽 동그란 번"], ["hime cut", "Hime Cut — 히메컷"], ["asymmetric cut", "Asymmetric Cut — 좌우 길이가 다른 비대칭컷"], ["undercut", "Undercut — 옆/뒤를 밀어낸 언더컷"], ["side-shaved long hair", "Side-shaved Long — 한쪽만 밀고 나머지는 긴 머리"], ["curly", "Curly — 굵은 곱슬"], ["tight curls", "Tight Curls — 잔곱슬 / 아프로"], ["locs", "Locs — 로크스 / 드레드풍"], ["ringlet curls", "Ringlet Curls — 세로로 말린 드릴 컬"], ["finger waves", "Finger Waves — 레트로 웨이브"], ["feathered", "Feathered — 끝을 가볍게 친 페더컷"], ["blunt cut", "Blunt Cut — 끝을 일자로 자른 컷"], ["wet-look slick", "Wet-look Slick — 젖은 듯 넘긴 스타일"], ["windswept", "Windswept — 바람에 날린 듯한 스타일"], ["buzz cut", "Buzz Cut — 아주 짧게 민 머리"], ["crew cut", "Crew Cut — 짧고 단정한 크루컷"], ["side part", "Side Part — 가르마를 탄 단정한 컷"], ["fade", "Fade — 옆을 그라데이션으로 짧게 친 컷"], ["man bun", "Man Bun — 뒤로 묶어 올린 번"], ["swept back", "Swept Back — 뒤로 넘긴 볼륨 있는 스타일"], ["shaggy", "Shaggy — 덥수룩하게 흐트러진 컷"], ["mullet", "Mullet — 앞은 짧고 뒤만 긴 컷"], ["afro", "Afro — 둥글게 부풀린 아프로"], ["afro puffs", "Afro Puffs — 양쪽 아프로 퍼프"], ["box braids", "Box Braids — 가는 박스 브레이드"], ["cornrows", "Cornrows — 두피에 붙여 땋은 콘로"], ["fishtail braid", "Fishtail Braid — 한쪽으로 넘긴 피시테일"], ["beach waves", "Beach Waves — 느슨한 해변 웨이브"], ["__custom__", "직접 입력… — 헤어스타일 직접 작성"]], "group": "hair"}, {"key": "hair length", "label": "Hair Length", "ko": "머리 길이", "options": [["", "AUTO — 원본 포켓몬 실루엣에 맞춰 자동 결정"], ["very short", "Very Short — 매우 짧은 머리"], ["short", "Short — 짧은 머리"], ["medium", "Medium — 중간 길이"], ["long", "Long — 긴 머리"], ["very long", "Very Long — 매우 긴 머리"], ["__custom__", "직접 입력… — 길이 직접 작성"]], "group": "hair", "sub": "hairstyle"}, {"key": "bangs", "label": "Bangs", "ko": "앞머리", "options": [["", "AUTO — 자동 결정"], ["none", "None — 앞머리 없음"], ["straight bangs", "Straight Bangs — 일자 앞머리"], ["side-swept bangs", "Side-swept Bangs — 옆으로 넘긴 앞머리"], ["curtain bangs", "Curtain Bangs — 커튼뱅"], ["long side bangs", "Long Side Bangs — 긴 사이드뱅"], ["long side bangs covering one eye", "One-eye Cover — 한쪽 눈을 덮는 긴 사이드뱅"], ["asymmetric bangs", "Asymmetric Bangs — 좌우 길이가 다른 앞머리"], ["parted bangs", "Parted Bangs — 가운데를 가른 앞머리"], ["choppy bangs", "Choppy Bangs — 끝을 불규칙하게 친 앞머리"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "hair accent", "label": "Hair Accent", "ko": "머리 삐침 · 잔머리", "group": "hair", "sub": "hairstyle", "options": [["", "AUTO — 지정 안 함"], ["a single antenna strand standing up", "Antenna Strand — 안테나 헤어 한 가닥"], ["two antenna strands standing up", "Twin Antennae — 안테나 헤어 두 가닥"], ["a prominent cowlick", "Cowlick — 크게 뻗친 가마머리"], ["loose stray strands framing the face", "Stray Strands — 얼굴 옆 잔머리"], ["neatly kept, no stray strands", "Neat — 삐침 없이 정돈"], ["__custom__", "직접 입력… — 원하는 형태 직접 작성"]]}, {"key": "hair texture", "label": "Hair Texture", "ko": "머릿결", "options": [["", "AUTO — 자동 결정"], ["fine", "Fine — 가늘고 매끄러운"], ["medium", "Medium — 보통"], ["thick", "Thick — 굵고 뻣뻣한"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "hair volume", "label": "Hair Volume", "ko": "머리 볼륨", "options": [["", "AUTO — 자동 결정"], ["flat", "Flat — 납작한"], ["moderate", "Moderate — 보통"], ["full", "Full — 풍성한"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "parting", "label": "Parting", "ko": "가르마", "options": [["", "AUTO — 자동 결정"], ["center part", "Center — 가운데 가르마"], ["slight off-center part", "Slight off-center — 살짝 비낀 가르마"], ["deep side part", "Deep side — 깊은 옆 가르마"], ["no visible part", "None — 가르마 없음"], ["swept back", "Swept back — 뒤로 넘긴"], ["__custom__", "직접 입력…"]], "group": "hair", "sub": "hairstyle"}, {"key": "armor coverage", "label": "Armor Coverage", "ko": "장갑 커버리지", "options": [["", "AUTO — 원본 포켓몬 구조에서 자동 결정"], ["full", "Full — 거의 전신 장갑"], ["high", "High — 장갑 비중이 높은 편"], ["balanced", "Balanced — 피부와 장갑의 균형"], ["open", "Open — 일부 피부 노출이 더 많은 구조"], ["__custom__", "직접 입력… — 커버리지 직접 작성"]], "group": "armor"}, {"key": "lower-body treatment", "label": "Lower-body Treatment", "ko": "하체 장갑 구조", "options": [["", "AUTO — 원원본 포켓몬 실루엣에 맞춰 자동 결정"], ["armored skirt", "Armored Skirt — 스커트형 장갑"], ["split armored skirt", "Split Armored Skirt — 좌우 분할 스커트 장갑"], ["robe-like armor", "Robe-like Armor — 로브형 장갑"], ["mantle-like armor", "Mantle-like Armor — 망토/드레이프형 장갑"], ["pants armor", "Pants Armor — 바지처럼 이어지는 장갑 구조"], ["layered plates", "Layered Plates — 여러 겹 판넬형 하체 장갑"], ["__custom__", "직접 입력… — 하체 구조 직접 작성"]], "group": "armor", "sub": "armor coverage"}, {"key": "silhouette character", "label": "Silhouette Character", "ko": "전체 실루엣 성격", "options": [["", "AUTO — 자동 결정"], ["aerodynamic", "Aerodynamic — 공기역학적이고 날렵함"], ["elegant", "Elegant — 우아하고 유려함"], ["aggressive", "Aggressive — 공격적이고 뾰족함"], ["heavy", "Heavy — 중장갑형의 묵직함"], ["tactical", "Tactical — 실전적이고 전술적"], ["regal", "Regal — 위엄 있고 장식적인 인상"], ["experimental", "Experimental — 실험기다운 이질적 형태"], ["minimal", "Minimal — 간결하고 절제된 형태"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "equipment emphasis", "label": "Equipment Emphasis", "ko": "장비 강조", "options": [["", "AUTO — 원본 포켓몬 대표 장비를 자동 우선"], ["balanced", "Balanced — 장비를 균형 있게"], ["backpack", "Backpack — 백팩 구조 강조"], ["wings / binders", "Wings / Binders — 날개/바인더 강조"], ["main weapon", "Main Weapon — 주무장 강조"], ["shield", "Shield — 방패 강조"], ["remote weapons", "Remote Weapons — 판넬/비트/드론 강조"], ["transformation system", "Transformation System — 변형기구 강조"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "equipment state", "label": "Equipment State", "ko": "장비 상태", "options": [["", "AUTO — 자동 결정"], ["fully mounted", "Fully Mounted — 장비 전부 장착"], ["main weapon held", "Main Weapon Held — 주무장을 손에 듦"], ["weapons stowed", "Weapons Stowed — 무장 수납 상태"], ["equipment deployed", "Equipment Deployed — 날개/판넬 등 전개 상태"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "pose character", "label": "Pose Character", "ko": "포즈 성격", "options": [["", "AUTO — 자동 결정"], ["neutral", "Neutral — 정적인 기본 자세"], ["heroic", "Heroic — 영웅적인 자세"], ["confident", "Confident — 자신감 있는 자세"], ["relaxed", "Relaxed — 힘을 뺀 자연스러운 자세"], ["combat-ready", "Combat-ready — 전투 준비 자세"], ["elegant", "Elegant — 우아한 자세"], ["__custom__", "직접 입력…"]], "group": "shot"}, {"key": "view angle", "label": "View Angle", "ko": "시점", "options": [["", "AUTO — 자동 결정"], ["front", "Front — 정면"], ["front three-quarter", "Front 3/4 — 정면 45도"], ["side", "Side — 측면"], ["rear three-quarter", "Rear 3/4 — 후면 45도"], ["__custom__", "직접 입력…"]], "group": "shot"}];

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

  const POSE_OPTIONS = [["", "자동 — 장면에 맞게"], ["standing_relaxed", "편하게 선 자세"], ["standing_formal", "반듯하게 서기"], ["contrapposto", "한쪽 다리에 무게 싣기"], ["hand_on_hip", "허리에 손"], ["arms_crossed", "팔짱"], ["sitting", "의자에 앉기"], ["sitting_floor", "바닥에 앉기"], ["kneeling", "무릎을 댄 자세"], ["leaning_wall", "벽에 기대기"], ["leaning_furniture", "가구에 기대기"], ["walking", "걷기"], ["mid_stride", "걸음 중간"], ["stretching", "기지개"], ["bending_over", "상체 숙이기"], ["on_tiptoe", "발끝 세우기"], ["hands_in_hair", "머리 정리하기"], ["finger_to_lips", "손가락 하나로 쉿"], ["thumbs_up", "엄지 척"], ["carrying_something", "물건 들기"], ["mid_action", "동작 한가운데"], ["squatting", "쪼그려 앉기"], ["one_knee_up", "한쪽 무릎 세워 앉기"], ["side_sitting", "다리를 옆으로 두고 앉기"], ["cross_legged", "책상다리로 앉기"], ["perched_seat", "걸터앉기"], ["turning_back", "돌아보는 순간"], ["waving", "가볍게 손 흔들기"], ["holding_cup", "컵 들고 쉬기"], ["reading_book", "책 읽기"], ["offering_food", "간식 건네기"], ["gentle_pat", "쓰다듬기"], ["watering", "물 주기"], ["preparing_food", "음식 준비하기"], ["taking_photo", "사진 찍기"], ["adjusting_bag", "가방끈 고쳐 메기"], ["checking_map", "지도 펼쳐 보기"], ["dance_step", "작은 댄스 스텝"], ["clapping", "박수 치기"], ["looking_through", "쌍안경·망원경으로 보기"], ["pouring_drink", "음료 따르기"], ["sketching", "스케치·적기"], ["folding_cloth", "천 개기"], ["playing_instrument", "악기 연주"], ["eating", "먹기·맛보기"], ["holding_umbrella", "우산 들기"], ["dressing_up", "장신구·신발 매만지기"], ["lying_prone", "엎드리기"], ["lying_side", "옆으로 눕기"]];

  const ADV_AXIS = {"overall_intensity": "이 장면의 스타일링과 분위기를 얼마나 강하게 표현할지 정해요.", "pair_gap": "각 쌍에서 앞 컷과 뒤 컷의 강도 차이.", "outfit_variety": "여섯 컷의 의상이 서로 얼마나 달라야 하는지.", "scene_variety": "장소와 상황이 서로 얼마나 달라야 하는지.", "pose_variety": "자세와 몸의 방향이 서로 얼마나 달라야 하는지.", "camera_variety": "카메라 거리와 각도가 얼마나 달라야 하는지.", "skin_exposure": "가슴·골반을 제외한 부위의 노출 정도.", "separates_preference": "상하의가 나뉜 옷을 얼마나 선호할지. 원피스 쏠림을 막는다.", "action_level": "쉬는 장면부터 활발한 움직임까지 동작의 크기를 정해요.", "direct_gaze_limit": "카메라를 정면으로 보는 컷을 최대 몇 개까지 둘지.", "smile_limit": "미소 짓는 컷을 최대 몇 개까지 둘지. 표정이 하나로 수렴하는 걸 막는다.", "unexpected_cuts": "예상 밖 발상의 컷을 몇 개 섞을지.", "source_influence": "포켓몬의 특징을 장신구와 주변 사물에 얼마나 보여줄지 정해요. 옷의 색·무늬에는 넣지 않아요(2026-10-29)."};

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

  /* 최초 인물의 세부 외형 해석. 후속 생성에는 승인한 이미지가 우선한다. */
  const ETHNIC_PART=[
    ['facial bone structure',['face shape','face length','face width','jaw & chin']],
    ['eye shape',['eye shape','eye size','eye tilt','eye spacing']],
    ['eyelid form',['eye shape','eye size','eye tilt']],
    ['brow shape',['eyebrows']],
    ['nose bridge',['nose character']],
    ['lip shape',['lips']]
  ];
  const DEFAULT_STYLE='glossy_promo';   /* 기본 화풍 — IMAGE_RULES·얼굴 설계표와 같이(2026-10-12) */
  const MODE = { PORTRAIT:'portrait', ACTION:'action', CASUAL:'casual' };
  const CUTE_SET={'cute':1,'doll-like':1,'innocent':1,'cheerful':1};
  const CUTE_LOCK='Express {C} through expression and stylization while preserving the selected age and facial geometry.';
  const YOUTHFUL_LOCK='A woman in her twenties with youthful facial styling; preserve explicit facial geometry and body settings.';

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
    /* 2026-10-27 더한 여성 머리 — 아프로·브레이드 계열이 표에 없었다 */
    'afro':[2, 'coily', 10, '', 'none', '둥글고 크게 부풀린 아프로.'],
    'afro puffs':[0, 'coily', 4, 'twinbun', 'none', '곱슬머리를 양쪽 위로 동그랗게 묶어 올린 퍼프.'],
    'box braids':[3, 'locs', 3, '', 'none', '가늘게 나눠 땋은 가닥을 여러 줄 늘어뜨린다.'],
    'cornrows':[1, 'braid', 1, '', 'none', '두피에 붙여 줄지어 땋아 뒤로 넘긴다.'],
    'fishtail braid':[4, 'braid', 2, 'sidetail', 'side', '한쪽 어깨로 넘겨 잘게 엮은 피시테일 땋기.'],
    'beach waves':[3, 'wavy', 5, '', 'side', '햇볕과 바닷바람에 말린 듯 느슨하게 흐트러진 웨이브.'],
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
      'swept back':'male','mullet':'male'}   /* 섀기는 여성 머리로도 쓴다(2026-10-27) */
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
  /* 일상컷 장면(시대·장소·하는 일·의상)은 여기 없다 — data/casual-tree.json(트리 표)·lib/casual-tree.js 가 쥔다(2026-10-29, game-atelier 에서 옮김, B안).
     예전 갈래·예시 표(CATS·EXAMPLE_MAP·EXAMPLE_DETAIL·EX_NOTE·CAT_KO·RANDOM_POOL·TRAD_EX)는 트리의 추천 조합·옷·예전 기록 변환표(legacy)로 옮기고 지웠다.
     장부(tools/casual-ledger.py)의 옛 칸(갈래/예시)도 그 변환표로 읽는다 */
  const ACTION_STYLE_CORES = {
    cinematic_semi_real: "Cinematic semi-real illustration with believable anatomy, painterly skin and hair, solid mechanical volume and controlled film lighting. Keep the face clearly illustrated, the materials distinct and the action readable.",
    game_keyart: "Polished 2.5D game key art with clean linework, controlled anime facial design, layered cel-to-soft shading and crisp mechanical detail. Use a vivid, readable silhouette and campaign-quality lighting.",
    glossy_kr_game: "Glossy Korean mobile-game character art with an elegant anime face, smooth dimensional shading, luminous color accents and refined hard-surface armor. Keep highlights selective and the figure sharply readable.",
    glossy_promo: "Premium glossy anime-mecha promotional key art with clean linework, vivid controlled color, dimensional 2.5D shading and dense but organized hard-surface detail. Match the face and armor at the same polished rendering intensity.",
    mecha_cinematic_keyart: "Illustration-first mecha cinematic key art with a clear anime face, saturated campaign color, convincing hard-surface volume, strong rim and key light and a crisp readable environment. It reads as authored premium illustration rather than literal CGI.",
    game_cgi: "High-end stylized game CGI with coherent three-dimensional anatomy, physically convincing armor construction, clean materials and dramatic production lighting. Preserve a designed character-art finish rather than live-action texture.",
    semi_real_paint: "Sophisticated semi-real digital painting with natural anatomy, restrained facial stylization, broad painterly planes and tactile mechanical surfaces. Use composed light and visible brush character without losing structural clarity.",
    photoreal: "Photoreal cinematic character photography with plausible anatomy, lens behavior, lighting and material response. The mechanical equipment reads as a physically built costume or machine integrated into the photographed scene.",
    anime_illust: "Detailed modern anime illustration with expressive linework, clear facial features, controlled cel shading and crisp mechanical construction. Use dimensional color and lighting while preserving an unmistakably drawn finish.",
    cel_anime: "Clean cel-anime art with decisive outlines, limited stepped shadows, flat controlled color and readable graphic shapes. Mechanical parts stay structurally clear through line and silhouette rather than surface noise.",
    painterly: "Painterly fantasy character art with expressive brushwork, shaped color masses, atmospheric depth and solid mechanical forms. Preserve readable edges at the face, hands and equipment anchors.",
    retro_anime: "Retro hand-painted anime key art with confident ink lines, simplified mechanical shapes, warm cel colors and period-style painted lighting. Keep the composition bold and graphic.",
    ink_wash: "Ink-and-wash character illustration with expressive brush outlines, diluted ink values, restrained translucent color and open paper-like atmosphere. Use selective dark accents to keep the mechanical silhouette readable.",
    bright_catalog: "Bright polished catalog illustration with clean neutral lighting, crisp color separation, controlled reflections and highly readable armor construction. Keep the character vivid against a simple spatial environment."
  };
  /* 일상컷 화풍 — 위의 갑주용 한 줄에서 기계·장갑 말을 뺀 것. 일상 프롬프트에 "장갑과 같은 강도" 가 들어가면 평상복이 갑옷이 된다 */
  const CASUAL_STYLE_CORES = {
    cinematic_semi_real: "Cinematic semi-real illustration with believable anatomy, painterly skin and hair, solid fabric volume and controlled film lighting. Keep the face clearly illustrated and the materials distinct.",
    game_keyart: "Polished 2.5D game key art with clean linework, controlled anime facial design, layered cel-to-soft shading and crisp clothing detail. Use a vivid, readable silhouette and campaign-quality lighting.",
    glossy_kr_game: "Glossy Korean mobile-game character art with an elegant anime face, smooth dimensional shading, luminous color accents and refined fabric and accessory rendering. Keep highlights selective and the figure sharply readable.",
    glossy_promo: "Premium glossy anime promotional key art with clean linework, vivid controlled color, dimensional 2.5D shading and dense but organized clothing and accessory detail. Render the face and outfit at the same polished intensity.",
    mecha_cinematic_keyart: "Illustration-first cinematic key art with a clear anime face, saturated campaign color, convincing fabric volume, strong rim and key light and a crisp readable environment. It reads as authored premium illustration rather than literal CGI.",
    game_cgi: "High-end stylized game CGI with coherent three-dimensional anatomy, physically convincing clothing, clean materials and dramatic production lighting. Preserve a designed character-art finish rather than live-action texture.",
    semi_real_paint: "Sophisticated semi-real digital painting with natural anatomy, restrained facial stylization, broad painterly planes and tactile cloth surfaces. Use composed light and visible brush character without losing structural clarity.",
    photoreal: "Photoreal cinematic character photography with plausible anatomy, lens behavior, lighting and material response; the clothing reads as real garments in the photographed scene.",
    anime_illust: "Detailed modern anime illustration with expressive linework, clear facial features, controlled cel shading and crisp clothing folds. Use dimensional color and lighting while preserving an unmistakably drawn finish.",
    cel_anime: "Clean cel-anime art with decisive outlines, limited stepped shadows, flat controlled color and readable graphic shapes. Clothing stays clear through line and silhouette rather than surface noise.",
    painterly: "Painterly character art with expressive brushwork, shaped color masses, atmospheric depth and solid forms. Preserve readable edges at the face and hands.",
    retro_anime: "Retro hand-painted anime key art with confident ink lines, simplified shapes, warm cel colors and period-style painted lighting. Keep the composition bold and graphic.",
    ink_wash: "Ink-and-wash character illustration with expressive brush outlines, diluted ink values, restrained translucent color and open paper-like atmosphere. Use selective dark accents to keep the figure readable.",
    bright_catalog: "Bright polished catalog illustration with clean neutral lighting, crisp color separation, controlled reflections and highly readable clothing. Keep the character vivid against a simple spatial environment."
  };

  /* ══ 프롬프트 문장 (2026-10-02 간결화) ══
     myth-atelier 꼴: "무엇"만 주고 "어떻게"는 모델에게 맡긴다. 기준 시트·확대컷·장착점·가림·FAIL 문단은 뺐다 —
     등딱지·꼬리를 "몸에 달린 물건"으로 적고 "옮기지 마라"를 쌓을수록 모델은 그 물건을 보여 주려고 옮겼다.
     특징은 어디에 다는지가 아니라 어떻게 입는지(WEAR_PARTS)로 적는다. 첫 그림(경장, 첨부 없음)이 인물 기준이고,
     중장·고기동·일상은 그 그림을 첨부하고, 개방은 그 폼 그림을 첨부해 "같은 그림에서 이것만" 바꾼다. */
  const PROMPT_LINES = {
    createInput: "INPUT: text only — no reference image is needed; do not reuse earlier conversation images. For the image tool, omit referenced_image_paths and num_last_images_to_include.",
    referenceInput: "INPUT: the attached image is the approved character; keep her.",
    overdriveInput: "INPUT: attach this character's {base} card image (the closed state). If a second image fits, add her approved light-form image for the face.",
    subject: "SUBJECT: A female mecha personification character with {name} as her motif — the creature reimagined as an armored adult woman, not a mascot costume or a creature suit: her plates, undersuit, hair and ornaments carry its palette, markings and shapes. She wears its features as costume; nothing is carried, mounted or put on display. Her skin is human skin.",
    card: "Vertical 2:3 frame, full body with head and feet inside the frame and clear margins, no foreground occlusion, face toward the camera (front or three-quarter, never a back view).",
    createOutput: "OUTPUT: one dynamic action image that is also this form's card art. {card} Default stance is a standing, card-ready pose; motion, effects and setting may be dramatic while her design stays readable.",
    referenceOutput: "OUTPUT: the {FORM} form of the woman in the attached image, as a new card image. Keep her face, eye and hair colors, haircut, skin tone, body proportions, palette and the species features she wears as costume; change only her armor, as FORM says. {card} A new card-ready pose is fine; motion, effects and setting may be dramatic while her design stays readable.",
    overdriveOutput: "OUTPUT: the OPENED (overdrive) state of the attached image. Keep its camera, pose, framing, subject scale, face, hair, body and every armor piece exactly. Change only this: {open}, revealing the inner frame, and {energy} shows through the gaps, lighting the undersides of the opened plates; her eyes keep their color with only a glint of that light, and her expression tightens with the strain. No new armor, no new helmet, no weapon. The pair must read as the same picture before and after she opens up.",
    sceneRule: "Chosen settings below override the default stance and camera; her identity and form stay fixed.",
    casualCharacter: "CHARACTER: the same woman as the attached image — {name} personified, {type} type. Keep her face, eye and hair colors, haircut, skin tone and body proportions; expression and hair motion may change.",
    casualOutput: "OUTPUT: one standalone off-duty scene of her in the outfit chosen in SCENE; her species shows only through accessories and objects around her — never in the outfit's colours, patterns or cut, never armor, never a creature costume. Era, place, activity, outfit, pose and camera follow SCENE (chosen).",
    /* 일상컷 옷 — "평상복은 장면이 정한다" 만으로는 첨부한 폼 의상이 따라왔다(book-atelier 춘향전: 간호사 코스튬에 한복).
       첨부 그림에서는 얼굴·머리·몸만 가져온다 */
    casualWardrobe: "WARDROBE: change her clothes completely. From the attached image take only her face, hair and body — not its armor, garment, layers, sash, tassels, jewelry, hair ornaments or background. Dress her exactly as SCENE describes; that outfit must read at first glance, keeping its own recognisable colours and parts. Do not carry the attached image's palette, patterns or trim into the outfit; her source belongs in accessories and props, never in the clothes — never restyle the chosen outfit into her own costume, genre or palette.",
    /* 가까운 컷의 옷 줄 — 「옷이 한눈에, 알아볼 부분이 다」 가 크롭 밖 치마·드레스 자락까지 부른다(game 조조전 일상 1·2, 2026-10-29) */
    casualWardrobeClose: "WARDROBE: change her clothes completely. From the attached image take only her face, hair and body — not its armor, garment, layers, sash, tassels, jewelry, hair ornaments or background. Dress her exactly as SCENE describes; the part of that outfit inside the crop must read at first glance in its own colours. Do not carry the attached image's palette, patterns or trim into the outfit; her source belongs in accessories and props, never in the clothes — never restyle the chosen outfit into her own costume, genre or palette.",
    /* 일상컷 얼굴 각도 — 첨부한 경장 그림의 고개 각도·시선·얼굴 크기까지 따라와 일상컷 얼굴 구도가 되풀이됐다(book-atelier 2026-10-24 같은 문제).
       첨부 그림은 "누구인가" 만 정하고, 고개·시선·카메라는 장면 설정이 정한다. 줄 이름에 "CAMERA:" 를 쓰지 않는다 */
    casualPose: "ANGLE: the attached image fixes who she is, not how she is posed or shot. Do not copy its head angle, head tilt, gaze direction, face size in frame, camera height or crop — turn her head, set her gaze and place the camera as SCENE describes, and let her face read naturally from that new angle (profile, three-quarter, looking down or away), with her features staying the same.",
    /* 뒤돌아보기 — 등이 카메라를 보는 각도(뒤 3/4·뒤 강조·어깨 너머)나 돌아보는 자세에서, 첨부 그림의 정면 얼굴과 카메라를 보는 표정이
       등 위에 정면 얼굴을 붙였다(2026-10-25 도치보구 3·푸호꼬 1·3). 이 각도·자세를 골랐을 때만 싣는다(LOOK_BACK) */
    casualLookBack: "LOOK-BACK: her back is toward the camera, so her head turns at most a quarter turn over one shoulder — the face shows in profile or three-quarter view, never full-front on a back-facing torso. Her chin sits just above the near shoulder, the far eye and cheek may be partly hidden, the side of the neck shows the turn and the shoulder line continues behind the head; her eyes, not her whole face, swing toward the camera.",
    identity: "IDENTITY (chosen details override the automatic look)",
    measurement: "B/W/H are approximate bust/waist/hip circumferences in cm — proportion guidance within the chosen build, not armor sizes.",
    figure: "ONE FIGURE ONLY. No second character, no creature beside her, no text, no lettering, no logo, no watermark, no speech bubble, no frame border.",
    /* 파트너 돌봄 갈래만 — 갈래 문구가 "포켓몬 동료를 돌보는 장면" 이라 위 줄의 "곁에 생물 없음" 과 부딪쳤다(2026-10-15).
       사람은 그녀 하나, 동료는 장면이 정한 한 마리만. 몸에 붙거나 그녀 옷을 따라 입지 않게 따로 선다 */
    figureCompanion: "ONE WOMAN ONLY, with exactly one Pokémon companion as the scene describes — a separate creature at its own natural scale, its body never merged with hers, not a second human and not dressed like her. No other person or creature, no text, no lettering, no logo, no watermark, no speech bubble, no frame border.",
    /* 종별 얼굴 설계(data/face-design.json) — 새 인물에만. 같은 화풍에서 얼굴이 닮아 가지 않게 골격·이목구비 비율을 종마다 고정한다.
       직접 고른 얼굴 값이 있으면 그 항목은 빠진다(IDENTITY 가 쥔다) */
    face: "FACE (her own structure, not the style's default face): {items}.",
    /* 같은 설계표의 머리(헤어스타일·길이·앞머리) — 생성기가 머리를 스스로 고르면 보브·웨이브 몇 가지로 몰렸다(2026-10-20).
       FACE 와 같이 새 인물에만, 직접 고른 머리 항목이 있으면 그 몫이 빠진다 */
    hair: "HAIR: {items}.",
    anatomy: "ANATOMY: natural adult proportions. No body-part enlargement, no extra limbs; her worn features are costume, never extra limbs.",
    /* 손 — "손을 손답게" 한 줄로는 손가락이 늘거나 뭉쳤다(2026-10-06 꼬부기·어니부기). 개수·모양·자세·장갑·효과를 따로 적는다.
       카메라로 내민 손·벌린 손가락·손가락 없는 장갑·손에 감기는 물줄기가 망가진 그림에 다 있었다 */
    /* HANDS 는 해부만 — 고른 자세·장면(컵 들기·사진 찍기·손 흔들기…)의 손 동작을 덮어쓰지 않는다.
       손 자세 기본값은 고른 장면이 없을 때만, 장갑 규칙은 새 인물에만, 이어가기는 첨부 그림의 손복장을 그대로 */
    /* 몸 개수 — "no extra limbs" 만으로는 팔이 셋·다리가 하나 더 나왔다(2026-10-20~27 고친 컷). 개수는 팔·다리만 긍정형으로 적는다.
       손가락·손·발 개수를 박으면 쥐거나 가려져야 할 구도에서도 다 보여 주려 해서, 가려져도 된다고 적는다(2026-10-27). 폼·이어가기·개방·일상컷 모두 */
    body: "BODY: a normal human body — one head, two arms and two legs, each joined at its natural joint; elbows, knees and wrists bend the human way. Hands and feet may be partly hidden by the pose, what she holds or the frame.",
    /* 손 — 10-06·10-18 의 "엄지 하나와 손가락 넷, 엄지는 안쪽, 합쳐지거나 겹치거나 뒤집히거나 더 생기지 않게" 는 금지를 늘어놓아 손에 주의를 끌었다.
       고친 컷이 그 뒤로 늘었다. 짧은 긍정형만 남긴다(2026-10-27) */
    hands: "HANDS: natural human hands.",
    /* 일상컷 손 — 고친 일상컷 대부분이 손에 일을 더 시킨 컷이었다(등 뒤로 뻗은 팔·머리 위로 든 팔·로브 사이로 나온 팔, 2026-10-20~27).
       고른 자세·장면의 손 동작은 그대로 두고, 할 일 없는 손을 보이는 곳에 둔다 */
    handsCasual: "HAND TASK: her hands act naturally for the pose and scene; any idle hand rests in a relaxed, anatomically plausible position. Natural occlusion is allowed; do not force every hand or finger into view.",
    handsDefault: "Keep both hands relaxed — a loose fist, an open palm or resting on something.",
    handsArmor: "Gloves are full-finger and close-fitting; plates, water, sparks and effects stay off the fingers.",
    handsWear: "Her hands keep the same gloves or bare hands as in the attached image; effects stay off the fingers.",
    handsKeep: "HANDS: keep both hands as in the attached image; the glow and spray stay off the fingers.",
    /* 일상컷 화면비 — 늘 싣는다. 2:3 일 때 빠지면 비율 말이 하나도 없었다(사용자 2026-10-28, game 에서 먼저) */
    casualFrame: "FRAME: {frame} image. Compose the image for this frame; the Framing in SCENE sets how much of her shows.",
    /* 가까운 프레이밍 — 잘리는 선을 FRAME 바로 밑에(game 스파2 일상, 2026-10-29). 클로즈업에 「발을 받치고 앉기」·「옷이 한눈에」 가 같이 실려 부딪혔다 */
    casualCrop: "CROP: {edge}. This crop wins over every other line — pose, outfit, props and activity details apply only to the part that shows, and the outfit reads through its visible neckline, straps, fabric and colour. The lens sets perspective only, never how much of her shows. Do not widen the shot to fit them in. An arm or leg that crosses the edge runs naturally on past it — never cut off, shortened or fading out inside the image.",
    /* 일상컷 트리의 시대(2026-10-29) — 첫 등장 무렵: 그 포켓몬이 처음 나온 해 무렵의 현실(사용자 「1세대면 1996년 무렵」), 포켓몬 세계 안: 그 세계에서 사는 장면,
       무대·환상: 해에 매이지 않는 무대. 포켓몬 세계 안이라도 동료 묶음이 아니면 포켓몬은 안 나온다(ONE FIGURE 줄과 같게) */
    casualEra: "ERA: set this scene in the real world around {year}, when her Pokémon first appeared. Clothing, hair, devices and interiors of that time, keeping two or three recognisable parts of the chosen outfit; no smartphones or modern devices that did not exist then. Period everyday fashion only, not her armor.",
    casualWorld: "WORLD: this scene happens inside the Pokémon world, as if she simply lives there — its towns, routes, buildings, props, light and weather show the world. No Pokémon unless SCENE names her companion, no known trainers or characters, no logos, no text.",
    casualFantasy: "SETTING: a stylised stage, editorial or fantasy set, not bound to a real year — still one real adult woman in a believable space, no creatures.",
    casualScreens: "SCREENS: any monitor, cabinet, handheld, box or poster shows only abstract colored light, simple shapes or blank art — no recognisable game, character, logo, title or interface, no readable text."
  };
  /* 일상컷 화면비 → FRAME 줄. 그림 저장소의 크기는 2:3 이 1024×1536 */
  const ASPECT_FRAME = { "2:3": "a vertical 2:3 (1024×1536)", "3:2": "a horizontal 3:2 (1536×1024)", "1:1": "a square 1:1 (1024×1024)",
    "9:16": "a tall vertical 9:16", "16:9": "a wide horizontal 16:9" };
  /* 몸 일부만 담는 프레이밍 — CROP 줄의 아래 가장자리(game 2026-10-29: 「이 크롭이 이긴다」 만으로는 넓게 나왔다). detail 은 pkm 일상컷에 안 쓴다(트리 표 banned) */
  const CROP_EDGE = {
    waist_up: "a waist-up shot — the bottom edge crosses her waist; hips, legs and feet are out of frame",
    chest_up: "a chest-up shot — the bottom edge crosses just below her bust; waist, hips and legs are out of frame",
    face_close: "a close-up — her face and hair fill most of the frame and the bottom edge crosses at her collarbones; nothing below the shoulders shows, and her hands and anything she holds stay below the frame unless raised to her face",
    detail: "a detail shot — only the part of her the scene names fills the frame"
  };
  const CLOSE_FRAMES = Object.keys(CROP_EDGE);
  /* 가까운 컷의 노출 풀이 — 「배·다리 노출」 이 크롭 밖을 부른다(game 조조전 일상 1·3). pkm 일상컷은 피부 노출이 늘 bold */
  const CLOSE_AXIS_GUIDES = { skin_exposure: {
    moderate: "some exposed shoulders or arms inside the crop, with the chest covered",
    bold: "more shoulder, neckline and upper-back exposure inside the crop; cover the chest" } };
  /* 폼 한 줄씩 — 겹 하나 / 판 위에 판 / 갈라져 펼침. 썸네일에서 갈리는 것은 이 낱말들이다(GAME_CONCEPT "폼") */
  const FORM_LINES = {
    light: "FORM — LIGHT: one close-fitting armor layer: slim plates at the shoulders, forearms, hips and shins over a fitted undersuit, joints free, a slim readable outline. No helmet; at most a slim headband or temple sensor.",
    heavy: "FORM — HEAVY: plates over plates: a second, thicker layer of broad plates with thick rims over the chest, abdomen, pelvis, shoulders, forearms, thighs and shins, so the outline is visibly larger. An open-face helmet may cover the crown and temples; eyes, bangs and jaw stay clear. Her body inside keeps its size; no weapon, no cannon.",
    mobility: "FORM — MOBILITY: the thin plates split and fan outward and back from the shoulders, hips and calves into a swept, open silhouette with air between the panels and compact thrusters; joints stay free. Slim sensor fins sweep back from the temples; no helmet, no giant wings."
  };
  /* 개방 — 첨부한 그 폼 그림의 판이 어떻게 열리나 */
  const OPEN_LINES = {
    light: "the slim plates lift away from their seams on small hinges",
    heavy: "the stacked outer plates swing away from the inner layer on their hinges, leaving wide air gaps",
    mobility: "the fanned panels spread further and their thruster covers open",
    reference: "the plates she already wears open along their existing seams"
  };
  const TYPE_ENERGY = {
    normal: "a warm white-gold light", fire: "an orange-red fire glow with embers and heat haze",
    water: "a cyan-blue water glow with spray and sheen", grass: "a green glow with drifting leaves and pollen sparks",
    electric: "yellow-white electric arcs and crackling sparks", ice: "a pale blue glow with frost and floating ice crystals",
    fighting: "a hot orange aura of raw force", poison: "a violet glow with toxic vapor", ground: "an amber glow with rising dust and pebbles",
    flying: "a pale sky-blue glow with swirling air currents", psychic: "a magenta glow with floating rings of light",
    bug: "a lime-green glow with shimmering wing-like light", rock: "a sandy-gold glow with orbiting rock fragments",
    ghost: "a ghostly violet glow with wisps of shadow", dragon: "an indigo-violet draconic glow with sweeping energy",
    dark: "a deep violet-black glow with dark embers", steel: "a cold silver-white glow with metallic sparks",
    fairy: "a soft pink glow with sparkles"
  };
  /* 원작 부위 → 입는 법. 자료(source-appearance)의 part 이름으로만 고른다. 표에 없는 부위(눈·코·입·다리·몸통·털…)는
     문장에 안 쓰고 색만 PALETTE 로 간다 — "코가 의상의 무늬가 된다" 같은 소음을 만들지 않는다.
     [묶음, part 들, 입는 법, 머리 묶음이면 'head'] — 같은 묶음은 한 번, 한 종에 넷까지 */
  const WEAR_PARTS = [
    ['shell', ['shell', 'carapace', 'turtle'], 'a dome-backed mantle over her shoulders and upper back, its rim framing both shoulders'],
    ['plastron', ['plastron'], 'her breastplate'],
    ['bud', ['bulb', 'bud', 'seed', 'calyx'], 'a rounded bud-shaped mantle over her shoulders and upper back'],
    ['flower', ['flower', 'petal', 'bloom', 'blossom', 'sepal'], 'a large flower ornament at her shoulder or in her hair'],
    ['wing', ['wing'], 'a split cape falling from her shoulders, cut in the same shape and colors'],
    ['tail', ['tail'], 'a long sash hanging from the back of her belt, in the same shape and colors'],
    ['ear', ['ear'], 'a headpiece or hair ornament of the same shape', 'head'],
    ['horn', ['horn', 'antler'], 'a horned circlet or hair ornament', 'head'],
    ['antenna', ['antenna', 'antennae', 'feeler'], 'slim antenna-like hair ornaments', 'head'],
    ['crest', ['crest', 'plume', 'comb', 'crown', 'headpiece', 'headband', 'hood'], 'a crest-shaped headpiece', 'head'],
    ['pouch', ['pouch'], 'two small round ornaments on her headpiece', 'head'],
    ['mask', ['mask'], 'a face-framing headpiece that never covers her eyes', 'head'],
    ['whisker', ['whisker', 'mustache', 'beard', 'barbel'], 'fine whisker-like lines on her headpiece', 'head'],
    ['cap', ['cap', 'mushroom'], 'a cap-shaped hat', 'head'],
    ['fin', ['fin', 'flipper', 'gill'], 'fin-shaped edges on her plates'],
    ['spike', ['spike', 'spine', 'thorn', 'quill', 'needle', 'protrusion', 'ridge', 'stinger', 'blade', 'sword', 'lance', 'tusk'], 'pointed edges on her plates'],
    ['claw', ['claw', 'talon', 'pincer'], 'claw-shaped guards on her gauntlets, her hands still human hands'],
    ['leaf', ['leaf', 'frond', 'plant', 'vine', 'stem', 'stalk', 'moss', 'root'], 'leaf-shaped plates and trim'],
    ['ribbon', ['tentacle', 'tendril', 'ribbon', 'bow', 'thread', 'silk'], 'trailing ribbons from her sleeves or belt'],
    ['feather', ['feather', 'plumage', 'ruff', 'frill', 'mane', 'collar', 'tuft', 'fluff', 'wool', 'fleece', 'cotton', 'cloud'], 'a feathered or ruffled collar and trim'],
    ['gem', ['gem', 'jewel', 'orb', 'crystal', 'pearl', 'sphere', 'core', 'stone', 'coin'], 'a gem set in her chest plate or circlet'],
    ['flame', ['flame', 'fire', 'ember', 'smoke', 'aura'], 'flame-shaped trim and glow lines'],
    ['plate', ['plate', 'armor', 'armour', 'scute', 'rock', 'bark', 'tree', 'trunk', 'branch'], 'her armor plates'],
    ['cloth', ['cape', 'cloak', 'robe', 'dress', 'outfit', 'cloth', 'pelt'], 'part of her outfit over the armor'],
    ['machine', ['magnet', 'screw', 'gear', 'wheel', 'bolt', 'key', 'bell', 'chain'], 'a small mechanical ornament on her costume']
  ];
  /* 무늬 — 한 구절로 묶는다(둘까지) */
  const MARKING_PARTS = ['marking', 'stripe', 'spot', 'pattern', 'patch', 'line', 'ring', 'band', 'dot', 'mark', 'scale', 'streak', 'zigzag',
    'swirl', 'star', 'heart', 'diamond', 'crescent', 'hexagon', 'rhombi'];
  /* 원작 특징 글에서 색만 뽑는다 — "light-blue skin" 을 명사째 싣지 않는다(피부색으로 그린다) */
  const COLOR_WORDS = ['red', 'crimson', 'scarlet', 'maroon', 'pink', 'magenta', 'rose', 'orange', 'amber', 'yellow', 'gold', 'golden', 'cream',
    'beige', 'tan', 'brown', 'bronze', 'copper', 'green', 'lime', 'olive', 'teal', 'turquoise', 'cyan', 'aqua', 'blue', 'navy', 'indigo',
    'violet', 'purple', 'lavender', 'lilac', 'white', 'ivory', 'silver', 'gray', 'grey', 'black'];
  const COLOR_TONES = ['light', 'pale', 'dark', 'deep', 'bright'];
  /* 포켓몬 머리 특징을 머리에 어떻게 입히나(새 인물만). 고르면 자동 머리 옷차림(WEAR 의 귀·뿔·볏…)을 대신한다.
     헬멧은 여기 없다 — 폼이 정한다. [열쇠, 화면 이름, 프롬프트 문장] */
  const HEAD_FEATURE_OPTIONS = [
    ["", "자동 — 원본 머리 특징에 맞춰", ""],
    ["none", "없음 — 머리는 비우고 특징은 다른 부위에", "her species head features are left off her head; carry them elsewhere in the costume"],
    ["mechanical", "기계 부품 — 센서 귀·장갑 뿔처럼", "her species head features become small mechanical parts of her headset, such as sensor ears or armored horns"],
    ["ornament", "헤어 장식 — 머리핀·리본·머리띠로 형태와 색만", "her species head features are echoed by a hair ornament (hairpin, ribbon, headband) carrying their shape and colors"],
    ["accessory", "악세사리 — 귀걸이·이어커프·초커 같은 장신구", "her species head features are echoed by small jewelry such as earrings, ear cuffs or a choker"],
    ["sensor", "센서 핀 — 관자놀이에서 뒤로 뻗는 얇은 핀", "her species head features become slim sensor fins sweeping back from her temples"],
    ["__custom__", "직접 입력…", ""]
  ];
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
    "eye spacing": {
      "close-set eyes": ["두 눈 사이를 눈 하나 너비보다 좁게 둬요.", "inner eye corners closer than one eye width apart"],
      "average eye spacing": ["두 눈 사이를 눈 하나 너비 안팎으로 둬요.", "about one eye width between the inner corners"],
      "wide-set eyes": ["두 눈 사이를 눈 하나 너비보다 넓게 둬요.", "more than one eye width between the inner corners"]
    },
    "eyebrows": {
      "fine soft arches": ["가늘고 완만한 곡선, 눈과의 거리는 넉넉해요.", "fine softly curved brows set high above the eyes"],
      "long arched brows": ["눈보다 길게 뻗고 바깥쪽 아치가 또렷해요.", "long brows with a clear outer arch"],
      "straight medium brows": ["중간 두께의 곧은 눈썹, 눈과의 거리는 보통이에요.", "medium straight brows at a moderate height"],
      "thin straight brows": ["가늘고 곧은 눈썹이에요.", "thin straight brows"],
      "thick low brows": ["굵고 눈 가까이 낮게 놓여요.", "thick brows set low and close to the eyes"],
      "angled brows": ["바깥쪽에서 꺾여 내려가는 사선 눈썹이에요.", "brows rising to a defined angle and dropping at the tail"],
      "short rounded brows": ["짧고 둥근 눈썹이에요.", "short softly rounded brows"],
      "feathered full brows": ["숱이 많고 결이 보이는 눈썹이에요.", "full brows with visible feathered hair strokes"]
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
      "mullet": ["앞·옆은 짧고 목덜미 쪽이 길어요.", "short front and sides with a longer nape"],
      "afro": ["촘촘한 곱슬을 둥글고 크게 부풀린 모양이에요. 피부·민족과 별개예요.", "a full rounded afro of dense coils; independent of ethnicity and skin tone"],
      "afro puffs": ["곱슬머리를 양쪽 위로 모아 동그란 퍼프 두 개로 묶어요.", "two rounded coily puffs gathered high on each side"],
      "box braids": ["두피를 네모 칸으로 나눠 가늘게 땋은 가닥이 여러 줄 늘어져요.", "many slim box braids hanging loose from neat square parts"],
      "cornrows": ["두피에 바짝 붙여 앞에서 뒤로 줄지어 땋아요.", "neat cornrows braided flat along the scalp from front to back"],
      "fishtail braid": ["두 갈래를 잘게 엇갈려 엮은 땋기를 한쪽 어깨로 넘겨요.", "a finely woven fishtail braid swept over one shoulder"],
      "beach waves": ["바닷바람에 말린 듯 느슨하고 자연스럽게 흐트러진 웨이브예요.", "loose, tousled beach waves with an undone, sun-dried texture"]
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
      "포켓몬의 특징을 작은 장신구 하나로만 보여줘요. 옷은 장면의 옷 그대로예요.",
      "her species shows only as one small accessory; the outfit keeps its own colours and patterns"
    ],
    "balanced": [
      "장신구 하나와 주변 사물 하나로 포켓몬의 특징을 보여줘요. 옷에는 넣지 않아요.",
      "her species shows as one accessory and one object in the scene; the outfit keeps its own colours and patterns"
    ],
    "strong": [
      "장신구와 주변 사물 몇 가지로 포켓몬을 분명히 알아보게 해요. 옷의 색·무늬는 여전히 장면의 옷 그대로예요. 장갑이나 종족 신체는 더하지 않아요.",
      "her species is clearly recognizable through a few accessories and props in the scene, never through the outfit's colours, patterns or cut; no new armor or creature anatomy"
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
  /* 등이 카메라를 보는 각도·돌아보는 자세 — 일상컷에 LOOK-BACK 줄을 싣는다(lib/prompt-anthro.js) */
  const LOOK_BACK = { orient: ['rear_3q', 'three_quarter_back', 'over_shoulder', 'back'], pose: ['turning_back'] };
  /* 일상컷에서 갑옷용 말을 빼고 쓰는 방향 문장 — turning_midmotion 의 "장비가 부착 부위를 따른다" 가 일상 의상에 그대로 실렸다(2026-10-26) */
  const CASUAL_ORIENT_GUIDES = { turning_midmotion: 'mid-turn body motion, with her clothing and hair following the turn' };
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
    "등과 한쪽 옆면이 함께 보이도록 몸통·골반을 돌려요. 고개는 어깨 너머로 4분의 1까지만 — 얼굴은 옆얼굴이나 3/4.",
    "rear three-quarter view showing back and one flank; the head turns no more than a quarter turn, face in profile or three-quarter"
  ],
  "back": [
    "등 중앙이 카메라를 향해요. 얼굴이 보이면 어깨 너머로 4분의 1까지만 — 옆얼굴.",
    "back centered toward camera; if the face shows, the head turns no more than a quarter turn over one shoulder, face in profile"
  ],
  "over_shoulder": [
    "몸은 뒤쪽을 향하고 얼굴만 어깨 너머로 4분의 1까지 돌려요 — 턱은 그 어깨 위, 얼굴은 3/4이나 옆얼굴.",
    "body turned away, head looking back over one shoulder — a quarter turn at most, face in three-quarter or profile with the chin above that shoulder"
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
    "후면과 옆면을 함께 보여 장비의 깊이를 읽기 쉽게 해요. 고개는 4분의 1까지만 — 얼굴은 옆얼굴이나 3/4.",
    "rear three-quarter view with natural equipment depth and occlusion; the head turns no more than a quarter turn, face in profile or three-quarter"
  ]
};
  const IDENTITY_GROUPS = ['base', 'build', 'face', 'hair'];
  const IDENTITY_EXCLUDED = ['human-mechanical balance', 'facial hair', 'expression'];
  /* 종별 얼굴 설계가 채우는 얼굴 항목 — 이 차례로 FACE 줄에 실린다 */
  const FACE_KEYS = ['face shape', 'face length', 'face width', 'jaw & chin', 'eye shape', 'eye size', 'eye tilt', 'eye spacing', 'eyebrows', 'nose character', 'lips'];
  /* 종별 설계가 채우는 머리 항목 — 이 차례로 HAIR 줄에 실린다(tools/face-design.py 의 HAIR_KEYS 와 같다) */
  const HAIR_KEYS = ['hairstyle', 'hair length', 'bangs'];

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
    "바닥이나 매트에 앉아 두 다리를 앞으로 뻗거나 무릎을 세워 두 발이 다 보이게 놓아요.",
    "Sit on the floor or a mat with both legs in front of the hips — stretched out or knees loosely raised — two separate legs and both feet in view, heels resting on the floor."
  ],
  "kneeling": [
    "낮은 작업에 맞게 무릎을 대고, 정강이는 바닥에 나란히, 두 발은 엉덩이 뒤로 발등이 바닥에 닿게 놓아요.",
    "Kneel for a low task: both knees on the floor, shins lying flat and parallel behind them, both feet behind the hips with the tops of the feet on the floor and the soles facing up."
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
  "finger_to_lips": [
    "검지 하나를 입술에 세워 장난스럽게 쉿 해요. 나머지 손가락은 부드럽게 말고, 손은 얼굴 가까이 두되 얼굴을 가리지 않아요.",
    "Raise one index finger upright against her lips in a playful 'shh' gesture, the other fingers softly curled; the hand stays close to her face without hiding it."
  ],
  "thumbs_up": [
    "한 손을 어깨 옆으로 올려 엄지를 곧게 세워요. 나머지 손가락은 손바닥에 말아 쥐고, 손은 얼굴을 가리지 않아요.",
    "Give a confident thumbs-up with one hand raised beside her shoulder, the thumb pointing straight up and the other fingers curled into the palm; the hand stays inside the frame and never hides her face."
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
    "바닥에 앉아 한쪽 무릎을 세워 그 발바닥을 바닥에 대고, 다른 다리는 앞으로 눕혀 접고, 팔을 세운 무릎에 올려요.",
    "Sit on a mat with one knee raised and that foot flat on the floor, the other leg folded flat in front, and an arm resting on the raised knee; both feet in view."
  ],
  "side_sitting": [
    "엉덩이를 매트에 대고 두 무릎을 같은 쪽으로 모아 접어, 두 발을 반대쪽 엉덩이 옆에 나란히 놓아요.",
    "Side-sit on a mat: hips on the mat, both knees bent and pointing to the same side, both lower legs folded back so the two feet lie side by side next to the opposite hip; torso upright."
  ],
  "cross_legged": [
    "방석에 앉아 두 무릎을 양옆으로 벌리고 정강이를 앞에서 교차해, 두 발을 반대쪽 무릎 아래에 놓아요.",
    "Sit cross-legged on a floor cushion: knees open to either side, shins crossed in front of the hips, each foot tucked under the opposite knee with its outer edge on the cushion; relaxed shoulders and readable hands."
  ],
  "perched_seat": [
    "벤치나 낮은 턱에 가볍게 걸터앉아 발을 내려요.",
    "Perch on a low ledge or bench with the feet resting naturally below."
  ],
  "turning_back": [
    "몸의 진행 방향을 유지하며 고개와 어깨만 어깨 너머로 4분의 1까지 살짝 돌려요 — 얼굴은 3/4이나 옆얼굴.",
    "Pause mid-step and turn the head and shoulders gently back over one shoulder — a quarter turn at most, face in three-quarter or profile — without twisting the torso unnaturally."
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
  "dance_step": [
    "한 발을 옮기며 손과 어깨로 리듬을 표현해요.",
    "Take a small rhythmic dance step with coordinated arms and balanced feet."
  ],
  "clapping": [
    "손뼉을 가슴 높이에서 맞대며 박수를 쳐요.",
    "Clap the hands together at chest height in natural applause, both palms meeting with the fingers lined up."
  ],
  "looking_through": [
    "두 손으로 쌍안경이나 망원경을 눈에 대고 먼 곳을 봐요.",
    "Raise binoculars, a spyglass or a telescope eyepiece to the eyes with both hands, elbows relaxed, looking through it toward the distance."
  ],
  "pouring_drink": [
    "한 손으로 주전자·병을 기울여 다른 손의 컵에 따라요.",
    "Pour from a teapot, pitcher or bottle into a cup or glass held steady in the other hand, the stream clearly between them."
  ],
  "sketching": [
    "수첩이나 스케치북을 받치고 연필로 그리거나 적어요.",
    "Hold a notebook or sketchbook on the forearm or lap and draw in it with a pencil in the other hand, eyes on the page."
  ],
  "folding_cloth": [
    "담요·수건·옷을 두 손으로 모서리를 맞춰 개요.",
    "Fold a blanket, towel or garment with both hands, its edges lined up between them."
  ],
  "playing_instrument": [
    "장면의 악기를 자연스럽게 잡고 연주해요.",
    "Play the scene's instrument with a natural grip, fingers placed on the strings or keys and the instrument securely supported."
  ],
  "eating": [
    "숟가락·젓가락이나 손에 든 음식을 입 가까이에서 맛봐요.",
    "Take a small bite or taste from chopsticks, a spoon or the food in hand, held just below the mouth."
  ],
  "holding_umbrella": [
    "펼친 우산 손잡이를 어깨 위로 들고, 다른 팔은 편하게 둬요.",
    "Hold an open umbrella by its handle over one shoulder, the canopy above her head and the free arm relaxed."
  ],
  "dressing_up": [
    "귀걸이·신발 끈·소맷부리를 조심스럽게 매만져요.",
    "Put on or adjust an earring, a shoe strap or a cuff with careful fingers, the head tilted slightly toward the task."
  ],
  "lying_prone": [
    "침대·소파·담요 위에 엎드려 두 팔꿈치로 상체를 받쳐요.",
    "Lie on the stomach on a bed, sofa, blanket or deck, propped up on both forearms, legs relaxed behind with one knee bent and that foot raised; both feet in view."
  ],
  "lying_side": [
    "옆으로 누워 한 손으로 머리를 받치고 윗다리를 앞으로 굽혀요.",
    "Lie on one side on a bed, sofa, blanket or deck, the head propped on one hand with that elbow on the surface, the top leg bent forward over the straight lower leg; both feet in view."
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


  root.AtelierSpec = {
    ASPECT_FRAME,
    ACTION_CATEGORIES, ACTION_POSES, ACTION_CONTROLS,
    ACTION_STYLE_CORES, CASUAL_STYLE_CORES, PROMPT_LINES, FORM_LINES, OPEN_LINES, TYPE_ENERGY, WEAR_PARTS, MARKING_PARTS, COLOR_WORDS, COLOR_TONES,
    HEAD_FEATURE_OPTIONS, IDENTITY_GROUPS, IDENTITY_EXCLUDED, FACE_KEYS, HAIR_KEYS,
    SOURCE_WORD: SOURCE_WORD, SOURCE_INPUT: SOURCE_INPUT,
    CAT_SHORT: CAT_SHORT, PARAM_SHORT: PARAM_SHORT, SUMMARY_WORDS: SUMMARY_WORDS,
    PARAM_DEFS: PARAM_DEFS,
    SCENE_AXIS_GUIDES, ORIENTATION_GUIDES, LOOK_BACK, CASUAL_ORIENT_GUIDES, CROP_EDGE, CLOSE_FRAMES, CLOSE_AXIS_GUIDES,
    PARAM_GUIDES, PARAM_GROUP_HELP, PARAM_HELP, HAIR_LENGTH_LIMITS, EYE_CONTOURS,
    PRESETS: PRESETS,
    ADVANCED_OPTIONS: ADVANCED_OPTIONS,
    ADVANCED_LABELS: ADVANCED_LABELS,
    STYLE_SAMPLE: STYLE_SAMPLE,
    GROUP_LABELS: GROUP_LABELS,
    EXPRESSION_DETAIL: EXPRESSION_DETAIL,
    EXPRESSION_OPTIONS: EXPRESSION_OPTIONS,
    ORIENTATION_OPTIONS: ORIENTATION_OPTIONS,
    POSE_OPTIONS: POSE_OPTIONS,
    POSE_GUIDES, FRAME_OPTIONS, FRAME_GUIDES, LENS_OPTIONS, LENS_GUIDES,
    ADV_AXIS: ADV_AXIS,
    ADV_VAL: ADV_VAL,
    RANDOM_MODES: RANDOM_MODES,
    ART_STYLES: ART_STYLES,
    ETHNIC_PART: ETHNIC_PART,
    DEFAULT_STYLE: DEFAULT_STYLE,
    MODE: MODE,
    CUTE_SET: CUTE_SET,
    CUTE_LOCK: CUTE_LOCK,
    YOUTHFUL_LOCK: YOUTHFUL_LOCK,
    BODY_FIG: BODY_FIG,
    HAIR_FIG: HAIR_FIG,
    GROUP_META: GROUP_META,
    ONLY: ONLY,
    COLOR_HEX: COLOR_HEX,
    COLOR_KEYS: COLOR_KEYS,
    LOCAL_AXES: LOCAL_AXES,
    PAIR_ONLY: PAIR_ONLY,
    ADV_EN: ADV_EN,
  };
})(window);
