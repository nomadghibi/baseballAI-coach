import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: {
    default: "BaseballAI Coach — AI-Powered Pitching Analysis for Youth Athletes",
    template: "%s | BaseballAI Coach",
  },
  description:
    "Professional-grade biomechanical pitching analysis powered by AI. Upload a video and get detailed pose overlay, phase breakdown, and actionable mechanics feedback in minutes.",
  keywords: [
    "baseball pitching analysis",
    "youth baseball AI",
    "pitching mechanics analyzer",
    "baseball coaching app",
    "biomechanics youth sports",
    "pitching video analysis",
    "youth pitcher training",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://baseballaicoach.com",
    siteName: "BaseballAI Coach",
    title: "BaseballAI Coach — AI-Powered Pitching Analysis",
    description:
      "Professional biomechanical analysis for youth pitchers. Upload a video, get instant AI feedback on mechanics.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BaseballAI Coach" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseballAI Coach — AI-Powered Pitching Analysis",
    description: "Professional biomechanical analysis for youth pitchers. Upload video, get AI feedback.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BaseballAI Coach",
  applicationCategory: "SportsApplication",
  operatingSystem: "Web",
  description:
    "AI-powered biomechanical pitching analysis for youth athletes. Upload video, get instant detailed feedback.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  audience: {
    "@type": "Audience",
    audienceType: "Parents and coaches of youth baseball players",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-navy-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
