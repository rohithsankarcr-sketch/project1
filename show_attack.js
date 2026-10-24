const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/ai/yakshiAI.js';
let c=fs.readFileSync(p,'utf8');
const idx=c.indexOf('_triggerAttack');
if(idx>-1) console.log(c.substring(idx, idx+250));
else console.log('no');
