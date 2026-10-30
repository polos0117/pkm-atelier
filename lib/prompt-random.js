/* Scene-only randomization. 액션은 연출 갈래 → 예시(잠근 예시는 갈래를 막는다).
   일상(casual)은 트리 차례로 내려간다(lib/casual-tree.js, 2026-10-29 game-atelier 에서 옮김): 시대 → 장소 → 하는 일 → 의상 계열 → 옷 → 프레이밍·렌즈 → 자세·방향 → 표정·세부 축.
   앞 칸은 그대로 두고 뒤 칸만 그 안에서 뽑는다 — 한 칸을 뽑으면 그 뒤에서 맞지 않게 된 칸을 남은 것 중에서 다시 뽑는다. 잠근 칸은 안 바꾼다.
   안 쓰는 방향·프레이밍(트리 표 banned)과 필수 갈래 컷의 얼굴 클로즈업은 트리가 거른다. ctx = {tree, card} */
(function(root){
 'use strict';
 const S=root.AtelierSpec,CT=root.AtelierCasualTree;
 /* 일상컷 버전2(장면 treeV 2, lib/casual-tree-v2.js, 2026-10-30 game-atelier 에서) — 칸 차례는 버전2 모듈, 한 칸을 뽑으면 set 이 뒤 칸을 고친다.
    다 뽑기는 버전2 random(몸 쪽은 쓸 수 있는 자세 추천 하나 — 잠근 칸이 있으면 칸마다) 뒤에 표정 · 축 · 화면비. ctx = {tree, tree2, card} */
 const C2=()=>root.AtelierCasualTreeV2;
 const CASUAL_V2=['era','place','weather','ofam','item','posture','support','frame','body','head','camera','right','left','use','legs','gaze','expr'];
 const TREE_V2=CASUAL_V2.filter(k=>k!=='expr');
 const isV2=(scene,ctx)=>!!(scene&&scene.treeV===2&&ctx&&ctx.tree2&&C2());
 const t2=ctx=>C2().make(ctx.tree2,ctx.tree);
 const concrete=values=>values.filter(v=>v&&v!=='AUTO'&&v!=='__custom__'&&!v.startsWith('auto_'));
 const keys=rows=>concrete(rows.map(r=>r[0]));
 const CASUAL=['era','place','act','ofam','item','frame','lens','pose','orient','expr'];
 function value(scene,key){
  const [group,name]=key.split('.');
  return name?scene[group]?.[name]:scene[key];
 }
 function fields(scene,mode,ctx={}){
  if(mode==='action'){
   const result={};
   result['action.category']=S.ACTION_CATEGORIES.map(r=>r.key);
   result['action.example']=(S.ACTION_CATEGORIES.find(r=>r.key===scene.action?.category)?.examples||[]).map(r=>r.key);
   for(const c of S.ACTION_CONTROLS)result['action.'+c.key]=c.options.map(r=>r.key);
   return {...result,expr:keys(S.EXPRESSION_OPTIONS),pose:S.ACTION_POSES.map(r=>r.key),
    orient:keys(S.ORIENTATION_OPTIONS),frame:keys(S.FRAME_OPTIONS),lens:keys(S.LENS_OPTIONS),aspect:['2:3','3:2','1:1','9:16','16:9']};
  }
  if(mode!=='casual'||!ctx.tree)return {};
  const result={};
  if(isV2(scene,ctx)){
   const t=t2(ctx);
   for(const k of CASUAL_V2){
    if(k==='expr')result.expr=keys(S.EXPRESSION_OPTIONS);
    else if(k==='use')result.use=C2().propSides(scene)?C2().choices(t,scene,'use',ctx.card):[];
    else if(k==='legs')result.legs=(C2().frame(t,scene.frame)||{}).legs?C2().choices(t,scene,'legs',ctx.card):[];
    else result[k]=C2().choices(t,scene,k,ctx.card);
   }
   for(const k of S.LOCAL_AXES)result['axes.'+k]=concrete(S.ADVANCED_OPTIONS[k]);
   result.aspect=['2:3','3:2','1:1','9:16','16:9'];
   return result;
  }
  for(const k of CASUAL){
   if(k==='frame')result.frame=keys(S.FRAME_OPTIONS).filter(f=>CT.frameOk(ctx.tree,scene.act,f,scene));
   else if(k==='lens')result.lens=keys(S.LENS_OPTIONS).filter(l=>CT.lensOk(ctx.tree,scene.frame,l));
   else if(k==='expr')result.expr=CT.exprOk(ctx.tree,scene)?keys(S.EXPRESSION_OPTIONS):[];
   else result[k]=CT.choices(ctx.tree,scene,k,ctx.card,S.CLOSE_FRAMES);
  }
  for(const k of S.LOCAL_AXES)result['axes.'+k]=concrete(S.ADVANCED_OPTIONS[k]);
  result.aspect=['2:3','3:2','1:1','9:16','16:9'];
  return result;
 }
 function canRandomize(scene,mode,key,ctx){
  const locks=scene.randomLocks||{};
  if(locks[key])return false;
  if(key==='action.category'&&locks['action.example'])return false;
  return (fields(scene,mode,ctx)[key]||[]).some(v=>v!==value(scene,key));
 }
 function randomize(scene,mode,key=null,rng=Math.random,ctx={}){
  if(!['action','casual'].includes(mode))return scene;
  let next={...scene,action:{...scene.action},axes:{...scene.axes},randomLocks:{...scene.randomLocks}};
  const pickOf=list=>list[Math.min(list.length-1,Math.max(0,Math.floor(rng()*list.length)))];
  function assign(k,v){const [group,name]=k.split('.');if(name)next[group][name]=v;else next[k]=v;}
  if(mode==='casual'&&isV2(next,ctx)){
   const t=t2(ctx),locked=Object.keys(next.randomLocks).filter(k=>next.randomLocks[k]);
   const held=k=>TREE_V2.filter(f=>f!==k&&next.randomLocks[f]&&next[f]);
   if(!key){
    next={...C2().random(t,next,ctx.card,rng,locked),axes:{...next.axes},randomLocks:{...next.randomLocks}};
    for(const k of Object.keys(fields(next,mode,ctx)))if(TREE_V2.indexOf(k)<0&&canRandomize(next,mode,k,ctx))
     assign(k,pickOf(fields(next,mode,ctx)[k].filter(v=>v!==value(next,k))));
    return next;
   }
   if(!canRandomize(next,mode,key,ctx))return next;
   const options=fields(next,mode,ctx)[key].filter(v=>v!==value(next,key));
   if(TREE_V2.indexOf(key)<0){assign(key,pickOf(options));return next;}
   const keep=held(key),left=options.slice();
   while(left.length){
    const v=left.splice(Math.min(left.length-1,Math.max(0,Math.floor(rng()*left.length))),1)[0];
    const cand=C2().set(t,next,key,v,ctx.card,pickOf);
    if(keep.every(f=>cand[f]===next[f]))return {...cand,axes:{...next.axes},randomLocks:{...next.randomLocks}};
   }
   return next;
  }
  // Dependency order is defined by fields(): choose an earlier step before the steps it filters.
  for(const k of key?[key]:Object.keys(fields(next,mode,ctx))){
   if(!canRandomize(next,mode,k,ctx))continue;
   const options=fields(next,mode,ctx)[k].filter(v=>v!==value(next,k));
   if(mode!=='casual'){
    assign(k,pickOf(options));
    if(k==='action.category')next.action.example='';
    continue;
   }
   /* 일상컷 — 잠근 칸이 살아남는 값만(시대를 뽑았는데 잠근 장소가 그 시대에 없으면 다른 시대). 남는 값이 없으면 이 칸은 그대로 */
   const held=CASUAL.filter(f=>f!==k&&next.randomLocks[f]&&next[f]);
   const left=options.slice();
   while(left.length){
    const v=left.splice(Math.min(left.length-1,Math.max(0,Math.floor(rng()*left.length))),1)[0];
    let cand={...next,axes:{...next.axes}};
    const [group,name]=k.split('.');if(name)cand[group][name]=v;else cand[k]=v;
    if(CASUAL.indexOf(k)>=0&&CASUAL.indexOf(k)<CASUAL.indexOf('frame'))cand.preset='';
    cand=CT.repair(ctx.tree,cand,ctx.card,S.CLOSE_FRAMES,pickOf);
    if(held.every(f=>cand[f]===next[f])){next=cand;break;}
   }
  }
  return next;
 }
 root.AtelierSceneRandom={fields,value,canRandomize,randomize,CASUAL,CASUAL_V2,isV2};
})(window);
