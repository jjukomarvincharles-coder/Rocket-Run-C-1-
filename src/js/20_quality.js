/* ========== QUALITY ========== */
/* pixelRatio = max render scale vs CSS pixels; maxPixels = pixel budget (so huge/hi-DPI screens never exceed it);
   msaa = anti-aliasing samples on the post-processing buffer (the direct path always uses the canvas MSAA). */
const QUALITY_PRESETS={
 LOW:{pixelRatio:1.25,maxPixels:520000,msaa:0,bloom:false,asteroidCount:24,collectibleCount:12,bloomStrength:0.55,bloomRadius:0.5,bloomThresh:0.78},
 MEDIUM:{pixelRatio:1.5,maxPixels:1000000,msaa:4,bloom:true,asteroidCount:36,collectibleCount:16,bloomStrength:0.95,bloomRadius:0.62,bloomThresh:0.68},
 HIGH:{pixelRatio:2.0,maxPixels:2100000,msaa:4,bloom:true,asteroidCount:50,collectibleCount:20,bloomStrength:1.15,bloomRadius:0.7,bloomThresh:0.62},
 ULTRA:{pixelRatio:2.5,maxPixels:3600000,msaa:4,bloom:true,asteroidCount:64,collectibleCount:24,bloomStrength:1.3,bloomRadius:0.78,bloomThresh:0.55}
};
let qualityProfile=QUALITY_PRESETS.HIGH;
function detectQuality(){ const mem=navigator.deviceMemory||4, cores=navigator.hardwareConcurrency||4;
 if(perfLowTex){ if(cores<=4||mem<=2) return 'LOW'; return 'MEDIUM'; }
 if(cores>=8&&mem>=8) return 'HIGH'; return cores<=4?'MEDIUM':'HIGH'; }
function targetPR(){ const w=Math.max(1,window.innerWidth),h=Math.max(1,window.innerHeight),q=qualityProfile;
 return Math.max(0.6,Math.min(window.devicePixelRatio||1,q.pixelRatio,Math.sqrt((q.maxPixels||1e6)/(w*h)))); }
function applyPixelRatio(){ renderer.setPixelRatio(targetPR()*perfScale); }
let composer=null,bloomPass=null,boostBlurPass=null;
function setupComposer(){
 if(composer){ try{composer.dispose();}catch(e){} composer=null; bloomPass=null; boostBlurPass=null; }
 composer=new EffectComposer(renderer);
 if(qualityProfile.msaa){ for(const rt of [composer.renderTarget1,composer.renderTarget2]) if(rt) rt.samples=qualityProfile.msaa; }
 composer.addPass(new RenderPass(scene,camera));
 if(qualityProfile.bloom){
  bloomPass=new UnrealBloomPass(new THREE.Vector2(window.innerWidth*0.5,window.innerHeight*0.5),qualityProfile.bloomStrength,qualityProfile.bloomRadius||0.6,qualityProfile.bloomThresh||0.7);
  composer.addPass(bloomPass);
 }
 boostBlurPass=new ShaderPass({
  uniforms:{tDiffuse:{value:null},uStrength:{value:0}},
  vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform sampler2D tDiffuse; uniform float uStrength; varying vec2 vUv;
   void main(){
    vec2 center=vec2(0.5,0.52); vec2 radial=vUv-center; float r=length(radial);
    vec2 focusVec=(vUv-vec2(0.5,0.72))*vec2(1.0,1.28);
    float focus=1.0-smoothstep(0.105,0.34,length(focusVec));
    float edge=smoothstep(0.10,0.76,r);
    float amount=uStrength*edge*(1.0-0.82*focus);
    vec2 dir=normalize(radial+vec2(0.00001));
    vec4 color=texture2D(tDiffuse,vUv)*0.28;
    color+=texture2D(tDiffuse,vUv-dir*amount*0.55)*0.22;
    color+=texture2D(tDiffuse,vUv+dir*amount*0.55)*0.22;
    color+=texture2D(tDiffuse,vUv-dir*amount)*0.14;
    color+=texture2D(tDiffuse,vUv+dir*amount)*0.14;
    gl_FragColor=color;
   }`
 });
 composer.addPass(boostBlurPass);
}
function applyQuality(name){
 const key=(name==='auto')?detectQuality():name;
 qualityProfile=QUALITY_PRESETS[key]||QUALITY_PRESETS.HIGH;
 perfScale=1; perfFx=1; if(typeof Perf!=='undefined'){ Perf.reset(); }
 applyPixelRatio(); setupComposer(); onResize(); return key;
}
