/* ========== COLLECT ========== */
function collect(c){
 const def=COLLECTIBLE_DEFS[c.type];
 const stats=computeStats();
 const worldPos=c.group.position.clone();
 Game.chain++; Game.chainTimer=2.6;
 Game.runStats.chains=Math.max(Game.runStats.chains,Game.chain);
 if(Game.chain>=3){ el.chainDisplay.classList.add('on'); el.chainNum.textContent='×'+Game.chain; Sound.chain(Game.chain); }
 if(c.type==='coin'){
  const val=Math.round(def.score*stats.collectorMul*Game.mult*(1+Game.chain*0.05));
  Game.scoreFloat+=val; Game.coins+=Math.round(1*stats.collectorMul);
  Sound.coin(); popup('+'+val,screenX(worldPos),screenY(worldPos),'#ffd24d');
  FX.burst(worldPos,0xffd24d,8,6,0.35,0.45);
 } else if(c.type==='crate'){ openCrate(worldPos); }
 else if(c.type==='relic'){
  SAVE.resources.relics+=1; Game.runStats.relics++;
  Game.scoreFloat+=def.score*Game.mult;
  Sound.superGas(); pushNotify('RELIC ACQUIRED',false,true);
  FX.ring(worldPos,0xff4ad8,14,0.9); FX.burst(worldPos,0xff4ad8,24,12,0.7,0.9);
  discover('anomalies','RELIC FRAGMENT',{bonus:400}); addXP(500);
  popup('+RELIC',screenX(worldPos),screenY(worldPos),'#ff9af0');
 } else if(def.repairHull || def.repairEngine){
  const rh = def.repairHull||0;
  const re = def.repairEngine||0;
  if(rh) Game.hull = Math.min(Game.hullMax, Game.hull + rh);
  if(re) Game.engine = Math.min(Game.engineMax, Game.engine + re);
  Sound.repair();
  FX.ring(worldPos, def.color, 9, 0.6);
  FX.burst(worldPos, def.color, 16, 9, 0.5, 0.65);
  let msg='';
  if(rh&&re) msg=`+${rh}% HULL · +${re}% ENGINE`;
  else if(rh) msg=`+${rh}% HULL`;
  else msg=`+${re}% ENGINE`;
  pushNotify(msg, false, false, true);
  Game.scoreFloat+=def.score*Game.mult;
  popup('+'+def.score,screenX(worldPos),screenY(worldPos),'#7ef2ff');
 } else {
  const fuelGain=def.fuel;
  Game.fuel=Math.min(Game.fuelMax,Game.fuel+fuelGain);
  Game.gasCollected++;
  Game.scoreFloat+=def.score*stats.collectorMul*Game.mult;
  Game.coins+=2;
  if(c.type==='supergas'){ Sound.superGas(); pushNotify('SUPER GAS · FULL TANK'); FX.ring(worldPos,0x62f6ff,9,0.55); }
  else if(c.type==='redgas'){ Sound.gas(); Game.abilities.boost=Math.max(Game.abilities.boost,2.2);
   pushNotify('REDLINE'); FX.ring(worldPos,0xff5a3c,8,0.5); }
  else if(c.type==='goldgas'){ Sound.superGas(); Game.mult=Math.min(5,Game.mult+1);
   Game.maxMult=Math.max(Game.maxMult,Game.mult);
   pushNotify('GOLD GAS · x'+Game.mult,false,true); FX.ring(worldPos,0xffc83a,10,0.6); }
  else if(c.type==='voidgas'){ Sound.slow(); Game.abilities.slow=Math.max(Game.abilities.slow,4.5);
   pushNotify('VOID GAS · TIME SLOWED'); FX.ring(worldPos,0xb46cff,11,0.6); }
  else if(c.type==='quantum'){ Sound.quantum(); pushNotify('QUANTUM GAS · JUMP');
   FX.ring(worldPos,0xffffff,14,0.7);
   for(const a of pool.asteroids){ if(a.active&&a.mesh.position.z<0&&a.mesh.position.z>-80) a.despawn(); }
   Game.invuln=Math.max(Game.invuln,1.4); Game.abilities.boost=Math.max(Game.abilities.boost,1.6); }
  else Sound.gas();
  Game.charges[pick(['boost','shield','magnet','slow','blast'])]=Math.min(Game.maxCharges,1+Math.floor(Math.random()*3));
  updateAbilityHUD();
  FX.burst(worldPos,def.color,14,8,0.45,0.55);
  popup('+'+def.score,screenX(worldPos),screenY(worldPos),'#7ef2ff');
 }
 c.despawn();
}
function openCrate(worldPos){
 Game.runStats.crates++; Sound.crate();
 FX.ring(worldPos,0x7ef2ff,12,0.8); FX.burst(worldPos,0xffffff,22,12,0.6,0.8);
 Game.cinematic=1.2;
 const roll=Math.random();
 if(roll<0.22){ const amt=rndi(120,320); Game.coins+=amt; toast('CRATE · +'+amt+'¢'); discover('crates','COIN CACHE'); }
 else if(roll<0.40){ Game.fuel=Math.min(Game.fuelMax,Game.fuel+90); toast('CRATE · +90s FUEL'); discover('crates','FUEL CACHE'); }
 else if(roll<0.52){ for(const k of ['boost','shield','magnet','slow','blast']) Game.charges[k]=Math.min(Game.maxCharges,Game.charges[k]+1);
  updateAbilityHUD(); toast('CRATE · ALL ABILITIES +1'); discover('crates','ABILITY CACHE'); }
 else if(roll<0.62){ Game.hull=Math.min(Game.hullMax,Game.hull+40); Game.engine=Math.min(Game.engineMax,Game.engine+40);
  toast('CRATE · FULL REPAIR'); discover('crates','REPAIR CACHE'); }
 else if(roll<0.72){ SAVE.resources.cores+=rndi(1,3); toast('CRATE · +ENERGY CORES'); discover('crates','CORE CACHE'); }
 else if(roll<0.82){ SAVE.resources.blueprints+=rndi(1,2); toast('CRATE · +BLUEPRINT'); discover('crates','BLUEPRINT CACHE'); }
 else if(roll<0.90){ Game.mult=Math.min(5,Game.mult+1); Game.maxMult=Math.max(Game.maxMult,Game.mult);
  toast('CRATE · MULTIPLIER x'+Game.mult); discover('crates','MULTIPLIER CACHE'); }
 else { SAVE.resources.relics+=1; toast('CRATE · ★ RELIC ★'); discover('crates','RELIC CACHE'); addXP(800); }
 persist();
}
function screenX(p){ tmpV2.copy(p).project(camera); return (tmpV2.x*0.5+0.5)*window.innerWidth; }
function screenY(p){ tmpV2.copy(p).project(camera); return (-tmpV2.y*0.5+0.5)*window.innerHeight; }

