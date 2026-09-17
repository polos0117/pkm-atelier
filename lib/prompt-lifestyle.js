/* Casual scene adapter. Identity comes from an approved image, never saved parameters. */
(function(root){
  'use strict';
  var S=root.AtelierSpec, P=root.AtelierPrompt;
  function catTable(){
    var table={};
    S.CATS.forEach(function(r){table[r[0]]={eng:r[1],ko:r[2],guide:r[3],sex:r[4]||''}});
    return table;
  }
  function exampleRecord(cat,value){
    return (S.EXAMPLE_MAP[cat]||[]).find(function(r){return r[0]===value})||null;
  }
  function exampleText(cat,value,custom){
    if(value==='__custom__')return (custom||'').trim();
    if(!value)return '';
    var r=exampleRecord(cat,value);
    return r?(r[5]||r[1]):'';
  }
  function buildSingle(st){
    var cat=catTable()[st.cat];
    return P.buildPrompt(Object.assign({},st,{
      outputMode:'casual',identityMode:'reference',
      categoryGuide:st.cat==='__custom__'?(st.catCustom||''):(cat?cat.guide:''),
      example:exampleText(st.cat,st.ex,st.exCustom)
    }));
  }
  root.AtelierLifestyle={catTable:catTable,exampleRecord:exampleRecord,
    exampleText:exampleText,buildSingle:buildSingle};
})(window);
