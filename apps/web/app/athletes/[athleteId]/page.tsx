"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import AthleteProfileForm from "@/components/athlete/AthleteProfileForm"
import type { Athlete, AthleteCreate } from "@/lib/types"

export default function AthleteDetailPage() {
  const ready = useRequireAuth()
  const router = useRouter()
  const { athleteId } = useParams<{ athleteId: string }>()

  const [athlete, setAthlete] = useState<Athlete | null>(null)
  const [editing, setEditing] = useState(false)
  const [fetchError, setFetchError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!ready || !athleteId) return
    api.athletes
      .get(athleteId)
      .then(setAthlete)
      .catch((err) => setFetchError(err.message))
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
            <Row
              label="Height"
              value={athlete.height_in ? `${athlete.height_in} in` : undefined}
            />
            <Row
              label="Weight"
              value={athlete.weight_lb ? `${athlete.weight_lb} lbs` : undefined}
            />
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Sessions</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
            Sessions coming in Phase 2
          </div>
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
