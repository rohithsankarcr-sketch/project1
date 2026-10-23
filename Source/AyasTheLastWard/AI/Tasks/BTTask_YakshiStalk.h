#pragma once

#include "CoreMinimal.h"
#include "BehaviorTree/BTTaskNode.h"
#include "BTTask_YakshiStalk.generated.h"

UCLASS()
class AYASTHELASTWARD_API UBTTask_YakshiStalk : public UBTTaskNode
{
	GENERATED_BODY()

public:
	UBTTask_YakshiStalk();

	virtual EBTNodeResult::Type ExecuteTask(UBehaviorTreeComponent& OwnerComp, uint8* NodeMemory) override;
};
