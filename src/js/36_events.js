/* ========== EVENTS ========== */
const EVENT_DEFS=[
 {id:'asteroidStorm',name:'ASTEROID STORM',danger:true,dur:8},
 {id:'fuelEmergency',name:'FUEL EMERGENCY',danger:true,dur:10},
 {id:'hyperspace',name:'HYPERSPACE',danger:false,dur:6},
 {id:'gravityShift',name:'GRAVITY SHIFT',danger:true,dur:8},
 {id:'gasRush',name:'GAS RUSH',danger:false,dur:12},
 {id:'solarFlare',name:'SOLAR FLARE',danger:true,dur:5},
 {id:'wormhole',name:'WORMHOLE',danger:false,dur:7}
];
function updateEvents(dt){
 if(Game.events.active){ Game.events.timer-=dt;
  const def=EVENT_DEFS.find(e=>e.id===Game.events.active);
  if(def){ switch(def.id){
   case 'asteroidStorm': if(Math.random()<dt*14){ const a=freeAsteroid(); if(a) a.spawn(); } break;
   case 'gasRush': if(Math.random()<dt*6){ const c=freeCollectible(); if(c) c.spawn(Math.random()<0.8?'gas':'supergas',SPAWN_Z-rnd(0,50)); } break;
   case 'hyperspace': Game.speed=Math.max(Game.speed,Game.baseSpeed*2.6); break;
   case 'solarFlare': el.speedLines.style.opacity='0.8';
    el.speedLines.style.background='radial-gradient(ellipse at 50% 55%, rgba(255,200,60,.22) 30%, rgba(255,140,40,.35) 100%)'; break;
   case 'gravityShift': Game.gravShift=1; break; } }
  if(Game.events.timer<=0) endEvent();
 } else { Game.events.next-=dt;
  if(Game.events.next<=0&&Game.time>20){ Game.events.next=rnd(24,40)/(1+Game.difficulty*0.35); startEvent(); } }
}
function startEvent(){
 const def=pick(EVENT_DEFS);
 Game.events.active=def.id; Game.events.timer=def.dur; Game.runStats.events++;
 if(def.id==='wormhole') Sound.quantum();
 pushNotify(def.name,def.danger); Sound.event();
 if(def.id==='hyperspace') FX.ring(rocketPos,0x62f6ff,30,0.8);
 if(def.id==='gravityShift') Game.hitShake=0.4;
 if(Math.random()<0.28&&!Game._emergencyShown){ Game._emergencyShown=true; showEmergencyDecision(); }
}
function endEvent(){
 Game.events.active=null; Game.gravShift=0;
 el.speedLines.style.opacity='0';
 el.speedLines.style.background='radial-gradient(ellipse at 50% 55%, rgba(0,0,0,0) 38%, rgba(58,233,255,.14) 78%, rgba(58,233,255,.3) 100%)';
}
async function showEmergencyDecision(){
 const saved=Game.state; Game.state='DECISION';
 const pickIdx=rndi(0,2);
 let title,text,options;
 if(pickIdx===0){ title='ENGINE FAILURE'; text='Your engines are destabilizing. You have seconds to choose.';
  options=[{label:'SHUT DOWN ENGINES',detail:'Lower speed, save fuel.',value:'shutdown',style:'gold'},
   {label:'OVERDRIVE',detail:'Massive boost, hull damage.',value:'overdrive',style:'danger'},
   {label:'REROUTE POWER',detail:'Lose shield, restore engine.',value:'reroute'}]; }
 else if(pickIdx===1){ title='FUEL LEAK'; text='A seam has opened in the tank. Which protocol?';
  options=[{label:'SEAL IT',detail:'Spend 200¢. No other cost.',value:'seal',style:'gold'},
   {label:'VENT AND BURN',detail:'Lose 30s fuel. Gain multiplier.',value:'vent'},
   {label:'IGNORE',detail:'Risk a larger loss later.',value:'ignore',style:'danger'}]; }
 else { title='DISTRESS SIGNAL'; text='A ship is broadcasting a distress call nearby.';
  options=[{label:'RESPOND',detail:'Detour costs time, may reward.',value:'respond',style:'gold'},
   {label:'JAM THE SIGNAL',detail:'Silence the call.',value:'jam'},
   {label:'IGNORE',detail:'Keep flying.',value:'ignore'}]; }
 const choice=await showDecision('EMERGENCY',title,text,options);
 Game.state=saved==='PLAYING'?'PLAYING':saved;
 switch(choice){
  case 'shutdown': Game.speed*=0.65; Game.fuel+=25; toast('ENGINES COOLED · +25s FUEL'); break;
  case 'overdrive': Game.abilities.boost=Math.max(Game.abilities.boost,5); Game.fuel-=15;
   flashScreen(0.3,'rgba(255,120,60,'); toast('OVERDRIVE ENGAGED · −15s FUEL'); break;
  case 'reroute': Game.shieldActive=false; Game.abilities.boost=Math.max(Game.abilities.boost,2);
   toast('SHIELD SACRIFICED · BOOST GAINED'); break;
  case 'seal': if(SAVE.coins>=200){ SAVE.coins-=200; toast('LEAK SEALED · −200¢'); }
   else { Game.fuel-=20; toast('NO COINS · LEAK PERSISTS'); } break;
  case 'vent': Game.fuel-=30; Game.mult=Math.min(5,Game.mult+1); Game.maxMult=Math.max(Game.maxMult,Game.mult);
   toast('VENTED · −30s FUEL · MULTIPLIER UP'); break;
  case 'respond': Game.fuel+=30; SAVE.coins+=100; Game.scoreFloat+=500*Game.mult; Sound.superGas();
   toast('SALVAGED · +30s FUEL +100¢'); break;
  case 'jam': Game.mult=Math.min(5,Game.mult+1); Game.maxMult=Math.max(Game.maxMult,Game.mult);
   toast('SIGNAL JAMMED · MULTIPLIER UP'); break;
  case 'ignore': toast('IGNORED'); break;
 }
 Game._emergencyShown=false; persist();
}
function spawnBlackHoleObject(){
 const g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(6,24,18),new THREE.MeshBasicMaterial({color:0x000000})); g.add(core);
 const disk=new THREE.Mesh(new THREE.RingGeometry(7,17,64,1),
  new THREE.MeshBasicMaterial({color:0x9a3aff,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 disk.rotation.x=Math.PI/2.3; g.add(disk);
 const disk2=new THREE.Mesh(new THREE.RingGeometry(8.5,21,64,1),
  new THREE.MeshBasicMaterial({color:0x39e9ff,transparent:true,opacity:0.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
 disk2.rotation.x=Math.PI/2.3; g.add(disk2);
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowC,color:0x9a3aff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.85}));
 halo.scale.set(52,52,1); g.add(halo);
 g.position.set(rnd(-1,1)*10,rnd(-4,4),SPAWN_Z-120);
 scene.add(g); Game.blackHole={obj:g,life:26,pull:2.6,warned:false};
}
function spawnGravityPlanet(){
 const pal=pick(PLANET_PALETTES); const seed=Math.random()*100;
 const mapTex=tex(makePlanetTexture(pal[0],pal[1],seed));
 const radius=rnd(15,22);
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,36,24),
  new THREE.MeshStandardMaterial({map:mapTex,roughness:0.8,metalness:0.08,emissive:new THREE.Color(pal[1]).multiplyScalar(0.1)}));
 mesh.position.set(rnd(-3,3),rnd(-2,2),SPAWN_Z-140);
 const atmo=new THREE.Mesh(new THREE.SphereGeometry(radius*1.5,30,20),makeAtmosphereMaterial(pal[1]));
 atmo.position.copy(mesh.position);
 scene.add(mesh); scene.add(atmo);
 Game.gravityPlanet={mesh,atmo,radius,atmoRadius:radius*2.7,pull:rnd(10,16),entered:false,name:planetName()};
 pushNotify('⚠ HIGH-GRAVITY WORLD','A dense planet looms ahead. Keep clear of its atmosphere.',true);
 Sound.event();
}
function spawnRiskZone(){
 const g=new THREE.Group();
 const ringMat=new THREE.MeshBasicMaterial({color:0xff4a4a,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 const r1=new THREE.Mesh(new THREE.TorusGeometry(BOUND_X*0.92,0.18,8,48),ringMat);
 const r2=r1.clone(); r2.position.z=-18;
 const r3=r1.clone(); r3.position.z=-36;
 g.add(r1,r2,r3);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowR,color:0xff4a4a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.28}));
 glow.scale.set(30,30,1); glow.position.z=-18; g.add(glow);
 g.position.set(0,0,SPAWN_Z-40); scene.add(g);
 Game.riskZone={obj:g,life:14,entered:false};
 pushNotify('RISK ZONE',true); Sound.event();
}
function updateRiskZone(dt,worldSpeed){
 if(!Game.riskZone) return;
 const rz=Game.riskZone; rz.life-=dt;
 rz.obj.position.z+=worldSpeed*dt; rz.obj.rotation.z+=dt*0.3;
 if(!rz.entered&&Math.abs(rz.obj.position.z-rocketPos.z)<20){
  if(Math.abs(rocketPos.x)<BOUND_X*0.9){ rz.entered=true; Game.riskZoneActive=true;
   pushNotify('EXTREME RISK',true); Sound.encounter();
   for(let i=0;i<8;i++){ const c=freeCollectible();
    if(c) c.spawn(i<2?'quantum':(i<4?'supergas':'coin'),rz.obj.position.z-rnd(0,80)); }
   for(let i=0;i<3;i++){ const c=freeCollectible(); if(c) c.spawn('crate',rz.obj.position.z-rnd(0,80)); }
   Game.mult=Math.min(5,Game.mult+1); Game.scoreFloat+=800*Game.mult; } }
 if(rz.obj.position.z>30||rz.life<=0){ scene.remove(rz.obj); Game.riskZone=null; Game.riskZoneActive=false; }
}
const ANOMALY_NAMES=['FROZEN FIELD','SILENT CORRIDOR','STARLESS POCKET','GRAVITY WELL','ECHO NEBULA','CRYSTALLINE DRIFT','DEAD SIGNAL','HOLLOW MOON','SINGULAR RIFT','CHRONAL EDDY','PALE HORIZON','FORGOTTEN GATE'];
function triggerAnomaly(){
 const name=pick(ANOMALY_NAMES);
 discover('anomalies',name,{bonus:500});
 pushNotify('⚠ ANOMALY DETECTED',true);
 setTimeout(()=>pushNotify('SIGNAL ORIGIN: ???',false,false,true),700);
 Sound.anomaly();
 el.anomalyTint.style.opacity='1';
 Game.abilities.slow=Math.max(Game.abilities.slow,5);
 Game.gravShift=1; Game.cinematic=2.5;
 setTimeout(()=>{ el.anomalyTint.style.opacity='0'; Game.gravShift=0; },5200);
 addXP(500);
 for(let i=0;i<6;i++){ const c=freeCollectible(); if(c) c.spawn(i<2?'quantum':'goldgas',SPAWN_Z-rnd(0,120)); }
 persist();
}
function playRandomTransmission(){
 const remaining=TRANSMISSIONS.filter(t=>!SAVE.transmissionsHeard[t.id]);
 const t=remaining.length?pick(remaining):pick(TRANSMISSIONS);
 SAVE.transmissionsHeard[t.id]=1;
 if(t.hiddenSector){ SAVE.seenSignal[t.hiddenSector]=1; }
 persist();
 showAmbLeft('INCOMING TRANSMISSION', t.text, false);
 Game.runStats.discoveries++; addXP(120);
}
function hideTransmission(){ /* Uses ambient cards now */ }

