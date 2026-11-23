/* ========== COLLISION ========== */
function handleCollision(obj,isHunter,type){
 const stats=computeStats();
 const dmgMul = 1/stats.hullMul;
 Game.noCollisionRun=false;
 Game.runStats.hits++;
 const def=getRocketDef(SAVE.selectedRocket);
 if(def.revive&&!Game.reviveUsed&&Game.hull<50){
  Game.reviveUsed=true; Game.invuln=2.5; Game.hitShake=0.8;
  Game.hull=Math.max(Game.hull,50);
  FX.ring(rocketPos,0xff8a2b,18,1.0); FX.burst(rocketPos,0xff8a2b,30,14,0.8,1.0);
  pushNotify('PHOENIX REBORN'); Sound.shieldHit();
  if(obj&&obj.despawn) obj.despawn();
  return;
 }
 Game.combo=1; Game.chain=0; el.chainDisplay.classList.remove('on');
 Game.mult=Math.max(1,Game.mult-1); Game.comboTimer=0;
 let hullDmg=8, engDmg=2;
 if(type==='kamikaze'){ hullDmg=18; engDmg=6; }
 else if(type==='enemy'){ hullDmg=10; engDmg=3; }
 else if(type==='hunter'){ hullDmg=12; engDmg=4; }
 if(obj&&obj.radius!==undefined){
  if(obj.radius<1) { hullDmg=1; engDmg=0; }
  else if(obj.radius<2) { hullDmg=3; engDmg=1; }
  else if(obj.radius<4) { hullDmg=6; engDmg=2; }
  else { hullDmg=10; engDmg=4; }
 }
 hullDmg*=dmgMul; engDmg*=dmgMul;
 Game.hull=Math.max(0,Game.hull-hullDmg);
 Game.engine=Math.max(0,Game.engine-engDmg);
 Game.hitShake=0.75;
 flashScreen(0.55,'rgba(255,60,60,');
 FX.burst(rocketPos,0xff6a3a,22,12,0.7,0.85);
 FX.ring(rocketPos,0xff4a4a,10,0.6);
 Sound.hit();
 if(obj&&obj.despawn) obj.despawn();
 else if(obj&&obj.visible!==undefined) obj.visible=false;
 Game.invuln=1.4;
 if(Game.hull<=0) endRun('HULL DESTROYED');
}
function handleShieldImpact(a){
 if(Game.shieldActive){
  Game.shieldEnergy-=a.radius*6;
  Sound.shieldHit(); Game.hitShake=0.35;
  flashScreen(0.2,'rgba(90,220,255,');
  FX.ring(rocketPos,0x3ae9ff,8,0.4);
  FX.burst(rocketPos,0x9df4ff,14,9,0.5,0.55);
  if(Game.shieldEnergy<=0){
   Game.shieldActive=false; Game.abilities.shield=0;
   pushNotify('SHIELD BREACHED',true,false,true);
  }
  if(a) a.despawn();
 } else if(Game.invuln>0){ if(a) a.despawn(); }
 updateAbilityHUD();
}
function registerNearMiss(a){
 Game.runStats.nearMisses++; Game.runStats.dodges++;
 Game.combo++; Game.maxCombo=Math.max(Game.maxCombo,Game.combo);
 Game.comboTimer=3.0;
 const wantMult=clamp(1+Math.floor(Game.combo/3),1,5);
 if(wantMult>Game.mult){ Game.mult=wantMult; Game.maxMult=Math.max(Game.maxMult,Game.mult);
  pushNotify('MULTIPLIER x'+Game.mult); }
 const bonus=8*Game.combo*Game.mult;
 Game.scoreFloat+=bonus;
 Sound.nearMiss();
 if(Game.combo%3===0) Sound.combo(Game.combo);
 const d=a.mesh.position.distanceTo(rocketPos);
 if(d<a.radius+1.0){
  popup('PERFECT +'+Math.floor(bonus*3),screenX(a.mesh.position),screenY(a.mesh.position),'#7ef2ff');
  FX.ring(rocketPos,0x7ef2ff,7,0.45);
  flashScreen(0.18,'rgba(120,240,255,');
  Game.scoreFloat+=bonus*2; unlockAchievement('perfect');
 } else if(d<a.radius+1.35){
  popup('INSANE DODGE +'+Math.floor(bonus*1.5),screenX(a.mesh.position),screenY(a.mesh.position),'#b46cff');
 }
 if(Game.combo>=5) unlockAchievement('perfect');
 if(Game.mult>=5) unlockAchievement('x5');
}

