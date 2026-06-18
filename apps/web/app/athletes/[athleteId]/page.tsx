"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import AthleteProfileForm from "@/components/athlete/AthleteProfileForm"
import type { Athlete, AthleteCreate, SessionListItem } from "@/lib/types"

export default function AthleteDetailPage() {
  const ready = useRequireAuth()
  const router = useRouter()
  const { athleteId } = useParams<{ athleteId: string }>()

  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [editing, setEditing] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!ready || !athleteId) return
    api.athletes.get(athleteId).then(setAthlete).catch((err) => setFetchError(err.message))
    api.sessions.list(athleteId).then(setSessions).catch(() => {})
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
    } catch {
      setDeleting(false)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Athlete header */}
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{athlete.first_name}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing((e) => !e)}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {editing ? "Cancel" : "Edit"}
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>

        {/* Profile */}
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
            <Row label="Position" value={athlete.primary_position} />
            <Row label="Throws" value={athlete.throwing_hand} />
            <Row label="Bats" value={athlete.batting_side} />
            <Row label="Birth year" value={athlete.birth_year?.toString()} />
            <Row label="Height" value={athlete.height_in ? `${athlete.height_in} in` : null} />
            <Row label="Weight" value={athlete.weight_lb ? `${athlete.weight_lb} lbs` : null} />
          </div>
        )}

        {/* Sessions */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Sessions</h2>
            <Link
              href={`/athletes/${athleteId}/sessions/new`}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
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
              {sessions.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-4 hover:shadow-sm transition-shadow"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{s.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {formatDate(s.session_date)}
                      {s.camera_angle && ` · ${s.camera_angle} view`}
                    </div>
                  </div>
                  <VideoStatusBadge status={s.video_status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium capitalize">{value ?? "—"}</span>
    </div>
  )
}

function VideoStatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return <span className="text-xs text-gray-400">No video</span>
  }
  const map: Record<string, string> = {
    uploading: "bg-yellow-100 text-yellow-700",
    uploaded: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    analyzed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}
