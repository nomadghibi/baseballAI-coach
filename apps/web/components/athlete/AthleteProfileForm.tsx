"use client"

import type { AthleteCreate } from "@/lib/types"
import { useState } from "react"

interface AthleteProfileFormProps {
  initialData?: Partial<AthleteCreate>
  onSubmit: (data: AthleteCreate) => void
  loading: boolean
  error?: string
  submitLabel?: string
}

const THROWING_HANDS = ["right", "left"]
const BATTING_SIDES = ["right", "left", "switch"]
const POSITIONS = ["pitcher", "catcher", "infielder", "outfielder", "utility"]

export default function AthleteProfileForm({
  initialData,
  onSubmit,
  loading,
  error,
  submitLabel = "Save",
}: AthleteProfileFormProps) {
  const [firstName, setFirstName] = useState(initialData?.first_name ?? "")
  const [birthYear, setBirthYear] = useState(initialData?.birth_year?.toString() ?? "")
  const [throwingHand, setThrowingHand] = useState(initialData?.throwing_hand ?? "")
  const [battingSide, setBattingSide] = useState(initialData?.batting_side ?? "")
  const [primaryPosition, setPrimaryPosition] = useState(initialData?.primary_position ?? "")
  const [heightIn, setHeightIn] = useState(initialData?.height_in?.toString() ?? "")
  const [weightLb, setWeightLb] = useState(initialData?.weight_lb?.toString() ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({
      first_name: firstName.trim(),
      birth_year: birthYear ? parseInt(birthYear, 10) : null,
      throwing_hand: throwingHand || null,
      batting_side: battingSide || null,
      primary_position: primaryPosition || null,
      height_in: heightIn ? parseFloat(heightIn) : null,
      weight_lb: weightLb ? parseFloat(weightLb) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First name / nickname <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          placeholder="e.g. Jake"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Birth year</label>
          <input
            type="number"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="e.g. 2014"
            min={2000}
            max={2020}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Primary position</label>
          <select
            value={primaryPosition}
            onChange={(e) => setPrimaryPosition(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select…</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Throwing hand</label>
          <select
            value={throwingHand}
            onChange={(e) => setThrowingHand(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select…</option>
            {THROWING_HANDS.map((h) => (
              <option key={h} value={h}>
                {h.charAt(0).toUpperCase() + h.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batting side</label>
          <select
            value={battingSide}
            onChange={(e) => setBattingSide(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select…</option>
            {BATTING_SIDES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (inches)</label>
          <input
            type="number"
            value={heightIn}
            onChange={(e) => setHeightIn(e.target.value)}
            placeholder="e.g. 54"
            min={36}
            max={84}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Weight (lbs)</label>
          <input
            type="number"
            value={weightLb}
            onChange={(e) => setWeightLb(e.target.value)}
            placeholder="e.g. 85"
            min={40}
            max={300}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving…" : submitLabel}
      </button>
    </form>
  )
}
