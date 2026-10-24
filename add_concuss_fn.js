const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
if(c.indexOf('triggerConcussion')===-1){
  const methods = `\n    triggerConcussion(duration){\n        this.isConcussed = true;\n        this.concussionTimer = duration || 4.5;\n        if(window.KeralaWorld){\n            const ov=document.getElementById('screen-overlay');\n            if(ov){ ov.style.background='radial-gradient(circle, rgba(100,100,100,0.5) 0%, rgba(0,0,0,0.98) 100%)'; setTimeout(()=>{ov.style.background='';}, (duration||4.5)*900); }\n        }\n    }\n`;
  const idx=c.lastIndexOf('}');
  c = c.substring(0,idx) + methods + '\n}' + c.substring(idx+1);
  fs.writeFileSync(p,c);
  console.log('added');
}else console.log('exists');
