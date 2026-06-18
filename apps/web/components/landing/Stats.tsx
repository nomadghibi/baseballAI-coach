"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const STATS = [
  { value: "15+",  label: "Biomechanical Metrics", sub: "tracked per session" },
  { value: "< 5",  label: "Minutes to Results",    sub: "from upload to report" },
  { value: "100%", label: "Private & Secure",       sub: "no data sharing ever" },
];

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-navy-900 border-y border-white/[0.05]">
      <div className="max-w-5xl mx-auto px-6 py-0 grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            className="flex flex-col items-center text-center px-8 py-12 gap-1"
            initial={{ opacity: 0, y: 18 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.13, ease: "easeOut" }}
          >
            <span className="font-display font-extrabold text-[3.25rem] leading-none text-gradient-amber">
              {s.value}
            </span>
            <span className="font-semibold text-white text-[0.95rem] mt-1.5">{s.label}</span>
            <span className="text-slate-500 text-sm">{s.sub}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
