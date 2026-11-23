/* ========== REGION / EXPEDITION ========== */
function applyRegion(index,secretKey){
 Sound.setRegion(secretKey?7:index);
 let r;
 if(secretKey&&SECRET_REGIONS[secretKey]) r=SECRET_REGIONS[secretKey];
 else r=regionById(index);
 // Dispose old sky texture to prevent memory leak
 if(skyMat.map) skyMat.map.dispose();
 skyMat.map=tex(makeSpaceTexture(r.nebA,r.nebB));
 skyMat.needsUpdate=true;
 rebuildEnvMap();
 hemi.color.setHex(r.accent); hemi.intensity=0.5; rimLight.color.setHex(r.accent);
 showAmbRight(secretKey ? '★ SECRET SECTOR ★' : ('SECTOR '+(index+1)+' - '+r.name), r.desc);
 if(secretKey){ discover('regions',r.name,{bonus:800}); SAVE.discoveredSecrets[secretKey]=1; }
 else { discover('regions',r.name,{bonus:250}); }
 SAVE.stats.sectorsVisited[r.name]=1;
 if(index>SAVE.highestRegion&&!secretKey) SAVE.highestRegion=index;
 persist();
}
/* FIX: generateExpedition now prevents duplicate regions and always ends with a single Edge */
function generateExpedition(){
 const legs=[{region:0,type:'safe'}];
 const seen=new Set([0]);
 let cur=0;
 const target=REGIONS.length-1;
 const len=rndi(4,6);
 for(let i=0;i<len;i++){
  const step=rndi(1,2);
  let next=cur+step;
  // Skip over already-scheduled regions
  while(seen.has(next) && next < target-1) next++;
  if(next >= target) break;  // Don't reach the Edge inside the loop
  cur=next;
  seen.add(cur);
  const type=pick(['safe','danger','danger','unknown','risk']);
  legs.push({region:cur,type});
 }
 // Always finish with a single, unique Edge leg
 legs.push({region:target,type:'edge'});
 return legs;
}

