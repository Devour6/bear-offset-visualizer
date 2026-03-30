"use client"

import { ArrowUpRight } from "lucide-react"

const PHASE_VALIDATOR_URL =
  "https://phase.cc/?utm_source=bear&utm_medium=cta&utm_campaign=stake"
const YIELD_URL =
  "https://jup.ag/swap/SOL-YIELD?utm_source=bear&utm_medium=cta&utm_campaign=yield"

interface CtaSectionProps {
  yieldApy: number
}

export function CtaSection({ yieldApy }: CtaSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="font-mono text-[13px] uppercase tracking-[0.05em] text-foreground">
        // START OFFSETTING
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Phase Validator */}
        <a
          href={PHASE_VALIDATOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-[var(--glass-bg-gold)] border border-[var(--glass-border-gold)] rounded-xl p-5 hover:bg-[rgba(252,225,132,0.12)] hover:border-[rgba(252,225,132,0.35)] transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-mono text-sm font-medium text-gold uppercase tracking-[0.05em]">
                Phase Validator
              </h3>
              <p className="font-mono text-[11px] text-gold/60 mt-0.5">
                Currently 0% commission
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gold/40 group-hover:text-gold transition-colors" />
          </div>
          <p className="text-[12px] text-muted-foreground font-light leading-relaxed">
            Stake SOL directly to Phase&apos;s validator with zero fees.
          </p>
          <div className="mt-4 w-full py-2 rounded-lg bg-gold/90 text-dark text-[12px] font-mono font-medium text-center group-hover:bg-gold transition-colors">
            Stake Now
          </div>
        </a>

        {/* $YIELD */}
        <a
          href={YIELD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-[var(--glass-bg-blue)] border border-[var(--glass-border-blue)] rounded-xl p-5 hover:bg-[rgba(128,208,255,0.12)] hover:border-[rgba(128,208,255,0.35)] transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-mono text-sm font-medium text-phase-blue uppercase tracking-[0.05em]">
                $YIELD
              </h3>
              <p className="font-mono text-[11px] text-phase-blue/60 mt-0.5">
                {yieldApy.toFixed(1)}% APY
              </p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-phase-blue/40 group-hover:text-phase-blue transition-colors" />
          </div>
          <p className="text-[12px] text-muted-foreground font-light leading-relaxed">
            Phase&apos;s liquid staking token — earn rewards while staying liquid.
          </p>
          <div className="mt-4 w-full py-2 rounded-lg bg-phase-blue/90 text-dark text-[12px] font-mono font-medium text-center group-hover:bg-phase-blue transition-colors">
            Get $YIELD
          </div>
        </a>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground/40 font-mono text-center leading-relaxed">
        Not financial advice. Staking rewards are taxable income. Past
        performance does not guarantee future results. Commission rate as of{" "}
        {new Date().toLocaleDateString("en-US")}. Subject to change. Verify at{" "}
        <a
          href="https://phase.cc/delegation"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground/60"
        >
          phase.cc/delegation
        </a>
        .
      </p>
    </div>
  )
}
