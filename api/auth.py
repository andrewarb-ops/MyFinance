from fastapi import APIRouter, Depends, Header, HTTPException, status

from api.schemas import TokenOut, UserCreate, UserLogin, UserOut
from services.auth import (
    authenticate_user,
    create_access_token,
    create_user,
    get_user_from_token,
)


router = APIRouter(prefix="/auth", tags=["auth"])


def get_current_user(authorization: str | None = Header(None)) -> UserOut:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.removeprefix("Bearer ").strip()
    user = get_user_from_token(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return UserOut(id=user.id, username=user.username, is_active=user.is_active)


@router.post("/register", response_model=UserOut, status_code=201)
def register_user(data: UserCreate):
    try:
        user = create_user(username=data.username, password=data.password)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return UserOut(id=user.id, username=user.username, is_active=user.is_active)


@router.post("/login", response_model=TokenOut)
def login_user(data: UserLogin):
    user = authenticate_user(username=data.username, password=data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user.id)
    return TokenOut(access_token=token, token_type="bearer")


@router.get("/me", response_model=UserOut)
def read_me(current_user: UserOut = Depends(get_current_user)):
    return current_user
