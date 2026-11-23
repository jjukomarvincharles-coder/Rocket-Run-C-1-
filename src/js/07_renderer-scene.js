/* ========== RENDERER / SCENE ========== */
const canvasEl=document.getElementById('game');
const renderer=new THREE.WebGLRenderer({canvas:canvasEl,antialias:true,powerPreference:'high-performance',stencil:false});
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.18;
renderer.setClearColor(0x000208,1);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(62,1,0.1,9000);
camera.position.set(0,2.3,7.6);

buildTextures();

const skyMat=new THREE.MeshBasicMaterial({side:THREE.BackSide,depthWrite:false,fog:false});
skyMat.map=tex(makeSpaceTexture(REGIONS[0].nebA,REGIONS[0].nebB));
const sky=new THREE.Mesh(new THREE.SphereGeometry(4200,40,24),skyMat);
sky.renderOrder=-1000; scene.add(sky);

let envRT=null;
function rebuildEnvMap(){ try{
 const pmrem=new THREE.PMREMGenerator(renderer); pmrem.compileEquirectangularShader();
 const envTex=new THREE.CanvasTexture(skyMat.map.image);
 envTex.mapping=THREE.EquirectangularReflectionMapping; envTex.colorSpace=THREE.SRGBColorSpace;
 if(envRT) envRT.dispose(); envRT=pmrem.fromEquirectangular(envTex);
 scene.environment=envRT.texture; envTex.dispose(); pmrem.dispose();
 }catch(e){} }

const hemi=new THREE.HemisphereLight(0x6fb6ff,0x140a2a,0.62); scene.add(hemi);
const keyLight=new THREE.DirectionalLight(0xcdeeff,1.55); keyLight.position.set(-6,8,4); scene.add(keyLight);
const rimLight=new THREE.DirectionalLight(0xa96bff,0.95); rimLight.position.set(7,-4,-6); scene.add(rimLight);
const engineLight=new THREE.PointLight(0xff8a2b,3.6,24,2); engineLight.position.set(0,0,1.6); scene.add(engineLight);

