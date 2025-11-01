from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    REFRESH_SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ADMIN_SECRET_KEY: str
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str

    class Config:
        env_file = "../.env"
        extra = "ignore"


settings = Settings()
