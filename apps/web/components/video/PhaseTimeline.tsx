"use client"

interface Phase {
  name: string
  start_sec: number
  end_sec: number
  confidence: number
}

interface PhaseTimelineProps {
  phases: Phase[]
  duration: number
  onSeek: (time: number) => void
}

const PHASE_STYLES: Record<string, { bg: string; label: string }> = {
  set_position:  { bg: "bg-slate-400",  label: "Set" },
  leg_lift:      { bg: "bg-blue-400",   label: "Leg Lift" },
  stride:        { bg: "bg-emerald-400",label: "Stride" },
  release:       { bg: "bg-orange-400", label: "Release" },
  follow_through:{ bg: "bg-purple-400", label: "Follow-thru" },
}

export default function PhaseTimeline({ phases, duration, onSeek }: PhaseTimelineProps) {
  if (!phases.length || !duration) return null
  const total = duration

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-400 font-medium">Pitch phases — click to seek</p>
      <div className="flex w-full h-7 rounded-lg overflow-hidden gap-px">
        {phases.map((phase) => {
          const phaseDur = phase.end_sec - phase.start_sec
          const pct = Math.max(2, (phaseDur / total) * 100)
          const style = PHASE_STYLES[phase.name] ?? { bg: "bg-gray-300", label: phase.name }
          const lowConf = phase.confidence < 0.45

          return (
            <button
              key={phase.name}
              onClick={() => onSeek(phase.start_sec)}
              title={`${style.label} (${phase.start_sec.toFixed(1)}s – ${phase.end_sec.toFixed(1)}s)`}
              style={{ width: `${pct}%` }}
              className={`${style.bg} ${lowConf ? "opacity-50" : "opacity-90"} hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium truncate px-1 focus:outline-none`}
            >
              <span className="hidden sm:block truncate">{style.label}</span>
            </button>
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {phases.map((phase) => {
          const style = PHASE_STYLES[phase.name] ?? { bg: "bg-gray-300", label: phase.name }
          const dur = (phase.end_sec - phase.start_sec).toFixed(1)
          return (
            <span key={phase.name} className="flex items-center gap-1 text-xs text-gray-500">
              <span className={`inline-block w-2 h-2 rounded-full ${style.bg}`} />
              {style.label} {dur}s
            </span>
          )
        })}
      </div>
    </div>
  )
}
