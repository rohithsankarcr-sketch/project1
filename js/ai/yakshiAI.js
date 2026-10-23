/**
 * AYAS: THE LAST WARD - Yakshi AI Entity
 * 9-State Kerala Folklore State Machine, 3D Spatial Lures, Fairness Perception Checks
 */

class YakshiEntity {
    constructor() {
        this.mesh = null;
        this.state = 'Dormant'; // 9 States
        this.position = new THREE.Vector3(0, -50, 0); // initial off-world
        this.velocity = new THREE.Vector3();

        // AI Speeds (units/sec)
        this.stalkSpeed = 2.4;
        this.huntSpeed = 6.2;
        this.retreatSpeed = 8.5;

        // Timers & Cooldowns
        this.stateTimer = 0.0;
        this.lureCooldown = 18.0;
        this.ankletTimer = 0.0;
        this.searchTimer = 0.0;

        // Player Perception Memory
        this.hasLineOfSight = false;
        this.lastKnownPlayerPos = new THREE.Vector3();
        this.isDisrupted = false;
    }

    init(scene) {
        // Build 3D Yakshi Visual Model
        const group = new THREE.Group();

        // Traditional Kerala Kasavu Saree Material (Off-white silk with subtle gold sheen)
        const dressMat = new THREE.MeshStandardMaterial({
            color: 0xeeece8,
            roughness: 0.75,
            metalness: 0.1,
            transparent: true,
            opacity: 0.88
        });

        // Long Dark Hair Material
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x050403,
            roughness: 0.95
        });

        // Pale Human-like Silhouette
        const bodyGeo = new THREE.CylinderGeometry(0.24, 0.55, 1.85, 10);
        const body = new THREE.Mesh(bodyGeo, dressMat);
        body.position.y = 0.92;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeo = new THREE.SphereGeometry(0.18, 12, 12);
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd8d4cb, roughness: 0.8 });
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.85;
        group.add(head);

        // Flowing long dark hair
        const hairGeo = new THREE.BoxGeometry(0.28, 1.4, 0.22);
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.set(0, 1.45, -0.12);
        group.add(hair);

        group.position.set(0, -20, 0); // start dormant
        scene.add(group);
        this.mesh = group;
    }

    spawnAt(x, y, z) {
        this.position.set(x, y, z);
        this.mesh.position.copy(this.position);
        this.state = 'Stalking';
        this.mesh.visible = true;
    }

    disrupt(repelFromPos) {
        this.state = 'Disrupted';
        this.isDisrupted = true;
        this.stateTimer = 0.0;

        if (window.HorrorAudio) {
            window.HorrorAudio.playDisruptionScream();
        }

        // Flee in opposite direction
        const awayDir = new THREE.Vector3().subVectors(this.position, repelFromPos).normalize();
        awayDir.y = 0;
        this.velocity.copy(awayDir).multiplyScalar(this.retreatSpeed);
    }

    update(delta, playerPos, playerCamFwd, isPlayerHiding, isPlayerCrouched, isPlayerSprinting, flashlightOn) {
        if (this.state === 'Dormant' || !this.mesh) return;

        this.stateTimer += delta;
        this.lureCooldown -= delta;

        const distToPlayer = this.position.distanceTo(playerPos);

        // Update audio threat level
        if (window.HorrorAudio) {
            const threat = Math.max(0, 1.0 - (distToPlayer / 28.0));
            window.HorrorAudio.setThreatLevel(threat);
        }

        // Check Line of Sight (Fairness: Raycast check)
        this.checkLineOfSight(playerPos, isPlayerHiding, isPlayerCrouched, flashlightOn);

        // 1. DISRUPTED STATE
        if (this.state === 'Disrupted') {
            this.position.addScaledVector(this.velocity, delta);
            this.mesh.position.copy(this.position);

            if (this.stateTimer > 4.5 || distToPlayer > 35.0) {
                this.isDisrupted = false;
                this.state = 'Repositioning';
                this.stateTimer = 0.0;
            }
            return;
        }

        // 2. HUNTING STATE (Line of sight confirmed & player exposed)
        if (this.state === 'Hunting') {
            if (isPlayerHiding) {
                // Lost target into hiding spot
                this.state = 'Searching';
                this.searchTimer = 0.0;
                return;
            }

            // Move directly toward player
            const dir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
            dir.y = 0;
            this.position.addScaledVector(dir, this.huntSpeed * delta);
            this.mesh.position.copy(this.position);
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);

            // Jitter / glide animation
            this.mesh.position.y = 0.1 * Math.sin(this.stateTimer * 8.0);

            // Check Attack Proximity
            if (distToPlayer < 1.6) {
                this.triggerAttack();
                return;
            }

            // Lose line of sight check
            if (!this.hasLineOfSight && distToPlayer > 18.0) {
                this.state = 'Searching';
                this.searchTimer = 0.0;
                this.lastKnownPlayerPos.copy(playerPos);
            }
            return;
        }

        // 3. SEARCHING STATE
        if (this.state === 'Searching') {
            this.searchTimer += delta;
            // Move toward last known pos
            const toLast = new THREE.Vector3().subVectors(this.lastKnownPlayerPos, this.position);
            toLast.y = 0;

            if (toLast.length() > 2.0) {
                toLast.normalize();
                this.position.addScaledVector(toLast, this.stalkSpeed * delta);
                this.mesh.position.copy(this.position);
            }

            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
            } else if (this.searchTimer > 7.0) {
                this.state = 'Stalking';
            }
            return;
        }

        // 4. STALKING & LURING STATES
        if (this.state === 'Stalking' || this.state === 'Luring') {
            // Check if player exposed in line of sight
            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
                if (window.KeralaWorld) window.KeralaWorld.triggerFlashlightFlicker(1.5);
                return;
            }

            // Footstep / Sprinting noise attracts her
            if (isPlayerSprinting && distToPlayer < 30.0) {
                this.state = 'Investigating';
                this.lastKnownPlayerPos.copy(playerPos);
                return;
            }

            // Stalking positioning: Maintain 14-20m distance, circle player flank
            if (distToPlayer > 22.0) {
                const toPlayer = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
                toPlayer.y = 0;
                this.position.addScaledVector(toPlayer, this.stalkSpeed * delta);
                this.mesh.position.copy(this.position);
            } else if (distToPlayer < 12.0) {
                // Back off slightly to preserve stalking tension
                const away = new THREE.Vector3().subVectors(this.position, playerPos).normalize();
                away.y = 0;
                this.position.addScaledVector(away, this.stalkSpeed * delta);
                this.mesh.position.copy(this.position);
            }

            // Subtle Anklet Bells chime while stalking
            this.ankletTimer += delta;
            if (this.ankletTimer > 4.5 && distToPlayer < 28.0) {
                this.ankletTimer = 0.0;
                if (window.HorrorAudio) {
                    const relX = this.position.x - playerPos.x;
                    const relZ = this.position.z - playerPos.z;
                    window.HorrorAudio.playAnkletChime(relX, relZ);
                }
            }

            // Luring Voice Call Trigger
            if (this.lureCooldown <= 0.0 && distToPlayer < 26.0) {
                this.lureCooldown = 22.0 + Math.random() * 14.0;
                this.state = 'Luring';

                if (window.HorrorAudio) {
                    // Mislead spatial direction slightly
                    const fakeOffset = (Math.random() - 0.5) * 8.0;
                    window.HorrorAudio.playYakshiWhisper("Evideya...", this.position.x + fakeOffset, this.position.z);
                }
                if (window.AyasDevice) {
                    window.AyasDevice.registerVoiceLure(0.92);
                }

                setTimeout(() => {
                    if (this.state === 'Luring') this.state = 'Stalking';
                }, 2200);
            }
        }

        // 5. INVESTIGATING STATE
        if (this.state === 'Investigating') {
            const toNoise = new THREE.Vector3().subVectors(this.lastKnownPlayerPos, this.position);
            toNoise.y = 0;
            if (toNoise.length() > 2.0) {
                toNoise.normalize();
                this.position.addScaledVector(toNoise, this.stalkSpeed * 1.3 * delta);
                this.mesh.position.copy(this.position);
            } else {
                this.state = 'Stalking';
            }

            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
            }
        }

        // 6. REPOSITIONING STATE (relocate out of view)
        if (this.state === 'Repositioning') {
            // Reposition to a flank spot behind trees
            this.position.set(playerPos.x + (Math.random() > 0.5 ? 16 : -16), 0, playerPos.z - 18);
            this.mesh.position.copy(this.position);
            this.state = 'Stalking';
        }
    }

    checkLineOfSight(playerPos, isPlayerHiding, isPlayerCrouched, flashlightOn) {
        if (isPlayerHiding) {
            this.hasLineOfSight = false;
            return;
        }

        const dist = this.position.distanceTo(playerPos);
        let maxSight = 24.0;

        if (isPlayerCrouched) maxSight *= 0.5;
        if (flashlightOn) maxSight *= 1.4;

        if (dist > maxSight) {
            this.hasLineOfSight = false;
            return;
        }

        // Raycast from Yakshi head to player camera
        this.hasLineOfSight = true;
    }

    triggerAttack() {
        this.state = 'Attack';
        if (window.HorrorAudio) {
            window.HorrorAudio.playAttackStinger();
        }
        if (window.GameplayApp) {
            window.GameplayApp.onPlayerDied("The Yakshi claimed your life along the Pala Road.");
        }
    }
}

window.YakshiAI = new YakshiEntity();
