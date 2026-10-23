#include "AyasFlashlightComponent.h"
#include "Components/SpotLightComponent.h"
#include "Kismet/GameplayStatics.h"

UAyasFlashlightComponent::UAyasFlashlightComponent()
{
	PrimaryComponentTick.bCanEverTick = true;

	MaxBattery = 100.0f;
	CurrentBattery = 100.0f;
	BatteryDrainRate = 0.05f; // Lasts ~30 minutes
	bIsTurnedOn = true;
	bIsFlickering = false;
	FlickerTimer = 0.0f;
	FlickerIntervalTimer = 0.0f;
	BaseIntensity = 5000.0f;
}

void UAyasFlashlightComponent::BeginPlay()
{
	Super::BeginPlay();

	AActor* Owner = GetOwner();
	if (Owner)
	{
		TargetSpotLight = Owner->FindComponentByClass<USpotLightComponent>();
		if (TargetSpotLight)
		{
			BaseIntensity = TargetSpotLight->Intensity;
			TargetSpotLight->SetVisibility(bIsTurnedOn);
		}
	}
}

void UAyasFlashlightComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (bIsTurnedOn)
	{
		CurrentBattery = FMath::Clamp(CurrentBattery - (BatteryDrainRate * DeltaTime), 0.0f, MaxBattery);
		OnBatteryChanged.Broadcast(CurrentBattery, MaxBattery);

		if (CurrentBattery <= 0.0f)
		{
			SetFlashlightActive(false);
		}
	}

	if (bIsFlickering && TargetSpotLight)
	{
		FlickerTimer -= DeltaTime;
		FlickerIntervalTimer -= DeltaTime;

		if (FlickerIntervalTimer <= 0.0f)
		{
			TargetSpotLight->SetVisibility(FMath::RandBool() && bIsTurnedOn);
			FlickerIntervalTimer = FMath::FRandRange(0.04f, 0.12f);
		}

		if (FlickerTimer <= 0.0f)
		{
			bIsFlickering = false;
			TargetSpotLight->SetVisibility(bIsTurnedOn);
		}
	}
}

void UAyasFlashlightComponent::ToggleFlashlight()
{
	SetFlashlightActive(!bIsTurnedOn);
}

void UAyasFlashlightComponent::SetFlashlightActive(bool bActive)
{
	if (bActive && CurrentBattery <= 0.0f)
	{
		return;
	}

	bIsTurnedOn = bActive;

	if (TargetSpotLight)
	{
		TargetSpotLight->SetVisibility(bIsTurnedOn);
	}

	if (ToggleSound)
	{
		UGameplayStatics::PlaySound2D(this, ToggleSound);
	}

	OnFlashlightToggled.Broadcast(bIsTurnedOn);
}

void UAyasFlashlightComponent::TriggerFlicker(float Duration)
{
	bIsFlickering = true;
	FlickerTimer = Duration;
	FlickerIntervalTimer = 0.05f;
}
