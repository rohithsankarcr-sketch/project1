#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AyasStaminaComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStaminaChanged, float, CurrentStamina, float, MaxStamina);

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class AYASTHELASTWARD_API UAyasStaminaComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAyasStaminaComponent();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Stamina")
	FOnStaminaChanged OnStaminaChanged;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Stamina")
	float MaxStamina;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Stamina")
	float CurrentStamina;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Stamina")
	float DrainRateSprint;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Stamina")
	float RecoveryRateWalk;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Stamina")
	float RecoveryRateStationary;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Stamina")
	bool bIsExhausted;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Stamina")
	bool ConsumeStamina(float DeltaSeconds);

	UFUNCTION(BlueprintCallable, Category = "Ayas|Stamina")
	void RestoreStamina(float DeltaSeconds, bool bIsStationary);

	UFUNCTION(BlueprintPure, Category = "Ayas|Stamina")
	float GetStaminaNormalized() const { return CurrentStamina / MaxStamina; }

protected:
	virtual void BeginPlay() override;
};
