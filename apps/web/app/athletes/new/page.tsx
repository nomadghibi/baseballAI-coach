"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import AthleteProfileForm from "@/components/athlete/AthleteProfileForm"
import type { AthleteCreate } from "@/lib/types"

function NewAthleteContent() {
  const ready = useRequireAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const isOnboarding = searchParams.get("onboarding") === "1"
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(data: AthleteCreate) {
    setError("")
    setLoading(true)
    try {
      const athlete = await api.athletes.create(data)
      router.replace(`/athletes/${athlete.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create athlete")
      setLoading(false)
    }
  }

  if (!ready) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {isOnboarding && (
          <div className="mb-6 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
            <p className="text-sm font-semibold text-blue-800">Step 1 of 3 — Add your pitcher</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Just a name and throwing hand to start. You can add more details later.
            </p>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add athlete</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <AthleteProfileForm
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            submitLabel="Create athlete"
          />
        </div>
      </main>
    </div>
  )
}

export default function NewAthletePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <NewAthleteContent />
    </Suspense>
  )
}
