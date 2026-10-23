#include "WardStationActor.h"
#include "Components/StaticMeshComponent.h"
#include "Particles/ParticleSystemComponent.h"
#include "Components/AudioComponent.h"
#include "Kismet/GameplayStatics.h"
#include "AyasTheLastWard/Core/AyasGameState.h"
#include "AyasTheLastWard/Core/AyasGameMode.h"
#include "AyasTheLastWard/Core/AyasObjectiveManager.h"
#include "AyasTheLastWard/Character/AyasCharacter.h"
#include "AyasTheLastWard/Items/AyasInventoryComponent.h"

AWardStationActor::AWardStationActor()
{
	PrimaryActorTick.bCanEverTick = false;

	WardPostMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("WardPostMesh"));
	RootComponent = WardPostMesh;
	WardPostMesh->SetCollisionProfileName(TEXT("BlockAllDynamic"));

	SparkVFXComponent = CreateDefaultSubobject<UParticleSystemComponent>(TEXT("SparkVFXComponent"));
	SparkVFXComponent->SetupAttachment(WardPostMesh);

	ElectricalHumAudio = CreateDefaultSubobject<UAudioComponent>(TEXT("ElectricalHumAudio"));
	ElectricalHumAudio->SetupAttachment(WardPostMesh);
	ElectricalHumAudio->bAutoActivate = false;

	WardID = TEXT("WardA");
	WardDisplayName = NSLOCTEXT("Ayas", "WardAName", "Ward Station A: Village Path");
	CurrentState = EWardState::Disconnected;
	RepairHoldDuration = 3.0f;
}

void AWardStationActor::BeginPlay()
{
	Super::BeginPlay();
	UpdateVisualAndAudioState();
}

void AWardStationActor::SetStationState(EWardState NewState)
{
	CurrentState = NewState;
	UpdateVisualAndAudioState();

	AAyasGameState* GS = Cast<AAyasGameState>(UGameplayStatics::GetGameState(this));
	if (GS)
	{
		GS->SetWardState(WardID, CurrentState);
	}

	OnWardStateChanged.Broadcast(WardID, CurrentState);
}

FText AWardStationActor::GetInteractionPrompt()
{
	if (CurrentState == EWardState::Intact || CurrentState == EWardState::Repaired)
	{
		return FText::Format(NSLOCTEXT("Ayas", "WardIntactPrompt", "{0} - Circuit Intact"), WardDisplayName);
	}
	return FText::Format(NSLOCTEXT("Ayas", "RepairWardPrompt", "Hold [E] to splice circuit at {0}"), WardDisplayName);
}

bool AWardStationActor::CanInteract(AActor* Interactor)
{
	return (CurrentState != EWardState::Intact && CurrentState != EWardState::Repaired);
}

void AWardStationActor::OnInteract(AActor* Interactor)
{
	if (CanInteract(Interactor))
	{
		SetStationState(EWardState::Repaired);

		if (RepairCompleteSound)
		{
			UGameplayStatics::PlaySoundAtLocation(this, RepairCompleteSound, GetActorLocation());
		}

		// Objective hook
		AAyasGameMode* GM = Cast<AAyasGameMode>(UGameplayStatics::GetGameMode(this));
		if (GM && GM->ObjectiveManager)
		{
			int32 ObjIdx = GM->ObjectiveManager->CurrentObjectiveIndex;
			if (WardID == TEXT("WardA") && ObjIdx == 3) // Obj 4 (0-based 3)
			{
				GM->ObjectiveManager->CompleteCurrentObjective();
				GM->TriggerCheckpointSave();
			}
			else if (WardID == TEXT("WardB") && ObjIdx == 4) // Obj 5 (0-based 4)
			{
				GM->ObjectiveManager->CompleteCurrentObjective();
				GM->TriggerCheckpointSave();
			}
			else if (WardID == TEXT("WardC") && ObjIdx == 6) // Obj 7 (0-based 6)
			{
				GM->ObjectiveManager->CompleteCurrentObjective();
				GM->TriggerCheckpointSave();
			}
		}
	}
}

void AWardStationActor::UpdateVisualAndAudioState()
{
	bool bIsActive = (CurrentState == EWardState::Intact || CurrentState == EWardState::Repaired);

	if (SparkVFXComponent)
	{
		SparkVFXComponent->SetVisibility(!bIsActive);
	}

	if (ElectricalHumAudio)
	{
		if (bIsActive)
		{
			if (!ElectricalHumAudio->IsPlaying())
			{
				ElectricalHumAudio->Play();
			}
		}
		else
		{
			ElectricalHumAudio->Stop();
		}
	}
}
