# Unreal Engine 5 Editor Setup & Compilation Guide
### Project: AYAS: THE LAST WARD

---

## 1. Prerequisites
- **Unreal Engine**: Version 5.3 or 5.4+ installed via Epic Games Launcher.
- **Visual Studio**: Visual Studio 2022 (Community or Professional) with the following workloads:
  - Desktop development with C++
  - Game development with C++ (including Unreal Engine Installer & Windows 10/11 SDK).
- **Windows**: Windows 10 / 11 64-bit.

---

## 2. Generating Project Files
1. Navigate to the project root directory: `c:\Users\LOQ\Desktop\bhooo`.
2. Right-click `AyasTheLastWard.uproject` and select **"Generate Visual Studio project files"**.
   - If prompted for Unreal Engine version, select **Unreal Engine 5.4** (or 5.3).
3. If using command line:
   ```cmd
   "C:\Program Files\Epic Games\UE_5.4\Engine\Build\BatchFiles\Build.bat" -projectfiles -project="c:\Users\LOQ\Desktop\bhooo\AyasTheLastWard.uproject" -game -engine -progress
   ```
4. Double-click `AyasTheLastWard.sln` to open Visual Studio 2022.
5. In the Solution Configurations dropdown, select **Development Editor** and **Win64**.
6. Press `Ctrl + Shift + B` to build the solution. Ensure the output window displays `Build: 1 succeeded, 0 failed`.

---

## 3. Opening in Unreal Editor
1. Double-click `AyasTheLastWard.uproject`.
2. The Unreal Editor will launch with the compiled C++ classes exposed in the Content Browser under `C++ Classes / AyasTheLastWard`.

---

## 4. Blueprint & GameMode Configuration in Editor
1. In `Content/Blueprints/`, create the Blueprint children:
   - `BP_AyasCharacter` derived from `AAyasCharacter`.
     - Assign FP Mesh, Camera arms, Flashlight SpotLight, and Footstep sound cues.
   - `BP_AyasPlayerController` derived from `AAyasPlayerController`.
     - Assign UI Widget classes (`WBP_MainHUD`, `WBP_PauseMenu`, `WBP_DeathWin`).
   - `BP_YakshiCharacter` derived from `AYakshiCharacter`.
     - Assign skeletal mesh (flowing white garment, black hair), AnimBlueprint, and audio cues.
   - `BP_YakshiAIController` derived from `AYakshiAIController`.
     - Assign `BT_Yakshi` behavior tree and `BB_Yakshi` blackboard.
   - `BP_WardStation_A`, `BP_WardStation_B`, `BP_WardStation_C` derived from `AWardStationActor`.
2. Open **Project Settings -> Maps & Modes**:
   - Set **Default GameMode** to `BP_AyasGameMode` (or `AAyasGameMode`).
   - Set **Editor Startup Map** and **Game Default Map** to `/Game/Levels/L_PalaRoad`.
