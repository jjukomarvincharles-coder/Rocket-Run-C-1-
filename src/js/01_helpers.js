/* ========== HELPERS ========== */
const SAVE_KEY = 'rocketrun.save.v4';
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const rndi=(a,b)=>Math.floor(rnd(a,b+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];

/* ========== WEEKLY SEEDED CHALLENGE ==========
   Every random-driven system in this game (asteroid layout, enemy waves, pickups,
   encounters, route options, planets, black holes, gravity wells...) is built on
   Math.random(). Swapping Math.random itself for a seeded generator during a
   Weekly Challenge run makes the ENTIRE run deterministic — same seed, same
   universe for every pilot that week — without touching every call site. */
function mulberry32(seed){
 return function(){
  seed|=0; seed=seed+0x6D2B79F5|0;
  let t=Math.imul(seed^seed>>>15,1|seed);
  t=t+Math.imul(t^t>>>7,61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296;
 };
}
function isoWeekId(d){
 const dt=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));
 const day=(dt.getUTCDay()+6)%7; dt.setUTCDate(dt.getUTCDate()-day+3);
 const firstThu=new Date(Date.UTC(dt.getUTCFullYear(),0,4));
 const week=1+Math.round(((dt-firstThu)/86400000-3+((firstThu.getUTCDay()+6)%7))/7);
 return dt.getUTCFullYear()*100+week;
}
function weekLabel(){ const id=isoWeekId(new Date()); return 'WEEK '+(id%100)+' · '+Math.floor(id/100); }
const _nativeRandom=Math.random.bind(Math);
function enableWeeklySeed(){ Math.random=mulberry32(isoWeekId(new Date())*2654435761); }
function disableWeeklySeed(){ Math.random=_nativeRandom; }
const damp=(a,b,l,dt)=>lerp(a,b,1-Math.exp(-l*dt));
const TAU=Math.PI*2;
const BOUND_X=8.2, BOUND_Y=4.6, SPAWN_Z=-260;
function fmtTime(s){ if(s>=60){const m=Math.floor(s/60),x=Math.floor(s%60);return m+':'+String(x).padStart(2,'0');} return Math.max(0,s).toFixed(1)+'s';}
function pad6(n){ return String(Math.max(0,Math.floor(n))).padStart(6,'0'); }

