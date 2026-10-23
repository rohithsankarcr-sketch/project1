#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "AyasHorrorAudioManager.generated.h"

UENUM(BlueprintType)
enum class EAudioTensionState : uint8
{
	Exploration UMETA(DisplayName = "Exploration Ambient"),
	Stalking    UMETA(DisplayName = "Stalking Tension"),
	Hunting     UMETA(DisplayName = "Hunting Chase"),
	WardFailure UMETA(DisplayName = "Ward Failure"),
	SafeZone    UMETA(DisplayName = "Safe Zone Respite"),
	FinalEscape UMETA(DisplayName = "Final Escape")
};

class UAudioComponent;
class USoundBase;

UCLASS()
class AYASTHELASTWARD_API AAyasHorrorAudioManager : public AActor
{
	GENERATED_BODY()

public:
	AAyasHorrorAudioManager();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAudioComponent* RainLoopComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAudioComponent* CricketsLoopComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAudioComponent* WindLoopComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAudioComponent* TensionDroneComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Ayas|Audio")
	EAudioTensionState CurrentTensionState;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Audio")
	USoundBase* DistantThunderSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Audio")
	USoundBase* WardBreakStinger;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Audio")
	void SetTensionState(EAudioTensionState NewState);

	UFUNCTION(BlueprintCallable, Category = "Ayas|Audio")
	void PlayDistantThunder();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Audio")
	void TriggerWardFailureAudio();

	virtual void Tick(float DeltaTime) override;

protected:
	virtual void BeginPlay() override;

private:
	float ThunderTimer;
	float TargetTensionVolume;
	float TargetRainVolume;
};
