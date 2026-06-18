"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";

const FAQS = [
  {
    q: "What type of video do I need to upload?",
    a: "Any smartphone video works. For best results, film from the side (3rd base side for right-handers) at eye level, 20–30 feet from the mound. MP4 or MOV format, up to 500MB. A single pitch per clip gives the cleanest analysis.",
  },
  {
    q: "How long does the AI analysis take?",
    a: "Typically 3–5 minutes from upload to results. The pipeline processes every frame — detecting 17 body landmarks, identifying pitch phases, and calculating all biomechanical metrics.",
  },
  {
    q: "What biomechanical metrics does it measure?",
    a: "15+ metrics including arm angle at release, hip-to-shoulder separation, stride length as % of height, trunk tilt at release, hip rotation velocity, knee flexion at foot strike, and more — all broken down by pitch phase.",
  },
  {
    q: "Is my athlete's data private?",
    a: "Yes, fully. Videos and analysis data are never shared with third parties, never used to train external models, and never made public. You can delete any video, session, or profile permanently at any time.",
  },
  {
    q: "How many athletes can I track?",
    a: "Create as many athlete profiles as you need. Each profile maintains its own session history, progress charts, and coaching notes independently. There's no per-athlete limit.",
  },
  {
    q: "Does it work for all ages and skill levels?",
    a: "Yes. The pose detection works for any pitcher who can be clearly filmed — from rec league to varsity. The metrics and feedback scale to all skill levels and are most useful for athletes 8U and up.",
  },
  {
    q: "Do I need any special camera or equipment?",
    a: "No. A standard smartphone is all you need. Rear cameras on modern phones capture enough detail for accurate pose detection. A tripod helps keep framing consistent across sessions.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-navy-900 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">FAQ</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
            Common questions
          </h2>
          <p className="text-slate-400 text-lg mt-4">
            Everything you need to know before getting started.
          </p>
        </FadeIn>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.035}>
              <div
                className={`glass-card transition-all duration-200 overflow-hidden ${
                  open === i ? "border-white/[0.1]" : ""
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
                >
                  <span className="font-semibold text-white text-[0.92rem] leading-snug pt-0.5">
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: open === i ? 45 : 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex-shrink-0 mt-0.5 text-amber-400"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.22, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-400 text-sm leading-relaxed px-5 pb-5 border-t border-white/[0.05] pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
