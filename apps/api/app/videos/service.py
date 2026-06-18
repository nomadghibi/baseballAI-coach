import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.athletes.models import Athlete
from app.core import storage as store
from app.core.config import settings
from app.sessions.models import PitchingSession
from app.videos.models import Video
from app.videos.schemas import InitUploadRequest


def _get_session_owned(
    db: Session, session_id: uuid.UUID, owner_id: uuid.UUID
) -> PitchingSession:
    ps = (
        db.query(PitchingSession)
        .join(Athlete, Athlete.id == PitchingSession.athlete_id)
        .filter(PitchingSession.id == session_id, Athlete.owner_user_id == owner_id)
        .first()
    )
    if not ps:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return ps


def get_owned(db: Session, video_id: uuid.UUID, owner_id: uuid.UUID) -> Video:
    video = (
        db.query(Video)
        .filter(Video.id == video_id, Video.owner_user_id == owner_id)
        .first()
    )
    if not video:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Video not found")
    return video


def init_upload(
    db: Session,
    session_id: uuid.UUID,
    data: InitUploadRequest,
    owner_id: uuid.UUID,
) -> Video:
    if data.content_type not in settings.allowed_video_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported file type. Allowed: {', '.join(settings.allowed_video_types)}",
        )
    if data.size_bytes > settings.max_video_size_bytes:
        max_mb = settings.max_video_size_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File too large. Maximum {max_mb} MB.",
        )

    ps = _get_session_owned(db, session_id, owner_id)
    video_id = uuid.uuid4()
    storage_key = store.build_storage_key(str(owner_id), str(video_id), data.filename)

    video = Video(
        id=video_id,
        session_id=ps.id,
        owner_user_id=owner_id,
        storage_provider=settings.storage_provider,
        storage_key=storage_key,
        original_filename=data.filename,
        content_type=data.content_type,
        size_bytes=data.size_bytes,
        status="uploading",
    )
    db.add(video)
    db.commit()
    db.refresh(video)
    return video


def save_local_upload(
    db: Session, video_id: uuid.UUID, owner_id: uuid.UUID, file_data: bytes, content_type: str
) -> Video:
    video = get_owned(db, video_id, owner_id)
    if video.status != "uploading":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Video not in uploading state")
    if content_type not in settings.allowed_video_types:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unsupported file type"
        )
    if len(file_data) > settings.max_video_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="File too large"
        )
    store.save_file(video.storage_key, file_data)
    video.status = "uploaded"
    video.size_bytes = len(file_data)
    db.commit()
    db.refresh(video)
    return video


def complete_upload(db: Session, video_id: uuid.UUID, owner_id: uuid.UUID) -> Video:
    video = get_owned(db, video_id, owner_id)
    if video.status not in ("uploaded", "uploading"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot complete upload in status '{video.status}'",
        )
    if video.status == "uploading":
        # File was uploaded directly (e.g. external storage). Mark uploaded.
        video.status = "uploaded"
        db.commit()
        db.refresh(video)
    return video


def get_playback_url(db: Session, video_id: uuid.UUID, owner_id: uuid.UUID) -> tuple[Video, str]:
    video = get_owned(db, video_id, owner_id)
    if video.status not in ("uploaded", "analyzed"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Video not ready for playback",
        )
    url = store.get_playback_url(video.storage_key)
    return video, url


def delete(db: Session, video: Video) -> None:
    store.delete_file(video.storage_key)
    db.delete(video)
    db.commit()
