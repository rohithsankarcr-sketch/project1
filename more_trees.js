const fs=require('fs');
const p='C:/Users/LOQ/Desktop/bhooo/PlayablePrototype/js/engine/world.js';
let c=fs.readFileSync(p,'utf8');
const old = "        // Palm trunks and bamboo clumps along both sides";
const neu = "        // Palm trunks and bamboo clumps along both sides - more dense\n        const extraPalms=[[-14,0,-28],[16,0,-46],[-18,0,-64],[14,0,-88],[-16,0,-118],[18,0,-142],[-20,0,-168],[16,0,-188],[12,0,-76],[ -12,0,-134]];\n        extraPalms.forEach(([px,py,pz])=>{const h=9+Math.random()*7; const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.36,h,8), trunkMat); trunk.position.set(px,py+h/2,pz); trunk.rotation.z=(Math.random()-0.5)*0.22; trunk.castShadow=true; this.scene.add(trunk); const crown=new THREE.Group(); crown.position.set(px,py+h,pz); for(let f=0;f<12;f++){const ang=(f/12)*Math.PI*2; const frond=new THREE.Mesh(new THREE.BoxGeometry(0.36,0.06,5.0), palmLeafMat); frond.position.set(Math.sin(ang)*2.2,-0.8,Math.cos(ang)*2.2); frond.rotation.y=ang; frond.rotation.x=0.42; crown.add(frond);} this.scene.add(crown);});\n";
if(c.indexOf('extraPalms')===-1){ c=c.replace(old, neu+old); fs.writeFileSync(p,c); console.log('ok'); } else console.log('exists');
