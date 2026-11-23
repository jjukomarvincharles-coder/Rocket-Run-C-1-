/* ========== AUDIO ========== */
const Sound={
 ctx:null,master:null,engineBus:null,sfxBus:null,engineGain:null,engineOsc:null,engineSub:null,engineNoiseGain:null,engineFilter:null,
 realLaunch:null,realLaunchEnabled:true,launchVolume:0.58,engineVolume:0.78,effectsVolume:0.84,musicVolume:0.62,
 launchFadeTimer:null,cameraMode:0,
 musicGain:null,musicFilter:null,musicTimer:null,musicStep:0,musicRoot:55,
 ambienceGain:null,ambOscA:null,ambOscB:null,ambFilter:null,
 tensionGain:null,tensionOscA:null,tensionOscB:null,enabled:true,musicEnabled:true,
 lastBulletSfx:0,lastLockSfx:0,lastNearSfx:0,threat:0,region:0,
 init(){
  if(this.ctx) return;
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  try{this.ctx=new AC({latencyHint:'interactive'});}catch(e){this.ctx=new AC();}
  const c=this.ctx;
  this.engineVolume=clamp(Number(SAVE.settings.engineVolume??0.78),0,1);
  this.effectsVolume=clamp(Number(SAVE.settings.effectsVolume??0.84),0,1);
  this.musicVolume=clamp(Number(SAVE.settings.musicVolume??0.62),0,1);
  this.launchVolume=clamp(Number(SAVE.settings.launchVolume??0.58),0,1);
  this.realLaunchEnabled=SAVE.settings.realLaunch!==false;
  this.master=c.createGain(); this.master.gain.value=this.enabled?0.56:0;
  const limiter=c.createDynamicsCompressor(); limiter.threshold.value=-16; limiter.knee.value=18;
  limiter.ratio.value=3.2; limiter.attack.value=0.004; limiter.release.value=0.22;
  this.master.connect(limiter); limiter.connect(c.destination);
  this.engineBus=c.createGain(); this.engineBus.gain.value=this.engineVolume; this.engineBus.connect(this.master);
  this.sfxBus=c.createGain(); this.sfxBus.gain.value=this.effectsVolume; this.sfxBus.connect(this.master);

  // Authentic atmospheric launch recording from NASA Goddard. This is a one-shot launch cue,
  // not a continuous in-space engine loop; the latter is modeled separately for responsive gameplay.
  try{
   this.realLaunch=new Audio('https://www.nasa.gov/wp-content/uploads/2018/11/finallaunchmix181.mp3');
   this.realLaunch.preload='none';
   this.realLaunch.volume=this.launchVolume;
   this.realLaunch.addEventListener('error',()=>{ this.realLaunchFailed=true; });
  }catch(e){ this.realLaunch=null; this.realLaunchFailed=true; }

  // Layered rocket engine: filtered oscillators plus a continuous turbulent exhaust bed.
  this.engineGain=c.createGain(); this.engineGain.gain.value=0.035;
  this.engineFilter=c.createBiquadFilter(); this.engineFilter.type='lowpass'; this.engineFilter.frequency.value=460; this.engineFilter.Q.value=2.2;
  this.engineGain.connect(this.engineFilter); this.engineFilter.connect(this.engineBus);
  this.engineOsc=c.createOscillator(); this.engineOsc.type='sawtooth'; this.engineOsc.frequency.value=52;
  this.engineOsc.connect(this.engineGain); this.engineOsc.start();
  this.engineSub=c.createOscillator(); this.engineSub.type='triangle'; this.engineSub.frequency.value=27;
  const subGain=c.createGain(); subGain.gain.value=0.30; this.engineSub.connect(subGain); subGain.connect(this.engineGain); this.engineSub.start();
  const noiseBuffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate),noiseData=noiseBuffer.getChannelData(0);
  for(let i=0;i<noiseData.length;i++) noiseData[i]=(Math.random()*2-1)*0.55;
  this.engineNoise=c.createBufferSource(); this.engineNoise.buffer=noiseBuffer; this.engineNoise.loop=true;
  const nFilter=c.createBiquadFilter(); nFilter.type='lowpass'; nFilter.frequency.value=780; nFilter.Q.value=0.7;
  this.engineNoiseGain=c.createGain(); this.engineNoiseGain.gain.value=0.012;
  this.engineNoise.connect(nFilter); nFilter.connect(this.engineNoiseGain); this.engineNoiseGain.connect(this.engineBus); this.engineNoise.start();

  // Hyperdrive whistle: a controllable, continuous layer that rises during nitro.
  this.boostGain=c.createGain(); this.boostGain.gain.value=0; this.boostGain.connect(this.engineBus);
  this.boostFilter=c.createBiquadFilter(); this.boostFilter.type='bandpass'; this.boostFilter.frequency.value=650; this.boostFilter.Q.value=0.7;
  this.boostOsc=c.createOscillator(); this.boostOsc.type='sawtooth'; this.boostOsc.frequency.value=180;
  this.boostOsc.connect(this.boostFilter); this.boostFilter.connect(this.boostGain); this.boostOsc.start();
  this.boostSub=c.createOscillator(); this.boostSub.type='sine'; this.boostSub.frequency.value=48;
  const bsg=c.createGain(); bsg.gain.value=0.25; this.boostSub.connect(bsg); bsg.connect(this.boostGain); this.boostSub.start();

  // Low-level sector ambience; region changes alter its pitch and spectral color.
  this.ambienceGain=c.createGain(); this.ambienceGain.gain.value=0.018;
  this.ambFilter=c.createBiquadFilter(); this.ambFilter.type='lowpass'; this.ambFilter.frequency.value=190;
  this.ambienceGain.connect(this.ambFilter); this.ambFilter.connect(this.master);
  this.ambOscA=c.createOscillator(); this.ambOscA.type='sine'; this.ambOscA.frequency.value=41;
  this.ambOscB=c.createOscillator(); this.ambOscB.type='triangle'; this.ambOscB.frequency.value=61.5;
  const ambA=c.createGain(); ambA.gain.value=0.62; const ambB=c.createGain(); ambB.gain.value=0.18;
  this.ambOscA.connect(ambA); this.ambOscB.connect(ambB); ambA.connect(this.ambienceGain); ambB.connect(this.ambienceGain);
  this.ambOscA.start(); this.ambOscB.start();

  // Music bus and a separate tension layer so combat can build without replacing the theme.
  this.musicGain=c.createGain(); this.musicGain.gain.value=this.musicEnabled?0.20*this.musicVolume:0;
  this.musicFilter=c.createBiquadFilter(); this.musicFilter.type='lowpass'; this.musicFilter.frequency.value=2400;
  this.musicGain.connect(this.musicFilter); this.musicFilter.connect(this.master);
  this.tensionGain=c.createGain(); this.tensionGain.gain.value=0;
  this.tensionGain.connect(this.musicGain);
  this.tensionOscA=c.createOscillator(); this.tensionOscA.type='sawtooth'; this.tensionOscA.frequency.value=73.4;
  this.tensionOscB=c.createOscillator(); this.tensionOscB.type='sine'; this.tensionOscB.frequency.value=110;
  const tgA=c.createGain(); tgA.gain.value=0.58; const tgB=c.createGain(); tgB.gain.value=0.38;
  this.tensionOscA.connect(tgA); this.tensionOscB.connect(tgB); tgA.connect(this.tensionGain); tgB.connect(this.tensionGain);
  this.tensionOscA.start(); this.tensionOscB.start();
 },
 resume(){if(this.ctx&&this.ctx.state==='suspended') this.ctx.resume();},
 setEngine(i){
  if(!this.ctx) return; const g=clamp(i,0,1.4),t=this.ctx.currentTime;
  const cameraFactor=this.cameraMode===1?0.78:(this.cameraMode===2?1.12:1);
  const damageTone=Game&&typeof Game.engine==='number'?clamp(Game.engine/100,0.35,1):1;
  this.engineGain.gain.setTargetAtTime((0.025+g*0.075)*damageTone,t,0.10);
  this.engineOsc.frequency.setTargetAtTime((44+g*51)*(this.cameraMode===1?0.88:1),t,0.10);
  this.engineSub.frequency.setTargetAtTime(23+g*22,t,0.12);
  this.engineFilter.frequency.setTargetAtTime((this.cameraMode===1?250:(this.cameraMode===2?520:320))+g*760*cameraFactor,t,0.16);
  if(this.engineNoiseGain) this.engineNoiseGain.gain.setTargetAtTime((0.008+g*0.030)*(this.cameraMode===1?0.62:1),t,0.16);
 },
 setBoost(amount){
  if(!this.ctx||!this.boostGain) return;
  const v=clamp(amount||0,0,1),t=this.ctx.currentTime;
  this.boostGain.gain.setTargetAtTime(v*0.115,t,0.075);
  this.boostOsc.frequency.setTargetAtTime(155+v*520,t,0.07);
  this.boostSub.frequency.setTargetAtTime(42+v*34,t,0.09);
  this.boostFilter.frequency.setTargetAtTime(480+v*1550,t,0.08);
 },
 boostIgnite(){
  this.blip(42,0.72,'sawtooth',0.28,38);
  this.noise(0.72,0.20,260,0.55);
  this.blip(170,0.42,'sawtooth',0.13,1180);
  this.blip(620,0.18,'triangle',0.08,1480);
 },
 boostRelease(){
  this.blip(540,0.32,'triangle',0.09,105);
 },

 setCameraMode(mode){
  this.cameraMode=clamp(mode|0,0,2);
  if(!this.ctx) return;
  const t=this.ctx.currentTime;
  // Cockpit muffles exterior roar and emphasizes the enclosed engine resonance.
  const freq=this.cameraMode===1?520:(this.cameraMode===2?1850:1250);
  this.engineFilter.frequency.setTargetAtTime(freq, t, 0.22);
  if(this.ambFilter) this.ambFilter.frequency.setTargetAtTime(this.cameraMode===1?125:(this.cameraMode===2?230:190),t,0.25);
 },
 setEngineVolume(v){ this.engineVolume=clamp(Number(v)||0,0,1); if(this.engineBus&&this.ctx)this.engineBus.gain.setTargetAtTime(this.engineVolume,this.ctx.currentTime,0.08); },
 setEffectsVolume(v){ this.effectsVolume=clamp(Number(v)||0,0,1); if(this.sfxBus&&this.ctx)this.sfxBus.gain.setTargetAtTime(this.effectsVolume,this.ctx.currentTime,0.08); },
 setMusicVolume(v){ this.musicVolume=clamp(Number(v)||0,0,1); if(this.musicGain&&this.ctx)this.musicGain.gain.setTargetAtTime(this.musicEnabled?0.20*this.musicVolume:0,this.ctx.currentTime,0.1); },
 setLaunchVolume(v){ this.launchVolume=clamp(Number(v)||0,0,1); if(this.realLaunch)this.realLaunch.volume=this.launchVolume; },
 setRealLaunch(on){ this.realLaunchEnabled=!!on; },
 launchSequence(){
  if(!this.ctx) this.init(); this.resume();
  // A short synthesized ignition transient supports the recording and acts as a reliable fallback.
  this.blip(34,0.95,'sawtooth',0.22,22); this.noise(1.25,0.19,150,0.42);
  this.blip(58,0.72,'triangle',0.12,92);
  if(!this.enabled||!this.realLaunchEnabled||!this.realLaunch) return;
  const a=this.realLaunch;
  if(this.launchFadeTimer){clearInterval(this.launchFadeTimer);this.launchFadeTimer=null;}
  try{a.pause();a.currentTime=0;a.volume=this.launchVolume;}catch(e){}
  const started=performance.now();
  const p=a.play();
  if(p&&typeof p.catch==='function') p.catch(()=>{ this.realLaunchFailed=true; });
  this.launchFadeTimer=setInterval(()=>{
   const elapsed=(performance.now()-started)/1000;
   if(!a||a.paused){clearInterval(this.launchFadeTimer);this.launchFadeTimer=null;return;}
   if(elapsed>7) a.volume=Math.max(0,this.launchVolume*(1-(elapsed-7)/3));
   if(elapsed>10){a.pause();try{a.currentTime=0;}catch(e){}clearInterval(this.launchFadeTimer);this.launchFadeTimer=null;}
  },220);
 },
 setRegion(index){
  this.region=index||0; if(!this.ctx) return;
  const roots=[55,58.27,65.41,73.42,49,61.74,46.25,51.91,69.30,38.89,82.41];
  const root=roots[clamp(this.region,0,roots.length-1)]; this.musicRoot=root;
  const t=this.ctx.currentTime;
  this.ambOscA.frequency.setTargetAtTime(root*0.72,t,0.8);
  this.ambOscB.frequency.setTargetAtTime(root*1.12,t,0.8);
  this.ambFilter.frequency.setTargetAtTime(145+(this.region%4)*38,t,0.8);
  this.musicFilter.frequency.setTargetAtTime(1700+(this.region%5)*220,t,0.7);
 },
 setThreat(v){
  if(!this.ctx||!this.tensionGain) return;
  this.threat=clamp(v,0,1); const t=this.ctx.currentTime;
  this.tensionGain.gain.setTargetAtTime(this.musicEnabled?this.threat*0.10:0,t,0.35);
  this.musicFilter.frequency.setTargetAtTime(1500+this.threat*1900,t,0.5);
  this.ambienceGain.gain.setTargetAtTime(0.014+this.threat*0.012,t,0.6);
 },
 blip(f,d=0.12,t='sine',v=0.2,s=null){
  if(!this.ctx||!this.enabled) return; const n=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type=t;o.frequency.setValueAtTime(Math.max(20,f),n); if(s) o.frequency.exponentialRampToValueAtTime(Math.max(40,s),n+d);
  g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+0.008);g.gain.exponentialRampToValueAtTime(0.0001,n+d);
  o.connect(g);g.connect(this.sfxBus||this.master);o.start(n);o.stop(n+d+0.03);
 },
 noise(d=0.3,v=0.22,f=900,q=1){
  if(!this.ctx||!this.enabled) return; const n=this.ctx.currentTime;
  if(!this._nbuf){ const len=this.ctx.sampleRate,b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),c=b.getChannelData(0); for(let i=0;i<len;i++) c[i]=Math.random()*2-1; this._nbuf=b; }
  const src=this.ctx.createBufferSource(); src.buffer=this._nbuf; src.loop=true;
  const bf=this.ctx.createBiquadFilter(); bf.type='bandpass'; bf.frequency.value=f; bf.Q.value=q;
  const g=this.ctx.createGain(); g.gain.setValueAtTime(v,n); g.gain.linearRampToValueAtTime(0.0001,n+d);
  src.connect(bf); bf.connect(g); g.connect(this.sfxBus||this.master); src.start(n,Math.random()*0.4); src.stop(n+d+0.03);
 },
 musicTone(f,d,type='triangle',v=0.12,slide=null){
  if(!this.ctx||!this.musicEnabled||!this.enabled) return; const n=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type=type;o.frequency.setValueAtTime(Math.max(25,f),n);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,slide),n+d);
  g.gain.setValueAtTime(0,n);g.gain.linearRampToValueAtTime(v,n+0.018);g.gain.exponentialRampToValueAtTime(0.0001,n+d);
  o.connect(g);g.connect(this.musicGain);o.start(n);o.stop(n+d+0.04);
 },
 musicKick(){
  if(!this.ctx||!this.musicEnabled||!this.enabled) return;const n=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();
  o.type='sine';o.frequency.setValueAtTime(105,n);o.frequency.exponentialRampToValueAtTime(38,n+0.15);
  g.gain.setValueAtTime(0.20,n);g.gain.exponentialRampToValueAtTime(0.001,n+0.18);o.connect(g);g.connect(this.musicGain);o.start(n);o.stop(n+0.2);
 },
 coin(){this.blip(1180,0.09,'triangle',0.14,1760);},
 gas(){this.blip(520,0.22,'sine',0.19,1040);setTimeout(()=>this.blip(880,0.18,'sine',0.13,1320),70);},
 superGas(){[660,880,1180,1560].forEach((f,i)=>setTimeout(()=>this.blip(f,0.14,'triangle',0.15),i*55));},
 chain(n){this.blip(600+n*70,0.08,'square',0.09,900+n*90);},
 crate(){[400,700,1100,1500].forEach((f,i)=>setTimeout(()=>this.blip(f,0.16,'sawtooth',0.14),i*60));},
 discovery(){[523,659,784,1046,1318].forEach((f,i)=>setTimeout(()=>this.blip(f,0.25,'sine',0.13),i*110));},
 shieldOn(){this.blip(300,0.4,'sawtooth',0.15,900);this.noise(0.18,0.06,1700,1.2);},
 shieldHit(){this.noise(0.5,0.28,420,0.8);this.blip(180,0.35,'square',0.17,70);},
 parry(){this.blip(920,0.10,'sine',0.16,1680);this.blip(1480,0.18,'triangle',0.13,720);this.noise(0.12,0.09,2600,1.8);},
 magnet(){this.blip(420,0.3,'sine',0.14,1200);},
 slow(){this.blip(900,0.5,'sine',0.15,220);},
 blast(){this.noise(0.65,0.32,260,0.6);this.blip(120,0.55,'sawtooth',0.2,40);},
 emp(){this.blip(180,0.48,'sawtooth',0.18,45);this.blip(880,0.24,'sine',0.11,180);this.noise(0.26,0.12,700,0.9);},
 nearMiss(){this.blip(1500,0.06,'sine',0.09,2200);},
 bulletWhiz(){const n=performance.now();if(n-this.lastNearSfx<105)return;this.lastNearSfx=n;this.noise(0.16,0.12,2200+Math.random()*900,2.5);this.blip(1700,0.07,'sine',0.06,900);},
 lockOn(){const n=performance.now();if(n-this.lastLockSfx<800)return;this.lastLockSfx=n;this.blip(980,0.09,'square',0.08,760);setTimeout(()=>this.blip(1240,0.08,'square',0.08,920),110);},
 counter(){this.blip(260,0.18,'sawtooth',0.15,920);this.blip(740,0.2,'triangle',0.12,1600);},
 combo(n){this.blip(700+n*90,0.11,'triangle',0.15,1200+n*110);},
 hit(){this.noise(0.55,0.38,180,0.7);this.blip(90,0.5,'square',0.23,45);},
 bulletHit(){this.noise(0.15,0.15,1200,2);this.blip(300,0.1,'square',0.1,80);},
 bulletFire(kind){const n=performance.now();if(n-this.lastBulletSfx<55)return;this.lastBulletSfx=n;
  if(kind==='guardian'){this.blip(430,0.15,'sawtooth',0.10,190);this.noise(0.08,0.04,700,1);}
  else if(kind==='interceptor'||kind==='hunter'){this.blip(1750,0.075,'sawtooth',0.085,540);}
  else {this.blip(1250,0.075,'square',0.075,620);}},
 bulletReflect(){this.parry();},
 droneShot(){this.blip(880,0.07,'triangle',0.06,1480);},
 droneAssist(){[520,780,1040,1560].forEach((f,i)=>setTimeout(()=>this.blip(f,0.16,'sine',0.12),i*70));},
 enemyDestroy(){this.noise(0.5,0.35,220,0.6);this.blip(150,0.4,'sawtooth',0.22,50);},
 fleetWarn(){[200,150,200,150].forEach((f,i)=>setTimeout(()=>this.blip(f,0.35,'sawtooth',0.18,f*1.2),i*180));},
 lowFuel(){this.blip(880,0.14,'square',0.12);setTimeout(()=>this.blip(660,0.18,'square',0.12),170);},
 engineCritical(){[125,95,125,75].forEach((f,i)=>setTimeout(()=>this.blip(f,0.22,'sawtooth',0.12,f*0.7),i*180));},
 hullWarning(){this.blip(420,0.14,'square',0.10,300);setTimeout(()=>this.blip(320,0.16,'square',0.11,210),180);},
 over(){[420,330,260,180].forEach((f,i)=>setTimeout(()=>this.blip(f,0.34,'sawtooth',0.18,f*0.6),i*160));},
 route(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>this.blip(f,0.2,'triangle',0.13),i*90));},
 event(){[300,450,600].forEach((f,i)=>setTimeout(()=>this.blip(f,0.26,'sawtooth',0.12,f*1.6),i*110));},
 encounter(){[180,240,180,300].forEach((f,i)=>setTimeout(()=>this.blip(f,0.5,'sawtooth',0.16,f*1.4),i*180));},
 anomaly(){[1200,900,1400,700].forEach((f,i)=>setTimeout(()=>this.blip(f,0.3,'sine',0.12,f*0.7),i*140));},
 quantum(){[300,600,1200,2400].forEach((f,i)=>setTimeout(()=>this.blip(f,0.12,'square',0.11,f*1.3),i*50));},
 transmission(){this.noise(0.18,0.055,1500,0.8);[1400,1200,1600].forEach((f,i)=>setTimeout(()=>this.blip(f,0.14,'sine',0.10,f*0.9),i*60));},
 decision(){[400,500,400,600].forEach((f,i)=>setTimeout(()=>this.blip(f,0.3,'triangle',0.15),i*130));},
 dock(){[300,450,600,450,300].forEach((f,i)=>setTimeout(()=>this.blip(f,0.22,'sine',0.16),i*110));},
 legendary(){[523,659,784,1046,1318,1568].forEach((f,i)=>setTimeout(()=>this.blip(f,0.4,'triangle',0.18),i*180));},
 repair(){[500,700,900,1100].forEach((f,i)=>setTimeout(()=>this.blip(f,0.14,'triangle',0.13),i*70));},
 cameraSwitch(){this.blip(700,0.1,'sine',0.12,1000);},
 startMusic(){
  if(!this.ctx||this.musicTimer) return;
  const scale=[0,3,5,7,10,12,15,19]; this.musicStep=0;
  this.musicTimer=setInterval(()=>{
   if(!this.ctx||!this.musicEnabled||!this.enabled) return;
   const s=this.musicStep++,root=this.musicRoot||55,tension=this.threat||0;
   if(s%8===0){this.musicTone(root*(s%32===24?0.75:1),0.52,'sawtooth',0.12,root*0.78);this.musicKick();}
   if(s%8===4) this.musicTone(root*1.5,0.28,'triangle',0.065,root*1.8);
   if(s%2===0){const idx=scale[(Math.floor(s/2)+Math.floor(s/16)*2)%scale.length];
    this.musicTone(root*2*Math.pow(2,idx/12),0.22,'triangle',0.055+tension*0.025);}
   if(s%16===0){const chord=[1,1.25,1.5][Math.floor(s/16)%3];
    this.musicTone(root*4*chord,1.8,'sine',0.035+tension*0.018);}
   if(tension>0.48&&s%4===2)this.musicTone(root*3.2,0.12,'square',0.035+tension*0.025,root*2.2);
  },125);
 },
 stopMusic(){if(this.musicTimer){clearInterval(this.musicTimer);this.musicTimer=null;}},
 setEnabled(on){this.enabled=on;if(this.master&&this.ctx)this.master.gain.setTargetAtTime(on?0.56:0,this.ctx.currentTime,0.06);},
 setMusic(on){this.musicEnabled=on;if(this.musicGain&&this.ctx)this.musicGain.gain.setTargetAtTime(on?0.20*this.musicVolume:0,this.ctx.currentTime,0.12);if(!on&&this.tensionGain)this.tensionGain.gain.setTargetAtTime(0,this.ctx.currentTime,0.1);}
};

