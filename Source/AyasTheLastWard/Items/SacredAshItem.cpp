#include "SacredAshItem.h"
#include "Components/SphereComponent.h"
#include "AyasTheLastWard/AI/YakshiCharacter.h"

ASacredAshItem::ASacredAshItem()
{
	PrimaryActorTick.bCanEverTick = true;

	DurationSeconds = 18.0f; // 18 seconds barrier
	Radius = 350.0f;

	WardRadiusSphere = CreateDefaultSubobject<USphereComponent>(TEXT("WardRadiusSphere"));
	WardRadiusSphere->InitSphereRadius(Radius);
	WardRadiusSphere->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
	RootComponent = WardRadiusSphere;

	RemainingTime = DurationSeconds;
}

void ASacredAshItem::BeginPlay()
{
	Super::BeginPlay();
	WardRadiusSphere->OnComponentBeginOverlap.AddDynamic(this, &ASacredAshItem::OnOverlapBegin);
}

void ASacredAshItem::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	RemainingTime -= DeltaTime;
	if (RemainingTime <= 0.0f)
	{
		Destroy();
	}
}

void ASacredAshItem::OnOverlapBegin(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
                                   UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
                                   bool bFromSweep, const FHitResult& SweepResult)
{
	AYakshiCharacter* Yakshi = Cast<AYakshiCharacter>(OtherActor);
	if (Yakshi)
	{
		Yakshi->DisruptEntity(GetActorLocation());
	}
}
