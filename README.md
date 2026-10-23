# AYAS: THE LAST WARD
### A 3D First-Person Kerala Folklore Survival Horror Game for PC

---

## 1. Project Overview
- **Title**: AYAS: THE LAST WARD
- **Setting**: Abandoned stormy village road ("The Pala Road") in Kerala, India.
- **Engine**: Unreal Engine 5 (UE 5.4+), C++ Core Systems + Enhanced Input + AI Perception + Behavior Trees.
- **Protagonist**: Field researcher equipped with the prototype **AYAS** (Anomaly & Iron Integrity Monitor) device.
- **Antagonist**: The Yakshi — an unsettling Kerala folklore entity with a 9-state stalking/luring/hunting AI.
- **Core Loop**: Atmospheric exploration, signal detection, iron ward perimeter repairs, stealth/hiding, evidence gathering, and survival escape before dawn.

---

## 2. Repository Structure
```
bhooo/
├── AyasTheLastWard.uproject             # Unreal Engine 5 project descriptor
├── Config/                              # Engine, Game, Input, Scalability configs
│   ├── DefaultEngine.ini
│   ├── DefaultGame.ini
│   ├── DefaultInput.ini
│   └── DefaultScalability.ini
├── Source/                              # Full C++ production codebase
│   ├── AyasTheLastWard.Target.cs
│   ├── AyasTheLastWardEditor.Target.cs
│   └── AyasTheLastWard/
│       ├── AyasTheLastWard.Build.cs
│       ├── Core/                        # GameMode, GameState, ObjectiveManager, SaveGame
│       ├── Character/                   # First-Person Character, Controller, Stamina, Flashlight, Interaction
│       ├── Items/                       # Handheld AYAS Detector (4 functions), Inventory, Sacred Ash, Evidence
│       ├── AI/                          # Yakshi Character, AI Controller (9 States), Behavior Tree Tasks
│       ├── Environment/                 # Ward Stations A/B/C, Ward Boundary Zones, Hiding Spots
│       ├── Audio/                       # Dynamic Horror Audio Manager (Layered Kerala soundscape)
│       └── UI/                          # HUD, Reticle, Screen Widgets
├── Docs/                                # Architectural documentation & specs
│   ├── UNREAL_ENGINE_SETUP_GUIDE.md
│   ├── BLUEPRINT_IMPLEMENTATION_SPECS.md
│   ├── LEVEL_DESIGN_PALA_ROAD.md
│   ├── YAKSHI_AI_BEHAVIOR_TREE.md
│   ├── AYAS_DETECTOR_SIGNAL_SPEC.md
│   ├── AUDIO_SOUNDSCAPE_MANIFEST.md
│   ├── TEST_CHECKLIST_AND_DEMO_SCRIPT.md
│   └── PACKAGING_AND_TROUBLESHOOTING.md
└── PlayablePrototype/                   # 3D First-Person Playable Browser Prototype
    ├── index.html                       # Standalone playable game executable in any modern browser
    ├── css/style.css                    # Ambient CRT & horror styling
    └── js/                              # Three.js 3D world, procedural audio, 9-state AI, Ayas detector
```

---

## 3. Quick Start: Playing the Prototype Right Now
You can play and test the full 15-25 minute survival horror experience immediately on this PC:
1. Open terminal in `c:\Users\LOQ\Desktop\bhooo\PlayablePrototype`.
2. Run `npx -y serve . -p 8080` (or double click `index.html` in your browser).
3. Open `http://localhost:8080` in Chrome, Edge, or Firefox.
4. Click anywhere to capture mouse pointer lock and enter the Pala Road!

## 4. Controls
- **W / A / S / D**: Move
- **Mouse**: Look around
- **Left Shift**: Sprint (consumes stamina)
- **Left Ctrl**: Crouch (quiets footsteps & lowers visibility)
- **Space**: Jump
- **E**: Interact / Splice Ward Wires / Hide in Veranda Closets / Collect Evidence
- **F**: Toggle Flashlight
- **Q**: Equip / Stow Handheld AYAS Detector
- **R**: Calibrate AYAS Detector (must be stationary)
- **G**: Scatter Sacred Ash circle (repels Yakshi)
- **Tab**: Open Objective Journal & Collected Evidence
- **Esc**: Pause Menu & Settings
