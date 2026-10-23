#include "AyasPlayerController.h"
#include "Blueprint/UserWidget.h"
#include "Kismet/GameplayStatics.h"

AAyasPlayerController::AAyasPlayerController()
{
	bIsPauseMenuOpen = false;
	bIsJournalOpen = false;
}

void AAyasPlayerController::BeginPlay()
{
	Super::BeginPlay();

	if (MainHUDWidgetClass)
	{
		MainHUDInstance = CreateWidget<UUserWidget>(this, MainHUDWidgetClass);
		if (MainHUDInstance)
		{
			MainHUDInstance->AddToViewport(0);
		}
	}

	FInputModeGameOnly InputMode;
	SetInputMode(InputMode);
	bShowMouseCursor = false;
}

void AAyasPlayerController::TogglePauseMenu()
{
	if (bIsPauseMenuOpen)
	{
		if (PauseMenuInstance)
		{
			PauseMenuInstance->RemoveFromParent();
		}
		bIsPauseMenuOpen = false;
		UGameplayStatics::SetGamePaused(this, false);

		FInputModeGameOnly InputMode;
		SetInputMode(InputMode);
		bShowMouseCursor = false;
	}
	else
	{
		if (PauseMenuWidgetClass)
		{
			if (!PauseMenuInstance)
			{
				PauseMenuInstance = CreateWidget<UUserWidget>(this, PauseMenuWidgetClass);
			}
			if (PauseMenuInstance)
			{
				PauseMenuInstance->AddToViewport(100);
				bIsPauseMenuOpen = true;
				UGameplayStatics::SetGamePaused(this, true);

				FInputModeGameAndUI InputMode;
				InputMode.SetWidgetToFocus(PauseMenuInstance->TakeWidget());
				SetInputMode(InputMode);
				bShowMouseCursor = true;
			}
		}
	}
}

void AAyasPlayerController::ToggleJournalScreen()
{
	if (bIsPauseMenuOpen) return;

	if (bIsJournalOpen)
	{
		if (JournalInstance)
		{
			JournalInstance->RemoveFromParent();
		}
		bIsJournalOpen = false;

		FInputModeGameOnly InputMode;
		SetInputMode(InputMode);
		bShowMouseCursor = false;
	}
	else
	{
		if (JournalWidgetClass)
		{
			if (!JournalInstance)
			{
				JournalInstance = CreateWidget<UUserWidget>(this, JournalWidgetClass);
			}
			if (JournalInstance)
			{
				JournalInstance->AddToViewport(50);
				bIsJournalOpen = true;

				FInputModeGameAndUI InputMode;
				InputMode.SetWidgetToFocus(JournalInstance->TakeWidget());
				SetInputMode(InputMode);
				bShowMouseCursor = true;
			}
		}
	}
}

void AAyasPlayerController::ShowDeathScreen(const FText& DeathReason)
{
	if (DeathWinWidgetClass)
	{
		DeathWinInstance = CreateWidget<UUserWidget>(this, DeathWinWidgetClass);
		if (DeathWinInstance)
		{
			DeathWinInstance->AddToViewport(200);

			FInputModeUIOnly InputMode;
			InputMode.SetWidgetToFocus(DeathWinInstance->TakeWidget());
			SetInputMode(InputMode);
			bShowMouseCursor = true;
		}
	}
}

void AAyasPlayerController::ShowVictoryScreen()
{
	if (DeathWinWidgetClass)
	{
		DeathWinInstance = CreateWidget<UUserWidget>(this, DeathWinWidgetClass);
		if (DeathWinInstance)
		{
			DeathWinInstance->AddToViewport(200);

			FInputModeUIOnly InputMode;
			InputMode.SetWidgetToFocus(DeathWinInstance->TakeWidget());
			SetInputMode(InputMode);
			bShowMouseCursor = true;
		}
	}
}
