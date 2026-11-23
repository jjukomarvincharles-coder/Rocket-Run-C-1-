/* ========== BACKGROUND ========== */
const bgGroup=new THREE.Group(); scene.add(bgGroup);
const galaxies=[];
function spawnGalaxies(){
 for(let i=0;i<7;i++){
  const m=new THREE.SpriteMaterial({map:TEX.galaxy,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:rnd(0.32,0.72),fog:false});
  const s=new THREE.Sprite(m); const sz=rnd(420,1200); s.scale.set(sz,sz,1);
  s.position.set(rnd(-1700,1700),rnd(-850,850),rnd(-3400,-1600));
  s.userData.rotSpeed=rnd(-0.02,0.02); bgGroup.add(s); galaxies.push(s); }}
function makeStarPoints(count,spread,size,opacity){
 const geo=new THREE.BufferGeometry(); const pos=new Float32Array(count*3); const col=new Float32Array(count*3);
 const c=new THREE.Color();
 for(let i=0;i<count;i++){ pos[i*3]=rnd(-spread,spread); pos[i*3+1]=rnd(-spread*0.55,spread*0.55); pos[i*3+2]=rnd(-spread*1.6,spread*0.4);
  const t=Math.random(); if(t<0.7) c.setRGB(1,1,1); else if(t<0.86) c.setRGB(0.72,0.85,1); else if(t<0.95) c.setRGB(1,0.9,0.75); else c.setRGB(0.85,0.75,1);
  const b=rnd(0.4,1); col[i*3]=c.r*b; col[i*3+1]=c.g*b; col[i*3+2]=c.b*b; }
 geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
 geo.setAttribute('color',new THREE.BufferAttribute(col,3));
 const mat=new THREE.PointsMaterial({size,map:TEX.glowW,vertexColors:true,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true,fog:false});
 const p=new THREE.Points(geo,mat); p.renderOrder=-900; return p; }
bgGroup.add(makeStarPoints(3200,2600,14,0.85));
bgGroup.add(makeStarPoints(1400,900,9,0.6));

const PLANET_PREFIX=['KEPLER','GLIESE','TRAPPIST','HD','WOLF','ROSS','TAU','PROXIMA','LUV','NOVA','ZETA','ORION','VEGA','LYRA','ARCTURUS','CETI'];
const PLANET_SUFFIX=['PRIME','MINOR','MAJOR','B','C','D','E','ALPHA','BETA','GAMMA','SECUNDUS','ULTIMA','NOVA','MAJORIS'];
const PLANET_TYPES=['GAS GIANT','ICE WORLD','ROCKY WORLD','OCEAN WORLD','DESERT WORLD','VOLCANIC WORLD','CRYSTALLINE WORLD','ANCIENT WORLD'];
const planets=[];
const PLANET_PALETTES=[[0x1b4fd8,0x6fd8ff],[0x2a1a7a,0xb46cff],[0x0e6fa8,0x74f0ff],[0x3a1a5c,0xff6fd0],[0x14336b,0x9fd0ff],[0x0b5f6b,0x6fffe0],[0x6a2a10,0xff9a5a],[0x1a1a3a,0x8a8aff]];
function planetName(){ return pick(PLANET_PREFIX)+'-'+rndi(100,999)+' '+pick(PLANET_SUFFIX); }
function makeAtmosphereMaterial(colorHex){
 return new THREE.ShaderMaterial({uniforms:{uColor:{value:new THREE.Color(colorHex)},uPower:{value:3.0},uIntensity:{value:0.85}},
  vertexShader:`varying vec3 vN; varying vec3 vP; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vP=mv.xyz; gl_Position=projectionMatrix*mv; }`,
  fragmentShader:`uniform vec3 uColor; uniform float uPower; uniform float uIntensity; varying vec3 vN; varying vec3 vP; void main(){ float f=pow(1.0-abs(dot(normalize(vN),normalize(-vP))),uPower); gl_FragColor=vec4(uColor*f*uIntensity,f); }`,
  transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.FrontSide}); }
/* Planet field: every planet drifts at the SAME speed (they can no longer overtake/pass through each other), each new planet is
   placed where it clears every existing planet in 3D AND in screen space, and nothing may sit on the flight corridor. */
const PLANET_GEO=new THREE.SphereGeometry(1,48,32), RING_GEO=new THREE.RingGeometry(1.35,1.95,72,1), PLANET_DRIFT=0.216;
const planetBound=(r,ring)=>r*(ring?1.98:1.07);
function findPlanetSlot(radius,ring,flyby){
 const br=planetBound(radius,ring); let best=null,bestScore=-1e9; const c=new THREE.Vector3(), dirC=new THREE.Vector3(), dirP=new THREE.Vector3();
 for(let t=0;t<60;t++){
  let x,y,z;
  if(flyby){ z=-rnd(1500,2600); x=(Math.random()<0.5?-1:1)*(radius+BOUND_X+rnd(14,44)); y=rnd(-radius*0.45,radius*0.45); }
  else { z=-rnd(1700,3400); const D=-z, a=Math.atan2(br,D), minH=a+0.12, maxH=Math.max(minH+0.05,0.8);
   const th=(Math.random()<0.5?-1:1)*rnd(minH,maxH), tv=rnd(-0.32,0.32); x=Math.tan(th)*D; y=Math.tan(tv)*D; }
  c.set(x,y,z); dirC.copy(c).normalize(); const aC=Math.atan2(br,c.length());
  let score=1e9, ok=true;
  for(const p of planets){
   const pb=p.userData.br, gap=c.distanceTo(p.position)-(br+pb)*1.12;
   dirP.copy(p.position).normalize(); const ang=Math.acos(clamp(dirC.dot(dirP),-1,1))-(aC+Math.atan2(pb,p.position.length()))*1.15-0.02;
   const sc=Math.min(gap/Math.max(br,1),ang*10); score=Math.min(score,sc); if(gap<0||ang<0) ok=false; }
  if(ok) return {x,y,z,ok:true};
  if(score>bestScore){ bestScore=score; best={x,y,z,ok:false}; }
 }
 return best;
}
function spawnPlanet(nearCorridor){
 const pal=pick(PLANET_PALETTES); const seed=Math.random()*100;
 const mapTex=tex(makePlanetTexture(pal[0],pal[1],seed));
 let radius=nearCorridor?rnd(55,105):rnd(80,200);
 const ring=!nearCorridor&&Math.random()<0.28;
 let slot=findPlanetSlot(radius,ring,nearCorridor);
 for(let k=0;k<5&&!slot.ok;k++){ radius*=0.8; slot=findPlanetSlot(radius,ring,nearCorridor); }
 if(nearCorridor&&!slot.ok) return spawnPlanet(false);   // no clear lane beside the corridor right now: make it a distant planet instead
 const mesh=new THREE.Mesh(PLANET_GEO,new THREE.MeshStandardMaterial({map:mapTex,roughness:0.86,metalness:0.05,emissive:new THREE.Color(pal[1]).multiplyScalar(0.06)}));
 mesh.scale.setScalar(radius); mesh.position.set(slot.x,slot.y,slot.z);
 mesh.rotation.z=rnd(-0.4,0.4);
 mesh.userData.spin=rnd(0.004,0.016)*(Math.random()<0.5?-1:1);
 mesh.userData.br=planetBound(radius,ring); mesh.userData.radius=radius;
 mesh.userData.isFlyby=nearCorridor; mesh.userData.discovered=false;
 mesh.userData.catalog={name:planetName(),type:pick(PLANET_TYPES),palette:pal[1]};
 bgGroup.add(mesh);
 const atmo=new THREE.Mesh(PLANET_GEO,makeAtmosphereMaterial(pal[1]));
 atmo.scale.setScalar(radius*1.045); atmo.position.copy(mesh.position); bgGroup.add(atmo); mesh.userData.atmo=atmo;
 if(ring){ const r=new THREE.Mesh(RING_GEO,new THREE.MeshBasicMaterial({color:pal[1],transparent:true,opacity:0.28,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));
  r.scale.setScalar(radius); r.rotation.x=Math.PI/2.35; r.position.copy(mesh.position); bgGroup.add(r); mesh.userData.ring=r; }
 planets.push(mesh); return mesh; }
function disposePlanet(p){ bgGroup.remove(p); if(p.material) p.material.dispose();
 const at=p.userData.atmo; if(at){ bgGroup.remove(at); at.material.dispose(); }
 const rg=p.userData.ring; if(rg){ bgGroup.remove(rg); rg.material.dispose(); } }
spawnGalaxies();
spawnPlanet(false); spawnPlanet(false); spawnPlanet(false); spawnPlanet(false);

