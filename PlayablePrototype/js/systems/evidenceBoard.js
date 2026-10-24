/**
 * AYAS: THE LAST WARD - Evidence Board & Deduction System v2.0
 * Interactive corkboard investigation connecting discovered lore, case files,
 * and paranormal artifacts to form theories and unlock advantages.
 */

class EvidenceBoard {
    constructor() {
        this.clues = [
            {
                id: "initial_briefing",
                title: "Operation Ayas Dispatch",
                text: "1994 rural Kerala expedition order: Test MK-IV detector on the abandoned Pala Road following 7 unexplained disappearances.",
                category: "Dispatch",
                x: 18, y: 15,
                color: "#00f0ff"
            }
        ];
        this.connections = [
            ["initial_briefing", "Ev_01"]
        ];
        this.theoryFormed = false;
        this.isOpen = false;
    }

    init() {
        this.renderBoard();
        this.setupListeners();
    }

    addClue(clue) {
        if (!this.clues.find(c => c.id === clue.id)) {
            const positions = [
                { x: 42, y: 18 },
                { x: 70, y: 22 },
                { x: 30, y: 55 },
                { x: 65, y: 60 },
                { x: 82, y: 45 }
            ];
            const nextPos = positions[this.clues.length % positions.length];
            this.clues.push({
                id: clue.id,
                title: clue.title,
                text: clue.text,
                category: "Evidence",
                x: nextPos.x,
                y: nextPos.y,
                color: "#d4a034"
            });

            // Automatically connect clues that share themes
            if (this.clues.length >= 2) {
                const prev = this.clues[this.clues.length - 2];
                this.connect(prev.id, clue.id);
            }

            if (window.GameplayApp) {
                window.GameplayApp.showNotification(`📌 "${clue.title}" pinned to Evidence Board [B]`);
            }

            this.renderBoard();
        }
    }

    connect(id1, id2) {
        const exists = this.connections.some(([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1));
        if (!exists) {
            this.connections.push([id1, id2]);
        }
    }

    canFormTheory() {
        return this.clues.length >= 3 && !this.theoryFormed;
    }

    formulateTheory() {
        if (!this.canFormTheory()) return;
        this.theoryFormed = true;

        if (window.GameplayApp) {
            window.GameplayApp.showNotification("⚡ DEDUCTION CONFIRMED: Iron wards ground her spectral frequency!");
            // Reward the player with an extra Sacred Ash and Relic charge
            if (window.GameplayApp.sacredAshCount < 3) {
                window.GameplayApp.sacredAshCount++;
            }
            if (window.GameplayApp.hasRelicWeapon) {
                window.GameplayApp.relicCharges += 2;
            }
            window.GameplayApp.updateHUDStats();
            if (window.HorrorAudio) window.HorrorAudio.playWardRepairedSound();
        }

        this.renderBoard();
    }

    toggleModal() {
        const modal = document.getElementById('evidence-board-modal');
        if (!modal) return;
        this.isOpen = !modal.classList.contains('active');

        if (this.isOpen) {
            modal.classList.add('active');
            document.exitPointerLock();
            this.renderBoard();
        } else {
            modal.classList.remove('active');
            if (window.GameplayApp && window.GameplayApp.isRunning && !window.GameplayApp.isDead && !window.GameplayApp.hasWon) {
                window.GameplayApp.requestPointerLock();
            }
        }
    }

    setupListeners() {
        document.getElementById('btn-close-board')?.addEventListener('click', () => this.toggleModal());
        document.getElementById('btn-deduce-theory')?.addEventListener('click', () => this.formulateTheory());
        document.getElementById('tab-btn-journal')?.addEventListener('click', () => {
            this.toggleModal();
            if (window.GameplayApp) window.GameplayApp.toggleJournalModal();
        });
    }

    renderBoard() {
        const container = document.getElementById('board-clues-container');
        const svgContainer = document.getElementById('board-svg-lines');
        if (!container || !svgContainer) return;

        container.innerHTML = '';
        svgContainer.innerHTML = '';

        const clueCoords = {};

        // Render Cards
        this.clues.forEach((clue) => {
            clueCoords[clue.id] = { x: clue.x, y: clue.y };
            const card = document.createElement('div');
            card.className = 'board-note-card';
            card.style.left = `${clue.x}%`;
            card.style.top = `${clue.y}%`;
            card.innerHTML = `
                <div class="pin"></div>
                <div class="card-category" style="color:${clue.color || '#00f0ff'}">${clue.category || 'NOTE'}</div>
                <div class="card-title">${clue.title}</div>
                <div class="card-text">${clue.text}</div>
            `;
            container.appendChild(card);
        });

        // Render Red Yarn Connecting Lines in SVG
        this.connections.forEach(([id1, id2]) => {
            const p1 = clueCoords[id1];
            const p2 = clueCoords[id2];
            if (p1 && p2) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', `${p1.x + 8}%`);
                line.setAttribute('y1', `${p1.y + 6}%`);
                line.setAttribute('x2', `${p2.x + 8}%`);
                line.setAttribute('y2', `${p2.y + 6}%`);
                line.setAttribute('stroke', '#ff2233');
                line.setAttribute('stroke-width', '2');
                line.setAttribute('stroke-dasharray', '4 2');
                line.setAttribute('opacity', '0.75');
                svgContainer.appendChild(line);
            }
        });

        // Update theory deduction button status
        const deduceBtn = document.getElementById('btn-deduce-theory');
        const deduceStatus = document.getElementById('deduce-status-text');
        if (deduceBtn && deduceStatus) {
            if (this.theoryFormed) {
                deduceBtn.disabled = true;
                deduceBtn.innerText = 'THEORY CONFIRMED ✓';
                deduceBtn.style.background = 'rgba(0,229,118,0.2)';
                deduceBtn.style.borderColor = '#00e576';
                deduceStatus.innerText = 'Deduction active: Sacred ash resonance fortified (+1 Ash granted).';
                deduceStatus.style.color = '#00e576';
            } else if (this.canFormTheory()) {
                deduceBtn.disabled = false;
                deduceBtn.innerText = 'DEDUCE FOLKLORE TRUTH';
                deduceBtn.style.background = 'rgba(0,240,255,0.2)';
                deduceBtn.style.borderColor = 'var(--cyan)';
                deduceStatus.innerText = '3+ Clues collected! Ready to formulate the core boundary hypothesis.';
                deduceStatus.style.color = 'var(--cyan)';
            } else {
                deduceBtn.disabled = true;
                deduceBtn.innerText = `COLLECT MORE CLUES (${this.clues.length}/3)`;
                deduceBtn.style.background = 'rgba(255,255,255,0.05)';
                deduceBtn.style.borderColor = 'rgba(255,255,255,0.2)';
                deduceStatus.innerText = 'Recover field notes and case files around the Tharavadu to link the evidence.';
                deduceStatus.style.color = 'rgba(180,190,200,0.6)';
            }
        }
    }
}

window.EvidenceBoard = new EvidenceBoard();
document.addEventListener('DOMContentLoaded', () => {
    if (window.EvidenceBoard) window.EvidenceBoard.init();
});
