/* ========== BULLETS ========== */
class Bullet{
 constructor(){ this.obj=null; this.active=false; this.vel=new THREE.Vector3(); this.life=0; this.owner=null; this.nearMissed=false; }
 spawn(pos, vel, color=0xff2200, size=0.22, owner=null){
  if(this.obj) scene.remove(this.obj);
  const geo=new THREE.SphereGeometry(size,8,6);
  const mat=new THREE.MeshBasicMaterial({color});
  this.obj=new THREE.Mesh(geo,mat);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowR,color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.9}));
  glow.scale.set(1.2,1.2,1); this.obj.add(glow);
  this.obj.position.copy(pos);
  scene.add(this.obj);
  this.vel.copy(vel); this.active=true; this.life=2.5; this.owner=owner; this.nearMissed=false;
 }
 update(dt){
  if(!this.active) return;
  this.life-=dt;
  this.obj.position.addScaledVector(this.vel, dt);
  const d=this.obj.position.distanceTo(rocketPos);
  if(d < 0.9){
   if(Game.shieldActive){ onShieldBlockBullet(this.obj.position,this); }
   else if(Game.invuln <= 0){ onBulletHitPlayer(this.obj.position); }
   this.despawn(); return;
  }
  if(!this.nearMissed && d<2.15 && d>0.9 && this.obj.position.z>-18){
   this.nearMissed=true; onBulletNearMiss(this.obj.position,this);
  }
  if(this.life <= 0 || this.obj.position.z > 40 || this.obj.position.z < -300){ this.despawn(); }
 }
 despawn(){
  if(this.obj){ scene.remove(this.obj); disposeGroup(this.obj); this.obj=null; }
  this.active=false; this.owner=null;
 }
}
const bulletPool=[];
const enemyPool=[];
function getEnemyBullet(){ return bulletPool.find(b=>!b.active); }
function getEnemy(){ return enemyPool.find(e=>!e.active); }
function fireEnemyBullet(enemy){
  if(!enemy||!enemy.active) return;
  const start=enemy.pos.clone();
  const aim=rocketPos.clone().sub(start).normalize();
  const shots=[];
  // Each enemy class has a readable signature attack: single, twin, fan or heavy volley.
  if(enemy.kind==='guardian') shots.push([-0.22,0,34], [0,0,38], [0.22,0,34]);
  else if(enemy.kind==='drone') shots.push([-0.15,0,39],[0.15,0,39]);
  else if(enemy.kind==='hunter') shots.push([-0.18,-0.05,43],[0,0,45],[0.18,0.05,43]);
  else if(enemy.kind==='interceptor') shots.push([-0.06,0,48],[0.06,0,48]);
  else shots.push([rnd(-0.10,0.10),rnd(-0.08,0.08),42]);
  let fired=0;
  for(const [sx,sy,speed] of shots){
   const b=getEnemyBullet(); if(!b) break;
   const dir=aim.clone(); dir.x+=sx; dir.y+=sy; dir.normalize().multiplyScalar(speed);
   b.spawn(start,dir,enemy.def.color,enemy.kind==='guardian'?0.25:0.20,enemy); fired++;
  }
  if(fired) Sound.bulletFire(enemy.kind);
}
function onBulletHitPlayer(pos){
  FX.burst(pos, 0xff6a3a, 12, 8, 0.5, 0.6);
  flashScreen(0.35, 'rgba(255,80,80,');
  Game.hitShake = Math.max(Game.hitShake, 0.45);
  Game.hull = Math.max(0, Game.hull - 3);
  Game.engine = Math.max(0, Game.engine - 1);
  Sound.bulletHit();
  Game.chain = 0;
  Game.combo = Math.max(1, Game.combo - 1);
  if(Game.hull <= 0) endRun('HULL DESTROYED');
}
function onShieldBlockBullet(pos,bullet){
  const perfect=Game.shieldParry>0;
  FX.burst(pos, perfect?0xfff0a0:0x3ae9ff, perfect?18:10, perfect?13:8, 0.5, 0.5);
  FX.ring(pos, perfect?0xffe58a:0x3ae9ff, perfect?8:4, 0.3);
  if(perfect){
   Game.shieldParry=0; Game.runStats.perfectParries=(Game.runStats.perfectParries||0)+1;
   Game.runStats.bulletsDodged=(Game.runStats.bulletsDodged||0)+1;
   Game.scoreFloat+=260*Game.mult; Game.combo++; Game.maxCombo=Math.max(Game.maxCombo,Game.combo); Game.comboTimer=3.0;
   Game.mult=clamp(1+Math.floor(Game.combo/3),1,5); Game.maxMult=Math.max(Game.maxMult,Game.mult);
   Sound.parry(); pushNotify('PERFECT PARRY',false,true,true);
   popup('REFLECT +'+Math.floor(260*Game.mult),screenX(pos),screenY(pos),'#ffe9a8');
   if(bullet&&bullet.owner&&bullet.owner.active) bullet.owner.damage(1);
   Game.chain++; Game.chainTimer=2.6;
  } else Sound.shieldHit();
  Game.shieldEnergy = Math.max(0, Game.shieldEnergy - (perfect?5:12));
  if(Game.shieldEnergy <= 0){
   Game.shieldActive = false; Game.abilities.shield = 0;
   pushNotify('SHIELD BREACHED', true, false, true);
  }
  updateAbilityHUD();
}
function onBulletNearMiss(pos,bullet){
  Game.runStats.bulletsDodged=(Game.runStats.bulletsDodged||0)+1;
  Game.runStats.dodges++; Game.bulletDodgeStreak=(Game.bulletDodgeStreak||0)+1; Game.bulletStreakTimer=2.8;
  Game.combo++; Game.maxCombo=Math.max(Game.maxCombo,Game.combo); Game.comboTimer=2.8;
  Game.mult=clamp(1+Math.floor(Game.combo/3),1,5); Game.maxMult=Math.max(Game.maxMult,Game.mult);
  const bonus=Math.round((45+Math.min(12,Game.bulletDodgeStreak)*12)*Game.mult);
  Game.scoreFloat+=bonus; Sound.bulletWhiz();
  if(Game.bulletDodgeStreak%3===0){Sound.combo(Game.bulletDodgeStreak);pushNotify('BULLET DANCER ×'+Game.bulletDodgeStreak,false,false,true);}
  popup('BULLET DODGE +'+bonus,screenX(pos),screenY(pos),'#ff91d7');
  FX.burst(pos,0xff91d7,5,4,0.22,0.32);
  if(Game.runStats.bulletsDodged>=20) unlockAchievement('bulletdance');
}
function onEnemyKilled(enemy){
  const pos=enemy.obj?enemy.obj.position.clone():enemy.pos.clone();
  FX.burst(pos, enemy.def.color, 22, 14, 0.7, 0.85);
  FX.ring(pos, enemy.def.color, 8, 0.5);
  Game.scoreFloat += 250 * Game.mult;
  Game.runStats.enemiesKilled = (Game.runStats.enemiesKilled||0) + 1;
  SAVE.enemies.totalKilled = (SAVE.enemies.totalKilled||0) + 1;
  Sound.enemyDestroy();
  popup('+' + Math.floor(250*Game.mult), screenX(pos), screenY(pos), '#ffaa55');
  if(Math.random() < 0.38){
   const c=freeCollectible();
   if(c){
    let drop;
    if(Game.hull<45 && Game.engine<45 && Math.random()<0.45) drop='nanobots';
    else if(Game.hull<68 && Math.random()<0.45) drop='repairkit';
    else if(Game.engine<70 && Math.random()<0.5) drop='enginecell';
    else drop=Math.random()<0.48?'coin':'gas';
    c.spawn(drop,pos.z);
   }
  }
}

