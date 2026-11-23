/* ========== FX ========== */
class FXSystem{
 constructor(){
  const N=(typeof perfLowTex!=='undefined'&&perfLowTex)?220:400; this.N=N;
  this.pos=new Float32Array(N*3); this.col=new Float32Array(N*3); this.siz=new Float32Array(N); this.alp=new Float32Array(N);
  this.vel=new Float32Array(N*3); this.life=new Float32Array(N); this.max=new Float32Array(N); this.s0=new Float32Array(N);
  this.next=0; this.hi=0; this.pts=null; this.colDirty=false; this.rings=[]; this._c=new THREE.Color();
  this.ringGeo=new THREE.RingGeometry(0.6,0.78,48);
 }
 ensure(){ if(this.pts) return;
  const g=new THREE.BufferGeometry();
  const dyn=a=>a.setUsage(THREE.DynamicDrawUsage);
  g.setAttribute('position',dyn(new THREE.BufferAttribute(this.pos,3)));
  g.setAttribute('aCol',dyn(new THREE.BufferAttribute(this.col,3)));
  g.setAttribute('aSize',dyn(new THREE.BufferAttribute(this.siz,1)));
  g.setAttribute('aAlpha',dyn(new THREE.BufferAttribute(this.alp,1)));
  this.mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uScale:{value:600}},
   vertexShader:'attribute vec3 aCol; attribute float aSize; attribute float aAlpha; varying vec3 vC; varying float vA; uniform float uScale;\n'+
    'void main(){ vC=aCol; vA=aAlpha; vec4 mv=modelViewMatrix*vec4(position,1.0); gl_Position=projectionMatrix*mv;\n'+
    ' gl_PointSize=clamp(aSize*uScale/max(0.1,-mv.z),0.0,200.0); }',
   fragmentShader:'varying vec3 vC; varying float vA;\n'+
    'void main(){ float d=length(gl_PointCoord-0.5)*2.0; float a=clamp(1.0-d,0.0,1.0); a*=a; gl_FragColor=vec4(vC*1.5,a*vA); }'});
  this.pts=new THREE.Points(g,this.mat); this.pts.frustumCulled=false; this.pts.renderOrder=5; scene.add(this.pts);
 }
 burst(pos,color,count=14,speed=7,size=0.5,life=0.65){
  this.ensure(); const c=this._c.set(color);
  count=Math.max(2,Math.round(count*perfFx));
  for(let k=0;k<count;k++){ const i=this.next; this.next=(this.next+1)%this.N; const j=i*3;
   this.pos[j]=pos.x; this.pos[j+1]=pos.y; this.pos[j+2]=pos.z;
   const x=rnd(-1,1),y=rnd(-1,1),z=rnd(-1,1),sp=speed*rnd(0.4,1.2)/(Math.hypot(x,y,z)||1);
   this.vel[j]=x*sp; this.vel[j+1]=y*sp; this.vel[j+2]=z*sp;
   this.col[j]=c.r; this.col[j+1]=c.g; this.col[j+2]=c.b;
   this.s0[i]=size*rnd(0.6,1.3); this.life[i]=this.max[i]=life; this.siz[i]=this.s0[i]; this.alp[i]=1;
   if(i+1>this.hi) this.hi=i+1; }
  this.colDirty=true; }
 ring(pos,color,maxR=12,life=0.7){
  let r=this.rings.find(x=>x.life<=0);
  if(!r){ if(this.rings.length<10){ const m=new THREE.Mesh(this.ringGeo,new THREE.MeshBasicMaterial({transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));
    scene.add(m); r={obj:m,life:0,max:1,maxR:1}; this.rings.push(r); } else r=this.rings[0]; }
  r.obj.material.color.set(color); r.obj.position.copy(pos); r.obj.visible=true; r.life=r.max=life; r.maxR=maxR; }
 update(dt){
  if(this.pts){
   let newHi=0; const hi=this.hi, damp=1-dt*2.4;
   for(let i=0;i<hi;i++){ if(this.life[i]<=0) continue; this.life[i]-=dt; const j=i*3;
    if(this.life[i]<=0){ this.siz[i]=0; this.alp[i]=0; continue; }
    const t=1-this.life[i]/this.max[i];
    this.vel[j]*=damp; this.vel[j+1]*=damp; this.vel[j+2]*=damp;
    this.pos[j]+=this.vel[j]*dt; this.pos[j+1]+=this.vel[j+1]*dt; this.pos[j+2]+=this.vel[j+2]*dt;
    this.siz[i]=this.s0[i]*(1+t*1.4); this.alp[i]=1-t; newHi=i+1; }
   const g=this.pts.geometry;
   if(hi>0||newHi>0){ g.attributes.position.needsUpdate=true; g.attributes.aSize.needsUpdate=true; g.attributes.aAlpha.needsUpdate=true;
    if(this.colDirty){ g.attributes.aCol.needsUpdate=true; this.colDirty=false; } }
   this.hi=newHi; g.setDrawRange(0,Math.max(newHi,hi>0?hi:0)); this.pts.visible=(newHi>0||hi>0);
   this.mat.uniforms.uScale.value=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360)); }
  for(const r of this.rings){ if(r.life<=0) continue; r.life-=dt; const t=1-r.life/r.max;
   if(r.life<=0){ r.obj.visible=false; continue; }
   r.obj.scale.setScalar(0.4+t*r.maxR); r.obj.material.opacity=0.9*(1-t); } }
 clear(){ this.life.fill(0); this.siz.fill(0); this.alp.fill(0); this.hi=0; if(this.pts) this.pts.visible=false;
  for(const r of this.rings){ r.life=0; r.obj.visible=false; } }
}
const FX=new FXSystem();

