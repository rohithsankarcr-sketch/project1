const fs = require('fs');
const p = 'C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/main.js';
let c = fs.readFileSync(p, 'utf8');

// Remove the broken methods from inside DOMContentLoaded
const start = c.indexOf("    updateHealthUI() {");
const end = c.lastIndexOf("    }\n\n});");
if (start > -1 && end > start) {
  c = c.slice(0, start) + "\n});\n";
  fs.writeFileSync(p, c);
  console.log('fixed');
} else {
  console.log('not found');
}
