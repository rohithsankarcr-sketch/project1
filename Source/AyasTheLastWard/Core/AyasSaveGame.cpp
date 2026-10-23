#include "AyasSaveGame.h"

UAyasSaveGame::UAyasSaveGame()
{
	SaveSlotName = TEXT("AyasSlot01");
	UserIndex = 0;
	PlayerTransform = FTransform::Identity;
	CurrentObjectiveIndex = 1;
	WardAState = EWardState::Disconnected;
	WardBState = EWardState::Damaged;
	WardCState = EWardState::Damaged;
	SacredAshCount = 2;
	FlashlightBattery = 100.0f;
	Timestamp = FDateTime::Now();
}
