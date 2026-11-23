/* ========== WRECKS & STATIONS ========== */
function buildWreck(){
 const g=new THREE.Group();
 const mat=new THREE.MeshStandardMaterial({color:0x3a4450,metalness:0.92,roughness:0.55,envMapIntensity:0.9});
 const darkMat=new THREE.MeshStandardMaterial({color:0x1a1e24,metalness:0.85,roughness:0.7});
 const hull=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.7,3.2,12),mat);
 hull.rotation.z=Math.PI/2+0.3; hull.rotation.y=0.4; g.add(hull);
 const nose=new THREE.Mesh(new THREE.ConeGeometry(0.7,1.4,12),darkMat);
 nose.rotation.z=-Math.PI/2; nose.position.set(-2.1,0.3,0); g.add(nose);
 const engine=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.65,0.8,10),darkMat);
 engine.rotation.z=Math.PI/2; engine.position.set(1.9,-0.1,0); g.add(engine);
 const wing=new THREE.Mesh(new THREE.BoxGeometry(1.8,0.1,0.9),mat);
 wing.position.set(0.4,0.75,0.3); wing.rotation.z=0.5; wing.rotation.x=0.3; g.add(wing);
 const wing2=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.08,0.7),mat);
 wing2.position.set(-0.5,-0.6,-0.4); wing2.rotation.z=-0.8; wing2.rotation.y=0.6; g.add(wing2);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowR,color:0xffb03a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.55}));
 glow.scale.set(5,5,1); glow.position.set(0.5,0.3,0); g.add(glow);
 
 g.userData.glow=glow; return g;
}
function spawnWreck(){
 const obj=buildWreck();
 const x=Math.random()<0.5?rnd(-BOUND_X+1.5,-1):rnd(1,BOUND_X-1.5);
 obj.position.set(x,rnd(-BOUND_Y+1,BOUND_Y-1),SPAWN_Z-40);
 obj.rotation.z=rnd(-0.6,0.6); obj.rotation.y=rnd(0,TAU);
 scene.add(obj);
 Game.wreck={obj,life:22,resolved:false,x,name:'WRECK '+rndi(100,999)};
 showAmbLeft('ABANDONED SHIP', 'Drifting wreck detected. Investigate?', false);
}
function updateWreck(dt,worldSpeed){
 if(!Game.wreck) return;
 const w=Game.wreck; w.life-=dt;
 w.obj.position.z+=worldSpeed*dt;
 w.obj.rotation.x+=dt*0.2; w.obj.rotation.y+=dt*0.1;
 if(!w.resolved&&Math.abs(w.obj.position.z-rocketPos.z)<4){ if(Math.abs(w.obj.position.x-rocketPos.x)<4.5){ w.resolved=true; handleWreckDecision(w); } }
 if(w.obj.position.z>30||w.life<=0){ scene.remove(w.obj); Game.wreck=null; }
}
async function handleWreckDecision(w){
 const saved=Game.state; Game.state='DECISION';
 const choice=await showDecision('SALVAGE OPPORTUNITY','ABANDONED WRECK',
  'A hull of twisted metal drifts past. Something might still be inside.',
  [{label:'INVESTIGATE',detail:'Search the wreck. Risk: trap.',value:'investigate',style:'gold'},
   {label:'KEEP FLYING',detail:'Ignore it and stay on course.',value:'skip'}]);
 Game.state=saved==='PLAYING'?'PLAYING':saved;
 if(!Game.wreck) return;
 if(choice==='investigate'){
  Game.runStats.wrecks++; Game.runStats.discoveries++;
  discover('wrecks',Game.wreck.name,{bonus:250});
  const roll=Math.random();
  if(roll<0.18){ flashScreen(0.5,'rgba(255,80,80,'); FX.ring(rocketPos,0xff4a4a,12,0.7);
   Sound.hit(); Game.hull=Math.max(0,Game.hull-8); Game.hitShake=0.6;
   toast('TRAP! · −8% HULL'); if(Game.hull<=0){ scene.remove(Game.wreck.obj); Game.wreck=null; endRun('HULL DESTROYED'); return; } }
  else if(roll<0.36){ Game.fuel=Math.min(Game.fuelMax,Game.fuel+45); Sound.gas(); toast('WRECK · +45s FUEL'); }
  else if(roll<0.54){ const amt=rndi(150,400); Game.coins+=amt; Sound.coin(); toast('WRECK · +'+amt+'¢'); }
  else if(roll<0.68){ SAVE.resources.blueprints+=1; Sound.superGas(); toast('WRECK · +BLUEPRINT'); }
  else if(roll<0.80){ const logs=STORY_LOGS.filter(l=>!SAVE.storyLogs[l.id]);
   if(logs.length){ const l=pick(logs); SAVE.storyLogs[l.id]={t:Date.now(),text:l.text};
    Game.runStats.logs++; Sound.discovery(); toast('STORY LOG · '+l.id); pushNotify(l.text,false,false,true); }
   else { Game.coins+=200; toast('WRECK · +200¢'); } }
  else if(roll<0.92){ SAVE.resources.cores+=rndi(1,2); Sound.superGas(); toast('WRECK · +ENERGY CORES'); }
  else { SAVE.resources.relics+=1; Sound.legendary(); toast('WRECK · ★ RELIC ★'); }
 }
 if(Game.wreck){ scene.remove(Game.wreck.obj); Game.wreck=null; }
 persist();
}
function buildStation(){
 const g=new THREE.Group();
 const mat=new THREE.MeshStandardMaterial({color:0x6a7480,metalness:0.94,roughness:0.35,envMapIntensity:1.2});
 const accentMat=new THREE.MeshStandardMaterial({color:0x0a1a24,emissive:0x3ae9ff,emissiveIntensity:1.8,metalness:0.5,roughness:0.3});
 const torus=new THREE.Mesh(new THREE.TorusGeometry(7,0.6,12,40),mat); torus.rotation.x=Math.PI/2; g.add(torus);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(7,0.18,8,40),accentMat); ring.rotation.x=Math.PI/2; g.add(ring);
 const ring2=new THREE.Mesh(new THREE.TorusGeometry(7.35,0.10,8,40),accentMat); ring2.rotation.x=Math.PI/2; g.add(ring2);
 for(let i=0;i<6;i++){ const a=(i/6)*TAU; const spoke=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.35,6.2),mat);
  spoke.rotation.y=a; spoke.position.set(Math.cos(a)*3.5,0,Math.sin(a)*3.5); g.add(spoke); }
 const hub=new THREE.Mesh(new THREE.SphereGeometry(1.8,20,14),mat); g.add(hub);
 const hub2=new THREE.Mesh(new THREE.IcosahedronGeometry(2.1,1),accentMat); hub2.scale.set(1,0.6,1); g.add(hub2);
 for(const s of [-1,1]){ const arm=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,3.5,10),mat);
  arm.rotation.z=Math.PI/2; arm.position.set(s*1.7,0,0); g.add(arm); }
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowC,color:0x3ae9ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.55}));
 glow.scale.set(40,40,1); g.add(glow);
 
 g.userData.glow=glow; return g;
}
function spawnStationObject(){
 const obj=buildStation(); obj.position.set(0,0,SPAWN_Z-120); obj.scale.setScalar(rnd(0.55,0.85));
 scene.add(obj);
 Game.station={obj,life:26,resolved:false,name:'STATION '+rndi(100,999)};
 showAmbLeft('SPACE STATION','Docking available. Tap to approach.',false);
 Sound.transmission();
}
function updateStation(dt,worldSpeed){
 if(!Game.station) return;
 const s=Game.station; s.life-=dt;
 s.obj.position.z+=worldSpeed*0.22*dt; s.obj.rotation.y+=dt*0.15;
 s.obj.userData.glow.material.opacity=0.4+Math.sin(Game.time*2)*0.15;
 if(!s.resolved&&Math.abs(s.obj.position.z-rocketPos.z)<6){ s.resolved=true; handleStationDock(s); }
 if(s.obj.position.z>60||s.life<=0){ scene.remove(s.obj); Game.station=null; }
}
async function handleStationDock(s){
 const saved=Game.state; Game.state='DECISION';
 Game.runStats.stations++; SAVE.stats.stationsVisited++;
 discover('stations',s.name,{bonus:300});
 const choice=await showDecision('DOCKING REQUEST',s.name,
  'A station hums quietly in the void. Dock and use its services?',
  [{label:'DOCK',detail:'Buy fuel, trade resources, repair.',value:'dock',style:'gold'},
   {label:'KEEP FLYING',detail:'Skip the stop.',value:'skip'}]);
 Game.state=saved==='PLAYING'?'PLAYING':saved;
 if(choice==='dock'){ await showStationHub(s); }
 else { if(Game.station){ scene.remove(Game.station.obj); Game.station=null; } }
}
function showStationHub(s){
 Sound.dock();
 const ov=document.getElementById('overlay'); ov.classList.remove('hidden');
 return new Promise(resolve=>{
  const close=()=>{ ov.classList.add('hidden'); ov.innerHTML='';
   if(Game.station){ scene.remove(Game.station.obj); Game.station=null; }
   Game.state='PLAYING'; resolve(); };
  const render=()=>{
   ov.innerHTML=`<div class="screen">
    <div class="station-hero">
     <div class="sname">${s.name}</div>
     <div class="sdesc">TEMPORARY HUB · SAFE HARBOUR</div>
    </div>
    <div class="stats-grid" style="max-width:720px">
     <div class="card stat-box"><div class="k">FUEL</div><div class="v">${fmtTime(Game.fuel)}</div></div>
     <div class="card stat-box"><div class="k">HULL</div><div class="v">${Math.floor(Game.hull)}%</div></div>
     <div class="card stat-box"><div class="k">ENGINE</div><div class="v">${Math.floor(Game.engine)}%</div></div>
     <div class="card stat-box"><div class="k">COINS</div><div class="v">${SAVE.coins}</div></div>
     <div class="card stat-box"><div class="k">CORES</div><div class="v">${SAVE.resources.cores}</div></div>
     <div class="card stat-box"><div class="k">RELIC</div><div class="v">${SAVE.resources.relics}</div></div>
    </div>
    <div class="station-actions">
     <div class="btn" id="stBuyFuel">BUY FUEL · 150¢<br><span style="font-size:10px;letter-spacing:1.4px">+120s fuel</span></div>
     <div class="btn" id="stRepair">REPAIR · 250¢<br><span style="font-size:10px;letter-spacing:1.4px">Full hull + engine</span></div>
     <div class="btn" id="stTrade">TRADE CORE → 300¢<br><span style="font-size:10px;letter-spacing:1.4px">1 core</span></div>
     <div class="btn" id="stRumor">LISTEN TO RUMORS<br><span style="font-size:10px;letter-spacing:1.4px">Free · reveal a signal</span></div>
     <div class="btn primary" id="stLeave">UNDOCK</div>
    </div></div>`;
   ov.querySelector('#stBuyFuel').onclick=()=>{ if(SAVE.coins<150){ toast('NOT ENOUGH COINS'); return; }
    SAVE.coins-=150; Game.fuel=Math.min(Game.fuelMax,Game.fuel+120);
    Sound.superGas(); toast('FUEL REPLENISHED'); persist(); render(); };
   ov.querySelector('#stRepair').onclick=()=>{ if(SAVE.coins<250){ toast('NOT ENOUGH COINS'); return; }
    SAVE.coins-=250; Game.hull=Game.hullMax; Game.engine=Game.engineMax;
    for(const k of ['boost','shield','magnet','slow','blast']) Game.charges[k]=Game.maxCharges;
    updateAbilityHUD(); Sound.shieldOn(); toast('SYSTEMS REPAIRED'); persist(); render(); };
   ov.querySelector('#stTrade').onclick=()=>{ if(SAVE.resources.cores<1){ toast('NO CORES'); return; }
    SAVE.resources.cores-=1; SAVE.coins+=300; Sound.coin(); toast('SOLD CORE · +300¢'); persist(); render(); };
   ov.querySelector('#stRumor').onclick=()=>{
    const keys=Object.keys(SECRET_REGIONS).filter(k=>!SAVE.seenSignal[k]);
    if(keys.length){ const k=pick(keys); SAVE.seenSignal[k]=1; persist();
     pushNotify('SIGNAL DETECTED',false,true,true);
     setTimeout(()=>pushNotify(SECRET_REGIONS[k].name,false,false,true),600);
     toast('A ROUTE HAS BEEN REVEALED'); }
    else toast('NO NEW SIGNALS');
    Sound.transmission(); };
   ov.querySelector('#stLeave').onclick=()=>close();
  };
  render();
 });
}

