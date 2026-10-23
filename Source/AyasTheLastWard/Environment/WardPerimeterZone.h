#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "WardStationActor.h"
#include "WardPerimeterZone.generated.h"

class UBoxComponent;

UCLASS()
class AYASTHELASTWARD_API AWardPerimeterZone : public AActor
{
	GENERATED_BODY()

public:
	AWardPerimeterZone();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UBoxComponent* BoundaryCollision;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Ward")
	AWardStationActor* LinkedWardStation;

	UFUNCTION()
	void OnWardStateUpdated(FName WardID, EWardState NewState);

protected:
	virtual void BeginPlay() override;

	UFUNCTION()
	void OnBoundaryOverlap(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
	                      UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
	                      bool bFromSweep, const FHitResult& SweepResult);
};
