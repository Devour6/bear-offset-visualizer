import { ImageResponse } from "next/og"

async function loadFont(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.arrayBuffer()
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const sol = parseFloat(searchParams.get("sol") ?? "100")
  const entryPrice = parseFloat(searchParams.get("price") ?? "130")
  const currentPrice = parseFloat(searchParams.get("current") ?? "87")
  const provider = searchParams.get("provider") ?? "Phase"

  // Calculate offset
  const priceChangePct = ((currentPrice - entryPrice) / entryPrice) * 100
  const daysStaked = parseInt(searchParams.get("days") ?? "180")
  const apy = parseFloat(searchParams.get("apy") ?? "0.072")
  const rewardsSol = sol * (Math.pow(1 + apy, daysStaked / 365) - 1)
  const rewardsUsd = rewardsSol * currentPrice
  const drawdown = Math.abs(sol * currentPrice - sol * entryPrice)
  const isBull = currentPrice >= entryPrice
  const offsetPct = isBull
    ? 0
    : drawdown > 0
      ? Math.min((rewardsUsd / drawdown) * 100, 100)
      : 0
  const boostPct = isBull
    ? (rewardsUsd / (sol * entryPrice)) * 100
    : 0

  const heroValue = isBull ? `+${boostPct.toFixed(1)}%` : `${offsetPct.toFixed(1)}%`
  const heroLabel = isBull
    ? "Staking boosted my gains"
    : offsetPct >= 100
      ? "Staking fully offset the bear"
      : "of the bear market offset by staking"

  const [audiowide, outfit] = await Promise.all([
    loadFont(
      "https://fonts.gstatic.com/s/audiowide/v22/l7gdbjpo0cum0ckerWCtkQ.ttf"
    ),
    loadFont(
      "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf"
    ),
  ])

  const element = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        backgroundColor: "#0F0E0C",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% 30%, rgba(252, 225, 132, 0.04) 0%, rgba(15, 14, 12, 0) 100%)",
        fontFamily: "Outfit",
        color: "#F3EED9",
        padding: "60px",
      }}
    >
      {/* Top section */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.15em",
            color: "rgba(243, 238, 217, 0.4)",
            textTransform: "uppercase",
            fontFamily: "Outfit",
            marginBottom: 20,
          }}
        >
          Offset by Phase
        </div>

        <div
          style={{
            fontSize: 96,
            fontFamily: "Audiowide",
            color: isBull ? "#22c55e" : "#fce184",
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          {heroValue}
        </div>

        <div
          style={{
            fontSize: 24,
            color: "rgba(243, 238, 217, 0.8)",
            fontFamily: "Outfit",
          }}
        >
          {heroLabel}
        </div>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 60,
          fontSize: 16,
          fontFamily: "Outfit",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ color: "rgba(243, 238, 217, 0.4)", fontSize: 13 }}>
            Staked
          </div>
          <div style={{ color: "#F3EED9" }}>{sol.toLocaleString()} SOL</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ color: "rgba(243, 238, 217, 0.4)", fontSize: 13 }}>
            Price Change
          </div>
          <div style={{ color: priceChangePct >= 0 ? "#22c55e" : "#ef4444" }}>
            {priceChangePct >= 0 ? "+" : ""}
            {priceChangePct.toFixed(1)}%
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ color: "rgba(243, 238, 217, 0.4)", fontSize: 13 }}>
            Rewards Earned
          </div>
          <div style={{ color: "#22c55e" }}>
            +{rewardsSol.toFixed(2)} SOL
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          color: "rgba(243, 238, 217, 0.25)",
          fontFamily: "Outfit",
        }}
      >
        <div>offset.phaselabs.io</div>
        <div>Powered by Phase</div>
      </div>
    </div>
  )

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
    fonts: [
      ...(audiowide
        ? [
            {
              name: "Audiowide",
              data: audiowide,
              weight: 400 as const,
              style: "normal" as const,
            },
          ]
        : []),
      ...(outfit
        ? [
            {
              name: "Outfit",
              data: outfit,
              weight: 400 as const,
              style: "normal" as const,
            },
          ]
        : []),
    ],
    headers: {
      "Cache-Control":
        "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
