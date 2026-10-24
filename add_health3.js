const fs = require('fs');
const p = 'C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c = fs.readFileSync(p, 'utf8');
if (c.indexOf('updateHealthUI') === -1) {
  const methods = `
    updateHealthUI() {
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        if (healthFill) {
            const pct = Math.max(0, (this.health / this.maxHealth) * 100);
            healthFill.style.width = pct + '%';
        }
        if (healthText) healthText.innerText = Math.max(0, Math.floor(this.health)) + '/' + this.maxHealth;
    }
    updateLevelUI() {
        const levelEl = document.getElementById('level-indicator');
        if (levelEl) {
            if (this.currentLevel === 0) levelEl.innerText = 'TUTORIAL';
            else levelEl.innerText = this.currentLevel + ' / ' + this.maxLevels;
        }
    }
    takeDamage(amount) {
        const now = performance.now() / 1000;
        if (now - this.lastDamageTime < this.invulnTime) return;
        if (this.isDead || this.isHiding) return;
        this.lastDamageTime = now;
        this.health -= amount * this.difficultyMultiplier;
        this.updateHealthUI();
        if (this.health <= 0) {
            this.health = 0;
            this.updateHealthUI();
            this.onPlayerDied('You died to a relentless entity.');
        }
    }
`;
  const idx = c.lastIndexOf('}');
  c = c.substring(0, idx) + methods + '\n}' + c.substring(idx + 1);
  fs.writeFileSync(p, c);
  console.log('added');
} else {
  console.log('exists');
}
