/**
 * AYAS: THE LAST WARD - Anomaly and Iron Integrity Monitor MK-IV
 * Real-Time Signal Model, FFT Waveform Canvas, Needle Galvanometer & Calibration
 * 
 * Features:
 * - Dynamic EMF reading linked directly to Jess's actual world position and state.
 * - Thermal cold-spot drops near paranormal anomalies.
 * - Audio lure waveform analysis.
 * - Reactive iron ward directional needle navigation.
 * - Stillness calibration requirement with progress tracking.
 */

class AyasDetectorDevice {
    constructor() {
        this.isEquipped = true;
        this.baselineField = 42.5; // Kerala ambient baseline in microtesla (µT)
        this.currentField = 42.5;
        this.baselineDeviation = 0.0;
        this.ambientTemp = 28.5; // Celsius
        this.targetTemp = 28.5;
        this.voiceConfidence = 0.0;
        this.voiceFadeTimer = 0.0;

        // Calibration
        this.isCalibrating = false;
        this.calibrationTimer = 0.0;
        this.calibrationRequired = 2.2; // seconds

        // Nearest Ward Bearing
        this.nearestWardName = "Ward A";
        this.nearestWardDist = 0.0;
        this.nearestWardBearing = 0.0;

        // Audio Click Timer
        this.geigerTimer = 0.0;

        // Waveform Canvas Context
        this.canvas = null;
        this.ctx = null;
        this.wavePhase = 0.0;
    }

    init() {
        this.canvas = document.getElementById('waveform-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }

        // Ensure AYAS device panel is visible on start
        const panel = document.getElementById('ayas-device-panel');
        if (panel && this.isEquipped) {
            panel.classList.add('active');
        }
    }

    toggleEquipped() {
        this.isEquipped = !this.isEquipped;
        const panel = document.getElementById('ayas-device-panel');
        if (panel) {
            panel.classList.toggle('active', this.isEquipped);
        }
    }

    startCalibration(playerSpeed) {
        if (playerSpeed > 0.3) {
            if (window.GameplayApp) {
                window.GameplayApp._showHorrorSubtitle("[ Must remain stationary to calibrate baseline ]");
            }
            return false;
        }

        if (!this.isCalibrating) {
            this.isCalibrating = true;
            this.calibrationTimer = 0.0;
            return true;
        }
        return true;
    }

    stopCalibration() {
        if (this.isCalibrating) {
            this.isCalibrating = false;
            this.calibrationTimer = 0.0;
            const calEl = document.getElementById('meter-em-val');
            if (calEl) calEl.innerText = `${this.currentField.toFixed(1)} µT`;
        }
    }

    registerVoiceLure(confidence = 0.94) {
        this.voiceConfidence = confidence;
        this.voiceFadeTimer = 5.0;
        if (window.HorrorAudio && typeof window.HorrorAudio.playAyasChime === 'function') {
            window.HorrorAudio.playAyasChime('ping');
        }
    }

    update(delta, playerPos, playerFwd, ghostPosOverride, ghostStateOverride) {
        if (!this.isEquipped) return;

        // 1. Calibration Update
        if (this.isCalibrating) {
            this.calibrationTimer += delta;
            const progress = Math.min(1.0, this.calibrationTimer / this.calibrationRequired);
            const calEl = document.getElementById('meter-em-val');
            if (calEl) calEl.innerText = `CALIBRATING (${Math.floor(progress * 100)}%)`;

            if (this.calibrationTimer >= this.calibrationRequired) {
                this.isCalibrating = false;
                this.baselineField = this.currentField;
                if (window.HorrorAudio && typeof window.HorrorAudio.playAyasChime === 'function') {
                    window.HorrorAudio.playAyasChime('calibrate');
                }
                if (window.GameplayApp) {
                    window.GameplayApp.showNotification("✦ AYAS BASELINE CALIBRATED");
                }
            }
            this.renderWaveform(delta);
            return;
        }

        // 2. Proximity to Active Ghost & Electromagnetic Field Calculation
        const ghost = window.GhostAI || window.JessAI || window.YakshiAI;
        const ghostPos = ghost ? ghost.position : ghostPosOverride;
        const ghostState = ghost ? ghost.state : ghostStateOverride;

        let distToGhost = 999.0;
        if (ghostPos && ghostState !== 'Dormant') {
            distToGhost = playerPos.distanceTo(ghostPos);
        }

        let anomalyFactor = 0.0;
        if (distToGhost < 32.0) {
            anomalyFactor = Math.max(0.0, 1.0 - (distToGhost / 32.0));
            // Severe spike when hunting or attacking
            if (ghostState === 'Hunting' || ghostState === 'Attacking') {
                anomalyFactor = Math.min(1.0, anomalyFactor * 1.35);
            }
        }

        // Add subtle natural jitter
        const jitter = (Math.random() - 0.5) * 1.2;
        const targetEM = this.baselineField + (anomalyFactor * 138.0) + jitter;
        this.currentField += (targetEM - this.currentField) * Math.min(1.0, delta * 5.0);
        this.baselineDeviation = Math.abs(this.currentField - this.baselineField);

        // 3. Thermal Cold-Spot Calculation (drops from 28.5 C down to 4.0 C)
        this.targetTemp = 28.5 - (anomalyFactor * 24.5);
        this.ambientTemp += (this.targetTemp - this.ambientTemp) * Math.min(1.0, delta * 2.0);

        // Cold vignette trigger
        const overlay = document.getElementById('screen-overlay');
        if (overlay) {
            if (this.ambientTemp < 12.0) {
                overlay.classList.add('cold-fog');
            } else {
                overlay.classList.remove('cold-fog');
            }
        }

        // 4. Voice Lure Decay
        if (this.voiceFadeTimer > 0) {
            this.voiceFadeTimer -= delta;
            if (this.voiceFadeTimer <= 0) {
                this.voiceConfidence = 0.0;
            }
        }

        // 5. Geiger Click Audio Timing
        if (this.baselineDeviation > 6.0 && window.HorrorAudio && typeof window.HorrorAudio.playGeigerClick === 'function') {
            const interval = Math.max(0.06, 1.2 - (this.baselineDeviation / 95.0));
            this.geigerTimer += delta;
            if (this.geigerTimer >= interval) {
                this.geigerTimer = 0.0;
                window.HorrorAudio.playGeigerClick(this.baselineDeviation);
            }
        }

        // 6. Ward Navigation Vector
        this.updateWardNavigation(playerPos, playerFwd);

        // 7. Render Waveform & HUD
        this.renderWaveform(delta);
        this.updateHUDDisplay();

        return this.currentField;
    }

    updateWardNavigation(playerPos, playerFwd) {
        if (!window.KeralaWorld || !window.KeralaWorld.wardStations) return;

        let nearestDist = 999.0;
        let targetWard = null;

        for (const key in window.KeralaWorld.wardStations) {
            const ward = window.KeralaWorld.wardStations[key];
            if (ward.state !== 'Repaired' && ward.state !== 'Intact') {
                const d = playerPos.distanceTo(ward.worldPos);
                if (d < nearestDist) {
                    nearestDist = d;
                    targetWard = ward;
                }
            }
        }

        if (targetWard) {
            this.nearestWardName = targetWard.id;
            this.nearestWardDist = nearestDist;

            // Relative bearing angle
            const toWard = new THREE.Vector3().subVectors(targetWard.worldPos, playerPos);
            toWard.y = 0;
            toWard.normalize();

            const forward = new THREE.Vector3(playerFwd.x, 0, playerFwd.z).normalize();
            const angleRad = Math.atan2(toWard.x * forward.z - toWard.z * forward.x, toWard.x * forward.x + toWard.z * forward.z);
            this.nearestWardBearing = THREE.MathUtils.radToDeg(angleRad);
        } else {
            this.nearestWardName = "ALL STABLE";
            this.nearestWardDist = 0.0;
            this.nearestWardBearing = 0.0;
        }
    }

    renderWaveform(delta) {
        if (!this.ctx || !this.canvas) return;
        const w = (this.canvas.width = this.canvas.offsetWidth || 200);
        const h = (this.canvas.height = this.canvas.offsetHeight || 36);

        this.ctx.fillStyle = '#080c06';
        this.ctx.fillRect(0, 0, w, h);

        this.wavePhase += delta * 12.0;

        this.ctx.lineWidth = 1.5;
        this.ctx.strokeStyle = this.voiceConfidence > 0.5 ? '#ff3333' : '#00f0ff';
        this.ctx.beginPath();

        const midY = h / 2;
        const freq = this.voiceConfidence > 0.5 ? 0.35 : 0.12;
        const amp = midY * (0.15 + this.voiceConfidence * 0.75 + (this.baselineDeviation / 140.0) * 0.35);

        for (let x = 0; x < w; x++) {
            const noise = (Math.random() - 0.5) * (this.voiceConfidence > 0.5 ? 6 : 2);
            const y = midY + Math.sin(x * freq + this.wavePhase) * amp + noise;
            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }

    updateHUDDisplay() {
        const emVal = document.getElementById('meter-em-val');
        const needle = document.getElementById('needle-fill');
        const tempVal = document.getElementById('meter-temp-val');
        const voiceVal = document.getElementById('meter-voice-val');
        const wardNav = document.getElementById('meter-ward-nav');

        if (emVal) emVal.innerText = `${this.currentField.toFixed(1)} µT`;
        if (needle) {
            const pct = Math.min(100, (this.baselineDeviation / 110.0) * 100);
            needle.style.width = `${pct}%`;
        }

        if (tempVal) {
            tempVal.innerText = `${this.ambientTemp.toFixed(1)} °C`;
            if (this.ambientTemp < 12.0) {
                tempVal.classList.add('alert');
            } else {
                tempVal.classList.remove('alert');
            }
        }

        if (voiceVal) {
            if (this.voiceConfidence > 0.5) {
                voiceVal.innerText = `ANOMALOUS (${Math.floor(this.voiceConfidence * 100)}%)`;
                voiceVal.classList.add('alert');
            } else {
                voiceVal.innerText = "AUTHENTIC";
                voiceVal.classList.remove('alert');
            }
        }

        if (wardNav) {
            if (this.nearestWardName === "ALL STABLE") {
                wardNav.innerText = "ALL WARDS INTACT";
            } else {
                const dirArrow = this.nearestWardBearing > 15 ? "→" : (this.nearestWardBearing < -15 ? "←" : "↑");
                wardNav.innerText = `${this.nearestWardName} | ${this.nearestWardDist.toFixed(0)}m ${dirArrow}`;
            }
        }
    }
}

window.AyasDevice = new AyasDetectorDevice();
