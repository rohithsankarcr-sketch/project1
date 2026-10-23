#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "AyasTheLastWard/Core/AyasSaveGame.h"
#include "AyasTheLastWard/Character/Components/AyasInteractionComponent.h"
#include "WardStationActor.generated.h"

class UStaticMeshComponent;
class UParticleSystemComponent;
class UAudioComponent;
class USoundBase;

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnStationStateChanged, FName, WardID, EWardState, NewState);

UCLASS()
class AYASTHELASTWARD_API AWardStationActor : public AActor, public IAyasInteractableInterface
{
	GENERATED_BODY()

public:
	AWardStationActor();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Ward")
	FOnStationStateChanged OnWardStateChanged;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UStaticMeshComponent* WardPostMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UParticleSystemComponent* SparkVFXComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAudioComponent* ElectricalHumAudio;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Ward")
	FName WardID; // "WardA", "WardB", "WardC"

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Ward")
	FText WardDisplayName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Ward")
	EWardState CurrentState;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Ward")
	float RepairHoldDuration; // Time needed to repair

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Audio")
	USoundBase* RepairCompleteSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Audio")
	USoundBase* CircuitSnapSound;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Ward")
	void SetStationState(EWardState NewState);

	UFUNCTION(BlueprintPure, Category = "Ayas|Ward")
	EWardState GetWardState() const { return CurrentState; }

	// IAyasInteractableInterface
	virtual FText GetInteractionPrompt() override;
	virtual void OnInteract(AActor* Interactor) override;
	virtual bool CanInteract(AActor* Interactor) override;
	virtual float GetRequiredHoldTime() override { return RepairHoldDuration; }

protected:
	virtual void BeginPlay() override;

private:
	void UpdateVisualAndAudioState();
};
