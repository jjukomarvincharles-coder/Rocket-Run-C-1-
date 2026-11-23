/* ========== HUD ELEMENTS ========== */
const el={
 score:document.getElementById('scoreVal'),best:document.getElementById('bestVal'),
 hullFill:document.getElementById('hullFill'),hullVal:document.getElementById('hullVal'),
 engineFill:document.getElementById('engineFill'),engineVal:document.getElementById('engineVal'),
 ckHullDial:document.getElementById('ckHullDial'),ckHullVal:document.getElementById('ckHullVal'),
 ckEngineDial:document.getElementById('ckEngineDial'),ckEngineVal:document.getElementById('ckEngineVal'),
 ckThr:document.getElementById('ckThr'),
 ckSpeedVal:document.getElementById('ckSpeedVal'),
 ckShieldFill:document.getElementById('ckShieldFill'),
 ckShieldVal:document.getElementById('ckShieldVal'),
 ckFlightMode:document.getElementById('ckFlightMode'),
 ckBoostIndicator:document.getElementById('ckBoostIndicator'),
 ckRegion:document.getElementById('ckRegion'),
 ckSys:document.getElementById('ckSys'),
 boostWarp:document.getElementById('boostWarp'),
 boostFlash:document.getElementById('boostFlash'),
 fuelTime:document.getElementById('fuelTime'),fuelFill:document.getElementById('fuelFill'),
 mult:document.getElementById('multVal'),
 notify:document.getElementById('notify'),popups:document.getElementById('popups'),
 speedLines:document.getElementById('speedLines'),slowTint:document.getElementById('slowTint'),
 lowFuelVig:document.getElementById('lowFuelVig'),hitFlash:document.getElementById('hitFlash'),
 damageVig:document.getElementById('damageVig'),
 bhTint:document.getElementById('bhTint'),gravTint:document.getElementById('gravTint'),
 anomalyTint:document.getElementById('anomalyTint'),legendaryTint:document.getElementById('legendaryTint'),
 chainDisplay:document.getElementById('chainDisplay'),chainNum:document.getElementById('chainNum'),
 encounterBar:document.getElementById('encounterBar'),encName:document.getElementById('encName'),
 encFill:document.getElementById('encFill'),
 cinematic:document.getElementById('cinematic'),cineTitle:document.getElementById('cineTitle'),
 cineSub:document.getElementById('cineSub'),
 lvlVal:document.getElementById('lvlVal'),xpFill:document.getElementById('xpFill'),
 decisionModal:document.getElementById('decisionModal'),decHead:document.getElementById('decHead'),
 decTitle:document.getElementById('decTitle'),decText:document.getElementById('decText'),
 decOptions:document.getElementById('decOptions'),
 fleetWarning:document.getElementById('fleetWarning'),
 ambLeft:document.getElementById('ambLeft'),ambRight:document.getElementById('ambRight'),
 cockpitFrame:document.getElementById('cockpitFrame')
};
el.best.textContent=pad6(SAVE.best);

let hudAcc=0, radarAcc=0;
function updateHUD(){
 el.score.textContent=pad6(Game.score);
 el.best.textContent=pad6(Math.max(SAVE.best,Game.score));
 el.mult.textContent='x'+Game.mult;
 el.mult.classList.toggle('big',Game.mult>=3);
 const fp=clamp(Game.fuel/Game.fuelMax,0,1);
 el.fuelFill.style.width=(fp*100)+'%';
 el.fuelTime.textContent=fmtTime(Game.fuel);
 el.fuelFill.classList.toggle('warn',fp<0.4&&fp>=0.18);
 el.fuelFill.classList.toggle('crit',fp<0.18);
 el.lowFuelVig.style.opacity=fp<0.22?String((0.22-fp)*4):'0';
 const hp=clamp(Game.hull/Game.hullMax,0,1);
 el.hullFill.style.width=(hp*100)+'%';
 el.hullVal.textContent=Math.floor(Game.hull)+'%';
 el.hullFill.classList.toggle('warn',hp<0.5&&hp>=0.25);
 el.hullFill.classList.toggle('crit',hp<0.25);
 const ep=clamp(Game.engine/Game.engineMax,0,1);
 el.engineFill.style.width=(ep*100)+'%';
 el.engineVal.textContent=Math.floor(Game.engine)+'%';
 el.engineFill.classList.toggle('warn',ep<0.5&&ep>=0.25);
 el.engineFill.classList.toggle('crit',ep<0.25);
 if(el.ckHullDial){ el.ckHullDial.style.setProperty('--pct',Math.floor(hp*100));
  el.ckHullVal.textContent=Math.floor(Game.hull)+'%';
  el.ckHullDial.style.setProperty('--dial-color',hp<0.25?'#ff4a4a':hp<0.5?'#ffc23a':'#3ae9ff'); }
 if(el.ckEngineDial){ el.ckEngineDial.style.setProperty('--pct',Math.floor(ep*100));
  el.ckEngineVal.textContent=Math.floor(Game.engine)+'%';
  el.ckEngineDial.style.setProperty('--dial-color',ep<0.25?'#ff4a4a':ep<0.5?'#ffc23a':'#b46cff');
  if(el.ckThr) el.ckThr.textContent=Math.floor(ep)+'%'; }
 if(el.ckSpeedVal) el.ckSpeedVal.textContent=String(Math.round(Game.speed)).padStart(3,'0');
 if(el.ckShieldVal) el.ckShieldVal.textContent=Math.round(Game.shieldEnergy||0)+'%';
 if(el.ckShieldFill) el.ckShieldFill.style.width=clamp((Game.shieldEnergy||0),0,100)+'%';
 if(el.ckFlightMode) el.ckFlightMode.textContent=Game.abilities.boost>0?'HYPERDRIVE':(Game.abilities.slow>0?'TIME DILATION':'CRUISE');
 if(el.ckRegion) el.ckRegion.textContent=String((Game.region||0)+1).padStart(2,'0');
 if(el.ckSys) el.ckSys.textContent=(Game.engine<25||Game.hull<25)?'SYS · CRITICAL':(Game.engine<50||Game.hull<50?'SYS · CAUTION':'SYS · NOMINAL');
 el.damageVig.style.opacity=hp<0.35?String((0.35-hp)*1.6):'0';
 el.lvlVal.textContent=SAVE.level;
 el.xpFill.style.width=(clamp(SAVE.xp/xpToNext(),0,1)*100)+'%';
}
function updateAbilityHUD(){
 for(const k of ['boost','shield','magnet','slow','blast']){
  const c=document.getElementById('ct-'+k); if(c) c.textContent=Game.charges[k];
  const btn=document.getElementById('btn'+k.charAt(0).toUpperCase()+k.slice(1));
  if(btn){ btn.classList.toggle('empty',Game.charges[k]<=0); btn.classList.toggle('active',Game.abilities[k]>0); } }
}
function pushNotify(text,danger,gold,small){
 const d=document.createElement('div');
 d.className='notify-line'+(danger?' danger':'')+(gold?' gold':'')+(small?' small':'');
 d.textContent=text; el.notify.appendChild(d);
 void d.offsetWidth; d.classList.add('show');
 setTimeout(()=>d.remove(),2000);
}
function popup(text,x,y,color){
 const d=document.createElement('div'); d.className='popup'; d.textContent=text;
 d.style.left=x+'px'; d.style.top=y+'px';
 if(color) d.style.color=color;
 el.popups.appendChild(d); while(el.popups.children.length>5) el.popups.firstChild.remove(); setTimeout(()=>d.remove(),1050);
}
function toast(text){
 let t=document.querySelector('.toast');
 if(!t){ t=document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
 t.textContent=text; t.classList.add('on');
 clearTimeout(t._to); t._to=setTimeout(()=>t.classList.remove('on'),2300);
}
function flashScreen(s,cp){
 el.hitFlash.style.background=`radial-gradient(ellipse at 50% 60%, ${cp}0), ${cp}0.75))`;
 el.hitFlash.style.transition='opacity .08s';
 el.hitFlash.style.opacity=String(s);
 setTimeout(()=>{ el.hitFlash.style.transition='opacity .35s'; el.hitFlash.style.opacity='0'; },60);
}
let cineTimer=null;
function playCinematic(title,sub,dur=3.0){
 el.cineTitle.textContent=title; el.cineSub.textContent=sub||'';
 el.cinematic.classList.add('on'); Game.cinematic=dur;
 clearTimeout(cineTimer);
 cineTimer=setTimeout(()=>el.cinematic.classList.remove('on'),dur*1000);
}
let ambLeftTimer=null,ambRightTimer=null;
function showAmbLeft(title,text,danger){
 el.ambLeft.innerHTML=`<div class="amb-card${danger?' danger':''}"><div class="amb-title">${title}</div><div class="amb-text">${text}</div></div>`;
 el.ambLeft.classList.add('on');
 clearTimeout(ambLeftTimer); ambLeftTimer=setTimeout(()=>el.ambLeft.classList.remove('on'),3200);
}
function showAmbRight(title,text){
 el.ambRight.innerHTML=`<div class="amb-card cyan"><div class="amb-title">${title}</div><div class="amb-text">${text}</div></div>`;
 el.ambRight.classList.add('on');
 clearTimeout(ambRightTimer); ambRightTimer=setTimeout(()=>el.ambRight.classList.remove('on'),3400);
}
function showFleetWarning(){
 el.fleetWarning.classList.add('on');
 Sound.fleetWarn();
 clearTimeout(el.fleetWarning._t);
 el.fleetWarning._t=setTimeout(()=>el.fleetWarning.classList.remove('on'),2800);
}
let decisionResolver=null;
function showDecision(head,title,text,options){
 return new Promise(resolve=>{
  decisionResolver=resolve;
  el.decHead.textContent=head; el.decTitle.textContent=title; el.decText.textContent=text;
  el.decOptions.innerHTML='';
  options.forEach(opt=>{
   const btn=document.createElement('div');
   btn.className='dec-btn '+(opt.style||'');
   btn.innerHTML=`<div class="dbl">${opt.label}</div><div class="dd">${opt.detail||''}</div>`;
   btn.onclick=()=>{ el.decisionModal.classList.remove('on'); decisionResolver=null;
    Sound.decision(); resolve(opt.value); };
   el.decOptions.appendChild(btn);
  });
  el.decisionModal.classList.add('on'); Sound.decision();
 });
}

