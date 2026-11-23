const {chromium}=require('/opt/npm-tools/node_modules/playwright'); const fs=require('fs');
const frag=fs.readFileSync('/home/claude/harness/frag.glsl','utf8');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:800,height:360}}); p.on('console',m=>console.log('page:',m.text()));
await p.setContent('<body style="margin:0;background:#000"><canvas id=c width=800 height=360></canvas></body>');
const res=await p.evaluate((frag)=>{
 const c=document.getElementById('c'); const gl=c.getContext('webgl2',{premultipliedAlpha:true,alpha:true}); if(!gl) return {err:'no webgl2'};
 const mk=(t,src)=>{const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return [s,gl.getShaderInfoLog(s),gl.getShaderParameter(s,gl.COMPILE_STATUS)];};
 const [vs,vl,vok]=mk(gl.VERTEX_SHADER,'attribute vec3 position; attribute vec2 uv; varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }');
 const [fs,fl,fok]=mk(gl.FRAGMENT_SHADER,frag);
 if(!vok||!fok) return {err:'compile',vl,fl};
 const pr=gl.createProgram(); gl.attachShader(pr,vs); gl.attachShader(pr,fs); gl.bindAttribLocation(pr,0,'position'); gl.bindAttribLocation(pr,1,'uv'); gl.linkProgram(pr);
 if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return {err:'link',log:gl.getProgramInfoLog(pr)};
 const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,0,0,0, 1,-1,0,1,0, -1,1,0,0,1, 1,1,0,1,1]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,3,gl.FLOAT,false,20,0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1,2,gl.FLOAT,false,20,12);
 gl.useProgram(pr); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
 window.__draw=(u)=>{ gl.clearColor(0.02,0.08,0.25,1); gl.clear(gl.COLOR_BUFFER_BIT);
   for(const k of ['uTime','uBase','uHit','uDamage','uLow','uSlow','uSpeed','uSolar','uBoost','uFlash','uShield','uBH','uGrav','uAnom','uLeg']) gl.uniform1f(gl.getUniformLocation(pr,k),u[k]||0);
   gl.uniform3f(gl.getUniformLocation(pr,'uHitCol'),1,.24,.24); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); };
 return {ok:true};
},frag);
console.log('shader:',JSON.stringify(res));
if(res.ok){ const cases={base:{uBase:1},boost:{uBase:1,uBoost:.76,uTime:2,uSpeed:.6},damage:{uBase:1,uDamage:.8,uHit:.7,uLow:.6},bh_shield:{uBase:1,uBH:.9,uShield:.8}};
 for(const [n,u] of Object.entries(cases)){ await p.evaluate(u=>window.__draw(u),u); await p.screenshot({path:`/home/claude/harness/fx_${n}.png`}); } }
await b.close();})();
