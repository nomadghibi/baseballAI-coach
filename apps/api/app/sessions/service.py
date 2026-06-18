import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.athletes.models import Athlete
from app.core import storage as store
from app.sessions.models import PitchingSession
from app.sessions.schemas import SessionCreate, SessionUpdate


def _verify_athlete(db: Session, athlete_id: uuid.UUID, owner_id: uuid.UUID) -> Athlete:
    athlete = (
        db.query(Athlete)
        .filter(Athlete.id == athlete_id, Athlete.owner_user_id == owner_id)
        .first()
    )
    if not athlete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athlete not found")
    return athlete


def create(
    db: Session, data: SessionCreate, athlete_id: uuid.UUID, owner_id: uuid.UUID
) -> PitchingSession:
    _verify_athlete(db, athlete_id, owner_id)
    session = PitchingSession(athlete_id=athlete_id, **data.model_dump())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def list_for_athlete(
    db: Session, athlete_id: uuid.UUID, owner_id: uuid.UUID
) -> list[PitchingSession]:
    _verify_athlete(db, athlete_id, owner_id)
    return (
        db.query(PitchingSession)
        .filter(PitchingSession.athlete_id == athlete_id)
        .order_by(PitchingSession.session_date.desc())
        .all()
    )


def get_owned(db: Session, session_id: uuid.UUID, owner_id: uuid.UUID) -> PitchingSession:
    pitching_session = (
        db.query(PitchingSession)
        .join(Athlete, Athlete.id == PitchingSession.athlete_id)
        .filter(PitchingSession.id == session_id, Athlete.owner_user_id == owner_id)
        .first()
    )
    if not pitching_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return pitching_session


def update(db: Session, pitching_session: PitchingSession, data: SessionUpdate) -> PitchingSession:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(pitching_session, field, value)
    db.commit()
    db.refresh(pitching_session)
    return pitching_session


def delete(db: Session, pitching_session: PitchingSession) -> None:
    from app.videos.models import Video

    videos = db.query(Video).filter(Video.session_id == pitching_session.id).all()
    for video in videos:
        store.delete_file(video.storage_key)

    db.delete(pitching_session)
    db.commit()
