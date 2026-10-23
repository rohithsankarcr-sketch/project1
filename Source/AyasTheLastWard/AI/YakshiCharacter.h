#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "YakshiCharacter.generated.h"

UENUM(BlueprintType)
enum class EYakshiState : uint8
{
	Dormant       UMETA(DisplayName = "1 - Dormant"),
	Stalking      UMETA(DisplayName = "2 - Stalking"),
	Luring        UMETA(DisplayName = "3 - Luring"),
	Investigating UMETA(DisplayName = "4 - Investigating"),
	Hunting       UMETA(DisplayName = "5 - Hunting"),
	Attack        UMETA(DisplayName = "6 - Attack"),
	Disrupted     UMETA(DisplayName = "7 - Disrupted"),
	Searching     UMETA(DisplayName = "8 - Searching"),
	Repositioning UMETA(DisplayName = "9 - Repositioning")
};

DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnYakshiStateChanged, EYakshiState, NewState);

class UAudioComponent;
class USphereComponent;
class USoundBase;

UCLASS()
class AYASTHELASTWARD_API AYakshiCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AYakshiCharacter();

	UPROPERTY(BlueprintAssignable, Category = "Yakshi|Events")
	FOnYakshiStateChanged OnStateChanged;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAudioComponent* AnkletAudioComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAudioComponent* VoiceLureAudioComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USphereComponent* AttackReachSphere;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Yakshi|State")
	EYakshiState CurrentState;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Movement")
	float StalkSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Movement")
	float HuntSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Movement")
	float RetreatSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Audio")
	USoundBase* AnkletChimeSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Audio")
	USoundBase* WhisperLureSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Audio")
	USoundBase* DistantCallSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Audio")
	USoundBase* ScreamDisruptedSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yakshi|Audio")
	USoundBase* AttackStingerSound;

	UFUNCTION(BlueprintCallable, Category = "Yakshi|State")
	void TransitionToState(EYakshiState NewState);

	UFUNCTION(BlueprintCallable, Category = "Yakshi|Action")
	void PlayLureVoice(const FVector& ProjectedSoundLocation);

	UFUNCTION(BlueprintCallable, Category = "Yakshi|Action")
	void DisruptEntity(const FVector& RepelSourceLocation);

	UFUNCTION(BlueprintCallable, Category = "Yakshi|Action")
	void ExecuteAttack(AActor* Victim);

	UFUNCTION(BlueprintPure, Category = "Yakshi|State")
	bool IsInProtectedZone() const;

	virtual void Tick(float DeltaTime) override;

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnAttackReachOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
	                         UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
	                         bool bFromSweep, const FHitResult& SweepResult);

private:
	float StateTimer;
	FVector DisruptionRepelTarget;
};
