#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "AyasPlayerController.generated.h"

class UAyasMainHUDWidget;
class UAyasPauseMenuWidget;
class UAyasDeathWinWidget;

UCLASS()
class AYASTHELASTWARD_API AAyasPlayerController : public APlayerController
{
	GENERATED_BODY()

public:
	AAyasPlayerController();

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|UI")
	TSubclassOf<UUserWidget> MainHUDWidgetClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|UI")
	TSubclassOf<UUserWidget> PauseMenuWidgetClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|UI")
	TSubclassOf<UUserWidget> JournalWidgetClass;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|UI")
	TSubclassOf<UUserWidget> DeathWinWidgetClass;

	UFUNCTION(BlueprintCallable, Category = "Ayas|UI")
	void TogglePauseMenu();

	UFUNCTION(BlueprintCallable, Category = "Ayas|UI")
	void ToggleJournalScreen();

	UFUNCTION(BlueprintCallable, Category = "Ayas|UI")
	void ShowDeathScreen(const FText& DeathReason);

	UFUNCTION(BlueprintCallable, Category = "Ayas|UI")
	void ShowVictoryScreen();

protected:
	virtual void BeginPlay() override;

private:
	UPROPERTY()
	UUserWidget* MainHUDInstance;

	UPROPERTY()
	UUserWidget* PauseMenuInstance;

	UPROPERTY()
	UUserWidget* JournalInstance;

	UPROPERTY()
	UUserWidget* DeathWinInstance;

	bool bIsPauseMenuOpen;
	bool bIsJournalOpen;
};
