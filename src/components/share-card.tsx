"use client"

import { Download, Share2 } from "lucide-react"
import { type OffsetResult, formatPct } from "@/lib/calculations"

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
  const { offsetPct, isBullMode, boostPct } = result

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
    ? `Staking to ${providerName} would have boosted my SOL gains by ${formatPct(boostPct)}`
    : offsetPct >= 100
      ? `Staking to ${providerName} would have fully covered my SOL losses`
      : `Staking to ${providerName} would have recovered ${formatPct(offsetPct)} of my SOL losses`

  const tweetText = encodeURIComponent(
    `${heroText} — powered by @phase_\n\n${shareUrl}`
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
  )
}
