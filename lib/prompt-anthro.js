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
  function actionDirection(raw) {
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
    return lines.length?S.ACTION_DIRECTION_RULES+'\n\n'+lines.join('\n'):'';
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
    var blocks=[];
    function add(label,body) { if(body) blocks.push('['+label+']\n\n'+body); }
    add('GENERATION INPUT',reference?R.referenceInput:R.createInput);
    add('SOURCE IDENTITY','Source creature: '+source+
      (st.sourceName?' ('+st.sourceName+')':'')+'\n'+
      (st.series?'Source type/context: '+st.series+'\n':'')+
      (mode==='casual'?'The source names identity provenance; use motifs only as requested for this scene.':R.source)+
      (clean(st.motifs)?'\nSelected source motifs: '+clean(st.motifs):''));
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
      add('FORM DEFINITION',(reference?R.formCommon+'\n'+R.referenceForm:R.createForm)+'\n'+R.armorSymmetry+'\n\n'+definition);
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
    buildPrompt:buildPrompt,buildAnthro:buildAnthro,audit:audit};
})(window);
