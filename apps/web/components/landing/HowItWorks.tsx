import FadeIn from "./FadeIn";

const STEPS = [
  {
    number: "01",
    title: "Record & Upload",
    desc: "Film your pitcher from the side using any smartphone. Upload the MP4 or MOV — no special equipment or setup required.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    color: "amber",
  },
  {
    number: "02",
    title: "AI Analyzes Mechanics",
    desc: "Our CV pipeline detects 17 body landmarks, identifies pitch phases, and calculates biomechanical metrics across every frame.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
      </svg>
    ),
    color: "sky",
  },
  {
    number: "03",
    title: "Review & Improve",
    desc: "Get a full breakdown: skeleton overlay video, phase timeline, metric scores, and targeted coaching feedback to improve mechanics.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    color: "green",
  },
];

const colorMap = {
  amber: {
    icon: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    num: "text-amber-400/30",
    connector: "bg-amber-400/15",
  },
  sky: {
    icon: "bg-sky-400/10 text-sky-400 border-sky-400/20",
    num: "text-sky-400/30",
    connector: "bg-sky-400/15",
  },
  green: {
    icon: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    num: "text-emerald-400/30",
    connector: "bg-emerald-400/15",
  },
};

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-navy-950 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-amber-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">How It Works</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
            From video to insight{" "}
            <span className="text-gradient-amber">in minutes</span>
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto">
            No coaching degree required. Upload a clip and let the AI do the heavy lifting.
          </p>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[2.75rem] left-[calc(33.3%+1rem)] right-[calc(33.3%+1rem)] h-px bg-gradient-to-r from-amber-400/20 via-sky-400/20 to-emerald-400/20" />

          {STEPS.map((step, i) => {
            const c = colorMap[step.color as keyof typeof colorMap];
            return (
              <FadeIn key={step.number} delay={i * 0.13} className="relative">
                <div className="glass-card p-7 h-full flex flex-col gap-4 hover:border-white/[0.12] transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                      {step.icon}
                    </div>
                    <span className={`font-display font-black text-4xl ${c.num}`}>
                      {step.number}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
