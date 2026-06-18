"use client"

import type { TrendPoint } from "@/lib/types"
import Link from "next/link"

interface MetricTrendProps {
  trends: TrendPoint[]
}

const W = 600
const H = 190
const PAD = { top: 28, right: 16, bottom: 40, left: 32 }
const CHART_W = W - PAD.left - PAD.right
const CHART_H = H - PAD.top - PAD.bottom

const GRID_SCORES = [0, 25, 50, 75, 100]

export default function MetricTrend({ trends }: MetricTrendProps) {
  if (trends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        Analyze your first session to start tracking progress.
      </div>
    )
  }

  if (trends.length === 1) {
    const t = trends[0]
    return (
      <div className="text-center py-6 text-gray-500 text-sm space-y-1">
        <p className="text-3xl font-bold text-gray-900">{Math.round(t.overall_score)}</p>
        <p>First session analyzed — add more to see the trend.</p>
        <p className="text-xs text-gray-400">{fmtDate(t.date)} · {t.session_title}</p>
      </div>
    )
  }

  function xOf(i: number) {
    return PAD.left + (i / (trends.length - 1)) * CHART_W
  }
  function yOf(score: number) {
    return PAD.top + CHART_H - (score / 100) * CHART_H
  }

  const pts = trends.map((t, i) => [xOf(i), yOf(t.overall_score)] as [number, number])
  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ")
  // Area fill path
  const areaPath = `M ${xOf(0)},${yOf(0)} L ${polyline.replace(/,/g, " L ").replace(/ L /g, ",")} L ${xOf(trends.length - 1)},${yOf(0)} Z`.replace("M ", "M").replace(" L ", " ") // build as polygon

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400 font-medium">Overall score over time</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 190 }}>
        <defs>
          <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {GRID_SCORES.map((s) => (
          <g key={s}>
            <line
              x1={PAD.left} x2={W - PAD.right}
              y1={yOf(s)} y2={yOf(s)}
              stroke="#f3f4f6" strokeWidth="1"
            />
            <text x={PAD.left - 5} y={yOf(s) + 4} textAnchor="end" fontSize={9} fill="#d1d5db">
              {s}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <polygon
          points={`${xOf(0)},${yOf(0)} ${polyline} ${xOf(trends.length - 1)},${yOf(0)}`}
          fill="url(#trendFill)"
        />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots + labels */}
        {pts.map(([x, y], i) => {
          const t = trends[i]
          const score = Math.round(t.overall_score)
          const isFirst = i === 0
          const isLast = i === trends.length - 1
          const dotColor = isLast ? "#2563eb" : "#3b82f6"
          return (
            <g key={i}>
              {/* Score label */}
              <text
                x={x}
                y={y - 10}
                textAnchor="middle"
                fontSize={11}
                fill="#1f2937"
                fontWeight="700"
              >
                {score}
              </text>
              {/* Dot */}
              <circle
                cx={x} cy={y} r={isLast ? 6 : 4}
                fill="white"
                stroke={dotColor}
                strokeWidth={isLast ? 3 : 2}
              />
              {/* Date label */}
              <text
                x={x}
                y={H - 4}
                textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                fontSize={9}
                fill="#9ca3af"
              >
                {fmtShortDate(t.date)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function fmtShortDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  })
}
