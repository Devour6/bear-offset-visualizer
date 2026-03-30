"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { InputForm } from "@/components/input-form"
import { ResultCards } from "@/components/result-cards"
import { OffsetChart } from "@/components/offset-chart"
import { ShareCard } from "@/components/share-card"
import { CtaSection } from "@/components/cta-section"
import {
  calculateOffset,
  daysBetween,
  type OffsetResult,
} from "@/lib/calculations"
import { getProvider, updateProviderApy } from "@/lib/providers"

function BearOffsetApp() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Default date: March 1st 2026
  const defaultDateStr = "2026-03-01"

  // State from URL params or defaults
  const [stakedSol, setStakedSol] = useState(
    parseFloat(searchParams.get("sol") ?? "100")
  )
  const [entryDate, setEntryDate] = useState(
    searchParams.get("date") ?? defaultDateStr
  )
  const [entryPrice, setEntryPrice] = useState<number | null>(
    searchParams.get("price") ? parseFloat(searchParams.get("price")!) : null
  )
  const [providerId, setProviderId] = useState(
    searchParams.get("provider") ?? "phase"
  )
  const [customApy, setCustomApy] = useState(7.0)
  const [currentPrice, setCurrentPrice] = useState<number | null>(
    searchParams.get("current")
      ? parseFloat(searchParams.get("current")!)
      : null
  )
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true)
  const [liveYieldApy, setLiveYieldApy] = useState<number | null>(null)
  const [priceFetchKey, setPriceFetchKey] = useState(0)

  // Fetch current SOL price and live APY on mount
  useEffect(() => {
    async function fetchCurrentPrice() {
      try {
        const res = await fetch("/api/price")
        const data = await res.json()
        if (data.price) {
          setCurrentPrice(data.price)
        }
      } catch (err) {
        console.error("Failed to fetch current price:", err)
      } finally {
        setIsLoadingCurrent(false)
      }
    }

    async function fetchLiveApy() {
      try {
        const res = await fetch("/api/apy")
        const data = await res.json()
        if (data.yieldApy) {
          setLiveYieldApy(data.yieldApy * 100)
          updateProviderApy("yield", data.yieldApy)
        }
        if (data.phaseApy) {
          updateProviderApy("phase", data.phaseApy)
        }
      } catch (err) {
        console.error("Failed to fetch live APY:", err)
      }
    }

    fetchCurrentPrice()
    fetchLiveApy()
  }, [])

  // Fetch historical price when entry date changes
  useEffect(() => {
    if (!entryDate) return

    async function fetchHistoricalPrice() {
      setIsLoadingPrice(true)
      try {
        const res = await fetch(`/api/price?date=${entryDate}`)
        const data = await res.json()
        if (data.price) {
          setEntryPrice(data.price)
        }
      } catch (err) {
        console.error("Failed to fetch historical price:", err)
      } finally {
        setIsLoadingPrice(false)
      }
    }
    fetchHistoricalPrice()
  }, [entryDate, priceFetchKey])

  // Sync state to URL
  const syncUrl = useCallback(() => {
    const params = new URLSearchParams()
    params.set("sol", stakedSol.toString())
    params.set("date", entryDate)
    if (entryPrice !== null) params.set("price", entryPrice.toFixed(2))
    if (providerId !== "phase") params.set("provider", providerId)
    router.replace(`?${params.toString()}`, { scroll: false })
  }, [stakedSol, entryDate, entryPrice, providerId, router])

  useEffect(() => {
    const timer = setTimeout(syncUrl, 500)
    return () => clearTimeout(timer)
  }, [syncUrl])

  // Calculate result
  const provider = getProvider(providerId)
  const apy = providerId === "custom" ? customApy / 100 : provider.apy
  const daysStaked = daysBetween(new Date(entryDate), new Date())

  let result: OffsetResult | null = null
  if (entryPrice !== null && currentPrice !== null && stakedSol > 0) {
    result = calculateOffset({
      stakedSol,
      entryPrice,
      currentPrice,
      apy,
      daysStaked,
    })
  }

  const isLoading = isLoadingCurrent || isLoadingPrice

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-[var(--glass-border)]">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-display text-gold uppercase tracking-wide">
            Bear Offset Visualizer
          </h1>
          <p className="text-sm text-muted-foreground font-light mt-1">
            See how much staking could offset your losses when SOL drops
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Above the fold: 2-column layout on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Left: Inputs */}
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-6">
            <InputForm
              stakedSol={stakedSol}
              entryDate={entryDate}
              entryPrice={entryPrice}
              providerId={providerId}
              customApy={customApy}
              onStakedSolChange={setStakedSol}
              onEntryDateChange={setEntryDate}
              onEntryPriceChange={setEntryPrice}
              onProviderChange={setProviderId}
              onCustomApyChange={setCustomApy}
              isLoadingPrice={isLoadingPrice}
              onRefetchPrice={() => setPriceFetchKey((k) => k + 1)}
            />
          </div>

          {/* Right: Results */}
          <div className="min-h-[300px]">
            {isLoading && !result && (
              <div className="flex items-center justify-center h-[300px]">
                <div className="w-5 h-5 border-[1.5px] border-gold/30 border-t-gold rounded-full animate-spin" />
              </div>
            )}

            {result && (
              <ResultCards
                result={result}
                stakedSol={stakedSol}
                entryPrice={entryPrice!}
                providerName={provider.name}
              />
            )}
          </div>
        </div>

        {/* Below the fold: Chart, Share, CTAs */}
        {result && (
          <div className="flex flex-col gap-8 mt-8">
            <OffsetChart
              data={result.chartData}
              isBullMode={result.isBullMode}
              totalDrawdownUsd={result.usdDrawdown}
            />

            <ShareCard
              result={result}
              stakedSol={stakedSol}
              entryPrice={entryPrice!}
              currentPrice={currentPrice!}
              entryDate={entryDate}
              providerName={provider.name}
              apy={apy}
              daysStaked={daysStaked}
            />

            <CtaSection
              yieldApy={liveYieldApy ?? getProvider("yield").apy * 100}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] mt-12">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground/30 font-mono">
            bear.phaselabs.io
          </p>
          <a
            href="https://phase.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-muted-foreground/30 font-mono hover:text-muted-foreground/50 transition-colors"
          >
            Powered by Phase
          </a>
        </div>
      </footer>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-5 h-5 border-[1.5px] border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <BearOffsetApp />
    </Suspense>
  )
}
