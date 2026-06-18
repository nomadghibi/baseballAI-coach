"use client"

import { useRef, useState } from "react"
import { api } from "@/lib/api"
import { getToken } from "@/lib/auth"

const ALLOWED_TYPES = ["video/mp4", "video/quicktime", "video/x-m4v"]
const MAX_SIZE_MB = 500

interface VideoUploadProps {
  sessionId: string
  onComplete: (videoId: string) => void
}

type UploadState = "idle" | "uploading" | "completing" | "done" | "error"

export default function VideoUpload({ sessionId, onComplete }: VideoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")

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
      await api.videos.completeUpload(video_id)

      setState("done")
      onComplete(video_id)
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

  return (
    <div className="space-y-3">
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
        <p className="text-xs text-gray-400 mt-3">
          Tip: record from the side for best analysis results
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,.mov,.mp4,.m4v"
        className="hidden"
        onChange={handleInputChange}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
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
