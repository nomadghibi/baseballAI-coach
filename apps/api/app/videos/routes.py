import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.analysis.models import AnalysisJob
from app.analysis.worker import run_analysis_job_task
from app.auth.models import User
from app.core import storage as store
from app.core.config import settings
from app.core.deps import get_current_user, get_db
from app.videos import service
from app.videos.schemas import (
    CompleteUploadResponse,
    InitUploadRequest,
    InitUploadResponse,
    PlaybackUrlResponse,
    VideoResponse,
)

router = APIRouter(tags=["videos"])


@router.post(
    "/sessions/{session_id}/videos/init-upload",
    response_model=InitUploadResponse,
    status_code=201,
)
def init_upload(
    session_id: uuid.UUID,
    data: InitUploadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    video = service.init_upload(db, session_id, data, current_user.id)
    return InitUploadResponse(
        video_id=video.id,
        upload_url=store.get_upload_url(
            str(video.id),
            storage_key=video.storage_key,
            content_type=data.content_type,
        ),
        storage_provider=settings.storage_provider,
        max_size_bytes=settings.max_video_size_bytes,
    )


@router.post("/videos/{video_id}/upload", response_model=VideoResponse)
async def upload_local(
    video_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Local dev only — direct multipart upload to the API."""
    data = await file.read()
    content_type = file.content_type or "application/octet-stream"
    video = service.save_local_upload(db, video_id, current_user.id, data, content_type)
    return video


@router.post("/videos/{video_id}/complete-upload", response_model=CompleteUploadResponse)
def complete_upload(
    video_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    video = service.complete_upload(db, video_id, current_user.id)

    job = AnalysisJob(video_id=video.id, status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)

    background_tasks.add_task(run_analysis_job_task, job.id, video.id)

    return CompleteUploadResponse(
        video_id=video.id, status=video.status, analysis_job_id=job.id
    )


@router.get("/videos/{video_id}/playback-url", response_model=PlaybackUrlResponse)
def playback_url(
    video_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    video, url = service.get_playback_url(db, video_id, current_user.id)
    return PlaybackUrlResponse(video_id=video.id, playback_url=url, expires_in_seconds=900)


@router.get("/videos/{video_id}", response_model=VideoResponse)
def get_video(
    video_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_owned(db, video_id, current_user.id)


@router.delete("/videos/{video_id}", status_code=204)
def delete_video(
    video_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    video = service.get_owned(db, video_id, current_user.id)
    service.delete(db, video)
