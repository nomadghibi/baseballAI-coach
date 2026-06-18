import FadeIn from "./FadeIn";

const FEATURES = [
  {
    title: "Pose Skeleton Overlay",
    desc: "See every joint tracked frame-by-frame. Pause, scrub, and review exactly how the body moves through the delivery.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    accent: "amber",
    soon: false,
  },
  {
    title: "Phase-by-Phase Timeline",
    desc: "Automatic detection of all 5 pitch phases: Set, Leg Kick, Stride, Release, and Follow-Through — with precise timing.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "sky",
    soon: false,
  },
  {
    title: "15+ Biomechanical Metrics",
    desc: "Arm angle, hip rotation speed, stride length, shoulder separation, trunk tilt, and more — all quantified automatically.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    accent: "amber",
    soon: false,
  },
  {
    title: "Progress Tracking",
    desc: "Session-over-session trend charts show improvement over time. Compare mechanics across multiple sessions side by side.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    ),
    accent: "green",
    soon: false,
  },
  {
    title: "Multiple Athlete Profiles",
    desc: "Manage a whole roster. Each athlete gets their own profile with session history, notes, and progress data.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    accent: "purple",
    soon: false,
  },
  {
    title: "Coach Notes & Feedback",
    desc: "Attach timestamped coaching notes to any session. Build a running record of observations alongside objective metrics.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
    accent: "sky",
    soon: false,
  },
  {
    title: "Hitting Analysis",
    desc: "Stance, load, hip rotation, bat path, and swing consistency — the same AI analysis applied to your hitter's mechanics.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    accent: "amber",
    soon: true,
  },
  {
    title: "Video Comparison",
    desc: "Place two sessions side-by-side to see mechanical changes over time. Perfect for tracking drill improvements.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    accent: "sky",
    soon: true,
  },
  {
    title: "Team Analytics",
    desc: "Roster-level dashboards, workload tracking, and group progress reports for coaches managing multiple athletes.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    accent: "purple",
    soon: true,
  },
  {
    title: "PDF Reports",
    desc: "Export a clean, shareable PDF summary of any session — mechanics breakdown, metrics, and coach notes in one page.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    accent: "green",
    soon: true,
  },
];

const accentMap: Record<string, string> = {
  amber:  "bg-amber-400/10 text-amber-400 border-amber-400/15",
  sky:    "bg-sky-400/10 text-sky-400 border-sky-400/15",
  green:  "bg-emerald-400/10 text-emerald-400 border-emerald-400/15",
  purple: "bg-violet-400/10 text-violet-400 border-violet-400/15",
};

const accentSoonMap: Record<string, string> = {
  amber:  "bg-amber-400/5 text-amber-400/40 border-amber-400/10",
  sky:    "bg-sky-400/5 text-sky-400/40 border-sky-400/10",
  green:  "bg-emerald-400/5 text-emerald-400/40 border-emerald-400/10",
  purple: "bg-violet-400/5 text-violet-400/40 border-violet-400/10",
};

export default function Features() {
  return (
    <section id="features" className="bg-navy-900 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-14">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Features</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
            Everything a pitcher needs{" "}
            <span className="text-gradient-amber">to level up</span>
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto">
            Built for parents and coaches who want real data, not guesswork.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <div
                className={`glass-card p-6 h-full flex flex-col gap-3 transition-all duration-300 relative overflow-hidden ${
                  f.soon
                    ? "opacity-60"
                    : "hover:border-white/[0.12] hover:bg-white/[0.06] group"
                }`}
              >
                {f.soon && (
                  <span className="absolute top-3.5 right-3.5 text-[9px] font-bold uppercase tracking-widest text-slate-500 border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                )}

                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                    f.soon
                      ? accentSoonMap[f.accent]
                      : `group-hover:-translate-y-0.5 ${accentMap[f.accent]}`
                  }`}
                >
                  {f.icon}
                </div>

                <h3
                  className={`font-display font-bold text-[1.05rem] leading-snug ${
                    f.soon ? "text-slate-500" : "text-white"
                  }`}
                >
                  {f.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    f.soon ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {f.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
