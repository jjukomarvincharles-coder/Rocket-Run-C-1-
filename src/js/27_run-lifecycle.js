/* ========== RUN LIFECYCLE ========== */
function computeStats(){
 const def=getRocketDef(SAVE.selectedRocket); const u=SAVE.upgrades;
 const cycleBonus=1+(SAVE.cycle-1)*0.08;
 return {
  speedMul:def.speed*(1+u.engine*0.05)*cycleBonus,
  hullMul:def.hull*(1+u.hull*0.12),
  fuelMax:300*def.fuel+u.fuel*35,
  hullMax:100*def.hull + u.hull*3,
  engineMax:100,
  handling:def.handling,
  magnetRange:3.2*(1+u.magnet*0.18),
  boostDur:3.2+u.booster*0.5,
  collectorMul:1+u.collector*0.10,
  shieldDur:4.5+u.shield*0.6,
  shieldMax:100 + u.shield*8,
  blastRadius:11*(1+u.blast*0.14)
 };
}
/* FIX: startRun is now wrapped in try/catch so any future error doesn't freeze the LAUNCH button */
function startRun(expedition,opts){
 try { return _startRunInner(expedition,opts); }
 catch(err){
  console.error('[startRun] fatal:', err);
  document.getElementById('overlay').classList.add('hidden');
  document.getElementById('overlay').innerHTML='';
  document.getElementById('hud').classList.add('hidden');
  Game.state='MENU';
  toast('LAUNCH FAILED · see console');
  showMenu();
 }
}
function _startRunInner(expedition,opts){
 opts=opts||{}; Perf.hold(5000);
 if(opts.mode==='weekly'){ enableWeeklySeed(); if(!expedition) expedition=generateExpedition(); }
 else { disableWeeklySeed(); if(!expedition) expedition=generateExpedition(); }
 Sound.init(); Sound.resume();
 FX.clear();
 for(const a of pool.asteroids) a.despawn();
 for(const c of pool.collectibles) c.despawn();
 for(const b of bulletPool) b.despawn();
 for(const e of enemyPool) e.despawn();
 for(const h of Game.hunters) scene.remove(h.obj);
 Game.hunters.length=0;
 if(Game.blackHole){ scene.remove(Game.blackHole.obj); Game.blackHole=null; }
 if(Game.gravityPlanet){ scene.remove(Game.gravityPlanet.mesh); scene.remove(Game.gravityPlanet.atmo); Game.gravityPlanet=null; }
 if(Game.encounter){ scene.remove(Game.encounter.obj); Game.encounter=null; el.encounterBar.classList.remove('on'); }
 if(Game.riskZone){ scene.remove(Game.riskZone.obj); Game.riskZone=null; }
 if(Game.wreck){ scene.remove(Game.wreck.obj); Game.wreck=null; }
 if(Game.station){ scene.remove(Game.station.obj); Game.station=null; }
 el.decisionModal.classList.remove('on'); decisionResolver=null;
 el.fleetWarning.classList.remove('on');
 const stats=computeStats();
 Game.mode=opts.mode||'expedition';
 Game.nightmare=Game.mode==='nightmare';
 Game.legendary=!!opts.legendary;
 let fuelMax=stats.fuelMax, fuelRate=1.0, diffMod=0;
 if(Game.nightmare){ fuelMax*=0.7; fuelRate=1.5; diffMod=0.6; }
 if(Game.mode==='gauntlet'){ fuelMax=600; diffMod=0.4; }
 if(Game.mode==='fueltrial'){ fuelMax=300; fuelRate=1.0; }
 if(Game.legendary){ diffMod+=0.2; }
 Object.assign(Game,{
  state:'PLAYING',time:0,speed:60*stats.speedMul,baseSpeed:56*stats.speedMul,
  distance:0,score:0,scoreFloat:0,coins:0,gasCollected:0,
  fuel:fuelMax,fuelMax:fuelMax,fuelDrainRate:fuelRate,
  hull:stats.hullMax,hullMax:stats.hullMax,
  engine:stats.engineMax,engineMax:stats.engineMax,
  mult:1,combo:1,comboTimer:0,maxCombo:1,maxMult:1,
  chain:0,chainTimer:0,
  region:0,regionTime:0,regionLength:Game.legendary?45:75,
  secretRegion:null,
  difficulty:diffMod,spawnTimer:0,collectTimer:0,hunterTimer:0,crateTimer:8,anomalyTimer:60,relicTimer:60,repairTimer:30,
  enemySpawnTimer:12,enemyWaveCooldown:0,enemyWaveCount:0,
  transmissionTimer:Game.legendary?8:22,transmissionDuration:0,
  shieldActive:false,shieldEnergy:stats.shieldMax,shieldMax:stats.shieldMax,shieldParry:0,
  bulletDodgeStreak:0,bulletStreakTimer:0,_audioTick:0,_engineCriticalWarned:false,_hullCriticalWarned:false,droneRepairTimer:28,droneRepairUses:0,
  invuln:0,reviveUsed:false,noCollisionRun:true,
  gravityPlanetTimer:rnd(35,60),photoMode:false,
  gravShift:0,hitShake:0,routeShown:false,cinematic:0,
  expedition:expedition||generateExpedition(),legIndex:0,
  runStats:{dodges:0,events:0,nearMisses:0,hits:0,encounters:0,crates:0,discoveries:0,chains:0,wrecks:0,stations:0,logs:0,relics:0,enemiesKilled:0,bulletsDodged:0,perfectParries:0,fleetEscapes:0},
  riskZoneActive:false,
  _modeComplete:false,_lastChance:false,_lowFuelWarned:false,_emergencyShown:false,
  ghostPath:[],_ghostTick:0,_modeStartTime:0
 });
 Game.charges={boost:3,shield:3,magnet:3,slow:3,blast:3};
 Game.chargeTimers={boost:0,shield:0,magnet:0,slow:0,blast:0};
 Game.abilities={boost:0,shield:0,magnet:0,slow:0,blast:0};
 Game.events={active:null,timer:0,next:26};
 rocketPos.set(0,0,0); rocketVel.set(0,0,0); rocketRoll=0; rocketPitch=0;
 for(let i=0;i<10;i++){ const c=freeCollectible(); if(c) c.spawn('coin',-40-i*14); }
 for(let i=0;i<4;i++){ const c=freeCollectible(); if(c) c.spawn('gas',-55-i*26); }
 createRocketInstance(); buildShield(); buildMagnet(); buildGhostRocket();
 applyRegion(0);
 document.getElementById('overlay').classList.add('hidden');
 document.getElementById('overlay').innerHTML='';
 document.getElementById('hud').classList.remove('hidden');
 Sound.startMusic();
 Sound.launchSequence();
 playCinematic(
  Game.legendary?'★ LEGENDARY EXPEDITION ★':(Game.nightmare?'NIGHTMARE UNIVERSE':'SECTOR 01'),
  Game.legendary?'A rare passage opens before you.':(Game.nightmare?'Everything is worse.':REGIONS[0].name),
  3.4
 );
 pushNotify(Game.legendary?'LEGENDARY RUN':'LAUNCH',false,Game.legendary);
 if(Game.legendary){ el.legendaryTint.style.opacity='0.85'; Sound.legendary(); }
 else el.legendaryTint.style.opacity='0';
 updateHUD(); updateAbilityHUD();
 setCameraMode(SAVE.cameraMode||0);
}
function endRun(reason){
 if(Game.state==='GAMEOVER') return;
 disableWeeklySeed();
 if(Game.photoMode){ Game.photoMode=false;
  document.getElementById('photoBtn').classList.add('off');
  document.getElementById('photoControls').classList.remove('on'); }
 Game.state='GAMEOVER';
 Sound.setEngine(0); Sound.over();
 const finalScore=Math.floor(Game.score);
 SAVE.coins+=Game.coins; SAVE.runs+=1;
 SAVE.totalDistance+=Math.floor(Game.distance);
 SAVE.totalGas+=Game.gasCollected; SAVE.totalCoins+=Game.coins;
 SAVE.stats.dodges+=Game.runStats.dodges;
 SAVE.stats.nearMisses+=Game.runStats.nearMisses;
 SAVE.stats.chains+=Game.runStats.chains;
 SAVE.stats.cratesOpened+=Game.runStats.crates;
 SAVE.stats.wrecksInvestigated+=Game.runStats.wrecks;
 SAVE.stats.stationsVisited+=Game.runStats.stations;
 SAVE.stats.enemiesDestroyed+=Game.runStats.enemiesKilled||0;
 const isRecord=finalScore>SAVE.best;
 if(isRecord) SAVE.best=finalScore;
 const xpGain=Math.floor(finalScore/12+Game.distance/30+Game.runStats.discoveries*120);
 addXP(xpGain);
 const rid=SAVE.selectedRocket;
 SAVE.mastery[rid]=(SAVE.mastery[rid]||0)+Math.floor(finalScore/150+4);
 if(isRecord&&Game.ghostPath&&Game.ghostPath.length>4) SAVE.ghost={rocket:rid,score:finalScore,path:Game.ghostPath.slice(0,900)};
 progressMissions();
 unlockAchievement('first');
 if(Game.distance>=1000) unlockAchievement('m1000');
 if(finalScore>=10000) unlockAchievement('s10000');
 if(Game.maxMult>=5) unlockAchievement('x5');
 if(Game.runStats.dodges>=100) unlockAchievement('dodge100');
 if(Game.noCollisionRun&&Game.time>25) unlockAchievement('cleanrun');
 if(Game.gasCollected>=25) unlockAchievement('gascoll');
 if((Game.runStats.perfectParries||0)>=10) unlockAchievement('parry10');
 if((Game.runStats.enemiesKilled||0)>=15) unlockAchievement('acepilot');
 if(Game.runStats.encounters>=1) unlockAchievement('escape');
 if(Game.legendary) SAVE.stats.legendaryRuns++;
 persist();
 showGameOver(reason,finalScore,isRecord,xpGain);
}
function progressMissions(){
 const m=SAVE.missions;
 const bump=(id,val)=>{ const def=MISSION_DEFS.find(d=>d.id===id); if(!def) return;
  m[id]=Math.max(m[id]||0,val);
  if(m[id]>=def.goal&&!m['done_'+id]){ m['done_'+id]=1; SAVE.coins+=def.reward; toast(`MISSION COMPLETE · +${def.reward}¢`); } };
 bump('survive60',Game.time); bump('gas10',Game.gasCollected); bump('dodge50',Game.runStats.dodges);
 bump('mult5',Game.maxMult); bump('coins100',Game.coins); bump('events3',Game.runStats.events);
 bump('clean',Game.noCollisionRun&&Game.time>25?1:0);
 bump('bullet25',Game.runStats.bulletsDodged||0); bump('parry5',Game.runStats.perfectParries||0);
 bump('kills15',Game.runStats.enemiesKilled||0);
 if(Game.region>=7) bump('blackhole',1);
 const today=new Date().toISOString().slice(0,10);
 if(SAVE.daily.date!==today) SAVE.daily={date:today,progress:{}};
 const dp=SAVE.daily.progress;
 dp.d_survive=Math.max(dp.d_survive||0,Game.time);
 dp.d_gas=Math.max(dp.d_gas||0,Game.gasCollected);
 dp.d_close=Math.max(dp.d_close||0,Game.runStats.nearMisses);
 dp.d_mult=Math.max(dp.d_mult||0,Game.maxMult);
 persist();
}
function unlockAchievement(id){
 if(SAVE.achievements[id]) return;
 SAVE.achievements[id]=1;
 const def=ACHIEVEMENT_DEFS.find(a=>a.id===id);
 if(def) toast('ACHIEVEMENT · '+def.text);
 addXP(250); persist();
}
const MISSION_DEFS=[
 {id:'survive60',text:'SURVIVE 60 SECONDS',goal:60,reward:300},
 {id:'gas10',text:'COLLECT 10 GAS CANISTERS',goal:10,reward:400},
 {id:'dodge50',text:'DODGE 50 ASTEROIDS',goal:50,reward:350},
 {id:'mult5',text:'REACH A x5 MULTIPLIER',goal:5,reward:600},
 {id:'blackhole',text:'SURVIVE A BLACK HOLE',goal:1,reward:900},
 {id:'coins100',text:'COLLECT 100 COINS',goal:100,reward:500},
 {id:'events3',text:'COMPLETE 3 EVENTS',goal:3,reward:450},
 {id:'clean',text:'FINISH A RUN WITHOUT HIT',goal:1,reward:1200},
 {id:'bullet25',text:'DODGE 25 ENEMY PROJECTILES',goal:25,reward:650},
 {id:'parry5',text:'PERFORM 5 PERFECT PARRIES',goal:5,reward:900},
 {id:'kills15',text:'DISABLE 15 HOSTILE SHIPS',goal:15,reward:850}
];
const ACHIEVEMENT_DEFS=[
 {id:'first',text:'FIRST FLIGHT'},{id:'m1000',text:'1000 METERS'},{id:'s10000',text:'10,000 SCORE'},
 {id:'x5',text:'x5 MULTIPLIER'},{id:'perfect',text:'PERFECT DODGE'},{id:'dodge100',text:'100 ASTEROIDS DODGED'},
 {id:'bhs',text:'BLACK HOLE SURVIVOR'},{id:'cleanrun',text:'NO COLLISION RUN'},{id:'fuel',text:'FUEL MASTER'},
 {id:'gascoll',text:'GAS COLLECTOR'},{id:'escape',text:'HUNTER ESCAPE'},
 {id:'bulletdance',text:'BULLET DANCER · 20 PROJECTILES DODGED'},
 {id:'parry10',text:'MASTER PARRY · 10 PERFECT PARRIES'},
 {id:'acepilot',text:'ACE PILOT · 15 ENEMY SHIPS DISABLED'}
];

