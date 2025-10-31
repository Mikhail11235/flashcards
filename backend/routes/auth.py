"""Auth routes"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, Color, Language, LANGUAGE_REVERSE_MAP, COLOR_REVERSE_MAP
from services import UserService
from auth import (
    verify_password, create_access_token, create_refresh_token, decode_refresh_token,
    get_current_user
)
from schemas import auth as auth_schema
from utils import APIException


router = APIRouter()


@router.post("/register")
def register(user_data: auth_schema.UserCreate, db: Session = Depends(get_db)):
    """Register"""
    if db.query(User).filter(User.username == user_data.username).first():
        raise APIException(localization_key='error.user_username_exist', status_code=409)
    if db.query(User).filter(User.email == user_data.email).first():
        raise APIException(localization_key='error.user_email_exist', status_code=409)
    user = UserService.create_user(db, user_data)
    return {"user_id": user.id}


@router.post("/login")
def login(login_data: auth_schema.UserLogin, db: Session = Depends(get_db)):
    """Login"""
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise APIException(localization_key='error.incorrect_username_or_password', status_code=400)
    return {"access": create_access_token({"sub": user.username}),
            "refresh": create_refresh_token({"sub": user.username})}


@router.post("/refresh")
def refresh_token(token_data: auth_schema.RefreshRequest, db: Session = Depends(get_db)):
    """Refresh token"""
    token = token_data.refresh
    if not token:
        raise APIException(localization_key='error.refresh_required', status_code=400)
    try:
        data = decode_refresh_token(token)
        username = data.get("sub")
        if not username:
            raise APIException(localization_key='error.invalid_token', status_code=401)
    except Exception:
        raise APIException(localization_key='error.invalid_refresh_token', status_code=401)
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise APIException(localization_key='error.user_not_found', status_code=401)
    new_access = create_access_token({"sub": username})
    return {"access": new_access}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "username": current_user.username,
        "color": COLOR_REVERSE_MAP[current_user.color or Color.YELLOW],
        "language": LANGUAGE_REVERSE_MAP[current_user.language]
    }


@router.patch("/me")
def me(user_data: auth_schema.UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = UserService.update_user(db, current_user.id, user_data)
    if not user:
        raise APIException(localization_key='error.user_not_found', status_code=404)
    return {
        "username": user.username,
        "color": COLOR_REVERSE_MAP[user.color or Language.EN],
        "language": LANGUAGE_REVERSE_MAP[user.language]
    }
