const noop=()=>{};
export class Vector2{constructor(x=0,y=0){this.x=x;this.y=y;} set(x,y){this.x=x;this.y=y;return this;} copy(v){this.x=v.x;this.y=v.y;return this;} clone(){return new Vector2(this.x,this.y);}}
export class Vector3{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z;}
 set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} setScalar(s){this.x=this.y=this.z=s;return this;}
 copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;} clone(){return new Vector3(this.x,this.y,this.z);}
 add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this;} sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this;}
 addScaledVector(v,s){this.x+=v.x*s;this.y+=v.y*s;this.z+=v.z*s;return this;} multiplyScalar(s){this.x*=s;this.y*=s;this.z*=s;return this;}
 length(){return Math.hypot(this.x,this.y,this.z);} lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z;}
 normalize(){const l=this.length()||1;return this.multiplyScalar(1/l);} distanceTo(v){return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z);}
 lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this;} dot(v){return this.x*v.x+this.y*v.y+this.z*v.z;}
 subVectors(a,b){this.x=a.x-b.x;this.y=a.y-b.y;this.z=a.z-b.z;return this;} project(){return this;} applyQuaternion(){return this;}
 divideScalar(s){return this.multiplyScalar(1/s);} fromBufferAttribute(a,i){this.x=a.getX(i);this.y=a.getY(i);this.z=a.getZ(i);return this;} applyMatrix4(){return this;} setFromMatrixPosition(){return this;}}
export class Color{constructor(c=0xffffff){this.set(c);}
 set(c){ if(c&&typeof c==='object'){this.r=c.r;this.g=c.g;this.b=c.b;} else if(typeof c==='string'){this.r=this.g=this.b=1;} else {this.r=((c>>16)&255)/255;this.g=((c>>8)&255)/255;this.b=(c&255)/255;} return this;}
 setRGB(r,g,b){this.r=r;this.g=g;this.b=b;return this;} setHSL(){return this;} copy(c){return this.set(c);} clone(){return new Color(this);}
 multiplyScalar(s){this.r*=s;this.g*=s;this.b*=s;return this;} lerp(c,t){this.r+=(c.r-this.r)*t;this.g+=(c.g-this.g)*t;this.b+=(c.b-this.b)*t;return this;} offsetHSL(){return this;} setHex(h){return this.set(h);} setScalar(s){this.r=this.g=this.b=s;return this;} add(c){this.r+=c.r;this.g+=c.g;this.b+=c.b;return this;} equals(){return false;} getHSL(t){t=t||{};t.h=0;t.s=0;t.l=0.5;return t;} getHex(){return 0;} getHexString(){return 'ffffff';}}
class Euler{constructor(){this.x=0;this.y=0;this.z=0;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} copy(e){this.x=e.x;this.y=e.y;this.z=e.z;return this;}}
class Quat{constructor(){this.x=0;this.y=0;this.z=0;this.w=1;} setFromAxisAngle(){return this;} copy(){return this;} multiply(){return this;} identity(){return this;} setFromEuler(){return this;}}
export class Object3D{constructor(){this.position=new Vector3();this.rotation=new Euler();this.scale=new Vector3(1,1,1);this.quaternion=new Quat();this.children=[];this.parent=null;this.visible=true;this.userData={};this.name='';this.renderOrder=0;this.frustumCulled=true;this.layers={set(){},enable(){}};}
 add(...o){for(const x of o){ if(x.parent&&x.parent.remove) x.parent.remove(x); x.parent=this;this.children.push(x);}return this;}
 remove(...o){for(const x of o){const i=this.children.indexOf(x);if(i>=0){this.children.splice(i,1);x.parent=null;}}return this;}
 traverse(f){f(this);for(const c of this.children) c.traverse&&c.traverse(f);} getObjectByName(n){let r=null;this.traverse(o=>{if(o.name===n)r=o;});return r;}
 lookAt(){} updateMatrixWorld(){} updateMatrix(){} clone(){return new this.constructor();} getWorldPosition(v){return (v||new Vector3()).copy(this.position);}}
export class Group extends Object3D{}
export class Scene extends Object3D{constructor(){super();this.fog=null;this.background=null;this.environment=null;}}
export class PerspectiveCamera extends Object3D{constructor(fov=50,aspect=1){super();this.fov=fov;this.aspect=aspect;this.near=0.1;this.far=9000;} updateProjectionMatrix(){}}
export class BufferAttribute{constructor(a,n){this.array=a;this.itemSize=n;this.count=a.length/n;this.needsUpdate=false;}
 setUsage(){return this;} getX(i){return this.array[i*this.itemSize];} getY(i){return this.array[i*this.itemSize+1];} getZ(i){return this.array[i*this.itemSize+2];}
 setXYZ(i,x,y,z){const o=i*this.itemSize;this.array[o]=x;this.array[o+1]=y;this.array[o+2]=z;} setX(i,v){this.array[i*this.itemSize]=v;} setY(i,v){this.array[i*this.itemSize+1]=v;} setZ(i,v){this.array[i*this.itemSize+2]=v;}}
export class BufferGeometry{constructor(){this.attributes={};this.index=null;this.parameters={};}
 setAttribute(k,v){this.attributes[k]=v;return this;} getAttribute(k){return this.attributes[k];} setDrawRange(){} dispose(){} computeVertexNormals(){} computeBoundingSphere(){} setIndex(){} rotateX(){return this;} translate(){return this;} scale(){return this;}
 clone(){return new this.constructor();}}
const geo=n=>class extends BufferGeometry{constructor(...a){super();this.parameters=a;this.attributes.position=new BufferAttribute(new Float32Array(3*120),3);this.attributes.normal=new BufferAttribute(new Float32Array(3*120),3);}};
export const BoxGeometry=geo(),CircleGeometry=geo(),ConeGeometry=geo(),CylinderGeometry=geo(),EdgesGeometry=geo(),IcosahedronGeometry=geo(),OctahedronGeometry=geo(),RingGeometry=geo(),SphereGeometry=geo(),TorusGeometry=geo();
class Mat{constructor(p={}){Object.assign(this,p);this.color=(p.color&&p.color.r!==undefined)?p.color:new Color(p.color===undefined?0xffffff:p.color);this.opacity=p.opacity===undefined?1:p.opacity;this.emissive=new Color(p.emissive||0);this.needsUpdate=false;}
 dispose(){} clone(){return new this.constructor(this);} }
export const MeshBasicMaterial=class extends Mat{},MeshStandardMaterial=class extends Mat{},LineBasicMaterial=class extends Mat{},PointsMaterial=class extends Mat{},SpriteMaterial=class extends Mat{},ShaderMaterial=class extends Mat{};
export class Mesh extends Object3D{constructor(g,m){super();this.geometry=g;this.material=m;}}
export class Sprite extends Object3D{constructor(m){super();this.material=m;}}
export class Points extends Object3D{constructor(g,m){super();this.geometry=g;this.material=m;}}
export class LineSegments extends Object3D{constructor(g,m){super();this.geometry=g;this.material=m;}}
class Light extends Object3D{constructor(c=0xffffff,i=1){super();this.color=new Color(c);this.intensity=i;}}
export const DirectionalLight=class extends Light{},HemisphereLight=class extends Light{},PointLight=class extends Light{};
export class CanvasTexture{constructor(c){this.image=c;this.repeat=new Vector2(1,1);this.offset=new Vector2();this.needsUpdate=false;} dispose(){}}
export class PMREMGenerator{constructor(){} fromScene(){return {texture:{}};} fromEquirectangular(){return {texture:{}};} compileEquirectangularShader(){} dispose(){}}
export class WebGLRenderer{constructor(o={}){this.domElement=o.canvas||document.createElement('canvas');this.info={render:{calls:0,triangles:0},memory:{textures:0},reset(){},autoReset:true};this.shadowMap={};this.capabilities={getMaxAnisotropy(){return 4;}};this._pr=1;}
 setPixelRatio(r){this._pr=r;} getPixelRatio(){return this._pr;} setSize(w,h){this.domElement.width=w;this.domElement.height=h;} setClearColor(){} render(){window.__frames=(window.__frames||0)+1;} dispose(){} compile(){} getDrawingBufferSize(v){return (v||new Vector2()).set(this.domElement.width,this.domElement.height);}}
export const ACESFilmicToneMapping=4,AdditiveBlending=2,NormalBlending=1,BackSide=1,FrontSide=0,DoubleSide=2,DynamicDrawUsage=35048,EquirectangularReflectionMapping=303,RepeatWrapping=1000,SRGBColorSpace='srgb';
export class OrthographicCamera extends Object3D{constructor(){super();}}
export const PlaneGeometry=geo();
