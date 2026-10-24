const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/ai/yakshiAI.js';
let c=fs.readFileSync(p,'utf8');
c=c.replace('if (spawnType < 0.35)', 'if (spawnType < 0.48)');
c=c.replace('else if (spawnType < 0.65)', 'else if (spawnType < 0.78)');
c=c.replace('this._fadeIn(2.5)', 'this._fadeIn(1.9)');
c=c.replace('this._fadeIn(3.0)', 'this._fadeIn(1.6)');
fs.writeFileSync(p,c);
console.log('ok');
