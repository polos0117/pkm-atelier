/* Pure catalog selection. Explicit image filters never fall back to another style/cut. */
(function(root){
  'use strict';
  var IMG=root.AtelierImg;
  var CUTS=['auto','all','base','portrait','action','casual','extra'];
  function defaults(){return {q:'',style:'',gen:'',type:'',form:'',cut:'auto'}}
  function forms(defs){
    var normal=Object.keys(defs||{}).filter(function(k){return k!=='overdrive'});
    return normal.concat(normal.map(function(k){return k+'_overdrive'}),defs&&defs.overdrive?['overdrive']:[]);
  }
  function normalize(raw,st){
    raw=raw&&typeof raw==='object'?raw:{};
    var out=defaults();
    Object.keys(out).forEach(function(k){if(typeof raw[k]==='string')out[k]=raw[k]});
    if(CUTS.indexOf(out.cut)<0)out.cut='auto';
    if(st){
      if(!Object.prototype.hasOwnProperty.call(st.styleName||{},out.style))out.style='';
      if(!st.cards.some(function(c){return String(c.gen)===out.gen}))out.gen='';
      if(!st.cards.some(function(c){return c.element===out.type||c.element2===out.type}))out.type='';
      if(forms(st.defs).indexOf(out.form)<0)out.form='';
    }
    if(['base','casual','extra'].indexOf(out.cut)>=0)out.form='';
    return out;
  }
  function shots(entry,defs){
    var rows=[],bs=IMG.styleMap(entry),order=forms(defs);
    function bucket(b,style){
      function add(file,cut,form,index){
        if(typeof file==='string'&&file)rows.push({file:file,style:style,cut:cut,form:form||'',index:index||0});
      }
      add(b.f,'base');
      Object.keys(IMG.formMap(b)).sort(function(a,b){return order.indexOf(a)-order.indexOf(b)}).forEach(function(form){
        add(IMG.formOf(b,form).f,'portrait',form);
        IMG.formActs(b,form,'f').forEach(function(f,i){add(f,'action',form,i+1)});
      });
      ['casual','extra'].forEach(function(cut){IMG.cuts(b,cut,'f').forEach(function(f,i){add(f,cut,'',i+1)})});
    }
    Object.keys(bs).forEach(function(style){bucket(bs[style],style)});
    if(entry)bucket(entry,'');
    return rows;
  }
  function select(st,raw){
    var f=normalize(raw,st),q=f.q.trim().toLowerCase(),rows=[];
    st.cards.forEach(function(card){
      if(q&&(/^#?\d+$/.test(q)?Number(q.replace('#',''))!==card.no:
        ![card.name,card.en].some(function(s){return String(s||'').toLowerCase().includes(q)})))return;
      if(f.gen&&String(card.gen)!==f.gen)return;
      if(f.type&&card.element!==f.type&&card.element2!==f.type)return;
      var entry=st.img[card.name],all=shots(entry,st.defs);
      var matched=all.filter(function(s){return (!f.style||s.style===f.style)&&(!f.form||s.form===f.form)&&
        (f.cut==='auto'||f.cut==='all'||s.cut===f.cut)});
      if(f.cut==='auto'){
        var want=forms(st.defs).filter(function(k){return k!=='overdrive'}),best=null,score=-1;
        matched.forEach(function(s){
          var b=s.style?IMG.styleMap(entry)[s.style]:entry;
          var done=IMG.formsDone(b,want,'f').done;
          if(done>score){score=done;best=s}
        });
        // Prefer a form portrait, then base image, then any cut in that style.
        if(best)best=matched.find(function(s){return s.style===best.style&&s.cut==='portrait'})||
          matched.find(function(s){return s.style===best.style&&s.cut==='base'})||best;
        if(best)rows.push(Object.assign({card:card},best));
        else if(!f.style&&!f.form)rows.push({card:card,file:null,style:'',cut:'auto',form:'',index:0});
      }else matched.forEach(function(s){rows.push(Object.assign({card:card},s))});
    });
    return rows;
  }
  root.AtelierDexFilter={defaults:defaults,forms:forms,normalize:normalize,shots:shots,select:select,CUTS:CUTS};
})(window);
