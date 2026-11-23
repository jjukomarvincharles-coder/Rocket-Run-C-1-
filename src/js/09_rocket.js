/* ========== ROCKET ========== */
function buildRocket(cfg){
 const g=new THREE.Group();
 const hullColor=new THREE.Color(cfg.skins.hull);
 const accentColor=new THREE.Color(cfg.accent);
 const engineColor=new THREE.Color(cfg.skins.engine);
 const trailColor=new THREE.Color(cfg.skins.trail);
 const tier=cfg.tier||0;
 const hullMat=new THREE.MeshStandardMaterial({color:hullColor,metalness:0.92,roughness:0.32,envMapIntensity:1.25});
 const darkMat=new THREE.MeshStandardMaterial({color:0x232a33,metalness:0.85,roughness:0.48,envMapIntensity:1.0});
 const accentMat=new THREE.MeshStandardMaterial({color:0x0a1a24,emissive:accentColor,emissiveIntensity:2.6,metalness:0.4,roughness:0.3});
 const glassMat=new THREE.MeshStandardMaterial({color:0x0a1c2e,metalness:0.95,roughness:0.06,emissive:0x1e88b8,emissiveIntensity:0.35,transparent:true,opacity:0.82,envMapIntensity:1.6});
 const finMat=new THREE.MeshStandardMaterial({color:0xd8442a,metalness:0.55,roughness:0.42});
 const engineMat=new THREE.MeshStandardMaterial({color:0x1a1f26,metalness:0.95,roughness:0.28,envMapIntensity:1.3});
 const coreMat=new THREE.MeshBasicMaterial({color:engineColor});
 const bodyLen=2.05+tier*0.12;
 const body=new THREE.Mesh(new THREE.CylinderGeometry(0.40,0.30,bodyLen,14,1,false),hullMat);
 body.rotation.x=Math.PI/2; g.add(body);
 for(let i=0;i<3+tier;i++){ const r=new THREE.Mesh(new THREE.TorusGeometry(0.405-i*0.022,0.018,6,20),darkMat);
  r.position.z=0.7-i*0.5; g.add(r); }
 const nose=new THREE.Mesh(new THREE.ConeGeometry(0.30,0.98,14),hullMat);
 nose.rotation.x=-Math.PI/2; nose.position.z=-bodyLen/2-0.48; g.add(nose);
 const canopy=new THREE.Mesh(new THREE.SphereGeometry(0.24,16,12),glassMat);
 canopy.scale.set(1.0,0.72,2.0); canopy.position.set(0,0.22,-0.42); g.add(canopy);
 const canopyGlow=new THREE.Mesh(new THREE.SphereGeometry(0.20,12,8),
  new THREE.MeshBasicMaterial({color:0x39d8ff,transparent:true,opacity:0.22,blending:THREE.AdditiveBlending,depthWrite:false}));
 canopyGlow.scale.copy(canopy.scale); canopyGlow.position.copy(canopy.position); g.add(canopyGlow);
 const wingWidth=1.55+tier*0.10;
 const wingGeo=new THREE.BoxGeometry(wingWidth,0.075,0.62);
 for(const s of [-1,1]){
  const w=new THREE.Mesh(wingGeo,hullMat);
  w.position.set(s*(0.86+tier*0.03),-0.02,0.42);
  w.rotation.z=s*-0.14; w.rotation.y=s*0.10; g.add(w);
  const strip=new THREE.Mesh(new THREE.BoxGeometry(1.15+tier*0.08,0.02,0.10),accentMat);
  strip.position.set(s*(0.84+tier*0.03),0.045,0.34); strip.rotation.z=s*-0.14; g.add(strip);
  const tip=new THREE.Mesh(new THREE.SphereGeometry(0.055,8,6),
   new THREE.MeshBasicMaterial({color:s<0?0xff3a3a:0x3affa0}));
  tip.position.set(s*(1.58+tier*0.1),-0.05,0.42); g.add(tip);
  if(tier>=2){ const ex=new THREE.Mesh(new THREE.BoxGeometry(0.7,0.05,0.42),hullMat);
   ex.position.set(s*(1.6+tier*0.1),0.04,0.62); ex.rotation.z=s*-0.28; g.add(ex); } }
 for(const s of [-1,1]){ const f=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.42,0.62),finMat);
  f.position.set(s*0.30,0.30,0.86); f.rotation.z=s*-0.28; g.add(f); }
 const tail=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.5,0.6),finMat);
 tail.position.set(0,-0.34,0.86); g.add(tail);
 const flames=[],engineCores=[];
 const engineZ=bodyLen/2+0.15;
 for(const s of [-1,1]){
  const housing=new THREE.Mesh(new THREE.CylinderGeometry(0.205+tier*0.02,0.235,0.62,12),engineMat);
  housing.rotation.x=Math.PI/2; housing.position.set(s*0.235,-0.03,engineZ); g.add(housing);
  const core=new THREE.Mesh(new THREE.CircleGeometry(0.165+tier*0.015,16),coreMat);
  core.position.set(s*0.235,-0.03,engineZ+0.32); core.rotation.y=Math.PI; g.add(core); engineCores.push(core);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.20,0.022,6,18),accentMat);
  ring.position.set(s*0.235,-0.03,engineZ+0.28); g.add(ring);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(0.20+tier*0.02,1.5+tier*0.2,12,1,true),
   new THREE.MeshBasicMaterial({color:engineColor,transparent:true,opacity:0.92,blending:THREE.AdditiveBlending,depthWrite:false}));
  flame.rotation.x=Math.PI/2; flame.position.set(s*0.235,-0.03,engineZ+1.05); g.add(flame);
  const inner=new THREE.Mesh(new THREE.ConeGeometry(0.10,0.85,10,1,true),
   new THREE.MeshBasicMaterial({color:0xfff2c8,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false}));
  inner.rotation.x=Math.PI/2; inner.position.set(s*0.235,-0.03,engineZ+0.75); g.add(inner);
  const sheath=new THREE.Mesh(new THREE.ConeGeometry(0.28+tier*0.03,2.4+tier*0.3,12,1,true),
   new THREE.MeshBasicMaterial({color:trailColor,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false}));
  sheath.rotation.x=Math.PI/2; sheath.position.set(s*0.235,-0.03,engineZ+1.45); g.add(sheath);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowY,color:engineColor,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0.9}));
  glow.scale.set(1.5+tier*0.2,1.5+tier*0.2,1); glow.position.set(s*0.235,-0.03,engineZ+0.45); g.add(glow);
  flames.push({flame,inner,sheath,glow,side:s}); }
 const hullLights=[];
 const lp=[[-0.40,-0.18,-0.9],[0.40,-0.18,-0.9],[-0.42,0.10,0.10],[0.42,0.10,0.10],[0,0.30,-1.25],[0,-0.30,-1.05]];
 for(const [x,y,z] of lp){ const l=new THREE.Mesh(new THREE.SphereGeometry(0.036,6,5),
   new THREE.MeshBasicMaterial({color:accentColor})); l.position.set(x,y,z); g.add(l); hullLights.push(l); }
 const strip=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.02,1.5),accentMat);
 strip.position.set(0,-0.36,0.1); g.add(strip);

 const sparksGroup=new THREE.Group();
 for(let i=0;i<5;i++){
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowR,color:0xffaa55,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
  sp.scale.set(0.4,0.4,1);
  sp.position.set(rnd(-0.3,0.3),rnd(-0.2,0.2),rnd(-1,0.8));
  sparksGroup.add(sp);
 }
 g.add(sparksGroup);
 const smokeGroup=new THREE.Group();
 for(let i=0;i<4;i++){
  const sm=new THREE.Sprite(new THREE.SpriteMaterial({map:TEX.glowW,color:0x333333,transparent:true,opacity:0,blending:THREE.NormalBlending,depthWrite:false}));
  sm.scale.set(1.2,1.2,1);
  sm.position.set(rnd(-0.4,0.4),rnd(0.1,0.5),rnd(-1,1));
  smokeGroup.add(sm);
 }
 g.add(smokeGroup);

 return {group:g,flames,engineCores,hullLights,sparksGroup,smokeGroup};
}
function rocketTier(id){ return Math.min(4,Math.floor((SAVE.mastery[id]||0)/800)); }

