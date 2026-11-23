/* ========== INPUT ========== */
const Input={x:0,y:0,keyX:0,keyY:0,touchActive:false,touchId:null,center:{x:0,y:0},maxRadius:62};
const stickEl=document.getElementById('stick');
const knobEl=document.getElementById('knob');
function setStickFromEvent(cx,cy){
 let dx=cx-Input.center.x,dy=cy-Input.center.y;
 const len=Math.hypot(dx,dy),max=Input.maxRadius;
 if(len>max){ dx=dx/len*max; dy=dy/len*max; }
 Input.x=dx/max; Input.y=-dy/max;
 knobEl.style.transform=`translate(${dx}px, ${dy}px)`;
}
function stickCenter(){ const r=stickEl.getBoundingClientRect();
 Input.center.x=r.left+r.width/2; Input.center.y=r.top+r.height/2; Input.maxRadius=r.width*0.36; }
stickCenter();
window.addEventListener('resize',stickCenter);
window.addEventListener('orientationchange',()=>setTimeout(stickCenter,300));
function onStickStart(e){ const t=e.changedTouches?e.changedTouches[0]:e;
 if(Input.touchActive) return; Input.touchActive=true;
 Input.touchId=e.changedTouches?t.identifier:'mouse'; stickCenter();
 setStickFromEvent(t.clientX,t.clientY); e.preventDefault(); }
function onStickMove(e){ if(!Input.touchActive) return; let t=null;
 if(e.changedTouches){ for(const ct of e.changedTouches){ if(ct.identifier===Input.touchId){ t=ct; break; } } } else t=e;
 if(!t) return; setStickFromEvent(t.clientX,t.clientY); e.preventDefault(); }
function onStickEnd(e){ if(!Input.touchActive) return;
 if(e.changedTouches){ let found=false; for(const ct of e.changedTouches){ if(ct.identifier===Input.touchId){ found=true; break; } } if(!found) return; }
 Input.touchActive=false; Input.touchId=null; Input.x=0; Input.y=0; knobEl.style.transform='translate(0px,0px)'; }
stickEl.addEventListener('touchstart',onStickStart,{passive:false});
stickEl.addEventListener('touchmove',onStickMove,{passive:false});
stickEl.addEventListener('touchend',onStickEnd,{passive:false});
stickEl.addEventListener('touchcancel',onStickEnd,{passive:false});
stickEl.addEventListener('mousedown',onStickStart);
window.addEventListener('mousemove',e=>{ if(Input.touchActive&&Input.touchId==='mouse') onStickMove(e); });
window.addEventListener('mouseup',e=>{ if(Input.touchId==='mouse') onStickEnd(e); });
const keys={};
window.addEventListener('keydown',e=>{ keys[e.code]=true;
 if(e.code==='KeyP'||e.code==='Escape') togglePause();
 if(e.code==='KeyM') toggleSound();
 if(e.code==='KeyC') cycleCamera();
 if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault(); });
window.addEventListener('keyup',e=>{ keys[e.code]=false; });
function readKeyboard(){ let x=0,y=0;
 if(keys['KeyA']||keys['ArrowLeft']) x-=1;
 if(keys['KeyD']||keys['ArrowRight']) x+=1;
 if(keys['KeyS']||keys['ArrowDown']) y-=1;
 if(keys['KeyW']||keys['ArrowUp']) y+=1;
 Input.keyX=x; Input.keyY=y;
 if(keys['Space']&&Game.state==='PLAYING') activateAbility('boost'); }

