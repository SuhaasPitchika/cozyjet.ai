import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal


async def check():
    async with AsyncSessionLocal() as s:
        r = await s.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname='public'")
        )
        tables = [row[0] for row in r.fetchall()]
        print("Tables found:", tables)


asyncio.run(check())
