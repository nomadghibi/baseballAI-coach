from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AnalysisJobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    video_id: UUID
    status: str
    error_message: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    created_at: datetime


class AnalysisResultResponse(BaseModel):
    video_id: UUID
    session_id: UUID
    athlete_id: UUID
    overall_score: float
    scores: dict
    phases: list
    metrics_detail: dict
    feedback: list
    keypoints: list
    created_at: str
