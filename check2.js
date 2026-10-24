const fs = require('fs');
const files=['PlayablePrototype/js/ai/yakshiAI.js','PlayablePrototype/js/ai/yakshiAI_advanced.js','PlayablePrototype/js/main.js','PlayablePrototype/js/systems/weatherSystem.js','PlayablePrototype/js/systems/evidenceBoard.js','PlayablePrototype/js/systems/endings.js','PlayablePrototype/js/systems/levelManager.js'];
let ok=0,err=0;
files.forEach(f=>{
  try{ new Function(fs.readFileSync(f,'utf8')); console.log('OK',f); ok++; }
  catch(e){ console.log('ERR',f,e.message); err++; }
});
console.log('done',ok,err);
