/* Exercise actual controls, not only the engine: complete a saved six-day operation. */
const assert=require('node:assert/strict'),{start,FOLD}=require('./browser-harness.cjs');
const S=require('../lib/survey.js'),cards=require('../data/card.json'),{plan}=require('./survey-sim.cjs');
const KEY='pkm_survey_v1';
const read=p=>p.evaluate(k=>JSON.parse(localStorage.getItem(k)),KEY);
async function phase(p,value){await p.waitForSelector('.sv-game[data-phase="'+value+'"]');}
async function layout(p,width){
  assert(await p.evaluate(()=>document.body.scrollWidth<=innerWidth),'page fits the screen');
  for(const selector of ['.sv-hero','.sv-dock','.sv-roster']){
    const r=await p.locator(selector).boundingBox();
    if(r)assert(r.x>=0&&r.x+r.width<=width+1,selector+' is not clipped');
  }
  assert(await p.locator('.wrap').evaluate(e=>e.scrollHeight>e.clientHeight),'main area scrolls');
}
(async()=>{
  const h=await start();
  try{
    const a=await h.open('survey.html',{viewport:FOLD.cover,mobile:true,init:()=>{
      localStorage.setItem('survey_unrelated_test','untouched');
    }}),p=a.page;
    await phase(p,'start');await p.locator('.sv-start').click();await phase(p,'plan');
    const initial=await read(p);assert.equal(initial.crew.length,6);
    await layout(p,FOLD.cover.width);
    const first=p.locator('.sv-member').first();
    await first.locator('[data-form="heavy"]').click();
    assert.equal((await read(p)).crew[0].form,'heavy','form control updates state');
    await first.locator('select').selectOption('0');
    await p.locator('.sv-member').nth(1).locator('select').selectOption('0');
    await p.waitForFunction(()=>document.querySelectorAll('.sv-member select')[2].options[1].disabled);
    assert(await p.locator('.sv-member').nth(2).locator('option[value="0"]').evaluate(e=>e.disabled),'full mission is unavailable');
    assert.equal(await p.locator('[data-mission="0"] .sv-assignees>div').count(),2);
    const assigned=await read(p);await p.reload();await phase(p,'plan');
    assert.deepEqual(await read(p),assigned,'reload retains crew, forms and assignments');
    await p.locator('.sv-clear').click();
    assert((await read(p)).crew.every(c=>c.mission===null),'clear returns all crew to rest');

    for(let day=0;day<6;day++){
      let s=await read(p);
      for(const c of s.crew)if(c.energy<=2&&s.kits){
        await p.locator('.sv-member').filter({has:p.locator('select[data-assignment="'+c.name+'"]')}).locator('.sv-repair').click();
        s=await read(p);
      }
      for(const action of plan(s)){
        const member=p.locator('.sv-member[data-name="'+action.name+'"]');
        if(action.type==='form')await member.locator('[data-form="'+action.form+'"]').click();
        else await member.locator('select').selectOption(String(action.mission));
      }
      s=await read(p);
      const expected=S.preview(s,cards).reduce((n,m)=>n+m.grade,0);
      await p.waitForFunction(n=>document.querySelector('.sv-dock strong').textContent.includes('+'+n),expected);
      assert((await p.locator('.sv-dock strong').innerText()).includes('+'+expected));
      await p.locator('.sv-launch').click();await phase(p,day===5?'finished':'report');
      let result=await read(p);
      assert.equal(result.score,s.score+expected,'displayed forecast equals actual score');
      assert.equal(result.history.length,day+1);
      if(day===0){await p.reload();await phase(p,'report');assert.deepEqual(await read(p),result);}
      if(day<5){
        const reward=result.kits<=1?'restock':S.SKILLS[day%3];
        await p.locator('[data-reward="'+reward+'"]').click();await phase(p,'plan');
        assert.equal((await read(p)).day,day+1);
      }
    }
    const final=await read(p);assert(final.score>=30,'a complete playable route reaches the goal');
    await p.reload();await phase(p,'finished');
    assert((await p.locator('.sv-finish').innerText()).includes(String(final.score)));
    assert.equal(await p.evaluate(()=>Number(localStorage.getItem('pkm_survey_best_v1'))),final.score);
    await p.locator('.sv-replay').click();await phase(p,'plan');
    assert.deepEqual((await read(p)).crew,initial.crew,'replay uses the same roster');
    assert.equal((await read(p)).score,0);
    assert.equal(await p.evaluate(()=>localStorage.getItem('survey_unrelated_test')),'untouched');
    for(const viewport of [FOLD.inner,{width:1280,height:900}]){
      await p.setViewportSize(viewport);await layout(p,viewport.width);
    }
    assert.deepEqual(await p.evaluate(()=>window.AtelierWords.missing()),[]);assert.deepEqual(a.errors,[]);await a.close();

    const bad=await h.open('survey.html',{store:[KEY,'{broken']});
    await phase(bad.page,'start');assert(await bad.page.locator('.sv-notice').isVisible());
    await bad.page.locator('.sv-start').click();await phase(bad.page,'plan');assert.deepEqual(bad.errors,[]);await bad.close();
    const blocked=await h.open('survey.html',{init:()=>{
      Storage.prototype.getItem=function(){throw Error('blocked')};
      Storage.prototype.setItem=function(){throw Error('blocked')};
    }});
    await phase(blocked.page,'start');await blocked.page.locator('.sv-start').click();await phase(blocked.page,'plan');
    assert((await blocked.page.locator('.sv-footer').innerText()).includes('저장이 막혀'));
    await blocked.page.locator('.sv-launch').click();await phase(blocked.page,'report');
    assert.deepEqual(blocked.errors,[]);await blocked.close();
    const failed=await h.open('survey.html',{init:()=>{
      const original=window.fetch;window.fetch=(url,...args)=>String(url).includes('data/card.json')?
        Promise.resolve(new Response('{}',{status:503})):original(url,...args);
    }});
    await failed.page.waitForSelector('.sv-load[role="alert"]');
    assert(await failed.page.getByRole('button',{name:'다시 불러오기'}).isVisible());assert.deepEqual(failed.errors,[]);await failed.close();
    console.log('PASS survey screen: six-day playthrough, assignments, forms, rewards, repair, reloads, replay, mobile/tablet/desktop, corrupt/blocked saves and data failure');
  }finally{await h.stop()}
})().catch(e=>{console.error(e);process.exitCode=1});
