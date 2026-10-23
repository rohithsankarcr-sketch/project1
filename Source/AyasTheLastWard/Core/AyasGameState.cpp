#include "AyasGameState.h"

AAyasGameState::AAyasGameState()
{
	PrimaryActorTick.bCanEverTick = true;

	WardA_State = EWardState::Disconnected;
	WardB_State = EWardState::Damaged;
	WardC_State = EWardState::Damaged;

	StormIntensity = 0.5f;
	CurrentThreatLevel = 0.1f;
	ElapsedMissionTime = 0.0f;
}

void AAyasGameState::Tick(float DeltaSeconds)
{
	Super::Tick(DeltaSeconds);
	ElapsedMissionTime += DeltaSeconds;
}

void AAyasGameState::SetWardState(FName WardID, EWardState NewState)
{
	if (WardID == FName("WardA"))
	{
		WardA_State = NewState;
	}
	else if (WardID == FName("WardB"))
	{
		WardB_State = NewState;
	}
	else if (WardID == FName("WardC"))
	{
		WardC_State = NewState;
	}

	OnWardStateChanged.Broadcast(WardID, NewState);
}

EWardState AAyasGameState::GetWardState(FName WardID) const
{
	if (WardID == FName("WardA")) return WardA_State;
	if (WardID == FName("WardB")) return WardB_State;
	if (WardID == FName("WardC")) return WardC_State;
	return EWardState::Disconnected;
}

void AAyasGameState::UpdateThreatLevel(float NewThreat)
{
	CurrentThreatLevel = FMath::Clamp(NewThreat, 0.0f, 1.0f);
	OnThreatLevelChanged.Broadcast(CurrentThreatLevel);
}
