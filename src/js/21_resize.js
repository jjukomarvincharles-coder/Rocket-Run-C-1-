/* ========== RESIZE ========== */
function onResize(){
 const w=window.innerWidth,h=window.innerHeight;
 camera.aspect=w/h; camera.fov=h>w?62*1.06:62; camera.updateProjectionMatrix();
 renderer.setSize(w,h,false);
 if(composer) composer.setSize(w,h);
 if(bloomPass) bloomPass.setSize(w*0.5,h*0.5);
}
window.addEventListener('resize',onResize);
window.addEventListener('orientationchange',()=>setTimeout(onResize,250));

