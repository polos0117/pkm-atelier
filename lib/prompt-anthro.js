/* Pure prompt assembly: approved image identity, forms, and output modes. */
(function(root){
  'use strict';
  var S=root.AtelierSpec, R=S.PROJECT_RULES;
  function andList(a){
    return a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+', and '+a[a.length-1];
  }

  /* 민족은 정해 둔 얼굴 항목을 덮어쓰지 않는다 — 이미 적은 것은 그대로 두고
     나머지 이목구비로만 드러나게 한다 */
  function ethnicLock(e,pinned){
    var free=S.ETHNIC_PART.filter(function(x){
      return !x[1].some(function(k){return pinned.indexOf(k)>=0});
    }).map(function(x){return x[0]});
    free.push('skin undertone');   /* 피부 언더톤은 기하 항목이 없어 늘 민족 몫이다 */
    return andList(free)+' must clearly read as '+e+
      '; do not default to generic Western or Caucasian features'+
      (free.length<6
        ? '. The facial features specified explicitly in this list are already decided — '+
          'render them as written and let '+e+' show through the remaining features, '+
          'colouring rather than reshaping what is specified'
        : '')+
      '; keep the ethnicity consistent across every cut';
  }

  /* 두 눈 색이 다르면 좌우를 못 박고, 같으면 같음을 못 박는다 */
  function eyeNote(out){
    var e2=out.find(function(p){return p[0]==='second eye color'}); if(!e2)return;
    var e1=out.find(function(p){return p[0]==='eye color'});
    var right=e1?e1[1]:'the primary eye color', left=e2[1];
    if(e1&&right===left){
      out.push(['eye color consistency',
        'both eyes are '+right+'; keep the same eye colour consistently in both eyes']);
    }else{
      out.push(['heterochromia',
        'the character has heterochromia: the right eye is '+right+
        ' and the left eye is '+left+
        '; keep the two eye colours clearly distinct and preserve the same side assignment in every image — '+
        'do not swap the sides and do not blend the colours']);
    }
  }


  function paramValues(raw, opt) {
    opt = opt || {};
    var out = raw.slice();

    /* 상위 값이 있으면 하위가 그걸 덮지 않도록 순서를 못 박는다.

       단 얼굴은 반대다. 화면에서는 facial character 아래에 세부가 놓이지만
       (인상을 먼저 고르고 세부를 잡는 흐름이 자연스러우므로), 모델에게는
       명시한 얼굴 구조가 인상보다 위여야 한다. 인상 한 마디가 눈 · 코 · 턱을
       한꺼번에 흔드는 것이 원래 문제였다.

       sub 는 화면 배치를 정하는 값이고 의미 우선순위와는 별개다. 구조에
       해당하는 열쇠만 아래 목록으로 따로 잡는다. */
    var FACE_GEOMETRY = ['face shape', 'face length', 'face width', 'jaw & chin',
                         'eye shape', 'eye size', 'eye tilt', 'nose character', 'lips'];
    var has = function (k) { return out.some(function (o) { return o[0] === k }) };
    var parents = [['body type', 'overall build'],
                   ['hairstyle', 'hair form'], ['armor coverage', 'armor coverage']];
    var setP = parents.filter(function (x) { return has(x[0]) });
    if (setP.length && out.some(function (o) {
      return S.PARAM_DEFS.some(function (d) { return d.key === o[0] && d.sub });
    })) {
      out.push(['parameter precedence',
        setP.map(function (x) { return x[0] }).join(', ') + (setP.length > 1 ? ' define' : ' defines') +
        ' the overall direction; ' +
        'the other, finer entries in this list adjust within that direction and must not override or contradict it. ' +
        'Where a finer entry appears to conflict, keep the overall direction and apply the finer entry only as a mild adjustment']);
    }
    /* 눈동자 색 · 표정은 구조도 인상도 아니다. 예전에는 이것들까지 '인상을
       거스르지 말라' 로 묶였는데 색에 대고 할 말이 아니라 아예 뺐다. */
    /* 민족·지역 외모는 넓은 인상 단서다. 참조 정체성이나 명시한 구조를 덮으면
       개인 얼굴이 지역 평균으로 미끄러진다. */
    if (has('facial ethnicity')) {
      out.push(['ethnicity scope',
        'facial ethnicity is a broad population-level appearance cue only. ' +
        'It must not override the explicit facial geometry in this list, ' +
        'and stereotypical regional features must not be exaggerated']);
    }
    var geo = FACE_GEOMETRY.filter(has);
    /* 예전에는 facial character 가 있을 때만 이 문장을 내보냈다. 인상이 없으면
       우선순위를 말할 상대가 없다고 본 것인데, 실제로 기하를 여덟 개나 적고
       인상만 비워 둔 편성에서 이 문장이 통째로 빠졌다. 기하를 덮는 것은 인상만이
       아니다 — 화풍의 미인 틀, 민족 단서, 모델의 기본 얼굴이 모두 덮는다.
       그러니 기하가 하나라도 있으면 내보내고, 인상이 있을 때만 그 몫을 덧붙인다. */
    if (geo.length) {
      out.push(['facial precedence',
        'the explicit facial geometry in this list (' + geo.join(', ') + ') defines the actual face ' +
        'and must be preserved; do not replace it with a recurring attractive default face. ' +
        (has('facial character')
          ? 'facial character is a secondary impression cue describing how that face should read. ' +
            'Do not alter the specified geometry, or the adult age structure, to exaggerate the impression'
          : 'Where this list is silent, choose freely, but do not let that freedom pull the ' +
            'specified features back toward a template')]);
    }
    eyeNote(out);
    var age = out.find(function (p) { return p[0] === 'apparent age' });
    if (age && age[1] === 'youthful adult') out.push(['age clarity', S.YOUTHFUL_LOCK]);
    var fc2 = out.find(function (p) { return p[0] === 'facial character' });
    if (fc2 && S.CUTE_SET[fc2[1]] && !(age && age[1] === 'youthful adult'))
      out.push(['age clarity', S.CUTE_LOCK.replace('{C}', fc2[1])]);
    var eth = out.find(function (p) { return p[0] === 'facial ethnicity' });
    if (eth) out.push(['ethnic consistency', ethnicLock(eth[1], geo)]);
    if (opt.special) out.push(['special characteristics', opt.special]);
    if (opt.underboob && (opt.gender || 'female') === 'female') {
      out.push(['chest armor negatives', S.UNDERBOOB_NEG]);
      out.push(['chest armor design', S.UNDERBOOB_POS]);
    }
    return out;
  }


  function styleRow(key) {
    key=key||S.DEFAULT_STYLE;
    var row=S.ART_STYLES.find(function(r){return r[0]===key});
    if(!row) throw new Error('Unknown style: '+key);
    return row;
  }
  function styleBlock(key) {
    return '[STYLE CORE]\n\n'+S.STYLE_PROFILES[styleRow(key)[0]].core;
  }
  function identityParams(raw) {
    return (raw||[]).filter(function(p){
      var d=S.PARAM_DEFS.find(function(d){return d.key===p[0]});
      return d && S.IDENTITY_GROUPS.indexOf(d.group)>=0 &&
        S.IDENTITY_EXCLUDED.indexOf(d.key)<0 && p[1] && p[1]!=='__custom__' && p[1]!=='AUTO';
    });
  }
  function clean(value) { return typeof value==='string'?value.trim():''; }
  function buildPrompt(st) {
    st=st||{};
    var mode=st.outputMode||'portrait', identity=st.identityMode||(mode==='casual'?'reference':'create');
    if(!S.OUTPUT_PROFILES[mode]) throw new Error('Unknown output mode: '+mode);
    if(['create','reference'].indexOf(identity)<0) throw new Error('Unknown identity mode: '+identity);
    if(mode==='casual') identity='reference';
    var style=styleRow(st.style)[0], profile=S.STYLE_PROFILES[style];
    var form=st.form||'light', reference=identity==='reference';
    var sheet=mode==='portrait'&&!reference?S.REFERENCE_SHEET_PROFILE:null;
    if(mode!=='casual' && !S.FORM_PROFILES[form] && form!=='overdrive') throw new Error('Unknown form: '+form);
    var source=st.mech||(st.source&&st.source.mech)||'';
    if(!clean(source)) throw new Error('Source creature is required');
    var blocks=[];
    function add(label,body) { if(body) blocks.push('['+label+']\n\n'+body); }
    add('GENERATION INPUT',reference?R.referenceInput:R.createInput);
    add('STYLE CORE',profile.core);
    add('PROJECT STYLE EXTENSION',(mode==='casual'?R.casualProject:R.project)+'\n\n'+
      (mode==='casual'?profile.lifestyle:profile.anthro)+
      '\n\nRendering choices never override CHARACTER IDENTITY, FORM DEFINITION or OUTPUT MODE.');
    add('SOURCE IDENTITY','Source creature: '+source+
      (st.sourceName?' ('+st.sourceName+')':'')+'\n'+
      (st.series?'Source type/context: '+st.series+'\n':'')+
      (mode==='casual'?'The source names identity provenance; use motifs only as requested for this scene.':R.source)+
      (clean(st.motifs)?'\nSelected source motifs: '+clean(st.motifs):''));
    var values=reference?[]:paramValues(identityParams(st.params),{gender:'female'});
    add('CHARACTER IDENTITY',(reference?R.reference:R.create)+
      (values.length?'\n\n'+values.map(function(p){return p[0]+': '+p[1]}).join('\n'):''));
    if(values.some(function(p){return p[0]==='body measurements (B/W/H)'})) add('BODY MEASUREMENT NOTE',R.measurement);
    if(mode!=='casual') {
      var definition=S.FORM_PROFILES[form];
      if(form==='overdrive') {
        var base=st.baseForm||(reference?'reference':'light');
        if(base==='reference'&&!reference) throw new Error('Reference armor requires reference identity mode');
        if(base!=='reference'&&!S.FORM_PROFILES[base]) throw new Error('Unknown base form: '+base);
        definition='OVERDRIVE. Base: '+(base==='reference'?
          'the armor actually worn in the attached reference.':
          'the explicitly selected '+base+' configuration. '+S.FORM_PROFILES[base])+
          (!reference?'\nDesign this base armor from the text first, then depict its opened state. No base-armor image is needed.':'')+'\n'+R.overdrive;
      }
      add('FORM DEFINITION',R.formCommon+(reference?'\n'+R.referenceForm:'')+'\n\n'+definition);
      if(clean(st.formOverride)) add('FORM OVERRIDE',
        'Apply only within the selected form and existing design; do not change identity or contradict its layering/opening logic.\n'+clean(st.formOverride));
    }
    var details=[];
    if(clean(st.expr)) details.push('Expression: '+(S.EXPRESSION_DETAIL[st.expr]||st.expr));
    if(mode!=='portrait') {
      ['pose','orient','scene','outfit','categoryGuide','example','custom'].forEach(function(k) {
        if(clean(st[k])) details.push(k+': '+clean(st[k]));
      });
      if(mode==='casual') (S.LOCAL_AXES||[]).forEach(function(k){
        var v=st.axes&&st.axes[k];
        if(v && v!=='AUTO' && (S.ADVANCED_OPTIONS[k]||[]).indexOf(v)>=0) details.push(k+': '+v);
      });
    }
    add('OUTPUT MODE',(sheet?sheet.output:S.OUTPUT_PROFILES[mode])+(details.length?'\n\nScene details (within identity and mode boundaries):\n'+details.join('\n'):''));
    add('CAMERA & PRESENTATION',sheet?sheet.camera:mode==='portrait'?R.portraitCamera:
      R.freeCamera+'\nAspect ratio: '+(clean(st.aspect)||'2:3')+
      (clean(st.frame)?'\nFraming: '+clean(st.frame):'')+
      (clean(st.camera)?'\nCamera: '+clean(st.camera):''));
    add('CONSISTENCY / NEGATIVE LOCK',sheet?sheet.negative:R.negative);
    add('FINAL CHECK',R.final+(reference?'\n\n'+R.referenceFinal:'')+(sheet?'\n\n'+sheet.final:''));
    return blocks.join('\n\n');
  }
  function buildAnthro(st) {
    return buildPrompt(Object.assign({},st,{outputMode:st.outputMode||'portrait'}));
  }
  function audit(mode,prompt) {
    if(mode==='anthro')mode='portrait';
    if(mode==='lifestyle')mode='casual';
    var errors=[];
    ['[STYLE CORE]','[CHARACTER IDENTITY]','[OUTPUT MODE]','[FINAL CHECK]'].forEach(function(t){
      if(prompt.indexOf(t)<0)errors.push('Missing '+t);
    });
    if(mode==='casual'&&prompt.indexOf('[FORM DEFINITION]')>=0)errors.push('Form leaked into casual mode');
    if(mode!=='casual'&&prompt.indexOf('[FORM DEFINITION]')<0)errors.push('Missing form');
    return errors;
  }
  root.AtelierPrompt={andList:andList,ethnicLock:ethnicLock,eyeNote:eyeNote,
    styleRow:styleRow,styleBlock:styleBlock,paramValues:paramValues,identityParams:identityParams,
    buildPrompt:buildPrompt,buildAnthro:buildAnthro,audit:audit};
})(window);
