const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/ai/yakshiAI.js';
let c=fs.readFileSync(p,'utf8');
c=c.replace('this.huntSpeed = 9.4;', 'this.huntSpeed = 6.5;');
c=c.replace('this.stalkSpeed = 4.6;', 'this.stalkSpeed = 3.0;');
c=c.replace('this.retreatSpeed = 11.2;', 'this.retreatSpeed = 8.5;');
if(c.indexOf('maxPursuitTime')===-1) c=c.replace('this.jumpScareCooldown = 9.0;', 'this.jumpScareCooldown = 9.0;\n        this.maxPursuitTime = 10.0;\n        this.pursuitTimer = 0.0;');
fs.writeFileSync(p,c);
console.log('ok');
