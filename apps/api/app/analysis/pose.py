"""
Pose extraction using MediaPipe Pose.
Install: pip install -r requirements-cv.txt
"""

import math
from typing import Optional

import numpy as np

from app.analysis.schemas import FrameKeypoints, Landmark, VideoMetadata

# Target analysis frame rate — reduces compute without losing temporal resolution
TARGET_FPS = 15.0

# Minimum visibility for a landmark to be considered reliable
VISIBILITY_THRESHOLD = 0.3

# MediaPipe pose landmark indices → readable names (subset we care about)
LANDMARK_MAP: dict[int, str] = {
    0: "nose",
    11: "left_shoulder",
    12: "right_shoulder",
    13: "left_elbow",
    14: "right_elbow",
    15: "left_wrist",
    16: "right_wrist",
    23: "left_hip",
    24: "right_hip",
    25: "left_knee",
    26: "right_knee",
    27: "left_ankle",
    28: "right_ankle",
    29: "left_heel",
    30: "right_heel",
}

# Landmarks used to calculate per-frame body confidence
BODY_CONFIDENCE_LANDMARKS = [
    "left_shoulder", "right_shoulder",
    "left_hip", "right_hip",
    "left_knee", "right_knee",
    "left_ankle", "right_ankle",
]


def extract_video_metadata(video_path: str) -> VideoMetadata:
    try:
        import cv2
    except ImportError:
        raise ImportError("opencv not installed. Run: pip install -r requirements-cv.txt")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise ValueError(f"Cannot open video: {video_path}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    return VideoMetadata(
        path=video_path,
        fps=fps,
        frame_count=frame_count,
        width=width,
        height=height,
        duration_seconds=frame_count / fps if fps > 0 else 0.0,
    )


def extract_pose_keypoints(video_path: str) -> tuple[VideoMetadata, list[FrameKeypoints]]:
    """
    Open video, sample frames at TARGET_FPS, run MediaPipe Pose,
    smooth results, and return metadata + per-frame keypoints.
    """
    try:
        import cv2
        import mediapipe as mp
    except ImportError:
        raise ImportError(
            "CV deps not installed. Run: pip install -r requirements-cv.txt"
        )

    meta = extract_video_metadata(video_path)
    sample_every_n = max(1, round(meta.fps / TARGET_FPS))

    mp_pose = mp.solutions.pose
    frames: list[FrameKeypoints] = []

    cap = cv2.VideoCapture(video_path)
    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=1,
        smooth_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as pose:
        frame_idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_every_n == 0:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = pose.process(rgb)

                if results.pose_landmarks:
                    raw = results.pose_landmarks.landmark
                    landmarks: dict[str, Landmark] = {}
                    for idx, name in LANDMARK_MAP.items():
                        if idx < len(raw):
                            landmarks[name] = Landmark(
                                x=float(raw[idx].x),
                                y=float(raw[idx].y),
                                visibility=float(raw[idx].visibility),
                            )
                    confidence = _body_confidence(landmarks)
                else:
                    landmarks = {}
                    confidence = 0.0

                frames.append(FrameKeypoints(
                    frame_idx=frame_idx,
                    timestamp_sec=frame_idx / meta.fps,
                    landmarks=landmarks,
                    confidence=confidence,
                ))

            frame_idx += 1

    cap.release()

    frames = _smooth_keypoints(frames, window=3)
    meta.frames_analyzed = len(frames)
    return meta, frames


def _body_confidence(landmarks: dict[str, Landmark]) -> float:
    vis = [
        landmarks[k].visibility
        for k in BODY_CONFIDENCE_LANDMARKS
        if k in landmarks
    ]
    return float(np.mean(vis)) if vis else 0.0


def _smooth_keypoints(frames: list[FrameKeypoints], window: int = 3) -> list[FrameKeypoints]:
    """Apply moving-average smoothing to x/y of each landmark across frames."""
    if len(frames) < 2:
        return frames

    all_names: set[str] = set()
    for f in frames:
        all_names.update(f.landmarks.keys())

    for name in all_names:
        xs = [f.landmarks[name].x if name in f.landmarks else math.nan for f in frames]
        ys = [f.landmarks[name].y if name in f.landmarks else math.nan for f in frames]
        xs_s = _moving_avg(xs, window)
        ys_s = _moving_avg(ys, window)

        for i, f in enumerate(frames):
            if name in f.landmarks and not math.isnan(xs_s[i]):
                f.landmarks[name] = Landmark(
                    x=xs_s[i],
                    y=ys_s[i],
                    visibility=f.landmarks[name].visibility,
                )
    return frames


def _moving_avg(values: list[float], window: int) -> list[float]:
    result: list[float] = []
    half = window // 2
    for i in range(len(values)):
        segment = [v for v in values[max(0, i - half): i + half + 1] if not math.isnan(v)]
        result.append(sum(segment) / len(segment) if segment else math.nan)
    return result


def get_landmark_series(
    frames: list[FrameKeypoints],
    name: str,
    attr: str = "y",
    min_visibility: float = VISIBILITY_THRESHOLD,
) -> list[Optional[float]]:
    """Extract a single attribute from a named landmark across all frames."""
    out: list[Optional[float]] = []
    for f in frames:
        lm = f.landmarks.get(name)
        if lm and lm.visibility >= min_visibility:
            out.append(getattr(lm, attr))
        else:
            out.append(None)
    return out
