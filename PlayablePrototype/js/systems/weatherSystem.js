/**
 * Dynamic Weather System for AYAS
 */
class WeatherSystem {
    constructor() {
        this.intensity = 0.5;
        this.thunderTimer = 0;
        this.fogDensity = 0.028;
    }
    init() {
        this.thunderTimer = 10 + Math.random() * 20;
    }
    update(delta) {
        this.thunderTimer -= delta;
        if (this.thunderTimer <= 0) {
            this.thunderTimer = 15 + Math.random() * 30;
            if (Math.random() < 0.3 && window.KeralaWorld) {
                window.KeralaWorld.triggerLightning();
                if (window.HorrorAudio) window.HorrorAudio.playDistantThunder();
            }
        }
    }
}
window.WeatherSystem = new WeatherSystem();
