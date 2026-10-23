#include "AyasStaminaComponent.h"

UAyasStaminaComponent::UAyasStaminaComponent()
{
	PrimaryComponentTick.bCanEverTick = false;

	MaxStamina = 100.0f;
	CurrentStamina = 100.0f;
	DrainRateSprint = 22.0f; // drains in ~4.5 seconds of full sprint
	RecoveryRateWalk = 12.0f;
	RecoveryRateStationary = 20.0f;
	bIsExhausted = false;
}

void UAyasStaminaComponent::BeginPlay()
{
	Super::BeginPlay();
	CurrentStamina = MaxStamina;
}

bool UAyasStaminaComponent::ConsumeStamina(float DeltaSeconds)
{
	if (bIsExhausted) return false;

	CurrentStamina = FMath::Clamp(CurrentStamina - (DrainRateSprint * DeltaSeconds), 0.0f, MaxStamina);
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);

	if (CurrentStamina <= 0.0f)
	{
		bIsExhausted = true;
		return false;
	}
	return true;
}

void UAyasStaminaComponent::RestoreStamina(float DeltaSeconds, bool bIsStationary)
{
	float Rate = bIsStationary ? RecoveryRateStationary : RecoveryRateWalk;
	CurrentStamina = FMath::Clamp(CurrentStamina + (Rate * DeltaSeconds), 0.0f, MaxStamina);
	OnStaminaChanged.Broadcast(CurrentStamina, MaxStamina);

	if (bIsExhausted && CurrentStamina >= 25.0f)
	{
		bIsExhausted = false;
	}
}
