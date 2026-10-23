# Windows Packaging & Troubleshooting Guide
### AYAS: THE LAST WARD

---

## 1. Unreal Engine 5 Packaging Instructions for Windows (Shipping Build)
To produce a standalone Windows executable (`.exe`):

1. **Verify Project Settings**:
   - In Unreal Editor, navigate to **Edit -> Project Settings -> Packaging**:
     - Set **Build Configuration** to `Shipping`.
     - Enable **For Distribution** if preparing a final release.
     - Under **List of maps to include in a packaged build**, add:
       `/Game/Levels/L_PalaRoad`
2. **Package via Editor**:
   - Go to **Platforms -> Windows -> Package Project**.
   - Select an output directory (e.g. `c:\Users\LOQ\Desktop\bhooo\Build_Windows`).
   - The Unreal Automation Tool (UAT) will compile the game code, cook content packages, and output `AyasTheLastWard.exe`.
3. **Package via Command Line (UAT)**:
   ```cmd
   "C:\Program Files\Epic Games\UE_5.4\Engine\Build\BatchFiles\RunUAT.bat" BuildCookRun ^
     -project="c:\Users\LOQ\Desktop\bhooo\AyasTheLastWard.uproject" ^
     -noP4 -platform=Win64 -clientconfig=Shipping -cook -allmaps -build -stage -pak -archive ^
     -archivedirectory="c:\Users\LOQ\Desktop\bhooo\Build_Windows"
   ```

---

## 2. Playable Standalone Prototype Launch
To run the interactive 3D WebGL survival horror prototype immediately on PC:
1. Open terminal in `c:\Users\LOQ\Desktop\bhooo\PlayablePrototype`.
2. Run:
   ```cmd
   python -m http.server 8080 --directory .
   ```
3. Open Google Chrome or Microsoft Edge and navigate to `http://localhost:8080`.
4. Click anywhere on the title screen to capture the mouse and enter the game.

---

## 3. Known Limitations & Troubleshooting

### Issue A: "Missing or incompatible modules" when opening `.uproject`
- **Cause**: Unreal Engine project files need compilation before editor launch.
- **Resolution**: Right click `AyasTheLastWard.uproject` -> **Generate Visual Studio project files**, open `AyasTheLastWard.sln` in Visual Studio 2022, and press `Ctrl+Shift+B` to build `Development Editor Win64`.

### Issue B: Mouse cursor does not lock in prototype
- **Cause**: Browser security requires an explicit user gesture (click) before granting Pointer Lock.
- **Resolution**: Click anywhere on the game canvas. If pointer lock is lost (e.g. when opening pause menu), click "RESUME MISSION" to recapture.

### Issue C: Audio does not play immediately on page load
- **Cause**: Modern browsers enforce Autoplay policy requiring a user interaction before AudioContext is unlocked.
- **Resolution**: Clicking "CLICK ANYWHERE TO ENTER THE PALA ROAD" on the title screen automatically unlocks the Web Audio API context.
