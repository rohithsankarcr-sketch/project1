/**
 * AYAS: THE LAST WARD - Mission & Objective Progression Manager v2.0
 * 8 objectives, Evidence tracking, Dynamic Yakshi escalation via story events
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
                hint: "[WASD] Move • [Shift] Sprint • [Ctrl] Crouch • [F] Flashlight • [Q] AYAS Device"
            },
            {
                id: 2,
                title: "② Calibrate AYAS Detector",
                desc: "Find a stable baseline zone away from iron. Stand perfectly still and calibrate the AYAS monitor.",
                hint: "Stand still and hold [R] to calibrate • Watch the EM needle stabilize • Takes ~2.5 seconds"
            },
            {
                id: 3,
                title: "③ Investigate the Pala Tree",
                desc: "Follow environmental clues toward the ancient Pala tree (north-west). Approach with caution.",
                hint: "⚠ The Yakshi is active near the tree • Watch AYAS cold-spot meter • Don't follow the voices"
            },
            {
                id: 4,
                title: "④ Restore Ward A — Village Path",
                desc: "The entrance perimeter ward has severed continuity. Find and splice the iron circuit terminal.",
                hint: "Walk north on main road • Approach the iron post • Hold [E] 2.5 sec to repair"
            },
            {
                id: 5,
                title: "⑤ Restore Ward B — Pala Tree (DANGER)",
                desc: "The Pala tree ward is heavily disturbed. The entity is active in the canopy. Stay crouched.",
                hint: "⚠ EXTREME DANGER ZONE • Crouch [Ctrl] constantly • Use AYAS to track her position • Avoid direct sight"
            },
            {
                id: 6,
                title: "⑥ Recover Disappearance Evidence",
                desc: "Search the ancestral house for 3 missing case files, ritual records, and researcher notes.",
                hint: "Check the veranda desk and inner rooms • [E] to collect • [Tab] to review journal"
            },
            {
                id: 7,
                title: "⑦ Restore Ward C — Ancestral House (CRITICAL)",
                desc: "Final perimeter breach near the house. Replace the grounding fuse before she crosses the boundary.",
                hint: "⚠ Ward C is near the house east side • She is escalating • Work fast, [E] to repair"
            },
            {
                id: 8,
                title: "⑧ ESCAPE TO THE KAVU SHRINE",
                desc: "ALL WARDS RESTORED! Follow the Ayas directional vector south to the sacred shrine before dawn!",
                hint: "SPRINT SOUTH on the road [Shift+W] • Scatter Sacred Ash [G] if pursued • DON'T STOP!"
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

        if (window.HorrorAudio) window.HorrorAudio.playAyasChime('ping');

        if (window.GameplayApp) {
            window.GameplayApp.showNotification(`✦ OBJECTIVE ${expectedId} COMPLETE`);
        }

        this._onObjectiveTransition(this.currentObjectiveIndex);
    }

    _onObjectiveTransition(newIdx) {
        const newId = newIdx + 1; // next objective ID

        if (newId === 3) {
            // Obj 3: Pala tree investigate — spawn Yakshi near Pala tree
            if (window.YakshiAI) {
                setTimeout(() => window.YakshiAI.spawnStoryEvent('pala_tree'), 2000);
            }
            if (window.GameplayApp) {
                window.GameplayApp._showHorrorSubtitle("[ A cold presence stirs near the ancient tree... ]");
            }
        }

        if (newId === 5) {
            // Obj 5: Ward B area — escalate Yakshi near Pala tree
            if (window.YakshiAI) {
                window.YakshiAI.stalkSpeed = 3.2;
                window.YakshiAI.lureCooldown = 8.0;
                window.YakshiAI.randomSpawnInterval = 18;
            }
        }

        if (newId === 7) {
            // Obj 7: Ward C — house breach imminent
            if (window.YakshiAI) {
                window.YakshiAI.spawnStoryEvent('house_breach');
                window.YakshiAI.randomSpawnInterval = 12;
            }
            if (window.KeralaWorld) window.KeralaWorld.triggerLightning();
        }

        if (newId === 8) {
            // FINAL CHASE — Yakshi at full speed, persistent hunting
            if (window.YakshiAI) {
                window.YakshiAI.spawnStoryEvent('final_chase');
                window.YakshiAI.randomSpawnInterval = 8;
            }
            if (window.KeralaWorld) {
                window.KeralaWorld.triggerLightning();
                setTimeout(() => window.KeralaWorld.triggerLightning(), 1200);
            }
            if (window.GameplayApp) {
                window.GameplayApp._showHorrorSubtitle("[ ALL WARDS RESTORED — SPRINT TO THE SHRINE! ]");
            }
        }
    }

    collectEvidence(item) {
        if (this.evidenceList.includes(item.id)) return;
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
        const descEl  = document.getElementById('objective-desc');
        const hintEl  = document.getElementById('objective-hint');

        if (titleEl) titleEl.innerText = obj.title;
        if (descEl)  descEl.innerText  = obj.desc;
        if (hintEl)  hintEl.innerText  = obj.hint;

        // Brief highlight animation
        const card = document.getElementById('objective-card');
        if (card) {
            card.style.borderLeftColor = '#d4a034';
            setTimeout(() => { card.style.borderLeftColor = ''; }, 1500);
        }
    }
}

window.Quests = new QuestManager();
