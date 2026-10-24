/**
 * Level Management System - Multi-level with increasing difficulty
 * Real horror entities from movies, games, series
 */
class LevelManager {
    constructor() {
        this.currentLevel = 0; // 0 = Tutorial, 1-5 = levels
        this.maxLevel = 5;
        this.realGhosts = [
            { name: "The Woman in Black", source: "The Woman in Black (2012)", desc: "Vengeful spirit" },
            { name: "Sadako Yamamura (Samara)", source: "Ringu/The Ring", desc: "Onryō curse" },
            { name: "Kayako Saeki", source: "Ju-on/The Grudge", desc: "Grudge curse" },
            { name: "Pennywise", source: "IT (Stephen King)", desc: "Dancing clown entity" },
            { name: "The Babadook", source: "The Babadook", desc: "Manifestation of grief" },
            { name: "Slenderman", source: "Slender: The Eight Pages", desc: "Faceless entity" }
        ];
        this.levelConfig = [];
        this.buildLevels();
    }
    
    buildLevels() {
        // Tutorial
        this.levelConfig.push({
            id: 0,
            name: "TUTORIAL - Learn the Basics",
            difficulty: 0.3,
            ghostCount: 1,
            ghostType: "Yakshi (Local Kerala Folklore)",
            huntTime: 8,
            spawnRate: 25,
            hasFinalBoss: false,
            objectives: "Learn movement, detector, hiding, sacred ash"
        });
        // Levels 1-5
        for (let i = 1; i <= 5; i++) {
            this.levelConfig.push({
                id: i,
                name: `LEVEL ${i} - Escalating Horror`,
                difficulty: 0.4 + (i * 0.15),
                ghostCount: Math.min(2 + Math.floor(i/2), 3),
                ghostType: this.realGhosts[i-1] ? this.realGhosts[i-1].name : "Unknown Entity",
                ghostSource: this.realGhosts[i-1] ? this.realGhosts[i-1].source : "",
                huntTime: 8 + i * 2,
                spawnRate: 20 - i * 2,
                hasFinalBoss: i === 5,
                objectives: "Investigate, restore wards, destroy cursed objects"
            });
        }
    }
    
    startLevel(levelId) {
        this.currentLevel = levelId;
        const cfg = this.levelConfig[levelId] || this.levelConfig[0];
        if (window.GameplayApp) {
            window.GameplayApp.currentLevel = levelId;
            window.GameplayApp.difficultyMultiplier = cfg.difficulty;
            window.GameplayApp.updateLevelUI();
        }
        if (window.YakshiAI) {
            window.YakshiAI.maxPursuitTime = cfg.huntTime;
            window.YakshiAI.randomSpawnInterval = cfg.spawnRate + Math.random() * 10;
        }
        return cfg;
    }
    
    completeLevel() {
        if (this.currentLevel < this.maxLevel) {
            this.startLevel(this.currentLevel + 1);
        } else if (this.currentLevel === this.maxLevel && window.GameplayApp) {
            window.GameplayApp.onPlayerWon();
        }
    }
}

window.LevelManager = new LevelManager();
