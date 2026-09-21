/* Pure prompt assembly: approved image identity, forms, and output modes. */
(function(root){
  'use strict';
  var S=root.AtelierSpec, R=S.PROJECT_RULES;
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
      'Body type sets the build; body details adjust within it. Balanced/average retain that build. These describe anatomy beneath armor, not equipment volume.']);
    if(has('hairstyle')) out.push(['hair scope',
      'Keep hairstyle construction and fixed cut length; other hair settings adjust within it. Length is measured loose, texture is strand thickness, volume is hair mass. Hair choices do not set ethnicity.']);
    if(faceKeys.some(has)) out.push(['facial precedence',
      'Explicit facial geometry controls the actual outline in every view and inset, above style, ethnicity or demeanor. Local chin, width/length, eye size and tilt refine broader face/eye shapes. Shading and expression must not reshape the outline.']);
    if(has('facial character')) out.push(['demeanor scope',
      'Facial character affects demeanor only; preserve age and geometry. Explicit scene expression takes priority.']);
    if(has('facial ethnicity')) out.push(['ethnicity scope',
      'Broad ancestry cue with individual variation; preserve explicit geometry, skin tone and hair. No stereotyped features or mandatory regional face template.']);
    var right=value('eye color'),left=value('second eye color');
    // No left override means same color in both eyes, as the UI promises.
    out=out.filter(function(p){return p[0]!=='second eye color'});
    if(left&&left!==right) out.push(['heterochromia',
      'Character-relative right eye is '+(right||'one chosen primary color, different from '+left)+
      '; left eye is '+left+'. Preserve side assignment across views; do not blend colors.']);
    else if(right) out.push(['eye color consistency','both eyes are '+right]);
    if(opt.special) out.push(['special characteristics',opt.special]);
    if(opt.underboob && (opt.gender||'female')==='female') {
      out.push(['chest armor negatives',S.UNDERBOOB_NEG]);
      out.push(['chest armor design',S.UNDERBOOB_POS]);
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
  function sourceFeatures(st) {
    var record=st&&st.sourceAppearance;
    if(!record||!Array.isArray(record.features)) return [];
    return record.features.map(function(f){return clean(f&&f.detail)}).filter(Boolean).slice(0,6);
  }
  function sourceMotifs(st) {
    return clean(st.motifs)||sourceFeatures(st).join('; ');
  }
  /* 확대컷 세 칸. 얼굴은 외형 설정에서, 설계 언어는 고정 문구 + 머리 특징 표현에서,
     장착부는 자료(뿌리 있는 부위)나 사용자 문구에서 온다. */
  function hasPart(text, list) {
    var lower=String(text||'').toLowerCase();
    return list.some(function(term){ return lower.indexOf(term)>=0 });
  }
  function rootedFeatures(st, list) {
    var record=st&&st.sourceAppearance;
    if(!record||!Array.isArray(record.features)) return [];
    /* 자료는 part 이름으로만 고른다 — "belly shell" 처럼 본문에 낱말이 섞인 것을 뿌리로 오해하지 않는다 */
    var onHead=/\b(?:head|forehead|face|facial|cheek|brow|scalp|ear)\b/i;
    return record.features.filter(function(f){
      if(!f||!clean(f.detail)||list.indexOf(String(f.part||'').toLowerCase())<0) return false;
      /* 'crest' 처럼 머리에도 등에도 오는 부위는 본문으로 가른다 — 머리 볏은 후면 장착부가 아니다 */
      return list===S.INSET_HEAD_PARTS||!onHead.test(f.detail);
    }).map(function(f){return clean(f.detail)});
  }
  function headFeatureText(st) {
    var key=clean(st&&st.headFeature);
    if(key&&key!=='__custom__') {
      var row=S.HEAD_FEATURE_OPTIONS.find(function(r){return r[0]===key});
      if(row&&row[2]) return row[2];
      return 'species head feature treatment: '+key;   /* 직접 입력한 문장 */
    }
    var heads=rootedFeatures(st,S.INSET_HEAD_PARTS).slice(0,2);
    if(heads.length) return 'species head feature'+(heads.length>1?'s':'')+' "'+heads.join('" and "')+'" '+(heads.length>1?'are':'is')+' permanent equipment at these hardpoints';
    return 'no species head feature; the head hardpoints stay minimal';
  }
  function featureInsetSuggestions(st) {
    st=st||{};
    var raw=Array.isArray(st.params)?st.params:Object.entries(st.params||{});
    var value=function(key){
      var row=raw.find(function(p){return p[0]===key}),v=row&&clean(row[1]);
      return v&&v!=='AUTO'&&v!=='__custom__'?v:'';
    };
    var face=[];
    var right=value('eye color'),left=value('second eye color');
    if(right&&left&&right!==left) face.push('right-eye '+right+' and left-eye '+left);
    else if(right) face.push(right+' eyes');
    var hair=[value('hair color'),value('hairstyle')].filter(Boolean).join(' ');
    if(hair) face.push(hair+' hair');
    if(value('jaw & chin')) face.push(value('jaw & chin'));

    var design='one side, temple to shoulder, three-quarter: temple and behind-ear hardpoints, collar, the representative shoulder plate '+
      'and upper-arm joint; panel division, rim section, fastening, light lines and materials';

    var mount;
    var clauses=clean(st.motifs).split(/\s*(?:[,;\n]|\s\/\s)\s*/).map(clean).filter(Boolean);
    var rooted=clauses.length?clauses.filter(function(t){return hasPart(t,S.INSET_MOUNT_PARTS)}):rootedFeatures(st,S.INSET_MOUNT_PARTS);
    if(rooted.length) {
      mount='rear close-up of the '+rooted[0]+' body mount: root, cradle and connection to back or sacrum';
      if(rooted.length>1) mount+=', with the separate '+rooted[1]+' root';
    } else mount='rear close-up of the armor harness anchors at back and collar; this species carries no permanent mounted equipment';
    return {
      face:face.join(', ')||'face identity from CHARACTER IDENTITY: eyes, hairline, hairstyle and jaw/chin',
      design:design, mount:mount
    };
  }
  function featureInsetBlock(st) {
    var suggested=featureInsetSuggestions(st),given=st&&st.featureInsets&&typeof st.featureInsets==='object'?st.featureInsets:{};
    var get=function(key){return clean(given[key])||suggested[key]};
    return '1. FACE IDENTITY — '+get('face')+'.\n'+
      '2. HEAD-SHOULDER DESIGN LANGUAGE — '+get('design')+'. Head feature: '+headFeatureText(st)+'.\n'+
      '3. REAR MOUNT — '+get('mount')+'.\n'+
      S.REFERENCE_SHEET_PROFILE.featureRule;
  }
  function actionDirection(raw, compact) {
    if(!raw || typeof raw!=='object' || Array.isArray(raw)) return '';
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
    return lines.length?(compact?'':S.ACTION_DIRECTION_RULES+'\n\n')+lines.join('\n'):'';
  }
  function referenceActionMounts(st, source) {
    var words=[source,st.sourceName,st.motifs,st.formOverride].map(clean).join(' ').toLowerCase();
    var has=function(kind){return S.ACTION_MOUNT_HINTS[kind].some(function(term){return words.indexOf(term)>=0})};
    var shell=has('shell'),tail=has('tail'),rear=has('rear');
    var out=[];
    if(shell) out.push(R.referenceActionShellMount);
    else if(rear) out.push(R.referenceActionRearMount);
    if(tail) out.push(R.referenceActionTailMount);
    return out.join('\n');
  }
  function referenceActionForm(st, form) {
    var text=R.referenceActionForm+'\n'+R.referenceActionSymmetry+'\n'+R.referenceActionDiscipline+'\n'+R.referenceActionHead+'\n';
    if(form!=='overdrive') text+=S.ACTION_FORM_PROFILES[form];
    else {
      var base=st.baseForm||'reference';
      if(base!=='reference'&&!S.ACTION_FORM_PROFILES[base]) throw new Error('Unknown base form: '+base);
      text+='OVERDRIVE BASE: '+(base==='reference'?
        'use the armor worn in the attached approved image.':S.ACTION_FORM_PROFILES[base])+'\n'+
        'OVERDRIVE: open selected existing panels at their established hinges, reveal the inner frame and source-appropriate energy, and show physical strain through the pose. Keep the base armor inventory, attachment points, colors and mass recognizable. Head: only open the base form\'s existing head panels; never generate a new helmet.';
      if(base==='reference') text+=' If a second approved base-form action image is attached, retain its camera, pose and figure scale while opening the armor.';
      if(base==='heavy') text+=' Existing shoulder, forearm, thigh and shin shells open with large readable displacement while retaining their thickness and protective mass.';
    }
    if(clean(st.formOverride)) text+='\nUser form adjustment: '+clean(st.formOverride);
    return text;
  }
  function referenceActionDetails(st) {
    var details=[];
    if(clean(st.expr)) details.push('Expression: '+(S.EXPRESSION_DETAIL[st.expr]||st.expr));
    ['pose','orient','scene','outfit','categoryGuide','example','custom'].forEach(function(k) {
      var value=clean(st[k]);
      if(k==='pose') {
        var actionPose=S.ACTION_POSES.find(function(r){return r.key===value});
        value=actionPose?actionPose.prompt:(S.POSE_GUIDES[value]?.[1]||value);
      }
      if(k==='orient') value=S.ORIENTATION_GUIDES[value]?.[1]||value;
      if(value) details.push(k+': '+value);
    });
    if(clean(st.frame)) details.push('Framing: '+(S.FRAME_GUIDES[st.frame]?.[1]||clean(st.frame)));
    if(clean(st.lens)) details.push('Lens / perspective: '+(S.LENS_GUIDES[st.lens]?.[1]||clean(st.lens)));
    if(clean(st.camera)) details.push('Camera: '+clean(st.camera));
    details.push('Aspect ratio: '+(clean(st.aspect)||'2:3'));
    return details;
  }
  function buildReferenceAction(st, source, style, form) {
    var blocks=[],mounts=referenceActionMounts(st,source);
    function add(label,body) { if(body) blocks.push('['+label+']\n\n'+body); }
    add('GENERATION INPUT',R.referenceActionInput);
    add('SOURCE IDENTITY','Source creature: '+source+
      (st.sourceName?' ('+st.sourceName+')':'')+
      (st.series?'\nSource type/context: '+st.series:'')+
      (clean(st.motifs)?'\nSelected source motifs: '+clean(st.motifs):''));
    add('CHARACTER IDENTITY',R.referenceActionIdentity);
    add('SOURCE ENGINEERING',R.referenceActionDesign+'\n'+R.referenceActionRoles+(mounts?'\n'+mounts:''));
    add('FORM DEFINITION',referenceActionForm(st,form));
    add('STYLE CORE',S.ACTION_STYLE_CORES[style]);
    add('MATERIAL SEPARATION',R.referenceActionMaterial);
    add('ACTION DIRECTION',actionDirection(st.action,true));
    add('OUTPUT MODE',R.referenceActionOutput+'\n'+R.referenceActionPriority+'\n\nScene selections:\n'+referenceActionDetails(st).join('\n'));
    add('FINAL CHECK',R.referenceActionFinal);
    return blocks.join('\n\n');
  }
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
    if(reference&&mode==='action') return buildReferenceAction(st,source,style,form);
    var blocks=[];
    function add(label,body) { if(body) blocks.push('['+label+']\n\n'+body); }
    add('GENERATION INPUT',reference?R.referenceInput:R.createInput);
    add('SOURCE IDENTITY','Source creature: '+source+
      (st.sourceName?' ('+st.sourceName+')':'')+'\n'+
      (st.series?'Source type/context: '+st.series+'\n':'')+
      (mode==='casual'?'The source names identity provenance; use motifs only as requested for this scene.':R.source)+
      (clean(st.motifs)?'\nSelected source motifs (user priority): '+clean(st.motifs):
        (!reference&&sourceMotifs(st)?'\nSource appearance cues: '+sourceMotifs(st)+'.\n'+R.sourceAppearanceScope:'')));
    if(mode!=='casual') add('SOURCE ENGINEERING',(reference?R.sourceDesignReference:R.sourceDesignCreate)+'\n\n'+R.sourceMounts);
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
        if(base==='heavy') definition+='\n\n'+R.heavyOverdrive;
        else if(base==='reference') definition+='\n\n'+R.heavyOverdriveConditional+'\n'+R.heavyOverdrive;
      }
      add('FORM DEFINITION',(reference?R.formCommon+'\n'+R.referenceForm:R.createForm)+'\n'+R.armorSymmetry+'\n'+R.headCommon+'\n\n'+definition);
      if(clean(st.formOverride)) add('FORM OVERRIDE',
        'Apply only within the selected form and existing design; do not change identity or contradict its layering/opening logic.\n'+clean(st.formOverride));
    }
    add('STYLE CORE',profile.core);
    add('PROJECT STYLE EXTENSION',(mode==='casual'?R.casualProject:R.project)+'\n\n'+
      (mode==='casual'?profile.lifestyle:profile.anthro)+
      '\n\nRendering choices never override CHARACTER IDENTITY, FORM DEFINITION or OUTPUT MODE.');
    add('MATERIAL SEPARATION',R.materialCommon+'\n\n'+
      (mode==='casual'?R.materialClothing:R.materialArmor));
    if(mode==='action') add('ACTION DIRECTION',actionDirection(st.action));
    var details=[];
    if(clean(st.expr)) details.push('Expression: '+(S.EXPRESSION_DETAIL[st.expr]||st.expr));
    if(mode!=='portrait') {
      ['pose','orient','scene','outfit','categoryGuide','example','custom'].forEach(function(k) {
        var value=clean(st[k]);
        if(k==='pose') {
          var actionPose=mode==='action'&&S.ACTION_POSES.find(function(r){return r.key===value});
          value=actionPose?actionPose.prompt:(S.POSE_GUIDES[value]?.[1]||value);
        }
        if(k==='orient') value=S.ORIENTATION_GUIDES[value]?.[1]||value;
        if(value) details.push(k+': '+value);
      });
      if(['pose','orient','frame','lens','camera'].some(function(k){return clean(st[k])}))
        details.push(S.SCENE_CHOICE_RULE);
      if(mode==='casual') (S.LOCAL_AXES||[]).forEach(function(k){
        var v=st.axes&&st.axes[k];
        if(v && v!=='AUTO' && (S.ADVANCED_OPTIONS[k]||[]).indexOf(v)>=0) details.push(k+': '+v+' — '+S.SCENE_AXIS_GUIDES[k][v][1]);
      });
    }
    var overdrivePortrait=!sheet&&mode==='portrait'&&form==='overdrive';
    add('OUTPUT MODE',(sheet?sheet.output:S.OUTPUT_PROFILES[overdrivePortrait?'overdrivePortrait':mode])+(details.length?'\n\nScene details (within identity and mode boundaries):\n'+details.join('\n'):''));
    if(sheet) add('FEATURE INSET LIST — FIXED',featureInsetBlock(st));
    add('CAMERA & PRESENTATION',sheet?sheet.camera:mode==='portrait'?R.portraitCamera:
      R.freeCamera+'\nAspect ratio: '+(clean(st.aspect)||'2:3')+
      (clean(st.frame)?'\nFraming: '+(S.FRAME_GUIDES[st.frame]?.[1]||clean(st.frame)):'')+
      (clean(st.lens)?'\nLens / perspective: '+(S.LENS_GUIDES[st.lens]?.[1]||clean(st.lens)):'')+
      (clean(st.camera)?'\nCamera: '+clean(st.camera):''));
    add('CONSISTENCY / NEGATIVE LOCK',sheet?sheet.negative:R.negative);
    add('FINAL CHECK',sheet?sheet.final:R.final+(reference?'\n\n'+R.referenceFinal:''));
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
  root.AtelierPrompt={
    styleRow:styleRow,styleBlock:styleBlock,paramValues:paramValues,identityParams:identityParams,
    featureInsetSuggestions:featureInsetSuggestions,headFeatureText:headFeatureText,
    sourceFeatures:sourceFeatures,
    buildPrompt:buildPrompt,buildAnthro:buildAnthro,audit:audit};
})(window);
