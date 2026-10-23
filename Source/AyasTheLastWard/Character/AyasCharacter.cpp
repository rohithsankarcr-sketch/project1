#include "AyasCharacter.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/SpotLightComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "AyasPlayerController.h"
#include "AyasTheLastWard/Items/AyasDetectorComponent.h"
#include "AyasTheLastWard/Items/AyasInventoryComponent.h"
#include "Kismet/GameplayStatics.h"
#include "PhysicalMaterials/PhysicalMaterial.h"

AAyasCharacter::AAyasCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	GetCapsuleComponent()->InitCapsuleSize(42.0f, 96.0f);

	FirstPersonCameraComponent = CreateDefaultSubobject<UCameraComponent>(TEXT("FirstPersonCamera"));
	FirstPersonCameraComponent->SetupAttachment(GetCapsuleComponent());
	FirstPersonCameraComponent->SetRelativeLocation(FVector(0.0f, 0.0f, 64.0f));
	FirstPersonCameraComponent->bUsePawnControlRotation = true;

	FlashlightComponent = CreateDefaultSubobject<USpotLightComponent>(TEXT("FlashlightComponent"));
	FlashlightComponent->SetupAttachment(FirstPersonCameraComponent);
	FlashlightComponent->SetRelativeLocation(FVector(10.0f, 15.0f, -10.0f));
	FlashlightComponent->Intensity = 6500.0f;
	FlashlightComponent->InnerConeAngle = 18.0f;
	FlashlightComponent->OuterConeAngle = 36.0f;
	FlashlightComponent->AttenuationRadius = 2500.0f;

	StaminaComponent = CreateDefaultSubobject<UAyasStaminaComponent>(TEXT("StaminaComponent"));
	FlashlightLogicComponent = CreateDefaultSubobject<UAyasFlashlightComponent>(TEXT("FlashlightLogicComponent"));
	InteractionComponent = CreateDefaultSubobject<UAyasInteractionComponent>(TEXT("InteractionComponent"));
	DetectorComponent = CreateDefaultSubobject<UAyasDetectorComponent>(TEXT("DetectorComponent"));
	InventoryComponent = CreateDefaultSubobject<UAyasInventoryComponent>(TEXT("InventoryComponent"));

	WalkSpeed = 380.0f;
	SprintSpeed = 620.0f;
	CrouchSpeed = 190.0f;

	GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
	GetCharacterMovement()->NavAgentProps.bCanCrouch = true;
	GetCharacterMovement()->MaxWalkSpeedCrouched = CrouchSpeed;

	bIsSprinting = false;
	bIsHiding = false;
	bIsDetectorEquipped = true;
	HeadBobTimer = 0.0f;
	FootstepDistanceTraveled = 0.0f;
}

void AAyasCharacter::BeginPlay()
{
	Super::BeginPlay();
	PreviousLocation = GetActorLocation();
}

void AAyasCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Stamina consumption while sprinting
	if (bIsSprinting && GetVelocity().Size2D() > 10.0f)
	{
		bool bHasStamina = StaminaComponent->ConsumeStamina(DeltaTime);
		if (!bHasStamina)
		{
			StopSprinting();
		}
	}
	else
	{
		bool bStationary = GetVelocity().Size2D() < 5.0f;
		StaminaComponent->RestoreStamina(DeltaTime, bStationary);
	}

	UpdateHeadBob(DeltaTime);
	CheckFootstepTrace(DeltaTime);
}

void AAyasCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	PlayerInputComponent->BindAxis("MoveForward", this, &AAyasCharacter::MoveForward);
	PlayerInputComponent->BindAxis("MoveRight", this, &AAyasCharacter::MoveRight);
	PlayerInputComponent->BindAxis("Turn", this, &AAyasCharacter::TurnAtRate);
	PlayerInputComponent->BindAxis("LookUp", this, &AAyasCharacter::LookUpAtRate);

	PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
	PlayerInputComponent->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);

	PlayerInputComponent->BindAction("Sprint", IE_Pressed, this, &AAyasCharacter::StartSprinting);
	PlayerInputComponent->BindAction("Sprint", IE_Released, this, &AAyasCharacter::StopSprinting);

	PlayerInputComponent->BindAction("Crouch", IE_Pressed, this, &AAyasCharacter::ToggleCrouchState);

	PlayerInputComponent->BindAction("Interact", IE_Pressed, this, &AAyasCharacter::OnInteractPressed);
	PlayerInputComponent->BindAction("ToggleFlashlight", IE_Pressed, this, &AAyasCharacter::OnFlashlightPressed);
	PlayerInputComponent->BindAction("ToggleDetector", IE_Pressed, this, &AAyasCharacter::ToggleDetectorEquipped);
	PlayerInputComponent->BindAction("UseDetector", IE_Pressed, this, &AAyasCharacter::OnDetectorUsePressed);
	PlayerInputComponent->BindAction("CalibrateDetector", IE_Pressed, this, &AAyasCharacter::CalibrateDetector);

	PlayerInputComponent->BindAction("OpenJournal", IE_Pressed, this, &AAyasCharacter::OnJournalPressed);
	PlayerInputComponent->BindAction("PauseMenu", IE_Pressed, this, &AAyasCharacter::OnPausePressed);
}

void AAyasCharacter::MoveForward(float Value)
{
	if (Value != 0.0f && !bIsHiding)
	{
		AddMovementInput(GetActorForwardVector(), Value);
	}
}

void AAyasCharacter::MoveRight(float Value)
{
	if (Value != 0.0f && !bIsHiding)
	{
		AddMovementInput(GetActorRightVector(), Value);
	}
}

void AAyasCharacter::TurnAtRate(float Rate)
{
	AddControllerYawInput(Rate);
}

void AAyasCharacter::LookUpAtRate(float Rate)
{
	AddControllerPitchInput(Rate);
}

void AAyasCharacter::StartSprinting()
{
	if (!bIsCrouched && !StaminaComponent->bIsExhausted && !bIsHiding)
	{
		bIsSprinting = true;
		GetCharacterMovement()->MaxWalkSpeed = SprintSpeed;
	}
}

void AAyasCharacter::StopSprinting()
{
	bIsSprinting = false;
	GetCharacterMovement()->MaxWalkSpeed = bIsCrouched ? CrouchSpeed : WalkSpeed;
}

void AAyasCharacter::ToggleCrouchState()
{
	if (bIsCrouched)
	{
		UnCrouch();
		GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
	}
	else
	{
		Crouch();
		StopSprinting();
		GetCharacterMovement()->MaxWalkSpeed = CrouchSpeed;
	}
}

void AAyasCharacter::ToggleDetectorEquipped()
{
	bIsDetectorEquipped = !bIsDetectorEquipped;
	if (DetectorComponent)
	{
		DetectorComponent->SetDetectorEquipped(bIsDetectorEquipped);
	}
}

void AAyasCharacter::CalibrateDetector()
{
	if (DetectorComponent && GetVelocity().Size2D() < 10.0f)
	{
		DetectorComponent->Calibrate();
	}
}

void AAyasCharacter::OnInteractPressed()
{
	if (InteractionComponent)
	{
		InteractionComponent->Interact();
	}
}

void AAyasCharacter::OnFlashlightPressed()
{
	if (FlashlightLogicComponent)
	{
		FlashlightLogicComponent->ToggleFlashlight();
	}
}

void AAyasCharacter::OnDetectorUsePressed()
{
	if (DetectorComponent && bIsDetectorEquipped)
	{
		DetectorComponent->PerformActivePing();
	}
}

void AAyasCharacter::OnJournalPressed()
{
	AAyasPlayerController* PC = Cast<AAyasPlayerController>(GetController());
	if (PC)
	{
		PC->ToggleJournalScreen();
	}
}

void AAyasCharacter::OnPausePressed()
{
	AAyasPlayerController* PC = Cast<AAyasPlayerController>(GetController());
	if (PC)
	{
		PC->TogglePauseMenu();
	}
}

void AAyasCharacter::SetHidingState(bool bHiding)
{
	bIsHiding = bHiding;
	GetCharacterMovement()->SetMovementMode(bHiding ? MOVE_None : MOVE_Walking);
}

float AAyasCharacter::GetStealthVisibilityFactor() const
{
	if (bIsHiding) return 0.05f;
	float Factor = 1.0f;
	if (bIsCrouched) Factor *= 0.45f;
	if (FlashlightLogicComponent && FlashlightLogicComponent->bIsTurnedOn) Factor *= 2.2f;
	return Factor;
}

float AAyasCharacter::GetMovementNoiseLoudness() const
{
	if (bIsHiding) return 0.0f;
	if (GetVelocity().Size2D() < 10.0f) return 0.0f;
	if (bIsCrouched) return 0.2f;
	if (bIsSprinting) return 1.0f;
	return 0.5f;
}

void AAyasCharacter::UpdateHeadBob(float DeltaTime)
{
	float Speed = GetVelocity().Size2D();
	if (Speed > 10.0f && !bIsHiding)
	{
		float Frequency = bIsSprinting ? 12.0f : 8.0f;
		float Amplitude = bIsSprinting ? 2.5f : 1.2f;
		HeadBobTimer += DeltaTime * Frequency;
		float BobOffset = FMath::Sin(HeadBobTimer) * Amplitude;
		FirstPersonCameraComponent->SetRelativeLocation(FVector(0.0f, 0.0f, 64.0f + BobOffset));
	}
	else
	{
		HeadBobTimer = 0.0f;
		FVector CurrentLoc = FirstPersonCameraComponent->GetRelativeLocation();
		FirstPersonCameraComponent->SetRelativeLocation(FMath::VInterpTo(CurrentLoc, FVector(0.0f, 0.0f, 64.0f), DeltaTime, 8.0f));
	}
}

void AAyasCharacter::CheckFootstepTrace(float DeltaTime)
{
	float CurrentDistance = FVector::Dist(GetActorLocation(), PreviousLocation);
	PreviousLocation = GetActorLocation();

	if (GetVelocity().Size2D() > 10.0f)
	{
		FootstepDistanceTraveled += CurrentDistance;
		float StepInterval = bIsSprinting ? 150.0f : 200.0f;
		if (bIsCrouched) StepInterval = 240.0f;

		if (FootstepDistanceTraveled >= StepInterval)
		{
			FootstepDistanceTraveled = 0.0f;

			FHitResult Hit;
			FVector TraceStart = GetActorLocation();
			FVector TraceEnd = TraceStart - FVector(0.0f, 0.0f, 120.0f);
			FCollisionQueryParams Params;
			Params.AddIgnoredActor(this);
			Params.bReturnPhysicalMaterial = true;

			if (GetWorld()->LineTraceSingleByChannel(Hit, TraceStart, TraceEnd, ECC_Visibility, Params))
			{
				USoundBase* SoundToPlay = FootstepMudSound;
				if (Hit.PhysMaterial.IsValid())
				{
					FString MatName = Hit.PhysMaterial->GetName();
					if (MatName.Contains(TEXT("Stone")) || MatName.Contains(TEXT("Laterite")))
					{
						SoundToPlay = FootstepStoneSound;
					}
					else if (MatName.Contains(TEXT("Wood")))
					{
						SoundToPlay = FootstepWoodSound;
					}
				}

				if (SoundToPlay)
				{
					float Volume = bIsCrouched ? 0.25f : (bIsSprinting ? 0.9f : 0.5f);
					UGameplayStatics::PlaySoundAtLocation(this, SoundToPlay, Hit.ImpactPoint, Volume);
				}
			}
		}
	}
}
