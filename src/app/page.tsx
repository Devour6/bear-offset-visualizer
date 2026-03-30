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

  // Default date: 6 months ago
  const defaultDate = new Date()
  defaultDate.setMonth(defaultDate.getMonth() - 6)
  const defaultDateStr = defaultDate.toISOString().split("T")[0]

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
    searchParams.get("current") ? parseFloat(searchParams.get("current")!) : null
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
          setLiveYieldApy(data.yieldApy * 100) // decimal to percentage for display
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

  // Fetch historical price when entry date changes or when switching back from custom price
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
    // Debounce URL sync
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
      <header className="border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl sm:text-3xl font-display text-gold tracking-wide">
            Bear Offset Visualizer
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            How much has staking saved you?
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* Input Section */}
        <section>
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
        </section>

        {/* Results */}
        {isLoading && !result && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        {result && (
          <>
            {/* Result Cards */}
            <section>
              <ResultCards
                result={result}
                stakedSol={stakedSol}
                entryPrice={entryPrice!}
                providerName={provider.name}
              />
            </section>

            {/* Chart */}
            <section>
              <OffsetChart
                data={result.chartData}
                isBullMode={result.isBullMode}
              />
            </section>

            {/* Share Card */}
            <section>
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
            </section>

            {/* CTA Section */}
            <section>
              <CtaSection yieldApy={liveYieldApy ?? getProvider("yield").apy * 100} />
            </section>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/50 font-mono">
            bear.phaselabs.io
          </p>
          <a
            href="https://phase.cc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground/50 font-mono hover:text-muted-foreground transition-colors"
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
          <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <BearOffsetApp />
    </Suspense>
  )
}
