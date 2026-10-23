#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "AyasTheLastWard/Character/Components/AyasInteractionComponent.h"
#include "EvidenceActor.generated.h"

class UStaticMeshComponent;
class USoundBase;

UCLASS()
class AYASTHELASTWARD_API AEvidenceActor : public AActor, public IAyasInteractableInterface
{
	GENERATED_BODY()

public:
	AEvidenceActor();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UStaticMeshComponent* MeshComponent;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Evidence")
	FString EvidenceID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Evidence")
	FText EvidenceTitle;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Evidence")
	FText EvidenceContents;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Evidence")
	USoundBase* PickupSound;

	virtual FText GetInteractionPrompt() override;
	virtual void OnInteract(AActor* Interactor) override;
	virtual bool CanInteract(AActor* Interactor) override;
};
