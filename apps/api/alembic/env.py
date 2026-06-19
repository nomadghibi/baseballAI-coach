from logging.config import fileConfig

from alembic import context
from sqlalchemy import pool

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.core.database import Base
from app.auth.models import User  # noqa: F401
from app.athletes.models import Athlete  # noqa: F401
from app.sessions.models import PitchingSession  # noqa: F401
from app.videos.models import Video  # noqa: F401
from app.analysis.models import AnalysisJob, AnalysisResult, KeypointData  # noqa: F401
from app.notes.models import CoachNote  # noqa: F401

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    from app.core.config import build_db_url
    context.configure(
        url=build_db_url().render_as_string(hide_password=False),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    from sqlalchemy import create_engine
    from app.core.config import build_db_url

    url = build_db_url()
    connectable = create_engine(url, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
