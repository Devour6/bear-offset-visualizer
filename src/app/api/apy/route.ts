import { NextResponse } from "next/server"

// Phase Delegation API — serves real APY data from on-chain calculations
const PHASE_API_BASE =
  process.env.PHASE_API_URL || "https://delegation-api.apps.ra.latentfree.llc"

interface LstEntry {
  mint: string
  name: string
  symbol: string
  image: string | null
  apy: number | null // basis points
  tvl: number | null
  scope: string
}

interface ApyCache {
  data: { yieldApy: number; phaseApy: number } | null
  timestamp: number
}

const cache: ApyCache = { data: null, timestamp: 0 }
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * GET /api/apy
 * Returns live APY data from the Phase Delegation API.
 * Response: { yieldApy: number, phaseApy: number } (decimals, e.g. 0.072 = 7.2%)
 */
export async function GET() {
  try {
    if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data, {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
        },
      })
    }

    // Fetch Phase LSTs — includes $YIELD with real APY
    const lstRes = await fetch(`${PHASE_API_BASE}/api/staking/lst/phase`, {
      next: { revalidate: 300 },
    })

    // Fetch overall Phase delegation APY
    const overviewRes = await fetch(`${PHASE_API_BASE}/api/staking/overview`, {
      next: { revalidate: 300 },
    })

    let yieldApy = 0.072 // fallback
    let phaseApy = 0.072 // fallback

    if (lstRes.ok) {
      const lsts: LstEntry[] = await lstRes.json()
      // Find $YIELD by symbol (case-insensitive)
      const yieldEntry = lsts.find(
        (l) => l.symbol?.toUpperCase() === "YIELD" || l.name?.toUpperCase().includes("YIELD")
      )
      if (yieldEntry?.apy) {
        yieldApy = yieldEntry.apy / 10000 // bps to decimal
      }
    }

    if (overviewRes.ok) {
      const overview: { phase_delegation_apy_bps: number } = await overviewRes.json()
      if (overview.phase_delegation_apy_bps) {
        phaseApy = overview.phase_delegation_apy_bps / 10000 // bps to decimal
      }
    }

    const result = { yieldApy, phaseApy }
    cache.data = result
    cache.timestamp = Date.now()

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      },
    })
  } catch (error) {
    console.error("Phase APY API error:", error)

    // Return cached data if available, else fallback
    if (cache.data) {
      return NextResponse.json(cache.data)
    }

    return NextResponse.json(
      { yieldApy: 0.072, phaseApy: 0.072 },
      { status: 200 } // Don't fail the UI — return fallback
    )
  }
}
