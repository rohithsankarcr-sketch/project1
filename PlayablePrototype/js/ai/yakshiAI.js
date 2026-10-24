/**
 * AYAS: THE LAST WARD - Yakshi AI Entity v2.0
 * Frightening Kerala Folklore Entity — Random Timed Spawns at Unexpected Locations,
 * Jump Scare System, Environmental Disturbance Effects, Adaptive Threat Escalation
 */

class YakshiEntity {
    constructor() {
        this.mesh = null;
        this.state = 'Dormant';
        this.position = new THREE.Vector3(0, -50, 0); // off-world initially
        this.velocity = new THREE.Vector3();

        // AI Speeds
        this.stalkSpeed = 5.5;
        this.huntSpeed = 12.0;
        this.retreatSpeed = 12.0;
        this.currentSpeed = 0;

        // Timers & Cooldowns
        this.stateTimer = 0.0;
        this.lureCooldown = 10.0;
        this.ankletTimer = 0.0;
        this.searchTimer = 0.0;
        this.randomSpawnTimer = 0.0;
        this.randomSpawnInterval = 18 + Math.random() * 22; // more frequent random spawns 18-40s

        // Scare & Jump Scare System
        this.jumpScareTimer = 0.0;
        this.jumpScareCooldown = 22.0;
        this.hasJumpScared = false;
        this.disappearTimer = 0.0;

        // Perception
        this.hasLineOfSight = false;
        this.lastKnownPlayerPos = new THREE.Vector3();
        this.isDisrupted = false;

        // Visual animation
        this._bobTimer = 0;
        this._glitchTimer = 0;
        this._scaredAlpha = 0.92;

        // Spawn zone pool (unexpected locations throughout the map) - more varied
        this.spawnZones = [
            // Behind trees where player wouldn't normally look
            new THREE.Vector3(-10, 0, -18),
            new THREE.Vector3(8, 0, -35),
            new THREE.Vector3(-16, 0, -48),
            new THREE.Vector3(12, 0, -62),
            new THREE.Vector3(-18, 0, -70),  // near Pala tree - very unexpected
            new THREE.Vector3(-5, 0, -82),
            new THREE.Vector3(16, 0, -88),   // near house flank
            new THREE.Vector3(-12, 0, -98),
            new THREE.Vector3(10, 0, -115),
            new THREE.Vector3(-14, 0, -128),
            new THREE.Vector3(4, 0, -142),   // near shrine road
            new THREE.Vector3(-8, 0, -25),
            new THREE.Vector3(6, 0, -52),
        ];

        this.activeSpawnIndex = -1;
    }

    init(scene) {
        const group = new THREE.Group();

        // Kasavu Saree — off-white Kerala silk with subtle iridescence
        const dressMat = new THREE.MeshStandardMaterial({
            color: 0xe8e4dc,
            roughness: 0.65,
            metalness: 0.08,
            transparent: true,
            opacity: 0.0,  // starts invisible
            emissive: 0x101008,
            emissiveIntensity: 0.5
        });

        // Gold border of the Kasavu (traditional Kerala saree gold border)
        const borderMat = new THREE.MeshStandardMaterial({
            color: 0xc8981e,
            roughness: 0.3,
            metalness: 0.7,
            transparent: true,
            opacity: 0.0,
            emissive: 0x8a6a00,
            emissiveIntensity: 0.4
        });

        // Long dark hair
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x020100,
            roughness: 0.98,
            transparent: true,
            opacity: 0.0
        });

        // Pale supernatural skin
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xccc8c0,
            roughness: 0.72,
            transparent: true,
            opacity: 0.0,
            emissive: 0x080806,
            emissiveIntensity: 0.3
        });

        // Eyes — deep dark with subtle supernatural gleam
        const eyeMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.0
        });

        // Body (saree silhouette — tapered Kerala style)
        const bodyGeo = new THREE.CylinderGeometry(0.2, 0.5, 1.95, 12);
        const body = new THREE.Mesh(bodyGeo, dressMat);
        body.position.y = 0.98;
        body.castShadow = true;
        group.add(body);

        // Saree gold border strip at hem
        const borderGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.08, 12);
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.y = 0.04;
        group.add(border);

        // Draping pleats detail
        for (let p = 0; p < 6; p++) {
            const angle = (p / 6) * Math.PI * 2;
            const pleat = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 1.8, 0.12),
                dressMat
            );
            pleat.position.set(Math.cos(angle) * 0.45, 0.98, Math.sin(angle) * 0.45);
            pleat.rotation.y = angle;
            group.add(pleat);
        }

        // Neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.22, 8), skinMat);
        neck.position.y = 1.97;
        group.add(neck);

        // Head (slightly elongated — supernatural distortion)
        const headGeo = new THREE.SphereGeometry(0.185, 14, 14);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 2.2;
        head.scale.set(1.0, 1.12, 1.0);
        group.add(head);

        // Dark deep-set eyes
        const eyeGeo = new THREE.SphereGeometry(0.028, 6, 6);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(-0.065, 2.22, 0.17);
        group.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(0.065, 2.22, 0.17);
        group.add(rightEye);

        // Long flowing hair (floor-length — Kerala Yakshi signature)
        const hairBodyGeo = new THREE.BoxGeometry(0.3, 2.15, 0.18);
        const hairBody = new THREE.Mesh(hairBodyGeo, hairMat);
        hairBody.position.set(0, 1.22, -0.16);
        group.add(hairBody);

        // Hair tendrils hanging around face
        for (let h = 0; h < 4; h++) {
            const tendril = new THREE.Mesh(
                new THREE.CylinderGeometry(0.018, 0.008, 0.9, 4),
                hairMat
            );
            tendril.position.set(-0.14 + h * 0.09, 1.72, 0.1);
            tendril.rotation.z = (h - 1.5) * 0.18;
            group.add(tendril);
        }

        // Arms (outstretched slightly at sides when stalking)
        const armMat = new THREE.MeshStandardMaterial({
            color: 0xccc8c0, roughness: 0.72, transparent: true, opacity: 0.0
        });
        [-0.28, 0.28].forEach((ax, ai) => {
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.95, 7), armMat);
            arm.position.set(ax, 1.65, 0);
            arm.rotation.z = (ai === 0 ? 1 : -1) * 0.35;
            group.add(arm);
        });

        // Eerie supernatural aura — pale green-white glow (will-o-wisp style)
        const auraLight = new THREE.PointLight(0x6fffff, 0, 6, 2.5);
        auraLight.position.set(0, 1.2, 0);
        group.add(auraLight);
        this._auraLight = auraLight;

        // Collect all materials for opacity animation
        this._materials = [dressMat, borderMat, hairMat, skinMat, eyeMat, armMat];

        group.position.set(0, -30, 0);
        group.visible = false;
        scene.add(group);
        this.mesh = group;

        // Start the random spawn cycle
        this._scheduleNextRandomSpawn();
    }

    _scheduleNextRandomSpawn() {
        this.randomSpawnTimer = this.randomSpawnInterval;
    }

    spawnAt(x, y, z) {
        this.position.set(x, y, z);
        this.mesh.position.copy(this.position);
        this.mesh.visible = true;
        this.state = 'Stalking';
        this._fadeIn(1.8);
    }

    _spawnRandom(playerPos) {
        // Pick a spawn zone far enough from player (min 15m)
        const available = this.spawnZones.filter(z => z.distanceTo(playerPos) > 15);
        if (available.length === 0) return;

        const zone = available[Math.floor(Math.random() * available.length)];

        // Determine spawn behavior — sometimes visible scare, sometimes invisible stalk
        const spawnType = Math.random();

        this.position.set(zone.x, 0, zone.z);
        this.mesh.position.copy(this.position);
        this.mesh.visible = true;

        if (spawnType < 0.48) {
            // JUMP SCARE — spawn very close, briefly visible, then retreat
            this._doJumpScare(playerPos, zone);
        } else if (spawnType < 0.78) {
            // Silent stalk — appear in darkness, start hunting
            this.state = 'Stalking';
            this._fadeIn(1.9);
        } else {
            // T-pose silhouette in darkness (like seen between trees)
            this.state = 'Stalking';
            this._fadeIn(1.6);
            // Create distant view behind tree
            if (window.KeralaWorld) {
                window.KeralaWorld.triggerFlashlightFlicker(0.8);
            }
        }

        if (window.HorrorAudio) {
            // Random horror audio cue on spawn
            const cues = ['anklet', 'whisper', 'breath'];
            const cue = cues[Math.floor(Math.random() * cues.length)];
            if (cue === 'anklet') window.HorrorAudio.playAnkletChime(zone.x - playerPos.x, zone.z - playerPos.z);
            else if (cue === 'whisper') window.HorrorAudio.playYakshiWhisper("Evideya...", zone.x, zone.z);
        }
    }

    _doJumpScare(playerPos, zone) {
        if (this.jumpScareCooldown > 0) return;
        this.jumpScareCooldown = 45;

        // Spawn very close
        const dir = new THREE.Vector3().subVectors(playerPos, zone).normalize();
        const scarePos = playerPos.clone().add(dir.clone().multiplyScalar(-5));
        scarePos.y = 0;

        this.position.copy(scarePos);
        this.mesh.position.copy(this.position);
        this.mesh.visible = true;
        this.state = 'Hunting';

        // Face player
        this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

        // Flash in full opacity
        this._setOpacity(0.95);
        if (this._auraLight) this._auraLight.intensity = 2.5;

        // Trigger flashlight flicker
        if (window.KeralaWorld) window.KeralaWorld.triggerFlashlightFlicker(2.0);

        // Blast stinger audio
        if (window.HorrorAudio) window.HorrorAudio.playJumpScareStinger();

        // Show jump scare overlay
        this._showJumpScareOverlay();

        // After 1.5s — retreat and go dormant temporarily
        setTimeout(() => {
            this.state = 'Disrupted';
            this._fadeOut(1.0);
            setTimeout(() => {
                this.mesh.visible = false;
                this._setOpacity(0);
                this.position.set(0, -30, 0);
                this.mesh.position.copy(this.position);
                this.state = 'Stalking';
                this._scheduleNextRandomSpawn();
            }, 1200);
        }, 1500);
    }

    _showJumpScareOverlay() {
        const overlay = document.getElementById('screen-overlay');
        if (!overlay) return;
        overlay.style.background = 'radial-gradient(ellipse at center, rgba(255,20,20,0.85) 0%, rgba(0,0,0,0.98) 70%)';
        overlay.style.opacity = '1';
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.background = ''; }, 500);
        }, 800);
    }

    _fadeIn(duration) {
        const steps = 30;
        const stepTime = (duration * 1000) / steps;
        let step = 0;
        const interval = setInterval(() => {
            step++;
            const alpha = (step / steps) * this._scaredAlpha;
            this._setOpacity(alpha);
            if (this._auraLight) this._auraLight.intensity = (step / steps) * 0.8;
            if (step >= steps) clearInterval(interval);
        }, stepTime);
    }

    _fadeOut(duration) {
        const steps = 20;
        const stepTime = (duration * 1000) / steps;
        let step = 0;
        const currentOpacity = this._scaredAlpha;
        const interval = setInterval(() => {
            step++;
            const alpha = currentOpacity * (1 - step / steps);
            this._setOpacity(alpha);
            if (this._auraLight) this._auraLight.intensity = (1 - step / steps) * 0.8;
            if (step >= steps) clearInterval(interval);
        }, stepTime);
    }

    _setOpacity(alpha) {
        if (this._materials) {
            this._materials.forEach(mat => { mat.opacity = alpha; });
        }
    }

    disrupt(repelFromPos) {
        this.state = 'Disrupted';
        this.isDisrupted = true;
        this.stateTimer = 0.0;

        if (window.HorrorAudio) window.HorrorAudio.playDisruptionScream();

        // Violent recoil
        const awayDir = new THREE.Vector3().subVectors(this.position, repelFromPos).normalize();
        awayDir.y = 0;
        this.velocity.copy(awayDir).multiplyScalar(this.retreatSpeed);

        // Fade out as disrupted
        this._fadeOut(1.5);
    }

    update(delta, playerPos, playerCamFwd, isPlayerHiding, isPlayerCrouched, isPlayerSprinting, flashlightOn) {
        if (!this.mesh) return;

        // Decrement timers
        this.stateTimer += delta;
        this.lureCooldown -= delta;
        this.jumpScareCooldown -= delta;

        // Random spawn cycle (independent of quest state)
        if (this.state !== 'Dormant' || this.randomSpawnTimer <= 0) {
            this.randomSpawnTimer -= delta;
            if (this.randomSpawnTimer <= 0 && (this.state === 'Dormant' || this.state === 'Stalking')) {
                this.randomSpawnTimer = this.randomSpawnInterval + Math.random() * 20;
                this._spawnRandom(playerPos);
            }
        }

        if (this.state === 'Dormant') return;

        const distToPlayer = this.position.distanceTo(playerPos);

        // Update audio threat level
        if (window.HorrorAudio) {
            const threat = Math.max(0, Math.min(1, 1.0 - distToPlayer / 30.0));
            window.HorrorAudio.setThreatLevel(threat);
        }

        // Visual animation — floating bob & glitch
        this._bobTimer += delta;
        this._glitchTimer += delta;

        if (this.mesh.visible && this.state !== 'Disrupted') {
            // Eerie floating effect
            this.mesh.position.y = 0.08 * Math.sin(this._bobTimer * 1.6);

            // Random glitch — very brief teleport / distortion
            if (this._glitchTimer > 4.0 + Math.random() * 8 && (this.state === 'Stalking' || this.state === 'Luring')) {
                this._glitchTimer = 0;
                const glitchOffset = new THREE.Vector3(
                    (Math.random() - 0.5) * 4.5,
                    0,
                    (Math.random() - 0.5) * 4.5
                );
                this.position.add(glitchOffset);
                if (window.KeralaWorld) window.KeralaWorld.triggerFlashlightFlicker(0.6);
                if (Math.random() < 0.3 && window.HorrorAudio) {
                    window.HorrorAudio.playYakshiWhisper("Koodi vaa...", this.position.x, this.position.z);
                }
            }
        }

        this.checkLineOfSight(playerPos, isPlayerHiding, isPlayerCrouched, flashlightOn);

        // ─── STATE MACHINE ───

        // DISRUPTED
        if (this.state === 'Disrupted') {
            this.position.addScaledVector(this.velocity, delta);
            this.velocity.multiplyScalar(0.88); // friction
            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;

            if (this.stateTimer > 5.0 || distToPlayer > 40.0) {
                this.isDisrupted = false;
                this.state = 'Repositioning';
                this.stateTimer = 0.0;
            }
            return;
        }

        // HUNTING
        if (this.state === 'Hunting') {
            if (typeof this.pursuitTimer === 'undefined') this.pursuitTimer = 0;
            this.pursuitTimer += delta;
            if (isPlayerHiding || this.pursuitTimer > this.maxPursuitTime || distToPlayer > 32.0) {
                this.state = 'Searching';
                this.searchTimer = 0.0;
                this.pursuitTimer = 0;
                return;
            }
            const dir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
            dir.y = 0;
            this.position.addScaledVector(dir, this.huntSpeed * delta);
            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
            this._setOpacity(this._scaredAlpha);
            if (this._auraLight) this._auraLight.intensity = 1.8;
            if (distToPlayer < 3.4) {
                if (window.GameplayApp && typeof window.GameplayApp.takeDamage === 'function') {
                    window.GameplayApp.takeDamage(45);
                    if (window.GameplayApp.health <= 0) {
                        window.GameplayApp.health = 0;
                        if (typeof window.GameplayApp.updateHealthUI === 'function') window.GameplayApp.updateHealthUI();
                        window.GameplayApp.onPlayerDied('The entity caught you.');
                        return;
                    }
                }
                this.state = 'Searching';
                this.searchTimer = 0.0;
                this.pursuitTimer = 0;
                return;
            }
            if (!this.hasLineOfSight && distToPlayer > 15.0) {
                this.state = 'Searching';
                this.searchTimer = 0.0;
                this.lastKnownPlayerPos.copy(playerPos);
                this.pursuitTimer = 0;
            }
            return;
        }

        // SEARCHING — going to last known position
        if (this.state === 'Searching') {
            this.searchTimer += delta;
            const toLast = new THREE.Vector3().subVectors(this.lastKnownPlayerPos, this.position);
            toLast.y = 0;

            if (toLast.length() > 2.0) {
                toLast.normalize();
                this.position.addScaledVector(toLast, this.stalkSpeed * 1.2 * delta);
                this.mesh.position.x = this.position.x;
                this.mesh.position.z = this.position.z;
                this.mesh.lookAt(
                    this.lastKnownPlayerPos.x, this.mesh.position.y, this.lastKnownPlayerPos.z
                );
            }

            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
            } else if (this.searchTimer > 8.0) {
                this.state = 'Stalking';
            }
            return;
        }

        // INVESTIGATING — attracted by noise
        if (this.state === 'Investigating') {
            const toNoise = new THREE.Vector3().subVectors(this.lastKnownPlayerPos, this.position);
            toNoise.y = 0;
            if (toNoise.length() > 2.0) {
                toNoise.normalize();
                this.position.addScaledVector(toNoise, this.stalkSpeed * 1.5 * delta);
                this.mesh.position.x = this.position.x;
                this.mesh.position.z = this.position.z;
            } else {
                this.state = 'Stalking';
            }
            if (this.hasLineOfSight && !isPlayerHiding) this.state = 'Hunting';
            return;
        }

        // REPOSITIONING — move to new flank
        if (this.state === 'Repositioning') {
            // Choose a position off to player's flank, behind vegetation
            const angle = Math.random() * Math.PI * 2;
            const dist = 18 + Math.random() * 10;
            this.position.set(
                playerPos.x + Math.cos(angle) * dist,
                0,
                playerPos.z + Math.sin(angle) * dist
            );
            this.position.x = Math.max(-16, Math.min(20, this.position.x));
            this.position.z = Math.max(-170, Math.min(3, this.position.z));

            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;
            this._fadeIn(2.0);
            this.state = 'Stalking';
            this.stateTimer = 0.0;
            return;
        }

        // STALKING / LURING
        if (this.state === 'Stalking' || this.state === 'Luring') {
            // If sees player → hunt!
            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
                if (window.KeralaWorld) window.KeralaWorld.triggerFlashlightFlicker(2.0);
                return;
            }

            // Sprint noise detection
            if (isPlayerSprinting && distToPlayer < 32.0) {
                this.state = 'Investigating';
                this.lastKnownPlayerPos.copy(playerPos);
                return;
            }

            // Circling movement — keep 14-22m radius but move laterally
            if (distToPlayer > 24.0) {
                const toPlayer = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
                toPlayer.y = 0;
                this.position.addScaledVector(toPlayer, this.stalkSpeed * delta);
                this.mesh.position.x = this.position.x;
                this.mesh.position.z = this.position.z;
            } else {
                // Circle around player
                const perpAngle = Math.atan2(
                    this.position.z - playerPos.z,
                    this.position.x - playerPos.x
                ) + 0.4 * delta;
                const orbitR = 16;
                this.position.x = playerPos.x + Math.cos(perpAngle) * orbitR;
                this.position.z = playerPos.z + Math.sin(perpAngle) * orbitR;
                this.mesh.position.x = this.position.x;
                this.mesh.position.z = this.position.z;
            }

            // Face player
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

            // Anklet bells — spatial audio based on relative position
            this.ankletTimer += delta;
            if (this.ankletTimer > 3.5 + Math.random() * 3 && distToPlayer < 30.0) {
                this.ankletTimer = 0.0;
                if (window.HorrorAudio) {
                    const relX = this.position.x - playerPos.x;
                    const relZ = this.position.z - playerPos.z;
                    window.HorrorAudio.playAnkletChime(relX, relZ);
                }
            }

            // Voice lure
            if (this.lureCooldown <= 0.0 && distToPlayer < 28.0) {
                this.lureCooldown = 18.0 + Math.random() * 16.0;
                this.state = 'Luring';

                if (window.HorrorAudio) {
                    // Spatial offset to mislead player direction
                    const fakeOffset = (Math.random() - 0.5) * 10.0;
                    const fakeZ = (Math.random() - 0.5) * 10.0;
                    window.HorrorAudio.playYakshiWhisper("Evideya...", this.position.x + fakeOffset, this.position.z + fakeZ);
                }
                if (window.AyasDevice) window.AyasDevice.registerVoiceLure(0.94);

                setTimeout(() => { if (this.state === 'Luring') this.state = 'Stalking'; }, 2800);
            }
        }
    }

    checkLineOfSight(playerPos, isPlayerHiding, isPlayerCrouched, flashlightOn) {
        if (isPlayerHiding) {
            this.hasLineOfSight = false;
            return;
        }

        const dist = this.position.distanceTo(playerPos);
        let maxSight = 22.0;

        if (isPlayerCrouched) maxSight *= 0.48;
        if (flashlightOn) maxSight *= 1.45;

        this.hasLineOfSight = dist <= maxSight;
    }

    _triggerAttack() {
        this.state = 'Attack';
        this._setOpacity(0.98);
        if (this._auraLight) this._auraLight.intensity = 3.5;

        if (window.HorrorAudio) window.HorrorAudio.playAttackStinger();
        if (window.KeralaWorld) window.KeralaWorld.triggerFlashlightFlicker(99);

        // Full-screen red flash
        this._showJumpScareOverlay();

        setTimeout(() => {
            if (window.GameplayApp) {
                window.GameplayApp.onPlayerDied("The Yakshi claimed your life along the Pala Road.");
            }
        }, 600);
    }

    // Called by QuestManager when story progression requires a spawn
    spawnStoryEvent(phase) {
        if (phase === 'pala_tree') {
            this.spawnAt(-14, 0, -70);
        } else if (phase === 'house_breach') {
            this.spawnAt(14, 0, -90);
        } else if (phase === 'final_chase') {
            this.state = 'Hunting';
            this.huntSpeed = 7.5;
            if (!this.mesh.visible) {
                this.spawnAt(0, 0, -130);
            }
        }
    }
}

window.YakshiAI = new YakshiEntity();
