import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.athletes import service
from app.athletes.schemas import AthleteCreate, AthleteResponse, AthleteUpdate
from app.auth.models import User
from app.core.deps import get_current_user, get_db

router = APIRouter(prefix="/athletes", tags=["athletes"])


@router.post("", response_model=AthleteResponse, status_code=201)
def create_athlete(
    data: AthleteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.create(db, data, current_user.id)


@router.get("", response_model=list[AthleteResponse])
def list_athletes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.list_for_user(db, current_user.id)


@router.get("/{athlete_id}", response_model=AthleteResponse)
def get_athlete(
    athlete_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return service.get_owned(db, athlete_id, current_user.id)


@router.patch("/{athlete_id}", response_model=AthleteResponse)
def update_athlete(
    athlete_id: uuid.UUID,
    data: AthleteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = service.get_owned(db, athlete_id, current_user.id)
    return service.update(db, athlete, data)


@router.delete("/{athlete_id}", status_code=204)
def delete_athlete(
    athlete_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    athlete = service.get_owned(db, athlete_id, current_user.id)
    service.delete(db, athlete)
