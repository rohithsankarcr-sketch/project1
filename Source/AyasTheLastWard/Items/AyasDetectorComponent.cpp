#include "AyasDetectorComponent.h"
#include "Kismet/GameplayStatics.h"
#include "AyasTheLastWard/AI/YakshiCharacter.h"
#include "AyasTheLastWard/Environment/WardStationActor.h"
#include "AyasTheLastWard/Core/AyasGameState.h"

UAyasDetectorComponent::UAyasDetectorComponent()
{
	PrimaryComponentTick.bCanEverTick = true;

	bIsEquipped = true;
	BaselineField = 42.5f; // Kerala ambient geomagnetic baseline
	GeigerTimer = 0.0f;
	VoiceLureFadeTimer = 0.0f;
	CalibrationTimer = 0.0f;

	CurrentReadings.MagneticField_uT = BaselineField;
	CurrentReadings.BaselineDeviation = 0.0f;
	CurrentReadings.AmbientTemperature_C = 28.5f;
	CurrentReadings.VoiceAnomalyConfidence = 0.0f;
}

void UAyasDetectorComponent::BeginPlay()
{
	Super::BeginPlay();
}

void UAyasDetectorComponent::SetDetectorEquipped(bool bEquip)
{
	bIsEquipped = bEquip;
}

void UAyasDetectorComponent::Calibrate()
{
	if (!CurrentReadings.bIsCalibrating)
	{
		CurrentReadings.bIsCalibrating = true;
		CalibrationTimer = 0.0f;
		CurrentReadings.CalibrationProgress = 0.0f;
	}
}

void UAyasDetectorComponent::PerformActivePing()
{
	if (!bIsEquipped) return;

	if (WarningPingSound)
	{
		UGameplayStatics::PlaySound2D(this, WarningPingSound, 0.6f);
	}

	UpdateWardCompassReadings();
}

void UAyasDetectorComponent::RegisterVoiceLureEvent(float Confidence)
{
	CurrentReadings.VoiceAnomalyConfidence = FMath::Clamp(Confidence, 0.0f, 1.0f);
	VoiceLureFadeTimer = 5.0f;

	if (WarningPingSound && CurrentReadings.VoiceAnomalyConfidence > 0.6f)
	{
		UGameplayStatics::PlaySound2D(this, WarningPingSound, 0.8f, 1.4f);
	}
}

void UAyasDetectorComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	if (CurrentReadings.bIsCalibrating)
	{
		CalibrationTimer += DeltaTime;
		CurrentReadings.CalibrationProgress = FMath::Clamp(CalibrationTimer / CalibrationRequiredTime, 0.0f, 1.0f);

		if (CalibrationTimer >= CalibrationRequiredTime)
		{
			CurrentReadings.bIsCalibrating = false;
			CurrentReadings.CalibrationProgress = 1.0f;
			BaselineField = CurrentReadings.MagneticField_uT; // Reset baseline

			if (CalibrateCompleteSound)
			{
				UGameplayStatics::PlaySound2D(this, CalibrateCompleteSound, 0.8f);
			}
		}
	}

	if (VoiceLureFadeTimer > 0.0f)
	{
		VoiceLureFadeTimer -= DeltaTime;
		if (VoiceLureFadeTimer <= 0.0f)
		{
			CurrentReadings.VoiceAnomalyConfidence = 0.0f;
		}
	}

	UpdateMagneticAndThermalReadings(DeltaTime);
	UpdateWardCompassReadings();
	ProcessAudioFeedback(DeltaTime);

	OnReadingsUpdated.Broadcast(CurrentReadings);
}

void UAyasDetectorComponent::UpdateMagneticAndThermalReadings(float DeltaTime)
{
	AActor* Owner = GetOwner();
	if (!Owner) return;

	FVector PlayerLoc = Owner->GetActorLocation();

	// Find Yakshi in level
	TArray<AActor*> FoundYakshis;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), AYakshiCharacter::StaticClass(), FoundYakshis);

	float MinDistanceToYakshi = 99999.0f;
	for (AActor* YakshiActor : FoundYakshis)
	{
		float Dist = FVector::Dist(PlayerLoc, YakshiActor->GetActorLocation());
		if (Dist < MinDistanceToYakshi)
		{
			MinDistanceToYakshi = Dist;
		}
	}

	// Calculate EM deviation based on Yakshi proximity
	float AnomalyInfluence = 0.0f;
	if (MinDistanceToYakshi < 3500.0f) // within 35 meters
	{
		AnomalyInfluence = 1.0f - (MinDistanceToYakshi / 3500.0f);
	}

	// Add slight natural noise/flicker
	float Jitter = FMath::FRandRange(-0.8f, 0.8f);
	float TargetEM = BaselineField + (AnomalyInfluence * 135.0f) + Jitter;
	CurrentReadings.MagneticField_uT = FMath::FInterpTo(CurrentReadings.MagneticField_uT, TargetEM, DeltaTime, 4.0f);
	CurrentReadings.BaselineDeviation = FMath::Abs(CurrentReadings.MagneticField_uT - BaselineField);

	// Cold spot drop
	float TargetTemp = FMath::Lerp(28.5f, 4.0f, AnomalyInfluence);
	CurrentReadings.AmbientTemperature_C = FMath::FInterpTo(CurrentReadings.AmbientTemperature_C, TargetTemp, DeltaTime, 1.5f);

	if (AnomalyInfluence > 0.7f)
	{
		OnAnomalySpike.Broadcast(AnomalyInfluence);
	}
}

void UAyasDetectorComponent::UpdateWardCompassReadings()
{
	AActor* Owner = GetOwner();
	if (!Owner) return;

	TArray<AActor*> WardActors;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), AWardStationActor::StaticClass(), WardActors);

	float NearestDist = 99999.0f;
	AWardStationActor* NearestDamagedWard = nullptr;

	for (AActor* Actor : WardActors)
	{
		AWardStationActor* Ward = Cast<AWardStationActor>(Actor);
		if (Ward && Ward->GetWardState() != EWardState::Intact && Ward->GetWardState() != EWardState::Repaired)
		{
			float Dist = FVector::Dist(Owner->GetActorLocation(), Ward->GetActorLocation());
			if (Dist < NearestDist)
			{
				NearestDist = Dist;
				NearestDamagedWard = Ward;
			}
		}
	}

	if (NearestDamagedWard)
	{
		CurrentReadings.WardNearestDistance = NearestDist;
		FVector Dir = (NearestDamagedWard->GetActorLocation() - Owner->GetActorLocation()).GetSafeNormal2D();
		FVector Forward = Owner->GetActorForwardVector().GetSafeNormal2D();
		float Dot = FVector::DotProduct(Forward, Dir);
		float Cross = FVector::CrossProduct(Forward, Dir).Z;
		float Angle = FMath::RadiansToDegrees(FMath::Atan2(Cross, Dot));
		CurrentReadings.WardNearestBearingDegrees = Angle;
	}
	else
	{
		CurrentReadings.WardNearestDistance = 0.0f;
		CurrentReadings.WardNearestBearingDegrees = 0.0f;
	}
}

void UAyasDetectorComponent::ProcessAudioFeedback(float DeltaTime)
{
	if (!bIsEquipped) return;

	float Anomaly = CurrentReadings.BaselineDeviation; // 0 to 135
	if (Anomaly > 5.0f && GeigerClickSound)
	{
		float ClickInterval = FMath::Clamp(1.2f - (Anomaly / 100.0f), 0.06f, 1.2f);
		GeigerTimer += DeltaTime;

		if (GeigerTimer >= ClickInterval)
		{
			GeigerTimer = 0.0f;
			float Pitch = FMath::FRandRange(0.9f, 1.1f);
			UGameplayStatics::PlaySound2D(this, GeigerClickSound, 0.45f, Pitch);
		}
	}
}
