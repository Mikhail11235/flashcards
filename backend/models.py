from enum import IntEnum, Enum
from sqlalchemy import Column, Integer, String, ForeignKey, Text, SmallInteger, Boolean, DateTime
from sqlalchemy.orm import relationship
from database import Base


LANGUAGE_MAP = {"en": 1, "ru": 2, "de": 3, "zh": 4, "es": 5, "fr": 6, "ko": 7, "ja": 8}
LANGUAGE_REVERSE_MAP = {1: "en", 2: "ru", 3: "de", 4: "zh", 5: "es", 6: "fr", 7: "ko", 8: "ja"}
COLOR_MAP = {"yellow": 1, "green": 2, "pink": 3}
COLOR_REVERSE_MAP = {1: "yellow", 2: "green", 3: "pink"}


class Color(IntEnum):
    YELLOW = 1
    GREEN = 2
    PINK = 3


class Language(IntEnum):
    EN = 1
    RU = 2
    DE = 3
    ZH = 4
    ES = 5
    FR = 6
    KO = 7
    JA = 8


class StudyMode(Enum):
    UNLEARNED = "unlearned"
    LEARNED = "learned"
    ALL = "all"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    color = Column(SmallInteger, default=Color.YELLOW)
    language = Column(SmallInteger, default=Language.EN)
    hashed_password = Column(String)
    decks = relationship("Deck", back_populates="owner", cascade="all, delete-orphan")
    user_progress = relationship("UserProgress", back_populates="user", cascade="all, delete-orphan")


class Deck(Base):
    __tablename__ = "decks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    owner = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")
    user_progress = relationship("UserProgress", back_populates="deck", cascade="all, delete-orphan")


class Card(Base):
    __tablename__ = "cards"
    id = Column(Integer, primary_key=True, index=True)
    entry = Column(Text)
    value = Column(Text)
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"))
    user_progress = relationship("UserProgress", back_populates="card", cascade="all, delete-orphan")
    deck = relationship("Deck", back_populates="cards")


class UserProgress(Base):
    __tablename__ = "user_progress"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    card_id = Column(Integer, ForeignKey("cards.id", ondelete="CASCADE"))
    deck_id = Column(Integer, ForeignKey("decks.id", ondelete="CASCADE"))
    learned = Column(Boolean, default=False)
    user = relationship("User", back_populates="user_progress")
    card = relationship("Card", back_populates="user_progress")
    deck = relationship("Deck", back_populates="user_progress")
