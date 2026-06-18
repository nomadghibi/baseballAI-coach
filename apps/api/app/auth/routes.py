from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.auth import service
from app.auth.models import User
from app.auth.schemas import AuthResponse, LoginRequest, RegisterRequest, UserResponse
from app.core.deps import get_current_user, get_db
from app.core.ratelimit import check_rate_limit

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    check_rate_limit(request, "register", max_calls=5, window_secs=300)
    user, token = service.register(db, data)
    return AuthResponse(user=user, access_token=token)


@router.post("/login", response_model=AuthResponse)
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    check_rate_limit(request, "login", max_calls=10, window_secs=300)
    user, token = service.login(db, data)
    return AuthResponse(user=user, access_token=token)


@router.post("/logout", status_code=204)
def logout():
    return None


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user
