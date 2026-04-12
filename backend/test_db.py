import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def check():
    try:
        async with AsyncSessionLocal() as s:
            r = await s.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
            tables = [row[0] for row in r.fetchall()]
            print("\n--- Tables Found in Database ---")
            for table in tables:
                print(f"? {table}")
            print("-------------------------------\n")
    except Exception as e:
        print(f"? Error connecting: {e}")

if __name__ == '__main__':
    asyncio.run(check())
