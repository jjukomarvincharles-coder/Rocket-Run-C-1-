/* ========== SAVE ========== */
const DEFAULT_SAVE={
 best:0,coins:0,totalDistance:0,runs:0,totalGas:0,totalCoins:0,
 selectedRocket:'striker',unlockedRockets:['striker'],
 upgrades:{fuel:0,engine:0,hull:0,magnet:0,booster:0,collector:0,shield:0,blast:0},
 skins:{hull:'#8fa6bd',engine:'#ff8a2b',trail:'#39d8ff'},
 missions:{},achievements:{},daily:{date:'',progress:{}},
 settings:{quality:'auto',sound:true,music:true,dronesActive:true,realLaunch:true,engineVolume:0.78,effectsVolume:0.84,musicVolume:0.62,launchVolume:0.58},
 xp:0,level:1,
 journal:{planets:{},aliens:{},anomalies:{},regions:{},crates:{},encounters:{},wrecks:{},stations:{},enemies:{}},
 mastery:{},resources:{credits:0,cores:0,blueprints:0,relics:0},
 storyLogs:{},transmissionsHeard:{},ghost:null,
 stats:{dodges:0,nearMisses:0,encounters:0,sectorsVisited:{},cratesOpened:0,chains:0,stationsVisited:0,wrecksInvestigated:0,legendaryRuns:0,enemiesDestroyed:0,perfectDodges:0},
 highestRegion:0,cycle:1,discoveredSecrets:{},seenSignal:{},
 enemies:{totalKilled:0,typesSeen:{}},cameraMode:0
};
function deepMerge(base,over){const out=Array.isArray(base)?base.slice():Object.assign({},base);
 for(const k in over){const v=over[k];
  if(v&&typeof v==='object'&&!Array.isArray(v)&&base[k]&&typeof base[k]==='object') out[k]=deepMerge(base[k],v);
  else out[k]=v;} return out;}
let SAVE=(()=>{ try{const raw=localStorage.getItem(SAVE_KEY); if(raw) return deepMerge(DEFAULT_SAVE,JSON.parse(raw));}catch(e){} return JSON.parse(JSON.stringify(DEFAULT_SAVE)); })();
function persist(){ try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));}catch(e){} }

