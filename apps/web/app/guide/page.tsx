import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Video Recording Guide",
  description: "How to film a youth pitcher for the best AI mechanics analysis results.",
}

const TIPS = [
  {
    icon: "📐",
    title: "Film from the side",
    desc: "Stand directly to the side of the pitcher — their body should face left or right in the frame, not toward or away from you. The pitching arm should be clearly visible throughout the delivery.",
    good: "Pure side view showing full arm path",
    bad: "Facing the camera or back to camera",
  },
  {
    icon: "🏃",
    title: "Keep the full body in frame",
    desc: "Head to foot, the entire time. Don't zoom in on the arm or upper body — the AI needs the full kinetic chain from foot strike through follow-through to score balance, stride, and foot landing.",
    good: "Head and both feet always visible",
    bad: "Cutting off feet or following with pan",
  },
  {
    icon: "📱",
    title: "Hold steady — no panning",
    desc: "Lock the phone against a fence rail, lean it on a bag, or have someone hold it completely still. Shaky or panning video throws off the pose detection and lowers every score.",
    good: "Phone propped steady on fence post",
    bad: "Hand-held, following the pitcher",
  },
  {
    icon: "💡",
    title: "Film in good light",
    desc: "Outdoors is ideal. Avoid filming with the sun directly behind the pitcher (silhouette). Well-lit cages work. Dark indoor gyms or night games produce low-confidence results.",
    good: "Overcast outdoor or lit batting cage",
    bad: "Backlit, shadow-heavy, or night video",
  },
  {
    icon: "🎬",
    title: "One pitch per video",
    desc: "Record 10–30 seconds covering one complete pitch: starting stance through full follow-through. Multiple pitches in one clip confuse the phase detection. Short and focused is better.",
    good: "One pitch, 10–30 seconds",
    bad: "Whole bullpen session in one file",
  },
  {
    icon: "👕",
    title: "Fitted clothes, no baggy jersey",
    desc: "Loose or very baggy clothing hides joint positions. The AI tracks elbow, hip, knee, and wrist landmarks — a fitted practice shirt gives far more accurate landmark detection than an oversized jersey.",
    good: "Tight practice shirt or compression top",
    bad: "Oversized jersey that hides elbows",
  },
  {
    icon: "📏",
    title: "Distance: 20–40 feet away",
    desc: "Too close and the pitcher partially leaves frame. Too far and landmark visibility drops. Standing roughly 20–40 feet away at 90 degrees to the delivery line is the sweet spot.",
    good: "20–40 ft, full body fills 60–80% of frame",
    bad: "Right behind home plate or 100 ft away",
  },
]

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900">BaseballAI Coach</Link>
        <Link href="/login" className="text-sm text-blue-600 hover:underline font-medium">Sign in →</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Recording Guide</p>
          <h1 className="text-3xl font-bold text-gray-900">How to film for best results</h1>
          <p className="text-gray-500 mt-3 text-sm max-w-lg mx-auto">
            AI mechanics analysis is only as good as the video. These tips take 30 seconds to read
            and make a huge difference in score accuracy.
          </p>
        </div>

        <div className="space-y-4">
          {TIPS.map((tip, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex gap-4">
                <span className="text-2xl flex-shrink-0 mt-0.5">{tip.icon}</span>
                <div className="min-w-0">
                  <h2 className="font-semibold text-gray-900">{tip.title}</h2>
                  <p className="text-sm text-gray-600 mt-1">{tip.desc}</p>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-green-50 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-green-700 mb-0.5">✓ Good</p>
                      <p className="text-xs text-green-800">{tip.good}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg px-3 py-2">
                      <p className="text-xs font-semibold text-red-600 mb-0.5">✗ Avoid</p>
                      <p className="text-xs text-red-700">{tip.bad}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <p className="font-bold text-xl mb-2">Ready to analyze a pitch?</p>
          <p className="text-blue-100 text-sm mb-5">
            Upload your video and get a full mechanics report in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-blue-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Get started free →
          </Link>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          BaseballAI Coach provides general mechanics feedback for training purposes only —
          not medical advice or professional coaching certification.
        </p>
      </main>
    </div>
  )
}
