/**
 * AYAS: THE LAST WARD - Jessica Miller's Walkman Anchor System
 * 
 * Jess is bound to a cracked yellow sports-model portable cassette player
 * containing "Chill Mix '95", frozen at the end of Side A.
 * 
 * Tether rules:
 * 1. Maximum distance between Jess and active anchor: 15 feet (~4.57 meters).
 * 2. When anchor is stationary, Jess remains within the 4.57m sphere.
 * 3. When anchor moves (held by player), Jess follows smoothly without getting stuck.
 * 4. Player can pick up [E] or set down [T] the Walkman.
 */

class WalkmanAnchorSystem {
    constructor() {
        this.mesh = null;
        this.worldPos = new THREE.Vector3(18.0, 1.25, -83.5); // Veranda desk initially
        this.holder = 'world'; // 'world' or 'player'
        this.maxTetherRadius = 4.572; // 15 feet in meters
        this.isInspected = false;
        this.cassetteTrack = "Chill Mix '95 (Side A - Frozen)";
        this.interactionRadius = 2.4;
    }

    init(scene) {
        const group = new THREE.Group();

        // 1. Yellow Sports-Model Casing (Classic 90s rugged sports look)
        const yellowMat = new THREE.MeshStandardMaterial({
            color: 0xf5d020, // Vibrant 90s sports yellow
            roughness: 0.38,
            metalness: 0.15
        });
        const bodyGeo = new THREE.BoxGeometry(0.32, 0.46, 0.12);
        const body = new THREE.Mesh(bodyGeo, yellowMat);
        body.castShadow = true;
        group.add(body);

        // 2. Black Rubber Shock-Absorbing Edge Bumpers
        const rubberMat = new THREE.MeshStandardMaterial({
            color: 0x18181c,
            roughness: 0.9,
            metalness: 0.05
        });
        const bumperGeo = new THREE.BoxGeometry(0.34, 0.48, 0.08);
        const bumper = new THREE.Mesh(bumperGeo, rubberMat);
        bumper.position.z = -0.01;
        group.add(bumper);

        // 3. Clear Cassette Window & Crack Detail
        const windowMat = new THREE.MeshStandardMaterial({
            color: 0x223344,
            roughness: 0.2,
            metalness: 0.6,
            transparent: true,
            opacity: 0.75
        });
        const winGeo = new THREE.BoxGeometry(0.24, 0.24, 0.04);
        const win = new THREE.Mesh(winGeo, windowMat);
        win.position.set(0, 0.04, 0.06);
        group.add(win);

        // 4. White Cassette Reels (frozen)
        const reelMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const reel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), reelMat);
        reel1.rotation.x = Math.PI / 2;
        reel1.position.set(-0.055, 0.04, 0.07);
        group.add(reel1);

        const reel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 8), reelMat);
        reel2.rotation.x = Math.PI / 2;
        reel2.position.set(0.055, 0.04, 0.07);
        group.add(reel2);

        // 5. Headphone Wire Jack & Clip
        const clipMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8 });
        const clip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.04), clipMat);
        clip.position.set(0, 0, -0.07);
        group.add(clip);

        // 6. Ethereal Yellow-Gold Glow
        const aura = new THREE.PointLight(0xf5d020, 0.6, 3.5, 2);
        aura.position.set(0, 0.1, 0.1);
        group.add(aura);
        this._auraLight = aura;

        group.position.copy(this.worldPos);
        scene.add(group);
        this.mesh = group;
    }

    getAnchorPosition() {
        if (this.holder === 'player' && window.GameplayApp) {
            return window.GameplayApp.playerPos;
        }
        return this.worldPos;
    }

    isPlayerHolding() {
        return this.holder === 'player';
    }

    pickup() {
        this.holder = 'player';
        if (this.mesh) this.mesh.visible = false;

        if (window.GameplayApp) {
            window.GameplayApp.showNotification("📼 ACQUIRED JESS'S SPORTS WALKMAN [T to Drop]");
            window.GameplayApp._showHorrorSubtitle("[ 'Chill Mix '95' — frozen at the end of Side A. You feel her presence pull closer. ]");
        }
        if (window.HorrorAudio && typeof window.HorrorAudio.playTapeClick === 'function') {
            window.HorrorAudio.playTapeClick();
        }

        this.updateHUD();
    }

    drop(dropPos) {
        this.holder = 'world';
        this.worldPos.copy(dropPos);
        this.worldPos.y = 0.15; // Set on ground

        if (this.mesh) {
            this.mesh.position.copy(this.worldPos);
            this.mesh.visible = true;
        }

        if (window.GameplayApp) {
            window.GameplayApp.showNotification("📼 WALKMAN PLACED ON GROUND [E to Pick Up]");
            window.GameplayApp._showHorrorSubtitle("[ Jess's anchor tether is now rooted to this spot (15 ft radius) ]");
        }

        this.updateHUD();
    }

    toggleCarry() {
        if (this.holder === 'player') {
            if (window.GameplayApp) {
                const dropPos = window.GameplayApp.playerPos.clone();
                this.drop(dropPos);
            }
        } else {
            if (window.GameplayApp && window.GameplayApp.playerPos.distanceTo(this.worldPos) < this.interactionRadius + 1.0) {
                this.pickup();
            }
        }
    }

    checkTether(targetPos) {
        const anchor = this.getAnchorPosition();
        const dist = targetPos.distanceTo(anchor);
        const withinRange = dist <= this.maxTetherRadius;
        const vectorToAnchor = new THREE.Vector3().subVectors(anchor, targetPos);
        return { withinRange, distance: dist, vectorToAnchor };
    }

    enforceTether(ghostPos) {
        const anchor = this.getAnchorPosition();
        const dist = ghostPos.distanceTo(anchor);

        if (dist > this.maxTetherRadius) {
            const dir = new THREE.Vector3().subVectors(ghostPos, anchor).normalize();
            ghostPos.copy(anchor).addScaledVector(dir, this.maxTetherRadius - 0.05);
            return true;
        }
        return false;
    }

    updateHUD() {
        let badge = document.getElementById('walkman-status-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'walkman-status-badge';
            badge.style.fontFamily = 'var(--mono)';
            badge.style.fontSize = '9px';
            badge.style.color = '#f5d020';
            badge.style.letterSpacing = '1px';
            badge.style.marginTop = '4px';
            badge.style.display = 'flex';
            badge.style.alignItems = 'center';
            badge.style.gap = '6px';
            const bottomBar = document.getElementById('bottom-bar');
            if (bottomBar) bottomBar.appendChild(badge);
        }

        if (this.holder === 'player') {
            badge.innerHTML = `<span style="color:#00e576">●</span> WALKMAN: HELD [T: Place] • TETHER: ACTIVE`;
        } else {
            const dist = window.GameplayApp ? window.GameplayApp.playerPos.distanceTo(this.worldPos).toFixed(1) : '0';
            badge.innerHTML = `<span style="color:#f5d020">○</span> WALKMAN: GROUND (${dist}m) • TETHER: 15FT`;
        }
    }
}

window.WalkmanAnchor = new WalkmanAnchorSystem();
