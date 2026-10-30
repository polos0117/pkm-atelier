/* Pure prompt assembly — 표(lib/prompt-spec.js)와 원작 외형 자료를 받아 영어 프롬프트 한 덩이를 만든다.
   화면 없이 node 로도 부른다(tests/prompt-engine.cjs).

   2026-10-02 간결화(myth-atelier 꼴). 기준 시트·확대컷·장착점·가림 문단은 없다.
   - 새 인물(create): 첨부 없이 한 장. 원작 특징은 "어떻게 입나"(WEAR) 로만 적는다 — 어디에 다는지는 안 적는다.
   - 이어가기(reference): 확정한 경장 그림을 첨부하고 폼(장갑 겹)만 바꾼 새 카드.
   - 개방(overdrive): 그 폼 그림을 첨부하고 같은 그림에서 판만 연다.
   - 일상(casual): 확정한 그림을 첨부하고 평상복 장면 — 일상컷 트리(lib/casual-tree.js · data/casual-tree.json)의 시대·장소·하는 일·의상·구도.
   기본은 짧다: 입력 → 원작 → 색 → 화풍 → 무엇 → 입는 법 → 폼 → 출력 → 고른 것 → 금지 두 줄. */
(function(root){
  'use strict';
  var S=root.AtelierSpec, T=S.PROMPT_LINES;
  /* Stored option keys stay stable; only generated descriptions are expanded. */
  function paramValues(raw, opt) {
    opt = opt || {};
    var out = raw.map(function(p){return p.slice()});
    var value = function(k){var p=raw.find(function(p){return p[0]===k});return p?p[1]:''};
    var has = function(k){return !!value(k)};
    var faceKeys=S.FACE_KEYS;
    out=out.map(function(p){
      var guide=S.PARAM_GUIDES[p[0]] && S.PARAM_GUIDES[p[0]][p[1]];
      if(p[0]==='hair length' && guide && S.HAIR_LENGTH_LIMITS[value('hairstyle')])
        return [p[0],S.HAIR_LENGTH_LIMITS[value('hairstyle')][1]];
      if(p[0]==='eye shape' && ((p[1]==='large'&&has('eye size')) || (p[1]!=='large'&&has('eye tilt'))) && S.EYE_CONTOURS[p[1]])
        return [p[0],S.EYE_CONTOURS[p[1]]];
      return [p[0],guide?p[1]+' — '+guide[1]:p[1]];
    });
    if(has('body type')) out.push(['body scope',
      'Body type sets the build; body details adjust within it. These describe anatomy beneath armor, not equipment volume.']);
    if(has('hairstyle')) out.push(['hair scope',
      'Keep the cut and its fixed length; other hair settings adjust within it. Hair choices do not set ethnicity.']);
    if(faceKeys.some(has)) out.push(['facial precedence',
      'Explicit facial geometry controls the actual outline, above style, ethnicity or demeanor; shading and expression must not reshape it.']);
    if(has('facial character')) out.push(['demeanor scope',
      'Facial character affects demeanor only; preserve age and geometry. Explicit scene expression takes priority.']);
    if(has('facial ethnicity')) out.push(['ethnicity scope',
      'Broad ancestry cue with individual variation; preserve explicit geometry, skin tone and hair. No stereotyped features.']);
    var right=value('eye color'),left=value('second eye color');
    // No left override means same color in both eyes, as the UI promises.
    out=out.filter(function(p){return p[0]!=='second eye color'});
    if(left&&left!==right) out.push(['heterochromia',
      'Character-relative right eye is '+(right||'one chosen primary color, different from '+left)+
      '; left eye is '+left+'. Keep the sides; do not blend colors.']);
    else if(right) out.push(['eye color consistency','both eyes are '+right]);
    if(opt.special) out.push(['special characteristics',opt.special]);
    return out;
  }

  function styleRow(key) {
    key=key||S.DEFAULT_STYLE;
    var row=S.ART_STYLES.find(function(r){return r[0]===key});
    if(!row) throw new Error('Unknown style: '+key);
    return row;
  }
  function identityParams(raw) {
    return (raw||[]).filter(function(p){
      var d=S.PARAM_DEFS.find(function(d){return d.key===p[0]});
      return d && S.IDENTITY_GROUPS.indexOf(d.group)>=0 &&
        S.IDENTITY_EXCLUDED.indexOf(d.key)<0 && p[1] && p[1]!=='__custom__' && p[1]!=='AUTO';
    });
  }
  function clean(value) { return typeof value==='string'?value.trim():''; }
  function fill(text, vars) { return text.replace(/\{(\w+)\}/g,function(m,k){return vars[k]!==undefined?vars[k]:m}); }
  function features(st) {
    var record=st&&st.sourceAppearance;
    if(!record||!Array.isArray(record.features)) return [];
    return record.features.filter(function(f){return f&&clean(f.detail)});
  }
  function sourceFeatures(st) {
    return features(st).map(function(f){return clean(f.detail)}).slice(0,6);
  }

  /* 색 — 특징 글에서 색 낱말만(눈은 빼고). 둘이 안 되면 도감 색을 보탠다 */
  var colorRe=new RegExp('\\b(?:('+S.COLOR_TONES.join('|')+')[- ])?('+S.COLOR_WORDS.join('|')+')(?:[- ]('+S.COLOR_WORDS.join('|')+'))?\\b','gi');
  function palette(st) {
    var out=[], first=/^(body|fur|skin|coat|hide|feather|plumage|scale|shell|underside|belly)$/i;
    function push(c){ c=c.toLowerCase().replace(/grey/g,'gray').replace(/golden/g,'gold'); if(out.indexOf(c)<0) out.push(c); }
    /* 몸 색(털·피부·몸통)이 먼저 — 그것이 그 종의 주색이다 */
    var list=features(st).filter(function(f){return first.test(String(f.part||''))})
      .concat(features(st).filter(function(f){return !first.test(String(f.part||''))}));
    list.forEach(function(f){
      if(/^(eye|eyes|pupil|iris|sclera)$/i.test(String(f.part||''))) return;
      var m; colorRe.lastIndex=0;
      while((m=colorRe.exec(f.detail))) push([m[1],m[2]].filter(Boolean).join(' ')+(m[3]?'-'+m[3]:''));
    });
    var record=st&&st.sourceAppearance;
    if(out.length<2&&record&&clean(record.color)) push(clean(record.color));
    return out.slice(0,5);
  }
  function wearRow(part) {
    part=String(part||'').toLowerCase();
    return S.WEAR_PARTS.find(function(r){return r[1].indexOf(part)>=0})||null;
  }
  /* 수 — 부위 낱말(claws, leaves)을 찾아 본다. 없으면 마지막 낱말 */
  function plural(detail, part) {
    var list=detail.toLowerCase().split(/[\s,]+/), stem=String(part||'').toLowerCase().replace(/(?:es|s)$/,'').slice(0,4);
    var word=list.find(function(w){return stem&&w.indexOf(stem)===0})||list[list.length-1]||'';
    return /[^s]s$/.test(word)||/(?:ae|ves)$/.test(word);
  }
  /* 입는 법 — 같은 묶음은 한 번, 넷까지. 무늬는 한 구절로. 머리 특징 표현을 골랐으면 머리 묶음은 그 문장이 대신한다 */
  function wearClauses(st) {
    var seen={}, out=[], marks=[], skipHead=!!headFeatureLine(st);
    features(st).forEach(function(f){
      /* "skin patches" 를 그대로 두면 그녀의 피부에 얼룩을 그린다 — 몸 낱말은 빼고 모양만 남긴다 */
      var part=String(f.part||'').toLowerCase(), detail=clean(f.detail).replace(/\s+(?:on|of|across|over|along|covering)\s+(?:its\s+|the\s+)?(?:[\w-]+,?\s+){0,2}(?:skin|fur|body|hide)\b/gi,'').replace(/\b(?:skin|fur|body|hide)\s+/gi,'');
      if(S.MARKING_PARTS.indexOf(part)>=0) { if(marks.length<2) marks.push(detail); return; }
      var row=wearRow(part);
      if(!row||seen[row[0]]||(skipHead&&row[3]==='head')||out.length>=4) return;
      seen[row[0]]=1;
      out.push('the '+detail+' '+(plural(detail,part)?'become':'becomes')+' '+row[2]);
    });
    if(marks.length) out.push('its markings ('+marks.join('; ')+') become painted lines and patterns on her plates and undersuit');
    return out;
  }
  function headFeatureLine(st) {
    var key=clean(st&&st.headFeature);
    if(!key||key==='__custom__') return '';
    var row=S.HEAD_FEATURE_OPTIONS.find(function(r){return r[0]===key});
    return row?row[2]:key;   /* 목록에 없으면 직접 입력한 문장 */
  }

  function actionDirection(raw) {
    if(!raw || typeof raw!=='object' || Array.isArray(raw)) return [];
    var lines=[], category=S.ACTION_CATEGORIES.find(function(r){return r.key===raw.category});
    if(category) {
      lines.push('Action category: '+category.prompt);
      var example=category.examples.find(function(r){return r.key===raw.example});
      if(example) lines.push('Action example: '+example.prompt);
    }
    S.ACTION_CONTROLS.forEach(function(control){
      var option=control.options.find(function(r){return r.key===raw[control.key]});
      if(option) lines.push(control.promptLabel+': '+option.prompt);
    });
    return lines;
  }
  /* 액션의 고른 장면 값만 한 줄씩(일상컷은 casualDetails). 화면 비율은 2:3 이 아닐 때만 */
  function sceneDetails(st, mode) {
    var details=[];
    if(clean(st.expr)) details.push('Expression: '+(S.EXPRESSION_DETAIL[st.expr]||st.expr));
    ['pose','orient','scene','outfit','custom'].forEach(function(k) {
      var value=clean(st[k]);
      if(k==='pose') {
        var actionPose=mode==='action'&&S.ACTION_POSES.find(function(r){return r.key===value});
        value=actionPose?actionPose.prompt:(S.POSE_GUIDES[value]?.[1]||value);
      }
      if(k==='orient') value=S.ORIENTATION_GUIDES[value]?.[1]||value;
      var label={pose:'Pose',orient:'Orientation',scene:'Scene',outfit:'Outfit and props',custom:'Note'}[k];
      if(value) details.push(label+': '+value);
    });
    if(clean(st.frame)) details.push('Framing: '+(S.FRAME_GUIDES[st.frame]?.[1]||clean(st.frame)));
    if(clean(st.lens)) details.push('Lens / perspective: '+(S.LENS_GUIDES[st.lens]?.[1]||clean(st.lens)));
    if(clean(st.camera)) details.push('Camera: '+clean(st.camera));
    var aspect=clean(st.aspect);
    if(aspect&&aspect!=='2:3') details.push('Aspect ratio: '+aspect);
    return details;
  }
  /* 일상컷 트리 길 → 한 줄씩(game-atelier casualDetails 와 같은 꼴). 장소·하는 일·옷은 트리 영어, 자세·방향·프레이밍·렌즈는 표 풀이,
     의상 계열의 guide(전통 의상·직업복)는 Outfit note 로. 표정·세 축은 맨 끝 — 길·구도를 먼저 */
  function casualDetails(sc, tree) {
    var CT=root.AtelierCasualTree, out=[], close=S.CLOSE_FRAMES.indexOf(clean(sc.frame))>=0;
    var p=CT.place(tree,sc.place), a=CT.act(tree,sc.act), f=CT.family(tree,sc.ofam), it=CT.item(tree,sc.ofam,sc.item);
    if(p) out.push('Place: '+p.en);
    if(a) out.push('Activity: '+a.en);
    if(clean(sc.outfit)) out.push('Outfit: '+clean(sc.outfit));
    else if(it) out.push('Outfit: '+it.en);
    else if(f) out.push('Outfit: '+f.en);
    if(f&&f.guide) out.push('Outfit note: '+f.guide);
    if(clean(sc.pose)) out.push('Pose: '+(S.POSE_GUIDES[sc.pose]?.[1]||clean(sc.pose)));
    if(clean(sc.orient)) out.push('Orientation: '+(S.CASUAL_ORIENT_GUIDES?.[sc.orient]||S.ORIENTATION_GUIDES[sc.orient]?.[1]||clean(sc.orient)));
    if(clean(sc.frame)) out.push('Framing: '+(S.FRAME_GUIDES[sc.frame]?.[1]||clean(sc.frame)));
    if(clean(sc.lens)) out.push('Lens / perspective: '+(S.LENS_GUIDES[sc.lens]?.[1]||clean(sc.lens)));
    if(clean(sc.camera)) out.push('Camera: '+clean(sc.camera));
    if(clean(sc.expr)) out.push('Expression: '+(S.EXPRESSION_DETAIL[sc.expr]||sc.expr));
    if(clean(sc.scene)) out.push('Scene note: '+clean(sc.scene));
    if(clean(sc.custom)) out.push('Note: '+clean(sc.custom));
    (S.LOCAL_AXES||[]).forEach(function(k){
      var v=sc.axes&&sc.axes[k];
      if(!v||v==='AUTO'||(S.ADVANCED_OPTIONS[k]||[]).indexOf(v)<0) return;
      var closeGuide=close&&S.CLOSE_AXIS_GUIDES[k]&&S.CLOSE_AXIS_GUIDES[k][v];
      out.push(k+': '+v+' — '+(closeGuide||S.SCENE_AXIS_GUIDES[k][v][1]));
    });
    return out;
  }
  /* 일상컷 버전2(2026-10-30, docs/CASUAL_TREE_V2.md — game-atelier prompt-game 의 casualDetailsV2 를 옮겼다).
     표정 문장 속 시선 말은 뗀다(시선은 GAZE 줄 하나가 정한다). pkm 몫: 역할(Role), 동료 줄, 의상 계열 guide(직업복) */
  var EXPR_GAZE=[[/,?\s*gaze slightly to the side/,''],[/\bdirect (\w+) gaze\b/,'$1 eyes'],[/\bhard forward gaze\b/,'hard eyes'],
    [/\bsoft distant gaze past the camera\b/,'soft distant eyes'],[/\bgaze softened and directed slightly upward or away\b/,'softened eyes'],
    [/\bgaze direct and unwarm\b/,'eyes unwarm'],[/ fixed on one point/,''],[/ looking away/,''],[/,?\s*eyes off camera/,''],[/\bgaze angled down and away,\s*/,'']];
  function exprNoGaze(text){return EXPR_GAZE.reduce(function(t,r){return t.replace(r[0],r[1])},String(text||''))}
  function casualDetailsV2(sc, t) {
    var C=root.AtelierCasualTreeV2, out=[], f=C.frame(t,sc.frame);
    var p=C.place(t,sc.place), fam=C.family(t,sc.ofam), it=C.item(t,sc.ofam,sc.item);
    var po=C.posture(t,sc.posture), su=C.support(t,sc.support), u=C.use(t,sc.use), pr=u&&C.prop(t,u.prop);
    var by=function(list,k){return list.find(function(r){return r.key===k})};
    var body=by(t.v2.body,sc.body), head=by(t.v2.head,sc.head), cam=by(t.v2.camera,sc.camera), gaze=by(t.v2.gaze,sc.gaze||(u&&u.gaze)||'');
    if(p) out.push('Place: '+p.en);
    if(u&&u.role) out.push(fill(T.casualRoleV2,{role:u.role}));
    if(C.companionAt(t,sc.place)) out.push(T.casualCompanionV2);
    var wt=(t.v2.weather||[]).find(function(r){return r.key===sc.weather});
    if(wt) out.push('Weather / season: '+wt.en+'.');
    var specs=(sc.ofeat||[]).indexOf('glasses')>=0?'; she wears thin-framed glasses':'';
    if(clean(sc.outfit)) out.push('Outfit: '+clean(sc.outfit)+specs);
    else if(it) out.push('Outfit: '+it.en+specs);
    else if(fam) out.push('Outfit: '+fam.en+specs);
    if(fam&&fam.guide) out.push('Outfit note: '+fam.guide);
    if(po) out.push('POSTURE: '+po.en+'.');
    if(su&&su.en) out.push('SUPPORT: '+su.en+'.');
    /* 머리가 몸을 따르면 머리 말은 싣지 않는다. 옆모습 · 뒤 3/4 몸이면 얼굴도 그쪽(game MGS 일상3 · 4 · 7) */
    var bodyText=body&&body.en+(body.profile_face&&head&&head.key==='with_body'?(gaze&&gaze.key==='camera'?', her face in profile too — only her eyes turn toward the camera':', her face in profile too, not turned toward the camera'):'')
      +(body.turned_face&&head&&head.key==='with_body'?', '+body.turned_face:'');
    out.push('COMPOSITION: '+[(f&&f.en)||sc.frame,bodyText,head&&head.key!=='with_body'&&head.en,cam&&cam.en].filter(Boolean).join('; ')+'.');
    var lens=C.lens(t,sc.frame);
    if(lens) out.push('Lens / perspective: '+(S.LENS_GUIDES[lens]?.[1]||lens));
    var r=C.hand(t,sc.right), both=r&&r.both&&sc.right===sc.left;
    if(both) out.push('BOTH HANDS: '+r.en+'.');
    else ['right','left'].forEach(function(side){
      var k=sc[side], h=C.hand(t,k), text;
      if(k==='prop') text=fill(T.handBusyV2,{side:side});
      else if(h) text=h.en.replace('{side}',side)+(h.elbow?', her elbow '+h.elbow:'');
      if(text) out.push(side.toUpperCase()+' HAND: '+text+'.');
    });
    if(u&&pr){
      var action=u.en.replace('{prop}',pr.en), side=sc.right==='prop'?'right':'left';
      out.push('PROP: '+(u.hands==='both'?fill(T.propBothV2,{action:action,right:u.grip.right,left:u.grip.left}):fill(T.propOneV2,{side:side,action:action}))+'.');
    }
    var lg=C.leg(t,sc.legs);
    if(lg&&f&&f.legs) out.push('LEGS: '+lg.en+'.');
    if(gaze) out.push('GAZE: '+gaze.en+'.');
    var faceHidden=body&&body.face_hidden&&!(head&&head.look_back);
    if(clean(sc.expr)&&!faceHidden) out.push('EXPRESSION: '+((t.v2.expressions||{})[sc.expr]||exprNoGaze(S.EXPRESSION_DETAIL[sc.expr]||sc.expr))+'.');
    if(clean(sc.scene)) out.push('Scene note: '+clean(sc.scene));
    if(clean(sc.custom)) out.push('Note: '+clean(sc.custom));
    (S.LOCAL_AXES||[]).forEach(function(k){
      var v=sc.axes&&sc.axes[k];
      if(!v||v==='AUTO'||(S.ADVANCED_OPTIONS[k]||[]).indexOf(v)<0) return;
      var closeGuide=f&&f.close&&S.CLOSE_AXIS_GUIDES[k]&&S.CLOSE_AXIS_GUIDES[k][v];
      out.push(k+': '+v+' — '+(closeGuide||S.SCENE_AXIS_GUIDES[k][v][1]));
    });
    return out;
  }
  /* 버전2 장면 칸만 — 생성기 상태(st)에는 표 · 카드 · 화풍이 같이 들어 있다 */
  var SCENE_V2=['treeV','era','place','ofam','item','posture','support','frame','body','head','camera','right','left','use','kind','legs','gaze',
    'weather','expr','preset','outfit','ofeat','scene','custom','axes','unlocked','unlockedAuto'];
  function sceneV2(st){var o={};SCENE_V2.forEach(function(k){if(st[k]!==undefined)o[k]=st[k]});return o}
  function buildCasualV2(st, name) {
    var C=root.AtelierCasualTreeV2, CT=root.AtelierCasualTree, t=C.make(st.tree2,st.tree), subj={gen:st.gen}, lines=[], motifs=clean(st.motifs);
    var sc=C.repair(t,sceneV2(st),subj), body=t.v2.body.find(function(r){return r.key===sc.body})||{}, head=t.v2.head.find(function(r){return r.key===sc.head})||{};
    var close=S.CLOSE_FRAMES.indexOf(clean(sc.frame))>=0;
    lines.push(fill(T.casualCharacter,{name:name,type:typeOf(st)}));
    lines.push('STYLE: '+S.CASUAL_STYLE_CORES[styleRow(st.style)[0]]);
    lines.push(T.casualOutputV2);
    lines.push(fill(T.casualFrameV2,{frame:S.ASPECT_FRAME[clean(st.aspect)]||S.ASPECT_FRAME['2:3']}));
    if(close) lines.push(fill(T.casualCropV2,{edge:S.CROP_EDGE[clean(sc.frame)]}));
    if(sc.era==='release') lines.push(fill(T.casualEra,{year:CT.year(t.v1,subj)||'the year of her debut'}));
    if(sc.era==='in_pokemon') lines.push(T.casualWorld);
    if(sc.era==='fantasy') lines.push(T.casualFantasy);
    if(CT.screens(t.v1,sc.place)) lines.push(T.casualScreens);
    lines.push('SCENE (chosen):\n'+casualDetailsV2(sc,t).join('\n'));
    if(motifs) lines.push('MOTIFS to echo lightly: '+motifs+'.');
    lines.push(close?T.casualWardrobeClose:T.casualWardrobe);
    lines.push(T.casualPose);
    /* 등이 카메라 쪽이고 고개를 어깨 너머로 돌렸을 때만 — 눈은 GAZE 줄이 정한다 */
    if(body.far&&head.look_back) lines.push(T.casualLookBackV2);
    lines.push(C.companionAt(t,sc.place)?T.figureCompanion:T.figure, T.anatomy, T.bodyV2, T.handsV2);
    return lines.join('\n\n');
  }
  function sourceName(st, source) {
    return clean(st.sourceName)?clean(st.sourceName)+' ('+source+')':source;
  }
  function typeOf(st) { return clean(st.series)||'unknown'; }
  function mainType(st) { return typeOf(st).split(/\s*\/\s*/)[0].toLowerCase(); }

  /* 종별 얼굴 설계(data/face-design.json 한 종) → FACE 줄의 낱말. 직접 고른 얼굴 항목은 빼고(IDENTITY 가 쥔다), 끈 경우·자료 없음이면 빈 줄 */
  function faceItems(st) {
    var rec=st&&st.faceDesign, t=rec&&rec.face;
    if(!t||st.faceDesignOn===false) return [];
    var chosen={}; paramValues(identityParams(st.params)).forEach(function(p){chosen[p[0]]=1});
    var ok=function(k){var d=S.PARAM_DEFS.find(function(d){return d.key===k});
      return !chosen[k]&&d&&d.options.some(function(o){return o[0]===t[k]&&o[0]&&o[0]!=='__custom__'})};
    var v=function(k){return ok(k)?t[k]:''};
    var eye={large:'open rounded'}[v('eye shape')]||v('eye shape');
    var space={'close-set eyes':'close-set','average eye spacing':'average spacing','wide-set eyes':'wide-set'}[v('eye spacing')]||'';
    var join=function(a){return a.filter(Boolean).join(', ')};
    return [join([v('face shape')&&v('face shape')+' face',v('face length')&&v('face length')+' length',v('face width')&&v('face width')+' width']),
      v('jaw & chin'),join([eye&&eye+' eyes',v('eye size')&&v('eye size')+' size',v('eye tilt'),space]),
      v('eyebrows'),v('nose character')&&(/nose/.test(v('nose character'))?v('nose character'):v('nose character')+' nose'),v('lips')].filter(Boolean);
  }
  function faceLine(st) { var items=faceItems(st); return items.length?fill(T.face,{items:items.join('; ')}):''; }
  /* 같은 설계의 머리 → HAIR 줄. 헤어스타일을 직접 고르면 줄 전체가 빠지고(머리 모양은 사람 것), 길이만 고르면 컷과 길이가,
     앞머리만 고르면 앞머리가 빠진다 — 고른 값과 설계가 서로 반대로 실리지 않게. 길이가 고정된 컷(픽시·보브)은 길이를 안 적는다 */
  function hairItems(st) {
    var rec=st&&st.faceDesign, t=rec&&rec.hair;
    if(!t||st.faceDesignOn===false) return [];
    var chosen={}; identityParams(st.params).forEach(function(p){chosen[p[0]]=1});
    if(chosen.hairstyle) return [];
    var ok=function(k){var d=S.PARAM_DEFS.find(function(d){return d.key===k});
      return d&&d.options.some(function(o){return o[0]===t[k]&&o[0]&&o[0]!=='__custom__'})};
    var cut=!chosen['hair length']&&ok('hairstyle')?t.hairstyle:'', len=!chosen['hair length']&&ok('hair length')?t['hair length']:'';
    var bangs=!chosen.bangs&&ok('bangs')?t.bangs:'', out=[];
    if(cut) out.push((len&&!S.HAIR_LENGTH_LIMITS[cut]?len+' ':'')+cut);
    else if(len) out.push(len+' hair');
    if(bangs) out.push(bangs==='none'?'no bangs':bangs);
    return out;
  }
  function hairLine(st) { var items=hairItems(st); return items.length?fill(T.hair,{items:items.join(', ')}):''; }

  function buildPrompt(st) {
    st=st||{};
    var mode=st.outputMode||'action';
    if(mode==='portrait') mode='action';   /* 옛 저장값 — 폼 초상·기준 시트는 없어졌다 */
    if(['action','casual'].indexOf(mode)<0) throw new Error('Unknown output mode: '+mode);
    var identity=st.identityMode||'create';
    if(['create','reference'].indexOf(identity)<0) throw new Error('Unknown identity mode: '+identity);
    var style=styleRow(st.style)[0];
    var source=clean(st.mech||(st.source&&st.source.mech)||'');
    if(!source) throw new Error('Source creature is required');
    var name=sourceName(st,source), motifs=clean(st.motifs), lines=[];
    /* 버전2 장면(treeV 2)이고 버전2 표가 오면 버전2 줄로. 버전1 기록은 버전1 그대로 조립한다(장부 · 지시문 묶음이 옛 컷을 다시 만들 수 있게) */
    if(mode==='casual'&&st.tree2&&st.treeV===2) {
      if(!root.AtelierCasualTreeV2||!st.tree) throw new Error('Casual tree v2 needs lib/casual-tree-v2.js and data/casual-tree.json');
      return buildCasualV2(st,name);
    }
    if(mode==='casual') {
      /* 일상컷은 트리 길(시대 → 장소 → 하는 일 → 의상 → 구도)로 짓는다(2026-10-29, game-atelier 에서 옮김 — B안). 예전 갈래·예시는 변환표로 옮긴다.
         차례도 game 과 같다 — FRAME 바로 밑에 CROP·시대 줄·SCENE, 그 뒤에 옷·각도 줄(맨 아래 SCENE 은 고른 프레이밍이 첨부 그림의 구도에 졌다).
         pkm 몫: 첫 등장 무렵(세대의 해), 포켓몬 세계, 동료 묶음이면 동료 줄. ANGLE·손·고정값은 그대로 */
      var CT=root.AtelierCasualTree, tree=st.tree, subj={gen:st.gen};
      if(!CT||!tree) throw new Error('Casual tree is required (data/casual-tree.json)');
      var sc=CT.repair(tree,CT.fromLegacy(tree,st),subj,S.CLOSE_FRAMES);
      var close=S.CLOSE_FRAMES.indexOf(clean(sc.frame))>=0;
      lines.push(fill(T.casualCharacter,{name:name,type:typeOf(st)}));
      lines.push('STYLE: '+S.CASUAL_STYLE_CORES[style]);
      lines.push(T.casualOutput);
      lines.push(fill(T.casualFrame,{frame:S.ASPECT_FRAME[clean(st.aspect)]||S.ASPECT_FRAME['2:3']}));
      if(close) lines.push(fill(T.casualCrop,{edge:S.CROP_EDGE[clean(sc.frame)]}));
      if(sc.era==='release') lines.push(fill(T.casualEra,{year:CT.year(tree,subj)||'the year of her debut'}));
      if(sc.era==='in_pokemon') lines.push(T.casualWorld);
      if(sc.era==='fantasy') lines.push(T.casualFantasy);
      if(CT.screens(tree,sc.place)) lines.push(T.casualScreens);
      lines.push('SCENE (chosen):\n'+casualDetails(sc,tree).join('\n'));
      if(motifs) lines.push('MOTIFS to echo lightly: '+motifs+'.');
      lines.push(close?T.casualWardrobeClose:T.casualWardrobe);
      lines.push(T.casualPose);
      var lb=S.LOOK_BACK||{};
      if((lb.orient||[]).indexOf(clean(sc.orient))>=0||(lb.pose||[]).indexOf(clean(sc.pose))>=0) lines.push(T.casualLookBack);
      lines.push(CT.companion(tree,sc.place)?T.figureCompanion:T.figure, T.anatomy, T.body, T.hands, T.handsCasual);
      return lines.join('\n\n');
    }
    var form=st.form||'light';
    if(form!=='overdrive'&&!S.FORM_LINES[form]) throw new Error('Unknown form: '+form);
    var source_line='SOURCE: '+name+', '+typeOf(st)+' type.';
    if(form==='overdrive') {
      var base=st.baseForm||'reference';
      if(!S.OPEN_LINES[base]) throw new Error('Unknown base form: '+base);
      lines.push(fill(T.overdriveInput,{base:base==='reference'?'normal':base+'-form'}));
      lines.push(source_line);
      lines.push('STYLE: '+S.ACTION_STYLE_CORES[style]);
      lines.push(fill(T.overdriveOutput,{open:S.OPEN_LINES[base],energy:S.TYPE_ENERGY[mainType(st)]||'its source energy'}));
      if(clean(st.formOverride)) lines.push('FORM NOTE: '+clean(st.formOverride));
      if(clean(st.custom)) lines.push('NOTE: '+clean(st.custom));
      lines.push(T.figure, T.body, T.handsKeep);
      return lines.join('\n\n');
    }
    var reference=identity==='reference';
    lines.push(reference?T.referenceInput:T.createInput);
    lines.push(source_line);
    if(!reference) {
      var colors=palette(st);
      if(colors.length) lines.push('PALETTE: '+colors.join(', ')+'.');
    }
    lines.push('STYLE: '+S.ACTION_STYLE_CORES[style]);
    if(!reference) {
      lines.push(fill(T.subject,{name:clean(st.sourceName)||source}));
      if(motifs) lines.push('WEAR (user choice): '+motifs+'.');
      else {
        var wear=wearClauses(st);
        if(wear.length) lines.push('WEAR: '+wear.join('; ')+'.');
      }
      var head=headFeatureLine(st);
      if(head) lines.push('HEAD: '+head+'.');
      var face=faceLine(st), hair=hairLine(st);
      if(face) lines.push(face);
      if(hair) lines.push(hair);
    } else if(motifs) lines.push('MOTIFS to keep: '+motifs+'.');
    lines.push(S.FORM_LINES[form]+(clean(st.formOverride)?'\nFORM NOTE: '+clean(st.formOverride):''));
    lines.push(reference?fill(T.referenceOutput,{FORM:form.toUpperCase(),card:T.card}):fill(T.createOutput,{card:T.card}));
    var chosen=actionDirection(st.action).concat(sceneDetails(st,'action'));
    if(chosen.length) lines.push(T.sceneRule+'\n'+chosen.join('\n'));
    if(!reference) {
      var values=paramValues(identityParams(st.params));
      if(values.length) lines.push(T.identity+'\n'+values.map(function(p){return p[0]+': '+p[1]}).join('\n')+
        (values.some(function(p){return p[0]==='body measurements (B/W/H)'})?'\n'+T.measurement:''));
    }
    var hands=[T.hands];
    if(!chosen.length) hands.push(T.handsDefault);
    hands.push(reference?T.handsWear:T.handsArmor);
    lines.push(T.figure, T.anatomy, T.body, hands.join(' '));
    return lines.join('\n\n');
  }
  function words(text) { return (String(text).match(/\S+/g)||[]).length; }
  root.AtelierPrompt={
    styleRow:styleRow,paramValues:paramValues,identityParams:identityParams,
    sourceFeatures:sourceFeatures,palette:palette,wearClauses:wearClauses,
    faceItems:faceItems,faceLine:faceLine,hairItems:hairItems,hairLine:hairLine,casualDetails:casualDetails,casualDetailsV2:casualDetailsV2,sceneV2:sceneV2,buildPrompt:buildPrompt,words:words};
})(window);
