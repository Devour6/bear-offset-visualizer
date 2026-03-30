"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { formatUsd } from "@/lib/calculations"

interface MissedRewardsProps {
  stakedSol: number
  currentPrice: number
  apy: number
  providerName: string
}

/**
 * Two-part visceral conversion section:
 * 1. "What you're leaving on the table" — counterfactual rewards at different timeframes
 * 2. Real-time counter ticking up showing rewards missed since page load
 */
export function MissedRewards({
  stakedSol,
  currentPrice,
  apy,
  providerName,
}: MissedRewardsProps) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const startTimeRef = useRef(Date.now())
  const rafRef = useRef<number | null>(null)

  // Tick the counter every frame (~16ms) for smooth animation
  useEffect(() => {
    startTimeRef.current = Date.now()

    function tick() {
      setElapsedMs(Date.now() - startTimeRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Rewards per second in USD
  const rewardsPerSecond = useMemo(() => {
    const annualRewardsUsd = stakedSol * apy * currentPrice
    return annualRewardsUsd / (365 * 24 * 60 * 60)
  }, [stakedSol, apy, currentPrice])

  // Missed since page load
  const missedSinceLoad = (elapsedMs / 1000) * rewardsPerSecond

  // Counterfactual timeframes
  const timeframes = useMemo(() => {
    const compound = (days: number) =>
      stakedSol * (Math.pow(1 + apy, days / 365) - 1) * currentPrice

    return [
      { label: "30 days", days: 30, rewards: compound(30) },
      { label: "6 months", days: 182, rewards: compound(182) },
      { label: "1 year", days: 365, rewards: compound(365) },
      { label: "2 years", days: 730, rewards: compound(730) },
    ]
  }, [stakedSol, apy, currentPrice])

  // Format the live counter with enough decimal places to show movement
  const formatLiveCounter = (value: number): string => {
    if (value < 0.01) {
      return `$${value.toFixed(6)}`
    }
    if (value < 1) {
      return `$${value.toFixed(4)}`
    }
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-foreground">
        // WHAT YOU&apos;RE LEAVING ON THE TABLE
      </p>

      {/* Counterfactual header */}
      <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-6">
        <p className="text-sm text-muted-foreground font-light mb-5 leading-relaxed">
          If you held{" "}
          <span className="text-foreground font-medium">
            {stakedSol.toLocaleString()} SOL
          </span>{" "}
          and didn&apos;t stake to {providerName}, here&apos;s what you&apos;d be missing:
        </p>

        {/* Timeframe grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeframes.map((tf) => (
            <div
              key={tf.label}
              className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-3 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 mb-1.5">
                {tf.label}
              </p>
              <p className="font-mono text-lg sm:text-xl font-medium text-gold">
                +{formatUsd(tf.rewards)}
              </p>
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-1">
                +{(tf.rewards / currentPrice).toFixed(2)} SOL
              </p>
            </div>
          ))}
        </div>

        <p className="font-mono text-[10px] text-muted-foreground/40 mt-4 text-center">
          Based on {(apy * 100).toFixed(1)}% APY with {providerName} at current SOL price
        </p>
      </div>

      {/* Live counter — the visceral part */}
      <div className="bg-[var(--glass-bg-gold)] border border-[var(--glass-border-gold)] rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground font-light mb-3">
          Since you opened this page, you&apos;ve missed out on:
        </p>

        <p className="font-mono text-3xl sm:text-5xl font-display text-gold tabular-nums leading-none">
          {formatLiveCounter(missedSinceLoad)}
        </p>

        <p className="text-[11px] text-muted-foreground/60 font-mono mt-3">
          in staking rewards — ticking up{" "}
          <span className="text-gold/80">
            {formatLiveCounter(rewardsPerSecond)}/sec
          </span>
        </p>
      </div>
    </div>
  )
}
