"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { clearToken, useRequireAuth } from "@/lib/auth"
import type { User } from "@/lib/types"

export default function SettingsPage() {
  const ready = useRequireAuth()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!ready) return
    api.auth.me().then((u) => {
      setUser(u)
      setName(u.full_name ?? "")
    })
  }, [ready])

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError("")
    try {
      const updated = await api.auth.updateMe({ full_name: name.trim() || null })
      setUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    clearToken()
    router.replace("/login")
  }

  if (!ready || !user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </Link>
      </nav>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Account settings</h1>

        {/* Profile */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">Profile</h2>

          {/* Email — read only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              {user.email}
            </p>
          </div>

          {/* Name — editable */}
          <form onSubmit={handleSaveName} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sarah Johnson"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={saving}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? "Saving…" : saved ? "✓ Saved" : "Save name"}
            </button>
          </form>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
          <h2 className="text-base font-semibold text-gray-800">Privacy</h2>
          <p className="text-sm text-gray-500">
            All your athlete profiles, videos, and analysis results are private. Only you can access
            them — no data is shared with third parties or visible to other users.
          </p>
          <p className="text-sm text-gray-500">
            Videos are stored on our servers and used only to run the pitching analysis.
            Analysis results (scores, feedback) are stored in our database.
          </p>
        </div>

        {/* Danger zone */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Session</h2>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Sign out
          </button>
        </div>

        <p className="text-xs text-gray-400 text-center">
          BaseballAI Coach · Private beta · Not medical advice
        </p>
      </main>
    </div>
  )
}
