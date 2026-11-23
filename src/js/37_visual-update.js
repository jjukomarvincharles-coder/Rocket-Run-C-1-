/* ========== VISUAL UPDATE ========== */
let camShakeV=new THREE.Vector3();
let camTarget=new THREE.Vector3();
let camLook=new THREE.Vector3();

/* Hyperdrive FX v2: gradient comet streaks + warp-tunnel rings, each in ONE draw call (phone friendly). */
const HyperFX=(()=>{
 const COUNT=(typeof qualityProfile!=='undefined'&&qualityProfile.asteroidCount<=40)?150:230;
 const pos=new Float32Array(COUNT*6), col=new Float32Array(COUNT*6), streaks=[];
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 const mat=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
 const lines=new THREE.LineSegments(geo,mat); lines.frustumCulled=false; scene.add(lines);
 for(let i=0;i<COUNT;i++){ // head = white-hot, tail = deep blue (fades to black under additive blending)
  const warm=Math.random()<0.18;
  col.set(warm?[1,0.85,0.55]:[1,1,1],i*6); col.set(warm?[0.35,0.12,0.02]:[0.05,0.28,0.9],i*6+3); }
 const RINGS=9, SEG=40, rpos=new Float32Array(RINGS*SEG*6), rings=[];
 const rgeo=new THREE.BufferGeometry(); rgeo.setAttribute('position',new THREE.BufferAttribute(rpos,3));
 const rmat=new THREE.LineBasicMaterial({color:0x7ef2ff,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false});
 const ringLines=new THREE.LineSegments(rgeo,rmat); ringLines.frustumCulled=false; scene.add(ringLines);
 for(let i=0;i<RINGS;i++) rings.push({z:-i*(420/RINGS)-20,r:rnd(12,17),ph:rnd(0,6.28)});
 let punch=0,t=0;
 function respawn(s,initial=false){ s.x=rnd(-58,58); s.y=rnd(-34,34); s.z=initial?-rnd(35,390):-rnd(210,440); s.len=rnd(5,16); }
 for(let i=0;i<COUNT;i++){const s={};respawn(s,true);streaks.push(s);}
 function trigger(){ punch=1; for(let i=0;i<COUNT;i++){ if(i<COUNT*0.55) streaks[i].z=-rnd(28,205); }
  try{ FX.ring(rocketPos,0xbfefff,26,0.75); FX.ring(rocketPos,0x3ae9ff,14,0.5); }catch(e){} }
 function update(dt,intensity){
  t+=dt;
  const active=Game.state==='PLAYING'?clamp(intensity,0,1):0;
  if(active<=0.02){ lines.visible=false; ringLines.visible=false; punch=Math.max(0,punch-dt*2.5); return {active,punch}; }
  const speed=Math.max(0,Game.speed||0), travel=speed*dt*(active>0.03?2.3:0.08);
  const cameraZ=camera.position.z;
  for(let i=0;i<COUNT;i++){
   const s=streaks[i]; s.z+=travel*(0.8+(i%5)*0.12); if(s.z>cameraZ+3) respawn(s,false);
   const idx=i*6, stretch=s.len*(0.18+active*4.2);
   pos[idx]=s.x;pos[idx+1]=s.y;pos[idx+2]=s.z; pos[idx+3]=s.x;pos[idx+4]=s.y;pos[idx+5]=s.z-stretch; }
  geo.setDrawRange(0,Math.floor(COUNT*clamp(perfFx,0.4,1))*2);
  geo.attributes.position.needsUpdate=true;
  mat.opacity=active>0.02?(0.2+active*0.8):0; lines.visible=active>0.02;
  // warp tunnel rings rush past the camera and are centred on the flight path
  const cx=rocketPos.x*0.55, cy=rocketPos.y*0.55; let n=0;
  for(const r of rings){ r.z+=travel*1.15; if(r.z>cameraZ+4){ r.z=-420-rnd(0,40); r.r=rnd(12,17); }
   const rr=r.r*(1+0.04*Math.sin(t*9+r.ph));
   for(let k=0;k<SEG;k++){ const a0=k/SEG*6.2832,a1=(k+1)/SEG*6.2832;
    rpos[n++]=cx+Math.cos(a0)*rr; rpos[n++]=cy+Math.sin(a0)*rr*0.72; rpos[n++]=r.z;
    rpos[n++]=cx+Math.cos(a1)*rr; rpos[n++]=cy+Math.sin(a1)*rr*0.72; rpos[n++]=r.z; } }
  rgeo.attributes.position.needsUpdate=true;
  rmat.opacity=active>0.02?(0.12+active*0.34):0; ringLines.visible=active>0.02;
  punch=Math.max(0,punch-dt*2.5);
  return {active,punch};
 }
 return {trigger,update};
})();

function updateVisuals(dt){
 if(!rocket) return;
 const boostT=Game.abilities.boost>0?1:0;
 const speedNorm=clamp(Game.speed/(Game.baseSpeed*2.4),0,1.2);
 rocketBob=Math.sin(Game.time*2.1)*0.045;
 const bobOff=Game.state==='PLAYING'?rocketBob:Math.sin(performance.now()*0.0012)*0.08;
 rocket.group.position.set(rocketPos.x,rocketPos.y+bobOff,rocketPos.z);
 const targetRoll=clamp(-rocketVel.x*0.055,-0.55,0.55);
 const targetPitch=clamp(rocketVel.y*0.035,-0.32,0.32);
 rocketRoll=damp(rocketRoll,targetRoll,6,dt);
 rocketPitch=damp(rocketPitch,targetPitch,6,dt);
 rocket.group.rotation.z=rocketRoll;
 rocket.group.rotation.x=rocketPitch;
 rocket.group.rotation.y=damp(rocket.group.rotation.y,-rocketVel.x*0.012,5,dt);
 const engineHealth = clamp(Game.engine/100, 0.3, 1);
 const flick=0.88+Math.sin(performance.now()*0.028)*0.09+Math.random()*0.06;
 for(const f of rocket.flames){
  const boostScale=1+boostT*2.75+speedNorm*0.35;
  f.flame.scale.set(flick, flick*boostScale*(0.9+speedNorm*0.35)*engineHealth, flick);
  f.inner.scale.set(flick, (0.85+boostT*1.65)*(0.9+speedNorm*0.3)*engineHealth, flick);
  f.sheath.scale.set(1, 0.85+boostT*1.9+speedNorm*0.4, 1);
  f.glow.scale.setScalar((1.35+boostT*2.0+Math.sin(performance.now()*0.02+f.side)*0.12)*engineHealth);
  f.glow.material.opacity=(0.75+boostT*0.25)*engineHealth;
  if(Game.engine < 25 && Math.random() < 0.3){
   f.glow.material.opacity *= 0.3;
  }
 }
 engineLight.intensity=(2.6+boostT*9.0)*(0.9+Math.random()*0.2)*engineHealth;
 engineLight.position.set(rocketPos.x,rocketPos.y,rocketPos.z+2.0);
 for(let i=0;i<rocket.hullLights.length;i++){
  rocket.hullLights[i].material.color.setScalar(0.55+0.45*Math.sin(performance.now()*0.006+i*1.3));
 }
 const dmgLevel = 1 - clamp(Game.hull/100, 0, 1);
 if(rocket.sparksGroup){
  for(const sp of rocket.sparksGroup.children){
   sp.material.opacity = dmgLevel > 0.2 ? (Math.random()*dmgLevel) : 0;
  }
 }
 if(rocket.smokeGroup){
  for(const sm of rocket.smokeGroup.children){
   sm.material.opacity = dmgLevel > 0.4 ? (Math.random()*dmgLevel*0.6) : 0;
   sm.position.z -= dt*0.8;
   if(sm.position.z < -1.5) sm.position.z = 1;
  }
 }
 if(shieldMesh&&shieldWire){
  shieldMesh.visible=Game.shieldActive&&CameraMode.current===0; shieldWire.visible=shieldMesh.visible;
  if(shieldEdgeEl) shieldEdgeEl.style.opacity=(Game.shieldActive&&CameraMode.current!==0)?String(0.35+0.45*Game.shieldEnergy/Game.shieldMax):'0';
  if(Game.shieldActive){
   const s=1+Math.sin(performance.now()*0.006)*0.035;
   shieldMesh.position.copy(rocket.group.position);
   shieldWire.position.copy(rocket.group.position);
   shieldMesh.scale.setScalar(s); shieldWire.scale.setScalar(s);
   shieldMesh.rotation.y+=dt*0.8;
   shieldWire.rotation.x+=dt*0.6; shieldWire.rotation.y-=dt*0.9;
   const energyRatio = Game.shieldEnergy/Game.shieldMax;
   shieldMesh.material.opacity = 0.08 + energyRatio*0.15;
   shieldWire.material.opacity = 0.15 + energyRatio*0.25;
  }
 }
 if(magnetRing){
  magnetRing.visible=Game.abilities.magnet>0&&CameraMode.current===0;
  if(magnetRing.visible){
   magnetRing.position.copy(rocket.group.position);
   magnetRing.rotation.z+=dt*1.4;
   const p=1+Math.sin(performance.now()*0.005)*0.12;
   magnetRing.scale.setScalar(p);
   magnetRing.material.opacity=0.35+0.3*Math.abs(Math.sin(performance.now()*0.004));
  }
 }
 if(ghostRocket){
  const gp=ghostAt(Game.time);
  if(gp&&Game.state==='PLAYING'){ ghostRocket.visible=true;
   ghostRocket.position.set(gp.x,gp.y,-0.6); ghostRocket.rotation.z=-gp.x*0.03; }
  else ghostRocket.visible=false;
 }
 const cinePull=Game.cinematic>0?3.2:0;
 const boostPull=boostT*4.1;
 const speedPull=speedNorm*0.9;
 const camOffX=rocketPos.x*0.32;
 const camOffY=rocketPos.y*0.28;

 if(CameraMode.current === 0){
  camTarget.set(camOffX*0.55, 2.35+camOffY*0.5, 7.7+boostPull+speedPull+cinePull);
  if(boostT>0){ camTarget.x+=rnd(-1,1)*0.07; camTarget.y+=rnd(-1,1)*0.055; }
  if(Game.hitShake>0){ const sh=Game.hitShake;
   camShakeV.set(rnd(-1,1)*sh*0.55,rnd(-1,1)*sh*0.45,rnd(-1,1)*sh*0.4);
   camTarget.add(camShakeV); }
  camera.position.x=damp(camera.position.x,camTarget.x,5.5,dt);
  camera.position.y=damp(camera.position.y,camTarget.y,5.5,dt);
  camera.position.z=damp(camera.position.z,camTarget.z,3.5,dt);
  camLook.set(rocketPos.x*0.42+rocketVel.x*0.02, rocketPos.y*0.35+0.55, -9);
  camera.lookAt(camLook);
  camera.rotation.z += rocketRoll*0.30;
 } else if(CameraMode.current === 1){
  const px = rocketPos.x + rocketVel.x*0.02;
  const py = rocketPos.y + 0.15 + rocketVel.y*0.02;
  const pz = rocketPos.z + 0.3;
  camera.position.x = damp(camera.position.x, px, 12, dt);
  camera.position.y = damp(camera.position.y, py, 12, dt);
  camera.position.z = damp(camera.position.z, pz, 12, dt);
  camLook.set(rocketPos.x*0.4+rocketVel.x*0.05, rocketPos.y*0.4+0.1, -60);
  camera.lookAt(camLook);
  camera.rotation.z = rocketRoll*0.55;
  if(Game.hitShake>0){
   const sh=Game.hitShake;
   camera.position.x += rnd(-1,1)*sh*0.25;
   camera.position.y += rnd(-1,1)*sh*0.25;
  }
 } else {
  const px = rocketPos.x;
  const py = rocketPos.y + 0.1;
  const pz = rocketPos.z - 2.6;
  camera.position.x = damp(camera.position.x, px, 14, dt);
  camera.position.y = damp(camera.position.y, py, 14, dt);
  camera.position.z = damp(camera.position.z, pz, 14, dt);
  camLook.set(rocketPos.x*0.4+rocketVel.x*0.05, rocketPos.y*0.4, -80);
  camera.lookAt(camLook);
  camera.rotation.z = rocketRoll*0.45;
  if(Game.hitShake>0){
   const sh=Game.hitShake;
   camera.position.x += rnd(-1,1)*sh*0.28;
   camera.position.y += rnd(-1,1)*sh*0.28;
  }
 }
 let targetFov = camera.aspect < 1 ? 66 : 62;
 if(CameraMode.current === 0) targetFov += boostT*23 + speedNorm*5;
 else if(CameraMode.current === 1) targetFov += boostT*20 + speedNorm*4;
 else targetFov += boostT*25 + speedNorm*7;
 targetFov=clamp(targetFov,55,94);
 if(Math.abs(camera.fov-targetFov)>0.05){ camera.fov=damp(camera.fov,targetFov,4,dt); camera.updateProjectionMatrix(); }
 el.speedLines.style.opacity=String(clamp(boostT*0.72+speedNorm*0.28,0,0.8));
 el.slowTint.style.opacity=Game.abilities.slow>0?'1':'0';
 if(bloomPass){ const tb=qualityProfile.bloomStrength*(1+boostT*0.8); bloomPass.strength=damp(bloomPass.strength,tb,6,dt); }
 if(boostT>0&&CameraMode.current!==0){ camera.position.x+=rnd(-1,1)*0.035; camera.position.y+=rnd(-1,1)*0.03; }
 const hyper=HyperFX.update(dt,boostT);
 ScreenFX.setBoost(hyper.active*0.76);
 if(el.ckBoostIndicator) el.ckBoostIndicator.classList.toggle('on',boostT>0);
 if(el.ckFlightMode) el.ckFlightMode.textContent=boostT>0?'HYPERDRIVE':(Game.abilities.slow>0?'TIME DILATION':'CRUISE');
 Sound.setBoost(Game.state==='PLAYING'?boostT:0);
 if(Game.state==='PLAYING') Sound.setEngine(clamp(0.25+speedNorm*0.6+boostT*0.68,0,1.4)*engineHealth);
 else Sound.setEngine(0.05);
 FX.update(dt);
}

