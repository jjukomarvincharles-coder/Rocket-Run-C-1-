/* ========== ROCKET RUN V12 · MOBILE EXPERIENCE / BACK NAVIGATION ========== */
(function(){
 'use strict';
 const $=s=>document.querySelector(s);
 const nav={stack:[],current:{key:'menu',restore:()=>showMenu()},restoring:false,lastBackAt:0,exitMs:2200,nativeApp:null};
 function setCurrent(key,restore){nav.current={key,restore};}
 // Replace the screen render functions while preserving their original implementations and arguments.
 const originals={
  menu:showMenu,modes:showModes,expedition:showExpedition,garage:showGarage,upgrades:showUpgrades,
  missions:showMissions,journal:showJournal,logs:showLogs,hall:showHall,profile:showProfile,
  leaderboard:showLeaderboard,settings:showSettings
 };
 function makeTracked(key,original,isRoot){
  let wrapped;
  wrapped=function(...args){
   if(!nav.restoring){
    if(isRoot){nav.stack.length=0;setCurrent(key,()=>wrapped(...args));}
    else if(!nav.current||nav.current.key!==key){nav.stack.push(nav.current);setCurrent(key,()=>wrapped(...args));}
    else setCurrent(key,()=>wrapped(...args));
   }
   const result=original.apply(this,args);
   requestAnimationFrame(syncVisibleLayout);
   return result;
  };
  return wrapped;
 }
 showMenu=makeTracked('menu',originals.menu,true);
 showModes=makeTracked('modes',originals.modes,false);
 showExpedition=makeTracked('expedition',originals.expedition,false);
 showGarage=makeTracked('garage',originals.garage,false);
 showUpgrades=makeTracked('upgrades',originals.upgrades,false);
 showMissions=makeTracked('missions',originals.missions,false);
 showJournal=makeTracked('journal',originals.journal,false);
 showLogs=makeTracked('logs',originals.logs,false);
 showHall=makeTracked('hall',originals.hall,false);
 showProfile=makeTracked('profile',originals.profile,false);
 showLeaderboard=makeTracked('leaderboard',originals.leaderboard,false);
 showSettings=makeTracked('settings',originals.settings,false);

 const originalStartRun=startRun;
 startRun=function(...args){
  nav.stack.length=0;setCurrent('game',()=>{if(Game.state==='PAUSED')resumeGame();});
  document.body.classList.add('rr-in-flight');
  const result=originalStartRun.apply(this,args);syncVisibleLayout();return result;
 };
 const originalGameOver=showGameOver;
 showGameOver=function(...args){
  nav.stack=[{key:'menu',restore:()=>showMenu()}];setCurrent('gameover',()=>showMenu());
  document.body.classList.remove('rr-in-flight');return originalGameOver.apply(this,args);
 };
 const originalPause=pauseGame;
 pauseGame=function(...args){
  if(Game.state==='PLAYING'){nav.stack.push({key:'game',restore:()=>resumeGame()});setCurrent('pause',()=>resumeGame());}
  const result=originalPause.apply(this,args);document.body.classList.remove('rr-in-flight');return result;
 };
 const originalResume=resumeGame;
 resumeGame=function(...args){
  const result=originalResume.apply(this,args);
  if(Game.state==='PLAYING'){
   if(nav.current&&nav.current.key==='pause')nav.stack.pop();
   setCurrent('game',()=>{if(Game.state==='PAUSED')resumeGame();});
   document.body.classList.add('rr-in-flight');
  }
  syncVisibleLayout();return result;
 };
 function syncVisibleLayout(){
  document.body.classList.toggle('rr-in-flight',Game.state==='PLAYING');
  if($('#droneBtn'))updateDroneButton();
 }
 function notifyBackToExit(){
  if(typeof toast==='function')toast('PRESS BACK AGAIN TO EXIT');
 }
 async function exitApp(){
  if(nav.nativeApp){try{await nav.nativeApp.exitApp();return;}catch(err){console.warn('[Rocket Run] exitApp failed',err);}}
  notifyBackToExit();
 }
 function back(){
  const now=Date.now();
  const stationExit=$('#stLeave');if(stationExit){stationExit.click();return;}
  const decision=$('#decisionModal.on #decOptions .dec-btn:last-child');
  if(decision){decision.click();return;}
  if(Game.state==='PLAYING'){togglePause();return;}
  if(Game.state==='PAUSED'){resumeGame();return;}
  if(Game.state==='ROUTE'){
   const safe=$('#routeList .route');if(safe){safe.click();return;}
   Game.state='PLAYING';$('#overlay')?.classList.add('hidden');document.body.classList.add('rr-in-flight');return;
  }
  if(nav.current&&nav.current.key==='gameover'){showMenu();return;}
  const previous=nav.stack.pop();
  if(previous&&typeof previous.restore==='function'){
   nav.restoring=true;
   try{previous.restore();nav.current=previous;}
   finally{nav.restoring=false;}
   syncVisibleLayout();return;
  }
  if(nav.current&&nav.current.key==='menu'){
   if(now-nav.lastBackAt<nav.exitMs){nav.lastBackAt=0;exitApp();}
   else {nav.lastBackAt=now;notifyBackToExit();}
   return;
  }
  showMenu();
 }
 // Explicit BACK buttons return to the previous screen in the stack.
 document.addEventListener('click',e=>{
  const control=e.target.closest('[data-act="back"],#expBack');
  if(control){e.preventDefault();e.stopImmediatePropagation();back();}
 },true);
 // Desktop keyboard and browser back-key fallback; native Android uses Capacitor App below.
 window.addEventListener('keydown',e=>{
  if(e.code==='Escape'||e.code==='Backspace'){
   e.preventDefault();e.stopImmediatePropagation();back();
  }
 },true);
 (async()=>{
  try{
   const cap=window.Capacitor;
   if(cap&&typeof cap.isNativePlatform==='function'&&cap.isNativePlatform()){
    const mod=await import('@capacitor/app');nav.nativeApp=mod.App;
    await mod.App.addListener('backButton',()=>back());
   }else if(location.protocol!=='file:'){
    history.pushState({rocketRun:true},'',location.href);
    window.addEventListener('popstate',()=>{back();history.pushState({rocketRun:true},'',location.href);});
   }
  }catch(err){console.warn('[Rocket Run] Back-button plugin unavailable; using in-app navigation fallback.',err);}
 })();
 window.RocketRunMobile={back,version:'12.0.0',getScreen:()=>nav.current&&nav.current.key};
 syncVisibleLayout();
})();
