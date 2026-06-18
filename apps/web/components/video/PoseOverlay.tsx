"use client"

import { useEffect, useRef } from "react"
import type { KeypointFrame } from "@/lib/types"

// Skeleton connections: pairs of landmark names
const CONNECTIONS: [string, string][] = [
  // Torso
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  // Left arm
  ["left_shoulder", "left_elbow"],
  ["left_elbow", "left_wrist"],
  // Right arm
  ["right_shoulder", "right_elbow"],
  ["right_elbow", "right_wrist"],
  // Left leg
  ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"],
  ["left_ankle", "left_heel"],
  // Right leg
  ["right_hip", "right_knee"],
  ["right_knee", "right_ankle"],
  ["right_ankle", "right_heel"],
]

const MIN_VISIBILITY = 0.3
const LINE_COLOR = "rgba(74, 222, 128, 0.85)"   // green-400
const JOINT_COLOR = "rgba(255, 255, 255, 0.95)"  // white
const JOINT_BORDER = "rgba(74, 222, 128, 0.95)"
const LOW_VIS_ALPHA = 0.3

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  keypoints: KeypointFrame[]
}

export default function PoseOverlay({ videoRef, canvasStyle, keypoints }: PoseOverlayProps & { canvasStyle?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !keypoints.length) return

    // Sync canvas intrinsic size to video natural size so scaling is consistent
    function syncSize() {
      if (!video || !canvas) return
      if (video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
      } else {
        canvas.width = video.offsetWidth
        canvas.height = video.offsetHeight
      }
    }

    function draw() {
      if (!video || !canvas) return
      syncSize()
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const frame = findClosestFrame(keypoints, video.currentTime)
      if (!frame || frame.conf < 0.1) return

      const W = canvas.width
      const H = canvas.height

      // Draw connections
      ctx.lineWidth = Math.max(2, W * 0.003)
      for (const [a, b] of CONNECTIONS) {
        const pa = frame.lm[a]
        const pb = frame.lm[b]
        if (!pa || !pb) continue
        const alpha = Math.min(pa.v, pb.v)
        if (alpha < MIN_VISIBILITY) continue
        ctx.strokeStyle = alpha > 0.6 ? LINE_COLOR : `rgba(74,222,128,${LOW_VIS_ALPHA})`
        ctx.beginPath()
        ctx.moveTo(pa.x * W, pa.y * H)
        ctx.lineTo(pb.x * W, pb.y * H)
        ctx.stroke()
      }

      // Draw joints
      const jointR = Math.max(3, W * 0.005)
      for (const [, pt] of Object.entries(frame.lm)) {
        if (pt.v < MIN_VISIBILITY) continue
        ctx.beginPath()
        ctx.arc(pt.x * W, pt.y * H, jointR, 0, 2 * Math.PI)
        ctx.fillStyle = pt.v > 0.6 ? JOINT_COLOR : `rgba(255,255,255,${LOW_VIS_ALPHA})`
        ctx.fill()
        ctx.strokeStyle = JOINT_BORDER
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }

    function onTimeUpdate() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(draw)
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("loadedmetadata", syncSize)
    // Draw once immediately if already at a position
    draw()

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("loadedmetadata", syncSize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [videoRef, keypoints])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        ...canvasStyle,
      }}
    />
  )
}

function findClosestFrame(frames: KeypointFrame[], time: number): KeypointFrame | null {
  if (!frames.length) return null
  let best = frames[0]
  let bestDiff = Math.abs(frames[0].t - time)
  for (const f of frames) {
    const diff = Math.abs(f.t - time)
    if (diff < bestDiff) {
      bestDiff = diff
      best = f
    }
    // Frames are sorted by time — stop searching when we've passed the window
    if (f.t > time + 1.0) break
  }
  return best
}
