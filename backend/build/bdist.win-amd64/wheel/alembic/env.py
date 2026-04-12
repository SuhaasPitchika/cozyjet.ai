import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

from app.config import settings

# Prefer DATABASE_URL from Settings (.env); Alembic uses a synchronous engine, so strip +asyncpg.
_sync_url = (settings.DATABASE_URL or "").strip().replace("postgresql+asyncpg", "postgresql")
if _sync_url:
    config.set_main_option("sqlalchemy.url", _sync_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

from app.database import Base
from app.models import *

# Remaining ORM modules (not re-exported from app.models) — register tables on Base.metadata
import app.models.integration  # noqa: F401
import app.models.analytics  # noqa: F401
import app.models.trends  # noqa: F401
import app.models.calendar  # noqa: F401
import app.models.chat_sessions  # noqa: F401
import app.models.tune_samples  # noqa: F401
import app.models.relationship  # noqa: F401
import app.models.narrative_arc  # noqa: F401
import app.models.experiment  # noqa: F401
import app.models.templates  # noqa: F401

target_metadata = Base.metadata


def get_database_url() -> str:
    """Sync URL for Alembic (postgresql://…); never postgresql+asyncpg://."""
    url = (
        config.get_main_option("sqlalchemy.url")
        or os.getenv("DATABASE_URL", "")
        or ""
    ).strip()
    return url.replace("postgresql+asyncpg", "postgresql")


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_database_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section, {}) or {}
    configuration["sqlalchemy.url"] = get_database_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
