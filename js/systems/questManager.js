/**
 * AYAS: THE LAST WARD - Mission & Objective Progression Manager v3.0
 * 8 sequential investigation objectives, evidence tracking, and fail-safe ward transitions.
 * 
 * Objectives:
 * 1. Enter the Village (reach ancestral house)
 * 2. Calibrate AYAS Detector (hold [R] while stationary)
 * 3. Investigate the Pala Tree (detect cold-spot & static anomaly)
 * 4. Restore Ward A — Village Path (splice circuit)
 * 5. Restore Ward B — Pala Tree (repair ward in danger zone)
 * 6. Recover Disappearance Files (collect 3 files in the house)
 * 7. Restore Ward C — Ancestral House (fail-safe repair transition)
 * 8. ESCAPE TO THE KAVU SHRINE (final chase before dawn)
 */

class QuestManager {
    constructor() {
        this.currentObjectiveIndex = 0;
        this.evidenceCollectedCount = 0;
        this.evidenceList = [];

        this.objectives = [
            {
                id: 1,
                title: "① Enter the Village",
                desc: "Reach the abandoned ancestral house along the Pala Road. Familiarize yourself with movement.",
                hint: "[WASD] Move • [Shift] Sprint • [Ctrl] Crouch • [F] Flashlight • [Q] AYAS Device • [T] Walkman"
            },
            {
                id: 2,
                title: "② Calibrate AYAS Detector",
                desc: "Find a stable baseline zone away from iron. Stand perfectly still and calibrate the AYAS monitor.",
                hint: "Stand still and hold [R] to calibrate • Watch the EM needle stabilize • Takes ~2.2 seconds"
            },
            {
                id: 3,
                title: "③ Investigate the Pala Tree",
                desc: "Follow environmental cues toward the ancient Pala tree (north-west). Approach with caution.",
                hint: "⚠ Jess's presence is active near the tree • Watch AYAS cold-spot meter • Don't follow the voice lures"
            },
            {
                id: 4,
                title: "④ Restore Ward A — Village Path",
                desc: "The entrance perimeter ward has severed continuity. Find and splice the iron circuit terminal.",
                hint: "Walk north on main road • Approach the iron post • Hold [E] 2.5 sec to splice circuit"
            },
            {
                id: 5,
                title: "⑤ Restore Ward B — Pala Tree (DANGER)",
                desc: "The Pala tree ward is heavily disturbed. Jess's spirit is agitated. Stay crouched.",
                hint: "⚠ DANGER ZONE • Crouch [Ctrl] constantly • Use AYAS to track her position • Avoid direct sight"
            },
            {
                id: 6,
                title: "⑥ Recover Disappearance Files",
                desc: "Search the ancestral house for 3 missing case files, ritual records, and 1995 student logs.",
                hint: "Check the veranda desk and inner rooms • [E] to collect • [B] Evidence Board • [Tab] Journal"
            },
            {
                id: 7,
                title: "⑦ Restore Ward C — Ancestral House (CRITICAL)",
                desc: "Final perimeter breach near the house. Replace the grounding circuit before she breaches the barrier.",
                hint: "⚠ Ward C is on the house east flank • Hold [E] 2.5 sec to splice circuit"
            },
            {
                id: 8,
                title: "⑧ ESCAPE TO THE KAVU SHRINE",
                desc: "ALL 3 WARDS RESTORED! Follow the AYAS navigation arrow south to the sacred shrine before dawn!",
                hint: "SPRINT SOUTH ON THE ROAD [Shift+W] • Scatter Sacred Ash [G] or Relic [V] if pursued • DON'T STOP!"
            }
        ];
    }

    init() {
        this.updateHUDObjective();
    }

    getCurrentObjective() {
        return this.objectives[this.currentObjectiveIndex] || this.objectives[this.objectives.length - 1];
    }

    completeObjective(expectedId) {
        if (this.currentObjectiveIndex >= this.objectives.length) return;
        const current = this.objectives[this.currentObjectiveIndex];
        if (current.id !== expectedId) return;

        this.currentObjectiveIndex++;
        this.updateHUDObjective();

        if (window.HorrorAudio && typeof window.HorrorAudio.playAyasChime === 'function') {
            window.HorrorAudio.playAyasChime('ping');
        }

        if (window.GameplayApp) {
            window.GameplayApp.showNotification(`✦ OBJECTIVE ${expectedId} COMPLETE`);
        }

        this._onObjectiveTransition(this.currentObjectiveIndex);
    }

    _onObjectiveTransition(newIdx) {
        const newId = newIdx + 1; // next objective ID

        // Auto-check already repaired wards (prevents getting stuck)
        const wards = window.KeralaWorld?.wardStations;

        if (newId === 4 && wards?.WardA?.state === 'Repaired') {
            setTimeout(() => this.completeObjective(4), 600);
            return;
        }

        if (newId === 5) {
            if (wards?.WardB?.state === 'Repaired') {
                setTimeout(() => this.completeObjective(5), 600);
                return;
            }
            const ghost = window.GhostAI || window.JessAI || window.YakshiAI;
            if (ghost) {
                ghost.stalkSpeed = 3.8;
                ghost.lureCooldown = 8.0;
            }
        }

        if (newId === 3) {
            const ghost = window.GhostAI || window.JessAI || window.YakshiAI;
            if (ghost) {
                setTimeout(() => ghost.spawnStoryEvent('pala_tree'), 1500);
            }
            if (window.GameplayApp) {
                window.GameplayApp._showHorrorSubtitle("[ A sudden chill stirs near the ancient Pala tree... ]");
            }
        }

        // Objective 7 (Ward C) fail-safe auto-complete if already repaired
        if (newId === 7) {
            if (wards?.WardC?.state === 'Repaired') {
                if (window.GameplayApp) {
                    window.GameplayApp.showNotification("✦ WARD C ALREADY RESTORED — PERIMETER INTACT");
                }
                setTimeout(() => this.completeObjective(7), 800);
                return;
            }

            const ghost = window.GhostAI || window.JessAI || window.YakshiAI;
            if (ghost) {
                ghost.spawnStoryEvent('house_breach');
            }
            if (window.KeralaWorld && typeof window.KeralaWorld.triggerLightning === 'function') {
                window.KeralaWorld.triggerLightning();
            }
        }

        if (newId === 8) {
            // Verify all 3 wards are indeed repaired
            let allRepaired = true;
            if (wards) {
                for (let k in wards) {
                    if (wards[k].state !== 'Repaired' && wards[k].state !== 'Intact') {
                        allRepaired = false;
                    }
                }
            }

            const ghost = window.GhostAI || window.JessAI || window.YakshiAI;
            if (ghost) {
                ghost.spawnStoryEvent('final_chase');
            }

            if (window.KeralaWorld && typeof window.KeralaWorld.triggerLightning === 'function') {
                window.KeralaWorld.triggerLightning();
                setTimeout(() => window.KeralaWorld.triggerLightning(), 1000);
            }

            if (window.GameplayApp) {
                window.GameplayApp._showHorrorSubtitle("[ ALL 3 WARDS RESTORED — SPRINT TO THE KAVU SHRINE BEFORE DAWN! ]");
            }
        }
    }

    collectEvidence(item) {
        if (!item || this.evidenceList.includes(item.id)) return;
        this.evidenceList.push(item.id);
        this.evidenceCollectedCount++;

        if (this.getCurrentObjective().id === 6 && this.evidenceCollectedCount >= 3) {
            this.completeObjective(6);
        }
    }

    updateHUDObjective() {
        const obj = this.getCurrentObjective();
        if (!obj) return;

        const titleEl = document.getElementById('objective-title');
        const descEl = document.getElementById('objective-desc');
        const hintEl = document.getElementById('objective-hint');

        if (titleEl) titleEl.innerText = obj.title;
        if (descEl) descEl.innerText = obj.desc;
        if (hintEl) hintEl.innerText = obj.hint;

        const card = document.getElementById('objective-card');
        if (card) {
            card.style.borderLeftColor = '#d4a034';
            setTimeout(() => { if (card) card.style.borderLeftColor = ''; }, 1500);
        }
    }
}

window.Quests = new QuestManager();
