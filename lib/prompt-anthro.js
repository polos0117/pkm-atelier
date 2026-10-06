/* Pure prompt assembly — 표(lib/prompt-spec.js)와 원작 외형 자료를 받아 영어 프롬프트 한 덩이를 만든다.
   화면 없이 node 로도 부른다(tests/prompt-engine.cjs).

   2026-10-02 간결화(myth-atelier 꼴). 기준 시트·확대컷·장착점·가림 문단은 없다.
   - 새 인물(create): 첨부 없이 한 장. 원작 특징은 "어떻게 입나"(WEAR) 로만 적는다 — 어디에 다는지는 안 적는다.
   - 이어가기(reference): 확정한 경장 그림을 첨부하고 폼(장갑 겹)만 바꾼 새 카드.
   - 개방(overdrive): 그 폼 그림을 첨부하고 같은 그림에서 판만 연다.
   - 일상(casual): 확정한 그림을 첨부하고 평상복 장면.
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
    var faceKeys=['face shape','face length','face width','jaw & chin','eye shape','eye size','eye tilt','nose character','lips'];
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
  /* 고른 장면 값만 한 줄씩. 화면 비율은 2:3 이 아닐 때만 */
  function sceneDetails(st, mode) {
    var details=[];
    if(clean(st.expr)) details.push('Expression: '+(S.EXPRESSION_DETAIL[st.expr]||st.expr));
    ['pose','orient','scene','outfit','categoryGuide','example','custom'].forEach(function(k) {
      var value=clean(st[k]);
      if(k==='pose') {
        var actionPose=mode==='action'&&S.ACTION_POSES.find(function(r){return r.key===value});
        value=actionPose?actionPose.prompt:(S.POSE_GUIDES[value]?.[1]||value);
      }
      if(k==='orient') value=S.ORIENTATION_GUIDES[value]?.[1]||value;
      var label={pose:'Pose',orient:'Orientation',scene:'Scene',outfit:'Outfit and props',categoryGuide:'Category',example:'Example scene',custom:'Note'}[k];
      if(value) details.push(label+': '+value);
    });
    if(clean(st.frame)) details.push('Framing: '+(S.FRAME_GUIDES[st.frame]?.[1]||clean(st.frame)));
    if(clean(st.lens)) details.push('Lens / perspective: '+(S.LENS_GUIDES[st.lens]?.[1]||clean(st.lens)));
    if(clean(st.camera)) details.push('Camera: '+clean(st.camera));
    if(mode==='casual') (S.LOCAL_AXES||[]).forEach(function(k){
      var v=st.axes&&st.axes[k];
      if(v && v!=='AUTO' && (S.ADVANCED_OPTIONS[k]||[]).indexOf(v)>=0) details.push(k+': '+v+' — '+S.SCENE_AXIS_GUIDES[k][v][1]);
    });
    var aspect=clean(st.aspect);
    if(aspect&&aspect!=='2:3') details.push('Aspect ratio: '+aspect);
    return details;
  }
  function sourceName(st, source) {
    return clean(st.sourceName)?clean(st.sourceName)+' ('+source+')':source;
  }
  function typeOf(st) { return clean(st.series)||'unknown'; }
  function mainType(st) { return typeOf(st).split(/\s*\/\s*/)[0].toLowerCase(); }

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
    if(mode==='casual') {
      lines.push(fill(T.casualCharacter,{name:name,type:typeOf(st)}));
      lines.push('STYLE: '+S.CASUAL_STYLE_CORES[style]);
      lines.push(T.casualOutput);
      if(motifs) lines.push('MOTIFS to echo lightly: '+motifs+'.');
      var cd=sceneDetails(st,'casual');
      if(cd.length) lines.push('SCENE (chosen):\n'+cd.join('\n'));
      lines.push(T.figure, T.anatomy, T.hands);
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
      lines.push(T.figure, T.handsKeep);
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
    lines.push(T.figure, T.anatomy, hands.join(' '));
    return lines.join('\n\n');
  }
  function words(text) { return (String(text).match(/\S+/g)||[]).length; }
  root.AtelierPrompt={
    styleRow:styleRow,paramValues:paramValues,identityParams:identityParams,
    sourceFeatures:sourceFeatures,palette:palette,wearClauses:wearClauses,
    buildPrompt:buildPrompt,words:words};
})(window);
