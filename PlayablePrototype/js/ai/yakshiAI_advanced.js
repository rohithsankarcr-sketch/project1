/**
 * AYAS: THE LAST WARD - Advanced Yakshi AI Enhancements v2.0
 * Adaptive behavior tracking, sound investigation, voice mimicry whispers,
 * spectral silhouette fake sightings, and environmental stalking tactics.
 */

class YakshiAdvanced {
    constructor(yakshi) {
        this.yakshi = yakshi;
        this.adaptive = {
            sprintCount: 0,
            hideCount: 0,
            flashlightCount: 0,
            aggression: 1.0
        };
        this.mimicCooldown = 15.0;
        this.sightingCooldown = 20.0;
        this.activePhantom = null;
    }

    recordBehavior(type) {
        if (type === 'sprint') {
            this.adaptive.sprintCount++;
            if (this.yakshi && this.yakshi.state === 'Searching') {
                this.yakshi.huntSpeed = Math.min(14.0, 11.5 + this.adaptive.sprintCount * 0.08);
            }
        }
        if (type === 'hide') {
            this.adaptive.hideCount++;
        }
        if (type === 'flashlight') {
            this.adaptive.flashlightCount++;
            // Entity notices flashlight toggling and tends to flank
            if (this.yakshi && Math.random() < 0.25 && this.yakshi.state === 'Stalking') {
                this.yakshi.state = 'Searching';
            }
        }
        this.adaptive.aggression = Math.min(1.8, 1.0 + (this.adaptive.sprintCount * 0.02 + this.adaptive.flashlightCount * 0.015));
    }

    investigateSound(pos, loudness = 15) {
        if (!this.yakshi || this.yakshi.state === 'Dormant') return;
        const dist = this.yakshi.position.distanceTo(pos);
        if (dist < loudness * 2.2) {
            this.yakshi.lastKnownPlayerPos.copy(pos);
            if (this.yakshi.state === 'Stalking' || this.yakshi.state === 'Luring') {
                this.yakshi.state = 'Searching';
                if (window.GameplayApp && dist < 18) {
                    window.GameplayApp._showHorrorSubtitle("[ Footsteps heard... she turns toward your direction ]");
                }
            }
        }
    }

    doVoiceMimic() {
        if (this.mimicCooldown > 0) return false;
        this.mimicCooldown = 22 + Math.random() * 25;

        const folklorePhrases = [
            { text: "Evideya nee? ... (Where are you?)", en: "A desperate woman's voice calls your name..." },
            { text: "Amme... rakshikku... (Mother, save me...)", en: "Weeping echoes through the wet leaves..." },
            { text: "Enne onnu nokku... (Just look at me once...)", en: "A soft, chilling whisper brushes against your ear..." },
            { text: "Vazhi thetti poyo? (Are you lost on the Pala road?)", en: "A calm, seductive voice speaks from behind a tree..." }
        ];

        const item = folklorePhrases[Math.floor(Math.random() * folklorePhrases.length)];

        if (window.GameplayApp) {
            window.GameplayApp._showHorrorSubtitle(`[ ${item.text} ]`);
        }

        if (window.AyasDevice) {
            window.AyasDevice.registerVoiceLure(0.92);
        }

        if (window.HorrorAudio) {
            window.HorrorAudio.playAyasChime('ping');
        }

        return true;
    }

    doFakeSighting(scene, playerPos) {
        if (this.sightingCooldown > 0 || !scene) return;
        this.sightingCooldown = 28 + Math.random() * 30;

        // Create an ethereal saree phantom group
        const group = new THREE.Group();

        // Shrouded body silhouette
        const bodyGeo = new THREE.CylinderGeometry(0.18, 0.42, 1.85, 10);
        const phantomMat = new THREE.MeshStandardMaterial({
            color: 0xdde5ee,
            roughness: 0.8,
            transparent: true,
            opacity: 0.45,
            emissive: 0x101520,
            emissiveIntensity: 0.6
        });
        const body = new THREE.Mesh(bodyGeo, phantomMat);
        body.position.y = 0.92;
        group.add(body);

        // Faint glowing red eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2222 });
        const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
        eye1.position.set(-0.06, 1.62, 0.16);
        const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), eyeMat);
        eye2.position.set(0.06, 1.62, 0.16);
        group.add(eye1);
        group.add(eye2);

        // Position 14-20m away in front of player's general direction
        const angle = Math.random() * Math.PI * 2;
        const dist = 14 + Math.random() * 6;
        group.position.set(playerPos.x + Math.cos(angle) * dist, 0, playerPos.z + Math.sin(angle) * dist);
        group.lookAt(playerPos.x, 0, playerPos.z);

        scene.add(group);
        this.activePhantom = group;

        if (window.GameplayApp) {
            window.GameplayApp._showHorrorSubtitle("[ A pale silhouette stands motionless in the trees... ]");
        }

        // Dissolve phantom after 1.8s
        let fadeTimer = 0;
        const interval = setInterval(() => {
            fadeTimer += 0.1;
            phantomMat.opacity = Math.max(0, 0.45 - (fadeTimer / 1.5) * 0.45);
            if (fadeTimer >= 1.5) {
                clearInterval(interval);
                scene.remove(group);
                bodyGeo.dispose();
                phantomMat.dispose();
                eyeMat.dispose();
                this.activePhantom = null;
            }
        }, 100);
    }

    update(delta) {
        this.mimicCooldown -= delta;
        this.sightingCooldown -= delta;

        if (Math.random() < 0.003 && this.mimicCooldown <= 0) {
            this.doVoiceMimic();
        }

        if (Math.random() < 0.0025 && this.sightingCooldown <= 0 && window.KeralaWorld && window.KeralaWorld.scene) {
            const playerPos = window.GameplayApp ? window.GameplayApp.playerPos : new THREE.Vector3();
            this.doFakeSighting(window.KeralaWorld.scene, playerPos);
        }
    }
}

window.YakshiAdvanced = null;
document.addEventListener('DOMContentLoaded', () => {
    if (window.YakshiAI) {
        window.YakshiAdvanced = new YakshiAdvanced(window.YakshiAI);
    }
});
