"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { CHART_COLORS, CHART_TOOLTIP_STYLE, AXIS_PROPS, GRID_PROPS } from "@/lib/chart-config"
import { type ChartDataPoint, formatUsd } from "@/lib/calculations"

interface OffsetChartProps {
  data: ChartDataPoint[]
  isBullMode: boolean
}

export function OffsetChart({ data, isBullMode }: OffsetChartProps) {
  if (data.length === 0) return null

  // Calculate Y-axis domain zoomed to data range so the gap between lines is visible
  const { yMin, yMax } = useMemo(() => {
    let min = Infinity
    let max = -Infinity
    for (const point of data) {
      min = Math.min(min, point.portfolioValue, point.portfolioWithRewards)
      max = Math.max(max, point.portfolioValue, point.portfolioWithRewards)
    }
    const range = max - min
    // Add 15% padding above and below; if range is tiny, show ±2% of the value
    const padding = range > 0 ? range * 0.15 : max * 0.02
    return {
      yMin: Math.max(0, Math.floor((min - padding) / 10) * 10),
      yMax: Math.ceil((max + padding) / 10) * 10,
    }
  }, [data])

  const rewardsColor = isBullMode ? CHART_COLORS.green : CHART_COLORS.gold

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-foreground">
          // PORTFOLIO OVER TIME
        </p>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-[2px] bg-red-400 rounded-full" />
            <span className="text-muted-foreground/70">Without staking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3 h-[2px] rounded-full ${
                isBullMode ? "bg-green-400" : "bg-gold"
              }`}
            />
            <span className="text-muted-foreground/70">With staking</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] min-w-0 -ml-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="rewardsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={rewardsColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={rewardsColor} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.red} stopOpacity={0.1} />
                <stop offset="100%" stopColor={CHART_COLORS.red} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis
              dataKey="date"
              {...AXIS_PROPS}
              interval="preserveStartEnd"
            />
            <YAxis
              {...AXIS_PROPS}
              domain={[yMin, yMax]}
              tickFormatter={(val: number) => formatUsd(val)}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value, name) => [
                `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                name === "portfolioValue" ? "Without staking" : "With staking",
              ]}
              labelStyle={{
                color: CHART_COLORS.muted,
                fontFamily: "IBM Plex Mono",
                fontSize: 11,
              }}
            />
            {/* Base portfolio line (without staking) — drawn first, behind */}
            <Area
              type="monotone"
              dataKey="portfolioValue"
              stroke={CHART_COLORS.red}
              fill="url(#baseGradient)"
              strokeWidth={1.5}
              strokeDasharray="4 2"
              dot={false}
              activeDot={{ r: 3, fill: CHART_COLORS.red }}
            />
            {/* Staking line — drawn on top with solid fill to show the rewards gap */}
            <Area
              type="monotone"
              dataKey="portfolioWithRewards"
              stroke={rewardsColor}
              fill="url(#rewardsGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 3, fill: rewardsColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
