#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_YakshiHunt.generated.h"

UCLASS()
class AYASTHELASTWARD_API UBTTask_YakshiHunt : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_YakshiHunt();

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;
};
