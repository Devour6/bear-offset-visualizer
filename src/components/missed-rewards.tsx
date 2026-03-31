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
      {/* Live counter */}
      <div className="flex items-center justify-between mb-5 pb-5 border-b border-[var(--glass-border)]">
        <p className="text-sm text-muted-foreground">Missing out right now</p>
        <span className="text-2xl font-display text-gold tabular-nums">
          {formatLive(missedSinceLoad)}
        </span>
      </div>

      {/* Timeframes */}
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
