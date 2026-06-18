import FadeIn from "./FadeIn";

const POINTS = [
  {
    title: "No Data Sharing",
    desc: "Your athlete's video and analysis data is never shared, sold, or used to train external models. It belongs to you.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Delete Anytime",
    desc: "Remove any video, session, or athlete profile permanently at any time. We make it easy to stay in control.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    title: "Parent-First Design",
    desc: "Built specifically for youth athletes. No public profiles, no leaderboards, no exposure of minors' data to third parties.",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
      </svg>
    ),
  },
];

export default function Privacy() {
  return (
    <section id="privacy" className="bg-navy-950 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="glass-card overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: headline */}
            <FadeIn
              direction="right"
              className="p-10 sm:p-12 flex flex-col justify-center gap-5 border-b md:border-b-0 md:border-r border-white/[0.06]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em]">
                Privacy First
              </p>
              <h2 className="font-display font-bold text-3xl sm:text-4xl text-white leading-tight">
                Your athlete&apos;s data{" "}
                <span className="text-gradient-sky">stays private.</span> Always.
              </h2>
              <p className="text-slate-400 leading-relaxed">
                We built this for youth athletes. Privacy isn&apos;t an afterthought — it&apos;s
                the foundation.
              </p>
            </FadeIn>

            {/* Right: points */}
            <div className="divide-y divide-white/[0.06]">
              {POINTS.map((p, i) => (
                <FadeIn key={p.title} delay={i * 0.1} className="p-7 flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0 text-emerald-400">
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-[0.95rem] mb-1">{p.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
