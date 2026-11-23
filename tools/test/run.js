const {chromium}=require('playwright');
const fs=require('fs');
const file=process.argv[2]; const stub=fs.readFileSync(require('path').join(__dirname,'three_stub.mjs'),'utf8');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({viewport:{width:800,height:360},hasTouch:false}); const p=await ctx.newPage();
const errs=[]; p.on('console',m=>{ if(['error','warning'].includes(m.type())) errs.push(m.type()+': '+m.text().slice(0,400)); });
p.on('pageerror',e=>errs.push('PAGEERROR: '+e.message+'\n'+(e.stack||'').split('\n').slice(0,4).join('\n')));
await p.route('**/*',r=>{const u=r.request().url();
 if(u.includes('three.module.js')) return r.fulfill({contentType:'application/javascript',body:stub});
 if(u.includes('EffectComposer.js')) return r.fulfill({contentType:'application/javascript',body:'export class EffectComposer{constructor(r){this.passes=[];this.renderTarget1={samples:0,dispose(){}};this.renderTarget2={samples:0,dispose(){}};} addPass(p){this.passes.push(p);} render(){window.__frames=(window.__frames||0)+1;} setSize(){} dispose(){}}'});
 if(u.includes('RenderPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class RenderPass{constructor(s,c){this.scene=s;this.camera=c;}}'});
 if(u.includes('UnrealBloomPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class UnrealBloomPass{constructor(v,s,r,t){this.strength=s;this.radius=r;this.threshold=t;} setSize(){}}'});
 if(u.includes('ShaderPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class ShaderPass{constructor(s){this.uniforms=s.uniforms;this.enabled=true;} setSize(){} render(){}}'});
 if(u.startsWith('file:')||u.startsWith('data:')||u.startsWith('blob:')) return r.continue(); return r.abort();});
await p.goto('file://'+file); await p.waitForTimeout(1500);
console.log('after load frames:',await p.evaluate(()=>window.__frames||0));
const log=async(t)=>console.log(t, JSON.stringify(await p.evaluate(()=>({overlayHidden:document.getElementById('overlay').classList.contains('hidden'),hudHidden:document.getElementById('hud').classList.contains('hidden'),buttons:[...document.querySelectorAll('#overlay .btn,#overlay button,#overlay .card')].slice(0,8).map(e=>(e.textContent||'').trim().slice(0,22))}))));
await log('menu:');
const clickText=async(t)=>{const h=await p.$(`text=${t}`); if(h){await h.click(); return true;} return false;};
console.log('click LAUNCH:',await clickText('LAUNCH')); await p.waitForTimeout(800); await log('after1:');
const lb=await p.$('#overlay >> text=/^LAUNCH$/'); console.log('2nd LAUNCH:',!!lb); if(lb){await lb.click();}
await p.waitForTimeout(1500); await log('after run click:');
console.log('state frames:',await p.evaluate(()=>window.__frames||0));
await p.waitForTimeout(1000);
const st=async(t)=>console.log(t,JSON.stringify(await p.evaluate(()=>({hudHidden:document.getElementById('hud').classList.contains('hidden'),overlayHidden:document.getElementById('overlay').classList.contains('hidden'),score:document.querySelector('#scorePanel .value')?.textContent,fuel:document.getElementById('fuelTime')?.textContent,frames:window.__frames}))));
await st('start:');
const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
const btns=['#btnBoost','#btnShield','#btnMagnet','#btnSlow','#btnBlast'];
for(let i=0;i<22;i++){
  const k=keys[i%4]; await p.keyboard.down(k); await p.waitForTimeout(700); await p.keyboard.up(k);
  if(i%2===0){ const b=await p.$(btns[(i/2)%5|0]); if(b) await b.click({force:true}).catch(()=>{}); }
  if(i===6) await p.keyboard.press('KeyC'); if(i===12) await p.keyboard.press('KeyC'); if(i===18) await p.keyboard.press('KeyC');
  if(i%5===0) await st('t'+i+':');
}
console.log('score text:',await p.evaluate(()=>document.getElementById('scoreVal')?.textContent||document.querySelector('#scorePanel .value')?.textContent));
console.log('ERRORS:\n'+errs.join('\n'));
await b.close();})();
