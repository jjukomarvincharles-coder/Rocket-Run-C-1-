/* ========== STORY LOGS / TRANSMISSIONS ========== */
const STORY_LOGS=[
 {id:'LOG01',text:'"We thought the signal was coming from the planet."',region:0},
 {id:'LOG02',text:'"It wasn\'t the planet."',region:1},
 {id:'LOG03',text:'"The sound is inside our heads now. All of us hear it."',region:2},
 {id:'LOG04',text:'"Someone on the crew started drawing circles. He wouldn\'t stop."',region:3},
 {id:'LOG05',text:'"We found a wreck that wasn\'t ours. The logs were written in our language."',region:3},
 {id:'LOG06',text:'"It said: If you are reading this, turn back. Please. Turn back."',region:4},
 {id:'LOG07',text:'"We saw it. A creature larger than a moon, swimming through the nebula."',region:5},
 {id:'LOG08',text:'"It didn\'t attack us. It just... looked."',region:5},
 {id:'LOG09',text:'"Something is transmitting from inside the black hole."',region:7},
 {id:'LOG10',text:'"The station was empty. The coffee was still warm."',region:3},
 {id:'LOG11',text:'"We are the seventh expedition. The previous six are still here. Watching."',region:8},
 {id:'LOG12',text:'"The Edge isn\'t the end. It\'s a door."',region:10},
 {id:'LOG13',text:'"Do not enter Sector 14. Nothing that enters comes back the same."',region:6},
 {id:'LOG14',text:'"We\'ve been here before. I know because I remember dying."',region:9},
 {id:'LOG15',text:'"The universe is not empty. It is full of things we cannot name."',region:10}
];
const TRANSMISSIONS=[
 {id:'T1',text:'"...if you\'re receiving this... don\'t enter Sector 14."',hiddenSector:'sector14'},
 {id:'T2',text:'"The signal is coming from the black hole."',hiddenSector:null},
 {id:'T3',text:'"...coordinates mark a station abandoned 30 years ago. Still warm."',hiddenSector:null},
 {id:'T4',text:'"We are not the first. We will not be the last."',hiddenSector:null},
 {id:'T5',text:'"There is something behind the Edge. Something that watches."',hiddenSector:'beyondedge'},
 {id:'T6',text:'"Follow the hollow star. You will find us there."',hiddenSector:'thehollow'},
 {id:'T7',text:'"Do not trust the pale ships. They are not ships."',hiddenSector:null},
 {id:'T8',text:'"...seventh expedition, all hands lost. The other six are still..."',hiddenSector:null},
 {id:'T9',text:'"If you can hear the hum, you are already too close."',hiddenSector:'sector14'},
 {id:'T10',text:'"We made it to the Edge. We are not coming back."',hiddenSector:null}
];

