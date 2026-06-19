"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import type { AnalysisResult, Athlete, FeedbackItem, Session } from "@/lib/types"

const SCORE_LABELS: Record<string, string> = {
  balance: "Balance",
  head_stability: "Head Stability",
  stride: "Stride",
  arm_slot: "Arm Slot",
  follow_through: "Follow-Through",
  video_quality: "Video Quality",
}

const SEV_ICONS: Record<string, string> = {
  positive: "✓",
  focus: "→",
  caution: "!",
  recording_quality: "📷",
}

export default function ReportPage() {
  const ready = useRequireAuth()
  const { sessionId } = useParams<{ sessionId: string }>()

  const [session, setSession] = useState<Session | null>(null)
  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!ready || !sessionId) return
    async function load() {
      try {
        const s = await api.sessions.get(sessionId)
        setSession(s)
        const [a, r] = await Promise.all([
          api.athletes.get(s.athlete_id),
          s.video?.status === "analyzed" ? api.analysis.getResult(s.video.id) : Promise.resolve(null),
        ])
        setAthlete(a)
        setResult(r)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load report")
      }
    }
    load()
  }, [ready, sessionId])

  if (!ready) return null
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }
  if (!session || !athlete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-gray-500">No analysis results yet for this session.</p>
        <Link href={`/sessions/${sessionId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to session
        </Link>
      </div>
    )
  }

  const scoreColor = (v: number) =>
    v >= 80 ? "text-green-600" : v >= 60 ? "text-yellow-600" : "text-red-500"

  const feedback = result.feedback.filter((f) => f.severity !== "recording_quality")
  const recordingNotes = result.feedback.filter((f) => f.severity === "recording_quality")

  return (
    <div className="min-h-screen bg-white">
      {/* ── Print toolbar (hidden when printing) ── */}
      <div className="print:hidden bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href={`/sessions/${sessionId}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to session
        </Link>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          Print / Save as PDF
        </button>
      </div>

      {/* ── Report body ── */}
      <main className="max-w-2xl mx-auto px-8 py-10 space-y-8">

        {/* Header */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pitching Mechanics Report</h1>
              <p className="text-sm text-gray-500 mt-1">BaseballAI Coach</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{fmtDate(session.session_date)}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <InfoRow label="Athlete" value={athlete.first_name} />
            {athlete.birth_year && (
              <InfoRow label="Birth year" value={String(athlete.birth_year)} />
            )}
            {athlete.throwing_hand && (
              <InfoRow label="Throws" value={cap(athlete.throwing_hand)} />
            )}
            {athlete.primary_position && (
              <InfoRow label="Position" value={cap(athlete.primary_position)} />
            )}
            <InfoRow label="Session" value={session.title} />
            {session.camera_angle && (
              <InfoRow label="Camera angle" value={cap(session.camera_angle) + " view"} />
            )}
            {session.location_type && (
              <InfoRow label="Location" value={cap(session.location_type)} />
            )}
          </div>
        </div>

        {/* Overall score */}
        <div className="text-center py-4">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Overall Mechanics Score</p>
          <p className={`text-8xl font-bold mt-2 tabular-nums ${scoreColor(result.overall_score)}`}>
            {Math.round(result.overall_score)}
          </p>
          <p className="text-sm text-gray-400 mt-1">out of 100</p>
        </div>

        {/* Scores breakdown */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Mechanics Breakdown</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(result.scores)
              .filter(([k]) => k !== "video_quality")
              .map(([key, value]) => {
                const conf = result.metrics_detail[key]?.confidence ?? 1
                return (
                  <div key={key} className="border border-gray-200 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-500 font-medium">{SCORE_LABELS[key] ?? key}</p>
                    <p className={`text-3xl font-bold mt-1 tabular-nums ${scoreColor(value)}`}>
                      {Math.round(value)}
                    </p>
                    {conf < 0.4 && (
                      <p className="text-xs text-gray-400 mt-0.5">Low confidence</p>
                    )}
                  </div>
                )
              })}
          </div>
        </div>

        {/* Pitching phases */}
        {result.phases.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Pitching Phases Detected</h2>
            <div className="space-y-1">
              {result.phases.map((phase, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700 capitalize">{phase.name.replace(/_/g, " ")}</span>
                  <span className="text-gray-400 tabular-nums text-xs">
                    {phase.start_sec.toFixed(2)}s – {phase.end_sec.toFixed(2)}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coaching feedback */}
        {feedback.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Coaching Feedback</h2>
            <div className="space-y-3">
              {feedback.map((item, i) => (
                <FeedbackCard key={i} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Recording notes */}
        {recordingNotes.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-3">Recording Notes</h2>
            <div className="space-y-2">
              {recordingNotes.map((item, i) => (
                <FeedbackCard key={i} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Session notes */}
        {session.notes && (
          <div>
            <h2 className="text-base font-semibold text-gray-800 mb-2">Session Notes</h2>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-4">{session.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 space-y-1">
          <p>
            Report generated {fmtDateTime(new Date().toISOString())} · BaseballAI Coach
          </p>
          <p>
            This report provides general mechanics feedback for training purposes only.
            It is not medical advice, a professional coaching certification, or a guarantee
            of injury prevention. Always work with a qualified coach for personalized instruction.
          </p>
        </div>
      </main>
    </div>
  )
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  const styles: Record<string, string> = {
    positive: "bg-green-50 border-green-200 text-green-900",
    focus: "bg-blue-50 border-blue-200 text-blue-900",
    caution: "bg-yellow-50 border-yellow-200 text-yellow-900",
    recording_quality: "bg-gray-50 border-gray-200 text-gray-700",
  }
  const style = styles[item.severity] ?? styles.focus
  return (
    <div className={`rounded-xl border p-4 ${style}`}>
      <p className="text-sm font-medium">
        <span className="mr-2">{SEV_ICONS[item.severity]}</span>
        {item.message}
      </p>
      <p className="text-sm mt-1.5 opacity-75 pl-5">{item.suggestion}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-24 shrink-0">{label}:</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  )
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  })
}
