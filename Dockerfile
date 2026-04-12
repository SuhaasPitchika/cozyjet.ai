# Backend API — install `app` as a package so `uvicorn app.main:app` works from any WORKDIR.
FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY asgi.py .
COPY backend ./backend

RUN pip install --no-cache-dir -r backend/requirements.txt \
    && pip install --no-cache-dir ./backend

# So `uvicorn app.main:app` still works if CMD is overridden without asgi.py
ENV PYTHONPATH=/app/backend

EXPOSE 8000
CMD ["sh", "-c", "exec python -m uvicorn asgi:app --host 0.0.0.0 --port ${PORT:-8000}"]
