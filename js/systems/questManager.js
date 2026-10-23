/**
 * AYAS: THE LAST WARD - Mission & Objective Progression Manager
 * Coordinates Objectives 1 through 8, Evidence Tracking, Checkpoints & Dawn Escape
 */

class QuestManager {
    constructor() {
        this.currentObjectiveIndex = 0;
        this.evidenceCollectedCount = 0;
        this.evidenceList = [];

        this.objectives = [
            {
                id: 1,
                title: "Objective 1: Enter the Village",
                desc: "Reach the abandoned ancestral house along the Pala Road. Familiarize yourself with movement and controls.",
                hint: "Use [W,A,S,D] to move, [Shift] to sprint, [F] for flashlight, [Q] for AYAS device."
            },
            {
                id: 2,
                title: "Objective 2: Calibrate Ayas Detector",
                desc: "Find a stable baseline zone away from high iron concentrations. Stand still and calibrate your AYAS monitor.",
                hint: "Ensure you are stationary. Press and hold [R] to establish baseline geomagnetic calibration."
            },
            {
                id: 3,
                title: "Objective 3: Investigate the Pala Tree",
                desc: "Follow environmental clues toward the ancient Pala tree. Approach with caution and observe anomalies.",
                hint: "Watch the AYAS EM needle. If you hear sweet calls or anklets, check the voice authenticity meter."
            },
            {
                id: 4,
                title: "Objective 4: Restore Ward A (Village Path)",
                desc: "The entrance perimeter ward has severed continuity. Locate the terminal post and splice the conductive iron line.",
                hint: "Approach Ward Post A. Look for the sparking terminal box and hold [E] to splice the circuit."
            },
            {
                id: 5,
                title: "Objective 5: Survive & Restore Ward B (Pala Tree)",
                desc: "The Pala tree ward is heavily disturbed. The entity is active in the canopy and tree perimeter. Avoid direct confrontation.",
                hint: "Use [Ctrl] to crouch and break line of sight. Listen for audio cues. Restore Ward B."
            },
            {
                id: 6,
                title: "Objective 6: Recover Disappearance Evidence",
                desc: "Search the ancestral house for 3 missing case files, ritual records, and previous researcher notes.",
                hint: "Check the veranda desk, storage bin, and inner chambers. Press [Tab] to review collected evidence."
            },
            {
                id: 7,
                title: "Objective 7: Restore Ward C (Ancestral House)",
                desc: "The final perimeter boundary around the house is compromised. Replace the grounding fuse before the entity breaches.",
                hint: "Locate Ward Post C near the veranda and hold [E] to restore the grounding circuit."
            },
            {
                id: 8,
                title: "Objective 8: Escape Before Dawn",
                desc: "Perimeter stabilized! Follow the Ayas directional vector toward the protected southern shrine before dawn.",
                hint: "Sprint to the southern shrine clearing. Scatter Sacred Ash [G] if pursued!"
            }
        ];
    }

    init() {
        this.updateHUDObjective();
    }

    getCurrentObjective() {
        return this.objectives[this.currentObjectiveIndex];
    }

    completeObjective(expectedId) {
        if (this.currentObjectiveIndex < this.objectives.length) {
            const currentObj = this.objectives[this.currentObjectiveIndex];
            if (currentObj.id === expectedId) {
                this.currentObjectiveIndex++;
                this.updateHUDObjective();

                if (window.HorrorAudio) {
                    window.HorrorAudio.playAyasChime('ping');
                }

                // Objective triggers & AI escalation
                this.onObjectiveTransition(this.currentObjectiveIndex + 1);
            }
        }
    }

    onObjectiveTransition(newObjId) {
        if (newObjId === 3) {
            // Objective 3: Spawn Yakshi near Pala Tree
            if (window.YakshiAI) {
                window.YakshiAI.spawnAt(-14, 0, -68);
            }
        } else if (newObjId === 5) {
            // Objective 5: Yakshi stalks Pala tree area
            if (window.YakshiAI) {
                window.YakshiAI.state = 'Stalking';
            }
        } else if (newObjId === 8) {
            // Objective 8: Climax escape chase!
            if (window.YakshiAI) {
                window.YakshiAI.state = 'Hunting';
                window.YakshiAI.huntSpeed = 6.8;
            }
            if (window.KeralaWorld) {
                window.KeralaWorld.triggerLightning();
            }
        }
    }

    collectEvidence(item) {
        if (!this.evidenceList.includes(item.id)) {
            this.evidenceList.push(item.id);
            this.evidenceCollectedCount++;

            // Check Objective 6 (Recover 3 Evidence Items)
            if (this.getCurrentObjective().id === 6 && this.evidenceCollectedCount >= 3) {
                this.completeObjective(6);
            }
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
    }
}

window.Quests = new QuestManager();
