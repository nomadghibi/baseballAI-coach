"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-950/85 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/40"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
            <svg className="w-4 h-4 text-navy-950" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <span className="font-display font-bold text-[1.05rem] text-white tracking-tight">
            Baseball<span className="text-amber-400">AI</span> Coach
          </span>
        </Link>

        {/* Center links */}
        <div className="hidden md:flex items-center gap-7">
          {[
            { label: "How It Works", href: "#how-it-works" },
            { label: "Features", href: "#features" },
            { label: "Privacy", href: "#privacy" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium"
            >
              {label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors font-medium"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="bg-amber-400 hover:bg-amber-300 text-navy-950 font-bold text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-amber-400/20 hover:-translate-y-px"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}
