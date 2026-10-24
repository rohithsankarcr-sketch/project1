const fs = require('fs');
const p = 'C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/index.html';
let c = fs.readFileSync(p, 'utf8');
c = c.replace('CLICK TO ENTER THE PALA ROAD', 'CLICK TO START TUTORIAL');
c = c.replace("Southern Kerala, 1994. A stormy monsoon night on the abandoned Pala Road.<br>\n            You carry the prototype <strong>AYAS Anomaly Detector</strong>. The villagers have been disappearing.<br>\n            There are voices in the rain. There is a woman near the ancient tree.<br>\n            <em style=\"color: rgba(255,100,100,0.7); font-size:13px;\">She is real. She is watching. She is already here.</em>",
  "Southern Kerala, 1994. A stormy monsoon night on the abandoned Pala Road.<br>\n            You carry the prototype <strong>AYAS Anomaly Detector</strong>.<br><br>\n            <strong style=\"color:#00f0ff\">TUTORIAL + 5 LEVELS</strong> - Difficulty increases each level.<br>\n            <strong style=\"color:#d4a034\">REAL ENTITIES</strong> - Referenced from horror films, games &amp; series.<br>\n            <em style=\"color: rgba(255,50,50,0.9); font-size:13px;\">They hunt. They attack. Survive or die.</em>");
fs.writeFileSync(p, c);
console.log('ok');
