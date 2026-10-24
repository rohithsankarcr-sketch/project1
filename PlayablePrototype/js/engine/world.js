/**
 * AYAS: THE LAST WARD - 3D Kerala Environment Builder v2.0
 * Photorealistic Kerala monsoon village: PBR materials, volumetric fog,
 * dynamic lightning, ancient Pala tree, Tharavadu, ward posts, shrine
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
        this.ambientLight = null;

        // Environment groups
        this.environmentGroup = null;

        // Interactive & Landmark Actors
        this.interactables = [];
        this.wardStations = {};
        this.hidingSpots = [];
        this.evidenceItems = [];
        this.shrineZone = null;
        this.palaTreeMesh = null;

        // Particles
        this.rainParticles = null;
        this.fogParticles = null;

        // Flashlight State
        this.isFlashlightOn = true;
        this.flashlightBattery = 100.0;
        this.isFlickering = false;

        // Lightning animation
        this._lightningTimer = 8 + Math.random() * 15;
    }

    init(container) {
        // 1. Scene & Atmosphere
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x010305);
        this.scene.fog = new THREE.FogExp2(0x030811, 0.022);

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.1, 320);
        this.camera.position.set(0, 1.7, 0);

        // 3. Renderer - Max quality
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance",
            logarithmicDepthBuffer: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.72;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        container.appendChild(this.renderer.domElement);

        // 4. Lighting
        this.setupLighting();

        // 5. Environment
        this.buildRoadAndTerrain();
        this.buildLateriteWalls();
        this.buildVegetation();
        this.buildPalaTree();
        this.buildAncestralHouse();
        this.buildWardStations();
        this.buildSacredShrine();
        this.buildRainParticles();
        this.buildGroundFog();

        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Near-total darkness — monsoon night
        this.ambientLight = new THREE.AmbientLight(0x05080f, 0.28);
        this.scene.add(this.ambientLight);

        // Moonlight through storm clouds (very dim blue-white)
        this.moonLight = new THREE.DirectionalLight(0x8eb4cf, 0.38);
        this.moonLight.position.set(30, 75, -40);
        this.moonLight.castShadow = true;
        this.moonLight.shadow.mapSize.width = 2048;
        this.moonLight.shadow.mapSize.height = 2048;
        this.moonLight.shadow.camera.near = 10;
        this.moonLight.shadow.camera.far = 200;
        this.moonLight.shadow.camera.left = -70;
        this.moonLight.shadow.camera.right = 70;
        this.moonLight.shadow.camera.top = 70;
        this.moonLight.shadow.camera.bottom = -70;
        this.moonLight.shadow.bias = -0.0005;
        this.scene.add(this.moonLight);

        // Lightning flash light (dramatic top-down fill)
        this.lightningLight = new THREE.DirectionalLight(0xc8deff, 0);
        this.lightningLight.position.set(0, 80, 0);
        this.scene.add(this.lightningLight);

        // Player Flashlight — warm tungsten tone
        this.playerSpotlight = new THREE.SpotLight(0xfff0d6, 5.5, 42, Math.PI / 6.5, 0.28, 1.4);
        this.playerSpotlight.position.set(0.18, -0.12, -0.05);
        this.playerSpotlight.castShadow = true;
        this.playerSpotlight.shadow.mapSize.width = 1024;
        this.playerSpotlight.shadow.mapSize.height = 1024;
        this.playerSpotlight.shadow.camera.near = 0.1;
        this.playerSpotlight.shadow.camera.far = 45;
        this.camera.add(this.playerSpotlight);

        const spotTarget = new THREE.Object3D();
        spotTarget.position.set(0, -0.08, -6);
        this.camera.add(spotTarget);
        this.playerSpotlight.target = spotTarget;

        this.scene.add(this.camera);
    }

    triggerLightning() {
        if (!this.lightningLight) return;
        // Multi-flash lightning sequence
        const flashes = [
            { delay: 0, intensity: 22, dur: 70 },
            { delay: 120, intensity: 15, dur: 50 },
            { delay: 200, intensity: 0, dur: 40 },
            { delay: 260, intensity: 20, dur: 60 },
            { delay: 380, intensity: 0, dur: 0 }
        ];
        flashes.forEach(f => {
            setTimeout(() => {
                if (this.lightningLight) this.lightningLight.intensity = f.intensity;
            }, f.delay);
        });
        if (window.HorrorAudio) setTimeout(() => window.HorrorAudio.playDistantThunder(), 500);
    }

    buildRoadAndTerrain() {
        // Wet muddy Kerala dirt road with geometric rutting
        const groundGeo = new THREE.PlaneGeometry(130, 300, 60, 60);
        groundGeo.rotateX(-Math.PI / 2);

        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);
            let y = Math.sin(x * 0.18) * 0.14 + Math.cos(z * 0.09) * 0.18 + (Math.random() - 0.5) * 0.06;
            if (Math.abs(x) < 5) y -= 0.22; // road depression
            pos.setY(i, y);
        }
        groundGeo.computeVertexNormals();

        // Wet dark earth - laterite red shoulders
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x0d0f0b,
            roughness: 0.7,
            metalness: 0.18
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.position.set(0, 0, -95);
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Laterite-red earth shoulders (the distinctive Kerala red soil)
        const shoulderMat = new THREE.MeshStandardMaterial({ color: 0x3a1508, roughness: 0.95 });
        const leftShoulder = new THREE.Mesh(new THREE.PlaneGeometry(20, 300), shoulderMat);
        leftShoulder.rotateX(-Math.PI / 2);
        leftShoulder.position.set(-15, -0.05, -95);
        leftShoulder.receiveShadow = true;
        this.scene.add(leftShoulder);

        const rightShoulder = new THREE.Mesh(new THREE.PlaneGeometry(20, 300), shoulderMat);
        rightShoulder.rotateX(-Math.PI / 2);
        rightShoulder.position.set(15, -0.05, -95);
        rightShoulder.receiveShadow = true;
        this.scene.add(rightShoulder);

        // Reflective water puddles - monsoon road
        this._buildPuddles();

        // Road sign at entrance
        this._buildRoadSign(-4.5, 0, -8);

        // Scattered rocks on shoulders
        this._buildScatteredRocks();
    }

    _buildPuddles() {
        const puddleMat = new THREE.MeshStandardMaterial({
            color: 0x020508,
            roughness: 0.02,
            metalness: 0.92,
            envMapIntensity: 1.0
        });
        const puddlePositions = [
            [-1.8, 0.02, -12, 1.4, 0.7],
            [2.5, 0.02, -28, 1.8, 0.9],
            [-1.2, 0.02, -48, 2.2, 1.1],
            [1.8, 0.02, -72, 1.5, 0.8],
            [-2.0, 0.02, -95, 2.8, 1.2],
            [0.5, 0.02, -118, 1.6, 0.7],
            [-1.5, 0.02, -138, 2.0, 1.0],
        ];
        puddlePositions.forEach(([px, py, pz, sx, sz]) => {
            const geo = new THREE.PlaneGeometry(sx * 2, sz * 2, 1, 1);
            geo.rotateX(-Math.PI / 2);
            const mesh = new THREE.Mesh(geo, puddleMat);
            mesh.position.set(px, py, pz);
            this.scene.add(mesh);
        });
    }

    _buildRoadSign(x, y, z) {
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x1a1208, roughness: 0.95 });
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 2.4, 7), woodMat);
        post.position.set(x, y + 1.2, z);
        post.castShadow = true;
        this.scene.add(post);

        const boardMat = new THREE.MeshStandardMaterial({ color: 0x382e22, roughness: 0.85 });
        const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 0.06), boardMat);
        board.position.set(x, y + 2.1, z);
        board.rotation.y = Math.PI / 9;
        board.castShadow = true;
        this.scene.add(board);
    }

    _buildScatteredRocks() {
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x1e1c18, roughness: 0.88 });
        const rockData = [
            [-7, 0, -18, 0.3], [9, 0, -32, 0.22], [-8.5, 0, -56, 0.4],
            [8, 0, -78, 0.28], [-9, 0, -102, 0.35], [8.5, 0, -122, 0.25],
            [-7.5, 0, -148, 0.32]
        ];
        rockData.forEach(([rx, ry, rz, rs]) => {
            const geo = new THREE.DodecahedronGeometry(rs, 0);
            const rock = new THREE.Mesh(geo, rockMat);
            rock.position.set(rx, ry + rs * 0.5, rz);
            rock.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
        });
    }

    buildLateriteWalls() {
        // Authentic Kerala laterite stone walls — dark red-ochre with moss
        const lateriteMat = new THREE.MeshStandardMaterial({
            color: 0x4a1e12,
            roughness: 0.96,
            metalness: 0.02
        });
        const mossMat = new THREE.MeshStandardMaterial({
            color: 0x162012,
            roughness: 0.92
        });

        const wallSegments = [
            [-5.8, 0, -15, 1.4, 1.5, 26],
            [-5.8, 0, -52, 1.4, 1.5, 38],
            [-5.8, 0, -98, 1.4, 1.5, 48],
            [5.8, 0, -18, 1.4, 1.5, 30],
            [5.8, 0, -58, 1.4, 1.5, 42],
            [5.8, 0, -108, 1.4, 1.5, 52]
        ];

        wallSegments.forEach(([wx, wy, wz, wW, wH, wD]) => {
            const wall = new THREE.Mesh(new THREE.BoxGeometry(wW, wH, wD), lateriteMat);
            wall.position.set(wx, wy + wH / 2, wz);
            wall.castShadow = true;
            wall.receiveShadow = true;
            this.scene.add(wall);

            // Irregular stone texture via displaced block joints
            for (let jz = -wD / 2; jz < wD / 2; jz += 2.5) {
                const jointH = 0.08 + Math.random() * 0.04;
                const joint = new THREE.Mesh(
                    new THREE.BoxGeometry(wW + 0.05, jointH, 0.05),
                    mossMat
                );
                joint.position.set(wx, wy + 0.4 + Math.random() * wH, wz + jz);
                this.scene.add(joint);
            }

            // Moss cap on top
            const cap = new THREE.Mesh(new THREE.BoxGeometry(wW + 0.12, 0.12, wD + 0.02), mossMat);
            cap.position.set(wx, wy + wH + 0.06, wz);
            this.scene.add(cap);
        });
    }

    buildVegetation() {
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x231a10, roughness: 0.92 });
        const coconutLeafMat = new THREE.MeshStandardMaterial({ color: 0x0e1f0c, roughness: 0.85 });
        const bambooMat = new THREE.MeshStandardMaterial({ color: 0x1a2810, roughness: 0.88 });
        const fernMat = new THREE.MeshStandardMaterial({ color: 0x0c1a0a, roughness: 0.9 });

        // Coconut palms (Kerala's iconic tree)
        const palmPositions = [
            [-8.5, 0, -16], [9.2, 0, -24], [-9.0, 0, -40], [8.8, 0, -55],
            [-8.2, 0, -78], [9.5, 0, -96], [-9.2, 0, -118], [8.5, 0, -134],
            [-8.8, 0, -152]
        ];

        palmPositions.forEach(([px, py, pz]) => {
            const height = 9.5 + Math.random() * 5;
            const lean = (Math.random() - 0.5) * 0.14;

            // Tapered trunk with rings
            const trunk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.18, 0.35, height, 9),
                trunkMat
            );
            trunk.position.set(px, py + height / 2, pz);
            trunk.rotation.z = lean;
            trunk.castShadow = true;
            this.scene.add(trunk);

            // Palm frond crown (drooping under rain)
            const crownGroup = new THREE.Group();
            crownGroup.position.set(px + lean * height * 0.5, py + height, pz);
            for (let f = 0; f < 10; f++) {
                const angle = (f / 10) * Math.PI * 2;
                const frondLen = 3.8 + Math.random() * 1.2;
                const frond = new THREE.Mesh(
                    new THREE.BoxGeometry(0.32, 0.06, frondLen),
                    coconutLeafMat
                );
                frond.position.set(Math.sin(angle) * 1.5, -0.8 - f * 0.05, Math.cos(angle) * 1.5);
                frond.rotation.y = angle;
                frond.rotation.x = 0.45 + Math.random() * 0.3;
                crownGroup.add(frond);
            }
            this.scene.add(crownGroup);
        });

        // Bamboo clumps (thick monsoon bamboo)
        const bambooClumps = [[-12, 0, -28], [12.5, 0, -46], [-13, 0, -72], [13, 0, -88], [-12.5, 0, -112]];
        bambooClumps.forEach(([bx, by, bz]) => {
            for (let i = 0; i < 5; i++) {
                const offX = (Math.random() - 0.5) * 2.5;
                const offZ = (Math.random() - 0.5) * 2.5;
                const bh = 7 + Math.random() * 4;
                const bamb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, bh, 6), bambooMat);
                bamb.position.set(bx + offX, by + bh / 2, bz + offZ);
                bamb.rotation.z = (Math.random() - 0.5) * 0.1;
                bamb.castShadow = true;
                this.scene.add(bamb);
            }
        });

        // Ground ferns and undergrowth
        const fernPositions = [
            [-6.5, 0, -20], [-6.5, 0, -35], [6.5, 0, -42], [-6.5, 0, -60],
            [6.5, 0, -68], [-6.5, 0, -82], [6.5, 0, -105]
        ];
        fernPositions.forEach(([fx, fy, fz]) => {
            for (let i = 0; i < 3; i++) {
                const fern = new THREE.Mesh(
                    new THREE.ConeGeometry(0.6 + Math.random() * 0.3, 0.55, 5),
                    fernMat
                );
                fern.position.set(fx + (Math.random() - 0.5), fy + 0.25, fz + (Math.random() - 0.5) * 2);
                fern.rotation.y = Math.random() * Math.PI * 2;
                this.scene.add(fern);
            }
        });
    }

    buildPalaTree() {
        // Ancient Pala (Alstonia scholaris) — the Devil Tree of Kerala
        // Massive, twisted, deeply ominous — the entity's anchor point
        const palaGroup = new THREE.Group();
        palaGroup.position.set(-11, 0, -65);

        const barkMat = new THREE.MeshStandardMaterial({
            color: 0x120e0b,
            roughness: 0.98,
            metalness: 0.0
        });
        const innerBarkMat = new THREE.MeshStandardMaterial({ color: 0x1a1410, roughness: 0.95 });
        const darkLeavesMat = new THREE.MeshStandardMaterial({
            color: 0x090f07,
            roughness: 0.9,
            side: THREE.DoubleSide
        });

        // Massive main trunk (ancient — over 200 years old)
        const mainTrunk = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 3.2, 16, 12), barkMat);
        mainTrunk.position.y = 8;
        mainTrunk.castShadow = true;
        mainTrunk.receiveShadow = true;
        palaGroup.add(mainTrunk);

        // Twisted secondary trunks growing at weird angles
        const branchData = [
            [0.3, 0.7, 0.45, 3.2, 1.8, 10, 4.5],
            [1.5, 0.4, 0.55, -2.8, 1.5, 9, 4.2],
            [2.8, 0.5, 0.3, 3.5, 1.6, 8, 5.0],
            [4.2, 0.6, 0.4, -3.0, 1.7, 10, 4.8],
            [5.5, 0.4, 0.5, 2.5, 1.2, 9, 4.5]
        ];
        branchData.forEach(([rad, rx, rz, px, pz, h, radius]) => {
            const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.65, h, 8), barkMat);
            branch.position.set(Math.cos(rad) * radius, 1.5, Math.sin(rad) * radius);
            branch.rotation.z = Math.cos(rad) * rx * 0.6;
            branch.rotation.x = Math.sin(rad) * rz * 0.6;
            branch.castShadow = true;
            palaGroup.add(branch);
        });

        // Surface roots writhing on the ground
        for (let r = 0; r < 8; r++) {
            const angle = (r / 8) * Math.PI * 2;
            const rootLen = 3.5 + Math.random() * 3;
            for (let seg = 0; seg < 3; seg++) {
                const rootSeg = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.08, 0.18, rootLen / 3, 6),
                    barkMat
                );
                rootSeg.position.set(
                    Math.cos(angle) * (2.5 + seg * 1.2),
                    0.06,
                    Math.sin(angle) * (2.5 + seg * 1.2)
                );
                rootSeg.rotation.z = Math.cos(angle) * 1.4;
                rootSeg.rotation.x = Math.sin(angle) * 0.3;
                palaGroup.add(rootSeg);
            }
        }

        // Massive dark canopy — dead weight of leaves
        const canopyLayers = [
            [0, 17, 0, 7.5, 1.2, 7.0],
            [1.2, 14.5, 0.8, 5.0, 0.9, 4.8],
            [-1.0, 15.8, -1.2, 4.5, 0.85, 4.2],
            [2.0, 16.5, -1.5, 3.5, 0.8, 3.5],
        ];
        canopyLayers.forEach(([cx, cy, cz, sx, sy, sz]) => {
            const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(4, 1), darkLeavesMat);
            canopy.position.set(cx, cy, cz);
            canopy.scale.set(sx / 4, sy / 4 * 0.8, sz / 4);
            canopy.castShadow = true;
            palaGroup.add(canopy);
        });

        // Pala tree has white flowers in folklore — eerie dead white blossoms
        const blossomMat = new THREE.MeshStandardMaterial({
            color: 0xddd8c8,
            roughness: 0.7,
            emissive: 0x151412,
            emissiveIntensity: 0.4
        });
        for (let b = 0; b < 12; b++) {
            const bx = (Math.random() - 0.5) * 8;
            const by = 12 + Math.random() * 5;
            const bz = (Math.random() - 0.5) * 8;
            const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.08, 5, 5), blossomMat);
            blossom.position.set(bx, by, bz);
            palaGroup.add(blossom);
        }

        // Eerie dim green point light beneath the tree
        const treeGlow = new THREE.PointLight(0x0a1f05, 0.6, 12, 2);
        treeGlow.position.set(0, 2, 0);
        palaGroup.add(treeGlow);

        this.scene.add(palaGroup);
        this.palaTreeMesh = palaGroup;
    }

    buildAncestralHouse() {
        // Kerala Tharavadu (ancestral manor) — Nalukettu style
        const houseGroup = new THREE.Group();
        houseGroup.position.set(18, 0, -85);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0x1e1912, roughness: 0.92 });
        const plasterMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.88 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x3d1208, roughness: 0.82 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x160e07, roughness: 0.88 });
        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x222825, roughness: 0.9 });

        // Raised stone plinth (traditional Kerala house foundation)
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(20, 0.85, 22), stoneMat);
        plinth.position.set(0, 0.42, 0);
        plinth.castShadow = true;
        plinth.receiveShadow = true;
        houseGroup.add(plinth);

        // Main House Body (thick laterite walls)
        const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 14), wallMat);
        mainBuilding.position.set(0, 3.1, -2.5);
        mainBuilding.castShadow = true;
        mainBuilding.receiveShadow = true;
        houseGroup.add(mainBuilding);

        // Exterior plaster texture strips
        for (let si = -6; si <= 6; si += 3) {
            const strip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.2, 14.1), plasterMat);
            strip.position.set(si, 3.0, -2.5);
            houseGroup.add(strip);
        }

        // Veranda (deep front porch — Thinnai)
        const veranda = new THREE.Mesh(new THREE.BoxGeometry(18, 3.2, 6), plasterMat);
        veranda.position.set(0, 2.45, 5.5);
        veranda.castShadow = true;
        houseGroup.add(veranda);

        // Carved wooden columns (Kerala temple style)
        for (let p = -7; p <= 7; p += 3.5) {
            const pillarGeo = new THREE.CylinderGeometry(0.14, 0.18, 3.5, 10);
            const pillar = new THREE.Mesh(pillarGeo, woodMat);
            pillar.position.set(p, 2.6, 8.2);
            pillar.castShadow = true;
            houseGroup.add(pillar);

            // Pillar cap
            const cap = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.4), woodMat);
            cap.position.set(p, 4.2, 8.2);
            houseGroup.add(cap);
        }

        // Kerala gabled tile roof — steep pitch
        const roofMain = new THREE.Mesh(new THREE.ConeGeometry(13, 4.5, 4), roofMat);
        roofMain.position.set(0, 6.8, 0);
        roofMain.rotation.y = Math.PI / 4;
        roofMain.scale.set(1.1, 1.0, 1.35);
        roofMain.castShadow = true;
        houseGroup.add(roofMain);

        // Veranda roof overhang
        const verandaRoof = new THREE.Mesh(new THREE.BoxGeometry(19, 0.18, 8), roofMat);
        verandaRoof.position.set(0, 4.12, 5.5);
        verandaRoof.castShadow = true;
        houseGroup.add(verandaRoof);

        // Dark windows (boarded up)
        const windowMat = new THREE.MeshStandardMaterial({ color: 0x06080a, roughness: 0.9 });
        const windowPositions = [
            [-5.5, 3.2, -9.1], [0, 3.2, -9.1], [5.5, 3.2, -9.1],
            [-8.05, 3.2, -2.5], [8.05, 3.2, -2.5]
        ];
        windowPositions.forEach(([wx, wy, wz]) => {
            const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 0.08), windowMat);
            win.position.set(wx, wy, wz);
            houseGroup.add(win);
            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.3, 0.05), woodMat);
            frame.position.set(wx, wy, wz - 0.02);
            houseGroup.add(frame);
        });

        // Main doorway (open — dark void inside)
        const doorMat = new THREE.MeshStandardMaterial({ color: 0x020203, roughness: 0.9 });
        const door = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.8, 0.12), doorMat);
        door.position.set(0, 2.55, 2.55);
        houseGroup.add(door);

        // Interior dim glow (eerie blue-green from inside)
        const interiorLight = new THREE.PointLight(0x051810, 0.4, 8, 2);
        interiorLight.position.set(0, 2.5, -1.5);
        houseGroup.add(interiorLight);

        // Hiding Spot: Nellara (wooden rice storage bin)
        const closet = new THREE.Mesh(new THREE.BoxGeometry(1.8, 2.6, 1.4), woodMat);
        closet.position.set(5.5, 2.15, 7.5);
        closet.castShadow = true;
        houseGroup.add(closet);

        this.hidingSpots.push({
            mesh: closet,
            worldPos: new THREE.Vector3(18 + 5.5, 1.8, -85 + 7.5),
            exitPos: new THREE.Vector3(18 + 5.5, 0.9, -85 + 9.5),
            isOccupied: false
        });

        // Evidence Items
        this.createEvidenceItem(18 - 2.8, 1.2, -85 - 1.5, "Ev_01", "Researcher's Notebook",
            "Iron boundary continuity disrupted at all 3 stations...");
        this.createEvidenceItem(18 + 3.2, 1.2, -85 - 3.8, "Ev_02", "Disappearance Case File #14",
            "Missing surveyor last seen near Pala tree at 2 AM...");
        this.createEvidenceItem(18 + 0.8, 1.2, -85 + 1.8, "Ev_03", "Ritual Copper Plate",
            "The Yakshi cannot permeate iron lines energized with sacred ash...");

        this.scene.add(houseGroup);
    }

    createEvidenceItem(x, y, z, id, title, text) {
        const docGeo = new THREE.BoxGeometry(0.32, 0.04, 0.42);
        const docMat = new THREE.MeshStandardMaterial({
            color: 0xcec0a4,
            roughness: 0.75,
            emissive: 0x181410,
            emissiveIntensity: 0.3
        });
        const doc = new THREE.Mesh(docGeo, docMat);
        doc.position.set(x, y, z);
        doc.castShadow = true;

        // Subtle glow around evidence
        const glow = new THREE.PointLight(0xd4a034, 0.5, 2.5, 2.5);
        glow.position.set(x, y + 0.3, z);
        this.scene.add(glow);
        this.scene.add(doc);

        this.evidenceItems.push({ mesh: doc, id, title, text, collected: false });
    }

    buildWardStations() {
        this.wardStations['WardA'] = this._createWardStation('WardA', -4.5, 0, -25, 'Disconnected', 'Ward A — Village Path');
        this.wardStations['WardB'] = this._createWardStation('WardB', -7.0, 0, -70, 'Damaged', 'Ward B — Pala Tree');
        this.wardStations['WardC'] = this._createWardStation('WardC', 11.0, 0, -84, 'Damaged', 'Ward C — Ancestral House');
    }

    _createWardStation(id, x, y, z, initialState, displayName) {
        const group = new THREE.Group();
        group.position.set(x, y, z);

        const ironMat = new THREE.MeshStandardMaterial({ color: 0x1c2224, metalness: 0.9, roughness: 0.35 });
        const rustyMat = new THREE.MeshStandardMaterial({ color: 0x3a2118, metalness: 0.6, roughness: 0.7 });
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x263035, metalness: 0.75, roughness: 0.45 });

        // Main iron post with realistic taper
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 2.6, 9), ironMat);
        post.position.y = 1.3;
        post.castShadow = true;
        group.add(post);

        // Junction box (weathered)
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.38), boxMat);
        box.position.set(0, 1.55, 0.18);
        box.castShadow = true;
        group.add(box);

        // Bolt details on box
        const boltMat = new THREE.MeshStandardMaterial({ color: 0x14191c, metalness: 0.85, roughness: 0.4 });
        [[0.22, 1.75, 0.38], [-0.22, 1.75, 0.38], [0.22, 1.35, 0.38], [-0.22, 1.35, 0.38]].forEach(([bx, by, bz]) => {
            const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 5), boltMat);
            bolt.position.set(bx, by, bz);
            bolt.rotation.x = Math.PI / 2;
            group.add(bolt);
        });

        // Status indicator light (LED style)
        const isActive = initialState === 'Repaired';
        const lightColor = isActive ? 0x00f0ff : 0xff2233;
        const lightGeo = new THREE.SphereGeometry(0.055, 8, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: lightColor });
        const statusSphere = new THREE.Mesh(lightGeo, lightMat);
        statusSphere.position.set(0, 1.72, 0.38);
        group.add(statusSphere);

        // Point light matching LED
        const ledLight = new THREE.PointLight(lightColor, isActive ? 0.8 : 0.5, 3.5, 2);
        ledLight.position.set(0, 1.72, 0.38);
        group.add(ledLight);

        // Ground conduit wire
        const wireMat = new THREE.LineBasicMaterial({ color: 0x445566 });
        const pts = [new THREE.Vector3(0, 1.3, 0.15), new THREE.Vector3(0, 0.02, 0.5), new THREE.Vector3(3.0, 0.02, 1.5)];
        const wireGeo = new THREE.BufferGeometry().setFromPoints(pts);
        group.add(new THREE.Line(wireGeo, wireMat));

        // Rust patches on post base
        const rust = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.4, 8), rustyMat);
        rust.position.y = 0.2;
        group.add(rust);

        this.scene.add(group);

        return {
            id, group, statusLight: statusSphere, ledLight,
            state: initialState, displayName,
            worldPos: new THREE.Vector3(x, 1.3, z)
        };
    }

    buildSacredShrine() {
        // Kavu — Sacred temple grove shrine at southern end
        const shrineGroup = new THREE.Group();
        shrineGroup.position.set(0, 0, -158);

        const stoneMat = new THREE.MeshStandardMaterial({ color: 0x252c2a, roughness: 0.88 });
        const graniteSlabMat = new THREE.MeshStandardMaterial({ color: 0x1c2220, roughness: 0.92 });
        const brassMat = new THREE.MeshStandardMaterial({ color: 0xb88a2a, metalness: 0.85, roughness: 0.28 });
        const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4a034, metalness: 0.9, roughness: 0.22 });

        // Stone platform steps (3 tiers)
        for (let tier = 0; tier < 3; tier++) {
            const r = 9 - tier * 1.5;
            const h = 0.32 + tier * 0.18;
            const plat = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.25, h, 14), stoneMat);
            plat.position.y = tier * 0.45 + h / 2;
            plat.receiveShadow = true;
            shrineGroup.add(plat);
        }

        // Central shrine pillar
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 3.2, 10), graniteSlabMat);
        pillar.position.y = 2.9;
        pillar.castShadow = true;
        shrineGroup.add(pillar);

        // Shrine top capstone
        const capstone = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 8), stoneMat);
        capstone.position.y = 5.0;
        capstone.castShadow = true;
        shrineGroup.add(capstone);

        // 4 traditional Vilakku (standing brass lamps)
        const lampPositions = [[3.5, 0, 0], [-3.5, 0, 0], [0, 0, 3.5], [0, 0, -3.5]];
        lampPositions.forEach(([lx, ly, lz]) => {
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.35, 0.18, 8), brassMat);
            base.position.set(lx, 1.45, lz);
            shrineGroup.add(base);

            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.6, 7), brassMat);
            stem.position.set(lx, 2.24, lz);
            shrineGroup.add(stem);

            const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), goldMat);
            bowl.position.set(lx, 3.1, lz);
            shrineGroup.add(bowl);

            // Warm flame light
            const flame = new THREE.PointLight(0xff8811, 1.8, 14, 1.8);
            flame.position.set(lx, 3.3, lz);
            shrineGroup.add(flame);
        });

        // Main shrine warm glow
        const shrineLight = new THREE.PointLight(0xff9933, 3.5, 28, 1.5);
        shrineLight.position.set(0, 3.5, 0);
        shrineGroup.add(shrineLight);

        // Decorative stone slabs radiating from center
        for (let s = 0; s < 8; s++) {
            const angle = (s / 8) * Math.PI * 2;
            const slab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 2.0), graniteSlabMat);
            slab.position.set(Math.cos(angle) * 5.5, 1.05, Math.sin(angle) * 5.5);
            slab.rotation.y = angle;
            shrineGroup.add(slab);
        }

        this.scene.add(shrineGroup);
        this.shrineZone = { position: new THREE.Vector3(0, 0, -158), radius: 8.5 };
    }

    buildRainParticles() {
        // Heavy monsoon rain — angled streaks
        const count = 5000;
        const rainGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3]     = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = Math.random() * 28;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200 - 80;
            velocities[i] = 20 + Math.random() * 18;
        }

        rainGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this._rainVelocities = velocities;

        const rainMat = new THREE.PointsMaterial({
            color: 0x5588aa,
            size: 0.065,
            transparent: true,
            opacity: 0.48,
            sizeAttenuation: true
        });

        this.rainParticles = new THREE.Points(rainGeo, rainMat);
        this.scene.add(this.rainParticles);
    }

    buildGroundFog() {
        // Low-lying ground mist particles (volumetric feel)
        const fogCount = 400;
        const fogGeo = new THREE.BufferGeometry();
        const fogPos = new Float32Array(fogCount * 3);

        for (let i = 0; i < fogCount; i++) {
            fogPos[i * 3]     = (Math.random() - 0.5) * 30;
            fogPos[i * 3 + 1] = Math.random() * 0.8;
            fogPos[i * 3 + 2] = (Math.random() - 0.5) * 180 - 80;
        }
        fogGeo.setAttribute('position', new THREE.BufferAttribute(fogPos, 3));

        const fogMat = new THREE.PointsMaterial({
            color: 0x1a2535,
            size: 2.8,
            transparent: true,
            opacity: 0.08,
            sizeAttenuation: true
        });

        this.fogParticles = new THREE.Points(fogGeo, fogMat);
        this.scene.add(this.fogParticles);
    }

    updateRain(delta) {
        if (!this.rainParticles) return;
        const pos = this.rainParticles.geometry.attributes.position;
        const vels = this._rainVelocities;

        for (let i = 0; i < pos.count; i++) {
            let y = pos.getY(i) - vels[i] * delta;
            // Slight horizontal drift (monsoon wind)
            let x = pos.getX(i) + 1.8 * delta;
            if (y < -0.5) {
                y = 28;
                x = (Math.random() - 0.5) * 80;
            }
            pos.setY(i, y);
            pos.setX(i, x);
        }
        pos.needsUpdate = true;

        // Auto-lightning
        this._lightningTimer -= delta;
        if (this._lightningTimer <= 0) {
            this.triggerLightning();
            this._lightningTimer = 10 + Math.random() * 22;
        }
    }

    toggleFlashlight() {
        this.isFlashlightOn = !this.isFlashlightOn;
        if (this.playerSpotlight) this.playerSpotlight.visible = this.isFlashlightOn;
        if (window.HorrorAudio) window.HorrorAudio.playFlashlightClick();
    }

    triggerFlashlightFlicker(duration = 2.5) {
        if (this.isFlickering) return;
        this.isFlickering = true;
        const interval = setInterval(() => {
            if (this.playerSpotlight && this.isFlashlightOn) {
                this.playerSpotlight.visible = Math.random() > 0.4;
                this.playerSpotlight.intensity = 2.5 + Math.random() * 4;
            }
        }, 65);

        setTimeout(() => {
            clearInterval(interval);
            this.isFlickering = false;
            if (this.playerSpotlight) {
                this.playerSpotlight.visible = this.isFlashlightOn;
                this.playerSpotlight.intensity = 5.5;
            }
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
