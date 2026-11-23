/* ========== ENEMY WAVE SPAWNER ========== */
function spawnEnemyWave(){
 Game.enemyWaveCount++;
 const kinds=['scout','scout','scout','interceptor','interceptor','hunter','guardian','drone','kamikaze'];
 let count = Game.enemyWaveCount === 1 ? 2 : Math.min(6, 2 + Math.floor(Game.difficulty*2));
 const formation = pick(['wedge','flank','pincer','line']);
 showAmbLeft('⚠ ENEMY FLEET DETECTED', 'Stay alert. They\'re targeting you.', true);
 showFleetWarning();
 Sound.fleetWarn();
 Game.runStats.fleetEscapes = (Game.runStats.fleetEscapes||0) + 1;
 const baseZ = SPAWN_Z - rnd(0,40);
 const spawnPositions = [];
 if(formation === 'wedge'){
  for(let i=0;i<count;i++){ const off=i-(count-1)/2; spawnPositions.push([off*3.5, Math.abs(off)*-0.5, baseZ - Math.abs(off)*4]); }
 } else if(formation === 'line'){
  for(let i=0;i<count;i++){ const off=i-(count-1)/2; spawnPositions.push([off*3.0, 0, baseZ]); }
 } else if(formation === 'flank'){
  for(let i=0;i<count;i++){ const side = i%2===0?-1:1; const row = Math.floor(i/2);
   spawnPositions.push([side*(2.5+row*1.5), rnd(-1,1), baseZ - row*5]); }
 } else {
  for(let i=0;i<count;i++){ const side = i%2===0?-1:1; const row = Math.floor(i/2);
   spawnPositions.push([side*(BOUND_X-1-row*0.6), (Math.random()<0.5?-1:1)*(BOUND_Y-1), baseZ - row*4]); }
 }
 const kindRoll = Game.enemyWaveCount===1 ? 'scout' : pick(kinds);
 spawnPositions.forEach((p,i)=>{
  const e=getEnemy(); if(!e) return;
  const kind = (Game.enemyWaveCount===1) ? 'scout' : (Math.random()<0.55 ? kindRoll : pick(kinds));
  e.spawn(kind, clamp(p[0],-BOUND_X+0.8,BOUND_X-0.8), clamp(p[1],-BOUND_Y+0.8,BOUND_Y-0.8), p[2]);
 });
}
function spawnHunter(){
 const g=new THREE.Group();
 const bodyMat=new THREE.MeshStandardMaterial({color:0x2a1030,metalness:0.9,roughness:0.35,emissive:0xff2a6a,emissiveIntensity:0.7});
 const body=new THREE.Mesh(new THREE.OctahedronGeometry(0.75,0),bodyMat); body.scale.set(1.4,0.7,1.9); g.add(body);
 const eye=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,8),new THREE.MeshBasicMaterial({color:0xff2a6a}));
 eye.position.z=-1.2; g.add(eye);
 const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowR,color:0xff2a6a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));
 glow.scale.set(3.4,3.4,1); g.add(glow);
 
 g.position.set(rnd(-BOUND_X,BOUND_X),rnd(-BOUND_Y,BOUND_Y),SPAWN_Z-40);
 scene.add(g);
 return {obj:g,offset:new THREE.Vector3(rnd(-3,3),rnd(-2,2),0),life:22,speed:rnd(0.55,0.85)};
}
function spawnCollectible(){
 const r=Math.random();
 let type='coin';
 const reg=Game.secretRegion?SECRET_REGIONS[Game.secretRegion]:REGIONS[Game.region];
 if(r<0.30) type='gas';
 else if(r<0.34) type='supergas';
 else if(r<0.41) type='redgas';
 else if(r<0.45) type='goldgas';
 else if(r<0.48&&reg.danger>=4) type='voidgas';
 else if(r<0.50&&reg.danger>=6) type='quantum';
 const c=freeCollectible(); if(!c) return;
 c.spawn(type,SPAWN_Z-rnd(0,60));
}

