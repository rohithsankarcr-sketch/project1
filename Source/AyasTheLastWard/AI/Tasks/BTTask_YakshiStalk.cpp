#include "BTTask_YakshiStalk.h"
#include "AIController.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "Kismet/GameplayStatics.h"
#include "NavigationSystem.h"
#include "AyasTheLastWard/AI/YakshiBlackboardKeys.h"

UBTTask_YakshiStalk::UBTTask_YakshiStalk()
{
	NodeName = TEXT("Yakshi Stalk Player");
}

EBTNodeResult::Type UBTTask_YakshiStalk::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AICon = OwnerComp.GetAIOwner();
	if (!AICon) return EBTNodeResult::Failed;

	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(AICon, 0);
	if (!PlayerPawn) return EBTNodeResult::Failed;

	// Pick a stalking position at flank/rear of player (approx 12-18 meters away)
	FVector PlayerLoc = PlayerPawn->GetActorLocation();
	FVector PlayerBack = -PlayerPawn->GetActorForwardVector();
	FVector StalkTarget = PlayerLoc + (PlayerBack * 1400.0f) + (FMath::VRand() * 400.0f);
	StalkTarget.Z = PlayerLoc.Z;

	UNavigationSystemV1* NavSys = FNavigationSystem::GetCurrent<UNavigationSystemV1>(AICon->GetWorld());
	FNavLocation NavLoc;
	if (NavSys && NavSys->GetRandomPointInNavigableRadius(StalkTarget, 500.0f, NavLoc))
	{
		AICon->GetBlackboardComponent()->SetValueAsVector(YakshiBlackboardKeys::StalkDestination, NavLoc.Location);
		AICon->MoveToLocation(NavLoc.Location, 60.0f);
		return EBTNodeResult::Succeeded;
	}

	return EBTNodeResult::Failed;
}
