/**
 * AYAS: THE LAST WARD - Multi-Level Escalation & Entity System v2.0
 * Integrates real horror entities and folklore archetypes across 5 escalating levels,
 * with cursed effigy object spawning and Relic weapon integration.
 */

class LevelManager {
    constructor() {
        this.currentLevel = 0; // 0 = Tutorial, 1-5 = escalating levels
        this.maxLevel = 5;
        this.realGhosts = [
            { name: "The Woman in Black", source: "The Woman in Black (2012)", desc: "Relentless spectral mourner, accelerated pursuit", speedBonus: 1.0 },
            { name: "Sadako Yamamura", source: "Ringu / The Ring", desc: "Water-logged Onryō entity, intense EM distortion", speedBonus: 1.5 },
            { name: "Kayako Saeki", source: "Ju-on / The Grudge", desc: "Twisted death rattle curse, sudden shadow lunges", speedBonus: 2.0 },
            { name: "The Babadook", source: "The Babadook", desc: "Inky silhouette manifested from psychological dread", speedBonus: 2.2 },
            { name: "Slender Pala Sovereign", source: "Slender & Kerala Folklore", desc: "Ancient faceless entity, commands cursed effigies", speedBonus: 2.8 }
        ];
        this.levelConfig = [];
        this.buildLevels();
    }

    buildLevels() {
        // Tutorial
        this.levelConfig.push({
            id: 0,
            name: "TUTORIAL — Village Ingress",
            difficulty: 0.3,
            ghostType: "Yakshi (Kerala Folklore)",
            ghostSource: "Traditional Malabar Folklore",
            huntTime: 8,
            spawnRate: 30,
            hasEffigies: false,
            grantRelic: false,
            objectives: "Learn movement, detector, hiding, sacred ash"
        });

        // Levels 1-5
        for (let i = 1; i <= 5; i++) {
            const ghost = this.realGhosts[i - 1];
            this.levelConfig.push({
                id: i,
                name: `LEVEL ${i} — ${ghost.name.toUpperCase()}`,
                difficulty: 0.35 + (i * 0.15),
                ghostType: ghost.name,
                ghostSource: ghost.source,
                huntTime: 9 + i * 2,
                spawnRate: Math.max(10, 22 - i * 2.5),
                speedBonus: ghost.speedBonus,
                hasEffigies: i >= 4,
                grantRelic: i >= 3,
                objectives: i === 5 
                    ? "Purge cursed effigies with Relic [V], restore all 3 wards, escape to shrine" 
                    : "Restore wards, discover disappearance evidence, survive aggressive pursuit"
            });
        }
    }

    startLevel(levelId) {
        this.currentLevel = Math.max(0, Math.min(this.maxLevel, levelId));
        const cfg = this.levelConfig[this.currentLevel];

        if (window.GameplayApp) {
            window.GameplayApp.currentLevel = this.currentLevel;
            window.GameplayApp.difficultyMultiplier = cfg.difficulty;
            window.GameplayApp.updateLevelUI();

            // Announce level
            window.GameplayApp.showNotification(`⚔ ${cfg.name}`);
            window.GameplayApp._showHorrorSubtitle(`[ ${cfg.ghostType} is hunting — ${cfg.ghostSource} ]`);

            // Grant relic weapon if configured
            if (cfg.grantRelic && !window.GameplayApp.hasRelicWeapon) {
                window.GameplayApp.gainRelic(3);
            }
        }

        if (window.YakshiAI) {
            window.YakshiAI.huntSpeed = 11.5 + (cfg.speedBonus || 0);
            window.YakshiAI.randomSpawnInterval = cfg.spawnRate;
        }

        // Spawn cursed ghost effigies on high levels
        if (cfg.hasEffigies) {
            this.spawnCursedEffigies();
        }

        return cfg;
    }

    spawnCursedEffigies() {
        if (!window.KeralaWorld || !window.KeralaWorld.scene) return;
        const scene = window.KeralaWorld.scene;

        // Clean existing effigies
        if (window.GameplayApp && window.GameplayApp.destroyableGhostObjects) {
            window.GameplayApp.destroyableGhostObjects.forEach(obj => scene.remove(obj));
            window.GameplayApp.destroyableGhostObjects = [];
        }

        const effigyPositions = [
            new THREE.Vector3(-15, 0.9, -68),
            new THREE.Vector3(-21, 0.9, -74),
            new THREE.Vector3(14, 0.9, -82),
            new THREE.Vector3(2, 0.9, -155)
        ];

        effigyPositions.forEach((pos, idx) => {
            const group = new THREE.Group();
            group.position.copy(pos);

            // Cursed blackened timber totem
            const woodMat = new THREE.MeshStandardMaterial({
                color: 0x110c08,
                roughness: 0.9,
                metalness: 0.1
            });
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.8, 7), woodMat);
            trunk.castShadow = true;
            group.add(trunk);

            // Blood-red string cross ties
            const crossMat = new THREE.MeshStandardMaterial({
                color: 0x881111,
                roughness: 0.6,
                emissive: 0x330000
            });
            const cross = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.08), crossMat);
            cross.position.y = 0.5;
            group.add(cross);

            // Ominous red spectral core light
            const coreLight = new THREE.PointLight(0xff1122, 0.6, 5, 2);
            coreLight.position.y = 0.7;
            group.add(coreLight);

            scene.add(group);

            if (window.GameplayApp) {
                window.GameplayApp.destroyableGhostObjects.push(group);
            }
        });

        if (window.GameplayApp) {
            window.GameplayApp._showHorrorSubtitle("[ ⚠ 4 CURSED TOTEMS DETECTED — PURGE THEM USING RELIC [V] ]");
        }
    }

    completeLevel() {
        if (this.currentLevel < this.maxLevel) {
            const nextLvl = this.currentLevel + 1;
            this.startLevel(nextLvl);
        } else {
            if (window.GameplayApp) {
                window.GameplayApp.onPlayerWon();
            }
        }
    }
}

window.LevelManager = new LevelManager();
