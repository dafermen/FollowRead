from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_prefix="FOLLOWREAD_",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(default="FollowRead API", min_length=1)
    environment: Literal["development", "test", "production"] = "development"
    api_prefix: str = Field(default="", pattern=r"^$|^/")
    database_url: Annotated[str, Field(pattern=r"^sqlite:///")] = "sqlite:///./var/followread.db"
    allowed_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://localhost:5174",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
