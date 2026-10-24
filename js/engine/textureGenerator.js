/**
 * AYAS: THE LAST WARD - Procedural High-Fidelity PBR Texture Generator
 * Generates realistic procedural diffuse, bump, and roughness maps for Kerala architecture and nature
 */

class TextureGenerator {
    static createMoonTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Moon base tone
        ctx.fillStyle = '#b0c4de';
        ctx.fillRect(0, 0, 512, 512);

        // Maria (Dark volcanic plains)
        ctx.fillStyle = '#6b7d96';
        const maria = [
            [180, 200, 110], [320, 180, 90], [240, 290, 80],
            [140, 310, 70], [350, 310, 85], [260, 140, 60]
        ];
        maria.forEach(([x, y, r]) => {
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.filter = 'blur(24px)';
            ctx.fill();
        });
        ctx.filter = 'none';

        // Fine craters
        for (let i = 0; i < 90; i++) {
            const cx = Math.random() * 512;
            const cy = Math.random() * 512;
            const cr = 2 + Math.random() * 14;
            ctx.fillStyle = 'rgba(230, 240, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(cx, cy, cr, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'rgba(40, 50, 65, 0.45)';
            ctx.beginPath();
            ctx.arc(cx + cr * 0.3, cy + cr * 0.3, cr * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static createTreeBarkTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base dark wood tone
        ctx.fillStyle = '#1c1712';
        ctx.fillRect(0, 0, 512, 512);

        // Deep vertical bark grooves
        for (let x = 0; x < 512; x += 4) {
            const shade = 18 + Math.floor(Math.sin(x * 0.1) * 12 + Math.random() * 20);
            ctx.fillStyle = `rgb(${shade + 8}, ${shade + 4}, ${shade})`;
            ctx.fillRect(x, 0, 3, 512);
        }

        // Horizontal fissures & fibrous roughness
        for (let i = 0; i < 400; i++) {
            const y = Math.random() * 512;
            const h = 2 + Math.random() * 6;
            ctx.fillStyle = 'rgba(10, 8, 6, 0.55)';
            ctx.fillRect(Math.random() * 512, y, 15 + Math.random() * 45, h);
        }

        // Patches of damp green moss (as seen in Kerala groves)
        for (let i = 0; i < 60; i++) {
            const mx = Math.random() * 512;
            const my = Math.random() * 512;
            const mr = 15 + Math.random() * 35;
            const grad = ctx.createRadialGradient(mx, my, 2, mx, my, mr);
            grad.addColorStop(0, 'rgba(45, 75, 28, 0.7)');
            grad.addColorStop(0.6, 'rgba(25, 48, 18, 0.4)');
            grad.addColorStop(1, 'rgba(25, 48, 18, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(mx, my, mr, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 4);
        return texture;
    }

    static createMossyStoneTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Aged granite stone base
        ctx.fillStyle = '#3a3935';
        ctx.fillRect(0, 0, 512, 512);

        // Stone speckle and grain
        for (let i = 0; i < 20000; i++) {
            const v = Math.random() > 0.5 ? 255 : 0;
            ctx.fillStyle = `rgba(${v}, ${v}, ${v}, 0.07)`;
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        // Stone joint lines / blocks
        ctx.strokeStyle = 'rgba(18, 16, 14, 0.7)';
        ctx.lineWidth = 4;
        for (let y = 64; y < 512; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(512, y);
            ctx.stroke();

            const offset = (y % 128 === 0) ? 0 : 64;
            for (let x = offset; x < 512; x += 128) {
                ctx.beginPath();
                ctx.moveTo(x, y - 64);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }

        // Green velvet moss layers on wet stone
        for (let i = 0; i < 80; i++) {
            const mx = Math.random() * 512;
            const my = Math.random() * 512;
            const mr = 20 + Math.random() * 45;
            const grad = ctx.createRadialGradient(mx, my, 4, mx, my, mr);
            grad.addColorStop(0, 'rgba(52, 85, 32, 0.65)');
            grad.addColorStop(0.7, 'rgba(30, 55, 20, 0.35)');
            grad.addColorStop(1, 'rgba(30, 55, 20, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(mx, my, mr, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static createLateriteBrickTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Red-ochre Laterite clay base
        ctx.fillStyle = '#6e2f1e';
        ctx.fillRect(0, 0, 512, 512);

        // Brick blocks with rough porous holes
        const blockH = 48;
        const blockW = 96;

        for (let row = 0; row < 512 / blockH; row++) {
            const y = row * blockH;
            const xShift = (row % 2 === 0) ? 0 : blockW / 2;

            for (let col = -1; col < (512 / blockW) + 1; col++) {
                const x = col * blockW + xShift;

                // Color variation between laterite blocks
                const hue = 15 + Math.random() * 8;
                const sat = 55 + Math.random() * 20;
                const light = 24 + Math.random() * 12;
                ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
                ctx.fillRect(x + 2, y + 2, blockW - 4, blockH - 4);

                // Porous iron ore pockets
                for (let p = 0; p < 25; p++) {
                    ctx.fillStyle = 'rgba(25, 10, 6, 0.6)';
                    ctx.beginPath();
                    ctx.arc(x + 4 + Math.random() * (blockW - 8), y + 4 + Math.random() * (blockH - 8), 1 + Math.random() * 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Mortar joints
            ctx.fillStyle = 'rgba(35, 25, 20, 0.85)';
            ctx.fillRect(0, y, 512, 3);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    static createWoodPlankTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Dark oiled teak/rosewood base
        ctx.fillStyle = '#26180f';
        ctx.fillRect(0, 0, 512, 512);

        // Wood grain stripes
        for (let x = 0; x < 512; x++) {
            const grain = Math.sin(x * 0.25) * 8 + (Math.random() - 0.5) * 12;
            const col = 32 + grain;
            ctx.fillStyle = `rgba(${col + 10}, ${col + 4}, ${col}, 0.25)`;
            ctx.fillRect(x, 0, 1, 512);
        }

        // Horizontal plank seams
        ctx.fillStyle = 'rgba(10, 5, 2, 0.9)';
        for (let y = 0; y < 512; y += 64) {
            ctx.fillRect(0, y, 512, 4);
        }

        // Iron nail studs
        ctx.fillStyle = '#0f0f12';
        for (let y = 32; y < 512; y += 64) {
            for (let x = 24; x < 512; x += 120) {
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static createDirtRoadTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Dark wet mud road base
        ctx.fillStyle = '#1c1915';
        ctx.fillRect(0, 0, 512, 512);

        // Soil texture grain
        for (let i = 0; i < 30000; i++) {
            const v = Math.random() > 0.5 ? 50 : 15;
            ctx.fillStyle = `rgba(${v + 10}, ${v + 4}, ${v}, 0.15)`;
            ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
        }

        // Dark damp wheel rut depressions
        ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
        ctx.fillRect(90, 0, 70, 512);
        ctx.fillRect(350, 0, 70, 512);

        // Scattered gravel stones
        for (let i = 0; i < 180; i++) {
            const gx = Math.random() * 512;
            const gy = Math.random() * 512;
            const gr = 1.5 + Math.random() * 3.5;
            ctx.fillStyle = 'rgba(110, 95, 80, 0.6)';
            ctx.beginPath();
            ctx.arc(gx, gy, gr, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 12);
        return texture;
    }

    static createKasavuSareeTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Off-white cream cotton weave
        ctx.fillStyle = '#f5f3ec';
        ctx.fillRect(0, 0, 256, 512);

        // Fine cotton texture
        for (let y = 0; y < 512; y += 2) {
            ctx.fillStyle = (y % 4 === 0) ? 'rgba(235, 230, 220, 0.4)' : 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(0, y, 256, 1);
        }

        // Golden Kasavu / Zari Border along bottom and edge
        const goldGrad = ctx.createLinearGradient(0, 470, 0, 512);
        goldGrad.addColorStop(0, '#c99a2c');
        goldGrad.addColorStop(0.5, '#eec85a');
        goldGrad.addColorStop(1, '#9e731b');
        ctx.fillStyle = goldGrad;
        ctx.fillRect(0, 470, 256, 42);

        // Delicate temple pattern in the zari
        ctx.fillStyle = '#6b4b0e';
        for (let x = 4; x < 256; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, 482);
            ctx.lineTo(x + 8, 472);
            ctx.lineTo(x + 16, 482);
            ctx.closePath();
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    static createRoofTileTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Terracotta red-orange clay
        ctx.fillStyle = '#5c2217';
        ctx.fillRect(0, 0, 256, 256);

        // Curved clay tile ridges
        const tileW = 32;
        const tileH = 48;

        for (let y = 0; y < 256; y += tileH) {
            for (let x = 0; x < 256; x += tileW) {
                const grad = ctx.createLinearGradient(x, y, x + tileW, y);
                grad.addColorStop(0, '#3a120b');
                grad.addColorStop(0.3, '#782d20');
                grad.addColorStop(0.7, '#8f3727');
                grad.addColorStop(1, '#2e0e08');
                ctx.fillStyle = grad;
                ctx.fillRect(x + 1, y + 2, tileW - 2, tileH - 4);
            }
            // Shadow under tile row
            ctx.fillStyle = 'rgba(15, 5, 3, 0.85)';
            ctx.fillRect(0, y + tileH - 4, 256, 4);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 6);
        return texture;
    }
}

window.TextureGenerator = TextureGenerator;
