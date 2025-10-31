from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from utils import APIException
from routes import auth, decks
from database import engine, Base


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Flashcard API",
    description="Flashcards for studying",
    version="1.0.0",
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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(decks.router, prefix="/api", tags=["decks"])


@app.get("/")
def root():
    return {"message": "Flashcard API is running"}
