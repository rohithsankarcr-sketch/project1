#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "SacredAshItem.generated.h"

class USphereComponent;
class UParticleSystemComponent;

UCLASS()
class AYASTHELASTWARD_API ASacredAshItem : public AActor
{
	GENERATED_BODY()

public:
	ASacredAshItem();

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USphereComponent* WardRadiusSphere;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Ash")
	float DurationSeconds;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Ayas|Ash")
	float Radius;

	virtual void Tick(float DeltaTime) override;

protected:
	virtual void BeginPlay() override;

private:
	float RemainingTime;

	UFUNCTION()
	void OnOverlapBegin(UPrimitiveComponent* OverlappedComp, AActor* OtherActor,
	                    UPrimitiveComponent* OtherComp, int32 OtherBodyIndex,
	                    bool bFromSweep, const FHitResult& SweepResult);
};
