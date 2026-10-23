#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Components/AyasStaminaComponent.h"
#include "Components/AyasFlashlightComponent.h"
#include "Components/AyasInteractionComponent.h"
#include "AyasCharacter.generated.h"

class UCameraComponent;
class USpotLightComponent;
class UAyasDetectorComponent;
class UAyasInventoryComponent;
class USoundBase;

UCLASS()
class AYASTHELASTWARD_API AAyasCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	AAyasCharacter();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Camera")
	UCameraComponent* FirstPersonCameraComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USpotLightComponent* FlashlightComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAyasStaminaComponent* StaminaComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAyasFlashlightComponent* FlashlightLogicComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAyasInteractionComponent* InteractionComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAyasDetectorComponent* DetectorComponent;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UAyasInventoryComponent* InventoryComponent;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float WalkSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float SprintSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float CrouchSpeed;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "State")
	bool bIsSprinting;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "State")
	bool bIsHiding;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "State")
	bool bIsDetectorEquipped;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Audio|Footsteps")
	USoundBase* FootstepMudSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Audio|Footsteps")
	USoundBase* FootstepStoneSound;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Audio|Footsteps")
	USoundBase* FootstepWoodSound;

	UFUNCTION(BlueprintCallable, Category = "Ayas|Movement")
	void StartSprinting();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Movement")
	void StopSprinting();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Movement")
	void ToggleCrouchState();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Detector")
	void ToggleDetectorEquipped();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Detector")
	void CalibrateDetector();

	UFUNCTION(BlueprintCallable, Category = "Ayas|Hiding")
	void SetHidingState(bool bHiding);

	UFUNCTION(BlueprintPure, Category = "Ayas|Stealth")
	float GetStealthVisibilityFactor() const;

	UFUNCTION(BlueprintPure, Category = "Ayas|Stealth")
	float GetMovementNoiseLoudness() const;

	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;
	virtual void Tick(float DeltaTime) override;

protected:
	virtual void BeginPlay() override;

	void MoveForward(float Value);
	void MoveRight(float Value);
	void TurnAtRate(float Rate);
	void LookUpAtRate(float Rate);

	void OnInteractPressed();
	void OnFlashlightPressed();
	void OnDetectorUsePressed();
	void OnJournalPressed();
	void OnPausePressed();

	void UpdateHeadBob(float DeltaTime);
	void CheckFootstepTrace(float DeltaTime);

private:
	float HeadBobTimer;
	float FootstepDistanceTraveled;
	FVector PreviousLocation;
};
