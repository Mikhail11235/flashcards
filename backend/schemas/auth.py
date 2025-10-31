from pydantic import BaseModel, Field, validator
from models import COLOR_MAP, LANGUAGE_MAP
from typing import Optional


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=6, max_length=72)
    password: str = Field(..., min_length=6, max_length=72)
    color: Optional[str] = None
    language: Optional[str] = None

    @validator('color')
    def validate_color(cls, v):
        if v is not None:
            if v not in COLOR_MAP:
                raise ValueError('Color must be one of: yellow, green, pink')
        return v

    @validator('language')
    def validate_language(cls, v):
        if v is not None:
            if v not in LANGUAGE_MAP:
                raise ValueError('Language must be one of: en, ru, de, zh, es, fr, ja, ko')
        return v

class UserLogin(BaseModel):
    username: str
    password: str = Field(..., max_length=72)


class RefreshRequest(BaseModel):
    refresh: str


class UserUpdate(BaseModel):
    color: str
    language: str

    @validator('color')
    def validate_color(cls, v):
        if v is not None:
            if v not in COLOR_MAP:
                raise ValueError('Color must be one of: yellow, green, pink')
        return v

    @validator('language')
    def validate_language(cls, v):
        if v is not None:
            if v not in LANGUAGE_MAP:
                raise ValueError('Language must be one of: en, ru, de, zh, es, fr, ja, ko')
        return v
