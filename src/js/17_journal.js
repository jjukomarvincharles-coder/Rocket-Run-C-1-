/* ========== JOURNAL ========== */
const JOURNAL_CATS=[
 {key:'planets',label:'PLANETS',total:120},
 {key:'aliens',label:'LIFEFORMS',total:40},
 {key:'anomalies',label:'ANOMALIES',total:60},
 {key:'regions',label:'SECTORS',total:REGIONS.length+Object.keys(SECRET_REGIONS).length},
 {key:'crates',label:'CRATE TYPES',total:10},
 {key:'encounters',label:'ENCOUNTERS',total:6},
 {key:'wrecks',label:'WRECKS',total:20},
 {key:'stations',label:'STATIONS',total:15},
 {key:'enemies',label:'ENEMY TYPES',total:Object.keys(ENEMY_DEFS).length}
];
function journalCount(key){ return Object.keys(SAVE.journal[key]||{}).length; }
function discover(cat,name,meta){
 if(!SAVE.journal[cat]) SAVE.journal[cat]={};
 if(SAVE.journal[cat][name]) return false;
 SAVE.journal[cat][name]=Object.assign({t:Date.now()},meta||{});
 Game.runStats.discoveries++;
 addXP(180+(meta&&meta.bonus?meta.bonus:0));
 pushNotify('NEW DISCOVERY',false,false,true);
 setTimeout(()=>pushNotify(name,false,false,true),620);
 Sound.discovery(); persist(); return true;
}

