/**
 * Multiple Endings System
 */
class EndingsManager {
    constructor() {
        this.ending = null;
    }
    checkEndings() {
        const wards = window.KeralaWorld?.wardStations;
        let repaired = 0;
        if (wards) { for (let k in wards) if (wards[k].state === 'Repaired') repaired++; }
        const evidenceCount = window.Quests?.collectedEvidence?.length || 0;
        if (repaired >= 3 && evidenceCount >= 4) {
            return 'C'; // Last Ward
        } else if (evidenceCount >= 2) {
            return 'B'; // Truth
        }
        return 'A'; // Escape
    }
    triggerEnding() {
        const type = this.checkEndings();
        this.ending = type;
        if (window.GameplayApp) window.GameplayApp.showNotification(`ENDING: ${type}`);
        const winScreen = document.getElementById('victory-screen');
        if (winScreen) {
            const h = winScreen.querySelector('h1');
            if (h) {
                if (type === 'B') h.innerText = 'THE TRUTH - ESCAPED WITH KNOWLEDGE';
                else if (type === 'C') h.innerText = 'THE LAST WARD - SACRIFICE';
                else h.innerText = 'ESCAPE - UNANSWERED';
            }
            winScreen.classList.add('active');
        }
    }
}
window.EndingsManager = new EndingsManager();
