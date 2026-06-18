from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class InitUploadRequest(BaseModel):
    filename: str
    content_type: str
    size_bytes: int

    @field_validator("filename")
    @classmethod
    def filename_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Filename required")
        return v.strip()


class InitUploadResponse(BaseModel):
    video_id: UUID
    upload_url: str
    storage_provider: str
    max_size_bytes: int


class CompleteUploadResponse(BaseModel):
    video_id: UUID
    status: str
    analysis_job_id: UUID | None = None


class PlaybackUrlResponse(BaseModel):
    video_id: UUID
    playback_url: str
    expires_in_seconds: int


class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    session_id: UUID
    owner_user_id: UUID
    storage_provider: str
    original_filename: str
    content_type: str
    size_bytes: int | None
    duration_seconds: Decimal | None
    fps: Decimal | None
    width: int | None
    height: int | None
    status: str
    created_at: datetime
    updated_at: datetime
