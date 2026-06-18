"""
Heuristic pitching phase detection from 2D pose keypoints.

Side-view coordinate system:
  x: left→right across frame (pitcher strides across x)
  y: top→bottom (y=0 top, y=1 bottom — knee going UP means y DECREASING)

Phases detected:
  set_position → leg_lift → stride → release → follow_through
"""

import math
from typing import Optional

import numpy as np

from app.analysis.schemas import FrameKeypoints, PitchingPhase


def detect_phases(
    frames: list[FrameKeypoints],
    throwing_hand: str = "right",
) -> list[PitchingPhase]:
    if len(frames) < 8:
        return _equal_split(frames)

    lead = "left" if throwing_hand == "right" else "right"
    lead_knee = f"{lead}_knee"
    lead_ankle = f"{lead}_ankle"
    throw_wrist = f"{throwing_hand}_wrist"

    n = len(frames)
    times = [f.timestamp_sec for f in frames]

    # --- Smooth lead knee y series ---
    knee_y = _series(frames, lead_knee, "y")
    knee_y_smooth = _smooth(knee_y, window=5)

    # --- Find peak leg lift = minimum y of lead knee ---
    # (y=0 is top of frame, so minimum y = knee highest in frame)
    search_lo = max(1, n // 8)
    search_hi = min(n - 1, 7 * n // 10)
    peak_idx = _argmin_valid(knee_y_smooth, search_lo, search_hi)
    if peak_idx is None:
        return _equal_split(frames)

    # --- Set position end: first frame where knee y drops > threshold from start ---
    initial_knee = _first_valid(knee_y_smooth[:search_lo + 1])
    set_end_idx = max(0, peak_idx // 3)
    if initial_knee is not None:
        for i in range(peak_idx):
            v = knee_y_smooth[i]
            if v is not None and (initial_knee - v) > 0.04:
                set_end_idx = max(0, i - 1)
                break

    # --- Stride end: after peak_idx, lead ankle y stabilizes (foot plant) ---
    ankle_y = _series(frames, lead_ankle, "y")
    stride_end_idx = min(n - 2, peak_idx + (n - peak_idx) // 2)

    # Look for ankle y stabilizing after peak leg lift
    prev_ankle = None
    for i in range(peak_idx + 1, min(n - 1, peak_idx + (n - peak_idx) * 3 // 4)):
        av = ankle_y[i]
        if av is None:
            continue
        if prev_ankle is not None and abs(av - prev_ankle) < 0.008:
            stride_end_idx = i
            break
        prev_ankle = av

    # --- Release: peak wrist speed after stride ---
    wrist_x = _series(frames, throw_wrist, "x")
    wrist_y_s = _series(frames, throw_wrist, "y")
    wrist_speed = _speed_series(wrist_x, wrist_y_s)

    rel_search_lo = max(stride_end_idx, peak_idx + (n - peak_idx) // 4)
    rel_search_hi = min(n - 2, peak_idx + (n - peak_idx) * 4 // 5)
    release_idx = _argmax_valid(wrist_speed, rel_search_lo, rel_search_hi)
    if release_idx is None:
        release_idx = stride_end_idx + (n - stride_end_idx) // 3

    # Clamp phase boundaries so they don't overlap
    set_end_idx = max(0, min(set_end_idx, peak_idx - 1))
    stride_end_idx = max(peak_idx + 1, min(stride_end_idx, release_idx - 1))
    release_idx = max(stride_end_idx + 1, min(release_idx, n - 2))
    follow_start = release_idx

    def conf(lo: int, hi: int) -> float:
        vals = [frames[i].confidence for i in range(lo, min(hi + 1, n))]
        return float(np.mean(vals)) if vals else 0.3

    return [
        PitchingPhase("set_position",   times[0],           times[set_end_idx],  0,              set_end_idx,  conf(0, set_end_idx)),
        PitchingPhase("leg_lift",       times[set_end_idx], times[peak_idx],     set_end_idx,    peak_idx,     conf(set_end_idx, peak_idx)),
        PitchingPhase("stride",         times[peak_idx],    times[stride_end_idx], peak_idx,    stride_end_idx, conf(peak_idx, stride_end_idx)),
        PitchingPhase("release",        times[max(0, release_idx - 1)], times[min(release_idx + 1, n - 1)], max(0, release_idx - 1), min(release_idx + 1, n - 1), conf(release_idx - 1, release_idx + 1)),
        PitchingPhase("follow_through", times[follow_start], times[n - 1],       follow_start,   n - 1,        conf(follow_start, n - 1)),
    ]


# ── helpers ──────────────────────────────────────────────────────────────────

def _series(
    frames: list[FrameKeypoints], name: str, attr: str, min_vis: float = 0.3
) -> list[Optional[float]]:
    out: list[Optional[float]] = []
    for f in frames:
        lm = f.landmarks.get(name)
        if lm and lm.visibility >= min_vis:
            out.append(getattr(lm, attr))
        else:
            out.append(None)
    return out


def _smooth(values: list[Optional[float]], window: int = 5) -> list[Optional[float]]:
    half = window // 2
    result: list[Optional[float]] = []
    for i in range(len(values)):
        seg = [v for v in values[max(0, i - half): i + half + 1] if v is not None]
        result.append(sum(seg) / len(seg) if seg else None)
    return result


def _first_valid(values: list[Optional[float]]) -> Optional[float]:
    for v in values:
        if v is not None:
            return v
    return None


def _argmin_valid(
    values: list[Optional[float]], lo: int, hi: int
) -> Optional[int]:
    best_i, best_v = None, math.inf
    for i in range(lo, min(hi + 1, len(values))):
        v = values[i]
        if v is not None and v < best_v:
            best_v = v
            best_i = i
    return best_i


def _argmax_valid(
    values: list[Optional[float]], lo: int, hi: int
) -> Optional[int]:
    best_i, best_v = None, -math.inf
    for i in range(lo, min(hi + 1, len(values))):
        v = values[i]
        if v is not None and v > best_v:
            best_v = v
            best_i = i
    return best_i


def _speed_series(
    xs: list[Optional[float]], ys: list[Optional[float]]
) -> list[Optional[float]]:
    speed: list[Optional[float]] = [None]
    for i in range(1, len(xs)):
        x0, x1 = xs[i - 1], xs[i]
        y0, y1 = ys[i - 1], ys[i]
        if x0 is not None and x1 is not None and y0 is not None and y1 is not None:
            speed.append(math.hypot(x1 - x0, y1 - y0))
        else:
            speed.append(None)
    return speed


def _equal_split(frames: list[FrameKeypoints]) -> list[PitchingPhase]:
    """Fallback: divide video into 5 equal segments."""
    n = len(frames)
    if n == 0:
        return []
    t = [f.timestamp_sec for f in frames]
    cuts = [0, n // 5, 2 * n // 5, 3 * n // 5, 4 * n // 5, n - 1]
    names = ["set_position", "leg_lift", "stride", "release", "follow_through"]
    return [
        PitchingPhase(
            name=names[i],
            start_sec=t[cuts[i]],
            end_sec=t[cuts[i + 1]],
            start_frame_idx=cuts[i],
            end_frame_idx=cuts[i + 1],
            confidence=0.3,
        )
        for i in range(5)
    ]


def frames_in_phase(
    frames: list[FrameKeypoints], phase: PitchingPhase
) -> list[FrameKeypoints]:
    return frames[phase.start_frame_idx: phase.end_frame_idx + 1]
