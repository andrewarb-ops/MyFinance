from __future__ import annotations

from dataclasses import dataclass
import hashlib
import hmac
import os
import secrets
from typing import Optional

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

from db import session_scope
from models.user import User


AUTH_SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "change-me")
AUTH_TOKEN_TTL_SECONDS = int(os.getenv("AUTH_TOKEN_TTL_SECONDS", "86400"))
AUTH_TOKEN_SALT = os.getenv("AUTH_TOKEN_SALT", "auth-token")


@dataclass
class UserDTO:
    id: int
    username: str
    is_active: bool


def _serializer() -> URLSafeTimedSerializer:
    return URLSafeTimedSerializer(AUTH_SECRET_KEY, salt=AUTH_TOKEN_SALT)


def _hash_password(password: str, salt: str) -> str:
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100_000,
    )
    return dk.hex()


def _verify_password(password: str, salt: str, expected_hash: str) -> bool:
    calculated = _hash_password(password, salt)
    return hmac.compare_digest(calculated, expected_hash)


def _to_dto(user: User) -> UserDTO:
    return UserDTO(
        id=user.id,
        username=user.username,
        is_active=user.is_active,
    )


def create_user(username: str, password: str) -> UserDTO:
    if not username or not password:
        raise ValueError("username and password are required")

    with session_scope() as session:
        existing = session.query(User).filter(User.username == username).first()
        if existing is not None:
            raise ValueError("username already exists")

        salt = secrets.token_hex(16)
        password_hash = _hash_password(password, salt)
        user = User(
            username=username,
            password_hash=password_hash,
            password_salt=salt,
            is_active=True,
        )
        session.add(user)
        session.flush()
        session.refresh(user)
        return _to_dto(user)


def authenticate_user(username: str, password: str) -> Optional[UserDTO]:
    with session_scope() as session:
        user = session.query(User).filter(User.username == username).first()
        if user is None or not user.is_active:
            return None
        if not _verify_password(password, user.password_salt, user.password_hash):
            return None
        return _to_dto(user)


def create_access_token(user_id: int) -> str:
    serializer = _serializer()
    return serializer.dumps({"user_id": user_id})


def get_user_from_token(token: str) -> Optional[UserDTO]:
    serializer = _serializer()
    try:
        data = serializer.loads(token, max_age=AUTH_TOKEN_TTL_SECONDS)
    except (BadSignature, SignatureExpired):
        return None

    user_id = data.get("user_id")
    if not isinstance(user_id, int):
        return None

    with session_scope() as session:
        user = session.query(User).filter(User.id == user_id).first()
        if user is None or not user.is_active:
            return None
        return _to_dto(user)
