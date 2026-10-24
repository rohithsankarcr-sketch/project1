const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/ai/yakshiAI.js';
let c=fs.readFileSync(p,'utf8');
// simpler replacement
const start = c.indexOf("        // HUNTING");
const end = c.indexOf("        // SEARCHING");
if(start > -1 && end > start) {
  const neu = `        // HUNTING\n        if (this.state === 'Hunting') {\n            if (typeof this.pursuitTimer === 'undefined') this.pursuitTimer = 0;\n            this.pursuitTimer += delta;\n            if (isPlayerHiding || this.pursuitTimer > this.maxPursuitTime || distToPlayer > 32.0) {\n                this.state = 'Searching';\n                this.searchTimer = 0.0;\n                this.pursuitTimer = 0;\n                return;\n            }\n            const dir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();\n            dir.y = 0;\n            this.position.addScaledVector(dir, this.huntSpeed * delta);\n            this.mesh.position.x = this.position.x;\n            this.mesh.position.z = this.position.z;\n            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);\n            this._setOpacity(this._scaredAlpha);\n            if (this._auraLight) this._auraLight.intensity = 1.8;\n            if (distToPlayer < 2.0) {\n                if (window.GameplayApp && typeof window.GameplayApp.takeDamage === 'function') {\n                    window.GameplayApp.takeDamage(20);\n                }\n                this.state = 'Searching';\n                this.searchTimer = 0.0;\n                this.pursuitTimer = 0;\n                return;\n            }\n            if (!this.hasLineOfSight && distToPlayer > 15.0) {\n                this.state = 'Searching';\n                this.searchTimer = 0.0;\n                this.lastKnownPlayerPos.copy(playerPos);\n                this.pursuitTimer = 0;\n            }\n            return;\n        }\n\n`;
  c = c.substring(0,start) + neu + c.substring(end);
  fs.writeFileSync(p,c);
  console.log('ok');
} else console.log('no');
