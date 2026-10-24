/**
 * Evidence Board System
 */
class EvidenceBoard {
    constructor() {
        this.clues = [];
        this.connections = [];
    }
    addClue(clue) {
        if (!this.clues.find(c=>c.id===clue.id)) {
            this.clues.push(clue);
            if (window.GameplayApp) window.GameplayApp.showNotification('📜 Evidence added to board');
        }
    }
    connect(id1,id2) {
        this.connections.push([id1,id2]);
    }
    canFormTheory() {
        return this.clues.length >= 3;
    }
}
window.EvidenceBoard = new EvidenceBoard();
