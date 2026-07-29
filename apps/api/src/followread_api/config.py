from decimal import Decimal
from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FOLLOWREAD_",
        env_file=(".env", "apps/api/.env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,
    )

    app_name: str = Field(default="FollowRead API", min_length=1)
    environment: Literal["development", "test", "production"] = "development"
    api_prefix: str = Field(default="", pattern=r"^$|^/")
    database_url: Annotated[str, Field(pattern=r"^sqlite:///")] = "sqlite:///./var/followread.db"
    allowed_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://localhost:5174",
        "capacitor://localhost",
        "https://localhost",
    )
    polly_provider: Literal["fake", "aws", "openai"] = "fake"
    audio_output_dir: str = "./var/audio"
    illustration_output_dir: str = "./var/illustrations"
    maximum_processing_cost: Decimal = Field(default=Decimal("1.00"), ge=0)
    polly_chunk_characters: int = Field(default=1500, ge=100, le=3000)
    openai_api_key: SecretStr | None = Field(default=None, validation_alias="OPENAI_API_KEY")
    openai_tts_model: str = Field(
        default="gpt-4o-mini-tts-2025-12-15",
        min_length=1,
    )
    openai_alignment_model: str = Field(default="whisper-1", min_length=1)


@lru_cache
def get_settings() -> Settings:
    return Settings()
