export interface OffsetInputs {
  stakedSol: number
  entryPrice: number
  currentPrice: number
  apy: number // as decimal, e.g. 0.072 for 7.2%
  daysStaked: number
}

export interface OffsetResult {
  // Price impact
  priceChangePct: number
  usdValueAtEntry: number
  usdValueNow: number
  usdDrawdown: number

  // Staking rewards (compound)
  rewardsEarnedSol: number
  rewardsEarnedUsd: number

  // Net result
  netPositionUsd: number
  offsetPct: number // 0-100, capped at 100
  offsetSurplusUsd: number // > 0 when staking exceeds drawdown

  // Breakeven
  daysToBreakeven: number | null // null if already broken even or SOL is up

  // Mode
  isBullMode: boolean // true when SOL price is up
  boostPct: number // extra % gain from staking in bull mode

}

/**
 * Compound staking calculation using APY-correct formula.
 * Solana compounds every epoch (~2.5 days, ~146 epochs/year).
 * Formula: rewards = principal * ((1 + apy)^(days/365) - 1)
 */
function calculateCompoundRewards(
  principal: number,
  apy: number,
  days: number
): number {
  if (days <= 0 || apy <= 0) return 0
  return principal * (Math.pow(1 + apy, days / 365) - 1)
}

/**
 * Calculate the number of days between two dates.
 */
export function daysBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime()
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
}

/**
 * Core offset calculation engine.
 */
export function calculateOffset(inputs: OffsetInputs): OffsetResult {
  const { stakedSol, entryPrice, currentPrice, apy, daysStaked } = inputs

  // Price impact
  const priceChangePct =
    entryPrice > 0 ? ((currentPrice - entryPrice) / entryPrice) * 100 : 0
  const usdValueAtEntry = stakedSol * entryPrice
  const usdValueNow = stakedSol * currentPrice
  const usdDrawdown = usdValueNow - usdValueAtEntry

  // Staking rewards (compound)
  const rewardsEarnedSol = calculateCompoundRewards(stakedSol, apy, daysStaked)
  const rewardsEarnedUsd = rewardsEarnedSol * currentPrice

  // Net position
  const netPositionUsd = usdValueNow + rewardsEarnedUsd

  // Offset calculation
  const isBullMode = currentPrice >= entryPrice
  let offsetPct = 0
  let offsetSurplusUsd = 0
  let boostPct = 0

  if (isBullMode) {
    // Bull mode: staking is a bonus on top of gains
    boostPct =
      usdValueAtEntry > 0 ? (rewardsEarnedUsd / usdValueAtEntry) * 100 : 0
  } else {
    // Bear mode: how much did staking offset the drawdown?
    const absDrawdown = Math.abs(usdDrawdown)
    if (absDrawdown > 0) {
      const rawOffset = (rewardsEarnedUsd / absDrawdown) * 100
      offsetPct = Math.min(rawOffset, 100)
      if (rawOffset > 100) {
        offsetSurplusUsd = rewardsEarnedUsd - absDrawdown
      }
    }
  }

  // Days to breakeven (only in bear mode, when not already broken even)
  let daysToBreakeven: number | null = null
  if (!isBullMode && rewardsEarnedUsd < Math.abs(usdDrawdown)) {
    const dailyRewardUsd =
      stakedSol * (Math.pow(1 + apy, 1 / 365) - 1) * currentPrice
    if (dailyRewardUsd > 0) {
      const remainingUsd = Math.abs(usdDrawdown) - rewardsEarnedUsd
      daysToBreakeven = Math.ceil(remainingUsd / dailyRewardUsd)
    }
  }

  return {
    priceChangePct,
    usdValueAtEntry,
    usdValueNow,
    usdDrawdown,
    rewardsEarnedSol,
    rewardsEarnedUsd,
    netPositionUsd,
    offsetPct,
    offsetSurplusUsd,
    daysToBreakeven,
    isBullMode,
    boostPct,
  }
}

/**
 * Format USD amounts.
 */
export function formatUsd(value: number): string {
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`
  return `${sign}$${abs.toFixed(2)}`
}

/**
 * Format SOL amounts.
 */
export function formatSol(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  if (value >= 1) return value.toFixed(2)
  return value.toFixed(4)
}

/**
 * Format percentage.
 */
export function formatPct(value: number): string {
  if (Math.abs(value) >= 100) return `${Math.round(value)}%`
  return `${value.toFixed(1)}%`
}

/**
 * Format days to human-readable duration.
 */
export function formatDuration(days: number): string {
  if (days >= 365) {
    const years = Math.floor(days / 365)
    const remainingDays = days % 365
    const months = Math.floor(remainingDays / 30)
    if (months > 0) return `${years}y ${months}mo`
    return `${years}y`
  }
  if (days >= 30) {
    const months = Math.floor(days / 30)
    const remainingDays = days % 30
    if (remainingDays > 0) return `${months}mo ${remainingDays}d`
    return `${months}mo`
  }
  return `${days}d`
}
