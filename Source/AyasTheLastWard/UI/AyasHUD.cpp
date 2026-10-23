#include "AyasHUD.h"
#include "Engine/Canvas.h"

AAyasHUD::AAyasHUD()
{
}

void AAyasHUD::BeginPlay()
{
	Super::BeginPlay();
}

void AAyasHUD::DrawHUD()
{
	Super::DrawHUD();
	DrawReticle();
}

void AAyasHUD::DrawReticle()
{
	if (!Canvas) return;

	const FVector2D Center(Canvas->ClipX * 0.5f, Canvas->ClipY * 0.5f);
	const float ReticleSize = 3.0f;

	// Minimalistic 3-pixel center reticle
	DrawRect(FLinearColor(1.0f, 1.0f, 1.0f, 0.6f),
	         Center.X - (ReticleSize * 0.5f),
	         Center.Y - (ReticleSize * 0.5f),
	         ReticleSize,
	         ReticleSize);
}
