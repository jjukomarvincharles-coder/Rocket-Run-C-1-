/* ========== MINIMAP RADAR ========== */
const radarCanvas=document.getElementById('radarCanvas');
const radarCtx=radarCanvas?radarCanvas.getContext('2d'):null;
const RADAR_RANGE=150;
const radarPanelEl=document.getElementById('radarPanel');
function drawRadar(){
 if(!radarCtx) return;
 let threat=false;
 const W=radarCanvas.width,H=radarCanvas.height,cx=W/2,cy=H*0.86,R=W*0.46;
 radarCtx.clearRect(0,0,W,H);
 radarCtx.strokeStyle='rgba(58,233,255,.16)'; radarCtx.lineWidth=1;
 for(let r=1;r<=3;r++){ radarCtx.beginPath(); radarCtx.arc(cx,cy,R*r/3,0,TAU); radarCtx.stroke(); }
 function plot(x,z,color,size){
  const fx=cx+clamp(x/BOUND_X,-1,1)*R*0.92;
  const dist=clamp(-z,0,RADAR_RANGE)/RADAR_RANGE;
  const fy=cy-dist*R;
  radarCtx.fillStyle=color; radarCtx.beginPath(); radarCtx.arc(fx,fy,size,0,TAU); radarCtx.fill();
 }
 for(const a of pool.asteroids){ if(a.active&&a.mesh.position.z>-RADAR_RANGE&&a.mesh.position.z<20)
  plot(a.mesh.position.x,a.mesh.position.z,'rgba(190,180,160,.85)',a.radius>2?2.6:1.7); }
 for(const c of pool.collectibles){ if(c.active&&c.group.position.z>-RADAR_RANGE&&c.group.position.z<20)
  plot(c.group.position.x,c.group.position.z,'rgba(255,207,77,.9)',1.5); }
 for(const e of enemyPool){ if(e.active&&e.pos.z>-RADAR_RANGE&&e.pos.z<20){ threat=true;
  plot(e.pos.x,e.pos.z,'#ff4a4a',2.6); } }
 if(Game.blackHole){ threat=true; plot(Game.blackHole.obj.position.x,Game.blackHole.obj.position.z,'#b46cff',4.2); }
 if(Game.gravityPlanet){ threat=true; plot(Game.gravityPlanet.mesh.position.x,Game.gravityPlanet.mesh.position.z,'#ff9a4a',4.6); }
 if(radarPanelEl) radarPanelEl.classList.toggle('show',threat);
 if(Game.wreck&&Game.wreck.obj) plot(Game.wreck.obj.position.x,Game.wreck.obj.position.z,'#7ef2ff',2.4);
 if(Game.station&&Game.station.obj) plot(Game.station.obj.position.x,Game.station.obj.position.z,'#3affa0',2.8);
 radarCtx.fillStyle='#3ae9ff';
 radarCtx.beginPath(); radarCtx.moveTo(cx,cy-6); radarCtx.lineTo(cx-4,cy+4); radarCtx.lineTo(cx+4,cy+4); radarCtx.closePath(); radarCtx.fill();
}

