import Link from "next/link";
import FadeIn from "./FadeIn";

const FREE = [
  "Unlimited athlete profiles",
  "Unlimited video uploads",
  "Full pose skeleton overlay",
  "5-phase pitch breakdown",
  "15+ biomechanical metrics",
  "Session-over-session progress tracking",
  "Coach notes per session",
  "Permanent data deletion",
];

const PRO = [
  "Everything in Free",
  "Team / multi-coach access",
  "AI coaching recommendation engine",
  "Video comparison — side by side",
  "Export reports as PDF",
  "Pitch velocity estimation",
  "Priority processing queue",
  "Email progress digest",
];

function Check({ color = "#F59E0B" }: { color?: string }) {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color }}>
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <section className="bg-navy-950 py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
            Simple pricing.{" "}
            <span className="text-gradient-amber">Free to start.</span>
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-lg mx-auto">
            No credit card required. No feature gates. Full access from day one.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {/* Free */}
          <FadeIn direction="right">
            <div className="relative glass-card p-8 flex flex-col gap-6 border-amber-400/20 overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/[0.06] rounded-full blur-3xl pointer-events-none" />

              <div>
                <span className="inline-block bg-amber-400/15 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-400/20 mb-3">
                  FREE
                </span>
                <div className="flex items-end gap-1">
                  <span className="font-display font-extrabold text-5xl text-white">$0</span>
                  <span className="text-slate-400 mb-1.5 text-sm">/month</span>
                </div>
                <p className="text-slate-400 text-sm mt-1.5">
                  Everything you need to analyze and improve.
                </p>
              </div>

              <ul className="flex flex-col gap-2 flex-1">
                {FREE.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="block bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold py-3 rounded-xl text-center transition-all duration-200 hover:-translate-y-px shadow-lg hover:shadow-amber-400/20"
              >
                Get Started Free
              </Link>
            </div>
          </FadeIn>

          {/* Pro — coming soon */}
          <FadeIn direction="left">
            <div className="relative glass-card p-8 flex flex-col gap-6 h-full">
              <div className="absolute inset-0 bg-navy-950/30 pointer-events-none rounded-2xl" />

              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-white/5 text-slate-400 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                    PRO
                  </span>
                  <span className="text-slate-600 text-xs font-medium">Coming Soon</span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="font-display font-extrabold text-5xl text-slate-500">$—</span>
                </div>
                <p className="text-slate-600 text-sm mt-1.5">
                  Advanced analytics and team features.
                </p>
              </div>

              <ul className="flex flex-col gap-2 flex-1 relative">
                {PRO.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <Check color="#475569" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="relative block w-full bg-white/[0.03] text-slate-600 font-bold py-3 rounded-xl text-center border border-white/[0.06] cursor-not-allowed"
              >
                Notify Me When Available
              </button>
            </div>
          </FadeIn>
        </div>

        <FadeIn className="text-center mt-8">
          <p className="text-slate-600 text-sm">
            Free plan stays free forever. No bait-and-switch.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
