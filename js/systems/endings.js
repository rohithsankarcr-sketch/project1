/**
 * AYAS: THE LAST WARD - Multiple Endings System v2.0
 * Evaluates player investigation diligence, ward repairs, and lore discoveries
 * to trigger Ending A (Escape), Ending B (The Truth), or Ending C (The Last Ward Consecrated).
 */

class EndingsManager {
    constructor() {
        this.ending = null;
        this.endingData = {
            'A': {
                badge: 'ENDING A: THE UNANSWERED ESCAPE',
                subtitle: 'SURVIVED, BUT THE CURSE REMAINS',
                color: '#ffaa00',
                body: `
                    <p>You sprinted into the consecrated sanctuary of the Kavu shrine with your heart hammering against your ribs. The brass oil lamps flickered violently in the storm wind, holding the Yakshi at bay.</p>
                    <p style="margin-top:10px;">However, the disappearance files were left scattered in the abandoned Tharavadu. The mystery of the Pala Road remains unanswered, and travelers will continue to hear her whispers in the dark.</p>
                    <div style="margin-top:14px; padding:10px; background:rgba(212,160,52,0.12); border-left:2px solid #d4a034; font-family:var(--mono); font-size:11px; color:#ffcc55;">
                        STATUS: Fled the Pala Road • 0-1 Clues Collected • Village remains haunted
                    </div>
                `
            },
            'B': {
                badge: 'ENDING B: THE TRUTH UNVEILED',
                subtitle: 'ESCAPED WITH DOCUMENTED EVIDENCE',
                color: '#00f0ff',
                body: `
                    <p>Clutching the recovered surveyor notes and ritual copper plates, you crossed into the sanctuary. The prototype AYAS monitor successfully logged continuous electromagnetic and infrasound telemetry of the entity.</p>
                    <p style="margin-top:10px;">Your findings will expose the 1994 disappearances and validate the protective properties of the iron boundary. You survived, and the truth has been preserved.</p>
                    <div style="margin-top:14px; padding:10px; background:rgba(0,240,255,0.12); border-left:2px solid var(--cyan); font-family:var(--mono); font-size:11px; color:var(--cyan);">
                        STATUS: Truth Documented • Anomaly Telemetry Verified • Disappearance Files Recovered
                    </div>
                `
            },
            'C': {
                badge: 'ENDING C: THE CONSECRATED LAST WARD',
                subtitle: 'PERFECT BANISHMENT — THE FINAL RITUAL',
                color: '#00e576',
                body: `
                    <p>Every node of the iron perimeter resonates with sacred ash continuity. As you reached the Kavu shrine, the closed circuit resonated across the entire valley. A radiant harmonic shockwave burst through the rain, severing the entity's electromagnetic anchor.</p>
                    <p style="margin-top:10px;">The screaming entity was banished into the ancient roots of the Pala tree, and the stormy skies cleared. The Pala Road is finally cleansed, and the souls of the lost rest in peace.</p>
                    <div style="margin-top:14px; padding:10px; background:rgba(0,229,118,0.12); border-left:2px solid #00e576; font-family:var(--mono); font-size:11px; color:#66ffaa;">
                        STATUS: All 3 Wards Restored • All Evidence Discovered • Entity Sealed Forever
                    </div>
                `
            }
        };
    }

    checkEndings() {
        const wards = window.KeralaWorld?.wardStations;
        let repairedCount = 0;
        if (wards) {
            for (let k in wards) {
                if (wards[k].state === 'Repaired' || wards[k].state === 'Intact') {
                    repairedCount++;
                }
            }
        }

        const evidenceCount = (window.Quests?.evidenceList?.length) ||
                              (window.Quests?.evidenceCollectedCount) || 0;

        if (repairedCount >= 3 && evidenceCount >= 3) {
            return 'C';
        } else if (evidenceCount >= 2) {
            return 'B';
        }
        return 'A';
    }

    triggerEnding() {
        const type = this.checkEndings();
        this.ending = type;
        const config = this.endingData[type];

        if (window.GameplayApp) {
            window.GameplayApp.showNotification(`★ ${config.badge}`, 4000);
        }

        const winScreen = document.getElementById('victory-screen');
        if (winScreen) {
            const titleEl = winScreen.querySelector('.modal-title');
            const subEl = winScreen.querySelector('.modal-subtitle');
            const bodyEl = winScreen.querySelector('.modal-body');

            if (titleEl) {
                titleEl.innerText = config.badge;
                titleEl.style.color = config.color;
            }
            if (subEl) {
                subEl.innerText = config.subtitle;
            }
            if (bodyEl) {
                bodyEl.innerHTML = config.body;
            }

            winScreen.classList.add('active');
        }
    }
}

window.EndingsManager = new EndingsManager();
