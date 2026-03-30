import { NextResponse } from "next/server"

const COINGECKO_BASE = "https://api.coingecko.com/api/v3"

interface PriceCache {
  current: { price: number; timestamp: number } | null
  historical: Map<string, { price: number; timestamp: number }>
}

const cache: PriceCache = {
  current: null,
  historical: new Map(),
}

const CURRENT_TTL = 60 * 60 * 1000 // 1 hour
const HISTORICAL_TTL = 24 * 60 * 60 * 1000 // 24 hours (immutable data)

async function fetchCurrentPrice(): Promise<number> {
  if (cache.current && Date.now() - cache.current.timestamp < CURRENT_TTL) {
    return cache.current.price
  }

  const res = await fetch(
    `${COINGECKO_BASE}/simple/price?ids=solana&vs_currencies=usd`,
    { next: { revalidate: 3600 } }
  )

  if (!res.ok) {
    if (cache.current) return cache.current.price
    throw new Error(`CoinGecko API error: ${res.status}`)
  }

  const data = await res.json()
  const price = data.solana.usd

  cache.current = { price, timestamp: Date.now() }
  return price
}

async function fetchHistoricalPrice(date: string): Promise<number> {
  // date format: DD-MM-YYYY (CoinGecko format)
  const cached = cache.historical.get(date)
  if (cached && Date.now() - cached.timestamp < HISTORICAL_TTL) {
    return cached.price
  }

  const res = await fetch(
    `${COINGECKO_BASE}/coins/solana/history?date=${date}&localization=false`,
    { next: { revalidate: 86400 } }
  )

  if (!res.ok) {
    if (cached) return cached.price
    throw new Error(`CoinGecko API error: ${res.status}`)
  }

  const data = await res.json()
  const price = data.market_data?.current_price?.usd

  if (!price) {
    throw new Error(`No price data for date: ${date}`)
  }

  cache.historical.set(date, { price, timestamp: Date.now() })
  return price
}

/**
 * GET /api/price
 * Query params:
 *   - (none): returns current SOL price
 *   - date=YYYY-MM-DD: returns historical SOL price for that date
 *
 * For recent dates (within last 2 days) or future dates, falls back to current price
 * since CoinGecko may not have historical data yet.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")

    if (dateParam) {
      // Check if the date is too recent or in the future — CoinGecko won't have data
      const requestedDate = new Date(dateParam + "T00:00:00Z")
      const now = new Date()
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

      if (requestedDate > twoDaysAgo) {
        // Date is too recent or in the future — use current price
        const price = await fetchCurrentPrice()
        return NextResponse.json(
          { price, date: dateParam, source: "current" },
          {
            headers: {
              "Cache-Control":
                "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
            },
          }
        )
      }

      // Convert YYYY-MM-DD to DD-MM-YYYY for CoinGecko
      const [year, month, day] = dateParam.split("-")
      const cgDate = `${day}-${month}-${year}`

      try {
        const price = await fetchHistoricalPrice(cgDate)
        return NextResponse.json(
          { price, date: dateParam },
          {
            headers: {
              "Cache-Control":
                "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
            },
          }
        )
      } catch {
        // If CoinGecko fails for this date, fall back to current price
        const price = await fetchCurrentPrice()
        return NextResponse.json(
          { price, date: dateParam, source: "current_fallback" },
          {
            headers: {
              "Cache-Control":
                "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
            },
          }
        )
      }
    }

    const price = await fetchCurrentPrice()
    return NextResponse.json(
      { price },
      {
        headers: {
          "Cache-Control":
            "public, max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    )
  } catch (error) {
    console.error("Price API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch price data" },
      { status: 500 }
    )
  }
}
