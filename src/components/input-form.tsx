"use client"

import { useState, useEffect } from "react"
import { PROVIDERS, type StakingProvider } from "@/lib/providers"

interface InputFormProps {
  stakedSol: number
  entryDate: string
  entryPrice: number | null
  providerId: string
  customApy: number
  onStakedSolChange: (v: number) => void
  onEntryDateChange: (v: string) => void
  onEntryPriceChange: (v: number | null) => void
  onProviderChange: (v: string) => void
  onCustomApyChange: (v: number) => void
  isLoadingPrice: boolean
  onRefetchPrice?: () => void
}

export function InputForm({
  stakedSol,
  entryDate,
  entryPrice,
  providerId,
  customApy,
  onStakedSolChange,
  onEntryDateChange,
  onEntryPriceChange,
  onProviderChange,
  onCustomApyChange,
  isLoadingPrice,
  onRefetchPrice,
}: InputFormProps) {
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const provider = PROVIDERS.find((p) => p.id === providerId) ?? PROVIDERS[0]

  // Default date: 6 months ago
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const defaultDate = sixMonthsAgo.toISOString().split("T")[0]

  // Max date: today
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      {/* SOL Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
          SOL Staked
        </label>
        <input
          type="number"
          min={0}
          step={1}
          value={stakedSol || ""}
          onChange={(e) => onStakedSolChange(Number(e.target.value))}
          placeholder="100"
          className="w-full bg-card border border-border rounded-lg px-4 py-3 text-lg font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
        />
        {/* Quick amounts */}
        <div className="flex gap-2">
          {[10, 100, 1000, 10000].map((amount) => (
            <button
              key={amount}
              onClick={() => onStakedSolChange(amount)}
              className="flex-1 text-xs font-mono py-1.5 rounded-md border border-border hover:border-gold/30 hover:bg-gold/5 text-muted-foreground hover:text-foreground transition-colors"
            >
              {amount >= 1000 ? `${amount / 1000}K` : amount}
            </button>
          ))}
        </div>
      </div>

      {/* Entry Date / Price */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
            {useCustomPrice ? "Entry Price (USD)" : "Entry Date"}
          </label>
          <button
            onClick={() => {
              setUseCustomPrice(!useCustomPrice)
              if (!useCustomPrice) {
                // Switching to custom price — no action needed
              } else {
                // Switching back to date — clear custom price and re-fetch from date
                onEntryPriceChange(null)
                onRefetchPrice?.()
              }
            }}
            className="text-xs text-gold/70 hover:text-gold transition-colors font-mono"
          >
            {useCustomPrice ? "Use date instead" : "Use custom price"}
          </button>
        </div>

        {useCustomPrice ? (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">
              $
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={entryPrice ?? ""}
              onChange={(e) =>
                onEntryPriceChange(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              placeholder="130.00"
              className="w-full bg-card border border-border rounded-lg pl-8 pr-4 py-3 text-lg font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors"
            />
          </div>
        ) : (
          <div className="relative">
            <input
              type="date"
              value={entryDate || defaultDate}
              max={today}
              min="2020-04-01"
              onChange={(e) => onEntryDateChange(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-lg font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold/50 transition-colors [color-scheme:dark]"
            />
            {isLoadingPrice && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            )}
            {entryPrice !== null && !isLoadingPrice && (
              <div className="mt-1 text-xs font-mono text-muted-foreground">
                SOL was ${entryPrice.toFixed(2)} on that date
              </div>
            )}
          </div>
        )}
      </div>

      {/* Staking Provider */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
          Staking Provider
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PROVIDERS.filter((p) => p.id !== "custom").map((p) => (
            <button
              key={p.id}
              onClick={() => onProviderChange(p.id)}
              className={`relative px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                providerId === p.id
                  ? p.id === "phase" || p.id === "yield"
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-cream/30 bg-cream/5 text-foreground"
                  : "border-border text-muted-foreground hover:border-border hover:text-foreground hover:bg-card"
              }`}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs opacity-70 font-mono">
                {(p.apy * 100).toFixed(1)}% APY
                {p.commission === 0 && (p.id === "phase" || p.id === "yield")
                  ? " · 0% fee"
                  : ""}
              </div>
              {(p.id === "phase" || p.id === "yield") && (
                <div className="absolute -top-1.5 -right-1.5 bg-gold text-dark text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  PHASE
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Custom APY */}
        <button
          onClick={() => onProviderChange("custom")}
          className={`w-full px-3 py-2 rounded-lg border text-sm transition-all ${
            providerId === "custom"
              ? "border-cream/30 bg-cream/5 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          Custom APY
        </button>

        {providerId === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={customApy}
              onChange={(e) => onCustomApyChange(Number(e.target.value))}
              className="w-24 bg-card border border-border rounded-lg px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 transition-colors"
            />
            <span className="text-sm text-muted-foreground font-mono">
              % APY
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
