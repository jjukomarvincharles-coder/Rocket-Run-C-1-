/* ========== UI SCREENS ========== */
const overlay=document.getElementById('overlay');
function menuBackground(){
 if(!rocket) createRocketInstance();
 rocket.group.position.set(0,-0.4,0);
 rocket.group.rotation.set(0,0.5,0);
 rocketPos.set(0,0,0);
 if(CameraMode.current !== 0) rocket.group.visible=false;
}
function showMenu(){
 Game.state='MENU';
 document.getElementById('hud').classList.add('hidden');
 overlay.classList.remove('hidden');
 const daily=ensureDaily();
 const nextTitle=TITLES.find(t=>SAVE.level<t[0]);
 overlay.innerHTML=`<div class="screen">
  <div class="title">ROCKET<span>RUN</span></div>
  <div class="subtitle">The Never-Ending Voyage</div>
  <div class="card" style="width:100%;max-width:560px;text-align:center">
   <div class="level-ring">PILOT LEVEL ${SAVE.level} · ${getTitle()} · CYCLE ${SAVE.cycle}</div>
   <div class="xpPanel" style="margin-top:8px">
    <div class="bar" style="height:6px;background:rgba(0,20,38,.85);border:1px solid rgba(180,108,255,.35)">
     <div style="height:100%;width:${clamp(SAVE.xp/xpToNext(),0,1)*100}%;background:linear-gradient(90deg,#6a2ad8,#b46cff 60%,#ff9af0);box-shadow:0 0 10px rgba(180,108,255,.9)"></div>
    </div>
    <div style="font-size:10px;letter-spacing:2px;color:rgba(190,235,255,.6);margin-top:5px">
     ${SAVE.xp} / ${xpToNext()} XP ${nextTitle?'· NEXT: '+nextTitle[1]:'· MAX TITLE'}
    </div>
   </div>
   <div style="display:flex;gap:7px;justify-content:center;flex-wrap:wrap;margin-top:12px">
    <span class="res-pill">◆ ${SAVE.coins}¢</span>
    <span class="res-pill gold">◉ ${SAVE.resources.relics} RELICS</span>
    <span class="res-pill violet">⬢ ${SAVE.resources.blueprints} BLUEPRINTS</span>
    <span class="res-pill">⚙ ${SAVE.resources.cores} CORES</span>
   </div>
  </div>
  <div class="menu-grid" style="max-width:460px">
   <div class="btn primary" data-act="play">LAUNCH</div>
   <div class="btn" data-act="modes">GAME MODES</div>
   <div class="btn" data-act="garage">GARAGE</div>
   <div class="btn" data-act="upgrades">UPGRADES</div>
   <div class="btn" data-act="missions">MISSIONS</div>
   <div class="btn" data-act="journal">GALAXY DATABASE</div>
   <div class="btn" data-act="logs">STORY LOGS</div>
   <div class="btn" data-act="hall">HALL OF FAME</div>
   <div class="btn" data-act="profile">PILOT PROFILE</div>
   <div class="btn" data-act="leaderboard">LEADERBOARD</div>
   <div class="btn" data-act="settings">SETTINGS</div>
  </div>
  <div style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center;margin-top:4px">
   <div class="stat-box"><div class="k">COINS</div><div class="v">${SAVE.coins}</div></div>
   <div class="stat-box"><div class="k">BEST</div><div class="v">${SAVE.best}</div></div>
   <div class="stat-box"><div class="k">RUNS</div><div class="v">${SAVE.runs}</div></div>
   <div class="stat-box"><div class="k">DAILY</div><div class="v">${daily.done}/${daily.total}</div></div>
   <div class="stat-box"><div class="k">REGION</div><div class="v" style="font-size:13px">${REGIONS[SAVE.highestRegion].short}</div></div>
   <div class="stat-box"><div class="k">KILLS</div><div class="v">${SAVE.enemies.totalKilled||0}</div></div>
  </div>
 </div>`;
 overlay.querySelectorAll('[data-act]').forEach(b=>{
  b.onclick=()=>{ Sound.init(); Sound.resume(); route(b.dataset.act); }; });
}
function route(act){
 switch(act){
  case 'play': showExpedition(); break;
  case 'modes': showModes(); break;
  case 'garage': showGarage(); break;
  case 'upgrades': showUpgrades(); break;
  case 'missions': showMissions(); break;
  case 'journal': showJournal(); break;
  case 'logs': showLogs(); break;
  case 'hall': showHall(); break;
  case 'profile': showProfile(); break;
  case 'leaderboard': showLeaderboard(); break;
  case 'settings': showSettings(); break;
 }
}
function showModes(){
 overlay.classList.remove('hidden');
 const legendaryActive=Math.random()<0.12;
 overlay.innerHTML=`<div class="screen">
  <div class="section-title">GAME MODES</div>
  <div class="subtitle">DIFFERENT WAYS TO FLY</div>
  <div class="menu-grid" style="max-width:720px">
   <div class="card mode-card" data-mode="expedition"><div class="mn">EXPEDITION</div><div class="md">Classic voyage from Earth to the Edge.</div></div>
   <div class="card mode-card" data-mode="timetrial"><div class="mn">TIME TRIAL</div><div class="md">Reach 10,000m as fast as possible.</div></div>
   <div class="card mode-card" data-mode="fueltrial"><div class="mn">FUEL TRIAL</div><div class="md">Fixed 5:00 tank. Waste nothing.</div></div>
   <div class="card mode-card" data-mode="asteroidtrial"><div class="mn">ASTEROID TRIAL</div><div class="md">Dodge 200 asteroids. Fuel is irrelevant.</div></div>
   <div class="card mode-card" data-mode="gauntlet"><div class="mn">GAUNTLET</div><div class="md">Long tank, escalating danger.</div></div>
   <div class="card mode-card nightmare" data-mode="nightmare"><div class="mn">NIGHTMARE</div><div class="md">Less fuel. More hunters. Huge rewards.</div></div>
   <div class="card mode-card weekly" data-mode="weekly"><div class="mn">⬡ WEEKLY CHALLENGE</div><div class="md">${weekLabel()} · Same universe for every pilot this week. Compare runs fairly.</div></div>
   ${legendaryActive?`<div class="card mode-card legendary" data-mode="legendary"><div class="mn">★ LEGENDARY ★</div><div class="md">A rare passage has opened. This run is unique.</div></div>`:''}
  </div>
  <div class="card" style="width:100%;max-width:720px;text-align:center">
   <div style="font-size:11px;letter-spacing:2px;color:rgba(190,235,255,.65)">
    LEGENDARY RUNS appear occasionally. They are rare, beautiful, and rewarding.
   </div>
  </div>
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.querySelectorAll('[data-mode]').forEach(card=>{
  card.onclick=()=>{ const m=card.dataset.mode;
   if(m==='legendary') startRun(generateExpedition(),{mode:'legendary',legendary:true});
   else if(m==='weekly') startRun(null,{mode:'weekly'});
   else startRun(generateExpedition(),{mode:m}); };
 });
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
}
function showExpedition(){
 overlay.classList.remove('hidden');
 const exp=generateExpedition();
 const dangerTotal=exp.reduce((a,l)=>a+REGIONS[l.region].danger,0);
 const maxDanger=exp.length*8;
 const dangerPct=Math.round(dangerTotal/maxDanger*100);
 const rewardTotal=exp.reduce((a,l)=>a+REGIONS[l.region].reward,0);
 const rewardStars=clamp(Math.round(rewardTotal/exp.length),1,5);
 let legsHtml='';
 exp.forEach((l,i)=>{ const r=REGIONS[l.region]; const hidden=i>1&&l.type==='unknown';
  legsHtml+=`<div class="jentry"><span class="jn2">${i+1}. ${hidden?'???':r.name}</span>
   <span class="jt">${hidden?'UNKNOWN':(l.type==='unknown'?'?':'★'.repeat(clamp(r.danger,1,5)))}</span></div>`; });
 overlay.innerHTML=`<div class="screen">
  <div class="section-title">EXPEDITION</div>
  <div class="subtitle">THE NEVER-ENDING VOYAGE BEGINS</div>
  <div class="card" style="width:100%;max-width:620px"><h3>FLIGHT PLAN</h3>${legsHtml}</div>
  <div class="stats-grid" style="max-width:620px">
   <div class="card stat-box"><div class="k">DESTINATION</div><div class="v" style="font-size:13px">THE EDGE</div></div>
   <div class="card stat-box"><div class="k">EST. DANGER</div><div class="v">${'█'.repeat(Math.round(dangerPct/12))}${'░'.repeat(8-Math.round(dangerPct/12))}</div></div>
   <div class="card stat-box"><div class="k">POTENTIAL</div><div class="v">${'★'.repeat(rewardStars)}${'☆'.repeat(5-rewardStars)}</div></div>
   <div class="card stat-box"><div class="k">FUEL</div><div class="v">5:00</div></div>
  </div>
  <div class="row"><div class="btn primary" id="expGo">LAUNCH</div><div class="btn" id="expBack">BACK</div></div>
 </div>`;
 overlay.querySelector('#expGo').onclick=()=>startRun(exp,{mode:'expedition'});
 overlay.querySelector('#expBack').onclick=showMenu;
}
function showGarage(){
 overlay.classList.remove('hidden');
 let html=`<div class="screen">
  <div class="section-title">ROCKET GARAGE</div>
  <div class="subtitle">COINS: ${SAVE.coins}¢</div>
  <div class="rocket-list">`;
 ROCKET_DEFS.forEach(r=>{
  const owned=SAVE.unlockedRockets.includes(r.id);
  const sel=SAVE.selectedRocket===r.id;
  const mastery=SAVE.mastery[r.id]||0;
  const tier=Math.min(4,Math.floor(mastery/800));
  const tierNames=['Mk I','Mk II','Mk III','X','OMEGA'];
  html+=`<div class="card rocket-card ${sel?'sel':''} ${owned?'':'locked'}" data-r="${r.id}">
   <div class="rname" style="color:#${new THREE.Color(r.accent).getHexString()}">${r.name}</div>
   <div class="badge">${r.cls}</div>
   <div class="rdesc">${r.desc}</div>
   ${statBar('SPEED',r.speed/1.35)}
   ${statBar('HULL',r.hull/1.9)}
   ${statBar('FUEL',r.fuel/1.5)}
   ${statBar('HANDLING',r.handling/1.45)}
   <div style="margin-top:9px"><span class="badge violet">${tierNames[tier]}</span><span class="badge">MASTERY ${mastery}</span></div>
   <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
    <span class="price">${owned?(sel?'● EQUIPPED':'OWNED'):r.price+'¢'}</span>
    <span class="badge">${owned?(sel?'SELECT':'EQUIP'):'UNLOCK'}</span>
   </div></div>`; });
 html+=`</div>
  <div class="card" style="width:100%;max-width:720px">
   <h3>ROCKET EVOLUTION</h3>
   <div style="font-size:12px;letter-spacing:1.4px;color:rgba(190,235,255,.75);line-height:1.6">
    As your mastery grows, each rocket physically evolves:
    <span class="badge">Mk I</span><span class="badge">Mk II</span><span class="badge">Mk III</span>
    <span class="badge violet">X</span><span class="badge gold">OMEGA</span>
   </div>
  </div>
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.innerHTML=html;
 overlay.querySelectorAll('.rocket-card').forEach(card=>{
  card.onclick=()=>{ const id=card.dataset.r;
   const def=ROCKET_DEFS.find(r=>r.id===id);
   if(SAVE.unlockedRockets.includes(id)){ SAVE.selectedRocket=id; persist();
    Sound.blip(720,0.15,'triangle',0.16,1100); showGarage(); }
   else if(SAVE.coins>=def.price){ SAVE.coins-=def.price; SAVE.unlockedRockets.push(id);
    SAVE.selectedRocket=id; persist(); Sound.superGas(); toast('UNLOCKED · '+def.name);
    addXP(1000); showGarage(); }
   else { Sound.blip(200,0.18,'square',0.14,120); toast('NOT ENOUGH COINS'); } };
 });
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
}
function statBar(label,t){ const p=clamp(t,0,1)*100;
 return `<div class="stat"><span style="width:66px">${label}</span><span class="bar"><i style="width:${p}%"></i></span></div>`; }
function showUpgrades(){
 overlay.classList.remove('hidden');
 let html=`<div class="screen">
  <div class="section-title">UPGRADES</div>
  <div class="subtitle">COINS: ${SAVE.coins}¢</div>
  <div class="card" style="width:100%">`;
 UPGRADE_DEFS.forEach(u=>{
  const lvl=SAVE.upgrades[u.id]||0; const cost=upgradeCost(u,lvl); const maxed=lvl>=u.max;
  html+=`<div class="upg-row">
   <div class="un">${u.name}<div style="font-size:10px;letter-spacing:1px;color:rgba(190,235,255,.6);font-family:'Rajdhani'">${u.desc}</div></div>
   <div class="pips">${Array.from({length:u.max}).map((_,i)=>`<div class="pip ${i<lvl?'on':''}"></div>`).join('')}</div>
   <div class="btn small" data-u="${u.id}" ${maxed||SAVE.coins<cost?'disabled':''}>${maxed?'MAX':cost+'¢'}</div>
  </div>`; });
 html+=`</div>
  <div class="row"><div class="btn" data-act="back">BACK</div><div class="btn" data-act="reset">REFUND & RESET</div></div>
 </div>`;
 overlay.innerHTML=html;
 overlay.querySelectorAll('[data-u]').forEach(b=>{
  b.onclick=()=>{ const u=UPGRADE_DEFS.find(x=>x.id===b.dataset.u);
   const lvl=SAVE.upgrades[u.id]||0; const cost=upgradeCost(u,lvl);
   if(lvl>=u.max||SAVE.coins<cost) return;
   SAVE.coins-=cost; SAVE.upgrades[u.id]=lvl+1; persist();
   Sound.blip(880,0.2,'triangle',0.18,1400); toast(u.name+' → LV '+(lvl+1)); showUpgrades(); }; });
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
 overlay.querySelector('[data-act="reset"]').onclick=()=>{
  let refund=0;
  for(const u of UPGRADE_DEFS){ const lvl=SAVE.upgrades[u.id]||0;
   for(let i=0;i<lvl;i++) refund+=upgradeCost(u,i); }
  SAVE.coins+=Math.floor(refund*0.7);
  for(const u of UPGRADE_DEFS) SAVE.upgrades[u.id]=0;
  persist(); toast('REFUNDED '+Math.floor(refund*0.7)+'¢'); showUpgrades(); };
}
function ensureDaily(){
 const today=new Date().toISOString().slice(0,10);
 if(SAVE.daily.date!==today){ SAVE.daily={date:today,progress:{}}; persist(); }
 const defs=[{id:'d_survive',text:'SURVIVE 90 SECONDS',goal:90},{id:'d_gas',text:'COLLECT 15 GAS',goal:15},
  {id:'d_close',text:'GET 3 CLOSE CALLS',goal:3},{id:'d_mult',text:'REACH x4 MULTIPLIER',goal:4}];
 let done=0;
 for(const d of defs){ if((SAVE.daily.progress[d.id]||0)>=d.goal) done++; }
 return {done,total:defs.length,defs};
}
function showMissions(){
 overlay.classList.remove('hidden');
 const daily=ensureDaily();
 let html=`<div class="screen">
  <div class="section-title">MISSIONS</div>
  <div class="card" style="width:100%"><h3>ACTIVE MISSIONS</h3>`;
 for(const m of MISSION_DEFS){
  const cur=Math.min(SAVE.missions[m.id]||0,m.goal);
  const done=(SAVE.missions[m.id]||0)>=m.goal;
  html+=`<div class="mission ${done?'done':''}"><div class="mt">${m.text}</div>
   <div class="mp">${Math.floor(cur)}/${m.goal}</div>
   <div class="badge">${done?'✓':m.reward+'¢'}</div></div>`; }
 html+=`</div>
  <div class="card" style="width:100%"><h3>DAILY CHALLENGES · ${daily.done}/${daily.total}</h3>`;
 for(const d of daily.defs){
  const cur=Math.min(SAVE.daily.progress[d.id]||0,d.goal); const done=cur>=d.goal;
  html+=`<div class="mission ${done?'done':''}"><div class="mt">${d.text}</div>
   <div class="mp">${Math.floor(cur)}/${d.goal}</div>
   <div class="badge">${done?'✓':'150¢'}</div></div>`; }
 html+=`</div>
  <div class="card" style="width:100%"><h3>ACHIEVEMENTS</h3>
   <div style="display:flex;flex-wrap:wrap;gap:6px">
    ${ACHIEVEMENT_DEFS.map(a=>`<span class="badge" style="${SAVE.achievements[a.id]?'color:#a9f7ff;border-color:#a9f7ff':'opacity:.35'}">${a.text}</span>`).join('')}
   </div>
  </div>
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.innerHTML=html;
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
}
function showJournal(){
 overlay.classList.remove('hidden');
 let cells='';
 for(const cat of JOURNAL_CATS){
  const count=journalCount(cat.key); const pct=clamp(count/cat.total,0,1)*100;
  cells+=`<div class="card jcell"><div class="jn">${cat.label}</div>
   <div class="jv">${count}<span style="font-size:12px;opacity:.5">/${cat.total}</span></div>
   <div class="jbar"><i style="width:${pct}%"></i></div></div>`; }
 let entries='';
 for(const cat of JOURNAL_CATS){
  const keys=Object.keys(SAVE.journal[cat.key]||{});
  if(!keys.length) continue;
  entries+=`<div class="card" style="width:100%"><h3>${cat.label}</h3>`;
  keys.slice(0,40).forEach(k=>{ const meta=SAVE.journal[cat.key][k];
   entries+=`<div class="jentry"><span class="jn2">${k}</span><span class="jt">${meta.type?meta.type:'LOGGED'}</span></div>`; });
  entries+=`</div>`; }
 if(!entries) entries=`<div class="card" style="width:100%;text-align:center;color:rgba(190,235,255,.6)">NO ENTRIES YET — GO EXPLORE</div>`;
 let secretsHtml=`<div class="card" style="width:100%"><h3>UNKNOWN SIGNALS</h3>`;
 for(const key in SECRET_REGIONS){ const sr=SECRET_REGIONS[key];
  const seen=SAVE.seenSignal[key]; const disc=SAVE.discoveredSecrets[key];
  secretsHtml+=`<div class="jentry"><span class="jn2" style="${disc?'color:#ffe9a8':''}">${disc?sr.name:(seen?'★ '+sr.name:'● ● ●')}</span>
   <span class="jt">${disc?'DISCOVERED':(seen?'SIGNAL LOCKED':'UNKNOWN')}</span></div>`; }
 secretsHtml+=`<div style="font-size:11px;letter-spacing:2px;color:rgba(190,235,255,.6);margin-top:10px">
  LISTEN TO TRANSMISSIONS AND DOCK AT STATIONS TO REVEAL HIDDEN ROUTES.</div></div>`;
 overlay.innerHTML=`<div class="screen">
  <div class="section-title">GALAXY DATABASE</div>
  <div class="subtitle">EVERYTHING YOU HAVE SEEN AND SURVIVED</div>
  <div class="journal-grid">${cells}</div>
  ${secretsHtml}${entries}
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
}
function showLogs(){
 overlay.classList.remove('hidden');
 const collected=Object.keys(SAVE.storyLogs).length;
 let html=`<div class="screen">
  <div class="section-title">STORY LOGS</div>
  <div class="subtitle">${collected} / ${STORY_LOGS.length} RECOVERED</div>
  <div class="card" style="width:100%;max-width:720px"><h3>FRAGMENTS</h3>`;
 if(collected===0){ html+=`<div style="text-align:center;color:rgba(190,235,255,.6);font-size:12px;letter-spacing:2px;padding:18px 0">
  NO LOGS RECOVERED YET. INVESTIGATE WRECKS. LISTEN TO SIGNALS.</div>`; }
 else { STORY_LOGS.forEach(l=>{ if(SAVE.storyLogs[l.id]){
   html+=`<div class="log-entry"><div class="lid">${l.id}</div><div class="ltxt">${l.text}</div></div>`; } }); }
 html+=`</div>
  <div class="card" style="width:100%;max-width:720px"><h3>TRANSMISSIONS HEARD</h3>
   <div style="display:flex;flex-wrap:wrap;gap:5px">
    ${TRANSMISSIONS.map(t=>`<span class="badge ${SAVE.transmissionsHeard[t.id]?'':'locked'}" style="${SAVE.transmissionsHeard[t.id]?'color:#ffe9a8;border-color:rgba(255,207,77,.6)':''}">${t.id}</span>`).join('')}
   </div>
  </div>
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.innerHTML=html;
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
}
function showHall(){
 overlay.classList.remove('hidden');
 const rarest=(()=>{ const all=[];
  for(const cat of JOURNAL_CATS){ for(const k in (SAVE.journal[cat.key]||{})) all.push({k,cat:cat.label}); }
  return all.length?all[rndi(0,all.length-1)]:{k:'—',cat:'—'}; })();
 overlay.innerHTML=`<div class="screen">
  <div class="section-title">HALL OF FAME</div>
  <div class="subtitle">A PHYSICAL ROOM IN YOUR HONOR</div>
  <div class="hof-room"><div class="hof-floor"></div>
   <div class="hof-grid">
    <div class="hof-item gold"><div class="hk">BEST SCORE</div><div class="hv">${SAVE.best.toLocaleString()}</div></div>
    <div class="hof-item"><div class="hk">TOTAL DISTANCE</div><div class="hv">${Math.floor(SAVE.totalDistance).toLocaleString()}m</div></div>
    <div class="hof-item violet"><div class="hk">LEGENDARY RUNS</div><div class="hv">${SAVE.stats.legendaryRuns||0}</div></div>
    <div class="hof-item"><div class="hk">SECTORS VISITED</div><div class="hv">${journalCount('regions')}</div></div>
    <div class="hof-item gold"><div class="hk">RAREST DISCOVERY</div><div class="hv" style="font-size:13px">${rarest.k}</div></div>
    <div class="hof-item"><div class="hk">ENEMIES DESTROYED</div><div class="hv">${SAVE.enemies.totalKilled||0}</div></div>
   </div>
   <div class="hof-podium">
    <div class="pd silver"><div style="font-size:10px;color:#a9f7ff;font-family:'Orbitron',monospace">2nd</div><div class="pdr">◈</div></div>
    <div class="pd gold"><div style="font-size:10px;color:#ffe9a8;font-family:'Orbitron',monospace">1st · YOU</div><div class="pdr">★</div></div>
    <div class="pd bronze"><div style="font-size:10px;color:#ffb08a;font-family:'Orbitron',monospace">3rd</div><div class="pdr">◈</div></div>
   </div>
  </div>
  <div class="card" style="width:100%;max-width:800px;text-align:center">
   <h3>ROCKETS DISPLAYED</h3>
   <div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center">
    ${SAVE.unlockedRockets.map(id=>{ const d=getRocketDef(id);
     const t=Math.min(4,Math.floor((SAVE.mastery[id]||0)/800));
     return `<span class="badge" style="color:#${new THREE.Color(d.accent).getHexString()};border-color:rgba(58,233,255,.6)">${d.name} · Mk ${['I','II','III','X','Ω'][t]}</span>`; }).join('')}
   </div>
  </div>
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
}
function showProfile(){
 overlay.classList.remove('hidden');
 const title=getTitle(); const nextTitle=TITLES.find(t=>SAVE.level<t[0]);
 overlay.innerHTML=`<div class="screen">
  <div class="section-title">PILOT PROFILE</div>
  <div class="profile-hero">
   <div class="profile-avatar">${title.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
   <div>
    <div style="font-family:'Orbitron',monospace;font-size:20px;font-weight:900;color:#fff;letter-spacing:3px">PILOT ${SAVE.level}</div>
    <div class="level-ring" style="margin-top:6px">${title} · CYCLE ${SAVE.cycle}</div>
    <div style="margin-top:10px;font-size:11px;letter-spacing:2px;color:rgba(190,235,255,.7)">
     XP ${SAVE.xp} / ${xpToNext()}${nextTitle?' · NEXT: '+nextTitle[1]:''}
    </div>
   </div>
  </div>
  <div class="stats-grid">
   <div class="card stat-box"><div class="k">BEST SCORE</div><div class="v">${SAVE.best.toLocaleString()}</div></div>
   <div class="card stat-box"><div class="k">TOTAL DISTANCE</div><div class="v">${Math.floor(SAVE.totalDistance).toLocaleString()}m</div></div>
   <div class="card stat-box"><div class="k">RUNS</div><div class="v">${SAVE.runs}</div></div>
   <div class="card stat-box"><div class="k">ASTEROIDS DODGED</div><div class="v">${SAVE.stats.dodges}</div></div>
   <div class="card stat-box"><div class="k">ENEMIES DESTROYED</div><div class="v">${SAVE.enemies.totalKilled||0}</div></div>
   <div class="card stat-box"><div class="k">ENCOUNTERS</div><div class="v">${SAVE.stats.encounters}</div></div>
   <div class="card stat-box"><div class="k">WRECKS</div><div class="v">${SAVE.stats.wrecksInvestigated}</div></div>
   <div class="card stat-box"><div class="k">STATIONS</div><div class="v">${SAVE.stats.stationsVisited}</div></div>
   <div class="card stat-box"><div class="k">REGIONS SEEN</div><div class="v">${journalCount('regions')}/${REGIONS.length}</div></div>
   <div class="card stat-box"><div class="k">ROCKETS</div><div class="v">${SAVE.unlockedRockets.length}/${ROCKET_DEFS.length}</div></div>
   <div class="card stat-box"><div class="k">ACHIEVEMENTS</div><div class="v">${Object.keys(SAVE.achievements).length}/${ACHIEVEMENT_DEFS.length}</div></div>
   <div class="card stat-box"><div class="k">SECRET SECTORS</div><div class="v">${Object.keys(SAVE.discoveredSecrets).length}/${Object.keys(SECRET_REGIONS).length}</div></div>
  </div>
  <div class="card" style="width:100%"><h3>JOURNEY PROGRESS</h3>
   <div style="display:flex;flex-wrap:wrap;gap:5px">
    ${REGIONS.map(r=>{ const seen=!!SAVE.stats.sectorsVisited[r.name];
     return `<span class="badge ${seen?'':'locked'}" style="${seen?'border-color:rgba(58,233,255,.7);color:#a9f7ff':''}">${r.short}</span>`; }).join('')}
    ${Object.keys(SECRET_REGIONS).map(k=>{ const seen=SAVE.discoveredSecrets[k];
     return `<span class="badge ${seen?'gold':'locked'}" style="${seen?'':'opacity:.35'}">${SECRET_REGIONS[k].short}</span>`; }).join('')}
   </div>
  </div>
  <div class="row">
   <div class="btn" data-act="cycle" ${SAVE.highestRegion>=REGIONS.length-1?'':'disabled'}>BEGIN CYCLE ${SAVE.cycle+1} (NEW GAME+)</div>
   <div class="btn" data-act="back">BACK</div>
  </div>
 </div>`;
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
 overlay.querySelector('[data-act="cycle"]').onclick=()=>{
  if(SAVE.highestRegion<REGIONS.length-1) return;
  if(!confirm('Begin a new Universe Cycle? Difficulty rises, new secrets appear, permanent bonuses granted.')) return;
  SAVE.cycle++; SAVE.resources.relics+=3; SAVE.resources.cores+=10; SAVE.coins+=5000;
  persist(); toast('CYCLE '+SAVE.cycle+' BEGINS'); Sound.legendary(); showProfile(); };
}
function showLeaderboard(){
 overlay.classList.remove('hidden');
 const seedNames=['NOVA','ORION','VEGA','LYRA','ZETA','ATLAS','COMET','PULSAR','QUASAR','DRIFT','ECHO','NEBULON','TITAN','RIFT','HALO'];
 const rows=[];
 for(let i=0;i<14;i++){ rows.push({name:seedNames[i%seedNames.length]+(i>13?'2':''),
  score:Math.floor(SAVE.best*(1.3-i*0.07)+rnd(0,5000)+2500),rocket:pick(ROCKET_DEFS).name,
  dist:Math.floor(rnd(800,12000))}); }
 rows.push({name:'YOU',score:SAVE.best,rocket:getRocketDef(SAVE.selectedRocket).name,
  dist:Math.floor(SAVE.totalDistance/Math.max(1,SAVE.runs)),me:true});
 rows.sort((a,b)=>b.score-a.score);
 overlay.innerHTML=`<div class="screen">
  <div class="section-title">LEADERBOARD</div>
  <div class="subtitle">GLOBAL · WEEKLY · FRIENDS</div>
  <div class="card" style="width:100%">
   <div class="lb-row head"><div>#</div><div>PILOT</div><div class="col-score">SCORE</div><div class="col-dist">DISTANCE</div></div>
   ${rows.map((r,i)=>`<div class="lb-row ${r.me?'me':''}">
    <div>${i+1}</div><div>${r.name}<div style="font-size:10px;opacity:.55">${r.rocket}</div></div>
    <div class="col-score">${r.score.toLocaleString()}</div>
    <div class="col-dist">${r.dist}m</div></div>`).join('')}
  </div>
  ${SAVE.ghost?`<div class="card" style="width:100%;text-align:center"><h3>GHOST RACE</h3>
   <div style="font-size:12px;letter-spacing:2px;color:rgba(190,235,255,.75)">
    YOUR LAST RECORD RUN HAUNTS EVERY FLIGHT.<br>GHOST SCORE: ${SAVE.ghost.score.toLocaleString()}</div></div>`:''}
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
}
function showSettings(){
 Sound.init();
 Sound.setEngineVolume(SAVE.settings.engineVolume??0.78);
 Sound.setEffectsVolume(SAVE.settings.effectsVolume??0.84);
 Sound.setMusicVolume(SAVE.settings.musicVolume??0.62);
 Sound.setLaunchVolume(SAVE.settings.launchVolume??0.58);
 Sound.setRealLaunch(SAVE.settings.realLaunch!==false);
 overlay.classList.remove('hidden');
 const q=SAVE.settings.quality;
 const qLabel=q==='auto'?('AUTO · '+detectQuality()):q;
 overlay.innerHTML=`<div class="screen">
  <div class="section-title">SETTINGS</div>
  <div class="card" style="width:100%;max-width:540px"><h3>GRAPHICS QUALITY</h3>
   <div class="row" style="justify-content:flex-start">
    ${['auto','LOW','MEDIUM','HIGH','ULTRA'].map(k=>`<div class="btn small ${q===k?'primary':''}" data-q="${k}">${k}</div>`).join('')}
   </div>
   <div style="margin-top:12px;font-size:11px;letter-spacing:2px;color:rgba(190,235,255,.6)">CURRENT: ${qLabel}</div>
  </div>
  <div class="card" style="width:100%;max-width:540px"><h3>AUDIO</h3>
   <div class="row" style="justify-content:flex-start">
    <div class="btn small ${SAVE.settings.sound?'primary':''}" data-s="sound">SOUND ${SAVE.settings.sound?'ON':'OFF'}</div>
    <div class="btn small ${SAVE.settings.music?'primary':''}" data-s="music">MUSIC ${SAVE.settings.music?'ON':'OFF'}</div>
    <div class="btn small ${SAVE.settings.realLaunch!==false?'primary':''}" data-s="realLaunch">REAL LAUNCH ${SAVE.settings.realLaunch!==false?'ON':'OFF'}</div>
   </div>
   <div class="audio-control"><label>ENGINE ROAR</label><input type="range" min="0" max="100" value="${Math.round((SAVE.settings.engineVolume??0.78)*100)}" data-audio="engineVolume"><output>${Math.round((SAVE.settings.engineVolume??0.78)*100)}%</output></div>
   <div class="audio-control"><label>EFFECTS</label><input type="range" min="0" max="100" value="${Math.round((SAVE.settings.effectsVolume??0.84)*100)}" data-audio="effectsVolume"><output>${Math.round((SAVE.settings.effectsVolume??0.84)*100)}%</output></div>
   <div class="audio-control"><label>MUSIC</label><input type="range" min="0" max="100" value="${Math.round((SAVE.settings.musicVolume??0.62)*100)}" data-audio="musicVolume"><output>${Math.round((SAVE.settings.musicVolume??0.62)*100)}%</output></div>
   <div class="audio-control"><label>REAL LAUNCH</label><input type="range" min="0" max="100" value="${Math.round((SAVE.settings.launchVolume??0.58)*100)}" data-audio="launchVolume"><output>${Math.round((SAVE.settings.launchVolume??0.58)*100)}%</output></div>
   <div class="audio-note">AUTHENTIC LAUNCH RECORDING: NASA GODDARD · “SOUNDS OF A LAUNCH” (ANTARES). Played during launch only. NASA is not affiliated with or endorsing this game. An adaptive synthesized engine continues during flight.</div>
  </div>
  <div class="card" style="width:100%;max-width:540px"><h3>FLIGHT CAMERA</h3>
   <div style="font-size:11px;letter-spacing:1.2px;line-height:1.6;color:rgba(190,235,255,.68)">During flight, tap the single camera control to cycle through CHASE, COCKPIT and NOSE views. The selected view is remembered.</div>
  </div>
  <div class="card" style="width:100%;max-width:540px"><h3>SKIN · ENGINE COLOR</h3>
   <div class="row" style="justify-content:flex-start">
    ${['#ff8a2b','#62f6ff','#ff3a8a','#7cff9a','#c07aff','#ffe45c'].map(c=>
     `<div class="btn small ${SAVE.skins.engine===c?'primary':''}" data-e="${c}" style="min-width:52px;padding:10px 8px">
      <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${c};box-shadow:0 0 10px ${c}"></span></div>`).join('')}
   </div>
   <h3 style="margin-top:14px">TRAIL COLOR</h3>
   <div class="row" style="justify-content:flex-start">
    ${['#39d8ff','#7cff9a','#ff5ac8','#b46cff','#ffd24d'].map(c=>
     `<div class="btn small ${SAVE.skins.trail===c?'primary':''}" data-t="${c}" style="min-width:52px;padding:10px 8px">
      <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${c};box-shadow:0 0 10px ${c}"></span></div>`).join('')}
   </div>
  </div>
  <div class="card" style="width:100%;max-width:540px"><h3>ABOUT</h3>
   <div style="font-size:12px;letter-spacing:1.4px;line-height:1.7;color:rgba(190,235,255,.75)">
    ROCKET RUN · THE NEVER-ENDING VOYAGE<br>
    Base fuel: 5 minutes. Collect gas to survive.<br>
    Dodge, dock, upgrade, discover. Fight when you must.<br>
    The universe remembers everything.
   </div>
   <div class="btn small" data-act="wipe" style="margin-top:14px;color:#ff8a8a;border-color:rgba(255,120,120,.5)">ERASE SAVE DATA</div>
  </div>
  <div class="row"><div class="btn" data-act="back">BACK</div></div>
 </div>`;
 overlay.querySelectorAll('[data-q]').forEach(b=>{ b.onclick=()=>{ SAVE.settings.quality=b.dataset.q; applyQuality(b.dataset.q); persist(); showSettings(); }; });
 overlay.querySelectorAll('[data-s]').forEach(b=>{ b.onclick=()=>{ const k=b.dataset.s;
  SAVE.settings[k]=!SAVE.settings[k];
  if(k==='sound'){ Sound.init(); Sound.setEnabled(SAVE.settings.sound); }
  if(k==='music'){ Sound.setMusic(SAVE.settings.music); }
  if(k==='realLaunch'){ Sound.setRealLaunch(SAVE.settings.realLaunch); }
  persist(); showSettings(); }; });
 overlay.querySelectorAll('[data-audio]').forEach(input=>{
  input.oninput=()=>{
   const k=input.dataset.audio, v=clamp(Number(input.value)/100,0,1);
   SAVE.settings[k]=v;
   if(k==='engineVolume') Sound.setEngineVolume(v);
   if(k==='effectsVolume') Sound.setEffectsVolume(v);
   if(k==='musicVolume') Sound.setMusicVolume(v);
   if(k==='launchVolume') Sound.setLaunchVolume(v);
   const output=input.parentElement.querySelector('output'); if(output) output.textContent=input.value+'%';
   persist();
  };
 });
 overlay.querySelectorAll('[data-e]').forEach(b=>{ b.onclick=()=>{ SAVE.skins.engine=b.dataset.e; persist(); createRocketInstance(); showSettings(); }; });
 overlay.querySelectorAll('[data-t]').forEach(b=>{ b.onclick=()=>{ SAVE.skins.trail=b.dataset.t; persist(); createRocketInstance(); showSettings(); }; });
 overlay.querySelector('[data-act="back"]').onclick=showMenu;
 overlay.querySelector('[data-act="wipe"]').onclick=()=>{ if(confirm('Erase all progress?')){ localStorage.removeItem(SAVE_KEY); location.reload(); } };
}
function showGameOver(reason,score,isRecord,xpGain){
 document.getElementById('hud').classList.add('hidden');
 overlay.classList.remove('hidden');
 el.legendaryTint.style.opacity='0';
 let objective='';
 if(SAVE.level<5) objective='Reach Pilot Level 5 to unlock new missions.';
 else if(SAVE.highestRegion<3) objective='Reach the ASTEROID BELT to unlock deeper sectors.';
 else if(SAVE.highestRegion<6) objective='Push into NEBULA FRONTIER for more GAS.';
 else if(SAVE.highestRegion<9) objective='Reach THE UNKNOWN to unlock VOID RUNNER.';
 else if(SAVE.highestRegion<REGIONS.length-1) objective='Reach the EDGE OF THE UNIVERSE.';
 else if(Object.keys(SAVE.discoveredSecrets).length<Object.keys(SECRET_REGIONS).length) objective='Discover the hidden sectors. The signals are out there.';
 else objective='Begin a new Universe Cycle to push beyond.';
 const legendaryCompleted=Game.legendary;
 let titleOverride=null, subOverride=null;
 if(Game.mode==='timetrial'&&Game._modeComplete){ titleOverride='TIME TRIAL COMPLETE';
  subOverride='FINISHED IN '+Game.finalModeTime.toFixed(2)+'s'; }
 if(Game.mode==='asteroidtrial'&&Game._modeComplete){ titleOverride='ASTEROID TRIAL CLEARED'; subOverride='200 ASTEROIDS DODGED'; }
 if(Game.mode==='fueltrial'&&Game._modeComplete){ titleOverride='FUEL TRIAL COMPLETE'; subOverride='MINIMUM WASTE'; }
 overlay.innerHTML=`<div class="screen">
  <div class="section-title" style="color:${reason==='OUT OF FUEL'?'#fff3c8':'#ffd9d9'};
   text-shadow:0 0 18px ${reason==='OUT OF FUEL'?'rgba(255,207,77,.9)':'rgba(255,74,74,.9)'}">
   ${titleOverride||(legendaryCompleted?'★ LEGENDARY FLIGHT COMPLETE ★':(reason==='OUT OF FUEL'?'OUT OF FUEL':(reason==='HULL DESTROYED'?'HULL DESTROYED':'MISSION FAILED')))}
  </div>
  <div class="subtitle">${subOverride||reason}${isRecord?' · NEW RECORD':''}</div>
  <div class="stats-grid">
   <div class="card stat-box"><div class="k">SCORE</div><div class="v">${score.toLocaleString()}</div></div>
   <div class="card stat-box"><div class="k">DISTANCE</div><div class="v">${Math.floor(Game.distance)}m</div></div>
   <div class="card stat-box"><div class="k">BEST</div><div class="v">${SAVE.best.toLocaleString()}</div></div>
   <div class="card stat-box"><div class="k">COINS</div><div class="v">${Game.coins}</div></div>
   <div class="card stat-box"><div class="k">GAS</div><div class="v">${Game.gasCollected}</div></div>
   <div class="card stat-box"><div class="k">MAX MULT</div><div class="v">x${Game.maxMult}</div></div>
   <div class="card stat-box"><div class="k">TIME</div><div class="v">${Game.time.toFixed(1)}s</div></div>
   <div class="card stat-box"><div class="k">KILLS</div><div class="v">${Game.runStats.enemiesKilled||0}</div></div>
   <div class="card stat-box"><div class="k">WRECKS</div><div class="v">${Game.runStats.wrecks}</div></div>
   <div class="card stat-box"><div class="k">DISCOVERIES</div><div class="v">${Game.runStats.discoveries}</div></div>
   <div class="card stat-box"><div class="k">CRATES</div><div class="v">${Game.runStats.crates}</div></div>
   <div class="card stat-box"><div class="k">XP GAINED</div><div class="v">+${xpGain}</div></div>
  </div>
  <div class="card" style="width:100%;max-width:660px;text-align:center"><h3>YOUR NEXT OBJECTIVE</h3>
   <div style="font-size:13px;letter-spacing:2px;color:#dff7ff">${objective}</div>
  </div>
  <div class="row">
   <div class="btn primary" data-act="again">RUN AGAIN</div>
   <div class="btn" data-act="garage">GARAGE</div>
   <div class="btn" data-act="menu">MAIN MENU</div>
  </div>
 </div>`;
 overlay.querySelector('[data-act="again"]').onclick=()=>startRun(Game.expedition,{mode:Game.mode,legendary:Game.legendary});
 overlay.querySelector('[data-act="garage"]').onclick=showGarage;
 overlay.querySelector('[data-act="menu"]').onclick=showMenu;
}

