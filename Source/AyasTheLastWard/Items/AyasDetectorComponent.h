#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AyasTheLastWard/Core/AyasSaveGame.h"
#include "AyasDetectorComponent.generated.h"

class USoundBase;

USTRUCT(BlueprintType)
struct FAyasDetectorReadings
{
	GENERATED_BODY()

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	float MagneticField_uT; // Baseline ~42.5 uT, spikes up to 180 uT near Yakshi

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	float BaselineDeviation;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	float AmbientTemperature_C; // Ambient ~28.5 C down to 3.5 C in cold-spots

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	float VoiceAnomalyConfidence; // 0.0 to 1.0 (1.0 = confirmed lure mimicry)

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	float WardNearestDistance;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	float WardNearestBearingDegrees;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	bool bIsCalibrating;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Detector")
	float CalibrationProgress; // 0.0 to 1.0

	FAyasDetectorReadings()
		: MagneticField_uT(42.5f), BaselineDeviation(0.0f), AmbientTemperature_C(28.5f),
		  VoiceAnomalyConfidence(0.0f), WardNearestDistance(0.0f), WardNearestBearingDegrees(0.0f),
		  bIsCalibrating(false), CalibrationProgress(0.0f) {}
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDetectorReadingsUpdated, const FAyasDetectorReadings&, Readings);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDetectorAnomalySpike, float, Severity);

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class AYASTHELASTWARD_API UAyasDetectorComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAyasDetectorComponent();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Detector")
	FOnDetectorReadingsUpdated OnReadingsUpdated;

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Detector")
	FOnDetectorAnomalySpike OnAnomalySpike;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Detector")
	FAyasDetectorReadings CurrentReadings;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Detector")
	bool bIsEquipped;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Detector|Audio")
	USoundBase* GeigerClickSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Detector|Audio")
	USoundBase* WarningPingSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Detector|Audio")
	USoundBase* CalibrateCompleteSound;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Detector")
	void SetDetectorEquipped(bool bEquip);

	UFUNCTION(BlueprintCallable, Category = "Ayas|Detector")
	void Calibrate();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Detector")
	void PerformActivePing();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Detector")
	void RegisterVoiceLureEvent(float Confidence);

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

protected:
	virtual void BeginPlay() override;

private:
	float BaselineField;
	float GeigerTimer;
	float VoiceLureFadeTimer;
	float CalibrationTimer;
	const float CalibrationRequiredTime = 2.5f;

	void UpdateMagneticAndThermalReadings(float DeltaTime);
	void UpdateWardCompassReadings();
	void ProcessAudioFeedback(float DeltaTime);
};
