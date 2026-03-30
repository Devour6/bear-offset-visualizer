"use client"

import { Download, Share2 } from "lucide-react"
import { type OffsetResult, formatSol, formatUsd, formatPct } from "@/lib/calculations"

interface ShareCardProps {
  result: OffsetResult
  stakedSol: number
  entryPrice: number
  currentPrice: number
  entryDate: string
  providerName: string
  apy: number
  daysStaked: number
}

export function ShareCard({
  result,
  stakedSol,
  entryPrice,
  currentPrice,
  entryDate,
  providerName,
  apy,
  daysStaked,
}: ShareCardProps) {
  const {
    offsetPct,
    isBullMode,
    boostPct,
    rewardsEarnedSol,
    rewardsEarnedUsd,
    usdDrawdown,
    priceChangePct,
    netPositionUsd,
    usdValueAtEntry,
  } = result

  const shareParams = new URLSearchParams({
    sol: stakedSol.toString(),
    date: entryDate,
    price: entryPrice.toFixed(2),
    current: currentPrice.toFixed(2),
    provider: providerName,
    apy: apy.toString(),
    days: daysStaked.toString(),
  })

  const shareUrl = `https://bear.phaselabs.io/?${shareParams.toString()}`
  const ogUrl = `/api/og?${shareParams.toString()}`

  // Clear, narrative-driven hero text
  const heroText = isBullMode
    ? `Staking boosted my SOL gains by ${formatPct(boostPct)}`
    : offsetPct >= 100
      ? `Staking rewards fully covered my SOL price drop`
      : `Staking recovered ${formatPct(offsetPct)} of my SOL losses`

  const tweetText = encodeURIComponent(
    `${heroText} — powered by @phase_\n\n${shareUrl}`
  )

  // Color for the hero number
  const isGreen = isBullMode || offsetPct >= 75
  const isGold = !isBullMode && offsetPct >= 25 && offsetPct < 75
  const heroColor = isGreen
    ? "text-green-400"
    : isGold
      ? "text-gold"
      : "text-ember"

  async function handleDownload() {
    try {
      const res = await fetch(ogUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "bear-offset.png"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-foreground">
        // SHARE YOUR RESULTS
      </p>

      {/* Card — content-fit, no forced aspect ratio */}
      <div className="bg-dark border border-[var(--glass-border)] rounded-xl p-5 sm:p-6">
        {/* Top row: hero number + label */}
        <div className="flex items-baseline gap-3 mb-1">
          <span className={`text-4xl sm:text-5xl font-display ${heroColor} leading-none`}>
            {isBullMode
              ? `+${formatPct(boostPct)}`
              : offsetPct >= 100
                ? "100%"
                : formatPct(offsetPct)}
          </span>
          <span className="text-xs font-mono text-muted-foreground/50 uppercase tracking-widest">
            {isBullMode ? "boost" : "recovered"}
          </span>
        </div>

        {/* Narrative explanation */}
        <p className="text-sm text-foreground/70 font-light mt-2 mb-4 max-w-lg leading-relaxed">
          {isBullMode ? (
            <>
              SOL rose {formatPct(Math.abs(priceChangePct))} — but staking earned an additional{" "}
              <span className="text-green-400 font-medium">+{formatSol(rewardsEarnedSol)} SOL</span>{" "}
              ({formatUsd(rewardsEarnedUsd)}) on top of price gains.
            </>
          ) : offsetPct >= 100 ? (
            <>
              SOL dropped {formatPct(Math.abs(priceChangePct))}, but staking rewards of{" "}
              <span className="text-green-400 font-medium">+{formatSol(rewardsEarnedSol)} SOL</span>{" "}
              ({formatUsd(rewardsEarnedUsd)}) more than covered the{" "}
              <span className="text-red-400">{formatUsd(Math.abs(usdDrawdown))}</span> drawdown.
            </>
          ) : (
            <>
              SOL dropped {formatPct(Math.abs(priceChangePct))} ({formatUsd(Math.abs(usdDrawdown))} loss),
              but staking earned{" "}
              <span className="text-green-400 font-medium">+{formatSol(rewardsEarnedSol)} SOL</span>{" "}
              ({formatUsd(rewardsEarnedUsd)}) — recovering {formatPct(offsetPct)} of the drawdown.
            </>
          )}
        </p>

        {/* Compact stat row */}
        <div className="flex gap-6 pt-3 border-t border-[var(--glass-border)]">
          <div className="font-mono text-[11px]">
            <span className="text-muted-foreground/50">Staked </span>
            <span className="text-foreground">{formatSol(stakedSol)} SOL</span>
          </div>
          <div className="font-mono text-[11px]">
            <span className="text-muted-foreground/50">Price </span>
            <span className={priceChangePct >= 0 ? "text-green-400" : "text-red-400"}>
              {priceChangePct >= 0 ? "+" : ""}{formatPct(priceChangePct)}
            </span>
          </div>
          <div className="font-mono text-[11px]">
            <span className="text-muted-foreground/50">Rewards </span>
            <span className="text-green-400">+{formatSol(rewardsEarnedSol)} SOL</span>
          </div>
        </div>

        {/* Footer branding */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--glass-border)]">
          <p className="text-[9px] font-mono text-muted-foreground/30">
            bear.phaselabs.io
          </p>
          <p className="text-[9px] font-mono text-muted-foreground/30">
            Powered by Phase
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)] text-foreground text-[13px] font-mono transition-all duration-150"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gold text-dark text-[13px] font-mono font-medium hover:bg-gold/90 transition-all duration-150"
        >
          <Share2 className="w-3.5 h-3.5" />
          Share on X
        </a>
      </div>
    </div>
  )
}
