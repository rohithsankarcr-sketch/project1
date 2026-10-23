#include "AyasGameUserSettings.h"

UAyasGameUserSettings::UAyasGameUserSettings()
{
	MasterVolume = 1.0f;
	AmbienceVolume = 0.85f;
	SfxVolume = 0.9f;
	DialogueVolume = 0.95f;
	MouseSensitivity = 1.0f;
	bSubtitlesEnabled = true;
	bReducedMotion = false;
	HorrorIntensity = 0;
}

void UAyasGameUserSettings::ApplyAyasCustomSettings()
{
	SaveSettings();
}

UAyasGameUserSettings* UAyasGameUserSettings::GetAyasSettings()
{
	return Cast<UAyasGameUserSettings>(UGameUserSettings::GetGameUserSettings());
}
