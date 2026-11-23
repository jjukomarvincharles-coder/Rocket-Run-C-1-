const {chromium}=require('playwright');
const fs=require('fs'); const file=process.argv[2]; const stub=fs.readFileSync(require('path').join(__dirname,'three_stub.mjs'),'utf8');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});
const route=async(p)=>p.route('**/*',r=>{const u=r.request().url();
 if(u.includes('three.module.js')) return r.fulfill({contentType:'application/javascript',body:stub});
 if(u.includes('EffectComposer.js')) return r.fulfill({contentType:'application/javascript',body:'export class EffectComposer{constructor(r){this.passes=[];this.renderTarget1={samples:0,dispose(){}};this.renderTarget2={samples:0,dispose(){}};} addPass(p){this.passes.push(p);} render(){} setSize(){} dispose(){}}'});
 if(u.includes('RenderPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class RenderPass{constructor(s,c){this.scene=s;this.camera=c;}}'});
 if(u.includes('UnrealBloomPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class UnrealBloomPass{constructor(v,s,r,t){this.strength=s;} setSize(){}}'});
 if(u.includes('ShaderPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class ShaderPass{constructor(s){this.uniforms=s.uniforms;this.enabled=true;} setSize(){} render(){}}'});
 if(u.startsWith('file:')||u.startsWith('data:')||u.startsWith('blob:')) return r.continue(); return r.abort();});
const modes=await (async()=>{const p=await b.newPage({viewport:{width:800,height:360}});await route(p);await p.goto('file://'+file);await p.waitForTimeout(800);
 const g=await p.$('text=GAME MODES'); await g.click(); await p.waitForTimeout(400);
 const m=await p.evaluate(()=>[...document.querySelectorAll('.mode-card')].map(c=>c.dataset.mode)); await p.close(); return m;})();
console.log('modes:',modes.join(','));
for(const mode of modes){
 const p=await b.newPage({viewport:{width:800,height:360}}); const errs=[]; await route(p);
 p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error'&&!m.text().includes('Failed to load resource')) errs.push(m.text().slice(0,200)); });
 await p.goto('file://'+file); await p.waitForTimeout(700);
 await (await p.$('text=GAME MODES')).click(); await p.waitForTimeout(300);
 const c=await p.$(`.mode-card[data-mode="${mode}"]`); await c.click(); await p.waitForTimeout(500);
 // some modes show a flight-plan screen first
 const lb=await p.$('#overlay >> text=/^LAUNCH$/'); if(lb) await lb.click();
 await p.waitForTimeout(3500);
 const ok=await p.evaluate(()=>!document.getElementById('hud').classList.contains('hidden'));
 console.log(mode.padEnd(14),'hud:',ok,'errors:',errs.length?errs.slice(0,2).join(' | '):'none');
 await p.close();}
await b.close();})();
