/**
 * AYAS: THE LAST WARD - Main Game Application Controller
 * First-Person Player Movement, Stamina, Head Bob, Interactions, Modals & Main Loop
 */

class AyasGameApplication {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.isDead = false;
        this.hasWon = false;

        // Player Physical Movement State
        this.playerPos = new THREE.Vector3(0, 1.7, 0);
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 0.0022;

        // Player Attributes
        this.walkSpeed = 4.2;
        this.sprintSpeed = 7.2;
        this.crouchSpeed = 2.1;
        this.isSprinting = false;
        this.isCrouched = false;
        this.isHiding = false;
        this.currentHidingSpot = null;

        // Stamina
        this.maxStamina = 100.0;
        this.stamina = 100.0;
        this.isExhausted = false;

        // Sacred Ash Pouches
        this.sacredAshCount = 2;

        // Input Tracking
        this.keys = {};
        this.isPointerLocked = false;

        // Head Bob & Footsteps
        this.headBobTimer = 0.0;
        this.footstepDist = 0.0;
        this.lastPos = new THREE.Vector3(0, 1.7, 0);

        // Interaction Progress (Hold E)
        this.interactionTarget = null;
        this.holdProgress = 0.0;
        this.isHoldingInteract = false;

        // Clock
        this.clock = new THREE.Clock();
    }

    init() {
        const container = document.getElementById('canvas-container');
        window.KeralaWorld.init(container);
        window.AyasDevice.init();
        window.YakshiAI.init(window.KeralaWorld.scene);
        window.Quests.init();

        this.setupEventListeners();
        this.updateHUDStats();

        // Game Loop
        requestAnimationFrame((time) => this.gameLoop(time));
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
            if (!this.isPointerLocked && this.isRunning && !this.isDead && !this.hasWon) {
                this.openPauseMenu();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked || this.isPaused || this.isDead || this.hasWon) return;
            this.yaw -= e.movementX * this.mouseSensitivity;
            this.pitch -= e.movementY * this.mouseSensitivity;
            this.pitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, this.pitch));

            window.KeralaWorld.camera.rotation.order = "YXZ";
            window.KeralaWorld.camera.rotation.y = this.yaw;
            window.KeralaWorld.camera.rotation.x = this.pitch;
        });

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;

            if (e.code === 'KeyF') {
                window.KeralaWorld.toggleFlashlight();
            } else if (e.code === 'KeyQ') {
                window.AyasDevice.toggleEquipped();
            } else if (e.code === 'KeyG') {
                this.deploySacredAsh();
            } else if (e.code === 'Tab') {
                e.preventDefault();
                this.toggleJournalModal();
            } else if (e.code === 'Escape') {
                e.preventDefault();
                this.togglePauseMenu();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;

            if (e.code === 'KeyE') {
                this.isHoldingInteract = false;
                this.holdProgress = 0.0;
            } else if (e.code === 'KeyR') {
                window.AyasDevice.stopCalibration();
            }
        });

        // Resume & Restart buttons
        document.getElementById('btn-resume')?.addEventListener('click', () => this.closePauseMenu());
        document.getElementById('btn-restart')?.addEventListener('click', () => location.reload());
        document.getElementById('btn-retry-death')?.addEventListener('click', () => location.reload());
        document.getElementById('btn-close-journal')?.addEventListener('click', () => this.toggleJournalModal());
        document.getElementById('btn-win-restart')?.addEventListener('click', () => location.reload());

        // Settings Sliders
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

    gameLoop(time) {
        requestAnimationFrame((t) => this.gameLoop(t));

        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (!this.isRunning || this.isPaused || this.isDead || this.hasWon) return;

        this.handleMovement(delta);
        this.handleInteraction(delta);

        // Update Systems
        window.KeralaWorld.updateRain(delta);

        const camFwd = new THREE.Vector3();
        window.KeralaWorld.camera.getWorldDirection(camFwd);

        window.AyasDevice.update(
            delta,
            this.playerPos,
            camFwd,
            window.YakshiAI.position,
            window.YakshiAI.state
        );

        window.YakshiAI.update(
            delta,
            this.playerPos,
            camFwd,
            this.isHiding,
            this.isCrouched,
            this.isSprinting,
            window.KeralaWorld.isFlashlightOn
        );

        this.checkObjectiveZoneTriggers();
        this.updateHUDStats();
        window.KeralaWorld.render();
    }

    handleMovement(delta) {
        if (this.isHiding) {
            this.velocity.set(0, 0, 0);
            return;
        }

        // Crouch Toggle
        this.isCrouched = !!this.keys['ControlLeft'] || !!this.keys['ControlRight'];
        const targetCamHeight = this.isCrouched ? 1.05 : 1.7;
        this.playerPos.y += (targetCamHeight - this.playerPos.y) * Math.min(1.0, delta * 12.0);

        // Sprint & Stamina
        const wantsSprint = !!this.keys['ShiftLeft'] && !this.isCrouched;
        if (wantsSprint && this.stamina > 0 && !this.isExhausted) {
            this.isSprinting = true;
            this.stamina = Math.max(0, this.stamina - 22.0 * delta);
            if (this.stamina <= 0) this.isExhausted = true;
        } else {
            this.isSprinting = false;
            const recovRate = this.velocity.length() < 0.2 ? 22.0 : 12.0;
            this.stamina = Math.min(this.maxStamina, this.stamina + recovRate * delta);
            if (this.stamina >= 25.0) this.isExhausted = false;
        }

        // Calculate Direction from Camera Rotation
        this.direction.set(0, 0, 0);
        if (this.keys['KeyW']) this.direction.z -= 1;
        if (this.keys['KeyS']) this.direction.z += 1;
        if (this.keys['KeyA']) this.direction.x -= 1;
        if (this.keys['KeyD']) this.direction.x += 1;
        this.direction.normalize();

        // Speed calculation
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

        // Bounds limit road flanks (-18 to +24 on X, -180 to +5 on Z)
        this.playerPos.x = Math.max(-18, Math.min(24, this.playerPos.x));
        this.playerPos.z = Math.max(-175, Math.min(5, this.playerPos.z));

        // Head Bob & Footstep Audio
        const horizontalSpeed = Math.hypot(this.velocity.x, this.velocity.z);
        if (horizontalSpeed > 0.4) {
            const bobFreq = this.isSprinting ? 14.0 : 8.5;
            const bobAmp = this.isSprinting ? 0.08 : 0.04;
            this.headBobTimer += delta * bobFreq;
            window.KeralaWorld.camera.position.y = this.playerPos.y + Math.sin(this.headBobTimer) * bobAmp;

            // Footsteps
            const distTraveled = this.lastPos.distanceTo(this.playerPos);
            this.footstepDist += distTraveled;
            const stepInterval = this.isSprinting ? 2.2 : 1.6;

            if (this.footstepDist >= stepInterval) {
                this.footstepDist = 0.0;
                let surface = 'mud';
                if (Math.abs(this.playerPos.x) > 10.0 && this.playerPos.z < -70 && this.playerPos.z > -95) {
                    surface = 'wood'; // Veranda
                } else if (this.playerPos.z < -145) {
                    surface = 'stone'; // Shrine
                }
                if (window.HorrorAudio) window.HorrorAudio.playFootstep(surface, this.isSprinting);
            }
        } else {
            this.headBobTimer = 0.0;
            window.KeralaWorld.camera.position.y = this.playerPos.y;
        }

        this.lastPos.copy(this.playerPos);
        window.KeralaWorld.camera.position.x = this.playerPos.x;
        window.KeralaWorld.camera.position.z = this.playerPos.z;

        // Calibration Hold R
        if (this.keys['KeyR']) {
            window.AyasDevice.startCalibration(horizontalSpeed);
            if (horizontalSpeed < 0.3 && window.Quests.getCurrentObjective().id === 2) {
                setTimeout(() => window.Quests.completeObjective(2), 2400);
            }
        }
    }

    handleInteraction(delta) {
        const reticle = document.getElementById('reticle');
        const promptEl = document.getElementById('interaction-prompt');

        // Raycast forward from camera center
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(0, 0), window.KeralaWorld.camera);
        raycaster.far = 3.6;

        let foundInteractable = false;

        // 1. Check Ward Stations
        for (const key in window.KeralaWorld.wardStations) {
            const ward = window.KeralaWorld.wardStations[key];
            const dist = this.playerPos.distanceTo(ward.worldPos);
            if (dist < 3.2 && ward.state !== 'Repaired') {
                foundInteractable = true;
                this.interactionTarget = ward;
                if (reticle) reticle.classList.add('active');
                if (promptEl) {
                    promptEl.innerText = `Hold [E] to splice circuit at ${ward.displayName}`;
                    promptEl.classList.add('visible');
                }

                if (this.keys['KeyE']) {
                    this.isHoldingInteract = true;
                    this.holdProgress += delta;
                    promptEl.innerText = `Splicing wires... ${Math.floor((this.holdProgress / 2.5) * 100)}%`;

                    if (this.holdProgress >= 2.5) {
                        this.repairWard(ward);
                        this.holdProgress = 0.0;
                    }
                }
                break;
            }
        }

        // 2. Check Evidence Items
        if (!foundInteractable) {
            window.KeralaWorld.evidenceItems.forEach(item => {
                if (!item.collected && this.playerPos.distanceTo(item.mesh.position) < 2.8) {
                    foundInteractable = true;
                    if (reticle) reticle.classList.add('active');
                    if (promptEl) {
                        promptEl.innerText = `Press [E] to inspect ${item.title}`;
                        promptEl.classList.add('visible');
                    }

                    if (this.keys['KeyE']) {
                        item.collected = true;
                        item.mesh.visible = false;
                        window.Quests.collectEvidence(item);
                        if (window.HorrorAudio) window.HorrorAudio.playAyasChime('ping');
                    }
                }
            });
        }

        // 3. Check Hiding Spots (Closet on Veranda)
        if (!foundInteractable) {
            window.KeralaWorld.hidingSpots.forEach(spot => {
                const dist = this.playerPos.distanceTo(spot.worldPos);
                if (dist < 2.5) {
                    foundInteractable = true;
                    if (reticle) reticle.classList.add('active');
                    if (promptEl) {
                        promptEl.innerText = this.isHiding ? `Press [E] to step out` : `Press [E] to hide inside rice bin`;
                        promptEl.classList.add('visible');
                    }

                    if (this.keys['KeyE'] && !this.isHoldingInteract) {
                        this.isHoldingInteract = true;
                        this.toggleHiding(spot);
                    }
                }
            });
        }

        if (!foundInteractable) {
            if (reticle) reticle.classList.remove('active');
            if (promptEl) promptEl.classList.remove('visible');
            this.interactionTarget = null;
            this.holdProgress = 0.0;
        }
    }

    repairWard(ward) {
        ward.state = 'Repaired';
        ward.statusLight.material.color.setHex(0x00f0ff);
        if (window.HorrorAudio) window.HorrorAudio.playWardRepairedSound();

        // Update Ward HUD Dots
        const dot = document.getElementById(`ward-dot-${ward.id.toLowerCase().replace('ward', '')}`);
        if (dot) {
            dot.className = 'ward-dot repaired';
        }

        // Advance Objectives
        if (ward.id === 'WardA' && window.Quests.getCurrentObjective().id === 4) {
            window.Quests.completeObjective(4);
        } else if (ward.id === 'WardB' && window.Quests.getCurrentObjective().id === 5) {
            window.Quests.completeObjective(5);
        } else if (ward.id === 'WardC' && window.Quests.getCurrentObjective().id === 7) {
            window.Quests.completeObjective(7);
        }

        // Repel Yakshi if close
        if (window.YakshiAI.position.distanceTo(ward.worldPos) < 24.0) {
            window.YakshiAI.disrupt(ward.worldPos);
        }
    }

    toggleHiding(spot) {
        if (!this.isHiding) {
            this.isHiding = true;
            this.currentHidingSpot = spot;
            this.playerPos.copy(spot.worldPos);
            window.KeralaWorld.camera.position.copy(this.playerPos);
        } else {
            this.isHiding = false;
            this.playerPos.copy(spot.exitPos);
            window.KeralaWorld.camera.position.copy(this.playerPos);
            this.currentHidingSpot = null;
        }
    }

    deploySacredAsh() {
        if (this.sacredAshCount <= 0) return;
        this.sacredAshCount--;

        // Spawn glowing protective circle mesh
        const circleGeo = new THREE.RingGeometry(0.2, 3.5, 32);
        circleGeo.rotateX(-Math.PI / 2);
        const circleMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
        const ring = new THREE.Mesh(circleGeo, circleMat);
        ring.position.set(this.playerPos.x, 0.05, this.playerPos.z);
        window.KeralaWorld.scene.add(ring);

        if (window.HorrorAudio) window.HorrorAudio.playAyasChime('calibrate');

        // Repel Yakshi if within 25m
        if (window.YakshiAI.position.distanceTo(this.playerPos) < 25.0) {
            window.YakshiAI.disrupt(this.playerPos);
        }

        // Fade out barrier after 16 seconds
        setTimeout(() => {
            window.KeralaWorld.scene.remove(ring);
        }, 16000);
    }

    checkObjectiveZoneTriggers() {
        const curObjId = window.Quests.getCurrentObjective().id;

        // Objective 1: Approach Ancestral House
        if (curObjId === 1 && this.playerPos.distanceTo(new THREE.Vector3(18, 0, -85)) < 16.0) {
            window.Quests.completeObjective(1);
        }
        // Objective 3: Approach Pala Tree
        else if (curObjId === 3 && this.playerPos.distanceTo(new THREE.Vector3(-11, 0, -65)) < 16.0) {
            window.Quests.completeObjective(3);
        }
        // Objective 8: Enter Sacred Shrine (Final Victory Condition!)
        else if (curObjId === 8 && this.playerPos.distanceTo(window.KeralaWorld.shrineZone.position) < window.KeralaWorld.shrineZone.radius) {
            this.onPlayerWon();
        }
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
        const staminaFill = document.getElementById('stamina-fill');
        const ashVal = document.getElementById('ash-count-val');

        if (staminaFill) {
            staminaFill.style.width = `${(this.stamina / this.maxStamina) * 100}%`;
            if (this.isExhausted) staminaFill.classList.add('exhausted');
            else staminaFill.classList.remove('exhausted');
        }

        if (ashVal) {
            ashVal.innerText = `${this.sacredAshCount}`;
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.GameplayApp = new AyasGameApplication();
    window.GameplayApp.init();
});
