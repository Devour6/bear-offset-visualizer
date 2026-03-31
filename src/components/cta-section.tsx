"use client"

const PHASE_VALIDATOR_URL =
  "https://phase.cc/?utm_source=offset&utm_medium=cta&utm_campaign=stake"
const YIELD_URL =
  "https://jup.ag/swap/SOL-YIELD?utm_source=offset&utm_medium=cta&utm_campaign=yield"

interface CtaSectionProps {
  yieldApy: number
}

export function CtaSection({ yieldApy }: CtaSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <a
        href={PHASE_VALIDATOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gold text-dark text-sm font-medium hover:bg-gold/90 transition-colors"
      >
        <span>Stake to Phase</span>
        <span className="text-dark/50">0% fee</span>
      </a>
      <a
        href={YIELD_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-phase-blue text-dark text-sm font-medium hover:bg-phase-blue/90 transition-colors"
      >
        <span>Get $YIELD</span>
        <span className="text-dark/50">{yieldApy.toFixed(1)}% APY</span>
      </a>
    </div>
  )
}
