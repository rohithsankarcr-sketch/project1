#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameUserSettings.h"
#include "AyasGameUserSettings.generated.h"

UCLASS()
class AYASTHELASTWARD_API UAyasGameUserSettings : public UGameUserSettings
{
	GENERATED_BODY()

public:
	UAyasGameUserSettings();

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Audio")
	float MasterVolume;

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Audio")
	float AmbienceVolume;

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Audio")
	float SfxVolume;

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Audio")
	float DialogueVolume;

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Input")
	float MouseSensitivity;

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Accessibility")
	bool bSubtitlesEnabled;

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Accessibility")
	bool bReducedMotion;

	UPROPERTY(config, BlueprintReadWrite, Category = "Ayas Settings|Accessibility")
	int32 HorrorIntensity; // 0 = Standard, 1 = Reduced Jump Intensity

	UFUNCTION(BlueprintCallable, Category = "Ayas Settings")
	void ApplyAyasCustomSettings();

	static UAyasGameUserSettings* GetAyasSettings();
};
