/**
 * AYAS: THE LAST WARD - Dynamic Monsoon Weather System v2.0
 * Cycles through authentic Kerala monsoon atmospheric phases:
 * Misty Drizzle, Torrential Downpour, Violent Thunderstorm, and Ominous Calm.
 * Dynamically modulates rain particles, fog density, lightning flashes, and sound.
 */

class WeatherSystem {
    constructor() {
        this.stages = ['Drizzle', 'Downpour', 'Thunderstorm', 'OminousCalm'];
        this.currentStage = 'Drizzle';
        this.stageTimer = 45.0; // Stage duration in seconds
        this.thunderTimer = 12.0;
        this.intensity = 0.4;
        this.fogDensity = 0.022;
        this.targetFog = 0.022;
    }

    init() {
        this.setStage('Drizzle');
        this.thunderTimer = 8 + Math.random() * 15;
    }

    setStage(stageName) {
        this.currentStage = stageName;
        if (stageName === 'Drizzle') {
            this.stageTimer = 40 + Math.random() * 20;
            this.intensity = 0.35;
            this.targetFog = 0.020;
        } else if (stageName === 'Downpour') {
            this.stageTimer = 50 + Math.random() * 25;
            this.intensity = 0.75;
            this.targetFog = 0.028;
            if (window.GameplayApp) window.GameplayApp._showHorrorSubtitle("[ Monsoon squall intensifies — rain hammering the canopy ]");
        } else if (stageName === 'Thunderstorm') {
            this.stageTimer = 35 + Math.random() * 15;
            this.intensity = 1.0;
            this.targetFog = 0.035;
            this.thunderTimer = 3.0;
            if (window.GameplayApp) window.GameplayApp._showHorrorSubtitle("[ Violent storm front — lightning shearing the darkness ]");
        } else if (stageName === 'OminousCalm') {
            this.stageTimer = 25 + Math.random() * 15;
            this.intensity = 0.15;
            this.targetFog = 0.038;
            if (window.GameplayApp) window.GameplayApp._showHorrorSubtitle("[ The rain stops abruptly... an unnatural stillness descends ]");
        }
    }

    update(delta) {
        // Cycle stages
        this.stageTimer -= delta;
        if (this.stageTimer <= 0) {
            const nextIdx = (this.stages.indexOf(this.currentStage) + 1) % this.stages.length;
            this.setStage(this.stages[nextIdx]);
        }

        // Interpolate fog
        if (window.KeralaWorld && window.KeralaWorld.scene && window.KeralaWorld.scene.fog) {
            const currentFog = window.KeralaWorld.scene.fog.density;
            window.KeralaWorld.scene.fog.density += (this.targetFog - currentFog) * delta * 0.5;
        }

        // Thunder & Lightning
        this.thunderTimer -= delta;
        if (this.thunderTimer <= 0) {
            const minInterval = this.currentStage === 'Thunderstorm' ? 5 : 18;
            const maxInterval = this.currentStage === 'Thunderstorm' ? 12 : 35;
            this.thunderTimer = minInterval + Math.random() * (maxInterval - minInterval);

            if (window.KeralaWorld) {
                window.KeralaWorld.triggerLightning();
                if (window.HorrorAudio) {
                    window.HorrorAudio.playDistantThunder();
                }

                // If in thunderstorm, occasional double strike
                if (this.currentStage === 'Thunderstorm' && Math.random() < 0.45) {
                    setTimeout(() => {
                        if (window.KeralaWorld) window.KeralaWorld.triggerLightning();
                    }, 400 + Math.random() * 300);
                }
            }
        }

        // Weather effects on rain particles
        if (window.KeralaWorld && window.KeralaWorld.rainParticles) {
            const pos = window.KeralaWorld.rainParticles.geometry.attributes.position;
            if (pos) {
                const count = pos.count;
                const speed = 25 * this.intensity;
                const slant = this.currentStage === 'Thunderstorm' ? -4.5 : -1.2;
                for (let i = 0; i < count; i++) {
                    let y = pos.getY(i) - speed * delta;
                    let x = pos.getX(i) + slant * delta;
                    if (y < 0) {
                        y = 35 + Math.random() * 5;
                        x = (Math.random() - 0.5) * 80;
                    }
                    pos.setY(i, y);
                    pos.setX(i, x);
                }
                pos.needsUpdate = true;
            }
        }
    }
}

window.WeatherSystem = new WeatherSystem();
