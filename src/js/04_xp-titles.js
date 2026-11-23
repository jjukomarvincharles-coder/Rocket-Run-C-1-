/* ========== XP/TITLES ========== */
function xpForLevel(l){ return Math.round(900*Math.pow(1.28,l-1)); }
function xpToNext(){ return xpForLevel(SAVE.level); }
function addXP(a){ SAVE.xp+=Math.round(a); let lv=false;
 while(SAVE.xp>=xpToNext()){ SAVE.xp-=xpToNext(); SAVE.level++; lv=true; }
 if(lv){ Sound.superGas(); toast('LEVEL '+SAVE.level+' · '+getTitle()); } persist(); }
const TITLES=[[1,'ROOKIE PILOT'],[3,'ASTEROID DODGER'],[6,'FUEL RUNNER'],[10,'VOID SURVIVOR'],[15,'BLACK HOLE ESCAPEE'],[20,'GALAXY EXPLORER'],[28,'MASTER PILOT'],[40,'EDGE SEEKER'],[60,'BEYOND THE EDGE']];
function getTitle(){ let t=TITLES[0][1]; for(const [l,n] of TITLES){ if(SAVE.level>=l) t=n; } return t; }

