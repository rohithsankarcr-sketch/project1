#include "AyasInteractionComponent.h"
#include "Camera/CameraComponent.h"
#include "Engine/World.h"
#include "DrawDebugHelpers.h"

UAyasInteractionComponent::UAyasInteractionComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	TraceDistance = 250.0f; // 2.5 meters
	CurrentFocusedActor = nullptr;
}

void UAyasInteractionComponent::BeginPlay()
{
	Super::BeginPlay();
}

void UAyasInteractionComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);
	PerformInteractionTrace();
}

void UAyasInteractionComponent::PerformInteractionTrace()
{
	AActor* Owner = GetOwner();
	if (!Owner) return;

	UCameraComponent* Camera = Owner->FindComponentByClass<UCameraComponent>();
	if (!Camera) return;

	FVector Start = Camera->GetComponentLocation();
	FVector ForwardVector = Camera->GetForwardVector();
	FVector End = Start + (ForwardVector * TraceDistance);

	FHitResult HitResult;
	FCollisionQueryParams QueryParams;
	QueryParams.AddIgnoredActor(Owner);

	bool bHit = GetWorld()->LineTraceSingleByChannel(HitResult, Start, End, ECC_Visibility, QueryParams);

	if (bHit && HitResult.GetActor())
	{
		AActor* HitActor = HitResult.GetActor();
		IAyasInteractableInterface* Interactable = Cast<IAyasInteractableInterface>(HitActor);

		if (Interactable && Interactable->CanInteract(Owner))
		{
			CurrentFocusedActor = HitActor;
			OnPromptChanged.Broadcast(true, Interactable->GetInteractionPrompt());
			return;
		}
	}

	if (CurrentFocusedActor != nullptr)
	{
		CurrentFocusedActor = nullptr;
		OnPromptChanged.Broadcast(false, FText::GetEmpty());
	}
}

void UAyasInteractionComponent::Interact()
{
	if (CurrentFocusedActor)
	{
		IAyasInteractableInterface* Interactable = Cast<IAyasInteractableInterface>(CurrentFocusedActor);
		if (Interactable && Interactable->CanInteract(GetOwner()))
		{
			Interactable->OnInteract(GetOwner());
		}
	}
}
