#include "BTTask_YakshiHunt.h"
#include "AIController.h"
#include "BehaviorTree/BlackboardComponent.h"
#include "Kismet/GameplayStatics.h"
#include "AyasTheLastWard/AI/YakshiBlackboardKeys.h"

UBTTask_YakshiHunt::UBTTask_YakshiHunt()
{
	NodeName = TEXT("Yakshi Hunt Player");
}

EBTNodeResult::Type UBTTask_YakshiHunt::ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory)
{
	AAIController* AICon = OwnerComp.GetAIOwner();
	if (!AICon) return EBTNodeResult::Failed;

	APawn* PlayerPawn = UGameplayStatics::GetPlayerPawn(AICon, 0);
	if (!PlayerPawn) return EBTNodeResult::Failed;

	AICon->MoveToActor(PlayerPawn, 40.0f);
	return EBTNodeResult::Succeeded;
}
