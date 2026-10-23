/**
 * AYAS: THE LAST WARD - 3D Kerala Environment Builder
 * The Pala Road, Ancient Pala Tree, Ancestral Tharavadu, Laterite Walls, Ward Posts & Rain
 */

class KeralaWorld {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // Lighting
        this.moonLight = null;
        this.lightningLight = null;
        this.playerSpotlight = null;

        // Interactive & Landmark Actors
        this.interactables = [];
        this.wardStations = {};
        this.hidingSpots = [];
        this.evidenceItems = [];
        this.shrineZone = null;
        this.palaTreeMesh = null;

        // Particles
        this.rainParticles = null;
        this.sparkParticles = [];

        // Flashlight State
        this.isFlashlightOn = true;
        this.flashlightBattery = 100.0;
        this.isFlickering = false;
    }

    init(container) {
        // 1. Scene & Atmosphere
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x030609);
        this.scene.fog = new THREE.FogExp2(0x04080e, 0.016); // Monsoon darkness

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 400);
        this.camera.position.set(0, 1.7, 0);

        // 3. Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.9;
        container.appendChild(this.renderer.domElement);

        // 4. Lighting
        this.setupLighting();

        // 5. Build Environment
        this.buildRoadAndTerrain();
        this.buildLateriteWalls();
        this.buildVegetation();
        this.buildPalaTree();
        this.buildAncestralHouse();
        this.buildWardStations();
        this.buildSacredShrine();
        this.buildRainParticles();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Dim moonlight
        const ambient = new THREE.AmbientLight(0x0d1824, 0.4);
        this.scene.add(ambient);

        this.moonLight = new THREE.DirectionalLight(0x1a334d, 0.5);
        this.moonLight.position.set(25, 60, -30);
        this.moonLight.castShadow = true;
        this.moonLight.shadow.mapSize.width = 1024;
        this.moonLight.shadow.mapSize.height = 1024;
        this.moonLight.shadow.camera.near = 10;
        this.moonLight.shadow.camera.far = 150;
        this.moonLight.shadow.camera.left = -50;
        this.moonLight.shadow.camera.right = 50;
        this.moonLight.shadow.camera.top = 50;
        this.moonLight.shadow.camera.bottom = -50;
        this.scene.add(this.moonLight);

        // Lightning flash light (sudden dramatic illumination)
        this.lightningLight = new THREE.PointLight(0xaad5ff, 0, 150, 1.5);
        this.lightningLight.position.set(0, 45, -50);
        this.scene.add(this.lightningLight);

        // Player Flashlight (Attached to Camera)
        this.playerSpotlight = new THREE.SpotLight(0xfff3d6, 4.5, 38, Math.PI / 7, 0.35, 1.2);
        this.playerSpotlight.position.set(0.15, -0.15, -0.1);
        this.playerSpotlight.castShadow = true;
        this.playerSpotlight.shadow.mapSize.width = 1024;
        this.playerSpotlight.shadow.mapSize.height = 1024;
        this.camera.add(this.playerSpotlight);

        // Spotlight target
        const spotTarget = new THREE.Object3D();
        spotTarget.position.set(0, 0, -5);
        this.camera.add(spotTarget);
        this.playerSpotlight.target = spotTarget;

        this.scene.add(this.camera);
    }

    triggerLightning() {
        if (!this.lightningLight) return;
        this.lightningLight.intensity = 18;
        setTimeout(() => { if (this.lightningLight) this.lightningLight.intensity = 0; }, 80);
        setTimeout(() => { if (this.lightningLight) this.lightningLight.intensity = 12; }, 140);
        setTimeout(() => { if (this.lightningLight) this.lightningLight.intensity = 0; }, 260);

        if (window.HorrorAudio) {
            setTimeout(() => window.HorrorAudio.playDistantThunder(), 400);
        }
    }

    buildRoadAndTerrain() {
        // Ground plane: Dark wet muddy road with laterite earth shoulders
        const groundGeo = new THREE.PlaneGeometry(120, 260, 32, 32);
        groundGeo.rotateX(-Math.PI / 2);

        // Procedural vertex variation for subtle road rutting
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            let y = Math.sin(x * 0.15) * 0.12 + Math.cos(z * 0.08) * 0.15;
            if (Math.abs(x) < 4.5) y -= 0.15; // Road dip
            pos.setY(i, y);
        }
        groundGeo.computeVertexNormals();

        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x181a17,
            roughness: 0.65,
            metalness: 0.25
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.set(0, 0, -80);
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Reflective Water Puddles along the muddy tracks
        const puddleGeo = new THREE.CircleGeometry(2.8, 16);
        puddleGeo.rotateX(-Math.PI / 2);
        const puddleMat = new THREE.MeshStandardMaterial({
            color: 0x050a10,
            roughness: 0.08,
            metalness: 0.85
        });

        const puddlePositions = [
            [-1.8, 0.02, -12],
            [2.1, 0.02, -28],
            [-0.9, 0.02, -54],
            [1.5, 0.02, -95],
            [-2.2, 0.02, -135]
        ];

        puddlePositions.forEach(([px, py, pz]) => {
            const puddle = new THREE.Mesh(puddleGeo, puddleMat);
            puddle.position.set(px, py, pz);
            puddle.scale.set(1 + Math.random() * 0.5, 1, 1 + Math.random() * 0.7);
            this.scene.add(puddle);
        });

        // Weathered Malayalam Road Sign
        this.buildRoadSign(-4.5, 0, -8);
    }

    buildRoadSign(x, y, z) {
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x2b2219, roughness: 0.9 });
        const post = new THREE.Mesh(postGeo, woodMat);
        post.position.set(x, y + 1.1, z);
        this.scene.add(post);

        const boardGeo = new THREE.BoxGeometry(1.6, 0.7, 0.05);
        const boardMat = new THREE.MeshStandardMaterial({ color: 0x4a443a, roughness: 0.8 });
        const board = new THREE.Mesh(boardGeo, boardMat);
        board.position.set(x, y + 1.8, z);
        board.rotation.y = Math.PI / 8;
        this.scene.add(board);
    }

    buildLateriteWalls() {
        // Red-ochre Laterite stone walls flanking the road
        const wallMat = new THREE.MeshStandardMaterial({
            color: 0x5a2d1f, // Weathered laterite red
            roughness: 0.92,
            metalness: 0.05
        });
        const mossMat = new THREE.MeshStandardMaterial({
            color: 0x1f361a, // Dark moss top
            roughness: 0.9
        });

        const wallSegments = [
            // Left flank
            [-5.5, 0, -10, 1.2, 1.3, 28],
            [-5.5, 0, -45, 1.2, 1.3, 32],
            [-5.5, 0, -90, 1.2, 1.3, 40],
            // Right flank
            [5.5, 0, -12, 1.2, 1.3, 30],
            [5.5, 0, -50, 1.2, 1.3, 35],
            [5.5, 0, -100, 1.2, 1.3, 45]
        ];

        wallSegments.forEach(([wx, wy, wz, wWidth, wHeight, wDepth]) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(wWidth, wHeight, wDepth), wallMat);
            wall.position.set(wx, wy + wHeight / 2, wz);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);

            // Moss cap
            const cap = new THREE.Mesh(new THREE.BoxGeometry(wWidth + 0.1, 0.1, wDepth), mossMat);
            cap.position.set(wx, wy + wHeight + 0.05, wz);
            this.scene.add(cap);
        });
    }

    buildVegetation() {
        // Palm trunks and bamboo clumps along both sides
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x2e241c, roughness: 0.9 });
        const palmLeafMat = new THREE.MeshStandardMaterial({ color: 0x142817, roughness: 0.8 });

        const palmPositions = [
            [-8, 0, -15], [8, 0, -22], [-9, 0, -38], [8.5, 0, -52],
            [-8.2, 0, -75], [9, 0, -92], [-8.5, 0, -115], [8, 0, -130]
        ];

        palmPositions.forEach(([px, py, pz]) => {
            const height = 9 + Math.random() * 4;
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, height, 8), trunkMat);
            trunk.position.set(px, py + height / 2, pz);
            trunk.rotation.z = (Math.random() - 0.5) * 0.12;
            trunk.castShadow = true;
            this.scene.add(trunk);

            // Palm fronds crown
            const crown = new THREE.Group();
            crown.position.set(px, py + height, pz);
            for (let f = 0; f < 8; f++) {
                const angle = (f / 8) * Math.PI * 2;
                const frond = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 4.2), palmLeafMat);
                frond.position.set(Math.sin(angle) * 1.8, -0.6, Math.cos(angle) * 1.8);
                frond.rotation.y = angle;
                frond.rotation.x = 0.35;
                crown.add(frond);
            }
            this.scene.add(crown);
        });
    }

    // Ancient Pala Tree (Alstonia scholaris - Devil Tree of Kerala Folklore)
    buildPalaTree() {
        const palaGroup = new THREE.Group();
        palaGroup.position.set(-11, 0, -65);

        const barkMat = new THREE.MeshStandardMaterial({
            color: 0x1d1a16,
            roughness: 0.95
        });
        const darkLeavesMat = new THREE.MeshStandardMaterial({
            color: 0x0c1b0f,
            roughness: 0.85
        });

        // Massive gnarly main trunk
        const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.8, 14, 10), barkMat);
        mainTrunk.position.y = 7;
        mainTrunk.castShadow = true;
        palaGroup.add(mainTrunk);

        // Twisted secondary trunks & roots stretching across the ground
        const rootAngles = [0.2, 1.4, 2.7, 4.1, 5.3];
        rootAngles.forEach(rad => {
            const root = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.7, 8, 8), barkMat);
            root.position.set(Math.cos(rad) * 4, 1.2, Math.sin(rad) * 4);
            root.rotation.z = Math.cos(rad) * 0.55;
            root.rotation.x = Math.sin(rad) * 0.55;
            palaGroup.add(root);
        });

        // Ominous dense canopy
        const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(7, 1), darkLeavesMat);
        canopy.position.set(0, 15, 0);
        canopy.scale.set(1.5, 1.1, 1.4);
        canopy.castShadow = true;
        palaGroup.add(canopy);

        this.scene.add(palaGroup);
        this.palaTreeMesh = palaGroup;
    }

    // Kerala Ancestral Tharavadu (House) with Veranda, Rooms & Closets
    buildAncestralHouse() {
        const houseGroup = new THREE.Group();
        houseGroup.position.set(18, 0, -85);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0x28231d, roughness: 0.9 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x4a1e16, roughness: 0.8 }); // Red terracotta tile
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x1f160e, roughness: 0.85 });

        // Veranda base (Raised plinth)
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 18), wallMat);
        plinth.position.set(0, 0.3, 0);
        houseGroup.add(plinth);

        // Main House Body
        const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(14, 4.2, 12), wallMat);
        mainBuilding.position.set(0, 2.7, -2.5);
        mainBuilding.castShadow = true;
        mainBuilding.receiveShadow = true;
        houseGroup.add(mainBuilding);

        // Veranda Wooden Pillars
        for (let p = -6; p <= 6; p += 3) {
            const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.6, 8), woodMat);
            pillar.position.set(p, 2.1, 4.2);
            pillar.castShadow = true;
            houseGroup.add(pillar);
        }

        // Tiled Gabled Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(12, 3.8, 4), roofMat);
        roof.position.set(0, 6.2, 0);
        roof.rotation.y = Math.PI / 4;
        roof.scale.set(1.1, 1, 1.3);
        roof.castShadow = true;
        houseGroup.add(roof);

        // Hiding Spot: Wooden Rice Bin / Closet (Nellara) on the Veranda
        const closetGeo = new THREE.BoxGeometry(1.6, 2.4, 1.2);
        const closet = new THREE.Mesh(closetGeo, woodMat);
        closet.position.set(5.2, 1.5, 3.2);
        closet.castShadow = true;
        houseGroup.add(closet);

        this.hidingSpots.push({
            mesh: closet,
            worldPos: new THREE.Vector3(18 + 5.2, 1.5, -85 + 3.2),
            exitPos: new THREE.Vector3(18 + 5.2, 0.5, -85 + 4.8),
            isOccupied: false
        });

        // Evidence Items (Field notebook, disappearance report, copper plate)
        this.createEvidenceItem(18 - 2.5, 1.1, -85 - 1.2, "Ev_01", "Researcher's Notebook", "Observations on Iron Boundary continuity...");
        this.createEvidenceItem(18 + 3.0, 1.1, -85 - 3.5, "Ev_02", "Disappearance Case File #14", "Missing plantation surveyor last seen near Pala tree...");
        this.createEvidenceItem(18 + 0.5, 1.1, -85 + 1.5, "Ev_03", "Ritual Copper Plate Record", "The Yakshi cannot permeate conductive iron lines energized with sacred ash...");

        this.scene.add(houseGroup);
    }

    createEvidenceItem(x, y, z, id, title, text) {
        const docGeo = new THREE.BoxGeometry(0.35, 0.05, 0.45);
        const docMat = new THREE.MeshStandardMaterial({ color: 0xded2b6, roughness: 0.7 });
        const doc = new THREE.Mesh(docGeo, docMat);
        doc.position.set(x, y, z);
        this.scene.add(doc);

        this.evidenceItems.push({
            mesh: doc,
            id: id,
            title: title,
            text: text,
            collected: false
        });
    }

    buildWardStations() {
        // Ward Station A: Village Path (Severed cable)
        this.wardStations['WardA'] = this.createWardStationActor('WardA', -4.2, 0, -24, 'Disconnected', 'Ward Station A: Village Path');

        // Ward Station B: Pala Tree (Damaged boundary)
        this.wardStations['WardB'] = this.createWardStationActor('WardB', -6.5, 0, -68, 'Damaged', 'Ward Station B: Pala Tree');

        // Ward Station C: Ancestral House (Compromised fuse)
        this.wardStations['WardC'] = this.createWardStationActor('WardC', 10.5, 0, -82, 'Damaged', 'Ward Station C: Ancestral House');
    }

    createWardStationActor(id, x, y, z, initialState, displayName) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        const ironMat = new THREE.MeshStandardMaterial({ color: 0x222628, metalness: 0.85, roughness: 0.4 });
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 2.4, 8), ironMat);
        post.position.y = 1.2;
        post.castShadow = true;
        group.add(post);

        // Terminal junction box
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x334044, metalness: 0.7, roughness: 0.5 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.55, 0.35), boxMat);
        box.position.set(0, 1.4, 0.15);
        group.add(box);

        // Status Indicator Light
        const lightGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: (initialState === 'Repaired' ? 0x00f0ff : 0xff3344) });
        const statusSphere = new THREE.Mesh(lightGeo, lightMat);
        statusSphere.position.set(0, 1.6, 0.34);
        group.add(statusSphere);

        // Ground wire connection line
        const wireMat = new THREE.LineBasicMaterial({ color: 0x556677 });
        const points = [new THREE.Vector3(0, 1.2, 0.2), new THREE.Vector3(0, 0.05, 0.5), new THREE.Vector3(2.5, 0.02, 1.2)];
        const wireGeo = new THREE.BufferGeometry().setFromPoints(points);
        const wire = new THREE.Line(wireGeo, wireMat);
        group.add(wire);

        this.scene.add(group);

        return {
            id: id,
            group: group,
            statusLight: statusSphere,
            state: initialState,
            displayName: displayName,
            worldPos: new THREE.Vector3(x, 1.2, z)
        };
    }

    buildSacredShrine() {
        // Southern Sacred Shrine (Safe Extraction Zone at end of road)
        const shrineGroup = new THREE.Group();
        shrineGroup.position.set(0, 0, -155);

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x2f353b, roughness: 0.85 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4a034, metalness: 0.8, roughness: 0.3 });

        // Raised platform
        const platform = new THREE.Mesh(new THREE.CylinderGeometry(6, 6.5, 0.8, 12), stoneMat);
        platform.position.y = 0.4;
        shrineGroup.add(platform);

        // Sacred Vilakku (Traditional brass standing lamp)
        const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 2.2, 8), brassMat);
        lamp.position.y = 1.9;
        lamp.castShadow = true;
        shrineGroup.add(lamp);

        // Warm sanctum flame light
        const flameLight = new THREE.PointLight(0xff9922, 2.8, 22, 1.2);
        flameLight.position.set(0, 2.8, 0);
        flameLight.castShadow = true;
        shrineGroup.add(flameLight);

        this.scene.add(shrineGroup);
        this.shrineZone = {
            position: new THREE.Vector3(0, 0, -155),
            radius: 7.5
        };
    }

    buildRainParticles() {
        const count = 2800;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 180 - 70;
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const rainMat = new THREE.PointsMaterial({
            color: 0x7799aa,
            size: 0.08,
            transparent: true,
            opacity: 0.55
        });

        this.rainParticles = new THREE.Points(rainGeo, rainMat);
        this.scene.add(this.rainParticles);
    }

    updateRain(delta) {
        if (!this.rainParticles) return;
        const pos = this.rainParticles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i) - 34 * delta;
            if (y < 0) y = 25;
            pos.setY(i, y);
        }
        pos.needsUpdate = true;
    }

    toggleFlashlight() {
        this.isFlashlightOn = !this.isFlashlightOn;
        if (this.playerSpotlight) {
            this.playerSpotlight.visible = this.isFlashlightOn;
        }
        if (window.HorrorAudio) {
            window.HorrorAudio.playFlashlightClick();
        }
    }

    triggerFlashlightFlicker(duration = 2.0) {
        this.isFlickering = true;
        const interval = setInterval(() => {
            if (this.playerSpotlight && this.isFlashlightOn) {
                this.playerSpotlight.visible = Math.random() > 0.45;
            }
        }, 75);

        setTimeout(() => {
            clearInterval(interval);
            this.isFlickering = false;
            if (this.playerSpotlight) this.playerSpotlight.visible = this.isFlashlightOn;
        }, duration * 1000);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

window.KeralaWorld = new KeralaWorld();
