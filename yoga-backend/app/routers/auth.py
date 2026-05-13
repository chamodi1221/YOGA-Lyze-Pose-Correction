from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    PASSWORD_HASH,
    create_access_token,
    get_current_user_dep,
    get_password_hash,
    verify_password,
)
from app.database import get_db
from app.models.user import User
from app.schemas.token import Token, TokenData
from app.schemas.user import UserResponse, UserCreate

router = APIRouter()

DBSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[TokenData, Depends(get_current_user_dep)]

GOOGLE_CLIENT_ID = "772324401472-cnr4m1e3lgmj902g7cdumpt4acf1a76p.apps.googleusercontent.com"


def _get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def _get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def _authenticate_user(db: Session, username: str, password: str) -> User | bool:
    user = _get_user_by_username(db, username)

    if not user:
        verify_password(password, PASSWORD_HASH)
        return False

    if not user.is_active:
        return False

    if not verify_password(password, user.hashed_password):
        return False

    return user


def _create_unique_username(db: Session, base_username: str) -> str:
    username = base_username.replace(" ", "").lower()

    if not _get_user_by_username(db, username):
        return username

    count = 1
    while _get_user_by_username(db, f"{username}{count}"):
        count += 1

    return f"{username}{count}"


def _require_admin(current_user: User):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserCreate, db: Session = Depends(get_db)):
    if _get_user_by_username(db, body.username):
        raise HTTPException(status_code=400, detail="Username already registered")

    if _get_user_by_email(db, body.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        username=body.username,
        email=body.email,
        hashed_password=get_password_hash(body.password),
        role="user",
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: DBSession,
) -> Token:
    user = _authenticate_user(db, form_data.username, form_data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        role=user.role,
    )


@router.post("/auth/google", response_model=Token)
async def google_login(payload: dict, db: Session = Depends(get_db)):
    google_token = payload.get("token")

    if not google_token:
        raise HTTPException(status_code=400, detail="Google token is required.")

    try:
        google_user = id_token.verify_oauth2_token(
            google_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )

        email = google_user.get("email")
        name = google_user.get("name") or email.split("@")[0]

        if not email:
            raise HTTPException(status_code=400, detail="Google email not found.")

        user = _get_user_by_email(db, email)

        if not user:
            username = _create_unique_username(db, name)

            user = User(
                username=username,
                email=email,
                hashed_password=get_password_hash("google_auth_user"),
                role="user",
                is_active=True,
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        if not user.is_active:
            raise HTTPException(status_code=403, detail="Inactive user account.")

        access_token = create_access_token(
            data={"sub": user.username, "role": user.role},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return Token(
            access_token=access_token,
            token_type="bearer",
            role=user.role,
        )

    except Exception:
        raise HTTPException(status_code=400, detail="Google login failed.")


@router.get("/users/me", response_model=UserResponse)
async def read_users_me(
    token_data: CurrentUser,
    db: Session = Depends(get_db),
) -> User:
    user = _get_user_by_username(db, token_data.username)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    return user


@router.get("/admin/users", response_model=list[UserResponse])
async def get_all_users_for_admin(
    token_data: CurrentUser,
    db: Session = Depends(get_db),
):
    current_user = _get_user_by_username(db, token_data.username)

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    _require_admin(current_user)

    return db.query(User).order_by(User.id.asc()).all()


@router.delete("/admin/users/{user_id}")
async def delete_user_for_admin(
    user_id: int,
    token_data: CurrentUser,
    db: Session = Depends(get_db),
):
    current_user = _get_user_by_username(db, token_data.username)

    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    _require_admin(current_user)

    user_to_delete = db.query(User).filter(User.id == user_id).first()

    if user_to_delete is None:
        raise HTTPException(status_code=404, detail="User not found")

    if user_to_delete.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete your own admin account",
        )

    if user_to_delete.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin user cannot be deleted",
        )

    db.delete(user_to_delete)
    db.commit()

    return {"message": "User deleted successfully"}