"use client"

import { Download, Share2 } from "lucide-react"
import { type OffsetResult, formatSol, formatPct } from "@/lib/calculations"

interface ShareCardProps {
  result: OffsetResult
  stakedSol: number
  entryPrice: number
  currentPrice: number
  entryDate: string
  providerName: string
  apy: number // decimal, e.g. 0.072
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
    priceChangePct,
  } = result

  // Build the share URL with params
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

  const heroText = isBullMode
    ? `Staking boosted my gains by ${formatPct(boostPct)}`
    : offsetPct >= 100
      ? "Staking fully offset the bear"
      : `Staking offset ${formatPct(offsetPct)} of the bear`

  const tweetText = encodeURIComponent(
    `${heroText} — powered by Phase\n\n${shareUrl}`
  )

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
    <div className="space-y-4">
      {/* Preview */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="aspect-[1200/630] bg-dark p-6 flex flex-col justify-between">
          {/* Top */}
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
              Bear Offset Visualizer
            </p>
            <p className="text-2xl sm:text-3xl font-display text-gold leading-tight">
              {isBullMode
                ? `+${formatPct(boostPct)}`
                : offsetPct >= 100
                  ? "100%"
                  : formatPct(offsetPct)}
            </p>
            <p className="text-sm text-foreground/80 mt-1 font-medium">
              {heroText}
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-xs font-mono">
            <div>
              <p className="text-muted-foreground mb-0.5">Staked</p>
              <p className="text-foreground">{formatSol(stakedSol)} SOL</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Price Change</p>
              <p
                className={
                  priceChangePct >= 0 ? "text-green-400" : "text-red-400"
                }
              >
                {priceChangePct >= 0 ? "+" : ""}
                {formatPct(priceChangePct)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Rewards</p>
              <p className="text-green-400">
                +{formatSol(rewardsEarnedSol)} SOL
              </p>
            </div>
          </div>

          {/* Bottom branding */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-muted-foreground/50">
              bear.phaselabs.io
            </p>
            <p className="text-[10px] font-mono text-muted-foreground/50">
              Powered by Phase
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-border bg-card hover:bg-card/80 text-foreground text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download Card
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg bg-gold text-dark text-sm font-semibold hover:bg-gold/90 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share on X
        </a>
      </div>
    </div>
  )
}
