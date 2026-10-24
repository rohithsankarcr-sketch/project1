const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
if(c.indexOf('updateHealthUI')!==-1){
  c=c.replace('this.updateHUDStats();\n        this.updateHealthUI();\n        this.updateLevelUI();\n        if (window.MinimapUI) { try { window.MinimapUI.init(); } catch(e){} }',
    'this.updateHUDStats();\n        setTimeout(()=>{ if(typeof this.updateHealthUI===\'function\') this.updateHealthUI(); if(typeof this.updateLevelUI===\'function\') this.updateLevelUI(); }, 100);\n        if (window.MinimapUI) { try { window.MinimapUI.init(); } catch(e){} }');
  fs.writeFileSync(p,c);
  console.log('ok');
}
