const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c=fs.readFileSync(p,'utf8');
const old = "        const delta = Math.min(this.clock.getDelta(), 0.1);\n\n        if (!this.isRunning || this.isPaused || this.isDead || this.hasWon) return;\n\n        this.handleMovement(delta);";
const neu = "        const delta = Math.min(this.clock.getDelta(), 0.1);\n\n        if (!this.isRunning || this.isPaused || this.isDead || this.hasWon) return;\n        if (this.isConcussed) { this.concussionTimer -= delta; if (this.concussionTimer <= 0) { this.isConcussed = false; } this.mouseSensitivity = 0.0009; } else { if (this.mouseSensitivity < 0.002) this.mouseSensitivity = 0.0022; }\n\n        this.handleMovement(delta);";
if(c.indexOf(old)!==-1){ c=c.split(old).join(neu); fs.writeFileSync(p,c); console.log('ok'); } else console.log('no');
