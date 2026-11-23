/* ========== COLLECTIBLES ========== */
const COLLECTIBLE_DEFS={
 coin:{color:0xffd24d,glow:TEX.glowY,score:12,fuel:0},
 gas:{color:0x4dff9e,glow:TEX.glowG,score:25,fuel:30},
 supergas:{color:0x62f6ff,glow:TEX.glowC,score:60,fuel:9999},
 redgas:{color:0xff5a3c,glow:TEX.glowR,score:45,fuel:25,boost:true},
 goldgas:{color:0xffc83a,glow:TEX.glowY,score:80,fuel:40,mult:true},
 voidgas:{color:0xb46cff,glow:TEX.glowV,score:70,fuel:20,slow:true},
 quantum:{color:0xffffff,glow:TEX.glowC,score:100,fuel:9999,teleport:true},
 crate:{color:0xd8d8ff,glow:TEX.glowC,score:0,fuel:0},
 relic:{color:0xff4ad8,glow:TEX.glowV,score:200,fuel:0,relic:true},
 enginecell:{color:0xb46cff,glow:TEX.glowV,score:30,fuel:0,repairEngine:10},
 repairkit:{color:0x4dffb0,glow:TEX.glowG,score:30,fuel:0,repairHull:20},
 nanobots:{color:0x62f6ff,glow:TEX.glowC,score:45,fuel:0,repairHull:8,repairEngine:8},
 emergencycore:{color:0xffc83a,glow:TEX.glowY,score:60,fuel:0,repairEngine:40}
};
function buildCollectibleMesh(type){
 const def=COLLECTIBLE_DEFS[type]; const g=new THREE.Group(); const col=new THREE.Color(def.color);
 if(type==='coin'){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.075,18),
   new THREE.MeshStandardMaterial({color:0xffd24d,metalness:1.0,roughness:0.18,emissive:0xffa000,emissiveIntensity:0.85,envMapIntensity:1.6}));
  m.rotation.x=Math.PI/2; g.add(m);
  const inner=new THREE.Mesh(new THREE.TorusGeometry(0.20,0.035,6,18),new THREE.MeshBasicMaterial({color:0xfff0b0}));
  g.add(inner);
 } else if(type==='crate'){
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.72,0.72,0.72),
   new THREE.MeshStandardMaterial({color:0x2a3a52,metalness:0.9,roughness:0.3,emissive:0x7ef2ff,emissiveIntensity:0.5,envMapIntensity:1.4}));
  g.add(box);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.75,0.75,0.75)),
   new THREE.LineBasicMaterial({color:0xa9f7ff})); g.add(edges);
  const band=new THREE.Mesh(new THREE.TorusGeometry(0.55,0.035,6,24),new THREE.MeshBasicMaterial({color:0x7ef2ff}));
  band.rotation.x=Math.PI/2; g.add(band);
  const band2=band.clone(); band2.rotation.set(Math.PI/2,0,Math.PI/2); g.add(band2);
 } else if(type==='relic'){
  const icosa=new THREE.Mesh(new THREE.IcosahedronGeometry(0.5,0),
   new THREE.MeshStandardMaterial({color:0xff4ad8,metalness:1.0,roughness:0.15,emissive:0xff4ad8,emissiveIntensity:1.6,envMapIntensity:1.8}));
  g.add(icosa);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.68,0.028,6,28),new THREE.MeshBasicMaterial({color:0xffb0f0}));
  ring.rotation.x=Math.PI/2; g.add(ring);
  const ring2=ring.clone(); ring2.rotation.set(Math.PI/2,0,Math.PI/2); g.add(ring2);
 } else if(type==='enginecell'||type==='emergencycore'){
  const body=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.55,0.55),
   new THREE.MeshStandardMaterial({color:col.clone().multiplyScalar(0.35),metalness:0.9,roughness:0.25,emissive:col,emissiveIntensity:1.3,envMapIntensity:1.4}));
  g.add(body);
  const band=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.04,6,20),new THREE.MeshBasicMaterial({color:col}));
  band.rotation.x=Math.PI/2; g.add(band);
  const band2=band.clone(); band2.rotation.set(Math.PI/2,0,Math.PI/2); g.add(band2);
  const cross=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.7,0.05),new THREE.MeshBasicMaterial({color:col}));
  g.add(cross);
  const cross2=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.1,0.05),new THREE.MeshBasicMaterial({color:col}));
  g.add(cross2);
 } else if(type==='repairkit'||type==='nanobots'){
  const box=new THREE.Mesh(new THREE.BoxGeometry(0.65,0.5,0.5),
   new THREE.MeshStandardMaterial({color:0xe8f4ff,metalness:0.85,roughness:0.3,emissive:col,emissiveIntensity:0.7,envMapIntensity:1.4}));
  g.add(box);
  const cross1=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.34,0.55),new THREE.MeshBasicMaterial({color:0xff3a3a}));
  g.add(cross1);
  const cross2=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.1,0.55),new THREE.MeshBasicMaterial({color:0xff3a3a}));
  g.add(cross2);
 } else {
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.26,0.62,12),
   new THREE.MeshStandardMaterial({color:col.clone().multiplyScalar(0.28),metalness:0.9,roughness:0.24,emissive:col,emissiveIntensity:1.5,envMapIntensity:1.4}));
  g.add(body);
  for(const y of [0.34,-0.34]){
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.09,12),
    new THREE.MeshStandardMaterial({color:0xdfe9f2,metalness:1.0,roughness:0.2}));
   cap.position.y=y; g.add(cap);
  }
  const band=new THREE.Mesh(new THREE.TorusGeometry(0.275,0.026,6,20),new THREE.MeshBasicMaterial({color:col}));
  band.rotation.x=Math.PI/2; g.add(band);
  const valve=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.16,8),
   new THREE.MeshStandardMaterial({color:0xcfd8e0,metalness:1,roughness:0.3}));
  valve.position.y=0.42; g.add(valve);
 }
 const halo=new THREE.Sprite(new THREE.SpriteMaterial({map:def.glow,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.95}));
 halo.scale.set(2.3,2.3,1); g.add(halo);
 
 g.userData.halo=halo; g.userData.rotSpeed=rnd(1.4,2.4)*(Math.random()<0.5?-1:1); return g;
}
class Collectible{
 constructor(){ this.group=null; this.type='coin'; this.active=false; this.phase=0; }
 spawn(type,z){
  if(this.group){ scene.remove(this.group); disposeGroup(this.group); }
  this.type=type; this.group=buildCollectibleMesh(type);
  this.group.position.set(clamp(rnd(-BOUND_X+0.5,BOUND_X-0.5),-BOUND_X+0.4,BOUND_X-0.4),
   clamp(rnd(-BOUND_Y+0.4,BOUND_Y-0.4),-BOUND_Y+0.4,BOUND_Y-0.4),z);
  this.phase=Math.random()*TAU; this.active=true; this.group.visible=true; scene.add(this.group); }
 despawn(){ if(this.group){ scene.remove(this.group); disposeGroup(this.group); this.group=null; } this.active=false; }
}
function disposeGroup(g){ g.traverse(o=>{ if(o.geometry&&o.geometry.dispose) o.geometry.dispose(); }); }

