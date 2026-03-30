"use client"

import { useState } from "react"
import { PROVIDERS } from "@/lib/providers"

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

const labelClass =
  "font-mono text-[11px] font-normal uppercase tracking-[0.08em] text-muted-foreground block mb-1.5"

const inputClass =
  "w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] px-3 py-2.5 font-mono text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors duration-150 rounded-lg focus:border-[var(--glass-border-hover)] focus:bg-[var(--glass-bg-hover)]"

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

  const today = new Date().toISOString().split("T")[0]
  const providers = PROVIDERS.filter((p) => p.id !== "custom")

  return (
    <div className="flex flex-col gap-5">
      {/* SOL Amount */}
      <div>
        <label className={labelClass}>SOL Staked</label>
        <input
          type="number"
          min={0}
          step={1}
          value={stakedSol || ""}
          onChange={(e) => onStakedSolChange(Number(e.target.value))}
          placeholder="100"
          className={inputClass}
        />
        <div className="flex gap-1.5 mt-2">
          {[10, 100, 1000, 10000].map((amount) => (
            <button
              key={amount}
              onClick={() => onStakedSolChange(amount)}
              className={`flex-1 text-[11px] font-mono py-1.5 rounded-md border transition-all duration-150 ${
                stakedSol === amount
                  ? "border-[var(--glass-border-hover)] bg-[var(--glass-bg-active)] text-foreground"
                  : "border-[var(--glass-border)] text-muted-foreground hover:border-[var(--glass-border-hover)] hover:text-foreground"
              }`}
            >
              {amount >= 1000 ? `${amount / 1000}K` : amount}
            </button>
          ))}
        </div>
      </div>

      {/* Entry Date / Price */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-mono text-[11px] font-normal uppercase tracking-[0.08em] text-muted-foreground">
            {useCustomPrice ? "Entry Price (USD)" : "Entry Date"}
          </label>
          <button
            onClick={() => {
              setUseCustomPrice(!useCustomPrice)
              if (useCustomPrice) {
                onEntryPriceChange(null)
                onRefetchPrice?.()
              }
            }}
            className="text-[11px] text-gold/60 hover:text-gold transition-colors font-mono uppercase tracking-[0.05em]"
          >
            {useCustomPrice ? "use date" : "use price"}
          </button>
        </div>

        {useCustomPrice ? (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-mono text-[13px]">
              $
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={entryPrice ?? ""}
              onChange={(e) =>
                onEntryPriceChange(e.target.value ? Number(e.target.value) : null)
              }
              placeholder="130.00"
              className={`${inputClass} pl-7`}
            />
          </div>
        ) : (
          <div className="relative">
            <input
              type="date"
              value={entryDate}
              max={today}
              min="2020-04-01"
              onChange={(e) => onEntryDateChange(e.target.value)}
              className={`${inputClass} [color-scheme:dark]`}
            />
            {isLoadingPrice && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-3.5 h-3.5 border-[1.5px] border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            )}
            {entryPrice !== null && !isLoadingPrice && (
              <p className="mt-1.5 text-[11px] font-mono text-muted-foreground/70">
                SOL was ${entryPrice.toFixed(2)} on this date
              </p>
            )}
          </div>
        )}
      </div>

      {/* Staking Provider */}
      <div>
        <label className={labelClass}>Staking Method</label>

        {/* Phase + $YIELD toggle */}
        <div className="flex border border-[var(--glass-border)] rounded-lg overflow-hidden">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => onProviderChange(p.id)}
              className={`flex-1 px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.05em] transition-all duration-150 ${
                providerId === p.id
                  ? p.id === "phase"
                    ? "bg-[var(--glass-bg-gold)] text-gold border-r border-[var(--glass-border)]"
                    : "bg-[var(--glass-bg-blue)] text-phase-blue"
                  : "text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg)] border-r border-[var(--glass-border)] last:border-r-0"
              }`}
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-[10px] opacity-70 mt-0.5">
                {(p.apy * 100).toFixed(1)}% APY
                {p.commission === 0 ? " · 0% fee" : ""}
              </div>
            </button>
          ))}
        </div>

        {/* Custom APY toggle */}
        <button
          onClick={() => onProviderChange(providerId === "custom" ? "phase" : "custom")}
          className={`mt-2 text-[11px] font-mono uppercase tracking-[0.05em] transition-colors ${
            providerId === "custom"
              ? "text-foreground"
              : "text-muted-foreground/50 hover:text-muted-foreground"
          }`}
        >
          {providerId === "custom" ? "← back to Phase" : "Custom APY →"}
        </button>

        {providerId === "custom" && (
          <div className="flex items-center gap-2 mt-2">
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={customApy}
              onChange={(e) => onCustomApyChange(Number(e.target.value))}
              className={`w-24 ${inputClass}`}
            />
            <span className="text-[11px] text-muted-foreground font-mono">
              % APY
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
