"""
Pitching mechanics metric calculation from 2D pose keypoints.

All scores are 0–100. All functions return MetricResult with:
  score: float        — the mechanics score
  confidence: float   — how much to trust this score (0–1)
  details: dict       — raw values for debugging / export

Coordinate system (MediaPipe normalized):
  x: 0=left edge, 1=right edge of frame
  y: 0=top edge, 1=bottom edge (UP = decreasing y)

Side-view assumptions: pitcher faces across frame (stride visible in x direction).
"""

import math
from typing import Optional

import numpy as np

from app.analysis.schemas import FrameKeypoints, MetricResult, PitchingPhase
from app.analysis.phase_detection import frames_in_phase

# Below this visibility we skip the landmark
VIS_MIN = 0.35


# ── Video quality ─────────────────────────────────────────────────────────────

_QUALITY_LANDMARKS = [
    "nose",
    "left_shoulder", "right_shoulder",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle",
    "left_wrist", "right_wrist",
]


def calculate_video_quality(frames: list[FrameKeypoints]) -> MetricResult:
    if not frames:
        return MetricResult(score=0.0, confidence=0.0, details={"frames": 0})

    vis_per_frame: list[float] = []
    reliable_frames = 0

    for f in frames:
        vis = [
            f.landmarks[k].visibility
            for k in _QUALITY_LANDMARKS
            if k in f.landmarks and f.landmarks[k].visibility >= VIS_MIN
        ]
        avg = float(np.mean(vis)) if vis else 0.0
        vis_per_frame.append(avg)
        if avg > 0.65:
            reliable_frames += 1

    mean_vis = float(np.mean(vis_per_frame))
    coverage = reliable_frames / len(frames)

    # 60% weighted mean visibility + 40% frame coverage
    quality = (mean_vis * 0.6 + coverage * 0.4) * 100
    quality = float(np.clip(quality, 0, 100))

    return MetricResult(
        score=quality,
        confidence=0.9,
        details={
            "mean_visibility": round(mean_vis, 3),
            "reliable_frame_coverage": round(coverage, 3),
            "frames_analyzed": len(frames),
        },
    )


# ── Balance ───────────────────────────────────────────────────────────────────

def calculate_balance(
    frames: list[FrameKeypoints],
    phases: list[PitchingPhase],
) -> MetricResult:
    """
    Measure nose-to-hip-center horizontal (x) deviation during leg_lift phase.
    Lower deviation = better lateral balance.
    """
    leg_lift = _phase(phases, "leg_lift")
    set_pos = _phase(phases, "set_position")
    if leg_lift is None:
        return MetricResult(50.0, 0.2, {"reason": "no_leg_lift_phase"})

    set_frames = frames_in_phase(frames, set_pos) if set_pos else []
    lift_frames = frames_in_phase(frames, leg_lift)

    baseline_dev = _nose_hip_x_deviation(set_frames) if set_frames else None
    deviations = _nose_hip_x_deviations(lift_frames)

    if not deviations:
        return MetricResult(50.0, 0.2, {"reason": "insufficient_landmarks"})

    max_dev = max(deviations)
    base = baseline_dev if baseline_dev is not None else deviations[0]
    excess = max(0.0, max_dev - base)

    # 0.00 excess → 100, 0.15 excess → ~10
    score = float(np.clip(100 - excess * 600, 10, 100))
    confidence = _mean_conf(lift_frames, ["nose", "left_hip", "right_hip"])

    return MetricResult(
        score=score,
        confidence=confidence,
        details={
            "max_lateral_deviation": round(max_dev, 4),
            "baseline_deviation": round(base, 4),
            "excess_deviation": round(excess, 4),
        },
    )


def _nose_hip_x_deviations(frames: list[FrameKeypoints]) -> list[float]:
    devs: list[float] = []
    for f in frames:
        nose = f.landmarks.get("nose")
        lhip = f.landmarks.get("left_hip")
        rhip = f.landmarks.get("right_hip")
        if _all_vis(nose, lhip, rhip):
            hip_x = (lhip.x + rhip.x) / 2  # type: ignore[union-attr]
            devs.append(abs(nose.x - hip_x))  # type: ignore[union-attr]
    return devs


def _nose_hip_x_deviation(frames: list[FrameKeypoints]) -> Optional[float]:
    devs = _nose_hip_x_deviations(frames)
    return float(np.mean(devs)) if devs else None


# ── Head stability ────────────────────────────────────────────────────────────

def calculate_head_stability(
    frames: list[FrameKeypoints],
    phases: list[PitchingPhase],
) -> MetricResult:
    """
    Track nose x/y movement from set_position through release.
    Less movement = more stable head = higher score.
    """
    set_pos = _phase(phases, "set_position")
    stride = _phase(phases, "stride")
    release = _phase(phases, "release")

    analysis_phases = [p for p in [set_pos, stride, release] if p is not None]
    if not analysis_phases:
        return MetricResult(50.0, 0.2, {"reason": "no_phases"})

    tracked_frames: list[FrameKeypoints] = []
    for p in analysis_phases:
        tracked_frames.extend(frames_in_phase(frames, p))

    nose_xs: list[float] = []
    nose_ys: list[float] = []
    for f in tracked_frames:
        nose = f.landmarks.get("nose")
        if nose and nose.visibility >= VIS_MIN:
            nose_xs.append(nose.x)
            nose_ys.append(nose.y)

    if len(nose_xs) < 3:
        return MetricResult(50.0, 0.2, {"reason": "insufficient_nose_data"})

    x_range = max(nose_xs) - min(nose_xs)
    y_range = max(nose_ys) - min(nose_ys)
    total_movement = x_range + y_range

    # 0.00 total → 100, 0.25 total → ~0
    score = float(np.clip(100 - total_movement * 350, 0, 100))
    confidence = min(0.9, len(nose_xs) / max(len(tracked_frames), 1))

    return MetricResult(
        score=score,
        confidence=confidence,
        details={
            "nose_x_range": round(x_range, 4),
            "nose_y_range": round(y_range, 4),
            "total_movement": round(total_movement, 4),
        },
    )


# ── Stride ────────────────────────────────────────────────────────────────────

def calculate_stride(
    frames: list[FrameKeypoints],
    phases: list[PitchingPhase],
    throwing_hand: str = "right",
) -> MetricResult:
    """
    Lead ankle x-displacement from set_position to end of stride.
    Longer stride relative to frame = higher score (up to a point).
    """
    lead = "left" if throwing_hand == "right" else "right"
    ankle_key = f"{lead}_ankle"

    set_pos = _phase(phases, "set_position")
    stride = _phase(phases, "stride")
    if set_pos is None or stride is None:
        return MetricResult(50.0, 0.2, {"reason": "no_phases"})

    set_xs = _valid_attr(frames_in_phase(frames, set_pos), ankle_key, "x")
    stride_xs = _valid_attr(frames_in_phase(frames, stride)[-4:], ankle_key, "x")

    if not set_xs or not stride_xs:
        return MetricResult(50.0, 0.2, {"reason": "insufficient_ankle_data"})

    start_x = float(np.mean(set_xs))
    end_x = float(np.mean(stride_xs))
    displacement = abs(end_x - start_x)

    # In side view, stride of ~0.25–0.45 of frame width is typical for youth pitchers
    # 0.40 → 100, 0.10 → 25, 0.00 → 0
    score = float(np.clip(displacement * 250, 0, 100))
    confidence = _mean_conf(frames_in_phase(frames, stride), [ankle_key])

    return MetricResult(
        score=score,
        confidence=confidence,
        details={
            "ankle_x_start": round(start_x, 4),
            "ankle_x_end": round(end_x, 4),
            "displacement_normalized": round(displacement, 4),
        },
    )


# ── Arm slot ──────────────────────────────────────────────────────────────────

def calculate_arm_slot(
    frames: list[FrameKeypoints],
    phases: list[PitchingPhase],
    throwing_hand: str = "right",
) -> MetricResult:
    """
    Shoulder → elbow → wrist angle at/near release.
    Healthy range ~120–160°. Scores peak near 140°.

    Note: 2D side-view angle is a projection; arm slot depth is not captured.
    Treat as an approximation only.
    """
    release = _phase(phases, "release")
    if release is None:
        return MetricResult(50.0, 0.2, {"reason": "no_release_phase"})

    sh_key = f"{throwing_hand}_shoulder"
    el_key = f"{throwing_hand}_elbow"
    wr_key = f"{throwing_hand}_wrist"

    angles: list[float] = []
    for f in frames_in_phase(frames, release):
        sh = f.landmarks.get(sh_key)
        el = f.landmarks.get(el_key)
        wr = f.landmarks.get(wr_key)
        if not _all_vis(sh, el, wr, threshold=0.35):
            continue
        # Vectors: shoulder→elbow and elbow→wrist
        v1 = np.array([el.x - sh.x, el.y - sh.y])  # type: ignore[union-attr]
        v2 = np.array([wr.x - el.x, wr.y - el.y])  # type: ignore[union-attr]
        norms = np.linalg.norm(v1) * np.linalg.norm(v2)
        if norms < 1e-6:
            continue
        cos_a = float(np.clip(np.dot(v1, v2) / norms, -1, 1))
        angles.append(math.degrees(math.acos(cos_a)))

    if not angles:
        return MetricResult(50.0, 0.2, {"reason": "no_visible_arm_at_release"})

    avg_angle = float(np.mean(angles))
    # Peak score at 140°, falls off with distance
    score = float(np.clip(100 - abs(avg_angle - 140) * 1.5, 20, 100))
    confidence = float(np.clip(len(angles) / max(len(frames_in_phase(frames, release)), 1), 0.1, 0.9))

    return MetricResult(
        score=score,
        confidence=confidence,
        details={
            "avg_arm_angle_degrees": round(avg_angle, 1),
            "samples": len(angles),
        },
    )


# ── Follow-through ────────────────────────────────────────────────────────────

def calculate_follow_through(
    frames: list[FrameKeypoints],
    phases: list[PitchingPhase],
    throwing_hand: str = "right",
) -> MetricResult:
    """
    After release, throwing wrist should continue downward (y increasing)
    and torso/nose should move toward the target direction.
    """
    release = _phase(phases, "release")
    follow = _phase(phases, "follow_through")
    if release is None or follow is None:
        return MetricResult(50.0, 0.2, {"reason": "no_phases"})

    wr_key = f"{throwing_hand}_wrist"

    rel_ys = _valid_attr(frames_in_phase(frames, release), wr_key, "y")
    ft_ys = _valid_attr(frames_in_phase(frames, follow), wr_key, "y")

    if not rel_ys or len(ft_ys) < 2:
        return MetricResult(50.0, 0.2, {"reason": "insufficient_wrist_data"})

    rel_wrist_y = float(np.mean(rel_ys))
    ft_final_y = float(np.mean(ft_ys[-3:])) if len(ft_ys) >= 3 else ft_ys[-1]
    y_drop = ft_final_y - rel_wrist_y  # positive = wrist moving down = good

    # y_drop of 0.10+ = full follow-through
    score = float(np.clip(50 + y_drop * 450, 0, 100))
    confidence = _mean_conf(frames_in_phase(frames, follow), [wr_key])

    return MetricResult(
        score=score,
        confidence=confidence,
        details={
            "wrist_y_at_release": round(rel_wrist_y, 4),
            "wrist_y_at_ft_end": round(ft_final_y, 4),
            "wrist_y_drop": round(y_drop, 4),
        },
    )


# ── Overall score ─────────────────────────────────────────────────────────────

WEIGHTS = {
    "balance": 0.20,
    "head_stability": 0.20,
    "stride": 0.20,
    "arm_slot": 0.20,
    "follow_through": 0.15,
    "video_quality": 0.05,
}


def calculate_overall(scores: dict[str, float]) -> float:
    total = sum(scores.get(k, 50.0) * w for k, w in WEIGHTS.items())
    return float(np.clip(total, 0, 100))


# ── Utilities ─────────────────────────────────────────────────────────────────

def _phase(phases: list[PitchingPhase], name: str) -> Optional[PitchingPhase]:
    for p in phases:
        if p.name == name:
            return p
    return None


def _all_vis(*lms, threshold: float = VIS_MIN) -> bool:
    return all(lm is not None and lm.visibility >= threshold for lm in lms)


def _valid_attr(
    frames: list[FrameKeypoints], name: str, attr: str, min_vis: float = VIS_MIN
) -> list[float]:
    result: list[float] = []
    for f in frames:
        lm = f.landmarks.get(name)
        if lm and lm.visibility >= min_vis:
            result.append(getattr(lm, attr))
    return result


def _mean_conf(frames: list[FrameKeypoints], names: list[str]) -> float:
    all_vis: list[float] = []
    for f in frames:
        for name in names:
            lm = f.landmarks.get(name)
            if lm:
                all_vis.append(lm.visibility)
    return float(np.mean(all_vis)) if all_vis else 0.3
