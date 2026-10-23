#include "YakshiCharacter.h"
#include "Components/AudioComponent.h"
#include "Components/SphereComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Kismet/GameplayStatics.h"
#include "AyasTheLastWard/Character/AyasCharacter.h"
#include "AyasTheLastWard/Core/AyasGameMode.h"
#include "AyasTheLastWard/Items/AyasDetectorComponent.h"

AYakshiCharacter::AYakshiCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	StalkSpeed = 220.0f;
	HuntSpeed = 540.0f;
	RetreatSpeed = 680.0f;

	GetCharacterMovement()->MaxWalkSpeed = StalkSpeed;
	GetCharacterMovement()->bOrientRotationToMovement = true;

	AnkletAudioComponent = CreateDefaultSubobject<UAudioComponent>(TEXT("AnkletAudioComponent"));
	AnkletAudioComponent->SetupAttachment(RootComponent);
	AnkletAudioComponent->bAutoActivate = false;

	VoiceLureAudioComponent = CreateDefaultSubobject<UAudioComponent>(TEXT("VoiceLureAudioComponent"));
	VoiceLureAudioComponent->SetupAttachment(RootComponent);
	VoiceLureAudioComponent->bAutoActivate = false;

	AttackReachSphere = CreateDefaultSubobject<USphereComponent>(TEXT("AttackReachSphere"));
	AttackReachSphere->InitSphereRadius(120.0f);
	AttackReachSphere->SetupAttachment(RootComponent);
	AttackReachSphere->SetCollisionProfileName(TEXT("OverlapAllDynamic"));

	CurrentState = EYakshiState::Dormant;
	StateTimer = 0.0f;
}

void AYakshiCharacter::BeginPlay()
{
	Super::BeginPlay();
	AttackReachSphere->OnComponentBeginOverlap.AddDynamic(this, &AYakshiCharacter::OnAttackReachOverlap);
}

void AYakshiCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
	StateTimer += DeltaTime;

	// Dynamic footstep anklets when moving
	if (GetVelocity().Size2D() > 10.0f && !AnkletAudioComponent->IsPlaying())
	{
		if (AnkletChimeSound)
		{
			AnkletAudioComponent->SetSound(AnkletChimeSound);
			AnkletAudioComponent->Play();
		}
	}
}

void AYakshiCharacter::TransitionToState(EYakshiState NewState)
{
	if (CurrentState == NewState) return;

	CurrentState = NewState;
	StateTimer = 0.0f;

	switch (CurrentState)
	{
	case EYakshiState::Dormant:
		GetCharacterMovement()->MaxWalkSpeed = 0.0f;
		SetActorHiddenInGame(true);
		break;

	case EYakshiState::Stalking:
		SetActorHiddenInGame(false);
		GetCharacterMovement()->MaxWalkSpeed = StalkSpeed;
		break;

	case EYakshiState::Luring:
		GetCharacterMovement()->MaxWalkSpeed = 0.0f;
		break;

	case EYakshiState::Investigating:
		GetCharacterMovement()->MaxWalkSpeed = StalkSpeed * 1.2f;
		break;

	case EYakshiState::Hunting:
		GetCharacterMovement()->MaxWalkSpeed = HuntSpeed;
		break;

	case EYakshiState::Attack:
		GetCharacterMovement()->MaxWalkSpeed = 0.0f;
		break;

	case EYakshiState::Disrupted:
		GetCharacterMovement()->MaxWalkSpeed = RetreatSpeed;
		if (ScreamDisruptedSound)
		{
			UGameplayStatics::PlaySoundAtLocation(this, ScreamDisruptedSound, GetActorLocation(), 1.0f);
		}
		break;

	case EYakshiState::Searching:
		GetCharacterMovement()->MaxWalkSpeed = StalkSpeed * 0.9f;
		break;

	case EYakshiState::Repositioning:
		GetCharacterMovement()->MaxWalkSpeed = RetreatSpeed;
		break;
	}

	OnStateChanged.Broadcast(CurrentState);
}

void AYakshiCharacter::PlayLureVoice(const FVector& ProjectedSoundLocation)
{
	if (WhisperLureSound || DistantCallSound)
	{
		USoundBase* Sound = FMath::RandBool() ? WhisperLureSound : DistantCallSound;
		if (Sound)
		{
			UGameplayStatics::PlaySoundAtLocation(this, Sound, ProjectedSoundLocation, 1.0f);
		}
	}

	// Register with player's Ayas detector voice authenticity analyzer
	AActor* PlayerPawn = UGameplayStatics::GetPlayerPawn(this, 0);
	if (PlayerPawn)
	{
		UAyasDetectorComponent* Detector = PlayerPawn->FindComponentByClass<UAyasDetectorComponent>();
		if (Detector)
		{
			Detector->RegisterVoiceLureEvent(0.85f);
		}
	}
}

void AYakshiCharacter::DisruptEntity(const FVector& RepelSourceLocation)
{
	TransitionToState(EYakshiState::Disrupted);
	FVector AwayDir = (GetActorLocation() - RepelSourceLocation).GetSafeNormal2D();
	DisruptionRepelTarget = GetActorLocation() + (AwayDir * 1800.0f);
}

void AYakshiCharacter::ExecuteAttack(AActor* Victim)
{
	if (CurrentState == EYakshiState::Attack) return;

	TransitionToState(EYakshiState::Attack);

	if (AttackStingerSound)
	{
		UGameplayStatics::PlaySound2D(this, AttackStingerSound);
	}

	AAyasGameMode* GM = Cast<AAyasGameMode>(UGameplayStatics::GetGameMode(this));
	if (GM)
	{
		GM->OnPlayerKilledByYakshi();
	}
}

bool AYakshiCharacter::IsInProtectedZone() const
{
	return false;
}

void AYakshiCharacter::OnAttackReachOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
                                          UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
                                          bool bFromSweep, const FHitResult& SweepResult)
{
	AAyasCharacter* PlayerChar = Cast<AAyasCharacter>(OtherActor);
	if (PlayerChar && CurrentState == EYakshiState::Hunting)
	{
		ExecuteAttack(PlayerChar);
	}
}
