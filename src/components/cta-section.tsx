"use client"

import { ArrowUpRight } from "lucide-react"

// Placeholder URLs — Brandon to confirm
const PHASE_VALIDATOR_URL =
  "https://phase.cc/?utm_source=bear&utm_medium=cta&utm_campaign=stake"
const YIELD_URL =
  "https://jup.ag/swap/SOL-YIELD?utm_source=bear&utm_medium=cta&utm_campaign=yield"

interface CtaSectionProps {
  yieldApy: number // e.g. 7.2
}

export function CtaSection({ yieldApy }: CtaSectionProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
        Start Offsetting
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Phase Validator CTA */}
        <a
          href={PHASE_VALIDATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative rounded-xl border-2 border-gold/30 bg-card p-5 hover:border-gold/60 hover:bg-gold/5 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Phase Validator
              </h3>
              <p className="text-sm text-gold font-mono">
                Currently 0% commission
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gold opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-muted-foreground">
            Stake SOL directly to Phase&apos;s validator with zero fees.
          </p>
          <div className="mt-4 w-full py-2.5 rounded-lg bg-gold text-dark text-sm font-semibold text-center group-hover:bg-gold/90 transition-colors">
            Stake Now
          </div>
        </a>

        {/* $YIELD CTA */}
        <a
          href={YIELD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative rounded-xl border-2 border-phase-blue/30 bg-card p-5 hover:border-phase-blue/60 hover:bg-phase-blue/5 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">$YIELD</h3>
              <p className="text-sm text-phase-blue font-mono">
                {yieldApy.toFixed(1)}% APY
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-phase-blue opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-xs text-muted-foreground">
            Get Phase&apos;s liquid staking token — earn rewards while staying
            liquid.
          </p>
          <div className="mt-4 w-full py-2.5 rounded-lg bg-phase-blue text-dark text-sm font-semibold text-center group-hover:bg-phase-blue/90 transition-colors">
            Get $YIELD
          </div>
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/50 font-mono text-center">
        Not financial advice. Staking rewards are taxable income. Past
        performance does not guarantee future results. Commission rate as of{" "}
        {new Date().toLocaleDateString("en-US")}. Subject to change. Verify at{" "}
        <a href="https://phase.cc/delegation" target="_blank" rel="noopener noreferrer" className="underline hover:text-muted-foreground/70">phase.cc/delegation</a>.
      </p>
    </div>
  )
}
