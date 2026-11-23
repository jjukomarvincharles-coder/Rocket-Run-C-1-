/* ========== ENCOUNTERS ========== */
const ENCOUNTER_DEFS={
 leviathan:{name:'THE LEVIATHAN',dur:22,desc:'A colossal lifeform drifts past. Survive its wake.'},
 voidhunter:{name:'VOID HUNTER',dur:20,desc:'A hunter ship locks on. Outmaneuver it.'},
 asteroidtitan:{name:'ASTEROID TITAN',dur:18,desc:'A massive asteroid shatters around you.'},
 solarcolossus:{name:'SOLAR COLOSSUS',dur:16,desc:'A solar storm engulfs the corridor.'},
 eventhorizon:{name:'EVENT HORIZON',dur:24,desc:'Escape the pull of the singularity.'}
};
function buildLeviathan(){
 const g=new THREE.Group();
 const mat=new THREE.MeshStandardMaterial({color:0x10202e,metalness:0.7,roughness:0.42,emissive:0x4dffd8,emissiveIntensity:0.35,envMapIntensity:1.1});
 const glowMat=new THREE.MeshBasicMaterial({color:0x4dffd8,transparent:true,opacity:0.85,blending:THREE.AdditiveBlending,depthWrite:false});
 for(let i=0;i<10;i++){ const r=Math.max(0.7,2.4-i*0.19);
  const seg=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),mat); seg.position.z=-i*2.6; seg.scale.set(1,0.75,1.35); g.add(seg); }
 const head=new THREE.Mesh(new THREE.SphereGeometry(2.7,16,12),mat); head.position.z=1.6; head.scale.set(1,0.8,1.5); g.add(head);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(0.55,12,10),glowMat); eye.position.set(0,0.5,3.2); g.add(eye);
 const eye2=eye.clone(); eye2.position.set(-1.5,0.3,2.9); g.add(eye2);
 const eye3=eye.clone(); eye3.position.set(1.5,0.3,2.9); g.add(eye3);
 for(const s of [-1,1]){ const fin=new THREE.Mesh(new THREE.ConeGeometry(2.4,5.5,6),mat);
  fin.position.set(s*2.6,0,-1); fin.rotation.z=s*1.2; fin.rotation.x=Math.PI/2; fin.scale.set(1,1,0.35); g.add(fin); }
 const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowC,color:0x4dffd8,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.55}));
 aura.scale.set(38,38,1); aura.position.z=-4; g.add(aura);
  return g; }
function buildVoidHunter(){
 const g=new THREE.Group();
 const mat=new THREE.MeshStandardMaterial({color:0x1a0a24,metalness:0.95,roughness:0.24,emissive:0xff2a6a,emissiveIntensity:0.9,envMapIntensity:1.4});
 const body=new THREE.Mesh(new THREE.OctahedronGeometry(2.6,0),mat); body.scale.set(1.6,0.8,2.4); g.add(body);
 for(const s of [-1,1]){ const wing=new THREE.Mesh(new THREE.ConeGeometry(1.2,5.4,5),mat);
  wing.position.set(s*3.2,0,0.4); wing.rotation.z=s*1.4; wing.rotation.x=Math.PI/2; wing.scale.set(1,1,0.4); g.add(wing); }
 const eye=new THREE.Mesh(new THREE.SphereGeometry(0.75,12,10),new THREE.MeshBasicMaterial({color:0xff2a6a}));
 eye.position.z=-3.0; g.add(eye);
 const aura=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowR,color:0xff2a6a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.7}));
 aura.scale.set(22,22,1); g.add(aura);
  return g; }
function buildAsteroidTitan(){
 const g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(9,1),rockMatDark); core.scale.set(1.1,0.85,1.3); g.add(core);
 for(let i=0;i<10;i++){ const s=new THREE.Mesh(pick(ASTEROID_GEOS),rockMatBase); const sc=rnd(0.8,2.2);
  s.scale.setScalar(sc); s.position.set(rnd(-14,14),rnd(-10,10),rnd(-10,10));
  s.userData.orbit={r:s.position.length(),a:Math.atan2(s.position.y,s.position.x),sp:rnd(0.3,0.8)}; g.add(s); }
  return g; }
function buildSolarColossus(){
 const g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(14,24,18),new THREE.MeshBasicMaterial({color:0xffd45a})); g.add(core);
 const corona=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowY,color:0xffd45a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.85}));
 corona.scale.set(90,90,1); g.add(corona);
 const ring=new THREE.Mesh(new THREE.RingGeometry(16,26,64,1),
  new THREE.MeshBasicMaterial({color:0xff9a3a,transparent:true,opacity:0.35,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
 ring.rotation.x=Math.PI/2.4; g.add(ring);
  return g; }
function buildEventHorizon(){
 const g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(7.5,26,18),new THREE.MeshBasicMaterial({color:0x000000})); g.add(core);
 const disk=new THREE.Mesh(new THREE.RingGeometry(9,20,64,1),
  new THREE.MeshBasicMaterial({color:0x9a3aff,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 disk.rotation.x=Math.PI/2.3; g.add(disk);
 const disk2=new THREE.Mesh(new THREE.RingGeometry(11,25,64,1),
  new THREE.MeshBasicMaterial({color:0x39e9ff,transparent:true,opacity:0.32,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 disk2.rotation.x=Math.PI/2.3; g.add(disk2);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowC,color:0x9a3aff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.8}));
 halo.scale.set(64,64,1); g.add(halo);
 g.userData.disk=disk; g.userData.disk2=disk2; return g; }
const ENCOUNTER_BUILDERS={leviathan:buildLeviathan,voidhunter:buildVoidHunter,asteroidtitan:buildAsteroidTitan,solarcolossus:buildSolarColossus,eventhorizon:buildEventHorizon};
function startEncounter(kind){
 if(Game.encounter) return;
 const def=ENCOUNTER_DEFS[kind]; const obj=ENCOUNTER_BUILDERS[kind]();
 if(kind==='leviathan'){ obj.position.set(rnd(16,28)*(Math.random()<0.5?-1:1),rnd(-6,6),SPAWN_Z-60); obj.rotation.y=Math.PI/2*(obj.position.x>0?1:-1); }
 else if(kind==='voidhunter'){ obj.position.set(rnd(-BOUND_X,BOUND_X),rnd(-BOUND_Y,BOUND_Y),SPAWN_Z-30); }
 else if(kind==='asteroidtitan'){ obj.position.set(rnd(-4,4),rnd(-2,2),SPAWN_Z-80); }
 else if(kind==='solarcolossus'){ obj.position.set(rnd(-20,20),rnd(-10,10),SPAWN_Z-200); }
 else { obj.position.set(rnd(-14,14),rnd(-6,6),SPAWN_Z-140); }
 scene.add(obj);
 Game.encounter={kind,def,obj,life:def.dur,max:def.dur,hitCooldown:0};
 pushNotify(def.name, kind==='eventhorizon'||kind==='voidhunter');
 Sound.encounter(); Sound.setThreat(0.9); Game.runStats.encounters++; SAVE.stats.encounters++;
 discover('encounters',def.name,{bonus:400});
 if(kind==='leviathan') discover('aliens','THE LEVIATHAN',{bonus:600});
 playCinematic(def.name,def.desc,3.0);
}
function updateEncounter(dt,worldSpeed){
 if(!Game.encounter) return;
 const e=Game.encounter; e.life-=dt;
 switch(e.kind){
  case 'leviathan': e.obj.position.z+=worldSpeed*0.55*dt; e.obj.position.y+=Math.sin(Game.time*0.7)*0.9*dt;
   e.obj.rotation.y+=dt*0.08; e.obj.rotation.z=Math.sin(Game.time*0.6)*0.08;
   if(Math.random()<dt*3){ const a=freeAsteroid(); if(a) a.spawn(); } break;
  case 'voidhunter': { const tgt=tmpV.set(rocketPos.x*0.8,rocketPos.y*0.8,rocketPos.z-12);
   e.obj.position.lerp(tgt,1-Math.exp(-1.2*dt));
   e.obj.lookAt(rocketPos.x,rocketPos.y,rocketPos.z); e.obj.rotateY(Math.PI);
   e.obj.rotation.z=Math.sin(Game.time*3)*0.2;
   if(e.obj.position.distanceTo(rocketPos)<3.2 && e.hitCooldown<=0){
    e.hitCooldown=2.5;
    if(Game.shieldActive){ Game.shieldActive=false; Game.abilities.shield=0; Sound.shieldHit(); Game.hitShake=0.6;
     FX.ring(rocketPos,0x3ae9ff,12,0.6); }
    else if(Game.invuln<=0){ handleCollision(null,true,'enemy'); }
   }
   if(e.hitCooldown>0) e.hitCooldown-=dt; break; }
  case 'asteroidtitan': e.obj.position.z+=worldSpeed*0.35*dt;
   e.obj.rotation.x+=dt*0.1; e.obj.rotation.y+=dt*0.14;
   for(const c of e.obj.children){ if(c.userData.orbit){ c.userData.orbit.a+=c.userData.orbit.sp*dt;
    c.position.x=Math.cos(c.userData.orbit.a)*c.userData.orbit.r;
    c.position.y=Math.sin(c.userData.orbit.a)*c.userData.orbit.r; } }
   if(Math.random()<dt*8){ const a=freeAsteroid(); if(a) a.spawn(); } break;
  case 'solarcolossus': e.obj.position.z+=worldSpeed*0.28*dt;
   const pulse=0.8+Math.sin(Game.time*3)*0.2;
   if(e.obj.children[1]) e.obj.children[1].scale.set(90*pulse,90*pulse,1);
   el.speedLines.style.opacity=String(0.4+Math.abs(Math.sin(Game.time*2))*0.4);
   el.speedLines.style.background='radial-gradient(ellipse at 50% 55%, rgba(255,200,60,.20) 30%, rgba(255,140,40,.35) 100%)';
   Game.fuel-=0.6*dt; break;
  case 'eventhorizon': e.obj.rotation.y+=dt*0.5;
   if(e.obj.userData.disk) e.obj.userData.disk.rotation.z+=dt*0.4;
   if(e.obj.userData.disk2) e.obj.userData.disk2.rotation.z-=dt*0.25;
   const dir=tmpV.copy(e.obj.position).sub(rocketPos); const d=dir.length();
   if(d<90){ dir.normalize(); const f=(1-d/90)*26; rocketPos.addScaledVector(dir,f*dt);
    rocketPos.x=clamp(rocketPos.x,-BOUND_X,BOUND_X); rocketPos.y=clamp(rocketPos.y,-BOUND_Y,BOUND_Y); } break;
 }
 el.encounterBar.classList.add('on'); el.encName.textContent=e.def.name;
 el.encFill.style.width=(clamp(e.life/e.max,0,1)*100)+'%';
 if(e.life<=0) endEncounter();
}
function endEncounter(){
 if(!Game.encounter) return;
 const e=Game.encounter; scene.remove(e.obj);
 FX.ring(rocketPos,0xffd45a,22,0.9); FX.burst(rocketPos,0xffd45a,28,14,0.8,1.0);
 Game.scoreFloat+=1500*Game.mult; addXP(600);
 toast('ENCOUNTER SURVIVED · +1500');
 el.encounterBar.classList.remove('on');
 el.speedLines.style.opacity='0';
 el.speedLines.style.background='radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 38%, rgba(58,233,255,.14) 78%, rgba(58,233,255,.3) 100%)';
 if(e.kind==='eventhorizon') unlockAchievement('bhs');
 Game.encounter=null;
}

