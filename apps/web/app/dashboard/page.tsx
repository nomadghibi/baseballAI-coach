"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { clearToken, useRequireAuth } from "@/lib/auth"
import WakeUpBanner from "@/components/ui/WakeUpBanner"
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
      <WakeUpBanner />
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-gray-900">BaseballAI Coach</span>
        <div className="flex items-center gap-4">
          <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700">Settings</Link>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
            Sign out
          </button>
        </div>
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

        {!loading && !error && athletes.length === 0 && <OnboardingGuide />}

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

        <div className="mt-10 pb-6">
          <p className="text-xs text-gray-400 text-center">
            All videos and analysis are private to your account only.
            Not medical advice.
          </p>
        </div>
      </main>
    </div>
  )
}

function OnboardingGuide() {
  const steps = [
    {
      icon: "⚾",
      title: "Add your pitcher",
      desc: "Enter their name and throwing hand. Takes 30 seconds.",
      href: "/athletes/new",
      cta: "Add athlete →",
    },
    {
      icon: "📱",
      title: "Record one pitch",
      desc: "Film from the side. Full body in frame, good lighting. 10–30 seconds.",
      href: null,
      cta: null,
    },
    {
      icon: "📊",
      title: "Get AI mechanics report",
      desc: "Upload the video. AI analyzes balance, arm slot, stride, and more in minutes.",
      href: null,
      cta: null,
    },
  ]

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Welcome */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">⚾</div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome to BaseballAI Coach</h2>
        <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">
          Upload a short pitching video and get a detailed AI mechanics report in minutes.
          No equipment needed — just your phone.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
              {i + 1}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{step.icon}</span>
                <p className="font-semibold text-gray-900 text-sm">{step.title}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/athletes/new"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Add your first athlete →
        </Link>
        <p className="text-xs text-gray-400 mt-3">Free · Private · No coaching experience needed</p>
      </div>
    </div>
  )
}
