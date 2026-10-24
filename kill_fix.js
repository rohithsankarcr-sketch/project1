const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/ai/yakshiAI.js';
let c=fs.readFileSync(p,'utf8');
c=c.replace("if (distToPlayer < 2.8) {\n                if (window.GameplayApp && typeof window.GameplayApp.takeDamage === 'function') {\n                    window.GameplayApp.takeDamage(35);\n                }\n                this.state = 'Searching';\n                this.searchTimer = 0.0;\n                this.pursuitTimer = 0;\n                return;\n            }",
  "if (distToPlayer < 3.4) {\n                if (window.GameplayApp && typeof window.GameplayApp.takeDamage === 'function') {\n                    window.GameplayApp.takeDamage(45);\n                    if (window.GameplayApp.health <= 0) {\n                        window.GameplayApp.health = 0;\n                        if (typeof window.GameplayApp.updateHealthUI === 'function') window.GameplayApp.updateHealthUI();\n                        window.GameplayApp.onPlayerDied('The entity caught you.');\n                        return;\n                    }\n                }\n                this.state = 'Searching';\n                this.searchTimer = 0.0;\n                this.pursuitTimer = 0;\n                return;\n            }");
fs.writeFileSync(p,c);
console.log('ok');
