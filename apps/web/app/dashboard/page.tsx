"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { clearToken, useRequireAuth } from "@/lib/auth"
import type { Athlete } from "@/lib/types"

export default function DashboardPage() {
  const ready = useRequireAuth()
  const router = useRouter()
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!ready) return
    api.athletes
      .list()
      .then(setAthletes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [ready])

  function handleLogout() {
    clearToken()
    router.replace("/login")
  }

  if (!ready) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">BaseballAI Coach</span>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
          Sign out
        </button>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Athletes</h1>
          <Link
            href="/athletes/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Add athlete
          </Link>
        </div>

        {loading && <p className="text-gray-500 text-sm">Loading…</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && athletes.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-medium">No athletes yet</p>
            <p className="text-sm mt-1">Add your first athlete to get started</p>
            <Link
              href="/athletes/new"
              className="mt-4 inline-block text-blue-600 hover:underline text-sm font-medium"
            >
              Add athlete →
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {athletes.map((a) => (
            <Link
              key={a.id}
              href={`/athletes/${a.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="font-semibold text-gray-900 text-lg">{a.first_name}</div>
              <div className="text-sm text-gray-500 mt-1 space-x-2">
                {a.primary_position && (
                  <span className="capitalize">{a.primary_position}</span>
                )}
                {a.throwing_hand && (
                  <span>· Throws {a.throwing_hand}</span>
                )}
              </div>
              {a.birth_year && (
                <div className="text-xs text-gray-400 mt-1">Born {a.birth_year}</div>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
