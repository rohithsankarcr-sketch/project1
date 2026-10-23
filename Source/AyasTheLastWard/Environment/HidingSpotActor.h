#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "AyasTheLastWard/Character/Components/AyasInteractionComponent.h"
#include "HidingSpotActor.generated.h"

class UStaticMeshComponent;
class USceneComponent;

UCLASS()
class AYASTHELASTWARD_API AHidingSpotActor : public AActor, public IAyasInteractableInterface
{
	GENERATED_BODY()

public:
	AHidingSpotActor();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UStaticMeshComponent* HidingMesh;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USceneComponent* InteriorCameraPoint;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USceneComponent* ExitPoint;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Hiding")
	bool bIsOccupied;

	virtual FText GetInteractionPrompt() override;
	virtual void OnInteract(AActor* Interactor) override;
	virtual bool CanInteract(AActor* Interactor) override;

protected:
	virtual void BeginPlay() override;

private:
	UPROPERTY()
	AActor* CurrentHider;
};
