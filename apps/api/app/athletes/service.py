import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.athletes.models import Athlete
from app.athletes.schemas import AthleteCreate, AthleteUpdate


def create(db: Session, data: AthleteCreate, owner_id: uuid.UUID) -> Athlete:
    athlete = Athlete(**data.model_dump(), owner_user_id=owner_id)
    db.add(athlete)
    db.commit()
    db.refresh(athlete)
    return athlete


def list_for_user(db: Session, owner_id: uuid.UUID) -> list[Athlete]:
    return db.query(Athlete).filter(Athlete.owner_user_id == owner_id).order_by(Athlete.created_at).all()


def get_owned(db: Session, athlete_id: uuid.UUID, owner_id: uuid.UUID) -> Athlete:
    athlete = (
        db.query(Athlete)
        .filter(Athlete.id == athlete_id, Athlete.owner_user_id == owner_id)
        .first()
    )
    if not athlete:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Athlete not found")
    return athlete


def update(db: Session, athlete: Athlete, data: AthleteUpdate) -> Athlete:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(athlete, field, value)
    db.commit()
    db.refresh(athlete)
    return athlete


def delete(db: Session, athlete: Athlete) -> None:
    db.delete(athlete)
    db.commit()
