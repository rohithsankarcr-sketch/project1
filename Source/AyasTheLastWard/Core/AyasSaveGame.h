#pragma once

#include "CoreMinimal.h"
#include "GameFramework/SaveGame.h"
#include "AyasSaveGame.generated.h"

UENUM(BlueprintType)
enum class EWardState : uint8
{
	Intact       UMETA(DisplayName = "Intact"),
	Damaged      UMETA(DisplayName = "Damaged"),
	Disconnected UMETA(DisplayName = "Disconnected"),
	Repaired     UMETA(DisplayName = "Repaired")
};

UCLASS()
class AYASTHELASTWARD_API UAyasSaveGame : public USaveGame
{
	GENERATED_BODY()

public:
	UAyasSaveGame();

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	FString SaveSlotName;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	uint32 UserIndex;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	FTransform PlayerTransform;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	int32 CurrentObjectiveIndex;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	EWardState WardAState;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	EWardState WardBState;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	EWardState WardCState;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	TArray<FString> CollectedEvidenceIds;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	int32 SacredAshCount;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	float FlashlightBattery;

	UPROPERTY(VisibleAnywhere, Category = "SaveData")
	FDateTime Timestamp;
};
