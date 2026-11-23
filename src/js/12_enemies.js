/* ========== ENEMIES ========== */
const ENEMY_DEFS={
 scout:{hp:1,speed:1.15,fireRate:2.0,fireDelay:1.5,color:0xff5a3c,size:0.55,backward:false,holdAdvance:false},
 interceptor:{hp:2,speed:1.05,fireRate:1.1,fireDelay:1.0,color:0xff2a6a,size:0.75,backward:true,holdAdvance:true},
 guardian:{hp:5,speed:0.62,fireRate:1.9,fireDelay:2.0,color:0x9a5aff,size:1.25,backward:false,holdAdvance:false},
 hunter:{hp:3,speed:0.95,fireRate:1.5,fireDelay:1.4,color:0xffaa3a,size:0.85,backward:true,holdAdvance:true,homing:true},
 kamikaze:{hp:1,speed:1.4,fireRate:99,fireDelay:99,color:0xff2020,size:0.6,backward:false,kamikaze:true},
 drone:{hp:1,speed:1.0,fireRate:2.5,fireDelay:2.5,color:0xff88aa,size:0.4,backward:false}
};
function buildEnemyMesh(kind){
 const def=ENEMY_DEFS[kind]; const g=new THREE.Group();
 const bodyMat=new THREE.MeshStandardMaterial({color:def.color,metalness:0.9,roughness:0.28,emissive:def.color,emissiveIntensity:0.7,envMapIntensity:1.4});
 const darkMat=new THREE.MeshStandardMaterial({color:0x1a0a14,metalness:0.95,roughness:0.3,envMapIntensity:1.2});
 if(kind==='guardian'){
  const body=new THREE.Mesh(new THREE.OctahedronGeometry(1.1,0),bodyMat); body.scale.set(1.5,0.7,2.2); g.add(body);
  for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.BoxGeometry(2.2,0.3,1.4),darkMat);
   w.position.set(s*1.7,0,0.2); g.add(w);
   const p=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6),bodyMat); p.position.set(s*2.7,0,0.2); g.add(p); }
  const eye=new THREE.Mesh(new THREE.SphereGeometry(0.35,10,8),new THREE.MeshBasicMaterial({color:0xffffff}));
  eye.position.set(0,0,-2.2); g.add(eye);
 } else if(kind==='interceptor'){
  const body=new THREE.Mesh(new THREE.ConeGeometry(0.5,1.8,6),bodyMat); body.rotation.x=-Math.PI/2; body.position.z=0.3; g.add(body);
  for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.BoxGeometry(1.5,0.1,0.7),bodyMat);
   w.position.set(s*1.0,0,0.8); w.rotation.z=s*-0.2; g.add(w); }
  const eye=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));
  eye.position.set(0,0.15,-0.8); g.add(eye);
 } else if(kind==='hunter'){
  const body=new THREE.Mesh(new THREE.OctahedronGeometry(0.7,0),bodyMat); body.scale.set(1.3,0.6,2.0); g.add(body);
  for(const s of [-1,1]){ const spike=new THREE.Mesh(new THREE.ConeGeometry(0.35,2.0,5),darkMat);
   spike.position.set(s*0.9,0,-0.3); spike.rotation.z=s*1.2; spike.rotation.x=Math.PI/2; g.add(spike); }
  const eye=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),new THREE.MeshBasicMaterial({color:0xff2200}));
  eye.position.z=-1.4; g.add(eye);
 } else if(kind==='kamikaze'){
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.55,10,8),bodyMat); body.scale.set(1,0.7,1.6); g.add(body);
  for(let i=0;i<6;i++){ const spike=new THREE.Mesh(new THREE.ConeGeometry(0.1,0.5,5),darkMat);
   const a=(i/6)*TAU; spike.position.set(Math.cos(a)*0.5,0,Math.sin(a)*0.5); spike.rotation.z=-a; g.add(spike); }
  const core=new THREE.Mesh(new THREE.SphereGeometry(0.25,8,6),new THREE.MeshBasicMaterial({color:0xff2200}));
  core.position.z=-0.9; g.add(core);
 } else if(kind==='drone'){
  const body=new THREE.Mesh(new THREE.SphereGeometry(0.4,8,6),bodyMat); g.add(body);
  for(let i=0;i<4;i++){ const a=(i/4)*TAU; const arm=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.05,0.8),darkMat);
   arm.position.set(Math.cos(a)*0.4,0,Math.sin(a)*0.4); arm.rotation.y=-a; g.add(arm); }
  const eye=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));
  eye.position.z=-0.5; g.add(eye);
 } else {
  const body=new THREE.Mesh(new THREE.ConeGeometry(0.4,1.2,6),bodyMat); body.rotation.x=-Math.PI/2; g.add(body);
  for(const s of [-1,1]){ const w=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.08,0.5),bodyMat);
   w.position.set(s*0.55,0,0.4); w.rotation.z=s*-0.3; g.add(w); }
  const eye=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),new THREE.MeshBasicMaterial({color:0xffdd44}));
  eye.position.set(0,0.1,-0.5); g.add(eye);
 }
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowR,color:def.color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.75}));
 glow.scale.set(def.size*4.5,def.size*4.5,1); g.add(glow);
 
 g.scale.setScalar(def.size*1.4);
 return g;
}
class Enemy{
 constructor(){ this.obj=null; this.kind='scout'; this.hp=1; this.maxHp=1; this.def=null;
  this.active=false; this.fireTimer=1.5; this.pos=new THREE.Vector3(); this.vel=new THREE.Vector3();
  this.drift=0; this.state='approach'; this.lockWarned=false; }
 spawn(kind,x,y,z){
  this.kind=kind; this.def=ENEMY_DEFS[kind]; this.hp=this.maxHp=this.def.hp;
  if(this.obj){ scene.remove(this.obj); disposeGroup(this.obj); }
  this.obj=buildEnemyMesh(kind);
  this.obj.position.set(x,y,z); this.pos.copy(this.obj.position);
  this.obj.rotation.y=Math.PI;
  this.active=true; this.fireTimer=this.def.fireDelay + Math.random()*0.5;
  this.drift=(Math.random()<0.5?-1:1) * rnd(0.4,1.2); this.lockWarned=false;
  this.state = this.def.holdAdvance ? 'hold' : 'approach';
  scene.add(this.obj);
  if(!SAVE.enemies.typesSeen[kind]){
   SAVE.enemies.typesSeen[kind]=1;
   discover('enemies',kind.toUpperCase(),{bonus:150});
   persist();
  }
 }
 update(dt, worldSpeed){
  if(!this.active) return;
  const def=this.def;
  this.pos.y += Math.sin(Game.time*1.3 + this.drift*3)*0.4*dt;
  this.pos.x += this.drift*0.3*dt;
  this.pos.x = clamp(this.pos.x, -BOUND_X+0.6, BOUND_X-0.6);
  this.pos.y = clamp(this.pos.y, -BOUND_Y+0.6, BOUND_Y-0.6);
  if(this.state==='approach'){
   this.pos.z -= worldSpeed * def.speed * 0.35 * dt;
   if(this.pos.z < SPAWN_Z*0.35) this.state='hold';
  } else if(this.state==='hold'){
   const targetZ = -70;
   const targetX = rocketPos.x*0.4 + this.drift*2.5;
   const targetY = rocketPos.y*0.5 + Math.sin(Game.time*0.7)*1.5;
   this.pos.x = damp(this.pos.x, targetX, 0.9, dt);
   this.pos.y = damp(this.pos.y, targetY, 1.1, dt);
   this.pos.z = damp(this.pos.z, targetZ, 1.5, dt);
  } else if(this.state==='kamikaze'){
   const dir = new THREE.Vector3().copy(rocketPos).sub(this.pos);
   const d = dir.length();
   if(d > 0.1){ dir.normalize(); this.pos.addScaledVector(dir, 26*dt); }
  }
  this.pos.z += worldSpeed * 0.7 * dt;
  this.obj.position.copy(this.pos);
  this.obj.lookAt(rocketPos.x, rocketPos.y, rocketPos.z);
  this.obj.rotateY(Math.PI);
  if(def.kamikaze){
   if(this.state!=='kamikaze' && this.pos.z > -60 && this.pos.z < -10) this.state='kamikaze';
  } else {
   this.fireTimer -= dt;
   if(this.fireTimer <= 0.42 && !this.lockWarned){
    this.lockWarned=true; Sound.lockOn();
    if(Math.random()<0.32) showAmbRight('WEAPON LOCK','Incoming volley — evade or time your shield.');
   }
   if(this.fireTimer <= 0){
    this.fireTimer = def.fireRate + rnd(-0.2,0.3); this.lockWarned=false;
    fireEnemyBullet(this);
   }
  }
  if(this.pos.distanceTo(rocketPos) < 1.4){
   if(Game.shieldActive || Game.invuln > 0){ this.damage(99); }
   else if(def.kamikaze){ handleCollision(null, true, 'kamikaze'); this.damage(99); }
   else { handleCollision(null, true, 'enemy'); this.damage(99); }
  }
  if(this.pos.z > 40){ this.despawn(); }
 }
 damage(n){
  this.hp -= n;
  if(this.hp <= 0){ onEnemyKilled(this); this.despawn(); }
 }
 despawn(){
  if(this.obj){ scene.remove(this.obj); disposeGroup(this.obj); this.obj=null; }
  this.active=false;
 }
}

