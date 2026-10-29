/* Casual scene adapter. Identity comes from an approved image, never saved parameters.
   일상컷 장면은 트리 길(lib/casual-tree.js · data/casual-tree.json, 2026-10-29) — 예전 갈래 안내·예시 문장은 없어졌다.
   예전 저장값(cat·ex)은 조립부가 트리의 변환표로 옮긴다. st.tree 가 꼭 있어야 한다 */
(function(root){
  'use strict';
  var P=root.AtelierPrompt;
  function buildSingle(st){
    return P.buildPrompt(Object.assign({},st,{outputMode:'casual',identityMode:'reference'}));
  }
  root.AtelierLifestyle={buildSingle:buildSingle};
})(window);
