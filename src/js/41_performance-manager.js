/* ========== PERFORMANCE MANAGER (diagnoses the bottleneck, then adapts) ==========
   Resolution only helps when the GPU is the limit. If the JavaScript itself is slow, lowering resolution just makes the picture worse,
   so the manager measures CPU time per frame and picks the right remedy:
     CPU-bound  -> fewer particles/streaks and lighter UI effects ("lite")
     GPU-bound  -> resolution (never below 75% of target unless desperate) -> MSAA off -> glow off -> deeper resolution cut. */
const Perf={
 ema:16.7, cpu:5, acc:0, good:0, lastAdj:0, ignoreUntil:0, capMs:0, show:false, bloomOn:true, msaaOn:true, lite:0, inited:false, hudEl:null, hudT:0,
 init(){ this.inited=true; this.ignoreUntil=performance.now()+4500; this.capMs=SAVE.settings.saver?33.3:0; if(SAVE.settings.saver){ perfScale=Math.min(perfScale,0.85); applyPixelRatio(); onResize(); } },
 reset(){ this.bloomOn=true; this.msaaOn=true; this.lite=0; perfFx=1; document.body.classList.remove('lite'); this.hold(3000); },
 hold(ms=4000){ this.ignoreUntil=performance.now()+ms; this.acc=0; this.good=0; },
 cpuSample(ms){ this.cpu+=(ms-this.cpu)*0.08; },
 sample(raw,now){
  if(raw>250||document.hidden) return;
  this.ema+=(raw-this.ema)*0.08; this.acc+=raw;
  if(this.acc<1500) return; this.acc=0;
  if(now<this.ignoreUntil||Game.state!=='PLAYING'){ this.good=0; return; }
  const fps=1000/this.ema, floor=this.capMs?27:46, ok=this.capMs?29:57;
  if(fps<floor&&now-this.lastAdj>2500){ this.degrade(now); this.good=0; }
  else if(fps>ok){ if(++this.good>=8&&now-this.lastAdj>3000){ this.upgrade(now); this.good=0; } }
  else this.good=0;
 },
 setLite(n){ this.lite=n; perfFx=[1,0.7,0.5,0.35][n]; document.body.classList.toggle('lite',n>=2); },
 setMSAA(on){ this.msaaOn=on; if(!composer) return; const n=on?qualityProfile.msaa:0; for(const rt of [composer.renderTarget1,composer.renderTarget2]) if(rt){ rt.samples=n; rt.dispose(); } },
 degrade(now){
  this.lastAdj=now;
  const cpuBound=this.cpu>this.ema*0.6;
  if(cpuBound){ if(this.lite<3) this.setLite(this.lite+1); else if(this.bloomOn) this.bloomOn=false; return; }
  if(perfScale>0.76){ perfScale=Math.max(0.75,perfScale-0.08); applyPixelRatio(); onResize(); }
  else if(this.msaaOn&&composer&&qualityProfile.msaa) this.setMSAA(false);
  else if(this.bloomOn) this.bloomOn=false;
  else if(perfScale>0.6){ perfScale=Math.max(0.6,perfScale-0.08); applyPixelRatio(); onResize(); }
  else if(this.lite<3) this.setLite(this.lite+1);
 },
 upgrade(now){
  this.lastAdj=now;
  if(this.lite>0) this.setLite(this.lite-1);
  else if(perfScale<1){ perfScale=Math.min(1,perfScale+0.05); applyPixelRatio(); onResize(); }
  else if(!this.msaaOn&&qualityProfile.msaa) this.setMSAA(true);
  else if(!this.bloomOn) this.bloomOn=true;
 },
 setSaver(on){ SAVE.settings.saver=on; persist(); this.capMs=on?33.3:0;
  if(on&&perfScale>0.85){ perfScale=0.85; applyPixelRatio(); onResize(); } },
 toggleInfo(){ this.show=!this.show; renderer.info.autoReset=!this.show;
  if(!this.hudEl){ const d=document.createElement('div'); d.id='perfHud'; document.body.appendChild(d); this.hudEl=d; }
  this.hudEl.style.display=this.show?'block':'none'; },
 report(dt){ if(!this.show) return; this.hudT+=dt; if(this.hudT<0.5) return; this.hudT=0;
  const i=renderer.info, w=renderer.domElement.width, h=renderer.domElement.height;
  this.hudEl.textContent=Math.round(1000/this.ema)+' FPS · '+w+'x'+h+' · cpu '+this.cpu.toFixed(1)+'ms · '+(this.bloomOn&&composer?'glow':'no-glow')+(this.msaaOn?' · aa':'')+' · lite '+this.lite+' · calls '+i.render.calls+' · tris '+Math.round(i.render.triangles/1000)+'k'; }
};
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&Perf.inited) Perf.hold(2500); });

let lastT=performance.now();
function loop(now){
 requestAnimationFrame(loop);
 const raw=now-lastT;
 if(Perf.capMs&&raw<Perf.capMs-2) return;
 if(!Perf.inited) Perf.init();
 const t0=performance.now();
 const dt=Math.min(raw/1000,0.05);
 lastT=now; Perf.sample(raw,now);
 if(Perf.show) renderer.info.reset();
 if(Game.state==='PLAYING'&&!Game.photoMode) updateGame(dt);
 updateVisuals(dt);
 updateBackground(dt,Game.state==='PLAYING'?Game.speed:26);
 updateDrone(dt);
 radarAcc+=dt; if(Game.state==='PLAYING'&&!Game.photoMode&&radarAcc>=0.1){ radarAcc=0; drawRadar(); }
 if(Game.photoMode) applyPhotoCamera();
 ScreenFX.update(dt);
 if(composer){ if(bloomPass) bloomPass.enabled=!!Perf.bloomOn; composer.render(); }
 else renderer.render(scene,camera);
 ScreenFX.render();
 Perf.cpuSample(performance.now()-t0);
 Perf.report(dt);
}

