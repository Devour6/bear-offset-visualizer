export interface StakingProvider {
  id: string
  name: string
  apy: number // decimal, e.g. 0.072
  commission: number // percentage, e.g. 0 for 0%
  type: "validator" | "lst"
}

export const PROVIDERS: StakingProvider[] = [
  {
    id: "phase",
    name: "Phase Validator",
    apy: 0.072,
    commission: 0,
    type: "validator",
  },
  {
    id: "yield",
    name: "$YIELD",
    apy: 0.072,
    commission: 0,
    type: "lst",
  },
  {
    id: "custom",
    name: "Custom APY",
    apy: 0.07,
    commission: 0,
    type: "validator",
  },
]

export function getProvider(id: string): StakingProvider {
  return PROVIDERS.find((p) => p.id === id) ?? PROVIDERS[0]
}

/** Update a provider's APY with live data from the Phase API */
export function updateProviderApy(id: string, apy: number): void {
  const provider = PROVIDERS.find((p) => p.id === id)
  if (provider) {
    provider.apy = apy
  }
}
