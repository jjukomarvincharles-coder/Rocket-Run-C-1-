precision highp float; varying vec2 vUv;
 uniform float uTime,uBase,uHit,uDamage,uLow,uSlow,uSpeed,uSolar,uBoost,uFlash,uShield,uBH,uGrav,uAnom,uLeg; uniform vec3 uHitCol;
 const float PI=3.14159265;
 void over(inout vec3 c,inout float a,vec3 col,float al){ al=clamp(al,0.0,1.0); c=col*al+c*(1.0-al); a=al+a*(1.0-al); }
 void main(){
  vec3 c=vec3(0.0); float a=0.0; vec2 uv=vUv;
  float dC=length((uv-vec2(0.5,0.5))/0.7071);
  float dB=length((uv-vec2(0.5,0.46))/0.7071);
  float dS=length((uv-vec2(0.5,0.45))/0.7071);
  float ab=dB<0.46?0.0:(dB<0.78?0.20*(dB-0.46)/0.32:0.20+0.42*clamp((dB-0.78)/0.22,0.0,1.0));
  over(c,a,vec3(0.0,0.008,0.03),ab*uBase);
  over(c,a,mix(vec3(0.31,0.47,1.0),vec3(0.55,0.24,1.0),1.0-uv.y),0.16*uSlow);
  { float s=dS<0.38?0.0:(dS<0.78?0.14*(dS-0.38)/0.40:0.14+0.16*clamp((dS-0.78)/0.22,0.0,1.0));
    float so=dS<0.30?0.20:(0.20+0.15*clamp((dS-0.30)/0.70,0.0,1.0));
    vec3 oc=mix(vec3(1.0,0.78,0.24),vec3(1.0,0.55,0.16),clamp((dS-0.3)/0.7,0.0,1.0));
    over(c,a,mix(vec3(0.227,0.914,1.0),oc,uSolar),mix(s,so,uSolar)*uSpeed); }
  over(c,a,vec3(1.0,0.157,0.157),0.32*smoothstep(0.42,1.0,dS)*uLow*(0.75+0.25*sin(uTime*6.0)));
  over(c,a,vec3(1.0,0.08,0.08),0.42*smoothstep(0.45,1.0,dS)*uDamage);
  { float dh=clamp(length((uv-vec2(0.5,0.4))/0.7071),0.0,1.0); over(c,a,uHitCol,0.75*dh*uHit); }
  vec3 add=vec3(0.0);
  add+=mix(vec3(0.706,0.424,1.0),vec3(0.227,0.914,1.0),1.0-uv.y)*mix(0.14,0.10,1.0-uv.y)*uAnom;
  { float dl=length((uv-vec2(0.5,0.7))/0.7071); vec3 lc=mix(vec3(1.0,0.81,0.30),vec3(1.0,0.29,0.85),smoothstep(0.0,0.5,dl));
    float la=mix(0.20,0.12,smoothstep(0.0,0.5,dl))*(1.0-smoothstep(0.5,0.85,dl)); add+=lc*la*uLeg; }
  { float t=dC; vec3 bc=mix(vec3(0.6,0.23,1.0),vec3(0.35,0.08,0.63),clamp(t/0.6,0.0,1.0)); float ba=mix(0.08,0.38,clamp(t/0.6,0.0,1.0)); add+=bc*ba*uBH; }
  { vec3 gc=mix(vec3(1.0,0.59,0.24),vec3(0.78,0.31,0.08),smoothstep(0.0,0.62,dS)); float ga=mix(0.06,0.32,smoothstep(0.0,0.62,dS)); add+=gc*ga*uGrav; }
  add+=vec3(0.227,0.914,1.0)*(smoothstep(0.58,0.86,dC)*0.28+smoothstep(0.86,1.0,dC)*0.27)*uShield;
  if(uBoost>0.001){
   vec2 q=(uv-vec2(0.5,0.48))/0.7071; float d=length(q); float ang=atan(q.y,q.x);
   float mask=smoothstep(0.11,0.74,d);
   float glow=smoothstep(0.17,1.0,d)*0.26+0.05*smoothstep(0.17,0.35,d);
   float ph=fract((ang+uTime*0.05)/(2.0*PI)*72.0); float ray=smoothstep(0.0,0.04,ph)*(1.0-smoothstep(0.04,0.10,ph));
   float pulse=0.55+0.45*sin(d*18.0-uTime*14.0);
   vec3 rc=mix(vec3(0.47,0.9,1.0),vec3(1.0),smoothstep(0.5,1.0,d));
   add+=vec3(0.15,0.75,1.0)*glow*uBoost + rc*ray*mask*(0.30+0.35*pulse)*uBoost; }
  { float df=length((uv-vec2(0.5,0.48))/0.7071); add+=mix(vec3(0.94,1.0,1.0),vec3(0.24,0.82,1.0),smoothstep(0.0,0.32,df))*uFlash*(1.0-smoothstep(0.0,0.72,df))*0.7; }
  gl_FragColor=vec4(c+add,a);
 }