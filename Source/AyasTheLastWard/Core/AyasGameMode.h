#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "AyasSaveGame.h"
#include "AyasGameMode.generated.h"

class UAyasObjectiveManager;
class AAyasCharacter;

UCLASS()
class AYASTHELASTWARD_API AAyasGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	AAyasGameMode();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Objectives")
	UAyasObjectiveManager* ObjectiveManager;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Gameplay")
	void OnPlayerKilledByYakshi();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Gameplay")
	void OnPlayerEscapedSuccessfully();

	UFUNCTION(BlueprintCallable, Category = "Ayas|SaveSystem")
	void TriggerCheckpointSave();

	UFUNCTION(BlueprintCallable, Category = "Ayas|SaveSystem")
	void LoadCheckpoint();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Gameplay")
	void RestartCurrentMission();

protected:
	virtual void BeginPlay() override;
};
