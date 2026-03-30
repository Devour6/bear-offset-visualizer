"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { CHART_COLORS, CHART_TOOLTIP_STYLE, AXIS_PROPS, GRID_PROPS } from "@/lib/chart-config"
import { type ChartDataPoint, formatUsd } from "@/lib/calculations"

interface OffsetChartProps {
  data: ChartDataPoint[]
  isBullMode: boolean
  totalDrawdownUsd?: number
}

/**
 * Redesigned chart: shows cumulative staking rewards growing over time
 * with a horizontal reference line at the total drawdown amount.
 *
 * This is far more readable than two overlapping portfolio lines
 * where the gap is invisible at scale.
 */
export function OffsetChart({ data, isBullMode, totalDrawdownUsd }: OffsetChartProps) {
  if (data.length === 0) return null

  // Transform data: extract just cumulative rewards in USD
  const rewardsData = useMemo(() => {
    return data.map((point) => ({
      date: point.date,
      day: point.day,
      rewards: Math.round((point.portfolioWithRewards - point.portfolioValue) * 100) / 100,
    }))
  }, [data])

  const maxRewards = useMemo(() => {
    return Math.max(...rewardsData.map((d) => d.rewards), 0)
  }, [rewardsData])

  // Y-axis domain: show from 0 to max(drawdown, rewards) + padding
  const yMax = useMemo(() => {
    const absDrawdown = Math.abs(totalDrawdownUsd ?? 0)
    const ceiling = Math.max(absDrawdown, maxRewards) * 1.2
    return Math.max(ceiling, 10) // minimum $10 scale
  }, [totalDrawdownUsd, maxRewards])

  const rewardsColor = isBullMode ? CHART_COLORS.green : CHART_COLORS.gold
  const absDrawdown = Math.abs(totalDrawdownUsd ?? 0)

  return (
    <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-foreground">
          // STAKING REWARDS VS LOSSES
        </p>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3 h-[2px] rounded-full ${
                isBullMode ? "bg-green-400" : "bg-gold"
              }`}
            />
            <span className="text-muted-foreground/70">Rewards earned</span>
          </div>
          {!isBullMode && absDrawdown > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-[2px] bg-red-400 rounded-full opacity-60" />
              <span className="text-muted-foreground/70">Total loss</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[300px] min-w-0 -ml-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart
            data={rewardsData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="rewardsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={rewardsColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={rewardsColor} stopOpacity={0.05} />
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
              domain={[0, yMax]}
              tickFormatter={(val: number) => formatUsd(val)}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value, name) => [
                `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "Rewards earned",
              ]}
              labelStyle={{
                color: CHART_COLORS.muted,
                fontFamily: "IBM Plex Mono",
                fontSize: 11,
              }}
            />
            {/* Horizontal reference line showing total drawdown */}
            {!isBullMode && absDrawdown > 0 && (
              <ReferenceLine
                y={absDrawdown}
                stroke={CHART_COLORS.red}
                strokeDasharray="6 4"
                strokeOpacity={0.6}
                label={{
                  value: `Loss: ${formatUsd(absDrawdown)}`,
                  position: "right",
                  fill: CHART_COLORS.red,
                  fontSize: 10,
                  fontFamily: "IBM Plex Mono",
                }}
              />
            )}
            {/* Cumulative rewards area — fills from bottom, clear and readable */}
            <Area
              type="monotone"
              dataKey="rewards"
              stroke={rewardsColor}
              fill="url(#rewardsGradient)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, fill: rewardsColor, stroke: "#0f0c0e", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Inline context below chart */}
      {!isBullMode && absDrawdown > 0 && maxRewards > 0 && (
        <p className="mt-4 text-[11px] font-mono text-muted-foreground/60 text-center">
          {maxRewards >= absDrawdown
            ? "Staking rewards have fully offset the price decline."
            : `Rewards have covered ${formatUsd(maxRewards)} of the ${formatUsd(absDrawdown)} loss — ${((maxRewards / absDrawdown) * 100).toFixed(1)}% recovered so far.`}
        </p>
      )}
      {isBullMode && maxRewards > 0 && (
        <p className="mt-4 text-[11px] font-mono text-muted-foreground/60 text-center">
          Staking rewards added {formatUsd(maxRewards)} on top of price gains.
        </p>
      )}
    </div>
  )
}
