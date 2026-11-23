/* ========== MAIN UPDATE ========== */
const tmpV=new THREE.Vector3();
const tmpV2=new THREE.Vector3();

function updateGame(dt){
 Game.time+=dt; Game.regionTime+=dt;
 const stats=computeStats();
 const region=Game.secretRegion?SECRET_REGIONS[Game.secretRegion]:REGIONS[Game.region];
 Game.difficulty=clamp(Game.time/180+Game.region*0.09+(Game.nightmare?0.6:0)+(Game.legendary?0.25:0),0,3.0);

 const engineFactor = clamp(Game.engine/100, 0.55, 1.0);
 const boostFactor=Game.abilities.boost>0?2.75:1.0;
 const slowWorld=Game.abilities.slow>0?0.55:1.0;
 const targetSpeed=Game.baseSpeed*region.speedMul*(1+Game.difficulty*0.5)*boostFactor*engineFactor;
 Game.speed=damp(Game.speed,targetSpeed,1.6,dt);
 updateEvents(dt);

 readKeyboard();
 const hx=Input.touchActive?Input.x:Input.keyX;
 const hy=Input.touchActive?Input.y:Input.keyY;
 const handling=stats.handling*26*engineFactor*(Game.abilities.boost>0?1.16:1.0);
 let ax=clamp(hx,-1,1)*handling;
 let ay=clamp(hy,-1,1)*handling;
 if(Game.gravShift>0){ ax+=Math.sin(Game.time*1.7)*5.5; ay+=Math.cos(Game.time*1.3)*4.0; }
 rocketVel.x=damp(rocketVel.x,ax,7,dt);
 rocketVel.y=damp(rocketVel.y,ay,7,dt);
 rocketPos.x+=rocketVel.x*dt;
 rocketPos.y+=rocketVel.y*dt;
 if(rocketPos.x>BOUND_X){ rocketPos.x=BOUND_X; rocketVel.x*=-0.25; }
 if(rocketPos.x<-BOUND_X){ rocketPos.x=-BOUND_X; rocketVel.x*=-0.25; }
 if(rocketPos.y>BOUND_Y){ rocketPos.y=BOUND_Y; rocketVel.y*=-0.25; }
 if(rocketPos.y<-BOUND_Y){ rocketPos.y=-BOUND_Y; rocketVel.y*=-0.25; }

 if(Game.blackHole){ const bh=Game.blackHole;
  const pullDir=tmpV.copy(bh.obj.position).sub(rocketPos);
  const dist=pullDir.length();
  if(dist<80){
   pullDir.normalize();
   const proximity=1-clamp(dist/80,0,1);
   const f=proximity*proximity*bh.pull*9;
   rocketPos.addScaledVector(pullDir,f*dt);
   rocketPos.x=clamp(rocketPos.x,-BOUND_X*1.6,BOUND_X*1.6);
   rocketPos.y=clamp(rocketPos.y,-BOUND_Y*1.6,BOUND_Y*1.6);
   el.bhTint.style.opacity=String(clamp(proximity*1.3,0,1));
   Game.hitShake=Math.max(Game.hitShake,proximity*0.55);
   if(dist<34&&!bh.warned){ bh.warned=true; pushNotify('⚠ GRAVITY CRITICAL','Pull clear of the singularity!',true); Sound.lowFuel(); }
   if(dist<10){ FX.burst(rocketPos,0x9a3aff,34,20,1.0,1.1); FX.ring(rocketPos,0x9a3aff,20,0.9);
    flashScreen(0.85,'rgba(154,58,255,'); endRun('CONSUMED · EVENT HORIZON'); return; }
  } else el.bhTint.style.opacity='0'; }

 if(Game.gravityPlanet){ const gp=Game.gravityPlanet;
  const toP=tmpV.copy(gp.mesh.position).sub(rocketPos);
  const dist=toP.length();
  if(dist<gp.atmoRadius){
   if(!gp.entered){ gp.entered=true; pushNotify('⚠ ENTERING ATMOSPHERE','High gravity — pull clear or burn out.',true); Sound.event(); }
   toP.normalize();
   const proximity=1-dist/gp.atmoRadius;
   const boosting=Game.abilities.boost>0;
   const f=proximity*proximity*gp.pull*(boosting?0.35:1);
   rocketPos.addScaledVector(toP,f*dt);
   el.gravTint.style.opacity=String(clamp(proximity*1.2,0,1));
   Game.hitShake=Math.max(Game.hitShake,proximity*0.45);
   if(dist<gp.radius*1.12){
    FX.burst(rocketPos,0xff8a4a,30,18,1.0,1.2); FX.ring(rocketPos,0xff8a4a,16,0.8);
    flashScreen(0.85,'rgba(255,130,40,'); endRun('CRASHED · PLANET SURFACE'); return; }
  } else { if(gp.entered) gp.entered=false; el.gravTint.style.opacity='0'; } }

 let drain=Game.fuelDrainRate;
 if(Game.events.active==='fuelEmergency') drain*=1.7;
 if(Game.abilities.boost>0) drain*=1.3;
 Game.fuel-=drain*dt;
 if(Game.fuel>0&&Game.fuel<22&&!Game._lastChance){
  Game._lastChance=true; pushNotify('CRITICAL FUEL',true); Sound.lowFuel();
  const c=freeCollectible(); if(c) c.spawn('gas',SPAWN_Z-30);
  const c2=freeCollectible(); if(c2) c2.spawn('gas',SPAWN_Z-70); }
 if(Game.fuel>70) Game._lastChance=false;
 if(Game.fuel<=0){ Game.fuel=0; updateHUD(); return endRun('OUT OF FUEL'); }
 if(Game.fuel<Game.fuelMax*0.18&&!Game._lowFuelWarned){
  Game._lowFuelWarned=true; pushNotify('LOW FUEL',true); Sound.lowFuel(); unlockAchievement('fuel'); }
 if(Game.fuel>Game.fuelMax*0.3) Game._lowFuelWarned=false;

 Game.shieldParry=Math.max(0,(Game.shieldParry||0)-dt);
 if(Game.bulletStreakTimer>0){Game.bulletStreakTimer-=dt;if(Game.bulletStreakTimer<=0)Game.bulletDodgeStreak=0;}
 if(Game.engine<25&&!Game._engineCriticalWarned){Game._engineCriticalWarned=true;pushNotify('ENGINE CRITICAL',true);Sound.engineCritical();}
 if(Game.engine>35)Game._engineCriticalWarned=false;
 if(Game.hull<25&&!Game._hullCriticalWarned){Game._hullCriticalWarned=true;pushNotify('HULL CRITICAL',true);Sound.hullWarning();}
 if(Game.hull>35)Game._hullCriticalWarned=false;
 for(const k of ['boost','shield','magnet','slow','blast']){
  if(Game.abilities[k]>0){ Game.abilities[k]-=dt;
   if(Game.abilities[k]<=0){ Game.abilities[k]=0;
    if(k==='shield') Game.shieldActive=false;
    if(k==='boost') Sound.boostRelease(); } }
  if(Game.charges[k]<Game.maxCharges){
   Game.chargeTimers[k]+=dt;
   if(Game.chargeTimers[k]>24){ Game.chargeTimers[k]=0; Game.charges[k]++; updateAbilityHUD(); } } }

 const moveDist=Game.speed*dt;
 Game.distance+=moveDist;
 const legendaryMul=Game.legendary?1.5:1.0;
 Game.scoreFloat+=moveDist*1.5*Game.mult*(Game.abilities.boost>0?1.5:1)*legendaryMul;
 Game.score=Game.scoreFloat;

 if(Game.comboTimer>0){ Game.comboTimer-=dt;
  if(Game.comboTimer<=0){ if(Game.combo>1){ Game.combo=1; } } }
 if(Game.chainTimer>0){ Game.chainTimer-=dt;
  if(Game.chainTimer<=0){
   if(Game.chain>=5){ const bonus=Game.chain*40*Game.mult; Game.scoreFloat+=bonus;
    toast('CHAIN COMPLETE ×'+Game.chain+' · +'+Math.floor(bonus)); SAVE.stats.chains++; }
   Game.chain=0; el.chainDisplay.classList.remove('on'); } }

 const density=region.density*0.78*(1+Game.difficulty*0.70)*(Game.nightmare?1.15:1);
 Game.spawnTimer-=dt;
 if(Game.spawnTimer<=0){ Game.spawnTimer=clamp(0.62/density,0.09,1.2);
  const n=Math.random()<0.25*density?2:1;
  for(let i=0;i<n;i++){ const a=freeAsteroid(); if(a) a.spawn(); } }
 Game.collectTimer-=dt;
 if(Game.collectTimer<=0){ Game.collectTimer=rnd(0.85,1.8)/(region.coinRate*(Game.events.active==='gasRush'?2.2:1));
  spawnCollectible();
  if(Math.random()<0.4*region.gasRate) spawnCollectible(); }
 Game.crateTimer-=dt;
 if(Game.crateTimer<=0){ Game.crateTimer=rnd(24,44); const c=freeCollectible(); if(c) c.spawn('crate',SPAWN_Z-rnd(0,60)); }
 Game.relicTimer-=dt;
 if(Game.relicTimer<=0){ Game.relicTimer=rnd(90,180);
  if(Math.random()<0.6){ const c=freeCollectible(); if(c) c.spawn('relic',SPAWN_Z-rnd(0,60));
   pushNotify('RELIC DETECTED',false,true,true); } }
 Game.repairTimer-=dt;
 if(Game.repairTimer<=0){
  Game.repairTimer = rnd(18, 38) * (Game.hull < 60 || Game.engine < 60 ? 0.55 : 1.0);
  const roll=Math.random();
  const t = roll<0.35?'repairkit': roll<0.6?'enginecell': roll<0.85?'nanobots':'emergencycore';
  const c=freeCollectible(); if(c) c.spawn(t, SPAWN_Z-rnd(0,60));
 }
 Game.anomalyTimer-=dt;
 if(Game.anomalyTimer<=0){ Game.anomalyTimer=rnd(70,150); if(Math.random()<0.5) triggerAnomaly(); }
 /* EARTH ORBIT (region 0) is a calm, hazard-free intro zone — no fleets, hunters,
    black holes, gravity wells, encounters or risk zones there. */
 const safeZone = Game.region===0;
 if(!safeZone&&Game.time>45){ Game.hunterTimer-=dt;
  if(Game.hunterTimer<=0){ Game.hunterTimer=rnd(18,32)/(1+Game.difficulty*0.5);
   if(Game.hunters.length<3) Game.hunters.push(spawnHunter()); } }
 if(!safeZone&&!Game.blackHole&&!Game.gravityPlanet&&!Game.encounter&&Game.time>80&&Math.random()<dt*0.010){
  spawnBlackHoleObject(); pushNotify('BLACK HOLE',true); Sound.event(); }
 if(!safeZone&&Game.region>=2){ Game.gravityPlanetTimer-=dt;
  if(Game.gravityPlanetTimer<=0&&!Game.blackHole&&!Game.gravityPlanet&&!Game.encounter){
   spawnGravityPlanet(); Game.gravityPlanetTimer=rnd(55,90); } }
 if(!safeZone&&!Game.encounter&&Game.time>40&&Math.random()<dt*0.008*(1+Game.difficulty*0.4)){
  const kinds=['leviathan','voidhunter','asteroidtitan','solarcolossus','eventhorizon'];
  startEncounter(pick(kinds)); }
 if(!safeZone&&!Game.riskZone&&Game.time>55&&Math.random()<dt*0.010) spawnRiskZone();
 if(!Game.wreck&&!Game.station&&Game.time>30&&Math.random()<dt*0.006){
  if(Math.random()<0.55) spawnWreck(); else spawnStationObject(); }

 if(!safeZone&&Game.time > 20){
  Game.enemySpawnTimer -= dt;
  if(Game.enemySpawnTimer <= 0 && !Game.encounter){
   spawnEnemyWave();
   const base = 22 - Math.min(12, Game.difficulty*4);
   Game.enemySpawnTimer = base + rnd(-3,4);
  }
 }

 Game.transmissionTimer-=dt;
 if(Game.transmissionTimer<=0&&Game.state==='PLAYING'){
  Game.transmissionTimer=rnd(35,75); playRandomTransmission(); }
 if(Game.transmissionDuration>0){ Game.transmissionDuration-=dt;
  if(Game.transmissionDuration<=0) hideTransmission(); }

 const worldSpeed=Game.speed*slowWorld;
 for(const a of pool.asteroids){
  if(!a.active) continue;
  a.mesh.position.z+=worldSpeed*a.speedMul*dt;
  a.mesh.rotation.x+=a.spin.x*dt; a.mesh.rotation.y+=a.spin.y*dt; a.mesh.rotation.z+=a.spin.z*dt;
  if(a.mesh.position.z>40){ a.despawn(); continue; }
  const d=a.mesh.position.distanceTo(rocketPos);
  const hitR=a.radius+0.55;
  if(d<hitR){
   if(Game.invuln>0||Game.shieldActive) handleShieldImpact(a);
   else handleCollision(a);
   continue; }
  if(!a.nearMissed&&d<hitR+1.55&&a.mesh.position.z>-14){ a.nearMissed=true; registerNearMiss(a); } }

 const magnetActive=Game.abilities.magnet>0;
 const magnetRange=magnetActive? 24+SAVE.upgrades.magnet*2.0 : 3.6+SAVE.upgrades.magnet*1.1;
 const magnetStrength=magnetActive? 46 : 11;
 for(const c of pool.collectibles){
  if(!c.active) continue;
  c.group.position.z+=worldSpeed*dt;
  c.group.rotation.y+=c.group.userData.rotSpeed*dt;
  c.group.position.y+=Math.cos(Game.time*2.0+c.phase)*0.004;
  const dx=rocketPos.x-c.group.position.x;
  const dy=rocketPos.y-c.group.position.y;
  const dz=rocketPos.z-c.group.position.z;
  const dist=Math.hypot(dx,dy,dz);
  if(dist<magnetRange && dist>0.01){
   const pull=(1-dist/magnetRange)*magnetStrength*dt;
   c.group.position.x+=dx*pull; c.group.position.y+=dy*pull; c.group.position.z+=dz*pull; }
  if(dist<1.45){ collect(c); continue; }
  if(c.group.position.z>25) c.despawn(); }

 for(let i=Game.hunters.length-1;i>=0;i--){
  const h=Game.hunters[i]; h.life-=dt;
  const target=tmpV.set(rocketPos.x+h.offset.x,rocketPos.y+h.offset.y,rocketPos.z-8);
  h.obj.position.lerp(target,1-Math.exp(-0.9*dt));
  h.obj.position.z+=(worldSpeed*0.75)*dt*0.4;
  h.obj.lookAt(rocketPos.x,rocketPos.y,rocketPos.z);
  h.obj.rotateY(Math.PI);
  if(h.obj.position.distanceTo(rocketPos)<1.7){
   if(Game.shieldActive){ Game.shieldActive=false; Game.abilities.shield=0; h.life=0;
    FX.burst(h.obj.position,0xff2a6a,20,12,0.7,0.8); Sound.shieldHit(); Game.hitShake=0.5; }
   else if(Game.invuln<=0){ handleCollision(h.obj,true,'hunter'); h.life=0; } }
  if(h.life<=0){ scene.remove(h.obj); Game.hunters.splice(i,1); unlockAchievement('escape'); } }

 for(const e of enemyPool){ if(e.active) e.update(dt, worldSpeed); }
 for(const b of bulletPool){ if(b.active){ b.update(dt); } }

 if(Game.blackHole){ const bh=Game.blackHole;
  bh.life-=dt; bh.obj.position.z+=worldSpeed*0.32*dt; bh.obj.rotation.y+=dt*0.35;
  for(const a of pool.asteroids){ if(!a.active) continue;
   const d=a.mesh.position.distanceTo(bh.obj.position);
   if(d<26){ const dir=tmpV2.copy(bh.obj.position).sub(a.mesh.position).normalize();
    a.mesh.position.addScaledVector(dir,18*dt); a.mesh.rotation.y+=dt*4; a.mesh.scale.multiplyScalar(1-dt*0.5);
    if(d<6||a.mesh.scale.x<0.1){ FX.burst(a.mesh.position,0x9a3aff,10,8,0.4,0.5); a.despawn(); } } }
  if(bh.life<=0||bh.obj.position.z>60){ scene.remove(bh.obj); Game.blackHole=null; el.bhTint.style.opacity='0'; unlockAchievement('bhs'); } }

 if(Game.gravityPlanet){ const gp=Game.gravityPlanet;
  gp.mesh.position.z+=worldSpeed*0.4*dt; gp.atmo.position.copy(gp.mesh.position); gp.mesh.rotation.y+=dt*0.1;
  if(gp.mesh.position.z>60){ scene.remove(gp.mesh); scene.remove(gp.atmo); Game.gravityPlanet=null; el.gravTint.style.opacity='0'; } }

 updateEncounter(dt,worldSpeed);
 updateRiskZone(dt,worldSpeed);
 updateWreck(dt,worldSpeed);
 updateStation(dt,worldSpeed);

 if(Game.hitShake>0) Game.hitShake=Math.max(0,Game.hitShake-dt*1.8);
 if(Game.cinematic>0) Game.cinematic-=dt;
 if(Game.regionTime>Game.regionLength&&!Game.routeShown&&!Game.secretRegion&&Game.region<REGIONS.length-1){
  Game.routeShown=true; showRouteSelection(); }
 if(Game.invuln>0) Game.invuln-=dt;

 if(!Game.ghostPath) Game.ghostPath=[];
 Game._ghostTick=(Game._ghostTick||0)+dt;
 if(Game._ghostTick>0.1&&Game.ghostPath.length<900){ Game._ghostTick=0;
  Game.ghostPath.push({t:Game.time,x:rocketPos.x,y:rocketPos.y}); }

 if(Game.legendary&&Game.state==='PLAYING'){
  el.legendaryTint.style.opacity=String(0.6+Math.abs(Math.sin(Game.time*0.8))*0.25); }

 Game._audioTick=(Game._audioTick||0)+dt;
 if(Game._audioTick>=0.24){
  Game._audioTick=0;
  const activeEnemies=enemyPool.reduce((n,e)=>n+(e.active?1:0),0);
  const threat=clamp(activeEnemies*0.11+(Game.encounter?0.28:0)+(Game.events.active?0.10:0)+(Game.fuel/Game.fuelMax<0.18?0.18:0)+(Game.hull/Game.hullMax<0.28?0.16:0)+(Game.region>=6?0.12:0),0,1);
  Sound.setThreat(threat);
 }
 if(!Game._modeComplete){
  if(Game.mode==='timetrial'&&Game.distance>=10000){ Game._modeComplete=true; Game.finalModeTime=Game.time; return endRun('TIME TRIAL COMPLETE'); }
  if(Game.mode==='asteroidtrial'&&Game.runStats.dodges>=200){ Game._modeComplete=true; return endRun('ASTEROID TRIAL COMPLETE'); }
  if(Game.mode==='fueltrial'&&Game.distance>=5000){ Game._modeComplete=true; return endRun('FUEL TRIAL COMPLETE'); }
 }

 hudAcc+=dt; if(hudAcc>=0.1){ hudAcc=0; updateHUD(); }
}

