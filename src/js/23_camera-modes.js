/* ========== CAMERA MODES ========== */
const CameraMode={ current:0 };
function setCameraMode(m){
 CameraMode.current=m; SAVE.cameraMode=m; persist();
 Game.cameraMode=m;
 const camBtn=document.getElementById('camBtn'); if(camBtn){ camBtn.dataset.mode=['CHASE','COCKPIT','NOSE'][m]||'CHASE'; camBtn.setAttribute('aria-label','Camera view: '+(['Chase','Cockpit','Nose'][m]||'Chase')+'. Tap to change'); }
 document.getElementById('cockpitFrame').classList.toggle('on',m===1);
 if(rocket){
  rocket.group.visible=(m===0);
 }
 Sound.setCameraMode(m); Sound.cameraSwitch();
}
function cycleCamera(){ setCameraMode((CameraMode.current+1)%3); }

