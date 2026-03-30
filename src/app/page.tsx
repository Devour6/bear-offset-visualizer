"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { InputForm } from "@/components/input-form"
import { ResultCards } from "@/components/result-cards"
import { MissedRewards } from "@/components/missed-rewards"
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

  const defaultDateStr = "2026-03-01"

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

  useEffect(() => {
    async function fetchCurrentPrice() {
      try {
        const res = await fetch("/api/price")
        const data = await res.json()
        if (data.price) setCurrentPrice(data.price)
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
        if (data.phaseApy) updateProviderApy("phase", data.phaseApy)
      } catch (err) {
        console.error("Failed to fetch live APY:", err)
      }
    }

    fetchCurrentPrice()
    fetchLiveApy()
  }, [])

  useEffect(() => {
    if (!entryDate) return
    async function fetchHistoricalPrice() {
      setIsLoadingPrice(true)
      try {
        const res = await fetch(`/api/price?date=${entryDate}`)
        const data = await res.json()
        if (data.price) setEntryPrice(data.price)
      } catch (err) {
        console.error("Failed to fetch historical price:", err)
      } finally {
        setIsLoadingPrice(false)
      }
    }
    fetchHistoricalPrice()
  }, [entryDate, priceFetchKey])

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
        <div className="max-w-5xl mx-auto px-6 py-5">
          <h1 className="text-xl sm:text-2xl font-display text-gold uppercase tracking-wide">
            Bear Offset Visualizer
          </h1>
          <p className="text-[13px] text-muted-foreground/60 font-light mt-0.5">
            See how staking rewards cushion your losses when SOL drops
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* 2-column: inputs left, result right */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-5">
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

          <div className="min-h-[200px]">
            {isLoading && !result && (
              <div className="flex items-center justify-center h-[200px]">
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

        {/* Below fold — tight vertical stack */}
        {result && (
          <div className="flex flex-col gap-5 mt-6">
            <MissedRewards
              stakedSol={stakedSol}
              currentPrice={currentPrice!}
              apy={apy}
              providerName={provider.name}
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

      <footer className="border-t border-[var(--glass-border)] mt-8">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
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
