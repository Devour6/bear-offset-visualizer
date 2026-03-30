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

  function getHeroMessage(): string {
    if (isBullMode) {
      return `SOL is up ${formatPct(Math.abs(priceChangePct))}. Staking to ${providerName} would have added ${formatUsd(rewardsEarnedUsd)} on top — extra gains you wouldn't have without staking.`
    }
    if (offsetPct >= 100) {
      return `SOL dropped ${formatPct(Math.abs(priceChangePct))}, but staking to ${providerName} would have earned more than enough to cover the loss. You'd be ${formatUsd(offsetSurplusUsd)} ahead.`
    }
    return `SOL dropped ${formatPct(Math.abs(priceChangePct))}. Without staking to ${providerName}, you'd have lost ${formatUsd(Math.abs(usdDrawdown))}. Staking would have earned ${formatUsd(rewardsEarnedUsd)} of that back — roughly ${formatPct(offsetPct)} of your losses recovered.`
  }

  return (
    <div className={`${glassVariant} border rounded-xl p-5 sm:p-6`}>
      {/* Hero number */}
      <p className={`text-5xl sm:text-6xl font-display ${accentColor} leading-none`}>
        {isBullMode
          ? `+${formatPct(boostPct)}`
          : offsetPct >= 100
            ? "100%"
            : formatPct(offsetPct)}
      </p>
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/60 mt-1">
        {isBullMode ? "staking boost" : offsetPct >= 100 ? "fully offset" : "drawdown offset"}
      </p>

      <p className="text-[13px] text-muted-foreground mt-3 font-light max-w-md leading-relaxed">
        {getHeroMessage()}
      </p>

      {/* Inline stats row */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 pt-3 border-t border-[var(--glass-border)] font-mono text-[11px]">
        <span>
          <span className="text-muted-foreground/50">Price </span>
          <span className={priceChangePct >= 0 ? "text-green-400" : "text-red-400"}>
            {priceChangePct >= 0 ? "+" : ""}{formatPct(priceChangePct)}
          </span>
          <span className="text-muted-foreground/30"> (${entryPrice.toFixed(0)} → ${(usdValueNow / stakedSol).toFixed(0)})</span>
        </span>
        <span>
          <span className="text-muted-foreground/50">Rewards </span>
          <span className="text-green-400">+{formatUsd(rewardsEarnedUsd)}</span>
          <span className="text-muted-foreground/30"> ({formatSol(rewardsEarnedSol)} SOL)</span>
        </span>
        {daysToBreakeven !== null && daysToBreakeven > 0 && (
          <span>
            <span className="text-muted-foreground/50">Full offset in </span>
            <span className="text-foreground">{formatDuration(daysToBreakeven)}</span>
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isBullMode && offsetPct < 100 && (
        <div className="h-1 bg-background/30 rounded-full overflow-hidden mt-3">
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
