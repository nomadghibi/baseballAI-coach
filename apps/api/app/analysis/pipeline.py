"""
Main CV pipeline orchestrator.

Usage (from apps/api/):
    from app.analysis.pipeline import analyze_video
    result = analyze_video("path/to/video.mp4", throwing_hand="right")
"""

import dataclasses
from typing import Any

from app.analysis.feedback import generate_feedback
from app.analysis.metrics import (
    WEIGHTS,
    calculate_arm_slot,
    calculate_balance,
    calculate_follow_through,
    calculate_head_stability,
    calculate_overall,
    calculate_stride,
    calculate_video_quality,
)
from app.analysis.phase_detection import detect_phases
from app.analysis.pose import extract_pose_keypoints
from app.analysis.schemas import FeedbackItem, FrameKeypoints, MetricResult, PitchingPhase, VideoMetadata


def analyze_video(
    video_path: str,
    throwing_hand: str = "right",
) -> dict[str, Any]:
    """
    Full CV pipeline: video → pose → phases → metrics → feedback → dict output.

    Returns a JSON-serializable dict ready for saving to the database
    or printing from the CLI.
    """
    # 1. Extract pose keypoints
    meta, frames = extract_pose_keypoints(video_path)

    if not frames:
        return _empty_result(meta, "No pose data extracted from video")

    # 2. Detect pitching phases
    phases = detect_phases(frames, throwing_hand=throwing_hand)

    # 3. Calculate metrics
    vq = calculate_video_quality(frames)
    balance = calculate_balance(frames, phases)
    head = calculate_head_stability(frames, phases)
    stride = calculate_stride(frames, phases, throwing_hand=throwing_hand)
    arm = calculate_arm_slot(frames, phases, throwing_hand=throwing_hand)
    follow = calculate_follow_through(frames, phases, throwing_hand=throwing_hand)

    metric_results: dict[str, MetricResult] = {
        "balance": balance,
        "head_stability": head,
        "stride": stride,
        "arm_slot": arm,
        "follow_through": follow,
        "video_quality": vq,
    }

    scores = {k: round(v.score, 1) for k, v in metric_results.items()}
    overall = round(calculate_overall(scores), 1)

    # 4. Generate feedback
    feedback_items = generate_feedback(scores, metric_results, vq.score)

    # 5. Build output dict
    return {
        "status": "completed",
        "metadata": _meta_dict(meta),
        "overall_score": overall,
        "scores": scores,
        "phases": [_phase_dict(p) for p in phases],
        "metrics_detail": {k: _metric_dict(v) for k, v in metric_results.items()},
        "feedback": [_feedback_dict(f) for f in feedback_items],
        "keypoints_sample": _sample_keypoints(frames, max_frames=60),
    }


# ── Serialisation helpers ─────────────────────────────────────────────────────

def _meta_dict(m: VideoMetadata) -> dict:
    return {
        "path": m.path,
        "fps": round(m.fps, 2),
        "frame_count": m.frame_count,
        "frames_analyzed": m.frames_analyzed,
        "width": m.width,
        "height": m.height,
        "duration_seconds": round(m.duration_seconds, 3),
    }


def _phase_dict(p: PitchingPhase) -> dict:
    return {
        "name": p.name,
        "start_sec": round(p.start_sec, 3),
        "end_sec": round(p.end_sec, 3),
        "confidence": round(p.confidence, 3),
    }


def _metric_dict(m: MetricResult) -> dict:
    return {
        "score": round(m.score, 1),
        "confidence": round(m.confidence, 3),
        "details": m.details,
    }


def _feedback_dict(f: FeedbackItem) -> dict:
    return {
        "category": f.category,
        "severity": f.severity,
        "message": f.message,
        "suggestion": f.suggestion,
    }


def _sample_keypoints(frames: list[FrameKeypoints], max_frames: int = 60) -> list[dict]:
    """Return a sampled subset of keypoint frames for storage / overlay."""
    if len(frames) <= max_frames:
        sampled = frames
    else:
        step = len(frames) / max_frames
        sampled = [frames[int(i * step)] for i in range(max_frames)]

    result = []
    for f in sampled:
        lm_dict = {
            name: {"x": round(lm.x, 4), "y": round(lm.y, 4), "v": round(lm.visibility, 3)}
            for name, lm in f.landmarks.items()
        }
        result.append({
            "t": round(f.timestamp_sec, 3),
            "fi": f.frame_idx,
            "conf": round(f.confidence, 3),
            "lm": lm_dict,
        })
    return result


def _empty_result(meta: VideoMetadata, reason: str) -> dict:
    return {
        "status": "failed",
        "reason": reason,
        "metadata": _meta_dict(meta),
        "overall_score": 0,
        "scores": {},
        "phases": [],
        "metrics_detail": {},
        "feedback": [
            {
                "category": "recording_quality",
                "severity": "caution",
                "message": "Could not extract pose data from this video.",
                "suggestion": (
                    "Record from a side angle with the full body visible, "
                    "good lighting, and the pitcher in frame for the entire pitch."
                ),
            }
        ],
        "keypoints_sample": [],
    }
