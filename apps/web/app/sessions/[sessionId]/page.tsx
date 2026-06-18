"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import VideoUpload from "@/components/video/VideoUpload"
import type { Session } from "@/lib/types"

export default function SessionDetailPage() {
  const ready = useRequireAuth()
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()

  const [session, setSession] = useState<Session | null>(null)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState("")
  const [deleting, setDeleting] = useState(false)

  async function load() {
    try {
      const s = await api.sessions.get(sessionId)
      setSession(s)
      if (s.video && (s.video.status === "uploaded" || s.video.status === "analyzed")) {
        const { playback_url } = await api.videos.playbackUrl(s.video.id)
        setPlaybackUrl(playback_url)
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load session")
    }
  }

  useEffect(() => {
    if (!ready || !sessionId) return
    load()
  }, [ready, sessionId])

  async function handleUploadComplete(videoId: string) {
    await load()
  }

  async function handleDeleteVideo() {
    if (!session?.video) return
    if (!confirm("Delete this video? This cannot be undone.")) return
    await api.videos.delete(session.video.id)
    await load()
    setPlaybackUrl(null)
  }

  async function handleDeleteSession() {
    if (!confirm("Delete this entire session including the video? This cannot be undone.")) return
    setDeleting(true)
    try {
      await api.sessions.delete(sessionId)
      router.replace(`/athletes/${session?.athlete_id}`)
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

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link
          href={`/athletes/${session.athlete_id}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to athlete
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(session.session_date)}
              {session.location_type && ` · ${cap(session.location_type)}`}
              {session.camera_angle && ` · ${cap(session.camera_angle)} view`}
            </p>
          </div>
          <button
            onClick={handleDeleteSession}
            disabled={deleting}
            className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete session"}
          </button>
        </div>

        {/* Notes */}
        {session.notes && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500 font-medium mb-1">Notes</p>
            <p className="text-sm text-gray-800">{session.notes}</p>
          </div>
        )}

        {/* Video section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Video</h2>
            {session.video && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(session.video.status)}`}
              >
                {cap(session.video.status)}
              </span>
            )}
          </div>

          {!session.video && (
            <VideoUpload sessionId={sessionId} onComplete={handleUploadComplete} />
          )}

          {session.video && playbackUrl && (
            <div className="space-y-3">
              <video
                src={playbackUrl}
                controls
                className="w-full rounded-lg bg-black"
                style={{ maxHeight: 480 }}
              />
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{session.video.content_type}</span>
                {session.video.size_bytes && (
                  <span>{(session.video.size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                )}
                <button
                  onClick={handleDeleteVideo}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete video
                </button>
              </div>
            </div>
          )}

          {session.video && !playbackUrl && session.video.status !== "uploading" && (
            <p className="text-sm text-gray-500 text-center py-4">
              Video is {session.video.status}. Refresh to check status.
            </p>
          )}

          {session.video && session.video.status === "uploading" && (
            <p className="text-sm text-gray-400 text-center py-4">Upload in progress…</p>
          )}
        </div>

        {/* Analysis placeholder */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
          Analysis dashboard coming in Phase 4–5
        </div>
      </main>
    </div>
  )
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    uploading: "bg-yellow-100 text-yellow-700",
    uploaded: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    analyzed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  }
  return map[status] ?? "bg-gray-100 text-gray-600"
}
