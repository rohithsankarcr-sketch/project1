const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
c=c.replace('        this.updateHUDStats();\n\n        // Game Loop\n        requestAnimationFrame(() => this.gameLoop());',
  '        this.updateHUDStats();\n        this.updateHealthUI();\n        this.updateLevelUI();\n        if (window.MinimapUI) { try { window.MinimapUI.init(); } catch(e){} }\n\n        // Game Loop\n        requestAnimationFrame(() => this.gameLoop());');
fs.writeFileSync(p,c);
console.log('ok');
