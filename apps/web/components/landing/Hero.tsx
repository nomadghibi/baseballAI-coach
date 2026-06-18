"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import PitcherViz from "./PitcherViz";

const anim = (delay: number) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.21, 0.47, 0.32, 0.98] as const },
});

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-navy-950 flex items-center overflow-hidden">
      {/* Background radial */}
      <div
        className="absolute inset-0 opacity-[0.6]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 65% 40%, rgba(18,32,64,0.7) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Amber glow blob */}
      <div className="absolute top-[-10%] right-[15%] w-[500px] h-[500px] bg-amber-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[380px] h-[380px] bg-sky-500/[0.05] rounded-full blur-[90px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 w-full grid lg:grid-cols-2 gap-14 items-center">
        {/* LEFT */}
        <div className="flex flex-col gap-5">
          <motion.div {...anim(0)}>
            <span className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[11px] font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              AI-Powered Analysis
            </span>
          </motion.div>

          <motion.h1
            className="font-display font-extrabold text-5xl sm:text-[3.6rem] leading-[1.06] tracking-tight text-white"
            {...anim(0.08)}
          >
            Train Smarter.{" "}
            <span className="text-gradient-amber block sm:inline">Pitch Better.</span>
          </motion.h1>

          <motion.p className="text-slate-400 text-lg leading-relaxed max-w-[520px]" {...anim(0.16)}>
            Professional-grade biomechanical analysis for young pitchers. Upload a video and get
            pose overlay, phase-by-phase timing, and improvement metrics — in under 5 minutes.
          </motion.p>

          <motion.div className="flex flex-wrap gap-3 pt-1" {...anim(0.24)}>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-400/20 hover:-translate-y-px"
            >
              Get Started Free
              <svg
                className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] px-6 py-3 rounded-xl transition-all duration-200 font-medium"
            >
              See How It Works
            </a>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center gap-5 text-xs text-slate-500 pt-1"
            {...anim(0.34)}
          >
            {["Free to try", "No equipment needed", "100% private"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* RIGHT — viz */}
        <motion.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <PitcherViz />
        </motion.div>
      </div>

      {/* Scroll nudge */}
      <motion.div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <span className="text-[9px] uppercase tracking-[0.2em]">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
