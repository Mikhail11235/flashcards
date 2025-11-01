from fastapi import FastAPI
from sqladmin import Admin
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from utils import APIException
from routes import auth, decks
from database import engine, Base
from admin import BasicAuthBackend, UserAdmin, DeckAdmin, CardAdmin, UserProgressAdmin
from config import settings


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Flashcard API",
    description="Flashcards for studying",
    version="1.0.0",
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.ADMIN_SECRET_KEY,
    session_cookie="sqladmin_session",
    max_age=1*24*60*60,
    same_site="lax",
    https_only=True,
)

@app.exception_handler(APIException)
async def api_exception_handler(request, exc: APIException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "localization_key": exc.localization_key,
            "details": exc.details
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://frontend:80"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

auth_backend = BasicAuthBackend(secret_key=settings.ADMIN_SECRET_KEY)
admin = Admin(app, engine, authentication_backend=auth_backend)
admin.add_view(UserAdmin)
admin.add_view(DeckAdmin)
admin.add_view(CardAdmin)
admin.add_view(UserProgressAdmin)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(decks.router, prefix="/api/decks", tags=["decks"])


@app.get("/")
def root():
    return {"message": "Flashcard API is running"}
