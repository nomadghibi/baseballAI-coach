"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import AthleteProfileForm from "@/components/athlete/AthleteProfileForm"
import MetricTrend from "@/components/dashboard/MetricTrend"
import type { Athlete, AthleteCreate, ProgressData, SessionListItem, TrendPoint } from "@/lib/types"

const METRIC_LABELS: { key: keyof TrendPoint; label: string }[] = [
  { key: "balance_score",          label: "Balance" },
  { key: "head_stability_score",   label: "Head stability" },
  { key: "stride_score",           label: "Stride" },
  { key: "arm_slot_score",         label: "Arm slot" },
  { key: "follow_through_score",   label: "Follow-through" },
]

export default function AthleteDetailPage() {
  const ready = useRequireAuth()
  const router = useRouter()
  const { athleteId } = useParams<{ athleteId: string }>()

  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [editing, setEditing] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!ready || !athleteId) return
    api.athletes.get(athleteId).then(setAthlete).catch((e) => setFetchError(e.message))
    api.sessions.list(athleteId).then(setSessions).catch(() => {})
    api.athletes.progress(athleteId).then(setProgress).catch(() => {})
  }, [ready, athleteId])

  async function handleSave(data: AthleteCreate) {
    setSaveError("")
    setSaving(true)
    try {
      const updated = await api.athletes.update(athleteId, data)
      setAthlete(updated)
      setEditing(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete ${athlete?.first_name}? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await api.athletes.delete(athleteId)
      router.replace("/dashboard")
    } catch { setDeleting(false) }
  }

  if (!ready) return null
  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">{fetchError}</p>
      </div>
    )
  }
  if (!athlete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  const latest = progress?.trends.at(-1) ?? null
  const prev   = progress?.trends.at(-2) ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">

        {/* ── Athlete header ────────────────────────── */}
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{athlete.first_name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        {/* ── Profile ───────────────────────────────── */}
        {editing ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <AthleteProfileForm
              initialData={athlete}
              onSubmit={handleSave}
              loading={saving}
              error={saveError}
              submitLabel="Save changes"
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <Row label="Position"   value={athlete.primary_position} />
            <Row label="Throws"     value={athlete.throwing_hand} />
            <Row label="Bats"       value={athlete.batting_side} />
            <Row label="Birth year" value={athlete.birth_year?.toString()} />
            <Row label="Height"     value={athlete.height_in ? `${athlete.height_in} in` : null} />
            <Row label="Weight"     value={athlete.weight_lb ? `${athlete.weight_lb} lbs` : null} />
          </div>
        )}

        {/* ── Progress ──────────────────────────────── */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Progress</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

            {/* Latest score + change */}
            {latest && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    Latest overall score
                  </p>
                  <p className="text-5xl font-bold text-gray-900 tabular-nums mt-1">
                    {Math.round(latest.overall_score)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmtDate(latest.date)} · {latest.session_title}
                  </p>
                </div>
                {progress?.latest_summary?.change_from_previous != null && (
                  <div className="text-right">
                    <p className={`text-3xl font-bold tabular-nums ${
                      progress.latest_summary.change_from_previous > 0
                        ? "text-green-600"
                        : progress.latest_summary.change_from_previous < 0
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}>
                      {progress.latest_summary.change_from_previous > 0 ? "+" : ""}
                      {Math.round(progress.latest_summary.change_from_previous)}
                    </p>
                    <p className="text-xs text-gray-400">vs prev session</p>
                  </div>
                )}
              </div>
            )}

            {/* Trend chart */}
            <MetricTrend trends={progress?.trends ?? []} />

            {/* Latest vs previous comparison */}
            {latest && prev && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">
                  Latest vs previous
                </p>
                <div className="space-y-2">
                  {METRIC_LABELS.map(({ key, label }) => {
                    const curr  = latest[key] as number
                    const prevV = prev[key]   as number
                    const delta = curr - prevV
                    return (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{label}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-gray-900 font-medium w-8 text-right tabular-nums">
                            {Math.round(curr)}
                          </span>
                          <span className={`w-10 text-right text-xs font-semibold tabular-nums ${
                            delta >  2 ? "text-green-600"
                            : delta < -2 ? "text-red-500"
                            : "text-gray-400"
                          }`}>
                            {delta > 0 ? "+" : ""}{Math.round(delta)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-400" />
                    Latest: {fmtDate(latest.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-gray-300" />
                    Previous: {fmtDate(prev.date)}
                  </span>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ── Sessions ──────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Sessions</h2>
            <Link
              href={`/athletes/${athleteId}/sessions/new`}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              New session
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
              <p>No sessions yet.</p>
              <Link
                href={`/athletes/${athleteId}/sessions/new`}
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                Record first session →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((s) => {
                const trendPt = progress?.trends.find((t) => t.session_id === s.id)
                return (
                  <Link
                    key={s.id}
                    href={`/sessions/${s.id}`}
                    className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:shadow-sm transition-shadow"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{s.title}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {fmtDate(s.session_date)}
                        {s.camera_angle && ` · ${s.camera_angle} view`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {trendPt && (
                        <span className="text-sm font-bold text-gray-700 tabular-nums">
                          {Math.round(trendPt.overall_score)}
                        </span>
                      )}
                      <VideoStatusBadge status={s.video_status} />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium capitalize">{value ?? "—"}</span>
    </div>
  )
}

function VideoStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-xs text-gray-400">No video</span>
  const map: Record<string, string> = {
    uploading:  "bg-yellow-100 text-yellow-700",
    uploaded:   "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    analyzed:   "bg-green-100 text-green-700",
    failed:     "bg-red-100 text-red-700",
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}
