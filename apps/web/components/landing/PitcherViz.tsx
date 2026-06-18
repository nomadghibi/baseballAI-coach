"use client";
import { motion } from "framer-motion";

const J = {
  head:      [185, 56] as const,
  neck:      [185, 82] as const,
  lShoulder: [148, 108] as const,
  rShoulder: [222, 108] as const,
  lElbow:    [115, 150] as const,
  rElbow:    [252, 78] as const,
  lWrist:    [92,  174] as const,
  rWrist:    [274, 50] as const,
  hipC:      [184, 204] as const,
  lHip:      [163, 204] as const,
  rHip:      [205, 204] as const,
  lKnee:     [154, 168] as const,
  lAnkle:    [158, 210] as const,
  rKnee:     [212, 268] as const,
  rAnkle:    [212, 334] as const,
};

type JKey = keyof typeof J;

const LINES: [JKey, JKey][] = [
  ["neck", "lShoulder"],
  ["neck", "rShoulder"],
  ["lShoulder", "lElbow"],
  ["lElbow", "lWrist"],
  ["rShoulder", "rElbow"],
  ["rElbow", "rWrist"],
  ["neck", "hipC"],
  ["lShoulder", "lHip"],
  ["rShoulder", "rHip"],
  ["lHip", "rHip"],
  ["lHip", "lKnee"],
  ["lKnee", "lAnkle"],
  ["rHip", "rKnee"],
  ["rKnee", "rAnkle"],
];

const BIG = new Set<JKey>(["lShoulder", "rShoulder", "lHip", "rHip"]);
const HOT = new Set<JKey>(["rElbow", "rWrist", "lKnee"]);

const METRICS = [
  { label: "Arm Angle",   value: "87°",   x: 298, y: 62,  side: "right", color: "#38BDF8" },
  { label: "Hip Rotation", value: "94°/s", x: 278, y: 208, side: "right", color: "#F59E0B" },
  { label: "Leg Kick",    value: "High",  x: 58,  y: 152, side: "left",  color: "#A3E635" },
];

const PHASES = ["Setup", "Leg Kick", "Stride", "Release", "Follow"];

export default function PitcherViz() {
  return (
    <div className="relative w-full max-w-[390px] glass-card glow-amber animate-float select-none">
      {/* Top badges */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/25 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-[10px] font-bold tracking-wider uppercase">Wind-Up</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1">
          <span className="text-slate-400 text-[10px] font-medium">
            Conf.{" "}
            <span className="text-emerald-400 font-bold">94%</span>
          </span>
        </div>
      </div>

      {/* SVG skeleton */}
      <svg
        viewBox="0 0 390 380"
        className="w-full"
        role="img"
        aria-label="AI pitcher skeleton overlay visualization"
      >
        <defs>
          <filter id="glow-sm" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-lg" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="bg-vignette" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#122040" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#04080F" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="scan-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle background glow */}
        <ellipse cx="185" cy="195" rx="145" ry="170" fill="url(#bg-vignette)" />

        {/* Skeleton lines */}
        {LINES.map(([a, b], i) => (
          <motion.line
            key={`${a}-${b}`}
            x1={J[a][0]} y1={J[a][1]}
            x2={J[b][0]} y2={J[b][1]}
            stroke="#F59E0B"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.38 }}
            transition={{ duration: 0.35, delay: 0.25 + i * 0.04 }}
          />
        ))}

        {/* Head circle */}
        <motion.circle
          cx={J.head[0]} cy={J.head[1]} r={20}
          fill="none"
          stroke="#38BDF8"
          strokeWidth={2.5}
          filter="url(#glow-sm)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.85, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        />

        {/* Joints */}
        {(Object.entries(J) as [JKey, readonly [number, number]][])
          .filter(([k]) => k !== "head")
          .map(([key, [cx, cy]], i) => {
            const r = BIG.has(key) ? 6.5 : HOT.has(key) ? 5.5 : 4.5;
            const color = HOT.has(key) ? "#FBBF24" : "#F59E0B";
            const filter = BIG.has(key) || HOT.has(key) ? "url(#glow-sm)" : undefined;
            return (
              <motion.circle
                key={key}
                cx={cx} cy={cy} r={r}
                fill={color}
                filter={filter}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.45 + i * 0.035 }}
              />
            );
          })}

        {/* Ball at rWrist — glowing pulse */}
        <motion.circle
          cx={J.rWrist[0]} cy={J.rWrist[1]} r={11}
          fill="#F59E0B"
          opacity={0}
          filter="url(#glow-lg)"
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        />
        <motion.circle
          cx={J.rWrist[0]} cy={J.rWrist[1]} r={5.5}
          fill="#FBBF24"
          filter="url(#glow-lg)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.75 }}
        />

        {/* Metric floating labels */}
        {METRICS.map((m, i) => {
          const isLeft = m.side === "left";
          const bx = isLeft ? m.x - 4 : m.x - 82;
          return (
            <motion.g
              key={m.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 + i * 0.18 }}
            >
              <rect x={bx} y={m.y - 2} width={82} height={30} rx={7} fill={m.color} opacity={0.1} />
              <rect x={bx} y={m.y - 2} width={82} height={30} rx={7} fill="none" stroke={m.color} strokeOpacity={0.2} strokeWidth={0.8} />
              <text x={bx + 8} y={m.y + 10} fill={m.color} opacity={0.6} fontSize={9} fontFamily="Inter,sans-serif" fontWeight="500">
                {m.label}
              </text>
              <text x={bx + 8} y={m.y + 22} fill={m.color} fontSize={11} fontFamily="Inter,sans-serif" fontWeight="700">
                {m.value}
              </text>
            </motion.g>
          );
        })}

        {/* Scan line */}
        <motion.rect
          x={55} y={0} width={280} height={3} rx={1.5}
          fill="url(#scan-line)"
          opacity={0.55}
          animate={{ y: [60, 345, 60] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "linear", delay: 1.5 }}
        />
      </svg>

      {/* Phase timeline strip */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06]">
        {PHASES.map((phase, i) => (
          <span
            key={phase}
            className={`text-[9px] font-bold px-2 py-1 rounded-full tracking-wide ${
              i === 1
                ? "bg-amber-400/15 text-amber-400 border border-amber-400/20"
                : "text-slate-600"
            }`}
          >
            {phase}
          </span>
        ))}
      </div>
    </div>
  );
}
