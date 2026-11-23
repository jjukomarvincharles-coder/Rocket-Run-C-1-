/* ========== REGIONS ========== */
const REGIONS=[
 {id:0,name:'EARTH ORBIT',short:'EARTH',danger:1,reward:1.0,density:0.52,gasRate:1.25,coinRate:1.05,speedMul:0.9,accent:0x4da8ff,nebA:0x0a1e44,nebB:0x2a6ad8,desc:'Home space. Calm and familiar — no hostiles here.'},
 {id:1,name:'LUNAR SECTOR',short:'LUNA',danger:1,reward:1.1,density:0.92,gasRate:1.05,coinRate:1.05,speedMul:1.00,accent:0xaab8d0,nebA:0x14161e,nebB:0x5a6480,desc:'Pale dust and old wreckage.'},
 {id:2,name:'MARS CORRIDOR',short:'MARS',danger:2,reward:1.3,density:1.10,gasRate:0.95,coinRate:1.10,speedMul:1.02,accent:0xff8a4a,nebA:0x3a1408,nebB:0xb84a20,desc:'Rust-red canyons of debris.'},
 {id:3,name:'ASTEROID BELT',short:'BELT',danger:3,reward:1.7,density:1.90,gasRate:0.95,coinRate:1.20,speedMul:1.05,accent:0xd8a45a,nebA:0x1e1a12,nebB:0x7a5c34,desc:'Huge asteroid density.'},
 {id:4,name:'NEBULA FRONTIER',short:'NEBULA',danger:3,reward:1.8,density:1.22,gasRate:1.75,coinRate:1.10,speedMul:1.02,accent:0xc07aff,nebA:0x2a0a54,nebB:0x8a3ad8,desc:'Gas-rich purple clouds.'},
 {id:5,name:'ALIEN SPACE',short:'ALIEN',danger:4,reward:2.1,density:1.35,gasRate:1.00,coinRate:1.50,speedMul:1.06,accent:0x4dffb0,nebA:0x04302a,nebB:0x1aa888,desc:'Someone else lives here.'},
 {id:6,name:'VOID SECTOR',short:'VOID',danger:5,reward:2.5,density:1.60,gasRate:0.90,coinRate:1.60,speedMul:1.10,accent:0x8a4aff,nebA:0x04020a,nebB:0x1e1236,desc:'Almost nothing. Almost.'},
 {id:7,name:'BLACK HOLE REGION',short:'SINGULAR',danger:6,reward:3.1,density:2.20,gasRate:1.30,coinRate:1.70,speedMul:1.12,accent:0xff4ad8,nebA:0x0e0218,nebB:0x4a0e6a,desc:'Gravity is not your friend.'},
 {id:8,name:'ANCIENT SPACE',short:'ANCIENT',danger:6,reward:3.2,density:1.70,gasRate:1.10,coinRate:1.90,speedMul:1.08,accent:0xffd45a,nebA:0x1a1408,nebB:0x6a5220,desc:'Ruins of something vast.'},
 {id:9,name:'THE UNKNOWN',short:'UNKNOWN',danger:7,reward:3.6,density:2.00,gasRate:1.00,coinRate:2.00,speedMul:1.15,accent:0x9a9aff,nebA:0x05051a,nebB:0x2a2ab0,desc:'No data. No map. No return.'},
 {id:10,name:'EDGE OF THE UNIVERSE',short:'THE EDGE',danger:8,reward:4.2,density:2.45,gasRate:1.40,coinRate:2.20,speedMul:1.20,accent:0xffffff,nebA:0x1a0a2a,nebB:0xff4aff,desc:'The end of everything.'}
];
const SECRET_REGIONS={
 'sector14':{name:'SECTOR 14',short:'S14',danger:9,reward:5.0,density:2.6,gasRate:1.6,coinRate:2.5,speedMul:1.22,accent:0xff4a4a,nebA:0x2a0208,nebB:0xff2030,desc:'The message warned about this place.'},
 'thehollow':{name:'THE HOLLOW',short:'HOLW',danger:9,reward:5.5,density:2.7,gasRate:1.5,coinRate:2.6,speedMul:1.25,accent:0x7ef2ff,nebA:0x021a2a,nebB:0x39e9ff,desc:'A sphere of stars with nothing inside.'},
 'beyondedge':{name:'BEYOND THE EDGE',short:'BEYND',danger:10,reward:6.0,density:2.9,gasRate:1.8,coinRate:3.0,speedMul:1.3,accent:0xffffff,nebA:0x2a0a3a,nebB:0xffffff,desc:'There was something past the end.'}
};
const regionById=id=>REGIONS[clamp(id,0,REGIONS.length-1)];

