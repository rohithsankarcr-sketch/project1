/**
 * AYAS: THE LAST WARD - Minimap System
 * Overhead 2D canvas minimap showing player position, ward stations,
 * Pala tree, shrine, and Yakshi location when detected
 */

class MinimapRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.scale = 0; // world-units per canvas pixel

        // World bounds (approx)
        this.worldMinX = -20;
        this.worldMaxX = 26;
        this.worldMinZ = -170;
        this.worldMaxZ = 6;

        this._flashTimer = 0;
        this._wardsRepaired = { WardA: false, WardB: false, WardC: false };

        // Fixed landmark positions
        this.landmarks = [
            { type: 'ward',    id: 'WardA', x: -4.5, z: -25,  label: 'A' },
            { type: 'ward',    id: 'WardB', x: -7.0, z: -70,  label: 'B' },
            { type: 'ward',    id: 'WardC', x: 11.0, z: -84,  label: 'C' },
            { type: 'pala',              x: -11,  z: -65  },
            { type: 'house',             x: 18,   z: -85  },
            { type: 'shrine',            x: 0,    z: -158 },
        ];
    }

    init() {
        this.canvas = document.getElementById('minimap-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        const w = this.canvas.width;
        const h = this.canvas.height;

        const worldW = this.worldMaxX - this.worldMinX;
        const worldH = this.worldMaxZ - this.worldMinZ;

        // Use smallest scale to fit both dimensions
        this.scaleX = w / worldW;
        this.scaleZ = h / worldH;
    }

    worldToMap(wx, wz) {
        const px = (wx - this.worldMinX) * this.scaleX;
        const py = (wz - this.worldMinZ) * this.scaleZ;
        return { x: px, y: py };
    }

    update(delta, playerPos, yakshiPos, yakshiState, ayasEM) {
        if (!this.ctx) return;
        this._flashTimer += delta;

        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Background — dark with subtle grid
        ctx.fillStyle = 'rgba(1,4,10,0.96)';
        ctx.fillRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = 'rgba(0,240,255,0.04)';
        ctx.lineWidth = 0.5;
        for (let gx = 0; gx < W; gx += 16) {
            ctx.beginPath();
            ctx.moveTo(gx, 0); ctx.lineTo(gx, H);
            ctx.stroke();
        }
        for (let gy = 0; gy < H; gy += 16) {
            ctx.beginPath();
            ctx.moveTo(0, gy); ctx.lineTo(W, gy);
            ctx.stroke();
        }

        // Road (vertical strip)
        const roadLeft = this.worldToMap(-5, 0).x;
        const roadRight = this.worldToMap(5, 0).x;
        ctx.fillStyle = 'rgba(20,24,28,0.8)';
        ctx.fillRect(roadLeft, 0, roadRight - roadLeft, H);

        // Laterite shoulders
        ctx.fillStyle = 'rgba(45,15,6,0.5)';
        ctx.fillRect(0, 0, roadLeft, H);
        ctx.fillRect(roadRight, 0, W - roadRight, H);

        // Draw landmarks
        this.landmarks.forEach(lm => {
            const mp = this.worldToMap(lm.x, lm.z);

            if (lm.type === 'ward') {
                const isRepaired = this._wardsRepaired[lm.id];
                const color = isRepaired ? '#00f0ff' : '#ff2233';
                const flashAlpha = isRepaired ? 1.0 : (Math.sin(this._flashTimer * 3) * 0.4 + 0.6);

                ctx.save();
                ctx.globalAlpha = flashAlpha;

                // Ward triangle marker
                ctx.beginPath();
                ctx.moveTo(mp.x, mp.y - 5);
                ctx.lineTo(mp.x - 4, mp.y + 3);
                ctx.lineTo(mp.x + 4, mp.y + 3);
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();

                // Glow
                ctx.shadowColor = color;
                ctx.shadowBlur = isRepaired ? 6 : 4;
                ctx.fill();

                // Label
                ctx.globalAlpha = 0.8;
                ctx.font = '7px monospace';
                ctx.fillStyle = color;
                ctx.textAlign = 'center';
                ctx.fillText(lm.label, mp.x, mp.y + 11);

                ctx.restore();

            } else if (lm.type === 'pala') {
                // Pala tree — dark green circle
                ctx.save();
                ctx.beginPath();
                ctx.arc(mp.x, mp.y, 4, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(8,18,6,0.9)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(30,60,20,0.7)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();

            } else if (lm.type === 'house') {
                // House — small rectangle
                ctx.save();
                ctx.fillStyle = 'rgba(30,24,16,0.85)';
                ctx.fillRect(mp.x - 5, mp.y - 4, 10, 7);
                ctx.strokeStyle = 'rgba(80,60,30,0.6)';
                ctx.lineWidth = 0.8;
                ctx.strokeRect(mp.x - 5, mp.y - 4, 10, 7);
                ctx.restore();

            } else if (lm.type === 'shrine') {
                // Shrine — warm golden circle
                ctx.save();
                const shrineFlash = Math.sin(this._flashTimer * 1.5) * 0.25 + 0.75;
                ctx.globalAlpha = shrineFlash;
                ctx.beginPath();
                ctx.arc(mp.x, mp.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(180,120,20,0.3)';
                ctx.fill();
                ctx.strokeStyle = '#d4a034';
                ctx.lineWidth = 1.2;
                ctx.stroke();
                ctx.shadowColor = '#d4a034';
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.restore();
            }
        });

        // Yakshi — red blip (only if AYAS EM > 40 or she's hunting)
        if (yakshiPos && yakshiState !== 'Dormant') {
            const showYakshi = ayasEM > 42 || yakshiState === 'Hunting';
            if (showYakshi) {
                const ymp = this.worldToMap(yakshiPos.x, yakshiPos.z);
                const yakAlpha = yakshiState === 'Hunting'
                    ? (Math.sin(this._flashTimer * 8) * 0.4 + 0.6)
                    : (Math.sin(this._flashTimer * 2) * 0.3 + 0.5);

                ctx.save();
                ctx.globalAlpha = yakAlpha;
                ctx.beginPath();
                ctx.arc(ymp.x, ymp.y, yakshiState === 'Hunting' ? 4.5 : 3, 0, Math.PI * 2);
                ctx.fillStyle = '#ff2233';
                ctx.fill();
                ctx.shadowColor = '#ff2233';
                ctx.shadowBlur = yakshiState === 'Hunting' ? 10 : 5;
                ctx.fill();
                ctx.restore();
            }
        }

        // Player dot — bright cyan with direction indicator
        const pmp = this.worldToMap(playerPos.x, playerPos.z);

        // Player direction arc (facing direction from camera yaw)
        const yaw = window.GameplayApp ? window.GameplayApp.yaw : 0;
        ctx.save();
        ctx.translate(pmp.x, pmp.y);
        ctx.rotate(yaw + Math.PI);

        // Direction cone
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 12, -Math.PI / 4.5, Math.PI / 4.5);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,240,255,0.08)';
        ctx.fill();

        ctx.restore();

        // Player dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(pmp.x, pmp.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.fill();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // "YOU" label
        ctx.save();
        ctx.font = '7px monospace';
        ctx.fillStyle = 'rgba(0,240,255,0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', pmp.x, pmp.y + 12);
        ctx.restore();

        // Border
        ctx.strokeStyle = 'rgba(0,240,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, W, H);
    }

    setWardRepaired(wardId) {
        this._wardsRepaired[wardId] = true;
    }
}

window.MinimapUI = new MinimapRenderer();
