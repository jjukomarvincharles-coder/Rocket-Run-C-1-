/* ========== BACKGROUND UPDATE ========== */
function updateBackground(dt,worldSpeed){
 sky.position.copy(camera.position);
 for(let i=planets.length-1;i>=0;i--){ const p=planets[i];
  p.rotation.y+=p.userData.spin*dt;
  p.position.z+=worldSpeed*PLANET_DRIFT*dt;
  if(p.userData.atmo) p.userData.atmo.position.copy(p.position);
  if(p.userData.ring) p.userData.ring.position.copy(p.position);
  if(!p.userData.discovered&&p.position.z>-700&&p.position.z<400){
   p.userData.discovered=true;
   const cat=p.userData.catalog;
   if(discover('planets',cat.name,{bonus:200,type:cat.type})) toast('DISCOVERED · '+cat.name);
  }
  if(p.userData.isFlyby&&Math.abs(p.position.z)<60&&Math.abs(p.position.x)<40) Game.hitShake=Math.max(Game.hitShake,0.12);
  if(p.position.z>p.userData.br+120){ disposePlanet(p); planets.splice(i,1); spawnPlanet(Math.random()<0.28); } }
 for(const g of galaxies){
  g.material.rotation+=g.userData.rotSpeed*dt;
  g.position.z+=worldSpeed*0.004*dt*12;
  if(g.position.z>400){ g.position.z=-rnd(2600,3600); g.position.x=rnd(-1600,1600); g.position.y=rnd(-800,800); } }
}

