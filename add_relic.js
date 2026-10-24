const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
if(c.indexOf('useRelic')===-1){
  const methods = `\n    useRelic(){\n        if(!this.hasRelicWeapon || this.relicCharges <= 0) return;\n        this.relicCharges--;\n        if(document.getElementById('relic-count')) document.getElementById('relic-count').innerText = this.relicCharges;\n        if(window.YakshiAI){ window.YakshiAI.disrupt(this.playerPos); if(window.YakshiAI.state === 'Hunting') window.YakshiAI.state = 'Searching'; }\n        if(window.HorrorAudio) window.HorrorAudio.playWardRepairedSound();\n    }\n    gainRelic(){\n        this.hasRelicWeapon = true;\n        this.relicCharges += 3;\n        const ind=document.getElementById('relic-indicator');\n        if(ind){ ind.style.display='flex'; document.getElementById('relic-count').innerText = this.relicCharges; }\n    }\n`;
  const idx=c.lastIndexOf('}');
  c = c.substring(0,idx) + methods + '\n}' + c.substring(idx+1);
  fs.writeFileSync(p,c);
  console.log('added');
}else console.log('exists');
