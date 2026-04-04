"""
Async SQLAlchemy engine + session factory.

Handles the two most common DATABASE_URL formats from Railway / Render:
  postgres://user:pw@host:5432/db?sslmode=require
  postgresql://user:pw@host:5432/db

asyncpg does NOT accept `sslmode` as a query-string parameter — it uses the
`ssl` keyword argument on `create_async_engine`.  We strip the sslmode param
and pass ssl=True to the engine explicitly when the value is require/prefer.
"""
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from .config import settings


def _normalize_database_url(url: str) -> tuple[str, bool]:
    """
    Normalise *url* for asyncpg and return (cleaned_url, needs_ssl).

    - Converts postgres:// or postgresql:// → postgresql+asyncpg://
    - Strips ?sslmode query param (asyncpg rejects it)
    - Returns needs_ssl=True when sslmode was require or prefer
    """
    if not url:
        return url, False

    # Upgrade scheme to asyncpg driver
    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    # already has +asyncpg — leave as-is

    parsed = urlparse(url)
    query_params = parse_qs(parsed.query, keep_blank_values=True)

    sslmode = query_params.pop("sslmode", [""])[0].lower()
    needs_ssl = sslmode in ("require", "prefer", "verify-ca", "verify-full")

    new_query = urlencode(
        {k: v[0] for k, v in query_params.items()},
        doseq=False,
    )
    clean_url = urlunparse(parsed._replace(query=new_query))
    return clean_url, needs_ssl


_raw_url = settings.DATABASE_URL
DATABASE_URL, _use_ssl = _normalize_database_url(_raw_url)

_engine_kwargs: dict = {"echo": False}
if _use_ssl:
    import ssl as _ssl
    _ssl_ctx = _ssl.create_default_context()
    _engine_kwargs["connect_args"] = {"ssl": _ssl_ctx}

async_engine = create_async_engine(DATABASE_URL, **_engine_kwargs)

AsyncSessionLocal = sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
        await session.commit()
