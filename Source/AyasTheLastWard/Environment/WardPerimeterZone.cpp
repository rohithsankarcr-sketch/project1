#include "WardPerimeterZone.h"
#include "Components/BoxComponent.h"
#include "AyasTheLastWard/AI/YakshiCharacter.h"

AWardPerimeterZone::AWardPerimeterZone()
{
	PrimaryActorTick.bCanEverTick = false;

	BoundaryCollision = CreateDefaultSubobject<UBoxComponent>(TEXT("BoundaryCollision"));
	RootComponent = BoundaryCollision;
	BoundaryCollision->SetBoxExtent(FVector(800.0f, 60.0f, 300.0f));
	BoundaryCollision->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
}

void AWardPerimeterZone::BeginPlay()
{
	Super::BeginPlay();

	BoundaryCollision->OnComponentBeginOverlap.AddDynamic(this, &AWardPerimeterZone::OnBoundaryOverlap);

	if (LinkedWardStation)
	{
		LinkedWardStation->OnWardStateChanged.AddDynamic(this, &AWardPerimeterZone::OnWardStateUpdated);
	}
}

void AWardPerimeterZone::OnWardStateUpdated(FName WardID, EWardState NewState)
{
	// Boundary state is reactive to ward status
}

void AWardPerimeterZone::OnBoundaryOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
                                         UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
                                         bool bFromSweep, const FHitResult& SweepResult)
{
	if (!LinkedWardStation) return;

	EWardState State = LinkedWardStation->GetWardState();
	if (State == EWardState::Intact || State == EWardState::Repaired)
	{
		AYakshiCharacter* Yakshi = Cast<AYakshiCharacter>(OtherActor);
		if (Yakshi)
		{
			// Ward boundary repulsion
			Yakshi->DisruptEntity(GetActorLocation());
		}
	}
}
