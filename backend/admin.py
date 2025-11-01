from sqladmin import ModelView
from models import User, Deck, Card, UserProgress, Language, Color
from sqladmin.authentication import AuthenticationBackend
from fastapi import Request
from config import settings


class BasicAuthBackend(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
        if username == settings.ADMIN_USERNAME and password == settings.ADMIN_PASSWORD:
            request.session.update({"token": "authenticated"})
            return True
        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        return token == "authenticated"


class UserAdmin(ModelView, model=User):
    column_list = [User.id, User.username, User.email, User.color, User.language]
    form_columns = [User.id, User.username, User.email, User.color, User.language]
    column_searchable_list = [User.username, User.email]


class DeckAdmin(ModelView, model=Deck):
    column_list = [Deck.id, Deck.name, Deck.user_id, Deck.owner]
    form_columns = [Deck.id, Deck.name, Deck.user_id, Deck.owner]
    column_searchable_list = [Deck.name, Deck.user_id]


class CardAdmin(ModelView, model=Card):
    column_list = [Card.id, Card.entry, Card.value, Card.deck_id, Card.deck]
    form_columns = [Card.id, Card.entry, Card.value, Card.deck_id, Card.deck]
    column_searchable_list = [Card.entry, Card.value, Card.deck_id]


class UserProgressAdmin(ModelView, model=UserProgress):
    column_list = "__all__"
    form_columns = "__all__"
