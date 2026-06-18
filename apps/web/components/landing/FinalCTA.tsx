import Link from "next/link";
import FadeIn from "./FadeIn";

export default function FinalCTA() {
  return (
    <section className="bg-navy-900 py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <FadeIn className="flex flex-col items-center gap-6">
          {/* Decorative dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ring-4 ring-amber-400/20 ring-offset-2 ring-offset-navy-900" />

          <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight">
            Ready to give your pitcher{" "}
            <span className="text-gradient-amber">an edge?</span>
          </h2>

          <p className="text-slate-400 text-lg max-w-lg">
            Join parents and coaches using AI-powered analysis to help young athletes
            reach their full potential — no expensive equipment required.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mt-1">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-400/25 hover:-translate-y-px text-[0.95rem]"
            >
              Get Started Free
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] px-8 py-3.5 rounded-xl transition-all duration-200 font-medium text-[0.95rem]"
            >
              Log In
            </Link>
          </div>

          <p className="text-slate-600 text-sm mt-1">
            Free to start · No credit card required
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
