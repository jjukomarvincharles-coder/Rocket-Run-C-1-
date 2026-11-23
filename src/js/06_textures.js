/* ========== TEXTURES ========== */
function cvs(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
var perfScale=1, perfFx=1;
var perfLowTex=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
const _texMemo=new WeakMap();
function tex(c,r){ if(!r){ const hit=_texMemo.get(c); if(hit) return hit; }
 const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace;
 if(r){ t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(r,r);} t.anisotropy=2; if(!r) _texMemo.set(c,t); return t; }
function _makeSpaceRaw(a,b){
 const W=2048,H=1024,c=cvs(W,H),g=c.getContext('2d');
 const base=g.createLinearGradient(0,0,0,H); base.addColorStop(0,'#01030c'); base.addColorStop(.5,'#03061a'); base.addColorStop(1,'#01030c');
 g.fillStyle=base; g.fillRect(0,0,W,H);
 const cA=new THREE.Color(a),cB=new THREE.Color(b);
 const rgb=col=>`${Math.floor(col.r*255)},${Math.floor(col.g*255)},${Math.floor(col.b*255)}`;
 g.globalCompositeOperation='lighter';
 for(let i=0;i<9;i++){ const px=Math.random(),py=rnd(0.18,0.82),r=rnd(300,560);
  const x=px*W,y=py*H,col=Math.random()<0.5?cA:cB;
  const rg=g.createRadialGradient(x,y,0,x,y,r); rg.addColorStop(0,`rgba(${rgb(col)},0.55)`);
  rg.addColorStop(0.35,`rgba(${rgb(col)},0.22)`); rg.addColorStop(1,`rgba(${rgb(col)},0)`);
  g.fillStyle=rg; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
 for(let i=0;i<200;i++){ const x=Math.random()*W,y=Math.random()*H,r=rnd(40,180);
  const col=Math.random()<0.5?cA:cB; const rg=g.createRadialGradient(x,y,0,x,y,r);
  rg.addColorStop(0,`rgba(${rgb(col)},0.07)`); rg.addColorStop(1,`rgba(${rgb(col)},0)`);
  g.fillStyle=rg; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
 for(let i=0;i<2600;i++){ const x=Math.random()*W,y=Math.random()*H;
  const s=Math.pow(Math.random(),3.2)*2.4+0.35,a=rnd(0.25,1),t=Math.random();
  const col=t<0.72?`rgba(255,255,255,${a})`:t<0.88?`rgba(180,215,255,${a})`:t<0.96?`rgba(255,225,190,${a})`:`rgba(200,180,255,${a})`;
  g.fillStyle=col; g.beginPath(); g.arc(x,y,s,0,TAU); g.fill(); }
 for(let i=0;i<42;i++){ const x=Math.random()*W,y=Math.random()*H,r=rnd(3,7);
  const rg=g.createRadialGradient(x,y,0,x,y,r*6); rg.addColorStop(0,'rgba(255,255,255,0.95)');
  rg.addColorStop(0.2,'rgba(180,230,255,0.4)'); rg.addColorStop(1,'rgba(120,180,255,0)');
  g.fillStyle=rg; g.beginPath(); g.arc(x,y,r*6,0,TAU); g.fill(); }
 g.globalCompositeOperation='source-over'; return c; }
const _spaceCache=new Map();
function makeSpaceTexture(a,b){ const key=a+'|'+b; let c=_spaceCache.get(key);
 if(!c){ if(_spaceCache.size>=12){ c=[..._spaceCache.values()][Math.floor(Math.random()*_spaceCache.size)]; }
  else { c=_makeSpaceRaw(a,b); if(perfLowTex){ const s=cvs(1024,512); s.getContext('2d').drawImage(c,0,0,1024,512); c=s; } _spaceCache.set(key,c); } }
 return c; }
const _planetCache=new Map();
function makePlanetTexture(b,a,seed){ const key=b+'|'+a+'|'+(Math.floor(seed)%3); let c=_planetCache.get(key);
 if(!c){ if(_planetCache.size>=12){ c=[..._planetCache.values()][Math.floor(Math.random()*_planetCache.size)]; }
  else { c=_makePlanetRaw(b,a,seed); _planetCache.set(key,c); } }
 return c; }
function _makePlanetRaw(b,a,seed){
 const W=1024,H=512,c=cvs(W,H),g=c.getContext('2d');
 const base=new THREE.Color(b),acc=new THREE.Color(a);
 g.fillStyle='#'+base.getHexString(); g.fillRect(0,0,W,H);
 let y=0; while(y<H){ const h=rnd(6,34),t=Math.random();
  const col=base.clone().lerp(acc,t*0.9).offsetHSL(0,0,rnd(-0.07,0.09));
  g.fillStyle='#'+col.getHexString(); g.globalAlpha=rnd(0.35,0.95);
  g.beginPath(); g.moveTo(0,y);
  for(let x=0;x<=W;x+=32) g.lineTo(x,y+Math.sin((x/W)*TAU*2+seed+y*0.05)*rnd(2,9));
  g.lineTo(W,y+h);
  for(let x=W;x>=0;x-=32) g.lineTo(x,y+h+Math.sin((x/W)*TAU*2+seed+y*0.05)*rnd(2,9));
  g.closePath(); g.fill(); y+=h; }
 g.globalAlpha=1;
 for(let i=0;i<14;i++){ const x=Math.random()*W,yy=Math.random()*H,r=rnd(16,60);
  const rg=g.createRadialGradient(x,yy,0,x,yy,r);
  const col=acc.clone().offsetHSL(0,0.05,rnd(-0.15,0.15));
  rg.addColorStop(0,`rgba(${Math.floor(col.r*255)},${Math.floor(col.g*255)},${Math.floor(col.b*255)},0.6)`);
  rg.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=rg;
  g.beginPath(); g.ellipse(x,yy,r*1.7,r*0.7,0,0,TAU); g.fill(); }
 return c; }
function makeRockTexture(){
 const S=256,c=cvs(S,S),g=c.getContext('2d');
 g.fillStyle='#9a8d7c'; g.fillRect(0,0,S,S);
 for(let i=0;i<5200;i++){ const x=Math.random()*S,y=Math.random()*S,r=rnd(0.5,3.2);
  const l=rnd(-45,45),v=clamp(150+l,80,230)|0;
  g.fillStyle=`rgb(${v},${(v*0.93)|0},${(v*0.85)|0})`; g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
 for(let i=0;i<26;i++){ const x=Math.random()*S,y=Math.random()*S,r=rnd(5,22);
  const rg=g.createRadialGradient(x-r*0.3,y-r*0.3,r*0.1,x,y,r);
  rg.addColorStop(0,'rgba(48,40,32,0.6)'); rg.addColorStop(0.7,'rgba(110,100,88,0.32)');
  rg.addColorStop(1,'rgba(205,192,172,0.2)'); g.fillStyle=rg;
  g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
 return c; }
function makeGlowTexture(inner='rgba(255,255,255,1)',mid='rgba(120,220,255,0.42)'){
 const S=128,c=cvs(S,S),g=c.getContext('2d');
 const rg=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
 rg.addColorStop(0,inner); rg.addColorStop(0.28,mid); rg.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=rg; g.fillRect(0,0,S,S); return c; }
function makeGalaxyTexture(){
 const S=512,c=cvs(S,S),g=c.getContext('2d'); g.clearRect(0,0,S,S); g.globalCompositeOperation='lighter';
 const cx=S/2,cy=S/2;
 let rg=g.createRadialGradient(cx,cy,0,cx,cy,S*0.22);
 rg.addColorStop(0,'rgba(255,246,230,0.95)'); rg.addColorStop(0.35,'rgba(200,180,255,0.5)');
 rg.addColorStop(1,'rgba(120,90,220,0)'); g.fillStyle=rg; g.beginPath(); g.arc(cx,cy,S*0.22,0,TAU); g.fill();
 for(let a=0;a<2;a++){ for(let i=0;i<2600;i++){ const t=Math.pow(Math.random(),0.65);
  const ang=a*(TAU/2)+t*2.6*TAU+rnd(-0.22,0.22); const rad=14+t*S*0.45;
  const x=cx+Math.cos(ang)*rad+rnd(-7,7); const y=cy+Math.sin(ang)*rad*0.86+rnd(-7,7);
  const sz=rnd(0.6,2.6)*(1-t*0.6); const alpha=(1-t)*rnd(0.16,0.55);
  const col=t<0.25?`rgba(255,240,220,${alpha})`:t<0.6?`rgba(190,200,255,${alpha})`:`rgba(150,120,255,${alpha})`;
  g.fillStyle=col; g.beginPath(); g.arc(x,y,sz,0,TAU); g.fill(); }} return c; }

const TEX={};
function buildTextures(){
 TEX.rock=tex(makeRockTexture(),1);
 TEX.glowW=tex(makeGlowTexture('rgba(255,255,255,1)','rgba(160,230,255,0.5)'));
 TEX.glowC=tex(makeGlowTexture('rgba(220,255,255,1)','rgba(58,233,255,0.55)'));
 TEX.glowG=tex(makeGlowTexture('rgba(230,255,230,1)','rgba(80,255,140,0.5)'));
 TEX.glowR=tex(makeGlowTexture('rgba(255,235,225,1)','rgba(255,90,60,0.5)'));
 TEX.glowY=tex(makeGlowTexture('rgba(255,250,220,1)','rgba(255,200,60,0.5)'));
 TEX.glowV=tex(makeGlowTexture('rgba(240,220,255,1)','rgba(180,108,255,0.55)'));
 TEX.glowM=tex(makeGlowTexture('rgba(255,220,245,1)','rgba(255,74,216,0.55)'));
 TEX.galaxy=tex(makeGalaxyTexture()); }

