"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Privacy from "@/components/landing/Privacy";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <HowItWorks />
        <Features />
        <Privacy />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
