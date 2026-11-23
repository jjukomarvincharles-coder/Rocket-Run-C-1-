/* ========== ASTEROIDS ========== */
const ASTEROID_GEOS=[];
(function(){ for(let k=0;k<5;k++){
 const geo=new THREE.IcosahedronGeometry(1,2); const pos=geo.attributes.position; const v=new THREE.Vector3(); const seed=k*13.7;
 for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i);
  const n=Math.sin(v.x*2.1+seed)*Math.cos(v.y*2.4+seed*0.7)*Math.sin(v.z*1.9+seed*1.3)+0.5*Math.sin(v.x*4.3+v.y*3.1)*Math.cos(v.z*4.7);
  v.multiplyScalar(1+n*0.20); pos.setXYZ(i,v.x,v.y,v.z); }
 geo.computeVertexNormals(); ASTEROID_GEOS.push(geo); } })();
const rockMatBase=new THREE.MeshStandardMaterial({map:TEX.rock,color:0xd9ccb8,roughness:0.92,metalness:0.05,envMapIntensity:0.85,emissive:0x0e0906});
const rockMatDark=new THREE.MeshStandardMaterial({map:TEX.rock,color:0x948a7a,roughness:0.95,metalness:0.05,envMapIntensity:0.65,emissive:0x0a0705});
class Asteroid{
 constructor(){ this.mesh=new THREE.Mesh(ASTEROID_GEOS[0],rockMatBase); this.mesh.visible=false; this.active=false; this.radius=1; this.spin=new THREE.Vector3(); this.nearMissed=false; }
 spawn(z){ this.mesh.geometry=pick(ASTEROID_GEOS); this.mesh.material=Math.random()<0.45?rockMatDark:rockMatBase;
  const r=Math.random(); let scale;
  if(r<0.55) scale=rnd(0.35,1.0); else if(r<0.86) scale=rnd(1.0,2.4); else scale=rnd(2.6,5.2);
  this.radius=scale*1.05; this.mesh.scale.setScalar(scale);
  this.mesh.position.set(rnd(-BOUND_X-5,BOUND_X+5),rnd(-BOUND_Y-3.5,BOUND_Y+3.5),z!==undefined?z:SPAWN_Z-rnd(0,160));
  this.mesh.rotation.set(rnd(0,TAU),rnd(0,TAU),rnd(0,TAU));
  this.spin.set(rnd(-0.7,0.7),rnd(-0.7,0.7),rnd(-0.7,0.7));
  this.speedMul=rnd(0.85,1.25); this.nearMissed=false; this.active=true; this.mesh.visible=true; }
 despawn(){ this.active=false; this.mesh.visible=false; }
}

