/* ========== CO-PILOT DRONE ========== */
const _dbV=new THREE.Vector3();
class DroneBolt{
 constructor(){ this.obj=null; this.active=false; this.life=0; this.target=null; }
 spawn(pos,target){
  if(this.obj) scene.remove(this.obj);
  const geo=new THREE.SphereGeometry(0.08,6,5);
  const mat=new THREE.MeshBasicMaterial({color:0x7effa0});
  this.obj=new THREE.Mesh(geo,mat);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowW,color:0x7effa0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.9}));
  glow.scale.set(0.85,0.85,1); this.obj.add(glow);
  this.obj.position.copy(pos); scene.add(this.obj);
  this.target=target; this.active=true; this.life=1.4;
 }
 update(dt){
  if(!this.active) return;
  if(!this.target||!this.target.active){ this.despawn(); return; }
  const dir=_dbV.copy(this.target.pos).sub(this.obj.position); const d=dir.length();
  if(d<0.65){ this.target.damage(1); FX.burst(this.obj.position,0x7effa0,7,6,0.32,0.45); Sound.counter(); this.despawn(); return; }
  dir.normalize(); this.obj.position.addScaledVector(dir,42*dt);
  this.life-=dt; if(this.life<=0) this.despawn();
 }
 despawn(){ if(this.obj){ scene.remove(this.obj); this.obj=null; } this.active=false; this.target=null; }
}
const droneBoltPool=[]; for(let i=0;i<6;i++) droneBoltPool.push(new DroneBolt());
function getDroneBolt(){ return droneBoltPool.find(b=>!b.active); }

let droneEscort=null, droneFireTimer=0.6;
function buildDroneEscort(){
 const g=new THREE.Group();
 const body=new THREE.Mesh(new THREE.OctahedronGeometry(0.15,0),
  new THREE.MeshStandardMaterial({color:0x7effa0,emissive:0x2a6b40,emissiveIntensity:1.5,metalness:0.7,roughness:0.28}));
 g.add(body);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(0.21,0.018,6,16),new THREE.MeshBasicMaterial({color:0x7effa0}));
 ring.rotation.x=Math.PI/2; g.add(ring);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowW,color:0x7effa0,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.5}));
 glow.scale.set(0.7,0.7,1); g.add(glow);
 g.visible=false; scene.add(g); return g;
}
function updateDrone(dt){
 if(!droneEscort) droneEscort=buildDroneEscort();
 for(const b of droneBoltPool) b.update(dt);
 const on=SAVE.settings.dronesActive && Game.state==='PLAYING';
 droneEscort.visible=on;
 if(!on){ droneFireTimer=0.6; return; }
 Game.droneRepairTimer=(Game.droneRepairTimer||0)-dt;
 if(Game.droneRepairTimer<=0&&(Game.droneRepairUses||0)<2&&(Game.hull<72||Game.engine<72)){
  const beforeH=Game.hull,beforeE=Game.engine;
  if(Game.hull<=Game.engine) Game.hull=Math.min(Game.hullMax,Game.hull+9);
  else Game.engine=Math.min(Game.engineMax,Game.engine+11);
  Game.droneRepairUses=(Game.droneRepairUses||0)+1;Game.droneRepairTimer=48;
  FX.ring(rocketPos,0x7effa0,7,0.55);FX.burst(rocketPos,0x7effa0,10,7,0.35,0.5);
  Sound.droneAssist();pushNotify('CO-PILOT REPAIR',false,false,true);updateHUD();
 }
 const t=Game.time;
 droneEscort.position.set(rocketPos.x+0.85+Math.sin(t*1.6)*0.14, rocketPos.y+0.5+Math.cos(t*1.1)*0.12, rocketPos.z+0.35);
 droneFireTimer-=dt;
 if(droneFireTimer<=0){
  let best=null,bestD=44;
  for(const e of enemyPool){ if(!e.active) continue;
   if(e.kind!=='scout'&&e.kind!=='kamikaze'&&e.kind!=='drone') continue;
   const d=e.pos.distanceTo(rocketPos);
   if(d<bestD){ bestD=d; best=e; } }
  if(best){ const bolt=getDroneBolt(); if(bolt){bolt.spawn(droneEscort.position,best);Sound.droneShot();} droneFireTimer=1.0; }
  else droneFireTimer=0.35;
 }
}

