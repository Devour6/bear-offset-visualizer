"use client"

const PHASE_VALIDATOR_URL =
  "https://phase.cc/?utm_source=bear&utm_medium=cta&utm_campaign=stake"
const YIELD_URL =
  "https://jup.ag/swap/SOL-YIELD?utm_source=bear&utm_medium=cta&utm_campaign=yield"

interface CtaSectionProps {
  yieldApy: number
}

export function CtaSection({ yieldApy }: CtaSectionProps) {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a
          href={PHASE_VALIDATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-gold text-dark font-mono text-[13px] font-medium hover:bg-gold/90 transition-colors"
        >
          <span>Stake to Phase Validator</span>
          <span className="text-dark/60 text-[11px]">0% fee</span>
        </a>
        <a
          href={YIELD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-5 py-3.5 rounded-xl bg-phase-blue text-dark font-mono text-[13px] font-medium hover:bg-phase-blue/90 transition-colors"
        >
          <span>Get $YIELD</span>
          <span className="text-dark/60 text-[11px]">{yieldApy.toFixed(1)}% APY</span>
        </a>
      </div>
      <p className="text-[10px] text-muted-foreground/30 font-mono text-center mt-3 leading-relaxed">
        Not financial advice. Past performance does not guarantee future results.
      </p>
    </div>
  )
}
