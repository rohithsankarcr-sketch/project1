# AYAS Detector Signal Model & Specification
### Anomaly and Iron Integrity Monitor (Field Prototype Mark IV)

---

## 1. Visual & Physical Architecture
- Handheld rugged enclosure with amber-phosphor CRT screen.
- Analog galvanometer magnetic deviation needle.
- Digital cold-spot thermometer.
- Real-time audio waveform spectrum analyzer.
- Ward circuit status LEDs (A: Village, B: Pala, C: House).

---

## 2. Signal Formulation & Formulas

### Function A: Electromagnetic Anomaly Scanner
- **Baseline**: $B_0 \approx 42.5\ \mu\text{T}$ (geomagnetic field of southern Kerala).
- **Deviation Formula**:
  $$B(d) = B_0 + \Delta B_{\max} \cdot \max\left(0, 1 - \frac{d}{d_{\text{detection}}}\right) + \eta$$
  Where:
  - $d_{\text{detection}} = 35.0\text{ meters}$
  - $\Delta B_{\max} = 135.0\ \mu\text{T}$
  - $\eta \sim \mathcal{U}(-0.8, 0.8)\ \mu\text{T}$ (geomagnetic noise)
- **Audio Feedback**: Geiger-counter style audio pulses whose frequency scales non-linearly:
  $$\Delta t_{\text{click}} = \operatorname{clamp}\left(1.2 - \frac{\Delta B}{100}, 0.06, 1.2\right)\text{ seconds}$$

### Function B: Thermal Cold-Spot Indicator
- **Baseline Ambient**: $28.5^\circ\text{C}$ (humid tropical Kerala night).
- **Anomaly Drop**: Drops smoothly to $3.5^\circ\text{C} - 4.2^\circ\text{C}$ within 15 meters of the entity.
- **Player Feedback**: Heavy breath fogging and shivering audio triggered at $T < 12^\circ\text{C}$.

### Function C: Voice Authenticity Analyzer
- FFT audio waveform simulation.
- Analyzes acoustic harmonic coherence:
  - Natural human speech confidence: $< 0.30$.
  - Yakshi supernatural lure mimicry: $> 0.80$.
- Triggers alert ping warning tone when mimicry confidence exceeds threshold.

### Function D: Iron Ward Integrity
- Displays circuit loop continuity for Stations A, B, and C:
  - Green LED / Static line: **INTACT / REPAIRED**
  - Flashing Amber: **DAMAGED**
  - Red / Broken line: **DISCONNECTED**
- Bearing compass points directly to nearest compromised station.
