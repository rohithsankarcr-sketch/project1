#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AyasInteractionComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnInteractionPromptChanged, bool, bCanInteract, const FText&, PromptText);

UINTERFACE(MinimalAPI, Blueprintable)
class UAyasInteractableInterface : public UInterface
{
	GENERATED_BODY()
};

class IAyasInteractableInterface
{
	GENERATED_BODY()

public:
	virtual FText GetInteractionPrompt() = 0;
	virtual void OnInteract(AActor* Interactor) = 0;
	virtual bool CanInteract(AActor* Interactor) { return true; }
	virtual float GetRequiredHoldTime() { return 0.0f; }
};

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class AYASTHELASTWARD_API UAyasInteractionComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAyasInteractionComponent();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Interaction")
	FOnInteractionPromptChanged OnPromptChanged;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Interaction")
	float TraceDistance;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Interaction")
	AActor* CurrentFocusedActor;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Interaction")
	void PerformInteractionTrace();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Interaction")
	void Interact();

	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

protected:
	virtual void BeginPlay() override;
};
