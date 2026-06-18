"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import type { SessionCreate } from "@/lib/types"

const LOCATIONS = ["backyard", "field", "cage", "game", "other"]
const ANGLES = ["side", "rear", "front", "unknown"]

export default function NewSessionPage() {
  const ready = useRequireAuth()
  const router = useRouter()
  const { athleteId } = useParams<{ athleteId: string }>()

  const today = new Date().toISOString().split("T")[0]
  const [title, setTitle] = useState("")
  const [sessionDate, setSessionDate] = useState(today)
  const [locationTtype, setLocationType] = useState("")
  const [cameraAngle, setCameraAngle] = useState("side")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const data: SessionCreate = {
      title: title.trim() || `Session ${sessionDate}`,
      session_date: sessionDate,
      location_type: locationTtype || null,
      camera_angle: cameraAngle || null,
      notes: notes.trim() || null,
    }
    try {
      const session = await api.sessions.create(athleteId, data)
      router.replace(`/sessions/${session.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session")
      setLoading(false)
    }
  }

  if (!ready) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href={`/athletes/${athleteId}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to athlete
        </Link>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New session</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Session ${sessionDate}`}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank to use the date as title</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={locationTtype}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select…</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Camera angle
                </label>
                <select
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ANGLES.map((a) => (
                    <option key={a} value={a}>
                      {a.charAt(0).toUpperCase() + a.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What are you working on today?"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating…" : "Create session"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
