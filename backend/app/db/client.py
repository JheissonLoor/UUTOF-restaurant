from collections.abc import AsyncGenerator

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine


class DatabaseSettings(BaseSettings):
    database_url: str = "mysql+asyncmy://uttof_user:uttof1234@127.0.0.1:3306/uttof_db"
    db_time_zone: str = Field(default="-05:00", pattern=r"^[+-](?:0\d|1[0-4]):[0-5]\d$")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = DatabaseSettings()
engine = create_async_engine(settings.database_url, pool_pre_ping=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        await session.execute(text("SET time_zone = :time_zone"), {"time_zone": settings.db_time_zone})
        yield session
