from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SessionCreate(BaseModel):
    title: str
    session_date: date
    location_type: str | None = None
    camera_angle: str | None = None
    notes: str | None = None


class SessionUpdate(BaseModel):
    title: str | None = None
    session_date: date | None = None
    location_type: str | None = None
    camera_angle: str | None = None
    notes: str | None = None


class VideoSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    status: str
    size_bytes: int | None
    content_type: str
    created_at: datetime


class SessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    athlete_id: UUID
    title: str
    session_date: date
    location_type: str | None
    camera_angle: str | None
    notes: str | None
    created_at: datetime
    updated_at: datetime
    video: VideoSummary | None = None


class SessionListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    session_date: date
    location_type: str | None
    camera_angle: str | None
    created_at: datetime
    video_status: str | None = None
