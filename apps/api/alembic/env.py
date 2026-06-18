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

    cfg = config.get_section(config.config_ini_section, {})
    cfg["sqlalchemy.url"] = settings.database_url
    connectable = engine_from_config(cfg, prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
