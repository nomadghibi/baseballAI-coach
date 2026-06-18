from dataclasses import dataclass, field


@dataclass
class Landmark:
    x: float
    y: float
    visibility: float


@dataclass
class FrameKeypoints:
    frame_idx: int
    timestamp_sec: float
    landmarks: dict  # name -> Landmark
    confidence: float  # mean visibility of key body landmarks


@dataclass
class VideoMetadata:
    path: str
    fps: float
    frame_count: int
    width: int
    height: int
    duration_seconds: float
    frames_analyzed: int = 0


@dataclass
class PitchingPhase:
    name: str
    start_sec: float
    end_sec: float
    start_frame_idx: int
    end_frame_idx: int
    confidence: float


@dataclass
class MetricResult:
    score: float       # 0–100
    confidence: float  # 0–1
    details: dict


@dataclass
class FeedbackItem:
    category: str
    severity: str      # positive | focus | caution | recording_quality
    message: str
    suggestion: str
