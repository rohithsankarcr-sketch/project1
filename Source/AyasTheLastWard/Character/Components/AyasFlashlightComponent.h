#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AyasFlashlightComponent.generated.h"

class USpotLightComponent;
class USoundBase;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnFlashlightToggled, bool, bIsOn);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnFlashlightBatteryChanged, float, CurrentBattery, float, MaxBattery);

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class AYASTHELASTWARD_API UAyasFlashlightComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAyasFlashlightComponent();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Flashlight")
	FOnFlashlightToggled OnFlashlightToggled;

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Flashlight")
	FOnFlashlightBatteryChanged OnBatteryChanged;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Flashlight")
	float MaxBattery;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Flashlight")
	float CurrentBattery;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Flashlight")
	float BatteryDrainRate;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Flashlight")
	bool bIsTurnedOn;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Flashlight")
	bool bIsFlickering;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Flashlight")
	USoundBase* ToggleSound;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Flashlight")
	void ToggleFlashlight();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Flashlight")
	void SetFlashlightActive(bool bActive);

	UFUNCTION(BlueprintCallable, Category = "Ayas|Flashlight")
	void TriggerFlicker(float Duration);

	UFUNCTION(BlueprintPure, Category = "Ayas|Flashlight")
	float GetBatteryNormalized() const { return CurrentBattery / MaxBattery; }

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

protected:
	virtual void BeginPlay() override;

private:
	UPROPERTY()
	USpotLightComponent* TargetSpotLight;

	float FlickerTimer;
	float FlickerIntervalTimer;
	float BaseIntensity;
};
