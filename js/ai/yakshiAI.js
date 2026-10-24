/**
 * AYAS: THE LAST WARD - Jessica "Jess" Miller Ghost AI Entity v3.0
 * 
 * Replaces the folkloric antagonist with Jessica Miller:
 * A 20-year-old college student who disappeared in 1995.
 * 
 * Character Traits:
 * - 1990s grunge appearance: messy blowout hair, oversized flannel shirt,
 *   faded band tee, torn denim jeans, scuffed combat boots.
 * - NO NORMAL CAST SHADOW (castShadow = false on all meshes).
 * - Bound to her yellow sports Walkman anchor ("Chill Mix '95", 15 ft / 4.57m max range).
 * - Full 12-state AI: Dormant, Manifesting, Stalking, Investigating, Luring,
 *   Hunting, Attacking, Searching, Panicked, Repositioning, Disrupted, Recovering.
 * - Attack cooldown & direct damage integration with player health.
 */

class JessEntity {
    constructor() {
        this.name = "Jessica 'Jess' Miller";
        this.mesh = null;
        this.state = 'Stalking'; // Starts active in the village, not permanently dormant
        this.position = new THREE.Vector3(14, 0, -82); // Near ancestral house veranda
        this.velocity = new THREE.Vector3();

        // AI Speeds
        this.stalkSpeed = 3.6;
        this.huntSpeed = 8.2;
        this.retreatSpeed = 10.0;
        this.currentSpeed = 0;

        // Anchor Tether Limits (15 ft = 4.572m)
        this.maxAnchorDistance = 4.572;
        this.anchorEnforced = true;

        // Timers & Cooldowns
        this.stateTimer = 0.0;
        this.lureCooldown = 12.0;
        this.searchTimer = 0.0;
        this.attackCooldown = 0.0;
        this.attackInterval = 1.8; // Safe cooldown between attacks
        this.panicTimer = 0.0;
        this.recoveringTimer = 0.0;
        this.manifestTimer = 0.0;
        this.maxPursuitTime = 16.0; // How long she chases before breaking off
        this.pursuitTimer = 0.0;

        // Unexpected respawn system
        this.isDormant = false;          // True while she has vanished and is waiting to respawn
        this.dormantRespawnMin = 18.0;   // Minimum seconds before she reappears
        this.dormantRespawnMax = 35.0;   // Maximum seconds before she reappears
        this.dormantTimer = 0.0;         // Counts up while dormant
        this.dormantTarget = 0.0;        // Chosen respawn delay for this cycle

        // Perception
        this.hasLineOfSight = false;
        this.lastKnownPlayerPos = new THREE.Vector3(0, 1.7, 0);
        this.isDisrupted = false;

        // Visual animation
        this._bobTimer = 0;
        this._glitchTimer = 0;
        this._scaredAlpha = 0.88;
        this._materials = [];

        // 1990s Contextual Dialogue Lines
        this.dialoguePool = [
            "Chill Mix '95... Side A never finished playing.",
            "Whatever... you think you can just leave me here?",
            "It's freezing... why can't I feel my hands?",
            "Totally unfair. I was supposed to graduate in June.",
            "Please... don't let me fade into a static echo.",
            "Who took my Walkman? Give it back...",
            "I just want to go home. Why won't anyone answer me?"
        ];
        this.dialogueCooldown = 15.0;

        // Spawn pool along Pala road
        this.spawnZones = [
            new THREE.Vector3(18, 0, -84),  // Veranda
            new THREE.Vector3(-14, 0, -70), // Near Pala Tree
            new THREE.Vector3(-4.5, 0, -25),// Ward A road
            new THREE.Vector3(8, 0, -50),
            new THREE.Vector3(0, 0, -120),
            new THREE.Vector3(-8, 0, -100)
        ];
    }

    init(scene) {
        const group = new THREE.Group();

        // ─── 1. SHADER MATERIALS (Desaturated 1990s grunge palette) ───

        // Pale supernatural skin with slight blue-grey undertone
        const skinMat = new THREE.MeshStandardMaterial({
            color: 0xd8d4cb,
            roughness: 0.75,
            metalness: 0.05,
            transparent: true,
            opacity: 0.88,
            emissive: 0x0a0c10,
            emissiveIntensity: 0.35
        });

        // Dark rings under eyes (trauma & exhaustion)
        const eyeRingMat = new THREE.MeshStandardMaterial({
            color: 0x3a3036,
            roughness: 0.9,
            transparent: true,
            opacity: 0.8
        });

        // Glossy dark brown sunken eyes
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x18100c });

        // Messy 1990s blowout hair (dark brunette with loose bangs)
        const hairMat = new THREE.MeshStandardMaterial({
            color: 0x22140e,
            roughness: 0.95,
            metalness: 0.05,
            transparent: true,
            opacity: 0.92
        });

        // Oversized red/black grunge plaid flannel shirt
        const flannelMat = new THREE.MeshStandardMaterial({
            color: 0x7a2222, // Faded grunge red flannel
            roughness: 0.85,
            metalness: 0.04,
            transparent: true,
            opacity: 0.88,
            emissive: 0x120404,
            emissiveIntensity: 0.2
        });

        // Faded dark charcoal grunge band tee underneath
        const teeMat = new THREE.MeshStandardMaterial({
            color: 0x1c1c20,
            roughness: 0.8,
            transparent: true,
            opacity: 0.88
        });

        // Torn stonewashed blue denim jeans
        const jeansMat = new THREE.MeshStandardMaterial({
            color: 0x324458,
            roughness: 0.7,
            metalness: 0.05,
            transparent: true,
            opacity: 0.88
        });

        // Scuffed black combat boots
        const bootMat = new THREE.MeshStandardMaterial({
            color: 0x121214,
            roughness: 0.65,
            metalness: 0.3,
            transparent: true,
            opacity: 0.92
        });

        this._materials = [skinMat, eyeRingMat, eyeMat, hairMat, flannelMat, teeMat, jeansMat, bootMat];

        // ─── 2. PROCEDURAL 3D ANATOMY (1.68m height, realistic proportions) ───

        // Head
        const headGeo = new THREE.SphereGeometry(0.13, 12, 12);
        headGeo.scale(1.0, 1.25, 1.05);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.54;
        group.add(head);

        // Dark eye rings & eyes
        [-0.048, 0.048].forEach(ex => {
            const eyeRing = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 0.03), eyeRingMat);
            eyeRing.position.set(ex, 1.54, 0.125);
            group.add(eyeRing);

            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 6), eyeMat);
            eye.position.set(ex, 1.55, 0.128);
            group.add(eye);
        });

        // 1990s Messy Blowout Hair (layered locks, bangs framing face)
        const hairTopGeo = new THREE.SphereGeometry(0.155, 10, 10);
        hairTopGeo.scale(1.05, 1.15, 1.1);
        const hairTop = new THREE.Mesh(hairTopGeo, hairMat);
        hairTop.position.set(0, 1.58, -0.02);
        group.add(hairTop);

        // Front curtain bangs & side strands
        [-0.09, 0.0, 0.09].forEach((hx, idx) => {
            const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.012, 0.32, 5), hairMat);
            strand.position.set(hx, 1.48, 0.11);
            strand.rotation.z = (idx - 1) * 0.22;
            group.add(strand);
        });

        // Torso: Band T-Shirt core
        const torsoGeo = new THREE.CylinderGeometry(0.16, 0.14, 0.52, 9);
        const torso = new THREE.Mesh(torsoGeo, teeMat);
        torso.position.y = 1.18;
        group.add(torso);

        // Oversized Flannel Shirt (draped around shoulders and torso)
        const flannelGeo = new THREE.CylinderGeometry(0.20, 0.19, 0.56, 9);
        const flannel = new THREE.Mesh(flannelGeo, flannelMat);
        flannel.position.y = 1.17;
        group.add(flannel);

        // Arms (sleeves of flannel shirt)
        this.arms = [];
        [-0.22, 0.22].forEach((ax, idx) => {
            const armGroup = new THREE.Group();
            armGroup.position.set(ax, 1.34, 0);

            const armGeo = new THREE.CylinderGeometry(0.045, 0.038, 0.54, 7);
            const sleeve = new THREE.Mesh(armGeo, flannelMat);
            sleeve.position.y = -0.25;
            armGroup.add(sleeve);

            // Pale hands
            const hand = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), skinMat);
            hand.position.y = -0.52;
            armGroup.add(hand);

            armGroup.rotation.z = (idx === 0 ? 1 : -1) * 0.18;
            group.add(armGroup);
            this.arms.push(armGroup);
        });

        // Legs: Torn Denim Jeans
        [-0.08, 0.08].forEach(lx => {
            const legGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.68, 8);
            const leg = new THREE.Mesh(legGeo, jeansMat);
            leg.position.set(lx, 0.62, 0);
            group.add(leg);

            // Frayed knee tear showing pale skin
            const tear = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.02), skinMat);
            tear.position.set(lx, 0.64, 0.052);
            group.add(tear);
        });

        // Scuffed Combat Boots
        [-0.08, 0.08].forEach(bx => {
            const bootGeo = new THREE.BoxGeometry(0.09, 0.14, 0.18);
            const boot = new THREE.Mesh(bootGeo, bootMat);
            boot.position.set(bx, 0.14, 0.02);
            group.add(boot);
        });

        // Ethereal Paranormal Cold Light (cyan-white)
        const coldLight = new THREE.PointLight(0x88ccff, 0.7, 5, 2);
        coldLight.position.set(0, 1.2, 0);
        group.add(coldLight);
        this._auraLight = coldLight;

        // ─── CRITICAL REQUIREMENT: NO NORMAL CAST SHADOW ───
        // Disable shadow casting on ALL child meshes of Jess
        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });

        group.position.copy(this.position);
        scene.add(group);
        this.mesh = group;

        // Initialize position near the Walkman anchor
        if (window.WalkmanAnchor) {
            this.position.copy(window.WalkmanAnchor.worldPos);
            this.mesh.position.copy(this.position);
        }
    }

    triggerPanic(reason = "Sudden Concussion") {
        if (this.state === 'Disrupted') return;
        this.state = 'Panicked';
        this.panicTimer = 3.0;

        if (window.GameplayApp) {
            window.GameplayApp._showHorrorSubtitle(`[ Jess panics at the sudden crash — clutching her head! ]`);
        }
        if (window.HorrorAudio && typeof window.HorrorAudio.playTapeGlitch === 'function') {
            window.HorrorAudio.playTapeGlitch();
        }

        // Arm clutching posture
        if (this.arms && this.arms.length === 2) {
            this.arms[0].rotation.z = 1.3;
            this.arms[1].rotation.z = -1.3;
        }

        // Retreat backwards
        if (window.GameplayApp) {
            const away = new THREE.Vector3().subVectors(this.position, window.GameplayApp.playerPos).normalize();
            away.y = 0;
            this.velocity.copy(away).multiplyScalar(6.0);
        }
    }

    disrupt(repelFromPos) {
        this.state = 'Disrupted';
        this.isDisrupted = true;
        this.stateTimer = 0.0;

        if (window.HorrorAudio && typeof window.HorrorAudio.playDisruptionScream === 'function') {
            window.HorrorAudio.playDisruptionScream();
        }

        const awayDir = new THREE.Vector3().subVectors(this.position, repelFromPos).normalize();
        awayDir.y = 0;
        this.velocity.copy(awayDir).multiplyScalar(this.retreatSpeed);
        this._fadeOut(1.2);
    }

    speakDialogue(customLine = null) {
        if (this.dialogueCooldown > 0) return;
        this.dialogueCooldown = 18.0 + Math.random() * 12.0;

        const line = customLine || this.dialoguePool[Math.floor(Math.random() * this.dialoguePool.length)];

        // Audio Blackout: duck ambient audio and play tape motor hiss
        if (window.HorrorAudio && typeof window.HorrorAudio.duckAmbient === 'function') {
            window.HorrorAudio.duckAmbient(4.0);
        }

        if (window.GameplayApp) {
            window.GameplayApp._showHorrorSubtitle(`[ Jess: "${line}" ]`);
        }

        if (window.AyasDevice) {
            window.AyasDevice.registerVoiceLure(0.95);
        }
    }

    // ─── DORMANT VANISH + UNEXPECTED RESPAWN ───
    _triggerDormantVanish() {
        this.isDormant = true;
        this.state = 'Dormant';
        this.pursuitTimer = 0.0;
        this.searchTimer = 0.0;

        // Reset arm posture
        if (this.arms && this.arms.length === 2) {
            this.arms[0].rotation.x = 0;
            this.arms[1].rotation.x = 0;
        }

        // Choose a random respawn delay between min and max
        this.dormantTimer = 0.0;
        this.dormantTarget = this.dormantRespawnMin +
            Math.random() * (this.dormantRespawnMax - this.dormantRespawnMin);

        // Fade out visually
        this._fadeOut(1.0);
        setTimeout(() => {
            if (this.mesh) this.mesh.visible = false;
        }, 1100);
    }

    // Tick the dormant respawn timer (called at top of update)
    _tickDormant(delta) {
        if (!this.isDormant) return false;
        this.dormantTimer += delta;
        if (this.dormantTimer >= this.dormantTarget) {
            // Pick a random spawn zone far from (0,0,0) to feel surprising
            const zone = this.spawnZones[Math.floor(Math.random() * this.spawnZones.length)];
            this.spawnAt(zone.x, zone.y, zone.z);
            this.isDormant = false;
            this.state = 'Stalking';
            this.stateTimer = 0.0;
            // Optional: brief creepy dialogue on respawn
            setTimeout(() => this.speakDialogue(), 2200);
        }
        return true; // still dormant or just woke up — skip rest of update this tick
    }

    update(delta, playerPos, playerCamFwd, isPlayerHiding, isPlayerCrouched, isPlayerSprinting, flashlightOn) {
        if (!this.mesh) return;

        // Timers
        this.stateTimer += delta;
        this.lureCooldown -= delta;
        this.dialogueCooldown -= delta;
        this.attackCooldown -= delta;
        this._bobTimer += delta;
        this._glitchTimer += delta;

        // Floating hover animation
        this.mesh.position.y = 0.06 * Math.sin(this._bobTimer * 2.2);

        const distToPlayer = this.position.distanceTo(playerPos);

        // Update audio threat level
        if (window.HorrorAudio && typeof window.HorrorAudio.setThreatLevel === 'function') {
            const threat = Math.max(0, Math.min(1, 1.0 - distToPlayer / 26.0));
            window.HorrorAudio.setThreatLevel(threat);
        }

        // Periodic ambient dialogue
        if (this.dialogueCooldown <= 0 && distToPlayer < 24.0 && (this.state === 'Stalking' || this.state === 'Luring')) {
            this.speakDialogue();
        }

        this.checkLineOfSight(playerPos, isPlayerHiding, isPlayerCrouched, flashlightOn);

        // ─── WALKMAN ANCHOR ENFORCEMENT ───
        // In all non-final-chase states, Jess is tethered within 15ft (4.57m) of her sports Walkman
        if (window.WalkmanAnchor && this.state !== 'Disrupted') {
            const anchorPos = window.WalkmanAnchor.getAnchorPosition();
            const distToAnchor = this.position.distanceTo(anchorPos);

            // If Walkman is held by player, she naturally stalks near the player
            if (distToAnchor > this.maxAnchorDistance) {
                // Smoothly draw her toward anchor boundary
                const pullDir = new THREE.Vector3().subVectors(anchorPos, this.position).normalize();
                pullDir.y = 0;
                this.position.addScaledVector(pullDir, Math.min(distToAnchor - this.maxAnchorDistance, 12.0 * delta));
            }
        }

        // ─── DORMANT RESPAWN TICK ───
        if (this._tickDormant(delta)) return;

        // ─── STATE MACHINE ───

        // 1. PANICKED
        if (this.state === 'Panicked') {
            this.panicTimer -= delta;
            this.position.addScaledVector(this.velocity, delta);
            this.velocity.multiplyScalar(0.9);
            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;

            if (this.panicTimer <= 0) {
                this.state = 'Recovering';
                this.recoveringTimer = 2.0;
                // Restore arm posture
                if (this.arms && this.arms.length === 2) {
                    this.arms[0].rotation.z = 0.18;
                    this.arms[1].rotation.z = -0.18;
                }
            }
            return;
        }

        // 2. RECOVERING
        if (this.state === 'Recovering') {
            this.recoveringTimer -= delta;
            if (this.recoveringTimer <= 0) {
                this.state = 'Stalking';
            }
            return;
        }

        // 3. DISRUPTED
        if (this.state === 'Disrupted') {
            this.position.addScaledVector(this.velocity, delta);
            this.velocity.multiplyScalar(0.88);
            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;

            if (this.stateTimer > 4.5 || distToPlayer > 35.0) {
                this.isDisrupted = false;
                this.state = 'Stalking';
                this.stateTimer = 0.0;
                this._fadeIn(1.5);
            }
            return;
        }

        // 4. HUNTING
        if (this.state === 'Hunting') {
            this.pursuitTimer += delta;

            // Disengage after maxPursuitTime — she vanishes and will unexpectedly respawn later
            if (this.pursuitTimer > this.maxPursuitTime) {
                this.pursuitTimer = 0.0;
                this._triggerDormantVanish();
                return;
            }

            // Also disengage if player hides — shorter search then vanish
            if (isPlayerHiding) {
                this.state = 'Searching';
                this.searchTimer = 0.0;
                this.pursuitTimer = 0.0;
                return;
            }

            // Move actively toward player
            const dir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
            dir.y = 0;
            this.position.addScaledVector(dir, this.huntSpeed * delta);
            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
            this._setOpacity(this._scaredAlpha);

            // Outstretch arms aggressively during hunt
            if (this.arms && this.arms.length === 2) {
                this.arms[0].rotation.x = -1.2;
                this.arms[1].rotation.x = -1.2;
            }

            // ATTACK RANGE (Within 2.4 meters)
            if (distToPlayer < 2.4) {
                this._executeAttack(playerPos);
                return;
            }

            // Lost sight at long range — switch to search mode
            if (!this.hasLineOfSight && distToPlayer > 20.0) {
                this.state = 'Searching';
                this.searchTimer = 0.0;
                this.lastKnownPlayerPos.copy(playerPos);
            }
            return;
        }

        // 5. ATTACKING
        if (this.state === 'Attacking') {
            // Lunge freeze briefly
            if (this.stateTimer > 0.6) {
                this.state = 'Searching';
                this.stateTimer = 0.0;
                if (this.arms && this.arms.length === 2) {
                    this.arms[0].rotation.x = 0;
                    this.arms[1].rotation.x = 0;
                }
            }
            return;
        }

        // 6. SEARCHING
        if (this.state === 'Searching') {
            this.searchTimer += delta;
            const toLast = new THREE.Vector3().subVectors(this.lastKnownPlayerPos, this.position);
            toLast.y = 0;

            if (toLast.length() > 1.8) {
                toLast.normalize();
                this.position.addScaledVector(toLast, this.stalkSpeed * delta);
                this.mesh.position.x = this.position.x;
                this.mesh.position.z = this.position.z;
                this.mesh.lookAt(this.lastKnownPlayerPos.x, this.mesh.position.y, this.lastKnownPlayerPos.z);
            }

            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
                this.pursuitTimer = 0.0;
            } else if (this.searchTimer > 7.0) {
                // After failing to find the player, vanish and respawn elsewhere unexpectedly
                this._triggerDormantVanish();
            }
            return;
        }

        // 7. INVESTIGATING (drawn to sound)
        if (this.state === 'Investigating') {
            const toNoise = new THREE.Vector3().subVectors(this.lastKnownPlayerPos, this.position);
            toNoise.y = 0;

            if (toNoise.length() > 2.0) {
                toNoise.normalize();
                this.position.addScaledVector(toNoise, this.stalkSpeed * 1.3 * delta);
                this.mesh.position.x = this.position.x;
                this.mesh.position.z = this.position.z;
                this.mesh.lookAt(this.lastKnownPlayerPos.x, this.mesh.position.y, this.lastKnownPlayerPos.z);
            } else {
                this.state = 'Stalking';
            }

            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
                this.pursuitTimer = 0.0;
            }
            return;
        }

        // 8. STALKING / LURING
        if (this.state === 'Stalking' || this.state === 'Luring') {
            // Sight acquisition triggers hunt
            if (this.hasLineOfSight && !isPlayerHiding) {
                this.state = 'Hunting';
                this.pursuitTimer = 0.0;
                if (window.KeralaWorld && typeof window.KeralaWorld.triggerFlashlightFlicker === 'function') {
                    window.KeralaWorld.triggerFlashlightFlicker(1.5);
                }
                return;
            }

            // Sound detection: Sprinting attracts attention
            if (isPlayerSprinting && distToPlayer < 28.0) {
                this.state = 'Investigating';
                this.lastKnownPlayerPos.copy(playerPos);
                return;
            }

            // Stalking movement: Anchor-aware orbit
            const anchor = window.WalkmanAnchor ? window.WalkmanAnchor.getAnchorPosition() : playerPos;
            const distToAnchor = this.position.distanceTo(anchor);

            if (distToAnchor > 3.8) {
                const toAnchor = new THREE.Vector3().subVectors(anchor, this.position).normalize();
                toAnchor.y = 0;
                this.position.addScaledVector(toAnchor, this.stalkSpeed * delta);
            } else {
                // Orbit smoothly
                const angle = Math.atan2(this.position.z - anchor.z, this.position.x - anchor.x) + 0.35 * delta;
                const r = Math.min(3.6, this.maxAnchorDistance - 0.4);
                this.position.x = anchor.x + Math.cos(angle) * r;
                this.position.z = anchor.z + Math.sin(angle) * r;
            }

            this.mesh.position.x = this.position.x;
            this.mesh.position.z = this.position.z;
            this.mesh.lookAt(playerPos.x, this.mesh.position.y, playerPos.z);
        }
    }

    _executeAttack(playerPos) {
        if (this.attackCooldown > 0) return;
        this.attackCooldown = this.attackInterval;
        this.state = 'Attacking';
        this.stateTimer = 0.0;

        // Visual lunging forward
        const lungeDir = new THREE.Vector3().subVectors(playerPos, this.position).normalize();
        this.position.addScaledVector(lungeDir, 0.8);
        this.mesh.position.x = this.position.x;
        this.mesh.position.z = this.position.z;

        // Stinger audio
        if (window.HorrorAudio && typeof window.HorrorAudio.playAttackStinger === 'function') {
            window.HorrorAudio.playAttackStinger();
        }

        // Flash screen red
        this._showAttackOverlay();

        // Apply authoritative player damage
        if (window.GameplayApp && typeof window.GameplayApp.takeDamage === 'function') {
            window.GameplayApp.takeDamage(35); // Real authoritative health damage
        }
    }

    _showAttackOverlay() {
        const overlay = document.getElementById('screen-overlay');
        if (!overlay) return;
        overlay.style.background = 'radial-gradient(circle, rgba(220,20,30,0.85) 0%, rgba(10,0,0,0.98) 75%)';
        overlay.style.opacity = '1';
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => { overlay.style.background = ''; }, 400);
        }, 500);
    }

    checkLineOfSight(playerPos, isPlayerHiding, isPlayerCrouched, flashlightOn) {
        if (isPlayerHiding) {
            this.hasLineOfSight = false;
            return;
        }

        const dist = this.position.distanceTo(playerPos);
        let maxSight = 22.0;

        if (isPlayerCrouched) maxSight *= 0.55;
        if (flashlightOn) maxSight *= 1.4;

        this.hasLineOfSight = dist <= maxSight;
    }

    spawnAt(x, y, z) {
        this.position.set(x, y, z);
        this.mesh.position.copy(this.position);
        this.mesh.visible = true;
        this.state = 'Stalking';
        this._fadeIn(1.6);
    }

    spawnStoryEvent(phase) {
        if (phase === 'pala_tree') {
            this.spawnAt(-14, 0, -70);
            this.speakDialogue("The roots... they're so cold. What happened here?");
        } else if (phase === 'house_breach') {
            this.spawnAt(14, 0, -90);
            this.speakDialogue("Did you find my things? Please tell me you found them.");
        } else if (phase === 'final_chase') {
            this.state = 'Hunting';
            this.huntSpeed = 9.5;
            this.spawnAt(0, 0, -125);
            this.speakDialogue("Don't leave me behind in 1995! DON'T LEAVE ME!");
        }
    }

    _fadeIn(duration) {
        let step = 0;
        const steps = 20;
        const interval = setInterval(() => {
            step++;
            this._setOpacity((step / steps) * this._scaredAlpha);
            if (step >= steps) clearInterval(interval);
        }, (duration * 1000) / steps);
    }

    _fadeOut(duration) {
        let step = 0;
        const steps = 20;
        const interval = setInterval(() => {
            step++;
            this._setOpacity(this._scaredAlpha * (1 - step / steps));
            if (step >= steps) clearInterval(interval);
        }, (duration * 1000) / steps);
    }

    _setOpacity(alpha) {
        if (this._materials) {
            this._materials.forEach(mat => { mat.opacity = alpha; });
        }
    }
}

// Global authoritative registration with aliases to guarantee 100% compatibility
window.JessAI = new JessEntity();
window.GhostAI = window.JessAI;
window.YakshiAI = window.JessAI;
