/**
 * AYAS: THE LAST WARD - Procedural Web Audio Sound Engine
 * Kerala Monsoon Night Soundscape, Spatial Acoustics, Entity Audio & AYAS Telemetry
 */

class HorrorAudioEngine {
    constructor() {
        this.ctx = null;
        this.isInitialized = false;

        // Master gain & sub-busses
        this.masterGain = null;
        this.ambienceBus = null;
        this.sfxBus = null;
        this.telemetryBus = null;
        this.entityBus = null;

        // Sound states
        this.isRainPlaying = false;
        this.isWindPlaying = false;
        this.isCricketsPlaying = false;
        this.cricketGainNode = null;
        this.heartbeatTimer = null;
        this.heartbeatBpm = 65;

        // Config volumes
        this.masterVolume = 1.0;
        this.ambienceVolume = 0.85;
        this.sfxVolume = 0.9;
    }

    init() {
        if (this.isInitialized) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();

        // Create main busses
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.ambienceBus = this.ctx.createGain();
        this.ambienceBus.gain.setValueAtTime(this.ambienceVolume, this.ctx.currentTime);
        this.ambienceBus.connect(this.masterGain);

        this.sfxBus = this.ctx.createGain();
        this.sfxBus.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxBus.connect(this.masterGain);

        this.telemetryBus = this.ctx.createGain();
        this.telemetryBus.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.telemetryBus.connect(this.masterGain);

        this.entityBus = this.ctx.createGain();
        this.entityBus.gain.setValueAtTime(1.0, this.ctx.currentTime);
        this.entityBus.connect(this.masterGain);

        this.isInitialized = true;
        this.startKeralaMonsoonAmbience();
        this.startCricketChorus();
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // 1. Procedural Monsoon Rain (Continuous Band-passed White Noise + Random Droplet Transients)
    startKeralaMonsoonAmbience() {
        if (!this.ctx || this.isRainPlaying) return;
        this.isRainPlaying = true;

        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter centered around 1400Hz to simulate rain on leaves & tiled roofs
        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(1400, this.ctx.currentTime);
        bandpass.Q.setValueAtTime(0.8, this.ctx.currentTime);

        const rainGain = this.ctx.createGain();
        rainGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

        whiteNoise.connect(bandpass);
        bandpass.connect(rainGain);
        rainGain.connect(this.ambienceBus);
        whiteNoise.start();

        // Wind Layer (Low-frequency modulated pink noise)
        const windFilter = this.ctx.createBiquadFilter();
        windFilter.type = 'lowpass';
        windFilter.frequency.setValueAtTime(280, this.ctx.currentTime);

        const windGain = this.ctx.createGain();
        windGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

        const windSource = this.ctx.createBufferSource();
        windSource.buffer = noiseBuffer;
        windSource.loop = true;
        windSource.connect(windFilter);
        windFilter.connect(windGain);
        windGain.connect(this.ambienceBus);
        windSource.start();

        // Occasional distant thunder rumble
        setInterval(() => {
            if (Math.random() < 0.25) {
                this.playDistantThunder();
            }
        }, 18000);
    }

    // 2. Kerala Night Crickets & Cicadas (Ducks when Yakshi is Stalking!)
    startCricketChorus() {
        if (!this.ctx || this.isCricketsPlaying) return;
        this.isCricketsPlaying = true;

        this.cricketGainNode = this.ctx.createGain();
        this.cricketGainNode.gain.setValueAtTime(0.18, this.ctx.currentTime);
        this.cricketGainNode.connect(this.ambienceBus);

        const triggerChirp = () => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const baseFreq = 4200 + Math.random() * 600;
            osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

            gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.04);
            gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(this.cricketGainNode);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.14);

            const nextTime = 120 + Math.random() * 280;
            setTimeout(triggerChirp, nextTime);
        };

        triggerChirp();
    }

    setThreatLevel(threat) { // 0.0 to 1.0
        if (!this.cricketGainNode) return;
        // In Kerala folklore, insects go dead silent when an ethereal entity approaches
        const targetVol = Math.max(0.0, 0.18 * (1.0 - threat * 1.3));
        this.cricketGainNode.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.5);

        // Adjust heartbeat
        this.heartbeatBpm = 65 + threat * 65;
    }

    // 3. Distant Thunder Clap
    playDistantThunder() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, now);
        filter.frequency.exponentialRampToValueAtTime(45, now + 3.8);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.9);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ambienceBus);
        noise.start(now);
    }

    // 4. Dynamic Footsteps (Mud, Stone, Wood)
    playFootstep(surface = 'mud', isSprinting = false) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const vol = isSprinting ? 0.35 : 0.18;

        if (surface === 'mud') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(90, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        } else if (surface === 'stone') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
            gain.gain.setValueAtTime(vol * 1.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        } else { // wood
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        }

        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(now);
        osc.stop(now + 0.16);
    }

    // 5. Tactile Flashlight Switch Click
    playFlashlightClick() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.03);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    // 6. AYAS Detector Geiger-Counter Clicks
    playGeigerClick(deviation = 0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const pitch = 1800 + Math.random() * 400 + (deviation * 8);
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.015);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(gain);
        gain.connect(this.telemetryBus);
        osc.start(now);
        osc.stop(now + 0.022);
    }

    // 7. AYAS Alert / Calibration Chime
    playAyasChime(type = 'ping') {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (type === 'ping') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(1760, now + 0.08);
            gain.gain.setValueAtTime(0.22, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
            osc.connect(gain);
            gain.connect(this.telemetryBus);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'calibrate') {
            // Rising 3-tone harmonic
            [523.25, 659.25, 783.99].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const time = now + idx * 0.12;
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.2, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
                osc.connect(gain);
                gain.connect(this.telemetryBus);
                osc.start(time);
                osc.stop(time + 0.26);
            });
        }
    }

    // 8. Yakshi Chilanka (Anklet Bells) in 3D Audio Space
    playAnkletChime(pannerX = 0, pannerZ = 0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const panner = this.ctx.createPanner ? this.ctx.createPanner() : null;
        if (panner) {
            panner.panningModel = 'HRTF';
            panner.positionX.setValueAtTime(pannerX, now);
            panner.positionZ.setValueAtTime(pannerZ, now);
        }

        // Metallic bell cluster
        const frequencies = [2850, 3120, 3550, 4100];
        frequencies.forEach(freq => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq + (Math.random() * 80 - 40), now);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.35);

            osc.connect(gain);
            if (panner) {
                gain.connect(panner);
                panner.connect(this.entityBus);
            } else {
                gain.connect(this.entityBus);
            }
            osc.start(now);
            osc.stop(now + 0.38);
        });
    }

    // 9. Yakshi Vocal Lure (Formant Whisper in Malayalam)
    playYakshiWhisper(phrase = 'Evideya...', pannerX = 5, pannerZ = -10) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        // Dual formant frequency simulation
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(320, now);
        osc1.frequency.linearRampToValueAtTime(260, now + 1.2);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(740, now);
        osc2.frequency.linearRampToValueAtTime(620, now + 1.2);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.entityBus);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.9);
        osc2.stop(now + 1.9);
    }

    // 10. Yakshi Disruption Scream (Shrill Discordant FM Sweep)
    playDisruptionScream() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const carrier = this.ctx.createOscillator();
        const modulator = this.ctx.createOscillator();
        const modGain = this.ctx.createGain();
        const gain = this.ctx.createGain();

        modulator.frequency.setValueAtTime(140, now);
        modulator.frequency.linearRampToValueAtTime(280, now + 1.5);
        modGain.gain.setValueAtTime(800, now);

        carrier.frequency.setValueAtTime(1200, now);
        carrier.frequency.exponentialRampToValueAtTime(2200, now + 0.8);
        carrier.frequency.exponentialRampToValueAtTime(450, now + 1.8);

        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);

        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(gain);
        gain.connect(this.entityBus);

        modulator.start(now);
        carrier.start(now);
        modulator.stop(now + 2.0);
        carrier.stop(now + 2.0);
    }

    // 11. Death Jumpscare Attack Chord
    playAttackStinger() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const dissonantPitches = [110, 155.56, 220, 311.13, 622.25];
        dissonantPitches.forEach(pitch => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(pitch, now);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 2.5);
        });
    }

    // 12. Ward Splice Complete Sound (Electrical Surge & Tone)
    playWardRepairedSound() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(now);
        osc.stop(now + 0.65);
    }
}

window.HorrorAudio = new HorrorAudioEngine();
