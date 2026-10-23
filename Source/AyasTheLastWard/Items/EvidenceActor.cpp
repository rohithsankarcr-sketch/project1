#include "EvidenceActor.h"
#include "Components/StaticMeshComponent.h"
#include "Kismet/GameplayStatics.h"
#include "AyasTheLastWard/Character/AyasCharacter.h"
#include "AyasTheLastWard/Core/AyasGameMode.h"
#include "AyasTheLastWard/Core/AyasObjectiveManager.h"

AEvidenceActor::AEvidenceActor()
{
	PrimaryActorTick.bCanEverTick = false;

	MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("MeshComponent"));
	RootComponent = MeshComponent;
	MeshComponent->SetCollisionProfileName(TEXT("BlockAllDynamic"));

	EvidenceID = TEXT("Evidence_01");
	EvidenceTitle = NSLOCTEXT("Ayas", "Ev1Title", "Researcher's Note: The Pala Anomaly");
	EvidenceContents = NSLOCTEXT("Ayas", "Ev1Desc", "The villagers were not superstitious fools. The conductive iron boundary truly stabilizes the field fluctuations...");
}

FText AEvidenceActor::GetInteractionPrompt()
{
	return FText::Format(NSLOCTEXT("Ayas", "CollectPrompt", "Press [E] to collect {0}"), EvidenceTitle);
}

bool AEvidenceActor::CanInteract(AActor* Interactor)
{
	return Interactor != nullptr;
}

void AEvidenceActor::OnInteract(AActor* Interactor)
{
	AAyasCharacter* Character = Cast<AAyasCharacter>(Interactor);
	if (Character && Character->InventoryComponent)
	{
		Character->InventoryComponent->AddEvidence(EvidenceID);

		AAyasGameMode* GM = Cast<AAyasGameMode>(UGameplayStatics::GetGameMode(this));
		if (GM && GM->ObjectiveManager)
		{
			GM->ObjectiveManager->CollectEvidenceItem(EvidenceID);
		}

		if (PickupSound)
		{
			UGameplayStatics::PlaySound2D(this, PickupSound);
		}

		Destroy();
	}
}
