export const LIVE_MARKET_RATES_INR: Record<string, number> = {
  copper: 750,
  aluminum: 205,
  brass: 540,
  steel: 45,
  iron: 32,
  unknown: 0
};

export function getMarketRate(material: string): number {
  const normalized = material.toLowerCase().trim();
  for (const [key, rate] of Object.entries(LIVE_MARKET_RATES_INR)) {
    if (normalized.includes(key)) return rate;
  }
  return LIVE_MARKET_RATES_INR.unknown;
}
