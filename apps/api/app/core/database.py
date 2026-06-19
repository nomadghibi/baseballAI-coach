from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

_raw = settings.database_url
_url = make_url(_raw)  # parses URL, handles special chars in password correctly
_is_local = _url.host in (None, "localhost", "127.0.0.1")

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
