#include "AyasHorrorAudioManager.h"
#include "Components/AudioComponent.h"
#include "Kismet/GameplayStatics.h"

AAyasHorrorAudioManager::AAyasHorrorAudioManager()
{
	PrimaryActorTick.bCanEverTick = true;

	RainLoopComponent = CreateDefaultSubobject<UAudioComponent>(TEXT("RainLoopComponent"));
	RainLoopComponent->SetupAttachment(RootComponent);
	RainLoopComponent->bAutoActivate = false;

	CricketsLoopComponent = CreateDefaultSubobject<UAudioComponent>(TEXT("CricketsLoopComponent"));
	CricketsLoopComponent->SetupAttachment(RootComponent);
	CricketsLoopComponent->bAutoActivate = false;

	WindLoopComponent = CreateDefaultSubobject<UAudioComponent>(TEXT("WindLoopComponent"));
	WindLoopComponent->SetupAttachment(RootComponent);
	WindLoopComponent->bAutoActivate = false;

	TensionDroneComponent = CreateDefaultSubobject<UAudioComponent>(TEXT("TensionDroneComponent"));
	TensionDroneComponent->SetupAttachment(RootComponent);
	TensionDroneComponent->bAutoActivate = false;

	CurrentTensionState = EAudioTensionState::Exploration;
	ThunderTimer = 25.0f;
	TargetTensionVolume = 0.0f;
	TargetRainVolume = 0.7f;
}

void AAyasHorrorAudioManager::BeginPlay()
{
	Super::BeginPlay();

	if (RainLoopComponent) RainLoopComponent->Play();
	if (CricketsLoopComponent) CricketsLoopComponent->Play();
	if (WindLoopComponent) WindLoopComponent->Play();
	if (TensionDroneComponent) TensionDroneComponent->Play();

	SetTensionState(EAudioTensionState::Exploration);
}

void AAyasHorrorAudioManager::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// Periodic distant thunder
	ThunderTimer -= DeltaTime;
	if (ThunderTimer <= 0.0f)
	{
		ThunderTimer = FMath::FRandRange(35.0f, 75.0f);
		PlayDistantThunder();
	}

	// Smoothly interpolate volume layers
	if (TensionDroneComponent)
	{
		float CurVol = TensionDroneComponent->VolumeMultiplier;
		TensionDroneComponent->SetVolumeMultiplier(FMath::FInterpTo(CurVol, TargetTensionVolume, DeltaTime, 1.5f));
	}
	if (RainLoopComponent)
	{
		float CurRain = RainLoopComponent->VolumeMultiplier;
		RainLoopComponent->SetVolumeMultiplier(FMath::FInterpTo(CurRain, TargetRainVolume, DeltaTime, 1.0f));
	}
}

void AAyasHorrorAudioManager::SetTensionState(EAudioTensionState NewState)
{
	CurrentTensionState = NewState;

	switch (CurrentTensionState)
	{
	case EAudioTensionState::Exploration:
		TargetTensionVolume = 0.0f;
		TargetRainVolume = 0.7f;
		if (CricketsLoopComponent) CricketsLoopComponent->SetVolumeMultiplier(0.6f);
		break;

	case EAudioTensionState::Stalking:
		TargetTensionVolume = 0.45f;
		TargetRainVolume = 0.5f;
		// Crickets quiet down when an entity stalks
		if (CricketsLoopComponent) CricketsLoopComponent->SetVolumeMultiplier(0.15f);
		break;

	case EAudioTensionState::Hunting:
		TargetTensionVolume = 0.95f;
		TargetRainVolume = 0.85f;
		if (CricketsLoopComponent) CricketsLoopComponent->SetVolumeMultiplier(0.0f);
		break;

	case EAudioTensionState::WardFailure:
		TargetTensionVolume = 0.7f;
		TriggerWardFailureAudio();
		break;

	case EAudioTensionState::SafeZone:
		TargetTensionVolume = 0.0f;
		TargetRainVolume = 0.4f;
		if (CricketsLoopComponent) CricketsLoopComponent->SetVolumeMultiplier(0.4f);
		break;

	case EAudioTensionState::FinalEscape:
		TargetTensionVolume = 1.0f;
		TargetRainVolume = 1.0f;
		if (CricketsLoopComponent) CricketsLoopComponent->SetVolumeMultiplier(0.0f);
		break;
	}
}

void AAyasHorrorAudioManager::PlayDistantThunder()
{
	if (DistantThunderSound)
	{
		UGameplayStatics::PlaySound2D(this, DistantThunderSound, 0.7f);
	}
}

void AAyasHorrorAudioManager::TriggerWardFailureAudio()
{
	if (WardBreakStinger)
	{
		UGameplayStatics::PlaySound2D(this, WardBreakStinger, 1.0f);
	}
}
