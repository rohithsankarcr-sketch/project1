const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
if(c.indexOf('WeatherSystem')===-1){
  c=c.replace('        window.KeralaWorld.updateRain(delta);','        window.KeralaWorld.updateRain(delta);\n        if (window.WeatherSystem) window.WeatherSystem.update(delta);');
  fs.writeFileSync(p,c);
  console.log('ok');
}
