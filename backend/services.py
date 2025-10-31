from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
import io
from fastapi import File
from models import User, Deck, Card, UserProgress, StudyMode, COLOR_MAP, LANGUAGE_MAP
from auth import get_password_hash
from schemas import auth as auth_schema

class UserService:
    @classmethod
    def create_user(cls, db: Session, user_data: auth_schema.UserCreate):
        user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            color=COLOR_MAP.get(user_data.color),
            language=LANGUAGE_MAP.get(user_data.language)
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @classmethod
    def update_user(cls, db: Session, user_id: int, user_data: auth_schema.UserUpdate):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        if user_data.color is not None:
            user.color = COLOR_MAP[user_data.color]
        if user_data.language is not None:
            user.language = LANGUAGE_MAP[user_data.language]
        db.commit()
        db.refresh(user)
        return user


class DeckService:
    @staticmethod
    def get_user_deck(db: Session, deck_id: int, user_id: int):
        deck = db.query(Deck).filter(Deck.id == deck_id, Deck.user_id == user_id).first()
        if not deck:
            return None
        return deck

    @staticmethod
    def get_user_decks(db: Session, user_id: int):
        decks = db.query(Deck).filter(Deck.user_id == user_id).all()
        return decks

    @staticmethod
    def get_guest_deck(db: Session, deck_id: int):
        deck = db.query(Deck).filter(Deck.id == deck_id,
                                     Deck.user_id.is_(None)).first()
        if not deck:
            return None
        return deck

    @staticmethod
    def get_guest_decks(db: Session):
        decks = db.query(Deck).filter(Deck.user_id.is_(None)).all()
        return decks

    @staticmethod
    def create_deck(db: Session, name: str, user_id: int):
        deck = Deck(name=name, user_id=user_id)
        db.add(deck)
        db.commit()
        db.refresh(deck)
        return deck

    @staticmethod
    def update_deck(db: Session, deck: Deck, name: str):
        deck.name = name
        db.commit()
        db.refresh(deck)
        return deck

    @staticmethod
    def delete_deck(db: Session, deck: Deck):
        db.delete(deck)
        db.commit()
        return True

    @staticmethod
    def get_deck_cards(db: Session, deck: Deck):
        cards = db.query(Card).filter(Card.deck_id == deck.id).all()
        return cards

    @staticmethod
    def get_deck_card(db: Session, deck: Deck, card_id: int):
        card = db.query(Card).filter(Card.deck_id == deck.id, Card.id == card_id).first()
        return card

    @staticmethod
    def update_deck_cards(db: Session, deck: Deck, cards_data: list, replace: bool = False):
        if replace:
            cards_to_delete = db.query(Card).filter(Card.deck_id == deck.id).all()
            for card in cards_to_delete:
                db.delete(card)
            for card_data in cards_data:
                card = Card(entry=card_data.entry, value=card_data.value, deck_id=deck.id)
                db.add(card)
        else:
            existing_cards = db.query(Card).filter(Card.deck_id == deck.id).all()
            existing_dict = {card.entry: card for card in existing_cards}
            new_entries = {card_data.entry for card_data in cards_data}
            for card in existing_cards:
                if card.entry not in new_entries:
                    db.delete(card)
            for card_data in cards_data:
                entry = card_data.entry
                if entry in existing_dict:
                    existing_dict[entry].value = card_data.value
                else:
                    card = Card(entry=entry, value=card_data.value, deck_id=deck.id)
                    db.add(card)
        db.commit()
        cards = db.query(Card).filter(Card.deck_id == deck.id).all()
        return cards

    @staticmethod
    def export_cards(db: Session, deck: Deck):
        cards = DeckService.get_deck_cards(db, deck)
        df = pd.DataFrame([
            {"entry": card.entry, "value": card.value} for card in cards
        ])
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name=deck.name, index=False)
        output.seek(0)
        filename = f"{deck.name}_cards.xlsx"
        return output, filename

    @staticmethod
    def read_excel_cards(file: File):
        contents = file.file.read()
        df = pd.read_excel(io.BytesIO(contents))
        required_columns = ['entry', 'value']
        if not all(col in df.columns for col in required_columns):
            return "error.excel_columns"
        cards_data = []
        for _, row in df.iterrows():
            if pd.notna(row['entry']) and pd.notna(row['value']):
                cards_data.append({
                    "entry": str(row['entry']).strip(),
                    "value": str(row['value']).strip()
                })
        return cards_data

    @staticmethod
    def get_next_card(db: Session, user_id: int, deck: Deck, mode: str, exclude: list):
        base_query = db.query(Card).filter(
            Card.deck_id == deck.id,
        )
        if exclude:
            base_query = base_query.filter(Card.id.notin_(exclude))
        if mode == StudyMode.LEARNED.value:
            cards = base_query.join(UserProgress).filter(
                UserProgress.user_id == user_id,
                UserProgress.learned.is_(True)
            )
            remain = cards.count()
            card = cards.order_by(func.random()).first()
        elif mode == StudyMode.UNLEARNED.value:
            subquery = db.query(UserProgress.card_id).filter(
                UserProgress.user_id == user_id,
                UserProgress.deck_id == deck.id,
                UserProgress.learned.is_(True)
            )
            cards = base_query.filter(
                ~Card.id.in_(subquery)
            )
            remain = cards.count()
            card = cards.order_by(func.random()).first()
        else:
            cards = base_query
            remain = cards.count()
            card = cards.order_by(func.random()).first()
        if not card:
            return None, None
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.card_id == card.id
        ).first()
        if not progress:
            progress = UserProgress(user_id=user_id, deck_id=deck.id, card_id=card.id, learned=False)
            db.add(progress)
            db.commit()
            db.refresh(progress)
        progress_card = {
            "id": progress.card_id,
            "entry": progress.card.entry,
            "value": progress.card.value,
            "learned": progress.learned
        }
        return progress_card, remain - 1

    @staticmethod
    def get_next_guest_card(db: Session, deck: Deck, exclude: list):
        base_query = db.query(Card).filter(
            Card.deck_id == deck.id,
        )
        if exclude:
            base_query = base_query.filter(Card.id.notin_(exclude))
        cards = base_query
        remain = cards.count()
        card = cards.order_by(Card.id).first()
        if not card:
            return None, None
        progress_card = {
            "id": card.id,
            "entry": card.entry,
            "value": card.value,
            "learned": False
        }
        return progress_card, remain - 1


    @staticmethod
    def toggle_learned(db: Session, user_id: int, deck: Deck, card: Card):
        progress = db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.deck_id == deck.id,
            UserProgress.card_id == card.id
        ).first()
        if not progress:
            return None
        progress.learned = not progress.learned
        db.commit()
        db.refresh(progress)
        return progress

    @staticmethod
    def get_statistics(db: Session, user_id: int, deck: Deck):
        total = db.query(Card).filter(Card.deck_id == deck.id).count()
        if user_id is not None:
            learned = db.query(UserProgress).filter(
                UserProgress.user_id == user_id,
                UserProgress.deck_id == deck.id,
                UserProgress.learned
            ).count()
        else:
            learned = 0
        return {
            "total": total,
            "learned": learned
        }

    @staticmethod
    def reset_progress(db: Session, user_id: int, deck: Deck):
        db.query(UserProgress).filter(
            UserProgress.user_id == user_id,
            UserProgress.deck_id == deck.id
        ).delete()
        db.commit()
        return True
