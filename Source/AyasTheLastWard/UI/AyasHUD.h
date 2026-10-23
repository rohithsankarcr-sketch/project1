#pragma once

#include "CoreMinimal.h"
#include "GameFramework/HUD.h"
#include "AyasHUD.generated.h"

UCLASS()
class AYASTHELASTWARD_API AAyasHUD : public AHUD
{
	GENERATED_BODY()

public:
	AAyasHUD();

	virtual void DrawHUD() override;

protected:
	virtual void BeginPlay() override;

private:
	void DrawReticle();
};
