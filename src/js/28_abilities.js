/* ========== ABILITIES ========== */
function activateAbility(key){
 if(Game.state!=='PLAYING') return;
 if(Game.charges[key]<=0){ Sound.blip(200,0.1,'square',0.1); return; }
 if(Game.abilities[key]>0&&key!=='boost') return;
 Game.charges[key]--; Game.chargeTimers[key]=0;
 switch(key){
  case 'boost':
   Game.abilities.boost=computeStats().boostDur;
   Game.hitShake=Math.max(Game.hitShake,0.28);
   Sound.boostIgnite();
   FX.ring(rocketPos,0x3ae9ff,8,0.5);
   FX.ring(rocketPos,0xa9f7ff,5.5,0.34);
   if(window.HyperFX) HyperFX.trigger();
   ScreenFX.pulse();
   pushNotify('HYPERDRIVE ENGAGED','AFTERBURNERS AT MAXIMUM',false,false,true);
   break;
  case 'shield':
   Game.shieldActive=true; Game.shieldEnergy=Game.shieldMax; Game.shieldParry=0.42;
   Game.abilities.shield=computeStats().shieldDur;
   Sound.shieldOn(); break;
  case 'magnet': Game.abilities.magnet=6.5; Sound.magnet(); break;
  case 'slow': Game.abilities.slow=5.0; Sound.slow(); break;
  case 'blast': doBlast(); Game.abilities.blast=0.4; break;
 }
 updateAbilityHUD();
}
function doBlast(){
 const R=computeStats().blastRadius;
 Sound.blast();
 Game.hitShake=Math.max(Game.hitShake,0.65);
 FX.ring(rocketPos,0x9df4ff,R*1.4,0.85); FX.ring(rocketPos,0x3ae9ff,R*1.1,0.65);
 FX.burst(rocketPos,0x9df4ff,26,16,0.6,0.75);
 flashScreen(0.35,'rgba(160,240,255,');
 for(const a of pool.asteroids){ if(!a.active) continue;
  const d=a.mesh.position.distanceTo(rocketPos);
  if(d<R){ FX.burst(a.mesh.position,0xffaa55,10,9,0.45*a.mesh.scale.x,0.6); a.despawn();
   Game.scoreFloat+=40*Game.mult; Game.runStats.dodges++; }
  else if(d<R*1.8){ const dir=a.mesh.position.clone().sub(rocketPos).normalize();
   a.mesh.position.addScaledVector(dir,6); a.speedMul*=-0.4; } }
 for(const b of bulletPool){ if(!b.active) continue;
  if(b.obj.position.distanceTo(rocketPos) < R){
   FX.burst(b.obj.position, 0x9df4ff, 6, 4, 0.3, 0.4);
   b.despawn();
  } }
 for(const e of enemyPool){ if(!e.active) continue;
  const d=e.pos.distanceTo(rocketPos);
  if(d<R*0.9){ e.damage(3); } }
 for(const h of Game.hunters){ const d=h.obj.position.distanceTo(rocketPos);
  if(d<R*1.4){ h.life=0; FX.burst(h.obj.position,0xff2a6a,18,12,0.7,0.8); } }
 if(Game.encounter&&Game.encounter.kind==='voidhunter') Game.encounter.life=Math.min(Game.encounter.life,3);
}
function togglePause(){ if(Game.state==='PLAYING') pauseGame(); else if(Game.state==='PAUSED') resumeGame(); }
function pauseGame(){
 if(Game.state!=='PLAYING') return;
 if(Game.photoMode){ Game.photoMode=false;
  document.getElementById('photoBtn').classList.add('off');
  document.getElementById('photoControls').classList.remove('on'); }
 Game.state='PAUSED'; Sound.setEngine(0);
 const ov=document.getElementById('overlay'); ov.classList.remove('hidden');
 ov.innerHTML=`<div class="screen">
  <div class="section-title">PAUSED</div>
  <div class="stats-grid" style="max-width:660px">
   <div class="card stat-box"><div class="k">SCORE</div><div class="v">${Math.floor(Game.score)}</div></div>
   <div class="card stat-box"><div class="k">DISTANCE</div><div class="v">${Math.floor(Game.distance)}m</div></div>
   <div class="card stat-box"><div class="k">REGION</div><div class="v" style="font-size:13px">${Game.secretRegion?SECRET_REGIONS[Game.secretRegion].short:REGIONS[Game.region].short}</div></div>
   <div class="card stat-box"><div class="k">HULL</div><div class="v">${Math.floor(Game.hull)}%</div></div>
   <div class="card stat-box"><div class="k">ENGINE</div><div class="v">${Math.floor(Game.engine)}%</div></div>
   <div class="card stat-box"><div class="k">MULTIPLIER</div><div class="v">x${Game.mult}</div></div>
   <div class="card stat-box"><div class="k">KILLS</div><div class="v">${Game.runStats.enemiesKilled||0}</div></div>
   <div class="card stat-box"><div class="k">DISCOVERIES</div><div class="v">${Game.runStats.discoveries}</div></div>
  </div>
  <div class="row">
   <div class="btn primary" id="pResume">RESUME</div>
   <div class="btn" id="pDrone">DRONE: ${SAVE.settings.dronesActive?'ON':'OFF'}</div>
   <div class="btn" id="pPhoto">PHOTO MODE</div>
   <div class="btn" id="pQuit">ABANDON RUN</div>
  </div>
  <div class="row" style="margin-top:8px">
   <div class="btn" id="pSaver">BATTERY SAVER: ${SAVE.settings.saver?'ON':'OFF'}</div>
   <div class="btn" id="pPerf">FPS INFO: ${Perf.show?'ON':'OFF'}</div>
  </div></div>`;
 ov.querySelector('#pResume').onclick=resumeGame;
 ov.querySelector('#pDrone').onclick=(e)=>{ toggleDrone(); e.target.textContent='DRONE: '+(SAVE.settings.dronesActive?'ON':'OFF'); };
 ov.querySelector('#pPhoto').onclick=()=>{ resumeGame(); togglePhotoMode(); };
 ov.querySelector('#pSaver').onclick=(e)=>{ Perf.setSaver(!SAVE.settings.saver); e.target.textContent='BATTERY SAVER: '+(SAVE.settings.saver?'ON':'OFF'); };
 ov.querySelector('#pPerf').onclick=(e)=>{ Perf.toggleInfo(); e.target.textContent='FPS INFO: '+(Perf.show?'ON':'OFF'); };
 ov.querySelector('#pQuit').onclick=()=>{ ov.innerHTML=''; ov.classList.add('hidden');
  Game.state='MENU'; document.getElementById('hud').classList.add('hidden'); showMenu(); };
}
function resumeGame(){
 if(Game.state!=='PAUSED') return;
 Game.state='PLAYING';
 const ov=document.getElementById('overlay'); ov.classList.add('hidden'); ov.innerHTML='';
 Sound.resume();
}

