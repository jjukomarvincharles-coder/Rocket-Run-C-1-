/* ========== ROCKET INSTANCE ========== */
let rocket=null;
const rocketPos=new THREE.Vector3(0,0,0);
const rocketVel=new THREE.Vector3();
let rocketRoll=0,rocketPitch=0,rocketBob=0;
function createRocketInstance(){
 if(rocket) scene.remove(rocket.group);
 const def=getRocketDef(SAVE.selectedRocket);
 const skinHull=SAVE.skins.hull||'#'+new THREE.Color(def.hullColor).getHexString();
 const tier=rocketTier(SAVE.selectedRocket);
 rocket=buildRocket({skins:{hull:skinHull,engine:SAVE.skins.engine,trail:SAVE.skins.trail},accent:def.accent,tier});
 scene.add(rocket.group);
 if(CameraMode.current!==0) rocket.group.visible=false;
}
let shieldMesh=null,shieldWire=null;
function buildShield(){
 if(shieldMesh) return;
 const mat=new THREE.MeshBasicMaterial({color:0x3ae9ff,transparent:true,opacity:0.18,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
 shieldMesh=new THREE.Mesh(new THREE.SphereGeometry(1.35,24,16),mat);
 shieldWire=new THREE.Mesh(new THREE.IcosahedronGeometry(1.36,2),
  new THREE.MeshBasicMaterial({color:0x9df4ff,wireframe:true,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false}));
 shieldMesh.visible=false; shieldWire.visible=false;
 scene.add(shieldMesh); scene.add(shieldWire);
}
let magnetRing=null;
function buildMagnet(){
 if(magnetRing) return;
 magnetRing=new THREE.Mesh(new THREE.TorusGeometry(4.2,0.035,6,48),
  new THREE.MeshBasicMaterial({color:0x7cff9a,transparent:true,opacity:0.55,blending:THREE.AdditiveBlending,depthWrite:false}));
 magnetRing.rotation.x=Math.PI/2; magnetRing.visible=false; scene.add(magnetRing);
}
let ghostRocket=null;
function buildGhostRocket(){
 if(ghostRocket){ scene.remove(ghostRocket); ghostRocket=null; }
 if(!SAVE.ghost) return;
 const g=buildRocket({skins:{hull:'#7ef2ff',engine:'#3ae9ff',trail:'#7ef2ff'},accent:0x7ef2ff,tier:0});
 g.group.traverse(o=>{ if(o.material){ const ms=Array.isArray(o.material)?o.material:[o.material];
  for(const m of ms){ m.transparent=true; m.opacity=0.28; m.depthWrite=false; if(m.emissive) m.emissiveIntensity=0.4; } } });
 ghostRocket=g.group; scene.add(ghostRocket);
}
function ghostAt(t){
 if(!SAVE.ghost||!SAVE.ghost.path||SAVE.ghost.path.length<2) return null;
 const path=SAVE.ghost.path;
 if(t>=path[path.length-1].t) return null;
 let i=0; while(i<path.length-1&&path[i+1].t<t) i++;
 const a=path[i],b=path[i+1]||a;
 const span=Math.max(0.0001,b.t-a.t);
 const k=clamp((t-a.t)/span,0,1);
 return {x:lerp(a.x,b.x,k),y:lerp(a.y,b.y,k)};
}

