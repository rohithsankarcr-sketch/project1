#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameStateBase.h"
#include "AyasSaveGame.h"
#include "AyasGameState.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnWardStateChanged, FName, WardID, EWardState, NewState);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnThreatLevelChanged, float, ThreatLevel);

UCLASS()
class AYASTHELASTWARD_API AAyasGameState : public AGameStateBase
{
	GENERATED_BODY()

public:
	AAyasGameState();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Events")
	FOnWardStateChanged OnWardStateChanged;

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Events")
	FOnThreatLevelChanged OnThreatLevelChanged;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Wards")
	EWardState WardA_State;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Wards")
	EWardState WardB_State;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Wards")
	EWardState WardC_State;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Atmosphere")
	float StormIntensity;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|AI")
	float CurrentThreatLevel; // 0.0 safe -> 1.0 max hunt

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Time")
	float ElapsedMissionTime;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Wards")
	void SetWardState(FName WardID, EWardState NewState);

	UFUNCTION(BlueprintPure, Category = "Ayas|Wards")
	EWardState GetWardState(FName WardID) const;

	UFUNCTION(BlueprintCallable, Category = "Ayas|AI")
	void UpdateThreatLevel(float NewThreat);

	virtual void Tick(float DeltaSeconds) override;
};
