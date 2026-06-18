import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.models import User
from app.core.deps import get_current_user, get_db
from app.notes import service
from app.notes.schemas import NoteCreate, NoteResponse, NoteUpdate

router = APIRouter(tags=["notes"])


@router.post("/sessions/{session_id}/notes", response_model=NoteResponse, status_code=201)
def create_note(
    session_id: uuid.UUID,
    data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.create(db, session_id, data, current_user.id)


@router.get("/sessions/{session_id}/notes", response_model=list[NoteResponse])
def list_notes(
    session_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_for_session(db, session_id, current_user.id)


@router.patch("/notes/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: uuid.UUID,
    data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = service.get_owned_note(db, note_id, current_user.id)
    return service.update(db, note, data)


@router.delete("/notes/{note_id}", status_code=204)
def delete_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    note = service.get_owned_note(db, note_id, current_user.id)
    service.delete(db, note)
