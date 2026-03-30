"use client"

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

      <div className="h-[260px] min-w-0 -ml-2">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="offsetGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={isBullMode ? CHART_COLORS.green : CHART_COLORS.gold}
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor={isBullMode ? CHART_COLORS.green : CHART_COLORS.gold}
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.red} stopOpacity={0.08} />
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
              tickFormatter={(val: number) => formatUsd(val)}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value, name) => [
                formatUsd(Number(value)),
                name === "portfolioValue"
                  ? "Without staking"
                  : "With staking",
              ]}
              labelStyle={{
                color: CHART_COLORS.muted,
                fontFamily: "IBM Plex Mono",
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="portfolioValue"
              stroke={CHART_COLORS.red}
              fill="url(#portfolioGradient)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: CHART_COLORS.red }}
            />
            <Area
              type="monotone"
              dataKey="portfolioWithRewards"
              stroke={isBullMode ? CHART_COLORS.green : CHART_COLORS.gold}
              fill="url(#offsetGradient)"
              strokeWidth={1.5}
              dot={false}
              activeDot={{
                r: 3,
                fill: isBullMode ? CHART_COLORS.green : CHART_COLORS.gold,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
