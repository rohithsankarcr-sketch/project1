const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
c=c.replace('requestAnimationFrame((time) => this.gameLoop(time));','requestAnimationFrame(() => this.gameLoop());');
c=c.replace('this.yaw -= e.movementX * this.mouseSensitivity;','this.yaw -= e.movementX * (this.mouseSensitivity * 1.0);');
fs.writeFileSync(p,c);
console.log('ok');
