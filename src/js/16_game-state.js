/* ========== GAME STATE ========== */
const Game={
 state:'MENU',mode:'expedition',
 time:0,speed:60,baseSpeed:58,
 distance:0,score:0,scoreFloat:0,
 coins:0,gasCollected:0,
 fuel:300,fuelMax:300,fuelDrainRate:1.0,
 hull:100,hullMax:100,
 engine:100,engineMax:100,
 mult:1,combo:1,comboTimer:0,maxCombo:1,maxMult:1,
 chain:0,chainTimer:0,
 region:0,regionTime:0,regionLength:75,
 secretRegion:null,
 difficulty:0,
 events:{active:null,timer:0,next:26},
 encounter:null,
 wreck:null,station:null,
 transmissionTimer:30,transmissionDuration:0,
 spawnTimer:0,collectTimer:0,hunterTimer:0,crateTimer:0,anomalyTimer:0,relicTimer:0,repairTimer:0,
 enemySpawnTimer:0,enemyWaveCooldown:0,
 hunters:[],
 charges:{boost:3,shield:3,magnet:3,slow:3,blast:3},
 chargeTimers:{boost:0,shield:0,magnet:0,slow:0,blast:0},
 maxCharges:5,
 abilities:{boost:0,shield:0,magnet:0,slow:0,blast:0},
 shieldActive:false,shieldEnergy:100,shieldMax:100,shieldParry:0,
 bulletDodgeStreak:0,bulletStreakTimer:0,_audioTick:0,_engineCriticalWarned:false,_hullCriticalWarned:false,droneRepairTimer:28,droneRepairUses:0,
 invuln:0,reviveUsed:false,
 noCollisionRun:true,
 blackHole:null,gravityPlanet:null,gravityPlanetTimer:rnd(40,70),photoMode:false,gravShift:0,hitShake:0,
 routeShown:false,cinematic:0,
 expedition:null,legIndex:0,
 legendary:false,
 nightmare:false,
 runStats:{dodges:0,events:0,nearMisses:0,hits:0,encounters:0,crates:0,discoveries:0,chains:0,wrecks:0,stations:0,logs:0,relics:0,enemiesKilled:0,bulletsDodged:0,perfectParries:0,fleetEscapes:0},
 riskZoneActive:false,riskZone:null,
 cameraMode:0,
 enemyWaveCount:0,
 adaptive:{fuelIssues:0,dodgeSkill:0,riskAppetite:0}
};

const UPGRADE_DEFS=[
 {id:'fuel',name:'FUEL TANK',max:8,base:400,desc:'+35s max fuel per level'},
 {id:'engine',name:'ENGINE',max:8,base:450,desc:'+5% speed per level'},
 {id:'hull',name:'HULL PLATING',max:8,base:500,desc:'+3 max hull per level'},
 {id:'magnet',name:'MAGNET',max:8,base:380,desc:'+18% pickup attraction'},
 {id:'booster',name:'BOOSTER',max:8,base:420,desc:'+0.5s boost duration'},
 {id:'collector',name:'COLLECTOR',max:8,base:460,desc:'+10% pickup value'},
 {id:'shield',name:'SHIELD CAP',max:8,base:520,desc:'+8 shield energy per level'},
 {id:'blast',name:'BLAST',max:8,base:520,desc:'+14% blast radius'}
];
function upgradeCost(def,level){ return Math.round(def.base*Math.pow(1.62,level)); }

const ROCKET_DEFS=[
 {id:'striker',name:'STRIKER',price:0,desc:'Balanced starter craft. Reliable everywhere.',speed:1.00,hull:1.00,fuel:1.00,handling:1.00,accent:0x39d8ff,hullColor:0x8fa6bd,cls:'BALANCED'},
 {id:'interceptor',name:'INTERCEPTOR',price:2500,desc:'Extremely fast, thinner hull.',speed:1.22,hull:0.78,fuel:0.95,handling:1.20,accent:0x7cff9a,hullColor:0x9fb4a8,cls:'SPEED'},
 {id:'tank',name:'TANK',price:5500,desc:'Slow but extremely durable.',speed:0.86,hull:1.85,fuel:1.25,handling:0.82,accent:0xffb03a,hullColor:0x8a8578,cls:'ARMOR'},
 {id:'collector',name:'COLLECTOR',price:7500,desc:'Better pickups. Built to gather.',speed:0.98,hull:1.05,fuel:1.15,handling:1.02,accent:0x4dffb0,hullColor:0x8fb0a0,cls:'GATHER'},
 {id:'explorer',name:'EXPLORER',price:11000,desc:'Better discovery rewards.',speed:1.04,hull:1.15,fuel:1.25,handling:1.10,accent:0x9a9aff,hullColor:0x8a8aa8,cls:'DISCOVERY'},
 {id:'phoenix',name:'PHOENIX',price:16000,desc:'Survives one fatal collision.',speed:1.05,hull:1.10,fuel:1.05,handling:1.05,accent:0xff6a3a,hullColor:0xb08a78,revive:true,cls:'SURVIVAL'},
 {id:'phantom',name:'PHANTOM',price:22000,desc:'Excellent maneuverability.',speed:1.12,hull:0.95,fuel:1.05,handling:1.45,accent:0xb46cff,hullColor:0x7a7f9c,cls:'AGILITY'},
 {id:'void',name:'VOID RUNNER',price:32000,desc:'Resists gravity.',speed:1.18,hull:1.25,fuel:1.30,handling:1.18,accent:0xff4ad8,hullColor:0x6a5a8a,cls:'VOID',voidBoost:true},
 {id:'solaris',name:'SOLARIS',price:48000,desc:'Late-game premium craft.',speed:1.28,hull:1.40,fuel:1.45,handling:1.25,accent:0xffe45c,hullColor:0xc9c2a0,cls:'PREMIUM'}
];
function getRocketDef(id){ return ROCKET_DEFS.find(r=>r.id===id)||ROCKET_DEFS[0]; }

