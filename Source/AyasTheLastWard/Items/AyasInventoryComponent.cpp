#include "AyasInventoryComponent.h"

UAyasInventoryComponent::UAyasInventoryComponent()
{
	PrimaryComponentTick.bCanEverTick = false;
	SacredAshCount = 2;
	IronConnectorsCount = 1;
	GroundingFusesCount = 0;
}

bool UAyasInventoryComponent::ConsumeSacredAsh()
{
	if (SacredAshCount > 0)
	{
		SacredAshCount--;
		OnInventoryUpdated.Broadcast();
		return true;
	}
	return false;
}

void UAyasInventoryComponent::AddSacredAsh(int32 Amount)
{
	SacredAshCount += Amount;
	OnInventoryUpdated.Broadcast();
}

bool UAyasInventoryComponent::ConsumeIronConnector()
{
	if (IronConnectorsCount > 0)
	{
		IronConnectorsCount--;
		OnInventoryUpdated.Broadcast();
		return true;
	}
	return false;
}

void UAyasInventoryComponent::AddEvidence(const FString& EvidenceID)
{
	if (!CollectedEvidence.Contains(EvidenceID))
	{
		CollectedEvidence.Add(EvidenceID);
		OnInventoryUpdated.Broadcast();
	}
}

bool UAyasInventoryComponent::HasEvidence(const FString& EvidenceID) const
{
	return CollectedEvidence.Contains(EvidenceID);
}
