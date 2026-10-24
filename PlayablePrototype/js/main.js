/**
 * AYAS: THE LAST WARD - Main Game Controller v2.0
 * First-Person Player Movement, Stamina, Interactions, Minimap,
 * Horror Effects (cold vignette, breath overlay, fear response),
 * Evidence Inspect Modal, and Complete Game Loop
 */

class AyasGameApplication {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.isDead = false;
        this.hasWon = false;

        // Player
        this.playerPos = new THREE.Vector3(0, 1.7, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 0.0022;

        // Movement speeds
        this.walkSpeed = 4.0;
        this.sprintSpeed = 7.0;
        this.crouchSpeed = 1.9;
        this.isSprinting = false;
        this.isCrouched = false;
        this.isHiding = false;

        // Health
        this.maxHealth = 100;
        this.health = 100;
        this.lastDamageTime = 0;
        this.invulnTime = 0.8;

        // Stamina
        this.maxStamina = 100.0;
        this.stamina = 100.0;
        this.isExhausted = false;

        // Sacred Ash
        this.sacredAshCount = 2;

        // Level System
        this.currentLevel = 0; // Start with tutorial
        this.maxLevels = 5;
        this.difficultyMultiplier = 0.3;
        this.hasRelicWeapon = false;
        this.relicCharges = 0;

        // Input
        this.keys = {};
        this.isPointerLocked = false;

        // Head Bob
        this.headBobTimer = 0.0;
        this.footstepDist = 0.0;
        this.lastPos = new THREE.Vector3(0, 1.7, 0);

        // Interaction (hold E)
        this.interactionTarget = null;
        this.holdProgress = 0.0;
        this.isHoldingInteract = false;
        this._interactDebounce = false;

        // Horror FX state
        this.coldVigorLevel = 0.0;
        this.fearLevel = 0.0;
        this._breathTimer = 0.0;
        this._lastFear = 0.0;

        // Clock
        this.clock = new THREE.Clock();

        // Minimap update throttle
        this._minimapTimer = 0;

        // Evidence modal queue
        this._pendingEvidence = null;
        this._evidenceModalOpen = false;
        this.isConcussed = false;
        this.concussionTimer = 0;
        this.abilities = [];
        this.destroyableGhostObjects = [];
    }

    init() {
        const container = document.getElementById('canvas-container');
        window.KeralaWorld.init(container);
        window.AyasDevice.init();
        window.YakshiAI.init(window.KeralaWorld.scene);
        window.Quests.init();
        window.MinimapUI.init();

        this.setupEventListeners();
        this.updateHUDStats();

        requestAnimationFrame(() => this.gameLoop());
    }

    setupEventListeners() {
        const startScreen = document.getElementById('start-screen');
        startScreen.addEventListener('click', () => {
            if (window.HorrorAudio) window.HorrorAudio.init();
            this.requestPointerLock();
            startScreen.style.display = 'none';
            this.isRunning = true;
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === document.body;
            if (!this.isPointerLocked && this.isRunning && !this.isDead && !this.hasWon && !this._evidenceModalOpen) {
                this.openPauseMenu();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked || this.isPaused || this.isDead || this.hasWon) return;
            this.yaw -= e.movementX * (this.mouseSensitivity * 1.0);
            this.pitch -= e.movementY * this.mouseSensitivity;
            this.pitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, this.pitch));

            window.KeralaWorld.camera.rotation.order = "YXZ";
            window.KeralaWorld.camera.rotation.y = this.yaw;
            window.KeralaWorld.camera.rotation.x = this.pitch;
        });

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'KeyF') {
                window.KeralaWorld.toggleFlashlight();
            } else if (e.code === 'KeyQ') {
                if (window.AyasDevice) window.AyasDevice.toggleEquipped();
                const panel = document.getElementById('ayas-device-panel');
                if (panel && window.AyasDevice) panel.classList.toggle('active', window.AyasDevice.isEquipped);
            } else if (e.code === 'KeyG') {
                this.deploySacredAsh();
            } else if (e.code === 'KeyV') {
                this.useRelic();
            } else if (e.code === 'Tab') {
                e.preventDefault();
                this.toggleJournalModal();
            } else if (e.code === 'Escape') {
                e.preventDefault();
                if (!this._evidenceModalOpen) this.togglePauseMenu();
            } else if (e.code === 'KeyE' && this._evidenceModalOpen) {
                if (typeof this.closeEvidenceModal === 'function') this.closeEvidenceModal();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            if (e.code === 'KeyE') {
                this.isHoldingInteract = false;
                this.holdProgress = 0.0;
                this._interactDebounce = false;
                const hpBar = document.getElementById('hold-progress-bar');
                if (hpBar) hpBar.style.display = 'none';
            } else if (e.code === 'KeyR') {
                if (window.AyasDevice) window.AyasDevice.stopCalibration();
            }
        });

        // Modal buttons
        document.getElementById('btn-resume')?.addEventListener('click', () => this.closePauseMenu());
        document.getElementById('btn-restart')?.addEventListener('click', () => location.reload());
        document.getElementById('btn-retry-death')?.addEventListener('click', () => location.reload());
        document.getElementById('btn-close-journal')?.addEventListener('click', () => this.toggleJournalModal());
        document.getElementById('btn-win-restart')?.addEventListener('click', () => location.reload());
        document.getElementById('btn-close-evidence')?.addEventListener('click', () => this.closeEvidenceModal());

        // Settings
        document.getElementById('slider-master')?.addEventListener('input', (e) => {
            if (window.HorrorAudio) window.HorrorAudio.masterVolume = parseFloat(e.target.value);
        });
        document.getElementById('slider-sens')?.addEventListener('input', (e) => {
            this.mouseSensitivity = 0.001 * parseFloat(e.target.value);
        });
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());
        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (!this.isRunning || this.isPaused || this.isDead || this.hasWon) return;
        if (this._evidenceModalOpen) return;

        this.handleMovement(delta);
        this.handleInteraction(delta);

        // System updates
        window.KeralaWorld.updateRain(delta);

        const camFwd = new THREE.Vector3();
        window.KeralaWorld.camera.getWorldDirection(camFwd);

        // AYAS Detector
        const currentEM = window.AyasDevice.update(
            delta, this.playerPos, camFwd,
            window.YakshiAI.position, window.YakshiAI.state
        );

        // Yakshi AI
        window.YakshiAI.update(
            delta, this.playerPos, camFwd,
            this.isHiding, this.isCrouched, this.isSprinting,
            window.KeralaWorld.isFlashlightOn
        );

        // Horror atmosphere
        this.updateHorrorFX(delta);

        // Objectives
        this.checkObjectiveZoneTriggers();

        // Minimap (throttled to ~15fps for performance)
        this._minimapTimer += delta;
        if (this._minimapTimer > 0.066) {
            this._minimapTimer = 0;
            window.MinimapUI.update(
                delta,
                this.playerPos,
                window.YakshiAI.position,
                window.YakshiAI.state,
                currentEM || 0
            );
        }

        this.updateHUDStats();
        window.KeralaWorld.render();
    }

    updateHorrorFX(delta) {
        const distToYakshi = this.playerPos.distanceTo(window.YakshiAI.position);
        const yakshiState = window.YakshiAI.state;

        // Cold vignette — closer Yakshi = more blue border
        const targetCold = yakshiState !== 'Dormant'
            ? Math.max(0, 1.0 - distToYakshi / 25.0)
            : 0;
        this.coldVigorLevel += (targetCold - this.coldVigorLevel) * delta * 1.2;
        this.coldVigorLevel = Math.max(0, Math.min(1, this.coldVigorLevel));

        const coldEl = document.getElementById('cold-vignette');
        if (coldEl && this.coldVigorLevel > 0.05) {
            const cv = this.coldVigorLevel;
            coldEl.style.boxShadow = `inset 0 0 ${60 * cv}px ${12 * cv}px rgba(0,200,255,${0.08 + 0.12 * cv})`;
        } else if (coldEl) {
            coldEl.style.boxShadow = '';
        }

        // Fear level — accumulates when Yakshi is hunting near player
        if (yakshiState === 'Hunting' && distToYakshi < 20) {
            this.fearLevel = Math.min(1.0, this.fearLevel + delta * 0.35);
        } else {
            this.fearLevel = Math.max(0, this.fearLevel - delta * 0.15);
        }

        // Breathing FX when fear > 0.4
        if (this.fearLevel > 0.4) {
            this._breathTimer += delta;
            const breathEl = document.getElementById('breath-overlay');
            if (breathEl) {
                const bIntensity = (this.fearLevel - 0.4) / 0.6;
                const breathPulse = Math.sin(this._breathTimer * (2 + bIntensity * 3)) * 0.5 + 0.5;
                breathEl.style.boxShadow = `inset 0 0 ${40 * bIntensity * breathPulse}px ${8 * bIntensity}px rgba(180,0,0,${0.1 * bIntensity * breathPulse})`;
            }
        } else {
            const breathEl = document.getElementById('breath-overlay');
            if (breathEl) breathEl.style.boxShadow = '';
        }

        // Show horror subtitle when Yakshi nearby
        if (yakshiState === 'Hunting' && distToYakshi < 15) {
            this._showHorrorSubtitle("[ YAKSHI IS HUNTING YOU — HIDE OR RUN! ]");
        } else if (yakshiState === 'Luring') {
            this._showHorrorSubtitle("[ DO NOT FOLLOW THE VOICE — AYAS ANOMALY DETECTED ]");
        }
    }

    _showHorrorSubtitle(text) {
        const el = document.getElementById('horror-subtitle');
        if (!el) return;
        el.innerText = text;
        el.classList.add('visible');
        clearTimeout(this._subtitleTimeout);
        this._subtitleTimeout = setTimeout(() => el.classList.remove('visible'), 3500);
    }

    showNotification(text, duration = 2500) {
        const el = document.getElementById('notification-toast');
        if (!el) return;
        el.innerText = text;
        el.classList.add('visible');
        clearTimeout(this._notifTimeout);
        this._notifTimeout = setTimeout(() => el.classList.remove('visible'), duration);
    }

    handleMovement(delta) {
        if (this.isHiding) {
            this.velocity.set(0, 0, 0);
            return;
        }

        // Crouch
        this.isCrouched = !!(this.keys['ControlLeft'] || this.keys['ControlRight']);
        const targetCamHeight = this.isCrouched ? 1.05 : 1.7;
        this.playerPos.y += (targetCamHeight - this.playerPos.y) * Math.min(1.0, delta * 10.0);

        // Sprint & Stamina
        const wantsSprint = !!this.keys['ShiftLeft'] && !this.isCrouched;
        if (wantsSprint && this.stamina > 0 && !this.isExhausted) {
            this.isSprinting = true;
            this.stamina = Math.max(0, this.stamina - 20.0 * delta);
            if (this.stamina <= 0) {
                this.isExhausted = true;
                this._showHorrorSubtitle("[ EXHAUSTED — catch your breath ]");
            }
        } else {
            this.isSprinting = false;
            const recovRate = this.velocity.length() < 0.2 ? 20.0 : 10.0;
            this.stamina = Math.min(this.maxStamina, this.stamina + recovRate * delta);
            if (this.stamina >= 25.0) this.isExhausted = false;
        }

        // Direction from camera
        this.direction.set(0, 0, 0);
        if (this.keys['KeyW']) this.direction.z -= 1;
        if (this.keys['KeyS']) this.direction.z += 1;
        if (this.keys['KeyA']) this.direction.x -= 1;
        if (this.keys['KeyD']) this.direction.x += 1;
        this.direction.normalize();

        let speed = this.walkSpeed;
        if (this.isCrouched) speed = this.crouchSpeed;
        else if (this.isSprinting) speed = this.sprintSpeed;

        if (this.direction.length() > 0) {
            const rotMatrix = new THREE.Matrix4().makeRotationY(this.yaw);
            const moveVec = this.direction.clone().applyMatrix4(rotMatrix).multiplyScalar(speed * delta);
            this.playerPos.x += moveVec.x;
            this.playerPos.z += moveVec.z;
            this.velocity.copy(moveVec).divideScalar(delta);
        } else {
            this.velocity.set(0, 0, 0);
        }

        // World bounds
        this.playerPos.x = Math.max(-18, Math.min(24, this.playerPos.x));
        this.playerPos.z = Math.max(-178, Math.min(5, this.playerPos.z));

        // Head bob
        const hSpeed = Math.hypot(this.velocity.x, this.velocity.z);
        if (hSpeed > 0.4) {
            const bobFreq = this.isSprinting ? 13.0 : 8.0;
            const bobAmp = this.isSprinting ? 0.09 : 0.035;
            this.headBobTimer += delta * bobFreq;
            window.KeralaWorld.camera.position.y = this.playerPos.y + Math.sin(this.headBobTimer) * bobAmp;

            // Footsteps
            const dist = this.lastPos.distanceTo(this.playerPos);
            this.footstepDist += dist;
            const stepInterval = this.isSprinting ? 2.0 : 1.55;
            if (this.footstepDist >= stepInterval) {
                this.footstepDist = 0;
                let surface = 'mud';
                if (Math.abs(this.playerPos.x - 18) < 10 && this.playerPos.z > -96 && this.playerPos.z < -74) {
                    surface = 'wood'; // house veranda
                } else if (this.playerPos.z < -148) {
                    surface = 'stone'; // shrine
                }
                if (window.HorrorAudio) window.HorrorAudio.playFootstep(surface, this.isSprinting);
            }
        } else {
            this.headBobTimer = 0;
            window.KeralaWorld.camera.position.y = this.playerPos.y;
        }

        this.lastPos.copy(this.playerPos);
        window.KeralaWorld.camera.position.x = this.playerPos.x;
        window.KeralaWorld.camera.position.z = this.playerPos.z;

        // Calibration
        if (this.keys['KeyR'] && window.AyasDevice.isEquipped) {
            window.AyasDevice.startCalibration(hSpeed);
            if (hSpeed < 0.3 && window.Quests.getCurrentObjective().id === 2) {
                setTimeout(() => window.Quests.completeObjective(2), 2400);
            }
        }
    }

    handleInteraction(delta) {
        const reticle = document.getElementById('reticle');
        const promptEl = document.getElementById('interaction-prompt');
        const hpBar = document.getElementById('hold-progress-bar');
        const hpFill = document.getElementById('hold-progress-fill');

        let foundInteractable = false;

        // 1. Ward Stations
        for (const key in window.KeralaWorld.wardStations) {
            const ward = window.KeralaWorld.wardStations[key];
            const dist = this.playerPos.distanceTo(ward.worldPos);
            if (dist < 3.5 && ward.state !== 'Repaired') {
                foundInteractable = true;
                this.interactionTarget = ward;
                if (reticle) reticle.classList.add('active');
                if (promptEl) {
                    promptEl.innerText = `Hold [E] — Repair ${ward.displayName}`;
                    promptEl.classList.add('visible');
                }

                if (this.keys['KeyE']) {
                    this.isHoldingInteract = true;
                    this.holdProgress += delta;
                    const pct = Math.min(100, (this.holdProgress / 2.5) * 100);
                    if (promptEl) promptEl.innerText = `Splicing circuit... ${Math.floor(pct)}%`;
                    if (hpBar) hpBar.style.display = 'block';
                    if (hpFill) hpFill.style.width = `${pct}%`;

                    if (this.holdProgress >= 2.5) {
                        this._repairWard(ward);
                        this.holdProgress = 0;
                        if (hpBar) hpBar.style.display = 'none';
                    }
                }
                break;
            }
        }

        // 2. Evidence Items
        if (!foundInteractable) {
            for (const item of window.KeralaWorld.evidenceItems) {
                if (!item.collected && this.playerPos.distanceTo(item.mesh.position) < 2.8) {
                    foundInteractable = true;
                    if (reticle) reticle.classList.add('active');
                    if (promptEl) {
                        promptEl.innerText = `Press [E] — Inspect ${item.title}`;
                        promptEl.classList.add('visible');
                    }

                    if (this.keys['KeyE'] && !this._interactDebounce) {
                        this._interactDebounce = true;
                        item.collected = true;
                        item.mesh.visible = false;
                        window.Quests.collectEvidence(item);
                        if (window.HorrorAudio) window.HorrorAudio.playAyasChime('ping');
                        this._showEvidenceModal(item);
                    }
                    break;
                }
            }
        }

        // 3. Hiding Spots
        if (!foundInteractable) {
            for (const spot of window.KeralaWorld.hidingSpots) {
                const dist = this.playerPos.distanceTo(spot.worldPos);
                if (dist < 2.5) {
                    foundInteractable = true;
                    if (reticle) reticle.classList.add('active');
                    if (promptEl) {
                        promptEl.innerText = this.isHiding
                            ? `Press [E] — Step Out`
                            : `Press [E] — Hide in Rice Bin (Nellara)`;
                        promptEl.classList.add('visible');
                    }

                    if (this.keys['KeyE'] && !this._interactDebounce) {
                        this._interactDebounce = true;
                        this._toggleHiding(spot);
                    }
                    break;
                }
            }
        }

        if (!foundInteractable) {
            if (reticle) reticle.classList.remove('active');
            if (promptEl) promptEl.classList.remove('visible');
            this.interactionTarget = null;
            if (!this.keys['KeyE']) this.holdProgress = 0;
            if (hpBar && !this.keys['KeyE']) hpBar.style.display = 'none';
        }
    }

    _repairWard(ward) {
        ward.state = 'Repaired';
        ward.statusLight.material.color.setHex(0x00f0ff);
        if (ward.ledLight) ward.ledLight.color.setHex(0x00f0ff);
        if (window.HorrorAudio) window.HorrorAudio.playWardRepairedSound();
        this.showNotification(`✦ ${ward.displayName} RESTORED`);

        // Update minimap
        window.MinimapUI.setWardRepaired(ward.id);

        // Update HUD dots
        const dotId = ward.id === 'WardA' ? 'a' : ward.id === 'WardB' ? 'b' : 'c';
        const dot = document.getElementById(`ward-dot-${dotId}`);
        if (dot) dot.className = 'ward-dot repaired';

        // Advance quests
        if (ward.id === 'WardA' && window.Quests.getCurrentObjective().id === 4) window.Quests.completeObjective(4);
        else if (ward.id === 'WardB' && window.Quests.getCurrentObjective().id === 5) window.Quests.completeObjective(5);
        else if (ward.id === 'WardC' && window.Quests.getCurrentObjective().id === 7) window.Quests.completeObjective(7);

        // Repel Yakshi
        if (window.YakshiAI.position.distanceTo(ward.worldPos) < 26.0) {
            window.YakshiAI.disrupt(ward.worldPos);
        }

        // Add dynamic journal entry
        this._addJournalEntry(`[ WARD ${ward.id.replace('Ward','')} REPAIRED ]`,
            `The iron perimeter at ${ward.displayName} has been restored. The Yakshi's boundary breach point is sealed.`);
    }

    _addJournalEntry(title, text) {
        const container = document.getElementById('dynamic-journal-entries');
        if (!container) return;
        const entry = document.createElement('div');
        entry.className = 'journal-entry';
        entry.innerHTML = `<div class="journal-entry-title">${title}</div><div class="journal-entry-text">${text}</div>`;
        container.appendChild(entry);
    }

    _toggleHiding(spot) {
        if (!this.isHiding) {
            this.isHiding = true;
            this.playerPos.copy(spot.worldPos);
            window.KeralaWorld.camera.position.copy(this.playerPos);
            this._showHorrorSubtitle("[ HIDING — stay quiet, don't move ]");
        } else {
            this.isHiding = false;
            this.playerPos.copy(spot.exitPos);
            window.KeralaWorld.camera.position.copy(this.playerPos);
        }
    }

    deploySacredAsh() {
        if (this.sacredAshCount <= 0) {
            this._showHorrorSubtitle("[ No Sacred Ash remaining ]");
            return;
        }
        this.sacredAshCount--;
        this.updateHUDStats();

        // Visual ash ring
        const circleGeo = new THREE.RingGeometry(0.3, 3.8, 36);
        circleGeo.rotateX(-Math.PI / 2);
        const circleMat = new THREE.MeshBasicMaterial({
            color: 0x88aaff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.7
        });
        const ring = new THREE.Mesh(circleGeo, circleMat);
        ring.position.set(this.playerPos.x, 0.04, this.playerPos.z);
        window.KeralaWorld.scene.add(ring);

        // Particle burst
        const partGeo = new THREE.BufferGeometry();
        const partPositions = new Float32Array(60 * 3);
        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 2;
            const r = 0.5 + Math.random() * 3;
            partPositions[i * 3] = this.playerPos.x + Math.cos(angle) * r;
            partPositions[i * 3 + 1] = Math.random() * 0.6;
            partPositions[i * 3 + 2] = this.playerPos.z + Math.sin(angle) * r;
        }
        partGeo.setAttribute('position', new THREE.BufferAttribute(partPositions, 3));
        const partMat = new THREE.PointsMaterial({ color: 0xaabbff, size: 0.08, transparent: true, opacity: 0.8 });
        const particles = new THREE.Points(partGeo, partMat);
        window.KeralaWorld.scene.add(particles);

        if (window.HorrorAudio) window.HorrorAudio.playAyasChime('calibrate');
        this.showNotification('✦ SACRED ASH DEPLOYED');

        // Repel Yakshi
        if (window.YakshiAI.position.distanceTo(this.playerPos) < 28.0) {
            window.YakshiAI.disrupt(this.playerPos);
        }

        // Fade out
        let elapsed = 0;
        const fadeInterval = setInterval(() => {
            elapsed += 0.25;
            circleMat.opacity = Math.max(0, 0.7 - elapsed / 20);
            partMat.opacity = Math.max(0, 0.8 - elapsed / 12);
            if (elapsed >= 18) {
                clearInterval(fadeInterval);
                window.KeralaWorld.scene.remove(ring);
                window.KeralaWorld.scene.remove(particles);
            }
        }, 250);
    }

    checkObjectiveZoneTriggers() {
        const curId = window.Quests.getCurrentObjective()?.id;
        if (!curId) return;

        if (curId === 1 && this.playerPos.distanceTo(new THREE.Vector3(18, 0, -85)) < 18.0) {
            window.Quests.completeObjective(1);
        } else if (curId === 3 && this.playerPos.distanceTo(new THREE.Vector3(-11, 0, -65)) < 18.0) {
            window.Quests.completeObjective(3);
        } else if (curId === 8 && window.KeralaWorld.shrineZone &&
            this.playerPos.distanceTo(window.KeralaWorld.shrineZone.position) < window.KeralaWorld.shrineZone.radius) {
            this.onPlayerWon();
        }
    }

    _showEvidenceModal(item) {
        this._evidenceModalOpen = true;
        document.exitPointerLock();

        const modal = document.getElementById('evidence-modal');
        const titleEl = document.getElementById('evidence-modal-title');
        const textEl = document.getElementById('evidence-modal-text');

        if (titleEl) titleEl.innerText = item.title;
        if (textEl) textEl.innerText = item.text;
        if (modal) modal.classList.add('active');

        // Add to journal
        this._addJournalEntry(`[ ${item.title.toUpperCase()} ]`, item.text);
    }

    closeEvidenceModal() {
        this._evidenceModalOpen = false;
        const modal = document.getElementById('evidence-modal');
        if (modal) modal.classList.remove('active');
        this.requestPointerLock();
    }

    onPlayerDied(reason) {
        this.isDead = true;
        document.exitPointerLock();
        const deathScreen = document.getElementById('death-screen');
        const reasonEl = document.getElementById('death-reason');
        if (reasonEl) reasonEl.innerText = reason;
        if (deathScreen) deathScreen.classList.add('active');
    }

    onPlayerWon() {
        this.hasWon = true;
        document.exitPointerLock();
        const winScreen = document.getElementById('victory-screen');
        if (winScreen) winScreen.classList.add('active');
    }

    togglePauseMenu() {
        if (this.isPaused) this.closePauseMenu();
        else this.openPauseMenu();
    }

    openPauseMenu() {
        this.isPaused = true;
        document.exitPointerLock();
        document.getElementById('pause-modal')?.classList.add('active');
    }

    closePauseMenu() {
        this.isPaused = false;
        document.getElementById('pause-modal')?.classList.remove('active');
        this.requestPointerLock();
    }

    toggleJournalModal() {
        const modal = document.getElementById('journal-modal');
        if (!modal) return;
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
            this.requestPointerLock();
        } else {
            modal.classList.add('active');
            document.exitPointerLock();
        }
    }

    updateHUDStats() {
        // Stamina bar
        const staminaFill = document.getElementById('stamina-fill');
        if (staminaFill) {
            staminaFill.style.width = `${(this.stamina / this.maxStamina) * 100}%`;
            staminaFill.classList.toggle('exhausted', this.isExhausted);
        }

        // Sacred Ash pouches
        const p1 = document.getElementById('ash-pouch-1');
        const p2 = document.getElementById('ash-pouch-2');
        if (p1) p1.classList.toggle('available', this.sacredAshCount >= 1);
        if (p2) p2.classList.toggle('available', this.sacredAshCount >= 2);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.GameplayApp = new AyasGameApplication();
    window.GameplayApp.init();

    updateHealthUI() {
        const healthFill = document.getElementById('health-fill');
        const healthText = document.getElementById('health-text');
        if (healthFill) {
            const pct = Math.max(0, (this.health / this.maxHealth) * 100);
            healthFill.style.width = pct + '%';
            if (pct < 25) {
                healthFill.style.background = 'linear-gradient(90deg, #ff0000, #ff3333)';
                healthFill.style.boxShadow = '0 0 10px rgba(255,0,0,0.9)';
            } else if (pct < 50) {
                healthFill.style.background = 'linear-gradient(90deg, #ff2200, #ff5533)';
                healthFill.style.boxShadow = '0 0 8px rgba(255,34,0,0.8)';
            }
        }
        if (healthText) healthText.innerText = Math.max(0, Math.floor(this.health)) + '/' + this.maxHealth;
    }
    updateLevelUI() {
        const levelEl = document.getElementById('level-indicator');
        if (levelEl) {
            if (this.currentLevel === 0) levelEl.innerText = 'TUTORIAL';
            else levelEl.innerText = this.currentLevel + ' / ' + this.maxLevels;
        }
    }
    takeDamage(amount) {
        const now = performance.now() / 1000;
        if (now - this.lastDamageTime < this.invulnTime) return;
        if (this.isDead || this.isHiding) return;
        this.lastDamageTime = now;
        this.health -= amount * this.difficultyMultiplier;
        this.updateHealthUI();
        if (this.health <= 0) {
            this.health = 0;
            this.updateHealthUI();
            this.onPlayerDied('You died to a relentless entity.');
        }
    }


    triggerConcussion(duration){
        this.isConcussed = true;
        this.concussionTimer = duration || 4.5;
        if(window.KeralaWorld){
            const ov=document.getElementById('screen-overlay');
            if(ov){ ov.style.background='radial-gradient(circle, rgba(100,100,100,0.5) 0%, rgba(0,0,0,0.98) 100%)'; setTimeout(()=>{ov.style.background='';}, (duration||4.5)*900); }
        }
    }


    useRelic(){
        if(!this.hasRelicWeapon || this.relicCharges <= 0) return;
        this.relicCharges--;
        if(document.getElementById('relic-count')) document.getElementById('relic-count').innerText = this.relicCharges;
        if(window.YakshiAI){ window.YakshiAI.disrupt(this.playerPos); if(window.YakshiAI.state === 'Hunting') window.YakshiAI.state = 'Searching'; }
        if(window.HorrorAudio) window.HorrorAudio.playWardRepairedSound();
    }
    gainRelic(){
        this.hasRelicWeapon = true;
        this.relicCharges += 3;
        const ind=document.getElementById('relic-indicator');
        if(ind){ ind.style.display='flex'; document.getElementById('relic-count').innerText = this.relicCharges; }
    }

});
