/* ========== ABILITY BUTTONS + SOUND + CAMERA WIRING ========== */
['boost','shield','magnet','slow','blast'].forEach(k=>{
 const id='btn'+k.charAt(0).toUpperCase()+k.slice(1);
 const btn=document.getElementById(id);
 if(!btn) return;
 const fire=(e)=>{ e.preventDefault(); Sound.init(); Sound.resume(); activateAbility(k); };
 btn.addEventListener('touchstart',fire,{passive:false});
 btn.addEventListener('mousedown',fire);
});
document.getElementById('droneBtn').addEventListener('click',(e)=>{ e.preventDefault(); toggleDrone(); });
const CAM_NAMES=['CHASE VIEW','COCKPIT VIEW','NOSE VIEW'];
document.getElementById('camBtn').addEventListener('click',()=>{ cycleCamera(); toast(CAM_NAMES[CameraMode.current]); });
const shieldEdgeEl=document.getElementById('shieldEdge');
document.getElementById('photoBtn').addEventListener('click',togglePhotoMode);
document.getElementById('photoExit').addEventListener('click',togglePhotoMode);
document.getElementById('photoCapture').addEventListener('click',capturePhoto);
let photoYaw=0,photoPitch=0.18,photoDist=9,photoDragging=false,photoLastX=0,photoLastY=0,photoPinchD=0;
function togglePhotoMode(){
 if(Game.state!=='PLAYING') return;
 Game.photoMode=!Game.photoMode;
 document.getElementById('photoBtn').classList.toggle('off',!Game.photoMode);
 document.getElementById('photoControls').classList.toggle('on',Game.photoMode);
 if(Game.photoMode){ photoYaw=0; photoPitch=0.18; photoDist=8.5; Sound.init(); toast('PHOTO MODE · ON'); }
 else toast('PHOTO MODE · OFF');
}
function applyPhotoCamera(){
 const x=rocketPos.x+Math.sin(photoYaw)*Math.cos(photoPitch)*photoDist;
 const y=rocketPos.y+Math.sin(photoPitch)*photoDist+0.6;
 const z=rocketPos.z+Math.cos(photoYaw)*Math.cos(photoPitch)*photoDist;
 camera.position.set(x,y,z);
 camera.lookAt(rocketPos.x,rocketPos.y+0.3,rocketPos.z);
 camera.rotation.z=0;
}
function capturePhoto(){
 if(composer) composer.render(); else renderer.render(scene,camera);
 ScreenFX.render();
 try{
  const url=canvasEl.toDataURL('image/png');
  const a=document.createElement('a'); a.href=url; a.download='rocket-run-photo.png';
  document.body.appendChild(a); a.click(); a.remove();
  toast('PHOTO SAVED');
 }catch(e){ toast('COULD NOT SAVE PHOTO'); }
}
canvasEl.addEventListener('pointerdown',e=>{ if(!Game.photoMode) return; photoDragging=true; photoLastX=e.clientX; photoLastY=e.clientY; });
window.addEventListener('pointermove',e=>{ if(!Game.photoMode||!photoDragging) return;
 const dx=e.clientX-photoLastX, dy=e.clientY-photoLastY; photoLastX=e.clientX; photoLastY=e.clientY;
 photoYaw-=dx*0.007; photoPitch=clamp(photoPitch+dy*0.006,-1.2,1.2); });
window.addEventListener('pointerup',()=>{ photoDragging=false; });
canvasEl.addEventListener('wheel',e=>{ if(!Game.photoMode) return; e.preventDefault();
 photoDist=clamp(photoDist+e.deltaY*0.01,3,22); },{passive:false});
canvasEl.addEventListener('touchmove',e=>{ if(!Game.photoMode) return;
 if(e.touches.length===2){ e.preventDefault();
  const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
  if(photoPinchD) photoDist=clamp(photoDist-(d-photoPinchD)*0.03,3,22);
  photoPinchD=d; } },{passive:false});
canvasEl.addEventListener('touchend',()=>{ photoPinchD=0; });
function updateDroneButton(){
 const b=document.getElementById('droneBtn'); if(!b) return;
 const active=!!SAVE.settings.dronesActive;
 b.classList.toggle('off',!active); b.classList.toggle('online',active);
 b.setAttribute('aria-pressed',String(active));
 b.setAttribute('aria-label',active?'Co-pilot drone on. Tap to switch off':'Co-pilot drone off. Tap to switch on');
 const state=document.getElementById('droneState'); if(state) state.textContent=active?'ON':'OFF';
}
function toggleDrone(){
 SAVE.settings.dronesActive=!SAVE.settings.dronesActive;
 if(!SAVE.settings.dronesActive){
  for(const bolt of droneBoltPool){ if(bolt&&bolt.active) bolt.despawn(); }
  if(droneEscort) droneEscort.visible=false;
 }
 updateDroneButton();
 toast(SAVE.settings.dronesActive?'CO-PILOT DRONE · ONLINE':'CO-PILOT DRONE · OFFLINE');
 persist();
}
function toggleSound(){
 Sound.init(); SAVE.settings.sound=!SAVE.settings.sound;
 Sound.setEnabled(SAVE.settings.sound);

 persist();
}


