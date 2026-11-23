/* ========== POOLS ========== */
const pool={asteroids:[],collectibles:[]};
function initPools(){
 for(let i=0;i<qualityProfile.asteroidCount;i++){ const a=new Asteroid(); scene.add(a.mesh); pool.asteroids.push(a); }
 for(let i=0;i<qualityProfile.collectibleCount;i++){ const c=new Collectible(); pool.collectibles.push(c); }
 for(let i=0;i<28;i++){ const b=new Bullet(); bulletPool.push(b); }
 for(let i=0;i<10;i++){ const e=new Enemy(); enemyPool.push(e); }
}
function freeAsteroid(){ return pool.asteroids.find(a=>!a.active); }
function freeCollectible(){ return pool.collectibles.find(c=>!c.active); }

