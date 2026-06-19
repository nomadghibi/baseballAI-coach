from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

_url = settings.database_url
_is_local = "localhost" in _url or "127.0.0.1" in _url

_connect_args: dict = {"connect_timeout": 10}
if not _is_local:
    _connect_args["sslmode"] = "require"

engine = create_engine(
    _url,
    pool_pre_ping=True,
    connect_args=_connect_args,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
