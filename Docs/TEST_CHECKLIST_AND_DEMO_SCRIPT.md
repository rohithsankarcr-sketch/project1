# Full Mission Test Checklist & Demonstration Script
### AYAS: THE LAST WARD

---

## 1. Quality Assurance Test Checklist

| System | Test Case | Expected Result | Pass/Fail |
|---|---|---|---|
| **Player Controller** | Movement & Look | Smooth W/A/S/D movement, mouse pitch/yaw, no camera jitter | PASS |
| **Stamina** | Shift Sprint | Stamina depletes over ~4.5s sprint; player forced to walk when exhausted; regenerates | PASS |
| **Stealth** | Ctrl Crouch | Lowers camera, dampens footstep volume, halves AI sight detection | PASS |
| **Flashlight** | F Toggle & Battery | Illuminates environment; battery drains slowly; flickers near Yakshi | PASS |
| **Ayas Detector** | Q Equip / Stow | Equips handheld monitor; screen updates real-time readings | PASS |
| **Function A** | Magnetic Anomaly | Baseline ~42.5 µT; spikes to 120-160 µT as Yakshi nears; geiger clicks accelerate | PASS |
| **Function B** | Cold-Spot Thermometer | Ambient drops from 28.5°C down to 4°C near Pala tree / Yakshi | PASS |
| **Function C** | Voice Authenticity | When Yakshi whispers/calls, confidence score spikes >80% with alert ping | PASS |
| **Function D** | Ward Continuity | Reflects Intact/Repaired vs Damaged/Disconnected states; compass needle aims at target | PASS |
| **Calibration** | R Hold Calibration | Stationary requirement enforced; resets baseline magnetic field | PASS |
| **Ward Repair** | E Hold Repair | Reconnects severed circuit; sparks extinguish; protective boundary active | PASS |
| **Yakshi AI** | 9-State Machine | Stalks at distance, lures with anklets, searches last known, hunts on sight | PASS |
| **Hiding System** | Closets / Shadows | Entering hiding spots cuts AI sight detection to near zero | PASS |
| **Sacred Ash** | G Deploy Barrier | Creates protective circle repelling Yakshi into Disrupted retreat | PASS |
| **Objective Loop** | Objectives 1 to 8 | Progresses systematically from Intro through Ward repairs, Evidence, and Escape | PASS |
| **Loss Condition** | Yakshi Catch | Cinematic stinger, failure screen, retry checkpoint / restart mission | PASS |
| **Win Condition** | Shrine Escape | Escaping after repairing wards & collecting evidence triggers Victory screen | PASS |

---

## 2. 5-Minute Demonstration Script
1. **Minute 00:00 - 01:00 (Atmospheric Intro)**:
   - Launch the game. The storm rain pours over the laterite walls of the Pala Road entrance.
   - Walk forward, switch on flashlight with `F`, observe the rain droplets hitting the ground.
2. **Minute 01:00 - 02:00 (The Ayas Device)**:
   - Press `Q` to raise the AYAS handheld monitor.
   - Notice the amber CRT display showing baseline 42.5 µT and 28.5°C.
   - Hold `R` while stationary to complete field calibration.
3. **Minute 02:00 - 03:00 (The First Encounter & Ward A)**:
   - Approach Ward Station A. The line is severed and sparking. Hold `E` to splice the connection.
   - In the distance under the coconut palms, hear subtle anklet chimes (chilanka) and a distant call in Malayalam.
   - Look at the Ayas detector: the needle jolts to 88 µT; the voice analyzer pings red!
4. **Minute 03:00 - 04:00 (The Ancestral House & Stealth)**:
   - Proceed to the ancestral tharavadu. The Yakshi stalks between the trees.
   - Press `Ctrl` to crouch through the veranda; duck inside the wooden rice bin closet using `E`.
   - Watch the white silhouette pass through the rain outside the slats.
   - Collect the 3 evidence files inside the study.
5. **Minute 04:00 - 05:00 (The Climax & Escape)**:
   - Repair the grounding fuse on Ward Station C.
   - Thunder cracks. The dawn countdown begins. The Yakshi enters hunting mode!
   - Sprint down the road, throw Sacred Ash `G` to disrupt her charge, and cross into the sacred shrine to trigger the victory ending!
