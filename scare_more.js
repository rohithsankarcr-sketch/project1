const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/ai/yakshiAI.js';
let c=fs.readFileSync(p,'utf8');
c=c.replace('this.huntSpeed = 8.2;', 'this.huntSpeed = 9.4;');
c=c.replace('this.stalkSpeed = 3.8;', 'this.stalkSpeed = 4.6;');
c=c.replace('this.randomSpawnInterval = 12 + Math.random() * 14;', 'this.randomSpawnInterval = 8 + Math.random() * 10;');
c=c.replace('this.jumpScareCooldown = 14.0;', 'this.jumpScareCooldown = 9.0;');
fs.writeFileSync(p,c);
console.log('ok');
