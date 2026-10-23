#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "AyasInventoryComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE(FOnInventoryUpdated);

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class AYASTHELASTWARD_API UAyasInventoryComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UAyasInventoryComponent();

	UPROPERTY(BlueprintAssignable, Category = "Ayas|Inventory")
	FOnInventoryUpdated OnInventoryUpdated;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Inventory")
	int32 SacredAshCount;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Inventory")
	int32 IronConnectorsCount;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Inventory")
	int32 GroundingFusesCount;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Inventory")
	TArray<FString> CollectedEvidence;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Inventory")
	bool ConsumeSacredAsh();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Inventory")
	void AddSacredAsh(int32 Amount);

	UFUNCTION(BlueprintCallable, Category = "Ayas|Inventory")
	bool ConsumeIronConnector();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Inventory")
	void AddEvidence(const FString& EvidenceID);

	UFUNCTION(BlueprintPure, Category = "Ayas|Inventory")
	bool HasEvidence(const FString& EvidenceID) const;
};
