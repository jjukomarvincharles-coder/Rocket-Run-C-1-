/* ========== BOOT ========== */
function boot(){
 applyQuality(SAVE.settings.quality);
 onResize(); initPools();
 createRocketInstance(); buildShield(); buildMagnet(); rebuildEnvMap();
 Sound.enabled=SAVE.settings.sound; Sound.musicEnabled=SAVE.settings.music;
 updateDroneButton();
 menuBackground();
 setCameraMode(SAVE.cameraMode||0);
 showMenu();
 requestAnimationFrame(loop);
}
const unlockAudio=()=>{ Sound.init(); Sound.resume(); Sound.setRegion(Game.region||0);
 if(SAVE.settings.music) Sound.startMusic();
 window.removeEventListener('pointerdown',unlockAudio);
 window.removeEventListener('touchstart',unlockAudio);
 window.removeEventListener('keydown',unlockAudio); };
window.addEventListener('pointerdown',unlockAudio);
window.addEventListener('touchstart',unlockAudio);
window.addEventListener('keydown',unlockAudio);
boot();
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('dblclick',e=>e.preventDefault());
