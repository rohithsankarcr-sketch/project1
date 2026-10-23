#include "YakshiAIController.h"
#include "Perception/AIPerceptionComponent.h"
#include "Perception/AISenseConfig_Sight.h"
#include "Perception/AISenseConfig_Hearing.h"
#include "BehaviorTree/BehaviorTreeComponent.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "Kismet/GameplayStatics.h"
#include "Camera/CameraComponent.h"
#include "AyasTheLastWard/Character/AyasCharacter.h"
#include "AyasTheLastWard/Core/AyasGameState.h"
#include "YakshiBlackboardKeys.h"

AYakshiAIController::AYakshiAIController()
{
	PrimaryActorTick.bCanEverTick = true;

	BehaviorTreeComp = CreateDefaultSubobject<UBehaviorTreeComponent>(TEXT("BehaviorTreeComp"));
	BlackboardComp = CreateDefaultSubobject<UBlackboardComponent>(TEXT("BlackboardComp"));
	AIPerceptionComp = CreateDefaultSubobject<UAIPerceptionComponent>(TEXT("AIPerceptionComp"));

	SightConfig = CreateDefaultSubobject<UAISenseConfig_Sight>(TEXT("SightConfig"));
	SightConfig->SightRadius = 2400.0f;
	SightConfig->LoseSightRadius = 2800.0f;
	SightConfig->PeripheralVisionAngleDegrees = 75.0f;
	SightConfig->DetectionByAffiliation.bDetectEnemies = true;
	SightConfig->DetectionByAffiliation.bDetectNeutrals = true;
	SightConfig->DetectionByAffiliation.bDetectFriendlies = true;

	HearingConfig = CreateDefaultSubobject<UAISenseConfig_Hearing>(TEXT("HearingConfig"));
	HearingConfig->HearingRange = 3000.0f;
	HearingConfig->DetectionByAffiliation.bDetectEnemies = true;
	HearingConfig->DetectionByAffiliation.bDetectNeutrals = true;
	HearingConfig->DetectionByAffiliation.bDetectFriendlies = true;

	AIPerceptionComp->ConfigureSense(*SightConfig);
	AIPerceptionComp->ConfigureSense(*HearingConfig);
	AIPerceptionComp->SetDominantSense(SightConfig->GetSenseImplementation());

	StateEvaluationTimer = 0.0f;
	LureCooldownTimer = 15.0f;
	StalkingDistanceThreshold = 1800.0f;
	bHasPendingNoise = false;
}

void AYakshiAIController::OnPossess(APawn* InPawn)
{
	Super::OnPossess(InPawn);

	AIPerceptionComp->OnPerceptionUpdated.AddDynamic(this, &AYakshiAIController::OnPerceptionUpdated);

	if (YakshiBehaviorTree && YakshiBehaviorTree->BlackboardAsset)
	{
		BlackboardComp->InitializeBlackboard(*YakshiBehaviorTree->BlackboardAsset);
		BehaviorTreeComp->StartTree(*YakshiBehaviorTree);
	}
}

void AYakshiAIController::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	StateEvaluationTimer += DeltaTime;
	LureCooldownTimer -= DeltaTime;

	if (StateEvaluationTimer >= 0.25f)
	{
		StateEvaluationTimer = 0.0f;
		EvaluateAIStateTransitions();
	}
}

void AYakshiAIController::OnPerceptionUpdated(const TArray<AActor*>& UpdatedActors)
{
	for (AActor* Actor : UpdatedActors)
	{
		AAyasCharacter* Player = Cast<AAyasCharacter>(Actor);
		if (!Player) continue;

		FActorPerceptionBlueprintInfo Info;
		AIPerceptionComp->GetActorsPerception(Actor, Info);

		for (const FAIStimulus& Stimulus : Info.LastSensedStimuli)
		{
			if (Stimulus.Type == UAISense::GetSenseID<UAISense_Sight>())
			{
				if (Stimulus.WasSuccessfullySensed())
				{
					// Fairness: Check stealth factor
					float Visibility = Player->GetStealthVisibilityFactor();
					if (Visibility > 0.1f)
					{
						BlackboardComp->SetValueAsBool(YakshiBlackboardKeys::HasLineOfSight, true);
						BlackboardComp->SetValueAsObject(YakshiBlackboardKeys::TargetPlayer, Player);
						BlackboardComp->SetValueAsVector(YakshiBlackboardKeys::LastKnownPlayerLocation, Player->GetActorLocation());
					}
				}
				else
				{
					BlackboardComp->SetValueAsBool(YakshiBlackboardKeys::HasLineOfSight, false);
				}
			}
			else if (Stimulus.Type == UAISense::GetSenseID<UAISense_Hearing>())
			{
				if (Stimulus.WasSuccessfullySensed())
				{
					LastHeardLocation = Stimulus.StimulusLocation;
					bHasPendingNoise = true;
					BlackboardComp->SetValueAsVector(YakshiBlackboardKeys::InvestigateSource, LastHeardLocation);
				}
			}
		}
	}
}

bool AYakshiAIController::IsActorVisibleToPlayer(AActor* TargetActor) const
{
	APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
	if (!PC || !PC->PlayerCameraManager || !TargetActor) return false;

	FVector CamLoc = PC->PlayerCameraManager->GetCameraLocation();
	FVector CamFwd = PC->PlayerCameraManager->GetCameraRotation().Vector();
	FVector ToTarget = (TargetActor->GetActorLocation() - CamLoc).GetSafeNormal();

	float Dot = FVector::DotProduct(CamFwd, ToTarget);
	if (Dot > 0.5f) // in player 60 degree cone
	{
		FHitResult Hit;
		FCollisionQueryParams Params;
		Params.AddIgnoredActor(TargetActor);
		if (!GetWorld()->LineTraceSingleByChannel(Hit, CamLoc, TargetActor->GetActorLocation(), ECC_Visibility, Params))
		{
			return true; // Unobstructed view
		}
	}
	return false;
}

void AYakshiAIController::EvaluateAIStateTransitions()
{
	AYakshiCharacter* YakshiPawn = Cast<AYakshiCharacter>(GetPawn());
	if (!YakshiPawn) return;

	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (!PlayerPawn) return;

	float DistToPlayer = FVector::Dist(YakshiPawn->GetActorLocation(), PlayerPawn->GetActorLocation());
	BlackboardComp->SetValueAsFloat(YakshiBlackboardKeys::DistanceToPlayer, DistToPlayer);

	bool bHasLOS = BlackboardComp->GetValueAsBool(YakshiBlackboardKeys::HasLineOfSight);
	AAyasCharacter* PlayerChar = Cast<AAyasCharacter>(PlayerPawn);

	// State machine transition logic adhering to the 9 prompt states
	if (YakshiPawn->CurrentState == EYakshiState::Disrupted)
	{
		// Remains disrupted until retreat distance or timer elapsed
		return;
	}

	if (bHasLOS && PlayerChar && !PlayerChar->bIsHiding)
	{
		// Detected in open
		YakshiPawn->TransitionToState(EYakshiState::Hunting);
		MoveToActor(PlayerPawn, 60.0f);
	}
	else if (bHasPendingNoise)
	{
		bHasPendingNoise = false;
		YakshiPawn->TransitionToState(EYakshiState::Investigating);
		MoveToLocation(LastHeardLocation, 80.0f);
	}
	else if (DistToPlayer < StalkingDistanceThreshold)
	{
		if (LureCooldownTimer <= 0.0f && !IsActorVisibleToPlayer(YakshiPawn))
		{
			LureCooldownTimer = FMath::FRandRange(18.0f, 32.0f);
			YakshiPawn->TransitionToState(EYakshiState::Luring);
			FVector LureOffset = FMath::VRand() * 600.0f;
			YakshiPawn->PlayLureVoice(YakshiPawn->GetActorLocation() + LureOffset);
		}
		else
		{
			YakshiPawn->TransitionToState(EYakshiState::Stalking);
		}
	}
	else
	{
		// Too far, reposition fairly out of sight
		if (!IsActorVisibleToPlayer(YakshiPawn))
		{
			YakshiPawn->TransitionToState(EYakshiState::Repositioning);
		}
	}
}
