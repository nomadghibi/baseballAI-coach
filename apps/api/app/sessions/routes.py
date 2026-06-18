import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.models import User
from app.core.deps import get_current_user, get_db
from app.sessions import service
from app.sessions.models import PitchingSession
from app.sessions.schemas import (
    SessionCreate,
    SessionListItem,
    SessionResponse,
    SessionUpdate,
    VideoSummary,
)
from app.videos.models import Video

router = APIRouter(tags=["sessions"])


def _attach_video(db: Session, pitching_session: PitchingSession) -> SessionResponse:
    video = db.query(Video).filter(Video.session_id == pitching_session.id).first()
    data = SessionResponse.model_validate(pitching_session)
    if video:
        data.video = VideoSummary.model_validate(video)
    return data


@router.post("/athletes/{athlete_id}/sessions", response_model=SessionResponse, status_code=201)
def create_session(
    athlete_id: uuid.UUID,
    data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ps = service.create(db, data, athlete_id, current_user.id)
    return _attach_video(db, ps)


@router.get("/athletes/{athlete_id}/sessions", response_model=list[SessionListItem])
def list_sessions(
    athlete_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = service.list_for_athlete(db, athlete_id, current_user.id)
    result = []
    for ps in sessions:
        item = SessionListItem.model_validate(ps)
        video = db.query(Video).filter(Video.session_id == ps.id).first()
        item.video_status = video.status if video else None
        result.append(item)
    return result


@router.get("/sessions/{session_id}", response_model=SessionResponse)
def get_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ps = service.get_owned(db, session_id, current_user.id)
    return _attach_video(db, ps)


@router.patch("/sessions/{session_id}", response_model=SessionResponse)
def update_session(
    session_id: uuid.UUID,
    data: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ps = service.get_owned(db, session_id, current_user.id)
    ps = service.update(db, ps, data)
    return _attach_video(db, ps)


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ps = service.get_owned(db, session_id, current_user.id)
    service.delete(db, ps)
