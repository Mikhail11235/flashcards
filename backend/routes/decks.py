"""Deck routes"""
from fastapi import APIRouter, Depends, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Deck, User
from auth import get_optional_user, get_current_user
from services import DeckService
from schemas import deck as deck_schema
from utils import APIException


router = APIRouter()


@router.get("")
def get_user_decks(show_all: bool = Query(False), db: Session = Depends(get_db),
                   current_user: User = Depends(get_optional_user)):
    decks = DeckService.get_user_decks(db, user_id=current_user.id if current_user else None, show_all=show_all)
    return [{"id": deck.id, "name": deck.name} for deck in decks]


@router.post("")
def create_deck(deck_data: deck_schema.DeckCreate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if db.query(Deck).filter(Deck.name == deck_data.name, Deck.user_id == current_user.id).first():
        raise APIException(localization_key='error.deck_name_exist', status_code=409)
    deck = DeckService.create_deck(db, deck_data.name, current_user.id)
    return {"id": deck.id, "name": deck.name}


@router.put("/{deck_id}")
def update_deck(deck_id: int, deck_data: deck_schema.DeckUpdate, db: Session = Depends(get_db),
                current_user: User = Depends(get_current_user)):
    if db.query(Deck).filter(Deck.name == deck_data.name, Deck.id != deck_id, Deck.user_id == current_user.id).first():
        raise APIException(localization_key='error.deck_name_exist', status_code=409)
    deck = DeckService.get_user_deck(db, deck_id, current_user.id)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    deck = DeckService.update_deck(db, deck, deck_data.name)
    return {"id": deck.id, "name": deck.name}


@router.delete("/{deck_id}")
def delete_deck(deck_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = DeckService.get_user_deck(db, deck_id, current_user.id)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    DeckService.delete_deck(db, deck)
    return {"status": True}


@router.get("/{deck_id}/cards")
def get_deck_cards(deck_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    deck = DeckService.get_user_deck(db, deck_id, current_user.id)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    cards = DeckService.get_deck_cards(db, deck)
    return {"cards": [{"entry": card.entry, "value": card.value} for card in cards]}


@router.put("/{deck_id}/cards")
def update_deck_cards(deck_id: int, cards_data: deck_schema.Cards, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    deck = DeckService.get_user_deck(db, deck_id, current_user.id)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    cards = DeckService.update_deck_cards(db, deck, cards_data.cards)
    return {"cards": [{"entry": card.entry, "value": card.value} for card in cards]}


@router.get("/{deck_id}/export")
def export_deck_cards(deck_id: int, db: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    deck = DeckService.get_user_deck(db, deck_id, current_user.id)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    output, filename = DeckService.export_cards(db, deck)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/{deck_id}/import")
def import_excel(deck_id: int, file: UploadFile = File(..., max_size=500 * 1024),
                 db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deck = DeckService.get_user_deck(db, deck_id, current_user.id)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise APIException(status_code=400, localization_key="only_excel")
    try:
        cards_data = DeckService.read_excel_cards(file)
        if isinstance(cards_data, str):
            raise APIException(status_code=400, localization_key=cards_data)
        cards_data = [deck_schema.Card(**card) for card in cards_data]
        DeckService.update_deck_cards(db, deck, cards_data, replace=True)
    except APIException:
        raise
    except Exception:
        raise APIException(status_code=400, localization_key="error.excel_error")
    finally:
        file.file.close()
    return {"status": True}


@router.post("/{deck_id}/next-card")
def get_next_card(deck_id: int, data: deck_schema.NextCard, db: Session = Depends(get_db),
                  current_user: User = Depends(get_optional_user)):
    if current_user is not None:
        deck = DeckService.get_user_deck(db, deck_id, current_user.id, show_all=True)
        if not deck:
            raise APIException(localization_key='error.deck_not_found', status_code=404)
        progress_card, remain = DeckService.get_next_card(db, current_user.id, deck, data.mode, data.exclude)
    else:
        deck = DeckService.get_user_deck(db, deck_id, user_id=None, show_all=True)
        if not deck:
            raise APIException(localization_key='error.deck_not_found', status_code=404)
        progress_card, remain = DeckService.get_next_guest_card(db, deck, data.exclude)
    stats = DeckService.get_statistics(db, current_user.id if current_user else None, deck)
    stats["remain"] = remain
    if not progress_card:
        return {"card": None, "stats": stats}
    return {
        "card": progress_card,
        "stats": stats
    }


@router.patch("/{deck_id}/toggle_learned")
def toggle_learned(deck_id: int, data: deck_schema.ToggleLearned, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    deck = DeckService.get_user_deck(db, deck_id, current_user.id, show_all=True)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    card = DeckService.get_deck_card(db, deck, data.card_id)
    if not card:
        raise APIException(localization_key='error.card_not_found', status_code=404)
    progress = DeckService.toggle_learned(db, current_user.id, deck, card)
    if not progress:
        raise APIException(localization_key='error.progress_not_found', status_code=404)
    stats = DeckService.get_statistics(db, current_user.id, deck)
    return {"learned": progress.learned, "stats": stats}


@router.delete("/{deck_id}/reset")
def reset_progress(deck_id: int, db: Session = Depends(get_db),
                   current_user: User = Depends(get_current_user)):
    deck = DeckService.get_user_deck(db, deck_id, current_user.id)
    if not deck:
        raise APIException(localization_key='error.deck_not_found', status_code=404)
    DeckService.reset_progress(db, current_user.id, deck)
    return {"status": True}
