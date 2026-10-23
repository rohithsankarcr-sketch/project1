#include "AyasGameMode.h"
#include "AyasGameState.h"
#include "AyasObjectiveManager.h"
#include "AyasTheLastWard/Character/AyasCharacter.h"
#include "AyasTheLastWard/Character/AyasPlayerController.h"
#include "AyasTheLastWard/UI/AyasHUD.h"
#include "Kismet/GameplayStatics.h"

AAyasGameMode::AAyasGameMode()
{
	DefaultPawnClass = AAyasCharacter::StaticClass();
	PlayerControllerClass = AAyasPlayerController::StaticClass();
	GameStateClass = AAyasGameState::StaticClass();
	HUDClass = AAyasHUD::StaticClass();

	ObjectiveManager = CreateDefaultSubobject<UAyasObjectiveManager>(TEXT("ObjectiveManager"));
}

void AAyasGameMode::BeginPlay()
{
	Super::BeginPlay();
}

void AAyasGameMode::OnPlayerKilledByYakshi()
{
	AAyasPlayerController* PC = Cast<AAyasPlayerController>(UGameplayStatics::GetPlayerController(this, 0));
	if (PC)
	{
		PC->ShowDeathScreen(NSLOCTEXT("Ayas", "DeathMsg", "The Yakshi's cold grasp claimed you on the Pala Road."));
	}
}

void AAyasGameMode::OnPlayerEscapedSuccessfully()
{
	AAyasPlayerController* PC = Cast<AAyasPlayerController>(UGameplayStatics::GetPlayerController(this, 0));
	if (PC)
	{
		PC->ShowVictoryScreen();
	}
}

void AAyasGameMode::TriggerCheckpointSave()
{
	UAyasSaveGame* SaveInst = Cast<UAyasSaveGame>(UGameplayStatics::CreateSaveGameObject(UAyasSaveGame::StaticClass()));
	if (!SaveInst) return;

	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (PlayerPawn)
	{
		SaveInst->PlayerTransform = PlayerPawn->GetActorTransform();
	}

	if (ObjectiveManager)
	{
		SaveInst->CurrentObjectiveIndex = ObjectiveManager->CurrentObjectiveIndex;
	}

	AAyasGameState* GS = GetGameState<AAyasGameState>();
	if (GS)
	{
		SaveInst->WardAState = GS->WardA_State;
		SaveInst->WardBState = GS->WardB_State;
		SaveInst->WardCState = GS->WardC_State;
	}

	UGameplayStatics::SaveGameToSlot(SaveInst, TEXT("AyasCheckpoint"), 0);
}

void AAyasGameMode::LoadCheckpoint()
{
	if (UGameplayStatics::DoesSaveGameExist(TEXT("AyasCheckpoint"), 0))
	{
		UAyasSaveGame* LoadedGame = Cast<UAyasSaveGame>(UGameplayStatics::LoadGameFromSlot(TEXT("AyasCheckpoint"), 0));
		if (LoadedGame)
		{
			APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
			if (PlayerPawn)
			{
				PlayerPawn->SetActorTransform(LoadedGame->PlayerTransform);
			}

			if (ObjectiveManager)
			{
				ObjectiveManager->SetObjectiveByIndex(LoadedGame->CurrentObjectiveIndex);
			}

			AAyasGameState* GS = GetGameState<AAyasGameState>();
			if (GS)
			{
				GS->SetWardState(FName("WardA"), LoadedGame->WardAState);
				GS->SetWardState(FName("WardB"), LoadedGame->WardBState);
				GS->SetWardState(FName("WardC"), LoadedGame->WardCState);
			}
		}
	}
	else
	{
		RestartCurrentMission();
	}
}

void AAyasGameMode::RestartCurrentMission()
{
	UGameplayStatics::OpenLevel(this, FName(*GetWorld()->GetName()), true);
}
