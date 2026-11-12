/* 검사 껍데기가 지역 그림 주소를 받는지: 기본은 200 + 그림으로 풀림, regionArt:false 면 404 */
const assert=require('node:assert/strict'),{start}=require('./browser-harness.cjs');
(async()=>{
 const h=await start();
 try{
  for(const [opt,status] of [[{},200],[{regionArt:false},404]]){
   const a=await h.open('index.html',opt),p=a.page;
   for(const u of ['regions/kanto.webp','regions/thumb/kanto.webp']){
    const r=await p.evaluate(async u=>{
     const res=await fetch('https://polos0117.github.io/pkm-atelier-img-4/'+u);
     if(!res.ok)return{status:res.status};
     const b=await createImageBitmap(await res.blob());return{status:res.status,w:b.width};
    },u);
    assert.equal(r.status,status,u);
    if(status===200)assert(r.w>=1,u);
   }
   await a.close();
  }
  console.log('PASS region-art-stub');
 }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exit(1)});
