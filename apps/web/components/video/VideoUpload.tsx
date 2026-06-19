"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import { api } from "@/lib/api"
import { getToken } from "@/lib/auth"

const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/x-m4v"]
const MAX_SIZE_MB = 500

const RECORDING_TIPS = [
  { icon: "📐", tip: "Film from the side — the pitcher's throwing arm should face you or be away from you (not toward/away)." },
  { icon: "🏃", tip: "Keep the pitcher's full body in frame: head to foot, for the entire pitch." },
  { icon: "💡", tip: "Film in good light — outdoors or well-lit cage. Avoid backlit or shadowed shots." },
  { icon: "📱", tip: "Hold the phone steady or lean it against a fence/dugout. Avoid panning while recording." },
  { icon: "🎥", tip: "Record one pitch per video for clearest analysis. 10–30 seconds is plenty." },
  { icon: "👕", tip: "Pitcher should wear fitted clothes — loose shirts hide joint positions." },
]

interface VideoUploadProps {
  sessionId: string
  onComplete: (videoId: string, jobId: string | null) => void
}

type UploadState = "idle" | "uploading" | "completing" | "done" | "error"

export default function VideoUpload({ sessionId, onComplete }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [showTips, setShowTips] = useState(false)

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Unsupported format. Use MP4 or MOV (got ${file.type || "unknown"}).`
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File too large. Maximum ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  async function handleFile(file: File) {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError("")
    setState("uploading")
    setProgress(0)

    try {
      const { video_id, upload_url, storage_provider } = await api.videos.initUpload(sessionId, {
        filename: file.name,
        content_type: file.type,
        size_bytes: file.size,
      })

      await uploadWithProgress(file, upload_url, storage_provider, setProgress)

      setState("completing")
      const completeRes = await api.videos.completeUpload(video_id)

      setState("done")
      onComplete(video_id, completeRes.analysis_job_id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setState("error")
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  if (state === "done") {
    return (
      <div className="text-center py-8 text-green-600">
        <p className="font-medium">Upload complete</p>
      </div>
    )
  }

  if (state === "uploading" || state === "completing") {
    return (
      <div className="py-6 space-y-3">
        <p className="text-sm text-gray-600 text-center">
          {state === "completing" ? "Finishing up…" : `Uploading… ${progress}%`}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-200"
            style={{ width: `${state === "completing" ? 100 : progress}%` }}
          />
        </div>
      </div>
    )
  }

  const isMobile = typeof window !== "undefined" && navigator.maxTouchPoints > 0

  return (
    <div className="space-y-3">
      {isMobile ? (
        /* Mobile: two tap targets — camera and file library */
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-8 px-4 text-center active:bg-blue-50 active:border-blue-400 transition-colors"
          >
            <span className="text-3xl">📷</span>
            <span className="text-sm font-medium text-gray-600">Record video</span>
            <span className="text-xs text-gray-400">Use camera</span>
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl py-8 px-4 text-center active:bg-blue-50 active:border-blue-400 transition-colors"
          >
            <span className="text-3xl">🎬</span>
            <span className="text-sm font-medium text-gray-600">Choose video</span>
            <span className="text-xs text-gray-400">From library</span>
          </button>
          {/* Camera capture input */}
          <input
            ref={cameraRef}
            type="file"
            accept="video/*"
            capture="environment"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : (
        /* Desktop: drag-and-drop zone */
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <p className="text-gray-500 text-sm font-medium">
            Drop video here or <span className="text-blue-600">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">MP4 or MOV · up to {MAX_SIZE_MB} MB</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,.mov,.mp4,.m4v,video/*"
        className="hidden"
        onChange={handleInputChange}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Recording tips */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTips((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium">📹 Tips for best analysis results</span>
          <span className="text-gray-400 text-xs">{showTips ? "Hide" : "Show"}</span>
        </button>
        {!showTips && (
          <div className="px-4 pb-3">
            <Link href="/guide" target="_blank" className="text-xs text-blue-500 hover:underline">
              Full recording guide →
            </Link>
          </div>
        )}
        {showTips && (
          <div className="px-4 pb-4 space-y-2.5 border-t border-gray-100">
            {RECORDING_TIPS.map((t, i) => (
              <div key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="shrink-0 text-base leading-snug">{t.icon}</span>
                <span>{t.tip}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function uploadWithProgress(
  file: File,
  uploadUrl: string,
  provider: string,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error("Network error during upload"))

    if (provider === "local") {
      const form = new FormData()
      form.append("file", file)
      xhr.open("POST", uploadUrl)
      const token = getToken()
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)
      xhr.send(form)
    } else {
      // R2 / S3 presigned PUT
      xhr.open("PUT", uploadUrl)
      xhr.setRequestHeader("Content-Type", file.type)
      xhr.send(file)
    }
  })
}
