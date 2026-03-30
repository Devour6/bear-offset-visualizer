export const CHART_COLORS = {
  cream: "#F3EED9",
  gold: "#fce184",
  red: "#ef4444",
  green: "#22c55e",
  muted: "#666",
  border: "#333",
  grid: "#222",
  tooltipBg: "#1a1916",
  blue: "#80d0ff",
} as const

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: CHART_COLORS.tooltipBg,
  borderColor: CHART_COLORS.border,
  borderRadius: "8px",
  fontFamily: "IBM Plex Mono",
  fontSize: "12px",
  color: CHART_COLORS.cream,
}

export const AXIS_PROPS = {
  stroke: CHART_COLORS.border,
  fontSize: 10,
  tickLine: false,
  axisLine: false,
  fontFamily: "IBM Plex Mono",
}

export const GRID_PROPS = {
  strokeDasharray: "3 3",
  vertical: false,
  stroke: CHART_COLORS.grid,
}
