# Blueprint Asset Creation & Setup Specifications
### Project: AYAS: THE LAST WARD

---

## 1. Overview
All core gameplay, AI, perception, and detector logic are authored in C++. In Unreal Engine 5, Blueprints are used for asset binding, animations, particle effects, audio cues, and level placement.

---

## 2. Character Blueprint: `BP_AyasCharacter`
- **Parent Class**: `AAyasCharacter`
- **Location**: `/Game/Blueprints/Character/BP_AyasCharacter`
- **Components Configuration**:
  - `FirstPersonCamera`: Set Field of View to `90.0`.
  - `FlashlightComponent` (`USpotLightComponent`):
    - Intensity: `6500.0` cd
    - Inner Cone Angle: `18.0°`
    - Outer Cone Angle: `36.0°`
    - Attenuation Radius: `2500.0` units
    - Light Color: Warm incandescent (`#FFF5E0`)
  - `AyasDetectorMesh`: Attach to socket `hand_l_socket` on player skeletal mesh.
- **Audio References**:
  - `FootstepMudSound`: `/Game/Audio/Footsteps/A_Footstep_Mud_Cue`
  - `FootstepStoneSound`: `/Game/Audio/Footsteps/A_Footstep_Laterite_Cue`
  - `FootstepWoodSound`: `/Game/Audio/Footsteps/A_Footstep_Wood_Cue`

---

## 3. Entity Blueprint: `BP_YakshiCharacter`
- **Parent Class**: `AYakshiCharacter`
- **Location**: `/Game/Blueprints/AI/BP_YakshiCharacter`
- **Skeletal Mesh**: Tall humanoid draped in flowing off-white Kerala kasavu garment with long dark hair.
- **Animation Blueprint (`ABP_Yakshi`)**:
  - State 1 (Dormant): Idle freeze.
  - State 2 (Stalking): Low-glide prowl (speed: 220 cm/s).
  - State 3 (Luring): Subtle reaching gesture while producing spatial audio.
  - State 5 (Hunting): Rapid forward rush (speed: 540 cm/s) with cloth simulation.
  - State 7 (Disrupted): Flinch scream and accelerated reverse retreat (speed: 680 cm/s).
- **Audio References**:
  - `AnkletChimeSound`: `/Game/Audio/Entity/A_Chilanka_Bells_Cue` (Multi-position spatialization).
  - `WhisperLureSound`: `/Game/Audio/Entity/A_Yakshi_Whisper_Malayalam_Cue`
  - `DistantCallSound`: `/Game/Audio/Entity/A_Yakshi_DistantCall_Cue`
  - `ScreamDisruptedSound`: `/Game/Audio/Entity/A_Yakshi_Disrupted_Cue`
  - `AttackStingerSound`: `/Game/Audio/Music/A_Attack_Jumpscare_Cue`

---

## 4. Ward Station Blueprints: `BP_WardStation_A`, `BP_WardStation_B`, `BP_WardStation_C`
- **Parent Class**: `AWardStationActor`
- **Locations**: `/Game/Blueprints/Environment/`
- **Properties**:
  - `WardID`: Set to `WardA`, `WardB`, or `WardC`.
  - `WardDisplayName`: "Ward A: Village Path" / "Ward B: Pala Tree" / "Ward C: Ancestral House"
  - `RepairHoldDuration`: `2.5s` (Ward A), `3.5s` (Ward B), `4.5s` (Ward C).
  - `SparkVFXComponent`: `/Game/VFX/P_Electric_Spark_Loop` (active when broken).
  - `ElectricalHumAudio`: `/Game/Audio/Environment/A_Electrical_Hum_Loop` (active when repaired).
