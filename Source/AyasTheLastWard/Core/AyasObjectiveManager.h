#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AyasObjectiveManager.generated.h"

USTRUCT(BlueprintType)
struct FAyasObjective
{
	GENERATED_BODY()

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	int32 ObjectiveID;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	FText Title;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	FText Description;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	FText HintText;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	bool bIsCompleted;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Objective")
	bool bIsActive;

	FAyasObjective()
		: ObjectiveID(0), bIsCompleted(false), bIsActive(false) {}

	FAyasObjective(int32 InID, const FText& InTitle, const FText& InDesc, const FText& InHint)
		: ObjectiveID(InID), Title(InTitle), Description(InDesc), HintText(InHint), bIsCompleted(false), bIsActive(false) {}
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_TwoParams(FOnObjectiveProgressUpdated, int32, ObjectiveIndex, const FAyasObjective&, Objective);

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class AYASTHELASTWARD_API UAyasObjectiveManager : public UActorComponent
{
	GENERATED_BODY()

public:
	UAyasObjectiveManager();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Objectives")
	FOnObjectiveProgressUpdated OnObjectiveUpdated;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Objectives")
	TArray<FAyasObjective> ObjectivesList;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Objectives")
	int32 CurrentObjectiveIndex;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Objectives")
	int32 EvidenceCollectedCount;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Objectives")
	void InitializeObjectives();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Objectives")
	void CompleteCurrentObjective();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Objectives")
	void CollectEvidenceItem(const FString& EvidenceID);

	UFUNCTION(BlueprintPure, Category = "Ayas|Objectives")
	FAyasObjective GetCurrentObjective() const;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Objectives")
	void SetObjectiveByIndex(int32 TargetIndex);

protected:
	virtual void BeginPlay() override;
};
