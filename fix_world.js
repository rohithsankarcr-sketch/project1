const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/engine/world.js';
let c=fs.readFileSync(p,'utf8');
c=c.replace('this.ambientLight = new THREE.AmbientLight(0x05080f, 0.28);','this.ambientLight = new THREE.AmbientLight(0x04070d, 0.18);');
c=c.replace('this.moonLight = new THREE.DirectionalLight(0x8eb4cf, 0.38);','this.moonLight = new THREE.DirectionalLight(0x7a9bcf, 0.28);');
c=c.replace('this.playerSpotlight = new THREE.SpotLight(0xfff0d6, 5.5, 42, Math.PI / 6.5, 0.28, 1.4);','this.playerSpotlight = new THREE.SpotLight(0xfff4dc, 6.8, 48, Math.PI / 5.8, 0.22, 1.25);');
fs.writeFileSync(p,c);
console.log('ok');
