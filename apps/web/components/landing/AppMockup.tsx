"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "./FadeIn";

type Tab = "analysis" | "phases" | "progress";

const TABS: { id: Tab; label: string }[] = [
  { id: "analysis", label: "Pose Analysis" },
  { id: "phases",   label: "Phase Breakdown" },
  { id: "progress", label: "Progress" },
];

const METRICS = [
  { label: "Arm Angle",     value: "87°",   score: 87, color: "#F59E0B" },
  { label: "Hip Rotation",  value: "94°/s", score: 78, color: "#38BDF8" },
  { label: "Stride Length", value: "68%",   score: 82, color: "#A3E635" },
  { label: "Trunk Tilt",    value: "12°",   score: 91, color: "#F59E0B" },
  { label: "Shoulder Sep.", value: "42°",   score: 74, color: "#F472B6" },
];

const PHASES = [
  { name: "Setup",    dur: "0.32s", color: "#38BDF8", pct: 18 },
  { name: "Leg Kick", dur: "0.44s", color: "#F59E0B", pct: 24 },
  { name: "Stride",   dur: "0.28s", color: "#A3E635", pct: 18 },
  { name: "Release",  dur: "0.18s", color: "#F472B6", pct: 14 },
  { name: "Follow",   dur: "0.38s", color: "#8B5CF6", pct: 26 },
];

const SESSIONS = [
  { date: "May 24", score: 72 },
  { date: "May 31", score: 75 },
  { date: "Jun 7",  score: 79 },
  { date: "Jun 14", score: 83 },
  { date: "Jun 18", score: 87 },
];

/* ── Mini skeleton joints (scaled for 240×270 view) ── */
const J: Record<string, [number, number]> = {
  head:      [120, 36],
  neck:      [120, 53],
  lShoulder: [96,  70],
  rShoulder: [144, 70],
  lElbow:    [74,  97],
  rElbow:    [163, 50],
  lWrist:    [60,  113],
  rWrist:    [178, 32],
  hipC:      [119, 130],
  lHip:      [106, 130],
  rHip:      [133, 130],
  lKnee:     [100, 108],
  lAnkle:    [103, 133],
  rKnee:     [137, 174],
  rAnkle:    [137, 216],
};

const SKEL_LINES: [string, string][] = [
  ["neck","lShoulder"], ["neck","rShoulder"],
  ["lShoulder","lElbow"], ["lElbow","lWrist"],
  ["rShoulder","rElbow"], ["rElbow","rWrist"],
  ["neck","hipC"],
  ["lShoulder","lHip"], ["rShoulder","rHip"],
  ["lHip","rHip"],
  ["lHip","lKnee"], ["lKnee","lAnkle"],
  ["rHip","rKnee"], ["rKnee","rAnkle"],
];

function AnalysisTab() {
  return (
    <div className="flex gap-0 h-full">
      {/* Left: video / skeleton area */}
      <div className="flex-[1.4] bg-[#070D1A] flex flex-col relative border-r border-white/[0.05]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase">Release</span>
          </div>
          <span className="text-slate-600 text-[10px]">Frame 42 / 120</span>
        </div>

        {/* Skeleton */}
        <div className="flex-1 flex items-center justify-center">
          <svg viewBox="0 0 240 240" className="w-full max-w-[200px]">
            <defs>
              <filter id="mini-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {SKEL_LINES.map(([a, b]) => (
              <line
                key={`${a}-${b}`}
                x1={J[a][0]} y1={J[a][1]}
                x2={J[b][0]} y2={J[b][1]}
                stroke="#F59E0B" strokeOpacity={0.35} strokeWidth={1.5} strokeLinecap="round"
              />
            ))}
            <circle cx={J.head[0]} cy={J.head[1]} r={13} fill="none" stroke="#38BDF8" strokeWidth={2} opacity={0.8} filter="url(#mini-glow)" />
            {Object.entries(J).filter(([k]) => k !== "head").map(([key, [cx, cy]]) => (
              <circle
                key={key}
                cx={cx} cy={cy}
                r={["lShoulder","rShoulder","lHip","rHip"].includes(key) ? 4.5 : 3.5}
                fill={["rElbow","rWrist","lKnee"].includes(key) ? "#FBBF24" : "#F59E0B"}
                filter="url(#mini-glow)"
              />
            ))}
            {/* Ball glow */}
            <circle cx={J.rWrist[0]} cy={J.rWrist[1]} r={7} fill="#F59E0B" opacity={0.12} filter="url(#mini-glow)" />
            <circle cx={J.rWrist[0]} cy={J.rWrist[1]} r={3.5} fill="#FBBF24" />
          </svg>
        </div>

        {/* Scrubber */}
        <div className="px-4 pb-3">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: "35%" }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>0:00</span><span>0:04</span>
          </div>
        </div>
      </div>

      {/* Right: metrics panel */}
      <div className="flex-1 flex flex-col px-4 py-3 gap-3 min-w-0">
        {/* Overall score */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-[11px]">Overall Score</span>
          <span className="font-display font-bold text-2xl text-gradient-amber">87</span>
        </div>
        <div className="h-px bg-white/5" />

        {/* Metrics list */}
        <div className="flex flex-col gap-2.5">
          {METRICS.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-500 text-[10px]">{m.label}</span>
                <span className="font-semibold text-white text-[11px]">{m.value}</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${m.score}%`, backgroundColor: m.color, opacity: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="h-px bg-white/5" />
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          17 landmarks tracked · 94% confidence
        </div>
      </div>
    </div>
  );
}

function PhasesTab() {
  const [active, setActive] = useState(3); // Release
  const ph = PHASES[active];

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Timeline bar */}
      <div>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2">Pitch Timeline</p>
        <div className="flex gap-0.5 h-8 rounded-lg overflow-hidden">
          {PHASES.map((p, i) => (
            <button
              key={p.name}
              onClick={() => setActive(i)}
              className="flex-1 flex items-center justify-center transition-all duration-150"
              style={{
                flex: p.pct,
                backgroundColor: i === active ? p.color : `${p.color}28`,
                borderBottom: i === active ? `2px solid ${p.color}` : "none",
              }}
            >
              <span
                className="text-[8px] font-bold hidden sm:block"
                style={{ color: i === active ? "#070D1A" : p.color }}
              >
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Phase timing labels */}
      <div className="flex gap-1">
        {PHASES.map((p, i) => (
          <div key={p.name} className="flex-1 text-center" style={{ flex: p.pct }}>
            <p className="text-[8px]" style={{ color: p.color }}>{p.dur}</p>
          </div>
        ))}
      </div>

      {/* Selected phase detail */}
      <div className="flex-1 glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: ph.color }}
          />
          <span className="font-semibold text-white text-sm">{ph.name} Phase</span>
          <span className="ml-auto text-xs" style={{ color: ph.color }}>{ph.dur}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Duration", value: ph.dur },
            { label: "Frame count", value: `${Math.round(parseFloat(ph.dur) * 30)} frames` },
            { label: "Sequence", value: `${active + 1} of 5` },
            { label: "Timing", value: active <= 2 ? "On track" : "Optimal" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] rounded-lg p-2">
              <p className="text-slate-500 text-[9px] uppercase tracking-wide">{label}</p>
              <p className="text-white text-[11px] font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        <p className="text-slate-400 text-xs leading-relaxed">
          {active === 0 && "Initial stance and grip. Focus on balance and consistent starting position."}
          {active === 1 && "Hip loading phase. Drive through the hip rotation to build momentum for delivery."}
          {active === 2 && "Forward stride toward the plate. Stride length at 68% of height — within optimal range."}
          {active === 3 && "Ball release point. Arm angle of 87° detected — strong position for arm health and velocity."}
          {active === 4 && "Deceleration and finish. Proper follow-through protects the shoulder and elbow."}
        </p>
      </div>
    </div>
  );
}

function ProgressTab() {
  const maxScore = 100;
  const minScore = 60;
  const range = maxScore - minScore;
  const w = 100 / (SESSIONS.length - 1);

  const points = SESSIONS.map((s, i) => ({
    x: i * w,
    y: 100 - ((s.score - minScore) / range) * 100,
  }));

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} 100 L 0 100 Z`;

  return (
    <div className="flex flex-col h-full p-4 gap-3">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-xs font-medium">Overall Score — Last 5 Sessions</p>
        <span className="text-emerald-400 text-xs font-bold">+15 pts ↑</span>
      </div>

      {/* Chart */}
      <div className="relative h-28">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="area-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[25, 50, 75].map((y) => (
            <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))}
          {/* Area fill */}
          <path d={areaD} fill="url(#area-grad)" />
          {/* Line */}
          <path d={pathD} fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Dots */}
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 2.5 : 1.8}
              fill={i === points.length - 1 ? "#FBBF24" : "#F59E0B"} />
          ))}
        </svg>
        {/* Y labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none">
          <span className="text-[8px] text-slate-600">100</span>
          <span className="text-[8px] text-slate-600">60</span>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* Sessions list */}
      <div className="flex flex-col gap-1.5 overflow-auto">
        {[...SESSIONS].reverse().map((s, i) => (
          <div key={s.date} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
            <span className="text-slate-400 text-[11px]">{s.date}</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full opacity-60" style={{ width: `${s.score}%` }} />
              </div>
              <span className="text-white text-[11px] font-semibold w-6 text-right">{s.score}</span>
              {i < SESSIONS.length - 1 && (
                <span className="text-emerald-400 text-[9px] w-6">
                  +{s.score - SESSIONS[SESSIONS.length - 2 - i].score}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppMockup() {
  const [tab, setTab] = useState<Tab>("analysis");

  return (
    <section className="bg-navy-950 py-24 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-12">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Product Preview</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
            See it in action
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto">
            Every upload gives you pose overlay, phase breakdown, and progress tracking — all in one place.
          </p>
        </FadeIn>

        <FadeIn delay={0.1}>
          {/* Browser chrome */}
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/60">
            {/* Window bar */}
            <div className="bg-navy-900 px-4 py-3 flex items-center gap-3 border-b border-white/[0.06]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
              </div>
              <div className="flex-1 bg-navy-800 rounded-md h-6 flex items-center px-3 gap-1.5 max-w-xs mx-auto">
                <svg className="w-3 h-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-slate-500 text-[10px]">app.baseballaicoach.com/sessions/247</span>
              </div>
            </div>

            {/* App chrome: sidebar + main */}
            <div className="flex bg-navy-800" style={{ minHeight: 380 }}>
              {/* Sidebar */}
              <div className="w-12 sm:w-44 bg-navy-900 border-r border-white/[0.05] flex flex-col py-3 gap-1 flex-shrink-0">
                {[
                  { label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                  { label: "Athletes", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
                  { label: "Sessions", icon: "M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", active: true },
                  { label: "Progress", icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" },
                ].map(({ label, icon, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-lg cursor-pointer ${
                      active
                        ? "bg-amber-400/10 text-amber-400"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"
                    }`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                    </svg>
                    <span className="text-[11px] font-medium hidden sm:block">{label}</span>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Page header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <div>
                    <p className="text-white text-sm font-semibold">Jun 18 Session — Jake M.</p>
                    <p className="text-slate-500 text-[10px]">Wind-up analysis · 1 pitch detected</p>
                  </div>
                  <span className="bg-emerald-400/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/20">
                    Complete
                  </span>
                </div>

                {/* Tab bar */}
                <div className="flex border-b border-white/[0.05]">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`px-4 py-2.5 text-xs font-semibold transition-all duration-150 border-b-2 ${
                        tab === t.id
                          ? "text-amber-400 border-amber-400 bg-amber-400/[0.04]"
                          : "text-slate-500 border-transparent hover:text-slate-300"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={tab}
                      className="h-full"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, ease: "easeInOut" }}
                    >
                      {tab === "analysis" && <AnalysisTab />}
                      {tab === "phases"   && <PhasesTab />}
                      {tab === "progress" && <ProgressTab />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
