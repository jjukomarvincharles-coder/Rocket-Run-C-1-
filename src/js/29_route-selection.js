/* ========== ROUTE SELECTION ========== */
function showRouteSelection(){
 Game.state='ROUTE'; Sound.route();
 const nextLeg=Game.expedition[Game.legIndex+1];
 const curRegion=Game.region;
 const opts=[];
 const detectedSecrets=[];
 for(const key in SECRET_REGIONS){ if(!SAVE.discoveredSecrets[key]&&SAVE.seenSignal[key]) detectedSecrets.push(key); }
 if(nextLeg){ opts.push({key:'plan',region:nextLeg.region,type:nextLeg.type,label:REGIONS[nextLeg.region].name,
  danger:REGIONS[nextLeg.region].danger,reward:REGIONS[nextLeg.region].reward}); }
 const safeRegion=clamp(curRegion+(Math.random()<0.5?0:1),0,REGIONS.length-1);
 opts.push({key:'safe',region:safeRegion,type:'safe',label:REGIONS[safeRegion].name+' (SAFE)',
  danger:Math.max(1,REGIONS[safeRegion].danger-1),reward:REGIONS[safeRegion].reward*0.9});
 const unknownRegion=clamp(curRegion+rndi(2,4),0,REGIONS.length-1);
 opts.push({key:'unknown',region:unknownRegion,type:'unknown',label:'UNKNOWN',danger:null,reward:null,desc:'No data. No map. No return.'});
 if(detectedSecrets.length){ const key=pick(detectedSecrets); const sr=SECRET_REGIONS[key];
  opts.push({key:'secret',secretKey:key,label:'★ '+sr.name,type:'secret',danger:sr.danger,reward:sr.reward,desc:sr.desc,secret:true}); }
 const ov=document.getElementById('overlay'); ov.classList.remove('hidden');
 ov.innerHTML=`<div class="screen">
  <div class="section-title">ROUTE SELECTION</div>
  <div class="subtitle">SECTOR CLEARED · CHOOSE YOUR PATH</div>
  <div class="route-list" id="routeList"></div>
  <div class="card" style="width:100%;text-align:center">
   <div style="font-size:12px;letter-spacing:2px;color:rgba(190,235,255,.7)">
    DANGER INCREASES REWARD · UNKNOWN PATHS CAN BE ANYTHING
   </div>
  </div></div>`;
 const list=ov.querySelector('#routeList');
 opts.forEach(o=>{
  const el2=document.createElement('div');
  const cls='card route'+(o.key==='unknown'?' unknown':'')+(o.type==='risk'?' risk':'')+(o.secret?' secret':'');
  el2.className=cls;
  const reg=o.secret?o:REGIONS[o.region];
  const dTxt=o.danger===null?'?????':'★'.repeat(clamp(o.danger,1,5))+'☆'.repeat(clamp(5-o.danger,0,4));
  const rTxt=o.reward===null?'?????':'★'.repeat(clamp(Math.round(o.reward),1,5))+'☆'.repeat(clamp(5-Math.round(o.reward),0,4));
  el2.innerHTML=`<div class="rn" style="color:#${new THREE.Color(reg.accent).getHexString()}">${o.label}</div>
   <div class="rd">${o.desc||reg.desc}</div>
   <div class="rr" style="color:#${new THREE.Color(reg.accent).getHexString()}">DANGER ${dTxt}<br>REWARD ${rTxt}</div>`;
  el2.onclick=()=>chooseRoute(o);
  list.appendChild(el2);
 });
}
function chooseRoute(o){
 if(o.secret){
  Game.secretRegion=o.secretKey;
  Game.region=SECRET_REGIONS[o.secretKey].danger-1;
  applyRegion(Game.region,o.secretKey);
  playCinematic('★ SECRET SECTOR ★',SECRET_REGIONS[o.secretKey].name,4.0);
  Game.difficulty+=0.5;
  Game.mult=Math.min(5,Game.mult+2);
  Game.scoreFloat+=3000*Game.mult;
  SAVE.coins+=1500; addXP(2000);
  toast('SECRET SECTOR REACHED · +1500¢');
 } else {
  Game.secretRegion=null;
  Game.region=o.region;
  applyRegion(o.region);
  playCinematic('SECTOR '+String(o.region+1).padStart(2,'0'),REGIONS[o.region].name,3.2);
  Game.difficulty+=0.1+o.region*0.045;
  if(o.type==='unknown'){ Game.mult=Math.min(5,Game.mult+1); Game.scoreFloat+=900*Game.mult; Game.coins+=250; toast('UNKNOWN ROUTE · +250¢'); }
  if(o.type==='risk') Game.difficulty+=0.3;
 }
 Game.regionTime=0; Game.routeShown=false; Game.legIndex++;
 Game.state='PLAYING';
 const ov=document.getElementById('overlay'); ov.classList.add('hidden'); ov.innerHTML='';
 Sound.blip(880,0.3,'triangle',0.2,1400);
 if(Game.mode==='gauntlet'){ Game.fuel=Math.min(Game.fuelMax,Game.fuel+120); toast('SECTOR CLEARED · +120s FUEL'); }
 updateHUD();
}

