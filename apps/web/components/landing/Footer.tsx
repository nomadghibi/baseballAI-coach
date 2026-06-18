import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-white/[0.05] py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-amber-400 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-navy-950" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" opacity="0.4" />
                </svg>
              </div>
              <span className="font-display font-bold text-sm text-white">
                Baseball<span className="text-amber-400">AI</span> Coach
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[220px]">
              Professional-grade pitching analysis for every young athlete.
            </p>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Product</p>
            <nav className="flex flex-col gap-2">
              {[
                { label: "How It Works", href: "#how-it-works" },
                { label: "Features", href: "#features" },
                { label: "Privacy", href: "#privacy" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>

          {/* Account */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Account</p>
            <nav className="flex flex-col gap-2">
              {[
                { label: "Create Account", href: "/register" },
                { label: "Log In", href: "/login" },
                { label: "Dashboard", href: "/dashboard" },
              ].map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-slate-400 hover:text-white text-sm transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-white/[0.05] pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} BaseballAI Coach. All rights reserved.
          </p>
          <p className="text-slate-700 text-xs">
            Built for youth athletes. Private by design.
          </p>
        </div>
      </div>
    </footer>
  );
}
