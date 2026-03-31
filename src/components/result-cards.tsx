"use client"

import {
  type OffsetResult,
  formatUsd,
  formatSol,
  formatPct,
  formatDuration,
} from "@/lib/calculations"

interface ResultCardsProps {
  result: OffsetResult
  stakedSol: number
  entryPrice: number
  providerName: string
}

export function ResultCards({
  result,
  stakedSol,
  entryPrice,
  providerName,
}: ResultCardsProps) {
  const {
    priceChangePct,
    usdValueNow,
    usdDrawdown,
    rewardsEarnedSol,
    rewardsEarnedUsd,
    offsetPct,
    offsetSurplusUsd,
    daysToBreakeven,
    isBullMode,
    boostPct,
  } = result

  const isGreen = isBullMode || offsetPct >= 75
  const isGold = !isBullMode && offsetPct >= 25 && offsetPct < 75

  const accentColor = isGreen
    ? "text-green-400"
    : isGold
      ? "text-gold"
      : "text-ember"

  const glassVariant = isGreen
    ? "bg-[var(--glass-bg-green)] border-[var(--glass-border-green)]"
    : isGold
      ? "bg-[var(--glass-bg-gold)] border-[var(--glass-border-gold)]"
      : "bg-[rgba(249,115,22,0.08)] border-[rgba(249,115,22,0.25)]"

  function getLabel(): string {
    if (isBullMode) return "staking boost"
    if (offsetPct >= 100) return "fully offset"
    return "drawdown offset"
  }

  function getSummary(): string {
    if (isBullMode) {
      return `SOL is up ${formatPct(Math.abs(priceChangePct))}. ${providerName} added ${formatUsd(rewardsEarnedUsd)} on top.`
    }
    if (offsetPct >= 100) {
      return `SOL dropped ${formatPct(Math.abs(priceChangePct))}. ${providerName} earned enough to cover the loss \u2014 you\u2019d be ${formatUsd(offsetSurplusUsd)} ahead.`
    }
    return `SOL dropped ${formatPct(Math.abs(priceChangePct))}. ${providerName} recovered ${formatUsd(rewardsEarnedUsd)} of the ${formatUsd(Math.abs(usdDrawdown))} drawdown.`
  }

  return (
    <div className={`${glassVariant} border rounded-xl p-6`}>
      {/* Hero number */}
      <p className={`text-6xl sm:text-7xl font-display ${accentColor} leading-none`}>
        {isBullMode
          ? `+${formatPct(boostPct)}`
          : offsetPct >= 100
            ? "100%"
            : formatPct(offsetPct)}
      </p>
      <p className="text-sm text-muted-foreground/50 mt-1.5 uppercase tracking-wide">
        {getLabel()}
      </p>

      <p className="text-sm text-muted-foreground mt-4 leading-relaxed max-w-lg">
        {getSummary()}
      </p>

      {/* Stats */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 pt-4 border-t border-[var(--glass-border)] text-sm">
        <span>
          <span className="text-muted-foreground/50">Price </span>
          <span className={priceChangePct >= 0 ? "text-green-400" : "text-red-400"}>
            {priceChangePct >= 0 ? "+" : ""}{formatPct(priceChangePct)}
          </span>
          <span className="text-muted-foreground/30 ml-1">
            ${entryPrice.toFixed(0)} &rarr; ${(usdValueNow / stakedSol).toFixed(0)}
          </span>
        </span>
        <span>
          <span className="text-muted-foreground/50">Rewards </span>
          <span className="text-green-400">+{formatUsd(rewardsEarnedUsd)}</span>
          <span className="text-muted-foreground/30 ml-1">{formatSol(rewardsEarnedSol)} SOL</span>
        </span>
        {daysToBreakeven !== null && daysToBreakeven > 0 && (
          <span>
            <span className="text-muted-foreground/50">Full offset </span>
            <span className="text-foreground">{formatDuration(daysToBreakeven)}</span>
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isBullMode && offsetPct < 100 && (
        <div className="h-1.5 bg-background/30 rounded-full overflow-hidden mt-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              isGreen ? "bg-green-400" : isGold ? "bg-gold" : "bg-ember"
            }`}
            style={{ width: `${Math.min(offsetPct, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
