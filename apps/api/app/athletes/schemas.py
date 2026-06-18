from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AthleteCreate(BaseModel):
    first_name: str
    birth_year: int | None = None
    height_in: Decimal | None = None
    weight_lb: Decimal | None = None
    throwing_hand: str | None = None
    batting_side: str | None = None
    primary_position: str | None = None


class AthleteUpdate(BaseModel):
    first_name: str | None = None
    birth_year: int | None = None
    height_in: Decimal | None = None
    weight_lb: Decimal | None = None
    throwing_hand: str | None = None
    batting_side: str | None = None
    primary_position: str | None = None


class AthleteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    owner_user_id: UUID
    first_name: str
    birth_year: int | None
    height_in: Decimal | None
    weight_lb: Decimal | None
    throwing_hand: str | None
    batting_side: str | None
    primary_position: str | None
