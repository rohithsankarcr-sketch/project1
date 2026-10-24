const fs = require('fs');
const files = [
  'PlayablePrototype/js/ai/yakshiAI.js',
  'PlayablePrototype/js/ai/yakshiAI_advanced.js',
  'PlayablePrototype/js/main.js',
  'PlayablePrototype/js/systems/weatherSystem.js',
  'PlayablePrototype/js/systems/evidenceBoard.js',
  'PlayablePrototype/js/systems/endings.js',
  'PlayablePrototype/index.html'
];
files.forEach(f=>{ if(fs.existsSync(f)) console.log('OK', f); else console.log('MISS', f); });
console.log('done');
