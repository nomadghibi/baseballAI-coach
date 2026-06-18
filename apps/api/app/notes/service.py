import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.athletes.models import Athlete
from app.notes.models import CoachNote
from app.notes.schemas import NoteCreate, NoteUpdate
from app.sessions.models import PitchingSession


def _verify_session_owned(
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


def create(
    db: Session, session_id: uuid.UUID, data: NoteCreate, author_id: uuid.UUID
) -> CoachNote:
    _verify_session_owned(db, session_id, author_id)
    note = CoachNote(session_id=session_id, author_user_id=author_id, note=data.note.strip())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def list_for_session(
    db: Session, session_id: uuid.UUID, owner_id: uuid.UUID
) -> list[CoachNote]:
    _verify_session_owned(db, session_id, owner_id)
    return (
        db.query(CoachNote)
        .filter(CoachNote.session_id == session_id)
        .order_by(CoachNote.created_at)
        .all()
    )


def get_owned_note(db: Session, note_id: uuid.UUID, author_id: uuid.UUID) -> CoachNote:
    note = (
        db.query(CoachNote)
        .filter(CoachNote.id == note_id, CoachNote.author_user_id == author_id)
        .first()
    )
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


def update(db: Session, note: CoachNote, data: NoteUpdate) -> CoachNote:
    note.note = data.note.strip()
    db.commit()
    db.refresh(note)
    return note


def delete(db: Session, note: CoachNote) -> None:
    db.delete(note)
    db.commit()
