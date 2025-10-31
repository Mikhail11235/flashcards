from pydantic import BaseModel
from typing import List


class DeckCreate(BaseModel):
    name: str


class DeckUpdate(BaseModel):
    name: str


class Card(BaseModel):
    entry: str
    value: str


class Cards(BaseModel):
    cards: List[Card]


class NextCard(BaseModel):
    mode: str
    exclude: list[int]


class ToggleLearned(BaseModel):
    card_id: int
