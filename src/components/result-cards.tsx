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

  // Color tier
  const isGreen = isBullMode || offsetPct >= 75
  const isGold = !isBullMode && offsetPct >= 25 && offsetPct < 75
  const isEmber = !isBullMode && offsetPct < 25

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

  // Prospective, provider-specific messaging
  function getHeroMessage(): string {
    if (isBullMode) {
      return `SOL is up ${formatPct(Math.abs(priceChangePct))}. Staking to ${providerName} would have added ${formatUsd(rewardsEarnedUsd)} on top — extra gains you wouldn't have without staking.`
    }
    if (offsetPct >= 100) {
      return `SOL dropped ${formatPct(Math.abs(priceChangePct))}, but staking to ${providerName} would have earned more than enough rewards to cover the loss. You'd be ${formatUsd(offsetSurplusUsd)} ahead of where you'd be without staking.`
    }
    return `SOL dropped ${formatPct(Math.abs(priceChangePct))}. Without staking to ${providerName}, you'd have lost ${formatUsd(Math.abs(usdDrawdown))}. Staking to ${providerName} would have earned ${formatUsd(rewardsEarnedUsd)} of that back — roughly ${formatPct(offsetPct)} of your losses recovered.`
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Hero offset number */}
      <div className={`${glassVariant} border rounded-xl p-6 sm:p-8`}>
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground mb-2">
          {isBullMode
            ? "// STAKING BOOST"
            : offsetPct >= 100
              ? "// FULLY OFFSET"
              : "// DRAWDOWN OFFSET"}
        </p>

        <p className={`text-5xl sm:text-7xl font-display ${accentColor} leading-none`}>
          {isBullMode
            ? `+${formatPct(boostPct)}`
            : offsetPct >= 100
              ? "100%"
              : formatPct(offsetPct)}
        </p>

        <p className="text-sm text-muted-foreground mt-3 font-light max-w-md leading-relaxed">
          {getHeroMessage()}
        </p>

        {/* Inline comparison */}
        {!isBullMode && offsetPct < 100 && (
          <div className="flex gap-6 mt-4 pt-4 border-t border-[var(--glass-border)]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
                Without staking
              </p>
              <p className="font-mono text-sm text-red-400">
                {formatUsd(usdDrawdown)}
              </p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
                With {providerName}
              </p>
              <p className={`font-mono text-sm ${offsetPct >= 50 ? accentColor : "text-ember"}`}>
                {formatUsd(netPositionUsd - usdValueAtEntry)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Supporting stats — compact row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
            Price
          </p>
          <p
            className={`font-mono text-sm font-medium ${
              priceChangePct >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {priceChangePct >= 0 ? "+" : ""}
            {formatPct(priceChangePct)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5">
            ${entryPrice.toFixed(0)} → ${(usdValueNow / stakedSol).toFixed(0)}
          </p>
        </div>

        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
            Rewards
          </p>
          <p className="font-mono text-sm font-medium text-green-400">
            +{formatUsd(rewardsEarnedUsd)}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5">
            +{formatSol(rewardsEarnedSol)} SOL
          </p>
        </div>

        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 mb-1">
            {daysToBreakeven !== null && daysToBreakeven > 0
              ? "Full Offset"
              : "Net P&L"}
          </p>
          {daysToBreakeven !== null && daysToBreakeven > 0 ? (
            <>
              <p className="font-mono text-sm font-medium text-foreground">
                {formatDuration(daysToBreakeven)}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5">
                at current APY
              </p>
            </>
          ) : (
            <>
              <p
                className={`font-mono text-sm font-medium ${
                  netPositionUsd - usdValueAtEntry >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {formatUsd(netPositionUsd - usdValueAtEntry)}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-0.5">
                with rewards
              </p>
            </>
          )}
        </div>
      </div>

      {/* Progress bar — only when in bear mode and not fully offset */}
      {daysToBreakeven !== null && daysToBreakeven > 0 && (
        <div className="h-1 bg-[var(--glass-bg)] rounded-full overflow-hidden">
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
