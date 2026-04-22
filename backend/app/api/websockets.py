import json
import logging
from typing import Optional

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect
from jose import JWTError, jwt

from app.config import settings

logger = logging.getLogger("cozyjet.api.websockets")

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, ws: WebSocket):
        await ws.accept()
        self.active[user_id] = ws
        logger.info("WebSocket connected  user_id=%s  total_active=%d", user_id, len(self.active))

    def disconnect(self, user_id: str):
        self.active.pop(user_id, None)
        logger.info("WebSocket disconnected  user_id=%s  total_active=%d", user_id, len(self.active))

    async def send(self, user_id: str, data: dict):
        ws = self.active.get(user_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception as e:
                logger.warning("WebSocket send failed  user_id=%s  error=%s", user_id, e)
                self.disconnect(user_id)


manager = ConnectionManager()


def _get_token_from_headers(websocket: WebSocket) -> Optional[str]:
    """
    Prefer Authorization header:
      Authorization: Bearer <jwt>
    """
    auth = websocket.headers.get("authorization") or websocket.headers.get("Authorization")
    if not auth:
        return None
    if auth.lower().startswith("bearer "):
        return auth.split(" ", 1)[1].strip()
    return None


@router.websocket("/ws/main")
async def ws_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(default=None),
):
    try:
        token = token or _get_token_from_headers(websocket)
        if not token:
            logger.warning("WebSocket rejected — no token provided  client=%s", websocket.client)
            await websocket.close(code=4001)
            return

        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("sub")
        if not user_id:
            logger.warning("WebSocket rejected — token missing sub claim")
            await websocket.close(code=4001)
            return
    except JWTError as e:
        logger.warning("WebSocket rejected — invalid JWT: %s", e)
        await websocket.close(code=4001)
        return

    await manager.connect(str(user_id), websocket)
    try:
        await manager.send(str(user_id), {"type": "connected", "message": "CozyJet online"})
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
            except json.JSONDecodeError:
                logger.debug("WebSocket received non-JSON message  user_id=%s", user_id)
                continue
            if msg.get("type") == "ping":
                await manager.send(str(user_id), {"type": "pong"})
            else:
                logger.debug(
                    "WebSocket message  user_id=%s  type=%s",
                    user_id,
                    msg.get("type", "unknown"),
                )
    except WebSocketDisconnect:
        manager.disconnect(str(user_id))
    except Exception as e:
        logger.exception("WebSocket error  user_id=%s", user_id)
        manager.disconnect(str(user_id))
