/**
 * AYAS: THE LAST WARD - Advanced Yakshi AI Enhancements
 * Adaptive behavior, sound investigation, voice mimicry, fake sightings
 */
class YakshiAdvanced {
    constructor(yakshi) {
        this.yakshi = yakshi;
        this.adaptive = {
            sprintCount: 0, hideCount: 0, flashlightCount: 0,
            weight: 1.0
        };
        this.soundLog = [];
        this.fakeSightings = [];
        this.mimicCooldown = 0;
        this.sightingCooldown = 0;
    }
    recordBehavior(type) {
        if (type === 'sprint') this.adaptive.sprintCount++;
        if (type === 'hide') this.adaptive.hideCount++;
        if (type === 'flashlight') this.adaptive.flashlightCount++;
        this.adaptive.weight = Math.min(1.8, 1.0 + (this.adaptive.sprintCount + this.adaptive.hideCount + this.adaptive.flashlightCount) * 0.01);
    }
    investigateSound(pos, loudness) {
        if (!this.yakshi || this.yakshi.state === 'Dormant') return;
        this.yakshi.lastKnownPlayerPos.copy(pos);
        if (this.yakshi.state === 'Stalking' || this.yakshi.state === 'Luring') {
            this.yakshi.state = 'Investigating';
        }
    }
    doVoiceMimic() {
        if (this.mimicCooldown > 0) return false;
        this.mimicCooldown = 25 + Math.random() * 20;
        const phrases = ["Amme...", "Kannu theriyilla...", "Evideya nee?", "Help...me...", "Oru nimisham..."];
        const phrase = phrases[Math.floor(Math.random()*phrases.length)];
        if (window.HorrorAudio) {
            const angle = Math.random()*Math.PI*2;
            window.HorrorAudio.playYakshiWhisper(phrase, (this.yakshi.position.x||0)+Math.cos(angle)*15, (this.yakshi.position.z||0)+Math.sin(angle)*15);
        }
        return true;
    }
    doFakeSighting(scene, playerPos) {
        if (this.sightingCooldown > 0) return;
        this.sightingCooldown = 30 + Math.random() * 40;
        if (!scene) return;
        const geo = new THREE.CylinderGeometry(0.12, 0.45, 1.8, 8);
        const mat = new THREE.MeshBasicMaterial({color:0x111111, transparent:true, opacity:0.4});
        const mesh = new THREE.Mesh(geo, mat);
        const angle = Math.random()*Math.PI*2;
        mesh.position.set(playerPos.x + Math.cos(angle)*12, 0.9, playerPos.z + Math.sin(angle)*12);
        scene.add(mesh);
        setTimeout(()=>{ scene.remove(mesh); geo.dispose(); mat.dispose(); }, 800);
        setTimeout(()=>{ scene.remove(mesh); geo.dispose(); mat.dispose(); }, 1600);
    }
    update(delta) {
        this.mimicCooldown -= delta;
        this.sightingCooldown -= delta;
        if (Math.random() < 0.002 && this.mimicCooldown <= 0) this.doVoiceMimic();
        if (Math.random() < 0.0015 && this.sightingCooldown <= 0 && window.KeralaWorld) this.doFakeSighting(window.KeralaWorld.scene, window.GameplayApp?.playerPos || new THREE.Vector3());
    }
}
window.YakshiAdvanced = null;
document.addEventListener('DOMContentLoaded', ()=>{ if(window.YakshiAI){ window.YakshiAdvanced = new YakshiAdvanced(window.YakshiAI); }});
