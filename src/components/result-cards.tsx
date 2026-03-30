"use client"

import { type OffsetResult, formatUsd, formatSol, formatPct, formatDuration } from "@/lib/calculations"

interface ResultCardsProps {
  result: OffsetResult
  stakedSol: number
  entryPrice: number
  providerName: string
}

export function ResultCards({ result, stakedSol, entryPrice, providerName }: ResultCardsProps) {
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

  // Color tier for offset percentage
  const offsetColor =
    offsetPct >= 75
      ? "text-green-400"
      : offsetPct >= 25
        ? "text-gold"
        : "text-ember"

  const offsetBorderColor =
    offsetPct >= 75
      ? "border-green-400/30"
      : offsetPct >= 25
        ? "border-gold/30"
        : "border-ember/30"

  return (
    <div className="space-y-4">
      {/* Hero Card: Net Result */}
      <div
        className={`relative overflow-hidden rounded-xl border ${
          isBullMode ? "border-green-400/30" : offsetBorderColor
        } bg-card p-6 sm:py-8`}
      >
        {/* Subtle gradient background */}
        <div
          className={`absolute inset-0 opacity-5 ${
            isBullMode
              ? "bg-gradient-to-br from-green-400 to-transparent"
              : offsetPct >= 75
                ? "bg-gradient-to-br from-green-400 to-transparent"
                : offsetPct >= 25
                  ? "bg-gradient-to-br from-gold to-transparent"
                  : "bg-gradient-to-br from-ember to-transparent"
          }`}
        />

        <div className="relative">
          {isBullMode ? (
            <>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mb-1">
                Staking Boost
              </p>
              <p className="text-5xl sm:text-6xl font-display text-green-400 mb-3">
                +{formatPct(boostPct)}
              </p>
              <p className="text-sm text-muted-foreground">
                SOL is up {formatPct(Math.abs(priceChangePct))} and staking
                boosted your gains by an extra{" "}
                <span className="text-green-400 font-medium">
                  {formatUsd(rewardsEarnedUsd)}
                </span>
              </p>
            </>
          ) : offsetPct >= 100 ? (
            <>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mb-1">
                Drawdown Fully Offset
              </p>
              <p className="text-5xl sm:text-6xl font-display text-green-400 mb-3">
                100%
              </p>
              <p className="text-sm text-muted-foreground">
                Staking rewards exceeded your drawdown by{" "}
                <span className="text-green-400 font-medium">
                  {formatUsd(offsetSurplusUsd)}
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider mb-1">
                Drawdown Offset
              </p>
              <p className={`text-5xl sm:text-6xl font-display ${offsetColor} mb-3`}>
                {formatPct(offsetPct)}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Without staking:{" "}
                  <span className="text-red-400">
                    {formatUsd(usdDrawdown)}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  With staking:{" "}
                  <span className={offsetPct >= 50 ? "text-gold" : "text-ember"}>
                    {formatUsd(netPositionUsd - usdValueAtEntry)}
                  </span>
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Supporting Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Price Impact */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
            Price Impact
          </p>
          <p
            className={`text-lg font-mono font-semibold ${
              priceChangePct >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {priceChangePct >= 0 ? "+" : ""}
            {formatPct(priceChangePct)}
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            ${entryPrice.toFixed(0)} → ${(usdValueNow / stakedSol).toFixed(0)}
          </p>
        </div>

        {/* Staking Rewards */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
            Rewards Earned
          </p>
          <p className="text-lg font-mono font-semibold text-green-400">
            +{formatSol(rewardsEarnedSol)} SOL
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            ≈ {formatUsd(rewardsEarnedUsd)}
          </p>
        </div>
      </div>

      {/* Breakeven Card (only in bear mode when not broken even) */}
      {daysToBreakeven !== null && daysToBreakeven > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
            Time to Full Offset
          </p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-mono font-semibold text-foreground">
              {formatDuration(daysToBreakeven)}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              at current APY
            </p>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                offsetPct >= 75
                  ? "bg-green-400"
                  : offsetPct >= 25
                    ? "bg-gold"
                    : "bg-ember"
              }`}
              style={{ width: `${Math.min(offsetPct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
