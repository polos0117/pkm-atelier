const fs=require('node:fs');
const defs=JSON.parse(fs.readFileSync('data/card.json','utf8')).forms;
const forms=['light','heavy','mobility'];
const cards=[
 {name:'A',en:'Alpha',no:1,gen:1,element:'water',element2:'flying',forms},
 {name:'B',en:'Beta',no:2,gen:2,element:'water',forms},
 {name:'C',en:'Gamma',no:1001,gen:1,element:'poison',forms},
 {name:'D',en:'Delta',no:4,gen:3,element:'fire',forms}
];
const img={A:{byStyle:{game_keyart:{f:'a-base.webp',byForm:{light:{f:'a-light.webp'},heavy:{f:'a-heavy.webp',action:{f:['a-heavy-act1.webp','a-heavy-act2.webp']}},heavy_overdrive:{f:'a-heavy-od.webp'}},casual:{f:['a-casual1.webp','a-casual2.webp']},extra:{f:['a-extra.webp']}},glossy_promo:{byForm:{light:{f:'a-gloss-light.webp'}},casual:{f:['a-gloss-casual.webp']}}}},B:{byStyle:{game_keyart:{casual:{f:['b-casual.webp']},byForm:{overdrive:{f:'b-old-od.webp'}}}}},D:{f:'d-legacy.webp'}};
const styles=[{key:'game_keyart',name:'Game'},{key:'glossy_promo',name:'Glossy'},{key:'mecha_cinematic_keyart',name:'Mecha'}];
module.exports={cards,defs,img,styles,styleName:Object.fromEntries(styles.map(s=>[s.key,s.name])),group:{name:{water:'Water',flying:'Flying',poison:'Poison',fire:'Fire'},order:['water','flying','poison','fire']},label:{}};
