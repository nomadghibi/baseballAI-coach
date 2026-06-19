"use client"

import { useEffect, useRef, useState } from "react"

const API = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/health`
const SLOW_THRESHOLD_MS = 2500
const POLL_MS = 4000

export default function WakeUpBanner() {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    let alive = true

    async function ping(): Promise<boolean> {
      try {
        const res = await fetch(API, { cache: "no-store" })
        return res.ok
      } catch {
        return false
      }
    }

    async function initialPing() {
      // Show banner if first ping takes too long or fails
      timerRef.current = setTimeout(() => { if (alive) setVisible(true) }, SLOW_THRESHOLD_MS)
      const ok = await ping()
      if (timerRef.current) clearTimeout(timerRef.current)
      if (!alive) return
      if (ok) return // fast response — never show banner
      setVisible(true)
      // Keep polling until API responds
      pollRef.current = setInterval(async () => {
        const up = await ping()
        if (up && alive) {
          setVisible(false)
          if (pollRef.current) clearInterval(pollRef.current)
        }
      }, POLL_MS)
    }

    initialPing()
    return () => {
      alive = false
      if (timerRef.current) clearTimeout(timerRef.current)
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5
                    bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg
                    border border-gray-700 animate-pulse-slow">
      <svg className="animate-spin h-3.5 w-3.5 text-blue-400 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="text-gray-200">Server warming up — just a moment…</span>
    </div>
  )
}
