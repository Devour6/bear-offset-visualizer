"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { formatUsd } from "@/lib/calculations"

interface MissedRewardsProps {
  stakedSol: number
  currentPrice: number
  apy: number
  providerName: string
}

export function MissedRewards({
  stakedSol,
  currentPrice,
  apy,
}: MissedRewardsProps) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const startTimeRef = useRef(Date.now())
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    startTimeRef.current = Date.now()
    function tick() {
      setElapsedMs(Date.now() - startTimeRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const rewardsPerSecond = useMemo(() => {
    return (stakedSol * apy * currentPrice) / (365 * 24 * 60 * 60)
  }, [stakedSol, apy, currentPrice])

  const missedSinceLoad = (elapsedMs / 1000) * rewardsPerSecond

  const timeframes = useMemo(() => {
    const compound = (days: number) =>
      stakedSol * (Math.pow(1 + apy, days / 365) - 1) * currentPrice
    return [
      { label: "30d", rewards: compound(30) },
      { label: "6mo", rewards: compound(182) },
      { label: "1yr", rewards: compound(365) },
      { label: "2yr", rewards: compound(730) },
    ]
  }, [stakedSol, apy, currentPrice])

  const formatLive = (v: number) =>
    v < 0.01 ? `$${v.toFixed(6)}` : v < 1 ? `$${v.toFixed(4)}` : `$${v.toFixed(2)}`

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-6">
      {/* Live counter — hero placement */}
      <div className="flex flex-col items-center text-center mb-5 pb-5 border-b border-[var(--glass-border)]">
        <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-2">
          You&apos;re missing out on
        </p>
        <span className="text-5xl sm:text-6xl font-display text-gold tabular-nums drop-shadow-[0_0_24px_rgba(252,225,132,0.35)] animate-pulse-subtle">
          {formatLive(missedSinceLoad)}
        </span>
        <p className="text-xs text-muted-foreground/40 mt-2 font-mono">
          since you opened this page
        </p>
      </div>

      {/* Timeframes */}
      <p className="text-xs uppercase tracking-widest text-muted-foreground/50 text-center mb-3">
        Projected missed rewards
      </p>
      <div className="grid grid-cols-4 gap-3">
        {timeframes.map((tf) => (
          <div key={tf.label} className="text-center">
            <p className="text-lg font-medium text-gold">
              +{formatUsd(tf.rewards)}
            </p>
            <p className="text-xs text-muted-foreground/40 mt-0.5">{tf.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
