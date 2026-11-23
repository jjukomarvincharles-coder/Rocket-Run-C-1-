const {chromium}=require('/opt/npm-tools/node_modules/playwright'); const fs=require('fs'); const stub=fs.readFileSync('/home/claude/harness/three_stub.mjs','utf8');
(async()=>{const b=await chromium.launch({args:['--autoplay-policy=no-user-gesture-required']}); const p=await b.newPage({viewport:{width:800,height:360}});
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.route('**/*',r=>{const u=r.request().url();
 if(u.includes('three.module.js')) return r.fulfill({contentType:'application/javascript',body:stub});
 if(u.includes('EffectComposer.js')) return r.fulfill({contentType:'application/javascript',body:'export class EffectComposer{constructor(r){this.passes=[];this.renderTarget1={samples:0,dispose(){}};this.renderTarget2={samples:0,dispose(){}};} addPass(p){this.passes.push(p);} render(){} setSize(){} dispose(){}}'});
 if(u.includes('RenderPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class RenderPass{constructor(s,c){this.scene=s;this.camera=c;}}'});
 if(u.includes('UnrealBloomPass.js')) return r.fulfill({contentType:'application/javascript',body:'export class UnrealBloomPass{constructor(v,s,r,t){this.strength=s;} setSize(){}}'});
 if(u.startsWith('file:')||u.startsWith('data:')||u.startsWith('blob:')) return r.continue(); return r.abort();});
await p.goto('file:///home/claude/harness/dbg.html'); await p.waitForTimeout(1000);
await (await p.$('text=LAUNCH')).click(); await p.waitForTimeout(500); await (await p.$('#overlay >> text=/^LAUNCH$/')).click(); await p.waitForTimeout(1500);
const result=await p.evaluate(async()=>{
 const D=window.__dbg, out={cycles:0,maxChildren:0,minCount:99,maxCount:0,overlap3D:0,overlapAng:0,corridorHits:0,samples:0};
 const check=()=>{ const P=D.planets; out.minCount=Math.min(out.minCount,P.length); out.maxCount=Math.max(out.maxCount,P.length);
  out.maxChildren=Math.max(out.maxChildren,D.bgGroup.children.length);
  for(let i=0;i<P.length;i++){ const a=P[i]; out.samples++;
   // corridor: planet body must not reach the flight corridor around the ship at x,y in +-8
   if(a.userData.isFlyby && Math.abs(a.position.x)-a.userData.radius < D.BOUND_X+6) out.corridorHits++;
   for(let j=i+1;j<P.length;j++){ const b=P[j];
    const d=a.position.distanceTo(b.position); if(d < (a.userData.br+b.userData.br)*1.0) out.overlap3D++;
    const da=a.position.clone().normalize(), db=b.position.clone().normalize(); const ang=Math.acos(Math.max(-1,Math.min(1,da.dot(db))));
    const ra=Math.atan2(a.userData.br,a.position.length())+Math.atan2(b.userData.br,b.position.length()); if(ang<ra*0.98) out.overlapAng++; } } };
 check();
 for(let k=0;k<60;k++){ for(const pl of D.planets) pl.position.z=900; await new Promise(r=>setTimeout(r,120)); out.cycles++; check(); }
 return out; });
console.log(JSON.stringify(result)); console.log('errors:',errs.length?errs.slice(0,3):'none'); await b.close();})();
