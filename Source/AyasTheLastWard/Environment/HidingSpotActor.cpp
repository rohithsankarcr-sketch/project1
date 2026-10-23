#include "HidingSpotActor.h"
#include "Components/StaticMeshComponent.h"
#include "AyasTheLastWard/Character/AyasCharacter.h"

AHidingSpotActor::AHidingSpotActor()
{
	PrimaryActorTick.bCanEverTick = false;

	HidingMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("HidingMesh"));
	RootComponent = HidingMesh;

	InteriorCameraPoint = CreateDefaultSubobject<USceneComponent>(TEXT("InteriorCameraPoint"));
	InteriorCameraPoint->SetupAttachment(RootComponent);
	InteriorCameraPoint->SetRelativeLocation(FVector(0.0f, 0.0f, 50.0f));

	ExitPoint = CreateDefaultSubobject<USceneComponent>(TEXT("ExitPoint"));
	ExitPoint->SetupAttachment(RootComponent);
	ExitPoint->SetRelativeLocation(FVector(120.0f, 0.0f, 0.0f));

	bIsOccupied = false;
	CurrentHider = nullptr;
}

void AHidingSpotActor::BeginPlay()
{
	Super::BeginPlay();
}

FText AHidingSpotActor::GetInteractionPrompt()
{
	if (bIsOccupied)
	{
		return NSLOCTEXT("Ayas", "ExitHidePrompt", "Press [E] to step out of hiding");
	}
	return NSLOCTEXT("Ayas", "EnterHidePrompt", "Press [E] to hide inside");
}

bool AHidingSpotActor::CanInteract(AActor* Interactor)
{
	if (!bIsOccupied) return true;
	return Interactor == CurrentHider;
}

void AHidingSpotActor::OnInteract(AActor* Interactor)
{
	AAyasCharacter* Character = Cast<AAyasCharacter>(Interactor);
	if (!Character) return;

	if (!bIsOccupied)
	{
		bIsOccupied = true;
		CurrentHider = Character;
		Character->SetActorLocation(InteriorCameraPoint->GetComponentLocation());
		Character->SetHidingState(true);
	}
	else if (Character == CurrentHider)
	{
		bIsOccupied = false;
		CurrentHider = nullptr;
		Character->SetActorLocation(ExitPoint->GetComponentLocation());
		Character->SetHidingState(false);
	}
}
