#include "AyasObjectiveManager.h"

UAyasObjectiveManager::UAyasObjectiveManager()
{
	PrimaryComponentTick.bCanEverTick = false;
	CurrentObjectiveIndex = 0;
	EvidenceCollectedCount = 0;
}

void UAyasObjectiveManager::BeginPlay()
{
	Super::BeginPlay();
	InitializeObjectives();
}

void UAyasObjectiveManager::InitializeObjectives()
{
	ObjectivesList.Empty();

	ObjectivesList.Add(FAyasObjective(
		1,
		NSLOCTEXT("Ayas", "Obj1Title", "Objective 1: Enter the Village"),
		NSLOCTEXT("Ayas", "Obj1Desc", "Reach the abandoned ancestral house and retrieve your field notebook. Familiarize yourself with the area."),
		NSLOCTEXT("Ayas", "Obj1Hint", "Follow the lantern road. Use [W,A,S,D] to move, [Shift] to sprint, [F] for flashlight.")
	));

	ObjectivesList.Add(FAyasObjective(
		2,
		NSLOCTEXT("Ayas", "Obj2Title", "Objective 2: Calibrate Ayas Detector"),
		NSLOCTEXT("Ayas", "Obj2Desc", "Find a stable baseline zone away from high iron concentrations. Stand still and calibrate your AYAS monitor."),
		NSLOCTEXT("Ayas", "Obj2Hint", "Press [Q] to equip the AYAS detector. When stationary, hold [R] to calibrate baseline readings.")
	));

	ObjectivesList.Add(FAyasObjective(
		3,
		NSLOCTEXT("Ayas", "Obj3Title", "Objective 3: Investigate the Pala Tree"),
		NSLOCTEXT("Ayas", "Obj3Desc", "Unusual electromagnetic deviations detected near the ancient Pala tree. Approach with caution and observe."),
		NSLOCTEXT("Ayas", "Obj3Hint", "Watch the Ayas EM needle. If you hear sweet calls or anklets, check the voice authenticity meter.")
	));

	ObjectivesList.Add(FAyasObjective(
		4,
		NSLOCTEXT("Ayas", "Obj4Title", "Objective 4: Restore Ward A (Village Path)"),
		NSLOCTEXT("Ayas", "Obj4Desc", "The entrance perimeter ward has severed continuity. Locate the terminal and splice the conductive iron line."),
		NSLOCTEXT("Ayas", "Obj4Hint", "Approach Ward Post A. Look for the sparking terminal box and hold [E] to reconnect the circuit.")
	));

	ObjectivesList.Add(FAyasObjective(
		5,
		NSLOCTEXT("Ayas", "Obj5Title", "Objective 5: Survive & Restore Ward B (Pala Tree)"),
		NSLOCTEXT("Ayas", "Obj5Desc", "The Pala tree ward is heavily disturbed. The entity is active in the canopy and tree perimeter. Avoid direct confrontation."),
		NSLOCTEXT("Ayas", "Obj5Hint", "Use [Ctrl] to crouch and break line of sight. Listen for audio cues. Restore Ward B.")
	));

	ObjectivesList.Add(FAyasObjective(
		6,
		NSLOCTEXT("Ayas", "Obj6Title", "Objective 6: Recover Disappearance Evidence"),
		NSLOCTEXT("Ayas", "Obj6Desc", "Search the ancestral house for 3 missing case files, ritual records, and previous researcher notes."),
		NSLOCTEXT("Ayas", "Obj6Hint", "Check the veranda, storage desk, and interior sanctum. Press [Tab] to review collected evidence.")
	));

	ObjectivesList.Add(FAyasObjective(
		7,
		NSLOCTEXT("Ayas", "Obj7Title", "Objective 7: Restore Ward C (Ancestral House)"),
		NSLOCTEXT("Ayas", "Obj7Desc", "The final perimeter boundary around the house is compromised. Replace the missing grounding fuse."),
		NSLOCTEXT("Ayas", "Obj7Hint", "Locate spare connectors in the courtyard and complete the circuit before the entity breaches.")
	));

	ObjectivesList.Add(FAyasObjective(
		8,
		NSLOCTEXT("Ayas", "Obj8Title", "Objective 8: Escape Before Dawn"),
		NSLOCTEXT("Ayas", "Obj8Desc", "Perimeter stabilized! Follow the Ayas directional vector toward the protected village shrine before dawn."),
		NSLOCTEXT("Ayas", "Obj8Hint", "Sprint to the southern shrine clearing. Use Sacred Ash if pursued!")
	));

	CurrentObjectiveIndex = 0;
	if (ObjectivesList.Num() > 0)
	{
		ObjectivesList[0].bIsActive = true;
	}
}

void UAyasObjectiveManager::CompleteCurrentObjective()
{
	if (ObjectivesList.IsValidIndex(CurrentObjectiveIndex))
	{
		ObjectivesList[CurrentObjectiveIndex].bIsCompleted = true;
		ObjectivesList[CurrentObjectiveIndex].bIsActive = false;

		CurrentObjectiveIndex++;
		if (ObjectivesList.IsValidIndex(CurrentObjectiveIndex))
		{
			ObjectivesList[CurrentObjectiveIndex].bIsActive = true;
			OnObjectiveUpdated.Broadcast(CurrentObjectiveIndex, ObjectivesList[CurrentObjectiveIndex]);
		}
	}
}

void UAyasObjectiveManager::CollectEvidenceItem(const FString& EvidenceID)
{
	EvidenceCollectedCount++;
	if (CurrentObjectiveIndex == 5 && EvidenceCollectedCount >= 3) // Objective 6 (0-indexed 5)
	{
		CompleteCurrentObjective();
	}
}

FAyasObjective UAyasObjectiveManager::GetCurrentObjective() const
{
	if (ObjectivesList.IsValidIndex(CurrentObjectiveIndex))
	{
		return ObjectivesList[CurrentObjectiveIndex];
	}
	return FAyasObjective();
}

void UAyasObjectiveManager::SetObjectiveByIndex(int32 TargetIndex)
{
	if (ObjectivesList.IsValidIndex(TargetIndex))
	{
		for (int32 i = 0; i < TargetIndex; ++i)
		{
			ObjectivesList[i].bIsCompleted = true;
			ObjectivesList[i].bIsActive = false;
		}
		CurrentObjectiveIndex = TargetIndex;
		ObjectivesList[CurrentObjectiveIndex].bIsActive = true;
		OnObjectiveUpdated.Broadcast(CurrentObjectiveIndex, ObjectivesList[CurrentObjectiveIndex]);
	}
}
