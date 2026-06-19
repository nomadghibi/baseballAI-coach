from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Import models so Alembic detects them
from app.core.database import Base
from app.auth.models import User  # noqa: F401
from app.athletes.models import Athlete  # noqa: F401
from app.sessions.models import PitchingSession  # noqa: F401
from app.videos.models import Video  # noqa: F401
from app.analysis.models import AnalysisJob, AnalysisResult, KeypointData  # noqa: F401
from app.notes.models import CoachNote  # noqa: F401

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    from app.core.config import settings

    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    from app.core.config import settings
    from sqlalchemy import create_engine
    from sqlalchemy.engine import make_url

    parsed = make_url(settings.database_url)
    is_local = parsed.host in (None, "localhost", "127.0.0.1")
    connect_args: dict = {"connect_timeout": 10}
    if not is_local:
        connect_args["sslmode"] = "require"

    connectable = create_engine(parsed, poolclass=pool.NullPool, connect_args=connect_args)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
