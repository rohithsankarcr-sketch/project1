const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
if(c.indexOf('isConcussed')===-1){
  c=c.replace("        this._evidenceModalOpen = false;\n    }", "        this._evidenceModalOpen = false;\n        this.isConcussed = false;\n        this.concussionTimer = 0;\n        this.abilities = [];\n        this.destroyableGhostObjects = [];\n    }");
  fs.writeFileSync(p,c);
  console.log('ok');
}else console.log('exists');
