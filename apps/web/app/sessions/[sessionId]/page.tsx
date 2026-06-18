"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { api } from "@/lib/api"
import { useRequireAuth } from "@/lib/auth"
import VideoUpload from "@/components/video/VideoUpload"
import type { AnalysisJob, AnalysisResult, FeedbackItem, Session } from "@/lib/types"

const POLL_INTERVAL_MS = 2500

export default function SessionDetailPage() {
  const ready = useRequireAuth()
  const router = useRouter()
  const { sessionId } = useParams<{ sessionId: string }>()

  const [session, setSession] = useState<Session | null>(null)
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null)
  const [analysisJob, setAnalysisJob] = useState<AnalysisJob | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [fetchError, setFetchError] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  async function loadSession() {
    try {
      const s = await api.sessions.get(sessionId)
      setSession(s)

      if (s.video) {
        // Load playback URL if video is ready
        if (s.video.status === "uploaded" || s.video.status === "analyzed") {
          const { playback_url } = await api.videos.playbackUrl(s.video.id)
          setPlaybackUrl(playback_url)
        }
        // Load analysis result if complete
        if (s.video.status === "analyzed") {
          const result = await api.analysis.getResult(s.video.id)
          setAnalysisResult(result)
        }
        // Start polling if job is running
        if (s.video.active_job_id) {
          startPolling(s.video.id, s.video.active_job_id)
        } else if (s.video.status === "processing") {
          // Job exists but not attached to session response yet — poll via video
          const job = await api.analysis.getLatestJob(s.video.id).catch(() => null)
          if (job && (job.status === "queued" || job.status === "processing")) {
            setAnalysisJob(job)
            startPolling(s.video.id, job.id)
          }
        }
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load session")
    }
  }

  function startPolling(videoId: string, jobId: string) {
    stopPolling()
    pollRef.current = setInterval(async () => {
      try {
        const job = await api.analysis.getJob(jobId)
        setAnalysisJob(job)

        if (job.status === "completed") {
          stopPolling()
          const [result, urlRes, s] = await Promise.all([
            api.analysis.getResult(videoId),
            api.videos.playbackUrl(videoId),
            api.sessions.get(sessionId),
          ])
          setAnalysisResult(result)
          setPlaybackUrl(urlRes.playback_url)
          setSession(s)
        } else if (job.status === "failed") {
          stopPolling()
          setSession((prev) =>
            prev && prev.video
              ? { ...prev, video: { ...prev.video, status: "failed" } }
              : prev
          )
        }
      } catch {
        // transient error — keep polling
      }
    }, POLL_INTERVAL_MS)
  }

  useEffect(() => {
    if (!ready || !sessionId) return
    loadSession()
    return stopPolling
  }, [ready, sessionId])

  async function handleUploadComplete(videoId: string, jobId: string | null) {
    stopPolling()
    await loadSession()
    if (jobId) startPolling(videoId, jobId)
  }

  async function handleRetry() {
    if (!session?.video) return
    setRetrying(true)
    try {
      const job = await api.analysis.trigger(session.video.id)
      setAnalysisJob(job)
      setAnalysisResult(null)
      setSession((prev) =>
        prev && prev.video ? { ...prev, video: { ...prev.video, status: "uploaded" } } : prev
      )
      startPolling(session.video.id, job.id)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Retry failed")
    } finally {
      setRetrying(false)
    }
  }

  async function handleDeleteVideo() {
    if (!session?.video) return
    if (!confirm("Delete this video and its analysis? This cannot be undone.")) return
    stopPolling()
    await api.videos.delete(session.video.id)
    setPlaybackUrl(null)
    setAnalysisJob(null)
    setAnalysisResult(null)
    await loadSession()
  }

  async function handleDeleteSession() {
    if (!confirm("Delete this entire session? This cannot be undone.")) return
    stopPolling()
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

  const jobStatus = analysisJob?.status ?? null
  const isAnalyzing = jobStatus === "queued" || jobStatus === "processing"
  const analysisFailed = session.video?.status === "failed" || jobStatus === "failed"

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href={`/athletes/${session.athlete_id}`} className="text-sm text-gray-500 hover:text-gray-700">
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

        {session.notes && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-800">{session.notes}</p>
          </div>
        )}

        {/* Video section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Video</h2>
            <div className="flex items-center gap-2">
              {session.video && (
                <StatusBadge status={analysisFailed ? "failed" : session.video.status} />
              )}
              {session.video && (
                <button
                  onClick={handleDeleteVideo}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {!session.video && (
            <VideoUpload sessionId={sessionId} onComplete={handleUploadComplete} />
          )}

          {session.video && playbackUrl && (
            <video
              src={playbackUrl}
              controls
              className="w-full rounded-lg bg-black mb-2"
              style={{ maxHeight: 400 }}
            />
          )}

          {isAnalyzing && (
            <div className="flex items-center gap-3 py-4">
              <Spinner />
              <p className="text-sm text-gray-600">
                {jobStatus === "queued" ? "Analysis queued…" : "Analyzing video…"}
              </p>
            </div>
          )}

          {analysisFailed && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-700 font-medium">Analysis failed</p>
              {analysisJob?.error_message && (
                <p className="text-xs text-red-500 mt-1 font-mono">{analysisJob.error_message}</p>
              )}
              <button
                onClick={handleRetry}
                disabled={retrying}
                className="mt-3 text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {retrying ? "Retrying…" : "Retry analysis"}
              </button>
            </div>
          )}
        </div>

        {/* Analysis results */}
        {analysisResult && (
          <>
            <OverallScore score={analysisResult.overall_score} />
            <ScoresGrid scores={analysisResult.scores} metricsDetail={analysisResult.metrics_detail} />
            <FeedbackSection feedback={analysisResult.feedback} />
          </>
        )}
      </main>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function OverallScore({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600"
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <p className="text-sm text-gray-500 font-medium">Overall mechanics score</p>
      <p className={`text-6xl font-bold mt-2 ${color}`}>{Math.round(score)}</p>
      <p className="text-xs text-gray-400 mt-1">out of 100</p>
    </div>
  )
}

const SCORE_LABELS: Record<string, string> = {
  balance: "Balance",
  head_stability: "Head stability",
  stride: "Stride",
  arm_slot: "Arm slot",
  follow_through: "Follow-through",
  video_quality: "Video quality",
}

function ScoresGrid({
  scores,
  metricsDetail,
}: {
  scores: AnalysisResult["scores"]
  metricsDetail: AnalysisResult["metrics_detail"]
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Mechanics breakdown</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(scores).map(([key, value]) => {
          const detail = metricsDetail[key]
          const lowConf = detail && detail.confidence < 0.4
          const color = value >= 80 ? "text-green-600" : value >= 60 ? "text-yellow-600" : "text-red-500"
          return (
            <div key={key} className="text-center p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500 font-medium">{SCORE_LABELS[key] ?? key}</p>
              <p className={`text-3xl font-bold mt-1 ${color}`}>{Math.round(value)}</p>
              {lowConf && (
                <p className="text-xs text-gray-400 mt-0.5">Low confidence</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SEVERITY_STYLES: Record<string, string> = {
  positive: "bg-green-50 border-green-200 text-green-900",
  focus: "bg-blue-50 border-blue-200 text-blue-900",
  caution: "bg-yellow-50 border-yellow-200 text-yellow-900",
  recording_quality: "bg-gray-50 border-gray-200 text-gray-700",
}

function FeedbackSection({ feedback }: { feedback: FeedbackItem[] }) {
  if (!feedback.length) return null
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Coaching feedback</h3>
      <div className="space-y-3">
        {feedback.map((item, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 ${SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.focus}`}
          >
            <p className="text-sm font-medium">{item.message}</p>
            <p className="text-sm mt-1 opacity-75">{item.suggestion}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4">
        BaseballAI Coach provides general training feedback. Not medical advice or professional coaching certification.
      </p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    uploading: "bg-yellow-100 text-yellow-700",
    uploaded: "bg-blue-100 text-blue-700",
    processing: "bg-purple-100 text-purple-700",
    analyzed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {cap(status)}
    </span>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
