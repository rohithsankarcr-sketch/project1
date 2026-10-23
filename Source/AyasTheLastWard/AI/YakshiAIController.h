#pragma once

#include "CoreMinimal.h"
#include "AIController.h"
#include "Perception/AIPerceptionTypes.h"
#include "YakshiCharacter.h"
#include "YakshiAIController.generated.h"

class UAIPerceptionComponent;
class UAISenseConfig_Sight;
class UAISenseConfig_Hearing;
class UBehaviorTreeComponent;
class UBlackboardComponent;

UCLASS()
class AYASTHELASTWARD_API AYakshiAIController : public AAIController
{
	GENERATED_BODY()

public:
	AYakshiAIController();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI|Perception")
	UAIPerceptionComponent* AIPerceptionComp;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI|Perception")
	UAISenseConfig_Sight* SightConfig;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI|Perception")
	UAISenseConfig_Hearing* HearingConfig;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI|Behavior")
	UBehaviorTreeComponent* BehaviorTreeComp;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "AI|Behavior")
	UBlackboardComponent* BlackboardComp;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "AI|Config")
	UBehaviorTree* YakshiBehaviorTree;

	UFUNCTION(BlueprintCallable, Category = "AI|Perception")
	void OnPerceptionUpdated(const TArray<AActor*>& UpdatedActors);

	UFUNCTION(BlueprintCallable, Category = "AI|Fairness")
	bool IsActorVisibleToPlayer(AActor* TargetActor) const;

	UFUNCTION(BlueprintCallable, Category = "AI|State")
	void EvaluateAIStateTransitions();

	virtual void Tick(float DeltaTime) override;

protected:
	virtual void OnPossess(APawn* InPawn) override;

private:
	float StateEvaluationTimer;
	float LureCooldownTimer;
	float StalkingDistanceThreshold;
	FVector LastHeardLocation;
	bool bHasPendingNoise;
};
